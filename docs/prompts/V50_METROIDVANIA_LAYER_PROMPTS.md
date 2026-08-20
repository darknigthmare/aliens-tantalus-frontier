# Prompts exacts — couches Metroidvania v50

Date de production : 21 août 2026. Mode : **OpenAI ImageGen intégré**. Chaque bitmap final vient d’un appel distinct.

## Sources et fichiers finaux

| Couche | Fichier final | Source ImageGen conservée | Format final |
|---|---|---|---|
| Lointain | `assets/openai/metroidvania/tantalus-mission-far.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-2e33-7331-b814-7e9d5fcac08b\exec-90efd59e-a054-4eac-b8d4-b4ee6a86ac79.png` | RGB, 1717×916 |
| Structure intermédiaire | `assets/openai/metroidvania/tantalus-mission-mid.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-2e33-7331-b814-7e9d5fcac08b\exec-c7fb41e2-7fb3-4d7d-ad80-78108aeada1c.png` | RGBA, 1774×887 |
| Premier plan | `assets/openai/metroidvania/tantalus-mission-foreground.png` | `C:\Users\chuck\.codex\generated_images\01a0213c-2e33-7331-b814-7e9d5fcac08b\exec-3c81d93d-3d31-426b-a7dc-e407c484345d.png` | RGBA, 1774×887 |

## Couche lointaine

```text
Use case: stylized-concept
Asset type: production 2D game parallax FAR background for a modern side-scrolling metroidvania
Primary request: an original retro-industrial science-fiction frontier facility seen from deep inside a vast damaged spacecraft or orbital colony, designed only as the distant depth layer
Scene/backdrop: remote pressure hulls, shadowed maintenance megastructure, distant gantries, recessed machinery silhouettes, tiny cold work lights, thin drifting vapor and immense negative depth; no readable foreground objects
Style/medium: polished hand-painted realistic 2D game environment, restrained cinematic industrial horror, original design, no copied franchise asset
Composition/framing: very wide landscape; strict orthographic lateral side view at one constant eye height; no wide-angle lens, no fisheye, no diagonal camera, no top-down view; horizontally continuous edge-safe composition suitable for parallax tiling
Lighting/mood: low-contrast blue-black and desaturated steel, sparse amber and warning-red pin lights, oppressive but readable depth
Materials/textures: distant ribbed hull plating, oxidized steel, haze-softened pipes and structural silhouettes
Constraints: FAR DEPTH ONLY; absolutely no playable platform, no walkable floor, no ladder, no close door, no interactive prop, no character, no enemy, no vehicle, no weapon, no creature; no text, logo, UI, border, grid, watermark or sprite sheet; keep the lower traversal band visually quiet
```

## Couche intermédiaire finale

```text
Use case: stylized-concept
Asset type: isolated MID structural parallax layer for a production 2D side-scrolling metroidvania
Primary request: an original retro-industrial science-fiction pressure-hull corridor shell made only from side-on bulkhead ribs, inset wall panels, a thin ceiling structure and a thin continuous deck structure, with multiple very large empty archway and window openings
Scene/backdrop: genuine transparency visible through every opening and around every isolated structural edge
Style/medium: polished realistic painted 2D game environment cutout, restrained industrial horror, original design
Composition/framing: very wide landscape; strict orthographic lateral side view; perfectly constant camera height and scale from left to right; floor datum exactly around 82 percent of canvas height; edge-safe continuous architecture; clear horizontal player corridor
Lighting/mood: dark graphite and desaturated gunmetal, sparse amber and warning-red practical lights, readable silhouettes
Materials/textures: worn painted steel, ribbed pressure hull, ceramic insulation, sealed conduits integrated into the wall
Constraints: output a PNG with a REAL ALPHA CHANNEL; openings and empty areas must have alpha zero; show only the corridor shell structure; no scenery, landscape, fog or machinery visible inside the openings; no central vanishing point, wide-angle lens, fisheye, diagonal or top-down perspective; no characters, enemies, vehicles, weapons, crates, consoles, furniture, pickups, hazards, signs, labels, text, logo, UI, border, grid, watermark or interactive props; no checkerboard or solid background
```

## Premier plan transparent

```text
Use case: stylized-concept
Asset type: production transparent FOREGROUND parallax overlay for a modern side-scrolling metroidvania
Primary request: isolated original retro-industrial science-fiction foreground framing made from overhead pipes, hanging cable bundles, cropped pressure beams and a few edge-side structural braces
Scene/backdrop: genuinely transparent background
Style/medium: polished realistic painted 2D game environment elements, restrained industrial horror, crisp production cutout
Composition/framing: very wide landscape; strict orthographic lateral side view at constant scale; details concentrated along the upper 28 percent and extreme left/right edges; keep the central and lower traversal band at least 75 percent unobstructed; horizontally edge-safe
Lighting/mood: dark graphite metal with restrained cold rim light and tiny amber/red practical glints
Materials/textures: worn steel pipes, insulated cable bundles, condensation, scratched beams
Constraints: ACTUAL ALPHA TRANSPARENCY; output only isolated pipes, cables and beams with clean antialiased edges and no colored matte; no solid background, no black background, no white background, no checkerboard pattern, no room wall, no floor, no playable platform, no door, no console, no furniture, no interactive prop, no character, enemy, vehicle, weapon or creature; no text, logo, UI, border, grid, watermark or collage
```

## Contrôle alpha et sorties rejetées

ImageGen a peint un damier clair dans les sources RGB des deux couches censées être transparentes. `scripts/process-metroidvania-alpha.mjs` retire uniquement ces pixels clairs neutres, sans ajouter ni redessiner de contenu.

- Structure intermédiaire finale : canal alpha `(0, 255)`, **78,81 %** de pixels totalement transparents.
- Premier plan final : canal alpha `(0, 255)`, **77,40 %** de pixels totalement transparents.
- Première structure `exec-e899acc4-1c27-4fdc-a314-e862328f176c.png` rejetée : paysage lointain fusionné aux ouvertures.
- Extraction intégrée du premier plan `exec-8f74f920-7eeb-4f2e-b94b-69225640364f.png` rejetée : RGB avec damier.
- Régénération du premier plan `exec-54b30a95-3c89-435e-ae55-d7b8180105c7.png` rejetée : RGB sur fond blanc.

Le bounding box opaque de la coque est `(0, 262, 1773, 637)`. Pour un runtime 1774×887 dont le sol logique est à 82 % de hauteur, placer cette couche avec un décalage vertical de **+90 px** afin d’aligner son pont inférieur à `y≈727` sans la redimensionner.
