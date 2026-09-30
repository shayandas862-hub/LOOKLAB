# Look Lab — handoff for Claude Code

Prototype entry: `Look Lab.dc.html` (shell: sidebar, top bar, ⌘K palette, toasts). Each screen is its own file and mounts inside the shell. Tokens and components: `Design System.dc.html`.

Desktop first: 1440×900, works down to 1280×800. Set Sheet also at 390 px phone and A4.

## 1. Product rules the build must keep

1. Every value carries a source: `measured`, `ai` (with confidence 0–100), `manual`, `sample`. AI values render in secondary text with a dashed badge. Confidence below 60 turns the badge amber and routes the value to review.
2. Every AI action has a manual path next to it. No AI mode (`settings.no_ai = true`) must leave every screen usable. AI buttons disable and show the reason; manual controls stay live.
3. Every action is a named command. One registry backs buttons (tooltip shows the name), the ⌘K palette (shows the name), and the MCP server used by Claude Code.
4. AI connection: people use their own Claude subscription by running Claude Code, which drives Look Lab over MCP. A separate Anthropic API key powers in-app AI buttons, with a monthly spend cap. No "Sign in with Claude" anywhere.
5. Client footage stays on the machine unless cloud is allowed per project.

## 2. Screens

| Screen | File | Purpose |
|---|---|---|
| Projects | `Projects.dc.html` | Production grid with stage progress; open project's scenes; recent activity. |
| Breakdown | `Breakdown.dc.html` | Measure a reference: palette, light, lens & camera, framing, mood. Overlays: thirds, light direction, palette points. Shot strip + scrubber. Ask box. |
| Location & Kit | `LocationKit.dc.html` | Location facts and plan, kit checklist, the recipe with gaps and risks. |
| Set Plan | `SetPlan.dc.html` | 3D / top-down / camera views of the location. Outliner, properties, look match strip. |
| Shots | `Shots.dc.html` | Previs board for a scene, timeline with playback, selected shot panel. |
| Mood Board | `MoodBoard.dc.html` | Canvas of reference clusters with palette strips and notes; board palette and tags. |
| Set Sheet | `SetSheet.dc.html` | Print (A4) and phone versions of the crew sheet. |
| Library | `Library.dc.html` | Saved looks with filters; apply or compare. |
| Settings · AI & connections | `Settings.dc.html` | Claude Code MCP, API key + cap, other providers, local models, privacy, No AI mode, theme. |
| Activity | `Activity.dc.html` | Decision log with tier, rule, confidence, cost and verdict. Expandable rows. |
| Command palette | in `Look Lab.dc.html` | ⌘K overlay over any screen. |

### States (all wired in the prototype; switch via Tweaks on the shell)

| State | Where | Behaviour |
|---|---|---|
| Empty | Breakdown | Dropzone: drag a video or image, Browse, Paste a link. Panel says "No breakdown yet". |
| Uploading | Breakdown | Progress bar in MB and %. Copy notes that files stay local. |
| Analysing | Breakdown | Per-step list: shots → colour → light → lens → framing → mood, each with tier. AI steps show "skipped, enter by hand" when AI is unavailable. |
| Low confidence | Breakdown | Amber banner "3 values need review"; badges under 60% turn amber. |
| AI not connected | global | Pill "AI not connected". AI buttons disabled with reason; manual works. |
| Spend cap reached | global + Settings | Pill amber; API card border amber, "AI buttons paused". |
| Error + retry | Breakdown | Error card names the failed step and command, keeps finished steps, offers Retry and a manual path. |
| Offline | global | Amber banner; local tools and manual editing continue. |

## 3. Component inventory

| Component | Props | States |
|---|---|---|
| SourceBadge | `source: 'measured'\|'ai'\|'manual'\|'sample'`, `confidence?: number` | ai ≥60 dashed neutral; ai <60 dashed amber + soft fill |
| ValueRow | `label, value, unit?, source, confidence?, editable, onCommit(value)` | idle, hover, editing (accent border), manual after edit |
| PropertyField | `label, value: number, unit, step, source, onChange` | default, focus, manual |
| Swatch / SwatchRow | `hex, share, source, selected, onSelect` | default, hover, selected (bg3) |
| PaletteBar | `swatches[]` | — |
| LightDial | `azimuth (°, −180..180, negative = screen-left), elevation (°)` | — (read-only; edit via fields) |
| OverlayToggleGroup | `items[{id,label,on,command}]` | on/off |
| ShotStrip | `shots[{code,duration}]`, `current`, `onSeek` | current (accent border), scrub head |
| AskBox | `onAsk(text)`, `suggestions[]`, `disabledReason?` | enabled, disabled (AI unavailable), answer card |
| RecipeStep | `n, title, text, source, confidence?, editable` | AI read-only, manual textarea |
| GapBox / RiskBox / ErrorBox | `title, body, hint?` | amber / neutral / red |
| KitItem | `name, qty, available, onToggle` | checked / unchecked |
| OutlinerRow | `label, kind: light\|camera\|actor\|set, meta, selected` | default, hover, selected |
| Viewport | `view: '3d'\|'top'\|'camera'`, `objects[]`, `selectedId`, `onMove(id,x,y)` | drag only in top view |
| MatchScore | `score, delta, metrics[{label, plan, ref, delta, ok}]` | delta amber when out of tolerance |
| TierChip | `tier: T0\|T1\|T2\|T3` | T2 dashed (AI), T3 solid strong |
| CommandRow | `label, command, shortcut, active` | active (bg3) |
| AiPill | `state: connected\|not-connected\|cap\|offline\|no-ai` | dot colour per state |
| Toggle | `on, onChange` | on (accent) / off |
| Toast | `text, command` | auto-dismiss 2.6 s |

