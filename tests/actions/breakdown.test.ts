// P2 through the registry: import a reference, add its frames, measure it, and keep sources honest.
import { beforeEach, describe, expect, test } from 'vitest';
import { createHash } from 'node:crypto';
import { buildRegistry, type Registry } from '../../src/actions/index.ts';
import { seedSampleIfEmpty } from '../../src/actions/seed.ts';
import { deltaE2000, hexToLab } from '../../src/core/colour.ts';
import type { Pixels } from '../../src/core/image.ts';
import { encodePng } from '../../src/engine/png.ts';
import { memoryContext } from './memory-context.ts';
import { addNoise, blank, stripes } from '../core/synth.ts';

const PATCHES: [string, number][] = [['#2A3F66', 40], ['#D9A441', 25], ['#7A2E2E', 20], ['#E8E4DA', 15]];

let ctx: ReturnType<typeof memoryContext>;
let registry: Registry;
const run = async <T = any>(name: string, input: object = {}) => (await registry.invoke(name, input, ctx.for('ui'))).result as T; // eslint-disable-line @typescript-eslint/no-explicit-any

const b64 = (px: Pixels) => Buffer.from(encodePng(px)).toString('base64');
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

async function importFrames(frames: Pixels[], opts: { media?: 'image' | 'video'; fps?: number; name?: string; shot?: string } = {}) {
  const media = opts.media ?? (frames.length > 1 ? 'video' : 'image');
  const fps = opts.fps ?? (media === 'video' ? 2 : 0);
  const name = opts.name ?? `clip-${frames.length}.${media === 'video' ? 'mp4' : 'png'}`;
  const r = await run<{ reference_id: string; frame_count: number }>('breakdown.import_reference', {
    shot_id: opts.shot ?? '12C', file_name: name, media, mime: media === 'video' ? 'video/mp4' : 'image/png',
    size_bytes: 1000 + frames.length, sha256: sha(name), last_modified: null,
    width: frames[0].width * 4, height: frames[0].height * 4, duration_s: media === 'video' ? frames.length / fps : 0,
    sample_fps: fps, frame_count: frames.length,
  });
  for (let i = 0; i < frames.length; i++) await run('breakdown.add_frame', { reference_id: r.reference_id, index: i, png_base64: b64(frames[i]) });
  return r.reference_id;
}

/** A clip of flat colour shots with noise; each entry is [hex, number of sampled frames]. */
function clip(shots: [string, number][]): Pixels[] {
  const out: Pixels[] = [];
  let seed = 1;
  for (const [hex, n] of shots) {
    for (let i = 0; i < n; i++) out.push(addNoise(stripes(64, 36, [[hex, 70], ['#101010', 30]]).px, 5, seed++));
  }
  return out;
}

beforeEach(async () => {
  ctx = memoryContext();
  registry = buildRegistry();
  await seedSampleIfEmpty(ctx.store, '2026-09-30T12:00:00Z', 'tester', 'local');
});

describe('what is real in P2 (standing rule 2)', () => {
  test('the actions made real carry no stand-in flag; lens, framing size, mood and ask still do (light is real since P3)', () => {
    const flag = (n: string) => registry.get(n)!.standIn;
    for (const n of ['breakdown.import_reference', 'breakdown.add_frame', 'breakdown.get_frame', 'breakdown.get_reference',
      'breakdown.detect_shots', 'breakdown.sample_palette', 'breakdown.analyse', 'breakdown.set_subject', 'breakdown.fit_light']) expect(flag(n), n).toBe(false);
    for (const n of ['breakdown.fit_lens', 'breakdown.fit_framing', 'breakdown.fit_mood', 'breakdown.ask']) expect(flag(n), n).toBe(true);
  });

  test('the new helpers are not commands, so the design catalogue parity holds', () => {
    for (const n of ['breakdown.add_frame', 'breakdown.get_frame', 'breakdown.get_reference', 'breakdown.set_subject']) {
      expect(registry.get(n)!.command, n).toBe(false);
    }
  });
});

