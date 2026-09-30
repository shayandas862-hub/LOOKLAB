// The UI's client for the engine: session token, actions, events.
export interface ActionInfo {
  name: string;
  mcp: string;
  title: string;
  description: string;
  tier: string;
  effect: string;
  confirm: boolean;
  ai: boolean;
  stand_in: boolean;
  command: boolean;
  key: string;
  rules: string[];
  input: { required?: string[] };
}

export interface Envelope<T = unknown> {
  action: string;
  result: T;
  stand_in: boolean;
}

export class EngineError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export type EngineEvent =
  | { type: 'action'; action: string; via: string; ok: boolean; stand_in: boolean }
  | { type: 'settings' }
  | { type: 'hello'; version: string };

let tokenPromise: Promise<string> | null = null;

function token(): Promise<string> {
  tokenPromise ??= fetch('/api/session', { credentials: 'same-origin' }).then(async (r) => {
    if (!r.ok) throw new EngineError('no_session', 'Look Lab engine refused the session. Reload the page from the engine address.');
    return (await r.json()).token as string;
  });
  return tokenPromise;
}

export async function invoke<T = unknown>(action: string, input: unknown = {}): Promise<Envelope<T>> {
  const r = await fetch(`/api/actions/${action}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-looklab-token': await token() },
    body: JSON.stringify(input ?? {}),
  }).catch(() => {
    throw new EngineError('offline', 'The Look Lab engine is not running. Start it with npm start.');
  });
  const body = await r.json();
  if (!r.ok) throw new EngineError(body.code ?? 'failed', body.message ?? `${action} failed`);
  return body as Envelope<T>;
}

export async function listActions(): Promise<ActionInfo[]> {
  const r = await fetch('/api/actions', { headers: { 'x-looklab-token': await token() } });
  if (!r.ok) throw new EngineError('failed', 'could not list actions');
  return (await r.json()).actions as ActionInfo[];
}

/** Server-sent events over fetch, so the token travels in a header, not the URL. Reconnects on drop. */
export function subscribe(onEvent: (e: EngineEvent) => void, onState?: (up: boolean) => void): () => void {
  let stopped = false;
  let ctrl: AbortController | null = null;
  const loop = async () => {
    while (!stopped) {
      try {
        ctrl = new AbortController();
        const r = await fetch('/api/events', { headers: { 'x-looklab-token': await token() }, signal: ctrl.signal });
        if (!r.ok || !r.body) throw new Error('events refused');
        onState?.(true);
        const reader = r.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let i: number;
          while ((i = buf.indexOf('\n\n')) >= 0) {
            const chunk = buf.slice(0, i);
            buf = buf.slice(i + 2);
            const line = chunk.split('\n').find((l) => l.startsWith('data: '));
            if (line) onEvent(JSON.parse(line.slice(6)));
          }
        }
      } catch {
        /* dropped or refused: fall through to retry */
      }
      if (stopped) return;
      onState?.(false);
      await new Promise((res) => setTimeout(res, 2000));
    }
  };
  void loop();
  return () => {
    stopped = true;
    ctrl?.abort();
  };
}
