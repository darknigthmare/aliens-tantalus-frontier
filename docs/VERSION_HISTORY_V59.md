# ALIENS: TANTALUS FRONTIER — V59

Version applicative : 59.0.0. Date de préparation : 25 août 2026.

## Résultat de la vague

V59 transforme l’entrée et la sortie des véhicules compatibles en une action physique visible. Appuyer sur `V` ne téléporte plus immédiatement le joueur dans le véhicule : le runtime joue une séquence d’ouverture, ne change l’occupation qu’à sa fin, montre une sécurisation courte, puis exige une séquence de sortie avant de rendre le contrôle au marine.

Quatre châssis disposent d’une plaque OpenAI ImageGen dédiée 4×4 :

- M577 Armored Personnel Carrier ;
- M577 Command APC ;
- P‑5000 Powered Work Loader ;
- UD‑4L Cheyenne Dropship.

Chaque plaque contient ouverture/accès, sécurisation sans occupant peint, sortie/fermeture et dégâts critiques jusqu’à l’épave. Les plaques d’action précédentes restent la source de locomotion et d’action; la plaque V59 n’est prioritaire que pendant l’accès, la sécurisation et l’état détruit.

## Gameplay et runtime

- L’occupation reste `false` pendant l’ouverture et ne passe à `true` qu’après la dernière frame.
- Une sortie garde le marine à bord jusqu’à la fin du clip et bloque propulsion et direction pendant la transition.
- Une destruction interrompt proprement une transition et garde l’épave non pilotable.
- Le snapshot expose `vehicleAccessRuntime` : phase, horloge, occupation et animation résolue.
- Les quatre images V59 sont préchargées par le registre global `SPRITE_SHEETS` et incluses dans la PWA.
- Un occupant est exclu du contrôle de chute du niveau : aucun dégât ou retour checkpoint fantôme ne peut frapper le véhicule pendant l’accès.
- Les sept fits Recon, Assault, Rescue, Colonial, Frontier, Prototype et Apex du M577 réemploient explicitement le bitmap du châssis standard au lieu de tomber sur le dessin Canvas générique.

## Contrat d’animation

Le clip set `vehicle-access-damage-v59` est strictement row-major :

| Ligne | Clip | Frames | Rôle |
| ---: | --- | --- | --- |
| 0 | `access-open` | 0–3 | déverrouillage et ouverture |
| 1 | `secure-occupied` | 4–7 | sécurisation et fermeture |
| 2 | `exit-close` | 8–11 | sortie et fermeture |
| 3 | `critical-wreck` | 12–15 | dégâts critiques et épave |

Les quatre plaques sont en 1024×1024 RGBA, grille 4×4, garde transparente 16 px, profil droit, 16 cellules occupées et 16 hashes distincts. Pivot, hitbox et dimensions de rendu restent ceux du master de chaque châssis.

## Manifeste et PWA

- manifeste : `v59` ;
- atlas : 178 → 182 ;
- cellules : 2 500 → 2 564 ;
- fichiers V59 contrôlés : 8, soit 4 masters bruts et 4 normalisés ;
- cache PWA : `atf-v59-runtime-1` ;
- module hors-ligne ajouté : `src/vehicle-access-runtime-v59.js`.

## Limites honnêtes

Le M22A3 Jackson ne reçoit pas encore de plaque d’accès : la référence déclarée précédemment pointe vers un index d’armes et ne prouve pas la géométrie de sa trappe. Le produire maintenant aurait inventé un modèle présenté à tort comme fidèle.

Les cinq overlays de fits 4×2 restent après validation des accès. Les quatorze familles d’armes B09, le M570, le M292 et l’AD‑19D restent bloqués par leurs gates de référence exacte. Les dettes visuelles du hub relevées pour la prochaine vague sont consignées dans la matrice V59.

## Validation

Gate locale réussie le 25 août 2026 : synchroniseur V59 à **182 atlas / 2 564 cellules**, contrôle pixel des 182 atlas et des quatre nouvelles plaques, lint de **130 modules**, **248/248 tests Node** et build statique **59.0.0** de **3 443 entrées**. Le parcours navigateur local est également vert avec **17 checkpoints**, **24 captures**, les **16/16 salles** du hub, les trois phases d’accès véhicule, la PWA hors ligne et zéro exception, erreur console ou requête échouée. La répétition sur la production Vercel reste la dernière gate de publication.
