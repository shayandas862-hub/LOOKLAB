// Tone instruments: contrast in stops, saturation, shadow/mid/highlight tint, active picture and aspect
// (D-LL-025, D-LL-029). Tolerances are stated per test; they cover 8-bit quantisation, nothing else.
import { describe, expect, test } from 'vitest';
import { findActiveArea, aspectOf } from '../../src/core/image.ts';
import { measureContrast, measureSaturation, measureTints, NOISE_FLOOR } from '../../src/core/stats.ts';
import { labToRgb8, rgbToLab } from '../../src/core/colour.ts';
import { addNoise, blank, set, srgbCode, stripes } from './synth.ts';

const grey = (lin: number): [number, number, number] => {
  const c = srgbCode(lin);
  return [c, c, c];
};

describe('contrast in stops, from linear luminance percentiles (2nd and 98th)', () => {
  test('half at 0.8 and half at 0.05 linear is 4 stops (± 0.1)', () => {
    const px = blank(200, 100);
    for (let x = 0; x < 200; x++) for (let y = 0; y < 100; y++) set(px, x, y, grey(x < 100 ? 0.05 : 0.8));
    expect(measureContrast(px).stops).toBeCloseTo(4, 1);
  });

  test('a ramp even in stops from 2^-7 to 2^0 reads 7 × 0.96 = 6.72 stops (± 0.1)', () => {
    const px = blank(1024, 16);
    for (let x = 0; x < 1024; x++) {
      const lin = Math.pow(2, -7 + (7 * (x + 0.5)) / 1024);
      for (let y = 0; y < 16; y++) set(px, x, y, grey(lin));
    }
    expect(Math.abs(measureContrast(px).stops - 6.72)).toBeLessThanOrEqual(0.1);
  });

  test('pure black against white stops at the noise floor: log2(1 / 2^-10) = 10 stops exactly', () => {
    expect(NOISE_FLOOR).toBe(Math.pow(2, -10));
    const px = blank(200, 100);
    for (let x = 100; x < 200; x++) for (let y = 0; y < 100; y++) set(px, x, y, [255, 255, 255]);
    expect(measureContrast(px).stops).toBeCloseTo(10, 5);
  });

  test('a flat frame has 0 stops of contrast', () => {
    expect(measureContrast(blank(64, 64, [120, 120, 120])).stops).toBeCloseTo(0, 5);
  });

  test('letterbox bars do not count as shadows', () => {
    const px = blank(480, 270);
    for (let x = 0; x < 480; x++) for (let y = 35; y < 235; y++) set(px, x, y, grey(x < 240 ? 0.05 : 0.8));
    expect(measureContrast(px).stops).toBeCloseTo(4, 1);
  });
});

describe('saturation: mean CIELAB saturation C*/√(C*² + L*²), pixels darker than L* 5 left out', () => {
  test('a grey ramp is 0% (± 0.5)', () => {
    const px = blank(256, 8);
    for (let x = 0; x < 256; x++) for (let y = 0; y < 8; y++) set(px, x, y, [x, x, x]);
    expect(measureSaturation(px).pct).toBeLessThanOrEqual(0.5);
  });

  test('pure sRGB red is 89.1% (± 0.5)', () => {
    expect(Math.abs(measureSaturation(blank(32, 32, [255, 0, 0])).pct - 89.1)).toBeLessThanOrEqual(0.5);
  });

  test('black pixels do not dilute it: half black, half red is still 89.1% (± 0.5)', () => {
    const px = blank(64, 32);
    for (let x = 32; x < 64; x++) for (let y = 0; y < 32; y++) set(px, x, y, [255, 0, 0]);
    expect(Math.abs(measureSaturation(px).pct - 89.1)).toBeLessThanOrEqual(0.5);
  });

  test('a frame of known colours gives the pixel-weighted mean of their saturations (± 0.5)', () => {
    const { px } = stripes(400, 50, [['#C7803A', 50], ['#3E4A52', 50]]);
    const s = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      const [L, a, b] = rgbToLab((n >> 16) & 255, (n >> 8) & 255, n & 255);
      const C = Math.hypot(a, b);
      return (100 * C) / Math.hypot(C, L);
    };
    const expected = (s('#C7803A') + s('#3E4A52')) / 2;
    expect(Math.abs(measureSaturation(px).pct - expected)).toBeLessThanOrEqual(0.5);
  });
});

