// The diorama: a small town square that begins as grey clay. One shared shader uniform set
// drives a wave of colour outward from the film light, with a warm glow on its leading edge.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PAL, T, SPOT } from './timeline.js';
import { ease, prog, lerp, hash } from './util.js';

export const WAVE = {
  uWaveR: { value: -1 }, uWaveC: { value: new THREE.Vector2(SPOT.light[0], SPOT.light[1]) },
  uClay: { value: new THREE.Color(PAL.clay) }, uGlow: { value: new THREE.Color(1.0, 0.62, 0.3) },
};

// A standard material that is clay-grey until the wave passes it.
export function paint(color, { rough = 0.7, metal = 0, map = null, emissive = 0x000000 } = {}) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, map, emissive });
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, WAVE);
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWPos; uniform float uWaveR; uniform vec2 uWaveC; uniform vec3 uClay, uGlow;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        float wd = distance(vWPos.xz, uWaveC);
        float wsat = smoothstep(uWaveR + 0.05, uWaveR - 0.75, wd);
        diffuseColor.rgb = mix(uClay, diffuseColor.rgb, wsat);`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        totalEmissiveRadiance *= wsat;
        totalEmissiveRadiance += uGlow * 0.55 * exp(-pow((wd - uWaveR + 0.2) / 0.22, 2.0)) * step(0.0, uWaveR);`);
  };
  return m;
}

function canvasTex(w, h, draw, repeat = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat !== 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); }
  return t;
}

function mesh(geo, mat, x, y, z, parent, { cast = true, receive = true } = {}) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = receive; parent.add(m); return m;
}

