// The edit: 13 shots, cut on the bar. Each returns camera position, target, lens and focus.
import { T, SPOT } from './timeline.js';
import { ease, prog, lerp, clamp } from './util.js';
import { pose } from './anim.js';
import { finderWorld } from './props.js';

const L = (a, b, f) => a.map((v, i) => lerp(v, b[i], f));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const head = (who, t) => { const p = pose(who, t); return [p.x, 0.62 + p.y, p.z]; };
const MARK = [SPOT.mark[0], 0.62, SPOT.mark[1]];

function shot(t) {
  if (t < 5.0) { // S1 aerial over the grey town
    const f = ease.inOutSine(prog(t, 0, 5)), a = lerp(0.95, 0.5, f), r = lerp(12.8, 10.6, f), h = lerp(8.6, 6.0, f);
    const pos = [Math.sin(a) * r, h, Math.cos(a) * r], tgt = [0, 0.7, -0.4];
    return { pos, tgt, fov: 30, focus: dist(pos, tgt), ap: 0.0032 };
  }
  if (t < 8.75) { // S2 low tracking with the director
    const d = head('dir', t), pos = [d[0] + 1.9, 0.55, d[2] + 2.1], tgt = [d[0] + 0.15, 0.56, d[2]];
    return { pos, tgt, fov: 32, focus: dist(pos, d), ap: 0.0024 };
  }
  if (t < 10.0) { // S3 close-up: where is everything?
    const d = head('dir', t), f = prog(t, 8.75, 10), pos = [-0.6, 0.8, 3.05], tgt = [d[0], 0.72, d[2]];
    return { pos, tgt, fov: lerp(30, 28, f), focus: dist(pos, d), ap: 0.0032 };
  }
  if (t < 12.5) { // S4 the light pops up
    const f = ease.inOutSine(prog(t, 10, 12.5)), pos = L([0.95, 1.0, 1.95], [0.8, 1.08, 2.1], f), tgt = [-1.5, 0.82, 0.7];
    return { pos, tgt, fov: 36, focus: dist(pos, head('dir', t)), ap: 0.0016 };
  }
  if (t < 15.0) { // S5 wide: the colour wave
    const f = ease.inOutSine(prog(t, 12.5, 15)), pos = L([5.4, 6.3, 8.4], [4.5, 5.8, 8.8], f), tgt = [-0.4, 0.4, -0.5];
    return { pos, tgt, fov: 34, focus: dist(pos, head('dir', t)), ap: 0.002 };
  }
  if (t < 20.0) { // S6 the conductor, from behind
    const f = ease.inOutSine(prog(t, 15, 20)), pos = L([-1.75, 0.9, 3.05], [-0.55, 1.2, 3.25], f), tgt = L([-0.7, 1.15, -0.6], [-0.2, 1.45, -1.6], f);
    return { pos, tgt, fov: 40, focus: dist(pos, [0, 1.2, -1.6]), ap: 0.0011 };
  }
  if (t < 22.5) { // S7 the café door
    const f = prog(t, 20, 22.5), pos = L([-0.72, 0.68, 0.72], [-0.82, 0.68, 0.55], f), tgt = [-1.72, 0.56, -1.72];
    return { pos, tgt, fov: 30, focus: dist(pos, tgt), ap: 0.0026 };
  }
  if (t < 25.0) { // S8 two-shot: onto the mark
    const a = head('actor', t), f = ease.inOutSine(prog(t, 22.5, 25)), pos = L([2.0, 1.05, 3.1], [1.7, 0.95, 2.9], f), tgt = L([-0.6, 0.55, -0.4], [a[0] - 0.4, 0.55, a[2] + 0.2], 0.6);
    return { pos, tgt, fov: 38, focus: dist(pos, a), ap: 0.0018 };
  }
  if (t < 27.5) { // S9 over the shoulder, then through the viewfinder
    const d = pose('dir', t), fwd = [Math.sin(d.yaw), Math.cos(d.yaw)], side = [fwd[1], -fwd[0]];
    // Over the shoulder, past the cheek, into the viewfinder: a curve that never enters the head.
    const at = (fw2, sd, y) => [d.x + fwd[0] * fw2 + side[0] * sd, y, d.z + fwd[1] * fw2 + side[1] * sd];
    const start = at(-0.75, 0.55, 0.92), mid = at(0.18, 0.5, 0.76);
    const fw = finderWorld(t), end = [fw[0] - fwd[0] * 0.03, fw[1], fw[2] - fwd[1] * 0.03];
    const p = ease.inOutCubic(prog(t, T.push[0], T.push[1]));
    const pos = L(L(start, mid, p), L(mid, end, p), p), tgt = [MARK[0], 0.66, MARK[2]];
    return { pos, tgt, fov: lerp(40, 26, p), focus: lerp(dist(start, fw), dist(pos, MARK), p), ap: lerp(0.0022, 0.0035, p), k: p > 0 && p < 1 ? 6 : 3 };
  }
  if (t < 35.0) { // S10–S11 the slate, then the hero shot
    const f = ease.inOutSine(prog(t, 28.7, 35)), pos = L([1.02, 0.72, 2.75], [0.74, 0.76, 1.9], f), tgt = L([0.5, 0.7, -0.35], [0.52, 0.74, -0.35], f);
    const rack = ease.inOutCubic(prog(t, 28.35, 28.95));
    return { pos, tgt, fov: lerp(24, 22, f), focus: lerp(1.05, dist(pos, head('actor', t)), rack), ap: 0.0042, k: t > T.slateOut[0] && t < T.slateOut[1] + 0.05 ? 6 : 3, letterbox: 1 };
  }
  // S12–S13 the pull-back into the end card
  // Hold on the run and the high-five, then crane out into the end card.
  const h = ease.inOutSine(prog(t, 35, 36.8)), f = ease.inOutSine(prog(t, 36.8, 39.7));
  const near = L([2.0, 1.0, 3.4], [1.75, 1.1, 3.05], h), far = [8.6, 5.2, 15.2];
  const pos = L(near, far, f), tgt = L(L([0.0, 0.55, 0.15], [0.2, 0.58, -0.1], h), [0, 3.1, -0.6], f);
  const focus = lerp(dist(pos, [0.2, 0.6, -0.1]), dist(pos, [0, 0.6, -0.4]), f);
  return { pos, tgt, fov: 32, focus, ap: lerp(0.0018, 0.0034, f), k: f > 0.05 && f < 0.95 ? 5 : 3, letterbox: 1 - ease.inOutCubic(prog(t, 35, 35.45)) };
}

export function cameraAt(t) {
  const s = shot(t);
  // A breath of handheld life on everything but the aerial.
  if (t >= 5) { s.pos = [s.pos[0] + Math.sin(t * 1.1) * 0.006, s.pos[1] + Math.sin(t * 1.7 + 1) * 0.005, s.pos[2]]; }
  s.k ??= 3; s.letterbox ??= t > T.letterbox[0] && t < 27.5 ? ease.inOutCubic(prog(t, T.letterbox[0], T.letterbox[1])) : 0;
  return s;
}
