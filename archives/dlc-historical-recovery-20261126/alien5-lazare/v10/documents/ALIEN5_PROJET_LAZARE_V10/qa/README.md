# Provenance des résultats V10
Les résultats comptés sont nommés dans `qa-summary-v10.json`, avec les contrôles structurels dans `architecture-v10.json` et documentaires dans `docs-v10.json`. Les suites `current-*` chargent toutes le runtime V10, même si leur titre indique le système historique contrôlé. Leurs anciennes fixtures ne constituent pas de nouveaux parcours.

`v10full_*.json` et `v10rationed_*.json` sont des checkpoints produits par le pilote courant. Le dernier parcours Survie de chaque famille les remplace ; les quatre bilans `campaign-v10*-results.json` distinguent les exécutions. Les exports ne sont pas des sauvegardes personnelles du joueur.

Les 15 photos dans `v10screens` ont leurs légendes dans `captures-v10.json`. Les 120 images gauche/droite de `v10rooms` sont produites à partir d’états préparés ; les 60 suffixes `_audit` sont des planches de deux vues existantes, pas des vues nouvelles. `contact-v10-*` assemble encore ces images pour l’inspection. Les captures des documents vérifient la mise en page, pas le gameplay.

La navigation locale fut effectivement tentée et bloquée, comme consigné dans `probe-v10.json`. Les essais suivants exécutent le document en mémoire, avec horloge et stockage substitués explicitement. Ils ne prouvent pas la persistance native après fermeture du navigateur ou une fluidité mesurée.
