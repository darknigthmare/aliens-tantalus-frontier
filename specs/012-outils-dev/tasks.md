# Tâches : outils de développement (spec 012)

## Ce lot

- [x] T001 Catalogue des entrées généré depuis les registres du jeu, recherche et filtre (`devtools/dev-catalog-v188.js`)
- [x] T002 Fixtures par les règles du jeu, `migrateSave`, `inspectSaveSlotV78`, injections déclarées, entrées bloquées motivées (`devtools/dev-fixtures-v188.js`)
- [x] T003 Stockage isolé injecté avant les scripts du jeu ; profil réel intact ; sortie qui supprime la session
- [x] T004 Serveur de développement : `/devtools/`, `/dev`, injection sur `/?atf-dev=v188` uniquement
- [x] T005 Pont de session : titre, hub, vues, missions, checkpoints de phase, cinématiques, Xeno Trials ; scène atteinte rapportée
- [x] T006 Options : langue, difficulté, mode dieu, munitions infinies, révéler, vitesse, pause, image par image, collisions, lieux, zones d'apparition, ligne des pieds, aucune apparition
- [x] T007 Stand de tir dans le moteur réel : armes, équipement, chargeurs physiques, cibles par caste, ordres d'escouade, mesures, surcouches, réglages et export JSON
- [x] T008 Admission source seulement (`verify-public-release-v86.mjs`), suite Node, QA Chromium, documentation (`AGENTS.md`, plan)

## Reste (non livré, à ne pas déclarer terminé)

- [ ] T101 Checkpoints internes de la course du convoi de l'Acte V (jalons `act5RaceMilestoneV188` à la distance) et des chapitres V131 (`legacyCheckpointV131`, `hiveCheckpointV131`…) : seules les phases des niveaux dédiés colonie C1-C4 et station S1-S4 sont listées.
- [ ] T102 Retours ARBITER 02-06 : ils exigent le reçu de fin du runtime (`validateArbiterCompletionV190`), non falsifiable par une fixture ; entrées affichées désactivées.
- [ ] T103 Réglage des ordres d'escouade : les constantes de `squad-doctrine-v132.js` sont gelées ; le stand applique et mesure les ordres existants sans éditer leurs paramètres.
- [ ] T104 Tir instantané sans projectile : mesuré par les dégâts appliqués et les événements, pas de trace de trajectoire.
- [ ] T105 Surcouches dans les niveaux en profondeur (`mission-depth-v188.js`) : projection 2D simple, la profondeur `depthZ` n'est pas reportée.
- [ ] T106 QA tactile et téléphone du lanceur et des panneaux (outil de bureau).
