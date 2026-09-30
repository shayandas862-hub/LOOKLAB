// The committed palette fixture still holds the colours and shares its JSON says it does.
import { expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { decodePng } from '../../src/engine/png.ts';

const DIR = join(import.meta.dirname, '..', 'fixtures');

test('patches-239.png matches patches-239.json, pixel for pixel', () => {
  const spec = JSON.parse(readFileSync(join(DIR, 'patches-239.json'), 'utf8')) as { width: number; height: number; patches: [string, number][] };
  const px = decodePng(readFileSync(join(DIR, 'patches-239.png')));
  expect([px.width, px.height]).toEqual([spec.width, spec.height]);
  expect((px.width / px.height).toFixed(2)).toBe('2.39');
  const counts = new Map<string, number>();
  for (let i = 0; i < px.data.length; i += 4) {
    const hex = '#' + [px.data[i], px.data[i + 1], px.data[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  expect([...counts.keys()].sort()).toEqual(spec.patches.map((p) => p[0]).sort());
  for (const [hex, share] of spec.patches) expect((100 * counts.get(hex)!) / (px.width * px.height)).toBeCloseTo(share, 0);
});
