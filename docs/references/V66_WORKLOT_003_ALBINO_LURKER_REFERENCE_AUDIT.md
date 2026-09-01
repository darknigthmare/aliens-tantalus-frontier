# V66 — audit de référence 063 Albino Lurker

## Verdict

`enemy-063-albino-lurker` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée exclusivement du verrou V66 relu `enemy-011-lurker` (`referenceLockSha256=7f3cff74b850d6406136d3a927d9e28af229aebf73440298eeec2ff626b4b3c5`). Aucun modèle primaire ou licencié examiné ne définit un « Albino Lurker » officiel distinct; aucune fidélité 1:1 n'est revendiquée et aucun pixel officiel ne devra être copié.

## Contrat exact de la queue

Le snapshot reprend sans modification `profileId=enemy-063-albino-lurker`, `name=Albino Lurker`, `archetype=Lurker`, `modifier=Albino`, `biology=xenomorph`, `caste=ambush`, `provenance=systemic-variant`, `animationFamily=quadruped`, `batchId=batch-004` et `ordinal=62`. Il conserve le profil droit, la grille source 4×2, la grille normalisée 4×8 en cellules 256×256 avec garde 16 et le pivot `[128,240]`.

| Clip | FPS | Loop | Frames | SHA-256 déclaré de la queue |
|---|---:|:---:|---|---|
| `idle` | 6 | oui | 0–7 | `586f732fa3f6d4063834b53ae34740cdde40310f6c775c514c53faf943f4afba` |
| `move` | 12 | oui | 8–15 | `33d9bf3ad6feb8567ffc552dd68c2a4929e5053646c3e914a091b45d5e9f219a` |
| `attack` | 12 | non | 16–23 | `ea6bc9ceadc3695fc4695d8d06d428ccee8733074ea9ae2cc2f175df58ae2c2d` |
| `death` | 10 | non | 24–31 | `42de2e60a120cc9ca94654cf38f839c0c906fd48d459f26c2b2697f35d1e22b2` |

Les motions, `sourcePath`, `normalizedPath`, `previewPath`, nombres/indices de frames et chemins finaux d'atlas/metadata ont tous été recopiés dans le JSON. La queue auditée valait `f6205370b7727b961317c7a8f107aa742ed8e0c479c140e1a32aad1bddba0d59` au moment du snapshot.

## Autorité, matière Albino et limites

- [20th Century Studios — Aliens](https://www.20thcenturystudios.com/movies/aliens) est une source primaire utilisée uniquement comme contexte de continuité de franchise.
- Le verrou V66 relu et la photographie locale licenciée Square Enix contrôlent l'anatomie Lurker: long dôme lisse comprimé, corps maigre, locomotion basse, quatre tubes dorsaux, double mâchoire et longue queue-lance.
- L'albinos est une matière originale Tantalus Frontier: ivoire perlé, gris-beige, creux bleu-gris et tissus rose-taupe. Il ne peut être ni un filtre blanc, ni une recoloration automatique, ni un effet de glace/lumière.

Le design interdit la dérive vers Warrior, Runner ou caste royale. La locomotion `move` reste sur quatre appuis avec contacts diagonaux; `attack` revient sur quatre appuis. Les quatre tubes dorsaux et l'unique queue complète doivent rester invariants.

## Prédécesseurs locaux vérifiés

- action sheet V56 1254×1254: `assets/openai/sprites/enemies/xenomorph-lurker-action-sheet.png`, SHA-256 `f531ec6fdb2fd200bdad61122e5c1e122bd0b401cf808a06ac65d5604095c0cf`;
- miroir V56 normalisé 1024×1024: `assets/openai/sprites/normalized/enemies/xenomorph-lurker-action-sheet.png`, SHA-256 `e250acd441e8d77eb4c7cbfa686c26ffa83348e8701245c20cda5600892fabb1`;
- sources V66 1774×887: `idle e0b18f02…`, `move 6c0163d5…`, `attack 33f6091c…`, `death 4abb55a2…`;
- référence licenciée locale: 55 512 octets, SHA-256 `ae1f7fcff61a91e247e253f393033f88661d4414e01b8ffda9b8f3503bc10a41`;
- metadata V66: SHA-256 `9791ed7d6d047a956ba8179a5ed8fd9c59651fa2e9e0ea5c96f242c03c8e1d32`.

Le metadata de base conserve des facteurs proposés (`idle=1.000000`, `move=1.062929`, `attack=1.858278`, `death=1.822337`), mais sa `scaleCalibrationReview` est `null` et sa revue géométrique exige encore une mesure inter-clips. Ces facteurs ne sont donc pas importés dans le verrou 063. Le root physique est le centre du bassin devant la base de queue, au joint proximal de la patte arrière, projeté sur le sol de support; il est déjà relu sur 32 poses. La queue, le dôme et l'allonge du bond ne définissent jamais l'échelle ou le root.

## Anomalie des hashes de prompts

Les quatre prompts de queue sont encore les placeholders `BLOCKED`. Le SHA-256 recalculé sur leur texte UTF-8 diffère du hash déclaré pour les quatre clips (`f42f493d…`, `00198ea8…`, `2a3b7301…`, `7a86cdad…`). Les valeurs déclarées sont conservées exactement comme contrat de provenance, mais ne sont pas des reçus de prompts reconstruits. Le pipeline doit reconstruire les prompts depuis le `designLock` fusionné avant ImageGen.

## État et garde-fous

Le fragment pointe vers `docs/references/V66_ENEMY_BATCH_REFERENCES.json`, expose une URL HTTPS primaire non vide, uniquement des `localPaths` existants, un `designLock` chaîne, `designDetails`, le reviewer et la date requis. Aucune génération, acceptation, intégration, fusion globale, modification de queue/state ou opération Git n'a été effectuée.
