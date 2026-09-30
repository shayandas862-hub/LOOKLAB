// The AI provider seam (AD-LL-003). Phase P4 adds the Anthropic API-key provider.
export interface AiRequest {
  system: string;
  prompt: string;
  maxTokens: number;
}

export interface AiResponse {
  text: string;
  costInr: number;
}

export interface AiProvider {
  readonly name: string;
  readonly available: boolean;
  complete(req: AiRequest): Promise<AiResponse>;
}

export class NoAiProvider implements AiProvider {
  readonly name = 'none';
  readonly available = false;
  async complete(): Promise<AiResponse> {
    throw new Error('no AI provider is configured: add an API key in Settings, or ask Claude Code over MCP');
  }
}