describe('an image, imported and analysed', () => {
  test('the palette is measured from the pixels; light, lens and mood stay sample', async () => {
    const { px } = stripes(480, 201, PATCHES);
    const ref = await importFrames([px]);
    const b = await run('breakdown.analyse');
    expect(b.reference_id).toBe(ref);
    expect(b.frame_index).toBe(0);
    for (const [hex, share] of PATCHES) {
      const s = b.palette.find((p: { hex: string }) => deltaE2000(hexToLab(p.hex), hexToLab(hex)) <= 2);
      expect(s, hex).toBeTruthy();
      expect(Math.abs(s.share.value - share)).toBeLessThanOrEqual(2);
      expect(s.share.source).toBe('measured');
    }
    for (const leaf of [b.saturation, b.contrast_stops, b.tints.shadow, b.tints.mid, b.tints.highlight, b.framing.aspect]) {
      expect(leaf.source).toBe('measured');
    }
    expect(b.framing.aspect.value).toBe('2.39:1');
    for (const leaf of [b.light.key_az, b.light.key_kelvin, b.lens.focal_mm, b.mood, b.framing.size]) expect(leaf.source).toBe('sample');
  });

  test('the reference records the file facts and links to the shot; no path is stored', async () => {
    const ref = await importFrames([stripes(64, 36, PATCHES).px], { name: 'still.png' });
    const r = await run('breakdown.get_reference', { reference_id: ref });
    expect(r).toMatchObject({ id: ref, file_name: 'still.png', media: 'image', sample: false, frame_count: 1 });
    expect(r.file).toMatchObject({ sha256: sha('still.png'), mime: 'image/png' });
    expect(JSON.stringify(r)).not.toMatch(/"path"/);
    const project = (await run('project.list')).projects.find((p: { id: string }) => p.id === 'neel');
    expect(project.shots.find((s: { id: string }) => s.id === '12C').reference_id).toBe(ref);
  });

  test('the same file imported twice is the same reference (content-addressed id)', async () => {
    const a = await importFrames([stripes(64, 36, PATCHES).px], { name: 'same.png' });
    const b = await importFrames([stripes(64, 36, PATCHES).px], { name: 'same.png' });
    expect(b).toBe(a);
    expect(a).toMatch(/^ref-[0-9a-f]{12}$/);
  });

  test('get_frame returns exactly the PNG that was stored', async () => {
    const px = stripes(64, 36, PATCHES).px;
    const ref = await importFrames([px]);
    const f = await run('breakdown.get_frame', { reference_id: ref, index: 0 });
    expect(f).toMatchObject({ index: 0, width: 64, height: 36, t_s: 0 });
    expect(f.png_base64).toBe(b64(px));
  });

  test('sample_palette re-measures the palette on its own and saves it', async () => {
    await importFrames([stripes(64, 36, PATCHES).px]);
    await run('breakdown.analyse');
    const p = await run('breakdown.sample_palette');
    expect(p.palette.length).toBe(4);
    expect(p.palette.every((s: { share: { source: string } }) => s.share.source === 'measured')).toBe(true);
  });
});

describe('a video: shots, key frames and re-analysis', () => {
  test('detect_shots finds the cuts and stores the shots on the reference as measured', async () => {
    const ref = await importFrames(clip([['#C04020', 6], ['#2050C0', 6], ['#30A050', 8]]));
    const r = await run('breakdown.detect_shots', { reference_id: ref });
    expect(r.source).toBe('measured');
    expect(r.shots.map((s: { in_s: number }) => s.in_s)).toEqual([0, 3, 6]);
    expect(r.shots.map((s: { key_frame: number }) => s.key_frame)).toEqual([3, 9, 16]);
    const stored = await run('breakdown.get_reference', { reference_id: ref });
    expect(stored.shots_source).toBe('measured');
    expect(stored.shots).toHaveLength(3);
  });

  test('analyse measures the longest shot\'s key frame by default (the earliest on a tie), or the frame asked for', async () => {
    await importFrames(clip([['#C04020', 6], ['#2050C0', 6]]));
    const first = await run('breakdown.analyse');
    expect(first.frame_index).toBe(3);
    expect(deltaE2000(hexToLab(first.palette[0].hex), hexToLab('#C04020'))).toBeLessThanOrEqual(2);
    const second = await run('breakdown.analyse', { frame_index: 9 });
    expect(second.frame_index).toBe(9);
    expect(deltaE2000(hexToLab(second.palette[0].hex), hexToLab('#2050C0'))).toBeLessThanOrEqual(2);
  });

  test('a short black leader is never the default frame: the longest shot is', async () => {
    const frames = [...clip([['#000000', 2]]).map(() => blank(64, 36)), ...clip([['#2050C0', 8], ['#C04020', 4]])];
    await importFrames(frames);
    const b = await run('breakdown.analyse');
    expect(b.frame_index).toBe(6);
    expect(deltaE2000(hexToLab(b.palette[0].hex), hexToLab('#2050C0'))).toBeLessThanOrEqual(2);
  });

  test('re-analysis keeps what a person set by hand', async () => {
    await importFrames([stripes(64, 36, PATCHES).px]);
    await run('breakdown.analyse');
    await run('breakdown.edit_value', { field: 'framing.aspect', value: '1.85:1' });
    await run('breakdown.edit_value', { field: 'saturation', value: 12 });
    const b = await run('breakdown.analyse');
    expect(b.framing.aspect).toMatchObject({ value: '1.85:1', source: 'manual' });
    expect(b.saturation).toMatchObject({ value: 12, source: 'manual' });
    expect(b.contrast_stops.source).toBe('measured');
  });

  test('analysing a shot whose reference is still the sample says to import one', async () => {
    await expect(run('breakdown.analyse')).rejects.toThrow(/import/i);
  });
});

