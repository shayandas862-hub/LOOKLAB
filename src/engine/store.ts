// The store seam (AD-LL-005): JSON records by collection and id, plus append-only streams.
import { mkdir, readFile, readdir, rename, rm, writeFile, appendFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface Store {
  get<T = unknown>(collection: string, id: string): Promise<T | null>;
  put(collection: string, id: string, doc: unknown): Promise<void>;
  list<T = unknown>(collection: string): Promise<T[]>;
  remove(collection: string, id: string): Promise<void>;
  append(stream: string, row: unknown): Promise<void>;
  readStream<T = unknown>(stream: string, limit?: number): Promise<T[]>;
}

const SEGMENT = /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/;

function checkCollection(c: string): void {
  if (!c || !c.split('/').every((s) => SEGMENT.test(s))) throw new Error(`invalid collection name "${c}"`);
}
function checkId(id: string): void {
  if (!SEGMENT.test(id)) throw new Error(`invalid record id "${id}"`);
}

const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));

export class MemoryStore implements Store {
  private data = new Map<string, Map<string, unknown>>();
  private streams = new Map<string, unknown[]>();

  async get<T>(c: string, id: string): Promise<T | null> {
    checkCollection(c);
    checkId(id);
    const v = this.data.get(c)?.get(id);
    return v === undefined ? null : clone(v as T);
  }
  async put(c: string, id: string, doc: unknown): Promise<void> {
    checkCollection(c);
    checkId(id);
    if (!this.data.has(c)) this.data.set(c, new Map());
    this.data.get(c)!.set(id, clone(doc));
  }
  async list<T>(c: string): Promise<T[]> {
    checkCollection(c);
    const m = this.data.get(c);
    if (!m) return [];
    return [...m.keys()].sort().map((k) => clone(m.get(k) as T));
  }
  async remove(c: string, id: string): Promise<void> {
    checkCollection(c);
    checkId(id);
    this.data.get(c)?.delete(id);
  }
  async append(s: string, row: unknown): Promise<void> {
    checkCollection(s);
    if (!this.streams.has(s)) this.streams.set(s, []);
    this.streams.get(s)!.push(clone(row));
  }
  async readStream<T>(s: string, limit?: number): Promise<T[]> {
    checkCollection(s);
    const rows = (this.streams.get(s) ?? []) as T[];
    return clone(limit ? rows.slice(-limit) : rows);
  }
}

export class FileStore implements Store {
  private root: string;
  constructor(root: string) {
    this.root = root;
  }

  private file(c: string, id: string): string {
    checkCollection(c);
    checkId(id);
    return join(this.root, ...c.split('/'), `${id}.json`);
  }

  async get<T>(c: string, id: string): Promise<T | null> {
    try {
      return JSON.parse(await readFile(this.file(c, id), 'utf8')) as T;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw e;
    }
  }

  async put(c: string, id: string, doc: unknown): Promise<void> {
    const path = this.file(c, id);
    const dir = join(this.root, ...c.split('/'));
    await mkdir(dir, { recursive: true, mode: 0o700 });
    const tmp = join(dir, `.${id}.${process.pid}.${Date.now()}.tmp`);
    await writeFile(tmp, JSON.stringify(doc, null, 2) + '\n', { mode: 0o600 });
    await rename(tmp, path);
  }

  async list<T>(c: string): Promise<T[]> {
    checkCollection(c);
    let names: string[];
    try {
      names = await readdir(join(this.root, ...c.split('/')));
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw e;
    }
    const ids = names.filter((n) => n.endsWith('.json') && !n.startsWith('.')).map((n) => n.slice(0, -5)).sort();
    const out: T[] = [];
    for (const id of ids) {
      const v = await this.get<T>(c, id);
      if (v !== null) out.push(v);
    }
    return out;
  }

  async remove(c: string, id: string): Promise<void> {
    await rm(this.file(c, id), { force: true });
  }

  private streamFile(s: string): string {
    checkCollection(s);
    return join(this.root, ...s.split('/')) + '.jsonl';
  }

  async append(s: string, row: unknown): Promise<void> {
    const path = this.streamFile(s);
    await mkdir(join(path, '..'), { recursive: true, mode: 0o700 });
    await appendFile(path, JSON.stringify(row) + '\n', { mode: 0o600 });
  }

  async readStream<T>(s: string, limit?: number): Promise<T[]> {
    let text: string;
    try {
      text = await readFile(this.streamFile(s), 'utf8');
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw e;
    }
    const rows = text.split('\n').filter(Boolean).map((l) => JSON.parse(l) as T);
    return limit ? rows.slice(-limit) : rows;
  }
}
