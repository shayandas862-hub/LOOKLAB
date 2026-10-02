// Measures a P2 import on this machine: node --experimental-strip-types scripts/measure-import.ts [clip]
// Without a clip it records a synthetic 60 s 1080p H.264 clip in Chrome first (canvas + MediaRecorder, real time).
// Starts the engine exactly as `npm start` does, imports the clip through the Breakdown screen, and reports:
// wall time per stage, engine RSS (sampled every 250 ms during; idle = median over 4 s after 8 s settling), the tab's JS heap, frame disk use,
// and the palette / tone time on one analysis frame. Needs a built UI (npm run build) and Google Chrome.
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { decodePng } from '../src/engine/png.ts';
import { measurePalette } from '../src/core/palette.ts';
import { measureContrast, measureSaturation, measureTints } from '../src/core/stats.ts';
import { frameSignature } from '../src/core/cuts.ts';
import NODE_FLAGS from '../src/engine/node-flags.json' with { type: 'json' };

const ROOT = join(import.meta.dirname, '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const work = mkdtempSync(join(tmpdir(), 'looklab-measure-'));
const home = join(work, 'home');
const port = 40000 + Math.floor(Math.random() * 20000);
const rssMb = (pid: number) => Number(execFileSync('ps', ['-o', 'rss=', '-p', String(pid)]).toString().trim()) / 1024;
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/** Idle RSS: settle 8 s, then the median of 16 samples over 4 s (RSS on macOS moves with GC and compression). */
async function idleRss(pid: number): Promise<number> {
  await sleep(8000);
  const xs: number[] = [];
  for (let i = 0; i < 16; i++) {
    xs.push(rssMb(pid));
    await sleep(250);
  }
  return median(xs);
}

async function recordClip(): Promise<string> {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ acceptDownloads: true });
  await page.goto('about:blank');
  const download = page.waitForEvent('download', { timeout: 180_000 });
  const mime = await page.evaluate(async () => {
    const W = 1920;
    const H = 1080;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d')!;
    // A noise tile, so the encoder has real texture to code (a flat canvas compresses to nothing).
    const tile = document.createElement('canvas');
    tile.width = tile.height = 256;
    const tg = tile.getContext('2d')!;
    const id = tg.createImageData(256, 256);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = Math.random() * 60;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
      id.data[i + 3] = 40;
    }
    tg.putImageData(id, 0, 0);
    const SCENES = [['#B0502A', '#F2C57C'], ['#1E3A6E', '#6FA3D8'], ['#2F6B3A', '#C9E07A'], ['#5A1E5A', '#E07AB8'], ['#101820', '#C0A080'], ['#603010', '#E0E0D0'], ['#203040', '#80C0E0'], ['#402020', '#F0A060']];
    const draw = (t: number) => {
      const s = SCENES[Math.floor(t / 7.5) % SCENES.length];
      const grad = g.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, s[0]);
      grad.addColorStop(1, s[1]);
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      const ox = (t * 40) % 256;
      for (let x = -256; x < W; x += 256) for (let y = 0; y < H; y += 256) g.drawImage(tile, x + ox, y);
      g.fillStyle = '#F5F5F0';
      g.fillRect(200 + ((t * 220) % 1400), 400, 300, 300);
    };
    const types = ['video/mp4;codecs=avc1.640028', 'video/mp4;codecs=avc1.4d0028', 'video/mp4', 'video/webm;codecs=vp9'];
    const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t))!;
    let start = 0;
    const now = () => (start ? (performance.now() - start) / 1000 : 0);
    const painter = setInterval(() => draw(now()), 1000 / 30);
    draw(0);
    const rec = new MediaRecorder(c.captureStream(30), { mimeType, videoBitsPerSecond: 16_000_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    const done = new Promise((r) => (rec.onstop = r));
    const started = new Promise((r) => (rec.onstart = r));
    rec.start(1000);
    await started;
    start = performance.now();
    await new Promise<void>((r) => {
      const check = () => (now() >= 60 ? r() : setTimeout(check, 200));
      check();
    });
    rec.stop();
    await done;
    clearInterval(painter);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(chunks, { type: mimeType.split(';')[0] }));
    a.download = mimeType.startsWith('video/mp4') ? 'synthetic-60s-1080p.mp4' : 'synthetic-60s-1080p.webm';
    document.body.appendChild(a);
    a.click();
    return mimeType;
  });
  const d = await download;
  const path = join(work, d.suggestedFilename());
  await d.saveAs(path);
  await browser.close();
  console.log(`recorded ${path} (${mime}, ${(statSync(path).size / 1e6).toFixed(1)} MB)`);
  return path;
}

