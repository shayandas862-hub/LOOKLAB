// The light fit, ported from v0.2 (reference/v0.2/src/base.html, CORE block) without change to its maths:
// a first guess from the skin's left/right and top/bottom balance, a coarse sweep over azimuth × elevation,
// then coordinate descent on six knobs with halving steps, scoring each candidate by the mean absolute
// difference between its render and the reference. It explains pixels with its own renderer
// (light-render.ts), so it inherits that renderer's assumptions (D-LL-033). No DOM, no Node (AD-LL-009).
import { clamp, lumD, renderScene, type LightParams } from './light-render.ts';

/** The camera and set the fit holds fixed, plus a neutral light it starts from. */
export type FitBase = LightParams;
/** A decision-log line from the fit, as v0.2 wrote it (tier, rule, text). */
export interface FitLog { tier: 'T0'; rule: string; text: string }
export interface FitStep { done: boolean; p: LightParams; err: number; logs: FitLog[] }
export interface FitResult extends FitStep { steps: number }

/** Box-filter downsample of an RGB float image by an integer factor f (w and h divisible by f). */
export function downsample(src: Float32Array, w: number, h: number, f: number): Float32Array {
  const ow = w / f, oh = h / f, out = new Float32Array(ow * oh * 3), inv = 1 / (f * f);
  for (let j = 0; j < oh; j++) for (let i = 0; i < ow; i++) {
    let r = 0, g = 0, b = 0;
    for (let y = 0; y < f; y++) for (let x = 0; x < f; x++) {
      const o = ((j * f + y) * w + i * f + x) * 3;
      r += src[o]; g += src[o + 1]; b += src[o + 2];
    }
    const q = (j * ow + i) * 3;
    out[q] = r * inv; out[q + 1] = g * inv; out[q + 2] = b * inv;
  }
  return out;
}

/** Mean absolute difference over every channel of every pixel. */
export function errFn(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s / a.length;
}

type Knob = 'az' | 'el' | 'int' | 'soft' | 'kel' | 'fill';
export const KNOBS: { k: Knob; lo: number; hi: number; s0: number; min: number; name: string; u: string }[] = [
  { k: 'az', lo: -170, hi: 170, s0: 20, min: 1.5, name: 'key azimuth', u: '°' },
  { k: 'el', lo: -10, hi: 80, s0: 12, min: 1.5, name: 'key elevation', u: '°' },
  { k: 'int', lo: 0.2, hi: 2.2, s0: 0.3, min: 0.02, name: 'key intensity', u: '' },
  { k: 'soft', lo: 0, hi: 1, s0: 0.25, min: 0.03, name: 'softness', u: '' },
  { k: 'kel', lo: 2800, hi: 7000, s0: 700, min: 60, name: 'colour temp', u: ' K' },
  { k: 'fill', lo: 0, hi: 3.5, s0: 0.5, min: 0.06, name: 'fill ratio', u: ' stops' },
];

/** First guess from the reference's skin, inside the face mask the renderer draws for `base`. */
export function measureInit(ref: Float32Array, w: number, h: number, base: FitBase) {
  const m = renderScene({ ...base, az: 0, el: 20, soft: .5, int: 1, kel: 5600, fill: 1 }, w, h, 0).head;
  let sx = 0, sy = 0, n = 0;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (m[j * w + i]) { sx += i; sy += j; n++; }
  if (!n) return { az: 0, el: 25, fill: 1.5, int: 1, soft: .5, kel: 5000, note: 'no face found, using defaults' };
  const cx = sx / n, cy = sy / n;
  let sl = 0, nl = 0, sr = 0, nr = 0, st = 0, nt = 0, sb = 0, nb = 0;
  const ls: number[] = [];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (m[j * w + i]) {
    const o = (j * w + i) * 3, y = Math.pow(lumD(ref[o], ref[o + 1], ref[o + 2]), 2.2);
    ls.push(y);
    if (i < cx) { sl += y; nl++; } else { sr += y; nr++; }
    if (j < cy) { st += y; nt++; } else { sb += y; nb++; }
  }
  const mL = sl / (nl || 1), mR = sr / (nr || 1), mT = st / (nt || 1), mB = sb / (nb || 1);
  ls.sort((a, b) => a - b);
  const p10 = ls[Math.floor(ls.length * 0.1)], p90 = ls[Math.floor(ls.length * 0.9)];
  const lr = (mR - mL) / ((mR + mL) || 1), tb = (mT - mB) / ((mT + mB) || 1);
  const az = clamp(lr * 95, -150, 150), el = clamp(22 + 70 * tb, 0, 70), fill = clamp(0.55 * Math.log2(p90 / Math.max(p10, 0.002)), 0.3, 3.2);
  return { az, el, fill, int: 1, soft: .5, kel: 5000, lr, tb, ratio: p90 / Math.max(p10, 0.002) };
}

