# V72 — K-Series Yellow 020 : revue physique et normalisation candidate

Date : 5 septembre 2026. Profil : `enemy-020-k-series-yellow-xenomorph`.

## Décision bornée

Les quatre sources existantes ont été inspectées en taille originale, puis les 32 poses normalisées ont été revues sur la planche de contact. Les 32 repères physiques et les 12 mesures de crâne sont documentés. Le pipeline normalise les 32 poses sans finding et `--check` passe après suppression ciblée des résidus magenta. Aucune acceptation artistique, aucun événement de production et aucune intégration runtime ne sont effectués par cette revue. L'agent principal prend la recette animée au navigateur et le contrat de combat.

Ce travail ne certifie ni une fidélité 1:1, ni une animation commerciale finale. La référence de K-Series est adaptée en vue latérale ; les proportions en mètres ne sont pas inventées.

## Observation des séquences

| Clip | Observation des sources et des poses normalisées | Limite de cette revue |
| --- | --- | --- |
| Idle | Huit poses distinctes ; respiration et faible variation de posture ; identité dorée stable. | La variation de hauteur du crâne doit être appréciée en mouvement. |
| Move | Compression, passage et extension des jambes réellement différents de l'idle ; anatomie bipède et silhouette cohérentes. | Vérifier le glissement des pieds avec la vitesse réelle de déplacement. |
| Attack r4 | Anticipation puis compression, extension d'attaque aux poses 4–5, récupération ; bras complets. | Aligner les dégâts sur les poses actives, pas sur le début de l'anticipation. |
| Death | Recul, descente sur les membres puis corps affaissé ; les dernières poses ne retournent pas à l'idle. | Clip non bouclé ; garder la dernière pose. Vérifier la transition 4→5 en lecture réelle. |

Les GIF contiennent bien huit images chacun : 170 ms par pose idle, 80 ms move/attack, 100 ms death. La quantification temporelle GIF n'est pas le contrat runtime (6/12/12/10 fps). Le ratio de différence RGBA entre dernière/première pose et un pas interne médian vaut 1,096 pour idle et 0,923 pour move. Ces nombres aident à repérer une couture, mais ne prouvent pas une fluidité artistique. Aucune interpolation ni duplication n'a été ajoutée.

## Calage et taille observée

- Cellule de l'atlas : 256×256 ; pivot cible `(128,240)` ; direction source : droite.
- Le repère x est le bassin/anneau de hanche observé, jamais le milieu de la queue ou de la boîte englobante. Le support y est vérifié pose par pose et inclut la garde d'extraction existante de trois pixels source.
- Incertitude manuelle : ±8 pixels source, ±10 sur les trois dernières poses de mort. Après agrandissement des sources, la pose death 6 a été corrigée de `(207,341)` à `(210,328)`, la 7 de `(180,336)` à `(182,330)`, la 8 de `(174,334)` à `(192,330)`. Les preuves décrivent l'anneau de hanche visible, les superpositions et les appuis ; une confiance n'a pas simplement été relevée pour satisfaire le validateur.
- Premier idle, alpha≥128 : sommet du crâne y109, dernier pixel d'appui y238, hauteur inclusive **130 px**, queue exclue. À alpha≥240, hauteur 129 px. Les huit idle mesurent 130,131,128,123,126,125,126,126 px (médiane126).
- Largeur du premier corps hors queue : environ **84±4 px**, observation manuelle incluant tête, membres et tubes dorsaux, pas une mesure canonique. Elle n'est pas une largeur de hitbox.
- Un affichage de 268×268 donne environ 136,1 px de hauteur pour le premier idle (130×268/256). Cette calibration visuelle envisagée par l'agent principal est cohérente avec son Warrior de référence. Le corps de collision envisagé 62×136 est un choix gameplay distinct ; ne pas étendre la hitbox à la queue.

Les facteurs inter-clips reposent sur trois cordes longitudinales du crâne par clip, mesurées dans les sources : idle1 ; move1,067263 ; attack1,04937 ; death1,115053. Les repères et les incertitudes sont dans les fragments JSON, les traits dans les quatre JPG. Le facteur final d'emballage commun est 0,400673304. Les extrémités d'attaque et la queue imposent ce padding ; ne pas le confondre avec une petite taille physique.

## Alpha, bornes et intégrité

