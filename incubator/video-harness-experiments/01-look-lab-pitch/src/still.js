// The "reference frame": a procedural night interior, 2.39:1, painted once.
// Its palette is then genuinely measured from its own pixels (k-means), not typed in.
import { hash } from './util.js';

export const SW = 1920, SH = 804;
export const FACE = { x: 1230, y: 300, box: [1040, 110, 330, 380] }; // head centre, subject box

function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function headPath(ctx) {
  // Profile facing frame-left, origin at head centre.
  ctx.beginPath();
  ctx.moveTo(70, 270); ctx.lineTo(80, 160);
  ctx.bezierCurveTo(120, 80, 128, -60, 80, -130);
  ctx.bezierCurveTo(40, -188, -52, -186, -96, -122);
  ctx.bezierCurveTo(-124, -86, -130, -56, -128, -34);
  ctx.bezierCurveTo(-127, -24, -121, -18, -123, -9);
  ctx.bezierCurveTo(-138, 14, -158, 33, -157, 44);
  ctx.bezierCurveTo(-150, 52, -139, 52, -134, 56);
  ctx.bezierCurveTo(-140, 62, -142, 70, -137, 77);
  ctx.lineTo(-132, 81);
  ctx.bezierCurveTo(-139, 87, -138, 95, -131, 101);
  ctx.bezierCurveTo(-124, 107, -125, 113, -129, 123);
  ctx.bezierCurveTo(-131, 141, -117, 153, -94, 157);
  ctx.bezierCurveTo(-60, 161, -46, 172, -42, 205);
  ctx.lineTo(-48, 270);
  ctx.closePath();
}

function bodyPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(-50, 230);
  ctx.bezierCurveTo(-90, 300, -210, 300, -280, 360);
  ctx.bezierCurveTo(-330, 410, -340, 470, -350, 520);
  ctx.lineTo(380, 520);
  ctx.bezierCurveTo(370, 440, 340, 380, 270, 340);
  ctx.bezierCurveTo(200, 300, 110, 290, 78, 220);
  ctx.closePath();
}

