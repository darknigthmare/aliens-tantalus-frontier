# Audit des promesses de gameplay — v1 à v55

Date de contrôle : 22 août 2026. Cette note décrit l’état du runtime local documenté par `docs/ASSET_RUNTIME_INVENTORY_V55.json` et `docs/ASSET_RUNTIME_INVENTORY_V55.md`. Elle n’assimile jamais une entrée catalogue à un asset réellement produit.

## Postulat de base conservé

La boucle reste la même : préparation à bord du Tantalus, sélection de campagne, monde, dotation, escouade et véhicule, hub physique, mission multi-route, combat, objectifs, extraction ou retraite, conséquences, sauvegarde et reprise. Les catalogues restent 64 mondes, 436 campagnes, 146 armes, 106 équipements, 568 profils ennemis, 279 profils véhicules, 16 membres d’équipage, 392 costumes, 158 modules et 800 seeds.

## Matrice v55

| Promesse | État v55 | Preuve exécutable | Limite déclarée |
|---|---|---|---|
| Hub jouable, pas une page de boutons | `PHYSICAL` | 16 salles profilées, 16 props, 4 far layers | Les autres salles n’ont pas encore leurs propres couches overhead/foreground dédiées. |
| Hangar dropship modulaire | `PHYSICAL` | 2 couches indépendantes, dropship physique, bounds dédiés | Le contrat modulaire v55 est complet pour le hangar uniquement. |
| Hazard physique dédié dans le hangar | `PHYSICAL` | `electrical-arc-hazard`, dégâts et stun déclarés | Les autres familles de hazards dédiés restent incomplètes. |
| Missions multi-routes | `PHYSICAL` | 3 templates, 9 couches globales, 17 props | Les couches restent encore globales par template, pas indépendantes par zone. |
| Escouade physique lisible | `PHYSICAL` | séparation runtime, largeur visible, clips mission PNJ partiels | 8 PNJ n’ont pas encore de plaque mission dédiée. |
| Identité des 52 archétypes stable | `SYSTEMIC` | 568 profils résolus, 51 atlas, 816 cellules | 18 profils sont exacts, 396 réemploient une famille et 154 restent sans art dédié. |
| Huit nouvelles castes à atlas dédié | `PHYSICAL` | Chestburster, Ovomorph, Carrier, Crusher, Lurker, Praetorian, Ravager, Spitter | 8 profils de base sont exacts; leurs 80 modifiers réemploient la bonne plaque sans être déclarés exacts. |
| Quatre nouveaux châssis véhicules dédiés | `PHYSICAL` | M22A3, M577 Command APC, P-5000, UD-4L | 4 profils v55 de base sont exacts; 28 fits réemploient leur châssis et 31 autres châssis restent sans bitmap dédié. |
| Huit PNJ mission exacts | `PHYSICAL` | 8 plaques mission branchées, 10 clips par plaque | Les 8 autres membres Echo-9 restent en dette mission. |
| Alpha réellement transparent | `RELEASE-GATE` | 51 atlas RGBA, 816 cellules, runtime gate à 20/20 | L’output ImageGen brut ne compte jamais sans normalisation. |
| Sauvegarde/reprise | `PERSISTENT` | continuité v54 conservée par le runtime documenté | Aucun nouveau schéma de save n’est documenté ici. |

## Ce qui est réellement nouveau en v55

- Le runtime local documente 20 atlas dédiés supplémentaires branchés dans `SPRITE_SHEETS`.
- Huit castes ennemies jusque-là approximées ont désormais une identité bitmap dédiée : 8 profils de base exacts et 80 modifiers routés en réemploi de famille.
- Huit plaques mission PNJ ajoutent ready, fire, role-support, cover, traversal, climb, hurt, downed, dead et wounded-death pour la moitié d’Echo-9.
- Quatre châssis véhicules disposent d’une plaque dédiée : 4 profils de base exacts et 28 fits routés en réemploi de châssis.
- Le hangar dropship n’est plus traité comme une seule image monolithique : overhead, foreground, dropship physique et hazard électrique sont décrits séparément.
- Le runtime local passe à 51 atlas / 816 cellules.

## Dette de production encore ouverte

- 154 profils ennemis n’ont toujours pas de plaque dédiée et 396 reposent sur un réemploi de famille déclaré.
- 274 profils véhicules n’ont pas de bitmap exact : 28 fits réemploient leur châssis et 246 profils couvrant 31 châssis restent sans plaque dédiée.
- 8 membres Echo-9 n’ont toujours pas de plaque mission.
- Les autres salles du hub manquent encore de couches overhead/foreground propres.
- Les missions manquent encore de layer sets indépendants par zone.
- Les hazards dédiés feu, vapeur, radiation, inondation, vide et obscurité ne sont pas encore produits.
- Les sprites dédiés pour drops de ressources et terminaux d’archive restent manquants.

## Vérité de publication

Cette documentation v55 décrit l’état du runtime local et de l’inventaire machine v55. Elle ne constitue pas à elle seule une preuve de déploiement public v55.
