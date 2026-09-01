# V66 — audit de référence 067 Albino Prowler

## Verdict

`enemy-067-albino-prowler` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée du verrou V66 relu `enemy-015-prowler` (`referenceLockSha256=e47c1bccaa8dd50e4c5c00765ca0ed4daab25d99e2106bc53fcc8f0e5778e422`). Les sources examinées dans le projet définissent le Prowler de *Aliens: Fireteam Elite*, pas un modèle officiel « Albino Prowler ». Le pigment ivoire/rose-gris est donc une adaptation originale Tantalus Frontier; aucune fidélité 1:1 et aucun pixel officiel copié ne sont autorisés.

## Contrat exact de la queue

Le snapshot reprend exactement `profileId=enemy-067-albino-prowler`, `name=Albino Prowler`, `archetype=Prowler`, `modifier=Albino`, `biology=xenomorph`, `caste=ambush`, `provenance=systemic-variant`, `animationFamily=quadruped`, `batchId=batch-005`, `ordinal=66`, `initialStatus=pending-reference`, le provider OpenAI, `canonExact=false`, le profil droit, la grille source 4×2, la grille atlas 4×8 en cellules 256×256 avec garde 16, le pivot `[128,240]` et les trois chemins de sortie. La queue valait `a94bf8a5208e7bcf798e3a4adea0a6af102bf9c8df0265c63b73f70ba045c628` au moment du snapshot.

| Clip | FPS | Loop | Frames | `sourcePath` | SHA-256 déclaré de la queue |
|---|---:|:---:|---|---|---|
| `idle` | 6 | oui | 0–7 | `assets/openai/sprites/frames/v66/batch-005/enemy-067-albino-prowler/idle.png` | `6dab4674cb45e2e32a7580e859814fd0dda81576252840f20d6131186416a0f1` |
| `move` | 12 | oui | 8–15 | `assets/openai/sprites/frames/v66/batch-005/enemy-067-albino-prowler/move.png` | `4c3cb8e8e84d53187eb5e9572861d0677842cc6051d9c51664e1404637790e62` |
| `attack` | 12 | non | 16–23 | `assets/openai/sprites/frames/v66/batch-005/enemy-067-albino-prowler/attack.png` | `a0bde7ba236c782f180673063116bbccc53b2eb7dc6aface8a5dfa1eccd08955` |
| `death` | 10 | non | 24–31 | `assets/openai/sprites/frames/v66/batch-005/enemy-067-albino-prowler/death.png` | `1dfdd22a4aa0e6e21124c6066d7be39b315299a3a64e71aceaa6505f3f06dbde` |

Les motions, `frameCount`, indices de frames, `normalizedPath` et `previewPath` de chaque clip sont également recopiés dans le JSON. Il n'existe aucun clip spécial supplémentaire pour ce profil.

## Autorité et verrou de design

