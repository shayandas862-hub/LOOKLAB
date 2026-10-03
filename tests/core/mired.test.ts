// Light colour in mireds and the kit setting or gel that gets it (P4.5, P-LL-001 §4.1). The gel values below are made
// up for the test (round numbers, not any maker's): a maker's number enters only the kit, cited (AD-LL-014, rule 16).
import { describe, expect, test } from 'vitest';
import { chooseBalance, gapOf, kelvinOf, mired, solveSource, targets, type Gel } from '../../src/core/mired.ts';

const TEST_GELS: Gel[] = [
  { id: 'g-full', shift_mired: 160, transmission_pct: 50, sheets: 1 },
  { id: 'g-half', shift_mired: 80, transmission_pct: 70, sheets: 1 },
  { id: 'g-qtr', shift_mired: 40, transmission_pct: 85, sheets: 2 },
];
const COB = { min_k: 2700, max_k: 6500, step_k: 100 };

describe('mireds', () => {
  test('a mired is a million over the kelvin, and back', () => {
    expect(mired(2000)).toBe(500);
    expect(mired(5600)).toBeCloseTo(178.5714285714, 9);
    expect(kelvinOf(500)).toBe(2000);
  });

  test('P-LL-001 §4.1 worked arithmetic: the sample key must be 321.4 mired warmer than the balance', () => {
    const t5600 = targets({ key_k: 2000, fill_k: 5600, lambda: 1, camera_wb_k: 5600 });
    expect(t5600.wb_source).toBe('fill');
    expect(t5600.key.mired - mired(5600)).toBeCloseTo(321.428571, 5);
    expect(t5600.key.kelvin).toBeCloseTo(2000, 9);
    expect(t5600.fill.kelvin).toBeCloseTo(5600, 9);
    const t3200 = targets({ key_k: 2000, fill_k: 5600, lambda: 1, camera_wb_k: 3200 });
    expect(t3200.key.mired).toBeCloseTo(633.928571, 5);
    expect(t3200.key.kelvin).toBeCloseTo(1577.46, 1);
  });

  test('λ scales the lit difference; the white-balance source is the more neutral one, ties to the fill', () => {
    const half = targets({ key_k: 2000, fill_k: 5600, lambda: 0.5, camera_wb_k: 5600 });
    expect(half.key.mired - mired(5600)).toBeCloseTo(321.428571 / 2, 5);
    expect(targets({ key_k: 5600, fill_k: 3200, lambda: 1, camera_wb_k: 5600 }).wb_source).toBe('key');
    expect(targets({ key_k: 5000, fill_k: 6300, lambda: 1, camera_wb_k: 5600 }).wb_source).toBe('fill');
  });
});

describe('solveSource: fixture setting, then gels up to three layers', () => {
  test('in the fixture\'s range: set it, rounded to its step; the residual is the rounding; no gel', () => {
    const r = solveSource(mired(4321), COB, TEST_GELS);
    expect(r).toMatchObject({ fixture_k: 4300, gels: [] });
    expect(r.residual_mired).toBeCloseTo(mired(4321) - mired(4300), 9);
  });

  test('beyond its range: the exhaustive gel search finds the least residual (checked against brute force)', () => {
    const target = mired(2000);
    const r = solveSource(target, COB, TEST_GELS);
    // Brute force, written independently: every multiset of up to three gels within sheets, every fixture step.
    let best = Infinity;
    const stacks: number[][] = [[]];
    for (const a of [0, 1, 2]) { stacks.push([a]); for (const b of [a, 1, 2].filter((x) => x >= a)) { stacks.push([a, b]); for (const c of [0, 1, 2].filter((x) => x >= b)) stacks.push([a, b, c]); } }
    for (const st of stacks) {
      const uses = [0, 1, 2].map((g) => st.filter((x) => x === g).length);
      if (uses.some((u, g) => u > TEST_GELS[g].sheets)) continue;
      const S = st.reduce((s, g) => s + TEST_GELS[g].shift_mired, 0);
      for (let k = COB.min_k; k <= COB.max_k; k += COB.step_k) best = Math.min(best, Math.abs(target - (mired(k) + S)));
    }
    expect(Math.abs(r.residual_mired)).toBeCloseTo(best, 9);
    expect(r.gels.length).toBeGreaterThan(0);
    expect(r.kelvin_got).toBeCloseTo(kelvinOf(target - r.residual_mired), 9);
  });

  test('a gel is used no more times than the kit has sheets', () => {
    const one = [{ id: 'g-qtr', shift_mired: 40, transmission_pct: 85, sheets: 1 }];
    const r = solveSource(mired(2700) + 80, COB, one);
    expect(r.gels).toEqual(['g-qtr']);
    expect(r.residual_mired).toBeCloseTo(40, 9);
  });

  test('ties: fewest layers, then most light through, then gel id order', () => {
    const tie: Gel[] = [
      { id: 'b-dim', shift_mired: 100, transmission_pct: 40, sheets: 1 },
      { id: 'a-bright', shift_mired: 100, transmission_pct: 80, sheets: 1 },
      { id: 'c-half', shift_mired: 50, transmission_pct: 90, sheets: 2 },
    ];
    const r = solveSource(mired(2700) + 100, COB, tie);
    expect(r.gels).toEqual(['a-bright']); // one layer beats two of c-half; brighter beats dimmer
    const same: Gel[] = [{ id: 'z', shift_mired: 100, transmission_pct: null, sheets: 1 }, { id: 'y', shift_mired: 100, transmission_pct: null, sheets: 1 }];
    expect(solveSource(mired(2700) + 100, COB, same).gels).toEqual(['y']);
  });

  test('cooling works the same way: a negative shift for a source bluer than the fixture can reach', () => {
    const blue: Gel[] = [{ id: 'g-cool', shift_mired: -100, transmission_pct: 40, sheets: 1 }];
    const r = solveSource(mired(10000), COB, blue);
    expect(r.gels).toEqual(['g-cool']);
  });
});

describe('gaps', () => {
  test('a residual over half the finest gel is a gap, and says how many mired and which way', () => {
    expect(gapOf(25, TEST_GELS)).toEqual({ gap: true, text: 'needs 25.0 mired warmer than the kit reaches' });
    expect(gapOf(-25, TEST_GELS)).toEqual({ gap: true, text: 'needs 25.0 mired cooler than the kit reaches' });
    expect(gapOf(19.9, TEST_GELS)).toEqual({ gap: false, text: '' });
  });

  test('with no gels at all, any residual beyond the fixture\'s step is a gap', () => {
    expect(gapOf(30, []).gap).toBe(true);
  });
});

describe('chooseBalance: every offered white balance, the smallest worst residual first', () => {
  test('the sample look balances at 5600 K over 3200 K: less gel on the key, the fill bare', () => {
    const r = chooseBalance({
      settings_k: [3200, 5600], key_k: 2000, fill_k: 5600, lambda: 1,
      fixtures: { key: COB, fill: { min_k: 3200, max_k: 5600, step_k: 100 } }, gels: TEST_GELS,
    });
    expect(r.camera_wb_k).toBe(5600);
    expect(r.fill.gels).toEqual([]);
  });
});
