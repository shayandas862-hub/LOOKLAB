// Scores the light fit on a Blender set (P3 task 3): loads each committed render and its truth, runs the fit on
// the truth's face box, and measures the error per parameter. Used by the accuracy test and by
// scripts/blender/report.ts. A development tool: nothing at runtime imports it.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { decodePng } from '../../src/engine/png.ts';
import type { Pixels } from '../../src/core/image.ts';
import type { FaceBox, FaceFit } from '../../src/core/light-face.ts';
import { planSet, SETS, type SceneTruth } from './plan.ts';

export const FIXTURES = join(import.meta.dirname, '..', '..', 'tests', 'fixtures', 'blender');

export interface Scene { truth: SceneTruth; px: Pixels }
export function loadSet(name: string): Scene[] {
  const s = SETS.find((x) => x.name === name);
  if (!s) throw new Error(`no set named ${name}`);
  return planSet(s.name, s.seed, s.rigs).map((truth) => ({ truth, px: decodePng(readFileSync(join(FIXTURES, name, `${truth.id}.png`))) }));
}

const D2R = Math.PI / 180;
/** Azimuth difference on the circle, 0–180°. */
export const azError = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180);
/** Angle between two light directions given as az/el, 0–180°. */
export function angularError(az1: number, el1: number, az2: number, el2: number): number {
  const v = (az: number, el: number) => [Math.sin(az * D2R) * Math.cos(el * D2R), Math.sin(el * D2R), Math.cos(az * D2R) * Math.cos(el * D2R)];
  const a = v(az1, el1), b = v(az2, el2);
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  return Math.acos(dot) / D2R;
}

export interface Row {
  id: string; tone: string;
  az: number; el: number; angle: number; kelvin: number; fill: number; softness: number;
  fit: FaceFit['light']; truth: SceneTruth['key'] & { fill: number };
  residual: number; confidence: number | null; ms: number;
}

/** A fit to score; `score` is its confidence candidate (0–100), when it has one. */
export type Fitter = (px: Pixels, box: FaceBox) => FaceFit & { score?: number };

export function scoreScene(sc: Scene, fit: Fitter, box: FaceBox = sc.truth.face_box): Row {
  const t = performance.now();
  const r = fit(sc.px, box);
  const ms = performance.now() - t, k = sc.truth.key;
  return {
    id: sc.truth.id, tone: sc.truth.skin.tone,
    az: azError(r.light.az, k.az), el: Math.abs(r.light.el - k.el), angle: angularError(r.light.az, r.light.el, k.az, k.el),
    kelvin: Math.abs(r.light.kel - k.kelvin), fill: Math.abs(r.light.fill - sc.truth.fill.stops), softness: Math.abs(r.light.soft - k.softness),
    fit: r.light, truth: { ...k, fill: sc.truth.fill.stops }, residual: r.err, confidence: r.score ?? null, ms,
  };
}

export const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b), n = s.length;
  return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : NaN;
};

/** Spearman's rank correlation (average ranks for ties). */
export function spearman(a: number[], b: number[]): number {
  const rank = (xs: number[]) => {
    const idx = xs.map((v, i) => [v, i] as const).sort((p, q) => p[0] - q[0]);
    const r = new Array<number>(xs.length);
    for (let i = 0; i < idx.length;) {
      let j = i;
      while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
      for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1;
      i = j + 1;
    }
    return r;
  };
  const ra = rank(a), rb = rank(b), n = a.length, ma = (n + 1) / 2;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { num += (ra[i] - ma) * (rb[i] - ma); da += (ra[i] - ma) ** 2; db += (rb[i] - ma) ** 2; }
  return num / Math.sqrt(da * db);
}

const PARAMS = ['az', 'el', 'angle', 'kelvin', 'fill', 'softness'] as const;
export interface Summary { tone: string; n: number; median: Record<string, number>; worst: Record<string, { value: number; id: string }> }
export function summarise(rows: Row[]): Summary[] {
  const groups: [string, Row[]][] = [['all', rows], ['light', rows.filter((r) => r.tone === 'light')], ['dark', rows.filter((r) => r.tone === 'dark')]];
  return groups.map(([tone, rs]) => ({
    tone, n: rs.length,
    median: Object.fromEntries(PARAMS.map((p) => [p, median(rs.map((r) => r[p]))])),
    worst: Object.fromEntries(PARAMS.map((p) => {
      const w = rs.reduce((m, r) => (r[p] > m[p] ? r : m), rs[0]);
      return [p, { value: w[p], id: w.id }];
    })),
  }));
}

/** The accuracy table as markdown: median and worst per parameter, by skin tone. */
export function table(rows: Row[]): string {
  const f = (p: string, v: number) => (p === 'kelvin' ? `${Math.round(v)} K` : p === 'fill' ? `${v.toFixed(2)} st` : p === 'softness' ? v.toFixed(2) : `${v.toFixed(1)}°`);
  const lines = ['| Skin | n | az median / worst | el median / worst | direction (angle) median / worst | kelvin median / worst | fill median / worst | softness median / worst |', '|---|---|---|---|---|---|---|---|'];
  for (const s of summarise(rows)) {
    lines.push(`| ${s.tone} | ${s.n} | ${PARAMS.map((p) => `${f(p, s.median[p])} / ${f(p, s.worst[p].value)}`).join(' | ')} |`);
  }
  return lines.join('\n');
}
