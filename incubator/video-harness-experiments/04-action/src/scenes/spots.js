// 0:44–0:56 — two product spots, cut like real commercials.
// SNEAKER: spins in, freezes, bursts into its layers on the drum roll, slams back together onto a chrome stand,
// colourways on the beat. PERFUME: one slow drop through black, a splash, light sweeping across the glass, the cap
// clicks on, a backlit mist.
import * as THREE from 'three';
import { W, H, CUE, BEAT } from '../timeline.js';
import { ease, prog, lerp, clamp, hash } from '../util.js';
import { sneaker, perfume, COLOURWAYS } from '../products.js';
import { canvasTex, glow } from '../worldkit.js';
import { studioEnv } from '../engine.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const L = (a, b, f) => a.clone().lerp(b, f);
const glowTex = (inner, outer) => canvasTex(256, 256, (c, w) => { const g = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, inner); g.addColorStop(1, outer); c.fillStyle = g; c.fillRect(0, 0, w, w); });

function studio(sh) {
  const scene = new THREE.Scene(); scene.environment = sh.env; scene.background = new THREE.Color('#030304');
  const camera = new THREE.PerspectiveCamera(32, W / H, 0.005, 50);
  return { scene, camera };
}

export function createSneakerSpot(sh) {
  const { scene, camera } = studio(sh); scene.environmentIntensity = 0.8;
  const shoe = sneaker(); scene.add(shoe.group);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), glow('#FF6A1A', { intensity: 0.45, falloff: 2.6 }));
  back.position.set(0, 0.25, -1.6); scene.add(back);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.08, 64), new THREE.MeshPhysicalMaterial({ color: '#0C0C0E', roughness: 0.15, metalness: 0.3, clearcoat: 1 }));
  const standRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.0025, 6, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.8, 0.22) })); standRing.rotation.x = Math.PI / 2; standRing.position.y = 0.04; stand.add(standRing);
  stand.position.y = 0.04; stand.receiveShadow = stand.castShadow = true; scene.add(stand);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.MeshStandardMaterial({ color: '#08080A', roughness: 0.35, metalness: 0.5 })); floor.scale.setScalar(5); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.0035, 8, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.2, 0.35) })); scene.add(ring);
  const key = new THREE.DirectionalLight('#FFF4E8', 2.0); key.position.set(-1, 2, 1.2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -0.5, right: 0.5, top: 0.5, bottom: -0.5, near: 0.1, far: 6 }); key.shadow.bias = -0.0003; scene.add(key);
  const rim = new THREE.DirectionalLight('#FF7A2E', 2.2); rim.position.set(1.2, 0.8, -1.5); scene.add(rim);
  const fill = new THREE.DirectionalLight('#9DB8FF', 0.6); fill.position.set(1.5, 0.5, 1.5); scene.add(fill);
  const REST = V(0, 0.23, 0), STAND_TOP = 0.08;

  function shoeAt(t) {
    let pos = REST.clone(), ry = -0.6, rx = 0, k = 0;
    if (t < CUE.freeze) {
      const f = ease.outExpo(prog(t, CUE.sneakerIn, CUE.freeze));
      pos = L(V(-1.4, 0.7, -1.8), REST, f); ry = -0.6 + (1 - f) * Math.PI * 8; rx = (1 - f) * 1.4;
    } else if (t < CUE.slam) {
      k = ease.outExpo(prog(t, CUE.explode, CUE.explode + 1.0)) * (1 - ease.inExpo(prog(t, CUE.slam - 0.14, CUE.slam)));
      ry = -0.6 + 0.35 * prog(t, CUE.explode, CUE.slam);
    } else {
      const d = ease.inCubic(prog(t, CUE.slam, CUE.slam + 0.12)), b = Math.max(0, Math.sin(Math.PI * prog(t, CUE.slam + 0.12, CUE.slam + 0.3))) * 0.012;
      pos = V(0, lerp(REST.y, STAND_TOP, d) + b, 0); ry = -0.25;
    }
    shoe.group.position.copy(pos); shoe.group.rotation.set(rx, ry, 0); shoe.explode(k);
    const cw = t >= CUE.colourways[2] ? 3 : t >= CUE.colourways[1] ? 2 : t >= CUE.colourways[0] ? 1 : 0; shoe.paint(COLOURWAYS[cw]);
  }
  function shot(t) {
    if (t < CUE.freeze) { const f = prog(t, CUE.sneakerIn, CUE.freeze); return { pos: L(V(0.62, 0.36, 0.72), V(0.5, 0.32, 0.6), f), tgt: V(0, 0.25, 0), fov: 30 }; }
    if (t < CUE.slam) { const a = 0.75 - 1.3 * ease.inOutSine(prog(t, CUE.freeze, CUE.slam)); return { pos: V(Math.sin(a) * 0.82, 0.33, Math.cos(a) * 0.82), tgt: V(0, 0.25, 0), fov: 30 }; }
    if (t < CUE.colourways[0]) return { pos: V(0.5, 0.13, 0.55), tgt: V(0, 0.11, 0), fov: 30 };
    if (t < CUE.colourways[1]) return { pos: V(0.72, 0.14, 0.04), tgt: V(0, 0.12, 0), fov: 28 };
    if (t < CUE.colourways[2]) return { pos: V(0.32, 0.55, 0.42), tgt: V(0, 0.12, 0), fov: 28 };
    const f = prog(t, CUE.colourways[2], CUE.colourways[2] + BEAT); return { pos: L(V(-0.5, 0.2, -0.5), V(-0.45, 0.22, -0.45), f), tgt: V(0, 0.13, 0), fov: 28 };
  }
  return {
    scene, camera,
    update(t) {
      shoeAt(t);
      stand.visible = t >= CUE.slam - 0.02; stand.scale.y = ease.outBack(prog(t, CUE.slam - 0.02, CUE.slam + 0.15)) || 0.001; stand.position.y = 0.04 * stand.scale.y;
      const r = Math.exp(-(t - CUE.freeze) / 0.25) * (t >= CUE.freeze && t < CUE.slam ? 1 : 0);
      ring.visible = r > 0.01; ring.position.copy(shoe.group.position).add(V(0, 0.05, 0)); ring.rotation.set(Math.PI / 2 - 0.3, 0, 0); ring.scale.setScalar(1 + (1 - r) * 0.6); ring.material.color.setRGB(3 * r, 1.2 * r, 0.35 * r);
      const c = shot(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.fov = c.fov; camera.updateProjectionMatrix();
    },
    blur(t) { return t < CUE.freeze ? 3 : 1; },
    look() { return { bloom: 0.45, contrast: 1.08, vig: 0.45 }; },
  };
}

