// Frame f → pixels. t = f / FPS is the only input.
import { FPS, T } from './timeline.js';
import { ease, prog } from './util.js';
import { createWorld } from './world.js';
import { createSet } from './set.js';
import { createLighting } from './lighting.js';
import { createCharacter } from './character.js';
import { createSlate, createViewfinder } from './props.js';
import { cameraAt } from './shots.js';
import { createOverlay } from './overlay.js';

let w, overlay;

export async function init(canvas, overlayRoot) {
  await Promise.all(['300 20px Fraunces', 'italic 300 20px Fraunces', '400 20px Fraunces', 'italic 400 20px Fraunces',
    '600 20px "Schibsted Grotesk"', '500 20px "Schibsted Grotesk"'].map((f) => document.fonts.load(f, 'Aaé·')));
  w = createWorld(canvas);
  const ups = [createSet(w.scene), createLighting(w.scene, w.renderer)];
  const dir = createCharacter(w.scene, 'dir'), actor = createCharacter(w.scene, 'actor');
  ups.push((t) => dir.update(t), (t) => actor.update(t), createSlate(w.camera), createViewfinder(dir.root));
  w.accum.setTime = (t) => {
    for (const u of ups) u(t);
    const c = cameraAt(t);
    w.camera.position.set(...c.pos); w.camera.lookAt(...c.tgt); w.camera.fov = c.fov; w.camera.updateProjectionMatrix();
    w.shot = c;
  };
  overlay = createOverlay(overlayRoot);
  return { ok: true };
}

export function renderFrame(f) {
  const t = f / FPS;
  const c = cameraAt(t);
  w.accum.t = t; w.accum.k = c.k;
  const b = w.bokeh.uniforms;
  b.focus.value = c.focus; b.aperture.value = c.ap; b.maxblur.value = 0.014;
  const u = w.finish.uniforms;
  u.frame.value = f % 997; u.bars.value = c.letterbox;
  u.fade.value = ease.outCubic(prog(t, 0, 0.6)) * (1 - ease.inCubic(prog(t, T.fade[0], T.fade[1])));
  u.lift.value = 0.12 * ease.inOutCubic(prog(t, 37.4, 38.4));
  w.composer.render();
  overlay(t);
  return c.k;
}
