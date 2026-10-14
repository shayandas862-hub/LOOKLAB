// FIRST LIGHT — score, foley and voices, all on the picture's clock.
//   node audio/score.mjs → out/score.wav
import fs from 'node:fs';
import path from 'node:path';
import { SR, rng, SVF, Saw, Bus, reverb, pingPong, writeWav } from './dsp.mjs';
import { DURATION, BEAT, BAR, T, events } from '../src/timeline.js';
import { footsteps } from '../src/anim.js';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const N = Math.round(DURATION * SR), S = (t) => Math.round(t * SR);
const dry = new Bus(N), verb = new Bus(N), echo = new Bus(N), noise = rng(808);
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
function voice(t0, dur, fn, { pan = 0, gain = 1, send = 0, delay = 0 } = {}) {
  const a = S(t0), n = S(dur);
  for (let i = 0; i < n; i++) { const v = fn(i / SR, i) * gain; dry.add(a + i, v, pan); if (send) verb.add(a + i, v * send, pan); if (delay) echo.add(a + i, v * delay, pan); }
}

// ── Instruments ──
const marimba = (t0, m, g = 1, pan = 0) => { const f = mtof(m);
  voice(t0, 0.9, (t) => (Math.sin(2 * Math.PI * f * t) * Math.exp(-t / 0.45) + 0.35 * Math.sin(2 * Math.PI * f * 3.93 * t) * Math.exp(-t / 0.08) + 0.1 * Math.sin(2 * Math.PI * f * 9.24 * t) * Math.exp(-t / 0.03)) * Math.min(1, t / 0.002), { gain: 0.16 * g, pan, send: 0.3 }); };
const glock = (t0, m, g = 1, pan = 0) => { const f = mtof(m);
  voice(t0, 2.2, (t) => [[1, 1, 1.3], [2.76, 0.32, 0.4], [5.4, 0.14, 0.18], [8.93, 0.06, 0.08]].reduce((s, [r, a, d]) => s + a * Math.sin(2 * Math.PI * f * r * t) * Math.exp(-t / d), 0) * Math.min(1, t / 0.001), { gain: 0.07 * g, pan, send: 0.5, delay: 0.25 }); };
function pluck(t0, m, g = 1, pan = 0, decay = 0.994, dur = 1.2) { // Karplus–Strong
  const f = mtof(m), len = Math.max(2, Math.round(SR / f)), buf = new Float32Array(len), lp = new SVF();
  for (let i = 0; i < len; i++) buf[i] = lp.run(noise(), 2500, 0.7).lp;
  let idx = 0;
  voice(t0, dur, () => { const a = buf[idx], b = buf[(idx + 1) % len]; buf[idx] = decay * 0.5 * (a + b); idx = (idx + 1) % len; return a; }, { gain: 0.5 * g, pan, send: 0.25 });
}
function pad(t0, t1, notes, { gain = 0.04, cut = 1300, att = 0.5, rel = 0.8, send = 0.7, vib = 0 } = {}) {
  const dur = t1 - t0 + rel;
  notes.forEach((m, j) => [-0.6, 0.6].forEach((pan, k) => {
    const o = new Saw((j * 0.37 + k * 0.21) % 1), f = new SVF(), fq = mtof(m) * (1 + (k ? 0.004 : -0.004));
    voice(t0, dur, (t) => { const env = Math.min(1, t / att) * (t > t1 - t0 ? Math.max(0, 1 - (t - (t1 - t0)) / rel) : 1);
      return f.run(o.next(fq * (1 + vib * 0.004 * Math.sin(2 * Math.PI * 5.2 * t))), cut, 0.7).lp * env; }, { pan, gain, send });
  }));
}
const kick = (t0, g = 1) => { let ph = 0; voice(t0, 0.3, (t) => { ph += (48 + 70 * Math.exp(-t / 0.03)) / SR; return Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.18); }, { gain: 0.32 * g }); };
const shaker = (t0, g = 1) => { const f = new SVF(); voice(t0, 0.07, (t) => f.run(noise(), 6500, 0.8).hp * Math.sin(Math.PI * Math.min(1, t / 0.06)), { gain: 0.07 * g, pan: 0.35 }); };
const rim = (t0, g = 1) => { const f = new SVF(); voice(t0, 0.04, (t) => f.run(noise(), 2100, 4).bp * Math.exp(-t / 0.008), { gain: 0.2 * g, pan: -0.3, send: 0.2 }); };

