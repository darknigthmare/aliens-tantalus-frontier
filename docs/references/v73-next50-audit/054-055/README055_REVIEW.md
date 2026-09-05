# V73 — Albino Chestburster 055 : revue et intégration bornée

Date : 2026-09-05. Profil : `enemy-055-albino-chestburster`.

## Décision et portée

Les quatre sources dédiées existantes et leurs 32 poses normalisées ont été inspectées dans leur entier, puis pose par pose avec repères anatomiques et mesures. Aucun dédoublement anatomique ni défaut de transparence bloquant n'a été observé pour 055. L'intégration de sa plaque et de son contrat de morsure est implémentée et ses tests ciblés passent.

Ce document est une preuve de revue des images, de métrologie et de combat unitaire. Il ne certifie ni une reproduction canonique 1:1, ni la totalité du lot de 50, ni une recette commerciale complète. La variante albinos est une adaptation de projet du Chestburster, pas une identité officielle distincte attestée par les références. `canonExact` reste `false` et `referenceStatus` vaut `PROJECT_ADAPTATION`.

La recette animée au navigateur, l'acceptation centrale, la synchronisation STATE/manifest, le build et la publication sont coordonnés par l'agent parent. Aucun de ces registres ni aucune publication n'a été modifié par cette sous-tâche. Au moment du contrôle technique ci-dessous, la métadonnée de normalisation conserve volontairement `pending-visual-review` et `runtimeIntegrated: false` ; l'entrée runtime est prête pour la finalisation centrale autorisée. Il faut terminer cette synchronisation avant de publier, sans renormaliser les octets acceptés à l'aveugle.

## Sources actives et identité

Répertoire des sources : `assets/openai/sprites/frames/v66/batch-004/enemy-055-albino-chestburster/`. Chaque image comprend huit poses, sur une grille 4 × 2. Les sources originales n'ont pas été retouchées par cette revue.

| Clip | Observation chronologique | SHA-256 de la source active |
| --- | --- | --- |
| idle | Relèvement puis abaissement de la tête ; un seul corps serpentin côtelé, sans membres ni yeux apparents. Le mouvement dépasse une simple respiration, mais reste cohérent avec ce jeune organisme. | `95a850efa5a6a37da9501d6d2e2663e53e28f86c809f4f07550ce162c1cfa182` |
| move R2 | Ondulation visible du corps et de la queue, sans bras ni jambes ajoutés ; progression des courbures d'une pose à l'autre. | `6439f1b59768e83429973f3b7ded04c5715598cd29562c86ed2aec5d404d3006` |
| attack | Recul cervical, élévation, morsure basse/contact à la pose 5, puis récupération. Aucun bond n'est ajouté par le gameplay. | `c981028002d0331f32ea704685879d67df7a21fe8afd37297d88c50eb9a92e27` |
| death | Affaissement puis corps terminal aplati ; pas de réapparition d'un adulte ou d'une autre espèce. | `aca6ba398634f3dd7940acd63ac3599160bbcbe07288b6c38b02b156c129f887` |

Le mouvement R1 rejeté reste archivé dans `assets/openai/sprites/frames/v73/enemy-055-albino-chestburster/move-r1-rejected.png`, SHA-256 `b565116e756aedbaa93efafd7740cbd6d7628301e4c2dc47051722e7403a5327`. Il n'entre pas dans l'atlas actif.

Cette revue décrit une inspection chronologique des images et des planches de contact. Elle n'est pas présentée comme une observation continue en jeu ; les éventuelles captures `browser-055-*` sont produites séparément par le parent.

## Racines physiques, échelle et alpha

- 32 racines manuelles : repère ventral cervical, sous la jonction tête/corps. Il ne s'agit jamais du centre automatique d'une boîte englobant la queue. L'incertitude déclarée est moyenne, ±10 pixels source, notamment sur les poses terminales aplaties.
- Huit cordes crâniennes mesurées : bord postérieur du crâne vers lèvre supérieure, en excluant la mâchoire mobile, deux poses peu tournées par clip. Incertitude des extrémités ±5 pixels source. Les overlays annotés conservent les images sources et montrent les points réellement observés.
- Facteurs de recalage par clip : idle `1`, move `1.068719`, attack `1.078524`, death `1.007652`. Ils sont appliqués une seule fois aux sources immuables, puis à l'échelle commune de placement `0.326725184`. Aucun double redimensionnement.
- Atlas RGBA sans perte : 1024 × 2048, 4 colonnes × 8 lignes, cellules 256 × 256, garde 16, pivot de sol `(128, 240)`, orientation native droite.
- Première pose idle : enveloppe opaque alpha ≥16 `[43,217,157,240]`, soit 114 × 23 pixels natifs, queue comprise. Cette enveloppe est comparable au 003 calibré ; ce n'est pas la largeur de la hitbox ni une mesure canonique en mètres.
- 32 poses distinctes, bords de cellule transparents, erreur de rendu des racines inférieure à un pixel et aucun pixel magenta au seuil strict du normaliseur.
- Le diagnostic violet plus large trouve trois pixels isolés au total (idle 8, attack 2, death 7). Ils n'ont pas produit de halo gênant observé. Ce diagnostic n'autorise pas une suppression globale de tissus rosés.

