// The EXIF focal-length reader (P3 task 2). Every fixture is built here, byte by byte: a TIFF block with an
// Exif IFD, wrapped as JPEG (APP1), PNG (eXIf) and WebP (EXIF chunk). The reader never throws; a damaged or
// missing block gives no focal length, so the Lens row falls back to entry by hand.
import { describe, expect, test } from 'vitest';
import { readExifLens } from '../../src/core/exif.ts';

type Tag = { tag: number; type: 3 | 4 | 5; value: number | [number, number] };
const ASCII = (s: string) => [...s].map((c) => c.charCodeAt(0));

/** A TIFF block: IFD0 holds one pointer (0x8769) to an Exif IFD with the given tags. */
function tiff(tags: Tag[], le = true, opts: { exifPointer?: number } = {}): number[] {
  const out: number[] = [];
  const u16 = (v: number) => (le ? [v & 255, v >> 8] : [v >> 8, v & 255]);
  const u32 = (v: number) => (le ? [v & 255, (v >> 8) & 255, (v >> 16) & 255, v >>> 24] : [v >>> 24, (v >> 16) & 255, (v >> 8) & 255, v & 255]);
  out.push(...(le ? ASCII('II') : ASCII('MM')), ...u16(42), ...u32(8));
  const exifAt = 8 + 2 + 12 + 4;
  out.push(...u16(1), ...u16(0x8769), ...u16(4), ...u32(1), ...u32(opts.exifPointer ?? exifAt), ...u32(0));
  const dataAt = exifAt + 2 + tags.length * 12 + 4;
  const data: number[] = [];
  out.push(...u16(tags.length));
  for (const t of tags) {
    out.push(...u16(t.tag), ...u16(t.type), ...u32(1));
    if (t.type === 5) {
      const [n, d] = t.value as [number, number];
      out.push(...u32(dataAt + data.length));
      data.push(...u32(n), ...u32(d));
    } else if (t.type === 3) out.push(...u16(t.value as number), 0, 0);
    else out.push(...u32(t.value as number));
  }
  out.push(...u32(0), ...data);
  return out;
}

const FOCAL = (n: number, d = 1): Tag => ({ tag: 0x920a, type: 5, value: [n, d] });
const FOCAL35 = (v: number): Tag => ({ tag: 0xa405, type: 3, value: v });

function jpeg(t: number[] | null): Uint8Array {
  const app1 = t ? [0xff, 0xe1, (t.length + 8) >> 8, (t.length + 8) & 255, ...ASCII('Exif'), 0, 0, ...t] : [];
  const app0 = [0xff, 0xe0, 0, 16, ...ASCII('JFIF'), 0, 1, 1, 0, 0, 1, 0, 1, 0, 0];
  return new Uint8Array([0xff, 0xd8, ...app0, ...app1, 0xff, 0xda, 0, 2, 1, 2, 3, 0xff, 0xd9]);
}

function chunk(type: string, data: number[]): number[] {
  const n = data.length;
  return [n >>> 24, (n >> 16) & 255, (n >> 8) & 255, n & 255, ...ASCII(type), ...data, 0, 0, 0, 0];
}
function png(t: number[] | null): Uint8Array {
  const ihdr = [0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0];
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...chunk('IHDR', ihdr), ...(t ? chunk('eXIf', t) : []), ...chunk('IDAT', [1, 2]), ...chunk('IEND', [])]);
}

function webp(t: number[] | null): Uint8Array {
  const le32 = (v: number) => [v & 255, (v >> 8) & 255, (v >> 16) & 255, v >>> 24];
  const ck = (id: string, d: number[]) => [...ASCII(id), ...le32(d.length), ...d, ...(d.length % 2 ? [0] : [])];
  const body = [...ASCII('WEBP'), ...ck('VP8X', [8, 0, 0, 0, 0, 0, 0, 0, 0, 0]), ...ck('VP8L', [1, 2, 3]), ...(t ? ck('EXIF', t) : [])];
  return new Uint8Array([...ASCII('RIFF'), ...le32(body.length), ...body]);
}

