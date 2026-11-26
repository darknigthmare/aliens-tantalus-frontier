# Références et limites — Aliens (1986), V121

Les quatre images sont des adaptations industrielles pour des volumes déjà définis dans le jeu. La recherche de fidélité repose sur les sources de production inspectées, sans revendiquer l’identité exacte d’un accessoire lorsque la preuve manque. Toutes les entrées gardent `filmFidelityValidated: false`.

## Source primaire inspectée pour V121

- [Harry Harris Collection — Atmosphere Processor set dressing](https://propstore.com/product/aliens-1986/lot-655-harry-harris-collection-atmosphere-processor-set-dressing/) — Coque arrière de téléviseur en plastique, peinte gris clair, reliefs étagés, rangées de fentes de ventilation, petites fixations et usure de peinture. La notice identifie un élément de décor du processeur. Ce panneau ne prouve ni l’existence dans le film ni la silhouette des quatre objets du jeu. Les dimensions de la fiche concernent cet accessoire précis. Les machines V121 et leurs matériaux métalliques restent des adaptations ; les marquages de la référence ne sont pas reproduits.

L’image de référence a été consultée visuellement avant les générations. Son empreinte SHA256 est `0ab6c782728950862830a88a705e08a66c48b4cf9417800562c2cd07eab0f59d` (64 141 octets). Les panneaux gris, fixations, reliefs moulés et fentes de ventilation sont effectivement observés. Les marques visibles sur l’objet de vente ne sont pas reproduites. Ni ses mesures ni sa provenance ne permettent d’affirmer que le générateur, la pompe, l’échangeur ou le socle du jeu sont des répliques 1:1.

## Références de production déjà inspectées

- [Ron Cobb — concept du Medlab](https://propstore.com/product/aliens-1986/hand-drawn-ron-cobb-medlab-concept-sketch/) — Vue intérieure : boîtiers et consoles rectangulaires gris-vert, panneaux vissés, aérations, écrans CRT, câbles apparents et mobilier bas. Concept de production. Ni relevé coté des meubles ciblés ni preuve de leur présence exacte dans le montage final. Les dimensions de la fiche sont celles du dessin.
- [Hadley’s Hope — collection de 80 photographies de plateau](https://ukm.propstoreauction.com/lot-details/index/catalog/232/lot/56648/Lot-119-Alien-Aliens-Collection-Auction-Photos-of-the-Hadley-s-Hope-Set) — Image de vente montrant des piles de tirages et quatre photographies déployées : machinerie, loader, équipe de tournage, porte de décor ; panneaux clairs et renforts sombres visibles. Seule l’image de présentation est inspectée ; les 80 vues ne sont pas toutes lisibles. Aucun des quatre nouveaux meubles n’est identifié avec certitude. Les dimensions annoncées concernent les tirages.

## Continuité avec les images du jeu

- [assets/dlc/aliens-1986/v119/furniture/operations-storage-rack.png](../../../assets/dlc/aliens-1986/v119/furniture/operations-storage-rack.png) — référence visuelle de matière, de frontalité ou de raccord ; empreinte `2651889919d7867af23dc18191b7e767b2142fa98ea3a436f6c6ed10c3414380`.
- [assets/dlc/aliens-1986/v119/furniture/operations-command-table.png](../../../assets/dlc/aliens-1986/v119/furniture/operations-command-table.png) — référence visuelle de matière, de frontalité ou de raccord ; empreinte `68876aa989b21a19f2461f295228fb1ee033af4ab64dd4a3fa9c0a24c0e33137`.
- [assets/dlc/aliens-1986/v118/props/valve-indicator-panel.png](../../../assets/dlc/aliens-1986/v118/props/valve-indicator-panel.png) — référence visuelle de matière, de frontalité ou de raccord ; empreinte `ec62b3d888dbcc81e7e8550cfdb15f76a5eda230c706e151bba4db7f74a35b2d`.

Ces images générées servent à maintenir la cohérence du DLC. Elles ne sont pas des preuves indépendantes du film. Les générations initiales utilisent des prompts textuels ; la retouche de la pompe reçoit uniquement son premier essai comme image cible.

## Géométrie et interaction

| Corps | Cotes du jeu | Enveloppe |
| --- | --- | --- |
| v106-hadley/generator | 100 × 62 × 84 | 100 × 137.32 |
| v107-service/pump-foundation | 151 × 98 × 94 | 151 × 178.28 |
| v112-conduit/exchanger-west | 181 × 84 × 127 | 181 × 199.24 |
| v112-conduit/exchanger-east | 194 × 82 × 134 | 194 × 204.52 |
| v112-conduit/valve-plinth | 125 × 65 × 73 | 125 × 128.9 |

Les dimensions proviennent des exports de scènes, pas d’une photogrammétrie du film. La pompe conserve les deux capots frontaux et les tuyaux courts du dessin natif. Les conduites murales restent séparées. Le socle ne comprend aucun panneau intégré : l’appui du prop existant à l’élévation 73 est vérifié dans les pixels réels par la QA. Les deux échangeurs partagent un fichier unique. Les tableaux complets, sources de code et limites sont dans la [bible](bible.md) et les prompts exacts dans le [journal](generation-ledger.json).

## Travail de fidélité encore nécessaire

Identifier les machines précises dans les photographies de plateau et les plans de production, confronter leurs faces et attaches à plusieurs vues, puis vérifier leur rôle dans la scène avant toute certification. La découverte d’un panneau de décor de même vocabulaire ne clôt pas ce travail. Les proportions et la légère convergence des dessus restent des choix ou limites d’adaptation documentés.
