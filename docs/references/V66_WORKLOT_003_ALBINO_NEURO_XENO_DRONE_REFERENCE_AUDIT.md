# V66 — audit de référence 073 Albino Neuro-Xeno Drone

## Verdict

`enemy-073-albino-neuro-xeno-drone` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée uniquement du verrou V66 relu `enemy-021-neuro-xeno-drone` (`referenceLockSha256=194bdf7e29e7ffb818a55b332e798f67a81bce8afb88d258984b9c77d313a947`). Le Neuro-Xeno Drone est lui-même une identité `PROJECT_ORIGINAL`, `NO_EXTERNAL_MODEL`, de la continuité interne Tantalus Frontier : aucun modèle officiel ou licencié ne justifie une URL externe positive. Le phénotype albinos modifie seulement les pigments et la réponse matérielle organiques; il ne remplace ni l'anatomie de Drone, ni le casque de contrôle, ni ses deux pinces temporales, ni le câble spinal. Tous les futurs pixels doivent être des créations originales fan-made/projet, sans copie, recoloration automatique ni revendication 1:1.

## Contrat exact de la queue

Le snapshot reprend exactement `profileId=enemy-073-albino-neuro-xeno-drone`, `name=Albino Neuro-Xeno Drone`, `archetype=Neuro-Xeno Drone`, `modifier=Albino`, `biology=xenomorph`, `caste=controlled`, `provenance=systemic-variant`, `animationFamily=biped`, `batchId=batch-005`, `ordinal=72`, `initialStatus=pending-reference`, `reference=null`, `referenceLockSha256=null`, le provider OpenAI, `canonExact=false`, le profil droit, la grille source 4×2, la grille atlas 4×8 en cellules 256×256 avec garde 16, le pivot `[128,240]` et les trois chemins de sortie. La queue valait `9b95a470e411104ac2fd7688687cda4613fd70eadcd9b25d69549f5413495ee5` au moment du snapshot.

| Clip | FPS | Loop | Frames | `sourcePath` | `contentHash(prompt)` de la queue |
|---|---:|:---:|---|---|---|
| `idle` | 6 | oui | 0–7 | `assets/openai/sprites/frames/v66/batch-005/enemy-073-albino-neuro-xeno-drone/idle.png` | `66ec1702b91ba2777d9f393b0f68eeabff9823d0ee6775e842251095b5be7e4e` |
| `move` | 12 | oui | 8–15 | `assets/openai/sprites/frames/v66/batch-005/enemy-073-albino-neuro-xeno-drone/move.png` | `a05ae63d6fc1fc9577bb69a6194b169ce3e1ac7b46b042f614c0203aa87d207b` |
| `attack` | 12 | non | 16–23 | `assets/openai/sprites/frames/v66/batch-005/enemy-073-albino-neuro-xeno-drone/attack.png` | `4e60437d383b7db1d875d066abfa4bf9665035877b0ce1e9f55cf13273d7d427` |
| `death` | 10 | non | 24–31 | `assets/openai/sprites/frames/v66/batch-005/enemy-073-albino-neuro-xeno-drone/death.png` | `eace49551cc663a32ccd965af9eb2e0bbef547857d4843d46e08af3d9cb7fd8e` |

Les motions, `frameCount`, indices de frames, `normalizedPath` et `previewPath` de chaque clip sont recopiés dans le JSON. Il n'existe aucun clip spécial supplémentaire pour ce profil.

## Autorité et verrou de design

La matrice V56 et le verrou V66 de base contrôlent cette identité interne : Drone noir biomécanique et eyeless sous un dispositif de contrôle compact, crâne allongé intact, deux pinces temporales, câble spinal isolé et micro-témoins ambre; aucun canon, œil bleu, corps robotique ou plaque de Ripper. `urls=[]` est volontaire : le lien GitHub historique du verrou 021 n'est pas promu en autorité canonique externe, et aucun modèle officiel Neuro-Xeno n'existe.

Le 073 conserve un long dôme lisse, une mâchoire interne, une cage thoracique étroite, exactement deux bras, deux jambes digitigrades, quatre tubes dorsaux et une queue segmentée complète à pointe de lance. Le casque reste gunmetal, ses deux pinces et son câble sombre restent lisibles, et seuls de minuscules témoins ambre sont autorisés. La matière organique devient ivoire perlé, os pâle, gris cendre et rose-taupe translucide; elle ne blanchit jamais le matériel industriel. Le profil doit rester orthographique droit et chaque pièce doit rester dans sa cellule.

Les actions sont également verrouillées : idle respiratoire ancré; locomotion avec contacts/passing/récupération; frappe de griffe ou mâchoire interne avec anticipation, contact, follow-through et récupération; mort létale jusqu'au corps immobile. Le casque et le câble restent attachés dans les 32 poses.

## Prédécesseurs locaux vérifiés

