// The track as data: what every instrument plays in every bar. The score synthesises it; the picture reads the
// same hits so flashes, shakes and cuts land exactly on them. Our own riff in E, a pedal-point figure.
import { bar, STEP, BARS } from './timeline.js';
import { hash } from './util.js';

const X = 'x'; // palm-muted low E
export const RIFF = {
  A: [X, X, 55, X, X, 57, X, 59, X, X, 55, X, 62, X, 59, 57],
  B: [X, X, 55, X, X, 57, X, 59, X, X, 64, X, 62, X, 59, 62],
};
export const CHORD = { E: [40, 47, 52], C: [48, 55, 60], D: [50, 57, 62], G: [43, 50, 55], A: [45, 52, 57] };
const ROOT = { E: 28, C: 36, D: 38, G: 31, A: 33 };

const R = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);
const EIGHTHS = [0, 2, 4, 6, 8, 10, 12, 14], ALL = R(0, 16);
const PAT = {
  pulse: { k: [0, 4, 8, 12] },
  pulseHat: { k: [0, 4, 8, 12], h: EIGHTHS },
  rock: { k: [0, 7, 8, 10], s: [4, 12], h: EIGHTHS },
  half: { k: [0, 3, 11], s: [8], h: EIGHTHS, oh: [14] },
  stomp: { k: [0, 4, 8, 12], s: [4, 12], clap: [4, 12], h: [0, 4, 8, 12], oh: [2, 6, 10, 14] },
  drive: { k: [0, 4, 8, 10, 12], s: [4, 12], h: ALL },
  heart: { k: [0, 2, 8, 10] },
  stab: { k: [0, 4, 8, 12], s: [4, 8, 12] },
};

// Per bar: riff variant, guitar parts, chord, bass style, drum pattern, fills, crashes.
function barPlan(n) {
  const v = n % 2 ? 'B' : 'A';
  if (n < 6) return { riff: v, intro: true, anvil: n % 2 === 0 ? [0] : [] };
  if (n < 10) return { riff: v, double: true, chord: 'E', bass: 'eighths', drums: 'pulse', crash: n % 2 === 0 ? [0] : [] };
  if (n < 12) return { riff: v, double: true, chord: 'E', bass: 'eighths', drums: 'pulseHat', crash: n % 2 === 0 ? [0] : [], gtr: 'hits' };
  if (n === 12) return { riff: v, double: true, chord: 'E', bass: 'eighths', drums: 'pulseHat', crash: [0], fill: 'toms', gtr: 'hits' };
  if (n === 13) return { riff: v, double: true, chord: 'E', bass: 'eighths', fill: 'buildRoll', stopAt: 8 };
  if (n < 22) { const c = 'EECD'[(n - 14) % 4]; return { riff: v, chord: c, gtr: 'chug8', bass: 'eighths', drums: 'rock', crash: [0], fill: n === 21 ? 'toms' : null }; }
  if (n === 22) return { riff: v, chord: 'E', gtr: 'chug8', bass: 'eighths', drums: 'rock', crash: [0] };
  if (n === 23) return { chord: 'E', gtr: 'hold', bass: 'hold', fill: 'snareRoll' };
  if (n === 24) return { chord: 'E', gtr: 'stabs', stabs: ['E', 'G', 'A', 'C'], bass: 'stabs', drums: 'stab', crash: [0, 4, 8, 12] };
  if (n < 28) { const c = 'CDE'[n - 25]; return { chord: c, gtr: 'half', mute8: true, bass: 'hold', drums: 'half', crash: [0] }; }
  if (n < 31) { const c = 'EED'[n - 28]; return { riff: v, chord: c, gtr: 'chug8', bass: 'eighths', drums: 'stomp', crash: n === 28 ? [0] : [], fill: n === 30 ? 'toms' : null }; }
  if (n === 31) return { riff: v, chord: 'E', gtr: 'chug8', bass: 'eighths', drums: 'rock', crash: [0], fill: 'toms' };
  if (n < 36) return { riff: 'A', muffled: true, bass: 'sub', drums: 'heart', stopAt: n === 35 ? 8 : 16, fill: n === 35 ? 'pickup' : null };
  if (n < 44) { const c = 'EECD'[(n - 36) % 4]; return { riff: v, chord: c, gtr: 'chug8', bass: 'eighths', drums: 'drive', crash: n % 2 === 0 ? [0] : [], fill: n === 43 ? 'toms' : null, lead: true }; }
  if (n === 44) return { chord: 'E', gtr: 'final', bass: 'final', drums: null, crash: [0], kick: [0], anvil: [0] };
  return {};
}
export const PLAN = Array.from({ length: BARS }, (_, n) => barPlan(n));

const FILLS = {
  toms: [[8, 's', 1], [9, 't1', 0.9], [10, 't1', 0.9], [11, 't2', 0.95], [12, 't2', 0.95], [13, 't3', 1], [14, 't3', 1], [15, 'k', 1]],
  buildRoll: [...R(0, 4).map((i) => [i, 's', 0.55 + i * 0.05]), ...R(0, 8).map((i) => [4 + i * 0.5, 's', 0.75 + i * 0.03])],
  snareRoll: [...R(0, 12).map((i) => [i, 's', 0.35 + i * 0.04]), ...R(0, 8).map((i) => [12 + i * 0.5, 's', 0.85 + i * 0.02])],
  pickup: [[12, 's', 0.6], [13, 's', 0.7], [14, 's', 0.85], [15, 's', 1]],
};

