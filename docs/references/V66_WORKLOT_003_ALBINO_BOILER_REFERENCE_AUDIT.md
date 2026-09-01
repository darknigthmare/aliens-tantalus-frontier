# V66 Worklot 003 — Albino Boiler reference audit

## Scope and decision

- Profile: `enemy-066-albino-boiler`
- Queue identity: **Albino Boiler** / `Boiler` / `Albino` / `xenomorph` / `explosive` / `systemic-variant` / `explosive` / `batch-004` / ordinal `65`
- Classification: `PROJECT_ADAPTATION`
- Canon fidelity claim: `canonExact=false`; no official, canon-exact or 1:1 Albino Boiler claim is allowed.
- Reference fragment: `docs/references/V66_WORKLOT_003_ALBINO_BOILER_REFERENCE.json`
- Fragment SHA-256: `ccc07c5b420bc499911d9aee777c1a327f40bb5217b3253afb64c8e0c2fd6059`
- Merge target: `docs/references/V66_ENEMY_BATCH_REFERENCES.json`

The reviewed V66 `enemy-014-boiler` identity lock is the positive anatomy authority. The albino modifier is limited to newly authored pigment and material response; it does not authorize recoloring the existing sheets, copying the locally retained game study image, changing the explosive anatomy or claiming that an official Albino Boiler exists.

## Authority chain

1. `enemy-014-boiler` reviewed base identity lock — canonical compact-entry SHA-256 `9a8dfaec63d89d8750bb6b0fd1f05d74c9c2967e55204c034beb5677c5542d40` — controls the blind damaged head, hunched bipedal body, cyst distribution, four main limbs and complete tail.
2. The [licensed Aliens: Colonial Marines Steam listing](https://store.steampowered.com/app/49540/Aliens_Colonial_Marines_Collection/) anchors the released source-game continuity only; it is not used as an Albino Boiler turntable.
3. The project action sheets, local game study image, V56 matrix and four V66 base boards are immutable hashed predecessor evidence. Their pixels cannot be copied or automatically recolored.
4. The [Tantalus Frontier project repository](https://github.com/darknigthmare/aliens-tantalus-frontier) is recorded as the primary project source.

No reviewed primary or licensed source establishes an Albino Boiler. The honest treatment is an original Tantalus Frontier pigment/material adaptation derived from the already reviewed base identity lock.

## Locked anatomy, material and action

- Gaunt, blind, lopsided BIPEDAL Boiler with a drooping damaged elongated ridged head and short deformed dorsal tubes.
- Exactly two long bent skeletal clawed arms, two bowed digitigrade legs, one continuous tail and irregular cystic boils concentrated over shoulders, upper back, ribcage and hips.
- Warm parchment-ivory and pearl-gray exoskeleton with cool taupe recesses, translucent pink-beige membranes and pale yellow-green to weak acid-amber functional cysts.
- The albino treatment must preserve cyst readability; never make the whole body featureless white, luminous, crystalline or icy.
- Not the low quadruped Burster, a healthy Drone, a balloon-shaped blob, an armored unit or an explosion cloud.
- The `attack` board is a chronological inflation and terminal acid-detonation preparation sequence; `death` is a distinct fall and motionless terminal body.
- Strict right-facing gameplay profile with a pelvis/proximal-leg root projected to the supporting-foot floor.

## Exact queue contract

The queue uses the `explosive` animation family and requires exactly **four** boards. The special behavior is carried by `attack`, not by an extra clip.

| Clip | Source path | Prompt SHA-256 | FPS | Loop |
|---|---|---|---:|:---:|
| `idle` | `assets/openai/sprites/frames/v66/batch-004/enemy-066-albino-boiler/idle.png` | `9dcf371f82e9ec1785de3eeddab011d4a5953f3a1ed72bfe67aa1a07a0932e5e` | 6 | yes |
| `move` | `assets/openai/sprites/frames/v66/batch-004/enemy-066-albino-boiler/move.png` | `2bfd737dd44a44af707c4a7c9abd6116f6affc44b8261d0fb21fc21c80f27d38` | 12 | yes |
| `attack` | `assets/openai/sprites/frames/v66/batch-004/enemy-066-albino-boiler/attack.png` | `36082a164a7bc1e6da018c34c6241943ac864f06a5d15d10bc0b409fe93564a2` | 12 | no |
| `death` | `assets/openai/sprites/frames/v66/batch-004/enemy-066-albino-boiler/death.png` | `f908b6aa8ccba5dc05bc3bd78a24c250a117933334301ad535ceb131090bf18c` | 10 | no |

These hashes are exact snapshots of the blocked queue prompts. Generation must rebuild prompts after the reviewed reference lock is merged.

## Local predecessor evidence

- Project action sheet: `09ad9477b039fe0ac5053f8d74759cffb51d91d7808afd679e511cbe0bc2b0c9` (`1254x1254`).
- Normalized project sheet: `93390cab29d7bf85ca2a6dfecb6a0c2f72f6a3201750a0684728bc3bc5becbeb` (`1024x1024`).
- Local game study image: `c4d2ac80af76ea84a4dddc63d950abec446ad99abbec29893e88f78a01446b0a` (`1350x900`).
- V66 base boards (`idle`, `move`, `attack`, `death`): all four are `1774x887`; exact byte sizes and hashes are embedded in the fragment.
- Base metadata: `a7afdad0cacc106a0e0b837384933174c3edf4052ed46a5b8b19759e87fbd402`.
- V56 reference matrix: `a29c7106e322acddda9543e6a243299c5d27817cee1b27c1649e375448db73eb`.
- Historical base reference fragment: `835bdf131f01901cf81301e90e5c9da7ebc33c05fb23cf948561fedaad902eb1`.

The base metadata reports validated normalization, but `acceptanceStatus` remains `pending-visual-review`, `scaleCalibrationReview` is `null`, `scaleCalibrationEvidence` is empty and the physical-anchor report is `pending`.

## Scale and anchor limitation

The base metadata declares `sourceScaleByClip={idle:1,move:1,attack:1,death:1}`, but supplies no completed calibration review or evidence. This fragment therefore **does not inherit or expose a top-level `sourceScaleByClip`**. A future Albino Boiler candidate must receive a new complete per-clip scale calibration and physical-anchor review before any scale certification. The pending anchor evidence is retained at SHA-256 `31426022398546429ea8ad7defdfbf642c4fd854b3bb64270df0a725acd121e3`.

## Verification performed

- Both fragment JSON documents parsed successfully.
- Every queue identity field, including `provenance`, `batchId` and `ordinal`, matched exactly.
- Four of four `id/sourcePath/promptSha256/fps/loop` contracts matched exactly.
- All eleven declared `localPaths` existed.
- `assembleReferenceRegistry` was simulated in memory against the current global registry and accepted `enemy-066-albino-boiler` without overwrite or schema error.
- The simulation produced a 63-profile in-memory registry and performed no write.
- No queue, state, global reference registry, sprite, metadata or Git operation was performed.

## Production limits

This reference pass authorizes only a future generation candidate after the fragment is merged. It does not prove 32/32 cell compliance, visual fidelity, inflation continuity, detonation readability, scale certification, runtime integration, acceptance or commercial readiness.
