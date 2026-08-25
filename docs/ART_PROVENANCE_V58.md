# Provenance artistique OpenAI — vague V58

Date de traçabilité : 25 août 2026. Release : 58.0.0. Fournisseur déclaré pour cette vague : OpenAI ImageGen intégré.

## Portée et niveau de preuve

La V58 ajoute **51 bitmaps de production réellement présents et branchés** :

- 16 fonds FAR propres aux 16 salles du hub;
- 16 coques MID propres aux mêmes salles;
- 18 couches coloniales, soit 6 zones × FAR, MID et foreground;
- 1 atlas de portes regroupant 4 familles et 2 états.

Ces images ont été créées pour Tantalus Frontier. Elles reprennent une grammaire visuelle industrielle de survival horror, mais n’embarquent ni extraction de sprite, ni capture de jeu, ni texture, logo, interface ou key art officiel. Les références de franchise ont servi à cadrer le ton et la fonction; les fichiers livrés restent des créations originales du projet.

Le workspace courant ne conserve pas d’archive source V58 avec identifiant `exec-…`, ni un journal garantissant le texte brut exact de chaque appel. Les briefs ci-dessous sont donc des **briefs de production normalisés et reconstitués à partir des contrats runtime et des livrables acceptés**. Ils ne sont pas présentés comme les prompts bruts exacts envoyés à ImageGen.

## Chaîne de production et normalisation

1. Une fonction visuelle est isolée par salle, zone ou famille de porte.
2. ImageGen produit une interprétation originale, sans élément interactif intégré.
3. Le livrable est normalisé au format du moteur : dimensions fixes, perspective latérale, cadrage cohérent et mode couleur attendu.
4. Les fonds FAR sont aplatis en RGB opaque. Les couches MID/foreground et l’atlas de portes restent en RGBA.
5. Toute matte neutre ou damier de présentation connecté au bord doit être retiré techniquement sans redessiner le sujet. Le démattage est limité au fond et au despill de bord; il ne modifie ni silhouette, ni architecture, ni état de porte.
6. Le fichier ne devient un asset de production qu’après présence physique, branchement au registre, contrôle automatisé et composite à l’échelle de jeu.

Les variantes non retenues ne sont pas archivées dans ce dépôt et aucun identifiant de rejet n’est inventé. Sont rejetés par contrat : fond opaque dans une couche RGBA, faux passage peint, sol ou plateforme paraissant praticable sans collider, acteur ou pickup intégré, texte ou logo lisible, perspective isométrique, incohérence d’échelle entre états, débordement de cellule et reprise reconnaissable d’un bitmap officiel.

## Contrats techniques et consommateurs runtime

| Famille | Format de production | Alpha | Contrat de composition | Consommateurs |
|---|---|---|---|---|
| Hub FAR | 1774 × 887, PNG 8 bits, RGB | opaque, type PNG 2 | cadré dans 1280 × 640, phase arrière, non collidable | `src/hub-art-runtime-v58.js` → `src/hub-game.js` (`drawHubRoomFarV58`) |
| Hub MID | 1774 × 887, PNG 8 bits, RGBA | canal alpha, type PNG 6 | cadré dans 1280 × 640, derrière acteurs/portes/props, non collidable | `src/hub-art-runtime-v58.js` → `src/hub-game.js` (`drawHubRoomMidV58`) |
| Colonie FAR | 1600 × 900, PNG 8 bits, RGB | opaque, type PNG 2 | parallaxe 0,075, couche zonée non répétée | `src/game-v52-level-runtime.js` (`MISSION_LEVEL_ZONE_LAYER_FILES_V58`) |
| Colonie MID | 1600 × 900, PNG 8 bits, RGBA | canal alpha, type PNG 6 | parallaxe 0,32, couche zonée non répétée | `src/game-v52-level-runtime.js` (`missionLevelLayerImage`, `drawMissionLevelCover`) |
| Colonie foreground | 1600 × 900, PNG 8 bits, RGBA | canal alpha, type PNG 6 | avant-plan visuel; aucune collision | `src/game-v52-level-runtime.js` (`drawForeground`) |
| Portes | 2048 × 2048, PNG 8 bits, RGBA, grille 2 × 4 | transparence autour des silhouettes, type PNG 6 | cellules 1024 × 512; fermé à gauche, ouvert à droite | `src/mission-door-art-v58.js` → `src/game-v51-runtime.js` (`getDoorRenderState`) |

