// 0.0–3.1 s · A line becomes the 2.39 frame; the problem is stated; time starts burning.
import { C, F, T, COPY, W, H, FPS } from '../timeline.js';
import { ease, prog, lerp, font, revealLine, brackets, mono, rgba, hash } from '../util.js';

export const BAR = 138; // letterbox bar height at 2.39:1

export function letterboxInset(t) {
  if (t < T.bars[0]) return H / 2;
  if (t < T.wipe[0]) return lerp(H / 2, BAR, ease.inOutCubic(prog(t, T.bars[0], T.bars[1])));
  if (t < T.fade[0]) return lerp(BAR, 0, ease.inOutCubic(prog(t, T.wipe[0], T.wipe[1])));
  return lerp(0, H / 2, ease.inCubic(prog(t, T.fade[0] + 0.15, T.fade[1])));
}

export function whipOffset(t) { return ease.inOutCubic(prog(t, T.whip[0], T.whip[1])) * W; }

export function drawHook(ctx, t) {
  const ox = -whipOffset(t);
  ctx.save(); ctx.translate(ox, 0);

  // Inner frame: a cool radial and a dot grid.
  const g = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.6);
  g.addColorStop(0, '#15191c'); g.addColorStop(1, C.bg);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const dots = ease.outCubic(prog(t, T.bars[1] - 0.1, T.bars[1] + 0.6));
  if (dots > 0) {
    ctx.fillStyle = rgba(C.tx, 0.07 * dots);
    for (let y = BAR + 24; y < H - BAR; y += 48) for (let x = 24; x < W; x += 48) ctx.fillRect(x, y, 2, 2);
  }

  // Viewfinder.
  const vf = ease.outExpo(prog(t, 0.25, 0.8));
  if (vf > 0) {
    const m = lerp(10, 70, vf);
    ctx.globalAlpha = vf;
    brackets(ctx, m + 30, BAR + m - 20, W - 2 * (m + 30), H - 2 * BAR - 2 * (m - 20), 46, 1, rgba(C.tx, 0.55), 2);
    ctx.strokeStyle = rgba(C.tx, 0.18); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W / 2 - 14, H / 2); ctx.lineTo(W / 2 + 14, H / 2); ctx.moveTo(W / 2, H / 2 - 14); ctx.lineTo(W / 2, H / 2 + 14); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // The statement.
  const slam = prog(t, T.slam, T.slam + 0.32);
  const dim = ease.outCubic(prog(t, T.slam, T.slam + 0.4));
  const lineFont = font(600, 80);
  revealLine(ctx, [{ text: COPY.hookA, font: lineFont, color: C.tx }], W / 2, 405 - dim * 30, t, T.hookA, { align: 'center', alpha: 1 - dim * 0.45 });
  revealLine(ctx, [{ text: COPY.hookB, font: lineFont, color: C.tx }], W / 2, 500 - dim * 30, t, T.hookB, { align: 'center', alpha: 1 - dim * 0.45 });
  if (t >= T.slam) {
    const s = lerp(1.45, 1, ease.outBack(Math.min(1, slam * 1.1)));
    ctx.save(); ctx.translate(W / 2, 720); ctx.scale(s, s);
    ctx.globalAlpha = Math.min(1, slam * 6);
    ctx.font = font(400, 230, F.serif, true); ctx.textAlign = 'center';
    ctx.fillStyle = C.warm; ctx.fillText(COPY.hookC, 0, 0);
    ctx.restore();
    // Underline cut.
    const u = ease.outExpo(prog(t, T.slam + 0.12, T.slam + 0.6));
    ctx.fillStyle = C.warm; ctx.fillRect(W / 2 - 330 * u, 772, 660 * u, 3);
  }

  ctx.restore();
}

function tc(sec) {
  const f = Math.floor(sec * 24);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(1 + Math.floor(f / 86400))}:${p(Math.floor(f / 1440) % 60)}:${p(Math.floor(f / 24) % 60)}:${p(f % 24)}`;
}

// HUD in the letterbox bars.
export function drawHookBars(ctx, t) {
  // The centre line: grows, then splits into the letterbox edges (drawn over the bars).
  const grow = ease.outExpo(prog(t, T.line[0], T.line[1]));
  const split = ease.inOutCubic(prog(t, T.bars[0], T.bars[1]));
  const glow = 1 - prog(t, T.bars[1], T.bars[1] + 0.6);
  if (grow > 0 && glow > 0) {
    const len = W * grow, y0 = lerp(H / 2, BAR, split), y1 = lerp(H / 2, H - BAR, split);
    ctx.fillStyle = rgba(C.acc, 0.95 * glow);
    ctx.fillRect(W / 2 - len / 2, y0 - 1.5, len, 3);
    ctx.fillRect(W / 2 - len / 2, y1 - 1.5, len, 3);
  }
  const a = ease.outCubic(prog(t, T.hud, T.hud + 0.4)) * (1 - prog(t, T.whip[0], T.whip[0] + 0.2));
  if (a <= 0) return;
  const over = t >= T.slam;
  // Clock runs at 1x, then at 40x once we are "on set".
  const clock = over ? T.slam + (t - T.slam) * 40 * 60 : t;
  const yT = BAR / 2 + 7, yB = H - BAR / 2 + 7;
  const blink = Math.floor(t * 2) % 2 === 0;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = C.red; ctx.globalAlpha = a * (blink ? 1 : 0.35);
  ctx.beginPath(); ctx.arc(110, yT - 6, 7, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = a;
  mono(ctx, 'REC', 126, yT, { size: 19, color: C.tx });
  mono(ctx, 'A-CAM   50 mm   T2.0', 210, yT, { size: 19, color: C.tx3 });
  mono(ctx, 'TC ' + tc(clock), W - 110, yT, { size: 19, color: over ? C.red : C.tx, align: 'right', w: 600 });
  if (over && hash(Math.floor(t * 8), 3) > 0.25) mono(ctx, '+ OVERTIME', W - 400, yT, { size: 19, color: C.red, align: 'right' });
  mono(ctx, 'SHOOT DAY 01   SETUP 04 OF 31', 110, yB, { size: 19, color: C.tx3 });
  mono(ctx, '24 FPS   180°   5600 K', W - 110, yB, { size: 19, color: C.tx3, align: 'right' });
  ctx.restore();
}

export const hookFrames = Math.round(T.whip[1] * FPS);
