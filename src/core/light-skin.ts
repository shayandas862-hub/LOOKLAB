// The light fit's objective since the Blender baseline (D-LL-035). v0.2's renderer and its search stay; what
// changes is what a candidate light is scored on: only the bare skin of the face (the renderer's own skin
// mask), as a brightness pattern normalised by its own mean, so the wall, hair and clothes do not count and
// neither skin tone nor exposure moves the direction. Direction, fill and softness come from that pattern;
// intensity and kelvin are matched afterwards, on the mean brightness and on the colour of the lit skin.
// No DOM, no Node (AD-LL-009).
import type { Pixels } from './image.ts';
import { clamp, lumD, renderScene, type LightParams } from './light-render.ts';
import { KNOBS } from './light-fit.ts';
import { ASSUMED, checkFaceBox, FACE_REGION, FIT_H, FIT_W, resampleWindow, type FaceBox, type FaceFit } from './light-face.ts';

/** The renderer's bare skin for ASSUMED, as pixel indices of the 40 × 50 fit frame. */
export const SKIN_MASK: number[] = (() => {
  const head = renderScene(ASSUMED, FIT_W, FIT_H, 0).head, out: number[] = [];
  for (let i = 0; i < head.length; i++) if (head[i]) out.push(i);
  return out;
})();

export type Pattern = 'linear' | 'log';
export type Mapping = 'hairline' | 'eyes';
export interface SkinOptions { pattern: Pattern; mapping: Mapping }
/** Chosen on the dev set by lowest median direction error, among the four (D-LL-035). */
export const DEFAULT_OPTIONS: SkinOptions = { pattern: 'linear', mapping: 'eyes' };

/** Brightness of each skin pixel (display value to the 2.2, about linear), over its mean; or its log, less the mean. */
function patternOf(rgb: ArrayLike<number>, kind: Pattern): Float64Array {
  const n = SKIN_MASK.length, y = new Float64Array(n);
  let m = 0;
  for (let k = 0; k < n; k++) {
    const i = SKIN_MASK[k] * 3, v = Math.pow(lumD(rgb[i], rgb[i + 1], rgb[i + 2]), 2.2);
    y[k] = kind === 'log' ? Math.log(v + 1e-3) : v;
    m += y[k];
  }
  m /= n;
  for (let k = 0; k < n; k++) y[k] = kind === 'log' ? y[k] - m : y[k] / (m || 1);
  return y;
}

/** The renderer's eye line (0.16 of its head's vertical radius above centre), as a row of the fit frame. */
export const EYE_ROW = (((-0.14 + 0.8 * -0.16) / (FIT_H / FIT_W)) + 1) / 2 * FIT_H;
/** Where the eyes sit in a face box drawn hairline to chin: the anthropometric average. */
export const EYE_AT = 0.36;

/**
 * Where the renderer's face should sit for a drawn box. `hairline`: the box's top and bottom are the renderer's
 * hairline and chin. `eyes`: the renderer's eye line at EYE_AT of the box from its top, its chin at the bottom.
 */
export function windowFor(box: FaceBox, mapping: Mapping): FaceBox {
  if (mapping === 'hairline') return box;
  const eyeY = box.y + EYE_AT * box.h, chinY = box.y + box.h, perRow = (chinY - eyeY) / (FACE_REGION.y1 - EYE_ROW);
  const h = (FACE_REGION.y1 - FACE_REGION.y0) * perRow;
  return { x: box.x, w: box.w, y: chinY - h, h };
}

/** Mean display colour of the brightest 30% of the skin: [luma, r/g, b/g]. */
function litColour(rgb: ArrayLike<number>): [number, number, number] {
  const px = SKIN_MASK.map((i) => [rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]]);
  px.sort((a, b) => lumD(b[0], b[1], b[2]) - lumD(a[0], a[1], a[2]));
  const top = px.slice(0, Math.ceil(px.length * 0.3));
  const s = top.reduce((t, c) => [t[0] + c[0], t[1] + c[1], t[2] + c[2]], [0, 0, 0]);
  return [lumD(s[0], s[1], s[2]) / top.length, s[0] / (s[1] || 1e-6), s[2] / (s[1] || 1e-6)];
}
function meanLuma(rgb: ArrayLike<number>): number {
  let s = 0;
  for (const i of SKIN_MASK) s += lumD(rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]);
  return s / SKIN_MASK.length;
}

const D2R = Math.PI / 180;
const angle = (a: LightParams, b: { az: number; el: number }) => {
  const v = (az: number, el: number) => [Math.sin(az * D2R) * Math.cos(el * D2R), Math.sin(el * D2R), Math.cos(az * D2R) * Math.cos(el * D2R)];
  const p = v(a.az, a.el), q = v(b.az, b.el);
  return Math.acos(clamp(p[0] * q[0] + p[1] * q[1] + p[2] * q[2], -1, 1)) / D2R;
};

