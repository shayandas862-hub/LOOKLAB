// P3 task 2: the lens from the original file's EXIF, and the two sources AD-LL-010 adds. EXIF is metadata,
// not pixels: the focal length reads METADATA, never MEASURED, and a value set by hand is kept.
import { beforeEach, describe, expect, test } from 'vitest';
import { createHash } from 'node:crypto';
import { buildRegistry, type Registry } from '../../src/actions/index.ts';
import { seedSampleIfEmpty } from '../../src/actions/seed.ts';
import { weakest } from '../../src/actions/domains/breakdown-shared.ts';
import { NumValue, Source } from '../../src/contracts/index.ts';
import { encodePng } from '../../src/engine/png.ts';
import { memoryContext } from './memory-context.ts';
import { stripes } from '../core/synth.ts';

let ctx: ReturnType<typeof memoryContext>;
let registry: Registry;
const run = async <T = any>(name: string, input: object = {}) => (await registry.invoke(name, input, ctx.for('ui'))).result as T; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Imports one image frame; `exif` is what the browser read from the original file. */
async function importImage(name: string, exif?: { focal_mm: number | null; focal_35mm: number | null } | null) {
  const { px } = stripes(64, 36, [['#2A3F66', 60], ['#D9A441', 40]]);
  const r = await run<{ reference_id: string }>('breakdown.import_reference', {
    file_name: name, media: 'image', mime: 'image/jpeg', size_bytes: 1234, sha256: createHash('sha256').update(name).digest('hex'),
    last_modified: null, width: 256, height: 144, frame_count: 1, ...(exif === undefined ? {} : { exif }),
  });
  await run('breakdown.add_frame', { reference_id: r.reference_id, index: 0, png_base64: Buffer.from(encodePng(px)).toString('base64') });
  return r.reference_id;
}

beforeEach(async () => {
  ctx = memoryContext();
  registry = buildRegistry();
  await seedSampleIfEmpty(ctx.store, '2026-09-30T12:00:00Z', 'tester', 'local');
});

describe('AD-LL-010: two new sources', () => {
  test('a value may be an estimate or metadata; neither needs a confidence', () => {
    for (const source of ['estimate', 'metadata'] as const) {
      expect(NumValue.parse({ value: 1, source, updated_by: 't', updated_at: 'now' }).source).toBe(source);
    }
    expect(Source.options).toEqual(['measured', 'manual', 'metadata', 'estimate', 'ai', 'sample']);
  });

  test('the weakest source in a group: measured, manual, metadata, estimate, ai, sample', () => {
    expect(weakest(['measured', 'manual'])).toBe('manual');
    expect(weakest(['manual', 'metadata'])).toBe('metadata');
    expect(weakest(['metadata', 'estimate', 'measured'])).toBe('estimate');
    expect(weakest(['estimate', 'ai'])).toBe('ai');
    expect(weakest(['ai', 'sample', 'estimate'])).toBe('sample');
  });
});

describe('lens from EXIF', () => {
  test('the 35 mm equivalent is used when the file has it, as metadata', async () => {
    const ref = await importImage('still.jpg', { focal_mm: 50, focal_35mm: 75 });
    expect((await run('breakdown.get_reference', { reference_id: ref })).exif).toEqual({ focal_mm: 50, focal_35mm: 75 });
    const b = await run('breakdown.analyse');
    expect(b.lens.focal_mm).toMatchObject({ value: 75, unit: 'mm (35 mm equiv.)', source: 'metadata' });
  });

  test('only the actual focal length: it is used and says the sensor is unknown', async () => {
    await importImage('still.jpg', { focal_mm: 35, focal_35mm: null });
    const b = await run('breakdown.analyse');
    expect(b.lens.focal_mm).toMatchObject({ value: 35, unit: 'mm (actual; sensor size unknown)', source: 'metadata' });
  });

  test('no EXIF: the focal length stays sample until a person sets it', async () => {
    await importImage('frame.png');
    expect((await run('breakdown.analyse')).lens.focal_mm.source).toBe('sample');
    await run('breakdown.edit_value', { field: 'lens.focal_mm', value: 32 });
    expect((await run('breakdown.get')).lens.focal_mm).toMatchObject({ value: 32, source: 'manual' });
  });

  test('a focal length set by hand survives re-analysis of a file with EXIF', async () => {
    await importImage('still.jpg', { focal_mm: 50, focal_35mm: 75 });
    await run('breakdown.analyse');
    await run('breakdown.edit_value', { field: 'lens.focal_mm', value: 40 });
    expect((await run('breakdown.analyse')).lens.focal_mm).toMatchObject({ value: 40, source: 'manual' });
  });

  test('a new file without EXIF does not inherit the last file\'s focal length', async () => {
    await importImage('still.jpg', { focal_mm: 50, focal_35mm: 75 });
    await run('breakdown.analyse');
    await importImage('other.png', null);
    expect((await run('breakdown.analyse')).lens.focal_mm.source).toBe('sample');
  });

  test('focal lengths outside what a lens can be are refused', async () => {
    await expect(importImage('a.jpg', { focal_mm: 0, focal_35mm: null })).rejects.toThrow(/focal_mm/);
    await expect(importImage('b.jpg', { focal_mm: 50, focal_35mm: 6000 })).rejects.toThrow(/focal_35mm/);
  });

  test('fit_lens is still a stand-in for depth of field, height, angle and movement', () => {
    expect(registry.get('breakdown.fit_lens')!.standIn).toBe(true);
  });
});
