// The light fit against the Blender ground truth (P3). A claim about the Blender set only; nothing here says
// anything about real footage (standing rule 3). The dev set shows the objective change is needed (D-LL-035):
// the ported whole-crop objective fails it and the skin pattern does not. The held-out set gives the P3 numbers
// and decides what the Breakdown writes (src/core/light-validation.ts). Runs on the committed renders: no Blender.
import { describe, expect, test } from 'vitest';
import { fitFace } from '../../src/core/light-face.ts';
import { fitSkin } from '../../src/core/light-skin.ts';
import { CONFIDENCE_SHOWN, TOLERANCE, WRITE } from '../../src/core/light-validation.ts';
import { loadSet, median, scoreScene, spearman, table, type Fitter, type Row } from '../../scripts/blender/score.ts';

const run = (set: string, fit: Fitter) => loadSet(set).map((sc) => scoreScene(sc, fit));
const med = (rows: Row[], k: 'az' | 'el' | 'angle' | 'kelvin' | 'fill' | 'softness') => median(rows.map((r) => r[k]));

describe('dev set: the objective change (D-LL-035) is what makes the fit work', () => {
  test('the ported whole-crop objective fails; the skin pattern passes (regression guards just under the measured values)', () => {
    const before = run('dev', fitFace), after = run('dev', fitSkin);
    expect(med(before, 'angle')).toBeGreaterThan(30); // measured 45.0°
    expect(med(after, 'angle')).toBeLessThan(20);     // measured 16.2°
    expect(med(after, 'az')).toBeLessThanOrEqual(15);
    expect(med(after, 'el')).toBeLessThanOrEqual(10);
  }, 120_000);
});

describe('held-out set (Blender only): P3 acceptance and what the Breakdown may write', () => {
  const rows = run('test', fitSkin);
  const light = rows.filter((r) => r.tone === 'light'), dark = rows.filter((r) => r.tone === 'dark');
  const worst = rows.reduce((w, r) => (r.angle > w.angle ? r : w));
  const rho = spearman(rows.map((r) => r.confidence ?? 0), rows.map((r) => -r.angle));
  console.log(`\nHeld-out Blender set, ${rows.length} scenes (Blender only; no claim about real footage):\n${table(rows)}\n` +
    `worst direction: ${worst.id}, true az ${worst.truth.az}° el ${worst.truth.el}°, fitted az ${worst.fit.az.toFixed(0)}° el ${worst.fit.el.toFixed(0)}° (${worst.angle.toFixed(0)}° off)\n` +
    `Spearman(confidence, −direction error) = ${rho.toFixed(2)}; fit time median ${median(rows.map((r) => r.ms)).toFixed(0)} ms\n`);

  test('median az error ≤ 15° and el ≤ 10°, light and dark skin reported separately', () => {
    expect(rows.length).toBeGreaterThanOrEqual(20);
    expect(light.length).toBe(dark.length);
    expect(med(rows, 'az')).toBeLessThanOrEqual(15);
    expect(med(rows, 'el')).toBeLessThanOrEqual(10);
  });

  test('kelvin, fill and hardness are written only if they met their tolerance on this set', () => {
    expect(WRITE.direction).toBe(true);
    expect(WRITE.kelvin).toBe(med(rows, 'kelvin') <= TOLERANCE.kelvin);
    expect(WRITE.fill).toBe(med(rows, 'fill') <= TOLERANCE.fill);
    expect(WRITE.hardness).toBe(med(rows, 'softness') <= TOLERANCE.softness);
  });

  test('a confidence is shown only if it ranks with the error: Spearman ≥ 0.5', () => {
    expect(CONFIDENCE_SHOWN).toBe(rho >= 0.5);
  });
});
