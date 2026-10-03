// Light colour in mireds, and the kit setting or gel that gets it (P4.5, P-LL-001 §4.1). A mired is 1,000,000 / K;
// colour shifts and gels add in mireds, not kelvin. Every gel value comes from the kit (AD-LL-014), cited there; this
// file holds arithmetic only. DOM-free and Node-free (AD-LL-009).

export const mired = (k: number) => 1_000_000 / k;
export const kelvinOf = (m: number) => 1_000_000 / m;

/** The light fit's convention (A1): the reference's camera is taken as balanced at 5600 K. */
export const REFERENCE_BALANCE_K = 5600;

export interface Gel {
  id: string;
  /** Positive is warmer (CTO-like), negative cooler (CTB-like). From the kit's gel book (AD-LL-014). */
  shift_mired: number;
  transmission_pct: number | null;
  sheets: number;
}

export interface Fixture {
  min_k: number;
  max_k: number;
  step_k: number;
}

export interface SourceSolution {
  fixture_k: number;
  /** Gel ids, in id order; a gel used twice appears twice. */
  gels: string[];
  /** Target minus what the fixture and gels give, in mired: positive means the source still needs to be warmer. */
  residual_mired: number;
  kelvin_got: number;
}

/**
 * Where each source must sit against the camera's balance (P-LL-001 §4.1 steps 1–3). Apparent shift Δ = M(seen) −
 * M(5600); the white-balance source w is the one with the smaller |Δ| (ties: the fill) unless given; target
 * M_i = M(camera) + λ (Δ_i − Δ_w).
 */
export function targets(o: { key_k: number; fill_k: number; lambda: number; camera_wb_k: number; wb_source?: 'key' | 'fill' }) {
  const ref = mired(REFERENCE_BALANCE_K);
  const dKey = mired(o.key_k) - ref, dFill = mired(o.fill_k) - ref;
  const wb_source = o.wb_source ?? (Math.abs(dKey) < Math.abs(dFill) ? 'key' : 'fill');
  const dW = wb_source === 'key' ? dKey : dFill;
  const at = (d: number) => {
    const m = mired(o.camera_wb_k) + o.lambda * (d - dW);
    return { mired: m, kelvin: kelvinOf(m) };
  };
  return { wb_source, key: at(dKey), fill: at(dFill) };
}

const EPS = 1e-9;

/** Every stack of up to `max` layers, each gel used no more than its sheets, as index lists in id order. */
function stacks(gels: Gel[], max: number): number[][] {
  const out: number[][] = [[]];
  const walk = (start: number, stack: number[]) => {
    if (stack.length === max) return;
    for (let g = start; g < gels.length; g++) {
      if (stack.filter((x) => x === g).length >= gels[g].sheets) continue;
      const next = [...stack, g];
      out.push(next);
      walk(g, next);
    }
  };
  walk(0, []);
  return out;
}

/** The fixture setting on its step grid nearest (in mired) to `want`, inside its range. */
function nearestSetting(want: number, f: Fixture): number {
  const clampK = (k: number) => Math.min(f.max_k, Math.max(f.min_k, k));
  const k = clampK(kelvinOf(Math.min(mired(f.min_k), Math.max(mired(f.max_k), want))));
  const lo = clampK(Math.floor(k / f.step_k) * f.step_k), hi = clampK(Math.ceil(k / f.step_k) * f.step_k);
  return Math.abs(mired(lo) - want) <= Math.abs(mired(hi) - want) ? lo : hi;
}

/**
 * One source (P-LL-001 §4.1 step 5). In the fixture's range: the setting nearest the target on its step, no gel.
 * Otherwise every stack of the kit's gels up to `maxLayers` (sheets permitting), the fixture set to the target less
 * the stack; chosen by the smallest |residual|, then the fewest layers, then the most light through (unknown
 * transmission counts as none), then gel id order. Deterministic.
 */
