// P2 end to end in a real Chrome: import a reference, see it measured, set the subject, save the look.
// The image is a committed fixture with known colours; the video is recorded inside the page
// (canvas + MediaRecorder) with known cuts and one slow dissolve. Skips, and says so, without Chrome.
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Browser, Page } from 'playwright-core';
import { blockedByOffline, CHROME, launchChrome, offlinePage } from './chrome.ts';
import { startEngine, type Engine } from '../../src/engine/engine.ts';
import { deltaE2000, hexToLab } from '../../src/core/colour.ts';

const ROOT = join(import.meta.dirname, '..', '..');
const UI = join(ROOT, 'dist', 'ui');
const FIXTURE = join(ROOT, 'tests', 'fixtures', 'patches-239.png');
const SPEC = JSON.parse(readFileSync(join(ROOT, 'tests', 'fixtures', 'patches-239.json'), 'utf8')) as { patches: [string, number][] };
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

/** The swatch rows of the COLOUR section: hex, share and badge. */
async function swatches(): Promise<{ hex: string; share: number; badge: string }[]> {
  return page.$$eval('aside button', (els) =>
    els
      .map((e) => (e as HTMLElement).innerText.split('\n').map((s) => s.trim()).filter(Boolean))
      .filter((t) => /^#[0-9A-F]{6}$/.test(t[0]))
      .map((t) => ({ hex: t[0], share: parseFloat(t[1]), badge: t[2] })),
  );
}

/** The value and badge of a labelled row in the right panel ("Contrast", "Subject", "Focal length"…). */
async function row(label: string): Promise<{ value: string; badge: string }> {
  return page.$$eval('aside div', (els, l) => {
    for (const e of els) {
      const kids = [...e.children] as HTMLElement[];
      if (kids.length >= 3 && kids[0].innerText.trim() === l) return { value: kids[1].innerText.trim(), badge: kids[kids.length - 1].innerText.trim() };
    }
    return { value: '', badge: '' };
  }, label);
}

async function waitForReady(timeout = 60_000) {
  await page.waitForFunction(() => {
    const t = document.querySelector('main')?.textContent ?? '';
    return !t.includes('Analysing reference') && !t.includes('Reading frames') && /MEASURED/.test(t);
  }, null, { timeout });
}

describe.skipIf(!canRun)('Breakdown in Chrome (P2)', () => {
  beforeAll(async () => {
    home = mkdtempSync(join(tmpdir(), 'looklab-p2-'));
    engine = await startEngine({ home, port: 0, uiDir: UI, quiet: true, rateLimit: { perSecond: 200, burst: 400 } });
    browser = await launchChrome(['--autoplay-policy=no-user-gesture-required']);
    page = await offlinePage(browser, { viewport: { width: 1440, height: 900 } });
    page.on('console', (m) => m.type() === 'error' && !m.text().includes('fonts.g') && !blockedByOffline(m.text()) && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(engine.url);
    await page.waitForSelector('[data-screen-label="Breakdown"]');
  }, 30_000);

  afterAll(async () => {
    await browser?.close();
    await engine?.close();
    rmSync(home, { recursive: true, force: true });
  });

  test('before any import the whole screen is sample and says so', async () => {
    expect(await page.locator('[data-testid=sample-marker]').innerText()).toMatch(/SAMPLE DATA/);
    expect(await page.locator('main').innerText()).not.toMatch(/\bMEASURED\b/);
  });

  test('an imported image shows its known colours, measured (ΔE00 ≤ 2, share ± 2 points)', async () => {
    await page.getByRole('button', { name: 'Replace reference' }).click();
    const chooser = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: 'Browse files' }).click();
    await (await chooser).setFiles(FIXTURE);
    await waitForReady();
    const got = await swatches();
    expect(got.length).toBe(SPEC.patches.length);
    for (const [hex, share] of SPEC.patches) {
      const s = got.find((g) => deltaE2000(hexToLab(g.hex), hexToLab(hex)) <= 2);
      expect(s, `${hex} in ${JSON.stringify(got)}`).toBeTruthy();
      expect(Math.abs(s!.share - share), `${hex} share`).toBeLessThanOrEqual(2);
      expect(s!.badge).toBe('MEASURED');
    }
    expect(await page.locator('main').innerText()).toContain('patches-239.png');
    expect((await row('Aspect')).value).toBe('2.39:1');
    expect((await row('Aspect')).badge).toBe('MEASURED');
    expect((await row('Contrast')).badge).toBe('MEASURED');
    expect(await page.locator('img[src^="data:image/png"]').count()).toBe(1);
  }, 90_000);

  test('until the light is fitted, light, lens and mood stay SAMPLE, and the marker says exactly that', async () => {
    // P3 split the light rows (one per value) and builds the marker from the record (D-LL-038).
    for (const l of ['Key azimuth', 'Key colour', 'Key type', 'Fill', 'Focal length', 'Camera height', 'Shot size']) expect((await row(l)).badge, l).toBe('SAMPLE');
    const marker = await page.locator('[data-testid=sample-marker]').innerText();
    expect(marker).toMatch(/SAMPLE: key direction, key colour, key type, hardness, fill, key:fill, practicals, focal length/);
    expect(marker).toMatch(/lead room, mood · colour, tone and aspect measured/);
    expect(await page.locator('main').innerText()).not.toMatch(/\bAI \d{1,3}%/);
  });

  test('a click on the frame sets the subject position by hand', async () => {
    const img = page.locator('img[src^="data:image/png"]');
    const box = (await img.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.45);
    await page.waitForFunction(() => document.querySelector('[data-screen-label="Breakdown"] aside')!.textContent!.includes('left third ('), null, { timeout: 5000 });
    expect(await page.locator('[data-testid=subject-marker]').count()).toBe(1);
    const subject = await row('Subject');
    expect(subject.value).toMatch(/^left third \(x 0\.(29|30|31), y 0\.(44|45|46)\)$/);
    expect(subject.badge).toBe('MANUAL');
  });

  test('save look → library.list returns it with source "measured" (light still sample)', async () => {
    await page.getByRole('button', { name: 'Save look' }).click();
    await page.waitForTimeout(400);
    const { looks } = await api<{ looks: { source: string; light_source: string; palette: { hex: string }[] }[] }>('library.list');
    const mine = looks.filter((l) => l.source === 'measured');
    expect(mine.length).toBe(1);
    expect(mine[0].light_source).toBe('sample');
    expect(mine[0].palette.length).toBe(SPEC.patches.length);
  });

  // The clip opens on 1 s of black: Chrome's canvas recorder writes a file's first frame with different colour
  // conversion from the frames after it (B-LL-002), and black is black either way, so that frame cannot fake a cut.
  test('a recorded clip with cuts at 1 s, 3 s and 9 s and a 3 s dissolve: every cut found (± 1 sampled frame), none on the dissolve', async () => {
    await page.evaluate(async () => {
      const W = 640;
      const H = 360;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const g = canvas.getContext('2d')!;
      const SCENES = [['#B0502A', '#F2C57C'], ['#1E3A6E', '#6FA3D8'], ['#2F6B3A', '#C9E07A'], ['#5A1E5A', '#E07AB8']];
      const draw = (s: number, t: number, alpha = 1) => {
        const grad = g.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, SCENES[s][0]);
        grad.addColorStop(1, SCENES[s][1]);
        g.globalAlpha = alpha;
        g.fillStyle = grad;
        g.fillRect(0, 0, W, H);
        g.fillStyle = '#F5F5F0';
        g.fillRect(60 + ((t * 80) % 400), 140, 90, 90);
        g.globalAlpha = 1;
      };
      // 0–1 s black · cut · 1–3 s scene 0 · cut · 3–5 s scene 1 · 5–8 s dissolve 1→2 · 8–9 s scene 2 · cut · 9–11 s scene 3
      const frame = (t: number) => {
        if (t < 1) {
          g.fillStyle = '#000000';
          return g.fillRect(0, 0, W, H);
        }
        if (t < 3) return draw(0, t);
        if (t < 5) return draw(1, t);
        if (t < 8) {
          draw(1, t);
          return draw(2, t, (t - 5) / 3);
        }
        if (t < 9) return draw(2, t);
        return draw(3, t);
      };
      // The timeline runs from the recorder's start event, so video time 0 is script time 0.
      let start = 0;
      const now = () => (start ? (performance.now() - start) / 1000 : 0);
      const painter = setInterval(() => frame(Math.min(now(), 10.99)), 1000 / 60);
      frame(0);
      const stream = canvas.captureStream(30);
      const rec = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8', videoBitsPerSecond: 4_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      const done = new Promise((r) => (rec.onstop = r));
      const started = new Promise((r) => (rec.onstart = r));
      rec.start(250);
      await started;
      start = performance.now();
      await new Promise<void>((resolve) => {
        const check = () => (now() >= 11.2 ? resolve() : setTimeout(check, 50));
        check();
      });
      rec.stop();
      await done;
      clearInterval(painter);
      const file = new File(chunks, 'cuts-and-dissolve.webm', { type: 'video/webm' });
      const dt = new DataTransfer();
      dt.items.add(file);
      document.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
      document.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
    });
    await page.waitForFunction(() => document.querySelector('main')!.textContent!.includes('cuts-and-dissolve.webm'), null, { timeout: 20_000 });
    await waitForReady(90_000);
    const b = await api<{ reference_id: string; frame_index: number }>('breakdown.get');
    const ref = await api<{ shots: { in_s: number; key_frame: number }[]; shots_source: string; sample_fps: number }>('breakdown.get_reference', { reference_id: b.reference_id });
    expect(ref.shots_source).toBe('measured');
    const starts = ref.shots.map((s) => s.in_s);
    expect(starts.length, `shots start at ${starts}`).toBe(4);
    const step = 1 / ref.sample_fps;
    for (const [k, t] of [[1, 1], [2, 3], [3, 9]]) expect(Math.abs(starts[k] - t), `cut near ${t} s (shots start at ${starts})`).toBeLessThanOrEqual(step + 1e-9);
    // The breakdown measured the longest shot (the one holding the dissolve), not the black leader.
    expect(b.frame_index).toBe(ref.shots[2].key_frame);
    expect(await page.locator('main').innerText()).toContain('4 shots');
  }, 120_000);

  test('the page logs no errors', () => {
    expect(errors).toEqual([]);
  });
});
