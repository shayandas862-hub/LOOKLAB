// The palette instrument: k-means in CIELAB with fixed seeding (D-LL-024).
// Acceptance (docs/phases.md P2): every known patch recovered within CIEDE2000 ΔE ≤ 2 and its
// share within ± 2 points; the same input gives the same output.
import { describe, expect, test } from 'vitest';
import { measurePalette, type Swatch } from '../../src/core/palette.ts';
import { deltaE2000, hexToLab } from '../../src/core/colour.ts';
import { addNoise, blank, set, hexRgb, stripes } from './synth.ts';

type Spec = [string, number][];

/** For each known patch: the nearest swatch, its ΔE00 and its share. */
function match(swatches: Swatch[], spec: Spec) {
  return spec.map(([hex, share]) => {
    const lab = hexToLab(hex);
    let best = swatches[0];
    for (const s of swatches) if (deltaE2000(s.lab, lab) < deltaE2000(best.lab, lab)) best = s;
    return { hex, share, got: best.hex, dE: deltaE2000(best.lab, lab), gotShare: best.share };
  });
}

function expectRecovered(swatches: Swatch[], spec: Spec) {
  const m = match(swatches, spec);
  for (const r of m) {
    expect(r.dE, `${r.hex} → ${r.got}`).toBeLessThanOrEqual(2);
    expect(Math.abs(r.gotShare - r.share), `${r.hex} share ${r.gotShare} vs ${r.share}`).toBeLessThanOrEqual(2);
  }
  // Each patch has its own swatch: no two patches share one.
  expect(new Set(m.map((r) => r.got)).size).toBe(spec.length);
}

const DESIGN: Spec = [['#1B2230', 38], ['#3E4A52', 22], ['#C7803A', 14], ['#6E5B4A', 11], ['#E9C9A0', 9], ['#0D0F12', 6]];
const FOUR: Spec = [['#2A3F66', 40], ['#D9A441', 25], ['#7A2E2E', 20], ['#E8E4DA', 15]];

describe('palette: known patches are recovered (ΔE00 ≤ 2, share ± 2 points)', () => {
  test('four flat patches', () => {
    const { px } = stripes(400, 200, FOUR);
    const p = measurePalette(px);
    expectRecovered(p.swatches, FOUR);
    expect(p.swatches.length).toBe(4);
  });

  test('four patches with ±6 code values of noise on every channel', () => {
    const { px } = stripes(400, 200, FOUR);
    addNoise(px, 6);
    expectRecovered(measurePalette(px).swatches, FOUR);
  });

  test('the design\'s six-colour night palette, with noise', () => {
    const { px } = stripes(512, 214, DESIGN);
    addNoise(px, 4, 11);
    const p = measurePalette(px);
    expectRecovered(p.swatches, DESIGN);
    expect(p.swatches.length).toBe(6);
  });

  test('patches laid out as a grid rather than stripes', () => {
    const px = blank(300, 200);
    const cells: Spec = [['#20304A', 25], ['#B55A30', 25], ['#5E8C61', 25], ['#D8D0C0', 25]];
    for (let y = 0; y < 200; y++)
      for (let x = 0; x < 300; x++) set(px, x, y, hexRgb(cells[(y < 100 ? 0 : 2) + (x < 150 ? 0 : 1)][0]));
    expectRecovered(measurePalette(px).swatches, cells);
  });

  test('shares add up to 100 and swatches come largest first', () => {
    const { px } = stripes(400, 200, FOUR);
    const s = measurePalette(px).swatches;
    expect(s.reduce((a, x) => a + x.share, 0)).toBeCloseTo(100, 0);
    for (let i = 1; i < s.length; i++) expect(s[i - 1].share).toBeGreaterThanOrEqual(s[i].share);
  });

  test('each swatch is placed on a pixel of its own patch', () => {
    const { px, ranges } = stripes(400, 200, FOUR);
    for (const s of measurePalette(px).swatches) {
      const r = ranges.find((x) => deltaE2000(hexToLab(x.hex), s.lab) <= 2)!;
      const x = s.at.x * 400;
      expect(x, s.hex).toBeGreaterThanOrEqual(r.x0);
      expect(x, s.hex).toBeLessThanOrEqual(r.x1);
    }
  });
});

describe('palette: determinism and merging', () => {
  test('the same frame gives exactly the same palette on repeat runs', () => {
    const { px } = stripes(512, 214, DESIGN);
    addNoise(px, 5, 99);
    const a = measurePalette(px);
    const b = measurePalette(px);
    const c = measurePalette(px);
    expect(b).toEqual(a);
    expect(c).toEqual(a);
  });

  test('near-duplicate colours (ΔE00 < 5) are merged into one swatch', () => {
    const spec: Spec = [['#808080', 30], ['#848484', 30], ['#C04020', 40]];
    expect(deltaE2000(hexToLab('#808080'), hexToLab('#848484'))).toBeLessThan(5);
    const s = measurePalette(stripes(400, 200, spec).px).swatches;
    expect(s.length).toBe(2);
    const grey = s.find((x) => deltaE2000(x.lab, hexToLab('#828282')) <= 2)!;
    expect(grey.share).toBeCloseTo(60, 0);
  });

  test('a colour under 1% of the frame is folded into its nearest swatch', () => {
    const spec: Spec = [['#203050', 69.5], ['#E0C090', 30], ['#00FF00', 0.5]];
    const s = measurePalette(stripes(1000, 100, spec).px).swatches;
    expect(s.length).toBe(2);
    expect(s.every((x) => x.share >= 1)).toBe(true);
  });

  test('never more than 8 swatches, even on a frame with many colours', () => {
    const px = blank(256, 64);
    for (let x = 0; x < 256; x++) for (let y = 0; y < 64; y++) set(px, x, y, [x, (x * 7) % 256, 255 - x]);
    expect(measurePalette(px).swatches.length).toBeLessThanOrEqual(8);
  });
});

describe('palette: letterbox bars are not part of the picture (D-LL-029)', () => {
  test('black bars above and below a 2.39:1 picture add no swatch and no share', () => {
    const w = 480;
    const h = 270;
    const active = Math.round(w / 2.39);
    const top = Math.floor((h - active) / 2);
    const { px } = stripes(w, h, FOUR, top, top + active);
    const p = measurePalette(px);
    expectRecovered(p.swatches, FOUR);
    expect(p.swatches.every((s) => s.lab[0] > 8)).toBe(true);
  });
});
