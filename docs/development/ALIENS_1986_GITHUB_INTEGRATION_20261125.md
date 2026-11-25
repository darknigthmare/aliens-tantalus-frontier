# Intégration GitHub — Aliens (1986), 25 novembre 2026

## Résultat et provenance

La V114 autonome est raccordée au menu principal et à la construction de Tantalus. Les 1 159 fichiers originaux (135 643 835 octets extraits) sont conservés sans modification sous `modules/aliens-1986/v114/`. Le manifeste `RECOVERY_MANIFEST.json` contient leurs tailles et empreintes. Sa propre empreinte est épinglée par le vérificateur d’admission.

Base de développement : `001a20bdc0f9f1a3c835e84d8f3c9434bc159330`, branche cumulative `claude/nifty-shannon-qpy1hl`. L’intégration est préparée sur `codex/integrate-aliens-1986-local-20261125`, afin de préserver les travaux parallèles. Le statut de fusion est celui de la pull request GitHub, pas celui des anciens rapports du paquet.

Le fichier ZIP d’origine est identifié par le SHA-256 `c6dfb2baa886d7b1651463f9685a666f37185aaa0d5cec7d42ccae928762d1e2`. Les modules historiques V106–V114, leurs validateurs et leurs migrations restent présents. Les anciennes preuves navigateur sont conservées comme preuves historiques, sans leur attribuer une nouvelle date de réussite.

## Raccordement

- `index.html` et `TitleScreenController` ajoutent **ALIENS (1986)** au menu, avec navigation clavier et manette au même titre que les autres entrées.
- `/dlc/aliens-1986/index.html` ouvre le jeu dans une iframe, avec retour Tantalus, ouverture du jeu seul et plein écran.
- `game.html` est une copie exacte du HTML V114 : 780 305 octets, SHA-256 `9f1b902e7546dff18867d9b0d1cb638bc9d256863654be5e2e74bc5cb301548d`.
- Le checkpoint propre au DLC reste `aliens_1986_v114_fidelity_checkpoint`. Aucune conversion des profils de campagne n’est introduite.
- La politique de distribution vérifie les fichiers exacts et leurs empreintes. Les deux HTML sont les seuls fichiers du DLC copiés dans le build ; les sources, rapports, outils et captures restent dans le dépôt.

## Validation réellement exécutée

La suite historique du DLC a été rejouée : **665 tests réussis**, aucun échec ni test ignoré. Le contrôle d’intégrité a confirmé les 1 158 fichiers hachés du paquet (le manifeste constitue le 1 159e fichier).

Les tests d’intégration couvrent l’admission exacte, les modifications à taille constante, les fichiers manquants ou supplémentaires, les chemins invalides, les liens symboliques, les fuites de sources dans un build, la copie du runtime et les gardes du bouton du menu. La première suite passait **16/16**. Le contrôle source, le build global et le contrôle du build réussissent ; le build contient 2 515 fichiers empreintés et conserve le schéma de sauvegarde 52. Ces résultats portent sur les changements locaux avant commit, sans prétendre valider par anticipation une CI GitHub.

La recette navigateur sur les fichiers servis du dépôt a réussi **21/21 contrôles** avec Playwright 1.65.2 et Chromium 159.0.8154.6. Elle a exécuté le lancement de l’opération, la marche de Ripley, l’ordre Tenir, l’approche du sas, son ouverture différée, la pause, la sauvegarde, le rechargement exact et l’aller-retour par le vrai menu Tantalus. Aucun état de progression n’a été injecté dans le DLC.

Trois profils natifs valides, créés par `createDefaultSave`, servent de sentinelles dans un contexte navigateur neuf. Ils restent identiques pendant l’utilisation du DLC. Aucun remplacement de l’horloge, du rendu ou des API navigateur n’est utilisé. Zéro erreur JavaScript ou console est observée. Cinq requêtes d’assets du parent ont été annulées lors de la navigation sortante ; elles ne sont pas interprétées comme une réussite supplémentaire.

La même recette a ensuite été rejouée sur le build distribué : **21/21**, zéro erreur JavaScript, zéro erreur console et zéro requête échouée. Ce sont 21 cas exécutés sur deux surfaces, pas 42 cas indépendants.

