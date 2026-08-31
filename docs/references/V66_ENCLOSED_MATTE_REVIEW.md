# V66 — enclosed magenta matte correction

Date: 2026-08-31. Scope: batch-001, five profiles / twenty original RGB sheets / 160 authored poses.

## Explicit processing contract

The exterior V65 border-connected key is unchanged. Interior removal is disabled by default. Both flags below were explicitly enabled for the final batch:

- `--remove-enclosed-magenta-matte`: strict interior color key. R and B >=190, G <=60, min(R,B)-G >=150, abs(R-B) <=32. The color must also be within 24 levels per RGB channel of the median high-chroma proven exterior matte. The threshold accommodates the actual source mattes (for example Ovomorph opening is approximately RGB 223/10/215), not an assumed pure 255/0/255.
- `--remove-enclosed-magenta-aa-fringe`: separate opt-in, requires the first flag. At most two eight-neighbour expansion steps in SOURCE pixels from the proven strict interior core. Candidate pixels require min(R,B)>=35, min(R,B)-G>=20 and abs(R-B)<=32. No global flood fill, hole filling, recoloring or inpainting.

Native-alpha sources bypass both keys. Full-sheet reference masks are shared by per-cell and global extraction so recorded source proofs describe the exact removed pixels. Each source records separate core/fringe counts and mask hashes, removed source coordinate/RGBA hashes, its original RGBA hash, thresholds, reference color and both options. The combined metadata records a canonical source-proof hash. Check mode recomputes those proofs from the unmodified sources.

## Final source-pixel counts

| Profile | Strict core | Bounded AA | Total |
| --- | ---: | ---: | ---: |
| enemy-001-ovomorph | 0 | 0 | 0 |
| enemy-003-chestburster | 310 | 103 | 413 |
| enemy-004-drone-big-chap | 9487 | 5451 | 14938 |
| enemy-005-warrior | 9495 | 5160 | 14655 |
| enemy-006-runner | 9594 | 4848 | 14442 |

Every original source PNG hash stayed unchanged. The technical review asserts exact RGBA equality outside the removed source masks. Source crop bounds, rendered bounds, physical anchors and common per-profile pack-scales are unchanged. Ovomorph's pink inner shell receives zero interior removals.

## Evidence and inspection

- `docs/references/v66-enclosed-matte-review/`: exterior-only versus strict-core key, largest affected pose per clip, source proofs in `review.json`.
- `docs/references/v66-enclosed-matte-aa-review/`: strict-core key versus strict-core plus bounded AA, largest affected pose per clip, separate source proofs in `review.json`.
- `docs/references/v66-atlas-review/`: regenerated full 32-pose contact sheets for final root review.

The first core-only pass removed the solid fuchsia holes but left a thin violet fringe; it was not treated as accepted. The separately authorized AA pass removes that visible fringe in the inspected max-fringe Drone, Chestburster, Warrior and Runner comparisons. These technical sample inspections do not replace the root's final complete contact review and do not certify reference fidelity 1:1.

The comparison script intentionally emits `visualReviewStatus: pending-human-or-agent-inspection`; running a script cannot grant visual acceptance. Its difference column contains changed bitmap pixels only, not invented animation or redrawn art.

## Validation performed

- `py tests/test_enemy_batch_normalizer_v66.py`: 20 tests passed, including closed magenta hole, warm pink and blue adjacent to a core, darker/non-adjacent purple, two-source-pixel expansion limit, native alpha, exact proof positions/colors, physical anchoring, spill recovery and canonical LF JSON output.
- `py scripts/process-v66-enemy-batch.py --batch batch-001 --safe-reassign-cell-fragments --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe`: five final atlases plus clips/previews/metadata produced.
- `py scripts/process-v66-enemy-batch.py --batch batch-001 --check --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe`: passed, 160 poses, zero grid findings, zero automatic acceptances.
- `py scripts/render-v66-atlas-review.py`: five final contacts rebuilt.
- Metadata bytes inspected: zero CR bytes in all five JSON files. `json_write` forces LF to preserve hash identity across Windows/Linux.

## Final atlas SHA-256 and unchanged pack-scale

- enemy-001-ovomorph: scale `0.491686729`, SHA-256 `6a128018e56629d2777ba97c71ab1a1ef83a69bf6d6151928b89e6021d08f1e4`.
- enemy-003-chestburster: scale `0.328014184`, SHA-256 `46f9ed429d28399ae94125a80aac8476a4784a4880849ffd4e820a473be7b259`.
- enemy-004-drone-big-chap: scale `0.411111111`, SHA-256 `fcbe7d2625a8878afc5d91fc34636d27f8ac6f4f40ed34bebf052a5883ccd9fb`.
- enemy-005-warrior: scale `0.445783133`, SHA-256 `ec93792a895ca987d4196e75d88953278dd9fe6f03992e657077736bae000e29`.
- enemy-006-runner: scale `0.395580898`, SHA-256 `c68f8b0b8605cc3db8c4b00628781e4d12d1da39c20b3e62db869f93d9485eb3`.
