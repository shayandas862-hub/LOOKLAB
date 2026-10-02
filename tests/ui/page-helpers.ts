// Helpers for the P4 browser tests: call the engine's API, read a value row's badge, import a file, drag a face box.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import type { Engine } from '../../src/engine/engine.ts';

export function apiFor(engine: Engine, home: string) {
  return async function api<T = any>(action: string, input: object = {}): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const token = readFileSync(join(home, 'token'), 'utf8').trim();
    const r = await fetch(`${engine.url}/api/actions/${action}`, { method: 'POST', headers: { 'x-looklab-token': token, 'content-type': 'application/json' }, body: JSON.stringify(input) });
    const body = await r.json();
    if (!r.ok) throw new Error(`${action}: ${body.message}`);
    return body.result as T;
  };
}

/** Names of the actions that call a model (from the engine's own list). */
export async function aiActionNames(engine: Engine, home: string): Promise<string[]> {
  const token = readFileSync(join(home, 'token'), 'utf8').trim();
  const r = await fetch(`${engine.url}/api/actions`, { headers: { 'x-looklab-token': token } });
  return ((await r.json()).actions as { name: string; ai: boolean }[]).filter((a) => a.ai).map((a) => a.name);
}

/** The value and badge of a labelled row in the right panel. */
export function row(page: Page, label: string): Promise<{ value: string; badge: string }> {
  return page.$$eval('aside div', (els, l) => {
    for (const e of els) {
      const kids = [...e.children] as HTMLElement[];
      if (kids.length >= 3 && kids[0].innerText.trim() === l) return { value: kids[1].innerText.trim(), badge: kids[kids.length - 1].innerText.trim() };
    }
    return { value: '', badge: '' };
  }, label);
}

export async function importFile(page: Page, file: string) {
  await page.getByRole('button', { name: 'Replace reference' }).click();
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Browse files' }).click();
  await (await chooser).setFiles(file);
  await page.waitForFunction(() => {
    const t = document.querySelector('main')?.textContent ?? '';
    return !t.includes('Analysing reference') && !t.includes('Reading frames') && /MEASURED/.test(t);
  }, null, { timeout: 60_000 });
}

/** Drags a box on the frame (fractions of the picture), as a person marks the face. */
export async function dragFace(page: Page, f: { x: number; y: number; w: number; h: number }) {
  const img = page.locator('img[src^="data:image/png"]');
  const bb = (await img.boundingBox())!;
  const n = await img.evaluate((e) => ({ w: (e as HTMLImageElement).naturalWidth, h: (e as HTMLImageElement).naturalHeight }));
  const s = Math.min(bb.width / n.w, bb.height / n.h), cw = n.w * s, ch = n.h * s;
  const at = (fx: number, fy: number) => ({ x: bb.x + (bb.width - cw) / 2 + fx * cw, y: bb.y + (bb.height - ch) / 2 + fy * ch });
  const a = at(f.x, f.y), b = at(f.x + f.w, f.y + f.h);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 12 });
  await page.mouse.up();
  await page.waitForFunction(() => !!document.querySelector('[data-testid=face-box]'), null, { timeout: 5000 });
}

export const SCREENS = ['Projects', 'Breakdown', 'Location & Kit', 'Set Plan', 'Shots', 'Mood Board', 'Set Sheet', 'Library', 'Activity', 'Settings'];

export async function openScreen(page: Page, title: string) {
  await page.locator(`[data-screen-label="Look Lab"] > aside button[title="${title}"]`).click();
  await page.waitForTimeout(250);
}

/** Every control on the page whose tooltip is an action name: enabled or not. */
export function titledControls(page: Page) {
  return page.$$eval('main [title], [data-screen-label="Look Lab"] header [title]', (els) =>
    els.map((e) => ({ title: e.getAttribute('title')!, disabled: (e as HTMLButtonElement).disabled === true })).filter((c) => /^[a-z]+\.[a-z_]+$/.test(c.title)));
}