describe('tints: mean a*, b* in shadows (L* < 30), mids and highlights (L* > 70)', () => {
  /** A lightness ramp from L* 10 to 95 with a chosen a*, b* per zone. */
  function tinted(zone: (L: number) => [number, number]) {
    const px = blank(850, 8);
    for (let x = 0; x < 850; x++) {
      const L = 10 + (85 * (x + 0.5)) / 850;
      const [a, b] = zone(L);
      for (let y = 0; y < 8; y++) set(px, x, y, labToRgb8([L, a, b]));
    }
    return px;
  }

  test('cool shadows, neutral mids, warm highlights (b* within ± 1)', () => {
    const t = measureTints(tinted((L) => (L < 30 ? [0, -10] : L > 70 ? [0, 8] : [0, 0])));
    expect(Math.abs(t.shadow.b! + 10)).toBeLessThanOrEqual(1);
    expect(t.shadow.text).toMatch(/^cool −(9|10|11)$/);
    expect(t.mid.text).toBe('neutral');
    expect(Math.abs(t.highlight.b! - 8)).toBeLessThanOrEqual(1);
    expect(t.highlight.text).toMatch(/^warm \+(7|8|9)$/);
  });

  test('a green cast in the shadows and magenta in the highlights read on the a* axis (± 1)', () => {
    const t = measureTints(tinted((L) => (L < 30 ? [-6, 0] : L > 70 ? [5, 0] : [0, 0])));
    expect(Math.abs(t.shadow.a! + 6)).toBeLessThanOrEqual(1);
    expect(t.shadow.text).toMatch(/^green −(5|6|7)$/);
    expect(t.highlight.text).toMatch(/^magenta \+(4|5|6)$/);
  });

  test('a second axis is named when it is at least 3', () => {
    const t = measureTints(tinted((L) => (L < 30 ? [-4, -10] : [0, 0])));
    expect(t.shadow.text).toMatch(/^cool −(9|10|11) · green −(3|4|5)$/);
  });

  test('a zone with under 0.5% of the pixels says so instead of inventing a tint', () => {
    const t = measureTints(blank(64, 64, [30, 30, 30]));
    expect(t.highlight.text).toBe('none in frame');
    expect(t.highlight.hex).toBeNull();
    expect(t.shadow.share).toBeCloseTo(100, 0);
  });

  test('each zone reports the mean colour of its pixels as hex', () => {
    const t = measureTints(tinted(() => [0, 0]));
    expect(t.mid.hex).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('active picture and aspect ratio (D-LL-029)', () => {
  test('a full frame is its own active picture: 480 × 270 is 1.78:1', () => {
    const px = addNoise(blank(480, 270, [90, 80, 70]), 3);
    expect(findActiveArea(px)).toEqual({ x0: 0, y0: 0, x1: 480, y1: 270 });
    expect(aspectOf(px).label).toBe('1.78:1');
  });

  test('black bars above and below a 2.39:1 picture are found and the aspect is 2.39:1', () => {
    const px = blank(480, 270);
    for (let x = 0; x < 480; x++) for (let y = 35; y < 236; y++) set(px, x, y, [120, 90, 60]);
    addNoise(px, 2);
    expect(findActiveArea(px)).toMatchObject({ y0: 35, y1: 236 });
    expect(aspectOf(px).label).toBe('2.39:1');
  });

  test('pillarbox bars left and right of a 4:3 picture give 1.33:1', () => {
    const px = blank(480, 270);
    for (let x = 60; x < 420; x++) for (let y = 0; y < 270; y++) set(px, x, y, [120, 90, 60]);
    expect(aspectOf(px).label).toBe('1.33:1');
  });

  test('a dark region on one side only is picture, not a bar (bars are symmetric)', () => {
    const px = blank(480, 270);
    for (let x = 0; x < 480; x++) for (let y = 80; y < 270; y++) set(px, x, y, [120, 90, 60]);
    expect(findActiveArea(px)).toEqual({ x0: 0, y0: 0, x1: 480, y1: 270 });
  });

  test('a ratio that is not a standard one is reported as measured, to two decimals', () => {
    expect(aspectOf(blank(300, 100, [100, 100, 100])).label).toBe('3.00:1');
  });
});
