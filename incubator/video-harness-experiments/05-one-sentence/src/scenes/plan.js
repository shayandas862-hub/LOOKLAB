// 0:12–0:28 — PLAN and ROUTE. Four storyboard cards are sketched live by a glowing pencil, then unfold into their
// shot packages: a wireframe of the set and a camera frustum drawn with the shot's real lens. The cards line up and
// fly into four engine gates; the camera follows one into the 3D gate and down a tunnel of light.
import * as THREE from 'three';
import { W, H, CUE, COPY, SHOTS, fovOf } from '../timeline.js';
import { ease, prog, lerp, clamp, hash } from '../util.js';
import { gridFloor } from '../props.js';
import { sneaker } from '../products.js';
import { createFigure, run } from '../figure.js';
import { SKETCHES, drawSketch } from '../sketches.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const L = (a, b, f) => a.clone().lerp(b, f);
const CW = 1024, CHh = 576, CARD = [1.6, 0.9];
const GATE_X = { CODE: -3.6, '3D': -1.2, AI: 1.2, CAMERA: 3.6 }, GATE_Z = -14, GY = 1.15;

// Clean outline wireframes: each mesh becomes the edges of its geometry (no triangle soup).
const EDGE = new THREE.LineBasicMaterial({ color: '#8EBBFF' });
function wireOf(obj) {
  obj.updateMatrixWorld(true); const meshes = []; obj.traverse((o) => { if (o.isMesh) meshes.push(o); });
  meshes.forEach((o) => { const l = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 18), EDGE); l.position.copy(o.position); l.rotation.copy(o.rotation); l.scale.copy(o.scale); o.parent.add(l); o.visible = false; });
  return obj;
}
function frustum(mm, len, mat) {
  const fov = (fovOf(mm) * Math.PI) / 180, hh = Math.tan(fov / 2) * len, ww = hh * (16 / 9), c = [V(-ww, -hh, -len), V(ww, -hh, -len), V(ww, hh, -len), V(-ww, hh, -len)];
  const pts = []; c.forEach((p, i) => { pts.push(V(0, 0, 0), p, p, c[(i + 1) % 4]); });
  return new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), mat);
}

