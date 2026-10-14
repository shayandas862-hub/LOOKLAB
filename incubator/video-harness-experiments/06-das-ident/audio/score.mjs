// The ident's sound, synthesised from the same clock and the same motion as the picture (src/motion.js):
// an air-and-drone bed, a whoosh wherever a petal passes the lens (panned to where it is on screen), a swoosh and
// a hit at each lock, the big hit on the red with a brass-like chord in D major, a shimmer that follows the pen
// drawing the D, a bell per letter, a glint, and a long tail. Original sound design; nothing is sampled.
//   node audio/score.mjs  → out/score.wav
import fs from 'node:fs';
import * as THREE from 'three';
import { SR, mtof, rng, SVF, Saw, Bus, reverb, compress, writeWav } from './dsp.mjs';
import { DURATION, CUE, W, H } from '../src/timeline.js';
import { petalPose, camAt, LOCK } from '../src/motion.js';

const N = Math.round(DURATION * SR), dry = new Bus(N), wet = new Bus(N), sub = new Bus(N);
const at = (t) => Math.round(t * SR);
// A sine arch raised to a power, safe at the edges (rounding can put x a hair outside 0..1, and a negative base
// to a fractional power is NaN).
const arch = (x, p) => Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, x)))), p);
const D = 50; // D3 in MIDI: the ident is in D

// Bed: a low D drone and moving air that swell with the light, duck at the hits, and close with the fade.
{
  const r = rng(3), f1 = new SVF(), f2 = new SVF(), s = [new Saw(0.1), new Saw(0.6), new Saw(0.3)];
  for (let i = 0; i < N; i++) {
    const t = i / SR, up = Math.min(1, t / 3.5), out = Math.max(0, 1 - Math.max(0, t - CUE.fade[0]) / 0.9);
    const drone = 0.16 * Math.sin(2 * Math.PI * mtof(D - 24) * t) + 0.05 * f1.run((s[0].next(mtof(D - 12) * 0.998) + s[1].next(mtof(D - 12) * 1.003) + s[2].next(mtof(D - 5))) / 3, 260 + 400 * up).lp;
    const air = f2.run(r(), 700 + 500 * Math.sin(t * 0.7), 0.8).bp * 0.05;
    const lvl = up * out * (t < CUE.lockRed ? 1 : 0.55);
    dry.add(i, drone * lvl, 0); wet.add(i, air * lvl, Math.sin(t * 0.4) * 0.6);
  }
}

// A whoosh: band-passed noise that sweeps up as it nears and down as it leaves, panned across.
function whoosh(tc, dur, amp, pan0, pan1, seed) {
  const r = rng(seed), f = new SVF(), g = new SVF();
  for (let i = at(tc - dur / 2); i < at(tc + dur / 2); i++) {
    const x = (i / SR - (tc - dur / 2)) / dur, shape = arch(x, 2.2), fc = 300 + 2600 * arch(x * 1.15, 1.5);
    const v = (f.run(r(), fc, 1.4).bp + 0.4 * g.run(r(), fc * 2.2, 2.5).bp) * shape * amp;
    dry.add(i, v * 0.7, lerp(pan0, pan1, x)); wet.add(i, v * 0.5, lerp(pan0, pan1, x));
  }
}
const lerp = (a, b, x) => a + (b - a) * x;
// Passes: where each petal is closest to the lens (a local minimum of distance), with its screen side for the pan.
const cam = new THREE.PerspectiveCamera(36, W / H, 0.05, 200);
const screenX = (p, t) => { const c = camAt(t); cam.position.copy(c.pos); cam.fov = c.fov; cam.lookAt(c.tgt); cam.updateMatrixWorld(); cam.updateProjectionMatrix(); return Math.max(-1, Math.min(1, p.clone().project(cam).x)); };
let seed = 10;
for (const id of Object.keys(LOCK)) {
  const d = []; for (let t = 0; t < LOCK[id] - 0.8; t += 0.02) d.push([t, petalPose(id, t).pos.distanceTo(camAt(t).pos)]);
  for (let k = 1; k < d.length - 1; k++) if (d[k][1] < d[k - 1][1] && d[k][1] <= d[k + 1][1] && d[k][0] > 0.4) {
    const [t, dist] = d[k], amp = Math.min(0.9, 4.2 / dist) * 0.55, p = petalPose(id, t).pos;
    whoosh(t, 1.1, amp, screenX(petalPose(id, t - 0.5).pos, t - 0.5), screenX(petalPose(id, t + 0.5).pos, t + 0.5), seed++);
  }
}

