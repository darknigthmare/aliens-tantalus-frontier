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

Les tests d’intégration couvrent l’admission exacte, les modifications à taille constante, les fichiers manquants ou supplémentaires, les chemins invalides, les liens symboliques, les fuites de sources dans un build, la copie du runtime et les gardes du bouton du menu. La suite finale passe **16/16**. Le contrôle source, le build global et le contrôle du build réussissent ; le build contient 2 515 fichiers empreintés et conserve le schéma de sauvegarde 52. Ces résultats portent sur les changements locaux avant commit, sans prétendre valider par anticipation une CI GitHub.

La recette navigateur sur les fichiers servis du dépôt a réussi **21/21 contrôles** avec Playwright 1.65.2 et Chromium 159.0.8154.6. Elle a exécuté le lancement de l’opération, la marche de Ripley, l’ordre Tenir, l’approche du sas, son ouverture différée, la pause, la sauvegarde, le rechargement exact et l’aller-retour par le vrai menu Tantalus. Aucun état de progression n’a été injecté dans le DLC.

Trois profils natifs valides, créés par `createDefaultSave`, servent de sentinelles dans un contexte navigateur neuf. Ils restent identiques pendant l’utilisation du DLC. Aucun remplacement de l’horloge, du rendu ou des API navigateur n’est utilisé. Zéro erreur JavaScript ou console est observée. Cinq requêtes d’assets du parent ont été annulées lors de la navigation sortante ; elles ne sont pas interprétées comme une réussite supplémentaire.

La même recette a ensuite été rejouée sur le build distribué : **21/21**, zéro erreur JavaScript, zéro erreur console et zéro requête échouée. Ce sont 21 cas exécutés sur deux surfaces, pas 42 cas indépendants.

Les quatre fichiers surveillés sont restés identiques pendant cette recette : wrapper, HTML du jeu, shell Tantalus et contrôleur du menu. Le reçu JSON conserve les assertions et les empreintes correspondantes. Les captures sont des sorties brutes ; leur seule existence ne constitue pas une revue artistique.

## Ajustement après la première CI GitHub

La première recette navigateur GitHub a réussi 16 contrôles de jeu et de persistance, puis détecté une réponse HTTP 404 dans la console, sans exception JavaScript. Cette première trace ne contenait pas l'URL de la ressource. Le lanceur ne déclarait aucune icône, et `/favicon.ico` était absent : la requête implicite d'icône est une cause probable, non une URL observée dans cette trace.

Le lanceur déclare désormais l'icône PNG déjà distribuée par Tantalus. La recette enregistre les URL et statuts des erreurs HTTP ainsi que la localisation des messages console, sans filtrer les erreurs ni assouplir ses assertions. Elle utilise le navigateur installé par Playwright, sauf choix explicite avec `ATF_CHROMIUM_EXECUTABLE` ; la détection automatique d'un Chromium système est supprimée. Cette détection avait sélectionné Chromium 157 sur GitHub alors que Chromium 159 venait d'être installé pour la recette. Les résultats des nouveaux passages restent consultables dans la PR #57.

Les empreintes des parcours consignés plus haut correspondent à leurs exécutions avant cet ajustement du lanceur. Le HTML V114 et les 1 159 fichiers récupérés restent identiques.

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