- [NECA — Prowler Alien licencié](https://store.necaonline.com/products/aliens-fireteam-elite-7-scale-action-figure-prowler-alien) est l'unique URL HTTPS du verrou de base et sert seulement d'autorité pour l'anatomie Fireteam Elite. Ce fragment réutilise cette source déjà relue localement; aucune recherche externe supplémentaire n'était nécessaire.
- Le Prowler reste un quadrupède extrêmement bas et puissant: bouclier crânien court et balayé, rebords relevés, avant-train massif, hanches pointues, abdomen étroit, aucune grande tube dorsale, queue épaisse complète et lame caudale aplatie.
- L'albinos est une matière nouvellement dessinée: ivoire perlé, os pâle, creux gris-beige et tissus rose-taupe. Le changement ne doit ni modifier l'anatomie, ni devenir un filtre blanc, ni réintroduire la palette rouge-noir comme simple recoloration.

Le lock interdit les lectures Crusher, Runner, Burster, Warrior ou royale. `move` reste une course basse à quatre appuis; `attack` conserve anticipation, bond/morsure et récupération à quatre appuis.

## Prédécesseurs locaux vérifiés

- action sheet V56 1536×1024: `assets/openai/sprites/enemies/xenomorph-prowler-action-sheet-v56.png`, 966 656 octets, SHA-256 `94d1024079123f75fa806f22d6720872acb7eaf38ba5ca59e0b533bc6e70cd09`;
- miroir V56 normalisé 1024×1024: SHA-256 `5677c8f8a62e4d5a221df46d329e9b7d5d56b1b83c56750a7e6d2a20dde562ac`;
- master licencié local 2048×2048: SHA-256 `ff62c67d2e58eb8780f6d6f55ef7214895ade56a8e4ec299497cbc991a98c3f7`;
- sources V66 1774×887: `idle ddcdb6a1…`, `move c406d7a3…`, `attack 3e22f9bd…`, `death 59f89194…`;
- metadata V66 courante: 54 118 octets, SHA-256 `a279e13fd3d0e92948dcc5301d7f030dca023f5a6daf8bd56a67c5cf9d59d6ad`;
- matrice V56: SHA-256 `a29c7106e322acddda9543e6a243299c5d27817cee1b27c1649e375448db73eb`.

Les douze `localPaths` du fragment existent. Ils sont des preuves et guides d'identité; ils ne sont pas des sources à recopier ou recolorer dans les futurs clips 067.

## Échelle et root: aucune calibration héritée

La metadata de base rapporte un ancien pack scale `0.539759036` et quatre valeurs nominales à `1.0`, mais `scaleCalibrationReview=null` et `scaleCalibrationEvidence=[]`. Le fragment fixe donc `inheritSourceScaleByClip=false`: aucun `sourceScaleByClip` n'est promu ni hérité. Les 32 nouvelles poses devront recevoir une calibration complète fondée sur le bouclier, la cage thoracique et les hanches.

Le root de la base Prowler est encore `pending-flight-support-review`: 32 repères corporels sont mesurés, mais seulement 29 plans de support sont relus. `attack/3`, `attack/4` et `attack/5` utilisent encore une estimation de plan de sol en phase aérienne. Aucune coordonnée de la base n'est transférée au dérivé; le 067 devra prouver séparément décollage, hauteur de vol et atterrissage sur ses propres pixels.

## Méthode de hash des prompts

Les quatre prompts de queue sont encore des placeholders `BLOCKED`. Les quatre valeurs déclarées ont été recalculées avec la convention réelle du pipeline, `contentHash(prompt) = SHA-256(JSON.stringify(prompt))`, et correspondent exactement pour `idle`, `move`, `attack` et `death`. Un SHA-256 appliqué directement aux octets UTF-8 du texte produit volontairement une autre valeur, car il omet les guillemets et échappements de la sérialisation JSON; cette différence n'est pas une anomalie du contrat. Ces hashes restent des snapshots de queue et non des reçus de prompts prêts pour ImageGen. Les prompts seront reconstruits après fusion du `designLock`.

## Simulation de fusion et limites

`assembleReferenceRegistry` a accepté en mémoire les fragments 067 et 068 contre le registre global dont le SHA-256 était `f8825d364eff80f86ed9fd48fad7de935510dd001b7ad8de1701b812799278e4` au moment de la simulation. Le registre simulé aurait eu le SHA-256 `06e511411b4faa39369584573e8628acf2bb906d8b79e0ff59e537acd307fd8a`. Les identités et contrats de clips sont exacts, les URLs sont HTTPS et tous les chemins locaux existent. Rien n'a été écrit dans le registre global.

Le registre partagé avait changé concurremment depuis le hash initialement consulté `f6a6bbd8cadecfd8077fb2c8c2571407cbd00a6a895857bd3c3ad94b46ab828b`; les deux valeurs sont conservées comme preuve de ce drift, sans attribuer cette mutation au présent fragment.

Le candidat de base reste non accepté: l'audit atlas signale notamment les appuis aériens non certifiés, des restes sombres de fond et certains contacts de doigts. Ce fragment n'autorise aucune génération, acceptation ou intégration runtime. Aucun global, queue, state, sprite, metadata ou dépôt Git n'a été modifié par ce travail.
