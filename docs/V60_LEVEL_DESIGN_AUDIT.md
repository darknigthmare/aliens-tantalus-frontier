# Audit level design V60 — proportions, perspectives et cohérence physique

Date : 28 août 2026. Périmètre : hub USS Tantalus, topologies de mission, véhicules et séquences d’accès V60. Audit statique, tests de collision et parcours Edge local terminés.

## Verdict exécutif

La passe physique V60 est validée : le hub n’est plus un kit uniforme répété sur seize salles. Chaque salle possède son archétype, ses quantités de plateformes/échelles/conduits, ses endpoints praticables, ses sockets issus du graphe réel et ses occlusions bitmap. L’escouade entre et sort des véhicules en file physique sans mutation instantanée ; le M577 conserve son altitude auteur V52.

La qualification visuelle reste partielle sur un point clairement isolé : quatre MID existants contiennent encore une silhouette pouvant être lue comme une porte. Leur remplacement ImageGen est `BLOCKED_EXPLICIT_TRANSFER_PERMISSION`. Ce blocage n’annule pas la topologie et les collisions V60, mais interdit de déclarer la signalétique peinte de ces quatre salles parfaite.

## Mesures validées

| Élément | Mesure V60 | Lecture level design |
| --- | ---: | --- |
| Résolution logique | 1 280 × 720 | une salle correspond à une largeur caméra |
| Ponts / salles | 4 / 16 | quatre salles par pont |
| Profils de traversée | 16/16 | un archétype auteur nommé par salle |
| Bitmaps de traversée | 8/8 prêts | catwalk, drop, ledge, ladder, vent et trois occlusions |
| FAR / MID / overhead / foreground | 16/16 chacun | plans indépendants et ordre de rendu contrôlé |
| Props statiques/interactifs | 47 chemins uniques | zéro fichier absent dans les registres audités |
| Couches de mission zonées | 54/54 | 18 zones × far/mid/foreground |
| Atlas de portes mission | 8 cellules | quatre familles × fermé/ouvert |
| Atlas de sprites | 182 / 2 564 cellules | zéro chemin raw ou normalisé absent |
| Parcours Edge | 22 checkpoints / 30 captures | 16 salles, véhicule, mission, mobile et offline |

## Corrections de perspective, taille et placement

### Hub et salles

- La salle et la caméra partagent la même largeur logique ; les seuils restent dans leur écran.
- Les seize profils ne réemploient plus la quantité prototype `2 plateformes / 2 échelles / 1 conduit`.
- Chaque extrémité d’échelle aboutit au sol ou à une plateforme ; chaque conduit débouche sur une surface.
- Les occlusions utilisent de vrais bitmaps et sont dessinées après les acteurs sans devenir des collisions invisibles.
- Les portes runtime et leurs bounds de rendu partagent les mêmes sockets. Medical, Quarantine et Life Support n’obtiennent pas de faux sas intérieur ; Science Lab conserve son lift aft vers x ≈ 1 096.
- La comparaison avant/après au même cadrage de Medical, Science Lab, Quarantine, Life Support et Dropship Hangar montre les passerelles, liaisons verticales et plans d’occlusion V60 sans changement arbitraire de palette.

### Véhicules

- Le M577 bitmap conserve son nœud de sol V52 pendant l’entrée conducteur ; le bug qui le faisait descendre vers le sol global est couvert par un test.
- Le rendu des six familles prêtes reste bitmap, orienté par `facing`, avec pivot et hitbox stables.
- M570, M292 baseline et AD‑19D, soit 24 entrées avec leurs fits, sont non affectables et non pilotables au lieu de devenir invisibles.
- Le UD‑4L du hangar est rendu entre MID et acteurs, à environ 811 × 331 px. Ses quatre colliders laissent une rampe centrale, le danger électrique ne chevauche plus le passage et l’interaction du craft garde une priorité de 100.

### Embarquement escouade

- La file attend `accessSecureClock === 0`.
- Un seul PNJ traverse à la fois ; les compteurs d’embarquement et de débarquement sont strictement monotones.
- Les sièges sont uniques, la capacité réelle est respectée et le P‑5000 monoplace n’absorbe aucun passager IA.
- Le M22A3 sans contrat de trappe dédié refuse la file ; le UD‑4L rejette une rampe hors hauteur sûre.
- Destruction, downed, échec, checkpoint et reprise sur un autre véhicule replacent les PNJ hors coque et purgent les sièges obsolètes.

## Dette restante

| Priorité | Sujet | État | Condition de sortie |
| --- | --- | --- | --- |
| P0 visuel | Medical MID | `BLOCKED_EXPLICIT_TRANSFER_PERMISSION` | autorisation d’envoyer uniquement ce MID à ImageGen |
| P0 visuel | Science Lab MID | `BLOCKED_EXPLICIT_TRANSFER_PERMISSION` | même autorisation |
| P0 visuel | Quarantine MID | `BLOCKED_EXPLICIT_TRANSFER_PERMISSION` | même autorisation |
| P0 visuel | Life Support MID | `BLOCKED_EXPLICIT_TRANSFER_PERMISSION` | même autorisation |
| P1 art | Variantes de traversée supplémentaires | `MISSING_DEDICATED_ART` | produire des kits commandement, habitat, industriel et ingénierie sans changer les colliders validés |

Fichiers actuels concernés :

| Salle | Fichier existant |
| --- | --- |
| Medical | `/assets/openai/hub/layers/habitat-medical-mid.png` |
| Science Lab | `/assets/openai/hub/layers/habitat-lab-mid.png` |
| Quarantine | `/assets/openai/hub/layers/industrial-quarantine-mid.png` |
| Life Support | `/assets/openai/hub/layers/engineering-life-support-mid.png` |

## Gates d’acceptation

| Gate | Résultat local |
| --- | --- |
| Seize salles chargées et capturées | `PASS` |
| Profils, endpoints, collisions et occlusions | `PASS` |
| Sockets issus du graphe et Science Lab lift | `PASS` |
| M577, UD‑4L, ordre des plans et priorité | `PASS` |
| File escouade, interruptions, capacité et reprise | `PASS` |
| Desktop, mobile et PWA hors ligne | `PASS` |
| Zéro exception/console/requête critique | `PASS` |
| Correspondance parfaite des quatre portes peintes MID | `BLOCKED_EXPLICIT_TRANSFER_PERMISSION` |

## Conclusion

Le level design physique V60 est cohérent, parcourable et vérifié. Les bugs d’altitude véhicule, de file escouade, de sockets inventés, de kit uniforme et de priorité du hangar sont fermés. La seule réserve P0 restante est visuelle et circonscrite aux quatre MID dont le transfert ImageGen n’a pas été autorisé.
