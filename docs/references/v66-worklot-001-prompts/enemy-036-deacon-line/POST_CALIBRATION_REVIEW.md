# V66 worklot 001 — Deacon Line 036 post-calibration review

Date: 2026-09-01

## Result

The four selected OpenAI ImageGen boards were normalized from their unchanged active PNG masters after the corrected 32-pose physical-root map and the reviewed mitre-cranium calibration were merged.

- Atlas: `assets/openai/sprites/normalized/enemy-profiles-v66/enemy-036-deacon-line.webp`
- Atlas SHA-256: `4dff0c0c15bd06d2f8beda00d747929f594cfcd236dec37363184d0a7fa7d8f4`
- Source-scale factors: idle `1.000000`, move `1.038739`, attack `1.046164`, death `0.997424`
- Physical roots: 30 grounded/contact poses use the complete recovered source floor; death frames 1–2 retain their reviewed airborne ground plane
- Extraction: 32/32 poses, eight unique frames per clip, no missing source pixel
- Matte: 856 enclosed strict-core pixels and 1,809 bounded AA-fringe pixels removed; seven remaining strict spill pixels neutralized; zero remain
- Validation: 32 unique normalized poses, no technical finding

The rendered contact sheet was visually inspected at the shared runtime pivot. The same midnight/navy-blue, narrow, eyeless Deacon silhouette is retained through breathing, locomotion, reach/recovery and collapse. The upward rear bishop-mitre skull, exactly two arms and two legs, tail-less body and absence of dorsal tubes remain readable. The strict cleanup removes the bright magenta background pockets that crossed the abdomen and legs in the first diagnostic render; restrained dark purple tissue shading remains below the spill threshold and does not read as the opaque matte.

This result is a calibrated production candidate only. `acceptanceStatus` remains `pending-visual-review`, `runtimeIntegrated=false`, and `canonExact=false`.
