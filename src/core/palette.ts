// The palette instrument (D-LL-024): k-means in CIELAB with fixed k-means++ seeding, so the same frame
// always gives the same palette; samples median-filtered 3 × 3; near-duplicates merged by CIEDE2000;
// slivers under 1% folded into their nearest swatch's share. Letterbox bars are left out (D-LL-029). No DOM, no Node (AD-LL-009).
import { deltaE2000, labToHex, rgbToLab, type Lab } from './colour.ts';
import { eachPixel, findActiveArea, stepFor, type Pixels } from './image.ts';

export const PALETTE = {
  /** Most swatches a frame can yield (before merging). */
  K: 8,
  /** Clusters closer than this CIEDE2000 difference are one colour to the eye at palette scale. */
  MERGE_DE: 5,
  /** A cluster under this share (%) is folded into its nearest swatch's share; its colour is not reported. */
  MIN_SHARE: 1,
  /** Pixels sampled on a regular grid; 65,536 covers a 512 × 128 active picture at full density. */
  MAX_SAMPLES: 65_536,
  MAX_ITERATIONS: 40,
  SEED: 0x5eed1234,
} as const;

export interface Swatch {
  hex: string;
  lab: Lab;
  /** Share of the active picture, in percent, one decimal. */
  share: number;
  /** A pixel of this swatch's cluster near the cluster's middle, as a fraction of the frame (0–1). */
  at: { x: number; y: number };
}

export interface PaletteResult {
  swatches: Swatch[];
  /** Pixels the clustering used. */
  samples: number;
}

/** mulberry32: small, fast and the same on every JavaScript engine. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Cluster {
  lab: Lab;
  count: number;
  /** Count after small clusters were folded in (what the share reports). */
  shareCount: number;
  members: number[];
}

/** Median of the first m values (m ≤ 9): insertion sort in place, no allocation per pixel. */
function median(v: Uint8Array, m: number): number {
  for (let i = 1; i < m; i++) {
    const x = v[i];
    let j = i - 1;
    for (; j >= 0 && v[j] > x; j--) v[j + 1] = v[j];
    v[j + 1] = x;
  }
  return m % 2 ? v[(m - 1) / 2] : Math.round((v[m / 2 - 1] + v[m / 2]) / 2);
}

const round = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

