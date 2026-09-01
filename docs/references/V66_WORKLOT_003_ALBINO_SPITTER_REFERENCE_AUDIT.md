# V66 Worklot 003 — Albino Spitter reference audit

## Scope and decision

- Profile: `enemy-062-albino-spitter`
- Queue identity: **Albino Spitter** / `Spitter` / `Albino` / `xenomorph` / `ranged` / `systemic-variant` / `ranged` / `batch-004` / ordinal `61`
- Classification: `PROJECT_ADAPTATION`
- Canon fidelity claim: `canonExact=false`; no official or 1:1 Albino Spitter claim is allowed.
- Reference fragment: `docs/references/V66_WORKLOT_003_ALBINO_SPITTER_REFERENCE.json`
- Fragment SHA-256: `c1a320e722d6fdcfeff5bac7283631bebcf1af9cbed08aa56827f9352a61167b`
- Merge target: `docs/references/V66_ENEMY_BATCH_REFERENCES.json`

The reviewed V66 `enemy-010-spitter` identity lock is the positive anatomy authority. The albino modifier is limited to newly authored pigment and material response; it is not permission to recolor the existing sheets, copy licensed pixels, change anatomy or claim a canonical albino model.

## Authority chain

1. `enemy-010-spitter` reviewed base identity lock — SHA-256 `e1a7c246962840d26d846a157670722972d365262acbcfeb8c9c103962bcce98` — controls the rear-flared dome, four dorsal spines, acid glands, bipedal anatomy and full tail.
2. The [official Gearbox Aliens: Colonial Marines trailer page](https://www.gearboxsoftware.com/2013/01/aliens-colonial-marines-trailer/) is a primary developer continuity anchor.
3. The [licensed Steam product listing](https://store.steampowered.com/app/49540/Aliens_Colonial_Marines_Collection/?l=english) anchors the released source game. It is not used as an anatomical turntable.
4. The locally retained licensed-product study image already governed by the base lock and the V66 base sheets are hashed predecessor evidence. Their pixels cannot be copied into future art.

No reviewed primary or licensed source establishes an Albino Spitter. The honest treatment is therefore an original Tantalus Frontier material adaptation derived from the reviewed base identity lock.

## Locked anatomy and material

- Smooth broad rear-flared dome, four long curved barbed dorsal spines, narrow ribbed torso, exactly two arms, two digitigrade legs and one continuous tail.
- Rear-cranium reservoirs remain restrained yellow-green biological acid glands, never eyes or equipment.
- Warm pearl-ivory and pale gray-beige chitin with cool recesses, restrained rose-taupe membranes, dark mouth cavity and moist highlights.
- Never flat white, luminous, crystalline, icy, orange Fireteam-like or produced by an automatic color filter.
- Strict right-facing gameplay profile and stable pelvis/support-foot root; the acid projectile is always a separate runtime effect.

## Exact queue contract

The queue uses the `ranged` animation family and requires exactly **four** boards.

| Clip | Source path | Prompt SHA-256 | FPS | Loop |
|---|---|---|---:|:---:|
| `idle` | `assets/openai/sprites/frames/v66/batch-004/enemy-062-albino-spitter/idle.png` | `81b4b0aba8a064ebaf9715c03f27f792c8ea874c26872aa9e8135cd8ec380901` | 6 | yes |
| `move` | `assets/openai/sprites/frames/v66/batch-004/enemy-062-albino-spitter/move.png` | `7361c352b323aa735e5f968bfef4f446f1384732af4e79f93e9d59af78cc1db8` | 12 | yes |
| `attack` | `assets/openai/sprites/frames/v66/batch-004/enemy-062-albino-spitter/attack.png` | `1df117ba9366a068dc60814c57aefaaa9affdfda6ba5189265e2f24ca451ed86` | 12 | no |
| `death` | `assets/openai/sprites/frames/v66/batch-004/enemy-062-albino-spitter/death.png` | `7c377372811d59a6614a4a89c9e72b50e6925cb7e7b0429005eb9629e08299e1` | 10 | no |

These hashes are provenance snapshots of the blocked queue prompts. Generation must rebuild prompts after the reviewed reference lock is merged.

## Local predecessor evidence

- Project action sheet: `22a057beb1b4db5bd4213ceca252a6935c0acc37f39e44b5bad7a27512eb8d60`
- Normalized project sheet: `054f02cb0b91d57de3cc7c90c6b127ad274675f420b1c0e0ec38ee8ab4377da0`
- V66 base sheets (`idle`, `move`, `attack`, `death`): all four are `1774x887`; exact hashes are embedded in the fragment.
- Local licensed-product study image: `f95f4f1d54573ba82802837836ddd1c77db8c264af950d3f258a25a1729cfcc7`
- Base metadata: `6d459e33710c4dc8caee06ddf5339b8e2161d135db17adcd9aaa03b9e6273f6a`
- V56 reference matrix: `a29c7106e322acddda9543e6a243299c5d27817cee1b27c1649e375448db73eb`

The base metadata reports validated normalization and a later scale review, but `acceptanceStatus` and the complete physical-anchor review remain pending; this audit does not promote or accept that art.

## Verification performed

- JSON parsed successfully.
- All queue identity fields, including `provenance`, `batchId` and `ordinal`, matched exactly.
- Four of four `id/sourcePath/promptSha256/fps/loop` contracts matched exactly.
- All nine declared `localPaths` existed.
- `assembleReferenceRegistry` was simulated in memory and accepted `enemy-062-albino-spitter` without overwrite or schema error.
- No queue, state, global reference registry, sprite, metadata or Git operation was performed.

## Production limits

This reference pass authorizes only a future generation candidate after the fragment is merged. It does not prove visual acceptance, 32/32 cell compliance, animation continuity, scale or anchor certification, runtime integration or commercial readiness.
