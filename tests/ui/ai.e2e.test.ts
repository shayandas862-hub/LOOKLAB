// AI in the app, in Chrome, on the stub client (P4 tasks 1, 3 and 4): the key dialog keeps the key out of sight; mood
// and Ask read "AI · n", never MEASURED or ESTIMATE; a value under 60 reads low and a click confirms it, recorded on
// the decision that wrote it. Chrome runs offline and the provider's transport is a stub: nothing is sent anywhere.
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Browser, Page } from 'playwright-core';
import { startEngine, type Engine } from '../../src/engine/engine.ts';
import { blockedByOffline, CHROME, launchChrome, offlinePage } from './chrome.ts';
import { apiFor, importFile, openScreen } from './page-helpers.ts';
import { memoryKeychain, stubAi, TEST_KEY, type Reply } from '../actions/stub-ai.ts';

const ROOT = join(import.meta.dirname, '..', '..');
const UI = join(ROOT, 'dist', 'ui');
const SCENE = join(ROOT, 'tests', 'fixtures', 'blender', 'test', 'test-03-light');
const canRun = existsSync(CHROME) && existsSync(join(UI, 'index.html'));

let home: string;
let engine: Engine;
let browser: Browser;
let page: Page;
let api: ReturnType<typeof apiFor>;
let moodConfidence = 72;
const kc = memoryKeychain(TEST_KEY);
const ai = stubAi((_u, system): Reply => system.includes('breakdown.fit_mood')
  ? { text: JSON.stringify({ words: moodConfidence < 60 ? ['uneasy'] : ['lonely', 'cool night'], confidence: moodConfidence, why: 'cool tints' }) }
  : { text: JSON.stringify({ answer: 'A cool palette with a warm accent on the face.', confidence: 70 }) }, kc);
const errors: string[] = [];
const panel = () => page.$$eval('aside', (as) => as.map((a) => (a as HTMLElement).innerText).join('\n'));

describe.skipIf(!canRun)('AI in Chrome on the stub client (P4)', () => {
  beforeAll(async () => {
    home = mkdtempSync(join(tmpdir(), 'looklab-ai-'));
    engine = await startEngine({ home, port: 0, uiDir: UI, quiet: true, rateLimit: { perSecond: 200, burst: 400 }, keychain: kc, ai: ai.provider });
    api = apiFor(engine, home);
    browser = await launchChrome();
    page = await offlinePage(browser, { viewport: { width: 1440, height: 900 } });
    page.on('console', (m) => m.type() === 'error' && !m.text().includes('fonts.g') && !blockedByOffline(m.text()) && !/\b(400|409|502) \(/.test(m.text()) && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(engine.url);
    await page.waitForSelector('[data-screen-label="Breakdown"]');
  }, 30_000);

  afterAll(async () => {
    await browser?.close();
    await engine?.close();
    rmSync(home, { recursive: true, force: true });
  });

  test('an import asks for mood words: the mood reads "AI · 72", never MEASURED, ESTIMATE or a percentage', async () => {
    await importFile(page, `${SCENE}.png`);
    await page.waitForFunction(() => /AI · 72/.test([...document.querySelectorAll('aside')].map((a) => a.textContent).join(' ')), null, { timeout: 10_000 });
    const text = await panel();
    expect(text).toMatch(/lonely/);
    expect(text).not.toMatch(/AI \d{1,3}%/);
    expect((await api('breakdown.get')).mood).toMatchObject({ source: 'ai', confidence: 72 });
    expect(await page.locator('[data-testid=sample-marker]').getAttribute('aria-label')).toMatch(/AI: mood \(the model's own rating, not checked\)/);
  }, 90_000);

  test('Ask answers in words and reads "AI · 70"', async () => {
    await page.locator('input[title="breakdown.ask"]').fill('What is the colour scheme?');
    await page.locator('input[title="breakdown.ask"]').press('Enter');
    await page.waitForFunction(() => /A cool palette with a warm accent/.test(document.querySelector('main')!.textContent ?? ''), null, { timeout: 5000 });
    const main = await page.locator('main').innerText();
    expect(main).toMatch(/AI · 70/);
    expect(main).not.toMatch(/\bMEASURED\b.*A cool palette|ESTIMATE.*A cool palette/);
  });

  test('a mood under 60 reads low and goes to review; one click confirms it, recorded on its decision', async () => {
    moodConfidence = 41;
    await api('breakdown.fit_mood');
    await page.reload();
    await page.waitForFunction(() => /1 value needs review/.test(document.body.innerText), null, { timeout: 10_000 });
    expect(await panel()).toMatch(/AI · 41 · LOW/);
    const wrote = (await api('breakdown.get')).mood.decision_id;
    await page.getByRole('button', { name: 'Confirm mood' }).click();
    await page.waitForFunction(() => !/needs review/.test(document.body.innerText), null, { timeout: 5000 });
    const row = (await api('log.list', { limit: 1000 })).decisions.find((d: { id: string }) => d.id === wrote);
    expect(row.verdict).toBe('agreed');
    expect(await panel()).toMatch(/AI · 41 · CONFIRMED/);
  });

  test('Settings: the key box says the key is in the Keychain and never shows it; replace and remove go through the Keychain', async () => {
    await openScreen(page, 'Settings');
    await page.getByRole('button', { name: 'AI & connections' }).click();
    expect(await page.locator('main').innerText()).toMatch(/Key in the macOS Keychain/);
    await page.getByRole('button', { name: 'Remove key' }).click();
    await page.waitForFunction(() => /No key yet/.test(document.querySelector('main')!.textContent ?? ''), null, { timeout: 5000 });
    expect(kc.value).toBeNull();
    await page.getByRole('button', { name: 'Add key' }).click();
    const field = page.locator('input[type=password][title="settings.add_provider"]');
    await field.fill(TEST_KEY);
    await page.getByRole('button', { name: 'Save to Keychain' }).click();
    await page.waitForFunction(() => /Key in the macOS Keychain/.test(document.querySelector('main')!.textContent ?? ''), null, { timeout: 5000 });
    expect(kc.value).toBe(TEST_KEY);
    const html = await page.content();
    expect(html).not.toContain(TEST_KEY);
    expect(html).not.toContain(TEST_KEY.slice(-4));
  });

  test('every call went to the stub; nothing reached the network, and the cost of each is in its decision row', async () => {
    expect(ai.sent.length).toBeGreaterThanOrEqual(3);
    const rows = (await api('log.list', { limit: 1000 })).decisions.filter((d: { ai: unknown }) => d.ai);
    expect(rows.length).toBe(ai.sent.length);
    const status = await api('settings.ai_status');
    expect(status.used_inr).toBeCloseTo(rows.reduce((s: number, d: { cost_inr: number }) => s + d.cost_inr, 0), 4);
  });

  test('the page logs no errors', () => {
    expect(errors).toEqual([]);
  });
});
