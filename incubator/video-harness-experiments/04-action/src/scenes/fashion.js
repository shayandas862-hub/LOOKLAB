// 0:56–1:04 — FASHION and the TAG. An orange silk sheet whips away on the crash to reveal faceless chrome models
// walking at camera in the jacket and the sneakers; flashbulbs pop on the beat; the jacket changes colour every
// beat while the checker matches it to the brand swatch. Then the hero, in the same jacket and sneakers, walks
// out of a ring of the three products.
import * as THREE from 'three';
import { W, H, CUE, BEAT, events } from '../timeline.js';
import { ease, prog, lerp, hash } from '../util.js';
import { createFigure, walk, stand, mix, chromeMat } from '../figure.js';
import { sneaker, perfume, jacketMat, JACKETS } from '../products.js';
import { canvasTex } from '../worldkit.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const L = (a, b, f) => a.clone().lerp(b, f);
const shoes = () => { const s = sneaker(); s.group.scale.setScalar(0.8); return s.group; };
const FLASHES = events().filter((e) => e.type === 'flash');

export function jacketIndex(t) { return t < CUE.swatches[0] ? 0 : (Math.floor((t - CUE.swatches[0]) / BEAT) + 1) % JACKETS.length; }

export function createFashion(sh) {
  const scene = new THREE.Scene(); scene.environment = sh.env; scene.environmentIntensity = 1.0;
  scene.background = new THREE.Color('#020203'); scene.fog = new THREE.FogExp2('#050507', 0.05);
  const camera = new THREE.PerspectiveCamera(32, W / H, 0.05, 200);
  const runway = new THREE.Mesh(new THREE.BoxGeometry(3, 0.3, 34), new THREE.MeshStandardMaterial({ color: '#0B0B0E', roughness: 0.55, metalness: 0.15 }));
  runway.position.set(0, -0.15, -8); runway.receiveShadow = true; scene.add(runway);
  for (const x of [-1.52, 1.52]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 34), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 0.8, 0.85) })); e.position.set(x, 0.0, -8); scene.add(e); }
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: '#030304', roughness: 0.9 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -0.3; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), new THREE.MeshBasicMaterial({ color: '#000000' })); wall.position.set(0, 4, -24); scene.add(wall);
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(9, 0.22), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 0.6, 0.16) })); strip.position.set(0, 3.2, -23.9); scene.add(strip);
  const jacket = jacketMat();
  const models = [[0, -9.4], [-1.05, -11.0], [1.05, -11.2]].map(([x, z], i) => {
    const f = createFigure({ body: chromeMat() }); f.wear({ jacket, shoes }); f.root.position.set(x, 0, z); scene.add(f.root); return { f, x, z, off: i * 0.13 };
  });
  for (const [x, z] of [[-1.2, -6], [1.2, -3], [0, 1]]) {
    const s = new THREE.SpotLight('#FFF6EC', 9, 0, 0.42, 0.5, 1.4); s.position.set(x, 7, z); s.target.position.set(0, 1, z - 1); s.castShadow = x === 0; s.shadow.mapSize.set(1024, 1024); scene.add(s, s.target);
  }
  const back = new THREE.DirectionalLight('#FF9A55', 1.2); back.position.set(0, 3, -20); scene.add(back);
  const flash = new THREE.PointLight('#FFFFFF', 0, 14, 1.6); scene.add(flash);
  const pops = FLASHES.map((e, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ color: new THREE.Color(6, 6, 6), transparent: true, depthWrite: false }));
    const side = i % 2 ? 1 : -1; s.position.set(side * (2.6 + 3 * hash(i, 101)), 0.9 + 1.2 * hash(i, 102), -10 + 13 * hash(i, 103)); s.scale.setScalar(0.18); scene.add(s); return { s, t: e.t };
  });
  // The silk: a 60×45 sheet that sways, then whips up and away on the crash.
  const silkGeo = new THREE.PlaneGeometry(6.4, 4.8, 60, 45), base = silkGeo.attributes.position.array.slice();
  const silk = new THREE.Mesh(silkGeo, new THREE.MeshPhysicalMaterial({ color: '#FF5A12', roughness: 0.38, sheen: 1, sheenRoughness: 0.3, sheenColor: new THREE.Color('#FFD2A8'), side: THREE.DoubleSide }));
  silk.position.set(0, 2.4, -7.6); silk.castShadow = true; scene.add(silk);

  function updateSilk(t) {
    const k = ease.inCubic(prog(t, CUE.silk - 0.08, CUE.silk + 0.7)), p = silkGeo.attributes.position;
    silk.visible = k < 1;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], nx = (x + 3.2) / 6.4, ny = (y + 2.4) / 4.8;
      const sway = 0.06 * Math.sin(x * 1.7 + t * 2.2) + 0.04 * Math.sin(y * 2.3 + t * 1.6);
      const wave = Math.sin(nx * 7 - ny * 3 - t * 22) * 0.5 * k;
      p.setXYZ(i, x + k * k * (5 + 4 * ny) + wave * 0.3, y + k * k * (7 + 7 * (1 - nx) * ny) + wave * 0.4, sway + wave + k * 2.5 * ny);
    }
    p.needsUpdate = true; silkGeo.computeVertexNormals();
  }
  const leadZ = (t) => models[0].z + 1.5 * Math.max(0, t - CUE.silk);
  function shot(t) {
    if (t < CUE.swatches[0]) { const f = prog(t, CUE.silk - 0.1, CUE.swatches[0]); return { pos: L(V(0, 1.25, 6.8), V(0, 1.2, 5.6), f), tgt: V(0, 1.4, -7), fov: 30 }; }
    const z = leadZ(t);
    if (t < CUE.swatches[4]) return { pos: V(0.3, 1.45, z + 3.1), tgt: V(0, 1.3, z), fov: 30 };
    if (t < CUE.swatches[6]) return { pos: V(1.5, 0.22, z + 0.6), tgt: V(0, 0.2, z - 0.1), fov: 34 };
    return { pos: V(0.42, 1.38, z + 1.05), tgt: V(0, 1.24, z), fov: 30 };
  }
  return {
    scene, camera,
    update(t) {
      updateSilk(t);
      jacket.color.set(JACKETS[jacketIndex(t)]);
      models.forEach((m) => {
        const go = Math.max(0, t - CUE.silk), ph = go / 1.0 + m.off;
        m.f.setPose(go > 0 ? walk(ph) : stand(t)); m.f.root.position.set(m.x, 0, m.z + 1.5 * go);
      });
      let best = null;
      pops.forEach((p) => { const a = t - p.t, on = a >= 0 && a < 0.08; p.s.visible = on; p.s.material.opacity = on ? 1 - a / 0.08 : 0; if (a >= 0 && a < 0.12 && (!best || p.t > best.t)) best = p; });
      flash.intensity = best ? 18 * Math.exp(-(t - best.t) / 0.04) : 0; if (best) flash.position.copy(best.s.position);
      const c = shot(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.fov = c.fov; camera.updateProjectionMatrix();
    },
    look(t) { const c = '#' + new THREE.Color(JACKETS[jacketIndex(t)]).getHexString(); return { bloom: 0.4, contrast: 1.1, vig: 0.45, swatch: { shot: c, brand: c } }; },
  };
}

