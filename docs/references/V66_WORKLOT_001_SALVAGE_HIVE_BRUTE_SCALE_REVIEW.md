# V66 Worklot 001 — Salvage Hive Brute — revue d'échelle et d'appuis

Date: 2026-09-01
Profil: `enemy-032-salvage-hive-brute`
Statut: **revue physique indépendante; facteurs et racines documentés, non appliqués.**
Coordonnées: cellule source nominale 4×2, origine locale en haut à gauche, frames numérotées 1 à 8.

## Sources liées

| Clip | Source active | SHA-256 |
|---|---|---|
| idle | `assets/openai/sprites/frames/v66/batch-003/enemy-032-salvage-hive-brute/idle.png` | `5bc911b4b201925ed6586f696a6dd2d1bdfb53c22294164f5738ed17460adaaf` |
| move | `assets/openai/sprites/frames/v66/batch-003/enemy-032-salvage-hive-brute/move.png` | `114083e565c5ecffeadc0215b242654a51c6947307e65c2f05a8fc5a4654a9c9` |
| attack | `assets/openai/sprites/frames/v66/batch-003/enemy-032-salvage-hive-brute/attack.png` | `da09427947eb0b1faa6f970c6cb46950b6ca9085c0bc1a0d09802d36a8efa4dd` |
| death | `assets/openai/sprites/frames/v66/batch-003/enemy-032-salvage-hive-brute/death.png` | `4919be02e9f0e9b2462c674ddcc0a1ea06ecd6d953e8e4e1b97d09f027b03698` |
| charge | `assets/openai/sprites/frames/v66/batch-003/enemy-032-salvage-hive-brute/charge.png` | `62a7d760edbadeb305356c04c9d9a193db883a0dedf2c94c2266acf864c64fc4` |

## Invariant anatomique

L'invariant retenu est la **corde de la plaque crânienne protégée principale**, du départ dorsal postérieur du bouclier organique au bord dur antérieur du dôme au-dessus de la gueule. Cette structure est rigide, visible en profil droit et indépendante de la queue, des membres et de l'écrasement du torse.

Deux poses comparables et lisibles ont été relevées par clip. Les endpoints ont été placés manuellement sur le master source avec une grille locale; la longueur est la distance euclidienne. L'incertitude de lecture est estimée à ±5 px, car l'inclinaison de tête et l'antialias modifient légèrement le contour apparent. Les six décimales des facteurs assurent la reproductibilité du calcul, pas une précision anatomique supérieure à cette incertitude.

| Clip | Frame | Endpoint postérieur | Endpoint antérieur | Longueur |
|---|---:|---:|---:|---:|
| idle | 1 | `(230,180)` | `(326,223)` | 105.190 px |
| idle | 5 | `(215,130)` | `(319,179)` | 114.965 px |
| move | 1 | `(205,210)` | `(318,245)` | 118.296 px |
| move | 5 | `(215,125)` | `(339,176)` | 134.078 px |
| attack | 1 | `(230,180)` | `(337,225)` | 116.078 px |
| attack | 8 | `(185,135)` | `(296,184)` | 121.334 px |
| death | 1 | `(280,230)` | `(352,265)` | 80.056 px |
| death | 2 | `(225,240)` | `(309,270)` | 89.196 px |
| charge | 1 | `(260,230)` | `(357,276)` | 107.355 px |
| charge | 8 | `(205,145)` | `(310,185)` | 112.361 px |

## Recommandation `sourceScaleByClip`

Le facteur brut est `médiane idle / médiane clip`. Charge diffère de seulement +0.20 % du baseline, très en dessous de l'incertitude; son facteur brut `1.002002` est donc volontairement ramené à `1.0`.

