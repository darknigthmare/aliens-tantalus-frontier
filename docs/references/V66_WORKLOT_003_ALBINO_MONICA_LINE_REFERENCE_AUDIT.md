# V66 — audit de référence 069 Albino Monica Line

## Verdict

`enemy-069-albino-monica-line` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée uniquement du verrou V66 relu `enemy-017-monica-line` (`referenceLockSha256=44dccf52a658e993b51538b893b1eecaa312493d1201f9fcf75dcf7d4d481e3e`). Monica/Three est un individu, pas une caste publiée. Le profil 069 conserve donc le plan corporel et le langage Pathogen relus sans copier l'individu, ses marques ou des pixels officiels. Aucun modèle officiel « Albino Monica Line » n'a été établi; la matière albinos est une création originale Tantalus Frontier, jamais une fidélité 1:1.

## Contrat exact de la queue

Le snapshot reprend exactement `profileId=enemy-069-albino-monica-line`, `name=Albino Monica Line`, `archetype=Monica Line`, `modifier=Albino`, `biology=xenomorph`, `caste=stalker`, `provenance=systemic-variant`, `animationFamily=biped`, `batchId=batch-005`, `ordinal=68`, `initialStatus=pending-reference`, `reference=null`, `referenceLockSha256=null`, le provider OpenAI, `canonExact=false`, le profil droit, la grille source 4×2, la grille atlas 4×8 en cellules 256×256 avec garde 16, le pivot `[128,240]` et les trois chemins de sortie. L'ID 069 et l'ordinal zéro-indexé 68 sont intentionnels. La queue valait `c07fb6b89cc2773d3f96fadc1d3676ffe63c17624aa88c7f9cf1a1e8e94eb15b` au moment du snapshot.

| Clip | FPS | Loop | Frames | `sourcePath` | SHA-256 déclaré de la queue |
|---|---:|:---:|---|---|---|
| `idle` | 6 | oui | 0–7 | `assets/openai/sprites/frames/v66/batch-005/enemy-069-albino-monica-line/idle.png` | `6c33cc32ab490d460d1eccf05e51bf7c5d7a38943381a8eb740cef5b9602eeac` |
| `move` | 12 | oui | 8–15 | `assets/openai/sprites/frames/v66/batch-005/enemy-069-albino-monica-line/move.png` | `a5251f329b9a20a4829c2b460246ced57cb2b05dd2bbaa2fb3129892c17d4d18` |
| `attack` | 12 | non | 16–23 | `assets/openai/sprites/frames/v66/batch-005/enemy-069-albino-monica-line/attack.png` | `f29f110f27954252767b24cbce76c58bd18dd07686f99ce5ab715b406471dfb9` |
| `death` | 10 | non | 24–31 | `assets/openai/sprites/frames/v66/batch-005/enemy-069-albino-monica-line/death.png` | `a6efba35ab29cbd20752301a0f5102a7816f9dd2a1fbf06c271abaa31ed0229e` |

Les motions, `frameCount`, indices, `normalizedPath` et `previewPath` de chaque clip sont recopiés dans le JSON. Aucun clip spécial supplémentaire n'existe pour ce profil.

## Autorité et verrou de design

