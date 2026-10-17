// The ingredients, built from code: strawberry (whole and halved), blueberry, banana slice, kiwi slice, granola
// cluster, oat flake, and an açaí scoop. One unit is about 8 cm (the bowl is 16 cm across). Geometry and materials are
// made once per kind and shared; each call returns a new mesh or group.
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng } from './timeline.js';

function canvasTex(size, draw) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

// Strawberry outline, tip (u = 0) to shoulder (u = 1), as [radius, height] pairs.
const BERRY = Array.from({ length: 24 }, (_, i) => {
  const u = i / 23;
  return new THREE.Vector2(0.001 + 0.13 * Math.pow(Math.sin(Math.PI * Math.min(u, 0.999) * 0.94), 0.75) * (0.62 + 0.45 * u), -0.17 + 0.32 * u);
});

const seedTex = () => canvasTex(512, (g, s) => {
  const lin = g.createLinearGradient(0, s, 0, 0);
  lin.addColorStop(0, '#b80f1c'); lin.addColorStop(0.7, '#d4151f'); lin.addColorStop(1, '#e8433a');
  g.fillStyle = lin; g.fillRect(0, 0, s, s);
  const r = rng(7);
  for (let y = 18; y < s - 30; y += 26) for (let x = (y / 26) % 2 ? 0 : 13; x < s; x += 26) {
    const px = x + (r() - 0.5) * 5, py = y + (r() - 0.5) * 5;
    g.fillStyle = '#7a0a12'; g.beginPath(); g.ellipse(px, py, 5, 7, 0, 0, 7); g.fill();
    g.fillStyle = '#f2d16b'; g.beginPath(); g.ellipse(px, py, 2.4, 3.6, 0, 0, 7); g.fill();
  }
});

const cutTex = () => canvasTex(256, (g, s) => {
  g.fillStyle = '#c4141e'; g.fillRect(0, 0, s, s);
  g.save(); g.translate(s / 2, s * 0.56); g.scale(1, 1.25);
  const rad = g.createRadialGradient(0, 0, 4, 0, 0, s * 0.42);
  rad.addColorStop(0, '#f0b8b0'); rad.addColorStop(0.15, '#e46a68'); rad.addColorStop(0.45, '#d4222c'); rad.addColorStop(1, '#a80c18');
  g.fillStyle = rad; g.beginPath(); g.arc(0, 0, s * 0.42, 0, 7); g.fill();
  g.restore();
});

let M = null;
function mats() {
  if (M) return M;
  const phys = (o) => new THREE.MeshPhysicalMaterial(o);
  M = {
    berry: phys({ map: seedTex(), roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
    cut: phys({ map: cutTex(), roughness: 0.4, clearcoat: 0.5, side: THREE.DoubleSide }),
    leaf: new THREE.MeshStandardMaterial({ color: '#3f8a2c', roughness: 0.6, side: THREE.DoubleSide }),
    blue: phys({ color: '#272c56', roughness: 0.55, sheen: 1, sheenColor: '#8d9bd6', sheenRoughness: 0.5 }),
    crown: new THREE.MeshStandardMaterial({ color: '#15162a', roughness: 0.8 }),
    bananaSide: new THREE.MeshStandardMaterial({ color: '#d4bc6c', roughness: 0.6 }),
    bananaFace: phys({ map: canvasTex(256, (g, s) => {
      g.fillStyle = '#dccb84'; g.fillRect(0, 0, s, s);
      const rad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      rad.addColorStop(0, '#cbb468'); rad.addColorStop(0.3, '#ddca86'); rad.addColorStop(0.92, '#d9c47c'); rad.addColorStop(1, '#c4a853');
      g.fillStyle = rad; g.fillRect(0, 0, s, s);
      g.fillStyle = '#8a6a3a'; for (let i = 0; i < 3; i++) { const a = (i / 3) * 6.283; g.beginPath(); g.arc(s / 2 + Math.cos(a) * 9, s / 2 + Math.sin(a) * 9, 2.5, 0, 7); g.fill(); }
    }), roughness: 0.45, clearcoat: 0.3 }),
    kiwiSide: new THREE.MeshStandardMaterial({ color: '#7b5a32', roughness: 0.95 }),
    kiwiFace: phys({ map: canvasTex(256, (g, s) => {
      const rad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      rad.addColorStop(0, '#f4f2d0'); rad.addColorStop(0.22, '#e8ecb0'); rad.addColorStop(0.3, '#8dc23a'); rad.addColorStop(0.9, '#6fae22'); rad.addColorStop(1, '#5a8f1c');
      g.fillStyle = rad; g.fillRect(0, 0, s, s);
      const r = rng(3); g.fillStyle = '#1b1408';
      for (let i = 0; i < 46; i++) { const a = (i / 46) * 6.283 + r() * 0.1, d = s * (0.17 + r() * 0.05); g.beginPath(); g.ellipse(s / 2 + Math.cos(a) * d, s / 2 + Math.sin(a) * d, 2.2, 4.5, a, 0, 7); g.fill(); }
    }), roughness: 0.3, clearcoat: 0.7 }),
    granola: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, flatShading: true }),
    oat: new THREE.MeshStandardMaterial({ color: '#d8c08c', roughness: 0.85 }),
    acai: phys({ color: '#4b1a3f', roughness: 0.38, clearcoat: 0.35, clearcoatRoughness: 0.4, sheen: 0.4, sheenColor: '#9b5a8a' }),
  };
  return M;
}

