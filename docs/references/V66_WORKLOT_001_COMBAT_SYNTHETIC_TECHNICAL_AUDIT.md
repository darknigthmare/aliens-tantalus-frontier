# V66 Worklot 001 — Combat Synthetic technical pre-integration audit

## Decision

`enemy-042-combat-synthetic` is **technically reviewed but not accepted and not integration-ready**. Five real source candidates and forty poses exist, but automatic art acceptance remains false. The material inter-clip scale defects in `move` and `death`, the non-uniform chroma matte on every board, the reload magazine-handoff ambiguity, and the reload one-pixel clearance shortfall remain open gates.

This audit creates standalone evidence and merge-compatible candidate fragments only. It does not modify a global reference, queue, state, scale registry, anchor registry, metadata, normalized asset, runtime file, V65, another profile or Git.

## Source identity and immutable provenance

| Clip | Source SHA-256 | C2PA instance | Source geometry |
|---|---|---|---|
| idle | `bcafcba4982f825bb541799ad35576ff6dbed14e72564030ff74da1ec5bf4edf` | `5e5ecd37-80a9-49b0-81a2-3e2073221983` | 1774 × 887 RGB, 4 × 2 |
| move | `8c71ca5f4f08b59609061adb0d1c15da5ef18b6cdfb27f23f8ca6e1a19e90501` | `dbdb4a14-7e73-4e70-a2aa-0797ae763a2f` | 1774 × 887 RGB, 4 × 2 |
| attack | `a391d47f1aa9cc6f1f1ab4e77d816e31bdb7ef93f0bd87f1f6912bd3da20cc70` | `246e3200-c33f-47ac-b243-1e153a0eb9b5` | 1774 × 887 RGB, 4 × 2 |
| death | `7bc9b41f17dff37933266059a33f9d373b42a6e0b9ae960eeaa8c9a7bf4a264e` | `2b7a9501-1b55-4088-a68d-2ef313cb89c7` | 1774 × 887 RGB, 4 × 2 |
| reload R3 | `11b18e312884f2fc605b5ebae08376b28b421372b79fb354da651a6dddd63a17` | `257d4c74-418f-4ccc-b155-cfd78985f87f` | 1774 × 887 RGB, 4 × 2 |

The source hashes still match the selected-generation receipts in `docs/references/v66-worklot-001-events/enemy-042-combat-synthetic/generation-events.json`. That receipt contains ten generation attempts and the exact prompt/source hashes. Three rejected real candidates remain under the profile `rejected/` directory; the zero-byte idle persistence receipt remains `.unavailable` and is not an active source.

All selected PNGs carry C2PA v2 markers from OpenAI Media Service API with a `trainedAlgorithmicMedia` assertion. The work is a project-authored Tantalus fan adaptation informed only by the broad Alien synthetic archetype. No official bitmap, model render, logo, armor, firearm, comic cover or game composition was copied, embedded or traced. `canonExact=false` is unchanged.

## Physical anchors — 40 of 40

The standalone `anchor-review.fragment.json` records every pose in local nominal-source-cell coordinates. For each pose:

- the landmark is the reviewed pelvis/proximal hip-ring centre;
- anchor x is the body root, never the muzzle, magazine, optic or farthest limb;
- anchor y is the current physical support plane and equals the exclusive lower `sourceBounds` coordinate;
- all 40 landmarks lie inside the detected foreground bounds;
- all 40 anchor/support checks pass the declared extraction convention.

Uncertainty is ±8 px for most grounded poses, ±9 px for locomotion/reload manipulation, ±10–12 px through death onset/impact and ±13–14 px for the two terminal death poses. In death frames 5–8, x remains under the collapsed pelvis/torso mass even when a different body or weapon point supplies the lowest occupied scanline. This is intentional and prevents the corpse width or muzzle from redefining the root.

The root-registered GIFs keep native source scale and align only the reviewed anchor. They expose row-to-row source placement changes without silently normalizing them. A future scale operation must recompute and re-review every anchor rather than multiplying these values blindly.

## Rigid inter-clip scale

Total bounding boxes were rejected as a scale metric because weapon reach, stride and corpse width dominate them. The audit instead measures an uninterrupted lateral chord through the same armored cranial shell on three comparable, head-readable poses per clip. The right endpoint is exclusive, so the measured length is the exact occupied-pixel interval. Values are subject to the uncertainty shown in the fragment, but the within-clip consistency makes the two largest defects material.

| Clip | Three rigid proxy chords | Median | Observed rigid size vs idle | Candidate correction to idle | Decision |
|---|---:|---:|---:|---:|---|
| idle | 73, 74, 72 px | 73 px | baseline | 1.000000 | Source baseline only |
| move | 60, 61, 60 px | 60 px | −17.808% | ×1.216667 / +21.6667% | Material underscale; blocking |
| attack | 67, 67, 67 px | 67 px | −8.219% | ×1.089552 / +8.9552% | Candidate only; higher pose/occlusion uncertainty |
| death | 63, 64, 61 px | 63 px | −13.699% | ×1.158730 / +15.8730% | Material onset underscale; blocking |
| reload | 70, 70, 70 px | 70 px | −4.110% | ×1.042857 / +4.2857% | Inside combined uncertainty; do not auto-correct |

