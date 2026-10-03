// Reading a reference in the browser (AD-LL-007, D-LL-027): Chrome decodes the image or video, frames are
// sampled at 2 per second and scaled to at most 512 px on the long side, and each becomes a PNG for
// breakdown.add_frame. The file is hashed in 8 MB pieces, so a long video is never held in memory whole.
import { Sha256 } from '../../core/sha256';
import { EXIF_READ_BYTES, readExifLens, type ExifLens } from '../../core/exif';

export const SAMPLE_FPS = 2;
export const MAX_FRAMES = 600;
export const MAX_SIDE = 512;
const HASH_CHUNK = 8 * 1024 * 1024;

export type Media = 'image' | 'video';

// Photos Chrome cannot decode: iPhone HEIC/HEIF, TIFF and camera RAW. They are converted on this Mac by the engine
// (breakdown.convert_image, macOS sips, D-LL-055) and then imported like any still.
const CONVERT_EXT = ['heic', 'heif', 'hif', 'tif', 'tiff', 'dng', 'cr2', 'cr3', 'crw', 'nef', 'nrw', 'arw', 'srf', 'sr2', 'raf', 'orf', 'rw2', 'pef', 'srw', 'x3f', '3fr', 'erf', 'kdc', 'mrw', 'iiq', 'psd', 'jp2'];
const CONVERT_NAME = new RegExp(`\\.(${CONVERT_EXT.join('|')})$`, 'i');
const CONVERT_TYPE = /^image\/(heic|heif|heic-sequence|heif-sequence|tiff|x-adobe-dng|x-canon-.*|x-nikon-nef|x-sony-arw|x-fuji-raf|x-olympus-orf|x-panasonic-rw2|x-dcraw|vnd\.adobe\.photoshop|jp2)$/i;

/** What the file picker offers: everything Chrome opens, and the photos the Mac converts. */
export const ACCEPT = ['image/*', 'video/*', ...CONVERT_EXT.map((e) => `.${e}`)].join(',');

export function needsConversion(file: File): boolean {
  return CONVERT_TYPE.test(file.type) || CONVERT_NAME.test(file.name);
}

/** The file's type for the record: the browser's, else one named from the extension. */
export function mimeOf(file: File, media: Media): string {
  if (file.type) return file.type;
  const ext = (/\.([a-z0-9]+)$/i.exec(file.name)?.[1] ?? '').toLowerCase();
  const known: Record<string, string> = { heic: 'image/heic', heif: 'image/heif', tif: 'image/tiff', tiff: 'image/tiff', dng: 'image/x-adobe-dng', mov: 'video/quicktime', mp4: 'video/mp4' };
  return known[ext] ?? (ext ? `${media}/x-${ext}` : media === 'image' ? 'image/png' : 'video/mp4');
}

export function mediaOf(file: File): Media | null {
  if (needsConversion(file)) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('image/')) return 'image';
  if (/\.(mp4|m4v|mov|webm|mkv)$/i.test(file.name)) return 'video';
  if (/\.(png|jpe?g|webp|gif|avif|bmp)$/i.test(file.name)) return 'image';
  return null;
}

export async function hashFile(file: File, progress?: (done: number, total: number) => void): Promise<string> {
  const h = new Sha256();
  for (let at = 0; at < file.size; at += HASH_CHUNK) {
    h.update(new Uint8Array(await file.slice(at, at + HASH_CHUNK).arrayBuffer()));
    progress?.(Math.min(at + HASH_CHUNK, file.size), file.size);
  }
  return h.hex();
}

/**
 * The focal length a still's EXIF records (P3): the start of the original file is read here, and only the two
 * lens numbers leave the browser. null when the file has none. Videos are not read (their lens tags, when a
 * camera writes any, are vendor-specific): the focal length is entered by hand.
 */
