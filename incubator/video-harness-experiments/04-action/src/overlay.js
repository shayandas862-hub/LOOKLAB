// Type and 2D graphics as real DOM over the frame: Anton for the slams, JetBrains Mono for the machine's voice.
// Every property is computed from t; scenes report screen positions through HUD (e.g. where the hero's head is).
import { CUE, COPY, BEAT, bar } from './timeline.js';
import { ease, prog, clamp } from './util.js';

export const HUD = { head: null, swatch: null };
const ORANGE = '#FF6A1A';

const el = (root, html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); const n = d.firstChild; root.appendChild(n); return n; };
const show = (n, on) => { n.style.display = on ? 'block' : 'none'; };

export function createOverlay(root) {
  const svg = el(root, `<svg width="1920" height="1080" viewBox="0 0 1920 1080" style="left:0;top:0"></svg>`);
  const rings = Array.from({ length: 3 }, () => { const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); c.setAttribute('cx', 960); c.setAttribute('cy', 540); c.setAttribute('fill', 'none'); c.setAttribute('stroke', ORANGE); svg.appendChild(c); return c; });
  const typed = el(root, `<div class="mono" style="left:0;right:0;top:500px;text-align:center;font-size:72px;letter-spacing:0.02em;white-space:pre"></div>`);
  const slam = el(root, `<div class="anton chrome" style="left:0;right:0;top:330px;text-align:center;font-size:400px;letter-spacing:0.01em"></div>`);
  const label = el(root, `<div style="left:72px;bottom:64px;display:flex;align-items:baseline;gap:18px"><span class="mono" style="font-size:22px;color:${ORANGE}"></span><span class="anton" style="font-size:44px;letter-spacing:0.08em"></span></div>`);
  const card = el(root, `<div style="left:0;top:0;width:1920px;height:1080px;background:#000"><div class="anton chrome" style="position:absolute;left:0;right:0;top:300px;text-align:center;font-size:470px">${COPY.action}</div></div>`);
  const cardWord = card.firstChild;
  const box = el(root, `<div style="border:4px solid #FF2E2E;box-sizing:border-box"><div class="mono" style="position:absolute;left:-4px;top:-46px;white-space:nowrap;font-size:26px;font-weight:700;padding:4px 10px;background:#FF2E2E;color:#fff"></div></div>`);
  const boxLabel = box.firstChild;
  const scrub = el(root, `<div style="left:160px;right:160px;bottom:70px;height:3px;background:rgba(255,255,255,0.25)"><div style="position:absolute;top:-9px;width:3px;height:21px;background:#fff"></div><div class="mono" style="position:absolute;top:-40px;font-size:20px;color:#fff;white-space:nowrap"></div></div>`);
  const [playhead, frameNo] = scrub.children;
  const swatches = el(root, `<div style="right:90px;top:360px;display:flex;flex-direction:column;gap:14px;align-items:flex-end"></div>`);
  const swRows = Array.from({ length: 2 }, (_, i) => el(swatches, `<div style="display:flex;align-items:center;gap:14px"><span class="mono" style="font-size:20px;color:#fff;opacity:0.85">${i ? 'BRAND' : 'SHOT'}</span><span style="width:92px;height:92px;display:block;border:2px solid rgba(255,255,255,0.8)"></span></div>`));
  const swTick = el(swatches, `<div class="mono" style="font-size:44px;font-weight:700;color:${ORANGE}">✓</div>`);
  const inside = el(root, `<div class="anton" style="left:0;right:0;top:420px;text-align:center;font-size:190px;letter-spacing:0.02em;color:#fff;text-shadow:0 0 60px rgba(255,106,26,0.55)">${COPY.inside}</div>`);
  const foot = el(root, `<div class="mono" style="left:0;right:0;top:820px;text-align:center;font-size:26px;letter-spacing:0.32em;color:#fff">${COPY.foot}</div>`);

  return function update(t, look = {}) {
    // Rings on the metal hits of the intro and on every slam.
    const ringTimes = [0, bar(2), CUE.land, CUE.world, CUE.camera, CUE.light, CUE.inflate].filter((r) => t >= r && t < r + 0.7).slice(-3);
    rings.forEach((c, i) => {
      const r0 = ringTimes[i];
      if (r0 === undefined) { c.setAttribute('r', 0); c.style.opacity = 0; return; }
      const x = (t - r0) / 0.7;
      c.setAttribute('r', (30 + 1100 * ease.outExpo(x)).toFixed(1)); c.setAttribute('stroke-width', (10 * (1 - x) + 1).toFixed(1)); c.style.opacity = (1 - x).toFixed(3);
    });
    // Typing: one character per eighth note; the cursor blinks on the beat.
    const typing = t < CUE.crack;
    show(typed, typing);
    if (typing) {
      const n = clamp(Math.floor((t - CUE.typeStart) / CUE.typeStep) + 1, 0, COPY.type.length);
      const on = (t % BEAT) < BEAT / 2 || (t > CUE.typeStart && n < COPY.type.length);
      typed.innerHTML = `${COPY.type.slice(0, n)}<span style="display:inline-block;width:0.6em;height:0.95em;vertical-align:-0.12em;margin-left:0.05em;background:${on ? ORANGE : 'transparent'}"></span>`;
    }
    // Slams: one beat big and centred, then the word shrinks to a chapter label.
    const si = COPY.words.findIndex((_, i) => t >= [CUE.world, CUE.camera, CUE.light][i] && t < [CUE.world, CUE.camera, CUE.light][i] + 4);
    const big = si >= 0 && t < [CUE.world, CUE.camera, CUE.light][si] + BEAT;
    show(slam, big);
    if (big) {
      const x = (t - [CUE.world, CUE.camera, CUE.light][si]) / BEAT, k = 1.3 - 0.3 * ease.outExpo(clamp(x * 6)) + 0.04 * x;
      slam.textContent = COPY.words[si]; slam.style.transform = `scale(${k.toFixed(3)})`; slam.style.filter = `blur(${(x < 0.08 ? 6 : 0)}px)`;
    }
    const lab = t >= CUE.world + BEAT && t < CUE.action;
    show(label, lab);
    if (lab) {
      const i = t >= CUE.light + BEAT ? 2 : t >= CUE.camera + BEAT ? 1 : 0;
      label.children[0].textContent = `0${i + 1}`; label.children[1].textContent = t >= CUE.inflate ? 'ACTION' : COPY.words[i];
    }
    // The ACTION card, alone in the silence; its last two frames go white.
    const onCard = t >= CUE.action && t < CUE.drop;
    show(card, onCard);
    if (onCard) {
      const x = (t - CUE.action - 0.04) / (CUE.drop - CUE.action), white = t >= CUE.drop - 2 / 24;
      card.style.background = white ? '#fff' : '#000'; cardWord.style.opacity = white ? 0 : x < 0 ? 0 : 1;
      cardWord.style.transform = `scale(${(1.25 - 0.25 * ease.outExpo(clamp(x * 8)) + 0.05 * x).toFixed(3)})`; cardWord.style.letterSpacing = `${(0.02 + 0.06 * x).toFixed(3)}em`;
    }
    // The checker on the runway: the jacket's colour beside the brand's, ticked on each beat.
    const sw = look.swatch && t >= CUE.swatches[0] && t < CUE.orbit;
    show(swatches, !!sw);
    if (sw) {
      const j = Math.floor((t - CUE.swatches[0]) / BEAT), since = t - CUE.swatches[0] - j * BEAT;
      swRows[0].lastChild.style.background = look.swatch.shot; swRows[1].lastChild.style.background = look.swatch.brand;
      swTick.style.opacity = since > 0.06 ? 1 : 0; swTick.style.transform = `scale(${(1 + 0.4 * Math.exp(-(since - 0.06) / 0.05)).toFixed(3)})`;
    }
    // The catch: a red box on the head, the scrub back, the fix.
    const catching = look.head && t >= CUE.freezeCatch && t < CUE.turn;
    show(box, !!catching);
    if (catching) {
      const fixed = t >= CUE.tick, { x, y, r } = look.head, pop = 1 + 0.25 * Math.exp(-(t - (fixed ? CUE.tick : CUE.freezeCatch)) / 0.06);
      Object.assign(box.style, { left: `${(x - r * pop).toFixed(1)}px`, top: `${(y - r * pop).toFixed(1)}px`, width: `${(2 * r * pop).toFixed(1)}px`, height: `${(2 * r * pop).toFixed(1)}px`, borderColor: fixed ? ORANGE : '#FF2E2E' });
      boxLabel.style.background = fixed ? ORANGE : '#FF2E2E'; boxLabel.textContent = fixed ? 'head turn  ✓' : `${COPY.catch}  ✗`;
    }
    const scrubbing = t >= CUE.freezeCatch && t < CUE.tick + BEAT;
    show(scrub, scrubbing);
    if (scrubbing) {
      const back = ease.inOutCubic(prog(t, CUE.rewind[0], CUE.rewind[1])), fwd = ease.inOutCubic(prog(t, CUE.rebuild, CUE.tick));
      const pos = 0.62 - 0.3 * back + 0.3 * fwd, f = Math.round(1489 - 168 * back + 168 * fwd);
      playhead.style.left = `${(pos * 100).toFixed(2)}%`; frameNo.style.left = `calc(${(pos * 100).toFixed(2)}% - 40px)`; frameNo.textContent = `f ${f}`;
    }
    // Then step inside.
    const ins = t >= CUE.inside && t < CUE.inside + 1.75;
    show(inside, ins);
    if (ins) { const x = t - CUE.inside; inside.style.transform = `scale(${(1.2 - 0.2 * ease.outExpo(clamp(x * 10)) + 0.03 * x).toFixed(3)})`; inside.style.opacity = (1 - prog(x, 1.4, 1.75)).toFixed(3); }
    // End card line.
    const ft = t >= CUE.card + 0.3;
    show(foot, ft);
    if (ft) { const x = ease.outCubic(prog(t, CUE.card + 0.3, CUE.card + 1.3)); foot.style.opacity = x.toFixed(3); foot.style.letterSpacing = `${(0.5 - 0.18 * x).toFixed(3)}em`; }
  };
}
