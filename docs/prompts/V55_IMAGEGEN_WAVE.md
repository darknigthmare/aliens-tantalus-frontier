# V55 — vague ImageGen ennemis, PNJ mission et véhicules

Cette note documente le contrat de production v55 à partir des assets réellement présents dans le workspace, de l’inventaire machine v55 et des IDs confirmés par le journal parent. Elle ne reconstruit pas les IDs absents ni les prompts exacts non conservés dans le dépôt.

## Périmètre réel

- 8 atlas ennemis dédiés
- 8 atlas PNJ mission dédiés
- 4 atlas véhicules dédiés
- 3 bitmaps hangar/props : overhead, foreground, electrical hazard
- total runtime local : 51 atlas / 816 cellules

## Contrat des ennemis

Les huit castes ajoutées en v55 sont branchées avec des atlas dédiés et routent 88 profils de catalogue : 8 profils de base exacts et 80 modifiers en réemploi de famille déclaré.

- Chestburster
- Ovomorph
- Carrier
- Crusher
- Lurker
- Praetorian
- Ravager
- Spitter

Contrat de clips :

- `enemy-action-v54` pour Chestburster, Carrier, Crusher, Lurker, Praetorian, Ravager, Spitter
- `ovomorph-cycle-v55` pour Ovomorph

Contraintes de production retenues :

- vue de profil strictement lisible
- facing source à droite
- silhouettes complètes dans la cellule
- grille normalisée runtime
- aucune confusion avec une simple variante Drone

Variantes rejetées connues :

- Carrier : `exec-81b93d3d-23a5-4d2b-86c1-061d8a249d98.png`
- Ravager : `exec-5aa3d8dd-50d1-4d74-a280-460f3038a2e8.png`
- pour les autres sujets, les rejets ne sont pas complétés ici quand leurs IDs exacts ne sont pas connus

## Contrat des PNJ mission

Les huit plaques mission v55 couvrent :

- Mara Vega
- Tamsin Velez
- Idris Kwan
- Noor Okafor
- BISHOP-9
- Rook
- Sanaa Doyle
- Maksim Orlov

Clips mission attendus :

- `ready`
- `fire`
- `role-support`
- `cover`
- `traversal`
- `climb`
- `hurt`
- `downed`
- `dead`
- `wounded-death`

Le reste d’Echo-9 n’est pas déclaré terminé : 8 membres n’ont toujours pas de plaque mission dédiée.

## Contrat des véhicules

Les quatre atlas véhicules dédiés couvrent :

- M22A3 Jackson Tank
- M577 Command APC
- P-5000 Powered Work Loader
- UD-4L Cheyenne Dropship

Objectif de la vague :

- sortir de la simple silhouette famille pour ces quatre châssis
- fournir un rendu exact pour chacun des quatre profils de base
- router les 28 fits vers la bonne plaque de châssis en les déclarant `authored-family`, jamais exacts
- conserver le reste des châssis en dette explicite

## Hangar modulaire v55

La vague v55 ne se limite pas aux atlas :

- 2 couches hangar indépendantes sont documentées
- le dropship du hangar est physique
- un hazard électrique dédié est séparé du décor

Bitmaps hangar confirmés :

- overhead : `exec-03fe8784-61cc-4eef-9f64-ad0284c52587.png`
- foreground : `exec-077183a4-3cc5-4231-bdf7-f3047963fa06.png`
- electrical hazard : `exec-f6be8bc2-3124-4c12-855f-f84646ba5279.png`

Ce contrat interdit une image monolithique unique pour le hangar.

## IDs acceptés confirmés

- Praetorian : `exec-624df10e-9a63-4163-a72c-c44ba5ea2111.png`
- Spitter : `exec-f0d7f17f-0a77-405d-8361-9f014526708a.png`
- Ovomorph : `exec-988a4ced-e1e5-432d-8f7e-e4da684063d3.png`
- Chestburster : `exec-11f1acd8-38a9-4891-ab8e-5d2a9e7b42b2.png`
- Crusher : `exec-99ddc94e-c6a3-427c-9646-e258a2e86c08.png`
- Lurker : `exec-ed706d9f-1c0f-4c0a-8955-f9b1ea2a3fb7.png`
- Carrier : `exec-7e06ea3f-4dfb-420d-830f-00289fe486f1.png`
- Ravager : `exec-221edc06-236a-439e-aa7f-748736071294.png`
- UD-4L : `exec-6a73e027-b344-4e16-ba89-79b77f89466f.png`
- M22A3 : `exec-2fcbb4ab-0347-4946-ba14-788c2eb11f02.png`
- P-5000 : `exec-b9749e4d-1633-4bb9-ad22-eadcf8f41415.png`
- M577 Command : `exec-61c3d8ea-eb4b-4c2c-8290-7f2d990b86ab.png`
- Mara Vega : `exec-a067c01a-cd2d-407e-89ff-53fdec4f0aa6.png`
- Tamsin Velez : `exec-f3008838-3c53-4a36-a008-700a22460f0f.png`
- Idris Kwan : `exec-a64ea793-94f5-4455-89ac-25681f46870d.png`
- Noor Okafor : `exec-b7aacbe5-e9bb-43b6-9106-33fe3bf15fe0.png`
- BISHOP-9 : `exec-dde30ae5-8817-4306-89ee-95136360226a.png`
- Sanaa Doyle : `exec-1392a934-fdf5-4412-9e43-5fd57a33e532.png`
- Rook : `exec-33def993-fbfa-4975-81ba-e3a2d72dbb51.png`
- Maksim Orlov : `exec-77b64110-173a-4b1e-b3b8-2af7bc34f674.png`

## Ce qui manque encore
- 154 profils ennemis sans art dédié
- 274 profils véhicules sans bitmap exact : 28 fits en réemploi de châssis et 246 profils sans art de châssis
- 8 PNJ sans plaque mission
- autres salles du hub sans modules overhead/foreground dédiés
- hazards dédiés feu, vapeur, radiation, inondation, vide et obscurité
- drops de ressources et terminaux d’archive dédiés
