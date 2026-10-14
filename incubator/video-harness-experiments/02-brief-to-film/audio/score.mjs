// Film 2 soundtrack: 128 BPM, D minor, written against the same timeline as the picture.
//   node audio/score.mjs → out/score.wav and src/envelope.json (the SOUND lane in act 3)
import fs from 'node:fs';
import path from 'node:path';
import { SR, rng, SVF, Saw, Bus, reverb, pingPong, writeWav } from './dsp.mjs';
import { DURATION, BEAT, BAR, ACT, T, events } from '../src/timeline.js';
import { COLS } from '../src/wall.js';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const N = Math.round(DURATION * SR);
const dry = new Bus(N), verb = new Bus(N), echo = new Bus(N);
const noise = rng(4242), S = (t) => Math.round(t * SR);

const KICKS = [];
for (let t = ACT.engines[0]; t < T.gap[0] - 0.01; t += BEAT) KICKS.push(t);
const duck = (t) => { let d = 1; for (const k of KICKS) if (t >= k && t - k < 0.35) d = Math.min(d, 1 - 0.7 * Math.exp(-(t - k) / 0.1)); return d; };

function voice(t0, dur, fn, { pan = 0, gain = 1, send = 0, delay = 0 } = {}) {
  const a = S(t0), n = S(dur);
  for (let i = 0; i < n; i++) {
    const v = fn(i / SR, i) * gain;
    dry.add(a + i, v, pan); if (send) verb.add(a + i, v * send, pan); if (delay) echo.add(a + i, v * delay, pan);
  }
}

// ── Instruments ──
const kick = (t0) => { let ph = 0; voice(t0, 0.45, (t) => { ph += (46 + 130 * Math.exp(-t / 0.025)) / SR;
  return Math.tanh(2 * Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.26)) * 0.55 + noise() * Math.exp(-t / 0.004) * 0.4 + Math.sin(2 * Math.PI * 210 * t) * Math.exp(-t / 0.025) * 0.25; }); };
const hat = (t0, g = 0.16, pan = 0.3, open = false) => { const f = new SVF(); voice(t0, open ? 0.2 : 0.07, (t) => f.run(noise(), 8500, 0.8).hp * Math.exp(-t / (open ? 0.07 : 0.018)), { gain: g, pan }); };
const clap = (t0) => { const f = new SVF(); voice(t0, 0.25, (t) => { const burst = [0, 0.011, 0.022].some((o) => t >= o && t < o + 0.006) ? 1 : Math.exp(-(t - 0.022) / 0.07) * (t > 0.022 ? 1 : 0); return f.run(noise(), 1500, 1.4).bp * burst; }, { gain: 0.5, send: 0.35 }); };
function bass(t0, freq, dur) {
  const a = new Saw(0.2), b = new Saw(0.7), f = new SVF();
  voice(t0, dur, (t) => { const env = Math.min(1, t / 0.003) * Math.min(1, (dur - t) / 0.02);
    const x = Math.tanh(1.8 * ((a.next(freq) + b.next(freq * 1.006)) * 0.5)) + Math.sin(2 * Math.PI * freq * t) * 0.4;
    return f.run(x, 300 + 2200 * Math.exp(-t / 0.05), 1.1).lp * env * duck(t0 + t); }, { gain: 0.28 });
}
function pad(t0, t1, freqs, { gain = 0.05, cut0 = 900, cut1 = 2400, rel = 0.4, send = 0.6, ducked = true } = {}) {
  const dur = t1 - t0 + rel;
  freqs.forEach((fq, j) => [-0.7, 0, 0.7].forEach((pan, k) => {
    const o = new Saw((j * 0.29 + k * 0.13) % 1), f = new SVF(), det = 1 + (k - 1) * 0.005;
    voice(t0, dur, (t) => { const env = Math.min(1, t / 0.25) * (t > t1 - t0 ? Math.max(0, 1 - (t - (t1 - t0)) / rel) : 1);
      return f.run(o.next(fq * det), cut0 + (cut1 - cut0) * Math.min(1, t / (t1 - t0)), 0.8).lp * env * (ducked ? duck(t0 + t) : 1); }, { pan, gain, send });
  }));
}
function pluck(t0, freq, pan) { const o = new Saw(0), f = new SVF();
  voice(t0, 0.35, (t) => f.run(o.next(freq), 400 + 5000 * Math.exp(-t / 0.04), 1.3).lp * Math.exp(-t / 0.11), { gain: 0.08, pan, send: 0.2, delay: 0.55 }); }
