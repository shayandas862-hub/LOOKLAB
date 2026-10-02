// In-app AI through the founder's own Anthropic API key (AD-LL-003, P4). One Messages API request per call, sent
// with plain node:https (D-LL-041: no SDK, 3–4 MB instead of about 20 MB). The key is read from the Keychain for each
// call and goes only into the x-api-key header; it is scrubbed from anything this file reports.
import { request } from 'node:https';
import { AiCallError, type AiProvider, type AiRequest, type AiResponse, type AiUsage } from './ai.ts';
import type { SecretStore } from './keychain.ts';
import { MODEL } from './pricing.ts';

export { AiCallError } from './ai.ts';

export interface HttpRequest {
  host: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}
export type Transport = (req: HttpRequest) => Promise<{ status: number; body: string }>;

const TIMEOUT_MS = 120_000;

/** node:https, with a timeout. The only code in Look Lab that sends anything to Anthropic. */
export const httpsTransport: Transport = (req) =>
  new Promise((resolve, reject) => {
    const r = request({ host: req.host, path: req.path, method: req.method, headers: req.headers, timeout: TIMEOUT_MS }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body: Buffer.concat(chunks).toString('utf8') }));
      res.on('error', reject);
    });
    r.on('timeout', () => r.destroy(new Error(`no answer within ${TIMEOUT_MS / 1000} s`)));
    r.on('error', reject);
    r.end(req.body);
  });

const ZERO: AiUsage = { input_tokens: 0, output_tokens: 0 };

interface MessagesResponse {
  model?: string;
  stop_reason?: string;
  stop_details?: { category?: string | null } | null;
  content?: { type: string; text?: string }[];
  usage?: { input_tokens?: number; output_tokens?: number; cache_creation_input_tokens?: number; cache_read_input_tokens?: number };
  error?: { type?: string; message?: string };
}

export class AnthropicProvider implements AiProvider {
  readonly name = 'anthropic';
  readonly model = MODEL;
  private keychain: SecretStore;
  private transport: Transport;

  constructor(keychain: SecretStore, transport: Transport = httpsTransport) {
    this.keychain = keychain;
    this.transport = transport;
  }

  async ready() {
    return (await this.keychain.has()) ? { ok: true, reason: '' } : { ok: false, reason: 'No API key in the Keychain' };
  }

  async complete(req: AiRequest): Promise<AiResponse> {
    const key = await this.keychain.get();
    if (!key) throw new AiCallError('no API key in the Keychain: add one in Settings');
    const scrub = (s: string) => s.split(key).join('[key]');
    const body = JSON.stringify({
      model: this.model,
      max_tokens: req.maxTokens,
      system: req.system,
      messages: [{ role: 'user', content: req.user }],
      output_config: { effort: req.effort, format: { type: 'json_schema', schema: req.schema } },
    });
    const started = performance.now();
    let res: { status: number; body: string };
    try {
      res = await this.transport({
        host: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
        body,
      });
    } catch (e) {
      throw new AiCallError(`could not reach the Anthropic API: ${scrub((e as Error).message)}`);
    }
    const ms = Math.round(performance.now() - started);
    let msg: MessagesResponse = {};
    try {
      msg = JSON.parse(res.body) as MessagesResponse;
    } catch {
      /* reported below */
    }
    if (res.status !== 200) {
      const why = msg.error?.message ? `: ${scrub(msg.error.message).slice(0, 300)}` : '';
      throw new AiCallError(`the Anthropic API answered ${res.status}${why}`, ZERO, ms);
    }
    const u = msg.usage ?? {};
    const usage: AiUsage = {
      input_tokens: (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0),
      output_tokens: u.output_tokens ?? 0,
    };
    if (msg.stop_reason === 'refusal') {
      throw new AiCallError(`the model declined to answer${msg.stop_details?.category ? ` (${msg.stop_details.category})` : ''}`, usage, ms);
    }
    if (msg.stop_reason === 'max_tokens') throw new AiCallError(`the answer was cut off at ${req.maxTokens} tokens`, usage, ms);
    const text = (msg.content ?? []).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('');
    return { text, model: msg.model ?? this.model, usage, stopReason: msg.stop_reason ?? 'unknown', ms };
  }
}
