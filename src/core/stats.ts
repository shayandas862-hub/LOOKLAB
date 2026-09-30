// Tone instruments (D-LL-025): contrast in stops, saturation, and shadow / mid / highlight tint.
// All measure the active picture only (D-LL-029). They describe the frame as encoded (display-referred
// sRGB), not the light on set. No DOM, no Node (AD-LL-009).
import { labToHex, luminanceOf, rgbToLab, type Lab } from './colour.ts';
import { eachPixel, findActiveArea, stepFor, type Pixels } from './image.ts';

/** Linear luminance below 2^-10 (about sRGB code 3) is noise and compression in an 8-bit frame, not light. */
export const NOISE_FLOOR = 2 ** -10;
export const CONTRAST_PERCENTILES = [2, 98] as const;
/** Pixels darker than this L* carry no reliable colour and are left out of saturation. */
export const SATURATION_MIN_L = 5;
/** Tint zones by CIELAB lightness. */
export const ZONES = { shadowBelow: 30, highlightAbove: 70 } as const;
/** A zone with less of the picture than this (%) reports "none in frame". */
export const ZONE_MIN_SHARE = 0.5;
const MAX_SAMPLES = 262_144;

const round = (v: number, d: number) => Math.round(v * 10 ** d) / 10 ** d;

function labCache() {
  const cache = new Map<number, Lab>();
  return (r: number, g: number, b: number): Lab => {
    const key = (r << 16) | (g << 8) | b;
    let lab = cache.get(key);
    if (!lab) {
      lab = rgbToLab(r, g, b);
      cache.set(key, lab);
    }
    return lab;
  };
}

export function measureContrast(px: Pixels): { stops: number; lo: number; hi: number } {
  const area = findActiveArea(px);
  const ys: number[] = [];
  eachPixel(px, area, stepFor(area, MAX_SAMPLES), (i) => ys.push(luminanceOf(px.data[i], px.data[i + 1], px.data[i + 2])));
  const sorted = Float64Array.from(ys).sort();
  const at = (p: number) => sorted[Math.floor((p / 100) * (sorted.length - 1))];
  const lo = Math.max(at(CONTRAST_PERCENTILES[0]), NOISE_FLOOR);
  const hi = Math.max(at(CONTRAST_PERCENTILES[1]), NOISE_FLOOR);
  return { stops: round(Math.log2(hi / lo), 2), lo, hi };
}

/** Mean CIELAB saturation, s = C* / √(C*² + L*²), in percent, over pixels at or above L* 5. */
export function measureSaturation(px: Pixels): { pct: number } {
  const area = findActiveArea(px);
  const lab = labCache();
  let sum = 0;
  let count = 0;
  eachPixel(px, area, stepFor(area, MAX_SAMPLES), (i) => {
    const [L, a, b] = lab(px.data[i], px.data[i + 1], px.data[i + 2]);
    if (L < SATURATION_MIN_L) return;
    const C = Math.hypot(a, b);
    sum += C / Math.hypot(C, L);
    count++;
  });
  return { pct: count ? round((100 * sum) / count, 1) : 0 };
}

export interface Tint {
  /** Share of the active picture in this zone, percent. */
  share: number;
  a: number | null;
  b: number | null;
  /** The zone's mean colour. */
  hex: string | null;
  text: string;
}

const MINUS = '−';

function axisWord(axis: 'a' | 'b', v: number): string {
  const n = Math.round(Math.abs(v));
  if (axis === 'b') return v >= 0 ? `warm +${n}` : `cool ${MINUS}${n}`;
  return v >= 0 ? `magenta +${n}` : `green ${MINUS}${n}`;
}

/** "cool −6", "warm +9 · green −3", "neutral" (mean chroma under 2) or "none in frame". */
export function tintText(a: number, b: number): string {
  if (Math.hypot(a, b) < 2) return 'neutral';
  const [first, second]: ['a' | 'b', 'a' | 'b'] = Math.abs(b) >= Math.abs(a) ? ['b', 'a'] : ['a', 'b'];
  const v = { a, b };
  const main = axisWord(first, v[first]);
  return Math.abs(v[second]) >= 3 ? `${main} · ${axisWord(second, v[second])}` : main;
}

export function measureTints(px: Pixels): { shadow: Tint; mid: Tint; highlight: Tint } {
  const area = findActiveArea(px);
  const lab = labCache();
  const acc = [0, 1, 2].map(() => ({ L: 0, a: 0, b: 0, n: 0 }));
  let total = 0;
  eachPixel(px, area, stepFor(area, MAX_SAMPLES), (i) => {
    const [L, a, b] = lab(px.data[i], px.data[i + 1], px.data[i + 2]);
    const z = L < ZONES.shadowBelow ? 0 : L > ZONES.highlightAbove ? 2 : 1;
    acc[z].L += L;
    acc[z].a += a;
    acc[z].b += b;
    acc[z].n++;
    total++;
  });
  const [shadow, mid, highlight] = acc.map((z): Tint => {
    const share = total ? round((100 * z.n) / total, 1) : 0;
    if (!z.n || (100 * z.n) / total < ZONE_MIN_SHARE) return { share, a: null, b: null, hex: null, text: 'none in frame' };
    const a = z.a / z.n;
    const b = z.b / z.n;
    return { share, a: round(a, 1), b: round(b, 1), hex: labToHex([z.L / z.n, a, b]), text: tintText(a, b) };
  });
  return { shadow, mid, highlight };
}
