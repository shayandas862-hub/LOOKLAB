// 8.75–11.9 s · The crew's set sheet, the capture & grade card, and the grade check.
import { C, F, T, COPY, W } from '../timeline.js';
import { ease, prog, lerp, font, revealLine, mono, rollNumber, rgba } from '../util.js';

const typed = (s, t, t0, d = 0.28) => s.slice(0, Math.floor(s.length * prog(t, t0, t0 + d)));
const CAM_ROWS = ['WB 5600 K', 'S-LOG3 · S-GAMUT3.CINE', '24 FPS · 180° SHUTTER', 'CHART AT HEAD OF SETUP'];
const LIGHT_ROWS = [
  [C.key, 'KEY', '1×1 LED', '3200 K', 'CAM L · 52°'],
  [C.fill, 'FILL', 'BOUNCE', '−2 STOPS', '4 : 1'],
  [C.rim, 'RIM', 'LED PANEL', '5600 K', 'BACK R'],
  [C.prac, 'PRAC', 'PRACTICAL', '2700 K', 'IN SHOT'],
];
const CDL = [['SLOPE', [1.042, 0.981, 0.927]], ['OFFSET', [-0.012, 0.004, 0.021]], ['POWER', [0.986, 1.0, 1.048]]];

function plot(ctx, t, x, y) {
  const p = (t0) => ease.outCubic(prog(t, t0, t0 + 0.3));
  ctx.strokeStyle = '#9C988F'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, 340, 300);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  for (let i = 20; i < 340; i += 20) { ctx.beginPath(); ctx.moveTo(x + i + 0.5, y); ctx.lineTo(x + i + 0.5, y + 300); ctx.stroke(); }
  for (let i = 20; i < 300; i += 20) { ctx.beginPath(); ctx.moveTo(x, y + i + 0.5); ctx.lineTo(x + 340, y + i + 0.5); ctx.stroke(); }
  const s = 40, cx = x + 170, cy = y + 135, P = (wx, wz) => [cx + wx * s, cy + wz * s];
  const rp = p(9.2);
  ctx.strokeStyle = rgba(C.ink, 0.7 * rp); ctx.lineWidth = 2; ctx.strokeRect(cx - 120, cy - 100, 240 * rp, 200);
  const cam = P(0, 2.4), cp = p(9.3);
  ctx.strokeStyle = rgba(C.ink, 0.35 * cp); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cam[0], cam[1]); ctx.lineTo(cx - 43, cy); ctx.moveTo(cam[0], cam[1]); ctx.lineTo(cx + 43, cy); ctx.stroke();
  ctx.fillStyle = rgba(C.ink, cp); ctx.beginPath(); ctx.moveTo(cam[0], cam[1] - 12); ctx.lineTo(cam[0] - 10, cam[1] + 8); ctx.lineTo(cam[0] + 10, cam[1] + 8); ctx.fill();
  [[-2.1, 1.35, C.key], [2.05, 1.9, C.fill], [2.45, -1.5, C.rim], [-2.25, -1.95, C.prac]].forEach(([wx, wz, col], i) => {
    const lp = p(9.35 + i * 0.08), [lx, ly] = P(wx, wz);
    if (lp <= 0) return;
    ctx.strokeStyle = rgba(col, 0.9 * lp); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lerp(lx, cx, 0.55 * lp), lerp(ly, cy, 0.55 * lp)); ctx.stroke();
    ctx.fillStyle = col; ctx.globalAlpha *= lp; ctx.beginPath(); ctx.arc(lx, ly, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha /= lp;
  });
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 9 * rp, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.warm; ctx.fillRect(cx - 12, cy + 14, 24 * rp, 3);
  mono(ctx, 'PLOT · 1 : 100', x + 10, y + 290, { size: 12, color: '#6B675F', alpha: rp });
}

