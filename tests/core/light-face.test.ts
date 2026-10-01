// The fit on a frame (D-LL-033): a face box drawn by hand maps onto the fit's own face region (hairline to
// chin, cheek to cheek), the frame is resampled to the fit's 40 × 50, and the fit runs on that crop with the
// stated assumptions (lens 85, yaw 0, tilt 0, no practical lamp, wall 0.7). Proven here on frames drawn by the
// fit's own renderer, so the geometry is right before any Blender render is involved.
import { describe, expect, test } from 'vitest';
import { renderScene, type LightParams } from '../../src/core/light-render.ts';
import { downsample } from '../../src/core/light-fit.ts';
import { ASSUMED, cropForFit, FACE_REGION, FIT_H, FIT_W, fitFace, type FaceBox } from '../../src/core/light-face.ts';
import type { Pixels } from '../../src/core/image.ts';

/** A frame: the renderer's picture at `scale` × 40 × 50 placed at (ox, oy) on a mid-grey canvas, 8-bit RGBA. */
function frameOf(p: LightParams, scale: number, cw: number, ch: number, ox: number, oy: number) {
  const w = FIT_W * scale, h = FIT_H * scale;
  const { rgb } = renderScene(p, w, h, 0.012);
  const data = new Uint8ClampedArray(cw * ch * 4).fill(128);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = ((y + oy) * cw + x + ox) * 4, s = (y * w + x) * 3;
    data[o] = Math.round(rgb[s] * 255); data[o + 1] = Math.round(rgb[s + 1] * 255); data[o + 2] = Math.round(rgb[s + 2] * 255); data[o + 3] = 255;
  }
  const px: Pixels = { width: cw, height: ch, data };
  // The face box a careful person would draw: the fit's face region, in this frame's fractions.
  const box: FaceBox = {
    x: (ox + FACE_REGION.x0 * scale) / cw, y: (oy + FACE_REGION.y0 * scale) / ch,
    w: (FACE_REGION.x1 - FACE_REGION.x0) * scale / cw, h: (FACE_REGION.y1 - FACE_REGION.y0) * scale / ch,
  };
  return { px, box, rgb, w, h };
}

const rig = (az: number, el: number, kel: number, fill: number, soft = 0.4, int = 1.1): LightParams => ({ ...ASSUMED, az, el, kel, fill, soft, int });

describe('the fit\'s face region', () => {
  test('holds the renderer\'s own skin mask for the assumed camera', () => {
    const { head } = renderScene(rig(0, 20, 5600, 1), FIT_W, FIT_H, 0);
    let x0 = FIT_W, x1 = 0, y0 = FIT_H, y1 = 0;
    for (let j = 0; j < FIT_H; j++) for (let i = 0; i < FIT_W; i++) if (head[j * FIT_W + i]) {
      x0 = Math.min(x0, i); x1 = Math.max(x1, i + 1); y0 = Math.min(y0, j); y1 = Math.max(y1, j + 1);
    }
    expect(x0).toBeGreaterThanOrEqual(Math.floor(FACE_REGION.x0));
    expect(x1).toBeLessThanOrEqual(Math.ceil(FACE_REGION.x1));
    expect(y0).toBeGreaterThanOrEqual(Math.floor(FACE_REGION.y0));
    expect(y1).toBeLessThanOrEqual(Math.ceil(FACE_REGION.y1));
  });
});

describe('cropForFit', () => {
  test('a box on the renderer\'s face region gives back the renderer\'s own 40 × 50 picture (within 8-bit rounding)', () => {
    const { px, box, rgb, w, h } = frameOf(rig(-40, 25, 4200, 1.5), 6, 320, 360, 40, 30);
    const crop = cropForFit(px, box), want = downsample(rgb, w, h, 6);
    let max = 0;
    for (let i = 0; i < crop.length; i++) max = Math.max(max, Math.abs(crop[i] - want[i]));
    expect(max).toBeLessThanOrEqual(1 / 255);
  });

  test('parts of the window outside the frame repeat the frame\'s edge', () => {
    const { px, box } = frameOf(rig(30, 20, 5600, 1), 4, 170, 200, 5, 0);
    const crop = cropForFit(px, { ...box, x: 0 });
    expect(crop.length).toBe(FIT_W * FIT_H * 3);
    for (const v of crop) expect(Number.isFinite(v) && v >= 0 && v <= 1).toBe(true);
  });

  test('refuses a box outside the frame or too small to fit', () => {
    const { px } = frameOf(rig(0, 20, 5600, 1), 4, 170, 200, 5, 0);
    expect(() => cropForFit(px, { x: 0.8, y: 0.1, w: 0.3, h: 0.3 })).toThrow(/inside the frame/);
    expect(() => cropForFit(px, { x: 0.1, y: 0.1, w: 0.05, h: 0.05 })).toThrow(/too small/);
  });
});

describe('fitFace recovers the light on frames that meet its assumptions', () => {
  test.each([
    ['three-quarter, warm', rig(-50, 30, 3600, 2)],
    ['near frontal, soft', rig(10, 35, 5600, 0.8, 0.85)],
    ['side, hard, low-key', rig(85, 15, 4800, 2.8, 0.15, 1.3)],
  ])('%s: v0.2 tolerances (az 15°, el 8°, 500 K, 0.6 stops)', (_n, p) => {
    const { px, box } = frameOf(p, 6, 320, 360, 40, 30);
    const r = fitFace(px, box);
    expect(Math.abs(r.light.az - p.az)).toBeLessThanOrEqual(15);
    expect(Math.abs(r.light.el - p.el)).toBeLessThanOrEqual(8);
    expect(Math.abs(r.light.kel - p.kel)).toBeLessThanOrEqual(500);
    expect(Math.abs(r.light.fill - p.fill)).toBeLessThanOrEqual(0.6);
    expect(r.steps).toBeGreaterThan(2);
  });
});
