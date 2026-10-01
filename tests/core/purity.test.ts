// AD-LL-009: src/core/ runs in the browser and in the engine, so it imports nothing from Node and never
// touches the DOM. Callers hand it pixels and bytes.
import { expect, test } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CORE = join(import.meta.dirname, '..', '..', 'src', 'core');
const FORBIDDEN = [
  /from\s+['"]node:/, /from\s+['"](fs|path|crypto|zlib|os|buffer)['"]/, /\brequire\(/,
  /\b(document|window|navigator)\./, /\b(HTMLCanvasElement|OffscreenCanvas|ImageData|Buffer|process)\b/,
];

test('no file in src/core imports Node or uses the DOM', () => {
  const bad: string[] = [];
  for (const f of readdirSync(CORE).filter((x) => x.endsWith('.ts'))) {
    const code = readFileSync(join(CORE, f), 'utf8').replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const re of FORBIDDEN) if (re.test(code)) bad.push(`${f}: ${re}`);
  }
  expect(bad).toEqual([]);
});
