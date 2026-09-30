// PNG in and out for analysis frames (D-LL-031): 8-bit, non-interlaced, greyscale / RGB / with alpha.
// Built on node:zlib only, so the engine takes no image-decoding dependency. What a browser canvas
// writes (8-bit RGBA) is always accepted; anything else is refused with the reason.
import { crc32, deflateSync, inflateSync } from 'node:zlib';
import type { Pixels } from '../core/image.ts';

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 4: 2, 6: 4 };
/** Refuse before inflating anything larger (a 512 × 512 RGBA frame is 1 MiB). */
const MAX_PIXELS = 4096 * 4096;

export class PngError extends Error {}

export interface PngHeader {
  width: number;
  height: number;
  bitDepth: number;
  colourType: number;
  interlace: number;
}

function u32(b: Uint8Array, at: number): number {
  return ((b[at] << 24) | (b[at + 1] << 16) | (b[at + 2] << 8) | b[at + 3]) >>> 0;
}

export function isPng(b: Uint8Array): boolean {
  return b.length >= 8 && SIGNATURE.every((v, i) => b[i] === v);
}

/** Size and format from the IHDR chunk, without inflating the image. */
export function readPngHeader(b: Uint8Array): PngHeader {
  if (!isPng(b)) throw new PngError('not a PNG file');
  if (b.length < 33 || String.fromCharCode(b[12], b[13], b[14], b[15]) !== 'IHDR') throw new PngError('PNG has no IHDR header');
  return { width: u32(b, 16), height: u32(b, 20), bitDepth: b[24], colourType: b[25], interlace: b[28] };
}

export function decodePng(b: Uint8Array): Pixels {
  const h = readPngHeader(b);
  if (h.bitDepth !== 8) throw new PngError(`PNG must use 8 bits per channel (this one uses ${h.bitDepth})`);
  const channels = CHANNELS[h.colourType];
  if (!channels) throw new PngError(`PNG colour type ${h.colourType} is not supported (greyscale, RGB or RGBA only)`);
  if (h.interlace !== 0) throw new PngError('interlaced PNGs are not supported');
  if (h.width < 1 || h.height < 1 || h.width * h.height > MAX_PIXELS) throw new PngError(`PNG size ${h.width} × ${h.height} is out of range`);

  const idat: Uint8Array[] = [];
  let at = 8;
  let ended = false;
  while (at + 8 <= b.length) {
    const len = u32(b, at);
    const type = String.fromCharCode(b[at + 4], b[at + 5], b[at + 6], b[at + 7]);
    const end = at + 12 + len;
    if (end > b.length) throw new PngError('PNG is truncated');
    if (u32(b, at + 8 + len) !== crc32(b.subarray(at + 4, at + 8 + len))) throw new PngError(`PNG chunk ${type} fails its checksum`);
    if (type === 'IDAT') idat.push(b.subarray(at + 8, at + 8 + len));
    if (type === 'IEND') {
      ended = true;
      break;
    }
    at = end;
  }
  if (!ended || idat.length === 0) throw new PngError('PNG is truncated');

  const stride = h.width * channels;
  let raw: Uint8Array;
  try {
    raw = inflateSync(Buffer.concat(idat), { maxOutputLength: (stride + 1) * h.height });
  } catch {
    throw new PngError('PNG image data is corrupt');
  }
  if (raw.length !== (stride + 1) * h.height) throw new PngError('PNG image data has the wrong length');

  const out = new Uint8ClampedArray(h.width * h.height * 4);
  const prev = new Uint8Array(stride);
  const cur = new Uint8Array(stride);
  const bpp = channels;
  for (let y = 0; y < h.height; y++) {
    const filter = raw[y * (stride + 1)];
    const row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? cur[x - bpp] : 0;
      const up = prev[x];
      const c = x >= bpp ? prev[x - bpp] : 0;
      let p: number;
      switch (filter) {
        case 0: p = 0; break;
        case 1: p = a; break;
        case 2: p = up; break;
        case 3: p = (a + up) >> 1; break;
        case 4: {
          const e = a + up - c;
          const pa = Math.abs(e - a);
          const pb = Math.abs(e - up);
          const pc = Math.abs(e - c);
          p = pa <= pb && pa <= pc ? a : pb <= pc ? up : c;
          break;
        }
        default: throw new PngError(`PNG row ${y} has an unknown filter type ${filter}`);
      }
      cur[x] = (row[x] + p) & 255;
    }
    for (let x = 0; x < h.width; x++) {
      const o = (y * h.width + x) * 4;
      const s = x * channels;
      if (channels === 1 || channels === 2) {
        out[o] = out[o + 1] = out[o + 2] = cur[s];
        out[o + 3] = channels === 2 ? cur[s + 1] : 255;
      } else {
        out[o] = cur[s];
        out[o + 1] = cur[s + 1];
        out[o + 2] = cur[s + 2];
        out[o + 3] = channels === 4 ? cur[s + 3] : 255;
      }
    }
    prev.set(cur);
  }
  return { width: h.width, height: h.height, data: out };
}

function chunk(type: string, data: Uint8Array): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])));
  return Buffer.concat([head, data, crc]);
}

/** 8-bit RGBA PNG, filter None on every row. For fixtures and tests; the browser writes the real frames. */
export function encodePng(px: Pixels): Uint8Array {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(px.width, 0);
  ihdr.writeUInt32BE(px.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = px.width * 4;
  const raw = Buffer.alloc((stride + 1) * px.height);
  for (let y = 0; y < px.height; y++) raw.set(px.data.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  return Buffer.concat([Buffer.from(SIGNATURE), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', new Uint8Array())]);
}
