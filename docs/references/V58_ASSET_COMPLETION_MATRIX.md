# V58 — matrice de complétude des décors zonés et portes

Date d’arrêt de la matrice : 25 août 2026. Cette vue remplace le statut V56 uniquement pour les familles explicitement couvertes ci-dessous. La [provenance exhaustive des 51 bitmaps](../ART_PROVENANCE_V58.md) porte les chemins et briefs de production.

## Verdict

| Lot V58 | Cible | Présent | Unique | Format | Runtime | Statut |
|---|---:|---:|---:|---|---|---|
| Fonds FAR du hub | 16 | 16 | 16 | 1774 × 887 RGB | `HUB_ROOM_FAR_ART_V58` | `ACCEPTED_RUNTIME` |
| Coques MID du hub | 16 | 16 | 16 | 1774 × 887 RGBA | `HUB_ROOM_MID_ART_V58` | `ACCEPTED_RUNTIME` |
| Couches coloniales FAR | 6 | 6 | 6 | 1600 × 900 RGB | `MISSION_LEVEL_ZONE_LAYER_FILES_V58` | `ACCEPTED_RUNTIME` |
| Couches coloniales MID | 6 | 6 | 6 | 1600 × 900 RGBA | `MISSION_LEVEL_ZONE_LAYER_FILES_V58` | `ACCEPTED_RUNTIME` |
| Couches coloniales foreground | 6 | 6 | 6 | 1600 × 900 RGBA | `MISSION_LEVEL_ZONE_LAYER_FILES_V58` | `ACCEPTED_RUNTIME` |
| Atlas des familles de portes | 1 | 1 | 1 | 2048 × 2048 RGBA, 2 × 4 | `MISSION_DOOR_ART_V58` | `ACCEPTED_RUNTIME` |
| **Total nouveaux bitmaps V58** | **51** | **51** | **51** | — | branchés | **51/51** |

`ACCEPTED_RUNTIME` signifie ici : fichier réel, contrat déclaré, préchargement/registre actif et gate automatisée ciblée. Le gate de publication V58 est lui aussi passé le 25 août 2026 : déploiement Vercel `dpl_6aEDKDA4cNvCrV8rbGJ4xPsty1mw` **READY**, alias public en **HTTP 200**, puis QA distante complète sans échec.

### Réemplois physiques complémentaires

| Élément | Fichier existant | Runtime V58 | Statut |
|---|---|---|---|
| M577 Vehicle Bay | `assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png` | bitmap autonome, collider et interaction | `ACCEPTED_RUNTIME_REUSE` |
| UD-4L hangar | `assets/openai/sprites/normalized/vehicles/ud-4l-cheyenne-dropship-action-sheet.png` | couche dropship indépendante du foreground | `ACCEPTED_RUNTIME_REUSE` |
| Facehugger `neuro-002` | `assets/openai/sprites/normalized/enemies/facehugger-locomotion-sheet.png` | identité exacte, aucun fallback Drone | `ACCEPTED_RUNTIME_REUSE` |

Ces trois réemplois sont testés mais ne changent pas le total **51/51** des nouveaux bitmaps V58.

## Résolution du snapshot V56

| Famille du snapshot V56 | État V56 | Vérité V58 |
|---|---|---|
| Hub salle par salle | couches overhead/foreground et contrôle hangar présents, mais FAR/MID propres aux 16 salles non couverts | 16 FAR + 16 MID ajoutés; les 32 nouveaux chemins sont uniques et non collidables |
| Zones coloniales | 6 zones × 3 couches encore manquantes | les 18 fichiers sont présents et résolus par `colony-multiroute` |
| Registre des zones de mission | 18 couches navire présentes, planète/colonie en progression dans le snapshot | 18 zones × 3 couches = 54 bitmaps uniques dans le registre V58 : 18 navire, 18 planète, 18 colonie |
| Portes de mission | états visuels génériques non normalisés par famille | un atlas dédié expose quatre familles et deux états, avec empreinte stable |

La V58 ne réécrit pas les autres gates V56. Restent notamment soumis à leur preuve exacte : les armes canoniques du lot B09, les modèles M570/M292 baseline/AD-19D non résolus et les extensions de véhicules qui n’ont pas encore leurs fichiers acceptés. Une amélioration du level art ne vaut pas validation d’un roster ou d’une silhouette canonique.

## Couverture hub

Le registre V58 couvre exactement ces 16 identifiants de salle :

| Pont | Salles | FAR | MID |
|---|---|:---:|:---:|
| Command | `bridge`, `briefing`, `combat-information`, `cryo-bay` | 4/4 | 4/4 |
| Habitat | `crew-quarters`, `mess`, `medical`, `science-lab` | 4/4 | 4/4 |
| Industrial | `quarantine`, `armory`, `workshop`, `vehicle-bay` | 4/4 | 4/4 |
| Engineering | `dropship-hangar`, `reactor`, `life-support`, `sensor-array` | 4/4 | 4/4 |

