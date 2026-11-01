# Tantalus ⇄ Alien_base (V1, métadonnées uniquement)

**Dépôt maître privé :** `darknigthmare/alien_base`, PR #2 `codex/federation-alien-games-20261101`.

Le snapshot en lecture seule `src/alien-base-public-v1.js` contient uniquement des noms, des IDs et des preuves/URLs publiques déjà diffusés. Les jeux publics **n'accèdent pas** au dépôt privé à l'exécution. `src/alien-base-registry-v1.js` expose les entrées par ID exact ; `src/content.js` réexporte l'API sans toucher aux tableaux historiques de combat, aux ID de sauvegardes ni à la progression.

Le fichier Excel/CSV `docs/development/Alien_Base_Import_Status.csv` contient 534 fiches d'index du master ; il ne signifie pas 534 nouvelles unités, armes ou véhicules implémentés. Les **129** nouvelles pistes d'armes restent en étude ; seule une admission vérifiée spécifique aux œuvres et à la mécanique de Tantalus pourra les insérer dans le jeu. Le gameplay Musou de Yautja n'est pas réimporté.

Vérification : `node --test scripts/verify-alien-base-bridge-v1.mjs`, puis QA habituelles du jeu. Comparer la liste complète à chaque version suivante du master et ouvrir une PR pour toute nouvelle caste ou correction de référence (média, version, variantes, espèces). Les références d'assets/portraits restent dans les registres source des jeux ; **aucune conformité graphique 1:1 n'est déclarée**.
