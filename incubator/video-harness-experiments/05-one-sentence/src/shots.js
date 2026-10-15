// One finished shot, clean: the set filmed by its own camera with the full finishing chain, but no on-screen numbers,
// no lane effects and no beat punctuation. Used to make starting frames for image-to-video tests (../07-grok-test).
import { CUE } from './timeline.js';
import { createEngine, studioEnv } from './engine.js';
import { SET_BUILDERS, RUNNER } from './sets.js';

let E, sets;
export async function init(canvas) {
  E = createEngine(canvas);
  const shared = { renderer: E.renderer, env: studioEnv(E.renderer) };
  sets = SET_BUILDERS.map((b) => b(shared));
  return { ok: true, shots: sets.length };
}

// Shot i (0 dune, 1 stride, 2 product, 3 city) at u seconds into its 4 s move, as the CHECK gallery shows it.
export function renderShot(i, u) {
  const s = sets[i], t = CUE.sets[i] + 2 + u;
  if (s.shoe) s.shoe.paint(RUNNER);
  if (s.text) s.text.uOn.value = 0;
  s.update(t, u); const camera = s.shot(u);
  E.pass.active = { scene: s.scene, camera, update: () => { s.update(t, u); s.shot(u); } }; E.pass.t = t; E.pass.k = 1;
  const g = E.grade;
  g.flash.value = 0; g.punch.value = 0; g.shake.value.set(0, 0); g.chroma.value = 0; g.halftone.value = 0; g.scan.value = 0; g.mono.value = 0;
  g.noise.value = 0; g.fade.value = 1; g.contrast.value = 1.05; g.sat.value = 1; g.gain.value.set('#ffffff'); g.lift.value.set('#000000'); g.vig.value = 0.3; g.grain.value = 0.02;
  E.bloom.strength = 0.5; E.renderer.toneMappingExposure = 1;
  E.composer.render();
  return { mm: Math.round(12 / Math.tan((camera.fov * Math.PI) / 360)) };
}

// Masks for measuring a generated clip against the shot: 'stripe' draws only the shoe's orange accents white,
// 'shoe' draws the whole shoe white; everything else is black. Unlit, no tone mapping, straight to the canvas.
import * as THREE from 'three';
const WHITE = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), BLACK = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false });
export function renderMask(i, u, what) {
  const s = sets[i], t = CUE.sets[i] + 2 + u;
  if (s.shoe) s.shoe.paint(RUNNER);
  s.update(t, u); const camera = s.shot(u);
  const accent = s.shoe.materials.accent, inShoe = new Set(); s.shoe.group.traverse((o) => inShoe.add(o));
  const saved = [], bg = s.scene.background, fog = s.scene.fog;
  s.scene.traverse((o) => {
    if (!o.isMesh && !o.isPoints && !o.isLine && !o.isSprite) return;
    saved.push([o, o.material]);
    const hit = what === 'stripe' ? o.material === accent : inShoe.has(o);
    o.material = hit ? WHITE : BLACK;
  });
  s.scene.background = new THREE.Color(0x000000); s.scene.fog = null;
  const R = E.renderer; R.setRenderTarget(null); R.render(s.scene, camera);
  saved.forEach(([o, m]) => (o.material = m)); s.scene.background = bg; s.scene.fog = fog;
  return { ok: true };
}
