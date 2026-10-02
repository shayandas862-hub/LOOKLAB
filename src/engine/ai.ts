// The AI provider seam (AD-LL-003). P4: AnthropicProvider (src/engine/anthropic.ts) behind it, with an API key
// from the Keychain. Actions never call a provider directly: they go through callModel (src/actions/ai-call.ts),
// which prices the call, checks the monthly cap and logs the cost.

export interface AiRequest {
  /** The instructions, fixed per prompt version (src/actions/prompts.ts). */
  system: string;
  /** Everything else that leaves the machine: measured numbers and words from the breakdown (D-LL-039). */
  user: string;
  /** The JSON schema the answer must follow (structured output). */
  schema: Record<string, unknown>;
  /** The most output tokens the call may use, thinking included. */
  maxTokens: number;
  effort: 'low' | 'medium' | 'high';
}

export interface AiUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface AiResponse {
  /** The answer's text (JSON, by the schema). */
  text: string;
  model: string;
  usage: AiUsage;
  stopReason: string;
  ms: number;
}

/** A call that failed. `usage` is what was billed anyway (zero when the API refused the request itself). */
export class AiCallError extends Error {
  usage: AiUsage;
  ms: number;
  constructor(message: string, usage: AiUsage = { input_tokens: 0, output_tokens: 0 }, ms = 0) {
    super(message);
    this.usage = usage;
    this.ms = ms;
  }
}

export interface AiProvider {
  readonly name: string;
  readonly model: string;
  /** Whether a call could be sent now, and if not, why (shown on every AI button). */
  ready(): Promise<{ ok: boolean; reason: string }>;
  complete(req: AiRequest): Promise<AiResponse>;
}

export class NoAiProvider implements AiProvider {
  readonly name = 'none';
  readonly model = 'none';
  async ready() {
    return { ok: false, reason: 'No AI provider' };
  }
  async complete(): Promise<AiResponse> {
    throw new AiCallError('no AI provider is configured: add an API key in Settings, or ask Claude Code over MCP');
  }
}
