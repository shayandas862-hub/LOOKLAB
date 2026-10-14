// The edit's physical punctuation, read from the same drum hits the score plays: a flash frame on crashes, a
// punch-in on the snare, a kick of shake on the bass drum. How hard each section hits is set here.
import { accents } from './music.js';
import { sectionAt, CUE } from './timeline.js';
import { hash } from './util.js';

const A = accents();
// Sum of decays from the hits in `list` that happened before t (within 1 s).
function hit(t, list, tau) {
  let v = 0;
  for (const h of list) { if (h > t) break; if (t - h < 1) v += Math.exp(-(t - h) / tau); }
  return Math.min(1, v);
}
const sorted = Object.fromEntries(Object.entries(A).map(([k, v]) => [k, [...v].sort((a, b) => a - b)]));

const HARD = { brief: 0, plan: 0.5, route: 0.7, make: 1, check: 0.4, cut: 0.8, breath: 0.1, world: 0.9, end: 0.5 };

export function pulseAt(t, frame) {
  const sec = sectionAt(t), hard = HARD[sec];
  const kick = hit(t, sorted.kicks, 0.07), snare = hit(t, sorted.snares, 0.1), crash = hit(t, sorted.crashes, 0.045);
  const anvil = hit(t, sorted.anvils, 0.12);
  const a = hash(frame, 1) * Math.PI * 2;
  const sh = 0.0035 * kick * hard;
  return {
    punch: 0.022 * snare * hard + 0.03 * crash * hard + 0.015 * anvil,
    shake: [Math.cos(a) * sh, Math.sin(a) * sh * 0.6],
    flash: 0.5 * crash * hard * (sec === 'make' || sec === 'world' ? 1 : 0.5),
    chroma: 0.012 * crash * hard + 0.006 * snare * hard,
    white: 0,
  };
}
