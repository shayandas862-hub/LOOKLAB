// Hand props: the slate (held in front of the hero camera) and the director's viewfinder.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PAL, T } from './timeline.js';
import { ease, prog, lerp } from './util.js';
import { pose } from './anim.js';

function tex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const stripes = () => tex(512, 64, (g, w, h) => {
  g.fillStyle = '#F4F1EA'; g.fillRect(0, 0, w, h); g.fillStyle = '#16161C';
  for (let x = -h; x < w + h; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 32, 0); g.lineTo(x + 32 - h, h); g.lineTo(x - h, h); g.fill(); }
});

export function createSlate(camera) {
  const g = new THREE.Group(); camera.add(g);
  const slate = tex(1024, 720, (c, w, h) => {
    c.fillStyle = '#17171D'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(244,241,234,0.85)'; c.lineWidth = 4;
    c.strokeRect(30, 30, w - 60, h - 60); c.beginPath(); c.moveTo(30, 300); c.lineTo(w - 30, 300); c.moveTo(30, 470); c.lineTo(w - 30, 470); c.moveTo(w / 3, 300); c.lineTo(w / 3, 470); c.moveTo(2 * w / 3, 300); c.lineTo(2 * w / 3, 470); c.stroke();
    c.fillStyle = '#F4F1EA'; c.textAlign = 'center';
    c.font = 'italic 300 150px Fraunces'; c.fillText('First Light', w / 2, 200);
    c.font = '600 30px "Schibsted Grotesk"'; c.letterSpacing = '6px';
    [['SCENE', '01'], ['TAKE', '01'], ['ROLL', 'A'] ].forEach(([k, v], i) => { c.fillText(k, w / 6 + i * w / 3, 345); c.font = '300 84px Fraunces'; c.fillText(v, w / 6 + i * w / 3, 440); c.font = '600 30px "Schibsted Grotesk"'; });
    c.textAlign = 'left'; c.fillText('DIRECTOR  ·  THE ONE IN THE BERET', 70, 540); c.fillText('CAMERA  ·  A', 70, 600); c.textAlign = 'right'; c.fillText('NIGHT  ·  EXT.', w - 70, 600);
  });
  const board = new THREE.Mesh(new RoundedBoxGeometry(0.28, 0.2, 0.012, 2, 0.006), [0, 0, 0, 0, new THREE.MeshStandardMaterial({ map: slate, roughness: 0.75 }), 0].map((m) => m || new THREE.MeshStandardMaterial({ color: '#17171D', roughness: 0.6 })));
  g.add(board);
  const st = stripes();
  const fixed = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.014), new THREE.MeshStandardMaterial({ map: st, roughness: 0.5 })); fixed.position.y = 0.122; g.add(fixed);
  const hinge = new THREE.Group(); hinge.position.set(-0.14, 0.142, 0); g.add(hinge);
  const stick = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 0.014), new THREE.MeshStandardMaterial({ map: st, roughness: 0.5 })); stick.position.set(0.14, 0.02, 0); hinge.add(stick);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.06, 20, 14), new THREE.MeshPhysicalMaterial({ color: PAL.cream, roughness: 0.55, sheen: 0.6 })); hand.position.set(0.1, -0.12, -0.02); g.add(hand);
  const lamp = new THREE.PointLight('#FFE0BE', 0, 2, 1.5); lamp.position.set(-0.3, 0.2, 0.4); g.add(lamp);
  return function update(t) {
    g.visible = t >= 27.45 && t < T.slateOut[1];
    if (!g.visible) return;
    const up = ease.outCubic(prog(t, 27.45, 27.7)), out = ease.inCubic(prog(t, T.slateOut[0], T.slateOut[1]));
    g.position.set(0.02 - out * 0.5, -0.36 + up * 0.31 - out * 0.36, -1.05);
    g.rotation.set(0.05, -0.12 + out * 0.3, 0.04 + out * 0.9);
    const open = ease.outCubic(prog(t, 27.6, 27.95)), snap = ease.inExpo(prog(t, T.clap - 0.07, T.clap));
    hinge.rotation.z = 0.5 * open * (1 - snap);
    const kick = Math.exp(-Math.max(0, t - T.clap) / 0.05) * (t >= T.clap ? 1 : 0);
    g.position.y -= kick * 0.006;
    lamp.intensity = 0.6;
  };
}

export function createViewfinder(dirRoot) {
  const g = new THREE.Group(); dirRoot.add(g);
  const ink = new THREE.MeshStandardMaterial({ color: PAL.ink, roughness: 0.35, metalness: 0.3 });
  const W = 0.2, H = 0.084, b = 0.014;
  for (const [x, y, w, h] of [[0, H / 2, W + b, b], [0, -H / 2, W + b, b], [W / 2, 0, b, H], [-W / 2, 0, b, H]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.012), ink); m.position.set(x, y, 0); g.add(m);
  }
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 8), ink); handle.position.set(0, -H / 2 - 0.045, 0); g.add(handle);
  return function update(t) {
    const w = ease.outBack(prog(t, T.finder[0] + 0.05, T.finder[1])) * (1 - prog(t, 27.4, 27.5));
    g.visible = w > 0.01; g.scale.setScalar(Math.max(0.001, w));
    g.position.set(0, 0.69, 0.43 + 0.02 * Math.sin(t * 3));
  };
}

// World position of the viewfinder's centre, for the push-in.
export function finderWorld(t) {
  const p = pose('dir', t), f = [Math.sin(p.yaw), Math.cos(p.yaw)];
  return [p.x + f[0] * 0.43, 0.69 + p.y, p.z + f[1] * 0.43];
}