export function createTag(sh) {
  const scene = new THREE.Scene(); scene.environment = sh.env; scene.environmentIntensity = 1.0; scene.background = new THREE.Color('#030304');
  const camera = new THREE.PerspectiveCamera(32, W / H, 0.05, 100);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 64), new THREE.MeshStandardMaterial({ color: '#08080A', roughness: 0.3, metalness: 0.5 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const hero = createFigure(); hero.wear({ jacket: jacketMat('#FF6A1A'), shoes }); scene.add(hero.root);
  const shoe = sneaker(); shoe.group.scale.setScalar(2.3); scene.add(shoe.group);
  const bottle = perfume(); bottle.group.scale.setScalar(3.6); scene.add(bottle.group);
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1, 0.3) });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.006, 8, 160), ringMat); ring.rotation.x = Math.PI / 2 - 0.15; ring.position.y = 1.1; scene.add(ring);
  const key = new THREE.DirectionalLight('#FFF4E8', 2.6); key.position.set(-2, 4, 3); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 }); scene.add(key);
  const rim = new THREE.DirectionalLight('#FF7A2E', 4); rim.position.set(2, 2, -3); scene.add(rim);
  return {
    scene, camera,
    update(t) {
      const a = (t - CUE.orbit) * 3.2, w = prog(t, CUE.fill, CUE.fill + 1);
      hero.root.position.set(-1.6 * ease.inCubic(w), 0, 1.4 * ease.inCubic(w)); hero.root.rotation.y = -0.9 * prog(t, CUE.fill - 0.2, CUE.fill + 0.1);
      hero.setPose(w > 0 ? walk(w * 2.2) : mix(stand(t * 2), { ...stand(), headYaw: Math.sin(a * 0.5) * 0.4 }, 0.6));
      shoe.group.position.set(Math.cos(a) * 1.15, 1.05 + 0.12 * Math.sin(a * 2), Math.sin(a) * 1.15); shoe.group.rotation.set(0.3, -a * 1.6, 0.2);
      bottle.group.position.set(Math.cos(a + Math.PI) * 1.15, 1.0 + 0.12 * Math.sin(a * 2 + 1), Math.sin(a + Math.PI) * 1.15); bottle.group.rotation.set(0, a * 1.3, 0);
      bottle.cap.position.y = 0; ring.rotation.z = a * 0.2; ringMat.color.setRGB(2.6, 1, 0.3).multiplyScalar(1 - w);
      const f = ease.inOutSine(prog(t, CUE.orbit, CUE.orbit + 2));
      camera.position.set(lerp(0.7, 0.2, f), lerp(1.35, 1.25, f), lerp(3.4, 2.6, f)); camera.lookAt(0, 1.05, 0); camera.fov = 32; camera.updateProjectionMatrix();
    },
    blur() { return 2; },
    look() { return { bloom: 0.6, contrast: 1.08, vig: 0.45 }; },
  };
}
