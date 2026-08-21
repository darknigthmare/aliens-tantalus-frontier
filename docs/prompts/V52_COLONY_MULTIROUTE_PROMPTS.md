# Prompts exacts v52 — décor `colony-multiroute`

Date de production : 21 août 2026. Mode : **OpenAI ImageGen intégré**,
exactement un appel distinct par couche. Aucune image officielle ou externe n'a
été fournie au générateur. Les trois créations sont originales et reprennent le
contrat de caméra latérale du niveau `colony-multiroute` : route haute,
rue principale et route utilitaire séparées du décor et de sa collision.

## Sources et fichiers finaux

| Couche | Source ImageGen intégrée — SHA-256 | Fichier final — SHA-256 | Format final |
| --- | --- | --- | --- |
| Lointain opaque | `C:\Users\chuck\.codex\generated_images\01a02202-6aae-7750-9983-99f7b5d0ffe2\exec-6a83d8fc-bee5-43e3-a4a8-f3ca3d5c054a.png` — `912b4fee997ad95a9767d03fd7d0cab8abf1bbca24951cbb570268f87c14e9ae` | `assets/openai/metroidvania/colony-multiroute-far.png` — `91a61dd07818990db644b6ea9583f55997d69cea49e2f51f4651f1d9edfb212e` | RGB opaque, 1664×936 |
| Architecture intermédiaire | `C:\Users\chuck\.codex\generated_images\01a02202-6aae-7750-9983-99f7b5d0ffe2\exec-aa4907cd-a680-4412-a962-621e6c94a4af.png` — `ca64a4cc98025c7e1681fb45cc36d7111a53e09fb506cafff46c510ee64ca249` | `assets/openai/metroidvania/colony-multiroute-mid.png` — `392238bae4d259f7dc1e975345da1a5c5e5b9f5f6ca006d43bf2245b42dd2cba` | RGBA, 1664×936 |
| Premier plan | `C:\Users\chuck\.codex\generated_images\01a02202-6aae-7750-9983-99f7b5d0ffe2\exec-83e6785e-3f2c-42d4-9a69-91cb4be54e29.png` — `186a87e5808e2211f66a18838c84f58b9ceddefdd54950b98bf5502f10c012b0` | `assets/openai/metroidvania/colony-multiroute-foreground.png` — `5a9f91b270c3cb616adfa2eaa97a1dd717d72f206d62c9a5c78465e251156112` | RGBA, 1664×936 |

Les trois sources ImageGen sont des PNG RGB 1672×941. Les deux sorties qui
demandaient de la transparence contenaient un damier peint. Le normaliseur
existant `scripts/process-metroidvania-alpha.mjs` a été exécuté séparément sur
MID et foreground. Il a retiré respectivement 969 243 pixels de damier
(61,60 %) et 1 323 687 pixels (84,13 %). Les trois couches ont ensuite reçu le
même recadrage central non destructif : 4 px à gauche et à droite, 2 px en haut
et 3 px en bas, soit 1664×936, rapport exact 16:9. Aucun redimensionnement ni
redessin n'a été appliqué. Le RGB sous alpha nul a été remis à zéro.

## Validation technique et visuelle

| Contrôle | MID | Foreground |
| --- | ---: | ---: |
| Alpha final | `(0, 255)` | `(0, 255)` |
| Pixels entièrement transparents | 61,2130 % | 84,1992 % |
| RGB caché sous alpha nul | 0 | 0 |
| Rang entièrement opaque | 0 | 0 |
| Transparence dans la zone centrale utile | 63,25 % | 98,44 % |

- Le lointain est entièrement opaque et remplit les 1664×936 pixels.
- Le rang MID le plus dense se situe à 25,11 % de la hauteur, dans la
  structure haute; aucun sol plein n'est peint dans la bande basse.
- Les blocs d'habitation, cadres de rue et passerelles sont des groupes
  séparés : ils fournissent une lecture architecturale sans définir la
  collision du niveau.
- Le foreground réserve le centre aux acteurs. Les clôtures restent aux bords,
  les câbles au plafond et la pluie en groupes fins; le coin inférieur droit
  est volontairement occupé par une clôture recadrée.
- Le composite temporaire FAR + MID + foreground a été inspecté : caméra,
  échelle, lumière et palette concordent; la colonie reste lisible derrière
  les trois routes et aucun aplat de premier plan ne masque le jeu.

## Couche lointaine opaque

