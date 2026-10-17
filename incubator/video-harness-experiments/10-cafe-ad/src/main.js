// Frame f → pixels. t = f / FPS is the only input: the set moves everything, the overlay writes the previs labels
// and the end card's placeholder type.
import { FPS, INK, COPY, CUE, span } from './timeline.js';
import { createEngine } from './engine.js';
import { createSet } from './scene.js';
import { renderPass as drawPass } from './passes.js';

let E, set, hud, card, note;
export async function init(canvas, overlay) {
  E = createEngine(canvas);
  set = createSet(E.env);
  E.pass.scene = set.scene; E.pass.camera = set.camera;
  hud = overlay.querySelector('#hud'); card = overlay.querySelector('#card'); note = overlay.querySelector('#note');
  card.querySelector('.name').style.color = INK;
  card.querySelector('.name').textContent = COPY.name;
  card.querySelector('.line').textContent = COPY.line;
  card.querySelector('.place').textContent = COPY.place;
  note.textContent = COPY.note;
  return { ok: true };
}

export const renderFrame = (f) => renderAt(f / FPS, f);

// The finished picture at any time t (the passes sample at fal's 16 fps, not the previs's 24).
export function renderAt(t, f = Math.round(t * FPS)) {
  const shot = set.update(t);
  E.grade.frame.value = f % 997;
  E.composer.render();
  hud.textContent = `PREVIS · ${shot.id} ${shot.name} · ${shot.lens} mm · ${t.toFixed(2)} s`;
  const k = span(t, CUE.logo, CUE.logo + 0.6);
  card.style.opacity = note.style.opacity = k; card.style.transform = `translateY(${(1 - k) * 18}px)`;
  return t;
}

// One pass at time t (seconds): 'depth' or 'mask:<part>' (see passes.js). Drawn straight to the canvas, no grade.
export function renderPass(t, what) {
  set.update(t);
  drawPass(E.renderer, set, what);
  hud.textContent = ''; card.style.opacity = note.style.opacity = 0;
  return t;
}
