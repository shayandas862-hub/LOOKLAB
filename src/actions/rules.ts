// The routing rule table (D-LL-002). R1–R14 come from v0.2
// (reference/v0.2/docs/06-DECISION-LAYER.md) with their numbers unchanged; new rules continue from R15.
import type { Tier } from '../contracts/index.ts';

export interface Rule {
  id: string;
  tier: Tier | 'RT';
  text: string;
}

export const RULES: Rule[] = [
  { id: 'R1', tier: 'T0', text: 'Scene detection → shots, cuts, keyframes, contact sheet.' },
  { id: 'R2', tier: 'T0', text: 'Measure the frame: face-size ratio → shot scale and lens; luminance zones; lit:shadow ratio.' },
  { id: 'R3', tier: 'RT', text: 'One shot, one face → lighting goes to the analytic fit (T0); the language model is used for words only.' },
  { id: 'R4', tier: 'T0', text: 'First guess from skin statistics: L/R ratio → azimuth, top/bottom → elevation, fill from log2(p90/p10).' },
  { id: 'R5', tier: 'RT', text: 'T2 confidence below the review threshold → queue the value for the human (T3); above → accept with spot-check.' },
  { id: 'R6', tier: 'T0', text: 'Coarse sweep over azimuth × elevation, keep the best.' },
  { id: 'R7', tier: 'T0', text: 'Greedy coordinate descent over az, el, intensity, softness, kelvin, fill; halve steps when nothing improves.' },
  { id: 'R8', tier: 'RT', text: 'Fit residual < 0.020 → accept; 0.020–0.050 → accept with a warning.' },
  { id: 'R9', tier: 'RT', text: 'Residual > 0.050 → escalate: ask T2 to re-label, then the human.' },
  { id: 'R10', tier: 'RT', text: 'Person photo → cutout + normals (T1) → card. Prop photo → image-to-3D (cloud) or Blender asset → mesh.' },
  { id: 'R11', tier: 'RT', text: 'Card viewed more than 35° off its axis → flag; upgrade to a mesh or limit the orbit.' },
  { id: 'R12', tier: 'RT', text: 'Outfit change → instruction-edit model with an identity reference (T2, cloud), then a face-similarity check (T1).' },
  { id: 'R13', tier: 'RT', text: 'Look match < 85% after refinement → escalate to the hero pass or to the human.' },
  { id: 'R14', tier: 'RT', text: 'Plate light contradicts the key → de-light the plate, or move the key to agree.' },
];

export const RULE_IDS = new Set(RULES.map((r) => r.id));

/** R5's review threshold: an AI value with a confidence under this is queued for a person (P4, D-LL-042). */
export const REVIEW_BELOW = 60;
