// ONE SENTENCE — the soundtrack: hard rock in A minor, gang shouts and sound design, all on the picture's clock.
//   node audio/score.mjs            → out/score.wav
//   node audio/score.mjs --stats    → also prints each bus's level per section
import fs from 'node:fs';
import path from 'node:path';
import { SR, mtof, SVF, Saw, Bus, pluck, amp, compress, reverb, pingPong, writeWav } from './dsp.mjs';
import { createKit } from './kit.mjs';
import { createFx } from './fx.mjs';
import { DURATION, BEAT, bar, SEC, SHOUTS, SILENCE, events } from '../src/timeline.js';
import { drumHits, guitarNotes, bassNotes, LEAD, HARMONY, ANVILS } from '../src/music.js';
import { hash } from '../src/util.js';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const N = Math.round(DURATION * SR), TAU = Math.PI * 2;
const kit = createKit(N), fxPlay = createFx(kit), B = kit.B;
const clock = Date.now();

// ── Drums, metal and shouts ──
for (const h of drumHits()) kit[h.type](h.t + (h.type === 'crash' ? 0 : (hash(Math.round(h.t * 1000), 3) - 0.5) * 0.004), h.vel);
for (const t of ANVILS) kit.anvil(t, { f: 520, gain: 1.1, dec: 1.4, hall: 0.4 });
for (const s of SHOUTS) kit.shout(s.t, s.word, s.word === 'go' ? 3.4 : 1.6);

// ── Guitars: each part is a separate performance (its own pick noise and timing), then an amp ──
function perform(notes, seed, { jitter = 0.004, t60 = 2.6, bright = 0.62 } = {}) {
  const di = new Float32Array(N);
  notes.forEach((ev, j) => {
    const dt = (hash(j, seed) - 0.5) * 2 * jitter;
    ev.notes.forEach((m, s) => {
      const x = pluck(mtof(m), { dur: ev.dur, mute: ev.mute, vel: ev.vel * (0.9 + 0.1 * hash(j * 3 + s, seed)), seed: seed * 7919 + j * 31 + s, t60, bright });
      const a = Math.max(0, Math.round((ev.t + dt + s * 0.006) * SR));
      for (let i = 0; i < x.length && a + i < N; i++) di[a + i] += x[i];
    });
  });
  return di;
}
const notes = guitarNotes(), part = (k) => notes.filter((n) => n.part === k);
const tracks = [
  { di: perform(part('clean'), 11, { jitter: 0.002, t60: 3.5, bright: 0.75 }), amp: { drive: 1.4, tight: 70, lp: 7500, mid: 0.15, level: 0.5, bias: 0.02 }, pan: -0.2, gain: 0.55, echo: 0.4 },
  { di: perform(part('riff'), 21), amp: { drive: 22 }, pan: -0.72, gain: 1 },
  { di: perform(part('riff'), 37), amp: { drive: 22 }, pan: 0.72, gain: 0.5 },
  { di: perform(part('chords'), 53, { t60: 3.2 }), amp: { drive: 14, lp: 5200, level: 0.3 }, pan: 0.78, gain: 1 },
  { di: perform(part('chords'), 71, { t60: 3.2 }), amp: { drive: 14, lp: 5200, level: 0.3 }, pan: -0.78, gain: 0.55 },
];
const gtr = new Bus(N);
for (const tr of tracks) {
  amp(tr.di, tr.amp);
  const g = typeof tr.gain === 'function' ? tr.gain : () => tr.gain;
  for (let i = 0; i < N; i++) { const v = tr.di[i] * g(i / SR); gtr.add(i, v, tr.pan); if (tr.echo) B.echo.add(i, v * tr.echo, tr.pan); }
}

