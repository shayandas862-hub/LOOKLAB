// Frame f → pixels. t = f / FPS is the only input. Picks the scene for t, sets the finishing chain from the drum
// hits and the scene's look, measures the true HUD values (lens, camera speed), renders, lays the type over it.
import { FPS, CUE, bar, SEC, mmOf } from './timeline.js';
import { createEngine, studioEnv } from './engine.js';
import { pulseAt } from './pulse.js';
import { createOverlay } from './overlay.js';
import { SET_BUILDERS } from './sets.js';
import { createBrief } from './scenes/brief.js';
import { createMake } from './scenes/make.js';
import { createPlan } from './scenes/plan.js';
import { createEdit } from './scenes/edit.js';
import { createWorld } from './scenes/world.js';
import { createEnd } from './scenes/end.js';

let E, overlay, timeline;
export async function init(canvas, overlayRoot) {
  await Promise.all(['400 20px Anton', '400 20px "JetBrains Mono"', '700 20px "JetBrains Mono"'].map((f) => document.fonts.load(f, 'Aa')));
  E = createEngine(canvas);
  const shared = { renderer: E.renderer, env: studioEnv(E.renderer) };
  const sets = SET_BUILDERS.map((b) => b(shared));
  // [start time, scene]: the last entry whose start ≤ t is drawn.
  const edit = await createEdit(shared, sets);
  timeline = [[0, createBrief(shared)], [bar(SEC.plan[0]), createPlan(shared)], [bar(SEC.make[0]), createMake(shared, sets)],
    [bar(SEC.check[0]), edit], [bar(SEC.world[0]), createWorld(shared, sets)], [CUE.finalHit, createEnd(shared)]];
  overlay = createOverlay(overlayRoot);
  return { ok: true, scenes: timeline.length, measured: { dBad: edit.measured.dBad, dFixed: edit.measured.dFixed, pixels: [edit.measured.ref.pixels, edit.measured.bad.pixels, edit.measured.fixed.pixels], speeds: edit.measured.speeds } };
}

const pick = (t) => timeline.reduce((s, [t0, sc]) => (t >= t0 ? sc : s), timeline[0][1]);

export function renderFrame(f) {
  const t = f / FPS, s = pick(t), p = pulseAt(t, f);
  s.update(Math.max(0, t - 1 / FPS)); const prev = s.camera.position.clone();
  s.update(t);
  const speed = s.camera.position.distanceTo(prev) * FPS;
  E.pass.active = s; E.pass.t = t; E.pass.k = s.blur?.(t) ?? 1;
  const look = s.look?.(t) ?? {};
  look.hud = { f, bar: Math.floor(t / 2) + 1, beat: Math.floor((t % 2) / 0.5) + 1, mm: mmOf(s.camera.fov), speed };
  const g = E.grade;
  g.frame.value = f % 997; g.punch.value = p.punch; g.shake.value.set(...p.shake);
  g.chroma.value = Math.max(p.chroma, look.chroma ?? 0);
  g.flash.value = Math.max(p.flash, look.flash ?? 0); g.flashCol.value.set(look.flashCol ?? '#ffffff');
  g.contrast.value = look.contrast ?? 1.05; g.sat.value = look.sat ?? 1; g.gain.value.set(look.gain ?? '#ffffff'); g.lift.value.set(look.lift ?? '#000000');
  g.halftone.value = look.halftone ?? 0; g.scan.value = look.scan ?? 0; g.mono.value = look.mono ?? 0; g.vig.value = look.vig ?? 0.35;
  g.noise.value = look.noise ?? 0; g.noiseStep.value = look.noiseStep ?? 0;
  g.fade.value = look.fade ?? 1;
  E.bloom.strength = look.bloom ?? 0.5;
  E.renderer.toneMappingExposure = look.exposure ?? 1;
  E.composer.render();
  overlay(t, look);
  return t;
}

export function probe(f) {
  const t = f / FPS, s = pick(t);
  s.update(t);
  const e = s.camera.matrixWorld.elements, l = Math.hypot(e[8], e[9], e[10]);
  return { scene: timeline.findIndex(([, sc]) => sc === s), pos: s.camera.position.toArray(), dir: [-e[8] / l, -e[9] / l, -e[10] / l] };
}
