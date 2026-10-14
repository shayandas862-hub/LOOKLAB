// Small DSP kit: oscillators, a TPT state-variable filter, a Freeverb-style
// reverb and a ping-pong delay. Deterministic: noise comes from a seeded PRNG.
export const SR = 48000;

export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 * 2 - 1; };
}

export class SVF {
  constructor() { this.ic1 = 0; this.ic2 = 0; this.lp = 0; this.bp = 0; this.hp = 0; }
  run(x, fc, q = 0.707) {
    const g = Math.tan(Math.PI * Math.min(fc, SR * 0.45) / SR), k = 1 / q;
    const a1 = 1 / (1 + g * (g + k)), a2 = g * a1, a3 = g * a2;
    const v3 = x - this.ic2, v1 = a1 * this.ic1 + a2 * v3, v2 = this.ic2 + a2 * this.ic1 + a3 * v3;
    this.ic1 = 2 * v1 - this.ic1; this.ic2 = 2 * v2 - this.ic2;
    this.lp = v2; this.bp = v1; this.hp = x - k * v1 - v2;
    return this;
  }
}

function blep(t, dt) {
  if (t < dt) { t /= dt; return t + t - t * t - 1; }
  if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
  return 0;
}
export class Saw {
  constructor(phase = 0) { this.p = phase; }
  next(f) { const dt = f / SR; this.p += dt; if (this.p >= 1) this.p -= 1; return 2 * this.p - 1 - blep(this.p, dt); }
}

export class Bus {
  constructor(n) { this.L = new Float32Array(n); this.R = new Float32Array(n); }
  add(i, v, pan = 0) {
    if (i < 0 || i >= this.L.length) return;
    const a = ((pan + 1) * Math.PI) / 4;
    this.L[i] += v * Math.cos(a); this.R[i] += v * Math.sin(a);
  }
}

// Freeverb: 8 parallel damped combs into 4 series allpasses, per channel.
export function reverb(bus, { room = 0.86, damp = 0.25, spread = 23 } = {}) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => Math.round(d * SR / 44100));
  const aps = [556, 441, 341, 225].map((d) => Math.round(d * SR / 44100));
  const out = new Bus(bus.L.length);
  for (const [src, dst, off] of [[bus.L, out.L, 0], [bus.R, out.R, spread]]) {
    const cb = combs.map((d) => ({ b: new Float32Array(d + off), i: 0, f: 0 }));
    const ab = aps.map((d) => ({ b: new Float32Array(d + off), i: 0 }));
    for (let n = 0; n < src.length; n++) {
      const x = src[n] * 0.015;
      let y = 0;
      for (const c of cb) {
        const o = c.b[c.i]; c.f = o * (1 - damp) + c.f * damp;
        c.b[c.i] = x + c.f * room; c.i = (c.i + 1) % c.b.length; y += o;
      }
      for (const a of ab) { const o = a.b[a.i]; a.b[a.i] = y + o * 0.5; a.i = (a.i + 1) % a.b.length; y = o - y; }
      dst[n] = y;
    }
  }
  return out;
}

export function pingPong(bus, time, fb = 0.38, tone = 3500) {
  const d = Math.round(time * SR), out = new Bus(bus.L.length);
  const bl = new Float32Array(d), br = new Float32Array(d), fl = new SVF(), fr = new SVF();
  for (let n = 0, i = 0; n < bus.L.length; n++, i = (i + 1) % d) {
    const yl = bl[i], yr = br[i];
    bl[i] = fl.run(bus.L[n] * 0.5 + bus.R[n] * 0.5 + yr * fb, tone).lp;
    br[i] = fr.run(yl * fb, tone).lp;
    out.L[n] = yl; out.R[n] = yr;
  }
  return out;
}

export function writeWav(file, L, R, fs) {
  const n = L.length, buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  const d = rng(77);
  for (let i = 0; i < n; i++) {
    const q = (v) => Math.max(-32768, Math.min(32767, Math.round(v * 32767 + (d() + d()) * 0.5)));
    buf.writeInt16LE(q(L[i]), 44 + i * 4); buf.writeInt16LE(q(R[i]), 46 + i * 4);
  }
  fs.writeFileSync(file, buf);
}
