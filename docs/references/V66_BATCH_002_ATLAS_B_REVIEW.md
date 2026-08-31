# V66 lot 002 — atlas candidats 014 à 020

Date : 2026-08-31. Revue : Codex complete_variants. Périmètre : sept profils, 28 sources actives, 224 poses réellement dessinées. Aucun profil accepté ni intégré par cette revue.

## Livrables et contrôle technique

Les sept atlas RGBA lossless WebP, 28 WebP de clips, 28 GIF de clips, sept GIF combinés et sept métadonnées ont été produits avec le normaliseur existant. Sources 1774 × 887 ; atlas 1024 × 2048, cellules 256 × 256, garde 16 px. Aucune pose inventée, interpolée ou dupliquée par le traitement.

Les 28 sources ont été affichées en contacts par profil avant traitement. Palettes constatées : Boiler ivoire/olive/jaune, Prowler rouille/noir, Burster olive/jaune, Monica charbon/gris, Specimen Six bronze/noir, Red rouge/noir, K-Series or/jaune. Les zones fuchsia sont le fond de génération, pas une couleur d'identité ; les tons sombres non prouvés restent intacts.

Commande exécutée séparément pour chacun des sept profils :

```powershell
py scripts/process-v66-enemy-batch.py --profile <profileId> --safe-reassign-cell-fragments --remove-enclosed-magenta-matte --remove-enclosed-magenta-aa-fringe
py scripts/render-v66-batch-atlas-review.py --batch batch-002 --profile <profileId>
py scripts/process-v66-enemy-batch.py --profile <profileId> --check
```

Les sept checks ont réussi après la révision K-Series attack-r4 et avant fusion des nouvelles racines : 32 poses distinctes par profil, zéro finding de cellule, provenance/source/hashes/clip equality et pixels lossless vérifiés. Une fusion du registre global d'ancrage impose une reconstruction et un nouveau check ; ce résultat ne dispense pas du contrôle final du root.

Les 28 GIF ont aussi été décodés : chacun contient huit images. Idle boucle à 170 ms/image, move boucle à 80 ms/image, attack joue une fois à 80 ms/image, death une fois à 100 ms/image ; cette quantification GIF correspond aux contrats 6/12/12/10 fps du normaliseur. Les poses ordonnées et leurs transitions ont été examinées dans les contacts ; ce n'est pas une validation de déplacement, collision ou lecture dans le moteur de jeu.

## Résultats visuels par profil

| Profil | État | Réserves concrètes observées |
| --- | --- | --- |
| 014 Boiler | Candidat normalisé, racines en attente | Identité pâle et pustules conservées, orientation droite ; densité des pustules moins forte que la référence de jeu. Mouvement peu ample. Attaque avec flexion/approche mais pressurisation biologique pas encore très lisible. Quelques pixels fuchsia sombres restent au cou et dans les membres, notamment move/7. |
| 015 Prowler | Candidat normalisé ; ancrage partiellement mesuré, non validé | Quadrupède rouille, tête et lame caudale cohérentes. Bond attaque/3–5 reconnaissable mais plan de sol et raccord d'atterrissage non certifiés. Longue queue affectant le centrage de l'ancien pivot. Restes sombres du fond et contact de certains doigts à reprendre lors de l'acceptation. |
| 016 Burster | Candidat normalisé ; 32 racines physiques revues dans fragment B | Quadrupède olive, blisters jaunes conservés ; quatre membres et queue présents. Appuis observables dans les 32 poses. Quelques résidus fuchsia dans les chevauchements et silhouettes fines sur fond sombre. Attaque montre compression/pression, pas une détonation finale ; ne pas annoncer l'effet de dégâts comme produit par ces images. |
| 017 Monica-line | Candidat normalisé, racines en attente | Cohérence charbon et dôme, mais attaque/4–5 avec bras très rectiligne ; marche peu ample. Petits résidus colorés dans les membres. Lignée d'adaptation, pas certification du personnage canonique unique. |
| 018 Specimen Six-line | Candidat normalisé, racines en attente | Queue de move/3–4/7–8 plus serrée/courte que les autres poses : continuité encore à reprendre. Résidus fuchsia visibles dans attack/2 et /4. La révision actuelle respecte les cellules mais cela ne prouve pas une animation fluide. Aucun nouvel appel n'a été consacré à cette source dans cette passe. |
| 019 Red Xenomorph | Candidat normalisé, racines en attente | Rouge/Warrior cohérent ; marche faible, anticipation/attaque avec peu de transfert de poids. Racines et raccords idle/move/attack à contrôler. Aucun changement de source par cet agent. |
| 020 K-Series yellow | Candidat normalisé, attaque améliorée par ImageGen ; racines en attente | Attack-r4 a maintenant flexion, anticipation, fente et récupération lisibles ; proportions des bras beaucoup plus plausibles que les anciennes tentatives étirées. La nouvelle emprise impose un pack-scale commun plus petit, pas une échelle par pose. Petits restes fuchsia à attack/3 et death/7 ; raccords et ancrage pas encore acceptés. |