export function measurePalette(px: Pixels): PaletteResult {
  const area = findActiveArea(px);
  const step = stepFor(area, PALETTE.MAX_SAMPLES);

  // Sample the active picture on a grid; convert each distinct colour to Lab once.
  const Ls: number[] = [];
  const As: number[] = [];
  const Bs: number[] = [];
  const Xs: number[] = [];
  const Ys: number[] = [];
  const cache = new Map<number, Lab>();
  const d = px.data;
  const w = px.width;
  const R = new Uint8Array(9);
  const G = new Uint8Array(9);
  const B = new Uint8Array(9);
  eachPixel(px, area, step, (_i, x, y) => {
    // Each sample is the per-channel median of its 3 × 3 neighbourhood inside the picture: noise would
    // otherwise split one flat colour into several clusters, and a median, unlike a mean, invents no
    // blended colours along edges (D-LL-024).
    let m = 0;
    for (let yy = Math.max(area.y0, y - 1); yy <= Math.min(area.y1 - 1, y + 1); yy++)
      for (let xx = Math.max(area.x0, x - 1); xx <= Math.min(area.x1 - 1, x + 1); xx++) {
        const k = (yy * w + xx) * 4;
        R[m] = d[k];
        G[m] = d[k + 1];
        B[m] = d[k + 2];
        m++;
      }
    const r = median(R, m);
    const g = median(G, m);
    const b = median(B, m);
    const key = (r << 16) | (g << 8) | b;
    let lab = cache.get(key);
    if (!lab) {
      lab = rgbToLab(r, g, b);
      cache.set(key, lab);
    }
    Ls.push(lab[0]);
    As.push(lab[1]);
    Bs.push(lab[2]);
    Xs.push(x);
    Ys.push(y);
  });
  const n = Ls.length;
  const d2 = (j: number, c: Lab) => (Ls[j] - c[0]) ** 2 + (As[j] - c[1]) ** 2 + (Bs[j] - c[2]) ** 2;

  // k-means++ seeding with a fixed PRNG. Stops early when every pixel already sits on a centre.
  const rand = prng(PALETTE.SEED);
  const centres: Lab[] = [];
  const first = Math.floor(rand() * n);
  centres.push([Ls[first], As[first], Bs[first]]);
  const nearest = new Float64Array(n).fill(Infinity);
  while (centres.length < PALETTE.K) {
    const c = centres[centres.length - 1];
    let total = 0;
    for (let j = 0; j < n; j++) {
      const d = d2(j, c);
      if (d < nearest[j]) nearest[j] = d;
      total += nearest[j];
    }
    if (total === 0) break;
    let pick = rand() * total;
    let j = 0;
    for (; j < n - 1; j++) {
      pick -= nearest[j];
      if (pick <= 0) break;
    }
    centres.push([Ls[j], As[j], Bs[j]]);
  }

  // Lloyd iterations (Euclidean distance in Lab).
  const assign = new Int32Array(n).fill(-1);
  for (let it = 0; it < PALETTE.MAX_ITERATIONS; it++) {
    let changed = 0;
    for (let j = 0; j < n; j++) {
      let best = 0;
      let bestD = Infinity;
      for (let k = 0; k < centres.length; k++) {
        const d = d2(j, centres[k]);
        if (d < bestD) {
          bestD = d;
          best = k;
        }
      }
      if (assign[j] !== best) {
        assign[j] = best;
        changed++;
      }
    }
    const sum = centres.map(() => [0, 0, 0, 0]);
    for (let j = 0; j < n; j++) {
      const s = sum[assign[j]];
      s[0] += Ls[j];
      s[1] += As[j];
      s[2] += Bs[j];
      s[3]++;
    }
    sum.forEach((s, k) => {
      if (s[3] > 0) centres[k] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]];
    });
    if (changed === 0) break;
  }

  let clusters: Cluster[] = centres.map((lab) => ({ lab, count: 0, shareCount: 0, members: [] }));
  for (let j = 0; j < n; j++) {
    clusters[assign[j]].count++;
    clusters[assign[j]].members.push(j);
  }
  clusters = clusters.filter((c) => c.count > 0);

  // Merge near-duplicates, closest pair first, into their pixel-weighted mean.
  for (;;) {
    let bi = -1;
    let bj = -1;
    let bd: number = PALETTE.MERGE_DE;
    for (let i = 0; i < clusters.length; i++)
      for (let j = i + 1; j < clusters.length; j++) {
        const d = deltaE2000(clusters[i].lab, clusters[j].lab);
        if (d < bd) {
          bd = d;
          bi = i;
          bj = j;
        }
      }
    if (bi < 0) break;
    const a = clusters[bi];
    const b = clusters[bj];
    const count = a.count + b.count;
    a.lab = [0, 1, 2].map((k) => (a.lab[k] * a.count + b.lab[k] * b.count) / count) as Lab;
    a.count = count;
    a.members = a.members.concat(b.members);
    clusters.splice(bj, 1);
  }

  // Fold slivers into the nearest remaining swatch's share, smallest first.
  for (const c of clusters) c.shareCount = c.count;
  clusters.sort((a, b) => a.count - b.count);
  const minCount = (PALETTE.MIN_SHARE / 100) * n;
  while (clusters.length > 1 && clusters[0].shareCount < minCount) {
    const small = clusters.shift()!;
    let target = clusters[0];
    for (const c of clusters) if (deltaE2000(c.lab, small.lab) < deltaE2000(target.lab, small.lab)) target = c;
    target.shareCount += small.shareCount;
  }

  const swatches = clusters
    .map((c): Swatch => {
      let mx = 0;
      let my = 0;
      for (const j of c.members) {
        mx += Xs[j];
        my += Ys[j];
      }
      mx /= c.members.length;
      my /= c.members.length;
      let pick = c.members[0];
      let pd = Infinity;
      for (const j of c.members) {
        const d = (Xs[j] - mx) ** 2 + (Ys[j] - my) ** 2;
        if (d < pd) {
          pd = d;
          pick = j;
        }
      }
      return {
        hex: labToHex(c.lab),
        lab: [round(c.lab[0], 2), round(c.lab[1], 2), round(c.lab[2], 2)],
        share: round((100 * c.shareCount) / n, 1),
        at: { x: round((Xs[pick] + 0.5) / px.width, 4), y: round((Ys[pick] + 0.5) / px.height, 4) },
      };
    })
    .sort((a, b) => b.share - a.share || a.lab[0] - b.lab[0]);

  return { swatches, samples: n };
}
