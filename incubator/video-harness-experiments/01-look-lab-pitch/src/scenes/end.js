// 11.86–15 s · Collapse to a line, impact, the mark on a vectorscope.
import { C, F, T, COPY, W, H } from '../timeline.js';
import { ease, prog, lerp, font, revealLine, scramble, mono, rgba } from '../util.js';

const CX = W / 2, CY = 470;

// BT.709 colour-difference position of an sRGB colour (0–255), for the scope.
function uv([r, g, b]) {
  const R = r / 255, G = g / 255, B = b / 255, Y = 0.2126 * R + 0.7152 * G + 0.0722 * B;
  return [(B - Y) / 1.8556, (R - Y) / 1.5748];
}

function scope(ctx, t, palette) {
  const a = ease.outCubic(prog(t, T.logo, T.logo + 0.8)), R = 380, rot = (t - T.logo) * 0.07;
  if (a <= 0) return;
  ctx.save(); ctx.translate(CX, CY); ctx.globalAlpha *= a;
  ctx.strokeStyle = rgba(C.tx, 0.13); ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = rgba(C.tx, 0.06);
  for (const k of [0.25, 0.5, 0.75]) { ctx.beginPath(); ctx.arc(0, 0, R * k, 0, Math.PI * 2); ctx.stroke(); }
  ctx.rotate(rot);
  ctx.strokeStyle = rgba(C.tx, 0.16);
  for (let i = 0; i < 72; i++) {
    const an = (i / 72) * Math.PI * 2, l = i % 2 ? 8 : 18;
    ctx.beginPath(); ctx.moveTo(Math.cos(an) * R, Math.sin(an) * R); ctx.lineTo(Math.cos(an) * (R - l), Math.sin(an) * (R - l)); ctx.stroke();
  }
  ctx.strokeStyle = rgba(C.tx, 0.06); ctx.beginPath(); ctx.moveTo(-R, 0); ctx.lineTo(R, 0); ctx.moveTo(0, -R); ctx.lineTo(0, R); ctx.stroke();
  // Skin-tone line.
  ctx.save(); ctx.setLineDash([6, 8]); ctx.strokeStyle = rgba(C.warm, 0.35);
  const sk = uv([224, 172, 135]), sa = Math.atan2(-sk[1], sk[0]);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(sa) * R, Math.sin(sa) * R); ctx.stroke(); ctx.restore();
  // 75 % targets.
  [['R', [191, 0, 0]], ['MG', [191, 0, 191]], ['B', [0, 0, 191]], ['CY', [0, 191, 191]], ['G', [0, 191, 0]], ['YL', [191, 191, 0]]].forEach(([l, c]) => {
    const [u, v] = uv(c), x = (u / 0.6) * R, y = (-v / 0.6) * R;
    ctx.strokeStyle = rgba(C.tx, 0.22); ctx.strokeRect(x - 9, y - 9, 18, 18);
    ctx.save(); ctx.translate(x * 1.12, y * 1.12); ctx.rotate(-rot); mono(ctx, l, 0, 5, { size: 12, color: C.tx3, align: 'center', alpha: 0.6 }); ctx.restore();
  });
  // The reference's own palette, at 3× scope gain.
  palette.forEach((p, i) => {
    const pa = ease.outBack(prog(t, T.logo + 0.2 + i * 0.07, T.logo + 0.6 + i * 0.07));
    if (pa <= 0) return;
    const [u, v] = uv(p.rgb), x = ((u * 3) / 0.6) * R, y = ((-v * 3) / 0.6) * R;
    const r = (5 + p.share * 26) * pa, g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4);
    g.addColorStop(0, rgba(C.tx, 0.9)); g.addColorStop(0.35, p.hex); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}

export function drawEnd(ctx, t, A) {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (t < T.logo) {
    // The collapsed frame, contracting to a point.
    const w = lerp(W, 0, ease.inExpo(prog(t, T.collapse[1] - 0.02, T.logo)));
    ctx.fillStyle = C.acc; ctx.fillRect(CX - w / 2, H / 2 - 1.5, w, 3);
    return;
  }
  const bg = ctx.createRadialGradient(CX, CY, 20, CX, CY, 1100);
  bg.addColorStop(0, '#11181b'); bg.addColorStop(1, '#050606');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  scope(ctx, t, A.palette);

  // Shockwave.
  const sw = prog(t, T.logo, T.logo + 0.9);
  if (sw < 1) {
    ctx.strokeStyle = rgba(C.acc, 1 - sw); ctx.lineWidth = lerp(6, 0.5, sw);
    ctx.beginPath(); ctx.arc(CX, CY, ease.outExpo(sw) * 1300, 0, Math.PI * 2); ctx.stroke();
  }

  const push = 1 + 0.035 * prog(t, T.logo, 15);
  ctx.save(); ctx.translate(CX, CY); ctx.scale(push, push);
  ctx.font = font(700, 150); ctx.letterSpacing = '26px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = C.tx;
  ctx.fillText(scramble(COPY.brand, t, T.logo, 0.62, 5), 13, 0);
  const u = ease.outExpo(prog(t, T.logo + 0.45, T.logo + 0.9));
  ctx.fillStyle = C.acc; ctx.fillRect(-70 * u, 92, 140 * u, 4);
  ctx.restore();

  revealLine(ctx, [
    { text: COPY.tagA, font: font(400, 50), color: C.tx2 },
    { text: COPY.tagB, font: font(400, 64, F.serif, true), color: C.warm },
  ], CX, 680, t, T.tag, { align: 'center', step: 0.07 });

  // The pipeline, lighting up step by step.
  ctx.font = font(500, 19, F.mono); ctx.letterSpacing = '2px';
  const sep = '   →   ', parts = COPY.flow;
  const widths = parts.map((p) => ctx.measureText(p).width), sw2 = ctx.measureText(sep).width;
  let x = CX - (widths.reduce((s, w) => s + w, 0) + sw2 * (parts.length - 1)) / 2;
  parts.forEach((p, i) => {
    const t0 = T.flow + i * T.flowStep, a = ease.outCubic(prog(t, t0, t0 + 0.25)), hot = 1 - prog(t, t0 + 0.1, t0 + 0.7);
    mono(ctx, p, x, 800, { size: 19, color: hot > 0.5 ? C.acc : C.tx2, alpha: a, spacing: 2 });
    x += widths[i];
    if (i < parts.length - 1) { mono(ctx, sep, x, 800, { size: 19, color: C.tx3, alpha: a * 0.7, spacing: 2 }); x += sw2; }
  });
}