export function createPlan(sh) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#000000'); scene.environment = sh.env; scene.environmentIntensity = 0.6;
  scene.fog = new THREE.FogExp2('#000000', 0.035);
  const camera = new THREE.PerspectiveCamera(34, W / H, 0.02, 300);
  const floor = gridFloor({ cell: 0.5 }); floor.position.y = -0.55; floor.userData.u.gBoost.value = 0.22; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#FFE6CF', '#1A1410', 1.2));
  const key = new THREE.DirectionalLight('#FFFFFF', 1.4); key.position.set(2, 4, 5); scene.add(key);
  const wire = new THREE.MeshBasicMaterial({ color: '#7FB2FF', wireframe: true }), orangeLine = new THREE.LineBasicMaterial({ color: new THREE.Color(2.4, 0.9, 0.25) });
  const edgeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.8, 0.22) });

  const cards = SHOTS.map((shot, i) => {
    const canvas = document.createElement('canvas'); canvas.width = CW; canvas.height = CHh;
    const g = canvas.getContext('2d'), tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const pivot = new THREE.Group(), home = V(-2.7 + 1.8 * i, -0.05 + 0.08 * Math.sin(i * 1.7), -0.5 * (i % 2)); pivot.position.copy(home); scene.add(pivot);
    const card = new THREE.Mesh(new THREE.PlaneGeometry(...CARD), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, side: THREE.DoubleSide })); card.position.y = CARD[1] / 2; pivot.add(card);
    const frame = new THREE.Group(); card.add(frame);
    for (const [w, h, x, y] of [[CARD[0], 0.012, 0, CARD[1] / 2], [CARD[0], 0.012, 0, -CARD[1] / 2], [0.012, CARD[1], -CARD[0] / 2, 0], [0.012, CARD[1], CARD[0] / 2, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.01), edgeMat); b.position.set(x, y, 0.004); frame.add(b); }
    // The shot package: a wireframe of the set, and the camera's true field of view.
    const pkg = new THREE.Group(); scene.add(pkg);
    if (i === 0) { const d = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.6, 16, 10).rotateX(-Math.PI / 2), wire); d.material = new THREE.MeshBasicMaterial({ color: '#4E78B8', wireframe: true }); const p = d.geometry.attributes.position; for (let k = 0; k < p.count; k++) p.setY(k, 0.05 * Math.sin(p.getX(k) * 9) + 0.06 * Math.exp(-(p.getX(k) ** 2 + p.getZ(k) ** 2) / 0.04)); pkg.add(d); const s = wireOf(sneaker().group); s.scale.setScalar(0.6); s.position.y = 0.06; pkg.add(s); }
    if (i === 1) { const f = createFigure(); f.setPose(run(0.3)); f.root.traverse((o) => { if (o.isMesh) o.material = wire; }); f.root.scale.setScalar(0.28); f.root.rotation.y = Math.PI / 2; pkg.add(f.root); }
    if (i === 2) { const s = wireOf(sneaker().group); s.scale.setScalar(1.6); pkg.add(s); }
    if (i === 3) { for (let b = 0; b < 7; b++) { const h = 0.15 + 0.4 * hash(b, 3); const m = new THREE.Mesh(new THREE.BoxGeometry(0.13, h, 0.13).translate(0, h / 2, 0), wire); m.position.set(-0.45 + b * 0.15, 0, -0.18 * (b % 2) - 0.1); pkg.add(m); } const f = createFigure(); f.setPose(run(0.6)); f.root.traverse((o) => { if (o.isMesh) o.material = wire; }); f.root.scale.setScalar(0.12); f.root.rotation.y = Math.PI / 2; pkg.add(f.root); }
    const fr = frustum(shot.lens, 0.45, orangeLine); fr.position.set(0.35, 0.18, 0.45); fr.lookAt(pkg.position.clone().add(V(0, 0.08, 0))); pkg.add(fr);
    return { shot, canvas, g, tex, pivot, card, frame, pkg, home, drawn: -1 };
  });

  function paint(c, i, p, unfolded) {
    const key = Math.round(p * 200) + (unfolded ? 1000 : 0); if (key === c.drawn) return; c.drawn = key;
    const g = c.g; g.fillStyle = '#EFEAE0'; g.fillRect(0, 0, CW, CHh);
    g.fillStyle = 'rgba(0,0,0,0.035)'; for (let k = 0; k < 400; k++) g.fillRect(hash(k, i) * CW, hash(k, i + 9) * CHh, 2, 2);
    g.font = '700 30px "JetBrains Mono"'; g.fillStyle = '#2A2622'; g.textBaseline = 'top'; g.fillText(`${c.shot.id}   ${c.shot.name}`, 36, 30);
    g.lineWidth = 4; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#2A2622';
    const tip = drawSketch(g, SKETCHES[i], p, CW, CHh);
    if (tip && p < 1) { g.fillStyle = '#FF6A1A'; g.beginPath(); g.arc(tip[0], tip[1], 9, 0, Math.PI * 2); g.fill(); }
    if (unfolded) { g.font = '700 30px "JetBrains Mono"'; g.fillStyle = '#FF6A1A'; g.fillText(`${c.shot.lens} mm  ·  ${c.shot.frames} f  ·  LANE ${c.shot.lane}`, 36, CHh - 66); }
    c.tex.needsUpdate = true;
  }

  // Gates and the tunnel behind the 3D gate.
  const label = (txt) => { const c = document.createElement('canvas'); c.width = 512; c.height = 160; const g = c.getContext('2d'); g.font = '400 120px Anton'; g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 256, 84); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const gates = COPY.gates.map((name) => {
    const g = new THREE.Group(); g.position.set(GATE_X[name], GY, GATE_Z); scene.add(g);
    g.add(new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.045, 16, 96), edgeMat));
    const disc = new THREE.Mesh(new THREE.CircleGeometry(1.0, 64), new THREE.MeshBasicMaterial({ color: new THREE.Color(0, 0, 0), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); g.add(disc);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: label(name), transparent: true })); s.scale.set(1.2, 0.375, 1); s.position.y = 1.55; g.add(s);
    return { name, g, disc };
  });
  const tunnel = new THREE.Group(); scene.add(tunnel);
  for (let k = 0; k < 26; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.012, 8, 72), new THREE.MeshBasicMaterial({ color: k % 3 ? new THREE.Color(2.4, 0.9, 0.25) : new THREE.Color(3, 3, 3) })); r.position.set(GATE_X['3D'], GY, GATE_Z - 0.6 - k * 0.65); tunnel.add(r); }

  function shot(t) {
    if (t < CUE.unfold[0]) { const f = ease.inOutSine(prog(t, CUE.cards[0], CUE.unfold[0])), x = lerp(-3.0, 2.5, f); return { pos: V(x - 0.25, 0.6, 2.1), tgt: V(x + 0.35, 0.42, 0), fov: 34 }; }
    if (t < CUE.glow) { const f = ease.inOutSine(prog(t, CUE.unfold[0], CUE.glow)); return { pos: L(V(2.4, 0.7, 2.3), V(-0.6, 2.1, 3.2), f), tgt: L(V(1.6, 0.25, -0.2), V(-0.3, 0.15, -0.6), f), fov: 34 }; }
    if (t < CUE.lineUp) { const f = ease.inOutSine(prog(t, CUE.glow, CUE.lineUp)); return { pos: L(V(-0.6, 2.1, 3.2), V(0, 2.4, 6.4), f), tgt: V(0, 0.3, -0.5), fov: 34 }; }
    if (t < CUE.fly) { const f = ease.inOutSine(prog(t, CUE.lineUp, CUE.fly)); return { pos: L(V(0, 2.4, 6.4), V(-0.2, 1.3, 2.0), f), tgt: L(V(0, 0.3, -0.5), V(-0.6, GY, GATE_Z), f), fov: 34 }; }
    if (t < CUE.rush[0]) { const f = ease.inOutSine(prog(t, CUE.fly, CUE.rush[0])); return { pos: L(V(-0.2, 1.3, 2.0), V(GATE_X['3D'], GY + 0.05, -7), f), tgt: V(GATE_X['3D'], GY, GATE_Z), fov: 34 }; }
    if (t < CUE.go) { const f = ease.inCubic(prog(t, CUE.rush[0], CUE.go)); return { pos: L(V(GATE_X['3D'], GY + 0.05, -7), V(GATE_X['3D'], GY, GATE_Z - 0.8), f), tgt: V(GATE_X['3D'], GY, GATE_Z - 30), fov: lerp(34, 62, f) }; }
    const f = prog(t, CUE.go, CUE.drop); return { pos: V(GATE_X['3D'], GY, GATE_Z - 0.8 - 6.5 * ease.inOutSine(f)), tgt: V(GATE_X['3D'], GY, GATE_Z - 40), fov: 62 };
  }

  return {
    scene, camera,
    update(t) {
      cards.forEach((c, i) => {
        const appear = ease.outBack(clamp((t - CUE.cards[i]) / 0.35)), drawP = clamp((t - CUE.cards[i] - 0.1) / 1.4), un = ease.inOutCubic(clamp((t - CUE.unfold[i]) / 0.45));
        paint(c, i, drawP, t >= CUE.unfold[i]);
        const back = ease.inOutCubic(prog(t, CUE.lineUp, CUE.lineUp + 0.8));
        c.pivot.visible = t >= CUE.cards[i] - 0.05; c.pivot.scale.setScalar(Math.max(0.001, appear));
        c.pivot.rotation.x = -1.2 * un * (1 - back);
        // Line up, then fly into its gate.
        const row = V(-2.4 + 1.6 * i, GY - CARD[1] / 2, -2.5), gate = V(GATE_X[c.shot.lane], GY - CARD[1] / 2 * 0.4, GATE_Z - 1), go = ease.inCubic(clamp((t - (CUE.fly + 0.4 + i * 0.25)) / 0.55));
        const pos = c.home.clone().lerp(row, back).lerp(gate, go); c.pivot.position.copy(pos); c.pivot.scale.multiplyScalar(1 - 0.6 * go); c.pivot.visible = c.pivot.visible && go < 0.999;
        const rise = ease.outBack(clamp((t - CUE.unfold[i] - 0.2) / 0.5)) * (1 - ease.inCubic(prog(t, CUE.lineUp - 0.3, CUE.lineUp + 0.3)));
        c.pkg.visible = rise > 0.01; c.pkg.position.copy(c.home).add(V(0, 0.2, -0.42)); c.pkg.scale.set(1, Math.max(0.001, rise), 1); c.pkg.rotation.y = 0.3 * (t - CUE.unfold[i]);
        const glowK = Math.exp(-Math.max(0, t - CUE.glow) / 0.6) * (t >= CUE.glow ? 1 : 0) + Math.exp(-Math.max(0, t - CUE.cards[i]) / 0.3) * (t >= CUE.cards[i] ? 0.8 : 0);
        c.frame.visible = glowK > 0.02 || go > 0; c.frame.scale.setScalar(1);
      });
      edgeMat.color.setRGB(2.2, 0.8, 0.22);
      gates.forEach((g) => { const i = SHOTS.findIndex((s) => s.lane === g.name), hit = CUE.fly + 0.4 + i * 0.25 + 0.55, k = Math.exp(-Math.max(0, t - hit) / 0.25) * (t >= hit ? 1 : 0) + (g.name === '3D' ? ease.inCubic(prog(t, CUE.rush[0], CUE.go)) : 0); g.disc.material.color.setRGB(1.6 * k, 0.9 * k, 0.5 * k); g.g.visible = t >= CUE.lineUp - 1; });
      tunnel.visible = t >= CUE.rush[0];
      const c = shot(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.fov = c.fov; camera.updateProjectionMatrix();
    },
    blur(t) { return t >= CUE.rush[0] && t < CUE.go ? 3 : 1; },
    look(t) { return { bloom: 0.6, contrast: 1.05, vig: 0.45, flash: Math.max(1 - ease.outCubic(prog(t, CUE.cards[0], CUE.cards[0] + 0.5)), ease.inCubic(prog(t, CUE.drop - 0.12, CUE.drop))) }; },
  };
}
