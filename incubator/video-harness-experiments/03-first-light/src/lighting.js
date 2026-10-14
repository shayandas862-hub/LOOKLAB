// Light is the story: soft clay daylight, then a film light pops up and everything after is a decision.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PAL, T, SPOT } from './timeline.js';
import { ease, prog, lerp, hash } from './util.js';
import { paint } from './set.js';

const MARK3 = new THREE.Vector3(SPOT.mark[0], 0.6, SPOT.mark[1]);

function sky(scene) {
  const u = { zen: { value: new THREE.Color(PAL.clayBg) }, hor: { value: new THREE.Color(PAL.clayBg) }, glow: { value: 0 } };
  const m = new THREE.ShaderMaterial({
    uniforms: u, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 zen, hor; uniform float glow; varying vec3 vP;
      void main(){ float h = clamp(vP.y * 1.6 + 0.12, 0.0, 1.0); vec3 c = mix(hor, zen, pow(h, 0.8));
        c += vec3(1.0, 0.55, 0.3) * glow * pow(1.0 - h, 6.0) * 0.35; gl_FragColor = vec4(c, 1.0); }`,
  });
  const s = new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), m); scene.add(s);
  return u;
}

function filmLight(scene) {
  const g = new THREE.Group(); g.position.set(SPOT.light[0], 0, SPOT.light[1]); scene.add(g);
  const metal = paint(PAL.navy, { rough: 0.35, metal: 0.5 });
  const legs = new THREE.Group(); g.add(legs);
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2, leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.62, 6), metal);
    leg.position.set(Math.cos(a) * 0.16, 0.27, Math.sin(a) * 0.16); leg.rotation.set(Math.sin(a) * 0.55, 0, -Math.cos(a) * 0.55); leg.castShadow = true; legs.add(leg);
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.3, 8), metal); pole.position.y = 0.9; pole.castShadow = true; g.add(pole);
  const head = new THREE.Group(); head.position.y = 1.58; g.add(head);
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.2, 0.26, 2, 0.03), paint(PAL.tomato, { rough: 0.45, metal: 0.2 })); body.castShadow = true; head.add(body);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.085, 32), new THREE.MeshBasicMaterial({ color: '#333' })); lens.position.z = 0.131; head.add(lens);
  for (const [x, y, rz] of [[0, 0.12, 0], [0, -0.12, 0], [0.13, 0, Math.PI / 2], [-0.13, 0, Math.PI / 2]]) {
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.008, 0.1), metal); door.position.set(x, y, 0.17); door.rotation.z = rz; door.rotation.x = (y > 0 ? -0.5 : y < 0 ? 0.5 : 0); head.add(door);
  }
  head.lookAt(MARK3.x, MARK3.y, MARK3.z);
  return { g, head, lens };
}

function filmCamera(scene) {
  const g = new THREE.Group(); g.position.set(SPOT.cam[0], 0, SPOT.cam[1]); scene.add(g);
  const dark = paint(PAL.ink, { rough: 0.4, metal: 0.3 }), cream = paint(PAL.cream, { rough: 0.5 });
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2 + 0.3, leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.85, 6), dark);
    leg.position.set(Math.cos(a) * 0.17, 0.4, Math.sin(a) * 0.17); leg.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); leg.castShadow = true; g.add(leg);
  }
  const head = new THREE.Group(); head.position.y = 0.95; g.add(head);
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.18, 0.2, 0.32, 2, 0.03), cream); body.castShadow = true; head.add(body);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.16, 20), dark); lens.rotation.x = Math.PI / 2; lens.position.z = 0.22; head.add(lens);
  for (const z of [-0.07, 0.08]) { const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.035, 28), dark); reel.rotation.z = Math.PI / 2; reel.position.set(0, 0.2, z); reel.castShadow = true; head.add(reel); }
  head.lookAt(MARK3.x, 0.95, MARK3.z);
}

export function createLighting(scene, renderer) {
  const u = sky(scene);
  scene.fog = new THREE.Fog(PAL.clayBg, 18, 60);
  const hemi = new THREE.HemisphereLight('#F2F0EC', '#9C978F', 1.6); scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffffff', 2.2); sun.position.set(-5, 9, 6); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; scene.add(sun);

  const fl = filmLight(scene); filmCamera(scene);
  const key = new THREE.SpotLight(PAL.warmLight, 0, 0, 0.5, 0.65, 1.6);
  key.position.set(SPOT.light[0], 1.58, SPOT.light[1]); key.target.position.copy(MARK3); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.camera.near = 0.2; key.shadow.camera.far = 14;
  scene.add(key, key.target);
  const fill = new THREE.SpotLight(PAL.coolLight, 0, 0, 0.9, 0.9, 1.4); fill.position.set(3.4, 2.6, 3.4); fill.target.position.copy(MARK3); scene.add(fill, fill.target);
  const rim = new THREE.SpotLight('#FFD9B5', 0, 0, 0.4, 0.55, 1.4); rim.position.set(2.2, 2.6, -3.4); rim.target.position.copy(MARK3); scene.add(rim, rim.target);
  const lamp = new THREE.PointLight('#FFC27A', 0, 5, 1.6); lamp.position.set(-3.15, 1.9, 0.85); scene.add(lamp);
  const win = new THREE.PointLight('#FFB36B', 0, 6, 1.5); win.position.set(-1.6, 1.1, -0.9); scene.add(win);

  // The beam and the dust in it.
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { k: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; varying vec3 vN, vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float k; varying vec2 vUv; varying vec3 vN, vV; void main(){ float e = pow(abs(dot(vN, vV)), 2.5); gl_FragColor = vec4(vec3(1.0, 0.78, 0.55) * e * pow(vUv.y, 1.3) * 0.22 * k, 1.0); }',
  });
  const from = new THREE.Vector3(SPOT.light[0], 1.58, SPOT.light[1]), len = from.distanceTo(MARK3) * 1.25;
  const beamGeo = new THREE.CylinderGeometry(0.08, 0.9, len, 40, 1, true); beamGeo.translate(0, -len / 2, 0);
  const beam = new THREE.Mesh(beamGeo, beamMat); beam.position.copy(from);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), MARK3.clone().sub(from).normalize()); scene.add(beam);
  const N = 700, dp = new Float32Array(N * 3), dust = new THREE.BufferGeometry(); dust.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dc = document.createElement('canvas'); dc.width = dc.height = 32; const dg = dc.getContext('2d'), gr = dg.createRadialGradient(16, 16, 0, 16, 16, 16);
  gr.addColorStop(0, 'rgba(255,240,220,1)'); gr.addColorStop(1, 'rgba(255,240,220,0)'); dg.fillStyle = gr; dg.fillRect(0, 0, 32, 32);
  const dustMat = new THREE.PointsMaterial({ size: 0.022, map: new THREE.CanvasTexture(dc), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#FFD9AE', opacity: 0 });
  const motes = new THREE.Points(dust, dustMat); motes.frustumCulled = false; scene.add(motes);
  const dir = MARK3.clone().sub(from).normalize(), side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(side, dir);

  const grey = { zen: new THREE.Color(PAL.clayBg), hor: new THREE.Color(PAL.clayBg) }, dusk = { zen: new THREE.Color('#1B2446'), hor: new THREE.Color('#E79A7E') }, night = { zen: new THREE.Color('#0B1026'), hor: new THREE.Color('#33264A') };
  const hemiSky = [new THREE.Color('#F2F0EC'), new THREE.Color('#5E6CA6')], hemiGround = [new THREE.Color('#9C978F'), new THREE.Color('#3A2C38')];
  const tmp = new THREE.Vector3();

  return function update(t) {
    const d = ease.inOutCubic(prog(t, T.dusk[0], T.dusk[1]));
    const n = ease.inOutCubic(prog(t, 35.0, 38.0));
    u.zen.value.copy(grey.zen).lerp(dusk.zen, d).lerp(night.zen, n); u.hor.value.copy(grey.hor).lerp(dusk.hor, d).lerp(night.hor, n); u.glow.value = d * (1 - n);
    scene.fog.color.copy(u.hor.value);
    hemi.color.copy(hemiSky[0]).lerp(hemiSky[1], d); hemi.groundColor.copy(hemiGround[0]).lerp(hemiGround[1], d); hemi.intensity = lerp(1.6, 0.55, d) * lerp(1, 0.6, n);
    const afterOn = prog(t, T.on, T.on + 0.8);
    sun.intensity = lerp(2.2, 0.9, afterOn) * lerp(1, 0.35, d); sun.color.set('#ffffff').lerp(new THREE.Color('#8FA2E0'), d);
    scene.environmentIntensity = lerp(0.65, 0.22, d);
    // Pop-up with overshoot; a tungsten flicker as it strikes.
    const pop = ease.outBack(prog(t, T.pop, T.pop + 0.42));
    fl.g.visible = t >= T.pop; fl.g.scale.set(lerp(0.6, 1, pop), Math.max(0.001, pop), lerp(0.6, 1, pop));
    const flick = t < T.on ? 0 : t < T.on + 0.16 ? (hash(Math.floor(t * 60), 4) > 0.45 ? 1 : 0.15) : 1;
    const k = flick * ease.outCubic(prog(t, T.on, T.on + 0.5));
    key.intensity = 38 * k; fl.lens.material.color.set('#333').lerp(new THREE.Color(4, 3.1, 2.1), k);
    beamMat.uniforms.k.value = k * (0.45 + 0.55 * d);
    fill.intensity = 14 * ease.outCubic(prog(t, T.fill, T.fill + 0.3));
    rim.intensity = 55 * ease.outCubic(prog(t, T.rim, T.rim + 0.3));
    lamp.intensity = 3 * prog(t, T.lamp, T.lamp + 0.12);
    win.intensity = 4 * prog(t, T.windows, T.windows + 0.5);
    dustMat.opacity = 0.9 * k * (0.5 + 0.5 * d);
    if (k > 0) for (let i = 0; i < N; i++) {
      const a = hash(i, 1), r = Math.sqrt(hash(i, 2)) * (0.1 + 0.55 * a), th = hash(i, 3) * 6.283 + t * (0.05 + 0.1 * hash(i, 4));
      tmp.copy(from).addScaledVector(dir, a * len * 0.95).addScaledVector(side, Math.cos(th) * r).addScaledVector(up, Math.sin(th) * r + Math.sin(t * 0.4 + i) * 0.05);
      tmp.toArray(dp, i * 3);
    }
    dust.attributes.position.needsUpdate = true;
  };
}
