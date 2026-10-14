// Act 4: a black glass monolith in front of a ring of light, on a mirror-black floor.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ACT, C } from './timeline.js';
import { ease, prog, lerp } from './util.js';

export const MONO = new THREE.Vector3(46, 1.3, -14);

export function createFinale(scene) {
  RectAreaLightUniformsLib.init();
  const g = new THREE.Group(); scene.add(g);
  const slab = new THREE.Mesh(new RoundedBoxGeometry(1.3, 2.6, 0.34, 4, 0.06),
    new THREE.MeshPhysicalMaterial({ color: 0x050505, roughness: 0.16, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.06 }));
  slab.position.copy(MONO); g.add(slab);

  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(C.signalHex).multiplyScalar(5) });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.026, 16, 256), ringMat);
  ring.position.set(MONO.x, 2.0, MONO.z - 1.1); g.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.007, 8, 256), new THREE.MeshBasicMaterial({ color: new THREE.Color(C.bone).multiplyScalar(1.2) }));
  ring2.position.copy(ring.position); g.add(ring2);

  const rim = new THREE.PointLight(C.signalHex, 0, 12, 1.5); rim.position.set(MONO.x, 2.2, MONO.z - 1.4); g.add(rim);
  // A soft overhead panel: the gradient reflection that makes black glass read as glass.
  const top = new THREE.RectAreaLight(0xfff1e6, 0, 2.6, 1.4);
  top.position.set(MONO.x, 2.5, MONO.z + 4.4); top.lookAt(MONO.x, 1.3, MONO.z); g.add(top);

  // Mirror floor, dimmed by a smoked layer so it reads as black glass.
  const mirror = new Reflector(new THREE.PlaneGeometry(30, 24), { textureWidth: 960, textureHeight: 540, color: 0x8a8a8a });
  mirror.rotation.x = -Math.PI / 2; mirror.position.set(MONO.x, 0.004, MONO.z + 3); g.add(mirror);
  const smoke = new THREE.Mesh(new THREE.PlaneGeometry(30, 24), new THREE.MeshBasicMaterial({ color: 0x070707, transparent: true, opacity: 0.8 }));
  smoke.rotation.x = -Math.PI / 2; smoke.position.set(MONO.x, 0.008, MONO.z + 3); g.add(smoke);

  return function update(t) {
    g.visible = t > ACT.film[0] - 1.2;
    if (!g.visible) return;
    const p = ease.outExpo(prog(t, ACT.film[0], ACT.film[0] + 1.1));
    ring.scale.setScalar(lerp(0.35, 1, p)); ring.rotation.z = t * 0.05;
    ringMat.color.set(C.signalHex).multiplyScalar(lerp(0, 5, p) + 6 * Math.exp(-Math.max(0, t - ACT.film[0]) / 0.25) * (t >= ACT.film[0] ? 1 : 0));
    ring2.scale.setScalar(lerp(1.4, 1, ease.outCubic(prog(t, ACT.film[0] + 0.15, ACT.film[0] + 1.6))));
    ring2.material.opacity = prog(t, ACT.film[0] + 0.15, ACT.film[0] + 0.8); ring2.material.transparent = true;
    rim.intensity = lerp(0, 30, p); top.intensity = lerp(0, 6, ease.outCubic(prog(t, ACT.film[0] - 0.3, ACT.film[0] + 0.8)));
    slab.rotation.y = lerp(-0.5, 0, ease.outCubic(prog(t, ACT.film[0] - 1.0, ACT.film[0] + 1.4)));
  };
}
