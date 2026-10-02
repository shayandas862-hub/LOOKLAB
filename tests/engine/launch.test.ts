// One list of Node flags starts the engine everywhere: `npm start`, `npm run engine`, and both measure scripts (B-LL-004).
// The engine runs with a 1 MB young generation (--max-semi-space-size=1) so an import's short-lived decode buffers do not
// grow the heap that V8 then keeps while idle.
import { afterEach, expect, test } from 'vitest';
import { spawn, execFileSync, type ChildProcess } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
let child: ChildProcess | null = null;
let home = '';

let enginePid = 0;

afterEach(() => {
  child?.kill();
  if (enginePid) try { process.kill(enginePid); } catch { /* already gone */ }
  if (home) rmSync(home, { recursive: true, force: true });
});

const alive = (pid: number) => { try { process.kill(pid, 0); return true; } catch { return false; } };

async function startLauncher(): Promise<number> {
  home = mkdtempSync(join(tmpdir(), 'looklab-launch-'));
  const port = 40000 + Math.floor(Math.random() * 20000);
  child = spawn(process.execPath, ['bin/looklab.mjs', 'engine'], {
    cwd: ROOT,
    env: { ...process.env, LOOKLAB_HOME: home, LOOKLAB_PORT: String(port) },
  });
  let out = '';
  child.stdout!.on('data', (d) => (out += d));
  child.stderr!.on('data', (d) => (out += d));
  const started = await new Promise<boolean>((resolve) => {
    const t = setTimeout(() => resolve(false), 15_000);
    child!.stdout!.on('data', () => out.includes('running at') && (clearTimeout(t), resolve(true)));
    child!.on('exit', () => (clearTimeout(t), resolve(false)));
  });
  expect(started, out).toBe(true);
  // The launcher spawns the engine as its child.
  enginePid = Number(execFileSync('pgrep', ['-P', String(child.pid)]).toString().trim().split('\n')[0]);
  return enginePid;
}

test('the shared flag list holds type stripping and the 1 MB young generation (B-LL-004)', () => {
  const flags: string[] = JSON.parse(read('src/engine/node-flags.json'));
  expect(flags).toContain('--experimental-strip-types');
  expect(flags).toContain('--max-semi-space-size=1');
});

test('every launcher reads the shared list and none types its own (B-LL-004)', () => {
  for (const file of ['bin/looklab.mjs', 'scripts/measure-import.ts', 'scripts/measure-fit.ts', 'tests/engine/boot.test.ts']) {
    const src = read(file);
    expect(src, file).toMatch(/node-flags\.json/);
    expect(src, file).not.toMatch(/\[\s*'--experimental-strip-types'/);
  }
  expect(JSON.parse(read('package.json')).scripts.engine).toBe('node bin/looklab.mjs engine');
});

test('`npm run engine` starts an engine process that runs with --max-semi-space-size=1 (B-LL-004)', async () => {
  const pid = await startLauncher();
  const args = execFileSync('ps', ['-o', 'args=', '-p', String(pid)]).toString();
  expect(args).toContain('--max-semi-space-size=1');
  expect(args).toContain('src/engine/main.ts');
});

test('stopping the launcher with SIGTERM stops its engine too; no orphan keeps the port (B-LL-005)', async () => {
  const pid = await startLauncher();
  child!.kill('SIGTERM');
  for (let i = 0; i < 50 && alive(pid); i++) await new Promise((r) => setTimeout(r, 100));
  expect(alive(pid)).toBe(false);
});