// ── Bass: a dark string through a little drive, with a clean sine under it for weight ──
const bdi = new Float32Array(N), sub = new Float32Array(N);
bassNotes().forEach((ev, j) => {
  const f = mtof(ev.m), a = Math.round(ev.t * SR);
  if (!ev.sub) { const x = pluck(f, { dur: ev.dur, t60: 2.4, bright: 0.35, vel: ev.vel, seed: 900 + j }); for (let i = 0; i < x.length && a + i < N; i++) bdi[a + i] += x[i]; }
  const n = Math.round((ev.dur + 0.03) * SR);
  for (let i = 0; i < n && a + i < N; i++) { const t = i / SR; sub[a + i] += Math.sin(TAU * f * t) * Math.min(1, t / 0.005, (ev.dur + 0.03 - t) / 0.03) * ev.vel; }
});
amp(bdi, { drive: 2.5, tight: 30, lp: 2300, presence: 900, pres: 0.5, level: 0.55, bias: 0.05, low: 30, mid: 0.3 });

// ── Lead: a picked note that blooms into a sustained, bent, vibrato tone ──
const ldi = new Float32Array(N);
for (const [b, beat, beats, m, g = 1] of [...LEAD, ...HARMONY.map((h) => [...h, 0.6])]) {
  const t0 = bar(b, beat), dur = beats * BEAT, f = mtof(m), a = Math.round(t0 * SR);
  const x = pluck(f, { dur, t60: 1.6, bright: 0.85, seed: m * 13 + b });
  const o = new Saw(0), rel = beats > 4 ? 3.5 : 0.06, n = Math.round((dur + rel) * SR);
  for (let i = 0; i < n && a + i < N; i++) {
    const t = i / SR, bend = t < 0.06 ? -0.6 * (1 - t / 0.06) : 0, vib = t > 0.25 ? 0.007 * Math.sin(TAU * 5.6 * t) * Math.min(1, (t - 0.25) / 0.3) : 0;
    const env = Math.min(1, t / 0.04) * (t > dur ? Math.max(0, 1 - (t - dur) / rel) : 1);
    ldi[a + i] += ((i < x.length ? x[i] * 0.7 : 0) + o.next(f * Math.pow(2, bend / 12) * (1 + vib)) * env * 0.3) * g;
  }
}
amp(ldi, { drive: 26, lp: 5800, presence: 2300, pres: 0.7, level: 0.2 });

// ── Sound design and footsteps ──
const fxEvents = [...events()];
for (let t = bar(SEC.world[0]); t < bar(SEC.world[0] + 4); t += BEAT) fxEvents.push({ t, type: 'step' });
fxEvents.forEach(fxPlay);

// ── Mix ──
const muffle = () => 20000;
// Dead stops for the shouts: 0 inside each window, a 6 ms ramp at its edges.
const gate = (t) => SILENCE.reduce((g, [a, b]) => g * Math.min(1, Math.max(0, Math.max(a - t, t - b) / 0.006)), 1);
const kicks = drumHits().filter((h) => h.type === 'k').map((h) => h.t);
const duck = new Float32Array(N);
for (const tk of kicks) { const a = Math.round(tk * SR); for (let i = 0; i < 0.25 * SR && a + i < N; i++) duck[a + i] = Math.max(duck[a + i], Math.exp(-i / SR / 0.08)); }

