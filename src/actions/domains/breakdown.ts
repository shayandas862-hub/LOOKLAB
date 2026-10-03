// Breakdown: measure a reference. Since P2, import, frames, shot cuts, palette, tints, saturation, contrast
// and aspect are T0 instruments on the actual pixels (source "measured"), and subject position is set by
// hand (D-LL-028). Since P3 the key light is fitted to a face marked by hand, as an estimate, and the focal
// length comes from EXIF when the file has it. Since P4 shot size comes from the face box by R2 (T0, an
// estimate), mood and Ask from a model (breakdown-ai.ts); the rest of the lens stays a stand-in under D-LL-039.
// The reference and its frames live in breakdown-reference.ts, the light in breakdown-light.ts, shared helpers
// in breakdown-shared.ts.
import { z } from 'zod';
import { Breakdown, EditableField, FramePoint, Id, Look, MAX_FRAMES, Swatch, TextValue } from '../../contracts/index.ts';
import { defineAction, ActionError, type AnyAction } from '../registry.ts';
import { col, meta, save, stamp, target } from '../records.ts';
import { analyseShot, defaultFrame, getBreakdown, loadFrame, paletteOf, readyReference, referenceFor, weakest, type BreakdownT } from './breakdown-shared.ts';
import { aiActions } from './breakdown-ai.ts';
import { findActiveArea } from '../../core/image.ts';
import { shotSize } from '../../core/shot-size.ts';
import { referenceActions } from './breakdown-reference.ts';
import { lightActions } from './breakdown-light.ts';

const NUMERIC = new Set(['saturation', 'contrast_stops', 'light.key_az', 'light.key_el', 'light.key_kelvin', 'light.fill_kelvin', 'light.ratio', 'light.key_gm', 'light.fill_gm', 'lens.focal_mm', 'lens.height_m']);

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
  ...aiActions,
  defineAction({
    name: 'breakdown.fit_lens',
    title: 'Estimate lens and camera',
    description:
      'Would label depth of field, camera height, angle and movement from the frame. A stand-in: under D-LL-039 no frame leaves the ' +
      'machine, so these stay by hand; the focal length comes from EXIF (D-LL-034) or a person.',
    tier: 'T2', effect: 'write', ai: true, standIn: true, rules: ['R2'],
    input: z.object(target),
    output: z.object({ lens: Breakdown.shape.lens }),
    handler: async (ctx, i) => ({ lens: (await getBreakdown(ctx, i.project_id, i.shot_id)).lens }),
  }),
  defineAction({
    name: 'breakdown.fit_framing',
    title: 'Estimate framing',
    description:
      'Names the shot size from the face box by R2 (T0): the face\'s height over the active picture\'s height (ECU, CU, MCU, MS, MWS, WS, ' +
      'EWS; D-LL-046). Written as an estimate; a size set by hand is kept. Subject position and lead room stay by hand (D-LL-028, D-LL-039).',
    tier: 'T0', effect: 'write', rules: ['R2'],
    input: z.object(target),
    output: z.object({ framing: z.object({ size: TextValue, lead_room: TextValue }), basis: z.string() }),
    handler: async (ctx, i) => {
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      if (!b.face || b.reference_id === null || b.face.frame_index !== b.frame_index) {
        throw new ActionError('invalid_input', '', 'no face box on the measured frame: drag a box around the face on the frame, hairline to chin, then try again');
      }
      const px = await loadFrame(ctx, i.project_id, await readyReference(ctx, i.project_id, b.reference_id), b.face.frame_index);
      const active = findActiveArea(px);
      const share = (b.face.h * px.height) / (active.y1 - active.y0);
      const label = shotSize(Math.min(share, 1.5));
      const basis = `face ${Math.round(share * 100)}% of the picture height → ${label} (R2)`;
      if (['manual', 'measured', 'metadata'].includes(b.framing.size.source)) {
        return { framing: { size: b.framing.size, lead_room: b.framing.lead_room }, basis: `${basis}; kept the size set by hand` };
      }
      const size = { value: label, source: 'estimate' as const, decision_id: ctx.call?.decision_id, updated_by: 'R2', updated_at: ctx.now() };
      await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, { ...b, framing: { ...b.framing, size } }));
      return { framing: { size, lead_room: b.framing.lead_room }, basis };
    },
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
      if (i.field === 'mood') {
        const words = String(i.value).split(',').map((w) => w.trim()).filter(Boolean).slice(0, 8);
        if (!words.length) throw new ActionError('invalid_input', '', 'mood takes words separated by commas');
        b.mood = { value: words, source: 'manual', updated_by: ctx.user, updated_at: ctx.now() };
        await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, b));
        return { field: i.field, value: words.join(', '), source: 'manual' as const };
      }
      const [group, leaf] = i.field.split('.');
      const holder = (leaf ? (b as Record<string, unknown>)[group] : b) as Record<string, { value: unknown; source: string; confidence?: number; updated_by: string; updated_at: string }>;
      const key = leaf ?? group;
      holder[key] = { ...holder[key], value: i.value, source: 'manual', updated_by: ctx.user, updated_at: ctx.now() };
      delete holder[key].confidence;
      delete (holder[key] as { decision_id?: string }).decision_id;
      await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, b));
      return { field: i.field, value: i.value, source: 'manual' as const };
    },
  }),
  overlay('breakdown.toggle_thirds', 'thirds'),
  overlay('breakdown.toggle_light', 'light direction'),
  overlay('breakdown.toggle_samples', 'palette sample points'),
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