// Each lock: a swoosh into it, a deep thud with a click; the red's is a layered big hit with a sub drop.
function thud(t0, f0, f1, amp, dur, pan = 0) {
  for (let i = at(t0), ph = 0; i < at(t0 + dur); i++) {
    const x = i / SR - t0, f = f1 + (f0 - f1) * Math.exp(-x * 9); ph += (2 * Math.PI * f) / SR;
    const v = Math.tanh(1.6 * Math.sin(ph)) * Math.exp(-x / (dur * 0.35)) * amp; sub.add(i, v, pan);
  }
  const r = rng(Math.round(t0 * 100)), f = new SVF();
  for (let i = at(t0), k = 0; k < at(0.05); i++, k++) dry.add(i, f.run(r(), 3500, 0.7).bp * Math.exp(-k / SR / 0.008) * amp * 0.9, pan);
}
[['green', -0.35], ['amber', 0.2], ['cyan', 0.05]].forEach(([id, pan], k) => {
  whoosh(LOCK[id] - 0.3, 0.6, 0.35, pan * 2.5, pan, 40 + k); thud(LOCK[id], 140, 55, 0.55, 0.9, pan);
});
{
  const L = CUE.lockRed, r = rng(91), hp = new SVF(), bp = new SVF();
  // Riser: noise opening upwards and a reverse swell into the hit.
  for (let i = at(L - 2.2); i < at(L); i++) {
    const x = (i / SR - (L - 2.2)) / 2.2;
    const v = hp.run(r(), 400 + 7000 * x * x, 0.9).bp * Math.pow(x, 2.5) * 0.35 + bp.run(r(), 6000, 0.5).hp * Math.pow(x, 6) * 0.25;
    wet.add(i, v, Math.sin(x * 9) * 0.4); dry.add(i, v * 0.5, 0);
  }
  thud(L, 120, 31, 1.0, 3.2); thud(L, 260, 70, 0.5, 0.7);
  // A crash: bright noise with a long fall, wide.
  const c1 = new SVF(), c2 = new SVF();
  for (let i = at(L), k = 0; i < N; i++, k++) { const x = k / SR, n1 = c1.run(r(), 7000, 0.6).hp, n2 = c2.run(r(), 9000, 0.6).hp; dry.add(i, n1 * 0.22 * Math.exp(-x / 0.9), -0.6); dry.add(i, n2 * 0.22 * Math.exp(-x / 0.9), 0.6); wet.add(i, (n1 + n2) * 0.12 * Math.exp(-x / 1.6), 0); }
}

// The chord on the big hit: brass-like stacks (detuned saws through an opening filter, driven), D major, with a
// slow swell to the end; a choir-like pad an octave up comes in under the words.
function stack(m, t0, t1, amp, pan, { open = [300, 2200], drive = 1.8, voices = 3, rise = 0.05 } = {}) {
  const saws = Array.from({ length: voices }, (_, v) => new Saw(v * 0.31)), f = new SVF(), det = [-0.11, 0, 0.12, -0.05, 0.07];
  for (let i = at(t0); i < Math.min(N, at(t1 + 3)); i++) {
    const x = i / SR - t0, fc = open[0] + (open[1] - open[0]) * (1 - Math.exp(-x / 0.35)) * Math.exp(-x / 6);
    let s = 0; saws.forEach((w, v) => (s += w.next(mtof(m + det[v % det.length]))));
    const a = Math.min(1, x / rise) * (i / SR < t1 ? 1 : Math.exp(-(i / SR - t1) / 0.9));
    const v = Math.tanh(drive * f.run(s / voices, fc, 0.9).lp) * a * amp; dry.add(i, v * 0.6, pan); wet.add(i, v * 0.6, pan);
  }
}
[[D - 12, -0.2], [D - 5, 0.2], [D, -0.35], [D + 4, 0.35], [D + 7, 0]].forEach(([m, pan]) => stack(m, CUE.lockRed, CUE.fade[0] + 0.3, m < D ? 0.2 : 0.13, pan));
[[D + 12, -0.5], [D + 16, 0.5], [D + 19, 0]].forEach(([m, pan]) => stack(m, CUE.as[0], CUE.fade[0] + 0.3, 0.05, pan, { open: [500, 1400], drive: 0.8, voices: 5, rise: 1.2 }));