describe('subject position by hand (D-LL-028) and saving the look', () => {
  test('a click on the frame sets the subject position as manual, with its numbers', async () => {
    await importFrames([stripes(64, 36, PATCHES).px]);
    await run('breakdown.analyse');
    const r = await run('breakdown.set_subject', { x: 0.31, y: 0.4 });
    expect(r).toMatchObject({ field: 'framing.subject_pos', source: 'manual' });
    const b = await run('breakdown.get');
    expect(b.framing.subject_pos).toMatchObject({ value: 'left third (x 0.31, y 0.40)', source: 'manual' });
    expect(b.subject).toEqual({ x: 0.31, y: 0.4 });
    expect((await run('breakdown.set_subject', { x: 0.5, y: 0.5 })).value).toMatch(/^centre/);
    expect((await run('breakdown.set_subject', { x: 0.7, y: 0.5 })).value).toMatch(/^right third/);
  });

  test('positions outside the frame are refused', async () => {
    await expect(run('breakdown.set_subject', { x: 1.2, y: 0.5 })).rejects.toThrow(/x/);
  });

  test('a saved look is measured for its palette and sample for its light and mood', async () => {
    await importFrames([stripes(64, 36, PATCHES).px]);
    await run('breakdown.analyse');
    const saved = await run('breakdown.save_look', { name: 'Patches' });
    expect(saved.source).toBe('measured');
    const look = (await run('library.list')).looks.find((l: { id: string }) => l.id === saved.look_id);
    expect(look).toMatchObject({ source: 'measured', light_source: 'sample', mood_source: 'sample', name: 'Patches' });
  });

  test('the sample look is still sample', async () => {
    const saved = await run('breakdown.save_look');
    expect(saved.source).toBe('sample');
  });

  test('after a real import, stand-ins still return no measured value', async () => {
    await importFrames([stripes(64, 36, PATCHES).px]);
    await run('breakdown.analyse');
    const r = await registry.invoke('breakdown.fit_framing', {}, ctx.for('ui'));
    expect(JSON.stringify(r.result)).not.toContain('"measured"');
  });
});

describe('add_frame validates what it is given', () => {
  let ref: string;
  beforeEach(async () => {
    ref = (await run('breakdown.import_reference', {
      file_name: 'v.mp4', media: 'video', mime: 'video/mp4', size_bytes: 10, sha256: sha('v'), last_modified: null,
      width: 1920, height: 1080, duration_s: 2, sample_fps: 2, frame_count: 4,
    })).reference_id;
  });

  test('a body that is not a PNG is refused', async () => {
    const jpegish = Buffer.from([0xff, 0xd8, 0xff, 0xe0, ...new Array(200).fill(7)]).toString('base64');
    await expect(run('breakdown.add_frame', { reference_id: ref, index: 0, png_base64: jpegish })).rejects.toThrow(/PNG/);
  });

  test('a frame larger than 512 px on its long side is refused', async () => {
    await expect(run('breakdown.add_frame', { reference_id: ref, index: 0, png_base64: b64(blank(600, 20)) })).rejects.toThrow(/512/);
  });

  test('an index past the planned frame count is refused', async () => {
    await expect(run('breakdown.add_frame', { reference_id: ref, index: 4, png_base64: b64(blank(8, 8)) })).rejects.toThrow(/index/);
  });

  test('a frame for a reference that does not exist is refused', async () => {
    await expect(run('breakdown.add_frame', { reference_id: 'ref-nope', index: 0, png_base64: b64(blank(8, 8)) })).rejects.toThrow(/not found/);
  });

  test('text that is not base64 is refused before decoding', async () => {
    await expect(run('breakdown.add_frame', { reference_id: ref, index: 0, png_base64: '<script>alert(1)</script>'.repeat(10) })).rejects.toThrow(/base64/);
  });

  test('analysis needs every planned frame', async () => {
    await run('breakdown.add_frame', { reference_id: ref, index: 0, png_base64: b64(blank(8, 8)) });
    await expect(run('breakdown.analyse')).rejects.toThrow(/1 of 4 frames/);
  });
});
