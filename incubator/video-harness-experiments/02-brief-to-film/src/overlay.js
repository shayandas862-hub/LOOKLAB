// The typography layer: Mona Sans (expanded) for statements, Martian Mono for the machine.
import { W, H, FPS, DURATION, C, F, T, ACT, COPY } from './timeline.js';
import { ease, prog, lerp, hash } from './util.js';

const disp = (w, px) => `${w} ${px}px ${F.display}`;
const mono = (w, px) => `${w} ${px}px ${F.mono}`;

function text(g, s, x, y, font, color, { a = 1, stretch = 'expanded', spacing = 0, align = 'left' } = {}) {
  if (a <= 0) return 0;
  g.save(); g.globalAlpha *= a; g.font = font; g.fontStretch = stretch; g.letterSpacing = `${spacing}px`;
  g.textAlign = align; g.fillStyle = color; g.fillText(s, x, y);
  const w = g.measureText(s).width; g.restore(); return w;
}

// Words rise out of a mask and leave the same way.
function rise(g, s, x, y, font, color, t, tIn, tOut, { step = 0.07, stretch = 'expanded', align = 'left' } = {}) {
  g.save(); g.font = font; g.fontStretch = stretch;
  const words = s.split(' '), sp = g.measureText(' ').width, ws = words.map((w) => g.measureText(w).width);
  const total = ws.reduce((a, b) => a + b, 0) + sp * (words.length - 1);
  const m = g.measureText('M'), asc = m.fontBoundingBoxAscent, hgt = asc + m.fontBoundingBoxDescent;
  let cx = align === 'center' ? x - total / 2 : x;
  words.forEach((w, i) => {
    const pin = ease.outExpo(prog(t, tIn + i * step, tIn + i * step + 0.7));
    const pout = ease.inCubic(prog(t, tOut + i * step * 0.5, tOut + i * step * 0.5 + 0.35));
    if (pin > 0 && pout < 1) {
      g.save(); g.beginPath(); g.rect(cx - 6, y - asc * 1.05, ws[i] + 12, hgt * 1.1); g.clip();
      g.fillStyle = color; g.fillText(w, cx, y + (1 - pin) * hgt - pout * hgt);
      g.restore();
    }
    cx += ws[i] + sp;
  });
  g.restore();
}

function tc(t) {
  const f = Math.floor(t * 24), two = (n) => String(n).padStart(2, '0');
  return `00:00:${two(Math.floor(f / 24))}:${two(f % 24)}`;
}

function hud(g, t, f) {
  const a = prog(t, 0.2, 0.7) * (1 - prog(t, T.fade[0], T.fade[0] + 0.3));
  if (a <= 0) return;
  const m = 64, L = 22;
  g.save(); g.globalAlpha = a; g.strokeStyle = 'rgba(242,238,230,0.55)'; g.lineWidth = 1.5;
  for (const [x, y, sx, sy] of [[m, m - 26, 1, 1], [W - m, m - 26, -1, 1], [m, H - m + 20, 1, -1], [W - m, H - m + 20, -1, -1]]) {
    g.beginPath(); g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); g.stroke();
  }
  g.restore();
  const act = t < ACT.engines[0] ? ['01', 'BRIEF'] : t < ACT.clock[0] ? ['02', 'ENGINES'] : t < ACT.film[0] ? ['03', 'CLOCK'] : ['04', 'FILM'];
  text(g, 'EXP 02  —  BRIEF → FILM', m + 36, m + 8, mono(500, 14), C.bone2, { a, spacing: 2, stretch: 'normal' });
  text(g, tc(t), W - m - 36, m + 8, mono(500, 14), C.bone2, { a, spacing: 2, align: 'right', stretch: 'normal' });
  text(g, `ACT ${act[0]} / ${act[1]}`, m + 36, H - m, mono(500, 14), C.bone3, { a, spacing: 2, stretch: 'normal' });
  text(g, `F ${String(f).padStart(4, '0')} / ${DURATION * FPS}`, W - m - 36, H - m, mono(500, 14), C.bone3, { a, spacing: 2, align: 'right', stretch: 'normal' });
}

function brief(g, t) {
  if (t > T.rush[0] + 0.7) return;
  const x = 160, y = 590;
  text(g, 'BRIEF', x, y - 62, mono(600, 15), C.signal, { a: prog(t, 0.3, 0.6) * (1 - prog(t, T.rush[0], T.rush[0] + 0.3)), spacing: 4, stretch: 'normal' });
  const n = Math.floor((t - T.type0) / T.typeStep);
  g.save(); g.font = mono(300, 46); g.letterSpacing = '0px';
  let cx = x;
  [...COPY.brief].forEach((ch, i) => {
    if (i >= n) return;
    const s = prog(t, T.rush[0] + hash(i, 1) * 0.25, T.rush[0] + 0.45 + hash(i, 1) * 0.25), k = ease.inCubic(s);
    g.globalAlpha = 1 - s; g.fillStyle = C.bone;
    g.fillText(ch, cx + k * (W / 2 - cx) * 0.6 + k * (hash(i, 2) - 0.5) * 300, y - k * (hash(i, 3) - 0.3) * 260);
    cx += g.measureText(ch).width;
  });
  if (t < T.rush[0] && Math.floor(t * 2.4) % 2 === 0) { g.globalAlpha = 1; g.fillStyle = C.signal; g.fillRect(cx + 4, y - 34, 20, 42); }
  g.restore();
  const agent = '↳ agent   planning shots · writing code · scoring sound';
  const na = Math.floor(prog(t, 1.95, 2.75) * agent.length);
  text(g, agent.slice(0, na), x, y + 64, mono(400, 17), C.bone3, { a: 1 - prog(t, T.rush[0], T.rush[0] + 0.3), spacing: 1, stretch: 'normal' });
}