// The pen: a shimmer whose pitch climbs as the D is drawn, with crackle.
{
  const r = rng(7), f = new SVF(), [s0] = CUE.dStem, [, b1] = CUE.dBowl;
  for (let i = at(s0), ph = 0; i < at(b1 + 0.4); i++) {
    const t = i / SR, p = Math.min(1, (t - s0) / (b1 - s0)), fade = t > b1 ? Math.exp(-(t - b1) / 0.12) : Math.min(1, (t - s0) / 0.05);
    ph += (2 * Math.PI * mtof(D + 24 + 12 * p)) / SR;
    const v = (Math.sin(ph) * (0.5 + 0.5 * Math.sin(t * 2 * Math.PI * 11)) * 0.05 + f.run(r(), 5000 + 3000 * p, 2).bp * 0.12 * (r() > 0.6 ? 1 : 0.3)) * fade;
    dry.add(i, v, -0.5 + 0.3 * p); wet.add(i, v * 1.2, 0);
  }
}

// A bell per letter, climbing the D major pentatonic: additive, slightly inharmonic partials.
function bell(m, t0, amp, pan) {
  const f = mtof(m), P = [[1, 1, 1.6], [2.0, 0.5, 0.9], [2.76, 0.35, 0.6], [5.4, 0.18, 0.3], [8.93, 0.08, 0.15]];
  for (let i = at(t0), k = 0; i < Math.min(N, at(t0 + 2.5)); i++, k++) {
    const x = k / SR; let v = 0; for (const [r, a, d] of P) v += a * Math.sin(2 * Math.PI * f * r * x) * Math.exp(-x / d);
    v *= amp * Math.min(1, x / 0.002); dry.add(i, v * 0.6, pan); wet.add(i, v * 0.7, pan);
  }
}
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26];
CUE.as && [CUE.as[0], CUE.as[0] + (CUE.as[1] - CUE.as[0] - 0.5)].forEach((t, i) => bell(D + 12 + PENTA[i], t + 0.1, 0.09, -0.3 + 0.2 * i));
{ const [w0, w1] = CUE.production, step = (w1 - w0 - 0.5) / 9; for (let i = 0; i < 10; i++) bell(D + 12 + PENTA[2 + i], w0 + i * step + 0.1, 0.06, -0.4 + 0.08 * i); }

// The glint: a bright shing sweeping left to right.
{
  const r = rng(13), f = new SVF(), [g0, g1] = CUE.glint;
  for (let i = at(g0); i < at(g1 + 1.2); i++) {
    const x = (i / SR - g0) / (g1 - g0), v = f.run(r(), 6000 + 5000 * Math.min(1, x), 3).bp * arch(x, 1.5) * 0.12;
    dry.add(i, v, -0.8 + 1.6 * Math.min(1, x)); wet.add(i, v, 0);
  }
  [[D + 24, -0.4], [D + 28, 0.4], [D + 31, 0]].forEach(([m, p], k) => bell(m, g0 + 0.35 + 0.12 * k, 0.05, p));
}

// Mix: reverb on the wet bus, the sub bus kept dry and mono, a gentle bus compressor, fade at the end.
const rv = reverb(wet, { room: 0.9, damp: 0.3, input: 0.02 }), rvd = reverb(dry, { room: 0.88, damp: 0.35, input: 0.006 });
const L = new Float32Array(N), R = new Float32Array(N), hpL = new SVF(), hpR = new SVF();
for (let i = 0; i < N; i++) {
  const t = i / SR, f = t < CUE.fade[0] ? 1 : Math.max(0, 1 - (t - CUE.fade[0]) / (CUE.fade[1] - CUE.fade[0]));
  L[i] = (hpL.run(dry.L[i] + wet.L[i] * 0.6 + rv.L[i] + rvd.L[i], 28).hp + sub.L[i]) * f;
  R[i] = (hpR.run(dry.R[i] + wet.R[i] * 0.6 + rv.R[i] + rvd.R[i], 28).hp + sub.R[i]) * f;
}
compress(L, R, { thr: -14, ratio: 2.5, att: 0.01, rel: 0.2 }); const cl = L, cr = R; // in place
let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(cl[i]), Math.abs(cr[i]));
const g = 0.89 / peak; for (let i = 0; i < N; i++) { cl[i] = Math.tanh(cl[i] * g * 1.05) / Math.tanh(1.05); cr[i] = Math.tanh(cr[i] * g * 1.05) / Math.tanh(1.05); }
fs.mkdirSync(new URL('../out', import.meta.url), { recursive: true });
writeWav(new URL('../out/score.wav', import.meta.url).pathname, cl, cr, fs);
console.log(`score: ${DURATION} s, peak normalised from ${(20 * Math.log10(peak)).toFixed(1)} dBFS`);
