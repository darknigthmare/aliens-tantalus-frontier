# Alien Tantalus Frontier — inventaire assets/runtime v55

Source machine : `docs/ASSET_RUNTIME_INVENTORY_V55.json`. Les sorties v55 ne sont écrites que lorsque les 20 nouveaux atlas sont présents dans le registre runtime.

## Synthèse vérifiée

| Domaine | Catalogue | Couverture réelle v55 |
| --- | --- | --- |
| Sprite runtime | 51 atlas / 816 cellules | 20 atlas v55 normalisés et branchés |
| Joueur | 1 sujet / 2 plaques | locomotion et combat exacts |
| PNJ | 16 identités | 8 plaques mission dédiées; 8 encore sans plaque mission |
| Ennemis | 52 archétypes / 568 profils | 18 exacts; 396 réemplois famille; 154 sans art dédié |
| Véhicules | 36 châssis / 279 profils | 5 exacts; 28 réemplois de châssis; 246 sans art de châssis; 274 sans bitmap exact |
| Hub | 16 salles | 2 couches hangar indépendantes + dropship physique + hazard électrique |
| Mission | 17 props / 9 couches | 1 hazard électrique dédié |

## 20 atlas v55

| ID | Famille | Sujet | Clipset | Facing | Runtime |
| --- | --- | --- | --- | --- | --- |
| enemy.chestburster.action | enemy | Chestburster | enemy-action-v54 | right | wired |
| enemy.ovomorph.cycle | enemy | Ovomorph | ovomorph-cycle-v55 | right | wired |
| enemy.xenomorph-carrier.action | enemy | Carrier | enemy-action-v54 | right | wired |
| enemy.xenomorph-crusher.action | enemy | Crusher | enemy-action-v54 | right | wired |
| enemy.xenomorph-lurker.action | enemy | Lurker | enemy-action-v54 | right | wired |
| enemy.xenomorph-praetorian.action | enemy | Praetorian | enemy-action-v54 | right | wired |
| enemy.xenomorph-ravager.action | enemy | Ravager | enemy-action-v54 | right | wired |
| enemy.xenomorph-spitter.action | enemy | Spitter | enemy-action-v54 | right | wired |
| npc.bishop-9.mission | npc | BISHOP-9 — mission | npc-mission-v55 | right | wired |
| npc.idris-kwan.mission | npc | Idris Kwan — mission | npc-mission-v55 | right | wired |
| npc.maksim-orlov.mission | npc | Maksim Orlov — mission | npc-mission-v55 | right | wired |
| npc.mara-vega.mission | npc | Mara Vega — mission | npc-mission-v55 | right | wired |
| npc.noor-okafor.mission | npc | Noor Okafor — mission | npc-mission-v55 | right | wired |
| npc.rook.mission | npc | Rook — mission | npc-mission-v55 | right | wired |
| npc.sanaa-doyle.mission | npc | Sanaa Doyle — mission | npc-mission-v55 | right | wired |
| npc.tamsin-velez.mission | npc | Tamsin Velez — mission | npc-mission-v55 | right | wired |
| vehicle.m22a3-jackson-tank.action | vehicle | M22A3 Jackson Tank | m22a3-tank-action-v55 | right | wired |
| vehicle.m577-command-apc.action | vehicle | M577 Command APC | m577-command-action-v55 | right | wired |
| vehicle.p5000-powered-work-loader.action | vehicle | P-5000 Powered Work Loader | p5000-loader-action-v55 | right | wired |
| vehicle.ud4l-cheyenne-dropship.action | vehicle | UD-4L Cheyenne Dropship | ud4l-dropship-action-v55 | right | wired |

## PNJ mission

