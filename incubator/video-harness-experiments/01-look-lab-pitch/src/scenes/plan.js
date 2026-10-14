// 5.9–9.1 s · The look, adapted to a real room and real kit, planned in 3D.
import { C, T, COPY, W, H } from '../timeline.js';
import { ease, prog, lerp, font, revealLine, chip, mono, rgba } from '../util.js';
import { camera, polyline, seg, ring, panel, sub, norm } from '../three.js';
import { BAR } from './hook.js';

const HEAD = [0, 1.6, 0];
const LIGHTS = [
  { label: 'KEY · 1×1 LED · 3200 K', pos: [-2.1, 2.25, 1.35], col: C.key, w: 0.75, t: T.lights[0], power: 1, side: -1, dy: 64 },
  { label: 'FILL · BOUNCE · −2 STOPS', pos: [2.05, 1.5, 1.9], col: C.fill, w: 0.95, t: T.lights[1], power: 0.5, side: 1, dy: -58, panelAlpha: 0.55 },
  { label: 'RIM · 5600 K', pos: [2.45, 2.5, -1.5], col: C.rim, w: 0.4, t: T.lights[2], power: 0.85, side: 1, dy: -58 },
  { label: 'PRACTICAL · 2700 K', pos: [-2.25, 1.15, -1.95], col: C.prac, w: 0, t: T.lights[3], power: 0.7, side: -1, dy: -58 },
];
const MATCH = [0.41, 0.58, 0.71, 0.83, 0.88];

export function enterScale(t) { return ease.outExpo(prog(t, T.zoom[1] - 0.16, T.zoom[1] + 0.5)); }
export function wipePush(t) { return ease.inOutCubic(prog(t, T.wipe[0], T.wipe[1])) * 300; }