// ── Foley ──
const step = (t0, light, k) => { const f = new SVF(); voice(t0, 0.12, (t) => (f.run(noise(), light ? 900 : 650, 0.9).lp * 0.9 + Math.sin(2 * Math.PI * (light ? 140 : 95) * t) * 0.6) * Math.exp(-t / (light ? 0.025 : 0.035)), { gain: (light ? 0.16 : 0.22) * (0.85 + 0.3 * ((k * 0.618) % 1)), pan: -0.15 }); };
const pop = (t0, size = 1) => { let ph = 0; voice(t0, 0.25, (t) => { ph += (180 + 520 * Math.exp(-t / 0.03)) / SR; return Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.07) + noise() * Math.exp(-t / 0.006) * 0.3; }, { gain: 0.35 * size, send: 0.3 }); };
const sw = (t0) => { voice(t0, 0.35, (t) => Math.sin(2 * Math.PI * 110 * t) * Math.exp(-t / 0.06) * 0.8 + noise() * Math.exp(-t / 0.004) * 0.5, { gain: 0.35, send: 0.2 });
  voice(t0 + 0.02, 2.2, (t) => (Math.sin(2 * Math.PI * 120 * t) * 0.5 + Math.sin(2 * Math.PI * 240 * t) * 0.25) * Math.min(1, t / 0.3) * Math.exp(-t / 1.0), { gain: 0.025 }); };
function shimmer(t0, dur) { for (let i = 0; i < 26; i++) { const tt = t0 + (i / 26) * dur * 0.85, m = [84, 86, 88, 91, 93, 96][(i * 7) % 6] + (i % 3 === 0 ? 12 : 0);
  voice(tt, 0.9, (t) => Math.sin(2 * Math.PI * mtof(m) * t) * Math.exp(-t / 0.35) * Math.min(1, t / 0.004), { gain: 0.035 * (1 - i / 34), pan: Math.sin(i * 1.7) * 0.7, send: 0.8, delay: 0.3 }); } }
function whoosh(t0, dur) { const f = new SVF(); voice(t0, dur, (t) => { const x = t / dur; return f.run(noise(), 400 * Math.pow(10, x), 1.4).bp * Math.pow(Math.sin(Math.PI * x), 2); }, { gain: 0.35, send: 0.3 }); }
function riser(t0, dur) { const f = new SVF(); voice(t0, dur, (t) => { const x = t / dur; return f.run(noise(), 300 * Math.pow(18, x), 2).bp * x * x * 0.7 + Math.sin(2 * Math.PI * mtof(72 + 12 * x) * t) * 0.04 * x; }, { gain: 0.35, send: 0.5 }); }
const slate = (t0) => { const f = new SVF(); voice(t0, 0.3, (t) => f.run(noise(), 1800, 0.8).hp * Math.exp(-t / 0.012) * 1.2 + Math.sin(2 * Math.PI * 780 * t) * Math.exp(-t / 0.03) * 0.7, { gain: 0.6, send: 0.45 }); };
const bulb = (t0, i) => voice(t0, 0.4, (t) => Math.sin(2 * Math.PI * mtof(91 + [0, 2, 4, 7, 9, 12, 14, 16, 19][i % 9]) * t) * Math.exp(-t / 0.12), { gain: 0.05, pan: (i / 8) * 1.4 - 0.7, send: 0.6 });
const lightOn = (t0, i) => { voice(t0, 0.25, (t) => Math.sin(2 * Math.PI * (90 - i * 8) * t) * Math.exp(-t / 0.08) + noise() * Math.exp(-t / 0.005) * 0.4, { gain: 0.3, send: 0.25 }); glock(t0 + 0.02, [77, 81, 84, 89][i], 0.8, i * 0.3 - 0.45); };
const peek = (t0, back) => { let ph = 0; voice(t0, 0.18, (t) => { ph += (back ? 520 - 900 * t : 380 + 1200 * t) / SR; return Math.sin(2 * Math.PI * ph) * Math.sin(Math.PI * t / 0.18); }, { gain: 0.08, send: 0.3 }); };
const clapHands = (t0) => { const f = new SVF(); voice(t0, 0.25, (t) => { const burst = [0, 0.008, 0.016].some((o) => t >= o && t < o + 0.004) ? 1 : (t > 0.016 ? Math.exp(-(t - 0.016) / 0.06) : 0); return f.run(noise(), 1400, 1.2).bp * burst; }, { gain: 0.6, send: 0.4 }); shimmer(t0, 0.6); };

