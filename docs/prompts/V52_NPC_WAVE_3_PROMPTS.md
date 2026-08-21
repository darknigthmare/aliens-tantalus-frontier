# Prompts exacts v52 — PNJ Echo-9, vague 3

Date de production : 21 août 2026. Mode : **OpenAI ImageGen intégré**, avec
un appel distinct par plaque. Les trois masters sont des créations originales
générées pour ce projet ; aucun bitmap officiel n'est redistribué.

ImageGen a retourné trois PNG RGB 1254×1254 avec un damier clair incrusté.
Chaque master brut est conservé intact, puis `scripts/process-npc-sheets.py`
a produit un dérivé runtime RGBA 1024×1024 : grille 4×4, cellules 256×256,
16 cellules occupées, marge transparente de 16 px et ligne de pieds commune à
`y=240` dans chaque cellule.

## Sources ImageGen distinctes

| Personnage | Master brut du projet | Source ImageGen intégrée | Dérivé normalisé |
| --- | --- | --- | --- |
| Jun Park | `assets/openai/sprites/npcs/jun-park-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a021b7-47e2-7a53-8b15-aa45e39e1fd2\exec-ce668f5d-b49d-486a-b7c6-6bb8329742fe.png` | `assets/openai/sprites/normalized/npcs/jun-park-locomotion-sheet.png` |
| Asha Mbaye | `assets/openai/sprites/npcs/asha-mbaye-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a021b7-47e2-7a53-8b15-aa45e39e1fd2\exec-62a240a8-51dd-485e-af44-776badbc8a23.png` | `assets/openai/sprites/normalized/npcs/asha-mbaye-locomotion-sheet.png` |
| Pablo Reyes | `assets/openai/sprites/npcs/pablo-reyes-locomotion-sheet.png` | `C:\Users\chuck\.codex\generated_images\01a021b7-47e2-7a53-8b15-aa45e39e1fd2\exec-a791f25a-2eb6-4865-a9f5-9568059e64bf.png` | `assets/openai/sprites/normalized/npcs/pablo-reyes-locomotion-sheet.png` |

## Validation des dérivés

| Plaque | Mode / taille | Alpha nul | Cellules | Pixels occupés par cellule | Garde 16 px |
| --- | --- | ---: | ---: | ---: | ---: |
| Jun Park | RGBA 1024×1024 | 79,10 % | 16/16 | 11 277–15 151 | 0 violation |
| Asha Mbaye | RGBA 1024×1024 | 82,21 % | 16/16 | 10 260–12 186 | 0 violation |
| Pablo Reyes | RGBA 1024×1024 | 76,27 % | 16/16 | 13 346–15 954 | 0 violation |

