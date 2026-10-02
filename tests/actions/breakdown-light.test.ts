// P3 task 4: breakdown.fit_light is real (T0). A person marks the face by hand (breakdown.set_face, as the subject
// is, D-LL-028); the fit runs on that box (D-LL-033, D-LL-035) and writes what met its tolerance on the held-out
// Blender set (D-LL-037) as `estimate`, never `measured` (AD-LL-010). Run on a committed Blender render.
import { beforeEach, describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { buildRegistry, type Registry } from '../../src/actions/index.ts';
import { seedSampleIfEmpty } from '../../src/actions/seed.ts';
import { memoryContext } from './memory-context.ts';

const SCENE = 'test-03-light';
const DIR = join(import.meta.dirname, '..', 'fixtures', 'blender', 'test');
const truth = JSON.parse(readFileSync(join(DIR, `${SCENE}.json`), 'utf8'));
const PNG = readFileSync(join(DIR, `${SCENE}.png`));

let ctx: ReturnType<typeof memoryContext>;
let registry: Registry;
const run = async <T = any>(name: string, input: object = {}) => (await registry.invoke(name, input, ctx.for('ui'))).result as T; // eslint-disable-line @typescript-eslint/no-explicit-any
const azErr = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

async function importRender(name = `${SCENE}.png`, bytes: Buffer = PNG) {
  const r = await run<{ reference_id: string }>('breakdown.import_reference', {
    file_name: name, media: 'image', mime: 'image/png', size_bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'),
    last_modified: null, width: 512, height: 288, frame_count: 1,
  });
  await run('breakdown.add_frame', { reference_id: r.reference_id, index: 0, png_base64: bytes.toString('base64') });
  await run('breakdown.analyse');
  return r.reference_id;
}

beforeEach(async () => {
  ctx = memoryContext();
  registry = buildRegistry();
  await seedSampleIfEmpty(ctx.store, '2026-09-30T12:00:00Z', 'tester', 'local');
});

describe('what is real in P3 (standing rule 2)', () => {
  test('fit_light carries no stand-in flag (P3 took the count from 19 to 18; tests/actions/standins.test.ts owns the count now)', () => {
    expect(registry.get('breakdown.fit_light')!.standIn).toBe(false);
  });

  test('set_face is a helper, not a command, so the design catalogue parity holds', () => {
    expect(registry.get('breakdown.set_face')!.command).toBe(false);
    expect(registry.get('breakdown.fit_light')!.command).not.toBe(false);
  });
});

describe('the face box, by hand', () => {
  test('fit_light refuses a shot with no face box and says how to mark one', async () => {
    await importRender();
    await expect(run('breakdown.fit_light')).rejects.toThrow(/no face box.*breakdown\.set_face/s);
  });

  test('set_face refuses before the reference has been measured', async () => {
    await expect(run('breakdown.set_face', { x: 0.2, y: 0.2, w: 0.2, h: 0.4 })).rejects.toThrow(/import|measure/i);
  });

  test('set_face stores the box by hand, on the frame it was drawn on', async () => {
    await importRender();
    const r = await run('breakdown.set_face', truth.face_box);
    expect(r).toMatchObject({ source: 'manual', frame_index: 0 });
    expect((await run('breakdown.get')).face).toEqual({ ...truth.face_box, frame_index: 0 });
  });

  test.each([
    ['outside the frame', { x: 0.9, y: 0.2, w: 0.3, h: 0.5 }, /inside the frame/],
    ['too small', { x: 0.4, y: 0.4, w: 0.02, h: 0.05 }, /too small/],
    ['not face-shaped', { x: 0.1, y: 0.4, w: 0.8, h: 0.1 }, /tall/],
  ])('set_face refuses a box %s, and says why', async (_n, box, why) => {
    await importRender();
    await expect(run('breakdown.set_face', box)).rejects.toThrow(why);
  });

  test('a new import clears the face box: it belonged to the old picture', async () => {
    await importRender();
    await run('breakdown.set_face', truth.face_box);
    await importRender('other.png', Buffer.concat([PNG]));
    expect((await run('breakdown.get')).face).toEqual({ ...truth.face_box, frame_index: 0 });
    const other = readFileSync(join(DIR, 'test-04-light.png'));
    await importRender('test-04-light.png', other);
    expect((await run('breakdown.get')).face).toBeNull();
  });
});

describe('fit_light on a Blender render (a Blender scene; no claim about real footage)', () => {
  test('writes direction and key colour as estimates, never measured; fill and hardness are not written', async () => {
    await importRender();
    const before = (await run('breakdown.get')).light;
    await run('breakdown.set_face', truth.face_box);
    const { light, fit } = await run('breakdown.fit_light');
    for (const k of ['key_az', 'key_el', 'key_kelvin']) expect(light[k].source, k).toBe('estimate');
    expect(JSON.stringify(light)).not.toContain('"measured"');
    expect(light.ratio).toEqual(before.ratio);
    expect(light.key_hardness).toEqual(before.key_hardness);
    expect(azErr(light.key_az.value, truth.key.az)).toBeLessThanOrEqual(15);
    expect(Math.abs(light.key_el.value - truth.key.el)).toBeLessThanOrEqual(15);
    expect(fit.written).toEqual(['light.key_az', 'light.key_el', 'light.key_kelvin']);
    expect(fit.not_written).toEqual(expect.arrayContaining(['light.ratio', 'light.key_hardness']));
    expect(fit.assumed).toMatch(/faces the camera/);
    expect((await run('breakdown.get')).light.key_az).toEqual(light.key_az);
  });

  test('direction carries the confidence score (it ranked with error on the held-out set); kelvin does not', async () => {
    await importRender();
    await run('breakdown.set_face', truth.face_box);
    const { light, fit } = await run('breakdown.fit_light');
    expect(light.key_az.confidence).toBe(fit.confidence);
    expect(light.key_el.confidence).toBe(fit.confidence);
    expect(fit.confidence).toBeGreaterThanOrEqual(0);
    expect(light.key_kelvin.confidence).toBeUndefined();
  });

  test('a value set by hand survives the fit', async () => {
    await importRender();
    await run('breakdown.set_face', truth.face_box);
    await run('breakdown.edit_value', { field: 'light.key_az', value: -30 });
    const { light, fit } = await run('breakdown.fit_light');
    expect(light.key_az).toMatchObject({ value: -30, source: 'manual' });
    expect(fit.written).not.toContain('light.key_az');
  });

  test('a saved look\'s light is not called measured', async () => {
    await importRender();
    await run('breakdown.set_face', truth.face_box);
    await run('breakdown.fit_light');
    const { look_id } = await run('breakdown.save_look');
    const look = (await run<{ looks: { id: string; light_source: string }[] }>('library.list')).looks.find((l) => l.id === look_id)!;
    expect(look.light_source).not.toBe('measured');
  });
});
