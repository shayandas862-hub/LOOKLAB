// The hero (and the fashion models): a faceless, jointed figure, about 1.8 m. Ceramic shell, steel joints, a dark
// visor so you can always tell where it's looking. It can be drawn as a glowing line, or worn in a jacket and sneakers.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { clamp, lerp } from './util.js';

const TAU = Math.PI * 2;
export const ceramic = () => new THREE.MeshPhysicalMaterial({ color: '#D9D6D0', roughness: 0.32, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.18 });
export const chromeMat = () => new THREE.MeshPhysicalMaterial({ color: '#E8ECF2', roughness: 0.08, metalness: 1 });
const steel = () => new THREE.MeshStandardMaterial({ color: '#2B2E34', roughness: 0.3, metalness: 0.85 });

function capsule(r, len, mat, seg = 20) {
  const g = new THREE.CapsuleGeometry(r, len, 8, seg); g.translate(0, -len / 2, 0);
  const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
}
// A sculpted limb hanging down from its joint: radius r0 at the top, r1 at the bottom, a bulge `belly` at 35%,
// with rounded caps at both ends.
function limb(r0, r1, len, mat, belly = 0) {
  const pts = [], cap = 6;
  for (let i = 0; i <= cap; i++) { const a = (Math.PI / 2) * (i / cap); pts.push(new THREE.Vector2(Math.max(0.0001, r0 * Math.sin(a)), r0 * 0.6 * Math.cos(a))); }
  for (let i = 1; i < 16; i++) { const u = i / 16; pts.push(new THREE.Vector2(r0 + (r1 - r0) * u + belly * Math.exp(-(((u - 0.35) / 0.22) ** 2)), -u * len)); }
  for (let i = 0; i <= cap; i++) { const a = (Math.PI / 2) * (i / cap); pts.push(new THREE.Vector2(Math.max(0.0001, r1 * Math.cos(a)), -len - r1 * 0.6 * Math.sin(a))); }
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts.reverse(), 28), mat); m.castShadow = true; m.receiveShadow = true; return m;
}
function ball(r, mat) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat); m.castShadow = true; return m; }

// The glowing pencil: an inflated back-face shell, revealed from the head down.
function lineMaterial(color = '#FFFFFF') {
  return new THREE.ShaderMaterial({
    uniforms: { cut: { value: 99 }, col: { value: new THREE.Color(color) }, glow: { value: 2.2 }, thick: { value: 0.011 } },
    side: THREE.BackSide,
    vertexShader: `uniform float thick; varying float vY;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vec3 n = normalize(transpose(inverse(mat3(modelMatrix))) * normal);
        w.xyz += n * thick; vY = w.y; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float cut, glow; uniform vec3 col; varying float vY;
      void main(){ if (vY < cut) discard; float tip = smoothstep(0.08, 0.0, vY - cut); gl_FragColor = vec4(col * glow * (1.0 + tip * 3.0), 1.0); }`,
  });
}

