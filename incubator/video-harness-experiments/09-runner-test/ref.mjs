// The code's own version of Test 1b's 15 s, frame by frame, at fal's 16 fps: film 4's last shot clean, its depth, and
// the runner's mask, at 1920×1080.
//   node ref.mjs [frames=241] [start=72.9375]   → ref/clean_000.png, ref/depth_000.png, ref/runner_000.png …
//   ONLY=depth,runner renders just those passes. Frame k is at start + k/16 s of film 4 (the shot runs 72–88 s).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '../04-action/node_modules/playwright-core/index.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(HERE, '..'), OUT = path.join(HERE, 'ref');
const [frames = 241, start = 72.9375] = process.argv.slice(2).map(Number);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const cloud = fs.existsSync('/opt/pw-browsers/chromium');
const browser = await chromium.launch(cloud ? { executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--force-color-profile=srgb'] } : { channel: 'chrome', args: ['--force-color-profile=srgb'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('[page error]', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/09-runner-test/ref.html`);
await page.evaluate(() => window.ready);
fs.mkdirSync(OUT, { recursive: true });
const snap = async (file) => fs.writeFileSync(path.join(OUT, file), await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080 }, timeout: 0 }));
const only = process.env.ONLY ? process.env.ONLY.split(',') : null, want = (w) => !only || only.includes(w);
const t0 = Date.now();
for (let n = 0; n < frames; n++) {
  const t = start + n / 16, id = String(n).padStart(3, '0');
  if (want('clean')) { await page.evaluate((t) => window.renderClean(t), t); await snap(`clean_${id}.png`); }
  for (const w of ['depth', 'runner']) if (want(w)) { await page.evaluate(([t, w]) => window.renderPass(t, w), [t, w]); await snap(`${w}_${id}.png`); }
  if (n % 16 === 0) console.log(`frame ${n} (t ${t.toFixed(3)} s) · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
console.log(`done: ${frames} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
await browser.close(); server.close();
