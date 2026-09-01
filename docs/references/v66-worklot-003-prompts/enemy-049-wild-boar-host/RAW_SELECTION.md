# enemy-049-wild-boar-host — raw ImageGen selection

Scope: raw OpenAI ImageGen captures only. No crop, resize, chroma replacement, alpha extraction, recomposition, normalization, active clip, queue/state/reference edit or runtime integration was performed.

Reference policy: the V56 project-owned identity predecessors and the V66 merged design lock were inspected. The selected captures were generated from text only, as original fan-made/project bitmaps with `canonExact=false`; no licensed sheet was supplied as an image input and no 1:1 claim is made.

## Selection

| Clip | Selected raw | Selection reason |
| --- | --- | --- |
| idle | `idle-r3-imagegen.png` | Fresh text-only generation; exact visual 4x2 count, eight complete right-facing boars, positive cell margins, no motion/accent marks. |
| move | `move-r2-imagegen.png` | R2 reduces the figures and restores positive gutters around every conceptual cell while retaining the natural right-facing boar run cycle. |
| attack | `attack-r2-imagegen.png` | R2 removes the r1 boundary contacts and oversized upright shove; all eight whole poses remain enclosed and right-facing. |
| death | `death-r2-imagegen.png` | R2 removes r1 boundary contacts and the belly-up camera-facing roll; the irreversible fall remains in fixed right-facing gameplay view. |

## Preserved immutable variants

| Raw | Dimensions | SHA-256 | Review |
| --- | ---: | --- | --- |
| `idle-r1-imagegen.png` | 1402x1122 | `a7d6db34590da5591efd0c5d7cf4450423e7cca20e5b0b0f1b3178d898bc47b2` | Not selected. The reference-conditioned call inherited the V56 canvas size, which is not evenly divisible into four columns, and fresh-pixel independence cannot be certified. Preserved unchanged. |
| `idle-r2-imagegen.png` | 1536x1024 | `2c8983fe2b43093dc7c39addd04b1d650f9d5fec37717615e73ad1effc0e0d9c` | Not selected. Fresh text-only 4x2, but two small ear-flick accent strokes remain and the figures are larger than the other corrected sheets. Preserved unchanged. |
| `idle-r3-imagegen.png` | 1536x1024 | `f11eca6f158621e82efe2e06da818c55d0afb366baf5a47f6d14287eb20969c6` | Selected. |
| `move-r1-imagegen.png` | 1536x1024 | `6dbbbc4ba436ed14f912798891440b8423cb2c05d08b55832ec341395b36e557` | Not selected. Foreground reached internal quarter-cell boundaries. Preserved unchanged. |
| `move-r2-imagegen.png` | 1536x1024 | `87b5652d237290adb6e207b9839246633d38207c9aa94e16d9d834d6bcc2f8d9` | Selected. |
| `attack-r1-imagegen.png` | 1536x1024 | `186836a49ca3158a966eae6f36ddf69381ce0a75d663ddc78e18f9b7673059db` | Not selected. Several silhouettes reached internal cell boundaries and the sixth pose reared too vertically. Preserved unchanged. |
| `attack-r2-imagegen.png` | 1536x1024 | `61d2e63559c55833ad9978afebacc379184552c89d2253bbc470b04dd46f14f4` | Selected. |
| `death-r1-imagegen.png` | 1536x1024 | `afc693156283bbbc01512fe29912e05b13bb884e75c95e5cc04d7fb704425a5f` | Not selected. Several silhouettes reached internal cell boundaries and the fifth pose rolled belly-up toward camera. Preserved unchanged. |
| `death-r2-imagegen.png` | 1536x1024 | `6f18d3e7e7a4342969793d9c068ab59807f56294b33470011ad6d8d6c77e0a95` | Selected. |

## Visual and technical review of selected raws

- Visual count/layout: pass for four sheets; exactly eight figures in a visible 4x2 row-major arrangement, no ninth pose, no labels, grid, UI, logo or watermark.
- Identity/anatomy: visual pass; living natural compact wild boar, two tusks, four mammalian legs, cloven hooves, short tail, earthy organic bristles; no xenomorph, biomechanical, armored, domestic-pig or fantasy-monster cue.
- Direction/crop: visual pass; all 32 selected poses face right and remain wholly inside the canvas. Robust foreground checks retain positive internal margins for every selected cell.
- Clip semantics: visual pass for grounded idle, alternating locomotion, tusk/head attack and irreversible death.
- Source dimensions/mode: all four selected raws are 1536x1024 RGB PNG. They are untouched ImageGen outputs, not the later 1774x887 derived source contract.
- Residual scale caveat: visual identity is consistent, but ImageGen did not hold a mathematically identical pixel body length across the four independent raws. This remains pending later scale/anchor review; no scale correction was applied here.
- Chroma uniformity: **fail on every raw**. Despite the prompt, ImageGen painted a near-magenta field with tonal variation instead of a single exact `#FF00FF` value. Selected pure-`#FF00FF` pixel counts are idle r3 `71`, move r2 `12`, attack r2 `28`, death r2 `21` out of 1,572,864 pixels; corner RGB values also differ. No chroma replacement or cleanup was performed because this task explicitly forbids processing/recomposition.

These are selected raw candidates only, not accepted or runtime-ready production sources.
