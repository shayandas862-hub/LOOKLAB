// Renders the Grok test's starting frames from film 05's four shots, clean (no on-screen numbers), at 1920×1080.
//   node make-kit.mjs            → kit/S1_dune.png … kit/S4_city.png
// It serves ../05-one-sentence (its code and packages) and drives its shots.html page in headless Chrome.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '../05-one-sentence/node_modules/playwright-core/index.mjs';

const HERE = path.dirname(new URL(import.meta.url).pathname), FILM = path.resolve(HERE, '../05-one-sentence'), KIT = path.join(HERE, 'kit');
// [file, shot index, seconds into the shot]: the frame the clip starts from (S1 at 2 s: earlier, a sun glint sat on the heel).
// TRY='[["name",0,1.5]]' node make-kit.mjs renders other moments instead, for choosing.
const SHOTS = process.env.TRY ? JSON.parse(process.env.TRY) : [['S1_dune', 0, 2.0], ['S2_stride', 1, 1.0], ['S3_shoe', 2, 0.0], ['S3_shoe_end', 2, 6.0], ['S4_city', 3, 1.0]];
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
console.log('ready', JSON.stringify(await page.evaluate(() => window.ready)));
fs.mkdirSync(KIT, { recursive: true });
for (const [name, i, u] of SHOTS) {
  const info = await page.evaluate(([i, u]) => window.renderShot(i, u), [i, u]);
  fs.writeFileSync(path.join(KIT, `${name}.png`), await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080 }, timeout: 0 }));
  console.log(name, JSON.stringify(info));
}
await browser.close(); server.close();