| Clip | Médiane plaque | Écart vs idle | Facteur recommandé | Médiane projetée |
|---|---:|---:|---:|---:|
| idle | 110.078 px | baseline | **1.000000** | 110.078 px |
| move | 126.187 px | +14.64 % | **0.872336** | 110.078 px |
| attack | 118.706 px | +7.84 % | **0.927315** | 110.078 px |
| death | 84.626 px | −23.12 % | **1.300751** | 110.078 px |
| charge | 109.858 px | −0.20 % | **1.000000** | 109.858 px |

```json
{
  "idle": 1.0,
  "move": 0.872336,
  "attack": 0.927315,
  "death": 1.300751,
  "charge": 1.0
}
```

Ces facteurs sont seulement recommandés. Le pipeline devra relier la preuve aux cinq SHA ci-dessus, vérifier l'enveloppe après application et conserver le facteur de packing commun avant toute normalisation définitive.

## Revue des 40 racines physiques

Le landmark est le centre manuel de la cage thoracique, immédiatement derrière l'épaule avant. L'ancre partage son `x` et place son `y` sur le support physique inférieur inspecté: pied/knuckle pour les poses locomotrices, puis genou, avant-bras, thorax ou flanc pour la chute. La queue et la crête sont toujours exclues. Les bas ci-dessous sont les bornes d'extraction avec la garde contractuelle de 3 px; ils ont été comparés visuellement au support réel avant d'être retenus.

| Clip | Frame | Source bounds | Landmark thorax | Ancre sol | Support vérifié |
|---|---:|---:|---:|---:|---|
| idle | 1 | `[100,176,332,351]` | `(230,240)` | `(230,351)` | pieds/knuckle |
| idle | 2 | `[82,178,307,351]` | `(210,245)` | `(210,351)` | pieds/knuckle |
| idle | 3 | `[81,180,313,351]` | `(220,245)` | `(220,351)` | pieds/knuckle |
| idle | 4 | `[64,190,294,351]` | `(205,255)` | `(205,351)` | pieds/knuckle |
| idle | 5 | `[96,118,324,284]` | `(225,190)` | `(225,284)` | pieds/knuckle |
| idle | 6 | `[75,116,300,283]` | `(205,190)` | `(205,283)` | pieds/knuckle |
| idle | 7 | `[69,131,295,283]` | `(200,200)` | `(200,283)` | pieds/knuckle |
| idle | 8 | `[55,126,286,284]` | `(195,195)` | `(195,284)` | pieds/knuckle |
| move | 1 | `[84,208,323,364]` | `(210,270)` | `(210,364)` | pied porteur/knuckle |
| move | 2 | `[33,210,284,364]` | `(190,270)` | `(190,364)` | pied porteur/knuckle |
| move | 3 | `[3,210,253,364]` | `(175,270)` | `(175,364)` | pied porteur/knuckle |
| move | 4 | `[0,211,256,364]` | `(175,275)` | `(175,364)` | pied porteur/knuckle |
| move | 5 | `[98,116,348,268]` | `(225,185)` | `(225,268)` | pied porteur/knuckle |
| move | 6 | `[39,117,283,270]` | `(195,185)` | `(195,270)` | pied porteur/knuckle |
| move | 7 | `[16,124,255,270]` | `(180,190)` | `(180,270)` | pied porteur/knuckle |
| move | 8 | `[10,121,246,270]` | `(180,190)` | `(180,270)` | pied porteur/knuckle |
| attack | 1 | `[85,172,342,362]` | `(230,240)` | `(230,362)` | pieds/knuckle |
| attack | 2 | `[54,205,358,364]` | `(220,265)` | `(220,364)` | pieds/avant-bras |
| attack | 3 | `[93,214,394,367]` | `(235,275)` | `(235,367)` | genou/avant-bras |
| attack | 4 | `[34,224,384,366]` | `(225,280)` | `(225,366)` | thorax/avant-bras |
| attack | 5 | `[64,129,377,307]` | `(230,210)` | `(230,307)` | flanc/avant-bras |
| attack | 6 | `[23,167,362,307]` | `(210,230)` | `(210,307)` | thorax/avant-bras |
| attack | 7 | `[36,143,310,306]` | `(195,215)` | `(195,306)` | pieds/knuckle |
| attack | 8 | `[44,132,300,306]` | `(195,205)` | `(195,306)` | pieds/knuckle |
| death | 1 | `[146,227,355,387]` | `(270,285)` | `(270,387)` | pieds |
| death | 2 | `[84,237,312,387]` | `(220,290)` | `(220,387)` | pied/main |
| death | 3 | `[51,265,296,388]` | `(205,315)` | `(205,388)` | genou/main |
| death | 4 | `[12,278,268,390]` | `(185,325)` | `(185,390)` | thorax/avant-bras |
| death | 5 | `[132,141,387,243]` | `(250,205)` | `(250,243)` | flanc/thorax |
| death | 6 | `[68,160,328,244]` | `(215,210)` | `(215,244)` | flanc/thorax |
| death | 7 | `[39,173,326,245]` | `(210,215)` | `(210,245)` | flanc/thorax |
| death | 8 | `[57,182,358,246]` | `(225,220)` | `(225,246)` | flanc/thorax terminal |
| charge | 1 | `[79,228,360,378]` | `(245,290)` | `(245,378)` | pieds/knuckle |
| charge | 2 | `[34,215,332,378]` | `(215,285)` | `(215,378)` | pied arrière/knuckle |
| charge | 3 | `[4,215,345,378]` | `(215,290)` | `(215,378)` | pied arrière/avant-bras |
| charge | 4 | `[31,230,382,378]` | `(225,300)` | `(225,378)` | pieds/avant-bras |
| charge | 5 | `[47,134,441,284]` | `(255,215)` | `(255,284)` | thorax/pieds bas |
| charge | 6 | `[63,134,376,284]` | `(215,215)` | `(215,284)` | pieds/knuckle |
| charge | 7 | `[38,133,347,284]` | `(210,215)` | `(210,284)` | pieds/knuckle |
| charge | 8 | `[49,133,314,284]` | `(200,210)` | `(200,284)` | pieds/knuckle |

