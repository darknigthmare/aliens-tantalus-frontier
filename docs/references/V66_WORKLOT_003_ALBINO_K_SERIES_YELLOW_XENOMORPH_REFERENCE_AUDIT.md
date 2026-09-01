# V66 — audit de référence 072 Albino K-Series Yellow Xenomorph

## Verdict

`enemy-072-albino-k-series-yellow-xenomorph` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée uniquement du verrou V66 relu `enemy-020-k-series-yellow-xenomorph` (`referenceLockSha256=bfe4dd64ba85bd5e61d2d789df2852f395e1aaea494cd8a3861b74ec510d52c9`). « K-Series Yellow » reste l'identité du Warrior commun de la faction d'*AVP: Extinction*; le modificateur albinos retire le manteau jaune saturé sans modifier l'anatomie. Il n'existe aucun modèle officiel « Albino K-Series Yellow Xenomorph ». Tous les futurs pixels doivent être des créations originales fan-made/projet, sans copie, recoloration automatique ni revendication 1:1.

## Contrat exact de la queue

Le snapshot reprend exactement `profileId=enemy-072-albino-k-series-yellow-xenomorph`, `name=Albino K-Series Yellow Xenomorph`, `archetype=K-Series Yellow Xenomorph`, `modifier=Albino`, `biology=xenomorph`, `caste=rival-hive`, `provenance=systemic-variant`, `animationFamily=biped`, `batchId=batch-005`, `ordinal=71`, `initialStatus=pending-reference`, `reference=null`, `referenceLockSha256=null`, le provider OpenAI, `canonExact=false`, le profil droit, la grille source 4×2, la grille atlas 4×8 en cellules 256×256 avec garde 16, le pivot `[128,240]` et les trois chemins de sortie. La queue valait `040703de24f6dddac25d9f6658f3f147bd449b0c976b9f3eec533daf8beb31b2` au moment du snapshot.

| Clip | FPS | Loop | Frames | `sourcePath` | `contentHash(prompt)` de la queue |
|---|---:|:---:|---|---|---|
| `idle` | 6 | oui | 0–7 | `assets/openai/sprites/frames/v66/batch-005/enemy-072-albino-k-series-yellow-xenomorph/idle.png` | `f196a1deaa6c4adc5ae4299a2ad629cc09377cacd6c1fe314387077fd580451a` |
| `move` | 12 | oui | 8–15 | `assets/openai/sprites/frames/v66/batch-005/enemy-072-albino-k-series-yellow-xenomorph/move.png` | `3a9326eab501788178b67b1c1aefc7f630e43a848598d64c717292627d7c4a9c` |
| `attack` | 12 | non | 16–23 | `assets/openai/sprites/frames/v66/batch-005/enemy-072-albino-k-series-yellow-xenomorph/attack.png` | `980382cffc69432ce2e95567656fa3ccf18e3b7d0efc018ed71a234e3860c81e` |
| `death` | 10 | non | 24–31 | `assets/openai/sprites/frames/v66/batch-005/enemy-072-albino-k-series-yellow-xenomorph/death.png` | `b3be44bc0211e12096ab3b06cff80ec256eea3791e93c939d65117122a6c2175` |

Les motions, `frameCount`, indices de frames, `normalizedPath` et `previewPath` de chaque clip sont recopiés dans le JSON. Il n'existe aucun clip spécial supplémentaire pour ce profil.

## Autorité et verrou de design

Le master local licencié a été relu visuellement en mémoire. C'est une image multi-sujets d'*AVP: Extinction*: le verrou sélectionne uniquement le Warrior commun jaune au premier plan gauche, jamais la Queen en arrière-plan ni l'Alien noir au premier plan. Aucun turnaround de mesh complet n'est disponible. Aucun site officiel ou de licencié actuellement accessible ne fournit de page anatomique dédiée à l'unité K-Series; `urls=[]` est donc volontaire. Les anciennes pages de fans du verrou de base ne sont pas promues comme autorité dans ce dérivé.

Le 072 conserve une coque crânienne aveugle longue et ridgée à quille centrale, une cage thoracique étroite, deux bras maigres, deux jambes digitigrades puissantes, quatre tubes dorsaux et une seule queue segmentée à large lame crochue. La nouvelle matière utilise ivoire perlé, os parchemin, accents paille très désaturés, creux gris-olive et tissus rose-taupe. Elle interdit manteau jaune vif, filtre blanc, Queen, Alien noir, Red caste, équipement robotique, argent métallique, défenses ou cystes.

## Prédécesseurs locaux vérifiés

