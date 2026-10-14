// The four sets the brief becomes. Each is its own scene with a shot camera that uses the lens on its card.
//   S1 DUNE · DAWN (35 mm)   S2 STRIDE (85 mm)   S3 THE SHOE (50 mm)   S4 CITY · NIGHT (24 mm)
import * as THREE from 'three';
import { W, H, SHOTS, fovOf, BRAND, COPY } from './timeline.js';
import { ease, prog, lerp, hash } from './util.js';
import { sky, canvasTex, sunLight, scrolling, many, glow } from './worldkit.js';
import { sneaker } from './products.js';
import { createFigure, run } from './figure.js';
import { neonCity } from './worlds1.js';
import { studioEnv } from './engine.js';

const PI = Math.PI, V = (x, y, z) => new THREE.Vector3(x, y, z);
export const RUNNER = { upper: '#F3EFE8', accent: BRAND, mid: '#FFFFFF', sole: '#2A1E18' };
// The mistake the checker catches: shot 1 was made with an off-brand orange.
export const OFF_BRAND = { ...RUNNER, accent: '#FFC02E' };
const cam = (mm) => new THREE.PerspectiveCamera(fovOf(mm), W / H, 0.01, 1500);
const shoes = (cw = RUNNER) => () => { const s = sneaker(); s.paint(cw); s.group.scale.setScalar(0.8); return s.group; };

// Dunes that never repeat near the shoe; one crest at the origin.
export const duneH = (x, z) => 1.4 * Math.sin(0.075 * x + 0.05 * z) + 0.8 * Math.sin(0.13 * x - 0.08 * z + 1.1) + 0.35 * Math.sin(0.31 * x + 0.22 * z + 2) + 2.2 * Math.exp(-(x * x + z * z) / 60);

export function duneSet(sh) {
  const scene = new THREE.Scene(); scene.environment = sh.env; scene.environmentIntensity = 0.45;
  scene.fog = new THREE.Fog('#E9A272', 40, 420);
  const skyU = sky('#FFB277', '#33244F', { sun: [-0.55, 0.07, -1], sunCol: '#FFD8A6', power: 0.6, radius: 900 }); scene.add(skyU);
  const geo = new THREE.PlaneGeometry(600, 600, 220, 220); geo.rotateX(-PI / 2);
  const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, duneH(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  const ripple = canvasTex(512, 512, (c, w, h) => { for (let y = 0; y < h; y++) { const v = 128 + 70 * Math.sin(y * 0.55 + Math.sin(y * 0.05) * 3); c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(0, y, w, 1); } }, { repeat: [60, 60], srgb: false });
  // The sentence, written into the sand: off until the world section turns it on.
  const words = canvasTex(4096, 512, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.font = '700 210px "JetBrains Mono"'; c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(COPY.brief, w / 2, h / 2); }, { srgb: false });
  const text = { uText: { value: words }, uOn: { value: 0 }, uOrigin: { value: new THREE.Vector2(-22.92, -41.88) }, uDir: { value: new THREE.Vector2(-0.52, -0.85).normalize() }, uSize: { value: new THREE.Vector2(96, 12) } };
  const sandMat = new THREE.MeshStandardMaterial({ color: '#E3AE73', roughness: 0.95, bumpMap: ripple, bumpScale: 0.4 });
  sandMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, text);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform sampler2D uText; uniform float uOn; uniform vec2 uOrigin, uDir, uSize;')
      .replace('#include <map_fragment>', `#include <map_fragment>
        if (uOn > 0.0) { vec2 rel = vWP.xz - uOrigin; vec2 st = vec2(dot(rel, uDir) / uSize.x + 0.5, dot(rel, vec2(uDir.y, -uDir.x)) / uSize.y + 0.5); // reads upright from above
          if (st.x > 0.0 && st.x < 1.0 && st.y > 0.0 && st.y < 1.0) diffuseColor.rgb *= 1.0 - 0.5 * uOn * texture2D(uText, st).r; }`);
  };
  const sand = new THREE.Mesh(geo, sandMat); sand.receiveShadow = true; scene.add(sand);
  const shoe = sneaker(); shoe.paint(RUNNER); shoe.group.position.set(0, duneH(0, 0) - 0.005, 0); shoe.group.rotation.y = -0.5; scene.add(shoe.group);
  const sun = sunLight('#FFC08A', 3.4, [-14, 2.2, -24], { size: 4 }); sun.target.position.copy(shoe.group.position); scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#9C86D6', 0.6); fill.position.set(6, 3, 8); scene.add(fill);
  scene.add(new THREE.HemisphereLight('#FFC9A0', '#6A3A22', 0.5));
  const grains = scrolling(new THREE.SphereGeometry(1, 5, 4), new THREE.MeshBasicMaterial({ color: '#FFE2BC' }),
    many(260, 501, (r) => ({ x: r(1) * 16 - 8, y: duneH(0, 0) + r(2) * 0.22, z: r(3) * 8 - 4, sx: 0.0025 + 0.005 * r(4), sy: 0.0025 + 0.005 * r(4), sz: 0.0025 + 0.005 * r(4) })), 16);
  scene.add(grains.mesh);
  const hero = createFigure(); hero.wear({ shoes: shoes() }); hero.root.visible = false; scene.add(hero.root);
  const c = cam(35), base = shoe.group.position.clone();
  return {
    scene, camera: c, shoe, hero, base, sky: skyU, sun, text,
    // Local time u in seconds since the shot started. The finished shot: a slow low push towards the shoe.
    shot(u) { const f = ease.inOutSine(Math.min(1, u / 4)); c.fov = fovOf(35); c.position.copy(base).add(V(lerp(0.78, 0.58, f), lerp(0.15, 0.12, f), lerp(0.64, 0.48, f))); c.lookAt(base.clone().add(V(0, 0.06, 0))); c.updateProjectionMatrix(); return c; },
    update(t) { grains.update(t * 2.2, (it, i) => ({ y: 0.05 * Math.sin(t * 3 + i) })); },
  };
}

