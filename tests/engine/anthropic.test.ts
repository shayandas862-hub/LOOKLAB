// The Anthropic provider (P4 task 1): plain node:https (D-LL-041), the key read from the Keychain for each call,
// structured output. The suite drives it through a stub transport; the real transport is refused by the
// no-network guard, so a test that reached the provider by mistake would fail.
import { describe, expect, test } from 'vitest';
import { AnthropicProvider, AiCallError, type Transport } from '../../src/engine/anthropic.ts';
import type { SecretStore } from '../../src/engine/keychain.ts';

const KEY = 'sk-ant-api03-TESTONLY_abcdefghijklmnopqrstuvwxyz0123456789-XYZ';

export function memoryKeychain(value: string | null = KEY) {
  const kc = { value, reads: 0 } as { value: string | null; reads: number } & SecretStore;
  kc.get = async () => (kc.reads++, kc.value);
  kc.has = async () => kc.value !== null;
  kc.set = async (k: string) => void (kc.value = k);
  kc.remove = async () => void (kc.value = null);
  return kc;
}

function stub(status: number, body: unknown) {
  const sent: { host: string; path: string; method: string; headers: Record<string, string>; body: string }[] = [];
  const transport: Transport = async (req) => (sent.push(req), { status, body: JSON.stringify(body) });
  return { sent, transport };
}

const OK = {
  model: 'claude-opus-5', stop_reason: 'end_turn',
  content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: '{"words":["lonely"],"confidence":72,"why":"cool shadows"}' }],
  usage: { input_tokens: 812, output_tokens: 95 },
};
const REQ = { system: 'You choose mood words.', user: '{"palette":[]}', schema: { type: 'object' }, maxTokens: 1024, effort: 'low' as const };

describe('AnthropicProvider', () => {
  test('sends one Messages API request with the key from the Keychain and a JSON schema for the answer', async () => {
    const kc = memoryKeychain();
    const s = stub(200, OK);
    const r = await new AnthropicProvider(kc, s.transport).complete(REQ);
    expect(s.sent).toHaveLength(1);
    const req = s.sent[0];
    expect(req).toMatchObject({ host: 'api.anthropic.com', path: '/v1/messages', method: 'POST' });
    expect(req.headers).toMatchObject({ 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' });
    const body = JSON.parse(req.body);
    expect(body).toMatchObject({
      model: 'claude-opus-5', max_tokens: 1024, system: 'You choose mood words.',
      messages: [{ role: 'user', content: '{"palette":[]}' }],
      output_config: { effort: 'low', format: { type: 'json_schema', schema: { type: 'object' } } },
    });
    expect(kc.reads).toBe(1);
    expect(r).toMatchObject({ text: OK.content[1].text, model: 'claude-opus-5', stopReason: 'end_turn', usage: { input_tokens: 812, output_tokens: 95 } });
    expect(r.ms).toBeGreaterThanOrEqual(0);
  });

  test('the provider never holds the key: it reads it again for every call', async () => {
    const kc = memoryKeychain();
    const p = new AnthropicProvider(kc, stub(200, OK).transport);
    await p.complete(REQ);
    await p.complete(REQ);
    expect(kc.reads).toBe(2);
    // The stub Keychain holds the key (it is the Keychain); the provider's own fields must not.
    expect(JSON.stringify({ ...p, keychain: undefined })).not.toContain(KEY);
  });

  test('with no key it is not ready, says why, and sends nothing', async () => {
    const s = stub(200, OK);
    const p = new AnthropicProvider(memoryKeychain(null), s.transport);
    expect(await p.ready()).toEqual({ ok: false, reason: 'No API key in the Keychain' });
    await expect(p.complete(REQ)).rejects.toThrow(/no API key/);
    expect(s.sent).toHaveLength(0);
  });

  test('an API error names the status and never the key, even if the body repeats it', async () => {
    const s = stub(401, { type: 'error', error: { type: 'authentication_error', message: `invalid x-api-key ${KEY}` } });
    const err = await new AnthropicProvider(memoryKeychain(), s.transport).complete(REQ).then(() => null, (e) => e);
    expect(err).toBeInstanceOf(AiCallError);
    expect(err.message).toMatch(/401/);
    expect(err.message).not.toContain(KEY);
    expect(err.usage).toEqual({ input_tokens: 0, output_tokens: 0 });
  });

  test('a refusal and a cut-off answer are errors that still carry the tokens billed', async () => {
    for (const [stop, msg] of [['refusal', /declined/], ['max_tokens', /cut off/]] as const) {
      const s = stub(200, { ...OK, stop_reason: stop, usage: { input_tokens: 800, output_tokens: 1024 } });
      const err = await new AnthropicProvider(memoryKeychain(), s.transport).complete(REQ).then(() => null, (e) => e);
      expect(err.message).toMatch(msg);
      expect(err.usage).toEqual({ input_tokens: 800, output_tokens: 1024 });
    }
  });

  test('the real transport cannot leave the machine in a test (no-network guard)', async () => {
    const err = await new AnthropicProvider(memoryKeychain()).complete(REQ).then(() => null, (e) => e);
    expect(String(err?.message)).toMatch(/no-network guard|could not reach/);
    expect(String(err?.message)).not.toContain(KEY);
  });
});
