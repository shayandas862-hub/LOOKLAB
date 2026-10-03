// A real HEIC for the format tests, made on this Mac from a committed render (macOS sips), with an EXIF block, as an
// iPhone would hand one over. Test arrangement only; Look Lab's own conversion is src/engine/convert.ts.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const RENDER = join(import.meta.dirname, 'blender', 'test', 'test-03-light.png');

/** A JPEG of the render with an EXIF block: FocalLength 50 mm, FocalLengthIn35mmFilm 75 mm (little-endian TIFF). */
export function withExif(jpg: Buffer): Buffer {
  const t = Buffer.alloc(8 + 18 + 2 + 24 + 4 + 8);
  t.write('II', 0); t.writeUInt16LE(42, 2); t.writeUInt32LE(8, 4);
  t.writeUInt16LE(1, 8); t.writeUInt16LE(0x8769, 10); t.writeUInt16LE(4, 12); t.writeUInt32LE(1, 14); t.writeUInt32LE(26, 18); t.writeUInt32LE(0, 22);
  t.writeUInt16LE(2, 26);
  t.writeUInt16LE(0x920a, 28); t.writeUInt16LE(5, 30); t.writeUInt32LE(1, 32); t.writeUInt32LE(56, 36);
  t.writeUInt16LE(0xa405, 40); t.writeUInt16LE(3, 42); t.writeUInt32LE(1, 44); t.writeUInt16LE(75, 48);
  t.writeUInt32LE(0, 52); t.writeUInt32LE(50, 56); t.writeUInt32LE(1, 60);
  const body = Buffer.concat([Buffer.from('Exif\0\0', 'binary'), t]);
  const seg = Buffer.concat([Buffer.from([0xff, 0xe1, (body.length + 2) >> 8, (body.length + 2) & 255]), body]);
  return Buffer.concat([jpg.subarray(0, 2), seg, jpg.subarray(2)]);
}

/** A real HEIC, made on this Mac from the committed render, as an iPhone would hand one over. */
export function makeHeic(dir: string): Buffer {
  execFileSync('/usr/bin/sips', ['-s', 'format', 'jpeg', RENDER, '--out', join(dir, 'a.jpg')], { stdio: 'ignore' });
  writeFileSync(join(dir, 'b.jpg'), withExif(readFileSync(join(dir, 'a.jpg'))));
  execFileSync('/usr/bin/sips', ['-s', 'format', 'heic', join(dir, 'b.jpg'), '--out', join(dir, 'c.heic')], { stdio: 'ignore' });
  return readFileSync(join(dir, 'c.heic'));
}

