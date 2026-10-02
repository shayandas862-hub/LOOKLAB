// The engine: one Node process on 127.0.0.1 serving the UI, the action API, events and MCP (AD-LL-001).
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, normalize, extname, sep } from 'node:path';
import { userInfo } from 'node:os';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { ActionError, buildRegistry, DEFAULT_MAX_BYTES, mcpName, type Registry } from '../actions/index.ts';
import type { ActionContext } from '../actions/context.ts';
import { seedSampleIfEmpty } from '../actions/seed.ts';
import { Decision, Settings, type Via } from '../contracts/index.ts';
import type { AiProvider } from './ai.ts';
import { AnthropicProvider } from './anthropic.ts';
import { EmptyKeychain, type SecretStore } from './keychain.ts';
import { EventBus } from './events.ts';
import { createMcpServer, inputJsonSchema, VERSION } from './mcp.ts';
import { bearer, ensureToken, hostAllowed, RateLimiter, tokenMatches } from './security.ts';
import { FileStore, type Store } from './store.ts';

export interface EngineOptions {
  home: string;
  port: number;
  uiDir?: string;
  rateLimit?: { perSecond: number; burst: number };
  quiet?: boolean;
  /** Where the API key lives. main.ts passes the macOS Keychain; anything else (tests) gets one that is always empty. */
  keychain?: SecretStore;
  /** The model provider; by default Anthropic, reading its key from `keychain` (P4). */
  ai?: AiProvider;
}

export interface Engine {
  port: number;
  url: string;
  events: EventBus;
  registry: Registry;
  close(): Promise<void>;
}

const STATUS: Record<string, number> = {
  unknown_action: 404, not_found: 404, invalid_input: 400, needs_approval: 403, ai_unavailable: 409, model_output: 502, invalid_output: 500, failed: 500,
};
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json',
};
/** An oversized body is read and discarded up to this size so the 413 reaches the client; beyond it the socket is dropped. */
const DRAIN_CAP = 16_000_000;

class TooLarge extends Error {
  limit: number;
  constructor(limit: number) {
    super(`request body is larger than ${limit / 1_000_000} MB`);
    this.limit = limit;
  }
}

function send(res: ServerResponse, status: number, body: unknown) {
  const text = JSON.stringify(body);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(text);
}

/** Reads a request body up to `limit` bytes; past it, nothing more is kept and TooLarge is thrown. */
async function readBody(req: IncomingMessage, limit = DEFAULT_MAX_BYTES): Promise<string> {
  if (Number(req.headers['content-length']) > DRAIN_CAP) {
    req.destroy();
    throw new TooLarge(limit);
  }
  let size = 0;
  let over = false;
  const chunks: Buffer[] = [];
  for await (const c of req) {
    size += (c as Buffer).length;
    if (size > limit) {
      over = true;
      if (size > DRAIN_CAP) {
        req.destroy();
        break;
      }
      continue;
    }
    chunks.push(c as Buffer);
  }
  if (over) throw new TooLarge(limit);
  return Buffer.concat(chunks).toString('utf8');
}

