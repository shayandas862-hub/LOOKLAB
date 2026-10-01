// Breakdown helpers shared by its action modules: loading references and frames, the P2 measurement of a shot,
// and the small rules every breakdown write follows (a hand-set value survives re-measurement).
import { z } from 'zod';
import { Breakdown, Project, Reference } from '../../contracts/index.ts';
import type { Source } from '../../contracts/index.ts';
import { ActionError } from '../registry.ts';
import type { ActionContext } from '../context.ts';
import { col, load, meta, save, stamp } from '../records.ts';
import { sampleSeed } from '../sample.ts';
import { measurePalette } from '../../core/palette.ts';
import { measureContrast, measureSaturation, measureTints } from '../../core/stats.ts';
import { aspectOf, type Pixels } from '../../core/image.ts';
import { detectCuts, frameSignature, shotsFromCuts } from '../../core/cuts.ts';
import { decodePng } from '../../engine/png.ts';

export type Ctx = ActionContext;
export type BreakdownT = z.infer<typeof Breakdown>;
export type ReferenceT = z.infer<typeof Reference>;

export const getBreakdown = (ctx: Ctx, p: string, s: string) => load(ctx, Breakdown, col.breakdowns(p), s, 'breakdown for shot');

export const frameName = (i: number) => `${String(i).padStart(5, '0')}.png`;

export function measured<T>(value: T, by: string, now: string, unit?: string) {
  return { value, ...(unit ? { unit } : {}), source: 'measured' as const, updated_by: by, updated_at: now };
}

/** A value a person set by hand survives re-measurement. */
export function keep<T extends { source: string }>(old: T | undefined, fresh: T): T {
  return old && old.source === 'manual' ? old : fresh;
}

export async function loadFrame(ctx: Ctx, p: string, ref: ReferenceT, i: number): Promise<Pixels> {
  const bytes = await ctx.store.getBlob(col.frames(p, ref.id), frameName(i));
  if (!bytes) throw new ActionError('not_found', '', `frame ${i} of reference "${ref.id}" is missing; add it with breakdown.add_frame`);
  return decodePng(bytes);
}

/** A reference that has pixels: not the design's sample, and every planned frame present. */
export async function readyReference(ctx: Ctx, p: string, id: string): Promise<ReferenceT> {
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
export async function referenceFor(ctx: Ctx, p: string, s: string): Promise<ReferenceT> {
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
export async function detect(ctx: Ctx, p: string, ref: ReferenceT) {
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

export function paletteOf(px: Pixels, by: string, now: string) {
  return measurePalette(px).swatches.slice(0, 12).map((sw) => ({ hex: sw.hex, share: measured(sw.share, by, now, '%'), at: sw.at }));
}

/** The key frame of the longest detected shot (the earliest on a tie): a black leader or a flash frame is never the default. */
export function defaultFrame(ref: ReferenceT): number {
  let best = ref.shots[0];
  for (const s of ref.shots) if (s.out_s - s.in_s > best.out_s - best.in_s) best = s;
  return best?.key_frame ?? 0;
}

/**
 * The focal length from the original's EXIF, source "metadata" (AD-LL-010): the 35 mm equivalent when the file
 * has it, else the actual focal length. A value set by hand is kept; a file without EXIF does not inherit the
 * last file's, it goes back to the sample value until a person sets it.
 */
function focalOf(old: BreakdownT['lens']['focal_mm'], ref: ReferenceT, sample: () => BreakdownT['lens']['focal_mm'], by: string, now: string) {
  if (old.source === 'manual') return old;
  const e = ref.exif, v = e ? (e.focal_35mm ?? e.focal_mm) : null;
  if (!e || v === null) return old.source === 'metadata' ? sample() : old;
  const unit = e.focal_35mm !== null ? 'mm (35 mm equiv.)' : 'mm (actual; sensor size unknown)';
  return { value: v, unit, source: 'metadata' as const, updated_by: `${by} (EXIF)`, updated_at: now };
}

export async function analyseShot(ctx: Ctx, p: string, s: string, frameIndex: number | undefined, by: string): Promise<BreakdownT> {
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
    lens: { ...old.lens, focal_mm: focalOf(old.lens.focal_mm, ref, () => sampleSeed(now, ctx.user, ctx.workspace).breakdown.lens.focal_mm, by, now) },
    updated_at: now,
  };
  return save(ctx, Breakdown, col.breakdowns(p), s, b);
}

const RANK: Record<Source, number> = { measured: 0, manual: 1, metadata: 2, estimate: 3, ai: 4, sample: 5 };
/** The least trustworthy source among some values (AD-LL-010): one sample value makes the whole group sample. */
export function weakest(sources: Source[]): Source {
  return sources.reduce<Source>((w, s) => (RANK[s] > RANK[w] ? s : w), sources.length ? 'measured' : 'sample');
}
