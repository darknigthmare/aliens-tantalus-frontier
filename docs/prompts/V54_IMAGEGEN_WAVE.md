# V54 — vague ImageGen joueur et ennemis exacts

## Statut de production

- Mode : outil ImageGen OpenAI intégré.
- Date : 22 août 2026.
- Masters générés conservés dans l’archive Codex.
- Copies projet brutes conservées sous `assets/openai/sprites`.
- Dérivés runtime : RGBA 1024 × 1024, grille 4 × 4, cellules 256 × 256, garde transparente de 16 px.
- Pipeline : suppression déterministe du damier connecté et des grandes îles internes, suppression des fragments minuscules, échelle commune, ancrage au sol et contrôle des gardes.

## Echo-9 combat

- Archive générée : `exec-744d65f3-d3cf-47ca-9dcd-f44f88548f38.png`.
- Brut projet : `assets/openai/sprites/player/echo9-marine-combat-sheet.png`.
- Runtime : `assets/openai/sprites/normalized/player/echo9-marine-combat-sheet.png`.
- Identité : vérifiée par rapport à la plaque locomotion.
- Orientation source : droite.
- Événements corrigés : tir frame 4, recul frame 5.

### Prompt final

> Use case: identity-preserve. Asset type: production 2D side-view metroidvania combat sprite sheet for ALIENS: TANTALUS FRONTIER. Image 1 is the absolute identity master; Image 2 is action-layout reference only and its different teal full-face character must be rejected. Create one new 4 columns by 4 rows combat animation sprite sheet containing exactly sixteen isolated full-body frames of the same adult Echo-9 marine from Image 1. Preserve the exact same visible human face, short dark hair, facial features, body proportions, dark brown and olive segmented armor, exposed skin, equipment, rifle silhouette, palette, material rendering, side-view scale and lighting. Row 1: combat ready, raise rifle, aim, steady aim. Row 2: fire, recoil, recover, controlled burst. Row 3: begin reload, remove magazine, insert magazine, return to ready. Row 4: hurt, stagger, fall, final dead pose lying on the floor. All frames face right. Exact regular 4x4 grid, transparent background, consistent baseline and 16-pixel safe gutter. No alternate identity, scenery, grid, text, UI, logo, watermark, extra limbs, clipping or overlap.

L’outil a rendu un damier RGB aplati malgré la demande d’alpha. La passe `background-extraction` intégrée a de nouveau produit un RGB. Le pipeline Pillow déterministe du projet a donc créé le véritable alpha sans redessiner le personnage.

## Xenomorph Runner

- Archive générée : `exec-e72f9c81-a9f3-41b5-a3d7-5eb471c34532.png`.
- Brut projet : `assets/openai/sprites/enemies/xenomorph-runner-action-sheet.png`.
- Runtime : `assets/openai/sprites/normalized/enemies/xenomorph-runner-action-sheet.png`.
- ID : `enemy.xenomorph-runner.action`.
- Orientation source : droite.
- Contrat : idle/prowl, sprint, pounce/bite, hurt/death.

### Prompt final

> Use case: stylized-concept. Asset type: production 2D side-view metroidvania enemy action sprite sheet. Match the supplied project Drone and Warrior rendering, palette, lighting, line density and gameplay scale. Create one exact 4 columns by 4 rows animation sheet for a canon-faithful Runner xenomorph: low quadrupedal dog-host anatomy, elongated smooth black dome, narrow jaw, exposed silver teeth, dorsal tubes, powerful digitigrade hind legs, long forelimbs, lean ribbed biomechanical torso and extremely long segmented tail. All frames face right. Row 1: idle prowl and breathing. Row 2: four full-speed sprint phases. Row 3: crouch, launch, airborne pounce, bite/impact. Row 4: wounded recoil, collapse, dying curl, final corpse. Transparent background, regular cells, consistent baseline, full tail visible and safe gutters. No bipedal pose, scenery, grid, text, watermark, white holes, extra limbs, clipping or recovered final pose.

## Ripper Queen

- Archive générée : `exec-add68a9c-8572-4560-9c37-211eb0216047.png`.
- Brut projet : `assets/openai/sprites/enemies/ripper-queen-action-sheet.png`.
- Runtime : `assets/openai/sprites/normalized/enemies/ripper-queen-action-sheet.png`.
- ID : `enemy.ripper-queen.action`.
- Orientation source : droite.
- Contrat : threat idle, royal advance, claw/tail, wounded/death.

### Prompt final

