// What the held-out Blender set showed about the light fit (docs/validation.md §3), as the rules the Breakdown
// follows: which fitted values are written, and whether a confidence is shown (D-LL-036, D-LL-037).
// tests/core/light-accuracy.test.ts re-measures the set on every run and fails if these disagree with it.
// A claim about the Blender set only, never about real footage (standing rule 3). No DOM, no Node (AD-LL-009).

/** Tolerances a value must meet on the held-out set, as a median, to be written (v0.2's own, softness 0.25). */
export const TOLERANCE = { kelvin: 500, fill: 0.6, softness: 0.25 };

/**
 * Direction is always written, as an estimate; the others only if they met their tolerance on the held-out set.
 * Measured 2026-10-01: kelvin 445 K (written); fill 1.10 stops and softness 0.31 (not written).
 */
export const WRITE = { direction: true, kelvin: true, fill: false, hardness: false };

/**
 * A confidence is shown only if it ranks with the error on the held-out set: Spearman(score, −error) ≥ 0.5.
 * Measured 2026-10-01: 0.57 (dev set 0.51). It is a rank, not a probability.
 */
export const CONFIDENCE_SHOWN = true;
