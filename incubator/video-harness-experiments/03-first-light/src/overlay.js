// Typography as real CSS over the frame: Fraunces with its soft axis, Schibsted Grotesk for small caps.
// Every word's opacity, rise and blur is computed from t — the DOM is just the paintbrush.
import { T, COPY } from './timeline.js';
import { ease, prog } from './util.js';

const LINES = [
  { text: COPY.open, t: T.openText, dark: true },
  { text: COPY.light, t: T.lightText },
  { text: COPY.mark, t: T.markText },
  { text: COPY.look, t: T.lookText },
];

function words(el, text) {
  el.innerHTML = '';
  return text.split(' ').map((w) => { const s = document.createElement('span'); s.textContent = w; el.appendChild(s); el.appendChild(document.createTextNode(' ')); return s; });
}

export function createOverlay(root) {
  root.innerHTML = `
    <div class="line" id="ln"></div>
    <div class="card" id="card"><div class="title" id="title"></div><div class="sub" id="sub"></div><div class="foot" id="foot"></div></div>`;
  const ln = root.querySelector('#ln'), title = root.querySelector('#title'), sub = root.querySelector('#sub'), foot = root.querySelector('#foot');
  const built = LINES.map((l) => ({ ...l, spans: null }));
  let current = null;
  const titleSpans = [...COPY.title].map((ch) => { const s = document.createElement('span'); s.textContent = ch === ' ' ? ' ' : ch; title.appendChild(s); return s; });
  const subSpans = words(sub, COPY.sub);
  foot.textContent = COPY.foot;

  return function update(t) {
    const line = built.find((l) => t >= l.t[0] - 0.05 && t <= l.t[1] + 0.05);
    if (line !== current) { current = line; if (line) line.spans = words(ln, line.text); else ln.innerHTML = ''; }
    if (line) {
      ln.classList.toggle('dark', !!line.dark);
      line.spans.forEach((s, i) => {
        const a = ease.outCubic(prog(t, line.t[0] + i * 0.07, line.t[0] + i * 0.07 + 0.6)), out = ease.inCubic(prog(t, line.t[1] - 0.35, line.t[1]));
        s.style.opacity = (a * (1 - out)).toFixed(3);
        s.style.transform = `translateY(${((1 - a) * 18 - out * 8).toFixed(2)}px)`;
        s.style.filter = `blur(${((1 - a) * 6 + out * 4).toFixed(2)}px)`;
      });
    }
    titleSpans.forEach((s, i) => {
      const a = ease.outCubic(prog(t, T.title + i * 0.045, T.title + i * 0.045 + 0.9));
      s.style.opacity = a.toFixed(3); s.style.transform = `translateY(${((1 - a) * 30).toFixed(2)}px)`; s.style.filter = `blur(${((1 - a) * 10).toFixed(2)}px)`;
    });
    subSpans.forEach((s, i) => {
      const a = ease.outCubic(prog(t, T.sub + i * 0.08, T.sub + i * 0.08 + 0.7));
      s.style.opacity = a.toFixed(3); s.style.transform = `translateY(${((1 - a) * 14).toFixed(2)}px)`; s.style.filter = `blur(${((1 - a) * 5).toFixed(2)}px)`;
    });
    const fa = ease.outCubic(prog(t, T.foot, T.foot + 0.8));
    foot.style.opacity = fa.toFixed(3); foot.style.letterSpacing = `${(0.42 - 0.12 * fa).toFixed(3)}em`;
    const fade = 1 - ease.inCubic(prog(t, T.fade[0] + 0.15, T.fade[1]));
    root.style.opacity = fade.toFixed(3);
  };
}
