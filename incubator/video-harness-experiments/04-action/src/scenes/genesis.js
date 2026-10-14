// 0:00–0:27 — SPARK and ASSEMBLE in one world. Typed words shatter into chrome, the grid lights, a glowing pencil
// draws the hero; then WORLD (blocks rise), CAMERA (a cinema camera assembles), LIGHT (a fresnel bangs on),
// and the drawing inflates into a 3D hero who steps forward and drops into a sprint start.
import * as THREE from 'three';
import { W, H, CUE, BEAT, COPY, bar } from '../timeline.js';
import { ease, prog, lerp, clamp } from '../util.js';
import { createFigure, walk, stand, mix } from '../figure.js';
import { gridFloor, shards, blocks, cineCamera, fresnel } from '../props.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const L = (a, b, f) => a.clone().lerp(b, f);
const HERO = V(0, 0, -0.6), HERO_YAW = 0.5, CAM_RIG = V(2.0, 0, 1.6), LIGHT_AT = V(-2.7, 2.9, 1.0);

// Sample the typed line exactly where the DOM draws it, so the shatter starts from the same letters.
function textPoints(step = 3) {
  const probe = document.createElement('div');
  probe.className = 'mono'; probe.style.cssText = 'position:absolute;left:0;right:0;top:500px;text-align:center;font-size:72px;letter-spacing:0.02em;white-space:pre;visibility:hidden';
  probe.innerHTML = `<span>${COPY.type}</span><span style="display:inline-block;width:0.6em;height:0.95em;vertical-align:-0.12em;margin-left:0.05em"></span>`;
  document.body.appendChild(probe);
  const [tr, cr] = [probe.children[0].getBoundingClientRect(), probe.children[1].getBoundingClientRect()];
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.font = '400 72px "JetBrains Mono"'; g.letterSpacing = '1.44px'; g.fillStyle = '#fff'; g.textBaseline = 'alphabetic';
  const m = g.measureText(COPY.type); g.fillText(COPY.type, tr.left, tr.top + m.fontBoundingBoxAscent);
  g.fillStyle = '#f00'; g.fillRect(cr.left, cr.top, cr.width, cr.height);
  probe.remove();
  const d = g.getImageData(0, 0, W, H).data, pts = [], scale = (2 * 5 * Math.tan(Math.PI / 12)) / H;
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
    const i = (y * W + x) * 4; if (d[i + 3] < 128) continue;
    pts.push({ x: (x - W / 2) * scale, y: 1.6 - (y - H / 2) * scale, z: 0, hot: d[i + 1] < 100 ? 1 : 0 });
  }
  return pts;
}

