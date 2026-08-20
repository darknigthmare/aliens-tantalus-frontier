# Prompts exacts v50 — vague P0 sprites runtime

Mode : OpenAI ImageGen integre. Les trois sorties ci-dessous sont des masters de generation a normaliser avant usage runtime.

## Sources et controles

| Asset workspace | Source ImageGen | SHA-256 | Controle brut |
|---|---|---|---|
| `assets/openai/sprites/player/echo9-marine-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-59ea-7bf2-919e-3f130d10608f\exec-d0db8bf0-afe6-4b42-ac06-f2b95604c168.png` | `a987a6caab0ced444e0f4dfef73a46619cbf70e4f2dde5e52241347609304f46` | 1254x1254 RGB, damier opaque |
| `assets/openai/sprites/enemies/xenomorph-drone-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-59ea-7bf2-919e-3f130d10608f\exec-af8cd7b0-3872-44c9-bf7f-11a6dda1e71d.png` | `3ae94f09b41fd1cda03897e8874fb32fa89948ddbdfa020c543df9789765e66c` | 1254x1254 RGB, damier opaque |
| `assets/openai/sprites/vehicles/m577-apc-action-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-59ea-7bf2-919e-3f130d10608f\exec-c7f0b65b-d483-40fe-a452-b73731c0f95e.png` | `26945975af863854cbaffab32230da3314f97824cde1656276aa137cb148477d` | 1254x1254 RGB, damier opaque |

Les demandes de 1024x1024 RGBA transparent et de garde interne de 16 px n'ont pas ete respectees par la sortie brute. Le normaliseur doit supprimer le damier, remettre chaque sujet a l'echelle dans sa cellule, produire un atlas 1024x1024 RGBA et valider les gardes sans seulement effacer les bords. Certaines silhouettes touchent deja une limite de cellule dans les masters.

## `echo9-marine-locomotion-sheet.png`

```text
Use case: stylized-concept
Asset type: production 2D side-scrolling game character sprite sheet
Primary request: Create one exact 4 by 4 animation sprite sheet for the playable Echo-9 colonial marine. The SAME single marine must appear in all sixteen cells with perfectly consistent identity, face, body proportions, armor, olive-drab fatigues, helmet, backpack, boots, and compact retro-futurist pulse rifle. Target canvas 1024 by 1024 pixels, four equal 256 by 256 cells.
Scene/backdrop: genuinely transparent RGBA background only.
Subject: battle-worn human Echo-9 marine, strict full-body orthographic side profile facing right, feet and ground-contact pivot aligned identically in every grounded frame, readable silhouette for a modern cinematic Metroidvania.
Style/medium: polished hand-painted 2D game sprite, grounded 1980s industrial military science-fiction, crisp edges, realistic materials, coherent lighting from every frame, animation-ready rather than concept poses.
Composition/framing: exact four columns and four rows, one complete centered character per cell, at least 16 fully transparent pixels of guard space inside every cell on all four sides, no body part, gun, muzzle flash, shadow, debris, or equipment crosses a cell boundary.
Animation layout, left to right:
Row 1: four-frame subtle idle breathing loop — neutral, inhale, exhale, return toward neutral.
Row 2: four-frame side locomotion loop suitable for walk/run playback — right foot contact, passing pose, left foot contact, passing pose; clear arm and leg motion with stable torso volume.
Row 3: jump/fall sequence — takeoff compression, rising, apex, controlled fall/landing preparation; keep the subject fully inside each cell.
Row 4: crouch/climb sequence — crouched ready, crouch step, climb contact A, climb contact B; same marine and equipment.
Color palette: olive drab, charcoal armor, restrained amber indicators, natural skin, subtle cold rim light.
Materials/textures: worn fabric, painted composite armor, brushed metal, practical webbing.
Constraints: exactly sixteen cells and exactly one complete same marine per cell; true transparent alpha; stable center-bottom pivot; consistent scale; no perspective or camera changes; no additional characters; no costume changes; no alternate weapons; no detached body parts; no grid lines, cell backgrounds, checkerboard, floor, scenery, text, letters, numbers, logo, UI, border, labels, captions, watermark, contact-sheet annotations, shadows outside the subject, gore, or copied key art.
Avoid: isometric or three-quarter views, frontal poses, cropped feet or weapon, inconsistent anatomy, identity drift, frame-to-frame scale drift, oversized muzzle flashes, black/white/gray opaque background, checkerboard transparency preview.
```

## `xenomorph-drone-locomotion-sheet.png`

