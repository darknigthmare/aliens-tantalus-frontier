# Références et limites — Aliens V119

## Lit du laboratoire médical

[Photographie de tournage, galerie tirée de *Aliens: The Set Photography*](https://www.theguardian.com/film/gallery/2016/aug/09/behind-the-scenes-james-cameron-aliens-in-pictures), crédit Twentieth Century Fox Film Corporation.

La photographie a été consultée visuellement le 26 novembre 2026. Le lit visible fournit la structure tubulaire claire, les petits rouleaux, le matelas et le vide sous le cadre. La génération retire les personnes et le matériel du tournage, adopte la projection frontale élevée du jeu et neutralise la lumière orange. Les parties cachées sont reconstruites ; aucune dimension réelle n’a été mesurée sur le plateau. La fidélité de silhouette reste à revoir sur d’autres angles du film.

## Contexte visuel du Medlab

[Propstore — Hand-Drawn Ron Cobb Medlab Concept Sketch](https://propstore.com/product/aliens-1986/hand-drawn-ron-cobb-medlab-concept-sketch/).

La fiche identifie un concept de production du Medlab. Son image a été inspectée pour le contexte industriel médical et les matériaux ; elle ne définit pas les six géométries de ce lot et n’est pas utilisée comme preuve de leur présence exacte dans le film terminé. Le concept et la photographie de tournage jouent donc des rôles distincts.

[Propstore — Stills of the Hadley’s Hope Colony Interior](https://propstore.com/product/aliens-1986/stills-of-the-hadleys-hope-colony-interior/).

La fiche décrit un ensemble de photographies de décor. Elle constitue une piste documentaire pour les prochaines vérifications ; la totalité des photographies n’a pas été examinée, donc aucune conformité de mobilier n’en est déduite.

## Référence de style et définition des placements

- `assets/dlc/aliens-1986/v115/architecture/operations-console.png` : matières, palette, usure et éclairage du raster déjà publié. Cette image du projet n’est pas une source primaire de tournage.
- `modules/aliens-1986/v114/src/validation-scenes.mjs` : définitions des lits et du rangement du Medlab, reprises par l’export cumulatif V114.
- `modules/aliens-1986/v114/src/operation-scenes-v107.mjs` : table et rack Operations.
- `modules/aliens-1986/v114/src/operation-scenes-v109.mjs` : casier de réserve.
- `modules/aliens-1986/v114/src/operation-scenes-v114.mjs` : table, repas et couteau du mess ; export cumulatif des scènes.
- `modules/aliens-1986/v114/preview/renderer.mjs` : projection `z × 0,86`, tri des solides et accessoires, occlusion.

Les références locales exactes, leurs empreintes et les prompts complets sont conservés dans le journal de génération. Les rangements et les deux tables restent des **adaptations du projet** tant qu’aucun relevé visuel de l’accessoire précis n’est rattaché à leur fiche. `filmFidelityValidated` reste `false` pour les six images.