Les quatre fichiers surveillés sont restés identiques pendant cette recette : wrapper, HTML du jeu, shell Tantalus et contrôleur du menu. Le reçu JSON conserve les assertions et les empreintes correspondantes. Les captures sont des sorties brutes ; leur seule existence ne constitue pas une revue artistique.

## Ajustement après la première CI GitHub

La première recette navigateur GitHub a réussi 16 contrôles de jeu et de persistance, puis détecté une réponse HTTP 404 dans la console, sans exception JavaScript. Cette première trace ne contenait pas l'URL de la ressource. Le lanceur ne déclarait aucune icône, et `/favicon.ico` était absent : la requête implicite d'icône est une cause probable, non une URL observée dans cette trace.

Le lanceur déclare désormais l'icône PNG déjà distribuée par Tantalus. La recette enregistre les URL et statuts des erreurs HTTP ainsi que la localisation des messages console, sans filtrer les erreurs ni assouplir ses assertions. Elle utilise le navigateur installé par Playwright, sauf choix explicite avec `ATF_CHROMIUM_EXECUTABLE` ; la détection automatique d'un Chromium système est supprimée. Cette détection avait sélectionné Chromium 157 sur GitHub alors que Chromium 159 venait d'être installé pour la recette. Les résultats des nouveaux passages restent consultables dans la PR #57.

Les empreintes des parcours consignés plus haut correspondent à leurs exécutions avant cet ajustement du lanceur. Le HTML V114 et les 1 159 fichiers récupérés restent identiques.

## Succession exacte des registres historiques

La première CI V163 a aussi refusé les nouveaux octets du vérificateur de distribution, encore comparés à leur empreinte antérieure. Une première correction a prolongé les deux chaînes historiques indépendantes, Tantalus V188 et Xeno Trials V206, par deux blocs identiques de transitions précises depuis `001a20bdc0f9f1a3c835e84d8f3c9434bc159330`. Ils couvraient les six fichiers partagés modifiés par l’intégration : shell, paquet, contrôleur du titre, build, repérage des outils DEV et vérificateur de distribution, ainsi que le test Tantalus dont le calcul de l’empreinte attendue devait suivre ce nouveau maillon.

Chaque entrée exige le chemin, l’ancienne empreinte et la nouvelle empreinte exacts. Les anciens reçus et leurs empreintes restent inchangés ; les deux terminaux n’importent toujours aucun autre audit. La suite d’intégration enrichie passe **20/20** : quatre nouveaux cas vérifient l’égalité des blocs, les deux chemins de résolution du titre, le refus d’une mutation supplémentaire dans chacun des sept fichiers et l’identité des déclarations historiques. La suite d’audit i18n passe **4/4**, et les vérificateurs de succession V179/V180 ainsi que la convergence du titre par le relais QA natif passent en exécution directe.

Les contrôles historiques qui parcourent les médias complets restent à rejouer en CI : le checkout local partiel ne contient pas tous ces assets ni tous les outils archivés. Les cas tentés qui les requièrent s’arrêtent sur ces fichiers absents, après avoir dépassé l’erreur d’empreinte initiale. Ces vérifications locales ne constituent pas une réussite anticipée de la CI du prochain commit. Le reçu JSON initial demeure la preuve datée de la première intégration.

## Fusion avec la branche cumulative Fiorina

