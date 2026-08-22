# Historique de version — v55

## Objet

v55 est une release jouable/runtime centrée sur les sprites dédiés, les plaques mission PNJ, les châssis véhicules dédiés et le hangar modulaire. Elle s’appuie sur `docs/ASSET_RUNTIME_INVENTORY_V55.json` comme source de vérité.

## Livré

- 20 atlas dédiés branchés dans le runtime local;
- total porté à 51 atlas / 816 cellules;
- 8 castes ennemies à atlas dédié supplémentaires : Chestburster, Ovomorph, Carrier, Crusher, Lurker, Praetorian, Ravager et Spitter; leurs profils de base sont exacts, leurs modifiers réemploient la famille;
- 8 plaques mission PNJ exactes : Mara Vega, Tamsin Velez, Idris Kwan, Noor Okafor, BISHOP-9, Rook, Sanaa Doyle et Maksim Orlov;
- 4 châssis véhicules exacts : M22A3 Jackson Tank, M577 Command APC, P-5000 Powered Work Loader et UD-4L Cheyenne Dropship;
- hangar dropship modulaire avec 2 couches séparées, dropship physique et hazard électrique dédié;
- 17 props mission documentés, dont `electrical-arc-hazard`;
- couverture ennemie portée à 18 profils exacts, 396 réemplois de famille et 154 profils sans art dédié;
- couverture véhicules portée à 5 profils de base bitmap exacts, 28 fits en réemploi de châssis et 246 profils sans art de châssis, soit 274 sans bitmap exact.

## Non déclaré terminé

- 154 profils ennemis restent sans art dédié;
- 396 profils ennemis restent sur un réemploi de famille déclaré;
- 274 profils véhicules restent sans bitmap exact : 28 fits réemploient un châssis dédié et 246 n’ont pas d’art de châssis;
- 8 PNJ n’ont pas encore de plaque mission dédiée;
- les autres salles du hub n’ont pas encore leurs couches overhead/foreground propres;
- les couches indépendantes par zone restent à produire;
- les hazards dédiés hors acide/électrique restent à produire;
- les sprites dédiés pour drops de ressources et terminaux d’archive restent à produire.

## Portée honnête

v55 décrit un état réellement branché dans le runtime et l’inventaire. Sa gate locale vérifie 97 modules, 167 tests Node, le build 55.0.0 et 13 checkpoints Chrome. La preuve de publication est établie séparément par un déploiement `READY` et des contrôles HTTP de l’alias public.