```text
Use case: stylized-concept
Asset type: production 2D game parallax FAR background, exact 16:9 landscape, for a modern side-scrolling metroidvania
Primary request: create an original storm-battered frontier colony horizon as the distant depth layer for a three-route side-scrolling level.
Scene/backdrop: a remote colonial settlement beneath a violent overcast sky; distant low prefabricated habitation blocks, a civic communications tower, a fortified security bunker silhouette and a far landing beacon line spread across a bleak basalt plain; sheets of distant rain, low cloud banks, wind-driven mist and sparse power lights; no readable foreground object.
Style/medium: polished hand-painted realistic 2D game environment, crisp large shapes softened by distance, grounded retro-futurist industrial survival-horror, original design, not concept-art presentation and not a 3D render.
Composition/framing: exact 16:9 very wide landscape; strict orthographic lateral side view at one constant eye height; horizon around the upper-middle; horizontal edge-safe continuity for parallax scrolling; distant colony silhouette distributed from edge to edge; lower 28 percent quiet and low contrast so gameplay silhouettes remain readable.
Lighting/mood: storm dusk, oppressive cold blue-gray and desaturated green-black, muted rust-brown earth, sparse amber safety lights and tiny warning-red pin lights, pale lightning glow hidden inside clouds without a visible bolt.
Materials/textures: distant wet corrugated alloy, concrete modules, antenna masts, basalt, rain haze.
Constraints: FULLY OPAQUE image covering every pixel; FAR DEPTH ONLY; no transparency, alpha holes, checkerboard, playable platform, walkable floor edge, close fence, close cable, ladder, catwalk, door, interactive prop, character, enemy, creature, vehicle or weapon; no text, signs, labels, logo, UI, border, grid or watermark.
Avoid: central vanishing point, diagonal street perspective, wide-angle lens, fisheye, aerial view, bright daylight, giant hero building, official franchise logos or copied key art.
```

## Couche intermédiaire transparente

```text
Use case: stylized-concept
Asset type: production transparent MID structural parallax layer, exact 16:9 landscape, for a modern 2D side-scrolling metroidvania
Primary request: create an isolated original frontier-colony architecture layer made from separated habitation-block facades, street-edge structures, elevated catwalk rail-and-support silhouettes, a broken perimeter gate frame, utility pipe clusters and civic/security wall modules.
Scene/backdrop: genuinely transparent RGBA alpha visible through every gap, window opening, under-catwalk opening and all empty traversal lanes; absolutely no sky, storm horizon, landscape or colored matte.
Style/medium: polished realistic hand-painted 2D game environment cutout with crisp antialiased silhouettes, grounded retro-futurist industrial survival-horror, original design.
Composition/framing: exact 16:9 wide orthographic lateral side view at one constant scale; architecture arranged as several separated background clusters rather than one room; edge-safe; keep three long horizontal negative-space gameplay bands centered near 47 percent, 73 percent and 89 percent of canvas height; keep repeated clear vertical gaps for ladders; catwalk details are thin background railings and braces only, visually behind the actors.
Lighting/mood: storm-dusk cool blue-gray and desaturated green-black metal, muted rust, sparse amber and warning-red practical glints, wet surfaces with restrained highlights.
Materials/textures: rain-dark corrugated habitat cladding, poured concrete, modular pressure panels, narrow rails, insulated pipes, weathered gate ribs.
Constraints: REAL ALPHA CHANNEL; output only isolated background architecture with transparent openings; NO CONTINUOUS FLOOR, no baked collision surface, no solid street pavement, no playable ledge top, no full-width wall, no scenery visible in openings; no characters, enemies, creatures, vehicles, weapons, crates, pickups, hazards or interactive consoles; no signs, letters, numbers, text, logo, UI, border, grid, checkerboard or watermark.
Avoid: central vanishing point, diagonal street perspective, top-down or three-quarter camera, room interior, opaque background, black or white matte, floor strip, oversized foreground object, official franchise logos or copied key art.
```

## Premier plan transparent

```text
Use case: stylized-concept
Asset type: production transparent FOREGROUND parallax overlay, exact 16:9 landscape, for a modern 2D side-scrolling metroidvania
Primary request: create an isolated original storm-colony foreground overlay made from cropped chain-link fence sections at the extreme lower side edges, overhead insulated cable bundles, a few dangling cable loops, rain streak groups, wind-torn narrow tarp fragments and two slim near-camera support braces.
Scene/backdrop: genuinely transparent RGBA alpha everywhere outside the isolated foreground elements; no sky, wall, ground or colored matte.
Style/medium: polished realistic hand-painted 2D game-environment cutout, crisp clean alpha edges, restrained retro-futurist industrial survival-horror, original design.
Composition/framing: exact 16:9 wide orthographic side-view overlay; darkest fence fragments restricted to the bottom-left and bottom-right edges; cables concentrated along the upper 20 percent and extreme edges; sparse cool blue-cyan rain streaks distributed in small separated groups; keep the central 70 percent and all three gameplay route bands visually open; horizontally edge-safe without a full-width opaque strip.
Lighting/mood: storm dusk, dark graphite and wet oxidized steel with restrained cold rim light, dim amber glints and semi-transparent blue-cyan rain.
Materials/textures: wet chain-link mesh, insulated cable rubber, scratched support steel, frayed waterproof fabric, rain droplets.
Constraints: REAL ALPHA CHANNEL and clean antialiased cutout edges; no checkerboard, solid background, black background, white background, room wall, continuous floor, collision surface, playable platform, full-width fence, door, ladder, console, furniture, interactive prop, character, enemy, creature, vehicle or weapon; no text, signs, labels, logo, UI, border, grid, collage or watermark.
Avoid: opaque fog sheet, dense rain curtain that hides actors, giant central fence, central vanishing point, diagonal or top-down perspective, official franchise logos or copied key art.
```
