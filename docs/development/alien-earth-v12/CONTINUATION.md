# Reprise technique et validation — Alien: Earth V12

## Historique conservé

Le point initial de la PR78, commit `c3fd0cdc72c58a9a4fd89684c00dc64125cee80d`, conservait huit PNG et sept documents après une perte d’accès à l’exécuteur. Le répertoire temporaire a ensuite disparu. Cette continuation a restauré la base depuis GitHub et reconstruit les raccords ; le texte des anciennes notes reste consultable dans ce commit historique.

Base hôte : `07ee99d56480780044c74d4f1eb11f31b07fef13`. Archive V11 : commit `6ed9b9210a097bbdf90ec3a22043a3fe5845e541`, dossier `archives/local-recovery-20261125/alien-earth/`, trois fragments assemblés en 23 895 722 octets. SHA‑256 de l’archive : `c6402939c7e3085609b191848f710cd2efe84c5bfe6547a2cf95ca39494c38f3`. Les 180 fichiers originaux sont couverts par `modules/alien-earth/RECOVERY_V11.json`. Le reçu a été recalculé depuis l’archive ; l’empreinte du reçu perdu n’est pas réutilisée.

## Raccords reconstruits

- Action ALIEN: EARTH dans le titre hôte, ouverture de `dlc/alien-earth/v12/index.html`, retour depuis le titre et la pause du DLC.
- Arrêt hôte par `bioforgeRuntimeV80.stopBioforgeEngineOnlyV80()` ; aucune persistance Forge implicite à l’ouverture. Le garde de sortie est réinitialisé sur `pageshow` après retour historique pour ne pas inhiber une sauvegarde native ultérieure.
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

Le script `scripts/qa-alien-earth-integration-v12.py` accepte `--root`, `--source-root`, `--output` et `--skip-title`. Employer un répertoire de build choisi pour la tâche. Le binaire Chromium peut être fourni par `ATF_CHROMIUM_EXECUTABLE`.

La variante `--skip-title` ne prouve pas le menu hôte. Pour l’entrée et le retour natifs, servir les vrais fichiers de l’hôte et ses ressources exactes. Un dossier ne contenant que le DLC ne peut pas remplacer ce contrôle. Les scènes R18 chargées depuis une fixture de sauvegarde sont identifiées comme telles ; elles ne valent pas parcours de toute la campagne jusqu’à ce lieu.

## Vérifications déjà observées avant le lot final

La base restaurée avec huit images a passé 1 240 tests Node et 13 contrôles Chromium. Des erreurs de ressources dues au root hôte incomplet ont d’abord été observées, puis résolues en récupérant les ressources exactes depuis le commit hôte. Un crash d’onglet d’une passe accumulant plusieurs scénarios est resté dans les traces ; la passe ensuite isolée dans des navigateurs neufs a réussi avec la configuration par défaut de Playwright, sans relâcher les assertions. Une revue ultérieure a établi que Playwright désactivait implicitement BFCache ; cette passe ne prouvait donc pas le comportement avec ce cache actif. La validation finale doit retirer ce défaut de lancement et couvrir le retour historique.

Ces résultats ne valident pas à eux seuls les sept images ajoutées ensuite. La suite finale à 15 images et ses captures restent en cours à cette étape. Consulter `qa/browser-report.json` et `qa/test-report.json` pour l’état final, la portée, les fixtures et les limites.

## Périmètre de livraison

Le moteur Earth reste autonome ; schéma 11, espace `atf.dlc.alien-earth.s1.profile-1`. L’intégration de navigation ne constitue pas une fusion dans le GameEngine natif. Le module source contient les 180 fichiers historiques, les sources V12 et les 15 PNG finaux. Les 30 journaux historiques V11 appartiennent à la provenance, sans être de nouveaux résultats QA.

Les trois nouvelles silhouettes Kirsh/Curly/Nibs sont accessibles dans le catalogue ; leur affichage comme PNJ de campagne n’est pas revendiqué. Aucune animation complète, aucun extérieur de véhicule ou de vaisseau et aucune texture planétaire supplémentaire ne sont livrés par cette reprise. Les manquants détaillés sont dans la bible et l’inventaire.
