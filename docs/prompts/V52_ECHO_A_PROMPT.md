# Prompt exact v52 — ECHO-A

Mode : OpenAI ImageGen intégré (`image_gen` built-in), un seul appel. Aucune
image officielle ou externe n'a été fournie au générateur. L'identité et le
rôle proviennent de `src/content-core-v50.js` : `crew-14`, synthétique tactique,
spécialité assaut. La grille suit le contrat NPC v50 existant : 4×4, cellules
256×256, lignes idle/marche/travail/alerte, pivot pieds et hitbox humanoïde.

La sortie ImageGen est un PNG RGB 1254×1254 avec damier incrusté, conservé
comme master brut. Le script existant `scripts/process-npc-sheets.py` produit
le dérivé RGBA 1024×1024 avec garde de 16 px et ligne de pieds commune.

## Source, destinations et empreintes

| Élément | Chemin | SHA-256 |
| --- | --- | --- |
| Source ImageGen intégrée | `C:\Users\chuck\.codex\generated_images\01a02202-6aae-7750-9983-99f7b5d0ffe2\exec-c4bf00c2-5774-4c84-9532-e3689ec7f2a3.png` | `9cc417ef9da85cc2acda1107a4131770d3e033b85759e828a2428b4fa17c8540` |
| Master brut workspace | `assets/openai/sprites/npcs/echo-a-locomotion-sheet.png` | `9cc417ef9da85cc2acda1107a4131770d3e033b85759e828a2428b4fa17c8540` |
| Atlas normalisé workspace | `assets/openai/sprites/normalized/npcs/echo-a-locomotion-sheet.png` | `443fc02bc106b05d5bf593478834c2d1ef8413910cb00053e0eafa429502a5c2` |

## Validation

- Atlas normalisé : 1024×1024 RGBA.
- Cellules occupées : 16/16.
- Cellules visuellement et binairement distinctes : 16/16.
- Garde de 16 px : 0 violation.
- Pixels RGB cachés sous alpha nul : 0.
- Ligne de pieds : `y=239` dans 16/16 cellules.
- Contrôle visuel : identité, costume et proportions cohérents; idle, marche,
  travail tactique et alerte lisibles; aucune coupe ni traversée de cellule.

## Prompt exact

```text
Use case: stylized-concept
Asset type: production-ready transparent 4×4 named NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring character, ECHO-A, Echo-9 tactical synthetic and assault specialist, shown in sixteen sequential animation cells.
Subject: adult female-presenting human-proportioned tactical synthetic, compact athletic build, medium-dark neutral synthetic complexion, close-cropped black hair, calm precise expression, subtle synthetic seams at the temples and neck, one restrained cyan diagnostic light at the left temple, original matte graphite and desaturated olive tactical pressure-cloth uniform, lightweight segmented assault vest, reinforced knees and forearms, close-fitting gloves and boots, restrained cool-gray synthetic panels, compact original side-profile assault carbine and blank wrist tactical sensor with no readable markings. Clearly synthetic through restrained seams and precise movement, not a robot or armored cyborg. Preserve exactly the same face, body proportions, hair, seams, uniform, armor, sensor, carbine dimensions, colors and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and a strong readable silhouette, grounded retro-futurist industrial survival-horror aesthetic matching a polished modern side-scroller, not concept art and not a 3D render.
Composition/framing: square sprite sheet, exact four equal columns by four equal rows; every cell has the same footprint and at least 20 pixels of genuinely transparent padding on every side; exactly one complete full-body ECHO-A per cell; strict orthographic side profile facing right in all cells; identical scale; feet touch exactly the same horizontal baseline in every standing cell and low poses remain anchored to that baseline; no body part, armor plate, sensor or carbine crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame unnaturally controlled idle loop at low-ready, subtle diagnostic pulse and micro-adjustment.
Row 2: four-frame precise tactical walk cycle with compact carbine, contact, down, passing, up.
Row 3: four-frame tactical work cycle, inspect carbine chamber without firing, check blank wrist sensor, give compact silent assault hand signal, return to low-ready.
Row 4: four-frame alert reaction cycle, acquire threat, snap to ready without firing, low braced defensive crouch, recover to controlled stance.
Lighting/mood: neutral soft upper-left game lighting with restrained cyan highlights, readable on dark industrial ship interiors.
Constraints: genuinely transparent RGBA background; exact 4×4 layout; exactly sixteen distinct sequential frames; no checkerboard, colored or opaque backdrop, floor, cast shadow, grid lines, dividers, labels, letters, numbers, captions, UI, insignia, logo, watermark or border; no exposed metal skull, robotic limbs, glowing eyes, loose cables, muzzle flash, projectile, blood or gore; exactly one ECHO-A per cell; all head, hands, feet, weapon and equipment fully inside their own cell.
Avoid: front view, three-quarter view, perspective, inconsistent anatomy, identity or costume changes, humanoid robot armor, oversized weapon, firing, duplicate pose, cropped sprite, montage labels.
```
