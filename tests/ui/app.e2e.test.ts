// End to end: the built UI, served by a real engine, in a real Chrome (the one installed on the Mac).
// Skips, and says so, when Chrome is not installed.
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from 'playwright-core';
import { startEngine, type Engine } from '../../src/engine/engine.ts';

const ROOT = join(import.meta.dirname, '..', '..');
const UI = join(ROOT, 'dist', 'ui');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const canRun = existsSync(CHROME) && existsSync(join(UI, 'index.html'));
if (!canRun) console.warn('[e2e] skipped: needs Google Chrome in /Applications and a built UI (npm run build)');

let home: string;
let engine: Engine;
let browser: Browser;
let page: Page;
const errors: string[] = [];

const SCREENS = ['Projects', 'Breakdown', 'Location & Kit', 'Set Plan', 'Shots', 'Mood Board', 'Set Sheet', 'Library', 'Activity', 'Settings'];

async function open(title: string) {
  await page.locator(`[data-screen-label="Look Lab"] > aside button[title="${title}"]`).click();
  await page.waitForTimeout(250);
}

describe.skipIf(!canRun)('Look Lab in Chrome', () => {
  beforeAll(async () => {
    home = mkdtempSync(join(tmpdir(), 'looklab-e2e-'));
    engine = await startEngine({ home, port: 0, uiDir: UI, quiet: true });
    browser = await chromium.launch({ executablePath: CHROME, headless: true });
    page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on('console', (m) => m.type() === 'error' && !m.text().includes('fonts.g') && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(engine.url);
    await page.waitForSelector('[data-screen-label="Look Lab"]');
  }, 30_000);

  afterAll(async () => {
    await browser?.close();
    await engine?.close();
    rmSync(home, { recursive: true, force: true });
  });

  test('every screen renders, and only unwired screens carry the sample marker', async () => {
    for (const s of SCREENS) {
      await open(s);
      expect((await page.locator('main').innerText()).length, s).toBeGreaterThan(100);
      const marked = await page.locator('[data-testid=sample-marker]').count();
      expect(marked, s).toBe(s === 'Activity' || s === 'Settings' ? 0 : 1);
    }
  });

  test('no screen shows the design\'s MEASURED or AI badge on sample data (D-LL-015)', async () => {
    for (const s of ['Breakdown', 'Location & Kit', 'Set Plan', 'Mood Board']) {
      await open(s);
      const text = await page.locator('main').innerText();
      expect(text, s).not.toMatch(/\bMEASURED\b|\bAI \d{1,3}%/);
    }
  });

  test('⌘K lists every command from the registry', async () => {
    await page.keyboard.press('Meta+k');
    await page.waitForSelector('input[placeholder="Type a command or screen…"]');
    const commands = engine.registry.list().filter((a) => a.command !== false).length;
    const rows = await page.locator('[style*="position: fixed"] button').count();
    expect(rows).toBe(commands);
    await page.keyboard.press('Escape');
  });

  test('a button runs its action, and the Activity screen shows the logged decision', async () => {
    await open('Breakdown');
    await page.getByRole('button', { name: 'Save look' }).click();
    await page.waitForTimeout(300);
    await open('Activity');
    await page.waitForFunction(() => document.querySelector('main')!.textContent!.includes('breakdown.save_look'), null, { timeout: 5000 });
  });

  test('a stand-in never shows the design\'s success text', async () => {
    await open('Mood Board');
    await page.getByRole('button', { name: /Export board/ }).click();
    const toast = await page.waitForSelector('text=stand-in, nothing real produced yet');
    expect(await toast.textContent()).not.toContain('Neel_moodboard.pdf');
  });

  test('No AI mode set in Settings reaches the engine', async () => {
    await open('Settings');
    const before = readSettings().no_ai;
    await page.locator('[title="settings.toggle_no_ai"]').click();
    await page.waitForFunction(() => document.body.textContent!.includes(`No AI mode`), null, { timeout: 3000 });
    await page.waitForTimeout(300);
    expect(readSettings().no_ai).toBe(!before);
  });

  test('the page logs no errors', () => {
    expect(errors).toEqual([]);
  });
});

// What the engine has stored, read from disk: the UI's change must have reached it.
function readSettings(): { no_ai: boolean } {
  const file = join(home, 'system', 'settings.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { no_ai: false };
}
