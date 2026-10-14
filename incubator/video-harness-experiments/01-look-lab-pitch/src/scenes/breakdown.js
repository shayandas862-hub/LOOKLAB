// 2.7–6.1 s · The reference is scanned and turned into numbers.
import { C, F, T, COPY, W, H } from '../timeline.js';
import { ease, prog, lerp, font, revealLine, brackets, chip, mono, rgba } from '../util.js';
import { SW, SH, FACE } from '../still.js';
import { BAR, whipOffset } from './hook.js';

export function zoomOut(t) { return ease.inExpo(prog(t, T.zoom[0], T.zoom[1] - 0.03)); }

export function drawBreakdown(ctx, t, A) {
  const ox = W - whipOffset(t);
  const z = zoomOut(t);
  const S = (1 + 0.06 * prog(t, 2.9, 6.0)) * (1 + 1.6 * z);
  const fx = FACE.x, fy = FACE.y;
  const P = (x, y) => [ox + fx + (x - fx) * S, BAR + fy + (y - fy) * S];
  const alpha = 1;

  ctx.save(); ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.rect(ox, BAR, W, H - 2 * BAR); ctx.clip();
  const [x0, y0] = P(0, 0);
  ctx.drawImage(A.still, x0, y0, SW * S, SH * S);

  // Scan: a mosaic band trails the scanline down the frame.
  const sp = prog(t, T.scan[0], T.scan[1]);
  if (sp > 0 && sp < 1) {
    const ly = lerp(BAR, H - BAR, ease.inOutCubic(sp)), band = 170;
    ctx.save(); ctx.beginPath(); ctx.rect(ox, ly - band, W, band); ctx.clip();
    const g = ctx.createLinearGradient(0, ly - band, 0, ly);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.globalAlpha = alpha * 0.85; ctx.drawImage(A.mosaic, x0, y0, SW * S, SH * S);
    ctx.globalAlpha = alpha;
    const tg = ctx.createLinearGradient(0, ly - band, 0, ly);
    tg.addColorStop(0, rgba(C.acc, 0)); tg.addColorStop(1, rgba(C.acc, 0.22));
    ctx.fillStyle = tg; ctx.fillRect(ox, ly - band, W, band);
    ctx.restore();
    ctx.fillStyle = C.acc; ctx.fillRect(ox, ly - 1.5, W, 3);
  }
  // A faint measuring grid stays on the scanned part.
  const gridA = 0.06 * prog(t, T.scan[0], T.scan[0] + 0.2) * (1 - prog(t, 5.2, 5.6));
  if (gridA > 0) {
    const ly = sp < 1 ? lerp(BAR, H - BAR, ease.inOutCubic(sp)) : H;
    ctx.strokeStyle = rgba(C.acc, gridA); ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 80) { ctx.moveTo(ox + x + 0.5, BAR); ctx.lineTo(ox + x + 0.5, ly); }
    for (let y = BAR; y <= ly; y += 80) { ctx.moveTo(ox, y + 0.5); ctx.lineTo(ox + W, y + 0.5); }
    ctx.stroke();
  }

  // Left scrim for the copy.
  const scrim = ctx.createLinearGradient(ox, 0, ox + 1000, 0);
  scrim.addColorStop(0, 'rgba(5,8,10,0.78)'); scrim.addColorStop(1, 'rgba(5,8,10,0)');
  ctx.fillStyle = scrim; ctx.fillRect(ox, BAR, 1000, H - 2 * BAR);

  // Subject box.
  const fp = ease.outExpo(prog(t, T.face, T.face + 0.45));
  if (fp > 0) {
    const [bx, by, bw, bh] = FACE.box, [ax, ay] = P(bx, by), [cx, cy] = P(bx + bw, by + bh);
    const k = lerp(0.6, 1, fp), mx = (ax + cx) / 2, my = (ay + cy) / 2;
    const w = (cx - ax) * k, h = (cy - ay) * k;
    brackets(ctx, mx - w / 2, my - h / 2, w, h, 34, fp, C.acc, 2.5);
    chip(ctx, 'SUBJECT · FACE', mx - w / 2, my + h / 2 + 26, { color: C.acc, alpha: fp, size: 16 });
  }

  // Key light vector.
  const kp = ease.outCubic(prog(t, T.key, T.key + 0.5));
  if (kp > 0) {
    const [sx, sy] = P(720, 70), [ex, ey] = P(1098, 268);
    const mx = lerp(sx, ex, kp), my = lerp(sy, ey, kp);
    ctx.save(); ctx.strokeStyle = C.key; ctx.lineWidth = 2.5; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -t * 60;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(mx, my); ctx.stroke(); ctx.restore();
    const ang = Math.atan2(ey - sy, ex - sx);
    ctx.save(); ctx.translate(mx, my); ctx.rotate(ang); ctx.fillStyle = C.key;
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-14, -8); ctx.lineTo(-14, 8); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(sx, sy); ctx.strokeStyle = C.key; ctx.lineWidth = 2; ctx.globalAlpha = alpha * kp;
    ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + t; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 19, Math.sin(a) * 19); ctx.lineTo(Math.cos(a) * 26, Math.sin(a) * 26); ctx.stroke(); }
    ctx.restore();
    chip(ctx, 'KEY  AZ 52°  EL 18°  SOFT', sx + 38, sy, { color: C.key, alpha: kp, size: 17 });
  }

  // Colour temperature scale, top right.
  const kv = ease.outExpo(prog(t, T.kelvin, T.kelvin + 0.6));
  if (kv > 0) {
    const x = ox + 1400, y = BAR + 70, w = 420;
    ctx.save(); ctx.globalAlpha = alpha * Math.min(1, kv * 2);
    ctx.fillStyle = 'rgba(8,10,12,0.72)'; ctx.fillRect(x - 20, y - 42, w + 40, 112);
    mono(ctx, 'COLOUR TEMPERATURE', x, y - 12, { size: 15, color: C.tx3 });
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#ff8a2a'); g.addColorStop(0.3, '#ffc27a'); g.addColorStop(0.6, '#fff4e6'); g.addColorStop(1, '#a9cbff');
    ctx.fillStyle = g; ctx.fillRect(x, y, w * kv, 8);
    const pos = (k) => x + ((k - 2000) / 5000) * w;
    const kk = Math.round(lerp(2000, 3200, kv)), rk = Math.round(lerp(7000, 5600, kv));
    ctx.fillStyle = C.key; ctx.beginPath(); ctx.moveTo(pos(kk), y + 12); ctx.lineTo(pos(kk) - 7, y + 24); ctx.lineTo(pos(kk) + 7, y + 24); ctx.fill();
    mono(ctx, `KEY ${kk} K`, pos(kk), y + 50, { size: 17, color: C.key, align: 'center', w: 600 });
    ctx.fillStyle = C.rim; ctx.beginPath(); ctx.moveTo(pos(rk), y + 12); ctx.lineTo(pos(rk) - 7, y + 24); ctx.lineTo(pos(rk) + 7, y + 24); ctx.fill();
    mono(ctx, `RIM ${rk} K`, pos(rk), y + 50, { size: 17, color: C.rim, align: 'center', w: 600 });
    ctx.restore();
  }

  // Measured rows, lower right.
  const rows = [['KEY : FILL', '4 : 1'], ['CONTRAST', 'HIGH'], ['LENS', '50 mm'], ['ASPECT', '2.39 : 1'], ['SATURATION', '0.42']];
  const rp = prog(t, T.rows - 0.15, T.rows);
  if (rp > 0) {
    const x = ox + 1460, y = BAR + 470;
    ctx.save(); ctx.globalAlpha = alpha * rp;
    ctx.fillStyle = 'rgba(8,10,12,0.8)'; ctx.fillRect(x - 24, y - 40, 384, 40 + rows.length * 38 + 10);
    ctx.strokeStyle = C.line2; ctx.strokeRect(x - 23.5, y - 39.5, 383, 40 + rows.length * 38 + 9);
    ctx.restore();
    rows.forEach(([k, v], i) => {
      const a = ease.outCubic(prog(t, T.rows + i * T.rowStep, T.rows + i * T.rowStep + 0.25)) * alpha;
      mono(ctx, k, x, y + i * 38, { size: 18, color: C.tx3, alpha: a });
      mono(ctx, v, x + 336, y + i * 38, { size: 18, color: C.tx, alpha: a, align: 'right', w: 600 });
    });
  }

  // Copy.
  mono(ctx, COPY.s1k, ox + 140, BAR + 92, { size: 20, color: C.acc, alpha: ease.outCubic(prog(t, T.s1Copy, T.s1Copy + 0.3)), spacing: 2 });
  revealLine(ctx, [{ text: COPY.s1a, font: font(600, 64), color: C.tx }], ox + 138, BAR + 172, t, T.s1Copy + 0.05);
  revealLine(ctx, [{ text: COPY.s1b, font: font(600, 64), color: C.tx }], ox + 138, BAR + 246, t, T.s1Copy + 0.2);
  ctx.restore();
}

