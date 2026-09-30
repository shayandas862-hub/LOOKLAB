// Headless test of the tab-1 core (renderer + fit search). No browser needed.
// Extracts the code between /*CORE-START*/ and /*CORE-END*/ from dist/look-lab.html.
// Each case renders a synthetic reference with a HIDDEN light, downsamples it (as the page does),
// runs the fit from pixels only, and compares against the hidden truth.
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const html = fs.readFileSync(path.join(__dirname, '../dist/look-lab.html'), 'utf8');
const core = html.split('/*CORE-START*/')[1].split('/*CORE-END*/')[0];
const { renderScene, downsample, createFit } = new Function(core + ';return {renderScene,downsample,createFit};')();
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const W = 240, H = 300, FW = 40, FH = 50;

function png(file, rgb, w, h) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let j = 0; j < h; j++) { raw[j * (w * 3 + 1)] = 0; for (let i = 0; i < w * 3; i++) raw[j * (w * 3 + 1) + 1 + i] = Math.round(rgb[j * w * 3 + i] * 255); }
  const T = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; T[n] = c >>> 0; }
  const crc = b => { let c = 0xffffffff; for (const x of b) c = T[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 2;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}
const CASES = [
  { name: 'rembrandt', p: { az: -52, el: 28, soft: .35, int: 1.15, kel: 3800, fill: 2, lens: 85, yaw: 6, tilt: 0, lamp: 1, wall: .7 } },
  { name: 'beauty',    p: { az: 8, el: 32, soft: .9, int: 1.0, kel: 5600, fill: .6, lens: 100, yaw: -3, tilt: 1, lamp: 0, wall: 1.0 } },
  { name: 'noir',      p: { az: 78, el: 8, soft: .12, int: 1.3, kel: 4600, fill: 3, lens: 50, yaw: -10, tilt: -1, lamp: 0, wall: .35 } },
  { name: 'extra-a',   p: { az: 35, el: 50, soft: .5, int: 1.0, kel: 5000, fill: 1.5, lens: 70, yaw: 0, tilt: 0, lamp: 0, wall: .8 } },
  { name: 'extra-b',   p: { az: -100, el: 20, soft: .3, int: 1.4, kel: 4200, fill: 2.5, lens: 85, yaw: 5, tilt: 0, lamp: 1, wall: .5 } },
];
// Tolerances. Softness is deliberately NOT asserted: it is weakly identifiable (see docs/08-VALIDATION.md).
const TOL = { az: 15, el: 8, kel: 500, fill: 0.6, err: 0.02 };
const NEUTRAL = { az: 0, el: 20, soft: .5, int: 1, kel: 5600, fill: 1 };
let failed = 0;
for (const C of CASES) {
  const ref = renderScene(C.p, W, H, 0.012).rgb, low = downsample(ref, W, H, 6);
  const base = { ...NEUTRAL, lens: C.p.lens, yaw: C.p.yaw, tilt: C.p.tilt, lamp: C.p.lamp, wall: C.p.wall };
  const f = createFit(low, FW, FH, base); let r, n = 0; do { r = f.step(); n++; } while (!r.done && n < 400);
  const d = { az: Math.abs(r.p.az - C.p.az), el: Math.abs(r.p.el - C.p.el), kel: Math.abs(r.p.kel - C.p.kel), fill: Math.abs(r.p.fill - C.p.fill), soft: Math.abs(r.p.soft - C.p.soft) };
  const ok = d.az <= TOL.az && d.el <= TOL.el && d.kel <= TOL.kel && d.fill <= TOL.fill && r.err <= TOL.err;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${C.name.padEnd(10)} steps ${String(n).padStart(2)}  residual ${r.err.toFixed(4)}  Δaz ${d.az.toFixed(0)}°  Δel ${d.el.toFixed(0)}°  ΔK ${d.kel.toFixed(0)}  Δfill ${d.fill.toFixed(2)}  Δsoft ${d.soft.toFixed(2)} (not asserted)`);
  const rec = renderScene(r.p, W, H, 0).rgb, both = new Float32Array(W * 2 * H * 3);
  for (let j = 0; j < H; j++) { both.set(ref.subarray(j * W * 3, (j + 1) * W * 3), j * W * 6); both.set(rec.subarray(j * W * 3, (j + 1) * W * 3), j * W * 6 + W * 3); }
  png(path.join(OUT, `fit-${C.name}.png`), both, W * 2, H);
}
if (failed) { console.error(`${failed} case(s) failed`); process.exit(1); }
console.log('core fit: all cases passed');
