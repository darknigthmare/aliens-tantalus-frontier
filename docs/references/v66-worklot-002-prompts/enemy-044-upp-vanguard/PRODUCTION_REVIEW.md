# V66 production review — `enemy-044-upp-vanguard`

Built-in OpenAI ImageGen only. Five active 1774×887 RGB candidates provide 40 authored poses. The project-owned V56 predecessor was present and hash-verified, but `view_image` could not open it because the Windows ACL helper failed; it was not passed to ImageGen. Generation therefore followed the merged `PROJECT_ADAPTATION` design lock only.

## Active candidates

| clip | bytes | SHA-256 | nominal extraction |
|---|---:|---|---|
| idle | 1,732,393 | `ec0f7221abaf39d306b2320bd64fcbacc934ecc2e54d15db45948ce3555b18c3` | pass |
| move r2 | 1,338,529 | `e9024628ff116b6217eb12420d4865797ce2f0ba89cba97470214ade62c4228a` | pass |
| attack | 1,570,052 | `c5ecf9759cb5b2c6e6efe8981945b890d5ba5948fe522b0d65ab903d8e79aee8` | pass |
| death r3 | 1,406,485 | `19100368999fc1177f0906e98ffe4a7c97676e022183ca28d1c6c7bed76d257f` | pass |
| reload | 1,707,855 | `d7c13e81b154e7b90e7f3dcf23d46e64618c2fe9c2c1be8d7697f0ea31bc3e97` | pass |

`death` r3 passes nominal extraction with eight complete poses, zero cell contact and zero ownership transfer. It supersedes r2 technically but remains an unaccepted visual candidate.

## Rejected candidates

- `rejected/move-r1-cell-contact.png` — nominal cell contact; replaced by compact r2.
- `rejected/death-r1-cross-cell.png` — two larger excursions (89 and 308 pixels); replaced by r2.
- `rejected/death-r2-32px-spill.png` — one proven 32-pixel excursion; preserved when zero-spill r3 was promoted.
- Two earlier idle returns were reviewed in memory but not promoted: one produced a zero-byte built-in archive stub, and one was returned under a different result field than the first PTY decoder expected.

## Gate status

- Technical source QA: 40/40 poses recoverable, 5/5 safe extraction, 5/5 nominal extraction.
- Source pixels changed after ImageGen: no.
- `accepted=false`, `runtimeIntegrated=false`, `canonExact=false`.
- No queue/state/reference/global, normalization, runtime or Git write.
- Death r3 used one ImageGen call; free disk after completion: 873.5 MiB.