export function drawBreakdownBars(ctx, t, A) {
  const a = ease.outCubic(prog(t, 3.05, 3.4)) * (1 - prog(t, T.zoom[0], T.zoom[0] + 0.25));
  if (a <= 0) return;
  const yT = BAR / 2 + 7;
  mono(ctx, 'REFERENCE   still_04.png   1920 × 804', 110, yT, { size: 18, color: C.tx3, alpha: a });
  mono(ctx, 'SHA-256 ' + A.sha.slice(0, 8) + '…' + A.sha.slice(-6), W - 110, yT, { size: 18, color: C.tx3, alpha: a, align: 'right' });
  // Palette, measured from the still's pixels.
  const y = H - BAR + 30;
  mono(ctx, 'PALETTE', 110, y + 26, { size: 16, color: C.tx3, alpha: a });
  mono(ctx, 'k-means · measured', 110, y + 52, { size: 14, color: C.tx3, alpha: a * 0.7 });
  A.palette.forEach((p, i) => {
    const s = ease.outBack(prog(t, T.swatches + i * T.swatchStep, T.swatches + i * T.swatchStep + 0.35));
    if (s <= 0) return;
    const x = 330 + i * 236;
    ctx.save(); ctx.globalAlpha = a * Math.min(1, s);
    ctx.fillStyle = p.hex; ctx.fillRect(x, y + 4 + (1 - s) * 20, 64, 64);
    ctx.strokeStyle = C.line2; ctx.strokeRect(x + 0.5, y + 4.5 + (1 - s) * 20, 63, 63);
    ctx.restore();
    mono(ctx, p.hex, x + 80, y + 28, { size: 18, color: C.tx, alpha: a * Math.min(1, s), w: 600 });
    mono(ctx, (p.share * 100).toFixed(1) + ' %', x + 80, y + 56, { size: 16, color: C.tx3, alpha: a * Math.min(1, s) });
  });
}
