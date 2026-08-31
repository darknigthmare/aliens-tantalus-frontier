# V66 lot 002 — revue C, Foundry Crusher 026

Revue : Codex finish_source_review, 2026-08-31. Statut : **candidat, non accepté**.

## Résultat livré

Cinq retouches réelles avec l'outil OpenAI ImageGen intégré, sans API et sans
redessin programmatique. Une seule est sélectionnée : `death-r4`.
La source de mort précédente est conservée sous
`assets/openai/sprites/frames/v66/batch-002/enemy-026-foundry-crusher/rejected/death-pre-r4.png`.

Les quatre autres essais restent archivés avec leurs prompts et événements :

- `death-r3` : faux damier RGB opaque au lieu de l'alpha demandé, rejeté.
- `idle-r3`, `attack-r2`, `charge-r4` : pas d'amélioration mesurée du détourage
  sur l'atlas comparatif ; sources précédentes conservées.

Aucun seuil de détourage modifié. Les options existantes de matte stricte et de
frange AA bornée à deux pixels source ont été utilisées, avec leurs preuves SHA.
Aucune nouvelle pose interpolée ou dupliquée.

## Source et ancrages

Source sélectionnée `death-r4` :
`b07698a3c6d9003f9c7ef17c5b1d315f65f812edc79cf2091dd486a2b6cd7b31`.

Génération :
`exec-c75ddba7-35cc-4d48-a6ae-953b177b9f88`.

Les 40 poses ont été réexaminées sur leurs sources et contacts anatomiques.
La cage thoracique derrière l'épaule reste le repère horizontal ; queue et crête
ne définissent pas la racine. Les huit poses de mort conservent leur queue
complète. Trois projections de sol de mort ont été ajustées d'un pixel source
(frames 0, 2 et 7, indices zéro). Incertitude manuelle : six pixels source.

Fragment livré :
`docs/references/V66_BATCH_002_ANCHORS_C.json`.

SHA du fragment :
`130daec48c43f460131e6862912ce4d886bc9716c3386bb80d92ac165e0f5c52`.

Cinq contacts finaux inspectés :
`docs/references/v66-batch-002-anchor-review-c/enemy-026-foundry-crusher/`.

Cette preuve valide l'ancrage physique, pas la fidélité canonique exacte,
la qualité artistique finale, ni une intégration runtime. Le fichier global
d'ancrage n'a pas été modifié par cet agent ; fusion confiée à l'agent principal.

## Comparaison mesurée à taille d'atlas

Normalisation isolée dans `.tmp/v66-crusher-c/mirror/` : 40 poses uniques,
aucun finding technique, contrôle de reconstruction réussi.

SHA atlas candidat :
`d821691aebac6c6282e9287404a6b370b8abbf8a4881866d1323862d25219951`.

| Clip | Indices roses, ancien atlas | Candidat avec death-r4 uniquement |
| --- | ---: | ---: |
| idle | 36 | 36 |
| move | 18 | 15 |
| attack | 32 | 42 |
| death | 31 | 21 |
| charge | 25 | 21 |
| Total | 142 | 135 |

Test diagnostique : alpha >= 128, R-G > 50, B-G > 50. Ce n'est pas un masque
autorisant une suppression automatique.

Le gain est **partiel** : 10 indices en moins sur la mort, 7 sur l'atlas entier.
L'échelle commune passe de 0.470338983 à 0.464435146, soit environ -1,26 %,
pour préserver toute la queue et les gardes. Ce changement de rasterisation
fait aussi varier les indices des clips dont la source n'a pas changé :
ne pas présenter leurs différences comme des retouches réussies.

Résidus importants du candidat : attaque poses 2/7/8 (9/8/7 indices),
charge pose 6 (8), mort poses 3/4/8 (5/6/5). Le reflet du cou de mort pose 2
est nettement réduit : 7 indices auparavant, zéro dans ce candidat.

Les quatre clips autres qu'idle conservent de courts débords de cellules
nominales ; l'extraction stricte les signale. L'option existante de réattribution
des composants prouve leur appartenance et préserve la totalité des silhouettes.
Cela ne remplace pas la revue visuelle.

## Cohérence de volume et lecture séquentielle

Aucun agrandissement ou rétrécissement arbitraire par frame n'a été appliqué.
La matière neutralisée de la mort, ses silhouettes et ses huit étapes ont été
comparées à l'ancien contact normalisé. Les poses terminales gardent les
membres repliés et la longue queue.

Mesure secondaire : surface de silhouette opaque projetée, en pixels d'atlas :

| Clip | Minimum | Maximum | Première / dernière pose |
| --- | ---: | ---: | ---: |
| idle | 6886 | 7046 | 6886 / 6901 |
| move | 6717 | 7048 | 7004 / 6832 |
| attack | 5568 | 6503 | 6503 / 5883 |
| death | 4182 | 6830 | 6830 / 4182 |
| charge | 5473 | 6747 | 5878 / 6747 |

Ces surfaces ne mesurent pas un volume anatomique 3D : rotation, repliement,
occlusion et alpha influencent le résultat. Le repos est relativement stable.
La mort diminue logiquement avec l'effondrement. L'attaque et la charge gardent
des variations plus fortes à vérifier à vitesse de jeu, notamment attaque
3→4 et charge 4→5. Leur fluidité commerciale n'est pas certifiée.

Les cinq GIF de preuve ont huit images chacun ; durées vérifiées :
idle 170 ms par pose, move/attack/charge 80 ms, death 100 ms.
Les temporisations GIF arrondissent les FPS du contrat (6/12/10) ; elles ne
remplacent pas un test du moteur. Aucune prétention de test live d'un combat.

## Preuves et limites

- JSON détaillé : `docs/references/V66_BATCH_002_ATLAS_C_REVIEW.json`.
- Comparaisons ancien/candidat et cinq GIF :
  `docs/references/v66-batch-002-atlas-review-c/enemy-026-foundry-crusher/`.
- Prompts : `docs/references/v66-batch-002-prompts/enemy-026-foundry-crusher/`.
- Événements dédiés : `docs/references/v66-batch-002-events/enemy-026-foundry-crusher/`.

Les variantes rejetées ne doivent pas être importées contre les masters actifs.
Seul l'événement `death-r4.json` correspond au remplacement choisi.
Le registre STATE, la file QUEUE, les références, le runtime et les atlas
définitifs n'ont pas été modifiés par cet agent. Reconstruction définitive et
fusion de preuves restent à l'agent principal.

Les franges roses restantes, les transitions de silhouette et l'absence de
test de rencontre à l'échelle du joueur empêchent de déclarer ce profil terminé.

