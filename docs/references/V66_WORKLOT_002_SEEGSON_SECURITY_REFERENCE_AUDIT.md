# V66 Worklot 002 — Seegson Security reference audit

Date: 2026-09-01
Scope: `enemy-045-seegson-security` reference phase only
Decision: `CANON_REFERENCE`, `EXACT_EXTERNAL_MODEL`, `canonExact=false`

## Outcome

The production target is the light human station-security language of *Alien: Isolation*: an ordinary, visibly human civil/private guard in worn 1970s-retrofuture workwear and limited riot protection. It is not a Working Joe, a Colonial Marine, a sealed Weyland-Yutani commando or a contemporary SWAT operator.

The future sprite must depict one new unnamed individual. “Seegson Security” is the project roster label for this direct game-reference archetype; it must not be used to claim that every armed human survivor in the shipped game was a uniformed Seegson employee. `canonExact=false` remains mandatory because the face, exact costume assembly, side-view proportions, animations and pixels are project-authored.

No online image was downloaded or embedded. No image was generated.

## Evidence hierarchy

1. **SEGA / Creative Assembly — official concept-art archive.** Its character section documents the iterative wardrobe/material design of Sevastopol inhabitants and the “future as imagined in the 1970s.” Its environment section describes the 1979-buildability constraint, matte surfaces and utilitarian Ron Cobb influence; its tools section emphasizes portable, disposable, handmade construction. This is the primary era/material/silhouette source, not a bitmap source.
   https://alienisolation.sega.jp/special_conceptart.html
2. **SEGA / Creative Assembly — official gameplay page.** It separates desperate armed humans from Seegson Working Joe synthetics. That distinction is decisive: 045 is biologically human and may not inherit Working Joe anatomy, pallor or rubberized clothing.
   https://alienisolation.sega.jp/battle.html
3. **PlayStation Blog — Alistair Hope, Creative Lead at Creative Assembly.** The developer describes the game as lo-fi 1970s science fiction and its human survivors as unpredictable, sometimes aggressive people abandoned on a remote station. This supports nervous civil-guard posture and rejects modern tactical polish.
   https://blog.playstation.com/2014/06/10/new-alien-isolation-details-revealed/
4. **Titan Books — licensed *The Art of Alien: Isolation*.** The publisher records a 176-page licensed development-art volume with more than 300 images. It is bibliographic/study provenance only; no artbook page is copied, embedded or treated as a reusable texture.
   https://titanbooks.com/7252-the-art-of-alien-isolation/
5. **SEGA — official product page.** It confirms the game, developer/publisher and 20th Century rights context, and reiterates the 1970s imagined-future art direction.
   https://alienisolation.sega.jp/summary.html

All five pages were reachable during the audit. Public primary pages establish the shipped game's character/material language more strongly than they establish every garment seam of a single guard. The exact one-helmet/one-chest-plate assembly is therefore a locked original production synthesis constrained by the existing V56 matrix, not a claim of an extracted official model.

## Shipped-game fidelity decision

- **Body:** one ordinary adult human, normal proportions, visible original face and readable anxiety/alertness.
- **Uniform:** pale blue-gray station work shirt, charcoal work trousers, utility belt, dark work boots/gloves and small radio/lamp.
- **Protection:** compact dirty off-white plastic chest protector and one open-faced riot helmet with a raised clear visor. The protection remains light; the silhouette must still read as a station worker/guard.
- **Weapon:** one original, worn, tube-fed pump-action station-security shotgun. It is chosen over an automatic rifle because the shipped light civil/riot identity takes priority over militarized concept exploration.
- **Palette:** off-white, pale blue, gray, black, dull steel and restrained brown wear. No neon, camouflage or glossy contemporary polymers.
- **View:** strict right-facing orthographic gameplay profile. The full guard and full shotgun remain isolated inside each cell.

## Queue conflict retained, not hidden

The queue contract fixes `reload`, 8 frames, 10 fps, non-looping, but its BLOCKED generic prompt describes removing and inserting a detachable magazine. That prose is incompatible with the tube-fed pump shotgun selected for shipped-game fidelity.

The reference lock therefore preserves the clip id, timing, frame count, facing and path while replacing only the future motion description with shell-by-shell loading through the shotgun's loading port, followed by a pump/chamber action. The BLOCKED queue prompt is recorded by SHA-256 only and is not approved for generation. No global queue edit was made.

## Animation and continuity lock