## 4. Action catalogue

AI = calls a model (T1/T2). Det = deterministic (T0 instrument / solver). Confirm = needs human confirmation before it writes.

| Command | Screen | Inputs | Outputs | AI / Det | Confirm |
|---|---|---|---|---|---|
| `breakdown.import_reference` | Breakdown, Projects | file or URL, project_id | reference | Det | no |
| `breakdown.detect_shots` | Breakdown | reference | shots[] with in/out | AI (T1) | no |
| `breakdown.sample_palette` | Breakdown | reference, shot | palette[hex, share] (measured) | Det | no |
| `breakdown.analyse` | Breakdown | reference | full breakdown (runs the steps below) | AI + Det | no |
| `breakdown.fit_light` | Breakdown | frame | light {key, fill, ratio, hardness, practicals} | AI (T2) | no (values flagged) |
| `breakdown.fit_lens` | Breakdown | frame | lens {focal, dof, height, angle} | AI (T2) | no |
| `breakdown.fit_framing` | Breakdown | frame | framing {size, subject, lead room} | AI (T1) | no |
| `breakdown.fit_mood` | Breakdown | frame, palette | mood tags | AI (T2) | no |
| `breakdown.edit_value` | Breakdown | field, value | value with source=manual | Det | no |
| `breakdown.review` | Breakdown | field | confirmed value | human (T3) | yes |
| `breakdown.toggle_thirds` / `_light` / `_samples` | Breakdown | on | overlay state | Det | no |
| `breakdown.ask` | Breakdown | question, breakdown | answer text + confidence | AI (T2) | no |
| `breakdown.save_look` | Breakdown | breakdown | look | Det | no |
| `adapt.open` | Breakdown | shot | navigation | Det | no |
| `adapt.add_kit` | Location & Kit | item, qty | kit item | Det | no |
| `adapt.check_power` | Location & Kit | kit, location.power | risks[] | Det | no |
| `adapt.generate_recipe` | Location & Kit | breakdown, location, kit | recipe {steps, gaps, risks} | AI (T2) | yes (before open in plan) |
| `adapt.write_recipe` | Location & Kit | steps[] | recipe (manual) | Det | no |
| `adapt.open_in_plan` | Location & Kit | recipe | set plan seeded from recipe | Det | no |
| `plan.add_light` | Set Plan | fixture type | light object | Det | no |
| `plan.move_object` | Set Plan | id, x, y, z | object | Det | no |
| `plan.set_property` | Set Plan | id, field, value | object | Det | no |
| `plan.set_view` | Set Plan | 3d \| top \| camera | view | Det | no |
| `plan.match_light` | Set Plan | plan, breakdown targets | key position + power, new score | Det (solver) | no (undoable) |
| `plan.undo` | Set Plan | — | previous plan state | Det | no |
| `plan.save_plan` | Set Plan | plan | plan version (v+1) | Det | no |
| `shots.play_previs` | Shots | scene | playback | Det | no |
| `shots.render_frame` | Shots | shot, plan | previs frame | Det (renderer) | no |
| `board.add_reference` | Mood Board | files | board frames | Det | no |
| `board.add_note` | Mood Board | text | note | Det | no |
| `board.extract_palette` | Mood Board | frames | board palette (measured) | Det | no |
| `board.export_pdf` | Mood Board | board | PDF | Det | no |
| `setsheet.generate` | Set Plan, Shots, Set Sheet | plan version | set sheet | Det | no |
| `setsheet.export_pdf` | Set Sheet | set sheet | A4 PDF | Det | no |
| `setsheet.send_to_phone` | Set Sheet | set sheet, crew | share links | Det | yes |
| `library.apply_look` | Library | look, shot | shot targets replaced | Det | yes |
| `library.compare` | Library | look, shot | comparison view | Det | no |
| `project.create` | Projects | name, type, dates | project | Det | no |
| `settings.copy_mcp_command` | Settings | — | clipboard | Det | no |
| `settings.set_cap` | Settings | amount (₹) | cap | Det | no |
| `settings.add_provider` | Settings | provider, key | connection | Det | yes |
| `settings.toggle_cloud` | Settings | project, on | privacy flag | Det | yes |
| `settings.toggle_no_ai` | Settings | on | global flag | Det | no |
| `log.set_verdict` | Activity | decision_id, agreed \| overridden | decision row | human (T3) | no |
| `app.command_palette` / `app.open_*` | global | — | navigation | Det | no |