- [Penguin Random House — *Aliens: Infiltrator*](https://www.penguinrandomhouse.com/books/635223/aliens-infiltrator-by-weston-ochse/) décrit le roman licencié comme préquelle officielle de *Aliens: Fireteam Elite* et établit Pala Station ainsi que les expérimentations xénomorphes.
- [Site officiel *Aliens: Fireteam Elite*](https://www.aliensfireteamelite.com/en/purchase/) établit le corpus du jeu et du Pathogen. Il ne fournit pas un modèle « Albino Monica Line » ni un turnaround orthographique.
- Les anciens liens fan/wiki du verrou de base ne sont pas promus dans ce fragment. Les détails anatomiques positifs proviennent du verrou V66 et des preuves locales déjà relus.

Le lock impose un grand Drone bipède lourd mais non Crusher: dôme long et lisse, double mâchoire, cage thoracique biomécanique, deux longs bras, deux jambes digitigrades, quatre tubes dorsaux et une queue segmentée complète. Les bandes Pathogen sont des irrégularités gris-taupe originales, pas les marques exactes de Three. La palette albinos reste ivoire perlé, os pâle, creux gris cendre et tissus rose-taupe avec cavités sombres; jamais un filtre blanc, une lueur ou une glace.

## Prédécesseurs locaux vérifiés

- action sheet V56 1254×1254: `assets/openai/sprites/enemies/monica-line-action-sheet-v56.png`, 842 082 octets, SHA-256 `2e5b9598c639924ec8cc539f544b6035207cb6c937bedf9789d4888318aff023`;
- miroir V56 normalisé 1024×1024: 540 551 octets, SHA-256 `7bea16e251795d207ec5796016513d8631399906864c171c3d6445fe2efc77b3`;
- étude locale du modèle de jeu 1600×900: 263 988 octets, SHA-256 `c75d669dc5e1e04c1cd8504b6e63b3aa3750068da002ed3a53ae4470229157c2`; elle reste sous le verrou déjà relu et n'est pas promue comme nouvelle autorité web;
- sources V66 1774×887: `idle a12526c2…`, `move 52b7f89f…`, `attack cd142617…`, `death 6657714a…`;
- metadata V66 courante: 55 435 octets, SHA-256 `89f4894006a95c1b826f84f4006edcad84f9b8e7bf903de08385aaeb3d1b1f7c`;
- matrice V56: SHA-256 `a29c7106e322acddda9543e6a243299c5d27817cee1b27c1649e375448db73eb`;
- audit source batch 002: SHA-256 `27e126ac9665deea0b2728164727205ffe1202fd982d8311dd88a421da899d5c`;
- audit atlas B: SHA-256 `1c29578be3ca6685dab39145e3ae2be5f399280d26f8c242221618994e08cd2c`.

Les treize `localPaths` du fragment existent. Ce sont des preuves et guides d'identité; aucune ne devient une source à recopier, filtrer ou recolorer pour les futurs clips 069.

## Échelle et root: aucune calibration héritée

La metadata de base rapporte un ancien pack scale `0.503370787` et quatre valeurs nominales `sourceScaleByClip=1.0`, mais `scaleCalibrationReview=null` et `scaleCalibrationEvidence=[]`. Le fragment fixe donc `inheritSourceScaleByClip=false`. Le 069 exige une revue indépendante des 32 poses fondée sur le dôme, la cage thoracique, le pelvis et les segments proximaux, pas sur le bout de queue ou l'allonge des griffes.

`enemy-017-monica-line` est absent du registre relu `V66_BATCH_002_ANCHOR_REVIEW.json`; ses 32 placements restent `pending-body-root-review` avec la méthode historique `legacy-bounds-center-bottom`. Zéro coordonnée n'est héritée. Les nouveaux roots devront suivre pelvis/jambe proximale et le véritable appui ou plan de repos.

Le source audit consigne en outre des indices de contact de frontière dans `attack` aux frames zéro-indexées 2–7: paires 2/3 (`45` pixels à droite, `50` à gauche), 4/5 (`17`/`16`) et 6/7 (`71`/`73`). La réattribution courte du normaliseur préserve techniquement ces fragments, mais ce n'est ni une preuve de root ni une acceptation artistique. Les sources 069 devront être rédigées sans aucun contact intercellule.

## Limites visuelles du prédécesseur

L'audit atlas maintient le 017 comme candidat normalisé non accepté: racines en attente, marche peu ample, bras très rectiligne dans la zone documentée `attack/4–5` et petits résidus colorés dans les membres. L'audit technique n'a certifié ni le compte visuel de sujets ni la continuité d'animation. Ces défauts sont des anti-références; ils ne sont pas transférés au lock 069.

## Méthode de hash des prompts

Les quatre prompts de queue sont encore des placeholders `BLOCKED`. Les quatre valeurs déclarées ont été recalculées avec la convention réelle du pipeline, `contentHash(prompt) = SHA-256(JSON.stringify(prompt))`, et correspondent exactement pour `idle`, `move`, `attack` et `death`. Un SHA-256 appliqué directement aux octets UTF-8 du texte produit volontairement une autre valeur, car il omet la sérialisation JSON; ce n'est pas une anomalie du contrat. Ces hashes restent des snapshots de queue, pas des reçus ImageGen. Les prompts seront reconstruits après fusion du `designLock`.

## Simulation de fusion et limites

`assembleReferenceRegistry` a accepté en mémoire les fragments 069 et 070 contre le registre global de 67 profils, SHA-256 `396d11c93b613a9d69faaa5c1e2334e870cacba00a66a8a66111d9008750e2e6`. Le document simulé contient 69 profils et aurait le SHA-256 canonique `ff81048c74748b8d304f0a3dff434c44912c8a5ef70d763031ff1daa1d47338d`. Les identités et contrats de clips sont exacts, les URLs sont HTTPS et tous les chemins locaux existent. Aucun drift du registre n'a été observé entre lecture et simulation, et rien n'a été écrit dans le registre global.

Le fragment n'autorise aucune génération, acceptation ou intégration runtime. Les deux URLs officielles/licenciées prouvent la continuité, pas l'existence d'un albinos canonique. Chaque futur pixel doit être une création originale fan-made/projet; `canonExact=false`, aucune revendication 1:1. Aucun global, queue, state, sprite, metadata ou dépôt Git n'est modifié par ce travail.
