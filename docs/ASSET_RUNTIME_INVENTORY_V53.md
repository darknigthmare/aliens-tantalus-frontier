# Alien Tantalus Frontier — inventaire assets/runtime v53

Source machine : `docs/ASSET_RUNTIME_INVENTORY_V53.json`. Ce fichier est généré depuis les registres du jeu par `npm run inventory:v53`; `npm run inventory:v53:check` interdit toute dérive.

## Synthèse vérifiée

| Domaine | Catalogue | Couverture réelle |
| --- | --- | --- |
| Joueur | 1 sujet / 2 plaques | locomotion exacte; combat bloqué par identity gate |
| PNJ | 16 | 16 locomotions chargées; sets mission incomplets |
| Ennemis | 52 archétypes / 11 modificateurs / 568 profils | 66 exacts; 205 réemplois famille; 297 sans art dédié |
| Véhicules | 36 châssis / 8 fits / 279 profils | 1 profil bitmap exact; 278 sans bitmap dédié |
| Hub | 16 salles / 16 props / 4 far layers | profils, parallaxe et collisions mesurées chargés |
| Mission | 16 props / 3 templates / 9 couches globales | 16 props chargés; trois couches structurelles désormais dessinées |

## Joueur

| Plaque | Facing | Identité | État runtime |
| --- | --- | --- | --- |
| player.echo9-marine.locomotion | right | true | loaded-exact |
| player.echo9-marine.combat | right | false | blocked-identity |

La plaque combat reste volontairement en quarantaine : le runtime conserve l’identité locomotion tant que le gate ImageGen, normalisation et contrôle visuel n’est pas réellement passé.

## 16 PNJ

| ID | Nom | Rôle | Plaque | Manquant |
| --- | --- | --- | --- | --- |
| crew-01-mara-vega | Mara Vega | Commander | npc.mara-vega.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-02-tamsin-velez | Tamsin Velez | Sergeant | npc.tamsin-velez.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-03-idris-kwan | Idris Kwan | Engineer | npc.idris-kwan.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-04-noor-okafor | Noor Okafor | Corpsman | npc.noor-okafor.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-05-bishop-9 | BISHOP-9 | Synthetic Science Officer | npc.bishop-9.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-06-rook | Rook | Recon Marine | npc.rook.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-07-sanaa-doyle | Sanaa Doyle | Smartgunner | npc.sanaa-doyle.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-08-maksim-orlov | Maksim Orlov | Pilot | npc.maksim-orlov.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-09-inez-harlow | Inez Harlow | Xenobiologist | npc.inez-harlow.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-10-david-8r | DAVID-8R | Recovered Synthetic | npc.david-8r.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-11-jun-park | Jun Park | Technician | npc.jun-park.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-12-asha-mbaye | Asha Mbaye | Colonial Liaison | npc.asha-mbaye.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-13-pablo-reyes | Pablo Reyes | Demolitions | npc.pablo-reyes.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-14-echo-a | ECHO-A | Tactical Synthetic | npc.echo-a.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-15-leila-s-rensen | Leila Sørensen | Pathfinder | npc.leila-s-rensen.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |
| crew-16-cal-mercer | Cal Mercer | Vehicle Chief | npc.cal-mercer.locomotion | combat, crouch, jump-fall, climb, wounded, death, role-specific-mission-action |

## 52 archétypes / 568 profils ennemis

Comptes des modificateurs : Standard=52, Albino=52, Armored=52, Acid-Blooded=52, Cryo-Adapted=52, Vacuum-Adapted=52, Hive Guard=52, Apex=52, Juvenile=52, Elder=52, Neuro-Linked=48.

