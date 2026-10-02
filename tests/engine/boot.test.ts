// Boots the engine exactly as `npm start` does: plain Node with type stripping, no bundler.
// Guards B-LL-001: vitest transpiles TypeScript itself, so syntax Node cannot strip passed every other test.
import { afterEach, expect, test } from 'vitest';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import NODE_FLAGS from '../../src/engine/node-flags.json' with { type: 'json' };

const ROOT = join(import.meta.dirname, '..', '..');
let child: ChildProcess | null = null;
let home = '';

afterEach(() => {
  child?.kill();
  if (home) rmSync(home, { recursive: true, force: true });
});

test('the engine starts under node --experimental-strip-types and serves the API (B-LL-001)', async () => {
  home = mkdtempSync(join(tmpdir(), 'looklab-boot-'));
  const port = 40000 + Math.floor(Math.random() * 20000);
  child = spawn(process.execPath, [...NODE_FLAGS, 'src/engine/main.ts'], {
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
  const r = await fetch(`http://127.0.0.1:${port}/api/session`, { headers: { 'sec-fetch-site': 'same-origin' } });
  expect(r.status).toBe(200);
});