Aucun de ces 51 bitmaps ne définit une collision, une plateforme, une échelle, un conduit ou une serrure. Ces vérités restent dans les plans de niveau et la topologie runtime.

## Inventaire exhaustif — hub, 32 bitmaps

Les deux chemins de chaque ligne sont indépendants; FAR n’est pas un alias de MID.

| Salle runtime | FAR — RGB opaque | MID — RGBA |
|---|---|---|
| `bridge` | `assets/openai/hub/layers/command-bridge-far.png` | `assets/openai/hub/layers/command-bridge-mid.png` |
| `briefing` | `assets/openai/hub/layers/command-briefing-far.png` | `assets/openai/hub/layers/command-briefing-mid.png` |
| `combat-information` | `assets/openai/hub/layers/command-cic-far.png` | `assets/openai/hub/layers/command-cic-mid.png` |
| `cryo-bay` | `assets/openai/hub/layers/command-cryo-far.png` | `assets/openai/hub/layers/command-cryo-mid.png` |
| `crew-quarters` | `assets/openai/hub/layers/habitat-quarters-far.png` | `assets/openai/hub/layers/habitat-quarters-mid.png` |
| `mess` | `assets/openai/hub/layers/habitat-mess-far.png` | `assets/openai/hub/layers/habitat-mess-mid.png` |
| `medical` | `assets/openai/hub/layers/habitat-medical-far.png` | `assets/openai/hub/layers/habitat-medical-mid.png` |
| `science-lab` | `assets/openai/hub/layers/habitat-lab-far.png` | `assets/openai/hub/layers/habitat-lab-mid.png` |
| `quarantine` | `assets/openai/hub/layers/industrial-quarantine-far.png` | `assets/openai/hub/layers/industrial-quarantine-mid.png` |
| `armory` | `assets/openai/hub/layers/industrial-armory-far.png` | `assets/openai/hub/layers/industrial-armory-mid.png` |
| `workshop` | `assets/openai/hub/layers/industrial-workshop-far.png` | `assets/openai/hub/layers/industrial-workshop-mid.png` |
| `vehicle-bay` | `assets/openai/hub/layers/industrial-vehicle-bay-far.png` | `assets/openai/hub/layers/industrial-vehicle-bay-mid.png` |
| `dropship-hangar` | `assets/openai/hub/layers/engineering-hangar-far.png` | `assets/openai/hub/layers/engineering-hangar-mid.png` |
| `reactor` | `assets/openai/hub/layers/engineering-reactor-far.png` | `assets/openai/hub/layers/engineering-reactor-mid.png` |
| `life-support` | `assets/openai/hub/layers/engineering-life-support-far.png` | `assets/openai/hub/layers/engineering-life-support-mid.png` |
| `sensor-array` | `assets/openai/hub/layers/engineering-sensors-far.png` | `assets/openai/hub/layers/engineering-sensors-mid.png` |

### Briefs hub normalisés

Brief commun : élévation side-scroller stricte, horizon identique au master 1774 × 887, coque rétrofuturiste sombre, métal usé, accents ambre/teal contenus, lisibilité à 1280 × 720; aucun acteur, créature, véhicule, pickup, hazard, UI, texte, logo, porte fonctionnelle ou sol collidable peint.

