// Entry point: `node --experimental-strip-types src/engine/main.ts` (bin/looklab.mjs runs this).
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { startEngine } from './engine.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const home = process.env.LOOKLAB_HOME ?? join(homedir(), 'LookLab');
const port = Number(process.env.LOOKLAB_PORT ?? 4317);
const uiDir = join(root, 'dist', 'ui');

try {
  const engine = await startEngine({ home, port, uiDir: existsSync(uiDir) ? uiDir : undefined });
  console.log(`Look Lab engine running at ${engine.url}`);
  console.log(`Data folder: ${home}`);
  const stop = async () => {
    await engine.close();
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
} catch (e) {
  const err = e as NodeJS.ErrnoException;
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is in use. Is Look Lab already running? Set LOOKLAB_PORT to use another port.`);
  } else {
    console.error(`Look Lab could not start: ${err.message}`);
  }
  process.exit(1);
}
