// Turns the design's inline CSS strings into React style objects. Cached: views re-render often.
import type { CSSProperties } from 'react';

const cache = new Map<string, CSSProperties>();
const LIMIT = 5000;

function splitDeclarations(css: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (quote) {
      if (c === quote) quote = '';
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ';' && depth === 0) {
      out.push(css.slice(start, i));
      start = i + 1;
    }
  }
  out.push(css.slice(start));
  return out;
}

const camel = (p: string) => (p.startsWith('--') ? p : p.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()));

export function parseStyle(css: string): CSSProperties {
  const style: Record<string, string> = {};
  for (const decl of splitDeclarations(css)) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    if (prop && value) style[camel(prop)] = value;
  }
  return style as CSSProperties;
}

export function sx(css: string | undefined | null): CSSProperties | undefined {
  if (!css) return undefined;
  let s = cache.get(css);
  if (!s) {
    if (cache.size > LIMIT) cache.clear();
    s = parseStyle(css);
    cache.set(css, s);
  }
  return s;
}
