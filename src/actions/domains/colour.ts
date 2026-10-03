// Colour (P4.5, P-LL-001): the grade check first (D-LL-052). A still from a test shoot or a grade is imported with
// its one frame (AD-LL-018) and measured against the shot's measured reference frame with the same T0 instruments
// (src/core/grade-check.ts). Helpers (command: false) until the colour design export adds their buttons; Claude Code
// can call them over MCP now.
import { z } from 'zod';
import { ANALYSIS_MAX_SIDE, CameraRecording, Charts, Gel, GradeCheck, Id, Kit, LightColour, MediaFile, Monitoring, Project, Still, StillKind } from '../../contracts/index.ts';
import { checkGrade, measureFrame } from '../../core/grade-check.ts';
import { decodePng, isPng, readPngHeader } from '../../engine/png.ts';
import { ActionError, defineAction, type AnyAction } from '../registry.ts';
import { col, load, meta, save, stamp, target } from '../records.ts';
import { getBreakdown, loadFrame, readyReference } from './breakdown-shared.ts';

const PNG_B64 = z.string().min(16).max(1_900_000).regex(/^[A-Za-z0-9+/]+={0,2}$/, 'png_base64 must be base64');
const FRAME = 'frame.png';

export const colourActions: AnyAction[] = [
  defineAction({
    name: 'colour.import_still',
    title: 'Import a still for the grade check',
    description:
      'Stores a still from a test shoot or a grade for a shot: its file facts (name, type, size, date, SHA-256; never the file or ' +
      `its path) and its one frame, an 8-bit PNG of at most ${ANALYSIS_MAX_SIDE} px on its long side, base64. Kind "display" ` +
      '(graded, Rec.709) or "log" (S-Log3 from the camera). The grade check compares it with the shot\'s reference.',
    tier: 'T0', effect: 'write', command: false, maxBytes: 2_000_000,
    input: z.object({
      ...target,
      file_name: MediaFile.shape.name, mime: MediaFile.shape.mime, size_bytes: MediaFile.shape.size_bytes,
      sha256: MediaFile.shape.sha256, last_modified: MediaFile.shape.last_modified,
      kind: StillKind.default('display'), png_base64: PNG_B64,
    }),
    output: z.object({ still_id: Id, width: z.number().int(), height: z.number().int(), kind: StillKind }),
    handler: async (ctx, i) => {
      const project = await load(ctx, Project, col.projects, i.project_id, 'project');
      if (!project.shots.some((s) => s.id === i.shot_id)) throw new ActionError('not_found', '', `shot "${i.shot_id}" not found in project "${i.project_id}"`);
      const bytes = Buffer.from(i.png_base64, 'base64');
      if (!isPng(bytes)) throw new ActionError('invalid_input', '', 'the still is not a PNG');
      const h = readPngHeader(bytes);
      if (Math.max(h.width, h.height) > ANALYSIS_MAX_SIDE) {
        throw new ActionError('invalid_input', '', `the still is ${h.width} × ${h.height}; frames are at most ${ANALYSIS_MAX_SIDE} px on the long side`);
      }
      decodePng(bytes); // refuses what the instruments cannot read, now rather than at the check
      const id = `still-${i.sha256.slice(0, 12)}`;
      await save(ctx, Still, col.stills(i.project_id), id, {
        ...meta(ctx, id), project_id: i.project_id, shot_id: i.shot_id, width: h.width, height: h.height, kind: i.kind,
        file: { name: i.file_name, mime: i.mime, size_bytes: i.size_bytes, last_modified: i.last_modified, sha256: i.sha256 },
      });
      await ctx.store.putBlob(col.stillFrame(i.project_id, id), FRAME, bytes);
      return { still_id: id, width: h.width, height: h.height, kind: i.kind };
    },
  }),
  defineAction({
    name: 'colour.check_grade',
    title: 'Check a still against the reference',
    description:
      'Measures a still and the shot\'s measured reference frame with the same instruments (palette, contrast, saturation, tints; ' +
      'active picture only) and says, in numbers, how far each is: each reference swatch paired one-to-one with the still\'s ' +
      '(ΔE00 and share), contrast in stops, saturation and each tint zone, with pass / close / far (validation.md §5.4, proposals). ' +
      'The check is kept. A log still waits for the look LUT (S-Log3, P4.5).',
    tier: 'T0', effect: 'write', command: false,
    input: z.object({ ...target, still_id: Id }),
    output: z.object({ check_id: Id, rows: GradeCheck.shape.rows, swatches: GradeCheck.shape.swatches, extra: GradeCheck.shape.extra, thresholds_version: z.number() }),
    handler: async (ctx, i) => {
      const still = await load(ctx, Still, col.stills(i.project_id), i.still_id, 'still');
      if (still.shot_id !== i.shot_id) throw new ActionError('invalid_input', '', `still "${still.id}" belongs to shot ${still.shot_id}, not ${i.shot_id}`);
      if (still.kind === 'log') {
        throw new ActionError('invalid_input', '', 'a log still is compared through the look LUT, which needs S-Log3 from Sony\'s document (P4.5, not built yet); import a graded (display) still');
      }
      const b = await getBreakdown(ctx, i.project_id, i.shot_id);
      if (!b.reference_id || b.frame_index === null || !b.palette.every((p) => p.share.source === 'measured')) {
        throw new ActionError('invalid_input', '', 'this shot has no measured reference frame: import a reference first');
      }
      const ref = await loadFrame(ctx, i.project_id, await readyReference(ctx, i.project_id, b.reference_id), b.frame_index);
      const bytes = await ctx.store.getBlob(col.stillFrame(i.project_id, still.id), FRAME);
      if (!bytes) throw new ActionError('not_found', '', `the frame of still "${still.id}" is missing; import it again`);
      const r = checkGrade(measureFrame(ref), measureFrame(decodePng(bytes)));
      const id = `check-${i.shot_id}-${Date.parse(ctx.now()).toString(36)}`.toLowerCase().slice(0, 64);
      const kept = await save(ctx, GradeCheck, col.gradechecks(i.project_id), id, {
        ...meta(ctx, id), project_id: i.project_id, shot_id: i.shot_id, still_id: still.id, reference_id: b.reference_id,
        frame_index: b.frame_index, lut_applied: false, thresholds_version: r.thresholds_version,
        rows: r.rows.map((row) => ({ ...row, source: 'measured' as const })), swatches: r.swatches, extra: r.extra,
      });
      return { check_id: id, rows: kept.rows, swatches: kept.swatches, extra: kept.extra, thresholds_version: kept.thresholds_version };
    },
  }),
  defineAction({
    name: 'colour.get_check',
    title: 'Get the latest grade check',
    description: 'Returns the shot\'s most recent grade check: its rows, swatches and verdicts, and the still and reference frame it compared.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object(target),
    output: GradeCheck.extend({ check_id: Id }),
    handler: async (ctx, i) => {
      const all = (await ctx.store.list(col.gradechecks(i.project_id))).map((x) => GradeCheck.parse(x)).filter((c) => c.shot_id === i.shot_id);
      if (!all.length) throw new ActionError('not_found', '', `shot ${i.shot_id} has no grade check yet`);
      const latest = all.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
      return { ...latest, check_id: latest.id };
    },
  }),
  defineAction({
    name: 'adapt.set_kit_colour',
    title: 'Set the kit\'s colour facts',
    description:
      'Records the kit\'s colour facts by hand (AD-LL-014): a gel from the gel book or the founder\'s swatch book (mired shift, ' +
      'warmer positive), a light\'s colour range from its sheet, what the camera records, monitoring, charts. Every typed number ' +
      'carries its citation (document, page or URL, date read, licence). A gel with the same id is replaced; remove_gel removes one.',
    tier: 'T0', effect: 'write', command: false,
    input: z.object({
      project_id: target.project_id,
      kit_id: Id.optional(),
      gel: Gel.optional(),
      remove_gel: Id.optional(),
      light: z.object({ item_id: Id, colour: LightColour }).optional(),
      recording: CameraRecording.optional(),
      monitoring: Monitoring.omit({ source: true }).optional(),
      charts: Charts.omit({ source: true }).optional(),
    }),
    output: z.object({ kit_id: Id, gels: z.number().int(), lights_with_colour: z.number().int() }),
    handler: async (ctx, i) => {
      const kits = (await ctx.store.list(col.kits(i.project_id))).map((k) => Kit.parse(k));
      const kit = i.kit_id ? kits.find((k) => k.id === i.kit_id) : kits[0];
      if (!kit) throw new ActionError('not_found', '', `no kit${i.kit_id ? ` "${i.kit_id}"` : ''} in project "${i.project_id}"`);
      let gels = kit.gels;
      if (i.gel) gels = [...gels.filter((g) => g.id !== i.gel!.id), i.gel];
      if (i.remove_gel) gels = gels.filter((g) => g.id !== i.remove_gel);
      let items = kit.items;
      if (i.light) {
        const item = items.find((x) => x.id === i.light!.item_id);
        if (!item) throw new ActionError('not_found', '', `"${i.light.item_id}" is not in the kit`);
        if (item.category !== 'light') throw new ActionError('invalid_input', '', `"${item.name}" is not a light`);
        items = items.map((x) => (x.id === item.id ? { ...x, colour: i.light!.colour } : x));
      }
      const next = {
        ...kit, gels, items,
        camera: { ...kit.camera, recording: i.recording ?? kit.camera.recording },
        monitoring: i.monitoring ? { ...i.monitoring, source: 'manual' as const } : kit.monitoring,
        charts: i.charts ? { ...i.charts, source: 'manual' as const } : kit.charts,
      };
      await save(ctx, Kit, col.kits(i.project_id), kit.id, stamp(ctx, next));
      return { kit_id: kit.id, gels: gels.length, lights_with_colour: items.filter((x) => x.colour).length };
    },
  }),
];
