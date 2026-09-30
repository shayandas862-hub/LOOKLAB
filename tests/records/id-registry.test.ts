import { describe, expect, test } from 'vitest';
import { citedIds, definedIds, readDoc } from './records-files';

type Registry = {
  code: string;
  kinds: Record<string, string>;
  allocated: Record<string, number>;
  assigned: { document: Record<string, string> };
};

const registry: Registry = JSON.parse(readDoc('docs/id-registry.json'));
const kindByCode = Object.fromEntries(Object.entries(registry.kinds).map(([k, c]) => [c, k]));

describe('id registry', () => {
  test('claims the project code LL', () => {
    expect(registry.code).toBe('LL');
  });

  test('every defined id is unique', () => {
    const seen = new Map<string, string>();
    for (const d of definedIds()) {
      const id = `${d.kind}-LL-${String(d.seq).padStart(3, '0')}`;
      expect(seen.has(id), `${id} defined twice: ${seen.get(id)} and ${d.file}:${d.line}`).toBe(false);
      seen.set(id, `${d.file}:${d.line}`);
    }
  });

  test('allocated high-water marks equal the highest defined id of each kind', () => {
    const highest: Record<string, number> = {};
    for (const d of definedIds()) {
      const kind = kindByCode[d.kind];
      highest[kind] = Math.max(highest[kind] ?? 0, d.seq);
    }
    for (const [kind, mark] of Object.entries(registry.allocated)) {
      if (kind === 'document') continue;
      expect(highest[kind] ?? 0, `allocated.${kind}`).toBe(mark);
    }
  });

  test('document numbers come from the assigned table', () => {
    const keys = Object.keys(registry.assigned.document).map(Number);
    expect(Math.max(0, ...keys)).toBe(registry.allocated.document);
  });

  test('no document cites an id beyond the register', () => {
    for (const c of citedIds()) {
      const kind = kindByCode[c.kind];
      expect(c.seq, `${c.id} in ${c.file} is past allocated.${kind}`).toBeLessThanOrEqual(
        registry.allocated[kind],
      );
    }
  });

  test('ids are zero-padded to three digits', () => {
    for (const c of citedIds()) {
      expect(c.id, `${c.id} in ${c.file}`).toMatch(/-LL-\d{3}$/);
    }
  });
});
