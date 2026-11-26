# Fleuve de la Douleur — bible détaillée

[Ouvrir la bible HTML](BIBLE_FLEUVE_DOULEUR.html) pour rechercher une identité, une salle, un équipement ou un manque, filtrer les huit domaines et consulter les placements.

- [Version Markdown](BIBLE_FLEUVE_DOULEUR.md) : fiches détaillées et tableaux.
- [Données JSON](BIBLE_FLEUVE_DOULEUR.json) : identifiants, états, coordonnées, sources et métadonnées.
- [Notes éditoriales](EDITORIAL_NOTES.json) : compléments sourcés et distinctions de continuité.

La bible couvre le modèle récupéré de **River of Pain** et les manquants identifiés dans les références consultées : **278 fiches**, **78 PNG**, **547 placements de props**, **118 détails de phase**, **128 portails / 64 connexions**. Les 83 fiches avec PNG peuvent partager une même image ; elles ne constituent pas 83 images distinctes.

La récupération spatiale est datée du **16 mai 2179**. Moore reste au poste de pilotage, séparé du groupe qui descend. Le **pistolet-grappin de la navette** et les **bras de capture de la baie** sont deux éléments distincts. La **Terre vue depuis Gateway** est un cadre orbital documentaire, séparé de **LV-426, lune de Hadley’s Hope**.

Les scènes spatiales et Gateway ne sont pas connectées à la colonie par une porte. Les dimensions du modèle sont des choix du projet, pas des mesures officielles. L’exhaustivité du roman intégral et la fidélité exacte de chaque visuel ne sont pas certifiées.

## Reconstruction

Depuis la racine du dépôt :

```sh
node scripts/build-river-of-pain-bible.mjs
```

Le générateur relit le modèle, les notes, le manifeste et les PNG présents. Il vérifie les identifiants, sources, couvertures de placement, signatures PNG et SHA-256, puis reconstruit JSON, Markdown et HTML.

Les documents, d’abord préservés par une reconstruction distante lors de l’interruption, ont ensuite été régénérés localement depuis les 78 PNG réels. Leurs signatures, SHA-256, tailles et dimensions ont été relus et vérifiés. Aucun asset ne conserve de dimension globale ou de taille inconnue dans cette édition. Cette vérification des fichiers reste distincte d’une validation artistique ou d’un parcours en jeu.

## Validation et distribution

Définition, PNG présent, intégration sélective et validation en jeu restent distincts. Un élément listé ne devient pas jouable par cette documentation.

Ces six fichiers (le générateur et les cinq fichiers de ce dossier) sont des sources de production, à admettre précisément et à exclure du build public. Les archives v0.9, sauvegardes, dialogues et collisions ne sont pas réécrits.

Le HTML utilise une pagination de 20 fiches et des images chargées à la demande. La recette locale dans Chromium 143 a validé neuf contrôles : compte des fiches, navigation entre pages, recherche par nom, filtres par domaine et disponibilité du PNG, décodage des images, absence de débordement horizontal sur mobile et ouverture des détails de placement. Les captures ont été relues en 1280 × 900 et 390 × 844 ; aucune erreur JavaScript n’a été relevée. Cette recette porte sur la consultation de la bible ; la validation artistique et le parcours en jeu conservent leurs états propres.
