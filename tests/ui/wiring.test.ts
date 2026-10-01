// Every command in the registry must be reachable from a control on its screen, not only from ⌘K (AD-LL-002).
import { expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildRegistry } from '../../src/actions/index.ts';

const LOGIC = join(import.meta.dirname, '..', '..', 'src', 'ui', 'logic');
// A screen's logic is its `.logic.tsx` plus the helper modules beside it (`Breakdown.rows.ts`, …).
const isLogic = (f: string) => f.endsWith('.logic.tsx') || (f.endsWith('.ts') && f !== 'screens.ts');
const source = readdirSync(LOGIC)
  .filter(isLogic)
  .map((f) => readFileSync(join(LOGIC, f), 'utf8'))
  .join('\n');

// Navigation commands are run by the shell's sidebar and ⌘K, which build them from the registry.
const SHELL_ONLY = /^app\./;

test('every command is called by name from a screen', () => {
  const missing = buildRegistry()
    .list()
    .filter((a) => a.command !== false && !SHELL_ONLY.test(a.name))
    .filter((a) => !source.includes(`'${a.name}'`))
    .map((a) => a.name);
  expect(missing).toEqual([]);
});

test('no screen calls a command that does not exist', () => {
  const names = new Set(buildRegistry().list().map((a) => a.name));
  const called = [...source.matchAll(/run\('([a-z]+\.[a-z0-9_]+)'/g)].map((m) => m[1]);
  expect(called.filter((n) => !names.has(n))).toEqual([]);
});

test('screens never draw the design\'s MEASURED or AI badge on sample data (D-LL-015)', () => {
  // A badge constant may exist, but it must go through sampleBadge() while the screen is on sample data.
  for (const f of readdirSync(LOGIC).filter(isLogic)) {
    const s = readFileSync(join(LOGIC, f), 'utf8');
    if (/label:\s*'MEASURED'|label:\s*`AI \$\{/.test(s)) expect(s, f).toContain('sampleBadge(');
  }
});

test('views with typed source badges have logic that relabels them (D-LL-015)', () => {
  const VIEWS = join(import.meta.dirname, '..', '..', 'src', 'ui', 'views');
  for (const f of readdirSync(VIEWS).filter((x) => x.endsWith('.view.tsx'))) {
    if (!readFileSync(join(VIEWS, f), 'utf8').includes('v.badgeText')) continue;
    const logic = readFileSync(join(LOGIC, f.replace('.view.tsx', '.logic.tsx')), 'utf8');
    // Either every typed badge reads SAMPLE, or a partly real screen routes the rest through sampleBadgeText
    // (Breakdown in P2: the palette's badge follows its real source; the AI badges stay SAMPLE).
    expect(logic, f).toMatch(/badgeText: sampleBadgeText|badgeText: \(label\) => [^\n]*sampleBadgeText\(label\)/);
  }
});

test('the Breakdown shows each value\'s own source, not the design\'s badge (P2)', () => {
  const s = readdirSync(LOGIC).filter((f) => f.startsWith('Breakdown.') && isLogic(f)).map((f) => readFileSync(join(LOGIC, f), 'utf8')).join('\n');
  expect(s).not.toMatch(/const PAL = \[/);
  expect(s).not.toMatch(/'ai',\s*\d{2}\]/);
  expect(s).toContain("run('breakdown.analyse'");
  expect(s).toContain("run('breakdown.add_frame'");
  expect(s).toContain("run('breakdown.set_subject'");
});
