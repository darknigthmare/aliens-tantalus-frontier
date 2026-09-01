# V66 Worklot 003 — Tantalus Tunnel Vermin reference audit

## Verdict

`enemy-052-tantalus-tunnel-vermin` remains `PROJECT_ORIGINAL / NO_EXTERNAL_MODEL`, `canonExact=false`. It belongs to the internal Tantalus Reach continuity. The name collision with Tantalus Base in *Aliens: Dark Descent* supplies neither biology nor visual authority.

## Local evidence

| File | Dimensions | Bytes | SHA-256 |
|---|---:|---:|---|
| `assets/openai/sprites/enemies/tantalus-tunnel-vermin-action-sheet-v56.png` | 1254×1254 | 1,278,206 | `98aa4dd198f8c8db0d263353842ace48ef80ebf4821dcae032d89d7a3aeeb838` |
| `assets/openai/sprites/normalized/enemies/tantalus-tunnel-vermin-action-sheet-v56.png` | 1024×1024 | 377,877 | `6a824553bf7b6355b32e5ea5933998e7de51c5ea7a8b6c1233cc3bf8c76aa104` |

Runtime continuity is `180×76`, ground hitbox `tantalus-tunnel-vermin-ground`. For V66 the ambiguous V56 “six to eight” range is resolved to exactly eight locomotor limbs so topology cannot drift between frames. The subject remains a small, very low pale cave arthropod with one burrowing head, reduced sensors, one mandibular mouth, segmented trunk and short tactile appendages.

## Contract and motion audit

Four future sheets only: idle 6 fps loop, move 12 fps loop, attack 12 fps non-loop, death 10 fps non-loop. Each is 1774×887, 4×2, eight chronological poses. Normalized contract: 4×8, 256×256 cells, 16 px guard, pivot `(128,240)`.

Idle uses tiny segment/sensor motion without translation. Move uses a coherent eight-leg metachronal scuttle. Attack is a short mandibular dart/clamp with planted recovery. Death breaks the support wave, curls and ends motionless. Segment count, eight limb attachments, scale and foot baseline remain invariant.

Despite `caste=swarm`, every cell contains exactly one subject. All 32 poses face right at ground level, with full antennae and abdomen inside the cell. No crop, contact, overlap or cross-cell appendage is allowed. Background is true alpha or uniform `#FF00FF`, never a tunnel scene, dust, shadow or gradient.

## Exclusion audit

No facehugger, chestburster, mini-xenomorph, giant boss, tentacles, metallic shell or multiple-subject swarm. No external franchise likeness may be claimed.

## Placeholder/global audit

The queue remains `pending-reference` with null reference/lock. All four exact paths and declared placeholder hashes were verified and copied. However, every declared hash differs from an independently computed SHA-256 of the decoded UTF-8 prompt text; these values remain provenance markers rather than reusable prompt receipts. The prompts remain blocked until merge/recompilation. No ImageGen, global registry, queue/state, normalization or Git mutation occurred.