describe('focal length present', () => {
  test.each([['JPEG', jpeg], ['PNG', png], ['WebP', webp]] as const)('%s: actual focal length and 35 mm equivalent', (_n, wrap) => {
    expect(readExifLens(wrap(tiff([FOCAL(50), FOCAL35(75)])))).toEqual({ focal_mm: 50, focal_35mm: 75 });
  });

  test('big-endian (Motorola) TIFF reads the same', () => {
    expect(readExifLens(jpeg(tiff([FOCAL(85), FOCAL35(128)], false)))).toEqual({ focal_mm: 85, focal_35mm: 128 });
  });

  test('a fractional focal length (4.25 mm on a phone) is kept to two decimals', () => {
    expect(readExifLens(jpeg(tiff([FOCAL(425, 100), FOCAL35(26)])))).toEqual({ focal_mm: 4.25, focal_35mm: 26 });
  });

  test('only the actual focal length: no 35 mm equivalent is invented', () => {
    expect(readExifLens(jpeg(tiff([FOCAL(35)])))).toEqual({ focal_mm: 35, focal_35mm: null });
  });

  test('only the 35 mm equivalent', () => {
    expect(readExifLens(png(tiff([FOCAL35(50)])))).toEqual({ focal_mm: null, focal_35mm: 50 });
  });
});

describe('focal length absent', () => {
  test.each([['JPEG', jpeg], ['PNG', png], ['WebP', webp]] as const)('%s with no EXIF block', (_n, wrap) => {
    expect(readExifLens(wrap(null))).toEqual({ focal_mm: null, focal_35mm: null });
  });

  test('an EXIF block without focal tags (0x920A, 0xA405)', () => {
    expect(readExifLens(jpeg(tiff([{ tag: 0x9209, type: 3, value: 16 }])))).toEqual({ focal_mm: null, focal_35mm: null });
  });

  test('bytes that are not an image', () => {
    expect(readExifLens(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))).toEqual({ focal_mm: null, focal_35mm: null });
    expect(readExifLens(new Uint8Array(0))).toEqual({ focal_mm: null, focal_35mm: null });
  });
});

describe('a damaged block gives no focal length and never throws', () => {
  const none = { focal_mm: null, focal_35mm: null };

  test('the Exif IFD pointer points past the end', () => {
    expect(readExifLens(jpeg(tiff([FOCAL(50)], true, { exifPointer: 60_000 })))).toEqual(none);
  });

  test('the TIFF block is cut short', () => {
    const t = tiff([FOCAL(50), FOCAL35(75)]);
    expect(readExifLens(jpeg(t.slice(0, 30)))).toEqual(none);
  });

  test('a JPEG segment length runs past the end of the file', () => {
    const j = jpeg(tiff([FOCAL(50)]));
    j[22] = 0xff; // APP1's length, high byte: SOI (2) + APP0 (18) + the APP1 marker (2)
    expect(() => readExifLens(j)).not.toThrow();
    expect(readExifLens(j)).toEqual(none);
  });

  test('a zero denominator or an absurd value is not a focal length', () => {
    expect(readExifLens(jpeg(tiff([FOCAL(50, 0), FOCAL35(0)])))).toEqual(none);
    expect(readExifLens(jpeg(tiff([FOCAL(90_000), FOCAL35(9000)])))).toEqual(none);
  });

  test('an unknown byte order', () => {
    const t = tiff([FOCAL(50)]);
    t[0] = 0x58; t[1] = 0x58;
    expect(readExifLens(jpeg(t))).toEqual(none);
  });

  test('an Exif IFD that points back at IFD0 does not loop', () => {
    expect(readExifLens(jpeg(tiff([FOCAL(50)], true, { exifPointer: 8 })))).toEqual(none);
  });
});
