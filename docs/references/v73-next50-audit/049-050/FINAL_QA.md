# V73 — independent physical / visual review: fauna 049–050

Reviewed 2026-09-05 by Codex level_props_audit_fix. Scope is deliberately isolated: current source boards, derived V66 outputs, and these single-profile evidence fragments. No queue, runtime, STATE, shared reference registry or acceptance record was edited. No new image generation and no second source-scale correction.

## Decision

- **049 Wild Boar Host: candidate blocked.** Its active attack rigid-axis median is 163.869393 px against idle 171.771625 px (-4.600427%). The earlier worklot allowed 5%; the current V66 physical-scale gate allows 3%. The measurements and factors 1 remain unchanged; no invented endpoints or reduced threshold.
- **050 Korari Stalker: broad original-model identity and authored animation pass independent source inspection.** Its 32 physical roots and derived outputs now pass the isolated checks below. This is a project-original creature, not a claim of external 1:1 canon. Pattern micro-continuity remains imperfect, and runtime combat/death-hold acceptance is outside this isolated pass.

## Evidence actually inspected

All eight active 1774×887 RGB boards (64 poses), both previous 32-pose identity/motion contacts, both V56 positive identity action sheets, the 049 idle technical overlay, and the 050 raw attack extraction overlay and original rigid-axis overlay were viewed directly.

This folder contains eight active-source anchor overlays and two active-source scale overlays, all subsequently viewed directly. They are diagnostic drawings only; source pixels were never overwritten. The old 049 rigid-body-measurement-review.png does not exist; it was not treated as evidence. Its earlier numeric endpoint records were transformed into the active cell and checked against the newly rendered active-source overlay here.

The old standalone source repair and its exact ImageGen receipts/prompts remain in:

- docs/references/v66-worklot-003-wild-boar-host-review/enemy-049-wild-boar-host/
- docs/references/v66-worklot-004-korari-stalker-review/enemy-050-korari-stalker/

Their historical reports are provenance, not a substitute for this current inspection.

## 049 anatomy and motion

The subject is a living natural boar host (PROJECT_ADAPTATION), not a Kenner Wild Boar Alien. One head, paired tusks, four hoofed legs, short attached tail and brown/gray bristled hide remain readable. The V56 positive model is recognizable; the newer painted bristles are warmer and more stylized, not pixel-identical.

Idle: breathing/sniffing and head lift/lower across eight poses. Move: compressed quadruped gallop at poses 2/6, extended phases 3/4/7/8, changing front/rear contacts. This is not the same defective repeated biped leg phase seen on rejected albino runners. Attack: lower head 2/3, tusk/head drive 4/5, lift/follow-through 6, recover 7/8. Death: support loss and irreversible collapse; 6–8 end prone. Ear, tusk detail and fur microtexture vary. The attack-scale defect above still prevents acceptance.

## 050 anatomy and motion

The locked positive predecessor is the project's original Korari: a low forest quadruped with a wedge-shaped head, one natural jaw, charcoal/moss bark-pattern hide, sparse cyan flank marks, four supple limbs and a long flexible non-bladed tail. No alien dome, dorsal tubes, inner jaw, armor or borrowed-franchise silhouette was found. Direction remains right across all 32 poses.

Idle: low crouch, breathing/targeting, body/head lift at 3/4, tail counterbalance at 5 and lowered recovery at 8. Move: compressed phases 2/6 and extended 3/7; visible front/rear contacts change rather than duplicating one biped stance. Attack: compress, target, hindquarter coil, launch (4), open single-jaw bite and foreclaws (5), follow-through (6), land (7), recover (8). Death: recoil, loss of support, body collapse, then prone settling 6–8.

Individual bark plates, sensor-frill edges and cyan-dot spacing do vary. This is explicitly a broad-model pass, not 1:1 micro-continuity. Terminal death is drawn prone; gameplay one-shot/hold and collision timing still require the parent's runtime recipe.

## Root measurements, not a bounding-box centering formula

All 64 source-local points inherited from the old decomposition were checked on the actual torso immediately behind the shoulder. Those points are located in anatomical mass, not halfway along the tail/head extent. The new overlays show every point and every support plane. Crouching and death change the height of the torso without moving the ground plane to its bounding-box center.

Grounded support is the visible hoof/paw or resting-body plane. Per-pose uncertainty is retained (8 px for ordinary grounded poses, 9–14 px through collapse). The old extraction adds three transparent pixels beneath this support; packing must distinguish that technical padding from the physical ground.