The `death` result uses frames 1–3 while the head is still readable; it does not use prone corpse width. Therefore its discrepancy is independent of the collapse silhouette. The `move` result also repeats across both grid rows, so it is not a single-pose anomaly. Those two corrections are evidence-backed candidates, not applied values. A human reviewer must choose regeneration versus controlled normalization, then recheck gutters, anchors, weapon line weight and palette. Attack and reload factors must not be applied automatically.

## Orientation, weapon continuity and anatomy

Generation-result visual review found one consistent right-facing armored synthetic and one compact original carbine in every selected pose. Deterministic support evidence adds the following:

- 40/40 poses have a strictly larger rightward than leftward foreground extent from the reviewed body root;
- 40/40 poses preserve a complete subject inside its nominal cell without boundary contact;
- the static 5 × 8 contact overlay and five anchor-registered playbacks account for all forty source poses;
- no extra or missing major limb was identified in the source visual review, but occluded terminal-death and reload-hand positions retain normal generative-art uncertainty;
- the selected reload R3 keeps the complete carbine in all eight frames, fixing the R1/R2 weapon-disappearance defect.

The rightward-extent test is a corroborating silhouette proxy, not a semantic weapon detector and not a substitute for human review. Broad stock/receiver/barrel identity remains consistent, but the old-to-replacement magazine handoff across reload frames 4–5 is visually compressed. It remains a manual art-approval point rather than a pass inferred from pixels.

## Playback and chronology

All clips expose eight frames in strict row-major order. Technical playback metadata follows the queue snapshot:

| Clip | Contract | Evidence playback | Chronology result |
|---|---|---|---|
| idle | 6 fps, loop | 8-frame GIF, loop extension present, 160 ms GIF ticks | grounded settle/scan/return/loop closure present; subtle poses 6/8 remain coarse-dHash similar |
| move | 12 fps, loop | 8-frame GIF, loop extension present, 80 ms GIF ticks | contact/load/pass/recovery sequence present; scale defect blocks integration |
| attack | 12 fps, one-shot | 8-frame GIF, no loop extension, 80 ms GIF ticks | raise/aim/fire/recoil/settle/ready present; poses 4/7 remain coarse-dHash similar |
| death | 10 fps, one-shot | 8-frame GIF, no loop extension, 100 ms | irreversible impact/fall/settle/terminal body present; scale defect blocks integration |
| reload | 10 fps, one-shot | 8-frame GIF, no loop extension, 100 ms | ready/reach/remove/stow-or-handoff/seat/action/ready present; handoff still ambiguous |

GIF delay is quantized to 10 ms, so the 6 fps and 12 fps review files display at 160 ms and 80 ms respectively. They are review derivatives, not runtime timing assets; the authoritative contract remains 6/12/10 fps.

## Existing strict source defects retained

- Every board fails the required perfectly uniform opaque `#FF00FF` matte. Only 2–10 pixels per board are exact `#FF00FF`; the generated magenta field varies.
- Reload combined boundary clearance is 54 px against the 55 px target, although no subject pixel touches a cell boundary.
- Idle frames 6/8 and attack frames 4/7 share coarse dHashes despite not being exact duplicate crops.
- Reload magazine causality needs explicit human sign-off.
- The technical overlay renderer and all derivatives are read-only with respect to source PNGs. Source hashes before and after the audit are unchanged.

## Evidence and merge boundary

Standalone merge candidates:

- `docs/references/v66-worklot-001-combat-synthetic-review/enemy-042-combat-synthetic/anchor-review.fragment.json`
- `docs/references/v66-worklot-001-combat-synthetic-review/enemy-042-combat-synthetic/scale-review.fragment.json`

Technical evidence includes five coordinate overlays, five 40-anchor overlays, five rigid-scale overlays, five eight-frame root-registered playbacks and one 5 × 8 orientation/weapon/root contact. `render-combat-synthetic-technical-review.py` reproduces the latter sixteen files; `render-combat-synthetic-overlays.py` reproduces the coordinate overlays. A separate receipt JSON records hashes, sizes and playback metadata.

The current task environment could validate every derivative structurally and pixel-wise but could not open local images through the dedicated preview bridge because Windows deny-read ACL injection failed. The source boards themselves were visually reviewed at generation time, and final human overlay/art sign-off therefore remains required. This limitation is another reason the audit does not accept the art.

## Required next gates

1. Human decision for `move` and `death`: regenerate at idle scale or explicitly authorize controlled normalization using the candidate factors.
2. Remediate the five chroma mattes without altering character pixels, then re-run isolation and hash/provenance accounting.
3. Human sign-off or regeneration of reload R3 magazine handoff; preserve the complete carbine in frame 5.
4. After any scale/matte change, recompute all 40 physical anchors, cell clearance and playback evidence.
5. Only then may a parent explicitly merge the standalone fragments and consider acceptance/runtime integration.

Current state: `accepted=false`, `canonExact=false`, `normalizationRun=false`, `runtimeIntegrated=false`, `globalMerged=false`, `gitTouched=false`.