| Archétype | Profils | Rendu | Identité | Fallback explicite |
| --- | --- | --- | --- | --- |
| Ovomorph | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Ovomorph; la silhouette Drone reste un fallback explicitement signalé. |
| Facehugger | 11 | enemy.facehugger.locomotion | exact | — |
| Chestburster | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Chestburster; la silhouette Drone reste un fallback explicitement signalé. |
| Drone / Big Chap | 11 | enemy.xenomorph-drone.locomotion | authored-family | La planche Drone couvre la famille de Drone / Big Chap, sans identité animée dédiée à cette variante. |
| Warrior | 11 | enemy.xenomorph-warrior.combat | authored-family | La planche Warrior couvre le combat; la locomotion réutilise encore la planche Drone. |
| Runner | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Runner; la silhouette Drone reste un fallback explicitement signalé. |
| Praetorian | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Praetorian; la silhouette Drone reste un fallback explicitement signalé. |
| Queen | 11 | enemy.xenomorph-queen.combat | authored-family | La Queen possède une planche de combat, mais pas encore une locomotion complète validée. |
| Crusher | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Crusher; la silhouette Drone reste un fallback explicitement signalé. |
| Spitter | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Spitter; la silhouette Drone reste un fallback explicitement signalé. |
| Lurker | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Lurker; la silhouette Drone reste un fallback explicitement signalé. |
| Carrier | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Carrier; la silhouette Drone reste un fallback explicitement signalé. |
| Ravager | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Ravager; la silhouette Drone reste un fallback explicitement signalé. |
| Boiler | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Boiler; la silhouette Drone reste un fallback explicitement signalé. |
| Prowler | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Prowler; la silhouette Drone reste un fallback explicitement signalé. |
| Burster | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Burster; la silhouette Drone reste un fallback explicitement signalé. |
| Monica Line | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Monica Line; la silhouette Drone reste un fallback explicitement signalé. |
| Specimen Six Line | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Specimen Six Line; la silhouette Drone reste un fallback explicitement signalé. |
| Red Xenomorph | 11 | neuroXeno:row0 | exact | — |
| K-Series Yellow Xenomorph | 11 | neuroXeno:row1 | exact | — |
| Neuro-Xeno Drone | 11 | neuroXeno:row3 | authored-family | La planche ATARAX/neuro-liée couvre la famille de Neuro-Xeno Drone, sans identité animée dédiée à cette variante. |
| Xenoborg | 11 | neuroXeno:row2 | authored-family | La planche Xenoborg/Ripper couvre la famille de Xenoborg, sans identité animée dédiée à cette variante. |
| ATARAX Ripper | 11 | neuroXeno:row2 | authored-family | La planche Xenoborg/Ripper couvre la famille de ATARAX Ripper, sans identité animée dédiée à cette variante. |
| Ripper Queen | 11 | enemy.xenomorph-queen.combat | missing-dedicated-art | Aucune planche dédiée validée pour Ripper Queen; la Queen standard reste un fallback explicitement signalé. |
| Foundry Drone | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Foundry Drone; la silhouette Drone reste un fallback explicitement signalé. |
| Foundry Crusher | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Foundry Crusher; la silhouette Drone reste un fallback explicitement signalé. |
| Reef Stalker | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Reef Stalker; la silhouette Drone reste un fallback explicitement signalé. |
| Reef Spitter | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Reef Spitter; la silhouette Drone reste un fallback explicitement signalé. |
| Siege Royal | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Siege Royal; la silhouette Drone reste un fallback explicitement signalé. |
| Pale Crucible Hunter | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Pale Crucible Hunter; la silhouette Drone reste un fallback explicitement signalé. |
| Dust Runner | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Dust Runner; la silhouette Drone reste un fallback explicitement signalé. |
| Salvage Hive Brute | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Salvage Hive Brute; la silhouette Drone reste un fallback explicitement signalé. |
| Arcology Lurker | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Arcology Lurker; la silhouette Drone reste un fallback explicitement signalé. |
| Caravan Stalker | 11 | enemy.xenomorph-drone.locomotion | missing-dedicated-art | Aucune planche dédiée validée pour Caravan Stalker; la silhouette Drone reste un fallback explicitement signalé. |
| Trilobite Echo | 11 | pathogen:row2 | authored-family | La planche Trilobite/Abomination couvre la famille de Trilobite Echo, sans identité animée dédiée à cette variante. |
| Deacon Line | 11 | pathogen:row1 | authored-family | La planche Deacon/Protomorph couvre la famille de Deacon Line, sans identité animée dédiée à cette variante. |
| Neomorph | 11 | enemy.neomorph.locomotion | exact | — |
| Protomorph | 11 | pathogen:row1 | authored-family | La planche Deacon/Protomorph couvre la famille de Protomorph, sans identité animée dédiée à cette variante. |
| Abomination | 11 | pathogen:row2 | authored-family | La planche Trilobite/Abomination couvre la famille de Abomination, sans identité animée dédiée à cette variante. |
| Pathogen Mimic | 11 | pathogen:row2 | missing-dedicated-art | Aucune planche dédiée validée pour Pathogen Mimic; la ligne Trilobite/Abomination reste un fallback explicitement signalé. |
| Working Joe | 11 | enemy.working-joe.combat | exact | — |
| Combat Synthetic | 11 | synthetic:row2 | exact | — |
| Weyland-Yutani Commando | 11 | human:row1 | authored-family | La planche corporate commando couvre la famille de Weyland-Yutani Commando, sans identité animée dédiée à cette variante. |
| UPP Vanguard | 11 | human:row2 | authored-family | La planche sécurité UPP/Seegson couvre la famille de UPP Vanguard, sans identité animée dédiée à cette variante. |
| Seegson Security | 11 | human:row2 | authored-family | La planche sécurité UPP/Seegson couvre la famille de Seegson Security, sans identité animée dédiée à cette variante. |
| Colonial Raider | 11 | human:row3 | authored-family | La planche raider/ATARAX couvre la famille de Colonial Raider, sans identité animée dédiée à cette variante. |
| ATARAX Controller | 11 | human:row3 | authored-family | La planche raider/ATARAX couvre la famille de ATARAX Controller, sans identité animée dédiée à cette variante. |
| Cult Host | 11 | human:row3 | missing-dedicated-art | Aucune planche dédiée validée pour Cult Host; la ligne raider/ATARAX reste un fallback explicitement signalé. |
| Wild Boar Host | 10 | pathogen:row3 | authored-family | La planche faune de frontière couvre la famille de Wild Boar Host, sans identité animée dédiée à cette variante. |
| Korari Stalker | 10 | pathogen:row3 | authored-family | La planche faune de frontière couvre la famille de Korari Stalker, sans identité animée dédiée à cette variante. |
| Ceto Reef Predator | 10 | pathogen:row3 | authored-family | La planche faune de frontière couvre la famille de Ceto Reef Predator, sans identité animée dédiée à cette variante. |
| Tantalus Tunnel Vermin | 10 | pathogen:row3 | authored-family | La planche faune de frontière couvre la famille de Tantalus Tunnel Vermin, sans identité animée dédiée à cette variante. |

