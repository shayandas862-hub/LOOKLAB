// Ask may quote only numbers that are in the record (P4, D-LL-047): models choose words, not numbers (D-LL-003). Every
// number and colour code in an answer must appear in the breakdown that was sent, or in the question; standard names
// that carry digits (Rec.709, S-Log3) and Look Lab's own ids (P4.5, R5) are words, not quantities.

const STANDARD_NAMES = new RegExp(
  [
    'Rec\\.?\\s?(?:709|2020|2100)', 'BT\\.?\\s?(?:709|1886|2020|2100)', 'DCI[-\\s]?P3', 'Display\\s?P3', 'S-Log\\s?[23]',
    'S-Gamut\\s?3(?:\\.Cine)?', 'ACES(?:cct|cg|cc)?', 'sRGB', 'P\\d{1,2}(?:\\.\\d)?', '(?:AD|D|B|V|PR|P)-LL-\\d{3}', 'R\\d{1,2}', 'T[0-3]',
  ].map((s) => `\\b${s}\\b`).join('|'),
  'gi',
);
const HEX = /#[0-9a-f]{6}\b/gi;
const RATIO = /(\d+(?:\.\d+)?)\s*:\s*1\b/g;
const NUMBER = /\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g;

function numbersIn(text: string): number[] {
  return [...text.replace(RATIO, '$1').matchAll(NUMBER)].map((m) => Number(m[0].replace(/,/g, '')));
}

/** Every number in a JSON value: numbers, and numbers inside its strings ("cool −6", "2.39:1"). */
function collect(x: unknown, out: number[], hexes: Set<string>): void {
  if (typeof x === 'number') out.push(x);
  else if (typeof x === 'string') {
    for (const h of x.match(HEX) ?? []) hexes.add(h.toUpperCase());
    out.push(...numbersIn(x.replace(HEX, ' ')));
  } else if (Array.isArray(x)) x.forEach((v) => collect(v, out, hexes));
  else if (x && typeof x === 'object') Object.values(x).forEach((v) => collect(v, out, hexes));
}

/** True when `quoted`, written with its own decimals, is a rounding of a number in the record. */
function known(quoted: string, allowed: number[]): boolean {
  const q = Math.abs(Number(quoted.replace(/,/g, '')));
  const d = (quoted.split('.')[1] ?? '').length;
  return allowed.some((r) => Math.abs(Number(Math.abs(r).toFixed(d)) - q) < 1e-9);
}

/** The numbers and colour codes in `answer` that are not in `facts` or `question`, as written. Empty means it passes. */
export function foreignNumbers(answer: string, facts: unknown, question: string): string[] {
  const allowed: number[] = [];
  const hexes = new Set<string>();
  collect(facts, allowed, hexes);
  collect(question, allowed, hexes);
  const palette = (facts as { palette?: unknown[] })?.palette;
  if (Array.isArray(palette)) allowed.push(palette.length);
  const foreign: string[] = [];
  for (const h of answer.match(HEX) ?? []) if (!hexes.has(h.toUpperCase())) foreign.push(h);
  const words = answer.replace(HEX, ' ').replace(STANDARD_NAMES, ' ').replace(RATIO, '$1');
  for (const m of words.matchAll(NUMBER)) if (!known(m[0], allowed)) foreign.push(m[0]);
  return [...new Set(foreign)];
}
