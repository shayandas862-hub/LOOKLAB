// The soundtrack, written against the same timeline as the picture.
//   node audio/score.mjs → out/score.wav
import fs from 'node:fs';
import path from 'node:path';
import { SR, rng, SVF, Saw, Bus, reverb, pingPong, writeWav } from './dsp.mjs';
import { DURATION, BEAT, T, events } from '../src/timeline.js';

const N = Math.round(DURATION * SR);
const dry = new Bus(N), verb = new Bus(N), echo = new Bus(N);
const noise = rng(1234);
const S = (t) => Math.round(t * SR);

// Sidechain: everything musical ducks under the kick.
const KICKS = [];
for (let t = 3.0; t < T.riser2[1] - 0.01; t += BEAT) KICKS.push(t);
const duck = (t) => { let d = 1; for (const k of KICKS) if (t >= k && t - k < 0.4) d = Math.min(d, 1 - 0.65 * Math.exp(-(t - k) / 0.11)); return d; };

function voice(t0, dur, fn, { pan = 0, gain = 1, send = 0, delay = 0 } = {}) {
  const a = S(t0), n = S(dur);
  for (let i = 0; i < n; i++) {
    const v = fn(i / SR, i) * gain;
    dry.add(a + i, v, pan); if (send) verb.add(a + i, v * send, pan); if (delay) echo.add(a + i, v * delay, pan);
  }
}

// ── Instruments ──────────────────────────────────────────────
const kick = (t0) => { let ph = 0; voice(t0, 0.5, (t) => {
  ph += (44 + 120 * Math.exp(-t / 0.028)) / SR;
  return Math.tanh(1.6 * Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.3)) * 0.55 + noise() * Math.exp(-t / 0.004) * 0.45 + Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t / 0.03) * 0.25; }); };