// ── Voices: tiny formant gibberish ──
const VOWEL = { a: [750, 1250, 2650], o: [460, 820, 2800], e: [450, 1900, 2600], i: [320, 2300, 3000], u: [330, 800, 2400], m: [260, 900, 2200] };
function say(t0, syl, f0, { gain = 0.12, pan = 0 } = {}) {
  let t = t0;
  for (const [v, dur, p0, p1] of syl) {
    const fs = VOWEL[v].map(() => new SVF()), o = new Saw(0); let k = 0;
    voice(t, dur, (u) => { const x = u / dur, f = f0 * (p0 + (p1 - p0) * x) * (1 + 0.01 * Math.sin(2 * Math.PI * 6 * u)); const src = o.next(f) * Math.sin(Math.PI * Math.min(1, x * 1.15));
      let out = 0; VOWEL[v].forEach((fm, j) => { out += fs[j].run(src, fm, 7 + j * 2).bp * [1, 0.6, 0.25][j]; }); k++; return v === 'm' ? out * 0.6 : out; }, { gain, pan, send: 0.25 });
    t += dur * 0.92;
  }
}
const LINES = {
  hm: [['m', 0.16, 1, 1.05], ['m', 0.2, 1.05, 1.35]],
  yay: [['i', 0.07, 1.1, 1.2], ['a', 0.14, 1.25, 1.4], ['e', 0.16, 1.4, 1.15]],
  oh: [['o', 0.2, 1.25, 0.95]],
  come: [['u', 0.07, 1, 1.05], ['a', 0.14, 1.05, 1.2], ['o', 0.18, 1.1, 0.9]],
  la: [['a', 0.15, 1.0, 1.0], ['a', 0.15, 1.26, 1.26], ['a', 0.28, 1.5, 1.45]],
};

// ── Arrangement (16 bars of 2.5 s) ──
const bar = (n) => (n - 1) * BAR, beat = (n, b) => bar(n) + b * BEAT;
const CH = {
  1: [53, 57, 60, 64, 67], 2: [50, 53, 57, 60, 64], 3: [53, 57, 60, 64], 4: [52, 55, 60, 64], 5: [46, 53, 57, 62], 6: [45, 53, 57, 60],
  7: [46, 53, 58, 62], 8: [48, 55, 60, 64], 9: [50, 53, 57, 60], 10: [47, 53, 55, 62], 11: [43, 53, 58, 62], 12: [53, 57, 60, 64],
  13: [45, 52, 55, 60], 14: [46, 53, 57, 62], 15: [48, 55, 62, 64], 16: [41, 53, 57, 60, 67],
};
const ROOTS = { 3: 41, 4: 40, 5: 46, 6: 45, 7: 46, 8: 48, 9: 50, 10: 47, 11: 43, 12: 41, 13: 45, 14: 46, 15: 48, 16: 41 };
for (let n = 1; n <= 16; n++) {
  const hero = n >= 12 && n <= 15, quiet = n === 11;
  pad(bar(n), bar(n) + BAR, CH[n], { gain: n <= 2 ? 0.022 : hero ? 0.05 : 0.032, cut: hero ? 2400 : n <= 2 ? 900 : 1500, att: hero ? 0.35 : 0.6, rel: n === 16 ? 2.4 : 0.7, vib: hero ? 1 : 0 });
  if (n >= 3 && n !== 11 && n !== 16) { // pizzicato bass, walking
    const r = ROOTS[n], walk = n === 9 || n === 10 ? [r, r + 7, r + 12, r + 7] : [r, r + 4 + (n % 2), r + 7, r + 4 + (n % 2)];
    walk.forEach((m, b) => pluck(beat(n, b), m - 12 + 12, hero ? 1 : 0.8, -0.1, 0.993, 0.9));
  }
  if ((n >= 6 && n <= 8) || hero) { for (let b = 0; b < 4; b++) { kick(beat(n, b), b % 2 ? 0.55 : 1); for (let s = 0; s < 4; s++) shaker(beat(n, b) + s * BEAT / 4 + (s % 2 ? 0.03 : 0), s % 2 ? 0.7 : 1); } }
  if (n === 9 || n === 10) for (let b = 0; b < 4; b++) rim(beat(n, b) + BEAT / 2, 0.8);
  if (n === 3 || n === 4) for (let b = 0; b < 4; b++) marimba(beat(n, b) + BEAT / 2, CH[n][(b + 1) % 4] + 12, 0.6, 0.3);
  if (n >= 6 && n <= 8) CH[n].concat(CH[n].slice(1, 3).map((m) => m + 12)).forEach((m, i) => marimba(beat(n, i * 0.5), m + 12, 0.7, (i % 2 ? 0.25 : -0.25)));
  if (n === 9 || n === 10) [0, 1.5, 2, 3.5].forEach((b, i) => marimba(beat(n, b), CH[n][i % 4] + 24, 0.8, i % 2 ? 0.4 : -0.4));
  if (quiet) pad(bar(n), bar(n) + BAR, [65, 70, 74], { gain: 0.02, cut: 3000, att: 1.2, rel: 0.2, vib: 1 });
}
// Glockenspiel motifs: intro, then the hero theme.
[[1, [[0, 81, 1], [1.5, 84, 0.5], [2, 79, 2]]], [2, [[0, 77, 1], [1.5, 76, 0.5], [2, 72, 2]]]].forEach(([n, ns]) => ns.forEach(([b, m]) => glock(beat(n, b), m, 0.9)));
const THEME = [[12, [[0.5, 69], [1.5, 72], [2.5, 77], [3.5, 76]]], [13, [[0, 72], [1, 76], [2, 79], [3.5, 77]]], [14, [[0, 74], [1, 77], [2, 81]]], [15, [[0, 79], [1, 76], [2, 72]]], [16, [[0, 77]]]];
THEME.forEach(([n, ns]) => ns.forEach(([b, m]) => { glock(beat(n, b), m + 12, 1.1, 0.15); marimba(beat(n, b), m, 0.9, -0.15); }));
pad(beat(12, 0.5), bar(16) + BAR, [77, 81], { gain: 0.012, cut: 3200, att: 1.5, rel: 1.5, vib: 1 });

