// The Keychain wrapper (P4, standing rule 6): the key goes to macOS's `security` tool on stdin, never in argv (where
// any process on the Mac could read it with ps), and is read back only from the Keychain. The suite runs a fake
// `security`; nothing here touches the real Keychain.
import { describe, expect, test } from 'vitest';
import { MacKeychain, KEY_PATTERN, type SecurityRun } from '../../src/engine/keychain.ts';

const KEY = 'sk-ant-api03-TESTONLY_abcdefghijklmnopqrstuvwxyz0123456789-XYZ';

function fakeSecurity(stored: { value: string | null }) {
  const calls: { args: string[]; stdin?: string }[] = [];
  const run: SecurityRun = async (args, stdin) => {
    calls.push({ args, stdin });
    if (args[0] === '-i') {
      const m = /add-generic-password -U -a (\S+) -s (\S+) -w (\S+)\n$/.exec(stdin ?? '');
      if (!m) return { code: 1, stdout: '' };
      stored.value = m[3];
      return { code: 0, stdout: '' };
    }
    if (args[0] === 'find-generic-password') {
      if (stored.value === null) return { code: 44, stdout: '' };
      return { code: 0, stdout: args.includes('-w') ? `${stored.value}\n` : 'keychain: "login.keychain-db"\n' };
    }
    if (args[0] === 'delete-generic-password') {
      const had = stored.value !== null;
      stored.value = null;
      return { code: had ? 0 : 44, stdout: '' };
    }
    return { code: 1, stdout: '' };
  };
  return { calls, run };
}

describe('MacKeychain', () => {
  test('stores the key through stdin; the key never appears in any argv', async () => {
    const stored = { value: null as string | null };
    const sec = fakeSecurity(stored);
    await new MacKeychain(sec.run).set(KEY);
    expect(stored.value).toBe(KEY);
    for (const c of sec.calls) expect(c.args.join(' ')).not.toContain(KEY);
    expect(sec.calls[0]).toMatchObject({ args: ['-i'] });
    expect(sec.calls[0].stdin).toContain(KEY);
  });

  test('reads the key back from the Keychain, and says when there is none', async () => {
    const stored = { value: null as string | null };
    const kc = new MacKeychain(fakeSecurity(stored).run);
    expect(await kc.get()).toBeNull();
    expect(await kc.has()).toBe(false);
    await kc.set(KEY);
    expect(await kc.get()).toBe(KEY);
    expect(await kc.has()).toBe(true);
  });

  test('has() asks whether the item exists without reading the key', async () => {
    const stored = { value: KEY as string | null };
    const sec = fakeSecurity(stored);
    await new MacKeychain(sec.run).has();
    expect(sec.calls.at(-1)!.args).not.toContain('-w');
  });

  test('remove() deletes the item; removing twice is not an error', async () => {
    const stored = { value: KEY as string | null };
    const kc = new MacKeychain(fakeSecurity(stored).run);
    await kc.remove();
    await kc.remove();
    expect(stored.value).toBeNull();
  });

  test('a malformed key is refused before `security` runs, and the error does not repeat it', async () => {
    const sec = fakeSecurity({ value: null });
    const bad = 'sk-ant-api03-has space; rm -rf ~';
    const err = await new MacKeychain(sec.run).set(bad).then(() => null, (e: Error) => e);
    expect(err?.message).toMatch(/does not look like an Anthropic API key/);
    expect(err?.message).not.toContain('rm -rf');
    expect(sec.calls).toHaveLength(0);
    expect(KEY_PATTERN.test(KEY)).toBe(true);
    expect(KEY_PATTERN.test('sk-ant-x\nadd-generic-password')).toBe(false);
  });

  test('a failure of `security` is reported without the key', async () => {
    const run: SecurityRun = async () => ({ code: 51, stdout: '' });
    const err = await new MacKeychain(run).set(KEY).then(() => null, (e: Error) => e);
    expect(err?.message).toMatch(/Keychain/);
    expect(err?.message).not.toContain(KEY);
  });
});