function card(ctx, t) {
  const e = ease.outExpo(prog(t, T.card, T.card + 0.65));
  if (e <= 0) return;
  ctx.save();
  ctx.translate(140 + 410, 262 + 385 + (1 - e) * 820); ctx.rotate(lerp(-0.12, -0.02, e)); ctx.translate(-410, -385);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24;
  ctx.fillStyle = '#E7E3D9'; ctx.fillRect(0, 0, 820, 770); ctx.restore();
  ctx.font = font(700, 36); ctx.fillStyle = C.ink; ctx.fillText('SET SHEET', 40, 66);
  mono(ctx, 'LOOK LAB', 780, 60, { size: 14, color: '#6B675F', align: 'right', spacing: 3 });
  mono(ctx, 'SC 12 · SETUP 04 · INT. FLAT — NIGHT · DAY 01', 40, 100, { size: 15, color: '#55524C' });
  ctx.fillStyle = '#CFCBC2'; ctx.fillRect(40, 122, 740, 1.5);
  plot(ctx, t, 40, 148);
  mono(ctx, 'CAMERA', 410, 172, { size: 13, color: '#6B675F', spacing: 2 });
  CAM_ROWS.forEach((r, i) => mono(ctx, typed(r, t, T.sheetRows + i * T.sheetRowStep), 410, 212 + i * 36, { size: 18, color: C.ink, w: 600 }));
  mono(ctx, 'LIGHTING', 40, 492, { size: 13, color: '#6B675F', spacing: 2 });
  LIGHT_ROWS.forEach(([col, ...cells], i) => {
    const t0 = T.sheetRows + (i + 4) * T.sheetRowStep, y = 534 + i * 50, a = prog(t, t0, t0 + 0.1);
    if (a <= 0) return;
    ctx.fillStyle = '#DDD9D0'; ctx.fillRect(40, y + 18, 740, 1);
    ctx.fillStyle = col; ctx.globalAlpha *= a; ctx.beginPath(); ctx.arc(52, y - 6, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha /= a;
    [70, 175, 400, 590].forEach((cx, j) => mono(ctx, typed(cells[j], t, t0 + j * 0.05, 0.2), cx, y, { size: 18, color: j === 0 ? C.ink : '#34322E', w: j === 0 ? 700 : 500 }));
  });
  mono(ctx, 'SETUP ORDER   KEY → RIM → FILL → PRAC', 40, 742, { size: 14, color: '#6E6A62', alpha: prog(t, 10.1, 10.3) });
  // Stamp.
  const sp = prog(t, T.stamp, T.stamp + 0.16);
  if (sp > 0) {
    ctx.save(); ctx.translate(598, 408); ctx.rotate(-0.16); const s = lerp(1.9, 1, ease.outQuint(sp)); ctx.scale(s, s);
    ctx.globalAlpha *= Math.min(1, sp * 3) * 0.88;
    ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.strokeRect(-178, -34, 356, 68); ctx.strokeRect(-170, -26, 340, 52);
    ctx.font = font(800, 30); ctx.letterSpacing = '4px'; ctx.fillStyle = C.red; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('LOOK APPROVED', 2, 2);
    ctx.restore();
  }
  ctx.restore();
}

function panel(ctx, t) {
  const e = ease.outExpo(prog(t, T.panel, T.panel + 0.65));
  if (e <= 0) return;
  ctx.save(); ctx.globalAlpha *= Math.min(1, e * 1.5);
  ctx.translate(1020 + (1 - e) * 360, 262);
  ctx.fillStyle = C.bg1; ctx.fillRect(0, 0, 760, 770);
  ctx.strokeStyle = C.line2; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, 759, 769);
  ctx.fillStyle = C.acc; ctx.fillRect(0, 0, 760 * e, 3);
  ctx.font = font(600, 30); ctx.fillStyle = C.tx; ctx.fillText('CAPTURE & GRADE', 40, 62);
  mono(ctx, 'ASC CDL · ON S-LOG3 CODES', 720, 58, { size: 13, color: C.tx3, align: 'right' });
  ctx.fillStyle = C.line; ctx.fillRect(40, 90, 680, 1);
  [['R', '#FF5A5A', 400], ['G', '#4ADE80', 540], ['B', '#60A5FA', 680]].forEach(([l, col, x]) => {
    ctx.fillStyle = col; ctx.fillRect(x - 40, 120, 10, 10); mono(ctx, l, x, 131, { size: 15, color: C.tx3, align: 'right' });
  });
  CDL.forEach(([name, vals], r) => {
    const y = 190 + r * 54, t0 = T.cdl + r * 0.15;
    mono(ctx, name, 40, y, { size: 15, color: C.tx3, alpha: prog(t, t0, t0 + 0.1), spacing: 2 });
    vals.forEach((v, j) => mono(ctx, rollNumber(v, 3, t, t0 + j * 0.05, 0.6, r * 3 + j), 400 + j * 140, y, { size: 30, color: C.tx, align: 'right', w: 500, spacing: 0 }));
  });
  mono(ctx, 'SAT', 40, 352, { size: 15, color: C.tx3, alpha: prog(t, T.cdl + 0.45, T.cdl + 0.55), spacing: 2 });
  mono(ctx, rollNumber(0.92, 3, t, T.cdl + 0.45, 0.6, 99), 400, 352, { size: 30, color: C.tx, align: 'right', w: 500, spacing: 0 });

  // The split: what was lit on set, what is left for the grade.
  const sp = ease.outCubic(prog(t, T.split, T.split + 0.6));
  mono(ctx, 'THE SPLIT', 40, 414, { size: 15, color: C.tx3, alpha: Math.min(1, sp * 3), spacing: 2 });
  ctx.fillStyle = C.line2; ctx.fillRect(40, 432, 680 * Math.min(1, sp * 3), 12);
  ctx.fillStyle = C.warm; ctx.fillRect(40, 432, 476 * sp, 12);
  ctx.fillStyle = C.acc; ctx.fillRect(520, 432, 200 * prog(t, T.split + 0.3, T.split + 0.7), 12);
  mono(ctx, 'LIT ON SET 70 %', 40, 474, { size: 15, color: C.warm, alpha: sp });
  mono(ctx, 'LEFT FOR GRADE 30 %', 720, 474, { size: 15, color: C.acc, alpha: prog(t, T.split + 0.3, T.split + 0.6), align: 'right' });

  // Files.
  [['look_04.cdl', T.chips[0]], ['look_04_33pt.cube', T.chips[1]]].forEach(([name, t0], i) => {
    const p = ease.outExpo(prog(t, t0, t0 + 0.4));
    if (p <= 0) return;
    const y = 530 + i * 74, x = 40 + (1 - p) * -40;
    ctx.save(); ctx.globalAlpha *= p;
    ctx.fillStyle = C.bg2; ctx.fillRect(x, y, 330, 56); ctx.strokeStyle = C.line2; ctx.strokeRect(x + 0.5, y + 0.5, 329, 55);
    ctx.strokeStyle = C.acc; ctx.lineWidth = 2; ctx.strokeRect(x + 18, y + 14, 20, 28);
    mono(ctx, name, x + 54, y + 35, { size: 17, color: C.tx, w: 600 });
    mono(ctx, '↓', x + 306, y + 36, { size: 20, color: C.acc, align: 'right' });
    ctx.restore();
  });
  const mp = ease.outBack(prog(t, T.match, T.match + 0.35));
  if (mp > 0) {
    ctx.save(); ctx.globalAlpha *= Math.min(1, mp); ctx.translate(40, 690);
    ctx.fillStyle = rgba(C.acc, 0.14); ctx.fillRect(0, 0, 330 * Math.min(1, mp), 50);
    ctx.strokeStyle = C.acc; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(18, 26); ctx.lineTo(26, 34); ctx.lineTo(40, 16); ctx.stroke();
    mono(ctx, 'MATCH · WITHIN TARGET', 54, 33, { size: 16, color: C.acc, w: 600 });
    ctx.restore();
  }

  // Grade check gauge.
  const g = prog(t, T.gauge[0], T.gauge[1]), ge = ease.outCubic(g), v = lerp(11.8, 1.6, ge);
  const ga = Math.min(1, prog(t, T.gauge[0] - 0.2, T.gauge[0]) * 1);
  if (ga > 0) {
    const cx = 565, cy = 606, r = 92;
    ctx.save(); ctx.globalAlpha *= ga;
    ctx.lineWidth = 10; ctx.strokeStyle = C.line2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    const col = v > 6 ? C.red : v > 3 ? C.warm : C.acc;
    ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.001, ge)); ctx.stroke();
    mono(ctx, 'ΔE00', cx, cy - 30, { size: 15, color: C.tx3, align: 'center' });
    mono(ctx, v.toFixed(1), cx, cy + 22, { size: 48, color: col, align: 'center', w: 600, spacing: 0 });
    mono(ctx, 'GRADE CHECK', cx, cy + 140, { size: 14, color: C.tx3, align: 'center', spacing: 2 });
    ctx.restore();
  }
  ctx.restore();
}

export function drawSheet(ctx, t) {
  ctx.translate(-300 + ease.inOutCubic(prog(t, T.wipe[0], T.wipe[1])) * 300, 0);
  ctx.fillStyle = '#0D0E0F'; ctx.fillRect(-300, 0, W + 300, 1080);
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = 0; x <= W; x += 60) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, 1080); }
  for (let y = 0; y <= 1080; y += 60) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); }
  ctx.stroke();
  mono(ctx, COPY.s3k, 140, 118, { size: 20, color: C.acc, alpha: ease.outCubic(prog(t, 9.0, 9.3)), spacing: 2 });
  revealLine(ctx, [
    { text: 'The crew gets a plan. The grade gets', font: font(600, 54), color: C.tx },
    { text: 'a head start.', font: font(400, 66, F.serif, true), color: C.warm },
  ], 138, 196, t, 9.05, { step: 0.06 });
  card(ctx, t);
  panel(ctx, t);
}
