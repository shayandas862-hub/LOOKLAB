// The world of worlds: a round plaza with all eight film worlds rising around it as sectors of one ground.
// Sector k covers angles [k·45°, (k+1)·45°); a point at angle θ, radius r sits at (r cos θ, 0, −r sin θ).
import * as THREE from 'three';
import { canvasTex, stars, sky } from './worldkit.js';
import { gridFloor } from './props.js';
import { hash } from './util.js';

const PI = Math.PI, SEC = PI / 4, R0 = 7.5, R1 = 46;
const at = (th, r, y = 0) => new THREE.Vector3(r * Math.cos(th), y, -r * Math.sin(th));

function sectorGround(k, mat) {
  const g = new THREE.RingGeometry(R0, R1, 40, 2, k * SEC + 0.004, SEC - 0.008); g.rotateX(-PI / 2);
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; return m;
}
// n props spread through sector k: f(r) gets a random source, returns an Object3D placed at (θ, r).
function scatter(group, k, n, seed, f, { rMin = R0 + 3, rMax = R1 - 4 } = {}) {
  for (let i = 0; i < n; i++) {
    const r = (q) => hash(i * 7 + q, seed + k * 31), th = k * SEC + 0.08 + (SEC - 0.16) * r(1), rad = rMin + (rMax - rMin) * Math.sqrt(r(2));
    const o = f(r, i); o.position.add(at(th, rad)); o.rotation.y += r(3) * PI * 2; group.add(o);
  }
}
const mesh = (geo, mat, cast = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; return m; };

