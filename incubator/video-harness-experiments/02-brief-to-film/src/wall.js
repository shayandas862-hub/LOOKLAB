// Act 2: a split-flap wall of 864 rounded tiles. Words are 5×7 pixel glyphs; each change
// flips the tiles in a wave from left to right, and the glow swaps at the half-turn.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { T, C } from './timeline.js';
import { ease, prog, hash } from './util.js';

export const COLS = 48, ROWS = 18, PITCH = 0.3, CENTER = new THREE.Vector3(0, 2.95, -14);

const GLYPHS = {
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
};

function bitmap(word) {
  const on = new Uint8Array(COLS * ROWS), w = word.length * 6 - 1, c0 = Math.floor((COLS - w) / 2), r0 = Math.floor((ROWS - 7) / 2);
  [...word].forEach((ch, k) => GLYPHS[ch].forEach((row, r) => [...row].forEach((px, c) => { if (px === '#') on[(r0 + r) * COLS + c0 + k * 6 + c] = 1; })));
  return on;
}

const signal = new THREE.Color(C.signalHex), bone = new THREE.Color(C.bone);
const STATES = [
  { t: -1, on: new Uint8Array(COLS * ROWS), emit: new THREE.Color(0, 0, 0) },
  { t: T.words[0], on: bitmap('CODE'), emit: signal.clone().multiplyScalar(4.5) },
  { t: T.words[1], on: bitmap('IMAGE'), emit: bone.clone().multiplyScalar(0.55) },
  { t: T.words[2], on: bitmap('VIDEO'), emit: bone.clone().multiplyScalar(0.55) },
  { t: T.sweep, on: new Uint8Array(COLS * ROWS).fill(1), emit: signal.clone().multiplyScalar(2.2) },
];

export function tilePosition(i, out = new THREE.Vector3()) {
  const c = i % COLS, r = Math.floor(i / COLS);
  return out.set(CENTER.x + (c - (COLS - 1) / 2) * PITCH, CENTER.y + ((ROWS - 1) / 2 - r) * PITCH, CENTER.z);
}

export function createWall(scene) {
  const n = COLS * ROWS;
  const geo = new RoundedBoxGeometry(PITCH * 0.88, PITCH * 0.88, 0.07, 2, 0.022);
  const emit = new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3);
  geo.setAttribute('aEmit', emit);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.28, metalness: 0.55 });
  mat.onBeforeCompile = (s) => {
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 aEmit; varying vec3 vEmit;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEmit = aEmit;');
    s.fragmentShader = s.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vEmit;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += vEmit * (0.35 + 0.65 * smoothstep(-0.2, 0.9, normal.z));');
  };
  const mesh = new THREE.InstancedMesh(geo, mat, n);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const key = new THREE.SpotLight(0xfff1e2, 60, 30, 0.6, 0.6, 1.4);
  key.position.set(-6, 7, -6); key.target.position.copy(CENTER); scene.add(key, key.target);

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  const col = new THREE.Color();

  return function update(t) {
    mesh.visible = t > T.tilesIn[0] - 0.05 && t < 8.2;
    key.intensity = mesh.visible ? 60 : 0;
    if (!mesh.visible) return;
    for (let i = 0; i < n; i++) {
      const c = i % COLS, r = Math.floor(i / COLS);
      tilePosition(i, p);
      // Arrival: tiles grow out from the centre.
      const dc = Math.hypot(c - COLS / 2, (r - ROWS / 2) * 1.6) / COLS;
      const sIn = ease.outBack(prog(t, T.tilesIn[0] + dc * 0.35, T.tilesIn[0] + dc * 0.35 + 0.3));
      // Flips: one half-turn per state change, swept left to right.
      let turns = 0, state = STATES[0], pop = 0;
      for (let k = 1; k < STATES.length; k++) {
        const tf = STATES[k].t + (c / COLS) * T.wave + hash(i, k) * 0.05;
        const f = ease.inOutCubic(prog(t, tf, tf + T.flip));
        turns += f; if (f >= 0.5) state = STATES[k];
        pop += Math.sin(Math.PI * f) * 0.12;
      }
      const ripple = 0.025 * Math.sin(t * 2.2 + c * 0.35 + r * 0.25);
      p.z += ripple + pop;
      e.set(turns * Math.PI, 0, 0); q.setFromEuler(e);
      s.setScalar(Math.max(0.0001, sIn));
      m.compose(p, q, s); mesh.setMatrixAt(i, m);
      col.copy(state.emit).multiplyScalar(state.on[i] ? 1 : 0);
      if (!state.on[i] && state !== STATES[0]) col.setRGB(0.012, 0.012, 0.012);
      emit.setXYZ(i, col.r, col.g, col.b);
    }
    mesh.instanceMatrix.needsUpdate = true; emit.needsUpdate = true;
  };
}
