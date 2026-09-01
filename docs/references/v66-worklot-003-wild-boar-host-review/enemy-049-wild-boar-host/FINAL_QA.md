# enemy-049-wild-boar-host — isolated V66 source repair QA

Date: 2026-09-01
Reviewer: Codex `/root/complete_variants`
Scope: profile 049 only; no global registry, runtime, normalization or Git operation

## Active candidate boards

| Clip | Selected raw SHA-256 | Active SHA-256 | Size / grid | V66 extraction |
|---|---|---|---|---|
| idle | `f11eca6f158621e82efe2e06da818c55d0afb366baf5a47f6d14287eb20969c6` | `40af647b8f28afb8f872cff0235da56afb7eca453d88f7cfb59b0abf1aae6270` | 1774×887 RGB / 4×2 | PASS, 8 distinct |
| move | `87b5652d237290adb6e207b9839246633d38207c9aa94e16d9d834d6bcc2f8d9` | `77e62563dac70cffd955fcb8a871c8cdd1593af4ed4c56e4f34f9445a7bf669b` | 1774×887 RGB / 4×2 | PASS, 8 distinct |
| attack | `61d2e63559c55833ad9978afebacc379184552c89d2253bbc470b04dd46f14f4` | `68e70c5b8837e89e673c4cb65f9b2b65c81875ffef987c7b371d35fb2614e960` | 1774×887 RGB / 4×2 | PASS, 8 distinct |
| death | `6f18d3e7e7a4342969793d9c068ab59807f56294b33470011ad6d8d6c77e0a95` | `ac48e4cbe343feca8c6874aaeedf9685dc0da85704eb3d1dbe0f27e90bc4fe27` | 1774×887 RGB / 4×2 | PASS, 8 distinct |

For all four actives the V66 source auditor reports `opaque-magenta`, edge-magenta ratio `1.0`, eight distinct cell hashes, default extraction PASS, zero border-contact frames and no findings.

## Post-generation anatomical calibration and roots

- The same rigid landmark is measured manually in two poses per clip: posterior croup/tail-base contour to anterior shoulder/neck junction.
- Raw lengths (px) are idle `180.069/180.278`, move `180.069/175.071`, attack `150.333/145.344`, death `175.641/160.078`.
- Idle is the baseline. Absolute uniform factors applied to complete clips are idle `0.953367876`, move `0.967343672`, attack `1.108433735`, death `1.023303548`.
- Attack is fit-clamped by frame 5 right clearance; its calibrated rigid median remains about `-4.6%` versus idle, within the approved `±5%` target. The other clip medians resolve to the idle baseline within rounding.
- Width and height always use the same factor inside a clip. No per-pose factor and no non-uniform anatomy stretch is applied.
- Minimum target-cell clearance is 38 px in every clip; the required gate is 32 px.
- All 32 body-mass landmarks are inside foreground.
- All 32 roots land on the lower-exclusive physical support bound.
- Pose height is not physical size: leg flexion, head drop, charge compression and death collapse change silhouette height while the rigid shoulder–croup axis remains calibrated.
- Maximum integer-rounding aspect error is 0.54199%; no deliberate anisotropic transform is used.

Evidence:

- `anchor-review.fragment.json` — SHA-256 `db6c673cacc242872d6f65723834f21b1b4dc0b1071bfac821845e2c68e8cca6`
- `scale-review.fragment.json` — SHA-256 `220bafae2ddb9232b553bb638819e0737b8a810186599f85f4fac74da82d1310`

These are standalone technical fragments, not merged runtime reviews.

## Matte and despill

The raw varying magenta field is recovered by exterior-connected chroma proof, then each complete pose is recomposed over exact opaque `#FF00FF`. Despill is foreground-only. Its primary V64 predicate requires `R>160`, `B>160`, and `G+35<min(R,B)` within 8 px of the edge. A residual matte-hue predicate is limited to the outer 3 px and requires `R,B>=70`, `G+25<min(R,B)` and `|R-B|<=45`. The final independently audited violet-matte gate applies only to existing foreground: `R>90`, `B>70`, `R-G>35`, `B-G>25`, `|R-B|<80`. It is zero on all four final actives; brown/russet pixels outside these predicates are preserved.

| Clip | Foreground pixels corrected | Residual declared spill | Foreground masks changed | Exact-magenta background pixels changed |
|---|---:|---:|---:|---:|
| idle | 32,833 | 0 | 0 | 0 |
| move | 22,431 | 0 | 0 | 0 |
| attack | 29,960 | 0 | 0 | 0 |
| death | 19,787 | 0 | 0 | 0 |
| total | 105,011 | 0 | 0 | 0 |

The contact sheet and enlarged attack sheet were inspected visually after the strengthened pass. No exact or detector-qualified magenta halo remains. Warm russet/pink micro-highlights already authored inside some raw bristles and shoulder marks remain an open art-continuity reserve rather than being silently recolored as background spill.

## Identity and motion review

- 32/32 complete poses face right.
- Natural compact boar anatomy remains readable: one head/jaw, two tusks, four legs, cloven hooves and short tail; no xenomorph, armor, harness or fantasy appendage.
- Idle is a grounded breathing/alert loop.
- Move contains eight distinct quadruped contact phases.
- Attack reads as a low head/tusk drive, contact, follow-through and recovery.
- Death is irreversible and ends laterally collapsed without a camera-facing belly-up roll.

Open art reserve: individual bristle, ear, tusk and restrained warm-mark micro-details are not pixel-identical across four independent ImageGen raws. This does not invalidate the technical source repair, but the candidates remain unaccepted.

## Provenance and events

All four local events use supported kind `generated-and-source-repaired`, retain the exact pre-call ImageGen prompt separately from the current queue contract snapshot, and explicitly set:

- `accepted=false`
- `runtimeIntegrated=false`
- `canonExact=false`

The official read-only `getJobStatus` validator was run against an in-memory state containing only these four events:

- status: `generated`
- generated clips: `4/4`
- recovered prompt gaps: `0`
- issues: `[]`

Event hashes:

- idle: `3e7a1a0bc0dca917e321fe580ac091924814593ba0fac90e97e245d838c2e220`
- move: `72bfccda1c1f216648c51d3145969ac8dd751ff386bbd80d3202e3ba5474a6b9`
- attack: `d1ef79d2d6f2c21b11b6d68b27c76f1a8012f8e448009195061f28874df4dc5c`
- death: `86acb5ae00bfd1320f14307e96108efe4c01e2398d5a748e488880215849a28f`

## Documentary hashes

- processor: `460154204fb004f37e41c3be1d6fe69c61cbedfb0139b0629383b2290bb790be`
- source QA: `e00425b5d36b590c7409c0f3d7096b3eddaed22b63631b4a8f2dd5dfca803af1`
- derived provenance: `68466b1778d5290e864421940d820f40e5fc3a8867601593f805aed8eebde5e6`
- visual review: `b664758b73cc15b9f328b2616928c4d3641fe8742987039416e69f16baea5f5b`
- generation receipts: `560b091473559d85351f4d889671012c116d20050ea11db08dd1b51ea56dd56b`
- production-event validation: `c30bc381b344241e975ac837becc7ebedbdfb06b27a94227e8f0784a4d6f931b`
- artifact validation: `84433038a93817d5051ff8832d76c4bf5a8a6b6ebc128387dd3ee56c4c90b00b`

No automatic acceptance, normalization, runtime integration, STATE/QUEUE/REFERENCES mutation, staging, commit or push was performed.
