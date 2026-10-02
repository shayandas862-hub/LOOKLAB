// Projects, settings, the decision log, and app navigation.
import { z } from 'zod';
import { Decision, Id, Project, Settings, Verdict } from '../../contracts/index.ts';
import { ActionError, defineAction, type AnyAction } from '../registry.ts';
import { col, load, meta, save, stamp, target } from '../records.ts';

export const SCREENS = ['projects', 'breakdown', 'location', 'plan', 'shots', 'board', 'sheet', 'library', 'activity', 'settings'] as const;
const SCREEN_TITLES: Record<(typeof SCREENS)[number], string> = {
  projects: 'Projects', breakdown: 'Breakdown', location: 'Location & Kit', plan: 'Set Plan', shots: 'Shots',
  board: 'Mood Board', sheet: 'Set Sheet', library: 'Library', activity: 'Activity', settings: 'Settings',
};
const SCREEN_KEYS: Partial<Record<(typeof SCREENS)[number], string>> = { projects: '⌘0', activity: '⌘9' };

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'project';

export const systemActions: AnyAction[] = [
  // Projects
  defineAction({
    name: 'project.list',
    title: 'List projects',
    description: 'Returns every project with its scenes and shots.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object({}),
    output: z.object({ projects: z.array(Project) }),
    handler: async (ctx) => ({ projects: (await ctx.store.list(col.projects)).map((p) => Project.parse(p)) }),
  }),
  defineAction({
    name: 'project.create',
    title: 'New project',
    description: 'Creates a production with a name, a type and optional shoot dates.',
    tier: 'T0', effect: 'write',
    input: z.object({
      name: z.string().trim().min(1).max(120).default('Untitled project'),
      type: z.string().trim().min(1).max(60).default('short film'),
      shoot_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
      shoot_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().default(null),
    }),
    output: z.object({ project_id: Id }),
    handler: async (ctx, i) => {
      const base = slug(i.name);
      let id = base;
      for (let n = 2; await ctx.store.get(col.projects, id); n++) id = `${base}-${n}`;
      await save(ctx, Project, col.projects, id, { ...meta(ctx, id), name: i.name, type: i.type, shoot_from: i.shoot_from, shoot_to: i.shoot_to });
      return { project_id: id };
    },
  }),
  // Settings
  defineAction({
    name: 'settings.get',
    title: 'Get settings',
    description: 'Returns No AI mode, theme, the AI provider and spend cap, and which projects allow cloud.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object({}),
    output: Settings,
    handler: (ctx) => ctx.settings(),
  }),
  defineAction({
    name: 'settings.copy_mcp_command',
    title: 'Copy Claude Code setup command',
    description: 'Returns the `claude mcp add` command that connects Claude Code to this Look Lab. The token is read from a file, never printed.',
    tier: 'T0', effect: 'read',
    input: z.object({}),
    output: z.object({ command: z.string() }),
    handler: async (ctx) => ({ command: ctx.mcpCommand() }),
  }),
  defineAction({
    name: 'settings.set_cap',
    title: 'Set monthly AI spend cap',
    description: 'Sets the monthly cap (₹) for in-app AI calls. At the cap, AI buttons stop.',
    tier: 'T0', effect: 'write',
    input: z.object({ amount_inr: z.number().finite().min(0).max(1_000_000) }),
    output: z.object({ cap_inr: z.number() }),
    handler: async (ctx, i) => {
      const s = await ctx.settings();
      await ctx.saveSettings({ ...s, api: { ...s.api, cap_inr: i.amount_inr } });
      ctx.events.emit({ type: 'settings' });
      return { cap_inr: i.amount_inr };
    },
  }),
  defineAction({
    name: 'settings.toggle_cloud',
    title: 'Allow cloud for a project',
    description: 'Allows or stops uploading this project\'s footage to cloud services. Needs approval.',
    tier: 'T3', effect: 'write', confirm: true,
    input: z.object({ project_id: target.project_id, on: z.boolean() }),
    output: z.object({ project_id: z.string(), cloud_allowed: z.boolean() }),
    handler: async (ctx, i) => {
      const p = await load(ctx, Project, col.projects, i.project_id, 'project');
      await save(ctx, Project, col.projects, i.project_id, stamp(ctx, { ...p, cloud_allowed: i.on }));
      const s = await ctx.settings();
      const set = new Set(s.cloud_allowed_projects);
      if (i.on) set.add(i.project_id);
      else set.delete(i.project_id);
      await ctx.saveSettings({ ...s, cloud_allowed_projects: [...set] });
      ctx.events.emit({ type: 'settings' });
      return { project_id: i.project_id, cloud_allowed: i.on };
    },
  }),
  defineAction({
    name: 'settings.toggle_no_ai',
    title: 'Toggle No AI mode',
    description: 'Turns No AI mode on or off. With it on, every AI action is refused and every screen works by hand.',
    tier: 'T0', effect: 'write',
    input: z.object({ on: z.boolean() }),
    output: z.object({ no_ai: z.boolean() }),
    handler: async (ctx, i) => {
      await ctx.saveSettings({ ...(await ctx.settings()), no_ai: i.on });
      ctx.events.emit({ type: 'settings' });
      return { no_ai: i.on };
    },
  }),
  // Decision log
  defineAction({
    name: 'log.list',
    title: 'List decisions',
    description: 'Returns the newest decisions: command, tier, rule, caller, result, stand-in flag and the human verdict.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object({ limit: z.number().int().min(1).max(1000).default(100) }),
    output: z.object({ decisions: z.array(Decision) }),
    handler: async (ctx, i) => ({ decisions: (await ctx.listDecisions()).slice(-i.limit).reverse() }),
  }),
  defineAction({
    name: 'log.set_verdict',
    title: 'Agree with or override a decision',
    description: 'Records a person\'s verdict on a logged decision: agreed or overridden.',
    tier: 'T3', effect: 'write',
    input: z.object({ decision_id: Id, verdict: Verdict }),
    output: z.object({ decision_id: z.string(), verdict: Verdict }),
    handler: async (ctx, i) => {
      const known = (await ctx.listDecisions()).some((d) => d.id === i.decision_id);
      if (!known) throw new ActionError('not_found', '', `decision "${i.decision_id}" not found`);
      await ctx.store.append('verdicts', { decision_id: i.decision_id, verdict: i.verdict, by: ctx.user, at: ctx.now() });
      return { decision_id: i.decision_id, verdict: i.verdict };
    },
  }),
  // App
  defineAction({
    name: 'app.status',
    title: 'Engine status',
    description: 'Returns the engine version, AI mode and memory in use.',
    tier: 'T0', effect: 'read', command: false,
    input: z.object({}),
    output: z.object({
      version: z.string(), ai_provider: z.string(), no_ai: z.boolean(), rss_mb: z.number(),
      mcp_last_seen: z.string().nullable(), mcp_tools: z.number(),
    }),
    handler: async (ctx) => {
      const info = ctx.engineInfo();
      return {
        version: '0.3.0', ai_provider: ctx.ai.name, no_ai: (await ctx.settings()).no_ai,
        rss_mb: Math.round(process.memoryUsage().rss / 1048576),
        mcp_last_seen: info.mcp_last_seen, mcp_tools: info.tools,
      };
    },
  }),
  defineAction({
    name: 'app.command_palette',
    title: 'Open command palette',
    description: 'Opens ⌘K. Returns the commands it lists.',
    tier: 'T0', effect: 'read', key: '⌘K',
    input: z.object({}),
    output: z.object({ opened: z.boolean() }),
    handler: async () => ({ opened: true }),
  }),
  ...SCREENS.map((screen) =>
    defineAction({
      name: `app.open_${screen}`,
      title: `Go to ${SCREEN_TITLES[screen]}`,
      description: `Opens the ${SCREEN_TITLES[screen]} screen.`,
      tier: 'T0', effect: 'read', key: SCREEN_KEYS[screen],
      input: z.object({}),
      output: z.object({ screen: z.literal(screen) }),
      handler: async () => ({ screen }),
    }),
  ),
];