- master de jeu licencié 1200×800: `assets/openai/sprites/reference-masters/v66/batch-002/enemy-020-k-series-yellow-xenomorph/k-series-game.webp`, 104 032 octets, SHA-256 `763acbf87add41f4d9f73be4cb71920ee5b54409fedf7afa734ada6cc7920e96`;
- sources V66 1774×887: `idle` 1 724 049 octets, `83eef5901c0be909927f46243ff2458ae35b74c76731a5f7de4414fd933438ab`; `move` 1 685 903, `f69d357baeda430e6b8214f2cd69cc9b5de15d60f8473d99c5738f45ed72abcc`; `attack` 1 565 269, `d6e5a210f54637b7f26c43d451ad4788552655daa03268e561adebd627a57e98`; `death` 1 489 186, `a2c7dc6a1d91fa5f40818d266bc3c41446091cb1991efb7391e9ed5c3cb5bb15`;
- metadata V66: 55 639 octets, SHA-256 `d6dd5f0cc662c5f2db059fcdf11b40f6032a7bd48438c2a4f1f4044b6488f43a`;
- verrou de base `V66_BATCH_002_REFERENCES_B.json`: `835bdf131f01901cf81301e90e5c9da7ebc33c05fb23cf948561fedaad902eb1`;
- audit source: `27e126ac9665deea0b2728164727205ffe1202fd982d8311dd88a421da899d5c`; revue variantes: `c6230f2dc71de569911cb3f01b2679c0c7ceafe2b12c116661bd5275b0242ef1`; revue atlas: `1c29578be3ca6685dab39145e3ae2be5f399280d26f8c242221618994e08cd2c`;
- revue roots: `31426022398546429ea8ad7defdfbf642c4fd854b3bb64270df0a725acd121e3`; revue scale: `dcab1772242b00106219b5a5d12f595e1452d74f524f3cab95b9bd9db235e115`.

Les quatorze `localPaths` existent. Le master et les quatre planches actives ont été décodés et affichés en aperçus mémoire durant cette passe; aucun octet source n'a été modifié. La base reste `pending-visual-review`, `runtimeIntegrated=false`, et la matrice V56 ne possède pas de ligne dédiée K-Series.

## Échelle, root et défauts non hérités

La metadata de base rapporte un ancien pack scale commun `0.532066508` et quatre valeurs nominales à `1.0`, mais `scaleCalibrationReview=null` et `scaleCalibrationEvidence=[]`. Le fragment fixe donc `inheritSourceScaleByClip=false`: aucun scale numérique de la base n'est promu. Une calibration mesurée indépendante sur les 32 nouvelles poses devra utiliser coque, cage thoracique, bassin et membres proximaux.

Le registre de roots relu ne contient aucune entrée 020. Les placements de base sont encore `pending-body-root-review` et utilisent `legacy-bounds-center-bottom`; aucune coordonnée n'est transférée. Le 072 devra relier un repère bassin/bas de cage au véritable pied porteur ou au plan du corps après chute, sans prendre la grande lame caudale comme root.

L'audit source signale des indices heuristiques de contact de frontière dans `attack` aux frames zéro-based 2–7: paires 2/3 (`90` pixels droite contre `85` gauche), 4/5 (`30` contre `31`) et 6/7 (`85` contre `95`). La revue atlas documente également de petits restes fuchsia aux repères `attack/3` et `death/7`. Ces indices ne sont ni des roots acceptés ni une continuité artistique certifiée; les nouvelles planches doivent les éliminer. `attack-r4` apporte une meilleure flexion, anticipation, fente et récupération, mais son emprise n'autorise qu'un futur scale commun mesuré, jamais une échelle par pose.

## Méthode de hash des prompts

Les huit prompts 071–072 ont été recalculés avec la convention réelle du pipeline, `contentHash(prompt) = SHA-256(JSON.stringify(prompt))`; les quatre valeurs 072 correspondent exactement. Un SHA-256 appliqué directement au texte UTF-8 brut emploie un autre contrat et peut donc différer normalement: cette différence n'est ni une anomalie, ni la preuve d'un prompt invalide. Les textes `BLOCKED` restent des snapshots de queue, pas des reçus ImageGen prêts à l'emploi; ils devront être reconstruits après fusion du `designLock`.

## Simulation de fusion et limites

`assembleReferenceRegistry` a accepté en mémoire les fragments 071 et 072 contre 69 profils et le registre global SHA-256 `9a504bb292b027456ed542595265c0a094dcc934b74bdabb5adbcfc2988d482d`. Le registre simulé contient 71 profils et aurait le SHA-256 `7dc83ee9e72a184a78ab3270ca8897f93826523d3461bb39a5c2bd8cc8b8f203`. Les identités et contrats de clips sont exacts, les huit `contentHash` correspondent, `urls=[]` ne contient aucune source non HTTPS et tous les chemins locaux existent. Rien n'a été écrit dans le registre global.

Une intégration parent concurrente de 069–070 explique le passage observé de la queue `c07fb6b8…` à `040703de…` et du registre `396d11c9…` à `9a504bb2…`; les seconds hashes sont ceux du snapshot et de la simulation. Ce drift attendu n'est pas attribué à ce fragment. Ce travail n'autorise aucune génération, acceptation ou intégration runtime et n'a modifié ni global, ni queue, ni state, ni sprite, ni metadata, ni Git.
