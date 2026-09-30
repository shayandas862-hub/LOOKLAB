// Colour science in src/core: sRGB ↔ CIELAB (D65) and CIEDE2000, checked against published values.
import { describe, expect, test } from 'vitest';
import { createHash } from 'node:crypto';
import { deltaE2000, hexToLab, labToHex, labToRgb8, linearOf, rgbToLab } from '../../src/core/colour.ts';
import { Sha256 } from '../../src/core/sha256.ts';
import { rng } from './synth.ts';

describe('sRGB → CIELAB (D65)', () => {
  // Reference values: the CIE formulas with the sRGB (IEC 61966-2-1) matrix, as tabulated by
  // Bruce Lindbloom's and EasyRGB's calculators. Tolerance 0.05 in each coordinate.
  const CASES: [number, number, number, number, number, number][] = [
    [255, 255, 255, 100, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [255, 0, 0, 53.2408, 80.0925, 67.2032],
    [0, 0, 255, 32.297, 79.1875, -107.8602],
    [0, 255, 0, 87.7347, -86.1827, 83.1793],
    [128, 128, 128, 53.585, 0, 0],
  ];
  test.each(CASES)('rgb(%i, %i, %i)', (r, g, b, L, A, B) => {
    const lab = rgbToLab(r, g, b);
    expect(lab[0]).toBeCloseTo(L, 1);
    expect(lab[1]).toBeCloseTo(A, 1);
    expect(lab[2]).toBeCloseTo(B, 1);
  });

  test('hex → Lab → hex is exact over a 16-step grid of the cube', () => {
    for (let r = 0; r < 256; r += 17)
      for (let g = 0; g < 256; g += 17)
        for (let b = 0; b < 256; b += 17) {
          const hex = '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
          expect(labToHex(hexToLab(hex))).toBe(hex);
        }
  });

  test('out-of-gamut Lab clips to the sRGB cube', () => {
    expect(labToRgb8([50, 200, 0]).every((v) => v >= 0 && v <= 255)).toBe(true);
  });

  test('linear luminance of 8-bit codes follows the sRGB curve', () => {
    expect(linearOf(255)).toBe(1);
    expect(linearOf(0)).toBe(0);
    expect(linearOf(128)).toBeCloseTo(0.2158605, 6);
  });
});

describe('CIEDE2000', () => {
  // Sharma, Wu & Dalal (2005), "The CIEDE2000 color-difference formula", test data table 1.
  const PAIRS: [number[], number[], number][] = [
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
    [[50, 0, 0], [50, -1, 2], 2.3669],
    [[50, 2.49, -0.001], [50, -2.49, 0.0009], 7.1792],
    [[50, 2.5, 0], [73, 25, -18], 27.1492],
    [[50, 2.5, 0], [61, -5, 29], 22.8977],
    [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
    [[22.7233, 20.0904, -46.694], [23.0331, 14.973, -42.5619], 2.0373],
    [[2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514], 0.9082],
  ];
  test.each(PAIRS)('ΔE00(%j, %j) = %f', (a, b, expected) => {
    expect(deltaE2000(a as [number, number, number], b as [number, number, number])).toBeCloseTo(expected, 3);
    expect(deltaE2000(b as [number, number, number], a as [number, number, number])).toBeCloseTo(expected, 3);
  });
});

describe('SHA-256 (streamed, for content hashes in the browser)', () => {
  test('matches Node crypto on the empty input and on data fed in odd-sized chunks', () => {
    expect(new Sha256().hex()).toBe(createHash('sha256').digest('hex'));
    const r = rng(3);
    const data = new Uint8Array(1_000_003).map(() => Math.floor(r() * 256));
    const h = new Sha256();
    for (let at = 0, n = 1; at < data.length; at += n, n = (n * 7 + 13) % 70_001) h.update(data.subarray(at, at + n));
    expect(h.hex()).toBe(createHash('sha256').update(data).digest('hex'));
  });

  test('a chunk boundary inside a 64-byte block gives the same digest', () => {
    const data = new TextEncoder().encode('a'.repeat(200));
    const h = new Sha256();
    h.update(data.subarray(0, 63));
    h.update(data.subarray(63));
    expect(h.hex()).toBe(createHash('sha256').update(data).digest('hex'));
  });
});
