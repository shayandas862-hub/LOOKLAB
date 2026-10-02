// Every in-app model call goes through here (P4 task 2): No AI mode and the key are checked, the call is priced at
// its worst case and refused if it would cross the month's cap, the real cost from the usage is added to used_inr
// and to the action's decision row (also when the call or its answer fails), and the answer is checked against a
// zod schema. Calls run one at a time, so two cannot both fit under the cap that only one fits under.
import { z } from 'zod';
import type { Settings } from '../contracts/index.ts';
import { AiCallError, type AiRequest, type AiResponse } from '../engine/ai.ts';
import { INR_PER_USD, PRICES, costInr, monthOf, round4, worstCaseInr } from '../engine/pricing.ts';
import type { ActionContext } from './context.ts';
import { ActionError } from './registry.ts';

export interface ModelCall<T> extends AiRequest {
  /** Names the prompt in src/actions/prompts.ts; with its version, it is written to the decision row. */
  prompt_id: string;
  prompt_version: number;
  /** What the answer must be, checked after the API's own schema check. */
  parse: z.ZodType<T>;
}

/** A new UTC month starts the spend at zero (AD-LL-011). A record from before P4 adopts the current month. */
export function rollMonth(s: Settings, now: string): Settings {
  const month = monthOf(now);
  if (s.api.month === month) return s;
  return { ...s, api: { ...s.api, month, used_inr: s.api.month === null ? s.api.used_inr : 0 } };
}

const rupees = (n: number) => `₹${n.toFixed(2)}`;
let queue: Promise<unknown> = Promise.resolve();

/** One at a time, in order: the cap check, the call and the settling of its cost happen together. */
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

export function callModel<T>(ctx: ActionContext, call: ModelCall<T>): Promise<{ value: T; response: AiResponse }> {
  return serial(() => send(ctx, call));
}

async function send<T>(ctx: ActionContext, call: ModelCall<T>): Promise<{ value: T; response: AiResponse }> {
  const stored = await ctx.settings();
  const settings = rollMonth(stored, ctx.now());
  if (settings.api.month !== stored.api.month) await ctx.saveSettings(settings);
  if (settings.no_ai) throw new ActionError('ai_unavailable', '', 'No AI mode is on. Enter the value by hand.');
  const ready = await ctx.ai.ready();
  if (!ready.ok) throw new ActionError('ai_unavailable', '', `${ready.reason}. Add a key in Settings, or enter the value by hand.`);

  const model = ctx.ai.model;
  const price = PRICES[model];
  if (!price) throw new ActionError('ai_unavailable', '', `no price is recorded for ${model}`);
  const worst = round4(worstCaseInr(model, [call.system, call.user, JSON.stringify(call.schema)], call.maxTokens));
  const { cap_inr, used_inr } = settings.api;
  if (used_inr + worst > cap_inr) {
    throw new ActionError(
      'ai_unavailable', '',
      `Not sent: this call could cost up to ${rupees(worst)}, and ${rupees(Math.max(0, cap_inr - used_inr))} of this month's ₹${cap_inr} cap is left. ` +
        'Raise the cap in Settings, or enter the value by hand.',
    );
  }

  const meter = ctx.call;
  const ai = {
    provider: ctx.ai.name, model, prompt_id: call.prompt_id, prompt_version: call.prompt_version,
    sent: { system: call.system, user: call.user }, tokens_in: 0, tokens_out: 0, ms: 0, stop_reason: 'not sent', worst_inr: worst,
    price: { usd_in_per_mtok: price.usd_in_per_mtok, usd_out_per_mtok: price.usd_out_per_mtok, price_read: price.read, inr_per_usd: INR_PER_USD.rate, rate_date: INR_PER_USD.date },
  };
  if (meter) meter.ai = ai;

  /** Adds what the API billed to the month and to the decision row. */
  const settle = async (usage: { input_tokens: number; output_tokens: number }, ms: number, stop: string) => {
    const cost = round4(costInr(model, usage.input_tokens, usage.output_tokens));
    const now = await ctx.settings();
    await ctx.saveSettings({ ...now, api: { ...now.api, month: settings.api.month, used_inr: round4(now.api.used_inr + cost) } });
    Object.assign(ai, { tokens_in: usage.input_tokens, tokens_out: usage.output_tokens, ms, stop_reason: stop });
    if (meter) meter.cost_inr = cost;
    ctx.events.emit({ type: 'settings' });
    return cost;
  };

  let response: AiResponse;
  try {
    response = await ctx.ai.complete(call);
  } catch (e) {
    const err = e instanceof AiCallError ? e : new AiCallError((e as Error).message);
    const cost = await settle(err.usage, err.ms, 'error');
    throw new ActionError('failed', '', `The model call failed: ${err.message}.${cost ? ` It cost ${rupees(cost)}, logged.` : ''}`);
  }
  const cost = await settle(response.usage, response.ms, response.stopReason);

  let json: unknown;
  try {
    json = JSON.parse(response.text);
  } catch {
    throw new ActionError('model_output', '', `The model's answer was refused: it is not valid JSON. It cost ${rupees(cost)}, logged.`);
  }
  const parsed = call.parse.safeParse(json);
  if (!parsed.success) {
    const why = parsed.error.issues.map((i) => `${i.path.join('.') || 'answer'}: ${i.message}`).join('; ');
    throw new ActionError('model_output', '', `The model's answer was refused (${why}). It cost ${rupees(cost)}, logged.`);
  }
  return { value: parsed.data, response };
}
