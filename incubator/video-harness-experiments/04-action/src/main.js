// Frame f → pixels. t = f / FPS is the only input. Picks the scene for t, sets the finishing chain from the
// drum hits (pulse) and the scene's own look, renders, then lays the type over it.
import { FPS, CUE } from './timeline.js';
import { createEngine, studioEnv } from './engine.js';
import { pulseAt } from './pulse.js';
import { createOverlay } from './overlay.js';
import { createGenesis } from './scenes/genesis.js';
import { createFilms } from './scenes/films.js';
import { createSneakerSpot, createPerfumeSpot } from './scenes/spots.js';
import { createFashion, createTag } from './scenes/fashion.js';
import { createCatch } from './scenes/catch.js';
import { createInside } from './scenes/inside.js';
import { createEnd } from './scenes/end.js';
import { bar, SEC } from './timeline.js';

let E, overlay, timeline;
export async function init(canvas, overlayRoot) {
  await Promise.all(['400 20px Anton', '400 20px "JetBrains Mono"', '700 20px "JetBrains Mono"'].map((f) => document.fonts.load(f, 'Aa')));
  E = createEngine(canvas);
  const shared = { renderer: E.renderer, env: studioEnv(E.renderer) };
  const genesis = createGenesis(shared), films = createFilms(shared), sneaker = createSneakerSpot(shared), perfume = createPerfumeSpot(shared), fashion = createFashion(shared), tag = createTag(shared), caught = createCatch(shared, films), inside = createInside(shared, films), end = createEnd(shared);
  // [start time, scene]: the last entry whose start ≤ t is drawn.
  timeline = [[0, genesis], [bar(SEC.films[0]), films], [bar(SEC.sneaker[0]), sneaker], [bar(SEC.perfume[0]), perfume], [bar(SEC.fashion[0]), fashion], [bar(SEC.tag[0]), tag], [bar(SEC.catch[0]), caught], [bar(SEC.inside[0]), inside], [CUE.finalHit, end]];
  overlay = createOverlay(overlayRoot);
  return { ok: true, scenes: timeline.length };
}

const pick = (t) => timeline.reduce((s, [t0, sc]) => (t >= t0 ? sc : s), timeline[0][1]);

export function renderFrame(f) {
  const t = f / FPS, s = pick(t), p = pulseAt(t, f);
  E.pass.active = s; E.pass.t = t; E.pass.k = s.blur?.(t) ?? 1;
  s.update(t);
  const look = s.look?.(t) ?? {};
  const g = E.grade;
  g.frame.value = f % 997; g.punch.value = p.punch; g.shake.value.set(...p.shake); g.chroma.value = Math.max(p.chroma, 0);
  g.chroma.value = Math.max(p.chroma, look.chroma ?? 0);
  g.flash.value = Math.max(p.flash, look.flash ?? 0); g.flashCol.value.set(look.flashCol ?? '#ffffff');
  g.contrast.value = look.contrast ?? 1.05; g.sat.value = look.sat ?? 1; g.gain.value.set(look.gain ?? '#ffffff'); g.lift.value.set(look.lift ?? '#000000');
  g.halftone.value = look.halftone ?? 0; g.scan.value = look.scan ?? 0; g.mono.value = look.mono ?? 0; g.vig.value = look.vig ?? 0.35;
  g.fade.value = look.fade ?? 1;
  E.bloom.strength = look.bloom ?? 0.5;
  E.renderer.toneMappingExposure = look.exposure ?? 1;
  E.composer.render();
  overlay(t, look);
  return t;
}

// For the motion checker: where each frame's camera is and where it looks, without drawing anything.
export function probe(f) {
  const t = f / FPS, s = pick(t);
  s.update(t);
  const e = s.camera.matrixWorld.elements, l = Math.hypot(e[8], e[9], e[10]);
  return { scene: timeline.findIndex(([, sc]) => sc === s), pos: s.camera.position.toArray(), dir: [-e[8] / l, -e[9] / l, -e[10] / l] };
}
