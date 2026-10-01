// The lens tags of a still's EXIF: focal length (0x920A) and its 35 mm equivalent (0xA405), found in a JPEG's
// APP1 segment, a PNG's eXIf chunk or a WebP's EXIF chunk. Everything else in EXIF is ignored. It reads bytes
// the browser hands it and never throws: a damaged or missing block gives no focal length, and the Lens row
// falls back to entry by hand. EXIF is metadata, not pixels (AD-LL-010). No DOM, no Node (AD-LL-009).

export interface ExifLens {
  focal_mm: number | null;
  focal_35mm: number | null;
}

/** How much of an image file the browser hands over: enough for EXIF anywhere in all but huge stills. */
export const EXIF_READ_BYTES = 16 * 1024 * 1024;
/** Limits of a real lens, as the engine's contract also has them (LensExif). */
const MAX_FOCAL = 2000, MAX_FOCAL_35 = 5000;

const NONE = (): ExifLens => ({ focal_mm: null, focal_35mm: null });
const ascii = (b: Uint8Array, at: number, s: string) => {
  if (at + s.length > b.length) return false;
  for (let i = 0; i < s.length; i++) if (b[at + i] !== s.charCodeAt(i)) return false;
  return true;
};
const be16 = (b: Uint8Array, i: number) => (b[i] << 8) | b[i + 1];
const be32 = (b: Uint8Array, i: number) => ((b[i] << 24) >>> 0) + ((b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]);
const le32 = (b: Uint8Array, i: number) => ((b[i + 3] << 24) >>> 0) + ((b[i + 2] << 16) | (b[i + 1] << 8) | b[i]);

interface Span { start: number; end: number }

/** JPEG: markers up to the first scan; APP1 starting "Exif\0\0" holds a TIFF block. */
function jpegExif(b: Uint8Array): Span | null {
  let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) return null;
    const m = b[i + 1];
    if (m === 0xff) { i++; continue; } // fill byte
    if (m === 0xd9 || m === 0xda) return null; // end of image, or start of scan: EXIF comes before
    if (m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; } // markers without a length
    const len = be16(b, i + 2);
    if (len < 2 || i + 2 + len > b.length) return null;
    if (m === 0xe1 && ascii(b, i + 4, 'Exif\0\0')) return { start: i + 10, end: i + 2 + len };
    i += 2 + len;
  }
  return null;
}

/** PNG: the eXIf chunk holds a TIFF block. */
function pngExif(b: Uint8Array): Span | null {
  let i = 8;
  while (i + 12 <= b.length) {
    const len = be32(b, i), data = i + 8;
    if (data + len + 4 > b.length) return null;
    if (ascii(b, i + 4, 'eXIf')) return { start: data, end: data + len };
    if (ascii(b, i + 4, 'IEND')) return null;
    i = data + len + 4;
  }
  return null;
}

/** WebP: the EXIF chunk of a RIFF container holds a TIFF block (some writers prefix "Exif\0\0"). */
function webpExif(b: Uint8Array): Span | null {
  let i = 12;
  while (i + 8 <= b.length) {
    const size = le32(b, i + 4), data = i + 8;
    if (data + size > b.length) return null;
    if (ascii(b, i, 'EXIF')) return ascii(b, data, 'Exif\0\0') ? { start: data + 6, end: data + size } : { start: data, end: data + size };
    i = data + size + (size & 1);
  }
  return null;
}

function findTiff(b: Uint8Array): Span | null {
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) return jpegExif(b);
  if (ascii(b, 0, '\x89PNG\r\n\x1a\n')) return pngExif(b);
  if (ascii(b, 0, 'RIFF') && ascii(b, 8, 'WEBP')) return webpExif(b);
  return null;
}

/** Reads the two lens tags from the Exif IFD of a TIFF block occupying [start, end) of b. */
function lensFromTiff(b: Uint8Array, { start, end }: Span): ExifLens {
  if (end - start < 8) return NONE();
  const le = ascii(b, start, 'II');
  if (!le && !ascii(b, start, 'MM')) return NONE();
  const u16 = (o: number) => (le ? b[start + o] | (b[start + o + 1] << 8) : be16(b, start + o));
  const u32 = (o: number) => (le ? le32(b, start + o) : be32(b, start + o));
  const size = end - start;
  if (u16(2) !== 42) return NONE();
  /** The entries of the IFD at offset o, or null when it does not fit inside the block. */
  const entries = (o: number) => {
    if (o < 8 || o + 2 > size) return null;
    const n = u16(o);
    if (o + 2 + n * 12 > size) return null;
    return Array.from({ length: n }, (_, k) => o + 2 + k * 12);
  };
  const ifd0 = entries(u32(4));
  const ptr = ifd0?.find((e) => u16(e) === 0x8769);
  const exif = ptr === undefined ? null : entries(u32(ptr + 8));
  if (!exif) return NONE();
  const out = NONE();
  for (const e of exif) {
    const tag = u16(e), type = u16(e + 2);
    if (tag === 0x920a && type === 5) {
      const at = u32(e + 8);
      if (at + 8 > size) continue;
      const num = u32(at), den = u32(at + 4);
      const v = den ? num / den : 0;
      if (v > 0 && v <= MAX_FOCAL) out.focal_mm = Math.round(v * 100) / 100;
    } else if (tag === 0xa405 && (type === 3 || type === 4)) {
      const v = type === 3 ? u16(e + 8) : u32(e + 8);
      if (v > 0 && v <= MAX_FOCAL_35) out.focal_35mm = v; // 0 means "unknown" in EXIF
    }
  }
  return out;
}

/** The focal length a still's EXIF records, if any. Never throws. */
export function readExifLens(bytes: Uint8Array): ExifLens {
  try {
    const span = findTiff(bytes);
    return span ? lensFromTiff(bytes, span) : NONE();
  } catch {
    return NONE();
  }
}
