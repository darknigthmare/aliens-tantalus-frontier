# V66 worklot 001 — Pathogen Mimic 040 source QA

Profile: `enemy-040-pathogen-mimic`
Batch: `batch-003` / `worklot-001`
Review date: `2026-09-01`
Scope: generated sources, prompts, receipts and source-only QA. No global reference/queue/state edit, normalization, runtime integration, Git commit or acceptance.

## Outcome

Four active OpenAI ImageGen boards and one rejected attack candidate are persisted. Every board is an original Tantalus adaptation derived from the local design lock and project-owned V54 palette/material reference; no official bitmap was copied or embedded. All observed subjects face gameplay right and retain the intended human-derived two-arm/two-leg, tail-less anatomy.

The profile is **not accepted**. `idle` and `death` pass nominal extraction. `move` and selected `attack` remain blocked by the strict source contract because the fourth pose in their first row starts 13 pixels inside the preceding nominal cell. The existing short-spill ownership probe can recover each complete pose with source pixels unchanged, but that does not turn a boundary-touching source into a compliant authored board. All four RGB mattes are keyable and reach every outer edge, but none is the requested perfectly uniform literal `#FF00FF`.

## Persisted sources

| Clip | Bytes | SHA-256 | 2:1 / 4×2 / poses | Nominal extraction | Result |
| --- | ---: | --- | --- | --- | --- |
| `idle` | 1,455,102 | `7684e8c77b853415f41db6d50212df3def2efb7528a5fb4b6a7ccfb2715c7b3b` | 1774×887 RGB; 8/8 distinct | pass | Candidate only; nonuniform magenta matte. |
| `move` | 1,450,001 | `542b68e5a6eb56db8930b496d085581d548c2faffbaf374d7e22cb9306fe5b1e` | 1774×887 RGB; 8/8 distinct | blocked | 237 pixels of pose 4 spill left; safe ownership recovery passes. |
| `attack` | 1,426,610 | `6d075da44869957bd0722b0a987fafe8cb4e5ee6786b33038333a502a39e63b5` | 1774×887 RGB; 8/8 distinct | blocked | 300 pixels of pose 4 spill left; safe ownership recovery passes; bite contact still needs playback review. |
| `death` | 1,325,649 | `a8589cb3cf50648c35180ab32730cae27d210de936ca7b4461b0e90563529fcd` | 1774×887 RGB; 8/8 distinct | pass | Candidate only; nonuniform magenta matte. |

Rejected source: `rejected/attack-r1-cross-cell.png`, 1,457,033 bytes, SHA-256 `8b2e1812c335ef33f146eceaafbe3158e59aad8d79512324118efc9d7474c5f0`. It has boundary contacts in zero-based frames 2, 3, 4, 5 and 6; global ownership is ambiguous, so it cannot be imported safely.

The five persisted PNGs total 7,114,395 bytes. A three-byte writer diagnostic created during the data-URL persistence workaround was confirmed as agent-owned and removed with coordinator authorization; it is not part of the deliverable.

## Technical checks

- Dimensions and grid: all five persisted boards are exact 2:1, 1774×887, with an invisible 4×2 layout.
- Alpha: all are opaque RGB (`alpha extrema 255..255` after RGBA conversion); no native transparency is claimed.
- Pose count: the four active boards each yield eight extracted frames and eight distinct extracted pose hashes when ownership-safe extraction is allowed.
- Outer matte: border-connected magenta reaches 100% of every outer edge; active matte ratios are `0.883648`, `0.888753`, `0.889651`, `0.904720` for idle/move/attack/death.
- Literal matte contract: literal pure `#FF00FF` ratio is zero in all four active boards. This is recorded as a source blocker, not silently corrected.
- Boundary ownership: move transfer is 237/21,619 pixels (`ownerShare=0.989037`); attack transfer is 300/18,870 (`ownerShare=0.984102`). Both preserve source pixel values under the existing rule, but default extraction correctly stays blocked.
- Visual direction/topology: 32/32 active poses were visually checked; no left-facing main subject, tail, extra head, xenomorph dome, dorsal tubes, carried weapon, armor or clothing was observed.
- Animation read: idle breath/alert and death collapse are clear; move reads low and dragging; attack reads coil/slash/recovery, while the short bite/contact needs an aligned playback review.

## Provenance

The exact five prompts and five content-addressed receipts are stored in `docs/references/v66-worklot-001-prompts/enemy-040-pathogen-mimic/`. The provider returned data URLs and no generation identifiers, so each receipt uses the persisted PNG SHA-256 as local generation provenance. The local design-lock hash is `efdab45052da1d2a7847a3104c80fadf68da9a00b1d2fae42466d04a9c143b86`.

Eight successful ImageGen renders occurred during the production attempt: five persisted candidates, two early visual drafts and one render lost before persistence when the first stdin writer closed. One additional referenced-path call failed before generation because of the Windows ACL helper. Only the five persisted files have source receipts; no hash or acceptance is invented for transient previews.

## Remaining blockers

1. Regenerate or explicitly repair `move` and `attack` so every foreground/AA pixel is wholly inside its nominal cell; do not treat safe extraction as authored-source compliance.
2. Replace or deterministically repair all four mattes to true alpha or uniform literal `#FF00FF`, with source-repair provenance and subject pixels proven unchanged.
3. Measure rigid thoracic landmarks across clips; do not derive scale from claws, sacs, overall bounds or corpse width.
4. Review all 32 pelvis/body roots, aligned animation playback and the attack bite/contact readability.
5. Only then normalize, render previews, perform final visual acceptance and consider runtime integration. `canonExact` must remain false.

Machine-readable evidence: `assets/openai/sprites/frames/v66/batch-003/enemy-040-pathogen-mimic/source-review.json`.
