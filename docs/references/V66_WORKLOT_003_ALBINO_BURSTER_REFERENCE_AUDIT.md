# V66 — audit de référence 068 Albino Burster

## Verdict

`enemy-068-albino-burster` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée du verrou V66 relu `enemy-016-burster` (`referenceLockSha256=1e29112085c023efdd5c09031d3ce649c48b7811ab4773ae43373db4b58e9270`). Les sources examinées dans le projet définissent le Burster de *Aliens: Fireteam Elite*, pas un modèle officiel « Albino Burster ». La matière ivoire et les membranes acides jaune-vert atténuées constituent donc une adaptation originale Tantalus Frontier; aucune fidélité 1:1 et aucun pixel officiel copié ne sont autorisés.

## Contrat exact de la queue

Le snapshot reprend exactement `profileId=enemy-068-albino-burster`, `name=Albino Burster`, `archetype=Burster`, `modifier=Albino`, `biology=xenomorph`, `caste=explosive`, `provenance=systemic-variant`, `animationFamily=explosive`, `batchId=batch-005`, `ordinal=67`, `initialStatus=pending-reference`, le provider OpenAI, `canonExact=false`, le profil droit, la grille source 4×2, la grille atlas 4×8 en cellules 256×256 avec garde 16, le pivot `[128,240]` et les trois chemins de sortie. La queue valait `a94bf8a5208e7bcf798e3a4adea0a6af102bf9c8df0265c63b73f70ba045c628` au moment du snapshot.

| Clip | FPS | Loop | Frames | `sourcePath` | SHA-256 déclaré de la queue |
|---|---:|:---:|---|---|---|
| `idle` | 6 | oui | 0–7 | `assets/openai/sprites/frames/v66/batch-005/enemy-068-albino-burster/idle.png` | `48b5a6fcbbdeb2d42a89b36f24ce6f2d9b08ccf28a23db67aad9f7415ac777e5` |
| `move` | 12 | oui | 8–15 | `assets/openai/sprites/frames/v66/batch-005/enemy-068-albino-burster/move.png` | `278efef76f80538061d9f4fe1b2afe4cd408a5170a417a6aff97001b79ffe29e` |
| `attack` | 12 | non | 16–23 | `assets/openai/sprites/frames/v66/batch-005/enemy-068-albino-burster/attack.png` | `feca1c1084dc0b5f3958c814a3e03345e1d58acbf4613c6a25026474aa7b0b71` |
| `death` | 10 | non | 24–31 | `assets/openai/sprites/frames/v66/batch-005/enemy-068-albino-burster/death.png` | `d144ca572d3fe4b2b539bc1cabbff2d57b5dec7d9c4bdbc37abe90e58ea9835c` |

Les motions, `frameCount`, indices de frames, `normalizedPath` et `previewPath` de chaque clip sont également recopiés dans le JSON. Il n'existe aucun clip spécial supplémentaire pour ce profil.

## Autorité et verrou de design