function impact(t0, size) { let ph = 0; const f = new SVF();
  voice(t0, 2.2, (t) => { ph += (30 + 55 * Math.exp(-t / 0.08)) / SR;
    return Math.tanh(1.5 * (Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.7) * 0.75 + f.run(noise(), 250 + 5000 * Math.exp(-t / 0.06), 0.7).lp * Math.exp(-t / 0.3))) * size; }, { gain: 0.7, send: 0.5 }); }
function whoosh(t0, dur, pan) { const f = new SVF();
  voice(t0, dur, (t, i) => { const x = t / dur, p = pan * (2 * x - 1);
    const v = f.run(noise(), 350 * Math.pow(18, x), 1.5).bp * Math.pow(Math.sin(Math.PI * Math.min(1, x * 1.1)), 2);
    dry.add(S(t0) + i, v * 0.6, p); verb.add(S(t0) + i, v * 0.3, -p); return 0; }); }
function riser(t0, dur) { const f = new SVF(); let ph = 0;
  voice(t0, dur, (t) => { const x = t / dur; ph += (180 * Math.pow(5, x)) / SR;
    return (f.run(noise(), 300 * Math.pow(30, x), 2).bp * 0.8 + Math.sin(2 * Math.PI * ph) * 0.15 * (0.6 + 0.4 * Math.sin(2 * Math.PI * (5 + 20 * x) * t))) * x * x; }, { gain: 0.55, send: 0.3 }); }
const key = (t0, i) => { const f = new SVF(); voice(t0, 0.05, (t) => f.run(noise(), 2400 + 1400 * ((i * 0.37) % 1), 2.5).bp * Math.exp(-t / 0.006) + Math.sin(2 * Math.PI * 520 * t) * Math.exp(-t / 0.008) * 0.3, { gain: 0.32, pan: ((i * 0.61) % 1) - 0.5, send: 0.1 }); };
const blip = (t0, fq, g = 1) => voice(t0, 0.2, (t) => (Math.sin(2 * Math.PI * fq * t) + 0.3 * Math.sin(4 * Math.PI * fq * t) * Math.exp(-t / 0.02)) * Math.min(1, t / 0.002) * Math.exp(-t / 0.06), { gain: 0.18 * g, send: 0.3, delay: 0.3 });
// A split-flap cascade: one clack per column, swept left to right, as the tiles turn.
function flaps(t0, lit, big) {
  for (let c = 0; c < COLS; c++) {
    const tc = t0 + (c / COLS) * T.wave + T.flip * 0.5, pan = (c / COLS) * 1.6 - 0.8; const f = new SVF();
    voice(tc, 0.04, (t) => f.run(noise(), 3000 + 1500 * ((c * 0.53) % 1), 3).bp * Math.exp(-t / 0.004) + Math.sin(2 * Math.PI * 320 * t) * Math.exp(-t / 0.006) * 0.4, { gain: big ? 0.3 : 0.2, pan, send: 0.15 });
  }
  if (lit) voice(t0 + 0.12, 1.2, (t) => (Math.sin(2 * Math.PI * 1174.7 * t) + 0.6 * Math.sin(2 * Math.PI * 1760 * t)) * Math.exp(-t / 0.35) * Math.min(1, t / 0.004), { gain: 0.06, send: 0.6, delay: 0.4 });
}
function braam(t0) {
  const notes = [36.71, 73.42, 110.0, 146.83], f = new SVF();
  const osc = notes.flatMap((fq) => [0.994, 1, 1.007].map((d) => ({ o: new Saw(fq * d % 1), fq: fq * d })));
  voice(t0, 3.6, (t) => {
    let x = 0; for (const v of osc) x += v.o.next(v.fq);
    const cut = 220 + 2600 * Math.min(1, t / 0.12) * Math.exp(-t / 0.9);
    return Math.tanh(1.6 * f.run(x / osc.length * 2.2, cut, 1.4).lp) * Math.min(1, t / 0.015) * Math.exp(-t / 1.8);
  }, { gain: 0.55, send: 0.6 });
  impact(t0, 1.0);
}

// ── Arrangement ──
voice(0, ACT.engines[0] + 0.2, (t) => (Math.sin(2 * Math.PI * 73.42 * t) * 0.6 + Math.sin(2 * Math.PI * 110 * t) * 0.25 + Math.sin(2 * Math.PI * 587.3 * t) * 0.04 * Math.sin(t * 2.1))
  * Math.min(1, t / 1.6) * (t > ACT.engines[0] ? Math.max(0, 1 - (t - ACT.engines[0]) / 0.2) : 1), { gain: 0.2, send: 0.4 });
