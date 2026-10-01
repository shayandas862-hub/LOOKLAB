// Prints the light fit's accuracy on a committed Blender set: every scene, then median and worst per parameter by
// skin tone, the fit time and the confidence's rank correlation. A claim about the Blender set only, never about
// real footage (standing rule 3).
//   node --experimental-strip-types scripts/blender/report.ts [dev|test] [--jitter=0.08] [--baseline] [--variants]
// --baseline: the ported v0.2 objective (whole crop), as first measured. --variants: the four objectives
// D-LL-035 chose between, on the dev set, by median direction error.
import { fitFace, type FaceBox } from '../../src/core/light-face.ts';
import { fitSkin, type SkinOptions } from '../../src/core/light-skin.ts';
import { ASSUMED } from '../../src/core/light-face.ts';
import { loadSet, median, scoreScene, spearman, table, type Fitter, type Row } from './score.ts';

const set = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'dev';
const jitter = Number(process.argv.find((a) => a.startsWith('--jitter='))?.slice(9) ?? 0);

/** A face box nudged by up to ±j of its size on each edge, deterministically per scene: a less careful drag. */
function nudged(b: FaceBox, j: number, k: number): FaceBox {
  const r = (n: number) => Math.sin(k * 12.9898 + n * 78.233) * 0.5; // −0.5 … 0.5, fixed per scene
  const dx0 = r(1) * 2 * j * b.w, dx1 = r(2) * 2 * j * b.w, dy0 = r(3) * 2 * j * b.h, dy1 = r(4) * 2 * j * b.h;
  return { x: b.x + dx0, y: b.y + dy0, w: b.w - dx0 + dx1, h: b.h - dy0 + dy1 };
}
const rho = (rows: Row[]) => spearman(rows.map((r) => r.confidence ?? 0), rows.map((r) => -r.angle));

if (process.argv.includes('--variants')) {
  for (const pattern of ['linear', 'log'] as const) for (const mapping of ['hairline', 'eyes'] as const) {
    const opt: SkinOptions = { pattern, mapping };
    const rows = loadSet('dev').map((sc) => scoreScene(sc, (px, box) => fitSkin(px, box, ASSUMED, opt)));
    const m = (k: 'az' | 'el' | 'angle') => median(rows.map((r) => r[k])).toFixed(1);
    console.log(`${pattern}/${mapping}: direction ${m('angle')}°, az ${m('az')}°, el ${m('el')}°, Spearman(score, −error) ${rho(rows).toFixed(2)}`);
  }
  process.exit(0);
}

const fit: Fitter = process.argv.includes('--baseline') ? fitFace : fitSkin;
const rows: Row[] = loadSet(set).map((sc, k) => scoreScene(sc, fit, jitter ? nudged(sc.truth.face_box, jitter, k + 1) : sc.truth.face_box));
console.log(`\nLight fit (${fit === fitFace ? 'ported v0.2 objective' : 'skin pattern, D-LL-035'}) on the Blender "${set}" set` +
  `${jitter ? ` (face box nudged up to ±${jitter * 100}% per edge)` : ''}: ${rows.length} scenes. Blender set only; no claim about real footage.\n`);
console.log('| Scene | true az / el | fit az / el | Δaz | Δel | angle | ΔK | Δfill | Δsoft | residual | confidence | ms |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  console.log(`| ${r.id} | ${r.truth.az} / ${r.truth.el} | ${r.fit.az.toFixed(0)} / ${r.fit.el.toFixed(0)} | ${r.az.toFixed(0)}° | ${r.el.toFixed(0)}° | ${r.angle.toFixed(0)}° | ${r.kelvin.toFixed(0)} | ${r.fill.toFixed(2)} | ${r.softness.toFixed(2)} | ${r.residual.toFixed(4)} | ${r.confidence ?? '–'} | ${r.ms.toFixed(0)} |`);
}
console.log('\n' + table(rows));
const ms = rows.map((r) => r.ms);
console.log(`\nFit time per frame: median ${median(ms).toFixed(0)} ms, max ${Math.max(...ms).toFixed(0)} ms.`);
if (rows.every((r) => r.confidence !== null)) console.log(`Spearman(confidence, −direction error) = ${rho(rows).toFixed(2)} (n ${rows.length}).`);