export function createFigure({ body = ceramic(), joint = steel(), visor = true } = {}) {
  const root = new THREE.Group(), hips = new THREE.Group(); root.add(hips); hips.position.y = 0.98;
  const meshes = [];
  const add = (parent, m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); parent.add(m); meshes.push(m); return m; };
  const pelvis = add(hips, ball(1, body)); pelvis.scale.set(0.16, 0.1, 0.11);
  const spine = new THREE.Group(); spine.position.y = 0.06; hips.add(spine);
  const torsoGeo = new THREE.LatheGeometry([[0.001, -0.02], [0.13, 0.0], [0.122, 0.1], [0.15, 0.24], [0.195, 0.37], [0.2, 0.43], [0.15, 0.5], [0.06, 0.53], [0.001, 0.53]].map(([r, y]) => new THREE.Vector2(r, y)), 32);
  const torso = add(spine, new THREE.Mesh(torsoGeo, body)); torso.scale.set(1, 1, 0.66); torso.castShadow = true;
  const chest = new THREE.Group(); chest.position.y = 0.4; spine.add(chest);
  const neck = new THREE.Group(); neck.position.y = 0.11; chest.add(neck);
  add(neck, capsule(0.045, 0.06, joint), 0, 0.07, 0);
  const head = new THREE.Group(); head.position.y = 0.08; neck.add(head);
  const skull = add(head, ball(1, body), 0, 0.12, 0.01); skull.scale.set(0.105, 0.13, 0.115);
  let visorMesh = null;
  if (visor) {
    const vg = new THREE.SphereGeometry(1, 40, 16, Math.PI * 0.08, Math.PI * 0.84, Math.PI * 0.36, Math.PI * 0.2); // centred on +z, the way it faces
    visorMesh = add(head, new THREE.Mesh(vg, new THREE.MeshPhysicalMaterial({ color: '#07080A', roughness: 0.05, metalness: 0.4, clearcoat: 1 })), 0, 0.125, 0.012);
    visorMesh.scale.set(0.11, 0.135, 0.12); visorMesh.rotation.y = 0;
    const rim = add(head, new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 6, 48, Math.PI * 0.84), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 1.1, 0.25) })), 0, 0.095, 0.012);
    rim.rotation.set(Math.PI / 2, 0, Math.PI * 0.08); rim.scale.set(0.112, 0.122, 1);
  }
  const arm = (s) => {
    const sh = new THREE.Group(); sh.position.set(s * 0.215, 0.05, 0); chest.add(sh);
    add(sh, ball(0.058, joint));
    add(sh, limb(0.056, 0.04, 0.29, body, 0.006), 0, 0.0, 0);
    const el = new THREE.Group(); el.position.y = -0.29; sh.add(el);
    add(el, ball(0.042, joint));
    add(el, limb(0.044, 0.031, 0.26, body, 0.006), 0, 0.0, 0);
    const hand = add(el, capsule(0.034, 0.06, joint), 0, -0.27, 0); hand.scale.set(1, 1, 0.75);
    return { sh, el };
  };
  const leg = (s) => {
    const hp = new THREE.Group(); hp.position.set(s * 0.095, -0.04, 0); hips.add(hp);
    add(hp, limb(0.085, 0.052, 0.45, body, 0.008), 0, 0.01, 0);
    const kn = new THREE.Group(); kn.position.y = -0.44; hp.add(kn);
    add(kn, ball(0.055, joint));
    add(kn, limb(0.056, 0.036, 0.44, body, 0.012), 0, 0.0, 0);
    const an = new THREE.Group(); an.position.y = -0.44; kn.add(an);
    const foot = add(an, new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.065, 0.23, 3, 0.025), joint), 0, -0.035, 0.05); foot.castShadow = true;
    return { hp, kn, an, foot };
  };
  const A = { L: arm(1), R: arm(-1) }, Lg = { L: leg(1), R: leg(-1) };

  // Line mode: every mesh gets a glowing shell; the body turns black so it hides the lines behind it.
  const solid = new Map(meshes.map((m) => [m, m.material]));
  const black = new THREE.MeshBasicMaterial({ color: '#000000' });
  const line = lineMaterial();
  const grad = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 180, 180, 180, 255, 255, 255, 255, 255]), 3, 1); grad.needsUpdate = true;
  grad.minFilter = grad.magFilter = THREE.NearestFilter;
  const alt = { chrome: chromeMat(), toonBody: new THREE.MeshToonMaterial({ color: '#FFFFFF', gradientMap: grad }), toonJoint: new THREE.MeshToonMaterial({ color: '#2A2A2E', gradientMap: grad }) };
  let bodyMat = body; const bodyNow = () => bodyMat;
  const shells = meshes.map((m) => { const sh = new THREE.Mesh(m.geometry, line); sh.visible = false; m.add(sh); return sh; });

  const fig = {
    root, hips, head, visor: visorMesh, meshes, line,
    // style: 'solid' | 'chrome' | 'toon' (white with ink outlines) | 'line' (glowing pencil, revealed above `reveal` m).
    setStyle(style, reveal = 99) {
      const isLine = style === 'line', isToon = style === 'toon';
      meshes.forEach((m, i) => {
        const orig = solid.get(m), isBody = orig === bodyNow();
        m.material = isLine ? black : isToon ? (isBody ? alt.toonBody : alt.toonJoint) : style === 'chrome' && isBody ? alt.chrome : orig;
        shells[i].visible = isLine || isToon; m.castShadow = !isLine;
      });
      line.uniforms.cut.value = isToon ? -99 : reveal;
      if (isToon) { line.uniforms.col.value.set('#0B0A0D'); line.uniforms.glow.value = 1; line.uniforms.thick.value = 0.014; }
      else { line.uniforms.col.value.set('#FFFFFF'); line.uniforms.thick.value = 0.011; }
    },
    setMaterial(mat) { for (const [m, orig] of solid) if (orig === bodyMat) { solid.set(m, mat); m.material = mat; } bodyMat = mat; },
    setPose(p) {
      hips.position.y = 0.98 + (p.y ?? 0);
      hips.rotation.set(p.lean ?? 0, p.yaw ?? 0, p.roll ?? 0, 'YXZ');
      spine.rotation.set(p.bend ?? 0, p.twist ?? 0, 0, 'YXZ');
      chest.rotation.set(0, p.chestTwist ?? 0, 0);
      head.rotation.set(p.headPitch ?? 0, p.headYaw ?? 0, p.headRoll ?? 0, 'YXZ');
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1, a = p['arm' + s] ?? [0, 0.08, 0.1], l = p['leg' + s] ?? [0, 0, 0, 0];
        A[s].sh.rotation.set(-a[0], 0, sg * a[1], 'XZY'); A[s].el.rotation.set(-a[2], 0, 0);
        Lg[s].hp.rotation.set(-l[0], 0, sg * (l[1] ?? 0), 'XZY'); Lg[s].kn.rotation.set(l[2], 0, 0); Lg[s].an.rotation.set(-(l[3] ?? 0), 0, 0);
      }
    },
    // A jacket and sneakers, for the tag and the walk into the world.
    wear({ jacket = null, shoes = null } = {}) {
      if (jacket) {
        const shell = (m, r) => { const j = new THREE.Mesh(m.geometry, jacket); j.scale.setScalar(r); j.castShadow = true; m.add(j); };
        shell(torso, 1.07); A.L.sh.children[1] && shell(A.L.sh.children[1], 1.18); A.R.sh.children[1] && shell(A.R.sh.children[1], 1.18);
        A.L.el.children[1] && shell(A.L.el.children[1], 1.14); A.R.el.children[1] && shell(A.R.el.children[1], 1.14);
        const collar = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.03, 10, 28), jacket); collar.rotation.x = Math.PI / 2; collar.position.y = 0.5; collar.scale.set(1.3, 1, 1); torso.add(collar);
      }
      if (shoes) for (const s of ['L', 'R']) { const f = Lg[s].foot; f.visible = false; const sh = shoes(); sh.position.set(0, -0.07, 0.035); sh.traverse((o) => { o.castShadow = true; }); Lg[s].an.add(sh); }
    },
  };
  fig.setPose({});
  return fig;
}

