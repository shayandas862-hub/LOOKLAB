// Guards for a server any website can reach (AD-LL-008).
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile, mkdir, chmod } from 'node:fs/promises';
import { join } from 'node:path';

/** Only the engine's own address may appear in Host: this blocks DNS rebinding. */
export function hostAllowed(host: string | undefined, port: number): boolean {
  if (!host) return false;
  return host === `127.0.0.1:${port}` || host === `localhost:${port}` || host === `[::1]:${port}`;
}

export function tokenMatches(given: string | undefined, token: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function bearer(header: string | undefined): string | undefined {
  const m = /^Bearer\s+(\S+)$/i.exec(header ?? '');
  return m?.[1];
}

/** Reads the engine token, creating it (mode 0600) on first start. */
export async function ensureToken(home: string): Promise<string> {
  const path = join(home, 'token');
  try {
    const t = (await readFile(path, 'utf8')).trim();
    if (t.length >= 40) {
      await chmod(path, 0o600);
      return t;
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }
  await mkdir(home, { recursive: true, mode: 0o700 });
  const token = randomBytes(32).toString('hex');
  await writeFile(path, token + '\n', { mode: 0o600 });
  return token;
}

/** Token bucket per client key. A runaway agent loop gets 429s instead of filling the disk. */
export class RateLimiter {
  private buckets = new Map<string, { tokens: number; at: number }>();
  private perSecond: number;
  private burst: number;
  constructor(perSecond: number, burst: number) {
    this.perSecond = perSecond;
    this.burst = burst;
  }

  take(key: string, now = Date.now()): boolean {
    const b = this.buckets.get(key) ?? { tokens: this.burst, at: now };
    b.tokens = Math.min(this.burst, b.tokens + ((now - b.at) / 1000) * this.perSecond);
    b.at = now;
    const ok = b.tokens >= 1;
    if (ok) b.tokens -= 1;
    this.buckets.set(key, b);
    return ok;
  }
}
