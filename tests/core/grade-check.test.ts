// The grade check's maths (P4.5, P-LL-001 §4.6, validation.md §5.4): a still from a test shoot or a grade is measured
// with the same instruments as its reference, the palettes are matched one-to-one (Hungarian, least total ΔE00), and
// each measure gets pass / close / far against thresholds that are proposals until the instruments' noise is measured.
import { describe, expect, test } from 'vitest';
import { assign, checkGrade, measureFrame, THRESHOLDS, verdictOf, type FrameMeasure } from '../../src/core/grade-check.ts';
import { deltaE2000, hexToLab } from '../../src/core/colour.ts';
import { stripes } from './synth.ts';

const REF: [string, number][] = [['#2A3F66', 40], ['#D9A441', 25], ['#7A2E2E', 20], ['#E8E4DA', 15]];
const frame = (p: [string, number][]) => stripes(240, 100, p).px;
const m = (palette: [string, number][], over: Partial<FrameMeasure> = {}): FrameMeasure => ({
  palette: palette.map(([hex, share]) => ({ hex, lab: hexToLab(hex), share })),
  contrast_stops: 6, saturation_pct: 30,
  tints: { shadow: { a: 1, b: -6 }, mid: { a: 0, b: 0 }, highlight: { a: 2, b: 9 } },
  ...over,
});

describe('assign: one-to-one, least total cost (Hungarian)', () => {
  test('finds the optimal assignment where a greedy pick does not', () => {
    // Greedy takes row 0 → col 0 (1), then row 1 must take col 1 (100): total 101. The optimum is 2 + 3 = 5.
    expect(assign([[1, 2], [3, 100]])).toEqual([1, 0]);
  });

  test('rectangular: every row of the shorter side is assigned; the rest stay unassigned', () => {
    expect(assign([[5, 1, 9], [1, 5, 9]])).toEqual([1, 0]);
    expect(assign([[5, 1], [1, 5], [9, 9]])).toEqual([1, 0, -1]);
  });

  test('ties resolve the same way every run', () => {
    const c = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
    expect(assign(c)).toEqual(assign(c));
    expect(new Set(assign(c)).size).toBe(3);
  });
});

