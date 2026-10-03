// Photos Chrome cannot decode (HEIC/HEIF from iPhones, TIFF, camera RAW) are converted here with macOS's own `sips`
// (D-LL-055): no dependency, nothing leaves the machine. The bytes go to a private temporary folder, `sips` writes a
// PNG frame (at most 1024 px; the browser then samples it at 512 px as for any still) and reads the original's size;
// a 64 px JPEG copy carries the EXIF lens tags, read with the same reader as any still (D-LL-034). The folder is
// deleted whatever happens. The file's name only chooses the extension; it never reaches a shell (execFile, no shell).
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readExifLens, type ExifLens } from '../core/exif.ts';

export const CONVERT_MAX_SIDE = 1024;
const SIPS = '/usr/bin/sips';

export interface Converted {
  /** The frame, as PNG. */
  png: Uint8Array;
  /** The original's pixel size. */
  width: number;
  height: number;
  exif: ExifLens | null;
}

export interface ImageConverter {
  convert(bytes: Uint8Array, name: string): Promise<Converted>;
}

function sips(args: string[]): Promise<string> {
  return new Promise((resolve, reject) =>
    execFile(SIPS, args, { timeout: 60_000, maxBuffer: 1 << 20 }, (err, stdout) => (err ? reject(err) : resolve(String(stdout)))));
}

export class SipsConverter implements ImageConverter {
  private root: string;

  constructor(root: string = tmpdir()) {
    this.root = root;
  }

  async convert(bytes: Uint8Array, name: string): Promise<Converted> {
    const ext = (/\.([A-Za-z0-9]{1,5})$/.exec(name)?.[1] ?? 'img').toLowerCase();
    const unreadable = () => new Error(`macOS could not read ${name} as an image`);
    const dir = await mkdtemp(join(this.root, 'looklab-convert-'));
    try {
      const input = join(dir, `in.${ext}`);
      await writeFile(input, bytes, { mode: 0o600 });
      const info = await sips(['-g', 'pixelWidth', '-g', 'pixelHeight', input]).catch(() => '');
      const width = Number(/pixelWidth: (\d+)/.exec(info)?.[1] ?? 0);
      const height = Number(/pixelHeight: (\d+)/.exec(info)?.[1] ?? 0);
      if (!width || !height) throw unreadable();
      const frame = join(dir, 'frame.png');
      // Only ever scaled down: -Z would also enlarge a small picture.
      const resize = Math.max(width, height) > CONVERT_MAX_SIDE ? ['-Z', String(CONVERT_MAX_SIDE)] : [];
      await sips(['-s', 'format', 'png', ...resize, input, '--out', frame]).catch(() => { throw unreadable(); });
      let exif: ExifLens | null = null;
      try {
        await sips(['-s', 'format', 'jpeg', '-Z', '64', input, '--out', join(dir, 'meta.jpg')]);
        const lens = readExifLens(new Uint8Array(await readFile(join(dir, 'meta.jpg'))));
        exif = lens.focal_mm !== null || lens.focal_35mm !== null ? lens : null;
      } catch {
        exif = null; // no lens tags: the focal length is entered by hand, as for any still without EXIF
      }
      return { png: new Uint8Array(await readFile(frame)), width, height, exif };
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }
}

/** Where `sips` does not exist (not a Mac): the browser's own formats only. */
export class NoConverter implements ImageConverter {
  async convert(_bytes: Uint8Array, name: string): Promise<Converted> {
    throw new Error(`${name} needs converting, and that needs macOS (sips); export it as JPG, PNG or WebP`);
  }
}

export const defaultConverter = (): ImageConverter => (process.platform === 'darwin' ? new SipsConverter() : new NoConverter());
