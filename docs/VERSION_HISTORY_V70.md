# V70 — Systèmes de survie Alien

Date : 5 septembre 2026.

V70 transforme la quatrième directive prioritaire en opération planifiable et jouable dans un niveau physique. Cette release n’achève pas les 19 conversations du projet et ne certifie pas encore le jeu commercial complet.

## Campagne et niveau

- campagne `special-alien-survival-systems` ;
- monde `world-05-lethe`, mode `SURVIVAL`, objectif `escape the quarantine` ;
- gabarit `ship-interior-vertical`, trois routes ;
- six salles reliées : docking, cargo, engineering, habitation, command et extraction ;
- catalogue porté de 439 à 440 campagnes ;
- registre porté à quatre lots jouables.

## Six mécaniques exigées

1. `self-destruct` — double autorisation physique puis compte à rebours de jeu ;
2. `weldable-doors` — soudure temporisée des sas, interrompue par déplacement ou dégâts ;
3. `room-pressure` — pression et oxygène évoluent par salle selon brèches, portes et isolation ;
4. `power-routing` — capacité limitée répartie entre support-vie, sécurité et CCTV ;
5. `security-cameras` — flux consultés depuis une console réelle sans arrêter le monde ;
6. `persistent-acid` — flaques bornées, dommageables et conservées à la reprise.

Le HUD diégétique expose la pression, les circuits, la CCTV, la soudure et l’autodestruction. Ses commandes restent conditionnées par la proximité de la console correspondante : le panneau ne remplace pas la traversée ni les interactions du niveau.

## Sauvegarde et résolution attendues

- état V70 lié à l’identifiant du déploiement courant ;
- circuits, pression, oxygène, portes soudées, intégrité, flux CCTV, acide et secondes restantes sérialisés ;
- temps d’autodestruction conservé en secondes de jeu, sans dépendance à l’horloge murale ;
- flaques ennemies identifiées de façon déterministe afin d’éviter leur duplication ;
- récompense unique seulement après validation des six mécaniques et extraction pressurisée ;
- reprise ancienne hors V70 préservée.

Ces règles sont validées par les tests de production, de reprise et de résolution V70.

## Durcissement issu de la QA jouable

- la zone d’insertion déplace les ennemis et l’acide hors du rayon sûr sans effacer les menaces ni les récompenses ;
- une reprise au checkpoint nettoie les projectiles hostiles proches avant de rendre le contrôle ;
- le délai générique de 105 secondes de l’objectif « escape » est neutralisé pour cette campagne : seul le compte à rebours physique, déclenché après les deux clés, peut faire expirer la mission ;
- la topologie pression suit les vraies portes : `aft-bulkhead` relie command à extraction et `outer-airlock` ventile extraction vers le réservoir de vide `ship-exterior`, qui n’est pas une septième salle jouable ;
- l’armement revérifie le circuit sécurité après les deux autorisations ;
- le dock est rafraîchi à 8 Hz afin que salle, pression, proximité et prompt suivent le déplacement sans attendre un événement secondaire.

## Art V70

Le nouvel atlas OpenAI ImageGen `alien-survival-systems-atlas-v70.png` contient huit états système sur une grille RGBA `4 × 2`. Son SHA-256 est `6f3d8d37c38d6528609e870adb815f550c4d98f998379e42dc49a4046a8ce366`. La production reste une création originale du projet, avec `canonExact: false`. Les outils, le sas V58 et l’acide déjà validés sont réemployés explicitement.

## État des Special Operations

| Mesure V70 | Nombre |
|---|---:|
| Conversations recensées | 19 |
| Lots jouables | 4 |
| `effective` | 2 |
| `partial` | 8 |
| `missing` | 9 |
| Campagnes totales | 440 |

Cargo Brutal et Systèmes de survie Alien sont les deux lots `effective`. QZ-17 et Doctrine Alpha / Bravo restent jouables mais `partial` à l’échelle de leur promesse complète.

## Gates de sortie V70

| Gate | État | Résultat |
|---|---|---|
| Tests V70 ciblés | **RÉUSSI** | 46/46 |
| Lint complet | **RÉUSSI** | 268 modules |
| Suite de tests complète | **RÉUSSI** | 887 réussis, 1 skip Windows attendu, 0 échec sur 888 |
| Build et contenu 440 campagnes | **RÉUSSI** | v70.0.0, 3 450 entrées catalogue |
| Contrat PWA et exclusions de production | **RÉUSSI** | CSS, runtime et atlas présents ; master et metadata absents de `dist` |
| Parcours navigateur 1280 × 720 | **RÉUSSI** | checkpoint clavier, délai > 105 s, traversée docking → cargo, HUD 100 → 88 kPa |
| Parcours tactile 390 × 844 | **RÉUSSI** | dock défilable et appui tactile droit : +158 px |
| Reprise en dépressurisation | **RÉUSSI** | état pression/oxygène/acide restauré par test production |
| Reprise pendant l’autodestruction | **RÉUSSI** | secondes restantes et autorisations restaurées sans horloge murale |
| Console et accessibilité | **RÉUSSI** | 0 erreur navigateur, 0 violation axe ; 1 contrôle contraste indéterminé sur gradients |
| Déploiement Vercel et HTTP public | **RÉUSSI** | production `READY` ; alias canonique, build-info, CSS, runtime et atlas en 200 ; master et metadata en 404 |

Les détails du parcours réel et des défauts corrigés sont consignés dans `docs/V70_BROWSER_QA.md`.

Production validée : [aliens-tantalus-frontier.vercel.app](https://aliens-tantalus-frontier.vercel.app), version publique `70.0.0` et 440 campagnes dans `build-info.json`. Le déploiement de validation `dpl_HEupyPagTeaEPGdjbKv9TpMKRnW9` était `READY` et sans log d’erreur serveur.
