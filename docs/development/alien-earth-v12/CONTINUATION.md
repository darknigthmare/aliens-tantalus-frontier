# Reprise technique et validation — Alien: Earth V12

## Historique conservé

Le point initial de la PR78, commit `c3fd0cdc72c58a9a4fd89684c00dc64125cee80d`, conservait huit PNG et sept documents après une perte d’accès à l’exécuteur. Le répertoire temporaire a ensuite disparu. Cette continuation a restauré la base depuis GitHub et reconstruit les raccords ; le texte des anciennes notes reste consultable dans ce commit historique.

Base hôte : `07ee99d56480780044c74d4f1eb11f31b07fef13`. Archive V11 : commit `6ed9b9210a097bbdf90ec3a22043a3fe5845e541`, dossier `archives/local-recovery-20261125/alien-earth/`, trois fragments assemblés en 23 895 722 octets. SHA‑256 de l’archive : `c6402939c7e3085609b191848f710cd2efe84c5bfe6547a2cf95ca39494c38f3`. Les 180 fichiers originaux sont couverts par `modules/alien-earth/RECOVERY_V11.json`. Le reçu a été recalculé depuis l’archive ; l’empreinte du reçu perdu n’est pas réutilisée.

## Raccords reconstruits

- Action ALIEN: EARTH dans le titre hôte, ouverture de `dlc/alien-earth/v12/index.html`, retour depuis le titre et la pause du DLC.
- Arrêt hôte par `bioforgeRuntimeV80.stopBioforgeEngineOnlyV80()` ; aucune persistance Forge implicite à l’ouverture. Le garde de sortie est réinitialisé sur `pageshow` après retour historique pour ne pas inhiber une sauvegarde native ultérieure.
- Retour Earth par `Navigation.back()` seulement lorsque l’API atteste l’entrée précédente de l’hôte, du même origin, au niveau principal. À défaut, l’URL hôte est ouverte directement. Un verrou empêche deux retours simultanés ; les rejets asynchrones conservent l’accès à la progression.
- Audio natif : la scène est neutralisée avant le départ, pour empêcher un chargement tardif de relancer la musique. Le directeur audio reste utilisable si le document est conservé en cache, puis sa scène est restaurée au retour. La destruction intervient lors d’un départ définitif. Les réglages muets et les volumes restent conservés.
- Garde d’enregistrement Earth `!started`, afin que `visibilitychange` au titre ne remplace pas une sauvegarde existante par l’état initial.
- Erreur d’enregistrement rendue explicite ; possibilité d’exporter avant un retour forcé.
- Registre raster avec chargement différé, dimensions contrôlées, URL relatives ou données embarquées, fallback Canvas et restauration de l’état de dessin.
- Huit ressources restaurées et sept nouvelles, avec usages limités aux bonnes poses, costumes et objets de salle.
- Apparence C03 cohérente entre PNG et animation de secours pour Curly/Nibs ; PNG distinct pour l’applique éteinte de R18 ; pas de conversion d’Arthur infecté en Arthur sain.
- Table, pipette, racks et lumières attachés à des IDs R18 précis ; géométrie et collisions conservées.
- Panneau du Zoo déplacé visuellement après constat qu’un rack masquait son texte.
- Builder de modules ES transitifs, export portable à images embarquées, admissions fermées et exclusion des documents du build public.

## Commandes de vérification

Depuis la racine du dépôt, avec Node 22 ou supérieur :

```sh
npm run test:dlc:earth
node --test scripts/verify-aliens1986-main-succession-v116.mjs scripts/verify-river-of-pain-succession.mjs
npm run build:dlc:earth
```

Le script `scripts/qa-alien-earth-integration-v12.py` accepte `--root`, `--source-root`, `--output`, `--skip-title`, `--standalone` et `--scenario all|portable|host-roundtrips`. Employer un répertoire de build choisi pour la tâche. Le binaire Chromium peut être fourni par `ATF_CHROMIUM_EXECUTABLE`. La trace légère conserve les captures explicites sans accumuler de captures automatiques.

