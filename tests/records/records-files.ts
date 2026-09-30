// Reads the project's record files for the records tests. One job: find ids.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const ROOT = join(import.meta.dirname, '..', '..');

export function readDoc(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

export function recordMarkdownFiles(): string[] {
  const docs = readdirSync(join(ROOT, 'docs'))
    .filter((f) => f.endsWith('.md') && !f.endsWith('.local.md'))
    .map((f) => `docs/${f}`);
  const plansDir = join(ROOT, 'plans');
  const plans = existsSync(plansDir)
    ? readdirSync(plansDir).filter((f) => f.endsWith('.md')).map((f) => `plans/${f}`)
    : [];
  return [...docs, ...plans];
}

export type Defined = { kind: string; code: string; seq: number; file: string; line: number };

// An id is *defined* where its entry starts: a bold bullet (decisions) or a heading
// (progress, vision, bugs, working notes). Everywhere else it is only cited.
const DEFINITION_PATTERNS: RegExp[] = [
  /^- \*\*(D|AD|WN|ADD)-LL-(\d{3}) /,
  /^#{2,4} (PR|V|B|WN|P)-LL-(\d{3}) · /,
];

export function definedIds(): Defined[] {
  const out: Defined[] = [];
  for (const file of recordMarkdownFiles()) {
    readDoc(file).split('\n').forEach((text, i) => {
      for (const re of DEFINITION_PATTERNS) {
        const m = re.exec(text);
        if (m) out.push({ kind: m[1], code: 'LL', seq: Number(m[2]), file, line: i + 1 });
      }
    });
  }
  const plansDir = join(ROOT, 'plans');
  if (existsSync(plansDir)) {
    for (const f of readdirSync(plansDir)) {
      const m = /^P-LL-(\d{3})-/.exec(f);
      if (m) out.push({ kind: 'P', code: 'LL', seq: Number(m[1]), file: `plans/${f}`, line: 0 });
    }
  }
  return out;
}

export function citedIds(): { id: string; kind: string; seq: number; file: string }[] {
  const out: { id: string; kind: string; seq: number; file: string }[] = [];
  const re = /\b(AD|ADD|PR|WN|DOC|V|D|P|B)-LL-(\d+)\b/g;
  for (const file of recordMarkdownFiles()) {
    for (const m of readDoc(file).matchAll(re)) {
      out.push({ id: m[0], kind: m[1], seq: Number(m[2]), file });
    }
  }
  return out;
}
