# Neomorph 037 — post-generation QA

Profile: `enemy-037-neomorph`
Batch: `batch-003`
Reviewed: `2026-09-01`
Scope: QA on the four unchanged active masters and the existing pending-review atlas. No ImageGen, regeneration, normalization, registry merge, acceptance or runtime integration was performed.

## Result

The 32 physical roots and twelve rigid skull measurements are now reviewed as standalone fragments. The main measurable inter-clip defect is the under-scaled `attack`; `death` is modestly oversized. The existing strict magenta-spill option removes every strict residual in memory with its current fixed thresholds, but the current atlas was deliberately not rewritten.

| Clip | Median solid-dome chord | Candidate `sourceScaleByClip` | Physical-contact review |
| --- | ---: | ---: | --- |
| `idle` | 65.521 px | `1.000000` | 8/8 pelvis projections land on padded foot support |
| `move` | 62.394 px | `1.050117` | 8/8 visible load-bearing foot contacts |
| `attack` | 51.264 px | `1.278109` | 8/8 grounded supports; frame 2 retains proven negative-x spill |
| `death` | 70.328 px | `0.931649` | 8/8 support planes reviewed from feet through terminal corpse |

The scale invariant is the same in three readable poses per clip: posterior shoulder of the **solid smooth cranial dome** to the anterior hard-dome tip. Dorsal rods, jaw, neck, tail, action reach and global bounding box are excluded. Endpoint uncertainty is ±5 source pixels. Evidence: `docs/references/v66-worklot-001-neomorph-qa/cranial-chords.jpg`.

## Physical roots and contact planes

Every source cell was inspected at original 1774×887 resolution. The anatomical landmark is the pelvis/posterior hip articulation at the sacral tail root. Anchor x is its vertical projection; anchor y is the complete recovered `sourceBounds[3]`, including the full three-pixel extraction guard below the authored support.

- `idle` padded support y: `365,365,365,365,329,329,329,329`.
- `move` padded support y: `363,364,363,363,296,297,296,296`. All eight poses retain a visible carrying foot/feet; none uses the tail or hand reach as the floor.
- `attack` padded support y: `379,379,379,380,263,263,264,263`. Extended claws and negative spill never determine the root.
- `death` padded support y: `382,382,380,380,278,278,277,277`. Supports progress from feet to knee/hand/torso, then the corpse flank/limb plane. The authored transition into the collapsed poses remains visually abrupt; the root review does not certify animation smoothness.

Standalone merge-compatible fragment: `docs/references/V66_WORKLOT_001_NEOMORPH_ANCHOR_REVIEW.json`. Annotated boards are under `docs/references/v66-worklot-001-neomorph-qa/anchors-*.jpg`.

## Attack ownership

The current attack master SHA-256 was `c82fdb62669215451302e1e161c9ccbd43b7ea5b7585c271276b5296d5cc45fe` both before and after the read-only probe.

- Default extraction remains blocked.
- The unchanged 90% ownership / 15% excursion probe extracts 8 distinct poses, writes no source and accepts nothing.
- Only frame 2 transfers pixels: owner cell `2`, from cell `1`, `2` pixels of an `84`-pixel component, owner share `0.976190`.
- Component global bounds: `[885,365,931,374]`; transferred RGBA SHA-256: `aaec2ea48b4105404fec9af070d73f39c07820b6832018eff5cb83c881af68e4`.

Evidence: `docs/references/v66-worklot-001-neomorph-qa/attack-safe-reassignment.jpg`. Safe reassignment remains an explicit normalization requirement, not an artistic acceptance.

## Visible pink residuals

The fixed `v64-strict-post-resize-green-plus-eight-v1` mask was evaluated on the unchanged pending-review atlas SHA-256 `4a57feb12be969e23408854cc72219591b43d02821cbe3a1fa881afdfebc5cf1`.

| Clip | Strict pixels | Affected frames |
| --- | ---: | --- |
| `idle` | 0 | none |
| `move` | 52 | frame 2 |
| `attack` | 5 | frames 1–2 |
| `death` | 305 | all 8 frames |
| **Total** | **362** | 11/32 frames |

The visible clusters occur on edge/interior pale anatomy around neck, hands, abdominal seams and the folded tail/limbs of the corpse; they are not legitimate pink Neomorph material under the NECA identity lock. Applying the existing strict clamp in memory reduces `362` to `0` remaining pixels. No threshold was widened: alpha ≥16, red >160, blue >160, both red/blue more than 35 above green, then clamp to green+8.

Recommendation for the later authorised rebuild: use the explicit `--remove-magenta-spill` option together with the reviewed scale and anchors, and bind its per-frame proof to that newly generated atlas. Do not describe the present atlas as cleaned. Evidence: `docs/references/v66-worklot-001-neomorph-qa/strict-magenta-spill-overlay.png`.

## Files

- Scale fragment: `docs/references/V66_WORKLOT_001_NEOMORPH_SCALE_REVIEW.json`
- Physical-anchor fragment: `docs/references/V66_WORKLOT_001_NEOMORPH_ANCHOR_REVIEW.json`
- Machine-readable QA: `docs/references/V66_WORKLOT_001_NEOMORPH_POST_QA.json`
- Evidence directory: `docs/references/v66-worklot-001-neomorph-qa/`

Status remains `candidate-only`, `not merged`, `not accepted`, `not runtime-integrated`.
