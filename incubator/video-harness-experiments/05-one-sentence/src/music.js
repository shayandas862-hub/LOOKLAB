// The track as data. Hard rock in A minor: a clean arpeggio intro, a pedal-point riff that follows the chords,
// a solo over the checker (with a wrong chord under the mistake that resolves when it's fixed), and a big return.
import { bar, STEP, BARS } from './timeline.js';
import { hash } from './util.js';

const X = 'x';
// Upper notes are semitones above A2 (A minor pentatonic: C D E G A); the muted chug follows the chord's root.
export const RIFF = {
  A: [X, X, 15, X, X, 17, X, 19, X, X, 15, X, 22, X, 19, 17],
  B: [X, X, 15, X, X, 17, X, 19, X, X, 24, X, 22, X, 19, 22],
};
// Pedal (palm-muted) note per chord, and power-chord voicings.
const PEDAL = { A: 45, F: 41, C: 48, G: 43, E: 40, Bb: 46 };
export const CHORD = { A: [45, 52, 57], F: [41, 48, 53], C: [48, 55, 60], G: [43, 50, 55], E: [40, 47, 52], Bb: [46, 53, 58] };
const ROOT = { A: 33, F: 29, C: 36, G: 31, E: 28, Bb: 34 };
const ARP = { A: [57, 64, 69, 71, 72, 71, 69, 64], F: [53, 60, 65, 67, 69, 67, 65, 60], C: [48, 55, 60, 62, 64, 62, 60, 55], G: [55, 62, 67, 69, 71, 69, 67, 62], E: [52, 59, 64, 66, 68, 66, 64, 59] };

const R = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);
const EIGHTHS = [0, 2, 4, 6, 8, 10, 12, 14], ALL = R(0, 16);
const PAT = {
  heart: { k: [0, 2] },
  heartHat: { k: [0, 2, 8], h: EIGHTHS },
  half: { k: [0, 3, 11], s: [8], h: EIGHTHS, oh: [14] },
  rock: { k: [0, 7, 8, 10], s: [4, 12], h: EIGHTHS },
  stomp: { k: [0, 4, 8, 12], s: [4, 12], clap: [4, 12], h: [0, 4, 8, 12], oh: [2, 6, 10, 14] },
  drive: { k: [0, 4, 8, 10, 12], s: [4, 12], h: ALL },
  stab: { k: [0, 4, 8, 12], s: [4, 8, 12] },
};

const seq = (s, a) => s.split(' ')[a];
function barPlan(n) {
  if (n < 6) return { chord: seq('A A F F C G', n), clean: 1, drums: n >= 2 ? (n >= 4 ? 'heartHat' : 'heart') : null };
  if (n < 12) { const c = seq('A F C G A F', n - 6); return { chord: c, clean: 0.6, gtr: 'half', bass: 'eighths', drums: 'half', crash: n % 2 === 0 ? [0] : [] }; }
  if (n === 12) return { chord: 'E', gtr: 'stabs', bass: 'stabs', drums: 'stab', crash: [0], fill: 'toms' };
  if (n === 13) return { chord: 'E', gtr: 'hold', bass: 'hold', fill: 'buildRoll', stopAt: 8 };
  if (n < 22) { const c = seq('A F C G A F G E', n - 14); return { chord: c, riff: n % 2 ? 'B' : 'A', gtr: 'chug8', bass: 'eighths', drums: 'rock', crash: [0] }; }
  if (n < 28) { const c = seq('F Bb G A F G', n - 22); return { chord: c, gtr: 'half', mute8: true, bass: 'hold', drums: 'half', crash: n === 22 || n === 25 ? [0] : [], solo: true }; }
  if (n < 34) { const c = seq('A F C G A E', n - 28); return { chord: c, riff: n % 2 ? 'B' : 'A', gtr: 'chug8', bass: 'eighths', drums: 'stomp', crash: n === 28 || n === 32 ? [0] : [], fill: n === 33 ? 'toms' : null }; }
  if (n < 36) return { chord: 'A', clean: 1, drums: 'heart', stopAt: n === 35 ? 8 : 16, fill: n === 35 ? 'pickup' : null };
  if (n < 44) { const c = seq('A F C G A F G G', n - 36); return { chord: c, riff: n % 2 ? 'B' : 'A', gtr: 'chug8', bass: 'eighths', drums: 'drive', crash: n % 2 === 0 ? [0] : [], fill: n === 43 ? 'toms' : null, lead: true }; }
  if (n === 44) return { chord: 'A', gtr: 'final', bass: 'final', crash: [0], kick: [0], anvil: [0] };
  return {};
}
export const PLAN = Array.from({ length: BARS }, (_, n) => barPlan(n));

