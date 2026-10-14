// Sound kit: a tuned Karplus–Strong string, a two-stage amp with a speaker-cabinet filter, a bus compressor,
// a TPT state-variable filter, Freeverb and a ping-pong delay. Deterministic: noise comes from seeded PRNGs.
export const SR = 48000;
export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

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
  mix(src, gain = 1, pan = 0, at = 0) { for (let i = 0; i < src.length; i++) this.add(at + i, src[i] * gain, pan); }
}

// A plucked string. The loop holds a one-pole damping filter and an allpass for the fractional delay; both
// delays are subtracted so the note is in tune. Palm-muting is heavy damping and a short decay.
export function pluck(f, { dur, t60 = 3, bright = 0.6, vel = 1, seed = 1, pick = 0.17, mute = false, rel = 0.02 }) {
  const n = Math.ceil((dur + rel) * SR) + 1, out = new Float32Array(n);
  const b = mute ? 0.72 : 0.12 + (1 - bright) * 0.4, w = 2 * Math.PI * f / SR;
  const lpDelay = Math.atan2(b * Math.sin(w), 1 - b * Math.cos(w)) / w;
  const lpMag = (1 - b) / Math.sqrt(1 - 2 * b * Math.cos(w) + b * b);
  const P = SR / f - lpDelay, N = Math.max(2, Math.floor(P - 0.3)), d = P - N, c = (1 - d) / (1 + d);
  const g = Math.min(0.99995, Math.pow(0.001, 1 / (f * (mute ? 0.11 : t60))) / lpMag);
  const line = new Float32Array(N), r = rng(seed), ex = new SVF(), cut = (mute ? 900 : 1800) + 5200 * vel;
  for (let i = 0; i < N; i++) line[i] = ex.run(r(), cut, 0.6).lp;
  const pk = Math.max(1, Math.round(pick * N)), raw = Float32Array.from(line);
  let m = 1e-9;
  for (let i = 0; i < N; i++) { line[i] = raw[i] - (i >= pk ? raw[i - pk] : 0); m = Math.max(m, Math.abs(line[i])); }
  for (let i = 0; i < N; i++) line[i] *= (0.8 * vel) / m;
  const end = Math.round(dur * SR), relN = Math.max(1, Math.round(rel * SR));
  let idx = 0, s = 0, ax = 0, ay = 0;
  for (let i = 0; i < n; i++) {
    const y = line[idx];
    s = (1 - b) * y + b * s;
    const ap = c * s + ax - c * ay; ax = s; ay = ap;
    line[idx] = ap * g; idx = idx + 1 === N ? 0 : idx + 1;
    out[i] = i > end ? y * Math.max(0, 1 - (i - end) / relN) : y;
  }
  return out;
}

// Two gain stages, then a speaker cabinet: steep low-pass, a presence peak, low cut. In place.
export function amp(x, { drive = 18, tight = 120, lp = 4800, presence = 1900, pres = 0.5, level = 0.25, bias = 0.12, low = 85, mid = 0.8 } = {}) {
  const h1 = new SVF(), m1 = new SVF(), h2 = new SVF(), c1 = new SVF(), c2 = new SVF(), c3 = new SVF(), pk = new SVF();
  const tb = Math.tanh(bias);
  for (let i = 0; i < x.length; i++) {
    let v = h1.run(x[i], tight, 0.7).hp;
    v += m1.run(v, 750, 0.8).bp * mid;
    v = Math.tanh(v * drive + bias) - tb;
    v = h2.run(v, 70, 0.7).hp;
    v = Math.tanh(v * 2.5);
    v = c1.run(v, lp, 0.75).lp; v = c2.run(v, lp * 1.15, 0.6).lp;
    v = c3.run(v, low, 0.7).hp;
    v += pk.run(v, presence, 1.1).bp * pres;
    x[i] = v * level;
  }
  return x;
}

// Feed-forward compressor on a stereo pair, linked. thr in dB.
export function compress(L, R, { thr = -16, ratio = 3, att = 0.008, rel = 0.15, makeup = 0, knee = 6 } = {}) {
  const ga = Math.exp(-1 / (att * SR)), gr = Math.exp(-1 / (rel * SR)), mk = Math.pow(10, makeup / 20);
  let env = 0;
  for (let i = 0; i < L.length; i++) {
    const x = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    env = x > env ? ga * env + (1 - ga) * x : gr * env + (1 - gr) * x;
    const db = 20 * Math.log10(env + 1e-9), over = db - thr;
    const red = over <= -knee / 2 ? 0 : over >= knee / 2 ? over * (1 - 1 / ratio) : ((over + knee / 2) ** 2 / (2 * knee)) * (1 - 1 / ratio);
    const g = Math.pow(10, -red / 20) * mk;
    L[i] *= g; R[i] *= g;
  }
}

// Freeverb: 8 parallel damped combs into 4 series allpasses, per channel.
export function reverb(bus, { room = 0.86, damp = 0.25, spread = 23, input = 0.015 } = {}) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => Math.round(d * SR / 44100));
  const aps = [556, 441, 341, 225].map((d) => Math.round(d * SR / 44100));
  const out = new Bus(bus.L.length);
  for (const [src, dst, off] of [[bus.L, out.L, 0], [bus.R, out.R, spread]]) {
    const cb = combs.map((d) => ({ b: new Float32Array(d + off), i: 0, f: 0 }));
    const ab = aps.map((d) => ({ b: new Float32Array(d + off), i: 0 }));
    for (let n = 0; n < src.length; n++) {
      const x = src[n] * input;
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