// ── Gaits. phase: 0..1 over two steps; a foot lands at 0 (left) and 0.5 (right). ──
function legRun(p) {
  const flex = 0.08 + 0.62 * Math.cos(TAU * (p - 0.85));
  const swing = p > 0.3 && p < 0.97 ? Math.pow(Math.sin(Math.PI * (p - 0.3) / 0.67), 1.4) : 0;
  const knee = 0.18 + 1.75 * swing + (p < 0.3 ? 0.38 * Math.sin(Math.PI * p / 0.3) : 0);
  return [flex, 0.02, knee, -0.25 + 0.55 * swing];
}
export function run(phase, k = 1) {
  const pL = ((phase % 1) + 1) % 1, pR = (pL + 0.5) % 1;
  const L = legRun(pL), R = legRun(pR), arm = (q) => 0.65 * Math.cos(TAU * (q - 0.85));
  return {
    y: (0.045 * Math.cos(2 * TAU * (pL - 0.4)) - 0.03) * k, lean: 0.2 * k, bend: 0.06 * k,
    yaw: 0.1 * Math.sin(TAU * pL) * k, chestTwist: -0.16 * Math.sin(TAU * pL) * k, headYaw: 0.06 * Math.sin(TAU * pL) * k, headPitch: -0.15 * k,
    legL: L.map((v) => v * k), legR: R.map((v) => v * k),
    armL: [arm(pR) * k, 0.12, 1.45 * k + 0.1], armR: [arm(pL) * k, 0.12, 1.45 * k + 0.1],
  };
}
function legWalk(p) {
  const flex = 0.04 + 0.36 * Math.cos(TAU * (p - 0.9));
  const swing = p > 0.5 && p < 1 ? Math.sin(Math.PI * (p - 0.5) / 0.5) : 0;
  return [flex, -0.05, 0.08 + 0.75 * swing, -0.1 + 0.3 * swing];
}
// A runway walk: hips sway, feet cross a little, arms loose.
export function walk(phase) {
  const pL = ((phase % 1) + 1) % 1, pR = (pL + 0.5) % 1;
  return {
    y: 0.018 * Math.cos(2 * TAU * (pL - 0.1)) - 0.012, lean: -0.03, roll: 0.06 * Math.sin(TAU * pL), yaw: 0.13 * Math.sin(TAU * pL),
    chestTwist: -0.1 * Math.sin(TAU * pL), headPitch: 0.02,
    legL: legWalk(pL), legR: legWalk(pR), armL: [0.28 * Math.cos(TAU * (pR - 0.9)), 0.14, 0.25], armR: [0.28 * Math.cos(TAU * (pL - 0.9)), 0.14, 0.25],
  };
}
export function stand(breath = 0) {
  return { y: 0.004 * Math.sin(breath), armL: [0.02, 0.1, 0.12], armR: [0.02, 0.1, 0.12], legL: [0, 0.03, 0.02, 0], legR: [0, 0.03, 0.02, 0] };
}
// Blend two poses field by field.
export function mix(a, b, f) {
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k] ?? (Array.isArray(b[k]) ? b[k].map(() => 0) : 0), y = b[k] ?? (Array.isArray(a[k]) ? a[k].map(() => 0) : 0);
    out[k] = Array.isArray(x) ? x.map((v, i) => lerp(v, y[i] ?? 0, f)) : lerp(x, y, clamp(f));
  }
  return out;
}
