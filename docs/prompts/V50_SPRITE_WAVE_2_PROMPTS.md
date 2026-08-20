# Prompts exacts v50 — vague 2 sprites runtime

Mode : OpenAI ImageGen integre. Un appel distinct a ete effectue pour chaque asset. Les sorties sont conservees comme masters bruts et ne sont pas normalisees dans cette vague.

## Sources et controles

| Asset workspace | Source ImageGen | SHA-256 | Controle brut |
|---|---|---|---|
| `assets/openai/sprites/enemies/facehugger-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-59ea-7bf2-919e-3f130d10608f\exec-eed6406d-74a2-430a-90a8-5a9eb5418ce4.png` | `bf57e7d3374a37c244b761208089abc8c678c6e901ab3b975e53dc3ddf82afe8` | 1254x1254 RGB, damier opaque |
| `assets/openai/sprites/enemies/working-joe-combat-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-59ea-7bf2-919e-3f130d10608f\exec-aecce00e-b6bc-4159-8863-5d97ef770e65.png` | `557ca9d82b982223f97e60b93e11a86657cbcd014ae07e78231333f74c1529c4` | 1254x1254 RGB, damier opaque |
| `assets/openai/sprites/weapons/m41a-pulse-rifle-action-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-59ea-7bf2-919e-3f130d10608f\exec-402fbc3e-1e4f-42f2-9219-5157c19a664a.png` | `c312707b227459af27b4c430c0d1a336185d4c696ab6340d46b95d601e59c48f` | 1254x1254 RGB, damier opaque |

Malgre la demande explicite, les sorties ne possedent pas de canal alpha. La normalisation centrale devra retirer le damier, reconstruire un atlas RGBA 1024x1024, recentrer ou reduire les sujets dans chaque cellule et verifier une garde interne reelle. Dix cellules du Facehugger, quatorze du Working Joe et les seize cellules du fusil approchent a moins de 20 px d'au moins une limite dans le master brut. Le fusil reste coherent, mais la distinction semantique reload/jam est moins nette que la sequence demandee et doit etre validee avant son raccordement aux clips.

## `facehugger-locomotion-sheet.png`

```text
Use case: stylized-concept
Asset type: production 2D side-scrolling enemy sprite sheet
Primary request: Create one exact 4 by 4 animation sprite sheet for one facehugger creature. The SAME single facehugger must appear in all sixteen cells with perfectly consistent pale-beige chitin, eight spider-like legs, central body, paired grasping finger structures, ventral proboscis proportions, and one long muscular segmented tail. Target canvas 1024 by 1024 pixels, four equal 256 by 256 cells.
Scene/backdrop: genuinely transparent RGBA background only.
Subject: one small parasitic facehugger designed as a readable side-scrolling Metroidvania enemy, strict orthographic full side profile facing right in every frame, faithful biomechanical-organic anatomy, same scale and identity throughout.
Style/medium: polished hand-painted 2D game sprite, cinematic biological horror, crisp silhouette, damp leathery chitin and tendon detail, restrained cold rim light, animation-ready rather than unrelated concept poses.
Composition/framing: exact four columns and four rows, exactly one complete centered facehugger per cell, at least 20 fully transparent pixels of guard space inside every cell on all sides. Curl or pose the tail completely inside its own cell; no leg, finger, tail, fluid, debris or shadow crosses a cell boundary.
Animation layout, left to right:
Row 1: four-frame tense idle loop — compact crouch, subtle body lift, tail flex, return toward compact crouch.
Row 2: four-frame fast scuttle locomotion loop — alternating front and rear leg contacts with a stable low body pivot.
Row 3: leap-to-attach sequence without a host — compressed launch, takeoff, airborne spread, grasping attach posture around an invisible target; keep the full creature visible.
Row 4: hurt-to-death sequence — sharp recoil, weakened collapse, curled dying posture, final readable death-lock; no gore or dismemberment.
Color palette: bone beige, pale tan, muted gray-pink joints, restrained wet specular highlights.
Materials/textures: leathery carapace, tendons, joint ridges, muscular tail.
Constraints: exactly sixteen cells and one complete same facehugger per cell; true transparent alpha; stable scale, side profile and lighting; no egg, chestburster, adult xenomorph, host, human, other creature or extra facehugger; no detached anatomy; no blood or gore; no grid lines, cell backgrounds, checkerboard, floor, scenery, text, letters, numbers, logo, UI, border, labels, captions, watermark, contact-sheet annotations, or copied key art.
Avoid: top-down view, frontal view, three-quarter perspective, inconsistent leg count, anatomy drift, cropped tail, tail entering another cell, oversized subject, opaque black/white/gray background, checkerboard transparency preview.
```

## `working-joe-combat-sheet.png`