const hat = (t0, g = 0.12, pan = 0.25) => { const f = new SVF(); voice(t0, 0.08, (t) => f.run(noise(), 8000, 0.8).hp * Math.exp(-t / 0.022), { gain: g, pan }); };
function bassNote(t0, freq, dur) {
  const a = new Saw(0.1), b = new Saw(0.6), f = new SVF();
  voice(t0, dur, (t) => {
    const env = Math.min(1, t / 0.004) * Math.min(1, (dur - t) / 0.03);
    const x = (a.next(freq) + b.next(freq * 1.004)) * 0.5 + Math.sin(2 * Math.PI * freq * t) * 0.35;
    return f.run(x, 260 + 1500 * Math.exp(-t / 0.07), 0.9).lp * env * duck(t0 + t);
  }, { gain: 0.3 });
}
function pad(t0, t1, freqs, { cut0 = 900, cut1 = 2600, gain = 0.07, rel = 0.6, send = 0.6, ducked = true } = {}) {
  const dur = t1 - t0 + rel;
  freqs.forEach((fq, j) => [-0.6, 0, 0.6].forEach((pan, k) => {
    const o = new Saw((j * 0.31 + k * 0.17) % 1), f = new SVF(), det = 1 + (k - 1) * 0.0045;
    voice(t0, dur, (t) => {
      const env = Math.min(1, t / 0.35) * (t > t1 - t0 ? Math.max(0, 1 - (t - (t1 - t0)) / rel) : 1);
      const c = cut0 + (cut1 - cut0) * Math.min(1, t / (t1 - t0));
      return f.run(o.next(fq * det), c, 0.8).lp * env * (ducked ? duck(t0 + t) : 1);
    }, { pan, gain, send });
  }));
}
function pluck(t0, freq, pan) {
  const o = new Saw(0), f = new SVF();
  voice(t0, 0.4, (t) => f.run(o.next(freq) + 0.5 * Math.sin(2 * Math.PI * freq * 2 * t), 300 + 4200 * Math.exp(-t / 0.045), 1.2).lp * Math.exp(-t / 0.13),
    { gain: 0.1, pan, send: 0.25, delay: 0.6 });
}
function impact(t0, size) {
  let ph = 0; const f = new SVF();
  voice(t0, 2.6, (t) => {
    ph += (28 + 50 * Math.exp(-t / 0.09)) / SR;
    const sub = Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.9);
    const n = f.run(noise(), 200 + 4000 * Math.exp(-t / 0.08), 0.7).lp * Math.exp(-t / 0.35);
    return Math.tanh(1.4 * (sub * 0.7 + n * 0.95)) * size;
  }, { gain: 0.75, send: 0.5 });
}
function whoosh(t0, dur, pan = 0, up = false) {
  const f = new SVF();
  voice(t0, dur, (t, i) => {
    const x = t / dur, fc = up ? 300 * Math.pow(20, x) : 400 + 3600 * Math.sin(Math.PI * x);
    const p = pan * (2 * x - 1);
    const v = f.run(noise(), fc, 1.6).bp * Math.pow(Math.sin(Math.PI * Math.min(1, x * 1.15)), 2);
    dry.add(S(t0) + i, v * 0.55, p); verb.add(S(t0) + i, v * 0.3, -p);
    return 0;
  });
}
function riser(t0, dur) {
  const f = new SVF(); let ph = 0;
  voice(t0, dur, (t) => {
    const x = t / dur; ph += (220 * Math.pow(4, x)) / SR;
    const trem = 0.6 + 0.4 * Math.sin(2 * Math.PI * (4 + 18 * x) * t);
    return (f.run(noise(), 300 * Math.pow(25, x), 2).bp * 0.8 + Math.sin(2 * Math.PI * ph) * 0.12 * trem) * x * x;
  }, { gain: 0.55, send: 0.35 });
}
const blip = (t0, f, g = 0.5, pan = 0) => voice(t0, 0.18, (t) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t / 0.02)) * Math.min(1, t / 0.002) * Math.exp(-t / 0.05), { gain: 0.2 * g, pan, send: 0.3, delay: 0.25 });
const tick = (t0, g = 1) => { const f = new SVF(); voice(t0, 0.03, (t) => f.run(noise(), 3600, 5).bp * Math.exp(-t / 0.004), { gain: 0.35 * g, pan: -0.2 }); };
const click = (t0) => voice(t0, 0.05, (t) => (noise() * Math.exp(-t / 0.0015) * 0.5 + Math.sin(2 * Math.PI * 1150 * t) * Math.exp(-t / 0.012)), { gain: 0.16, send: 0.2 });
const typeKey = (t0, k) => { const f = new SVF(); voice(t0, 0.04, (t) => f.run(noise(), 2200 + 1800 * ((k * 0.37) % 1), 3).bp * Math.exp(-t / 0.006), { gain: 0.3, pan: ((k * 0.61) % 1) - 0.5 }); };
const thump = (t0, fq) => { let ph = 0; voice(t0, 0.5, (t) => { ph += (fq * (0.6 + 0.4 * Math.exp(-t / 0.05))) / SR; return Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.16) + noise() * Math.exp(-t / 0.008) * 0.2; }, { gain: 0.45, send: 0.15 }); };
const stamp = (t0) => { thump(t0, 95); const f = new SVF(); voice(t0, 0.15, (t) => f.run(noise(), 1300, 1.2).bp * Math.exp(-t / 0.04), { gain: 0.5, send: 0.25 }); };
function scan(t0, dur) {
  let ph = 0;
  voice(t0, dur, (t) => { const x = t / dur; ph += (320 * Math.pow(5, x)) / SR; return Math.sin(2 * Math.PI * ph) * Math.sin(Math.PI * x) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 28 * t)); }, { gain: 0.05, send: 0.3, delay: 0.3 });
}

// ── Arrangement ──────────────────────────────────────────────
// Cold open: a low drone under the clock ticks.
voice(0, 2.2, (t) => (Math.sin(2 * Math.PI * 55 * t) * 0.7 + Math.sin(2 * Math.PI * 82.41 * t) * 0.35) * Math.min(1, t / 1.2) * (t > 2.0 ? Math.max(0, 1 - (t - 2) / 0.2) : 1), { gain: 0.22, send: 0.2 });

const CHORDS = [
  [3.0, 4.5, 55.0, [110, 164.81, 196, 246.94, 261.63]],
  [4.5, 6.0, 43.65, [87.31, 130.81, 164.81, 220, 261.63]],
  [6.0, 7.5, 65.41, [130.81, 196, 293.66, 329.63]],
  [7.5, 9.0, 49.0, [98, 146.83, 246.94, 293.66, 329.63]],
  [9.0, 10.5, 55.0, [110, 164.81, 196, 246.94, 261.63]],
  [10.5, T.riser2[1], 43.65, [87.31, 130.81, 164.81, 220, 246.94]],
];
for (const [a, b, root, notes] of CHORDS) {
  pad(a, b, notes, { rel: b >= T.riser2[1] ? 0.05 : 0.5 });
  for (let t = a; t < b - 0.01; t += BEAT / 2) bassNote(t, root, Math.min(BEAT / 2 - 0.01, b - t));
  if (a >= 6.0) {
    const arp = [0, 2, 3, 1, 4, 2, 3, 1].map((i) => notes[i % notes.length] * 4);
    let k = 0;
    for (let t = a; t < b - 0.01; t += BEAT / 4) pluck(t, arp[k % arp.length], ((k++ % 4) - 1.5) * 0.3);
  }
}
for (const t of KICKS) kick(t);
for (let t = 3.0 + BEAT / 2; t < T.riser2[1]; t += BEAT) hat(t, 0.18);
for (let t = 9.0; t < T.riser2[1]; t += BEAT / 4) if (Math.round((t - 9) / (BEAT / 4)) % 2) hat(t, 0.06, -0.3);

