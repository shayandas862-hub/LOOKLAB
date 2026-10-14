// 1:04–1:12 — the CATCH. Back in the neon city, in slow motion, the hero's head whips round far too fast (the real
// mistake the checker caught in First Light). Freeze; red box; the shot scrubs back, rebuilds from wireframe and is
// ticked; the hero turns to the camera at a believable speed; the camera pushes into the visor for the shout.
import * as THREE from 'three';
import { W, H, CUE, bar, SEC } from '../timeline.js';
import { ease, prog, lerp, clamp } from '../util.js';
import { run } from '../figure.js';
import { SPEED } from './films.js';

const T0 = bar(SEC.catch[0]), SLOW = 0.35;
// Story time: slow motion, a freeze, a rewind, a hold, then slow motion again.
function tau(t) {
  const a = (CUE.freezeCatch - T0) * SLOW;
  if (t < CUE.freezeCatch) return (t - T0) * SLOW;
  if (t < CUE.rewind[0]) return a;
  if (t < CUE.rewind[1]) return a * (1 - ease.inOutCubic(prog(t, CUE.rewind[0], CUE.rewind[1])));
  if (t < CUE.tick) return 0;
  return (t - CUE.tick) * SLOW;
}
const WHIP = (CUE.whip - T0) * SLOW;

export function createCatch(sh, films) {
  const { scene, camera, hero } = films;
  const wire = new THREE.MeshBasicMaterial({ color: '#7FB2FF', wireframe: true });
  const v = new THREE.Vector3();
  let head = null, state = 'run', lastT = 0;

  function camAt(t) {
    const th = 0.5, d = 3.3;
    const side = { pos: new THREE.Vector3(Math.sin(th) * d, 1.4, Math.cos(th) * d), tgt: new THREE.Vector3(0.25, 1.35, 0), fov: 32 };
    if (t < CUE.turn) return side;
    const hp = hero.head.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.12, 0));
    const near = hp.clone().add(new THREE.Vector3(0.05, 0.0, 0.42)), f = ease.inOutCubic(prog(t, CUE.turn, CUE.action2));
    const pos = side.pos.clone().lerp(near, f), tgt = side.tgt.clone().lerp(hp, f);
    if (t >= CUE.action2 + 0.25) pos.lerp(hp.clone().add(new THREE.Vector3(0.02, 0, 0.2)), ease.inCubic(prog(t, CUE.action2 + 0.25, bar(SEC.catch[1]))));
    return { pos, tgt, fov: lerp(32, 28, f) };
  }

  return {
    scene, camera,
    update(t) {
      lastT = t;
      const s = tau(t), fixed = t >= CUE.rebuild;
      const pose = run(s / 1.0 + 0.25);
      let yaw = 0;
      if (!fixed) yaw = -1.25 * clamp((s - WHIP) / 0.025);
      else yaw = -1.15 * ease.inOutSine(prog(t, CUE.turn, CUE.turn + 1.0));
      pose.headYaw = (pose.headYaw ?? 0) + yaw; pose.chestTwist = (pose.chestTwist ?? 0) + yaw * 0.25;
      films.drive({ t: T0 + s, world: 0, phase: 0, travel: SPEED * s + 7, cam: camAt(t), pose });
      hero.root.position.set(0, 0, 0);
      // Where the head is on screen, for the red box.
      hero.head.getWorldPosition(v).add(new THREE.Vector3(0, 0.12, 0));
      const dist = v.distanceTo(camera.position); v.project(camera);
      head = { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, r: (0.2 / (dist * Math.tan((camera.fov * Math.PI) / 360))) * (H / 2) };
      state = t >= CUE.freezeCatch && t < CUE.rebuild ? 'frozen' : t >= CUE.rebuild && t < CUE.tick ? 'rebuild' : 'run';
    },
    draw(renderer, rt) {
      if (state !== 'rebuild') { renderer.render(scene, camera); return; }
      // Rebuild: wireframe first, then the shaded frame wipes back in from the left.
      const sweep = ease.inOutCubic(prog(lastT, CUE.rebuild + 0.15, CUE.tick));
      renderer.setClearColor('#06132B', 1); renderer.clear();
      scene.overrideMaterial = wire; const bg = scene.background, fog = scene.fog; scene.background = null; scene.fog = null;
      renderer.render(scene, camera); scene.overrideMaterial = null; scene.background = bg; scene.fog = fog;
      if (sweep > 0) { rt.scissorTest = true; rt.scissor.set(0, 0, Math.round(W * sweep), H); renderer.setRenderTarget(rt); renderer.render(scene, camera); rt.scissorTest = false; rt.scissor.set(0, 0, W, H); renderer.setRenderTarget(rt); }
    },
    look(t) {
      const frozen = t >= CUE.freezeCatch && t < CUE.rebuild, rewinding = t >= CUE.rewind[0] && t < CUE.rewind[1];
      const after = prog(t, CUE.tick, CUE.action2);
      return {
        head, sat: frozen ? 0.35 : lerp(0.6, 1.0, after), contrast: frozen ? 1.1 : 1.0, scan: frozen ? 1 : 0,
        chroma: rewinding ? 0.012 : 0, bloom: 0.55, gain: frozen ? '#D8E4FF' : '#FFFFFF', vig: 0.55,
      };
    },
  };
}