const FILLS = {
  toms: [[8, 's', 1], [9, 't1', 0.9], [10, 't1', 0.9], [11, 't2', 0.95], [12, 't2', 0.95], [13, 't3', 1], [14, 't3', 1], [15, 'k', 1]],
  buildRoll: [...R(0, 4).map((i) => [i, 's', 0.55 + i * 0.05]), ...R(0, 8).map((i) => [4 + i * 0.5, 's', 0.75 + i * 0.03])],
  pickup: [[12, 's', 0.6], [13, 's', 0.7], [14, 's', 0.85], [15, 's', 1]],
};

export function drumHits() {
  const out = [];
  PLAN.forEach((p, n) => {
    const at = (step) => bar(n) + step * STEP, stop = p.stopAt ?? 16;
    const pat = p.drums ? PAT[p.drums] : {};
    for (const type of ['k', 's', 'h', 'oh', 'clap']) for (const st of pat[type] ?? []) {
      if (st >= stop || (p.fill === 'toms' && st >= 8 && type !== 'h') || (p.fill === 'pickup' && st >= 12)) continue;
      const accent = type === 'h' ? (st % 4 === 0 ? 1 : st % 2 === 0 ? 0.75 : 0.5) : 1;
      out.push({ t: at(st), type, vel: accent * (0.88 + 0.12 * hash(n * 16 + st, type.charCodeAt(0))) * (p.drums === 'heart' || p.drums === 'heartHat' ? 0.6 : 1) });
    }
    for (const st of p.kick ?? []) out.push({ t: at(st), type: 'k', vel: 1 });
    for (const st of p.crash ?? []) out.push({ t: at(st), type: 'crash', vel: 1 });
    for (const [st, type, vel] of FILLS[p.fill] ?? []) out.push({ t: at(st), type, vel });
  });
  return out.sort((a, b) => a.t - b.t);
}

export function guitarNotes() {
  const out = [];
  PLAN.forEach((p, n) => {
    const at = (st) => bar(n) + st * STEP, stop = p.stopAt ?? 16, ch = CHORD[p.chord];
    if (p.riff) RIFF[p.riff].forEach((v, st) => {
      if (st >= stop) return;
      const ped = PEDAL[p.chord];
      out.push(v === X ? { t: at(st), dur: STEP, notes: [ped], mute: true, vel: 0.85, part: 'riff' } : { t: at(st), dur: STEP * 2.2, notes: [45 + v], mute: false, vel: 1, part: 'riff' });
    });
    if (p.clean) ARP[p.chord].forEach((m, i) => { const st = i * 2; if (st < stop) out.push({ t: at(st), dur: STEP * 4, notes: [m], mute: false, vel: 0.7 * p.clean, part: 'clean' }); });
    const strum = (st, dur, mute = false, c = ch, vel = 1) => out.push({ t: at(st), dur, notes: mute ? c.slice(0, 2) : c, mute, vel, part: 'chords' });
    switch (p.gtr) {
      case 'chug8': strum(0, STEP * 3.5); [4, 6, 10, 12, 14].forEach((st) => strum(st, STEP * 1.2, true)); strum(8, STEP * 1.8, false, ch, 0.9); break;
      case 'half': strum(0, STEP * 8); strum(8, STEP * 8); break;
      case 'stabs': [0, 4, 8, 12].forEach((st) => strum(st, STEP * 2.5)); break;
      case 'hold': strum(0, 8 * STEP); break;
      case 'final': strum(0, 5.5); break;
    }
    if (p.mute8) EIGHTHS.forEach((st) => out.push({ t: at(st), dur: STEP, notes: [PEDAL[p.chord]], mute: true, vel: 0.55, part: 'riff' }));
  });
  return out.sort((a, b) => a.t - b.t);
}

