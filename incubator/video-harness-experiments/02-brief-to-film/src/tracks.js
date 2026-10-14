// Act 3: this film's own timeline, in 3D. The playhead sits at the current time of the
// video you are watching; the SOUND lane is the actual soundtrack's envelope.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TRACKS, TIMELINE_X0, METRES_PER_S, TRACK_Z, DURATION, C, F, ACT } from './timeline.js';
import { prog } from './util.js';

export const xAt = (s) => TIMELINE_X0 + s * METRES_PER_S;
const LANE_Y = [3.15, 2.3, 1.45, 0.6];
const TINT = [new THREE.Color(C.bone), new THREE.Color(C.signalHex), new THREE.Color(C.blueHex)];

// A text plane sized to its text (200 px per metre); shrinks the type if it must fit maxW.
function label(text, maxW, h, { size = 46, color = C.bone, weight = 500, bg = null } = {}) {
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = `${weight} ${size}px ${F.mono}`; probe.letterSpacing = '3px';
  const need = probe.measureText(text).width + 36;
  if (need > maxW * 200) size = Math.max(12, Math.floor(size * (maxW * 200) / need));
  probe.font = `${weight} ${size}px ${F.mono}`;
  const w = Math.min(maxW, (probe.measureText(text).width + 36) / 200);
  const c = document.createElement('canvas'); c.width = Math.round(w * 200); c.height = Math.round(h * 200);
  const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); }
  g.font = `${weight} ${size}px ${F.mono}`; g.letterSpacing = '3px'; g.fillStyle = color; g.textBaseline = 'middle';
  g.fillText(text, 18, c.height / 2 + 2);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return { w, mesh: new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: true })), g, c, tex };
}

export function createTracks(scene, envelope) {
  const group = new THREE.Group(); scene.add(group);
  const len = DURATION * METRES_PER_S;
  const laneMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.3, metalness: 0.6 });
  LANE_Y.forEach((y) => {
    const lane = new THREE.Mesh(new THREE.BoxGeometry(len + 1.2, 0.035, 1.0), laneMat);
    lane.position.set(TIMELINE_X0 + len / 2, y, TRACK_Z); group.add(lane);
  });

  // Clips: rounded blocks; each glows while the playhead is inside it.
  const clips = [];
  TRACKS.slice(0, 3).forEach((tr, k) => tr.clips.forEach(([a, b, name]) => {
    const w = (b - a) * METRES_PER_S - 0.05;
    const mat = new THREE.MeshStandardMaterial({ color: 0x1d1d1d, roughness: 0.25, metalness: 0.4, emissive: TINT[k], emissiveIntensity: 0.15 });
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, 0.42, 0.55, 2, 0.04), mat);
    m.position.set(xAt(a) + w / 2 + 0.025, LANE_Y[k] + 0.23, TRACK_Z);
    const l = label(name.toUpperCase(), w - 0.12, 0.22, { size: 40, color: '#0d0d0d', weight: 700 });
    l.mesh.position.set(-w / 2 + l.w / 2 + 0.06, 0.02, 0.28); m.add(l.mesh);
    group.add(m); clips.push({ a, b, mat, k });
  }));

  // Sound lane: one bar per 1/30 s of the real mix.
  const nb = envelope.length, barW = METRES_PER_S / 30;
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(barW * 0.7, 1, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffff }), nb);
  const m4 = new THREE.Matrix4(), col = new THREE.Color();
  envelope.forEach((v, i) => {
    const h = 0.03 + v * 1.1;
    m4.makeScale(1, h, 1).setPosition(xAt(i / 30) + barW / 2, LANE_Y[3] + h / 2 + 0.02, TRACK_Z);
    bars.setMatrixAt(i, m4);
  });
  bars.frustumCulled = false; group.add(bars);

  // Playhead, its timecode and sticky lane names.
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.025, 3.55, 0.025), new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3) }));
  group.add(head);
  const tc = label('00:00:00', 2.2, 0.3, { size: 52, color: '#0a0a0a', weight: 700, bg: C.bone });
  group.add(tc.mesh);
  const names = TRACKS.map((tr, k) => { const l = label(tr.name, 1.3, 0.2, { size: 36, color: C.bone3 }); l.mesh.material.opacity = 0.75; group.add(l.mesh); return { l, y: LANE_Y[k] }; });
  const lamp = new THREE.SpotLight(0xffffff, 40, 26, 0.7, 0.8, 1.3); scene.add(lamp, lamp.target);

  return function update(t) {
    group.visible = t > ACT.engines[1] - 0.6 && t < ACT.film[0] + 1.6;
    lamp.intensity = group.visible ? 40 : 0;
    if (!group.visible) return;
    const x = xAt(t);
    head.position.set(x, 1.85, TRACK_Z + 0.42);
    tc.mesh.position.set(x + tc.w / 2, 3.85, TRACK_Z + 0.42);
    const f = Math.floor(t * 24);
    const two = (n) => String(n).padStart(2, '0');
    tc.g.clearRect(0, 0, tc.c.width, tc.c.height); tc.g.fillStyle = C.bone; tc.g.fillRect(0, 0, tc.c.width, tc.c.height);
    tc.g.fillStyle = '#0a0a0a'; tc.g.fillText(`00:${two(Math.floor(f / 24))}:${two(f % 24)}`, 18, tc.c.height / 2 + 2); tc.tex.needsUpdate = true;
    names.forEach(({ l, y }) => l.mesh.position.set(x - 0.75, y + 0.6, TRACK_Z + 0.45));
    lamp.position.set(x - 2, 7, TRACK_Z + 5); lamp.target.position.set(x + 1, 1.5, TRACK_Z);
    for (const c of clips) {
      const inside = t >= c.a && t < c.b, hit = Math.exp(-Math.max(0, t - c.a) / 0.25) * (t >= c.a ? 1 : 0);
      c.mat.emissiveIntensity = inside ? 0.9 + 2.5 * hit : t >= c.b ? 0.45 : 0.22;
    }
    for (let i = 0; i < nb; i++) {
      const played = i / 30 <= t, near = Math.exp(-Math.abs(i / 30 - t) * 6);
      col.copy(TINT[1]).multiplyScalar(played ? 0.9 + 3 * near : 0.05);
      bars.setColorAt(i, col);
    }
    bars.instanceColor.needsUpdate = true;
  };
}
