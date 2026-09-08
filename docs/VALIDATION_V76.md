# Validation V76

8 septembre 2026. Portée : lot Prowler/Ceto et dialogue du hub, pas certification commerciale de l’ensemble du jeu.

## Contrôles locaux

- Inventaires V55/V64/V66 : vérifiés ; 195 atlas / 2772 cellules historiques, plus 12 atlas / 384 poses dans le supplément V65/V66.
- Alpha V64 : 195 atlas contrôlés. Audit PNG : 405 images runtime, 0 erreur, **13 candidats de halo encore à examiner** ; 229 masters exclus par règle.
- Facehugger V65, premier lot V66, file centrale V66, progression V75 et art Prowler/Ceto V75 : contrôles réussis.
- Preuve runtime ennemis renouvelée : **308 tests réussis**, sortie et SHA liés aux décisions dans `docs/references/v75-enemy-fixes/`.
- Lint : 308 modules valides. Suite globale après la correction du portrait : **1263 tests, 1262 réussis, 0 échec, 1 ignoré**. Le test ignoré dépend de la création de liens fichiers autorisée par Windows ; ce n’est pas une fonctionnalité déclarée validée.
- Build local : `76.0.0`, 3450 entrées de catalogue. Un décompte de catalogue ne certifie pas la complétude du contenu.
- QA navigateur locale : station armurerie et vrai dialogue Mara Vega à six choix, aux formats 1280×720, 390×844 et 844×390. Clics, défilement, fermeture/reprise et cadrage d’une seule cellule du portrait contrôlés. Captures dans le dépôt privé sous `docs/references/v76-browser-qa/`.

## Vérifications de publication

La QA navigateur des ennemis confirme les deux atlas HTTP200 et leurs SHA exacts, 32 poses distinctes chacun, 128 rendus de production (32 poses × 2 orientations × 2 profils), les tailles physiques 96×88 / 156×100 et un seul Ceto dans son bassin. Rapport : `docs/references/v76-browser-qa/enemies-v75-browser-report.json`. Il s’agit de démarrages contrôlés et de rendu, pas d’un parcours Abysse Noir complet ; le décor métallique du bassin reste à améliorer.

Le commit, le push, le déploiement Ready et les contrôles distants seront consignés après leur réussite. Ce document ne les déclare pas acquis à partir du seul build local.

## Limites connues

- Aucun des 26 contrats de conversation n’est entièrement terminé : 14 partiels et 12 manquants à l’audit initial.
- Ceto reste un prédateur d’un bassin authored ; aucune nage libre, mission Abysse Noir ou conduite HADAL/MANTA-6 n’est revendiquée.
- Les atlases sont des adaptations/créations du projet, pas une preuve de reproduction officielle pixel à pixel.
- Le rechargement tactique est préparé séparément ; il n’est pas livré ni publié dans ce lot tant que son runtime, ses entrées, sa sauvegarde et son HUD ne sont pas raccordés.
- Les scripts navigateur historiques V52/V64 conservent des attentes de version obsolètes ; ils ne sont pas présentés comme une validation end-to-end de toutes les campagnes V76.
