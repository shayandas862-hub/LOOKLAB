#!/usr/bin/env node
// Checks every marketing/posts/<post_id>/manifest.json against the files beside it (the standard: README.md).
//   node marketing/verify.mjs          report; exits 1 if anything is wrong
//   node marketing/verify.mjs --fill   write bytes and sha256: any file in a ready manifest, only new files in a published one
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const POSTS = join(dirname(fileURLToPath(import.meta.url)), 'posts');
const FILL = process.argv.includes('--fill');
const MAX_BYTES = 95 * 1024 * 1024;
const ID = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(-[a-z0-9]+)*$/;
const REQUIRED = ['post_id', 'title', 'channel', 'format', 'status', 'files', 'sources', 'numbers'];

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

let failures = 0;
const fail = (id, msg) => { failures++; console.log(`  ✗ ${id}: ${msg}`); };

for (const id of readdirSync(POSTS).sort()) {
  const dir = join(POSTS, id);
  if (!statSync(dir).isDirectory()) continue;
  const before = failures;
  const path = join(dir, 'manifest.json');
  if (!existsSync(path)) { fail(id, 'no manifest.json'); continue; }
  const m = JSON.parse(readFileSync(path, 'utf8'));
  const published = m.status === 'published';

  if (!ID.test(id)) fail(id, 'folder name is not YYYY-MM-DD-slug');
  if (m.post_id !== id) fail(id, `post_id "${m.post_id}" differs from the folder name`);
  for (const k of REQUIRED) if (!(k in m)) fail(id, `missing field "${k}"`);
  if (!['ready', 'published'].includes(m.status)) fail(id, `status "${m.status}" is not ready or published`);
  if (published && !(m.post_url && m.published_at)) fail(id, 'published, but post_url or published_at is empty');
  if (published && m.published_at && !id.startsWith(m.published_at.slice(0, 10))) {
    fail(id, `published ${m.published_at.slice(0, 10)}, but the id carries another date`);
  }

  let changed = false;
  for (const f of m.files ?? []) {
    const p = join(dir, f.path);
    if (!existsSync(p)) { fail(id, `${f.path} is listed but not here`); continue; }
    const bytes = statSync(p).size;
    if (bytes > MAX_BYTES) fail(id, `${f.path} is ${(bytes / 2 ** 20).toFixed(1)} MB, over the 95 MB limit`);
    const hash = sha256(p);
    if (FILL && (!published || f.sha256 === undefined) && (f.sha256 !== hash || f.bytes !== bytes)) {
      Object.assign(f, { bytes, sha256: hash }); changed = true; continue;
    }
    if (f.bytes !== bytes) fail(id, `${f.path} is ${bytes} bytes, the manifest says ${f.bytes}`);
    if (f.sha256 !== hash) fail(id, `${f.path} hash differs from the manifest: not the archived file`);
  }
  for (const f of readdirSync(dir, { recursive: true })) {
    const rel = String(f).split('\\').join('/');
    if (rel === 'manifest.json' || statSync(join(dir, rel)).isDirectory()) continue;
    if (!(m.files ?? []).some((x) => x.path === rel)) fail(id, `${rel} is here but not in the manifest`);
  }
  for (const n of m.numbers ?? []) if (!n.claim || !n.source) fail(id, 'a number without its claim or source');
  for (const s of m.sources ?? []) if (!s.what || !s.path) fail(id, 'a source without what or path');

  if (changed) { writeFileSync(path, JSON.stringify(m, null, 2) + '\n'); console.log(`  ✎ ${id}: sizes and hashes written`); }
  const gaps = (m.missing ?? []).length;
  console.log(`  ${failures > before ? '✗' : '✓'} ${id}  ${m.status}  ${(m.files ?? []).length} files${gaps ? `  (${gaps} missing, see manifest)` : ''}`);
}

if (failures) { console.log(`\n${failures} problem(s).`); process.exit(1); }
console.log('\nAll manifests match their files.');
