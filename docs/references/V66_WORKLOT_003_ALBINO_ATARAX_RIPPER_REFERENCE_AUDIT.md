# V66 worklot-003 reference audit — enemy-075-albino-atarax-ripper

## Verdict

- Local reference fragment: `docs/references/V66_WORKLOT_003_ALBINO_ATARAX_RIPPER_REFERENCE.json`.
- Phase: reference-only; reviewed locally; not merged into `V66_ENEMY_BATCH_REFERENCES.json`.
- Classification: original fan-made/project systemic adaptation of the project-original ATARAX Ripper; `canonExact=false`; no official, licensed or 1:1 model claim.
- External URL policy: `urls=[]` intentionally. `V56_ENEMY_REFERENCE_MATRIX.json` marks ATARAX Ripper `PROJECT_ORIGINAL` / `NO_EXTERNAL_MODEL`; no official or licensed ATARAX/Albino ATARAX target exists. Positive authority is therefore restricted to safe relative local paths with SHA-256 proofs.
- No ImageGen call, asset write, runtime acceptance, state/queue/reference-global mutation or Git action was performed.

## Exact queue contract

The snapshot was read from `docs/references/V66_ENEMY_BATCH_QUEUE.json` at SHA-256 `e98c379494f40f3d210243f867344dcd900e66a1e3c4c254cf2909affb817609`.

- Identity: `enemy-075-albino-atarax-ripper`, Albino ATARAX Ripper, archetype `ATARAX Ripper`, modifier `Albino`, biology `xenomorph`, caste `armored`, provenance `systemic-variant`, animation family `biped`, `batch-005`, ordinal `74`.
- Initial reference state: `pending-reference`, `reference=null`, `referenceLockSha256=null`, provider `OpenAI ImageGen`, `canonExact=false`.
- Source contract: right-facing; exact 4x2 source board; 8 frames per clip; target atlas 4x8 at 256x256 with guard 16; pivot `(128,240)`.
- Clips: `idle` 6 fps loop frames 0–7; `move` 12 fps loop frames 8–15; `attack` 12 fps non-loop frames 16–23; `death` 10 fps non-loop frames 24–31.

Fresh `SHA-256(JSON.stringify(prompt))` recomputation matched all four queue hashes:

- `idle`: `d6a201b52800a11c08a1c7221816228e2eb34d2a41e9c5f8fb73d47e8d8e407c`
- `move`: `9f50bce68c371752b010706e4b7534da4244fa7b7fd6a7a3f47e242a49d9292c`
- `attack`: `04e5118d02dc0256fb3f68b84adfb3a3caa4c720208a7df26b4e6e9d7b9a3787`
- `death`: `8a4c4fa828fb0f1ce61e22214ed5d8928bd813652d9b76fd2a2ac073822d0c53`

Raw UTF-8 prompt hashing is not the queue algorithm. The queue texts remain BLOCKED snapshots and must be rebuilt from the eventual merged lock before any generation.

## Authority and design decision

Base profile `enemy-023-atarax-ripper` is bound to reviewed lock SHA-256 `12cae9976d65c362d0b10978cb474229ba4f8a731bc93a030ce831a474718c9d`.

Visual inspection of both V56 sheets and all four active V66 boards confirmed the internal target: a heavy melee biped with a long eyeless skull, layered ivory cranial/dorsal armor, massive forearms, digitigrade hindlegs, gunmetal restraints/tendon cables, one tiny blue sensor and one long free tail. The systemic albino changes organic pigment/material only: warm pearl/parchment/ash tissue with rose-taupe recesses, brighter chalk-ivory armor, retained gunmetal hardware, burgundy scars and the single blue sensor. It is not a pure-white filter, Queen, Xenoborg or robot.

The source art is evidence, never a pixel donor. The inspected V66 boards retain magenta edge residue, subtle/near-duplicate timing and a weak attack read. The source audit records nominal-cell contacts in idle frames 2/3/6/7, move 3, attack 3 and death 2/3/6/7. New art must reproduce none of these defects.

Key local identity hashes:

- V56 raw 1254x1254: `1d4f18dd956f5d6f464cac84fe8f465d8ddc4763ddbd7465454f53a2ce499b6c`
- V56 normalized 1024x1024: `321b78c95da7374bd3cac8b2ae5d18fb26c146aaddae47b536132b16b8f261ae`
- V66 idle/move/attack/death 1774x887: `ce72dfd572f7cc0f6af150e293b3141c185f3370ff32ab8ac171e8d3bffc82e4`, `a65cbf185220e89eba507db1db21753bd44f25847cad2d358d798e5511f2fd2e`, `f4324058328ce38ceb9a220d13188c7fe8f10e63e47a873a648fe5324929e086`, `cf6ca1cfc67a1aa032bc453d64d7920ba1a4049ffea2f2bce7171842312e59a2`
- Base metadata: `b9af38c7e66169f2ed097d35d55fe1c1e45b5d36aaef3bd98cec6f1038f75402`

Every `localPaths` entry exists, remains relative to the repository and has an exact hash in the fragment's `localSourceHashes` map.

## Root and scale decisions

- Root: the base anchor registry entry is complete and reviewed for 32 exact predecessor poses, with a manually chosen ribcage landmark projected to planted/resting support, medium confidence and 14 px uncertainty. The method may guide 075, but none of the 023 coordinates transfers. All 32 new 075 poses require independent annotated root review.
- Scale: the base has historical final pack scale `0.399280576` and nominal all-one `sourceScaleByClip`, but `scaleCalibrationReview=null`, zero calibration evidence and no scale-registry entry. No numeric value transfers. All four 075 clips require a new measured, retained scale review based on stable body landmarks, never tail/plate/claw extrema.
- Consequently, anchor/scale merge scripts are not applicable at reference-only phase because no 075 source PNG, metadata, measured roots or scale review exists yet.

## Merge simulation and mutation boundary

The production assembler `scripts/merge-v66-reference-fragments.mjs#assembleReferenceRegistry` accepted the pair 075/076 entirely in memory against global reference SHA-256 `6a0cf9bdbac06c3ff1d1be7f27e5077cde60af530915dfbbe7092aca7832565f`:

- base profiles: 73
- incoming profiles: 2 (`enemy-075-albino-atarax-ripper`, `enemy-076-albino-ripper-queen`)
- simulated profiles: 75
- simulated canonical output SHA-256: `491d56ac1ce13fbe7ee8c510bb758cd9056c2fc4ce912e6b394c627a53ce860c`
- prompt content hashes verified: 9/9 across the pair
- local paths: all present and safe
- URLs: empty by documented project-original decision; HTTPS validation vacuously passes
- global file written: no

No reference registry, queue, state, anchor registry, scale registry, source asset or Git state was intentionally changed by this reference pass.
