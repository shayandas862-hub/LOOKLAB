// The API key (P4 task 1, standing rule 6): settings.add_provider is real, takes the key from the Look Lab window only,
// stores it in the Keychain and nowhere else, and never repeats it. MCP and the CLI are refused: an agent must not
// handle the key, and a key typed into a terminal lands in its history.
import { beforeEach, describe, expect, test } from 'vitest';
import { buildRegistry, type Registry } from '../../src/actions/index.ts';
import { memoryContext } from './memory-context.ts';
import { memoryKeychain, stubAi, TEST_KEY } from './stub-ai.ts';

let kc: ReturnType<typeof memoryKeychain>;
let ctx: ReturnType<typeof memoryContext>;
let registry: Registry;
beforeEach(() => {
  kc = memoryKeychain(null);
  ctx = memoryContext({ ai: stubAi({}, kc).provider, keychain: kc });
  registry = buildRegistry();
});

describe('settings.add_provider', () => {
  test('is a real action now: no stand-in flag', () => {
    expect(registry.get('settings.add_provider')!.standIn).toBe(false);
  });

  test('from the window, the key goes to the Keychain and the provider is set; the answer never repeats the key', async () => {
    const r = await registry.invoke('settings.add_provider', { provider: 'anthropic', api_key: TEST_KEY }, ctx.for('ui'));
    expect(kc.value).toBe(TEST_KEY);
    expect(ctx.settings.api.provider).toBe('anthropic');
    expect(r.result).toEqual({ provider: 'anthropic', key_in_keychain: true });
    expect(JSON.stringify(r)).not.toContain(TEST_KEY);
  });

  test('its decision row redacts the key', async () => {
    await registry.invoke('settings.add_provider', { provider: 'anthropic', api_key: TEST_KEY }, ctx.for('ui'));
    const row = ctx.decisions.at(-1)!;
    expect(JSON.stringify(row)).not.toContain(TEST_KEY);
    expect(row.inputs).toContain('[redacted]');
  });

  test('over MCP and over the CLI it is refused, says why, and stores nothing', async () => {
    for (const via of ['mcp', 'cli'] as const) {
      const err = await registry.invoke('settings.add_provider', { provider: 'anthropic', api_key: TEST_KEY }, ctx.for(via)).then(() => null, (e) => e);
      expect(err, via).not.toBeNull();
      expect(err.message, via).toMatch(/Settings in the Look Lab window/);
      expect(err.message, via).not.toContain(TEST_KEY);
      expect(JSON.stringify(ctx.decisions.at(-1)), via).not.toContain(TEST_KEY);
    }
    expect(kc.value).toBeNull();
  });

  test('a malformed key is refused without being repeated', async () => {
    const bad = 'sk-ant-not a key';
    const err = await registry.invoke('settings.add_provider', { provider: 'anthropic', api_key: bad }, ctx.for('ui')).then(() => null, (e) => e);
    expect(err.message).toMatch(/does not look like an Anthropic API key/);
    expect(err.message).not.toContain('not a key');
    expect(kc.value).toBeNull();
  });

  test('other providers are not offered until cloud jobs (P10)', async () => {
    const err = await registry.invoke('settings.add_provider', { provider: 'fal' }, ctx.for('ui')).then(() => null, (e) => e);
    expect(err.message).toMatch(/P10/);
  });

  test('settings.remove_provider deletes the key from the Keychain', async () => {
    await registry.invoke('settings.add_provider', { provider: 'anthropic', api_key: TEST_KEY }, ctx.for('ui'));
    await registry.invoke('settings.remove_provider', {}, ctx.for('ui'));
    expect(kc.value).toBeNull();
    expect(ctx.settings.api.provider).toBe('none');
  });
});

describe('settings.ai_status', () => {
  test('says whether AI is ready and, if not, which reason: No AI mode, no key, or the cap', async () => {
    const status = async () => (await registry.invoke('settings.ai_status', {}, ctx.for('ui'))).result as Record<string, unknown>;
    expect(await status()).toMatchObject({ ready: false, reason: 'No API key in the Keychain', key_in_keychain: false, model: 'claude-opus-5' });
    await registry.invoke('settings.add_provider', { provider: 'anthropic', api_key: TEST_KEY }, ctx.for('ui'));
    expect(await status()).toMatchObject({ ready: true, reason: '', key_in_keychain: true });
    ctx.settings.api.used_inr = ctx.settings.api.cap_inr;
    expect(await status()).toMatchObject({ ready: false, reason: 'Monthly spend cap reached' });
    ctx.settings.no_ai = true;
    expect(await status()).toMatchObject({ ready: false, reason: 'No AI mode is on' });
    expect(JSON.stringify(await status())).not.toContain(TEST_KEY);
  });
});
