# Matrice de complétude artistique V59

Audit du 25 août 2026. Cette matrice distingue un asset réellement généré et branché d’un item catalogue, d’un alias contrôlé ou d’une référence encore bloquée.

## Terminé et vérifiable

| Lot | État V59 | Preuve |
| --- | --- | --- |
| Accès/dégâts M577 | `DONE_RUNTIME` | atlas 4×4, quatre clips, transition jouable |
| Accès/dégâts M577 Command | `DONE_RUNTIME` | atlas 4×4, quatre clips, transition jouable |
| Accès/dégâts P‑5000 | `DONE_RUNTIME` | atlas 4×4, quatre clips, transition jouable |
| Accès/dégâts UD‑4L | `DONE_RUNTIME` | atlas 4×4, quatre clips, transition jouable |
| Sept fits M577 | `DONE_AUTHORED_FAMILY` | résolution explicite vers `vehicle.m577-apc.action` |
| Manifeste | `DONE` | 182 atlas / 2 564 cellules |
| Équipements portables | `DONE_V56` | 106/106 fiches résolues |
| Props statiques/interactifs audités | `DONE_V58` | 47/47 chemins présents, hashes distincts |

## Restant sans faux placeholder

| Priorité | Lot | État | Condition de sortie |
| --- | --- | --- | --- |
| P0 | M22A3 accès/dégâts | `BLOCKED_REFERENCE` | source visible prouvant la géométrie de trappe du modèle exact |
| P0 | 14 familles d’armes B09 | `BLOCKED_CANON_GATE` | modèle exact sélectionné pour M39, M42A, M6B, M83, M5, M94, Heavy Pulse Rifle, F44AA, Type 88, AK‑4047, ES‑4, Compound Bow, Harpoon Gun et Plasma Rifle |
| P0 | M570 | `BLOCKED_NO_PUBLISHED_SILHOUETTE` | silhouette publiée du châssis exact |
| P0 | M292 | `BLOCKED_BASELINE_VARIANT` | décision documentée baseline ou M292A2 et angles correspondants |
| P0 | AD‑19D Bearcat | `BLOCKED_REAR_GEOMETRY` | géométrie D et arrière documentées |
| P1 | Cinq overlays de fits 4×2 | `READY_AFTER_ACCESS` | produire après validation de chaque châssis d’accès |
| P1 | Embarquement physique de l’escouade IA | `OPEN_GAMEPLAY` | séquencer chaque équipier sans téléportation ni blocage de porte |

## Dette visuelle du hub issue de l’audit V59

| Priorité | Défaut | État | Correction attendue |
| --- | --- | --- | --- |
| P0 | fausses silhouettes de porte dans Medical, Science Lab, Quarantine et Life Support | `OPEN` | nettoyer les MID et déclarer des sockets issus de la topologie réelle |
| P0 | kit de traversée trop répété | `OPEN` | plateformes, échelles, conduits et occlusions par pont/salle |
| P1 | UD‑4L du hangar sous-dimensionné et parallaxe dessiné trop tard | `OPEN` | échelle/collisions panoramiques et ordre de composition corrigés |

Ces défauts sont des travaux réels ouverts, pas des fonctionnalités déclarées terminées. Ils forment le prochain lot de level design après la publication V59.