- `idle`: restrained breathing, small nervous head check, weapon remains at low ready; frame 8 closes near frame 1.
- `move`: cautious station patrol gait, not a sprint; stable two-hand shotgun control and clean alternating foot contacts.
- `attack`: shoulder, acquire, one shot, recoil, visible pump cycle, ready recovery.
- `death`: irreversible human collapse; the shotgun may settle but cannot vanish, multiply or anchor the body.
- `reload`: individual shells, maximum one loose shell visible, fixed loading port and tube geometry, final chamber/readiness action.
- Across all five clips: the same face, helmet/visor state, chest protector, radio/lamp, clothes, shotgun proportions, right-facing orientation and character scale.

## Prohibited drift

- Working Joe face/body, synthetic pallor, rubber android suit or glowing eye treatment.
- Colonial Marine M3 armor, M41A, sealed APEsuit, corporate commando, ODST/power armor or modern SWAT redesign.
- Gas mask, closed mirrored visor, riot shield, camouflage or cyberpunk police styling.
- Automatic rifle, smartgun, energy weapon, optics/suppressor/launcher, second firearm or detachable magazine during reload.
- Copied NPC face, official logo/wordmark, text, unit number, scenery, floor, cast shadow, UI, watermark or copied official/licensed pixels.

## Local continuity evidence

- Raw V56 predecessor: `assets/openai/sprites/enemies/seegson-security-action-sheet-v56.png`, 1254×1254 RGBA, 850,539 bytes, SHA-256 `6961d6ec0c97adc271e913df38ea7a65b3e884c0c82a2579dfe19e9e7fd46d0b`.
- Normalized V56 predecessor: `assets/openai/sprites/normalized/enemies/seegson-security-action-sheet-v56.png`, 1024×1024 RGBA, 422,537 bytes, SHA-256 `0572100615745fa2701d1d0b5f2bf6a6232e48da9748972b38ee64605b2e88d0`.
- Runtime precedent: `npc-standing`, 96×132 render envelope, humanoid feet, source facing right.
- Existing decision source: `docs/references/V56_ENEMY_REFERENCE_MATRIX.json`, `CANON_REFERENCE` / `EXACT_EXTERNAL_MODEL`.

The V56 bitmaps are project-local predecessors for identity, palette, broad silhouette and runtime scale only. They may not be enlarged, traced, cropped into a V66 board or treated as a generation receipt. No detailed per-generation receipt for these predecessor files was found in the scoped audit.

## Queue prompt hash integrity

The queue-declared hashes were compared with fresh SHA-256 values over each decoded UTF-8 prompt string. None of the five declarations matches its decoded text:

| Clip | Queue declaration | Recomputed decoded-text SHA-256 |
|---|---|---|
| idle | a4294a46f66ae2e666f6bd0549f5c5f29dd0bca53598838d1c5ef258f000a62c | 39e36a18cb9197fbbc18f8452b8bcc08dfda61062af65dfe5c01c2c42535d55e |
| move | e7eb77bf9cffb41550fc016464f37b2f407d47b41e41652d64f58affa8008dd4 | 92cd59936d55aa86c6a65aac0780176df8eff99321affc03d2f31fb6c77826ea |
| attack | 6e77dad75c00d3e15e477a4c966790c1c1f793056e9bd7e91747543a3356241d | 2b689752a16fd098c2ac68f2fb312b8f22db0d54853ae9c80a4297a9ca2f1f6b |
| death | 28fcaa2111f8b981bb1372e3f21ff7e49c1d63559c26316eeb0f4703476bbd1a | 560c44a13af10a0c92910a5c03cbb569fced5fd7731132c9887dc15732327cc3 |
| reload | 053a152574cf27f1085600b18ebda47463d9d19b6144d7905441ad04fd943c97 | 881127e5155130d1e0e13b4f4f4ecbc5a1dd465d4f014e5c193220deb1f43f7b |

The queue remains untouched. These BLOCKED placeholders are provenance only. Any later approved production prompt must be persisted and hashed from its exact bytes before generation.

## Gate status

- Reference lock: complete locally.
- Generation authorization: false.
- ImageGen calls: 0.
- Generated boards: 0.
- Normalization, acceptance and runtime integration: not run.
- Global references, queue, state, metadata and normalization registries: untouched.
- Git: untouched.

The next production phase must merge the fragment through the reviewed-reference process, author weapon-specific prompts instead of reusing the BLOCKED queue prose, and independently review identity, anatomy, shotgun mechanics, 40-pose chronology, scale, physical anchors and cell isolation. Any later bitmap remains original fan-made work with `canonExact=false`.
