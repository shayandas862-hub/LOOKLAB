// Breakdown: measure a reference. Since P2, import, frames, shot cuts, palette, tints, saturation, contrast
// and aspect are T0 instruments on the actual pixels (source "measured"), and subject position is set by
// hand (D-LL-028). Light and lens (P3), framing size (T1) and mood (P4) are still stand-ins.
import { z } from 'zod';
import {
  ANALYSIS_MAX_SIDE, Breakdown, EditableField, FramePoint, Id, Look, MAX_FRAMES, Project, Reference, ReferenceShot, Swatch, TextValue,
} from '../../contracts/index.ts';
import type { Source } from '../../contracts/index.ts';
import { defineAction, ActionError, type AnyAction } from '../registry.ts';
import type { ActionContext } from '../context.ts';
import { col, load, meta, save, stamp, target } from '../records.ts';
import { sampleSeed } from '../sample.ts';
import { measurePalette } from '../../core/palette.ts';
import { measureContrast, measureSaturation, measureTints } from '../../core/stats.ts';
import { aspectOf, type Pixels } from '../../core/image.ts';
import { detectCuts, frameSignature, shotsFromCuts } from '../../core/cuts.ts';
import { decodePng, isPng, PngError, readPngHeader } from '../../engine/png.ts';

type Ctx = ActionContext;
type BreakdownT = z.infer<typeof Breakdown>;
type ReferenceT = z.infer<typeof Reference>;

const getBreakdown = (ctx: Ctx, p: string, s: string) => load(ctx, Breakdown, col.breakdowns(p), s, 'breakdown for shot');

const NUMERIC = new Set(['saturation', 'contrast_stops', 'light.key_az', 'light.key_el', 'light.key_kelvin', 'light.fill_kelvin', 'light.ratio', 'lens.focal_mm', 'lens.height_m']);

/** A frame's PNG, base64. 1.9 M characters is 1.4 MB of PNG: a 512 × 512 frame of pure noise fits. */
const PNG_B64 = z.string().min(16).max(1_900_000).regex(/^[A-Za-z0-9+/]+={0,2}$/, 'png_base64 must be base64');

const frameName = (i: number) => `${String(i).padStart(5, '0')}.png`;

function measured<T>(value: T, by: string, now: string, unit?: string) {
  return { value, ...(unit ? { unit } : {}), source: 'measured' as const, updated_by: by, updated_at: now };
}

/** A value a person set by hand survives re-measurement. */
function keep<T extends { source: string }>(old: T | undefined, fresh: T): T {
  return old && old.source === 'manual' ? old : fresh;
}

async function loadFrame(ctx: Ctx, p: string, ref: ReferenceT, i: number): Promise<Pixels> {
  const bytes = await ctx.store.getBlob(col.frames(p, ref.id), frameName(i));
  if (!bytes) throw new ActionError('not_found', '', `frame ${i} of reference "${ref.id}" is missing; add it with breakdown.add_frame`);
  return decodePng(bytes);
}

/** A reference that has pixels: not the design's sample, and every planned frame present. */
async function readyReference(ctx: Ctx, p: string, id: string): Promise<ReferenceT> {
  const ref = await load(ctx, Reference, col.references(p), id, 'reference');
  if (ref.sample || !ref.file) {
    throw new ActionError('not_found', '', `reference "${id}" is the design's sample and has no frames: import an image or video first (breakdown.import_reference)`);
  }
  const have = (await ctx.store.listBlobs(col.frames(p, id))).length;
  if (have < ref.frame_count) {
    throw new ActionError('invalid_input', '', `reference "${id}" has ${have} of ${ref.frame_count} frames; add the rest with breakdown.add_frame first`);
  }
  return ref;
}

/** The reference attached to a shot: the breakdown's, else the project shot's. */
async function referenceFor(ctx: Ctx, p: string, s: string): Promise<ReferenceT> {
  const b = await ctx.store.get<BreakdownT>(col.breakdowns(p), s);
  let id = b?.reference_id ?? null;
  if (!id) {
    const project = await load(ctx, Project, col.projects, p, 'project');
    id = project.shots.find((x) => x.id === s)?.reference_id ?? null;
  }
  if (!id) throw new ActionError('not_found', '', `shot "${s}" has no reference: import an image or video first (breakdown.import_reference)`);
  return readyReference(ctx, p, id);
}

