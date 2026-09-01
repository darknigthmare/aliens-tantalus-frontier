# enemy-050-korari-stalker — raw OpenAI ImageGen selection

Scope: raw OpenAI ImageGen captures only. No crop, resize, chroma replacement, alpha extraction, recomposition, normalization, active clip, queue/state/reference edit, runtime integration, stage, commit, or other Git mutation was performed.

Reference policy: the exact merged V66 profile lock, the four current queue prompts, the profile-local audit, and the project-owned V56 Korari Stalker images were read before generation. The V56 identity reference was visually reviewed and supplied to ImageGen from memory-backed conversation context after direct local-path attachment was blocked by the Windows read ACL boundary. All returned poses are new original fan-made/project imagery with `canonExact=false`; no source pixels or licensed sheet were copied, and no 1:1 claim is made.

## Selection

| Clip | Selected raw | Selection reason |
| --- | --- | --- |
| idle | `idle-r2-imagegen.png` | Persisted retry; exact visual 4x2 count, eight complete right-facing alert/breathing poses, stable anatomy and positive gutters. |
| move | `move-r1-imagegen.png` | Exact visual 4x2 count with a readable alternating low stalk/run cycle, complete limbs and tail, stable right-facing identity. |
| attack | `attack-r1-imagegen.png` | Exact visual 4x2 count with compress, coil, pounce, bite, follow-through and recovery phases; complete right-facing subject. |
| death | `death-r2-imagegen.png` | Targeted retry removes the detached debris in r1 while retaining a clear right-facing recoil, collapse and terminal settle. |

## Attempts and immutable raws

| Attempt | Dimensions | Bytes | SHA-256 | Review |
| --- | ---: | ---: | --- | --- |
| `idle-r1-unavailable` | unavailable | `0` | unavailable | Not selectable. The returned 4x2 sheet was visually coherent, but its data URL was not persisted before the tool result was released; no raw file, dimensions or hash exist. |
| `idle-r2-imagegen.png` | 1610x977 | `1,262,427` | `2e159f87cbfd70d41dff2a8837694775a970bd4d5e0b843d1bf8f2d00b6c4023` | Selected. |
| `move-r1-imagegen.png` | 1672x941 | `1,310,078` | `d24f91d853dbf47e8447d39ac95b07754cca68b93b9b6b22b04434de1ad64837` | Selected. |
| `attack-r1-imagegen.png` | 1536x1024 | `1,531,014` | `a00cbad3a59073b0bbd39fbd6016b3f59d952ff1c683b6388201cc83449064a4` | Selected. |
| `death-r1-imagegen.png` | 1683x935 | `1,258,805` | `a2be74ae0dd8750066a6076b4adecb0081939a793f3c5d9a47b9afbd63b5b59b` | Rejected but preserved unchanged. Frames 2–4 contain detached floating chips/particles around the head and forepaw. |
| `death-r2-imagegen.png` | 1774x887 | `1,292,494` | `e273e6fafa9b06989e5bd4ad4af0eb848e822dc30b54de4b071b5ffbc0eeee0a` | Selected. The r1 debris defect is absent. |

## Exact prompts used

Each file contains the current queue prompt verbatim plus the exact ImageGen layout, identity, chronology and exclusion instructions used for that attempt. The four stored queue prompt hashes were independently recomputed with `SHA256(JSON.stringify(prompt))` and matched.

| Attempt | Exact prompt file | Prompt-file SHA-256 |
| --- | --- | --- |
| idle r1 | `idle-r1-imagegen.txt` | `bcf335b66c58a6362529726ca045ef29955844627a1040a81b7fefc62790be8f` |
| idle r2 | `idle-r2-imagegen.txt` | `bcf335b66c58a6362529726ca045ef29955844627a1040a81b7fefc62790be8f` |
| move r1 | `move-r1-imagegen.txt` | `9b8989466a78df57e7404294670a04822fbf35920e0ae8a49191209f88d7964e` |
| attack r1 | `attack-r1-imagegen.txt` | `41d23e77048c5c9a22a8993c59857ce1235110bd4f1434ff270a74414c1a5ffc` |
| death r1 | `death-r1-imagegen.txt` | `fb261490cd0e3cbff35c2469c033d43287100dd880a36509effd66d5fe7a003f` |
| death r2 | `death-r2-imagegen.txt` | `160f43090d3d91aa0967f31901d424b228cf47e7f7a36a1e77ccf6d67f73b13c` |

## Visual and technical review

- Layout/count: visual pass for the four selections; each sheet reads as exactly four columns by two rows with eight distinct chronological poses, one whole subject per conceptual cell, no text, UI, grid, logo or scenery.
- Identity/anatomy: visual pass; low original forest quadruped, wedge head with natural lateral eye/sensors, one jaw, four supple limbs, charcoal/moss bark-pattern hide, sparse cyan flank marks and one flexible non-bladed tail. No xenomorph, Yautja, technological or borrowed-franchise anatomy.
- Direction/crop: visual pass; all 32 selected poses face gameplay RIGHT and remain fully visible with clear gutters.
- Native source: all five persisted raws are untouched opaque RGB PNG outputs. Native dimensions vary and no output was resized.
- Chroma uniformity: **numeric fail on every selected raw**. ImageGen produced a visually flat near-magenta field with tonal variation rather than one exact `#FF00FF` value. Exact pure-`#FF00FF` counts are idle r2 `18 / 1,572,970`, move r1 `20 / 1,573,352`, attack r1 `0 / 1,572,864`, and death r2 `19 / 1,573,538`. No cleanup was applied.
- Scale handoff: the future processor must calibrate perceived creature scale across clips because the independent raws use different native canvas dimensions and slightly different body occupancy.
- Attack handoff: after cell extraction, re-check the row-major transition from pounce and bite into follow-through and recovery before promoting the clip.

These are selected raw candidates only, not processed or runtime-ready production sources. Machine-readable details are in `raw-generation-review.json` beside this file.
