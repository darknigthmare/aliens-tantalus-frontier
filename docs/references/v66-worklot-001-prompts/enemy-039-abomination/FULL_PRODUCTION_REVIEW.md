# V66 enemy-039-abomination — production review

## Scope and status

- Profile: `enemy-039-abomination`
- Contract: four source boards (`idle`, `move`, `attack`, `death`), eight poses arranged 4×2, strict right-facing side view.
- Art status: original fan-made adaptation generated with OpenAI ImageGen; no official sprite was copied.
- Integration status: source candidates only. `accepted`, `runtimeIntegrated`, and `canonExact` remain false in the receipts.
- Exclusions respected: no V65 asset, profile 040–042 asset, or global queue/state/reference/scale/anchor manifest was changed.

## Active source boards

| State | Dimensions | SHA-256 | Bytes | Technical result |
| --- | ---: | --- | ---: | --- |
| `idle.png` | 1774×887 | `0cea773831438d31343e338f5341b0293b0908b65a190bd02dc94326ff3c423e` | 1,083,105 | 8/8 poses isolated; exact opaque `#FF00FF`; local support root y=428 |
| `move.png` | 1774×887 | `cc85915ba81c5a1346f7710e4eeafe9df8023c37765ba7464219bae359b3a8b1` | 1,256,879 | 8/8 poses isolated; exact opaque `#FF00FF`; local support root y=428 |
| `attack.png` | 1774×887 | `6866ee637342b1d0ed0f8184cfc4e7433254228ac5f0d9010cc9de7a3cc94caf` | 1,002,555 | 8/8 poses isolated; exact opaque `#FF00FF`; local support root y=428; no painted effects |
| `death.png` | 1774×887 | `ec99381b0a967b6bc7099e95476d8b6529e01418d1eeb58073b7e2d02c204d44` | 805,162 | 8/8 poses isolated; exact opaque `#FF00FF`; local support root y=428 |

All four PNGs are RGBA and fully opaque by contract. Every cell owns one complete pose without cross-cell contact. The deterministic repair preserved foreground pixels and only normalized the matte plus translated components inside their cells; it did not redraw or rescale the generated artwork.

## Generation and repair lineage

### Idle

- Selected ImageGen raw candidate: `rejected/derived/idle-r3-imagegen-raw-selected.png`
  - SHA-256: `ebe65479d2411ed6f3799d61d191ae782166d38d1a5cc58bf7ff3fd9843196d3`
- Deterministic matte normalization: 1,186,866 background pixels normalized to exact `#FF00FF`.
- Lossless grid recomposition: 374,028 foreground pixels preserved; no component ownership transfer; all roots aligned to y=428.
- Derived recomposition: `rejected/derived/idle-r3-flat-recomposed.png`, identical to the active board.

### Move

- Selected ImageGen raw candidate: `rejected/derived/move-r1-imagegen-raw-candidate.png`
  - SHA-256: `94e5dd4e0de5c6ec978a4c4ada72bd85273f55132dcbc2d1849dd55f8d513fa9`
- Lossless grid recomposition: 465,327 foreground pixels preserved; 6 pixels reassigned to frame 2 and 428 pixels to frame 4 from neighboring nominal cells; all roots aligned to y=428.
- Derived recomposition: `rejected/derived/move-r1-flat-recomposed.png`, identical to the active board.

### Attack

- Rejected first candidate: `rejected/attack-r1-speed-lines.png`
  - SHA-256: `71ba751d906735022edd7d19c88ba0248bfcce909ad9658b3001fec00839d5ad`
  - Rejection reason: prohibited painted purple speed lines behind the impact pose.
- Selected targeted-edit raw candidate: `rejected/derived/attack-r2-imagegen-raw-selected.png`
  - SHA-256: `7e7666c729cdf2385572faf050272ec61fa24fa68b0599e3acaa1df41a81c92e`
- Deterministic matte normalization: 1,197,466 background pixels normalized to exact `#FF00FF`.
- Lossless grid recomposition: 362,337 foreground pixels preserved; 1,293 pixels reassigned to frame 3 and 80 pixels to frame 4; all roots aligned to y=428.
- Derived recomposition: `rejected/derived/attack-r2-flat-recomposed.png`, identical to the active board.

### Death

- Selected ImageGen raw candidate: `rejected/derived/death-r1-imagegen-raw-candidate.png`
  - SHA-256: `8f5e40527be6944c1bd934af0d2f10c935edc762698fa950fdb04cbfd728650b`
- Deterministic matte normalization: 1,264,859 background pixels normalized to exact `#FF00FF`.
- Lossless grid recomposition: 296,056 foreground pixels preserved; no component ownership transfer; all roots aligned to y=428.
- Derived recomposition: `rejected/derived/death-r1-flat-recomposed.png`, identical to the active board.

## Artistic review

- Identity is coherent across the four boards: asymmetrical hunch, plated charcoal-violet mass, swollen forearm/knuckle growths, short legs, and heavy low center of gravity remain readable.
- Orientation is consistently right-facing. No mirrored left-facing pose was retained.
- `move` communicates a heavy knuckle-supported trudge without relying on effects.
- `attack` progresses through brace, wind-up, raised growth slam, impact/follow-through, and recovery. The selected r2 board contains no painted speed line, glow, projectile, or separate impact effect.
- `death` progresses from lethal recoil through loss of balance, torso impact, and a settled corpse while keeping the body and growths connected.

## Remaining reservations

- `idle`: the far arm is strongly occluded in several poses. The second fist growth remains visible, but shoulder-to-elbow-to-fist continuity is not always unambiguous at a glance.
- `death`: the first pose is high and reared, so it can read as post-impact recoil rather than the very first neutral instant of the death transition.
- These are artistic reservations, not grid or file-contract failures. They are recorded instead of silently marking the profile as production-accepted.

## Prompt and receipt evidence

- Prompts: `idle.txt`, `move.txt`, `attack.txt`, selected attack edit `attack-r2.txt`, and `death.txt`.
- Receipts: one `*.production-event.json` file per active state.
- The receipts retain the raw candidate hashes, deterministic repair details, rejected attack-r1 evidence, active source hashes, and false acceptance/runtime/canon flags.
