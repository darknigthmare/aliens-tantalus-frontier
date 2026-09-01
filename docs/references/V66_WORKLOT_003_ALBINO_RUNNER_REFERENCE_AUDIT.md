# V66 — audit de référence 058 Albino Runner

## Verdict

`enemy-058-albino-runner` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée du verrou V66 `enemy-006-runner` (`referenceLockSha256=29ecca932096a0e5d51d15d2e160852aeb6e227b16982198a2ab59eceda3a67e`). *Alien 3*, la page officielle 20th Century Studios et le modèle licencié NECA contrôlent seulement l'anatomie Dog Alien/Runner de base. Aucune source primaire ou licenciée examinée ne définit un « Albino Runner » officiel distinct; aucune fidélité 1:1 n'est revendiquée.

## Contrat exact de la queue

Le snapshot reprend sans modification `id=enemy-058-albino-runner`, `name=Albino Runner`, `archetype=Runner`, `modifier=Albino`, `biology=xenomorph`, `caste=runner`, `provenance=systemic-variant`, `animationFamily=quadruped`, `batchId=batch-004` et `ordinal=57`. Il conserve le profil droit, la grille source 4×2, la grille normalisée 4×8 en cellules 256×256 avec garde 16 et le pivot `[128,240]`.

| Clip | FPS | Loop | Frames | SHA-256 déclaré de la queue |
|---|---:|:---:|---|---|
| `idle` | 6 | oui | 0–7 | `b249e849def027d28e9059593bc6b03c8f250d0b8132b8f060fb78905b31ba1e` |
| `move` | 12 | oui | 8–15 | `426c27099400c4bd2236c53bbf035dce1712bf8d30bf55e18b4a1f3d90b4b16b` |
| `attack` | 12 | non | 16–23 | `dfa68a25a1fea726617cb910c802b1c082e710079afe54a761c6369ed3335012` |
| `death` | 10 | non | 24–31 | `81f3efcf7838164370019853d19d78bad61f243673b4957b86235b2639d37f28` |

Les `sourcePath`, `normalizedPath`, `previewPath`, motions, nombres/indices de frames et chemins d'atlas/metadata finaux sont recopiés dans le JSON. La queue auditée valait `7d8c18ec445ca389e752aed40140d62a089f8ed5e91e2fc053cb443498d1e5e7` au moment du snapshot.

## Sources autorisées et divergence albinos

- [20th Century Studios — Alien 3](https://www.20thcenturystudios.com/movies/alien-3) établit le film et sa continuité de base.
- [NECA — Ultimate Dog Alien](https://necaonline.com/2019/07/alien-3-7-scale-action-figure-ultimate-dog-alien/) fournit un modèle licencié multi-angles du Dog Alien, notamment sa silhouette basse quadrupède, sa double mâchoire et sa longue queue.

Ces sources ne présentent pas un Albino Runner. La seule lecture honnête est donc une adaptation originale: la silhouette, l'absence de tubes dorsaux et l'anatomie quadrupède restent celles du Runner V66, tandis que l'ivoire osseux, le gris-beige, les creux bleu-gris et les structures rose-taupe sont nouvellement peints. Le résultat ne peut pas être un filtre blanc, une copie de pixels officiels, un Warrior bipède, un animal couvert de fourrure ou une caste royale.

## Échelle et locomotion verrouillées

Le Runner doit rester bas sur quatre appuis. Le cycle `move` utilise des contacts diagonaux, compression et extension; `attack` est une préparation quadrupède, un bond ou une morsure, puis un retour sur quatre pieds. La calibration du profil base est héritée explicitement: `idle=1.00`, `move=1.15`, `attack=1.15`, `death=1.07`. Elle se mesure par longueur crânienne et repères stables du torse, jamais par la queue, la hauteur du bond ou la bounding box changeante.

## Preuves locales et limites V56/V65

- prédécesseur projet V56 brut 1254×1254: `assets/openai/sprites/enemies/xenomorph-runner-action-sheet.png`, SHA-256 `c24f8c4f99af3cdeed61834dd2bf930635b729f9fe6b39850a185a8b962a89c4`;
- prédécesseur V56 normalisé 1024×1024: `assets/openai/sprites/normalized/enemies/xenomorph-runner-action-sheet.png`, SHA-256 `e852c3ca128aee4dd44daaf132998d26d0b31dc0c6835d5b25dd2299674bd078`;
- bases V66 1774×887: `idle 4f1124c1…`, `move d1acc004…`, `attack df6c5687…`, `death 91a3a38c…`;
- revue d'échelle locale: `docs/references/V66_BATCH_001_SCALE_REVIEW.md`.

L'inventaire local `frames/v65/enemy-profiles` et son miroir metadata contiennent dix candidats Ovomorph seulement (053/105/157/209/261/313/365/417/469/521): aucun profil 058 ni Albino Runner V65 n'existe. Cette absence est déclarée au lieu d'inventer une continuité.

## Incohérence des hashes de prompts

Les quatre prompts de queue sont encore les placeholders `BLOCKED`. Le SHA-256 recalculé sur leur texte UTF-8 décodé diffère du hash déclaré pour les quatre clips (`2d0c9a8c…`, `5cab9e66…`, `cc84158a…`, `fd144761…`). Les valeurs déclarées sont conservées exactement comme contrat de provenance, mais ne sont pas des reçus de prompts reconstruits. La fusion doit d'abord injecter le nouveau `designLock`, puis le pipeline doit régénérer les prompts.

## État et garde-fous

Le fragment pointe vers `docs/references/V66_ENEMY_BATCH_REFERENCES.json`, expose des `urls` HTTPS non vides, uniquement des `localPaths` existants, un `designLock` chaîne, `designDetails`, le reviewer et la date requis. Aucune génération, acceptation, intégration, fusion globale, modification de queue/state ou opération Git n'a été effectuée.
