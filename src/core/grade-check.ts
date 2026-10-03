// The grade check (P4.5, P-LL-001 §4.6): a still from a test shoot or a grade against its reference, measured with
// the same instruments (palette, contrast, saturation, tints; active picture only, D-LL-029). Palettes are matched
// one-to-one by the Hungarian method on ΔE00, so a colour the still has lost cannot hide behind a near neighbour.
// Verdicts use the proposals of docs/validation.md §5.4, versioned. DOM-free and Node-free (AD-LL-009).
import { deltaE2000, type Lab } from './colour.ts';
import type { Pixels } from './image.ts';
import { measurePalette } from './palette.ts';
import { measureContrast, measureSaturation, measureTints } from './stats.ts';

/** pass up to the first number, close up to the second, far beyond (validation.md §5.4). Proposals until §9 runs. */
export const THRESHOLDS = {
  version: 1,
  swatch: [3, 6],
  palette: [3, 6],
  share: [3, 6],
  contrast: [1 / 3, 2 / 3],
  saturation: [3, 6],
  tint: [2, 4],
  /** A reference swatch with no partner in the still reads far at this share (%) or more; below it, it is listed. */
  missing_far_share: 3,
} as const;

export type Verdict = 'pass' | 'close' | 'far' | 'listed';
type AB = { a: number; b: number } | null;

export interface FrameMeasure {
  palette: { hex: string; lab: Lab; share: number }[];
  contrast_stops: number;
  saturation_pct: number;
  tints: { shadow: AB; mid: AB; highlight: AB };
}

export interface SwatchRow {
  ref_hex: string;
  ref_share: number;
  still_hex: string | null;
  still_share: number | null;
  de00: number | null;
  /** still − reference, in points of share. */
  share_diff: number | null;
  verdict: Verdict;
  note?: string;
}

export interface MeasureRow {
  measure: string;
  ref: number | AB;
  still: number | AB;
  /** still − reference (a distance for the palette and the tints). null when it cannot be taken. */
  diff: number | null;
  unit: string;
  verdict: Verdict;
  note?: string;
}

export interface GradeCheckResult {
  thresholds_version: number;
  swatches: SwatchRow[];
  extra: { hex: string; share: number; note: 'extra in still' }[];
  rows: MeasureRow[];
}

const EPS = 1e-12;

export function verdictOf(x: number, [pass, close]: readonly [number, number]): Verdict {
  const a = Math.abs(x);
  return a <= pass + EPS ? 'pass' : a <= close + EPS ? 'close' : 'far';
}

const worse = (a: Verdict, b: Verdict): Verdict => (['far', 'close', 'pass'].find((v) => v === a || v === b) as Verdict) ?? a;

/**
 * Least-total-cost one-to-one assignment (Hungarian method, O(n²m)). Returns, for each row, its column or −1 when the
 * row is left over (more rows than columns). Deterministic: ties go to the lowest index.
 */
export function assign(cost: number[][]): number[] {
  const n = cost.length;
  const m = n ? cost[0].length : 0;
  if (n === 0 || m === 0) return new Array(n).fill(-1);
  if (n > m) {
    const t = assign(cost[0].map((_, j) => cost.map((row) => row[j])));
    const out = new Array(n).fill(-1);
    t.forEach((i, j) => i >= 0 && (out[i] = j));
    return out;
  }
  const u = new Array(n + 1).fill(0), v = new Array(m + 1).fill(0), p = new Array(m + 1).fill(0), way = new Array(m + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    p[0] = i;
    let j0 = 0;
    const minv = new Array(m + 1).fill(Infinity);
    const used = new Array(m + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= m; j++) {
        if (used[j]) continue;
        const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
        if (cur < minv[j]) { minv[j] = cur; way[j] = j0; }
        if (minv[j] < delta) { delta = minv[j]; j1 = j; }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) { u[p[j]] += delta; v[j] -= delta; } else minv[j] -= delta;
      }
      j0 = j1;
    } while (p[j0] !== 0);
    do { const j1 = way[j0]; p[j0] = p[j1]; j0 = j1; } while (j0);
  }
  const out = new Array(n).fill(-1);
  for (let j = 1; j <= m; j++) if (p[j]) out[p[j] - 1] = j - 1;
  return out;
}

