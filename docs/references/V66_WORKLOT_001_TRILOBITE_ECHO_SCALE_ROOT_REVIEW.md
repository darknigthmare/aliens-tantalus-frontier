# V66 Worklot 001 — Trilobite Echo post-generation scale and root review

Date: 2026-09-01
Reviewer: Codex `/root/complete_variants`
Scope: `enemy-035-trilobite-echo` only, candidate evidence only

## Outcome

- Four current source candidates were reviewed at their exact 1774×887 source resolution.
- Twelve manually marked measurements use one rigid anatomical invariant: the posterior radial-attachment centroid to the center of the closed anterior aperture. Tentacle tips, whole-pose bounding boxes and curled reach are excluded.
- Thirty-two physical roots were manually placed under the basal-ring hub and projected vertically to a planted support or, during the death collapse, the central-mantle body contact.
- No source, atlas, runtime file, global queue, state or reference registry was changed. No candidate is accepted or runtime integrated by this review.

## Scale calibration candidate

The local fragment is `docs/references/v66-worklot-001-trilobite-echo-postgen/scale-review.fragment.json`.

| Clip | Three rigid mantle lengths (px) | Median (px) | Candidate `sourceScaleByClip` |
|---|---:|---:|---:|
| idle | 65.000000, 63.890531, 69.079664 | 65.000000 | 1.000000 |
| move | 67.067131, 64.845971, 67.067131 | 67.067131 | 0.969178 |
| attack | 69.289249, 68.541958, 61.326992 | 68.541958 | 0.948324 |
| death | 66.730802, 77.252832, 59.363288 | 66.730802 | 0.974063 |

The official post-generation scale resolver validated the fragment: all four source SHA-256 values are current, all 12 Euclidean lengths agree with their endpoints, the idle baseline is exactly 1, and each factor agrees with `median(idle) / median(clip)` within the strict 3% gate. These factors remain unapplied candidates.

Marked scale evidence:

- `scale-idle.png` — SHA-256 `6f43adfd5457ce663d3d48f061394091961657df1aa0c3d7a501d2879983c5ce`
- `scale-move.png` — SHA-256 `a3739c69fdb3354d72d849155acb44155c10955c7b64c32205389b464461ef52`
- `scale-attack.png` — SHA-256 `0690df8fec1f0bfd07839b9cde40bebef261f9839130cb3780b5ddbf583d7239`
- `scale-death.png` — SHA-256 `464259d272da8544f402f4a5dd7aa4c750f7c94c6768b769aa6b8f678c5335e8`

The death measurements have the widest pose deformation and therefore the greatest manual uncertainty. The median remains supported by one upright and one collapsed sample on either side; the factor must still be treated as a calibration candidate until an authorized normalization review confirms the packed result.

## Physical roots

The local fragment is `docs/references/v66-worklot-001-trilobite-echo-postgen/anchor-review.fragment.json`.

- `idle`: 8/8 hub projections reviewed against planted lower-tentacle supports.
- `move`: 8/8 hub projections reviewed against the active planted support for the crawl cycle.
- `attack`: 8/8 hub projections reviewed on the lossless safe-reassignment ownership result; rear/bracing supports, not the forward grapple reach, define the root.
- `death`: 8/8 hub projections reviewed; later poses use the collapsed central-mantle contact, never a loose tentacle extremity.

The exact extractor bounds were recomputed after the review. For all 32 poses, `sourceBounds[3] - anchorY == 0`; every anchor therefore includes the complete lower source guard and none truncates authored anatomy.

Marked anchor evidence:

- `anchors-idle.png` — SHA-256 `a151e12673b2afb8f51df8efa8a599400498aaed895340338b93c61b42f5b423`
- `anchors-move.png` — SHA-256 `abbdc7797b554baa8318356e93ad65919a0b2aeb906d61d649d3bc1f5920c9b0`
- `anchors-attack.png` — SHA-256 `667dae2a89986dd31c54c9b946e4b636f354fa7cd63470f80fee30cdb80685a5`
- `anchors-death.png` — SHA-256 `8eeefeb389ed96da75a84e62a51498e0f86319d40a8846cd99b431f08c7a77ea`

## Remaining gates

1. Parent-controlled merge of the two profile-local fragments into the batch-003 review documents.
2. Explicit normalization using the reviewed scale and anchor evidence, followed by atlas/GIF inspection.
3. Separate art acceptance, provenance import and runtime integration decisions.

This review performs none of those operations automatically.
