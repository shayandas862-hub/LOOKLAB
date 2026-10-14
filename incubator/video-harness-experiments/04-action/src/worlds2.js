// Film worlds 5–8: a moon under a ringed planet, an ink comic, a chrome studio, a world of type and data.
import * as THREE from 'three';
import { canvasTex, scrolling, many, sunLight, stars, wrap } from './worldkit.js';
import { gridFloor } from './props.js';
import { hash } from './util.js';

const PI = Math.PI;

export function moon() {
  const g = new THREE.Group();
  g.add(stars(2600, 300, 1.7));
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), new THREE.MeshStandardMaterial({ color: '#7A7C82', roughness: 1 }));
  ground.rotation.x = -PI / 2; ground.receiveShadow = true; g.add(ground);
  const rimGeo = new THREE.TorusGeometry(1, 0.16, 6, 28); rimGeo.rotateX(PI / 2); rimGeo.scale(1, 0.35, 1);
  const craters = scrolling(rimGeo, new THREE.MeshStandardMaterial({ color: '#8E9096', roughness: 1 }),
    many(60, 51, (r) => { const s = 0.5 + 3 * r(1) ** 2; return { x: r(2) * 80, y: 0, z: r(3) < 0.85 ? -2 - 30 * r(4) : 1.5 + 2 * r(4), sx: s, sy: s, sz: s }; }), 80, { shadow: true });
  const pits = scrolling(new THREE.CircleGeometry(1, 24).rotateX(-PI / 2), new THREE.MeshStandardMaterial({ color: '#45474C', roughness: 1 }),
    craters.mesh ? many(60, 51, (r) => { const s = 0.5 + 3 * r(1) ** 2; return { x: r(2) * 80, y: 0.01, z: r(3) < 0.85 ? -2 - 30 * r(4) : 1.5 + 2 * r(4), sx: s * 0.9, sy: 1, sz: s * 0.9 }; }) : [], 80);
  const rocks = scrolling(new THREE.DodecahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: '#6A6C72', roughness: 1, flatShading: true }),
    many(50, 52, (r) => { const s = 0.08 + 0.4 * r(1) ** 2; return { x: r(2) * 80, y: s * 0.3, z: r(3) * 24 - 18, sx: s, sy: s * 0.7, sz: s, ry: r(4) * 6 }; }), 80, { shadow: true });
  g.add(craters.mesh, pits.mesh, rocks.mesh);
  const bands = canvasTex(512, 256, (c, w, h) => {
    const cols = ['#E9C9A0', '#C9734A', '#F2E6CF', '#5A8C8C', '#D7A26E', '#8E4B33', '#EFD9B5'];
    for (let y = 0; y < h; y++) { const k = Math.floor((Math.sin(y * 0.09) + Math.sin(y * 0.031 + 1) + 2) * 1.7) % cols.length; c.fillStyle = cols[k]; c.fillRect(0, y, w, 1); }
    c.globalAlpha = 0.15; for (let i = 0; i < 400; i++) { c.fillStyle = hash(i, 53) > 0.5 ? '#fff' : '#000'; c.fillRect(hash(i, 54) * w, hash(i, 55) * h, 40 * hash(i, 56), 1); }
  });
  const planet = new THREE.Mesh(new THREE.SphereGeometry(48, 64, 32), new THREE.MeshStandardMaterial({ map: bands, roughness: 1 }));
  planet.position.set(-55, 42, -230); planet.rotation.z = 0.35; g.add(planet);
  const ringTex = canvasTex(512, 8, (c, w) => { for (let x = 0; x < w; x++) { const a = 0.25 + 0.55 * Math.abs(Math.sin(x * 0.07)) * (x > 60 && x < 470 ? 1 : 0); c.fillStyle = `rgba(235,215,185,${a})`; c.fillRect(x, 0, 1, 8); } });
  const ringGeo = new THREE.RingGeometry(62, 104, 128, 1); const uv = ringGeo.attributes.uv, rp = ringGeo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (Math.hypot(rp.getX(i), rp.getY(i)) - 62) / 42, 0.5);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ map: ringTex, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: false }));
  ring.position.copy(planet.position); ring.rotation.set(PI / 2 - 0.28, 0.2, 0.35); g.add(ring);
  const sun = sunLight('#FFFFFF', 4.2, [7, 4.5, 3]); g.add(sun, sun.target);
  g.add(new THREE.HemisphereLight('#334', '#000', 0.12));
  return {
    group: g, style: 'solid',
    setup(scene) { scene.background = new THREE.Color('#000000'); scene.fog = null; scene.environmentIntensity = 0.25; },
    update(t, travel) { craters.update(travel); pits.update(travel); rocks.update(travel); },
    look: { contrast: 1.16, sat: 0.96, bloom: 0.45 },
  };
}

