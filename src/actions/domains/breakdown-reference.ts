// Breakdown: the reference and its frames. The browser reads the file and sends its facts and sampled frames
// (D-LL-027); the engine keeps them and finds the shot cuts (D-LL-026).
import { z } from 'zod';
import { ANALYSIS_MAX_SIDE, Breakdown, Id, LensExif, MAX_FRAMES, Project, Reference, ReferenceShot } from '../../contracts/index.ts';
import { defineAction, ActionError, type AnyAction } from '../registry.ts';
import { col, load, meta, save, stamp, target } from '../records.ts';
import { decodePng, isPng, PngError, readPngHeader } from '../../engine/png.ts';
import { detect, frameName, readyReference, referenceFor, type ReferenceT } from './breakdown-shared.ts';

/** A frame's PNG, base64. 1.9 M characters is 1.4 MB of PNG: a 512 × 512 frame of pure noise fits. */
const PNG_B64 = z.string().min(16).max(1_900_000).regex(/^[A-Za-z0-9+/]+={0,2}$/, 'png_base64 must be base64');

export const referenceActions: AnyAction[] = [
  defineAction({
    name: 'breakdown.import_reference',
    title: 'Import reference (video or image)',
    description:
      'Registers a reference image or video for a shot: file name, type, size, date and SHA-256 content hash, as the browser read them. ' +
      'The file itself is not copied and its path is not known. `exif` carries only the lens tags the browser read from an image\'s EXIF ' +
      '(focal length, and its 35 mm equivalent when the file has it); nothing else from EXIF is sent or kept. Frames follow with breakdown.add_frame: frame i is at i / sample_fps seconds, ' +
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
      exif: LensExif.nullable().default(null),
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
        width: i.width, height: i.height, sample_fps: i.sample_fps, frame_count: i.frame_count, exif: i.exif,
      });
      shot.reference_id = id;
      await save(ctx, Project, col.projects, i.project_id, stamp(ctx, project));
      const b = await ctx.store.get<unknown>(col.breakdowns(i.project_id), i.shot_id);
      if (b) {
        const bd = Breakdown.parse(b);
        // A face box belongs to the picture it was drawn on: another file's is dropped (D-LL-033).
        const face = bd.reference_id === id ? bd.face : null;
        await save(ctx, Breakdown, col.breakdowns(i.project_id), i.shot_id, stamp(ctx, { ...bd, reference_id: id, frame_index: null, face }));
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
    name: 'breakdown.convert_image',
    title: 'Convert a photo the browser cannot open',
    description:
      'Converts a photo Chrome cannot decode (HEIC/HEIF from an iPhone, TIFF, camera RAW) on this Mac with macOS\'s own sips, and ' +
      'returns a PNG frame (at most 1024 px), the original\'s pixel size and its EXIF lens tags. Nothing is stored and nothing leaves ' +
      'the machine; the temporary copy is deleted (D-LL-055). The browser then imports it like any still. Bodies up to 48 MB.',
    tier: 'T0', effect: 'read', command: false, maxBytes: 48_000_000,
    input: z.object({
      file_name: z.string().trim().min(1).max(255),
      bytes_base64: z.string().min(16).max(64_000_000).regex(/^[A-Za-z0-9+/]+={0,2}$/, 'bytes_base64 must be base64'),
    }),
    output: z.object({ png_base64: z.string(), width: z.number().int().positive(), height: z.number().int().positive(), exif: LensExif.nullable() }),
    handler: async (ctx, i) => {
      try {
        const r = await ctx.converter.convert(Buffer.from(i.bytes_base64, 'base64'), i.file_name);
        return { png_base64: Buffer.from(r.png).toString('base64'), width: r.width, height: r.height, exif: r.exif };
      } catch (e) {
        throw new ActionError('invalid_input', '', (e as Error).message);
      }
    },
  }),
];
