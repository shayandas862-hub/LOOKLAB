// Regenerates the Blender ground-truth sets (P3 task 3): `npm run blender-set` (both sets), or
// `npm run blender-set -- --only=dev`, `--gpu` to render on the M1's GPU, `--scenes=id,id` to try a few.
// Writes tests/fixtures/blender/<set>/<id>.png with <id>.json (the truth) beside it, and render-log.json.
// Blender is a development tool: nothing at runtime needs it (standing rule, P3).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HEAD, PLAN_VERSION, RENDER, SETS, planSet } from './plan.ts';

const BLENDER = process.env.BLENDER ?? '/Applications/Blender.app/Contents/MacOS/Blender';
const ROOT = join(import.meta.dirname, '..', '..');
const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const only = arg('only'), pickIds = arg('scenes')?.split(','), out = arg('out');
const device = process.argv.includes('--gpu') ? 'GPU' : 'CPU';

const started = Date.now();
for (const s of SETS) {
  if (only && s.name !== only) continue;
  let scenes = planSet(s.name, s.seed, s.rigs);
  if (pickIds) scenes = scenes.filter((x) => pickIds.includes(x.id));
  if (!scenes.length) continue;
  const dir = out ?? join(ROOT, 'tests', 'fixtures', 'blender', s.name);
  if (!pickIds && !out) rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (const x of scenes) writeFileSync(join(dir, `${x.id}.json`), JSON.stringify(x, null, 2) + '\n');
  const planPath = join(tmpdir(), `looklab-plan-${s.name}-${process.pid}.json`);
  writeFileSync(planPath, JSON.stringify({ plan_version: PLAN_VERSION, head: HEAD, render: RENDER, scenes }));
  const t = Date.now();
  execFileSync(BLENDER, ['--background', '--factory-startup', '--python', join(ROOT, 'scripts', 'blender', 'render_set.py'), '--', planPath, dir, device], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  rmSync(planPath, { force: true });
  const bytes = readdirSync(dir).reduce((n, f) => n + statSync(join(dir, f)).size, 0);
  console.log(`${s.name}: ${scenes.length} scenes in ${((Date.now() - t) / 1000).toFixed(1)} s on ${device}; ${(bytes / 1e6).toFixed(2)} MB in ${dir}`);
}
console.log(`total ${((Date.now() - started) / 1000).toFixed(1)} s`);
