// The Breakdown's badges and row text for the sources AD-LL-010 adds: a fitted light reads ESTIMATE and an
// EXIF focal length reads METADATA; neither ever reads MEASURED.
import { describe, expect, test } from 'vitest';
import { badge, markerText, rowSpecs, weakest } from '../../src/ui/logic/Breakdown.rows.ts';
import { sampleSeed } from '../../src/actions/sample.ts';

const b = () => structuredClone(sampleSeed('2026-09-30T12:00:00Z', 'tester', 'local').breakdown);
const lensText = (bd: ReturnType<typeof b>) => rowSpecs(bd).lens.find((r: unknown[]) => r[0] === 'focal')![2];

describe('badges', () => {
  test.each([['measured', 'MEASURED'], ['manual', 'MANUAL'], ['metadata', 'METADATA'], ['estimate', 'ESTIMATE'], ['sample', 'SAMPLE']])(
    '%s reads %s', (src, label) => {
      expect(badge(src, undefined, false).label).toBe(label);
    });

  test('the weakest source of a row: measured, manual, metadata, estimate, ai, sample', () => {
    const v = (source: string) => ({ source });
    expect(weakest([v('measured'), v('estimate')])).toBe('estimate');
    expect(weakest([v('metadata'), v('manual')])).toBe('metadata');
    expect(weakest([v('estimate'), v('sample')])).toBe('sample');
  });
});

describe('focal length text', () => {
  test('from EXIF with a 35 mm equivalent', () => {
    const bd = b();
    bd.lens.focal_mm = { value: 75, unit: 'mm (35 mm equiv.)', source: 'metadata', updated_by: 'x', updated_at: 'now' };
    expect(lensText(bd)).toBe('75 mm (EXIF, 35 mm equiv.)');
  });

  test('from EXIF, actual focal length only', () => {
    const bd = b();
    bd.lens.focal_mm = { value: 35, unit: 'mm (actual; sensor size unknown)', source: 'metadata', updated_by: 'x', updated_at: 'now' };
    expect(lensText(bd)).toBe('35 mm (EXIF, actual; sensor size unknown)');
  });

  test('sample and manual values keep the design\'s "≈"', () => {
    expect(lensText(b())).toBe('≈40 mm');
  });
});

describe('light rows after the fit (P3)', () => {
  const fitted = () => {
    const bd = b();
    const est = (value: number, unit: string, confidence?: number) => ({ value, unit, source: 'estimate', ...(confidence === undefined ? {} : { confidence }), updated_by: 'breakdown.fit_light', updated_at: 'now' });
    bd.light.key_az = est(-48, '°', 34) as never;
    bd.light.key_el = est(27, '°', 34) as never;
    bd.light.key_kelvin = est(4350, 'K') as never;
    return bd;
  };
  const row = (bd: ReturnType<typeof b>, id: string) => rowSpecs(bd).light.find((r: unknown[]) => r[0] === id)!;

  test('direction and key colour each get their own row, so each shows its own source', () => {
    const bd = fitted();
    expect(row(bd, 'az').slice(1, 3)).toEqual(['Key azimuth', '−48°']);
    expect(row(bd, 'el').slice(1, 3)).toEqual(['Key elevation', '27°']);
    expect(row(bd, 'kelvin').slice(1, 3)).toEqual(['Key colour', '4350 K']);
    for (const id of ['az', 'el', 'kelvin']) expect(weakest(row(bd, id)[3])).toBe('estimate');
    for (const id of ['key', 'fill', 'ratio', 'hard', 'prac']) expect(weakest(row(bd, id)[3]), id).toBe('sample');
  });

  test('an estimate with a confidence shows the score, not a percentage', () => {
    expect(badge('estimate', 34, false).label).toBe('ESTIMATE · 34');
    expect(badge('estimate', undefined, false).label).toBe('ESTIMATE');
  });
});

describe('the Breakdown marker names exactly what is still sample (D-LL-032, D-LL-038)', () => {
  test('before the fit: every light value is listed as sample', () => {
    const m = markerText(b());
    expect(m).toMatch(/^SAMPLE: key direction, key colour, key type, hardness, fill, key:fill, practicals, focal length, depth of field, camera height, angle, movement, shot size, lead room, mood/);
    expect(m).not.toMatch(/ESTIMATE|METADATA/);
  });

  test('after the fit and an EXIF focal length: estimates and metadata are named, and nothing claims accuracy on real footage', () => {
    const bd = b();
    const e = (value: number) => ({ value, source: 'estimate', updated_by: 'x', updated_at: 'now' });
    bd.light.key_az = e(-48) as never; bd.light.key_el = e(27) as never; bd.light.key_kelvin = e(4350) as never;
    bd.lens.focal_mm = { value: 75, unit: 'mm (35 mm equiv.)', source: 'metadata', updated_by: 'x', updated_at: 'now' } as never;
    const m = markerText(bd);
    expect(m).toContain('ESTIMATE: key direction, key colour (fitted to the face marked by hand; not verified on real footage)');
    expect(m).toContain('METADATA: focal length (EXIF)');
    expect(m).toMatch(/^SAMPLE: key type, hardness, fill, key:fill, practicals, depth of field/);
    expect(m).not.toMatch(/SAMPLE:[^·]*key direction/);
    expect(m).not.toMatch(/accura|validated|\d+%/i);
  });
});
