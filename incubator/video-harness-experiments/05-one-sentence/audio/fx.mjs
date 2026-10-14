// Sound design for the picture: keys, shattering chrome, rising blocks, camera parts, the light, the products,
// the checker. Every effect is a function of time written into the fx bus.
import { SR, SVF, Saw, mtof } from './dsp.mjs';
import { hash } from '../src/util.js';

const TAU = Math.PI * 2;

export function createFx(kit) {
  const { B, voice, noise } = kit;
  const fx = (t0, dur, fn, o = {}) => voice(B.fx, t0, dur, fn, { hallBus: B.fxHall, ...o });
  const ping = (t0, f, dec, gain, pan = 0, hall = 0.4) => fx(t0, dec * 5, (t) => (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t / (dec * 0.3))) * Math.exp(-t / dec) * Math.min(1, t / 0.0005), { gain, pan, hall });
  const whoosh = (t0, dur, gain = 0.3) => { const f = new SVF(); fx(t0, dur, (t) => { const x = t / dur; return f.run(noise(), 350 * Math.pow(14, x), 1.3).bp * Math.pow(Math.sin(Math.PI * x), 2); }, { gain, hall: 0.25 }); };
  const crashInto = (len) => { const a = new Float32Array(Math.round(len * SR)), bp = new SVF(), hp = new SVF();
    for (let i = 0; i < a.length; i++) { const t = i / SR; a[i] = hp.run(bp.run(noise(), 6000, 0.5).bp, 2500, 0.7).hp * Math.exp(-t / 0.9); } return a; };

  const E = {
    key(e) {
      const f = new SVF();
      if (e.space) fx(e.t, 0.08, (t) => f.run(noise(), 700, 1).bp * Math.exp(-t / 0.018) + Math.sin(TAU * 210 * t) * Math.exp(-t / 0.02) * 0.4, { gain: 0.3, pan: 0.1 });
      else fx(e.t, 0.05, (t) => f.run(noise(), 3200, 0.8).hp * Math.exp(-t / 0.005) + Math.sin(TAU * (1500 + 300 * hash(e.i, 2)) * t) * Math.exp(-t / 0.008) * 0.3, { gain: 0.26, pan: (hash(e.i, 3) - 0.5) * 0.4, room: 0.1 });
    },
    shatter(e) {
      const c = new SVF(), h = new SVF();
      fx(e.t, 0.5, (t) => c.run(noise(), 3000, 1.2).bp * Math.exp(-t / 0.012) * 2 + h.run(noise(), 1500, 0.7).hp * Math.exp(-t / 0.06), { gain: 0.5, hall: 0.3 });
      for (let i = 0; i < 40; i++) ping(e.t + 0.45 * hash(i, 5) ** 2, 2500 + 7000 * hash(i, 6), 0.04 + 0.3 * hash(i, 7), 0.05, hash(i, 8) * 1.6 - 0.8, 0.5);
      kit.anvil(e.t, { f: 880, gain: 0.7, dec: 0.6, bus: B.fx });
    },
    tink(e) { ping(e.t, 3000 + 3500 * hash(e.i, 9), 0.18, 0.06, hash(e.i, 10) * 1.4 - 0.7, 0.6); },
    sub(e) {
      let ph = 0; const len = e.big ? 1.4 : 0.8;
      fx(e.t, len, (t) => { ph += e.f * (1 - 0.45 * Math.min(1, t / len)) / SR; return Math.tanh(Math.sin(TAU * ph) * 1.5) * Math.exp(-t / (len * 0.45)) * Math.min(1, t / 0.004); }, { gain: e.big ? 0.55 : 0.35 });
    },
    pencil(e) {
      const f = new SVF();
      fx(e.t, e.dur, (t) => f.run(noise(), 3600 + 600 * Math.sin(t * 9), 1.4).bp * (0.4 + 0.6 * Math.abs(Math.sin(TAU * 2.6 * t))) * Math.min(1, t / 0.2, (e.dur - t) / 0.2), { gain: 0.22, pan: 0.2 });
    },
    reverse(e) {
      const a = crashInto(e.dur), n = a.length, at = Math.round(e.t * SR);
      for (let i = 0; i < n; i++) { const v = a[n - 1 - i] * Math.pow(i / n, 1.5) * 0.5; B.fx.add(at + i, v, -0.2); B.fxHall.add(at + i, v * 0.3, 0.2); }
    },
    thoom(e) {
      let ph = 0; const g = new SVF();
      fx(e.t, 0.5, (t) => { ph += (52 + e.i * 4) * (1 + 0.8 * Math.exp(-t / 0.03)) / SR; return Math.sin(TAU * ph) * Math.exp(-t / 0.16) + g.run(noise(), 900, 0.8).bp * Math.exp(-t / 0.12) * 0.5; }, { gain: 0.32, pan: (e.i % 2 ? 0.3 : -0.3), room: 0.2 });
    },
    whoosh(e) { whoosh(e.t, e.dur); },
    clank(e) { kit.anvil(e.t, { f: [1180, 960, 1320, 840, 1500, 1100, 900, 1250, 700, 640][e.i % 10], gain: 0.8, dec: 0.22, pan: (hash(e.i, 15) - 0.5) * 0.8, bus: B.fx }); },
    servo(e) { const o = new Saw(0), f = new SVF(); fx(e.t, e.dur, (t) => f.run(o.next(180 + 160 * t / e.dur), 1300, 3).bp * Math.sin(Math.PI * t / e.dur), { gain: 0.1, pan: 0.3 }); },
    switch(e) {
      const c = new SVF(), z = new SVF();
      fx(e.t, 2.5, (t) => Math.sin(TAU * 58 * t) * Math.exp(-t / 0.14) * 1.2 + c.run(noise(), 2500, 0.7).hp * Math.exp(-t / 0.004) * 1.5
        + (Math.sin(TAU * 100 * t) + 0.5 * Math.sin(TAU * 200 * t) + 0.25 * Math.sin(TAU * 300 * t)) * 0.12 * Math.min(1, t / 0.05) * Math.exp(-t / 0.9)
        + z.run(noise(), 7000, 0.7).hp * 0.15 * Math.exp(-t / 0.4), { gain: 0.5, hall: 0.4 });
      kit.anvil(e.t, { f: 190, gain: 0.8, dec: 0.5, bus: B.fx });
    },
    inflate(e) {
      let ph = 0; const f = new SVF();
      fx(e.t - 0.3, 0.45, (t) => { const x = t / 0.35; ph += (90 + 380 * Math.min(1, x) ** 2) / SR; return f.run(Math.sin(TAU * ph) + 0.4 * Math.sin(TAU * ph * 2), 700 + 1500 * x, 2).lp * Math.min(1, t / 0.05) * (x > 1 ? Math.exp(-(t - 0.35) / 0.03) : 1); }, { gain: 0.45, hall: 0.2 });
    },
    stomp(e) { const f = new SVF(); fx(e.t, 0.4, (t) => Math.sin(TAU * 68 * t) * Math.exp(-t / 0.1) + f.run(noise(), 450, 0.8).lp * Math.exp(-t / 0.03), { gain: 0.55, hall: 0.25 }); },
    riser(e) {
      const f = new SVF(), o = new Saw(0), lf = new SVF();
      fx(e.t, e.dur, (t) => { const x = t / e.dur; return f.run(noise(), 300 * Math.pow(25, x), 2).bp * x * x * 0.8 + lf.run(o.next(mtof(52 + 12 * x)), 900 + 4000 * x, 0.8).lp * 0.12 * x; }, { gain: 0.4, hall: 0.4 });
    },
    sting(e) {
      const t0 = e.t + 0.03, f = new SVF();
      switch (e.i) {
        case 0: { let ph = 0; fx(t0, 0.6, (t) => { ph += (700 + 260 * Math.sin(TAU * 3 * t)) / SR; return Math.sin(TAU * ph) * Math.exp(-t / 0.25); }, { gain: 0.07, hall: 0.4 }); break; }
        case 1: fx(t0, 1.0, (t) => f.run(noise(), 500 + 500 * Math.sin(Math.PI * t), 1.5).bp * Math.sin(Math.PI * t), { gain: 0.25 }); break;
        case 2: for (let i = 0; i < 12; i++) { let ph = 0; const d = 0.05 + 0.04 * hash(i, 20); fx(t0 + 0.6 * hash(i, 21), d, (t) => { ph += (300 + 1500 * t / d) / SR; return Math.sin(TAU * ph) * Math.sin(Math.PI * t / d); }, { gain: 0.08, pan: hash(i, 22) - 0.5, hall: 0.3 }); } break;
        case 3: fx(t0, 1.0, (t) => f.run(noise(), 2400 - 1000 * t, 2).bp * Math.sin(Math.PI * t), { gain: 0.2, pan: -0.3 }); break;
        case 4: { let ph = 0; fx(t0, 0.3, (t) => { ph += (2200 * Math.exp(-t / 0.08) + 150) / SR; return Math.sin(TAU * ph + 3 * Math.sin(TAU * 90 * t)) * Math.exp(-t / 0.12); }, { gain: 0.12, hall: 0.3 }); break; }
        case 5: fx(t0, 0.2, (t) => f.run(noise(), 1100, 1).bp * Math.exp(-t / 0.03) * 1.5 + Math.sin(TAU * 140 * t) * Math.exp(-t / 0.05), { gain: 0.3 }); break;
        case 6: [0, 0.045].forEach((o) => { const g = new SVF(); fx(t0 + o, 0.05, (t) => g.run(noise(), 2800, 0.8).bp * Math.exp(-t / 0.006), { gain: 0.4 }); }); break;
        case 7: for (let i = 0; i < 6; i++) { const fq = 800 + 1600 * hash(i, 23); fx(t0 + i * 0.06, 0.03, (t) => (Math.sin(TAU * fq * t) > 0 ? 1 : -1) * 0.5, { gain: 0.08, pan: hash(i, 24) - 0.5 }); } break;
      }
    },
    freeze(e) { const f = new SVF(); fx(e.t, 0.5, (t) => f.run(noise(), 5000 * Math.exp(-t / 0.15) + 300, 2).bp * Math.exp(-t / 0.2), { gain: 0.3, hall: 0.5 }); ping(e.t, 2637, 0.4, 0.05, 0, 0.6); },
    spread(e) { whoosh(e.t, e.dur, 0.25); for (let i = 0; i < 6; i++) ping(e.t + i * 0.18, mtof([76, 79, 83, 86, 88, 91][i]), 0.3, 0.035, i % 2 ? 0.5 : -0.5, 0.6); },
    blip(e) { ping(e.t, mtof([76, 79, 83][e.i]), 0.12, 0.09, [-0.4, 0, 0.4][e.i], 0.3); },
    fall(e) { let ph = 0; fx(e.t, e.dur, (t) => { const x = t / e.dur; ph += (1700 - 900 * x) / SR; return Math.sin(TAU * ph) * 0.4 * x * (1 + 0.3 * Math.sin(TAU * 7 * t)); }, { gain: 0.06, hall: 0.6 }); },
    plip(e) { let ph = 0; fx(e.t, 0.3, (t) => { ph += (500 + 1100 * Math.min(1, t / 0.03)) / SR; return Math.sin(TAU * ph) * Math.exp(-t / 0.05); }, { gain: 0.35, hall: 0.6 }); },
    shimmer(e) { for (let i = 0; i < 18; i++) ping(e.t + (i / 18) * e.dur * 0.85, mtof([76, 79, 83, 86, 88, 91][(i * 7) % 6] + (i % 3 === 0 ? 12 : 0)), 0.3, 0.03 * (1 - i / 24), Math.sin(i * 1.7) * 0.7, 0.8); },
    cap(e) { kit.anvil(e.t, { f: 2400, gain: 0.5, dec: 0.08, bus: B.fx }); const f = new SVF(); fx(e.t, 0.1, (t) => f.run(noise(), 4000, 0.8).hp * Math.exp(-t / 0.004) + Math.sin(TAU * 210 * t) * Math.exp(-t / 0.03), { gain: 0.45 }); },
    spray(e) { const f = new SVF(); fx(e.t, 0.7, (t) => f.run(noise(), 3500, 0.6).hp * Math.min(1, t / 0.015) * Math.exp(-Math.max(0, t - 0.25) / 0.12), { gain: 0.3, pan: 0.2, hall: 0.2 }); },
    silk(e) { const f = new SVF(); fx(e.t, 0.5, (t) => { const x = t / 0.5; return f.run(noise(), 300 * Math.pow(18, x), 1.5).bp * Math.sin(Math.PI * x) * (0.6 + 0.4 * Math.sin(TAU * 26 * t)); }, { gain: 0.5, hall: 0.2 }); },
    flash(e) {
      let ph = 0; const f = new SVF(), pan = hash(e.i, 30) * 1.6 - 0.8;
      fx(e.t, 0.12, (t) => f.run(noise(), 5000, 0.7).hp * Math.exp(-t / 0.004) + (ph += (3200 - 1600 * t / 0.12) / SR, Math.sin(TAU * ph)) * 0.15 * Math.exp(-t / 0.04), { gain: 0.18, pan, room: 0.1 });
    },
    tick(e) { ping(e.t, 2349, e.quiet ? 0.15 : 0.45, e.quiet ? 0.035 : 0.12, 0, 0.5); if (!e.quiet) ping(e.t + 0.07, 3136, 0.4, 0.08, 0, 0.5); },
    alarm(e) { [0, 0.18].forEach((o) => fx(e.t + o, 0.13, (t) => (Math.sin(TAU * 1760 * t) + 0.6 * Math.sin(TAU * 2637 * t)) * Math.min(1, t / 0.004, (0.13 - t) / 0.01), { gain: 0.12, hall: 0.3 })); },
    rewind(e) { const f = new SVF(); let ph = 0; fx(e.t, e.dur, (t) => { const x = t / e.dur; ph += (300 + 900 * x + 120 * Math.sin(TAU * 9 * t)) / SR; return f.run(noise(), 900 + 700 * Math.sin(TAU * 7 * t) + 2000 * x, 2.5).bp * 0.7 + Math.sin(TAU * ph) * 0.15; }, { gain: 0.3 }); },
    zip(e) { const f = new SVF(); fx(e.t, 0.35, (t) => f.run(noise(), 500 * Math.pow(16, t / 0.35), 2).bp * Math.sin(Math.PI * t / 0.35), { gain: 0.35, hall: 0.2 }); },
    portal(e) { const f = new SVF(); fx(e.t, e.dur, (t) => { const x = t / e.dur; return (Math.sin(TAU * 42 * t) + 0.5 * Math.sin(TAU * 84 * t)) * x * 0.6 + f.run(noise(), 200 + 2500 * x * x, 0.8).lp * x * 0.4; }, { gain: 0.35, hall: 0.5 }); },
    chime(e) { kit.anvil(e.t, { f: 1046.5, gain: 0.5, dec: 2.2, hall: 0.6, bus: B.fx }); ping(e.t + 0.02, 1318.5, 1.2, 0.05, 0.3, 0.8); },
    step(e) { const f = new SVF(); fx(e.t, 0.15, (t) => Math.sin(TAU * 85 * t) * Math.exp(-t / 0.05) + f.run(noise(), 600, 0.8).lp * Math.exp(-t / 0.02), { gain: 0.16, pan: 0.1 }); },
  };
  return (e) => E[e.type]?.(e);
}
