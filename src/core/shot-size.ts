// Shot size from the face (R2, T0, D-LL-046). The face's height, hairline to chin, as a share of the active picture's
// height. Each name's typical framing gives that share (a face is about a fifth of a metre hairline to chin): an ECU
// frames the face or less (≥ 0.9), a CU about 0.35 m (0.54), an MCU to mid-chest, 0.7 m (0.27), an MS to the waist,
// 1 m (0.19), an MWS to mid-thigh, 1.35 m (0.14), a WS the whole body with room, 2 m (0.095), an EWS 4 m or more
// (≤ 0.05). Each boundary is the geometric mean of its neighbours, rounded. A definition, not a measurement.

export const SHOT_SIZES = [
  { label: 'ECU', min: 0.7 },
  { label: 'CU', min: 0.38 },
  { label: 'MCU', min: 0.23 },
  { label: 'MS', min: 0.16 },
  { label: 'MWS', min: 0.115 },
  { label: 'WS', min: 0.07 },
  { label: 'EWS', min: 0 },
] as const;

export type ShotSize = (typeof SHOT_SIZES)[number]['label'];

/** `faceShare`: the face box's height over the active picture's height, in (0, 1.5]. */
export function shotSize(faceShare: number): ShotSize {
  if (!(faceShare > 0 && faceShare <= 1.5)) throw new RangeError(`a face share of ${faceShare} is not between 0 and 1.5`);
  return SHOT_SIZES.find((s) => faceShare >= s.min)!.label;
}
