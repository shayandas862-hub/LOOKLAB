// The only place an API key lives: the macOS Keychain (standing rule 6, AD-LL-003). The key is handed to Apple's
// `security` tool on stdin through its interactive mode, never in argv (argv is visible to every process through
// ps), and it is read back from the Keychain for each call, never kept by the engine.
import { spawn } from 'node:child_process';

/** Where the key is kept: a generic password in the login keychain. */
export const SERVICE = 'look-lab';
export const ACCOUNT = 'anthropic-api-key';

/** What an Anthropic API key looks like. Anything else is refused before `security` runs (no quoting, no newline). */
export const KEY_PATTERN = /^sk-ant-[A-Za-z0-9_-]{16,256}$/;

/** `security` exits 44 when the item is not in the Keychain. */
const NOT_FOUND = 44;

export interface SecretStore {
  /** The key, or null when there is none. */
  get(): Promise<string | null>;
  /** Whether a key is stored, without reading it. */
  has(): Promise<boolean>;
  set(key: string): Promise<void>;
  remove(): Promise<void>;
}

export type SecurityRun = (args: string[], stdin?: string) => Promise<{ code: number; stdout: string }>;

/** Runs /usr/bin/security; its stderr is dropped (it can name the item, never the key). */
export const runSecurity: SecurityRun = (args, stdin) =>
  new Promise((resolve, reject) => {
    const child = spawn('/usr/bin/security', args, { stdio: ['pipe', 'pipe', 'ignore'] });
    let stdout = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.on('error', reject);
    child.on('close', (code) => resolve({ code: code ?? 1, stdout }));
    child.stdin.end(stdin ?? '');
  });

export class MacKeychain implements SecretStore {
  private run: SecurityRun;

  constructor(run: SecurityRun = runSecurity) {
    this.run = run;
  }

  async get(): Promise<string | null> {
    const r = await this.run(['find-generic-password', '-a', ACCOUNT, '-s', SERVICE, '-w']);
    if (r.code === NOT_FOUND) return null;
    if (r.code !== 0) throw new Error(`the Keychain could not be read (security exited ${r.code})`);
    return r.stdout.trim() || null;
  }

  async has(): Promise<boolean> {
    const r = await this.run(['find-generic-password', '-a', ACCOUNT, '-s', SERVICE]);
    if (r.code === NOT_FOUND) return false;
    if (r.code !== 0) throw new Error(`the Keychain could not be read (security exited ${r.code})`);
    return true;
  }

  async set(key: string): Promise<void> {
    if (!KEY_PATTERN.test(key)) throw new Error('that does not look like an Anthropic API key (sk-ant-…); nothing was stored');
    // -U replaces an existing key. The command, key included, travels on stdin.
    const r = await this.run(['-i'], `add-generic-password -U -a ${ACCOUNT} -s ${SERVICE} -w ${key}\n`);
    if (r.code !== 0) throw new Error(`the Keychain refused the key (security exited ${r.code}); nothing was stored`);
  }

  async remove(): Promise<void> {
    const r = await this.run(['delete-generic-password', '-a', ACCOUNT, '-s', SERVICE]);
    if (r.code !== 0 && r.code !== NOT_FOUND) throw new Error(`the Keychain could not remove the key (security exited ${r.code})`);
  }
}

/** No key, ever: what an engine gets unless it is given a Keychain (tests, and anything not on the founder's Mac). */
export class EmptyKeychain implements SecretStore {
  async get() {
    return null;
  }
  async has() {
    return false;
  }
  async set(): Promise<void> {
    throw new Error('this engine has no Keychain; start Look Lab with npm start to store a key');
  }
  async remove() {}
}
