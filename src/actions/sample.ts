// The design's sample project ("Neel", Scene 12, Shot 12C), stored so actions have
// something to work on before real data exists. Every value is source 'sample' (D-LL-015).
import type {
  Board, Breakdown, Kit, Location, Look, Project, Recipe, Reference, SetPlan, SetSheet,
} from '../contracts/index.ts';

export const SAMPLE_PROJECT = 'neel';
export const SAMPLE_SHOT = '12C';

export function sampleSeed(now: string, user: string, workspace: string) {
  const meta = (id: string) => ({ schema_version: 1 as const, id, workspace_id: workspace, created_by: user, created_at: now, updated_at: now });
  const s = <T>(value: T, unit?: string) => ({ value, ...(unit ? { unit } : {}), source: 'sample' as const, updated_by: 'design', updated_at: now });
  const P = SAMPLE_PROJECT;
  const shots = ['A', 'B', 'C', 'D', 'E', 'F'].map((c, i) => ({
    id: `12${c}`, code: `12${c}`, scene_id: 'sc12', desc: '', size: ['WS', 'MS', 'MCU', 'CU', 'OTS', 'INSERT'][i],
    lens: ['24', '35', '35', '50', '50', '85'][i] + ' mm', move: i === 1 ? 'slow push' : 'static',
    duration_s: [6, 8, 7, 5, 9, 4][i], status: (i < 2 ? 'sheet_ready' : i < 4 ? 'planned' : 'reference') as 'planned',
    reference_id: i === 2 ? 'ref-kitchen' : null, plan_version: i < 4 ? 3 : 0,
  }));

  const project: Project = {
    ...meta(P), name: 'Neel', type: 'short film', shoot_from: '2026-10-14', shoot_to: '2026-10-18',
    cloud_allowed: false, sample: true, scenes: [{ id: 'sc12', number: '12', title: 'Kitchen, night' }], shots,
  };

  const reference: Reference = {
    ...meta('ref-kitchen'), project_id: P, file_name: 'ref_kitchen_night.mov', media: 'video', local_only: true,
    duration_s: 22.4, aspect: '2.39:1', sample: true, shots_source: 'sample', file: null, width: 0, height: 0, sample_fps: 0, frame_count: 0,
    shots: ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((c, i) => ({ code: `12${c}`, in_s: i * 3.2, out_s: (i + 1) * 3.2 })),
  };

  const palette = ([['#1B2230', 38], ['#3E4A52', 22], ['#C7803A', 14], ['#6E5B4A', 11], ['#E9C9A0', 9], ['#0D0F12', 6]] as const)
    .map(([hex, share]) => ({ hex, share: s(share, '%') }));

  const breakdown: Breakdown = {
    ...meta(SAMPLE_SHOT), project_id: P, shot_id: SAMPLE_SHOT, reference_id: 'ref-kitchen', frame_index: null, subject: null, tint_hex: null, palette,
    tints: { shadow: s('blue −6'), mid: s('neutral'), highlight: s('warm +9') },
    saturation: s(38, '%'), contrast_stops: s(9.2, 'stops'),
    light: {
      key_az: s(-60, '°'), key_el: s(25, '°'), key_hardness: s('hard'), key_kelvin: s(2000, 'K'), key_type: s('sodium'),
      fill_kelvin: s(5600, 'K'), fill_kind: s('ambient'), ratio: s(8, ':1'), practicals: s('none'),
    },
    lens: { focal_mm: s(40, 'mm'), dof: s('shallow'), height_m: s(1.2, 'm'), angle: s('slight low, 4°'), movement: s('static') },
    framing: { size: s('MCU'), subject_pos: s('left third'), lead_room: s('right'), aspect: s('2.39:1') },
    mood: s(['lonely', 'warm–cold tension', 'neo-noir']), reviewed: [],
  };

  const location: Location = {
    ...meta('ballygunge-kitchen'), project_id: P, name: 'Ballygunge flat, kitchen',
    floor: { w_m: 3.1, d_m: 4.2, ceiling_m: 2.9 }, windows: [{ wall: 'east', width_m: 1.2 }],
    power: [{ id: 'p5a', amps: 5, shared_with: null }, { id: 'p15a', amps: 15, shared_with: 'fridge' }],
    hours: { from: '19:00', to: '02:00' }, sample: true,
  };

  const item = (id: string, name: string, qty: number, category: Kit['items'][number]['category'], watts: number | null = null) =>
    ({ id, name, qty, available: true, category, watts });
  const kit: Kit = {
    ...meta('neel-kit'), project_id: P, sample: true,
    items: [
      item('cob600', '600 W bi-colour COB', 1, 'light', 600), item('led60', '60 W LED panel', 2, 'light', 60),
      item('rgbtube', '4 ft RGB tube', 1, 'light', 40), item('frame44', '4×4 frame + ½ grid', 1, 'modifier'),
      item('flags', 'Flags', 2, 'grip'), item('cto', 'CTO full, ½ gels', 1, 'gel'), item('haze', 'Haze machine', 1, 'other', 700),
    ],
    camera: { body: 'Sony FX3', lenses_mm: [24, 35, 50, 85] }, crew: ['DP', 'gaffer', 'spark'],
  };

  const recipe: Recipe = {
    ...meta(SAMPLE_SHOT), project_id: P, shot_id: SAMPLE_SHOT, source: 'sample', approved: false,
    steps: [
      { n: 1, title: 'Key', text: '600 W COB outside the window, 3 m back, full CTO + ½ CTS to reach ≈2000 K. Flag the ceiling spill.', source: 'sample' },
      { n: 2, title: 'Fill', text: 'RGB tube bounced off the ceiling at 5600 K, 10%. Aim for 8:1 on the face.', source: 'sample' },
      { n: 3, title: 'Lens', text: '35 mm at T2 (closest prime to ≈40 mm). Camera 1.2 m, slight low angle.', source: 'sample' },
    ],
    gaps: [{ text: 'Need a stand outside the window at 2.5 m: not in kit.', fix: 'Hire a combo stand, or rig from the balcony rail.' }],
    risks: [{ text: '15 A point is shared with the fridge.', fix: 'Unplug the fridge during takes, or run the COB from the 5 A point at reduced power.' }],
  };

  const o = (id: string, kind: 'light' | 'camera' | 'actor' | 'set', label: string, x: number, y: number, z: number, props = {}) =>
    ({ id, kind, label, x, y, z, props });
  const plan: SetPlan = {
    ...meta(SAMPLE_SHOT), project_id: P, shot_id: SAMPLE_SHOT, version: 3, saved_at: now, history: [], sample: true,
    objects: [
      o('key', 'light', 'Key · window COB', 4.5, 1.5, 2.9, { power: 80, kelvin: 2150, gel: 'full CTO + ½ CTS', beam: 55 }),
      o('fill', 'light', 'Fill · tube bounce', 1.6, 2.2, 2.8, { power: 10, kelvin: 5600 }),
      o('prac', 'light', 'Practical · pendant', 2.65, 2.55, 2.2, { power: 0, kelvin: 2700 }),
      o('cam', 'camera', 'Cam A · 35 mm', 1.72, 1.11, 1.2, { lens: 35, t_stop: 2 }),
      o('rhea', 'actor', 'Rhea · mark 1', 1.5, 2.9, 0),
      o('arjun', 'actor', 'Arjun · mark 2', 0.6, 2.3, 0),
    ],
    match: { score: 87, source: 'sample', metrics: [{ label: 'Contrast ratio', plan: '7.4:1', ref: '8:1', ok: false }] },
  };

  const setsheet: SetSheet = {
    ...meta(SAMPLE_SHOT), project_id: P, shot_id: SAMPLE_SHOT, plan_version: 3, sample: true,
    gear: kit.items.map((i) => ({ name: i.name, qty: i.qty, packed: false })),
    camera: { lens: '35 mm', t: 'T2', iso: '3200', shutter: '180°', wb: '3200 K', height: '1.2 m', tilt: '+4°' },
    steps: ['Rig the COB stand outside the east window', 'Gel full CTO + ½ CTS', 'Flag the ceiling spill', 'Bounce the tube off the ceiling at 10%', 'Set camera at mark A, 1.2 m', 'Check 8:1 on the cheek with the meter'],
    safety: ['15 A point shared with the fridge: unplug during takes', 'Sandbag the exterior stand'],
  };

  const look: Look = {
    ...meta('kitchen-sodium'), name: 'Kitchen sodium', project_id: P, shot_id: SAMPLE_SHOT, source: 'sample', light_source: 'sample', mood_source: 'sample',
    palette: palette.map((p) => ({ hex: p.hex, share: p.share.value })), key: { az: -60, el: 25, kelvin: 2000, hardness: 'hard' },
    ratio: 8, tags: ['neo-noir', 'sodium', 'hard key'], mood: ['lonely', 'warm'],
  };

  const board: Board = {
    ...meta('board'), project_id: P, sample: true, palette_source: 'sample', notes: [],
    frames: [], palette: palette.map((p) => ({ hex: p.hex, share: p.share.value })),
  };

  return { project, reference, breakdown, location, kit, recipe, plan, setsheet, look, board };
}
