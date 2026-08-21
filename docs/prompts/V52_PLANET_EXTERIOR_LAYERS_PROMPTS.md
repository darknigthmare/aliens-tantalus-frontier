# Prompts exacts v52 — extérieur planétaire Metroidvania

Date de production : 21 août 2026. Mode : **OpenAI ImageGen intégré**,
trois appels distincts, un par couche. Les bitmaps sont des créations originales
générées pour ce projet ; aucun asset officiel n'est redistribué.

## Sources et sorties distinctes

| Couche | Fichier final | Source ImageGen intégrée | Format final |
| --- | --- | --- | --- |
| Horizon lointain | `assets/openai/metroidvania/planet-exterior-far.png` | `C:\Users\chuck\.codex\generated_images\01a021b7-47e2-7a53-8b15-aa45e39e1fd2\exec-3449dfc6-5792-4032-b5e7-2b2ebb1dbd7b.png` | RGB opaque, 1600×900 |
| Terrain intermédiaire | `assets/openai/metroidvania/planet-exterior-mid.png` | `C:\Users\chuck\.codex\generated_images\01a021b7-47e2-7a53-8b15-aa45e39e1fd2\exec-358ef817-a95f-4b0d-bfa0-929c2b05a503.png` | RGBA, 1600×900 |
| Atmosphère premier plan | `assets/openai/metroidvania/planet-exterior-foreground.png` | `C:\Users\chuck\.codex\generated_images\01a021b7-47e2-7a53-8b15-aa45e39e1fd2\exec-9f8a9e27-f4db-44da-9bf1-712dfc685ffb.png` | RGBA, 1600×900 |

Les trois sources ImageGen étaient des PNG RGB 1672×941. Elles ont été
normalisées au même ratio exact 16:9 et à la même définition 1600×900. Pour les
deux overlays, le fond clair de présentation a été converti en alpha zéro avec
la même règle déterministe que `scripts/process-metroidvania-alpha.mjs` : un
pixel neutre dont les trois canaux sont au moins à 205 et diffèrent d'au plus
24 est traité comme fond. Aucun contenu n'a été ajouté ou redessiné. Les canaux
RGB des pixels totalement transparents ont ensuite été remis à zéro.

## Validation

| Contrôle | Far | Mid | Foreground |
| --- | ---: | ---: | ---: |
| Dimensions | 1600×900 | 1600×900 | 1600×900 |
| Ratio | 16:9 exact | 16:9 exact | 16:9 exact |
| Mode | RGB opaque | RGBA | RGBA |
| Alpha min/max | — | 0/255 | 0/255 |
| Pixels totalement transparents | — | 59,10 % | 85,60 % |
| Transparence de la zone centrale | — | 62,87 % | 97,56 % |
| RGB caché sous alpha nul | — | 0 | 0 |

L'inspection visuelle a été faite sur chaque couche puis sur leur composite.
Le panorama forme un horizon orageux continu ; la couche intermédiaire conserve
des ouvertures transparentes entre ruines, roches et cavernes sans donnée de
collision ; le premier plan laisse le centre de jeu libre et ne place que des
particules, spores et silhouettes végétales aux bords. Le coin inférieur gauche
du premier plan reste volontairement opaque, car une fronde recadrée entre par
le bord de l'image.

## Horizon lointain opaque

```text
Use case: stylized-concept
Asset type: production-ready opaque FAR parallax background for an exterior alien-planet level in a modern 2D side-scrolling metroidvania
Primary request: create a wide 16:9 distant alien horizon under a violent extraterrestrial storm, designed only as the slowest parallax depth layer.
Scene/backdrop: immense wind-eroded basalt ranges, remote broken mesas, a low mineral plain fading into haze, layered storm fronts, dense diagonal rain veils, distant sheet lightning behind clouds, airborne dust and a dim cold planetary glow on the horizon; original environment design.
Style/medium: polished hand-painted realistic 2D game environment, grounded cinematic science-fiction survival horror, rich atmospheric depth, production background rather than concept-sheet presentation.
Composition/framing: exact 16:9 wide landscape, strict lateral side-scroller camera at a constant eye height, horizon in the lower-middle distance, broad continuous edge-safe composition suitable for horizontal parallax; distant scale only; visually calm lower gameplay band.
Lighting/mood: oppressive charcoal-blue storm sky, desaturated iron-brown land, faint sickly cyan-green horizon light, sparse muted amber lightning; ominous but readable silhouette hierarchy.
Materials/textures: wet black basalt, mineral dust, stratified rock, rain haze and turbulent clouds.
Constraints: fully opaque background from edge to edge; FAR DISTANCE ONLY; no transparent areas, no checkerboard, no close foreground rock, no complete walkable platform, no flat playable floor, no collision geometry, no cave interior in the foreground, no character, creature, vehicle, spacecraft, building hero object, weapon or loose prop; no text, letters, numbers, signage, logo, UI, HUD, watermark, border, split screen, grid, sprite sheet, montage or collage; no copied key art.
Avoid: central vanishing point, fisheye, top-down or isometric view, bright fantasy colors, giant planet filling the sky, centered landmark, silhouettes that resemble characters.
```

