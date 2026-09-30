// The MCP surface: one tool per registry action (AD-LL-002, D-LL-016).
import { z } from 'zod';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { ActionError, mcpName, type AnyAction, type Registry } from '../actions/index.ts';
import type { ActionContext } from '../actions/context.ts';
import type { Via } from '../contracts/index.ts';

export const VERSION = '0.3.0';

const INSTRUCTIONS = `Look Lab is a film pre-production tool: break down a reference, adapt it to a location and kit, plan lights, camera and actors in 3D, and produce a set sheet.
Every measured value carries a source: measured, ai, manual or sample. Never describe a sample value as measured, and say when a result came from a stand-in (stand_in: true).
Actions that need a person's approval are refused over MCP; ask the person to run them in the Look Lab window.
Defaults point at the sample project "neel", shot "12C".`;

export function inputJsonSchema(a: AnyAction): Record<string, unknown> {
  const schema = z.toJSONSchema(a.input, { io: 'input', unrepresentable: 'any' }) as Record<string, unknown>;
  delete schema.$schema;
  return schema;
}

function describe(a: AnyAction): string {
  const flags = [
    `Tier ${a.tier}.`,
    a.standIn ? 'STAND-IN: returns sample data, no real measurement or model call.' : '',
    a.confirm ? 'Needs approval in the Look Lab window; refused over MCP.' : '',
    a.ai ? 'Uses AI; refused in No AI mode.' : '',
  ].filter(Boolean);
  return `${a.description} ${flags.join(' ')}`;
}

export function toolList(registry: Registry) {
  return registry.list().map((a) => ({
    name: mcpName(a.name),
    title: a.title,
    description: describe(a),
    inputSchema: inputJsonSchema(a) as { type: 'object'; properties?: Record<string, object> },
    annotations: {
      title: a.title,
      readOnlyHint: a.effect === 'read',
      destructiveHint: a.effect === 'delete',
      openWorldHint: a.effect === 'upload' || a.effect === 'spend',
    },
  }));
}

export function createMcpServer(registry: Registry, context: (via: Via) => ActionContext): Server {
  const server = new Server({ name: 'looklab', version: VERSION }, { capabilities: { tools: {} }, instructions: INSTRUCTIONS });
  const tools = toolList(registry);
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const action = registry.fromMcpName(req.params.name);
    if (!action) return { isError: true, content: [{ type: 'text' as const, text: `unknown tool "${req.params.name}"` }] };
    try {
      const env = await registry.invoke(action.name, req.params.arguments ?? {}, context('mcp'));
      return { content: [{ type: 'text' as const, text: JSON.stringify(env) }], structuredContent: env as unknown as Record<string, unknown> };
    } catch (e) {
      const err = e instanceof ActionError ? e : new ActionError('failed', action.name, (e as Error).message);
      return { isError: true, content: [{ type: 'text' as const, text: JSON.stringify({ code: err.code, action: err.action, message: err.message }) }] };
    }
  });
  return server;
}
