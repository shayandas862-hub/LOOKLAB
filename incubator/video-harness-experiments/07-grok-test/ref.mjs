// The code's own version of a Grok clip's 6 s, frame by frame, for measuring against: the shot itself, a mask of
// the shoe's orange accents, and a mask of the whole shoe, at 1920×1080.
//   node ref.mjs [shot=2] [frames=145]   → ref/beauty_000.png, ref/stripe_000.png, ref/shoe_000.png …
//   ONLY=stage,shoe renders just those passes. STRUCTURE=1 also writes ref/depth_000.png (near white, far black) and ref/lines_000.png (outlines), for control models.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '../05-one-sentence/node_modules/playwright-core/index.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname), FILM = path.resolve(HERE, '../05-one-sentence'), OUT = path.join(HERE, 'ref');
const [shot = 2, frames = 145] = process.argv.slice(2).map(Number);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(FILM, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(FILM) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const cloud = fs.existsSync('/opt/pw-browsers/chromium');
const browser = await chromium.launch(cloud ? { executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--force-color-profile=srgb'] } : { channel: 'chrome', args: ['--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('[page error]', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/shots.html`);
await page.evaluate(() => window.ready);
fs.mkdirSync(OUT, { recursive: true });
const snap = async (file) => fs.writeFileSync(path.join(OUT, file), await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080 }, timeout: 0 }));
const t0 = Date.now();
for (let n = 0; n < frames; n++) {
  const u = n / 24, id = String(n).padStart(3, '0');
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null, want = (w) => !only || only.includes(w);
  if (want('beauty')) { await page.evaluate(([i, u]) => window.renderShot(i, u), [shot, u]); await snap(`beauty_${id}.png`); }
  for (const w of ['stripe', 'shoe', 'stage']) if (want(w)) { await page.evaluate(([i, u, w]) => window.renderMask(i, u, w), [shot, u, w]); await snap(`${w}_${id}.png`); }
  if (process.env.STRUCTURE) for (const w of ['depth', 'lines']) { await page.evaluate(([i, u, w]) => window.renderMask(i, u, w), [shot, u, w]); await snap(`${w}_${id}.png`); }
  if (n % 24 === 0) console.log(`frame ${n} · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
console.log(`done: ${frames} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
await browser.close(); server.close();
