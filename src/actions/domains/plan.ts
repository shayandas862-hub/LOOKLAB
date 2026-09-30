// Set Plan: the 3D scene graph for a shot (D-LL-009). Editing is real; the look match is a stand-in until P6.
import { z } from 'zod';
import { Id, PlanObject, SetPlan } from '../../contracts/index.ts';
import { ActionError, defineAction, type AnyAction } from '../registry.ts';
import { col, load, save, stamp, target } from '../records.ts';
import type { ActionContext } from '../context.ts';

const Coord = z.number().finite().min(-50).max(50);
const HISTORY = 50;

async function edit(ctx: ActionContext, p: string, s: string, change: (objects: z.infer<typeof PlanObject>[]) => z.infer<typeof PlanObject>[]) {
  const plan = await load(ctx, SetPlan, col.plans(p), s, 'set plan for shot');
  const history = [...plan.history, plan.objects].slice(-HISTORY);
  const next = { ...plan, objects: change(structuredClone(plan.objects)), history, match: plan.match ? { ...plan.match, source: 'sample' as const } : null };
  return save(ctx, SetPlan, col.plans(p), s, stamp(ctx, next));
}

function find(objects: z.infer<typeof PlanObject>[], id: string) {
  const o = objects.find((x) => x.id === id);
  if (!o) throw new ActionError('not_found', '', `no object "${id}" in this plan`);
  return o;
}

export const planActions: AnyAction[] = [
  defineAction({
    name: 'plan.get',
    title: 'Get set plan',
    description: 'Returns the shot\'s set plan: every light, camera, actor and set piece with position (metres) and properties.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object(target),
    output: SetPlan,
    handler: (ctx, i) => load(ctx, SetPlan, col.plans(i.project_id), i.shot_id, 'set plan for shot'),
  }),
  defineAction({
    name: 'plan.add_light',
    title: 'Add light',
    description: 'Adds a light fixture to the plan at a position in metres (x east, y south, z up from the room\'s north-west corner).',
    tier: 'T0', effect: 'write', key: 'L',
    input: z.object({ ...target, fixture: z.string().trim().min(1).max(80).default('60 W LED panel'), x: Coord.default(1.5), y: Coord.default(1.5), z: Coord.default(2) }),
    output: z.object({ object: PlanObject }),
    handler: async (ctx, i) => {
      let added!: z.infer<typeof PlanObject>;
      await edit(ctx, i.project_id, i.shot_id, (objs) => {
        let n = objs.filter((o) => o.kind === 'light').length + 1;
        while (objs.some((o) => o.id === `light${n}`)) n++;
        added = { id: `light${n}`, kind: 'light', label: i.fixture, x: i.x, y: i.y, z: i.z, props: { power: 50, kelvin: 5600 } };
        return [...objs, added];
      });
      return { object: added };
    },
  }),
  defineAction({
    name: 'plan.move_object',
    title: 'Move object',
    description: 'Moves a light, camera, actor or set piece to a new position in metres. Undoable.',
    tier: 'T0', effect: 'write',
    input: z.object({ ...target, id: Id, x: Coord, y: Coord, z: Coord.optional() }),
    output: z.object({ object: PlanObject }),
    handler: async (ctx, i) => {
      let moved!: z.infer<typeof PlanObject>;
      await edit(ctx, i.project_id, i.shot_id, (objs) => {
        moved = find(objs, i.id);
        Object.assign(moved, { x: i.x, y: i.y, ...(i.z === undefined ? {} : { z: i.z }) });
        return objs;
      });
      return { object: moved };
    },
  }),
  defineAction({
    name: 'plan.set_property',
    title: 'Set object property',
    description: 'Sets one property of an object: power (%), kelvin, gel, modifier, beam (°), lens (mm), t_stop. Undoable.',
    tier: 'T0', effect: 'write',
    input: z.object({ ...target, id: Id, field: z.string().regex(/^[a-z_]{1,32}$/), value: z.union([z.string().max(120), z.number().finite(), z.boolean()]) }),
    output: z.object({ object: PlanObject }),
    handler: async (ctx, i) => {
      let changed!: z.infer<typeof PlanObject>;
      await edit(ctx, i.project_id, i.shot_id, (objs) => {
        changed = find(objs, i.id);
        changed.props = { ...changed.props, [i.field]: i.value };
        return objs;
      });
      return { object: changed };
    },
  }),
  defineAction({
    name: 'plan.set_view',
    title: 'Switch view',
    description: 'Switches the Set Plan view: 3D, top-down plot or camera view. View state only.',
    tier: 'T0', effect: 'read', key: 'T',
    input: z.object({ view: z.enum(['3d', 'top', 'camera']).default('top') }),
    output: z.object({ view: z.string() }),
    handler: async (_c, i) => ({ view: i.view }),
  }),
  defineAction({
    name: 'plan.match_light',
    title: 'Match light in set plan',
    description: 'Moves the key and sets its power so the plan matches the reference\'s light. Stand-in until P6.',
    tier: 'T0', effect: 'write', standIn: true, rules: ['R13'], key: '⌘M',
    input: z.object(target),
    output: z.object({ score: z.number(), source: z.literal('sample') }),
    handler: async (ctx, i) => {
      const plan = await load(ctx, SetPlan, col.plans(i.project_id), i.shot_id, 'set plan for shot');
      return { score: plan.match?.score ?? 0, source: 'sample' as const };
    },
  }),
  defineAction({
    name: 'plan.undo',
    title: 'Undo last plan change',
    description: 'Restores the plan to before its last change.',
    tier: 'T0', effect: 'write', key: '⌘Z',
    input: z.object(target),
    output: z.object({ undone: z.boolean(), remaining: z.number() }),
    handler: async (ctx, i) => {
      const plan = await load(ctx, SetPlan, col.plans(i.project_id), i.shot_id, 'set plan for shot');
      const prev = plan.history.at(-1);
      if (!prev) return { undone: false, remaining: 0 };
      await save(ctx, SetPlan, col.plans(i.project_id), i.shot_id, stamp(ctx, { ...plan, objects: prev, history: plan.history.slice(0, -1) }));
      return { undone: true, remaining: plan.history.length - 1 };
    },
  }),
  defineAction({
    name: 'plan.save_plan',
    title: 'Save plan as next version',
    description: 'Saves the plan as a new version (v+1).',
    tier: 'T0', effect: 'write', key: '⌘⇧S',
    input: z.object(target),
    output: z.object({ version: z.number() }),
    handler: async (ctx, i) => {
      const plan = await load(ctx, SetPlan, col.plans(i.project_id), i.shot_id, 'set plan for shot');
      const saved = await save(ctx, SetPlan, col.plans(i.project_id), i.shot_id, stamp(ctx, { ...plan, version: plan.version + 1, saved_at: ctx.now() }));
      return { version: saved.version };
    },
  }),
];
