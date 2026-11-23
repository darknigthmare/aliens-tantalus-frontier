# Tâches : outils de développement (spec 012)

## Ce lot

- [x] T001 Catalogue des entrées généré depuis les registres du jeu, recherche et filtre (`devtools/dev-catalog-v188.js`)
- [x] T002 Fixtures par les règles du jeu, `migrateSave`, `inspectSaveSlotV78`, injections déclarées, entrées bloquées motivées (`devtools/dev-fixtures-v188.js`)
- [x] T003 Stockage isolé injecté avant les scripts du jeu ; profil réel intact ; sortie qui supprime la session
- [x] T004 Serveur de développement : `/devtools/`, `/dev`, injection sur `/?atf-dev=v188` uniquement
- [x] T005 Pont de session : titre, hub, vues, missions, checkpoints de phase, cinématiques, Xeno Trials ; scène atteinte rapportée
- [x] T006 Options : langue, difficulté, mode dieu, munitions infinies, révéler, vitesse, pause, image par image, collisions, lieux, zones d'apparition, ligne des pieds, aucune apparition
- [x] T007 Stand de tir dans le moteur réel : armes, équipement, chargeurs physiques, cibles par caste, ordres d'escouade, mesures, surcouches, réglages et export JSON
- [x] T008 Admission source seulement (`verify-public-release-v86.mjs`), suite Node, QA Chromium, documentation (`AGENTS.md`, plan) — remplacée par T009-T013 pour les fichiers de `devtools/`

## Lot du 2026-11-23 : page livrée cachée dans le build public (décision du propriétaire)

- [x] T009 Isolation côté client : script en ligne, premier script de `index.html`, actif pour la requête exacte seulement ; `indexedDB` retiré ; arrêt si l'isolation échoue ; pont de session chargé depuis le dossier du lanceur (`devtools/dev-storage-v188.js`, `scripts/build-dev-tools-v188.mjs`)
- [x] T010 Build : dossier caché au nom configurable (`ATF_DEV_TOOLS_PATH`, défaut `labo-tantalus-v188`), URL de la page réécrites, empreinte `devTools` sans le nom du dossier dans `build-info.json` ; serveur de développement aligné sur le même script
- [x] T011 Vérificateurs : admission des neuf fichiers sous un seul dossier caché, scripts/specs/docs en source seulement ; `check:built` (liste, empreinte, premier script, nom du dossier absent ailleurs, hors coquille hors ligne)
- [x] T012 Suite Node : « livré caché, isolé, non relié, non précaché » à la place de « exclu du build » ; QA Chromium sur le build servi en statique avec profil sentinelle et service worker actif (`scripts/qa-dev-tools-built-v188.mjs`)
- [x] T013 Passe téléphone 390×844 tactile : lanceur (options repliées, cibles de 44 px), panneau DEV et stand repliables en une barre, repliés au départ ; contrôlée par le QA sur le build (ancien T106)

## Reste (non livré, à ne pas déclarer terminé)

- [ ] T101 Checkpoints internes de la course du convoi de l'Acte V (jalons `act5RaceMilestoneV188` à la distance) et des chapitres V131 (`legacyCheckpointV131`, `hiveCheckpointV131`…) : seules les phases des niveaux dédiés colonie C1-C4 et station S1-S4 sont listées.
- [ ] T102 Retours ARBITER 02-06 : ils exigent le reçu de fin du runtime (`validateArbiterCompletionV190`), non falsifiable par une fixture ; entrées affichées désactivées.
- [ ] T103 Réglage des ordres d'escouade : les constantes de `squad-doctrine-v132.js` sont gelées ; le stand applique et mesure les ordres existants sans éditer leurs paramètres.
- [ ] T104 Tir instantané sans projectile : mesuré par les dégâts appliqués et les événements, pas de trace de trajectoire.
- [ ] T105 Surcouches dans les niveaux en profondeur (`mission-depth-v188.js`) : projection 2D simple, la profondeur `depthZ` n'est pas reportée.
- [ ] T107 Essai sur l'hébergeur réel (URL avec et sans barre finale sous `cleanUrls`, réécriture de repli) et sur un téléphone réel (Safari iOS, Chrome Android) : seuls le build servi en statique local et l'émulation Chromium ont été contrôlés.
- [ ] T108 Contrôle d'accès : aucun. Si la discrétion ne suffit plus, il faut une protection côté hébergeur (mot de passe ou accès restreint), hors de ce dépôt.
- [ ] T109 Le QA sur le build n'est pas branché dans les workflows CI (`.github/workflows/`) ; il se lance à la main après `npm run build`.
