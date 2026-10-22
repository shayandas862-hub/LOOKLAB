// S6 (a test, not in the ad yet): a person behind the café counter holds the açaí bowl up to the camera, which arcs
// round them, 5 s. Metres here. The person is the clay stand-in (figure.js); the bowl is the ad's own bowl, full,
// scaled from its 8 cm units. update(t) sets the pose, the bowl in the hands and the camera.
import * as THREE from 'three';
import { BRAND, ease, fovOf, span } from './timeline.js';
import { gradientTexture } from './engine.js';
import { createBowl } from './bowl.js';
import { createFigure } from './figure.js';

export const PERSON = { id: 'S6', name: 'PERSON', t: [0, 5], lens: 50 };
const lerp = (a, b, k) => a + (b - a) * k;

function counter() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.92, 0.55), new THREE.MeshStandardMaterial({ color: '#e9dfcf', roughness: 0.7 }));
  body.position.set(0, 0.46, 0); const top = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.04, 0.6), new THREE.MeshStandardMaterial({ color: '#c9a477', roughness: 0.5 }));
  top.position.set(0, 0.94, 0); g.add(body, top);
  g.traverse((m) => { if (m.isMesh) m.castShadow = m.receiveShadow = true; });
  g.position.z = 0.42;
  return g;
}

function wall() {
  const g = new THREE.Group();
  const w = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshStandardMaterial({ color: BRAND, roughness: 0.9 }));
  w.position.set(0, 2, -1.1); w.receiveShadow = true;
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.6, 0.03), new THREE.MeshStandardMaterial({ color: '#1f2420', roughness: 0.95 }));
  board.position.set(-0.55, 1.75, -1.08);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.66, 0.02), new THREE.MeshStandardMaterial({ color: '#8a6a43', roughness: 0.7 }));
  frame.position.set(-0.55, 1.75, -1.095);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 6).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#9c5a3c', roughness: 0.85 }));
  floor.receiveShadow = true;
  g.add(w, frame, board, floor);
  return g;
}

export function createPersonSet(env) {
  const scene = new THREE.Scene();
  scene.environment = env; scene.environmentIntensity = 0.5;
  scene.background = gradientTexture('#d8b64c', '#c39f36', '#6d5217');
  scene.add(new THREE.HemisphereLight('#fff3df', '#3b2a1c', 0.5));
  const key = new THREE.DirectionalLight('#fff0d4', 2.4); key.position.set(-1.6, 3.2, 2.4); key.castShadow = true;
  Object.assign(key.shadow.camera, { left: -1.5, right: 1.5, top: 2.5, bottom: -0.5, near: 0.5, far: 8 });
  key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 4; key.shadow.bias = -0.0004; key.shadow.normalBias = 0.01;
  key.target.position.set(0, 1, 0);
  const rim = new THREE.DirectionalLight('#ffe6bd', 1.8); rim.position.set(1.5, 2.5, -2.5);
  scene.add(key, key.target, rim, wall());
  const desk = counter(); scene.add(desk);

  const fig = createFigure(); scene.add(fig.root);
  const bowl = createBowl(); bowl.update(99);
  bowl.group.scale.setScalar(0.08);
  bowl.group.traverse((m) => { if (m.isMesh && m !== bowl.glass) m.castShadow = m.receiveShadow = true; });
  scene.add(bowl.group);

  const camera = new THREE.PerspectiveCamera(fovOf(PERSON.lens), 9 / 16, 0.05, 30);
  const look = new THREE.Vector3(0, 1.3, 0), a = new THREE.Vector3(), b = new THREE.Vector3();

  function update(t) {
    const k = ease(span(t, ...PERSON.t)), az = lerp(-24, 24, k), el = lerp(4, 7, k), dist = lerp(3.5, 3.15, k);
    const r = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
    camera.position.set(look.x + dist * Math.cos(e) * Math.sin(r), look.y + dist * Math.sin(e), look.z + dist * Math.cos(e) * Math.cos(r));
    camera.lookAt(look);
    // Holding the bowl in both hands at chest height, lifting it a little towards the lens; the head follows the camera.
    const lift = ease(span(t, 0.6, 3.2));
    const armHold = [lerp(0.68, 0.8, lift), -0.4, lerp(1.32, 1.22, lift)];
    fig.setPose({ y: 0.004 * Math.sin(t * 2.2), bend: 0.03, headYaw: r * 0.55, headPitch: 0.04 - 0.03 * lift, armL: armHold, armR: armHold });
    fig.root.updateMatrixWorld(true);
    fig.hands[0].getWorldPosition(a); fig.hands[1].getWorldPosition(b);
    bowl.group.position.copy(a).add(b).multiplyScalar(0.5).add(new THREE.Vector3(0, -0.035, 0.03));
    bowl.group.rotation.set(0.3, 0.5, 0);
    return PERSON;
  }
  const parts = { person: fig.root, head: fig.head, bowl: bowl.group, counter: desk };
  return { scene, camera, update, parts };
}
