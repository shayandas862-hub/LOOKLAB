// 0:00–0:12 — BRIEF. The sentence is typed in space, one key per sixteenth note. The full stop is a real light:
// the camera pushes into it until it fills the frame, and the plan begins on the other side.
import * as THREE from 'three';
import { W, H, CUE, COPY, BEAT } from '../timeline.js';
import { ease, prog, lerp, hash } from '../util.js';
import { gridFloor } from '../props.js';

const CW = 2560, CH = 256, PW = 3.2, PH = PW * (CH / CW), FONT = '400 72px "JetBrains Mono"';

export function createBrief(sh) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#000000'); scene.fog = new THREE.FogExp2('#000000', 0.08);
  const camera = new THREE.PerspectiveCamera(30, W / H, 0.001, 200);
  const floor = gridFloor({ cell: 0.5 }); floor.position.y = -2.2; floor.userData.u.gBoost.value = 0.12; scene.add(floor);
  const canvas = document.createElement('canvas'); canvas.width = CW; canvas.height = CH; const g = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  scene.add(plane);
  g.font = FONT; g.letterSpacing = '2px';
  const text = COPY.brief, body = text.slice(0, -1), x0 = (CW - g.measureText(text).width) / 2;
  // Where the full stop sits, in metres on the plane.
  g.textBaseline = 'middle';
  const m = g.measureText('.'), dotPx = x0 + g.measureText(body).width + (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2 + 2;
  const dotPy = (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2, dotR = (0.55 * (m.actualBoundingBoxRight + m.actualBoundingBoxLeft) / CW) * PW;
  const DOT = new THREE.Vector3((dotPx / CW - 0.5) * PW, (-dotPy / CH) * PH, 0.001);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(Math.max(0.004, dotR), 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1) })); dot.position.copy(DOT); scene.add(dot);
  // Dust between us and the words, so the push has depth.
  const N = 900, dp = new Float32Array(N * 3); for (let i = 0; i < N; i++) dp.set([(hash(i, 1) - 0.5) * 8, (hash(i, 2) - 0.5) * 4, -2 + hash(i, 3) * 6], i * 3);
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: '#FFC9A0', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.5 })); scene.add(dust);
  let typed = -1, cursorOn = null;

  function draw(n, cursor) {
    if (n === typed && cursor === cursorOn) return; typed = n; cursorOn = cursor;
    g.clearRect(0, 0, CW, CH); g.font = FONT; g.letterSpacing = '2px'; g.fillStyle = '#F4F1EC'; g.textBaseline = 'middle';
    const s = text.slice(0, Math.min(n, body.length)); g.fillText(s, x0, CH / 2);
    if (cursor) { const cx = x0 + g.measureText(s).width + 4; g.fillStyle = '#FF6A1A'; g.fillRect(cx, CH / 2 - 40, 40, 78); }
    tex.needsUpdate = true;
  }

  return {
    scene, camera,
    update(t) {
      const n = Math.max(0, Math.floor((t - CUE.typeStart) / CUE.typeStep) + 1), done = n > body.length;
      const cursor = !done && ((t % BEAT) < BEAT / 2 || (t > CUE.typeStart && n > 0));
      draw(t < CUE.typeStart ? 0 : n, t < CUE.typeStart ? (t % BEAT) < BEAT / 2 : cursor);
      dot.visible = done; dot.material.color.setScalar(1 + 14 * ease.inCubic(prog(t, CUE.dot[0] + 2.5, CUE.dot[1])));
      // The push: slow at first, then falling into the full stop.
      const f = ease.inCubic(prog(t, CUE.dot[0], CUE.dot[1] - 0.05));
      const start = new THREE.Vector3(0, 0, 3.6), end = DOT.clone().add(new THREE.Vector3(0, 0, 0.004));
      camera.position.copy(start.lerp(end, f)); camera.position.y += 0.02 * Math.sin(t * 0.9) * (1 - f);
      camera.lookAt(new THREE.Vector3(0, 0, 0).lerp(DOT, Math.min(1, f * 3)));
      camera.fov = lerp(30, 24, f); camera.updateProjectionMatrix();
      floor.userData.u.gBoost.value = 0.12 * (1 - f);
    },
    look(t) { return { bloom: 0.6, contrast: 1.04, vig: 0.5, flash: ease.inCubic(prog(t, CUE.dot[1] - 0.35, CUE.dot[1])) }; },
  };
}
