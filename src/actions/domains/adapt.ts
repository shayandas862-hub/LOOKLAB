// Adapt: fit the reference's look to our location and kit. Recipe generation is a stand-in until P5.
import { z } from 'zod';
import { Id, Kit, KitItem, Location, Recipe } from '../../contracts/index.ts';
import { defineAction, type AnyAction } from '../registry.ts';
import { col, load, meta, save, stamp, target } from '../records.ts';

const KIT_ID = Id.default('neel-kit');
const LOCATION_ID = Id.default('ballygunge-kitchen');

export const adaptActions: AnyAction[] = [
  defineAction({
    name: 'adapt.get',
    title: 'Get location, kit and recipe',
    description: 'Returns the location, the kit and the current recipe for a shot.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object({ ...target, location_id: LOCATION_ID, kit_id: KIT_ID }),
    output: z.object({ location: Location, kit: Kit, recipe: Recipe.nullable() }),
    handler: async (ctx, i) => ({
      location: await load(ctx, Location, col.locations(i.project_id), i.location_id, 'location'),
      kit: await load(ctx, Kit, col.kits(i.project_id), i.kit_id, 'kit'),
      recipe: (await ctx.store.get(col.recipes(i.project_id), i.shot_id)) as z.infer<typeof Recipe> | null,
    }),
  }),
  defineAction({
    name: 'adapt.open',
    title: 'Adapt to our location',
    description: 'Opens the Location & Kit screen for a shot.',
    tier: 'T0', effect: 'read', key: '⌘2',
    input: z.object(target),
    output: z.object({ screen: z.literal('location'), shot_id: z.string() }),
    handler: async (_c, i) => ({ screen: 'location' as const, shot_id: i.shot_id }),
  }),
  defineAction({
    name: 'adapt.add_kit',
    title: 'Add kit item',
    description: 'Adds an item to the kit: a light, modifier, gel, grip, camera, lens or other, with quantity and wattage.',
    tier: 'T0', effect: 'write',
    input: z.object({
      project_id: target.project_id, kit_id: KIT_ID,
      name: z.string().trim().min(1).max(120).default('60 W LED panel'),
      qty: z.number().int().positive().max(999).default(1),
      category: KitItem.shape.category,
      watts: z.number().nonnegative().max(100_000).nullable().default(null),
    }),
    output: z.object({ item: KitItem, count: z.number() }),
    handler: async (ctx, i) => {
      const kit = await load(ctx, Kit, col.kits(i.project_id), i.kit_id, 'kit');
      const base = i.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'item';
      let id = base;
      for (let n = 2; kit.items.some((x) => x.id === id); n++) id = `${base}-${n}`;
      const item = KitItem.parse({ id, name: i.name, qty: i.qty, category: i.category, watts: i.watts });
      await save(ctx, Kit, col.kits(i.project_id), i.kit_id, stamp(ctx, { ...kit, items: [...kit.items, item] }));
      return { item, count: kit.items.length + 1 };
    },
  }),
  defineAction({
    name: 'adapt.check_power',
    title: 'Check power budget',
    description: 'Checks the kit\'s draw against the location\'s power points and lists risks. Stand-in until P5.',
    tier: 'T0', effect: 'read', standIn: true,
    input: z.object({ ...target, location_id: LOCATION_ID, kit_id: KIT_ID }),
    output: z.object({ risks: Recipe.shape.risks, source: z.literal('sample') }),
    handler: async (ctx, i) => {
      const r = await ctx.store.get<z.infer<typeof Recipe>>(col.recipes(i.project_id), i.shot_id);
      return { risks: r?.risks ?? [], source: 'sample' as const };
    },
  }),
  defineAction({
    name: 'adapt.generate_recipe',
    title: 'Generate recipe (AI)',
    description: 'Writes the steps to get the reference look here with this kit, plus gaps and risks. Stand-in until P5.',
    tier: 'T2', effect: 'write', ai: true, standIn: true, key: '⌘⇧R',
    input: z.object(target),
    output: Recipe,
    handler: (ctx, i) => load(ctx, Recipe, col.recipes(i.project_id), i.shot_id, 'recipe'),
  }),
  defineAction({
    name: 'adapt.write_recipe',
    title: 'Write recipe by hand',
    description: 'Saves a recipe a person wrote. Replaces the shot\'s recipe; source becomes "manual".',
    tier: 'T0', effect: 'write',
    input: z.object({
      ...target,
      steps: z.array(z.object({ title: z.string().trim().min(1).max(80), text: z.string().trim().max(2000) })).max(30)
        .default([{ title: 'Key', text: '' }]),
    }),
    output: Recipe,
    handler: async (ctx, i) => {
      const prev = await ctx.store.get<z.infer<typeof Recipe>>(col.recipes(i.project_id), i.shot_id);
      return save(ctx, Recipe, col.recipes(i.project_id), i.shot_id, {
        ...(prev ? stamp(ctx, prev) : meta(ctx, i.shot_id)), project_id: i.project_id, shot_id: i.shot_id,
        source: 'manual', approved: false, gaps: prev?.gaps ?? [], risks: prev?.risks ?? [],
        steps: i.steps.map((s, n) => ({ n: n + 1, title: s.title, text: s.text, source: 'manual' as const })),
      });
    },
  }),
  defineAction({
    name: 'adapt.open_in_plan',
    title: 'Open recipe in Set Plan',
    description: 'Seeds the shot\'s set plan from the approved recipe. Needs a person\'s approval. Stand-in until P5.',
    tier: 'T3', effect: 'write', confirm: true, standIn: true,
    input: z.object(target),
    output: z.object({ screen: z.literal('plan'), shot_id: z.string(), seeded: z.literal(false) }),
    handler: async (_c, i) => ({ screen: 'plan' as const, shot_id: i.shot_id, seeded: false as const }),
  }),
];
