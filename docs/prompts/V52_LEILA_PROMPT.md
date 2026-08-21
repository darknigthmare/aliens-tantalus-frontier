# Prompt exact v52 — Leila Sørensen

Date de production : 21 août 2026. Mode : **OpenAI ImageGen intégré**,
un unique appel pour une plaque originale. Aucun bitmap officiel n'est
redistribué.

## Source et fichiers

| Élément | Chemin |
| --- | --- |
| Source ImageGen intégrée | `C:\Users\chuck\.codex\generated_images\01a021b7-47e2-7a53-8b15-aa45e39e1fd2\exec-2d419a1e-18e7-49bf-944d-2276dbc1276a.png` |
| Master brut conservé | `assets/openai/sprites/npcs/leila-s-rensen-locomotion-sheet.png` |
| Atlas runtime normalisé | `assets/openai/sprites/normalized/npcs/leila-s-rensen-locomotion-sheet.png` |

Le slug `leila-s-rensen-locomotion-sheet.png` est volontairement conservé tel
quel : il correspond au contrat ASCII/OCR attendu par le runtime.

ImageGen a retourné un PNG RGB 1254×1254 avec un damier clair incrusté.
`scripts/process-npc-sheets.py` a produit le dérivé RGBA 1024×1024 sans
redessiner le personnage : grille 4×4, cellules 256×256, pieds alignés à
`y=240` et garde transparente de 16 px.

## Validation

- inspection visuelle : identité, costume et échelle cohérents sur les seize
  poses ; lignes idle, marche, travail Pathfinder et réaction lisibles ; aucun
  élément coupé par une cellule ;
- 16/16 cellules occupées, de 10 923 à 14 526 pixels visibles par cellule ;
- alpha réel de 0 à 255, 79,39 % de pixels entièrement transparents ;
- alpha nul aux quatre coins ;
- zéro pixel visible dans les bandes de garde de 16 px.

## Prompt exact

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 named NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, Leila Sørensen, Echo-9 pathfinder and frontier survival specialist, shown in sixteen sequential animation cells.
Subject: adult Scandinavian woman, lean endurance-trained build, fair wind-weathered complexion with light freckles, ash-blond hair in one compact braid tucked beneath a low-profile charcoal field hood, original muted moss-green and slate-gray frontier survival suit, lightweight layered chest rig, reinforced boots and knees, compact rolled climbing line on the belt, short-range binocular scanner held close to the body, restrained ice-blue locator lights with no symbols. Preserve exactly the same face, body proportions, braid, hood, uniform, rig, scanner, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and a strong readable silhouette, grounded retro-futurist industrial survival-horror aesthetic matching a modern side-scroller, not concept art and not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; every cell has the same footprint and at least 16 pixels of genuinely transparent padding on every side; exactly one complete full-body Leila Sørensen per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every standing cell and low poses remain anchored to that baseline; no body part, braid, scanner or climbing line crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame alert idle breathing loop, subtle hood and rig settling.
Row 2: four-frame careful pathfinder walk cycle, contact, down, passing, up.
Row 3: four-frame pathfinder work cycle, raise compact binocular scanner, inspect a small blank route device, crouch to examine the ground close to her boots, confirm direction with a restrained hand signal.
Row 4: four-frame hostile-environment reaction cycle, notice danger, brace against debris, low protective crouch, recover to ready.
Lighting/mood: neutral soft upper-left game lighting with restrained cold highlights; capable, watchful frontier tension.
Constraints: genuinely transparent RGBA background, no checkerboard, no colored or opaque backdrop, no scenery, no floor, no cast shadow outside the character, no grid lines, dividers, labels, letters, numbers, captions, UI, logo, watermark or border; no flag, readable insignia, long firearm, projectile, blood or gore; exactly sixteen cells and exactly one Leila Sørensen per cell; all hands, head, clothing, scanner, line and feet stay inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, costume changes, fantasy ranger styling, fur cloak, bow, oversized backpack, text, montage layout or contact-sheet labels.
```