export function createSet(scene) {
  const g = new THREE.Group(); scene.add(g);
  const box = (w, h, d, r = 0.03) => new RoundedBoxGeometry(w, h, d, 2, r);

  // Platform and cobbled plaza.
  const cobbles = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#9C8670'; c.fillRect(0, 0, w, h);
    for (let y = 0, row = 0; y < h; y += 32, row++) for (let x = (row % 2) * 24 - 24; x < w; x += 48) {
      const k = hash(x + 999, y), shade = 206 + Math.floor(k * 30);
      c.fillStyle = `rgb(${shade},${shade - 22},${shade - 46})`;
      c.beginPath(); c.roundRect(x + 2, y + 2, 44, 28, 9); c.fill();
    }
  }, 9);
  const plaza = mesh(new THREE.CircleGeometry(6.2, 96), paint('#ffffff', { map: cobbles, rough: 0.85 }), 0, 0, 0, g, { cast: false });
  plaza.rotation.x = -Math.PI / 2;
  mesh(new THREE.CylinderGeometry(6.2, 5.9, 0.7, 96), paint(PAL.navy, { rough: 0.5 }), 0, -0.352, 0, g, { cast: false });
  const curb = mesh(new THREE.TorusGeometry(6.17, 0.05, 8, 128), paint(PAL.stone, { rough: 0.6 }), 0, 0.0, 0, g, { cast: false });
  curb.rotation.x = Math.PI / 2;

  const windows = [];
  const glass = () => { const m = paint('#2A3352', { rough: 0.15, metal: 0.2, emissive: 0xffb36b }); m.emissiveIntensity = 0; windows.push(m); return m; };

  // Café Lumière.
  const cafe = new THREE.Group(); cafe.position.set(-2.2, 0, -2.6); g.add(cafe);
  mesh(box(2.4, 2.3, 1.6, 0.04), paint(PAL.peach), 0, 1.15, 0, cafe);
  mesh(box(2.52, 0.16, 1.72, 0.03), paint(PAL.cream), 0, 2.33, 0, cafe);
  mesh(box(2.46, 0.12, 1.66, 0.02), paint(PAL.cream), 0, 1.36, 0, cafe);
  mesh(box(0.56, 0.95, 0.12, 0.02), paint(PAL.navy, { rough: 0.9 }), 0.5, 0.475, 0.76, cafe);
  mesh(box(0.66, 0.06, 0.1, 0.01), paint(PAL.cream), 0.5, 0.98, 0.8, cafe);
  mesh(box(1.05, 0.68, 0.06, 0.02), glass(), -0.45, 0.72, 0.8, cafe);
  for (const x of [-0.75, 0, 0.75]) mesh(box(0.38, 0.48, 0.05, 0.015), glass(), x, 1.82, 0.8, cafe);
  const stripes = canvasTex(256, 64, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#F6EDE0' : PAL.tomato; c.fillRect(i * 16, 0, 16, h); } });
  const awning = mesh(box(2.3, 0.04, 0.62, 0.01), paint('#ffffff', { map: stripes, rough: 0.8 }), 0, 1.25, 1.08, cafe);
  awning.rotation.x = 0.42;
  const valance = mesh(box(2.3, 0.14, 0.02, 0.005), paint('#ffffff', { map: stripes, rough: 0.8 }), 0, 1.06, 1.36, cafe);
  valance.castShadow = false;
  const sign = canvasTex(1024, 256, (c, w, h) => {
    c.fillStyle = PAL.teal; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#F3E9DA'; c.lineWidth = 6; c.strokeRect(14, 14, w - 28, h - 28);
    c.fillStyle = '#F3E9DA'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = 'italic 300 132px Fraunces'; c.fillText('Lumière', w / 2, h / 2 - 8);
    c.font = '600 26px "Schibsted Grotesk"'; c.letterSpacing = '8px'; c.fillText('CAFÉ  ·  EST. 2026', w / 2, h - 46);
  });
  mesh(box(1.3, 0.32, 0.05, 0.01), paint('#ffffff', { map: sign, rough: 0.6 }), 0, 1.6, 0.84, cafe);
  for (const x of [-1.0, 1.05]) {
    mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.24, 20), paint(PAL.marigold), x, 0.12, 1.0, cafe);
    mesh(new THREE.IcosahedronGeometry(0.17, 1), paint(PAL.leaf, { rough: 0.9 }), x, 0.34, 1.0, cafe);
  }

  // Tall teal building with a water tower.
  const tall = new THREE.Group(); tall.position.set(2.3, 0, -2.7); g.add(tall);
  mesh(box(1.7, 3.4, 1.5, 0.04), paint(PAL.teal), 0, 1.7, 0, tall);
  mesh(box(1.82, 0.14, 1.62, 0.03), paint(PAL.cream), 0, 3.42, 0, tall);
  for (let r = 0; r < 4; r++) for (const x of [-0.45, 0.05, 0.55]) mesh(box(0.3, 0.42, 0.05, 0.015), glass(), x - 0.05, 0.75 + r * 0.72, 0.76, tall);
  mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.42, 24), paint(PAL.tomato), 0.3, 3.75, -0.2, tall);
  mesh(new THREE.ConeGeometry(0.32, 0.22, 24), paint(PAL.navy), 0.3, 4.07, -0.2, tall);
  for (const [dx, dz] of [[0.12, -0.08], [0.48, -0.08], [0.12, -0.32], [0.48, -0.32]]) mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 6), paint(PAL.navy), dx, 3.55, dz, tall);

  // Kiosk.
  const kiosk = new THREE.Group(); kiosk.position.set(3.55, 0, -0.35); g.add(kiosk);
  mesh(box(0.92, 1.2, 0.82, 0.03), paint(PAL.marigold), 0, 0.6, 0, kiosk);
  mesh(box(1.12, 0.08, 1.02, 0.02), paint(PAL.navy), 0, 1.26, 0, kiosk);
  mesh(box(0.6, 0.36, 0.05, 0.01), glass(), 0, 0.82, 0.42, kiosk);

  // Trees, lamp post, bench.
  const tree = (x, z, s) => {
    mesh(new THREE.CylinderGeometry(0.06 * s, 0.09 * s, 0.9 * s, 10), paint('#8B5E3C', { rough: 0.9 }), x, 0.45 * s, z, g);
    [[0, 1.05, 0, 0.42], [0.22, 1.3, 0.05, 0.32], [-0.18, 1.38, -0.05, 0.3]].forEach(([dx, dy, dz, r]) => {
      const f = mesh(new THREE.IcosahedronGeometry(r * s, 1), paint(PAL.leaf, { rough: 0.85 }), x + dx * s, dy * s, z + dz * s, g);
      f.material.flatShading = true;
    });
  };
  tree(3.2, 2.2, 1.0); tree(-4.3, -0.9, 0.85); tree(4.4, -2.0, 0.75);
  const lampPos = [-3.15, 0.85];
  mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.9, 10), paint(PAL.navy, { rough: 0.4 }), lampPos[0], 0.95, lampPos[1], g);
  const lampGlobe = mesh(new THREE.SphereGeometry(0.11, 20, 14), paint('#FFF3DF', { rough: 0.3, emissive: 0xffc27a }), lampPos[0], 1.95, lampPos[1], g, { cast: false });
  lampGlobe.material.emissiveIntensity = 0; windows.push(lampGlobe.material);
  const bench = new THREE.Group(); bench.position.set(1.7, 0, 3.4); bench.rotation.y = -0.3; g.add(bench);
  mesh(box(0.9, 0.06, 0.3, 0.015), paint(PAL.tomato), 0, 0.3, 0, bench);
  mesh(box(0.9, 0.22, 0.05, 0.015), paint(PAL.tomato), 0, 0.46, -0.13, bench);
  for (const x of [-0.38, 0.38]) mesh(box(0.05, 0.3, 0.28, 0.01), paint(PAL.navy), x, 0.15, 0, bench);

  // Tape mark.
  const tape = paint(PAL.marigold, { rough: 0.6 });
  mesh(new THREE.BoxGeometry(0.34, 0.006, 0.05), tape, SPOT.mark[0], 0.004, SPOT.mark[1] + 0.12, g, { cast: false });
  mesh(new THREE.BoxGeometry(0.05, 0.006, 0.24), tape, SPOT.mark[0], 0.004, SPOT.mark[1], g, { cast: false });

  // String lights between the buildings and down to the kiosk.
  const bulbs = [];
  const strand = (a, b, n, sag) => {
    const pts = [];
    for (let i = 0; i <= 40; i++) { const f = i / 40; pts.push(new THREE.Vector3(lerp(a[0], b[0], f), lerp(a[1], b[1], f) - sag * 4 * f * (1 - f), lerp(a[2], b[2], f))); }
    const curve = new THREE.CatmullRomCurve3(pts);
    mesh(new THREE.TubeGeometry(curve, 60, 0.006, 4), new THREE.MeshStandardMaterial({ color: '#222' }), 0, 0, 0, g, { cast: false, receive: false });
    for (let i = 1; i < n; i++) {
      const p = curve.getPoint(i / n), m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshBasicMaterial({ color: '#555' }));
      m.position.copy(p).y -= 0.03; g.add(m); bulbs.push(m);
    }
  };
  strand([-1.02, 2.25, -1.85], [1.42, 2.95, -1.98], 13, 0.45);
  strand([3.12, 2.6, -1.98], [3.5, 1.32, -0.0], 6, 0.2);
  strand([-1.02, 2.0, -1.85], [-3.15, 1.85, 0.85], 9, 0.35);
  strand([-1.0, 1.62, -1.83], [1.43, 1.78, -1.96], 12, 0.28);

  const warm = new THREE.Color(PAL.warmLight), off = new THREE.Color('#5a5650');
  return function update(t) {
    WAVE.uWaveR.value = t < T.wave[0] ? -1 : ease.outCubic(prog(t, T.wave[0], T.wave[1])) * 10.5;
    const night = prog(t, T.windows, T.windows + 0.5);
    windows.forEach((m, i) => { m.emissiveIntensity = i === windows.length - 1 ? 3.2 * prog(t, T.lamp, T.lamp + 0.12) : night * (0.9 + 0.5 * hash(i, 7)); });
    bulbs.forEach((b, i) => {
      const tb = T.strings[0] + (i / bulbs.length) * (T.strings[1] - T.strings[0]) * 1.6;
      const on = prog(t, tb, tb + 0.06), pop = Math.exp(-Math.max(0, t - tb) / 0.12) * (t > tb ? 1 : 0);
      b.material.color.copy(off).lerp(warm, on).multiplyScalar(1 + on * (2.6 + 2.5 * pop));
      b.scale.setScalar(1 + 0.6 * pop);
    });
  };
}
