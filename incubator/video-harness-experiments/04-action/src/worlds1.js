// Film worlds 1–4: neon city at night, desert at dusk, under the sea, snowy peaks.
// Each returns { group, setup(scene), update(t, travel), look, style }. The hero runs on the spot at the origin
// facing +x; the world slides past in −x.
import * as THREE from 'three';
import { canvasTex, sky, scrolling, many, sunLight, wrap } from './worldkit.js';
import { hash } from './util.js';

const PI = Math.PI;

export function neonCity() {
  const g = new THREE.Group(), SPAN = 140;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 120), new THREE.MeshStandardMaterial({ color: '#07080C', roughness: 0.34, metalness: 0.75 }));
  ground.rotation.x = -PI / 2; ground.receiveShadow = true; g.add(ground);
  const win = canvasTex(256, 512, (c, w, h) => {
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
    for (let y = 3; y < h; y += 7) for (let x = 3; x < w; x += 6) {
      const r = hash(x * 7 + y, 5); if (r < 0.7) continue;
      c.fillStyle = r > 0.95 ? '#7FD9FF' : r > 0.9 ? '#FF5BD8' : `rgba(255,${170 + (r * 60) | 0},${100 + (r * 80) | 0},${0.35 + r * 0.45})`; c.fillRect(x, y, 3, 4);
    }
  });
  const builds = many(46, 11, (r, i) => {
    const back = i % 2 === 0, h = back ? 14 + 26 * r(1) : 5 + 11 * r(1), w = 4 + 6 * r(2), d = 4 + 4 * r(3);
    const tex = win.clone(); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(Math.max(1, Math.round(w / 6)), Math.max(1, Math.round(h / 9))); tex.needsUpdate = true;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: '#0A0C13', roughness: 0.45, metalness: 0.4, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.8 }));
    m.userData.x0 = (i / 46) * SPAN + r(4) * 3; m.position.set(0, h / 2, back ? -20 - 8 * r(5) : -8 - 3 * r(5)); g.add(m); return m;
  });
  const NEON = ['#FF2BD6', '#23E5FF', '#FF6A1A', '#B44DFF'];
  const signs = many(18, 12, (r, i) => {
    const col = new THREE.Color(NEON[i % 4]).multiplyScalar(2.2), tall = r(1) > 0.4;
    const m = new THREE.Mesh(new THREE.BoxGeometry(tall ? 0.28 : 2.6, tall ? 3.2 : 0.32, 0.12), new THREE.MeshBasicMaterial({ color: col }));
    m.userData.x0 = r(2) * SPAN; m.position.set(0, 3 + 4 * r(3), -6.3); g.add(m);
    // Its smeared reflection on the wet road.
    const s = new THREE.Mesh(new THREE.PlaneGeometry(tall ? 0.5 : 2.2, 9), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(0.035), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
    s.rotation.x = -PI / 2; s.position.set(0, 0.012, -2.0); s.userData.sign = m; g.add(s); m.userData.refl = s; return m;
  });
  const lamps = many(10, 13, (r, i) => {
    const grp = new THREE.Group(); const front = i % 2 === 0;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 5.5, 8), new THREE.MeshStandardMaterial({ color: '#111318', roughness: 0.4, metalness: 0.8 })); pole.position.y = 2.75; grp.add(pole);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 2.6, 2.2) })); head.position.set(front ? 0 : 0, 5.5, front ? -0.4 : 0.4); grp.add(head);
    grp.userData.x0 = (i / 10) * SPAN + r(1) * 4; grp.position.z = front ? -5.2 : -3.2; g.add(grp); return grp; // all behind the hero: nothing wipes across them
  });
  const rain = scrolling(new THREE.BoxGeometry(0.008, 0.55, 0.008), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.3, 0.36, 0.55) }),
    many(700, 14, (r) => ({ x: r(1) * 30 - 15, y: r(2) * 10, z: r(3) * 12 - 7, par: 1 })), 30);
  g.add(rain.mesh);
  const rim = sunLight('#3FD8FF', 4.2, [-7, 6, -8]); g.add(rim, rim.target);
  const key = new THREE.DirectionalLight('#FF4FD2', 1.0); key.position.set(6, 3, 5); g.add(key);
  g.add(new THREE.HemisphereLight('#1A2448', '#000000', 0.4));
  return {
    group: g, style: 'solid',
    setup(scene) { scene.background = new THREE.Color('#05060F'); scene.fog = new THREE.FogExp2('#080B1C', 0.028); scene.environmentIntensity = 0.5; },
    update(t, travel) {
      builds.forEach((m) => { m.position.x = wrap(m.userData.x0 - travel, SPAN); });
      signs.forEach((m) => { m.position.x = wrap(m.userData.x0 - travel, SPAN); m.userData.refl.position.x = m.position.x; });
      lamps.forEach((m) => { m.position.x = wrap(m.userData.x0 - travel, SPAN); });
      rain.update(travel, (it) => ({ y: -(((t * 14 + it.y * 7) % 10)) + 10 - it.y }));
    },
    look: { sat: 1.12, contrast: 1.1, bloom: 0.6, gain: '#F0F4FF' },
  };
}

