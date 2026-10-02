// The stub client every AI test uses: the real AnthropicProvider with a transport that answers from a script, so
// nothing leaves the machine and the whole path from action to request body to cost is exercised (P4).
import { AnthropicProvider, type HttpRequest, type Transport } from '../../src/engine/anthropic.ts';
import type { SecretStore } from '../../src/engine/keychain.ts';

export const TEST_KEY = 'sk-ant-api03-TESTONLY_abcdefghijklmnopqrstuvwxyz0123456789-XYZ';

export function memoryKeychain(value: string | null = TEST_KEY): SecretStore & { value: string | null } {
  const kc = {
    value,
    get: async () => kc.value,
    has: async () => kc.value !== null,
    set: async (k: string) => void (kc.value = k),
    remove: async () => void (kc.value = null),
  };
  return kc;
}

export interface Reply {
  text?: string;
  status?: number;
  stop?: string;
  input_tokens?: number;
  output_tokens?: number;
}

/** A provider whose every answer comes from `reply` (an object, or a function of the request's user message). */
export function stubAi(reply: Reply | ((user: string, system: string) => Reply), keychain = memoryKeychain()) {
  const sent: HttpRequest[] = [];
  const transport: Transport = async (req) => {
    sent.push(req);
    const body = JSON.parse(req.body);
    const r = typeof reply === 'function' ? reply(body.messages[0].content, body.system) : reply;
    if (r.status && r.status !== 200) return { status: r.status, body: JSON.stringify({ type: 'error', error: { message: 'stub error' } }) };
    return {
      status: 200,
      body: JSON.stringify({
        model: 'claude-opus-5', stop_reason: r.stop ?? 'end_turn',
        content: [{ type: 'text', text: r.text ?? '{}' }],
        usage: { input_tokens: r.input_tokens ?? 900, output_tokens: r.output_tokens ?? 120 },
      }),
    };
  };
  return { provider: new AnthropicProvider(keychain, transport), sent, keychain };
}

/** A good answer to each of Look Lab's prompts, chosen by the prompt's id line ("Look Lab prompt: <id> v<n>"). */
export function cannedReply(_user: string, system: string): Reply {
  if (system.includes('breakdown.fit_mood')) return { text: JSON.stringify({ words: ['lonely', 'cool night'], confidence: 72, why: 'cool shadows and a warm key' }) };
  if (system.includes('breakdown.ask')) return { text: JSON.stringify({ answer: 'A cool, dark palette with one warm accent.', confidence: 70 }) };
  return { text: '{}' };
}
