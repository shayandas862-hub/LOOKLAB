// One clock for picture and sound. Bars of 128 BPM carve the 15 seconds into four acts.
export const W = 1920, H = 1080, FPS = 60, DURATION = 15;
export const BPM = 128, BEAT = 60 / BPM, BAR = BEAT * 4;

export const C = {
  black: 0x070707, ink: '#0A0A0A', bone: '#F2EEE6', bone2: '#B9B4AA', bone3: '#77736C',
  signal: '#FF5A1F', signalHex: 0xff5a1f, blue: '#4D6BFF', blueHex: 0x4d6bff,
};
export const F = { display: '"Mona Sans"', mono: '"Martian Mono"' };

export const ACT = { brief: [0, 2 * BAR], engines: [2 * BAR, 4 * BAR], clock: [4 * BAR, 6 * BAR], film: [6 * BAR, DURATION] };

export const COPY = {
  brief: 'a 15-second film. make it move.',
  e1: 'ONE BRIEF.', e2: 'MANY ENGINES.',
  engines: [['01', 'CODE', 'LIVE'], ['02', 'IMAGE', 'NEXT'], ['03', 'VIDEO', 'NEXT']],
  c1: 'ONE CLOCK.', c2: 'EVERY FRAME ON THE BEAT.', cNote: 'this is the film’s own timeline',
  title: 'BRIEF → FILM', sub: 'Rendered, not recorded.', foot: 'EXPERIMENT 02  ·  BUILT IN PUBLIC, FOR THE PUBLIC',
};

// Key times (s).
export const T = {
  type0: 0.55, typeStep: 0.045,
  rush: [3.0, 3.75], tilesIn: [3.55, 3.95],
  words: [3.95, 5.0, 5.95], sweep: 6.75, wave: 0.38, flip: 0.24,
  whip: [6.95, 7.62],
  playLabels: 7.7, c1: 7.75, c2: 7.95,
  riser: [10.35, 11.05], gap: [11.05, ACT.film[0]],
  title: 11.3, sub: 12.35, foot: 13.0, fade: [14.35, 15.0],
};

// The film's own edit, drawn on the 3D timeline. [start, end, label]
export const TRACKS = [
  { name: 'PICTURE', clips: [[ACT.brief[0], ACT.brief[1], 'BRIEF'], [ACT.engines[0], ACT.engines[1], 'ENGINES'], [ACT.clock[0], ACT.clock[1], 'CLOCK'], [ACT.film[0], DURATION, 'FILM']] },
  { name: 'TYPE', clips: [[T.type0, 2.9, 'brief'], [T.words[0], 7.4, 'engines'], [T.c1, 10.9, 'clock'], [T.title, 14.9, 'title']] },
  { name: 'LIGHT', clips: [[0, 3.0, 'beam'], [T.words[0], T.words[0] + 0.6, 'code'], [T.sweep, 7.3, 'sweep'], [ACT.film[0], 13.2, 'ring']] },
  { name: 'SOUND', clips: [] },
];
export const TIMELINE_X0 = 14, METRES_PER_S = 1.6, TRACK_Z = -14;

// Sound events, all derived from the times above.
export function events() {
  const e = [], add = (t, type, o = {}) => e.push({ t, type, ...o });
  [...COPY.brief].forEach((ch, i) => { if (ch !== ' ') add(T.type0 + i * T.typeStep, 'key', { i }); });
  add(T.rush[0], 'whoosh', { dur: T.rush[1] - T.rush[0] + 0.1, pan: 0 });
  add(ACT.engines[0], 'impact', { size: 0.9 });
  T.words.forEach((w, i) => add(w, 'flaps', { lit: i === 0 }));
  add(T.sweep, 'flaps', { lit: true, big: true });
  add(T.whip[0], 'whoosh', { dur: T.whip[1] - T.whip[0], pan: 1 });
  add(ACT.clock[0], 'impact', { size: 0.7 });
  for (const tr of TRACKS.slice(1, 3)) for (const [a] of tr.clips) if (a >= ACT.clock[0] && a < ACT.film[0]) add(a, 'blip', { f: 1800 });
  add(T.riser[0], 'riser', { dur: T.riser[1] - T.riser[0] });
  add(ACT.film[0], 'braam');
  add(T.sub, 'blip', { f: 1320, gain: 0.7 });
  add(T.foot, 'blip', { f: 1980, gain: 0.5 });
  return e.sort((a, b) => a.t - b.t);
}