export function solveSource(target: number, fixture: Fixture, gels: Gel[], maxLayers = 3): SourceSolution {
  const sorted = [...gels].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const inRange = target >= mired(fixture.max_k) - EPS && target <= mired(fixture.min_k) + EPS;
  const candidates = inRange ? [[]] : stacks(sorted, maxLayers);
  let best: { s: SourceSolution; layers: number; light: number; ids: string } | null = null;
  for (const st of candidates) {
    const shift = st.reduce((s, g) => s + sorted[g].shift_mired, 0);
    const fixture_k = nearestSetting(target - shift, fixture);
    const residual_mired = target - (mired(fixture_k) + shift);
    const light = st.reduce((t, g) => t * ((sorted[g].transmission_pct ?? 0) / 100), 1);
    const ids = st.map((g) => sorted[g].id);
    const c = { s: { fixture_k, gels: ids, residual_mired, kelvin_got: kelvinOf(target - residual_mired) }, layers: st.length, light, ids: ids.join(' ') };
    const better = !best
      || Math.abs(residual_mired) < Math.abs(best.s.residual_mired) - EPS
      || (Math.abs(Math.abs(residual_mired) - Math.abs(best.s.residual_mired)) <= EPS
        && (c.layers < best.layers || (c.layers === best.layers && (c.light > best.light + EPS || (Math.abs(c.light - best.light) <= EPS && c.ids < best.ids)))));
    if (better) best = c;
  }
  return best!.s;
}

/**
 * A gap (P-LL-001 §4.1 step 6): the residual is more than half the kit's finest gel (with no gels, more than the
 * fixture's own rounding). The text says how many mired are missing and which way, never a product.
 */
export function gapOf(residual: number, gels: Gel[], rounding_mired = 0): { gap: boolean; text: string } {
  const finest = gels.length ? Math.min(...gels.map((g) => Math.abs(g.shift_mired))) : 0;
  const limit = gels.length ? finest / 2 : rounding_mired;
  if (Math.abs(residual) <= limit + EPS) return { gap: false, text: '' };
  return { gap: true, text: `needs ${Math.abs(residual).toFixed(1)} mired ${residual > 0 ? 'warmer' : 'cooler'} than the kit reaches` };
}

/**
 * The camera's white balance (P-LL-001 §4.1 step 4): every setting the camera offers, each source solved (the key
 * first; the fill gets the sheets the key left); chosen by the smallest largest |residual|, then the fewest layers,
 * then the most light through on the key, then the setting nearest 5600 K.
 */
export function chooseBalance(o: {
  settings_k: number[]; key_k: number; fill_k: number; lambda: number; wb_source?: 'key' | 'fill';
  fixtures: { key: Fixture; fill: Fixture }; gels: Gel[];
}) {
  let best: { camera_wb_k: number; key: SourceSolution; fill: SourceSolution; wb_source: 'key' | 'fill'; worst: number; layers: number; light: number } | null = null;
  for (const wb of o.settings_k) {
    const t = targets({ key_k: o.key_k, fill_k: o.fill_k, lambda: o.lambda, camera_wb_k: wb, wb_source: o.wb_source });
    const key = solveSource(t.key.mired, o.fixtures.key, o.gels);
    const left = o.gels.map((g) => ({ ...g, sheets: g.sheets - key.gels.filter((id) => id === g.id).length }));
    const fill = solveSource(t.fill.mired, o.fixtures.fill, left);
    const worst = Math.max(Math.abs(key.residual_mired), Math.abs(fill.residual_mired));
    const layers = key.gels.length + fill.gels.length;
    const light = key.gels.reduce((x, id) => x * ((o.gels.find((g) => g.id === id)!.transmission_pct ?? 0) / 100), 1);
    const c = { camera_wb_k: wb, key, fill, wb_source: t.wb_source as 'key' | 'fill', worst, layers, light };
    const better = !best
      || worst < best.worst - EPS
      || (Math.abs(worst - best.worst) <= EPS && (layers < best.layers
        || (layers === best.layers && (light > best.light + EPS
          || (Math.abs(light - best.light) <= EPS && Math.abs(wb - REFERENCE_BALANCE_K) < Math.abs(best.camera_wb_k - REFERENCE_BALANCE_K))))));
    if (better) best = c;
  }
  if (!best) throw new RangeError('no white-balance setting to choose from');
  const { worst: _w, layers: _l, light: _t, ...out } = best;
  return out;
}