// Foley and voices from the picture.
footsteps('dir').forEach((t, k) => step(t, false, k));
footsteps('actor').forEach((t, k) => step(t, true, k));
for (const e of events()) {
  switch (e.type) {
    case 'voice': say(e.t, LINES[e.say], e.who === 'dir' ? 250 : 360, { pan: e.who === 'dir' ? -0.2 : 0.2 }); break;
    case 'whoosh': whoosh(e.t, e.dur); break;
    case 'pop': pop(e.t, e.size); break;
    case 'switch': sw(e.t); break;
    case 'shimmer': shimmer(e.t, e.dur); break;
    case 'lightOn': lightOn(e.t, e.i); break;
    case 'bulb': bulb(e.t, e.i); break;
    case 'peek': peek(e.t, e.back); break;
    case 'riser': riser(e.t, e.dur); break;
    case 'clap': slate(e.t); break;
    case 'highfive': clapHands(e.t); break;
    case 'chime': [77, 81, 84, 89, 93].forEach((m, i) => glock(e.t + i * 0.09, m, 0.9, i * 0.2 - 0.4)); break;
  }
}

// ── Mix ──
const wet = reverb(verb, { room: 0.88, damp: 0.3 }), dl = pingPong(echo, BEAT * 0.75, 0.35, 3000);
const L = new Float32Array(N), R = new Float32Array(N), hl = new SVF(), hr = new SVF(), tl = new SVF(), tr = new SVF();
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = t > T.fade[0] ? Math.max(0, 1 - (t - T.fade[0]) / (T.fade[1] - T.fade[0])) : 1;
  const l = hl.run(dry.L[i] + wet.L[i] * 2.4 + dl.L[i] * 1.8, 35).hp, r = hr.run(dry.R[i] + wet.R[i] * 2.4 + dl.R[i] * 1.8, 35).hp;
  L[i] = (l + 0.35 * tl.run(l, 2500).hp) * fade; R[i] = (r + 0.35 * tr.run(r, 2500).hp) * fade;
}
let peak = 0;
for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * 1.1); R[i] = Math.tanh(R[i] * 1.1); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
for (let i = 0; i < N; i++) { L[i] *= 0.8 / peak; R[i] *= 0.8 / peak; }
fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
writeWav(path.join(ROOT, 'out', 'score.wav'), L, R, fs);
console.log('score.wav written; footsteps', footsteps('dir').length, '+', footsteps('actor').length, '; peak', peak.toFixed(3));