La branche cible a avancé vers `38a4a2272ec48a9cd5011f8a0055caaca6ab0774` (PR #56, Fiorina V114). La fusion conserve les deux intégrations dans le shell, le paquet et le vérificateur de distribution ; seules leurs empreintes courantes changent dans les reçus Aliens. Un bloc distinct, identique dans les deux terminaux, identifie exactement les cinq sources produit héritées de ce commit : `src/app.js`, `src/content.js`, `src/game-production-runtime.js`, `src/special-operations-v131.js` et `sw.js`. Leurs empreintes antérieures restent celles de `001a20b` et leurs empreintes courantes sont celles de `38a4a227`. Aucun de ces cinq fichiers n’est modifié par la correction des audits.

Fiorina ajoute une opération partielle au registre réel, qui contient désormais 22 entrées. Les cinq API d’audit historiques appliquent une projection commune : elles vérifient l’unique déclaration Fiorina complète, sa place, les identités et les comptes, retirent seulement cette entrée de leur vue et recalculent les comptes historiques. Chaque ancien vérificateur conserve ensuite ses propres contrôles des 21 déclarations, de leurs dettes et de leurs statuts. Le lecteur historique reconstruit le seul fichier de registre en inversant trois insertions exactes, après vérification de son empreinte ; le résultat doit retrouver l’ancienne empreinte exacte. Les cinq sources Fiorina héritées, les objets passés par les appelants, les nombres historiques et les anciens rapports restent inchangés.

Les tests QA V187, Tantalus V188, V157, V158 et Cocon adaptent seulement leurs attendus au nouveau maillon ou à cette vue historique vérifiée. Le bloc d’intégration compte désormais six sources partagées, la correction anglaise décrite ci-dessous et neuf tests précisément épinglés, auxquels s’ajoutent les cinq sources Fiorina du bloc séparé. La suite DLC passe **20/20**, y compris le refus d’un octet supplémentaire dans chacun de ces 21 fichiers. Les tests ciblés des contrats passent : **14 Tantalus**, **9 QA V187**, **4 i18n V186** et les **3 comparaisons historiques V157/V158/Cocon**. Les deux cas Tantalus ajoutés couvrent la projection, l’absence de mutation des entrées, les ajouts non revus, les déclarations trompeuses, les compteurs incohérents et les modifications ultérieures du lecteur. Le contrôle Tantalus des outils de développement archivés a également été tenté et reste bloqué par des fichiers non matérialisés du checkout ; il n’est pas compté comme réussi.

Le catalogue de campagnes conserve également ses **526 références historiques** dans le même ordre, avec l’unique campagne Fiorina vérifiée à la position 526 du catalogue réel de 527 entrées. Les quatre tests de catalogue (V143, Colonie, Acte V et Arbiter) conservent leurs anciens attendus sur cette projection et vérifient explicitement les comptes et objectifs de contenu actuels. Le sous-ensemble Queens reste borné aux positions 502–525. La correction produit supplémentaire ajoute seulement la traduction anglaise de l’objectif Fiorina dans `src/i18n-en-catalog-v185.js`, sans exclure cette campagne du contrôle de localisation. Les quatre cas de catalogue et le cas de traduction de tous les objectifs passent **5/5** ; les deux tests de projection Tantalus couvrent aussi les ajouts, substitutions, doublons et déplacements de la campagne Fiorina. Au total, **55 cas pertinents** ont réussi sur ce lot local, sans compter le contrôle d’outillage bloqué ni les essais sur médias absents.

Ces résultats concernent les fichiers fusionnés localement. Les workflows GitHub du prochain commit et les contrôles sur tous les médias restent à observer ; les réussites de la CI du commit précédent ne leur sont pas transférées. Le corpus V114, son manifeste de récupération et le reçu JSON initial demeurent identiques.

## Limites conservées

Cette intégration ne réalise pas la fusion du DLC dans la campagne native. La partie reste une opération indépendante et la chronologie de son équipe est adaptée. La V114 comporte 25 inspections et 11 salles d’opération ; huit repères du suivi restent absents. Ses 24 références d’équipement ne correspondent pas toutes à une mécanique jouable. Les véhicules pilotables, la Reine et le final P-5000/sas restent ouverts.

Le rendu des personnages et décors reste stylisé, sans certification 1:1. L’import historique `report/states-v113/03-relais.json` conserve son refus documenté pour collision avec une paroi nouvelle : aucune téléportation corrective n’a été ajoutée.

Les fichiers du chantier V115 n’ont pas été retrouvés dans l’environnement ni par les recherches de livraison effectuées. Cette intégration conserve la V114 réelle et ne reconstruit pas fictivement une V115.

## Reproduction

```bash
npm run test:dlc:aliens1986
npm run check:dlc:aliens1986
npm run check
npm run build
npm run check:built
python3 -B scripts/qa-aliens1986-integration.py --root dist --source-root . --output /tmp/aliens1986-built-qa
```

Les recettes historiques du paquet demeurent inchangées. Certaines attendent leur ancien environnement ; la recette d’intégration ajoutée accepte les chemins du dépôt et du build et écrit ses preuves hors des sources importées.
