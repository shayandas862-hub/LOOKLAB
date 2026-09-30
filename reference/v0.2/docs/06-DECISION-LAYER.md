# 06 · Decision layer

Today the decision layer is a **rule table** (R1–R14) that writes to a visible log. The plan is to log every decision with its state, then replace rules that have data behind them with a small learned router (Laya/Jev-class). This file is the contract for both.

## What a decision model is good for here
Decision models read a short text state plus a list of allowed options and return a probability per option. They are fast (Laya: 421M parameters, Apache 2.0, about 13 ms on MLX per its own report; Jev: a hosted API). They do **not** see images or video, do not generate images, and should not do numeric fitting. Use them to choose *which tool or step comes next*, not to compute a light angle.

## Rules in the prototype
Tier column: which tier acted. "RT" = the router itself. Where it lives: the code that writes the log row.

| Id | Tier | Rule | Real or stand-in | Where |
|---|---|---|---|---|
| R1 | T0 | FFmpeg scene detect (`scdet`) → shots, cuts, keyframes, contact sheet | **Sample text** (no ingest yet) | `base.html` tab 1 log |
| R2 | T0 | Measure the frame: face-size ratio → shot scale and lens; luminance zones; lit:shadow ratio; camera and set are *assumed known* for the fit | Measurements real on synthetic frames; lens and camera are given, not estimated | `base.html` |
| R3 | RT | One shot, one face → lighting goes to the analytic fit (T0). The language model is used for words only | Routing real; the T2 label is **sample text** | `base.html` |
| R4 | T0 | First guess from skin statistics: L/R ratio → azimuth, top/bottom → elevation, fill from log2(p90/p10). Also used in tab 2 to read the reference | Real | `createFit`, `scene.js` |
| R5 | RT | T2 confidence < 0.90 → queue the label for the human (T3); ≥ 0.90 → accept with spot-check | Threshold real, confidence is a **sample value** | `base.html` |
| R6 | T0 | Coarse sweep over azimuth × elevation (44 renders), keep best | Real | `createFit` |
| R7 | T0 | Greedy coordinate descent over az, el, int, soft, kel, fill; halve steps when nothing improves. Tab 2 reuses the rule id for its match-refinement steps | Real | `createFit`, `matchLight` |
| R8 | RT | Fit residual < 0.020 → accept; 0.020–0.050 → accept with warning | Real | `base.html` |
| R9 | RT | Residual > 0.050 → escalate: ask T2 to re-label, then the human | Escalation is logged, T2 call is **not made** | `base.html` |
| R10 | RT | Person photo → cutout + normals (T1) → card. Prop photo → image-to-3D (cloud) or Blender asset → mesh | Routing real; cutout is a colour key, meshes are primitives | `scene.js` |
| R11 | RT | Card viewed more than 35° off its axis → flag; upgrade to mesh or limit orbit | Real | `scene.js` |
| R12 | RT | Outfit change → instruction-edit image model with identity reference (T2, cloud), then face-similarity check (T1) | **Stand-in**: colour + garment words, drawn procedurally | `scene.js` |
| R13 | RT | Look match < 85% after refinement → escalate to hero pass or to the human. Also the hero-pass rule | Match real; hero pass is a **stand-in** | `scene.js` |
| R14 | RT | Plate light contradicts the key → de-light the plate, or move the key to agree | De-light is a crude photo ÷ blurred-light; the contradiction check is **not** automatic | `scene.js` |

New rules take the next number (R15…). Add a row here and a line in the UI's rule table.

## Log row format (today)
Each row is `{tier, rule, text, conf?, sample?}`. Tab 2 adds a fourth argument `sample` for stand-ins. To train a router this must grow into the record below.

## Proposed training record (Phase 7)
One row per decision, written to SQLite (`decisions` table). The model input is `state_text` + `options`; the label is the human-confirmed `chosen`.

```json
{
  "id": "uuid",
  "ts": "2026-09-30T10:11:12Z",
  "session": "uuid",
  "rule": "R8",
  "tier": "RT",
  "state_text": "task=fit_review residual=0.031 iters=17 best_knob=fill match_pct=null shots=1 faces=1 conf_label=0.82",
  "options": ["accept", "iterate", "escalate_t2", "escalate_t3"],
  "chosen": "accept",
  "chosen_by": "rule",
  "human_verdict": "agree | override:iterate | null",
  "outcome": { "residual_after": 0.022, "time_ms": 4100, "cost_usd": 0.0 }
}
```
`human_verdict` is what makes the log trainable. Do not train on rows where it is null. Target at least 500 rows with verdicts before a first model (PRD metric).

## First three decisions to learn
1. **Tool routing.** Options: `analytic_fit`, `blender_compare`, `t2_relabel`, `human`. State: shot count, face count, face-size ratio, residual, lens known/unknown, light colour cast.
2. **Accept or iterate the fit.** Options: `accept`, `iterate`, `escalate`. State: residual, residual trend over the last iterations, match percentage, face visible fraction.
3. **Next knob to turn.** Options: `az`, `el`, `int`, `soft`, `kel`, `fill`, `amb`. State: which knobs moved last, per-knob gain of the last step, current step sizes. The descent currently tries every knob and keeps the best; a learned chooser only saves renders, so this is the lowest-value slot. Do it last.

## How to swap in Laya or Jev
1. Put the decision behind one function: `decide(ruleId, stateText, options) → {choice, probs, source}`. The existing rule code becomes the `source:"rule"` implementation.
2. Add `source:"laya"` (local, MLX) and `source:"jev"` (HTTP). Both return probabilities over `options`.
3. **Shadow mode first.** Call the model on every decision, log its answer next to the rule's, act on the rule's. Compare agreement on the human-verdict rows.
4. Promote a rule to model control only if the model's agreement with human verdicts beats the rule's on a held-out split, and keep the rule as a fallback when the model's top probability is below a threshold.
5. Keep the log visible in the UI. The owner's requirement is that every decision shows tier, rule and whether it was a rule, model or human.

## Caveats
- Vendor-reported numbers (Laya latency, OpenDecider-style benchmark) come from the vendors. Re-measure on your own decisions before relying on them.
- Jev is a hosted API: your decision state text leaves the machine. Keep client names out of `state_text`.
- A decision model is only as good as the state text. Design the fields first, in plain `key=value` form, and keep them stable across versions.
