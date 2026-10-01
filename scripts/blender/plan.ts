// Plans the Blender ground-truth sets (P3 task 3): every rig drawn from a seed, so the truth is deterministic
// and can be checked without Blender. render_set.py only builds what this file decides. A development tool:
// nothing at runtime imports it.
//
// Conventions, the same as the fit's (D-LL-033). The head faces the camera (yaw 0) and the camera is level at
// eye height (tilt 0); the camera looks along +Y. Key az is camera-relative: 0 is from the camera, positive from
// the right of the frame, ±180 from behind; el is degrees above the eye line. Kelvin is the key's colour through
// a camera white-balanced at 5600 K, from Planck's law (not the fit's own colour curve). Fill is key over fill in
// stops of irradiance at the face, as an incident meter pointed at each light reads it. Softness is the key's
// angular diameter seen from the face over 60°, clamped to 0–1.

export const PLAN_VERSION = 1;
export const SETS = [
  { name: 'dev', seed: 1, rigs: 8 },   // may be looked at while the algorithm changes
  { name: 'test', seed: 2, rigs: 12 }, // held out: run once, for the acceptance number
] as const;

export const RENDER = { width: 512, height: 288, engine: 'CYCLES', samples: 128, denoise: true, view_transform: 'Standard', sensor_mm: 36 };

/** Head-local geometry in metres (x right, y toward the back of the head, z up); render_set.py builds the same. */
export const HEAD = {
  centre: [0, 0, 1.6] as const,
  radii: [0.075, 0.095, 0.115] as const,
  eye_z: 0.012,
  /** The face box a person draws: hairline to chin, cheek to cheek. */
  hairline: [0, -0.086, 0.054] as const,
  chin: [0, -0.062, -0.108] as const,
  cheek: [0.075, -0.01, -0.005] as const,
};

/** ColorChecker "light skin" (194, 150, 130) and a deeper brown (96, 64, 50), as sRGB 8-bit albedo. */
export const SKINS = { light: [194, 150, 130], dark: [96, 64, 50] } as const;
/** Linear albedo of each wall; `black` has no wall, only a near-black world. */
export const BACKGROUNDS: Record<string, [number, number, number] | null> = {
  grey: [0.18, 0.18, 0.18], warm: [0.42, 0.3, 0.2], teal: [0.04, 0.1, 0.1], offwhite: [0.7, 0.68, 0.64], mottled: [0.25, 0.22, 0.2], black: null,
};
export const CLOTHES: Record<string, [number, number, number]> = {
  navy: [0.02, 0.03, 0.08], charcoal: [0.04, 0.04, 0.045], maroon: [0.12, 0.02, 0.025], olive: [0.08, 0.08, 0.03],
};
const FOCALS = [35, 50, 85, 135];
/** Key irradiance at 0 stops of exposure, in the units render_set.py turns into Blender watts (calibrated once). */
export const KEY_IRRADIANCE = 5.6;
const FILL = { el: 8, kelvin: 6500, distance_m: 2.0, size_m: 2.0 };

type V3 = [number, number, number];
export interface SceneTruth {
  id: string;
  set: string;
  seed: number;
  rig: number;
  plan_version: number;
  skin: { tone: 'light' | 'dark'; srgb: readonly number[]; linear: V3 };
  key: { az: number; el: number; softness: number; kelvin: number; distance_m: number; size_m: number; angular_size_deg: number };
  fill: { stops: number; az: number; el: number; kelvin: number; distance_m: number; size_m: number };
  exposure_stops: number;
  camera: { focal_mm: number; sensor_mm: number; position: V3; shift_x: number; shift_y: number };
  head: { yaw: number; tilt: number };
  background: string;
  clothes: string;
  wall_distance_m: number;
  face_box: { x: number; y: number; w: number; h: number };
  /** What render_set.py sets in Blender: positions, colours (max channel 1) and powers. */
  blender: { key: LightSetup; fill: LightSetup; wall: V3 | null; clothes: V3; skin: V3 };
}
interface LightSetup { position: V3; aim: V3; size_m: number; color: V3; power_w: number }

