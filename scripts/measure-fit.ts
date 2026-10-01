// Measures the light fit on this machine (P3): node --experimental-strip-types scripts/measure-fit.ts [clip]
// Starts the engine exactly as `npm start` does. With a clip, first imports it through the Breakdown screen in Chrome
// (the state P2 measured: 146–147 MB idle after a 60 s import; scripts/measure-import.ts records such a clip and
// keeps it). Then imports a committed Blender render through the API, marks its face and runs breakdown.fit_light ten
// times over HTTP. Reports the time per fit and engine RSS: idle before, idle after the import, peak and median during
// the fits (sampled every 50 ms), idle after (median over 4 s after 8 s settling, as measure-import.ts does).
// Each idle point also reports macOS's footprint (private memory, compressed pages included): RSS leaves out pages
// macOS has compressed, so it reads lower while Chrome is open and memory is short. --keep-browser keeps the Chrome
// that did the import open while the engine is measured, as measure-import.ts does.
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright-core';

const ROOT = join(import.meta.dirname, '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCENE = join(ROOT, 'tests', 'fixtures', 'blender', 'test', 'test-03-light');
const home = join(mkdtempSync(join(tmpdir(), 'looklab-fit-')), 'home');
const port = 40000 + Math.floor(Math.random() * 20000);
const rssMb = (pid: number) => Number(execFileSync('ps', ['-o', 'rss=', '-p', String(pid)]).toString().trim()) / 1024;
/** macOS footprint in MB ("Footprint: 172 MB" from /usr/bin/footprint). */
function footprintMb(pid: number): number {
  const m = /Footprint: ([\d.]+) (KB|MB|GB)/.exec(execFileSync('footprint', [String(pid)]).toString());
  return m ? Number(m[1]) * { KB: 1 / 1024, MB: 1, GB: 1024 }[m[2] as 'KB' | 'MB' | 'GB'] : NaN;
}
const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function idleRss(pid: number): Promise<number> {
  await sleep(8000);
  const xs: number[] = [];
  for (let i = 0; i < 16; i++) { xs.push(rssMb(pid)); await sleep(250); }
  return median(xs);
}

const engine = spawn(process.execPath, ['--experimental-strip-types', '--no-warnings=ExperimentalWarning', 'src/engine/main.ts'], {
  cwd: ROOT, env: { ...process.env, LOOKLAB_HOME: home, LOOKLAB_PORT: String(port) },
});
await new Promise<void>((resolve, reject) => {
  engine.stdout!.on('data', (d) => String(d).includes('running at') && resolve());
  engine.on('exit', () => reject(new Error('engine exited')));
});
const pid = engine.pid!;
const url = `http://127.0.0.1:${port}`;
const token = readFileSync(join(home, 'token'), 'utf8').trim();
async function api<T = any>(action: string, input: object = {}): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const r = await fetch(`${url}/api/actions/${action}`, { method: 'POST', headers: { 'x-looklab-token': token, 'content-type': 'application/json', host: `127.0.0.1:${port}` }, body: JSON.stringify(input) });
  const body = await r.json();
  if (!r.ok) throw new Error(`${action}: ${body.message}`);
  return body.result as T;
}

const report: Record<string, unknown> = {};
const rss: Record<string, number> = { idle_fresh: await idleRss(pid) };
const foot: Record<string, number> = { idle_fresh: footprintMb(pid) };
let keep: { close(): Promise<void> } | null = null;

const clip = process.argv[2]?.startsWith('--') ? undefined : process.argv[2];
if (clip) {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(url);
  await page.waitForSelector('[data-screen-label="Breakdown"]');
  await page.getByRole('button', { name: 'Replace reference' }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Browse files' }).click();
  await (await chooser).setFiles(clip);
  await page.waitForFunction(() => {
    const t = document.querySelector('main')?.textContent ?? '';
    return !t.includes('Analysing reference') && !t.includes('Reading frames') && /MEASURED/.test(t);
  }, null, { timeout: 600_000, polling: 500 });
  if (process.argv.includes('--keep-browser')) keep = browser;
  else await browser.close();
  rss.idle_after_import = await idleRss(pid);
  foot.idle_after_import = footprintMb(pid);
  report.clip = clip.split('/').pop();
  report.chrome_open_while_measuring = !!keep;
}

// The Blender render, on another shot so the clip's breakdown stays.
const png = readFileSync(`${SCENE}.png`), truth = JSON.parse(readFileSync(`${SCENE}.json`, 'utf8'));
const { reference_id } = await api('breakdown.import_reference', {
  shot_id: '12D', file_name: 'test-03-light.png', media: 'image', mime: 'image/png', size_bytes: png.length,
  sha256: createHash('sha256').update(png).digest('hex'), last_modified: null, width: 512, height: 288, frame_count: 1,
});
await api('breakdown.add_frame', { reference_id, index: 0, png_base64: png.toString('base64') });
await api('breakdown.analyse', { shot_id: '12D' });
await api('breakdown.set_face', { shot_id: '12D', ...truth.face_box });
rss.idle_before_fit = await idleRss(pid);
foot.idle_before_fit = footprintMb(pid);

const during: number[] = [];
const sampler = setInterval(() => during.push(rssMb(pid)), 50);
const ms: number[] = [];
let last: any; // eslint-disable-line @typescript-eslint/no-explicit-any
for (let i = 0; i < 10; i++) {
  const t = performance.now();
  last = await api('breakdown.fit_light', { shot_id: '12D' });
  ms.push(performance.now() - t);
}
clearInterval(sampler);
rss.peak_during_fit = Math.max(...during);
rss.median_during_fit = median(during);
rss.idle_after_fit = await idleRss(pid);
foot.idle_after_fit = footprintMb(pid);
await keep?.close();

report.fit_ms_over_http = { first: +ms[0].toFixed(0), median: +median(ms).toFixed(0), max: +Math.max(...ms).toFixed(0), runs: ms.length };
report.fitted = { az: last.light.key_az.value, el: last.light.key_el.value, kelvin: last.light.key_kelvin.value, confidence: last.fit.confidence };
report.truth = { az: truth.key.az, el: truth.key.el, kelvin: truth.key.kelvin };
report.engine_rss_mb = Object.fromEntries(Object.entries(rss).map(([k, v]) => [k, +v.toFixed(0)]));
report.engine_footprint_mb = Object.fromEntries(Object.entries(foot).map(([k, v]) => [k, +v.toFixed(0)]));
console.log(JSON.stringify(report, null, 2));
engine.kill();
rmSync(join(home, '..'), { recursive: true, force: true });