export async function readLens(file: File): Promise<ExifLens | null> {
  const bytes = new Uint8Array(await file.slice(0, Math.min(file.size, EXIF_READ_BYTES)).arrayBuffer());
  const l = readExifLens(bytes);
  return l.focal_mm !== null || l.focal_35mm !== null ? l : null;
}

export function analysisSize(w: number, h: number): { w: number; h: number } {
  const s = Math.min(1, MAX_SIDE / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) };
}

/** An opened reference: its size and timing, and a way to get sampled frame i as a PNG. */
export interface Opened {
  media: Media;
  width: number;
  height: number;
  duration_s: number;
  fps: number;
  count: number;
  frame(i: number): Promise<Blob>;
  close(): void;
}

function canvasFor(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d', { willReadFrequently: false })!;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  return { c, g };
}

function png(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error('the browser could not encode a frame'))), 'image/png'));
}

export async function openImage(file: File): Promise<Opened> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error(`Chrome cannot decode ${file.name}. Use JPG, PNG or WebP.`);
  }
  const size = analysisSize(bmp.width, bmp.height);
  const { c, g } = canvasFor(size.w, size.h);
  return {
    media: 'image', width: bmp.width, height: bmp.height, duration_s: 0, fps: 0, count: 1,
    frame: async () => {
      g.drawImage(bmp, 0, 0, size.w, size.h);
      return png(c);
    },
    close: () => bmp.close(),
  };
}

function once(el: HTMLMediaElement, ok: string, timeoutMs = 15_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => done(new Error(`the video did not answer (${ok}) within ${timeoutMs / 1000} s`)), timeoutMs);
    const onOk = () => done();
    const onErr = () => done(new Error('Chrome cannot decode this video'));
    function done(e?: Error) {
      clearTimeout(t);
      el.removeEventListener(ok, onOk);
      el.removeEventListener('error', onErr);
      if (e) reject(e);
      else resolve();
    }
    el.addEventListener(ok, onOk);
    el.addEventListener('error', onErr);
  });
}

export async function openVideo(file: File): Promise<Opened> {
  const url = URL.createObjectURL(file);
  const v = document.createElement('video');
  v.muted = true;
  v.playsInline = true;
  v.preload = 'auto';
  const close = () => {
    v.removeAttribute('src');
    v.load();
    URL.revokeObjectURL(url);
  };
  try {
    const meta = once(v, 'loadeddata');
    v.src = url;
    await meta;
    // A MediaRecorder WebM carries no duration until the end has been found.
    if (!Number.isFinite(v.duration)) {
      const found = once(v, 'durationchange');
      v.currentTime = 1e9;
      await found;
      const back = once(v, 'seeked');
      v.currentTime = 0;
      await back;
    }
  } catch (e) {
    close();
    throw new Error(`${(e as Error).message}: ${file.name}. Chrome plays MP4 (H.264), WebM and MOV with H.264; ProRes and RAW need a converted copy.`);
  }
  const duration = v.duration;
  const fps = Math.min(SAMPLE_FPS, MAX_FRAMES / Math.max(duration, 1e-3));
  const count = Math.max(1, Math.min(MAX_FRAMES, Math.ceil(duration * fps - 1e-9)));
  const size = analysisSize(v.videoWidth, v.videoHeight);
  const { c, g } = canvasFor(size.w, size.h);
  return {
    media: 'video', width: v.videoWidth, height: v.videoHeight, duration_s: Math.round(duration * 1000) / 1000, fps, count,
    frame: async (i: number) => {
      const t = Math.min(i / fps, Math.max(0, duration - 0.001));
      if (Math.abs(v.currentTime - t) > 1e-4 || v.readyState < 2) {
        const seeked = once(v, 'seeked');
        v.currentTime = t;
        await seeked;
      }
      g.drawImage(v, 0, 0, size.w, size.h);
      return png(c);
    },
    close,
  };
}

export function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).slice(String(r.result).indexOf(',') + 1));
    r.onerror = () => reject(new Error('could not read a frame'));
    r.readAsDataURL(blob);
  });
}