// The breakdown sits lower than the band around it.
const level = (t) => {
  if (t < bar(SEC.plan[0])) return 0.7;
  if (t < bar(SEC.make[0])) return 0.62 + 0.2 * Math.min(1, (t - bar(SEC.plan[0])) / (bar(SEC.make[0]) - bar(SEC.plan[0])));
  if (t >= bar(SEC.check[0]) && t < bar(SEC.check[1])) return 0.85;
  if (t >= bar(SEC.breath[0]) && t < bar(SEC.breath[1])) return 0.75;
  return 1;
};
const music = new Bus(N);
for (let i = 0; i < N; i++) {
  const d = (1 - 0.28 * duck[i]) * level(i / SR);
  music.L[i] = B.drums.L[i] * 1.15 * level(i / SR) + gtr.L[i] * d * 0.75 + (bdi[i] + sub[i] * 0.22) * d * 0.7 + ldi[i] * 0.55 + B.music.L[i];
  music.R[i] = B.drums.R[i] * 1.15 * level(i / SR) + gtr.R[i] * d * 0.75 + (bdi[i] + sub[i] * 0.22) * d * 0.7 + ldi[i] * 0.55 + B.music.R[i];
  B.echo.L[i] += ldi[i] * 0.3; B.echo.R[i] += ldi[i] * 0.3;
  B.hall.L[i] += gtr.L[i] * 0.05 + ldi[i] * 0.15; B.hall.R[i] += gtr.R[i] * 0.05 + ldi[i] * 0.15;
}
for (const bus of [music, B.room, B.hall]) {
  const fl = new SVF(), fr = new SVF(), f2l = new SVF(), f2r = new SVF();
  for (let i = 0; i < N; i++) { const fc = muffle(i / SR); if (fc < 19000) { bus.L[i] = f2l.run(fl.run(bus.L[i], fc, 0.7).lp, fc, 0.7).lp; bus.R[i] = f2r.run(fr.run(bus.R[i], fc, 0.7).lp, fc, 0.7).lp; } }
}
compress(B.drums.L, B.drums.R, { thr: -14, ratio: 4, att: 0.004, rel: 0.12 });
const room = reverb(B.room, { room: 0.62, damp: 0.45 }), hall = reverb(B.hall, { room: 0.86, damp: 0.3 });
const voxHall = reverb(B.voxHall, { room: 0.84, damp: 0.35 }), fxHall = reverb(B.fxHall, { room: 0.88, damp: 0.25 });
const echo = pingPong(B.echo, BEAT * 0.75, 0.32, 3200);
compress(B.vox.L, B.vox.R, { thr: -18, ratio: 3, att: 0.003, rel: 0.1, makeup: 3 });

const L = new Float32Array(N), R = new Float32Array(N);
const hl = new SVF(), hr = new SVF();
for (let i = 0; i < N; i++) {
  const t = i / SR, g = gate(t);
  const ml = (music.L[i] + room.L[i] * 1.6 + hall.L[i] * 1.8 + echo.L[i] * 1.2) * g, mr = (music.R[i] + room.R[i] * 1.6 + hall.R[i] * 1.8 + echo.R[i] * 1.2) * g;
  L[i] = hl.run(ml + B.vox.L[i] * 1.1 + voxHall.L[i] * 2.2 + B.fx.L[i] + fxHall.L[i] * 2, 28, 0.7).hp;
  R[i] = hr.run(mr + B.vox.R[i] * 1.1 + voxHall.R[i] * 2.2 + B.fx.R[i] + fxHall.R[i] * 2, 28, 0.7).hp;
}
compress(L, R, { thr: -12, ratio: 2.5, att: 0.01, rel: 0.15 });
// Soft-clip only the top of the peaks: scale so the loudest sample meets tanh at 1.4.
let pre = 1e-9;
for (let i = 0; i < N; i++) pre = Math.max(pre, Math.abs(L[i]), Math.abs(R[i]));
let peak = 1e-9;
for (let i = 0; i < N; i++) {
  const t = i / SR, f = Math.min(1, t / 0.01, (DURATION - t) / 1.5);
  L[i] = Math.tanh(L[i] * 1.4 / pre) * f; R[i] = Math.tanh(R[i] * 1.4 / pre) * f; peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
for (let i = 0; i < N; i++) { L[i] *= 0.89 / peak; R[i] *= 0.89 / peak; }
fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
writeWav(path.join(ROOT, 'out', 'score.wav'), L, R, fs);
console.log(`score.wav written in ${((Date.now() - clock) / 1000).toFixed(1)} s; peak before normalising ${peak.toFixed(3)}`);

if (process.argv.includes('--stats')) {
  const rms = (a, b, s, e) => { let q = 0; const i0 = Math.round(s * SR), i1 = Math.round(e * SR); for (let i = i0; i < i1; i++) q += a[i] * a[i] + b[i] * b[i]; return (10 * Math.log10(q / (2 * (i1 - i0)) + 1e-12)).toFixed(1); };
  const rows = { drums: B.drums, gtr, bass: { L: bdi, R: bdi }, lead: { L: ldi, R: ldi }, vox: B.vox, fx: B.fx, master: { L, R } };
  console.log('section'.padEnd(10) + Object.keys(rows).map((k) => k.padStart(8)).join(''));
  for (const [k, [a, b]] of Object.entries(SEC)) console.log(k.padEnd(10) + Object.values(rows).map((r) => rms(r.L, r.R, bar(a), bar(b)).padStart(8)).join(''));
}
