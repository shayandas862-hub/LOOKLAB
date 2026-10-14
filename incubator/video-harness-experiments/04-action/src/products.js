// The invented products: a sneaker built from its sole up (and able to burst into its layers), a faceted glass
// perfume bottle, and the jacket fabric. No real brand, logo or design is copied.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvasTex } from './worldkit.js';
import { hash, clamp } from './util.js';

const PI = Math.PI;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const table = (pts, u) => { for (let i = 1; i < pts.length; i++) if (u <= pts[i][0]) { const [u0, v0] = pts[i - 1], [u1, v1] = pts[i]; return v0 + (v1 - v0) * smooth(u0, u1, u); } return pts[pts.length - 1][1]; };

// Footprint half-width along the length (u: 0 heel → 1 toe), and the midsole's height.
const halfW = (u) => table([[0, 0.041], [0.15, 0.043], [0.42, 0.036], [0.7, 0.052], [0.88, 0.048], [1, 0.04]], u) * Math.pow(Math.sin(PI * clamp(u, 0.0005, 0.9995)), 0.28);
const midH = (z) => 0.022 + 0.016 * smooth(0.05, -0.13, z);
const LEN = 0.3, zOf = (u) => -LEN / 2 + LEN * u;

function footprint(scale = 1) {
  const s = new THREE.Shape(), N = 64;
  for (let i = 0; i <= N; i++) { const u = i / N; const p = [halfW(u) * scale, -zOf(u) * (0.98 + 0.02 * scale)]; i ? s.lineTo(...p) : s.moveTo(...p); }
  for (let i = N; i >= 0; i--) { const u = i / N; s.lineTo(-halfW(u) * scale, -zOf(u) * (0.98 + 0.02 * scale)); }
  return s;
}
function slab(scale, depth, mat, heelLift = 0) {
  const g = new THREE.ExtrudeGeometry(footprint(scale), { depth, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2, curveSegments: 4 });
  g.rotateX(-PI / 2);
  if (heelLift) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > depth * 0.5) p.setY(i, midH(p.getZ(i))); g.computeVertexNormals(); }
  const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
}

const knit = canvasTex(256, 256, (c, w, h) => {
  c.fillStyle = '#808080'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) { const v = (120 + 100 * hash(x * 3 + y, 1)) | 0; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(x + ((y / 4) % 2) * 2, y, 3, 3); }
}, { repeat: [8, 3], srgb: false });

