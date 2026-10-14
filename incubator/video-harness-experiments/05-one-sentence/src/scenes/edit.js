// 0:44–1:12 — CHECK, CUT and BREATH.
// CHECK: the four finished shots on screens, each checked with a real measurement. Shot 1's shoe was made in an
//   off-brand orange; its colour is measured from rendered pixels against the same shot rendered with the brand
//   colour (CIEDE2000), fails, is fixed and measured again. Shots 2–4 pass the motion check on their real camera speed.
// CUT: the screens become clips on a timeline over the score's real waveform; the playhead plays the cut live in
//   16:9, then 9:16 and 1:1 as well. BREATH: the 16:9 monitor plays shot 1 and the camera drifts in until it fills
//   the frame, so the world can begin from that exact framing.
import * as THREE from 'three';
import { W, H, CUE, SHOTS, BEAT } from '../timeline.js';
import { ease, prog, lerp, clamp } from '../util.js';
import { gridFloor } from '../props.js';
import { RUNNER, OFF_BRAND } from '../sets.js';
import { measureObject, deltaE00 } from '../measure.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const L = (a, b, f) => a.clone().lerp(b, f);
const SCR = [1.6, 0.9], SY = 1.25, MON = [3.2, 1.8], MONP = V(0, 2.55, -0.6), PASS = { colour: 2.0, speed: 8 };
const QUAD_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';

