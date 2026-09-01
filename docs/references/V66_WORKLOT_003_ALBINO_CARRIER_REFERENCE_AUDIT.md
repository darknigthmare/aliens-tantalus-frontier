# V66 — audit de référence 064 Albino Carrier

## Verdict

`enemy-064-albino-carrier` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée exclusivement du verrou V66 relu `enemy-012-carrier` (`referenceLockSha256=675e7a43d89829d8461e1364f3d9a2cfa5c3159e9ab8260b80d7417375b33709`). Aucun modèle primaire ou licencié examiné ne définit un « Albino Carrier » officiel distinct; aucune fidélité 1:1 n'est revendiquée et aucun pixel officiel ne devra être copié.

## Contrat exact de la queue

Le snapshot reprend sans modification `profileId=enemy-064-albino-carrier`, `name=Albino Carrier`, `archetype=Carrier`, `modifier=Albino`, `biology=xenomorph`, `caste=carrier`, `provenance=systemic-variant`, `animationFamily=carrier`, `batchId=batch-004` et `ordinal=63`. Il conserve le profil droit, la grille source 4×2, la grille normalisée 4×10 en cellules 256×256 avec garde 16 et le pivot `[128,240]`.

| Clip | FPS | Loop | Frames | SHA-256 déclaré de la queue |
|---|---:|:---:|---|---|
| `idle` | 6 | oui | 0–7 | `2474fd3d52e30d8e37618d6d995f1b2910cf17802f84243e3c1b37c6d4d3c449` |
| `move` | 12 | oui | 8–15 | `a7157c73a6869e71bb989095423297e72ea7d960ac0a98f45adae1e586e52f9f` |
| `attack` | 12 | non | 16–23 | `c1d1babf45cb38c28d7167ff0f48df65d00fbecb51d4284e65ac37c663a6a588` |
| `death` | 10 | non | 24–31 | `783baad9e05937f1ed61c7262baf479cdb05d6f8b3ba210915b607ba05dafc66` |
| `release` | 10 | non | 32–39 | `e4ed6677703c841549e1daac3b08aa59cd8572658a75006d0aaa3017bbe7c2ab` |

Le clip spécial `release`, ses motions, `sourcePath`, `normalizedPath`, `previewPath`, nombres/indices de frames et les chemins finaux d'atlas/metadata sont tous recopiés dans le JSON. La queue auditée valait `f6205370b7727b961317c7a8f107aa742ed8e0c479c140e1a32aad1bddba0d59` au moment du snapshot.

## Autorité, matière Albino et comportement Carrier

- [20th Century Studios — Alien vs. Predator](https://www.20thcenturystudios.com/movies/alien-vs-predator) est une source primaire utilisée uniquement comme contexte de continuité de franchise; elle n'établit pas cette caste de jeu.
- Le verrou V66 relu et le crop local du bestiaire licencié *AvP Extinction* contrôlent l'anatomie Carrier: grand biped fonctionnel, dôme comprimé, torse étroit, pattes digitigrades, unique queue et éventail stable de longues épines dorsales portant des parasites.
- L'albinos est une matière originale Tantalus Frontier: ivoire perlé, gris-beige, creux bleu-gris, tissus rose-taupe, crochets ivoire/tan et parasites pâles. Il ne peut être ni un filtre blanc, ni une recoloration automatique, ni un effet de glace/lumière.

`attack` peut bracer et mobiliser la charge dorsale. `release` doit montrer huit étapes chronologiques: appui, articulation des épines, détachement d'un parasite, séparation puis récupération de l'hôte. La sortie est dorsale, jamais buccale; le corps Carrier ne disparaît pas et ne se transforme pas en autre créature.

## Prédécesseurs locaux vérifiés

- action sheet V56 1254×1254: `assets/openai/sprites/enemies/xenomorph-carrier-action-sheet.png`, SHA-256 `d1d00aaaea2beacf72e5551b083cf20a8fefe327fa178ddb3b0bf1e92da0f867`;
- miroir V56 normalisé 1024×1024: `assets/openai/sprites/normalized/enemies/xenomorph-carrier-action-sheet.png`, SHA-256 `82be299796f35a9ef64f58b382c24228b5dcd4c7166461d1bb28e329336732fe`;
- sources V66 1774×887: `idle d428aebb…`, `move d60370ac…`, `attack facda4af…`, `death 730021e3…`, `release 94384699…`;
- crop bestiaire local: 7 074 octets, SHA-256 `c8b2081e521c20f016297a0b9294d1c9e3efc179b1ae99a16d14eb9e38f579f6`;
- metadata V66: SHA-256 `d5a3551b2e86d67d5fbc0b98284fae2aba3440d539301dd10206a3a189aeb15e`.

Le metadata de base propose un multiplicateur source `1.000000` pour les cinq clips, mais sa `scaleCalibrationReview` est `null`; ce facteur n'est donc pas importé comme certification dans le verrou 064. Anomalie importante: `enemy-012-carrier` a encore `physicalAnchorReview.status=pending`. Le dérivé 064 ne pourra donc pas être accepté sans une nouvelle mesure inter-clips et une revue des 40 centres bassin/jambe proximale et de leurs sols de support. Les extrémités de queue, d'épines et la portée du parasite ne définissent jamais l'échelle ou le root.

## Anomalie des hashes de prompts

Les cinq prompts de queue sont encore les placeholders `BLOCKED`. Le SHA-256 recalculé sur leur texte UTF-8 diffère du hash déclaré pour les cinq clips (`00384f00…`, `c12e8f0b…`, `d0c61d2c…`, `69a63d64…`, `752c06ae…`). Les valeurs déclarées sont conservées exactement comme contrat de provenance, mais ne sont pas des reçus de prompts reconstruits. Le pipeline doit reconstruire les prompts depuis le `designLock` fusionné avant ImageGen.

## État et garde-fous

Le fragment pointe vers `docs/references/V66_ENEMY_BATCH_REFERENCES.json`, expose une URL HTTPS primaire non vide, uniquement des `localPaths` existants, un `designLock` chaîne, `designDetails`, le reviewer et la date requis. Aucune génération, acceptation, intégration, fusion globale, modification de queue/state ou opération Git n'a été effectuée.