export function createGenesis(sh) {
  const scene = new THREE.Scene(); scene.environment = sh.env; scene.environmentIntensity = 0.45;
  scene.fog = new THREE.FogExp2('#000000', 0.03);
  const camera = new THREE.PerspectiveCamera(30, W / H, 0.02, 200);
  const hemi = new THREE.HemisphereLight('#8A97B8', '#000000', 0.25); scene.add(hemi);
  const floor = gridFloor(); scene.add(floor);
  const sp = shards(textPoints(3), { t0: CUE.crack, center: V(0, 1.6, 0), size: 0.019 }); scene.add(sp.mesh);
  const glint = new THREE.DirectionalLight('#FFF1E0', 3.2); glint.position.set(2, 4, 6); scene.add(glint);
  const under = new THREE.PointLight('#FF7A2E', 6, 8, 1.5); under.position.set(-1.5, 0.4, 2.5); scene.add(under);
  const ringTimes = Array.from({ length: 8 }, (_, i) => CUE.world + 0.25 + i * BEAT / 2);
  const bl = blocks({ times: ringTimes }); scene.add(bl.group);
  const partTimes = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5].map((d) => CUE.camera + d);
  const cam = cineCamera(partTimes);
  const rig = new THREE.Group(); rig.position.copy(CAM_RIG); scene.add(rig);
  const tripodMat = new THREE.MeshStandardMaterial({ color: '#1A1B1F', roughness: 0.4, metalness: 0.7 });
  const tripod = new THREE.Group(); rig.add(tripod);
  for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2 + 0.4, leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 1.45, 8), tripodMat); leg.position.set(Math.cos(a) * 0.25, 0.68, Math.sin(a) * 0.25); leg.rotation.set(Math.sin(a) * 0.36, 0, -Math.cos(a) * 0.36); leg.castShadow = true; tripod.add(leg); }
  const pan = new THREE.Group(); pan.position.y = 1.42; rig.add(pan); pan.add(cam.group); cam.group.position.y = 0.12;
  const light = fresnel(scene, { at: LIGHT_AT, target: V(0, 1.1, -0.6) });
  const hero = createFigure(); scene.add(hero.root);
  hero.root.position.copy(HERO); hero.root.rotation.y = HERO_YAW;
  const drawPose = walk(0.3), crouch = { ...stand(), lean: 0.42, y: -0.12, bend: 0.18, headPitch: -0.35, armL: [-0.5, 0.25, 1.2], armR: [0.7, 0.2, 1.4], legL: [0.55, 0.05, 0.95, 0.3], legR: [-0.1, 0.05, 0.55, 0.1] };
  const tmp = new THREE.Vector3();

  function heroAt(t) {
    let pose = drawPose, fwd = 0;
    if (t >= CUE.inflate) {
      const w = prog(t, CUE.inflate, CUE.firstStep);
      pose = walk(lerp(0.3, 0.5, ease.inOutSine(w))); fwd = 0.38 * ease.inOutSine(w);
      if (t >= CUE.firstStep) pose = mix(walk(0.5), stand(t * 2), ease.inOutCubic(prog(t, CUE.firstStep, CUE.firstStep + 0.4)));
      if (t >= CUE.roll[0]) pose = mix(pose, crouch, ease.inOutCubic(prog(t, CUE.roll[0], CUE.roll[0] + 0.6)));
    }
    hero.setPose(pose);
    hero.root.position.set(HERO.x + Math.sin(HERO_YAW) * fwd, 0, HERO.z + Math.cos(HERO_YAW) * fwd);
    if (t < CUE.inflate) { hero.root.visible = t >= CUE.pencil[0]; hero.setStyle('line', lerp(2.0, -0.1, ease.inOutSine(prog(t, CUE.pencil[0], CUE.pencil[1])))); hero.line.uniforms.glow.value = 1.5 + 3 * prog(t, CUE.inflate - 0.25, CUE.inflate); hero.root.scale.setScalar(1); }
    else { hero.setStyle('solid'); hero.root.scale.setScalar(1 + 0.1 * Math.exp(-(t - CUE.inflate) / 0.07) * Math.cos((t - CUE.inflate) * 40)); }
  }
  const headPos = () => hero.head.getWorldPosition(tmp).clone().add(V(0, 0.12, 0));

  function shot(t) {
    if (t < CUE.crack + 0.25) return { pos: V(0, 1.6, 5), tgt: V(0, 1.6, 0), fov: 30 };
    if (t < CUE.land) { const f = ease.inOutCubic(prog(t, CUE.crack + 0.25, CUE.land - 0.1)); return { pos: L(V(0, 1.6, 5), V(0, 3.7, 6.9), f), tgt: L(V(0, 1.6, 0), V(0, 0.15, 1.0), f), fov: 30 }; }
    if (t < CUE.world) {
      const f = ease.inOutSine(prog(t, CUE.land, CUE.world)), d = ease.inOutSine(prog(t, CUE.pencil[0], CUE.pencil[1]));
      return { pos: L(V(3.1, 0.3, 5.2), V(1.25, 0.8, 3.0), f), tgt: V(0, lerp(1.75, 1.0, d) * prog(t, CUE.land, CUE.pencil[0] + 0.3) + 0.4 * (1 - prog(t, CUE.land, CUE.pencil[0] + 0.3)), -0.6), fov: lerp(34, 28, f) };
    }
    if (t < bar(7)) { const f = ease.outCubic(prog(t, CUE.world, bar(7))); return { pos: L(V(0, 10, 14), V(2.5, 7, 11), f), tgt: V(0, 0.8, -1), fov: 34 }; }
    if (t < CUE.camera) { const a = 0.75 + 0.25 * prog(t, bar(7), CUE.camera); return { pos: V(Math.sin(a) * 8.5, 2.4, Math.cos(a) * 8.5), tgt: V(0, 1, -0.8), fov: 32, split: true }; }
    if (t < bar(9)) {
      const a = -0.3 + 0.9 * ease.inOutSine(prog(t, CUE.camera, bar(9))), c = cam.group.getWorldPosition(tmp).clone();
      return { pos: c.clone().add(V(Math.sin(a) * 1.05, 0.22, Math.cos(a) * 1.05)), tgt: c.clone().add(V(0, 0.03, 0)), fov: 32 };
    }
    if (t < CUE.light) { const f = ease.inOutSine(prog(t, bar(9), CUE.light)); return { pos: L(V(2.35, 1.8, 3.9), V(2.05, 1.7, 3.4), f), tgt: V(0, 1.2, -0.6), fov: 32 }; }
    if (t < CUE.light + BEAT) return { pos: LIGHT_AT.clone().add(V(0.55, 0.12, 1.3)), tgt: LIGHT_AT.clone(), fov: 30 };
    if (t < bar(11)) { const f = ease.inOutSine(prog(t, CUE.light + BEAT, bar(11))); return { pos: L(V(5.0, 0.55, 6.2), V(4.1, 0.85, 6.6), f), tgt: V(-0.6, 1.0, -1.2), fov: 32 }; }
    if (t < CUE.inflate) { const a = 2.2 + 0.4 * prog(t, bar(11), CUE.inflate); return { pos: V(Math.sin(a) * 9, 4.2, Math.cos(a) * 9), tgt: V(0, 0.9, -0.6), fov: 32, split: true }; }
    if (t < CUE.firstStep) { const f = ease.outCubic(prog(t, CUE.inflate, CUE.firstStep)); return { pos: L(V(1.6, 1.4, 2.2), V(1.35, 1.35, 1.9), f), tgt: V(0, 1.15, -0.5), fov: 30 }; }
    if (t < CUE.roll[0]) { const f = prog(t, CUE.firstStep, CUE.roll[0]); return { pos: V(1.05 - 0.15 * f, 0.16, 1.45), tgt: V(0.1, 0.22, -0.3), fov: 30 }; }
    const f = ease.inCubic(prog(t, CUE.roll[0], CUE.action)), h = headPos();
    const far = h.clone().add(V(1.3, 0.05, 2.4)), near = h.clone().add(V(Math.sin(HERO_YAW) * 0.32, 0.0, Math.cos(HERO_YAW) * 0.32));
    return { pos: L(far, near, f), tgt: h, fov: lerp(30, 26, f) };
  }

  const blue = new THREE.MeshBasicMaterial({ color: '#7FB2FF', wireframe: true });
  let current = { pos: V(0, 1.6, 5), tgt: V(0, 1.6, 0), fov: 30 };
  return {
    scene, camera,
    update(t) {
      sp.update(t); sp.mesh.visible = t >= CUE.crack; floor.visible = t >= CUE.crack;
      glint.intensity = t >= CUE.light ? 0.4 : 3.2; under.intensity = t >= CUE.crack && t < CUE.light ? 6 : 0;
      const u = floor.userData.u; u.gCenter.value.set(0, 1.2); u.gRadius.value = t >= CUE.land ? (t - CUE.land) * 7 : -1; u.gRest.value = t >= CUE.land ? 0.55 : 0;
      u.gBoost.value = t >= CUE.light ? 0.0 : 0;
      bl.update(t);
      tripod.visible = t >= CUE.camera; tripod.scale.y = ease.outBack(prog(t, CUE.camera, CUE.camera + 0.25)) || 0.0001;
      cam.update(t);
      pan.rotation.y = lerp(-1.9, Math.atan2(HERO.x - CAM_RIG.x, HERO.z - CAM_RIG.z), ease.inOutCubic(prog(t, CUE.camera + 2.0, CUE.camera + 3.1)));
      light.group.visible = t >= CUE.light - 2.5;
      light.set(t < CUE.light ? 0 : Math.min(1, (t - CUE.light) / 0.12), t);
      hemi.intensity = t >= CUE.light ? 0.12 : 0.25; scene.environmentIntensity = t >= CUE.world ? 1.0 : 0.45;
      heroAt(t);
      current = shot(t);
      camera.position.copy(current.pos); camera.lookAt(current.tgt); camera.fov = current.fov; camera.updateProjectionMatrix();
    },
    draw(renderer, rt) {
      if (!current.split) { renderer.render(scene, camera); return; }
      // Scissors on a render target live on the target itself.
      rt.scissorTest = true;
      rt.scissor.set(0, 0, W / 2, H); renderer.setRenderTarget(rt);
      renderer.setClearColor('#06132B', 1); renderer.clear();
      scene.overrideMaterial = blue; const fog = scene.fog; scene.fog = null; renderer.render(scene, camera); scene.overrideMaterial = null; scene.fog = fog;
      rt.scissor.set(W / 2, 0, W / 2, H); renderer.setRenderTarget(rt); renderer.setClearColor('#000000', 1); renderer.clear();
      renderer.render(scene, camera);
      rt.scissorTest = false; rt.scissor.set(0, 0, W, H); renderer.setRenderTarget(rt);
    },
    look(t) { return { split: !!current.split, bloom: t < CUE.light ? 0.65 : 0.5 }; },
    blur(t) { return t >= CUE.crack && t < CUE.land ? 3 : 1; },
  };
}