const clip = process.argv[2] ?? (await recordClip());

const engine = spawn(process.execPath, [...NODE_FLAGS, 'src/engine/main.ts'], {
  cwd: ROOT,
  env: { ...process.env, LOOKLAB_HOME: home, LOOKLAB_PORT: String(port) },
});
await new Promise<void>((resolve, reject) => {
  engine.stdout!.on('data', (d) => String(d).includes('running at') && resolve());
  engine.on('exit', () => reject(new Error('engine exited')));
});
const idleBefore = await idleRss(engine.pid!);

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`http://127.0.0.1:${port}`);
await page.waitForSelector('[data-screen-label="Breakdown"]');
await page.getByRole('button', { name: 'Replace reference' }).click();
const chooser = page.waitForEvent('filechooser');
await page.getByRole('button', { name: 'Browse files' }).click();

const rss: number[] = [];
const sampler = setInterval(() => rss.push(rssMb(engine.pid!)), 250);
const marks: Record<string, number> = {};
const t0 = performance.now();
(await chooser).setFiles(clip);
const text = () => page.evaluate(() => document.querySelector('main')?.textContent ?? '');
for (;;) {
  const t = await text();
  const at = (performance.now() - t0) / 1000;
  if (!marks.frames && /Frame \d+ of/.test(t)) marks.frames = at;
  if (!marks.analysing && t.includes('Analysing reference')) marks.analysing = at;
  if (marks.analysing && !t.includes('Analysing reference') && /MEASURED/.test(t)) {
    marks.ready = at;
    break;
  }
  if (t.includes('Import stopped')) throw new Error('import failed: ' + t.slice(0, 400));
  if (at > 600) throw new Error('import took over 10 minutes');
  await new Promise((r) => setTimeout(r, 100));
}
clearInterval(sampler);
const heap = await page.evaluate(() => (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0);
const idleAfter = await idleRss(engine.pid!);

const refDir = join(home, 'projects', 'neel', 'references');
const ref = JSON.parse(readFileSync(join(refDir, readdirSync(refDir).find((f) => f.startsWith('ref-') && f.endsWith('.json') && f !== 'ref-kitchen.json')!), 'utf8'));
const frameDir = join(refDir, ref.id, 'frames');
const frameFiles = readdirSync(frameDir);
const frameBytes = frameFiles.reduce((a, f) => a + statSync(join(frameDir, f)).size, 0);

// Instruments on one real analysis frame from this import (the middle one).
const px = decodePng(readFileSync(join(frameDir, frameFiles[Math.floor(frameFiles.length / 2)])));
const time = (fn: () => unknown) => {
  const xs: number[] = [];
  for (let i = 0; i < 15; i++) {
    const s = performance.now();
    fn();
    xs.push(performance.now() - s);
  }
  return median(xs);
};
const paletteMs = time(() => measurePalette(px));
const toneMs = time(() => (measureContrast(px), measureSaturation(px), measureTints(px)));
const sigMs = time(() => frameSignature(px));

const report = {
  clip: { file: clip.split('/').pop(), mb: +(statSync(clip).size / 1e6).toFixed(1), duration_s: ref.duration_s, width: ref.width, height: ref.height },
  frames: { count: ref.frame_count, sample_fps: ref.sample_fps, size: `${px.width}x${px.height}`, disk_mb: +(frameBytes / 1e6).toFixed(1) },
  shots_detected: ref.shots.length,
  seconds: { hashing: +marks.frames.toFixed(1), frames_sent: +(marks.analysing - marks.frames).toFixed(1), analysis: +(marks.ready - marks.analysing).toFixed(1), total: +marks.ready.toFixed(1) },
  engine_rss_mb: { idle_before: +idleBefore.toFixed(0), peak_during: +Math.max(...rss).toFixed(0), median_during: +median(rss).toFixed(0), idle_after: +idleAfter.toFixed(0) },
  tab_js_heap_mb: +(heap / 1e6).toFixed(1),
  one_frame_ms: { palette: +paletteMs.toFixed(1), tone: +toneMs.toFixed(1), cut_signature: +sigMs.toFixed(2) },
};
console.log(JSON.stringify(report, null, 2));
writeFileSync(join(work, 'report.json'), JSON.stringify(report, null, 2));

await browser.close();
engine.kill();
rmSync(home, { recursive: true, force: true });
if (!process.argv[2]) console.log(`clip kept for re-runs: ${clip}`);
