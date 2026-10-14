// One continuous camera flight through the whole world: a centripetal Catmull-Rom spline
// through key poses, eased per segment, with a breath of handheld drift.
import * as THREE from 'three';
import { T } from './timeline.js';
import { lerp, prog, clamp } from './util.js';

const KEYS = [
  // time, position, look-at, easing of the segment that starts here
  [0.0, [0.0, 2.4, 7.8], [0.2, 2.5, -1], 'lin'],
  [2.9, [0.3, 2.5, 5.0], [0.2, 2.6, -2.5], 'in'],
  [3.75, [-0.8, 3.0, -2.4], [0.0, 3.55, -14], 'out'],
  [5.3, [-2.2, 3.0, -3.2], [0.4, 3.6, -14], 'lin'],
  [T.whip[0], [1.6, 3.1, -3.5], [0.8, 3.6, -14], 'inout'],
  [T.whip[1], [22.6, 2.6, -4.6], [27.0, 2.95, -14], 'lin'],
  [11.0, [28.0, 2.6, -4.7], [32.4, 2.95, -14], 'inout'],
  [12.45, [43.0, 1.9, -3.4], [46.2, 1.6, -14], 'out'],
  [15.0, [46.0, 1.75, -4.2], [46.0, 1.4, -14], 'lin'],
];
const EASE = {
  lin: (f) => f, in: (f) => f * f, out: (f) => 1 - (1 - f) * (1 - f),
  inout: (f) => -(Math.cos(Math.PI * f) - 1) / 2,
};
const posCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[1])), false, 'centripetal');
const tgtCurve = new THREE.CatmullRomCurve3(KEYS.map((k) => new THREE.Vector3(...k[2])), false, 'centripetal');

function u(t) {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1][0]) i++;
  const f = EASE[KEYS[i][3]](clamp((t - KEYS[i][0]) / (KEYS[i + 1][0] - KEYS[i][0])));
  return (i + f) / (KEYS.length - 1);
}

const p = new THREE.Vector3(), q = new THREE.Vector3();
export function placeCamera(cam, t) {
  const uu = u(t);
  posCurve.getPoint(uu, p); tgtCurve.getPoint(uu, q);
  p.x += Math.sin(t * 0.9) * 0.03 + Math.sin(t * 2.3) * 0.008; p.y += Math.sin(t * 1.3 + 1) * 0.02;
  q.x += Math.sin(t * 0.7 + 2) * 0.02; q.y += Math.sin(t * 1.1) * 0.015;
  cam.position.copy(p); cam.lookAt(q);
  cam.rotation.z += Math.sin(t * 0.6) * 0.004;
  cam.fov = lerp(32, 28, prog(t, 12.4, 15)); cam.updateProjectionMatrix();
}

// Sub-frames per frame: more when the camera moves fast, so motion blur stays smooth.
const a = new THREE.Vector3(), b = new THREE.Vector3();
export function samplesAt(t) {
  posCurve.getPoint(u(t - 0.004), a); posCurve.getPoint(u(t + 0.004), b);
  const speed = a.distanceTo(b) / 0.008;
  const busy = (t > T.rush[0] && t < T.tilesIn[1]) || (t > T.words[0] && t < T.sweep + 0.7);
  return clamp(Math.round(2 + speed * 0.45 + (busy ? 2 : 0)), 2, 10);
}