La variante `--skip-title` ne prouve pas le menu hôte. Pour l’entrée et le retour natifs, servir les vrais fichiers de l’hôte et ses ressources exactes. Un dossier ne contenant que le DLC ne peut pas remplacer ce contrôle. Les scènes R18 chargées depuis une fixture de sauvegarde sont identifiées comme telles ; elles ne valent pas parcours de toute la campagne jusqu’à ce lieu.

## Vérifications déjà observées avant le lot final

La base restaurée avec huit images a passé 1 240 tests Node et 13 contrôles Chromium. Des erreurs de ressources dues au root hôte incomplet ont d’abord été observées, puis résolues en récupérant les ressources exactes depuis le commit hôte. Un crash d’onglet d’une passe accumulant plusieurs scénarios est resté dans les traces ; la passe ensuite isolée dans des navigateurs neufs a réussi avec la configuration par défaut de Playwright, sans relâcher les assertions. Une revue ultérieure a établi que Playwright désactivait implicitement BFCache ; cette passe ne prouvait donc pas le comportement avec ce cache actif. La validation finale doit retirer ce défaut de lancement et couvrir le retour historique.

Ces résultats historiques ne valident pas à eux seuls les sept images ajoutées ensuite. Le lot de quinze images a ensuite passé les contrôles du DLC et du fichier autonome. Le workflow [Alien Earth DLC du commit 249e6abd](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45837123348) a également réussi ses tests, ses builds et ses douze contrôles navigateur sans hôte. Cette preuve précède le dernier correctif de retour et d’audio.

## Contrôles du dernier correctif

La suite Earth compte **1 266 tests réussis** : 1 216 hérités, 4 de cycle de vie, 30 de rendu raster et 16 d’intégration. Les successions Aliens/Fleuve passent **7 tests**. Une passe ciblée de **105 tests** couvre l’intégration, le lanceur global, l’audit V143, le harpon et le cycle audio V162 ; elle recouvre une partie des suites précédentes et ne doit pas être additionnée comme 105 tests tous distincts.

Le lanceur global développe uniquement le motif littéral admis `modules/alien-earth/v12/tests/*.test.mjs`, puis déduplique les fichiers. Les autres motifs et fragments shell restent rejetés. Les contextes VM des anciens tests de harpon reçoivent le drapeau natif `leavingForEarthV12=false`, sans retirer d’assertion.

Les essais hôte antérieurs sont conservés dans le rapport navigateur. Une passe avait accompli deux cycles mais comportait 111 ressources absentes ; une autre, avec toutes les ressources rétablies, avait planté au deuxième retour sans erreur JavaScript ou de ressource observée. Ces deux résultats restent distincts. La cause du crash n’est pas établie par ces observations.

La validation navigateur du dernier correctif, les empreintes des fichiers jouables et la portée exacte des fixtures sont consignées dans [le rapport navigateur](qa/browser-report.json) et [le rapport de tests](qa/test-report.json). Une même clé d’historique ne prouve pas la conservation du même document : `performance.timeOrigin` et `pageshow.persisted` sont rapportés séparément.

## Périmètre de livraison

Le moteur Earth reste autonome ; schéma 11, espace `atf.dlc.alien-earth.s1.profile-1`. L’intégration de navigation ne constitue pas une fusion dans le GameEngine natif. Le module source contient les 180 fichiers historiques, les sources V12 et les 15 PNG finaux. Les 30 journaux historiques V11 appartiennent à la provenance, sans être de nouveaux résultats QA.

Les trois nouvelles silhouettes Kirsh/Curly/Nibs sont accessibles dans le catalogue ; leur affichage comme PNJ de campagne n’est pas revendiqué. Aucune animation complète, aucun extérieur de véhicule ou de vaisseau et aucune texture planétaire supplémentaire ne sont livrés par cette reprise. Les manquants détaillés sont dans la bible et l’inventaire.
