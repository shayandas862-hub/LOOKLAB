// Act 1: the brief as a cloud of dust in a single beam; then every mote rushes into the wall.
import * as THREE from 'three';
import { T, C } from './timeline.js';
import { ease, prog, hash, lerp } from './util.js';
import { tilePosition, COLS, ROWS } from './wall.js';

const N = 4800;

function sprite() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function createParticles(scene) {
  const pos = new Float32Array(N * 3), colr = new Float32Array(N * 3);
  const home = [], target = [];
  const v = new THREE.Vector3(), bone = new THREE.Color(C.bone), sig = new THREE.Color(C.signalHex).multiplyScalar(2.2);
  for (let i = 0; i < N; i++) {
    // An ellipsoid of dust, denser in the beam's core.
    const r = Math.pow(hash(i, 1), 0.9) * 3.6, a = hash(i, 2) * Math.PI * 2, y = (hash(i, 3) - 0.5) * 5.2;
    home.push([Math.cos(a) * r, 2.3 + y, Math.sin(a) * r * 0.8 - 1]);
    target.push(tilePosition(Math.floor(hash(i, 4) * COLS * ROWS), v).toArray());
    (hash(i, 5) < 0.12 ? sig : bone).toArray(colr, i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colr, 3));
  const mat = new THREE.PointsMaterial({ size: 0.08, map: sprite(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  // The beam: an open cone, brighter at its source, fading to nothing.
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { k: { value: 1 }, col: { value: new THREE.Color(1.0, 0.86, 0.72) } },
    vertexShader: 'varying vec2 vUv; varying vec3 vN, vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float k; uniform vec3 col; varying vec2 vUv; varying vec3 vN, vV; void main(){ float edge = pow(abs(dot(vN, vV)), 2.2); float along = pow(vUv.y, 1.6); gl_FragColor = vec4(col * edge * along * 0.75 * k, 1.0); }',
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 3.0, 11, 48, 1, true), beamMat);
  beam.position.set(0.4, 6.3, -1); beam.rotation.z = 0.08; scene.add(beam);
  const spot = new THREE.PointLight(0xffd9b0, 18, 12, 1.6); spot.position.set(0.4, 7, -1); scene.add(spot);

  return function update(t) {
    const on = t < T.tilesIn[1] + 0.1;
    points.visible = on; beam.visible = t < T.rush[1];
    spot.intensity = 18 * (1 - prog(t, T.rush[0], T.rush[1]));
    beamMat.uniforms.k.value = ease.outCubic(prog(t, 0.0, 1.4)) * (1 - prog(t, T.rush[0], T.rush[0] + 0.5));
    if (!on) return;
    for (let i = 0; i < N; i++) {
      const h = home[i], tg = target[i];
      const sw = 0.18 + hash(i, 6) * 0.2, ph = hash(i, 7) * 6.28;
      const dx = Math.sin(t * sw + ph) * 0.35, dy = Math.sin(t * sw * 0.8 + ph * 1.3) * 0.25 + t * 0.04, dz = Math.cos(t * sw * 0.9 + ph) * 0.3;
      const d = hash(i, 8) * 0.35;
      const k = ease.inExpo(prog(t, T.rush[0] + d, T.rush[1] + d * 0.4));
      pos[i * 3] = lerp(h[0] + dx, tg[0], k);
      pos[i * 3 + 1] = lerp(h[1] + dy, tg[1], k);
      pos[i * 3 + 2] = lerp(h[2] + dz, tg[2] + 0.05, k);
    }
    mat.opacity = 1 - prog(t, T.tilesIn[0] + 0.1, T.tilesIn[1]);
    geo.attributes.position.needsUpdate = true;
  };
}
