// Breakdown: measure a reference. Stand-ins until phase P2 (colour, shots, framing) and P3/P4 (light, lens, mood).
import { z } from 'zod';
import { Breakdown, EditableField, Id, Look, ReferenceShot, Swatch } from '../../contracts/index.ts';
import { defineAction, ActionError, type AnyAction } from '../registry.ts';
import { col, load, meta, save, stamp, target } from '../records.ts';

const getBreakdown = (ctx: Parameters<AnyAction['handler']>[0], p: string, s: string) =>
  load(ctx, Breakdown, col.breakdowns(p), s, 'breakdown for shot');

const NUMERIC = new Set(['saturation', 'contrast_stops', 'light.key_az', 'light.key_el', 'light.key_kelvin', 'light.fill_kelvin', 'light.ratio', 'lens.focal_mm', 'lens.height_m']);

function overlay(name: string, which: string): AnyAction {
  return defineAction({
    name,
    title: `Toggle ${which} overlay`,
    description: `Shows or hides the ${which} overlay on the reference frame. View state only; changes no record.`,
    tier: 'T0',
    effect: 'read',
    input: z.object({ on: z.boolean().default(true) }),
    output: z.object({ overlay: z.string(), on: z.boolean() }),
    handler: async (_c, i) => ({ overlay: which, on: i.on }),
  });
}