Le registre empêche désormais `row=index%4`, conserve la ligne d’identité à la mort, distingue Combat Synthetic de Working Joe et télémètre toute approximation.

## 36 châssis / 279 profils véhicules

| Châssis | Famille | Profils | Rendu actuel | Bitmap dédié |
| --- | --- | --- | --- | --- |
| M577 Armored Personnel Carrier | ground | 8 | bitmap:m577-apc | loaded-exact |
| M577 Command APC | ground | 8 | wrong-reuse:m577-apc | missing |
| M570 Armored Personnel Carrier | ground | 8 | wrong-reuse:m577-apc | missing |
| M22A3 Jackson Tank | ground | 8 | wrong-reuse:m577-apc | missing |
| M40 Ridgeway Tank | ground | 8 | wrong-reuse:m577-apc | missing |
| M292 Combat Buggy | ground | 8 | wrong-reuse:m577-apc | missing |
| P-5000 Powered Work Loader | exosuit | 8 | canvas-family-silhouette:exosuit | missing |
| Combat Power Loader | exosuit | 8 | canvas-family-silhouette:exosuit | missing |
| UD-4L Cheyenne Dropship | air | 8 | canvas-family-silhouette:air | missing |
| UD-4B Dropship | air | 8 | canvas-family-silhouette:air | missing |
| AD-19CD Dropship | air | 8 | canvas-family-silhouette:air | missing |
| UA-571 Remote Sentry Carrier | ground | 8 | wrong-reuse:m577-apc | missing |
| USCSS Nostromo Shuttle | space | 8 | canvas-family-silhouette:space | missing |
| USCSS Covenant Lander | air | 8 | canvas-family-silhouette:air | missing |
| USCSS Prometheus Rover | ground | 8 | wrong-reuse:m577-apc | missing |
| ATV Survey Rover | ground | 8 | wrong-reuse:m577-apc | missing |
| Seegson Maintenance Tram | rail | 8 | canvas-family-silhouette:rail | missing |
| Acheron Colony Tractor | ground | 8 | wrong-reuse:m577-apc | missing |
| Submersible Survey Skiff | maritime | 8 | canvas-family-silhouette:maritime | missing |
| Ceto Patrol Boat | maritime | 8 | canvas-family-silhouette:maritime | missing |
| Tantalus Command Skiff | air | 8 | canvas-family-silhouette:air | missing |
| Echo-9 Recon Bike | ground | 8 | wrong-reuse:m577-apc | missing |
| Crucible Caravan Crawler | ground | 8 | wrong-reuse:m577-apc | missing |
| Neuro-Xeno Transport Rig | ground | 8 | wrong-reuse:m577-apc | missing |
| USCM Assault Gunship | air | 8 | canvas-family-silhouette:air | missing |
| Orbital Lifeboat | space | 8 | canvas-family-silhouette:space | missing |
| Colony Cargo Lifter | air | 8 | canvas-family-silhouette:air | missing |
| Weyland-Yutani Executive Shuttle | space | 7 | canvas-family-silhouette:space | missing |
| UPP Combat Aerodyne | air | 7 | canvas-family-silhouette:air | missing |
| Hyperdyne Synthetic Carrier | ground | 7 | wrong-reuse:m577-apc | missing |
| Mining Bore Crawler | ground | 7 | wrong-reuse:m577-apc | missing |
| Atmospheric Processor Elevator | rail | 7 | canvas-family-silhouette:rail | missing |
| Maglev Personnel Car | rail | 7 | canvas-family-silhouette:rail | missing |
| Ice Driller | ground | 7 | wrong-reuse:m577-apc | missing |
| Reef Hydrofoil | maritime | 7 | canvas-family-silhouette:maritime | missing |
| Ripper Siege Loader | exosuit | 7 | canvas-family-silhouette:exosuit | missing |