050 airborne attack 4/5/6: the old recomposition had put every lowest pixel onto the same floor and erased authored pounce height. The immutable raw attack board supplies a local grounded-neighbour plane. Differences (20, 5, 22) px, multiplied only for coordinate conversion by the already-applied attack factor 0.778891834, give rounded clearances (16, 4, 17) active-source px. These are recovered heights, not a newly drawn jump arc. Pose 5 is low and uncertainty is 8 px; no exaggerated height is invented. The roots retain this clearance below the airborne feet.

## Scale measurements

Two croup-to-shoulder endpoints per clip were converted from the historical extracted local coordinates using the recorded recomposition origin and previously applied uniform factor. The eight overlaid axes per profile were inspected on the active sources. They exclude head/neck, tail, limbs and bristles. Flexion/occlusion and ±5 px endpoint uncertainty remain documented; individual frame lengths are not forced to be identical.

050 active medians are approximately 93.992699 px in every clip, with factors 1 throughout. Its move pair is 101.59577 / 86.38963 px, reflecting articulation/projection; this is not a claim that the visible axis is rigid to subpixel precision. The existing uniform clip calibration is reused exactly, not applied again.

049 active medians are approximately 171.771625 px except attack 163.869393 px. Its scale fragment is deliberately not marked reviewed, because its attack mismatch exceeds the active 3% threshold.

## Technical verification

Initial normalization of each profile completed with 32 poses, zero automatic acceptances, zero validation findings and all sourceScaleByClip values 1. The initial default --check passed for both. These initial atlases had pending physical reviews; they are not proof of final physical acceptance.

Final isolated normalization and replay --check both pass: 32 poses per profile, findings [], acceptedAutomatically 0. The new opt-in --trim-transparent-padding removes ONLY exterior alpha-zero padding before packing, preserves any alpha>=1 pixel, records the operation per pose, and is replayed automatically by --check. Roots now equal the measured physical support; no +3px compensation remains.

The normalized-root-contact.png images in this folder were viewed at full contact resolution. Grounded rows sit on the floor line, the Korari pounce retains output clearances 10/2/10 px at attack4/5/6, and every death ends prone. No row/cell cuts, white rectangle or visible magenta halo were found.

| Measurement | 049 | 050 |
| --- | ---: | ---: |
| Unique authored poses | 32 | 32 |
| Strict magenta pixels | 0 | 0 |
| Hidden RGB under alpha0 | 0 | 0 |
| Nonzero alpha inside guard | 0 | 0 |
| Strict opaque-white pixels | 31 (isolated tusk/eye highlights, not a matte) | 0 |
| Maximum rendered-root rounding error | 0.488746 px | 0.494506 px |
| Single final pack factor | 0.603260870 | 0.606557377 |
| Per-clip anatomical factor | all1 | all1 |
| Atlas bytes | 928332 | 440746 |

All eight active source SHA256 hashes still match the initial independent fragments. All eight standalone clips are pixel-identical to their atlas slices. Atlas sizes are 1024×2048 RGBA; no new artwork or source pixels were changed.

049 atlas SHA256: e9eb1133573633a0a24d75c746edebbe8d38616f572db7cfc84ce28dce98d68e.
050 atlas SHA256: 01f0627eee240ded94a36859e2d4dc8960d5881828d24753be04e78ad7a096df.

Node validatePostGenerationScaleReview accepts both isolated physical metadata proofs; 050 additionally has a reviewed post-generation scale proof. The 049 call does NOT turn its absent scale proof into a pass: its isolated scale fragment remains blocked and was deliberately not supplied to normalization. Local historical generated events validate 4/4 per profile with zero prompt gaps and issues [], still status generated, never accepted/integrated.

Reproduction uses scripts/process-v66-enemy-batch.py --profile <id> with --anchor-review <this folder>/<id>.anchor-review.json and --trim-transparent-padding --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe --remove-magenta-spill. Add --scale-review <this folder>/enemy-050-korari-stalker.scale-review.json ONLY for050. Then --profile <id> --check reuses the recorded isolated paths and options. No shared review registry is needed.

050 is technically eligible for the parent's final original-model art/integration decision. World-scale comparison to the marine, combat timing and terminal death hold still need runtime verification; atlas native visible idle height is 47–76px (pose dependent), not a statement of world-space creature height. 049 remains blocked for the explicit attack-scale mismatch. Neither profile was accepted or inserted into runtime in this task.
