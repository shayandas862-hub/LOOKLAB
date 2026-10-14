// Atmosphere and light for the ident: dust in the air, sparks and shock rings when a petal locks, drifting haze,
// a glow behind the logo, and god rays (the logo occluding that glow, blurred towards the light, added back).
import * as THREE from 'three';
import { W, H } from './timeline.js';
import { hash } from './util.js';

const QUAD_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

// Soft round points with their own size and alpha, additive. Positions and alphas are written each frame.
function pointsMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: { col: { value: new THREE.Color(color) }, scale: { value: H * 0.5 } },
    vertexShader: `attribute float aSize; attribute float aAlpha; varying float vA; uniform float scale;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vA = aAlpha; gl_PointSize = max(1.0, aSize * scale / -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 col; varying float vA;
      void main(){ vec2 p = gl_PointCoord - 0.5; float r = dot(p, p) * 4.0; if (r > 1.0) discard; gl_FragColor = vec4(col * vA * (1.0 - r) * (1.0 - r), 1.0); }`,
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  });
}
function pointCloud(n, color) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute('aSize', new THREE.Float32BufferAttribute(new Float32Array(n), 1));
  g.setAttribute('aAlpha', new THREE.Float32BufferAttribute(new Float32Array(n), 1));
  const pts = new THREE.Points(g, pointsMaterial(color)); pts.frustumCulled = false; return pts;
}

// Dust: slow motes that drift and twinkle, brighter near the light behind the logo.
export function dust(n = 1600) {
  const pts = pointCloud(n, '#FFD9AE'), P = pts.geometry.attributes.position, S = pts.geometry.attributes.aSize, A = pts.geometry.attributes.aAlpha;
  const base = Array.from({ length: n }, (_, i) => [hash(i, 1) * 24 - 12, hash(i, 2) * 14 - 7, hash(i, 3) * 18 - 9, hash(i, 4), hash(i, 5)]);
  return { obj: pts, update(t, glow) {
    base.forEach(([x, y, z, r1, r2], i) => {
      const yy = ((y + t * (0.05 + 0.08 * r1) + 7) % 14) - 7;
      P.setXYZ(i, x + 0.3 * Math.sin(t * 0.3 + r2 * 6.3), yy, z + 0.2 * Math.cos(t * 0.25 + r1 * 6.3));
      S.setX(i, 0.012 + 0.03 * r2 * r2);
      const near = Math.exp(-(x * x + (yy - 0.3) ** 2) / 30);
      A.setX(i, (0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * (1 + 2 * r1) + r2 * 40))) * (0.18 + glow * 0.9 * near));
    });
    P.needsUpdate = S.needsUpdate = A.needsUpdate = true;
  } };
}

// Sparks thrown out when a petal locks: ballistic, with drag, fading; sparks stay at the same seeds every render.
export function sparks(bursts) {
  const n = bursts.reduce((s, b) => s + b.n, 0), pts = pointCloud(n, '#FFB566');
  const P = pts.geometry.attributes.position, S = pts.geometry.attributes.aSize, A = pts.geometry.attributes.aAlpha;
  return { obj: pts, update(t) {
    let i = 0;
    for (const b of bursts) for (let k = 0; k < b.n; k++, i++) {
      const dt = t - b.t, th = hash(k, b.seed) * Math.PI * 2, ph = (hash(k, b.seed + 1) - 0.5) * 2.2, sp = b.speed * (0.3 + hash(k, b.seed + 2));
      if (dt < 0 || dt > b.life) { A.setX(i, 0); continue; }
      const drag = (1 - Math.exp(-dt * 2.2)) / 2.2;
      const v = [Math.cos(th) * Math.cos(ph), Math.sin(ph) * 0.8 + 0.25, Math.sin(th) * Math.cos(ph) * 0.6 + 0.4];
      P.setXYZ(i, b.at.x + v[0] * sp * drag, b.at.y + v[1] * sp * drag - 1.2 * dt * dt, b.at.z + v[2] * sp * drag);
      S.setX(i, 0.02 + 0.03 * hash(k, b.seed + 3)); A.setX(i, 2.2 * Math.pow(1 - dt / b.life, 2));
    }
    P.needsUpdate = S.needsUpdate = A.needsUpdate = true;
  } };
}

