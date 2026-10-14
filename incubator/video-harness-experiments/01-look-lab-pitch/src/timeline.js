// The single clock. The picture (browser) and the sound (Node) both read this file,
// so every hit, whoosh and blip lands on the frame that causes it.

export const W = 1920, H = 1080, FPS = 60, DURATION = 15;
export const BPM = 120, BEAT = 60 / BPM;

// Look Lab design-system tokens (design/Design System.dc.html) plus film colours.
export const C = {
  bg: '#0B0B0C', bg1: '#141516', bg2: '#1C1C1C', line: '#2A2A2A', line2: '#3A3A3A',
  tx: '#EDEDED', tx2: '#A6A6A6', tx3: '#808080',
  acc: '#22D3EE', warm: '#F5A524', red: '#F05252', paper: '#F2EFE8', ink: '#141414',
  key: '#FFB066', fill: '#7FD3E6', rim: '#D4E8FF', prac: '#FF9440',
};

export const F = { sans: 'Geist', mono: '"Geist Mono"', serif: '"Instrument Serif"' };

export const COPY = {
  hookA: 'The most expensive place', hookB: 'to work out a shot', hookC: 'is on set.',
  s1k: '01 — BREAKDOWN', s1a: 'Any reference,', s1b: 'broken down to numbers.',
  s2k: '02 — ADAPT & PLAN', s2a: 'Adapted to your location and kit.', s2b: 'Planned in 3D.',
  s3k: '03 — SET SHEET & GRADE',
  brand: 'LOOK LAB', tagA: 'Work the shot out', tagB: 'before the shoot.',
  flow: ['REFERENCE', 'BREAKDOWN', 'PLAN', 'SET SHEET', 'GRADE'],
};

// Key times in seconds.
export const T = {
  line: [0.0, 0.42], bars: [0.38, 0.85], hud: 0.55,
  hookA: 0.55, hookB: 1.05, wordStep: 0.075,
  riser1: [1.2, 2.0], slam: 2.0,
  whip: [2.7, 3.1],
  s1Copy: 3.15, scan: [3.2, 3.85], face: 3.55, swatches: 3.75, swatchStep: 0.09,
  key: 4.15, kelvin: 4.35, rows: 4.62, rowStep: 0.13,
  zoom: [5.7, 6.08],
  room: 6.05, lights: [6.35, 6.55, 6.75, 6.92], cam: 7.12, dims: 7.4,
  wipe: [8.75, 9.12],
  card: 9.0, panel: 9.15, sheetRows: 9.35, sheetRowStep: 0.12, cdl: 9.4, split: 9.9,
  chips: [10.1, 10.25], stamp: 10.45, gauge: [10.3, 11.0], match: 11.05,
  riser2: [11.0, 11.75], collapse: [11.55, 11.88],
  logo: 12.0, tag: 12.7, flow: 13.3, flowStep: 0.14, fade: [14.35, 15.0],
};

// Sound events, generated from the same times.
export function events() {
  const e = [];
  const add = (t, type, o = {}) => e.push({ t, type, ...o });
  for (let i = 0; i < 8; i++) add(i * 0.25, 'tick', { gain: 0.5 + 0.5 * (i % 2 ? 0 : 1) });
  add(T.hookA, 'click'); add(T.hookB, 'click');
  add(T.riser1[0], 'riser', { dur: T.riser1[1] - T.riser1[0] });
  add(T.slam, 'impact', { size: 1 });
  for (let i = 0; i < 6; i++) add(T.slam + 0.1 + i * 0.0625, 'tick', { gain: 0.6 - i * 0.08 });
  add(T.whip[0], 'whoosh', { dur: 0.45, pan: -1 });
  add(3.0, 'hit', { size: 0.5 });
  add(T.scan[0], 'scan', { dur: T.scan[1] - T.scan[0] });
  add(T.face, 'blip', { f: 1760 });
  for (let i = 0; i < 6; i++) add(T.swatches + i * T.swatchStep, 'blip', { f: 2000 + i * 180, gain: 0.55 });
  add(T.key, 'blip', { f: 1320 }); add(T.kelvin, 'blip', { f: 1480 });
  for (let i = 0; i < 5; i++) add(T.rows + i * T.rowStep, 'type');
  add(T.zoom[0], 'whoosh', { dur: 0.42, pan: 0, up: true });
  add(6.0, 'hit', { size: 0.6 });
  T.lights.forEach((t, i) => add(t, 'thump', { f: 70 - i * 6 }));
  add(T.cam, 'blip', { f: 1660 }); add(T.dims, 'blip', { f: 1980, gain: 0.5 });
  add(T.wipe[0], 'whoosh', { dur: 0.4, pan: 1 });
  add(9.0, 'hit', { size: 0.55 });
  for (let i = 0; i < 8; i++) add(T.sheetRows + i * T.sheetRowStep, 'type');
  for (let i = 0; i < 4; i++) add(T.cdl + 0.15 * i, 'blip', { f: 2600 + i * 120, gain: 0.35 });
  add(T.split, 'blip', { f: 1540 });
  T.chips.forEach((t) => add(t, 'blip', { f: 2240 }));
  add(T.stamp, 'stamp');
  for (let i = 0; i < 8; i++) add(T.gauge[0] + i * 0.0875, 'blip', { f: 900 + i * 140, gain: 0.3 });
  add(T.match, 'blip', { f: 2640, gain: 0.9 });
  add(T.riser2[0], 'riser', { dur: T.riser2[1] - T.riser2[0] });
  add(T.logo, 'impact', { size: 1.25 });
  add(T.tag, 'click');
  COPY.flow.forEach((_, i) => add(T.flow + i * T.flowStep, 'blip', { f: 1500 + i * 220, gain: 0.35 }));
  return e.sort((a, b) => a.t - b.t);
}