export function inkComic() {
  const g = new THREE.Group();
  const grad = new THREE.DataTexture(new Uint8Array([60, 60, 60, 255, 170, 170, 170, 255, 255, 255, 255, 255]), 3, 1); grad.needsUpdate = true;
  grad.minFilter = grad.magFilter = THREE.NearestFilter;
  const toon = (c) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad });
  const ink = new THREE.MeshBasicMaterial({ color: '#0B0A0D', side: THREE.BackSide });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), toon('#FFFFFF')); ground.rotation.x = -PI / 2; ground.receiveShadow = true; g.add(ground);
  const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  const items = many(30, 61, (r, i) => ({ x: (i / 30) * 120, y: 0, z: -9 - 14 * r(1), sx: 3 + 5 * r(2), sy: 4 + 16 * r(3), sz: 3 + 4 * r(4) }));
  const builds = scrolling(box, toon('#F7F4EE'), items, 120, { shadow: true });
  const outline = scrolling(box, ink, items.map((it) => ({ ...it, sx: it.sx + 0.25, sy: it.sy + 0.25, sz: it.sz + 0.25 })), 120);
  const dashGeo = new THREE.BoxGeometry(1, 0.01, 0.05);
  const dashes = scrolling(dashGeo, new THREE.MeshBasicMaterial({ color: '#0B0A0D' }), many(90, 62, (r) => ({ x: r(1) * 40, y: 0.006, z: r(2) * 14 - 9, sx: 0.6 + 3 * r(3), par: 1.6 })), 40);
  const streaks = scrolling(new THREE.BoxGeometry(1, 0.025, 0.025), new THREE.MeshBasicMaterial({ color: '#0B0A0D' }),
    many(70, 63, (r) => ({ x: r(1) * 30, y: 0.3 + 3.2 * r(2), z: r(3) * 4 - 3.5, sx: 1.5 + 5 * r(4), par: 3.2 })), 30);
  g.add(builds.mesh, outline.mesh, dashes.mesh, streaks.mesh);
  const sun = sunLight('#FFFFFF', 2.6, [4, 7, 5]); g.add(sun, sun.target);
  g.add(new THREE.HemisphereLight('#FFFFFF', '#888888', 0.9));
  return {
    group: g, style: 'toon',
    setup(scene) { scene.background = new THREE.Color('#F4EFE4'); scene.fog = null; scene.environmentIntensity = 0.0; },
    update(t, travel) { builds.update(travel); outline.update(travel); dashes.update(travel); streaks.update(travel); },
    look: { halftone: 1, contrast: 1.25, sat: 0, bloom: 0, vig: 0.05 },
  };
}