Tous les contacts complets sont sous `docs/references/v66-batch-002-atlas-review/<profileId>.jpg`. Les métadonnées sont sous `assets/openai/sprites/metadata/v66/<profileId>.json`, les atlases sous `assets/openai/sprites/normalized/enemy-profiles-v66/`, les clips sous `assets/openai/sprites/normalized/enemy-clips-v66/<profileId>/`.

## Détourage mesuré, pas élargissement aveugle

Les seuils existants sont inchangés : cœur magenta strict assorti au fond extérieur prouvé ; frange limitée à deux pixels source autour de ce cœur ; transfert entre cellules seulement par composante connectée, propriétaire ≥90 %, excursion ≤15 %. Les défauts restants ne sont pas effacés par un seuil plus large.

| Profil | Cœur magenta | Frange bornée | Total retiré |
| --- | ---: | ---: | ---: |
| 014 | 3664 | 2576 | 6240 |
| 015 | 13648 | 3626 | 17274 |
| 016 | 15881 | 6215 | 22096 |
| 017 | 6088 | 3991 | 10079 |
| 018 | 4671 | 3813 | 8484 |
| 019 | 1602 | 1236 | 2838 |
| 020, attack-r4 inclus | 12376 | 1564 | 13940 |

Les masques et empreintes exactes figurent dans chaque métadonnée. Les masters restent inchangés par normalisation. Le grand défaut violet entre bras et cuisse de K-Series death/1 disparaît dans le détourage strict inspecté : aucune régénération inutile de death.

## Correction ImageGen réellement effectuée

Un seul appel OpenAI ImageGen intégré dans cette passe : K-Series attack-r4, `exec-15e080e0-75c2-4d01-b3ff-37f453070551`. SHA-256 source : `d6e5a210f54637b7f26c43d451ad4788552655daa03268e561adebd627a57e98`.

Prompt sauvegardé avant appel : `docs/references/v66-batch-002-prompts/enemy-020-k-series-yellow-xenomorph/attack-r4.txt`. Événement sauvegardé immédiatement : `docs/references/v66-batch-002-events/enemy-020-k-series-yellow-xenomorph/attack-r4.json`. Ancien master conservé : `assets/openai/sprites/frames/v66/batch-002/enemy-020-k-series-yellow-xenomorph/rejected/attack-understated-r3.png`. Le root importe la preuve dans STATE ; cet agent ne modifie pas STATE.

## Racines physiques : ce qui est réellement revu

Fragment `docs/references/V66_BATCH_002_ANCHORS_B.json`, coordonnées de cellule source nominale, références et empreintes de tous les clips conservées.

- Burster : 32 cages thoraciques derrière l'épaule avant observées individuellement, projection sur appui de patte ou corps effondré, précision déclarée ±10 px source. Les poses de mort ont été corrigées après contrôle des overlays pour sortir les repères de l'avant-bras replié. Les quatre overlays finaux ont été inspectés. `status: reviewed` ne signifie ici que revue des racines, pas acceptation de l'atlas.
- Prowler : 32 repères de thorax mesurés ; 29 appuis revus. Les trois phases aériennes attack/3–5 restent `reviewed: false` pour leur plan de support, avec `bodyLandmarkReviewed: true` et `supportPlaneReviewed: false`. Le profil reste `pending-flight-support-review` et ne doit pas être fusionné comme profil physiquement validé. L'estimation y=384 issue des poses d'anticipation est documentée, pas promue en preuve.

Overlays : `docs/references/v66-batch-002-anchor-review/enemy-015-prowler/` et `enemy-016-burster/`. Créés depuis le fragment par `render-v66-source-anchor-review.py --review ...` ; zéro pixel source modifié.

Les défauts de fidélité, de raccord, d'alpha et d'appui restent explicitement ouverts. Zéro acceptation automatique, zéro insertion runtime, zéro modification de verrou de référence, zéro commit dans ce sous-travail.