export function trackSet(sh) {
  const scene = new THREE.Scene(); scene.environment = sh.env; scene.environmentIntensity = 0.35; scene.background = new THREE.Color('#1A0F12');
  scene.fog = new THREE.FogExp2('#2A1414', 0.04);
  const lanes = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#B5482E'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 3000; i++) { c.fillStyle = hash(i, 7) > 0.5 ? 'rgba(255,220,200,0.08)' : 'rgba(40,10,5,0.12)'; c.fillRect(hash(i, 8) * w, hash(i, 9) * h, 2, 2); }
    c.fillStyle = '#F4EFE8'; for (const y of [40, 216, 392]) c.fillRect(0, y, w, 6);
  }, { repeat: [40, 4] });
  const track = new THREE.Mesh(new THREE.PlaneGeometry(200, 24), new THREE.MeshStandardMaterial({ map: lanes, roughness: 0.85 }));
  track.rotation.x = -PI / 2; track.receiveShadow = true; scene.add(track);
  const towers = scrolling(new THREE.BoxGeometry(1.6, 0.9, 0.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 4.2, 3.2) }),
    many(14, 502, (r, i) => ({ x: (i / 14) * 140, y: 9 + 3 * r(1), z: -26 - 6 * r(2) })), 140);
  scene.add(towers.mesh);
  const hero = createFigure(); hero.wear({ shoes: shoes() }); hero.root.rotation.y = PI / 2; scene.add(hero.root);
  const key = sunLight('#FFB070', 3.2, [-6, 3, -5], { size: 3 }); scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#FFD9B8', 0.9); fill.position.set(3, 2, 6); scene.add(fill);
  scene.add(new THREE.HemisphereLight('#FFB89A', '#2A0E08', 0.4));
  const c = cam(85);
  return {
    scene, camera: c, hero,
    shot(u) { c.fov = fovOf(85); const x = 0.15 + 0.05 * Math.sin(u); c.position.set(x, 0.24, 2.3); c.lookAt(0.12, 0.2, 0); c.updateProjectionMatrix(); return c; },
    // Slow motion: the stride runs at 40% speed, the track slides to match.
    update(t, u) { const ph = u * 0.4; hero.setPose(run(ph)); lanes.offset.x = (ph * 2.6 * 0.4) / 5; towers.update(ph * 2.6); },
  };
}

export function productSet(sh) {
  const scene = new THREE.Scene(); scene.environment = studioEnv(sh.renderer, { strips: 1.2 }); scene.environmentIntensity = 0.5; scene.background = new THREE.Color('#050506');
  const back = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), glow(BRAND, { intensity: 0.5, falloff: 3 })); back.position.set(0, 0.25, -1.6); scene.add(back);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(20, 64).rotateX(-PI / 2), new THREE.MeshStandardMaterial({ color: '#08080A', roughness: 0.35, metalness: 0.5 })); floor.receiveShadow = true; scene.add(floor);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.08, 64), new THREE.MeshPhysicalMaterial({ color: '#0C0C0E', roughness: 0.15, metalness: 0.3, clearcoat: 1 })); plinth.position.y = 0.04; plinth.receiveShadow = plinth.castShadow = true; scene.add(plinth);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.0025, 6, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.8, 0.22) })); ring.rotation.x = PI / 2; ring.position.y = 0.08; scene.add(ring);
  const shoe = sneaker(); shoe.paint(RUNNER); shoe.group.position.y = 0.08; scene.add(shoe.group);
  const key = new THREE.DirectionalLight('#FFF4E8', 1.1); key.position.set(-1, 2, 1.2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -0.5, right: 0.5, top: 0.5, bottom: -0.5, near: 0.1, far: 6 }); scene.add(key);
  const rim = new THREE.DirectionalLight('#FF7A2E', 1.8); rim.position.set(1.2, 0.8, -1.5); scene.add(rim);
  const sweep = new THREE.PointLight('#FFFFFF', 0, 2, 1.5); scene.add(sweep);
  const c = cam(50);
  return {
    scene, camera: c, shoe,
    shot(u) { const a = 0.9 - 0.5 * ease.inOutSine(Math.min(1, u / 4)); c.fov = fovOf(50); c.position.set(Math.sin(a) * 0.95, 0.3, Math.cos(a) * 0.95); c.lookAt(0, 0.13, 0); c.updateProjectionMatrix(); return c; },
    update(t, u) { shoe.group.rotation.y = -0.4 + 0.25 * u; sweep.position.set(lerp(-0.8, 0.8, (u % 2) / 2), 0.35, 0.4); sweep.intensity = 0.7; },
  };
}

export function citySet(sh) {
  const scene = new THREE.Scene(); scene.environment = sh.env;
  const w = neonCity(); scene.add(w.group); w.setup(scene);
  const hero = createFigure(); hero.wear({ shoes: shoes() }); hero.root.rotation.y = PI / 2; scene.add(hero.root);
  const c = cam(24);
  return {
    scene, camera: c, hero, world: w,
    shot(u) { const a = 0.55 + 0.25 * Math.min(1, u / 4); c.fov = fovOf(24); c.position.set(Math.sin(a) * 3.0, 0.55, Math.cos(a) * 3.0); c.lookAt(0.6, 1.0, 0); c.updateProjectionMatrix(); return c; },
    update(t, u) { hero.setPose(run(u)); w.update(t, 2.6 * u + 30); },
  };
}

export const SET_BUILDERS = [duneSet, trackSet, productSet, citySet];
