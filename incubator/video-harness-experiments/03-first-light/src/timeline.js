// FIRST LIGHT — one clock for picture and sound. 24 fps like cinema, 96 BPM, 16 bars of 2.5 s.
export const W = 1920, H = 1080, FPS = 24, DURATION = 40;
export const BPM = 96, BEAT = 60 / BPM, BAR = BEAT * 4;

export const PAL = {
  clay: '#BDB8B0', clayBg: '#D8D3CB',
  cream: '#F3E9DA', tomato: '#E2533E', marigold: '#F0AE38', teal: '#2E8A83', sky: '#86B9DD',
  peach: '#F2A68A', plum: '#6A4F8E', navy: '#1C2541', sage: '#94BC93', leaf: '#5E9A5E', stone: '#E6D8C5',
  ink: '#1A1A22', warmLight: '#FFC88E', coolLight: '#9DBBFF',
};

export const COPY = {
  open: 'Every film starts grey.',
  light: 'Then someone moves the light.',
  mark: 'Someone stands on the mark.',
  look: 'Someone decides where to look.',
  title: 'First Light', sub: 'From blockout to film.', foot: 'EXPERIMENT 03  ·  RENDERED, NOT RECORDED',
};

// Positions on the diorama (metres; +z faces the audience).
export const SPOT = {
  dirStart: [-4.4, 2.0], dir: [-1.05, 1.45], light: [-1.85, 0.15], mark: [0.55, -0.35],
  actorHide: [-1.2, -1.85], actorPeek: [-0.98, -1.75], cam: [-0.15, 2.55],
};

// Key times (s).
export const T = {
  openText: [1.0, 4.4],
  walk: [5.0, 8.6], lookR: 8.95, hm: 9.15, lookL: 9.35, shrug: [9.5, 10.0],
  point: 10.2, pop: 10.5, on: 11.0, wave: [11.05, 13.6], joy: 12.95, lightText: [12.7, 14.85],
  conduct: [15.15, 19.4], fill: 15.625, rim: 16.25, windows: 16.875, lamp: 17.5, strings: [18.125, 18.75], dusk: [15.0, 19.0],
  peek1: 20.3, hide: 20.95, peek2: 21.45, oh: 21.55,
  beckon: 22.6, actorWalk: [22.85, 24.6], markText: [22.8, 24.85],
  finder: [25.05, 25.5], push: [26.0, 27.35], lookText: [25.3, 27.2], letterbox: [26.9, 27.5],
  slateOpen: 27.65, clap: 28.1, slateOut: [28.3, 28.65], twirl: [29.6, 30.6], pose: 31.0,
  run: [35.2, 36.15], highFive: 36.4,
  title: 37.75, sub: 38.35, foot: 38.85, fade: [39.25, 40.0],
};

// Cuts (shot boundaries). S10 and S11 share one camera; S12 flows into S13.
export const CUTS = [0, 5.0, 8.75, 10.0, 12.5, 15.0, 20.0, 22.5, 25.0, 27.5, 35.0];

// Sound events from the same times.
export function events() {
  const e = [], add = (t, type, o = {}) => e.push({ t, type, ...o });
  add(T.hm, 'voice', { who: 'dir', say: 'hm' });
  add(T.point - 0.12, 'whoosh', { dur: 0.25 });
  add(T.pop, 'pop', { size: 1 });
  add(T.on, 'switch'); add(T.on + 0.05, 'shimmer', { dur: 2.6 });
  add(T.joy - 0.05, 'voice', { who: 'dir', say: 'yay' });
  [T.fill, T.rim, T.windows, T.lamp].forEach((t, i) => add(t, 'lightOn', { i }));
  for (let i = 0; i < 9; i++) add(T.strings[0] + i * (T.strings[1] - T.strings[0]) / 9, 'bulb', { i });
  add(T.peek1, 'peek'); add(T.hide, 'peek', { back: true }); add(T.oh, 'voice', { who: 'actor', say: 'oh' });
  add(T.beckon, 'voice', { who: 'dir', say: 'come' });
  add(T.finder[0] + 0.1, 'whoosh', { dur: 0.3 });
  add(T.push[0], 'riser', { dur: T.push[1] - T.push[0] + 0.15 });
  add(T.clap, 'clap');
  add(T.slateOut[0], 'whoosh', { dur: 0.35 });
  add(T.twirl[0] + 0.1, 'voice', { who: 'actor', say: 'la' });
  add(T.highFive, 'highfive'); add(T.highFive + 0.02, 'voice', { who: 'dir', say: 'yay' });
  add(T.title, 'chime');
  return e.sort((a, b) => a.t - b.t);
}