```text
Use case: stylized-concept
Asset type: production 2D side-scrolling hostile android sprite sheet
Primary request: Create one exact 4 by 4 animation sprite sheet for one hostile industrial service android. The SAME single Working-Joe-type android must appear in all sixteen cells with perfectly consistent pale molded synthetic face, short dark hair, blank expression, heavy industrial coveralls, reinforced work boots, utility belt, gloves, body proportions, and no branding. Target canvas 1024 by 1024 pixels, four equal 256 by 256 cells.
Scene/backdrop: genuinely transparent RGBA background only.
Subject: one unsettling mass-produced humanoid industrial android, strict full-body orthographic side profile facing right, designed as a readable side-scrolling survival-horror enemy. Its identity, clothing, scale and silhouette must remain unchanged throughout.
Style/medium: polished hand-painted 2D game sprite, grounded retro-futurist industrial science-fiction, realistic worn fabric and synthetic skin, crisp silhouette, restrained cold rim light, animation-ready rather than sixteen unrelated poses.
Composition/framing: exact four columns and four rows, exactly one complete centered android per cell, at least 20 fully transparent pixels of guard space inside every cell on all sides. Stable center-bottom ground pivot for grounded frames; no hand, foot, head, debris, fluid or shadow crosses a boundary.
Animation layout, left to right:
Row 1: idle-to-walk loop — rigid idle, right-foot contact, passing pose, left-foot contact; mechanical posture and stable torso volume.
Row 2: grab-to-punch attack sequence — reaching grab, firm two-hand seize posture without a victim, punch wind-up, punch follow-through; keep hands fully inside each cell.
Row 3: hurt reaction sequence — minor stagger, torso recoil, knee buckle, recovery attempt; same intact android, no dismemberment.
Row 4: damaged-to-death sequence — visibly torn coverall and exposed synthetic mechanisms, unstable step, collapse, final inert death-lock; keep damage progressive and readable, no gore.
Color palette: faded beige-gray coveralls, pale waxy synthetic skin, dark work boots, muted steel internals, restrained amber service light.
Materials/textures: industrial canvas fabric, molded polymer skin, rubber boots, brushed metal endoskeleton, small traces of white synthetic fluid only in damaged frames.
Constraints: exactly sixteen cells and one complete same android per cell; true transparent alpha; consistent face, hair, clothing, body, scale, side profile and lighting; no human, victim, weapon, other android or extra character; no alternate costume; no blood, gore or detached limbs; no grid lines, cell backgrounds, checkerboard, floor, scenery, text, letters, numbers, badge, emblem, logo, UI, border, labels, captions, watermark, contact-sheet annotations, or copied key art.
Avoid: frontal or three-quarter views, friendly expression, heroic military armor, pose drift, costume drift, cropped hands or feet, opaque black/white/gray background, checkerboard transparency preview.
```

## `m41a-pulse-rifle-action-sheet.png`

```text
Use case: stylized-concept
Asset type: production 2D side-scrolling modular weapon sprite sheet
Primary request: Create one exact 4 by 4 animation sprite sheet for one original M41A-inspired colonial pulse rifle. The SAME single compact retro-futurist science-fiction rifle must appear in all sixteen cells with perfectly consistent receiver length, carry handle, barrel, compact stock, under-barrel launcher housing, magazine well, grip, iron sights, materials and olive-drab finish. It must be an original project interpretation with no branding or readable markings. Target canvas 1024 by 1024 pixels, four equal 256 by 256 cells.
Scene/backdrop: genuinely transparent RGBA background only.
Subject: one isolated rifle, no character and no hands, strict orthographic full side profile pointing right in every frame, designed as a modular side-scrolling weapon layer.
Style/medium: polished hand-painted 2D game sprite, grounded retro-futurist industrial military science-fiction, crisp silhouette, realistic worn painted metal, consistent neutral-cold lighting, animation-ready rather than unrelated weapon concepts.
Composition/framing: exact four columns and four rows, exactly one complete centered rifle per cell, at least 24 fully transparent pixels of guard space inside every cell on all sides. Use the same stable grip/stock anchor in every frame; no barrel, stock, magazine, muzzle flash, casing, smoke, spring, loose part or shadow crosses a boundary.
Animation layout, left to right:
Row 1: idle/readiness states — safe, ready, subtle powered indicator, return to safe; rifle geometry remains fixed.
Row 2: firing recoil sequence — neutral aim, compact muzzle flash and slight recoil, rear recoil position with one small casing, return/recovery; flash and casing stay inside the cell.
Row 3: reload sequence without hands — magazine seated, magazine partly released, magazine aligned below the well, fresh magazine fully seated and bolt ready; at most one detached magazine in its own cell.
Row 4: jam-and-inspect sequence without hands — normal profile, ejection-port obstruction visible, chamber/ejection port opened for inspection, cleared and returned to ready; preserve the same complete rifle.
Color palette: worn olive-drab receiver, charcoal grip and stock, dark gunmetal barrel, restrained amber status light.
Materials/textures: painted stamped metal, brushed steel, reinforced polymer, light edge wear, subtle oil.
Constraints: exactly sixteen cells and one complete same rifle per cell; true transparent alpha; strict side view, stable anchor, scale, geometry, material and lighting; no person, hand, arm, sling, second weapon or alternate model; no bullet counter text; no readable display; no text, letters, numbers, logos, emblems, UI, grid lines, cell backgrounds, checkerboard, floor, scenery, border, labels, captions, watermark, contact-sheet annotations, or copied key art.
Avoid: three-quarter perspective, front view, fantasy weapon, modern real-world assault-rifle silhouette, changing barrel or stock, inconsistent magazine size, cropped parts, oversized muzzle flash or smoke, opaque black/white/gray background, checkerboard transparency preview.
```
