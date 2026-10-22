// Plays the previs frame by frame in headless Chromium and hands each frame to ffmpeg.
//   node render.mjs stills 1.5 6.2 …            → out/stills/still_<t>.png
//   node render.mjs sheet 0 17.5 1.25 [--cols 5] → out/stills/sheet_0-16.25.png (a contact sheet, for checking)
//   node render.mjs video [--workers 4]         → out/previs.mp4, in 2 s chunks that survive a restart
//   node render.mjs passes 7.5 12 81 --name s3 [--passes beauty,depth,mask:bowl]
//        → out/passes/s3/<pass>_000.png …, 81 frames spread evenly from 7.5 s to 12 s, plus <pass>_16fps.mp4 per pass
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
import { FPS, DURATION, W, H } from './src/timeline.js';

const CLOUD = fs.existsSync('/opt/pw-browsers/chromium');
const FLAGS = ['--ignore-gpu-blocklist', '--font-render-hinting=none', '--force-color-profile=srgb'];
const LAUNCH = CLOUD
  ? { executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', ...FLAGS] }
  : process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: FLAGS } : { channel: 'chrome', args: FLAGS };

const ROOT = path.dirname(fileURLToPath(import.meta.url)); // decoded: the repo path holds spaces ("LOOK LAB ")
const OUT = path.join(ROOT, 'out'), STILLS = path.join(OUT, 'stills');
fs.mkdirSync(STILLS, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.mjs': 'text/javascript', '.json': 'application/json' };

function serve() {
  const server = http.createServer((req, res) => {
    const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
    fs.createReadStream(p).pipe(res);
  });
  return new Promise((r) => server.listen(0, '127.0.0.1', () => r(server)));
}

async function openPage(browser, port) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[page error]', e.message));
  await page.goto(`http://127.0.0.1:${port}/${process.env.PAGE || 'index.html'}`);   // PAGE=person.html for the person test
  const info = await page.evaluate(() => window.ready);
  if (!info) throw new Error('page failed to initialise: check the console above or run node --check on src/*.js');
  return { page, info };
}
const shot = (page) => page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H }, timeout: 0 });

function encoder(file) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-g', String(FPS), '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  const write = (buf) => new Promise((r) => (ff.stdin.write(buf) ? r() : ff.stdin.once('drain', r)));
  return { write, end: () => { ff.stdin.end(); return done; } };
}
const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
const opt = (args, name, d) => { const i = args.indexOf(name); return i >= 0 ? +args[i + 1] : d; };

// Renders frames [a, b) in chunks of `per` frames across `workers` browsers. Finished chunks are kept.
async function renderChunks(port, a, b, per, workers, prefix) {
  const chunks = [];
  for (let s = a, k = 0; s < b; s += per, k++) chunks.push({ s, e: Math.min(b, s + per), file: path.join(OUT, `${prefix}_${String(Math.round(s / per)).padStart(3, '0')}.mp4`) });
  const todo = chunks.filter((c) => !fs.existsSync(c.file + '.done'));
  const t0 = Date.now(); let n = 0; const total = todo.reduce((s, c) => s + c.e - c.s, 0);
  console.log(`${todo.length} of ${chunks.length} chunks to render (${total} frames, ${workers} workers)`);
  await Promise.all(Array.from({ length: workers }, async () => {
    const br = await chromium.launch(LAUNCH);
    const { page } = await openPage(br, port);
    while (todo.length) {
      const c = todo.shift(), enc = encoder(c.file);
      for (let f = c.s; f < c.e; f++) {
        await page.evaluate((f) => window.renderFrame(f), f);
        await enc.write(await shot(page));
        if (++n % 24 === 0) { const el = (Date.now() - t0) / 1000; console.log(`${n}/${total} frames · ${el.toFixed(0)} s · ${(el / n).toFixed(2)} s/frame`); }
      }
      await enc.end(); fs.writeFileSync(c.file + '.done', '');
    }
    await br.close();
  }));
  return chunks;
}
function concat(chunks, file) {
  const list = path.join(OUT, 'list.txt');
  fs.writeFileSync(list, chunks.map((c) => `file '${c.file}'`).join('\n'));
  ff(['-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', file]);
}

const server = await serve();
const port = server.address().port;
const [mode, ...rest] = process.argv.slice(2);
try {
  if (mode === 'stills' || mode === 'sheet') {
    const br = await chromium.launch(LAUNCH);
    const { page } = await openPage(br, port);
    let times = rest.filter((s) => !s.startsWith('--')).map(Number);
    if (mode === 'sheet') { const [a, b, st] = times; times = []; for (let t = a; t < b - 1e-6; t += st) times.push(+t.toFixed(3)); }
    const files = [];
    for (const s of times) {
      const f = Math.round(s * FPS), t0 = Date.now();
      await page.evaluate((f) => window.renderFrame(f), f);
      const file = path.join(STILLS, `still_${s.toFixed(3)}.png`); fs.writeFileSync(file, await shot(page)); files.push(file);
      console.log(`t=${s} ${Date.now() - t0} ms`);
    }
    if (mode === 'sheet') {
      const cols = opt(rest, '--cols', 5), list = path.join(OUT, 'sheet.txt');
      fs.writeFileSync(list, files.map((f) => `file '${f}'`).join('\n'));
      const out = path.join(STILLS, `sheet_${times[0]}-${times[times.length - 1]}.png`);
      ff(['-f', 'concat', '-safe', '0', '-i', list, '-vf', `scale=270:-1,tile=${cols}x${Math.ceil(files.length / cols)}:padding=4`, '-frames:v', '1', out]);
      console.log('→', out);
    }
    await br.close();
  } else if (mode === 'passes') {
    const [a, b, n] = rest.filter((s) => !s.startsWith('--')).slice(0, 3).map(Number);
    const name = rest[rest.indexOf('--name') + 1], want = (rest.includes('--passes') ? rest[rest.indexOf('--passes') + 1] : 'beauty,depth,mask:bowl').split(',');
    const dir = path.join(OUT, 'passes', name); fs.mkdirSync(dir, { recursive: true });
    const br = await chromium.launch(LAUNCH), { page } = await openPage(br, port), t0 = Date.now();
    for (let k = 0; k < n; k++) {
      const t = a + ((b - a) * k) / (n - 1), id = String(k).padStart(3, '0');
      for (const w of want) {
        await page.evaluate(([t, w]) => { if (w === 'beauty') { window.renderAt(t); document.getElementById('hud').textContent = ''; } else window.renderPass(t, w); }, [t, w]);
        fs.writeFileSync(path.join(dir, `${w.replace(':', '-')}_${id}.png`), await shot(page));
      }
      if (k % 16 === 15) console.log(`${k + 1}/${n} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    await br.close();
    for (const w of want) {
      const p = w.replace(':', '-');
      const fps = String(opt(rest, '--fps', 16));   // the rate the frames were sampled at (default fal's 16)
      ff(['-framerate', fps, '-i', path.join(dir, `${p}_%03d.png`), '-vf', 'format=yuv420p', '-c:v', 'libx264', '-crf', '12', '-movflags', '+faststart', path.join(dir, `${p}_${fps}fps.mp4`)]);
    }
    console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s → ${path.relative(ROOT, dir)}`);
  } else if (mode === 'video') {
    const workers = opt(rest, '--workers', 4), t0 = Date.now();
    const chunks = await renderChunks(port, 0, Math.round(DURATION * FPS), FPS * 2, workers, 'chunk');
    concat(chunks, path.join(OUT, 'previs.mp4'));
    console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s → out/previs.mp4`);
  }
} finally {
  server.close();
}
