# Matrice de complétude artistique V60

Audit local du 28 août 2026. Cette matrice compte les fichiers réellement présents et les consommateurs réellement résolus. Elle ne transforme pas une variante catalogue, un alias ou une primitive Canvas en plaque dédiée.

## Légende d’état

| État | Signification |
| --- | --- |
| `DONE_FILE` | fichier présent au chemin déclaré |
| `DONE_RUNTIME` | fichier présent et résolu par le runtime |
| `REUSED_BY_CONTRACT` | variante volontairement rattachée à une base visuelle déclarée |
| `IN_IMPLEMENTATION` | code présent dans le worktree mais gate finale non passée |
| `MISSING_DEDICATED_ART` | le gameplay ou catalogue existe sans plaque propre |
| `BLOCKED_*` | production interdite tant que la référence, la variante ou la permission n’est pas résolue |

## Manifeste de plaques

Le manifeste `assets/openai/sprites/manifest.json` reste en release artistique `v59`, car V60 n’ajoute aucun bitmap.

| Famille manifeste | Plaques | Chemins raw + normalisés | Fichiers absents |
| --- | ---: | ---: | ---: |
| enemy | 53 | 106 | 0 |
| equipment | 29 | 58 | 0 |
| npc | 32 | 64 | 0 |
| player | 5 | 10 | 0 |
| vehicle | 37 | 74 | 0 |
| weapon | 26 | 52 | 0 |
| **Total** | **182** | **364** | **0** |

Les 182 plaques représentent 2 564 cellules déclarées. Les 364 chemins correspondent à un master raw et un fichier normalisé pour chaque plaque.

## Personnages et PNJ

| Groupe | Base / identités | Couverture dédiée | Résolution catalogue | État |
| --- | ---: | ---: | ---: | --- |
| Joueur Echo‑9 | 1 identité, 5 usages visuels | 5 plaques | 5/5 | `DONE_RUNTIME` |
| Équipage / PNJ | 16 identités | 32 plaques, locomotion + mission | 32/32 plaques | `DONE_RUNTIME` |
| Costumes | 392 entrées | 0 plaque dédiée | 0/392 dédiée | `MISSING_DEDICATED_ART` |

Les costumes modifient actuellement les données et ajoutent un traitement coloré sur la feuille générique du marine. Ce comportement n’est pas compté comme 392 apparences produites.

## Ennemis

Le registre contient 53 plaques de famille `enemy`. Le catalogue s’appuie sur 52 archétypes de base et 568 entrées au total :

- 49 archétypes disposent d’une plaque moderne dédiée ;
- Red Xenomorph utilise la ligne contrôlée 0 de `assets/openai/neuro-xeno-animation-sheet.png` ;
- K‑Series Yellow Xenomorph utilise la ligne contrôlée 1 du même atlas ;
- Combat Synthetic utilise la ligne contrôlée 2 de `assets/openai/synthetic-android-animation-sheet.png` ;
- les 516 entrées modifiées réemploient explicitement l’archétype de base par contrat.

Les trois lignes legacy sont résolues dans le runtime, mais restent une dette de plaques modernes dédiées ; elles ne sont pas signalées comme fichiers manquants.

## Véhicules

| Mesure | Résultat |
| --- | ---: |
| Châssis de base | 36 |
| Châssis avec identité physique résolue | 33 |
| Châssis bloqués | 3 |
| Entrées catalogue | 279 |
| Entrées résolues | 255 |
| Entrées bloquées | 24 |
| Plaques vehicle du manifeste, actions et accès compris | 37 |

Les 222 variantes de fit résolues réemploient leur châssis par `REUSED_BY_CONTRACT`; elles ne sont pas 222 plaques différentes.

| Châssis bloqué | État exact | Condition de sortie |
| --- | --- | --- |
| M570 Series APC | `BLOCKED_NO_PUBLISHED_SILHOUETTE` | silhouette publiée du modèle exact |
| M292 Self‑Propelled Artillery baseline | `BLOCKED_BASELINE_VARIANT` | choix baseline/M292A2 et angles cohérents |
| AD‑19D Bearcat | `BLOCKED_VARIANT_AND_REAR_GEOMETRY_UNRESOLVED` | géométrie D et arrière documentées |

Le fallback Canvas des familles non-ground a été retiré. Six châssis déjà équipés — air, espace, rail, submersible, maritime et exosquelette — sont couverts par un test de plaque, orientation, échelle, pivot et hitbox. Un châssis bloqué reste sans fausse silhouette.

V60 applique aussi un gate central aux 24 entrées des trois familles bloquées : elles restent acquises et visibles dans les sauvegardes, mais l’UI refuse leur affectation, le manifeste d’opération choisit un châssis prêt et le moteur interdit activation, conduite et tir. Une ancienne sauvegarde retombe sur le dernier véhicule acquis réellement prêt, M577 par défaut.

### Accès et overlays de fits

Les plaques d’accès V59 existent pour M577, M577 Command, P‑5000 et UD‑4L. L’accès M22A3 reste `BLOCKED_REFERENCE`, faute de référence fiable de la trappe exacte.

L’accès escouade V60 consomme uniquement ces contrats dédiés. Il est `DONE_RUNTIME` pour la file, les sièges, la capacité, les interruptions et la reprise ; un véhicule sans contrat ne reçoit aucune animation ou téléportation générique.

Les cinq overlays suivants ne sont pas générés :

