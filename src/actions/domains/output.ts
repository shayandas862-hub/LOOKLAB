// Shots, mood board, set sheet and library: the screens that turn plans into things people use.
import { z } from 'zod';
import { Board, Id, Look, Project, SetSheet } from '../../contracts/index.ts';
import { defineAction, type AnyAction } from '../registry.ts';
import { col, load, save, stamp, target } from '../records.ts';

const note = (text: string) => z.object({ done: z.literal(false), note: z.literal(text) });
const NOT_BUILT = 'Stand-in: nothing was produced. Arrives in its phase (docs/phases.md).';

export const outputActions: AnyAction[] = [
  // Shots
  defineAction({
    name: 'shots.list',
    title: 'List shots in a scene',
    description: 'Returns the scene\'s shots with size, lens, move, duration and status.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object({ project_id: target.project_id, scene_id: Id.default('sc12') }),
    output: z.object({ shots: Project.shape.shots }),
    handler: async (ctx, i) => {
      const p = await load(ctx, Project, col.projects, i.project_id, 'project');
      return { shots: p.shots.filter((s) => s.scene_id === i.scene_id) };
    },
  }),
  defineAction({
    name: 'shots.play_previs',
    title: 'Play previs',
    description: 'Plays the scene\'s shots in order. Returns the running time.',
    tier: 'T0', effect: 'read', key: 'Space',
    input: z.object({ project_id: target.project_id, scene_id: Id.default('sc12') }),
    output: z.object({ scene_id: z.string(), shots: z.number(), duration_s: z.number() }),
    handler: async (ctx, i) => {
      const shots = (await load(ctx, Project, col.projects, i.project_id, 'project')).shots.filter((s) => s.scene_id === i.scene_id);
      return { scene_id: i.scene_id, shots: shots.length, duration_s: shots.reduce((t, s) => t + s.duration_s, 0) };
    },
  }),
  defineAction({
    name: 'shots.render_frame',
    title: 'Render previs frame',
    description: 'Renders the shot\'s frame from its set plan camera. Stand-in until P9.',
    tier: 'T0', effect: 'write', standIn: true,
    input: z.object(target),
    output: note(NOT_BUILT),
    handler: async () => ({ done: false as const, note: NOT_BUILT }),
  }),
  // Mood board
  defineAction({
    name: 'board.get',
    title: 'Get mood board',
    description: 'Returns the project\'s mood board: frames, notes and the board palette.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object({ project_id: target.project_id }),
    output: Board,
    handler: (ctx, i) => load(ctx, Board, col.boards(i.project_id), 'board', 'mood board'),
  }),
  defineAction({
    name: 'board.add_reference',
    title: 'Add reference to board',
    description: 'Adds frames to the mood board. Stand-in until P8.',
    tier: 'T0', effect: 'write', standIn: true,
    input: z.object({ project_id: target.project_id }),
    output: note(NOT_BUILT),
    handler: async () => ({ done: false as const, note: NOT_BUILT }),
  }),
  defineAction({
    name: 'board.add_note',
    title: 'Add note to board',
    description: 'Adds a note to the mood board.',
    tier: 'T0', effect: 'write',
    input: z.object({ project_id: target.project_id, text: z.string().trim().min(1).max(2000).default('Note') }),
    output: z.object({ note_id: Id, notes: z.number() }),
    handler: async (ctx, i) => {
      const b = await load(ctx, Board, col.boards(i.project_id), 'board', 'mood board');
      const id = `n${b.notes.length + 1}-${Date.parse(ctx.now()).toString(36)}`;
      await save(ctx, Board, col.boards(i.project_id), 'board', stamp(ctx, { ...b, notes: [...b.notes, { id, text: i.text, by: ctx.user, at: ctx.now() }] }));
      return { note_id: id, notes: b.notes.length + 1 };
    },
  }),
  defineAction({
    name: 'board.extract_palette',
    title: 'Extract palette from board',
    description: 'Measures one palette across all board frames. Stand-in until P8.',
    tier: 'T0', effect: 'write', standIn: true,
    input: z.object({ project_id: target.project_id }),
    output: z.object({ palette: Board.shape.palette, source: z.literal('sample') }),
    handler: async (ctx, i) => ({ palette: (await load(ctx, Board, col.boards(i.project_id), 'board', 'mood board')).palette, source: 'sample' as const }),
  }),
  defineAction({
    name: 'board.export_pdf',
    title: 'Export board (PDF)',
    description: 'Exports the mood board as a PDF. Stand-in until P8.',
    tier: 'T0', effect: 'write', standIn: true,
    input: z.object({ project_id: target.project_id }),
    output: note(NOT_BUILT),
    handler: async () => ({ done: false as const, note: NOT_BUILT }),
  }),
  // Set sheet
  defineAction({
    name: 'setsheet.get',
    title: 'Get set sheet',
    description: 'Returns the shot\'s set sheet: gear, camera settings, setup order, safety notes.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object(target),
    output: SetSheet,
    handler: (ctx, i) => load(ctx, SetSheet, col.setsheets(i.project_id), i.shot_id, 'set sheet for shot'),
  }),
  defineAction({
    name: 'setsheet.generate',
    title: 'Generate set sheet',
    description: 'Builds the crew sheet from the current plan version. Stand-in until P7.',
    tier: 'T0', effect: 'write', standIn: true,
    input: z.object(target),
    output: SetSheet,
    handler: (ctx, i) => load(ctx, SetSheet, col.setsheets(i.project_id), i.shot_id, 'set sheet for shot'),
  }),
  defineAction({
    name: 'setsheet.export_pdf',
    title: 'Export set sheet (PDF)',
    description: 'Exports the set sheet as an A4 PDF. Stand-in until P7.',
    tier: 'T0', effect: 'write', standIn: true, key: '⌘P',
    input: z.object(target),
    output: note(NOT_BUILT),
    handler: async () => ({ done: false as const, note: NOT_BUILT }),
  }),
  defineAction({
    name: 'setsheet.send_to_phone',
    title: 'Send set sheet to crew phones',
    description: 'Shares the set sheet with the crew. Sends data off this machine, so it needs approval. Stand-in until P7.',
    tier: 'T3', effect: 'upload', confirm: true, standIn: true,
    input: z.object(target),
    output: note(NOT_BUILT),
    handler: async () => ({ done: false as const, note: NOT_BUILT }),
  }),
  // Library
  defineAction({
    name: 'library.list',
    title: 'List saved looks',
    description: 'Returns every saved look with palette, key light, ratio, tags and mood.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object({}),
    output: z.object({ looks: z.array(Look) }),
    handler: async (ctx) => ({ looks: (await ctx.store.list(col.looks)).map((l) => Look.parse(l)) }),
  }),
  defineAction({
    name: 'library.apply_look',
    title: 'Apply look to shot',
    description: 'Replaces a shot\'s look targets with a saved look. Needs approval. Stand-in until P8.',
    tier: 'T3', effect: 'write', confirm: true, standIn: true,
    input: z.object({ ...target, look_id: Id.default('kitchen-sodium') }),
    output: note(NOT_BUILT),
    handler: async () => ({ done: false as const, note: NOT_BUILT }),
  }),
  defineAction({
    name: 'library.compare',
    title: 'Compare look with shot',
    description: 'Compares a saved look with a shot\'s breakdown. Stand-in until P8.',
    tier: 'T0', effect: 'read', standIn: true,
    input: z.object({ ...target, look_id: Id.default('kitchen-sodium') }),
    output: note(NOT_BUILT),
    handler: async () => ({ done: false as const, note: NOT_BUILT }),
  }),
];