## 5. Data each screen reads and writes

```
Reference   { id, project_id, file_path, local_only, duration, aspect, shots[{code, in, out}] }
Value<T>    { value: T, unit?, source: 'measured'|'ai'|'manual'|'sample', confidence?, updated_by, updated_at }
Breakdown   { shot_id, palette[{hex, share: Value}], tints{shadow, mid, highlight}, saturation, contrast,
              light{ key{az, el, hardness, kelvin, type}, fill{kelvin, kind}, ratio, practicals },
              lens{ focal, dof, height, angle, movement }, framing{ size, subject_pos, lead_room, aspect },
              mood[tags] }            // every leaf is a Value
Location    { id, name, photos[], floor{w, d, ceiling}, windows[{wall, width}], power[{amps, shared_with?}], hours{from, to} }
Kit         { items[{id, name, qty, available, category}], camera{body, lenses[]}, crew[] }
Recipe      { shot_id, source, steps[{n, title, text, source, confidence?}], gaps[{text, fix?}], risks[{text, fix?}] }
SetPlan     { shot_id, version, objects[{id, kind, label, x, y, z, props{power, kelvin, gel, modifier, beam, lens, t_stop}}],
              match{ score, metrics{contrast, warmth, brightness, direction} }, saved_at }
Shot        { id, scene_id, code, desc, size, lens, move, duration, status: 'reference'|'planned'|'sheet_ready', reference_id, plan_version }
Look        { id, name, project_id, shot_id, palette[], key{az, el, kelvin, hardness}, ratio, tags[], mood[] }
SetSheet    { shot_id, plan_version, gear[{name, qty, packed}], camera{lens, t, iso, shutter, wb, height, tilt}, steps[], safety[] }
Decision    { id, time, command, shot_id, tier: 'T0'|'T1'|'T2'|'T3', rule_id, inputs[], result, confidence?, cost_inr, verdict: 'agreed'|'overridden'|null, why }
Settings    { no_ai, theme, api{key_ref, cap_inr, used_inr}, mcp{connected, tools}, providers[], local_models[{name, loaded, size_mb}], cloud_allowed_projects[] }
```

| Screen | Reads | Writes |
|---|---|---|
| Projects | projects, scenes, shots, decisions (recent) | project, reference (import) |
| Breakdown | reference, breakdown, settings | breakdown values, look, decisions |
| Location & Kit | breakdown, location, kit, settings | kit, recipe, decisions |
| Set Plan | recipe, set plan, breakdown targets | set plan (versions), decisions |
| Shots | shots, set plans, references | shot status |
| Mood Board | board frames, notes | frames, notes, board palette |
| Set Sheet | set plan, kit, location | set sheet (packed flags), exports |
| Library | looks | shot targets (apply) |
| Settings | settings | settings |
| Activity | decisions | decision verdicts |

## 6. Geometry and match maths used in the prototype

- Plan coordinates in metres, origin at the room's north-west corner, x east, y south, z up. Subject face height 1.45 m.
- Azimuth: signed angle between subject→camera and subject→light in plan; negative = light on camera-left (screen-left).
- Elevation: atan((light.z − 1.45) / horizontal distance).
- Ratio model: `7.4 × (power/80) × (3.614/distance)²` (calibrated to the sample plan).
- Score: `100 − 0.8|az+60| − 0.8|el−25| − 25|log2(ratio/8)| − |K−2000|/40 − 13|exposure|`, clamped 0–100. Sample plan gives 87%.
- `plan.match_light` rotates the key to −60° az, sets horizontal distance for 25° el at the current height, and sets power for 8:1.

## 7. Tokens

Defined on `[data-theme="dark"]` and `[data-theme="light"]` in each file's head. Names: `--bg0..3, --line, --line2, --tx, --tx2, --tx3, --sur, --acc, --acc-ink, --acc-soft, --warn, --warn-soft, --err, --err-soft, --sh`. Fonts: Geist (UI), Geist Mono (all numbers). Base text 13 px, 8 px grid, radii 4/6/8/10.
