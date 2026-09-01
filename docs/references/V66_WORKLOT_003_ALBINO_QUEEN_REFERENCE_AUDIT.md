# V66 Worklot 003 — Albino Queen reference audit

## Scope and decision

- Profile: `enemy-060-albino-queen`
- Queue identity: **Albino Queen** / `Queen` / `Albino` / `xenomorph` / `royal` / `royal` / ordinal `59`
- Classification: `PROJECT_ADAPTATION`
- Canon fidelity claim: `canonExact=false`; no official or 1:1 Albino Queen claim is allowed.
- Reference fragment: `docs/references/V66_WORKLOT_003_ALBINO_QUEEN_REFERENCE.json`
- Fragment SHA-256: `bf50799de93948b42ea349d371b9968ffe7a11f9e79f147e0c00a8746a52088a`
- Merge target: `docs/references/V66_ENEMY_BATCH_REFERENCES.json`

The reviewed V66 `enemy-008-queen` lock is the positive anatomy authority. The albino modifier is limited to newly authored pigment and material response; it is not permission to recolor the accepted base sheets, copy licensed pixels, change anatomy or claim a canonical albino model.

## Authority chain

1. `enemy-008-queen` reviewed base lock — SHA-256 `58582bbce057dfa4e451b57bcb4d31813f080fbd535cea4666cbd6f211911f3c` — controls the layered crown, four-arm hierarchy, legs, full tail, scale and root.
2. The [official 20th Century Studios Aliens page](https://www.20thcenturystudios.com/movies/aliens) anchors the 1986 film continuity.
3. The [licensed NECA Aliens Queen page](https://necaonline.com/48662/products/toys/action-figures/aliens-xenomorph-queen-ultra-deluxe-boxed-action-figure/) and its locally retained study image support the reviewed mobile Queen anatomy. They do not establish an albino form and their pixels cannot be copied.
4. The local V66 base sheets and metadata are hashed predecessor evidence for identity and physical registration. Earlier project-authored V56 Queen sheets are secondary silhouette evidence only.

No reviewed primary or licensed source establishes an Albino Queen. The correct honest treatment is therefore a Tantalus Frontier project adaptation derived from the reviewed base lock.

## Locked anatomy and material

- Huge swept-back layered fan crown with paired lobes, narrow neck and waist.
- Exactly four arms with an unambiguous hierarchy: two large outer arms plus two much smaller chest arms.
- Two powerful digitigrade legs and one long continuous segmented spear-tail.
- Mobile combat Queen only: no ovipositor or egg sac.
- Warm pearl-ivory and pale gray-beige chitin, restrained rose/taupe translucency, cool recesses, dark mouth cavity and moist highlights.
- Never flat white, luminous, crystalline, icy, armored or produced by an automatic color filter.
- Strict right-facing gameplay profile, inherited pelvis/support-foot root and invariant scale across all clips.

## Exact queue contract

The queue uses the `royal` animation family and therefore requires **five** boards. This is an explicit discrepancy with a four-contract expectation; omitting `tail-strike` would make the fragment incomplete.

| Clip | Source path | Prompt SHA-256 | FPS | Loop |
|---|---|---|---:|:---:|
| `idle` | `assets/openai/sprites/frames/v66/batch-004/enemy-060-albino-queen/idle.png` | `86b271207dc25a4c4f35f487e3af7640de90cf1d5b2f29e9afff8d7bf7e90dfa` | 6 | yes |
| `move` | `assets/openai/sprites/frames/v66/batch-004/enemy-060-albino-queen/move.png` | `c2f58ead6b7fbfcb8fc7399d8da847973554ca61cfc119855d569f3b0fc41383` | 12 | yes |
| `attack` | `assets/openai/sprites/frames/v66/batch-004/enemy-060-albino-queen/attack.png` | `9fb8e8e544441a39232341e1225d7249c81231634f2dc9493eca4872a7ff1e89` | 12 | no |
| `death` | `assets/openai/sprites/frames/v66/batch-004/enemy-060-albino-queen/death.png` | `7c35350947eb02ea40e01b7a8a0bb8368b8888a59919766745b94143c6e5ce01` | 10 | no |
| `tail-strike` | `assets/openai/sprites/frames/v66/batch-004/enemy-060-albino-queen/tail-strike.png` | `4b478045d807cc13f8708aa937def8d4bfd37035c6f93db2e0a6ca1195a7ba7d` | 12 | no |

The five queue hashes matched `contentHash(decoded placeholder prompt)` at review time. They are provenance snapshots of the blocked queue and must be regenerated after the reviewed reference lock is merged.

## Local predecessor evidence

- V56 project sheet: `5213569816c8385cc9d2d179e96f2f61096fa5905c52b18280a2ef631cefd380`
- V56 normalized sheet: `4d014575b316fed25b5eb59f7adb6177dc17e1477e023e7f6799800e3fdc8e21`
- Project combat sheet: `061a22796b63c0adee92e1e09b9ab21e8fb378b46adeaa9e0e7e5294a15c30e4`
- Normalized combat sheet: `42698cfa914ec912e564dab4c82e6be11de129c6ffaeff616dcc61c5071e0823`
- V66 base sheets (`idle`, `move`, `attack`, `death`, `tail-strike`): all five are `1774x887`; exact hashes are embedded in the fragment.
- Local licensed Queen study image: `eea16bc149cce14072891525d1ae60e67c10f27022c6cdc8244e843c55c2c7c4`
- Base metadata: `7c87d02028f760d510b30b27b6046358fddd0391a6b1b74a31ea29310b5c4853`

## Verification performed

- JSON parsed successfully.
- All queue identity fields matched exactly.
- Five of five `id/sourcePath/promptSha256/fps/loop` contracts matched exactly.
- All twelve declared `localPaths` existed.
- `assembleReferenceRegistry` was simulated in memory and accepted `enemy-060-albino-queen` without overwrite or schema error.
- No queue, state, global reference registry, sprite, metadata or Git operation was performed.

## Production limits

This reference pass authorizes only a future generation candidate after the fragment is merged. It does not prove visual acceptance, 40/40 cell compliance, animation continuity, scale certification, runtime integration or commercial readiness.
