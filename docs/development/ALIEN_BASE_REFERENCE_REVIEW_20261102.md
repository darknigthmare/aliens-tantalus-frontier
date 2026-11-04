# Références Alien_base — instantané documentaire du 2 novembre 2026

Les [deux projections](ALIEN_BASE_SOURCE_SNAPSHOTS_20261102.json) conservent les apports documentaires des PR Tantalus [#30](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/30) et [#31](https://github.com/darknigthmare/aliens-tantalus-frontier/pull/31). Elles ne créent aucune API active, aucune entrée de combat ou de sauvegarde, aucun art validé et aucune certification 1:1. Les anciens classeurs et les preuves V177/V178 restent distincts et inchangés.

## Sources et quantités

| Projection | Source exacte | Périmètre observé |
| --- | --- | --- |
| PR #30, tête 59565c39b1636461326c851dcb3b83f807bbc2b0 | Alien_base PR2, export du commit b5f38148623d99dc9b6e0f83ad665ceaca963fcd, `exports/alien-base-public-v1.js` | 857 enregistrements, dont 773 lignes du [CSV original](Alien_Base_Import_Status.csv). Les 70 références et 14 manques véhicules sont hors CSV. |
| PR #31, tête 13bfd54893337ed485895d5f029f7c5846cda4f3 | Alien_base commit 3f124325102a199a6691a41c8b288ea95f61da8c, `data/entities.v1.json` et `data/bindings.v1.json` | 1 217 correspondances d’IDs historiques, 252 identités minimales, 8 groupes. |

Le registre source 3f124 contient 486 entités au total ; seules 252 sont référencées dans la projection Tantalus conservée ici.

Le CSV de 773 lignes contient 534 références dans les huit catégories initiales, puis 52 familles ennemies, 29 œuvres et 158 cartes TCG. Ses 773 cellules de fidélité restent «non». Ces quantités se recoupent avec des registres d’autres projets et les classeurs existants ; elles ne sont pas 773 nouveaux contenus manquants ou un pourcentage de jeu terminé. Le source commun est ici l’autorité de provenance de la projection, sans validation indépendante de chaque fait de franchise.

## Alignement encore ouvert

Le rapprochement avec le catalogue de `main` Tantalus `d41b5fc120da2e7a5938308f9d3c852d20e53cc5` relève [dix correspondances non présentes dans l’instantané PR #31](Alien_Base_Current_Mapping_Gaps_20261102.csv) : neuf armes et un véhicule déjà présents dans le catalogue local. Il s’agit d’un manque de mapping commun, sans conclure à l’absence de gameplay ou d’assets. Leur identité commune exige un binding explicite de la source, en conservant les IDs et les statistiques de Tantalus.

Les entrées AFE2 `siren`, `gasbag` et `wey-yu-worker` restent explicitement non résolues par la source. Les espaces d’IDs des PR #30, #31, #32 et #33 ne sont pas interchangeables. Aucun rapprochement par simple nom, compte ou silhouette n’est admis par ce document. Une future façade unique doit conserver la provenance et les différences d’œuvre.

## Limites des preuves

L’export PR #30 est identique octet pour octet à l’export source cité. Les bindings, non-résolus et 252 identités projetées de PR #31 correspondent au commit source cité. Les deux PR source Alien_base étaient ouvertes lors de leur lecture ; aucun merge n’est déduit. Les sept tests ciblés de PR #30 passent localement sur ses fichiers exacts. Sa CI de publication échoue avant le navigateur ; cela ne constitue ni un test de jeu réussi ni une qualification de sa fidélité. La PR #31 inactive conserve une release verte et deux recettes natives rouges sur sa tête exacte, sans transfert au candidat qui importerait ces documents.

Aucune archive primaire Blackout/Earth, aucun classeur brut encyclopédie et aucun asset V10 n’a été récupéré par cet import. Les URLs sont des repères documentaires ; leur présence ne vaut ni licence de redistribution ni comparaison visuelle humaine. Zéro clôture artistique, zéro validation humaine et zéro approbation 1:1 sont ajoutés.