| Chemin prévu | État |
| --- | --- |
| `assets/openai/sprites/vehicles/m577-apc-fit-damage-overlays.png` | `READY_NOT_GENERATED` |
| `assets/openai/sprites/vehicles/m577-command-apc-fit-damage-overlays.png` | `READY_NOT_GENERATED` |
| `assets/openai/sprites/vehicles/p-5000-powered-work-loader-fit-damage-overlays.png` | `READY_NOT_GENERATED` |
| `assets/openai/sprites/vehicles/ud-4l-cheyenne-dropship-fit-damage-overlays.png` | `READY_NOT_GENERATED` |
| `assets/openai/sprites/vehicles/m22a3-jackson-tank-fit-damage-overlays.png` | `BLOCKED_REFERENCE` |

`READY_NOT_GENERATED` signifie que le châssis d’accès est validé, pas que les huit briefs de fits sont déjà figés ou produits.

## Armes

| Mesure | Résultat |
| --- | ---: |
| Familles de base | 40 |
| Familles avec plaque physique | 26 |
| Familles bloquées | 14 |
| Entrées catalogue | 146 |
| Entrées résolues | 90 |
| Entrées non résolues | 56 |

Les quatorze familles sous gate canonique sont : M39, M42A, M6B, M83, M5, M94, Heavy Pulse Rifle, F44AA, Type 88, AK‑4047, ES‑4, Compound Bow, Harpoon Gun et Plasma Rifle.

Les plaques d’armes résolues alimentent les fiches et objets. La feuille de combat du joueur conserve une arme générique intégrée : la composition arme/personnage reste `MISSING_DEDICATED_ART`, même lorsqu’un objet d’arme possède sa plaque.

## Équipements et objets déployés

| Mesure | Résultat |
| --- | ---: |
| Familles de base | 30 |
| Plaques physiques | 29 |
| Alias contrôlé | 1, Cutting Torch |
| Entrées catalogue résolues | 106/106 |

Les 76 variantes de grade réemploient leur base par contrat. Les plaques existent pour l’inventaire, mais les déploiements de soutien restent dessinés par `strokeRect` dans le monde : c’est un manque de consommateur visuel, pas un fichier d’inventaire absent.

## Props, couches et portes

| Lot | Références | Chemins uniques présents | État |
| --- | ---: | ---: | --- |
| Props hub | 16 | 16 | `DONE_FILE` |
| Kit de traversée | 8 | 8 | `DONE_RUNTIME`, huit bitmaps partagés par 16 profils auteurs |
| Props mission monde | 12 | 12 | `DONE_RUNTIME` |
| Props structurels | 3 | 3 | `DONE_RUNTIME` |
| Props interactifs | 16 | 16 | `DONE_RUNTIME` |
| **Total registres** | **55** | **47** | **0 absent, 0 hash dupliqué** |

Les huit chemins de traversée sont aussi référencés par les registres modulaires ; le total unique reste donc 47 et non 55.

| Couche | Couverture |
| --- | ---: |
| Hub FAR | 16/16 |
| Hub MID existants | 16/16 |
| Hub overhead | 16/16 |
| Hub foreground | 16/16 |
| Missions zonées | 54/54, soit 18 zones × 3 plans |
| Portes mission | 8 cellules, soit 4 familles × 2 états |

### Quatre remplacements MID bloqués

| Salle | Fichier existant | État du remplacement corrigé |
| --- | --- | --- |
| Medical | `assets/openai/hub/layers/habitat-medical-mid.png` | `BLOCKED_EXPLICIT_TRANSFER_PERMISSION` |
| Science Lab | `assets/openai/hub/layers/habitat-lab-mid.png` | `BLOCKED_EXPLICIT_TRANSFER_PERMISSION` |
| Quarantine | `assets/openai/hub/layers/industrial-quarantine-mid.png` | `BLOCKED_EXPLICIT_TRANSFER_PERMISSION` |
| Life Support | `assets/openai/hub/layers/engineering-life-support-mid.png` | `BLOCKED_EXPLICIT_TRANSFER_PERMISSION` |

Les fichiers existants sont bien présents ; ce sont leurs versions nettoyées qui ne peuvent pas être intégrées sans permission explicite. Ils ne sont pas comptés comme livrables V60.

## Runtime V60 validé, hors comptage d’assets dédiés

| Lot | État |
| --- | --- |
| Embarquement physique séquencé de l’escouade | `DONE_RUNTIME` |
| Profils de traversée propres aux salles du hub | `DONE_RUNTIME` |
| Sockets art/portes issus du graphe physique | `DONE_RUNTIME` |
| Occlusions de traversée et priorité des interactions | `DONE_RUNTIME` |
| Blocage UI/save/runtime des 24 véhicules sans plaque canonique exacte | `DONE_RUNTIME` |
| Ancre de sol V52 conservée pendant l’entrée M577 | `DONE_RUNTIME` |

Ces lignes ont passé 274 tests Node, le build `60.0.0` et le parcours Edge local de 22 checkpoints / 30 captures, sans exception, erreur console ou requête critique échouée.

## Bilan honnête

V60 ne produit aucune nouvelle image. Il confirme l’intégrité des 182 plaques existantes, retire un faux rendu Canvas, rend les 24 variantes sans plaque non déployables et ferme la traversée/embarquement au niveau runtime. Les vrais manques restent : costumes, quatorze familles d’armes, trois châssis, cinq overlays, consommation visuelle des déployables, composition arme/joueur, variantes artistiques supplémentaires du kit de traversée et quatre MID dont le transfert est bloqué.