export function desert() {
  const g = new THREE.Group(), P = 60;
  g.add(sky('#FF9A55', '#2A1640', { sun: [-0.18, 0.045, -1], sunCol: '#FFD39A', power: 0.55 }));
  const geo = new THREE.PlaneGeometry(P * 4, 260, 200, 120); geo.rotateX(-PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), k = (2 * PI) / P, side = Math.min(1, Math.max(0, (Math.abs(z) - 3) / 8));
    pos.setY(i, side * (2.4 * Math.sin(k * x + z * 0.07) + 1.1 * Math.sin(2 * k * x + 1.3 + z * 0.13) + 0.5 * Math.sin(3 * k * x + z * 0.21)) + side * Math.abs(z) * 0.02);
  }
  geo.computeVertexNormals();
  const sand = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#D9A46B', roughness: 0.95 })); sand.receiveShadow = true; g.add(sand);
  const mesas = many(9, 21, (r, i) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(6 + 8 * r(1), 9 + 9 * r(1), 14 + 22 * r(2), 7), new THREE.MeshStandardMaterial({ color: '#8C4B34', roughness: 1, flatShading: true }));
    m.userData.x0 = (i / 9) * 300; m.position.set(0, 6, -70 - 50 * r(3)); g.add(m); return m;
  });
  const dust = scrolling(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshStandardMaterial({ color: '#E8B47E', roughness: 1 }), many(90, 22, (r) => ({ x: 0, y: 0, z: 0, r1: r(1), r2: r(2), r3: r(3) })), 1000);
  g.add(dust.mesh);
  const sun = sunLight('#FFB070', 3.4, [-5, 2.6, -14]); g.add(sun, sun.target);
  const fill = new THREE.DirectionalLight('#A27BD8', 0.7); fill.position.set(4, 2, 6); g.add(fill);
  g.add(new THREE.HemisphereLight('#FFB89A', '#5A2E1C', 0.55));
  return {
    group: g, style: 'solid',
    setup(scene) { scene.background = null; scene.fog = new THREE.Fog('#D88457', 30, 230); scene.environmentIntensity = 0.35; },
    update(t, travel) {
      sand.position.x = -(travel % P);
      mesas.forEach((m) => { m.position.x = wrap(m.userData.x0 - travel, 300); });
      // Dust kicked up behind the feet, drifting back and rising.
      const m4 = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3();
      for (let i = 0; i < 90; i++) {
        const a = (t * 1.6 + hash(i, 23)) % 1, sz = 0.015 + 0.05 * a * (0.5 + hash(i, 24));
        v.set(-a * 3.2 - 0.2, 0.04 + a * (0.3 + 0.5 * hash(i, 25)), (hash(i, 26) - 0.5) * 0.6 * (1 + a));
        dust.mesh.setMatrixAt(i, m4.compose(v, q, s.setScalar(sz * (1 - a * 0.6))));
      }
      dust.mesh.instanceMatrix.needsUpdate = true;
    },
    look: { gain: '#FFE6CC', sat: 1.12, contrast: 1.06, bloom: 0.75 },
  };
}

