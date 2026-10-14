// ONE SENTENCE — one clock for picture and sound. 120 BPM at 24 fps: one beat is 12 frames, one bar 2 s.
export const W = 1920, H = 1080, FPS = 24;
export const BPM = 120, BEAT = 60 / BPM, BAR = BEAT * 4, STEP = BEAT / 4, BARS = 46, DURATION = BARS * BAR;
export const bar = (n, beat = 0) => n * BAR + beat * BEAT;

export const SEC = {
  brief: [0, 6], plan: [6, 12], route: [12, 14], make: [14, 22], check: [22, 28], cut: [28, 34], breath: [34, 36], world: [36, 44], end: [44, 46],
};
export const sectionAt = (t) => Object.keys(SEC).find((k) => t >= bar(SEC[k][0]) && t < bar(SEC[k][1])) ?? 'end';

export const BRAND = '#FF6A1A';
export const COPY = {
  brief: 'a launch film for a running shoe. warm. premium.',
  gates: ['CODE', '3D', 'AI', 'CAMERA'],
  title: 'ONE SENTENCE.', line: 'One sentence in. A world out.', note: 'every number on screen was measured', foot: 'BUILT IN PUBLIC  ·  FOLLOW THE BUILD',
};

// The four shots the brief becomes. Lens is the focal length the shot camera really uses (full-frame, 24 mm tall).
export const SHOTS = [
  { id: 'S1', name: 'DUNE · DAWN', lane: '3D', lens: 35, frames: 48 },
  { id: 'S2', name: 'STRIDE', lane: 'AI', lens: 85, frames: 48 },
  { id: 'S3', name: 'THE SHOE', lane: 'CODE', lens: 50, frames: 48 },
  { id: 'S4', name: 'CITY · NIGHT', lane: 'CAMERA', lens: 24, frames: 48 },
];
export const fovOf = (mm) => (2 * Math.atan(12 / mm) * 180) / Math.PI;
export const mmOf = (fov) => 12 / Math.tan((fov * Math.PI) / 360);

export const CUE = {
  typeStart: bar(0, 2), typeStep: STEP, dot: [bar(4), bar(6)],
  cards: [bar(6), bar(6, 2), bar(7), bar(7, 2)], unfold: [bar(8), bar(8, 2), bar(9), bar(9, 2)], glow: bar(10), lineUp: bar(11),
  fly: bar(12), rush: [bar(13), bar(13, 2)], go: bar(13, 2), drop: bar(14),
  sets: [bar(14), bar(16), bar(18), bar(20)],
  check: bar(22), fail: bar(23), fix: bar(24), pass: bar(25), allPass: bar(26),
  toTimeline: bar(28), play: bar(30), frames: bar(32), breath: bar(34), go2: bar(35, 2),
  world: bar(36), title: bar(40), crane: bar(42), finalHit: bar(44), card: bar(44, 1),
};

export const SHOUTS = [
  ...[bar(6), bar(8), bar(10), CUE.title].map((t) => ({ t, word: 'hey' })),
  { t: CUE.go + 0.04, word: 'go' }, { t: CUE.go2 + 0.04, word: 'go' },
];
export const SILENCE = [[CUE.go, CUE.drop - 0.02], [CUE.go2, CUE.go2 + 0.5]];

// Sound effects tied to the picture.
export function events() {
  const e = [], add = (t, type, o = {}) => e.push({ t, type, ...o });
  [...COPY.brief].forEach((ch, i) => add(CUE.typeStart + i * CUE.typeStep, 'key', { space: ch === ' ', i }));
  add(CUE.dot[0], 'riser', { dur: CUE.dot[1] - CUE.dot[0] });
  CUE.cards.forEach((t, i) => { add(t, 'whoosh', { dur: 0.35 }); add(t + 0.1, 'pencil', { dur: 1.4 }); });
  CUE.unfold.forEach((t, i) => add(t, 'clank', { i }));
  add(CUE.glow, 'shimmer', { dur: 1.6 });
  add(CUE.fly, 'whoosh', { dur: 0.8 }); [0, 1, 2, 3].forEach((i) => add(CUE.fly + 0.6 + i * 0.25, 'thoom', { i }));
  add(CUE.rush[0], 'riser', { dur: CUE.go - CUE.rush[0] });
  add(CUE.drop, 'sub', { f: 58, big: true });
  CUE.sets.forEach((t, i) => { if (i) add(t - 0.12, 'whoosh', { dur: 0.3 }); add(t + 0.02, 'sting', { i: [1, 2, 6, 0][i] }); add(t + 2, 'zip'); });
  add(CUE.check, 'whoosh', { dur: 0.6 });
  add(CUE.fail, 'alarm'); add(CUE.fix, 'rewind', { dur: 1.2 }); add(CUE.pass, 'tick');
  [0, 0.5, 1, 1.5].forEach((d) => add(CUE.allPass + d, 'tick', { quiet: true }));
  add(CUE.toTimeline, 'spread', { dur: 1.6 }); add(CUE.frames, 'shimmer', { dur: 1.8 });
  add(CUE.world - 0.2, 'portal', { dur: 1.2 }); add(CUE.world, 'sub', { f: 55, big: true });
  add(CUE.crane, 'riser', { dur: 3.9 }); add(CUE.finalHit, 'sub', { f: 50, big: true }); add(CUE.card, 'chime');
  return e.sort((a, b) => a.t - b.t);
}