/** Cuts over every sampled frame, stored on the reference as its shots (source "measured"). */
async function detect(ctx: Ctx, p: string, ref: ReferenceT) {
  const signatures: Float32Array[] = [];
  let aspect = '';
  for (let i = 0; i < ref.frame_count; i++) {
    const px = await loadFrame(ctx, p, ref, i);
    if (i === 0) aspect = aspectOf(px).label;
    signatures.push(frameSignature(px));
  }
  const cuts = detectCuts(signatures);
  const shots = shotsFromCuts(ref.frame_count, cuts, ref.sample_fps).map((s, k) => ({ code: String(k + 1), ...s }));
  const saved = await save(ctx, Reference, col.references(p), ref.id, stamp(ctx, { ...ref, shots, shots_source: 'measured' as const, aspect }));
  return { ref: saved, cuts };
}

/** A new shot's breakdown: measured leaves are filled by the caller; the rest is the design's sample, labelled so. */
function template(ctx: Ctx, p: string, s: string, refId: string): BreakdownT {
  const d = sampleSeed(ctx.now(), ctx.user, ctx.workspace).breakdown;
  return Breakdown.parse({ ...d, ...meta(ctx, s), project_id: p, shot_id: s, reference_id: refId, palette: [] });
}

function paletteOf(px: Pixels, by: string, now: string) {
  return measurePalette(px).swatches.slice(0, 12).map((sw) => ({ hex: sw.hex, share: measured(sw.share, by, now, '%'), at: sw.at }));
}

/** The key frame of the longest detected shot (the earliest on a tie): a black leader or a flash frame is never the default. */
function defaultFrame(ref: ReferenceT): number {
  let best = ref.shots[0];
  for (const s of ref.shots) if (s.out_s - s.in_s > best.out_s - best.in_s) best = s;
  return best?.key_frame ?? 0;
}

async function analyseShot(ctx: Ctx, p: string, s: string, frameIndex: number | undefined, by: string): Promise<BreakdownT> {
  let ref = await referenceFor(ctx, p, s);
  if (ref.shots_source !== 'measured') ref = (await detect(ctx, p, ref)).ref;
  const idx = frameIndex ?? defaultFrame(ref);
  if (idx >= ref.frame_count) throw new ActionError('invalid_input', '', `frame_index ${idx} is past this reference's ${ref.frame_count} frames`);
  const px = await loadFrame(ctx, p, ref, idx);
  const now = ctx.now();
  const tints = measureTints(px);
  const old = (await ctx.store.get<unknown>(col.breakdowns(p), s)) ? await getBreakdown(ctx, p, s) : template(ctx, p, s, ref.id);
  const b: BreakdownT = {
    ...old,
    reference_id: ref.id,
    frame_index: idx,
    palette: paletteOf(px, by, now),
    tints: {
      shadow: keep(old.tints.shadow, measured(tints.shadow.text, by, now)),
      mid: keep(old.tints.mid, measured(tints.mid.text, by, now)),
      highlight: keep(old.tints.highlight, measured(tints.highlight.text, by, now)),
    },
    tint_hex: { shadow: tints.shadow.hex, mid: tints.mid.hex, highlight: tints.highlight.hex },
    saturation: keep(old.saturation, measured(measureSaturation(px).pct, by, now, '%')),
    contrast_stops: keep(old.contrast_stops, measured(measureContrast(px).stops, by, now, 'stops')),
    framing: { ...old.framing, aspect: keep(old.framing.aspect, measured(aspectOf(px).label, by, now)) },
    updated_at: now,
  };
  return save(ctx, Breakdown, col.breakdowns(p), s, b);
}