export function bassNotes() {
  const out = [];
  PLAN.forEach((p, n) => {
    const at = (st) => bar(n) + st * STEP, r = ROOT[p.chord] ?? ROOT.A, stop = p.stopAt ?? 16;
    switch (p.bass) {
      case 'eighths': EIGHTHS.forEach((st) => st < stop && out.push({ t: at(st), dur: STEP * 1.8, m: r, vel: st % 4 ? 0.8 : 1 })); break;
      case 'hold': out.push({ t: at(0), dur: Math.min(stop, 16) * STEP, m: r, vel: 1 }); break;
      case 'stabs': [0, 4, 8, 12].forEach((st) => out.push({ t: at(st), dur: STEP * 2.5, m: r, vel: 1 })); break;
      case 'final': out.push({ t: at(0), dur: 5.5, m: r, vel: 1 }); break;
    }
  });
  return out;
}

// Solo over the checker, then the anthem over the world: [bar, beat, beats, midi].
export const LEAD = [
  [22, 0, 1, 72], [22, 1, 0.5, 74], [22, 1.5, 0.5, 76], [22, 2, 2, 77],
  [23, 0, 1.5, 77], [23, 1.5, 0.5, 76], [23, 2, 2, 74],
  [24, 0, 1, 74], [24, 1, 1, 71], [24, 2, 1, 74], [24, 3, 1, 79],
  [25, 0, 3, 81], [25, 3, 1, 79],
  [26, 0, 0.5, 77], [26, 0.5, 0.5, 76], [26, 1, 0.5, 74], [26, 1.5, 0.5, 72], [26, 2, 2, 76],
  [27, 0, 1, 74], [27, 1, 1, 71], [27, 2, 2, 79],
  [36, 0, 1, 69], [36, 1, 1, 72], [36, 2, 2, 76], [37, 0, 1, 77], [37, 1, 1, 76], [37, 2, 2, 72],
  [38, 0, 1, 72], [38, 1, 1, 76], [38, 2, 2, 79], [39, 0, 1, 79], [39, 1, 0.5, 77], [39, 1.5, 0.5, 76], [39, 2, 2, 74],
  [40, 0, 1, 81], [40, 1, 1, 84], [40, 2, 2, 88], [41, 0, 1, 89], [41, 1, 1, 88], [41, 2, 2, 84],
  [42, 0, 1, 86], [42, 1, 1, 84], [42, 2, 2, 83], [43, 0, 2, 83], [43, 2, 2, 86],
  [44, 0, 10, 81],
];
// A diatonic third below in A minor, for the harmony in the second half of the world.
const SCALE = [0, 2, 3, 5, 7, 8, 10];
export function thirdBelow(m) {
  const pc = ((m - 9) % 12 + 12) % 12, oct = Math.floor((m - 9) / 12), i = SCALE.indexOf(pc);
  if (i < 0) return m - 3;
  const j = i - 2; return 9 + (oct + Math.floor(j / 7)) * 12 + SCALE[((j % 7) + 7) % 7];
}
export const HARMONY = LEAD.filter(([b]) => b >= 40 && b < 44).map(([b, be, l, m]) => [b, be, l, thirdBelow(m)]);

export const ANVILS = PLAN.flatMap((p, n) => (p.anvil ?? []).map((st) => bar(n) + st * STEP));

export function accents() {
  const d = drumHits();
  return { kicks: d.filter((h) => h.type === 'k').map((h) => h.t), snares: d.filter((h) => h.type === 's' && h.vel > 0.7).map((h) => h.t), crashes: d.filter((h) => h.type === 'crash').map((h) => h.t), anvils: ANVILS };
}
