// Breakdown: the in-app AI (P4). Mood words and Ask come from a model through the founder's API key, as `ai` values
// with the model's own confidence (D-LL-042), never measured or estimate. Only numbers and words leave the machine
// (D-LL-039). A model never overwrites a measured, estimated, EXIF or hand-set value. A value under 60 is queued for a
// person (R5); breakdown.review records the person's yes on the decision that wrote it (AD-LL-013, D-LL-023).
import { z } from 'zod';
import { Breakdown, EditableField } from '../../contracts/index.ts';
import { callModel } from '../ai-call.ts';
import { foreignNumbers } from '../ask-check.ts';
import { ASK_PROMPT, MOOD_PROMPT, breakdownFacts } from '../prompts.ts';
import { ActionError, defineAction, type AnyAction } from '../registry.ts';
import { REVIEW_BELOW } from '../rules.ts';
import { col, save, stamp, target } from '../records.ts';
import { getBreakdown, type BreakdownT, type Ctx } from './breakdown-shared.ts';

type Leaf = { value: unknown; source: string; confidence?: number; decision_id?: string };

/** The value at a field path ("mood", "light.key_az"). */
export function leafAt(b: BreakdownT, field: string): Leaf {
  if (field === 'mood') return b.mood;
  const [group, leaf] = field.split('.');
  return ((b as unknown as Record<string, Record<string, Leaf>>)[group] ?? {})[leaf] ?? (b as unknown as Record<string, Leaf>)[group];
}

/** A measured breakdown: its palette came from pixels. Sample data is never sent to a model. */
function requireMeasured(b: BreakdownT, what: string) {
  if (!b.palette.length || !b.palette.every((p) => p.share.source === 'measured')) {
    throw new ActionError('invalid_input', '', `${what} works from a measured breakdown: import a reference first. The design's sample data is not sent to a model.`);
  }
}

const rupees = (ctx: Ctx) => `₹${(ctx.call?.cost_inr ?? 0).toFixed(2)}`;