const RANK: Record<Source, number> = { measured: 0, manual: 1, ai: 2, sample: 3 };
/** The least trustworthy source among some values: one sample value makes the whole group sample. */
function weakest(sources: Source[]): Source {
  return sources.reduce<Source>((w, s) => (RANK[s] > RANK[w] ? s : w), sources.length ? 'measured' : 'sample');
}

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
  defineAction({
    name: 'breakdown.import_reference',
    title: 'Import reference (video or image)',
    description:
      'Registers a reference image or video for a shot: file name, type, size, date and SHA-256 content hash, as the browser read them. ' +
      'The file itself is not copied and its path is not known. Frames follow with breakdown.add_frame: frame i is at i / sample_fps seconds, ' +
      `at most ${ANALYSIS_MAX_SIDE} px on the long side, at most ${MAX_FRAMES} frames. Re-importing the same content resets its frames.`,
    tier: 'T0', effect: 'write', rules: ['R1'], key: '⌘I',
    input: z.object({
      ...target,
      file_name: z.string().trim().min(1).max(255),
      media: z.enum(['image', 'video']),
      mime: z.string().max(100).regex(/^(image|video)\/[A-Za-z0-9.+-]+$/, 'mime is image/… or video/…'),
      size_bytes: z.number().int().nonnegative().max(1e13),
      sha256: z.string().regex(/^[0-9a-f]{64}$/, 'sha256 is 64 lowercase hex characters'),
      last_modified: z.string().max(40).nullable().default(null),
      width: z.number().int().positive().max(16_384),
      height: z.number().int().positive().max(16_384),
      duration_s: z.number().nonnegative().max(86_400).default(0),
      sample_fps: z.number().nonnegative().max(30).default(0),
      frame_count: z.number().int().min(1).max(MAX_FRAMES),
    }),
    output: z.object({ reference_id: Id, frame_count: z.number().int(), imported: z.literal(true) }),
    handler: async (ctx, i) => {
      if (i.media === 'image' && (i.frame_count !== 1 || i.sample_fps !== 0)) throw new ActionError('invalid_input', '', 'an image has one frame and sample_fps 0');
      if (i.media === 'video' && i.sample_fps <= 0) throw new ActionError('invalid_input', '', 'a video needs sample_fps above 0');
      const project = await load(ctx, Project, col.projects, i.project_id, 'project');
      const shot = project.shots.find((s) => s.id === i.shot_id);
      if (!shot) throw new ActionError('not_found', '', `shot "${i.shot_id}" not found in project "${i.project_id}"`);
      const id = `ref-${i.sha256.slice(0, 12)}`;
      await ctx.store.removeBlobs(col.frames(i.project_id, id));
      const existing = await ctx.store.get<ReferenceT>(col.references(i.project_id), id);
      await save(ctx, Reference, col.references(i.project_id), id, {
        ...meta(ctx, id), ...(existing ? { created_at: existing.created_at, created_by: existing.created_by } : {}),
        project_id: i.project_id, file_name: i.file_name, media: i.media, local_only: true, duration_s: i.duration_s,
        aspect: '', shots: [], shots_source: null, sample: false,
        file: { name: i.file_name, mime: i.mime, size_bytes: i.size_bytes, last_modified: i.last_modified, sha256: i.sha256 },
        width: i.width, height: i.height, sample_fps: i.sample_fps, frame_count: i.frame_count,
      });
      shot.reference_id = id;
      await save(ctx, Project, col.projects, i.project_id, stamp(ctx, project));
      const b = await ctx.store.get<unknown>(col.breakdowns(i.project_id), i.shot_id);
      if (b) {
        const bd = Breakdown.parse(b);
        await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, { ...bd, reference_id: id, frame_index: null }));
      }
      return { reference_id: id, frame_count: i.frame_count, imported: true as const };
    },
  }),
  defineAction({
    name: 'breakdown.add_frame',
    title: 'Add a sampled frame',
    description:
      `Stores one sampled frame of an imported reference: an 8-bit PNG, at most ${ANALYSIS_MAX_SIDE} px on its long side, base64. ` +
      'Index i is the frame at i / sample_fps seconds. Bodies up to 2 MB.',
    tier: 'T0', effect: 'write', command: false, logged: false, maxBytes: 2_000_000,
    input: z.object({ project_id: target.project_id, reference_id: Id, index: z.number().int().min(0).max(MAX_FRAMES - 1), png_base64: PNG_B64 }),
    output: z.object({ index: z.number().int(), width: z.number().int(), height: z.number().int(), bytes: z.number().int() }),
    handler: async (ctx, i) => {
      const ref = await load(ctx, Reference, col.references(i.project_id), i.reference_id, 'reference');
      if (ref.sample || !ref.file) throw new ActionError('invalid_input', '', `reference "${ref.id}" is the design's sample; import a file first`);
      if (i.index >= ref.frame_count) throw new ActionError('invalid_input', '', `index ${i.index} is past this reference's ${ref.frame_count} planned frames`);
      const bytes = Buffer.from(i.png_base64, 'base64');
      if (!isPng(bytes)) throw new ActionError('invalid_input', '', 'the frame is not a PNG');
      const h = readPngHeader(bytes);
      if (Math.max(h.width, h.height) > ANALYSIS_MAX_SIDE) {
        throw new ActionError('invalid_input', '', `the frame is ${h.width} × ${h.height}; analysis frames are at most ${ANALYSIS_MAX_SIDE} px on the long side`);
      }
      try {
        decodePng(bytes);
      } catch (e) {
        throw new ActionError('invalid_input', '', e instanceof PngError ? e.message : 'the PNG could not be read');
      }
      await ctx.store.putBlob(col.frames(i.project_id, ref.id), frameName(i.index), bytes);
      return { index: i.index, width: h.width, height: h.height, bytes: bytes.length };
    },
  }),
  defineAction({
    name: 'breakdown.get_frame',
    title: 'Get a sampled frame',
    description: 'Returns one stored analysis frame of a reference as base64 PNG, with its time in seconds.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object({ project_id: target.project_id, reference_id: Id, index: z.number().int().min(0).max(MAX_FRAMES - 1).default(0) }),
    output: z.object({ index: z.number().int(), t_s: z.number(), width: z.number().int(), height: z.number().int(), png_base64: z.string() }),
    handler: async (ctx, i) => {
      const ref = await load(ctx, Reference, col.references(i.project_id), i.reference_id, 'reference');
      const bytes = await ctx.store.getBlob(col.frames(i.project_id, ref.id), frameName(i.index));
      if (!bytes) throw new ActionError('not_found', '', `frame ${i.index} of reference "${ref.id}" not found`);
      const h = readPngHeader(bytes);
      return { index: i.index, t_s: ref.sample_fps ? i.index / ref.sample_fps : 0, width: h.width, height: h.height, png_base64: Buffer.from(bytes).toString('base64') };
    },
  }),
  defineAction({
    name: 'breakdown.get_reference',
    title: 'Get reference',
    description: 'Returns a reference: file facts (name, type, size, SHA-256), sampling rate, frame count, and its detected shots with in/out times.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object({ project_id: target.project_id, reference_id: Id }),
    output: Reference,
    handler: (ctx, i) => load(ctx, Reference, col.references(i.project_id), i.reference_id, 'reference'),
  }),
  defineAction({
    name: 'breakdown.detect_shots',
    title: 'Detect shots',
    description:
      'Finds the cuts in a reference from frame-to-frame colour-histogram distance with an adaptive threshold (a slow fade or dissolve is not a cut) ' +
      'and stores its shots with in/out times and a key frame. Deterministic (T0); defaults to the shot\'s reference.',
    tier: 'T0', effect: 'write', rules: ['R1'],
    input: z.object({ ...target, reference_id: Id.optional() }),
    output: z.object({ reference_id: Id, shots: z.array(ReferenceShot), cuts: z.array(z.number().int()), source: z.literal('measured') }),
    handler: async (ctx, i) => {
      const ref = i.reference_id ? await readyReference(ctx, i.project_id, i.reference_id) : await referenceFor(ctx, i.project_id, i.shot_id);
      const { ref: saved, cuts } = await detect(ctx, i.project_id, ref);
      return { reference_id: saved.id, shots: saved.shots, cuts, source: 'measured' as const };
    },
  }),
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
