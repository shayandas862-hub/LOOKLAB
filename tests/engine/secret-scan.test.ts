// After settings.add_provider the key is in no file, store record, decision row, event, error or log line (P4 Done
// Looks Like). A real engine with a real file store; only the Keychain is a stub. Tried from the window, over MCP and
// through the CLI header, then everything the engine wrote or said is searched for the key.
import { afterAll, beforeAll, expect, test, vi } from 'vitest';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { startEngine, type Engine } from '../../src/engine/engine.ts';
import { memoryKeychain, stubAi, TEST_KEY } from '../actions/stub-ai.ts';

let home: string;
let engine: Engine;
const kc = memoryKeychain(null);
const seen: string[] = [];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)]));
}

beforeAll(async () => {
  home = mkdtempSync(join(tmpdir(), 'looklab-secret-'));
  for (const m of ['log', 'error', 'warn', 'info'] as const) vi.spyOn(console, m).mockImplementation((...a) => void seen.push(a.map(String).join(' ')));
  engine = await startEngine({ home, port: 0, keychain: kc, ai: stubAi({}, kc).provider });
  engine.events.on((e) => void seen.push(JSON.stringify(e)));
});
afterAll(async () => {
  vi.restoreAllMocks();
  await engine.close();
  rmSync(home, { recursive: true, force: true });
});

test('the key is stored in the Keychain and found nowhere else', async () => {
  const token = readFileSync(join(home, 'token'), 'utf8').trim();
  const post = (via: string) => fetch(`${engine.url}/api/actions/settings.add_provider`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-looklab-token': token, 'x-looklab-via': via },
    body: JSON.stringify({ provider: 'anthropic', api_key: TEST_KEY }),
  }).then(async (r) => (seen.push(await r.text()), r.status));

  expect(await post('cli')).toBe(403);
  const mcp = new Client({ name: 'scan', version: '1' });
  await mcp.connect(new StreamableHTTPClientTransport(new URL(`${engine.url}/mcp`), { requestInit: { headers: { authorization: `Bearer ${token}` } } }));
  const r = await mcp.callTool({ name: 'settings_add_provider', arguments: { provider: 'anthropic', api_key: TEST_KEY } });
  seen.push(JSON.stringify(r));
  expect(r.isError).toBe(true);
  await mcp.close();
  expect(kc.value).toBeNull();

  expect(await post('ui')).toBe(200);
  expect(kc.value).toBe(TEST_KEY);
  // A malformed key's error, too.
  await fetch(`${engine.url}/api/actions/settings.add_provider`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-looklab-token': token },
    body: JSON.stringify({ provider: 'anthropic', api_key: `${TEST_KEY} extra` }),
  }).then(async (res) => seen.push(await res.text()));

  const onDisk = files(home);
  expect(onDisk.length).toBeGreaterThan(3); // token, settings, decisions, the sample project
  for (const f of onDisk) expect(readFileSync(f).includes(TEST_KEY), f).toBe(false);
  for (const line of seen) expect(line).not.toContain(TEST_KEY);
  expect(seen.join('\n')).toMatch(/settings\.add_provider/); // the scan saw the calls' answers and events
});
