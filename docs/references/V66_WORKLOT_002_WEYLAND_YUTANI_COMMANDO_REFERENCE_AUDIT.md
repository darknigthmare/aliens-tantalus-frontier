# V66 Worklot 002 — Weyland-Yutani Commando reference audit

Date: 2026-09-01
Scope: `enemy-043-weyland-yutani-commando` reference phase only
Decision: `CANON_REFERENCE`, `EXACT_EXTERNAL_MODEL`, `canonExact=false`

## Outcome

The target is the helmeted corporate commando introduced in *Alien 3*, not a generic Weyland-Yutani mercenary and not the modern Fireteam SpecOps reinterpretation. The production lock is an original right-facing gameplay adaptation of the bulky white APEsuit, with its distinctive Terry English helmet and one M41A Pulse Rifle.

No external bitmap was downloaded or embedded. No image was generated. The URLs below are study and provenance references only.

## Evidence hierarchy

1. **20th Century Studios — Alien 3**: primary rightsholder continuity page. It fixes the source work but does not expose enough costume construction detail to drive a sprite alone.
   https://www.20thcenturystudios.com/movies/alien-3
2. **Propstore / Terry English helmet archive**: accessible archive entry for a replica made by the original Alien 3 armorer. It explicitly documents Pulse Rifles, gray fiberglass dome, aluminum face mask/visor, hinged green-tinted welding goggles and black chin strap. The replica status is retained as a limitation.
   https://propstore.com/product/alien-1992/27-terry-english-made-weyland-yutani-commando-helmet-replica/
3. **Free League / 20th Century Studios licensed ALIEN RPG rules**, pages 11 and 14: the commando loadout is APEsuit, M41A Pulse Rifle, flashlight and catch pole; the APEsuit is explicitly the Weyland-Yutani armor. This is the strongest exact equipment-name source.
   https://freeleaguepublishing.com/wp-content/uploads/2023/09/ALIEN-Evolved-Edition-Miniatures-Set-Rapture-Protocol-rules-booklet.pdf
4. **Nintendo Europe — Aliens: Infestation**: publisher-provided page confirming the retro side-scroller and pulse-rifle combat context. It does not prove this costume and is not used as a costume source.
   https://www.nintendo.com/en-gb/Games/Nintendo-DS/Aliens-Infestation-270000.html
5. **Licensed NECA figure review, secondary cross-check**: accessible multi-angle photographs corroborate layered off-white/tan padding, silver fittings, backpack, cage helmet and M41A relationships hidden in the film's brief shots. It may not override the primary/licensed sources.
   https://figurefanzero.com/2016/10/11/alien-3-weyland-yutani-commando-by-neca/

All five URLs were reachable during this audit. The Xenopedia summary was consulted during discovery but intentionally excluded from the locked URL list because the stronger licensed rulebook and prop archive directly cover the decisive equipment and helmet facts.

## Locked design

- **Silhouette:** recognizably human yet bulky, sealed and layered; large enclosed helmet, padded arms/lower legs, compact backpack, heavy boots and one compact long gun.
- **Armor:** dirty matte off-white/cream APEsuit with restrained tan reinforced sections and gray-silver fittings. Dark joints and gloves keep limb articulation readable.
- **Helmet:** gray dome; aluminum plate-and-cage lower face guard; paired green-tinted welding goggles down in combat; face fully concealed. This asymmetric industrial helmet is the strongest identity landmark.
- **Weapon:** exactly one dark charcoal/black M41A Pulse Rifle. Black is a documented variant and is selected as the project finish because it remains legible against the pale suit. It must keep one stable stock/shroud/barrel/foregrip/underslung-launcher silhouette across all five clips.
- **Equipment boundary:** flashlight may remain integrated/subordinate. Catch pole and boot knife are documented but excluded from this assault firearm profile because `reload` requires one stable M41A loadout. They belong to separate capture/melee variants if ever authored.
- **View:** strict orthographic right profile. Helmet, backpack, both hands and complete muzzle stay readable; the rifle never points at the viewer.

## Decisions that are adaptations, not canon claims

- The exact shade and black weapon finish are production choices among documented variants.
- Forty side-view animation poses, their spacing, timing, scale and anchors do not exist as canonical source material.
- Omitting the catch pole from this firearm profile is a gameplay/readability decision, not a claim that commandos never carried one.
- The V56 project sheet is project-owned continuity evidence, not proof of official proportions.

## Prohibited drift

- Colonial Marine olive M3 armor or uncovered USCMC helmet.
- Modern black corporate SpecOps, Fireteam redesign, ODST/power armor or generic gas-mask soldier.
- Bubble astronaut helmet, exposed face, opaque black motorcycle visor or missing face cage.
- NSG23, smartgun, flamethrower, energy rifle, invented optics/suppressors or weapon morphing during reload.
- Giant readable corporate text/logo, invented rank/unit markings, scenery, floor, shadows, UI or official bitmap reuse.

## Local continuity evidence

- Raw V56 predecessor: `assets/openai/sprites/enemies/weyland-yutani-commando-action-sheet-v56.png`, 1254×1254 RGBA, SHA-256 `73c70bed8a5e1e269cf17dfe00d657e2b729166fe7fb1a341d8e1c7acf5ca8a6`.
- Normalized V56 predecessor: `assets/openai/sprites/normalized/enemies/weyland-yutani-commando-action-sheet-v56.png`, 1024×1024 RGBA, SHA-256 `6e932e77244abc0186b0258812ef1391628d597147c560c77c3c11c813b7d918`.
- Runtime precedent: `npc-standing`, 96×132 render envelope, `humanoid-feet`, source facing right.

These images may inform palette, broad silhouette, cell scale and motion continuity only. They must not be enlarged, traced or treated as ready V66 boards.

## Gate status

- Reference lock: complete locally.
- Generation: not authorized by this fragment.
- ImageGen calls: 0.
- Generated boards: 0.
- Normalization/acceptance/runtime integration: not run.
- Global queue/state/reference registries: untouched.
- Git: untouched.

The next production step must first merge this fragment through the normal reviewed-reference process. Any later generation remains `canonExact=false` and requires independent identity, weapon, 40-pose anchor/scale, cell-bound and animation-loop review.
