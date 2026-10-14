// 1:28–1:32 — END. The final hit lands on black; then the chrome mark from ACTION (a placeholder until the product
// has a name) turns under a passing light, above the closing line and the note that every number was measured.
import * as THREE from 'three';
import { W, H, CUE, DURATION } from '../timeline.js';
import { ease, prog, lerp } from '../util.js';
import { studioEnv } from '../engine.js';

export function createEnd(sh) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#000000');
  scene.environment = studioEnv(sh.renderer, { strips: 2.2 }); scene.environmentIntensity = 1.3;
  const camera = new THREE.PerspectiveCamera(26, W / H, 0.05, 50); camera.position.set(0, 0.0, 4.4); camera.lookAt(0, 0.0, 0);
  const chrome = new THREE.MeshPhysicalMaterial({ color: '#EEF1F5', roughness: 0.05, metalness: 1 });
  const mark = new THREE.Group(); mark.position.y = 0.32; scene.add(mark);
  mark.add(new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.055, 32, 128), chrome));
  const tri = new THREE.Shape(); tri.moveTo(-0.17, -0.24); tri.lineTo(0.27, 0); tri.lineTo(-0.17, 0.24); tri.closePath();
  const play = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 4 }), chrome); play.position.z = -0.04; mark.add(play);
  const line = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.004, 6, 160), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1, 0.3) })); mark.add(line);
  const sweep = new THREE.PointLight('#FFFFFF', 0, 6, 1.5); scene.add(sweep);
  return {
    scene, camera,
    update(t) {
      const on = t >= CUE.card, a = ease.outCubic(prog(t, CUE.card, CUE.card + 0.6));
      mark.visible = on; mark.scale.setScalar(lerp(0.9, 1, a));
      mark.rotation.set(0.12 * (1 - a), lerp(-0.55, 0.12, ease.outCubic(prog(t, CUE.card, DURATION))), 0);
      sweep.position.set(lerp(-2.2, 2.2, prog(t, CUE.card, CUE.card + 2.4)), 0.8, 1.4); sweep.intensity = on ? 8 : 0;
      line.material.color.setRGB(2.6, 1, 0.3).multiplyScalar(a);
    },
    look(t) { return { bloom: 0.5, contrast: 1.08, vig: 0.5, fade: 1 - prog(t, DURATION - 0.35, DURATION) }; },
  };
}
