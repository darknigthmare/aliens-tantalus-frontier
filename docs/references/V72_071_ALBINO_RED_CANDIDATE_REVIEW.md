# V72 — QA des quatre nouvelles sources Albino Red071

2026-09-05. Profil `enemy-071-albino-red-xenomorph`, `batch-005`. **Atlas candidat livré ; aucune acceptation ou intégration.** Cette passe ne génère pas d'image et ne modifie aucun master, prompt, événement, registre, queue ou fichier runtime.

## Fichiers produits et tests

- Atlas : `assets/openai/sprites/normalized/enemy-profiles-v66/enemy-071-albino-red-xenomorph.webp` — WebP RGBA lossless1024×2048,32 poses distinctes,4×8 cellules256, garde16.
- Quatre WebP : `assets/openai/sprites/normalized/enemy-clips-v66/enemy-071-albino-red-xenomorph/{idle,move,attack,death}.webp`.
- Cinq GIF : `assets/openai/sprites/previews/v66/enemy-071-albino-red-xenomorph/` (quatre clips et `all.gif`).
- Métadonnée : `assets/openai/sprites/metadata/v66/enemy-071-albino-red-xenomorph.json`.
- Contact numéroté et reçu JSON : `docs/references/v66-batch-005-atlas-review/enemy-071-albino-red-xenomorph.{jpg,json}`.

Les quatre prompts exacts `docs/references/v72-enemy-gap-prompts/v72_071_*.txt` ont été lus. Les quatre sources ont été réellement affichées, ainsi que les clips normalisés sur fond sombre et la comparaison agrandie move/1 avec move/5 sur fond clair. L'affichage de diagnostic se fait en mémoire via PIL ; les pixels sources ne sont pas réécrits. Pas de playback runtime ni de test de collision exécuté ici.

```powershell
py scripts/process-v66-enemy-batch.py --profile enemy-071-albino-red-xenomorph --safe-reassign-cell-fragments --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe --remove-magenta-spill
py scripts/process-v66-enemy-batch.py --profile enemy-071-albino-red-xenomorph --check
py scripts/render-v66-batch-atlas-review.py --batch batch-005 --profile enemy-071-albino-red-xenomorph
```

Résultat :32 poses, zéro finding de l'atlas, zéro acceptation automatique. Le contrôle reproduit les pixels en mémoire et vérifie sources, hashes, options, garde et égalité des clips avec l'atlas.

## Mouvement, identité et mort

| Critère | Observation et décision |
|---|---|
| Identité | Warrior ivoire/rose/cavités grises, dôme côtelé, deux bras, deux jambes et queue complète reconnaissables. Adaptation Albino du design projet019, pas un modèle canonique distinct certifié1:1. |
| Crâne | Même grammaire de dôme et proportions globales dans les quatre contacts. Les rotations/inclinaisons de tête pendant attaque/mort sont des poses, pas une mesure d'échelle. Aucune certification métrique rigide inter-clips n'est produite sur cette seule observation. |
| idle | Huit variations de garde/respiration, pieds stables, sujet entier. Base candidate de continuité. |
| move | Course nettement plus ample que019, avec flexion/poussée/poses en suspension. **Mais poses1 et5 présentent presque la même silhouette de jambes** — genou très en avant et jambe opposée étendue derrière — au lieu d'une demi-foulée opposée clairement lisible. L'alternance proche/lointaine n'est pas validée. Première moitié légèrement plus dorée, seconde plus rose : stabilité de palette à revoir. |
| attack | Flexion préparatoire, transfert du bassin, longue fente, suivi et retour réellement visibles. Amélioration par rapport au bras seul de019. Les débordements source sont traités sans couper la queue ; calage de l'impact runtime restant. |
| death | Perte d'appui, genou, chute, corps latéral couché dans les dernières poses ; aucune récupération ni idle terminal. Toute l'anatomie est conservée après extraction. La pose5 reste très proche du bord de sa cellule source mais n'est pas coupée. |
| Racines | Les32 placements restent `pending-body-root-review`. En particulier, les poses aériennes move/4 et move/8 nécessitent un plan de sol cohérent, **pas le point le plus bas de leur silhouette**. Le centrage de bbox candidat ne convient pas à leur intégration. |

Une course ample n'est pas automatiquement une course correctement alternée. Reprendre `move` avec l'échange explicite des jambes proche/lointaine en1/5, contre-balancement des bras et palette constante ; garder les quatre sources actuelles comme preuves historiques. Ne pas créer l'alternance par miroir, permutation ou déplacement des images existantes.

## Débordements : conservation démontrée, pas recadrage arbitraire

Idle/move/death passent l'extraction stricte. Attack est refusé en mode strict car les queues des poses4/8 traversent vers les cellules précédentes. L'option existante de réattribution connectée passe, avec ces deux transferts seulement (poses numérotées1–8) :

| Pose | Pixels réattribués | Composante totale | Part dans la bonne cellule | Excursion des bornes locales |
|---|---:|---:|---:|---:|
| attack/4 | 1937 | 27782 | 93,0279% |44px à gauche |
| attack/8 | 1078 | 27446 | 96,0723% |20px à gauche |

Les deux composantes restent au-dessus de90% de propriété et sous15% d'excursion ; coordonnées et hashes RGBA sont dans la métadonnée. Les pixels sont réattribués à leur vraie pose, jamais supprimés ou redessinés. Les masters ne respectent donc pas partout la consigne de30px de gouttière/70% central, même si l'atlas final respecte sa garde16 après mise à l'échelle commune.

## Alpha et échelle

Les sources sont RGB sur fond magenta, pas une alpha native. Détourage intérieur strict :1893 pixels cœur +1777 pixels frange bornée. Despill après redimensionnement :195 pixels neutralisés, zéro restant selon le détecteur strict. L'inspection clair/sombre ne montre pas de rectangle blanc parasite ; cela ne certifie pas tous les pixels de teinte proche du corps.

Échelle globale de pack0,507936508, aucun facteur inter-clips appliqué (`sourceScaleByClip` vaut1). Ce facteur vient de la place nécessaire aux poses complètes, pas d'une validation anatomique/world-scale. Aucune racine ou mesure du profil019 n'est recyclée. La course devant être reprise, signer32 racines sur cette révision serait prématuré ; ses appuis aériens et son échange de jambes restent explicitement ouverts.

## Empreintes et statut réel

| Fichier | SHA-256 |
|---|---|
| idle source | `21dd3d8b8157797fadad9fe1d07e43361af9249af509edb25b41b4318ccb6bae` |
| move source | `01419ffd04eebef58d5a1d17929499d7bad7f78acdf9ce6cccda5a0932fef5c5` |
| attack source | `6cda591520f436b597691b48463968704f58a13fd30fa47d89ecb96409dd12b7` |
| death source | `eb81fe89237b19a0e151429ebe9663187e7bd6788841104bf95d9e0c70379daa` |
| Atlas | `8f875312a425789778aaa8e8252b9b6e8548ef1bdcb9da2d22d39a86b2f1c9cf` |
| Métadonnée | `7954e307a950ed449f1c7b9befc685940134338f242d2a2da8bb0e5909b59491` |

Lors du premier contrôle de cette passe, `getJobStatus` renvoyait encore `ready-generation`,0/4 événements attestés malgré les quatre sources présentes. Le parent gère séparément l'enregistrement des prompts/générations ; ce rapport ne les invente pas. L'atlas reste `pending-visual-review`, `runtimeIntegrated:false`, `canonExact:false`. Toute nouvelle source invalide ses empreintes et impose reconstruction/QA, sans réutiliser ce succès technique pour la révision suivante.