export const breakdownActions: AnyAction[] = [
  defineAction({
    name: 'breakdown.get',
    title: 'Get breakdown',
    description: 'Returns the full breakdown of a shot: palette, tints, light, lens, framing, mood. Every value carries its source.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object(target),
    output: Breakdown,
    handler: (ctx, i) => getBreakdown(ctx, i.project_id, i.shot_id),
  }),
  defineAction({
    name: 'breakdown.import_reference',
    title: 'Import reference (video or image)',
    description: 'Adds a reference frame or video to the project. Stand-in: files are not imported until phase P2.',
    tier: 'T0', effect: 'write', standIn: true, rules: ['R1'], key: '⌘I',
    input: z.object({ project_id: target.project_id, file_name: z.string().min(1).max(255).default('ref_kitchen_night.mov'), media: z.enum(['image', 'video']).default('video') }),
    output: z.object({ reference_id: Id, file_name: z.string(), imported: z.literal(false) }),
    handler: async (_c, i) => ({ reference_id: 'ref-kitchen', file_name: i.file_name, imported: false as const }),
  }),
  defineAction({
    name: 'breakdown.detect_shots',
    title: 'Detect shots',
    description: 'Finds the cuts in a reference video and returns its shots with in and out times. Stand-in until P2.',
    tier: 'T0', effect: 'read', standIn: true, rules: ['R1'],
    input: z.object({ project_id: target.project_id, reference_id: Id.default('ref-kitchen') }),
    output: z.object({ shots: z.array(ReferenceShot), source: z.literal('sample') }),
    handler: async (ctx, i) => {
      const ref = await ctx.store.get<{ shots: z.infer<typeof ReferenceShot>[] }>(col.references(i.project_id), i.reference_id);
      if (!ref) throw new ActionError('not_found', '', `reference "${i.reference_id}" not found`);
      return { shots: ref.shots, source: 'sample' as const };
    },
  }),
  defineAction({
    name: 'breakdown.sample_palette',
    title: 'Sample palette from frame',
    description: 'Measures the palette of a shot: hex colours and their share of the frame. Stand-in until P2.',
    tier: 'T0', effect: 'read', standIn: true, rules: ['R2'], key: 'S',
    input: z.object(target),
    output: z.object({ palette: z.array(Swatch) }),
    handler: async (ctx, i) => ({ palette: (await getBreakdown(ctx, i.project_id, i.shot_id)).palette }),
  }),
  defineAction({
    name: 'breakdown.analyse',
    title: 'Analyse reference',
    description: 'Runs every breakdown step on a shot: shots, colour, light, lens, framing, mood. Stand-in until P2–P4.',
    tier: 'T0', effect: 'write', standIn: true, rules: ['R1', 'R2', 'R3'], key: '⌘⇧A',
    input: z.object(target),
    output: Breakdown,
    handler: (ctx, i) => getBreakdown(ctx, i.project_id, i.shot_id),
  }),
  defineAction({
    name: 'breakdown.fit_light',
    title: 'Fit light to reference',
    description: 'Estimates the key light (azimuth, elevation, hardness, kelvin), fill and key:fill ratio from the frame. Stand-in until P3.',
    tier: 'T0', effect: 'write', standIn: true, rules: ['R4', 'R6', 'R7', 'R8'], key: '⌘⇧L',
    input: z.object(target),
    output: z.object({ light: Breakdown.shape.light }),
    handler: async (ctx, i) => ({ light: (await getBreakdown(ctx, i.project_id, i.shot_id)).light }),
  }),
  defineAction({
    name: 'breakdown.fit_lens',
    title: 'Estimate lens and camera',
    description: 'Estimates focal length, depth of field, camera height, angle and movement. Stand-in until P3/P4.',
    tier: 'T2', effect: 'write', ai: true, standIn: true, rules: ['R2'],
    input: z.object(target),
    output: z.object({ lens: Breakdown.shape.lens }),
    handler: async (ctx, i) => ({ lens: (await getBreakdown(ctx, i.project_id, i.shot_id)).lens }),
  }),
  defineAction({
    name: 'breakdown.fit_framing',
    title: 'Estimate framing',
    description: 'Estimates shot size, subject position, lead room and aspect. Stand-in until P2.',
    tier: 'T1', effect: 'write', ai: true, standIn: true, rules: ['R2'],
    input: z.object(target),
    output: z.object({ framing: Breakdown.shape.framing }),
    handler: async (ctx, i) => ({ framing: (await getBreakdown(ctx, i.project_id, i.shot_id)).framing }),
  }),
  defineAction({
    name: 'breakdown.fit_mood',
    title: 'Suggest mood words',
    description: 'Suggests mood tags from the frame and palette. Words, not measurements. Stand-in until P4.',
    tier: 'T2', effect: 'write', ai: true, standIn: true, rules: ['R3', 'R5'],
    input: z.object(target),
    output: z.object({ mood: Breakdown.shape.mood }),
    handler: async (ctx, i) => ({ mood: (await getBreakdown(ctx, i.project_id, i.shot_id)).mood }),
  }),
  defineAction({
    name: 'breakdown.edit_value',
    title: 'Edit a breakdown value by hand',
    description: 'Sets one breakdown value by hand. The value becomes source "manual". Numeric fields take numbers.',
    tier: 'T0', effect: 'write',
    input: z.object({ ...target, field: EditableField, value: z.union([z.string().min(1).max(200), z.number().finite()]) }),
    output: z.object({ field: z.string(), value: z.union([z.string(), z.number()]), source: z.literal('manual') }),
    handler: async (ctx, i) => {
      if (NUMERIC.has(i.field) !== (typeof i.value === 'number')) {
        throw new ActionError('invalid_input', '', `${i.field} takes a ${NUMERIC.has(i.field) ? 'number' : 'text value'}`);
      }
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      const [group, leaf] = i.field.split('.');
      const holder = (leaf ? (b as Record<string, unknown>)[group] : b) as Record<string, { value: unknown; source: string; confidence?: number; updated_by: string; updated_at: string }>;
      const key = leaf ?? group;
      holder[key] = { ...holder[key], value: i.value, source: 'manual', updated_by: ctx.user, updated_at: ctx.now() };
      delete holder[key].confidence;
      await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, b));
      return { field: i.field, value: i.value, source: 'manual' as const };
    },
  }),
  defineAction({
    name: 'breakdown.review',
    title: 'Confirm a value after review',
    description: 'A person confirms a low-confidence value. Needs approval in the Look Lab window.',
    tier: 'T3', effect: 'write', confirm: true, rules: ['R5'],
    input: z.object({ ...target, field: EditableField }),
    output: z.object({ reviewed: z.array(z.string()) }),
    handler: async (ctx, i) => {
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      const reviewed = [...new Set([...b.reviewed, i.field])];
      await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, { ...b, reviewed }));
      return { reviewed };
    },
  }),
  overlay('breakdown.toggle_thirds', 'thirds'),
  overlay('breakdown.toggle_light', 'light direction'),
  overlay('breakdown.toggle_samples', 'palette sample points'),
  defineAction({
    name: 'breakdown.ask',
    title: 'Ask about this reference',
    description: 'Answers a question from the breakdown ("what is the exact colour scheme?"). Stand-in until P4.',
    tier: 'T2', effect: 'read', ai: true, standIn: true, rules: ['R3'],
    input: z.object({ ...target, question: z.string().trim().min(1).max(500) }),
    output: z.object({ answer: z.string(), source: z.literal('sample') }),
    handler: async (ctx, i) => {
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      const pal = b.palette.map((p) => `${p.hex} ${p.share.value}%`).join(', ');
      return { answer: `Sample answer (no model called). Palette: ${pal}. Key ${b.light.key_az.value}° az, ${b.light.key_el.value}° el, ${b.light.key_kelvin.value} K, ratio ${b.light.ratio.value}:1.`, source: 'sample' as const };
    },
  }),
  defineAction({
    name: 'breakdown.save_look',
    title: 'Save look to library',
    description: 'Saves the shot\'s palette, key light, ratio and mood as a look in the Library.',
    tier: 'T0', effect: 'write', key: '⌘S',
    input: z.object({ ...target, name: z.string().trim().min(1).max(120).optional() }),
    output: z.object({ look_id: Id, source: z.string() }),
    handler: async (ctx, i) => {
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      const leaves = [b.light.key_az, b.light.key_el, b.light.key_kelvin, b.light.ratio, ...b.palette.map((p) => p.share)];
      const source = leaves.some((l) => l.source === 'sample') ? 'sample' : leaves.some((l) => l.source === 'ai') ? 'ai' : 'measured';
      const id = `look-${i.project_id}-${i.shot_id}-${Date.parse(ctx.now()).toString(36)}`.toLowerCase().slice(0, 64);
      await save(ctx, Look, col.looks, id, {
        ...meta(ctx, id), name: i.name ?? `${i.project_id} ${i.shot_id}`, project_id: i.project_id, shot_id: i.shot_id, source,
        palette: b.palette.map((p) => ({ hex: p.hex, share: p.share.value })),
        key: { az: b.light.key_az.value, el: b.light.key_el.value, kelvin: b.light.key_kelvin.value, hardness: b.light.key_hardness.value },
        ratio: b.light.ratio.value, tags: [], mood: b.mood.value,
      });
      return { look_id: id, source };
    },
  }),
];