export function paintStill() {
  const c = canvas(SW, SH), g = c.getContext('2d');
  // Room: teal-black wall, warmer floor.
  let gr = g.createLinearGradient(0, 0, 0, SH);
  gr.addColorStop(0, '#0f2a36'); gr.addColorStop(0.62, '#0b1f29'); gr.addColorStop(1, '#1c130d');
  g.fillStyle = gr; g.fillRect(0, 0, SW, SH);
  g.save(); g.globalCompositeOperation = 'screen';
  gr = g.createRadialGradient(860, 330, 20, 860, 330, 420);
  gr.addColorStop(0, 'rgba(255,150,80,0.16)'); gr.addColorStop(1, 'rgba(255,150,80,0)');
  g.fillStyle = gr; g.fillRect(0, 0, SW, SH); g.restore();

  // Window, frame-right, with venetian blinds.
  g.save(); g.filter = 'blur(3px)';
  gr = g.createLinearGradient(1540, 0, 1900, 0);
  gr.addColorStop(0, '#8fbad8'); gr.addColorStop(1, '#c9e4f5');
  g.fillStyle = gr; g.fillRect(1560, 50, 340, 600);
  g.fillStyle = 'rgba(8,20,28,0.78)';
  for (let y = 62; y < 650; y += 34) g.fillRect(1560, y, 340, 13);
  g.fillStyle = '#0a141a'; g.fillRect(1722, 50, 14, 600);
  g.restore();

  // Blind stripes thrown across the back wall.
  g.save(); g.filter = 'blur(10px)'; g.globalCompositeOperation = 'screen';
  for (let k = 0; k < 15; k++) {
    const y0 = 75 + k * 34, y1 = y0 + 18;
    g.fillStyle = `rgba(120,170,205,${0.13 - k * 0.004})`;
    g.beginPath();
    g.moveTo(1560, y0); g.lineTo(1560, y1);
    g.lineTo(560, 230 + y1 * 1.05); g.lineTo(560, 230 + y0 * 1.05 - 6);
    g.closePath(); g.fill();
  }
  g.restore();

  // Warm practical lamp, frame-left, and its bokeh.
  g.save(); g.globalCompositeOperation = 'screen';
  gr = g.createRadialGradient(330, 470, 10, 330, 470, 560);
  gr.addColorStop(0, 'rgba(255,175,95,0.75)'); gr.addColorStop(0.3, 'rgba(255,135,55,0.26)'); gr.addColorStop(1, 'rgba(255,120,40,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 1100, SH);
  g.filter = 'blur(1.5px)';
  g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#2a1a10'; g.fillRect(326, 505, 8, 230);
  g.beginPath(); g.ellipse(330, 740, 70, 12, 0, 0, Math.PI * 2); g.fill();
  g.globalCompositeOperation = 'screen';
  const shade = g.createLinearGradient(0, 420, 0, 505);
  shade.addColorStop(0, '#d98f4a'); shade.addColorStop(0.7, '#ffc982'); shade.addColorStop(1, '#fff0d0');
  g.fillStyle = shade;
  g.beginPath(); g.moveTo(275, 420); g.lineTo(385, 420); g.lineTo(420, 505); g.lineTo(240, 505); g.closePath(); g.fill();
  g.fillStyle = '#fff6e4'; g.beginPath(); g.ellipse(330, 506, 88, 7, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 16; i++) {
    const x = 60 + hash(i, 7) * 760, y = 470 + hash(i, 9) * 300, r = 14 + hash(i, 11) * 34;
    g.fillStyle = `rgba(255,${150 + hash(i, 3) * 60 | 0},80,${0.07 + hash(i, 5) * 0.1})`;
    g.strokeStyle = `rgba(255,190,120,${0.12 + hash(i, 6) * 0.12})`; g.lineWidth = 2;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.stroke();
  }
  g.restore();

  // Subject: head first, then the body so the collar sits over the neck.
  g.save(); g.translate(FACE.x, FACE.y);
  // Head: rim colour underneath, lit skin and hair offset towards the key, so a cool crescent stays on the back edge.
  const hair = (gg) => {
    gg.beginPath(); gg.moveTo(-150, -106);
    gg.bezierCurveTo(-112, -100, -94, -98, -78, -96); gg.bezierCurveTo(-58, -92, -46, -76, -42, -58);
    gg.bezierCurveTo(-36, -30, -33, 0, -30, 18); gg.lineTo(-18, 22);
    gg.bezierCurveTo(-10, -22, 34, -26, 44, 18); gg.bezierCurveTo(54, 80, 50, 130, 62, 176);
    gg.lineTo(240, 176); gg.lineTo(240, -260); gg.lineTo(-150, -260); gg.closePath();
  };
  g.save(); headPath(g); g.clip();
  g.fillStyle = '#86b6d4'; g.fillRect(-200, -200, 400, 480);
  g.translate(-9, 2); headPath(g);
  gr = g.createLinearGradient(-160, 0, 110, 0);
  gr.addColorStop(0, '#f2b47e'); gr.addColorStop(0.22, '#d0875a'); gr.addColorStop(0.5, '#7a4430'); gr.addColorStop(0.8, '#2a1812'); gr.addColorStop(1, '#170f0d');
  g.fillStyle = gr; g.fill();
  hair(g); gr = g.createLinearGradient(-100, -160, 120, 100);
  gr.addColorStop(0, '#3a2418'); gr.addColorStop(0.35, '#1a100c'); gr.addColorStop(1, '#0c0807');
  g.fillStyle = gr; g.fill();
  // Ear, half lit.
  g.save(); g.translate(14, 40); g.rotate(-0.18);
  gr = g.createLinearGradient(-18, 0, 18, 0); gr.addColorStop(0, '#b87250'); gr.addColorStop(1, '#4a2a1c');
  g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, 17, 30, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(40,20,14,0.7)'; g.lineWidth = 3; g.beginPath(); g.ellipse(2, 2, 8, 18, 0, -1.2, 2.2); g.stroke();
  g.restore();
  g.restore();
  g.save(); headPath(g); g.clip();
  // Cheek light and eye socket shadow.
  g.globalCompositeOperation = 'screen';
  let rg = g.createRadialGradient(-95, 40, 4, -95, 40, 70);
  rg.addColorStop(0, 'rgba(255,205,150,0.55)'); rg.addColorStop(1, 'rgba(255,205,150,0)');
  g.fillStyle = rg; g.fillRect(-200, -60, 220, 200);
  g.globalCompositeOperation = 'multiply';
  rg = g.createRadialGradient(-100, -12, 2, -100, -12, 26);
  rg.addColorStop(0, 'rgba(60,30,20,0.9)'); rg.addColorStop(1, 'rgba(60,30,20,0)');
  g.fillStyle = rg; g.fillRect(-140, -50, 80, 80);
  g.restore();
  bodyPath(g);
  gr = g.createLinearGradient(-340, 0, 380, 0);
  gr.addColorStop(0, '#3a2419'); gr.addColorStop(0.35, '#1a110d'); gr.addColorStop(1, '#0a0809');
  g.fillStyle = gr; g.fill();
  g.save(); bodyPath(g); g.clip(); g.filter = 'blur(5px)';
  g.strokeStyle = 'rgba(160,205,235,0.6)'; g.lineWidth = 8; g.translate(6, 0); bodyPath(g); g.stroke(); g.restore();

  g.restore();

  // Haze and a soft vignette.
  g.save(); g.globalCompositeOperation = 'screen';
  gr = g.createRadialGradient(1500, 300, 50, 1500, 300, 900);
  gr.addColorStop(0, 'rgba(110,160,200,0.12)'); gr.addColorStop(1, 'rgba(110,160,200,0)');
  g.fillStyle = gr; g.fillRect(0, 0, SW, SH); g.restore();
  gr = g.createRadialGradient(SW / 2, SH / 2, SH * 0.4, SW / 2, SH / 2, SW * 0.62);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.6)');
  g.fillStyle = gr; g.fillRect(0, 0, SW, SH);

  const soft = canvas(SW, SH), s = soft.getContext('2d');
  s.filter = 'blur(0.7px)'; s.drawImage(c, 0, 0);
  return soft;
}

