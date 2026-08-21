# Prompts exacts v52 — PNJ Echo-9, vague 1

Mode : OpenAI ImageGen intégré (`image_gen` built-in), avec un appel distinct par
plaque. Aucune image officielle ou externe n'a été fournie au générateur. Les
identités et rôles viennent du registre projet `src/content-core-v50.js`; la
structure reprend le contrat NPC v50 existant : grille 4×4, cellules 256×256,
clips idle/marche/travail/alerte, pivot pieds et hitbox humanoïde.

Les sorties ImageGen étaient des PNG RGB 1254×1254 avec un damier incrusté.
Les masters sont conservés tels quels, puis normalisés par le script existant
`scripts/process-npc-sheets.py` en atlas RGBA 1024×1024 avec garde de 16 px et
ligne de pieds commune à `y=239` dans chaque cellule.

## Sources, destinations et empreintes

| Personnage | Source ImageGen intégrée | Master brut workspace — SHA-256 | Atlas normalisé workspace — SHA-256 |
| --- | --- | --- | --- |
| Rook | `C:\Users\chuck\.codex\generated_images\01a02202-6aae-7750-9983-99f7b5d0ffe2\exec-d35976d8-c308-4a4e-af80-86ce6d6cc988.png` | `assets/openai/sprites/npcs/rook-locomotion-sheet.png` — `25cf76bd1a5a3ac562de06a9e3f7f309bf3d182038ba11444db62f70367909bc` | `assets/openai/sprites/normalized/npcs/rook-locomotion-sheet.png` — `96fa8b879c3ecf3ceae35d4457ffbb47b8c970391cb8f3706c93a4db270d7331` |
| Inez Harlow | `C:\Users\chuck\.codex\generated_images\01a02202-6aae-7750-9983-99f7b5d0ffe2\exec-dcaf239d-42d4-4b26-813a-f3d263bc8006.png` | `assets/openai/sprites/npcs/inez-harlow-locomotion-sheet.png` — `4f5e8cd4d8a2548d15c91cdd02e0f940543587647a8b479be8bf9931ab41e2ff` | `assets/openai/sprites/normalized/npcs/inez-harlow-locomotion-sheet.png` — `dd0e93df51e4240ac0a91e2cee6d2b824688afaee88f12a0e86c7ea7e1ed0a92` |
| DAVID-8R | `C:\Users\chuck\.codex\generated_images\01a02202-6aae-7750-9983-99f7b5d0ffe2\exec-f2ec05cd-31b0-464d-902d-3cdf18fc6b7f.png` | `assets/openai/sprites/npcs/david-8r-locomotion-sheet.png` — `76244e868899996312fee03ae9b678d115ac1499a185f3e16b30b65c327b4c94` | `assets/openai/sprites/normalized/npcs/david-8r-locomotion-sheet.png` — `e70554f1edc05bfbb8f00d765b96b168a855b90cfe5d3b4a88f50102874ca61a` |

## Validation des atlas normalisés

| Personnage | Taille / mode | Cellules occupées | Cellules uniques | Garde 16 px | RGB caché | Baseline |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Rook | 1024×1024 RGBA | 16/16 | 16/16 | 0 violation | 0 pixel | `y=239`, 16/16 |
| Inez Harlow | 1024×1024 RGBA | 16/16 | 16/16 | 0 violation | 0 pixel | `y=239`, 16/16 |
| DAVID-8R | 1024×1024 RGBA | 16/16 | 16/16 | 0 violation | 0 pixel | `y=239`, 16/16 |

