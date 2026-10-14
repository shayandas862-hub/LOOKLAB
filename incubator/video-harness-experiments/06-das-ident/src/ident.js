// The ident, as one function of time. The petals swirl through the dark past the camera, then lock into the logo
// one by one (green, amber, cyan, then the red with the biggest hit); the D is drawn in molten gold; the words stand
// up letter by letter; a glint crosses everything; god rays, hold, fade.
import * as THREE from 'three';
import { W, H, CUE, DURATION } from './timeline.js';
import { ease, prog, lerp, clamp, impulse } from './util.js';
import { studioEnv } from './engine.js';
import { buildLogo, GLINT } from './logo.js';
import { dust, sparks, ring, haze, glowAndRays } from './fx.js';
import { petalPose, camAt } from './motion.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const LOCKS = [CUE.lockGreen, CUE.lockAmber, CUE.lockCyan, CUE.lockRed];

export async function createIdent(renderer) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#020102'); scene.fog = new THREE.FogExp2('#040202', 0.016);
  scene.environment = studioEnv(renderer, { accent: '#FFB070', strips: 0.9 }); scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(34, W / H, 0.05, 200);

  const logo = await buildLogo(); scene.add(logo.root);
  logo.root.traverse((o) => { if (o.isMesh) o.layers.enable(1); });
  const key = new THREE.DirectionalLight('#FFF8F2', 6.5); key.position.set(-6, 7, 10); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 40 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  const rim = new THREE.DirectionalLight('#C8D6FF', 0.9); // gentler: at 2.4 its glint on the cyan petal's edge bloomed into a white flare rim.position.set(7, 6, -8);
  const back = new THREE.PointLight('#FF9A4A', 0, 0, 2); back.position.set(-1.9, 1.3, -2.6);
  // Fill from the lens, so faces read their true colour. A hemisphere light gives only soft light, no mirror highlight:
  // a directional fill glinted white on the cyan petal's glossy corner just as the D was drawn.
  const fill = new THREE.HemisphereLight('#FFFFFF', '#000000', 3.6); fill.position.set(2, -1, 12);
  scene.add(key, key.target, rim, back, fill, new THREE.HemisphereLight('#3A2E3A', '#0A0806', 0.35));

  const rays = glowAndRays(renderer); scene.add(rays.glow);
  const air = haze(); air.objs.forEach((o) => scene.add(o));
  const motes = dust(); scene.add(motes.obj);
  const homes = Object.fromEntries(logo.petals.map((p) => [p.id, p.home]));
  const burstAt = (id, z = 0.3) => homes[id].clone().setZ(z);
  const sp = sparks([
    { t: CUE.lockGreen, at: burstAt('green'), n: 70, speed: 2.4, life: 1.2, seed: 11 }, { t: CUE.lockAmber, at: burstAt('amber'), n: 70, speed: 2.4, life: 1.2, seed: 23 },
    { t: CUE.lockCyan, at: burstAt('cyan'), n: 70, speed: 2.4, life: 1.2, seed: 37 },
  ]); scene.add(sp.obj);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 3.2, 1.2) })); logo.red.group.add(tip);
  const tipSparks = sparks(Array.from({ length: 14 }, (_, i) => ({ t: CUE.dStem[0] + i * 0.09, at: V(0, 0, 0), n: 10, speed: 1.0, life: 0.5, seed: 100 + i })));
  scene.add(tipSparks.obj);
  const rings = LOCKS.map(() => ring('#FFC890')); rings.forEach((r) => scene.add(r.obj));

  function petalAt(p, t) { const { pos, rot } = petalPose(p.id, t); p.group.position.copy(pos); p.group.rotation.set(...rot); }
  const cam = camAt;
  // Hits: each lock is a flash of light; the red's is the big one.
  const HITS = [[CUE.lockGreen, 0.35, 0.25], [CUE.lockAmber, 0.35, 0.25], [CUE.lockCyan, 0.35, 0.25], [CUE.lockRed, 1.0, 0.5]];

  let look = {};
  return {
    scene, camera,
    update(t) {
      logo.petals.forEach((p) => petalAt(p, t));
      // The D: stem then bowl, hot while it's drawn, cooling to gold.
      const [s0, s1] = CUE.dStem, [b0, b1] = CUE.dBowl, ps = ease.inOutSine(prog(t, s0, s1)), pb = ease.inOutSine(prog(t, b0, b1));
      logo.D.strokes[0].reveal(ps); logo.D.strokes[1].reveal(pb); logo.D.knobs.forEach((k, i) => (k.visible = i === 0 ? ps > 0 : ps >= 1));
      logo.D.mat.emissiveIntensity = 2.4 * clamp((t - s0) / 0.1) * Math.exp(-Math.max(0, t - b1) / 0.5);
      const drawing = t > s0 && t < b1 + 0.05; tip.visible = drawing;
      if (drawing) tip.position.copy(t < s1 ? logo.D.strokes[0].curve.getPointAt(Math.max(1e-4, ps)) : logo.D.strokes[1].curve.getPointAt(Math.max(1e-4, pb))).add(V(0, 0, 0.04));
      // The words stand up, letter by letter, hinged on their baseline.
      logo.words.forEach((w, wi) => {
        const [w0, w1] = wi === 0 ? CUE.as : CUE.production, n = w.letters.length, step = n > 1 ? (w1 - w0 - 0.5) / (n - 1) : 0;
        w.letters.forEach((l, i) => {
          const x = prog(t, w0 + i * step, w0 + i * step + 0.55), e = ease.outBack(x);
          l.group.visible = x > 0; l.group.rotation.x = -1.75 * (1 - e); l.group.position.copy(l.home).add(V(0, -0.25 * (1 - ease.outCubic(x)), 0.35 * (1 - ease.outCubic(x))));
        });
      });
      GLINT.uGlint.value = lerp(-7, 7, ease.inOutSine(prog(t, CUE.glint[0], CUE.glint[1]))); GLINT.uGlintAmt.value = 1.6 * Math.sin(Math.PI * prog(t, CUE.glint[0], CUE.glint[1]));

      const hit = impulse(t, HITS.map(([h, a, d]) => [h, a, d])), redHit = impulse(t, [[CUE.lockRed, 1, 0.6]]);
      const glow = clamp(0.05 + 0.2 * prog(t, 3, 6.5) + 0.65 * ease.outCubic(prog(t, CUE.lockRed - 0.1, CUE.lockRed + 1.2)) - 0.2 * prog(t, CUE.fade[0], CUE.fade[1]), 0, 1);
      rays.set(0.008 + 0.04 * glow + 0.1 * redHit); back.intensity = 2 + 7 * glow; // no spike at the hit: it caught the cyan petal's edge as a white glare
      air.update(t, glow); motes.update(t, glow); sp.update(t);
      // Sparks from the pen tip travel with it: they live half a second, so the shortcut doesn't show.
      tipSparks.update(t); tipSparks.obj.position.copy(drawing ? tip.getWorldPosition(new THREE.Vector3()) : V(0, -100, 0));
      LOCKS.forEach((L, i) => { const id = ['green', 'amber', 'cyan', 'red'][i]; rings[i].set(burstAt(id, -0.5), id === 'red' ? 16 : 5, prog(t, L, L + (id === 'red' ? 1.4 : 0.9))); });

      const c = cam(t), shake = 0.06 * redHit; camera.position.copy(c.pos).add(V(Math.sin(t * 61) * shake, Math.cos(t * 47) * shake, 0)); camera.lookAt(c.tgt); camera.fov = c.fov; camera.updateProjectionMatrix();
      // No gold streak and no spark burst on the red petal as it locks (the founder's note).
      const sp2 = burstAt('red', 0).project(camera);
      look = { hit, redHit, glow, rays: 0.05 + 0.55 * glow + 0.45 * redHit, streak: 0, streakPos: [sp2.x * 0.5 + 0.5, sp2.y * 0.5 + 0.5], fade: 1 - prog(t, CUE.fade[0], CUE.fade[1]) * 1, inFade: ease.outCubic(prog(t, 0, 1.0)) };
    },
    draw(renderer, rt) {
      renderer.setRenderTarget(rt); renderer.render(scene, camera);
      rays.draw(scene, camera, rt, look.rays);
    },
    look: () => look,
  };
}
