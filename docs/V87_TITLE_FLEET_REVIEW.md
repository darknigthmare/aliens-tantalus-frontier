# Accueil : planète cohérente et six coques — 20 septembre 2026

## Correction et livraison

Le halo isolé venait du bitmap `vfx-03-scan-sweep` : son arc était rendu sur tout l'écran, indépendamment du disque de la planète. La scène utilise maintenant le même référentiel circulaire pour planète, atmosphère, nuages et arc. Trois cadrages (tribord, central, bâbord) varient à chaque véritable entrée, sans répétition immédiate. Un retour depuis Options conserve le cadrage. Aucun déplacement n'est tiré à chaque frame.

Six images OpenAI intégrées, chacune produite avec des références visuelles effectivement jointes : coque Conestoga/Sulaco, Nostromo, Narcissus, Cheyenne UD-4L, USM Auriga et Prometheus. Une seule coque est visible à la fois. Les anciens transport/navette/exhaust génériques ne sont plus superposés. Le registre historique V79 de 53 slots demeure intact ; ces six nouveaux livrables ne prétendent pas combler ses autres slots.

La coque Conestoga est sans nom peint. Le marquage DOM, sans HTML, suit son panneau de coque et accepte le contexte `presentation.titleScene.shipName`. Valeur par défaut TANTALUS. L'option de modèle est persistante par profil et n'altère ni la campagne ni la classe réelle du vaisseau du joueur. Les modèles de différentes époques sont des présentations visuelles sélectionnables, pas l'affirmation qu'ils coexistent dans l'histoire.

## Références et fidélité

- Sulaco : photographie de la maquette de tournage conservée par Starship Modeler, collection Mark Dickson ; silhouettes et proue à fourches comparées.
- Nostromo : photographies de la maquette originale restaurée publiées par Propstore, vue trois-quarts cible et arrière de contrôle.
- Narcissus : photographie de production publiée par The Prop Gallery, quatre nacelles et coque en coin.
- Cheyenne : photographie frontale de la grande maquette, archive Harry Harris, pylônes déployés.
- Auriga : photographie de la maquette Hunter/Gratzner publiée par Propstore.
- Prometheus : deux images finales du film publiées par MPC, pas les études Magellan ni le vaisseau Stargate.

Ces générations ont été comparées aux références pour la silhouette, le modèle, l'orientation et les principaux éléments. Elles ne constituent PAS une certification pixel pour pixel ou géométrique 1:1 de tous les détails des originaux. Les petits détails reconstruits par génération peuvent différer. Ne pas annoncer « copie conforme certifiée ».

Les six PNG natifs possèdent un vrai alpha ; aucun bord opaque ni fond blanc opaque, aucune silhouette alpha16 coupée. Des résidus RGB sous alpha nul représentent moins de 0,001 du canevas et n'ont pas été réécrits. Les sources PNG restent inchangées, sans nettoyage automatique qui pourrait altérer leur contour.

## Provenance et limites de l'outil

Génération intégrée OpenAI uniquement, aucun script API ni clé. La tentative d'édition directe du fichier Windows Sulaco a échoué sur `apply deny-read ACLs`. La coque vide a donc été générée à nouveau depuis la photo distante réellement visible, avec `num_last_images_to_include:1`. Les liens de références et prompts sont dans `references/v87-title-fleet-generation.json`. Les images finales sont copiées dans `assets/openai/ui/title/v87/orbitals` et leurs SHA-256 sont verrouillés dans le registre et les tests.

La première génération Sulaco avec lettrage n'est pas consommée par le runtime. Les anciens vaisseaux génériques sont conservés comme archives, pas détruits.

## Validation

- Tests `title-ships-v87` : six hash/dimensions, alpha, bords, panneau, migration réelle, rejet HTML, campagne inchangée.
- Tests scène/placement : un vaisseau, marquage contextuel, stabilité options, tirage par entrée, halo ancré, reduced motion.
- Suite générale finale : 3064 tests, 3063 réussis, 0 échec, 1 ignoré ; lint syntaxe/sécurité sur 521 modules.
- Navigateur privé : 27 compositions = 3 planètes × 3 cadrages × 3 formats ; six modèles supplémentaires ; rapport sous E:/CodexQA/AliensTantalus/v87-ships-halo-20260920/private/after.
- Options persistantes, rechargement, cache et déploiement : ajouter uniquement les preuves exécutées dans le compte rendu de publication, ne pas les déduire des tests unitaires.

Ce dossier est privé et exclu de GitHub public/Vercel.

## Revalidation du 23 septembre 2026

Suite complète : 3064 tests, 3063 réussis, zéro échec, un ignoré ; lint 521 modules. Tous les fichiers temporaires sont redirigés sur E car C est saturé.

Navigateur isolé : 27 compositions et six coques, zéro erreur. Options : les six choix, SULACO/TANTALUS, les vrais rechargements, le rejet HTML sans écriture et les formats 390x844 / 844x390 passent, sans débordement horizontal ni modification de campagne. Preuves privées sous E:/CodexQA/AliensTantalus/v87-release-20260923/title-options et title-compositions/after.
