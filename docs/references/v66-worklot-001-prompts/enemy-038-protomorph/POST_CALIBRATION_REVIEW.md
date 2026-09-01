# V66 worklot 001 — Protomorph 038 post-calibration review

Date: 2026-09-01

## Result

The four selected OpenAI ImageGen boards were normalized from their unchanged active PNG masters after merging the reviewed 32-pose physical-root map and the rigid cranial-dome calibration.

- Atlas: `assets/openai/sprites/normalized/enemy-profiles-v66/enemy-038-protomorph.webp`
- Atlas SHA-256: `448d594aeceb8eea8c46cf8e0bf82db1d6a81c46d41d8ad8867a161f73269ac8`
- Source-scale factors: idle `1.000000`, move `1.140874`, attack `1.415565`, death `0.972318`
- Extraction: seven bounded cross-cell ownership transfers, zero discarded or recoloured source pixel
- Matte: strict enclosed core and two-pixel AA cleanup enabled; strict post-resize spill check records zero remaining pixels
- Validation: 32 unique normalized poses, no technical finding

The rendered contact sheet was visually inspected at the shared runtime pivot. The actor remains right-facing and identifiable as the same lean red-black Covenant-lineage creature across idle, locomotion, lunge/recovery and collapse. The sacral tail connection, two-arm/two-leg silhouette and three profile-visible dorsal tubes remain readable. The fourth locked tube is the naturally occluded far-side tube and is not forced into the flat profile.

The attack sequence remains deliberately flagged for visual review: its internal cranial chord varies from `87.006` to `97.739` source pixels, so one clip-wide factor cannot eliminate all size breathing. This result is a calibrated production candidate only. `acceptanceStatus` remains `pending-visual-review`, `runtimeIntegrated=false`, and `canonExact=false`.