| ID équipage | Nom | Plaque mission | Clips mission | État |
| --- | --- | --- | --- | --- |
| crew-01-mara-vega | Mara Vega | npc.mara-vega.mission | ready, fire, role-support, cover, traversal, climb, hurt, downed, dead, wounded-death | loaded-exact |
| crew-02-tamsin-velez | Tamsin Velez | npc.tamsin-velez.mission | ready, fire, role-support, cover, traversal, climb, hurt, downed, dead, wounded-death | loaded-exact |
| crew-03-idris-kwan | Idris Kwan | npc.idris-kwan.mission | ready, fire, role-support, cover, traversal, climb, hurt, downed, dead, wounded-death | loaded-exact |
| crew-04-noor-okafor | Noor Okafor | npc.noor-okafor.mission | ready, fire, role-support, cover, traversal, climb, hurt, downed, dead, wounded-death | loaded-exact |
| crew-05-bishop-9 | BISHOP-9 | npc.bishop-9.mission | ready, fire, role-support, cover, traversal, climb, hurt, downed, dead, wounded-death | loaded-exact |
| crew-06-rook | Rook | npc.rook.mission | ready, fire, role-support, cover, traversal, climb, hurt, downed, dead, wounded-death | loaded-exact |
| crew-07-sanaa-doyle | Sanaa Doyle | npc.sanaa-doyle.mission | ready, fire, role-support, cover, traversal, climb, hurt, downed, dead, wounded-death | loaded-exact |
| crew-08-maksim-orlov | Maksim Orlov | npc.maksim-orlov.mission | ready, fire, role-support, cover, traversal, climb, hurt, downed, dead, wounded-death | loaded-exact |
| crew-09-inez-harlow | Inez Harlow | — | — | missing-dedicated-mission-sheet |
| crew-10-david-8r | DAVID-8R | — | — | missing-dedicated-mission-sheet |
| crew-11-jun-park | Jun Park | — | — | missing-dedicated-mission-sheet |
| crew-12-asha-mbaye | Asha Mbaye | — | — | missing-dedicated-mission-sheet |
| crew-13-pablo-reyes | Pablo Reyes | — | — | missing-dedicated-mission-sheet |
| crew-14-echo-a | ECHO-A | — | — | missing-dedicated-mission-sheet |
| crew-15-leila-s-rensen | Leila Sørensen | — | — | missing-dedicated-mission-sheet |
| crew-16-cal-mercer | Cal Mercer | — | — | missing-dedicated-mission-sheet |

## Ennemis

Huit archétypes supplémentaires disposent d’une identité bitmap dédiée. Leurs 88 profils restent routés vers la bonne plaque, mais seuls 8 profils de base sont exacts; 80 modifiers sont des réemplois de famille déclarés.