| Salle | Identité visuelle demandée; séparation modulaire |
|---|---|
| Bridge | profondeur de passerelle et baies d’observation; terminaux jouables et bulkheads restent séparés |
| Briefing | alcôves de commandement et structure de plafond; table de briefing séparée |
| CIC | racks tactiques et volumes de calcul, écrans illisibles; consoles interactives séparées |
| Cryo Bay | volume froid, conduites et niches vides; cryopodes props séparés |
| Crew Quarters | coursive habitée, casiers et cloisons en profondeur; couchettes props séparées |
| Mess | galley et lumière utilitaire en profondeur; tables et sièges interactifs séparés |
| Medical | clinique compacte, verre et armoires distantes; lits et consoles séparés |
| Science Lab | baies scientifiques, conduites et vitrages vides; spécimens, scanners et terminaux séparés |
| Quarantine | decon, verre d’observation et cradle vide; aucun captif ni hazard intégré |
| Armory | cages sécurisées et stockage abstrait; aucune arme ramassable peinte |
| Workshop | machines, rails et câbles d’atelier; établi et outils interactifs séparés |
| Vehicle Bay | volume technique, pont roulant et rails vides; aucun véhicule intégré |
| Dropship Hangar | coque de hangar et gantries lointains; dropship, portes et hazard électrique séparés |
| Reactor | profondeur blindée et chaleur ambre; colonne de réacteur et hazards séparés |
| Life Support | rangées de traitement d’air et conduites; scrubbers et fuites interactives séparés |
| Sensor Array | racks de capteurs et distribution de câbles; console de capteurs séparée |

## Inventaire exhaustif — colonie, 18 bitmaps

| Zone runtime | FAR — RGB opaque | MID — RGBA | Foreground — RGBA |
|---|---|---|---|
| `colony-approach` | `assets/openai/metroidvania/zones/colony-multiroute/colony-approach-far.png` | `assets/openai/metroidvania/zones/colony-multiroute/colony-approach-mid.png` | `assets/openai/metroidvania/zones/colony-multiroute/colony-approach-foreground.png` |
| `colony-habitat` | `assets/openai/metroidvania/zones/colony-multiroute/colony-habitat-far.png` | `assets/openai/metroidvania/zones/colony-multiroute/colony-habitat-mid.png` | `assets/openai/metroidvania/zones/colony-multiroute/colony-habitat-foreground.png` |
| `colony-civic` | `assets/openai/metroidvania/zones/colony-multiroute/colony-civic-far.png` | `assets/openai/metroidvania/zones/colony-multiroute/colony-civic-mid.png` | `assets/openai/metroidvania/zones/colony-multiroute/colony-civic-foreground.png` |
| `colony-utility` | `assets/openai/metroidvania/zones/colony-multiroute/colony-utility-far.png` | `assets/openai/metroidvania/zones/colony-multiroute/colony-utility-mid.png` | `assets/openai/metroidvania/zones/colony-multiroute/colony-utility-foreground.png` |
| `colony-security` | `assets/openai/metroidvania/zones/colony-multiroute/colony-security-far.png` | `assets/openai/metroidvania/zones/colony-multiroute/colony-security-mid.png` | `assets/openai/metroidvania/zones/colony-multiroute/colony-security-foreground.png` |
| `colony-landing` | `assets/openai/metroidvania/zones/colony-multiroute/colony-landing-far.png` | `assets/openai/metroidvania/zones/colony-multiroute/colony-landing-mid.png` | `assets/openai/metroidvania/zones/colony-multiroute/colony-landing-foreground.png` |

### Briefs colonie normalisés

Brief commun : triplet 1600 × 900, caméra latérale fixe, météo humide et architecture de colonie frontière originale. FAR fournit l’horizon opaque; MID apporte la structure secondaire détourée; foreground apporte des silhouettes proches recadrées. Aucun sol jouable, porte, échelle, terminal, pickup, hazard, personnage, créature, véhicule ou signalétique lisible n’est intégré.

| Zone | FAR | MID | Foreground |
|---|---|---|---|
| Approach | tempête et blocs lointains | périmètre et gate non fonctionnel | grillage/câbles recadrés, sans bloquer la lecture |
| Habitat | blocs d’habitation sous la pluie | façades et passerelles de profondeur | auvents et conduites proches, sans civil ni feu interactif |
| Civic | tour et ciel chargé | plaza et volumes administratifs | fumée atmosphérique et cadres proches, sans foule ni texte |
| Utility | profondeur bétonnée | tuyaux et machinerie distante | conduites proches, vapeur seulement atmosphérique |
| Security | bunker et enceinte | checkpoint et shutters décoratifs | cadres défensifs proches, sans gate/tourelle/terminal jouable |
| Landing | horizon d’évacuation | pad et silhouette lointaine originale | balises et structures proches non interactives, sans châssis exact intégré |

