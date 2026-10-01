// The light fit ported from v0.2 (P3 task 1): its renderer, its search and the cheek-only match statistic
// (D-LL-007). Parity is checked against v0.2's own code, run from its source (tests/core/v02.ts).
// Parity tolerance is 0: the port does the same float64 arithmetic in the same order and stores the same
// Float32 values, so every pixel, every step of the search and every statistic must be identical.
import { describe, expect, test } from 'vitest';
import { renderScene, type LightParams } from '../../src/core/light-render.ts';
import { createFit, downsample, errFn, KNOBS, measureInit, runFit } from '../../src/core/light-fit.ts';
import { cheekStats } from '../../src/core/cheek.ts';
import { loadV02 } from './v02.ts';

const v02 = loadV02();

// v0.2's five synthetic cases and tolerances (reference/v0.2/tests/core-fit.test.js, docs/08-VALIDATION.md).
const CASES: { name: string; p: LightParams }[] = [
  { name: 'rembrandt', p: { az: -52, el: 28, soft: 0.35, int: 1.15, kel: 3800, fill: 2, lens: 85, yaw: 6, tilt: 0, lamp: 1, wall: 0.7 } },
  { name: 'beauty', p: { az: 8, el: 32, soft: 0.9, int: 1.0, kel: 5600, fill: 0.6, lens: 100, yaw: -3, tilt: 1, lamp: 0, wall: 1.0 } },
  { name: 'noir', p: { az: 78, el: 8, soft: 0.12, int: 1.3, kel: 4600, fill: 3, lens: 50, yaw: -10, tilt: -1, lamp: 0, wall: 0.35 } },
  { name: 'extra-a', p: { az: 35, el: 50, soft: 0.5, int: 1.0, kel: 5000, fill: 1.5, lens: 70, yaw: 0, tilt: 0, lamp: 0, wall: 0.8 } },
  { name: 'extra-b', p: { az: -100, el: 20, soft: 0.3, int: 1.4, kel: 4200, fill: 2.5, lens: 85, yaw: 5, tilt: 0, lamp: 1, wall: 0.5 } },
];
const TOL = { az: 15, el: 8, kel: 500, fill: 0.6, err: 0.02 };
const NEUTRAL = { az: 0, el: 20, soft: 0.5, int: 1, kel: 5600, fill: 1 };
const W = 240, H = 300, FW = 40, FH = 50;

// Corners of the parameter space the cases do not reach.
const EDGES: LightParams[] = [
  { az: -170, el: -10, soft: 0, int: 0.2, kel: 2800, fill: 0, lens: 35, yaw: 0, tilt: 0, lamp: 0, wall: 0.2 },
  { az: 170, el: 80, soft: 1, int: 2.2, kel: 7000, fill: 3.5, lens: 135, yaw: 12, tilt: 1, lamp: 1, wall: 1.2 },
  { az: 90, el: 0, soft: 0.6, int: 0.9, kel: 6600, fill: 1.2, lens: 85, yaw: -20, tilt: -1, lamp: 1, wall: 0.6 },
];

const baseOf = (p: LightParams) => ({ ...NEUTRAL, lens: p.lens, yaw: p.yaw, tilt: p.tilt, lamp: p.lamp, wall: p.wall });
const maxDiff = (a: ArrayLike<number>, b: ArrayLike<number>) => {
  let m = a.length === b.length ? 0 : Infinity;
  for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - b[i]));
  return m;
};

describe('port parity with v0.2 (tolerance 0)', () => {
  test.each([...CASES.map((c) => c.p), ...EDGES])('renderScene gives the same pixels and face mask (%#)', (p) => {
    for (const [w, h, grain] of [[W, H, 0.012], [FW, FH, 0]] as const) {
      const ours = renderScene(p, w, h, grain), theirs = v02.renderScene(p, w, h, grain);
      expect(maxDiff(ours.rgb, theirs.rgb)).toBe(0);
      expect(maxDiff(ours.head, theirs.head)).toBe(0);
    }
  });

  test('downsample and errFn give the same numbers', () => {
    const a = renderScene(CASES[0].p, W, H, 0.012).rgb, b = renderScene(CASES[1].p, W, H, 0).rgb;
    expect(maxDiff(downsample(a, W, H, 6), v02.downsample(a, W, H, 6))).toBe(0);
    expect(errFn(a, b)).toBe(v02.errFn(a, b));
  });

  test('KNOBS are the same search space', () => {
    expect(KNOBS.map((k) => ({ k: k.k, lo: k.lo, hi: k.hi, s0: k.s0, min: k.min }))).toEqual(
      v02.KNOBS.map((k) => ({ k: k.k, lo: k.lo, hi: k.hi, s0: k.s0, min: k.min })),
    );
  });

  test.each(CASES)('measureInit and every step of createFit match v0.2 ($name)', ({ p }) => {
    const low = downsample(renderScene(p, W, H, 0.012).rgb, W, H, 6);
    expect(measureInit(low, FW, FH, baseOf(p))).toEqual(v02.measureInit(low, FW, FH, baseOf(p)));
    const ours = createFit(low, FW, FH, baseOf(p)), theirs = v02.createFit(low, FW, FH, baseOf(p));
    for (let n = 0; n < 400; n++) {
      const a = ours.step(), b = theirs.step();
      expect(a).toEqual(b);
      if (a.done) break;
    }
  });

  test.each(CASES)('cheekStats matches v0.2 ($name)', ({ p }) => {
    const img = renderScene(p, W, H, 0.012).rgb;
    expect(cheekStats(img, W, H, baseOf(p))).toEqual(v02.cheekStats(img, W, H, baseOf(p)));
  });
});

describe('the five v0.2 cases at v0.2 thresholds (softness reported, not asserted)', () => {
  test.each(CASES)('$name: az ≤ 15°, el ≤ 8°, kelvin ≤ 500 K, fill ≤ 0.6 stops, residual ≤ 0.02', ({ p }) => {
    const low = downsample(renderScene(p, W, H, 0.012).rgb, W, H, 6);
    const r = runFit(low, FW, FH, baseOf(p));
    expect(r.done).toBe(true);
    expect(Math.abs(r.p.az - p.az)).toBeLessThanOrEqual(TOL.az);
    expect(Math.abs(r.p.el - p.el)).toBeLessThanOrEqual(TOL.el);
    expect(Math.abs(r.p.kel - p.kel)).toBeLessThanOrEqual(TOL.kel);
    expect(Math.abs(r.p.fill - p.fill)).toBeLessThanOrEqual(TOL.fill);
    expect(r.err).toBeLessThanOrEqual(TOL.err);
  });
});

describe('runFit', () => {
  test('stops on its own and reports the steps it took', () => {
    const p = CASES[3].p;
    const r = runFit(downsample(renderScene(p, W, H, 0).rgb, W, H, 6), FW, FH, baseOf(p));
    expect(r.steps).toBeGreaterThan(2);
    expect(r.steps).toBeLessThanOrEqual(400);
    expect(r.logs.length).toBeGreaterThan(0);
  });
});
