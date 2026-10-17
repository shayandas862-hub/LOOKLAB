// The one set for the whole ad: a studio sweep, a wooden turntable with the glass bowl, the floating ingredients of S1
// (high above the bowl, so in S2 they fall into it), the honey rig. update(t) sets every object and the shot's camera.
import * as THREE from 'three';
import { SHOTS, ease, fovOf, rng, shotAt, span } from './timeline.js';
import { gradientTexture } from './engine.js';
import { createBowl, createPlinth } from './bowl.js';
import { createHoney } from './honey.js';
import { acaiScoop, banana, blueberry, granola, kiwi, oat, strawberry } from './food.js';

const FLOAT_AT = new THREE.Vector3(0, 7, 0);

function floating() {
  const r = rng(42), group = new THREE.Group(), items = [];
  const kinds = [() => strawberry(), () => strawberry(true), blueberry, blueberry, banana, kiwi, (i) => granola(500 + i, 0.07), oat];
  for (let i = 0; i < 46; i++) {
    const o = i === 0 ? acaiScoop(77, 0.24) : kinds[i % kinds.length](i);
    const p = new THREE.Vector3((r() * 2 - 1) * (1.0 + r() * 0.4), (r() * 2 - 1) * 1.7, -2.4 + r() * 3.6);
    if (i === 0) p.set(0.35, -0.55, -0.6);
    if (i === 1) p.set(-0.32, 0.25, 0.9);
    o.position.copy(p); group.add(o);
    items.push({ o, p, rot: [r() * 6, r() * 6, r() * 6], w: [(r() - 0.5) * 0.9, (r() - 0.5) * 0.9, (r() - 0.5) * 0.6], lag: r() * 0.35 });
  }
  group.position.copy(FLOAT_AT);
  return { group, update(t) {
    for (const it of items) {
      const fall = Math.max(0, t - 2.3 - it.lag);
      it.o.position.set(it.p.x, it.p.y + 0.06 * t - 5.5 * fall * fall, it.p.z);
      it.o.rotation.set(it.rot[0] + it.w[0] * t, it.rot[1] + it.w[1] * t, it.rot[2] + it.w[2] * t);
    }
  } };
}

// Camera on a sphere round a target: azimuth and elevation in degrees, distance in units.
function aim(cam, target, az, el, dist) {
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
  cam.position.set(target.x + dist * Math.cos(e) * Math.sin(a), target.y + dist * Math.sin(e), target.z + dist * Math.cos(e) * Math.cos(a));
  cam.lookAt(target);
}
const lerp = (a, b, k) => a + (b - a) * k;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export function createSet(env) {
  const scene = new THREE.Scene();
  scene.environment = env; scene.environmentIntensity = 0.55;
  const dark = gradientTexture('#2b1726', '#1b0e18', '#0a0508');
  const brand = gradientTexture('#d8b64c', '#c39f36', '#6d5217');
  scene.add(new THREE.HemisphereLight('#fff3df', '#3b2a1c', 0.45));
  const key = new THREE.DirectionalLight('#fff0d4', 2.6); key.position.set(-3, 5.5, 3.5); key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 1, far: 15 });
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 5; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.01;
  const rim = new THREE.DirectionalLight('#ffe6bd', 2.6); rim.position.set(2.5, 3.5, -4.5);
  scene.add(key, rim);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.32 }));
  floor.position.y = -0.16; floor.receiveShadow = true; scene.add(floor);

  const turntable = new THREE.Group(), plinth = createPlinth(), bowl = createBowl();
  bowl.group.traverse((m) => { if (m.isMesh && m !== bowl.glass) m.castShadow = m.receiveShadow = true; });
  turntable.add(plinth, bowl.group); scene.add(turntable);
  const honey = createHoney(); scene.add(honey.group);
  const float = floating(); scene.add(float.group);

  const camera = new THREE.PerspectiveCamera(30, 9 / 16, 0.05, 60);
  function update(t) {
    const shot = shotAt(t), k = span(t, shot.t[0], shot.t[1]);
    camera.fov = fovOf(shot.lens); camera.updateProjectionMatrix();
    scene.background = shot.id === 'S1' ? dark : brand;
    float.group.visible = shot.id === 'S1';
    turntable.visible = shot.id !== 'S1';
    float.update(t); bowl.update(t); honey.update(t);
    turntable.rotation.y = Math.PI * 2 * ease(span(t, SHOTS[2].t[0], SHOTS[2].t[1]));
    if (shot.id === 'S1') {
      camera.position.copy(FLOAT_AT).add(V(0.25 - 0.4 * k, 0.15 - 0.1 * k, lerp(4.7, 3.7, ease(k))));
      camera.lookAt(FLOAT_AT.clone().add(V(0, -0.1 * k, 0)));
    }
    if (shot.id === 'S2') aim(camera, V(0, 0.55, 0), lerp(16, 6, k), 30, lerp(8.7, 7.7, ease(k)));
    if (shot.id === 'S3') aim(camera, V(0, 0.42, 0), 0, lerp(13, 17, ease(k)), lerp(8.2, 7.6, ease(k)));
    if (shot.id === 'S4') aim(camera, V(0.05, 1.25, 0), lerp(24, 18, k), 30, lerp(6.6, 6.1, ease(k)));
    if (shot.id === 'S5') aim(camera, V(0, 1.2, 0), lerp(28, 20, ease(k)), 20, lerp(8.6, 9.8, ease(k)));
    return shot;
  }
  const parts = { bowl: bowl.group, tops: bowl.tops.map((p) => p.obj), plinth, honey: honey.group, float: float.group };
  return { scene, camera, update, parts };
}
