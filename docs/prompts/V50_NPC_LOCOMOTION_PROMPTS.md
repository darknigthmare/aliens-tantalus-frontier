# Prompts exacts v50 — PNJ Echo-9

Mode : OpenAI ImageGen intégré, un appel distinct par plaque. Les trois PNG
retournés étaient RGB avec un damier incrusté. Ils ont été normalisés par
`scripts/process-npc-sheets.py` en atlas RGBA 1024×1024 : grille 4×4, cellules
256×256, marge minimale de 16 px et ligne de pieds commune à `y=240` dans
chaque cellule.

## Sources ImageGen

| Asset final | Source intégrée |
| --- | --- |
| `assets/openai/sprites/npcs/mara-vega-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-7ad1-7a91-a902-95f42aa3d08a\exec-73237971-8fda-4a2f-a3d2-cdcf7436f24c.png` |
| `assets/openai/sprites/npcs/idris-kwan-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-7ad1-7a91-a902-95f42aa3d08a\exec-bc339dd2-1318-4748-86ae-13ec16d13a31.png` |
| `assets/openai/sprites/npcs/noor-okafor-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-7ad1-7a91-a902-95f42aa3d08a\exec-7ebdc041-b5fe-425a-819c-3d41a830dff0.png` |

## Mara Vega

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, Mara Vega, commander of Echo-9, shown in sixteen sequential animation cells.
Subject: adult woman starship commander, practical athletic build, warm tan complexion, short dark hair secured under a compact communications cap, original olive-drab and charcoal colonial-military command fatigues, compact armored vest, restrained red command accent, headset, small utility belt, no visible insignia or readable markings. Preserve exactly the same face, body proportions, clothing, equipment, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and readable silhouette, grounded retro-futurist industrial survival-horror aesthetic, not concept art, not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; each cell is the same footprint with at least 16 pixels of genuinely transparent padding on every side; one complete full-body character only per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every cell; no body part or prop crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame idle breathing loop, subtle weight shift.
Row 2: four-frame walk cycle, contact, down, passing, up.
Row 3: four-frame command work cycle using a small blank tactical slate and headset gesture.
Row 4: four-frame alert reaction cycle, notice, brace, low defensive stance, recover.
Lighting/mood: neutral soft upper-left game lighting, restrained readable highlights.
Constraints: genuinely transparent RGBA background, no checkerboard, no colored or opaque backdrop, no floor, no cast shadow outside the character, no grid lines, dividers, labels, letters, numbers, captions, UI, logo, watermark or border; no duplicate characters inside a cell; exactly sixteen cells and exactly one Mara Vega per cell; all hands, head, equipment and feet contained inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, costume changes, weapon firing, muzzle flash, text, montage layout, contact-sheet labels.
```

## Idris Kwan

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, Idris Kwan, Echo-9 engineer, shown in sixteen sequential animation cells.
Subject: adult male starship engineer, lean sturdy build, medium-brown complexion, close-cropped black hair, original slate-blue and worn olive engineering coveralls, charcoal reinforced knees and elbows, compact tool harness, insulated gloves, small amber utility lights with no symbols, folded welding visor above the brow. Preserve exactly the same face, body proportions, clothing, tools, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and readable silhouette, grounded retro-futurist industrial survival-horror aesthetic, not concept art, not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; each cell is the same footprint with at least 16 pixels of genuinely transparent padding on every side; one complete full-body character only per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every cell; no body part or tool crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame idle breathing loop, subtle tool-belt settling.
Row 2: four-frame walk cycle, contact, down, passing, up.
Row 3: four-frame engineering work cycle, inspect with compact scanner, reach, tighten with short wrench, confirm.
Row 4: four-frame hazard reaction cycle, notice warning, flinch, protective crouch, recover.
Lighting/mood: neutral soft upper-left game lighting, restrained readable highlights.
Constraints: genuinely transparent RGBA background, no checkerboard, no colored or opaque backdrop, no floor, no cast shadow outside the character, no grid lines, dividers, labels, letters, numbers, captions, UI, logo, watermark or border; no loose tools outside the character silhouette; no duplicate characters inside a cell; exactly sixteen cells and exactly one Idris Kwan per cell; all hands, head, tools and feet contained inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, costume changes, weapon firing, sparks leaving the cell, text, montage layout, contact-sheet labels.
```

## Noor Okafor

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, Noor Okafor, Echo-9 corpsman, shown in sixteen sequential animation cells.
Subject: adult Black woman combat corpsman, compact athletic build, deep-brown complexion, dark braids secured beneath a low-profile medical field cap, original muted off-white and desaturated green pressure-cloth uniform, compact hard-shell medpack, trauma pouches, gloves, restrained cyan medical status light with no symbol. Preserve exactly the same face, body proportions, hair, clothing, medpack, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and readable silhouette, grounded retro-futurist industrial survival-horror aesthetic, not concept art, not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; each cell is the same footprint with at least 16 pixels of genuinely transparent padding on every side; one complete full-body character only per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every standing cell, with crouched work frames anchored to that same ground baseline; no body part or medical tool crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame idle breathing loop, subtle medpack movement.
Row 2: four-frame walk cycle, contact, down, passing, up.
Row 3: four-frame corpsman work cycle, kneel, scan with compact blank medical scanner, apply treatment, rise.
Row 4: four-frame emergency reaction cycle, hear alert, duck, shield face and medpack, recover.
Lighting/mood: neutral soft upper-left game lighting, restrained readable highlights.
Constraints: genuinely transparent RGBA background, no checkerboard, no colored or opaque backdrop, no floor, no cast shadow outside the character, no grid lines, dividers, labels, letters, numbers, captions, UI, medical cross, logo, watermark or border; no blood or gore; no duplicate characters inside a cell; exactly sixteen cells and exactly one Noor Okafor per cell; all hands, head, equipment and feet contained inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, costume changes, weapon firing, text, montage layout, contact-sheet labels.
```
