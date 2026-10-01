// The Blender ground-truth sets (P3 task 3): the planner draws every rig from a seed, so the truth JSON is
// deterministic and checkable without Blender; the committed renders and truth let the accuracy test run
// without Blender. `npm run blender-set` regenerates both sets.
import { describe, expect, test } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { planSet, SETS, planckRGB } from '../../scripts/blender/plan.ts';
import { decodePng } from '../../src/engine/png.ts';

const FIX = join(import.meta.dirname, '..', 'fixtures', 'blender');

describe('the planner', () => {
  test('same seed, same truth; another seed, another set', () => {
    expect(planSet('dev', 1, 8)).toEqual(planSet('dev', 1, 8));
    expect(JSON.stringify(planSet('dev', 1, 8))).not.toBe(JSON.stringify(planSet('dev', 3, 8)));
  });

  test('every rig is rendered with light and with dark skin, the same light for both', () => {
    const s = planSet('test', 2, 12);
    expect(s).toHaveLength(24);
    for (let k = 0; k < 12; k++) {
      const [a, b] = s.filter((x) => x.rig === k + 1);
      expect([a.skin.tone, b.skin.tone].sort()).toEqual(['dark', 'light']);
      expect(a.key).toEqual(b.key);
      expect(a.fill).toEqual(b.fill);
      expect(a.camera).toEqual(b.camera);
    }
  });

  test('the truth is inside the ranges the set promises, and every face box is inside the frame', () => {
    for (const x of [...planSet('dev', 1, 8), ...planSet('test', 2, 12)]) {
      expect(Math.abs(x.key.az)).toBeLessThanOrEqual(135);
      expect(x.key.el).toBeGreaterThanOrEqual(0);
      expect(x.key.el).toBeLessThanOrEqual(60);
      expect(x.key.kelvin).toBeGreaterThanOrEqual(2900);
      expect(x.key.kelvin).toBeLessThanOrEqual(6800);
      expect(x.fill.stops).toBeGreaterThanOrEqual(0.5);
      expect(x.fill.stops).toBeLessThanOrEqual(3.5);
      expect(x.key.softness).toBeGreaterThanOrEqual(0);
      expect(x.key.softness).toBeLessThanOrEqual(1);
      const f = x.face_box;
      expect(f.x).toBeGreaterThan(0);
      expect(f.y).toBeGreaterThan(0);
      expect(f.x + f.w).toBeLessThan(1);
      expect(f.y + f.h).toBeLessThan(1);
      expect(f.h * 288).toBeGreaterThan(60);
    }
  });

  test('the held-out set covers the directions a key comes from: every 45° band of azimuth has a rig', () => {
    const az = planSet('test', 2, 12).map((x) => x.key.az);
    for (let lo = -135; lo < 135; lo += 45) expect(az.some((a) => a >= lo && a < lo + 45), `band ${lo}`).toBe(true);
  });

  test('kelvin is white-balanced at 5600 K from Planck\'s law: 5600 K is neutral, 3200 K warm, 6500 K cool', () => {
    expect(planckRGB(5600).map((v) => Math.round(v * 1000) / 1000)).toEqual([1, 1, 1]);
    const w = planckRGB(3200), c = planckRGB(6500);
    expect(w[0] / w[2]).toBeGreaterThan(1.5);
    expect(c[2] / c[0]).toBeGreaterThan(1.05);
  });
});

describe('the committed sets', () => {
  test.each(SETS)('$name: every render has its truth beside it, and the truth is what the planner makes', ({ name, seed, rigs }) => {
    const dir = join(FIX, name);
    expect(existsSync(dir), `${dir} missing: run npm run blender-set`).toBe(true);
    const plan = planSet(name, seed, rigs);
    const files = readdirSync(dir);
    expect(files.filter((f) => f.endsWith('.png'))).toHaveLength(plan.length);
    for (const x of plan) {
      expect(JSON.parse(readFileSync(join(dir, `${x.id}.json`), 'utf8')), x.id).toEqual(x);
      const px = decodePng(readFileSync(join(dir, `${x.id}.png`)));
      expect([px.width, px.height]).toEqual([512, 288]);
    }
  });

  test('the held-out set has at least 20 scenes, with light and dark skin', () => {
    const t = SETS.find((s) => s.name === 'test')!;
    const plan = planSet(t.name, t.seed, t.rigs);
    expect(plan.length).toBeGreaterThanOrEqual(20);
    expect(new Set(plan.map((x) => x.skin.tone))).toEqual(new Set(['light', 'dark']));
    expect(new Set(plan.map((x) => x.background)).size).toBeGreaterThanOrEqual(4);
  });
});
