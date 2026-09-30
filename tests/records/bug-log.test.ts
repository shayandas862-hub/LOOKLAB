import { describe, expect, test } from 'vitest';
import { readDoc } from './records-files';

const LABELS = ['Phase', 'Found by', 'Cause', 'Fix', 'Guard', 'Could it return?'];

function entries(md: string): { id: string; body: string }[] {
  const afterShape = md.split('\n---\n').slice(1).join('\n---\n');
  const parts = afterShape.split(/^### /m).slice(1);
  return parts.map((p) => ({ id: p.split(' ')[0], body: p }));
}

describe('bug log', () => {
  const md = readDoc('docs/bug-log.md');

  test('has Open and Closed sections', () => {
    expect(md).toMatch(/^## Open$/m);
    expect(md).toMatch(/^## Closed$/m);
  });

  test('every entry is numbered B-LL-NNN and titled "id · summary"', () => {
    for (const e of entries(md)) {
      expect(e.body.split('\n')[0]).toMatch(/^B-LL-\d{3} · \S/);
    }
  });

  test('every entry carries the six labels, in order', () => {
    for (const e of entries(md)) {
      let at = -1;
      for (const label of LABELS) {
        const i = e.body.indexOf(`- **${label}`);
        expect(i, `${e.id} is missing "${label}"`).toBeGreaterThan(at);
        at = i;
      }
    }
  });

  test('every entry rates whether it can return', () => {
    for (const e of entries(md)) {
      expect(e.body, e.id).toMatch(/- \*\*Could it return\?\*\* \**(LOW|MEDIUM|HIGH)/);
    }
  });
});
