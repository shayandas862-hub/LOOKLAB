// The light fit's own renderer, ported from v0.2 (reference/v0.2/src/base.html, CORE block) without change
// to its arithmetic: an analytic head (ellipse with nose, eye sockets and brow as normal bumps, hair on top),
// a torso, a wall lit by the key, and an optional practical lamp. No perspective, no cast shadows. The fit
// explains a frame by finding the parameters whose render looks most like it. No DOM, no Node (AD-LL-009).
//
// Directions are camera-relative (D-LL-033): az 0 is a key from the camera, positive az from the right of the
// frame, ±180 from behind; el is degrees above the eye line. Pixels are display values in [0, 1].

/** Everything the renderer draws from. az, el, soft, int, kel, fill are the light; the rest is camera and set. */
export interface LightParams {
  az: number;
  el: number;
  /** 0 hard … 1 soft (wrap and specular spread). */
  soft: number;
  /** Key intensity. */
  int: number;
  /** Key colour temperature in kelvin, against a 5600 K white balance. */
  kel: number;
  /** Key over fill, in stops. */
  fill: number;
  /** Head scale: the head's width is 0.62 × lens / 85 of the frame's half-width. */
  lens: number;
  /** Head turned from the camera, degrees. */
  yaw: number;
  /** Head raised (+) or lowered (−), in units of 0.05 of the frame's half-width. */
  tilt: number;
  /** 1 draws a practical lamp at frame right; 0 none. */
  lamp: number;
  /** Wall brightness. */
  wall: number;
}

export interface Render {
  /** Width × height × 3 display values in [0, 1], rows top to bottom. */
  rgb: Float32Array;
  /** 1 where the pixel is bare skin of the face (not hair, not the chin's edge), else 0. */
  head: Uint8Array;
}

export const D2R = Math.PI / 180;
export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const sstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
/** Rec. 709 luma of display values (v0.2's `lumD`). */
export const lumD = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

