# Parité du projet ChatGPT — V70

Date : 5 septembre 2026.

Source auditée : projet ChatGPT « Aliens tantalus project », 19 conversations identifiées dans `src/special-operations-v67.js`.

## État mesuré

| Statut global des promesses | Nombre |
|---|---:|
| Effectif | 2 |
| Partiel | 8 |
| Manquant | 9 |
| Total | 19 |
| Lots réellement planifiables | 4 |
| Campagnes totales | 440 |

Les quatre lots accessibles sont Cargo Brutal, QZ-17, Doctrine Alpha / Bravo et Systèmes de survie Alien. Cargo Brutal et Systèmes de survie Alien sont `effective`. QZ-17 et Alpha/Bravo restent `partial`, car une route jouable ne ferme pas automatiquement l’intégralité de leur conversation source.

## Lot produit — Systèmes de survie Alien

- campagne `special-alien-survival-systems`, sur `world-05-lethe` ;
- mode `SURVIVAL`, objectif `escape the quarantine`, niveau `ship-interior-vertical` à trois routes ;
- six salles cohérentes traversées physiquement jusqu’à l’extraction ;
- routage d’une énergie limitée entre support-vie, sécurité et CCTV ;
- pression et oxygène par salle, avec propagation conditionnée par les portes et les brèches ;
- sas soudables par action temporisée ;
- caméras de sécurité consultables sans figer ennemis, pression, acide ou compte à rebours ;
- flaques d’acide persistantes et bornées ;
- autodestruction à deux autorisations, compte à rebours et extraction pressurisée ;
- HUD diégétique d’information et de commande, actif seulement à portée de l’équipement physique ;
- sauvegarde validée de l’état structurel et résolution unique liée au déploiement.

Le lot est compté `effective` uniquement pour les six mécaniques enregistrées : autodestruction, portes soudables, pression, routage énergétique, caméras de sécurité et acide persistant. Cette classification ne certifie pas les 17 autres conversations `partial` ou `missing`.

## Art et fidélité

L’atlas dédié OpenAI ImageGen couvre huit états de console, vanne, soudure et autodestruction. Son contrat est `alien-survival-systems-atlas-v70` et son SHA-256 runtime est `6f3d8d37c38d6528609e870adb815f550c4d98f998379e42dc49a4046a8ce366`. Les outils, le sas et l’acide existants sont réemployés avec leurs identités propres.

`canonExact` reste `false`. Les assets sont des créations originales du projet/OpenAI inspirées de la direction artistique, sans prétendre recopier les pixels officiels. La licence supposée par l’utilisateur n’est pas présentée comme une validation juridique vérifiée.

## Validation de release

La gate complète est acquise : 46/46 tests V70 ciblés, 887 réussites et 1 skip Windows attendu sur 888 tests, lint de 268 modules, build v70.0.0 de 3 450 entrées, PWA filtrée, parcours bureau et mobile, reprises critiques, 0 erreur navigateur, 0 violation axe et production Vercel `READY` vérifiée en HTTP sur l’alias canonique.

La QA navigateur a également supprimé deux faux succès de prototype : l’insertion létale causée par des menaces restaurées au spawn et le délai générique de quarantaine qui pouvait échouer avant l’armement physique de l’autodestruction.
