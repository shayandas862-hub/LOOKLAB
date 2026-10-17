// The passes the AI steps and the checker need, drawn from the same set as the previs (after Test 1b's ref.js):
//   depth        distance as brightness, near white, far black (inverse depth, like a depth estimator's); the glass
//                is left out, as an estimator sees the food through it
//   mask:<part>  that part white, everything else black (parts: bowl, tops, plinth, honey, float)
import * as THREE from 'three';

const DEPTH = new THREE.ShaderMaterial({ uniforms: { near: { value: 1 }, far: { value: 40 } }, toneMapped: false, side: THREE.DoubleSide,
  vertexShader: '#include <clipping_planes_pars_vertex>\nvarying float vZ; void main(){ vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); vZ = -mvPosition.z; gl_Position = projectionMatrix * mvPosition;\n#include <clipping_planes_vertex>\n}',
  fragmentShader: '#include <clipping_planes_pars_fragment>\nuniform float near, far; varying float vZ; void main(){\n#include <clipping_planes_fragment>\nfloat d = clamp((1.0 / max(vZ, 1e-3) - 1.0 / far) / (1.0 / near - 1.0 / far), 0.0, 1.0); gl_FragColor = vec4(vec3(d), 1.0); }' });
DEPTH.clipping = true;
const WHITE = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false, side: THREE.DoubleSide });
const BLACK = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false, side: THREE.DoubleSide });

// A layer that is still filling is cut by a clipping plane; its stand-in material must be cut the same way.
const clipped = new Map();
function standIn(base, planes) {
  if (!planes?.length) return base;
  const key = base.uuid + planes[0].uuid;
  if (!clipped.has(key)) { const m = base.clone(); m.clippingPlanes = planes; if (base === DEPTH) m.uniforms = DEPTH.uniforms; clipped.set(key, m); }
  return clipped.get(key);
}

export function renderPass(renderer, set, what) {
  const { scene, camera, parts } = set, [kind, part] = what.split(':');
  const hero = new Set();
  if (kind === 'mask') [parts[part]].flat().forEach((g) => g.traverse((o) => hero.add(o)));
  const saved = [];
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (o.material.isShadowMaterial || (kind === 'depth' && o.userData.glass)) { saved.push([o, 'visible', o.visible]); o.visible = false; return; }
    saved.push([o, 'material', o.material]);
    const base = kind === 'depth' ? DEPTH : hero.has(o) ? WHITE : BLACK;
    o.material = standIn(base, o.material.clippingPlanes);
  });
  DEPTH.uniforms.near.value = Math.max(0.2, camera.position.distanceTo(new THREE.Vector3(0, 0.4, 0)) * 0.5);
  const bg = scene.background; scene.background = new THREE.Color(0x000000);
  renderer.setRenderTarget(null); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  saved.reverse().forEach(([o, k, v]) => (o[k] = v)); scene.background = bg;
}
