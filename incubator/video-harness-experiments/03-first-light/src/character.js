// A bean character: soft-sheen body, a face that blinks, looks and emotes, little arms and feet,
// and an accessory that lags behind every move. Driven entirely by pose() from anim.js.
import * as THREE from 'three';
import { PAL } from './timeline.js';
import { pose } from './anim.js';

const R = 0.28, L = 0.42;
const zOn = (x) => Math.sqrt(R * R - x * x);

function sheen(color, rough = 0.55) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: 0, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color('#ffffff'), clearcoat: 0.15, clearcoatRoughness: 0.6 });
}

function blob(texSize = 128) {
  const c = document.createElement('canvas'); c.width = c.height = texSize;
  const g = c.getContext('2d'), gr = g.createRadialGradient(texSize / 2, texSize / 2, 0, texSize / 2, texSize / 2, texSize / 2);
  gr.addColorStop(0, 'rgba(20,16,28,0.55)'); gr.addColorStop(0.55, 'rgba(20,16,28,0.22)'); gr.addColorStop(1, 'rgba(20,16,28,0)');
  g.fillStyle = gr; g.fillRect(0, 0, texSize, texSize);
  return new THREE.CanvasTexture(c);
}
const BLOB = { tex: null };

export function createCharacter(scene, who) {
  const isDir = who === 'dir';
  const bodyCol = isDir ? PAL.cream : PAL.peach, shoeCol = isDir ? PAL.navy : PAL.teal;
  const root = new THREE.Group(), tilt = new THREE.Group(), squash = new THREE.Group();
  root.add(tilt); tilt.add(squash); scene.add(root);

  const bodyGeo = new THREE.CapsuleGeometry(R, L, 12, 32); bodyGeo.translate(0, R + L / 2 + 0.02, 0);
  const body = new THREE.Mesh(bodyGeo, sheen(bodyCol)); body.castShadow = true; body.receiveShadow = true; squash.add(body);

  // Face.
  const ink = new THREE.MeshStandardMaterial({ color: PAL.ink, roughness: 0.25 });
  const white = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const eyeGeo = new THREE.SphereGeometry(1, 20, 14), hiGeo = new THREE.SphereGeometry(1, 10, 8);
  const eyes = [-1, 1].map((s) => {
    const g = new THREE.Group(), x = s * 0.095;
    g.position.set(x, 0.685, zOn(x) + 0.008); g.rotation.y = Math.atan2(x, zOn(x));
    const e = new THREE.Mesh(eyeGeo, ink); e.scale.set(0.05, 0.07, 0.028); g.add(e);
    const h = new THREE.Mesh(hiGeo, white); h.scale.setScalar(0.015); h.position.set(0.016, 0.024, 0.024); g.add(h);
    squash.add(g); return { g, e, h, base: g.position.clone() };
  });
  const blushMat = new THREE.MeshBasicMaterial({ color: '#F07F86', transparent: true, opacity: 0.45, depthWrite: false });
  [-1, 1].forEach((s) => {
    const x = s * 0.17, m = new THREE.Mesh(new THREE.CircleGeometry(0.036, 24), blushMat);
    m.position.set(x, 0.615, zOn(x) + 0.004); m.rotation.y = Math.atan2(x, zOn(x)); squash.add(m);
  });
  const mouth = new THREE.Group(); mouth.position.set(0, 0.585, zOn(0) + 0.006); squash.add(mouth);
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.009, 8, 24, Math.PI), ink); smile.rotation.z = Math.PI; mouth.add(smile);
  const open = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshStandardMaterial({ color: '#3B1A2A', roughness: 0.4 })); mouth.add(open);
  const brows = isDir ? [-1, 1].map((s) => {
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.045, 4, 8), ink); m.rotation.z = Math.PI / 2 + s * 0.12;
    const x = s * 0.095; m.position.set(x, 0.775, zOn(x) + 0.006); squash.add(m); return { m, y: 0.775 };
  }) : [];

  // Arms.
  const armGeo = new THREE.CapsuleGeometry(0.052, 0.17, 6, 12); armGeo.translate(0, -0.11, 0);
  const handGeo = new THREE.SphereGeometry(0.066, 16, 12);
  const armMat = sheen(bodyCol);
  const arms = [1, -1].map((s) => {
    const sh = new THREE.Group(); sh.position.set(s * 0.255, 0.56, 0.0); sh.rotation.order = 'XYZ';
    const a = new THREE.Mesh(armGeo, armMat); a.castShadow = true; sh.add(a);
    const h = new THREE.Mesh(handGeo, armMat); h.position.y = -0.24; h.castShadow = true; sh.add(h);
    squash.add(sh); return { sh, s };
  });

  // Feet stay planted on the ground: outside the squash group.
  const shoe = new THREE.MeshStandardMaterial({ color: shoeCol, roughness: 0.45 });
  const feet = [1, -1].map((s) => {
    const f = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), shoe); f.scale.set(0.085, 0.052, 0.12); f.castShadow = true;
    tilt.add(f); return { f, s };
  });

  // Accessories that lag.
  const acc = new THREE.Group(); acc.position.set(0, 0.93, 0); squash.add(acc);
  if (isDir) {
    const beret = new THREE.Mesh(new THREE.SphereGeometry(0.205, 28, 16), sheen(PAL.tomato, 0.7)); beret.scale.set(1, 0.34, 1);
    beret.position.set(0.035, 0.07, -0.01); beret.rotation.z = -0.22; beret.castShadow = true; acc.add(beret);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.05, 8), sheen(PAL.tomato, 0.7)); stem.position.set(0.05, 0.14, -0.01); acc.add(stem);
    const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.283, 0.03, 10, 48), sheen(PAL.marigold, 0.8)); scarf.rotation.x = Math.PI / 2; scarf.position.y = 0.49; scarf.castShadow = true; squash.add(scarf);
    const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.12, 6, 10), sheen(PAL.marigold, 0.8)); tail.position.set(-0.19, 0.4, 0.2); tail.rotation.set(0.3, 0, 0.35); squash.add(tail);
  } else {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.012, 0.14, 8), new THREE.MeshStandardMaterial({ color: PAL.leaf, roughness: 0.6 })); stem.position.y = 0.06; acc.add(stem);
    const head = new THREE.Group(); head.position.y = 0.14; head.rotation.x = 0.5; acc.add(head);
    const petal = sheen('#FFF6E8', 0.6);
    for (let k = 0; k < 6; k++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), petal); const a = (k / 6) * Math.PI * 2; p.scale.set(1, 0.4, 0.7); p.position.set(Math.cos(a) * 0.055, 0, Math.sin(a) * 0.055); p.rotation.y = -a; head.add(p); }
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), sheen(PAL.marigold, 0.5)); core.scale.y = 0.6; core.position.y = 0.012; head.add(core);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 6), new THREE.MeshStandardMaterial({ color: PAL.leaf, roughness: 0.6 })); leaf.scale.set(1, 0.3, 0.5); leaf.position.set(0.04, 0.05, 0); leaf.rotation.z = -0.6; acc.add(leaf);
  }

  // Contact shadow: grounds the character even where the shadow map is soft.
  BLOB.tex ??= blob();
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: BLOB.tex, transparent: true, depthWrite: false }));
  contact.rotation.x = -Math.PI / 2; contact.position.y = 0.006; contact.renderOrder = 1; scene.add(contact);

  return {
    root,
    update(t) {
      const p = pose(who, t);
      root.visible = contact.visible = p.visible;
      if (!p.visible) return p;
      root.position.set(p.x, p.y, p.z); root.rotation.y = p.yaw;
      tilt.rotation.set(p.lean, 0, -p.side);
      const s = p.squash; squash.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s));
      contact.position.set(p.x, 0.006, p.z); contact.scale.setScalar(1 - Math.min(0.5, p.y * 1.2)); contact.material.opacity = 1 - Math.min(0.6, p.y * 1.5);
      const [ex, ey] = p.eyes;
      eyes.forEach(({ g, e, h, base }) => {
        g.position.set(base.x + ex * 0.024, base.y + ey * 0.02, base.z);
        e.scale.y = 0.07 * (1 - 0.9 * p.blink) * (1 + 0.15 * p.mouth[1]); h.visible = p.blink < 0.4;
      });
      const [sm, op] = p.mouth;
      smile.scale.set(1 + 0.2 * sm, Math.max(0.05, sm), 1); smile.visible = op < 0.6;
      open.visible = op > 0.05; open.scale.set(0.034 + 0.01 * sm, 0.04 * op, 0.014); open.position.y = -0.01;
      brows.forEach(({ m, y }) => { m.position.y = y + 0.025 * op - 0.01 * (1 - sm); });
      arms.forEach(({ sh, s }) => { const [pitch, spread] = s > 0 ? p.arms.L : p.arms.R; sh.rotation.set(-pitch, 0, s * spread); });
      feet.forEach(({ f, s }) => { const [dz, lift] = s > 0 ? p.feet.L : p.feet.R; f.position.set(s * 0.11, 0.045 + lift, 0.03 + dz); });
      acc.rotation.set(p.lag[1] * 1.4, 0, -p.lag[0] * 1.4);
      return p;
    },
  };
}