function beam(ctx, cam, from, to, w0, w1, col, a) {
  const P = cam.project(from), Q = cam.project(to);
  if (!P || !Q || a <= 0) return;
  const dx = Q[0] - P[0], dy = Q[1] - P[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const p0 = (w0 * cam.focal) / P[2] / 2, p1 = (w1 * cam.focal) / Q[2] / 2;
  const ex = P[0] + dx * 1.3, ey = P[1] + dy * 1.3;
  const g = ctx.createLinearGradient(P[0], P[1], ex, ey);
  g.addColorStop(0, rgba(col, 0.5 * a)); g.addColorStop(0.75, rgba(col, 0.12 * a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(P[0] + nx * p0, P[1] + ny * p0); ctx.lineTo(ex + nx * p1 * 1.3, ey + ny * p1 * 1.3);
  ctx.lineTo(ex - nx * p1 * 1.3, ey - ny * p1 * 1.3); ctx.lineTo(P[0] - nx * p0, P[1] - ny * p0);
  ctx.closePath(); ctx.fill();
}

function pool(ctx, cam, cx, cz, r, col, a) {
  const pts = ring(0.001, r, cx, cz, 40).map((p) => cam.project(p)).filter(Boolean);
  const c = cam.project([cx, 0, cz]);
  if (!c || pts.length < 3 || a <= 0) return;
  const R = Math.max(...pts.map((p) => Math.hypot(p[0] - c[0], p[1] - c[1])));
  const g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], R);
  g.addColorStop(0, rgba(col, 0.32 * a)); g.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = g; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.fill();
}

export function drawPlan(ctx, t) {
  const e = enterScale(t);
  if (e <= 0) return;
  ctx.save();
  // Emerge from the actor's head, where the reference's face was zoomed into.
  ctx.globalAlpha = prog(t, T.zoom[1] - 0.16, T.zoom[1] - 0.03);
  ctx.translate(wipePush(t), 0);
  ctx.translate(1255, 480); ctx.scale(lerp(2.2, 1, e), lerp(2.2, 1, e)); ctx.translate(-1255, -480);

  const bg = ctx.createRadialGradient(1100, 600, 50, 1100, 600, 1100);
  bg.addColorStop(0, '#12191d'); bg.addColorStop(1, C.bg);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  const k = prog(t, 5.9, 9.12);
  const az = lerp(0.66, 0.22, ease.inOutCubic(k)), R = 10.2;
  const h = lerp(12, 5.6, ease.outCubic(prog(t, 5.9, 7.3)));
  const cam = camera([Math.sin(az) * R, h, Math.cos(az) * R], [0, 0.7, 0.1], 36, 1250, 620, H);

  // Floor grid fading with distance.
  ctx.lineWidth = 1;
  for (let i = -12; i <= 12; i++) for (let j = -12; j < 12; j++) {
    const v = i * 0.5, a = j * 0.5, b = a + 0.5;
    for (const [p, q] of [[[v, 0, a], [v, 0, b]], [[a, 0, v], [b, 0, v]]]) {
      const d = Math.hypot((p[0] + q[0]) / 2, (p[2] + q[2]) / 2);
      const al = 0.17 * Math.max(0, 1 - d / 6.2) * (i % 2 === 0 ? 1.5 : 1);
      if (al <= 0.004) continue;
      ctx.strokeStyle = rgba(C.tx2, al); seg(ctx, cam, p, q);
    }
  }

  // The room: 6.0 × 5.0 m, back and left walls, a window.
  const rk = ease.outCubic(prog(t, T.room, T.room + 0.6));
  ctx.strokeStyle = rgba(C.tx, 0.5); ctx.lineWidth = 1.5;
  const fl = [[-3, 0, -2.5], [3, 0, -2.5], [3, 0, 2.5], [-3, 0, 2.5]];
  fl.forEach((p, i) => seg(ctx, cam, p, fl[(i + 1) % 4], rk));
  ctx.fillStyle = rgba(C.tx, 0.035 * rk);
  polyline(ctx, cam, [[-3, 0, -2.5], [3, 0, -2.5], [3, 2.7, -2.5], [-3, 2.7, -2.5]], true); ctx.fill();
  polyline(ctx, cam, [[-3, 0, -2.5], [-3, 0, 2.5], [-3, 2.7, 2.5], [-3, 2.7, -2.5]], true); ctx.fill();
  for (const p of [[-3, 0, -2.5], [3, 0, -2.5], [-3, 0, 2.5]]) seg(ctx, cam, p, [p[0], 2.7, p[2]], rk);
  seg(ctx, cam, [-3, 2.7, -2.5], [3, 2.7, -2.5], rk); seg(ctx, cam, [-3, 2.7, -2.5], [-3, 2.7, 2.5], rk);
  ctx.fillStyle = rgba('#CFE6FF', 0.12 * rk); ctx.strokeStyle = rgba('#CFE6FF', 0.7 * rk);
  polyline(ctx, cam, [[0.9, 0.9, -2.5], [2.3, 0.9, -2.5], [2.3, 2.3, -2.5], [0.9, 2.3, -2.5]], true); ctx.fill(); ctx.stroke();
  seg(ctx, cam, [1.6, 0.9, -2.5], [1.6, 2.3, -2.5], rk); seg(ctx, cam, [0.9, 1.6, -2.5], [2.3, 1.6, -2.5], rk);
  const wl = cam.project([0.9, 2.3, -2.5]);
  if (wl) mono(ctx, 'WINDOW', wl[0], wl[1] - 12, { size: 15, color: C.tx3, alpha: rk });
  const fc = cam.project([-3, 0, 2.5]);
  if (fc) mono(ctx, 'INT. FLAT · 6.0 × 5.0 m', fc[0] + 10, fc[1] + 34, { size: 17, color: C.tx3, alpha: rk });

  // Light pools and beams, additive.
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const L of LIGHTS) {
    const b = ease.outCubic(prog(t, L.t + 0.2, L.t + 0.6)) * L.power;
    const d = norm(sub([L.pos[0], 0, L.pos[2]], [0, 0, 0]));
    pool(ctx, cam, -d[0] * 0.35, -d[2] * 0.35, 1.3, L.col, b);
    if (L.w) beam(ctx, cam, L.pos, HEAD, L.w, 0.55, L.col, b);
  }
  ctx.restore();

  // Tape mark and actor.
  ctx.strokeStyle = C.warm; ctx.lineWidth = 3;
  seg(ctx, cam, [-0.28, 0, 0], [0.28, 0, 0]); seg(ctx, cam, [0, 0, 0], [0, 0, 0.3]);
  const rings = [[0.04, 0.15], [0.85, 0.17], [1.27, 0.26], [1.37, 0.19], [1.45, 0.07]].map(([y, r]) => ring(y, r, 0, 0, 24).map((p) => cam.project(p)).filter(Boolean));
  const left = rings.map((r) => r.reduce((m, p) => (p[0] < m[0] ? p : m))), right = rings.map((r) => r.reduce((m, p) => (p[0] > m[0] ? p : m)));
  ctx.beginPath(); [...left, ...right.reverse()].forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  ctx.fillStyle = '#101416'; ctx.fill(); ctx.strokeStyle = rgba(C.tx, 0.7); ctx.lineWidth = 1.5; ctx.stroke();
  const hc = cam.project(HEAD), kp = cam.project(LIGHTS[0].pos);
  if (hc && kp) {
    const r = (0.14 * cam.focal) / hc[2], dx = kp[0] - hc[0], dy = kp[1] - hc[1], dl = Math.hypot(dx, dy);
    const g = ctx.createRadialGradient(hc[0] + (dx / dl) * r * 0.5, hc[1] + (dy / dl) * r * 0.5, 1, hc[0], hc[1], r);
    g.addColorStop(0, '#ffd2a0'); g.addColorStop(0.5, '#a0623e'); g.addColorStop(1, '#1c1210');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(hc[0], hc[1], r, 0, Math.PI * 2); ctx.fill();
  }

  // Fixtures fly in.
  for (const L of LIGHTS) {
    const p = ease.outBack(prog(t, L.t, L.t + 0.45));
    if (p <= 0) continue;
    const pos = [L.pos[0], L.pos[1] + (1 - p) * 3.2, L.pos[2]];
    ctx.save(); ctx.globalAlpha *= Math.min(1, prog(t, L.t, L.t + 0.12));
    ctx.strokeStyle = rgba(C.tx2, 0.8); ctx.lineWidth = 1.5;
    seg(ctx, cam, [pos[0], 0, pos[2]], pos);
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; seg(ctx, cam, [pos[0], 0.45, pos[2]], [pos[0] + Math.cos(a) * 0.3, 0, pos[2] + Math.sin(a) * 0.3]); }
    if (L.w) {
      const q = panel(pos, HEAD, L.w, L.w);
      polyline(ctx, cam, q, true); ctx.fillStyle = rgba(L.col, L.panelAlpha || 1); ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke();
    } else {
      const c = cam.project(pos);
      if (c) {
        const r = (0.5 * cam.focal) / c[2], g = ctx.createRadialGradient(c[0], c[1], 1, c[0], c[1], r);
        g.addColorStop(0, '#fff2d8'); g.addColorStop(0.25, rgba(L.col, 0.9)); g.addColorStop(1, rgba(L.col, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, Math.PI * 2); ctx.fill();
      }
    }
    const c = cam.project(pos);
    if (c) {
      const la = ease.outCubic(prog(t, L.t + 0.25, L.t + 0.5));
      const lx = c[0] + L.side * 46, ly = c[1] + L.dy;
      ctx.strokeStyle = rgba(L.col, la); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(lx, ly); ctx.lineTo(lx + L.side * 14, ly); ctx.stroke();
      chip(ctx, L.label, lx + L.side * 14, ly, { color: L.col, alpha: la, right: L.side < 0, size: 16 });
    }
    ctx.restore();
  }

  // Camera A and its frame at the subject.
  const cp = ease.outExpo(prog(t, T.cam, T.cam + 0.5));
  if (cp > 0) {
    const cz = 2.4 + (1 - cp) * 2, cy = 1.5;
    ctx.strokeStyle = C.acc; ctx.lineWidth = 2;
    const bx = 0.12, by = 0.11;
    const box = (z) => [[-bx, cy - by, z], [bx, cy - by, z], [bx, cy + by, z], [-bx, cy + by, z]];
    const f = box(cz - 0.18), r = box(cz + 0.2);
    polyline(ctx, cam, f, true); ctx.stroke(); polyline(ctx, cam, r, true); ctx.stroke();
    f.forEach((p, i) => seg(ctx, cam, p, r[i]));
    seg(ctx, cam, [0, cy, cz - 0.18], [0, cy, cz - 0.34]);
    seg(ctx, cam, [0, 0, cz], [0, cy - by, cz]);
    const fk = ease.outCubic(prog(t, T.cam + 0.15, T.cam + 0.6)), lens = [0, cy, cz - 0.34];
    const frame = [[-0.86, 1.1, 0], [0.86, 1.1, 0], [0.86, 1.82, 0], [-0.86, 1.82, 0]];
    ctx.strokeStyle = rgba(C.acc, 0.75); ctx.lineWidth = 1.2;
    frame.forEach((p) => seg(ctx, cam, lens, p, fk));
    if (fk >= 1) { polyline(ctx, cam, frame, true); ctx.fillStyle = rgba(C.acc, 0.08); ctx.fill(); ctx.stroke(); }
    const c = cam.project([0, cy, cz]);
    if (c) chip(ctx, 'CAM A · 50 mm · 2.39 : 1', c[0] + 40, c[1] + 46, { color: C.acc, alpha: fk, size: 16 });
  }

  // Camera-to-subject distance.
  const dk = ease.outCubic(prog(t, T.dims, T.dims + 0.4));
  if (dk > 0) {
    ctx.strokeStyle = rgba(C.tx, 0.8 * dk); ctx.lineWidth = 1.5;
    seg(ctx, cam, [0.75, 0, 2.4], [0.75, 0, 2.4 - 2.4 * dk]);
    seg(ctx, cam, [0.6, 0, 2.4], [0.9, 0, 2.4]); if (dk >= 1) seg(ctx, cam, [0.6, 0, 0], [0.9, 0, 0]);
    const m = cam.project([0.95, 0, 1.2]);
    if (m) mono(ctx, '2.4 m', m[0] + 8, m[1] + 6, { size: 18, color: C.tx, alpha: dk, w: 600 });
  }

  // Look match climbs as each fixture lands.
  const steps = [T.lights[0], T.lights[1], T.lights[2], T.lights[3]];
  let v = MATCH[0];
  steps.forEach((s, i) => { v = lerp(v, MATCH[i + 1], ease.outCubic(prog(t, s + 0.15, s + 0.55))); });
  const ma = ease.outCubic(prog(t, 6.2, 6.5));
  const mx = 1440, my = H - BAR - 64;
  mono(ctx, 'LOOK MATCH', mx, my, { size: 16, color: C.tx3, alpha: ma });
  mono(ctx, v.toFixed(2), mx + 360, my, { size: 26, color: C.acc, alpha: ma, align: 'right', w: 600 });
  ctx.globalAlpha *= ma;
  ctx.fillStyle = C.line2; ctx.fillRect(mx, my + 16, 360, 4);
  ctx.fillStyle = C.acc; ctx.fillRect(mx, my + 16, 360 * v, 4);
  ctx.globalAlpha /= ma || 1;

  mono(ctx, COPY.s2k, 140, BAR + 92, { size: 20, color: C.acc, alpha: ease.outCubic(prog(t, 6.05, 6.35)), spacing: 2 });
  revealLine(ctx, [{ text: COPY.s2a, font: font(600, 52), color: C.tx }], 138, BAR + 164, t, 6.1);
  revealLine(ctx, [{ text: COPY.s2b, font: font(600, 52), color: C.acc }], 138, BAR + 228, t, 6.35);
  ctx.restore();
}
