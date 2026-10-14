// Small builders the eight film worlds share: endless scrolling, canvas textures, gradient skies, particles.
import * as THREE from 'three';
import { hash } from './util.js';

// Wrap x into a window of width `span` centred on `mid`, so props loop forever as the world slides by.
export const wrap = (x, span, mid = 0) => ((((x - mid + span / 2) % span) + span) % span) - span / 2 + mid;

export function canvasTex(w, h, draw, { repeat = null, srgb = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); }
  t.anisotropy = 4; return t;
}

// A sky dome: vertical gradient, optional sun glow.
export function sky(bottom, top, { sun = null, sunCol = '#FFB070', power = 0.8, radius = 400 } = {}) {
  const m = new THREE.ShaderMaterial({
    uniforms: { a: { value: new THREE.Color(bottom) }, b: { value: new THREE.Color(top) }, sd: { value: sun ? new THREE.Vector3(...sun).normalize() : new THREE.Vector3(0, -1, 0) }, sc: { value: new THREE.Color(sunCol) }, p: { value: power } },
    side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 a, b, sd, sc; uniform float p; varying vec3 vD;
      void main(){ float h = clamp(vD.y, 0.0, 1.0); vec3 c = mix(a, b, pow(h, p)); float s = max(dot(vD, sd), 0.0);
        c += sc * (pow(s, 600.0) * 6.0 + pow(s, 12.0) * 0.6); gl_FragColor = vec4(c, 1.0); }`,
  });
  const s = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 16), m); s.frustumCulled = false; return s;
}

// Instanced props that scroll with the world. items: [{x, y, z, sx, sy, sz, ry}] in a loop of length `span`.
export function scrolling(geo, mat, items, span, { shadow = false } = {}) {
  const mesh = new THREE.InstancedMesh(geo, mat, items.length); mesh.frustumCulled = false;
  mesh.castShadow = shadow; mesh.receiveShadow = shadow;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  return {
    mesh,
    update(travel, extra = null) {
      items.forEach((it, i) => {
        const o = extra ? extra(it, i) : null;
        p.set(wrap(it.x - travel * (it.par ?? 1), span), it.y + (o?.y ?? 0), it.z); q.setFromEuler(e.set(o?.rx ?? 0, it.ry ?? 0, o?.rz ?? 0));
        mesh.setMatrixAt(i, m4.compose(p, q, s.set(it.sx ?? 1, (it.sy ?? 1) * (o?.sy ?? 1), it.sz ?? 1)));
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}

// Deterministic list of n items from a generator.
export const many = (n, seed, f) => Array.from({ length: n }, (_, i) => f((k) => hash(i * 13 + k, seed), i));

// Points on a sphere shell: stars.
export function stars(n = 3000, r = 300, size = 1.6) {
  const g = new THREE.BufferGeometry(), p = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = hash(i, 71) * 2 - 1, a = hash(i, 72) * Math.PI * 2, s = Math.sqrt(1 - u * u);
    p.set([Math.cos(a) * s * r, Math.abs(u) * r * 0.9 + 5, Math.sin(a) * s * r], i * 3);
  }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: '#ffffff', size, sizeAttenuation: false, fog: false }));
  pts.frustumCulled = false; return pts;
}

// A key light with a shadow box that follows the hero.
export function sunLight(color, intensity, dir, { size = 6, map = 2048 } = {}) {
  const l = new THREE.DirectionalLight(color, intensity); l.position.set(...dir); l.castShadow = true;
  l.shadow.mapSize.set(map, map); Object.assign(l.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 0.5, far: 60 });
  l.shadow.bias = -0.0004; l.shadow.normalBias = 0.03; l.target.position.set(0, 0, 0);
  return l;
}

// A soft radial glow drawn in the shader (no 8-bit gradient, so no banding), dithered. Opaque by default so glass
// in front of it can refract it.
export function glow(color, { intensity = 1, falloff = 2.2, transparent = false } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { c: { value: new THREE.Color(color) }, k: { value: intensity }, f: { value: falloff } },
    transparent, depthWrite: !transparent, blending: transparent ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 c; uniform float k, f; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main(){ float r = length(vUv - 0.5) * 2.0; float a = exp(-r * r * f * 2.0) * k + (h(gl_FragCoord.xy) - 0.5) / 255.0;
        gl_FragColor = vec4(c * max(a, 0.0), 1.0); }`,
  });
}
