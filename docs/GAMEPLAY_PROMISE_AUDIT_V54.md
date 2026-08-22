# Audit des promesses de gameplay — v1 à v54

Date de contrôle : 22 août 2026. La matrice exhaustive v1→v52 reste conservée dans `GAMEPLAY_PROMISE_AUDIT_V52.md`; les corrections v53 restent décrites dans `GAMEPLAY_PROMISE_AUDIT_V53.md`. La v54 ne supprime aucune promesse et transforme un nouvel objectif textuel en séquence de jeu vérifiable.

## Postulat de base conservé

Le jeu reste une boucle complète : préparation à bord du Tantalus, choix de campagne, monde, dotation, escouade et véhicule, déplacement physique dans le hub, mission Metroidvania multi-route, combat, objectifs, extraction ou retraite, conséquences, sauvegarde et reprise. Les catalogues restent 64 mondes, 436 campagnes, 146 armes, 106 équipements, 568 profils ennemis, 279 profils véhicules, 16 membres d’équipage, 392 costumes, 158 modules et 800 seeds de niveau.

## Matrice v54

| Promesse | État v54 | Preuve exécutable | Limite déclarée |
|---|---|---|---|
| Hub jouable, pas une page de boutons | `PHYSICAL` | `hub-game`, `hub-v51-runtime`, tests hub et navigateur | Foreground/ceiling propre à chaque salle et dropship physique encore manquants. |
| Missions multi-routes | `PHYSICAL` | trois templates, zones, portes, conduits, échelles et neuf couches | Les sets far/mid/architecture/foreground restent à individualiser par zone. |
| Plateformes lisibles et collisionnées sur leur surface | `PHYSICAL` | profil commun `surfaceY/renderY`, tests level design | Les silhouettes de chaque tuile ne sont pas encore toutes uniques. |
| Escouade physique lisible | `PHYSICAL` | slots calculés depuis la largeur visible, séparation runtime | Les sets mission complets des 16 PNJ restent à produire. |
| Extraction planétaire | `PHYSICAL/PERSISTENT` | balise, vague, verrou 10/14/18 s, compte à rebours, save/resume | Une ancienne sauvegarde sans timer est migrée comme holdout déjà terminé. |
| Joueur visuellement stable | `PHYSICAL` | deux plaques Echo‑9 identity-preserve, événements tir/recul alignés | Mêlée, outil et interactions contextuelles restent sans plaque dédiée. |
| Ennemis regardant leur cible | `PHYSICAL` | orientation source et miroir déterministe | L’orientation ne transforme jamais un réemploi en art exact. |
| Runner distinct | `PHYSICAL` | `enemy.xenomorph-runner.action`, IA pouncer, 16 cellules | Les variantes Runner de famille restent des réemplois déclarés. |
| Ripper Queen distincte | `PHYSICAL` | `enemy.ripper-queen.action`, IA boss, 16 cellules | Les autres castes Ripper restent à produire. |
| Identité des 52 archétypes stable | `SYSTEMIC` | registre exhaustif, 568 profils résolus | 242 profils restent sans art dédié; 216 utilisent une famille authored. |
| Alpha réellement transparent | `RELEASE-GATE` | 31 atlas RGBA, 496 cellules, garde 16 px et analyse anti-damier/chroma | ImageGen peut livrer du RGB; le traitement déterministe reste obligatoire. |
| 36 châssis véhicules jouables | `SYSTEMIC` | six familles physiques et 279 profils compilés | Un seul profil possède un bitmap exact; 278 restent sans plaque dédiée. |
| Sauvegarde/reprise sans refarm | `PERSISTENT` | schema 51, reprise exacte du holdout et signatures recoupées | Aucun changement de schéma requis par v54. |
| PWA/offline | `RELEASE-GATE` | fermeture ESM, 31 atlas en cache, cache `atf-v54-runtime-2` | Le gate navigateur doit repasser à chaque publication. |

## Ce qui est réellement nouveau en v54

- La plaque combat d’Echo‑9 n’est plus mise en quarantaine : visage, armure, proportions et palette correspondent au master locomotion, avec le tir en frame 4 et le recul en frame 5.
- Le Xenomorph Runner et la Ripper Queen possèdent chacun une plaque 4×4 dédiée, un registre runtime, une orientation source et un comportement de jeu adaptés.
- Pathogen Mimic et Pale Crucible Hunter possèdent chacun une plaque 4×4 dédiée, un mapping runtime exact, une orientation source stable et un contrat de clips `idle/chase/attack/death`.
- Les grands îlots clairs enfermés dans les xénomorphes sombres ont été retirés par un traitement alpha déterministe, y compris sur quatre plaques historiques.
- `timer:extraction` n’est plus une chaîne sans effet : la balise déclenche une vague, bloque la sortie et persiste le temps restant jusqu’à survie complète.
- La surface visuelle des plateformes est partagée avec la collision et les positions d’escouade tiennent compte de la largeur réellement dessinée.

## Dette de production encore ouverte

- 242 profils ennemis n’ont toujours pas de plaque dédiée et 216 reposent sur un réemploi de famille annoncé.
- 278 profils véhicules n’ont pas de bitmap exact.
- Les 16 PNJ ont leur locomotion, mais leurs sets combat, blessure, mort et actions de mission restent incomplets.
- Le hub manque encore de foregrounds/ceilings modulaires par salle; les missions manquent de couches indépendantes par zone et de hazards visuels non-acides.

## Gates v54

```powershell
npm.cmd run inventory:v54:check
npm.cmd run sprites:v54:check
npm.cmd run art:v54:check
npm.cmd run lint
npm.cmd test
npm.cmd run build
npm.cmd run qa:browser:v54
```

Une promesse est considérée effective seulement si l’action, son effet runtime, sa persistance éventuelle et sa preuve passent ensemble.