> Use case: stylized-concept. Asset type: production 2D side-view metroidvania boss action sprite sheet. Image 1 defines the project Queen’s royal scale, anatomy, crown, animation framing and dark hand-painted rendering. Image 2 defines only the ATARAX Ripper/Xenoborg phenotype: black biomechanical tissue, bone-white cranial and dorsal armor, tendrils and neural scar accents. Create a distinct Ripper Queen with broader segmented ivory crown plates, pale dorsal carapace, black wet inner tissue, red neural fissures, reinforced forelimbs, massive digitigrade legs and a long segmented tail. Row 1: threat idle, heavy breath, crown raise, roar recovery. Row 2: four steps of royal advance. Row 3: claw wind-up, claw impact, tail wind-up, tail impact. Row 4: wounded recoil, enraged stagger, collapse, final corpse. All frames face right in an exact 4x4 sheet with transparent safe gutters. No standard Queen recolor, scenery, floor, grid, text, watermark, checkerboard holes, extra limbs, clipping or recovered death pose.

## Pathogen Mimic

- Archive retenue : `exec-bfc4c3c9-41a8-4ac8-b3dd-25afec01b38e.png`.
- Variantes rejetées : `exec-e7872a27-180d-4401-b6ef-06055e35426f.png`, `exec-0a69f5fe-ea00-4b75-95ab-acef9c369195.png`.
- Brut projet : `assets/openai/sprites/enemies/pathogen-mimic-action-sheet.png`.
- Runtime : `assets/openai/sprites/normalized/enemies/pathogen-mimic-action-sheet.png`.
- ID : `enemy.pathogen-mimic.action`.
- Orientation source : droite.
- Contrat : idle, chase, attack, death.

### Prompt final

> Use case: stylized-concept. Asset type: production 2D side-view metroidvania enemy action sprite sheet. Create one exact 4 columns by 4 rows sprite sheet for a Pathogen Mimic that matches the project’s painterly xeno/pathogen runtime scale while remaining clearly distinct from a Drone: pallid fungal flesh, stretched human-derived torso, asymmetrical claws, ruptured rib growths, pathogen sacs, wet sinew and desperate half-upright locomotion. All frames face right. Row 1: dormant twitch, rise, idle breathing, alert stillness. Row 2: four chase phases with dragging but rapid pursuit. Row 3: wind-up, slash, bite/impact, recoil continuation. Row 4: stagger, pathogen rupture, collapse, final corpse. Exact 4x4 sheet, chroma green background allowed for later extraction, full silhouette readable in every cell, consistent baseline, no scenery, no text, no watermark, no extra limbs, no clipping, no white checkerboard holes.

Les deux variantes rejetées présentaient des corps qui traversaient les limites de cellules ou paraissaient coupés. La troisième a été retenue puis normalisée via extraction des plus grands composants connectés et despill chroma.

## Pale Crucible Hunter

- Archive retenue : `exec-336e71e1-6775-4dd0-8d8b-8dff38fd02f2.png`.
- Variantes rejetées : `exec-352cb4ee-0a0c-44a5-8367-52f05e747b76.png`, `exec-539dcd9d-9e5f-477e-972c-ac4acce13ea4.png`.
- Brut projet : `assets/openai/sprites/enemies/pale-crucible-hunter-action-sheet.png`.
- Runtime : `assets/openai/sprites/normalized/enemies/pale-crucible-hunter-action-sheet.png`.
- ID : `enemy.pale-crucible-hunter.action`.
- Orientation source : droite.
- Contrat : idle, chase, attack, death.

### Prompt final

> Use case: stylized-concept. Asset type: production 2D side-view metroidvania enemy action sprite sheet. Create one exact 4 columns by 4 rows sprite sheet for a Pale Crucible Hunter distinct from standard neomorphs: bone-pale exoskeletal plates, crucible-forged dorsal spines, long forearms, gaunt predatory torso, sick ivory skin over wet muscle seams and a feral forge-born gait. Match the project’s side-view scale and painterly biomechanical rendering. All frames face right. Row 1: still hunt, breathing, menace rise, ready stance. Row 2: four pursuit phases. Row 3: slash wind-up, slash impact, leap bite, recovery. Row 4: wound recoil, stagger, collapse, final corpse. Exact 4x4 sheet, chroma green background allowed for later extraction, safe gutters, no scenery, no text, no watermark, no checkerboard holes, no clipping, no duplicate limbs.

Les deux variantes rejetées présentaient des fragments détachés de queue ou de membres. La troisième a été retenue puis normalisée avec le même pipeline chroma/composants connectés que Pathogen Mimic.

## Gates vérifiés

- 31 plaques déclarées dans le manifest.
- 496 cellules normalisées.
- Mode RGBA et dimension 1024 × 1024 sur toutes les plaques.
- Zéro violation de garde.
- 80 cellules de xénomorphes sombres contrôlées sans grande île claire enfermée.
- 32 cellules chroma contrôlées sans spill vert.
- Echo-9 combat `identityVerified: true` uniquement après alignement des événements tir/recul.
