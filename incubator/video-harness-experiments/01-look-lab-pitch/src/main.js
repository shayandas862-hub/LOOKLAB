// Frame f → pixels. Nothing here reads a wall clock; t = f / FPS is the only input.
import { W, H, FPS, T, C } from './timeline.js';
import { ease, prog, lerp, impulse, hash, rgba } from './util.js';
import { paintStill, mosaic, measurePalette, sha256 } from './still.js';
import { createPost } from './post.js';
import { drawHook, drawHookBars, letterboxInset, whipOffset } from './scenes/hook.js';
import { drawBreakdown, drawBreakdownBars } from './scenes/breakdown.js';
import { drawPlan, wipePush } from './scenes/plan.js';
import { drawSheet } from './scenes/sheet.js';
import { drawEnd } from './scenes/end.js';

let ctx, scratch, post, out2d, A;

const FONTS = ['300 20px Geist', '400 20px Geist', '500 20px Geist', '600 20px Geist', '700 20px Geist', '800 20px Geist',
  '400 20px "Geist Mono"', '500 20px "Geist Mono"', '600 20px "Geist Mono"', '700 20px "Geist Mono"',
  '400 20px "Instrument Serif"', 'italic 400 20px "Instrument Serif"'];

export async function init(canvas) {
  await Promise.all(FONTS.map((f) => document.fonts.load(f, 'AaΔ→×½−°')));
  scratch = document.createElement('canvas'); scratch.width = W; scratch.height = H;
  ctx = scratch.getContext('2d');
  const still = paintStill();
  A = { still, mosaic: mosaic(still), palette: measurePalette(still), sha: await sha256(still) };
  try { post = createPost(canvas, W, H); } catch (e) { console.error(e); post = null; }
  if (!post) { out2d = canvas.getContext('2d'); }
  return { webgl: !!post, palette: A.palette };
}

function draw(t, f) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

  const shake = impulse(t, [[T.slam, 16, 0.08], [6.0, 5, 0.07], [9.0, 4, 0.06], [T.stamp, 7, 0.06], [T.logo, 12, 0.09],
    ...T.lights.map((l) => [l + 0.3, 2.5, 0.05])]);
  ctx.save();
  ctx.translate((hash(f, 1) - 0.5) * 2 * shake, (hash(f, 2) - 0.5) * 2 * shake);

  if (t < T.whip[1] + 0.05) drawHook(ctx, t);
  if (t >= T.whip[0] && t < T.zoom[1] + 0.05) drawBreakdown(ctx, t, A);

  const wipeX = lerp(-160, W + 160, ease.inOutCubic(prog(t, T.wipe[0], T.wipe[1])));
  if (t >= T.zoom[1] - 0.2 && t < T.wipe[1]) {
    ctx.save();
    if (t >= T.wipe[0]) { ctx.beginPath(); ctx.rect(wipeX, 0, W, H); ctx.clip(); }
    drawPlan(ctx, t); ctx.restore();
  }
  if (t >= T.wipe[0] && t < T.collapse[1]) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, wipeX, H); ctx.clip();
    const c = ease.inOutCubic(prog(t, T.collapse[0], T.collapse[1]));
    if (c > 0) { ctx.translate(0, H / 2); ctx.scale(1 + c * 0.05, Math.max(0.003, 1 - c)); ctx.translate(0, -H / 2); }
    drawSheet(ctx, t);
    if (c > 0) { ctx.fillStyle = rgba(C.acc, c); ctx.fillRect(0, 0, W, H); }
    ctx.restore();
  }
  if (t >= T.collapse[1]) drawEnd(ctx, t, A);
  ctx.restore();

  // Letterbox and the HUD that lives in it.
  const inset = letterboxInset(t);
  if (inset > 0) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, inset); ctx.fillRect(0, H - inset, W, inset); }
  if (inset > 100 && t < 6.2) {
    ctx.fillStyle = rgba(C.line2, 0.6); ctx.fillRect(0, inset - 1, W, 1); ctx.fillRect(0, H - inset, W, 1);
  }
  drawHookBars(ctx, t);
  drawBreakdownBars(ctx, t, A);

  // The wipe's light bar.
  if (t >= T.wipe[0] && t <= T.wipe[1]) {
    const g = ctx.createLinearGradient(wipeX - 220, 0, wipeX, 0);
    g.addColorStop(0, rgba(C.acc, 0)); g.addColorStop(1, rgba(C.acc, 0.35));
    ctx.fillStyle = g; ctx.fillRect(wipeX - 220, 0, 220, H);
    ctx.fillStyle = '#E9FDFF'; ctx.fillRect(wipeX - 3, 0, 6, H);
  }
}

function uniforms(t, f) {
  const v = (whipOffset(t) - whipOffset(t - 1 / FPS)) * 0.5; // 180° shutter
  const bump = (c, w) => Math.exp(-(((t - c) / w) ** 2));
  const zoom = 0.2 * bump(5.97, 0.07) + 0.06 * bump(T.logo + 0.02, 0.05);
  const mx = v + (wipePush(t) - wipePush(t - 1 / FPS)) * 0.5;
  const zc = t < 9 ? [1240 / W, 1 - 450 / H] : [0.5, 1 - 470 / H];
  const blurring = Math.abs(mx) > 0.5 || zoom > 0.003;
  const sheetDim = prog(t, T.wipe[0], T.wipe[1]) * (1 - prog(t, T.collapse[0], T.collapse[1]));
  return {
    mdir: [mx, 0], zoom, zc, n: blurring ? 24 : 1,
    ca: 0.0011 + Math.abs(v) * 0.00005 + impulse(t, [[T.slam, 0.012, 0.12], [6.0, 0.01, 0.12], [9.0, 0.006, 0.1], [T.logo, 0.016, 0.2]]),
    flash: Math.min(0.8, impulse(t, [[T.slam, 0.32, 0.07], [6.0, 0.14, 0.07], [T.logo, 0.55, 0.1]])),
    bloom: lerp(0.62, 0.1, sheetDim),
    fade: 1 - ease.inCubic(prog(t, T.fade[0], T.fade[1])),
    grain: 0.05, vig: 0.42, frame: f % 997,
  };
}

export function renderFrame(f) {
  const t = f / FPS;
  draw(t, f);
  if (post) post(scratch, uniforms(t, f));
  else out2d.drawImage(scratch, 0, 0);
  return t;
}
