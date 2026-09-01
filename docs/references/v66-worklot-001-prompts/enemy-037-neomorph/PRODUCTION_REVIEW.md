# Neomorph037 production handoff

Built-in ImageGen only:6real calls,4selected boards,2archived rejected predecessors. All sourcesRGB1774x887,exact2:1,4x2,8distinct poses each.

Reference fragment: docs/references/V66_WORKLOT_001_NEOMORPH_REFERENCE.json. Two licensed NECA Covenant photographs downloaded and inspected from https://necaonline.com/2017/05/massive-photo-gallery-alien-covenant-products-revealed/ ; not a pixel-exact film certification.

Active receipts in this directory: idle-r2.event.json, move.event.json, attack-r2.event.json, death.event.json. Merge reference and rebuild queue before importing them. Ignore idle.event.json and attack.event.json (candidateSelected:false).

Idle:default extraction8pass,no findings. Move/death:default8pass with nominal-matte border clues. Attack:defaultblocked;existing short-spill probe8pass. No normalization was written.

Remaining:physical roots; interclip skull/bone scale (attack appears smaller,death larger); move alternating contact/passing cycle; death crouch-to-lying transition. No scalar invented and no anatomy/continuity/runtime acceptance.

Rejected originals are preserved under source directory rejected/idle-r1.png and rejected/attack-r1.png. Current source directory assets/openai/sprites/frames/v66/batch-003/enemy-037-neomorph/. source-review.json contains machine-readable evidence and remaining blockers.

No sharedQUEUE/REFS/STATE/runtime/atlas/normalizer modified. The imagegen skill guided real bitmap generation, non-destructive persistence, exact saved prompts and honest candidate review.

## Post-calibration QA — 2026-09-01

The former blockers are now resolved technically. Twelve rigid cranial-chord measurements produced reviewed source factors `idle 1.0`, `move 1.050117`, `attack 1.278109`, `death 0.931649`. All 32 pelvis/root contacts were manually reviewed and merged into the batch-003 anchor registry. Attack frame 2 retains its complete two-pixel ownership transfer with pixel values preserved. Strict magenta cleanup reduces the calibrated atlas residue count from 162 to zero without widening thresholds.

Normalization and `--check` pass with 32 reviewed physical-root placements and no findings. The current atlas SHA-256 is `0f6491c0bd4160a9f48cd8280613e88b0cf58475df65fbfa0b1bd473bf4f2a50`. The rendered 32-pose contact sheet at `docs/references/v66-batch-003-atlas-review/enemy-037-neomorph.jpg` was inspected after calibration: identity and right-facing orientation remain coherent; attack scale now matches the idle/move body; death reads as a stagger, crouch and collapse, although its late transition remains deliberately abrupt. This is still a generated candidate: `pending-visual-review`, `runtimeIntegrated=false`, `canonExact=false`, with no automatic artistic acceptance.