export const aiActions: AnyAction[] = [
  defineAction({
    name: 'breakdown.fit_mood',
    title: 'Suggest mood words',
    description:
      'Asks the model for one to five mood words from the measured breakdown (numbers and words only; no frame leaves the machine, ' +
      'D-LL-039). Writes mood as an AI value with the model\'s own confidence; under 60 it is queued for review (R5). Keeps a mood set by hand.',
    tier: 'T2', effect: 'write', ai: true, rules: ['R3', 'R5'],
    input: z.object(target),
    output: z.object({ mood: Breakdown.shape.mood, needs_review: z.boolean(), why: z.string() }),
    handler: async (ctx, i) => {
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      requireMeasured(b, 'Mood');
      const kept = 'Mood was set by hand and is kept: a model never overwrites a person\'s value.';
      if (b.mood.source === 'manual') throw new ActionError('invalid_input', '', kept);
      const r = await callModel(ctx, { ...MOOD_PROMPT, user: JSON.stringify(breakdownFacts(b, { mood: false })) });
      const confidence = r.value.confidence;
      if (ctx.call) Object.assign(ctx.call, { confidence, rule_id: confidence < REVIEW_BELOW ? 'R5' : 'R3' });
      const fresh = await getBreakdown(ctx, i.project_id, i.shot_id);
      if (fresh.mood.source === 'manual') throw new ActionError('invalid_input', '', `${kept} (It was set while the model answered.)`);
      const mood = { value: r.value.words, source: 'ai' as const, confidence, decision_id: ctx.call?.decision_id, updated_by: r.response.model, updated_at: ctx.now() };
      await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, { ...fresh, mood, reviewed: fresh.reviewed.filter((f) => f !== 'mood') }));
      return { mood, needs_review: confidence < REVIEW_BELOW, why: r.value.why };
    },
  }),
  defineAction({
    name: 'breakdown.ask',
    title: 'Ask about this reference',
    description:
      'Answers a question in words from the measured breakdown ("what is the exact colour scheme?"). It may quote only numbers that ' +
      'are in the breakdown or the question; an answer with any other number is refused (D-LL-047). Capture numbers come from P4.5.',
    tier: 'T2', effect: 'spend', ai: true, rules: ['R3'],
    input: z.object({ ...target, question: z.string().trim().min(1).max(500) }),
    output: z.object({ answer: z.string(), source: z.literal('ai'), confidence: z.number().int().min(0).max(100), low: z.boolean(), cost_inr: z.number() }),
    handler: async (ctx, i) => {
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      requireMeasured(b, 'Ask');
      const facts = breakdownFacts(b, { mood: true });
      const r = await callModel(ctx, { ...ASK_PROMPT, user: JSON.stringify({ breakdown: facts, question: i.question }) });
      if (ctx.call) ctx.call.confidence = r.value.confidence;
      const foreign = foreignNumbers(r.value.answer, facts, i.question);
      if (foreign.length) {
        throw new ActionError(
          'model_output', '',
          `The model's answer was refused: it quotes ${foreign.join(', ')}, which ${foreign.length === 1 ? 'is' : 'are'} not in the breakdown ` +
            `(Ask may quote only the record's numbers; capture numbers come from Look Lab's maths in P4.5). It cost ${rupees(ctx)}, logged.`,
        );
      }
      const confidence = r.value.confidence;
      return { answer: r.value.answer, source: 'ai' as const, confidence, low: confidence < REVIEW_BELOW, cost_inr: ctx.call?.cost_inr ?? 0 };
    },
  }),
  defineAction({
    name: 'breakdown.review',
    title: 'Confirm a value after review',
    description:
      'A person confirms an AI value (R5, T3): "agreed" is recorded on the decision that wrote it and the value leaves the review ' +
      'queue. In the Look Lab window the click is the approval; over MCP it is refused (D-LL-023, D-LL-017).',
    tier: 'T3', effect: 'write', confirm: true, rules: ['R5'],
    input: z.object({ ...target, field: EditableField }),
    output: z.object({ reviewed: z.array(z.string()), field: z.string(), decision_id: z.string(), verdict: z.literal('agreed') }),
    handler: async (ctx, i) => {
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      const leaf = leafAt(b, i.field);
      if (!leaf || leaf.source !== 'ai' || !leaf.decision_id) {
        throw new ActionError('invalid_input', '', `Nothing to review: ${i.field} is ${leaf?.source ?? 'missing'}, not an AI value.`);
      }
      await ctx.store.append('verdicts', { decision_id: leaf.decision_id, verdict: 'agreed', by: ctx.user, at: ctx.now(), field: i.field });
      const reviewed = [...new Set([...b.reviewed, i.field])];
      await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, { ...b, reviewed }));
      return { reviewed, field: i.field, decision_id: leaf.decision_id, verdict: 'agreed' as const };
    },
  }),
  defineAction({
    name: 'breakdown.review_queue',
    title: 'Values waiting for review',
    description: 'Lists the shot\'s AI values under 60 that no person has confirmed yet (R5): field, value, the model\'s confidence, the decision.',
    tier: 'T0', effect: 'read', command: false, rules: ['R5'],
    input: z.object(target),
    output: z.object({ queue: z.array(z.object({ field: z.string(), value: z.unknown(), confidence: z.number(), decision_id: z.string().nullable() })) }),
    handler: async (ctx, i) => {
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      const queue = EditableField.options
        .map((field) => ({ field, leaf: leafAt(b, field) }))
        .filter(({ field, leaf }) => leaf?.source === 'ai' && (leaf.confidence ?? 0) < REVIEW_BELOW && !b.reviewed.includes(field))
        .map(({ field, leaf }) => ({ field, value: leaf.value, confidence: leaf.confidence ?? 0, decision_id: leaf.decision_id ?? null }));
      return { queue };
    },
  }),
];
