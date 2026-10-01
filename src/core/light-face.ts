// The light fit on a real frame (D-LL-033). A face box drawn by hand (hairline to chin, cheek to cheek) is
// mapped onto the fit's own face region, the frame is area-resampled to the fit's 40 × 50 around it, and the
// fit runs on that crop. The box sets the head's place and size, so the lens is not an input; what the fit
// cannot see is assumed (ASSUMED). No DOM, no Node (AD-LL-009).
import type { Pixels } from './image.ts';
import type { LightParams } from './light-render.ts';
import { runFit, type FitLog } from './light-fit.ts';

/** The fit works at 40 × 50, as v0.2's did (its frames were 240 × 300 downsampled by 6). */
export const FIT_W = 40, FIT_H = 50;

/** A face box on a frame, as fractions of its width and height (0 = left / top). */
export interface FaceBox { x: number; y: number; w: number; h: number }

/**
 * What the fit assumes about the camera and the set (D-LL-033): the renderer's standard head size (lens 85
 * sets only its scale), the face pointing at the camera from eye level, no practical lamp in frame, a wall of
 * middling brightness. The light values are only where the search starts.
 */
export const ASSUMED: LightParams = { az: 0, el: 20, soft: 0.5, int: 1, kel: 5600, fill: 1, lens: 85, yaw: 0, tilt: 0, lamp: 0, wall: 0.7 };

/**
 * The renderer's face, hairline to chin and cheek to cheek, in pixels of the 40 × 50 fit frame, for ASSUMED:
 * head radii 0.62 and 0.80 of the half-width, centre 0.14 above the middle, hairline at 0.42 of the vertical
 * radius above the centre (where the renderer's hair begins), chin at the bottom of the head.
 */
const RX = 0.62, RY = 0.80, CY = -0.14, HAIRLINE = -0.42, ASPECT = FIT_H / FIT_W;
const toX = (px: number) => (px + 1) / 2 * FIT_W;
const toY = (py: number) => (py / ASPECT + 1) / 2 * FIT_H;
export const FACE_REGION = { x0: toX(-RX), x1: toX(RX), y0: toY(CY + RY * HAIRLINE), y1: toY(CY + RY) };

/** Smallest face box the fit accepts, in frame pixels each way: below this the crop is mostly guesswork. */
export const MIN_FACE_PX = 24;

/** Throws a RangeError saying why, when the box is outside the frame, too small, or not face-shaped. */
export function checkFaceBox(px: Pixels, box: FaceBox): void {
  const eps = 1e-9;
  if (!(box.w > 0 && box.h > 0) || box.x < -eps || box.y < -eps || box.x + box.w > 1 + eps || box.y + box.h > 1 + eps) {
    throw new RangeError('the face box must lie inside the frame');
  }
  const bw = box.w * px.width, bh = box.h * px.height;
  if (bw < MIN_FACE_PX || bh < MIN_FACE_PX) {
    throw new RangeError(`the face box is too small to fit (${Math.round(bw)} × ${Math.round(bh)} px; at least ${MIN_FACE_PX} px each way)`);
  }
  if (bh / bw < 0.6 || bh / bw > 2.5) {
    throw new RangeError(`the face box is ${Math.round(bw)} px wide and ${Math.round(bh)} px tall; a face is 0.6 to 2.5 times as tall as it is wide`);
  }
}

/**
 * The frame around the face, resampled to 40 × 50 display values in [0, 1] so that the box lands on
 * FACE_REGION. Each output pixel is the area-weighted mean of the frame pixels under it; parts of the window
 * outside the frame repeat the frame's edge.
 */
export function cropForFit(px: Pixels, box: FaceBox): Float32Array {
  checkFaceBox(px, box);
  return resampleWindow(px, box);
}

/** cropForFit without the checks: the window may reach outside the frame (edge pixels repeat). */
export function resampleWindow(px: Pixels, box: FaceBox): Float32Array {
  const W = px.width, H = px.height, d = px.data;
  const sx = box.w * W / (FACE_REGION.x1 - FACE_REGION.x0), sy = box.h * H / (FACE_REGION.y1 - FACE_REGION.y0);
  const wx0 = box.x * W - FACE_REGION.x0 * sx, wy0 = box.y * H - FACE_REGION.y0 * sy;
  const out = new Float32Array(FIT_W * FIT_H * 3);
  for (let j = 0; j < FIT_H; j++) {
    const ya = wy0 + j * sy, yb = ya + sy;
    for (let i = 0; i < FIT_W; i++) {
      const xa = wx0 + i * sx, xb = xa + sx;
      let r = 0, g = 0, b = 0, wsum = 0;
      for (let y = Math.floor(ya); y < Math.ceil(yb); y++) {
        const wy = Math.min(yb, y + 1) - Math.max(ya, y);
        if (wy <= 0) continue;
        const row = Math.min(H - 1, Math.max(0, y)) * W;
        for (let x = Math.floor(xa); x < Math.ceil(xb); x++) {
          const wgt = wy * (Math.min(xb, x + 1) - Math.max(xa, x));
          if (wgt <= 0) continue;
          const o = (row + Math.min(W - 1, Math.max(0, x))) * 4;
          r += d[o] * wgt; g += d[o + 1] * wgt; b += d[o + 2] * wgt; wsum += wgt;
        }
      }
      const q = (j * FIT_W + i) * 3, k = 1 / (255 * wsum);
      out[q] = r * k; out[q + 1] = g * k; out[q + 2] = b * k;
    }
  }
  return out;
}

export interface FaceFit {
  light: Pick<LightParams, 'az' | 'el' | 'soft' | 'int' | 'kel' | 'fill'>;
  /** Mean absolute difference between the fitted render and the crop. */
  err: number;
  steps: number;
  logs: FitLog[];
  /** The crop the fit saw (40 × 50 RGB), for a caller that wants to score it further. */
  crop: Float32Array;
}

/** Fits the light to the face in a frame. `base` holds the camera and set; ASSUMED unless a person set them. */
export function fitFace(px: Pixels, box: FaceBox, base: LightParams = ASSUMED): FaceFit {
  const crop = cropForFit(px, box);
  const r = runFit(crop, FIT_W, FIT_H, base);
  const { az, el, soft, int, kel, fill } = r.p;
  return { light: { az, el, soft, int, kel, fill }, err: r.err, steps: r.steps, logs: r.logs, crop };
}
