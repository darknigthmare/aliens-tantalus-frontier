# V66 worklot-003 reference audit — enemy-076-albino-ripper-queen

## Verdict

- Local reference fragment: `docs/references/V66_WORKLOT_003_ALBINO_RIPPER_QUEEN_REFERENCE.json`.
- Phase: reference-only; reviewed locally; not merged into `V66_ENEMY_BATCH_REFERENCES.json`.
- Classification: original fan-made/project systemic adaptation of the project-original Ripper Queen; `canonExact=false`; no official, licensed or 1:1 model claim.
- External URL policy: `urls=[]` intentionally. The Ripper Queen is defined by the local V54 project prompt/sheets and reviewed V66 base lock; no official or licensed external Ripper Queen/Albino Ripper Queen model exists. Every positive source is a safe relative local path with a retained SHA-256 proof.
- No ImageGen call, asset write, runtime acceptance, state/queue/reference-global mutation or Git action was performed.

## Exact queue contract

The snapshot was read from `docs/references/V66_ENEMY_BATCH_QUEUE.json` at SHA-256 `e98c379494f40f3d210243f867344dcd900e66a1e3c4c254cf2909affb817609`.

- Identity: `enemy-076-albino-ripper-queen`, Albino Ripper Queen, archetype `Ripper Queen`, modifier `Albino`, biology `xenomorph`, caste `royal`, provenance `systemic-variant`, animation family `royal`, `batch-005`, ordinal `75`.
- Initial reference state: `pending-reference`, `reference=null`, `referenceLockSha256=null`, provider `OpenAI ImageGen`, `canonExact=false`.
- Source contract: right-facing; exact 4x2 source board; 8 frames per clip; target atlas 4x10 at 256x256 with guard 16; pivot `(128,240)`.
- Clips: `idle` 6 fps loop frames 0–7; `move` 12 fps loop frames 8–15; `attack` 12 fps non-loop frames 16–23; `death` 10 fps non-loop frames 24–31; `tail-strike` 12 fps non-loop frames 32–39.
- Exact fifth-clip motion: anticipate, sweep the long tail through the hit phase, then recover without changing body proportions.

Fresh `SHA-256(JSON.stringify(prompt))` recomputation matched all five queue hashes:

- `idle`: `61d03d2d9aa439666c54a80bfc9338bf3a02c5bb56be828a8ca1051b919c1fbc`
- `move`: `1aa2db6a1bab61d2323f6defc592dbee338cbdb153383776589bf25a969eaa69`
- `attack`: `30430a0b597df65fade2b7eb2e65f5dd10ce279c9732ace1585fdb7175e68bcb`
- `death`: `d1dc9caa23afbca4a39fc648f079b1c58272558a10f3aa0b0edb8b0d270105a9`
- `tail-strike`: `a841124a95e61c54acde3a299207e8bea3fbcdcd52ec2ec0adcd40fcf0d22488`

Raw UTF-8 prompt hashing is not the queue algorithm. The queue texts remain BLOCKED snapshots and must be rebuilt from the eventual merged lock before any generation.

## Authority and design decision

Base profile `enemy-024-ripper-queen` is bound to reviewed lock SHA-256 `2f8973c3b854b080e444860ba63da814c9353e5183d417f0f53ff18c05fd54ed`.

Visual inspection of both V54 sheets and all five active V66 boards confirmed the internal royal target: broad backward-swept segmented crown, jagged pale dorsal carapace/tendrils, wet biomechanical inner tissue, reinforced primary forelimbs, small inner royal arms, massive digitigrade hindlegs and exactly one long hooked tail attached to the pelvis. The systemic albino shifts inner tissue to warm pearl/parchment/ash with rose-taupe recesses while brighter chalk-ivory crown/carapace and burgundy fissures remain distinct. It is not a standard blue Queen recolor or a flat-white ATARAX Ripper.

The tail-strike lock is explicit: exactly one tail remains attached continuously to the pelvis, loads, sweeps through a clear hit phase and recovers without changing body proportions. No held spear, detached tail, projectile or second tail is allowed.

The source art is evidence, never a pixel donor. The V54 sheet includes checkerboard presentation and effect-heavy poses. Active V66 boards retain magenta edge residue and subtle timing. The source audit reports attack contacts in nominal cells 2/3/4/5/6/7 and blocked default extraction; idle, move, death and tail-strike pass their technical extraction probes, but none is visually accepted or runtime-integrated.

Key local identity hashes:

- V54 raw 1254x1254: `388fe8175ae1302bfa47bc37c794297df2944c96a57adb0e4567a1095cb5c9cf`
- V54 normalized 1024x1024: `20878480f2538db0a9972743f1f5012845bdd898ea4188ab566c6efdbc1f7af8`
- V66 idle/move/attack/death/tail-strike 1774x887: `fc30ed62d686b648c667798a284390a7e5b3747666ebcd0b65fd63112c62f3e7`, `f60c98099cdcb6461fffcc86b8a75aa07d22f0f87c48d4c74d2e8e42a6cd91b7`, `f139bde900f38e24db3b281bf7f456c7da30d3a3ea7a9ad7431a43ed648db45c`, `afac2b9c38948effb53c189ac4180e8468550cda31b888c618ea7676e9128695`, `60bb1e6b20bb59a0c3e00df2415d8b8af323985aed124e59179bb57f059e8871`
- Base metadata: `d395d0165a3d01eda37e45b23e89bf3a6bc402bc4079a187a96f2a0268854a9a`
- Exact V54 project prompt document: `8cafdd020a89882cf123a3aebb694eb65326fd44da7dc9276b8b6ac88af261bb`

Every `localPaths` entry exists, remains relative to the repository and has an exact hash in the fragment's `localSourceHashes` map.

## Root and scale decisions

- Root: the base anchor registry has no `enemy-024-ripper-queen` entry and metadata marks physical anchor review pending. Legacy bounds-center-bottom placement, crown extrema and tail arcs are rejected. All 40 new 076 poses require independent annotated lower-ribcage/pelvis-to-support review.
- Scale: the base has historical final pack scale `0.466666667` and nominal all-one `sourceScaleByClip`, but `scaleCalibrationReview=null`, zero calibration evidence and no scale-registry entry. No numeric value transfers. All five 076 clips require a new measured, retained scale review based on stable crown-base/body landmarks, never crown-tip or tail extrema.
- Consequently, anchor/scale merge scripts are not applicable at reference-only phase because no 076 source PNG, metadata, measured roots or scale review exists yet.

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