export function createPerfumeSpot(sh) {
  const { scene, camera } = studio(sh); scene.environmentIntensity = 1.5;
  const p = perfume(); scene.add(p.group);
  const mirror = perfume(); mirror.group.scale.y = -1; scene.add(mirror.group);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshStandardMaterial({ color: '#050506', roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.86 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = 0.0005; scene.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), glow('#FFA45A', { intensity: 1.6, falloff: 40 }));
  back.position.set(0, 0.08, -0.6); scene.add(back);
  scene.environment = studioEnv(sh.renderer, { strips: 2.6 });
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 0.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3.6, 3.2) })); scene.add(bar);
  const key = new THREE.SpotLight('#FFF2E2', 2.5, 0, 0.5, 0.6, 1.2); key.position.set(-0.4, 0.6, 0.5); key.target.position.set(0, 0.06, 0); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight('#FF8A3D', 2.5); rim.position.set(0.6, 0.4, -0.8); scene.add(rim);
  const water = new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', roughness: 0.0, transmission: 1, thickness: 0.004, ior: 1.33, emissive: '#FFB070', emissiveIntensity: 0.25 });
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.0042, 32, 24), water); drop.scale.set(1, 1.3, 1); scene.add(drop);
  const LAND = V(0.018, 0.1, 0.006);
  const splash = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0014, 10, 8), water, 26); splash.frustumCulled = false; scene.add(splash);
  const SPL = Array.from({ length: 26 }, (_, i) => { const a = hash(i, 91) * Math.PI * 2, up = 0.15 + 0.35 * hash(i, 92); return V(Math.cos(a) * (0.05 + 0.08 * hash(i, 93)), up, Math.sin(a) * (0.05 + 0.08 * hash(i, 93))); });
  const mistTex = glowTex('rgba(255,220,180,1)', 'rgba(255,140,60,0)');
  const mist = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: mistTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.05 }), 260);
  mist.frustumCulled = false; scene.add(mist);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3();

  function shot(t) {
    if (t < CUE.dropLand) { const y = dropY(t); return { pos: V(0.075, y + 0.012, 0.15), tgt: V(0.012, y - 0.004, 0), fov: 26 }; }
    if (t < CUE.sweep) { const f = prog(t, CUE.dropLand, CUE.sweep); return { pos: L(V(0.13, 0.13, 0.2), V(0.12, 0.125, 0.18), f), tgt: V(0.008, 0.098, 0), fov: 28 }; }
    if (t < CUE.cap - 0.5) { const a = -0.55 + 1.0 * ease.inOutSine(prog(t, CUE.sweep, CUE.cap - 0.5)); return { pos: V(Math.sin(a) * 0.36, 0.085, Math.cos(a) * 0.36), tgt: V(0, 0.065, 0), fov: 28 }; }
    if (t < CUE.spray) return { pos: V(0.14, 0.16, 0.2), tgt: V(0, 0.115, 0), fov: 28 };
    const f = ease.outCubic(prog(t, CUE.spray, CUE.spray + 1)); return { pos: L(V(0.26, 0.1, 0.32), V(0.3, 0.11, 0.37), f), tgt: V(0.02, 0.075, 0), fov: 28 };
  }
  const dropY = (t) => lerp(0.3, LAND.y, Math.pow(prog(t, CUE.dropFall, CUE.dropLand), 1.6));

  return {
    scene, camera,
    update(t) {
      const capY = t < CUE.cap - 0.5 ? 0.25 : 0.12 * (1 - ease.inCubic(prog(t, CUE.cap - 0.5, CUE.cap))) + Math.sin(Math.PI * prog(t, CUE.cap, CUE.cap + 0.12)) * 0.002;
      for (const b of [p, mirror]) { b.cap.position.y = capY; b.cap.visible = t >= CUE.cap - 0.5; b.group.rotation.y = 0.35 + 0.25 * prog(t, CUE.sweep, CUE.spray + 1); }
      drop.visible = t < CUE.dropLand; drop.position.set(LAND.x, dropY(t), LAND.z);
      const ds = t - CUE.dropLand;
      splash.visible = ds > 0 && ds < 1.2;
      SPL.forEach((d, i) => { v.set(LAND.x + d.x * ds * 0.6, LAND.y + d.y * ds * 0.6 - 0.25 * ds * ds, LAND.z + d.z * ds * 0.6); splash.setMatrixAt(i, m4.compose(v, q, s.setScalar(Math.max(0.001, 1 - ds)))); });
      splash.instanceMatrix.needsUpdate = true;
      const sw = prog(t, CUE.sweep, CUE.sweep + 1.6); bar.position.set(lerp(-0.45, 0.45, ease.inOutSine(sw)), 0.12, -0.2); bar.visible = t >= CUE.sweep && t < CUE.cap;
      const ms = t - CUE.spray; mist.visible = ms > 0;
      for (let i = 0; i < 260; i++) {
        const a = Math.max(0, ms - hash(i, 94) * 0.25), d = 1 - Math.exp(-a * 2.5), ang = (hash(i, 95) - 0.5) * 0.9, el = (hash(i, 96) - 0.5) * 0.6;
        v.set(0.018 + Math.cos(ang) * d * 0.28, 0.122 + el * d * 0.2 + a * 0.01, Math.sin(ang) * d * 0.28);
        q.copy(camera.quaternion); mist.setMatrixAt(i, m4.compose(v, q, s.setScalar(a > 0 ? 0.008 + d * 0.04 : 0.0001)));
      }
      mist.instanceMatrix.needsUpdate = true;
      const c = shot(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.fov = c.fov; camera.updateProjectionMatrix();
    },
    look() { return { bloom: 0.45, contrast: 1.06, gain: '#FFF1E2', vig: 0.5 }; },
  };
}