Les silhouettes canvas non-ground restent une dette visuelle déclarée, pas une couverture sprite prétendument terminée.

## Hub — salles et props

| Deck | Salle | Fond | Prop | Scale / floor | Collider prop |
| --- | --- | --- | --- | --- | --- |
| command | bridge | command-bridge | bridge-terminal | 1.01 / 0.82 | 184×76 |
| command | briefing | command-briefing | briefing-table | 1.05 / 0.815 | 176×48 |
| command | combat-information | command-cic | sensor-console | 1.03 / 0.82 | 168×70 |
| command | cryo-bay | command-cryo | cryopod | 1.06 / 0.825 | 188×54 |
| habitat | crew-quarters | habitat-quarters | bunk-module | 1.06 / 0.82 | 174×82 |
| habitat | mess | habitat-mess | mess-table | 1.05 / 0.815 | 174×44 |
| habitat | medical | habitat-medical | medical-bed | 1.04 / 0.825 | 184×44 |
| habitat | science-lab | habitat-lab | lab-console | 1.03 / 0.82 | 174×68 |
| industrial | quarantine | industrial-quarantine | quarantine-unit | 1.02 / 0.83 | 150×104 |
| industrial | armory | industrial-armory | armory-rack | 1.05 / 0.82 | 174×82 |
| industrial | workshop | industrial-workshop | workbench | 1.04 / 0.82 | 184×64 |
| industrial | vehicle-bay | industrial-vehicle-bay | vehicle-lift | 1 / 0.825 | 204×42 |
| engineering | dropship-hangar | engineering-hangar | vehicle-lift | 1 / 0.825 | 204×42 |
| engineering | reactor | engineering-reactor | reactor-column | 1.01 / 0.83 | 136×116 |
| engineering | life-support | engineering-life-support | life-support-scrubber | 1.03 / 0.825 | 176×84 |
| engineering | sensor-array | engineering-sensors | sensor-console | 1.03 / 0.815 | 166×76 |

Props : bulkhead-door, lift-door, bridge-terminal, briefing-table, cryopod, bunk-module, mess-table, medical-bed, lab-console, quarantine-unit, armory-rack, workbench, vehicle-lift (réemployé), reactor-column, life-support-scrubber, sensor-console (réemployé). Les quatre far layers sont réellement dessinés; les obstacles génériques superposés ont été supprimés.

## Mission — 16 props et 9 couches

| Prop | Clé runtime | Usage | Chargement |
| --- | --- | --- | --- |
| floor-segment | floor | terrain | loaded |
| overhead-catwalk | catwalk | platform | loaded |
| short-ledge | ledge | platform | loaded |
| drop-platform | drop | platform | loaded |
| wall-ladder | ladder | traversal | loaded |
| maintenance-pipe | maintenancePipe | ship-architecture-layer | loaded |
| vent-entrance | vent | shortcut | loaded |
| breakable-panel | breakable | breakable-and-objective | loaded |
| locked-bulkhead | lockedDoor | closed-door | loaded |
| open-bulkhead | openDoor | open-door | loaded |
| cargo-cover | cover | cover | loaded |
| supply-crates | crates | resource-and-objective | loaded |
| ceiling-cables | ceilingCables | ship-ceiling-layer | loaded |
| foreground-pipes | foregroundPipes | ship-foreground-layer | loaded |
| warning-lamp | lamp | terminal-and-objective | loaded |
| acid-floor-hazard | acid | acid-hazard-and-generic-hazard-fallback | loaded |

| Template | Profondeur | Asset | État |
| --- | --- | --- | --- |
| ship-interior-vertical | far | tantalus-mission-far | loaded-global-layer |
| ship-interior-vertical | mid | tantalus-mission-mid | loaded-global-layer |
| ship-interior-vertical | foreground | tantalus-mission-foreground | loaded-global-layer |
| colony-multiroute | far | colony-multiroute-far | loaded-global-layer |
| colony-multiroute | mid | colony-multiroute-mid | loaded-global-layer |
| colony-multiroute | foreground | colony-multiroute-foreground | loaded-global-layer |
| planet-exterior | far | planet-exterior-far | loaded-global-layer |
| planet-exterior | mid | planet-exterior-mid | loaded-global-layer |
| planet-exterior | foreground | planet-exterior-foreground | loaded-global-layer |

Les prochains lots artistiques prioritaires restent : combat joueur identity-preserve, 35 châssis véhicules, 297 profils ennemis sans art dédié, sets mission des 16 PNJ, hazards non-acide et couches indépendantes par zone.
