# V66 Worklot 003 — Albino Ravager reference audit

## Scope and decision

- Profile: `enemy-065-albino-ravager`
- Queue identity: **Albino Ravager** / `Ravager` / `Albino` / `xenomorph` / `assault` / `systemic-variant` / `biped` / `batch-004` / ordinal `64`
- Classification: `PROJECT_ADAPTATION`
- Canon fidelity claim: `canonExact=false`; no official, canon-exact or 1:1 Albino Ravager claim is allowed.
- Reference fragment: `docs/references/V66_WORKLOT_003_ALBINO_RAVAGER_REFERENCE.json`
- Fragment SHA-256: `5f4cdd9f35d671d0495738b4ba43c2ce97a2a400e4339f01dacf05efb29bea7f`
- Merge target: `docs/references/V66_ENEMY_BATCH_REFERENCES.json`

The reviewed V66 `enemy-013-ravager` identity lock is the positive anatomy authority. The albino modifier is limited to newly authored pigment and material response; it does not authorize recoloring the existing sheets, copying the locally retained bestiary study pixels, changing anatomy or claiming that an official Albino Ravager exists.

## Authority chain

1. `enemy-013-ravager` reviewed base identity lock — canonical compact-entry SHA-256 `5989d8d48c3cac7cf8dfb4a9aa55e7bb8051e853dd5243a4182d013ab5ee5212` — controls the tall bipedal silhouette, backward crest, integral crescent blade-arms, two digitigrade legs and full tail.
2. The project action sheet, normalized project sheet, local bestiary study image and four V66 base boards are immutable hashed predecessor evidence. They are guidance only and cannot be copied or automatically recolored.
3. The [Tantalus Frontier project repository](https://github.com/darknigthmare/aliens-tantalus-frontier) is recorded as the primary project source. No new external third-party page is promoted as an anatomy authority in this pass.

No reviewed primary or licensed source establishes an Albino Ravager. The honest treatment is an original Tantalus Frontier pigment/material adaptation derived from the already reviewed base identity lock.

## Locked anatomy and material

- Tall, heavily armored eyeless biped with a raised backward-curved cranial crest and rearward lateral head spines.
- Exactly two long main arms terminating in enormous anatomical crescent blades, two powerful digitigrade legs and one continuous segmented tail.
- The crescent blades are integral forearm structures, never swords, axes or equipment held in ordinary hands.
- Warm bone-ivory, pearl gray and pale mineral-blue chitin with cool gray recesses, restrained translucent blush at thin membranes, dark mouth cavity and pale horn blade material.
- Never flat white, luminous, crystalline, icy or produced by an automatic color filter.
- No Queen secondary arms, Praetorian fan crown, quadrupedal Crusher build, armor, clothing, firearm or altered limb count.
- Strict right-facing gameplay profile with a pelvis/proximal-leg root projected to the supporting-foot floor.

## Exact queue contract

The queue uses the `biped` animation family and requires exactly **four** boards; there is no special fifth clip.

| Clip | Source path | Prompt SHA-256 | FPS | Loop |
|---|---|---|---:|:---:|
| `idle` | `assets/openai/sprites/frames/v66/batch-004/enemy-065-albino-ravager/idle.png` | `a948d30558cae318cfffd583ab876e3c86f123066a062a7567aad2bbe4e03315` | 6 | yes |
| `move` | `assets/openai/sprites/frames/v66/batch-004/enemy-065-albino-ravager/move.png` | `50bca4bad41a7442e18a94777521c40faad9ab84b0881645bfbe2b794383d4d1` | 12 | yes |
| `attack` | `assets/openai/sprites/frames/v66/batch-004/enemy-065-albino-ravager/attack.png` | `1f5395fd2b937545d42d66c06db0686e9166b4ec93539cf1fd121971c9fb700c` | 12 | no |
| `death` | `assets/openai/sprites/frames/v66/batch-004/enemy-065-albino-ravager/death.png` | `ccc6fc0d337a998372fb837a59c9a845adc27bcf60d043bab9cec9e275d9404b` | 10 | no |

These hashes are exact snapshots of the blocked queue prompts. Generation must rebuild prompts after the reviewed reference lock is merged.

## Local predecessor evidence

- Project action sheet: `a211ace409c3befa626b7ed0a14f99b2e26ca90cb44203da7ebd79c983ba753b` (`1254x1254`).
- Normalized project sheet: `f7c58823ce59b27aa2ebe779d380966f40fb48fa9e1dfe165fd38ad306999070` (`1024x1024`).
- V66 base boards (`idle`, `move`, `attack`, `death`): all four are `1774x887`; exact byte sizes and hashes are embedded in the fragment.
- Local bestiary study image: `a5cc8adf3350f99be52fad24ac5f8b039c0cfc4ad4858f19b8f82af169f01c53` (`140x168`).
- Base metadata: `0def8457ce717fa84322404ad92c60f01d43e018edf8844d1d7c0bbb869fac17`.
- Historical base reference fragment: `41694b019e64d5a8cf403b53f440d06eda462ad8d5598e1c3e7fecd118eadba5`.

The base metadata reports validated normalization, but `acceptanceStatus` remains `pending-visual-review`, `scaleCalibrationReview` is `null`, `scaleCalibrationEvidence` is empty and the physical-anchor report is `pending`.

## Scale and anchor limitation

The base metadata declares `sourceScaleByClip={idle:1,move:1,attack:1,death:1}`, but supplies no completed calibration review or evidence. This fragment therefore **does not inherit or expose a top-level `sourceScaleByClip`**. A future Albino Ravager candidate must receive a new complete per-clip scale calibration and physical-anchor review before any scale certification. The pending anchor evidence is retained at SHA-256 `31426022398546429ea8ad7defdfbf642c4fd854b3bb64270df0a725acd121e3`.

## Verification performed

- Both fragment JSON documents parsed successfully.
- Every queue identity field, including `provenance`, `batchId` and `ordinal`, matched exactly.
- Four of four `id/sourcePath/promptSha256/fps/loop` contracts matched exactly.
- All ten declared `localPaths` existed.
- `assembleReferenceRegistry` was simulated in memory against the current global registry and accepted `enemy-065-albino-ravager` without overwrite or schema error.
- The simulation produced a 63-profile in-memory registry and performed no write.
- No queue, state, global reference registry, sprite, metadata or Git operation was performed.

## Production limits

This reference pass authorizes only a future generation candidate after the fragment is merged. It does not prove 32/32 cell compliance, visual fidelity, animation continuity, scale certification, runtime integration, acceptance or commercial readiness.
