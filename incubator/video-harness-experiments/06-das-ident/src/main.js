// The page's entry: builds the engine and the ident, and renders frame f on request.
import * as THREE from 'three';
import { FPS } from './timeline.js';
import { createEngine } from './engine.js';
import { createIdent } from './ident.js';

let E, ident;
export async function init(canvas) {
  await document.fonts.ready;
  E = createEngine(canvas);
  ident = await createIdent(E.renderer);
  E.pass.active = ident; E.pass.k = 3;
  return { ok: true };
}

export function renderFrame(f) {
  const t = f / FPS; ident.update(t); const L = ident.look(), g = E.grade;
  E.pass.t = t;
  E.bloom.strength = 0.4 + 0.6 * L.hit; E.bloom.radius = 0.7; E.bloom.threshold = 1.9; // only hot things glow: the molten D, sparks, the hits
  g.frame.value = f; g.grain.value = 0.03; g.vig.value = 0.42; g.contrast.value = 1.06; g.sat.value = 1.04;
  g.gain.value.set('#FFFFFF'); g.lift.value.setRGB(0.004, 0.003, 0.004);
  g.flash.value = 0.12 * Math.pow(L.redHit, 3); g.flashCol.value.set('#FFF4E6');
  g.streak.value = L.streak; g.streakPos.value.set(...L.streakPos);
  g.chroma.value = 0.004 * L.redHit; g.punch.value = 0.012 * L.redHit;
  g.fade.value = L.fade * L.inFade;
  E.composer.render();
  return t;
}

export function probe(f) {
  ident.update(f / FPS); const c = ident.camera, e = c.matrixWorld.elements, l = Math.hypot(e[8], e[9], e[10]);
  return { scene: 0, pos: c.position.toArray(), dir: [-e[8] / l, -e[9] / l, -e[10] / l] };
}
