// The look-match statistic, ported from v0.2 (reference/v0.2/src/scene.js, cheekStats and statsFrom) without
// change to its maths: brightness, lit:shadow ratio and warmth measured on the cheek windows only. Whole-face
// statistics fail because painted eyes and brows dominate them (D-LL-007). No DOM, no Node (AD-LL-009).
import { lumD, type LightParams } from './light-render.ts';

export interface CheekStats {
  /** 90th and 10th percentile luma of the cheek pixels (display values). */
  y90: number;
  y10: number;
  /** Lit over shadow in linear light: (y90 / y10)^2.2, with a floor on the shadow. */
  ratio: number;
  /** Warmth: mean red over blue of the brightest fifth of the cheek pixels. */
  rb: number;
}

/** Statistics of [luma, red/blue] samples; null under 6 samples. */
export function statsFrom(a: [number, number][]): CheekStats | null {
  if (a.length < 6) return null;
  a.sort((x, y) => x[0] - y[0]);
  const n = a.length, p10 = a[Math.floor(n * .1)][0], p90 = a[Math.floor(n * .9)][0];
  let rb = 0, c = 0;
  for (let k = Math.floor(n * .8); k < n; k++) { rb += a[k][1]; c++; }
  return { y90: p90, y10: p10, ratio: Math.pow(p90, 2.2) / Math.max(Math.pow(p10, 2.2), .002), rb: rb / c };
}

/** Cheek windows of the renderer's head for this camera (|x| 0.25–0.65 and y 0.15–0.55 of the head's radii). */
export function cheekStats(rgb: Float32Array, w: number, h: number, base: Pick<LightParams, 'lens' | 'tilt'>): CheekStats | null {
  const sc = base.lens / 85, rx = .62 * sc, ry = .80 * sc, cy = -.14 + base.tilt * .05, a: [number, number][] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const px = (x + .5) / w * 2 - 1, py = ((y + .5) / h * 2 - 1) * (h / w), ex = Math.abs(px / rx), ey = (py - cy) / ry;
    if (ex >= .25 && ex <= .65 && ey >= .15 && ey <= .55) {
      const o = (y * w + x) * 3;
      a.push([lumD(rgb[o], rgb[o + 1], rgb[o + 2]), rgb[o] / Math.max(rgb[o + 2], .02)]);
    }
  }
  return statsFrom(a);
}
