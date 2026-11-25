// Original side-view MIRE reconstructions of named franchise locations.
// Images, unequal strip crops and expected identities are measured before admission.
// Neither this geometry nor the generated artwork is certified canon-exact.
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
export const XENO_TRIALS_FRANCHISE_STAGES_V192 = freeze([
  {
    "id": "xt192-nostromo-galley",
    "label": "Nostromo / Réfectoire",
    "labelEn": "Nostromo / Galley",
    "media": "film",
    "sourceWork": "Alien (1979)",
    "sourceLocation": "USCSS Nostromo",
    "background": "#291e17",
    "accent": "#8f837a",
    "floor": "#281e16",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/nostromo-galley.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "d1d961a054985a9e9830c73af857a3082c2eb82367872786fb225b0d4c6d1bb3",
      "sourceRects": [
        [
          0,
          0,
          1536,
          296
        ],
        [
          0,
          299,
          1536,
          405
        ],
        [
          0,
          707,
          1536,
          317
        ]
      ]
    },
    "sceneV192": {
      "architecture": "nostromo-galley",
      "eventKinds": [
        "airlock-cycle",
        "coolant-plume"
      ],
      "anchors": [
        0.18,
        0.82
      ],
      "seed": 1
    }
  },
  {
    "id": "xt192-nostromo-chain-room",
    "label": "Nostromo / Salle des chaînes",
    "labelEn": "Nostromo / Chain Room",
    "media": "film",
    "sourceWork": "Alien (1979)",
    "sourceLocation": "USCSS Nostromo",
    "background": "#0a1419",
    "accent": "#6c767c",
    "floor": "#070a0b",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/nostromo-chain-room.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "8a1c04badcb4b20c924a32025101a3d130446316a190d3a578beae3daba27f86",
      "sourceRects": [
        [
          0,
          0,
          1536,
          339
        ],
        [
          0,
          343,
          1536,
          338
        ],
        [
          0,
          685,
          1536,
          339
        ]
      ]
    },
    "sceneV192": {
      "architecture": "nostromo-chain-room",
      "eventKinds": [
        "freight-transit",
        "water-drip"
      ],
      "anchors": [
        0.205,
        0.7999999999999999
      ],
      "seed": 2
    }
  },
  {
    "id": "xt192-lv426-derelict-pilot",
    "label": "LV-426 / Chambre du pilote",
    "labelEn": "LV-426 / Pilot Chamber",
    "media": "film",
    "sourceWork": "Alien (1979)",
    "sourceLocation": "Épave Derelict de LV-426",
    "background": "#141b20",
    "accent": "#777f85",
    "floor": "#080a0b",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/lv426-derelict-pilot.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "705b9e2472f28ed42aaaaa4d9e6f5f6fa7e62bfdf4966f20305ded20acb5da81",
      "sourceRects": [
        [
          0,
          0,
          2172,
          236
        ],
        [
          0,
          241,
          2172,
          237
        ],
        [
          0,
          483,
          2172,
          241
        ]
      ]
    },
    "sceneV192": {
      "architecture": "lv426-derelict-pilot",
      "eventKinds": [
        "ash-drift",
        "storm-front"
      ],
      "anchors": [
        0.22999999999999998,
        0.7799999999999999
      ],
      "seed": 3
    }
  },
  {
    "id": "xt192-hadleys-hope-street",
    "label": "Hadley’s Hope / Rue de la colonie",
    "labelEn": "Hadley’s Hope / Colony Street",
    "media": "film",
    "sourceWork": "Aliens (1986)",
    "sourceLocation": "Hadley’s Hope, LV-426",
    "background": "#12181d",
    "accent": "#757b82",
    "floor": "#0c0d0e",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/hadleys-hope-street.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "4431eca04ed21483153a214384cae8ef8d707073d25879150e77c8aaa56427ed",
      "sourceRects": [
        [
          0,
          0,
          2172,
          237
        ],
        [
          0,
          242,
          2172,
          239
        ],
        [
          0,
          486,
          2172,
          238
        ]
      ]
    },
    "sceneV192": {
      "architecture": "hadleys-hope-street",
      "eventKinds": [
        "rain-curtain",
        "searchlight-sweep"
      ],
      "anchors": [
        0.18,
        0.76
      ],
      "seed": 4
    }
  },
  {
    "id": "xt192-lv426-atmosphere-hive",
    "label": "LV-426 / Ruche du processeur",
    "labelEn": "LV-426 / Processor Hive",
    "media": "film",
    "sourceWork": "Aliens (1986)",
    "sourceLocation": "Processeur atmosphérique de LV-426",
    "background": "#1d160f",
    "accent": "#827970",
    "floor": "#0c0906",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/lv426-atmosphere-hive.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "e0fc3bf9a40957f1197217e9e1b59a34b450114a085839d365fbcc91a6ea4d42",
      "sourceRects": [
        [
          0,
          0,
          1536,
          337
        ],
        [
          0,
          342,
          1536,
          337
        ],
        [
          0,
          684,
          1536,
          340
        ]
      ]
    },
    "sceneV192": {
      "architecture": "lv426-atmosphere-hive",
      "eventKinds": [
        "hive-movement",
        "water-drip"
      ],
      "anchors": [
        0.205,
        0.82
      ],
      "seed": 5
    }
  },
  {
    "id": "xt192-sulaco-hangar",
    "label": "Sulaco / Hangar des dropships",
    "labelEn": "Sulaco / Dropship Hangar",
    "media": "film",
    "sourceWork": "Aliens (1986)",
    "sourceLocation": "USS Sulaco",
    "background": "#121516",
    "accent": "#74787a",
    "floor": "#161616",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/sulaco-hangar.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "b5d17af2f6afd453fa3693c26edcc7e5f09af48040274982f18f42037cd79261",
      "sourceRects": [
        [
          0,
          0,
          1536,
          304
        ],
        [
          0,
          310,
          1536,
          393
        ],
        [
          0,
          710,
          1536,
          314
        ]
      ]
    },
    "sceneV192": {
      "architecture": "sulaco-hangar",
      "eventKinds": [
        "freight-transit",
        "airlock-cycle"
      ],
      "anchors": [
        0.22999999999999998,
        0.7999999999999999
      ],
      "seed": 6
    }
  },
  {
    "id": "xt192-fury161-leadworks",
    "label": "Fiorina 161 / Fonderie",
    "labelEn": "Fiorina 161 / Leadworks",
    "media": "film",
    "sourceWork": "Alien³ (1992)",
    "sourceLocation": "Fiorina 161",
    "background": "#1a100c",
    "accent": "#7e726d",
    "floor": "#110906",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/fury161-leadworks.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "d6c9c60e7d35f8b83d56cfb97aa1cca8551ba6eb78b8763ce449b3b59bacec9f",
      "sourceRects": [
        [
          0,
          0,
          1536,
          337
        ],
        [
          0,
          342,
          1536,
          338
        ],
        [
          0,
          686,
          1536,
          338
        ]
      ]
    },
    "sceneV192": {
      "architecture": "fury161-leadworks",
      "eventKinds": [
        "furnace-embers",
        "coolant-plume"
      ],
      "anchors": [
        0.18,
        0.7799999999999999
      ],
      "seed": 7
    }
  },
  {
    "id": "xt192-auriga-clone-laboratory",
    "label": "Auriga / Laboratoire des clones",
    "labelEn": "Auriga / Clone Laboratory",
    "media": "film",
    "sourceWork": "Alien Resurrection (1997)",
    "sourceLocation": "USM Auriga",
    "background": "#161c1c",
    "accent": "#798080",
    "floor": "#171d1b",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/auriga-clone-laboratory.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "b9680479935dc9005fa71ec1137eae227d5afee4e2befed58d3fc6a55c1b39a1",
      "sourceRects": [
        [
          0,
          0,
          1536,
          339
        ],
        [
          0,
          345,
          1536,
          335
        ],
        [
          0,
          686,
          1536,
          338
        ]
      ]
    },
    "sceneV192": {
      "architecture": "auriga-clone-laboratory",
      "eventKinds": [
        "containment-scan",
        "archive-scan"
      ],
      "anchors": [
        0.205,
        0.76
      ],
      "seed": 8
    }
  },
  {
    "id": "xt192-auriga-flooded-galley",
    "label": "Auriga / Réfectoire inondé",
    "labelEn": "Auriga / Flooded Galley",
    "media": "film",
    "sourceWork": "Alien Resurrection (1997)",
    "sourceLocation": "USM Auriga",
    "background": "#052221",
    "accent": "#658886",
    "floor": "#021615",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/auriga-flooded-galley.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "758e8402cab71da7e23c35a093a1e44b68e629f9c978c566ce13b6d8b8902385",
      "sourceRects": [
        [
          0,
          0,
          1536,
          336
        ],
        [
          0,
          342,
          1536,
          337
        ],
        [
          0,
          685,
          1536,
          339
        ]
      ]
    },
    "sceneV192": {
      "architecture": "auriga-flooded-galley",
      "eventKinds": [
        "water-drip",
        "reactor-conduit"
      ],
      "anchors": [
        0.22999999999999998,
        0.82
      ],
      "seed": 9
    }
  },
  {
    "id": "xt192-lv223-orrery",
    "label": "LV-223 / Salle de navigation",
    "labelEn": "LV-223 / Orrery",
    "media": "film",
    "sourceWork": "Prometheus (2012)",
    "sourceLocation": "Vaisseau des Ingénieurs sur LV-223",
    "background": "#091014",
    "accent": "#6a7277",
    "floor": "#0a0d0e",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/lv223-orrery.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "0b6dbec645368452cc1be1bef4756bb43214d54a36e7f1a795b2d8d8f1fca0e4",
      "sourceRects": [
        [
          0,
          0,
          1536,
          320
        ],
        [
          0,
          323,
          1536,
          358
        ],
        [
          0,
          685,
          1536,
          339
        ]
      ]
    },
    "sceneV192": {
      "architecture": "lv223-orrery",
      "eventKinds": [
        "archive-scan",
        "bioluminescent-pulse"
      ],
      "anchors": [
        0.18,
        0.7999999999999999
      ],
      "seed": 10
    }
  },
  {
    "id": "xt192-lv223-ampule-chamber",
    "label": "LV-223 / Chambre des urnes",
    "labelEn": "LV-223 / Ampule Chamber",
    "media": "film",
    "sourceWork": "Prometheus (2012)",
    "sourceLocation": "Installation des Ingénieurs sur LV-223",
    "background": "#12171a",
    "accent": "#747a7e",
    "floor": "#0d0f0f",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/lv223-ampule-chamber.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "7cdb16f4a981b396f7cf18fa0b948d7e94c8a96187a53b3d0b5eba66d301a481",
      "sourceRects": [
        [
          0,
          0,
          1536,
          333
        ],
        [
          0,
          337,
          1536,
          341
        ],
        [
          0,
          682,
          1536,
          342
        ]
      ]
    },
    "sceneV192": {
      "architecture": "lv223-ampule-chamber",
      "eventKinds": [
        "water-drip",
        "spore-drift"
      ],
      "anchors": [
        0.205,
        0.7799999999999999
      ],
      "seed": 11
    }
  },
  {
    "id": "xt192-planet4-necropolis",
    "label": "Planète 4 / Nécropole",
    "labelEn": "Planet 4 / Necropolis",
    "media": "film",
    "sourceWork": "Alien: Covenant (2017)",
    "sourceLocation": "Cité des Ingénieurs, Planète 4",
    "background": "#2f2b28",
    "accent": "#96928f",
    "floor": "#191715",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/planet4-necropolis.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "1f4bd26439489f98e509f4608af6a0ed7050ddbd5e18f86412bd4ffb5a6d7cf8",
      "sourceRects": [
        [
          0,
          0,
          1536,
          338
        ],
        [
          0,
          343,
          1536,
          337
        ],
        [
          0,
          685,
          1536,
          339
        ]
      ]
    },
    "sceneV192": {
      "architecture": "planet4-necropolis",
      "eventKinds": [
        "ash-drift",
        "storm-front"
      ],
      "anchors": [
        0.22999999999999998,
        0.76
      ],
      "seed": 12
    }
  },
  {
    "id": "xt192-planet4-wheat-field",
    "label": "Planète 4 / Champ de blé",
    "labelEn": "Planet 4 / Wheat Field",
    "media": "film",
    "sourceWork": "Alien: Covenant (2017)",
    "sourceLocation": "Zone de débarquement de Planète 4",
    "background": "#25292b",
    "accent": "#8a9092",
    "floor": "#191811",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/planet4-wheat-field.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "3f2723ac5b1c96850957df286dbb4c538ee5d0de759cb8d65affad1695610574",
      "sourceRects": [
        [
          0,
          0,
          1536,
          338
        ],
        [
          0,
          341,
          1536,
          339
        ],
        [
          0,
          683,
          1536,
          341
        ]
      ]
    },
    "sceneV192": {
      "architecture": "planet4-wheat-field",
      "eventKinds": [
        "storm-front",
        "spore-drift"
      ],
      "anchors": [
        0.18,
        0.82
      ],
      "seed": 13
    }
  },
  {
    "id": "xt192-renaissance-cryo-chamber",
    "label": "Renaissance / Baie cryogénique",
    "labelEn": "Renaissance / Cryogenic Bay",
    "media": "film",
    "sourceWork": "Alien: Romulus (2024)",
    "sourceLocation": "Station Renaissance",
    "background": "#151616",
    "accent": "#78797a",
    "floor": "#111211",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/renaissance-cryo-chamber.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "dad60b863259de4be1304ffefb9ddfae1d557d8b1a9cb7e889636d1070612c64",
      "sourceRects": [
        [
          0,
          0,
          1536,
          306
        ],
        [
          0,
          312,
          1536,
          402
        ],
        [
          0,
          720,
          1536,
          304
        ]
      ]
    },
    "sceneV192": {
      "architecture": "renaissance-cryo-chamber",
      "eventKinds": [
        "coolant-plume",
        "containment-scan"
      ],
      "anchors": [
        0.205,
        0.7999999999999999
      ],
      "seed": 14
    }
  },
  {
    "id": "xt192-jacksons-star-street",
    "label": "Jackson’s Star / Rue minière",
    "labelEn": "Jackson’s Star / Mining Street",
    "media": "film",
    "sourceWork": "Alien: Romulus (2024)",
    "sourceLocation": "Colonie de Jackson’s Star",
    "background": "#1b140f",
    "accent": "#7f7771",
    "floor": "#0d0905",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/jacksons-star-street.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "803460306f67f4405eafb021b39961fcf49c7c59ef1df12dd321710bc70cff96",
      "sourceRects": [
        [
          0,
          0,
          1536,
          337
        ],
        [
          0,
          342,
          1536,
          339
        ],
        [
          0,
          686,
          1536,
          338
        ]
      ]
    },
    "sceneV192": {
      "architecture": "jacksons-star-street",
      "eventKinds": [
        "ash-drift",
        "freight-transit"
      ],
      "anchors": [
        0.22999999999999998,
        0.7799999999999999
      ],
      "seed": 15
    }
  },
  {
    "id": "xt192-maginot-specimen-hold",
    "label": "Maginot / Soute des spécimens",
    "labelEn": "Maginot / Specimen Hold",
    "media": "series",
    "sourceWork": "Alien: Earth (2025)",
    "sourceLocation": "USCSS Maginot",
    "background": "#101111",
    "accent": "#727373",
    "floor": "#110d0b",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/maginot-specimen-hold.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "b83b5416ccb2cc4e42af6facf98070bf8bce628cdce0ac72868403cc10713ff0",
      "sourceRects": [
        [
          0,
          0,
          1536,
          335
        ],
        [
          0,
          341,
          1536,
          338
        ],
        [
          0,
          685,
          1536,
          339
        ]
      ]
    },
    "sceneV192": {
      "architecture": "maginot-specimen-hold",
      "eventKinds": [
        "containment-scan",
        "freight-transit"
      ],
      "anchors": [
        0.18,
        0.76
      ],
      "seed": 16
    }
  },
  {
    "id": "xt192-maginot-bridge",
    "label": "Maginot / Passerelle",
    "labelEn": "Maginot / Bridge",
    "media": "series",
    "sourceWork": "Alien: Earth (2025)",
    "sourceLocation": "USCSS Maginot",
    "background": "#101113",
    "accent": "#727476",
    "floor": "#0e0e0d",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/maginot-bridge.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "8319297a331349cae2f6f7fef462abd3a786b946f146764e0482bd885e47cedf",
      "sourceRects": [
        [
          0,
          0,
          1536,
          335
        ],
        [
          0,
          343,
          1536,
          336
        ],
        [
          0,
          687,
          1536,
          337
        ]
      ]
    },
    "sceneV192": {
      "architecture": "maginot-bridge",
      "eventKinds": [
        "orbital-transit",
        "archive-scan"
      ],
      "anchors": [
        0.205,
        0.82
      ],
      "seed": 17
    }
  },
  {
    "id": "xt192-new-siam-crash-site",
    "label": "New Siam / Site du crash",
    "labelEn": "New Siam / Crash Site",
    "media": "series",
    "sourceWork": "Alien: Earth (2025)",
    "sourceLocation": "New Siam, Terre",
    "background": "#131619",
    "accent": "#76797c",
    "floor": "#0d0d0c",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/new-siam-crash-site.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "9b9aaaf4481f797e06be2924a3ce3a75160ab34dea4477f9e05ecc8c86006d00",
      "sourceRects": [
        [
          0,
          0,
          1536,
          337
        ],
        [
          0,
          342,
          1536,
          338
        ],
        [
          0,
          687,
          1536,
          337
        ]
      ]
    },
    "sceneV192": {
      "architecture": "new-siam-crash-site",
      "eventKinds": [
        "rain-curtain",
        "coolant-plume"
      ],
      "anchors": [
        0.22999999999999998,
        0.7999999999999999
      ],
      "seed": 18
    }
  },
  {
    "id": "xt192-neverland-laboratory",
    "label": "Neverland / Laboratoire",
    "labelEn": "Neverland / Laboratory",
    "media": "series",
    "sourceWork": "Alien: Earth (2025)",
    "sourceLocation": "Île de Neverland, complexe Prodigy",
    "background": "#2a2f2b",
    "accent": "#909692",
    "floor": "#30312b",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/neverland-laboratory.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "47e6ce18d3ca9a636a5fd02d254f4aa288d10a1037d00a9f73138d0b78f9f875",
      "sourceRects": [
        [
          0,
          0,
          1536,
          336
        ],
        [
          0,
          344,
          1536,
          335
        ],
        [
          0,
          686,
          1536,
          338
        ]
      ]
    },
    "sceneV192": {
      "architecture": "neverland-laboratory",
      "eventKinds": [
        "containment-scan",
        "archive-scan"
      ],
      "anchors": [
        0.18,
        0.7799999999999999
      ],
      "seed": 19
    }
  },
  {
    "id": "xt192-neverland-jungle",
    "label": "Neverland / Lisière tropicale",
    "labelEn": "Neverland / Jungle Edge",
    "media": "series",
    "sourceWork": "Alien: Earth (2025)",
    "sourceLocation": "Île de Neverland",
    "background": "#262e25",
    "accent": "#8d968b",
    "floor": "#101007",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/screen/neverland-jungle.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "2c07b4ea6dfba35ee66dabb007e2c7bde255a1b84ca3a6b9201d8963ea6a4969",
      "sourceRects": [
        [
          0,
          0,
          1536,
          337
        ],
        [
          0,
          342,
          1536,
          337
        ],
        [
          0,
          684,
          1536,
          340
        ]
      ]
    },
    "sceneV192": {
      "architecture": "neverland-jungle",
      "eventKinds": [
        "water-drip",
        "spore-drift"
      ],
      "anchors": [
        0.205,
        0.76
      ],
      "seed": 20
    }
  },
  {
    "id": "xt192-sevastopol-lorenz-systech",
    "label": "Sevastopol / Lorenz Systech",
    "labelEn": "Sevastopol / Lorenz Systech",
    "media": "game",
    "sourceWork": "Alien: Isolation (2014)",
    "sourceLocation": "Sevastopol, Lorenz Systech Spire",
    "background": "#222018",
    "accent": "#88847b",
    "floor": "#191814",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/sevastopol-lorenz-systech.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "48e670315901e4f322ea6006bd5ab999848abd462ea01d6b01e2a6a6fb3a6872",
      "sourceRects": [
        [
          0,
          0,
          1536,
          338
        ],
        [
          0,
          341,
          1536,
          363
        ],
        [
          0,
          707,
          1536,
          317
        ]
      ]
    },
    "sceneV192": {
      "architecture": "sevastopol-lorenz-systech",
      "eventKinds": [
        "rail-transit",
        "orbital-transit"
      ],
      "anchors": [
        0.22999999999999998,
        0.82
      ],
      "seed": 21
    }
  },
  {
    "id": "xt192-sevastopol-san-cristobal",
    "label": "Sevastopol / San Cristobal",
    "labelEn": "Sevastopol / San Cristobal",
    "media": "game",
    "sourceWork": "Alien: Isolation (2014)",
    "sourceLocation": "San Cristobal Medical Facility, Sevastopol",
    "background": "#181711",
    "accent": "#7c7b73",
    "floor": "#1f1f17",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/sevastopol-san-cristobal.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "ec2998426de29eb887062ddd8b8c36f2c50b138fa3ca3f8b4ea12930de5cee0c",
      "sourceRects": [
        [
          0,
          0,
          1536,
          315
        ],
        [
          0,
          319,
          1536,
          418
        ],
        [
          0,
          742,
          1536,
          282
        ]
      ]
    },
    "sceneV192": {
      "architecture": "sevastopol-san-cristobal",
      "eventKinds": [
        "containment-scan",
        "airlock-cycle"
      ],
      "anchors": [
        0.18,
        0.7999999999999999
      ],
      "seed": 22
    }
  },
  {
    "id": "xt192-sevastopol-reactor-nest",
    "label": "Sevastopol / Nid du réacteur",
    "labelEn": "Sevastopol / Reactor Nest",
    "media": "game",
    "sourceWork": "Alien: Isolation (2014)",
    "sourceLocation": "Réacteur Apollo, Sevastopol",
    "background": "#1d1512",
    "accent": "#817874",
    "floor": "#120d0b",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/sevastopol-reactor-nest.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "b6fed92716398be8c41e58bbac4ba2852fff9b770cea7e66e4c1cbb864b27ecf",
      "sourceRects": [
        [
          0,
          0,
          1536,
          337
        ],
        [
          0,
          342,
          1536,
          339
        ],
        [
          0,
          685,
          1536,
          339
        ]
      ]
    },
    "sceneV192": {
      "architecture": "sevastopol-reactor-nest",
      "eventKinds": [
        "reactor-conduit",
        "hive-movement"
      ],
      "anchors": [
        0.205,
        0.7799999999999999
      ],
      "seed": 23
    }
  },
  {
    "id": "xt192-lv1201-forward-facility",
    "label": "LV-1201 / Complexe avancé",
    "labelEn": "LV-1201 / Forward Facility",
    "media": "game",
    "sourceWork": "Aliens versus Predator 2 (2001)",
    "sourceLocation": "Forward Observation Pods / complexe de recherche, LV-1201",
    "background": "#171c20",
    "accent": "#7a8185",
    "floor": "#111310",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/lv1201-forward-facility.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "576113bba6e7b512b2fb841a12381a213073b08a55110d6b0749d67f931ad598",
      "sourceRects": [
        [
          0,
          0,
          1536,
          338
        ],
        [
          0,
          342,
          1536,
          338
        ],
        [
          0,
          684,
          1536,
          340
        ]
      ]
    },
    "sceneV192": {
      "architecture": "lv1201-forward-facility",
      "eventKinds": [
        "rain-curtain",
        "searchlight-sweep"
      ],
      "anchors": [
        0.22999999999999998,
        0.76
      ],
      "seed": 24
    }
  },
  {
    "id": "xt192-lv1201-ancient-ruins",
    "label": "LV-1201 / Ruines anciennes",
    "labelEn": "LV-1201 / Ancient Ruins",
    "media": "game",
    "sourceWork": "Aliens versus Predator 2 (2001)",
    "sourceLocation": "Ruines anciennes, LV-1201",
    "background": "#132429",
    "accent": "#768a90",
    "floor": "#151610",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/lv1201-ancient-ruins.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "089e4ab554fd8014fcd74dd47d369286737c9034e215b3cb734ee7d2a09d02d3",
      "sourceRects": [
        [
          0,
          0,
          1536,
          336
        ],
        [
          0,
          342,
          1536,
          336
        ],
        [
          0,
          684,
          1536,
          340
        ]
      ]
    },
    "sceneV192": {
      "architecture": "lv1201-ancient-ruins",
      "eventKinds": [
        "water-drip",
        "ash-drift"
      ],
      "anchors": [
        0.18,
        0.82
      ],
      "seed": 25
    }
  },
  {
    "id": "xt192-bg386-freya-prospect",
    "label": "BG-386 / Freya’s Prospect",
    "labelEn": "BG-386 / Freya’s Prospect",
    "media": "game",
    "sourceWork": "Aliens vs. Predator (2010)",
    "sourceLocation": "Freya’s Prospect, BG-386",
    "background": "#1e212a",
    "accent": "#838690",
    "floor": "#181615",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/bg386-freya-prospect.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "8ac793a3913f423b1f6b0d31ff2928e3e258c2b8ba1de9d33958ace590bdfd96",
      "sourceRects": [
        [
          0,
          0,
          1536,
          314
        ],
        [
          0,
          318,
          1536,
          364
        ],
        [
          0,
          685,
          1536,
          339
        ]
      ]
    },
    "sceneV192": {
      "architecture": "bg386-freya-prospect",
      "eventKinds": [
        "rain-curtain",
        "freight-transit"
      ],
      "anchors": [
        0.205,
        0.7999999999999999
      ],
      "seed": 26
    }
  },
  {
    "id": "xt192-bg386-pyramid",
    "label": "BG-386 / Pyramide",
    "labelEn": "BG-386 / Pyramid",
    "media": "game",
    "sourceWork": "Aliens vs. Predator (2010)",
    "sourceLocation": "Pyramide ancienne, BG-386",
    "background": "#1c1311",
    "accent": "#807673",
    "floor": "#1b110d",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/bg386-pyramid.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "6160a9766970e9b5335b737dd6f34db9069f1034a730ee03871b17fa86eb1b65",
      "sourceRects": [
        [
          0,
          0,
          1536,
          336
        ],
        [
          0,
          341,
          1536,
          339
        ],
        [
          0,
          685,
          1536,
          339
        ]
      ]
    },
    "sceneV192": {
      "architecture": "bg386-pyramid",
      "eventKinds": [
        "archive-scan",
        "ash-drift"
      ],
      "anchors": [
        0.22999999999999998,
        0.7799999999999999
      ],
      "seed": 27
    }
  },
  {
    "id": "xt192-katanga-refinery",
    "label": "Katanga / Raffinerie",
    "labelEn": "Katanga / Refinery",
    "media": "game",
    "sourceWork": "Aliens: Fireteam Elite (2021)",
    "sourceLocation": "Station Katanga",
    "background": "#192630",
    "accent": "#7c8c98",
    "floor": "#151516",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/katanga-refinery.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "95304ac474b397207ffbec6efd627fb6d2096babd15dd868111d6f57344d4bed",
      "sourceRects": [
        [
          0,
          0,
          1536,
          337
        ],
        [
          0,
          343,
          1536,
          338
        ],
        [
          0,
          687,
          1536,
          337
        ]
      ]
    },
    "sceneV192": {
      "architecture": "katanga-refinery",
      "eventKinds": [
        "freight-transit",
        "reactor-conduit"
      ],
      "anchors": [
        0.18,
        0.76
      ],
      "seed": 28
    }
  },
  {
    "id": "xt192-endeavor-hangar",
    "label": "Endeavor / Hangar",
    "labelEn": "Endeavor / Hangar",
    "media": "game",
    "sourceWork": "Aliens: Fireteam Elite (2021)",
    "sourceLocation": "UAS Endeavor",
    "background": "#1b1f20",
    "accent": "#808484",
    "floor": "#262625",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/endeavor-hangar.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "e9bfba3276e0ed09f749120c82a91130afe3eef7325dec77c85e411f017a7c08",
      "sourceRects": [
        [
          0,
          0,
          1536,
          338
        ],
        [
          0,
          341,
          1536,
          340
        ],
        [
          0,
          684,
          1536,
          340
        ]
      ]
    },
    "sceneV192": {
      "architecture": "endeavor-hangar",
      "eventKinds": [
        "shuttle-approach",
        "airlock-cycle"
      ],
      "anchors": [
        0.205,
        0.82
      ],
      "seed": 29
    }
  },
  {
    "id": "xt192-lv895-engineer-ruins",
    "label": "LV-895 / Ruines des Ingénieurs",
    "labelEn": "LV-895 / Engineer Ruins",
    "media": "game",
    "sourceWork": "Aliens: Fireteam Elite (2021)",
    "sourceLocation": "Ruines des Ingénieurs sur LV-895",
    "background": "#1d282b",
    "accent": "#828e92",
    "floor": "#141919",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/lv895-engineer-ruins.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "da667028cd088ccfacde51ec69d3f68bc61aa1c0102c16a4b179355aea3ac65e",
      "sourceRects": [
        [
          0,
          0,
          1536,
          337
        ],
        [
          0,
          341,
          1536,
          338
        ],
        [
          0,
          683,
          1536,
          341
        ]
      ]
    },
    "sceneV192": {
      "architecture": "lv895-engineer-ruins",
      "eventKinds": [
        "spore-drift",
        "water-drip"
      ],
      "anchors": [
        0.22999999999999998,
        0.7999999999999999
      ],
      "seed": 30
    }
  },
  {
    "id": "xt192-lethe-dead-hills",
    "label": "Lethe / Dead Hills",
    "labelEn": "Lethe / Dead Hills",
    "media": "game",
    "sourceWork": "Aliens: Dark Descent (2023)",
    "sourceLocation": "Colonie de Dead Hills, Lethe",
    "background": "#131317",
    "accent": "#76757a",
    "floor": "#1e1918",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/lethe-dead-hills.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "871ffcc7041091fe6da8d6719f2749da40f7b3e7ec5ce9db97291fd0343599cf",
      "sourceRects": [
        [
          0,
          0,
          1536,
          337
        ],
        [
          0,
          342,
          1536,
          340
        ],
        [
          0,
          686,
          1536,
          338
        ]
      ]
    },
    "sceneV192": {
      "architecture": "lethe-dead-hills",
      "eventKinds": [
        "sand-drift",
        "searchlight-sweep"
      ],
      "anchors": [
        0.18,
        0.7799999999999999
      ],
      "seed": 31
    }
  },
  {
    "id": "xt192-lethe-berkleys-docks",
    "label": "Lethe / Quais de Berkley",
    "labelEn": "Lethe / Berkley’s Docks",
    "media": "game",
    "sourceWork": "Aliens: Dark Descent (2023)",
    "sourceLocation": "Berkley’s Docks, Lethe",
    "background": "#272221",
    "accent": "#8e8886",
    "floor": "#1e1b19",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/lethe-berkleys-docks.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "55ec6435783644a1676cbd3beadeec3d3d63b08612f72d3a854a7913e050b667",
      "sourceRects": [
        [
          0,
          0,
          1536,
          337
        ],
        [
          0,
          342,
          1536,
          337
        ],
        [
          0,
          684,
          1536,
          340
        ]
      ]
    },
    "sceneV192": {
      "architecture": "lethe-berkleys-docks",
      "eventKinds": [
        "freight-transit",
        "rail-transit"
      ],
      "anchors": [
        0.205,
        0.76
      ],
      "seed": 32
    }
  },
  {
    "id": "xt192-lethe-pioneer-station",
    "label": "Lethe / Pioneer Station",
    "labelEn": "Lethe / Pioneer Station",
    "media": "game",
    "sourceWork": "Aliens: Dark Descent (2023)",
    "sourceLocation": "Pioneer Station, orbite de Lethe",
    "background": "#262a2f",
    "accent": "#8c9198",
    "floor": "#2a282a",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/lethe-pioneer-station.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "29767429874a8bc548322968b4e5791e7159ca463ceb6b3beff22f7001a683bf",
      "sourceRects": [
        [
          0,
          0,
          1536,
          344
        ],
        [
          0,
          348,
          1536,
          379
        ],
        [
          0,
          732,
          1536,
          292
        ]
      ]
    },
    "sceneV192": {
      "architecture": "lethe-pioneer-station",
      "eventKinds": [
        "orbital-transit",
        "airlock-cycle"
      ],
      "anchors": [
        0.22999999999999998,
        0.82
      ],
      "seed": 33
    }
  },
  {
    "id": "xt192-otago-flight-deck",
    "label": "Otago / Pont d’envol",
    "labelEn": "Otago / Flight Deck",
    "media": "game",
    "sourceWork": "Aliens: Dark Descent (2023)",
    "sourceLocation": "USS Otago, épave sur Lethe",
    "background": "#111416",
    "accent": "#73767a",
    "floor": "#1b1b1c",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/otago-flight-deck.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "b042c36b08974c1723542e5363c4258793126037901df3edfc778d06a9c29228",
      "sourceRects": [
        [
          0,
          0,
          1536,
          335
        ],
        [
          0,
          339,
          1536,
          381
        ],
        [
          0,
          724,
          1536,
          300
        ]
      ]
    },
    "sceneV192": {
      "architecture": "otago-flight-deck",
      "eventKinds": [
        "shuttle-approach",
        "coolant-plume"
      ],
      "anchors": [
        0.18,
        0.7999999999999999
      ],
      "seed": 34
    }
  },
  {
    "id": "xt192-purdan-zeta-colony",
    "label": "Purdan / Colonie Zeta",
    "labelEn": "Purdan / Zeta Colony",
    "media": "game",
    "sourceWork": "Alien: Rogue Incursion (2024)",
    "sourceLocation": "Purdan, installation Gemini Exoplanet Solutions",
    "background": "#181d22",
    "accent": "#7c8287",
    "floor": "#131413",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/games/purdan-zeta-colony.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1536,
      "height": 1024,
      "sha256": "d33134258f0e2759c1835e1b4bb3f83b8814ed9f6447a5d7e6805823b225f7eb",
      "sourceRects": [
        [
          0,
          0,
          1536,
          337
        ],
        [
          0,
          342,
          1536,
          341
        ],
        [
          0,
          689,
          1536,
          335
        ]
      ]
    },
    "sceneV192": {
      "architecture": "purdan-zeta-colony",
      "eventKinds": [
        "coolant-plume",
        "searchlight-sweep"
      ],
      "anchors": [
        0.205,
        0.7799999999999999
      ],
      "seed": 35
    }
  },
  {
    "id": "xt192-ryushi-prosperity-wells",
    "label": "Ryushi / Prosperity Wells",
    "labelEn": "Ryushi / Prosperity Wells",
    "media": "comic",
    "sourceWork": "Aliens vs. Predator (1990)",
    "sourceLocation": "Prosperity Wells",
    "background": "#3d3d3b",
    "accent": "#a8a8a5",
    "floor": "#0e1110",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/ryushi-prosperity-wells.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1774,
      "height": 887,
      "sha256": "dc50d20a20f7ea7ded9b4bd9bde6dc5741862509d6201917a5f5378f520c6ee2",
      "sourceRects": [
        [
          0,
          0,
          1774,
          287
        ],
        [
          0,
          291,
          1774,
          330
        ],
        [
          0,
          625,
          1774,
          262
        ]
      ]
    },
    "sceneV192": {
      "architecture": "ryushi-prosperity-wells",
      "eventKinds": [
        "sand-drift",
        "freight-transit"
      ],
      "anchors": [
        0.22999999999999998,
        0.76
      ],
      "seed": 36
    }
  },
  {
    "id": "xt192-charon-rogue-lab",
    "label": "Charon / Complexe Rogue",
    "labelEn": "Charon / Rogue Complex",
    "media": "comic",
    "sourceWork": "Aliens: Rogue",
    "sourceLocation": "Charon experimental complex",
    "background": "#111818",
    "accent": "#737c7c",
    "floor": "#0a0c0a",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/charon-rogue-lab.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "21c93e6f9f0487d8224cf3a8e41d18026a50cfae87165640806295f8763c12b6",
      "sourceRects": [
        [
          0,
          0,
          2172,
          214
        ],
        [
          0,
          223,
          2172,
          286
        ],
        [
          0,
          511,
          2172,
          213
        ]
      ]
    },
    "sceneV192": {
      "architecture": "charon-rogue-lab",
      "eventKinds": [
        "containment-scan",
        "airlock-cycle"
      ],
      "anchors": [
        0.18,
        0.82
      ],
      "seed": 37
    }
  },
  {
    "id": "xt192-innominata-labyrinth",
    "label": "Innominata / Labyrinthe",
    "labelEn": "Innominata / Labyrinth",
    "media": "comic",
    "sourceWork": "Aliens: Labyrinth",
    "sourceLocation": "Innominata research station",
    "background": "#121715",
    "accent": "#757a78",
    "floor": "#0a0c0b",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/innominata-labyrinth.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "eff888fc1f07fc30d6bd4c1c65ee9b761ade346d26cdcf9951b9894e3431e1bb",
      "sourceRects": [
        [
          0,
          0,
          2172,
          215
        ],
        [
          0,
          224,
          2172,
          278
        ],
        [
          0,
          504,
          2172,
          220
        ]
      ]
    },
    "sceneV192": {
      "architecture": "innominata-labyrinth",
      "eventKinds": [
        "hive-movement",
        "archive-scan"
      ],
      "anchors": [
        0.205,
        0.7999999999999999
      ],
      "seed": 38
    }
  },
  {
    "id": "xt192-sphacteria-dead-orbit",
    "label": "Sphacteria / Orbite morte",
    "labelEn": "Sphacteria / Dead Orbit",
    "media": "comic",
    "sourceWork": "Aliens: Dead Orbit",
    "sourceLocation": "Sphacteria orbital facility",
    "background": "#111112",
    "accent": "#747374",
    "floor": "#100d0c",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/sphacteria-dead-orbit.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "e4c67cd99512c91541508f46ab651647999ac2474fc4522f141f0efc5d306d10",
      "sourceRects": [
        [
          0,
          0,
          2172,
          218
        ],
        [
          0,
          221,
          2172,
          293
        ],
        [
          0,
          516,
          2172,
          208
        ]
      ]
    },
    "sceneV192": {
      "architecture": "sphacteria-dead-orbit",
      "eventKinds": [
        "orbital-transit",
        "coolant-plume"
      ],
      "anchors": [
        0.22999999999999998,
        0.7799999999999999
      ],
      "seed": 39
    }
  },
  {
    "id": "xt192-xenomorph-prime-genocide",
    "label": "Genocide / Monde des ruches",
    "labelEn": "Genocide / Hive World",
    "media": "comic",
    "sourceWork": "Aliens: Genocide",
    "sourceLocation": "Planet of the rival red and black xenomorph hives",
    "background": "#2f1818",
    "accent": "#987b7b",
    "floor": "#0f0908",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/xenomorph-prime-genocide.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1672,
      "height": 941,
      "sha256": "654d1aadf486ac3eb19e55e5b569256719573204590014fe178c90d779c6fe67",
      "sourceRects": [
        [
          0,
          0,
          1672,
          307
        ],
        [
          0,
          311,
          1672,
          312
        ],
        [
          0,
          625,
          1672,
          316
        ]
      ]
    },
    "sceneV192": {
      "architecture": "xenomorph-prime-genocide",
      "eventKinds": [
        "hive-movement",
        "ash-drift"
      ],
      "anchors": [
        0.18,
        0.76
      ],
      "seed": 40
    }
  },
  {
    "id": "xt192-epsilon-station",
    "label": "Station Epsilon / Quarantaine",
    "labelEn": "Epsilon Station / Quarantine",
    "media": "comic",
    "sourceWork": "Alien (2021) #2–3",
    "sourceLocation": "Epsilon Station",
    "background": "#141e27",
    "accent": "#77828e",
    "floor": "#0c0f11",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/epsilon-station.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "6addf6baae1d6d4c94464a949aad02fd3ff3c0054ceaade46ae5898046c3e7d9",
      "sourceRects": [
        [
          0,
          0,
          2172,
          218
        ],
        [
          0,
          225,
          2172,
          260
        ],
        [
          0,
          487,
          2172,
          237
        ]
      ]
    },
    "sceneV192": {
      "architecture": "epsilon-station",
      "eventKinds": [
        "containment-scan",
        "reactor-conduit"
      ],
      "anchors": [
        0.205,
        0.82
      ],
      "seed": 41
    }
  },
  {
    "id": "xt192-tobler-nine-factory",
    "label": "Tobler-9 / Usine gelée",
    "labelEn": "Tobler-9 / Frozen Factory",
    "media": "comic",
    "sourceWork": "Alien (2022) #2–3",
    "sourceLocation": "Tobler-9",
    "background": "#231f36",
    "accent": "#89849f",
    "floor": "#1b1a24",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/tobler-nine-factory.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "772bede44986215228268cc82b4b48d1979843d538f8fe13cd453d1fa5ded66b",
      "sourceRects": [
        [
          0,
          0,
          2172,
          232
        ],
        [
          0,
          238,
          2172,
          242
        ],
        [
          0,
          483,
          2172,
          241
        ]
      ]
    },
    "sceneV192": {
      "architecture": "tobler-nine-factory",
      "eventKinds": [
        "freight-transit",
        "coolant-plume"
      ],
      "anchors": [
        0.22999999999999998,
        0.7999999999999999
      ],
      "seed": 42
    }
  },
  {
    "id": "xt192-earth-war-city",
    "label": "Terre / Ville infestée",
    "labelEn": "Earth / Infested City",
    "media": "comic",
    "sourceWork": "Aliens: Earth War",
    "sourceLocation": "Unspecified infested urban district on Earth",
    "background": "#1c1216",
    "accent": "#80757a",
    "floor": "#0d0c0d",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/earth-war-city.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "0b9eaa73e94c594f99554e77ac553485a8694aadbc41d117cd62df0d09ccfba4",
      "sourceRects": [
        [
          0,
          0,
          2172,
          234
        ],
        [
          0,
          240,
          2172,
          281
        ],
        [
          0,
          524,
          2172,
          200
        ]
      ]
    },
    "sceneV192": {
      "architecture": "earth-war-city",
      "eventKinds": [
        "ash-drift",
        "searchlight-sweep"
      ],
      "anchors": [
        0.18,
        0.7799999999999999
      ],
      "seed": 43
    }
  },
  {
    "id": "xt192-lv178-trimonite-mine",
    "label": "LV-178 / Mine de trimonite",
    "labelEn": "LV-178 / Trimonite Mine",
    "media": "novel",
    "sourceWork": "Alien: Out of the Shadows",
    "sourceLocation": "LV-178 trimonite mine",
    "background": "#1c1510",
    "accent": "#807872",
    "floor": "#0c0907",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/lv178-trimonite-mine.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "9c35260d1aff16991e1338ef2c1dd839ec42bd434152051de211f2de2d292ff7",
      "sourceRects": [
        [
          0,
          0,
          2172,
          235
        ],
        [
          0,
          243,
          2172,
          260
        ],
        [
          0,
          505,
          2172,
          219
        ]
      ]
    },
    "sceneV192": {
      "architecture": "lv178-trimonite-mine",
      "eventKinds": [
        "sand-drift",
        "freight-transit"
      ],
      "anchors": [
        0.205,
        0.76
      ],
      "seed": 44
    }
  },
  {
    "id": "xt192-marion-engineering",
    "label": "Marion / Salle des machines",
    "labelEn": "Marion / Engineering",
    "media": "novel",
    "sourceWork": "Alien: Out of the Shadows",
    "sourceLocation": "Marion mining vessel",
    "background": "#121411",
    "accent": "#747673",
    "floor": "#0a0a07",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/marion-engineering.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "de2da77be656bccb6842e2471022f7bca35777ed97e4340ae82f31302593c099",
      "sourceRects": [
        [
          0,
          0,
          2172,
          217
        ],
        [
          0,
          225,
          2172,
          272
        ],
        [
          0,
          499,
          2172,
          225
        ]
      ]
    },
    "sceneV192": {
      "architecture": "marion-engineering",
      "eventKinds": [
        "coolant-plume",
        "airlock-cycle"
      ],
      "anchors": [
        0.22999999999999998,
        0.82
      ],
      "seed": 45
    }
  },
  {
    "id": "xt192-cold-forge-containment",
    "label": "Cold Forge / Confinement",
    "labelEn": "Cold Forge / Containment",
    "media": "novel",
    "sourceWork": "Alien: The Cold Forge",
    "sourceLocation": "RB-232 / Cold Forge station",
    "background": "#21303c",
    "accent": "#8698a6",
    "floor": "#0b1013",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/cold-forge-containment.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "c4205a0013038a0e53f866a09d8ef0e5d4d2ed73e4b492b7a16762c78d8c734f",
      "sourceRects": [
        [
          0,
          0,
          2172,
          232
        ],
        [
          0,
          238,
          2172,
          268
        ],
        [
          0,
          509,
          2172,
          215
        ]
      ]
    },
    "sceneV192": {
      "architecture": "cold-forge-containment",
      "eventKinds": [
        "containment-scan",
        "archive-scan"
      ],
      "anchors": [
        0.18,
        0.7999999999999999
      ],
      "seed": 46
    }
  },
  {
    "id": "xt192-charybdis-industrial",
    "label": "Charybdis / Terminal industriel",
    "labelEn": "Charybdis / Industrial Terminal",
    "media": "novel",
    "sourceWork": "Alien: Into Charybdis",
    "sourceLocation": "Charybdis colony industrial installation",
    "background": "#332721",
    "accent": "#9b8d86",
    "floor": "#17130f",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/charybdis-industrial.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "3ddcc32166848597a1638ac856d9a9e5f84541a9948fe42ce29d98bb5b110a96",
      "sourceRects": [
        [
          0,
          0,
          2172,
          231
        ],
        [
          0,
          238,
          2172,
          262
        ],
        [
          0,
          503,
          2172,
          221
        ]
      ]
    },
    "sceneV192": {
      "architecture": "charybdis-industrial",
      "eventKinds": [
        "ocean-swell",
        "storm-front"
      ],
      "anchors": [
        0.205,
        0.7799999999999999
      ],
      "seed": 47
    }
  },
  {
    "id": "xt192-ataegina-mountain-hold",
    "label": "Ataegina / Refuge de montagne",
    "labelEn": "Ataegina / Mountain Hold",
    "media": "novel",
    "sourceWork": "Alien: Phalanx",
    "sourceLocation": "Unnamed mountain hold on Ataegina",
    "background": "#242222",
    "accent": "#8a8888",
    "floor": "#1c1815",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/ataegina-mountain-hold.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 1774,
      "height": 887,
      "sha256": "a7a8d0e248ec951c10a7cc9d8a39bf85166765eaf6da0f9f04a9b60844291370",
      "sourceRects": [
        [
          0,
          0,
          1774,
          292
        ],
        [
          0,
          298,
          1774,
          288
        ],
        [
          0,
          591,
          1774,
          296
        ]
      ]
    },
    "sceneV192": {
      "architecture": "ataegina-mountain-hold",
      "eventKinds": [
        "ash-drift",
        "searchlight-sweep"
      ],
      "anchors": [
        0.22999999999999998,
        0.76
      ],
      "seed": 48
    }
  },
  {
    "id": "xt192-jericho-three-laboratory",
    "label": "Jericho 3 / Laboratoire",
    "labelEn": "Jericho 3 / Laboratory",
    "media": "novel",
    "sourceWork": "Alien: Prototype",
    "sourceLocation": "Jericho 3 industrial research installation",
    "background": "#191d22",
    "accent": "#7c8188",
    "floor": "#0c0c0c",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/jericho-three-laboratory.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "2872ed8059c2296f6cbd21a4d8324086273b02b59f62cb0e8e4caab4ce89540c",
      "sourceRects": [
        [
          0,
          0,
          2172,
          229
        ],
        [
          0,
          235,
          2172,
          262
        ],
        [
          0,
          499,
          2172,
          225
        ]
      ]
    },
    "sceneV192": {
      "architecture": "jericho-three-laboratory",
      "eventKinds": [
        "containment-scan",
        "airlock-cycle"
      ],
      "anchors": [
        0.18,
        0.82
      ],
      "seed": 49
    }
  },
  {
    "id": "xt192-euryale-rainforest",
    "label": "Euryale / Forêt humide",
    "labelEn": "Euryale / Rainforest",
    "media": "novel",
    "sourceWork": "Alien: Echo",
    "sourceLocation": "Euryale colony rainforest",
    "background": "#0e1c23",
    "accent": "#6f8188",
    "floor": "#070e0e",
    "backdrop": "/assets/openai/stages/xeno-trials-v192/print/euryale-rainforest.png",
    "stageRevision": 192,
    "assetStatus": "new-franchise-location-layer-atlas",
    "canonStatus": "franchise-location-project-adaptation",
    "canonExact": false,
    "affectsCombat": false,
    "atlasV192": {
      "width": 2172,
      "height": 724,
      "sha256": "16df35ff70087c38ad054248560d8dbf47fa656e5d985d7500aad994dc83aae0",
      "sourceRects": [
        [
          0,
          0,
          2172,
          237
        ],
        [
          0,
          243,
          2172,
          235
        ],
        [
          0,
          483,
          2172,
          241
        ]
      ]
    },
    "sceneV192": {
      "architecture": "euryale-rainforest",
      "eventKinds": [
        "rain-curtain",
        "spore-drift"
      ],
      "anchors": [
        0.205,
        0.7999999999999999
      ],
      "seed": 50
    }
  }
]);