| Archétype | Profils | Exact / famille / absent | Rendu | Runtime |
| --- | --- | --- | --- | --- |
| Ovomorph | 11 | 1 / 10 / 0 | enemy.ovomorph.cycle | loaded |
| Facehugger | 11 | 1 / 10 / 0 | enemy.facehugger.locomotion | loaded |
| Chestburster | 11 | 1 / 10 / 0 | enemy.chestburster.action | loaded |
| Drone / Big Chap | 11 | 0 / 11 / 0 | enemy.xenomorph-drone.locomotion | loaded |
| Warrior | 11 | 0 / 11 / 0 | enemy.xenomorph-warrior.combat | loaded |
| Runner | 11 | 1 / 10 / 0 | enemy.xenomorph-runner.action | loaded |
| Praetorian | 11 | 1 / 10 / 0 | enemy.xenomorph-praetorian.action | loaded |
| Queen | 11 | 0 / 11 / 0 | enemy.xenomorph-queen.combat | loaded |
| Crusher | 11 | 1 / 10 / 0 | enemy.xenomorph-crusher.action | loaded |
| Spitter | 11 | 1 / 10 / 0 | enemy.xenomorph-spitter.action | loaded |
| Lurker | 11 | 1 / 10 / 0 | enemy.xenomorph-lurker.action | loaded |
| Carrier | 11 | 1 / 10 / 0 | enemy.xenomorph-carrier.action | loaded |
| Ravager | 11 | 1 / 10 / 0 | enemy.xenomorph-ravager.action | loaded |
| Boiler | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Prowler | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Burster | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Monica Line | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Specimen Six Line | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Red Xenomorph | 11 | 1 / 10 / 0 | neuroXeno:row0 | legacy-atlas |
| K-Series Yellow Xenomorph | 11 | 1 / 10 / 0 | neuroXeno:row1 | legacy-atlas |
| Neuro-Xeno Drone | 11 | 0 / 11 / 0 | neuroXeno:row3 | legacy-atlas |
| Xenoborg | 11 | 0 / 11 / 0 | neuroXeno:row2 | legacy-atlas |
| ATARAX Ripper | 11 | 0 / 11 / 0 | neuroXeno:row2 | legacy-atlas |
| Ripper Queen | 11 | 1 / 10 / 0 | enemy.ripper-queen.action | loaded |
| Foundry Drone | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Foundry Crusher | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Reef Stalker | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Reef Spitter | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Siege Royal | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Pale Crucible Hunter | 11 | 1 / 10 / 0 | enemy.pale-crucible-hunter.action | loaded |
| Dust Runner | 11 | 0 / 11 / 0 | enemy.xenomorph-runner.action | loaded |
| Salvage Hive Brute | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Arcology Lurker | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Caravan Stalker | 11 | 0 / 0 / 11 | enemy.xenomorph-drone.locomotion | loaded |
| Trilobite Echo | 11 | 0 / 11 / 0 | pathogen:row2 | legacy-atlas |
| Deacon Line | 11 | 0 / 11 / 0 | pathogen:row1 | legacy-atlas |
| Neomorph | 11 | 1 / 10 / 0 | enemy.neomorph.locomotion | loaded |
| Protomorph | 11 | 0 / 11 / 0 | pathogen:row1 | legacy-atlas |
| Abomination | 11 | 0 / 11 / 0 | pathogen:row2 | legacy-atlas |
| Pathogen Mimic | 11 | 1 / 10 / 0 | enemy.pathogen-mimic.action | loaded |
| Working Joe | 11 | 1 / 10 / 0 | enemy.working-joe.combat | loaded |
| Combat Synthetic | 11 | 1 / 10 / 0 | synthetic:row2 | legacy-atlas |
| Weyland-Yutani Commando | 11 | 0 / 11 / 0 | human:row1 | legacy-atlas |
| UPP Vanguard | 11 | 0 / 11 / 0 | human:row2 | legacy-atlas |
| Seegson Security | 11 | 0 / 11 / 0 | human:row2 | legacy-atlas |
| Colonial Raider | 11 | 0 / 11 / 0 | human:row3 | legacy-atlas |
| ATARAX Controller | 11 | 0 / 11 / 0 | human:row3 | legacy-atlas |
| Cult Host | 11 | 0 / 0 / 11 | human:row3 | legacy-atlas |
| Wild Boar Host | 10 | 0 / 10 / 0 | pathogen:row3 | legacy-atlas |
| Korari Stalker | 10 | 0 / 10 / 0 | pathogen:row3 | legacy-atlas |
| Ceto Reef Predator | 10 | 0 / 10 / 0 | pathogen:row3 | legacy-atlas |
| Tantalus Tunnel Vermin | 10 | 0 / 10 / 0 | pathogen:row3 | legacy-atlas |

## Véhicules

