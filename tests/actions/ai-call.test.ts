// The spend cap and the cost log (P4 task 2; AD-LL-011, AD-LL-012). Every call is priced at its worst case before it
// is sent and refused, with the reason, if it would cross the month's cap; the real cost from the usage goes to the
// decision row and to used_inr; the month rolls over in UTC.
import { beforeEach, describe, expect, test } from 'vitest';
import { z } from 'zod';
import { Registry, defineAction } from '../../src/actions/registry.ts';
import { callModel } from '../../src/actions/ai-call.ts';
import { Decision, Settings } from '../../src/contracts/index.ts';
import { costInr, worstCaseInr, worstInputTokens, MODEL } from '../../src/engine/pricing.ts';
import { memoryContext } from './memory-context.ts';
import { stubAi } from './stub-ai.ts';

const SYSTEM = 'Answer with one word.';
const SCHEMA = { type: 'object', properties: { word: { type: 'string' } }, required: ['word'], additionalProperties: false };
const ask = defineAction({
  name: 'test.ask_word',
  title: 'Ask a word',
  description: 'Calls the model through callModel, for the cap tests.',
  tier: 'T2', effect: 'spend', ai: true,
  input: z.object({ text: z.string().default('hello') }),
  output: z.object({ word: z.string() }),
  handler: async (ctx, i) => {
    const r = await callModel(ctx, {
      prompt_id: 'test.word', prompt_version: 1, system: SYSTEM, user: i.text, schema: SCHEMA, maxTokens: 512, effort: 'low',
      parse: z.object({ word: z.string().min(1) }),
    });
    return { word: r.value.word };
  },
});
const worst = worstCaseInr(MODEL, [SYSTEM, 'hello', JSON.stringify(SCHEMA)], 512);
const real = costInr(MODEL, 900, 120);

let ctx: ReturnType<typeof memoryContext>;
let ai: ReturnType<typeof stubAi>;
let registry: Registry;
beforeEach(() => {
  ai = stubAi({ text: '{"word":"blue"}', input_tokens: 900, output_tokens: 120 });
  ctx = memoryContext({ ai: ai.provider, start: '2026-10-01T10:00:00Z' });
  registry = new Registry([ask]);
});
const used = () => ctx.settings.api.used_inr;
const sumRows = () => ctx.decisions.reduce((s, d) => s + d.cost_inr, 0);

