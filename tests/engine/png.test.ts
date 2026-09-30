// The engine's PNG reader and writer (D-LL-031): node:zlib only, no third-party decoder.
import { describe, expect, test } from 'vitest';
import { deflateSync, crc32 } from 'node:zlib';
import { decodePng, encodePng, PngError, readPngHeader } from '../../src/engine/png.ts';
import { addNoise, blank } from '../core/synth.ts';

function chunk(type: string, data: Uint8Array): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), Buffer.from(data)]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** A hand-built PNG, to test the decoder on layouts the encoder never writes. */
function handmade(width: number, height: number, colourType: number, bitDepth: number, rows: number[][], interlace = 0) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = bitDepth;
  ihdr[9] = colourType;
  ihdr[12] = interlace;
  const raw = Buffer.from(rows.flat());
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', new Uint8Array())]);
}

describe('PNG', () => {
  test('encode → decode gives back the same RGBA pixels', () => {
    const px = addNoise(blank(37, 23, [10, 200, 90]), 40);
    const back = decodePng(encodePng(px));
    expect(back.width).toBe(37);
    expect(back.height).toBe(23);
    expect(Buffer.from(back.data).equals(Buffer.from(px.data))).toBe(true);
  });

  test('reads RGB and greyscale PNGs, and every row filter (None, Sub, Up, Average, Paeth)', () => {
    // 2×5 RGB, one row per filter type. Filtered bytes chosen so every row decodes to (10,20,30),(40,50,60).
    const rgb = handmade(2, 5, 2, 8, [
      [0, 10, 20, 30, 40, 50, 60],
      [1, 10, 20, 30, 30, 30, 30],
      [2, 0, 0, 0, 0, 0, 0],
      [3, 5, 10, 15, 15, 15, 15],
      [4, 0, 0, 0, 0, 0, 0],
    ]);
    const d = decodePng(rgb);
    for (let y = 0; y < 5; y++) expect([...d.data.subarray(y * 8, y * 8 + 8)], `row ${y}`).toEqual([10, 20, 30, 255, 40, 50, 60, 255]);
    const g = decodePng(handmade(2, 1, 0, 8, [[0, 7, 250]]));
    expect([...g.data]).toEqual([7, 7, 7, 255, 250, 250, 250, 255]);
  });

  test('refuses what is not an 8-bit, non-interlaced PNG, with a reason', () => {
    expect(() => decodePng(Buffer.from('GIF89a not a png at all'))).toThrow(PngError);
    expect(() => decodePng(handmade(1, 1, 2, 16, [[0, 0, 0, 0, 0, 0, 0]]))).toThrow(/8 bits/);
    expect(() => decodePng(handmade(1, 1, 3, 8, [[0, 0]]))).toThrow(/colour type/);
    expect(() => decodePng(handmade(1, 1, 2, 8, [[0, 1, 2, 3]], 1))).toThrow(/interlaced/);
    const truncated = encodePng(blank(8, 8)).subarray(0, 40);
    expect(() => decodePng(truncated)).toThrow(PngError);
  });

  test('the header alone gives the size without inflating anything', () => {
    expect(readPngHeader(encodePng(blank(512, 214)))).toMatchObject({ width: 512, height: 214, bitDepth: 8, colourType: 6 });
  });
});
