import { beforeEach, describe, expect, test } from 'vitest';
import { z } from 'zod';
import { ActionError, Registry, defineAction, mcpName } from '../../src/actions/registry.ts';
import { memoryContext } from './memory-context.ts';

const echo = defineAction({
  name: 'test.echo',
  title: 'Echo',
  description: 'Returns its input',
  tier: 'T0',
  effect: 'read',
  input: z.object({ n: z.number().int() }),
  output: z.object({ n: z.number() }),
  handler: async (_ctx, i) => ({ n: i.n }),
});
const write = defineAction({
  name: 'test.write_thing',
  title: 'Write',
  description: 'Writes',
  tier: 'T0',
  effect: 'write',
  rules: ['R8'],
  input: z.object({ text: z.string().default('x') }),
  output: z.object({ ok: z.boolean() }),
  handler: async () => ({ ok: true }),
});
const approve = defineAction({
  name: 'test.approve_thing',
  title: 'Approve',
  description: 'Needs a human',
  tier: 'T3',
  effect: 'write',
  confirm: true,
  input: z.object({}),
  output: z.object({ ok: z.boolean() }),
  handler: async () => ({ ok: true }),
});
const guess = defineAction({
  name: 'test.guess',
  title: 'Guess',
  description: 'Uses a model',
  tier: 'T2',
  effect: 'read',
  ai: true,
  standIn: true,
  input: z.object({}),
  output: z.object({ text: z.string() }),
  handler: async () => ({ text: 'sample' }),
});
const liar = defineAction({
  name: 'test.bad_output',
  title: 'Bad output',
  description: 'Returns the wrong shape',
  tier: 'T0',
  effect: 'read',
  input: z.object({}),
  output: z.object({ n: z.number() }),
  // @ts-expect-error: deliberately wrong
  handler: async () => ({ n: 'not a number' }),
});

let reg: Registry;
let ctx: ReturnType<typeof memoryContext>;
beforeEach(() => {
  reg = new Registry([echo, write, approve, guess, liar]);
  ctx = memoryContext();
});

describe('action registry', () => {
  test('validates input and names the failing field', async () => {
    const err = await reg.invoke('test.echo', { n: 'one' }, ctx.for('ui')).catch((e) => e);
    expect(err).toBeInstanceOf(ActionError);
    expect(err.code).toBe('invalid_input');
    expect(err.message).toContain('n');
  });

  test('applies input defaults and returns the handler result', async () => {
    await expect(reg.invoke('test.echo', { n: 3 }, ctx.for('ui'))).resolves.toMatchObject({ result: { n: 3 } });
    await expect(reg.invoke('test.write_thing', {}, ctx.for('ui'))).resolves.toMatchObject({ result: { ok: true } });
  });

  test('validates output: a handler that breaks its contract fails loudly', async () => {
    const err = await reg.invoke('test.bad_output', {}, ctx.for('ui')).catch((e) => e);
    expect(err.code).toBe('invalid_output');
  });

  test('refuses an unknown action', async () => {
    const err = await reg.invoke('test.nope', {}, ctx.for('ui')).catch((e) => e);
    expect(err.code).toBe('unknown_action');
  });

  test('an action that needs approval is refused over MCP and allowed from the UI (D-LL-017)', async () => {
    const err = await reg.invoke('test.approve_thing', {}, ctx.for('mcp')).catch((e) => e);
    expect(err.code).toBe('needs_approval');
    await expect(reg.invoke('test.approve_thing', {}, ctx.for('ui'))).resolves.toBeTruthy();
  });

  test('AI actions are refused in No AI mode', async () => {
    ctx.settings.no_ai = true;
    const err = await reg.invoke('test.guess', {}, ctx.for('ui')).catch((e) => e);
    expect(err.code).toBe('ai_unavailable');
  });

  test('a stand-in says so in its envelope and its decision row', async () => {
    const r = await reg.invoke('test.guess', {}, ctx.for('mcp'));
    expect(r.stand_in).toBe(true);
    expect(ctx.decisions.at(-1)).toMatchObject({ command: 'test.guess', stand_in: true, via: 'mcp', tier: 'T2' });
  });

  test('writes log a decision row with tier, rule and caller; plain reads do not', async () => {
    await reg.invoke('test.echo', { n: 1 }, ctx.for('ui'));
    expect(ctx.decisions).toHaveLength(0);
    await reg.invoke('test.write_thing', {}, ctx.for('cli'));
    expect(ctx.decisions.at(-1)).toMatchObject({ command: 'test.write_thing', rule_id: 'R8', via: 'cli', ok: true });
  });

  test('failed calls are logged too', async () => {
    await reg.invoke('test.approve_thing', {}, ctx.for('mcp')).catch(() => {});
    expect(ctx.decisions.at(-1)).toMatchObject({ command: 'test.approve_thing', ok: false });
  });

  test('an action name must be <domain>.<verb_noun>', () => {
    expect(() => defineAction({ ...echo, name: 'Bad.Name' })).toThrow();
    expect(() => defineAction({ ...echo, name: 'bad_domain.x' })).toThrow();
    expect(() => defineAction({ ...echo, name: 'plan.move-object' })).toThrow();
  });

  test('duplicate names are refused', () => {
    expect(() => new Registry([echo, echo])).toThrow(/twice/);
  });

  test('MCP names swap the dot for an underscore and stay one-to-one (D-LL-016)', () => {
    expect(mcpName('breakdown.fit_light')).toBe('breakdown_fit_light');
    expect(reg.fromMcpName('test_write_thing')?.name).toBe('test.write_thing');
    expect(mcpName('breakdown.fit_light')).toMatch(/^[a-zA-Z0-9_-]{1,64}$/);
  });
});