function engines(g, t) {
  if (t < ACT.engines[0] || t > T.whip[1] + 0.2) return;
  const out = ease.inCubic(prog(t, T.whip[0], T.whip[0] + 0.45));
  g.save(); g.translate(-out * W * 0.9, 0); g.globalAlpha = 1 - out * 0.6;
  rise(g, COPY.e1, 150, 220, disp(900, 92), C.bone, t, 3.85, 99);
  rise(g, COPY.e2, 150, 322, disp(900, 92), C.signal, t, 4.05, 99);
  COPY.engines.forEach(([no, name, state], i) => {
    const t0 = T.words[i], a = ease.outCubic(prog(t, t0, t0 + 0.3));
    const active = t >= t0 && (i === 2 || t < T.words[i + 1]);
    const y = 860 + i * 42, live = state === 'LIVE';
    text(g, no, 150, y, mono(500, 17), C.bone3, { a, stretch: 'normal' });
    text(g, name, 204, y, mono(700, 17), active ? C.bone : C.bone3, { a, spacing: 2, stretch: 'normal' });
    g.save(); g.globalAlpha *= a; g.strokeStyle = live ? C.signal : C.bone3; g.fillStyle = C.signal; g.lineWidth = 2;
    g.beginPath(); g.arc(352, y - 6, 6, 0, Math.PI * 2); live ? g.fill() : g.stroke(); g.restore();
    text(g, state, 370, y, mono(600, 17), live ? C.signal : C.bone3, { a, spacing: 2, stretch: 'normal' });
  });
  g.restore();
}

function clock(g, t) {
  if (t < T.whip[1] - 0.1 || t > ACT.film[0] + 0.2) return;
  rise(g, COPY.c1, 150, 220, disp(900, 92), C.bone, t, T.c1, T.gap[0] - 0.25);
  rise(g, COPY.c2, 150, 284, disp(800, 36), C.bone2, t, T.c2, T.gap[0] - 0.2, { step: 0.05 });
  text(g, '↳ ' + COPY.cNote, 152, 334, mono(400, 16), C.signal, { a: prog(t, 8.3, 8.6) * (1 - prog(t, T.gap[0] - 0.3, T.gap[0])), spacing: 1, stretch: 'normal' });
}

function film(g, t) {
  if (t < ACT.film[0]) return;
  // A low scrim so the title sits calmly over the floor's reflections.
  const sa = ease.outCubic(prog(t, T.title - 0.1, T.title + 0.5));
  const sc = g.createLinearGradient(0, 760, 0, H);
  sc.addColorStop(0, 'rgba(7,7,7,0)'); sc.addColorStop(0.45, `rgba(7,7,7,${0.72 * sa})`); sc.addColorStop(1, `rgba(7,7,7,${0.85 * sa})`);
  g.fillStyle = sc; g.fillRect(0, 760, W, H - 760);
  const chars = [...COPY.title];
  g.save(); g.font = disp(900, 116); g.fontStretch = 'expanded'; g.letterSpacing = '4px';
  const total = g.measureText(COPY.title).width, m = g.measureText('M'), asc = m.fontBoundingBoxAscent;
  let x = W / 2 - total / 2; const y = 905;
  const capH = asc * 0.72, arrowW = capH * 1.25;
  const widthOf = (ch) => (ch === '→' ? arrowW + 24 : g.measureText(ch).width + 4);
  x = W / 2 - chars.reduce((s, ch) => s + widthOf(ch), 0) / 2;
  chars.forEach((ch, i) => {
    const w = widthOf(ch), p = ease.outExpo(prog(t, T.title + i * 0.035, T.title + i * 0.035 + 0.8));
    if (p > 0) {
      g.save(); g.beginPath(); g.rect(x - 4, y - asc * 1.05, w + 8, asc * 1.35); g.clip();
      const dy = (1 - p) * asc * 1.2;
      if (ch === '→') {
        // A heavy arrow drawn to the cap height, in signal orange.
        const ax = x + 12, my = y - capH / 2 + dy, bar = capH * 0.2;
        g.fillStyle = C.signal; g.beginPath();
        g.moveTo(ax, my - bar / 2); g.lineTo(ax + arrowW - capH * 0.42, my - bar / 2); g.lineTo(ax + arrowW - capH * 0.42, my - capH * 0.42);
        g.lineTo(ax + arrowW, my); g.lineTo(ax + arrowW - capH * 0.42, my + capH * 0.42); g.lineTo(ax + arrowW - capH * 0.42, my + bar / 2);
        g.lineTo(ax, my + bar / 2); g.closePath(); g.fill();
      } else { g.fillStyle = C.bone; g.fillText(ch, x, y + dy); }
      g.restore();
    }
    x += w;
  });
  g.restore();
  rise(g, COPY.sub, W / 2, 962, `italic 400 34px ${F.display}`, C.bone2, t, T.sub, 99, { stretch: 'normal', align: 'center', step: 0.06 });
  text(g, COPY.foot, W / 2, 1012, mono(500, 14), C.bone3, { a: prog(t, T.foot, T.foot + 0.5), spacing: 3, stretch: 'normal', align: 'center' });
}

export function drawOverlay(canvas, t, f) {
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, W, H);
  hud(g, t, f); brief(g, t); engines(g, t); clock(g, t); film(g, t);
}
