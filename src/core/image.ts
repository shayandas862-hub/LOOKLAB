// A frame as the instruments see it, and what part of it is picture (D-LL-029). No DOM, no Node (AD-LL-009).

/** RGBA, 8 bits per channel, rows top to bottom: the layout of canvas ImageData and of a decoded PNG. */
export interface Pixels {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
}

/** Half-open pixel rectangle [x0, x1) × [y0, y1). */
export interface Area {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** A row or column is a bar when no pixel in it is brighter than this code value (video black plus noise). */
const BAR_MAX = 28;
/** Bars must each be at least this share of the frame, match each other within BAR_MATCH, and leave most of it. */
const BAR_MIN = 0.02;
const BAR_MATCH = 0.02;
const BAR_MAX_TOTAL = 0.6;

function darkRow(px: Pixels, y: number, x0: number, x1: number): boolean {
  const d = px.data;
  for (let x = x0; x < x1; x++) {
    const i = (y * px.width + x) * 4;
    if (d[i] > BAR_MAX || d[i + 1] > BAR_MAX || d[i + 2] > BAR_MAX) return false;
  }
  return true;
}

function darkCol(px: Pixels, x: number, y0: number, y1: number): boolean {
  const d = px.data;
  for (let y = y0; y < y1; y++) {
    const i = (y * px.width + x) * 4;
    if (d[i] > BAR_MAX || d[i + 1] > BAR_MAX || d[i + 2] > BAR_MAX) return false;
  }
  return true;
}

/** Symmetric pair of bars, or none: letterboxing is centred, a dark sky on one side is picture. */
function bars(first: number, last: number, size: number): [number, number] {
  const ok =
    first >= BAR_MIN * size &&
    last >= BAR_MIN * size &&
    Math.abs(first - last) <= Math.max(2, BAR_MATCH * size) &&
    first + last <= BAR_MAX_TOTAL * size;
  return ok ? [first, last] : [0, 0];
}

/** The active picture inside letterbox (top/bottom) and pillarbox (left/right) bars. */
export function findActiveArea(px: Pixels): Area {
  const { width: w, height: h } = px;
  let top = 0;
  while (top < h && darkRow(px, top, 0, w)) top++;
  let bottom = 0;
  while (bottom < h - top && darkRow(px, h - 1 - bottom, 0, w)) bottom++;
  const [t, b] = bars(top, bottom, h);
  const y0 = t;
  const y1 = h - b;
  let left = 0;
  while (left < w && darkCol(px, left, y0, y1)) left++;
  let right = 0;
  while (right < w - left && darkCol(px, w - 1 - right, y0, y1)) right++;
  const [l, r] = bars(left, right, w);
  return { x0: l, y0, x1: w - r, y1 };
}

/** Film and video ratios a measured aspect snaps to when within 1%. */
const STANDARD = [1.33, 1.37, 1.43, 1.5, 1.66, 1.78, 1.85, 1.9, 2, 2.2, 2.35, 2.39, 2.76];

export function aspectOf(px: Pixels): { ratio: number; label: string; active: Area } {
  const active = findActiveArea(px);
  const ratio = (active.x1 - active.x0) / (active.y1 - active.y0);
  let snapped: number | null = null;
  for (const s of STANDARD) {
    const off = Math.abs(ratio - s);
    if (off / s <= 0.01 && (snapped === null || off < Math.abs(ratio - snapped))) snapped = s;
  }
  return { ratio, label: `${(snapped ?? ratio).toFixed(2)}:1`, active };
}

/** Visits every `step`-th pixel of an area in both directions, row by row. */
export function eachPixel(px: Pixels, area: Area, step: number, fn: (i: number, x: number, y: number) => void): void {
  for (let y = area.y0; y < area.y1; y += step) {
    const row = y * px.width;
    for (let x = area.x0; x < area.x1; x += step) fn((row + x) * 4, x, y);
  }
}

/** The grid step that keeps a visit under `max` pixels. */
export function stepFor(area: Area, max: number): number {
  const n = (area.x1 - area.x0) * (area.y1 - area.y0);
  return Math.max(1, Math.ceil(Math.sqrt(n / max)));
}
