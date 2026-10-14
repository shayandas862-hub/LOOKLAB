// Built objects shared by several scenes: the glowing grid floor, the chrome shards, the rising blocks,
// a cinema camera that assembles part by part, and a studio fresnel light with its beam.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ease, prog, hash, clamp } from './util.js';

// A dark, slightly reflective floor with a grid that a wave of light can run across.
export function gridFloor({ size = 80, cell = 0.5, color = '#FF6A1A', base = '#060607' } = {}) {
  const mat = new THREE.MeshStandardMaterial({ color: base, roughness: 0.38, metalness: 0.6 });
  const u = { gCol: { value: new THREE.Color(color) }, gCell: { value: cell }, gCenter: { value: new THREE.Vector2() }, gRadius: { value: -1 }, gRest: { value: 0 }, gBoost: { value: 0 } };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP; uniform vec3 gCol; uniform float gCell, gRadius, gRest, gBoost; uniform vec2 gCenter;')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        vec2 gp = vWP.xz / gCell; vec2 gg = abs(fract(gp - 0.5) - 0.5) / fwidth(gp); float gl = 1.0 - min(min(gg.x, gg.y), 1.0);
        float gr = length(vWP.xz - gCenter);
        float gw = gRadius < 0.0 ? 0.0 : exp(-pow((gr - gRadius) / 0.9, 2.0)) * 4.0 + gRest * step(gr, gRadius);
        totalEmissiveRadiance += gCol * gl * (gw + gBoost) * exp(-gr * 0.06);`);
  };
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat); m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
  m.userData.u = u;
  return m;
}

// Thousands of chrome fragments from a set of points; positions are a closed-form function of time
// (fly, fall, one bounce, rest), so any frame can be rendered on its own.
export function shards(points, { t0, center, g = 5.5, size = 0.011, seed = 1 }) {
  const n = points.length, geo = new THREE.TetrahedronGeometry(size, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#D8DCE2', roughness: 0.18, metalness: 1, emissive: '#ffffff', emissiveIntensity: 0 });
  const mesh = new THREE.InstancedMesh(geo, mat, n); mesh.castShadow = true; mesh.frustumCulled = false;
  const P = points.map((p, i) => {
    const r = (k) => hash(i * 7 + k, seed);
    const d = new THREE.Vector3(p.x - center.x + (r(1) - 0.5) * 0.3, p.y - center.y + (r(2) - 0.5) * 0.3, 0).normalize();
    const sp = 1.1 + 2.6 * r(3) ** 2;
    const v = new THREE.Vector3(d.x * sp, d.y * sp * 0.7 + 0.8 + 1.6 * r(4), 0.15 + 1.1 * r(5) ** 2);
    const h = p.y - size, t1 = (v.y + Math.sqrt(v.y * v.y + 2 * g * h)) / g;
    const p1 = new THREE.Vector3(p.x + v.x * t1, size * 0.6, p.z + v.z * t1), vy1 = v.y - g * t1;
    const vb = new THREE.Vector3(v.x * 0.3, Math.abs(vy1) * 0.28, v.z * 0.3), t2 = (2 * vb.y) / g;
    const axis = new THREE.Vector3(r(6) - 0.5, r(7) - 0.5, r(8) - 0.5).normalize();
    return { p, v, t1, p1, vb, t2, axis, w: 6 + 18 * r(9), s: 0.6 + 0.9 * r(10), hot: p.hot ?? 0 };
  });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color();
  return {
    mesh, data: P,
    update(t) {
      const dt = Math.max(0, t - t0);
      P.forEach((s, i) => {
        let a = dt;
        if (dt < s.t1) pos.set(s.p.x + s.v.x * dt, s.p.y + s.v.y * dt - 0.5 * g * dt * dt, s.p.z + s.v.z * dt);
        else { const u = Math.min(dt - s.t1, s.t2); a = s.t1 + u * 0.4; pos.set(s.p1.x + s.vb.x * u, s.p1.y + s.vb.y * u - 0.5 * g * u * u, s.p1.z + s.vb.z * u); }
        q.setFromAxisAngle(s.axis, s.w * a); sc.setScalar(s.s);
        mesh.setMatrixAt(i, m4.compose(pos, q, sc));
        col.setRGB(1, 1, 1).lerp(new THREE.Color(1, 0.42, 0.1), s.hot); mesh.setColorAt(i, col);
      });
      mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mat.emissiveIntensity = 0.9 * Math.exp(-dt / 0.1) * (t >= t0 ? 1 : 0);
    },
  };
}

// Monoliths that rise out of the grid in rings, each on its own eighth note.
export function blocks({ count = 140, seed = 3, times = [] }) {
  const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#16181C', roughness: 0.32, metalness: 0.75 });
  const capMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.75, 0.2) });
  // The glowing rim round each block's top: four thin bars.
  const rim = mergeGeometries([[1, 0.05, 0, 0.475], [1, 0.05, 0, -0.475], [0.05, 1, 0.475, 0], [0.05, 1, -0.475, 0]].map(([w, d, x, z]) => { const b = new THREE.BoxGeometry(w, 1, d); b.translate(x, 0.5, z); return b; }));
  const mesh = new THREE.InstancedMesh(geo, mat, count), caps = new THREE.InstancedMesh(rim, capMat, count);
  mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = caps.frustumCulled = false;
  const B = Array.from({ length: count }, (_, i) => {
    const ring = Math.floor((i / count) * times.length), r = 3.4 + ring * 1.7 + hash(i, seed) * 1.4;
    // Keep the +x/+z quarter (where the cameras stand) clear near the hero.
    let a = hash(i, seed + 1) * Math.PI * 2; if (Math.cos(a) > -0.25 && Math.sin(a) > -0.25 && r < 12) a += Math.PI;
    return { x: Math.cos(a) * r, z: Math.sin(a) * r, w: 0.5 + 1.1 * hash(i, seed + 2), d: 0.5 + 1.1 * hash(i, seed + 3), h: 0.4 + 3.6 * hash(i, seed + 4) ** 1.6, t: times[ring] + hash(i, seed + 5) * 0.08 };
  });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
  const group = new THREE.Group(); group.add(mesh, caps);
  return {
    group, data: B,
    update(t) {
      B.forEach((b, i) => {
        const k = ease.outBack(clamp((t - b.t) / 0.35)), h = Math.max(0.0001, b.h * k), on = t >= b.t ? 1 : 0;
        mesh.setMatrixAt(i, m4.compose(p.set(b.x, -0.001, b.z), q, s.set(b.w * on, h, b.d * on)));
        caps.setMatrixAt(i, m4.compose(p.set(b.x, h - 0.001, b.z), q, s.set(b.w * 1.004 * on, 0.03, b.d * 1.004 * on)));
      });
      mesh.instanceMatrix.needsUpdate = caps.instanceMatrix.needsUpdate = true;
    },
  };
}

// A cinema camera: body, lens, matte box, handle, magazine, monitor. Each part flies in and lands on its time.
export function cineCamera(times, { chrome = true } = {}) {
  const metal = new THREE.MeshPhysicalMaterial({ color: '#CDD2DA', roughness: 0.12, metalness: 1 });
  const dark = new THREE.MeshStandardMaterial({ color: '#141519', roughness: 0.35, metalness: 0.6 });
  const glass = new THREE.MeshPhysicalMaterial({ color: '#0A0D14', roughness: 0.02, metalness: 0.2, clearcoat: 1, iridescence: 0.6 });
  const g = new THREE.Group();
  const part = (mesh, at) => { const p = new THREE.Group(); p.add(mesh); p.userData.home = at; g.add(p); mesh.castShadow = true; return p; };
  const body = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.22, 0.36, 3, 0.025), chrome ? metal : dark);
  const lensG = new THREE.Group();
  [[0.06, 0.065, 0.05, 0], [0.07, 0.07, 0.11, 0.08], [0.075, 0.075, 0.03, 0.15]].forEach(([r0, r1, l, z]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, l, 40), dark); c.rotation.x = Math.PI / 2; c.position.z = z; lensG.add(c); });
  const rings = new THREE.Mesh(new THREE.TorusGeometry(0.071, 0.006, 8, 40), metal); rings.position.z = 0.1; lensG.add(rings);
  const front = new THREE.Mesh(new THREE.CircleGeometry(0.062, 40), glass); front.position.z = 0.166; lensG.add(front);
  const matte = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.1, 4, 1, true), dark); matte.rotation.set(Math.PI / 2, Math.PI / 4, 0); matte.scale.set(1.35, 1, 1); matte.material.side = THREE.DoubleSide;
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.014, 8, 24, Math.PI), metal); handle.rotation.y = Math.PI / 2;
  const mag = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.12, 0.16, 2, 0.02), dark);
  const mon = new THREE.Group(); const screen = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.1, 0.16), dark); mon.add(screen);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.09), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.7, 0.25) })); scr.position.x = -0.007; scr.rotation.y = -Math.PI / 2; mon.add(scr);
  const parts = [
    part(body, [0, 0, 0]), part(lensG, [0, 0.0, 0.18]), part(matte, [0, 0, 0.39]),
    part(handle, [0, 0.11, -0.02]), part(mag, [0, 0.17, -0.12]), part(mon, [-0.17, 0.06, 0.04]),
  ];
  const from = [[0, -1.6, 0], [0, 0, 2.2], [0.3, 0.5, 2.6], [0, 2.2, 0], [-0.4, 2, -1.6], [-2.2, 0.4, 0.4]];
  return {
    group: g, lensFront: front,
    update(t) {
      parts.forEach((p, i) => {
        const k = ease.outExpo(clamp((t - (times[i] - 0.22)) / 0.22)), h = p.userData.home, f = from[i];
        p.visible = t >= times[i] - 0.3;
        p.position.set(h[0] + f[0] * (1 - k), h[1] + f[1] * (1 - k), h[2] + f[2] * (1 - k));
        p.rotation.set((1 - k) * 2.2 * (i % 2 ? 1 : -1), (1 - k) * 1.4, 0);
      });
    },
  };
}

// A studio fresnel on a stand, its beam and the dust in it.
export function fresnel(scene, { at, target, color = '#FFE2C2' }) {
  const g = new THREE.Group(); g.position.copy(at); scene.add(g);
  const dark = new THREE.MeshStandardMaterial({ color: '#1A1B1F', roughness: 0.4, metalness: 0.7 });
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, at.y, 10), dark); stand.position.y = -at.y / 2; g.add(stand);
  const head = new THREE.Group(); g.add(head);
  const can = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.42, 32), dark); can.rotation.x = Math.PI / 2; head.add(can);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.17, 40), new THREE.MeshBasicMaterial({ color: '#111' })); lens.position.z = 0.212; head.add(lens);
  for (let k = 0; k < 4; k++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.006, 0.16), dark); const a = (k * Math.PI) / 2; d.position.set(Math.cos(a) * 0.19, Math.sin(a) * 0.19, 0.29); d.rotation.z = a + Math.PI / 2; d.rotation.y = 0; head.add(d); }
  head.lookAt(target);
  const spot = new THREE.SpotLight(color, 0, 0, 0.42, 0.35, 1.2); spot.position.copy(at); spot.target.position.copy(target);
  spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0002; spot.shadow.normalBias = 0.02; spot.shadow.camera.near = 0.3; spot.shadow.camera.far = 40;
  scene.add(spot, spot.target);
  const len = at.distanceTo(target) * 1.3;
  const beamMat = new THREE.ShaderMaterial({
    uniforms: { k: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    vertexShader: 'varying vec2 vUv; varying vec3 vN, vV; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float k; varying vec2 vUv; varying vec3 vN, vV; void main(){ float e = pow(abs(dot(vN, vV)), 2.0); gl_FragColor = vec4(vec3(1.0, 0.86, 0.7) * e * pow(vUv.y, 1.6) * 0.16 * k, 1.0); }',
  });
  const bg = new THREE.CylinderGeometry(0.15, len * Math.tan(0.42), len, 48, 1, true); bg.translate(0, -len / 2, 0);
  const beam = new THREE.Mesh(bg, beamMat); beam.position.copy(at);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), target.clone().sub(at).normalize()); scene.add(beam);
  return {
    group: g, spot,
    set(k, t) {
      const flick = k > 0 && k < 1 ? (hash(Math.floor(t * 48), 5) > 0.35 ? 1 : 0.2) : 1;
      spot.intensity = 30 * k * flick; beamMat.uniforms.k.value = k * flick;
      lens.material.color.setRGB(0.07 + 5 * k * flick, 0.07 + 4.3 * k * flick, 0.07 + 3.4 * k * flick);
    },
  };
}