Preuves autonomes : `enemy-055-albino-chestburster.anchor-review.fragment.json`, `enemy-055-albino-chestburster.scale-review.fragment.json`, les quatre fichiers `*-root-review.jpg`, `enemy-055-albino-chestburster-normalized-contact.png` et `enemy-055-albino-chestburster-normalized-metrics.json` dans ce dossier. Le comparatif `base002003-albino054055-native-registration.png` est en pixels natifs d'atlas, pas une capture à l'échelle du monde.

| Preuve | SHA-256 |
| --- | --- |
| Atlas WebP final | `c2ed130649fc57aeaf0509376f7601eb8987c853914595e5231689f636709ede` |
| Métadonnée technique avant acceptation centrale | `b8b8deef9aa8eee92183153a570fe654a8709393347a6fdac9dc9b80e05cee42` |
| Fragment de racines | `e19e276f7d71c8a7519f8742770d259f3b62c07dd97ba8b8873722dcefa66f88` |
| Fragment d'échelle | `ed6bf7aca320625b353af1a91e2730b285079160af3deb8762403d5baf15970e` |

Le JSON de mesures est un instantané de normalisation antérieur à l'acceptation, ce qui explique `artAccepted: false` et `runtimeIntegratedByThisAudit: false`. Une acceptation centrale ultérieure peut changer le hash de la métadonnée, mais ne doit pas changer silencieusement le hash de l'atlas, des sources ou des fragments de mesure.

## Contrat runtime testé

L'ID exact 055 reçoit son propre WebP ; il n'emprunte pas celui du 003 et n'accepte pas le 054 par similitude de nom. Rendu isotrope 188 × 188 pixels monde, corps de collision 35 × 20 comme 003, pivot de sol conservé et miroir uniquement lorsque le déplacement exige une orientation gauche.

Morsure `albino-low-bite` : huit poses à 12 images/s, contact unique à `4/12 s` (pose 5), récupération jusqu'à `8/12 s`, cooldown `1.15 s`, portée de morsure 56, arrêt d'approche 28, aucun déplacement de bond. La collision représente le corps vulnérable, pas toute la queue décorative.

Fichiers runtime modifiés : `src/enemy-profile-assets-v66.js`, `src/enemy-profile-geometry-v66.js`, `src/enemy-batch-combat-v66.js`. Aucun changement au moteur central, à la navigation, aux dégâts génériques ou aux autres profils n'était nécessaire.

La nouvelle suite `tests/enemy-albino-chestburster-v73.test.mjs` contient 29 tests : hash/identité/dimensions, impact unique synchronisé, récupération/cooldown, murs/portes/couvertures avant et pendant l'attaque, couvert détruit, déplacement contre obstacle mince, cible joueur/coop/PNJ verrouillée, annulation sur cible à terre/en conduit/passée derrière. Elle utilise les vrais prototypes V51 et V52 de production, dont leurs colliders, leurs sélections de cible et leur support au sol ; seuls la livraison des événements et le comptage des dommages sont capturés.

Les suites existantes couvrent également les 32 cellules, le rendu/pivot, le premier rendu tardif, le chargement paresseux, la reprise de sauvegarde sans double impact et l'absence d'emprunt par une variante non acceptée.

Résultat vérifié : **149 tests ciblés, 149 réussis, 0 échec, 0 ignoré**.

```powershell
node --test tests/enemy-albino-chestburster-v73.test.mjs tests/enemy-batch-combat-v66.test.mjs tests/enemy-batch-animation-integration-v66.test.mjs tests/enemy-batch-level-regression-v66.test.mjs tests/enemy-v66-production-access.test.mjs tests/enemy-profile-registry-v66.test.mjs
py -3 scripts/process-v66-enemy-batch.py --profile enemy-055-albino-chestburster --check
```

Le dernier contrôle de normalisation relit les fragments autonomes et retourne 32 poses, zéro anomalie, **zéro acceptation automatique**. La validation technique et les tests ne remplacent pas la décision artistique ni la recette finale en jeu.
