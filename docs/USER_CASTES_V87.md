# Import des castes fournies — V87

35 PNG fournis par l'utilisateur, copiés sans modification dans `assets/user/castes-v87/`.
Total : 64 396 633 octets. Le reçu SHA-256 est `references/user-castes-v87-integrity.json`.

## Périmètre livré

- 35 identités média-qualifiées et indépendantes des 571 identités existantes.
- BIOFORGE : 11 profils animés existants + 35 poses importées, sélection et compositions mixtes, file, renforts, annulation, dégâts, sauvegarde/reprise et purge.
- Correspondances anciennes explicites affichées « Altered » dans le BIOFORGE ; aucun ID, sprite ancien ou sauvegarde remplacé.
- Rendu plein PNG 1×1, ratio conservé, ancrage des pieds et miroir. Aucun découpage en fausse animation ni atlas emprunté.
- Une image absente/invalide bloque la simulation et l'impression ; aucune entrée consommée ni combat invisible. La purge reste accessible.
- Chaque PNG est chargé à la demande. Les 35 fichiers ne sont pas préchargés au démarrage.
- Terminal replié par défaut pendant une session, réouverture explicite ; aperçu et avertissement conservés sur mobile.
- Réserve des nouvelles sessions portée à 1 600 cartouches pour couvrir 48 reines blindées ; anciennes réserves restaurées telles quelles, jamais remplies.

## Limites explicites

Ce sont des **poses fixes**, pas des spritesheets animées. `animationStatus=missing`.
Les comportements sont des adaptations de laboratoire (mêlée/tir/œuf inerte), pas des reproductions complètes des jeux ou films :
pas de cycle de parasite pour l'œuf fourni, de charge spécifique, d'explosion spécialisée, de portage ou d'attaque animée.
Les statistiques, hitboxes, tailles et pivots sont des adaptations du projet, sans certification canonique.
Pas de nouveaux spawns automatiques en campagne ni extension du bestiaire de 571 profils.

## Contrôles

- Copies identiques aux 35 originaux ; dimensions 1536×1024, sauf œuf 1024×1536.
- Registre strict ; les deux Crusher, Predalien et Abomination, Stalker Capcom et Pathogen restent distincts.
- Tests physiques sur les 46 profils BIOFORGE, sauvegarde MIX, réserve ancienne conservée, images manquantes, purge.
- Scénario navigateur privé `tests/browser-user-castes-v87.mjs` : 35 sélections, PNG entier, miroir, vrais déplacements/tirs/dégâts, reload et isolation.
- Validation complète du 23 septembre : 3 108 tests, 3 107 réussis, 0 échec, 1 ignoré ; lint 525 modules.
- Navigateur privé final `run-05-compact-final` : 35 profils, 16 jalons, 0 erreur ; captures réellement inspectées en desktop et mobile.
- Preuves et captures de cette passe conservées hors publication dans `E:/CodexQA/AliensTantalus/v87-castes-20260923/`.

Ne pas publier ce document, les reçus, les tests ni les captures. La publication contient uniquement le jeu et les assets utilisés.
