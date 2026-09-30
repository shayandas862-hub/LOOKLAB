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

  test('stores binary frames beside records, lists them sorted, and removes a folder of them (P2)', async () => {
    const s = make();
    const col = 'projects/neel/references/ref-1/frames';
    await s.putBlob(col, '00001.png', new Uint8Array([4, 5, 6]));
    await s.putBlob(col, '00000.png', new Uint8Array([1, 2, 3]));
    expect([...(await s.getBlob(col, '00000.png'))!]).toEqual([1, 2, 3]);
    expect(await s.getBlob(col, '00009.png')).toBeNull();
    expect(await s.listBlobs(col)).toEqual(['00000.png', '00001.png']);
    await s.put('projects/neel/references', 'ref-1', { id: 'ref-1' });
    expect(await s.list('projects/neel/references')).toEqual([{ id: 'ref-1' }]);
    await s.removeBlobs(col);
    expect(await s.listBlobs(col)).toEqual([]);
    expect(await s.listBlobs('nothing/here')).toEqual([]);
  });

  test('refuses frame names that are not <id>.png or could escape the store', async () => {
    const s = make();
    for (const bad of ['../x.png', 'a/b.png', '.png', 'x.json', 'x.png/..', 'x']) {
      await expect(s.putBlob('ok', bad, new Uint8Array([1]))).rejects.toThrow(/invalid/);
    }
    await expect(s.putBlob('../up', 'x.png', new Uint8Array([1]))).rejects.toThrow(/invalid/);
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

  test('frames are private too (file 0600, folder 0700), with no temp files left behind', async () => {
    const s = new FileStore(dir);
    await s.putBlob('projects/neel/references/ref-1/frames', '00000.png', new Uint8Array([1]));
    const folder = join(dir, 'projects', 'neel', 'references', 'ref-1', 'frames');
    expect(readdirSync(folder)).toEqual(['00000.png']);
    expect(statSync(join(folder, '00000.png')).mode & 0o777).toBe(0o600);
    expect(statSync(folder).mode & 0o777).toBe(0o700);
  });
});
