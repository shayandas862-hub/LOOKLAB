// Pencil sketches for the four storyboard cards: polylines in card space (0..1, y down), drawn in order.
const circle = (cx, cy, r, n = 36) => Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((i / n) * Math.PI * 2), cy + r * 0.56 * 1.78 * Math.sin((i / n) * Math.PI * 2) / 1.78]);
const curve = (f, x0, x1, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const x = x0 + ((x1 - x0) * i) / n; return [x, f(x)]; });

export const SKETCHES = [
  [ // S1 dune at dawn: two dune lines, a low sun with rays, the shoe on the crest
    curve((x) => 0.6 + 0.05 * Math.sin(x * 6.5) - 0.04 * Math.exp(-((x - 0.62) ** 2) / 0.01), 0.04, 0.96),
    curve((x) => 0.76 + 0.04 * Math.sin(x * 9 + 1), 0.04, 0.96),
    circle(0.24, 0.44, 0.06),
    [[0.24, 0.3], [0.24, 0.35]], [[0.12, 0.44], [0.16, 0.44]], [[0.33, 0.33], [0.3, 0.37]],
    [[0.55, 0.565], [0.69, 0.565], [0.705, 0.55], [0.66, 0.53], [0.63, 0.505], [0.59, 0.51], [0.565, 0.535], [0.55, 0.565]],
  ],
  [ // S2 stride: two legs mid-stride in shoes, ground, speed lines
    [[0.02, 0.8], [0.98, 0.8]],
    [[0.47, 0.18], [0.55, 0.47], [0.48, 0.72], [0.6, 0.76], [0.6, 0.79], [0.46, 0.79], [0.46, 0.73]],
    [[0.47, 0.18], [0.38, 0.45], [0.27, 0.6], [0.33, 0.65], [0.31, 0.68], [0.22, 0.62], [0.25, 0.59]],
    [[0.06, 0.35], [0.24, 0.35]], [[0.03, 0.47], [0.2, 0.47]], [[0.08, 0.59], [0.18, 0.59]],
  ],
  [ // S3 the shoe: side view with sole, midsole, upper, laces and a stripe
    [[0.14, 0.72], [0.86, 0.72], [0.88, 0.69], [0.86, 0.64], [0.13, 0.64], [0.12, 0.69], [0.14, 0.72]],
    [[0.14, 0.64], [0.16, 0.42], [0.28, 0.34], [0.4, 0.37], [0.54, 0.45], [0.7, 0.5], [0.83, 0.56], [0.87, 0.64]],
    [[0.42, 0.41], [0.47, 0.37]], [[0.47, 0.44], [0.52, 0.4]], [[0.52, 0.46], [0.57, 0.42]], [[0.57, 0.48], [0.62, 0.45]],
    [[0.24, 0.6], [0.42, 0.5], [0.5, 0.56], [0.74, 0.58]],
  ],
  [ // S4 city at night: skyline, the street running away, a runner
    [[0.02, 0.52], [0.1, 0.52], [0.1, 0.22], [0.2, 0.22], [0.2, 0.4], [0.27, 0.4], [0.27, 0.12], [0.36, 0.12], [0.36, 0.5]],
    [[0.64, 0.5], [0.64, 0.18], [0.74, 0.18], [0.74, 0.32], [0.82, 0.32], [0.82, 0.08], [0.9, 0.08], [0.9, 0.52], [0.98, 0.52]],
    [[0.0, 0.95], [0.48, 0.55]], [[1.0, 0.95], [0.52, 0.55]], [[0.5, 0.95], [0.5, 0.6]],
    [[0.5, 0.58], [0.5, 0.7], [0.46, 0.8]], [[0.5, 0.7], [0.55, 0.79]], [[0.5, 0.62], [0.45, 0.68]], [[0.5, 0.62], [0.56, 0.65]], circle(0.5, 0.555, 0.014, 16),
  ],
];

// Total length of a sketch's polylines, and a drawer that strokes the first `p` (0..1) of it, returning the tip.
export function drawSketch(g, lines, p, w, h) {
  const seg = lines.map((l) => l.reduce((s, pt, i) => (i ? s + Math.hypot((pt[0] - l[i - 1][0]) * w, (pt[1] - l[i - 1][1]) * h) : 0), 0));
  let left = p * seg.reduce((a, b) => a + b, 0), tip = null;
  for (let k = 0; k < lines.length && left > 0; k++) {
    const l = lines[k]; g.beginPath(); g.moveTo(l[0][0] * w, l[0][1] * h);
    for (let i = 1; i < l.length && left > 0; i++) {
      const [x0, y0] = [l[i - 1][0] * w, l[i - 1][1] * h], [x1, y1] = [l[i][0] * w, l[i][1] * h], d = Math.hypot(x1 - x0, y1 - y0);
      const f = Math.min(1, left / d); const x = x0 + (x1 - x0) * f, y = y0 + (y1 - y0) * f; g.lineTo(x, y); tip = [x, y]; left -= d;
    }
    g.stroke();
  }
  return tip;
}
