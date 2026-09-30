# 05 · Scene graph schema (v1)

The scene graph is the source of truth. The viewer renders it; Claude Code can write or edit it; `applyJSON` validates and clamps it. Produced by `Live.api.toJSON()`; consumed by `Live.api.applyJSON(text)`.

## Example (defaults)
```json
{
  "version": 1,
  "camera": { "az": 16, "el": 11, "dist": 6.4, "lens": 35 },
  "light": { "x": -3, "y": 3, "z": 2.2, "intensity": 1.25, "kelvin": 5600, "softness": 0.4, "fillStops": 1.5, "practical": 1, "ambient": 0.14 },
  "plate": { "relit": true },
  "cardsFaceCamera": true,
  "elements": [
    { "id": "mara", "name": "Mara", "kind": "cast", "hero": true, "mode": "card", "asset": "cast:mara",
      "skin": "#dba185", "hair": "#1b1512", "hairStyle": "long",
      "outfit": { "type": "coat", "color": "#2b2f3a", "accent": "#c9a26b", "pants": "#1d1f26" },
      "x": -0.7, "y": 0, "z": 0.4, "rot": 0, "scale": 1 },
    { "id": "chair", "name": "Armchair", "kind": "prop", "prop": "armchair", "color": "#7a4e3a",
      "x": 2.5, "y": 0, "z": -1.3, "rot": -35, "scale": 1 }
  ]
}
```

## Fields
| path | type | meaning | clamp on apply |
|---|---|---|---|
| `version` | int | schema version (currently 1, not enforced yet) | — |
| `camera.az` | deg | orbit around the target, + = camera moves to screen right | −58…58 |
| `camera.el` | deg | camera height angle | 1…50 |
| `camera.dist` | m | distance to target (0, 1.1, 0.2) | 3…9 |
| `camera.lens` | mm | focal length, vertical FOV = 2·atan(12/lens) | 24…135 |
| `light.x/y/z` | m | **world** position of the key spot (aimed at the hero's head) | x ±3.8, y 0.5…3.1, z −2.9…4.4 |
| `light.intensity` | × | key intensity | 0.2…2.5 |
| `light.kelvin` | K | key colour temperature | 2800…7000 |
| `light.softness` | 0…1 | penumbra + shadow blur | 0…1 |
| `light.fillStops` | stops | fill = key / 2^stops, opposite the key in view space | 0…3.5 |
| `light.practical` | 0/1 | lamp prop's point light | 0/1 |
| `light.ambient` | 0…0.6 | hemisphere ambient | 0…0.6 |
| `plate.relit` | bool | true: plate reacts to lights; false: as shot + shadow catcher | — |
| `cardsFaceCamera` | bool | billboard cards (false exposes rule R11) | — (default true if absent) |
| `elements[]` | array, ≥ 1 | see below; at least one `cast` element is promoted to `hero` if none is flagged | — |

### Element (common)
`id` string (unique), `name` string, `kind` `"cast" | "prop"`, `x` (−3.7…3.7 m), `y` (0…2.5 m), `z` (−2.8…4.3 m), `rot` deg, `scale` (0.5…1.8).

### Element `kind: "cast"`
`hero` bool (the face the match metric measures and the light aims at), `mode` `"card" | "mesh"`, `asset` string (informational: `cast:<id>` or `upload:<filename>`; uploaded pixels are **not** serialised), `skin`, `hair` (hex), `hairStyle` `"long" | "short" | "bun"`, `outfit` `{ type: coat|dress|hoodie|suit|jacket, color, accent, pants }` (garment words such as `trench` are mapped to a type).

### Element `kind: "prop"`
`prop` `"armchair" | "table" | "lamp" | "crate"` (unknown → `crate`), `color` hex.

## Validation behaviour (today)
Invalid JSON or a missing/empty `elements` array is rejected with a message and the scene is unchanged. Numbers are coerced and clamped. There is no JSON Schema file yet.

## To do (Phase 1)
Add a formal JSON Schema, enforce `version`, unique ids, refs to real assets (`asset` → file/hash), per-element `material`, `lightRig[]` (more than one light), `plate` asset reference(s), units and handedness section, migration function v1 → v2, and glTF/USD export.
