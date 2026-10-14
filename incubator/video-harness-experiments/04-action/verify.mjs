// The motion checker: steps the whole film frame by frame (updating, not drawing) and flags camera moves that
// are faster than a person could follow. A jump far beyond the limits is a cut, and cuts are skipped.
//   node verify.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { FPS, DURATION, W, H } from './src/timeline.js';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const LIMIT = { speed: 8, turn: 3.5 }, CUT = { speed: 40, turn: 25 };
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch(fs.existsSync('/opt/pw-browsers/chromium') ? { executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } : { channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
await page.evaluate(() => window.ready);
const n = Math.round(DURATION * FPS);
const frames = await page.evaluate((n) => Array.from({ length: n }, (_, f) => window.probe(f)), n);
await browser.close(); server.close();
const issues = []; let cuts = 0;
for (let f = 1; f < n; f++) {
  const a = frames[f - 1], b = frames[f];
  const v = Math.hypot(b.pos[0] - a.pos[0], b.pos[1] - a.pos[1], b.pos[2] - a.pos[2]) * FPS;
  const w = Math.acos(Math.min(1, a.dir[0] * b.dir[0] + a.dir[1] * b.dir[1] + a.dir[2] * b.dir[2])) * FPS;
  if (a.scene !== b.scene || v > CUT.speed || w > CUT.turn) { cuts++; continue; }
  if (v > LIMIT.speed || w > LIMIT.turn) issues.push(`f${f} t=${(f / FPS).toFixed(2)} camera ${v.toFixed(1)} m/s, turning ${w.toFixed(2)} rad/s`);
}
console.log(`${n} frames, ${cuts} cuts skipped`);
console.log(issues.length ? issues.join('\n') : 'no camera move over the limits');
