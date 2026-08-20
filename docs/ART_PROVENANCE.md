# Provenance artistique OpenAI

Date de génération : 20 août 2026. Fournisseur : OpenAI ImageGen. Les quatre fichiers sous `assets/openai/` ont été créés durant cette production et non copiés depuis un jeu. Les références servent à la fidélité d’un projet dont l’utilisateur déclare détenir la licence.

## Sources de direction visuelle

- [Focus Entertainment — correctif officiel citant Tantalus Base, son lift, la queen room, le P-5000, la mountain door et les sentries](https://support.focus-entmt.com/hc/en-us/articles/12816621940754-PC-PLAYSTATION-XBOX-UPDATE-AUGUST-1-2023)
- [Emilien Morisset / Tindalos — concepts de production Tantalus Base, extérieurs, intérieurs, process et props](https://arka.artstation.com/projects/1xRx88)
- [Tindalos Interactive — Aliens: Dark Descent Art Blast](https://magazine.artstation.com/2023/07/tindalos-interactive-aliens-dark-descent-art-blast/)
- [PlayStation — direction artistique rétro-technologique d’Alien: Isolation](https://blog.playstation.com/archive/2014/03/26/behind-terror-alien-isolation-exclusive-interview)
- [PlayStation — animation de la créature dans Alien: Isolation](https://blog.playstation.com/archive/2014/10/07/creative-assembly-brought-iconic-monster-life-alien-isolation)

## Prompts finaux

### `tantalus-base-environment.png`

> Create a production-ready 16:9 high-resolution pixel-art environment master for a licensed ALIENS side-scrolling Metroidvania game. Exact visual fidelity to the industrial language of Tantalus Base on Lethe from Aliens: Dark Descent, cross-referenced with retro-futurist cassette technology and used-future spacecraft interiors: a rain-lashed Weyland-Yutani mountain research base exterior flowing seamlessly into a cutaway corridor, heavy blast doors, freight lift, atmospheric pipes, grated catwalks, sentry emplacement, quarantine lab windows, power-loader bay, distant hive resin and a queen-chamber silhouette. Strict orthographic side-on gameplay camera, readable walkable floor, strong foreground/midground/background separation for parallax, ominous green-grey metal, sodium amber practical lights, red emergency accents, mist, rain and steam. Professional 32-bit pixel art with crisp clusters and rich material detail, cinematic but fully usable behind sprites. No characters, no UI, no text, no letters, no logos, no watermark, no collage, no border.

### `echo9-sprite-sheet.png`

> Create one production-ready transparent PNG pixel-art sprite sheet for a licensed ALIENS side-scrolling Metroidvania. A single consistent Colonial Marine hero from Echo-9 in faithful olive M3-style armor over fatigues, with pulse-rifle silhouette, plus a faithful cream-white frontier synthetic variant in a separate bottom band. Strict orthographic side view, no perspective, every cell same 160x160 footprint and feet on exactly the same baseline. Build a precise 8-column by 8-row grid with generous transparent gutters: rows 1 idle breathing (8 frames), 2 walk (8), 3 run (8), 4 crouch/aim (8), 5 rifle fire with muzzle-action recovery (8), 6 reload (8), 7 climb/vent crawl (8), 8 hurt/death transition and synthetic alternate frames (8). Consistent anatomy, armor, weapon size, light direction and palette across all 64 cells; crisp professional 32-bit pixel clusters, readable at gameplay scale. No scenery, no shadows outside each cell, no text, no labels, no grid lines, no logo, no watermark, no duplicate character within a cell.

### `xenomorph-sprite-sheet.png`

> Create one production-ready transparent PNG pixel-art sprite atlas for a licensed ALIENS side-scrolling Metroidvania, with exact creature silhouette fidelity and biomechanical detail. Strict orthographic side view and consistent 192x192 cells with feet/contact points on a shared baseline, generous transparent gutters, no perspective. Organize as a clean 8-column by 8-row atlas: Ovomorph opening cycle; Facehugger idle/run/leap; Chestburster crawl/strike; adult Drone stalk/walk/climb; Warrior run/slash/tail strike; Praetorian charge/hurt; Crusher and Spitter attack cycles; final row an oversized Queen idle/roar/ovipositor/tail attack sequence spanning compatible adjacent cells. Glossy black-brown biomechanical carapace, translucent highlights, readable inner jaws, faithful long domed cranium and segmented tail; restrained acid-green impact frames only. Every animation coherent from frame to frame, crisp professional 32-bit pixel clusters, readable at gameplay scale. Transparent background only, no scenery, no cast shadows beyond cell, no text, no labels, no grid lines, no logo, no watermark.

### `arsenal-props-atlas.png`

> Create one production-ready transparent PNG pixel-art prop and equipment atlas for a licensed ALIENS side-scrolling Metroidvania, faithful to the used-future Colonial Marine industrial design language. Strict orthographic side views or inventory-perfect three-quarter views, arranged in an exact clean 8-column by 6-row grid with equal cells and generous transparent gutters. Include distinct recognizable silhouettes for: M41A pulse rifle, M4A3 pistol, M56 smartgun and harness, M240 flamethrower, pump shotgun, scoped rifle, rocket launcher, grenades, motion tracker, access tuner, cutting torch, maintenance jack, portable medkit, armor, pressure suit helmet, portable battery, sentry gun deployed and folded, ammo and cargo crates, MU/TH/UR terminal, Seegson-style terminal, blast-door modules, vent grates, hive resin nodes, facehugger containment tube, P-5000 power loader, M577 APC, Cheyenne dropship, colony tractor, rover and evacuation beacon. Consistent scale within category, crisp professional 32-bit pixel clusters, green-grey metal, amber screens, red safety accents, believable wear and grime. No characters holding items, no scenery, transparent background, no text, no labels, no grid lines, no logos, no watermark.

## Traitement alpha vérifié

ImageGen a livré les atlas avec un damier de présentation opaque malgré la demande de transparence. L’édition ImageGen locale a été bloquée par l’ACL Windows; `scripts/clean-atlas-alpha.mjs` applique donc un flood-fill Canvas strictement technique sur le fond neutre connecté, sans redessiner les sprites. Les trois copies du projet sont vérifiées en PNG 32 bits ARGB, avec un alpha nul aux coins et 64 à 70 % de pixels transparents. La découpe et l’alignement final des cellules restent un gate par moteur, pas un défaut de provenance.