## Rook

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 named NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, Rook, Echo-9 recon marine, shown in sixteen sequential animation cells.
Subject: adult male reconnaissance marine, lean athletic build, medium-brown complexion, close-cropped dark hair beneath a low-profile soft patrol cap, original matte charcoal and desaturated forest-green reconnaissance fatigues, lightweight segmented chest rig, reinforced knees, compact field pack, subdued blue-gray recon accent, small blank motion tracker and compact original side-profile carbine with no readable markings. Preserve exactly the same face, body proportions, hair, uniform, armor, tracker, carbine dimensions, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and a strong readable silhouette, grounded retro-futurist industrial survival-horror aesthetic matching a polished modern side-scroller, not concept art and not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; every cell has the same footprint and at least 20 pixels of genuinely transparent padding on every side; exactly one complete full-body Rook per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every standing cell and low poses remain anchored to that baseline; no body part, pack, tracker or carbine crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame idle breathing loop at low-ready, subtle scan and weight shift.
Row 2: four-frame cautious walk cycle, contact, down, passing, up.
Row 3: four-frame reconnaissance work cycle, raise blank motion tracker, scan, give compact silent hand signal, return to low-ready.
Row 4: four-frame alert reaction cycle, detect contact, snap to ready without firing, low defensive stance, recover.
Lighting/mood: neutral soft upper-left game lighting with restrained cool highlights, readable on dark ship interiors.
Constraints: genuinely transparent RGBA background; exact 4×4 layout; exactly sixteen distinct sequential frames; no checkerboard, colored or opaque backdrop, floor, cast shadow, grid lines, dividers, labels, letters, numbers, captions, UI, insignia, logo, watermark or border; no muzzle flash, projectile, blood or gore; one Rook only per cell; all head, hands, feet and equipment fully inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, identity or costume changes, oversized weapon, firing, duplicate pose, cropped sprite, montage labels.
```

## Inez Harlow

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 named NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, Inez Harlow, Echo-9 xenobiologist, shown in sixteen sequential animation cells.
Subject: adult Latina woman xenobiologist, practical slender build, warm olive complexion, dark wavy hair tied into a compact low bun beneath a clear raised protective hood collar, original muted ivory, desaturated teal and charcoal field-science pressure-cloth uniform, compact sealed sample case on the hip, fitted gloves, small blank bioscanner, restrained violet specimen-status lights with no symbols. Preserve exactly the same face, body proportions, hair, uniform, hood collar, case, scanner, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and a strong readable silhouette, grounded retro-futurist industrial survival-horror aesthetic matching a polished modern side-scroller, not concept art and not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; every cell has the same footprint and at least 20 pixels of genuinely transparent padding on every side; exactly one complete full-body Inez Harlow per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every standing cell and crouched work poses remain anchored to that baseline; no body part, hood, sample case, scanner or tool crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame idle breathing loop, subtle sample-case and scanner check.
Row 2: four-frame careful walk cycle, contact, down, passing, up.
Row 3: four-frame xenobiology work cycle, kneel with sealed case, scan a compact closed sample capsule held close to the body, log on blank scanner, rise.
Row 4: four-frame contamination alert reaction, detect warning, seal raised hood around face, protective crouch, recover.
Lighting/mood: neutral soft upper-left game lighting with restrained teal-violet highlights, readable on dark laboratories.
Constraints: genuinely transparent RGBA background; exact 4×4 layout; exactly sixteen distinct sequential frames; no checkerboard, colored or opaque backdrop, floor, cast shadow, grid lines, dividers, labels, letters, numbers, captions, UI, medical cross, insignia, logo, watermark or border; no alien creature, loose sample, fluid, blood or gore; one Inez only per cell; all head, hands, feet and equipment fully inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, identity or costume changes, open specimen, tentacles, weapon firing, duplicate pose, cropped sprite, montage labels.
```

## DAVID-8R

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 named NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, DAVID-8R, recovered field synthetic and infiltration specialist, shown in sixteen sequential animation cells.
Subject: adult male-presenting human-proportioned synthetic, lean precise build, pale neutral synthetic complexion, neat dark-blond hair combed back, calm expression, subtle repaired seam at the right temple and one restrained amber diagnostic light, original weathered dark graphite service suit with muted stone-gray infiltration vest, flexible reinforced joints, close-fitting gloves and boots, compact blank diagnostic probe and slim sealed utility pouch, no branding. Clearly synthetic through restrained seams and movement, not a robot or armored cyborg. Preserve exactly the same face, body proportions, hair, repair seams, suit, vest, tools, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and a strong readable silhouette, grounded retro-futurist industrial survival-horror aesthetic matching a polished modern side-scroller, not concept art and not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; every cell has the same footprint and at least 20 pixels of genuinely transparent padding on every side; exactly one complete full-body DAVID-8R per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every standing cell and low work poses remain anchored to that baseline; no body part, pouch, probe or cable crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame unnaturally still synthetic idle loop, subtle eye focus and diagnostic pulse.
Row 2: four-frame controlled quiet walk cycle, contact, down, passing, up.
Row 3: four-frame infiltration work cycle, inspect a compact blank access probe, extend it toward an implied panel close to the body, run diagnostic, conceal tool.
Row 4: four-frame threat and damage reaction cycle, register alert, defensive turn without weapon, brief synthetic motor glitch with a tiny contained white fluid mark at temple seam, recover to calm stance.
Lighting/mood: neutral soft upper-left game lighting with restrained amber highlights, readable on dark industrial corridors.
Constraints: genuinely transparent RGBA background; exact 4×4 layout; exactly sixteen distinct sequential frames; no checkerboard, colored or opaque backdrop, floor, cast shadow, grid lines, dividers, labels, letters, numbers, captions, UI, insignia, logo, watermark or border; no exposed metal skull, robotic limbs, cables leaving the body, weapon firing, blood or gore; one DAVID-8R only per cell; all head, hands, feet and tools fully inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, identity or costume changes, humanoid robot armor, glowing eyes, oversized damage, duplicate pose, cropped sprite, montage labels.
```
