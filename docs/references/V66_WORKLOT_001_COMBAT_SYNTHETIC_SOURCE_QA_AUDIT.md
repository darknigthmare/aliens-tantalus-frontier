# V66 Worklot 001 — Combat Synthetic source-board audit

## Result

The five contractual `enemy-042-combat-synthetic` source paths now contain real, non-zero OpenAI ImageGen PNGs: idle, move, attack, death and reload. Each file is 1774 × 887 RGB (exactly 2:1), contains eight row-major subjects in a 4 × 2 layout, faces right in visual review, and preserves the same original faceless dark-armored synthetic and compact carbine. Forty poses are present.

These boards are **source candidates, not accepted production sources**. Strict acceptance remains false because every board fails the required uniform `#FF00FF` matte, inter-clip rigid scale is not exact, two subtle return-pose pairs have weak coarse silhouette separation, and reload needs a final human magazine-causality sign-off. No normalization was run.

## Selected boards

| Clip | Bytes | SHA-256 | C2PA instance | Visual result | Strict defects |
|---|---:|---|---|---|---|
| idle | 1,531,138 | `bcafcba4982f825bb541799ad35576ff6dbed14e72564030ff74da1ec5bf4edf` | `5e5ecd37-80a9-49b0-81a2-3e2073221983` | Eight grounded low-ready states, same actor/weapon | Non-uniform matte; frames 6/8 share a coarse dHash |
| move | 1,424,617 | `8c71ca5f4f08b59609061adb0d1c15da5ef18b6cdfb27f23f8ca6e1a19e90501` | `dbdb4a14-7e73-4e70-a2aa-0797ae763a2f` | Full contact/load/pass/recovery cycle; no cell contact | Non-uniform matte; about 14.7% smaller bbox-height proxy than idle |
| attack | 1,504,956 | `a391d47f1aa9cc6f1f1ab4e77d816e31bdb7ef93f0bd87f1f6912bd3da20cc70` | `246e3200-c33f-47ac-b243-1e153a0eb9b5` | Raise, aim, recoil, settle, ready; no detached effect | Non-uniform matte; pre-fire/settle silhouettes 4/7 share a coarse dHash |
| death | 1,365,748 | `7bc9b41f17dff37933266059a33f9d373b42a6e0b9ae960eeaa8c9a7bf4a264e` | `2b7a9501-1b55-4088-a68d-2ef313cb89c7` | Irreversible fall; weapon retained; restrained white fluid only | Non-uniform matte; upright onset about 13.0% smaller bbox-height proxy than idle |
| reload | 1,580,401 | `11b18e312884f2fc605b5ebae08376b28b421372b79fb354da651a6dddd63a17` | `257d4c74-418f-4ccc-b155-cfd78985f87f` | R3 retains complete carbine across all eight poses and completes the sequence | Non-uniform matte; magazine handoff compact/ambiguous; 54 px boundary clearance versus 55 px target |

All five PNGs contain C2PA v2, `OpenAI Media Service API`, and `trainedAlgorithmicMedia` markers. `canonExact` remains false. The positive design is a fan-made Tantalus adaptation; no official/ licensed bitmap, logo, armor, firearm or comic/game composition was embedded, traced or copied.

## Chroma failure

The canvas background looks magenta, but it is not a chroma-contract matte. Each 1,573,538-pixel board contains only 2–10 pixels exactly equal to `#FF00FF`; corner values and dominant colors vary. Dominant colors range roughly from `[230, 9, 223]` to `[241, 8, 234]`. This is a strict failure, not silently treated as compliant.

## Cell isolation and chronology

The selected boards have no detected subject pixel touching a nominal cell boundary. Combined clean boundary clearance is 66 px idle, 75 px move, 56 px attack, 91 px death and 54 px reload. Thus reload misses the reference target of 55 px by one pixel, although it does not cross a boundary.

Visual row-major review:

- Idle: neutral, servo settle, optic scan, weight shift, alert peak, return, recenter, loop close.
- Move: near contact/load, far pass/reach/contact/load, near pass/recovery.
- Attack: low-ready, shoulder, align, pre-fire, shot/recoil, peak recoil, settle, low-ready.
- Death: lethal hit, recoil, knee loss, descent, support failure, impact, settle, terminal body.
- Reload R3: ready, reach, remove, stow, replacement handoff with full gun visible, seat, action, ready.

Reload R1 and R2 were rejected because the entire carbine disappeared in frame 5. R3 fixes that topology failure, but the frame-4/frame-5 old-to-new magazine handoff is visually compressed and remains a manual approval point.

## Rejected and unavailable attempts

| File | Reason |
|---|---|
| `rejected/move-r1-boundary-crossing.png` | Frame-4 rear foot touched/crossed the top-row cell 3/4 boundary. |
| `rejected/reload-r1-missing-carbine-frame5.png` | Entire carbine absent in frame 5. |
| `rejected/reload-r2-missing-carbine-frame5.png` | Entire carbine absent in frame 5; ambiguous upright magazine geometry in frame 6. |
| `rejected/idle-r2-zero-byte-placeholder.unavailable` | Failed first non-TTY persistence experiment; retained as a zero-byte unavailable receipt, never used as an active source. |

The first idle render was also visually returned as a data URL but not persisted before the backend placeholder proved empty. The receipts state this rather than fabricating a source path or hash.

## Reference and copyright boundary

The project-owned V47.1 predecessor was locally audited for identity, charcoal/gunmetal palette and broad equipment grammar only. Its bytes were not transmitted: the filesystem/privacy guard refused the attachment, and no workaround was attempted. Exact text prompts carry only the locally recorded traits. External official/licensed material remained study-only archetype context. Combat Synthetic is not presented as a published model, and `canonExact=false` remains immutable for this worklot.

## Scope and next gates

This pass did not edit the global reference registry, queue, state, scale registry, anchor registry, metadata, normalized assets, runtime, V65, profiles 039–041, or Git. Disk free space after generation was 528.3 MiB, above the instructed 450 MiB stop threshold.

Separate authorization is still required for matte remediation/normalization, rigid-landmark scale calibration, final reload handoff approval and runtime integration.
