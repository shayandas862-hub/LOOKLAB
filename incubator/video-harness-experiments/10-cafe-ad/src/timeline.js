// Test 2 previs: one clock for the whole ad. 9:16 for Instagram Reels (the café's own channel), 24 fps.
export const W = 720, H = 1280, FPS = 24;

// The shots. Lens is the focal length the camera really uses (full-frame, 24 mm tall).
export const SHOTS = [
  { id: 'S1', name: 'FLOAT', t: [0, 3], lens: 50, what: 'the ingredients float in slow motion' },
  { id: 'S2', name: 'FALL IN', t: [3, 7.5], lens: 40, what: 'they fall into the glass bowl, layer by layer' },
  { id: 'S3', name: '360', t: [7.5, 12], lens: 50, what: 'the bowl turns all the way round: the layers through the glass' },
  { id: 'S4', name: 'HONEY', t: [12, 15], lens: 65, what: 'a hand squeezes honey over the top' },
  { id: 'S5', name: 'END', t: [15, 17.5], lens: 45, what: 'the hero bowl, then the logo' },
];
export const DURATION = SHOTS[SHOTS.length - 1].t[1];
export const shotAt = (t) => SHOTS.find((s) => t < s.t[1]) ?? SHOTS[SHOTS.length - 1];
export const fovOf = (mm) => (2 * Math.atan(12 / mm) * 180) / Math.PI;

// When each layer goes in (seconds, inside S2), and the honey (inside S4).
export const CUE = {
  fall: 3.0, acai1: [3.2, 4.3], granola: [4.1, 5.2], acai2: [5.0, 5.9], tops: [5.7, 7.2],
  handIn: 12.0, pour: [12.6, 14.6], handOut: 14.6, logo: 15.9,
};

// The logo's yellow, sampled from a screenshot of the café's Instagram (about #CAAC3A; their own file decides).
export const BRAND = '#CAAC3A';
export const INK = '#3a1430';
export const COPY = { name: 'Blend', line: 'açaí · coffee · matcha', place: '67A King Street · Stirling', note: 'PREVIS · placeholder type, not the café’s logo' };

export const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
export const span = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));

// Seeded random numbers, so every frame is the same on every run.
export function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}
