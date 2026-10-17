// Film 4's last shot (STEP INSIDE, ../04-action/src/scenes/inside.js) for Test 1b, at any time t (s):
//   renderClean(t)          the code's own frame: the scene's look (bloom, contrast, vignette), no beat effects, no type
//   renderPass(t, 'depth')  distance as brightness, near white, far black (inverse depth, like a depth estimator's)
//   renderPass(t, 'runner') the runner white, everything else black (what hides the runner hides it here too)
// Film 4's code is imported as it is; nothing in it is changed.
import * as THREE from 'three';
import { createEngine, studioEnv } from '../04-action/src/engine.js';
import { createFilms } from '../04-action/src/scenes/films.js';
import { createInside } from '../04-action/src/scenes/inside.js';

let E, inside, hero;
export async function init(canvas) {
  E = createEngine(canvas);
  const shared = { renderer: E.renderer, env: studioEnv(E.renderer) };
  inside = createInside(shared, createFilms(shared));
  // The runner is the scene's one figure: a group whose hips sit 0.98 m up (figure.js).
  const found = inside.scene.children.filter((o) => o.isGroup && o.children[0]?.isGroup && Math.abs(o.children[0].position.y - 0.98) < 1e-9);
  if (found.length !== 1) throw new Error(`expected one runner, found ${found.length}`);
  hero = found[0];
  return { ok: true };
}

export function renderClean(t) {
  inside.update(t);
  E.pass.active = inside; E.pass.t = t; E.pass.k = 1;
  const g = E.grade, look = inside.look(t);
  g.frame.value = Math.round(t * 24) % 997; g.punch.value = 0; g.shake.value.set(0, 0); g.chroma.value = 0; g.flash.value = 0;
  g.contrast.value = look.contrast ?? 1.05; g.sat.value = 1; g.gain.value.set('#ffffff'); g.lift.value.set('#000000');
  g.halftone.value = 0; g.scan.value = 0; g.mono.value = 0; g.vig.value = look.vig ?? 0.35; g.fade.value = 1;
  E.bloom.strength = look.bloom ?? 0.5; E.renderer.toneMappingExposure = 1;
  E.composer.render();
  return { ok: true };
}

// Inverse depth between `near` and `far` (m): 1 at near, 0 at far. near follows the runner (half its distance), so
// the runner reads about mid-grey all the way through the move, as a depth estimator would show it.
const DEPTH = new THREE.ShaderMaterial({ uniforms: { near: { value: 1 }, far: { value: 400 } }, toneMapped: false, side: THREE.DoubleSide,
  vertexShader: 'varying float vZ; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vZ = -mv.z; gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform float near, far; varying float vZ; void main(){ float d = clamp((1.0 / max(vZ, 1e-3) - 1.0 / far) / (1.0 / near - 1.0 / far), 0.0, 1.0); gl_FragColor = vec4(vec3(d), 1.0); }' });
const WHITE = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, side: THREE.DoubleSide });
const BLACK = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false, side: THREE.DoubleSide });

export function renderPass(t, what) {
  inside.update(t);
  const s = inside.scene, camera = inside.camera, inHero = new Set(); hero.traverse((o) => inHero.add(o));
  const saved = [], all = []; s.traverse((o) => all.push(o));
  all.forEach((o) => {
    if (o.isPoints || o.isSprite || o.isLine) { saved.push([o, 'visible', o.visible]); o.visible = false; return; }
    if (!o.isMesh) return;
    const glow = o.material && o.material.blending === THREE.AdditiveBlending;   // light-only planes have no surface
    saved.push([o, 'material', o.material]);
    if (glow) { saved.push([o, 'visible', o.visible]); o.visible = false; return; }
    o.material = what === 'depth' ? DEPTH : inHero.has(o) ? WHITE : BLACK;
  });
  const centre = hero.position.clone().add(new THREE.Vector3(0, 1, 0));
  DEPTH.uniforms.near.value = Math.max(0.2, camera.position.distanceTo(centre) * 0.5);
  const bg = s.background, fog = s.fog; s.background = new THREE.Color(0x000000); s.fog = null;
  const R = E.renderer; R.setRenderTarget(null); R.setClearColor(0x000000, 1); R.clear(); R.render(s, camera);
  saved.reverse().forEach(([o, k, v]) => (o[k] = v)); s.background = bg; s.fog = fog;
  return { ok: true, heroVisible: hero.visible };
}