export interface SkinFit extends FaceFit {
  /** 0–100: how much better the chosen direction explains the skin than the best direction 45° or more away. */
  score: number;
  /** Confidence candidates, relative to the residual: the az profile's sharpness and the basin gap (D-LL-036 chose the gap). */
  diag: { sharp: number; gap: number };
}

const DESCENT = KNOBS.filter((k) => k.k === 'az' || k.k === 'el' || k.k === 'soft' || k.k === 'fill');

/** Fits the light to the face in a frame by its skin pattern. `base` holds the camera and set (ASSUMED). */
export function fitSkin(px: Pixels, box: FaceBox, base: LightParams = ASSUMED, opt: SkinOptions = DEFAULT_OPTIONS): SkinFit {
  checkFaceBox(px, box);
  const crop = resampleWindow(px, windowFor(box, opt.mapping));
  const want = patternOf(crop, opt.pattern);
  const E = (q: LightParams) => {
    const got = patternOf(renderScene(q, FIT_W, FIT_H, 0).rgb, opt.pattern);
    let s = 0;
    for (let k = 0; k < got.length; k++) s += Math.abs(got[k] - want[k]);
    return s / got.length;
  };
  // Coarse sweep over direction and fill; every cell is kept for the basin gap.
  const cells: { q: LightParams; e: number }[] = [];
  let p = base, cur = Infinity, steps = 1;
  for (let az = -150; az <= 150; az += 15) for (const el of [0, 15, 30, 45, 60, 75]) for (const fill of [0.5, 1.5, 2.5, 3.5]) {
    const q = { ...base, az, el, fill }, e = E(q);
    cells.push({ q, e });
    if (e < cur) { cur = e; p = q; }
  }
  // v0.2's descent (best single knob move, halve every step when none helps), on direction, softness and fill.
  const step = Object.fromEntries(DESCENT.map((k) => [k.k, k.s0])) as Record<string, number>;
  for (let iter = 0; iter < 90; iter++, steps++) {
    let best: LightParams | null = null, bestE = cur;
    for (const kn of DESCENT) for (const d of [-1, 1]) {
      const q = { ...p, [kn.k]: clamp(p[kn.k] + d * step[kn.k], kn.lo, kn.hi) };
      if (q[kn.k] === p[kn.k]) continue;
      const e = E(q);
      if (e < bestE - 1e-9) { bestE = e; best = q; }
    }
    if (best && cur - bestE > 1e-6) { p = best; cur = bestE; continue; }
    let allMin = true;
    for (const kn of DESCENT) { step[kn.k] = Math.max(kn.min, step[kn.k] / 2); if (step[kn.k] > kn.min * 1.001) allMin = false; }
    if (allMin) break;
  }
  // Intensity to the skin's mean brightness, then kelvin to the lit skin's colour (assuming the renderer's skin).
  const wantMean = meanLuma(crop);
  let int = 1, ie = Infinity;
  for (let v = 0.2; v <= 2.2 + 1e-9; v += 0.05) {
    const e = Math.abs(meanLuma(renderScene({ ...p, int: v }, FIT_W, FIT_H, 0).rgb) - wantMean);
    if (e < ie) { ie = e; int = Math.round(v * 100) / 100; }
  }
  const wc = litColour(crop);
  let kel = 5600, ke = Infinity;
  for (let k = 2800; k <= 7000; k += 50) {
    const c = litColour(renderScene({ ...p, int, kel: k }, FIT_W, FIT_H, 0).rgb);
    const e = Math.abs(Math.log(c[1] / wc[1])) + Math.abs(Math.log(c[2] / wc[2]));
    if (e < ke) { ke = e; kel = k; }
  }
  p = { ...p, int, kel };
  // Confidence candidates (D-LL-036 picks one by its rank correlation with error on the dev set).
  const floor = Math.max(cur, 1e-6);
  const sharp = (Math.min(E({ ...p, az: p.az + 30 }), E({ ...p, az: p.az - 30 })) - cur) / floor;
  const far = cells.filter((c) => angle(c.q, p) >= 45).reduce((m, c) => Math.min(m, c.e), Infinity);
  const gap = Number.isFinite(far) ? (far - cur) / floor : 0;
  const score = Math.round(100 * gap / (gap + 1));
  const { az, el, soft, fill } = p;
  return { light: { az, el, soft, int, kel, fill }, err: cur, steps, logs: [], crop, score, diag: { sharp, gap } };
}
