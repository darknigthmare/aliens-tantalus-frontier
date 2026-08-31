# V66 Worklot 001 — Reef Spitter QA

Date: 2026-09-01
Profile: `enemy-028-reef-spitter`
Scope: four OpenAI ImageGen source boards only; no normalization, acceptance, STATE event, global registry update, runtime integration or manifest change.

## Outcome

**COMPLETE TECHNICAL CANDIDATE SET — 3/4 strict extraction passes, 1/4 has proven safe ownership.**

- Strict-ready technical candidates: `idle`, `move`, `attack-r3`.
- Safe-reassignment technical candidate: `death-r3`.
- Non-selected active candidates: none; every superseded r1/r2 remains archived.
- All four requested clips have a real OpenAI-generated 1774×887, 2:1, 4×2, eight-pose board.
- The profile is eligible for candidate normalization only with recorded safe fragment reassignment; it is not artistically accepted or runtime-integrated.

This is a project-original marine ecophenotype derived from the Spitter/Ranger combat function. It is explicitly **not** an exact official caste and no 1:1 canon claim is made.

## Authority lock

| Authority | SHA-256 | Use |
|---|---|---|
| `docs/references/V56_ENEMY_REFERENCE_MATRIX.md`, §29 | `ed617773d27dd7459bd2293023c151266d7ea131525f4e420a9a3d41170645f9` | Original Reef Spitter anatomy, palette and forbidden motifs |
| `src/enemy-visual-overrides-v56.js`, Reef Spitter | `df69edcb18ba8fd19e91b0a52f64c1bf5bd6b5285353b4913c0f1197523735e0` | PROJECT_ADAPTATION, spitter-medium family and runtime dimensions |

## Active-source technical audit

| Clip | Iteration | SHA-256 | Strict extraction | Safe reassignment | Border frames | 8 distinct | Status |
|---|---:|---|---|---|---|---|---|
| idle | r1 | `1da968475341c5ea46f21885eb6aa06dd6222e7fe70bfdfa878346da2854e742` | pass, 8 frames | not needed | none | yes | selected technical candidate |
| move | r2 | `97a211a87bef9602dfdd7174733e0ce3b29cea6447ca9b13edef47432c510d6f` | pass, 8 frames | not needed | none | yes | selected technical candidate |
| attack | r2 | `92c5f438470a5573c2ed7b78692289a891a7bedb41fa5f5209089b3924feb426` | blocked | blocked | 4, 5 | yes | non-selected |
| death | r2 | `9fb99b1b735de3d285228f4cc1cece4f06145a0362e077b9cd4c125323830c56` | blocked | proven short-spill pass | 2, 3 | yes | non-selected under the strict gate |

All active sources are RGB, fully opaque, use an edge-pure `#FF00FF` matte, have exact 2:1 dimensions, and contain eight distinct nominal-cell hashes. Technical audit never implies artistic acceptance.

## Rejected sources retained

| Clip | Iteration | SHA-256 | Reason | Preserved path |
|---|---:|---|---|---|
| move | r1 | `6d4fefde99c31cb957d377062ed3f753a93d1cbb5f72da44afda634b2ae235ed` | strict cell spill; safe ownership only | `assets/openai/sprites/frames/v66/batch-003/enemy-028-reef-spitter/rejected/move-r1-border-spill.png` |
| attack | r1 | `5685591c324c042fc918c0d18cae552f7769c55fb7ab2c67ddc486246fe403e1` | tail continuity crosses cells; strict and safe extraction blocked | `assets/openai/sprites/frames/v66/batch-003/enemy-028-reef-spitter/rejected/attack-r1-cross-cell.png` |
| death | r1 | `3994c062ae2e5ecbdc649827df7fb583b313c0c43ea227181356a6e793889c96` | several tails/limbs cross cells; strict and safe extraction blocked | `assets/openai/sprites/frames/v66/batch-003/enemy-028-reef-spitter/rejected/death-r1-cross-cell.png` |

The delegated pass stopped after one targeted r2 per non-conforming clip. The root remediation then preserved those non-selected r2 files and generated one bounded r3 for attack and death.

## Root remediation after the delegated gate

| Clip | Iteration | SHA-256 | Extraction | Status |
|---|---:|---|---|---|
| attack | r3 | `9d04e15f531976a29963e38bda30aa27b0bcb8a4f136a2c65e76c3c612f251b4` | strict pass, 8 distinct, no border contacts | selected candidate |
| death | r3 | `04e8247acb16750a7d246e5a95014b63030358aa39629748a9b705ffe4df3395` | strict blocked frames 2–3; safe ownership pass, 8 distinct | selected candidate requiring safe reassignment |

Attack r3 deliberately omits a drawn acid stream. The throat/jaw release remains readable in the animation, while the actual projectile stays a separate gameplay effect and can no longer cross a sprite-cell boundary. Death r3 uses a compact curled corpse; conservative color-mask clues still touch two nominal boundaries, but the unchanged ownership probe recovers eight poses without modifying source pixels.

## Visual and animation review

- Direction: the eight poses on each active board face right; no active pose turns toward camera.
- Identity: eyeless raised cranium, wet blue-black/blue-green shell, modest yellow throat gland, aquatic dorsal plates, two arms, two digitigrade legs and a swimming tail are readable.
- Idle: eight subtle throat/breathing states, no projectile.
- Move: eight grounded gait states with no obvious airborne leap; r2 removes every strict boundary contact.
- Attack: anticipation, gland inflation, mouth opening, short attached acid cue, recoil and recovery read chronologically. The short cue crosses the frame-4/frame-5 boundary by a few pixels; this invalidates strict extraction.
- Death: the collapse reaches a curled terminal corpse. A compact tail from pose 4 extends into the preceding nominal cell; safe ownership can recover eight poses, but the required strict path still fails.
- Background: no scene, floor, water, text, grid, logo, shadow or transparency was observed.
- Inter-clip scale/layout reserve: the requested 55-pixel gutter was not achieved. The minimum heuristic gutter is 4 px for idle and 21 px for move; median foreground widths are 358.5 px and 356 px respectively in approximately 443-pixel cells. These pass strict extraction but exceed the desired compact occupancy, so they remain candidates rather than approved production sources.
- Cross-sheet identity reserve: local source-image attachment to ImageGen was blocked by the Windows sandbox, and the attempted explicit inline export was refused by the permission controller. No workaround was used. Later clips were therefore generated independently from the same textual V56 design lock; minor dorsal-plate and tail-coil drift remains possible.

## Provenance

The complete prompt text, prompt-document SHA, OpenAI provider label, local execution identifier, source path, source SHA, dimensions, audit summary and rejection/selection state for every generation are stored in `docs/references/V66_WORKLOT_001_REEF_SPITTER_REFERENCE.json`.

For calls where the built-in generator returned only an `image_url`, the record sets `providerGenerationIdReturned: false`; its `generationId` is explicitly identified as a local execution UUID rather than a fabricated provider identifier.

## Release decision

Normalize this profile only as a candidate with `--safe-reassign-cell-fragments`, plus the proven magenta-matte cleanup flags. `idle`, `move`, `attack` and `death` still require normalized animation, anatomy, direction, physical-root and inter-clip scale review before any explicit acceptance. No runtime integration is authorized by this report.