export function underSea() {
  const g = new THREE.Group();
  const time = { value: 0 }, off = { value: 0 };
  const sandMat = new THREE.MeshStandardMaterial({ color: '#B9A47C', roughness: 0.95 });
  sandMat.onBeforeCompile = (sh) => {
    sh.uniforms.uT = time; sh.uniforms.uO = off;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform float uT, uO;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        vec2 q = (vWP.xz + vec2(uO, 0.0)) * 1.25; float cv = 0.0;
        for (int i = 0; i < 3; i++) { q = vec2(q.x + sin(q.y * 1.7 + uT * 0.9 + float(i)), q.y + sin(q.x * 1.3 - uT * 0.7 + float(i) * 1.7)); cv += 1.0 / (1.0 + 16.0 * abs(sin(q.x) * sin(q.y))); }
        totalEmissiveRadiance += vec3(0.55, 0.95, 1.0) * pow(cv / 3.0, 2.2) * 0.9;`);
  };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 120), sandMat); ground.rotation.x = -PI / 2; ground.receiveShadow = true; g.add(ground);
  const kelpGeo = new THREE.CylinderGeometry(0.04, 0.09, 7, 6, 28); kelpGeo.translate(0, 3.5, 0);
  const kelpMat = new THREE.MeshStandardMaterial({ color: '#1F6B45', roughness: 0.7 });
  kelpMat.onBeforeCompile = (sh) => {
    sh.uniforms.uT = time;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uT;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float ph = instanceMatrix[3].z * 1.7 + instanceMatrix[3].y * 3.1; float k = position.y / 7.0;
        transformed.x += sin(position.y * 0.6 + uT * 1.4 + ph) * 0.55 * k * k; transformed.z += cos(position.y * 0.5 + uT * 1.1 + ph) * 0.3 * k * k;`);
  };
  const kelp = scrolling(kelpGeo, kelpMat, many(70, 31, (r) => ({ x: r(1) * 60 - 30, y: -0.05 * r(4), z: r(2) < 0.85 ? -2.5 - 14 * r(3) : 2.2 + r(3), sy: 0.5 + 0.8 * r(5) })), 60);
  g.add(kelp.mesh);
  const bub = scrolling(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: '#DDF7FF', emissive: '#9FE8FF', emissiveIntensity: 0.8, roughness: 0.1, metalness: 0.2 }),
    many(260, 32, (r) => ({ x: r(1) * 26 - 13, y: r(2) * 8, z: r(3) * 10 - 6, sx: 0.015 + 0.04 * r(4), sy: 0.015 + 0.04 * r(4), sz: 0.015 + 0.04 * r(4), par: 0.9 })), 26);
  g.add(bub.mesh);
  const rayMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; varying vec3 vN, vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'varying vec2 vUv; varying vec3 vN, vV; void main(){ float e = pow(abs(dot(vN, vV)), 2.0); gl_FragColor = vec4(vec3(0.55, 0.95, 1.0) * e * pow(vUv.y, 2.0) * 0.18, 1.0); }',
  });
  const rays = many(5, 33, (r, i) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 2.2, 16, 24, 1, true), rayMat); m.position.set(-6 + i * 3.5, 7, -3 - 4 * r(1)); m.rotation.z = -0.35; g.add(m); return m; });
  const sun = sunLight('#C8F8FF', 2.4, [3, 10, 2]); g.add(sun, sun.target);
  g.add(new THREE.HemisphereLight('#5AD0DA', '#0A2830', 0.75));
  return {
    group: g, style: 'solid',
    setup(scene) { scene.background = new THREE.Color('#05343F'); scene.fog = new THREE.FogExp2('#0B4C58', 0.07); scene.environmentIntensity = 0.3; },
    update(t, travel) {
      time.value = t; off.value = travel;
      kelp.update(travel);
      bub.update(travel * 0.9, (it, i) => ({ y: ((t * (0.8 + hash(i, 34)) + it.y) % 8) - it.y }));
      rays.forEach((m, i) => { m.rotation.z = -0.35 + 0.05 * Math.sin(t * 0.7 + i); });
    },
    look: { gain: '#CFFFF6', sat: 1.08, contrast: 1.02, bloom: 0.7 },
  };
}