export function worldRing() {
  const group = new THREE.Group(), sectors = [];
  group.add(sky('#0B0F1E', '#000000', { power: 0.6, radius: 500 }), stars(1800, 400, 1.4));
  const plaza = mesh(new THREE.CircleGeometry(R0, 64).rotateX(-PI / 2), new THREE.MeshStandardMaterial({ color: '#0A0A0D', roughness: 0.3, metalness: 0.6 }), false); group.add(plaza);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(R0, 0.03, 6, 160), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 0.9, 0.25) })); edge.rotation.x = PI / 2; edge.position.y = 0.02; group.add(edge);
  const box = new THREE.BoxGeometry(1, 1, 1); box.translate(0, 0.5, 0);
  const win = canvasTex(128, 256, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); for (let y = 3; y < h; y += 7) for (let x = 3; x < w; x += 6) { const r = hash(x * 5 + y, 3); if (r > 0.6) { c.fillStyle = r > 0.93 ? '#FF5BD8' : r > 0.86 ? '#7FD9FF' : '#FFC98A'; c.fillRect(x, y, 3, 4); } } }, { repeat: [2, 3] });
  const B = [
    (g, k) => { // neon city
      g.add(sectorGround(k, new THREE.MeshStandardMaterial({ color: '#07080C', roughness: 0.3, metalness: 0.7 })));
      scatter(g, k, 18, 1, (r) => { const h = 5 + 20 * r(4); const m = mesh(box, new THREE.MeshStandardMaterial({ color: '#0A0C13', emissive: '#ffffff', emissiveMap: win, emissiveIntensity: 0.9 })); m.scale.set(3 + 3 * r(5), h, 3 + 3 * r(6)); return m; });
      scatter(g, k, 6, 2, (r) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 0.3), new THREE.MeshBasicMaterial({ color: new THREE.Color(['#FF2BD6', '#23E5FF'][r(4) > 0.5 ? 1 : 0]).multiplyScalar(2.5) })); m.position.y = 3 + 4 * r(5); return m; });
    },
    (g, k) => { // desert
      g.add(sectorGround(k, new THREE.MeshStandardMaterial({ color: '#D9A46B', roughness: 0.95 })));
      scatter(g, k, 6, 3, (r) => { const h = 8 + 14 * r(4), m = mesh(new THREE.CylinderGeometry(3 + 3 * r(5), 4 + 4 * r(5), h, 7), new THREE.MeshStandardMaterial({ color: '#8C4B34', roughness: 1, flatShading: true })); m.position.y = h / 2; return m; }, { rMin: 18 });
    },
    (g, k) => { // under the sea
      g.add(sectorGround(k, new THREE.MeshStandardMaterial({ color: '#2E8C8A', roughness: 0.9, emissive: '#0E5A60', emissiveIntensity: 0.5 })));
      const kelp = new THREE.MeshStandardMaterial({ color: '#1F6B45', roughness: 0.7 });
      scatter(g, k, 34, 4, (r) => { const h = 3 + 6 * r(4), m = mesh(new THREE.CylinderGeometry(0.06, 0.12, h, 6), kelp); m.position.y = h / 2; m.rotation.z = (r(5) - 0.5) * 0.3; return m; });
      const bub = new THREE.MeshStandardMaterial({ color: '#DDF7FF', emissive: '#9FE8FF', emissiveIntensity: 1.2 });
      scatter(g, k, 40, 5, (r) => { const m = mesh(new THREE.SphereGeometry(0.08 + 0.2 * r(4), 10, 8), bub, false); m.position.y = 0.5 + 7 * r(5); return m; });
    },
    (g, k) => { // snowy peaks
      g.add(sectorGround(k, new THREE.MeshStandardMaterial({ color: '#F3F6FA', roughness: 0.9 })));
      scatter(g, k, 4, 6, (r) => { const h = 16 + 14 * r(4), m = mesh(new THREE.ConeGeometry(8 + 5 * r(5), h, 7), new THREE.MeshStandardMaterial({ color: '#E8EEF5', roughness: 0.9, flatShading: true })); m.position.y = h / 2; return m; }, { rMin: 26 });
      const pine = new THREE.MeshStandardMaterial({ color: '#1C3A33', roughness: 0.8, flatShading: true });
      scatter(g, k, 16, 7, (r) => { const s = 1 + 1.5 * r(4), m = mesh(new THREE.ConeGeometry(s, 3 * s, 7), pine); m.position.y = 1.5 * s; return m; }, { rMax: 26 });
    },
    (g, k) => { // the moon
      g.add(sectorGround(k, new THREE.MeshStandardMaterial({ color: '#7A7C82', roughness: 1 })));
      const rim = new THREE.TorusGeometry(1, 0.16, 6, 28); rim.rotateX(PI / 2);
      scatter(g, k, 12, 8, (r) => { const m = mesh(rim, new THREE.MeshStandardMaterial({ color: '#8E9096', roughness: 1 })); const s = 1 + 3 * r(4); m.scale.set(s, s * 0.35, s); return m; });
      const p = new THREE.Group(); const ball = new THREE.Mesh(new THREE.SphereGeometry(3.4, 40, 24), new THREE.MeshStandardMaterial({ color: '#D7A26E', roughness: 1 })); p.add(ball);
      const ring = new THREE.Mesh(new THREE.RingGeometry(4.4, 6.8, 64), new THREE.MeshBasicMaterial({ color: '#E8D2AE', side: THREE.DoubleSide, transparent: true, opacity: 0.7 })); ring.rotation.x = PI / 2 - 0.4; p.add(ring);
      p.position.copy(at(k * SEC + SEC / 2, 30, 16)); g.add(p);
    },
    (g, k) => { // ink comic
      g.add(sectorGround(k, new THREE.MeshBasicMaterial({ color: '#F4EFE4' })));
      const ink = new THREE.MeshBasicMaterial({ color: '#0B0A0D', side: THREE.BackSide }), paper = new THREE.MeshToonMaterial({ color: '#FFFFFF' });
      scatter(g, k, 10, 9, (r) => { const o = new THREE.Group(), w = 3 + 4 * r(4), h = 4 + 12 * r(5), d = 3 + 3 * r(6); const a = mesh(box, paper); a.scale.set(w, h, d); const b = new THREE.Mesh(box, ink); b.scale.set(w + 0.3, h + 0.3, d + 0.3); o.add(a, b); return o; });
    },
    (g, k) => { // chrome studio
      g.add(sectorGround(k, new THREE.MeshStandardMaterial({ color: '#050506', roughness: 0.15, metalness: 0.6 })));
      const chrome = new THREE.MeshPhysicalMaterial({ color: '#EEF1F5', roughness: 0.04, metalness: 1 }), shapes = [new THREE.SphereGeometry(1.2, 40, 24), new THREE.TorusKnotGeometry(0.9, 0.3, 120, 16), new THREE.IcosahedronGeometry(1.3, 0)];
      scatter(g, k, 9, 10, (r, i) => { const m = mesh(shapes[i % 3], chrome); m.position.y = 1.5 + 3 * r(4); return m; });
      scatter(g, k, 6, 11, (r) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.25, 7, 0.25), new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 2, 2.1) })); m.position.y = 3.5; return m; });
    },
    (g, k) => { // type and data
      const gf = gridFloor({ cell: 1 }); gf.geometry.dispose(); gf.geometry = new THREE.RingGeometry(R0, R1, 40, 2, k * SEC + 0.004, SEC - 0.008); gf.rotation.set(0, 0, 0); gf.geometry.rotateX(-PI / 2); gf.userData.u.gBoost.value = 0.9; g.add(gf);
      const bar = new THREE.MeshStandardMaterial({ color: '#111216', roughness: 0.3, metalness: 0.7, emissive: '#FF6A1A', emissiveIntensity: 0.35 });
      scatter(g, k, 22, 12, (r) => { const m = mesh(box, bar); m.scale.set(0.8, 1 + 7 * r(4), 0.8); return m; });
      ['SHOT 07', '24 FPS', 'f/2.8', '5600K', 'TAKE 03', 'ROLL 12'].forEach((txt, i) => {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(512, 96, (c, w, h) => { c.font = '700 54px "JetBrains Mono"'; c.fillStyle = i % 2 ? '#FFFFFF' : '#FF6A1A'; c.textBaseline = 'middle'; c.fillText(txt, 8, h / 2); }), transparent: true, depthWrite: false }));
        s.scale.set(6, 1.1, 1); s.position.copy(at(k * SEC + 0.1 + 0.1 * i, 14 + 4 * i, 3 + (i % 3) * 2)); g.add(s);
      });
    },
  ];
  B.forEach((build, k) => { const g = new THREE.Group(); build(g, k); group.add(g); sectors.push(g); });
  const key = new THREE.DirectionalLight('#FFF1E2', 2.4); key.position.set(-10, 18, 12); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 80 }); key.shadow.bias = -0.0004; group.add(key);
  group.add(new THREE.HemisphereLight('#9FB2E0', '#2A1C14', 0.55));
  return {
    group, plaza, edge,
    // rise: 0..1 per sector, staggered by the caller.
    update(rise) { sectors.forEach((g, k) => { const r = rise(k); g.visible = r > 0.001; g.scale.set(1, Math.max(0.001, r), 1); g.position.y = -0.02 * (1 - r); }); },
  };
}
