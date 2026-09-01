# V66 — audit de référence 071 Albino Red Xenomorph

## Verdict

`enemy-071-albino-red-xenomorph` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée uniquement du verrou V66 relu `enemy-019-red-xenomorph` (`referenceLockSha256=513bb94c5a4f9946e88a3f4d893fb7a85de1dc78ebee15865722b8d046e4a383`). « Red » reste la lignée de la ruche rivale de *Aliens: Genocide*; le modificateur albinos remplace le manteau vermillon par une matière ivoire/os, sans transformer l'anatomie. Il n'existe aucun modèle officiel « Albino Red Xenomorph ». Tous les futurs pixels doivent être des créations originales fan-made/projet, sans copie, recoloration automatique ni revendication 1:1.

## Contrat exact de la queue

Le snapshot reprend exactement `profileId=enemy-071-albino-red-xenomorph`, `name=Albino Red Xenomorph`, `archetype=Red Xenomorph`, `modifier=Albino`, `biology=xenomorph`, `caste=rival-hive`, `provenance=systemic-variant`, `animationFamily=biped`, `batchId=batch-005`, `ordinal=70`, `initialStatus=pending-reference`, `reference=null`, `referenceLockSha256=null`, le provider OpenAI, `canonExact=false`, le profil droit, la grille source 4×2, la grille atlas 4×8 en cellules 256×256 avec garde 16, le pivot `[128,240]` et les trois chemins de sortie. La queue valait `040703de24f6dddac25d9f6658f3f147bd449b0c976b9f3eec533daf8beb31b2` au moment du snapshot.

| Clip | FPS | Loop | Frames | `sourcePath` | `contentHash(prompt)` de la queue |
|---|---:|:---:|---|---|---|
| `idle` | 6 | oui | 0–7 | `assets/openai/sprites/frames/v66/batch-005/enemy-071-albino-red-xenomorph/idle.png` | `a235f9b10f6f568c24467326665efb05afe31e21748b9e861e9a9ec83e5412d0` |
| `move` | 12 | oui | 8–15 | `assets/openai/sprites/frames/v66/batch-005/enemy-071-albino-red-xenomorph/move.png` | `e173a3ab3fb99f54aac45351d88268d0fb730f164c8d7bfd9aef2f693490ac51` |
| `attack` | 12 | non | 16–23 | `assets/openai/sprites/frames/v66/batch-005/enemy-071-albino-red-xenomorph/attack.png` | `9ca325f5ef301f37e27f4d4643d679ba09dda8664a0e23284fb8d1e1fa2a2d1c` |
| `death` | 10 | non | 24–31 | `assets/openai/sprites/frames/v66/batch-005/enemy-071-albino-red-xenomorph/death.png` | `56fab2ea06a7ff07406926c6af3903cf0f039ee4d5395865c818afe0980fe37d` |

Les motions, `frameCount`, indices de frames, `normalizedPath` et `previewPath` de chaque clip sont recopiés dans le JSON. Il n'existe aucun clip spécial supplémentaire pour ce profil.

## Autorité et verrou de design

