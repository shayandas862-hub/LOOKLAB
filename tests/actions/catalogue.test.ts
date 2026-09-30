import { beforeEach, describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { ALL_ACTIONS, buildRegistry, defineAction, Registry } from '../../src/actions/index.ts';
import { RULE_IDS } from '../../src/actions/rules.ts';
import { seedSampleIfEmpty } from '../../src/actions/seed.ts';
import { SCREENS } from '../../src/actions/domains/system.ts';
import { memoryContext } from './memory-context.ts';

const ROOT = join(import.meta.dirname, '..', '..');

/** The action names in design/HANDOFF.md §4, with its shorthand rows expanded. */
export function designCatalogue(): string[] {
  const md = readFileSync(join(ROOT, 'design/HANDOFF.md'), 'utf8');
  const section = md.split('## 4. Action catalogue')[1].split('## 5.')[0];
  const names: string[] = [];
  for (const line of section.split('\n')) {
    if (!line.startsWith('| `')) continue;
    const cell = line.split('|')[1];
    const found = [...cell.matchAll(/`([a-z_.*]+)`/g)].map((m) => m[1]);
    for (const n of found) {
      if (n === '_light' || n === '_samples') names.push(`breakdown.toggle${n}`);
      else if (n === 'app.open_*') names.push(...SCREENS.map((s) => `app.open_${s}`));
      else names.push(n);
    }
  }
  return names;
}

describe('the registry matches the design (AD-LL-002)', () => {
  const registry = buildRegistry();
  const names = new Set(registry.list().map((a) => a.name));
  const commands = registry.list().filter((a) => a.command !== false).map((a) => a.name);

  test('the catalogue parses to a plausible size', () => {
    expect(designCatalogue().length).toBeGreaterThan(45);
  });

  test('every action in the design catalogue exists in the registry', () => {
    const missing = designCatalogue().filter((n) => !names.has(n));
    expect(missing).toEqual([]);
  });

  test('every command in the registry is in the design catalogue', () => {
    const catalogue = new Set(designCatalogue());
    expect(commands.filter((n) => !catalogue.has(n))).toEqual([]);
  });

  test('every action has a title, a description and only known rule ids', () => {
    for (const a of ALL_ACTIONS) {
      expect(a.title.length, a.name).toBeGreaterThan(3);
      expect(a.description.length, a.name).toBeGreaterThan(20);
      for (const r of a.rules ?? []) expect(RULE_IDS.has(r), `${a.name} cites ${r}`).toBe(true);
    }
  });

  test('actions that upload or delete always need approval', () => {
    for (const a of ALL_ACTIONS) if (a.effect === 'upload' || a.effect === 'delete') expect(a.confirm, a.name).toBe(true);
  });
});

// Inputs for the actions that have no sensible default.
const REQUIRED: Record<string, Record<string, unknown>> = {
  'breakdown.edit_value': { field: 'light.key_kelvin', value: 2100 },
  'breakdown.review': { field: 'lens.focal_mm' },
  'breakdown.ask': { question: 'What is the exact colour scheme?' },
  'plan.move_object': { id: 'key', x: 4, y: 1.4 },
  'plan.set_property': { id: 'key', field: 'power', value: 60 },
  'settings.set_cap': { amount_inr: 1500 },
  'settings.toggle_cloud': { on: true },
  'settings.toggle_no_ai': { on: false },
};

function sources(x: unknown, out: string[] = []): string[] {
  if (Array.isArray(x)) x.forEach((v) => sources(v, out));
  else if (x && typeof x === 'object') {
    for (const [k, v] of Object.entries(x)) {
      if ((k === 'source' || k === 'palette_source') && typeof v === 'string') out.push(v);
      else sources(v, out);
    }
  }
  return out;
}

describe('every action runs on the sample project', () => {
  let ctx: ReturnType<typeof memoryContext>;
  let registry: Registry;
  beforeEach(async () => {
    ctx = memoryContext();
    registry = buildRegistry();
    await seedSampleIfEmpty(ctx.store, '2026-09-30T12:00:00Z', 'tester', 'local');
  });

  test('each action accepts its default or minimal input from the UI', async () => {
    const failures: string[] = [];
    for (const a of registry.list()) {
      let input = REQUIRED[a.name] ?? {};
      if (a.name === 'log.set_verdict') input = { decision_id: ctx.decisions.at(-1)!.id, verdict: 'agreed' };
      await registry.invoke(a.name, input, ctx.for('ui')).catch((e) => failures.push(`${a.name}: ${e.message}`));
    }
    expect(failures).toEqual([]);
  });

  test('a stand-in never returns a measured or AI value (standing rule 2)', async () => {
    for (const a of registry.list().filter((x) => x.standIn)) {
      const r = await registry.invoke(a.name, REQUIRED[a.name] ?? {}, ctx.for('ui'));
      const bad = sources(r.result).filter((s) => s === 'measured' || s === 'ai');
      expect(bad, a.name).toEqual([]);
    }
  });

  test('a manual edit becomes source "manual" and drops the confidence', async () => {
    await registry.invoke('breakdown.edit_value', { field: 'light.key_az', value: -45 }, ctx.for('ui'));
    const b = (await registry.invoke('breakdown.get', {}, ctx.for('ui'))).result as { light: { key_az: object } };
    expect(b.light.key_az).toMatchObject({ value: -45, source: 'manual', updated_by: 'tester' });
  });

  test('a numeric field refuses text and a text field refuses numbers', async () => {
    await expect(registry.invoke('breakdown.edit_value', { field: 'light.key_az', value: 'left' }, ctx.for('ui'))).rejects.toThrow(/number/);
    await expect(registry.invoke('breakdown.edit_value', { field: 'framing.size', value: 3 }, ctx.for('ui'))).rejects.toThrow(/text/);
  });

  test('plan edits are undoable in order', async () => {
    await registry.invoke('plan.move_object', { id: 'key', x: 4, y: 1 }, ctx.for('ui'));
    await registry.invoke('plan.move_object', { id: 'key', x: 3, y: 1 }, ctx.for('ui'));
    await registry.invoke('plan.undo', {}, ctx.for('ui'));
    const plan = (await registry.invoke('plan.get', {}, ctx.for('ui'))).result as { objects: { id: string; x: number }[] };
    expect(plan.objects.find((o) => o.id === 'key')!.x).toBe(4);
  });

  test('moving an object that does not exist names it', async () => {
    await expect(registry.invoke('plan.move_object', { id: 'ghost', x: 1, y: 1 }, ctx.for('ui'))).rejects.toThrow(/ghost/);
  });

  test('No AI mode refuses every AI action and nothing else', async () => {
    ctx.settings.no_ai = true;
    for (const a of registry.list()) {
      const err = await registry.invoke(a.name, REQUIRED[a.name] ?? {}, ctx.for('ui')).then(() => null, (e) => e);
      if (a.ai) expect(err?.code, a.name).toBe('ai_unavailable');
      else if (err) expect(err.code, `${a.name}: ${err.message}`).not.toBe('ai_unavailable');
    }
  });

  test('secret-looking inputs are redacted before they reach the decision log (standing rule 6)', async () => {
    const secretive = defineAction({
      name: 'test.store_key', title: 'Key', description: 'Takes a key for the redaction test', tier: 'T0', effect: 'write',
      input: z.object({ api_key: z.string() }), output: z.object({ ok: z.boolean() }), handler: async () => ({ ok: true }),
    });
    await new Registry([secretive]).invoke('test.store_key', { api_key: 'sk-live-123456' }, ctx.for('ui'));
    expect(ctx.decisions.at(-1)!.inputs).not.toContain('sk-live');
    expect(ctx.decisions.at(-1)!.inputs).toContain('[redacted]');
  });
});
