// Choreography for both characters as pure functions of time — no three.js here, so the
// soundtrack can import it and put a footstep on every frame a foot lands.
import { T, SPOT, BEAT } from './timeline.js';
import { ease, prog, lerp, clamp, hash } from './util.js';

const TAU = Math.PI * 2;
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
export const faceYaw = (from, to) => Math.atan2(to[0] - from[0], to[1] - from[1]);

// keys: [[t, value, easeName?]] — value a number or array; easing applies to the segment ending at that key.
function track(keys, angle = false) {
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e = 'inOutCubic'] = keys[i];
      if (t < t1) {
        const [t0, v0] = keys[i - 1], f = (ease[e] || ((x) => x))(prog(t, t0, t1));
        if (Array.isArray(v0)) return v0.map((a, k) => lerp(a, v1[k], f));
        return angle ? v0 + wrap(v1 - v0) * f : lerp(v0, v1, f);
      }
    }
    return keys[keys.length - 1][1];
  };
}
// Unwraps an angle track so shortest-path interpolation composes across keys.
function angleTrack(keys) {
  const out = [keys[0]];
  for (let i = 1; i < keys.length; i++) out.push([keys[i][0], out[i - 1][1] + wrap(keys[i][1] - out[i - 1][1]), keys[i][2]]);
  return track(out);
}

const DOOR = [-1.7, -1.62], DOOR_IN = [-1.7, -2.05];
const DIR = SPOT.dir, MARK = SPOT.mark;
const heroCam = [0.75, 2.6];

const D = {
  pos: track([[5.0, SPOT.dirStart], [8.6, DIR, 'inOutSine'], [T.run[0], DIR], [T.run[1], [MARK[0] - 0.62, MARK[1] + 0.3], 'inOutCubic'], [40, [MARK[0] - 0.62, MARK[1] + 0.3]]]),
  yaw: angleTrack([
    [5.0, faceYaw(SPOT.dirStart, DIR)], [8.3, faceYaw(SPOT.dirStart, DIR)], [8.85, 0.25],
    [9.1, 0.85], [9.22, 0.85], [9.5, -0.55], [9.62, -0.55], [9.86, 0.2], [9.94, 0.2],
    [10.42, faceYaw(DIR, SPOT.light)], [10.95, faceYaw(DIR, SPOT.light)], [11.55, faceYaw(DIR, MARK)],
    [12.4, faceYaw(DIR, MARK)], [12.82, 0.7], [14.35, 0.7], [15.0, faceYaw(DIR, [0.3, -2.4])], [19.5, faceYaw(DIR, [0.3, -2.4])],
    [22.0, faceYaw(DIR, [0.3, -2.4])], [22.6, faceYaw(DIR, DOOR)], [23.2, faceYaw(DIR, DOOR)], [24.6, faceYaw(DIR, MARK)], [35.1, faceYaw(DIR, MARK)],
    [35.35, faceYaw(DIR, MARK)], [36.15, faceYaw([MARK[0] - 0.62, MARK[1]], MARK)], [37.0, faceYaw([MARK[0] - 0.62, MARK[1]], MARK)], [37.6, 0.35],
  ]),
  mouth: track([[0, [0.55, 0]], [9.1, [0.55, 0]], [9.2, [0.1, 0.45]], [9.6, [0.4, 0]], [10.98, [0.4, 0]], [11.1, [0, 0.85]], [11.9, [0.5, 0.2]],
    [12.85, [0.6, 0.2]], [12.95, [1, 0.8]], [13.7, [0.7, 0.1]], [22.55, [0.7, 0.1]], [22.65, [0.8, 0.5]], [23.1, [0.7, 0.1]], [36.3, [0.7, 0.1]], [36.4, [1, 0.9]], [37.2, [0.85, 0.2]]]),
  eyes: track([[0, [0, 0]], [8.95, [0.8, 0.1]], [9.3, [-0.8, 0.1]], [9.7, [0, 0]], [10.15, [0, -0.6]], [10.9, [0, -0.3]], [11.3, [0, 0.4]], [12.2, [0, 0]], [21.4, [0, 0]], [21.6, [-0.3, 0]], [23.5, [0.2, 0]], [25.0, [0, 0]]]),
  gestures: [
    [T.shrug[0], T.shrug[1] + 0.2, 'shrug', 0.15, 0.2], [T.point - 0.12, T.pop + 0.25, 'point', 0.12, 0.25],
    [T.joy - 0.1, T.joy + 0.7, 'cheer', 0.12, 0.3], [T.conduct[0], T.conduct[1], 'conduct', 0.25, 0.35],
    [T.beckon, T.beckon + 1.1, 'beckon', 0.15, 0.3], [T.finder[0], 27.6, 'finder', 0.35, 0.2],
    [T.highFive - 0.25, T.highFive + 0.35, 'highfiveR', 0.18, 0.3], [37.2, 40, 'wave', 0.3, 0.3],
  ],
  jumps: [[T.joy, 0.42, 0.5], [T.highFive, 0.3, 0.42]],
  visible: (t) => t >= 4.95,
};