- [NECA — Aliens Series 5](https://store.necaonline.com/blogs/behind-the-scenes/closer-look-aliens-series-5-action-figures) est une source officielle de fabricant licencié et identifie les Warriors noirs et rouges de *Aliens: Genocide*. Elle ne prouve ni un albinos, ni un turnaround de profil, ni les proportions du projet.
- Le master local licencié a été relu visuellement en mémoire: il montre plusieurs Red Warriors et leurs adversaires dans une composition de bataille. Le verrou conserve seulement la lignée et l'anatomie Warrior; il interdit de copier la composition, les poses ou les pixels.
- Le 071 reste un adulte bipedal long et maigre: dôme aveugle ridgé, double mâchoire, cage thoracique étroite, deux bras, deux jambes digitigrades, quatre tubes dorsaux et une seule longue queue segmentée à pointe de lance.
- L'albinos est une matière nouvellement dessinée: ivoire perlé, os pâle, creux gris cendre, tissus rose-taupe discrets et dents ivoire/argent. Le rouge saturé n'est pas maintenu comme manteau; « Red » demeure l'identité de lignée.

Les fan-wikis, sites de référence de fans et agrégateurs d'images sont exclus comme autorité positive. Le lock interdit aussi Red King, couronne royale, Prowler quadrupède, K-Series jaune, équipement et anatomie supplémentaire.

## Prédécesseurs locaux vérifiés

- master licencié 1200×800: `assets/openai/sprites/reference-masters/v66/batch-002/enemy-019-red-xenomorph/genocide-comic.webp`, 321 638 octets, SHA-256 `8450dc08cfca128171789c3ab607bb897850021f116228ec84c0f572b525905b`;
- sources V66 1774×887: `idle` 1 666 276 octets, `66e0989f10785e6e850708f91cc33102fe95e390c6c3b60d6090b2a7aa70ce0f`; `move` 1 555 034, `915b22fa094871212142fd13fef1cf1306aeaf5600d07d47f3e7f9a9dcab71d0`; `attack` 1 462 177, `9bbcb93d5fb5679b5d59fc1cd4bbd6d6d55dc433a9e70f0c437853ad21d932e6`; `death` 1 378 930, `90a4f356fb657e3758f9b8fbb6ec6fba7575d6ee1f1e89a8cc3f013c12bd7bf3`;
- metadata V66: 54 868 octets, SHA-256 `815ad3b038ecf82a1d78dcf65a6b52521f17b5e3600a7f5e2f7e66ed583fb612`;
- verrou de base `V66_BATCH_002_REFERENCES_E.json`: `26ba7120ced1f957405eebd9c078d148b8e16cf29e693193b1763c55bcae3553`;
- audit source: `27e126ac9665deea0b2728164727205ffe1202fd982d8311dd88a421da899d5c`; revue atlas: `1c29578be3ca6685dab39145e3ae2be5f399280d26f8c242221618994e08cd2c`;
- revue roots: `31426022398546429ea8ad7defdfbf642c4fd854b3bb64270df0a725acd121e3`; revue scale: `dcab1772242b00106219b5a5d12f595e1452d74f524f3cab95b9bd9db235e115`.

Les treize `localPaths` existent. Le master et les quatre planches actives ont été décodés et affichés en aperçus mémoire durant cette passe; aucun octet source n'a été modifié. La base reste `pending-visual-review`, `runtimeIntegrated=false`, et la matrice V56 ne possède pas de ligne dédiée Red Xenomorph.

## Échelle, root et défauts non hérités

La metadata de base rapporte un ancien pack scale `0.653061224` et quatre valeurs nominales à `1.0`, mais `scaleCalibrationReview=null` et `scaleCalibrationEvidence=[]`. Le fragment fixe donc `inheritSourceScaleByClip=false`: aucun scale numérique de la base n'est promu. Une calibration mesurée indépendante sur les 32 nouvelles poses devra utiliser dôme, cage thoracique, bassin et membres proximaux.

Le registre de roots relu ne contient aucune entrée 019. Les placements de base sont encore `pending-body-root-review` et utilisent `legacy-bounds-center-bottom`; aucune coordonnée n'est transférée. Le 071 devra relier un repère bassin/bas de cage au véritable pied porteur ou au plan du corps après chute.

L'audit source signale des indices heuristiques de contact de frontière dans `move` aux frames zéro-based 1–3: 96 pixels droite de 1 face à 101 pixels gauche de 2, puis 17 pixels droite de 2 face à 18 pixels gauche de 3. Ce ne sont ni des roots acceptés ni une continuité artistique certifiée. La nouvelle planche doit les éliminer. La revue atlas signale en outre une marche faible et peu de transfert de poids dans l'anticipation/attaque de la base.

## Méthode de hash des prompts

Les huit prompts 071–072 ont été recalculés avec la convention réelle du pipeline, `contentHash(prompt) = SHA-256(JSON.stringify(prompt))`; les quatre valeurs 071 correspondent exactement. Un SHA-256 appliqué directement au texte UTF-8 brut emploie un autre contrat et peut donc différer normalement: cette différence n'est ni une anomalie, ni la preuve d'un prompt invalide. Les textes `BLOCKED` restent des snapshots de queue, pas des reçus ImageGen prêts à l'emploi; ils devront être reconstruits après fusion du `designLock`.

## Simulation de fusion et limites

`assembleReferenceRegistry` a accepté en mémoire les fragments 071 et 072 contre 69 profils et le registre global SHA-256 `9a504bb292b027456ed542595265c0a094dcc934b74bdabb5adbcfc2988d482d`. Le registre simulé contient 71 profils et aurait le SHA-256 `7dc83ee9e72a184a78ab3270ca8897f93826523d3461bb39a5c2bd8cc8b8f203`. Les identités et contrats de clips sont exacts, les huit `contentHash` correspondent, l'URL est HTTPS et tous les chemins locaux existent. Rien n'a été écrit dans le registre global.

Une intégration parent concurrente de 069–070 explique le passage observé de la queue `c07fb6b8…` à `040703de…` et du registre `396d11c9…` à `9a504bb2…`; les seconds hashes sont ceux du snapshot et de la simulation. Ce drift attendu n'est pas attribué à ce fragment. Ce travail n'autorise aucune génération, acceptation ou intégration runtime et n'a modifié ni global, ni queue, ni state, ni sprite, ni metadata, ni Git.
