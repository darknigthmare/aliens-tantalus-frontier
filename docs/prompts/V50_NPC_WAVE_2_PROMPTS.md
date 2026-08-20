# Prompts exacts v50 — PNJ Echo-9, vague 2

Mode : OpenAI ImageGen intégré, un appel distinct par plaque. Les trois sorties
étaient des PNG RGB 1254×1254 avec un damier incrusté. Elles ont été normalisées
par `scripts/process-npc-sheets.py` en atlas RGBA 1024×1024 : grille 4×4,
cellules 256×256, marge minimale de 16 px et ligne de pieds commune à `y=240`
dans chaque cellule.

## Sources ImageGen

| Asset final | Source intégrée |
| --- | --- |
| `assets/openai/sprites/npcs/tamsin-velez-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-7ad1-7a91-a902-95f42aa3d08a\exec-d0710774-822a-4a36-9dcd-10b61569187e.png` |
| `assets/openai/sprites/npcs/sanaa-doyle-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-7ad1-7a91-a902-95f42aa3d08a\exec-267816db-cf9b-415c-b355-f69cf097aeac.png` |
| `assets/openai/sprites/npcs/maksim-orlov-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-7ad1-7a91-a902-95f42aa3d08a\exec-17dd6c1f-9a54-40c0-8d6a-24b76aa09518.png` |

## Tamsin Velez

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 named NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, Tamsin Velez, Echo-9 assault sergeant, shown in sixteen sequential animation cells.
Subject: adult woman assault sergeant, compact athletic build, medium olive complexion, dark auburn hair secured beneath a low-profile communications helmet, original olive-drab combat fatigues, charcoal modular assault vest, reinforced knees and forearms, muted burgundy squad accent, compact side-profile assault carbine held safely with no readable markings. Preserve exactly the same face, body proportions, hairstyle, uniform, armor, carbine dimensions, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and a strong readable silhouette, grounded retro-futurist industrial survival-horror aesthetic matching a modern side-scroller, not concept art and not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; every cell has the same footprint and at least 16 pixels of genuinely transparent padding on every side; exactly one complete full-body Tamsin per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every standing cell and all low poses stay anchored to that baseline; no body part or carbine crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame idle breathing loop at low-ready, subtle weight shift.
Row 2: four-frame walk cycle with compact carbine, contact, down, passing, up.
Row 3: four-frame assault-sergeant work cycle, check chamber, inspect compact blank wrist display, give tactical hand signal, return to low-ready.
Row 4: four-frame alert reaction cycle, notice, snap to ready, low defensive crouch, recover.
Lighting/mood: neutral soft upper-left game lighting with restrained readable highlights.
Constraints: genuinely transparent RGBA background, no checkerboard, no colored or opaque backdrop, no floor, no cast shadow outside the character, no grid lines, dividers, labels, letters, numbers, captions, UI, logo, watermark or border; no muzzle flash, projectile, blood or gore; exactly sixteen cells and exactly one Tamsin Velez per cell; all hands, head, equipment, weapon and feet stay inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, costume changes, oversized rifle, weapon firing, text, montage layout or contact-sheet labels.
```

## Sanaa Doyle

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 named NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, Sanaa Doyle, Echo-9 smartgunner, shown in sixteen sequential animation cells.
Subject: adult Black woman heavy-weapons specialist, tall powerful build, deep-brown complexion, short tightly coiled black hair beneath a compact tracking headset, original desaturated olive and dark graphite heavy combat fatigues, reinforced torso armor, articulated waist-and-shoulder weapon harness, compact original smartgun with a short readable side silhouette and no markings, restrained amber sensor lights. Preserve exactly the same face, body proportions, hair, uniform, harness, smartgun size, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and a strong readable silhouette, grounded retro-futurist industrial survival-horror aesthetic matching a modern side-scroller, not concept art and not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; every cell has the same footprint and at least 16 pixels of genuinely transparent padding on every side; exactly one complete full-body Sanaa per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every standing cell and braced poses remain anchored to it; no body part, harness or smartgun crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame supported idle breathing loop, subtle harness suspension.
Row 2: four-frame heavy walk cycle, contact, down, passing, up, smartgun controlled by the harness.
Row 3: four-frame smartgunner work cycle, inspect feed housing, adjust tracker headset, test harness articulation, confirm ready.
Row 4: four-frame threat reaction cycle, acquire warning, raise smartgun without firing, wide braced stance, recover.
Lighting/mood: neutral soft upper-left game lighting with restrained readable highlights.
Constraints: genuinely transparent RGBA background, no checkerboard, no colored or opaque backdrop, no floor, no cast shadow outside the character, no grid lines, dividers, labels, letters, numbers, captions, UI, logo, watermark or border; no muzzle flash, projectile, loose ammunition, blood or gore; exactly sixteen cells and exactly one Sanaa Doyle per cell; all hands, head, equipment, smartgun and feet stay inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, costume changes, oversized barrel crossing cells, weapon firing, text, montage layout or contact-sheet labels.
```

## Maksim Orlov

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 named NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, Maksim Orlov, Echo-9 pilot, shown in sixteen sequential animation cells.
Subject: adult male dropship pilot, lean practical build, light complexion, close-cropped ash-brown hair, short stubble, original dark navy and muted rust flight suit, compact charcoal pressure vest, restrained orange rescue webbing, gloves, soft flight boots, low-profile flight helmet with raised amber visor and small headset, no readable patches or insignia. Preserve exactly the same face, body proportions, hair, stubble, flight suit, helmet, harness, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and a strong readable silhouette, grounded retro-futurist industrial survival-horror aesthetic matching a modern side-scroller, not concept art and not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; every cell has the same footprint and at least 16 pixels of genuinely transparent padding on every side; exactly one complete full-body Maksim per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every standing cell and low poses stay anchored to that baseline; no body part, helmet or handheld tool crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame idle breathing loop, subtle harness and headset movement.
Row 2: four-frame brisk walk cycle, contact, down, passing, up.
Row 3: four-frame pilot work cycle, check compact blank flight slate, adjust headset, inspect helmet seal, confirm checklist.
Row 4: four-frame emergency reaction cycle, hear alarm, brace against turbulence, protective crouch, recover.
Lighting/mood: neutral soft upper-left game lighting with restrained readable highlights.
Constraints: genuinely transparent RGBA background, no checkerboard, no colored or opaque backdrop, no floor, no cast shadow outside the character, no grid lines, dividers, labels, letters, numbers, captions, UI, logo, watermark or border; no vehicle, cockpit, weapon firing, blood or gore; exactly sixteen cells and exactly one Maksim Orlov per cell; all hands, head, helmet, equipment and feet stay inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, costume changes, opaque visor hiding identity, text, montage layout or contact-sheet labels.
```