let G = null;
function geos() {
  if (G) return G;
  const half = new THREE.LatheGeometry(BERRY, 24, 0, Math.PI);
  const pts = BERRY.map((p) => [p.x, p.y]);
  const shape = new THREE.Shape([...pts.map(([r, y]) => new THREE.Vector2(r, y)), ...pts.slice().reverse().map(([r, y]) => new THREE.Vector2(-r, y))]);
  const face = new THREE.ShapeGeometry(shape, 12);
  const uv = face.attributes.uv, pos = face.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + 0.15) / 0.3, (pos.getY(i) + 0.17) / 0.32);
  face.rotateY(-Math.PI / 2);
  G = {
    berry: new THREE.LatheGeometry(BERRY, 28), half, face,
    leaf: new THREE.SphereGeometry(1, 8, 6).scale(0.075, 0.008, 0.028).translate(0.06, 0, 0),
    blue: new THREE.SphereGeometry(0.058, 20, 14).scale(1, 0.84, 1),
    crown: new THREE.TorusGeometry(0.016, 0.006, 6, 10).rotateX(Math.PI / 2),
    banana: new THREE.CylinderGeometry(0.13, 0.13, 0.05, 32),
    kiwi: new THREE.CylinderGeometry(0.14, 0.14, 0.045, 32),
    oat: new THREE.SphereGeometry(1, 10, 6).scale(0.05, 0.012, 0.035),
  };
  return G;
}

const disc = (geo, side, face) => new THREE.Mesh(geo, [side, face, face]);

export function strawberry(halved = false) {
  const m = mats(), g = geos(), o = new THREE.Group();
  o.add(new THREE.Mesh(halved ? g.half : g.berry, m.berry));
  if (halved) o.add(new THREE.Mesh(g.face, m.cut));
  const n = halved ? 3 : 6;
  for (let i = 0; i < n; i++) {
    const leaf = new THREE.Mesh(g.leaf, m.leaf);
    leaf.position.y = 0.15; leaf.rotation.set(0, halved ? ((i - 1) * Math.PI) / 3 : (i / 6) * Math.PI * 2 + 0.3, -0.35);
    o.add(leaf);
  }
  return o;
}

export function blueberry() {
  const m = mats(), g = geos(), o = new THREE.Group();
  o.add(new THREE.Mesh(g.blue, m.blue));
  const c = new THREE.Mesh(g.crown, m.crown); c.position.y = 0.048; o.add(c);
  return o;
}

export const banana = () => disc(geos().banana, mats().bananaSide, mats().bananaFace);
export const kiwi = () => disc(geos().kiwi, mats().kiwiSide, mats().kiwiFace);
export const oat = () => new THREE.Mesh(geos().oat, mats().oat);

// A granola cluster: a lumpy flat-shaded rock with toasted colour variation.
export function granola(seed, size = 0.07) {
  const r = rng(seed), geo = new THREE.IcosahedronGeometry(size, 1), p = geo.attributes.position, col = [];
  const base = new THREE.Color('#a8702f'), v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).multiplyScalar(0.7 + r() * 0.55); v.y *= 0.75; p.setXYZ(i, v.x, v.y, v.z);
    const c = base.clone().offsetHSL((r() - 0.5) * 0.03, 0, (r() - 0.5) * 0.18); col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mats().granola);
}

// An açaí scoop: a soft, lumpy sorbet ball.
export function acaiScoop(seed, size = 0.3) {
  const ico = new THREE.IcosahedronGeometry(size, 4); ico.deleteAttribute('normal'); ico.deleteAttribute('uv');
  const r = rng(seed), geo = mergeVertices(ico), p = geo.attributes.position, v = new THREE.Vector3();
  const k = [r() * 6, r() * 6, r() * 6];
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const bump = 1 + 0.08 * Math.sin(v.x * 5 + k[0]) * Math.sin(v.y * 4 + k[1]) + 0.05 * Math.sin(v.z * 7 + k[2]);
    v.multiplyScalar(size * bump); v.y *= 0.85; p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mats().acai);
}

export const acaiMaterial = () => mats().acai;
export const granolaColour = '#9a6a33';
export const MAKERS = { strawberry, blueberry, banana, kiwi, oat, granola, acaiScoop };
