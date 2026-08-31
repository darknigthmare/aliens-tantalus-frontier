# V66 — enemy-029-siege-royal — revue de production

Date de contrôle: 2026-09-01
Statut: **5 sources OpenAI ImageGen sélectionnées comme candidats; aucune acceptation, normalisation ou intégration runtime.**

## Périmètre et référence

- Profil exact: `enemy-029-siege-royal`, batch historique `batch-003`.
- Caste: adaptation originale du projet (`PROJECT_ADAPTATION`, `canonExact: false`), jamais présentée comme une caste canonique exacte.
- Autorités inspectées: fiche Siege Royal de `V56_ENEMY_REFERENCE_MATRIX.md`, override V56 `praetorian-large`, et rendu Praetorian local SHA-256 `783ed2dc52558d96bf47404deac959e6874a79e2b8a194f1ad96e596560e4c1c`.
- Verrou visuel appliqué: bipède lourd, crête royale stratifiée plus petite qu'une couronne de Queen, carapace noire/gunmetal et arêtes brun sombre, exactement deux bras et deux jambes digitigrades, quatre tubes dorsaux courts, queue unique reliée à une racine sacrée épaisse, aucun petit bras de Queen, équipement, canon ou bouclier.
- Fragment de référence dédié: `docs/references/V66_WORKLOT_001_SIEGE_ROYAL_REFERENCE.json`.

## Sources sélectionnées

| Clip | Receipt actif | SHA-256 source | Audit `audit_image` |
|---|---|---|---|
| idle | `idle-r3.event.json` | `a12e669ecfbd74c2de48dd489fad48f13c6e42f2a45264a4cdf3b58cb7bb7ed7` | 8 poses distinctes, aucune bordure touchée, extraction standard PASS |
| move | `move-r2.event.json` | `0037f1b3c4122167c34b0b0ca007af965ca7233ef364b80c3c6ee5f74c097428` | 8 poses distinctes, aucune bordure touchée, extraction standard PASS |
| attack | `attack-r4.event.json` | `36bc0974fe0ca4fd71095aacd769f918e8c5341571f9ae3e94f759cbe5ff3db7` | 8 poses distinctes, aucune bordure touchée, extraction standard PASS |
| death | `death-r3.event.json` | `d4c431b653bb0970c48865019eaf89d9e1e4bfac389203670bc7333b3dbe77d9` | 8 poses distinctes, aucune bordure touchée, extraction standard PASS |
| tail-strike | `tail-strike-r2.event.json` | `077720bedb662b154c7979f8360f2416e4858b6c00c10bf9c9c6f0646fd7002f` | 8 poses distinctes, aucune bordure touchée, extraction standard PASS |

Les cinq PNG sont `1774x887`, ratio exact 2:1, mode RGB opaque. Le fond est un matte magenta uniforme connecté aux bords; le normaliseur V66 devra le détourer lors d'une étape ultérieure autorisée. Les ratios de pixels strictement magenta vont de `0.929371` à `0.956368`; tous les bords externes sont magenta et aucun damier/alpha factice n'a été produit.

## Revue visuelle et animation

- **Idle:** respiration lourde en boucle, pieds ancrés, secondaire de queue réduit; l'itération r3 aligne l'enveloppe avec les autres clips.
- **Move:** cycle bipède lourd en huit phases alternées, sans déplacement quadrupède.
- **Attack:** anticipation, armé, extension des deux bras principaux, contact, suivi et récupération; aucun bras thoracique supplémentaire. La correction r4 translate uniquement la quatrième pose.
- **Death:** impact, fléchissement, chute puis corps immobile non gore; crête et queue restent attachées. La correction r3 translate uniquement la quatrième pose.
- **Tail-strike:** charge de hanche, enroulement, balayage, suivi et récupération; queue unique, complète et reliée dans les huit poses.
- Les cinq planches restent en profil droit. L'identité, la palette, la crête et la racine de queue sont visuellement cohérentes.

Mesure d'enveloppe technique (hauteur médiane/maximale des masques heuristiques, affectée par la pose): idle `137/140 px`, move `169.5/178 px`, attack `129/147 px`, death `89/158 px`, tail-strike `129/141 px`. La variation du move vient en partie de l'extension des jambes; elle doit néanmoins être contrôlée par une revue d'ancres physiques/post-génération avant toute normalisation finale. Ce rapport ne remplace pas cette calibration et ne déclare pas une échelle runtime acceptée.

## Provenance et rejets

- 14 appels réels au builtin OpenAI ImageGen: 5 receipts actifs et 9 receipts rejetés.
- Le wrapper builtin a exposé le PNG en data URL sans UUID fournisseur. Chaque `generationId` est donc honnêtement content-addressed sous la forme `openai-imagegen-sha256:<SHA exact du PNG>`; aucun UUID n'a été inventé.
- Rejets conservés sans modification dans `assets/openai/sprites/frames/v66/batch-003/enemy-029-siege-royal/rejected/`: `idle-r1`, `idle-r2`, `move-r1`, `attack-r1`, `attack-r2`, `attack-r3`, `death-r1`, `death-r2`, `tail-strike-r1`.
- Raisons documentées dans chaque receipt: contact de cellule, échelle inter-clips ou correction remplacée.
- Validation de provenance: 14 JSON lisibles, 14 chemins source présents, 14 SHA concordants, 14 prompts présents, un seul receipt sélectionné par clip, `canonExact: false`, zéro erreur.

## Limites explicites

Ces fichiers sont des **masters candidats non destructifs**. Aucun registre global, queue, état V66, manifeste runtime, atlas normalisé, ancre physique, scale review, acceptation ou asset du jeu n'a été modifié par ce lot. L'import, la calibration d'échelle, la revue d'ancres et l'acceptation runtime restent des étapes séparées.
