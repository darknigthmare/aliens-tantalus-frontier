# Prompt exact v52 — Cal Mercer

Date de production : 21 août 2026. Mode : **OpenAI ImageGen intégré**, avec
un seul appel de génération. Cal Mercer est une création originale produite
pour ce projet ; aucun bitmap officiel ni élément de key art n'est redistribué.

## Livrables

| Élément | Fichier | SHA-256 |
| --- | --- | --- |
| Master brut ImageGen | `assets/openai/sprites/npcs/cal-mercer-locomotion-sheet.png` | `397fe12d67b1972719a6d905e49896a7602ca490521b9d29ebcee1266fdca3a3` |
| Dérivé runtime | `assets/openai/sprites/normalized/npcs/cal-mercer-locomotion-sheet.png` | `c6731fed56e4285981cccab648fd46c4312790214b41039fe2e8ee5d4d082cdf` |
| Source ImageGen intégrée conservée | `C:\Users\chuck\.codex\generated_images\01a021cb-bfa4-7812-999f-92069d309261\exec-34e27d09-e2b5-423e-b7d5-91f59bff54b3.png` | identique au master brut |

Le master 1254×1254 est un PNG RGB avec le damier clair incrusté par la
génération. Il est conservé intact. Le dérivé a subi uniquement un traitement
Pillow déterministe : retrait du fond neutre connecté, extraction des seize
cellules, échelle commune, ancrage des pieds, conservation de la composante du
personnage et suppression des lignes de sol ou marques de mouvement parasites.
Il n'y a eu ni nouvelle génération, ni retouche créative, ni modification du
manifeste ou d'un rapport partagé.

## Validation du dérivé

| Contrôle | Résultat |
| --- | --- |
| Format | PNG RGBA 1024×1024 |
| Grille | 4×4, cellules 256×256 |
| Cellules occupées et distinctes | 16/16 |
| Pixels occupés par cellule | 11 632–13 842 |
| Transparence totale | 79,69 % |
| Alpha des quatre coins | 0, 0, 0, 0 |
| Garde transparente 16 px | 0 violation |
| RGB caché sous alpha nul | 0 pixel |
| Ligne de pieds par cellule | `y=240` pour les 16 cellules |

L'inspection visuelle finale sur un damier sombre confirme une identité stable,
un profil latéral cohérent face à droite, une silhouette complète dans chaque
cellule et quatre lignes lisibles : idle lourd, marche mécanique, maintenance
véhicule et réaction d'alarme. Aucun rectangle de fond, ligne de sol, membre
coupé, outil hors cellule, texte, logo ou watermark n'est visible.

## Prompt exact

```text
Use case: stylized-concept
Asset type: production-ready transparent 4x4 named NPC animation sprite sheet for a modern 2D side-scrolling metroidvania
Primary request: create exactly one coherent recurring original character, Cal Mercer, Echo-9 Vehicle Chief, shown in sixteen sequential animation cells.
Scene/backdrop: genuinely transparent RGBA alpha only; no floor, no scenery, no checkerboard, no colored or opaque backdrop.
Subject: middle-aged male vehicle chief, sturdy stocky mechanic build, weathered medium-light complexion, close-cropped dark auburn hair with subtle silver at the temples, neat short boxed beard, original charcoal and muted ochre armored vehicle-maintenance coveralls, reinforced elbows and knees, compact dark utility belt, heavy insulated gloves, steel-toe work boots, low-profile welding goggles raised above the eyes, a compact short torque wrench and a small blank handheld diagnostic puck kept close to the body. Restrained cool teal diagnostic lights, no symbols. Preserve exactly the same face, beard, body proportions, hair, uniform, goggles, tools, colors, scale and lighting in every cell.
Style/medium: crisp professional hand-painted 2D game sprite art with controlled pixel-like edge clusters and a strong readable silhouette, grounded retro-futurist industrial survival-horror aesthetic matching a modern side-scroller; production sprite art, not concept art and not a 3D render.
Composition/framing: one square sprite sheet, exact four equal columns by four equal rows, exactly sixteen cells total; no visible grid lines or dividers. Every cell has the same footprint and broad genuinely transparent gutters, with at least 16 pixels of transparent padding on every side. Exactly one complete full-body Cal Mercer per cell. Strict orthographic side profile facing right in all sixteen cells, identical camera, scale and center-bottom ground pivot. Feet touch exactly the same horizontal baseline in every standing cell and all crouched poses remain anchored to that baseline. No body part, beard, goggles, hand, boot, belt, wrench, diagnostic puck or effect crosses a cell boundary.
Animation rows, left to right:
Row 1: four-frame calm heavy idle breathing loop — neutral ready stance, inhale, tool-belt settling, exhale.
Row 2: four-frame purposeful mechanic walk cycle — right-foot contact, down pose, left-foot contact, passing/up pose, with stable torso volume.
Row 3: four-frame vehicle-chief maintenance cycle — inspect the compact blank diagnostic puck, apply the short torque wrench close to the torso, check an imaginary coupling at waist height with no vehicle or panel visible, give a restrained ready acknowledgement.
Row 4: four-frame vehicle-damage alarm reaction cycle — notice warning, brace, compact protective crouch, controlled recovery.
Lighting/mood: neutral soft upper-left game lighting with restrained readable highlights; competent industrial-duty tension.
Color palette: charcoal, muted ochre, dark steel, small cool teal diagnostic accents.
Materials/textures: worn pressure cloth, scuffed protective pads, matte metal tools, subtle grease wear limited to the uniform.
Constraints: genuinely transparent RGBA background; exact rigid 4x4 matrix; exactly sixteen cells and exactly one same Cal Mercer per cell; all sixteen cells occupied and visually distinct; consistent identity and costume; no other character, vehicle, cockpit, machine, panel, weapon, muzzle flash, sparks, smoke, loose tool, detached part, blood or gore; no floor, cast shadow outside the character, visible grid, border, labels, captions, letters, numbers, text, insignia, patch, emblem, logo, UI, watermark, contact-sheet annotation or copied official key art.
Avoid: front view, three-quarter view, perspective changes, inconsistent anatomy, costume changes, oversized tools, opaque goggles hiding the eyes, cropped limbs, empty cells, duplicated poses, montage layout or cell backgrounds.
```
