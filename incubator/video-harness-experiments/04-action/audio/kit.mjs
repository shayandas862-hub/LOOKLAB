// Drums, struck metal and a gang of shouting voices, each written straight into the mix buses.
import { SR, rng, SVF, Saw, Bus } from './dsp.mjs';
import { hash } from '../src/util.js';

const TAU = Math.PI * 2;
// Six square waves at inharmonic ratios: the classic drum-machine cymbal recipe.
const METAL = [205.3, 304.4, 369.6, 522.7, 540, 800];

export function createKit(N) {
  const B = {
    drums: new Bus(N), music: new Bus(N), vox: new Bus(N), fx: new Bus(N),
    room: new Bus(N), hall: new Bus(N), voxHall: new Bus(N), fxHall: new Bus(N), echo: new Bus(N),
  };
  const noise = rng(909);
  const S = (t) => Math.round(t * SR);
  function voice(bus, t0, dur, fn, { pan = 0, gain = 1, room = 0, hall = 0, echo = 0, hallBus = B.hall } = {}) {
    const a = S(t0), n = S(dur);
    for (let i = 0; i < n; i++) {
      const v = fn(i / SR, i) * gain;
      bus.add(a + i, v, pan);
      if (room) B.room.add(a + i, v * room, pan);
      if (hall) hallBus.add(a + i, v * hall, pan);
      if (echo) B.echo.add(a + i, v * echo, pan);
    }
  }
  const metal = (t, scale) => METAL.reduce((s, f) => s + (Math.sin(TAU * f * scale * t) > 0 ? 1 : -1), 0) / 6;

  const k = {
    B, voice, noise,
    k(t0, vel = 1) {
      let ph = 0; const cl = new SVF();
      voice(B.drums, t0, 0.5, (t) => {
        ph += (46 + 115 * Math.exp(-t / 0.026) + 22 * Math.exp(-t / 0.12)) / SR;
        const body = Math.sin(TAU * ph) * Math.exp(-t / 0.32) * Math.min(1, t / 0.0015);
        return Math.tanh(body * 1.6 + cl.run(noise(), 3800, 0.9).bp * Math.exp(-t / 0.004) * 0.9);
      }, { gain: 0.62 * vel, room: 0.04 });
    },
    s(t0, vel = 1) {
      let p1 = 0, p2 = 0; const n1 = new SVF(), n2 = new SVF();
      voice(B.drums, t0, 0.6, (t) => {
        p1 += (178 + 60 * Math.exp(-t / 0.008)) / SR; p2 += 335 / SR;
        const tone = Math.sin(TAU * p1) * Math.exp(-t / 0.075) + 0.45 * Math.sin(TAU * p2) * Math.exp(-t / 0.035);
        const wires = n2.run(n1.run(noise(), 7000, 0.6).lp, 1400, 0.7).hp * (Math.exp(-t / 0.17) + 0.6 * Math.exp(-t / 0.02));
        return Math.tanh((tone * 0.85 + wires * 1.5) * 1.4) * Math.min(1, t / 0.0008);
      }, { gain: 0.45 * vel, room: 0.3, hall: 0.06 });
    },
    h(t0, vel = 1, open = false) {
      const bp = new SVF(), hp = new SVF(), d = open ? 0.26 : 0.032;
      voice(B.drums, t0, open ? 0.6 : 0.12, (t) => {
        const x = metal(t, 1) * 0.7 + noise() * 0.3;
        return hp.run(bp.run(x, 10000, 1.2).bp, 7000, 0.7).hp * Math.exp(-t / d);
      }, { gain: 0.16 * vel, pan: 0.3, room: 0.05 });
    },
    oh(t0, vel) { k.h(t0, vel, true); },
    crash(t0, vel = 1) {
      const bp = new SVF(), hp = new SVF(), sc = 1 + 0.03 * hash(Math.round(t0 * 100), 4);
      voice(B.drums, t0, 2.8, (t) => {
        const x = metal(t, 1.6 * sc) * 0.55 + noise() * 0.45;
        return hp.run(bp.run(x, 6500, 0.5).bp, 3000, 0.7).hp * (Math.exp(-t / 1.25) + 1.4 * Math.exp(-t / 0.05)) * Math.min(1, t / 0.001);
      }, { gain: 0.24 * vel, pan: -0.25, hall: 0.12 });
    },
    tom(t0, vel, f) {
      let ph = 0; const lp = new SVF();
      voice(B.drums, t0, 0.6, (t) => {
        ph += f * (1 + 0.6 * Math.exp(-t / 0.04)) / SR;
        return Math.tanh(Math.sin(TAU * ph) * Math.exp(-t / 0.33) * 1.3 + lp.run(noise(), 2200, 0.7).lp * Math.exp(-t / 0.02) * 0.6);
      }, { gain: 0.42 * vel, pan: f > 130 ? 0.25 : f > 100 ? 0 : -0.25, room: 0.25 });
    },
    t1(t0, v) { k.tom(t0, v, 165); }, t2(t0, v) { k.tom(t0, v, 122); }, t3(t0, v) { k.tom(t0, v, 86); },
    clap(t0, vel = 1) {
      const f = new SVF();
      voice(B.drums, t0, 0.3, (t) => {
        const burst = [0, 0.009, 0.018, 0.026].some((o) => t >= o && t < o + 0.004) ? 1 : t > 0.026 ? Math.exp(-(t - 0.026) / 0.07) : 0;
        return f.run(noise(), 1300, 1.1).bp * burst;
      }, { gain: 0.38 * vel, room: 0.4, hall: 0.1 });
    },
    // Struck steel: free-bar partials, a click and a low thud.
    anvil(t0, { f = 520, gain = 1, dec = 1, pan = 0, hall = 0.25, bus = B.music } = {}) {
      const P = [[1, 1, 1.1], [2.76, 0.55, 0.55], [5.4, 0.32, 0.28], [8.93, 0.16, 0.14], [1.47, 0.35, 0.45], [3.91, 0.22, 0.2]];
      const cl = new SVF();
      voice(bus, t0, 2.2 * dec, (t) => {
        let v = 0; for (const [r, a, d] of P) v += a * Math.sin(TAU * f * r * t) * Math.exp(-t / (d * dec));
        return (v * 0.45 + cl.run(noise(), 4000, 0.7).hp * Math.exp(-t / 0.003) + Math.sin(TAU * 68 * t) * Math.exp(-t / 0.1) * 0.8) * Math.min(1, t / 0.0005);
      }, { gain: 0.32 * gain, pan, hall, room: 0.2 });
    },
  };

  // ── Voices: a small formant synthesiser. Each phoneme is a source (voice, breath, burst, hiss) and formants.
  const PH = {
    h: { kind: 'asp' }, e: { F: [640, 1860, 2650] }, i: { F: [400, 2200, 2900] }, ae: { F: [830, 1700, 2600] },
    k: { kind: 'stop', f: 2300 }, sh: { kind: 'fric', f: 2900 }, uh: { F: [620, 1220, 2550] }, n: { kind: 'nasal', F: [280, 1300, 2500] },
  };
  const WORDS = {
    hey: [['h', 0.06], ['e', 0.15, 1.0, 1.07], ['i', 0.13, 1.05, 0.84]],
    action: [['ae', 0.14, 1.07, 1.0], ['k', 0.07], ['sh', 0.12], ['uh', 0.06, 0.93, 0.9], ['n', 0.15, 0.88, 0.76]],
  };
  function speak(bus, t0, word, f0, { scale = 1, gain = 0.2, pan = 0, seed = 1 } = {}) {
    const segs = WORDS[word], total = segs.reduce((s, x) => s + x[1], 0), r = rng(seed);
    const fs = [new SVF(), new SVF(), new SVF(), new SVF()], fr = new SVF(), tilt = new SVF(), o = new Saw(hash(seed, 2));
    const starts = []; let acc = 0; for (const s of segs) { starts.push(acc); acc += s[1]; }
    const formantsOf = (j) => { const p = PH[segs[Math.min(j, segs.length - 1)][0]]; return p.F ?? (PH[segs[Math.min(j + 1, segs.length - 1)][0]].F ?? [600, 1500, 2600]); };
    voice(bus, t0, total + 0.05, (t) => {
      let j = segs.length - 1; while (j > 0 && t < starts[j]) j--;
      const [name, dur, p0 = 1, p1 = p0] = segs[j], x = Math.min(1, (t - starts[j]) / dur), ph = PH[name];
      // Glide formants into the next sound over the last 30 ms.
      const F0 = formantsOf(j), F1 = formantsOf(j + 1), blend = Math.max(0, 1 - (starts[j] + dur - t) / 0.03);
      const F = F0.map((f, q) => (f + (F1[q] - f) * blend * 0.7) * scale);
      const pitch = f0 * (p0 + (p1 - p0) * x) * (1 + 0.012 * Math.sin(TAU * 5.5 * t));
      const glott = tilt.run(o.next(pitch), 2600, 0.6).lp, breath = r();
      let src = 0, amp = 1;
      switch (ph.kind) {
        case 'asp': src = breath * 0.9; amp = 0.55 * x; break;
        case 'stop': { const burst = x > 0.62; src = burst ? fr.run(breath, ph.f * scale, 1.6).bp * 3 : 0; amp = burst ? Math.exp(-(x - 0.62) * 8) : 0; break; }
        case 'fric': return fr.run(breath, ph.f * scale, 1.3).bp * 0.6 * Math.sin(Math.PI * x);
        case 'nasal': src = glott * 0.9 + breath * 0.05; amp = 0.5 * (1 - 0.6 * x); break;
        default: src = glott + breath * 0.18; amp = Math.min(1, x * 6);
      }
      if (j === segs.length - 1) amp *= Math.min(1, (1 - x) * 5);
      let out = 0; F.forEach((fm, q) => { out += fs[q].run(src, fm, [6, 11, 13][q]).bp * [1, 0.6, 0.32][q]; });
      out += fs[3].run(src, 3500 * scale, 8).bp * 0.15;
      return Math.tanh(out * amp * 2.2);
    }, { gain, pan, room: 0.3, hall: 0.45, hallBus: B.voxHall });
  }
  // A gang of ten, slightly out of time and tune, spread across the stereo field.
  k.shout = (t0, word, loud = 1) => {
    const n = 10;
    for (let v = 0; v < n; v++) {
      const f0 = 150 + 85 * hash(v, 11), scale = 0.9 + 0.2 * hash(v, 12), dt = v === 0 ? 0 : (hash(v, 13) - 0.35) * 0.05;
      speak(B.vox, t0 + dt, word, f0, { scale, gain: (v === 0 ? 0.3 : 0.15) * loud, pan: v === 0 ? 0 : (hash(v, 14) * 2 - 1) * 0.8, seed: 100 + v + Math.round(t0) * 17 });
    }
  };
  return k;
}
