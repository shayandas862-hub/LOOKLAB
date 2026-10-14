// 1:12–1:28 — STEP INSIDE. The film was a screen: the camera pulls back from the running hero to a wall of screens,
// one for each world, floating in the dark. The hero runs at us, steps out through the screen into 3D, the screens
// fly apart and the eight worlds rise around a plaza as one place to walk around in. Then a huge crane-up.
import * as THREE from 'three';
import { W, H, CUE, bar, SEC } from '../timeline.js';
import { ease, prog, lerp, clamp } from '../util.js';
import { createFigure, walk, stand, mix } from '../figure.js';
import { worldRing } from '../ring.js';
import { SPEED } from './films.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const L = (a, b, f) => a.clone().lerp(b, f);
const T0 = bar(SEC.inside[0]), T1 = bar(SEC.inside[1]);
const Z0 = -3.2; // the screen wall stands behind the plaza's centre
const WALL = [[-4.7, 1.0, -0.9], [4.7, 1.0, -0.9], [-8.6, 1.3, -2.8], [8.6, 1.3, -2.8], [-2.6, 3.55, -1.6], [2.6, 3.55, -1.6], [0, 5.6, -3.2]];

export function createInside(sh, films) {
  const scene = new THREE.Scene(); scene.environment = sh.env; scene.environmentIntensity = 0.8; scene.background = new THREE.Color('#000000');
  scene.fog = new THREE.FogExp2('#05070E', 0.012);
  const camera = new THREE.PerspectiveCamera(32, W / H, 0.05, 1200);
  const ring = worldRing(); scene.add(ring.group);
  const live = new THREE.WebGLRenderTarget(1280, 720, { type: THREE.HalfFloatType, samples: 4 });
  const frameMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 0.8, 0.22) });
  const makeScreen = (tex, w, h, border) => {
    const g = new THREE.Group();
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0.8, 0.8, 0.8) })); s.position.y = h / 2; g.add(s);
    for (const [bw, bh, x, y] of [[w + 0.06, 0.03, 0, h + 0.015], [w + 0.06, 0.03, 0, -0.015], [0.03, h, -w / 2 - 0.015, h / 2], [0.03, h, w / 2 + 0.015, h / 2]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.03), border); b.position.set(x, y, 0); g.add(b);
    }
    scene.add(g); return { g, s };
  };
  const main = makeScreen(live.texture, 4, 2.25, frameMat);
  // The other worlds, each a still taken from the FILMS scene at start-up.
  const shots = films.worlds.map((_, i) => i).slice(1).map((i) => {
    const rt = new THREE.WebGLRenderTarget(640, 360, { type: THREE.HalfFloatType, samples: 4 }), tt = bar(SEC.films[0]) + i * 2 + 0.6;
    films.drive({ t: tt, world: i, phase: 0.3, travel: SPEED * (tt - bar(SEC.films[0])) + i * 41, cam: films.orbit(tt) });
    sh.renderer.setRenderTarget(rt); sh.renderer.render(films.scene, films.camera); sh.renderer.setRenderTarget(null);
    return rt;
  });
  const grey = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.5, 0.5, 0.55) });
  const wall = shots.map((rt, i) => { const sc = makeScreen(rt.texture, 3.2, 1.8, grey), [x, y, z] = WALL[i]; sc.home = V(x, y - 0.9, z + Z0); return sc; });
  const hero = createFigure(); scene.add(hero.root);
  const key = new THREE.DirectionalLight('#FFF1E2', 1.6); key.position.set(3, 6, 6); scene.add(key);

  const rise = (k) => ease.outBack(clamp((prog(currentT, CUE.stepThrough + 1.0 + k * 0.16, CUE.stepThrough + 1.7 + k * 0.16))));
  let currentT = 0, screenCam = null;
  const walkZ = (t) => lerp(Z0 - 0.3, 0, ease.outCubic(prog(t, CUE.stepThrough - 0.05, CUE.stepThrough + 3)));

  function cam(t) {
    if (t < CUE.portal) { const f = ease.outExpo(prog(t, T0, CUE.portal)); return { pos: L(V(0, 1.125, Z0 + 3.92), V(0.9, 1.7, Z0 + 13), f), tgt: L(V(0, 1.125, Z0), V(0, 1.6, Z0), f), fov: 32 }; }
    if (t < CUE.stepThrough) { const f = ease.inOutSine(prog(t, CUE.portal, CUE.stepThrough)); return { pos: L(V(0.9, 1.7, Z0 + 13), V(0.3, 1.25, Z0 + 6.2), f), tgt: V(0, 1.2, Z0), fov: 32 }; }
    const hz = walkZ(t);
    if (t < CUE.inside) { const f = ease.inOutSine(prog(t, CUE.stepThrough, CUE.inside)); return { pos: L(V(3.7, 1.25, Z0 + 3.9), V(3.2, 1.45, 4.2), f), tgt: V(0, 1.0, hz), fov: 32 }; }
    if (t < CUE.crane) { const a = 0.67 - 2.4 * ease.inOutSine(prog(t, CUE.inside, CUE.crane)), d = 4.8; return { pos: V(Math.sin(a) * d, 1.55, Math.cos(a) * d), tgt: V(0, 1.15, 0), fov: 34 }; }
    const f = ease.inOutCubic(prog(t, CUE.crane, T1)), a = 0.67 - 2.4 - 0.8 * f, d = lerp(4.8, 14, f);
    return { pos: V(Math.sin(a) * d, lerp(1.55, 105, f), Math.cos(a) * d), tgt: L(V(0, 1.15, 0), V(0, 0, 0), Math.min(1, f * 1.5)), fov: lerp(34, 44, f) };
  }

  return {
    scene, camera,
    update(t) {
      currentT = t;
      // What the main screen plays: the hero in the neon city, first from the side, then running straight at us.
      const tt = t - T0, front = ease.inOutSine(prog(t, CUE.portal - 0.5, CUE.stepThrough - 0.3)), th = lerp(0.35, Math.PI / 2, front), d = lerp(4.2, 3.4, front);
      screenCam = { pos: V(Math.sin(th) * d, lerp(1.15, 1.05, front), Math.cos(th) * d), tgt: V(lerp(0.6, 0, front), 1.0, 0), fov: 34 };
      // Out through the screen: the hero leaves the film and walks into the plaza.
      const out = t >= CUE.stepThrough - 0.04;
      hero.root.visible = out; hero.root.position.set(0, 0, walkZ(t));
      const wph = (t - CUE.stepThrough) / 1.0, settle = prog(t, CUE.stepThrough + 2.6, CUE.stepThrough + 3.4);
      const look = { ...stand(t * 2), headYaw: 0.55 * Math.sin((t - CUE.inside) * 1.3), chestTwist: 0.15 * Math.sin((t - CUE.inside) * 1.3) };
      hero.setPose(mix(walk(wph), look, settle));
      hero.root.rotation.y = settle * 0.4 * Math.sin((t - CUE.inside) * 0.6);
      // The screens fly apart once the hero is out; the worlds rise in their place.
      const gone = ease.inCubic(prog(t, CUE.stepThrough + 0.7, CUE.stepThrough + 1.5));
      main.g.visible = gone < 1; main.g.position.set(0, -6 * gone, Z0); main.g.scale.setScalar(1 - 0.3 * gone);
      frameMat.color.setRGB(2.2, 0.8, 0.22).multiplyScalar(1 + 3 * Math.exp(-Math.abs(t - CUE.stepThrough) / 0.25));
      wall.forEach((sc, i) => { const dir = sc.home.clone().setY(0).normalize(); sc.g.visible = gone < 1; sc.g.position.copy(sc.home).addScaledVector(dir, 30 * gone).add(V(0, 8 * gone * (i % 2 ? 1 : -0.4), 0)); sc.g.lookAt(0, sc.home.y + 0.9, 13); });
      ring.update(rise);
      scene.fog.density = lerp(0.012, 0.0015, ease.inOutCubic(prog(t, CUE.crane, T1)));
      const c = cam(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.fov = c.fov; camera.updateProjectionMatrix();
    },
    draw(renderer, rt) {
      if (main.g.visible) {
        const tt = currentT - T0;
        films.hero.root.visible = currentT < CUE.stepThrough - 0.04;
        films.drive({ t: currentT, world: 0, phase: tt / 1.0, travel: SPEED * tt + 120, cam: screenCam });
        renderer.setRenderTarget(live); renderer.setClearColor('#000000', 1); renderer.clear(); renderer.render(films.scene, films.camera);
        films.hero.root.visible = true;
        renderer.setRenderTarget(rt);
      }
      renderer.render(scene, camera);
    },
    look(t) { return { bloom: 0.6, contrast: 1.06, vig: 0.4 }; },
  };
}
