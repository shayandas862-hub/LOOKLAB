// What an in-app AI call costs (P4, D-LL-040). Prices and the rupee rate are dated data, read on the day named and
// changed only by editing this file with a new date. Nothing here calls the network.

const PRICE_PAGE = 'https://platform.claude.com/docs/en/about-claude/pricing';

export interface Price {
  usd_in_per_mtok: number;
  usd_out_per_mtok: number;
  /** The day the price page was read. */
  read: string;
  source: string;
}

/** USD per million tokens, standard (global) rates, no batch, no cache, no fast mode. */
export const PRICES: Record<string, Price> = {
  'claude-opus-5': { usd_in_per_mtok: 5, usd_out_per_mtok: 25, read: '2026-10-01', source: PRICE_PAGE },
  'claude-opus-5-5': { usd_in_per_mtok: 4, usd_out_per_mtok: 20, read: '2026-10-01', source: PRICE_PAGE },
  'claude-sonnet-5': { usd_in_per_mtok: 2, usd_out_per_mtok: 10, read: '2026-10-01', source: PRICE_PAGE },
  'claude-haiku-4-5': { usd_in_per_mtok: 1, usd_out_per_mtok: 5, read: '2026-10-01', source: PRICE_PAGE },
};

/** The model the in-app AI calls (founder's choice, 2026-10-01, D-LL-040). */
export const MODEL = 'claude-opus-5';

/** Rupees per US dollar: the ECB reference rate of the day, read through api.frankfurter.app. */
export const INR_PER_USD = { rate: 96.33, date: '2026-10-01', source: 'ECB reference rate, via api.frankfurter.app' } as const;

/**
 * Tokens the request's framing may add beyond its text: message wrapping, and the instructions the API adds for a
 * structured-output schema. An allowance, checked against the usage of real calls (docs/progress-log.md, PR-LL-004).
 */
export const INPUT_ALLOWANCE = 500;

function price(model: string): Price {
  const p = PRICES[model];
  if (!p) throw new Error(`no price is recorded for ${model}; add it to src/engine/pricing.ts with the date it was read`);
  return p;
}

/** Rupees for a call's real token counts. */
export function costInr(model: string, tokensIn: number, tokensOut: number): number {
  const p = price(model);
  return ((tokensIn * p.usd_in_per_mtok + tokensOut * p.usd_out_per_mtok) / 1e6) * INR_PER_USD.rate;
}

/** An upper bound on input tokens: one per UTF-8 byte (no token is shorter than a byte), plus the allowance. */
export function worstInputTokens(texts: string[]): number {
  return texts.reduce((n, t) => n + Buffer.byteLength(t, 'utf8'), 0) + INPUT_ALLOWANCE;
}

/** The most a call can cost: the input bound, plus every output token `max_tokens` allows (thinking included). */
export function worstCaseInr(model: string, texts: string[], maxTokens: number): number {
  return costInr(model, worstInputTokens(texts), maxTokens);
}

/** The billing month of an ISO time, in UTC as Anthropic bills: "2026-10". */
export function monthOf(iso: string): string {
  return new Date(iso).toISOString().slice(0, 7);
}

/** Rupees kept to 1/10,000, so a running total is the exact sum of its rows. */
export const round4 = (n: number) => Math.round(n * 10_000) / 10_000;