for (let t = BAR; t < ACT.engines[0] - 0.01; t += BEAT) { let ph = 0; voice(t, 0.3, (u) => { ph += (55 + 60 * Math.exp(-u / 0.03)) / SR; return Math.sin(2 * Math.PI * ph) * Math.exp(-u / 0.18); }, { gain: 0.25 * (t - BAR) / BAR + 0.08 }); }

const CHORDS = [
  [ACT.engines[0], ACT.engines[0] + BAR, 36.71, [146.83, 174.61, 220.0, 293.66]],
  [ACT.engines[0] + BAR, ACT.clock[0], 58.27, [116.54, 174.61, 233.08, 293.66]],
  [ACT.clock[0], ACT.clock[0] + BAR, 43.65, [174.61, 220.0, 261.63, 349.23]],
  [ACT.clock[0] + BAR, T.gap[0], 65.41, [130.81, 196.0, 261.63, 329.63]],
];
for (const [a, b, root, notes] of CHORDS) {
  pad(a, b, notes, { rel: b >= T.gap[0] ? 0.03 : 0.3 });
  for (let t = a; t < b - 0.01; t += BEAT / 4) bass(t, root * 2, Math.min(BEAT / 4 - 0.008, b - t));
  if (a >= ACT.clock[0]) { let k = 0; for (let t = a; t < b - 0.01; t += BEAT / 4) pluck(t, notes[[0, 2, 1, 3, 2, 1, 3, 0][k % 8]] * 2, ((k++ % 4) - 1.5) * 0.35); }
}
for (const t of KICKS) kick(t);
for (const t of KICKS) hat(t + BEAT / 2, 0.15, 0.3, true);
for (let t = ACT.clock[0]; t < T.gap[0] - 0.01; t += BEAT / 4) hat(t, 0.07, -0.35);
for (let t = ACT.clock[0] + BEAT; t < T.gap[0]; t += 2 * BEAT) clap(t);
pad(ACT.film[0], 14.4, [146.83, 220, 329.63, 440, 659.26], { gain: 0.05, cut0: 600, cut1: 3500, rel: 0.6, send: 0.9, ducked: false });

for (const e of events()) {
  switch (e.type) {
    case 'key': key(e.t, e.i); break;
    case 'whoosh': whoosh(e.t, e.dur, e.pan); break;
    case 'impact': impact(e.t, e.size); break;
    case 'flaps': flaps(e.t, e.lit, e.big); break;
    case 'blip': blip(e.t, e.f, e.gain ?? 1); break;
    case 'riser': riser(e.t, e.dur); break;
    case 'braam': braam(e.t); break;
  }
}

// ── Mix ──
const wet = reverb(verb), dl = pingPong(echo, BEAT * 0.75);
const gate = (t) => (t < T.gap[0] || t >= T.gap[1] - 0.004 ? 1 : Math.max(0.1, 1 - (t - T.gap[0]) / 0.04));
const L = new Float32Array(N), R = new Float32Array(N), hl = new SVF(), hr = new SVF(), tl = new SVF(), tr = new SVF();
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = (t > T.fade[0] ? Math.max(0, 1 - (t - T.fade[0]) / (T.fade[1] - T.fade[0])) : 1) * gate(t);
  const l = hl.run(dry.L[i] + wet.L[i] * 2.2 + dl.L[i] * 2.4, 32).hp, r = hr.run(dry.R[i] + wet.R[i] * 2.2 + dl.R[i] * 2.4, 32).hp;
  L[i] = (l + 0.5 * tl.run(l, 2200).hp) * fade; R[i] = (r + 0.5 * tr.run(r, 2200).hp) * fade;
}
let peak = 0;
for (let i = 0; i < N; i++) { L[i] = Math.tanh(L[i] * 1.05); R[i] = Math.tanh(R[i] * 1.05); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
for (let i = 0; i < N; i++) { L[i] *= 0.8 / peak; R[i] *= 0.8 / peak; }
fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
writeWav(path.join(ROOT, 'out', 'score.wav'), L, R, fs);

// The envelope the 3D timeline draws: RMS per 1/30 s, gently compressed for the eye.
const win = SR / 30, env = [];
for (let i = 0; i < N; i += win) { let e = 0; for (let j = i; j < i + win && j < N; j++) e += (L[j] * L[j] + R[j] * R[j]) / 2; env.push(Math.sqrt(e / win)); }
const mx = Math.max(...env);
fs.writeFileSync(path.join(ROOT, 'src', 'envelope.json'), JSON.stringify(env.map((v) => +Math.pow(v / mx, 0.7).toFixed(3))));
console.log('wrote score.wav and envelope.json', env.length, 'bars; peak', peak.toFixed(3));
