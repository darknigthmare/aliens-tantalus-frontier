# V66 — audit de référence 070 Albino Specimen Six Line

## Verdict

`enemy-070-albino-specimen-six-line` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée uniquement du verrou V66 relu `enemy-018-specimen-six-line` (`referenceLockSha256=ad747d28d2535926f07ad69d7cf56a604daf7fe6f1e80a313e2bf12791a91659`). Number Six est un individu unique; sa marque et sa progression ne sont pas des caractères héréditaires. Le 070 reste une lignée Warrior fixe avec matière albinos originale Tantalus Frontier, jamais un modèle officiel, une copie de Six ou une fidélité 1:1.

## Contrat exact de la queue

Le snapshot reprend exactement `profileId=enemy-070-albino-specimen-six-line`, `name=Albino Specimen Six Line`, `archetype=Specimen Six Line`, `modifier=Albino`, `biology=xenomorph`, `caste=adaptive`, `provenance=systemic-variant`, `animationFamily=biped`, `batchId=batch-005`, `ordinal=69`, `initialStatus=pending-reference`, `reference=null`, `referenceLockSha256=null`, le provider OpenAI, `canonExact=false`, le profil droit, la grille source 4×2, la grille atlas 4×8 en cellules 256×256 avec garde 16, le pivot `[128,240]` et les trois chemins de sortie. L'ID 070 et l'ordinal zéro-indexé 69 sont intentionnels. La queue valait `c07fb6b89cc2773d3f96fadc1d3676ffe63c17624aa88c7f9cf1a1e8e94eb15b` au moment du snapshot.

| Clip | FPS | Loop | Frames | `sourcePath` | SHA-256 déclaré de la queue |
|---|---:|:---:|---|---|---|
| `idle` | 6 | oui | 0–7 | `assets/openai/sprites/frames/v66/batch-005/enemy-070-albino-specimen-six-line/idle.png` | `01048248c7733c695c95af43096fcf842c13d958f9e321cb5873cefada486b69` |
| `move` | 12 | oui | 8–15 | `assets/openai/sprites/frames/v66/batch-005/enemy-070-albino-specimen-six-line/move.png` | `35aa963333dd0dbe74f0c7afb9b69a1831758f8fe36d6ba8a14f6d69da53bb40` |
| `attack` | 12 | non | 16–23 | `assets/openai/sprites/frames/v66/batch-005/enemy-070-albino-specimen-six-line/attack.png` | `02d424065854c2cbec725a65302cde73f0b8df2638f2ee44a07ad6fffa9bfed5` |
| `death` | 10 | non | 24–31 | `assets/openai/sprites/frames/v66/batch-005/enemy-070-albino-specimen-six-line/death.png` | `2e344195e983cdbdb23a54d83dee452980fb365fa2ae4035f8e7aeabdcd31e9b` |

Les motions, `frameCount`, indices, `normalizedPath` et `previewPath` de chaque clip sont recopiés dans le JSON. Aucun clip spécial supplémentaire n'existe pour ce profil.

## Autorité et verrou de design

