// The in-app AI's settings (P4 task 1): the API key, kept only in the Keychain (standing rule 6), and the status every
// AI button reads to say whether it can run and, if not, why (P4 task 5).
import { z } from 'zod';
import { KEY_PATTERN } from '../../engine/keychain.ts';
import { rollMonth } from '../ai-call.ts';
import { ActionError, defineAction, type AnyAction } from '../registry.ts';

const WINDOW_ONLY =
  'The API key is added in Settings in the Look Lab window, never over MCP or the CLI: an agent must not handle it, and a key ' +
  'typed in a terminal stays in its history (if you typed one, replace it in the Anthropic Console).';

export const aiSettingsActions: AnyAction[] = [
  defineAction({
    name: 'settings.add_provider',
    title: 'Add AI provider',
    description:
      'Stores an Anthropic API key in the macOS Keychain for the in-app AI buttons. Only from the Look Lab window: refused over MCP ' +
      'and the CLI. The key is never written to a file, a log or a decision row, and never shown again.',
    tier: 'T3', effect: 'write', confirm: true, windowOnly: WINDOW_ONLY,
    input: z.object({
      provider: z.enum(['anthropic', 'openai', 'google', 'fal', 'replicate']).default('anthropic'),
      api_key: z.string().max(400).optional(),
    }),
    output: z.object({ provider: z.literal('anthropic'), key_in_keychain: z.literal(true) }),
    handler: async (ctx, i) => {
      if (i.provider !== 'anthropic') {
        throw new ActionError('invalid_input', '', 'Only Anthropic is offered in P4. Image and 3D providers arrive with cloud jobs (P10).');
      }
      const key = (i.api_key ?? '').trim();
      if (!key) throw new ActionError('invalid_input', '', 'Paste the API key into the key field in Settings.');
      if (!KEY_PATTERN.test(key)) throw new ActionError('invalid_input', '', 'That does not look like an Anthropic API key (sk-ant-…). Nothing was stored.');
      try {
        await ctx.keychain.set(key);
      } catch (e) {
        throw new ActionError('failed', '', (e as Error).message.split(key).join('[key]'));
      }
      const s = await ctx.settings();
      await ctx.saveSettings({ ...s, api: { ...s.api, provider: 'anthropic' } });
      ctx.events.emit({ type: 'settings' });
      return { provider: 'anthropic' as const, key_in_keychain: true as const };
    },
  }),
  defineAction({
    name: 'settings.remove_provider',
    title: 'Remove the API key',
    description: 'Deletes the Anthropic API key from the macOS Keychain. The AI buttons then say there is no key.',
    tier: 'T3', effect: 'delete', confirm: true, command: false,
    input: z.object({}),
    output: z.object({ key_in_keychain: z.literal(false) }),
    handler: async (ctx) => {
      await ctx.keychain.remove();
      const s = await ctx.settings();
      await ctx.saveSettings({ ...s, api: { ...s.api, provider: 'none' } });
      ctx.events.emit({ type: 'settings' });
      return { key_in_keychain: false as const };
    },
  }),
  defineAction({
    name: 'settings.ai_status',
    title: 'AI status',
    description:
      'Whether the in-app AI can run now and, if not, why: No AI mode, no API key in the Keychain, or the monthly cap reached. ' +
      'Also the model, the month and the spend. Never the key.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object({}),
    output: z.object({
      ready: z.boolean(), reason: z.string(), provider: z.string(), model: z.string(), key_in_keychain: z.boolean(),
      no_ai: z.boolean(), cap_inr: z.number(), used_inr: z.number(), month: z.string().nullable(),
    }),
    handler: async (ctx) => {
      const s = rollMonth(await ctx.settings(), ctx.now());
      const provider = await ctx.ai.ready();
      const key = await ctx.keychain.has();
      const reason = s.no_ai ? 'No AI mode is on'
        : !provider.ok ? provider.reason
        : s.api.used_inr >= s.api.cap_inr ? 'Monthly spend cap reached'
        : '';
      return {
        ready: reason === '', reason, provider: ctx.ai.name, model: ctx.ai.model, key_in_keychain: key,
        no_ai: s.no_ai, cap_inr: s.api.cap_inr, used_inr: s.api.used_inr, month: s.api.month,
      };
    },
  }),
];
