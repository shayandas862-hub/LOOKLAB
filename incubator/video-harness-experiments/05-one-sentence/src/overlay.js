// Type over the frame. The HUD in the corner shows only true values: the frame number, the timecode, the bar and
// beat, the active camera's real focal length and its real speed. Scenes pass everything else through `look`.
import { CUE, COPY, BEAT } from './timeline.js';
import { ease, prog, clamp } from './util.js';

const ORANGE = '#FF6A1A', RED = '#FF2E2E';
const el = (root, html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const n = d.firstChild; root.appendChild(n); return n; };
const show = (n, on) => { n.style.display = on ? 'block' : 'none'; };
const pad = (n, k = 2) => String(n).padStart(k, '0');

export function createOverlay(root) {
  const hud = el(root, `<div class="mono" style="left:56px;bottom:40px;font-size:19px;letter-spacing:0.06em;color:rgba(255,255,255,0.78);white-space:pre"></div>`);
  const lane = el(root, `<div style="left:56px;top:48px"><div class="mono" style="font-size:19px;letter-spacing:0.2em;color:${ORANGE}"></div><div class="anton" style="font-size:54px;letter-spacing:0.04em;margin-top:6px"></div></div>`);
  const sweepA = el(root, `<div style="top:0;width:3px;height:1080px;background:#fff;box-shadow:0 0 18px #fff"></div>`);
  const sweepB = el(root, `<div style="top:0;width:3px;height:1080px;background:${ORANGE};box-shadow:0 0 18px ${ORANGE}"></div>`);
  const vf = el(root, `<div style="left:0;top:0;width:1920px;height:1080px">
    ${[[90, 70, 'border-left', 'border-top'], [1770, 70, 'border-right', 'border-top'], [90, 950, 'border-left', 'border-bottom'], [1770, 950, 'border-right', 'border-bottom']]
      .map(([x, y, a, b]) => `<div style="position:absolute;left:${x}px;top:${y}px;width:60px;height:60px;${a}:3px solid #fff;${b}:3px solid #fff"></div>`).join('')}
    <div class="mono" style="position:absolute;right:120px;top:96px;font-size:26px;font-weight:700;color:#fff"><span style="color:${RED}">●</span> REC</div>
    <div class="mono" style="position:absolute;left:120px;top:96px;font-size:20px;color:#fff;white-space:pre"></div></div>`);
  const vfInfo = vf.lastChild, rec = vf.children[4].firstChild;
  const labels = Array.from({ length: 4 }, () => el(root, `<div class="mono" style="font-size:17px;line-height:1.45;color:#fff;white-space:pre;text-align:left"></div>`));
  const delta = el(root, `<div style="right:90px;top:120px;text-align:right"><div class="mono" style="font-size:20px;letter-spacing:0.18em;color:#fff;opacity:0.85">ΔE00  SHOE vs BRAND</div><div class="anton" style="font-size:150px;line-height:1"></div><div class="mono" style="font-size:22px;color:#fff;opacity:0.85">pass under 2.0</div></div>`);
  const deltaNum = delta.children[1];
  const title = el(root, `<div class="anton chrome" style="left:0;right:0;top:380px;text-align:center;font-size:260px;letter-spacing:0.02em">${COPY.title}</div>`);
  const end = el(root, `<div style="left:0;right:0;top:700px;text-align:center"><div class="mono" style="font-size:40px;color:#fff;letter-spacing:0.02em">${COPY.line}</div><div class="mono" style="margin-top:22px;font-size:20px;color:${ORANGE};letter-spacing:0.16em">${COPY.note.toUpperCase()}</div><div class="mono" style="margin-top:46px;font-size:19px;color:rgba(255,255,255,0.7);letter-spacing:0.3em">${COPY.foot}</div></div>`);

  return function update(t, look = {}) {
    const h = look.hud;
    show(hud, !!h && t < CUE.finalHit);
    if (h) {
      const s = Math.floor(h.f / 24);
      hud.textContent = `f ${pad(h.f, 4)}   ${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(h.f % 24)}   BAR ${pad(h.bar)}·${h.beat}   ${h.mm.toFixed(0)} mm   ${h.speed.toFixed(1)} m/s`;
    }
    show(lane, !!(look.lane && look.build));
    if (look.lane) { lane.children[0].textContent = `LANE  ·  ${look.lane}`; lane.children[1].textContent = `${look.shot.id}  ${look.shot.name}`; }
    const sw = look.sweep != null && look.sweep < 1;
    show(sweepA, sw); show(sweepB, sw && look.sweep + 0.22 < 1);
    if (sw) { sweepA.style.left = `${(1920 * look.sweep - 1).toFixed(0)}px`; sweepB.style.left = `${(1920 * (look.sweep + 0.22) - 1).toFixed(0)}px`; }
    show(vf, !!look.viewfinder);
    if (look.viewfinder && h) { rec.style.opacity = (t % BEAT) < BEAT * 0.6 ? 1 : 0.15; vfInfo.textContent = `${h.mm.toFixed(0)} mm   ·   24 fps   ·   1/48\n${hud.textContent.split('   ')[1]}`; }
    labels.forEach((n, i) => {
      const s = look.screens?.[i]; show(n, !!s);
      if (!s) return;
      Object.assign(n.style, { left: `${s.x.toFixed(0)}px`, top: `${s.y.toFixed(0)}px`, opacity: s.alpha ?? 1 });
      n.innerHTML = `${s.name}\n<span style="opacity:0.75">${s.data}</span>\n<span style="color:${s.ok === false ? RED : ORANGE};font-weight:700">${s.check}</span>`;
    });
    show(delta, !!look.delta);
    if (look.delta) { deltaNum.textContent = `${look.delta.value.toFixed(1)} ${look.delta.ok ? '✓' : '✗'}`; deltaNum.style.color = look.delta.ok ? ORANGE : RED; }
    const ti = t >= CUE.title && t < CUE.title + 1.75;
    show(title, ti);
    if (ti) { const x = t - CUE.title; title.style.transform = `scale(${(1.25 - 0.25 * ease.outExpo(clamp(x * 10)) + 0.03 * x).toFixed(3)})`; title.style.opacity = (1 - prog(x, 1.4, 1.75)).toFixed(3); }
    const en = t >= CUE.card + 0.3;
    show(end, en);
    if (en) { const x = ease.outCubic(prog(t, CUE.card + 0.3, CUE.card + 1.3)); end.style.opacity = x.toFixed(3); end.style.transform = `translateY(${((1 - x) * 14).toFixed(1)}px)`; }
  };
}
