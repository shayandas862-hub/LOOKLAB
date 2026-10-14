// 1:12–1:28 — WORLD. The camera came through the monitor at shot 1's exact framing; now the dune is a place. The hero
// runs past the shoe, wearing it, towards the rising sun along the sentence written into the sand. ONE SENTENCE.
// Then a crane up until the sentence and the tiny runner read from above.
import * as THREE from 'three';
import { W, H, CUE, bar, SEC } from '../timeline.js';
import { ease, prog, lerp } from '../util.js';
import { run } from '../figure.js';
import { RUNNER, duneH } from '../sets.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const L = (a, b, f) => a.clone().lerp(b, f);
// A point to look at from `p`, turning from towards `a` to towards `b` by blending yaw and pitch (shortest way round).
function aim(p, a, b, f) {
  const da = a.clone().sub(p), db = b.clone().sub(p);
  const ya = Math.atan2(da.x, da.z), yb = Math.atan2(db.x, db.z), pa = Math.atan2(da.y, Math.hypot(da.x, da.z)), pb = Math.atan2(db.y, Math.hypot(db.x, db.z));
  const dy = Math.atan2(Math.sin(yb - ya), Math.cos(yb - ya)), y = ya + dy * f, pi = lerp(pa, pb, f), r = lerp(da.length(), db.length(), f);
  return p.clone().add(V(Math.sin(y) * Math.cos(pi), Math.sin(pi), Math.cos(y) * Math.cos(pi)).multiplyScalar(r));
}
const T0 = bar(SEC.world[0]), T1 = bar(SEC.world[1]), SPEED = 2.6;
// The path passes beyond the shoe, not through the camera; the sentence runs along it.
const D = new THREE.Vector2(-0.52, -0.85).normalize(), A = new THREE.Vector2(5.68, 1.52);

export function createWorld(sh, sets) {
  const dune = sets[0], scene = dune.scene, hero = dune.hero;
  const camera = new THREE.PerspectiveCamera(34, W / H, 0.01, 2000);
  const sunU = dune.sky.material.uniforms.sd.value, sun0 = new THREE.Vector3(-0.55, 0.045, -1).normalize(), sun1 = new THREE.Vector3(-0.55, 0.17, -1).normalize();
  const heroAt = (t) => { const s = SPEED * Math.max(0, t - T0) - 0.6, x = A.x + D.x * s, z = A.y + D.y * s; return V(x, duneH(x, z) - 0.02, z); };
  const perp = V(-D.y, 0, D.x), dir = V(D.x, 0, D.y), up = V(D.y, 0, -D.x); // up: the letters' top, seen from above

  function cam(t) {
    const h = heroAt(t), head = h.clone().add(V(0, 1.2, 0));
    const start = dune.shot(4.0); const p0 = start.position.clone(), t0 = dune.base.clone().add(V(0, 0.06, 0));
    // The pan from the shoe to the passing runner blends the viewing angle, not the two points: a line between a
    // point near the lens and one beside it swings the camera far faster than an operator would.
    const fp = p0.clone().add(V(0, 0.25 * ease.inOutSine(prog(t, T0 + 0.6, T0 + 2)), 0));
    const follow = { pos: fp, tgt: aim(fp, t0, head, ease.inOutSine(prog(t, T0 + 1.3, T0 + 2.8))), fov: lerp(start.fov, 34, ease.inOutSine(prog(t, T0 + 0.8, T0 + 2))) };
    const chase = { pos: h.clone().addScaledVector(dir, -3.4).addScaledVector(perp, 1.9).add(V(0, 1.35, 0)), tgt: head.clone().addScaledVector(dir, 2), fov: 34 };
    const side = { pos: h.clone().addScaledVector(perp, 6.5).addScaledVector(dir, 1.2).add(V(0, 1.7, 0)), tgt: head.clone().addScaledVector(dir, 1.6), fov: 34 };
    const mix = (a, b, f) => ({ pos: L(a.pos, b.pos, f), tgt: L(a.tgt, b.tgt, f), fov: lerp(a.fov, b.fov, f) });
    if (t < T0 + 2.8) return follow;
    if (t < CUE.title) return mix(follow, chase, ease.inOutSine(prog(t, T0 + 2.8, T0 + 4.6)));
    if (t < CUE.crane - 1) return mix(chase, side, ease.inOutSine(prog(t, CUE.title, CUE.title + 2.2)));
    // The crane starts a second before the riser and eases over five: a 70 m rise that stays under 25 m/s.
    const f = ease.inOutSine(prog(t, CUE.crane - 1, T1)), text = V(dune.text.uOrigin.value.x, 0, dune.text.uOrigin.value.y);
    const mid = h.clone().lerp(text, 0.4), high = { pos: mid.clone().addScaledVector(up, -16).add(V(0, 70, 0)), tgt: mid, fov: 40 };
    return { ...mix(side, high, f), up: V(0, 1, 0).lerp(up, f).normalize() };
  }

  return {
    scene, camera,
    update(t) {
      dune.shoe.paint(RUNNER); dune.text.uOn.value = ease.inOutSine(prog(t, T0 + 0.3, T0 + 1.8)); hero.root.visible = true;
      dune.update(t);
      const h = heroAt(t); hero.root.position.copy(h); hero.root.rotation.y = Math.atan2(D.x, D.y);
      hero.setPose(run((t - T0) / 1.0 + 0.5));
      const s = sun0.clone().lerp(sun1, ease.inOutSine(prog(t, T0, T1))).normalize(); sunU.copy(s);
      dune.sun.target.position.copy(h); dune.sun.position.copy(h).addScaledVector(s, 30); dune.sun.shadow.camera.left = dune.sun.shadow.camera.bottom = -6; dune.sun.shadow.camera.right = dune.sun.shadow.camera.top = 6; dune.sun.shadow.camera.updateProjectionMatrix();
      const c = cam(t); camera.up.copy(c.up ?? V(0, 1, 0)); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.fov = c.fov; camera.updateProjectionMatrix();
    },
    look(t) { return { bloom: 0.55, contrast: 1.07, gain: '#FFF0E0', vig: 0.4 }; },
  };
}
