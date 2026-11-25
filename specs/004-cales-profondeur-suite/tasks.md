# Tasks: Autres cales de mission en profondeur

## Phase 1: Évaluation (Q31)
- [x] T001 Jouer la cale de QZ-17 dans Chromium avec les touches réelles : W/S, tir, corps à corps, couverture, réveil des rôdeurs.
- [x] T002 Écrire l'évaluation dans `research.md` (R1) et classer les défauts.
- [x] T003 Corriger les défauts P1/P2 :
  - saut dans une voie avant : profondeur gardée pour le dessin, les tirs et les coups ;
  - ennemi en vol au-dessus de la soute : même règle ;
  - coop : une salve par profondeur, recalage du tireur.

## Phase 2: Foundational
- [x] T004 Créer `src/depth-hold-sections-v188.js` :
  - définitions, constructeur unique, mesure de la soute ;
  - éléments du mur, intervalles de mur nu, placement par règle ;
  - règle de voie (≥ 20) et passage sur grille.
- [x] T005 Réécrire `buildCargoHoldSectionV188` comme définition QZ-17 ; section identique (test de référence).
- [x] T006 Créer `src/depth-hold-slots-v188.js` (4 emplacements, replis) ; ajouter les deux modules à `sw.js`.

## Phase 3: US1 / US2 — Cale des cargos (P1)
- [x] T007 [US1] Définition `freighter-cargo-hold` : deux piles de caisses aux murs nus, un râtelier de fûts devant le conduit, trois places de dormeurs.
- [x] T008 [US2] Grandes castes sur toute la profondeur ; dormeurs placés.

## Phase 4: US3 — Cale de quarantaine de Léthé (P2)
- [x] T009 [US3] Définition `lethe-quarantine-hold` : deux caisses de quarantaine et un chariot renversé, bas.
- [x] T010 [US3] Profondeur et bande de l'acide ; dessin décalé ; reprise `depthV188.acid`.

## Phase 5: Polish
- [x] T011 `scripts/verify-depth-holds-v188.mjs` : emprises et voies, rail, bandes, guidage, saut, reprise, QZ-17 inchangée, emplacements.
- [x] T012 Parcours Chromium de chaque cale et mesure A/B alternée.
- [x] T013 Admission des fichiers et enregistrement du test dans `test:priorities:v188`.
- [x] T014 Art des 4 emplacements : PNG originaux livrés, recadrages de silhouette et placement proportionnel dans les boîtes physiques existantes ; codes cargo propres à chaque instance (suite du 16 novembre 2026).
- [x] T015 Matière du pont : texture orthographique répétée et projetée, caillebotis arrière, joints, lèvre et ombres conservés ; cinq fichiers au cache hors ligne. Voir `docs/development/DEPTH_HOLD_ART_QA_20261116.md` pour la recette automatisée.
- [ ] T016 Recette joueur du propriétaire avec les nouveaux visuels et appréciation de la couverture du rail dans les cargos ; les captures natives avant/après ne remplacent pas ce parcours.