```text
Use case: stylized-concept
Asset type: production 2D side-scrolling enemy sprite sheet
Primary request: Create one exact 4 by 4 animation sprite sheet for one adult xenomorph drone. The SAME single drone must appear in all sixteen cells with perfectly consistent elongated smooth dome, eyeless biomechanical head, ribbed exoskeleton, digitigrade legs, dorsal tubes, inner-jaw proportions, hands, feet, and long segmented tail. Target canvas 1024 by 1024 pixels, four equal 256 by 256 cells.
Scene/backdrop: genuinely transparent RGBA background only.
Subject: a faithful black biomechanical xenomorph drone designed as a readable side-scrolling Metroidvania enemy, strict full-body orthographic side profile facing right in every frame; preserve one exact anatomy and scale across the sheet.
Style/medium: polished hand-painted 2D game sprite, cinematic biomechanical horror, crisp silhouette, moist black-chitin highlights, restrained cold rim light, animation-ready rather than sixteen unrelated concepts.
Composition/framing: exact four columns and four rows, exactly one complete centered creature per cell, at least 16 fully transparent pixels of guard space inside every cell on all sides. Curl the tail compactly within each cell without cutting it; no limb, tail, drool, debris, shadow, or acid crosses a boundary.
Animation layout, left to right:
Row 1: four-frame low idle breathing/threat loop, feet grounded and pelvis stable.
Row 2: four-frame predatory stalk-to-run locomotion loop — right contact, passing, left contact, passing — with stable center-bottom pivot.
Row 3: leap sequence — compressed anticipation, launch, airborne apex, landing preparation; entire creature and tail remain inside each cell.
Row 4: low crawl/vent locomotion loop — right contact, passing, left contact, passing — compact silhouette, no ceiling or wall.
Color palette: near-black graphite chitin, gunmetal gray ridges, very restrained blue-gray specular edge light, tiny neutral saliva highlights.
Materials/textures: biomechanical ribs, glossy carapace, tendon detail, segmented tail.
Constraints: exactly sixteen cells and one complete same drone per cell; true transparent alpha; consistent subject identity, anatomy, scale, side profile and lighting; stable pivots for grounded rows; no eggs, facehuggers, chestbursters, warriors, queens or other castes; no extra creatures; no detached limbs; no acid splash; no gore; no grid lines, cell backgrounds, checkerboard, floor, scenery, text, letters, numbers, logo, UI, border, labels, captions, watermark, contact-sheet annotations, or copied key art.
Avoid: perspective changes, frontal or three-quarter poses, oversized head, anatomy drift, cropped tail, tail entering another cell, fused limbs, opaque black/white/gray background, checkerboard transparency preview.
```

## `m577-apc-action-sheet.png`

```text
Use case: stylized-concept
Asset type: production 2D side-scrolling vehicle sprite sheet
Primary request: Create one exact 4 by 4 animation sprite sheet for one M577-style colonial armored personnel carrier. The SAME single eight-wheel APC must appear in all sixteen cells with perfectly consistent hull proportions, wheelbase, armor panels, cockpit, roof turret, antenna placement, olive-drab paint, weathering, and side markings removed. Target canvas 1024 by 1024 pixels, four equal 256 by 256 cells.
Scene/backdrop: genuinely transparent RGBA background only.
Subject: low-profile retro-futurist colonial military APC, strict orthographic full side profile facing right, full vehicle visible, wheels aligned to one stable ground-contact baseline in all grounded frames.
Style/medium: polished hand-painted 2D game vehicle sprite, grounded 1980s industrial military science-fiction, readable silhouette for a modern cinematic Metroidvania, crisp edges, consistent cold directional light.
Composition/framing: exact four columns and four rows, exactly one complete centered APC per cell, at least 16 fully transparent pixels of guard space inside every cell on all sides; no wheel, turret, antenna, muzzle flash, smoke, spark, debris, shadow, or armor piece crosses a cell boundary.
Animation layout, left to right:
Row 1: idle systems cycle — powered down, amber systems waking, fully ready, return toward idle; hull and wheels stay fixed.
Row 2: rolling locomotion loop — four sequential wheel-rotation and subtle suspension phases; identical hull size and placement.
Row 3: turret action sequence — turret neutral, aim/elevate, controlled short muzzle flash and recoil, recovery; keep flash compact inside the cell.
Row 4: damage progression — intact but strained, sparks and light smoke, heavier smoke with scorched panel, disabled wreck state; keep the same recognizable APC and do not remove major sections.
Color palette: military olive drab, charcoal rubber wheels, worn gunmetal, restrained amber/red system lights.
Materials/textures: weathered painted armor, brushed steel, dusty rubber, small practical lenses.
Constraints: exactly sixteen cells and one complete same APC per cell; true transparent alpha; stable scale, wheel baseline, orthographic side view, lighting and identity; no driver, passengers, people or creatures; no alternate vehicle models; no extra trailers; no scenery; no floor; no cast shadow outside subject; no grid lines, cell backgrounds, checkerboard, text, letters, numbers, emblems, logos, UI, border, labels, captions, watermark, contact-sheet annotations, or copied key art.
Avoid: perspective, three-quarter view, front view, changing wheel count, changing hull length, cropped antenna/turret/wheels, vehicle crossing cells, oversized fire or smoke, opaque black/white/gray background, checkerboard transparency preview.
```
