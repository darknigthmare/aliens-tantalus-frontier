# V66 — audit de référence 057 Albino Warrior

## Verdict

`enemy-057-albino-warrior` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée du verrou V66 `enemy-005-warrior` (`referenceLockSha256=eb78dbdfa2e753099f77052b7c54e7d729cf2f3062e2c8e5aa4da602ff4b5b37`). *Aliens* (1986), la page officielle 20th Century Studios et le modèle licencié NECA contrôlent seulement l'anatomie Warrior de base. Aucune source primaire ou licenciée examinée ne définit un « Albino Warrior » officiel distinct; aucune fidélité 1:1 n'est revendiquée.

## Contrat exact de la queue

Le snapshot reprend sans modification `id=enemy-057-albino-warrior`, `name=Albino Warrior`, `archetype=Warrior`, `modifier=Albino`, `biology=xenomorph`, `caste=assault`, `provenance=systemic-variant`, `animationFamily=biped`, `batchId=batch-004` et `ordinal=56`. Il conserve le profil droit, la grille source 4×2, la grille normalisée 4×8 en cellules 256×256 avec garde 16 et le pivot `[128,240]`.

| Clip | FPS | Loop | Frames | SHA-256 déclaré de la queue |
|---|---:|:---:|---|---|
| `idle` | 6 | oui | 0–7 | `079da550663fedc6abd42e19df6ca3cd5e7edb2688b4b4e72ef0c731df5669b1` |
| `move` | 12 | oui | 8–15 | `009d32e65d245ccc2856ac4037e6c49f4d014379b936c0decfbc3eadeb5119bb` |
| `attack` | 12 | non | 16–23 | `47508f5c9707bb7643c6b05b69a14ac6ebe37d14a4e10e8be352a84cc10521ab` |
| `death` | 10 | non | 24–31 | `99a353d80077ce7d7e4342b1f86e2df89e17c2aa3619c68607e38d215d13a979` |

Les `sourcePath`, `normalizedPath`, `previewPath`, motions, nombres/indices de frames et chemins d'atlas/metadata finaux sont recopiés dans le JSON. La queue auditée valait `7d8c18ec445ca389e752aed40140d62a089f8ed5e91e2fc053cb443498d1e5e7` au moment du snapshot.

## Sources autorisées et divergence albinos

- [20th Century Studios — Aliens](https://www.20thcenturystudios.com/movies/aliens) établit le film et sa continuité de base.
- [NECA — Ultimate Alien Warrior (1986)](https://necaonline.com/2017/06/aliens-7-scale-action-figures-ultimate-alien-warrior-1986-assortment/) fournit un modèle licencié multi-angles du Warrior, notamment le crâne côtelé, la bipédie, la double mâchoire et la longue queue.

Ces sources ne présentent pas un Albino Warrior. La seule lecture honnête est donc une adaptation originale: la silhouette et l'anatomie restent celles du Warrior V66, tandis que l'ivoire perlé, le gris-beige, les creux bleu-gris et les structures rose-taupe sont nouvellement peints. Le résultat ne peut pas être un filtre blanc, une copie de pixels officiels, un Big Chap à dôme lisse, un Runner quadrupède ou une caste royale.

## Preuves locales et limites V56/V65

- prédécesseur projet V56 brut 1254×1254: `assets/openai/sprites/enemies/xenomorph-warrior-action-sheet-v56.png`, SHA-256 `8c84ff36213c8d18bfc04a74c102517b3ac5e93068abe1ad769415d00a50787a`;
- prédécesseur V56 normalisé 1024×1024: `assets/openai/sprites/normalized/enemies/xenomorph-warrior-action-sheet-v56.png`, SHA-256 `c1d3c5aa04148f058646522bff3a118cc39e38300323bde34f972c5b2da34f56`;
- bases V66 1774×887: `idle d0a230ad…`, `move cc4a12d1…`, `attack 811b6a7e…`, `death c1520aed…`;
- photographie licenciée locale de contrôle: 281149 octets, SHA-256 `c71640e3…`, étude seulement, jamais incorporée aux pixels générés.

L'inventaire local `frames/v65/enemy-profiles` et son miroir metadata contiennent dix candidats Ovomorph seulement (053/105/157/209/261/313/365/417/469/521): aucun profil 057 ni Albino Warrior V65 n'existe. Cette absence est déclarée au lieu d'inventer une continuité.

## Incohérence des hashes de prompts

Les quatre prompts de queue sont encore les placeholders `BLOCKED`. Le SHA-256 recalculé sur leur texte UTF-8 décodé diffère du hash déclaré pour les quatre clips (`992145ad…`, `31eee687…`, `54623ba8…`, `5f1fbbc8…`). Les valeurs déclarées sont conservées exactement comme contrat de provenance, mais ne sont pas des reçus de prompts reconstruits. La fusion doit d'abord injecter le nouveau `designLock`, puis le pipeline doit régénérer les prompts.

## État et garde-fous

Le fragment pointe vers `docs/references/V66_ENEMY_BATCH_REFERENCES.json`, expose des `urls` HTTPS non vides, uniquement des `localPaths` existants, un `designLock` chaîne, `designDetails`, le reviewer et la date requis. Aucune génération, acceptation, intégration, fusion globale, modification de queue/state ou opération Git n'a été effectuée.
