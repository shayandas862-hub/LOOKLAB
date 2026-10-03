// The grade check as actions (P4.5, AD-LL-018, P-LL-001 §4.6, §8): import a still, check it against the shot's measured
// reference frame with the same instruments, keep each check. Helpers (command: false) until the colour design export
// adds their buttons (D-LL-052); Claude Code can already call them over MCP.
import { beforeEach, describe, expect, test } from 'vitest';
import { createHash } from 'node:crypto';
import { buildRegistry, type Registry } from '../../src/actions/index.ts';
import { seedSampleIfEmpty } from '../../src/actions/seed.ts';
import { GradeCheck, Still } from '../../src/contracts/index.ts';
import { encodePng } from '../../src/engine/png.ts';
import { stripes } from '../core/synth.ts';
import { memoryContext } from './memory-context.ts';

const REF: [string, number][] = [['#2A3F66', 40], ['#D9A441', 25], ['#7A2E2E', 20], ['#E8E4DA', 15]];
const GRADED: [string, number][] = [['#3A4A66', 40], ['#E8B048', 25], ['#8A3A30', 20], ['#F2EADA', 15]];
const png = (p: [string, number][]) => Buffer.from(encodePng(stripes(120, 50, p).px));
let ctx: ReturnType<typeof memoryContext>;
let registry: Registry;
const run = (name: string, input: object = {}) => registry.invoke(name, input, ctx.for('ui')).then((r) => r.result as any); // eslint-disable-line @typescript-eslint/no-explicit-any
const fail = (name: string, input: object = {}) => registry.invoke(name, input, ctx.for('ui')).then(() => null, (e) => e);

async function measuredReference() {
  const bytes = png(REF);
  const { reference_id } = await run('breakdown.import_reference', {
    file_name: 'ref.png', media: 'image', mime: 'image/png', size_bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'),
    last_modified: null, width: 120, height: 50, duration_s: 0, sample_fps: 0, frame_count: 1,
  });
  await run('breakdown.add_frame', { reference_id, index: 0, png_base64: bytes.toString('base64') });
  await run('breakdown.analyse');
}
const still = (p: [string, number][], over: object = {}) => {
  const bytes = png(p);
  return { file_name: 'test-shoot.png', mime: 'image/png', size_bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), last_modified: null, kind: 'display', png_base64: bytes.toString('base64'), ...over };
};

beforeEach(async () => {
  ctx = memoryContext({ start: '2026-10-02T10:00:00Z' });
  registry = buildRegistry();
  await seedSampleIfEmpty(ctx.store, '2026-10-02T09:00:00Z', 'tester', 'local');
});

describe('colour.import_still', () => {
  test('keeps the still\'s facts and its one frame; never the file or its path', async () => {
    const r = await run('colour.import_still', still(GRADED));
    expect(r).toMatchObject({ still_id: expect.stringMatching(/^still-[0-9a-f]{12}$/), width: 120, height: 50, kind: 'display' });
    const s = Still.parse(await ctx.store.get('projects/neel/stills', r.still_id));
    expect(s).toMatchObject({ shot_id: '12C', kind: 'display', face: null, chart: null });
    expect(s.file).toMatchObject({ name: 'test-shoot.png', mime: 'image/png' });
    expect(await ctx.store.getBlob(`projects/neel/stills/${r.still_id}`, 'frame.png')).not.toBeNull();
  });

  test('refuses what is not an 8-bit PNG frame of at most 512 px', async () => {
    expect((await fail('colour.import_still', still(GRADED, { png_base64: Buffer.from('this is plainly not a png file').toString('base64') }))).message).toMatch(/not a PNG/);
    const big = Buffer.from(encodePng(stripes(600, 50, REF).px)).toString('base64');
    expect((await fail('colour.import_still', still(GRADED, { png_base64: big }))).message).toMatch(/at most 512 px/);
  });
});

describe('colour.check_grade (T0)', () => {
  test('a still identical to the reference frame reads zero on every row, and the check is kept', async () => {
    await measuredReference();
    const { still_id } = await run('colour.import_still', still(REF));
    const r = await run('colour.check_grade', { still_id });
    for (const row of r.rows) expect(row.diff, row.measure).toBe(0);
    expect(r.swatches.every((s: { verdict: string }) => s.verdict === 'pass')).toBe(true);
    const kept = GradeCheck.parse(await ctx.store.get('projects/neel/gradechecks', r.check_id));
    expect(kept).toMatchObject({ shot_id: '12C', still_id, frame_index: 0, lut_applied: false, thresholds_version: 1 });
    expect(kept.rows.every((row) => row.source === 'measured')).toBe(true);
    expect(ctx.decisions.at(-1)).toMatchObject({ command: 'colour.check_grade', tier: 'T0', ok: true, stand_in: false });
  });

  test('a graded still is told apart: some row or swatch is close or far', async () => {
    await measuredReference();
    const { still_id } = await run('colour.import_still', still(GRADED));
    const r = await run('colour.check_grade', { still_id });
    const verdicts = [...r.rows, ...r.swatches].map((x: { verdict: string }) => x.verdict);
    expect(verdicts.some((v: string) => v !== 'pass')).toBe(true);
    expect((await run('colour.get_check', {})).check_id).toBe(r.check_id);
  });

  test('without a measured reference it says to import one; a log still waits for the look LUT', async () => {
    const { still_id } = await run('colour.import_still', still(GRADED));
    expect((await fail('colour.check_grade', { still_id })).message).toMatch(/import a reference/i);
    await measuredReference();
    const log = await run('colour.import_still', still(GRADED, { kind: 'log', sha256: 'c'.repeat(64) }));
    expect((await fail('colour.check_grade', { still_id: log.still_id })).message).toMatch(/look LUT/);
  });

  test('the three are helpers until the design export adds their buttons, and T0: they work with No AI', async () => {
    ctx.settings.no_ai = true;
    for (const n of ['colour.import_still', 'colour.check_grade', 'colour.get_check']) {
      expect(registry.get(n), n).toMatchObject({ command: false, tier: 'T0', ai: false, standIn: false });
    }
  });
});
