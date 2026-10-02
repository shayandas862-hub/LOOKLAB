// P3 end to end in a real Chrome: import a committed Blender render, drag a box around the face, press Fit light.
// The light rows read as an estimate (never MEASURED, and no longer SAMPLE), the marker names exactly what is
// still sample, and nothing on the screen claims accuracy on real footage. Then a still whose EXIF records its
// focal length: the Focal length row reads METADATA. Skips, and says so, without Chrome.
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { crc32 } from 'node:zlib';
import type { Browser, Page } from 'playwright-core';
import { blockedByOffline, CHROME, launchChrome, offlinePage } from './chrome.ts';
import { startEngine, type Engine } from '../../src/engine/engine.ts';

const ROOT = join(import.meta.dirname, '..', '..');
const UI = join(ROOT, 'dist', 'ui');
const SCENE = join(ROOT, 'tests', 'fixtures', 'blender', 'test', 'test-03-light');
const TRUTH = JSON.parse(readFileSync(`${SCENE}.json`, 'utf8'));
const canRun = existsSync(CHROME) && existsSync(join(UI, 'index.html'));
if (!canRun) console.warn('[e2e] skipped: needs Google Chrome in /Applications and a built UI (npm run build)');

let home: string;
let engine: Engine;
let browser: Browser;
let page: Page;
const errors: string[] = [];

