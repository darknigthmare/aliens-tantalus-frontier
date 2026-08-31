# V66 batch-002 — application du calibrage010/011 : audit indépendant

Date :2026-08-31. Relecteur :Codex complete_royal.
Périmètre :atlas candidats Spitter010 et Lurker011 ; **aucune acceptation artistique ou intégration runtime**.

## Résultat constaté

Le recalibrage est maintenant appliqué aux deux atlas. Le rétrécissement crânien interclips ciblé est corrigé : l'écart maximal entre une médiane corrigée et la médiane idle vaut **0,309 %** dans les pixels de l'atlas. Cela mesure l'exécution du facteur proposé ; ce n'est ni une certification anatomique1:1, ni une validation de fluidité.

Le contrôle indépendant `scripts/audit-v66-batch002-scale-application.py --phase after` réussit. Les **133 fichiers protégés** sont identiques octet pour octet au relevé avant :

- Cinq atlas du batch001 et leurs cinq métadonnées.
- Les87 planches sources originales du batch002.
- Les18 autres atlas du batch002 et leurs18 métadonnées.

Aucun original, fichier de production global, atlas ni métadonnée n'a été écrit par cet audit. Seuls son script, ses rapports et les images diagnostiques ont été produits. La reconstruction des deux atlas a été effectuée séparément par le parent après autorisation utilisateur.

## Mesure réelle dans les atlas

Les17 mesures source existantes sont conservées : trois crânes par clip du Lurker, trois idle et deux death du Spitter. Leurs extrémités sont projetées par les ratios exacts `renderedBounds/sourceSize`, ce qui tient compte des dimensions de redimensionnement arrondies au pixel. Les points restent dans le repère de chaque cellule256px et les coordonnées globales d'atlas sont également enregistrées.

Les vues annotées contiennent les pixels effectivement décodés des atlas, avec segment crânien superposé. Les34 extrémités du relevé avant ont chacune des pixels opaques dans leur voisinage de2px. Les annotations avant/après ont toutes été relues visuellement. L'incertitude manuelle de4px source reste indiquée dans la preuve ; les faibles écarts numériques ci-dessous ne signifient pas que cette incertitude anatomique a disparu.

| Profil / clip | Facteur source appliqué | Crâne médian avant (px atlas) | Après (px atlas) | Avant / idle | Après / idle |
| --- | ---: | ---: | ---: | ---: | ---: |
| Spitter idle |1 |62,305 |62,305 |100 % |100 % |
| Spitter death |1,615297 |38,583 |62,419 |61,93 % |100,18 % |
| Lurker idle |1 |68,601 |49,899 |100 % |100 % |
| Lurker move |1,062929 |64,450 |49,745 |93,95 % |99,69 % |
| Lurker attack |1,858278 |36,895 |49,859 |53,78 % |99,92 % |
| Lurker death |1,822337 |37,501 |49,803 |54,67 % |99,81 % |

Le Spitter move/attack reste à facteur1 : ces clips n'ont pas été calibrés par cette mesure, du fait d'attitudes crâniennes différentes. Aucune égalité de taille n'est revendiquée pour eux.

Les hashes des cellules RGBA décodées prouvent un changement réel de pixels dans **14 des17 cellules mesurées** : les deux cellules de mort Spitter, et les12 cellules Lurker. Les trois cellules idle Spitter échantillonnées sont strictement inchangées. Un simple changement des octets du fichier WebP n'est pas utilisé comme preuve de modification des pixels.

## Échelle globale : effet important à conserver dans le bilan

| Profil | Échelle globale avant | Après | Conséquence |
| --- | ---: | ---: | --- |
| Spitter |0,513761468 |0,513761468 |Échelle globale inchangée ; seules les poses death sont agrandies par leur facteur source. |
| Lurker |0,458677686 |0,333702348 |Échelle globale réduite de27,2469 % pour garder les extensions complètes dans les cellules gardées. |

Le Lurker idle passe ainsi de68,601 à49,899px de longueur crânienne médiane dans l'atlas. Ses animations sont cohérentes entre elles sur le repère mesuré, mais **la taille générale de l'atlas n'est pas conservée**. La future intégration doit revoir son échelle dans le monde à côté du joueur, des portes et des autres ennemis ; ce contrôle n'a changé aucun réglage runtime.