describe('checkGrade', () => {
  test('a frame against itself reads zero on every row, and every verdict passes (validation §5.1)', () => {
    const px = frame(REF);
    const r = checkGrade(measureFrame(px), measureFrame(px));
    for (const row of r.rows) expect(row.diff, row.measure).toBe(0);
    for (const s of r.swatches) expect(s).toMatchObject({ de00: 0, share_diff: 0, verdict: 'pass' });
    expect(r.rows.every((row) => row.verdict === 'pass')).toBe(true);
    expect(r.thresholds_version).toBe(THRESHOLDS.version);
  });

  test('palettes are matched one-to-one: a colour the still lost is not hidden behind a near neighbour', () => {
    // Two reference blues, one blue in the still. Nearest-swatch would pair both with it; one-to-one cannot.
    const ref = m([['#2A3F66', 50], ['#2E4470', 30], ['#D9A441', 20]]);
    const still = m([['#2B4068', 80], ['#D9A441', 20]]);
    const r = checkGrade(ref, still);
    expect(r.swatches.filter((s) => s.still_hex === '#2B4068')).toHaveLength(1);
    const missing = r.swatches.find((s) => s.still_hex === null)!;
    expect(missing.verdict).toBe('far'); // 30% of the reference, gone
    expect(missing.note).toBe('missing in still');
  });

  test('a missing swatch under 3% share is listed, not judged; an extra one in the still is reported', () => {
    // Only a count difference leaves a swatch unpaired (P-LL-001 §4.6); a far pair is a far verdict, not a missing one.
    const r = checkGrade(m([['#2A3F66', 98], ['#D9A441', 2]]), m([['#2A3F66', 100]]));
    expect(r.swatches.find((s) => s.ref_hex === '#D9A441')).toMatchObject({ verdict: 'listed' });
    const r2 = checkGrade(m([['#2A3F66', 100]]), m([['#2A3F66', 90], ['#7A2E2E', 10]]));
    expect(r2.extra).toEqual([{ hex: '#7A2E2E', share: 10, note: 'extra in still' }]);
  });

  test('each swatch row carries its ΔE00 and its share difference, and the palette row is the share-weighted mean', () => {
    const ref = m([['#2A3F66', 60], ['#D9A441', 40]]);
    const still = m([['#33476E', 55], ['#D9A441', 45]]);
    const r = checkGrade(ref, still);
    const blue = r.swatches.find((s) => s.ref_hex === '#2A3F66')!;
    const de = deltaE2000(hexToLab('#2A3F66'), hexToLab('#33476E'));
    expect(blue.de00).toBeCloseTo(de, 6);
    expect(blue.share_diff).toBe(-5);
    const palette = r.rows.find((x) => x.measure === 'palette')!;
    expect(palette.diff).toBeCloseTo((60 * de + 40 * 0) / 100, 6);
  });

  test('contrast, saturation and each tint zone are differences, still minus reference', () => {
    const r = checkGrade(m(REF), m(REF, { contrast_stops: 6.5, saturation_pct: 34, tints: { shadow: { a: 1, b: -2 }, mid: { a: 0, b: 0 }, highlight: { a: 2, b: 9 } } }));
    expect(r.rows.find((x) => x.measure === 'contrast')).toMatchObject({ diff: 0.5, unit: 'stops', verdict: 'close' });
    expect(r.rows.find((x) => x.measure === 'saturation')).toMatchObject({ diff: 4, unit: 'points', verdict: 'close' });
    expect(r.rows.find((x) => x.measure === 'tint.shadow')).toMatchObject({ diff: 4, verdict: 'close' });
  });

  test('a tint zone in one frame only reads far; in neither, it passes as "none in frame"', () => {
    const r = checkGrade(m(REF), m(REF, { tints: { shadow: null, mid: { a: 0, b: 0 }, highlight: null } }));
    expect(r.rows.find((x) => x.measure === 'tint.shadow')).toMatchObject({ verdict: 'far', note: 'in one frame only' });
    const r2 = checkGrade(m(REF, { tints: { shadow: null, mid: { a: 0, b: 0 }, highlight: null } }), m(REF, { tints: { shadow: null, mid: { a: 0, b: 0 }, highlight: null } }));
    expect(r2.rows.find((x) => x.measure === 'tint.shadow')).toMatchObject({ diff: 0, verdict: 'pass', note: 'none in frame' });
  });

  test('a graded still is told apart from its reference: a warmer, brighter grade reads close or far, never all pass', () => {
    const r = checkGrade(measureFrame(frame(REF)), measureFrame(frame([['#3A4A66', 40], ['#E8B048', 25], ['#8A3A30', 20], ['#F2EADA', 15]])));
    expect(r.rows.some((x) => x.verdict !== 'pass') || r.swatches.some((s) => s.verdict !== 'pass')).toBe(true);
  });
});

describe('verdicts (validation §5.4: proposals, versioned)', () => {
  test('pass up to the first threshold, close up to the second, far beyond; by absolute size', () => {
    expect(verdictOf(3, THRESHOLDS.swatch)).toBe('pass');
    expect(verdictOf(3.0001, THRESHOLDS.swatch)).toBe('close');
    expect(verdictOf(6, THRESHOLDS.swatch)).toBe('close');
    expect(verdictOf(6.0001, THRESHOLDS.swatch)).toBe('far');
    expect(verdictOf(-1 / 3, THRESHOLDS.contrast)).toBe('pass');
    expect(THRESHOLDS).toMatchObject({ swatch: [3, 6], palette: [3, 6], share: [3, 6], saturation: [3, 6], tint: [2, 4], missing_far_share: 3 });
    expect(THRESHOLDS.contrast[0]).toBeCloseTo(1 / 3, 9);
  });
});
