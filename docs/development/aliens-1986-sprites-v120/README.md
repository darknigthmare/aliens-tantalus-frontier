# Aliens (1986) — mobilier et appuis V120

Ce supplément ajoute **quatre PNG individuels** pour **six corps de mobilier** dans quatre salles. Une même armoire équipe la réserve et l’atelier ; le rack V119 déjà présent est réutilisé à Hadley. Le catalogue passe de **147 à 151 images distinctes**. Les poses sont statiques, avec un seul objet et une seule image par fichier.

[Galerie](index.html) · [Bible détaillée](bible.md) · [Inventaire complet JSON](bible.json) · [Manifeste](manifest.json) · [Prompts et essais](generation-ledger.json) · [Références](references.md) · [Vérifications](verification.json)

## Ce qui change dans les scènes

| Image | Salle / corps | Enveloppe maximale | Silhouette avec échelle uniforme |
| --- | --- | --- | --- |
| reserve-medical-counter | v109-reserve / medical-counter | 188 × 144.4 | 188.0 × 132.2963 |
| utility-storage-cabinet | v109-reserve / reserve-cabinet | 157 × 176.62 | 157.0 × 175.0475 |
| optics-workbench | v112-workshop / optics-bench | 184 × 136.38 | 178.8613 × 136.38 |
| utility-storage-cabinet | v112-workshop / optics-cabinet | 136 × 153.9 | 136.0 × 151.6335 |
| operations-storage-rack — réemploi V119 | v106-hadley / service-rack | 94 × 183.32 | 94.0 × 166.7381 |
| operations-display-bank | v107-operations / ops-display | 174 × 164.06 | 169.2251 × 164.06 |

Le comptoir médical et l’établi ont un plateau vide. Le terminal de réserve et le terminal optique sont dessinés séparément, après leur support, aux coordonnées et élévations existantes. Leur ordre tient compte de l’alpha d’occlusion du meuble. Si une image n’est pas chargée ou si le contrat d’un corps ne correspond pas, le renderer précédent reste disponible.

## Intégration et conservation

La couche [raster-furniture-v120.mjs](../../../modules/aliens-1986/v120/raster-furniture-v120.mjs) s’installe après V119. Elle partage le cache d’images V116 déjà utilisé par les couches V118 et V119. Les admissions portent sur les six corps exacts ; le cabinet partagé et le rack réutilisé restent des fichiers uniques.

Les PNG gardent leurs octets natifs, leur canal alpha et le pivot mesuré au milieu du bas de la silhouette d’alpha ≥128. L’ajustement est uniforme dans l’enveloppe `h + d × 0,86` ; aucune image n’est étirée ou redécoupée. La simulation V114, ses volumes, acteurs, portes, transferts, combats et sauvegardes restent inchangés par ce lot.

La bible V120 conserve les huit catégories, les 151 entrées d’images, les 25 scènes et leurs 202 solides/135 props/26 acteurs. La bible V119 publiée reste intacte. Les quatre poses refusées antérieurement et la vue frontale de sentinelle ne sont pas relancées. Les variantes narratives présentes mais non sélectionnées, les équipements encore isolés, les terrains procéduraux et les pertes historiques restent explicités.

## Qualité des images et limites

Six appels imagegen ont produit les quatre fichiers sélectionnés : quatre générations puis deux retouches ciblées. Le premier comptoir était coupé latéralement ; le premier établi avait une profondeur visible insuffisante pour les contacts du terminal. Les deux sorties non retenues sont documentées dans le journal et ne figurent pas dans le pack final.

Les images finales ont une silhouette complète. De petites franges de bord restent possibles à très fort agrandissement ; l’alpha des zones pleines est surtout 252–253/255 et n’a pas été normalisé. L’établi est vu de face avec un dessus profond et rectangulaire ; les trois autres dessus gardent une légère convergence. Les proportions réelles ajustées sont publiées dans le tableau au lieu de prétendre remplir exactement les volumes.

**La fidélité exacte 1:1 au film reste non validée.** Le concept Medlab et la présentation de photographies de plateau ont été inspectés ; les notices de plans d’Operations ouvrent des pistes de comparaison, sans certifier les quatre meubles du jeu.

## Vérification acquise et portée

Le script de QA prévu pour le navigateur a passé **16 contrôles sur 16** avec les PNG réels dans **Node et Canvas/Skia natif**, en utilisant des doublures déclarées pour le DOM et `fetch`. Cette exécution n’est pas Chromium. Les 54 tests unitaires du runtime ont également réussi. Les preuves et les captures sont consignées dans [verification.json](verification.json).

Les **six meubles** ont été inspectés dans les quatre captures natives de la réserve, de l’atelier, de Hadley et d’Operations, sans clipping observé. Les **six points de contact**, trois sur le contour inférieur de chaque terminal, se trouvent dans les polygones de leurs plateaux visibles, sur des pixels d’alpha 253. Le fallback de réserve produit **zéro canal différent** par rapport au rendu V119 de référence.

L’atelier reste sombre dans son état d’inspection natif ; il n’a pas été éclairé artificiellement pour la capture. Les diagnostics de bord inférieur du tablier indiquent un décalage de **+7,95 unités pour le comptoir** et **−17,16 pour l’établi**, par rapport à la hauteur frontale du solide. Ce repère de rail/tiroir est distinct des contacts du terminal, qui ont été vérifiés sur le plateau réel. Ces écarts de forme restent documentés pour la revue artistique.

Au moment de cette inspection, **la CI Chromium V120 n’a pas encore été exécutée**. Les contrôles natifs et les tests unitaires ne constituent pas une campagne complète jouée, ni une certification de fidélité au film.

```sh
npm run test:dlc:aliens1986
npm run check:dlc:aliens1986
```