export function mosaic(src, cell = 24) {
  const w = Math.ceil(SW / cell), h = Math.ceil(SH / cell);
  const small = canvas(w, h); small.getContext('2d').drawImage(src, 0, 0, w, h);
  const big = canvas(SW, SH), b = big.getContext('2d');
  b.imageSmoothingEnabled = false; b.drawImage(small, 0, 0, SW, SH);
  b.strokeStyle = 'rgba(0,0,0,0.35)'; b.lineWidth = 1;
  for (let x = 0; x <= SW; x += cell) { b.beginPath(); b.moveTo(x + 0.5, 0); b.lineTo(x + 0.5, SH); b.stroke(); }
  for (let y = 0; y <= SH; y += cell) { b.beginPath(); b.moveTo(0, y + 0.5); b.lineTo(SW, y + 0.5); b.stroke(); }
  return big;
}

// k-means (k=6) on a 192x80 copy, centroids seeded at luminance quantiles: deterministic.
export function measurePalette(src, k = 6) {
  const w = 192, h = 80, c = canvas(w, h), g = c.getContext('2d');
  g.drawImage(src, 0, 0, w, h);
  const d = g.getImageData(0, 0, w, h).data, px = [];
  for (let i = 0; i < d.length; i += 4) px.push([d[i], d[i + 1], d[i + 2]]);
  const lum = (p) => 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2];
  // Distance in Y/Cb/Cr with chroma weighted 2.5x, so small saturated areas (skin, lamp) are not swallowed by shadow.
  const ycc = (p) => { const y = lum(p); return [y, (p[2] - y) / 1.8556, (p[0] - y) / 1.5748]; };
  const dist = (a, b) => { const A = ycc(a), B = ycc(b); return (A[0] - B[0]) ** 2 + 6.25 * ((A[1] - B[1]) ** 2 + (A[2] - B[2]) ** 2); };
  const sorted = [...px].sort((a, b) => lum(a) - lum(b));
  let cent = Array.from({ length: k }, (_, i) => [...sorted[Math.floor(((i + 0.5) / k) * sorted.length)]]);
  let assign = new Array(px.length).fill(0);
  for (let it = 0; it < 14; it++) {
    const sum = cent.map(() => [0, 0, 0, 0]);
    px.forEach((p, i) => {
      let best = 0, bd = 1e9;
      cent.forEach((q, j) => { const dd = dist(p, q); if (dd < bd) { bd = dd; best = j; } });
      assign[i] = best; const s = sum[best]; s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; s[3]++;
    });
    cent = sum.map((s, j) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : cent[j]));
  }
  const counts = cent.map(() => 0); assign.forEach((a) => counts[a]++);
  const hex = (q) => '#' + q.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
  return cent.map((q, j) => ({ rgb: q.map(Math.round), hex: hex(q), share: counts[j] / px.length }))
    .sort((a, b) => lum(a.rgb) - lum(b.rgb));
}

export async function sha256(src) {
  const d = src.getContext('2d').getImageData(0, 0, SW, SH).data;
  const buf = await crypto.subtle.digest('SHA-256', d);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