Les quatre coins ont un alpha nul sur les trois dérivés. L'inspection visuelle
confirme une identité stable par personnage, quatre lignes lisibles
(idle, marche, travail de rôle, réaction d'alerte), un profil latéral cohérent
et aucun élément coupé par une cellule.

## Jun Park

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 named NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, Jun Park, Echo-9 starship technician, shown in sixteen sequential animation cells.
Subject: adult Korean man, lean compact practical build, light-medium warm complexion, short straight black hair, original graphite and muted teal maintenance coveralls, reinforced knees and forearms, compact cross-body diagnostic tool satchel, insulated gloves, narrow raised protective goggles, restrained lime-green inspection lights with no symbols. Preserve exactly the same face, body proportions, hair, uniform, satchel, tools, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and a strong readable silhouette, grounded retro-futurist industrial survival-horror aesthetic matching a modern side-scroller, not concept art and not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; every cell has the same footprint and at least 16 pixels of genuinely transparent padding on every side; exactly one complete full-body Jun Park per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every standing cell and all low poses remain anchored to that baseline; no body part, satchel or tool crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame idle breathing loop, subtle tool-satchel settling.
Row 2: four-frame technician walk cycle, contact, down, passing, up.
Row 3: four-frame technical work cycle, inspect a compact blank diagnostic device, extend a short insulated probe, adjust a panel connector held close to the body, confirm repair.
Row 4: four-frame machinery alarm reaction cycle, notice warning, brace, low protective crouch, recover.
Lighting/mood: neutral soft upper-left game lighting with restrained readable highlights.
Constraints: genuinely transparent RGBA background, no checkerboard, no colored or opaque backdrop, no floor, no cast shadow outside the character, no grid lines, dividers, labels, letters, numbers, captions, UI, logo, watermark or border; no sparks leaving a cell, no loose tools, no weapon, no blood or gore; exactly sixteen cells and exactly one Jun Park per cell; all hands, head, equipment, tools and feet stay inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, costume changes, oversized tools, text, montage layout or contact-sheet labels.
```

## Asha Mbaye

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 named NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, Asha Mbaye, Echo-9 colonial liaison, shown in sixteen sequential animation cells.
Subject: adult Senegalese woman, tall poised practical build, deep-brown complexion, neat dark braids gathered into a low compact crown, original charcoal and dusty-blue frontier liaison field jacket over durable olive pressure-cloth trousers, slim protective vest, compact communications earpiece, small blank diplomatic data folio on a shoulder strap, restrained copper accent tabs with no symbols. Preserve exactly the same face, body proportions, hair, uniform, folio, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and a strong readable silhouette, grounded retro-futurist industrial survival-horror aesthetic matching a modern side-scroller, not concept art and not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; every cell has the same footprint and at least 16 pixels of genuinely transparent padding on every side; exactly one complete full-body Asha Mbaye per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every standing cell and all low poses remain anchored to that baseline; no body part, braid, folio or strap crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame calm idle breathing loop, subtle jacket and folio settling.
Row 2: four-frame purposeful walk cycle, contact, down, passing, up.
Row 3: four-frame liaison work cycle, consult a compact blank data folio, listen through earpiece, give a measured open-palm coordination gesture, acknowledge.
Row 4: four-frame security alert reaction cycle, notice alarm, signal stop, low protective brace, composed recovery.
Lighting/mood: neutral soft upper-left game lighting with restrained readable highlights; calm professional presence under tension.
Constraints: genuinely transparent RGBA background, no checkerboard, no colored or opaque backdrop, no floor, no cast shadow outside the character, no grid lines, dividers, labels, letters, numbers, captions, UI, logo, watermark or border; no flag, badge, readable insignia, weapon, blood or gore; exactly sixteen cells and exactly one Asha Mbaye per cell; all hands, head, clothing, folio and feet stay inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, costume changes, formal civilian business suit, oversized tablet, text, montage layout or contact-sheet labels.
```

## Pablo Reyes

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 named NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, Pablo Reyes, Echo-9 demolitions specialist, shown in sixteen sequential animation cells.
Subject: adult Latino man, sturdy broad-shouldered build, medium tan complexion, short dark hair with closely cropped sides, neat short mustache and jaw stubble, original dark olive and charcoal blast-resistant field uniform, padded high collar, reinforced forearms and knees, compact orange-gray demolitions harness, inert rectangular breaching module secured close to the torso, insulated test leads and a small safe diagnostic trigger with no symbols. Preserve exactly the same face, body proportions, hair, facial hair, uniform, harness, module dimensions, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and a strong readable silhouette, grounded retro-futurist industrial survival-horror aesthetic matching a modern side-scroller, not concept art and not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; every cell has the same footprint and at least 16 pixels of genuinely transparent padding on every side; exactly one complete full-body Pablo Reyes per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every standing cell and all kneeling poses remain anchored to that baseline; no body part, wire, harness or module crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame ready idle breathing loop, subtle harness settling.
Row 2: four-frame heavy purposeful walk cycle, contact, down, passing, up.
Row 3: four-frame demolitions work cycle, kneel with inert breaching module held close, connect short test lead, verify a blank handheld diagnostic trigger, secure module and rise.
Row 4: four-frame blast-warning reaction cycle, notice alarm, shield face, compact protective crouch, recover.
Lighting/mood: neutral soft upper-left game lighting with restrained readable highlights; disciplined hazardous-duty tension.
Constraints: genuinely transparent RGBA background, no checkerboard, no colored or opaque backdrop, no floor, no cast shadow outside the character, no grid lines, dividers, labels, letters, numbers, captions, UI, logo, watermark or border; absolutely no explosion, flame, sparks, smoke, loose ammunition, active bomb display, weapon firing, blood or gore; exactly sixteen cells and exactly one Pablo Reyes per cell; all hands, head, equipment, wires, module and feet stay inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, costume changes, oversized explosives, long wires crossing cells, text, montage layout or contact-sheet labels.
```