// `+ 0` turns −0 into 0: JSON writes −0 as 0, and the committed truth must read back equal.
const r4 = (v: number) => Math.round(v * 1e4) / 1e4 + 0;
const r1 = (v: number) => Math.round(v * 10) / 10 + 0;
const D2R = Math.PI / 180;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(n: number, rnd: () => number): number[] {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const srgbToLinear = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };

/** Planckian locus chromaticity (Kim et al. 2002 cubic fit, 1667–25000 K). */
function planckXY(T: number): [number, number] {
  const t = 1e3 / T, t2 = t * t, t3 = t2 * t;
  const x = T <= 4000 ? -0.2661239 * t3 - 0.2343589 * t2 + 0.8776956 * t + 0.179910 : -3.0258469 * t3 + 2.1070379 * t2 + 0.2226347 * t + 0.240390;
  const y = T <= 2222 ? -1.1063814 * x ** 3 - 1.3481102 * x ** 2 + 2.18555832 * x - 0.20219683
    : T <= 4000 ? -0.9549476 * x ** 3 - 1.37418593 * x ** 2 + 2.09137015 * x - 0.16748867
      : 3.081758 * x ** 3 - 5.8733867 * x ** 2 + 3.75112997 * x - 0.37001483;
  return [x, y];
}
function planckLinear(T: number): V3 {
  const [x, y] = planckXY(T), X = x / y, Z = (1 - x - y) / y;
  return [3.2406 * X - 1.5372 - 0.4986 * Z, -0.9689 * X + 1.8758 + 0.0415 * Z, 0.0557 * X - 0.204 + 1.057 * Z];
}
const P5600 = planckLinear(5600);
/** A blackbody's linear RGB through a camera white-balanced at 5600 K (5600 K is [1, 1, 1]). */
export function planckRGB(T: number): V3 {
  const c = planckLinear(T);
  return [c[0] / P5600[0], c[1] / P5600[1], c[2] / P5600[2]];
}

const add = (a: readonly number[], b: readonly number[]): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: readonly number[], k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const dirOf = (az: number, el: number): V3 => [Math.sin(az * D2R) * Math.cos(el * D2R), -Math.cos(az * D2R) * Math.cos(el * D2R), Math.sin(el * D2R)];

/** A disk light aimed at the head, with power set so its irradiance at the head is E (on-axis disk formula). */
function disk(az: number, el: number, dist: number, size: number, kelvin: number, E: number): LightSetup {
  const c = planckRGB(kelvin), m = Math.max(...c), r = size / 2;
  return {
    position: add(HEAD.centre, scale(dirOf(az, el), dist)).map(r4) as V3,
    aim: [...HEAD.centre] as V3,
    size_m: r4(size),
    color: c.map((v) => r4(v / m)) as V3,
    power_w: r4(E * Math.PI * (r * r + dist * dist) * m),
  };
}

/** Pinhole projection into the 512 × 288 frame (pixels from the top left), Blender's shift convention. */
function project(p: readonly number[], cam: V3, focal: number, shiftX: number, shiftY: number): [number, number] {
  const W = RENDER.width, H = RENDER.height, fpx = focal / RENDER.sensor_mm * W, depth = p[1] - cam[1];
  return [W / 2 + fpx * (p[0] - cam[0]) / depth - shiftX * W, H / 2 - fpx * (p[2] - cam[2]) / depth + shiftY * W];
}