/** The measures a grade check compares, from a frame's pixels: the same instruments as a breakdown. */
export function measureFrame(px: Pixels): FrameMeasure {
  const t = measureTints(px);
  const ab = (z: { a: number | null; b: number | null }): AB => (z.a === null || z.b === null ? null : { a: z.a, b: z.b });
  return {
    palette: measurePalette(px).swatches.map((s) => ({ hex: s.hex, lab: s.lab, share: s.share })),
    contrast_stops: measureContrast(px).stops,
    saturation_pct: measureSaturation(px).pct,
    tints: { shadow: ab(t.shadow), mid: ab(t.mid), highlight: ab(t.highlight) },
  };
}

function tintRow(zone: 'shadow' | 'mid' | 'highlight', r: AB, s: AB): MeasureRow {
  const base = { measure: `tint.${zone}`, ref: r, still: s, unit: 'a*b*' };
  if (!r && !s) return { ...base, diff: 0, verdict: 'pass', note: 'none in frame' };
  if (!r || !s) return { ...base, diff: null, verdict: 'far', note: 'in one frame only' };
  const d = Math.hypot(s.a - r.a, s.b - r.b);
  return { ...base, diff: d, verdict: verdictOf(d, THRESHOLDS.tint) };
}

/** The still against the reference: one row per swatch of the reference, the still's extras, and one row per measure. */
export function checkGrade(ref: FrameMeasure, still: FrameMeasure): GradeCheckResult {
  const cost = ref.palette.map((r) => still.palette.map((s) => deltaE2000(r.lab, s.lab)));
  const pairs = assign(cost);
  const swatches: SwatchRow[] = ref.palette.map((r, i) => {
    const j = pairs[i];
    if (j < 0) {
      return {
        ref_hex: r.hex, ref_share: r.share, still_hex: null, still_share: null, de00: null, share_diff: null,
        verdict: r.share >= THRESHOLDS.missing_far_share ? 'far' : 'listed', note: 'missing in still',
      };
    }
    const s = still.palette[j];
    const de00 = cost[i][j];
    const share_diff = Math.round((s.share - r.share) * 10) / 10;
    return {
      ref_hex: r.hex, ref_share: r.share, still_hex: s.hex, still_share: s.share, de00, share_diff,
      verdict: worse(verdictOf(de00, THRESHOLDS.swatch), verdictOf(share_diff, THRESHOLDS.share)),
    };
  });
  const taken = new Set(pairs.filter((j) => j >= 0));
  const extra = still.palette.filter((_, j) => !taken.has(j)).map((s) => ({ hex: s.hex, share: s.share, note: 'extra in still' as const }));

  const matched = swatches.filter((s) => s.de00 !== null);
  const weight = matched.reduce((a, s) => a + s.ref_share, 0);
  const paletteDe = weight ? matched.reduce((a, s) => a + s.ref_share * s.de00!, 0) / weight : 0;
  const missing = swatches.filter((s) => s.de00 === null).reduce((a, s) => a + s.ref_share, 0);
  const rows: MeasureRow[] = [
    {
      measure: 'palette', ref: null, still: null, diff: paletteDe, unit: 'ΔE00', verdict: verdictOf(paletteDe, THRESHOLDS.palette),
      ...(missing ? { note: `${Math.round(missing * 10) / 10}% of the reference has no partner in the still` } : {}),
    },
    { measure: 'contrast', ref: ref.contrast_stops, still: still.contrast_stops, diff: still.contrast_stops - ref.contrast_stops, unit: 'stops', verdict: verdictOf(still.contrast_stops - ref.contrast_stops, THRESHOLDS.contrast) },
    { measure: 'saturation', ref: ref.saturation_pct, still: still.saturation_pct, diff: still.saturation_pct - ref.saturation_pct, unit: 'points', verdict: verdictOf(still.saturation_pct - ref.saturation_pct, THRESHOLDS.saturation) },
    tintRow('shadow', ref.tints.shadow, still.tints.shadow),
    tintRow('mid', ref.tints.mid, still.tints.mid),
    tintRow('highlight', ref.tints.highlight, still.tints.highlight),
  ];
  return { thresholds_version: THRESHOLDS.version, swatches, extra, rows };
}
