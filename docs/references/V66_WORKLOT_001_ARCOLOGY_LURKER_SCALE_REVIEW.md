# V66 — Arcology Lurker — revue d’échelle, racines physiques et ownership

Statut : revue autonome du candidat source `enemy-033-arcology-lurker`, sans acceptation artistique/runtime et sans fusion dans `QUEUE`, `STATE`, les références globales ou les atlas normalisés.

## Échelle anatomique inter-clips

La comparaison emploie un repère rigide visible : la corde du dôme crânien entre l’épaulement postérieur visible et la pointe antérieure. Mâchoire, cou, membres et queue sont exclus. Les coordonnées sont locales à la cellule nominale 4×2. Deux poses lisibles sont mesurées par clip ; pour `attack`, les poses de récupération évitent le raccourci de la détente, et pour `death`, seules les deux poses avant aplatissement sont comparables.

| Clip | Poses | Longueurs (px) | Médiane (px) | Ratio `idle / clip` |
| --- | --- | --- | ---: | ---: |
| `idle` | 0, 4 | 105.537 ; 103.755 | 104.646 | 1.000000 |
| `move` | 0, 4 | 111.400 ; 106.733 | 109.067 | 0.959464 |
| `attack` | 4, 6 | 117.388 ; 111.973 | 114.681 | 0.912495 |
| `death` | 0, 1 | 115.156 ; 105.702 | 110.429 | 0.947625 |

Incertitude de lecture : ±4 px par endpoint, due au bord antialiasé et à l’inclinaison résiduelle du crâne. Les ratios sont donc des calibrations post-génération candidates : ils ne redimensionnent pas les PNG source et ne sont pas considérés intégrés tant que le fragment autonome n’est pas fusionné et revalidé par le lot parent.

Preuve annotée : `docs/references/v66-worklot-001-scale-review/enemy-033-arcology-lurker/cranial-chords.jpg`, 772289 octets, SHA-256 `17502ca3255a1a3cc2f1a1212bbb81a72279ece8062d31a4d9ff8deab7607b10`.

## Racines physiques et plan de sol

Le landmark est le centre ventral de la cage thoracique et reste inchangé. La racine conserve le même `x`, projette verticalement ce landmark vers la ligne de support réellement lisible des pattes/doigts, puis ajoute la garde d’extraction complète de 4 px : `sourceBounds[3] - anchorY = 0` sur les 32 poses. Les extrêmes de queue sont exclus. `death` emploie le plan de contact du cadavre. `attack` pose 2 est aérienne : sa racine projette le torse sur le plan d’action indiqué par le membre distal le plus bas et ne prétend pas qu’un pied est alors en appui.

| Clip | Racines `y` nominales | Écart vertical landmark→racine | Confiance |
| --- | --- | --- | --- |
| `idle` | 325–383 px | 72–124 px, médiane 85 px | 8/8 haute, ±4 px |
| `move` | 339–418 px | 96–125 px, médiane 117 px | 8/8 haute, ±4 px |
| `attack` | 333–436 px | 85–182 px, médiane 110 px | 6 haute, 2 moyenne ; ±4 à ±6 px |
| `death` | 312–384 px | 20–120 px, décroissance cohérente avec l’aplatissement | 8/8 haute, ±4 px |

Les 32 couples exacts `landmark`/`anchor`, leurs bounds et incertitudes sont dans `V66_WORKLOT_001_ARCOLOGY_LURKER_ANCHOR_REVIEW.json`. Les contacts diagnostiques, rendus sans modifier les sources, sont :

- `idle.jpg` — SHA-256 `6216dc26c6c9264e5f9bbd0720dc9bcf9b277bfea23a2859cc52104ca3cc58a7`
- `move.jpg` — SHA-256 `56a1d2ca4930c5f6c4eb44acec328646298fbe1ff8d4fd8bc5072ac138774697`
- `attack.jpg` — SHA-256 `f992f297acd34434dc4551d7a79bf0c28c96597d3917aed34900d115c3f1f79b`
- `death.jpg` — SHA-256 `e11fb09625364c7ff916829c974403654b8891696ba1fd8638b4c9b65b89b2f4`

## Preuve `attack` — safe reassignment

L’extraction nominale bloque parce que deux composantes anatomiques connectées franchissent une séparation de cellule. Le mode sécurisé n’interpole, ne redessine et ne copie aucun pixel : il attribue chaque composante huit-connectée à sa cellule majoritaire seulement si cette cellule contient au moins 90 % de la composante et si l’excursion reste sous 15 % d’une dimension de cellule.

Deux transferts seulement sont autorisés :

| Propriétaire | Provenance | Pixels transférés | Composante | Part propriétaire | Bounds globaux | SHA-256 des pixels transférés |
| ---: | --- | ---: | ---: | ---: | --- | --- |
| 2 | cellule 1 | 730 | 20459 | 0.964319 | `[828,183,1315,381]` | `047d908fd0da6f2ea3ac408cab4d19fa41759d36fab8586f57e869e03a30b4fd` |
| 3 | cellule 2 | 824 | 23368 | 0.964738 | `[1297,190,1740,417]` | `27a1b71467c926bcb25374a84ae7f646b5aa2cfcc3b59e27ddf0bde0fbaa39fe` |

Le contrôle reconstruit la feuille post-matte entière à partir des huit frames attribuées : 192453 pixels de premier plan attendus, 192453 attribués, 0 rejeté. Le buffer RGBA reconstruit est bit-à-bit identique au buffer post-matte attendu ; les deux SHA-256 valent `8021715a7fdaf6f571411cf0132a1a892cdcc63cbdd1602f4aab7bc5d354ae8b`.

Une retouche géométrique stricte a été évaluée puis écartée : la pose de détente mesure 508 px de large pour une cellule nominale de 443/444 px, donc il faudrait réduire uniformément tout le clip d’environ 14 %, puis le réagrandir via la calibration inter-clips mesurée. Ce double rééchantillonnage dégraderait les doigts et stries de carapace. Les deux débordements, courts, huit-connectés et exactement réversibles, conservent mieux la source que cette réécriture. La dépendance au flag reste une réserve explicite.

Un essai de normalisation strictement en mémoire, sans fichier écrit, a utilisé une grille diagnostique 4×2 de cellules 600×600, guard 8, pivot `[300,550]`. Le scale est resté 1.0, les huit tailles rendues sont restées égales aux crops source, 0 pixel alpha et 0 pixel RGB de premier plan ont changé sur 192453 comparaisons. Cette preuve isole correctement l’ownership et le passage au normaliseur ; elle ne prétend pas qu’un futur atlas 256×256 conservera les octets si un redimensionnement Lanczos devient nécessaire.

Clarification de profondeur : la source active est `RGB8` opaque, soit 24 bits/pixel. Le masque extrait travaille en `RGBA8`, soit 32 bits/pixel. Il n’existe donc pas de source 64 bits/pixel à conserver ici ; la propriété prouvée est l’identité exacte de tous les octets RGB8 et de l’alpha synthétisé avant tout redimensionnement.

## Décision

L’anatomie inter-clips et les 32 racines physiques disposent désormais de mesures explicites et de preuves locales. Les corrections candidates sont `idle 1`, `move 0.959464`, `attack 0.912495`, `death 0.947625`. Elles restent volontairement non fusionnées ; aucun atlas final, manifeste runtime, état d’acceptation, queue ou référence globale n’a été écrit.