// The upper: a loft over the footprint, an arch in every cross-section.
const upperH = (u) => table([[0, 0.05], [0.12, 0.075], [0.24, 0.07], [0.38, 0.086], [0.6, 0.068], [0.85, 0.044], [1, 0.026]], u) * Math.pow(Math.sin(PI * clamp(u, 0.0005, 0.9995)), 0.18);
function surf(u, a, out = 0) {
  const z = zOf(u), w = halfW(u) * 0.985, base = midH(z) - 0.002, s = Math.pow(Math.sin(a), 0.72);
  const n = new THREE.Vector3(Math.cos(a), Math.sin(a) * 0.6, 0).normalize();
  return new THREE.Vector3(w * Math.cos(a), base + upperH(u) * s, z).addScaledVector(n, out);
}
function upperGeo() {
  const NU = 72, NA = 36, pos = [], uv = [], idx = [];
  for (let i = 0; i <= NU; i++) for (let j = 0; j <= NA; j++) { const p = surf(i / NU, (j / NA) * PI); pos.push(p.x, p.y, p.z); uv.push(i / NU, j / NA); }
  for (let i = 0; i < NU; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

export const COLOURWAYS = [
  { upper: '#EDEAE4', accent: '#FF6A1A', mid: '#FFFFFF', sole: '#1A1A1D' },
  { upper: '#17181C', accent: '#FF6A1A', mid: '#ECE9E3', sole: '#0E0E10' },
  { upper: '#FF6A1A', accent: '#FFFFFF', mid: '#FFFFFF', sole: '#1A1A1D' },
  { upper: '#B9C0CA', accent: '#2FD3FF', mid: '#17181C', sole: '#0E0E10' },
];

// Returns { group, layers: { name: Object3D }, paint(colourway), explode(k) }. Origin: centre of the sole's bottom.
export function sneaker() {
  const M = {
    upper: new THREE.MeshPhysicalMaterial({ color: '#EDEAE4', roughness: 0.75, sheen: 1, sheenRoughness: 0.6, sheenColor: new THREE.Color('#ffffff'), bumpMap: knit, bumpScale: 0.6 }),
    accent: new THREE.MeshPhysicalMaterial({ color: '#FF6A1A', roughness: 0.35, clearcoat: 0.6 }),
    mid: new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.55 }),
    sole: new THREE.MeshStandardMaterial({ color: '#1A1A1D', roughness: 0.8 }),
    dark: new THREE.MeshStandardMaterial({ color: '#0D0D0F', roughness: 0.9 }),
    lace: new THREE.MeshStandardMaterial({ color: '#F4F2EE', roughness: 0.6 }),
  };
  const group = new THREE.Group(), layer = (name) => { const g = new THREE.Group(); g.name = name; group.add(g); return g; };
  const L = { sole: layer('sole'), mid: layer('mid'), stripe: layer('stripe'), upper: layer('upper'), collar: layer('collar'), tongue: layer('tongue'), laces: layer('laces'), side: layer('side') };
  L.sole.add(slab(1.0, 0.008, M.sole));
  const mid = slab(1.0, 0.03, M.mid, true); mid.position.y = 0.008; L.mid.add(mid);
  const stripe = slab(1.015, 0.004, M.accent); stripe.position.y = 0.017; L.stripe.add(stripe);
  const up = new THREE.Mesh(upperGeo(), M.upper); up.position.y = 0.008; up.castShadow = true; L.upper.add(up);
  // The foot opening and its padded collar.
  const open = new THREE.Mesh(new THREE.CircleGeometry(1, 40), M.dark); open.scale.set(0.034, 0.062, 1);
  open.rotation.x = -PI / 2 + 0.12; open.position.set(0, 0.008 + midH(-0.09) + upperH(0.2) + 0.001, -0.09); L.collar.add(open);
  const pad = new THREE.Mesh(new THREE.TorusGeometry(1, 0.22, 10, 48), M.upper); pad.scale.set(0.036, 0.064, 0.05); pad.rotation.x = -PI / 2 + 0.12; pad.position.copy(open.position); pad.position.y += 0.002; L.collar.add(pad);
  const tab = new THREE.Mesh(new RoundedBoxGeometry(0.026, 0.03, 0.012, 2, 0.004), M.accent); tab.position.set(0, 0.105, -0.152); tab.rotation.x = 0.25; L.collar.add(tab);
  const tongue = new THREE.Mesh(new RoundedBoxGeometry(0.044, 0.008, 0.075, 3, 0.004), M.upper); tongue.position.set(0, 0.11, -0.035); tongue.rotation.x = 0.55; L.tongue.add(tongue);
  for (let k = 0; k < 5; k++) {
    const u = 0.4 + k * 0.05, p = surf(u, PI / 2), w = halfW(u) * 0.62;
    const lc = new THREE.Mesh(new THREE.CapsuleGeometry(0.0028, w * 2, 4, 8), M.lace); lc.rotation.z = PI / 2; lc.position.set(0, p.y + 0.012, p.z); L.laces.add(lc);
  }
  for (const sgn of [1, -1]) {
    const pts = [[0.18, 0.5], [0.42, 0.24], [0.52, 0.42], [0.82, 0.16]].map(([u, a]) => surf(u, sgn > 0 ? a : PI - a, 0.0025).add(new THREE.Vector3(0, 0.008, 0)));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1), 60, 0.0042, 8), M.accent); tube.castShadow = true; L.side.add(tube);
  }
  // Where each layer goes when the shoe bursts apart.
  const OUT = { sole: [0, -0.09, 0], mid: [0, -0.05, 0], stripe: [0, -0.02, 0.0], upper: [0, 0.02, 0], collar: [0, 0.08, -0.03], tongue: [0, 0.12, 0.02], laces: [0, 0.16, 0.02], side: [0, 0.03, 0] };
  const SPREAD = { side: 0.035 };
  return {
    group, layers: L, materials: M,
    paint(c) { M.upper.color.set(c.upper); M.accent.color.set(c.accent); M.mid.color.set(c.mid); M.sole.color.set(c.sole); },
    explode(k) {
      for (const [name, g] of Object.entries(L)) { const o = OUT[name]; g.position.set(o[0] * k, o[1] * k, o[2] * k); g.rotation.x = (name === 'tongue' ? 0.2 : 0) * k; }
      L.side.children.forEach((c, i) => { c.position.x = (i ? -1 : 1) * SPREAD.side * k; });
    },
  };
}

// A faceted glass bottle with amber perfume, a chrome neck and a heavy chrome cap.
export function perfume() {
  const group = new THREE.Group();
  const glass = new THREE.MeshPhysicalMaterial({ color: '#F4EBE0', roughness: 0.03, transmission: 1, thickness: 0.018, ior: 1.5, attenuationColor: new THREE.Color('#F2C79A'), attenuationDistance: 0.4, clearcoat: 1, specularIntensity: 1 });
  const liquid = new THREE.MeshPhysicalMaterial({ color: '#D9792A', roughness: 0.05, transmission: 0.92, thickness: 0.03, ior: 1.36, attenuationColor: new THREE.Color('#C46A1E'), attenuationDistance: 0.05 });
  const chrome = new THREE.MeshPhysicalMaterial({ color: '#E9C98E', roughness: 0.12, metalness: 1 });
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.072, 0.1, 0.036, 4, 0.008), glass); body.position.y = 0.05; body.castShadow = true; group.add(body);
  const fill = new THREE.Mesh(new RoundedBoxGeometry(0.058, 0.07, 0.024, 4, 0.006), liquid); fill.position.y = 0.043; group.add(fill);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.014, 32), chrome); neck.position.y = 0.106; group.add(neck);
  const cap = new THREE.Group(); group.add(cap);
  const capBody = new THREE.Mesh(new RoundedBoxGeometry(0.036, 0.04, 0.036, 4, 0.004), chrome); capBody.position.y = 0.134; capBody.castShadow = true; cap.add(capBody);
  const capLine = new THREE.Mesh(new THREE.BoxGeometry(0.0365, 0.002, 0.0365), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.4, 0.5, 0.14) })); capLine.position.y = 0.118; cap.add(capLine);
  return { group, cap, body, neck };
}

export const JACKETS = ['#FF6A1A', '#1E1F24', '#E8E2D6', '#2E66FF', '#C21E3A', '#3D7D58', '#F2C94C', '#8C5AD6'];
export function jacketMat(c = JACKETS[0]) {
  return new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.5, sheen: 0.8, sheenRoughness: 0.5, sheenColor: new THREE.Color('#ffffff'), clearcoat: 0.25, clearcoatRoughness: 0.4 });
}
