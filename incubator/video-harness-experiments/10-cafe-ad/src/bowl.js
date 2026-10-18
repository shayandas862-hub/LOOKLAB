// The glass bowl on a wooden turntable, its three layers (açaí, granola, açaí) and the toppings in stripes on top,
// as a classic açaí bowl. Everything is a function of t: layers fill, pieces fall in and settle (S2).
import * as THREE from 'three';
import { acaiMaterial, acaiScoop, banana, blueberry, granola, kiwi, strawberry } from './food.js';
import { CUE, ease, rng, span } from './timeline.js';

export const RIM = 0.78;
export const rOut = (y) => 0.62 + 0.38 * Math.pow(Math.max(0, y) / RIM, 0.6);
export const rIn = (y) => rOut(y) - 0.035;
const FLOOR = 0.05;
export const LAYERS = [
  { kind: 'acai', y: [FLOOR, 0.3], cue: CUE.acai1 },
  { kind: 'granola', y: [0.3, 0.42], cue: CUE.granola },
  { kind: 'acai', y: [0.42, 0.62], cue: CUE.acai2 },
];
export const TOP = 0.62;
const mound = (x, z) => 0.07 * Math.max(0, 1 - (x * x + z * z) / (rIn(TOP) * rIn(TOP)));

function glass() {
  const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(0.58, 0), new THREE.Vector2(0.615, 0.015)];
  for (let i = 1; i <= 24; i++) { const y = 0.015 + ((RIM - 0.015) * i) / 24; pts.push(new THREE.Vector2(rOut(y), y)); }
  pts.push(new THREE.Vector2(rOut(RIM) - 0.017, RIM + 0.012));
  for (let i = 24; i >= 0; i--) { const y = FLOOR + ((RIM - FLOOR) * i) / 24; pts.push(new THREE.Vector2(rIn(y), y)); }
  pts.push(new THREE.Vector2(0, FLOOR));
  const m = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 1, thickness: 0.08, roughness: 0.03, ior: 1.5, specularIntensity: 1, envMapIntensity: 1.3 });
  return new THREE.Mesh(new THREE.LatheGeometry(pts, 96), m);
}

function granolaBandTex() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d'), r = rng(11);
  g.fillStyle = '#7d5326'; g.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 900; i++) {
    const l = 30 + r() * 35; g.fillStyle = `hsl(${28 + r() * 10}, ${45 + r() * 20}%, ${l}%)`;
    g.beginPath(); g.ellipse(r() * 512, r() * 128, 3 + r() * 9, 2 + r() * 6, r() * 3, 0, 7); g.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.repeat.set(3, 1);
  return t;
}

// One layer: a solid of revolution that fits the glass, revealed from the bottom up by a clipping plane, with a cap.
function layer({ kind, y: [y0, y1] }) {
  const pts = [new THREE.Vector2(0, y0)];
  for (let i = 0; i <= 12; i++) { const y = y0 + ((y1 - y0) * i) / 12; pts.push(new THREE.Vector2(rIn(y) - 0.004, y)); }
  pts.push(new THREE.Vector2(0, y1));
  const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), y0);
  const base = kind === 'acai' ? acaiMaterial() : new THREE.MeshStandardMaterial({ map: granolaBandTex(), roughness: 0.95 });
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), base.clone());
  body.material.clippingPlanes = [plane];
  const cap = new THREE.Mesh(new THREE.CircleGeometry(1, 64).rotateX(-Math.PI / 2), base);
  const o = new THREE.Group(); o.add(body, cap);
  o.userData = { plane, cap, y0, y1 };
  return o;
}
function setLevel(o, k) {
  const { plane, cap, y0, y1 } = o.userData, y = y0 + (y1 - y0) * k;
  plane.constant = y; o.visible = k > 0.001;
  cap.position.y = y; const s = rIn(y) - 0.004; cap.scale.set(s, 1, s);
}

// The toppings, in five stripes across the bowl (left to right as the S2 camera sees them).
// Each piece is labelled with its stripe's food (userData.food) for the per-ingredient masks; labels don't change the picture.
const STRIPES = ['banana', 'strawberry', 'granola-top', 'blueberry', 'kiwi'];
function toppings(r) {
  let food;
  const out = [], R = rIn(TOP) - 0.07, add = (obj, x, z, lift, rot) => {
    const y = TOP + mound(x, z) + lift;
    obj.userData.food = food;
    out.push({ obj, end: new THREE.Vector3(x, y, z), q: new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)) });
  };
  const stripes = [-0.66, -0.33, 0, 0.33, 0.62];
  stripes.forEach((x0, k) => {
    food = STRIPES[k];
    const zMax = Math.sqrt(Math.max(0, R * R - x0 * x0)) - 0.02;
    if (k === 0) for (let z = -zMax; z <= zMax; z += 0.13) add(banana(), x0 + (r() - 0.5) * 0.03, z, 0.05, [0.9, 0, (r() - 0.5) * 0.2]);
    if (k === 1) for (let z = -zMax, i = 0; z <= zMax; z += 0.16, i++) add(strawberry(true), x0 + (r() - 0.5) * 0.04, z, 0.07, [0.7, (i % 2 ? 0.3 : -0.3), -Math.PI / 2]);
    if (k === 2) for (let i = 0; i < 42; i++) { const z = (r() * 2 - 1) * zMax; add(granola(100 + i, 0.05 + r() * 0.03), x0 + (r() - 0.5) * 0.2, z, 0.03 + r() * 0.05, [r() * 6, r() * 6, r() * 6]); }
    if (k === 3) for (let z = -zMax; z <= zMax; z += 0.1) for (const dx of [-0.1, 0, 0.1]) {
      if (Math.hypot(x0 + dx, z) < R) add(blueberry(), x0 + dx + (r() - 0.5) * 0.03, z + (dx ? 0.05 : 0), 0.05 + r() * 0.03, [r() * 0.5, r() * 6, r() * 0.5]);
    }
    if (k === 4) for (let z = -zMax; z <= zMax; z += 0.15) add(kiwi(), x0 + (r() - 0.5) * 0.03, z, 0.05, [0.6, 0, (r() - 0.5) * 0.2]);
  });
  return out;
}

