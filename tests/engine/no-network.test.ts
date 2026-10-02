// Zero live calls (P4): every test runs behind tests/setup/no-network.ts, which refuses any connection that leaves
// this machine. These tests prove the guard is on and that it lets the engine's own loopback traffic through.
import { expect, test } from 'vitest';
import { request } from 'node:https';
import { connect } from 'node:net';
import { createServer } from 'node:http';

test('fetch to the Anthropic API is refused before it leaves the machine', async () => {
  await expect(fetch('https://api.anthropic.com/v1/messages', { method: 'POST' })).rejects.toThrow();
  const cause = await fetch('https://api.anthropic.com/v1/messages').catch((e) => String(e.cause ?? e));
  expect(cause).toMatch(/no-network guard/);
});

test('node:https to the Anthropic API is refused', async () => {
  const err = await new Promise<Error>((resolve) => {
    const req = request({ host: 'api.anthropic.com', port: 443, path: '/v1/messages', method: 'POST' });
    req.on('error', resolve);
    req.end();
  });
  expect(err.message).toMatch(/no-network guard/);
});

test('a raw socket to a public address is refused', async () => {
  const err = await new Promise<Error>((resolve) => connect({ host: '1.1.1.1', port: 443 }).on('error', resolve));
  expect(err.message).toMatch(/no-network guard/);
});

test('loopback still works, so the engine can be tested', async () => {
  const server = createServer((_q, s) => s.end('ok'));
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
  const port = (server.address() as { port: number }).port;
  expect(await (await fetch(`http://127.0.0.1:${port}/`)).text()).toBe('ok');
  server.close();
});
