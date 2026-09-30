// Shot-cut detection (D-LL-026): each sampled frame becomes a colour histogram; a cut is a
// frame-to-frame distance that stands well above its neighbours' (an adaptive threshold), so a slow
// fade or dissolve, whose steps all look alike, is not a cut. No DOM, no Node (AD-LL-009).
import { eachPixel, stepFor, type Pixels } from './image.ts';

export const CUTS = {
  /** Bins per RGB channel: 8 × 8 × 8 = 512, filled with trilinear weights so noise does not flip bins. */
  BINS: 8,
  /** Neighbouring distances on each side that set the local level. */
  WINDOW: 2,
  /** A cut's distance is at least this many times the local level… */
  RATIO: 3,
  /** …and at least this large (0 = same histogram, 1 = no colour in common). */
  MIN_DISTANCE: 0.12,
  MAX_SAMPLES: 16_384,
} as const;

/** A normalised 512-bin colour histogram of the whole frame. */
export function frameSignature(px: Pixels): Float32Array {
  const B = CUTS.BINS;
  const hist = new Float32Array(B * B * B);
  const area = { x0: 0, y0: 0, x1: px.width, y1: px.height };
  const pos = (v: number) => Math.min(Math.max((v * B) / 256 - 0.5, 0), B - 1);
  let total = 0;
  eachPixel(px, area, stepFor(area, CUTS.MAX_SAMPLES), (i) => {
    const pr = pos(px.data[i]);
    const pg = pos(px.data[i + 1]);
    const pb = pos(px.data[i + 2]);
    const r0 = Math.floor(pr);
    const g0 = Math.floor(pg);
    const b0 = Math.floor(pb);
    const fr = pr - r0;
    const fg = pg - g0;
    const fb = pb - b0;
    for (let dr = 0; dr < 2; dr++) {
      const wr = dr ? fr : 1 - fr;
      if (!wr) continue;
      for (let dg = 0; dg < 2; dg++) {
        const wg = dg ? fg : 1 - fg;
        if (!wg) continue;
        for (let db = 0; db < 2; db++) {
          const wb = db ? fb : 1 - fb;
          if (!wb) continue;
          hist[((r0 + dr) * B + (g0 + dg)) * B + (b0 + db)] += wr * wg * wb;
        }
      }
    }
    total++;
  });
  for (let k = 0; k < hist.length; k++) hist[k] /= total;
  return hist;
}

/** Half the L1 distance between two normalised histograms: 0 identical, 1 disjoint. */
export function histDistance(a: Float32Array, b: Float32Array): number {
  let s = 0;
  for (let k = 0; k < a.length; k++) s += Math.abs(a[k] - b[k]);
  return s / 2;
}

/** Indices i where a cut falls between frame i − 1 and frame i. */
export function detectCuts(signatures: Float32Array[]): number[] {
  const n = signatures.length;
  const d = new Float64Array(n);
  for (let i = 1; i < n; i++) d[i] = histDistance(signatures[i - 1], signatures[i]);
  const cuts: number[] = [];
  for (let i = 1; i < n; i++) {
    if (d[i] < CUTS.MIN_DISTANCE) continue;
    let sum = 0;
    let count = 0;
    for (let j = i - CUTS.WINDOW; j <= i + CUTS.WINDOW; j++) {
      if (j === i || j < 1 || j >= n) continue;
      sum += d[j];
      count++;
    }
    const level = count ? sum / count : 0;
    if (d[i] >= CUTS.RATIO * level) cuts.push(i);
  }
  return cuts;
}

export interface DetectedShot {
  first: number;
  last: number;
  in_s: number;
  out_s: number;
  /** The middle sampled frame: the one the breakdown measures by default. */
  key_frame: number;
}

export function shotsFromCuts(frameCount: number, cuts: number[], fps: number): DetectedShot[] {
  const starts = [0, ...cuts.filter((c) => c > 0 && c < frameCount)];
  const t = (i: number) => (fps > 0 ? i / fps : 0);
  return starts.map((first, k) => {
    const last = (starts[k + 1] ?? frameCount) - 1;
    return { first, last, in_s: t(first), out_s: t(last + 1), key_frame: Math.round((first + last) / 2) };
  });
}