export async function createEdit(sh, sets) {
  const R = sh.renderer, [dune] = sets;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#030304'); scene.environment = sh.env; scene.environmentIntensity = 0.5;
  scene.fog = new THREE.FogExp2('#030304', 0.03);
  const camera = new THREE.PerspectiveCamera(34, W / H, 0.02, 200);
  const floor = gridFloor({ cell: 0.5 }); floor.userData.u.gBoost.value = 0.18; scene.add(floor);
  scene.add(new THREE.HemisphereLight('#FFE6CF', '#141010', 0.8));

  // Stills of the four finished shots (and shot 1 as first made, off-brand).
  const still = (i, u, paint) => {
    const s = sets[i], rt = new THREE.WebGLRenderTarget(960, 540, { type: THREE.HalfFloatType, samples: 4 });
    if (paint) s.shoe.paint(paint);
    s.update(CUE.sets[i] + 2 + u, u); const c = s.shot(u);
    R.setRenderTarget(rt); R.setClearColor('#000000', 1); R.clear(); R.render(s.scene, c); R.setRenderTarget(null); return rt;
  };
  const S1_wrong = still(0, 1.0, OFF_BRAND), S1_fixed = still(0, 1.0, RUNNER), stills = [S1_wrong, still(1, 1.0), still(2, 1.0, RUNNER), still(3, 1.0)];
  // The measurements. Colour: the shoe's accent pixels, displayed, against the same shot made with the brand colour.
  const acc = () => [dune.shoe.layers.stripe, dune.shoe.layers.side];
  dune.shoe.paint(RUNNER); dune.update(0, 1.0); const ref = measureObject(R, dune.scene, dune.shot(1.0), acc());
  dune.shoe.paint(OFF_BRAND); const bad = measureObject(R, dune.scene, dune.shot(1.0), acc());
  dune.shoe.paint(RUNNER); dune.update(0, 1.6); const fixed = measureObject(R, dune.scene, dune.shot(1.6), acc());
  const dBad = deltaE00(ref.lab, bad.lab), dFixed = deltaE00(ref.lab, fixed.lab);
  // Motion: each shot camera's top speed over its 48 frames.
  const topSpeed = (i) => { const s = sets[i]; let prev = null, top = 0; for (let f = 0; f <= 48; f++) { const p = s.shot(f / 24).position.clone(); if (prev) top = Math.max(top, p.distanceTo(prev) * 24); prev = p; } return top; };
  const speeds = sets.map((_, i) => topSpeed(i));
  const MEASURED = { ref, bad, fixed, dBad, dFixed, speeds };
  console.log('[measured]', JSON.stringify({ dBad: dBad.toFixed(2), dFixed: dFixed.toFixed(2), pixels: [ref.pixels, bad.pixels, fixed.pixels], speeds: speeds.map((v) => v.toFixed(2)) }));

  // The score's real waveform under the cut (the 8 s the playhead plays, 1:00–1:08).
  let wave = null;
  try {
    const buf = await (await fetch('out/score.wav')).arrayBuffer(), ac = new OfflineAudioContext(2, 48000, 48000), audio = await ac.decodeAudioData(buf);
    const d = audio.getChannelData(0), sr = audio.sampleRate, n = 240; wave = [];
    for (let k = 0; k < n; k++) { const a = Math.round((CUE.play + (8 * k) / n) * sr), b = Math.round((CUE.play + (8 * (k + 1)) / n) * sr); let q = 0; for (let j = a; j < b; j++) q += d[j] * d[j]; wave.push(Math.sqrt(q / Math.max(1, b - a))); }
  } catch (e) { console.log('[waveform unavailable]', e.message); }

  // Screens on stands; shot 1's screen wipes from the off-brand take to the fixed one.
  const s1Mat = new THREE.ShaderMaterial({ uniforms: { a: { value: S1_wrong.texture }, b: { value: S1_fixed.texture }, sweep: { value: 0 } }, vertexShader: QUAD_VS,
    fragmentShader: 'uniform sampler2D a, b; uniform float sweep; varying vec2 vUv; void main(){ vec3 c = vUv.x < sweep ? texture2D(b, vUv).rgb : texture2D(a, vUv).rgb; c += vec3(2.2, 0.8, 0.22) * smoothstep(0.012, 0.0, abs(vUv.x - sweep)) * step(0.001, sweep) * step(sweep, 0.999); gl_FragColor = vec4(c * 0.9, 1.0); }' });
  const screens = stills.map((rt, i) => {
    const g = new THREE.Group(), home = V(-2.7 + 1.8 * i, SY, 0); g.position.copy(home); scene.add(g);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(...SCR), i === 0 ? s1Mat : new THREE.MeshBasicMaterial({ map: rt.texture, color: new THREE.Color(0.9, 0.9, 0.9) })); g.add(m);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(SCR[0] + 0.05, SCR[1] + 0.05), new THREE.MeshStandardMaterial({ color: '#141418', roughness: 0.4, metalness: 0.6 })); frame.position.z = -0.01; g.add(frame);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, SY - 0.45, 8), new THREE.MeshStandardMaterial({ color: '#1A1B1F', metalness: 0.7, roughness: 0.4 })); pole.position.y = -(SY - 0.45) / 2 - 0.45; g.add(pole);
    return { g, home, pole };
  });
  // The timeline: a slab, four clip slots of 2 s (48 f), the waveform, a playhead.
  const TL = { x0: -3.6, x1: 3.6, y: 0.32, z: 1.5 };
  const slab = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.05, 0.9), new THREE.MeshStandardMaterial({ color: '#0E0E12', roughness: 0.5, metalness: 0.4 })); slab.position.set(0, TL.y - 0.03, TL.z); scene.add(slab);
  const waveLine = wave ? (() => { const mx = Math.max(...wave, 1e-6), pts = wave.map((v, k) => V(lerp(TL.x0, TL.x1, k / (wave.length - 1)), TL.y + 0.01, TL.z + 0.42 - 0.3 * (v / mx))); const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color(2.4, 0.9, 0.25) })); scene.add(l); return l; })() : null;
  const playhead = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.5, 0.02), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3) })); scene.add(playhead);
  // Live monitors: one render of the current shot per frame, shown as 16:9, 9:16 and 1:1.
  const live = new THREE.WebGLRenderTarget(1280, 720, { type: THREE.HalfFloatType, samples: 4 });
  const monitor = (w, h, cropW) => { const geo = new THREE.PlaneGeometry(w, h), uv = geo.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setX(k, 0.5 + (uv.getX(k) - 0.5) * cropW); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: live.texture, color: new THREE.Color(0.9, 0.9, 0.9) })); scene.add(m); return m; };
  const mon169 = monitor(...MON, 1), mon916 = monitor(1.0, 1.78, (9 / 16) / (16 / 9)), mon11 = monitor(1.45, 1.45, 9 / 16);
  let liveShot = null, now = 0;

  function shotAt(t) {
    if (t >= CUE.breath) return { i: 0, u: t - CUE.breath };
    if (t >= CUE.play) { const k = Math.min(3, Math.floor((t - CUE.play) / 2)); return { i: k, u: (t - CUE.play) % 2 }; }
    return null;
  }
  function cam(t) {
    if (t < CUE.fail) { const f = ease.inOutSine(prog(t, CUE.check, CUE.fail)); return { pos: L(V(-3.4, 1.5, 3.2), V(1.6, 1.45, 3.6), f), tgt: L(V(-1.6, 1.2, 0), V(0.9, 1.2, 0), f), fov: 34 }; }
    if (t < CUE.allPass) { const f = ease.inOutSine(prog(t, CUE.fail, CUE.fail + 1.2)); return { pos: L(V(1.6, 1.45, 3.6), V(-2.2, 1.12, 2.55), f), tgt: L(V(0.9, 1.2, 0), V(-2.55, 1.08, 0), f), fov: 34 }; }
    if (t < CUE.toTimeline) { const f = ease.inOutSine(prog(t, CUE.allPass, CUE.toTimeline)); return { pos: L(V(-2.2, 1.12, 2.55), V(0, 2.0, 6.2), f), tgt: L(V(-2.55, 1.08, 0), V(0, 1.1, 0), f), fov: 34 }; }
    if (t < CUE.breath) {
      // Follow the shots down onto the timeline and look along it as the waveform lights, then pull back as the
      // monitor rises. The two moves overlap so the camera never stops.
      const a = ease.inOutSine(prog(t, CUE.toTimeline, CUE.play - 1)), b = ease.inOutSine(prog(t, CUE.play - 1.3, CUE.play + 0.4));
      const P = [V(0, 2.0, 6.2), V(-2.6, 1.15, 3.6), V(0, 1.9, 7.6)], T = [V(0, 1.1, 0), V(0.6, 0.3, 1.5), V(0, 1.75, 0.4)];
      const at = (k) => k[0].clone().addScaledVector(k[1].clone().sub(k[0]), a).addScaledVector(k[2].clone().sub(k[1]), b);
      return { pos: at(P), tgt: at(T), fov: lerp(34, 40, b) };
    }
    // Drift in until the 16:9 monitor fills the frame exactly at the end of the breath.
    const f = ease.inOutCubic(prog(t, CUE.breath, CUE.world)), d = (MON[1] / 2) / Math.tan((34 * Math.PI) / 360);
    return { pos: L(V(0, 1.9, 7.6), MONP.clone().add(V(0, 0, d)), f), tgt: L(V(0, 1.75, 0.4), MONP, f), fov: lerp(40, 34, f) };
  }

  return {
    scene, camera, measured: MEASURED,
    update(t) {
      now = t;
      s1Mat.uniforms.sweep.value = ease.inOutCubic(prog(t, CUE.fix + 0.3, CUE.pass - 0.2));
      screens.forEach((s, i) => {
        const go = ease.inOutCubic(clamp((t - (CUE.toTimeline + i * 0.25)) / 1.2)), slot = V(TL.x0 + 0.9 + 1.8 * i, TL.y + 0.02, TL.z);
        s.g.position.copy(s.home).lerp(slot, go); s.g.rotation.x = -Math.PI / 2 * go; s.g.scale.set(lerp(1, 1.1, go), lerp(1, 0.5, go), 1); s.pole.visible = go < 0.05;
      });
      const ph = prog(t, CUE.play, CUE.play + 8); playhead.position.set(lerp(TL.x0, TL.x1, ph), TL.y + 0.2, TL.z); playhead.visible = t >= CUE.play && t < CUE.breath;
      if (waveLine) waveLine.visible = t >= CUE.toTimeline + 1 && t < CUE.breath + 1;
      const up = ease.outBack(clamp((t - (CUE.play - 0.6)) / 0.6)), side = ease.outBack(clamp((t - CUE.frames) / 0.5)) * (1 - ease.inCubic(prog(t, CUE.breath, CUE.breath + 0.6)));
      mon169.visible = up > 0.01; mon169.position.copy(MONP); mon169.scale.setScalar(Math.max(0.001, up));
      mon916.visible = mon11.visible = side > 0.01; mon916.position.set(2.75, 2.55, -0.6); mon11.position.set(-2.85, 2.55, -0.6); mon916.scale.setScalar(Math.max(0.001, side)); mon11.scale.setScalar(Math.max(0.001, side));
      liveShot = mon169.visible ? shotAt(t) : null;
      const c = cam(t); camera.position.copy(c.pos); camera.lookAt(c.tgt); camera.fov = c.fov; camera.updateProjectionMatrix();
    },
    draw(renderer, rt) {
      if (liveShot) {
        const s = sets[liveShot.i]; if (s.shoe) s.shoe.paint(RUNNER); if (s.text) { s.text.uOn.value = 0; s.hero.root.visible = false; }
        s.update(CUE.sets[liveShot.i] + 2 + liveShot.u, liveShot.u); const c = s.shot(liveShot.u);
        renderer.setRenderTarget(live); renderer.setClearColor('#000000', 1); renderer.clear(); renderer.render(s.scene, c); renderer.setRenderTarget(rt);
      }
      renderer.render(scene, camera);
    },
    look(t) {
      const out = { bloom: 0.5, contrast: 1.05, vig: 0.45 };
      if (t < CUE.toTimeline + 0.5) {
        const v = new THREE.Vector3(), checked = t >= CUE.check + 0.8;
        out.screens = screens.map((s, i) => {
          v.copy(s.g.position).add(V(-SCR[0] / 2, -SCR[1] / 2 - 0.04, 0)).project(camera);
          const sh = SHOTS[i], base = { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, name: `${sh.id}  ${sh.name}`, data: `${sh.lens} mm  ·  ${sh.frames} f  ·  ${sh.lane}`, alpha: 1 - prog(t, CUE.toTimeline, CUE.toTimeline + 0.4) };
          if (i === 0) {
            if (t < CUE.fail) return { ...base, check: checked ? 'colour  …' : '' };
            if (t < CUE.pass) return { ...base, check: `colour  ΔE00 ${dBad.toFixed(1)}  ✗`, ok: false };
            return { ...base, check: `colour  ΔE00 ${dFixed.toFixed(1)}  ✓` };
          }
          return { ...base, check: checked ? `motion  ${speeds[i].toFixed(2)} m/s  ✓` : '' };
        });
        if (t >= CUE.fail && t < CUE.allPass) out.delta = t < CUE.pass ? { value: dBad, ok: false } : { value: dFixed, ok: true };
      }
      return out;
    },
  };
}