| Châssis | Famille | Exact / famille / absent | Rendu | Runtime |
| --- | --- | --- | --- | --- |
| M577 Armored Personnel Carrier | ground | 1 / 0 / 7 | bitmap:vehicle.m577-apc.action | loaded-exact |
| M577 Command APC | ground | 1 / 7 / 0 | bitmap:vehicle.m577-command-apc.action | loaded-exact |
| M570 Armored Personnel Carrier | ground | 0 / 0 / 8 | wrong-reuse:vehicle.m577-apc.action | missing |
| M22A3 Jackson Tank | ground | 1 / 7 / 0 | bitmap:vehicle.m22a3-jackson-tank.action | loaded-exact |
| M40 Ridgeway Tank | ground | 0 / 0 / 8 | wrong-reuse:vehicle.m577-apc.action | missing |
| M292 Combat Buggy | ground | 0 / 0 / 8 | wrong-reuse:vehicle.m577-apc.action | missing |
| P-5000 Powered Work Loader | exosuit | 1 / 7 / 0 | bitmap:vehicle.p5000-powered-work-loader.action | loaded-exact |
| Combat Power Loader | exosuit | 0 / 0 / 8 | canvas-family-silhouette:exosuit | missing |
| UD-4L Cheyenne Dropship | air | 1 / 7 / 0 | bitmap:vehicle.ud4l-cheyenne-dropship.action | loaded-exact |
| UD-4B Dropship | air | 0 / 0 / 8 | canvas-family-silhouette:air | missing |
| AD-19CD Dropship | air | 0 / 0 / 8 | canvas-family-silhouette:air | missing |
| UA-571 Remote Sentry Carrier | ground | 0 / 0 / 8 | wrong-reuse:vehicle.m577-apc.action | missing |
| USCSS Nostromo Shuttle | space | 0 / 0 / 8 | canvas-family-silhouette:space | missing |
| USCSS Covenant Lander | air | 0 / 0 / 8 | canvas-family-silhouette:air | missing |
| USCSS Prometheus Rover | ground | 0 / 0 / 8 | wrong-reuse:vehicle.m577-apc.action | missing |
| ATV Survey Rover | ground | 0 / 0 / 8 | wrong-reuse:vehicle.m577-apc.action | missing |
| Seegson Maintenance Tram | rail | 0 / 0 / 8 | canvas-family-silhouette:rail | missing |
| Acheron Colony Tractor | ground | 0 / 0 / 8 | wrong-reuse:vehicle.m577-apc.action | missing |
| Submersible Survey Skiff | maritime | 0 / 0 / 8 | canvas-family-silhouette:maritime | missing |
| Ceto Patrol Boat | maritime | 0 / 0 / 8 | canvas-family-silhouette:maritime | missing |
| Tantalus Command Skiff | air | 0 / 0 / 8 | canvas-family-silhouette:air | missing |
| Echo-9 Recon Bike | ground | 0 / 0 / 8 | wrong-reuse:vehicle.m577-apc.action | missing |
| Crucible Caravan Crawler | ground | 0 / 0 / 8 | wrong-reuse:vehicle.m577-apc.action | missing |
| Neuro-Xeno Transport Rig | ground | 0 / 0 / 8 | wrong-reuse:vehicle.m577-apc.action | missing |
| USCM Assault Gunship | air | 0 / 0 / 8 | canvas-family-silhouette:air | missing |
| Orbital Lifeboat | space | 0 / 0 / 8 | canvas-family-silhouette:space | missing |
| Colony Cargo Lifter | air | 0 / 0 / 8 | canvas-family-silhouette:air | missing |
| Weyland-Yutani Executive Shuttle | space | 0 / 0 / 7 | canvas-family-silhouette:space | missing |
| UPP Combat Aerodyne | air | 0 / 0 / 7 | canvas-family-silhouette:air | missing |
| Hyperdyne Synthetic Carrier | ground | 0 / 0 / 7 | wrong-reuse:vehicle.m577-apc.action | missing |
| Mining Bore Crawler | ground | 0 / 0 / 7 | wrong-reuse:vehicle.m577-apc.action | missing |
| Atmospheric Processor Elevator | rail | 0 / 0 / 7 | canvas-family-silhouette:rail | missing |
| Maglev Personnel Car | rail | 0 / 0 / 7 | canvas-family-silhouette:rail | missing |
| Ice Driller | ground | 0 / 0 / 7 | wrong-reuse:vehicle.m577-apc.action | missing |
| Reef Hydrofoil | maritime | 0 / 0 / 7 | canvas-family-silhouette:maritime | missing |
| Ripper Siege Loader | exosuit | 0 / 0 / 7 | canvas-family-silhouette:exosuit | missing |

## Hangar modulaire et hazard électrique

Le hangar interdit l’image monolithique : `allowsMonolith=false`.

| Couche | Phase | Asset | Bounds rendu |
| --- | --- | --- | --- |
| dropship-hangar-overhead | back | /assets/openai/hub/layers/engineering-hangar-overhead.png | 1280×392@0,0 |
| dropship-hangar-foreground | front | /assets/openai/hub/layers/engineering-hangar-foreground.png | 1280×315@0,405 |

- Dropship physique : `/assets/openai/sprites/normalized/vehicles/ud-4l-cheyenne-dropship-action-sheet.png`, collision et interaction séparées.
- Hazard électrique : `/assets/openai/metroidvania/props/electrical-arc-hazard.png`, dégâts 22, stun 1.25 s.

## Mission

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
| acid-floor-hazard | acid | acid-hazard | loaded |
| electrical-arc-hazard | electricalArc | electrical-damage-and-stun-hazard | runtime-contract-v55 |

Dettes restantes déclarées : dedicated bitmap sheets for 31 chassis; fit-specific damage markings; entry-exit animation; room-specific overhead and foreground modules for the other hub rooms; independent layer sets per zone; dedicated fire, steam, radiation, flood, vacuum and darkness hazards; dedicated resource-drop and archive-terminal sprites.
