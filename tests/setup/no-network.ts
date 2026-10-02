// Loaded before every test file (vitest.config.ts setupFiles): no test may open a connection that leaves this
// machine (P4: zero live calls). Every TCP and TLS client in Node (net, tls, http, https and fetch) connects through
// net.Socket.prototype.connect, so the guard sits there. Loopback and local (Unix) sockets still work, so the
// engine, Chrome's DevTools pipe and vitest's own workers are untouched.
import net from 'node:net';

const LOOPBACK = /^(localhost|127(?:\.\d{1,3}){3}|::1|::ffff:127(?:\.\d{1,3}){3})$/i;

function target(args: unknown[]): { host?: string; path?: string } {
  let first = args[0];
  if (Array.isArray(first)) first = first[0]; // Node passes its normalised arguments as an array
  if (typeof first === 'object' && first !== null) {
    const o = first as { host?: string; path?: string };
    return { host: o.host, path: o.path };
  }
  if (typeof first === 'string' && Number.isNaN(Number(first))) return { path: first };
  return { host: typeof args[1] === 'string' ? args[1] : undefined };
}

const original = net.Socket.prototype.connect;
net.Socket.prototype.connect = function guarded(this: net.Socket, ...args: unknown[]) {
  const { host, path } = target(args);
  if (path || host === undefined || LOOPBACK.test(host)) return (original as (...a: unknown[]) => net.Socket).apply(this, args);
  const err = new Error(`no-network guard: a test tried to connect to ${host}; tests run with no network (P4, zero live calls)`);
  process.nextTick(() => this.destroy(err));
  return this;
} as typeof net.Socket.prototype.connect;
