// A faceless, jointed stand-in for a person, about 1.8 m (metres here, not the bowl's 8 cm units). Taken from film
// 05's figure (05-one-sentence/src/figure.js) without its line, toon and chrome looks: matte clay only, so the depth
// and masks read cleanly. The face, hair, skin and clothes come from the person's own photo, not from here.
import * as THREE from 'three';

export const clay = (color = '#cdbfb2') => new THREE.MeshStandardMaterial({ color, roughness: 0.82 });

function capsule(r, len, mat) {
  const g = new THREE.CapsuleGeometry(r, len, 8, 20); g.translate(0, -len / 2, 0);
  return new THREE.Mesh(g, mat);
}
// A limb hanging down from its joint: radius r0 at the top, r1 at the bottom, a bulge `belly` at 35%, rounded caps.
function limb(r0, r1, len, mat, belly = 0) {
  const pts = [], cap = 6;
  for (let i = 0; i <= cap; i++) { const a = (Math.PI / 2) * (i / cap); pts.push(new THREE.Vector2(Math.max(0.0001, r0 * Math.sin(a)), r0 * 0.6 * Math.cos(a))); }
  for (let i = 1; i < 16; i++) { const u = i / 16; pts.push(new THREE.Vector2(r0 + (r1 - r0) * u + belly * Math.exp(-(((u - 0.35) / 0.22) ** 2)), -u * len)); }
  for (let i = 0; i <= cap; i++) { const a = (Math.PI / 2) * (i / cap); pts.push(new THREE.Vector2(Math.max(0.0001, r1 * Math.cos(a)), -len - r1 * 0.6 * Math.sin(a))); }
  return new THREE.Mesh(new THREE.LatheGeometry(pts.reverse(), 28), mat);
}
const ball = (r, mat) => new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat);

export function createFigure({ body = clay(), joint = clay('#b9ab9e') } = {}) {
  const root = new THREE.Group(), hips = new THREE.Group(); root.add(hips); hips.position.y = 0.98;
  const add = (parent, m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; parent.add(m); return m; };
  add(hips, ball(1, body)).scale.set(0.16, 0.1, 0.11);
  const spine = new THREE.Group(); spine.position.y = 0.06; hips.add(spine);
  const torsoGeo = new THREE.LatheGeometry([[0.001, -0.02], [0.13, 0.0], [0.122, 0.1], [0.15, 0.24], [0.195, 0.37], [0.2, 0.43], [0.15, 0.5], [0.06, 0.53], [0.001, 0.53]].map(([r, y]) => new THREE.Vector2(r, y)), 32);
  add(spine, new THREE.Mesh(torsoGeo, body)).scale.set(1, 1, 0.66);
  const chest = new THREE.Group(); chest.position.y = 0.4; spine.add(chest);
  const neck = new THREE.Group(); neck.position.y = 0.11; chest.add(neck);
  add(neck, capsule(0.045, 0.06, joint), 0, 0.07, 0);
  const head = new THREE.Group(); head.position.y = 0.08; neck.add(head);
  add(head, ball(1, body), 0, 0.12, 0.01).scale.set(0.105, 0.13, 0.115);
  const arm = (s) => {
    const sh = new THREE.Group(); sh.position.set(s * 0.215, 0.05, 0); chest.add(sh);
    add(sh, ball(0.058, joint)); add(sh, limb(0.056, 0.04, 0.29, body, 0.006));
    const el = new THREE.Group(); el.position.y = -0.29; sh.add(el);
    add(el, ball(0.042, joint)); add(el, limb(0.044, 0.031, 0.26, body, 0.006));
    const hand = add(el, capsule(0.034, 0.06, joint), 0, -0.27, 0); hand.scale.set(1, 1, 0.75);
    return { sh, el, hand };
  };
  const leg = (s) => {
    const hp = new THREE.Group(); hp.position.set(s * 0.095, -0.04, 0); hips.add(hp);
    add(hp, limb(0.085, 0.052, 0.45, body, 0.008), 0, 0.01, 0);
    const kn = new THREE.Group(); kn.position.y = -0.44; hp.add(kn);
    add(kn, ball(0.055, joint)); add(kn, limb(0.056, 0.036, 0.44, body, 0.012));
    return { hp, kn };
  };
  const A = { L: arm(1), R: arm(-1) }, Lg = { L: leg(1), R: leg(-1) };

  const fig = {
    root, head, hands: [A.L.hand, A.R.hand],
    // The same pose fields as film 05: arm = [raise forward, out to the side, elbow bend], leg = [hip, side, knee].
    setPose(p) {
      hips.position.y = 0.98 + (p.y ?? 0);
      hips.rotation.set(p.lean ?? 0, p.yaw ?? 0, p.roll ?? 0, 'YXZ');
      spine.rotation.set(p.bend ?? 0, p.twist ?? 0, 0, 'YXZ');
      chest.rotation.set(0, p.chestTwist ?? 0, 0);
      head.rotation.set(p.headPitch ?? 0, p.headYaw ?? 0, p.headRoll ?? 0, 'YXZ');
      for (const s of ['L', 'R']) {
        const sg = s === 'L' ? 1 : -1, a = p['arm' + s] ?? [0, 0.08, 0.1], l = p['leg' + s] ?? [0, 0.03, 0.02];
        A[s].sh.rotation.set(-a[0], 0, sg * a[1], 'XZY'); A[s].el.rotation.set(-a[2], 0, 0);
        Lg[s].hp.rotation.set(-l[0], 0, sg * l[1], 'XZY'); Lg[s].kn.rotation.set(l[2], 0, 0);
      }
    },
  };
  fig.setPose({});
  return fig;
}
