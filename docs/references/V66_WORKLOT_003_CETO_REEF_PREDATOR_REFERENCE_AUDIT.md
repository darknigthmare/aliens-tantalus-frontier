# V66 Worklot 003 — Ceto Reef Predator reference audit

## Verdict

`enemy-051-ceto-reef-predator` remains `PROJECT_ORIGINAL / NO_EXTERNAL_MODEL`, `canonExact=false`. The V56 search found no credible licensed Ceto creature model. No external or canon-exact likeness may be claimed; the V56 project-owned art and this lock are the only positive design authorities.

## Local evidence

| File | Dimensions | Bytes | SHA-256 |
|---|---:|---:|---|
| `assets/openai/sprites/enemies/ceto-reef-predator-action-sheet-v56.png` | 1254×1254 | 1,260,125 | `17ac6c51776959f0e79f185fb8ca6b6d89c8c56de1468055ecf914403c514400` |
| `assets/openai/sprites/normalized/enemies/ceto-reef-predator-action-sheet-v56.png` | 1024×1024 | 396,787 | `1c1ea87f59e201f005ce62b3463f3948ff014d5e41e69ce0d4d87d761e9a7ee7` |

Runtime continuity is `186×82`, aquatic hitbox `ceto-reef-predator-water`, strict right profile. The design is a blue-black/moss-green streamlined amphibious quadruped with flat head, lateral eye, gills, four paddle-limbs, low crest and deep caudal fin. It is not an aquatic xenomorph, shark-on-legs or giant leviathan.

## Contract and motion audit

Four future sheets only: idle 6 fps loop, move 12 fps loop, attack 12 fps non-loop, death 10 fps non-loop. Each is 1774×887, 4×2, eight chronological poses. Normalized contract: 4×8, 256×256 cells, 16 px guard, pivot `(128,240)`.

Idle uses gill/paddle/caudal trim without drift. Move is true swimming propulsion, not walking. Attack is a tail-driven single-jaw lunge with brake and recovery. Death irreversibly loses propulsion and ends motionless. Body length, head, gills, four limbs, crest, caudal depth and aquatic root remain invariant across all 32 cells.

Every cell must contain one complete right-facing animal with equal gutter and no crop, contact, overlap or glow spill. Background is true alpha or uniform pure `#FF00FF`, never water scenery, bubbles, shadow, reflection or gradient.

## Placeholder/global audit

The queue remains `pending-reference` with null reference/lock. Its four declared placeholder hashes and exact paths were verified and copied into the fragment. However, all four declared hashes differ from independently computed SHA-256 values of the decoded UTF-8 prompt text; they are provenance markers, not reusable prompt receipts. They remain blocked until merge and prompt recompilation. No ImageGen, global registry, queue/state, normalization or Git mutation occurred.
