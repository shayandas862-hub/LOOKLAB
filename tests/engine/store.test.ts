import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileStore, MemoryStore, type Store } from '../../src/engine/store.ts';

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'looklab-store-'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

const stores: [string, () => Store][] = [
  ['MemoryStore', () => new MemoryStore()],
  ['FileStore', () => new FileStore(dir)],
];

describe.each(stores)('%s', (_name, make) => {
  test('put then get returns an equal record; missing is null', async () => {
    const s = make();
    await s.put('projects/neel/plans', '12C', { a: 1, b: [2, 3] });
    expect(await s.get('projects/neel/plans', '12C')).toEqual({ a: 1, b: [2, 3] });
    expect(await s.get('projects/neel/plans', 'nope')).toBeNull();
  });

  test('list returns every record in a collection, sorted by id', async () => {
    const s = make();
    await s.put('looks', 'b', { n: 2 });
    await s.put('looks', 'a', { n: 1 });
    expect(await s.list('looks')).toEqual([{ n: 1 }, { n: 2 }]);
    expect(await s.list('empty')).toEqual([]);
  });

  test('remove deletes a record', async () => {
    const s = make();
    await s.put('looks', 'a', { n: 1 });
    await s.remove('looks', 'a');
    expect(await s.get('looks', 'a')).toBeNull();
  });

  test('append and read a stream, newest last, with a limit from the end', async () => {
    const s = make();
    for (let i = 0; i < 5; i++) await s.append('decisions', { i });
    expect(await s.readStream('decisions')).toEqual([0, 1, 2, 3, 4].map((i) => ({ i })));
    expect(await s.readStream('decisions', 2)).toEqual([{ i: 3 }, { i: 4 }]);
  });

  test('refuses collection and id names that could escape the store', async () => {
    const s = make();
    for (const bad of ['../x', 'a/../../b', '/etc', 'a b', '']) {
      await expect(s.put(bad, 'x', {})).rejects.toThrow(/invalid/);
    }
    for (const bad of ['..', '../x', 'a/b', '.hidden', '']) {
      await expect(s.put('ok', bad, {})).rejects.toThrow(/invalid/);
    }
  });
});

describe('FileStore on disk', () => {
  test('writes readable JSON files with no temp files left behind', async () => {
    const s = new FileStore(dir);
    await s.put('projects', 'neel', { name: 'Neel' });
    expect(readdirSync(join(dir, 'projects'))).toEqual(['neel.json']);
  });

  test('files are private to the user (mode 0600)', async () => {
    const s = new FileStore(dir);
    await s.put('projects', 'neel', { name: 'Neel' });
    expect(statSync(join(dir, 'projects', 'neel.json')).mode & 0o777).toBe(0o600);
  });
});
