// Breakdown: measure a reference. Since P2, import, frames, shot cuts, palette, tints, saturation, contrast
// and aspect are T0 instruments on the actual pixels (source "measured"), and subject position is set by
// hand (D-LL-028). Since P3 the key light is fitted to a face marked by hand, as an estimate, and the focal
// length comes from EXIF when the file has it; the rest of the lens, framing size (T1) and mood (P4) are
// still stand-ins. The reference and its frames live in breakdown-reference.ts, the light in
// breakdown-light.ts, shared helpers in breakdown-shared.ts.
import { z } from 'zod';
import { Breakdown, EditableField, FramePoint, Id, Look, MAX_FRAMES, Swatch, TextValue } from '../../contracts/index.ts';
import { defineAction, ActionError, type AnyAction } from '../registry.ts';
import { col, meta, save, stamp, target } from '../records.ts';
import { analyseShot, defaultFrame, getBreakdown, loadFrame, paletteOf, referenceFor, weakest, type BreakdownT } from './breakdown-shared.ts';
import { referenceActions } from './breakdown-reference.ts';
import { lightActions } from './breakdown-light.ts';

const NUMERIC = new Set(['saturation', 'contrast_stops', 'light.key_az', 'light.key_el', 'light.key_kelvin', 'light.fill_kelvin', 'light.ratio', 'lens.focal_mm', 'lens.height_m']);

/** "left third (x 0.31, y 0.40)": the nearest thirds landmark, then the exact point. */
export function subjectText(x: number, y: number): string {
  const where = x < 0.2 ? 'left edge' : x < 0.42 ? 'left third' : x <= 0.58 ? 'centre' : x <= 0.8 ? 'right third' : 'right edge';
  return `${where} (x ${x.toFixed(2)}, y ${y.toFixed(2)})`;
}

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
  ...referenceActions,
  defineAction({
    name: 'breakdown.sample_palette',
    title: 'Sample palette from frame',
    description:
      'Measures the palette of a shot\'s frame: k-means in CIELAB with fixed seeding, exact hex and share of the picture (letterbox bars left out). ' +
      'Saves it as measured. Defaults to the frame the breakdown last measured.',
    tier: 'T0', effect: 'write', rules: ['R2'], key: 'S',
    input: z.object({ ...target, frame_index: z.number().int().min(0).max(MAX_FRAMES - 1).optional() }),
    output: z.object({ palette: z.array(Swatch) }),
    handler: async (ctx, i) => {
      const ref = await referenceFor(ctx, i.project_id, i.shot_id);
      const b = await ctx.store.get<BreakdownT>(col.breakdowns(i.project_id), i.shot_id);
      if (!b) return { palette: (await analyseShot(ctx, i.project_id, i.shot_id, i.frame_index, 'breakdown.sample_palette')).palette };
      const bd = Breakdown.parse(b);
      const idx = i.frame_index ?? bd.frame_index ?? defaultFrame(ref);
      if (idx >= ref.frame_count) throw new ActionError('invalid_input', '', `frame_index ${idx} is past this reference's ${ref.frame_count} frames`);
      const palette = paletteOf(await loadFrame(ctx, i.project_id, ref, idx), 'breakdown.sample_palette', ctx.now());
      await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, { ...bd, reference_id: ref.id, frame_index: idx, palette }));
      return { palette };
    },
  }),
  defineAction({
    name: 'breakdown.analyse',
    title: 'Analyse reference',
    description:
      'Measures a shot from its reference\'s pixels: detects shots if not yet done, then palette, shadow/mid/highlight tint, saturation, contrast in stops ' +
      'and aspect ratio on one frame (default: the key frame of the longest detected shot). Values set by hand are kept. Light, lens, framing size and mood are not measured ' +
      'yet and keep their sample values until P3/P4.',
    tier: 'T0', effect: 'write', rules: ['R1', 'R2'], key: '⌘⇧A',
    input: z.object({ ...target, frame_index: z.number().int().min(0).max(MAX_FRAMES - 1).optional() }),
    output: Breakdown,
    handler: (ctx, i) => analyseShot(ctx, i.project_id, i.shot_id, i.frame_index, 'breakdown.analyse'),
  }),
  defineAction({
    name: 'breakdown.set_subject',
    title: 'Set subject position',
    description:
      'Records where the subject is on the frame, as fractions of its width and height (a click on the frame). Source "manual". ' +
      'A subject detector (T1) comes later (D-LL-028).',
    tier: 'T0', effect: 'write', command: false,
    input: z.object({ ...target, x: FramePoint.shape.x, y: FramePoint.shape.y }),
    output: z.object({ field: z.literal('framing.subject_pos'), value: z.string(), source: z.literal('manual') }),
    handler: async (ctx, i) => {
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      const value = subjectText(i.x, i.y);
      const subject_pos = { value, source: 'manual' as const, updated_by: ctx.user, updated_at: ctx.now() };
      await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, {
        ...b, subject: { x: Math.round(i.x * 10_000) / 10_000, y: Math.round(i.y * 10_000) / 10_000 }, framing: { ...b.framing, subject_pos },
      }));
      return { field: 'framing.subject_pos' as const, value, source: 'manual' as const };
    },
  }),
  ...lightActions,
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
    description:
      'Estimates shot size and lead room. Stand-in until a subject detector (T1) exists. Aspect is measured by breakdown.analyse; ' +
      'subject position is set by hand (breakdown.set_subject).',
    tier: 'T1', effect: 'write', ai: true, standIn: true, rules: ['R2'],
    input: z.object(target),
    output: z.object({ framing: z.object({ size: TextValue, lead_room: TextValue }) }),
    handler: async (ctx, i) => {
      const f = (await getBreakdown(ctx, i.project_id, i.shot_id)).framing;
      return { framing: { size: f.size, lead_room: f.lead_room } };
    },
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
    description:
      'Saves the shot\'s palette, key light, ratio and mood as a look in the Library. The look\'s source is its palette\'s; light and mood carry their own (D-LL-030).',
    tier: 'T0', effect: 'write', key: '⌘S',
    input: z.object({ ...target, name: z.string().trim().min(1).max(120).optional() }),
    output: z.object({ look_id: Id, source: z.string() }),
    handler: async (ctx, i) => {
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      const L = b.light;
      const source = weakest(b.palette.map((p) => p.share.source));
      const light_source = weakest([L.key_az, L.key_el, L.key_kelvin, L.key_hardness, L.ratio].map((v) => v.source));
      const id = `look-${i.project_id}-${i.shot_id}-${Date.parse(ctx.now()).toString(36)}`.toLowerCase().slice(0, 64);
      await save(ctx, Look, col.looks, id, {
        ...meta(ctx, id), name: i.name ?? `${i.project_id} ${i.shot_id}`, project_id: i.project_id, shot_id: i.shot_id,
        source, light_source, mood_source: b.mood.source,
        palette: b.palette.map((p) => ({ hex: p.hex, share: p.share.value })),
        key: { az: L.key_az.value, el: L.key_el.value, kelvin: L.key_kelvin.value, hardness: L.key_hardness.value },
        ratio: L.ratio.value, tags: [], mood: b.mood.value,
      });
      return { look_id: id, source };
    },
  }),
];
