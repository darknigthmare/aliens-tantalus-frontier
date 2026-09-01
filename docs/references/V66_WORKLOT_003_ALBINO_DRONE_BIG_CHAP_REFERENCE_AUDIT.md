# V66 — audit de référence 056 Albino Drone / Big Chap

## Verdict

`enemy-056-albino-drone-big-chap` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée du verrou V66 `enemy-004-drone-big-chap` (`referenceLockSha256=d88147e49d112b29330632a3d672ad62394d1bea4b7b8b8bf87a711878d754bd`). Alien (1979) et le modèle licencié NECA contrôlent l'anatomie Big Chap de base. Ils ne définissent aucun « Albino Big Chap » officiel; la pigmentation est une création Tantalus originale sans revendication 1:1.

## Contrat exact de la queue

Le snapshot reprend sans modification `id=enemy-056-albino-drone-big-chap`, `name=Albino Drone / Big Chap`, `biology=xenomorph`, `caste=stalker`, `animationFamily=biped`, `ordinal=55`, le profil droit, la grille source 4×2 et la grille normalisée 4×8 en cellules 256×256 avec garde 16 et pivot `[128,240]`.

| Clip | FPS | Loop | Frames | SHA-256 déclaré de la queue |
|---|---:|:---:|---|---|
| `idle` | 6 | oui | 0–7 | `4e190bbd4c3ba33a4e3ec8d385d214c0ce18f28a5a117e5936f203a1df4fd204` |
| `move` | 12 | oui | 8–15 | `42c17a8e96881d1855c0805c5b41907285ec0f3dd9d79e4d4b5e5869b579ea0b` |
| `attack` | 12 | non | 16–23 | `3e91f283715dc61512deec25ccaa9fd7bfec19a81178390d406302ee05e9ce8f` |
| `death` | 10 | non | 24–31 | `ca1537f6634cf05a43bdc87b4a96dcc7639d46e23a5ce72f2270b09ff7ef43a8` |

Les quatre `sourcePath`, `normalizedPath`, `previewPath`, motions et chemins d'atlas/metadata finaux sont recopiés dans le JSON. La queue auditée vaut `c2fddd317847ff86783a5e8efa4e9038cfb94d6424bd6fa3b140d70398e34e49`.

## Verrou d'identité et matière albinos

La double appellation de queue ne doit pas produire une moyenne de Drones: le verrou V56/V66 donne priorité à la silhouette écran 1979. Il faut conserver un très grand bipède filiforme, un dôme lisse extrêmement allongé, une taille étroite, les côtes biomécaniques, les membres longs, quatre tubes dorsaux, la double mâchoire et une queue segmentée continue. Un crâne côtelé de Warrior, une couronne royale, des yeux, une armure, une arme ou des proportions de brute sont des erreurs d'identité.

L'albinisme n'autorise que des matériaux nouvellement peints: ivoire perlé chaud, gris-beige pâle, structures rose-taupe translucides sous le dôme, creux gris froid et reflets humides. Il ne doit jamais être obtenu par filtre blanc global, lueur, glace ou copie/recoloration du bitmap 004.

## Preuves locales et limites V56/V65

- prédécesseur projet V56 brut 1254×1254: `assets/openai/sprites/enemies/xenomorph-big-chap-action-sheet-v56.png`, SHA-256 `246a2c1cb12558aad34121353ffd26af0e754811d823e4258ec3ee6768e36282`;
- prédécesseur V56 normalisé 1024×1024: `assets/openai/sprites/normalized/enemies/xenomorph-big-chap-action-sheet-v56.png`, SHA-256 `be7f587a085b9ff8cd4ed2511d072d891bba60bc516c7f7b39f3dc7f2bc36b68`;
- bases V66 1774×887: `idle 03d27034…`, `move 0065c633…`, `attack 2a57c289…`, `death bd3efd44…`;
- photographie licenciée locale de contrôle 1040×1300: SHA-256 `18e97eba…`, étude seulement, jamais incorporée aux pixels générés.

L'inventaire local `frames/v65/enemy-profiles` et son miroir metadata ne contiennent que dix candidats Ovomorph (053/105/157/209/261/313/365/417/469/521): aucun profil 056 ni Albino Drone / Big Chap V65 n'existe. Cette absence est déclarée au lieu de fabriquer une continuité.

## Incohérence de hashes de prompts

Les quatre prompts de queue sont encore les placeholders `BLOCKED`. Le SHA-256 recalculé sur leur texte UTF-8 décodé diffère du hash déclaré pour les quatre clips (`1beeb9ca…`, `71f8849d…`, `58361338…`, `999913e6…`). Les valeurs déclarées sont conservées exactement comme contrat de provenance, mais ne doivent pas être présentées comme des reçus de prompts reconstruits. La fusion doit d'abord injecter le nouveau `designLock`, puis régénérer les prompts.

## État et garde-fous

Le fragment pointe vers `docs/references/V66_ENEMY_BATCH_REFERENCES.json`, expose des `urls` HTTPS non vides, uniquement des `localPaths` existants, un `designLock` chaîne, `designDetails`, le reviewer et la date requis. Aucune génération, acceptation, intégration, fusion globale, modification de queue/state ou opération Git n'a été effectuée.