// Every drum hit: { t, type, vel }. Types: k s h oh clap crash t1 t2 t3.
export function drumHits() {
  const out = [];
  PLAN.forEach((p, n) => {
    const at = (step) => bar(n) + step * STEP, stop = p.stopAt ?? 16;
    const pat = p.drums ? PAT[p.drums] : {};
    for (const type of ['k', 's', 'h', 'oh', 'clap']) for (const st of pat[type] ?? []) {
      if (st >= stop || (p.fill === 'toms' && st >= 8 && type !== 'h') || (p.fill === 'pickup' && st >= 12)) continue;
      const accent = type === 'h' ? (st % 4 === 0 ? 1 : st % 2 === 0 ? 0.75 : 0.5) : 1;
      out.push({ t: at(st), type, vel: accent * (0.88 + 0.12 * hash(n * 16 + st, type.charCodeAt(0))) });
    }
    for (const st of p.kick ?? []) out.push({ t: at(st), type: 'k', vel: 1 });
    for (const st of p.crash ?? []) out.push({ t: at(st), type: 'crash', vel: 1 });
    for (const [st, type, vel] of FILLS[p.fill] ?? []) out.push({ t: at(st), type, vel });
  });
  return out.sort((a, b) => a.t - b.t);
}

// Guitar and bass notes: { t, dur, notes, mute, vel, part }.
export function guitarNotes() {
  const out = [];
  PLAN.forEach((p, n) => {
    const at = (st) => bar(n) + st * STEP, stop = p.stopAt ?? 16;
    if (p.riff) RIFF[p.riff].forEach((v, st) => {
      if (st >= stop) return;
      out.push(v === X ? { t: at(st), dur: STEP, notes: [40], mute: true, vel: 0.85, part: 'riff' }
        : { t: at(st), dur: STEP * 2.2, notes: [v], mute: false, vel: 1, part: 'riff' });
    });
    const ch = CHORD[p.chord];
    const strum = (st, dur, mute = false, c = ch, vel = 1) => out.push({ t: at(st), dur, notes: mute ? c.slice(0, 2) : c, mute, vel, part: 'chords' });
    switch (p.gtr) {
      case 'chug8': strum(0, STEP * 3.5); [4, 6, 10, 12, 14].forEach((st) => strum(st, STEP * 1.2, true)); strum(8, STEP * 1.8, false, ch, 0.9); break;
      case 'hits': strum(0, STEP * 6); break;
      case 'hold': strum(0, 16 * STEP + 0.3); break;
      case 'stabs': p.stabs.forEach((c, i) => strum(i * 4, STEP * 2.5, false, CHORD[c])); break;
      case 'half': strum(0, STEP * 8); strum(8, STEP * 8); break;
      case 'final': strum(0, 5.5); break;
    }
    if (p.mute8) EIGHTHS.forEach((st) => out.push({ t: at(st), dur: STEP, notes: [ROOT[p.chord] + 12], mute: true, vel: 0.55, part: 'riff' }));
  });
  return out.sort((a, b) => a.t - b.t);
}

export function bassNotes() {
  const out = [];
  PLAN.forEach((p, n) => {
    const at = (st) => bar(n) + st * STEP, r = ROOT[p.chord] ?? ROOT.E, stop = p.stopAt ?? 16;
    switch (p.bass) {
      case 'eighths': EIGHTHS.forEach((st) => st < stop && out.push({ t: at(st), dur: STEP * 1.8, m: r, vel: st % 4 ? 0.8 : 1 })); break;
      case 'hold': out.push({ t: at(0), dur: 16 * STEP, m: r, vel: 1 }); break;
      case 'stabs': p.stabs.forEach((c, i) => out.push({ t: at(i * 4), dur: STEP * 2.5, m: ROOT[c], vel: 1 })); break;
      case 'sub': out.push({ t: at(0), dur: Math.min(stop, 16) * STEP, m: ROOT.E, vel: 0.8, sub: true }); break;
      case 'final': out.push({ t: at(0), dur: 5.5, m: ROOT.E, vel: 1 }); break;
    }
  });
  return out;
}

// The lead line over STEP INSIDE: [bar, beat, beats, midi].
export const LEAD = [
  [36, 0, 1, 71], [36, 1, 0.5, 74], [36, 1.5, 2.5, 76],
  [37, 0, 1, 79], [37, 1, 0.5, 78], [37, 1.5, 0.5, 76], [37, 2, 1, 74], [37, 3, 1, 71],
  [38, 0, 1.5, 72], [38, 1.5, 0.5, 76], [38, 2, 2, 79],
  [39, 0, 1, 78], [39, 1, 1, 76], [39, 2, 2, 74],
  [40, 0, 1, 76], [40, 1, 0.5, 79], [40, 1.5, 2.5, 83],
  [41, 0, 1, 84], [41, 1, 0.5, 83], [41, 1.5, 0.5, 81], [41, 2, 1, 79], [41, 3, 1, 76],
  [42, 0, 1.5, 79], [42, 1.5, 0.5, 81], [42, 2, 2, 84],
  [43, 0, 1, 83], [43, 1, 1, 81], [43, 2, 2, 83],
  [44, 0, 10, 88],
];

export const ANVILS = PLAN.flatMap((p, n) => (p.anvil ?? []).map((st) => bar(n) + st * STEP));

// For the picture: the hits worth reacting to.
export function accents() {
  const d = drumHits();
  return {
    kicks: d.filter((h) => h.type === 'k').map((h) => h.t),
    snares: d.filter((h) => h.type === 's' && h.vel > 0.7).map((h) => h.t),
    crashes: d.filter((h) => h.type === 'crash').map((h) => h.t),
    anvils: ANVILS,
  };
}