async function api<T = any>(action: string, input: object = {}): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const token = readFileSync(join(home, 'token'), 'utf8').trim();
  const r = await fetch(`${engine.url}/api/actions/${action}`, { method: 'POST', headers: { 'x-looklab-token': token, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  const body = await r.json();
  if (!r.ok) throw new Error(`${action}: ${body.message}`);
  return body.result as T;
}

/** The value and badge of a labelled row in the right panel. */
async function row(label: string): Promise<{ value: string; badge: string }> {
  return page.$$eval('aside div', (els, l) => {
    for (const e of els) {
      const kids = [...e.children] as HTMLElement[];
      if (kids.length >= 3 && kids[0].innerText.trim() === l) return { value: kids[1].innerText.trim(), badge: kids[kids.length - 1].innerText.trim() };
    }
    return { value: '', badge: '' };
  }, label);
}

async function importFile(files: string | { name: string; mimeType: string; buffer: Buffer }) {
  await page.getByRole('button', { name: 'Replace reference' }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Browse files' }).click();
  await (await chooser).setFiles(files);
  await page.waitForFunction(() => {
    const t = document.querySelector('main')?.textContent ?? '';
    return !t.includes('Analysing reference') && !t.includes('Reading frames') && /MEASURED/.test(t);
  }, null, { timeout: 60_000 });
}

/** Where a point of the picture (fractions) is on the page: the frame is drawn `fit: contain` in the design's box. */
async function onPage(fx: number, fy: number) {
  const img = page.locator('img[src^="data:image/png"]');
  const bb = (await img.boundingBox())!;
  const n = await img.evaluate((e) => ({ w: (e as HTMLImageElement).naturalWidth, h: (e as HTMLImageElement).naturalHeight }));
  const s = Math.min(bb.width / n.w, bb.height / n.h), cw = n.w * s, ch = n.h * s;
  return { x: bb.x + (bb.width - cw) / 2 + fx * cw, y: bb.y + (bb.height - ch) / 2 + fy * ch };
}

/** A copy of a PNG with an eXIf chunk after IHDR: FocalLength 50 mm, FocalLengthIn35mmFilm 75 mm (little-endian TIFF). */
function pngWithExif(png: Buffer): Buffer {
  const t = Buffer.alloc(8 + 18 + 2 + 24 + 4 + 8);
  t.write('II', 0); t.writeUInt16LE(42, 2); t.writeUInt32LE(8, 4);
  t.writeUInt16LE(1, 8); t.writeUInt16LE(0x8769, 10); t.writeUInt16LE(4, 12); t.writeUInt32LE(1, 14); t.writeUInt32LE(26, 18); t.writeUInt32LE(0, 22);
  t.writeUInt16LE(2, 26);
  t.writeUInt16LE(0x920a, 28); t.writeUInt16LE(5, 30); t.writeUInt32LE(1, 32); t.writeUInt32LE(56, 36);
  t.writeUInt16LE(0xa405, 40); t.writeUInt16LE(3, 42); t.writeUInt32LE(1, 44); t.writeUInt16LE(75, 48);
  t.writeUInt32LE(0, 52); t.writeUInt32LE(50, 56); t.writeUInt32LE(1, 60);
  const type = Buffer.from('eXIf'), len = Buffer.alloc(4), crc = Buffer.alloc(4);
  len.writeUInt32BE(t.length);
  crc.writeUInt32BE(crc32(Buffer.concat([type, t])));
  return Buffer.concat([png.subarray(0, 33), len, type, t, crc, png.subarray(33)]);
}

describe.skipIf(!canRun)('Light and lens in Chrome (P3)', () => {
  beforeAll(async () => {
    home = mkdtempSync(join(tmpdir(), 'looklab-p3-'));
    engine = await startEngine({ home, port: 0, uiDir: UI, quiet: true, rateLimit: { perSecond: 200, burst: 400 } });
    browser = await launchChrome();
    page = await offlinePage(browser, { viewport: { width: 1440, height: 900 } });
    page.on('console', (m) => m.type() === 'error' && !m.text().includes('fonts.g') && !blockedByOffline(m.text()) && !m.text().includes('400 (Bad Request)') && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(engine.url);
    await page.waitForSelector('[data-screen-label="Breakdown"]');
  }, 30_000);

  afterAll(async () => {
    await browser?.close();
    await engine?.close();
    rmSync(home, { recursive: true, force: true });
  });

  test('a Blender render imports and measures; the light is still sample, and Fit light works with no AI connected', async () => {
    await importFile(`${SCENE}.png`);
    expect((await row('Key azimuth')).badge).toBe('SAMPLE');
    const fit = page.getByRole('button', { name: 'Fit light', exact: true });
    expect(await fit.isEnabled()).toBe(true);
    expect(await page.locator('main').innerText()).not.toContain('Fit light (AI)');
  }, 90_000);

  test('Fit light before a face is marked is refused, and the screen says how to mark one', async () => {
    await page.getByRole('button', { name: 'Fit light', exact: true }).click();
    await page.waitForFunction(() => /no face box/.test(document.body.innerText), null, { timeout: 5000 });
    expect((await row('Key azimuth')).badge).toBe('SAMPLE');
  });

  test('a drag around the face marks it by hand', async () => {
    const f = TRUTH.face_box;
    const a = await onPage(f.x, f.y), b = await onPage(f.x + f.w, f.y + f.h);
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move(b.x, b.y, { steps: 12 });
    await page.mouse.up();
    await page.waitForFunction(() => !!document.querySelector('[data-testid=face-box]'), null, { timeout: 5000 });
    const face = (await api('breakdown.get')).face;
    for (const k of ['x', 'y', 'w', 'h']) expect(Math.abs(face[k] - f[k]), k).toBeLessThan(0.01);
    expect(face.frame_index).toBe(0);
  });

  test('Fit light fills the light rows as an estimate, never MEASURED; the rest stays SAMPLE', async () => {
    await page.getByRole('button', { name: 'Fit light', exact: true }).click();
    // Since P4 the face box already makes shot size an ESTIMATE (R2), so wait on the Key azimuth row itself.
    for (let i = 0; i < 75 && !(await row('Key azimuth')).badge.startsWith('ESTIMATE'); i++) await page.waitForTimeout(200);
    for (const l of ['Key azimuth', 'Key elevation', 'Key colour']) {
      const r = await row(l);
      expect(r.badge, l).toMatch(/^ESTIMATE( · \d{1,3})?$/);
    }
    for (const l of ['Key type', 'Fill', 'Key:fill', 'Hardness', 'Practicals']) expect((await row(l)).badge, l).toBe('SAMPLE');
    const az = parseFloat((await row('Key azimuth')).value.replace('−', '-'));
    expect(Math.abs(az - TRUTH.key.az)).toBeLessThanOrEqual(15);
    expect(await page.locator('aside').filter({ hasText: 'Key azimuth' }).innerText()).not.toMatch(/Key (azimuth|elevation|colour)[^\n]*\n[^\n]*\nMEASURED/);
  });

  test('the marker names what is estimated and what is still sample, and nothing claims accuracy on real footage', async () => {
    const marker = await page.locator('[data-testid=sample-marker]').innerText();
    expect(marker).toContain('ESTIMATE: key direction, key colour, shot size (from the face marked by hand; not verified on real footage)');
    expect(marker).toMatch(/SAMPLE: key type, hardness, fill, key:fill, practicals, focal length/);
    expect(marker).not.toMatch(/SAMPLE:[^·]*key direction/);
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/accura|validat/i);
    expect(text).not.toMatch(/ESTIMATE[^\n]*%/);
    expect((text.match(/real footage/g) ?? []).length).toBe((text.match(/not verified on real footage/g) ?? []).length);
    expect(await page.locator('main').innerText()).toMatch(/· ESTIMATE/); // the key overlay on the frame
  });

  test('a still with a focal length in its EXIF: the Focal length row reads METADATA', async () => {
    const png = pngWithExif(readFileSync(join(ROOT, 'tests', 'fixtures', 'patches-239.png')));
    await importFile({ name: 'still-with-exif.png', mimeType: 'image/png', buffer: png });
    const r = await row('Focal length');
    expect(r).toEqual({ value: '75 mm (EXIF, 35 mm equiv.)', badge: 'METADATA' });
    expect(await page.locator('[data-testid=sample-marker]').innerText()).toContain('METADATA: focal length (EXIF)');
    expect(errors).toEqual([]);
  }, 90_000);
});
