# V66 worklot 001 — Protomorph 038 source QA

Date: 2026-09-01
Scope: `enemy-038-protomorph`, batch-003, source-only review. No source, global review, queue, state, metadata, atlas, runtime or Git mutation is part of this audit.

## Result

The four unchanged 1774×887 RGB masters contain 32 distinct, chronologically usable right-facing poses. The complete-source guard recovers all 32 with no discarded or recoloured source pixel. Nominal-cell extraction alone is correctly blocked: seven short crossings require the existing safe ownership proof.

The actor remains the same lean red-black flayed Covenant-lineage creature in every pose. Two arms and two legs are readable directly or through strict-profile overlap; one full articulated tail remains connected at the sacrum; three discrete dorsal-tube silhouettes are visible in every strict-right-profile pose. The fourth authored tube is the far-side occluded tube required by the reviewed design lock, but a flat side-view sheet cannot independently image that hidden surface.

This is not artistic or runtime acceptance. Automatic acceptance stays blocked by the attack clip's scale drift and by the explicit matte options required below.

## Complete-source ownership

| Clip | Default split | Complete-source guard | Transfers |
| --- | --- | --- | --- |
| idle | blocked | 8/8 pass | cell 3 ← 2: 11 px, owner 99.956%; cell 7 ← 6: 1 px, owner 99.996% |
| move | blocked | 8/8 pass | cell 3 ← 2: 173 px, owner 99.233%; cell 7 ← 6: 129 px, owner 99.373% |
| attack | blocked | 8/8 pass | cell 3 ← 2: 33 px, owner 99.765%; cell 4 ← 5: 910 px, owner 93.974% |
| death | blocked | 8/8 pass | cell 3 ← 2: 241 px, owner 98.968% |

Every crossing is one eight-connected component with at least 90% ownership in one cell and no more than 15% boundary excursion. The minimum observed owner share is 93.9735%; all seven proofs record `pixelValuesPreserved=true`. No foreground touches the outer 1774×887 board border.

## Identity, animation and continuity

- `idle`: eight subtle but distinct head, breathing and tail poses.
- `move`: eight distinct alternating rightward stride poses with coherent foot exchange.
- `attack`: anticipation → crouch → forward lunge → airborne extension → landing → recovery. The action is chronological and right-facing, but the rigid cranial chord ranges from 87.006 to 97.739 px inside this clip; a single clip factor cannot remove all visible size breathing.
- `death`: upright → buckle → crouch → kneel → prone transition → terminal corpse. Contacts progressively move from feet to knee/flank/limb support.

All 32 were reviewed for two-arm/two-leg topology, three visible dorsal tubes, sacral tail continuity and facing. No Neomorph-white skin, Deacon mitre/tube-less grammar, Queen crest, weapon, armour, eye or extra limb was found.

## Rigid scale calibration

The same posterior-hard-dome to anterior-hard-dome chord was measured on three readable poses per clip. Global bounds, tail, tubes, jaw and limb reach were excluded.

| Clip | Chords (px) | Median (px) | Recommended `sourceScaleByClip` |
| --- | --- | ---: | ---: |
| idle | 121.709, 126.194, 125.252 | 125.252 | 1.000000 |
| move | 109.786, 112.259, 106.677 | 109.786 | 1.140874 |
| attack | 97.739, 88.482, 87.006 | 88.482 | 1.415565 |
| death | 136.565, 121.037, 128.818 | 128.818 | 0.972318 |

The official standalone fragment is `docs/references/V66_WORKLOT_001_PROTOMORPH_SCALE_REVIEW.json`; it is not merged. The attack factor is a median technical correction, not a cure for its internal 12.3% chord range.

## Physical roots

All 32 roots were selected manually in nominal source-cell coordinates. The anatomical landmark is the pelvis/posterior hip at the sacral tail root. Its x coordinate is projected to the lowest load-bearing foot, knee, hand, forearm, flank or airborne extremity; y retains the complete recovered `sourceBounds` bottom and the three-pixel guard. Tail tips, skulls, reaching claws and bbox centres never define the root.

The merge-compatible standalone fragment is `docs/references/V66_WORKLOT_001_PROTOMORPH_ANCHOR_REVIEW.json`; it is not merged.

## Matte

All four outer borders are 100% proven matte. Before enclosed-matte handling, 4,672 strict magenta pixels remain inside recovered pose regions; the overlay shows that the large clusters are trapped background pockets between crossed limbs rather than anatomy.

The existing strict options remove 3,692 exact enclosed-core pixels plus 2,063 pixels of bounded two-pixel AA fringe in memory, for 5,755 matte pixels total. After that, 255 strict edge pixels remain: idle 98, move 61, attack 32, death 64. The existing `remove-magenta-spill` channel clamp neutralizes exactly 255 → 0 in memory without any threshold expansion. No source or atlas was written.

Required normalization options for this source set are therefore:

`--safe-reassign-cell-fragments --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe --remove-magenta-spill`

## Evidence

- `docs/references/v66-worklot-001-protomorph-qa/cranial-chords.jpg`
- `docs/references/v66-worklot-001-protomorph-qa/anchors-idle.jpg`
- `docs/references/v66-worklot-001-protomorph-qa/anchors-move.jpg`
- `docs/references/v66-worklot-001-protomorph-qa/anchors-attack.jpg`
- `docs/references/v66-worklot-001-protomorph-qa/anchors-death.jpg`
- `docs/references/v66-worklot-001-protomorph-qa/matte-strict-residue.jpg`
- `docs/references/v66-worklot-001-protomorph-qa/matte-counterproof.jpg`

Machine-readable detail is in `docs/references/V66_WORKLOT_001_PROTOMORPH_SOURCE_QA.json`. Acceptance remains `pending-visual-review`, `runtimeIntegrated=false`, and `canonExact=false`.
