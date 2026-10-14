// Plays the page frame by frame (film 2) in headless Chromium and hands each frame to ffmpeg.
//   node render.mjs stills 0.5 2.1 4.6        → out/still_<t>.png
//   node render.mjs video [--workers 4]       → out/silent.mp4
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright-core';
import { FPS, DURATION, W, H } from './src/timeline.js';

// Where Chrome comes from: the cloud container's bundled Chromium with software WebGL,
// or on your own machine the installed Google Chrome (or CHROME_PATH), using its real GPU.
const CLOUD = fs.existsSync('/opt/pw-browsers/chromium');
const FLAGS = ['--ignore-gpu-blocklist', '--font-render-hinting=none', '--force-color-profile=srgb'];
const LAUNCH = CLOUD
  ? { executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', ...FLAGS] }
  : process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH, args: FLAGS } : { channel: 'chrome', args: FLAGS };

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(ROOT, 'out');
fs.mkdirSync(OUT, { recursive: true });
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
  page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[page error]', e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html`);
  const info = await page.evaluate(() => window.ready);
  return { page, info };
}

const shot = (page) => page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H }, timeout: 0 });

function encoder(file) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-g', String(FPS), '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  const write = (buf) => new Promise((r) => (ff.stdin.write(buf) ? r() : ff.stdin.once('drain', r)));
  return { write, end: () => { ff.stdin.end(); return done; } };
}

const server = await serve();
const port = server.address().port;
const browser = await chromium.launch(LAUNCH);
const [mode, ...rest] = process.argv.slice(2);

try {
  if (mode === 'stills') {
    const { page, info } = await openPage(browser, port);
    console.log('ready', JSON.stringify(info));
    for (const s of rest) {
      const f = Math.round(parseFloat(s) * FPS);
      const t0 = Date.now(); const k = await page.evaluate((f) => window.renderFrame(f), f);
      fs.writeFileSync(path.join(OUT, `still_${s}.png`), await shot(page));
      console.log(`t=${s} samples=${k} ${Date.now() - t0} ms`);
    }
  } else if (mode === 'video') {
    // Chunks of 2 s handed out from a queue; one browser per worker so WebGL really runs in parallel;
    // a finished chunk is marked done, so a crash resumes instead of starting over.
    const wi = rest.indexOf('--workers'), workers = wi >= 0 ? +rest[wi + 1] : 4, CH = FPS * 2;
    const total = Math.round(DURATION * FPS), chunks = [];
    for (let a = 0, k = 0; a < total; a += CH, k++) chunks.push({ k, a, b: Math.min(total, a + CH), file: path.join(OUT, `chunk_${String(k).padStart(3, '0')}.mp4`) });
    const todo = chunks.filter((c) => !fs.existsSync(c.file + '.done'));
    const t0 = Date.now(); let doneFrames = (chunks.length - todo.length) * CH;
    console.log(`${todo.length} of ${chunks.length} chunks to render`);
    await Promise.all(Array.from({ length: workers }, async () => {
      const b = await chromium.launch(LAUNCH);
      const { page } = await openPage(b, port);
      while (todo.length) {
        const c = todo.shift(), enc = encoder(c.file);
        for (let f = c.a; f < c.b; f++) {
          await page.evaluate((f) => window.renderFrame(f), f);
          await enc.write(await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H }, timeout: 0 }));
          if (++doneFrames % 48 === 0) console.log(`${doneFrames}/${total} frames · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
        }
        await enc.end(); fs.writeFileSync(c.file + '.done', '');
      }
      await b.close();
    }));
    const list = path.join(OUT, 'chunks.txt');
    fs.writeFileSync(list, chunks.map((c) => `file '${c.file}'`).join('\n'));
    await new Promise((res, rej) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', path.join(OUT, 'silent.mp4')], { stdio: 'inherit' })
      .on('close', (c) => (c === 0 ? res() : rej(new Error('concat ' + c)))));
    console.log(`rendered ${total} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s → out/silent.mp4`);
  }
} finally {
  await browser.close();
  server.close();
}
