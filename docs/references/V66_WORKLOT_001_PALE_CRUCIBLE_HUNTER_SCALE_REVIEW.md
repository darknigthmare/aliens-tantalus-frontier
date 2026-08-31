# V66 — Pale Crucible Hunter scale and motion review

## Verdict

Les quatre sources sélectionnées sont techniquement exploitables en grille 4 × 2 : elles font toutes `1774 × 887`, utilisent un fond magenta opaque, contiennent huit cellules distinctes et passent l’extracteur strict en 8/8. `idle` conserve néanmoins des indices conservateurs de contact de bord sur les poses 3 et 5 ; cela n’a pas bloqué l’extracteur mais reste une réserve d’ownership.

En revanche, elles ne doivent pas être normalisées avec une échelle uniforme implicite. La planche `idle` est environ **1,8 fois plus grande** que `move`, `attack` et `death` sur un invariant anatomique mesuré, et non sur la boîte englobante du corps.

## Mesure anatomique

Invariant : corde longitudinale visible de la plaque crânienne ivoire, depuis son bord dorsal postérieur après la couture nucale noire jusqu’à la pointe rostrale. Deux poses latérales comparables ont été mesurées par clip dans les coordonnées locales de cellule source. Incertitude manuelle estimée : ±3 px par extrémité.

| Clip | Longueurs mesurées | Médiane | Facteur `idle / clip` proposé |
| --- | ---: | ---: | ---: |
| `idle` | 107,62 px ; 96,52 px | 102,07 px | 1,000000 |
| `move` | 56,64 px ; 57,38 px | 57,01 px | 1,790280 |
| `attack` | 58,60 px ; 54,38 px | 56,49 px | 1,806842 |
| `death` | 59,46 px ; 54,82 px | 57,14 px | 1,786232 |

Les trois clips réduits concordent entre eux à environ 1 %, tandis qu’`idle` est presque deux fois plus grand. Les rejets confirment l’origine du problème : `move-r1`, `attack-r1` et `death-r1` avaient une taille plus proche d’`idle`, mais débordaient largement des cellules ; les versions compactées ont résolu l’extraction en introduisant la rupture d’échelle.

Calibration candidate à appliquer uniquement par le pipeline revu, sans redimensionner les PNG sources :

```json
{
  "idle": 1.0,
  "move": 1.79028,
  "attack": 1.806842,
  "death": 1.786232
}
```

Cette calibration n’est ni appliquée ni acceptée dans ce lot.

## Direction, anatomie et chronologie

Toutes les poses actives et rejetées regardent vers la droite. Le crâne aveugle ivoire, les coutures musculaires charbon, les épines dorsales, les avant-bras longs, les jambes digitigrades et la queue segmentée restent reconnaissables. Toutefois, `idle` est beaucoup plus élancé et vertical ; les trois autres clips paraissent compacts, voûtés et moins détaillés. L’identité macroscopique est compatible, mais l’invariance anatomique n’est pas encore assez établie pour une validation artistique.

- `idle` : boucle respiratoire discrète et lisible ; placement vertical stable entre les deux rangées.
- `move` : alternance d’appuis postérieurs et compressions lisibles, mais la transition pose 3 → 4 remonte la silhouette d’environ 122,5 px dans la cellule source.
- `attack` : anticipation, extension et retour lisibles ; saut vertical d’environ 149 px entre les deux rangées.
- `death` : effondrement irréversible, puis roulement et tassement sans retour debout ; saut vertical d’environ 87 px entre les deux rangées.

Ces valeurs sont les points les plus bas du masque conservateur, pas des racines physiques validées. Des ancres de pieds/centre de masse restent donc obligatoires avant lecture animée.

## Rejets

Les quatre rejets restent correctement écartés : ils ont tous huit cellules distinctes et un fond magenta valide, mais échouent l’extraction stricte à cause des débordements. `attack-r1` et `move-r1` ont une ownership intercellule ambiguë ; `attack-r2` et `death-r1` passent seulement la sonde de réassignation courte. Aucun rejet n’a été promu.

## Suite obligatoire avant intégration

1. Appliquer les facteurs proposés dans le chemin de calibration revu, sans toucher aux masters.
2. Normaliser avec des ancres physiques explicites.
3. Refaire les planches-contact/GIF et re-mesurer le crâne en coordonnées atlas.
4. Contrôler les appuis, la transition 3 → 4, la topologie des membres, les coutures de boucle et la lisibilité à l’échelle de jeu.

Aucune source, référence, queue, registre, `STATE`, manifeste ou donnée runtime n’a été modifiée ou acceptée par cet audit.
