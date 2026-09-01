# Salvage Hive Brute 032 production handoff

Built-in OpenAI ImageGen only: 13 real calls, 5 selected candidate boards and 8 archived rejected predecessors. All five active sources are RGB 1774 x 887, exact 2:1, opaque-magenta, 4 x 2, and contain eight distinct poses.

Reference fragment: `docs/references/V66_WORKLOT_001_SALVAGE_HIVE_BRUTE_REFERENCE.json`. The V56 matrix and V66 queue were inspected, together with the GameSpot retrospective and AVP Galaxy Crucible documentation/gallery. The Gizmodo URL was retained from the matrix but its current page could not be loaded by the web reader. Those pages establish contextual corpus only: Salvage Hive Brute is an original project adaptation, not an attested canon or Crucible caste, and no external bitmap was copied into the deliverable.

## Selected sources

| Clip | Selected receipt | SHA-256 | Technical audit |
|---|---|---|---|
| idle | `idle-r2.event.json` | `5bc911b4b201925ed6586f696a6dd2d1bdfb53c22294164f5738ed17460adaaf` | 8 distinct; no border contacts; default extraction 8/8 |
| move | `move-r2.event.json` | `114083e565c5ecffeadc0215b242654a51c6947307e65c2f05a8fc5a4654a9c9` | 8 distinct; no border contacts; default extraction 8/8 |
| attack | `attack-r2.event.json` | `da09427947eb0b1faa6f970c6cb46950b6ca9085c0bc1a0d09802d36a8efa4dd` | 8 distinct; no border contacts; default extraction 8/8 |
| death | `death-r3.event.json` | `4919be02e9f0e9b2462c674ddcc0a1ea06ecd6d953e8e4e1b97d09f027b03698` | 8 distinct; no border contacts; default extraction 8/8 |
| charge | `charge-r3.event.json` | `62a7d760edbadeb305356c04c9d9a193db883a0dedf2c94c2266acf864c64fc4` | 8 distinct; no border contacts; default extraction 8/8 |

All 40 selected poses were visually inspected as strict right-facing side views with one complete subject and a connected full tail. The locked biological mass, two arms/two legs, protected organic head, passive rusty salvage, dead cables and amber resin remain readable. No selected pose presents a held weapon, powered hardware, articulated scrap armor, mech, cyborg, backpack or exoskeleton.

Animation reading is candidate-reviewed: idle is a grounded breathing loop; move alternates low biped/foreknuckle contacts; attack progresses from brace through biological head/shoulder slam and recovery; death progresses to a terminal non-gory lying body; charge accelerates, compresses and brakes while keeping the feet as the primary drive.

## Post-generation scale and physical registration

The independent rigid-anatomy review is now recorded in `docs/references/V66_WORKLOT_001_SALVAGE_HIVE_BRUTE_SCALE_REVIEW.md`. Two protected cranial-plate chords per clip yield these recommended, unapplied source factors: idle `1.0`, move `0.872336`, attack `0.927315`, death `1.300751`, charge `1.0`. Charge's raw factor was `1.002002` and was clamped to `1.0` because the 0.20% difference is below the ±5 source-pixel landmark uncertainty.

All 40 ribcage roots and verified support floors are present in the directly merge-compatible batch-003 fragment `docs/references/V66_WORKLOT_001_SALVAGE_HIVE_BRUTE_ANCHOR_REVIEW.json`. Every anchor uses the inspected thorax behind the front shoulder and the physical foot/knuckle/forearm/knee/body floor; no tail or crest extremum is used. The fragment is physical registration evidence only and does not accept or normalize the art.

Charge received an additional eight-cell pass: every subject is complete, uses the same protected head/heavy forearm/salvage-resin identity, retains a connected full tail, and points its dome and maw strictly to the right. Default extraction remains 8/8 with no border contact; frame 5 has the narrowest valid gutter at 3 px on the right.

## Preserved predecessors

- `idle-r1.png`: strong original identity but nominal spill between frames 7/8.
- `idle-r3.png`: technically extractable scale experiment, not selected because the compact r2 anchor gives safer inter-clip gutters.
- `move-r1.png`: multiple short nominal spills before uniform r2 packing correction.
- `attack-r1.png`: pose 4 tail touched its left divider before the targeted r2 shift.
- `death-r1.png` and `death-r2.png`: successive collapse packing predecessors; r3 removes the remaining frame 7/8 junction.
- `charge-r1.png` and `charge-r2.png`: straight-tail and intermediate compact-tail predecessors; r3 removes the last frame 5/6 junction.
- `rejected/idle-r2.png` is a byte-identical archival safety copy of the selected idle r2, not a separate generation.

Machine-readable evidence is in `assets/openai/sprites/frames/v66/batch-003/enemy-032-salvage-hive-brute/source-review.json`. Prompt text and content-addressed receipts are in this directory. Each generation ID is honestly derived from the exact resulting PNG SHA-256; no UUID was invented.

Remaining gates are explicit: normalization against the reviewed hashes/factors/roots, animated preview and gameplay-speed review, explicit acceptance, then runtime integration. No shared queue, reference registry, STATE, runtime, normalizer, test or Git state was modified, and no selected board is marked accepted or runtime-integrated.
