// breakdown.convert_image (helper, T0): the browser hands over a photo it cannot decode; the engine's converter (macOS
// sips, stubbed here) returns a PNG frame, the original's size and its lens tags. Nothing is stored; bodies up to 48 MB.
import { describe, expect, test } from 'vitest';
import { buildRegistry } from '../../src/actions/index.ts';
import type { ImageConverter } from '../../src/engine/convert.ts';
import { memoryContext } from './memory-context.ts';

const stub: ImageConverter = {
  convert: async (bytes, name) => {
    if (name.endsWith('.bad')) throw new Error(`macOS could not read ${name} as an image`);
    return { png: new Uint8Array([137, 80, 78, 71]), width: 4032, height: 3024, exif: { focal_mm: 6.86, focal_35mm: 24 } };
  },
};

describe('breakdown.convert_image', () => {
  test('returns the converted frame, the original size and the lens tags, and stores nothing', async () => {
    const ctx = memoryContext({ converter: stub });
    const r = await buildRegistry().invoke('breakdown.convert_image', { file_name: 'IMG_0725.heic', bytes_base64: Buffer.from('heic bytes here!').toString('base64') }, ctx.for('ui'));
    expect(r.result).toEqual({ png_base64: Buffer.from([137, 80, 78, 71]).toString('base64'), width: 4032, height: 3024, exif: { focal_mm: 6.86, focal_35mm: 24 } });
    expect(ctx.decisions).toHaveLength(0); // a read helper: no decision row
  });

  test('a file the converter cannot read is refused with its reason', async () => {
    const ctx = memoryContext({ converter: stub });
    await expect(buildRegistry().invoke('breakdown.convert_image', { file_name: 'x.bad', bytes_base64: Buffer.from('nothing useful!!').toString('base64') }, ctx.for('ui'))).rejects.toThrow(/macOS could not read x\.bad/);
  });

  test('a helper (command: false), T0, read; it reads bodies up to 48 MB', () => {
    expect(buildRegistry().get('breakdown.convert_image')).toMatchObject({ command: false, tier: 'T0', effect: 'read', ai: false, standIn: false, maxBytes: 48_000_000 });
  });
});
