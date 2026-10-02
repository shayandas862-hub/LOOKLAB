#!/usr/bin/env node
// Look Lab CLI: start, dev, engine, mcp-setup, run <action> [json].
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HOME = process.env.LOOKLAB_HOME ?? join(homedir(), 'LookLab');
const PORT = Number(process.env.LOOKLAB_PORT ?? 4317);
// The engine's Node flags, shared with the measure scripts and the boot test (B-LL-004: a 1 MB young generation).
const NODE_FLAGS = JSON.parse(readFileSync(join(ROOT, 'src', 'engine', 'node-flags.json'), 'utf8'));

function checkNode() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 6)) {
    console.error(`Look Lab needs Node 22.6 or newer (you have ${process.versions.node}). Install it from https://nodejs.org`);
    process.exit(1);
  }
}

function newest(dir) {
  let t = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    t = Math.max(t, s.isDirectory() ? newest(p) : s.mtimeMs);
  }
  return t;
}

function buildUiIfStale() {
  const index = join(ROOT, 'dist', 'ui', 'index.html');
  const sources = Math.max(newest(join(ROOT, 'src', 'ui')), newest(join(ROOT, 'src', 'contracts')));
  if (existsSync(index) && statSync(index).mtimeMs >= sources) return;
  console.log('Building the UI…');
  const r = spawnSync(process.execPath, [join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js'), 'build'], { cwd: ROOT, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function engine(extraEnv = {}) {
  const child = spawn(process.execPath, [...NODE_FLAGS, join(ROOT, 'src', 'engine', 'main.ts')], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, LOOKLAB_HOME: HOME, LOOKLAB_PORT: String(PORT), ...extraEnv },
  });
  // A signal sent to the launcher alone (a process manager, `kill`) reaches the engine too, so none is orphaned (B-LL-005).
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
  return child;
}

async function waitFor(url, tries = 50) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

const [cmd, ...args] = process.argv.slice(2);
checkNode();

if (cmd === 'start' || !cmd) {
  buildUiIfStale();
  const child = engine();
  const url = `http://127.0.0.1:${PORT}`;
  if (await waitFor(url) && !process.env.LOOKLAB_NO_OPEN) spawn('open', [url], { stdio: 'ignore' });
  child.on('exit', (code) => process.exit(code ?? 0));
} else if (cmd === 'engine') {
  // The engine alone, in the foreground (npm run engine): no UI build, no browser.
  const child = engine();
  child.on('exit', (code) => process.exit(code ?? 0));
} else if (cmd === 'dev') {
  const child = engine();
  const vite = spawn(process.execPath, [join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js')], { cwd: ROOT, stdio: 'inherit' });
  const stop = () => {
    child.kill();
    vite.kill();
  };
  process.on('SIGINT', stop);
  child.on('exit', stop);
  vite.on('exit', stop);
} else if (cmd === 'mcp-setup') {
  const tokenPath = join(HOME, 'token');
  const quoted = `'${tokenPath.replace(/'/g, `'\\''`)}'`;
  console.log('Start Look Lab first (npm start), then run this once in a terminal:\n');
  console.log(`claude mcp add --transport http looklab http://127.0.0.1:${PORT}/mcp --header "Authorization: Bearer $(cat ${quoted})"\n`);
  console.log('The token stays in the file; the command reads it, so it is never printed.');
} else if (cmd === 'run') {
  const [action, json = '{}'] = args;
  if (!action) {
    console.error('usage: looklab run <action> [json]    e.g. looklab run plan.get \'{"shot_id":"12C"}\'');
    process.exit(2);
  }
  const token = readFileSync(join(HOME, 'token'), 'utf8').trim();
  const list = await fetch(`http://127.0.0.1:${PORT}/api/actions`, { headers: { 'x-looklab-token': token } }).catch(() => null);
  if (!list) {
    console.error('Look Lab is not running. Start it with: npm start');
    process.exit(1);
  }
  const info = (await list.json()).actions.find((a) => a.name === action);
  // Actions that need a person's approval (D-LL-017) ask at a real terminal; a script or agent has none.
  if (info?.confirm) {
    if (!process.stdin.isTTY) {
      console.error(`${action} needs a person's approval. Run it in an interactive terminal or from the Look Lab window.`);
      process.exit(3);
    }
    const { createInterface } = await import('node:readline/promises');
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question(`${info.title}: ${info.description}\nType yes to approve: `);
    rl.close();
    if (answer.trim().toLowerCase() !== 'yes') {
      console.error('Not approved; nothing was changed.');
      process.exit(3);
    }
  }
  const r = await fetch(`http://127.0.0.1:${PORT}/api/actions/${action}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-looklab-token': token, 'x-looklab-via': 'cli' },
    body: json,
  }).catch(() => null);
  if (!r) {
    console.error('Look Lab is not running. Start it with: npm start');
    process.exit(1);
  }
  console.log(JSON.stringify(await r.json(), null, 2));
  process.exit(r.ok ? 0 : 1);
} else {
  console.error(`unknown command "${cmd}". Commands: start, dev, engine, mcp-setup, run`);
  process.exit(2);
}
