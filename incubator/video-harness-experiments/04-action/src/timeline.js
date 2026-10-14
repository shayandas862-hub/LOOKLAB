// ACTION — one clock for picture and sound. 120 BPM at 24 fps: one beat is exactly 12 frames, one bar 2 s.
export const W = 1920, H = 1080, FPS = 24;
export const BPM = 120, BEAT = 60 / BPM, BAR = BEAT * 4, STEP = BEAT / 4, BARS = 46, DURATION = BARS * BAR;
export const bar = (n, beat = 0) => n * BAR + beat * BEAT;

// Sections, in bars [first, end).
export const SEC = {
  spark: [0, 6], assemble: [6, 14], films: [14, 22], sneaker: [22, 25], perfume: [25, 28], fashion: [28, 31],
  tag: [31, 32], catch: [32, 36], inside: [36, 44], end: [44, 46],
};
export const sectionAt = (t) => Object.keys(SEC).find((k) => t >= bar(SEC[k][0]) && t < bar(SEC[k][1])) ?? 'end';

export const PAL = {
  black: '#050506', steel: '#2A2D33', chrome: '#C9CED6', ceramic: '#ECEAE6', spark: '#FF6A1A', ember: '#FF9A3D',
  white: '#FFFFFF', red: '#FF2E2E',
};

export const COPY = {
  type: 'imagine anything', words: ['WORLD', 'CAMERA', 'LIGHT'], action: 'ACTION', catch: 'too fast',
  inside: 'then step inside.', foot: 'BUILT IN PUBLIC  ·  FOLLOW THE BUILD',
};

// Key moments (s). Picture and foley both read these.
export const CUE = {
  typeStart: bar(1), typeStep: BEAT / 2, crack: bar(3), land: bar(4), pencil: [bar(4, 2), bar(5, 3.5)],
  world: bar(6), camera: bar(8), light: bar(10), inflate: bar(12), firstStep: bar(12, 2),
  roll: [bar(13), bar(13, 2)], action: bar(13, 2), drop: bar(14),
  worlds: Array.from({ length: 8 }, (_, i) => bar(14 + i)),
  sneakerIn: bar(22), freeze: bar(22, 3), explode: bar(23), slam: bar(24), colourways: [bar(24, 1), bar(24, 2), bar(24, 3)],
  dropFall: bar(25), dropLand: bar(25, 2), sweep: bar(26), cap: bar(27), spray: bar(27, 2),
  silk: bar(28), swatches: Array.from({ length: 8 }, (_, i) => bar(29, i)),
  orbit: bar(31), fill: bar(31, 2),
  whip: bar(32, 1), freezeCatch: bar(32, 2), rewind: [bar(33), bar(33, 2)], rebuild: bar(33, 3), tick: bar(34), turn: bar(34, 2), action2: bar(35, 2),
  pullBack: bar(36), portal: bar(37), stepThrough: bar(38), inside: bar(40), crane: bar(42), finalHit: bar(44), card: bar(44, 1),
};

// Gang shouts.
export const SHOUTS = [
  ...[CUE.world, CUE.camera, CUE.light, CUE.inflate, CUE.inside].map((t) => ({ t, word: 'hey' })),
  { t: CUE.action + 0.04, word: 'action' }, { t: CUE.action2 + 0.04, word: 'action' },
];

// Windows where the band stops dead so a shout stands alone.
export const SILENCE = [[CUE.action, CUE.drop - 0.02], [CUE.action2, CUE.action2 + 0.5]];

// Sound effects tied to the picture.
export function events() {
  const e = [], add = (t, type, o = {}) => e.push({ t, type, ...o });
  [...COPY.type].forEach((ch, i) => add(CUE.typeStart + i * CUE.typeStep, 'key', { space: ch === ' ', i }));
  add(CUE.crack, 'shatter'); add(CUE.crack + 0.02, 'sub', { f: 70 });
  for (let i = 0; i < 14; i++) add(CUE.land - 0.6 + i * 0.09 + (i % 3) * 0.013, 'tink', { i });
  add(CUE.pencil[0], 'pencil', { dur: CUE.pencil[1] - CUE.pencil[0] });
  add(CUE.world - 1.5, 'reverse', { dur: 1.5 });
  for (let i = 0; i < 8; i++) add(CUE.world + 0.25 + i * BEAT / 2, 'thoom', { i });
  add(bar(7), 'whoosh', { dur: 0.4 });
  [0.25, 0.5, 0.75, 1.0, 1.25, 1.5].forEach((d, i) => add(CUE.camera + d, 'clank', { i }));
  add(CUE.camera + 2.0, 'servo', { dur: 1.2 });
  add(bar(9), 'whoosh', { dur: 0.4 });
  add(CUE.light, 'switch');
  add(bar(11), 'whoosh', { dur: 0.4 });
  add(CUE.inflate, 'inflate'); add(CUE.firstStep, 'stomp');
  add(CUE.roll[0], 'riser', { dur: CUE.action - CUE.roll[0] });
  add(CUE.drop, 'sub', { f: 62, big: true });
  CUE.worlds.forEach((t, i) => add(t, 'sting', { i }));
  add(CUE.sneakerIn - 0.3, 'whoosh', { dur: 0.5 }); add(CUE.freeze, 'freeze');
  add(CUE.explode, 'spread', { dur: 1.6 }); add(CUE.slam, 'sub', { f: 58, big: true }); add(CUE.slam, 'clank', { i: 9 });
  CUE.colourways.forEach((t, i) => add(t, 'blip', { i }));
  add(CUE.dropFall, 'fall', { dur: CUE.dropLand - CUE.dropFall }); add(CUE.dropLand, 'plip'); add(CUE.dropLand, 'sub', { f: 48 });
  add(CUE.sweep, 'shimmer', { dur: 1.8 }); add(CUE.cap, 'cap'); add(CUE.spray, 'spray');
  add(CUE.silk - 0.1, 'silk');
  for (let i = 0; i < 22; i++) add(CUE.silk + 0.5 + i * 0.25 + ((i * 7) % 3) * 0.04, 'flash', { i });
  CUE.swatches.forEach((t, i) => add(t + 0.06, 'tick', { quiet: true, i }));
  add(CUE.orbit, 'whoosh', { dur: 0.8 });
  add(CUE.whip, 'whoosh', { dur: 0.25 }); add(CUE.freezeCatch, 'alarm');
  add(CUE.rewind[0], 'rewind', { dur: CUE.rewind[1] - CUE.rewind[0] }); add(CUE.rebuild, 'zip'); add(CUE.tick, 'tick');
  add(CUE.pullBack, 'whoosh', { dur: 0.6 }); add(CUE.portal, 'portal', { dur: 2 }); add(CUE.stepThrough, 'sub', { f: 55, big: true });
  add(CUE.stepThrough, 'shimmer', { dur: 2.2 }); add(CUE.crane, 'riser', { dur: 3.9 });
  add(CUE.finalHit, 'sub', { f: 50, big: true }); add(CUE.card, 'chime');
  return e.sort((a, b) => a.t - b.t);
}