- [NECA — Burster Alien licencié](https://store.necaonline.com/products/aliens-fireteam-elite-burster-alien-7-inch-scale-action-figure) ancre le sculpt et la distribution des cystes du modèle de base.
- [Focus Entertainment — Aliens: Fireteam Elite](https://www.focus-entmt.com/en/games/aliens-fireteam-elite) sert uniquement de contexte primaire pour le jeu source.
- Ces deux URLs HTTPS proviennent du verrou V66 déjà relu; aucune recherche externe supplémentaire n'était nécessaire et aucune ne prouve une variante albinos officielle.

Le Burster reste un quadrupède bas et maigre: plaque crânienne courte, grappes de membranes acides sur crâne/cou et groupes secondaires sur membres antérieurs/cuisses, quatre membres de course, aucune grande tube dorsale, queue longue complète et lame caudale aplatie. L'albinos emploie ivoire perlé, gris-beige, tissus rose-taupe et cystes jaune-vert atténués; jamais corps entièrement fluorescent, filtre blanc ou recoloration automatique.

`attack` montre pression/inflation biologique et préparation de détonation. Le burst final, le rayon de dégâts et l'acide projeté restent des effets runtime séparés. Le corps ne devient ni une sphère, ni une bombe mécanique. Le lock interdit toute dérive vers Prowler, Boiler, Crusher, Warrior ou caste royale.

## Prédécesseurs locaux vérifiés

- action sheet V56 1254×1254: `assets/openai/sprites/enemies/xenomorph-burster-action-sheet-v56.png`, 816 219 octets, SHA-256 `bdf146916c1453dcc9ba2da0b053669529df9df25fe6ab9cb694cfa04cd11e4e`;
- miroir V56 normalisé 1024×1024: SHA-256 `a0bd9e13279b26d3c7a444d076055fd2773fc3c0081f1a8dc273d1773b69addd`;
- master licencié local 1920×2400: SHA-256 `992a32247236978d1bac1e41063762febfc20f60a9c5bebfe8794087f2d8c350`;
- sources V66 1774×887: `idle cf23a2a0…`, `move 5b85ad97…`, `attack f0cc76ff…`, `death d6417f8a…`;
- metadata V66 courante: 72 559 octets, SHA-256 `895e377a2efb77678dcdb117f7314e7ea6da40af7d768a9e85a84197312c0186`;
- matrice V56: SHA-256 `a29c7106e322acddda9543e6a243299c5d27817cee1b27c1649e375448db73eb`.

Les douze `localPaths` du fragment existent. Ils sont des preuves et guides d'identité; ils ne sont pas des sources à recopier ou recolorer dans les futurs clips 068.

## Échelle et root: aucune calibration héritée

La metadata de base rapporte un ancien pack scale `0.5` et quatre valeurs nominales à `1.0`, mais `scaleCalibrationReview=null` et `scaleCalibrationEvidence=[]`. Le fragment fixe donc `inheritSourceScaleByClip=false`: aucun `sourceScaleByClip` n'est promu ni hérité. Les 32 nouvelles poses devront recevoir une calibration complète fondée sur la plaque crânienne, la cage thoracique et les hanches.

La base Burster possède bien une revue de 32 roots marquée `reviewed` dans `V66_BATCH_002_ANCHOR_REVIEW.json`. Ces coordonnées restent liées aux pixels 016 et ne sont pas transférées au 068. Anomalie documentaire conservée: la chaîne `method` partagée dans l'entrée Burster contient une clause spécifique aux poses aériennes du Prowler. Les mesures par clip du Burster existent, mais cette prose croisée interdit de présenter la preuve comme une calibration générale du dérivé. Une revue indépendante des 32 nouveaux roots reste obligatoire.

## Méthode de hash des prompts

Les quatre prompts de queue sont encore des placeholders `BLOCKED`. Les quatre valeurs déclarées ont été recalculées avec la convention réelle du pipeline, `contentHash(prompt) = SHA-256(JSON.stringify(prompt))`, et correspondent exactement pour `idle`, `move`, `attack` et `death`. Un SHA-256 appliqué directement aux octets UTF-8 du texte produit volontairement une autre valeur, car il omet les guillemets et échappements de la sérialisation JSON; cette différence n'est pas une anomalie du contrat. Ces hashes restent des snapshots de queue et non des reçus de prompts prêts pour ImageGen. Les prompts seront reconstruits après fusion du `designLock`.

## Simulation de fusion et limites

`assembleReferenceRegistry` a accepté en mémoire les fragments 067 et 068 contre le registre global dont le SHA-256 était `f8825d364eff80f86ed9fd48fad7de935510dd001b7ad8de1701b812799278e4` au moment de la simulation. Le registre simulé aurait eu le SHA-256 `06e511411b4faa39369584573e8628acf2bb906d8b79e0ff59e537acd307fd8a`. Les identités et contrats de clips sont exacts, les URLs sont HTTPS et tous les chemins locaux existent. Rien n'a été écrit dans le registre global.

Le registre partagé avait changé concurremment depuis le hash initialement consulté `f6a6bbd8cadecfd8077fb2c8c2571407cbd00a6a895857bd3c3ad94b46ab828b`; les deux valeurs sont conservées comme preuve de ce drift, sans attribuer cette mutation au présent fragment.

Le candidat de base reste non accepté: l'audit atlas signale encore des résidus fuchsia dans des chevauchements/silhouettes fines et précise que l'attaque montre une compression, pas le burst final. Ce fragment n'autorise aucune génération, acceptation ou intégration runtime. Aucun global, queue, state, sprite, metadata ou dépôt Git n'a été modifié par ce travail.