// The end: A major add9, opening slowly, a long tail.
pad(T.logo, 14.4, [110, 164.81, 220, 277.18, 329.63, 493.88], { cut0: 600, cut1: 3200, gain: 0.075, rel: 0.6, send: 0.9, ducked: false });
voice(T.logo, 2.8, (t) => (Math.sin(2 * Math.PI * 880 * t) + Math.sin(2 * Math.PI * 1318.5 * t) * 0.6) * Math.min(1, t / 0.8) * Math.exp(-t / 1.6), { gain: 0.03, send: 1, delay: 0.4 });

// Every on-screen event gets its sound.
let k = 0;
for (const e of events()) {
  const pan = Math.sin(e.t * 7.3) * 0.5;
  switch (e.type) {
    case 'tick': tick(e.t, e.gain); break;
    case 'click': click(e.t); break;
    case 'riser': riser(e.t, e.dur); break;
    case 'impact': impact(e.t, e.size); break;
    case 'whoosh': whoosh(e.t, e.dur, e.pan, e.up); break;
    case 'hit': impact(e.t, e.size * 0.55); break;
    case 'scan': scan(e.t, e.dur); break;
    case 'blip': blip(e.t, e.f, e.gain ?? 1, pan); break;
    case 'type': typeKey(e.t, k++); break;
    case 'thump': thump(e.t, e.f); break;
    case 'stamp': stamp(e.t); break;
  }
}

// ── Mix ──────────────────────────────────────────────────────
const wet = reverb(verb), dl = pingPong(echo, BEAT * 0.75);
// Pre-drop: the room goes quiet for a beat before the logo lands.
const gate = (t) => (t < T.riser2[1] || t >= T.logo ? 1 : t > T.logo - 0.004 ? 1 : Math.max(0.12, 1 - (t - T.riser2[1]) / 0.04));
const L = new Float32Array(N), R = new Float32Array(N), hpL = new SVF(), hpR = new SVF(), tl = new SVF(), tr = new SVF();
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = (t > 14.4 ? Math.max(0, 1 - (t - 14.4) / 0.6) : 1) * gate(t);
  const l = hpL.run(dry.L[i] + wet.L[i] * 2.2 + dl.L[i] * 2.4, 32).hp, r = hpR.run(dry.R[i] + wet.R[i] * 2.2 + dl.R[i] * 2.4, 32).hp;
  // Tilt: lift everything above ~2 kHz so it reads on laptop speakers.
  L[i] = (l + 0.6 * tl.run(l, 2200).hp) * fade; R[i] = (r + 0.6 * tr.run(r, 2200).hp) * fade;
}
let peak = 0;
for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * 1.05); R[i] = Math.tanh(R[i] * 1.05); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
const g = 0.8 / peak;
for (let i = 0; i < N; i++) { L[i] *= g; R[i] *= g; }
const out = path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'out', 'score.wav');
writeWav(out, L, R, fs);
console.log('wrote', out, 'peak before norm', peak.toFixed(3));

if (process.env.ANALYSE) {
  const rms = (a, s = 0, e = a.length) => { let x = 0; for (let i = s; i < e; i++) x += a[i] * a[i]; return Math.sqrt(x / Math.max(1, e - s)); };
  const db = (v) => (20 * Math.log10(v + 1e-9)).toFixed(1).padStart(6);
  console.log('bus rms dB  dry', db(rms(dry.L)), ' verb', db(rms(wet.L) * 2.2), ' delay', db(rms(dl.L) * 2.4));
  const bands = [[0, 100], [100, 500], [500, 2000], [2000, 8000], [8000, 20000]];
  console.log('bands', bands.map(([a, b]) => { const f1 = new SVF(), f2 = new SVF(); let e = 0;
    for (let i = 0; i < N; i++) { const hp = a ? f1.run(L[i], a).hp : L[i]; const v = f2.run(hp, b).lp; e += v * v; }
    return `${a}-${b}Hz ${db(Math.sqrt(e / N))}`; }).join('  '));
  const w = SR / 4;
  let line = '';
  for (let i = 0; i < N; i += w) line += `${(i / SR).toFixed(2)}s ${db(rms(L, i, i + w))} ${'#'.repeat(Math.max(0, Math.round((40 + 20 * Math.log10(rms(L, i, i + w) + 1e-9)) / 1.5)))}\n`;
  console.log(line);
}