Racine physique : `assets/openai/hub/layers/`. Les noms de fichier exacts et la séparation FAR/MID sont consignés dans [ART_PROVENANCE_V58.md](../ART_PROVENANCE_V58.md#inventaire-exhaustif--hub-32-bitmaps). Le consommateur normatif est `src/hub-art-runtime-v58.js`; `src/hub-game.js` charge et dessine chaque couche dans les limites de sa salle.

Contrat de complétude :

- FAR : RGB opaque, profondeur arrière, aucune collision;
- MID : RGBA, profondeur intermédiaire derrière les entités, aucune collision;
- source 1774 × 887 et composition 1280 × 640;
- aucun alias ou fichier partagé entre deux salles;
- toute salle inconnue résout `null`, jamais une image arbitraire.

## Couverture colonie

| Zone | FAR | MID | Foreground | Statut |
|---|:---:|:---:|:---:|---|
| `colony-approach` | oui | oui | oui | `ACCEPTED_RUNTIME` |
| `colony-habitat` | oui | oui | oui | `ACCEPTED_RUNTIME` |
| `colony-civic` | oui | oui | oui | `ACCEPTED_RUNTIME` |
| `colony-utility` | oui | oui | oui | `ACCEPTED_RUNTIME` |
| `colony-security` | oui | oui | oui | `ACCEPTED_RUNTIME` |
| `colony-landing` | oui | oui | oui | `ACCEPTED_RUNTIME` |

Racine physique : `assets/openai/metroidvania/zones/colony-multiroute/`. Chaque triplet est indépendant et résout par l’identifiant de zone physique. Un identifiant colonie inconnu revient explicitement au triplet générique V52 au lieu de fabriquer une correspondance par nom.

Contrat de complétude :

- FAR : 1600 × 900 RGB opaque;
- MID et foreground : 1600 × 900 RGBA;
- trois chemins uniques par zone, 18/18 sur l’ensemble;
- couche dédiée dessinée une seule fois dans sa zone, sans répétition artificielle;
- transitions de zone fondues par le runtime;
- collisions, portes, échelles, conduits et hazards restent séparés des images.

## Couverture des portes

| Ligne | Rôle visuel | Colonne 0 | Colonne 1 | Cadre source stable |
|---:|---|---|---|:---:|
| 0 | `ship-bulkhead` | fermé | ouvert | oui |
| 1 | `colony-gate` | fermé | ouvert | oui |
| 2 | `security-shutter` | fermé | ouvert | oui |
| 3 | `pressure-airlock` | fermé | ouvert | oui |

Asset : `assets/openai/metroidvania/props/mission-door-states-v58.png`. Le registre `src/mission-door-art-v58.js` conserve la même ligne, le même crop et la même empreinte entre états; seul le décalage de colonne change. Un rôle absent revient explicitement à `ship-bulkhead`.

## Gates automatiques

| Gate | Fichier | Critères principaux |
|---|---|---|
| Hub V58 | `tests/hub-art-runtime-v58.test.mjs` | 16 FAR + 16 MID, chemins uniques, présence, 1774 × 887, RGB/RGBA, préchargement, non-collision |
| Colonie V58 | `tests/mission-zone-art-v58.test.mjs` | six triplets, 18 chemins, 1600 × 900, modes couleur, registre zoné total de 54 |
| Portes V58 | `tests/mission-door-art-v58.test.mjs` | décodage PNG RGBA, 2048 × 2048, huit cellules occupées et distinctes, couples fermé/ouvert |
| M577 physique | `tests/hub-vehicle-art-v58.test.mjs` | identifiant catalogue exact, bitmap prêt, collider et interaction |
| Identités animées | `tests/animation-identity-v57.test.mjs` | Facehugger exact pour `neuro-002`, refus du mauvais sheet et retour marine |
| Topologie | `tests/topology-coherence-v58.test.mjs` | 12 liaisons horizontales et 6 verticales réciproques, destinations et verrous |
| Composite | `scripts/browser-qa-v52.mjs` | 16 checkpoints, 21 captures, 16/16 salles, mission coloniale, hangar, changement de pont et cadrage portrait |

## Règle de maintenance

Toute nouvelle salle ou zone doit ajouter simultanément le fichier physique, le contrat de registre, le préchargement, la couverture de test et une preuve de composite. Une ligne textuelle, un prompt, un alias silencieux ou un bitmap présent mais jamais consommé ne modifie pas ce tableau.
