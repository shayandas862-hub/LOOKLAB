// The kit's colour facts, entered by a person (P4.5, AD-LL-014, D-LL-051): gels typed from the founder's swatch book,
// each light's colour range from its sheet, what the camera records, monitoring and charts. Every typed number carries
// its citation. A helper (command: false) until the design export adds the kit colour editor (D-LL-052).
import { beforeEach, describe, expect, test } from 'vitest';
import { buildRegistry, type Registry } from '../../src/actions/index.ts';
import { seedSampleIfEmpty } from '../../src/actions/seed.ts';
import { Kit } from '../../src/contracts/index.ts';
import { memoryContext } from './memory-context.ts';

const NOW = '2026-10-02T10:00:00.000Z';
const v = (value: number | boolean) => ({ value, source: 'manual', updated_by: 'founder', updated_at: NOW });
const CITE = { document: 'Swatch book (founder\'s copy)', where: 'Full CTO swatch', read: '2026-10-02', licence: 'typed-by-founder' };
let ctx: ReturnType<typeof memoryContext>;
let registry: Registry;
const run = (input: object, via: 'ui' | 'mcp' = 'ui') => registry.invoke('adapt.set_kit_colour', input, ctx.for(via));
const kit = async () => Kit.parse(await ctx.store.get('projects/neel/kits', 'neel-kit'));

beforeEach(async () => {
  ctx = memoryContext({ start: NOW });
  registry = buildRegistry();
  await seedSampleIfEmpty(ctx.store, NOW, 'tester', 'local');
});

describe('adapt.set_kit_colour', () => {
  test('adds a gel with its citation, and replaces it by id', async () => {
    const gel = { id: 'cto-full', maker: 'Lee', number: '204', name: 'Full CT Orange', mired_shift: v(159), converts: null, duv_shift: null, transmission_pct: null, sheets: 2, cite: CITE };
    await run({ gel });
    await run({ gel: { ...gel, sheets: 3 } });
    expect((await kit()).gels).toEqual([expect.objectContaining({ id: 'cto-full', sheets: 3 })]);
    expect(ctx.decisions.at(-1)).toMatchObject({ command: 'adapt.set_kit_colour', tier: 'T0', ok: true });
  });

  test('a typed number without a citation is refused; a gel can be removed', async () => {
    const gel = { id: 'cto-half', maker: 'Lee', number: '205', name: '½ CT Orange', mired_shift: v(81), converts: null, duv_shift: null, transmission_pct: null, sheets: 1 };
    await expect(run({ gel })).rejects.toThrow(/cite/);
    await run({ gel: { ...gel, cite: CITE } });
    await run({ remove_gel: 'cto-half' });
    expect((await kit()).gels).toEqual([]);
  });

  test('a light\'s colour range goes on that light only', async () => {
    const colour = { cct_min_k: v(2700), cct_max_k: v(6500), cct_step_k: v(100), gm: null, rgb: v(false), flicker_free: v(true), cite: { ...CITE, document: 'COB sheet' } };
    await run({ light: { item_id: 'cob600', colour } });
    expect((await kit()).items.find((i) => i.id === 'cob600')!.colour).toMatchObject({ cct_min_k: { value: 2700, source: 'manual' } });
    await expect(run({ light: { item_id: 'flags', colour } })).rejects.toThrow(/not a light/);
    await expect(run({ light: { item_id: 'nope', colour } })).rejects.toThrow(/not in the kit/);
  });

  test('monitoring and charts are set by hand, as manual', async () => {
    await run({ monitoring: { external: true, loads_cube: true, cube_sizes: [33] }, charts: { colorchecker: 'classic', grey_card: true } });
    const k = await kit();
    expect(k.monitoring).toMatchObject({ external: true, loads_cube: true, source: 'manual' });
    expect(k.charts).toMatchObject({ colorchecker: 'classic', grey_card: true, source: 'manual' });
  });

  test('is a T0 helper until the design export adds the kit colour editor; it works with No AI', async () => {
    ctx.settings.no_ai = true;
    expect(registry.get('adapt.set_kit_colour')).toMatchObject({ command: false, tier: 'T0', ai: false, standIn: false });
    await run({ charts: { colorchecker: 'none', grey_card: true } });
  });
});
