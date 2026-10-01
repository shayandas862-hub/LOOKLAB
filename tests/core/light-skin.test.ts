// The fit's objective since the Blender baseline (D-LL-035): v0.2's renderer and search, scored only on the
// skin of the face, as a brightness pattern normalised for skin tone and exposure. Checked here on frames
// the renderer itself draws, where the answer is known exactly; its accuracy on Blender frames is measured in
// tests/core/light-accuracy.test.ts.
import { describe, expect, test } from 'vitest';
import { renderScene, type LightParams } from '../../src/core/light-render.ts';
import { ASSUMED, FACE_REGION, FIT_H, FIT_W, type FaceBox } from '../../src/core/light-face.ts';
import { EYE_AT, EYE_ROW, fitSkin, SKIN_MASK, windowFor } from '../../src/core/light-skin.ts';
import type { Pixels } from '../../src/core/image.ts';

function frameOf(p: LightParams, gain = 1) {
  const scale = 6, cw = 320, ch = 360, ox = 40, oy = 30, w = FIT_W * scale, h = FIT_H * scale;
  const { rgb } = renderScene(p, w, h, 0.012);
  const data = new Uint8ClampedArray(cw * ch * 4).fill(128);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = ((y + oy) * cw + x + ox) * 4, s = (y * w + x) * 3;
    // `gain` scales the light reaching the camera (linear), as a darker skin or a stop less exposure would.
    for (let c = 0; c < 3; c++) data[o + c] = Math.round(255 * Math.pow(Math.pow(rgb[s + c], 2.2) * gain, 1 / 2.2));
    data[o + 3] = 255;
  }
  const px: Pixels = { width: cw, height: ch, data };
  // The box a person draws under the eye-line rule: the renderer's eye line at EYE_AT of it, its chin at the bottom.
  const chin = (oy + FACE_REGION.y1 * scale) / ch, bh = (FACE_REGION.y1 - EYE_ROW) * scale / ch / (1 - EYE_AT);
  const box: FaceBox = { x: (ox + FACE_REGION.x0 * scale) / cw, y: chin - bh, w: (FACE_REGION.x1 - FACE_REGION.x0) * scale / cw, h: bh };
  return { px, box };
}
const rig = (az: number, el: number, fill: number, soft = 0.4, kel = 5000): LightParams => ({ ...ASSUMED, az, el, fill, soft, kel, int: 1.1 });
const azErr = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);

describe('the skin mask', () => {
  test('is the renderer\'s own bare skin for the assumed camera: a few hundred pixels inside the face region', () => {
    expect(SKIN_MASK.length).toBeGreaterThan(200);
    for (const i of SKIN_MASK) {
      const x = i % FIT_W, y = Math.floor(i / FIT_W);
      expect(x).toBeGreaterThanOrEqual(Math.floor(FACE_REGION.x0));
      expect(x).toBeLessThan(Math.ceil(FACE_REGION.x1));
      expect(y).toBeGreaterThanOrEqual(Math.floor(FACE_REGION.y0));
      expect(y).toBeLessThan(Math.ceil(FACE_REGION.y1));
    }
  });
});

describe('the eye-line mapping (D-LL-035)', () => {
  test('puts the renderer\'s face region exactly where its eye line and chin fall in the drawn box', () => {
    const w = windowFor({ x: 0.1, y: 0.2, w: 0.3, h: 0.5 }, 'eyes');
    const rowAt = (y: number) => (y - w.y) / w.h * (FACE_REGION.y1 - FACE_REGION.y0) + FACE_REGION.y0;
    expect(rowAt(0.2 + EYE_AT * 0.5)).toBeCloseTo(EYE_ROW, 9);
    expect(rowAt(0.7)).toBeCloseTo(FACE_REGION.y1, 9);
    expect([w.x, w.w]).toEqual([0.1, 0.3]);
  });
});

describe('fitSkin on frames the renderer draws', () => {
  test.each([
    ['three-quarter', rig(-50, 30, 2)],
    ['near frontal, soft', rig(10, 35, 0.8, 0.85)],
    ['side, hard, low-key', rig(85, 15, 2.8, 0.15)],
    ['from behind-left', rig(-120, 25, 1.5)],
  ])('%s: direction within 15° az and 10° el', (_n, p) => {
    const { px, box } = frameOf(p);
    const r = fitSkin(px, box);
    expect(azErr(r.light.az, p.az)).toBeLessThanOrEqual(15);
    expect(Math.abs(r.light.el - p.el)).toBeLessThanOrEqual(10);
  });

  test('the fitted direction barely moves when the face is two stops darker (skin tone or exposure)', () => {
    const p = rig(-45, 30, 1.5);
    const a = fitSkin(frameOf(p).px, frameOf(p).box), b = fitSkin(frameOf(p, 0.25).px, frameOf(p, 0.25).box);
    expect(azErr(a.light.az, b.light.az)).toBeLessThanOrEqual(6);
    expect(Math.abs(a.light.el - b.light.el)).toBeLessThanOrEqual(6);
  });

  test('is deterministic and reports a residual and a confidence score', () => {
    const { px, box } = frameOf(rig(30, 20, 1));
    const a = fitSkin(px, box), b = fitSkin(px, box);
    expect(a).toEqual(b);
    expect(a.err).toBeGreaterThanOrEqual(0);
    expect(a.score).toBeGreaterThanOrEqual(0);
    expect(a.score).toBeLessThanOrEqual(100);
  });
});