Les lignes basses par rangée sont stables: idle `351/283–284`, move `364/268–270`, attack `362–367/306–307`, death `387–390/243–246`, charge `378/284`. Les écarts de death correspondent à la chute; ceux des autres clips restent de 0 à 5 px.

## Contrôle ciblé de la charge

- **Profil complet:** huit poses distinctes, un sujet complet et une queue reliée par cellule; extraction par défaut 8/8, aucun contact de bord. La frame 5 conserve 3 px de garde au bord droit (`x2=441` dans une cellule de 444 px).
- **Identité:** deux bras, deux jambes, tête organique protégée, masse trapue, résine ambrée, petite ferraille rouillée passive, câbles morts et racine sacrale restent présents. Aucun mécha, exosquelette, arme ou matériel alimenté n'apparaît.
- **Orientation:** les huit dômes/gueules pointent vers `+x`; la queue part du sacrum vers `−x`. Aucune cellule n'est miroir ou frontale.
- **Chronologie:** compression, extension, course basse, allongement maximal, transfert bas, freinage puis récupération; le centre thoracique reste la racine et non la pointe de queue.

## Conclusion

Le move et l'attack sont plus grands que l'idle selon la plaque crânienne; le death est nettement plus petit et doit être agrandi; charge est déjà à l'échelle du baseline dans l'incertitude. Les 40 racines ont un landmark thoracique et un support physique explicitement mesurés. Le fragment fusionnable correspondant est `docs/references/V66_WORKLOT_001_SALVAGE_HIVE_BRUTE_ANCHOR_REVIEW.json`.

Cette revue ne constitue ni acceptation artistique, ni normalisation, ni intégration runtime. Aucun PNG, registre global, queue, STATE, manifeste ou code n'a été modifié.