// A shock ring in the logo's plane: a thin bright ring that widens and fades.
export function ring(color) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { r: { value: 0 }, a: { value: 0 }, col: { value: new THREE.Color(color) } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform float r, a; uniform vec3 col; varying vec2 vUv;
      void main(){ float d = length(vUv - 0.5) * 2.0; float w = 0.006 + 0.02 * r; float v = exp(-pow((d - r) / w, 2.0)) + 0.2 * exp(-pow((d - r * 0.85) / (w * 5.0), 2.0)); gl_FragColor = vec4(col * v * a, 1.0); }`,
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); m.frustumCulled = false;
  return { obj: m, set(at, size, p) { m.position.copy(at); m.scale.setScalar(size); mat.uniforms.r.value = p; mat.uniforms.a.value = p <= 0 || p >= 1 ? 0 : Math.pow(1 - p, 2) * 0.8; } };
}

// Haze: large soft noise planes at several depths, drifting slowly, so the camera moves through air.
function noiseTexture(seed) {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), img = g.createImageData(S, S);
  const val = (x, y, f) => { const xi = Math.floor(x * f), yi = Math.floor(y * f), xf = x * f - xi, yf = y * f - yi, h = (a, b) => hash((a % f + f) % f + 1000 * seed, (b % f + f) % f), s = (u) => u * u * (3 - 2 * u);
    return (h(xi, yi) * (1 - s(xf)) + h(xi + 1, yi) * s(xf)) * (1 - s(yf)) + (h(xi, yi + 1) * (1 - s(xf)) + h(xi + 1, yi + 1) * s(xf)) * s(yf); };
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const u = x / S, v = y / S, n = 0.5 * val(u, v, 4) + 0.3 * val(u, v, 8) + 0.2 * val(u, v, 16), k = (y * S + x) * 4;
    const e = Math.pow(Math.max(0, n - 0.35) / 0.65, 1.6) * 255; img.data[k] = img.data[k + 1] = img.data[k + 2] = e; img.data[k + 3] = 255;
  }
  g.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
export function haze() {
  // Only behind the logo: haze in front of it greyed the brand colours.
  const layers = [[-7, 0.035], [-3.5, 0.025]].map(([z, a], i) => {
    const tex = noiseTexture(i + 1), mat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color('#C08A62').multiplyScalar(a), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), mat); m.position.z = z; return { m, tex, i, base: a };
  });
  return { objs: layers.map((l) => l.m), update(t, glow) { layers.forEach((l) => { l.tex.offset.set(t * 0.012 * (l.i % 2 ? 1 : -1), t * 0.006); l.m.material.color.set('#C08A62').multiplyScalar(l.base * (0.55 + 0.9 * glow)); }); } };
}

// The light behind the logo, and the god rays it throws past the logo's edges.
export function glowAndRays(renderer) {
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { k: { value: 0 }, col: { value: new THREE.Color('#FF9C55') } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float k; uniform vec3 col; varying vec2 vUv; void main(){ float d = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(col * k * (exp(-d * d * 9.0) * 1.2 + exp(-d * 2.6) * 0.35), 1.0); }',
    blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
  });
  // Behind the red petal as the final camera sees it (parallax worked out for the hero angle), so rays fan from the D.
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), glowMat); glow.position.set(-2.8, 2.05, -8);
  // The rays' source is its own brighter copy of the glow, so the visible glow and the rays are set apart.
  const sunMat = new THREE.ShaderMaterial({ uniforms: { col: { value: new THREE.Color('#FFB070') } }, vertexShader: glowMat.vertexShader, depthWrite: false,
    fragmentShader: 'uniform vec3 col; varying vec2 vUv; void main(){ float d = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(col * (exp(-d * d * 70.0) * 2.4 + exp(-d * 9.0) * 0.25), 1.0); }' });
  const sunScene = new THREE.Scene(), sun = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), sunMat); sun.position.copy(glow.position); sunScene.add(sun);
  const half = { type: THREE.HalfFloatType }, occ = new THREE.WebGLRenderTarget(W / 2, H / 2, half), blur = new THREE.WebGLRenderTarget(W / 2, H / 2, half);
  const black = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const radial = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { tex: { value: occ.texture }, src: { value: new THREE.Vector2(0.5, 0.5) } }, vertexShader: QUAD_VS, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tex; uniform vec2 src; varying vec2 vUv;
      void main(){ vec2 d = (vUv - src) / 72.0 * 0.92; vec2 p = vUv; vec3 acc = vec3(0.0); float w = 1.0;
        for (int i = 0; i < 72; i++) { acc += texture2D(tex, p).rgb * w; w *= 0.972; p -= d; }
        gl_FragColor = vec4(acc / 30.0, 1.0); }`,
  }));
  const add = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: { tex: { value: blur.texture }, k: { value: 0 } }, vertexShader: QUAD_VS, depthTest: false, depthWrite: false, transparent: true,
    blending: THREE.AdditiveBlending, fragmentShader: 'uniform sampler2D tex; uniform float k; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tex, vUv).rgb * k, 1.0); }',
  }));
  const quadCam = new THREE.Camera(), q1 = new THREE.Scene(), q2 = new THREE.Scene(); q1.add(radial); q2.add(add);
  const p = new THREE.Vector3();
  return {
    glow, set(k) { glowMat.uniforms.k.value = k; },
    // After the main render into `rt`: draw the glow with the logo (layer 1) in black on top, blur it radially, add.
    draw(scene, camera, rt, rays) {
      if (rays <= 0.001) return;
      p.copy(glow.position).project(camera); radial.material.uniforms.src.value.set(p.x * 0.5 + 0.5, p.y * 0.5 + 0.5);
      const ac = renderer.autoClear; renderer.autoClear = false;
      renderer.setRenderTarget(occ); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(sunScene, camera);
      const bg = scene.background, fog = scene.fog; scene.background = null; scene.fog = null; scene.overrideMaterial = black;
      camera.layers.set(1); renderer.render(scene, camera); camera.layers.set(0);
      scene.overrideMaterial = null; scene.background = bg; scene.fog = fog;
      renderer.setRenderTarget(blur); renderer.clear(); renderer.render(q1, quadCam);
      add.material.uniforms.k.value = rays; renderer.setRenderTarget(rt); renderer.render(q2, quadCam);
      renderer.autoClear = ac;
    },
  };
}
