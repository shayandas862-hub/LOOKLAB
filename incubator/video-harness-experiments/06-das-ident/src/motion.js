// Where the petals and the camera are at time t. Pure (no scene), so the score can hear what the picture shows:
// a whoosh when a petal passes the lens, panned to where it is on screen.
import * as THREE from 'three';
import { PETALS, DURATION, toWorld } from './timeline.js';
import { ease, prog, lerp } from './util.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
// The petals swirl round the logo's centre like leaves in a draught, each on its own tilted orbit, tumbling, and
// fall out of the swirl into place at their lock. The red, last, passes nearest the lens.
const FLIGHT = {
  green: { phase: 0.4, r: 5.2, lift: -0.8, spin: [5.4, -3.6, 6.9] },
  amber: { phase: 2.1, r: 5.8, lift: 0.9, spin: [-4.1, 5.6, -3.9] },
  cyan: { phase: 3.6, r: 4.9, lift: -1.6, spin: [3.8, 4.2, -5.6] },
  red: { phase: 5.15, r: 6.4, lift: 1.2, spin: [-3.5, -4.4, 3.7] },
};
const OMEGA = 0.95;
export const HOME = Object.fromEntries(PETALS.map((p) => { const [x0, y0, x1, y1] = p.box, [x, y] = toWorld((x0 + x1) / 2, (y0 + y1) / 2); return [p.id, V(x, y, 0)]; }));
export const LOCK = Object.fromEntries(PETALS.map((p) => [p.id, p.lock]));

export function petalPose(id, t) {
  const f = FLIGHT[id], L = LOCK[id], x = prog(t, 0, L), th = f.phase + OMEGA * Math.min(t, L), R = f.r * (1 - 0.45 * x);
  const pos = V(R * Math.cos(th), f.lift + 0.9 * Math.sin(th * 0.8 + f.phase), R * Math.sin(th) * 0.95).lerp(HOME[id], Math.pow(x, 3)), k = Math.pow(1 - x, 2);
  const dt = t - L; if (dt > 0) pos.z -= 0.16 * Math.exp(-dt * 7) * Math.sin(dt * 26); // the slam into place
  return { pos, rot: [f.spin[0] * k, f.spin[1] * k, f.spin[2] * k] };
}

// The camera: a drift among the petals, a pull back to the hero angle as they lock, then a slow push in.
export function camAt(t) {
  const a = ease.inOutSine(prog(t, 0, 5.2)), b = ease.inOutSine(prog(t, 4.2, 7.6)), c = ease.inOutSine(prog(t, 7.4, DURATION));
  const P = [V(-2.6, 1.6, 10.5), V(1.4, 0.5, 11.5), V(0.25, -0.4, 15.8), V(-0.15, -0.3, 14.3)];
  const T = [V(0, 0.2, 0), V(0.1, 0.1, 0), V(0, -0.05, 0), V(0, 0, 0)];
  const at = (k) => k[0].clone().addScaledVector(k[1].clone().sub(k[0]), a).addScaledVector(k[2].clone().sub(k[1]), b).addScaledVector(k[3].clone().sub(k[2]), c);
  return { pos: at(P), tgt: at(T), fov: lerp(lerp(42, 36, a), 30, b) };
}
