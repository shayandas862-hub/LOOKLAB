// The colour contracts (P4.5): AD-LL-014 (the kit's colour facts), AD-LL-015 (project and location colour settings),
// AD-LL-016 (green–magenta on the light). All additive: every record written before P4.5 still parses, with defaults
// that read as sample. A number typed from a maker's document carries its citation, or it is refused (CLAUDE.md rule 16).
import { describe, expect, test } from 'vitest';
import { Breakdown, Gel, Kit, LightColour, Location, Project } from '../../src/contracts/index.ts';
import { sampleSeed } from '../../src/actions/sample.ts';
import { buildRegistry } from '../../src/actions/index.ts';
import { seedSampleIfEmpty } from '../../src/actions/seed.ts';
import { memoryContext } from './memory-context.ts';

const NOW = '2026-10-02T10:00:00.000Z';
/** The sample records as P4 stored them: without any field P4.5 adds. */
const seed = () => {
  const d = JSON.parse(JSON.stringify(sampleSeed(NOW, 'tester', 'local')));
  delete d.project.colour; delete d.location.mains_hz;
  delete d.kit.gels; delete d.kit.monitoring; delete d.kit.charts; delete d.kit.camera.recording;
  for (const i of d.kit.items) delete i.colour;
  delete d.breakdown.light.key_gm; delete d.breakdown.light.fill_gm;
  return d;
};
const v = (value: number, source = 'manual') => ({ value, source, updated_by: 'founder', updated_at: NOW });
const CITE = { document: 'Maker sheet (test)', where: 'p. 2', read: '2026-10-02', licence: 'typed-by-founder' };

describe('records written before P4.5 still parse, and the new fields read as sample', () => {
  test('kit: no gels, no camera recording yet, no monitor that loads a .cube, no charts', () => {
    const k = Kit.parse(seed().kit);
    expect(k.gels).toEqual([]);
    expect(k.camera.recording).toBeNull();
    expect(k.monitoring).toMatchObject({ external: false, loads_cube: false, source: 'sample' });
    expect(k.charts).toMatchObject({ colorchecker: 'none', grey_card: false, source: 'sample' });
    expect(k.items.every((i) => i.colour === null)).toBe(true);
  });

  test('project: delivery Rec.709 Gamma 2.4, YRGB, 24 fps as sample until confirmed (D-LL-051); location: 50 Hz mains, sample', () => {
    const p = Project.parse(seed().project);
    expect(p.colour).toMatchObject({ delivery: 'rec709_g24', web: 'same_codes', grading_app: 'DaVinci Resolve', management: 'yrgb' });
    expect(p.colour.frame_rate).toMatchObject({ value: 24, source: 'sample' });
    expect(Location.parse(seed().location).mains_hz).toMatchObject({ value: 50, source: 'sample' });
  });

  test('breakdown: key and fill green–magenta default to 0, sample (no frame measures it, P-LL-001 §3)', () => {
    const b = Breakdown.parse(seed().breakdown);
    expect(b.light.key_gm).toMatchObject({ value: 0, unit: 'Duv', source: 'sample' });
    expect(b.light.fill_gm).toMatchObject({ value: 0, unit: 'Duv', source: 'sample' });
  });
});

describe('citations', () => {
  const colour = { cct_min_k: v(2700), cct_max_k: v(6500), cct_step_k: v(100), gm: null, rgb: { ...v(0), value: false }, flicker_free: { ...v(0), value: true } };

  test('a light\'s colour range typed from a document needs its citation', () => {
    expect(LightColour.safeParse({ ...colour, cite: null }).success).toBe(false);
    expect(LightColour.safeParse({ ...colour, cite: CITE }).success).toBe(true);
  });

  test('sample numbers need no citation; they read SAMPLE', () => {
    const sample = Object.fromEntries(Object.entries(colour).map(([k, x]) => [k, x && { ...x, source: 'sample' }]));
    expect(LightColour.safeParse({ ...sample, cite: null }).success).toBe(true);
  });

  test('a gel always carries its citation and a shift in mired, warmer positive', () => {
    const gel = { id: 'g1', maker: 'Lee', number: '204', name: 'Full CT Orange', mired_shift: v(159), converts: null, duv_shift: null, transmission_pct: null, sheets: 1 };
    expect(Gel.safeParse(gel).success).toBe(false);
    expect(Gel.safeParse({ ...gel, cite: CITE }).success).toBe(true);
  });
});

test('green–magenta can be set by hand on the key and the fill', async () => {
  const ctx = memoryContext();
  const registry = buildRegistry();
  await seedSampleIfEmpty(ctx.store, NOW, 'tester', 'local');
  await registry.invoke('breakdown.edit_value', { field: 'light.key_gm', value: 0.004 }, ctx.for('ui'));
  const b = (await registry.invoke('breakdown.get', {}, ctx.for('ui'))).result as { light: { key_gm: object } };
  expect(b.light.key_gm).toMatchObject({ value: 0.004, source: 'manual' });
});
