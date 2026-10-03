// Which files the Breakdown accepts, and which go through the Mac's converter first (D-LL-055).
import { expect, test } from 'vitest';
import { ACCEPT, mediaOf, needsConversion } from '../../src/ui/runtime/media.ts';

const f = (name: string, type = '') => ({ name, type }) as File;

test('photos from phones and cameras are images; the browser\'s own formats need no conversion', () => {
  for (const n of ['IMG_0725.HEIC', 'a.heif', 'b.tif', 'c.TIFF', 'd.dng', 'e.CR3', 'f.nef', 'g.arw', 'h.raf', 'i.orf', 'j.rw2', 'k.cr2']) {
    expect(mediaOf(f(n)), n).toBe('image');
    expect(needsConversion(f(n)), n).toBe(true);
  }
  for (const n of ['a.jpg', 'b.jpeg', 'c.png', 'd.webp', 'e.gif', 'f.avif', 'g.bmp']) {
    expect(mediaOf(f(n)), n).toBe('image');
    expect(needsConversion(f(n)), n).toBe(false);
  }
  expect(needsConversion(f('x', 'image/heic'))).toBe(true);
  expect(mediaOf(f('clip.MOV'))).toBe('video');
  expect(mediaOf(f('notes.txt'))).toBeNull();
});

test('the file picker offers them all', () => {
  for (const x of ['image/*', 'video/*', '.heic', '.heif', '.tif', '.tiff', '.dng', '.cr3', '.nef', '.arw']) expect(ACCEPT.split(','), x).toContain(x);
});
