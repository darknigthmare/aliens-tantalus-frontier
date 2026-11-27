/* Authored DLC content. See docs/SOURCES_ET_CONTINUITE.md for provenance. */
(function(root){
const data = {
  "manifest": {
    "id": "river-of-pain",
    "version": "0.9.0-candidate.1",
    "title": "ALIEN — Fleuve de la Douleur",
    "subtitle": "Hadley’s Hope · Les lieux ont une mémoire",
    "sourceTitle": "Alien: River of Pain",
    "sourceAuthor": "Christopher Golden",
    "frenchAudioTitle": "Alien — Le Fleuve des souffrances",
    "year": 2179,
    "mode": "MIRE",
    "campaignId": "v36_campaign_acheron_river_of_pain",
    "pairId": "pair_v36_campaign_acheron_river_of_pain",
    "frontierCampaignId": "frontier_v36_campaign_acheron_river_of_pain",
    "frontierPolicy": "preserved_unmodified",
    "saveKey": "atf.dlc.river-of-pain.v1.profile1",
    "saveSchema": 1,
    "baseCommit": "496996f5ea557d970ec625aa346876f3eaed1c5f",
    "implementation": "isolated_playable_runtime_with_host_launcher",
    "limitations": [
      "Architecture et dialogues originaux : pas de reconstruction 1:1 certifiée du roman.",
      "Décors procéduraux et personnages articulés dessinés par code, pas les atlas finaux du jeu hôte.",
      "Aucun roman intégral consulté ; détails secondaires appuyés sur synthèses signalées.",
      "Lanceur additionnel : le runtime natif et les 440 campagnes du jeu hôte ne sont pas remplacés.",
      "Pas de publication GitHub ou Vercel."
    ],
    "counts": {
      "chapters": 16,
      "rooms": 47,
      "links": 64,
      "objectives": 49,
      "archives": 34,
      "props": 547,
      "characters": 4,
      "hideouts": 24,
      "switchboards": 6,
      "steamHazards": 2,
      "architectureFamilies": 23,
      "phaseDetails": 118,
      "annexes": 6,
      "optionalJobs": 6,
      "optionalSteps": 18,
      "permanentShortcuts": 6,
      "authoredEncounters": 6,
      "authoredFootprintRooms": 18,
      "physicalCovers": 74,
      "animatedConnectors": 22,
      "liftConnectors": 2,
      "listeningThresholds": 64,
      "residents": 12,
      "residentTopics": 24,
      "searchableContainers": 12,
      "craftingBenches": 3,
      "recipes": 2,
      "localShutters": 8,
      "localAlarms": 4,
      "maintenanceDucts": 5,
      "ductMouths": 10,
      "driveableVehicles": 1,
      "drivingRooms": 2,
      "vehicleServiceStations": 2,
      "drivingSurfaces": 2,
      "architecturalEndpoints": 128,
      "characterProfiles": 14,
      "fidelityEntries": 93,
      "weaponModes": 3
    }
  },
  "rooms": [
    {
      "id": "pad",
      "name": "Aire d’atterrissage",
      "building": "Périmètre",
      "floor": 0,
      "kind": "exterior",
      "width": 2900,
      "map": [
        0,
        2
      ],
      "theme": "pad",
      "landmark": "Tour de contrôle et feux d’approche",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        69.0,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "pad>airlock",
          "to": "airlock",
          "x": 170,
          "z": 0.69,
          "kind": "sas",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "airlock",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "airlock>pad"
          }
        }
      ],
      "props": [
        {
          "id": "pad-set-0",
          "kind": "beacon",
          "x": 442,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "orientation du trajet"
        },
        {
          "id": "pad-set-1",
          "kind": "antenna",
          "x": 845,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "pad-set-2",
          "kind": "fuel",
          "x": 1248,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "pad-set-3",
          "kind": "beacon",
          "x": 1652,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "orientation du trajet"
        },
        {
          "id": "pad-set-4",
          "kind": "cable",
          "x": 2055,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "pad-set-5",
          "kind": "tractor",
          "x": 2458,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "pad-cover1",
          "kind": "crate",
          "x": 1102,
          "z": 0.56,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 160,
            "d": 0.13
          }
        },
        {
          "id": "pad-cover2",
          "kind": "rock",
          "x": 1943,
          "z": 0.57,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 190,
            "d": 0.14
          }
        },
        {
          "id": "pad-detail-0",
          "kind": "survey-stake",
          "x": 348,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "pad-detail-1",
          "kind": "floodlight",
          "x": 899,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "pad-detail-2",
          "kind": "cable-spool",
          "x": 1450,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "pad-detail-3",
          "kind": "barrier",
          "x": 2001,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "pad-detail-4",
          "kind": "rock-fragment",
          "x": 2552,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "welcome",
          "label": "Retrouver Paris",
          "kind": "talk",
          "x": 667,
          "z": 0.81,
          "description": "Vous verrez la tempête plus souvent que le ciel. Les familles, elles, sont ici toute l’année.",
          "chapter": 0,
          "actorId": "paris"
        },
        {
          "id": "stretcher",
          "label": "Prendre en charge le retour des prospecteurs",
          "kind": "talk",
          "x": 1102,
          "z": 0.81,
          "description": "Gardez le couloir libre. Je veux des gens qui respirent, pas une foule autour du lit.",
          "chapter": 4,
          "actorId": "komiskey"
        },
        {
          "id": "a01",
          "label": "Bordereau d’arrivée",
          "kind": "archive",
          "x": 2378.0,
          "z": 0.43,
          "description": "Bienvenue à Hadley’s Hope. Les nouveaux arrivants doivent se présenter au contrôle colonial avant l’attribution des logements. Ne laissez pas de bagages dans le sas : les équipes de nuit y font passer le matériel lourd."
        }
      ],
      "spawns": [
        {
          "id": "pad-east",
          "x": 2845,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "pad-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "pad-cover1",
          "x": 1102,
          "z": 0.56,
          "w": 160,
          "d": 0.13,
          "prop": "crate"
        },
        {
          "id": "pad-cover2",
          "x": 1943,
          "z": 0.57,
          "w": 190,
          "d": 0.14,
          "prop": "rock"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "exterior",
        "variant": "approach_lights",
        "circuit": "perimeter",
        "ceilingRatio": 0.16,
        "wallModules": 9,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "inherited-pad",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "airlock",
      "name": "Sas des arrivants",
      "building": "Accueil",
      "floor": 0,
      "kind": "side",
      "width": 1800,
      "map": [
        1,
        2
      ],
      "theme": "airlock",
      "landmark": "Double porte pressurisée, douche de décontamination",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "cold",
      "dimensionsM": [
        42.9,
        2.8,
        3.4
      ],
      "portals": [
        {
          "id": "airlock>pad",
          "to": "pad",
          "x": 170,
          "z": 0.7,
          "kind": "sas",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "airlock",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "pad>airlock"
          }
        },
        {
          "id": "airlock>concourse",
          "to": "concourse",
          "x": 1630,
          "z": 0.7,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1630,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "concourse>airlock"
          }
        }
      ],
      "props": [
        {
          "id": "airlock-set-0",
          "kind": "shower",
          "x": 372,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "airlock-set-1",
          "kind": "locker",
          "x": 636,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "airlock-set-2",
          "kind": "fan",
          "x": 900,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "airlock-set-3",
          "kind": "panel",
          "x": 1164,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "airlock-set-4",
          "kind": "lamp",
          "x": 1428,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "airlock-detail-0",
          "kind": "oxygen",
          "x": 433,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "airlock-detail-1",
          "kind": "hose-reel",
          "x": 558,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "airlock-detail-2",
          "kind": "warning-board",
          "x": 900,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "airlock-detail-3",
          "kind": "vent-cover",
          "x": 1242,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "airlock-detail-4",
          "kind": "ceiling-light",
          "x": 438,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "hide-airlock",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 520,
          "z": 0.7,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        }
      ],
      "spawns": [
        {
          "id": "airlock-east",
          "x": 1745,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "airlock-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "decontamination",
        "variant": "double_bulkhead",
        "circuit": "habitat",
        "ceilingRatio": 0.16,
        "wallModules": 5,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "airlock-phase-0",
          "kind": "paper-trail",
          "x": 414,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "airlock-phase-1",
          "kind": "emergency-arrow",
          "x": 882,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "airlock-phase-2",
          "kind": "broken-light",
          "x": 1332,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "airlock-phase-3",
          "kind": "scorch",
          "x": 1584,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-airlock",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "concourse",
      "name": "Coursive centrale",
      "building": "Accueil",
      "floor": 0,
      "kind": "depth",
      "width": 3000,
      "map": [
        2,
        2
      ],
      "theme": "concourse",
      "landmark": "Signalétique des blocs, galerie vitrée",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        71.4,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "concourse>airlock",
          "to": "airlock",
          "x": 170,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "airlock>concourse"
          }
        },
        {
          "id": "concourse>ops",
          "to": "ops",
          "x": 2830,
          "z": 0.69,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2830,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "ops>concourse"
          }
        },
        {
          "id": "concourse>hab",
          "to": "hab",
          "x": 840,
          "z": 0.28,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 840,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "hab>concourse"
          }
        },
        {
          "id": "concourse>med",
          "to": "med",
          "x": 1440,
          "z": 0.28,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1440,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "med>concourse"
          }
        },
        {
          "id": "concourse>garage",
          "to": "garage",
          "x": 2040,
          "z": 0.28,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2040,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "garage>concourse"
          }
        }
      ],
      "props": [
        {
          "id": "concourse-set-0",
          "kind": "bench",
          "x": 420,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "concourse-set-1",
          "kind": "window",
          "x": 600,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "concourse-set-2",
          "kind": "sign",
          "x": 1140,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "concourse-set-3",
          "kind": "vending",
          "x": 1680,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "concourse-set-4",
          "kind": "window",
          "x": 1860,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "concourse-set-5",
          "kind": "fan",
          "x": 2220,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "concourse-set-6",
          "kind": "bench",
          "x": 2580,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "concourse-detail-0",
          "kind": "noticeboard",
          "x": 360,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "concourse-detail-1",
          "kind": "ceiling-light",
          "x": 1147,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "concourse-detail-2",
          "kind": "fire-cabinet",
          "x": 1717,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "concourse-detail-3",
          "kind": "wall-clock",
          "x": 2250,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "concourse-detail-4",
          "kind": "pipe-elbow",
          "x": 2640,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "concourse-cover1",
          "kind": "bench",
          "x": 1030,
          "z": 0.47,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 190,
            "d": 0.12
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "concourse-cover2",
          "kind": "vending",
          "x": 1810,
          "z": 0.53,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 220,
            "d": 0.14
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "concourse-cover3",
          "kind": "bench",
          "x": 2500,
          "z": 0.44,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 150,
            "d": 0.1
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [],
      "spawns": [
        {
          "id": "concourse-east",
          "x": 2945,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "concourse-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "concourse-cover1",
          "x": 1030,
          "z": 0.47,
          "w": 190,
          "d": 0.12,
          "prop": "bench"
        },
        {
          "id": "concourse-cover2",
          "x": 1810,
          "z": 0.53,
          "w": 220,
          "d": 0.14,
          "prop": "vending"
        },
        {
          "id": "concourse-cover3",
          "x": 2500,
          "z": 0.44,
          "w": 150,
          "d": 0.1,
          "prop": "bench"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "concourse",
        "variant": "glazed_gallery",
        "circuit": "habitat",
        "ceilingRatio": 0.16,
        "wallModules": 9,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "concourse-phase-0",
          "kind": "paper-trail",
          "x": 690,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "concourse-phase-1",
          "kind": "emergency-arrow",
          "x": 1470,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "concourse-phase-2",
          "kind": "broken-light",
          "x": 2220,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "concourse-phase-3",
          "kind": "scorch",
          "x": 2640,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-concourse",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "ops",
      "name": "Contrôle colonial",
      "building": "Administration",
      "floor": 1,
      "kind": "depth",
      "width": 2400,
      "map": [
        2,
        1
      ],
      "theme": "ops",
      "landmark": "Baie de supervision et consoles de communications",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        57.1,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "ops>concourse",
          "to": "concourse",
          "x": 170,
          "z": 0.69,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "concourse>ops"
          }
        },
        {
          "id": "ops>briefing",
          "to": "briefing",
          "x": 2230,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2230,
            "approachZ": 0.69,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "briefing>ops"
          }
        },
        {
          "id": "ops>relay",
          "to": "relay",
          "x": 672,
          "z": 0.28,
          "kind": "coursive",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "corridor",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 672,
            "approachZ": 0.28,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "relay>ops"
          }
        },
        {
          "id": "ops>aerial",
          "to": "aerial",
          "x": 1320,
          "z": 0.28,
          "kind": "escalier",
          "childOnly": false,
          "requires": "service-aerial",
          "shortcut": "aerial",
          "lockReason": "Déverrouillage à effectuer dans Terrasse des antennes",
          "architecture": {
            "type": "stairs",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1320,
            "approachZ": 0.28,
            "originFloor": 1,
            "destinationFloor": 2,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "aerial>ops"
          }
        },
        {
          "id": "ops>armory",
          "to": "armory",
          "x": 1770,
          "z": 0.28,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1770,
            "approachZ": 0.28,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "armory>ops"
          }
        }
      ],
      "props": [
        {
          "id": "ops-set-0",
          "kind": "console",
          "x": 400,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "poste de travail"
        },
        {
          "id": "ops-set-1",
          "kind": "screen",
          "x": 900,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "ops-set-2",
          "kind": "console",
          "x": 1040,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "poste de travail"
        },
        {
          "id": "ops-set-3",
          "kind": "antenna",
          "x": 1540,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "ops-set-4",
          "kind": "screen",
          "x": 1500,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "ops-set-5",
          "kind": "map",
          "x": 2000,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "ops-detail-0",
          "kind": "chair",
          "x": 1156,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "ops-detail-1",
          "kind": "noticeboard",
          "x": 924,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "ops-detail-2",
          "kind": "radio-mast",
          "x": 1020,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "ops-detail-3",
          "kind": "wall-clock",
          "x": 1476,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "ops-detail-4",
          "kind": "ceiling-light",
          "x": 366,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "ops-cover1",
          "kind": "console",
          "x": 960,
          "z": 0.49,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 210,
            "d": 0.16
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "ops-cover2",
          "kind": "console",
          "x": 1660,
          "z": 0.55,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 170,
            "d": 0.14
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "id": "brief",
          "label": "Consulter le tableau de service",
          "kind": "terminal",
          "x": 552,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 0
        },
        {
          "id": "missing",
          "label": "Relever les dernières balises PDT",
          "kind": "terminal",
          "x": 912,
          "z": 0.81,
          "description": "On marque chaque porte derrière nous. Je refuse de perdre quelqu’un à un embranchement.",
          "chapter": 7
        },
        {
          "id": "a02",
          "label": "Grille de prospection",
          "kind": "archive",
          "x": 1967.9999999999998,
          "z": 0.43,
          "description": "Secteur de relevé ajouté à la tournée des Jorden. Coordonnées transmises par liaison Compagnie. Priorité haute. L’équipe de prospection demande une raison ; aucune précision reçue à ce jour."
        },
        {
          "id": "contact-simpson",
          "kind": "lore-contact",
          "actorId": "simpson",
          "room": "ops",
          "x": 1040,
          "z": 0.8,
          "phaseMax": 1,
          "label": "Parler à Al Simpson",
          "description": "Les arrivants passent au contrôle. Le tableau ne remplace pas une présence : prévenez le poste avant de sortir.",
          "note": "Administrateur attesté ; dialogue, tenue et poste local interprétés. Référence : extrait de 2173 ; cette mise en scène en 2179 reste originale."
        }
      ],
      "spawns": [
        {
          "id": "ops-east",
          "x": 2345,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "ops-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "ops-cover1",
          "x": 960,
          "z": 0.49,
          "w": 210,
          "d": 0.16,
          "prop": "console"
        },
        {
          "id": "ops-cover2",
          "x": 1660,
          "z": 0.55,
          "w": 170,
          "d": 0.14,
          "prop": "console"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "command",
        "variant": "observation_bay",
        "circuit": "research",
        "ceilingRatio": 0.16,
        "wallModules": 7,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "ops-phase-0",
          "kind": "paper-trail",
          "x": 552,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "ops-phase-1",
          "kind": "emergency-arrow",
          "x": 1176,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "ops-phase-2",
          "kind": "broken-light",
          "x": 1776,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "ops-phase-3",
          "kind": "scorch",
          "x": 2112,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-ops",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "briefing",
      "name": "Poste de la garnison",
      "building": "Administration",
      "floor": 1,
      "kind": "side",
      "width": 2200,
      "map": [
        3,
        1
      ],
      "theme": "barracks",
      "landmark": "Casiers individuels et table de service",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "cold",
      "dimensionsM": [
        52.4,
        2.8,
        3.4
      ],
      "portals": [
        {
          "id": "briefing>ops",
          "to": "ops",
          "x": 170,
          "z": 0.7,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "ops>briefing"
          }
        },
        {
          "id": "briefing>armory",
          "to": "armory",
          "x": 1230,
          "z": 0.7,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1230,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "armory>briefing"
          }
        }
      ],
      "props": [
        {
          "id": "briefing-set-0",
          "kind": "locker",
          "x": 383,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "briefing-set-1",
          "kind": "rifle-rack",
          "x": 670,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "briefing-set-2",
          "kind": "table",
          "x": 957,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "briefing-set-3",
          "kind": "locker",
          "x": 1243,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "briefing-set-4",
          "kind": "radio",
          "x": 1530,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "briefing-set-5",
          "kind": "locker",
          "x": 1817,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "briefing-detail-0",
          "kind": "hanging-coat",
          "x": 698,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "briefing-detail-1",
          "kind": "rifle-case",
          "x": 682,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "briefing-detail-2",
          "kind": "noticeboard",
          "x": 920,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "briefing-detail-3",
          "kind": "wall-clock",
          "x": 1518,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "briefing-detail-4",
          "kind": "ceiling-light",
          "x": 1936,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "locker",
          "label": "Prendre la dotation",
          "kind": "supply",
          "x": 506,
          "z": 0.7,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 0
        },
        {
          "id": "a03",
          "label": "Ordre du jour",
          "kind": "archive",
          "x": 1804.0,
          "z": 0.7,
          "description": "Relève du poste central à six heures. Révision des joints du garage reportée. Les patrouilles devront signaler toute conduite qui siffle : le processeur six nous a déjà coûté assez de sommeil."
        },
        {
          "id": "cache-briefing",
          "label": "Réserve de terrain",
          "kind": "pickup",
          "x": 1166.0,
          "z": 0.7,
          "description": "Soins et dotation de terrain. Une seule collecte par parcours."
        },
        {
          "id": "hide-briefing",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 725,
          "z": 0.7,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        }
      ],
      "spawns": [
        {
          "id": "briefing-east",
          "x": 2145,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "briefing-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "barracks",
        "variant": "locker_bays",
        "circuit": "habitat",
        "ceilingRatio": 0.16,
        "wallModules": 6,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "briefing-phase-0",
          "kind": "paper-trail",
          "x": 506,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "briefing-phase-1",
          "kind": "emergency-arrow",
          "x": 1078,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "briefing-phase-2",
          "kind": "broken-light",
          "x": 1628,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "briefing-phase-3",
          "kind": "scorch",
          "x": 1936,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-briefing",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "hab",
      "name": "Coursive résidentielle",
      "building": "Habitat",
      "floor": 1,
      "kind": "side",
      "width": 2700,
      "map": [
        3,
        2
      ],
      "theme": "hab",
      "landmark": "Portes numérotées et fenêtres des logements",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "cold",
      "dimensionsM": [
        64.3,
        2.8,
        3.4
      ],
      "portals": [
        {
          "id": "hab>concourse",
          "to": "concourse",
          "x": 170,
          "z": 0.7,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "concourse>hab"
          }
        },
        {
          "id": "hab>jorden",
          "to": "jorden",
          "x": 2530,
          "z": 0.7,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2530,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "jorden>hab"
          }
        },
        {
          "id": "hab>recreation",
          "to": "recreation",
          "x": 756,
          "z": 0.7,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 756,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "recreation>hab"
          }
        },
        {
          "id": "hab>wash",
          "to": "wash",
          "x": 1296,
          "z": 0.7,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1296,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "wash>hab"
          }
        },
        {
          "id": "hab>pantry",
          "to": "pantry",
          "x": 1720,
          "z": 0.7,
          "kind": "escalier",
          "childOnly": false,
          "requires": "service-pantry",
          "shortcut": "pantry",
          "lockReason": "Déverrouillage à effectuer dans Office de la cuisine",
          "architecture": {
            "type": "stairs",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1720,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "pantry>hab"
          }
        }
      ],
      "props": [
        {
          "id": "hab-set-0",
          "kind": "hab-door",
          "x": 425,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hab-set-1",
          "kind": "window",
          "x": 795,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hab-set-2",
          "kind": "hab-door",
          "x": 1165,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hab-set-3",
          "kind": "plant",
          "x": 1535,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hab-set-4",
          "kind": "hab-door",
          "x": 1905,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hab-set-5",
          "kind": "drawing",
          "x": 2275,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "trace de vie familiale"
        },
        {
          "id": "hab-detail-0",
          "kind": "door-plaque",
          "x": 324,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hab-detail-1",
          "kind": "fire-cabinet",
          "x": 1054,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hab-detail-2",
          "kind": "pipe-elbow",
          "x": 1567,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hab-detail-3",
          "kind": "ceiling-light",
          "x": 1863,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hab-detail-4",
          "kind": "noticeboard",
          "x": 2376,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "hide-hab",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 2349,
          "z": 0.7,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        }
      ],
      "spawns": [
        {
          "id": "hab-east",
          "x": 2645,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "hab-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "residential",
        "variant": "numbered_alcoves",
        "circuit": "habitat",
        "ceilingRatio": 0.16,
        "wallModules": 8,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "hab-phase-0",
          "kind": "paper-trail",
          "x": 621,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "hab-phase-1",
          "kind": "emergency-arrow",
          "x": 1323,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "hab-phase-2",
          "kind": "broken-light",
          "x": 1998,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "hab-phase-3",
          "kind": "scorch",
          "x": 2376,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-hab",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "jorden",
      "name": "Logement des Jorden",
      "building": "Habitat",
      "floor": 1,
      "kind": "depth",
      "width": 1850,
      "map": [
        4,
        2
      ],
      "theme": "quarters",
      "landmark": "Table familiale, lits et dessins d’enfant",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        44.0,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "jorden>hab",
          "to": "hab",
          "x": 170,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "hab>jorden"
          }
        },
        {
          "id": "jorden>vent_hab",
          "to": "vent_hab",
          "x": 1680,
          "z": 0.69,
          "kind": "conduit",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 1680,
            "approachZ": 0.69,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "vent_hab>jorden"
          }
        }
      ],
      "props": [
        {
          "id": "jorden-set-0",
          "kind": "bed",
          "x": 354,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "jorden-set-1",
          "kind": "table",
          "x": 582,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "jorden-set-2",
          "kind": "drawing",
          "x": 811,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "trace de vie familiale"
        },
        {
          "id": "jorden-set-3",
          "kind": "cupboard",
          "x": 1039,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "jorden-set-4",
          "kind": "bed",
          "x": 1268,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "jorden-set-5",
          "kind": "toy",
          "x": 1496,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "jorden-detail-0",
          "kind": "photo",
          "x": 222,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "jorden-detail-1",
          "kind": "mug",
          "x": 574,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "jorden-detail-2",
          "kind": "hanging-coat",
          "x": 925,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "jorden-detail-3",
          "kind": "bed-lamp",
          "x": 1276,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "jorden-detail-4",
          "kind": "vent-cover",
          "x": 1628,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "jorden-cover1",
          "kind": "table",
          "x": 760,
          "z": 0.46,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 205,
            "d": 0.14
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "jorden-cover2",
          "kind": "cupboard",
          "x": 1190,
          "z": 0.53,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 130,
            "d": 0.16
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "id": "family",
          "label": "Préparer la tournée",
          "kind": "talk",
          "x": 426,
          "z": 0.81,
          "description": "On peut retarder les relevés. Pas le chauffage du bloc.",
          "chapter": 1,
          "actorId": "russ"
        },
        {
          "id": "a04",
          "label": "Une table pour quatre",
          "kind": "archive",
          "x": 1517.0,
          "z": 0.43,
          "description": "Anne — Il reste des provisions au réfectoire. Tim a encore déplacé ses affaires dans les conduits. J’ai remis la petite couverture sur le lit de Becky. On rentrera avant que le chauffage recommence à faire du bruit."
        },
        {
          "id": "hide-jorden",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 771,
          "z": 0.82,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        },
        {
          "id": "contact-tim",
          "kind": "lore-contact",
          "actorId": "tim",
          "room": "jorden",
          "x": 1250,
          "z": 0.8,
          "phaseMax": 1,
          "label": "Parler à Tim Jorden",
          "description": "Je connais les grilles près de chez nous. Je ne passe pas là où la tôle a été ressoudée.",
          "note": "Enfant de la famille Jorden, attesté ; tenue et visage interprétés. Référence : extrait de 2173 ; cette mise en scène en 2179 reste originale."
        }
      ],
      "spawns": [
        {
          "id": "jorden-east",
          "x": 1795,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "jorden-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "jorden-cover1",
          "x": 760,
          "z": 0.46,
          "w": 205,
          "d": 0.14,
          "prop": "table"
        },
        {
          "id": "jorden-cover2",
          "x": 1190,
          "z": 0.53,
          "w": 130,
          "d": 0.16,
          "prop": "cupboard"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "domestic",
        "variant": "low_ceiling",
        "circuit": "habitat",
        "ceilingRatio": 0.22,
        "wallModules": 5,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "jorden-phase-0",
          "kind": "paper-trail",
          "x": 426,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "jorden-phase-1",
          "kind": "emergency-arrow",
          "x": 906,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "jorden-phase-2",
          "kind": "broken-light",
          "x": 1369,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "jorden-phase-3",
          "kind": "scorch",
          "x": 1628,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-jorden",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "mess",
      "name": "Réfectoire",
      "building": "Habitat",
      "floor": 0,
      "kind": "depth",
      "width": 2600,
      "map": [
        4,
        3
      ],
      "theme": "mess",
      "landmark": "Tables, cuisine et distributeurs",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        61.9,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "mess>recreation",
          "to": "recreation",
          "x": 170,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "recreation>mess"
          }
        },
        {
          "id": "mess>wash",
          "to": "wash",
          "x": 2430,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2430,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "wash>mess"
          }
        },
        {
          "id": "mess>stores",
          "to": "stores",
          "x": 728,
          "z": 0.28,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 728,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "stores>mess"
          }
        },
        {
          "id": "mess>pantry",
          "to": "pantry",
          "x": 1850,
          "z": 0.28,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "shortcut": null,
          "lockReason": null,
          "architecture": {
            "type": "door",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1850,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "pantry>mess"
          }
        }
      ],
      "props": [
        {
          "id": "mess-set-0",
          "kind": "vending",
          "x": 417,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "mess-set-1",
          "kind": "stove",
          "x": 950,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "mess-set-2",
          "kind": "table",
          "x": 1123,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "mess-set-3",
          "kind": "table",
          "x": 1477,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "mess-set-4",
          "kind": "table",
          "x": 2010,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "mess-set-5",
          "kind": "sink",
          "x": 2183,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "mess-detail-0",
          "kind": "chair",
          "x": 1180,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "mess-detail-1",
          "kind": "mug",
          "x": 1240,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "mess-detail-2",
          "kind": "kitchen-hood",
          "x": 1517,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "mess-detail-3",
          "kind": "tray",
          "x": 1614,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "mess-detail-4",
          "kind": "fire-cabinet",
          "x": 342,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "mess-cover1",
          "kind": "table",
          "x": 910,
          "z": 0.48,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 185,
            "d": 0.13
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "mess-cover2",
          "kind": "table",
          "x": 1580,
          "z": 0.49,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 250,
            "d": 0.14
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "mess-cover3",
          "kind": "table",
          "x": 2060,
          "z": 0.53,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 130,
            "d": 0.1
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "id": "provisions",
          "label": "Récupérer les provisions",
          "kind": "supply",
          "x": 598,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 1
        },
        {
          "id": "civilian",
          "label": "Accompagner un colon jusqu’au magasin",
          "kind": "escort",
          "x": 988,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 8,
          "escortTo": "stores",
          "escortName": "Colon du bloc C",
          "actorId": "civilian"
        },
        {
          "id": "ration",
          "label": "Trouver de quoi manger",
          "kind": "supply",
          "x": 1378,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 14
        },
        {
          "id": "hide-mess",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 2262,
          "z": 0.82,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        },
        {
          "room": "mess",
          "id": "job-pantry-part",
          "label": "Récupérer la poignée de rechange",
          "x": 390,
          "z": 0.28,
          "description": "Emporter poignée de service.",
          "duration": 0.9,
          "kind": "side-task",
          "job": "pantry",
          "step": 1,
          "hardware": "tools"
        },
        {
          "id": "contact-bronagh",
          "kind": "lore-contact",
          "actorId": "bronagh",
          "room": "mess",
          "x": 1670,
          "z": 0.8,
          "phaseMax": 1,
          "label": "Parler à Bronagh Flaherty",
          "description": "Les portions froides sont pour le prochain quart. Refermez les réserves et signalez ce qui manque.",
          "note": "Cuisinière attestée ; visage, tenue et état en 2179 interprétés. Référence : extrait de 2173 ; cette mise en scène en 2179 reste originale."
        }
      ],
      "spawns": [
        {
          "id": "mess-east",
          "x": 2545,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "mess-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "mess-cover1",
          "x": 910,
          "z": 0.48,
          "w": 185,
          "d": 0.13,
          "prop": "table"
        },
        {
          "id": "mess-cover2",
          "x": 1580,
          "z": 0.49,
          "w": 250,
          "d": 0.14,
          "prop": "table"
        },
        {
          "id": "mess-cover3",
          "x": 2060,
          "z": 0.53,
          "w": 130,
          "d": 0.1,
          "prop": "table"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "canteen",
        "variant": "kitchen_pass",
        "circuit": "habitat",
        "ceilingRatio": 0.16,
        "wallModules": 8,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "mess-phase-0",
          "kind": "paper-trail",
          "x": 598,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "mess-phase-1",
          "kind": "emergency-arrow",
          "x": 1274,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "mess-phase-2",
          "kind": "broken-light",
          "x": 1924,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "mess-phase-3",
          "kind": "scorch",
          "x": 2288,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-mess",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "recreation",
      "name": "Centre de loisirs",
      "building": "Habitat",
      "floor": 0,
      "kind": "depth",
      "width": 2250,
      "map": [
        3,
        3
      ],
      "theme": "recreation",
      "landmark": "Jeux, bancs et accès à la maintenance",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        53.6,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "recreation>hab",
          "to": "hab",
          "x": 170,
          "z": 0.69,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "hab>recreation"
          }
        },
        {
          "id": "recreation>mess",
          "to": "mess",
          "x": 2080,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2080,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "mess>recreation"
          }
        },
        {
          "id": "recreation>vent_hab",
          "to": "vent_hab",
          "x": 630,
          "z": 0.28,
          "kind": "grille",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 630,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "vent_hab>recreation"
          }
        },
        {
          "id": "recreation>greenhouse",
          "to": "greenhouse",
          "x": 1590,
          "z": 0.81,
          "kind": "coursive",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "corridor",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1590,
            "approachZ": 0.81,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "greenhouse>recreation"
          }
        }
      ],
      "props": [
        {
          "id": "recreation-set-0",
          "kind": "arcade",
          "x": 417,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "recreation-set-1",
          "kind": "bench",
          "x": 771,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "recreation-set-2",
          "kind": "arcade",
          "x": 1125,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "recreation-set-3",
          "kind": "table",
          "x": 1479,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "recreation-set-4",
          "kind": "drawing",
          "x": 1833,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "trace de vie familiale"
        },
        {
          "id": "recreation-detail-0",
          "kind": "chair",
          "x": 921,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "recreation-detail-1",
          "kind": "noticeboard",
          "x": 878,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "recreation-detail-2",
          "kind": "mug",
          "x": 1125,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "recreation-detail-3",
          "kind": "wall-clock",
          "x": 1553,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "recreation-detail-4",
          "kind": "fire-cabinet",
          "x": 384,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "recreation-cover1",
          "kind": "arcade",
          "x": 810,
          "z": 0.48,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 125,
            "d": 0.17
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "recreation-cover2",
          "kind": "bench",
          "x": 1430,
          "z": 0.51,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 240,
            "d": 0.12
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "id": "a05",
          "label": "Les chemins de Tim",
          "kind": "archive",
          "x": 1845.0,
          "z": 0.43,
          "description": "Après la grille qui vibre, tourner à gauche. Ne pas poser le pied sur la plaque claire. Elle résonne jusque dans le couloir. Tim dit qu’il connaît un chemin encore plus court."
        },
        {
          "id": "hide-recreation",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 462,
          "z": 0.82,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        }
      ],
      "spawns": [
        {
          "id": "recreation-east",
          "x": 2195,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "recreation-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "recreation-cover1",
          "x": 810,
          "z": 0.48,
          "w": 125,
          "d": 0.17,
          "prop": "arcade"
        },
        {
          "id": "recreation-cover2",
          "x": 1430,
          "z": 0.51,
          "w": 240,
          "d": 0.12,
          "prop": "bench"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "leisure",
        "variant": "recessed_arcades",
        "circuit": "habitat",
        "ceilingRatio": 0.16,
        "wallModules": 7,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "recreation-phase-0",
          "kind": "paper-trail",
          "x": 518,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "recreation-phase-1",
          "kind": "emergency-arrow",
          "x": 1102,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "recreation-phase-2",
          "kind": "broken-light",
          "x": 1665,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "recreation-phase-3",
          "kind": "scorch",
          "x": 1980,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-recreation",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "med",
      "name": "Infirmerie",
      "building": "Médical",
      "floor": 0,
      "kind": "depth",
      "width": 2800,
      "map": [
        2,
        3
      ],
      "theme": "med",
      "landmark": "Lits isolés, vitres d’observation et moniteurs",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        66.7,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "med>concourse",
          "to": "concourse",
          "x": 170,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "concourse>med"
          }
        },
        {
          "id": "med>isolation",
          "to": "isolation",
          "x": 2630,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2630,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "isolation>med"
          }
        },
        {
          "id": "med>clinic_store",
          "to": "clinic_store",
          "x": 784,
          "z": 0.28,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 784,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "clinic_store>med"
          }
        },
        {
          "id": "med>science",
          "to": "science",
          "x": 1344,
          "z": 0.28,
          "kind": "sas",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "airlock",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1344,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "science>med"
          }
        },
        {
          "id": "med>biomed",
          "to": "biomed",
          "x": 2000,
          "z": 0.28,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "shortcut": null,
          "lockReason": null,
          "architecture": {
            "type": "door",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2000,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "biomed>med"
          }
        }
      ],
      "props": [
        {
          "id": "med-set-0",
          "kind": "bed",
          "x": 433,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "med-set-1",
          "kind": "monitor",
          "x": 1000,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "med-set-2",
          "kind": "bed",
          "x": 1207,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "med-set-3",
          "kind": "sink",
          "x": 1593,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "med-set-4",
          "kind": "medicine",
          "x": 2160,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "med-set-5",
          "kind": "bed",
          "x": 2367,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "med-detail-0",
          "kind": "privacy-screen",
          "x": 336,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "med-detail-1",
          "kind": "oxygen",
          "x": 1736,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "med-detail-2",
          "kind": "medical-cross",
          "x": 1580,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "med-detail-3",
          "kind": "wall-clock",
          "x": 1752,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "med-detail-4",
          "kind": "gurney",
          "x": 2464,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "med-cover1",
          "kind": "bed",
          "x": 1050,
          "z": 0.48,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 210,
            "d": 0.14
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "med-cover2",
          "kind": "cart",
          "x": 1830,
          "z": 0.51,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 165,
            "d": 0.16
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "med-cover3",
          "kind": "cart",
          "x": 1630,
          "z": 0.865,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 140,
            "d": 0.04
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "med-v09-14",
          "kind": "natal-unit",
          "x": 2220,
          "z": 0.32,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "med-v09-15",
          "kind": "white-monitor",
          "x": 2250,
          "z": 0.3,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "med-v09-16",
          "kind": "named-doctor",
          "x": 1810,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        }
      ],
      "objects": [
        {
          "id": "triage",
          "label": "Transmettre le bilan à Komiskey",
          "kind": "terminal",
          "x": 644,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 4
        },
        {
          "id": "patient_log",
          "label": "Consulter le registre des patients",
          "kind": "terminal",
          "x": 1064,
          "z": 0.81,
          "description": "Ce n’est pas une cargaison. C’est mon mari.",
          "chapter": 5
        },
        {
          "id": "a06",
          "label": "Priorité médicale",
          "kind": "archive",
          "x": 2296.0,
          "z": 0.43,
          "description": "Couloir médical dégagé en permanence. Un seul membre de la famille admis auprès des patients. Les demandes de transfert vers le laboratoire doivent être validées par le personnel soignant."
        },
        {
          "id": "cache-med",
          "label": "Réserve de terrain",
          "kind": "pickup",
          "x": 1484.0,
          "z": 0.86,
          "description": "Soins et dotation de terrain. Une seule collecte par parcours."
        },
        {
          "id": "hide-med",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 2436,
          "z": 0.82,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        },
        {
          "id": "medical-unit-v09",
          "kind": "inspection",
          "x": 2280,
          "z": 0.32,
          "label": "Examiner l’unité médicale",
          "description": "L’unité obstétricale est attestée par un extrait du roman. Son implantation ici et son état en 2179 sont interprétés ; ce poste est observable, pas une simulation de chirurgie."
        },
        {
          "id": "contact-joel",
          "kind": "lore-contact",
          "actorId": "joel",
          "room": "med",
          "x": 1590,
          "z": 0.8,
          "phaseMax": 1,
          "label": "Parler à Joel",
          "description": "Laissez les portes du service dégagées. Une civière doit pouvoir passer sans contourner vos sacs.",
          "note": "Infirmier mince attesté ; visage, tenue et état en 2179 interprétés. Référence : extrait de 2173 ; cette mise en scène en 2179 reste originale."
        }
      ],
      "spawns": [
        {
          "id": "med-east",
          "x": 2745,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "med-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "med-cover1",
          "x": 1050,
          "z": 0.48,
          "w": 210,
          "d": 0.14,
          "prop": "bed"
        },
        {
          "id": "med-cover2",
          "x": 1830,
          "z": 0.51,
          "w": 165,
          "d": 0.16,
          "prop": "cart"
        },
        {
          "id": "med-cover3",
          "x": 1630,
          "z": 0.865,
          "w": 140,
          "d": 0.04,
          "prop": "cart"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "medical",
        "variant": "observation_partitions",
        "circuit": "medical",
        "ceilingRatio": 0.16,
        "wallModules": 8,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "med-phase-0",
          "kind": "paper-trail",
          "x": 644,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "med-phase-1",
          "kind": "emergency-arrow",
          "x": 1372,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "med-phase-2",
          "kind": "broken-light",
          "x": 2072,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "med-phase-3",
          "kind": "scorch",
          "x": 2464,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-med",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "isolation",
      "name": "Chambre d’isolement",
      "building": "Médical",
      "floor": 0,
      "kind": "side",
      "width": 1700,
      "map": [
        1,
        3
      ],
      "theme": "isolation",
      "landmark": "Lit d’observation et hublot de quarantaine",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "cold",
      "dimensionsM": [
        40.5,
        2.8,
        3.4
      ],
      "portals": [
        {
          "id": "isolation>med",
          "to": "med",
          "x": 170,
          "z": 0.7,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "med>isolation"
          }
        },
        {
          "id": "isolation>vent_med",
          "to": "vent_med",
          "x": 1530,
          "z": 0.7,
          "kind": "grille",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 1530,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "vent_med>isolation"
          }
        }
      ],
      "props": [
        {
          "id": "isolation-set-0",
          "kind": "bed",
          "x": 362,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "isolation-set-1",
          "kind": "monitor",
          "x": 606,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "isolation-set-2",
          "kind": "glass",
          "x": 850,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "isolation-set-3",
          "kind": "sink",
          "x": 1094,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "isolation-set-4",
          "kind": "specimen",
          "x": 1338,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "isolation-detail-0",
          "kind": "privacy-screen",
          "x": 638,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "isolation-detail-1",
          "kind": "oxygen",
          "x": 527,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "isolation-detail-2",
          "kind": "medical-cross",
          "x": 850,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "isolation-detail-3",
          "kind": "wall-clock",
          "x": 1173,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "isolation-detail-4",
          "kind": "gurney",
          "x": 667,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "quarantine",
          "label": "Fermer l’isolement médical",
          "kind": "seal",
          "x": 391,
          "z": 0.7,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 4
        },
        {
          "id": "a07",
          "label": "Le hublot",
          "kind": "archive",
          "x": 1394.0,
          "z": 0.7,
          "description": "L’isolement reste fermé. La vitre ne doit pas être ouverte pour faciliter une observation. Toute intervention sur le patient nécessite deux personnes et un accès libre au sas."
        },
        {
          "id": "hide-isolation",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 533,
          "z": 0.7,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        }
      ],
      "spawns": [
        {
          "id": "isolation-east",
          "x": 1645,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "isolation-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "medical",
        "variant": "sealed_observation",
        "circuit": "medical",
        "ceilingRatio": 0.16,
        "wallModules": 5,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "isolation-phase-0",
          "kind": "paper-trail",
          "x": 391,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "isolation-phase-1",
          "kind": "emergency-arrow",
          "x": 833,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "isolation-phase-2",
          "kind": "broken-light",
          "x": 1258,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "isolation-phase-3",
          "kind": "scorch",
          "x": 1496,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-isolation",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "science",
      "name": "Laboratoire de la Compagnie",
      "building": "Recherche",
      "floor": 0,
      "kind": "depth",
      "width": 2400,
      "map": [
        1,
        4
      ],
      "theme": "lab",
      "landmark": "Paillasses, cuves et racks de confinement",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        57.1,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "science>med",
          "to": "med",
          "x": 170,
          "z": 0.69,
          "kind": "sas",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "airlock",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "med>science"
          }
        },
        {
          "id": "science>records",
          "to": "records",
          "x": 2230,
          "z": 0.69,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2230,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "records>science"
          }
        },
        {
          "id": "science>service",
          "to": "service",
          "x": 672,
          "z": 0.28,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 672,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "service>science"
          }
        },
        {
          "id": "science>hangar",
          "to": "hangar",
          "x": 1152,
          "z": 0.28,
          "kind": "sas",
          "childOnly": false,
          "requires": "scienceClearance",
          "architecture": {
            "type": "airlock",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1152,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "hangar>science"
          }
        }
      ],
      "props": [
        {
          "id": "science-set-0",
          "kind": "specimen",
          "x": 400,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "science-set-1",
          "kind": "console",
          "x": 900,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "science-set-2",
          "kind": "specimen",
          "x": 860,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "science-set-3",
          "kind": "sink",
          "x": 1360,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "science-set-4",
          "kind": "microscope",
          "x": 1680,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "science-set-5",
          "kind": "tank",
          "x": 2000,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "science-detail-0",
          "kind": "glass-cabinet",
          "x": 1373,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "science-detail-1",
          "kind": "lab-bench",
          "x": 1395,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "science-detail-2",
          "kind": "oxygen",
          "x": 1417,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "science-detail-3",
          "kind": "warning-board",
          "x": 1656,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "science-detail-4",
          "kind": "vent-cover",
          "x": 2112,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "science-cover1",
          "kind": "lab-bench",
          "x": 840,
          "z": 0.51,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 210,
            "d": 0.15
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "science-cover2",
          "kind": "specimen",
          "x": 1570,
          "z": 0.45,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 175,
            "d": 0.12
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "id": "orders",
          "label": "Lire la directive scientifique",
          "kind": "terminal",
          "x": 552,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 5
        },
        {
          "id": "hidalgo",
          "label": "Recevoir la transmission de Brackett",
          "kind": "terminal",
          "x": 912,
          "z": 0.81,
          "description": "Transmission radio de Brackett : un poste, pas un corps de Brackett placé dans le laboratoire.",
          "chapter": 12,
          "grantFlag": "scienceClearance",
          "representation": "radio",
          "actorId": null
        },
        {
          "id": "a08",
          "label": "Mainmise",
          "kind": "archive",
          "x": 1967.9999999999998,
          "z": 0.43,
          "description": "L’échantillon doit demeurer sur place. Les résultats d’observation passent par le canal scientifique avant toute transmission extérieure. Les urgences médicales ne dispensent pas de renseigner la chaîne de possession."
        }
      ],
      "spawns": [
        {
          "id": "science-east",
          "x": 2345,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "science-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "science-cover1",
          "x": 840,
          "z": 0.51,
          "w": 210,
          "d": 0.15,
          "prop": "lab-bench"
        },
        {
          "id": "science-cover2",
          "x": 1570,
          "z": 0.45,
          "w": 175,
          "d": 0.12,
          "prop": "specimen"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "laboratory",
        "variant": "containment_bays",
        "circuit": "research",
        "ceilingRatio": 0.16,
        "wallModules": 7,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "science-phase-0",
          "kind": "paper-trail",
          "x": 552,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "science-phase-1",
          "kind": "emergency-arrow",
          "x": 1176,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "science-phase-2",
          "kind": "broken-light",
          "x": 1776,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "science-phase-3",
          "kind": "scorch",
          "x": 2112,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-science",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "records",
      "name": "Salle des archives",
      "building": "Recherche",
      "floor": 1,
      "kind": "side",
      "width": 1800,
      "map": [
        0,
        4
      ],
      "theme": "records",
      "landmark": "Bandes de données et baie réseau",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "amber",
      "dimensionsM": [
        42.9,
        2.8,
        3.4
      ],
      "portals": [
        {
          "id": "records>science",
          "to": "science",
          "x": 170,
          "z": 0.7,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "science>records"
          }
        },
        {
          "id": "records>relay",
          "to": "relay",
          "x": 1630,
          "z": 0.7,
          "kind": "coursive",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "corridor",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1630,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "relay>records"
          }
        }
      ],
      "props": [
        {
          "id": "records-set-0",
          "kind": "rack",
          "x": 372,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "records-set-1",
          "kind": "rack",
          "x": 636,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "records-set-2",
          "kind": "console",
          "x": 900,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "poste de travail"
        },
        {
          "id": "records-set-3",
          "kind": "rack",
          "x": 1164,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "records-set-4",
          "kind": "screen",
          "x": 1428,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "records-detail-0",
          "kind": "server",
          "x": 650,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "records-detail-1",
          "kind": "tape-reel",
          "x": 558,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "records-detail-2",
          "kind": "cable-tray",
          "x": 900,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "records-detail-3",
          "kind": "vent-cover",
          "x": 1242,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "records-detail-4",
          "kind": "wall-clock",
          "x": 1404,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        }
      ],
      "objects": [
        {
          "id": "copy",
          "label": "Conserver une copie des échanges",
          "kind": "terminal",
          "x": 414,
          "z": 0.7,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 5
        },
        {
          "id": "a09",
          "label": "Transmission conservée",
          "kind": "archive",
          "x": 1476.0,
          "z": 0.7,
          "description": "Copie locale créée. Si la liaison est coupée, garder les bandes hors de la baie principale. La suppression d’un message ne doit pas supprimer la preuve qu’il a été reçu."
        },
        {
          "id": "hide-records",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 777,
          "z": 0.7,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        },
        {
          "room": "records",
          "id": "job-aerial-part",
          "label": "Retrouver le coupleur de transmission",
          "x": 1050,
          "z": 0.7,
          "description": "Emporter coupleur radio.",
          "duration": 0.9,
          "kind": "side-task",
          "job": "aerial",
          "step": 1,
          "hardware": "tools"
        }
      ],
      "spawns": [
        {
          "id": "records-east",
          "x": 1745,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "records-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "archive",
        "variant": "server_aisles",
        "circuit": "research",
        "ceilingRatio": 0.16,
        "wallModules": 5,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "records-phase-0",
          "kind": "paper-trail",
          "x": 414,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "records-phase-1",
          "kind": "emergency-arrow",
          "x": 882,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "records-phase-2",
          "kind": "broken-light",
          "x": 1332,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "records-phase-3",
          "kind": "scorch",
          "x": 1584,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-records",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "garage",
      "name": "Garage des prospecteurs",
      "building": "Logistique",
      "floor": 0,
      "kind": "depth",
      "width": 3200,
      "map": [
        3,
        4
      ],
      "theme": "garage",
      "landmark": "Tracteur de prospection sur sa voie de service",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        76.2,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "garage>concourse",
          "to": "concourse",
          "x": 170,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "concourse>garage"
          }
        },
        {
          "id": "garage>survey",
          "to": "survey",
          "x": 3030,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 3030,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "survey>garage"
          }
        },
        {
          "id": "garage>service",
          "to": "service",
          "x": 896,
          "z": 0.28,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 896,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "service>garage"
          }
        },
        {
          "id": "garage>road",
          "to": "road",
          "x": 1536,
          "z": 0.28,
          "kind": "sas",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "airlock",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1536,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "road>garage"
          }
        },
        {
          "id": "garage>workshop",
          "to": "workshop",
          "x": 2580,
          "z": 0.28,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "shortcut": null,
          "lockReason": null,
          "architecture": {
            "type": "door",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2580,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "workshop>garage"
          }
        }
      ],
      "props": [
        {
          "id": "garage-set-0",
          "kind": "tools",
          "x": 512,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Matériel de maintenance rangé",
          "type": "tools"
        },
        {
          "id": "garage-set-1",
          "kind": "tools",
          "x": 1056,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "garage-set-2",
          "kind": "fuel",
          "x": 1780,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "garage-set-3",
          "kind": "gantry",
          "x": 2144,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "garage-set-4",
          "kind": "wheel",
          "x": 2868,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "garage-detail-0",
          "kind": "chain-hoist",
          "x": 384,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "garage-detail-1",
          "kind": "warning-board",
          "x": 1172,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "garage-detail-2",
          "kind": "hose-reel",
          "x": 1817,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "garage-detail-3",
          "kind": "tool-board",
          "x": 2208,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "garage-detail-4",
          "kind": "ceiling-light",
          "x": 2816,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "garage-cover1",
          "kind": "tools",
          "x": 1230,
          "z": 0.47,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 230,
            "d": 0.17
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "garage-cover2",
          "kind": "wheel",
          "x": 2070,
          "z": 0.52,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 240,
            "d": 0.13
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "garage-cover3",
          "kind": "crate",
          "x": 2850,
          "z": 0.48,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 120,
            "d": 0.12
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "id": "rescue_kit",
          "label": "Prendre le matériel de secours",
          "kind": "supply",
          "x": 736,
          "z": 0.81,
          "description": "Coupez l’arrivée avant de toucher aux vannes. Ici, une mauvaise décision se propage à tout le réseau.",
          "chapter": 2
        },
        {
          "id": "tractor",
          "label": "Préparer le tracteur",
          "kind": "vehicle",
          "x": 1216,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 3
        },
        {
          "id": "a10",
          "label": "Tracteur des prospecteurs",
          "kind": "archive",
          "x": 2624.0,
          "z": 0.43,
          "description": "Le tracteur revient couvert d’une poussière que les filtres n’arrêtent pas correctement. Vérifier les joints avant toute autre sortie. Ne pas déposer les bottes de prospection dans les casiers propres."
        },
        {
          "id": "cache-garage",
          "label": "Réserve de terrain",
          "kind": "pickup",
          "x": 1696.0,
          "z": 0.86,
          "description": "Soins et dotation de terrain. Une seule collecte par parcours."
        },
        {
          "room": "garage",
          "id": "job-workshop-part",
          "label": "Décrocher la chaîne d’entraînement",
          "x": 450,
          "z": 0.28,
          "description": "Emporter chaîne de palan.",
          "duration": 0.9,
          "kind": "side-task",
          "job": "workshop",
          "step": 1,
          "hardware": "tools"
        }
      ],
      "spawns": [
        {
          "id": "garage-east",
          "x": 3145,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "garage-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "garage-cover1",
          "x": 1230,
          "z": 0.47,
          "w": 230,
          "d": 0.17,
          "prop": "tools"
        },
        {
          "id": "garage-cover2",
          "x": 2070,
          "z": 0.52,
          "w": 240,
          "d": 0.13,
          "prop": "wheel"
        },
        {
          "id": "garage-cover3",
          "x": 2850,
          "z": 0.48,
          "w": 120,
          "d": 0.12,
          "prop": "crate"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "hangar",
        "variant": "overhead_crane",
        "circuit": "industry",
        "ceilingRatio": 0.1,
        "wallModules": 9,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "garage-phase-0",
          "kind": "paper-trail",
          "x": 736,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "garage-phase-1",
          "kind": "emergency-arrow",
          "x": 1568,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "garage-phase-2",
          "kind": "broken-light",
          "x": 2368,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "garage-phase-3",
          "kind": "scorch",
          "x": 2816,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-garage",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "survey",
      "name": "Bureau des prospecteurs",
      "building": "Logistique",
      "floor": 0,
      "kind": "depth",
      "width": 2500,
      "map": [
        4,
        4
      ],
      "theme": "survey",
      "landmark": "Cartes topographiques et postes radio",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        59.5,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "survey>garage",
          "to": "garage",
          "x": 170,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "garage>survey"
          }
        },
        {
          "id": "survey>stores",
          "to": "stores",
          "x": 2330,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2330,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "stores>survey"
          }
        },
        {
          "id": "survey>vent_survey",
          "to": "vent_survey",
          "x": 700,
          "z": 0.28,
          "kind": "grille",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 700,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "vent_survey>survey"
          }
        }
      ],
      "props": [
        {
          "id": "survey-set-0",
          "kind": "map",
          "x": 442,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "survey-set-1",
          "kind": "console",
          "x": 846,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "poste de travail"
        },
        {
          "id": "survey-set-2",
          "kind": "radio",
          "x": 1250,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "survey-set-3",
          "kind": "tools",
          "x": 1654,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "survey-set-4",
          "kind": "shelf",
          "x": 2058,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "survey-cover1",
          "kind": "table",
          "x": 950,
          "z": 0.56,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 160,
            "d": 0.13
          }
        },
        {
          "id": "survey-cover2",
          "kind": "crate",
          "x": 1675,
          "z": 0.57,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 190,
            "d": 0.14
          }
        },
        {
          "id": "survey-detail-0",
          "kind": "chair",
          "x": 1168,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "survey-detail-1",
          "kind": "noticeboard",
          "x": 955,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "survey-detail-2",
          "kind": "radio-mast",
          "x": 1467,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "survey-detail-3",
          "kind": "wall-clock",
          "x": 1725,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "survey-detail-4",
          "kind": "ceiling-light",
          "x": 354,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "coordinates",
          "label": "Recevoir la grille de prospection",
          "kind": "terminal",
          "x": 575,
          "z": 0.81,
          "description": "La radio passe mal. Je laisse une balise : personne ne retrouvera cette passe de nuit.",
          "chapter": 3
        },
        {
          "id": "barricade",
          "label": "Renforcer la fermeture du bureau",
          "kind": "seal",
          "x": 950,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 9
        },
        {
          "id": "last_power",
          "label": "Alimenter le verrou une dernière fois",
          "kind": "power",
          "x": 1325,
          "z": 0.81,
          "description": "Ne te retourne pas. Compte les virages comme quand vous jouiez.",
          "chapter": 11
        },
        {
          "id": "vent_open",
          "label": "Dégager l’accès au conduit",
          "kind": "seal",
          "x": 1700,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 11
        },
        {
          "id": "newt_escape",
          "label": "Mettre Newt à l’abri",
          "kind": "talk",
          "x": 575,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 11,
          "actorId": "newt"
        },
        {
          "id": "luisa",
          "label": "Dégager Luisa et la conduire au hangar",
          "kind": "escort",
          "x": 950,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 12,
          "escortTo": "hangar",
          "escortName": "Luisa",
          "grantFlag": "scienceClearance",
          "actorId": "luisa"
        },
        {
          "id": "a11",
          "label": "Un bureau transformé",
          "kind": "archive",
          "x": 2050.0,
          "z": 0.43,
          "description": "Des familles attendent près des cartes. Elles veulent savoir quel bâtiment tient encore. Ne pas donner une destination tant qu’une patrouille n’a pas confirmé le passage."
        },
        {
          "id": "hide-survey",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 429,
          "z": 0.82,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        }
      ],
      "spawns": [
        {
          "id": "survey-east",
          "x": 2445,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "survey-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "survey-cover1",
          "x": 950,
          "z": 0.56,
          "w": 160,
          "d": 0.13,
          "prop": "table"
        },
        {
          "id": "survey-cover2",
          "x": 1675,
          "z": 0.57,
          "w": 190,
          "d": 0.14,
          "prop": "crate"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "command",
        "variant": "survey_wall",
        "circuit": "habitat",
        "ceilingRatio": 0.16,
        "wallModules": 7,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "survey-phase-0",
          "kind": "paper-trail",
          "x": 575,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "survey-phase-1",
          "kind": "emergency-arrow",
          "x": 1225,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "survey-phase-2",
          "kind": "broken-light",
          "x": 1850,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "survey-phase-3",
          "kind": "scorch",
          "x": 2200,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-survey",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "stores",
      "name": "Magasin de fret",
      "building": "Logistique",
      "floor": 0,
      "kind": "depth",
      "width": 3100,
      "map": [
        4,
        5
      ],
      "theme": "stores",
      "landmark": "Palettes, rack de levage et allées dégagées",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        73.8,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "stores>survey",
          "to": "survey",
          "x": 170,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "survey>stores"
          }
        },
        {
          "id": "stores>power",
          "to": "power",
          "x": 2930,
          "z": 0.69,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2930,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "power>stores"
          }
        },
        {
          "id": "stores>mess",
          "to": "mess",
          "x": 868,
          "z": 0.28,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 868,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "mess>stores"
          }
        }
      ],
      "props": [
        {
          "id": "stores-set-0",
          "kind": "crate",
          "x": 458,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "stores-set-1",
          "kind": "shelf",
          "x": 1075,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "stores-set-2",
          "kind": "pallet",
          "x": 1332,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "stores-set-3",
          "kind": "gantry",
          "x": 1768,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "stores-set-4",
          "kind": "crate",
          "x": 2205,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "stores-set-5",
          "kind": "shelf",
          "x": 2642,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "stores-detail-0",
          "kind": "hand-truck",
          "x": 372,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "stores-detail-1",
          "kind": "tool-board",
          "x": 1141,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "stores-detail-2",
          "kind": "warning-board",
          "x": 1550,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "stores-detail-3",
          "kind": "fire-cabinet",
          "x": 2139,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "stores-detail-4",
          "kind": "cable-tray",
          "x": 2728,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "stores-cover1",
          "kind": "pallet",
          "x": 1160,
          "z": 0.48,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 280,
            "d": 0.14
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "stores-cover2",
          "kind": "crate",
          "x": 2110,
          "z": 0.52,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 180,
            "d": 0.13
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "stores-cover3",
          "kind": "pallet",
          "x": 2430,
          "z": 0.86,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 120,
            "d": 0.04
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "id": "shelter",
          "label": "Mettre le refuge provisoire sous tension",
          "kind": "power",
          "x": 713,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 8
        },
        {
          "id": "welding",
          "label": "Récupérer un poste à souder",
          "kind": "supply",
          "x": 1178,
          "z": 0.81,
          "description": "La porte n’a pas besoin de tenir toute la nuit. Seulement assez longtemps pour les enfants.",
          "chapter": 9
        },
        {
          "id": "a12",
          "label": "Refuge provisoire",
          "kind": "archive",
          "x": 2542.0,
          "z": 0.43,
          "description": "Le fret peut attendre. Dégager deux allées jusqu’à la porte et réserver les couvertures aux enfants. Les caisses contre le mur ne seront ouvertes qu’en présence d’un responsable."
        },
        {
          "id": "cache-stores",
          "label": "Réserve de terrain",
          "kind": "pickup",
          "x": 1643.0,
          "z": 0.86,
          "description": "Soins et dotation de terrain. Une seule collecte par parcours."
        },
        {
          "id": "hide-stores",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 2697,
          "z": 0.82,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        }
      ],
      "spawns": [
        {
          "id": "stores-east",
          "x": 3045,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "stores-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "stores-cover1",
          "x": 1160,
          "z": 0.48,
          "w": 280,
          "d": 0.14,
          "prop": "pallet"
        },
        {
          "id": "stores-cover2",
          "x": 2110,
          "z": 0.52,
          "w": 180,
          "d": 0.13,
          "prop": "crate"
        },
        {
          "id": "stores-cover3",
          "x": 2430,
          "z": 0.86,
          "w": 120,
          "d": 0.04,
          "prop": "pallet"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "warehouse",
        "variant": "loading_racks",
        "circuit": "industry",
        "ceilingRatio": 0.16,
        "wallModules": 9,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "stores-phase-0",
          "kind": "paper-trail",
          "x": 713,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "stores-phase-1",
          "kind": "emergency-arrow",
          "x": 1519,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "stores-phase-2",
          "kind": "broken-light",
          "x": 2294,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "stores-phase-3",
          "kind": "scorch",
          "x": 2728,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-stores",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "power",
      "name": "Distribution électrique",
      "building": "Maintenance",
      "floor": -1,
      "kind": "depth",
      "width": 2600,
      "map": [
        3,
        5
      ],
      "theme": "power",
      "landmark": "Deux banques de coupe-circuits et conduites",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        61.9,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "power>stores",
          "to": "stores",
          "x": 170,
          "z": 0.69,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": -1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "stores>power"
          }
        },
        {
          "id": "power>pump",
          "to": "pump",
          "x": 2430,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2430,
            "approachZ": 0.69,
            "originFloor": -1,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "pump>power"
          }
        },
        {
          "id": "power>coolant",
          "to": "coolant",
          "x": 728,
          "z": 0.28,
          "kind": "échelle",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "ladder",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 728,
            "approachZ": 0.28,
            "originFloor": -1,
            "destinationFloor": -2,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "coolant>power"
          }
        }
      ],
      "props": [
        {
          "id": "power-set-0",
          "kind": "transformer",
          "x": 417,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "power-set-1",
          "kind": "panel",
          "x": 950,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "power-set-2",
          "kind": "transformer",
          "x": 1123,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "power-set-3",
          "kind": "panel",
          "x": 1477,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "power-set-4",
          "kind": "cable",
          "x": 1830,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "power-set-5",
          "kind": "coil",
          "x": 2183,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "power-detail-0",
          "kind": "gauge",
          "x": 312,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "power-detail-1",
          "kind": "pipe-elbow",
          "x": 1240,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "power-detail-2",
          "kind": "pump-motor",
          "x": 1517,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "power-detail-3",
          "kind": "warning-board",
          "x": 1794,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "power-detail-4",
          "kind": "cable-tray",
          "x": 342,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "power-cover1",
          "kind": "transformer",
          "x": 1000,
          "z": 0.45,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 240,
            "d": 0.16
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "power-cover2",
          "kind": "coil",
          "x": 1680,
          "z": 0.51,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 210,
            "d": 0.13
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "id": "grid",
          "label": "Réarmer le départ habitat",
          "kind": "power",
          "x": 598,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 1
        },
        {
          "id": "emergency",
          "label": "Rétablir le circuit de secours",
          "kind": "power",
          "x": 988,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 9
        },
        {
          "id": "withdraw",
          "label": "Fermer derrière le groupe",
          "kind": "seal",
          "x": 1378,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 10
        },
        {
          "id": "a13",
          "label": "Deux circuits",
          "kind": "archive",
          "x": 2132.0,
          "z": 0.43,
          "description": "Les départs habitat et médical partagent encore un relais. En cas de surcharge, couper les appareils non essentiels avant de réarmer. Un deuxième claquement signifie qu’il faut laisser le coupe-circuit ouvert."
        },
        {
          "id": "hide-power",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 2262,
          "z": 0.82,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        },
        {
          "room": "power",
          "id": "job-drain-part",
          "label": "Récupérer la clé du collecteur",
          "x": 1950,
          "z": 0.28,
          "description": "Emporter clé de collecteur.",
          "duration": 0.9,
          "kind": "side-task",
          "job": "drain",
          "step": 1,
          "hardware": "tools"
        },
        {
          "id": "contact-hansard",
          "kind": "lore-contact",
          "actorId": "hansard",
          "room": "power",
          "x": 2060,
          "z": 0.8,
          "phaseMax": 1,
          "label": "Parler à Greg Hansard",
          "description": "Un circuit réarmé n’est pas une installation réparée. Gardez une voie sèche jusqu’au répartiteur.",
          "note": "Ingénieur en chef attesté ; dialogue, tenue et poste local interprétés. Référence : extrait de 2173 ; cette mise en scène en 2179 reste originale."
        }
      ],
      "spawns": [
        {
          "id": "power-east",
          "x": 2545,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "power-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "power-cover1",
          "x": 1000,
          "z": 0.45,
          "w": 240,
          "d": 0.16,
          "prop": "transformer"
        },
        {
          "id": "power-cover2",
          "x": 1680,
          "z": 0.51,
          "w": 210,
          "d": 0.13,
          "prop": "coil"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "industrial",
        "variant": "busbar_banks",
        "circuit": "industry",
        "ceilingRatio": 0.1,
        "wallModules": 8,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "power-phase-0",
          "kind": "paper-trail",
          "x": 598,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "power-phase-1",
          "kind": "emergency-arrow",
          "x": 1274,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "power-phase-2",
          "kind": "broken-light",
          "x": 1924,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "power-phase-3",
          "kind": "scorch",
          "x": 2288,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-power",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "pump",
      "name": "Station de pompage",
      "building": "Maintenance",
      "floor": -1,
      "kind": "depth",
      "width": 2400,
      "map": [
        2,
        5
      ],
      "theme": "pump",
      "landmark": "Collecteurs, vannes et caniveaux protégés",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        57.1,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "pump>power",
          "to": "power",
          "x": 170,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": -1,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "power>pump"
          }
        },
        {
          "id": "pump>service",
          "to": "service",
          "x": 2230,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2230,
            "approachZ": 0.69,
            "originFloor": -1,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "service>pump"
          }
        },
        {
          "id": "pump>approach",
          "to": "approach",
          "x": 672,
          "z": 0.28,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 672,
            "approachZ": 0.28,
            "originFloor": -1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "approach>pump"
          }
        },
        {
          "id": "pump>drain",
          "to": "drain",
          "x": 1200,
          "z": 0.28,
          "kind": "échelle",
          "childOnly": false,
          "requires": null,
          "shortcut": null,
          "lockReason": null,
          "architecture": {
            "type": "ladder",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1200,
            "approachZ": 0.28,
            "originFloor": -1,
            "destinationFloor": -2,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "drain>pump"
          }
        }
      ],
      "props": [
        {
          "id": "pump-set-0",
          "kind": "tank",
          "x": 432,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "pump-set-1",
          "kind": "pipe",
          "x": 816,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "pump-set-2",
          "kind": "valve",
          "x": 1380,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "pump-set-3",
          "kind": "tank",
          "x": 1584,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "pump-set-4",
          "kind": "valve",
          "x": 1968,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "pump-detail-0",
          "kind": "gauge",
          "x": 288,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "pump-detail-1",
          "kind": "pipe-elbow",
          "x": 961,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "pump-detail-2",
          "kind": "pump-motor",
          "x": 1417,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "pump-detail-3",
          "kind": "warning-board",
          "x": 1656,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "pump-detail-4",
          "kind": "cable-tray",
          "x": 366,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "pump-cover1",
          "kind": "tank",
          "x": 920,
          "z": 0.48,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 210,
            "d": 0.17
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "pump-cover2",
          "kind": "pump-motor",
          "x": 1620,
          "z": 0.52,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 175,
            "d": 0.14
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "id": "reroute",
          "label": "Détourner la pression du passage",
          "kind": "valve",
          "x": 552,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 7
        },
        {
          "id": "a14",
          "label": "Sous les logements",
          "kind": "archive",
          "x": 1967.9999999999998,
          "z": 0.43,
          "description": "La vanne de retour résiste à froid. Ne pas la forcer tant que le manomètre indique une différence de pression. On a besoin d’eau, pas d’une galerie noyée."
        },
        {
          "id": "cache-pump",
          "label": "Réserve de terrain",
          "kind": "pickup",
          "x": 1450,
          "z": 0.86,
          "description": "Soins et dotation de terrain. Une seule collecte par parcours."
        }
      ],
      "spawns": [
        {
          "id": "pump-east",
          "x": 2345,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "pump-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "pump-cover1",
          "x": 920,
          "z": 0.48,
          "w": 210,
          "d": 0.17,
          "prop": "tank"
        },
        {
          "id": "pump-cover2",
          "x": 1620,
          "z": 0.52,
          "w": 175,
          "d": 0.14,
          "prop": "pump-motor"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "industrial",
        "variant": "collector_wall",
        "circuit": "industry",
        "ceilingRatio": 0.1,
        "wallModules": 7,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "pump-phase-0",
          "kind": "paper-trail",
          "x": 552,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "pump-phase-1",
          "kind": "emergency-arrow",
          "x": 1176,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "pump-phase-2",
          "kind": "broken-light",
          "x": 1776,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "pump-phase-3",
          "kind": "scorch",
          "x": 2112,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-pump",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "service",
      "name": "Galerie technique",
      "building": "Maintenance",
      "floor": -1,
      "kind": "side",
      "width": 3000,
      "map": [
        2,
        4
      ],
      "theme": "service",
      "landmark": "Passage sous les bâtiments, conduites continues",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "amber",
      "dimensionsM": [
        71.4,
        2.8,
        3.4
      ],
      "portals": [
        {
          "id": "service>pump",
          "to": "pump",
          "x": 170,
          "z": 0.7,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": -1,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "pump>service"
          }
        },
        {
          "id": "service>science",
          "to": "science",
          "x": 2830,
          "z": 0.7,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2830,
            "approachZ": 0.7,
            "originFloor": -1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "science>service"
          }
        },
        {
          "id": "service>garage",
          "to": "garage",
          "x": 840,
          "z": 0.7,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 840,
            "approachZ": 0.7,
            "originFloor": -1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "garage>service"
          }
        }
      ],
      "props": [
        {
          "id": "service-set-0",
          "kind": "pipe",
          "x": 492,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "service-set-1",
          "kind": "fan",
          "x": 996,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "service-set-2",
          "kind": "pipe",
          "x": 1500,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "service-set-3",
          "kind": "cable",
          "x": 2004,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "service-set-4",
          "kind": "pipe",
          "x": 2508,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "service-detail-0",
          "kind": "gauge",
          "x": 360,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "service-detail-1",
          "kind": "pipe-elbow",
          "x": 1147,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "service-detail-2",
          "kind": "vent-cover",
          "x": 1500,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "service-detail-3",
          "kind": "cable-tray",
          "x": 2070,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "service-detail-4",
          "kind": "fire-cabinet",
          "x": 2640,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "trail",
          "label": "Suivre les traces dans la galerie",
          "kind": "scan",
          "x": 690,
          "z": 0.7,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 7
        },
        {
          "id": "hide-service",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 2610,
          "z": 0.7,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        }
      ],
      "spawns": [
        {
          "id": "service-east",
          "x": 2945,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "service-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "maintenance",
        "variant": "pipe_trench",
        "circuit": "industry",
        "ceilingRatio": 0.16,
        "wallModules": 9,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "service-phase-0",
          "kind": "paper-trail",
          "x": 690,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "service-phase-1",
          "kind": "emergency-arrow",
          "x": 1470,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "service-phase-2",
          "kind": "broken-light",
          "x": 2220,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "service-phase-3",
          "kind": "scorch",
          "x": 2640,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-service",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "road",
      "name": "Piste du plateau",
      "building": "Périmètre",
      "floor": 0,
      "kind": "exterior",
      "width": 3700,
      "map": [
        5,
        4
      ],
      "theme": "road",
      "landmark": "Piquets de balisage, roches et ravines non praticables",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        88.1,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "road>garage",
          "to": "garage",
          "x": 170,
          "z": 0.69,
          "kind": "sas",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "airlock",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "garage>road"
          }
        },
        {
          "id": "road>plateau",
          "to": "plateau",
          "x": 3530,
          "z": 0.69,
          "kind": "piste",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "track",
            "mount": "terrain",
            "support": "terrain",
            "apertureWidth": 112,
            "approachX": 3530,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "plateau>road"
          }
        },
        {
          "id": "road>processor6",
          "to": "processor6",
          "x": 1036,
          "z": 0.28,
          "kind": "piste",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "track",
            "mount": "terrain",
            "support": "terrain",
            "apertureWidth": 112,
            "approachX": 1036,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "processor6>road"
          }
        }
      ],
      "props": [
        {
          "id": "road-set-0",
          "kind": "beacon",
          "x": 562,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "orientation du trajet"
        },
        {
          "id": "road-set-1",
          "kind": "rock",
          "x": 1206,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "road-set-2",
          "kind": "rock",
          "x": 1850,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "road-set-3",
          "kind": "beacon",
          "x": 2494,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "orientation du trajet"
        },
        {
          "id": "road-set-4",
          "kind": "wreck",
          "x": 3138,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "road-cover1",
          "kind": "crate",
          "x": 1406,
          "z": 0.56,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 160,
            "d": 0.13
          }
        },
        {
          "id": "road-cover2",
          "kind": "rock",
          "x": 2479,
          "z": 0.57,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 190,
            "d": 0.14
          }
        },
        {
          "id": "road-detail-0",
          "kind": "survey-stake",
          "x": 444,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "road-detail-1",
          "kind": "floodlight",
          "x": 1364,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "road-detail-2",
          "kind": "cable-spool",
          "x": 1850,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "road-detail-3",
          "kind": "barrier",
          "x": 2553,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "road-detail-4",
          "kind": "rock-fragment",
          "x": 3256,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [],
      "spawns": [
        {
          "id": "road-east",
          "x": 3645,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "road-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "road-cover1",
          "x": 1406,
          "z": 0.56,
          "w": 160,
          "d": 0.13,
          "prop": "crate"
        },
        {
          "id": "road-cover2",
          "x": 2479,
          "z": 0.57,
          "w": 190,
          "d": 0.14,
          "prop": "rock"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "exterior",
        "variant": "rock_cutting",
        "circuit": "perimeter",
        "ceilingRatio": 0.16,
        "wallModules": 11,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "inherited-road",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "plateau",
      "name": "Plateau des relevés",
      "building": "Périmètre",
      "floor": 0,
      "kind": "exterior",
      "width": 2900,
      "map": [
        6,
        4
      ],
      "theme": "plateau",
      "landmark": "Jalons de prospection, dépôt de service et accès à pied vers l’épave",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        69.0,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "plateau>road",
          "to": "road",
          "x": 170,
          "z": 0.69,
          "kind": "piste",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "track",
            "mount": "terrain",
            "support": "terrain",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "road>plateau"
          }
        },
        {
          "id": "plateau>derelict",
          "to": "derelict",
          "x": 2730,
          "z": 0.69,
          "kind": "brèche",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "organic",
            "mount": "organic-shell",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2730,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "derelict>plateau"
          }
        }
      ],
      "props": [
        {
          "id": "plateau-set-0",
          "kind": "rock",
          "x": 482,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Affleurement rocheux hors trajectoire",
          "type": "rock"
        },
        {
          "id": "plateau-set-1",
          "kind": "rock",
          "x": 966,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "plateau-set-2",
          "kind": "beacon",
          "x": 1450,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "orientation du trajet"
        },
        {
          "id": "plateau-set-3",
          "kind": "rock",
          "x": 1934,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "plateau-set-4",
          "kind": "cable",
          "x": 2418,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "plateau-cover1",
          "kind": "crate",
          "x": 1102,
          "z": 0.56,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 160,
            "d": 0.13
          }
        },
        {
          "id": "plateau-cover2",
          "kind": "rock",
          "x": 1943,
          "z": 0.57,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 190,
            "d": 0.14
          }
        },
        {
          "id": "plateau-detail-0",
          "kind": "survey-stake",
          "x": 348,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "plateau-detail-1",
          "kind": "floodlight",
          "x": 899,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "plateau-detail-2",
          "kind": "cable-spool",
          "x": 1450,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "plateau-detail-3",
          "kind": "barrier",
          "x": 2001,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "plateau-detail-4",
          "kind": "rock-fragment",
          "x": 2552,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "beacon",
          "label": "Poser une balise sur le plateau",
          "kind": "beacon",
          "x": 667,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 3
        }
      ],
      "spawns": [
        {
          "id": "plateau-east",
          "x": 2845,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "plateau-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "plateau-cover1",
          "x": 1102,
          "z": 0.56,
          "w": 160,
          "d": 0.13,
          "prop": "crate"
        },
        {
          "id": "plateau-cover2",
          "x": 1943,
          "z": 0.57,
          "w": 190,
          "d": 0.14,
          "prop": "rock"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "exterior",
        "variant": "survey_ridge",
        "circuit": "perimeter",
        "ceilingRatio": 0.16,
        "wallModules": 9,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "inherited-plateau",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "derelict",
      "name": "Seuil de l’épave",
      "building": "Épave",
      "floor": 0,
      "kind": "derelict",
      "width": 2500,
      "map": [
        7,
        4
      ],
      "theme": "derelict",
      "landmark": "Arches biomécaniques et coque affaissée",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        59.5,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "derelict>plateau",
          "to": "plateau",
          "x": 170,
          "z": 0.69,
          "kind": "brèche",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "organic",
            "mount": "organic-shell",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "plateau>derelict"
          }
        },
        {
          "id": "derelict>derelict_gallery",
          "to": "derelict_gallery",
          "x": 2330,
          "z": 0.69,
          "kind": "brèche",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "organic",
            "mount": "organic-shell",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2330,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "derelict_gallery>derelict"
          }
        }
      ],
      "props": [
        {
          "id": "derelict-set-0",
          "kind": "rib",
          "x": 442,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "derelict-set-1",
          "kind": "rib",
          "x": 846,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "derelict-set-2",
          "kind": "rib",
          "x": 1250,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Seuil : pas de pilote fossile ni d’œuf déplacé hors de sa salle"
        },
        {
          "id": "derelict-set-3",
          "kind": "rib",
          "x": 1654,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "derelict-set-4",
          "kind": "rib",
          "x": 2058,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Seuil : pas de pilote fossile ni d’œuf déplacé hors de sa salle"
        },
        {
          "id": "derelict-cover1",
          "kind": "rib",
          "x": 950,
          "z": 0.56,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 160,
            "d": 0.13
          }
        },
        {
          "id": "derelict-cover2",
          "kind": "rock",
          "x": 1675,
          "z": 0.57,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 190,
            "d": 0.14
          }
        },
        {
          "id": "derelict-detail-0",
          "kind": "rib",
          "x": 734,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "derelict-detail-1",
          "kind": "rib",
          "x": 775,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "derelict-detail-2",
          "kind": "rock-fragment",
          "x": 1250,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "derelict-detail-3",
          "kind": "rib",
          "x": 1725,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Seuil : pas de pilote fossile ni d’œuf déplacé hors de sa salle"
        },
        {
          "id": "derelict-detail-4",
          "kind": "rib",
          "x": 2200,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Seuil : pas de pilote fossile ni d’œuf déplacé hors de sa salle"
        }
      ],
      "objects": [
        {
          "id": "threshold",
          "label": "Examiner le seuil de l’épave",
          "kind": "scan",
          "x": 575,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 3
        },
        {
          "id": "a16",
          "label": "Une coque étrangère",
          "kind": "archive",
          "x": 2050.0,
          "z": 0.43,
          "description": "Le métal n’a pas la couleur du métal. Les arches se poursuivent au-delà du faisceau et la radio ne tient plus. Balise posée près du seuil. Ne pas déplacer le tracteur sans prévenir."
        }
      ],
      "spawns": [
        {
          "id": "derelict-east",
          "x": 2445,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "derelict-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "derelict-cover1",
          "x": 950,
          "z": 0.56,
          "w": 160,
          "d": 0.13,
          "prop": "rib"
        },
        {
          "id": "derelict-cover2",
          "x": 1675,
          "z": 0.57,
          "w": 190,
          "d": 0.14,
          "prop": "rock"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "derelict",
        "variant": "organic_vault",
        "circuit": "perimeter",
        "ceilingRatio": 0.16,
        "wallModules": 7,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "inherited-derelict",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "processor6",
      "name": "Processeur six",
      "building": "Terraformage",
      "floor": 0,
      "kind": "depth",
      "width": 3000,
      "map": [
        5,
        5
      ],
      "theme": "processor",
      "landmark": "Passerelle industrielle et conduites sous pression",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        71.4,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "processor6>road",
          "to": "road",
          "x": 170,
          "z": 0.69,
          "kind": "piste",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "track",
            "mount": "terrain",
            "support": "terrain",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "road>processor6"
          }
        },
        {
          "id": "processor6>workshop",
          "to": "workshop",
          "x": 1870,
          "z": 0.28,
          "kind": "coursive",
          "childOnly": false,
          "requires": "service-workshop",
          "shortcut": "workshop",
          "lockReason": "Déverrouillage à effectuer dans Atelier de manutention",
          "architecture": {
            "type": "corridor",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1870,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "workshop>processor6"
          }
        }
      ],
      "props": [
        {
          "id": "processor6-set-0",
          "kind": "turbine",
          "x": 492,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "processor6-set-1",
          "kind": "valve",
          "x": 996,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "processor6-set-2",
          "kind": "turbine",
          "x": 1500,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "processor6-set-3",
          "kind": "gantry",
          "x": 2184,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "processor6-set-4",
          "kind": "pipe",
          "x": 2508,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "processor6-detail-0",
          "kind": "gauge",
          "x": 360,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "processor6-detail-1",
          "kind": "pipe-elbow",
          "x": 930,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "processor6-detail-2",
          "kind": "pump-motor",
          "x": 1717,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "processor6-detail-3",
          "kind": "warning-board",
          "x": 2070,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "processor6-detail-4",
          "kind": "cable-tray",
          "x": 2640,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "processor6-cover1",
          "kind": "turbine",
          "x": 1090,
          "z": 0.47,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 260,
            "d": 0.16
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "processor6-cover2",
          "kind": "pipe",
          "x": 2080,
          "z": 0.49,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 210,
            "d": 0.14
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "id": "pressure",
          "label": "Isoler la conduite endommagée",
          "kind": "valve",
          "x": 690,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 2
        },
        {
          "id": "incident",
          "label": "Récupérer le rapport d’intervention",
          "kind": "terminal",
          "x": 1140,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 2
        },
        {
          "id": "a15",
          "label": "Intervention interrompue",
          "kind": "archive",
          "x": 2460.0,
          "z": 0.43,
          "description": "Balisage incomplet sur la piste. Rester du même côté des piquets au retour. La tempête efface les traces de roues en quelques minutes."
        },
        {
          "id": "cache-processor6",
          "label": "Réserve de terrain",
          "kind": "pickup",
          "x": 1590.0,
          "z": 0.86,
          "description": "Soins et dotation de terrain. Une seule collecte par parcours."
        }
      ],
      "spawns": [
        {
          "id": "processor6-east",
          "x": 2945,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "processor6-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "processor6-cover1",
          "x": 1090,
          "z": 0.47,
          "w": 260,
          "d": 0.16,
          "prop": "turbine"
        },
        {
          "id": "processor6-cover2",
          "x": 2080,
          "z": 0.49,
          "w": 210,
          "d": 0.14,
          "prop": "pipe"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "industrial",
        "variant": "heat_exchangers",
        "circuit": "industry",
        "ceilingRatio": 0.1,
        "wallModules": 9,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "processor6-phase-0",
          "kind": "paper-trail",
          "x": 690,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "processor6-phase-1",
          "kind": "emergency-arrow",
          "x": 1470,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "processor6-phase-2",
          "kind": "broken-light",
          "x": 2220,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "processor6-phase-3",
          "kind": "scorch",
          "x": 2640,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-processor6",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "approach",
      "name": "Accès au processeur un",
      "building": "Terraformage",
      "floor": 0,
      "kind": "exterior",
      "width": 3200,
      "map": [
        1,
        5
      ],
      "theme": "approach",
      "landmark": "Pylônes, sas de maintenance et énormes échangeurs",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        76.2,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "approach>pump",
          "to": "pump",
          "x": 170,
          "z": 0.69,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "pump>approach"
          }
        },
        {
          "id": "approach>lift",
          "to": "lift",
          "x": 3030,
          "z": 0.69,
          "kind": "monte-charge",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "lift",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 3030,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "lift>approach"
          }
        }
      ],
      "props": [
        {
          "id": "approach-set-0",
          "kind": "tower",
          "x": 512,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "approach-set-1",
          "kind": "beacon",
          "x": 1056,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "orientation du trajet"
        },
        {
          "id": "approach-set-2",
          "kind": "pipe",
          "x": 1600,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "approach-set-3",
          "kind": "tower",
          "x": 2144,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "approach-set-4",
          "kind": "beacon",
          "x": 2688,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "orientation du trajet"
        },
        {
          "id": "approach-cover1",
          "kind": "crate",
          "x": 1216,
          "z": 0.56,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 160,
            "d": 0.13
          }
        },
        {
          "id": "approach-cover2",
          "kind": "rock",
          "x": 2144,
          "z": 0.57,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 190,
            "d": 0.14
          }
        },
        {
          "id": "approach-detail-0",
          "kind": "survey-stake",
          "x": 384,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "approach-detail-1",
          "kind": "floodlight",
          "x": 992,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "approach-detail-2",
          "kind": "cable-spool",
          "x": 1600,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "approach-detail-3",
          "kind": "barrier",
          "x": 2208,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "approach-detail-4",
          "kind": "rock-fragment",
          "x": 2816,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [],
      "spawns": [
        {
          "id": "approach-east",
          "x": 3145,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "approach-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "approach-cover1",
          "x": 1216,
          "z": 0.56,
          "w": 160,
          "d": 0.13,
          "prop": "crate"
        },
        {
          "id": "approach-cover2",
          "x": 2144,
          "z": 0.57,
          "w": 190,
          "d": 0.14,
          "prop": "rock"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "exterior",
        "variant": "processor_columns",
        "circuit": "industry",
        "ceilingRatio": 0.16,
        "wallModules": 9,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "inherited-approach",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "lift",
      "name": "Monte-charge du processeur",
      "building": "Terraformage",
      "floor": -1,
      "kind": "side",
      "width": 1800,
      "map": [
        1,
        6
      ],
      "theme": "lift",
      "landmark": "Cabine de fret et paliers identifiés",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "amber",
      "dimensionsM": [
        42.9,
        2.8,
        3.4
      ],
      "portals": [
        {
          "id": "lift>approach",
          "to": "approach",
          "x": 170,
          "z": 0.7,
          "kind": "monte-charge",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "lift",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": -1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "approach>lift"
          }
        },
        {
          "id": "lift>hive",
          "to": "hive",
          "x": 1630,
          "z": 0.7,
          "kind": "monte-charge",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "lift",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1630,
            "approachZ": 0.7,
            "originFloor": -1,
            "destinationFloor": -2,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "hive>lift"
          }
        }
      ],
      "props": [
        {
          "id": "lift-set-0",
          "kind": "cable",
          "x": 405,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "lift-set-1",
          "kind": "panel",
          "x": 735,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "lift-set-2",
          "kind": "gantry",
          "x": 1065,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "lift-set-3",
          "kind": "lamp",
          "x": 1395,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "lift-detail-0",
          "kind": "chain-hoist",
          "x": 650,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "lift-detail-1",
          "kind": "warning-board",
          "x": 558,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "lift-detail-2",
          "kind": "cable-tray",
          "x": 900,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "lift-detail-3",
          "kind": "gauge",
          "x": 1242,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "lift-detail-4",
          "kind": "ceiling-light",
          "x": 655,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "descent",
          "label": "Commander le monte-charge",
          "kind": "terminal",
          "x": 414,
          "z": 0.7,
          "description": "N’approchez pas des parois. Repliez-vous par les balises ; ne tirez que pour ouvrir le passage.",
          "chapter": 10
        }
      ],
      "spawns": [
        {
          "id": "lift-east",
          "x": 1745,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "lift-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "shaft",
        "variant": "counterweights",
        "circuit": "industry",
        "ceilingRatio": 0.1,
        "wallModules": 5,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "lift-phase-0",
          "kind": "paper-trail",
          "x": 414,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "lift-phase-1",
          "kind": "emergency-arrow",
          "x": 882,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "lift-phase-2",
          "kind": "broken-light",
          "x": 1332,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "lift-phase-3",
          "kind": "scorch",
          "x": 1584,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-lift",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "hive",
      "name": "Soubassements envahis",
      "building": "Terraformage",
      "floor": -2,
      "kind": "hive",
      "width": 3000,
      "map": [
        2,
        6
      ],
      "theme": "hive",
      "landmark": "Résine sur les structures industrielles, balises PDT",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        71.4,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "hive>lift",
          "to": "lift",
          "x": 170,
          "z": 0.69,
          "kind": "monte-charge",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "lift",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": -2,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "lift>hive"
          }
        },
        {
          "id": "hive>coolant",
          "to": "coolant",
          "x": 2830,
          "z": 0.69,
          "kind": "passerelle",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "gangway",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2830,
            "approachZ": 0.69,
            "originFloor": -2,
            "destinationFloor": -2,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "coolant>hive"
          }
        }
      ],
      "props": [
        {
          "id": "hive-set-0",
          "kind": "resin",
          "x": 450,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "progression de la contamination"
        },
        {
          "id": "hive-set-1",
          "kind": "cocoon",
          "x": 870,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hive-set-2",
          "kind": "rib",
          "x": 1290,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hive-set-3",
          "kind": "resin",
          "x": 1710,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "progression de la contamination"
        },
        {
          "id": "hive-set-4",
          "kind": "egg",
          "x": 2130,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hive-set-5",
          "kind": "cocoon",
          "x": 2550,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hive-cover1",
          "kind": "resin",
          "x": 1140,
          "z": 0.56,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 160,
            "d": 0.13
          }
        },
        {
          "id": "hive-cover2",
          "kind": "cocoon",
          "x": 2010,
          "z": 0.57,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 190,
            "d": 0.14
          }
        },
        {
          "id": "hive-detail-0",
          "kind": "resin",
          "x": 360,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hive-detail-1",
          "kind": "resin",
          "x": 930,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hive-detail-2",
          "kind": "cocoon",
          "x": 1500,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hive-detail-3",
          "kind": "pipe-elbow",
          "x": 2070,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hive-detail-4",
          "kind": "cable-tray",
          "x": 2640,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "pdt",
          "label": "Retrouver la source des signaux",
          "kind": "scan",
          "x": 690,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 10
        },
        {
          "id": "a17",
          "label": "Signaux immobiles",
          "kind": "archive",
          "x": 2460.0,
          "z": 0.43,
          "description": "Plusieurs balises répondent sous le processeur. Aucun déplacement depuis la dernière lecture. Garder une distance avec les parois et ne pas rompre le contact radio."
        }
      ],
      "spawns": [
        {
          "id": "hive-east",
          "x": 2945,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "hive-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "hive-cover1",
          "x": 1140,
          "z": 0.56,
          "w": 160,
          "d": 0.13,
          "prop": "resin"
        },
        {
          "id": "hive-cover2",
          "x": 2010,
          "z": 0.57,
          "w": 190,
          "d": 0.14,
          "prop": "cocoon"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "hive",
        "variant": "resin_on_steel",
        "circuit": "industry",
        "ceilingRatio": 0.16,
        "wallModules": 9,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "hive-phase-0",
          "kind": "paper-trail",
          "x": 690,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "hive-phase-1",
          "kind": "emergency-arrow",
          "x": 1470,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "hive-phase-2",
          "kind": "broken-light",
          "x": 2220,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "hive-phase-3",
          "kind": "scorch",
          "x": 2640,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-hive",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "coolant",
      "name": "Galerie du refroidissement",
      "building": "Terraformage",
      "floor": -2,
      "kind": "hive",
      "width": 2700,
      "map": [
        3,
        6
      ],
      "theme": "coolant",
      "landmark": "Passage étroit entre les échangeurs, ruche en arrière-plan",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        64.3,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "coolant>hive",
          "to": "hive",
          "x": 170,
          "z": 0.69,
          "kind": "passerelle",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "gangway",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": -2,
            "destinationFloor": -2,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "hive>coolant"
          }
        },
        {
          "id": "coolant>power",
          "to": "power",
          "x": 2530,
          "z": 0.69,
          "kind": "échelle",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "ladder",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2530,
            "approachZ": 0.69,
            "originFloor": -2,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "power>coolant"
          }
        },
        {
          "id": "coolant>drain",
          "to": "drain",
          "x": 1500,
          "z": 0.28,
          "kind": "échelle",
          "childOnly": false,
          "requires": "service-drain",
          "shortcut": "drain",
          "lockReason": "Déverrouillage à effectuer dans Dérivation des eaux grises",
          "architecture": {
            "type": "ladder",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1500,
            "approachZ": 0.28,
            "originFloor": -2,
            "destinationFloor": -2,
            "localRiseM": 1.2,
            "source": "authored_layout",
            "reciprocal": "drain>coolant"
          }
        }
      ],
      "props": [
        {
          "id": "coolant-set-0",
          "kind": "tank",
          "x": 462,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "coolant-set-1",
          "kind": "resin",
          "x": 906,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "progression de la contamination"
        },
        {
          "id": "coolant-set-2",
          "kind": "cocoon",
          "x": 1350,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "coolant-set-3",
          "kind": "tank",
          "x": 1794,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "coolant-set-4",
          "kind": "rib",
          "x": 2238,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "coolant-cover1",
          "kind": "tank",
          "x": 1026,
          "z": 0.56,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 160,
            "d": 0.13
          }
        },
        {
          "id": "coolant-cover2",
          "kind": "resin",
          "x": 1809,
          "z": 0.57,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 190,
            "d": 0.14
          }
        },
        {
          "id": "coolant-detail-0",
          "kind": "resin",
          "x": 324,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "coolant-detail-1",
          "kind": "resin",
          "x": 837,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "coolant-detail-2",
          "kind": "cocoon",
          "x": 1350,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "coolant-detail-3",
          "kind": "pipe-elbow",
          "x": 1863,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "coolant-detail-4",
          "kind": "cable-tray",
          "x": 2376,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "fallback",
          "label": "Baliser la route de repli",
          "kind": "beacon",
          "x": 621,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 10
        },
        {
          "id": "a18",
          "label": "Aucun trophée",
          "kind": "archive",
          "x": 2214.0,
          "z": 0.43,
          "description": "Repli par le refroidissement. Les lampes portatives indiquent la sortie, pas les embranchements. Si une lampe s’éteint, revenir vers la précédente plutôt que suivre un bruit."
        }
      ],
      "spawns": [
        {
          "id": "coolant-east",
          "x": 2645,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "coolant-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "coolant-cover1",
          "x": 1026,
          "z": 0.56,
          "w": 160,
          "d": 0.13,
          "prop": "tank"
        },
        {
          "id": "coolant-cover2",
          "x": 1809,
          "z": 0.57,
          "w": 190,
          "d": 0.14,
          "prop": "resin"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "hive",
        "variant": "buried_exchangers",
        "circuit": "industry",
        "ceilingRatio": 0.16,
        "wallModules": 8,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "coolant-phase-0",
          "kind": "paper-trail",
          "x": 621,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "coolant-phase-1",
          "kind": "emergency-arrow",
          "x": 1323,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "coolant-phase-2",
          "kind": "broken-light",
          "x": 1998,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "coolant-phase-3",
          "kind": "scorch",
          "x": 2376,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-coolant",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "vent_hab",
      "name": "Conduits de l’habitat",
      "building": "Ventilation",
      "floor": 1,
      "kind": "vent",
      "width": 2600,
      "map": [
        4,
        1
      ],
      "theme": "vent",
      "landmark": "Jonctions basses, grilles et câbles de repérage",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "amber",
      "dimensionsM": [
        61.9,
        1.1,
        3.4
      ],
      "portals": [
        {
          "id": "vent_hab>jorden",
          "to": "jorden",
          "x": 170,
          "z": 0.7,
          "kind": "conduit",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "jorden>vent_hab"
          }
        },
        {
          "id": "vent_hab>vent_med",
          "to": "vent_med",
          "x": 2430,
          "z": 0.7,
          "kind": "conduit",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 2430,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "vent_med>vent_hab"
          }
        },
        {
          "id": "vent_hab>vent_survey",
          "to": "vent_survey",
          "x": 728,
          "z": 0.7,
          "kind": "conduit",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 728,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "vent_survey>vent_hab"
          }
        },
        {
          "id": "vent_hab>recreation",
          "to": "recreation",
          "x": 1248,
          "z": 0.7,
          "kind": "grille",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 1248,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "recreation>vent_hab"
          }
        }
      ],
      "props": [
        {
          "id": "vent_hab-set-0",
          "kind": "grille",
          "x": 452,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "vent_hab-set-1",
          "kind": "cable",
          "x": 876,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "vent_hab-set-2",
          "kind": "grille",
          "x": 1300,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "vent_hab-set-3",
          "kind": "fan",
          "x": 1724,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "vent_hab-set-4",
          "kind": "drawing",
          "x": 2148,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "trace de vie familiale"
        },
        {
          "id": "vent_hab-detail-0",
          "kind": "duct-junction",
          "x": 1614,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "vent_hab-detail-1",
          "kind": "vent-cover",
          "x": 986,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "vent_hab-detail-2",
          "kind": "cable-tray",
          "x": 1517,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "vent_hab-detail-3",
          "kind": "bolt-panel",
          "x": 1794,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "vent_hab-detail-4",
          "kind": "trace-mark",
          "x": 2288,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "marks",
          "label": "Retrouver les repères de Tim",
          "kind": "trace",
          "x": 598,
          "z": 0.7,
          "description": "Le tuyau qui vibre revient vers la cuisine. Celui qui siffle va à l’infirmerie.",
          "chapter": 6
        },
        {
          "id": "route",
          "label": "Vérifier le chemin de retour",
          "kind": "trace",
          "x": 988,
          "z": 0.7,
          "description": "Je suis là. Je suis encore là.",
          "chapter": 15
        },
        {
          "id": "hide-vent_hab",
          "kind": "hide",
          "label": "Se glisser dans le renfoncement",
          "x": 2262,
          "z": 0.7,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        },
        {
          "room": "vent_hab",
          "id": "job-nest-part",
          "label": "Retrouver le ruban de Tim",
          "x": 1670,
          "z": 0.7,
          "description": "Emporter ruban de repérage.",
          "duration": 0.9,
          "kind": "side-task",
          "job": "nest",
          "step": 1,
          "hardware": "tools"
        }
      ],
      "spawns": [
        {
          "id": "vent_hab-east",
          "x": 2545,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "vent_hab-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "vent",
        "variant": "habitat_branch",
        "circuit": "habitat",
        "ceilingRatio": 0.22,
        "wallModules": 8,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "inherited-vent_hab",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "vent_med",
      "name": "Conduits de l’infirmerie",
      "building": "Ventilation",
      "floor": 1,
      "kind": "vent",
      "width": 2400,
      "map": [
        1,
        1
      ],
      "theme": "vent",
      "landmark": "Grilles d’observation et courbe de service",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "cold",
      "dimensionsM": [
        57.1,
        1.1,
        3.4
      ],
      "portals": [
        {
          "id": "vent_med>vent_hab",
          "to": "vent_hab",
          "x": 170,
          "z": 0.7,
          "kind": "conduit",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "vent_hab>vent_med"
          }
        },
        {
          "id": "vent_med>isolation",
          "to": "isolation",
          "x": 2230,
          "z": 0.7,
          "kind": "grille",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 2230,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "isolation>vent_med"
          }
        },
        {
          "id": "vent_med>nest",
          "to": "nest",
          "x": 1070,
          "z": 0.7,
          "kind": "conduit",
          "childOnly": true,
          "requires": null,
          "shortcut": null,
          "lockReason": null,
          "architecture": {
            "type": "duct",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 1070,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "nest>vent_med"
          }
        }
      ],
      "props": [
        {
          "id": "vent_med-set-0",
          "kind": "grille",
          "x": 480,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "vent_med-set-1",
          "kind": "cable",
          "x": 960,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "vent_med-set-2",
          "kind": "grille",
          "x": 1440,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "vent_med-set-3",
          "kind": "pipe",
          "x": 1920,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "vent_med-detail-0",
          "kind": "duct-junction",
          "x": 722,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "vent_med-detail-1",
          "kind": "vent-cover",
          "x": 744,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "vent_med-detail-2",
          "kind": "cable-tray",
          "x": 1380,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "vent_med-detail-3",
          "kind": "bolt-panel",
          "x": 1656,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "vent_med-detail-4",
          "kind": "trace-mark",
          "x": 1932,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        }
      ],
      "objects": [
        {
          "id": "listen",
          "label": "Écouter derrière la grille",
          "kind": "listen",
          "x": 552,
          "z": 0.7,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 6
        }
      ],
      "spawns": [
        {
          "id": "vent_med-east",
          "x": 2345,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "vent_med-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "vent",
        "variant": "observation_grille",
        "circuit": "medical",
        "ceilingRatio": 0.22,
        "wallModules": 7,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "inherited-vent_med",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "vent_survey",
      "name": "Conduits des prospecteurs",
      "building": "Ventilation",
      "floor": 0,
      "kind": "vent",
      "width": 2350,
      "map": [
        5,
        3
      ],
      "theme": "vent",
      "landmark": "Grille de secours au-dessus de la dernière barricade",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "cold",
      "dimensionsM": [
        56.0,
        1.1,
        3.4
      ],
      "portals": [
        {
          "id": "vent_survey>vent_hab",
          "to": "vent_hab",
          "x": 170,
          "z": 0.7,
          "kind": "conduit",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "vent_hab>vent_survey"
          }
        },
        {
          "id": "vent_survey>survey",
          "to": "survey",
          "x": 2180,
          "z": 0.7,
          "kind": "grille",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 2180,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "survey>vent_survey"
          }
        },
        {
          "id": "vent_survey>refuge",
          "to": "refuge",
          "x": 658,
          "z": 0.7,
          "kind": "conduit",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 658,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "refuge>vent_survey"
          }
        }
      ],
      "props": [
        {
          "id": "vent_survey-set-0",
          "kind": "grille",
          "x": 474,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "vent_survey-set-1",
          "kind": "cable",
          "x": 941,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "vent_survey-set-2",
          "kind": "grille",
          "x": 1409,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "vent_survey-set-3",
          "kind": "resin",
          "x": 1876,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "progression de la contamination"
        },
        {
          "id": "vent_survey-detail-0",
          "kind": "duct-junction",
          "x": 933,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "vent_survey-detail-1",
          "kind": "vent-cover",
          "x": 908,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "vent_survey-detail-2",
          "kind": "cable-tray",
          "x": 1175,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "vent_survey-detail-3",
          "kind": "bolt-panel",
          "x": 1622,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "vent_survey-detail-4",
          "kind": "trace-mark",
          "x": 1888,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        }
      ],
      "objects": [
        {
          "id": "silence",
          "label": "Passer sans attirer la créature",
          "kind": "listen",
          "x": 540,
          "z": 0.7,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 14
        },
        {
          "id": "hide-vent_survey",
          "kind": "hide",
          "label": "Se glisser dans le renfoncement",
          "x": 2044,
          "z": 0.7,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        }
      ],
      "spawns": [
        {
          "id": "vent_survey-east",
          "x": 2295,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "vent_survey-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "vent",
        "variant": "survey_branch",
        "circuit": "habitat",
        "ceilingRatio": 0.22,
        "wallModules": 7,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "inherited-vent_survey",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "refuge",
      "name": "Cache des conduits",
      "building": "Ventilation",
      "floor": 0,
      "kind": "vent",
      "width": 1750,
      "map": [
        5,
        2
      ],
      "theme": "refuge",
      "landmark": "Petit renfoncement hors des axes de ventilation",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "amber",
      "dimensionsM": [
        41.7,
        1.1,
        3.4
      ],
      "portals": [
        {
          "id": "refuge>vent_survey",
          "to": "vent_survey",
          "x": 170,
          "z": 0.7,
          "kind": "conduit",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "vent_survey>refuge"
          }
        },
        {
          "id": "refuge>wash",
          "to": "wash",
          "x": 1580,
          "z": 0.7,
          "kind": "grille",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 1580,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "wash>refuge"
          }
        },
        {
          "id": "refuge>nest",
          "to": "nest",
          "x": 1180,
          "z": 0.7,
          "kind": "conduit",
          "childOnly": true,
          "requires": "service-nest",
          "shortcut": "nest",
          "lockReason": "Déverrouillage à effectuer dans Renfoncement des câbles",
          "architecture": {
            "type": "duct",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 1180,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "nest>refuge"
          }
        }
      ],
      "props": [
        {
          "id": "refuge-set-0",
          "kind": "toy",
          "x": 399,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "refuge-set-1",
          "kind": "blanket",
          "x": 716,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "refuge-set-2",
          "kind": "ration",
          "x": 1034,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "refuge-set-3",
          "kind": "drawing",
          "x": 1351,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "trace de vie familiale"
        },
        {
          "id": "refuge-detail-0",
          "kind": "mug",
          "x": 861,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "refuge-detail-1",
          "kind": "photo",
          "x": 542,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "refuge-detail-2",
          "kind": "trace-mark",
          "x": 875,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "refuge-detail-3",
          "kind": "bolt-panel",
          "x": 1388,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "refuge-detail-4",
          "kind": "vent-cover",
          "x": 1360,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        }
      ],
      "objects": [
        {
          "id": "cache",
          "label": "Préparer une petite cache",
          "kind": "stash",
          "x": 402,
          "z": 0.7,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 6
        },
        {
          "id": "hide",
          "label": "Regagner la cache",
          "kind": "stash",
          "x": 665,
          "z": 0.7,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 15
        },
        {
          "id": "a21",
          "label": "La petite cache",
          "kind": "archive",
          "x": 1435.0,
          "z": 0.7,
          "description": "La couverture reste au fond. On peut voir le couloir sans coller les yeux à la grille. Quand les pas s’arrêtent, attendre encore. Toujours attendre encore."
        },
        {
          "id": "hide-refuge",
          "kind": "hide",
          "label": "Se glisser dans le renfoncement",
          "x": 1040,
          "z": 0.7,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        }
      ],
      "spawns": [
        {
          "id": "refuge-east",
          "x": 1695,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "refuge-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "refuge",
        "variant": "service_recess",
        "circuit": "habitat",
        "ceilingRatio": 0.22,
        "wallModules": 5,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "inherited-refuge",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "hangar",
      "name": "Hangar scientifique",
      "building": "Recherche",
      "floor": 0,
      "kind": "depth",
      "width": 3300,
      "map": [
        0,
        5
      ],
      "theme": "hangar",
      "landmark": "Navette de service, passerelle et réserves de carburant",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        78.6,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "hangar>science",
          "to": "science",
          "x": 170,
          "z": 0.69,
          "kind": "sas",
          "childOnly": false,
          "requires": "scienceClearance",
          "architecture": {
            "type": "airlock",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "science>hangar"
          }
        },
        {
          "id": "hangar>shuttle",
          "to": "shuttle",
          "x": 3130,
          "z": 0.69,
          "kind": "passerelle",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "gangway",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 3130,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "shuttle>hangar"
          }
        }
      ],
      "props": [
        {
          "id": "hangar-set-0",
          "kind": "shuttle",
          "x": 522,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hangar-set-1",
          "kind": "fuel",
          "x": 1086,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hangar-set-2",
          "kind": "gantry",
          "x": 1650,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hangar-set-3",
          "kind": "console",
          "x": 2214,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "poste de travail"
        },
        {
          "id": "hangar-set-4",
          "kind": "pallet",
          "x": 2778,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "hangar-detail-0",
          "kind": "chain-hoist",
          "x": 396,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hangar-detail-1",
          "kind": "warning-board",
          "x": 1023,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hangar-detail-2",
          "kind": "hose-reel",
          "x": 1867,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hangar-detail-3",
          "kind": "tool-board",
          "x": 2277,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hangar-detail-4",
          "kind": "ceiling-light",
          "x": 2904,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "hangar-cover1",
          "kind": "fuel",
          "x": 1270,
          "z": 0.46,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 245,
            "d": 0.16
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "hangar-cover2",
          "kind": "pallet",
          "x": 2130,
          "z": 0.54,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 260,
            "d": 0.14
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "id": "clearance",
          "label": "Déverrouiller la navette scientifique",
          "kind": "terminal",
          "x": 759,
          "z": 0.81,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 12
        },
        {
          "id": "boarding",
          "label": "Vérifier l’embarquement",
          "kind": "talk",
          "x": 1254,
          "z": 0.81,
          "description": "Aucune trajectoire imposée. Nous choisissons où nous allons.",
          "chapter": 13,
          "actorId": "mori"
        },
        {
          "id": "a19",
          "label": "Accès réservé",
          "kind": "archive",
          "x": 2706.0,
          "z": 0.43,
          "description": "Embarquement scientifique réservé. Réservoirs vérifiés. Le code d’accès ne doit pas être communiqué sur le réseau général. Un officier de service conteste la restriction ; demande en attente."
        },
        {
          "id": "cache-hangar",
          "label": "Réserve de terrain",
          "kind": "pickup",
          "x": 1749.0,
          "z": 0.86,
          "description": "Soins et dotation de terrain. Une seule collecte par parcours."
        }
      ],
      "spawns": [
        {
          "id": "hangar-east",
          "x": 3245,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "hangar-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "hangar-cover1",
          "x": 1270,
          "z": 0.46,
          "w": 245,
          "d": 0.16,
          "prop": "fuel"
        },
        {
          "id": "hangar-cover2",
          "x": 2130,
          "z": 0.54,
          "w": 260,
          "d": 0.14,
          "prop": "pallet"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "hangar",
        "variant": "shuttle_bay",
        "circuit": "research",
        "ceilingRatio": 0.1,
        "wallModules": 10,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "hangar-phase-0",
          "kind": "paper-trail",
          "x": 759,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "hangar-phase-1",
          "kind": "emergency-arrow",
          "x": 1617,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "hangar-phase-2",
          "kind": "broken-light",
          "x": 2442,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "hangar-phase-3",
          "kind": "scorch",
          "x": 2904,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "authored-hangar",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "shuttle",
      "name": "Navette de la Compagnie",
      "building": "Recherche",
      "floor": 0,
      "kind": "side",
      "width": 2150,
      "map": [
        0,
        6
      ],
      "theme": "shuttle",
      "landmark": "Sas arrière, sièges et commandes de navigation",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "cold",
      "dimensionsM": [
        51.2,
        2.8,
        3.4
      ],
      "portals": [
        {
          "id": "shuttle>hangar",
          "to": "hangar",
          "x": 170,
          "z": 0.7,
          "kind": "passerelle",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "gangway",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "hangar>shuttle"
          }
        }
      ],
      "props": [
        {
          "id": "shuttle-set-0",
          "kind": "seat",
          "x": 407,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "shuttle-set-1",
          "kind": "seat",
          "x": 741,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "shuttle-set-2",
          "kind": "console",
          "x": 1075,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "poste de travail"
        },
        {
          "id": "shuttle-set-3",
          "kind": "screen",
          "x": 1409,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "shuttle-set-4",
          "kind": "hatch",
          "x": 1743,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "shuttle-detail-0",
          "kind": "hanging-coat",
          "x": 692,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "shuttle-detail-1",
          "kind": "oxygen",
          "x": 666,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "shuttle-detail-2",
          "kind": "warning-board",
          "x": 1075,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "shuttle-detail-3",
          "kind": "vent-cover",
          "x": 1484,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "shuttle-detail-4",
          "kind": "ceiling-light",
          "x": 1892,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "autopilot",
          "label": "Désengager la trajectoire automatique",
          "kind": "terminal",
          "x": 494,
          "z": 0.7,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 13
        },
        {
          "id": "departure",
          "label": "Décoller",
          "kind": "launch",
          "x": 817,
          "z": 0.7,
          "description": "Gardez la voie de retour ouverte.",
          "chapter": 13
        },
        {
          "id": "a20",
          "label": "Quatre sièges occupés",
          "kind": "archive",
          "x": 1763.0,
          "z": 0.7,
          "description": "Brackett. Paris. Mori. Luisa. Quatre présences à bord. Le sas est fermé. La liste n’est pas celle que nous espérions remplir."
        }
      ],
      "spawns": [
        {
          "id": "shuttle-east",
          "x": 2095,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "shuttle-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "shuttle",
        "variant": "pressure_shell",
        "circuit": "research",
        "ceilingRatio": 0.16,
        "wallModules": 6,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "shuttle-phase-0",
          "kind": "paper-trail",
          "x": 494,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "shuttle-phase-1",
          "kind": "emergency-arrow",
          "x": 1054,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "shuttle-phase-2",
          "kind": "broken-light",
          "x": 1591,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "shuttle-phase-3",
          "kind": "scorch",
          "x": 1892,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-shuttle",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "wash",
      "name": "Buanderie",
      "building": "Habitat",
      "floor": 0,
      "kind": "depth",
      "width": 1850,
      "map": [
        5,
        1
      ],
      "theme": "wash",
      "landmark": "Machines, linge abandonné et évier de service",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        44.0,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "wash>refuge",
          "to": "refuge",
          "x": 170,
          "z": 0.69,
          "kind": "grille",
          "childOnly": true,
          "requires": null,
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "refuge>wash"
          }
        },
        {
          "id": "wash>mess",
          "to": "mess",
          "x": 1680,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1680,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "mess>wash"
          }
        },
        {
          "id": "wash>hab",
          "to": "hab",
          "x": 518,
          "z": 0.28,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "stairs",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 518,
            "approachZ": 0.28,
            "originFloor": 0,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "hab>wash"
          }
        },
        {
          "id": "wash>greenhouse",
          "to": "greenhouse",
          "x": 1030,
          "z": 0.81,
          "kind": "coursive",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "corridor",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1030,
            "approachZ": 0.81,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "greenhouse>wash"
          }
        }
      ],
      "props": [
        {
          "id": "wash-set-0",
          "kind": "washer",
          "x": 377,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "wash-set-1",
          "kind": "washer",
          "x": 831,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "wash-set-2",
          "kind": "linen",
          "x": 925,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "wash-set-3",
          "kind": "sink",
          "x": 1199,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "wash-set-4",
          "kind": "washer",
          "x": 1473,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "wash-cover1",
          "kind": "washer",
          "x": 703,
          "z": 0.56,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 160,
            "d": 0.13
          }
        },
        {
          "id": "wash-cover2",
          "kind": "linen",
          "x": 1240,
          "z": 0.57,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "obstacle contournable et cachette basse",
          "footprint": {
            "w": 190,
            "d": 0.14
          }
        },
        {
          "id": "wash-detail-0",
          "kind": "hanging-coat",
          "x": 873,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "wash-detail-1",
          "kind": "hose-reel",
          "x": 791,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "wash-detail-2",
          "kind": "vent-cover",
          "x": 925,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "wash-detail-3",
          "kind": "wall-clock",
          "x": 1276,
          "z": 0.38,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "wash-detail-4",
          "kind": "fire-cabinet",
          "x": 866,
          "z": 0.38,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "water",
          "label": "Récupérer de l’eau",
          "kind": "supply",
          "x": 426,
          "z": 0.81,
          "description": "Pas la grande porte. Jamais la grande porte quand on entend les tuyaux.",
          "chapter": 14
        },
        {
          "id": "a22",
          "label": "L’eau du lendemain",
          "kind": "archive",
          "x": 1517.0,
          "z": 0.43,
          "description": "L’eau coule moins fort à cet évier. Ne pas ouvrir le robinet entièrement. Une bouteille pleine tient dans le passage si on la pousse devant soi."
        },
        {
          "id": "hide-wash",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 771,
          "z": 0.82,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        }
      ],
      "spawns": [
        {
          "id": "wash-east",
          "x": 1795,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "wash-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [
        {
          "id": "wash-cover1",
          "x": 703,
          "z": 0.56,
          "w": 160,
          "d": 0.13,
          "prop": "washer"
        },
        {
          "id": "wash-cover2",
          "x": 1240,
          "z": 0.57,
          "w": 190,
          "d": 0.14,
          "prop": "linen"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "utility",
        "variant": "laundry_racks",
        "circuit": "habitat",
        "ceilingRatio": 0.16,
        "wallModules": 5,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "wash-phase-0",
          "kind": "paper-trail",
          "x": 426,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "wash-phase-1",
          "kind": "emergency-arrow",
          "x": 906,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "wash-phase-2",
          "kind": "broken-light",
          "x": 1369,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "wash-phase-3",
          "kind": "scorch",
          "x": 1628,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-wash",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "relay",
      "name": "Relais de communications",
      "building": "Administration",
      "floor": 1,
      "kind": "side",
      "width": 1950,
      "map": [
        0,
        1
      ],
      "theme": "relay",
      "landmark": "Baie relais et émetteurs directionnels",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "cold",
      "dimensionsM": [
        46.4,
        2.8,
        3.4
      ],
      "portals": [
        {
          "id": "relay>records",
          "to": "records",
          "x": 170,
          "z": 0.7,
          "kind": "coursive",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "corridor",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "records>relay"
          }
        },
        {
          "id": "relay>ops",
          "to": "ops",
          "x": 1780,
          "z": 0.7,
          "kind": "coursive",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "corridor",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1780,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "ops>relay"
          }
        },
        {
          "id": "relay>aerial",
          "to": "aerial",
          "x": 480,
          "z": 0.7,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "shortcut": null,
          "lockReason": null,
          "architecture": {
            "type": "stairs",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 480,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 2,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "aerial>relay"
          }
        }
      ],
      "props": [
        {
          "id": "relay-set-0",
          "kind": "rack",
          "x": 424,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "relay-set-1",
          "kind": "antenna",
          "x": 791,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "relay-set-2",
          "kind": "console",
          "x": 1159,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "poste de travail"
        },
        {
          "id": "relay-set-3",
          "kind": "rack",
          "x": 1526,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "relay-detail-0",
          "kind": "server",
          "x": 631,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "relay-detail-1",
          "kind": "tape-reel",
          "x": 784,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "relay-detail-2",
          "kind": "cable-tray",
          "x": 975,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "relay-detail-3",
          "kind": "vent-cover",
          "x": 1346,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "relay-detail-4",
          "kind": "wall-clock",
          "x": 1536,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        }
      ],
      "objects": [
        {
          "id": "a23",
          "label": "Ligne sans réponse",
          "kind": "archive",
          "x": 1599.0,
          "z": 0.7,
          "description": "Relais alimenté, aucune réponse. Les contrôles locaux sont bons. Répéter l’appel à intervalle court et conserver chaque tentative dans la mémoire de secours."
        }
      ],
      "spawns": [
        {
          "id": "relay-east",
          "x": 1895,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "relay-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "archive",
        "variant": "relay_backbone",
        "circuit": "research",
        "ceilingRatio": 0.16,
        "wallModules": 6,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "relay-phase-0",
          "kind": "paper-trail",
          "x": 448,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "relay-phase-1",
          "kind": "emergency-arrow",
          "x": 956,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "relay-phase-2",
          "kind": "broken-light",
          "x": 1443,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "relay-phase-3",
          "kind": "scorch",
          "x": 1716,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-relay",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "clinic_store",
      "name": "Réserve médicale",
      "building": "Médical",
      "floor": 0,
      "kind": "side",
      "width": 1700,
      "map": [
        2,
        0
      ],
      "theme": "clinic_store",
      "landmark": "Tiroirs de soins et stockage réfrigéré",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "cold",
      "dimensionsM": [
        40.5,
        2.8,
        3.4
      ],
      "portals": [
        {
          "id": "clinic_store>med",
          "to": "med",
          "x": 170,
          "z": 0.7,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "med>clinic_store"
          }
        },
        {
          "id": "clinic_store>biomed",
          "to": "biomed",
          "x": 1160,
          "z": 0.7,
          "kind": "porte",
          "childOnly": false,
          "requires": "service-biomed",
          "shortcut": "biomed",
          "lockReason": "Déverrouillage à effectuer dans Atelier biomédical",
          "architecture": {
            "type": "door",
            "mount": "rear-bay",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1160,
            "approachZ": 0.7,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "biomed>clinic_store"
          }
        }
      ],
      "props": [
        {
          "id": "clinic_store-set-0",
          "kind": "medicine",
          "x": 392,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "clinic_store-set-1",
          "kind": "shelf",
          "x": 698,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "clinic_store-set-2",
          "kind": "fridge",
          "x": 1002,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "clinic_store-set-3",
          "kind": "medicine",
          "x": 1308,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "fonction propre au lieu"
        },
        {
          "id": "clinic_store-detail-0",
          "kind": "privacy-screen",
          "x": 638,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "clinic_store-detail-1",
          "kind": "oxygen",
          "x": 527,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "clinic_store-detail-2",
          "kind": "medical-cross",
          "x": 850,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        },
        {
          "id": "clinic_store-detail-3",
          "kind": "wall-clock",
          "x": 1353,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        },
        {
          "id": "clinic_store-detail-4",
          "kind": "gurney",
          "x": 1496,
          "z": 0.7,
          "layer": "ACTORS",
          "collidable": false,
          "mount": "floor",
          "purpose": "Usage quotidien, identité du lieu et orientation"
        }
      ],
      "objects": [
        {
          "id": "medstock",
          "label": "Prendre les soins d’urgence",
          "kind": "supply",
          "x": 391,
          "z": 0.7,
          "description": "Restez derrière moi. Nous allons jusqu’à la lumière suivante, puis à la suivante.",
          "chapter": 8
        },
        {
          "id": "a24",
          "label": "Dernière réserve",
          "kind": "archive",
          "x": 1394.0,
          "z": 0.7,
          "description": "Dernier relevé des réserves. Les trousses emportées ne seront pas remplacées avant réapprovisionnement. Signaler un tiroir vide au lieu de le refermer comme si de rien n’était."
        },
        {
          "id": "cache-clinic_store",
          "label": "Réserve de terrain",
          "kind": "pickup",
          "x": 901.0,
          "z": 0.7,
          "description": "Soins et dotation de terrain. Une seule collecte par parcours."
        },
        {
          "id": "hide-clinic_store",
          "kind": "hide",
          "label": "Se cacher dans le placard de service",
          "x": 533,
          "z": 0.7,
          "description": "Rester silencieux. Une créature qui vous a vu entrer peut vous débusquer."
        },
        {
          "room": "clinic_store",
          "id": "job-biomed-part",
          "label": "Prendre le contacteur de réserve",
          "x": 720,
          "z": 0.7,
          "description": "Emporter contacteur biomédical.",
          "duration": 0.9,
          "kind": "side-task",
          "job": "biomed",
          "step": 1,
          "hardware": "tools"
        }
      ],
      "spawns": [
        {
          "id": "clinic_store-east",
          "x": 1645,
          "z": 0.72,
          "portal": "maintenance-east"
        },
        {
          "id": "clinic_store-west",
          "x": 55,
          "z": 0.7,
          "portal": "maintenance-west"
        }
      ],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "medical",
        "variant": "cold_storage",
        "circuit": "medical",
        "ceilingRatio": 0.16,
        "wallModules": 5,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "clinic_store-phase-0",
          "kind": "paper-trail",
          "x": 391,
          "z": 0.77,
          "fromPhase": 1
        },
        {
          "id": "clinic_store-phase-1",
          "kind": "emergency-arrow",
          "x": 833,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "clinic_store-phase-2",
          "kind": "broken-light",
          "x": 1258,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "clinic_store-phase-3",
          "kind": "scorch",
          "x": 1496,
          "z": 0.77,
          "fromPhase": 3
        }
      ],
      "layoutProfile": "inherited-clinic_store",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "pantry",
      "name": "Office de la cuisine",
      "building": "Habitat",
      "floor": 0,
      "kind": "depth",
      "width": 2100,
      "map": [
        6,
        0
      ],
      "theme": "mess",
      "landmark": "Passe-plats, chambre froide et escalier réservé au personnel",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        50.0,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "pantry>mess",
          "to": "mess",
          "x": 170,
          "z": 0.81,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "shortcut": null,
          "lockReason": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.81,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "mess>pantry"
          }
        },
        {
          "id": "pantry>hab",
          "to": "hab",
          "x": 1930,
          "z": 0.81,
          "kind": "escalier",
          "childOnly": false,
          "requires": "service-pantry",
          "shortcut": "pantry",
          "lockReason": "Déverrouillage à effectuer dans Office de la cuisine",
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 1930,
            "approachZ": 0.81,
            "originFloor": 0,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "hab>pantry"
          }
        }
      ],
      "props": [
        {
          "id": "pantry-set-0",
          "kind": "fridge",
          "x": 1320,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Chambre froide derrière la table"
        },
        {
          "id": "pantry-set-1",
          "kind": "stove",
          "x": 850,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Cuisson sous la hotte"
        },
        {
          "id": "pantry-set-2",
          "kind": "sink",
          "x": 540,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Point de lavage près de l’entrée"
        },
        {
          "id": "pantry-set-3",
          "kind": "cupboard",
          "x": 1500,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Réserve sèche contre la paroi"
        },
        {
          "id": "pantry-set-4",
          "kind": "ration",
          "x": 1470,
          "z": 0.29,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Caisses de provisions près de la réserve"
        },
        {
          "id": "pantry-set-5",
          "kind": "kitchen-hood",
          "x": 850,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Hotte alignée sur le poste de cuisson"
        },
        {
          "id": "pantry-set-6",
          "kind": "mug",
          "x": 950,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Tasse au poste de pause"
        },
        {
          "id": "pantry-set-7",
          "kind": "wall-clock",
          "x": 380,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Horloge au point de prise de service"
        },
        {
          "id": "pantry-set-8",
          "kind": "hanging-coat",
          "x": 1790,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Manteau près de la sortie du personnel"
        },
        {
          "id": "pantry-set-9",
          "kind": "noticeboard",
          "x": 460,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Consignes près de la poignée absente"
        },
        {
          "id": "pantry-cover1",
          "kind": "table",
          "x": 730,
          "z": 0.44,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 220,
            "d": 0.13
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "pantry-cover2",
          "kind": "fridge",
          "x": 1220,
          "z": 0.53,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 160,
            "d": 0.16
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "room": "pantry",
          "id": "job-pantry-inspect",
          "label": "Examiner · La porte du personnel",
          "x": 470,
          "z": 0.81,
          "description": "Le passage du personnel a perdu sa poignée. Une pièce de rechange attend près de la cuisine.",
          "duration": 0.6,
          "kind": "side-task",
          "job": "pantry",
          "step": 0,
          "hardware": "panel"
        },
        {
          "room": "pantry",
          "id": "job-pantry-release",
          "label": "Ajuster la poignée et libérer l’escalier",
          "x": 1630,
          "z": 0.81,
          "description": "Accès direct vers la coursive résidentielle",
          "duration": 2.0,
          "kind": "side-task",
          "job": "pantry",
          "step": 2,
          "hardware": "panel"
        },
        {
          "id": "hide-pantry",
          "label": "Se cacher dans le casier de service",
          "kind": "hide",
          "x": 1218.0,
          "z": 0.81
        }
      ],
      "spawns": [],
      "cover": [
        {
          "id": "pantry-cover1",
          "x": 730,
          "z": 0.44,
          "w": 220,
          "d": 0.13,
          "prop": "table"
        },
        {
          "id": "pantry-cover2",
          "x": 1220,
          "z": 0.53,
          "w": 160,
          "d": 0.16,
          "prop": "fridge"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "canteen",
        "variant": "pantry-service-loop",
        "circuit": "habitat",
        "ceilingRatio": 0.16,
        "wallModules": 6,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "pantry-phase-paper",
          "kind": "paper-trail",
          "x": 1260.0,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "pantry-phase-light",
          "kind": "broken-light",
          "x": 840.0,
          "z": 0.4,
          "fromPhase": 3
        }
      ],
      "annex": true,
      "layoutProfile": "authored-pantry",
      "annexNote": {
        "promise": "Accès direct vers la coursive résidentielle",
        "teaching": "Le passage du personnel a perdu sa poignée. Une pièce de rechange attend près de la cuisine.",
        "returnReason": "Le déverrouillage est conservé entre les chapitres, pour les personnages compatibles.",
        "canon": "Architecture et tâche originales pour le jeu."
      },
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "biomed",
      "name": "Atelier biomédical",
      "building": "Médical",
      "floor": 0,
      "kind": "depth",
      "width": 2450,
      "map": [
        0,
        0
      ],
      "theme": "med",
      "landmark": "Banc de réparation, berceaux de moniteurs et porte de la réserve",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        58.3,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "biomed>med",
          "to": "med",
          "x": 170,
          "z": 0.81,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "shortcut": null,
          "lockReason": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.81,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "med>biomed"
          }
        },
        {
          "id": "biomed>clinic_store",
          "to": "clinic_store",
          "x": 2280,
          "z": 0.81,
          "kind": "porte",
          "childOnly": false,
          "requires": "service-biomed",
          "shortcut": "biomed",
          "lockReason": "Déverrouillage à effectuer dans Atelier biomédical",
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2280,
            "approachZ": 0.81,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "clinic_store>biomed"
          }
        }
      ],
      "props": [
        {
          "id": "biomed-set-0",
          "kind": "gurney",
          "x": 540,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Baie de réparation du brancard"
        },
        {
          "id": "biomed-set-1",
          "kind": "monitor",
          "x": 655,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Moniteur associé à la baie"
        },
        {
          "id": "biomed-set-2",
          "kind": "oxygen",
          "x": 465,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Bouteille à côté du brancard"
        },
        {
          "id": "biomed-set-3",
          "kind": "tool-board",
          "x": 1240,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Outils fixés au-dessus de l’établi"
        },
        {
          "id": "biomed-set-4",
          "kind": "glass-cabinet",
          "x": 1570,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Armoire de composants près du plan de travail"
        },
        {
          "id": "biomed-set-5",
          "kind": "medicine",
          "x": 1520,
          "z": 0.29,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Trousse rangée au pied du poste"
        },
        {
          "id": "biomed-set-6",
          "kind": "medical-cross",
          "x": 970,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Signalétique de la travée médicale"
        },
        {
          "id": "biomed-set-7",
          "kind": "privacy-screen",
          "x": 815,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Écran de séparation de la baie"
        },
        {
          "id": "biomed-set-8",
          "kind": "bed-lamp",
          "x": 615,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Lampe au poste du brancard"
        },
        {
          "id": "biomed-set-9",
          "kind": "sink",
          "x": 2090,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Lavage avant retour en réserve"
        },
        {
          "id": "biomed-cover1",
          "kind": "bed",
          "x": 720,
          "z": 0.46,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 205,
            "d": 0.13
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "biomed-cover2",
          "kind": "lab-bench",
          "x": 1450,
          "z": 0.5,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 190,
            "d": 0.14
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "biomed-cover3",
          "kind": "cart",
          "x": 1830,
          "z": 0.41,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 135,
            "d": 0.1
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "room": "biomed",
          "id": "job-biomed-inspect",
          "label": "Examiner · L’atelier de garde",
          "x": 470,
          "z": 0.81,
          "description": "Le verrou de la porte de réserve ne répond plus. Le contacteur se trouve dans le tiroir de maintenance médicale.",
          "duration": 0.6,
          "kind": "side-task",
          "job": "biomed",
          "step": 0,
          "hardware": "panel"
        },
        {
          "room": "biomed",
          "id": "job-biomed-release",
          "label": "Remplacer le contacteur et libérer la réserve",
          "x": 1980,
          "z": 0.81,
          "description": "Boucle directe vers la réserve médicale",
          "duration": 2.0,
          "kind": "side-task",
          "job": "biomed",
          "step": 2,
          "hardware": "panel"
        },
        {
          "id": "hide-biomed",
          "label": "Se cacher dans le casier de service",
          "kind": "hide",
          "x": 1421.0,
          "z": 0.81
        }
      ],
      "spawns": [],
      "cover": [
        {
          "id": "biomed-cover1",
          "x": 720,
          "z": 0.46,
          "w": 205,
          "d": 0.13,
          "prop": "bed"
        },
        {
          "id": "biomed-cover2",
          "x": 1450,
          "z": 0.5,
          "w": 190,
          "d": 0.14,
          "prop": "lab-bench"
        },
        {
          "id": "biomed-cover3",
          "x": 1830,
          "z": 0.41,
          "w": 135,
          "d": 0.1,
          "prop": "cart"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "medical",
        "variant": "biomed-service-loop",
        "circuit": "medical",
        "ceilingRatio": 0.16,
        "wallModules": 6,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "biomed-phase-paper",
          "kind": "paper-trail",
          "x": 1470.0,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "biomed-phase-light",
          "kind": "broken-light",
          "x": 980.0,
          "z": 0.4,
          "fromPhase": 3
        }
      ],
      "annex": true,
      "layoutProfile": "authored-biomed",
      "annexNote": {
        "promise": "Boucle directe vers la réserve médicale",
        "teaching": "Le verrou de la porte de réserve ne répond plus. Le contacteur se trouve dans le tiroir de maintenance médicale.",
        "returnReason": "Le déverrouillage est conservé entre les chapitres, pour les personnages compatibles.",
        "canon": "Architecture et tâche originales pour le jeu."
      },
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "aerial",
      "name": "Terrasse des antennes",
      "building": "Administration",
      "floor": 2,
      "kind": "exterior",
      "width": 2700,
      "map": [
        0,
        -1
      ],
      "theme": "pad",
      "landmark": "Mâts inclinés par le vent, boîtier de synchronisation et cage d’escalier",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        64.3,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "aerial>relay",
          "to": "relay",
          "x": 170,
          "z": 0.81,
          "kind": "escalier",
          "childOnly": false,
          "requires": null,
          "shortcut": null,
          "lockReason": null,
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.81,
            "originFloor": 2,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "relay>aerial"
          }
        },
        {
          "id": "aerial>ops",
          "to": "ops",
          "x": 2530,
          "z": 0.81,
          "kind": "escalier",
          "childOnly": false,
          "requires": "service-aerial",
          "shortcut": "aerial",
          "lockReason": "Déverrouillage à effectuer dans Terrasse des antennes",
          "architecture": {
            "type": "stairs",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2530,
            "approachZ": 0.81,
            "originFloor": 2,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "ops>aerial"
          }
        }
      ],
      "props": [
        {
          "id": "aerial-set-0",
          "kind": "radio-mast",
          "x": 460,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Premier mât fixé au parapet"
        },
        {
          "id": "aerial-set-1",
          "kind": "radio-mast",
          "x": 1810,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Mât principal voisin du boîtier"
        },
        {
          "id": "aerial-set-2",
          "kind": "antenna",
          "x": 2250,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Antenne secondaire près du palier"
        },
        {
          "id": "aerial-set-3",
          "kind": "cable-spool",
          "x": 1710,
          "z": 0.29,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Réserve de câble sous le mât principal"
        },
        {
          "id": "aerial-set-4",
          "kind": "floodlight",
          "x": 1150,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Éclairage de la zone de passage"
        },
        {
          "id": "aerial-set-5",
          "kind": "barrier",
          "x": 1450,
          "z": 0.26,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Garde-corps arrière de la terrasse"
        },
        {
          "id": "aerial-set-6",
          "kind": "radio",
          "x": 1970,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Poste de service au pied du mât"
        },
        {
          "id": "aerial-set-7",
          "kind": "warning-board",
          "x": 1400,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Avertissement au changement de travée"
        },
        {
          "id": "aerial-set-8",
          "kind": "cable-tray",
          "x": 2070,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Chemin de câble vers le boîtier"
        },
        {
          "id": "aerial-set-9",
          "kind": "beacon",
          "x": 2440,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Balise fixée au palier de sortie"
        },
        {
          "id": "aerial-cover1",
          "kind": "crate",
          "x": 830,
          "z": 0.47,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 240,
            "d": 0.16
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "aerial-cover2",
          "kind": "fuel",
          "x": 1670,
          "z": 0.52,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 180,
            "d": 0.13
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "room": "aerial",
          "id": "job-aerial-inspect",
          "label": "Examiner · Une fréquence dans le vent",
          "x": 470,
          "z": 0.81,
          "description": "La liaison interne de la terrasse est débranchée. Un coupleur compatible a été rangé avec les bandes du relais.",
          "duration": 0.6,
          "kind": "side-task",
          "job": "aerial",
          "step": 0,
          "hardware": "panel"
        },
        {
          "room": "aerial",
          "id": "job-aerial-release",
          "label": "Raccorder la liaison et libérer le palier",
          "x": 2230,
          "z": 0.81,
          "description": "Retour vers le contrôle colonial",
          "duration": 2.0,
          "kind": "side-task",
          "job": "aerial",
          "step": 2,
          "hardware": "panel"
        },
        {
          "id": "hide-aerial",
          "label": "Se cacher dans le casier de service",
          "kind": "hide",
          "x": 1566.0,
          "z": 0.81
        }
      ],
      "spawns": [],
      "cover": [
        {
          "id": "aerial-cover1",
          "x": 830,
          "z": 0.47,
          "w": 240,
          "d": 0.16,
          "prop": "crate"
        },
        {
          "id": "aerial-cover2",
          "x": 1670,
          "z": 0.52,
          "w": 180,
          "d": 0.13,
          "prop": "fuel"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "exterior",
        "variant": "aerial-service-loop",
        "circuit": "research",
        "ceilingRatio": 0.16,
        "wallModules": 7,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "aerial-phase-paper",
          "kind": "paper-trail",
          "x": 1620.0,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "aerial-phase-light",
          "kind": "broken-light",
          "x": 1080.0,
          "z": 0.4,
          "fromPhase": 3
        }
      ],
      "annex": true,
      "layoutProfile": "authored-aerial",
      "annexNote": {
        "promise": "Retour vers le contrôle colonial",
        "teaching": "La liaison interne de la terrasse est débranchée. Un coupleur compatible a été rangé avec les bandes du relais.",
        "returnReason": "Le déverrouillage est conservé entre les chapitres, pour les personnages compatibles.",
        "canon": "Architecture et tâche originales pour le jeu."
      },
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "workshop",
      "name": "Atelier de manutention",
      "building": "Logistique",
      "floor": 0,
      "kind": "depth",
      "width": 3000,
      "map": [
        6,
        6
      ],
      "theme": "garage",
      "landmark": "Chaîne de palan, établi moteur et galerie vers le processeur six",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        71.4,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "workshop>garage",
          "to": "garage",
          "x": 170,
          "z": 0.81,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "shortcut": null,
          "lockReason": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.81,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "garage>workshop"
          }
        },
        {
          "id": "workshop>processor6",
          "to": "processor6",
          "x": 2830,
          "z": 0.81,
          "kind": "coursive",
          "childOnly": false,
          "requires": "service-workshop",
          "shortcut": "workshop",
          "lockReason": "Déverrouillage à effectuer dans Atelier de manutention",
          "architecture": {
            "type": "corridor",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2830,
            "approachZ": 0.81,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "processor6>workshop"
          }
        }
      ],
      "props": [
        {
          "id": "workshop-set-0",
          "kind": "chain-hoist",
          "x": 2140,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Palan suspendu dans son portique"
        },
        {
          "id": "workshop-set-1",
          "kind": "tractor",
          "x": 610,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Véhicule immobilisé dans la baie d’entrée"
        },
        {
          "id": "workshop-set-2",
          "kind": "wheel",
          "x": 765,
          "z": 0.29,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Train de roue voisin du véhicule"
        },
        {
          "id": "workshop-set-3",
          "kind": "tool-board",
          "x": 1650,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Panneau d’outils au poste moteur"
        },
        {
          "id": "workshop-set-4",
          "kind": "pump-motor",
          "x": 1570,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Moteur au poste de réparation"
        },
        {
          "id": "workshop-set-5",
          "kind": "hand-truck",
          "x": 1320,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Diable dans le rangement latéral"
        },
        {
          "id": "workshop-set-6",
          "kind": "cable-spool",
          "x": 1860,
          "z": 0.29,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Touret à côté du poste de maintenance"
        },
        {
          "id": "workshop-set-7",
          "kind": "fuel",
          "x": 820,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Réserve fermée à côté du véhicule"
        },
        {
          "id": "workshop-set-8",
          "kind": "gantry",
          "x": 2140,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Portique portant le palan"
        },
        {
          "id": "workshop-set-9",
          "kind": "fire-cabinet",
          "x": 2660,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Incendie à proximité de la galerie de sortie"
        },
        {
          "id": "workshop-cover1",
          "kind": "wheel",
          "x": 890,
          "z": 0.45,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 290,
            "d": 0.17
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "workshop-cover2",
          "kind": "tools",
          "x": 1800,
          "z": 0.5,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 210,
            "d": 0.14
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "workshop-cover3",
          "kind": "crate",
          "x": 2370,
          "z": 0.52,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 150,
            "d": 0.12
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "room": "workshop",
          "id": "job-workshop-inspect",
          "label": "Examiner · Le palan immobilisé",
          "x": 470,
          "z": 0.81,
          "description": "Le rideau de service bloque la galerie. Une chaîne de rechange est suspendue dans le garage des prospecteurs.",
          "duration": 0.6,
          "kind": "side-task",
          "job": "workshop",
          "step": 0,
          "hardware": "panel"
        },
        {
          "room": "workshop",
          "id": "job-workshop-release",
          "label": "Remonter la chaîne et lever le rideau",
          "x": 2530,
          "z": 0.81,
          "description": "Galerie couverte vers le processeur six",
          "duration": 2.0,
          "kind": "side-task",
          "job": "workshop",
          "step": 2,
          "hardware": "panel"
        },
        {
          "id": "hide-workshop",
          "label": "Se cacher dans le casier de service",
          "kind": "hide",
          "x": 1739.9999999999998,
          "z": 0.81
        }
      ],
      "spawns": [],
      "cover": [
        {
          "id": "workshop-cover1",
          "x": 890,
          "z": 0.45,
          "w": 290,
          "d": 0.17,
          "prop": "wheel"
        },
        {
          "id": "workshop-cover2",
          "x": 1800,
          "z": 0.5,
          "w": 210,
          "d": 0.14,
          "prop": "tools"
        },
        {
          "id": "workshop-cover3",
          "x": 2370,
          "z": 0.52,
          "w": 150,
          "d": 0.12,
          "prop": "crate"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "hangar",
        "variant": "workshop-service-loop",
        "circuit": "industry",
        "ceilingRatio": 0.1,
        "wallModules": 8,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "workshop-phase-paper",
          "kind": "paper-trail",
          "x": 1800.0,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "workshop-phase-light",
          "kind": "broken-light",
          "x": 1200.0,
          "z": 0.4,
          "fromPhase": 3
        }
      ],
      "annex": true,
      "layoutProfile": "authored-workshop",
      "annexNote": {
        "promise": "Galerie couverte vers le processeur six",
        "teaching": "Le rideau de service bloque la galerie. Une chaîne de rechange est suspendue dans le garage des prospecteurs.",
        "returnReason": "Le déverrouillage est conservé entre les chapitres, pour les personnages compatibles.",
        "canon": "Architecture et tâche originales pour le jeu."
      },
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "drain",
      "name": "Dérivation des eaux grises",
      "building": "Maintenance",
      "floor": -2,
      "kind": "depth",
      "width": 2850,
      "map": [
        4,
        7
      ],
      "theme": "pump",
      "landmark": "Deux vannes de purge, cuves fermées et passerelle latérale sèche",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        67.9,
        9,
        3.4
      ],
      "portals": [
        {
          "id": "drain>pump",
          "to": "pump",
          "x": 170,
          "z": 0.81,
          "kind": "échelle",
          "childOnly": false,
          "requires": null,
          "shortcut": null,
          "lockReason": null,
          "architecture": {
            "type": "ladder",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.81,
            "originFloor": -2,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "pump>drain"
          }
        },
        {
          "id": "drain>coolant",
          "to": "coolant",
          "x": 2680,
          "z": 0.81,
          "kind": "échelle",
          "childOnly": false,
          "requires": "service-drain",
          "shortcut": "drain",
          "lockReason": "Déverrouillage à effectuer dans Dérivation des eaux grises",
          "architecture": {
            "type": "ladder",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2680,
            "approachZ": 0.81,
            "originFloor": -2,
            "destinationFloor": -2,
            "localRiseM": 1.2,
            "source": "authored_layout",
            "reciprocal": "coolant>drain"
          }
        }
      ],
      "props": [
        {
          "id": "drain-set-0",
          "kind": "tank",
          "x": 490,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Cuve fermée côté entrée"
        },
        {
          "id": "drain-set-1",
          "kind": "pipe",
          "x": 550,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Conduite raccordée à la cuve"
        },
        {
          "id": "drain-set-2",
          "kind": "gauge",
          "x": 690,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Manomètre du premier circuit"
        },
        {
          "id": "drain-set-3",
          "kind": "hose-reel",
          "x": 1100,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Flexible au poste de maintenance"
        },
        {
          "id": "drain-set-4",
          "kind": "pump-motor",
          "x": 1390,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Groupe moteur du retour"
        },
        {
          "id": "drain-set-5",
          "kind": "pipe-elbow",
          "x": 1500,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Coude au départ du moteur"
        },
        {
          "id": "drain-set-6",
          "kind": "valve",
          "x": 1770,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Volant de la dérivation"
        },
        {
          "id": "drain-set-7",
          "kind": "fire-cabinet",
          "x": 2450,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Poste incendie près de l’échelle"
        },
        {
          "id": "drain-set-8",
          "kind": "warning-board",
          "x": 2110,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Consigne avant le retour"
        },
        {
          "id": "drain-set-9",
          "kind": "floodlight",
          "x": 2570,
          "z": 0.27,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Éclairage de la zone de sortie"
        },
        {
          "id": "drain-cover1",
          "kind": "tank",
          "x": 820,
          "z": 0.46,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 280,
            "d": 0.16
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "drain-cover2",
          "kind": "pump-motor",
          "x": 1620,
          "z": 0.5,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 240,
            "d": 0.13
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        },
        {
          "id": "drain-cover3",
          "kind": "tank",
          "x": 2180,
          "z": 0.44,
          "layer": "ACTORS",
          "collidable": true,
          "footprint": {
            "w": 190,
            "d": 0.1
          },
          "purpose": "Emprise physique visible, contournable par le fond ou l’avant."
        }
      ],
      "objects": [
        {
          "room": "drain",
          "id": "job-drain-inspect",
          "label": "Examiner · Le retour des eaux",
          "x": 470,
          "z": 0.81,
          "description": "La grille de la dérivation est verrouillée. La clé du collecteur a été déposée au tableau électrique.",
          "duration": 0.6,
          "kind": "side-task",
          "job": "drain",
          "step": 0,
          "hardware": "panel"
        },
        {
          "room": "drain",
          "id": "job-drain-release",
          "label": "Ouvrir le retour et libérer la grille",
          "x": 2380,
          "z": 0.81,
          "description": "Échelle vers la galerie du refroidissement",
          "duration": 2.0,
          "kind": "side-task",
          "job": "drain",
          "step": 2,
          "hardware": "panel"
        },
        {
          "id": "hide-drain",
          "label": "Se cacher dans le casier de service",
          "kind": "hide",
          "x": 1652.9999999999998,
          "z": 0.81
        }
      ],
      "spawns": [],
      "cover": [
        {
          "id": "drain-cover1",
          "x": 820,
          "z": 0.46,
          "w": 280,
          "d": 0.16,
          "prop": "tank"
        },
        {
          "id": "drain-cover2",
          "x": 1620,
          "z": 0.5,
          "w": 240,
          "d": 0.13,
          "prop": "pump-motor"
        },
        {
          "id": "drain-cover3",
          "x": 2180,
          "z": 0.44,
          "w": 190,
          "d": 0.1,
          "prop": "tank"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "maintenance",
        "variant": "drain-service-loop",
        "circuit": "industry",
        "ceilingRatio": 0.16,
        "wallModules": 8,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [
        {
          "id": "drain-phase-paper",
          "kind": "paper-trail",
          "x": 1710.0,
          "z": 0.77,
          "fromPhase": 2
        },
        {
          "id": "drain-phase-light",
          "kind": "broken-light",
          "x": 1140.0,
          "z": 0.4,
          "fromPhase": 3
        }
      ],
      "annex": true,
      "layoutProfile": "authored-drain",
      "annexNote": {
        "promise": "Échelle vers la galerie du refroidissement",
        "teaching": "La grille de la dérivation est verrouillée. La clé du collecteur a été déposée au tableau électrique.",
        "returnReason": "Le déverrouillage est conservé entre les chapitres, pour les personnages compatibles.",
        "canon": "Architecture et tâche originales pour le jeu."
      },
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "nest",
      "name": "Renfoncement des câbles",
      "building": "Ventilation",
      "floor": 1,
      "kind": "vent",
      "width": 1950,
      "map": [
        6,
        2
      ],
      "theme": "refuge",
      "landmark": "Rubans colorés, couverture pliée et petite grille d’observation",
      "minZ": 0.7,
      "maxZ": 0.7,
      "light": "amber",
      "dimensionsM": [
        46.4,
        1.2,
        2.2
      ],
      "portals": [
        {
          "id": "nest>vent_med",
          "to": "vent_med",
          "x": 170,
          "z": 0.7,
          "kind": "conduit",
          "childOnly": true,
          "requires": null,
          "shortcut": null,
          "lockReason": null,
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 170,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "vent_med>nest"
          }
        },
        {
          "id": "nest>refuge",
          "to": "refuge",
          "x": 1780,
          "z": 0.7,
          "kind": "conduit",
          "childOnly": true,
          "requires": "service-nest",
          "shortcut": "nest",
          "lockReason": "Déverrouillage à effectuer dans Renfoncement des câbles",
          "architecture": {
            "type": "duct",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 66,
            "approachX": 1780,
            "approachZ": 0.7,
            "originFloor": 1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "refuge>nest"
          }
        }
      ],
      "props": [
        {
          "id": "nest-set-0",
          "kind": "drawing",
          "x": 380,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Dessin servant de repère près de l’entrée"
        },
        {
          "id": "nest-set-1",
          "kind": "blanket",
          "x": 560,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Couverture dans le renfoncement sec"
        },
        {
          "id": "nest-set-2",
          "kind": "toy",
          "x": 600,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Jouet laissé près de la couverture"
        },
        {
          "id": "nest-set-3",
          "kind": "trace-mark",
          "x": 970,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Trace au premier coude du conduit"
        },
        {
          "id": "nest-set-4",
          "kind": "duct-junction",
          "x": 870,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Jonction fixée sur la paroi"
        },
        {
          "id": "nest-set-5",
          "kind": "bolt-panel",
          "x": 1190,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Plaque vissée du coffrage"
        },
        {
          "id": "nest-set-6",
          "kind": "mug",
          "x": 650,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Tasse au petit bivouac"
        },
        {
          "id": "nest-set-7",
          "kind": "vent-cover",
          "x": 1570,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Grille alignée sur le passage de l’ombre"
        },
        {
          "id": "nest-set-8",
          "kind": "photo",
          "x": 720,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "wall",
          "purpose": "Photo gardée à côté du bivouac"
        },
        {
          "id": "nest-set-9",
          "kind": "cable",
          "x": 1580,
          "z": 0.7,
          "layer": "FIXTURES",
          "collidable": false,
          "mount": "floor",
          "purpose": "Dégagement visuel du seuil ; décoration déplacée, collision inchangée"
        }
      ],
      "objects": [
        {
          "room": "nest",
          "id": "job-nest-inspect",
          "label": "Examiner · Le fil qui revient",
          "x": 470,
          "z": 0.7,
          "description": "Un fil usé rejoint la petite grille. Un ruban neuf permettrait de la tirer sans se coincer les doigts.",
          "duration": 0.6,
          "kind": "side-task",
          "job": "nest",
          "step": 0,
          "hardware": "grille"
        },
        {
          "room": "nest",
          "id": "job-nest-release",
          "label": "Nouer le ruban et soulever la petite grille",
          "x": 1480,
          "z": 0.7,
          "description": "Passage direct vers la cache des conduits",
          "duration": 2.0,
          "kind": "side-task",
          "job": "nest",
          "step": 2,
          "hardware": "grille"
        },
        {
          "id": "hide-nest",
          "label": "Se glisser dans le renfoncement",
          "kind": "hide",
          "x": 1131.0,
          "z": 0.7
        }
      ],
      "spawns": [],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "refuge",
        "variant": "nest-service-loop",
        "circuit": "habitat",
        "ceilingRatio": 0.22,
        "wallModules": 5,
        "safeFloor": [
          0.7,
          0.7
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "annex": true,
      "layoutProfile": "inherited-nest",
      "annexNote": {
        "promise": "Passage direct vers la cache des conduits",
        "teaching": "Un fil usé rejoint la petite grille. Un ruban neuf permettrait de la tirer sans se coincer les doigts.",
        "returnReason": "Le déverrouillage est conservé entre les chapitres, pour les personnages compatibles.",
        "canon": "Architecture et tâche originales pour le jeu."
      },
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "greenhouse",
      "name": "Serre vitrée",
      "building": "Habitat",
      "floor": 0,
      "kind": "depth",
      "width": 2750,
      "map": [
        6,
        1
      ],
      "theme": "greenhouse",
      "landmark": "Dôme vitré hémisphérique : présence attestée, culture et plan interprétés",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        65.5,
        9,
        5.5
      ],
      "portals": [
        {
          "id": "greenhouse>recreation",
          "to": "recreation",
          "x": 170,
          "z": 0.69,
          "kind": "coursive",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "corridor",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "recreation>greenhouse"
          }
        },
        {
          "id": "greenhouse>wash",
          "to": "wash",
          "x": 2580,
          "z": 0.69,
          "kind": "coursive",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "corridor",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2580,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "wash>greenhouse"
          }
        }
      ],
      "props": [
        {
          "id": "greenhouse-v09-0",
          "kind": "planter",
          "x": 650,
          "z": 0.4,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "Implantation de jeu documentée",
          "footprint": {
            "w": 250,
            "d": 0.11
          }
        },
        {
          "id": "greenhouse-v09-1",
          "kind": "planter",
          "x": 1300,
          "z": 0.4,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "Implantation de jeu documentée",
          "footprint": {
            "w": 250,
            "d": 0.11
          }
        },
        {
          "id": "greenhouse-v09-2",
          "kind": "planter",
          "x": 1950,
          "z": 0.4,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "Implantation de jeu documentée",
          "footprint": {
            "w": 250,
            "d": 0.11
          }
        },
        {
          "id": "greenhouse-v09-3",
          "kind": "planter",
          "x": 1260,
          "z": 0.58,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "Implantation de jeu documentée",
          "footprint": {
            "w": 250,
            "d": 0.11
          }
        },
        {
          "id": "greenhouse-v09-4",
          "kind": "planter",
          "x": 460,
          "z": 0.19,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "greenhouse-v09-5",
          "kind": "planter",
          "x": 900,
          "z": 0.19,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "greenhouse-v09-6",
          "kind": "planter",
          "x": 1650,
          "z": 0.19,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "greenhouse-v09-7",
          "kind": "planter",
          "x": 2180,
          "z": 0.19,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        }
      ],
      "objects": [
        {
          "id": "greenhouse-inspection",
          "kind": "inspection",
          "x": 2240,
          "z": 0.81,
          "label": "Observer la serre",
          "description": "La serre hémisphérique est attestée dans l’extrait de River of Pain. Les rangées, cultures et connexions sont une interprétation jouable, pas un relevé du roman."
        }
      ],
      "spawns": [],
      "cover": [
        {
          "id": "greenhouse-v09-0",
          "x": 650,
          "z": 0.4,
          "w": 250,
          "d": 0.11,
          "prop": "planter"
        },
        {
          "id": "greenhouse-v09-1",
          "x": 1300,
          "z": 0.4,
          "w": 250,
          "d": 0.11,
          "prop": "planter"
        },
        {
          "id": "greenhouse-v09-2",
          "x": 1950,
          "z": 0.4,
          "w": 250,
          "d": 0.11,
          "prop": "planter"
        },
        {
          "id": "greenhouse-v09-3",
          "x": 1260,
          "z": 0.58,
          "w": 250,
          "d": 0.11,
          "prop": "planter"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "greenhouse",
        "variant": "glass_dome",
        "circuit": "habitat",
        "ceilingRatio": 0.16,
        "wallModules": 7,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "authored-v09",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "armory",
      "name": "Armurerie de la garnison",
      "building": "Administration",
      "floor": 1,
      "kind": "depth",
      "width": 2200,
      "map": [
        3,
        0
      ],
      "theme": "armory",
      "landmark": "Râteliers identifiés et dépôt séparé du poste de commandement",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "cold",
      "dimensionsM": [
        52.4,
        9,
        5.5
      ],
      "portals": [
        {
          "id": "armory>briefing",
          "to": "briefing",
          "x": 170,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "briefing>armory"
          }
        },
        {
          "id": "armory>ops",
          "to": "ops",
          "x": 2030,
          "z": 0.69,
          "kind": "porte",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "door",
            "mount": "side-bulkhead",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2030,
            "approachZ": 0.69,
            "originFloor": 1,
            "destinationFloor": 1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "ops>armory"
          }
        }
      ],
      "props": [
        {
          "id": "armory-v09-0",
          "kind": "weapon-rack",
          "x": 390,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "armory-v09-1",
          "kind": "case",
          "x": 418,
          "z": 0.41,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "armory-v09-2",
          "kind": "weapon-rack",
          "x": 730,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "armory-v09-3",
          "kind": "case",
          "x": 758,
          "z": 0.41,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "armory-v09-4",
          "kind": "case",
          "x": 1128,
          "z": 0.41,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "armory-v09-5",
          "kind": "weapon-rack",
          "x": 1430,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "armory-v09-6",
          "kind": "case",
          "x": 1458,
          "z": 0.41,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "armory-v09-7",
          "kind": "weapon-rack",
          "x": 1800,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "armory-v09-8",
          "kind": "case",
          "x": 1828,
          "z": 0.41,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        }
      ],
      "objects": [
        {
          "id": "armory-rack-v09",
          "kind": "armory",
          "x": 1080,
          "z": 0.28,
          "label": "Consulter le râtelier",
          "description": "Dotation facultative de jeu. La présence de ces modèles dans Aliens ne prouve pas leur attribution exacte dans River of Pain."
        },
        {
          "id": "a31",
          "label": "Râtelier sous scellés",
          "kind": "archive",
          "x": 580,
          "z": 0.82,
          "description": "Les compartiments sont séparés. Inscrire le prélèvement avant de partir ; le râtelier ne sera pas réapprovisionné au prochain passage."
        }
      ],
      "spawns": [],
      "cover": [],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "garrison",
        "variant": "racks",
        "circuit": "habitat",
        "ceilingRatio": 0.16,
        "wallModules": 6,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "authored-v09",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "derelict_gallery",
      "name": "Galerie biomécanique",
      "building": "Épave",
      "floor": 0,
      "kind": "derelict",
      "width": 2400,
      "map": [
        8,
        4
      ],
      "theme": "derelict",
      "landmark": "Coque nervurée ; le passage continue au-delà du seuil",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        57.1,
        9,
        5.5
      ],
      "portals": [
        {
          "id": "derelict_gallery>derelict",
          "to": "derelict",
          "x": 170,
          "z": 0.69,
          "kind": "brèche",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "organic",
            "mount": "organic-shell",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "derelict>derelict_gallery"
          }
        },
        {
          "id": "derelict_gallery>pilot_chamber",
          "to": "pilot_chamber",
          "x": 2230,
          "z": 0.69,
          "kind": "brèche",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "organic",
            "mount": "organic-shell",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2230,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "pilot_chamber>derelict_gallery"
          }
        }
      ],
      "props": [
        {
          "id": "derelict_gallery-v09-0",
          "kind": "rib",
          "x": 380,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "derelict_gallery-v09-1",
          "kind": "rib",
          "x": 690,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "derelict_gallery-v09-2",
          "kind": "rib",
          "x": 1000,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "derelict_gallery-v09-3",
          "kind": "rib",
          "x": 1310,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "derelict_gallery-v09-4",
          "kind": "rib",
          "x": 1620,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "derelict_gallery-v09-5",
          "kind": "rib",
          "x": 1930,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "derelict_gallery-v09-6",
          "kind": "rib",
          "x": 768.0,
          "z": 0.54,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "Implantation de jeu documentée",
          "footprint": {
            "w": 145,
            "d": 0.11
          }
        },
        {
          "id": "derelict_gallery-v09-7",
          "kind": "rib",
          "x": 1536.0,
          "z": 0.54,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "Implantation de jeu documentée",
          "footprint": {
            "w": 145,
            "d": 0.11
          }
        }
      ],
      "objects": [
        {
          "id": "a32",
          "label": "Consigner : La courbe intérieure",
          "kind": "archive",
          "x": 1110,
          "z": 0.82,
          "description": "Les nervures se rejoignent au-dessus de la marche. Le retour est au même seuil ; ne pas confondre un renfoncement dans la coque et un chemin."
        }
      ],
      "spawns": [],
      "cover": [
        {
          "id": "derelict_gallery-v09-6",
          "x": 768.0,
          "z": 0.54,
          "w": 145,
          "d": 0.11,
          "prop": "rib"
        },
        {
          "id": "derelict_gallery-v09-7",
          "x": 1536.0,
          "z": 0.54,
          "w": 145,
          "d": 0.11,
          "prop": "rib"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "derelict",
        "variant": "organic_vault",
        "circuit": "perimeter",
        "ceilingRatio": 0.16,
        "wallModules": 7,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "authored-v09",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "pilot_chamber",
      "name": "Chambre du pilote",
      "building": "Épave",
      "floor": 0,
      "kind": "derelict",
      "width": 3000,
      "map": [
        9,
        4
      ],
      "theme": "derelict",
      "landmark": "Siège fossile central, sans déplacement du pilote vers la colonie",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        71.4,
        9,
        5.5
      ],
      "portals": [
        {
          "id": "pilot_chamber>derelict_gallery",
          "to": "derelict_gallery",
          "x": 170,
          "z": 0.69,
          "kind": "brèche",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "organic",
            "mount": "organic-shell",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "derelict_gallery>pilot_chamber"
          }
        },
        {
          "id": "pilot_chamber>egg_vault",
          "to": "egg_vault",
          "x": 2830,
          "z": 0.69,
          "kind": "corde",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "rope",
            "mount": "organic-shell",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 2830,
            "approachZ": 0.69,
            "originFloor": 0,
            "destinationFloor": -1,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "egg_vault>pilot_chamber"
          }
        }
      ],
      "props": [
        {
          "id": "pilot_chamber-v09-0",
          "kind": "rib",
          "x": 380,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "pilot_chamber-v09-1",
          "kind": "rib",
          "x": 690,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "pilot_chamber-v09-2",
          "kind": "rib",
          "x": 1000,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "pilot_chamber-v09-3",
          "kind": "rib",
          "x": 1310,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "pilot_chamber-v09-4",
          "kind": "rib",
          "x": 1620,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "pilot_chamber-v09-5",
          "kind": "rib",
          "x": 1930,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "pilot_chamber-v09-6",
          "kind": "rib",
          "x": 2240,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "pilot_chamber-v09-7",
          "kind": "rib",
          "x": 2550,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "pilot_chamber-v09-8",
          "kind": "rib",
          "x": 960.0,
          "z": 0.54,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "Implantation de jeu documentée",
          "footprint": {
            "w": 145,
            "d": 0.11
          }
        },
        {
          "id": "pilot_chamber-v09-9",
          "kind": "rib",
          "x": 1920.0,
          "z": 0.54,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "Implantation de jeu documentée",
          "footprint": {
            "w": 145,
            "d": 0.11
          }
        },
        {
          "id": "pilot_chamber-v09-10",
          "kind": "pilot-seat",
          "x": 1470,
          "z": 0.34,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "Implantation de jeu documentée",
          "footprint": {
            "w": 280,
            "d": 0.17
          }
        }
      ],
      "objects": [
        {
          "id": "a33",
          "label": "Consigner : Le poste immobile",
          "kind": "archive",
          "x": 1980,
          "z": 0.82,
          "description": "Le relief central n’est pas une console coloniale. Observer depuis la bande dégagée ; ne rien arracher au siège."
        }
      ],
      "spawns": [],
      "cover": [
        {
          "id": "pilot_chamber-v09-8",
          "x": 960.0,
          "z": 0.54,
          "w": 145,
          "d": 0.11,
          "prop": "rib"
        },
        {
          "id": "pilot_chamber-v09-9",
          "x": 1920.0,
          "z": 0.54,
          "w": 145,
          "d": 0.11,
          "prop": "rib"
        },
        {
          "id": "pilot_chamber-v09-10",
          "x": 1470,
          "z": 0.34,
          "w": 280,
          "d": 0.17,
          "prop": "pilot-seat"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "derelict",
        "variant": "organic_vault",
        "circuit": "perimeter",
        "ceilingRatio": 0.16,
        "wallModules": 7,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "authored-v09",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    },
    {
      "id": "egg_vault",
      "name": "Cale aux œufs",
      "building": "Épave",
      "floor": -1,
      "kind": "derelict",
      "width": 2850,
      "map": [
        9,
        5
      ],
      "theme": "derelict",
      "landmark": "Nappe de brume et ovoides sous la coque ; parcours d’observation original",
      "minZ": 0.25,
      "maxZ": 0.9,
      "light": "amber",
      "dimensionsM": [
        67.9,
        9,
        5.5
      ],
      "portals": [
        {
          "id": "egg_vault>pilot_chamber",
          "to": "pilot_chamber",
          "x": 170,
          "z": 0.69,
          "kind": "corde",
          "childOnly": false,
          "requires": null,
          "architecture": {
            "type": "rope",
            "mount": "organic-shell",
            "support": "attached_structure",
            "apertureWidth": 112,
            "approachX": 170,
            "approachZ": 0.69,
            "originFloor": -1,
            "destinationFloor": 0,
            "localRiseM": 0,
            "source": "authored_layout",
            "reciprocal": "pilot_chamber>egg_vault"
          }
        }
      ],
      "props": [
        {
          "id": "egg_vault-v09-0",
          "kind": "rib",
          "x": 380,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-1",
          "kind": "rib",
          "x": 690,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-2",
          "kind": "rib",
          "x": 1000,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-3",
          "kind": "rib",
          "x": 1310,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-4",
          "kind": "rib",
          "x": 1620,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-5",
          "kind": "rib",
          "x": 1930,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-6",
          "kind": "rib",
          "x": 2240,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-7",
          "kind": "rib",
          "x": 2550,
          "z": 0.22,
          "layer": "FIXTURES",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-8",
          "kind": "rock",
          "x": 912.0,
          "z": 0.54,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "Implantation de jeu documentée",
          "footprint": {
            "w": 145,
            "d": 0.11
          }
        },
        {
          "id": "egg_vault-v09-9",
          "kind": "rock",
          "x": 1824.0,
          "z": 0.54,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "Implantation de jeu documentée",
          "footprint": {
            "w": 145,
            "d": 0.11
          }
        },
        {
          "id": "egg_vault-v09-10",
          "kind": "egg-bed",
          "x": 1400,
          "z": 0.33,
          "layer": "ACTORS",
          "collidable": true,
          "purpose": "Implantation de jeu documentée",
          "footprint": {
            "w": 2060,
            "d": 0.14
          }
        },
        {
          "id": "egg_vault-v09-11",
          "kind": "sealed-egg",
          "x": 510,
          "z": 0.36,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-12",
          "kind": "sealed-egg",
          "x": 735,
          "z": 0.3,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-13",
          "kind": "sealed-egg",
          "x": 1010,
          "z": 0.36,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-14",
          "kind": "sealed-egg",
          "x": 1260,
          "z": 0.36,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-15",
          "kind": "sealed-egg",
          "x": 1510,
          "z": 0.36,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-16",
          "kind": "sealed-egg",
          "x": 1770,
          "z": 0.36,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-17",
          "kind": "sealed-egg",
          "x": 2040,
          "z": 0.36,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        },
        {
          "id": "egg_vault-v09-18",
          "kind": "sealed-egg",
          "x": 2260,
          "z": 0.36,
          "layer": "ACTORS",
          "collidable": false,
          "purpose": "Implantation de jeu documentée"
        }
      ],
      "objects": [
        {
          "id": "a34",
          "label": "Consigner : Sous la chambre",
          "kind": "archive",
          "x": 2380,
          "z": 0.82,
          "description": "La corde de reconstitution rejoint le palier supérieur. La brume cache le fond ; les ovoides de cette scène ne sont pas des objets à récolter."
        }
      ],
      "spawns": [],
      "cover": [
        {
          "id": "egg_vault-v09-8",
          "x": 912.0,
          "z": 0.54,
          "w": 145,
          "d": 0.11,
          "prop": "rock"
        },
        {
          "id": "egg_vault-v09-9",
          "x": 1824.0,
          "z": 0.54,
          "w": 145,
          "d": 0.11,
          "prop": "rock"
        },
        {
          "id": "egg_vault-v09-10",
          "x": 1400,
          "z": 0.33,
          "w": 2060,
          "d": 0.14,
          "prop": "egg-bed"
        }
      ],
      "layerPlan": [
        "HORIZON",
        "SKYLINE",
        "FAR",
        "MID",
        "WALL",
        "FIXTURES",
        "FLOOR",
        "ACTORS",
        "NEAR",
        "FOREGROUND"
      ],
      "architecture": {
        "style": "derelict",
        "variant": "organic_vault",
        "circuit": "perimeter",
        "ceilingRatio": 0.16,
        "wallModules": 7,
        "safeFloor": [
          0.25,
          0.9
        ],
        "parallax": {
          "horizon": 0.035,
          "skyline": 0.12,
          "structures": 0.25,
          "wall": 1.0,
          "foreground": 1.025
        }
      },
      "phaseDressing": [],
      "layoutProfile": "authored-v09",
      "fidelity": {
        "plan": "original_non_mesure",
        "presence": "functional_reconstruction",
        "sourceIds": []
      }
    }
  ],
  "chapters": [
    {
      "id": "rop-01",
      "index": 0,
      "title": "La relève",
      "character": "brackett",
      "start": "pad",
      "phase": 0,
      "objectives": [
        {
          "id": "welcome",
          "room": "pad",
          "label": "Retrouver Paris"
        },
        {
          "id": "brief",
          "room": "ops",
          "label": "Consulter le tableau de service"
        },
        {
          "id": "locker",
          "room": "briefing",
          "label": "Prendre la dotation"
        }
      ],
      "synopsis": "Brackett prend ses fonctions dans une colonie qui ressemble encore à une ville.",
      "dialogue": {
        "speaker": "Paris",
        "text": "Vous verrez la tempête plus souvent que le ciel. Les familles, elles, sont ici toute l’année.",
        "origin": "dialogue_original"
      },
      "timeLabel": "Avant la crise",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-02",
      "index": 1,
      "title": "Les gens d’ici",
      "character": "anne",
      "start": "jorden",
      "phase": 0,
      "objectives": [
        {
          "id": "family",
          "room": "jorden",
          "label": "Préparer la tournée"
        },
        {
          "id": "provisions",
          "room": "mess",
          "label": "Récupérer les provisions"
        },
        {
          "id": "grid",
          "room": "power",
          "label": "Réarmer le départ habitat"
        }
      ],
      "synopsis": "Anne traverse les lieux ordinaires que la crise rendra bientôt méconnaissables.",
      "dialogue": {
        "speaker": "Anne",
        "text": "On peut retarder les relevés. Pas le chauffage du bloc.",
        "origin": "dialogue_original"
      },
      "timeLabel": "Avant la crise",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-03",
      "index": 2,
      "title": "Sous pression",
      "character": "brackett",
      "start": "garage",
      "phase": 0,
      "objectives": [
        {
          "id": "rescue_kit",
          "room": "garage",
          "label": "Prendre le matériel de secours"
        },
        {
          "id": "pressure",
          "room": "processor6",
          "label": "Isoler la conduite endommagée"
        },
        {
          "id": "incident",
          "room": "processor6",
          "label": "Récupérer le rapport d’intervention"
        }
      ],
      "synopsis": "Une intervention industrielle expose les tensions de la garnison. Séquence de jeu condensée autour du processeur six.",
      "dialogue": {
        "speaker": "Paris",
        "text": "Coupez l’arrivée avant de toucher aux vannes. Ici, une mauvaise décision se propage à tout le réseau.",
        "origin": "dialogue_original"
      },
      "timeLabel": "Avant la crise",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-04",
      "index": 3,
      "title": "Les coordonnées",
      "character": "anne",
      "start": "survey",
      "phase": 0,
      "objectives": [
        {
          "id": "coordinates",
          "room": "survey",
          "label": "Recevoir la grille de prospection"
        },
        {
          "id": "tractor",
          "room": "garage",
          "label": "Préparer le tracteur"
        },
        {
          "id": "beacon",
          "room": "plateau",
          "label": "Poser une balise sur le plateau"
        },
        {
          "id": "threshold",
          "room": "derelict",
          "label": "Examiner le seuil de l’épave"
        }
      ],
      "synopsis": "La sortie des Jorden rejoint le lieu désigné par la Compagnie. La découverte de Russ est traitée hors champ.",
      "dialogue": {
        "speaker": "Anne",
        "text": "La radio passe mal. Je laisse une balise : personne ne retrouvera cette passe de nuit.",
        "origin": "dialogue_original"
      },
      "timeLabel": "Avant la crise",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-05",
      "index": 4,
      "title": "La porte blanche",
      "character": "brackett",
      "start": "pad",
      "phase": 1,
      "objectives": [
        {
          "id": "stretcher",
          "room": "pad",
          "label": "Prendre en charge le retour des prospecteurs"
        },
        {
          "id": "quarantine",
          "room": "isolation",
          "label": "Fermer l’isolement médical"
        },
        {
          "id": "triage",
          "room": "med",
          "label": "Transmettre le bilan à Komiskey"
        }
      ],
      "synopsis": "Le retour des prospecteurs met l’infirmerie au centre de toutes les décisions.",
      "dialogue": {
        "speaker": "Komiskey",
        "text": "Gardez le couloir libre. Je veux des gens qui respirent, pas une foule autour du lit.",
        "origin": "dialogue_original"
      },
      "timeLabel": "Premiers incidents",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-06",
      "index": 5,
      "title": "Priorité de recherche",
      "character": "anne",
      "start": "med",
      "phase": 1,
      "objectives": [
        {
          "id": "patient_log",
          "room": "med",
          "label": "Consulter le registre des patients"
        },
        {
          "id": "orders",
          "room": "science",
          "label": "Lire la directive scientifique"
        },
        {
          "id": "copy",
          "room": "records",
          "label": "Conserver une copie des échanges"
        }
      ],
      "synopsis": "Les priorités médicales et celles de la Compagnie divergent.",
      "dialogue": {
        "speaker": "Anne",
        "text": "Ce n’est pas une cargaison. C’est mon mari.",
        "origin": "dialogue_original"
      },
      "timeLabel": "Premiers incidents",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-07",
      "index": 6,
      "title": "Derrière les grilles",
      "character": "newt",
      "start": "jorden",
      "phase": 1,
      "objectives": [
        {
          "id": "marks",
          "room": "vent_hab",
          "label": "Retrouver les repères de Tim"
        },
        {
          "id": "listen",
          "room": "vent_med",
          "label": "Écouter derrière la grille"
        },
        {
          "id": "cache",
          "room": "refuge",
          "label": "Préparer une petite cache"
        }
      ],
      "synopsis": "Les jeux dans les conduits deviennent un apprentissage de la survie. Aucun combat pour Newt.",
      "dialogue": {
        "speaker": "Newt",
        "text": "Le tuyau qui vibre revient vers la cuisine. Celui qui siffle va à l’infirmerie.",
        "origin": "dialogue_original"
      },
      "timeLabel": "Premiers incidents",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-08",
      "index": 7,
      "title": "Les absents",
      "character": "brackett",
      "start": "ops",
      "phase": 2,
      "objectives": [
        {
          "id": "missing",
          "room": "ops",
          "label": "Relever les dernières balises PDT"
        },
        {
          "id": "trail",
          "room": "service",
          "label": "Suivre les traces dans la galerie"
        },
        {
          "id": "reroute",
          "room": "pump",
          "label": "Détourner la pression du passage"
        }
      ],
      "synopsis": "Les disparitions ont désormais une géographie. Les itinéraires sûrs commencent à se refermer.",
      "dialogue": {
        "speaker": "Brackett",
        "text": "On marque chaque porte derrière nous. Je refuse de perdre quelqu’un à un embranchement.",
        "origin": "dialogue_original"
      },
      "timeLabel": "La colonie se ferme",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-09",
      "index": 8,
      "title": "Les lumières rouges",
      "character": "paris",
      "start": "med",
      "phase": 2,
      "objectives": [
        {
          "id": "medstock",
          "room": "clinic_store",
          "label": "Prendre les soins d’urgence"
        },
        {
          "id": "civilian",
          "room": "mess",
          "label": "Accompagner un colon jusqu’au magasin"
        },
        {
          "id": "shelter",
          "room": "stores",
          "label": "Mettre le refuge provisoire sous tension"
        }
      ],
      "synopsis": "Paris maintient une route pour les habitants. L’escorte représente une survie locale, pas une évacuation historique supplémentaire.",
      "dialogue": {
        "speaker": "Paris",
        "text": "Restez derrière moi. Nous allons jusqu’à la lumière suivante, puis à la suivante.",
        "origin": "dialogue_original"
      },
      "timeLabel": "La colonie se ferme",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-10",
      "index": 9,
      "title": "Fermer, tenir",
      "character": "anne",
      "start": "survey",
      "phase": 2,
      "objectives": [
        {
          "id": "welding",
          "room": "stores",
          "label": "Récupérer un poste à souder"
        },
        {
          "id": "barricade",
          "room": "survey",
          "label": "Renforcer la fermeture du bureau"
        },
        {
          "id": "emergency",
          "room": "power",
          "label": "Rétablir le circuit de secours"
        }
      ],
      "synopsis": "Les prospecteurs transforment leurs outils en moyens de défense.",
      "dialogue": {
        "speaker": "Anne",
        "text": "La porte n’a pas besoin de tenir toute la nuit. Seulement assez longtemps pour les enfants.",
        "origin": "dialogue_original"
      },
      "timeLabel": "La colonie se ferme",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-11",
      "index": 10,
      "title": "Sous le processeur",
      "character": "brackett",
      "start": "approach",
      "phase": 3,
      "objectives": [
        {
          "id": "descent",
          "room": "lift",
          "label": "Commander le monte-charge"
        },
        {
          "id": "pdt",
          "room": "hive",
          "label": "Retrouver la source des signaux"
        },
        {
          "id": "fallback",
          "room": "coolant",
          "label": "Baliser la route de repli"
        },
        {
          "id": "withdraw",
          "room": "power",
          "label": "Fermer derrière le groupe"
        }
      ],
      "synopsis": "Le passage dans la ruche est un échec de sauvetage, pas une chasse à la reine.",
      "dialogue": {
        "speaker": "Brackett",
        "text": "N’approchez pas des parois. Repliez-vous par les balises ; ne tirez que pour ouvrir le passage.",
        "origin": "dialogue_original"
      },
      "timeLabel": "La chute",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-12",
      "index": 11,
      "title": "La dernière porte",
      "character": "anne",
      "start": "survey",
      "phase": 3,
      "objectives": [
        {
          "id": "last_power",
          "room": "survey",
          "label": "Alimenter le verrou une dernière fois"
        },
        {
          "id": "vent_open",
          "room": "survey",
          "label": "Dégager l’accès au conduit"
        },
        {
          "id": "newt_escape",
          "room": "survey",
          "label": "Mettre Newt à l’abri"
        }
      ],
      "synopsis": "La défense des Jorden ne change pas leur destin. Le point de vue quitte Anne au moment où Newt passe la grille.",
      "dialogue": {
        "speaker": "Anne",
        "text": "Ne te retourne pas. Compte les virages comme quand vous jouiez.",
        "origin": "dialogue_original"
      },
      "timeLabel": "La chute",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-13",
      "index": 12,
      "title": "Une issue réservée",
      "character": "paris",
      "start": "science",
      "phase": 3,
      "objectives": [
        {
          "id": "hidalgo",
          "room": "science",
          "label": "Recevoir la transmission de Brackett"
        },
        {
          "id": "luisa",
          "room": "survey",
          "label": "Dégager Luisa et la conduire au hangar"
        },
        {
          "id": "clearance",
          "room": "hangar",
          "label": "Déverrouiller la navette scientifique"
        }
      ],
      "synopsis": "Brackett transmet l’indication d’Hidalgo : la Compagnie dispose d’une issue. Luisa suit Paris jusqu’au hangar.",
      "dialogue": {
        "speaker": "Paris",
        "text": "La sortie existe. Nous allons la rendre accessible à ceux qui sont encore avec nous.",
        "origin": "dialogue_original"
      },
      "timeLabel": "La chute",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-14",
      "index": 13,
      "title": "La trajectoire imposée",
      "character": "brackett",
      "start": "hangar",
      "phase": 3,
      "objectives": [
        {
          "id": "boarding",
          "room": "hangar",
          "label": "Vérifier l’embarquement"
        },
        {
          "id": "autopilot",
          "room": "shuttle",
          "label": "Désengager la trajectoire automatique"
        },
        {
          "id": "departure",
          "room": "shuttle",
          "label": "Décoller"
        }
      ],
      "synopsis": "Brackett, Paris, Mori et Luisa quittent la colonie. Newt n’est pas à bord.",
      "dialogue": {
        "speaker": "Brackett",
        "text": "Aucune trajectoire imposée. Nous choisissons où nous allons.",
        "origin": "dialogue_original"
      },
      "timeLabel": "La chute",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-15",
      "index": 14,
      "title": "Il reste quelqu’un",
      "character": "newt",
      "start": "refuge",
      "phase": 3,
      "objectives": [
        {
          "id": "water",
          "room": "wash",
          "label": "Récupérer de l’eau"
        },
        {
          "id": "ration",
          "room": "mess",
          "label": "Trouver de quoi manger"
        },
        {
          "id": "silence",
          "room": "vent_survey",
          "label": "Passer sans attirer la créature"
        }
      ],
      "synopsis": "Le point de vue revient dans les conduits. Il faut survivre avec presque rien.",
      "dialogue": {
        "speaker": "Newt",
        "text": "Pas la grande porte. Jamais la grande porte quand on entend les tuyaux.",
        "origin": "dialogue_original"
      },
      "timeLabel": "La chute",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    },
    {
      "id": "rop-16",
      "index": 15,
      "title": "Jusqu’au prochain bruit",
      "character": "newt",
      "start": "refuge",
      "phase": 3,
      "objectives": [
        {
          "id": "route",
          "room": "vent_hab",
          "label": "Vérifier le chemin de retour"
        },
        {
          "id": "hide",
          "room": "refuge",
          "label": "Regagner la cache"
        }
      ],
      "synopsis": "La cache devient le dernier lieu habité du parcours. La suite appartient à l’arrivée du Sulaco.",
      "dialogue": {
        "speaker": "Newt",
        "text": "Je suis là. Je suis encore là.",
        "origin": "dialogue_original"
      },
      "timeLabel": "La chute",
      "provenance": "condensation_originale_appuyee_sur_synopsis_publics",
      "originalObjectives": true,
      "fidelity": "premise_and_selected_events_not_scene_by_scene"
    }
  ],
  "characters": {
    "brackett": {
      "name": "Demian Brackett",
      "role": "Capitaine · garnison coloniale",
      "height": 76,
      "weapon": "M41A",
      "clip": 30,
      "reserve": 90,
      "medkits": 2,
      "flares": 3,
      "color": "#8c9875",
      "child": false
    },
    "paris": {
      "name": "Julisa Paris",
      "role": "Marine · garnison coloniale",
      "height": 73,
      "weapon": "M41A",
      "clip": 30,
      "reserve": 75,
      "medkits": 3,
      "flares": 3,
      "color": "#8c9f99",
      "child": false
    },
    "anne": {
      "name": "Anne Jorden",
      "role": "Prospectrice · Hadley’s Hope",
      "height": 71,
      "weapon": null,
      "clip": 0,
      "reserve": 0,
      "medkits": 2,
      "flares": 4,
      "color": "#b39366",
      "child": false
    },
    "newt": {
      "name": "Rebecca « Newt » Jorden",
      "role": "Habitat · conduits",
      "height": 44,
      "weapon": null,
      "clip": 0,
      "reserve": 0,
      "medkits": 0,
      "flares": 0,
      "color": "#b49a7b",
      "child": true
    }
  },
  "archives": [
    {
      "id": "a01",
      "title": "Bordereau d’arrivée",
      "text": "Bienvenue à Hadley’s Hope. Les nouveaux arrivants doivent se présenter au contrôle colonial avant l’attribution des logements. Ne laissez pas de bagages dans le sas : les équipes de nuit y font passer le matériel lourd.",
      "room": "pad",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a02",
      "title": "Grille de prospection",
      "text": "Secteur de relevé ajouté à la tournée des Jorden. Coordonnées transmises par liaison Compagnie. Priorité haute. L’équipe de prospection demande une raison ; aucune précision reçue à ce jour.",
      "room": "ops",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a03",
      "title": "Ordre du jour",
      "text": "Relève du poste central à six heures. Révision des joints du garage reportée. Les patrouilles devront signaler toute conduite qui siffle : le processeur six nous a déjà coûté assez de sommeil.",
      "room": "briefing",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a04",
      "title": "Une table pour quatre",
      "text": "Anne — Il reste des provisions au réfectoire. Tim a encore déplacé ses affaires dans les conduits. J’ai remis la petite couverture sur le lit de Becky. On rentrera avant que le chauffage recommence à faire du bruit.",
      "room": "jorden",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a05",
      "title": "Les chemins de Tim",
      "text": "Après la grille qui vibre, tourner à gauche. Ne pas poser le pied sur la plaque claire. Elle résonne jusque dans le couloir. Tim dit qu’il connaît un chemin encore plus court.",
      "room": "recreation",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a06",
      "title": "Priorité médicale",
      "text": "Couloir médical dégagé en permanence. Un seul membre de la famille admis auprès des patients. Les demandes de transfert vers le laboratoire doivent être validées par le personnel soignant.",
      "room": "med",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a07",
      "title": "Le hublot",
      "text": "L’isolement reste fermé. La vitre ne doit pas être ouverte pour faciliter une observation. Toute intervention sur le patient nécessite deux personnes et un accès libre au sas.",
      "room": "isolation",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a08",
      "title": "Mainmise",
      "text": "L’échantillon doit demeurer sur place. Les résultats d’observation passent par le canal scientifique avant toute transmission extérieure. Les urgences médicales ne dispensent pas de renseigner la chaîne de possession.",
      "room": "science",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a09",
      "title": "Transmission conservée",
      "text": "Copie locale créée. Si la liaison est coupée, garder les bandes hors de la baie principale. La suppression d’un message ne doit pas supprimer la preuve qu’il a été reçu.",
      "room": "records",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a10",
      "title": "Tracteur des prospecteurs",
      "text": "Le tracteur revient couvert d’une poussière que les filtres n’arrêtent pas correctement. Vérifier les joints avant toute autre sortie. Ne pas déposer les bottes de prospection dans les casiers propres.",
      "room": "garage",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a11",
      "title": "Un bureau transformé",
      "text": "Des familles attendent près des cartes. Elles veulent savoir quel bâtiment tient encore. Ne pas donner une destination tant qu’une patrouille n’a pas confirmé le passage.",
      "room": "survey",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a12",
      "title": "Refuge provisoire",
      "text": "Le fret peut attendre. Dégager deux allées jusqu’à la porte et réserver les couvertures aux enfants. Les caisses contre le mur ne seront ouvertes qu’en présence d’un responsable.",
      "room": "stores",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a13",
      "title": "Deux circuits",
      "text": "Les départs habitat et médical partagent encore un relais. En cas de surcharge, couper les appareils non essentiels avant de réarmer. Un deuxième claquement signifie qu’il faut laisser le coupe-circuit ouvert.",
      "room": "power",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a14",
      "title": "Sous les logements",
      "text": "La vanne de retour résiste à froid. Ne pas la forcer tant que le manomètre indique une différence de pression. On a besoin d’eau, pas d’une galerie noyée.",
      "room": "pump",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a15",
      "title": "Intervention interrompue",
      "text": "Balisage incomplet sur la piste. Rester du même côté des piquets au retour. La tempête efface les traces de roues en quelques minutes.",
      "room": "processor6",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a16",
      "title": "Une coque étrangère",
      "text": "Le métal n’a pas la couleur du métal. Les arches se poursuivent au-delà du faisceau et la radio ne tient plus. Balise posée près du seuil. Ne pas déplacer le tracteur sans prévenir.",
      "room": "derelict",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a17",
      "title": "Signaux immobiles",
      "text": "Plusieurs balises répondent sous le processeur. Aucun déplacement depuis la dernière lecture. Garder une distance avec les parois et ne pas rompre le contact radio.",
      "room": "hive",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a18",
      "title": "Aucun trophée",
      "text": "Repli par le refroidissement. Les lampes portatives indiquent la sortie, pas les embranchements. Si une lampe s’éteint, revenir vers la précédente plutôt que suivre un bruit.",
      "room": "coolant",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a19",
      "title": "Accès réservé",
      "text": "Embarquement scientifique réservé. Réservoirs vérifiés. Le code d’accès ne doit pas être communiqué sur le réseau général. Un officier de service conteste la restriction ; demande en attente.",
      "room": "hangar",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a20",
      "title": "Quatre sièges occupés",
      "text": "Brackett. Paris. Mori. Luisa. Quatre présences à bord. Le sas est fermé. La liste n’est pas celle que nous espérions remplir.",
      "room": "shuttle",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a21",
      "title": "La petite cache",
      "text": "La couverture reste au fond. On peut voir le couloir sans coller les yeux à la grille. Quand les pas s’arrêtent, attendre encore. Toujours attendre encore.",
      "room": "refuge",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a22",
      "title": "L’eau du lendemain",
      "text": "L’eau coule moins fort à cet évier. Ne pas ouvrir le robinet entièrement. Une bouteille pleine tient dans le passage si on la pousse devant soi.",
      "room": "wash",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a23",
      "title": "Ligne sans réponse",
      "text": "Relais alimenté, aucune réponse. Les contrôles locaux sont bons. Répéter l’appel à intervalle court et conserver chaque tentative dans la mémoire de secours.",
      "room": "relay",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a24",
      "title": "Dernière réserve",
      "text": "Dernier relevé des réserves. Les trousses emportées ne seront pas remplacées avant réapprovisionnement. Signaler un tiroir vide au lieu de le refermer comme si de rien n’était.",
      "room": "clinic_store",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a25",
      "title": "Relève de cuisine",
      "room": "pantry",
      "text": "Les repas du matin restent sur le tableau, même quand le réfectoire se vide. Le personnel a laissé une poignée de rechange côté cuisine pour ne plus emprunter les couloirs publics.",
      "source": "Original — annexe de jeu, pas un extrait du roman",
      "optionalJob": "pantry"
    },
    {
      "id": "a26",
      "title": "Pièces de rechange",
      "room": "biomed",
      "text": "Un moniteur en panne ne doit pas condamner tout un lit. Les composants compatibles sont stockés dans la réserve, à portée de l’équipe de garde.",
      "source": "Original — annexe de jeu, pas un extrait du roman",
      "optionalJob": "biomed"
    },
    {
      "id": "a27",
      "title": "Ligne intérieure",
      "room": "aerial",
      "text": "L’émetteur rétabli ne porte pas au-delà de la colonie. Il ne promet ni secours ni évacuation : il remet seulement les deux cages d’escalier en communication.",
      "source": "Original — annexe de jeu, pas un extrait du roman",
      "optionalJob": "aerial"
    },
    {
      "id": "a28",
      "title": "Ne pas laisser sous charge",
      "room": "workshop",
      "text": "Quand le moteur de levage s’arrête, soulager le contrepoids avant toute intervention. Le passage de service reste un chemin de maintenance, pas une voie pour le tracteur.",
      "source": "Original — annexe de jeu, pas un extrait du roman",
      "optionalJob": "workshop"
    },
    {
      "id": "a29",
      "title": "La conduite qui revient",
      "room": "drain",
      "text": "Deux repères jaunes identifient le retour vers les cuves fermées. Cette dérivation permet d’éviter les soubassements. Ne jamais ouvrir un réservoir à l’air libre.",
      "source": "Original — annexe de jeu, pas un extrait du roman",
      "optionalJob": "drain"
    },
    {
      "id": "a30",
      "title": "Le ruban noué",
      "room": "nest",
      "text": "Un nœud au ras du sol, puis deux au prochain embranchement. On peut retrouver le passage avec les doigts quand la lumière s’éteint. Personne n’a écrit de nom sur le ruban.",
      "source": "Original — annexe de jeu, pas un extrait du roman",
      "optionalJob": "nest"
    },
    {
      "id": "a31",
      "title": "Râtelier sous scellés",
      "room": "armory",
      "text": "Les compartiments sont séparés. Inscrire le prélèvement avant de partir ; le râtelier ne sera pas réapprovisionné au prochain passage.",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a32",
      "title": "La courbe intérieure",
      "room": "derelict_gallery",
      "text": "Les nervures se rejoignent au-dessus de la marche. Le retour est au même seuil ; ne pas confondre un renfoncement dans la coque et un chemin.",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a33",
      "title": "Le poste immobile",
      "room": "pilot_chamber",
      "text": "Le relief central n’est pas une console coloniale. Observer depuis la bande dégagée ; ne rien arracher au siège.",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    },
    {
      "id": "a34",
      "title": "Sous la chambre",
      "room": "egg_vault",
      "text": "La corde de reconstitution rejoint le palier supérieur. La brume cache le fond ; les ovoides de cette scène ne sont pas des objets à récolter.",
      "origin": "texte_original_de_codex",
      "sourceStatus": "interpretation_de_game_design"
    }
  ],
  "sources": [
    {
      "id": "S1",
      "title": "Titan Books — Alien: River of Pain",
      "url": "https://titanbooks.com/6486-alien-river-of-pain-book-3/",
      "type": "editeur",
      "use": "Auteur, prémisse, colonie, famille Jorden, garnison, épave"
    },
    {
      "id": "S2",
      "title": "Audible France — ALIEN Audible Original",
      "url": "https://www.audible.fr/series/ALIEN-Audible-Original-Livres-Audio/B07MXJYR1P",
      "type": "editeur_audio",
      "use": "Titre français Le Fleuve des souffrances ; distinguer adaptation sonore et roman"
    },
    {
      "id": "S3",
      "title": "Christopher Golden — entretien AvPGalaxy",
      "url": "https://www.avpgalaxy.net/website/interviews/christopher-golden/",
      "type": "entretien_auteur",
      "use": "Intention de prélude à Aliens et liens avec les récits préexistants"
    },
    {
      "id": "S4",
      "title": "AvP Central — Demian Brackett",
      "url": "https://www.avpcentral.com/demian-brackett",
      "type": "source_secondaire",
      "use": "Brackett, Paris, Mori, Luisa ; issue distincte du sort de Newt, navette distincte de l’Onager ; à recouper sur le roman intégral"
    },
    {
      "id": "S5",
      "title": "AvP Central — Hadley’s Hope colonists",
      "url": "https://www.avpcentral.com/hadleys-hope-colonists",
      "type": "source_secondaire",
      "use": "Identification des personnages secondaires ; ne pas fusionner médecins et Draper de continuités différentes"
    },
    {
      "id": "R1",
      "title": "Titan Books / Daily Dead — extrait autorisé, chapitres Rebecca et Arrivals",
      "url": "https://dailydead.com/read-exclusive-excerpt-alien-river-pain/",
      "type": "texte_primaire_extrait_autorise",
      "use": "Anne, Komiskey, matériel médical ; secteurs hors-colonie identifiés, pas roman intégral."
    },
    {
      "id": "R2",
      "title": "Christopher Golden — entretien auteur, 30 octobre 2014",
      "url": "https://www.avpgalaxy.net/website/interviews/christopher-golden/",
      "type": "entretien_primaire",
      "use": "Intérieur de l’épave, groupes du récit ; pas de plan coté."
    },
    {
      "id": "R3",
      "title": "NECA — Rescuing Newt, figurines sous licence",
      "url": "https://necaonline.com/2016/08/aliens-30th-anniversary-rescuing-newt-deluxe-action-figure-2-pack/",
      "type": "reference_visuelle_sous_licence",
      "use": "Silhouette filmique de Newt ; objets de scènes ultérieures exclus."
    },
    {
      "id": "R4",
      "title": "Propstore — accessoire M240 employé dans Aliens",
      "url": "https://propstore.com/product/aliens-1986/19-ellen-ripleys-sigourney-weaver-practical-special-effects-m240-flamethrower/",
      "type": "accessoire_de_production",
      "use": "Silhouette et nom M240 ; pas une preuve de dotation de Hadley’s Hope dans le roman."
    }
  ],
  "boards": {
    "grid": {
      "title": "Départ du bloc habitat",
      "kind": "power",
      "circuit": "habitat",
      "capacity": 4,
      "channels": [
        [
          "Chauffage",
          3,
          true
        ],
        [
          "Éclairage des logements",
          1,
          true
        ],
        [
          "Buanderie",
          2,
          false
        ]
      ],
      "hint": "Alimentez le chauffage et les logements. La buanderie peut attendre.",
      "id": "grid",
      "room": "power",
      "initial": [
        false,
        false,
        true
      ]
    },
    "shelter": {
      "title": "Tableau du refuge provisoire",
      "kind": "power",
      "circuit": "industry",
      "capacity": 3,
      "channels": [
        [
          "Éclairage du refuge",
          1,
          true
        ],
        [
          "Ventilation du refuge",
          2,
          true
        ],
        [
          "Treuil de fret",
          3,
          false
        ]
      ],
      "hint": "Gardez la lumière et l’air. Le treuil doit rester coupé.",
      "id": "shelter",
      "room": "stores",
      "initial": [
        false,
        false,
        true
      ]
    },
    "emergency": {
      "title": "Secours de la maintenance",
      "kind": "power",
      "circuit": "industry",
      "capacity": 4,
      "channels": [
        [
          "Pompes de circulation",
          2,
          true
        ],
        [
          "Éclairage des paliers",
          2,
          true
        ],
        [
          "Atelier des prospecteurs",
          3,
          false
        ]
      ],
      "hint": "Répartissez la réserve entre les pompes et les paliers.",
      "id": "emergency",
      "room": "power",
      "initial": [
        false,
        false,
        true
      ]
    },
    "last_power": {
      "title": "Dernière réserve du bureau",
      "kind": "power",
      "circuit": "habitat",
      "capacity": 2,
      "channels": [
        [
          "Verrou de la porte",
          1,
          true
        ],
        [
          "Balise du conduit",
          1,
          true
        ],
        [
          "Radio générale",
          2,
          false
        ]
      ],
      "hint": "Le verrou et la balise. Rien d’autre ne doit tirer sur cette batterie.",
      "id": "last_power",
      "room": "survey",
      "initial": [
        false,
        false,
        true
      ]
    },
    "pressure": {
      "title": "Collecteur du processeur six",
      "kind": "valve",
      "circuit": "industry",
      "capacity": 2,
      "channels": [
        [
          "Arrivée principale",
          1,
          false
        ],
        [
          "Purge protégée",
          1,
          true
        ],
        [
          "Dérivation de secours",
          1,
          true
        ]
      ],
      "hint": "Fermez l’arrivée principale, ouvrez la purge et la dérivation.",
      "id": "pressure",
      "room": "processor6",
      "initial": [
        true,
        false,
        false
      ]
    },
    "reroute": {
      "title": "Collecteur de la station de pompage",
      "kind": "valve",
      "circuit": "industry",
      "capacity": 2,
      "channels": [
        [
          "Conduite du passage",
          1,
          false
        ],
        [
          "Retour au réservoir",
          1,
          true
        ],
        [
          "Soupape de sécurité",
          1,
          true
        ]
      ],
      "hint": "Isolez le passage, puis ouvrez le retour et la soupape.",
      "id": "reroute",
      "room": "pump",
      "initial": [
        true,
        false,
        false
      ]
    }
  },
  "hazards": [
    {
      "id": "jet-processor6",
      "room": "processor6",
      "x": 2350,
      "z": 0.82,
      "period": 6,
      "activeFor": 2.1,
      "disableFlag": "pressure",
      "damage": 12
    },
    {
      "id": "jet-pump",
      "room": "pump",
      "x": 1870,
      "z": 0.82,
      "period": 6.8,
      "activeFor": 2.0,
      "disableFlag": "reroute",
      "damage": 10
    }
  ],
  "circuits": {
    "habitat": {
      "label": "Habitat",
      "minPhase": 2
    },
    "medical": {
      "label": "Médical",
      "minPhase": 3
    },
    "research": {
      "label": "Recherche",
      "minPhase": 3
    },
    "industry": {
      "label": "Maintenance",
      "minPhase": 2
    },
    "perimeter": {
      "label": "Périmètre",
      "minPhase": 9
    }
  },
  "doorTasks": {
    "quarantine": [
      "isolation",
      "med"
    ],
    "barricade": [
      "survey",
      "garage"
    ],
    "withdraw": [
      "power",
      "coolant"
    ],
    "vent_open": [
      "survey",
      "vent_survey"
    ]
  },
  "jobs": [
    {
      "id": "pantry",
      "title": "La porte du personnel",
      "childOnly": false,
      "adultOnly": true,
      "room": "pantry",
      "item": "Poignée de service",
      "steps": [
        {
          "room": "pantry",
          "id": "job-pantry-inspect",
          "label": "Examiner · La porte du personnel",
          "x": 470,
          "z": 0.81,
          "description": "Le passage du personnel a perdu sa poignée. Une pièce de rechange attend près de la cuisine.",
          "duration": 0.6
        },
        {
          "room": "mess",
          "id": "job-pantry-part",
          "label": "Récupérer la poignée de rechange",
          "x": 390,
          "z": 0.28,
          "description": "Emporter poignée de service.",
          "duration": 0.9
        },
        {
          "room": "pantry",
          "id": "job-pantry-release",
          "label": "Ajuster la poignée et libérer l’escalier",
          "x": 1630,
          "z": 0.81,
          "description": "Accès direct vers la coursive résidentielle",
          "duration": 2.0
        }
      ],
      "flag": "service-pantry",
      "reward": "medkit",
      "rewardLabel": "Accès direct vers la coursive résidentielle",
      "archive": "a25"
    },
    {
      "id": "biomed",
      "title": "L’atelier de garde",
      "childOnly": false,
      "adultOnly": true,
      "room": "biomed",
      "item": "Contacteur biomédical",
      "steps": [
        {
          "room": "biomed",
          "id": "job-biomed-inspect",
          "label": "Examiner · L’atelier de garde",
          "x": 470,
          "z": 0.81,
          "description": "Le verrou de la porte de réserve ne répond plus. Le contacteur se trouve dans le tiroir de maintenance médicale.",
          "duration": 0.6
        },
        {
          "room": "clinic_store",
          "id": "job-biomed-part",
          "label": "Prendre le contacteur de réserve",
          "x": 720,
          "z": 0.7,
          "description": "Emporter contacteur biomédical.",
          "duration": 0.9
        },
        {
          "room": "biomed",
          "id": "job-biomed-release",
          "label": "Remplacer le contacteur et libérer la réserve",
          "x": 1980,
          "z": 0.81,
          "description": "Boucle directe vers la réserve médicale",
          "duration": 2.0
        }
      ],
      "flag": "service-biomed",
      "reward": "medkit",
      "rewardLabel": "Boucle directe vers la réserve médicale",
      "archive": "a26"
    },
    {
      "id": "aerial",
      "title": "Une fréquence dans le vent",
      "childOnly": false,
      "adultOnly": true,
      "room": "aerial",
      "item": "Coupleur radio",
      "steps": [
        {
          "room": "aerial",
          "id": "job-aerial-inspect",
          "label": "Examiner · Une fréquence dans le vent",
          "x": 470,
          "z": 0.81,
          "description": "La liaison interne de la terrasse est débranchée. Un coupleur compatible a été rangé avec les bandes du relais.",
          "duration": 0.6
        },
        {
          "room": "records",
          "id": "job-aerial-part",
          "label": "Retrouver le coupleur de transmission",
          "x": 1050,
          "z": 0.7,
          "description": "Emporter coupleur radio.",
          "duration": 0.9
        },
        {
          "room": "aerial",
          "id": "job-aerial-release",
          "label": "Raccorder la liaison et libérer le palier",
          "x": 2230,
          "z": 0.81,
          "description": "Retour vers le contrôle colonial",
          "duration": 2.0
        }
      ],
      "flag": "service-aerial",
      "reward": "battery",
      "rewardLabel": "Retour vers le contrôle colonial",
      "archive": "a27"
    },
    {
      "id": "workshop",
      "title": "Le palan immobilisé",
      "childOnly": false,
      "adultOnly": true,
      "room": "workshop",
      "item": "Chaîne de palan",
      "steps": [
        {
          "room": "workshop",
          "id": "job-workshop-inspect",
          "label": "Examiner · Le palan immobilisé",
          "x": 470,
          "z": 0.81,
          "description": "Le rideau de service bloque la galerie. Une chaîne de rechange est suspendue dans le garage des prospecteurs.",
          "duration": 0.6
        },
        {
          "room": "garage",
          "id": "job-workshop-part",
          "label": "Décrocher la chaîne d’entraînement",
          "x": 450,
          "z": 0.28,
          "description": "Emporter chaîne de palan.",
          "duration": 0.9
        },
        {
          "room": "workshop",
          "id": "job-workshop-release",
          "label": "Remonter la chaîne et lever le rideau",
          "x": 2530,
          "z": 0.81,
          "description": "Galerie couverte vers le processeur six",
          "duration": 2.0
        }
      ],
      "flag": "service-workshop",
      "reward": "flare",
      "rewardLabel": "Galerie couverte vers le processeur six",
      "archive": "a28"
    },
    {
      "id": "drain",
      "title": "Le retour des eaux",
      "childOnly": false,
      "adultOnly": true,
      "room": "drain",
      "item": "Clé de collecteur",
      "steps": [
        {
          "room": "drain",
          "id": "job-drain-inspect",
          "label": "Examiner · Le retour des eaux",
          "x": 470,
          "z": 0.81,
          "description": "La grille de la dérivation est verrouillée. La clé du collecteur a été déposée au tableau électrique.",
          "duration": 0.6
        },
        {
          "room": "power",
          "id": "job-drain-part",
          "label": "Récupérer la clé du collecteur",
          "x": 1950,
          "z": 0.28,
          "description": "Emporter clé de collecteur.",
          "duration": 0.9
        },
        {
          "room": "drain",
          "id": "job-drain-release",
          "label": "Ouvrir le retour et libérer la grille",
          "x": 2380,
          "z": 0.81,
          "description": "Échelle vers la galerie du refroidissement",
          "duration": 2.0
        }
      ],
      "flag": "service-drain",
      "reward": "battery",
      "rewardLabel": "Échelle vers la galerie du refroidissement",
      "archive": "a29"
    },
    {
      "id": "nest",
      "title": "Le fil qui revient",
      "childOnly": true,
      "adultOnly": false,
      "room": "nest",
      "item": "Ruban de repérage",
      "steps": [
        {
          "room": "nest",
          "id": "job-nest-inspect",
          "label": "Examiner · Le fil qui revient",
          "x": 470,
          "z": 0.7,
          "description": "Un fil usé rejoint la petite grille. Un ruban neuf permettrait de la tirer sans se coincer les doigts.",
          "duration": 0.6
        },
        {
          "room": "vent_hab",
          "id": "job-nest-part",
          "label": "Retrouver le ruban de Tim",
          "x": 1670,
          "z": 0.7,
          "description": "Emporter ruban de repérage.",
          "duration": 0.9
        },
        {
          "room": "nest",
          "id": "job-nest-release",
          "label": "Nouer le ruban et soulever la petite grille",
          "x": 1480,
          "z": 0.7,
          "description": "Passage direct vers la cache des conduits",
          "duration": 2.0
        }
      ],
      "flag": "service-nest",
      "reward": "food",
      "rewardLabel": "Passage direct vers la cache des conduits",
      "archive": "a30"
    }
  ],
  "encounters": [
    {
      "id": "workshop-hatch",
      "room": "workshop",
      "minPhase": 2,
      "triggerX": 1400,
      "spawnX": 2800,
      "spawnZ": 0.7,
      "kind": "adult",
      "warning": 3.2,
      "label": "La trappe du fond se déforme. Écartez-vous de l’axe.",
      "type": "intrusion"
    },
    {
      "id": "biomed-cabinet",
      "room": "biomed",
      "minPhase": 2,
      "triggerX": 1080,
      "spawnX": 2250,
      "spawnZ": 0.7,
      "kind": "facehugger",
      "warning": 3.0,
      "label": "Un bruit sec derrière la cloison de l’atelier.",
      "type": "intrusion"
    },
    {
      "id": "drain-return",
      "room": "drain",
      "minPhase": 2,
      "triggerX": 1230,
      "spawnX": 2660,
      "spawnZ": 0.7,
      "kind": "adult",
      "warning": 3.5,
      "label": "Quelque chose heurte la grille au bout de la passerelle.",
      "type": "intrusion"
    },
    {
      "id": "nest-shadow",
      "room": "nest",
      "minPhase": 1,
      "triggerX": 1030,
      "spawnX": 1570,
      "spawnZ": 0.7,
      "warning": 4,
      "label": "Une ombre passe derrière la grille. Elle ne peut pas entrer ici.",
      "type": "shadow"
    },
    {
      "id": "aerial-wind",
      "room": "aerial",
      "minPhase": 0,
      "triggerX": 1150,
      "spawnX": 2150,
      "spawnZ": 0.7,
      "warning": 4.2,
      "label": "Le mât grince. La passerelle tient, mais le vent couvre les pas.",
      "type": "sound"
    },
    {
      "id": "pantry-tap",
      "room": "pantry",
      "minPhase": 1,
      "triggerX": 1030,
      "spawnX": 1720,
      "spawnZ": 0.7,
      "warning": 3.5,
      "label": "Dans la cuisine vide, la vaisselle vibre au rythme de la ventilation.",
      "type": "sound"
    }
  ],
  "passageDoctrine": {
    "spatialScope": "one adjacent room; no global AI",
    "travel": "timed animated connectors; no free continuous shaft",
    "listen": "1.6 seconds exposed; silence not a safety guarantee",
    "storage": "two locally verified slots; old key kept"
  },
  "life": {
    "residents": [
      {
        "id": "vale",
        "name": "Iona Vale",
        "role": "Maintenance de l’habitat",
        "room": "hab",
        "minPhase": 0,
        "maxPhase": 1,
        "height": 93,
        "color": "#658b89",
        "skin": "#b48664",
        "hair": "short",
        "tool": "tools",
        "points": [
          {
            "x": 590,
            "z": 0.7
          },
          {
            "x": 830,
            "z": 0.7
          },
          {
            "x": 410,
            "z": 0.7
          }
        ],
        "refuge": {
          "x": 410,
          "z": 0.7
        },
        "intro": [
          "Le chauffage finit toujours par gagner contre les coupe-circuits. Jusqu’au prochain quart.",
          "J’ai fermé deux logements vides pour garder les autres au chaud. Je n’aime pas ce silence derrière les portes."
        ],
        "topics": [
          {
            "id": "work",
            "label": "Votre poste et votre matériel",
            "text": "Les plaques jaunes suivent le départ habitat. Le tableau est en bas, après le magasin de fret. Ne réarmez pas tout ensemble."
          },
          {
            "id": "route",
            "label": "Les passages du secteur",
            "text": "L’escalier du personnel débouche près de la cuisine. Sa poignée manque : la relève l’a laissée au réfectoire."
          }
        ],
        "origin": "original_gameplay_resident"
      },
      {
        "id": "rhee",
        "name": "Malik Rhee",
        "role": "Cuisine collective",
        "room": "mess",
        "minPhase": 0,
        "maxPhase": 1,
        "height": 96,
        "color": "#ab9066",
        "skin": "#755340",
        "hair": "cap",
        "tool": "mug",
        "points": [
          {
            "x": 1150,
            "z": 0.84
          },
          {
            "x": 1390,
            "z": 0.84
          },
          {
            "x": 970,
            "z": 0.84
          }
        ],
        "refuge": {
          "x": 970,
          "z": 0.84
        },
        "intro": [
          "Le café est tiède, mais il est là. Aujourd’hui, c’est une réussite.",
          "Je prépare des portions froides. Quand les gens restent près de l’infirmerie, ils oublient de manger."
        ],
        "topics": [
          {
            "id": "work",
            "label": "Votre poste et votre matériel",
            "text": "Les rations de service sont dans la caisse grise. Prenez seulement ce qui vous manque : personne ne la remplit entre deux passages."
          },
          {
            "id": "route",
            "label": "Les passages du secteur",
            "text": "L’office a un autre accès vers l’habitat. Regardez le mécanisme avant de partir chercher sa pièce."
          }
        ],
        "origin": "original_gameplay_resident"
      },
      {
        "id": "arden",
        "name": "Vera Arden",
        "role": "Soins de proximité",
        "room": "med",
        "minPhase": 0,
        "maxPhase": 1,
        "height": 99,
        "color": "#b2c6ba",
        "skin": "#d3ad8d",
        "hair": "tied",
        "tool": "tablet",
        "points": [
          {
            "x": 1750,
            "z": 0.84
          },
          {
            "x": 1990,
            "z": 0.84
          },
          {
            "x": 2110,
            "z": 0.84
          }
        ],
        "refuge": {
          "x": 2110,
          "z": 0.84
        },
        "intro": [
          "Posez les caisses près du mur. L’allée entre les lits doit rester libre.",
          "On nous apporte des questions à chaque porte. J’aurais préféré des couvertures propres."
        ],
        "topics": [
          {
            "id": "work",
            "label": "Votre poste et votre matériel",
            "text": "Une trousse emportée n’est plus disponible dans le tiroir. Les réserves de cet atelier sont limitées, même si vous revenez avec un autre uniforme."
          },
          {
            "id": "route",
            "label": "Les passages du secteur",
            "text": "L’atelier biomédical rejoint la réserve. Le contacteur du verrou est à remplacer ; ne comptez pas sur cette porte avant la réparation."
          }
        ],
        "origin": "original_gameplay_resident"
      },
      {
        "id": "becker",
        "name": "Arun Becker",
        "role": "Archivage des relevés",
        "room": "records",
        "minPhase": 0,
        "maxPhase": 1,
        "height": 102,
        "color": "#7385a0",
        "skin": "#976b53",
        "hair": "short",
        "tool": "tablet",
        "points": [
          {
            "x": 590,
            "z": 0.7
          },
          {
            "x": 830,
            "z": 0.7
          },
          {
            "x": 410,
            "z": 0.7
          }
        ],
        "refuge": {
          "x": 410,
          "z": 0.7
        },
        "intro": [
          "La machine a perdu une ligne. La feuille papier, elle, n’a pas bougé.",
          "Je garde une copie locale de chaque message. Ce qui disparaît du réseau ne devrait pas disparaître de nos souvenirs."
        ],
        "topics": [
          {
            "id": "work",
            "label": "Votre poste et votre matériel",
            "text": "Les documents trouvés restent dans votre carnet. Mes échanges restent dans le registre des personnes rencontrées, pas dans le compteur des notes."
          },
          {
            "id": "route",
            "label": "Les passages du secteur",
            "text": "Un coupleur de la terrasse a été rangé ici. Il concerne la liaison intérieure, pas un appel vers un vaisseau."
          }
        ],
        "origin": "original_gameplay_resident"
      },
      {
        "id": "ferris",
        "name": "Solène Ferris",
        "role": "Manutention du fret",
        "room": "stores",
        "minPhase": 0,
        "maxPhase": 1,
        "height": 93,
        "color": "#b59258",
        "skin": "#aa7558",
        "hair": "cap",
        "tool": "tools",
        "points": [
          {
            "x": 1330,
            "z": 0.84
          },
          {
            "x": 1570,
            "z": 0.84
          },
          {
            "x": 1150,
            "z": 0.84
          }
        ],
        "refuge": {
          "x": 1150,
          "z": 0.84
        },
        "intro": [
          "Chaque palette a sa place. C’est quand on les empile devant les issues que ça devient dangereux.",
          "J’ai dégagé les allées. Les couvertures sont sur le côté, pas sous les charges."
        ],
        "topics": [
          {
            "id": "work",
            "label": "Votre poste et votre matériel",
            "text": "Les coffres gardent ce que vous y laissez. Un fermoir ouvert reste ouvert ; inutile de recommencer la fouille."
          },
          {
            "id": "route",
            "label": "Les passages du secteur",
            "text": "Le garage mène à l’atelier de manutention. Le palan est immobilisé. La chaîne de rechange n’est pas ici, elle est au garage."
          }
        ],
        "origin": "original_gameplay_resident"
      },
      {
        "id": "corban",
        "name": "Nils Corban",
        "role": "Relais des transmissions",
        "room": "relay",
        "minPhase": 0,
        "maxPhase": 1,
        "height": 96,
        "color": "#648995",
        "skin": "#c7a486",
        "hair": "short",
        "tool": "tablet",
        "points": [
          {
            "x": 1310,
            "z": 0.7
          },
          {
            "x": 1550,
            "z": 0.7
          },
          {
            "x": 1130,
            "z": 0.7
          }
        ],
        "refuge": {
          "x": 1130,
          "z": 0.7
        },
        "intro": [
          "Le vent fait chanter les haubans avant qu’on l’entende dans les fenêtres.",
          "Le réseau intérieur tient par intermittence. Je note les silences aussi soigneusement que les réponses."
        ],
        "topics": [
          {
            "id": "work",
            "label": "Votre poste et votre matériel",
            "text": "La terrasse sert aux liaisons de la colonie. Un voyant vert ici ne signifie pas que quelqu’un nous a entendus ailleurs."
          },
          {
            "id": "route",
            "label": "Les passages du secteur",
            "text": "L’antenne a un palier vers le contrôle colonial. Tant que le coupleur manque, l’accès de service reste condamné."
          }
        ],
        "origin": "original_gameplay_resident"
      },
      {
        "id": "hale",
        "name": "Ezra Hale",
        "role": "Atelier des prospecteurs",
        "room": "garage",
        "minPhase": 0,
        "maxPhase": 1,
        "height": 99,
        "color": "#aa7961",
        "skin": "#83604e",
        "hair": "cap",
        "tool": "tools",
        "points": [
          {
            "x": 1050,
            "z": 0.84
          },
          {
            "x": 1290,
            "z": 0.84
          },
          {
            "x": 870,
            "z": 0.84
          }
        ],
        "refuge": {
          "x": 870,
          "z": 0.84
        },
        "intro": [
          "Ne passez pas sous le palan. À l’arrêt, une machine reste une machine lourde.",
          "Le tracteur est prêt, mais la piste n’a jamais été une promenade. Gardez les balises du même côté au retour."
        ],
        "topics": [
          {
            "id": "work",
            "label": "Votre poste et votre matériel",
            "text": "Un boîtier, un fil et une pile font une balise sonore sur un établi. Elle n’explose pas. Il faut la poser puis s’éloigner avant ses bips."
          },
          {
            "id": "route",
            "label": "Les passages du secteur",
            "text": "Le bruit peut détourner une créature qui vous a perdu. Il ne lui fera pas oublier quelqu’un qu’elle voit déjà."
          }
        ],
        "origin": "original_gameplay_resident"
      },
      {
        "id": "doran",
        "name": "Mei Doran",
        "role": "Maintenance biomédicale",
        "room": "biomed",
        "minPhase": 0,
        "maxPhase": 1,
        "height": 102,
        "color": "#85a59b",
        "skin": "#d0ab89",
        "hair": "tied",
        "tool": "tablet",
        "points": [
          {
            "x": 950,
            "z": 0.84
          },
          {
            "x": 1190,
            "z": 0.84
          },
          {
            "x": 770,
            "z": 0.84
          }
        ],
        "refuge": {
          "x": 770,
          "z": 0.84
        },
        "intro": [
          "Il manque toujours une pièce. Aujourd’hui, au moins, je sais laquelle.",
          "J’ai séparé les pièces réparables des appareils contaminés. Regardez les étiquettes avant de toucher."
        ],
        "topics": [
          {
            "id": "work",
            "label": "Votre poste et votre matériel",
            "text": "L’établi peut assembler une balise sonore ou utiliser une pile pour la lampe. Les composants ne sont consommés qu’à la fin de la manœuvre."
          },
          {
            "id": "route",
            "label": "Les passages du secteur",
            "text": "Le travail au banc reste exposé. Éloignez-vous ou interrompez-vous plutôt que terminer coûte que coûte sous une attaque."
          }
        ],
        "origin": "original_gameplay_resident"
      },
      {
        "id": "sato",
        "name": "Lina Sato",
        "role": "Lingerie de service",
        "room": "wash",
        "minPhase": 0,
        "maxPhase": 1,
        "height": 93,
        "color": "#958799",
        "skin": "#bd9172",
        "hair": "tied",
        "tool": "linen",
        "points": [
          {
            "x": 1310,
            "z": 0.84
          },
          {
            "x": 1550,
            "z": 0.84
          },
          {
            "x": 1130,
            "z": 0.84
          }
        ],
        "refuge": {
          "x": 1130,
          "z": 0.84
        },
        "intro": [
          "Les draps propres sont à gauche. Ceux qui attendent leur étiquette ne partent nulle part.",
          "On demande plus de linge à l’infirmerie. J’attends qu’on me dise quelle porte garder fermée."
        ],
        "topics": [
          {
            "id": "work",
            "label": "Votre poste et votre matériel",
            "text": "Vous pouvez ouvrir un fermoir lentement, ou le forcer plus vite. Le bruit du second choix n’est pas seulement une animation."
          },
          {
            "id": "route",
            "label": "Les passages du secteur",
            "text": "Les coursives mènent aux logements. Une porte de logement dessinée sur un panneau n’est pas forcément une issue praticable."
          }
        ],
        "origin": "original_gameplay_resident"
      },
      {
        "id": "bell",
        "name": "Tomas Bell",
        "role": "Entretien des loisirs",
        "room": "recreation",
        "minPhase": 0,
        "maxPhase": 1,
        "height": 96,
        "color": "#82985e",
        "skin": "#d6b99a",
        "hair": "short",
        "tool": "tools",
        "points": [
          {
            "x": 790,
            "z": 0.84
          },
          {
            "x": 1030,
            "z": 0.84
          },
          {
            "x": 610,
            "z": 0.84
          }
        ],
        "refuge": {
          "x": 610,
          "z": 0.84
        },
        "intro": [
          "Le jeu de droite redémarre tout seul. Je lui accorde encore une chance.",
          "Les machines sont coupées. On entend les conversations du couloir sans avoir besoin de hausser la voix."
        ],
        "topics": [
          {
            "id": "work",
            "label": "Votre poste et votre matériel",
            "text": "Les pas pressés couvrent les petits bruits. Pour écouter à une porte, restez immobile et laissez retomber votre propre vacarme."
          },
          {
            "id": "route",
            "label": "Les passages du secteur",
            "text": "Les enfants connaissent les conduits. Ce n’est pas un accès de secours pour un adulte chargé de matériel."
          }
        ],
        "origin": "original_gameplay_resident"
      },
      {
        "id": "kent",
        "name": "Rosa Kent",
        "role": "Accueil des arrivants",
        "room": "concourse",
        "minPhase": 0,
        "maxPhase": 1,
        "height": 99,
        "color": "#9b8464",
        "skin": "#8e634c",
        "hair": "tied",
        "tool": "tablet",
        "points": [
          {
            "x": 1010,
            "z": 0.84
          },
          {
            "x": 1250,
            "z": 0.84
          },
          {
            "x": 830,
            "z": 0.84
          }
        ],
        "refuge": {
          "x": 830,
          "z": 0.84
        },
        "intro": [
          "Les nouveaux cherchent les bureaux. Les habitués cherchent la cafetière.",
          "Je répète les dernières consignes tant que le haut-parleur répond. Après, il faudra parler aux gens un par un."
        ],
        "topics": [
          {
            "id": "work",
            "label": "Votre poste et votre matériel",
            "text": "Le plan vous aide à choisir une porte, pas à voyager à sa place. Les niveaux sont reliés par les vrais accès de la colonie."
          },
          {
            "id": "route",
            "label": "Les passages du secteur",
            "text": "Les personnes du registre n’émettent pas de balise de suivi. Leur dernière position est un souvenir, pas une promesse de les y retrouver."
          }
        ],
        "origin": "original_gameplay_resident"
      },
      {
        "id": "voss",
        "name": "Anton Voss",
        "role": "Relevés des prospecteurs",
        "room": "survey",
        "minPhase": 0,
        "maxPhase": 1,
        "height": 102,
        "color": "#879aa3",
        "skin": "#c3a18a",
        "hair": "short",
        "tool": "tablet",
        "points": [
          {
            "x": 1170,
            "z": 0.84
          },
          {
            "x": 1410,
            "z": 0.84
          },
          {
            "x": 990,
            "z": 0.84
          }
        ],
        "refuge": {
          "x": 990,
          "z": 0.84
        },
        "intro": [
          "Le relief change de couleur à chaque éclaircie. Les coordonnées, elles, restent les mêmes.",
          "Les feuilles du secteur sont revenues couvertes de poussière. Les questions suivent plus vite que les réponses."
        ],
        "topics": [
          {
            "id": "work",
            "label": "Votre poste et votre matériel",
            "text": "Les caisses d’outillage contiennent des pièces utiles aux adultes. Les enfants ne prennent ni munitions ni balises sonores."
          },
          {
            "id": "route",
            "label": "Les passages du secteur",
            "text": "Un détour reste facultatif. Avant de réparer une issue, vérifiez de quel côté se trouve votre prochain objectif."
          }
        ],
        "origin": "original_gameplay_resident"
      }
    ],
    "containers": [
      {
        "id": "supply-arrivals",
        "label": "Casier de relève",
        "room": "concourse",
        "kind": "locker",
        "items": {
          "cell": 2,
          "wire": 1
        },
        "x": 1870,
        "z": 0.84
      },
      {
        "id": "supply-garrison",
        "label": "Mallette de terrain",
        "room": "briefing",
        "kind": "toolcase",
        "items": {
          "casing": 1,
          "wire": 1,
          "ammo": 18
        },
        "x": 1330,
        "z": 0.7
      },
      {
        "id": "supply-kitchen",
        "label": "Réserve de portions froides",
        "room": "mess",
        "kind": "foodcase",
        "items": {
          "ration": 2,
          "cell": 1
        },
        "x": 1690,
        "z": 0.84
      },
      {
        "id": "supply-habitat",
        "label": "Tiroir du logement",
        "room": "jorden",
        "kind": "drawer",
        "items": {
          "ration": 1,
          "medkit": 1
        },
        "x": 1310,
        "z": 0.84
      },
      {
        "id": "supply-medical",
        "label": "Coffret de soins",
        "room": "med",
        "kind": "medical",
        "items": {
          "medkit": 2,
          "cell": 1
        },
        "x": 490,
        "z": 0.84
      },
      {
        "id": "supply-biomedical",
        "label": "Pièces de diagnostic",
        "room": "biomed",
        "kind": "toolcase",
        "items": {
          "cell": 1,
          "wire": 2,
          "casing": 1
        },
        "x": 1590,
        "z": 0.84
      },
      {
        "id": "supply-archive",
        "label": "Tiroir des transmissions",
        "room": "records",
        "kind": "drawer",
        "items": {
          "wire": 1,
          "casing": 1
        },
        "x": 1210,
        "z": 0.7
      },
      {
        "id": "supply-garage",
        "label": "Caisse des prospecteurs",
        "room": "garage",
        "kind": "toolcase",
        "items": {
          "cell": 2,
          "wire": 1,
          "casing": 2
        },
        "x": 1850,
        "z": 0.84
      },
      {
        "id": "supply-cargo",
        "label": "Coffre de dotation",
        "room": "stores",
        "kind": "locker",
        "items": {
          "flare": 2,
          "ammo": 24
        },
        "x": 1870,
        "z": 0.84
      },
      {
        "id": "supply-laundry",
        "label": "Panier de dépannage",
        "room": "wash",
        "kind": "foodcase",
        "items": {
          "ration": 1,
          "medkit": 1
        },
        "x": 1130,
        "z": 0.84
      },
      {
        "id": "supply-workshop",
        "label": "Mallette du palan",
        "room": "workshop",
        "kind": "toolcase",
        "items": {
          "wire": 2,
          "cell": 1,
          "casing": 1
        },
        "x": 1970,
        "z": 0.84
      },
      {
        "id": "supply-vent",
        "label": "Petite boîte oubliée",
        "room": "vent_hab",
        "kind": "foodcase",
        "items": {
          "ration": 2
        },
        "x": 1410,
        "z": 0.7
      }
    ],
    "benches": [
      {
        "id": "bench-garrison",
        "label": "Banc de préparation",
        "room": "briefing",
        "x": 1970,
        "z": 0.7
      },
      {
        "id": "bench-biomed",
        "label": "Établi biomédical",
        "room": "biomed",
        "x": 1810,
        "z": 0.84
      },
      {
        "id": "bench-workshop",
        "label": "Établi de maintenance",
        "room": "workshop",
        "x": 2310,
        "z": 0.84
      }
    ],
    "items": {
      "cell": {
        "label": "Pile de service",
        "capacity": 6
      },
      "wire": {
        "label": "Fil de raccordement",
        "capacity": 6
      },
      "casing": {
        "label": "Boîtier vide",
        "capacity": 4
      },
      "decoy": {
        "label": "Balise sonore",
        "capacity": 2
      },
      "ration": {
        "label": "Portion froide",
        "healing": 25
      },
      "medkit": {
        "label": "Trousse de soins",
        "capacity": 8
      },
      "ammo": {
        "label": "Munitions M41A",
        "capacity": 150
      },
      "flare": {
        "label": "Fusée de détresse",
        "capacity": 8
      }
    },
    "recipes": {
      "decoy": {
        "label": "Assembler une balise sonore",
        "cost": {
          "cell": 1,
          "wire": 1,
          "casing": 1
        },
        "duration": 2.4
      },
      "charge": {
        "label": "Recharger la lampe avec une pile",
        "cost": {
          "cell": 1
        },
        "duration": 1.6
      }
    }
  },
  "defense": {
    "shutters": [
      {
        "id": "shutter-concourse",
        "room": "concourse",
        "label": "Volet de la galerie",
        "x": 630,
        "z": 0.66,
        "w": 52,
        "d": 0.46,
        "height": 174,
        "controls": [
          {
            "x": 536,
            "z": 0.7
          },
          {
            "x": 724,
            "z": 0.7
          }
        ],
        "integrity": 100,
        "closeDuration": 2.6,
        "openDuration": 1.6,
        "childReleaseDuration": 1.1,
        "origin": "original_gameplay_equipment"
      },
      {
        "id": "shutter-hab",
        "room": "hab",
        "label": "Volet du bloc habitat",
        "x": 1090,
        "z": 0.7,
        "w": 52,
        "d": 0.1,
        "height": 174,
        "controls": [
          {
            "x": 996,
            "z": 0.7
          },
          {
            "x": 1184,
            "z": 0.7
          }
        ],
        "integrity": 100,
        "closeDuration": 2.6,
        "openDuration": 1.6,
        "childReleaseDuration": 1.1,
        "origin": "original_gameplay_equipment"
      },
      {
        "id": "shutter-med",
        "room": "med",
        "label": "Séparation médicale",
        "x": 470,
        "z": 0.66,
        "w": 52,
        "d": 0.46,
        "height": 174,
        "controls": [
          {
            "x": 376,
            "z": 0.7
          },
          {
            "x": 564,
            "z": 0.7
          }
        ],
        "integrity": 100,
        "closeDuration": 2.6,
        "openDuration": 1.6,
        "childReleaseDuration": 1.1,
        "origin": "original_gameplay_equipment"
      },
      {
        "id": "shutter-garage",
        "room": "garage",
        "label": "Rideau de manutention",
        "x": 2310,
        "z": 0.66,
        "w": 52,
        "d": 0.46,
        "height": 174,
        "controls": [
          {
            "x": 2216,
            "z": 0.7
          },
          {
            "x": 2404,
            "z": 0.7
          }
        ],
        "integrity": 100,
        "closeDuration": 2.6,
        "openDuration": 1.6,
        "childReleaseDuration": 1.1,
        "origin": "original_gameplay_equipment"
      },
      {
        "id": "shutter-stores",
        "room": "stores",
        "label": "Volet du magasin",
        "x": 450,
        "z": 0.66,
        "w": 52,
        "d": 0.46,
        "height": 174,
        "controls": [
          {
            "x": 356,
            "z": 0.7
          },
          {
            "x": 544,
            "z": 0.7
          }
        ],
        "integrity": 100,
        "closeDuration": 2.6,
        "openDuration": 1.6,
        "childReleaseDuration": 1.1,
        "origin": "original_gameplay_equipment"
      },
      {
        "id": "shutter-service",
        "room": "service",
        "label": "Volet technique",
        "x": 1710,
        "z": 0.7,
        "w": 52,
        "d": 0.1,
        "height": 174,
        "controls": [
          {
            "x": 1616,
            "z": 0.7
          },
          {
            "x": 1804,
            "z": 0.7
          }
        ],
        "integrity": 100,
        "closeDuration": 2.6,
        "openDuration": 1.6,
        "childReleaseDuration": 1.1,
        "origin": "original_gameplay_equipment"
      },
      {
        "id": "shutter-power",
        "room": "power",
        "label": "Séparation du répartiteur",
        "x": 1370,
        "z": 0.66,
        "w": 52,
        "d": 0.46,
        "height": 174,
        "controls": [
          {
            "x": 1276,
            "z": 0.7
          },
          {
            "x": 1464,
            "z": 0.7
          }
        ],
        "integrity": 100,
        "closeDuration": 2.6,
        "openDuration": 1.6,
        "childReleaseDuration": 1.1,
        "origin": "original_gameplay_equipment"
      },
      {
        "id": "shutter-hangar",
        "room": "hangar",
        "label": "Rideau du hangar",
        "x": 2370,
        "z": 0.66,
        "w": 52,
        "d": 0.46,
        "height": 174,
        "controls": [
          {
            "x": 2276,
            "z": 0.7
          },
          {
            "x": 2464,
            "z": 0.7
          }
        ],
        "integrity": 100,
        "closeDuration": 2.6,
        "openDuration": 1.6,
        "childReleaseDuration": 1.1,
        "origin": "original_gameplay_equipment"
      }
    ],
    "alarms": [
      {
        "id": "alarm-concourse",
        "room": "concourse",
        "label": "Avertisseur de la galerie",
        "x": 1010,
        "z": 0.7,
        "duration": 10,
        "delay": 4,
        "cooldown": 45,
        "charges": 2,
        "range": 950,
        "occludedRange": 470,
        "circuit": "habitat",
        "origin": "original_gameplay_equipment"
      },
      {
        "id": "alarm-med",
        "room": "med",
        "label": "Avertisseur médical",
        "x": 930,
        "z": 0.7,
        "duration": 10,
        "delay": 4,
        "cooldown": 45,
        "charges": 2,
        "range": 950,
        "occludedRange": 470,
        "circuit": "medical",
        "origin": "original_gameplay_equipment"
      },
      {
        "id": "alarm-garage",
        "room": "garage",
        "label": "Avertisseur du garage",
        "x": 2810,
        "z": 0.7,
        "duration": 10,
        "delay": 4,
        "cooldown": 45,
        "charges": 2,
        "range": 950,
        "occludedRange": 470,
        "circuit": "industry",
        "origin": "original_gameplay_equipment"
      },
      {
        "id": "alarm-service",
        "room": "service",
        "label": "Avertisseur technique",
        "x": 2050,
        "z": 0.7,
        "duration": 10,
        "delay": 4,
        "cooldown": 45,
        "charges": 2,
        "range": 950,
        "occludedRange": 470,
        "circuit": "industry",
        "origin": "original_gameplay_equipment"
      }
    ],
    "revision": 6,
    "rules": {
      "shutterBulletDamage": 4,
      "shutterAdultDamage": 36,
      "shutterWindup": 0.85,
      "alarmWorkDuration": 1.2,
      "signalDoesNotOverrideSight": true
    }
  },
  "ducts": {
    "revision": 7,
    "routes": [
      {
        "id": "reprise",
        "label": "Reprise de manutention",
        "ends": [
          "duct-concourse",
          "duct-garage"
        ],
        "duration": 4.0,
        "minPhase": 2
      },
      {
        "id": "fret",
        "label": "Descente du fret",
        "ends": [
          "duct-stores",
          "duct-power"
        ],
        "duration": 4.4,
        "minPhase": 2
      },
      {
        "id": "collecteur",
        "label": "Collecteur de maintenance",
        "ends": [
          "duct-service",
          "duct-pump"
        ],
        "duration": 4.8,
        "minPhase": 2
      },
      {
        "id": "sterile",
        "label": "Retour de filtration",
        "ends": [
          "duct-med",
          "duct-science"
        ],
        "duration": 5.2,
        "minPhase": 2
      },
      {
        "id": "echangeur",
        "label": "Retour des échangeurs",
        "ends": [
          "duct-hive",
          "duct-coolant"
        ],
        "duration": 5.6,
        "minPhase": 2
      }
    ],
    "mouths": [
      {
        "id": "duct-concourse",
        "route": "reprise",
        "room": "concourse",
        "x": 2575,
        "z": 0.7,
        "label": "Reprise de manutention · A",
        "code": "G01A",
        "height": 118,
        "origin": "original_gameplay_not_novel_floorplan"
      },
      {
        "id": "duct-garage",
        "route": "reprise",
        "room": "garage",
        "x": 2125,
        "z": 0.7,
        "label": "Reprise de manutention · B",
        "code": "G01B",
        "height": 118,
        "origin": "original_gameplay_not_novel_floorplan"
      },
      {
        "id": "duct-stores",
        "route": "fret",
        "room": "stores",
        "x": 2375,
        "z": 0.7,
        "label": "Descente du fret · A",
        "code": "G02A",
        "height": 118,
        "origin": "original_gameplay_not_novel_floorplan"
      },
      {
        "id": "duct-power",
        "route": "fret",
        "room": "power",
        "x": 1775,
        "z": 0.7,
        "label": "Descente du fret · B",
        "code": "G02B",
        "height": 118,
        "origin": "original_gameplay_not_novel_floorplan"
      },
      {
        "id": "duct-service",
        "route": "collecteur",
        "room": "service",
        "x": 2450,
        "z": 0.7,
        "label": "Collecteur de maintenance · A",
        "code": "G03A",
        "height": 118,
        "origin": "original_gameplay_not_novel_floorplan"
      },
      {
        "id": "duct-pump",
        "route": "collecteur",
        "room": "pump",
        "x": 1800,
        "z": 0.7,
        "label": "Collecteur de maintenance · B",
        "code": "G03B",
        "height": 118,
        "origin": "original_gameplay_not_novel_floorplan"
      },
      {
        "id": "duct-med",
        "route": "sterile",
        "room": "med",
        "x": 1825,
        "z": 0.7,
        "label": "Retour de filtration · A",
        "code": "G04A",
        "height": 118,
        "origin": "original_gameplay_not_novel_floorplan"
      },
      {
        "id": "duct-science",
        "route": "sterile",
        "room": "science",
        "x": 1800,
        "z": 0.7,
        "label": "Retour de filtration · B",
        "code": "G04B",
        "height": 118,
        "origin": "original_gameplay_not_novel_floorplan"
      },
      {
        "id": "duct-hive",
        "route": "echangeur",
        "room": "hive",
        "x": 2625,
        "z": 0.7,
        "label": "Retour des échangeurs · A",
        "code": "G05A",
        "height": 118,
        "origin": "original_gameplay_not_novel_floorplan"
      },
      {
        "id": "duct-coolant",
        "route": "echangeur",
        "room": "coolant",
        "x": 2375,
        "z": 0.7,
        "label": "Retour des échangeurs · B",
        "code": "G05B",
        "height": 118,
        "origin": "original_gameplay_not_novel_floorplan"
      }
    ],
    "rules": {
      "entryDuration": 1.1,
      "warningDuration": 2.4,
      "clearance": 300,
      "closeDuration": 2.0,
      "openDuration": 1.2,
      "listenDuration": 1.7,
      "hitDamage": 34,
      "hitWindup": 0.9,
      "retryCooldown": 24,
      "routeCooldown": 12,
      "hearingDistance": 630,
      "maxRoomEnemies": 12
    }
  },
  "mobility": {
    "revision": 8,
    "rover": {
      "id": "prospector-01",
      "name": "Tracteur de prospection 01",
      "room": "road",
      "x": 660,
      "z": 0.79,
      "width": 304,
      "depth": 0.1,
      "height": 130
    },
    "rooms": [
      "road",
      "plateau"
    ],
    "links": [
      [
        "road",
        "plateau"
      ]
    ],
    "rules": {
      "maxForward": 520,
      "maxReverse": 220,
      "acceleration": 300,
      "braking": 850,
      "rollingResistance": 135,
      "steerSpeed": 150,
      "boardingTime": 1.5,
      "exitTime": 1.1,
      "repairTime": 3.2,
      "chargeTime": 2.8,
      "hornTime": 1.2,
      "hornCooldown": 5,
      "minimumBattery": 0.5
    },
    "stations": [
      {
        "id": "service-road",
        "room": "road",
        "label": "Borne du périmètre",
        "x": 900,
        "z": 0.38,
        "radius": 290,
        "repairKits": 1,
        "charges": 1
      },
      {
        "id": "service-plateau",
        "room": "plateau",
        "label": "Dépôt de prospection",
        "x": 2430,
        "z": 0.38,
        "radius": 290,
        "repairKits": 1,
        "charges": 1
      }
    ],
    "surfaces": [
      {
        "id": "road-gravel",
        "room": "road",
        "label": "GRAVIER MEUBLE",
        "x": 1940,
        "w": 350,
        "minZ": 0.25,
        "maxZ": 0.9,
        "speedLimit": 260
      },
      {
        "id": "plateau-ruts",
        "room": "plateau",
        "label": "ORNIÈRES",
        "x": 1530,
        "w": 290,
        "minZ": 0.25,
        "maxZ": 0.9,
        "speedLimit": 225
      }
    ],
    "replacedStaticCopies": [
      "garage-set-0",
      "plateau-set-0"
    ]
  },
  "appearances": {
    "brackett": {
      "name": "Demian Brackett",
      "height": 87,
      "build": 1.1,
      "skin": "#c7a489",
      "hair": "#554737",
      "hairstyle": "short",
      "wardrobe": "marine",
      "color": "#7e8969",
      "pants": "#5a6251",
      "identity": "roman",
      "visualStatus": "interprétation ; visage non décrit par les sources consultées",
      "id": "brackett"
    },
    "paris": {
      "name": "Julisa Paris",
      "height": 82,
      "build": 0.91,
      "skin": "#ac8468",
      "hair": "#302924",
      "hairstyle": "tied",
      "wardrobe": "marine",
      "color": "#83927b",
      "pants": "#515c52",
      "identity": "roman",
      "visualStatus": "interprétation ; aucune ressemblance avec une comédienne audio revendiquée",
      "id": "paris"
    },
    "anne": {
      "name": "Anne Jorden",
      "height": 79,
      "build": 1.0,
      "skin": "#c6a687",
      "hair": "#6d503b",
      "hairstyle": "curls",
      "wardrobe": "workwear",
      "color": "#978366",
      "pants": "#555c54",
      "identity": "roman",
      "visualStatus": "cheveux bouclés attestés ; teinte et tenue interprétées",
      "source": "R1",
      "id": "anne"
    },
    "newt": {
      "name": "Rebecca « Newt » Jorden",
      "height": 51,
      "build": 0.78,
      "skin": "#cfb093",
      "hair": "#b3a076",
      "hairstyle": "long",
      "wardrobe": "overalls",
      "color": "#a79b80",
      "pants": "#4b6171",
      "identity": "roman",
      "visualStatus": "silhouette inspirée du film/licence ; pas de casque de Hicks dans cette époque",
      "source": "R3",
      "id": "newt"
    },
    "russ": {
      "name": "Russ Jorden",
      "height": 86,
      "build": 1.08,
      "skin": "#bf9b80",
      "hair": "#66513a",
      "hairstyle": "scruffy",
      "wardrobe": "workwear",
      "color": "#857b62",
      "pants": "#515b55",
      "identity": "roman",
      "visualStatus": "apparence fatiguée attestée ; détails du visage interprétés",
      "source": "R1",
      "id": "russ"
    },
    "komiskey": {
      "name": "Dr Theodora Komiskey",
      "height": 71,
      "build": 1.42,
      "skin": "#c9aa91",
      "hair": "#694c36",
      "hairstyle": "curls",
      "eyes": "#76a2bc",
      "wardrobe": "medical",
      "color": "#c1c8bc",
      "pants": "#717e79",
      "identity": "roman",
      "visualStatus": "silhouette petite et trapue, boucles brunes et yeux bleus attestés ; blouse interprétée",
      "source": "R1",
      "id": "komiskey"
    },
    "luisa": {
      "name": "Luisa",
      "height": 53,
      "build": 0.78,
      "skin": "#c3a282",
      "hair": "#574133",
      "hairstyle": "tied",
      "wardrobe": "child-jacket",
      "color": "#aa7870",
      "pants": "#5a625e",
      "identity": "roman",
      "visualStatus": "enfant distincte de Newt ; apparence provisoire non attestée",
      "id": "luisa"
    },
    "civilian": {
      "name": "Colon du bloc C",
      "height": 80,
      "build": 1,
      "skin": "#b49376",
      "hair": "#635951",
      "hairstyle": "short",
      "wardrobe": "workwear",
      "color": "#869296",
      "pants": "#555f60",
      "identity": "original",
      "visualStatus": "personnage de gameplay",
      "id": "civilian"
    },
    "mori": {
      "name": "Dr Mori",
      "height": 81,
      "build": 0.9,
      "skin": "#bb9d82",
      "hair": "#3b3330",
      "hairstyle": "short",
      "wardrobe": "medical",
      "color": "#c1c8bd",
      "pants": "#65736f",
      "identity": "roman",
      "visualStatus": "silhouette provisoire, visage non authentifié",
      "id": "mori"
    },
    "tim": {
      "id": "tim",
      "name": "Tim Jorden",
      "height": 61,
      "build": 0.85,
      "skin": "#be9f85",
      "hair": "#62513b",
      "hairstyle": "short",
      "wardrobe": "child-jacket",
      "color": "#6b805f",
      "pants": "#58665e",
      "identity": "roman",
      "visualStatus": "Enfant de la famille Jorden, attesté ; tenue et visage interprétés.",
      "source": "R1"
    },
    "simpson": {
      "id": "simpson",
      "name": "Al Simpson",
      "height": 84,
      "build": 1.16,
      "skin": "#be9f85",
      "hair": "#706554",
      "hairstyle": "short",
      "wardrobe": "workwear",
      "color": "#aaa18c",
      "pants": "#58665e",
      "identity": "roman",
      "visualStatus": "Administrateur attesté ; dialogue, tenue et poste local interprétés.",
      "source": "R1"
    },
    "hansard": {
      "id": "hansard",
      "name": "Greg Hansard",
      "height": 86,
      "build": 1.05,
      "skin": "#be9f85",
      "hair": "#5d5042",
      "hairstyle": "short",
      "wardrobe": "workwear",
      "color": "#8b9278",
      "pants": "#58665e",
      "identity": "roman",
      "visualStatus": "Ingénieur en chef attesté ; dialogue, tenue et poste local interprétés.",
      "source": "R1"
    },
    "joel": {
      "id": "joel",
      "name": "Joel",
      "height": 86,
      "build": 0.82,
      "skin": "#be9f85",
      "hair": "#3e342d",
      "hairstyle": "short",
      "wardrobe": "medical",
      "color": "#b8c5ba",
      "pants": "#58665e",
      "identity": "roman",
      "visualStatus": "Infirmier mince attesté ; visage, tenue et état en 2179 interprétés.",
      "source": "R1"
    },
    "bronagh": {
      "id": "bronagh",
      "name": "Bronagh Flaherty",
      "height": 79,
      "build": 1.1,
      "skin": "#be9f85",
      "hair": "#6a5342",
      "hairstyle": "tied",
      "wardrobe": "workwear",
      "color": "#b6a386",
      "pants": "#58665e",
      "identity": "roman",
      "visualStatus": "Cuisinière attestée ; visage, tenue et état en 2179 interprétés.",
      "source": "R1"
    }
  },
  "armory": {
    "revision": 9,
    "rack": {
      "id": "armory-rack-v09",
      "room": "armory",
      "x": 1080,
      "z": 0.28
    },
    "weapons": [
      {
        "id": "pulse",
        "name": "M41A · fusil à impulsion",
        "status": "jouable",
        "evidence": "référence visuelle du film ; chargeur de 30 = équilibre de jeu"
      },
      {
        "id": "flame",
        "name": "M240 · lance-flammes",
        "status": "jouable_facultatif",
        "evidence": "accessoire du film attesté R4 ; attribution dans ce roman à confirmer"
      },
      {
        "id": "grenade",
        "name": "Lance-grenades sous canon",
        "status": "jouable_facultatif",
        "evidence": "complément du M41A ; règles et réserve originales"
      }
    ],
    "rules": {
      "fuel": 60,
      "grenades": 3,
      "issueDuration": 2,
      "flameRange": 350,
      "flameDamage": 11,
      "flameInterval": 0.16,
      "grenadeRange": 560,
      "grenadeRadius": 135,
      "grenadeDamage": 95
    }
  },
  "canonicalContacts": [
    {
      "id": "contact-tim",
      "kind": "lore-contact",
      "actorId": "tim",
      "room": "jorden",
      "x": 1250,
      "z": 0.8,
      "phaseMax": 1,
      "label": "Parler à Tim Jorden",
      "description": "Je connais les grilles près de chez nous. Je ne passe pas là où la tôle a été ressoudée.",
      "note": "Enfant de la famille Jorden, attesté ; tenue et visage interprétés. Référence : extrait de 2173 ; cette mise en scène en 2179 reste originale."
    },
    {
      "id": "contact-simpson",
      "kind": "lore-contact",
      "actorId": "simpson",
      "room": "ops",
      "x": 1040,
      "z": 0.8,
      "phaseMax": 1,
      "label": "Parler à Al Simpson",
      "description": "Les arrivants passent au contrôle. Le tableau ne remplace pas une présence : prévenez le poste avant de sortir.",
      "note": "Administrateur attesté ; dialogue, tenue et poste local interprétés. Référence : extrait de 2173 ; cette mise en scène en 2179 reste originale."
    },
    {
      "id": "contact-hansard",
      "kind": "lore-contact",
      "actorId": "hansard",
      "room": "power",
      "x": 2060,
      "z": 0.8,
      "phaseMax": 1,
      "label": "Parler à Greg Hansard",
      "description": "Un circuit réarmé n’est pas une installation réparée. Gardez une voie sèche jusqu’au répartiteur.",
      "note": "Ingénieur en chef attesté ; dialogue, tenue et poste local interprétés. Référence : extrait de 2173 ; cette mise en scène en 2179 reste originale."
    },
    {
      "id": "contact-joel",
      "kind": "lore-contact",
      "actorId": "joel",
      "room": "med",
      "x": 1590,
      "z": 0.8,
      "phaseMax": 1,
      "label": "Parler à Joel",
      "description": "Laissez les portes du service dégagées. Une civière doit pouvoir passer sans contourner vos sacs.",
      "note": "Infirmier mince attesté ; visage, tenue et état en 2179 interprétés. Référence : extrait de 2173 ; cette mise en scène en 2179 reste originale."
    },
    {
      "id": "contact-bronagh",
      "kind": "lore-contact",
      "actorId": "bronagh",
      "room": "mess",
      "x": 1670,
      "z": 0.8,
      "phaseMax": 1,
      "label": "Parler à Bronagh Flaherty",
      "description": "Les portions froides sont pour le prochain quart. Refermez les réserves et signalez ce qui manque.",
      "note": "Cuisinière attestée ; visage, tenue et état en 2179 interprétés. Référence : extrait de 2173 ; cette mise en scène en 2179 reste originale."
    }
  ],
  "portalClearanceCorrections": [
    {
      "room": "concourse",
      "id": "concourse-set-1",
      "fromX": 780,
      "toX": 600
    },
    {
      "room": "concourse",
      "id": "concourse-set-3",
      "fromX": 1500,
      "toX": 1680
    },
    {
      "room": "concourse",
      "id": "concourse-detail-3",
      "fromX": 2070,
      "toX": 2250
    },
    {
      "room": "ops",
      "id": "ops-set-1",
      "fromX": 720,
      "toX": 900
    },
    {
      "room": "ops",
      "id": "ops-set-3",
      "fromX": 1360,
      "toX": 1540
    },
    {
      "room": "ops",
      "id": "ops-set-4",
      "fromX": 1680,
      "toX": 1500
    },
    {
      "room": "ops",
      "id": "ops-detail-1",
      "fromX": 744,
      "toX": 924
    },
    {
      "room": "ops",
      "id": "ops-detail-2",
      "fromX": 1200,
      "toX": 1020
    },
    {
      "room": "ops",
      "id": "ops-detail-3",
      "fromX": 1656,
      "toX": 1476
    },
    {
      "room": "briefing",
      "id": "briefing-detail-2",
      "fromX": 1100,
      "toX": 920
    },
    {
      "room": "mess",
      "id": "mess-set-1",
      "fromX": 770,
      "toX": 950
    },
    {
      "room": "mess",
      "id": "mess-set-4",
      "fromX": 1830,
      "toX": 2010
    },
    {
      "room": "mess",
      "id": "mess-detail-3",
      "fromX": 1794,
      "toX": 1614
    },
    {
      "room": "recreation",
      "id": "recreation-detail-1",
      "fromX": 698,
      "toX": 878
    },
    {
      "room": "med",
      "id": "med-set-1",
      "fromX": 820,
      "toX": 1000
    },
    {
      "room": "med",
      "id": "med-set-4",
      "fromX": 1980,
      "toX": 2160
    },
    {
      "room": "med",
      "id": "med-detail-2",
      "fromX": 1400,
      "toX": 1580
    },
    {
      "room": "med",
      "id": "med-detail-3",
      "fromX": 1932,
      "toX": 1752
    },
    {
      "room": "med",
      "id": "med-v09-15",
      "fromX": 2070,
      "toX": 2250
    },
    {
      "room": "science",
      "id": "science-set-1",
      "fromX": 720,
      "toX": 900
    },
    {
      "room": "science",
      "id": "science-set-2",
      "fromX": 1040,
      "toX": 860
    },
    {
      "room": "records",
      "id": "records-detail-4",
      "fromX": 1584,
      "toX": 1404
    },
    {
      "room": "garage",
      "id": "garage-set-2",
      "fromX": 1600,
      "toX": 1780
    },
    {
      "room": "garage",
      "id": "garage-set-4",
      "fromX": 2688,
      "toX": 2868
    },
    {
      "room": "garage",
      "id": "garage-detail-1",
      "fromX": 992,
      "toX": 1172
    },
    {
      "room": "survey",
      "id": "survey-detail-1",
      "fromX": 775,
      "toX": 955
    },
    {
      "room": "stores",
      "id": "stores-set-1",
      "fromX": 895,
      "toX": 1075
    },
    {
      "room": "stores",
      "id": "stores-detail-1",
      "fromX": 961,
      "toX": 1141
    },
    {
      "room": "power",
      "id": "power-set-1",
      "fromX": 770,
      "toX": 950
    },
    {
      "room": "pump",
      "id": "pump-set-2",
      "fromX": 1200,
      "toX": 1380
    },
    {
      "room": "processor6",
      "id": "processor6-set-3",
      "fromX": 2004,
      "toX": 2184
    },
    {
      "room": "vent_hab",
      "id": "vent_hab-detail-1",
      "fromX": 806,
      "toX": 986
    },
    {
      "room": "vent_med",
      "id": "vent_med-detail-2",
      "fromX": 1200,
      "toX": 1380
    },
    {
      "room": "vent_med",
      "id": "vent_med-detail-4",
      "fromX": 2112,
      "toX": 1932
    },
    {
      "room": "vent_survey",
      "id": "vent_survey-detail-1",
      "fromX": 728,
      "toX": 908
    },
    {
      "room": "vent_survey",
      "id": "vent_survey-detail-4",
      "fromX": 2068,
      "toX": 1888
    },
    {
      "room": "refuge",
      "id": "refuge-detail-3",
      "fromX": 1208,
      "toX": 1388
    },
    {
      "room": "refuge",
      "id": "refuge-detail-4",
      "fromX": 1540,
      "toX": 1360
    },
    {
      "room": "wash",
      "id": "wash-set-1",
      "fromX": 651,
      "toX": 831
    },
    {
      "room": "relay",
      "id": "relay-detail-0",
      "fromX": 451,
      "toX": 631
    },
    {
      "room": "relay",
      "id": "relay-detail-1",
      "fromX": 604,
      "toX": 784
    },
    {
      "room": "relay",
      "id": "relay-detail-4",
      "fromX": 1716,
      "toX": 1536
    },
    {
      "room": "clinic_store",
      "id": "clinic_store-detail-3",
      "fromX": 1173,
      "toX": 1353
    },
    {
      "room": "nest",
      "id": "nest-set-9",
      "fromX": 1760,
      "toX": 1580
    }
  ],
  "fidelity": {
    "revision": 9,
    "policy": "roman_prioritaire_puis_reference_filmique_identifiee",
    "completeNovelConsulted": false,
    "warning": "La cible 1:1 reste une direction, pas un état certifié. Les références couvrent un extrait, des entretiens et des silhouettes du film.",
    "coverage": [
      {
        "category": "lieu",
        "id": "pad",
        "title": "Aire d’atterrissage",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "lieu",
        "id": "airlock",
        "title": "Sas des arrivants",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "concourse",
        "title": "Coursive centrale",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "ops",
        "title": "Contrôle colonial",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "briefing",
        "title": "Poste de la garnison",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "hab",
        "title": "Coursive résidentielle",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "jorden",
        "title": "Logement des Jorden",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "lieu",
        "id": "mess",
        "title": "Réfectoire",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "recreation",
        "title": "Centre de loisirs",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "lieu",
        "id": "med",
        "title": "Infirmerie",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "lieu",
        "id": "isolation",
        "title": "Chambre d’isolement",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "science",
        "title": "Laboratoire de la Compagnie",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "records",
        "title": "Salle des archives",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "garage",
        "title": "Garage des prospecteurs",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "survey",
        "title": "Bureau des prospecteurs",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "stores",
        "title": "Magasin de fret",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "power",
        "title": "Distribution électrique",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "pump",
        "title": "Station de pompage",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "service",
        "title": "Galerie technique",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "road",
        "title": "Piste du plateau",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "plateau",
        "title": "Plateau des relevés",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "derelict",
        "title": "Seuil de l’épave",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": [
          "R2"
        ]
      },
      {
        "category": "lieu",
        "id": "processor6",
        "title": "Processeur six",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "approach",
        "title": "Accès au processeur un",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "lift",
        "title": "Monte-charge du processeur",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "hive",
        "title": "Soubassements envahis",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "coolant",
        "title": "Galerie du refroidissement",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "vent_hab",
        "title": "Conduits de l’habitat",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "vent_med",
        "title": "Conduits de l’infirmerie",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "vent_survey",
        "title": "Conduits des prospecteurs",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "refuge",
        "title": "Cache des conduits",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "hangar",
        "title": "Hangar scientifique",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "shuttle",
        "title": "Navette de la Compagnie",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "wash",
        "title": "Buanderie",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "relay",
        "title": "Relais de communications",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "clinic_store",
        "title": "Réserve médicale",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "pantry",
        "title": "Office de la cuisine",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "biomed",
        "title": "Atelier biomédical",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "aerial",
        "title": "Terrasse des antennes",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "workshop",
        "title": "Atelier de manutention",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "drain",
        "title": "Dérivation des eaux grises",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "nest",
        "title": "Renfoncement des câbles",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "greenhouse",
        "title": "Serre vitrée",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "lieu",
        "id": "armory",
        "title": "Armurerie de la garnison",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": []
      },
      {
        "category": "lieu",
        "id": "derelict_gallery",
        "title": "Galerie biomécanique",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": [
          "R2"
        ]
      },
      {
        "category": "lieu",
        "id": "pilot_chamber",
        "title": "Chambre du pilote",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": [
          "R2"
        ]
      },
      {
        "category": "lieu",
        "id": "egg_vault",
        "title": "Cale aux œufs",
        "status": "présent · plan original",
        "note": "Parcours relié et jouable. Implantation et distances non attestées dans le texte intégral.",
        "sources": [
          "R2"
        ]
      },
      {
        "category": "lieu",
        "id": "salvage_bay",
        "title": "Baie et sas du récupérateur",
        "status": "manquant",
        "note": "Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "lieu",
        "id": "salvage_shuttle",
        "title": "Navette retrouvée / couchette de Ripley",
        "status": "manquant",
        "note": "Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "lieu",
        "id": "orbital_medical",
        "title": "Service médical de Gateway Station",
        "status": "manquant",
        "note": "Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "lieu",
        "id": "dropship_arrival",
        "title": "Cabine de descente de Brackett",
        "status": "manquant",
        "note": "Séquence extérieure au plan colonial, attestée dans l’extrait. Ne pas la relier à la colonie par une porte.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "brackett",
        "title": "Demian Brackett",
        "status": "représenté · roman",
        "note": "interprétation ; visage non décrit par les sources consultées",
        "sources": []
      },
      {
        "category": "personnage",
        "id": "paris",
        "title": "Julisa Paris",
        "status": "représenté · roman",
        "note": "interprétation ; aucune ressemblance avec une comédienne audio revendiquée",
        "sources": []
      },
      {
        "category": "personnage",
        "id": "anne",
        "title": "Anne Jorden",
        "status": "représenté · roman",
        "note": "cheveux bouclés attestés ; teinte et tenue interprétées",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "newt",
        "title": "Rebecca « Newt » Jorden",
        "status": "représenté · roman",
        "note": "silhouette inspirée du film/licence ; pas de casque de Hicks dans cette époque",
        "sources": [
          "R3"
        ]
      },
      {
        "category": "personnage",
        "id": "russ",
        "title": "Russ Jorden",
        "status": "représenté · roman",
        "note": "apparence fatiguée attestée ; détails du visage interprétés",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "komiskey",
        "title": "Dr Theodora Komiskey",
        "status": "représenté · roman",
        "note": "silhouette petite et trapue, boucles brunes et yeux bleus attestés ; blouse interprétée",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "luisa",
        "title": "Luisa",
        "status": "représenté · roman",
        "note": "enfant distincte de Newt ; apparence provisoire non attestée",
        "sources": []
      },
      {
        "category": "personnage",
        "id": "civilian",
        "title": "Colon du bloc C",
        "status": "représenté · original",
        "note": "personnage de gameplay",
        "sources": []
      },
      {
        "category": "personnage",
        "id": "mori",
        "title": "Dr Mori",
        "status": "représenté · roman",
        "note": "silhouette provisoire, visage non authentifié",
        "sources": []
      },
      {
        "category": "personnage",
        "id": "tim",
        "title": "Tim Jorden",
        "status": "représenté · roman",
        "note": "Enfant de la famille Jorden, attesté ; tenue et visage interprétés.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "simpson",
        "title": "Al Simpson",
        "status": "représenté · roman",
        "note": "Administrateur attesté ; dialogue, tenue et poste local interprétés.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "hansard",
        "title": "Greg Hansard",
        "status": "représenté · roman",
        "note": "Ingénieur en chef attesté ; dialogue, tenue et poste local interprétés.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "joel",
        "title": "Joel",
        "status": "représenté · roman",
        "note": "Infirmier mince attesté ; visage, tenue et état en 2179 interprétés.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "bronagh",
        "title": "Bronagh Flaherty",
        "status": "représenté · roman",
        "note": "Cuisinière attestée ; visage, tenue et état en 2179 interprétés.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "finch",
        "title": "Frères Finch",
        "status": "manquant ou non individualisé",
        "note": "Identité rencontrée dans l’extrait ; présence physique spécifique non livrée.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "monet",
        "title": "Samantha Monet",
        "status": "manquant ou non individualisé",
        "note": "Identité rencontrée dans l’extrait ; présence physique spécifique non livrée.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "ripley",
        "title": "Ellen Ripley",
        "status": "manquant ou non individualisé",
        "note": "Identité rencontrée dans l’extrait ; présence physique spécifique non livrée.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "burke",
        "title": "Carter Burke",
        "status": "manquant ou non individualisé",
        "note": "Identité rencontrée dans l’extrait ; présence physique spécifique non livrée.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "jonesy",
        "title": "Jonesy",
        "status": "manquant ou non individualisé",
        "note": "Identité rencontrée dans l’extrait ; présence physique spécifique non livrée.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "tressa",
        "title": "Tressa, pilote de descente",
        "status": "manquant ou non individualisé",
        "note": "Identité rencontrée dans l’extrait ; présence physique spécifique non livrée.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "personnage",
        "id": "jernigan",
        "title": "Jernigan, Landers, Fleet et Moore",
        "status": "manquant ou non individualisé",
        "note": "Identité rencontrée dans l’extrait ; présence physique spécifique non livrée.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "équipement",
        "id": "pulse",
        "title": "M41A",
        "status": "présent · tir et rechargement",
        "note": "silhouette retravaillée ; 30 coups = valeur de jeu",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "flame",
        "title": "M240",
        "status": "présent · tir directionnel facultatif",
        "note": "dotation originale depuis le râtelier ; présence exacte dans le roman non vérifiée",
        "sources": [
          "R4"
        ]
      },
      {
        "category": "équipement",
        "id": "grenade",
        "title": "Lance-grenades",
        "status": "présent · projectile et explosion",
        "note": "munitions finies ; sans dégâts à travers un obstacle",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "tracker",
        "title": "Détecteur",
        "status": "présent · contacts locaux et échos",
        "note": "comportement simplifié",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "light",
        "title": "Lampe",
        "status": "présent · batterie et faisceau",
        "note": "règles de jeu",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "weld",
        "title": "Poste à souder",
        "status": "présent · soudures physiques",
        "note": "autorisation requise",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "medkit",
        "title": "Trousse de soins",
        "status": "présent · soins et partage",
        "note": "règle de soin simplifiée",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "flare",
        "title": "Fusée",
        "status": "présent · éclairage et repli",
        "note": "durée simulée",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "decoy",
        "title": "Balise sonore",
        "status": "présent · fabrication et diversion",
        "note": "création de gameplay",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "marker",
        "title": "Balise de repli",
        "status": "présent · repères persistants",
        "note": "création de gameplay",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "tools",
        "title": "Piles, fils, boîtiers",
        "status": "présent · récupération et recettes",
        "note": "création de gameplay",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "rover",
        "title": "Tracteur",
        "status": "présent · conduite et entretien",
        "note": "existence évoquée R1 ; mécanique originale",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "équipement",
        "id": "natal",
        "title": "Unité obstétricale",
        "status": "présent · visible et examinable",
        "note": "pas de chirurgie jouable ; emplacement interprété",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "équipement",
        "id": "cutter",
        "title": "Robot de découpe de récupération",
        "status": "manquant",
        "note": "Appartient à la récupération spatiale de l’extrait, pas à attribuer gratuitement aux Marines.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "équipement",
        "id": "scanner",
        "title": "Scanner de récupération",
        "status": "manquant",
        "note": "Appartient à la récupération spatiale de l’extrait, pas à attribuer gratuitement aux Marines.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "équipement",
        "id": "suit",
        "title": "Scaphandre de récupération",
        "status": "manquant",
        "note": "Appartient à la récupération spatiale de l’extrait, pas à attribuer gratuitement aux Marines.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "équipement",
        "id": "grappler",
        "title": "Grappin de la navette",
        "status": "manquant",
        "note": "Appartient à la récupération spatiale de l’extrait, pas à attribuer gratuitement aux Marines.",
        "sources": [
          "R1"
        ]
      },
      {
        "category": "équipement",
        "id": "smartgun",
        "title": "Smartgun",
        "status": "à vérifier",
        "note": "Ne pas déduire sa présence dans River of Pain du seul arsenal de la franchise.",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "sentry",
        "title": "Tourelle automatique",
        "status": "à vérifier",
        "note": "Ne pas déduire sa présence dans River of Pain du seul arsenal de la franchise.",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "p5000",
        "title": "Power Loader P-5000",
        "status": "à vérifier",
        "note": "Ne pas déduire sa présence dans River of Pain du seul arsenal de la franchise.",
        "sources": []
      },
      {
        "category": "équipement",
        "id": "pistol",
        "title": "Pistolet de service",
        "status": "à vérifier",
        "note": "Ne pas déduire sa présence dans River of Pain du seul arsenal de la franchise.",
        "sources": []
      }
    ],
    "portalTypes": {
      "airlock": 8,
      "door": 40,
      "stairs": 24,
      "corridor": 10,
      "duct": 20,
      "ladder": 6,
      "track": 4,
      "organic": 6,
      "lift": 4,
      "gangway": 4,
      "rope": 2
    },
    "allRoomsHaveAuthoredPlans": true,
    "newRooms": [
      "armory",
      "greenhouse",
      "derelict_gallery",
      "pilot_chamber",
      "egg_vault"
    ]
  }
};
if(typeof module!=="undefined" && module.exports)module.exports=data;
root.ROP_DATA=data;
})(typeof globalThis!=="undefined"?globalThis:this);
