// 0:28–0:44 — MAKE. Four sets, four seconds each: two seconds being built in the language of its engine, then two
// seconds through its own shot camera. A whip pan carries the camera from one set to the next.
//   3D: a sweep turns wireframe into clay into the lit shot.     AI: the frame resolves out of noise.
//   CODE: the shoe assembles from its construction lines.        CAMERA: seen through a viewfinder.
import * as THREE from 'three';
import { W, H, CUE, SHOTS, fovOf } from '../timeline.js';
import { ease, prog, lerp, clamp } from '../util.js';
import { canvasTex } from '../worldkit.js';
import { OFF_BRAND, RUNNER } from '../sets.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const BUILD = 2, LEN = 4;

export function createMake(sh, sets) {
  const [dune, track, product, city] = sets;
  const wire = new THREE.MeshBasicMaterial({ color: '#7FB2FF', wireframe: true });
  const clay = new THREE.MeshStandardMaterial({ color: '#B9B4AC', roughness: 0.8 });
  // CODE lane: orange construction lines for every layer of the shoe, and a true dimension line (the shoe is 300 mm).
  const lineMat = new THREE.LineBasicMaterial({ color: new THREE.Color(2.4, 0.9, 0.25) });
  const order = ['sole', 'mid', 'stripe', 'upper', 'collar', 'tongue', 'laces', 'side'];
  const edges = order.map((name) => {
    const parts = [];
    product.shoe.layers[name].traverse((o) => { if (o.isMesh) parts.push(o); });
    return parts.map((o) => {
      const l = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 25), lineMat);
      l.position.copy(o.position); l.rotation.copy(o.rotation); l.scale.copy(o.scale); o.parent.add(l);
      return { mesh: o, line: l };
    });
  });
  const dimTex = canvasTex(512, 96, (c, w, h) => { c.font = '700 56px "JetBrains Mono"'; c.fillStyle = '#FF6A1A'; c.textBaseline = 'middle'; c.textAlign = 'center'; c.fillText('300 mm', w / 2, h / 2); });
  const dim = new THREE.Group(); product.scene.add(dim); dim.position.set(0.14, 0.09, 0);
  const dimLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, -0.15), V(0, 0, 0.15)]), lineMat); dim.add(dimLine);
  const dimLabel = new THREE.Sprite(new THREE.SpriteMaterial({ map: dimTex, transparent: true, depthTest: false })); dimLabel.scale.set(0.16, 0.03, 1); dimLabel.position.set(0, 0.03, 0); dim.add(dimLabel);
  let cur = null, mode = 'shot', sweep = 0, k = 0, u = 0;

  const buildCam = [
    (u) => { const a = 0.9 - 0.4 * u / BUILD, b = dune.base; return { pos: b.clone().add(V(Math.sin(a) * 3.2, 1.5, Math.cos(a) * 3.2)), tgt: b.clone().add(V(0, 0.1, 0)), fov: 32 }; },
    (u) => { const a = 0.75 + 0.3 * u / BUILD; return { pos: V(Math.sin(a) * 3.4, 1.15, Math.cos(a) * 3.4), tgt: V(0, 0.85, 0), fov: 32 }; },
    (u) => { const a = 0.6 + 0.5 * u / BUILD; return { pos: V(Math.sin(a) * 0.95, 0.42, Math.cos(a) * 0.95), tgt: V(0, 0.13, 0), fov: 32 }; },
    (u) => { const a = 0.9 - 0.3 * u / BUILD; return { pos: V(Math.sin(a) * 6, 2.2, Math.cos(a) * 6), tgt: V(0.4, 1.0, 0), fov: 34 }; },
  ];

  function place(set, c) { set.camera.position.copy(c.pos); set.camera.fov = c.fov; set.camera.lookAt(c.tgt); set.camera.updateProjectionMatrix(); }
  // A whip pan across every cut between sets: out of one set to the right, into the next from the left.
  function whip(set, uu) {
    const out = clamp((uu - (LEN - 0.17)) / 0.17), inn = clamp(1 - uu / 0.17), a = 1.2 * (out * out) - 1.2 * (inn * inn);
    if (a) set.camera.rotateY(-a);
  }

  return {
    get scene() { return cur.scene; }, get camera() { return cur.camera; },
    update(t) {
      k = clamp(Math.floor((t - CUE.sets[0]) / LEN), 0, 3); u = t - CUE.sets[k]; cur = sets[k];
      if (k === 0) { dune.shoe.paint(OFF_BRAND); dune.text.uOn.value = 0; dune.hero.root.visible = false; }
      if (k === 2) product.shoe.paint(RUNNER);
      cur.update(t, u);
      mode = u < BUILD ? 'build' : 'shot';
      if (mode === 'build') place(cur, buildCam[k](u)); else cur.shot(u - BUILD);
      whip(cur, u);
      sweep = ease.inOutSine(clamp(u / (BUILD - 0.2)));
      // CODE lane: each layer's lines appear, then its surface, in assembly order.
      if (k === 2) {
        order.forEach((name, i) => {
          const tl = i * 0.2, show = u >= BUILD || u >= tl + 0.25;
          edges[i].forEach(({ mesh, line }) => { mesh.visible = show; line.visible = u < BUILD + 0.4 && u >= tl; });
        });
        product.shoe.explode(u < BUILD ? 0.6 * (1 - ease.inOutCubic(clamp((u - 1.2) / 0.7))) : 0);
        dim.visible = u >= 0.3 && u < BUILD + 0.6;
      }
    },
    draw(renderer, rt) {
      const s = cur.scene, c = cur.camera;
      if (k !== 0 || mode !== 'build') { renderer.render(s, c); return; }
      // 3D lane: lit | clay | wireframe, split by two sweeping lines.
      const xa = Math.round(W * sweep), xb = Math.round(W * Math.min(1, sweep + 0.22));
      rt.scissorTest = true;
      const band = (x0, x1, mat, bg) => {
        if (x1 <= x0) return;
        rt.scissor.set(x0, 0, x1 - x0, H); renderer.setRenderTarget(rt);
        const fog = s.fog, back = s.background;
        if (mat) { s.overrideMaterial = mat; if (bg) { s.background = new THREE.Color(bg); s.fog = null; } }
        renderer.render(s, c); s.overrideMaterial = null; s.fog = fog; s.background = back;
      };
      band(0, xa, null); band(xa, xb, clay, null); band(xb, W, wire, '#06132B');
      rt.scissorTest = false; rt.scissor.set(0, 0, W, H); renderer.setRenderTarget(rt);
    },
    blur(t) { const uu = (t - CUE.sets[0]) % LEN; return uu > LEN - 0.2 || uu < 0.2 || t >= CUE.sets[3] ? 3 : 1; },
    look(t) {
      const lane = SHOTS[k].lane, nz = k === 1 && mode === 'build' ? 1 - ease.inOutSine(clamp(u / (BUILD - 0.1))) : 0;
      return {
        lane, build: mode === 'build', sweep: k === 0 && mode === 'build' ? sweep : null, viewfinder: k === 3, shot: SHOTS[k],
        noise: nz, noiseStep: Math.floor(u * 8), bloom: 0.5, contrast: 1.06, vig: 0.4,
      };
    },
  };
}
