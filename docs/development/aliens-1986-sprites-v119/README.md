# Aliens (1986) — mobilier et surfaces V119

Ce supplément ajoute **six PNG individuels**, pour **sept placements** dans quatre salles : deux lits et une armoire du Medlab, un casier de réserve, un rack et une table d’Operations, et la table du mess du Sulaco. Le catalogue passe de **141 à 147 images**. Chaque fichier contient un seul objet et une seule pose statique.

[Galerie](index.html) · [Bible détaillée](bible.md) · [Bible structurée](bible.json) · [Manifeste](manifest.json) · [Générations et inspections](generation-ledger.json) · [Références](references.md) · [Vérifications](verification.json)

## Ce que voit le joueur

Les meubles ciblés utilisent leurs images quand elles sont décodées. Le repas, le couteau du mess et le terminal d’Operations sont dessinés après leur table, afin de rester visibles sur le plateau. L’ancienne profondeur de tri les faisait passer avant leur support.

La transparence d’occlusion du moteur est conservée : lorsqu’un meuble masque le joueur, le meuble et ses accessoires s’atténuent ensemble. Si une image est absente, en cours de chargement ou invalide, le dessin précédent reste disponible.

| Sprite | Salle / corps existant | Enveloppe projetée maximale |
|---|---|---:|
| `medlab-bed` | `v106-medlab` / `bed-west` | 160 × 105,64 |
| `medlab-bed` | `v106-medlab` / `bed-east` | 145 × 112,52 |
| `medlab-storage-cabinet` | `v106-medlab` / `med-cabinet` | 94 × 195,38 |
| `reserve-service-locker` | `v109-reserve` / `service-locker` | 110 × 206,26 |
| `operations-storage-rack` | `v107-operations` / `ops-rack` | 133 × 190,50 |
| `sulaco-mess-table` | `v114-sulaco-mess` / `v114-sulaco-mess-body-0` | 238 × 122,10 |
| `operations-command-table` | `v107-operations` / `ops-table` | 238 × 128,98 |

## Intégration

La couche `modules/aliens-1986/v119/raster-furniture-v119.mjs` est installée après V116 et V118 dans le HTML dérivé par `scripts/derive-aliens1986-raster-v116.mjs`. Les trois versions partagent le même cache d’images borné. Seuls les identifiants et géométries exacts du tableau sont admis.

Le module conserve l’échelle uniforme et ancre chaque meuble au milieu de son bord avant, au sol. Aucun étirement ni redécoupage des PNG n’est effectué. Les collisions, les coordonnées des salles, les points de transfert, les portes, les règles de combat, les identifiants et le schéma de sauvegarde 114 restent ceux du module existant.

Les trois manifestes V116/V117/V118, les 141 entrées précédentes, les renderers V116/V118 et les 1 159 fichiers historiques V114 restent identiques. La succession du dérivateur est déclarée explicitement ; les nouvelles admissions n’ouvrent que les six PNG et les fichiers source de ce supplément. La bible, la galerie et les journaux ne sont pas copiés dans le build public.

## Proportions et limites

L’enveloppe physique sert de limite maximale, pas de consigne d’étirement. Par conséquent, les nouvelles silhouettes ne remplissent pas exactement toutes les boîtes de collision : le rack Operations mesure environ 107,40 unités de large pour un volume de 133 ; le lit est mesure environ 145 × 81,62 dans une enveloppe de 145 × 112,52 ; la table Operations mesure environ 238 × 104,14 dans une enveloppe de 238 × 128,98. Ces écarts sont explicitement conservés pour la revue artistique. La vérification des accessoires porte sur la surface visible du plateau, pas uniquement sur la boîte englobante.

Les images conservent leur alpha natif, principalement 252–253 dans les zones pleines, et leurs octets d’origine. Aucune normalisation destructive ou retouche de pixels n’a été appliquée. Le lit s’appuie sur une photographie de tournage ; les autres meubles sont des adaptations des besoins et de la direction visuelle du projet.

**La fidélité exacte 1:1 au film n’est pas certifiée.** Aucun cycle d’animation ou nouveau système de gameplay n’est ajouté. Les quatre poses précédemment refusées, la face frontale de sentinelle, les fonds encore procéduraux et les sources historiques introuvables restent ouverts dans la bible. Les six images nouvelles ne sont pas présentées comme une récupération de fichiers anciens.

## Contrôles reproductibles

Les quatre salles ont été rendues avec le renderer complet et les PNG réels dans un Canvas natif : [Medlab](qa-canvas-v106-medlab.png), [Réserve](qa-canvas-v109-reserve.png), [Operations](qa-canvas-v107-operations.png), [mess du Sulaco](qa-canvas-v114-sulaco-mess.png). Les journaux `qa-canvas-*.json` enregistrent les appels de dessin correspondants. Les sept meubles sont visibles et les neuf points d’appui échantillonnés des trois accessoires se trouvent dans les surfaces examinées des plateaux, sur des pixels d’alpha 253/255.

Ces rendus sont des sessions d’inspection préparées, obtenues avec `@napi-rs/canvas`. Ils ne valident pas un parcours joué ni Chromium. Le navigateur manque dans l’environnement local et son téléchargement a échoué avec HTTP 403 ; la recette Playwright reste une étape distincte de la CI. Les scénarios d’occlusion et de fallback sont couverts par les tests unitaires, mais leur comparaison de pixels dans Chromium n’est pas revendiquée ici.

```sh
npm run test:dlc:aliens1986
npm run check:dlc:aliens1986
python3 -B scripts/qa-aliens1986-furniture-v119.py --source-root . --output /tmp/aliens1986-furniture-v119
```

Le test de mobilier utilise les vraies scènes, sessions et renderers avec des doublures Canvas/Image déclarées. La QA Python doit utiliser Playwright et Chromium pour vérifier les PNG réels ; son seul précontrôle ne constitue pas une réussite navigateur. Les résultats effectivement obtenus sont consignés dans `verification.json` et dans la PR. Les contrôles complets du dépôt et le build de production appartiennent à la CI et ne sont pas assimilés à une validation locale de l’ensemble de Tantalus.
