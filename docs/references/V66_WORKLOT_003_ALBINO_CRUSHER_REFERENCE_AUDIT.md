# V66 Worklot 003 — Albino Crusher reference audit

## Scope and decision

- Profile: `enemy-061-albino-crusher`
- Queue identity: **Albino Crusher** / `Crusher` / `Albino` / `xenomorph` / `siege` / `systemic-variant` / `siege` / `batch-004` / ordinal `60`
- Classification: `PROJECT_ADAPTATION`
- Canon fidelity claim: `canonExact=false`; no official or 1:1 Albino Crusher claim is allowed.
- Reference fragment: `docs/references/V66_WORKLOT_003_ALBINO_CRUSHER_REFERENCE.json`
- Fragment SHA-256: `3885f1514329db154a722ae765bf8e005ba3a1094bdc17881db1a8ed3cd77104`
- Merge target: `docs/references/V66_ENEMY_BATCH_REFERENCES.json`

The reviewed V66 `enemy-009-crusher` identity lock is the positive anatomy authority. The albino modifier is limited to newly authored pigment and material response; it is not permission to recolor the existing sheets, copy licensed pixels, change anatomy or claim a canonical albino model.

## Authority chain

1. `enemy-009-crusher` reviewed base identity lock — SHA-256 `24bf78b7884afb2be608505e95431551fef44d37a7e566a337a699746548c157` — controls the low quadrupedal mass, broad shield, four weight-bearing limbs and full tail.
2. The [official Gearbox Aliens: Colonial Marines trailer page](https://www.gearboxsoftware.com/2013/01/aliens-colonial-marines-trailer/) is a primary developer continuity anchor.
3. The [licensed Steam product listing](https://store.steampowered.com/app/49540/Aliens_Colonial_Marines_Collection/?l=english) anchors the released source game. It is not used as an anatomical turntable.
4. The local licensed-product study image already governed by the base lock and the V66 base sheets are hashed predecessor evidence. Their pixels cannot be copied into future art.

No reviewed primary or licensed source establishes an Albino Crusher. The honest treatment is therefore an original Tantalus Frontier material adaptation derived from the reviewed base identity lock.

## Locked anatomy and material

- Huge low quadruped with a broad flared armored head shield, massive forequarters, shorter hindquarters, exactly four weight-bearing limbs and one continuous tail.
- Warm bone-ivory, pearl gray and pale beige chitin with cool recesses, restrained rose-taupe membranes, dark mouth cavity and moist highlights.
- Never flat white, luminous, crystalline, icy or produced by an automatic color filter.
- No Queen/Praetorian crown, chest arms, humanoid biped, horn, carried shield, industrial armor, eyes or clothing.
- Strict right-facing gameplay profile, inherited thorax/support-floor root and invariant scale across all clips.

## Exact queue contract

The queue uses the `siege` animation family and therefore requires **five** boards. Omitting `charge` would make the fragment incomplete.

| Clip | Source path | Prompt SHA-256 | FPS | Loop |
|---|---|---|---:|:---:|
| `idle` | `assets/openai/sprites/frames/v66/batch-004/enemy-061-albino-crusher/idle.png` | `e8d5c3a36ae5889bea606e17029362a504f2a2bd577e8c65f12684012f4c0aca` | 6 | yes |
| `move` | `assets/openai/sprites/frames/v66/batch-004/enemy-061-albino-crusher/move.png` | `7990b3322395aa49aa7f6e4a95aeb45d8802be2224c95d21ac4a825cb37e4115` | 12 | yes |
| `attack` | `assets/openai/sprites/frames/v66/batch-004/enemy-061-albino-crusher/attack.png` | `a6534c754487e01cb39e8b3d6754398d572f058edf5076586cebd6e9b28f5a0d` | 12 | no |
| `death` | `assets/openai/sprites/frames/v66/batch-004/enemy-061-albino-crusher/death.png` | `a58462800ba42e46513e4dfa085a70e5762aee549c70c55c772c6768a0c551e3` | 10 | no |
| `charge` | `assets/openai/sprites/frames/v66/batch-004/enemy-061-albino-crusher/charge.png` | `da9100bd1bec28d7426bd908c813487f90a629b37302e1cb2a76c0595de8f4c8` | 12 | no |

These hashes are provenance snapshots of the blocked queue prompts. Generation must rebuild prompts after the reviewed reference lock is merged.

## Local predecessor evidence

- Project action sheet: `6a0ec3905681365c61209f6af5cb92f45838c8d60daf695b38d89c08b66a55d8`
- Normalized project sheet: `1c14adfd9ad0691e157d0cdf10cf80721568d77b7da365f1d2802223cad8a0ef`
- V66 base sheets (`idle`, `move`, `attack`, `death`, `charge`): all five are `1774x887`; exact hashes are embedded in the fragment.
- Local licensed-product study image: `052ebc27b4c7ec16bd01931b8b6f01589ea4483e94c40a4963e41e4ac4c26d4e`
- Base metadata: `a9491dc6007b7ec73f93926a0ff5df247783630e21383ee4294fbab3a5c85fbe`
- V56 reference matrix: `a29c7106e322acddda9543e6a243299c5d27817cee1b27c1649e375448db73eb`

The base metadata reports validated normalization and a reviewed physical anchor, but `acceptanceStatus` remains `pending-visual-review`; this audit does not promote or accept that art.

## Verification performed

- JSON parsed successfully.
- All queue identity fields, including `provenance`, `batchId` and `ordinal`, matched exactly.
- Five of five `id/sourcePath/promptSha256/fps/loop` contracts matched exactly.
- All ten declared `localPaths` existed.
- `assembleReferenceRegistry` was simulated in memory and accepted `enemy-061-albino-crusher` without overwrite or schema error.
- No queue, state, global reference registry, sprite, metadata or Git operation was performed.

## Production limits

This reference pass authorizes only a future generation candidate after the fragment is merged. It does not prove visual acceptance, 40/40 cell compliance, animation continuity, scale certification, runtime integration or commercial readiness.