- [Manuel officiel AVP 2010](https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/10680/manuals/AVP_G4W_MG_UK_DD.pdf?t=1763676764) identifie l'Alien jouable comme « Number Six » et décrit ses capacités Alien; il sert de contexte de l'individu et du corpus, pas de turnaround albinos.
- [Page Steam licenciée *Aliens vs. Predator*](https://store.steampowered.com/app/10680/Aliens_vs_Predator/) établit le jeu 2010 développé par Rebellion et publié par SEGA.
- [Fiche licenciée Prodos consacrée à Specimen 6](https://prodosgames.com/sites/prodosgames.com/files/files/avpunleashed_specimen6.pdf) reste un contexte d'individu. Elle ne transforme pas la lignée 070 en modèle canonique.
- Le lien fan-wiki de l'ancien verrou n'est pas promu. L'anatomie positive provient du verrou V66 et des preuves locales déjà relus.

Le lock fixe un Warrior bipède fin et athlétique: long crâne horizontal côtelé et aveugle, double mâchoire, torse étroit et nervuré, deux bras, deux jambes digitigrades, quatre tubes dorsaux fins et une queue segmentée complète. Aucun stade Praetorian/Queen, aucune couronne et aucune marque « 6 ». La palette albinos reste ivoire perlé, os pâle, creux gris bleu/cendre, tissus rose-taupe, cavités sombres et reflets humides; jamais un filtre blanc, une lueur ou une glace.

## Prédécesseurs locaux vérifiés

- action sheet V56 1254×1254: `assets/openai/sprites/enemies/specimen-six-line-action-sheet-v56.png`, 849 329 octets, SHA-256 `38876f8ebade5a07e02589515b51eb7819af33927f6a1f0f44429ce86777943c`;
- miroir V56 normalisé 1024×1024: 472 104 octets, SHA-256 `be902ad624e15ace97da27e4983a2a685891e7e221cf72aef282485f06c7d858`;
- sources V66 1774×887: `idle 69710cc8…`, `move 6e60cafc…`, `attack 9ccd69b0…`, `death 0c5e96eb…`;
- metadata V66 courante: 54 342 octets, SHA-256 `f9937faf3fd4d6e96b0cceb266c5e4b0ce8277244fd184e5cc476c9752829076`;
- révision `move-tail-overflow` rejetée: 1 425 142 octets, SHA-256 `dffd100f69cff00c927e52d25387a8d06aad3c030c68ecfbdd690f08ccadd028`; preuve négative seulement;
- matrice V56: SHA-256 `a29c7106e322acddda9543e6a243299c5d27817cee1b27c1649e375448db73eb`;
- audit source batch 002: SHA-256 `27e126ac9665deea0b2728164727205ffe1202fd982d8311dd88a421da899d5c`;
- audit atlas B: SHA-256 `1c29578be3ca6685dab39145e3ae2be5f399280d26f8c242221618994e08cd2c`;
- revue variantes B: SHA-256 `c6230f2dc71de569911cb3f01b2679c0c7ceafe2b12c116661bd5275b0242ef1`.

Les quatorze `localPaths` du fragment existent. Ce sont des preuves et guides d'identité; aucune ne devient une source à recopier, filtrer ou recolorer pour les futurs clips 070.

## Échelle et root: aucune calibration héritée

La metadata de base rapporte un ancien pack scale `0.523364486` et quatre valeurs nominales `sourceScaleByClip=1.0`, mais `scaleCalibrationReview=null` et `scaleCalibrationEvidence=[]`. Le fragment fixe donc `inheritSourceScaleByClip=false`. Le 070 exige une revue indépendante des 32 poses fondée sur le crâne, la cage thoracique, le pelvis et les segments proximaux, pas sur l'arc de queue ou l'allonge des griffes.

`enemy-018-specimen-six-line` est absent du registre relu `V66_BATCH_002_ANCHOR_REVIEW.json`; ses 32 placements restent `pending-body-root-review` avec la méthode historique `legacy-bounds-center-bottom`. Zéro coordonnée n'est héritée. Les nouveaux roots devront suivre pelvis/jambe proximale et le véritable appui ou plan de repos.

Le source audit consigne en outre une paire de contacts de frontière dans `death`: frame zéro-indexée 6, `12` pixels à droite; frame 7, `13` pixels à gauche. La réattribution courte du normaliseur préserve techniquement le fragment, mais ce n'est ni une preuve de root ni une acceptation artistique. La révision `move-tail-overflow` a été rejetée et ne peut servir de précédent. Les sources 070 devront éliminer tout contact ou débordement.

## Limites visuelles et anomalie de classification du prédécesseur

L'audit atlas maintient le 018 comme candidat normalisé non accepté: racines en attente, queue plus serrée/courte dans la zone documentée `move/3–4/7–8`, résidus fuchsia dans `attack/2` et `attack/4`, fluidité non démontrée. L'audit technique n'a certifié ni le compte visuel de sujets ni la continuité d'animation.

La queue historique de base nomme sa provenance `licensed-reference`, tandis que la matrice V56 et le verrou relu classent « Specimen Six Line » comme `PROJECT_ADAPTATION` dérivée d'un individu unique. Le présent fragment choisit explicitement la classification prudente `PROJECT_ADAPTATION`; il ne convertit pas cette divergence historique en revendication canonique.

## Méthode de hash des prompts

Les quatre prompts de queue sont encore des placeholders `BLOCKED`. Les quatre valeurs déclarées ont été recalculées avec la convention réelle du pipeline, `contentHash(prompt) = SHA-256(JSON.stringify(prompt))`, et correspondent exactement pour `idle`, `move`, `attack` et `death`. Un SHA-256 appliqué directement aux octets UTF-8 du texte produit volontairement une autre valeur, car il omet la sérialisation JSON; ce n'est pas une anomalie du contrat. Ces hashes restent des snapshots de queue, pas des reçus ImageGen. Les prompts seront reconstruits après fusion du `designLock`.

## Simulation de fusion et limites

`assembleReferenceRegistry` a accepté en mémoire les fragments 069 et 070 contre le registre global de 67 profils, SHA-256 `396d11c93b613a9d69faaa5c1e2334e870cacba00a66a8a66111d9008750e2e6`. Le document simulé contient 69 profils et aurait le SHA-256 canonique `ff81048c74748b8d304f0a3dff434c44912c8a5ef70d763031ff1daa1d47338d`. Les identités et contrats de clips sont exacts, les URLs sont HTTPS et tous les chemins locaux existent. Aucun drift du registre n'a été observé entre lecture et simulation, et rien n'a été écrit dans le registre global.

Le fragment n'autorise aucune génération, acceptation ou intégration runtime. Les sources officielles/licenciées prouvent l'individu et le corpus, pas l'existence d'un albinos canonique. Chaque futur pixel doit être une création originale fan-made/projet; `canonExact=false`, aucune revendication 1:1. Aucun global, queue, state, sprite, metadata ou dépôt Git n'est modifié par ce travail.
