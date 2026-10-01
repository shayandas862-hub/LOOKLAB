// The v0.2 prototype's own maths, run from its source as reference/v0.2/tests/core-fit.test.js does:
// the block between /*CORE-START*/ and /*CORE-END*/ in base.html, and cheekStats/statsFrom from scene.js.
// Used only to prove the port gives the same numbers. The reference folder is read, never changed.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const V02 = join(import.meta.dirname, '..', '..', 'reference', 'v0.2', 'src');

type Fn = (...a: any[]) => any;
export interface V02Core {
  renderScene: Fn;
  downsample: Fn;
  errFn: Fn;
  measureInit: Fn;
  createFit: Fn;
  KNOBS: { k: string; lo: number; hi: number; s0: number; min: number }[];
  cheekStats: Fn;
}

function fnSource(src: string, name: string): string {
  const start = src.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`v0.2: ${name} not found`);
  let depth = 0;
  for (let i = src.indexOf('{', start); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return src.slice(start, i + 1);
  }
  throw new Error(`v0.2: ${name} is not closed`);
}

export function loadV02(): V02Core {
  const html = readFileSync(join(V02, 'base.html'), 'utf8');
  const core = html.split('/*CORE-START*/')[1].split('/*CORE-END*/')[0];
  const scene = readFileSync(join(V02, 'scene.js'), 'utf8');
  const cheek = fnSource(scene, 'cheekStats') + '\n' + fnSource(scene, 'statsFrom');
  // eslint-disable-next-line no-new-func
  return new Function(`${core}\n${cheek}\nreturn { renderScene, downsample, errFn, measureInit, createFit, KNOBS, cheekStats };`)() as V02Core;
}