export function chromeStudio() {
  const g = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), new THREE.MeshStandardMaterial({ color: '#060607', roughness: 0.3, metalness: 0.4 }));
  floor.rotation.x = -PI / 2; floor.receiveShadow = true; g.add(floor);
  const boxes = scrolling(new THREE.PlaneGeometry(1, 1).rotateX(PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 3.2, 3.3), side: THREE.DoubleSide }),
    many(16, 71, (r, i) => ({ x: (i / 16) * 48, y: 4.6, z: -1.5 + 3 * r(1) - 1.5, sx: 5, sz: 0.5 })), 48);
  const bars = scrolling(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.7) }),
    many(8, 72, (r, i) => ({ x: (i / 8) * 56, y: 3.5, z: -14, sx: 0.3, sy: 7 })), 56);
  const orange = new THREE.Mesh(new THREE.PlaneGeometry(200, 0.5), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.1, 0.3) })); orange.position.set(0, 0.25, -16); g.add(orange);
  const chrome = new THREE.MeshPhysicalMaterial({ color: '#EEF1F5', roughness: 0.04, metalness: 1 });
  const shapes = [new THREE.SphereGeometry(0.7, 40, 24), new THREE.TorusKnotGeometry(0.5, 0.18, 120, 16), new THREE.IcosahedronGeometry(0.8, 0), new THREE.TorusGeometry(0.6, 0.22, 24, 60)];
  const floaters = many(10, 73, (r, i) => { const m = new THREE.Mesh(shapes[i % 4], chrome); m.userData = { x0: r(1) * 60, y: 2.4 + 2.5 * r(2), z: -13 - 6 * r(3), s: r(4) }; m.castShadow = true; g.add(m); return m; });
  g.add(boxes.mesh, bars.mesh);
  const key = sunLight('#FFFFFF', 1.4, [3, 8, 5]); g.add(key, key.target);
  const rim = new THREE.DirectionalLight('#FF8A3D', 2.2); rim.position.set(-4, 2, -6); g.add(rim);
  return {
    group: g, style: 'chrome',
    setup(scene) { scene.background = new THREE.Color('#000000'); scene.fog = new THREE.FogExp2('#000000', 0.04); scene.environmentIntensity = 1.15; },
    update(t, travel) {
      boxes.update(travel); bars.update(travel);
      floaters.forEach((m) => { const u = m.userData; m.position.set(wrap(u.x0 - travel * 0.8, 60), u.y + Math.sin(t * 1.3 + u.s * 6) * 0.25, u.z); m.rotation.set(t * 0.6 + u.s * 3, t * 0.9, 0); });
    },
    look: { contrast: 1.14, sat: 0.9, bloom: 0.6 },
  };
}

const DATA = ['SHOT 07', '24 FPS', '1/48', 'f/2.8', 'ISO 800', '00:00:36:12', '5600K', '35mm', 'TAKE 03', 'LUT', 'FOCUS 2.4m', 'RGB', 'CAM A', 'ROLL 12', 'Z-DEPTH', 'MOTION ✓', 'COLOUR ✓', 'LOUDNESS ✓'];

export function dataWorld() {
  const g = new THREE.Group();
  const floor = gridFloor({ cell: 1 }); floor.userData.u.gBoost.value = 0.9; floor.userData.u.gRadius.value = -1; g.add(floor);
  const sprites = DATA.flatMap((txt, i) => [0, 1].map((k) => {
    const tex = canvasTex(512, 96, (c, w, h) => { c.font = '700 54px "JetBrains Mono"'; c.fillStyle = (i + k) % 3 ? '#FFFFFF' : '#FF6A1A'; c.textBaseline = 'middle'; c.fillText(txt, 8, h / 2); });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: true }));
    const r = (q) => hash(i * 2 + k, 81 + q);
    s.scale.set(2.4, 0.45, 1).multiplyScalar(0.5 + 0.8 * r(1)); s.userData = { x0: r(2) * 60, y: 0.6 + 4.5 * r(3), z: -2.5 - 14 * r(4) }; g.add(s); return s;
  }));
  const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
  const bars = scrolling(geo, new THREE.MeshStandardMaterial({ color: '#111216', roughness: 0.3, metalness: 0.7, emissive: '#FF6A1A', emissiveIntensity: 0.25 }),
    many(60, 82, (r) => ({ x: r(1) * 60, y: 0, z: -3 - 16 * r(2), sx: 0.4, sz: 0.4, sy: 0.4 + 3 * r(3), ph: r(4) })), 60);
  g.add(bars.mesh);
  g.add(new THREE.HemisphereLight('#FFB27A', '#000000', 0.5));
  return {
    group: g, style: 'line', kicks: null,
    setup(scene) { scene.background = new THREE.Color('#000000'); scene.fog = new THREE.FogExp2('#000000', 0.045); scene.environmentIntensity = 0.6; },
    update(t, travel) {
      floor.position.x = -(travel % 1);
      sprites.forEach((s) => { const u = s.userData; s.position.set(wrap(u.x0 - travel, 60), u.y, u.z); });
      bars.update(travel, (it) => ({ sy: 0.6 + 0.4 * Math.abs(Math.sin(t * Math.PI * 2 + it.ph * 6)) }));
    },
    look: { bloom: 0.9, contrast: 1.08 },
  };
}
