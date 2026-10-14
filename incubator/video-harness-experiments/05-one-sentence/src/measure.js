// Measurements shown on screen. Every number the film displays comes from here or from the camera itself.
//   CIEDE2000 colour difference (Sharma, Wu & Dalal 2005), sRGB → CIELAB (D65), and three.js's ACES filmic tone
//   map, so a rendered pixel is measured the way it is displayed.
import * as THREE from 'three';

const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;

export function deltaE00([L1, a1, b1], [L2, a2, b2]) {
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2, P = 25 ** 7;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + P)));
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2, C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2);
  const hue = (b, a) => (a === 0 && b === 0 ? 0 : (deg(Math.atan2(b, a)) + 360) % 360);
  const h1p = hue(b1, a1p), h2p = hue(b2, a2p);
  const dLp = L2 - L1, dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) { dhp = h2p - h1p; if (dhp > 180) dhp -= 360; else if (dhp < -180) dhp += 360; }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(rad(dhp) / 2);
  const Lpm = (L1 + L2) / 2, Cpm = (C1p + C2p) / 2;
  let hpm = h1p + h2p;
  if (C1p * C2p !== 0) hpm = Math.abs(h1p - h2p) > 180 ? (h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2) : (h1p + h2p) / 2;
  const T = 1 - 0.17 * Math.cos(rad(hpm - 30)) + 0.24 * Math.cos(rad(2 * hpm)) + 0.32 * Math.cos(rad(3 * hpm + 6)) - 0.2 * Math.cos(rad(4 * hpm - 63));
  const dTheta = 30 * Math.exp(-(((hpm - 275) / 25) ** 2)), RC = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + P));
  const SL = 1 + (0.015 * (Lpm - 50) ** 2) / Math.sqrt(20 + (Lpm - 50) ** 2), SC = 1 + 0.045 * Cpm, SH = 1 + 0.015 * Cpm * T;
  const RT = -Math.sin(rad(2 * dTheta)) * RC;
  return Math.sqrt((dLp / SL) ** 2 + (dCp / SC) ** 2 + (dHp / SH) ** 2 + RT * (dCp / SC) * (dHp / SH));
}

const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const enc = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
// Linear sRGB (0..1) → CIELAB, D65 white.
export function labOfLinear([r, g, b]) {
  const X = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b, Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b, Z = 0.0193339 * r + 0.119192 * g + 0.9503041 * b;
  const f = (t) => (t > (6 / 29) ** 3 ? Math.cbrt(t) : t / (3 * (6 / 29) ** 2) + 4 / 29);
  const fx = f(X / 0.95047), fy = f(Y), fz = f(Z / 1.08883);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
export const labOfHex = (hex) => { const c = new THREE.Color(hex); return labOfLinear([c.r, c.g, c.b]); }; // three stores linear

// three.js ACESFilmicToneMapping, then the sRGB curve: what a linear pixel looks like on screen, back in linear.
export function displayed([r, g, b], exposure = 1) {
  const k = exposure / 0.6; r *= k; g *= k; b *= k;
  const i = [0.59719 * r + 0.35458 * g + 0.04823 * b, 0.076 * r + 0.90834 * g + 0.01566 * b, 0.0284 * r + 0.13383 * g + 0.83777 * b];
  const f = (v) => (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.432951) + 0.238081);
  const [x, y, z] = i.map(f);
  const o = [1.60475 * x - 0.53108 * y - 0.07367 * z, -0.10208 * x + 1.10813 * y - 0.00605 * z, -0.00327 * x - 0.07276 * y + 1.07602 * z];
  return o.map((v) => Math.min(1, Math.max(0, v)));
}

// Render `scene` from `camera` small, then render again with every mesh black except `targets` (white), and average
// the displayed colour of the pixels the targets cover. Returns { lab, hex, pixels }.
export function measureObject(renderer, scene, camera, targets, { w = 480, h = 270 } = {}) {
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.FloatType });
  const beauty = new Float32Array(w * h * 4), mask = new Float32Array(w * h * 4);
  const prevTarget = renderer.getRenderTarget(), aspect = camera.aspect;
  renderer.setRenderTarget(rt); renderer.setClearColor('#000000', 1); renderer.clear(); renderer.render(scene, camera);
  renderer.readRenderTargetPixels(rt, 0, 0, w, h, beauty);
  const black = new THREE.MeshBasicMaterial({ color: '#000000' }), white = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const ids = new Set(); targets.forEach((t) => t.traverse((o) => ids.add(o.uuid)));
  const saved = [], bg = scene.background, fog = scene.fog; scene.background = null; scene.fog = null;
  scene.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine || o.isSprite) { saved.push([o, o.material]); o.material = ids.has(o.uuid) ? white : black; } });
  renderer.clear(); renderer.render(scene, camera); renderer.readRenderTargetPixels(rt, 0, 0, w, h, mask);
  saved.forEach(([o, m]) => { o.material = m; }); scene.background = bg; scene.fog = fog;
  renderer.setRenderTarget(prevTarget); rt.dispose(); camera.aspect = aspect;
  let n = 0; const acc = [0, 0, 0];
  for (let i = 0; i < w * h; i++) {
    if (mask[i * 4] < 0.5) continue;
    const d = displayed([beauty[i * 4], beauty[i * 4 + 1], beauty[i * 4 + 2]], renderer.toneMappingExposure).map(lin);
    const lab = labOfLinear(d); acc[0] += lab[0]; acc[1] += lab[1]; acc[2] += lab[2]; n++;
  }
  const lab = acc.map((v) => v / Math.max(1, n));
  return { lab, pixels: n };
}

export const SHARMA = [
  [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
  [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
  [[50, 2.8361, -74.02], [50, 0, -82.7485], 3.4412],
];
export { enc as srgbEncode };