/** Tanner Helland's blackbody approximation, as v0.2 used it: 0–1 RGB for a colour temperature. */
export function kelvinRGB(k: number): [number, number, number] {
  const t = k / 100;
  let r: number, g: number, b: number;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }
  return [clamp(r, 0, 255) / 255, clamp(g, 0, 255) / 255, clamp(b, 0, 255) / 255];
}
const K5600 = kelvinRGB(5600);
/** A light's colour through a camera white-balanced at 5600 K. */
export function keyColor(k: number): [number, number, number] {
  const c = kelvinRGB(k);
  return [c[0] / K5600[0], c[1] / K5600[1], c[2] / K5600[2]];
}
function hash2(x: number, y: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const SKIN = [0.86, 0.63, 0.52], HAIR = [0.07, 0.055, 0.05], CLOTH = [0.11, 0.12, 0.15];

/** Renders the scene at w × h. `grain` adds deterministic film grain of that amplitude (0 for none). */
export function renderScene(p: LightParams, w: number, h: number, grain: number): Render {
  const rgb = new Float32Array(w * h * 3), head = new Uint8Array(w * h);
  const azv = (p.az - p.yaw) * D2R, el = p.el * D2R, ce = Math.cos(el);
  const L = [Math.sin(azv) * ce, Math.sin(el), Math.cos(azv) * ce];
  const fe = 0.14, fcs = Math.cos(fe);
  const FL = [Math.sin(-azv) * fcs, Math.sin(fe), Math.cos(-azv) * fcs];
  let Hx = L[0], Hy = L[1], Hz = L[2] + 1;
  const hl = Math.hypot(Hx, Hy, Hz) || 1;
  Hx /= hl; Hy /= hl; Hz /= hl;
  const kc = keyColor(p.kel), fcol = keyColor(6500), lcol = keyColor(2700);
  const wrapK = 0.12 + 0.55 * p.soft, specK = 0.26 * (1 - 0.7 * p.soft), shin = 90 - 70 * p.soft;
  const fillI = p.int / Math.pow(2, p.fill);
  const lampOn = p.lamp ? 1 : 0, lampI = 0.12 * lampOn;
  const lv = [0.82, 0.12, 0.4], ln = Math.hypot(lv[0], lv[1], lv[2]), ll = [lv[0] / ln, lv[1] / ln, lv[2] / ln];
  const s = p.lens / 85, rx = 0.62 * s, ry = 0.80 * s, cy = -0.14 + p.tilt * 0.05;
  const ta = rx * 2.1, tb = ry, tcy = cy + ry * 0.72 + tb, cz = (rx + ry) * 0.45;
  const lampX = 0.70 - Math.sin(p.yaw * D2R) * 1.3, lampY = -0.28, lampR = 0.16 * Math.sqrt(s);
  const aspect = h / w, sinA = Math.sin(azv), cosA = Math.cos(azv);
  const wb = [0.34 * p.wall, 0.37 * p.wall, 0.40 * p.wall];
  const nx0 = -Math.sin(p.yaw * D2R) * 0.85;
  const pxH = Math.min(rx, ry) * (w / 2), pxT = Math.min(ta, tb) * (w / 2);
  let sR = 0, sG = 0, sB = 0;
  function lit(nx: number, ny: number, nz: number, al: number[], spec: number) {
    const nl = nx * L[0] + ny * L[1] + nz * L[2];
    const d = Math.max(0, (nl + wrapK) / (1 + wrapK));
    const nf = nx * FL[0] + ny * FL[1] + nz * FL[2];
    const df = Math.max(0, (nf + 0.6) / 1.6);
    const nh = nx * Hx + ny * Hy + nz * Hz;
    const sp = nl > 0 && nh > 0 ? spec * specK * Math.pow(nh, shin) : 0;
    const nlp = Math.max(0, nx * ll[0] + ny * ll[1] + nz * ll[2]);
    const key = p.int * d, fil = fillI * df, lam = lampI * nlp;
    sR = al[0] * (key * kc[0] + fil * fcol[0] + lam * lcol[0] + 0.025) + sp * p.int * kc[0];
    sG = al[1] * (key * kc[1] + fil * fcol[1] + lam * lcol[1] + 0.025) + sp * p.int * kc[1];
    sB = al[2] * (key * kc[2] + fil * fcol[2] + lam * lcol[2] + 0.025) + sp * p.int * kc[2];
  }
  for (let j = 0; j < h; j++) {
    const py = ((j + 0.5) / h * 2 - 1) * aspect;
    for (let i = 0; i < w; i++) {
      const px = (i + 0.5) / w * 2 - 1, o = (j * w + i) * 3;
      const wl = 0.5 + 0.5 * clamp(px * sinA * 1.4 + 0.25 * cosA, -1, 1);
      const wallL = (0.06 + 0.85 * p.int * wl) * (1 - 0.10 * (py + aspect) / (2 * aspect));
      let R = wb[0] * wallL * kc[0], G = wb[1] * wallL * kc[1], B = wb[2] * wallL * kc[2];
      if (lampOn) {
        const dx = px - lampX, dy = py - lampY, d2 = dx * dx + dy * dy;
        const g = 1.7 * Math.exp(-d2 / (lampR * lampR)) + 0.5 * Math.exp(-d2 / (12.25 * lampR * lampR));
        R += lcol[0] * g; G += lcol[1] * g; B += lcol[2] * g;
      }
      { // torso
        const ex = px / ta, ey = (py - tcy) / tb, r2 = ex * ex + ey * ey;
        if (r2 < 1.1) {
          const m = clamp((1 - Math.sqrt(r2)) * pxT + 0.5, 0, 1);
          if (m > 0) {
            const sq = Math.sqrt(Math.max(1 - r2, 0.04));
            let nx = 0.6 * ex / sq, ny = -0.6 * (ta / tb) * ey / sq, nz = 1;
            const nn = Math.hypot(nx, ny, nz);
            nx /= nn; ny /= nn; nz /= nn;
            lit(nx, ny, nz, CLOTH, 0.3);
            R = R * (1 - m) + sR * m; G = G * (1 - m) + sG * m; B = B * (1 - m) + sB * m;
          }
        }
      }
      { // head
        const ex = px / rx, ey = (py - cy) / ry, r2 = ex * ex + ey * ey;
        if (r2 < 1.1) {
          const m = clamp((1 - Math.sqrt(r2)) * pxH + 0.5, 0, 1);
          if (m > 0) {
            const sq = Math.sqrt(Math.max(1 - r2, 0.03)), u = ex - nx0;
            let gx = 0, gy = 0, g: number, vv: number, su: number, sv: number;
            su = 0.14; sv = 0.30; vv = ey - 0.14; g = 0.24 * Math.exp(-(u * u / (su * su) + vv * vv / (sv * sv))); gx += g * (-2 * u / (su * su)); gy += g * (-2 * vv / (sv * sv));
            for (let k = 0; k < 2; k++) {
              const uu = u - (k ? 0.36 : -0.36); su = 0.17; sv = 0.09; vv = ey + 0.16;
              g = -0.10 * Math.exp(-(uu * uu / (su * su) + vv * vv / (sv * sv))); gx += g * (-2 * uu / (su * su)); gy += g * (-2 * vv / (sv * sv));
            }
            su = 0.6; sv = 0.07; vv = ey + 0.30; g = 0.10 * Math.exp(-(u * u / (su * su) + vv * vv / (sv * sv))); gx += g * (-2 * u / (su * su)); gy += g * (-2 * vv / (sv * sv));
            let nx = cz / rx * (ex / sq - gx), ny = cz / ry * (-ey / sq + gy), nz = 1;
            const nn = Math.hypot(nx, ny, nz);
            nx /= nn; ny /= nn; nz /= nn;
            const hm = sstep(-0.5, 0.5, (-ey) - (0.42 - 0.20 * ex * ex));
            const al = [SKIN[0] * (1 - hm) + HAIR[0] * hm, SKIN[1] * (1 - hm) + HAIR[1] * hm, SKIN[2] * (1 - hm) + HAIR[2] * hm];
            lit(nx, ny, nz, al, 1);
            R = R * (1 - m) + sR * m; G = G * (1 - m) + sG * m; B = B * (1 - m) + sB * m;
            if (m > 0.9 && hm < 0.1 && ey < 0.7 && Math.abs(ex) < 0.85) head[j * w + i] = 1;
          }
        }
      }
      const v = 1 - 0.32 * (px * px * 0.55 + py * py * 0.35);
      R = 1 - Math.exp(-1.15 * R * v); G = 1 - Math.exp(-1.15 * G * v); B = 1 - Math.exp(-1.15 * B * v);
      if (grain) {
        const n = (hash2(i, j) - 0.5) * 2 * grain;
        R += n; G += n * 0.9 + (hash2(i + 91, j + 7) - 0.5) * grain * 0.4; B += n;
      }
      rgb[o] = clamp(R, 0, 1); rgb[o + 1] = clamp(G, 0, 1); rgb[o + 2] = clamp(B, 0, 1);
    }
  }
  return { rgb, head };
}
