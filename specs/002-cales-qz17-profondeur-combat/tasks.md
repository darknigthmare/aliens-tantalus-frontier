# Tasks: Cales de QZ-17 en profondeur, avec combat

## Phase 1: Setup / Foundational
- [x] T001 Mesurer le temps d'image de référence dans la cale, en A/B dans la même page (protocole de la spec 001).
- [x] T002 Créer `src/mission-depth-v188.js` :
  - `buildCargoHoldSectionV188(engine)`, qui construit la section à partir des sas et du pont bas de `ship-cargo` ;
  - trois rangées de conteneurs « QZ17 » et la couverture existante, avec leurs emprises.
- [x] T003 Composer `withMissionDepthRoomsV188` le plus à l'extérieur de `GameEngine` (`src/game-production-runtime.js`) ; ajouter le module à `sw.js`.

## Phase 2: US1 — Explorer la cale (P1)
- [x] T004 [US1] Déplacement en profondeur d'Echo-9 et du marine coop :
  - touches retirées sur le pont de la cale ;
  - pas balayé contre les emprises ;
  - sortie limitée au rail ;
  - couverture de caisses franchissable seulement près du mur.
- [x] T005 [US1] Rendu de la cale :
  - décalage vertical et conteneurs primitifs ;
  - ordre entre Echo-9 et les ennemis ;
  - occultation masquée et contour.
- [x] T006 [US1] Annonce « SALLE EN PROFONDEUR » à l'approche et pendant 5 s après l'entrée.

## Phase 3: US2 — Tir à alignement automatique (P1)
- [x] T007 [US2] Gérer la profondeur des balles :
  - marquer chaque balle de la profondeur du tireur ;
  - filtrer les ennemis et l'aide à la visée à ±22 ;
  - faire arrêter les salves par les conteneurs ;
  - recaler le tireur de 30 % ;
  - filtrer le corps à corps du joueur.

## Phase 4: US3 — Xénomorphes en profondeur (P1)
- [x] T008 [US3] Gérer les ennemis en profondeur :
  - poursuite de la profondeur de la cible ;
  - sortie vers la zone libre la plus proche ;
  - corps à corps limité à ±24 ;
  - projectiles ennemis portant la profondeur du tireur.

## Phase 5: US4 / US5 — Détecteur et reprise (P2)
- [x] T009 [US4] Recopier la profondeur dans `actor.depth` pour le détecteur V160 pendant la mise à jour, puis la rétablir.
- [x] T010 [US5] Ajouter `depthV188` à la capture de reprise et le restaurer à la reprise.

## Phase 6: Polish
- [x] T011 Écrire `scripts/verify-mission-depth-v188.mjs` sur le moteur réel :
  - section et déplacement ;
  - tir dans la bande, hors bande et à travers un conteneur ;
  - attaque hors bande ;
  - détecteur ;
  - reprise ;
  - invariance hors de la cale.
- [x] T012 Parcours Chromium dans QZ-17 et mesure A/B de performance.
- [x] T013 Documentation : bible §56.12, rapport, admission des fichiers, enregistrement du test, suites complètes.