Les quatre PNG sources sont inchangés, vérifiés par SHA256. La normalisation applique seulement les opérations déterministes existantes : réattribution prouvée de fragments entre cellules, retrait du fond magenta fermé et de sa frange, puis despill strict. Les dépassements source de certaines poses d'attaque sont préservés par les transferts d'appartenance documentés ; aucun membre n'est découpé pour faire réussir le test.

Le despill neutralise exactement 77 pixels de matte restants : idle8, move0, attack45, death24. Il conserve le canal alpha et ne redessine aucun membre. Après traitement, le diagnostic indépendant compte **zéro pixel magenta strict** dans les 32 poses. Seuil exact : alpha≥16, rouge>160, bleu>160, vert+35<min(rouge,bleu). Ce seuil ne signifie pas qu'une absence de toute frange colorée perceptible a été certifiée sur tous les fonds : la recette animée sombre/claire reste à l'agent principal.

Atlas final SHA256 : `9e6b65302b32fe8c7448cf4f0bd1a8ff23eefc9e9004043c556be33e8bb6d3f6`.

## Impact des registres partagés

Seul le profil020 a été fusionné dans `V66_BATCH_002_ANCHOR_REVIEW.json` et `V66_BATCH_002_SCALE_REVIEW.json`, puis renormalisé. Avant et après fusion, les vingt profils du lot002 sont de statut `generated` : aucun accepté ni intégré n'est affecté. Les intégrations du lot001 et la baseline V65 ne partagent pas ces registres.

Comme le contrat mémorise le hash du fichier complet, les 19 autres candidats ont maintenant une preuve `physicalAnchorReview.sha256` périmée :

`enemy-007-praetorian`, `enemy-008-queen`, `enemy-009-crusher`, `enemy-010-spitter`, `enemy-011-lurker`, `enemy-012-carrier`, `enemy-013-ravager`, `enemy-014-boiler`, `enemy-015-prowler`, `enemy-016-burster`, `enemy-017-monica-line`, `enemy-018-specimen-six-line`, `enemy-019-red-xenomorph`, `enemy-021-neuro-xeno-drone`, `enemy-022-xenoborg`, `enemy-023-atarax-ripper`, `enemy-024-ripper-queen`, `enemy-025-foundry-drone`, `enemy-026-foundry-crusher`.

Spitter010 et Lurker011 ont également `postGenerationScaleReview.sha256` périmé. Vérification réelle sur007 : `--check` échoue avec `Physical source-anchor review changed since normalization.` Aucun de ces 19 atlas n'est modifié ou présenté comme encore validé par cette livraison. Il faut les renormaliser et recontrôler avant une future promotion ; ne pas simplement réécrire leurs hashes.

## Fichiers et reproduction

Livraison020 : deux fragments JSON, quatre JPG de preuve, `render-review.py`, `audit-normalized.py`, `normalization-diagnostics.json`, ce rapport ; les deux registres partagés ; l'atlas020, sa metadata, ses quatre WebP de clips, ses cinq GIF ; le JPG/JSON de contact020 sous `v66-batch-002-atlas-review`. La liste exacte des chemins et des SHA256 est dans `normalization-diagnostics.json`. Les sources y sont incluses comme preuves inchangées, pas comme modifications.

Commandes réellement exécutées après fusion :

```text
py -3 scripts/process-v66-enemy-batch.py --profile enemy-020-k-series-yellow-xenomorph --safe-reassign-cell-fragments --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe --remove-magenta-spill
py -3 scripts/process-v66-enemy-batch.py --profile enemy-020-k-series-yellow-xenomorph --check
py -3 scripts/render-v66-batch-atlas-review.py --batch batch-002 --profile enemy-020-k-series-yellow-xenomorph
py -3 docs/references/v72-k-series-020-review/audit-normalized.py
```

Critère de sortie de cette sous-tâche : sources intactes, preuves physiques traçables, normalisation reproductible, zéro matte stricte, taille mesurée et risques explicités. Gates restant hors de cette sous-tâche : animation live, dégâts/facing en jeu, absence de clipping pendant le déplacement, acceptation artistique explicite et intégration runtime autorisée.

Régressions exécutées : `node --test tests/enemy-batch-anchor-merge-v66.test.mjs tests/enemy-batch-scale-review-v66.test.mjs tests/merge-v66-scale-reviews.test.mjs` : 79 tests, 78 réussites, 1 skip lié aux symlinks non autorisés par l'hôte, 0 échec. Ce résultat ne remplace pas la revalidation des 19 autres candidats dont les preuves sont périmées.