export async function startEngine(opts: EngineOptions): Promise<Engine> {
  const token = await ensureToken(opts.home);
  const store: Store = new FileStore(opts.home);
  const events = new EventBus();
  const registry = buildRegistry();
  const keychain: SecretStore = opts.keychain ?? new EmptyKeychain();
  const ai: AiProvider = opts.ai ?? new AnthropicProvider(keychain);
  const limiter = new RateLimiter(opts.rateLimit?.perSecond ?? 50, opts.rateLimit?.burst ?? 200);
  const user = userInfo().username;
  const workspace = 'local';
  let port = opts.port;
  let mcpLastSeen: string | null = null;

  const scrub = (s: string) => s.split(opts.home).join('~LookLab');
  const shellQuote = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;

  const context = (via: Via): ActionContext => ({
    store, events, ai, keychain, via, user, workspace,
    now: () => new Date().toISOString(),
    settings: async () => Settings.parse((await store.get('system', 'settings')) ?? { schema_version: 1, api: {} }),
    saveSettings: async (s) => store.put('system', 'settings', Settings.parse(s)),
    logDecision: (d) => store.append('decisions', Decision.parse(d)),
    listDecisions: async () => {
      const rows = await store.readStream<Decision>('decisions');
      const verdicts = new Map((await store.readStream<{ decision_id: string; verdict: 'agreed' | 'overridden' }>('verdicts')).map((v) => [v.decision_id, v.verdict]));
      return rows.map((r) => ({ ...r, verdict: verdicts.get(r.id) ?? r.verdict }));
    },
    engineInfo: () => ({ mcp_last_seen: mcpLastSeen, tools: registry.list().length }),
    mcpCommand: () =>
      `claude mcp add --transport http looklab http://127.0.0.1:${port}/mcp --header "Authorization: Bearer $(cat ${shellQuote(join(opts.home, 'token'))})"`,
  });

  await seedSampleIfEmpty(store, new Date().toISOString(), user, workspace);

  const actionList = registry.list().map((a) => ({
    name: a.name, mcp: mcpName(a.name), title: a.title, description: a.description, tier: a.tier, effect: a.effect,
    confirm: !!a.confirm, ai: !!a.ai, stand_in: !!a.standIn, command: a.command !== false, key: a.key ?? '', rules: a.rules ?? [],
    input: inputJsonSchema(a),
  }));

  async function api(req: IncomingMessage, res: ServerResponse, path: string) {
    if (path === '/api/session' && req.method === 'GET') {
      if (req.headers['sec-fetch-site'] !== 'same-origin') return send(res, 403, { code: 'forbidden', message: 'the session token is only given to the Look Lab page' });
      return send(res, 200, { token, version: VERSION });
    }
    if (!tokenMatches(req.headers['x-looklab-token'] as string | undefined, token)) return send(res, 401, { code: 'unauthorised', message: 'missing or wrong X-LookLab-Token' });
    if (path === '/api/actions' && req.method === 'GET') return send(res, 200, { actions: actionList });
    if (path === '/api/events' && req.method === 'GET') return streamEvents(req, res);
    const m = /^\/api\/actions\/([a-z]+\.[a-z0-9_]+)$/.exec(path);
    if (m && req.method === 'POST') {
      let input: unknown;
      try {
        const body = await readBody(req, registry.get(m[1])?.maxBytes ?? DEFAULT_MAX_BYTES);
        input = body.trim() ? JSON.parse(body) : {};
      } catch (e) {
        if (e instanceof TooLarge) return send(res, 413, { code: 'too_large', action: m[1], message: e.message });
        return send(res, 400, { code: 'invalid_input', message: 'body is not valid JSON' });
      }
      try {
        const via: Via = req.headers['x-looklab-via'] === 'cli' ? 'cli' : 'ui';
        return send(res, 200, await registry.invoke(m[1], input, context(via)));
      } catch (e) {
        const err = e instanceof ActionError ? e : new ActionError('failed', m[1], 'internal error');
        return send(res, STATUS[err.code] ?? 500, { code: err.code, action: err.action, message: scrub(err.message) });
      }
    }
    return send(res, 404, { code: 'not_found', message: `no route ${req.method} ${path}` });
  }

  function streamEvents(req: IncomingMessage, res: ServerResponse) {
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store', connection: 'keep-alive' });
    const write = (e: unknown) => res.write(`data: ${JSON.stringify(e)}\n\n`);
    write({ type: 'hello', version: VERSION });
    const off = events.on(write);
    const ping = setInterval(() => res.write(': ping\n\n'), 25_000);
    req.on('close', () => {
      off();
      clearInterval(ping);
    });
  }

  async function mcp(req: IncomingMessage, res: ServerResponse) {
    if (!tokenMatches(bearer(req.headers.authorization), token)) return send(res, 401, { code: 'unauthorised', message: 'missing or wrong bearer token' });
    mcpLastSeen = new Date().toISOString();
    let body: unknown;
    if (req.method === 'POST') {
      try {
        body = JSON.parse(await readBody(req));
      } catch (e) {
        if (e instanceof TooLarge) return send(res, 413, { code: 'too_large', message: e.message });
        return send(res, 400, { code: 'invalid_input', message: 'body is not valid JSON' });
      }
    }
    const server = createMcpServer(registry, context);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    res.on('close', () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  }

  async function staticFile(res: ServerResponse, path: string) {
    const root = opts.uiDir;
    if (!root) return send(res, 404, { code: 'not_found', message: 'UI not built: run `npm run build`' });
    const rel = normalize(decodeURIComponent(path)).replace(/^(\.\.[/\\])+/, '');
    let file = join(root, rel);
    if (!file.startsWith(root + sep) && file !== root) return send(res, 403, { code: 'forbidden', message: 'outside the UI folder' });
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    } catch {
      file = join(root, 'index.html');
    }
    try {
      const data = await readFile(file);
      res.writeHead(200, {
        'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'referrer-policy': 'no-referrer',
        'cache-control': file.endsWith('index.html') ? 'no-store' : 'public, max-age=31536000, immutable',
      });
      res.end(data);
    } catch {
      send(res, 404, { code: 'not_found', message: 'UI not built: run `npm run build`' });
    }
  }

  const server = createServer(async (req, res) => {
    try {
      if (!hostAllowed(req.headers.host, port)) return send(res, 403, { code: 'forbidden', message: 'wrong host' });
      if (req.method === 'OPTIONS') return send(res, 403, { code: 'forbidden', message: 'cross-origin requests are not allowed' });
      const path = new URL(req.url ?? '/', 'http://x').pathname;
      const bucket = path.startsWith('/api/') || path === '/mcp' ? 'api' : 'static';
      if (!limiter.take(`${req.socket.remoteAddress}:${bucket}`)) return send(res, 429, { code: 'rate_limited', message: 'too many requests; slow down' });
      if (path.startsWith('/api/')) return await api(req, res, path);
      if (path === '/mcp') return await mcp(req, res);
      if (req.method === 'GET') return await staticFile(res, path);
      return send(res, 405, { code: 'method_not_allowed', message: 'method not allowed' });
    } catch (e) {
      if (!opts.quiet) console.error('[engine]', scrub(String((e as Error).stack ?? e)));
      if (!res.headersSent) send(res, 500, { code: 'failed', message: 'internal error' });
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(opts.port, '127.0.0.1', () => resolve());
  });
  port = (server.address() as { port: number }).port;

  return {
    port,
    url: `http://127.0.0.1:${port}`,
    events,
    registry,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        server.close(() => resolve());
      }),
  };
}
