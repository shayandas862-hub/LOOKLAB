// 0:28–0:44 — FILMS. The hero sprints on the spot, feet landing on every beat; on every downbeat the world
// around them changes while the camera's slow orbit carries straight through the cut. drive() is also used by
// the CATCH, which replays the neon city in slow motion.
import * as THREE from 'three';
import { W, H, bar, SEC } from '../timeline.js';
import { ease, prog, clamp, lerp } from '../util.js';
import { createFigure, run } from '../figure.js';
import { neonCity, desert, underSea, snowPeaks } from '../worlds1.js';
import { moon, inkComic, chromeStudio, dataWorld } from '../worlds2.js';

export const SPEED = 2.6;
const T0 = bar(SEC.films[0]), T1 = bar(SEC.films[1]);

export function createFilms(sh) {
  const scene = new THREE.Scene(); scene.environment = sh.env;
  const camera = new THREE.PerspectiveCamera(34, W / H, 0.05, 900);
  const hero = createFigure(); hero.root.rotation.y = Math.PI / 2; scene.add(hero.root);
  const worlds = [neonCity(), desert(), underSea(), snowPeaks(), moon(), inkComic(), chromeStudio(), dataWorld()];
  worlds.forEach((w) => { w.group.visible = false; scene.add(w.group); });
  let cur = -1;

  function orbit(t) {
    const f = ease.inOutSine(prog(t, T0, T1)), th = 0.1 + 0.95 * f, d = 4.4 - 0.5 * f;
    const lead = 0.85 * (1 - f * 0.7);
    return { pos: new THREE.Vector3(Math.sin(th) * d + Math.sin(t * 1.3) * 0.02, 1.12 - 0.2 * f + Math.sin(t * 2.1) * 0.015, Math.cos(th) * d), tgt: new THREE.Vector3(lead, 1.0, 0), fov: 34 };
  }

  // Draw one frame of a world: which world, where the run cycle is, how far the world has slid, the camera.
  function drive({ t, world, phase, travel, cam, pose = null }) {
    if (world !== cur) {
      worlds.forEach((w, i) => { w.group.visible = i === world; });
      worlds[world].setup(scene); cur = world;
    }
    const w = worlds[world];
    hero.setStyle(w.style, -99);
    if (w.style === 'line') hero.line.uniforms.glow.value = 1.7;
    hero.setPose(pose ?? run(phase));
    w.update(t, travel);
    camera.position.copy(cam.pos); camera.lookAt(cam.tgt); camera.fov = cam.fov; camera.updateProjectionMatrix();
  }

  return {
    scene, camera, hero, drive, worlds, orbit,
    update(t) {
      const i = clamp(Math.floor((t - T0) / 2), 0, 7);
      drive({ t, world: i, phase: (t - T0) / 1.0, travel: SPEED * (t - T0) + i * 41, cam: orbit(t) });
    },
    look(t) { return { ...worlds[cur].look }; },
  };
}
