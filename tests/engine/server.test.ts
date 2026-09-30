import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createHash } from 'node:crypto';
import { startEngine, type Engine } from '../../src/engine/engine.ts';
import { buildRegistry, mcpName } from '../../src/actions/index.ts';
import { encodePng } from '../../src/engine/png.ts';
import { addNoise, blank } from '../core/synth.ts';

let home: string;
let engine: Engine;
let token: string;

beforeAll(async () => {
  home = mkdtempSync(join(tmpdir(), 'looklab-engine-'));
  engine = await startEngine({ home, port: 0, rateLimit: { perSecond: 200, burst: 400 }, quiet: true });
  token = readFileSync(join(home, 'token'), 'utf8').trim();
});
afterAll(async () => {
  await engine.close();
  rmSync(home, { recursive: true, force: true });
});

type Res = { status: number; body: string; headers: Record<string, string | string[] | undefined> };

function raw(method: string, path: string, headers: Record<string, string> = {}, body?: string): Promise<Res> {
  return new Promise((resolve, reject) => {
    const req = request({ host: '127.0.0.1', port: engine.port, method, path, headers }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode!, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

const ui = (extra: Record<string, string> = {}) => ({ 'x-looklab-token': token, 'content-type': 'application/json', ...extra });

describe('engine security (AD-LL-008)', () => {
  test('the token file is private to the user', () => {
    expect(statSync(join(home, 'token')).mode & 0o777).toBe(0o600);
    expect(token.length).toBeGreaterThanOrEqual(40);
  });

  test('a foreign Host header is refused (DNS rebinding)', async () => {
    const r = await raw('GET', '/api/actions', { ...ui(), host: 'evil.example:80' });
    expect(r.status).toBe(403);
  });

  test('/api without the token is refused', async () => {
    expect((await raw('GET', '/api/actions')).status).toBe(401);
    expect((await raw('POST', '/api/actions/settings.toggle_no_ai', { 'content-type': 'text/plain' }, '{"on":true}')).status).toBe(401);
  });

  test('a cross-site page cannot fetch the session token', async () => {
    expect((await raw('GET', '/api/session', { 'sec-fetch-site': 'cross-site' })).status).toBe(403);
    const ok = await raw('GET', '/api/session', { 'sec-fetch-site': 'same-origin' });
    expect(ok.status).toBe(200);
    expect(JSON.parse(ok.body).token).toBe(token);
  });

  test('CORS preflights are never approved', async () => {
    const r = await raw('OPTIONS', '/api/actions/settings.toggle_no_ai', { origin: 'https://evil.example', 'access-control-request-method': 'POST' });
    expect(r.status).toBe(403);
    expect(r.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('/mcp without the bearer token is refused', async () => {
    const r = await raw('POST', '/mcp', { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, '{}');
    expect(r.status).toBe(401);
  });

  test('errors do not leak the home path', async () => {
    const r = await raw('POST', '/api/actions/plan.move_object', ui(), '{"id":"ghost","x":1,"y":1}');
    expect(r.status).toBe(404);
    expect(r.body).not.toContain(home);
  });
});

describe('engine API', () => {
  test('lists every action with its schema, tier and flags', async () => {
    const r = await raw('GET', '/api/actions', ui());
    const list = JSON.parse(r.body).actions as { name: string; mcp: string; input: object }[];
    expect(list.length).toBe(buildRegistry().list().length);
    expect(list.find((a) => a.name === 'plan.move_object')).toMatchObject({ mcp: 'plan_move_object', tier: 'T0', effect: 'write' });
  });

  test('invokes an action and returns its envelope', async () => {
    const r = await raw('POST', '/api/actions/plan.move_object', ui(), '{"id":"key","x":4.2,"y":1.4}');
    expect(r.status).toBe(200);
    expect(JSON.parse(r.body)).toMatchObject({ action: 'plan.move_object', stand_in: false, result: { object: { id: 'key', x: 4.2 } } });
  });

  test('bad input is a 400 that names the field', async () => {
    const r = await raw('POST', '/api/actions/plan.move_object', ui(), '{"id":"key","x":"far"}');
    expect(r.status).toBe(400);
    expect(JSON.parse(r.body)).toMatchObject({ code: 'invalid_input' });
    expect(JSON.parse(r.body).message).toContain('x');
  });

  test('an unknown action is a 404; malformed JSON is a 400', async () => {
    expect((await raw('POST', '/api/actions/plan.nope', ui(), '{}')).status).toBe(404);
    expect((await raw('POST', '/api/actions/plan.undo', ui(), '{not json')).status).toBe(400);
  });

  test('the sample project is seeded on first start', async () => {
    const r = await raw('POST', '/api/actions/project.list', ui(), '{}');
    expect(JSON.parse(r.body).result.projects.map((p: { id: string }) => p.id)).toContain('neel');
  });
});

describe('frame import over HTTP (D-LL-027)', () => {
  let ref = '';
  beforeAll(async () => {
    const r = await raw('POST', '/api/actions/breakdown.import_reference', ui(), JSON.stringify({
      file_name: 'noise.mp4', media: 'video', mime: 'video/mp4', size_bytes: 1, sha256: createHash('sha256').update('noise').digest('hex'),
      last_modified: null, width: 1920, height: 1080, duration_s: 1, sample_fps: 2, frame_count: 2,
    }));
    expect(r.status, r.body).toBe(200);
    ref = JSON.parse(r.body).result.reference_id;
  });

  test('a full-size noisy 512 × 512 frame (the worst case for PNG size) is accepted', async () => {
    const png = Buffer.from(encodePng(addNoise(blank(512, 512, [128, 128, 128]), 127)));
    const body = JSON.stringify({ reference_id: ref, index: 0, png_base64: png.toString('base64') });
    expect(body.length).toBeGreaterThan(1_000_000);
    const r = await raw('POST', '/api/actions/breakdown.add_frame', ui(), body);
    expect(r.status, r.body).toBe(200);
    expect(JSON.parse(r.body).result).toMatchObject({ index: 0, width: 512, height: 512 });
  });

  test('a body over 2 MB to add_frame is refused with 413 before it is parsed', async () => {
    const r = await raw('POST', '/api/actions/breakdown.add_frame', ui(), JSON.stringify({ reference_id: ref, index: 1, png_base64: 'A'.repeat(2_100_000) }));
    expect(r.status).toBe(413);
    expect(JSON.parse(r.body)).toMatchObject({ code: 'too_large' });
  });

  test('every other action keeps the 1 MB limit', async () => {
    const r = await raw('POST', '/api/actions/breakdown.edit_value', ui(), JSON.stringify({ field: 'lens.dof', value: 'x'.repeat(1_100_000) }));
    expect(r.status).toBe(413);
  });

  test('a frame that is not a PNG is a 400 that says so', async () => {
    const r = await raw('POST', '/api/actions/breakdown.add_frame', ui(), JSON.stringify({ reference_id: ref, index: 1, png_base64: Buffer.from('GIF89a' + 'x'.repeat(100)).toString('base64') }));
    expect(r.status).toBe(400);
    expect(JSON.parse(r.body).message).toMatch(/PNG/);
  });
});

describe('MCP (AD-LL-003, D-LL-016, D-LL-017)', () => {
  async function connect() {
    const client = new Client({ name: 'test', version: '1.0.0' });
    const transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${engine.port}/mcp`), {
      requestInit: { headers: { authorization: `Bearer ${token}` } },
    });
    await client.connect(transport);
    return client;
  }

  test('lists one tool per registry action, named with an underscore', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    const expected = buildRegistry().list().map((a) => mcpName(a.name)).sort();
    expect(tools.map((t) => t.name).sort()).toEqual(expected);
    for (const t of tools) expect(t.name).toMatch(/^[a-zA-Z0-9_-]{1,64}$/);
    for (const p2 of ['breakdown_add_frame', 'breakdown_get_frame', 'breakdown_get_reference', 'breakdown_set_subject']) {
      expect(tools.map((t) => t.name), p2).toContain(p2);
    }
    expect(tools.find((t) => t.name === 'breakdown_analyse')?.description).not.toContain('STAND-IN');
    await client.close();
  });

  test('marks tools with read-only and destructive hints', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.find((t) => t.name === 'breakdown_get')?.annotations).toMatchObject({ readOnlyHint: true });
    expect(tools.find((t) => t.name === 'setsheet_send_to_phone')?.annotations).toMatchObject({ readOnlyHint: false, openWorldHint: true });
    await client.close();
  });

  test('calls a read action end to end and returns structured content', async () => {
    const client = await connect();
    const r = await client.callTool({ name: 'breakdown_get', arguments: { shot_id: '12C' } });
    expect(r.isError).toBeFalsy();
    expect((r.structuredContent as { result: { shot_id: string } }).result.shot_id).toBe('12C');
    await client.close();
  });

  test('refuses an action that needs approval', async () => {
    const client = await connect();
    const r = await client.callTool({ name: 'settings_toggle_cloud', arguments: { on: true } });
    expect(r.isError).toBe(true);
    expect(JSON.stringify(r.content)).toContain('needs_approval');
    await client.close();
  });

  test('app.status reports when an MCP client last connected', async () => {
    const client = await connect();
    await client.listTools();
    await client.close();
    const r = await raw('POST', '/api/actions/app.status', ui(), '{}');
    const s = JSON.parse(r.body).result;
    expect(s.mcp_last_seen).not.toBeNull();
    expect(s.mcp_tools).toBe(buildRegistry().list().length);
    expect(s.rss_mb).toBeGreaterThan(10);
  });

  test('an MCP call is logged with via "mcp" and announced to the UI', async () => {
    const seen: string[] = [];
    const stop = engine.events.on((e) => e.type === 'action' && seen.push(`${e.action}:${e.via}`));
    const client = await connect();
    await client.callTool({ name: 'plan_save_plan', arguments: {} });
    await client.close();
    stop();
    expect(seen).toContain('plan.save_plan:mcp');
    const log = await raw('POST', '/api/actions/log.list', ui(), '{"limit":5}');
    expect(JSON.parse(log.body).result.decisions[0]).toMatchObject({ command: 'plan.save_plan', via: 'mcp' });
  });
});

describe('rate limit', () => {
  test('a burst beyond the limit gets 429', async () => {
    const small = await startEngine({ home, port: 0, rateLimit: { perSecond: 1, burst: 3 }, quiet: true });
    const codes: number[] = [];
    for (let i = 0; i < 6; i++) {
      const r = await new Promise<number>((resolve) => {
        const req = request({ host: '127.0.0.1', port: small.port, path: '/api/actions', headers: { 'x-looklab-token': token } }, (res) => {
          res.resume();
          resolve(res.statusCode!);
        });
        req.end();
      });
      codes.push(r);
    }
    await small.close();
    expect(codes).toContain(429);
  });
});