- action sheet V56 original 1254×1254 RGB : `assets/openai/sprites/enemies/neuro-xeno-drone-action-sheet-v56.png`, 1 340 787 octets, SHA-256 `2d84909648560b579b041c0693a151b588d3118b07436555b20347a41b551774`;
- action sheet V56 normalisé 1024×1024 RGBA : `assets/openai/sprites/normalized/enemies/neuro-xeno-drone-action-sheet-v56.png`, 476 241 octets, SHA-256 `237e42ca98c3be8f3dc7a58d134a8979f38207ace361ac62cb0658255aec1809`;
- sources V66 1774×887 : `idle` 1 489 521 octets, `fab5f92a4c64520bea9e159e588354e56da78d7cd05761634e01dd5f54447ce7`; `move` 1 481 782, `a8e9636175c4dd5b72ab342051fd29ffa2411e93c368fbbe4e6e1e37d062e4e1`; `attack` 1 477 600, `594dfcc2a8c94dd936cef71ce342d02a719f419d6a6e6363c0aa07a5fc234f5e`; `death` 1 312 633, `6dcd6e0a4bbe8ce5f8b2da915fe0ba5889c0edbc6a77dc83a3a3c9571dcb2406`;
- metadata V66 : 78 238 octets, SHA-256 `9801bf4a659e997e9a70513dbc86ce342bef54f2b8d7bd67ce8f00ce9d769cc9`;
- verrou de base `V66_BATCH_002_REFERENCES_C.json` : `cec2e0721890f58e54fa64015cfc7474ed6fd71743e78ad9285ea08f625bb47c`;
- audit source : `27e126ac9665deea0b2728164727205ffe1202fd982d8311dd88a421da899d5c`; revue atlas/root : `45ef0adf4a03e313d3fcfb492ab418b271ae5bc88dc3a0e774120a9283cc1e96`; revue overlays : `04b2043196aa35535178535520459cfc32347cdd0be2a1212fd49c96fb8ddd78`;
- registre roots : `31426022398546429ea8ad7defdfbf642c4fd854b3bb64270df0a725acd121e3`; revue scale : `dcab1772242b00106219b5a5d12f595e1452d74f524f3cab95b9bd9db235e115`;
- overlays root 021 : `idle` `643bee151cced633636a897a012704572b66c31f83e4482b9730051960f074b3`; `move` `9f8567bd4c1e2c8a8cdcde1c1793dffb0fd0bb218bcbee1125b66831594e5d8c`; `attack` `f95d498e35332fb5f0a5ff7428ab5e610f0068cd400aeec5029fb99a2983acea`; `death` `29f35fb5d857fada77df05d4edeb486e33fb4dc00313293899d51e7018a5c140`.

Les dix-neuf `localPaths` existent. Les deux action sheets et les quatre planches actives ont été décodées et affichées en aperçus mémoire durant cette passe; aucun octet source n'a été modifié. La base reste `pending-visual-review`, `runtimeIntegrated=false` et `canonExact=false`.

## Échelle, root et défauts non hérités

La metadata 021 rapporte un ancien pack scale commun `0.456790123` et quatre valeurs nominales à `1.0`, mais `scaleCalibrationReview=null` et `scaleCalibrationEvidence=[]`. Le fragment fixe donc `inheritSourceScaleByClip=false`. La revue complète des roots ne constitue pas une calibration d'échelle : les 32 nouvelles poses devront être mesurées indépendamment avec dôme, cage thoracique, bassin, membres proximaux et équipement neural.

Le registre contient bien une revue physique 021 complète : 32 poses, repères manuels de cage thoracique, appuis/plan du corps relus, confiance moyenne et incertitude source déclarée de 14 pixels. La méthode est réutilisable, pas les coordonnées. `inheritCoordinates=false` impose 32 nouvelles mesures 073 sur les nouveaux pixels.

L'audit source signale des contacts de frontière dans les quatre clips : `idle` aux paires 2/3 (`20` pixels droite contre `17` gauche) et 6/7 (`25` contre `22`); `move` aux paires 1/2 (`11/16`), 2/3 (`20/18`), 5/6 (`23/26`) et 6/7 (`25/21`); `attack` aux paires 2/3 (`18/18`) et 6/7 (`20/18`); `death` aux paires 2/3 (`15/14`) et 6/7 (`20/20`). Ce sont des indices d'ownership du normalizer, ni des roots ni une continuité à reproduire.

La revue atlas maintient d'autres limites : restes roses/violets aux attaches dorsales, hanche et articulations; attaque compacte à impact peu lisible; variations de hauteur du cou/crâne; raccords temporels non validés. Le verrou exige de nouvelles poses originales qui corrigent ces défauts.

## Méthode de hash des prompts

Les neuf prompts 073–074 ont été recalculés avec la convention réelle du pipeline, `contentHash(prompt) = SHA-256(JSON.stringify(prompt))`; les quatre valeurs 073 correspondent exactement. Un SHA-256 appliqué directement au texte UTF-8 brut emploie un autre contrat et peut donc différer normalement : cette différence n'est ni une anomalie, ni la preuve d'un prompt invalide. Les textes `BLOCKED` restent des snapshots de queue, pas des reçus ImageGen prêts à l'emploi; ils devront être reconstruits après fusion du `designLock`.

## Simulation de fusion et limites

`assembleReferenceRegistry` a accepté en mémoire les fragments 073 et 074 contre 71 profils et le registre global SHA-256 `7dc83ee9e72a184a78ab3270ca8897f93826523d3461bb39a5c2bd8cc8b8f203`. Le registre simulé contient 73 profils et aurait le SHA-256 `6a0cf9bdbac06c3ff1d1be7f27e5077cde60af530915dfbbe7092aca7832565f`. Les identités et contrats de clips sont exacts, les neuf `contentHash` correspondent, `urls=[]` est volontaire et tous les chemins locaux existent. Rien n'a été écrit dans le registre global.

Ce travail n'autorise aucune génération, acceptation ou intégration runtime et ne modifie ni global, ni queue, ni state, ni sprite, ni metadata, ni Git.
