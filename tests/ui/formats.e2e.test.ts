// Real tests of what the founder hit on 2026-10-03: an iPhone HEIC dropped on the Breakdown (D-LL-055), a file macOS
// cannot read, and the honesty marker covering the top bar (B-LL-006). Chrome runs offline; the engine converts with
// macOS's own sips, as on the founder's Mac.
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Browser, Page } from 'playwright-core';
import { startEngine, type Engine } from '../../src/engine/engine.ts';
import { blockedByOffline, CHROME, launchChrome, offlinePage } from './chrome.ts';
import { apiFor, dragFace, row } from './page-helpers.ts';
import { makeHeic } from '../fixtures/heic.ts';

const ROOT = join(import.meta.dirname, '..', '..');
const UI = join(ROOT, 'dist', 'ui');
const canRun = existsSync(CHROME) && existsSync(join(UI, 'index.html')) && process.platform === 'darwin';
const FACE = { x: 0.2267, y: 0.2978, w: 0.1932, h: 0.3786 }; // test-03-light's face box (its truth file)

let home: string, work: string;
let engine: Engine;
let browser: Browser;
let page: Page;
let api: ReturnType<typeof apiFor>;
const errors: string[] = [];

async function pick(file: string) {
  await page.getByRole('button', { name: 'Replace reference' }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Browse files' }).click();
  await (await chooser).setFiles(file);
}

/** The marker's box, and every button or breadcrumb box it overlaps. */
const overlaps = () => page.evaluate(() => {
  const m = document.querySelector('[data-testid=sample-marker]')!.getBoundingClientRect();
  const hit = [...document.querySelectorAll('button, header nav')].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.right > m.left && r.left < m.right && r.bottom > m.top && r.top < m.bottom;
  }).map((e) => (e as HTMLElement).innerText.slice(0, 30) || e.getAttribute('title'));
  return { height: m.height, hit };
});

describe.skipIf(!canRun)('Formats and the marker in Chrome', () => {
  beforeAll(async () => {
    home = mkdtempSync(join(tmpdir(), 'looklab-formats-'));
    work = mkdtempSync(join(tmpdir(), 'looklab-formats-files-'));
    writeFileSync(join(work, 'IMG_0725.heic'), makeHeic(work));
    writeFileSync(join(work, 'broken.heic'), Buffer.from('this is not a photo, whatever its name says'));
    engine = await startEngine({ home, port: 0, uiDir: UI, quiet: true, rateLimit: { perSecond: 200, burst: 400 } });
    api = apiFor(engine, home);
    browser = await launchChrome();
    page = await offlinePage(browser, { viewport: { width: 1440, height: 900 } });
    page.on('console', (m) => m.type() === 'error' && !m.text().includes('fonts.g') && !blockedByOffline(m.text()) && !/\b400 \(/.test(m.text()) && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(engine.url);
    await page.waitForSelector('[data-screen-label="Breakdown"]');
  }, 30_000);

  afterAll(async () => {
    await browser?.close();
    await engine?.close();
    rmSync(home, { recursive: true, force: true });
    rmSync(work, { recursive: true, force: true });
  });

  test('a file macOS cannot read is refused with the reason, and the screen says nothing was imported', async () => {
    await pick(join(work, 'broken.heic'));
    await page.waitForFunction(() => /Import stopped/.test(document.body.innerText), null, { timeout: 15_000 });
    const text = await page.locator('main').innerText();
    expect(text).toMatch(/macOS could not read broken\.heic as an image/);
    expect(text).toMatch(/Nothing was imported/);
    expect(text).not.toMatch(/Frames already sent/);
  }, 30_000);

  test('an iPhone HEIC imports: converted on this Mac, measured, its size and its lens kept', async () => {
    await pick(join(work, 'IMG_0725.heic'));
    await page.waitForFunction(() => {
      const t = document.querySelector('main')?.textContent ?? '';
      return !t.includes('Analysing reference') && !t.includes('Reading frames') && !t.includes('Converting') && /MEASURED/.test(t);
    }, null, { timeout: 60_000 });
    const b = await api('breakdown.get');
    const ref = await api('breakdown.get_reference', { reference_id: b.reference_id });
    expect(ref).toMatchObject({ file_name: 'IMG_0725.heic', width: 512, height: 288, exif: { focal_mm: 50, focal_35mm: 75 } });
    expect(b.palette.every((p: { share: { source: string } }) => p.share.source === 'measured')).toBe(true);
    expect(await row(page, 'Focal length')).toMatchObject({ badge: 'METADATA' });
  }, 90_000);

  test('the marker is one line in the top bar\'s free space and covers no button or breadcrumb, wide and narrow (B-LL-006)', async () => {
    await dragFace(page, FACE);
    await page.getByRole('button', { name: 'Fit light', exact: true }).click();
    for (let i = 0; i < 50 && !(await row(page, 'Key azimuth')).badge.startsWith('ESTIMATE'); i++) await page.waitForTimeout(200);
    for (const size of [{ width: 1440, height: 900 }, { width: 1000, height: 800 }]) {
      await page.setViewportSize(size);
      await page.waitForTimeout(300);
      const o = await overlaps();
      expect(o.height, `${size.width}`).toBeLessThanOrEqual(30);
      expect(o.hit, `${size.width}`).toEqual([]);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    const marker = page.locator('[data-testid=sample-marker]');
    expect(await marker.getAttribute('aria-label')).toMatch(/ESTIMATE: key direction, key colour, shot size/);
    await marker.click();
    expect(await page.locator('[data-testid=sample-marker-detail]').innerText()).toMatch(/METADATA: focal length \(EXIF\)/);
  }, 60_000);

  test('an iPhone-style HEVC video (MOV) imports and is measured: this Mac\'s Chrome decodes HEVC', async () => {
    await pick(join(ROOT, 'tests', 'fixtures', 'hevc-1s.mov')); // 1 s of HEVC, made with macOS avconvert
    await page.waitForFunction(() => /Import stopped|MEASURED/.test(document.querySelector('main')?.textContent ?? '') && !/Reading frames|Analysing/.test(document.body.innerText), null, { timeout: 60_000 });
    expect(await page.locator('main').innerText()).not.toMatch(/Import stopped/);
    const b = await api('breakdown.get');
    const ref = await api('breakdown.get_reference', { reference_id: b.reference_id });
    expect(ref).toMatchObject({ file_name: 'hevc-1s.mov', media: 'video', width: 1920, height: 1080 });
    expect(b.palette.some((x: { hex: string }) => x.hex !== '#000000')).toBe(true); // a picture, not blank frames
  }, 90_000);

  test('a ProRes clip, which Chrome cannot decode, is refused with the reason; nothing is measured', async () => {
    const before = (await api('breakdown.get')).reference_id;
    await pick(join(ROOT, 'tests', 'fixtures', 'prores-short.mov')); // 0.3 s of ProRes 422, made with macOS avconvert
    await page.waitForFunction(() => /Import stopped|MEASURED/.test(document.querySelector('main')?.textContent ?? '') && !/Reading frames|Analysing/.test(document.body.innerText), null, { timeout: 60_000 });
    const text = await page.locator('main').innerText();
    expect(text).toMatch(/Import stopped/);
    expect(text).toMatch(/Nothing was imported/);
    expect((await api('breakdown.get')).reference_id).toBe(before);
  }, 90_000);

  test('the page logs no errors', () => {
    expect(errors).toEqual([]);
  });
});