/** The fit as a stepper: each step() does one stage (first guess, coarse sweep, one descent iteration). */
export function createFit(ref: Float32Array, w: number, h: number, base: FitBase) {
  const E = (q: LightParams) => errFn(renderScene(q, w, h, 0).rgb, ref);
  let stage = 0, p: LightParams = base, cur = Infinity, iter = 0;
  const steps = {} as Record<Knob, number>;
  KNOBS.forEach((k) => (steps[k.k] = k.s0));
  return {
    step(): FitStep {
      const logs: FitLog[] = [];
      if (stage === 0) {
        const m = measureInit(ref, w, h, base);
        const lr = 'lr' in m ? m.lr : undefined, tb = 'tb' in m ? m.tb : undefined;
        p = { ...base, az: m.az, el: m.el, fill: m.fill, int: m.int, soft: m.soft, kel: m.kel };
        cur = E(p);
        logs.push({ tier: 'T0', rule: 'R4', text: `skin split L/R ${lr !== undefined && lr >= 0 ? '+' : ''}${(lr || 0).toFixed(2)}, top/bottom ${(tb || 0) >= 0 ? '+' : ''}${(tb || 0).toFixed(2)} → first guess az ${Math.round(m.az)}°, el ${Math.round(m.el)}°, fill 1:${Math.pow(2, m.fill).toFixed(1)}` });
        stage = 1;
        return { done: false, p: { ...p }, err: cur, logs };
      }
      if (stage === 1) {
        let bestE = cur, best: LightParams | null = null, n = 0;
        for (let az = -150; az <= 150; az += 30) for (const el of [5, 25, 45, 65]) {
          n++;
          const q = { ...p, az, el };
          const e = E(q);
          if (e < bestE) { bestE = e; best = q; }
        }
        if (best) { p = best; cur = bestE; }
        logs.push({ tier: 'T0', rule: 'R6', text: `coarse sweep, ${n} renders over azimuth × elevation → best az ${Math.round(p.az)}°, el ${Math.round(p.el)}° · residual ${cur.toFixed(3)}` });
        stage = 2;
        return { done: false, p: { ...p }, err: cur, logs };
      }
      let best: { kn: (typeof KNOBS)[number]; d: number; q: LightParams } | null = null, bestE = cur;
      for (const kn of KNOBS) for (const d of [-1, 1]) {
        const q = { ...p };
        q[kn.k] = clamp(p[kn.k] + d * steps[kn.k], kn.lo, kn.hi);
        if (q[kn.k] === p[kn.k]) continue;
        const e = E(q);
        if (e < bestE - 1e-9) { bestE = e; best = { kn, d, q }; }
      }
      iter++;
      let done = false;
      if (best && cur - bestE > 3e-5) {
        if (cur - bestE > 0.0008) logs.push({ tier: 'T0', rule: 'R7', text: `iter ${String(iter).padStart(2, '0')} · next knob: ${best.kn.name} ${best.d > 0 ? '+' : '−'}${best.kn.k === 'kel' ? Math.round(steps[best.kn.k]) : +steps[best.kn.k].toFixed(2)}${best.kn.u} · residual ${cur.toFixed(3)} → ${bestE.toFixed(3)}` });
        p = best.q;
        cur = bestE;
      } else {
        let allMin = true;
        for (const kn of KNOBS) {
          steps[kn.k] = Math.max(kn.min, steps[kn.k] / 2);
          if (steps[kn.k] > kn.min * 1.001) allMin = false;
        }
        logs.push({ tier: 'T0', rule: 'R7', text: `iter ${String(iter).padStart(2, '0')} · no knob improves → step sizes halved` });
        if (allMin) done = true;
      }
      if (iter >= 90) done = true;
      return { done, p: { ...p }, err: cur, logs };
    },
  };
}

/** Runs createFit to the end (at most maxSteps steps) and gathers its log. */
export function runFit(ref: Float32Array, w: number, h: number, base: FitBase, maxSteps = 400): FitResult {
  const f = createFit(ref, w, h, base);
  const logs: FitLog[] = [];
  let r: FitStep, n = 0;
  do {
    r = f.step();
    logs.push(...r.logs);
    n++;
  } while (!r.done && n < maxSteps);
  return { ...r, logs, steps: n };
}