export function snowPeaks() {
  const g = new THREE.Group();
  g.add(sky('#E3EBF2', '#6F8FB2', { power: 0.7 }));
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 200, 60, 30), new THREE.MeshStandardMaterial({ color: '#F3F6FA', roughness: 0.92 }));
  ground.rotation.x = -PI / 2; ground.receiveShadow = true; g.add(ground);
  const mountains = many(14, 41, (r, i) => {
    const h = 34 + 40 * r(1), geo = new THREE.ConeGeometry(28 + 26 * r(2), h, 7, 6); geo.translate(0, h / 2, 0);
    const col = [], p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) { const y = p.getY(k) / h + (hash(k, i) - 0.5) * 0.12; const c = new THREE.Color(y > 0.5 ? '#F7FAFD' : '#55606E'); col.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true }));
    m.userData.x0 = (i / 14) * 360; m.position.set(0, -2, -90 - 60 * r(3)); g.add(m); return m;
  });
  const treeGeo = new THREE.ConeGeometry(1, 3, 7); treeGeo.translate(0, 1.9, 0);
  const trees = scrolling(treeGeo, new THREE.MeshStandardMaterial({ color: '#1C3A33', roughness: 0.8, flatShading: true }),
    many(60, 42, (r) => { const s = 0.5 + 1.1 * r(1); return { x: r(2) * 120, y: 0, z: r(3) < 0.9 ? -4 - 30 * r(4) : 3.0 + r(4), sx: s, sy: s * (0.9 + 0.4 * r(5)), sz: s }; }), 120, { shadow: true });
  g.add(trees.mesh);
  const snow = scrolling(new THREE.SphereGeometry(1, 5, 4), new THREE.MeshBasicMaterial({ color: '#FFFFFF' }),
    many(700, 43, (r) => ({ x: r(1) * 30 - 15, y: r(2) * 7, z: r(3) * 10 - 6, sx: 0.012 + 0.02 * r(4), sy: 0.012 + 0.02 * r(4), sz: 0.012 + 0.02 * r(4), par: 2.2 })), 30);
  g.add(snow.mesh);
  const sun = sunLight('#FFFFFF', 2.8, [6, 8, 7]); g.add(sun, sun.target);
  g.add(new THREE.HemisphereLight('#D2E6FF', '#9AA9BB', 0.85));
  return {
    group: g, style: 'solid',
    setup(scene) { scene.background = null; scene.fog = new THREE.Fog('#D3DDE8', 30, 210); scene.environmentIntensity = 0.5; },
    update(t, travel) {
      mountains.forEach((m) => { m.position.x = wrap(m.userData.x0 - travel, 360); });
      trees.update(travel);
      snow.update(travel, (it, i) => ({ y: Math.sin(t * 2 + i) * 0.15 - ((t * 0.9 * (0.5 + hash(i, 44))) % 7) }));
    },
    look: { gain: '#ECF4FF', sat: 0.92, contrast: 1.08, bloom: 0.35, exposure: 0.92 },
  };
}
