// S4: a hand holds an upside-down squeeze bottle and drizzles honey in a zigzag over the toppings. The hand is a
// plain clay mannequin (a previs stand-in, not a person). The stream and the trail are rebuilt from t every frame.
import * as THREE from 'three';
import { CUE, ease, span } from './timeline.js';
import { TOP, rIn } from './bowl.js';

const honeyMat = new THREE.MeshPhysicalMaterial({
  color: '#f2a51e', transmission: 0.45, thickness: 0.06, roughness: 0.07, clearcoat: 1, ior: 1.45,
  attenuationColor: '#c25e00', attenuationDistance: 0.12, emissive: '#5a2a00', emissiveIntensity: 0.18,
});
const clay = new THREE.MeshStandardMaterial({ color: '#c9a385', roughness: 0.72 });

function bottle() {
  const o = new THREE.Group(), v = (x, y) => new THREE.Vector2(x, y);
  const cap = new THREE.LatheGeometry([v(0.001, 0), v(0.008, 0), v(0.03, 0.09), v(0.072, 0.1), v(0.072, 0.18), v(0.06, 0.19), v(0.001, 0.19)], 48);
  const body = new THREE.LatheGeometry([v(0.001, 0.18), v(0.1, 0.19), v(0.16, 0.25), v(0.163, 0.6), v(0.13, 0.66), v(0.001, 0.67)], 64);
  o.add(new THREE.Mesh(cap, new THREE.MeshPhysicalMaterial({ color: '#f4efe6', roughness: 0.35, clearcoat: 0.4 })));
  o.add(new THREE.Mesh(body, new THREE.MeshPhysicalMaterial({ color: '#e59a1c', transmission: 0.35, thickness: 0.3, roughness: 0.12, attenuationColor: '#b25600', attenuationDistance: 0.25, clearcoat: 1 })));
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.18, 64, 1, true), new THREE.MeshStandardMaterial({ color: '#efe4cc', roughness: 0.8 }));
  label.position.y = 0.43; o.add(label);
  return o;
}

// Fingers wrap round the front of the bottle, the thumb round the back, the forearm leaves the frame top right.
function hand() {
  const o = new THREE.Group(), R = 0.19;
  const arc = (y, a0, a1, r) => {
    const pts = []; for (let i = 0; i <= 10; i++) { const a = a0 + ((a1 - a0) * i) / 10; pts.push(new THREE.Vector3(Math.cos(a) * R, y + i * 0.002, Math.sin(a) * R)); }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, r, 10), clay);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), clay); tip.position.copy(pts[10]);
    const g = new THREE.Group(); g.add(tube, tip); return g;
  };
  [0.38, 0.44, 0.5, 0.56].forEach((y, i) => o.add(arc(y, 0.15, 2.0 - i * 0.08, 0.028 - i * 0.002)));
  o.add(arc(0.6, 0.1, -1.6, 0.03));
  const palm = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.16, 6, 12), clay);
  palm.scale.set(0.7, 1, 1.25); palm.position.set(0.22, 0.48, -0.03); o.add(palm);
  const from = new THREE.Vector3(0.24, 0.55, -0.04), to = new THREE.Vector3(1.0, 1.6, -0.45);
  const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, from.distanceTo(to), 6, 14), clay);
  arm.position.copy(from).add(to).multiplyScalar(0.5);
  arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
  o.add(arm);
  return o;
}

// The drizzle's path over the top, s from 0 to 1: a zigzag left to right, kept inside the bowl.
function path(s) {
  const x = -0.62 + 1.24 * s, zMax = Math.sqrt(Math.max(0, rIn(TOP) ** 2 - x * x)) - 0.12;
  const z = Math.sin(s * Math.PI * 5) * Math.max(0, zMax);
  return new THREE.Vector3(x, TOP + 0.13 + 0.06 * Math.max(0, 1 - (x * x + z * z) / 0.8), z);
}
const ABOVE = 0.5;

export function createHoney() {
  const rig = new THREE.Group(), b = bottle(), h = hand();
  // Built small, then scaled to life size: a 7 cm bottle, a hand about as wide as the bowl.
  rig.add(b, h); rig.scale.setScalar(2.2); rig.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  const stream = new THREE.Mesh(new THREE.BufferGeometry(), honeyMat), trail = new THREE.Mesh(new THREE.BufferGeometry(), honeyMat);
  trail.castShadow = true;
  const group = new THREE.Group(); group.add(rig, stream, trail);
  const tube = (mesh, pts, r) => {
    mesh.geometry.dispose();
    mesh.geometry = pts.length > 1 ? new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(4, pts.length * 3), r, 10) : new THREE.BufferGeometry();
  };

  function update(t) {
    const [p0, p1] = CUE.pour, s = ease(span(t, p0, p1)) * 0.98 + span(t, p0, p1) * 0.02;
    // The hand: in from the top right, follows a little ahead of the drizzle, then out.
    const lead = path(Math.min(1, s + 0.04)).add(new THREE.Vector3(0, ABOVE, 0));
    const away = new THREE.Vector3(1.1, 2.2, -0.4);
    const kin = ease(span(t, CUE.handIn, p0)), kout = ease(span(t, CUE.handOut, CUE.handOut + 0.7));
    rig.visible = t >= CUE.handIn && kout < 1;
    rig.position.copy(path(0).add(new THREE.Vector3(0, ABOVE, 0)).add(away)).lerp(lead, kin).addScaledVector(away, kout);
    rig.rotation.set(0.12, 0.35, -0.12 + 0.08 * Math.sin(t * 3));
    const squeeze = span(t, p0 - 0.1, p0 + 0.1) * (1 - span(t, p1, p1 + 0.2));
    b.scale.set(1 - 0.05 * squeeze, 1, 1 - 0.05 * squeeze);

    // The stream: nozzle to the surface; it reaches down at the start and lets go at the end.
    const nozzle = new THREE.Vector3(); b.updateWorldMatrix(true, false); b.localToWorld(nozzle.set(0, 0, 0));
    group.worldToLocal(nozzle);
    const hit = path(s), reach = span(t, p0, p0 + 0.15), drop = span(t, p1, p1 + 0.2);
    stream.visible = t >= p0 && drop < 1;
    if (stream.visible) {
      const top = nozzle.clone().lerp(hit, drop), bottom = nozzle.clone().lerp(hit, reach);
      const mid = top.clone().lerp(bottom, 0.6); mid.x += (top.x - bottom.x) * 0.15;
      tube(stream, [top, mid, bottom], 0.011);
    }
    const n = Math.floor(s * 120), pts = [];
    for (let i = 0; i <= n; i++) pts.push(path(i / 120));
    if (t >= p0 + 0.1 && pts.length > 1) pts.push(hit);
    trail.visible = pts.length > 1;
    if (trail.visible) tube(trail, pts, 0.017);
  }
  return { group, update };
}
