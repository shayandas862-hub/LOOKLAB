// Every command in the registry must be reachable from a control on its screen, not only from ⌘K (AD-LL-002).
import { expect, test } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildRegistry } from '../../src/actions/index.ts';

const LOGIC = join(import.meta.dirname, '..', '..', 'src', 'ui', 'logic');
const source = readdirSync(LOGIC)
  .filter((f) => f.endsWith('.logic.tsx'))
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
  for (const f of readdirSync(LOGIC).filter((x) => x.endsWith('.logic.tsx'))) {
    const s = readFileSync(join(LOGIC, f), 'utf8');
    if (/label:\s*'MEASURED'|label:\s*`AI \$\{/.test(s)) expect(s, f).toContain('sampleBadge(');
  }
});

test('views with typed source badges have logic that relabels them (D-LL-015)', () => {
  const VIEWS = join(import.meta.dirname, '..', '..', 'src', 'ui', 'views');
  for (const f of readdirSync(VIEWS).filter((x) => x.endsWith('.view.tsx'))) {
    if (!readFileSync(join(VIEWS, f), 'utf8').includes('v.badgeText')) continue;
    const logic = readFileSync(join(LOGIC, f.replace('.view.tsx', '.logic.tsx')), 'utf8');
    expect(logic, f).toContain('badgeText: sampleBadgeText');
  }
});
