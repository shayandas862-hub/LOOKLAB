// Easing, deterministic noise and text helpers. No Math.random anywhere:
// frame f must look the same on every worker, every run.
import { C, F } from './timeline.js';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const prog = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
export const ease = {
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inExpo: (x) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
  inOutExpo: (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2),
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inCubic: (x) => x * x * x,
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outQuint: (x) => 1 - Math.pow(1 - x, 5),
  outBack: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};

export function hash(a, b = 0) {
  let h = Math.imul((a | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b | 0) + 0x632be59b, 0xc2b2ae35);
  h ^= h >>> 16; h = Math.imul(h, 0x7feb352d); h ^= h >>> 15; h = Math.imul(h, 0x846ca68b); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// A decaying kick for shake / flash / aberration: sum over impulse times.
export function impulse(t, list) {
  let v = 0;
  for (const [t0, amp, decay] of list) if (t >= t0) v += amp * Math.exp(-(t - t0) / decay);
  return v;
}

export const font = (w, px, fam = F.sans, italic = false) => `${italic ? 'italic ' : ''}${w} ${px}px ${fam}`;

// Words slide up out of a mask, one after another.
// segs: [{ text, font, color }] drawn on one baseline. align: 'left' | 'center'.
export function revealLine(ctx, segs, x, y, t, t0, { step = 0.075, dur = 0.55, align = 'left', lh = 1.15, alpha = 1 } = {}) {
  const words = [];
  for (const s of segs) for (const w of s.text.split(' ')) if (w) words.push({ ...s, text: w });
  let total = 0;
  const sizes = words.map((w) => {
    ctx.font = w.font;
    const m = ctx.measureText(w.text), sp = ctx.measureText(' ').width;
    return { w: m.width, sp, asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent };
  });
  sizes.forEach((s, i) => { total += s.w + (i < sizes.length - 1 ? s.sp : 0); });
  let cx = align === 'center' ? x - total / 2 : x;
  words.forEach((w, i) => {
    const s = sizes[i];
    const p = ease.outExpo(prog(t, t0 + i * step, t0 + i * step + dur));
    if (p > 0) {
      const hgt = (s.asc + s.desc) * lh;
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - 4, y - s.asc * 1.1, s.w + 8, hgt + 6); ctx.clip();
      ctx.font = w.font; ctx.fillStyle = w.color; ctx.globalAlpha *= alpha * Math.min(1, p * 1.6);
      ctx.fillText(w.text, cx, y + (1 - p) * hgt);
      ctx.restore();
    }
    cx += s.w + s.sp;
  });
  return total;
}

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=/<>';
// Characters flicker through glyphs and settle left to right.
export function scramble(text, t, t0, dur, seed = 1) {
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const start = t0 + (i / text.length) * dur * 0.35, settle = t0 + dur * (0.45 + 0.55 * i / text.length);
    if (t < start) { out += ' '; continue; }
    if (ch === ' ' || t >= settle) { out += ch; continue; }
    out += GLYPHS[Math.floor(hash(i + seed * 31, Math.floor(t * 30)) * GLYPHS.length)];
  }
  return out;
}

// A number that rolls through digits before landing on its value.
export function rollNumber(value, digits, t, t0, dur, seed = 0) {
  const p = prog(t, t0, t0 + dur);
  if (p <= 0) return '';
  const s = (value < 0 ? '−' : ' ') + Math.abs(value).toFixed(digits);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const settled = p >= 0.35 + 0.65 * (i / s.length);
    out += settled || !/[0-9]/.test(s[i]) ? s[i] : String(Math.floor(hash(i + seed * 13, Math.floor(t * 40)) * 10));
  }
  return out;
}

export function brackets(ctx, x, y, w, h, len, p = 1, color = C.acc, lw = 2) {
  if (p <= 0) return;
  const l = len * p;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'square';
  ctx.beginPath();
  ctx.moveTo(x, y + l); ctx.lineTo(x, y); ctx.lineTo(x + l, y);
  ctx.moveTo(x + w - l, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + l);
  ctx.moveTo(x + w, y + h - l); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - l, y + h);
  ctx.moveTo(x + l, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - l);
  ctx.stroke(); ctx.restore();
}

// A small mono label on a dark chip.
export function chip(ctx, text, x, y, { color = C.tx, bg = 'rgba(11,11,12,0.82)', border = C.line2, size = 17, alpha = 1, pad = 9, right = false } = {}) {
  if (alpha <= 0) return 0;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.font = font(500, size, F.mono);
  ctx.letterSpacing = '0.5px';
  const w = ctx.measureText(text).width + pad * 2, h = size + pad * 1.4;
  if (right) x -= w;
  ctx.fillStyle = bg; ctx.fillRect(x, y - h / 2, w, h);
  ctx.strokeStyle = border; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y - h / 2 + 0.5, w - 1, h - 1);
  ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.fillText(text, x + pad, y + 1);
  ctx.restore();
  return w;
}

export function mono(ctx, text, x, y, { size = 18, color = C.tx2, w = 500, align = 'left', alpha = 1, spacing = 1 } = {}) {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = font(w, size, F.mono);
  ctx.letterSpacing = `${spacing}px`; ctx.textAlign = align; ctx.fillStyle = color;
  ctx.fillText(text, x, y); ctx.restore();
}

export function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export const rgba = (hex, a) => { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; };
