// The ident's clock and its brand data. Everything else reads its times and colours from here.
export const W = 1920, H = 1080, FPS = 24, DURATION = 14;

// Colours sampled from the founder's logo (median of a patch inside each shape, 2026-10-14).
export const BRAND = {
  red: '#91201A', d: '#E0A045', green: '#B8D949', greenHi: '#E7F392', amberA: '#DD8832', amberB: '#DECC46',
  cyan: '#60CFEA', ink: '#1D1C18', white: '#F4F2EC',
};

// The logo's layout, measured in pixels on the 700 × 530 crop of the logo (y down), so the 3D logo matches the
// original. 100 px is one world unit; the logo is centred on the origin.
const C = { x: 352, y: 270 };
export const toWorld = (x, y) => [(x - C.x) / 100, (C.y - y) / 100];
// Each petal: its box, and which pair of opposite corners is sharp ('tlbr' = top-left and bottom-right).
export const PETALS = [
  { id: 'green', box: [57, 308, 198, 430], sharp: 'trbl', lock: 5.55 },
  { id: 'amber', box: [225, 309, 327, 398], sharp: 'tlbr', lock: 6.05 },
  { id: 'cyan', box: [176, 432, 271, 519], sharp: 'trbl', lock: 6.55 },
  { id: 'red', box: [16, 20, 299, 278], sharp: 'tlbr', lock: 7.2 },
];
// The hand-drawn D: the stem, then the bowl, as points along each stroke's centre line (crop pixels).
export const D_STROKES = [
  [[115, 83], [117.5, 90], [118.8, 152], [120.5, 210], [119.5, 224]],
  [[121, 85], [155, 85], [185, 88.8], [210, 101], [227.5, 122.5], [233.8, 150], [230, 175], [216, 196], [192.5, 211], [162.5, 217.5], [135, 220], [117, 223]],
];
export const D_RADIUS = 0.068;
// The words, placed by their measured x-height, left edge and baseline (crop pixels).
export const WORDS = [
  { text: 'as', left: 341, baseline: 222, xHeight: 100 },
  { text: 'production', left: 339, baseline: 287.5, xHeight: 37.5 },
];

export const CUE = {
  ember: 0.5, flight: 0.8, lockGreen: 5.55, lockAmber: 6.05, lockCyan: 6.55, lockRed: 7.2,
  dStem: [7.45, 7.85], dBowl: [7.85, 8.75], as: [8.75, 9.55], production: [9.3, 10.35], glint: [10.5, 11.6], fade: [13.1, 14.0],
};
