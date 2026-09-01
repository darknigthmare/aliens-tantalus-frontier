# V66 Worklot 002 — Colonial Raider reference audit

Date: 2026-09-01
Scope: `enemy-046-colonial-raider` reference phase only
Decision: `PROJECT_ORIGINAL`, `NO_EXTERNAL_MODEL`, `canonExact=false`

## Outcome

“Colonial Raider” is not locked as a published Alien faction or exact licensed character model. It is an original Tantalus frontier/scavenger combat archetype designed to fit the franchise's broader colonial scarcity, distant-settlement and criminal-crew context.

The distinction is strict:

- **Licensed setting anchors:** remote colonial frontiers, resource competition, colonist hardship, human violence, smugglers and criminal colonies.
- **Project inventions:** the name Colonial Raider, factional implication, outfit, half-mask, asymmetry, palette, weapon, organization, animation and exact individual.

`canonExact=false` is permanent for this profile. No online image was downloaded or embedded. No image was generated.

## Evidence hierarchy

1. **Free League / 20th Century Studios — official licensed ALIEN RPG.** The setting description establishes expanding frontiers, rival governments and corporations competing for valuable resources, colonists gambling their lives and harsh colonial conditions. It supports the frontier pressure behind a raider archetype, not a raider model.
   https://freeleaguepublishing.com/games/alien/
2. **Free League / 20th Century Studios — *Building Better Worlds*.** The licensed colonial campaign material covers pioneering explorers, colonists, colony gear and distant settlements, including Far Spinward colonies. It supports practical survival equipment and remote-settlement vocabulary only.
   https://freeleaguepublishing.com/shop/alien-rpg-2/building-better-worlds/
3. **Marvel / 20th Century Studios — *Alien: Paradiso*.** Official Marvel metadata places a smuggling ring and smuggler crew in a criminal colony with Colonial Marshals. Automated direct retrieval returned HTTP 403 during this audit, so the evidence is limited to publisher-indexed metadata and is not used for visual details.
   https://www.marvel.com/comics/collection/123117/alien_paradiso_trade_paperback
4. **SEGA / Creative Assembly — official *Alien: Isolation* gameplay page.** It describes humans fighting over limited food and water and attacking perceived intruders. This supports scarcity-driven human threat behavior, not a named raider organization.
   https://alienisolation.sega.jp/battle.html

The two Free League pages and SEGA page were reachable during review. The Marvel URL was verified as an official endpoint and through indexed official metadata, but direct automated access was blocked with HTTP 403; that limitation is preserved instead of being reported as a clean fetch.

## Scoped negative finding

No published named faction, standardized uniform or exact external character model called “Colonial Raider” was identified in the official/licensed corpus above or in the existing project reference matrix.

This is a production classification, not a universal claim that no raider-like human has ever appeared anywhere across every Alien publication. It means the available authoritative material does not justify marketing, metadata or art provenance that presents this exact 046 design as official. The formal status therefore remains `PROJECT_ORIGINAL` / `NO_EXTERNAL_MODEL`, even though its surrounding frontier grammar is franchise-compatible.

The queue's `provenance: licensed-reference` value is retained verbatim in the contract snapshot. It records the licensed setting corpus used for review; it does not override the profile's original-design classification.

## Locked original design

- **Body:** one ordinary adult human with realistic proportions, lean ambush posture and a wholly new non-celebrity face.
- **Head:** dusty gray hood; visible eyes and brow; fixed gray-brown half-face respirator with two small filters. No skull styling, sealed helmet or cybernetic eye.
- **Clothing:** short dusty-gray utility coat, sand canvas chest harness, charcoal work trousers, battered dark boots and fingered gloves.
- **Asymmetry:** exactly one scratched brown composite shoulder plate on the near shoulder and a compact filter/salvage pack. Asymmetry reads as repaired frontier equipment, not fantasy armor.
- **Accent:** one muted ochre blank identification tape; no readable wording or official/invented faction logo.
- **Weapon:** one original compact semi-automatic scavenger carbine, scratched charcoal steel and muted brown composite furniture, straight detachable magazine, simple iron sights, short stock and narrow barrel. It must not replicate a real rifle, M41A, NSG23, UPP weapon or branded corporate gun.
- **View:** strict right-facing orthographic gameplay profile; full body and complete carbine remain isolated inside each cell.

## Animation and continuity lock

