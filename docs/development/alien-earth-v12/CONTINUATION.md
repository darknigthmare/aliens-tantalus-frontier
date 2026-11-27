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

## Preuve CI de la révision finale

Le [workflow Earth de la révision 6ac32413](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45846386818) a réussi ses deux jobs. Le job `earth` passe 1 266 tests Earth, 7 tests de succession et 12 contrôles navigateur DLC/portable. Le job `host-roundtrips` utilise le vrai build natif complet, un contexte navigateur unique et deux allers-retours consécutifs par les menus.

| Cycle | Retour effectué | Entrée et document natifs | Audio après retour |
| --- | --- | --- | --- |
| 1 | Bouton de retour du DLC | Même entrée d’historique, nouveau document | Directeur non détruit ; déverrouillage au vrai clic de menu suivant |
| 2 | Retour historique réel du navigateur | Même entrée et même document ; `pageshow.persisted=true` | Directeur non détruit, contexte actif, scène du menu en lecture |

Les sauvegardes Earth, les trois profils natifs de test et le profil sélectionné restent identiques avant/après les deux cycles. Les empreintes des fixtures correspondent à celles des essais locaux. Le rapport ne contient aucune exception JavaScript ni ressource applicative échouée. Trois messages console 404 correspondent précisément à `/favicon.ico` dans la trace ; cette icône était déjà exclue du filtre de ressources du harnais. Ce résultat ne constitue donc pas une absence totale de messages console.

Le code de jeu validé est `6ac32413c6b0c00d3e4d9fe8a35561ac430804b0`. GitHub a testé son commit de fusion temporaire `abbe6ed8e3e1d5f73fa4493a1337f31fdc316a05` ; son arbre `d58e25af95c320811d91f4ae2bcad8bf7c264f51` est exactement celui du code publié. La finalisation des documents et du reçu de vérificateur décrit ci-dessous ne modifie aucun fichier du runtime. Le rapport brut CI est identifié par le blob `8454cd5c20a9bc68891d6a0830ee3c7d1fc76a23` ; sa représentation assainie, conservant les égalités d’identifiants, est incluse dans `qa/browser-report.json`.

Le [workflow Gameplay V162 de cette révision](https://github.com/darknigthmare/aliens-tantalus-frontier/actions/runs/45846386754) passe également 63 tests Node, les contrôles de distribution, le build natif de 2 200 fichiers et les parcours navigateur Harpoon/audio/medical/convoy. Les autres contrôles du dépôt restent consultables dans la PR ; ces résultats ne sont pas présentés comme une validation universelle de tous les scénarios.

Le succès CI ne supprime pas le crash GPU observé localement et ne démontre pas sa cause. Aucun parcours intégral des 70 salles n’est revendiqué ; la scène R18 demeure une fixture visuelle explicitement déclarée.

### Dernier reçu de vérificateur

Le premier run global de cette révision, `45846387234`, a exécuté 5 394 tests : 5 391 réussites, deux échecs et un test optionnel ignoré. Les deux échecs V165 provenaient du même reçu manquant pour `scripts/verify-audit-v143.mjs`, déjà modifié pour admettre la suite Earth. Le registre terminal Earth ajoute maintenant ce neuvième chemin avec son prédécesseur exact `825a8672e074c335568669ce8e5c496ed2fb70af9e11f3d834169da1a8d5a1c2` et son successeur exact `2de1172c3c821113eec7fdac46b4fa27206f03e4fbb735da7f7dccd197e5517f`.

Les huit reçus antérieurs et le code des résolveurs restent identiques. Les tests refusent neuf faux prédécesseurs et neuf corruptions isolées. La vraie suite V165 passe **8/8**, après restauration de ses 62 fichiers de référence depuis leurs blobs exacts, puis exécution sans hook ni lecture substituée. Earth repasse **1 266/1 266** et la compatibilité audit/successions **79/79**. Ces groupes se recouvrent et ne s’additionnent pas en un total de tests distincts. Le statut du nouveau run global reste celui des contrôles de PR ; le résultat historique à deux échecs n’est pas réécrit comme un succès.

## Périmètre de livraison

Le moteur Earth reste autonome ; schéma 11, espace `atf.dlc.alien-earth.s1.profile-1`. L’intégration de navigation ne constitue pas une fusion dans le GameEngine natif. Le module source contient les 180 fichiers historiques, les sources V12 et les 15 PNG finaux. Les 30 journaux historiques V11 appartiennent à la provenance, sans être de nouveaux résultats QA.

Les trois nouvelles silhouettes Kirsh/Curly/Nibs sont accessibles dans le catalogue ; leur affichage comme PNJ de campagne n’est pas revendiqué. Aucune animation complète, aucun extérieur de véhicule ou de vaisseau et aucune texture planétaire supplémentaire ne sont livrés par cette reprise. Les manquants détaillés sont dans la bible et l’inventaire.
