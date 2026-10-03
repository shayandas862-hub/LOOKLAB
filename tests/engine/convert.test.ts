// Photos Chrome cannot open (HEIC/HEIF from iPhones, TIFF, camera RAW) are converted on this Mac by macOS's own `sips`
// (no dependency, nothing leaves the machine), then imported like any other still. The original's size and its EXIF
// lens tags come back with the converted frame; the temporary copy is deleted.
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SipsConverter } from '../../src/engine/convert.ts';
import { decodePng } from '../../src/engine/png.ts';
import { readExifLens } from '../../src/core/exif.ts';
import { makeHeic, withExif } from '../fixtures/heic.ts';

const mac = process.platform === 'darwin';
let work = '';
let heic: Buffer;

describe.skipIf(!mac)('SipsConverter (macOS)', () => {
  beforeAll(() => {
    work = mkdtempSync(join(tmpdir(), 'looklab-convert-test-'));
    heic = makeHeic(work);
  });
  afterAll(() => rmSync(work, { recursive: true, force: true }));

  test('a HEIC becomes a PNG frame of at most 1024 px, with the original\'s size and its EXIF lens tags', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'looklab-convert-root-'));
    const r = await new SipsConverter(tmp).convert(heic, 'IMG_0725.HEIC');
    expect(r).toMatchObject({ width: 512, height: 288, exif: { focal_mm: 50, focal_35mm: 75 } });
    const px = decodePng(r.png);
    expect(Math.max(px.width, px.height)).toBeLessThanOrEqual(1024);
    expect(px.width / px.height).toBeCloseTo(512 / 288, 2);
    expect(readdirSync(tmp)).toEqual([]); // the temporary copy is gone
    rmSync(tmp, { recursive: true, force: true });
  });

  test('a file macOS cannot read as an image is refused with the reason, and nothing is left behind', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'looklab-convert-root-'));
    await expect(new SipsConverter(tmp).convert(Buffer.from('not an image at all'), 'broken.heic')).rejects.toThrow(/macOS could not read broken\.heic as an image/);
    expect(readdirSync(tmp)).toEqual([]);
    rmSync(tmp, { recursive: true, force: true });
  });

  test('the file name never reaches the shell: an odd name is only used to pick the extension', async () => {
    const tmp = mkdtempSync(join(tmpdir(), 'looklab-convert-root-'));
    const r = await new SipsConverter(tmp).convert(heic, '$(touch pwned); rm -rf ~ .heic');
    expect(r.width).toBe(512);
    rmSync(tmp, { recursive: true, force: true });
  });
});

test('readExifLens is what the converter uses to read the lens tags (sanity, any platform)', () => {
  expect(readExifLens(new Uint8Array(withExif(Buffer.from([0xff, 0xd8, 0xff, 0xd9]))))).toEqual({ focal_mm: 50, focal_35mm: 75 });
});