const A = {
  pos: track([[0, DOOR_IN], [T.peek1 - 0.05, DOOR_IN], [T.peek1 + 0.35, DOOR, 'outBack'], [T.hide, DOOR], [T.hide + 0.18, DOOR_IN, 'inCubic'],
    [T.peek2, DOOR_IN], [T.peek2 + 0.4, DOOR, 'outBack'], [T.actorWalk[0], DOOR], [T.actorWalk[1], MARK, 'inOutSine'], [40, MARK]]),
  yaw: angleTrack([[0, 0.5], [T.peek1, 0.5], [T.peek2 + 0.3, 0.75], [T.actorWalk[0], faceYaw(DOOR, MARK)], [T.actorWalk[1] - 0.1, faceYaw(DOOR, MARK)],
    [T.actorWalk[1] + 0.35, faceYaw(MARK, heroCam)], [T.twirl[0], faceYaw(MARK, heroCam)], [35.1, faceYaw(MARK, heroCam)],
    [35.6, faceYaw(MARK, [MARK[0] - 0.62, MARK[1] + 0.3])], [37.0, faceYaw(MARK, [MARK[0] - 0.62, MARK[1] + 0.3])], [37.6, 0.25]]),
  spin: (t) => ease.inOutCubic(prog(t, T.twirl[0], T.twirl[1])) * TAU,
  lean: track([[0, [0, 0.45]], [T.peek1 + 0.35, [0.05, 0.42]], [T.hide + 0.1, [0, 0.45]], [T.peek2 + 0.4, [0.08, 0.38]], [T.actorWalk[0], [0.05, 0]], [40, [0, 0]]]),
  mouth: track([[0, [0.3, 0]], [T.oh - 0.05, [0.3, 0]], [T.oh + 0.05, [0, 0.9]], [22.2, [0.4, 0.1]], [24.7, [0.75, 0.05]], [29.7, [0.75, 0.05]], [29.85, [1, 0.6]], [31.4, [0.85, 0.15]], [36.3, [0.85, 0.15]], [36.4, [1, 0.9]], [37.2, [0.9, 0.2]]]),
  eyes: track([[0, [0.6, 0]], [T.peek2 + 0.3, [0.7, 0]], [T.actorWalk[0], [0.3, 0]], [24.8, [0, 0]], [31.0, [0, 0]], [31.2, [0, 0.15]], [32.5, [0, 0]]]),
  gestures: [[T.peek2 + 0.35, T.peek2 + 1.1, 'shywave', 0.15, 0.25], [T.twirl[0], T.twirl[1] + 0.1, 'twirl', 0.2, 0.3],
    [T.pose, 34.9, 'pose', 0.3, 0.35], [T.highFive - 0.25, T.highFive + 0.35, 'highfiveL', 0.18, 0.3], [37.2, 40, 'wave', 0.3, 0.3]],
  jumps: [[T.highFive, 0.3, 0.42]],
  visible: (t) => t >= T.peek1 - 0.05 && !(t > T.hide + 0.17 && t < T.peek2 - 0.02),
};

// Arm presets: [pitch forward, spread outward] per side, radians.
const REST = { L: [0.05, 0.3], R: [0.05, 0.3] };
function gestureArms(name, t) {
  const s = Math.sin(t * TAU / BEAT);
  switch (name) {
    case 'shrug': return { L: [0.35, 1.15], R: [0.35, 1.15] };
    case 'point': return { L: REST.L, R: [0.75, 0.15] };
    case 'cheer': return { L: [0.25, 2.65], R: [0.25, 2.65] };
    case 'conduct': return { L: [2.05 + 0.5 * s, 0.85 - 0.25 * s], R: [2.05 - 0.5 * s, 0.85 + 0.25 * s] };
    case 'beckon': return { L: REST.L, R: [1.25 + 0.4 * Math.sin(t * 13), 0.25] };
    case 'finder': return { L: [1.55, 0.2], R: [1.55, 0.2] };
    case 'highfiveR': return { L: REST.L, R: [2.95, 0.35] };
    case 'highfiveL': return { L: [2.95, 0.35], R: REST.R };
    case 'shywave': return { L: REST.L, R: [1.0 + 0.25 * Math.sin(t * 15), 0.9] };
    case 'twirl': return { L: [0.25, 1.45], R: [0.25, 1.45] };
    case 'pose': return { L: [2.7, 0.55], R: [-0.25, 0.75] };
    case 'wave': return { L: REST.L, R: [2.6 + 0.0 * s, 0.5 + 0.35 * Math.sin(t * 9)] };
    default: return REST;
  }
}

