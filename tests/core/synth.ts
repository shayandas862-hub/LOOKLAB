// Synthetic frames with known contents, for the P2 instrument tests. RGBA, 8 bits per channel.
import type { Pixels } from '../../src/core/image.ts';

export type RGB = [number, number, number];

export function hexRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function blank(width: number, height: number, rgb: RGB = [0, 0, 0]): Pixels {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = rgb[0];
    data[i * 4 + 1] = rgb[1];
    data[i * 4 + 2] = rgb[2];
    data[i * 4 + 3] = 255;
  }
  return { width, height, data };
}

export function set(px: Pixels, x: number, y: number, rgb: RGB): void {
  const i = (y * px.width + x) * 4;
  px.data[i] = rgb[0];
  px.data[i + 1] = rgb[1];
  px.data[i + 2] = rgb[2];
  px.data[i + 3] = 255;
}

export function get(px: Pixels, x: number, y: number): RGB {
  const i = (y * px.width + x) * 4;
  return [px.data[i], px.data[i + 1], px.data[i + 2]];
}

/**
 * Vertical stripes, one per patch, each as wide as its share of the frame.
 * Returns the frame and each patch's x range (for checking where a swatch was sampled).
 */
export function stripes(width: number, height: number, patches: [string, number][], top = 0, bottom = height) {
  const px = blank(width, height);
  const ranges: { hex: string; x0: number; x1: number }[] = [];
  let x = 0;
  let acc = 0;
  for (const [hex, share] of patches) {
    acc += share;
    const x1 = Math.round((acc / 100) * width);
    for (let xx = x; xx < x1; xx++) for (let y = top; y < bottom; y++) set(px, xx, y, hexRgb(hex));
    ranges.push({ hex, x0: x, x1 });
    x = x1;
  }
  return { px, ranges };
}

/** A small deterministic PRNG (mulberry32), so every synthetic frame is the same on every run. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Adds uniform noise of ±amp code values to every channel, in place. */
export function addNoise(px: Pixels, amp: number, seed = 7): Pixels {
  const r = rng(seed);
  for (let i = 0; i < px.data.length; i++) {
    if (i % 4 === 3) continue;
    px.data[i] = Math.max(0, Math.min(255, Math.round(px.data[i] + (r() * 2 - 1) * amp)));
  }
  return px;
}

export function clone(px: Pixels): Pixels {
  return { width: px.width, height: px.height, data: new Uint8ClampedArray(px.data) };
}

/** Linear light → 8-bit sRGB, written out here (not taken from src/core) so the tests check the core independently. */
export function srgbCode(linear: number): number {
  const v = linear <= 0.0031308 ? linear * 12.92 : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
}

export function srgbLinear(code: number): number {
  const c = code / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Mixes two frames: (1 - t)·a + t·b, as a cross-dissolve does. */
export function mix(a: Pixels, b: Pixels, t: number): Pixels {
  const out = clone(a);
  for (let i = 0; i < out.data.length; i++) out.data[i] = Math.round(a.data[i] * (1 - t) + b.data[i] * t);
  return out;
}