- `idle`: low ambush-ready posture, restrained breathing and eye scans; final pose returns near the first.
- `move`: quiet compact advance with two-hand carbine control and alternating contacts; no cowboy run or parade gait.
- `attack`: stock, acquire, one semi-automatic shot, compact recoil, sight recovery and ready return.
- `death`: irreversible human collapse; the carbine may settle beside the body but cannot disappear, multiply or become the root anchor.
- `reload`: one straight magazine leaves, one matching replacement enters, action operates, identical ready silhouette returns; maximum one loose magazine visible.
- Across all five clips: the same face, hood, respirator, shoulder asymmetry, harness, coat, pack, carbine construction, right-facing orientation and character scale.

## Prohibited drift

- Any claim that Colonial Raider is an official faction, canon uniform or exact licensed model.
- USCMC armor/M41A, UPP or Weyland-Yutani kit, Seegson/Colonial Marshal badges, copied insignia or official faction color blocking.
- Mad Max spikes, skull trophies, tire armor, cowboy hat/duster, fantasy bandit, Space Marine/ODST silhouette or generic post-apocalypse costume.
- Cyber limbs, ATARAX suit, full gas-mask lenses, sealed astronaut helmet, neon/glowing technology or oversized armor.
- Real-world rifle copy, energy weapon, suppressor/optic stack/launcher, second firearm or carbine morphing.
- Readable text, logo, scenery, floor, cast shadow, UI, watermark, cell crossing or copied licensed pixels.

## Local continuity evidence

- Raw V56 predecessor: `assets/openai/sprites/enemies/colonial-raider-action-sheet-v56.png`, 1254×1254 RGB, 1,464,394 bytes, SHA-256 `d0021f37713a4f2c68d955defc242fabd77aa25976bcc5719d678aca0943bfa1`.
- Normalized V56 predecessor: `assets/openai/sprites/normalized/enemies/colonial-raider-action-sheet-v56.png`, 1024×1024 RGBA, 491,288 bytes, SHA-256 `438b0bc32e11984425a179c643645c3df01cb19232afc079735f3a21f0d01754`.
- Runtime precedent: `npc-standing`, 98×138 render envelope, humanoid feet, source facing right, explicit `PROJECT_ORIGINAL` reference status.
- Existing decision source: `docs/references/V56_ENEMY_REFERENCE_MATRIX.json`, `PROJECT_ORIGINAL` / `NO_EXTERNAL_MODEL`.

The V56 bitmaps may inform project continuity, palette, broad silhouette and runtime scale only. The raw predecessor has no alpha channel; neither file is a ready V66 source board. They may not be enlarged, traced, cropped into new boards or treated as evidence of licensed canon. No detailed per-generation receipt for these predecessor files was found in the scoped audit.

## Queue prompt hash integrity

The queue-declared hashes were compared with fresh SHA-256 values over each decoded UTF-8 prompt string. None of the five declarations matches its decoded text:

| Clip | Queue declaration | Recomputed decoded-text SHA-256 |
|---|---|---|
| idle | b156997af9ed25fe51c693e6f31888dd00fe40dd9ac47ea94fffde5ce04d4345 | e5b8ee031aceb95a7c2bced2c1276d36357f2a593cce52d6be4aa580dc4b9817 |
| move | 0a3a6b6097913cbce05e86742fb3176356b9caaadfffe4d22288ee047cac9d12 | 7b24f32e6f3428a6204ad8bf8a4e4e4c9dea3517eeb51421c93559940b0a7c1d |
| attack | cf5860431378deaf9675d3da9469bb3cf497f1c780aca76660041ea0ff4c1833 | 6e41e82c8cf6499882abfac37e467afb4c7182bc5350e15ef4b07ee1aa50d3e2 |
| death | 5c41caf60d1d48e88bb305857d48c1bbc648167e0ee5b4aa2b182c22f961d38c | d57483d044dd79d2437685d30e6cefa47296db6c021892c7ad2d59c576b1b6a2 |
| reload | aa7b5873516dc7533e17a6f3517432e3c7009a4fca8e0d05937a11d5df19464e | 54a2a75ab5b21401536fd702e17f5b0a3b04b7dfca33d2795da4dd72193e41a6 |

The queue remains untouched. These BLOCKED placeholders are provenance only. Any later approved production prompt must be persisted and hashed from its exact bytes before generation.

## Gate status

- Reference lock: complete locally.
- Generation authorization: false.
- ImageGen calls: 0.
- Generated boards: 0.
- Normalization, acceptance and runtime integration: not run.
- Global references, queue, state, metadata and normalization registries: untouched.
- Git: untouched.

The next production phase must first merge the fragment through the reviewed-reference process, keep all production receipts labeled project-original, and independently review identity, anatomy, carbine continuity, 40-pose chronology, inter-clip scale, physical anchors and cell isolation. Any later bitmap remains original fan-made Tantalus work with `canonExact=false`.