## Inventaire exhaustif — portes, 1 bitmap

| Asset | Contenu | Format et alpha | Consommateur |
|---|---|---|---|
| `assets/openai/metroidvania/props/mission-door-states-v58.png` | 4 lignes : `ship-bulkhead`, `colony-gate`, `security-shutter`, `pressure-airlock`; fermé à gauche, ouvert à droite | 2048 × 2048 RGBA; 8 cellules 1024 × 512 | `src/mission-door-art-v58.js`, chargé sous `missionDoorStatesV58` par `src/game-v51-runtime.js` |

Brief normalisé : quatre familles originales adaptées à leur fonction, en profil latéral orthographique; chaque paire conserve pivot, cadrage et empreinte. L’état ouvert montre un passage visuel sans ajouter d’acteur, de sol, de bouton, de UI ou de texte. Toute cellule vide, bleed inter-cellule, changement d’échelle fermé/ouvert ou fusion de deux familles est rejeté.

## Réemplois runtime non comptés dans les 51 nouveaux bitmaps

Ces éléments sont branchés physiquement dans les scènes V58, mais réemploient des plaques déjà normalisées et ne sont donc pas présentés comme de nouvelles générations :

| Usage V58 | Plaque réemployée | Contrat runtime |
|---|---|---|
| M577 autonome de la Vehicle Bay | `assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png` | `VEHICLE_BAY_ART_V58`, collision, interaction et `vehicle-001-m577-armored-personnel-carrier` |
| UD-4L du hangar | `assets/openai/sprites/normalized/vehicles/ud-4l-cheyenne-dropship-action-sheet.png` | `UD4L_DROPSHIP_V55`, couche indépendante désormais dégagée du foreground |
| Facehugger du profil `neuro-002` | `assets/openai/sprites/normalized/enemies/facehugger-locomotion-sheet.png` | `enemy.facehugger.locomotion`, identité exacte dérivée de `enemy-002-facehugger` |

Leur présence est contrôlée à l’échelle de jeu; elle ne modifie pas le décompte **51/51** des bitmaps créés dans la vague V58.

## QA et critères d’acceptation

| Gate | Preuve dans le dépôt |
|---|---|
| Présence, unicité, dimensions et type couleur des 32 couches hub | `tests/hub-art-runtime-v58.test.mjs` |
| Présence, unicité, dimensions et type couleur des 18 couches coloniales; registre total de 54 couches zonées | `tests/mission-zone-art-v58.test.mjs` |
| Signature, décodage RGBA, dimensions, occupation des 8 cellules, distinction fermé/ouvert et 8 hashes distincts | `tests/mission-door-art-v58.test.mjs` |
| Branchement et rendu FAR/MID des salles | `src/hub-art-runtime-v58.js`, `src/hub-game.js` |
| Branchement et transition des triplets coloniaux | `src/game-v52-level-runtime.js` |
| Branchement des portes et maintien du cadre | `src/mission-door-art-v58.js`, `src/game-v51-runtime.js` |
| Identité M577, présence, collision et interaction | `tests/hub-vehicle-art-v58.test.mjs` |
| Identité Facehugger puis retour marine | `tests/animation-identity-v57.test.mjs`, `scripts/browser-qa-v52.mjs` |
| Composite réel des 16 salles, mission coloniale, hangar, M577 et cadrage portrait | `scripts/browser-qa-v52.mjs` — 16 checkpoints, 21 captures, 16/16 salles |

Une sortie ImageGen seule ne compte pas comme terminée. Pour cette vague, le statut `ACCEPTED_RUNTIME` exige simultanément : fichier réel, bon format, contrat non collidable, registre runtime, préchargement et observation en composite. Les captures visuelles confirment l’apparence du build testé; elles ne remplacent pas les tests d’alpha, de topologie ou de collision.
