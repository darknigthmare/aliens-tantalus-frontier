# V66 Worklot 003 — Wild Boar Host reference audit

## Verdict

`enemy-049-wild-boar-host` is locked as `PROJECT_ADAPTATION`, `canonExact=false`. It is a living boar host created for Tantalus Frontier, not the Kenner Wild Boar Alien and not an alleged screen-canon boar. No 1:1 external model exists.

## Canon boundary and licensed evidence

- The primary licensed work *Alien 3* supports animal-host continuity. The theatrical work uses a dog; the studio-released Assembly Cut uses an ox. These are two versions of the same production and do not establish a wild-boar host model.
- [20th Century Studios — Alien3](https://www.20thcenturystudios.com/movies/alien-3) is retained as the official work landing, not as a design sheet.
- [NECA — Ultimate Dog Alien](https://necaonline.com/2019/07/alien-3-7-scale-action-figure-ultimate-dog-alien/) is licensed corroboration for the canine Dog Alien identity. Its xenomorph anatomy is explicitly excluded from the living host.
- The archived Kenner catalog is retained only to prevent a naming collision. Its Wild Boar Alien must not be reproduced, recolored or traced.

There is no positive external boar-character reference. The future bitmap must therefore be an original project design governed by the local V56 lock and natural wild-boar anatomy.

## Local continuity audit

The V56 reference matrix classifies the profile as `PROJECT_ADAPTATION / DERIVED_FROM_EXTERNAL_MODEL`, with the explicit conflict that the name recalls a Kenner xenomorph while the runtime entry is `biology=fauna`, `caste=host`. The V55 inventory previously reported ten family-reuse instances and no exact profile art. V56 introduced a dedicated project-owned identity predecessor.

| Evidence | Dimensions | Bytes | SHA-256 | Use |
|---|---:|---:|---|---|
| `assets/openai/sprites/enemies/wild-boar-host-action-sheet-v56.png` | 1402×1122 | 1,149,310 | `f9e3c391675052826229890b82e9909e2550aba7504b49380cfe6ab87e2ce655` | identity predecessor |
| `assets/openai/sprites/normalized/enemies/wild-boar-host-action-sheet-v56.png` | 1024×1024 | 616,901 | `a79046e9a54e9eabd4fa89593e75e228bd0b03eeda18032dfe7a7c966ca2af0c` | normalized predecessor |

Runtime continuity is `158×88`, `boar-ground`, right-facing. V66 keeps the same low compact read but requires newly authored clip-specific frames.

## Locked production contract

Exactly four future PNG sheets: `idle` 6 fps loop, `move` 12 fps loop, `attack` 12 fps non-loop and `death` 10 fps non-loop. Each is 1774×887, 4×2, eight chronological row-major poses. The normalized atlas remains 4×8 cells of 256×256 with 16 px guard and pivot `(128,240)`.

The animal has one natural boar head, two readable tusks, four legs, cloven hooves and a short non-weapon tail. It is strictly right-facing in all 32 cells. Palette is black/umber hide, gray-brown bristles and dirty ivory tusks. No xenomorph, harness, armor, domestic pink pig or fantasy-monster cues are allowed.

Motion is species-specific: grounded breathing/sniffing, a mechanically coherent four-leg gait, a braced tusk drive with recovery, and an irreversible support-loss death ending motionless. Limb identity, body length, shoulder height and ground root must not drift between clips.

## Placeholder and merge audit

The batch-004 queue was observed with `initialStatus=pending-reference`, `reference=null` and `referenceLockSha256=null`. Its four placeholder prompt hashes were copied exactly into the fragment and verified. Those prompts remain blocked; the reviewed lock must be merged and prompts recompiled before ImageGen.

No queue, state, global reference registry, normalization output or Git metadata was changed. No art was generated or accepted.

## Acceptance blockers

- Reject any claim of 1:1 fidelity to a published boar host.
- Reject any resemblance to the Kenner Wild Boar Alien or any xenomorph phenotype.
- Reject left/front-facing poses, perspective turns, duplicate frames, crop, cell contact, grid spill or ground drift.
- Reject any sheet until all 32 cells, topology, silhouette, inter-clip scale and chronological playback have been reviewed.