## Revue visuelle des64 poses complètes

Les deux contacts complets de32 poses ont été inspectés après reconstruction, en plus des17 annotations crâniennes.

- Spitter : la mort ne présente plus le rétrécissement massif mesuré à son entrée. Les huit poses de mort et leurs queues restent entières dans leurs cellules. Les ancrages physiques sont encore en attente ; les traces fuchsia dans les ombres/corps couchés et les différences de rendu entre clips restent visibles.
- Lurker : la différence d'échelle entre locomotion, attaque et mort est nettement réduite. Les32 appuis restent associés au bassin mesuré ; aucune coupe de queue, main ou tête au bord n'est observée. Le mouvement contient encore la zone fuchsia sous la hanche, notamment move1 ; le recalibrage ne l'efface pas.
- Les crânes gardent une variation entre poses à l'intérieur d'un même clip. Les médianes proches ne prouvent pas une invariance parfaite de silhouette.
- L'attaque basse du Lurker ne devient pas un bond aérien par simple recalibrage. Les transitions, la vitesse de déplacement, les collisions, la lisibilité sur décors et la fidélité finale nécessitent toujours une revue en jeu.

Les deux métadonnées restent `acceptanceStatus=pending-visual-review`, `runtimeIntegrated=false`, `canonExact=false`.

## Provenance du calibrage actif

Le calibrage est relié au champ **`postGenerationScaleReview`**, distinct de l'ancien `scaleCalibrationReview` demeuré vide. Cette séparation évite de réécrire le verrou de dessin de la référence.

- Revue active : `docs/references/V66_BATCH_002_SCALE_REVIEW.json`.
- SHA256 actif vérifié : `dcab1772242b00106219b5a5d12f595e1452d74f524f3cab95b9bd9db235e115`.
- Les facteurs, les huit SHA source et les hashes des six vues de mesure correspondent à la preuve active.
- Atlas010 final : `d199e6cc8d4e69636d022e957f2d87ff246b1e754eb365bde9bd5d5ba264a938`.
- Atlas011 final : `3377ebb3c84617a44d0d9b91c2990ece2d200ae70d8671d22ef6ff5591858a39`.

La comparaison des mesures entre phases utilise `sourceMeasurementsCanonicalSha256` : contenu JSON analysé des mesures et SHA source, indépendant de la présentation du document. Le champ `measurementDocumentSha256` du relevé avant est une **empreinte brute historique de la copie Windows**, potentiellement CRLF/mixte ; il ne doit pas être confondu avec le hash du blob Git normalisé en LF. Le relevé avant a été conservé sans réécriture. Les nouveaux rapports sont écrits explicitement en LF.

## Preuves et contacts

- [Rapport avant](V66_BATCH_002_SCALE_APPLICATION_BEFORE.json) :figé avant reconstruction.
- [Rapport après](V66_BATCH_002_SCALE_APPLICATION_AFTER.json) :mesures, pixels, facteurs, provenance et non-régression.
- [Spitter avant annoté](v66-batch-002-scale-application/enemy-010-spitter-before.jpg) / [après annoté](v66-batch-002-scale-application/enemy-010-spitter-after.jpg).
- [Lurker avant annoté](v66-batch-002-scale-application/enemy-011-lurker-before.jpg) / [après annoté](v66-batch-002-scale-application/enemy-011-lurker-after.jpg).
- [Spitter32 poses complètes](v66-batch-002-atlas-review/enemy-010-spitter.jpg), SHA256 `e6a594fc204e53521f748c332a80ebda322094ee9ed0aebfe40db7a7f3945ede`.
- [Lurker32 poses complètes](v66-batch-002-atlas-review/enemy-011-lurker.jpg), SHA256 `f9eb9e94be1778b367a47c6d8715da32f25e1931328bccf815d0c09a2df5968a`.

Ces éléments remplacent, pour l'application des facteurs010/011 seulement, le constat historique «calibrage non appliqué» de la passe précédente. Les autres réserves de cette passe restent valables.
