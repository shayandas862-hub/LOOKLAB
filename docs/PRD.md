# Look Lab — Product requirements (v1)

Derived from the founder's brief of 2026-09-30 and the approved design
(`design/HANDOFF.md`). The why is in [`VISION.md`](VISION.md); the build order is
in [`phases.md`](phases.md).

## Users
- **Primary:** the founder's film production team: DPs, gaffers, directors,
  producers. Technical, want editable numbers, work on laptops including an 8 GB M1.
- **Later:** the public.

## The pain it removes (ranked by the founder's brief)
1. Lighting and blocking worked out on the day while a paid crew waits.
2. The wrong gear hired or brought.
3. Location surprises: space, windows, power.
4. The result drifting from what the director or client approved.

## Jobs
| # | Job | Screen |
|---|---|---|
| J1 | Break a reference down into exact colour, light, lens, framing, movement and mood. | Breakdown |
| J2 | Ask a question about the reference ("what's the exact colour scheme?"). | Breakdown |
| J3 | Adapt the look to our location and kit: steps, gaps, risks. | Location & Kit |
| J4 | Place lights, camera and actors in 3D until the view matches the reference. | Set Plan |
| J5 | Hand the crew a plan they can run: plot, gear, settings, order. | Set Sheet |
| J6 | Keep and reuse looks; build mood boards; previs a scene. | Library, Mood Board, Shots |
| J7 | Let Claude Code do any of the above. | MCP (every action) |
| J8 | See every decision the system made and overrule it. | Activity |

## Requirements that apply everywhere
- Every value shows its source: measured, AI (with confidence), manual, or sample.
- Every AI action has a manual path; No AI mode leaves every screen usable.
- Every action is available as a button, in ⌘K and over MCP.
- Client footage stays on the machine unless cloud is allowed for that project.
- Desktop first (1440×900, down to 1280×800); Set Sheet also at 390 px and A4.

## Success
| Measure | Target |
|---|---|
| Palette accuracy on synthetic images | ΔE ≤ 2 per swatch, share ± 2 points |
| Light direction on a Blender ground-truth set | median az ≤ 15°, el ≤ 10° |
| Look match on the v0.2 samples | ≥ 85% |
| Look Lab's own memory on the M1 | ≤ 1.5 GB in normal use |
| Time from dropping a reference to a breakdown | ≤ 60 s for a 60 s 1080p clip on the M1 (to measure) |
| Real use | the team plans a real shoot's shots in Look Lab and runs the day from the set sheet |

## Out of scope for v1
Video generation; real-time diffusion on the M1; full 3D reconstruction of people
on local hardware; any claim that taste is measured.
