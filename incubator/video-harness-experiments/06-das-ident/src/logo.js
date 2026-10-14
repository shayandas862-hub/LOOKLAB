// The Das Production logo in 3D, built from the measurements in timeline.js: four lacquered leaf petals, the
// hand-drawn D as a gold marker stroke on the red petal, and the words extruded from Gelasio Bold (SIL OFL 1.1).
import * as THREE from 'three';
import opentype from '../node_modules/opentype.js/dist/opentype.module.js';
import { BRAND, PETALS, D_STROKES, D_RADIUS, WORDS, toWorld } from './timeline.js';

const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);

// A glint band that sweeps across every logo surface, and a heat glow for the D as it's drawn.
export const GLINT = { uGlint: { value: -100 }, uGlintAmt: { value: 0 } };
function withGlint(mat) {
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, GLINT);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform float uGlint, uGlintAmt;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { float g = (vWP.x * 0.92 + vWP.y * 0.38 - uGlint) / 0.42; totalEmissiveRadiance += vec3(1.0, 0.9, 0.76) * uGlintAmt * exp(-g * g); }`);
  };
  return mat;
}

// A leaf: a box with one pair of opposite corners sharp (barely rounded) and the other pair fully rounded.
function leafShape(w, h, sharp) {
  const rx = 0.42 * w, ry = 0.47 * h, s = 0.035, k = 0.58;
  const round = sharp === 'tlbr' ? { bl: 1, br: 0, tr: 1, tl: 0 } : { bl: 0, br: 1, tr: 0, tl: 1 };
  const r = (c) => (round[c] ? [rx, ry] : [s, s]);
  const [x0, y0, x1, y1] = [-w / 2, -h / 2, w / 2, h / 2];
  const sh = new THREE.Shape();
  let [ax, ay] = r('bl'); sh.moveTo(x0 + ax, y0);
  let [cx, cy] = r('br'); sh.lineTo(x1 - cx, y0); sh.bezierCurveTo(x1 - cx + k * cx, y0, x1, y0 + cy - k * cy, x1, y0 + cy);
  [cx, cy] = r('tr'); sh.lineTo(x1, y1 - cy); sh.bezierCurveTo(x1, y1 - cy + k * cy, x1 - cx + k * cx, y1, x1 - cx, y1);
  [cx, cy] = r('tl'); sh.lineTo(x0 + cx, y1); sh.bezierCurveTo(x0 + cx - k * cx, y1, x0, y1 - cy + k * cy, x0, y1 - cy);
  [cx, cy] = r('bl'); sh.lineTo(x0, y0 + cy); sh.bezierCurveTo(x0, y0 + cy - k * cy, x0 + cx - k * cx, y0, x0 + cx, y0);
  return sh;
}

// Colour across a petal, like the flat logo: the green lightens to the top-left, the amber runs orange to yellow.
const GRADS = {
  red: [BRAND.red, '#A3261D', [-0.6, 1]], green: [BRAND.green, BRAND.greenHi, [-1, 1]],
  amber: [BRAND.amberB, BRAND.amberA, [-1, 1]], cyan: ['#55C4E2', '#78DAF0', [-0.4, 1]],
};
function petal(p) {
  const [x0, y0, x1, y1] = p.box, w = (x1 - x0) / 100, h = (y1 - y0) / 100, depth = 0.26;
  const geo = new THREE.ExtrudeGeometry(leafShape(w, h, p.sharp), { depth, bevelEnabled: true, bevelThickness: 0.055, bevelSize: 0.045, bevelSegments: 8, curveSegments: 40 });
  geo.translate(0, 0, -depth / 2);
  const [ca, cb, dir] = GRADS[p.id], A = new THREE.Color(ca), B = new THREE.Color(cb), pos = geo.attributes.position, col = [];
  const n = Math.hypot(dir[0], dir[1]), reach = (Math.abs(dir[0]) * w + Math.abs(dir[1]) * h) / (2 * n);
  for (let i = 0; i < pos.count; i++) {
    const t = THREE.MathUtils.smoothstep((pos.getX(i) * dir[0] + pos.getY(i) * dir[1]) / n / reach, -0.9, 1.0);
    const c = A.clone().lerp(B, p.id === 'green' ? t * t : t); col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const mat = withGlint(new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.0 }));
  const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = mesh.receiveShadow = true;
  const g = new THREE.Group(); g.add(mesh);
  const [cx, cy] = toWorld((x0 + x1) / 2, (y0 + y1) / 2);
  return { id: p.id, group: g, mesh, home: V(cx, cy, 0), size: [w, h], lock: p.lock, depth };
}

// The D: two tubes drawn along their strokes, rounded ends, knobs at the stem's two ends like the marker original.
function letterD(red) {
  const front = red.depth / 2 + 0.055 + D_RADIUS * 0.55, home = red.home;
  const mat = withGlint(new THREE.MeshPhysicalMaterial({ color: BRAND.d, metalness: 0.1, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.08, envMapIntensity: 1.8, emissive: new THREE.Color('#FF8A2A'), emissiveIntensity: 0 }));
  const strokes = D_STROKES.map((pts) => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => { const [wx, wy] = toWorld(x, y); return V(wx - home.x, wy - home.y, front); }), false, 'centripetal');
    const segs = 220, radial = 18, geo = new THREE.TubeGeometry(curve, segs, D_RADIUS, radial, false);
    const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; red.group.add(mesh);
    const cap = (r) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat); m.castShadow = true; red.group.add(m); return m; };
    const a = cap(D_RADIUS), b = cap(D_RADIUS); a.position.copy(curve.getPointAt(0)); b.position.copy(curve.getPointAt(1));
    return { curve, mesh, a, b, per: radial * 6, segs, reveal(p) {
      mesh.geometry.setDrawRange(0, Math.round(p * segs) * this.per); mesh.visible = p > 0; a.visible = p > 0; b.visible = p > 0;
      b.position.copy(curve.getPointAt(Math.max(1e-4, p)));
    } };
  });
  // The knobs: the stem's ends swell a little, as the marker paused there.
  const knob = (x, y, r) => { const [wx, wy] = toWorld(x, y), m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat); m.position.set(wx - home.x, wy - home.y, front); m.castShadow = true; red.group.add(m); return m; };
  const knobs = [knob(113.5, 82.5, D_RADIUS * 1.28), knob(116.5, 224.5, D_RADIUS * 1.22)];
  return { mat, strokes, knobs };
}

// The words: one mesh per letter (TrueType outlines run clockwise, so toShapes(false) keeps counters as holes), so letters can arrive one by one; each letter's pivot is its own baseline centre.
async function words() {
  const font = opentype.parse(await (await fetch('node_modules/@fontsource/gelasio/files/gelasio-latin-700-normal.woff')).arrayBuffer());
  const xh = font.tables.os2.sxHeight / font.unitsPerEm;
  const front = withGlint(new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.12 }));
  const side = withGlint(new THREE.MeshPhysicalMaterial({ color: '#D9CDB6', metalness: 1, roughness: 0.2 }));
  return WORDS.map((wd) => {
    const size = wd.xHeight / 100 / xh, [left, base] = toWorld(wd.left, wd.baseline), depth = size * 0.14;
    const glyphs = font.stringToGlyphs(wd.text), first = glyphs[0].getBoundingBox().x1 / font.unitsPerEm * size;
    let pen = left - first; const letters = [];
    glyphs.forEach((g, i) => {
      const path = g.getPath(0, 0, size), sp = new THREE.ShapePath();
      for (const c of path.commands) {
        if (c.type === 'M') sp.moveTo(c.x, -c.y); else if (c.type === 'L') sp.lineTo(c.x, -c.y);
        else if (c.type === 'Q') sp.quadraticCurveTo(c.x1, -c.y1, c.x, -c.y); else if (c.type === 'C') sp.bezierCurveTo(c.x1, -c.y1, c.x2, -c.y2, c.x, -c.y);
      }
      const geo = new THREE.ExtrudeGeometry(sp.toShapes(false), { depth, bevelEnabled: true, bevelThickness: depth * 0.18, bevelSize: size * 0.008, bevelSegments: 4, curveSegments: 14 });
      const bb = g.getBoundingBox(), cx = ((bb.x1 + bb.x2) / 2 / font.unitsPerEm) * size;
      geo.translate(-cx, 0, -depth / 2);
      const mesh = new THREE.Mesh(geo, [front, side]); mesh.castShadow = true;
      const grp = new THREE.Group(); grp.add(mesh); grp.position.set(pen + cx, base, 0);
      letters.push({ group: grp, home: grp.position.clone(), i });
      pen += (g.advanceWidth / font.unitsPerEm) * size + (i < glyphs.length - 1 ? (font.getKerningValue(g, glyphs[i + 1]) / font.unitsPerEm) * size : 0);
    });
    return { text: wd.text, letters, size };
  });
}

export async function buildLogo() {
  const root = new THREE.Group();
  const petals = PETALS.map(petal); petals.forEach((p) => { p.group.position.copy(p.home); root.add(p.group); });
  const red = petals.find((p) => p.id === 'red'), D = letterD(red);
  const W = await words(); W.forEach((w) => w.letters.forEach((l) => root.add(l.group)));
  return { root, petals, red, D, words: W };
}