function distance(posFn, t) {
  // Walked distance up to t, sampled — cheap enough and keeps one source of truth.
  let d = 0, p = posFn(0);
  for (let u = 0.05; u <= t; u += 0.05) { const q = posFn(u); d += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; }
  const q = posFn(t); return d + Math.hypot(q[0] - p[0], q[1] - p[1]);
}

const STRIDE = 0.2;
const CACHE = new Map();

export function pose(who, t) {
  const key = who + t.toFixed(5);
  if (CACHE.has(key)) return CACHE.get(key);
  const C = who === 'dir' ? D : A;
  const p = C.pos(t), pa = C.pos(t - 0.04), pb = C.pos(t + 0.04);
  const vx = (pb[0] - pa[0]) / 0.08, vz = (pb[1] - pa[1]) / 0.08, speed = Math.hypot(vx, vz);
  const amp = clamp(speed / 0.6);
  const phase = (distance(C.pos, t) / STRIDE) * Math.PI;
  let yaw = C.yaw(t) + (C.spin ? C.spin(t) : 0);
  // Walk cycle.
  const bob = amp * Math.abs(Math.sin(phase)) * 0.05, roll = amp * Math.sin(phase) * 0.07;
  const feet = { L: [0.11 * amp * Math.cos(phase), 0.07 * amp * Math.max(0, Math.sin(phase))], R: [-0.11 * amp * Math.cos(phase), 0.07 * amp * Math.max(0, -Math.sin(phase))] };
  let arms = { L: [REST.L[0] + 0.3 * amp * Math.cos(phase), REST.L[1]], R: [REST.R[0] - 0.3 * amp * Math.cos(phase), REST.R[1]] };
  let squash = 1 + 0.015 * Math.sin(t * TAU / 2.3 + (who === 'dir' ? 0 : 1.7)), y = bob, lean = amp * 0.1, side = roll;
  if (C.lean) { const [lp, ls] = C.lean(t); lean += lp; side += ls; }
  for (const [t0, t1, name, fi, fo] of C.gestures) {
    const w = ease.inOutCubic(prog(t, t0, t0 + fi)) * (1 - ease.inOutCubic(prog(t, t1 - fo, t1)));
    if (w <= 0) continue;
    const g = gestureArms(name, t);
    arms = { L: [lerp(arms.L[0], g.L[0], w), lerp(arms.L[1], g.L[1], w)], R: [lerp(arms.R[0], g.R[0], w), lerp(arms.R[1], g.R[1], w)] };
    if (name === 'shrug') { squash -= 0.05 * w; y += 0.03 * w; }
    if (name === 'point') { lean += 0.18 * w; squash -= 0.04 * w; }
    if (name === 'conduct') { y += 0.025 * Math.abs(Math.sin(t * Math.PI / BEAT)) * w; side += 0.04 * Math.sin(t * Math.PI / BEAT) * w; }
  }
  // Jumps: anticipation squash, stretch in the air, squash on landing.
  for (const [tj, h, dur] of C.jumps) {
    const pre = prog(t, tj - 0.16, tj), air = prog(t, tj, tj + dur), land = prog(t, tj + dur, tj + dur + 0.18);
    if (pre > 0 && pre < 1) squash -= 0.14 * Math.sin(Math.PI * pre * 0.5);
    if (air > 0 && air < 1) { y += h * 4 * air * (1 - air); squash += 0.1 * Math.sin(Math.PI * air); }
    if (land > 0 && land < 1) squash -= 0.12 * Math.sin(Math.PI * land);
  }
  // Blinks: a deterministic schedule, plus one on every big moment.
  let blink = 0;
  for (let k = 0; k < 16; k++) {
    const tb = 1.3 + k * 2.5 + hash(k, who === 'dir' ? 3 : 9) * 1.4;
    blink = Math.max(blink, 1 - Math.min(1, Math.abs(t - tb) / 0.07));
  }
  // The beret (and the actor's flower) lag behind sudden moves.
  const acc = [(vx - (pa[0] - C.pos(t - 0.08)[0]) / 0.04) * 0.012, (vz - (pa[1] - C.pos(t - 0.08)[1]) / 0.04) * 0.012];
  const out = { x: p[0], z: p[1], y, yaw, lean, side, squash, arms, feet, eyes: C.eyes(t), mouth: C.mouth(t), blink, lag: acc.map((v) => clamp(v, -0.35, 0.35)), visible: C.visible(t), speed };
  CACHE.set(key, out);
  if (CACHE.size > 4000) CACHE.clear();
  return out;
}

// Times a foot lands, for the soundtrack.
export function footsteps(who) {
  const C = who === 'dir' ? D : A, out = [];
  let prev = 0;
  for (let t = 0; t < 40; t += 1 / 500) {
    const n = Math.floor(distance(C.pos, t) / STRIDE);
    if (n > prev) { if (C.visible(t)) out.push(t); prev = n; }
  }
  return out;
}
