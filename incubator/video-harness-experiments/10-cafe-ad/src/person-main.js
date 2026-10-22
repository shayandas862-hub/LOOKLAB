// The person test's page (person.html): the same calls as main.js, so render.mjs drives it unchanged
// (PAGE=person.html node render.mjs passes 0 5 121 --name s6 --fps 24 --passes beauty,depth,mask:person,mask:bowl,mask:head).
import { FPS } from './timeline.js';
import { createEngine } from './engine.js';
import { createPersonSet } from './person.js';
import { renderPass as drawPass } from './passes.js';

let E, set, hud;
export async function init(canvas, overlay) {
  E = createEngine(canvas);
  set = createPersonSet(E.env);
  E.pass.scene = set.scene; E.pass.camera = set.camera;
  hud = overlay.querySelector('#hud');
  return { ok: true };
}

export const renderFrame = (f) => renderAt(f / FPS, f);

export function renderAt(t, f = Math.round(t * FPS)) {
  const shot = set.update(t);
  E.grade.frame.value = f % 997;
  E.composer.render();
  hud.textContent = `PREVIS · ${shot.id} ${shot.name} · ${shot.lens} mm · ${t.toFixed(2)} s · clay stand-in, no face`;
  return t;
}

export function renderPass(t, what) {
  set.update(t);
  drawPass(E.renderer, set, what);
  hud.textContent = '';
  return t;
}