describe('the spend cap', () => {
  test('a call that would cross the cap is refused before it is sent, and says why', async () => {
    ctx.settings.api.cap_inr = 10;
    ctx.settings.api.used_inr = 10 - worst + 0.01;
    ctx.settings.api.month = '2026-10';
    const err = await registry.invoke('test.ask_word', {}, ctx.for('ui')).then(() => null, (e) => e);
    expect(err?.code).toBe('ai_unavailable');
    expect(err?.message).toMatch(/could cost up to ₹\d+\.\d\d/);
    expect(err?.message).toMatch(/of this month's ₹10 cap/);
    expect(ai.sent).toHaveLength(0);
    expect(ctx.decisions.at(-1)).toMatchObject({ ok: false, cost_inr: 0 });
  });

  test('a call inside the cap is sent once; its real cost goes to the decision row and to used_inr', async () => {
    ctx.settings.api.cap_inr = 100;
    const r = await registry.invoke('test.ask_word', {}, ctx.for('ui'));
    expect(r.result).toEqual({ word: 'blue' });
    expect(ai.sent).toHaveLength(1);
    const row = ctx.decisions.at(-1)!;
    expect(row.cost_inr).toBeCloseTo(real, 4);
    expect(used()).toBeCloseTo(real, 4);
    expect(row.ai).toMatchObject({
      provider: 'anthropic', model: 'claude-opus-5', prompt_id: 'test.word', prompt_version: 1,
      tokens_in: 900, tokens_out: 120, stop_reason: 'end_turn',
      sent: { system: SYSTEM, user: 'hello' },
      price: { usd_in_per_mtok: 5, usd_out_per_mtok: 25, price_read: '2026-10-01', inr_per_usd: 96.33, rate_date: '2026-10-01' },
    });
    expect(row.ai!.worst_inr).toBeCloseTo(worst, 4);
    expect(row.ai!.worst_inr).toBeGreaterThanOrEqual(row.cost_inr);
  });

  test('used_inr equals the sum of the decision rows\' cost_inr, failed and refused calls included', async () => {
    let text = '{"word":"blue"}';
    ai = stubAi(() => ({ text, input_tokens: 900, output_tokens: 120 }));
    ctx = memoryContext({ ai: ai.provider, start: '2026-10-01T10:00:00Z' });
    ctx.settings.api.cap_inr = 100;
    await registry.invoke('test.ask_word', {}, ctx.for('ui')); // answered
    text = 'not json';
    await registry.invoke('test.ask_word', {}, ctx.for('ui')).catch(() => null); // bad answer: refused, still billed
    ctx.settings.api.cap_inr = used() + 0.001;
    await registry.invoke('test.ask_word', {}, ctx.for('ui')).catch(() => null); // would cross the cap: never sent
    expect(ai.sent).toHaveLength(2);
    expect(ctx.decisions.map((d) => d.cost_inr > 0)).toEqual([true, true, false]);
    expect(used()).toBeCloseTo(sumRows(), 4);
  });

  test('two calls at once cannot both pass the check when only one fits', async () => {
    // Each call bills its full worst case, so after one, the other no longer fits; checked together, both would.
    ai = stubAi({ text: '{"word":"blue"}', input_tokens: worstInputTokens([SYSTEM, 'hello', JSON.stringify(SCHEMA)]), output_tokens: 512 });
    ctx = memoryContext({ ai: ai.provider, start: '2026-10-01T10:00:00Z' });
    ctx.settings.api.cap_inr = worst * 1.5;
    ctx.settings.api.month = '2026-10';
    const results = await Promise.allSettled([
      registry.invoke('test.ask_word', {}, ctx.for('ui')),
      registry.invoke('test.ask_word', {}, ctx.for('ui')),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(ai.sent).toHaveLength(1);
    expect(used()).toBeCloseTo(sumRows(), 4);
  });

  test('the month rolls over in UTC: a new month starts at zero (AD-LL-011)', async () => {
    ctx.settings.api.cap_inr = 100;
    ctx.setClock('2026-10-31T23:59:00Z');
    await registry.invoke('test.ask_word', {}, ctx.for('ui'));
    expect(ctx.settings.api.month).toBe('2026-10');
    ctx.settings.api.used_inr = 99.99; // as if the month had been spent
    ctx.setClock('2026-11-01T00:00:30Z');
    await registry.invoke('test.ask_word', {}, ctx.for('ui'));
    expect(ctx.settings.api.month).toBe('2026-11');
    expect(used()).toBeCloseTo(real, 4);
  });

  test('a model answer that is not valid JSON is refused with the reason, and its cost is still logged', async () => {
    ctx.settings.api.cap_inr = 100;
    const bad = stubAi({ text: 'Sure! The word is blue.', input_tokens: 800, output_tokens: 40 });
    const c = memoryContext({ ai: bad.provider, start: '2026-10-01T10:00:00Z' });
    c.settings.api.cap_inr = 100;
    const err = await registry.invoke('test.ask_word', {}, c.for('ui')).then(() => null, (e) => e);
    expect(err?.code).toBe('model_output');
    expect(err?.message).toMatch(/not valid JSON/);
    expect(c.decisions.at(-1)!.cost_inr).toBeCloseTo(costInr(MODEL, 800, 40), 4);
    expect(c.settings.api.used_inr).toBeCloseTo(costInr(MODEL, 800, 40), 4);
  });
});

describe('the contracts still read what P3 wrote', () => {
  test('settings without a month and decision rows without an ai block parse (AD-LL-011, AD-LL-012)', () => {
    expect(Settings.parse({ schema_version: 1, api: { cap_inr: 2000, used_inr: 0 } }).api.month).toBeNull();
    const old = {
      schema_version: 1, id: 'd-1', time: '2026-09-30T12:00:00Z', workspace_id: 'local', by: 'x', via: 'ui', command: 'breakdown.analyse',
      tier: 'T0', rule_id: null, shot_id: '12C', inputs: '{}', result: '{}', ok: true, stand_in: false, confidence: null, cost_inr: 0, verdict: null,
    };
    expect(Decision.parse(old).ai).toBeNull();
  });
});
