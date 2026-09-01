# V66 Worklot 003 — Korari Stalker reference audit

## Verdict

`enemy-050-korari-stalker` remains `PROJECT_ORIGINAL / NO_EXTERNAL_MODEL`, `canonExact=false`. Korari supplies a licensed setting name; it does not supply a published creature design. The Stalker is original fauna from Tantalus Frontier and must never be presented as a 1:1 licensed model.

## Research boundary

The licensed *Aliens versus Predator 2* Prima guide archive is retained solely as a setting-continuity pointer. The research found Korari associated with the AVP2 backstory but no primary/licensed character sheet, model or named species matching “Korari Stalker.” Secondary franchise wikis were not promoted into the positive source set.

Consequently, no external franchise creature may be imported to fill the gap. The local V56 project-owned predecessor and the reviewed design lock are the only positive visual authorities.

## Local continuity audit

The V56 matrix explicitly says `PROJECT_ORIGINAL / NO_EXTERNAL_MODEL`, describes an original low forest predator and prohibits both XX121 and Yautja anatomy. V55 previously reported ten family-reuse instances and no exact profile art; V56 later supplied a dedicated identity predecessor.

| Evidence | Dimensions | Bytes | SHA-256 | Use |
|---|---:|---:|---|---|
| `assets/openai/sprites/enemies/korari-stalker-action-sheet-v56.png` | 1254×1254 | 1,349,902 | `8bdc72b5cef6e12ca0e1c058c30a2680e7de2fcb2038409a2a5a877b857f7397` | sole positive identity predecessor |
| `assets/openai/sprites/normalized/enemies/korari-stalker-action-sheet-v56.png` | 1024×1024 | 434,096 | `353df5622d4c470a3a07fe3a654eb2ec490c169ebaf6c3f9b1ea4dd56d5fa405` | normalized predecessor |

Runtime continuity is `176×88`, `korari-stalker-ground`, right-facing. V66 preserves the long, low gameplay read while replacing legacy/family reuse with independently authored clips.

## Locked production contract

Exactly four future PNG sheets: `idle` 6 fps loop, `move` 12 fps loop, `attack` 12 fps non-loop and `death` 10 fps non-loop. Each is 1774×887, 4×2, eight chronological row-major poses. Normalization targets a 4×8 atlas of 256×256 cells, 16 px guard, pivot `(128,240)`.

The Stalker has one wedge head with a visible natural lateral eye/sensors, one jaw, four distinct limbs and one flexible non-bladed tail. Its original surface combines charcoal/moss-green organic hide, bark patterning and sparse dim cyan flank photophores. It has no equipment.

All 32 poses must be strict orthographic right profile. Motion is a low organic breath/sensor idle, a four-limb stalking run, a compressed pounce with single-jaw/foreclaw contact and recovery, then an irreversible collapse ending motionless. Torso length, shoulder height, topology and root line are invariant.

## Exclusion audit

- No xenomorph dome, inner jaw, acid, dorsal tubes, blade tail or biomechanical ribbing.
- No Yautja mask, dreadlocks, armor, plasma technology or active camouflage.
- No recolored Earth panther and no recognizable creature from another franchise.
- No extra limbs, missing natural eye, weapon tail, perspective rotation or front-facing head.

## Placeholder and merge audit

The batch-004 queue was observed with `initialStatus=pending-reference`, `reference=null` and `referenceLockSha256=null`. All four placeholder hashes were copied and verified. The prompts are still blocked until this reviewed fragment is merged and the final prompt hashes are regenerated.

No queue, state, global reference registry, normalization output or Git metadata was changed. No art was generated or accepted.

## Acceptance blockers

Reject any “canon exact” or 1:1 claim, any external-franchise attribution, any topology/identity drift, and any sheet with crop, boundary contact, spill, duplicate pose, wrong facing, inconsistent root/scale or non-chronological playback. Acceptance requires technical and visual review of all 32 cells.
