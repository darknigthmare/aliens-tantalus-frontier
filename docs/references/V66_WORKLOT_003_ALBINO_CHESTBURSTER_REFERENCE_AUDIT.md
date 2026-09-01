# V66 — audit de référence 055 Albino Chestburster

## Verdict

`enemy-055-albino-chestburster` est une `PROJECT_ADAPTATION` systémique, `canonExact=false`, dérivée du verrou V66 `enemy-003-chestburster` (`referenceLockSha256=6444a1e382c9d3846e4f0487a461c672663b472c6642d12553eb7fa5cf3bde82`). Alien (1979) et le produit licencié NECA ne contrôlent que l'anatomie de base. Aucune source licenciée examinée ne définit un « Albino Chestburster » officiel; aucune fidélité 1:1 n'est revendiquée.

## Contrat exact de la queue

Le snapshot reprend sans modification `id=enemy-055-albino-chestburster`, `name=Albino Chestburster`, `biology=xenomorph`, `caste=juvenile`, `animationFamily=juvenile`, `ordinal=54`, le profil droit, la grille source 4×2 et la grille normalisée 4×8 en cellules 256×256 avec garde 16 et pivot `[128,240]`.

| Clip | FPS | Loop | Frames | SHA-256 déclaré de la queue |
|---|---:|:---:|---|---|
| `idle` | 6 | oui | 0–7 | `292f8e0b101437a6cc3dfb9e9f850a808da2743fcadd22c530c7dab7ff80f336` |
| `move` | 12 | oui | 8–15 | `90001d6ab7812128eb883945f4f39d5379f981ad9b24ab094d151869db8a377a` |
| `attack` | 12 | non | 16–23 | `ead0536571e98148f63a01f9a6709e5169d887f3bf844f25363591c25fe43425` |
| `death` | 10 | non | 24–31 | `a37338613040a2091477d262856d3003c401d9034b8571379f22ce847bc7e22a` |

Les quatre `sourcePath`, `normalizedPath`, `previewPath`, motions et chemins d'atlas/metadata finaux sont recopiés dans le JSON. La queue auditée vaut `c2fddd317847ff86783a5e8efa4e9038cfb94d6424bd6fa3b140d70398e34e49`.

## Verrou d'identité et matière albinos

L'anatomie héritée reste celle du juvenile 1979 choisi par le projet: tête lisse allongée, corps serpentin côtelé sans membres ni yeux, petites dents métalliques et longue queue annelée. Le déplacement reste une ondulation basse; l'attaque est une morsure/body snap; la mort est irréversible.

L'albinisme n'autorise que de nouveaux pigments et une nouvelle réponse de matière: ivoire chaud, gris-beige clair, veinules rose-beige translucides et ombres gris froid. Il ne doit jamais devenir un blanc plat, une lueur, de la glace, un filtre global ou un simple recoloriage de la base. Bras, jambes, anatomie Bambi/Runner, tubes dorsaux adultes, gore et sang peint sont interdits.

## Preuves locales et limites V56/V65

- prédécesseur projet brut 1254×1254: `assets/openai/sprites/enemies/chestburster-action-sheet.png`, SHA-256 `5041daba128f0bbe0f0b0c4885ec7f36b66f7c76248045fdc6f1afc5a39f88f2`;
- prédécesseur normalisé 1024×1024: `assets/openai/sprites/normalized/enemies/chestburster-action-sheet.png`, SHA-256 `21f7aa5b6cb814446aed5be1a7f6b2de60b5a0877a9c640506248df64063ed3c`;
- bases V66 1774×887: `idle ae3881a0…`, `move 69100051…`, `attack f160eed8…`, `death ddf09f68…`.

Le prédécesseur Chestburster est l'actif projet documenté avant cette vague; il ne constitue pas une plaque V66 réutilisable. L'inventaire local `frames/v65/enemy-profiles` et son miroir metadata ne contiennent que dix candidats Ovomorph (053/105/157/209/261/313/365/417/469/521): aucun profil 055 ni Albino Chestburster V65 n'existe. Cette absence est déclarée au lieu d'inventer un héritage.

## Incohérence de hashes de prompts

Les quatre prompts de queue sont encore les placeholders `BLOCKED`. Le SHA-256 recalculé sur leur texte UTF-8 décodé diffère du hash déclaré pour les quatre clips (`75ed87df…`, `3dafe84c…`, `10db7e23…`, `f791b07e…`). Les valeurs déclarées sont conservées exactement comme contrat de provenance, mais ne doivent pas être présentées comme des reçus de prompts reconstruits. La fusion doit d'abord injecter le nouveau `designLock`, puis régénérer les prompts.

## État et garde-fous

Le fragment pointe vers `docs/references/V66_ENEMY_BATCH_REFERENCES.json`, expose des `urls` HTTPS non vides, uniquement des `localPaths` existants, un `designLock` chaîne, `designDetails`, le reviewer et la date requis. Aucune génération, acceptation, intégration, fusion globale, modification de queue/state ou opération Git n'a été effectuée.
