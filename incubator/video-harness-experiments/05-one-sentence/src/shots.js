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
// 'depth': distance from the camera as brightness (near white, far black), linear between the shot's near and far
// planes. 'lines': the scene's creases and outlines in white over black, hidden lines removed.
const DEPTH = new THREE.ShaderMaterial({ uniforms: { near: { value: 0.4 }, far: { value: 3.2 } }, toneMapped: false,
  vertexShader: 'varying float vZ; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vZ = -mv.z; gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform float near, far; varying float vZ; void main(){ float d = 1.0 - clamp((vZ - near) / (far - near), 0.0, 1.0); gl_FragColor = vec4(vec3(d), 1.0); }' });
const OCCLUDER = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
const LINE = new THREE.LineBasicMaterial({ color: 0xffffff, toneMapped: false });
const edgeCache = new Map();
export function renderMask(i, u, what) {
  if (what === 'depth' || what === 'lines') return renderStructure(i, u, what);
  const s = sets[i], t = CUE.sets[i] + 2 + u;
  if (s.shoe) s.shoe.paint(RUNNER);
  s.update(t, u); const camera = s.shot(u);
  const accent = s.shoe.materials.accent, inShoe = new Set(); s.shoe.group.traverse((o) => inShoe.add(o));
  const saved = [], bg = s.scene.background, fog = s.scene.fog;
  s.scene.traverse((o) => {
    if (!o.isMesh && !o.isPoints && !o.isLine && !o.isSprite) return;
    saved.push([o, o.material]);
    // 'stage': the small set pieces around the shoe (turntable, ring), so a generated frame's object outline can drop them.
    const small = () => { o.geometry.computeBoundingSphere(); return o.geometry.boundingSphere.radius * Math.max(o.scale.x, o.scale.y, o.scale.z) < 1; };
    const hit = what === 'stripe' ? o.material === accent : what === 'stage' ? !inShoe.has(o) && small() : inShoe.has(o);
    o.material = hit ? WHITE : BLACK;
  });
  s.scene.background = new THREE.Color(0x000000); s.scene.fog = null;
  const R = E.renderer; R.setRenderTarget(null); R.render(s.scene, camera);
  saved.forEach(([o, m]) => (o.material = m)); s.scene.background = bg; s.scene.fog = fog;
  return { ok: true };
}

function renderStructure(i, u, what) {
  const s = sets[i], t = CUE.sets[i] + 2 + u;
  if (s.shoe) s.shoe.paint(RUNNER);
  s.update(t, u); const camera = s.shot(u);
  const saved = [], added = [], bg = s.scene.background, fog = s.scene.fog, all = [];
  s.scene.traverse((o) => all.push(o)); // collect first: lines added below must not be visited (and hidden) by this pass
  all.forEach((o) => {
    if (o.isPoints || o.isSprite || o.isLine) { saved.push([o, 'visible', o.visible]); o.visible = false; return; }
    if (!o.isMesh) return;
    const glow = o.material && o.material.blending === THREE.AdditiveBlending;   // light-only planes have no surface
    saved.push([o, 'material', o.material]);
    if (glow) { saved.push([o, 'visible', o.visible]); o.visible = false; return; }
    o.material = what === 'depth' ? DEPTH : OCCLUDER;
    if (what === 'lines') {
      let g = edgeCache.get(o.geometry); if (!g) { g = new THREE.EdgesGeometry(o.geometry, 28); edgeCache.set(o.geometry, g); }
      const l = new THREE.LineSegments(g, LINE); o.add(l); added.push([o, l]);
    }
  });
  // Depth range fitted to the subject: from just in front of the shoe to a little behind the plinth, so its shape reads.
  if (s.shoe) { const sp = new THREE.Box3().setFromObject(s.shoe.group).getBoundingSphere(new THREE.Sphere()); const d = camera.position.distanceTo(sp.center); DEPTH.uniforms.near.value = d - sp.radius * 1.6; DEPTH.uniforms.far.value = d + sp.radius * 3.5; }
  s.scene.background = new THREE.Color(0x000000); s.scene.fog = null;
  const R = E.renderer; R.setRenderTarget(null); R.render(s.scene, camera);
  added.forEach(([o, l]) => o.remove(l));
  saved.reverse().forEach(([o, k, v]) => (o[k] = v)); s.scene.background = bg; s.scene.fog = fog;
  return { ok: true };
}