export function createBowl() {
  const r = rng(5), group = new THREE.Group();
  const g = glass(); g.renderOrder = 2; g.userData.glass = true; group.add(g);
  const FOOD = ['acai-low', 'granola-band', 'acai-high'];
  const layers = LAYERS.map((L, li) => { const o = layer(L); o.userData.food = FOOD[li]; group.add(o); return { ...L, o }; });

  // Açaí scoops drop into each açaí layer; granola clusters rain into the granola band.
  const drops = [];
  layers.forEach((L, li) => {
    if (L.kind === 'acai') for (let i = 0; i < 3; i++) {
      const s = acaiScoop(20 + li * 3 + i, 0.26); s.userData.food = FOOD[li]; group.add(s);
      const t0 = L.cue[0] + i * 0.28, a = i * 2.1 + li;
      drops.push({ obj: s, t0, end: new THREE.Vector3(Math.cos(a) * 0.3, L.y[0] + 0.15, Math.sin(a) * 0.3), melt: true, layer: L });
    } else for (let i = 0; i < 70; i++) {
      const s = granola(300 + i, 0.05 + r() * 0.035); s.userData.food = FOOD[li]; group.add(s);
      const y = L.y[0] + 0.04 + r() * (L.y[1] - L.y[0] - 0.06), a = r() * 6.283, d = i < 46 ? rIn(y) - 0.055 : r() * (rIn(y) - 0.1);
      drops.push({ obj: s, t0: L.cue[0] + r() * 0.75, end: new THREE.Vector3(Math.cos(a) * d, y, Math.sin(a) * d), spin: [r() * 6, r() * 6, r() * 6] });
    }
  });
  const tops = toppings(r);
  tops.forEach((p, i) => {
    group.add(p.obj);
    const order = (p.end.x + 0.8) / 1.6;
    p.t0 = CUE.tops[0] + order * 0.7 + r() * 0.25;
    p.from = new THREE.Quaternion().setFromEuler(new THREE.Euler(r() * 6, r() * 6, r() * 6));
    p.drift = new THREE.Vector3((r() - 0.5) * 0.6, 0, (r() - 0.5) * 0.6);
  });

  const FALL = 0.55, HIGH = 3.4;
  function update(t) {
    layers.forEach((L) => setLevel(L.o, ease(span(t, L.cue[0] + 0.3, L.cue[1]))));
    for (const d of drops) {
      const k = span(t, d.t0, d.t0 + FALL), o = d.obj;
      o.visible = t >= d.t0;
      if (d.melt) {
        // The scoop falls, lands, then sinks into the rising layer.
        const sink = span(t, d.t0 + FALL, d.t0 + FALL + 0.45);
        o.position.set(d.end.x, d.end.y + HIGH * (1 - k * k) - sink * 0.2, d.end.z);
        o.scale.setScalar(1 - sink); o.visible = o.visible && sink < 1;
      } else {
        o.position.set(d.end.x, d.end.y + HIGH * (1 - k * k), d.end.z);
        o.rotation.set(d.spin[0] + k * 2, d.spin[1], d.spin[2] + k * 1.5);
      }
    }
    for (const p of tops) {
      const k = span(t, p.t0, p.t0 + FALL), land = span(t, p.t0 + FALL, p.t0 + FALL + 0.25), o = p.obj;
      o.visible = t >= p.t0;
      const bounce = Math.sin(land * Math.PI) * 0.035 * (1 - land);
      o.position.copy(p.end).addScaledVector(p.drift, (1 - k) * (1 - k)); o.position.y += HIGH * (1 - k * k) + bounce;
      o.quaternion.slerpQuaternions(p.from, p.q, ease(k * 0.85 + land * 0.15));
    }
  }
  return { group, update, glass: g, tops };
}

function woodTex() {
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const g = c.getContext('2d'), r = rng(9);
  g.fillStyle = '#c9a477'; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 260; i++) {
    const y = r() * 1024, l = 52 + r() * 18;
    g.strokeStyle = `hsla(31, ${38 + r() * 15}%, ${l}%, ${0.25 + r() * 0.35})`; g.lineWidth = 1 + r() * 4;
    g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= 1024; x += 64) g.lineTo(x, y + Math.sin(x * 0.006 + i) * 6 + (r() - 0.5) * 2); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

// The turntable: a round light-wood slab (the café's counter is light wood), its top at y = 0.
export function createPlinth() {
  const top = new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.55 });
  const side = new THREE.MeshStandardMaterial({ color: '#b8915f', roughness: 0.6 });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.16, 128), [side, top, side]);
  m.position.y = -0.08; m.receiveShadow = true; m.castShadow = true;
  return m;
}
