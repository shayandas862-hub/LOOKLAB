// Prices and the INR rate are dated data (P4 task 2). A call is priced at its worst case before it is sent, and at
// its real usage after.
import { describe, expect, test } from 'vitest';
import { INR_PER_USD, MODEL, PRICES, costInr, monthOf, worstCaseInr, worstInputTokens } from '../../src/engine/pricing.ts';

describe('pricing', () => {
  test('the model, its price and the rupee rate carry the date and the source they were read from', () => {
    expect(MODEL).toBe('claude-opus-5');
    expect(PRICES[MODEL]).toMatchObject({ usd_in_per_mtok: 5, usd_out_per_mtok: 25, read: '2026-10-01' });
    expect(PRICES[MODEL].source).toMatch(/platform\.claude\.com\/docs\/en\/about-claude\/pricing/);
    expect(INR_PER_USD).toMatchObject({ rate: 96.33, date: '2026-10-01' });
    expect(INR_PER_USD.source).toMatch(/ECB/);
  });

  test('a real call costs its tokens at the dated prices: 1,000 in and 500 out on Opus 5 is ₹1.6858', () => {
    expect(costInr(MODEL, 1000, 500)).toBeCloseTo(((1000 * 5 + 500 * 25) / 1e6) * 96.33, 6);
    expect(costInr(MODEL, 1000, 500)).toBeCloseTo(1.6858, 4);
  });

  test('the input bound counts one token per UTF-8 byte (a token is never shorter than a byte), plus an allowance', () => {
    const text = 'Palette #1B2230 38%, warm–cold'; // the en dash is 3 bytes
    expect(worstInputTokens([text])).toBeGreaterThanOrEqual(Buffer.byteLength(text, 'utf8'));
    expect(worstInputTokens([text, text])).toBe(worstInputTokens([text]) + Buffer.byteLength(text, 'utf8'));
  });

  test('the worst case is the input bound plus every output token max_tokens allows', () => {
    const w = worstCaseInr(MODEL, ['a'.repeat(4000)], 1024);
    expect(w).toBeCloseTo(costInr(MODEL, worstInputTokens(['a'.repeat(4000)]), 1024), 6);
    expect(w).toBeGreaterThan(costInr(MODEL, 1000, 1024));
  });

  test('an unknown model has no price and cannot be called', () => {
    expect(() => costInr('claude-unknown', 1, 1)).toThrow(/no price/);
  });

  test('the billing month is the UTC month, as Anthropic bills', () => {
    expect(monthOf('2026-10-31T23:59:59.999Z')).toBe('2026-10');
    expect(monthOf('2026-11-01T00:00:00.000Z')).toBe('2026-11');
    // 05:00 on 1 November in India is still October in UTC.
    expect(monthOf(new Date('2026-11-01T05:00:00+05:30').toISOString())).toBe('2026-10');
  });
});
