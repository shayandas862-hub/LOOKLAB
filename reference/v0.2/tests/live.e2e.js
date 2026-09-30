// End-to-end test of all three tabs in headless Chromium (needs: npm i, npm run fetch:three, a Chromium).
// Env: CHROMIUM_PATH=/path/to/chromium (optional; otherwise Playwright's own browser is used).
const pw = require('playwright'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const three = fs.readFileSync(path.join(ROOT, 'vendor/three.min.js'));
const url = 'file://' + path.join(ROOT, 'dist/index.html');
let failed = 0; const check = (name, ok, detail = '') => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? '  ' + detail : ''}`); };

(async () => {
  const launch = { args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl'] };
  if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;
  const b = await pw.chromium.launch(launch), errs = [];
  async function open(w, h) {
    const pg = await b.newPage({ viewport: { width: w, height: h } });
    pg.on('pageerror', e => errs.push(`${w}: ${e.message}`));
    pg.on('console', m => { if (m.type() === 'error' && !/fonts|Failed to load resource/.test(m.text())) errs.push(`${w}: ${m.text().slice(0, 200)}`); });
    await pg.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ body: three, contentType: 'application/javascript' }));
    await pg.route('https://fonts.g*/**', r => r.abort());
    await pg.goto(url); return pg;
  }
  const pg = await open(1200, 1000);
  // --- tab 1 ---
  await pg.waitForFunction(() => document.querySelectorAll('#log li').length >= 15, null, { timeout: 30000 });
  const m1 = parseInt(await pg.textContent('#matchPct'));
  check('tab1 auto-fit on load reaches >= 90% match', m1 >= 90, `(${m1}%)`);
  // --- tab 2 ---
  await pg.click('#tabLiveBtn'); await pg.waitForFunction(() => typeof Live !== 'undefined' && Live.api.ready(), null, { timeout: 30000 });
  check('tab2 scene ready', (await pg.textContent('#lvStatus')).includes('ready'));
  const rt = await pg.evaluate(() => { const a = Live.api, j1 = JSON.stringify(a.toJSON()), ok = a.applyJSON(j1); return ok && j1 === JSON.stringify(a.toJSON()); });
  check('scene graph JSON round-trips exactly', rt);
  const bad = await pg.evaluate(() => Live.api.applyJSON('{"elements":[]}'));
  check('invalid scene graph is rejected', bad === false);
  const project = id => pg.evaluate(id => { const a = Live.api, S = a.S(), e = id === 'key' ? S.light : S.els.find(x => x.id === id), cam = a.camera(); const v = new THREE.Vector3(e.x, (e.y || 0) + (id === 'key' ? 0 : 1), e.z).project(cam); const r = document.getElementById('lvCanvas').getBoundingClientRect(); return { x: r.left + (v.x * .5 + .5) * r.width, y: r.top + (-v.y * .5 + .5) * r.height, ex: e.x, ez: e.z }; }, id);
  let p0 = await project('dev'); await pg.mouse.move(p0.x, p0.y); await pg.mouse.down(); await pg.mouse.move(p0.x + 60, p0.y + 20, { steps: 6 }); await pg.mouse.up();
  let d1 = await pg.evaluate(() => { const S = Live.api.S(), e = S.els.find(x => x.id === 'dev'); return { x: e.x, z: e.z, sel: S.sel }; });
  check('dragging an element on the floor moves it and selects it', Math.abs(d1.x - p0.ex) > .3 && d1.sel === 'dev', `(${p0.ex.toFixed(2)},${p0.ez.toFixed(2)} → ${d1.x.toFixed(2)},${d1.z.toFixed(2)})`);
  const az0 = await pg.evaluate(() => Live.api.S().cam.az), box = await (await pg.$('#lvCanvas')).boundingBox();
  await pg.mouse.move(box.x + box.width * .5, box.y + box.height * .08); await pg.mouse.down(); await pg.mouse.move(box.x + box.width * .3, box.y + box.height * .08, { steps: 5 }); await pg.mouse.up();
  check('dragging empty space orbits the camera', Math.abs(await pg.evaluate(() => Live.api.S().cam.az) - az0) > 5);
  await pg.evaluate(() => Live.api.applyJSON(JSON.stringify(Live.api.toJSON()))); // keep state sane
  const k0 = await project('key'); await pg.mouse.move(k0.x, k0.y); await pg.mouse.down(); await pg.mouse.move(k0.x + 120, k0.y, { steps: 6 }); await pg.mouse.up();
  check('dragging the key light moves it', Math.abs(await pg.evaluate(() => Live.api.S().light.x) - k0.ex) > .3);
  // match on all three references
  const MIN = [90, 80, 85]; // observed in the build session: 99, 88, 94
  for (const i of [0, 1, 2]) {
    await pg.evaluate(i => document.querySelectorAll('#lvRefSeg .btn')[i].click(), i); await pg.waitForTimeout(800);
    await pg.click('#lvMatch'); await pg.waitForFunction(() => !document.getElementById('lvMatch').disabled, null, { timeout: 90000 });
    const m = parseInt((await pg.textContent('#lvMatchChip')).replace(/\D/g, ''));
    check(`match light to reference ${i} reaches >= ${MIN[i]}%`, m >= MIN[i], `(${m}%)`);
  }
  // R11: cards face camera OFF + orbit => flagged
  await pg.click('#lvFace');
  await pg.evaluate(() => { const o = [...document.querySelectorAll('#lvCam input')][1]; o.value = 50; o.dispatchEvent(new Event('input', { bubbles: true })); });
  await pg.waitForTimeout(400);
  check('rule R11 fires when a card is viewed > 35 degrees off-axis', await pg.evaluate(() => [...document.querySelectorAll('#lvLog li')].some(li => li.textContent.includes('R11'))));
  await pg.click('#lvFace');
  const parsed = await pg.evaluate(() => [Live.api.parsePrompt('green trench coat with gold accents'), Live.api.parsePrompt('banana')]);
  check('outfit prompt parser: colour + garment words; unknown text rejected', parsed[0] && parsed[0].type === 'coat' && parsed[0].color === '#2f7a4a' && parsed[1] === null);
  await pg.evaluate(() => { const a = Live.api; a.select('mara'); a.generateOutfit(a.S().els[0], a.OUTFITS[1], 'x'); });
  await pg.waitForTimeout(1500);
  check('outfit swap rebuilds the card', await pg.evaluate(() => Live.api.S().els[0].outfit.type === 'dress'));
  await pg.evaluate(() => { const a = Live.api; a.toggleMode(a.S().els[0]); });
  check('card -> mesh upgrade', await pg.evaluate(() => Live.api.S().els[0].mode === 'mesh'));
  await pg.click('#lvHero'); await pg.waitForFunction(() => document.getElementById('lvJobChip').textContent === 'done', null, { timeout: 20000 });
  check('hero render stand-in completes', !(await pg.$eval('#lvCmp', e => e.hidden)));
  await pg.screenshot({ path: path.join(OUT, 'live-desktop.png'), fullPage: true });
  // --- tab 3 + back to tab 1 ---
  await pg.click('#tabArchBtn'); await pg.waitForTimeout(300); await pg.screenshot({ path: path.join(OUT, 'how-it-works.png'), fullPage: true });
  await pg.click('#tabFitBtn'); await pg.waitForTimeout(400);
  check('tab 1 still visible after visiting the others', !(await pg.$eval('#tabFit', e => e.hidden)));
  await pg.close();
  // --- mobile ---
  const pm = await open(400, 900); await pm.waitForTimeout(500);
  for (const [btn, name] of [['#tabFitBtn', 'fit'], ['#tabLiveBtn', 'live'], ['#tabArchBtn', 'how']]) {
    await pm.click(btn); await pm.waitForTimeout(name === 'live' ? 2500 : 400);
    const [sw, cw] = await pm.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    check(`mobile 400px: no horizontal scroll on ${name}`, sw <= cw, `(${sw}/${cw})`);
  }
  await pm.screenshot({ path: path.join(OUT, 'mobile.png'), fullPage: true });
  check('no page errors or console errors', errs.length === 0, errs.join(' | '));
  await b.close();
  if (failed) { console.error(`${failed} check(s) failed`); process.exit(1); }
  console.log('e2e: all checks passed');
})().catch(e => { console.error('FAIL', e); process.exit(1); });
