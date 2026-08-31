# V66 batch 002 - reprise variantes B (2026-08-31)

## Delivered files, not runtime acceptance

Built-in OpenAI ImageGen was used. No CLI/API generation.
This pass completed 11 previously missing clip masters: Boiler 014 (4), Specimen Six Line 018 (3), K-Series Yellow 020 (4).
Existing Specimen Six idle was recovered by exact SHA256 equality with the preserved generated-images master.
Five additional generated corrections are preserved through append-only event files and rejected-source siblings.
Thus these three profiles now contain 12 active masters / 96 source poses, with 17 provenance event files including rejected revisions.
The Red Xenomorph 019 was delegated back to root; its four sheets are outside this pass's count.
Prowler 015, Burster 016 and Monica Line 017 were not overwritten.

Workspace source roots:
- assets/openai/sprites/frames/v66/batch-002/enemy-014-boiler/
- assets/openai/sprites/frames/v66/batch-002/enemy-018-specimen-six-line/
- assets/openai/sprites/frames/v66/batch-002/enemy-020-k-series-yellow-xenomorph/

Full actual prompt sets:
- docs/references/v66-batch-002-prompts/enemy-014-boiler/
- docs/references/v66-batch-002-prompts/enemy-018-specimen-six-line/
- docs/references/v66-batch-002-prompts/enemy-020-k-series-yellow-xenomorph/

Generation IDs, actual prompt paths and SHA256:
- docs/references/v66-batch-002-events/<profile>/<clip or revision>.json

## Current revisions

| Profile | Idle | Move | Attack | Death |
| --- | --- | --- | --- | --- |
| 014 Boiler | idle-r3 | move-identity-r3 | attack-identity-r3 | death-identity-r3 |
| 018 Specimen Six Line | recovered idle | move-r2 | attack | death |
| 020 K-Series Yellow | idle | move-idle-anchor | attack-r3 | death-idle-anchor |

The current source stays at the stable clip.png path. The actualPromptPath in the newest event identifies the revision.
Original rejected masters were retained:
- 014/rejected/idle-facing-left.png
- 014/rejected/idle-malformed-head-r2.png
- 018/rejected/move-tail-overflow.png
- 020/rejected/attack-stretched-arm.png
- 020/rejected/attack-pose5-overflow-r2.png

## Visual review and open issues

- Boiler: first generation copied the source camera and turned the skull left. Second revision produced a malformed projecting jaw. Third revision repaired the cranial shell, providing a consistent right-facing anchor for the other three clips.
- Boiler: the candidate has less dense cyst coverage than the inspected ACM screenshot; exact 1:1 morphology is NOT certified. Shuffle leg alternation and idle-loop smoothness need playback review. Attack is contact-warning and pressure preparation; the detonation is not painted into every sprite.
- Specimen Six: move-r2 curls four overlong tails back inside their cells. The curled tails appear shorter than the earlier poses, so length continuity remains a visual review item even if a cell-boundary check passes.
- K-Series: the reference is the normal yellow Warrior in the front-left of the Extinction cinematic, not the Queen or black foreground alien. The silhouette is a side-view adaptation, not a certified replica of a complete source mesh.
- K-Series: attack-r3 removes the fifth-pose arm spill, but the shorter claw motion now has modest attack readability. Animation contact timing needs playback review.
- K-Series: death pose1 contains a small violet smear between forearm and thigh. Treat as a visible artifact pending ImageGen cleanup; do not misclassify it as native alpha.
- All current masters are generated magenta-backed RGB candidates, not accepted transparent atlases. Per-frame root anchors, cell ownership, matte, near-duplicate/loop checks and world-scale review remain necessary.
- No runtime files, shared STATE/QUEUE, accepted metadata, commits, or deployments were changed by this agent.

## Reference review

New reviewed entries 014 and020 were persisted in V66_BATCH_002_REFERENCES_B.json before their first generated sheets.
The Boiler game screenshot and V56 side-view sheet were directly inspected.
K-Series game cinematic was directly inspected; the guide documents the yellow faction. No dedicated K-Series entry was found in the V56 matrix, and this was not concealed as complete original coverage.
No source image is included in runtime packaging.

Source pages:
- https://store.steampowered.com/app/49540/Aliens_Colonial_Marines_Collection/
- https://www.avpcentral.com/xenomorph-types-and-subspecies
- https://www.avpgalaxy.net/games/avp-extinction/aliens/
- https://www.avpcentral.com/aliens-vs-predator-extinction

