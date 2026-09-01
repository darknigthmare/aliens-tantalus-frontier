# V66 Worklot 003 — Albino Praetorian reference audit

## Scope and decision

- Profile: `enemy-059-albino-praetorian`
- Queue identity: **Albino Praetorian** / `Praetorian` / `Albino` / `xenomorph` / `guardian` / `royal` / ordinal `58`
- Classification: `PROJECT_ADAPTATION`
- Canon fidelity claim: `canonExact=false`; no official or 1:1 Albino Praetorian claim is allowed.
- Reference fragment: `docs/references/V66_WORKLOT_003_ALBINO_PRAETORIAN_REFERENCE.json`
- Fragment SHA-256: `9348ee94a23c3360acce015615555111d72d5b52b51aa3157611d2f5728bd5d6`
- Merge target: `docs/references/V66_ENEMY_BATCH_REFERENCES.json`

The reviewed V66 `enemy-007-praetorian` lock is the positive anatomy authority. The albino modifier is limited to newly authored pigment and material response; it is not permission to recolor the accepted base sheets, copy licensed pixels, change anatomy or claim a canonical albino model.

## Authority chain

1. `enemy-007-praetorian` reviewed base lock — SHA-256 `513825bc24f846cfe5fd82936e60d445b823ce0f78503f6105b2e2a409f49375` — controls shield, dome, exactly two main arms, legs, full tail, scale and root.
2. The [licensed Aliens vs. Predator product page](https://store.steampowered.com/app/10680/Aliens_vs_Predator/) identifies Rebellion as developer and SEGA as publisher. It is retained only as a licensed continuity anchor; it is not an anatomical turntable and does not establish an albino form.
3. The local V66 base sheets, metadata and retained study image are hashed predecessor evidence. They guide identity and physical registration but cannot be copied into future sheets.
4. Earlier project-authored V56 Praetorian sheets are secondary silhouette evidence only.

No reviewed primary or licensed source establishes an Albino Praetorian. The correct honest treatment is therefore a Tantalus Frontier project adaptation derived from the reviewed base lock.

## Locked anatomy and material

- One broad swept-back Praetorian shield with a forward oval dome; never a Queen fan crown.
- Exactly two long main arms, two digitigrade legs and one continuous segmented spear-tail; no small chest arms or second arm pair.
- Warm bone-ivory, pearl-gray and pale beige chitin, restrained rose/taupe translucency, cool recesses and moist highlights.
- Never flat white, luminous, crystalline, icy, armored or produced by an automatic color filter.
- Strict right-facing gameplay profile, inherited pelvis/support-foot root and invariant scale across all clips.

## Exact queue contract

The queue uses the `royal` animation family and therefore requires **five** boards. This is an explicit discrepancy with a four-contract expectation; omitting `tail-strike` would make the fragment incomplete.

| Clip | Source path | Prompt SHA-256 | FPS | Loop |
|---|---|---|---:|:---:|
| `idle` | `assets/openai/sprites/frames/v66/batch-004/enemy-059-albino-praetorian/idle.png` | `534784429e293484ffd2a823960a4cea6d6644c9589fa48fb8685025d1dd869e` | 6 | yes |
| `move` | `assets/openai/sprites/frames/v66/batch-004/enemy-059-albino-praetorian/move.png` | `950178aed936079c773421b9efb07ce374abd45628106a2a157308eebc9dfbff` | 12 | yes |
| `attack` | `assets/openai/sprites/frames/v66/batch-004/enemy-059-albino-praetorian/attack.png` | `636698a6f36bfa6fccead660c6a812a2d013f801cf2caac8f165919178c282fa` | 12 | no |
| `death` | `assets/openai/sprites/frames/v66/batch-004/enemy-059-albino-praetorian/death.png` | `d320ae1b6ce175f9ff9e8d3826a04203ae185c1ed33dc67cb452716546aadfdc` | 10 | no |
| `tail-strike` | `assets/openai/sprites/frames/v66/batch-004/enemy-059-albino-praetorian/tail-strike.png` | `06da09b4991456fceda13555196342e2b4dae4bba11d09ca1327ace5c715efef` | 12 | no |

The five queue hashes matched `contentHash(decoded placeholder prompt)` at review time. They are provenance snapshots of the blocked queue and must be regenerated after the reviewed reference lock is merged.

## Local predecessor evidence

- V56 project sheet: `6d5d40ef6d6963ed62ef7665e75cb66abec8a20371592d533f219b59308c3c43`
- V56 normalized sheet: `f4c778139b8018952bbd5c27c2fbd57449310b6ef973803750173e8ba769ecda`
- V66 base sheets (`idle`, `move`, `attack`, `death`, `tail-strike`): all five are `1774x887`; exact hashes are embedded in the fragment.
- Local model study image: `783ed2dc52558d96bf47404deac959e6874a79e2b8a194f1ad96e596560e4c1c`
- Base metadata: `a7282d7beaac3dd77b8ba1aa8c7fd50c11394c170ee61319e070fb9cbba8ed9e`

## Verification performed

- JSON parsed successfully.
- All queue identity fields matched exactly.
- Five of five `id/sourcePath/promptSha256/fps/loop` contracts matched exactly.
- All ten declared `localPaths` existed.
- `assembleReferenceRegistry` was simulated in memory and accepted `enemy-059-albino-praetorian` without overwrite or schema error.
- No queue, state, global reference registry, sprite, metadata or Git operation was performed.

## Production limits

This reference pass authorizes only a future generation candidate after the fragment is merged. It does not prove visual acceptance, 40/40 cell compliance, animation continuity, scale certification, runtime integration or commercial readiness.
