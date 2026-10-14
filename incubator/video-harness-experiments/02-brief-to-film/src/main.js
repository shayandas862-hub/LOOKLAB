// Frame f → pixels. t = f / FPS is the only input; every module is a pure function of t.
import { FPS, DURATION, T, ACT } from './timeline.js';
import { prog, ease, impulse } from './util.js';
import { createWorld } from './world.js';
import { createParticles } from './particles.js';
import { createWall } from './wall.js';
import { createTracks } from './tracks.js';
import { createFinale } from './finale.js';
import { placeCamera, samplesAt } from './camera.js';
import { drawOverlay } from './overlay.js';

let world;

const FONTS = ['900 20px "Mona Sans"', '800 20px "Mona Sans"', '400 20px "Mona Sans"', 'italic 400 20px "Mona Sans"',
  '300 20px "Martian Mono"', '400 20px "Martian Mono"', '500 20px "Martian Mono"', '600 20px "Martian Mono"', '700 20px "Martian Mono"'];

export async function init(canvas) {
  await Promise.all(FONTS.map((f) => document.fonts.load(f, 'AaΔ→·↳')));
  let envelope;
  try { envelope = await (await fetch('./src/envelope.json')).json(); }
  catch { envelope = Array.from({ length: DURATION * 30 }, (_, i) => 0.3 + 0.3 * Math.abs(Math.sin(i * 0.4))); }
  world = createWorld(canvas);
  const ups = [createParticles(world.scene), createWall(world.scene), createTracks(world.scene, envelope), createFinale(world.scene)];
  world.accum.setTime = (t) => { for (const u of ups) u(t); placeCamera(world.camera, t); };
  return { ok: true };
}

export function renderFrame(f) {
  const t = f / FPS, { accum, finish, overlay, overlayTex, composer, bloom } = world;
  accum.t = t; accum.k = samplesAt(t);
  drawOverlay(overlay, t, f); overlayTex.needsUpdate = true;
  const u = finish.uniforms;
  u.frame.value = f % 997;
  u.flash.value = Math.min(0.7, impulse(t, [[ACT.engines[0], 0.22, 0.07], [ACT.clock[0], 0.12, 0.06], [ACT.film[0], 0.5, 0.1]]));
  u.ca.value = 0.0012 + impulse(t, [[ACT.engines[0], 0.01, 0.12], [T.whip[0] + 0.33, 0.012, 0.15], [ACT.film[0], 0.016, 0.2]]);
  u.fade.value = ease.outCubic(prog(t, 0, 0.35)) * (1 - ease.inCubic(prog(t, T.fade[0], T.fade[1])));
  bloom.strength = 0.85 + impulse(t, [[ACT.film[0], 0.9, 0.35]]);
  composer.render();
  return accum.k;
}