## Terrain et ruines intermédiaires transparents

```text
Use case: stylized-concept
Asset type: production-ready transparent MID parallax cutout for an exterior alien-planet level in a modern 2D side-scrolling metroidvania
Primary request: create an isolated middle-distance terrain layer made from broken alien ruins, eroded rock shelves and shadowed cavern mouths, with genuine transparent space around and through every structure; this layer is visual parallax only and must not define gameplay collision.
Scene/backdrop: genuinely transparent RGBA canvas; only disconnected middle-distance silhouettes of stratified basalt, half-buried original ruin arches, fractured mineral pillars, cave openings and wind-carved overhangs; no sky, horizon, storm backdrop or solid matte.
Style/medium: polished hand-painted realistic 2D game environment cutout, grounded cinematic science-fiction survival horror, crisp production edges, original design.
Composition/framing: exact 16:9 wide landscape, strict lateral side-scroller view at constant scale and eye height; terrain clusters distributed across the lower and middle bands with broad transparent gaps, transparent cavern openings and edge-safe continuation; no central vanishing point.
Lighting/mood: desaturated iron-brown and charcoal basalt, cold cyan-green rim light from the distant storm, very restrained amber mineral glints; readable against a dark far layer.
Materials/textures: wet eroded rock, mineral crust, weathered composite ruin fragments, shallow dust, sharp cavern silhouettes.
Constraints: REAL ALPHA TRANSPARENCY; alpha zero in all empty areas and openings; no checkerboard, white/gray/black/colored background, sky, fog blanket or landscape matte; no continuous walkable floor, no flat platform tops, no baked collision route, no ladder, door, bridge, pickup, hazard or interactable prop; no people, characters, creatures, vehicles, weapons, corpses, text, letters, numbers, signs, logo, UI, watermark, border, grid, sprite sheet, montage, collage or copied key art.
Avoid: opaque rectangular backdrop, full-width solid ground band, foreground-scale rocks blocking the player, isometric or three-quarter camera, architecture resembling a complete playable room.
```

## Poussière, flore et spores de premier plan

```text
Use case: stylized-concept
Asset type: production-ready transparent FOREGROUND atmospheric parallax overlay for an exterior alien-planet level in a modern 2D side-scrolling metroidvania
Primary request: create an isolated foreground overlay of wind-driven mineral dust, sparse alien flora silhouettes and drifting spore clusters, with genuine transparent space so gameplay remains readable.
Scene/backdrop: genuinely transparent RGBA canvas; only separate wisps of dust, thin low tendrils of hardy alien plants, a few cropped edge fronds, small floating spore clouds and rain-swept particulate streaks; no sky, landscape, wall or solid matte.
Style/medium: polished realistic painted 2D game VFX and environmental cutout, grounded cinematic science-fiction survival horror, crisp antialiased production edges, original biological design.
Composition/framing: exact 16:9 wide landscape, strict lateral side-scroller view; effects concentrated along the bottom 18 percent, extreme left/right edges and a few sparse upper drifting clusters; at least 70 percent of the central gameplay field visually open and transparent; edge-safe horizontal flow.
Lighting/mood: charcoal and desaturated moss-black flora, faint cyan-green bioluminescent spore pinpoints, muted iron-brown dust, cold storm rim light; ominous and restrained.
Materials/textures: fibrous wet fronds, waxy tendrils, translucent spores, fine mineral grit, rain spray.
Constraints: REAL ALPHA TRANSPARENCY; alpha zero across every empty region; no checkerboard, white/gray/black/colored background, no opaque fog blanket, no full-width floor, no continuous terrain, no collision surface, no cavern wall, ruin, platform, large rock, character, creature, egg, vehicle, weapon, pickup, hazard or interactive prop; no text, letters, numbers, signs, logo, UI, watermark, border, grid, sprite sheet, montage, collage or copied key art.
Avoid: dense center obstruction, giant flowers, bright fantasy vegetation, recognizable terrestrial plants, complete landscape painting, opaque rectangle, repeated tile pattern.
```