export function planSet(name: string, seed: number, rigs: number): SceneTruth[] {
  const rnd = mulberry32(seed * 7919 + 17);
  const azOrder = shuffled(rigs, rnd), elOrder = shuffled(rigs, rnd);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)];
  const out: SceneTruth[] = [];
  for (let k = 0; k < rigs; k++) {
    const az = r1(-135 + (azOrder[k] + rnd()) * 270 / rigs);
    const el = r1((elOrder[k] + rnd()) * 60 / rigs);
    const softness = r4(0.03 + 0.87 * rnd());
    const kelvin = Math.round((2900 + 3900 * rnd()) / 10) * 10;
    const stops = Math.round((0.5 + 3.0 * rnd()) * 100) / 100;
    const kd = r4(1.3 + 1.1 * rnd());
    const exposure = Math.round((-0.4 + 0.8 * rnd()) * 100) / 100 + 0;
    const focal = pick(FOCALS);
    const faceFrac = 0.32 + 0.26 * rnd();
    const u = pick([1 / 3, 1 / 2, 2 / 3]) + (rnd() - 0.5) * 0.06, v = 0.42 + 0.08 * rnd();
    const background = pick(Object.keys(BACKGROUNDS)), clothes = pick(Object.keys(CLOTHES));
    const wallDist = r4(0.8 + 1.4 * rnd());

    const angular = softness * 60, size = 2 * kd * Math.tan(angular / 2 * D2R);
    const E = KEY_IRRADIANCE * Math.pow(2, exposure);
    const key = disk(az, el, kd, size, kelvin, E);
    const fill = disk(-az, FILL.el, FILL.distance_m, FILL.size_m, FILL.kelvin, E / Math.pow(2, stops));

    const fpx = focal / RENDER.sensor_mm * RENDER.width, faceH = HEAD.hairline[2] - HEAD.chin[2];
    const D = fpx * faceH / (faceFrac * RENDER.height) - HEAD.hairline[1];
    const cam: V3 = [0, r4(-D), r4(HEAD.centre[2] + HEAD.eye_z)];
    const faceMid: V3 = [0, (HEAD.hairline[1] + HEAD.chin[1]) / 2, HEAD.centre[2] + (HEAD.hairline[2] + HEAD.chin[2]) / 2];
    const shiftX = r4(0.5 - u);
    const v0 = project(faceMid, cam, focal, shiftX, 0)[1];
    const shiftY = r4((v * RENDER.height - v0) / RENDER.width);
    const at = (p: readonly number[]) => project(add(HEAD.centre, p), cam, focal, shiftX, shiftY);
    const [, top] = at(HEAD.hairline), [, bottom] = at(HEAD.chin);
    const [left] = at([-HEAD.cheek[0], HEAD.cheek[1], HEAD.cheek[2]]), [right] = at(HEAD.cheek);
    const face_box = { x: r4(left / RENDER.width), y: r4(top / RENDER.height), w: r4((right - left) / RENDER.width), h: r4((bottom - top) / RENDER.height) };

    for (const tone of ['light', 'dark'] as const) {
      const lin = SKINS[tone].map((c) => r4(srgbToLinear(c))) as V3;
      out.push({
        id: `${name}-${String(k + 1).padStart(2, '0')}-${tone}`, set: name, seed, rig: k + 1, plan_version: PLAN_VERSION,
        skin: { tone, srgb: SKINS[tone], linear: lin },
        key: { az, el, softness, kelvin, distance_m: kd, size_m: key.size_m, angular_size_deg: r1(angular) },
        fill: { stops, az: -az + 0, el: FILL.el, kelvin: FILL.kelvin, distance_m: FILL.distance_m, size_m: FILL.size_m },
        exposure_stops: exposure,
        camera: { focal_mm: focal, sensor_mm: RENDER.sensor_mm, position: cam, shift_x: shiftX, shift_y: shiftY },
        head: { yaw: 0, tilt: 0 },
        background, clothes, wall_distance_m: wallDist, face_box,
        blender: { key, fill, wall: BACKGROUNDS[background], clothes: CLOTHES[clothes], skin: lin },
      });
    }
  }
  return out;
}
