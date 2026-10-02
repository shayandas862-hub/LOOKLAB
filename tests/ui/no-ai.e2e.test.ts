// No AI (P4 task 5): with no key, with No AI mode on, or with the cap reached, every AI control on every screen is off
// and says which; every screen still works by hand; Fit light (T0) still works; mood and shot size can be set without
// a model. Chrome runs offline; the engine's Keychain is an empty stub and its provider would refuse to send anyway.
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Browser, Page } from 'playwright-core';
import { startEngine, type Engine } from '../../src/engine/engine.ts';
import { blockedByOffline, CHROME, launchChrome, offlinePage } from './chrome.ts';
import { aiActionNames, apiFor, dragFace, importFile, openScreen, row, SCREENS, titledControls } from './page-helpers.ts';
import { cannedReply, memoryKeychain, stubAi } from '../actions/stub-ai.ts';

const ROOT = join(import.meta.dirname, '..', '..');
const UI = join(ROOT, 'dist', 'ui');
const SCENE = join(ROOT, 'tests', 'fixtures', 'blender', 'test', 'test-03-light');
const TRUTH = JSON.parse(readFileSync(`${SCENE}.json`, 'utf8'));
const canRun = existsSync(CHROME) && existsSync(join(UI, 'index.html'));

let home: string;
let engine: Engine;
let browser: Browser;
let page: Page;
let api: ReturnType<typeof apiFor>;
let aiNames: string[];
const kc = memoryKeychain(null);
const ai = stubAi(cannedReply, kc);
const errors: string[] = [];

/** On every screen: each AI control is disabled, the reason is on screen or in the pill, and some T0 control is enabled. */
async function everyScreenSays(reason: RegExp) {
  for (const s of SCREENS) {
    await openScreen(page, s);
    const controls = await titledControls(page);
    for (const c of controls.filter((x) => aiNames.includes(x.title))) expect(c.disabled, `${s}: ${c.title}`).toBe(true);
    if (s !== 'Settings') expect(controls.some((c) => !aiNames.includes(c.title) && !c.disabled), `${s} has a control that works by hand`).toBe(true);
    const text = await page.locator('[data-screen-label="Look Lab"]').innerText();
    expect(text, s).toMatch(reason);
  }
}

describe.skipIf(!canRun)('No AI in Chrome (P4)', () => {
  beforeAll(async () => {
    home = mkdtempSync(join(tmpdir(), 'looklab-noai-'));
    engine = await startEngine({ home, port: 0, uiDir: UI, quiet: true, rateLimit: { perSecond: 200, burst: 400 }, keychain: kc, ai: ai.provider });
    api = apiFor(engine, home);
    aiNames = await aiActionNames(engine, home);
    browser = await launchChrome();
    page = await offlinePage(browser, { viewport: { width: 1440, height: 900 } });
    page.on('console', (m) => m.type() === 'error' && !m.text().includes('fonts.g') && !blockedByOffline(m.text()) && !/\b(400|409) \(/.test(m.text()) && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(engine.url);
    await page.waitForSelector('[data-screen-label="Breakdown"]');
  }, 30_000);

  afterAll(async () => {
    await browser?.close();
    await engine?.close();
    rmSync(home, { recursive: true, force: true });
  });

  test('with no key, every AI control on every screen is off and says there is no key', async () => {
    expect(aiNames.sort()).toEqual(['adapt.generate_recipe', 'breakdown.ask', 'breakdown.fit_lens', 'breakdown.fit_mood']);
    await everyScreenSays(/No API key in the Keychain/);
  }, 60_000);

  test('⌘K lists the AI commands as off, with the reason, and running one calls nothing', async () => {
    await openScreen(page, 'Breakdown');
    await page.keyboard.press('Meta+k');
    await page.keyboard.type('mood');
    await page.waitForFunction(() => /Suggest mood words · off: No API key in the Keychain/.test(document.body.innerText), null, { timeout: 3000 });
    const before = (await api('log.list', { limit: 1000 })).decisions.length;
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    expect((await api('log.list', { limit: 1000 })).decisions.length).toBe(before);
    expect(ai.sent).toHaveLength(0);
    await page.keyboard.press('Escape');
  });

  test('Breakdown works by hand: import, Fit light (T0), shot size from the face box (R2), mood typed by hand', async () => {
    await openScreen(page, 'Breakdown');
    await importFile(page, `${SCENE}.png`);
    expect(await page.locator('input[title="breakdown.ask"]').isDisabled()).toBe(true);
    expect(await page.locator('input[title="breakdown.ask"]').getAttribute('placeholder')).toMatch(/No API key in the Keychain/);
    await dragFace(page, TRUTH.face_box);
    await page.waitForFunction(() => /ESTIMATE/.test([...document.querySelectorAll('aside')].map((a) => a.textContent).join(' ')), null, { timeout: 5000 });
    const size = await row(page, 'Shot size');
    expect(size.badge).toBe('ESTIMATE');
    expect(size.value).toMatch(/^(CU|MCU)$/); // the Blender faces fill 32–58% of the frame (D-LL-046)
    await page.getByRole('button', { name: 'Fit light', exact: true }).click();
    for (let i = 0; i < 50 && !(await row(page, 'Key azimuth')).badge.startsWith('ESTIMATE'); i++) await page.waitForTimeout(200);
    expect((await row(page, 'Key azimuth')).badge).toMatch(/^ESTIMATE/);
    page.once('dialog', (d) => d.accept('quiet'));
    await page.getByRole('button', { name: '+ Add' }).click();
    await page.waitForFunction(() => /quiet/.test([...document.querySelectorAll('aside')].map((a) => a.textContent).join(' ')), null, { timeout: 5000 });
    expect((await api('breakdown.get')).mood).toMatchObject({ source: 'manual' });
    expect(ai.sent).toHaveLength(0);
  }, 90_000);

  test('No AI mode: every AI control says No AI mode is on', async () => {
    await api('settings.toggle_no_ai', { on: true });
    await page.reload();
    await page.waitForSelector('[data-screen-label="Breakdown"]');
    await everyScreenSays(/No AI mode/);
    await api('settings.toggle_no_ai', { on: false });
  }, 60_000);

  test('the cap reached: every AI control says the monthly cap is reached', async () => {
    await kc.set('sk-ant-api03-TESTONLY_abcdefghijklmnopqrstuvwxyz0123456789-XYZ');
    await api('settings.set_cap', { amount_inr: 0 });
    await page.reload();
    await page.waitForSelector('[data-screen-label="Breakdown"]');
    await everyScreenSays(/Monthly spend cap reached/);
    expect(ai.sent).toHaveLength(0);
  }, 60_000);

  test('the page logs no errors', () => {
    expect(errors).toEqual([]);
  });
});
