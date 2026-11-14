---

description: "Task list — salles hybrides 2D / 2,5D, prototype du hangar"
---

# Tasks: Salles hybrides 2D / 2,5D — prototype du hangar

**Input**: Design documents from `specs/001-salles-hybrides-2d-25d/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/hub-depth-room.md, quickstart.md

**Tests**: inclus. AGENTS.md exige de tester le système touché ; le plan prévoit `scripts/verify-hub-depth-rooms-v188.mjs` et un parcours Chromium.

**Organization**: tâches groupées par récit utilisateur (spec.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]** : parallélisable (fichiers différents, pas de dépendance en cours)
- **[Story]** : récit utilisateur concerné (US1–US5)

## Phase 1: Setup

- [x] T001 Mesurer le temps moyen d'image actuel du hangar (300 images, Chromium sans affichage, 1280×720), et consigner la valeur de référence dans `docs/development/PRIORITIES_P0_P1_V188.md`
- [x] T002 [P] Admettre exactement les fichiers `specs/001-salles-hybrides-2d-25d/**` (source-only, hors build public) et `scripts/verify-hub-depth-rooms-v188.mjs` dans `scripts/verify-public-release-v86.mjs`

## Phase 2: Foundational (bloquant)

- [x] T003 Créer `src/hub-depth-rooms-v188.js` avec `HUB_DEPTH_ROOMS_V188['dropship-hangar']` :
  - `deck: 3`, `x0: 0`, `x1: 1280`, « `z ∈ [−80, 0]` » (révisé, cf. research R2), `doorBand: 20`, `interactBand: 24` ;
  - emprise du dropship « x 300–780, `z ∈ [−40, −20]` » (révisé, cf. research R4) ;
  - trois piles de caisses et un chariot avec leurs emprises ;
  - la table `npcDepths`.
- [x] T004 Implémenter dans `src/hub-depth-rooms-v188.js` les fonctions pures du contrat :
  - `hubDepthRoomAtV188`, `depthToScreenOffsetV188` (« pied = FLOOR_Y − z »), `depthShadeV188` (« ≤ 0,22 au fond ») ;
  - `blockedByFootprintV188`, `stepDepthMoveV188` (résolution axe par axe), `canLeaveDepthRoomV188`, `depthInteractionAllowedV188` ;
  - `npcStationDepthV188`, `normalizeHubDepthV188` (« `roomId` connu, `z` borné, sinon `null` »), `depthShotHitsV188`, `depthAnnouncementV188`.
- [x] T005 Écrire `scripts/verify-hub-depth-rooms-v188.mjs`, partie règles pures :
  - bornes ; emprises ; résolution axe par axe ;
  - bande d'interaction ; profondeurs de poste hors emprise ;
  - normalisation ; tir futur.
- [x] T006 Créer le mixin idempotent `withHubDepthRoomsV188(Base)` dans `src/hub-depth-runtime-v188.js`. Il est inactif hors du pont d'une salle profondeur, en Forge (`editorPlaytest`), en annexe et en conduit. Le composer dans `src/app.js` sous `withHubArmoryStorefrontV169` (l'armurerie reste la plus externe).
- [x] T007 [P] Ajouter `/src/hub-depth-rooms-v188.js` et `/src/hub-depth-runtime-v188.js` à la coque hors ligne de `sw.js`.

**Checkpoint** : règles pures testées ; mixin composé et neutre partout.

## Phase 3: User Story 1 — Traverser le hangar en profondeur (P1) 🎯 MVP

**Goal**: se déplacer en profondeur, contourner les obstacles, voir le tri et la profondeur à l'écran.

**Independent Test**: parcours Chromium dans le hangar : W/S changent `z` dans les bornes ; une caisse bloque ; derrière le dropship, le joueur est masqué et sa silhouette reste visible ; la taille des sprites est identique au fond et à l'avant.

- [x] T008 [US1] Dans `src/hub-depth-runtime-v188.js`, surcharger `update(delta)`. En salle profondeur :
  - retirer KeyW/KeyS/ArrowUp/ArrowDown des touches transmises à `super.update`, sauf si le joueur est accroché à une échelle ;
  - appliquer `stepDepthMoveV188` à `player.depthZ`, à « 0,6 × la vitesse horizontale » ;
  - bloquer x contre les emprises.
- [x] T009 [US1] Dans `src/hub-depth-runtime-v188.js`, neutraliser `useLift(direction)` appelé par W/S quand le joueur est en salle profondeur.
- [x] T010 [US1] Dans `src/hub-depth-runtime-v188.js`, rendre le hangar en profondeur :
  - assombrir le sol près du mur et poser des repères au sol (y de `FLOOR_Y` à `FLOOR_Y + 80`) ;
  - retirer le dropship du décor arrière ;
  - différer le dessin des PNJ du hangar et du joueur ;
  - ajouter une passe triée du fond vers l'avant (dropship à `z = −30`, caisses et chariot dessinés avec le sol, puis occultation masquée des personnages placés derrière eux) avec décalage vertical, ombre au sol et `depthShadeV188` ;
  - redessiner la silhouette du joueur masqué à faible opacité.
- [x] T011 [P] [US1] Dessiner en primitives les caisses et le chariot (placeholders, sans génération d'image) dans `src/hub-depth-runtime-v188.js`.
- [x] T012 [US1] Ajouter au test `scripts/verify-hub-depth-rooms-v188.mjs` la composition (ordre des mixins, idempotence) et l'invariance hors salle profondeur (aucune touche ni aucun `useLift` modifié sur un autre pont).

**Checkpoint** : le hangar est jouable en profondeur (MVP).

## Phase 4: User Story 2 — Entrer et sortir sans rupture (P1)

**Goal**: annonce à l'approche, entrée sans saut, sortie limitée au rail.

**Independent Test**: dix allers-retours par l'accès du réacteur ; annonce visible ; arrivée à `z = 0` ; sortie impossible loin du rail.

- [x] T013 [US2] Dans `src/hub-depth-runtime-v188.js`, surcharger `statusPrompt()` : à l'approche (« x ∈ [1280, 1480] sur le pont ingénierie »), afficher `depthAnnouncementV188(lang)` en FR/EN.
- [x] T014 [US2] Dans `src/hub-depth-runtime-v188.js` :
  - remettre `z = 0` à l'entrée dans la salle ;
  - garder x dans `[x0, x1]` tant que `canLeaveDepthRoomV188` est faux ;
  - faire apparaître le plan de sol en fondu à l'approche (rien en mouvement réduit).
- [x] T015 [US2] Parcours Chromium : aller-retour, annonce, blocage loin du rail, sortie au rail (script dans le scratchpad ; résultats consignés dans le rapport).

## Phase 5: User Story 3 — Un hangar vivant en profondeur (P2)

**Goal**: les PNJ du hangar circulent sur le rail et se tiennent à leur poste en profondeur ; interactions filtrées par bande.

**Independent Test**: deux minutes d'observation ; chaque PNJ change de poste sans traverser d'obstacle ; E ne fonctionne que dans la bande.

- [x] T016 [US3] Dans `src/hub-depth-runtime-v188.js`, après `super.update` :
  - pour chaque PNJ du hangar, `depthTargetZ = 0` en mouvement et `npcStationDepthV188` à l'arrêt ;
  - amortissement exponentiel vers la cible ;
  - jamais dans une emprise.
- [x] T017 [US3] Dans `src/hub-depth-runtime-v188.js`, surcharger `nearestInteraction()` et `interact()` : refuser une cible hors de `interactBand` (PNJ : sa profondeur ; stations, porte, ascenseur : le rail).
- [x] T018 [US3] Ajouter au test les interactions filtrées et la convergence des profondeurs de PNJ (règles pures).

## Phase 6: User Story 4 — Reprise et sauvegarde (P2)

**Goal**: la profondeur est sauvegardée et restaurée ; les anciennes sauvegardes se chargent.

**Independent Test**: sauvegarde au fond, rechargement à l'identique ; sauvegarde antérieure → `z = 0`.

- [x] T019 [US4] Dans `src/hub-depth-runtime-v188.js`, surcharger `persist()` (écrire « `hub.depthV188 = { roomId, z } | null` ») et `start()` (restaurer si `roomId` correspond).
- [x] T020 [US4] Dans `src/save.js`, normaliser de façon additive `migrated.hub.depthV188 = normalizeHubDepthV188(hub.depthV188)`, et ajouter `depthV188: null` à la sauvegarde par défaut.
- [x] T021 [US4] Ajouter au test : sauvegarde par défaut, migration d'une sauvegarde antérieure, aller-retour de sauvegarde avec profondeur.

## Phase 7: User Story 5 — Échelles et ascenseurs (P3)

**Goal**: E au pied de l'ascenseur l'appelle ; W/S n'appellent jamais l'ascenseur ; une échelle accrochée avec E rend W/S à la montée.

**Independent Test**: au pied de l'ascenseur, W recule en profondeur et E appelle l'ascenseur.

- [x] T022 [US5] Dans `src/hub-depth-runtime-v188.js`, faire qu'en salle profondeur, E au pied de l'ascenseur à `|z| ≤ doorBand` appelle le comportement d'ascenseur existant (vers le haut depuis le pont ingénierie). Pour les échelles du hangar, E accroche et rend W/S à la montée.
- [x] T023 [US5] Faire des boutons tactiles « monter » et « descendre » la profondeur en salle profondeur (`setControl` dans `src/hub-depth-runtime-v188.js`).

## Phase 8: Polish & Cross-Cutting

- [x] T024 [P] Compléter les en-têtes de `src/hub-depth-presentation-v116.js`, `src/hub-room-projection-v139.js` et `src/hub-support-planes-v139.js` avec l'exception des salles profondeur (FR-015, commentaires seulement).
- [x] T025 Mesurer de nouveau le temps d'image du hangar (même protocole que T001) et rapporter l'écart (SC-006).
- [x] T026 [P] Mettre à jour `docs/development/PRIORITIES_P0_P1_V188.md` et la bible (`docs/narrative/CAMPAGNE_PRINCIPALE.md`, §56.12) : salles profondeur, commandes, règle de tir future, limites.
- [x] T027 Enregistrer le test dans `package.json` (`test:priorities:v188`), régénérer les reçus d'audit, lancer `npm run check`, les suites ciblées, puis `npm run test:all`, `build` et `check:built`.

## Phase 9: Extension — quai de Port-Méridien (demande « continue », 2026-11-13)

- [x] T028 [P] Ajouter `PORT_DEPTH_ROOM_V188` (postes au mur, caisse de rampe contournable, conteneurs, fûts, palette) et `civilianDepthTargetV188` / `freeDepthV188` dans `src/hub-depth-rooms-v188.js`.
- [x] T029 Dans `src/hub-depth-runtime-v188.js` :
  - raccorder le mode quai ;
  - refuser les contacts de poste loin du mur ;
  - retirer le collisionneur de la caisse loin du mur ;
  - faire suivre les habitants en profondeur ; annuler une tâche immobile par un pas en profondeur ;
  - saisir `z` dans l'état du quai.
- [x] T030 Dans `src/hub-port-meridien-v90.js` : passe triée par profondeur, barrière du sas fermé, pluie fine, invite remontée.
- [x] T031 Dans `src/port-meridien-v90.js` : champ additif `z` de l'état du quai, borné, nul sur l'échelle.
- [x] T032 Tests (`scripts/verify-hub-depth-rooms-v188.mjs`), parcours Chromium et documentation.

## Dependencies & Execution Order

- Setup (T001–T002) → Foundational (T003–T007) → US1 (T008–T012, MVP) → US2 → US3 / US4 (indépendants entre eux) → US5 → Polish.
- US2 à US5 s'appuient sur le mixin et le rendu de US1.

## Parallel Example

```text
T002 (admission) ∥ T007 (sw.js) ∥ T011 (primitives caisses) ∥ T024 (commentaires) ∥ T026 (docs)
```

## Implementation Strategy

1. MVP : Setup + Foundational + US1, puis évaluation dans le navigateur.
2. US2 (portes), puis US3 (PNJ) et US4 (sauvegarde), puis US5.
3. Polish : mesure, documentation, suites complètes.
