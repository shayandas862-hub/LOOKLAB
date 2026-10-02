// R2 (T0): shot size from the face box (D-LL-046). The face's height, hairline to chin, as a share of the active
// picture's height names the size. A definition, not a measurement of the scene: the boundaries are the geometric
// means between the framings a DP means by each name.
import { describe, expect, test } from 'vitest';
import { SHOT_SIZES, shotSize } from '../../src/core/shot-size.ts';

describe('shotSize', () => {
  test('each size starts at its boundary', () => {
    expect(shotSize(0.70)).toBe('ECU');
    expect(shotSize(0.6999)).toBe('CU');
    expect(shotSize(0.38)).toBe('CU');
    expect(shotSize(0.3799)).toBe('MCU');
    expect(shotSize(0.23)).toBe('MCU');
    expect(shotSize(0.2299)).toBe('MS');
    expect(shotSize(0.16)).toBe('MS');
    expect(shotSize(0.1599)).toBe('MWS');
    expect(shotSize(0.115)).toBe('MWS');
    expect(shotSize(0.1149)).toBe('WS');
    expect(shotSize(0.07)).toBe('WS');
    expect(shotSize(0.0699)).toBe('EWS');
  });

  test('the Blender set faces, 32–58% of the frame, are close-ups and medium close-ups', () => {
    expect(shotSize(0.32)).toBe('MCU');
    expect(shotSize(0.58)).toBe('CU');
  });

  test('the table lists every size once, largest face first', () => {
    expect(SHOT_SIZES.map((s) => s.label)).toEqual(['ECU', 'CU', 'MCU', 'MS', 'MWS', 'WS', 'EWS']);
  });

  test('a face share outside 0–1 is refused', () => {
    expect(() => shotSize(0)).toThrow(RangeError);
    expect(() => shotSize(1.6)).toThrow(RangeError);
  });
});
