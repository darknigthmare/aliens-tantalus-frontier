/** Individually viewed native plates, with source-pixel control anchors and
 * small supported upper-body key poses. These sparse presentation rigs do not
 * reconstruct hidden joints, full walks, floor captures or source-game motion.
 * Original source PNGs and historical V154/V163 data remain unchanged. */
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
export const XENO_TRIALS_RIG_DATA_V165 = freeze([
  {
    "id": "rig-v165-runner",
    "fighterId": "runner",
    "profileId": "castes-film_runner_alien3_1992",
    "path": "/assets/user/castes-v87/film_runner_alien3_1992.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "f117c7ad0e6da9a02d3a4ce315066d75acfd67a909620f560ff6cd8c3d7b64b3",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          743,
          497
        ],
        "tip": [
          743,
          511
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          743,
          497
        ],
        "tip": [
          1084,
          489
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1191,
          394
        ],
        "tip": [
          1424,
          427
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          448,
          792
        ],
        "tip": [
          448,
          806
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          930,
          779
        ],
        "tip": [
          930,
          793
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1245,
          792
        ],
        "tip": [
          1245,
          806
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1470,
          755
        ],
        "tip": [
          1470,
          769
        ]
      }
    ],
    "pinned": [
      0,
      576,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1084,
          489
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1424,
          427
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1245,
          792
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1470,
          755
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          448,
          792
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          930,
          779
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0800081000001401461000700053fe023ffe7fffffffffffe7fff271ffbc3fffde7b0fe70bf77f0958ff4bcfb7480002"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Four low supports and a long tail; no authored limb-stepping or tail clip.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-arachnoid",
    "fighterId": "arachnoid",
    "profileId": "castes-game_avp_capcom_arachnoid",
    "path": "/assets/user/castes-v87/game_avp_capcom_arachnoid.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "84f47e12acfa88b5658a736863e4ad8b61a9b43bfa5cb61a34abe87649b2e3ee",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          536,
          684
        ],
        "tip": [
          536,
          698
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          536,
          684
        ],
        "tip": [
          797,
          647
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          971,
          593
        ],
        "tip": [
          1183,
          688
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          324,
          974
        ],
        "tip": [
          324,
          988
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          826,
          974
        ],
        "tip": [
          826,
          988
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1366,
          949
        ],
        "tip": [
          1366,
          963
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1125,
          920
        ],
        "tip": [
          1125,
          934
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          797,
          647
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1183,
          688
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1366,
          949
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1125,
          920
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          324,
          974
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          826,
          974
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "3ffc081fff001fff207dfb90dbcf801ff7f81ffff87ffff8fffffcabfffc2ffff61fff7c1e1feebdbfffdffbff5fdebe"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Low planted foreclaws stay fixed below the forward head.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-defender",
    "fighterId": "defender",
    "profileId": "pose-v95-user-xeno-defender",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-56-xeno-defender.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "729a6d131424591995e8f948f9f0e6059fe0a82397a5c54f28d1269a0b46cb83",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          368,
          988
        ],
        "tip": [
          368,
          1002
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          368,
          988
        ],
        "tip": [
          628,
          1007
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          727,
          936
        ],
        "tip": [
          807,
          1049
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          264,
          1342
        ],
        "tip": [
          264,
          1356
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          543,
          1331
        ],
        "tip": [
          543,
          1345
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          801,
          1269
        ],
        "tip": [
          793,
          1291
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          892,
          1347
        ],
        "tip": [
          892,
          1361
        ]
      }
    ],
    "pinned": [
      0,
      1088,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          628,
          1007
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          807,
          1049
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          801,
          1269
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          892,
          1347
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          264,
          1342
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          543,
          1331
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "00001d003fc01fa019e0718037903b6039c01f901f043d400df22ff83ffc1ffc1ffc59f83bf21bff7fff3ffe77f617f8"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Four visible support patches are fixed. The tall looping tail has no dedicated clip; unpinned pixels retain nearest-bone weights.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-grid",
    "fighterId": "grid",
    "profileId": "castes-film_grid_avp_2004",
    "path": "/assets/user/castes-v87/film_grid_avp_2004.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "49d756a01928adb1c3fa787d47efbb158da988699fd9d0008bf9a723a7002a74",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          976,
          564
        ],
        "tip": [
          976,
          578
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          976,
          564
        ],
        "tip": [
          1108,
          423
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1175,
          261
        ],
        "tip": [
          1266,
          182
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          851,
          954
        ],
        "tip": [
          851,
          968
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1324,
          954
        ],
        "tip": [
          1324,
          968
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1480,
          573
        ],
        "tip": [
          1480,
          587
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1233,
          614
        ],
        "tip": [
          1233,
          628
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1108,
          423
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1266,
          182
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1480,
          573
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1233,
          614
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          851,
          954
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1324,
          954
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0803f00007fa140ffc400ffd0007fc0027f2040ffd022ffe3e2fff7e5fffe47ffade7ff9fffe3e7ffdf05ffdbc5afebc"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Upright marked dome; both painted toe regions stay fixed. There is no dedicated tail animation.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-spitter",
    "fighterId": "spitter",
    "profileId": "castes-game_acm_spitter",
    "path": "/assets/user/castes-v87/game_acm_spitter.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "c281ad7c020999e2796af1c904be45c028bd8643e45bfc45b93edaf5ba4642c7",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          880,
          651
        ],
        "tip": [
          880,
          665
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          880,
          651
        ],
        "tip": [
          1133,
          481
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1241,
          415
        ],
        "tip": [
          1407,
          477
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          610,
          937
        ],
        "tip": [
          610,
          951
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1125,
          937
        ],
        "tip": [
          1125,
          951
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1453,
          784
        ],
        "tip": [
          1456,
          793
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1133,
          481
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1407,
          477
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1453,
          784
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          610,
          937
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1125,
          937
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "1c8238040ffb1c0fff484ffc8ebffc7feffeffffffdeffffcfbfefec8ff7f73ffeff7fde7effbfbfdfef45f4f868f47a"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Forward sloped head and dorsal crest; no independent tail clip. The far hand is occluded and is not reconstructed or reported as a contact.",
    "occludedContactsV165": [
      "handFar"
    ],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-razor-claws",
    "fighterId": "razor-claws",
    "profileId": "castes-game_avp_capcom_razor_claws",
    "path": "/assets/user/castes-v87/game_avp_capcom_razor_claws.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "a1d024f5a20e4a7210b7f77f011ed2f81e6a177ba787afd07a430b5cd71d1987",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          843,
          630
        ],
        "tip": [
          843,
          644
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          843,
          630
        ],
        "tip": [
          942,
          386
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1046,
          332
        ],
        "tip": [
          1200,
          348
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          585,
          970
        ],
        "tip": [
          585,
          984
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1117,
          958
        ],
        "tip": [
          1117,
          972
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          810,
          428
        ],
        "tip": [
          810,
          442
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1290,
          485
        ],
        "tip": [
          1290,
          499
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          942,
          386
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1200,
          348
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          810,
          428
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1290,
          485
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          585,
          970
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1117,
          958
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0098c8009fd8013fe4003ff001bff000bffa003fff309ffe799ffe7ffffe7bffdcfff8d88ff5c197e39879fff008e5e0"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Long foreclaws and pink crest retain their original pose.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-chrysalis",
    "fighterId": "chrysalis",
    "profileId": "castes-game_avp_capcom_chrysalis",
    "path": "/assets/openai/sprites/static-enemy-v93/game_avp_capcom_chrysalis.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "616aeca6329e615cd42be6324d50de450d22b62d8950c7891acaf56e4a70abb7",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          901,
          522
        ],
        "tip": [
          901,
          536
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          901,
          522
        ],
        "tip": [
          1061,
          419
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1216,
          357
        ],
        "tip": [
          1391,
          357
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          731,
          813
        ],
        "tip": [
          731,
          827
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1133,
          813
        ],
        "tip": [
          1133,
          825
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1349,
          614
        ],
        "tip": [
          1349,
          628
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1187,
          677
        ],
        "tip": [
          1187,
          691
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1061,
          419
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1391,
          357
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1349,
          614
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1187,
          677
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          731,
          813
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1133,
          813
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0c4ddc000ebf1013fe0017ff001fff207ffe7c7fff7cfffddffffffffffe7ffffffffefe7ffff6dffffc51ffee003bd0"
    },
    "poses": {
      "intro": {
        "spine": -0.161,
        "head": 0.84
      },
      "restraint": {
        "spine": 0.1725,
        "head": -0.56
      },
      "struggle": {
        "spine": 0.23,
        "head": -0.98
      },
      "release": {
        "spine": -0.092,
        "head": 0.35
      },
      "round-win": {
        "spine": -0.1265,
        "head": -0.7
      },
      "round-loss": {
        "spine": 0.207,
        "head": 0.805
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Small original pixel-art creature with an armored curved shell.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.14,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-smasher",
    "fighterId": "smasher",
    "profileId": "castes-game_avp_capcom_smasher",
    "path": "/assets/openai/sprites/static-enemy-v92/game_avp_capcom_smasher.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "0efaa9b6afe6f817567725d7aae0b57c15093d1f68a8e480bb34ede566c7dee8",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          839,
          585
        ],
        "tip": [
          840,
          585
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          839,
          585
        ],
        "tip": [
          984,
          439
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1034,
          344
        ],
        "tip": [
          1196,
          303
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          726,
          832
        ],
        "tip": [
          726,
          846
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1071,
          871
        ],
        "tip": [
          1071,
          885
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1158,
          539
        ],
        "tip": [
          1158,
          550
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1011,
          571
        ],
        "tip": [
          1011,
          585
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          984,
          439
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1196,
          303
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1158,
          539
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1011,
          571
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          726,
          832
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1071,
          871
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "094dc80403e9041fcc783ffc5e1ffe9f3ffc3fbffa3ffffc7fffff1bfff85fffec0ffffe03fff043fff804ffdc00ffd0"
    },
    "poses": {
      "intro": {
        "spine": -0.154,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.165,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.22,
        "head": -0.91
      },
      "release": {
        "spine": -0.088,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.121,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.198,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "pixel-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Low-resolution native pixels are kept; no replacement rendering or smoothing.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-predalien",
    "fighterId": "predalien",
    "profileId": "castes-game_predalien_avp2_primal_hunt",
    "path": "/assets/user/castes-v87/game_predalien_avp2_primal_hunt.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "3c39acccb5bcfd571026d2511553946078be96b4f2c0e2c2470b39197f770bb5",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          1046,
          626
        ],
        "tip": [
          1046,
          640
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          1046,
          626
        ],
        "tip": [
          1133,
          398
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1171,
          245
        ],
        "tip": [
          1266,
          191
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          926,
          925
        ],
        "tip": [
          926,
          939
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1183,
          916
        ],
        "tip": [
          1183,
          930
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          955,
          638
        ],
        "tip": [
          955,
          652
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1367,
          637
        ],
        "tip": [
          1370,
          647
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1133,
          398
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1266,
          191
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          955,
          638
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1367,
          637
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          926,
          925
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1183,
          916
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0008e08c01f27811f87803f83c07f81cf7f80e67f417fff94bfffd2fd3fe25fbfe121bfb0017660006e04057f8480782"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Separate dreadlock/head and ribcage anchors, grounded digitigrade feet.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-xenoborg",
    "fighterId": "xenoborg",
    "profileId": "castes-game_xenoborg_avp1999",
    "path": "/assets/user/castes-v87/game_xenoborg_avp1999.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "d6532326d96fbdd14e7feb8d19946b92edac55a0f8ae88ccc916cc692b192a09",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          976,
          589
        ],
        "tip": [
          976,
          603
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          976,
          589
        ],
        "tip": [
          1071,
          423
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1096,
          286
        ],
        "tip": [
          1200,
          211
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          818,
          925
        ],
        "tip": [
          818,
          939
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1142,
          925
        ],
        "tip": [
          1142,
          939
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1138,
          516
        ],
        "tip": [
          1138,
          530
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1167,
          638
        ],
        "tip": [
          1167,
          652
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1071,
          423
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1200,
          211
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1138,
          516
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1167,
          638
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          818,
          925
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1142,
          925
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "080c08000bf8e007f8e007f2700ff2300fc8382ffedc27ff2f07ff079ffe23fffe326778038fe0031ce0401cf0021c02"
    },
    "poses": {
      "intro": {
        "spine": -0.112,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.12,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.16,
        "head": -0.7
      },
      "release": {
        "spine": -0.064,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.088,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.144,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "robot-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Two forward gun barrels share one rigid transform.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            1054,
            402
          ],
          [
            1511,
            402
          ],
          [
            1511,
            742
          ],
          [
            1054,
            742
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-royal-guard",
    "fighterId": "royal-guard",
    "profileId": "castes-game_avp_capcom_royal_guard",
    "path": "/assets/user/castes-v87/game_avp_capcom_royal_guard.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "f8678cd4d343ec643c79791258fc4d25540aba43de40fc4b20ae720818b04cd3",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          934,
          601
        ],
        "tip": [
          934,
          615
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          934,
          601
        ],
        "tip": [
          1046,
          415
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1100,
          265
        ],
        "tip": [
          1213,
          248
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          735,
          954
        ],
        "tip": [
          735,
          968
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1129,
          941
        ],
        "tip": [
          1129,
          946
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1220,
          518
        ],
        "tip": [
          1220,
          532
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1333,
          473
        ],
        "tip": [
          1333,
          487
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1046,
          415
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1213,
          248
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1220,
          518
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1333,
          473
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          735,
          954
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1129,
          941
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "081c0c00bf1305ffe671fff401fffe00bfffb4bff5d03ffd0bfffdfffffb7ffffb7ffffefffdfe7ff7fa7ffff04af864"
    },
    "poses": {
      "intro": {
        "spine": -0.161,
        "head": 0.84
      },
      "restraint": {
        "spine": 0.1725,
        "head": -0.56
      },
      "struggle": {
        "spine": 0.23,
        "head": -0.98
      },
      "release": {
        "spine": -0.092,
        "head": 0.35
      },
      "round-win": {
        "spine": -0.1265,
        "head": -0.7
      },
      "round-loss": {
        "spine": 0.207,
        "head": 0.805
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Broad golden crown uses restrained motion above fixed thighs and toes.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.14,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-queen",
    "fighterId": "queen",
    "profileId": "castes-film_queen_aliens_1986",
    "path": "/assets/user/castes-v87/film_queen_aliens_1986.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "985abf27db63400d8a6a68101bfaa7dde3335da0e8986ea85c409ab30da5e991",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          901,
          651
        ],
        "tip": [
          901,
          665
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          901,
          651
        ],
        "tip": [
          1100,
          481
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1284,
          399
        ],
        "tip": [
          1465,
          452
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          760,
          941
        ],
        "tip": [
          760,
          955
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1225,
          929
        ],
        "tip": [
          1225,
          943
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1345,
          616
        ],
        "tip": [
          1344,
          616
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1490,
          705
        ],
        "tip": [
          1491,
          719
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1100,
          481
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1465,
          452
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1345,
          616
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1490,
          705
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          760,
          941
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1225,
          929
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "081dac003fe8046fff10fffc407ffe00dfff34cfff78ffffdd7ffb7effffedeff7dbdff3ffd9feffdbf7fdbbbafebdbe"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Huge crown and hanging smaller forearms remain a native painted silhouette.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-ravager",
    "fighterId": "ravager",
    "profileId": "castes-game_avp_extinction_ravager",
    "path": "/assets/user/castes-v87/game_avp_extinction_ravager.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "7e2d1e236ef7de411c5458aee40520951c2c6dec2dc932a21164eea087738cbe",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          814,
          692
        ],
        "tip": [
          814,
          706
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          814,
          692
        ],
        "tip": [
          1034,
          531
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1100,
          394
        ],
        "tip": [
          1266,
          390
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          689,
          908
        ],
        "tip": [
          689,
          922
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1025,
          920
        ],
        "tip": [
          1025,
          934
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1241,
          738
        ],
        "tip": [
          1241,
          752
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1436,
          676
        ],
        "tip": [
          1436,
          690
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1034,
          531
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1266,
          390
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1241,
          738
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1436,
          676
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          689,
          908
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1025,
          920
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "087988147feb142f7c105ffc117ff7703ffaf27ffbf9fffbfd9fffffffff27ffff3ebfff13ffbb87ffd849fbfa49a1c2"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Long blade arms are fixed, not stretched or reposed.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-crusher-acm",
    "fighterId": "crusher-acm",
    "profileId": "castes-game_acm_crusher",
    "path": "/assets/user/castes-v87/game_acm_crusher.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "eca7855c29455b87bf9fc4e26afe2ab07adbd3ff4afa2c5ffb36dc6b4ebc2baa",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          639,
          614
        ],
        "tip": [
          639,
          628
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          639,
          614
        ],
        "tip": [
          1121,
          551
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1283,
          431
        ],
        "tip": [
          1411,
          506
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          544,
          808
        ],
        "tip": [
          544,
          822
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          922,
          792
        ],
        "tip": [
          922,
          806
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1146,
          842
        ],
        "tip": [
          1146,
          856
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1445,
          800
        ],
        "tip": [
          1445,
          814
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1121,
          551
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1411,
          506
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1146,
          842
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1445,
          800
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          544,
          808
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          922,
          792
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "08204c000400200ec0005ff8001ffe000fff041fff003fff01ffff0ffffebffff8ffff9c79cfff35d7ff7604606bc016"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Heavy low armored shell rests on its original four painted support positions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-boiler",
    "fighterId": "boiler",
    "profileId": "castes-game_acm_boiler",
    "path": "/assets/user/castes-v87/game_acm_boiler.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "c1385916ec2e5bb3f1d6ff421f2a58850cb907697bdbcc7845d3b1f729f00ac1",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          953,
          720
        ],
        "tip": [
          947,
          734
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          953,
          720
        ],
        "tip": [
          1154,
          556
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1299,
          419
        ],
        "tip": [
          1465,
          473
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          722,
          966
        ],
        "tip": [
          722,
          980
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1187,
          966
        ],
        "tip": [
          1187,
          980
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1216,
          696
        ],
        "tip": [
          1216,
          710
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          983,
          670
        ],
        "tip": [
          977,
          678
        ]
      }
    ],
    "pinned": [
      0,
      832,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1154,
          556
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1465,
          473
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1216,
          696
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          983,
          670
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          722,
          966
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1187,
          966
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0808e00003f20001f80003fc0007fe003bff0407ff001fff007ff3fffff07ffff7025ff03bbe70003ce45070e048b878"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Forward bent neck above narrow planted feet; sacs do not inflate procedurally.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-burster",
    "fighterId": "burster",
    "profileId": "castes-game_afe_burster",
    "path": "/assets/user/castes-v87/game_afe_burster.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "b2db2418502099d9f2551434cf207ef72fe0a09dc68914fbc85e18705720ce13",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          834,
          547
        ],
        "tip": [
          834,
          561
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          834,
          547
        ],
        "tip": [
          1162,
          560
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1299,
          481
        ],
        "tip": [
          1461,
          456
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          552,
          834
        ],
        "tip": [
          552,
          848
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1021,
          796
        ],
        "tip": [
          1021,
          810
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1290,
          869
        ],
        "tip": [
          1290,
          883
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1428,
          784
        ],
        "tip": [
          1428,
          798
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1162,
          560
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1461,
          456
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1290,
          869
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1428,
          784
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          552,
          834
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1021,
          796
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "00080c7e0042ff80d76fcd9274e8fc126efe04ffff01ffff41ffff04fff22cfffe1ffbf89397ff05ddff414dfe0981c2"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Green sac silhouette and bent supports stay intact.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-stalker-arcade",
    "fighterId": "stalker-arcade",
    "profileId": "castes-game_avp_capcom_stalker",
    "path": "/assets/user/castes-v87/game_avp_capcom_stalker.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "e1e4fd52067a1d69b170935855f21ed6f38686fed8804c890bb961c67d6e5ad7",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          905,
          614
        ],
        "tip": [
          905,
          628
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          905,
          614
        ],
        "tip": [
          1025,
          386
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1092,
          257
        ],
        "tip": [
          1295,
          211
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          731,
          912
        ],
        "tip": [
          731,
          926
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1079,
          925
        ],
        "tip": [
          1079,
          939
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1128,
          506
        ],
        "tip": [
          1129,
          507
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1366,
          464
        ],
        "tip": [
          1358,
          484
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1025,
          386
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1295,
          211
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1128,
          506
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1366,
          464
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          731,
          912
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1079,
          925
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0c038e008bfbf03fff003ffdf19ffc70bf9cf89ffe58fffeddfffe6fff3e77df1c363f140c7f7a0477bc407be04901e0"
    },
    "poses": {
      "intro": {
        "spine": -0.154,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.165,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.22,
        "head": -0.91
      },
      "release": {
        "spine": -0.088,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.121,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.198,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "pixel-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Original arcade pixels and thin toes remain fixed at the support band.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-gorilla",
    "fighterId": "gorilla",
    "profileId": "pose-v94-kenner-gorilla",
    "path": "/assets/openai/sprites/static-enemy-v94/kenner-gorilla-neca.png",
    "sourceFacing": 1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "c91b539cebeb76fd69ac39ef5c9966166584a45f8a51a064c09a7306d54f4685",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          806,
          803
        ],
        "tip": [
          806,
          817
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          806,
          803
        ],
        "tip": [
          841,
          559
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          860,
          440
        ],
        "tip": [
          853,
          286
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          586,
          1208
        ],
        "tip": [
          586,
          1220
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1020,
          1215
        ],
        "tip": [
          1021,
          1231
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          521,
          922
        ],
        "tip": [
          521,
          936
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1038,
          1092
        ],
        "tip": [
          1038,
          1106
        ]
      }
    ],
    "pinned": [
      0,
      1024,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          841,
          559
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          853,
          286
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          521,
          922
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1038,
          1092
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          586,
          1208
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1020,
          1215
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "002e0001f4091f2009f0029f5509fd13ffc77ff8ebffa3bffa7bfffffffeffbff7dffebffbe9ffbc07f3c9fffc41e7e81ebe"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.84
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.56
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.98
      },
      "release": {
        "spine": -0.096,
        "head": 0.35
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.7
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.805
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "heavy-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Front-view broad shoulders and asymmetrical hanging fists; no fabricated side walk.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.14,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-rhino",
    "fighterId": "rhino",
    "profileId": "pose-v94-kenner-rhino",
    "path": "/assets/openai/sprites/static-enemy-v94/kenner-rhino-neca.png",
    "sourceFacing": -1,
    "sourceWidth": 1310,
    "sourceHeight": 1201,
    "sourceSha256": "056cff7c33e15760ea867185dba4228542eabc291328034d40246589180e7ce8",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          933,
          743
        ],
        "tip": [
          933,
          757
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          933,
          743
        ],
        "tip": [
          625,
          613
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          548,
          517
        ],
        "tip": [
          361,
          588
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          640,
          1075
        ],
        "tip": [
          640,
          1089
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1180,
          1061
        ],
        "tip": [
          1180,
          1075
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          174,
          868
        ],
        "tip": [
          174,
          882
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          348,
          1009
        ],
        "tip": [
          348,
          1023
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1310,
      1201
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          625,
          613
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          361,
          588
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          174,
          868
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          348,
          1009
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          640,
          1075
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1180,
          1061
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 21,
      "rows": 19,
      "mask": "00818002420078205ff405ff681ffc80fff287fff8ffffe7ffff87fffe7fffb7fffa7e7fe3c7ff83ffbe7fedf60fef900300"
    },
    "poses": {
      "intro": {
        "spine": 0.119,
        "head": -0.6
      },
      "restraint": {
        "spine": -0.1275,
        "head": 0.4
      },
      "struggle": {
        "spine": -0.17,
        "head": 0.7
      },
      "release": {
        "spine": 0.068,
        "head": -0.25
      },
      "round-win": {
        "spine": 0.0935,
        "head": 0.5
      },
      "round-loss": {
        "spine": -0.153,
        "head": -0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Left-facing charging plate; its measured support patches stay fixed without reconstructing a gait.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-panther",
    "fighterId": "panther",
    "profileId": "pose-v94-kenner-panther",
    "path": "/assets/openai/sprites/static-enemy-v94/kenner-panther-neca.png",
    "sourceFacing": 1,
    "sourceWidth": 1310,
    "sourceHeight": 1201,
    "sourceSha256": "575f23d532b10eb34f2dd0df9e8a860e1511cdecf4e7ab20eb5fa7742acc549c",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          507,
          754
        ],
        "tip": [
          507,
          768
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          507,
          754
        ],
        "tip": [
          940,
          702
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1092,
          669
        ],
        "tip": [
          1155,
          695
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          189,
          964
        ],
        "tip": [
          189,
          978
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          444,
          935
        ],
        "tip": [
          444,
          949
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          766,
          1075
        ],
        "tip": [
          766,
          1089
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1069,
          1020
        ],
        "tip": [
          1069,
          1034
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1310,
      1201
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          940,
          702
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1155,
          695
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          766,
          1075
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1069,
          1020
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          189,
          964
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          444,
          935
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 21,
      "rows": 19,
      "mask": "0e8780fb4a87cfe83e36c1f32807e9083f8011fdf017ffe0dfff03fff8c7ffc7ffee1fff00ff9e06fe78317bc23bdf800e06"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Raised native foreclaws and a curled tail are not turned into a full gait.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-mantis",
    "fighterId": "mantis",
    "profileId": "pose-v96-kenner-mantis",
    "path": "/assets/openai/sprites/static-enemy-v96/mantis-alien-neca.png",
    "sourceFacing": 1,
    "sourceWidth": 1226,
    "sourceHeight": 1283,
    "sourceSha256": "d84bcb3069b7eb0119fb627a6f5aef5eb60da3478b3e18a9d254a4302a564ef7",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          440,
          650
        ],
        "tip": [
          440,
          664
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          440,
          650
        ],
        "tip": [
          640,
          485
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          858,
          358
        ],
        "tip": [
          1005,
          354
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          386,
          1149
        ],
        "tip": [
          386,
          1163
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          717,
          1090
        ],
        "tip": [
          717,
          1104
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          929,
          650
        ],
        "tip": [
          929,
          664
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          720,
          652
        ],
        "tip": [
          720,
          666
        ]
      }
    ],
    "pinned": [
      0,
      960,
      1226,
      1283
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          640,
          485
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1005,
          354
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          929,
          650
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          720,
          652
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          386,
          1149
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          717,
          1090
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 21,
      "mask": "2ffd0e9ff8cfff4fbff8cbffcebff8e3ff8f3fd8fffee7fffa3fffc7fffcbfffe07ffe0fff74d7fb0ffba0fbdc0f3f20b0c202000"
    },
    "poses": {
      "intro": {
        "spine": -0.14,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.15,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.2,
        "head": -0.91
      },
      "release": {
        "spine": -0.08,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.11,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.18,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "blade-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Long scythe limbs retain their source geometry inside two explicitly measured rigid regions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "rigidZonesV163": [
      {
        "bone": "hips",
        "polygon": [
          [
            705,
            618
          ],
          [
            834,
            645
          ],
          [
            1021,
            1073
          ],
          [
            1025,
            1164
          ],
          [
            966,
            1185
          ],
          [
            918,
            1013
          ],
          [
            755,
            810
          ]
        ]
      },
      {
        "bone": "hips",
        "polygon": [
          [
            917,
            602
          ],
          [
            1066,
            630
          ],
          [
            1215,
            930
          ],
          [
            1197,
            1030
          ],
          [
            1151,
            1013
          ],
          [
            1106,
            860
          ],
          [
            997,
            735
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-ultramorph",
    "fighterId": "ultramorph",
    "profileId": "pose-v95-user-xeno-ultramorph",
    "path": "/assets/openai/sprites/static-enemy-v95/xeno-ultramorph.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "3aae299b54ada13416d6a7ba2146609504d3e576204039a55712134a2a281fdc",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          430,
          641
        ],
        "tip": [
          430,
          655
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          430,
          641
        ],
        "tip": [
          374,
          485
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          329,
          419
        ],
        "tip": [
          220,
          385
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          353,
          1037
        ],
        "tip": [
          353,
          1051
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          532,
          1022
        ],
        "tip": [
          532,
          1036
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          135,
          656
        ],
        "tip": [
          142,
          673
        ]
      }
    ],
    "pinned": [
      0,
      832,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          374,
          485
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          220,
          385
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          135,
          656
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          353,
          1037
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          532,
          1022
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "02a0800c00183805fe101fe003fe003fc400fe082f8007fc00f7e006ff000ff005fff003fbc07ffe0ffe00f7f0409e001800"
    },
    "poses": {
      "intro": {
        "spine": 0.224,
        "head": -1.08
      },
      "restraint": {
        "spine": -0.24,
        "head": 0.72
      },
      "struggle": {
        "spine": -0.32,
        "head": 1.26
      },
      "release": {
        "spine": 0.128,
        "head": -0.45
      },
      "round-win": {
        "spine": 0.176,
        "head": 0.9
      },
      "round-loss": {
        "spine": -0.288,
        "head": -1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Long horizontal dome on an upright narrow ribcage, facing left. The offside arm is occluded; only the visible near hand is reported.",
    "occludedContactsV165": [
      "handFar"
    ],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-mecha",
    "fighterId": "mecha",
    "profileId": "pose-v95-user-xeno-mecha",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-44-xeno-mecha.png",
    "sourceFacing": 1,
    "sourceWidth": 1672,
    "sourceHeight": 941,
    "sourceSha256": "570d77973535d107a073d0b49c8e5a2485cd5eba1481355f53a1fcbf12c6f61e",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          1068,
          574
        ],
        "tip": [
          1065,
          587
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          1068,
          574
        ],
        "tip": [
          1125,
          385
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1166,
          262
        ],
        "tip": [
          1170,
          185
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          976,
          814
        ],
        "tip": [
          976,
          828
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1207,
          769
        ],
        "tip": [
          1207,
          783
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          942,
          628
        ],
        "tip": [
          938,
          630
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1265,
          602
        ],
        "tip": [
          1265,
          616
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1672,
      941
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1125,
          385
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1170,
          185
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          942,
          628
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1265,
          602
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          976,
          814
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1207,
          769
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 27,
      "rows": 15,
      "mask": "00000000001e00000fe00001fc00003f800007e00001fc00003fc00007f807ffff00ffffc80001b800003f8104170110000000"
    },
    "poses": {
      "intro": {
        "spine": -0.0,
        "head": 0.504
      },
      "restraint": {
        "spine": 0.0,
        "head": -0.336
      },
      "struggle": {
        "spine": 0,
        "head": -0.588
      },
      "release": {
        "spine": -0.0,
        "head": 0.21
      },
      "round-win": {
        "spine": -0.0,
        "head": -0.42
      },
      "round-loss": {
        "spine": 0.0,
        "head": 0.483
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "hard-chassis",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "The lower mechanical chassis is rigid; the measured skull region has one small articulation and its boundary triangles.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.084,
      "radiansPerSecond": 5.3999999999999995
    },
    "rigidDefaultBoneV165": "hips",
    "rigidZonesV163": [
      {
        "bone": "head",
        "polygon": [
          [
            1048,
            118
          ],
          [
            1320,
            118
          ],
          [
            1320,
            280
          ],
          [
            1048,
            280
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-mecha-2",
    "fighterId": "mecha-2",
    "profileId": "pose-v95-user-xeno-mecha-2",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-43-xeno-mecha-2.png",
    "sourceFacing": -1,
    "sourceWidth": 1698,
    "sourceHeight": 926,
    "sourceSha256": "bf707b9cacac1244b3f78cf024ec100771cc01daea1e93335027b7637d52865f",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          821,
          504
        ],
        "tip": [
          821,
          518
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          821,
          504
        ],
        "tip": [
          748,
          367
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          670,
          257
        ],
        "tip": [
          606,
          225
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          592,
          798
        ],
        "tip": [
          592,
          812
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          945,
          816
        ],
        "tip": [
          945,
          830
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          458,
          521
        ],
        "tip": [
          458,
          535
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          932,
          532
        ],
        "tip": [
          932,
          546
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1698,
      926
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          748,
          367
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          606,
          225
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          458,
          521
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          932,
          532
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          592,
          798
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          945,
          816
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 27,
      "rows": 15,
      "mask": "000000000fe00007fc0400ff0c003fee0007fbf0103f8f800ffc3003ffc6007fffc08dfff0003b98001e7c0003ce0000000000"
    },
    "poses": {
      "intro": {
        "spine": 0.0,
        "head": -0.504
      },
      "restraint": {
        "spine": -0.0,
        "head": 0.336
      },
      "struggle": {
        "spine": 0,
        "head": 0.588
      },
      "release": {
        "spine": 0.0,
        "head": -0.21
      },
      "round-win": {
        "spine": 0.0,
        "head": 0.42
      },
      "round-loss": {
        "spine": -0.0,
        "head": -0.483
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "hard-chassis",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Left-facing blue mechanical plate; the lower chassis and cable-tail retain one rigid hips transform outside the head boundary.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.084,
      "radiansPerSecond": 5.2
    },
    "rigidDefaultBoneV165": "hips",
    "rigidZonesV163": [
      {
        "bone": "head",
        "polygon": [
          [
            459,
            101
          ],
          [
            1000,
            101
          ],
          [
            1000,
            298
          ],
          [
            459,
            298
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-mechanoid",
    "fighterId": "mechanoid",
    "profileId": "pose-v95-user-xeno-mechanoid",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-64-xeno-mechanoid.png",
    "sourceFacing": -1,
    "sourceWidth": 1128,
    "sourceHeight": 1394,
    "sourceSha256": "f1c7d0ff020738e26fa9a792653f50d6b7a6e6e4021ebb3f73b8a42f6f74ef3c",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          673,
          721
        ],
        "tip": [
          673,
          735
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          673,
          721
        ],
        "tip": [
          708,
          510
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          605,
          399
        ],
        "tip": [
          519,
          313
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          450,
          1227
        ],
        "tip": [
          450,
          1241
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          918,
          1214
        ],
        "tip": [
          918,
          1228
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          498,
          794
        ],
        "tip": [
          498,
          808
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          742,
          794
        ],
        "tip": [
          742,
          808
        ]
      }
    ],
    "pinned": [
      0,
      1024,
      1128,
      1394
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          708,
          510
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          519,
          313
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          498,
          794
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          742,
          794
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          450,
          1227
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          918,
          1214
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 18,
      "rows": 22,
      "mask": "44208003400fc00ff847ff91ffe83ff21ff467fe823f801ff30ff003fc18ff03dde1fff07fff1effc75ef19fbc0f1f80010"
    },
    "poses": {
      "intro": {
        "spine": 0.0,
        "head": -0.504
      },
      "restraint": {
        "spine": -0.0,
        "head": 0.336
      },
      "struggle": {
        "spine": 0,
        "head": 0.588
      },
      "release": {
        "spine": 0.0,
        "head": -0.21
      },
      "round-win": {
        "spine": 0.0,
        "head": 0.42
      },
      "round-loss": {
        "spine": -0.0,
        "head": -0.483
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "hard-chassis",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Thin lower supports and low tail use a rigid chassis transform; the measured skull region has a small separate articulation.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.084,
      "radiansPerSecond": 4.8999999999999995
    },
    "rigidDefaultBoneV165": "hips",
    "rigidZonesV163": [
      {
        "bone": "head",
        "polygon": [
          [
            386,
            180
          ],
          [
            802,
            167
          ],
          [
            815,
            352
          ],
          [
            635,
            425
          ],
          [
            420,
            420
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-albino-joe",
    "fighterId": "albino-joe",
    "profileId": "enemy-093-albino-working-joe",
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-093-albino-working-joe.png",
    "sourceFacing": 1,
    "sourceWidth": 1225,
    "sourceHeight": 1284,
    "sourceSha256": "f74da03d30631461fbaf27cf88174e335f77c95134a52b07e5e7e955aea82e17",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          628,
          573
        ],
        "tip": [
          628,
          587
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          628,
          573
        ],
        "tip": [
          609,
          383
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          632,
          257
        ],
        "tip": [
          684,
          170
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          482,
          1158
        ],
        "tip": [
          482,
          1172
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          771,
          1154
        ],
        "tip": [
          771,
          1168
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          541,
          707
        ],
        "tip": [
          541,
          721
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          755,
          695
        ],
        "tip": [
          755,
          709
        ]
      }
    ],
    "pinned": [
      0,
      1024,
      1225,
      1284
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          609,
          383
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          684,
          170
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          541,
          707
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          755,
          695
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          482,
          1158
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          771,
          1154
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 21,
      "mask": "2079448f1800f1018f1001e0081f0001f1801f0c01f0841f8001f8801fc021f0011f80f7f8003f8043f800bbc483fc823c0200000"
    },
    "poses": {
      "intro": {
        "spine": -0.182,
        "head": 0.9
      },
      "restraint": {
        "spine": 0.195,
        "head": -0.6
      },
      "struggle": {
        "spine": 0.26,
        "head": -1.05
      },
      "release": {
        "spine": -0.104,
        "head": 0.375
      },
      "round-win": {
        "spine": -0.143,
        "head": -0.75
      },
      "round-loss": {
        "spine": 0.234,
        "head": 0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Humanlike upright uniform and two visible boots with individual neck anchors.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 4.8
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-albino-combat-synth",
    "fighterId": "albino-combat-synth",
    "profileId": "enemy-094-albino-combat-synthetic",
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-094-albino-combat-synthetic.png",
    "sourceFacing": 1,
    "sourceWidth": 1227,
    "sourceHeight": 1282,
    "sourceSha256": "36bd4bb9795f8a3f4716cec27df5da521ef0170760215ce1228987e5552bfb13",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          588,
          635
        ],
        "tip": [
          588,
          649
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          588,
          635
        ],
        "tip": [
          659,
          398
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          714,
          284
        ],
        "tip": [
          754,
          174
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          375,
          1120
        ],
        "tip": [
          375,
          1134
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          892,
          1140
        ],
        "tip": [
          892,
          1154
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          773,
          556
        ],
        "tip": [
          773,
          570
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          856,
          568
        ],
        "tip": [
          856,
          582
        ]
      }
    ],
    "pinned": [
      0,
      960,
      1227,
      1282
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          659,
          398
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          754,
          174
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          773,
          556
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          856,
          568
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          375,
          1120
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          892,
          1140
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 21,
      "mask": "200c4483808afc811fc021fa403f8003f8003fe003ff041ff801ff631fc021fc043ff0c3fc007bc04f7c00fff0873f00000000000"
    },
    "poses": {
      "intro": {
        "spine": -0.112,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.12,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.16,
        "head": -0.7
      },
      "release": {
        "spine": -0.064,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.088,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.144,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "robot-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Rifle, grips and barrel are held in one rigid source-pixel region.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.0
    },
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            647,
            442
          ],
          [
            1046,
            540
          ],
          [
            1057,
            675
          ],
          [
            671,
            627
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-acid-joe",
    "fighterId": "acid-joe",
    "profileId": "enemy-197-acid-blooded-working-joe",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-197-acid-blooded-working-joe.png",
    "sourceFacing": 1,
    "sourceWidth": 1332,
    "sourceHeight": 1181,
    "sourceSha256": "f7ca58dfcac1e3014878b0257dec0fcd2c3354da2149f040705b6229ad4f6bb6",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          682,
          578
        ],
        "tip": [
          682,
          592
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          682,
          578
        ],
        "tip": [
          700,
          374
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          730,
          269
        ],
        "tip": [
          773,
          193
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          497,
          1050
        ],
        "tip": [
          497,
          1064
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          864,
          1057
        ],
        "tip": [
          864,
          1071
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          613,
          669
        ],
        "tip": [
          613,
          683
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          871,
          621
        ],
        "tip": [
          871,
          635
        ]
      }
    ],
    "pinned": [
      0,
      896,
      1332,
      1181
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          700,
          374
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          773,
          193
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          613,
          669
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          871,
          621
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          497,
          1050
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          864,
          1057
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 21,
      "rows": 19,
      "mask": "02050011c0101e0840f0000f82007c0003e0103f0021fd0047f0003f8801f8001fc010fe408f72017bca13ff005ff8000800"
    },
    "poses": {
      "intro": {
        "spine": -0.182,
        "head": 0.9
      },
      "restraint": {
        "spine": 0.195,
        "head": -0.6
      },
      "struggle": {
        "spine": 0.26,
        "head": -1.05
      },
      "release": {
        "spine": -0.104,
        "head": 0.375
      },
      "round-win": {
        "spine": -0.143,
        "head": -0.75
      },
      "round-loss": {
        "spine": 0.234,
        "head": 0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Individual native uniform, neck and boot placement; no palette-generated replacement.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-acid-combat-synth",
    "fighterId": "acid-combat-synth",
    "profileId": "enemy-198-acid-blooded-combat-synthetic",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-198-acid-blooded-combat-synthetic.png",
    "sourceFacing": 1,
    "sourceWidth": 1312,
    "sourceHeight": 1199,
    "sourceSha256": "d842755a850635f1cfa60b353b1531b983697d86c570457db9a6d7dbcb01d05b",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          627,
          598
        ],
        "tip": [
          627,
          612
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          627,
          598
        ],
        "tip": [
          663,
          398
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          715,
          280
        ],
        "tip": [
          722,
          181
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          402,
          1077
        ],
        "tip": [
          402,
          1091
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          896,
          1074
        ],
        "tip": [
          896,
          1088
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          733,
          542
        ],
        "tip": [
          733,
          556
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          800,
          528
        ],
        "tip": [
          800,
          542
        ]
      }
    ],
    "pinned": [
      0,
      896,
      1312,
      1199
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          663,
          398
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          722,
          181
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          733,
          542
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          800,
          528
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          402,
          1077
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          896,
          1074
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 21,
      "rows": 19,
      "mask": "80010003c4007e00a7f0003f8021fc280ff0447fe003ff000ff80e7e5003f0803fc233fe511f7001f7d00f4f037b78100000"
    },
    "poses": {
      "intro": {
        "spine": -0.112,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.12,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.16,
        "head": -0.7
      },
      "release": {
        "spine": -0.064,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.088,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.144,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "robot-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Carried rifle and hands retain a single affine transform.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            608,
            424
          ],
          [
            1028,
            553
          ],
          [
            1028,
            671
          ],
          [
            619,
            605
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-engineer-battlesuit",
    "fighterId": "import-engineer-battlesuit",
    "profileId": "pose-v106-import-engineer-battlesuit",
    "path": "/assets/openai/sprites/static-import-v106/engineer-battlesuit.png",
    "sourceFacing": -1,
    "sourceWidth": 1119,
    "sourceHeight": 1405,
    "sourceSha256": "ac70046fea2137b88645df096713e9a8740d8916c7fde59f03d4514d7d055a5d",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          562,
          705
        ],
        "tip": [
          562,
          719
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          562,
          705
        ],
        "tip": [
          562,
          389
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          566,
          272
        ],
        "tip": [
          536,
          199
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          462,
          1306
        ],
        "tip": [
          462,
          1320
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          648,
          1349
        ],
        "tip": [
          648,
          1363
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          397,
          800
        ],
        "tip": [
          397,
          814
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          752,
          839
        ],
        "tip": [
          752,
          853
        ]
      }
    ],
    "pinned": [
      0,
      1152,
      1119,
      1405
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          562,
          389
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          536,
          199
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          397,
          800
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          752,
          839
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          462,
          1306
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          648,
          1349
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 18,
      "rows": 22,
      "mask": "4058007e001f880fe223f800fe003f800fe043f800fe003f901fe007fa01fe017f809fc041f0107c003f22afc807f409fc0"
    },
    "poses": {
      "intro": {
        "spine": 0.175,
        "head": -0.9
      },
      "restraint": {
        "spine": -0.1875,
        "head": 0.6
      },
      "struggle": {
        "spine": -0.25,
        "head": 1.05
      },
      "release": {
        "spine": 0.1,
        "head": -0.375
      },
      "round-win": {
        "spine": 0.1375,
        "head": 0.75
      },
      "round-loss": {
        "spine": -0.225,
        "head": -0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "engineer",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Biosuit ribs, dangling open hands and separated feet retain their original positions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.3999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-engineer-behemotsuit",
    "fighterId": "import-engineer-behemotsuit",
    "profileId": "pose-v106-import-engineer-behemotsuit",
    "path": "/assets/openai/sprites/static-import-v106/engineer-behemotsuit.png",
    "sourceFacing": 1,
    "sourceWidth": 1341,
    "sourceHeight": 1173,
    "sourceSha256": "43a10e3f3e0fc80f4a18af5efcec45aa2fda0b8012beb136590765855be9ff24",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          584,
          536
        ],
        "tip": [
          584,
          550
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          584,
          536
        ],
        "tip": [
          613,
          326
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          613,
          170
        ],
        "tip": [
          602,
          98
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          384,
          1115
        ],
        "tip": [
          384,
          1129
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          797,
          1079
        ],
        "tip": [
          797,
          1093
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          330,
          579
        ],
        "tip": [
          330,
          593
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          975,
          634
        ],
        "tip": [
          975,
          648
        ]
      }
    ],
    "pinned": [
      0,
      896,
      1341,
      1173
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          613,
          326
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          602,
          98
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          330,
          579
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          975,
          634
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          384,
          1115
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          797,
          1079
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 21,
      "rows": 19,
      "mask": "03e9801f1911fe880ff0407fc007fe003ff899bfe00ff70a7fbe23fdf007f3807b8e1bdc189de804efa8467d0279ed018000"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.66
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.44
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.77
      },
      "release": {
        "spine": -0.068,
        "head": 0.275
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.55
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.6325
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "blade-engineer",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "The measured blade region is a rigid static attachment; the massive golden torso has restrained presentation motion.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.11,
      "radiansPerSecond": 5.2
    },
    "rigidZonesV163": [
      {
        "bone": "hips",
        "polygon": [
          [
            732,
            304
          ],
          [
            837,
            362
          ],
          [
            1203,
            847
          ],
          [
            1080,
            833
          ],
          [
            757,
            594
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-engineer-ceremonialsuit",
    "fighterId": "import-engineer-ceremonialsuit",
    "profileId": "pose-v106-import-engineer-ceremonialsuit",
    "path": "/assets/openai/sprites/static-import-v106/engineer-ceremonialsuit.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "5ef5669cc6ef4dc1e8540ced1eb687ff7875f97963b8b4b05795a581a069fa14",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          500,
          827
        ],
        "tip": [
          500,
          841
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          500,
          827
        ],
        "tip": [
          505,
          406
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          505,
          269
        ],
        "tip": [
          519,
          142
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          373,
          1493
        ],
        "tip": [
          373,
          1507
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          684,
          1498
        ],
        "tip": [
          684,
          1512
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          434,
          562
        ],
        "tip": [
          434,
          576
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          609,
          562
        ],
        "tip": [
          609,
          576
        ]
      }
    ],
    "pinned": [
      0,
      1344,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          505,
          406
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          519,
          142
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          434,
          562
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          609,
          562
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          373,
          1493
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          684,
          1498
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "0bc10bc403d00ff807f00ff01ff00ff03ff03ffb1ffe1ff91ff81ffd3ff83ffe7ffc3ffc3ff83ffebffe3ffc7ff81ff8"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "robed-engineer",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Visible robe and exposed toes are preserved; no hidden leg skeleton or skirt walk is reconstructed.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-engineer-mala-kak",
    "fighterId": "import-engineer-mala-kak",
    "profileId": "pose-v106-import-engineer-mala-kak",
    "path": "/assets/openai/sprites/static-import-v106/engineer-mala-kak.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "1037a725cd7b40189c4c2080659360999aba5ba956136583a061c66d22e94d02",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          491,
          723
        ],
        "tip": [
          491,
          737
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          491,
          723
        ],
        "tip": [
          481,
          430
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          538,
          255
        ],
        "tip": [
          566,
          156
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          439,
          1460
        ],
        "tip": [
          439,
          1474
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          727,
          1413
        ],
        "tip": [
          727,
          1427
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          368,
          813
        ],
        "tip": [
          368,
          827
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          656,
          553
        ],
        "tip": [
          656,
          567
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          481,
          430
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          566,
          156
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          368,
          813
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          656,
          553
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          439,
          1460
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          727,
          1413
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "01c005c00fe00fe00fe44ff00ff81ff11ff01ff00fe00fe20fe00fe107e02ff32ff637f62ff23ff06ff06ff85ff80780"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "robed-engineer",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Front-view robe and asymmetrical hands are preserved. No authored leg or skirt cycle; only neck/upper-torso presentation cues.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-engineer-original-space-jokey-variant",
    "fighterId": "import-engineer-original-space-jokey-variant",
    "profileId": "pose-v106-import-engineer-original-space-jokey-variant",
    "path": "/assets/openai/sprites/static-import-v106/engineer-original-space-jokey-variant.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "e385a7d5d34cef3874570d36988d85e9aee4678ee550423a4b8b06fcbc1361ea",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          495,
          770
        ],
        "tip": [
          495,
          784
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          495,
          770
        ],
        "tip": [
          510,
          553
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          514,
          440
        ],
        "tip": [
          547,
          321
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          354,
          1456
        ],
        "tip": [
          354,
          1470
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          642,
          1423
        ],
        "tip": [
          642,
          1437
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          278,
          1002
        ],
        "tip": [
          278,
          1016
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          750,
          1002
        ],
        "tip": [
          750,
          1016
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          510,
          553
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          547,
          321
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          278,
          1002
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          750,
          1002
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          354,
          1456
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          642,
          1423
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "078007f007f00ff81ff81ff01fe01fe00fe01fe01ff01ff01ff01ff81ff81ff89ff80ff24fe00eec0ed24ee04ff00ef0"
    },
    "poses": {
      "intro": {
        "spine": -0.133,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.1425,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.19,
        "head": -0.84
      },
      "release": {
        "spine": -0.076,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.1045,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.171,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-engineer",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Radial head crest has its own measured neck; long fingers and toes remain fixed.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-engineer-respirator",
    "fighterId": "import-engineer-respirator",
    "profileId": "pose-v106-import-engineer-respirator",
    "path": "/assets/openai/sprites/static-import-v106/engineer-respirator.png",
    "sourceFacing": 1,
    "sourceWidth": 1085,
    "sourceHeight": 1449,
    "sourceSha256": "f28aaede973fe09efba81c2ed631587f41999741fb1366c80f3f65fec584a97d",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          513,
          780
        ],
        "tip": [
          513,
          794
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          513,
          780
        ],
        "tip": [
          527,
          450
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          545,
          259
        ],
        "tip": [
          536,
          161
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          402,
          1373
        ],
        "tip": [
          402,
          1387
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          625,
          1324
        ],
        "tip": [
          625,
          1338
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          387,
          803
        ],
        "tip": [
          387,
          817
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          701,
          762
        ],
        "tip": [
          701,
          776
        ]
      }
    ],
    "pinned": [
      0,
      1152,
      1085,
      1449
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          527,
          450
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          536,
          161
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          387,
          803
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          701,
          762
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          402,
          1373
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          625,
          1324
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 17,
      "rows": 23,
      "mask": "31c020e010f008f8007f027f003f801fc64fe347f811fd00fe00ff803fb09fc88fc8d7de0bea55f408fb007f623fc01e60"
    },
    "poses": {
      "intro": {
        "spine": -0.175,
        "head": 0.9
      },
      "restraint": {
        "spine": 0.1875,
        "head": -0.6
      },
      "struggle": {
        "spine": 0.25,
        "head": -1.05
      },
      "release": {
        "spine": -0.1,
        "head": 0.375
      },
      "round-win": {
        "spine": -0.1375,
        "head": -0.75
      },
      "round-loss": {
        "spine": 0.225,
        "head": 0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "engineer",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Tall blue biosuit with distinct respirator and narrow supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 4.8
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-engineer-spacejokey",
    "fighterId": "import-engineer-spacejokey",
    "profileId": "pose-v106-import-engineer-spacejokey",
    "path": "/assets/openai/sprites/static-import-v106/engineer-spacejokey.png",
    "sourceFacing": -1,
    "sourceWidth": 737,
    "sourceHeight": 2135,
    "sourceSha256": "891cf221a535c4c30b019060bc96600397c5074d0eb86d6c48f6ad398cf7c6a1",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          434,
          1130
        ],
        "tip": [
          434,
          1144
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          434,
          1130
        ],
        "tip": [
          395,
          657
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          309,
          388
        ],
        "tip": [
          303,
          256
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          316,
          2023
        ],
        "tip": [
          316,
          2037
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          500,
          2017
        ],
        "tip": [
          500,
          2031
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          171,
          1215
        ],
        "tip": [
          171,
          1229
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          401,
          1150
        ],
        "tip": [
          401,
          1164
        ]
      }
    ],
    "pinned": [
      0,
      1856,
      737,
      2135
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          395,
          657
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          303,
          256
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          171,
          1215
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          401,
          1150
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          316,
          2023
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          500,
          2017
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 12,
      "rows": 34,
      "mask": "0e01e03e83fc3f83fc1fc1fc1fc1fc1fc1fc3fc1f81fc1fc3fc3f87f87fc3f80fa0f80fa07c07c03c03c03807c0fc7fc1fc0e0"
    },
    "poses": {
      "intro": {
        "spine": 0.119,
        "head": -0.66
      },
      "restraint": {
        "spine": -0.1275,
        "head": 0.44
      },
      "struggle": {
        "spine": -0.17,
        "head": 0.77
      },
      "release": {
        "spine": 0.068,
        "head": -0.275
      },
      "round-win": {
        "spine": 0.0935,
        "head": 0.55
      },
      "round-loss": {
        "spine": -0.153,
        "head": -0.6325
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "tall-engineer",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Very tall thin native plate, facing left; no human-sized normalization or procedural leg motion.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.11,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-engineer-suit-open",
    "fighterId": "import-engineer-suit-open",
    "profileId": "pose-v106-import-engineer-suit-open",
    "path": "/assets/openai/sprites/static-import-v106/engineer-suit-open.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "7910ae292e065168c431e133c858b587ab1fff9ec1623b767e7829d69cb464e0",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          514,
          747
        ],
        "tip": [
          514,
          761
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          514,
          747
        ],
        "tip": [
          491,
          416
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          505,
          260
        ],
        "tip": [
          510,
          137
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          462,
          1460
        ],
        "tip": [
          462,
          1474
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          604,
          1460
        ],
        "tip": [
          604,
          1474
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          387,
          803
        ],
        "tip": [
          387,
          817
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          708,
          813
        ],
        "tip": [
          708,
          827
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          491,
          416
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          510,
          137
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          387,
          803
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          708,
          813
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          462,
          1460
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          604,
          1460
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "03c003c003c007c00fe40fe00fe00fe01fe01fe00ff00ff00ff007f907f007c107ce07cc07800784078017a407e007e0"
    },
    "poses": {
      "intro": {
        "spine": -0.175,
        "head": 0.9
      },
      "restraint": {
        "spine": 0.1875,
        "head": -0.6
      },
      "struggle": {
        "spine": 0.25,
        "head": -1.05
      },
      "release": {
        "spine": -0.1,
        "head": 0.375
      },
      "round-win": {
        "spine": -0.1375,
        "head": -0.75
      },
      "round-loss": {
        "spine": 0.225,
        "head": 0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "engineer",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Open suit exposes a humanlike head on the measured tall torso.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-engineer-wararmor",
    "fighterId": "import-engineer-wararmor",
    "profileId": "pose-v106-import-engineer-wararmor",
    "path": "/assets/openai/sprites/static-import-v106/engineer-wararmor.png",
    "sourceFacing": -1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "93cc507c3cd7c05d9cbb28887cb55bb60db893e03f1bd43a6d59ea06757ddfdd",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          651,
          718
        ],
        "tip": [
          651,
          732
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          651,
          718
        ],
        "tip": [
          665,
          449
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          642,
          246
        ],
        "tip": [
          642,
          123
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          571,
          1441
        ],
        "tip": [
          571,
          1455
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          680,
          1451
        ],
        "tip": [
          680,
          1465
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          401,
          477
        ],
        "tip": [
          401,
          491
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          708,
          704
        ],
        "tip": [
          708,
          718
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          665,
          449
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          642,
          123
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          401,
          477
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          708,
          704
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          571,
          1441
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          680,
          1451
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "047002f070f87dfc7dfe7ffc1ffc0ff82ff817f803f801f801f010f000f000f600fa007a0078007000f021f043f808f0"
    },
    "poses": {
      "intro": {
        "spine": 0.0,
        "head": -0.6
      },
      "restraint": {
        "spine": -0.0,
        "head": 0.4
      },
      "struggle": {
        "spine": 0,
        "head": 0.7
      },
      "release": {
        "spine": 0.0,
        "head": -0.25
      },
      "round-win": {
        "spine": 0.0,
        "head": 0.5
      },
      "round-loss": {
        "spine": -0.0,
        "head": -0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armed-engineer",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Large left-held apparatus and forearm have a measured rigid region. The lower armor uses one rigid transform beneath the skull articulation.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.0
    },
    "rigidDefaultBoneV165": "hips",
    "rigidZonesV163": [
      {
        "bone": "hips",
        "polygon": [
          [
            76,
            147
          ],
          [
            165,
            118
          ],
          [
            444,
            425
          ],
          [
            444,
            558
          ],
          [
            330,
            591
          ],
          [
            151,
            425
          ]
        ]
      },
      {
        "bone": "head",
        "polygon": [
          [
            547,
            43
          ],
          [
            783,
            38
          ],
          [
            821,
            298
          ],
          [
            514,
            298
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-afe2-engineer-hybrid",
    "fighterId": "afe2-engineer-hybrid",
    "profileId": "pose-v112-afe2-engineer-hybrid",
    "path": "/assets/openai/sprites/static-game-v112/game-afe2-engineer-hybrid.png",
    "sourceFacing": -1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "3c34d085118b0e251da540064ddc426978aae953b78bda85db555c951328b5ce",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          552,
          695
        ],
        "tip": [
          552,
          709
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          552,
          695
        ],
        "tip": [
          562,
          378
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          415,
          232
        ],
        "tip": [
          363,
          95
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          274,
          1366
        ],
        "tip": [
          274,
          1380
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          859,
          1441
        ],
        "tip": [
          859,
          1455
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          181,
          860
        ],
        "tip": [
          180,
          873
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          847,
          879
        ],
        "tip": [
          847,
          892
        ]
      }
    ],
    "pinned": [
      0,
      1216,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          562,
          378
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          363,
          95
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          181,
          860
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          847,
          879
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          274,
          1366
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          859,
          1441
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "0f081fe01ff82ff12ffc1ffc1ffc3ffe3ffe3ffe3ffe3ffe3ffe7ffefe7ebe7e8f3e0e3c863c1e4e9f4e7fcef9de029e"
    },
    "poses": {
      "intro": {
        "spine": 0.161,
        "head": -0.84
      },
      "restraint": {
        "spine": -0.1725,
        "head": 0.56
      },
      "struggle": {
        "spine": -0.23,
        "head": 0.98
      },
      "release": {
        "spine": 0.092,
        "head": -0.35
      },
      "round-win": {
        "spine": 0.1265,
        "head": 0.7
      },
      "round-loss": {
        "spine": -0.207,
        "head": -0.805
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "pathogen-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Front-view asymmetrical pathogen body with long fixed arms and individual foot spreads.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.14,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-game-afe2-harbinger",
    "fighterId": "import-game-afe2-harbinger",
    "profileId": "pose-v106-import-game-afe2-harbinger",
    "path": "/assets/openai/sprites/static-game-v106/game-afe2-harbinger.png",
    "sourceFacing": -1,
    "sourceWidth": 1448,
    "sourceHeight": 1086,
    "sourceSha256": "b4075997666e8ac06a1bae21f62f11ff6813218e7208c7e2d8946fe0316259f4",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          660,
          565
        ],
        "tip": [
          660,
          579
        ]
      },
      {
        "id": "thorax",
        "parent": "hips",
        "pivot": [
          660,
          565
        ],
        "tip": [
          597,
          368
        ]
      },
      {
        "id": "mouth",
        "parent": "thorax",
        "pivot": [
          542,
          287
        ],
        "tip": [
          410,
          300
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          411,
          996
        ],
        "tip": [
          411,
          1010
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1045,
          1008
        ],
        "tip": [
          1045,
          1022
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          159,
          383
        ],
        "tip": [
          159,
          397
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1036,
          387
        ],
        "tip": [
          1036,
          401
        ]
      },
      {
        "id": "clawUpperFar",
        "parent": "hips",
        "pivot": [
          155,
          67
        ],
        "tip": [
          158,
          77
        ]
      },
      {
        "id": "clawUpperNear",
        "parent": "hips",
        "pivot": [
          1069,
          112
        ],
        "tip": [
          1069,
          126
        ]
      },
      {
        "id": "clawLowerFar",
        "parent": "hips",
        "pivot": [
          250,
          565
        ],
        "tip": [
          248,
          577
        ]
      },
      {
        "id": "clawLowerNear",
        "parent": "hips",
        "pivot": [
          938,
          654
        ],
        "tip": [
          946,
          660
        ]
      }
    ],
    "pinned": [
      0,
      832,
      1448,
      1086
    ],
    "contacts": {
      "chest": {
        "bone": "thorax",
        "point": [
          597,
          368
        ]
      },
      "head": {
        "bone": "mouth",
        "point": [
          410,
          300
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          159,
          383
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1036,
          387
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          411,
          996
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1045,
          1008
        ]
      },
      "clawUpperFar": {
        "bone": "clawUpperFar",
        "point": [
          155,
          67
        ]
      },
      "clawUpperNear": {
        "bone": "clawUpperNear",
        "point": [
          1069,
          112
        ]
      },
      "clawLowerFar": {
        "bone": "clawLowerFar",
        "point": [
          250,
          565
        ]
      },
      "clawLowerNear": {
        "bone": "clawLowerNear",
        "point": [
          938,
          654
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 23,
      "rows": 17,
      "mask": "7dc473ff9fe3ffff443ffb077ff99fffff7ffffc7ffff8dbff983fffe1fefedf3eff83fdf8133cffc8effc27def70f79e4"
    },
    "poses": {
      "intro": {
        "thorax": 0.084,
        "mouth": -0.54
      },
      "restraint": {
        "thorax": -0.09,
        "mouth": 0.36
      },
      "struggle": {
        "thorax": -0.12,
        "mouth": 0.63
      },
      "release": {
        "thorax": 0.048,
        "mouth": -0.225
      },
      "round-win": {
        "thorax": 0.066,
        "mouth": 0.45
      },
      "round-loss": {
        "thorax": -0.108,
        "mouth": -0.5175
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "multiarm-pathogen",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "The six visible hooked appendages have individual static anchors. Separate thorax and mouth control bones replace the humanoid spine/head naming. No hidden elbows, finger joints or a gait are reconstructed.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "mouth",
      "degrees": 0.09,
      "radiansPerSecond": 5.3999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-albino-runner",
    "fighterId": "albino-runner",
    "profileId": "enemy-058-albino-runner",
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-058-albino-runner.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "4f4acbfc53b41843c4a394ada331a391e6142402c28ce8bec18bd08741ea8bfa",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          668,
          531
        ],
        "tip": [
          668,
          545
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          668,
          531
        ],
        "tip": [
          942,
          539
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1017,
          452
        ],
        "tip": [
          1250,
          477
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          498,
          792
        ],
        "tip": [
          498,
          806
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          822,
          779
        ],
        "tip": [
          822,
          793
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1154,
          792
        ],
        "tip": [
          1154,
          806
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1266,
          784
        ],
        "tip": [
          1266,
          798
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          942,
          539
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1250,
          477
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1154,
          792
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1266,
          784
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          498,
          792
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          822,
          779
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0008080000008000005f4010bd0fd830bff43efff833fff8bfffb83fffd841fff003bdfe03dffc000040204080004040"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Pale runner has four low supports and a short raised tail.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-albino-crusher",
    "fighterId": "albino-crusher",
    "profileId": "enemy-061-albino-crusher",
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-061-albino-crusher.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "f34fdc28ebd3f4c4d2674210c71b758c32edd35ae49c68549805238f92e5bcd6",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          768,
          572
        ],
        "tip": [
          768,
          586
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          768,
          572
        ],
        "tip": [
          1125,
          518
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1241,
          444
        ],
        "tip": [
          1403,
          527
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          639,
          771
        ],
        "tip": [
          639,
          785
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          851,
          763
        ],
        "tip": [
          851,
          777
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1142,
          796
        ],
        "tip": [
          1142,
          810
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1304,
          788
        ],
        "tip": [
          1302,
          802
        ]
      }
    ],
    "pinned": [
      0,
      576,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1125,
          518
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1403,
          527
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1142,
          796
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1304,
          788
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          639,
          771
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          851,
          763
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "00088800001a0001c50003f80097fc023ffe087fff64fffff3ffff7fffeffffff67efffc39fefc53002020c454100818"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Pale armored crest stays above four broad original feet.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-albino-ravager",
    "fighterId": "albino-ravager",
    "profileId": "enemy-065-albino-ravager",
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-065-albino-ravager.png",
    "sourceFacing": 1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "7fd50d2d0cd6fb2415c1df99751961adf28360ddec5c688eb570e8d127ae0b8e",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          668,
          714
        ],
        "tip": [
          668,
          728
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          668,
          714
        ],
        "tip": [
          806,
          525
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          887,
          382
        ],
        "tip": [
          949,
          367
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          598,
          1053
        ],
        "tip": [
          598,
          1067
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          849,
          1061
        ],
        "tip": [
          849,
          1075
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          818,
          768
        ],
        "tip": [
          818,
          782
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1003,
          756
        ],
        "tip": [
          1003,
          770
        ]
      }
    ],
    "pinned": [
      0,
      896,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          806,
          525
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          949,
          367
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          818,
          768
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1003,
          756
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          598,
          1053
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          849,
          1061
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "08008000002070004fec00ff040ff290ff060ff000fc000ff021ff825ff81bff81fff81ffde1ffd423fe080e004008080182"
    },
    "poses": {
      "intro": {
        "spine": -0.14,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.15,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.2,
        "head": -0.91
      },
      "release": {
        "spine": -0.08,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.11,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.18,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "blade-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Pale upright native plate with long downward scythe arms.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-albino-burster",
    "fighterId": "albino-burster",
    "profileId": "enemy-068-albino-burster",
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-068-albino-burster.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "1eebd34c5ec6062ed6de7b9a4698bc4012c9075416fd5012bd0ac90c5152957f",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          751,
          547
        ],
        "tip": [
          751,
          561
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          751,
          547
        ],
        "tip": [
          1071,
          593
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1196,
          539
        ],
        "tip": [
          1366,
          522
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          494,
          854
        ],
        "tip": [
          494,
          868
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          789,
          829
        ],
        "tip": [
          789,
          843
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1129,
          858
        ],
        "tip": [
          1129,
          872
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1248,
          832
        ],
        "tip": [
          1248,
          846
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1071,
          593
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1366,
          522
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1129,
          858
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1248,
          832
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          494,
          854
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          789,
          829
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "04480c738e02ffd00c3f581cf9717d7e50fe7cfffe3ffffe3fffff5effff37ff9f1bfffe073ffe4ffff425f064027b10"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Pale sac-bearing back and curled tail are retained in their painted pose.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-albino-six",
    "fighterId": "albino-six",
    "profileId": "enemy-070-albino-specimen-six-line",
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-070-albino-specimen-six-line.png",
    "sourceFacing": 1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "10a9d8197cf2f844d492e2cb90268550795e6009b61e610cca8cfb91a0639994",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          768,
          706
        ],
        "tip": [
          770,
          716
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          768,
          706
        ],
        "tip": [
          934,
          567
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          992,
          428
        ],
        "tip": [
          1080,
          432
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          556,
          1003
        ],
        "tip": [
          556,
          1017
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          934,
          1015
        ],
        "tip": [
          934,
          1029
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          850,
          754
        ],
        "tip": [
          855,
          755
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1127,
          677
        ],
        "tip": [
          1131,
          691
        ]
      }
    ],
    "pinned": [
      0,
      832,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          934,
          567
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1080,
          432
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          850,
          754
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1127,
          677
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          556,
          1003
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          934,
          1015
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "0020800000080808002c003f8403fc103fe003fe003f4387fc70ffe75ffe63f747ff683fec20ddf001c70020100002000000"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Pale crouched ribcage, separately located palms and painted digitigrade toes.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-albino-ripper",
    "fighterId": "albino-ripper",
    "profileId": "enemy-075-albino-atarax-ripper",
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-075-albino-atarax-ripper.png",
    "sourceFacing": 1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "32ff991d11c5bc959a7ab39a362c0b523515c596e1082bef085443bcbc6b04c2",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          698,
          714
        ],
        "tip": [
          698,
          728
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          698,
          714
        ],
        "tip": [
          899,
          525
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          976,
          444
        ],
        "tip": [
          1046,
          471
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          421,
          1022
        ],
        "tip": [
          421,
          1036
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          876,
          1026
        ],
        "tip": [
          876,
          1040
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          803,
          752
        ],
        "tip": [
          803,
          766
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1057,
          791
        ],
        "tip": [
          1057,
          805
        ]
      }
    ],
    "pinned": [
      0,
      832,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          899,
          525
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1046,
          471
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          803,
          752
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1057,
          791
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          421,
          1022
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          876,
          1026
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "0422c60000490208090c401f0403f8007fc26ffcc2ffc38ffc7dff877ffc7fffc3fffc0ffce171f007af084040500000000a"
    },
    "poses": {
      "intro": {
        "spine": -0.161,
        "head": 0.84
      },
      "restraint": {
        "spine": 0.1725,
        "head": -0.56
      },
      "struggle": {
        "spine": 0.23,
        "head": -0.98
      },
      "release": {
        "spine": -0.092,
        "head": 0.35
      },
      "round-win": {
        "spine": -0.1265,
        "head": -0.7
      },
      "round-loss": {
        "spine": 0.207,
        "head": 0.805
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Pale heavy crown leans above the original wide claw supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.14,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-armored-runner",
    "fighterId": "armored-runner",
    "profileId": "enemy-110-armored-runner",
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-110-armored-runner.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "3db62341e648d4fa020c1b17ab56205f605362cc6337f58fe563b6fcbe998630",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          706,
          543
        ],
        "tip": [
          706,
          557
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          706,
          543
        ],
        "tip": [
          1063,
          522
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1171,
          444
        ],
        "tip": [
          1308,
          448
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          452,
          850
        ],
        "tip": [
          452,
          864
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          805,
          829
        ],
        "tip": [
          805,
          843
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1200,
          858
        ],
        "tip": [
          1200,
          872
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1374,
          846
        ],
        "tip": [
          1374,
          855
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1063,
          522
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1308,
          448
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1200,
          858
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1374,
          846
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          452,
          850
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          805,
          829
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0808080100439fd0487df788719ff87cfffc6ffffefffffe3fffdf8bffe413ffe30777fa073ffd77fcfe01f9f4026f4e"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Orange armored runner, low thorax and four individually located supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-armored-ravager",
    "fighterId": "armored-ravager",
    "profileId": "enemy-117-armored-ravager",
    "path": "/assets/openai/sprites/static-enemy-v97/enemy-117-armored-ravager.png",
    "sourceFacing": 1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "1c2de23b311763f75ef8b79e81b1367b52155685c9735bdbfb55a521cfe90b3d",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          698,
          679
        ],
        "tip": [
          698,
          693
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          698,
          679
        ],
        "tip": [
          853,
          502
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          903,
          340
        ],
        "tip": [
          984,
          336
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          521,
          1057
        ],
        "tip": [
          521,
          1071
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          930,
          1057
        ],
        "tip": [
          930,
          1071
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          849,
          706
        ],
        "tip": [
          849,
          720
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1092,
          710
        ],
        "tip": [
          1092,
          724
        ]
      }
    ],
    "pinned": [
      0,
      896,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          853,
          502
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          984,
          336
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          849,
          706
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1092,
          710
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          521,
          1057
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          930,
          1057
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "0020c00000087c008ff000ffa40ff810ff861fe101ff061ff881ffca7ffc33ffe77fe6fffe67f9e42bd78fbdb8440e800c32"
    },
    "poses": {
      "intro": {
        "spine": -0.14,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.15,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.2,
        "head": -0.91
      },
      "release": {
        "spine": -0.08,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.11,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.18,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "blade-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Red armored blades remain long static source attachments.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-armored-red",
    "fighterId": "armored-red",
    "profileId": "enemy-123-armored-red-xenomorph",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-123-armored-red-xenomorph.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "416b5223221fdb44af5a96ae9d8353221591b20ae9ac336e467d27dafb25b142",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          843,
          539
        ],
        "tip": [
          843,
          553
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          843,
          539
        ],
        "tip": [
          1075,
          377
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1162,
          286
        ],
        "tip": [
          1274,
          286
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          560,
          933
        ],
        "tip": [
          560,
          947
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1084,
          929
        ],
        "tip": [
          1084,
          943
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1013,
          655
        ],
        "tip": [
          1013,
          669
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1387,
          605
        ],
        "tip": [
          1387,
          619
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1075,
          377
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1274,
          286
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1013,
          655
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1387,
          605
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          560,
          933
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1084,
          929
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "004008001ff200bffa003ff8003ffc003ff8043ff8607ff440fffcc9ffffe7ffdfffffb67ffbbe5ddfc07dc5ec00c800"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Red armored thin torso and long forward open claws.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-armored-k-series",
    "fighterId": "armored-k-series",
    "profileId": "enemy-124-armored-k-series-yellow-xenomorph",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-124-armored-k-series-yellow-xenomorph.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "28fc592dc0e74dc7afe0d7ec34fa58165e24da5b69620ff997392693e80c5f54",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          764,
          601
        ],
        "tip": [
          764,
          615
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          764,
          601
        ],
        "tip": [
          880,
          402
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          951,
          290
        ],
        "tip": [
          1046,
          269
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          639,
          925
        ],
        "tip": [
          639,
          939
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          967,
          933
        ],
        "tip": [
          967,
          947
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          934,
          630
        ],
        "tip": [
          934,
          644
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1133,
          497
        ],
        "tip": [
          1133,
          511
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          880,
          402
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1046,
          269
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          934,
          630
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1133,
          497
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          639,
          925
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          967,
          933
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0c0cc80e7f620f7fb4137fc0077fc08effa80c7fb00fffe08f7fe10fff6047ff440c7f4e14ffd040eed060ff8800f780"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Golden K-series crown and broad feet have different native pivots.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-armored-ripper",
    "fighterId": "armored-ripper",
    "profileId": "enemy-127-armored-atarax-ripper",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-127-armored-atarax-ripper.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "48090b66b436696c579d82ae7715e4e78109490c323526106a76968c58e2bb69",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          839,
          580
        ],
        "tip": [
          839,
          594
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          839,
          580
        ],
        "tip": [
          1042,
          439
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1167,
          290
        ],
        "tip": [
          1291,
          286
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          660,
          904
        ],
        "tip": [
          660,
          918
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1079,
          904
        ],
        "tip": [
          1079,
          918
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1050,
          643
        ],
        "tip": [
          1050,
          657
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1259,
          667
        ],
        "tip": [
          1260,
          681
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1042,
          439
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1291,
          286
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1050,
          643
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1259,
          667
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          660,
          904
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1079,
          904
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0000000001e10003fe000ff8001ff8005ff8063ff8013fe4827ff05ffff81ffff819ffd852fb8026f7fc24fde8020e00"
    },
    "poses": {
      "intro": {
        "spine": -0.161,
        "head": 0.84
      },
      "restraint": {
        "spine": 0.1725,
        "head": -0.56
      },
      "struggle": {
        "spine": 0.23,
        "head": -0.98
      },
      "release": {
        "spine": -0.092,
        "head": 0.35
      },
      "round-win": {
        "spine": -0.1265,
        "head": -0.7
      },
      "round-loss": {
        "spine": 0.207,
        "head": 0.805
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Dark layered armor with two hanging hands and a low tail.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.14,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-armored-ripper-queen",
    "fighterId": "armored-ripper-queen",
    "profileId": "enemy-128-armored-ripper-queen",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-128-armored-ripper-queen.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "ff323a9e17b03011395212ddae1426a730df34ebe1d5d206f6f2f46fe489545f",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          784,
          676
        ],
        "tip": [
          779,
          680
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          784,
          676
        ],
        "tip": [
          1059,
          481
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1150,
          369
        ],
        "tip": [
          1357,
          352
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          494,
          937
        ],
        "tip": [
          494,
          951
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1137,
          937
        ],
        "tip": [
          1137,
          951
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1074,
          846
        ],
        "tip": [
          1074,
          860
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1428,
          750
        ],
        "tip": [
          1428,
          764
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1059,
          481
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1357,
          352
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1074,
          846
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1428,
          750
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          494,
          937
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1137,
          937
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0007ec0e0ff8041ff80c7ffcbd3ffc70fffe65fffe61fffce3fff8fffffb7ffffe3ffffe03f7ee5383e603e9f407e9f6"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Large dorsal and cranial crown; separate long foreclaws are kept in source pose.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-acid-runner",
    "fighterId": "acid-runner",
    "profileId": "enemy-162-acid-blooded-runner",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-162-acid-blooded-runner.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "cba49f56d6f5af3d0c54ba4d3000aac282b2a8dac9ff68fd8a187ae7b9e9dea6",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          656,
          531
        ],
        "tip": [
          656,
          545
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          656,
          531
        ],
        "tip": [
          1000,
          543
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1084,
          439
        ],
        "tip": [
          1295,
          522
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          452,
          796
        ],
        "tip": [
          452,
          810
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          751,
          779
        ],
        "tip": [
          751,
          793
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1189,
          801
        ],
        "tip": [
          1189,
          815
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1374,
          771
        ],
        "tip": [
          1374,
          785
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1000,
          543
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1295,
          522
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1189,
          801
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1374,
          771
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          452,
          796
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          751,
          779
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "06480824267310185cdfd7de3d8ffd70bffe6efffe73fffefffffffffdf047ffff37fefe37fffe7bff7a3f7c5e0398f4"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Golden runner silhouette has measured knee-height body rather than biped proportions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-acid-lurker",
    "fighterId": "acid-lurker",
    "profileId": "enemy-167-acid-blooded-lurker",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-167-acid-blooded-lurker.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "8d1d59290bc721e2ca60b819666a0f02be3324836fb401c8456591045a6f935e",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          643,
          601
        ],
        "tip": [
          643,
          615
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          643,
          601
        ],
        "tip": [
          1005,
          618
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1146,
          564
        ],
        "tip": [
          1295,
          609
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          428,
          788
        ],
        "tip": [
          428,
          802
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          668,
          789
        ],
        "tip": [
          668,
          803
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1244,
          766
        ],
        "tip": [
          1249,
          768
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1411,
          788
        ],
        "tip": [
          1415,
          797
        ]
      }
    ],
    "pinned": [
      0,
      576,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1005,
          618
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1295,
          609
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1244,
          766
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1411,
          788
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          428,
          788
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          668,
          789
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "000800001600000080001fb0073f9007bf98007ff83ffffcfffffd63fffd73fffc7ffffe2fefff37b77f07c1dc0000d4"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Very low lurker head and four long black foreclaws.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-acid-ravager",
    "fighterId": "acid-ravager",
    "profileId": "enemy-169-acid-blooded-ravager",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-169-acid-blooded-ravager.png",
    "sourceFacing": 1,
    "sourceWidth": 1402,
    "sourceHeight": 1122,
    "sourceSha256": "fe9ca3ee2dea5bf75c6417660b177eb8278bda7303ce601bf004c58c1fefe159",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          746,
          648
        ],
        "tip": [
          746,
          662
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          746,
          648
        ],
        "tip": [
          915,
          469
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1024,
          365
        ],
        "tip": [
          1141,
          330
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          553,
          989
        ],
        "tip": [
          553,
          1003
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1000,
          989
        ],
        "tip": [
          1000,
          1003
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          925,
          724
        ],
        "tip": [
          925,
          738
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1224,
          701
        ],
        "tip": [
          1227,
          712
        ]
      }
    ],
    "pinned": [
      0,
      832,
      1402,
      1122
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          915,
          469
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1141,
          330
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          925,
          724
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1224,
          701
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          553,
          989
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1000,
          989
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 22,
      "rows": 18,
      "mask": "10200000000003fe107ff8017fe004ff8007fa005fe0317fe003ffc3bfff9cffee7fff19ffbcefdc799f7bf10ebedc001c0"
    },
    "poses": {
      "intro": {
        "spine": -0.14,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.15,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.2,
        "head": -0.91
      },
      "release": {
        "spine": -0.08,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.11,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.18,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "blade-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Dark red high crown with blade-shaped forelimbs and widely spaced native toes.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-acid-boiler",
    "fighterId": "acid-boiler",
    "profileId": "enemy-170-acid-blooded-boiler",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-170-acid-blooded-boiler.png",
    "sourceFacing": 1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "69a8b01cbef7625e2a7bf0e1243b9fb7c3c987cac97acb1ce5988237bc2f1cdc",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          756,
          567
        ],
        "tip": [
          756,
          581
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          756,
          567
        ],
        "tip": [
          907,
          421
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          988,
          328
        ],
        "tip": [
          1107,
          274
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          606,
          1111
        ],
        "tip": [
          606,
          1125
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          995,
          1104
        ],
        "tip": [
          995,
          1118
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          910,
          684
        ],
        "tip": [
          910,
          698
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1104,
          737
        ],
        "tip": [
          1104,
          751
        ]
      }
    ],
    "pinned": [
      0,
      960,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          907,
          421
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1107,
          274
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          910,
          684
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1104,
          737
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          606,
          1111
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          995,
          1104
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "6000001000487fc307feca3fe447fe907f4687e052ff220ff810ffc69ffe71ffe73ffc3fee2bfce69fdf021e7c5004600002"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Golden sacs and long sloped neck remain distinct from its narrow lower limbs.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-antilope",
    "fighterId": "user-antilope",
    "profileId": "pose-v95-user-xeno-antilope",
    "path": "/assets/openai/sprites/static-enemy-v95/xeno-antilope.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "af9fa4b0fd04d2216907e10d2340fefae8b1ac6f1b0b2d45dc9971823c07f336",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          911,
          745
        ],
        "tip": [
          911,
          759
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          911,
          745
        ],
        "tip": [
          621,
          664
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          421,
          482
        ],
        "tip": [
          262,
          471
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          972,
          1046
        ],
        "tip": [
          972,
          1060
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          911,
          1053
        ],
        "tip": [
          911,
          1067
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          505,
          1042
        ],
        "tip": [
          505,
          1056
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          486,
          1034
        ],
        "tip": [
          486,
          1048
        ]
      }
    ],
    "pinned": [
      0,
      896,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          621,
          664
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          262,
          471
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          505,
          1042
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          486,
          1034
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          972,
          1046
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          911,
          1053
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "0020c4008010c0037d082ffc03ffc03ffe81ffc01fff013ff881ffc81ffc27ffc1fffcb0ffe81d3c07f78011704002002032"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.78
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.52
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.91
      },
      "release": {
        "spine": 0.096,
        "head": -0.325
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.65
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Left-facing antelope plate; only painted support locations are used, with no hidden hindleg reconstruction.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-brute",
    "fighterId": "user-brute",
    "profileId": "pose-v95-user-xeno-brute",
    "path": "/assets/openai/sprites/static-enemy-v95/xeno-brute.png",
    "sourceFacing": -1,
    "sourceWidth": 1121,
    "sourceHeight": 1403,
    "sourceSha256": "c093b0f9bf4ab5b6fa79de9f5787d2552957d1959670c639054c1c01875fca13",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          526,
          725
        ],
        "tip": [
          526,
          739
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          526,
          725
        ],
        "tip": [
          431,
          518
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          293,
          466
        ],
        "tip": [
          207,
          531
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          440,
          1200
        ],
        "tip": [
          440,
          1214
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          849,
          1217
        ],
        "tip": [
          849,
          1231
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          229,
          1032
        ],
        "tip": [
          229,
          1046
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          599,
          1079
        ],
        "tip": [
          599,
          1093
        ]
      }
    ],
    "pinned": [
      0,
      1024,
      1121,
      1403
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          431,
          518
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          207,
          531
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          229,
          1032
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          599,
          1079
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          440,
          1200
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          849,
          1217
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 18,
      "rows": 22,
      "mask": "44009004007f205f381ffc0ffe63ffb3fff47fef1ffde7ffb8bfe61ff987ffe1fff8fff93ffc1efbc07ce0ff38093e02ada"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.84
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.56
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.98
      },
      "release": {
        "spine": 0.096,
        "head": -0.35
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.7
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.805
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "heavy-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Left-facing brute bends forward on broad original feet and long low hands.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.14,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-carrier",
    "fighterId": "user-carrier",
    "profileId": "pose-v95-user-xeno-carrier",
    "path": "/assets/openai/sprites/static-enemy-v95/xeno-carrier-full.png",
    "sourceFacing": -1,
    "sourceWidth": 1099,
    "sourceHeight": 1431,
    "sourceSha256": "faef235ddf434fb7e6f8adc9a0f83fa821412527ab4bb4175f3dde9418a8c953",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          431,
          771
        ],
        "tip": [
          431,
          785
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          431,
          771
        ],
        "tip": [
          475,
          559
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          440,
          432
        ],
        "tip": [
          378,
          423
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          409,
          1321
        ],
        "tip": [
          412,
          1336
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          498,
          1259
        ],
        "tip": [
          499,
          1259
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          242,
          850
        ],
        "tip": [
          242,
          864
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          462,
          947
        ],
        "tip": [
          462,
          961
        ]
      }
    ],
    "pinned": [
      0,
      1088,
      1099,
      1431
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          475,
          559
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          378,
          423
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          242,
          850
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          462,
          947
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          409,
          1321
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          498,
          1259
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 18,
      "rows": 23,
      "mask": "200001bf00fff8fffe1fff07ffc3fff07ff807fe03ff81ffe0fff83ffe17df007b9866f8d9d808e6003bd01ed84712219e000000"
    },
    "poses": {
      "intro": {
        "spine": 0.14,
        "head": -0.72
      },
      "restraint": {
        "spine": -0.15,
        "head": 0.48
      },
      "struggle": {
        "spine": -0.2,
        "head": 0.84
      },
      "release": {
        "spine": 0.08,
        "head": -0.3
      },
      "round-win": {
        "spine": 0.11,
        "head": 0.6
      },
      "round-loss": {
        "spine": -0.18,
        "head": -0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "loaded-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Loaded carrier retains the distinct parasites and dorsal appendages as one static carried region.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 4.8
    },
    "rigidZonesV163": [
      {
        "bone": "hips",
        "polygon": [
          [
            435,
            84
          ],
          [
            963,
            114
          ],
          [
            1055,
            876
          ],
          [
            721,
            1061
          ],
          [
            571,
            771
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-spiker",
    "fighterId": "user-spiker",
    "profileId": "pose-v95-user-xeno-spiker",
    "path": "/assets/openai/sprites/static-enemy-v95/xeno-spiker.png",
    "sourceFacing": -1,
    "sourceWidth": 1374,
    "sourceHeight": 1145,
    "sourceSha256": "0665a7e0f5233eef183d50dc83352c18691b8a538756c21e05403aa314f5f401",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          932,
          639
        ],
        "tip": [
          932,
          653
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          932,
          639
        ],
        "tip": [
          501,
          595
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          420,
          539
        ],
        "tip": [
          241,
          643
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          796,
          936
        ],
        "tip": [
          796,
          950
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1002,
          956
        ],
        "tip": [
          1002,
          970
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          156,
          974
        ],
        "tip": [
          156,
          988
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          572,
          1007
        ],
        "tip": [
          572,
          1021
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1374,
      1145
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          501,
          595
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          241,
          643
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          156,
          974
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          572,
          1007
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          796,
          936
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1002,
          956
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 22,
      "rows": 18,
      "mask": "2011083562785fc40efe441ffa413ffc63ffe61fff9a7fff89ffff03ffff8dfffeafffb3f9fe6fcfb81f7fe851fc3b60f28"
    },
    "poses": {
      "intro": {
        "spine": 0.119,
        "head": -0.6
      },
      "restraint": {
        "spine": -0.1275,
        "head": 0.4
      },
      "struggle": {
        "spine": -0.17,
        "head": 0.7
      },
      "release": {
        "spine": 0.068,
        "head": -0.25
      },
      "round-win": {
        "spine": 0.0935,
        "head": 0.5
      },
      "round-loss": {
        "spine": -0.153,
        "head": -0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Orange spiked quadruped with a very large forward head and separate forefeet.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-warrior-red",
    "fighterId": "user-warrior-red",
    "profileId": "pose-v95-user-xeno-warrior-red",
    "path": "/assets/openai/sprites/static-enemy-v95/xeno-warrior-red.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "c9ed4247aa61b27018dcb1b01e4210ce3e47592f66467bd7407d46e039fd1e3d",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          779,
          698
        ],
        "tip": [
          779,
          712
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          779,
          698
        ],
        "tip": [
          513,
          725
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          343,
          621
        ],
        "tip": [
          278,
          656
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          779,
          1026
        ],
        "tip": [
          771,
          1034
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1080,
          1077
        ],
        "tip": [
          1080,
          1091
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          266,
          1073
        ],
        "tip": [
          266,
          1086
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          525,
          1107
        ],
        "tip": [
          525,
          1121
        ]
      }
    ],
    "pinned": [
      0,
      896,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          513,
          725
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          278,
          656
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          266,
          1073
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          525,
          1107
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          779,
          1026
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1080,
          1077
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "000000038008380041a8005c0001c217cc0cfcfe9fc7e3ff9e3fffc3fff813fd803ffc03ffe07fec3ff9c3fd7c0044080000"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.78
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.52
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.91
      },
      "release": {
        "spine": 0.096,
        "head": -0.325
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.65
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Red low head and high raised tail; no animated tail strike is introduced.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-phantera-black",
    "fighterId": "user-phantera-black",
    "profileId": "pose-v95-user-xeno-phantera-black",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-66-xeno-phantera-black.png",
    "sourceFacing": -1,
    "sourceWidth": 1074,
    "sourceHeight": 1464,
    "sourceSha256": "cc51d5f6ed21fdf2778d3d50dc70b4053ad0ef41ae3789044178a38d2583e7bb",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          712,
          1000
        ],
        "tip": [
          712,
          1014
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          712,
          1000
        ],
        "tip": [
          498,
          964
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          416,
          927
        ],
        "tip": [
          326,
          1020
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          699,
          1242
        ],
        "tip": [
          699,
          1256
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          882,
          1222
        ],
        "tip": [
          882,
          1236
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          174,
          1281
        ],
        "tip": [
          175,
          1297
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          593,
          1306
        ],
        "tip": [
          593,
          1320
        ]
      }
    ],
    "pinned": [
      0,
      1152,
      1074,
      1464
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          498,
          964
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          326,
          1020
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          174,
          1281
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          593,
          1306
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          699,
          1242
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          882,
          1222
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 17,
      "rows": 23,
      "mask": "20001018000e00038000c00060003008180018000f8023c00063f0707ff07ff03ff09ff8077e03bd879ec78f2016802400"
    },
    "poses": {
      "intro": {
        "spine": 0.112,
        "head": -0.54
      },
      "restraint": {
        "spine": -0.12,
        "head": 0.36
      },
      "struggle": {
        "spine": -0.16,
        "head": 0.63
      },
      "release": {
        "spine": 0.064,
        "head": -0.225
      },
      "round-win": {
        "spine": 0.088,
        "head": 0.45
      },
      "round-loss": {
        "spine": -0.144,
        "head": -0.5175
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "low-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Very small low-facing black body under a tall tail; raised supports receive local static patches.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.09,
      "radiansPerSecond": 5.1
    },
    "rigidZonesV163": [],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-rhino",
    "fighterId": "user-rhino",
    "profileId": "pose-v95-user-xeno-rhino",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-69-xeno-rhino.png",
    "sourceFacing": 1,
    "sourceWidth": 1374,
    "sourceHeight": 1145,
    "sourceSha256": "eb8372566b0e069787da2e9c11a01e15a2929c049d89f7735e451443617c31ef",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          847,
          610
        ],
        "tip": [
          845,
          618
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          847,
          610
        ],
        "tip": [
          698,
          654
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          605,
          669
        ],
        "tip": [
          490,
          725
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          884,
          1000
        ],
        "tip": [
          884,
          1014
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1040,
          981
        ],
        "tip": [
          1040,
          995
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          386,
          989
        ],
        "tip": [
          386,
          1003
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          258,
          957
        ],
        "tip": [
          261,
          958
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1374,
      1145
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          698,
          654
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          490,
          725
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          386,
          989
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          258,
          957
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          884,
          1000
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1040,
          981
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 22,
      "rows": 18,
      "mask": "0403000000002190100fc0007f8191ff201ffc01fff007ffe00ffe00ff6823ffc00fff807f3f0be0fc0793e85f4f8120000"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Unusual high shoulder armor and low horned front are kept apart from the four supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-chameleon",
    "fighterId": "user-chameleon",
    "profileId": "pose-v95-user-xeno-chameleon",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-55-xeno-chameleon.png",
    "sourceFacing": -1,
    "sourceWidth": 1748,
    "sourceHeight": 899,
    "sourceSha256": "a14ba9e91e139c64d65aadc0233ac93f343c291ea5e76dd9a54518f8c6de6ae4",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          780,
          530
        ],
        "tip": [
          780,
          544
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          780,
          530
        ],
        "tip": [
          506,
          520
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          383,
          388
        ],
        "tip": [
          302,
          374
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          685,
          771
        ],
        "tip": [
          685,
          785
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          850,
          776
        ],
        "tip": [
          850,
          790
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          307,
          781
        ],
        "tip": [
          307,
          795
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          454,
          738
        ],
        "tip": [
          452,
          750
        ]
      }
    ],
    "pinned": [
      0,
      576,
      1748,
      899
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          506,
          520
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          302,
          374
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          307,
          781
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          454,
          738
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          685,
          771
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          850,
          776
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 28,
      "rows": 15,
      "mask": "000000007080001fe00087ff402c5ffe2147fff7fc3ffcff81ffff7e07ffd3c07ffdbe0fff5bc0f7c4801e7f82041080000000000"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.78
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.52
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.91
      },
      "release": {
        "spine": 0.096,
        "head": -0.325
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.65
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Left-facing sail-backed chameleon has a long curling tail and distinct front feet.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.3
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-chameleon-2",
    "fighterId": "user-chameleon-2",
    "profileId": "pose-v95-user-xeno-chameleon-2",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-54-xeno-chameleon-2.png",
    "sourceFacing": -1,
    "sourceWidth": 1678,
    "sourceHeight": 937,
    "sourceSha256": "fe08176517bb488c5e42b60c1df72c48aa07bf9a3677615a91e9bf76a44d0b63",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          830,
          493
        ],
        "tip": [
          830,
          507
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          830,
          493
        ],
        "tip": [
          540,
          475
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          376,
          398
        ],
        "tip": [
          299,
          457
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          1012,
          702
        ],
        "tip": [
          1019,
          708
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1142,
          725
        ],
        "tip": [
          1142,
          739
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          240,
          742
        ],
        "tip": [
          240,
          756
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          803,
          742
        ],
        "tip": [
          803,
          756
        ]
      }
    ],
    "pinned": [
      0,
      512,
      1678,
      937
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          540,
          475
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          299,
          457
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          240,
          742
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          803,
          742
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          1012,
          702
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1142,
          725
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 27,
      "rows": 15,
      "mask": "0070408002c00040009009fc0004ffc8007ffe8207ffe1f0fffe7c9fffef88fffff03ae7ff5fdeffe3b0d7e00c05011580e000"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.78
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.52
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.91
      },
      "release": {
        "spine": 0.096,
        "head": -0.325
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.65
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Left-facing red chameleon on four thin static supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.3
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-trex-king",
    "fighterId": "user-trex-king",
    "profileId": "pose-v95-user-xeno-trex-king",
    "path": "/assets/openai/sprites/static-enemy-v95/xeno-trex-king.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "3c8907228297b8db491834d835528d517e0cd98534ed26f35cfe7cb017991a2b",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          567,
          675
        ],
        "tip": [
          567,
          689
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          567,
          675
        ],
        "tip": [
          355,
          559
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          174,
          544
        ],
        "tip": [
          139,
          621
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          343,
          922
        ],
        "tip": [
          343,
          936
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          749,
          903
        ],
        "tip": [
          749,
          917
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          266,
          767
        ],
        "tip": [
          270,
          777
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          421,
          745
        ],
        "tip": [
          421,
          759
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          355,
          559
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          139,
          621
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          266,
          767
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          421,
          745
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          343,
          922
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          749,
          903
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "002044000000100000180a100700007fc00ffd3effe7ffffffffff3fffe36ff936f1c81f3c0000800801080d404042000002"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.84
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.56
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.98
      },
      "release": {
        "spine": 0.096,
        "head": -0.35
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.7
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.805
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "heavy-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Purple king crouches with a long counterbalancing tail and short forearms.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.14,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-trex-queen",
    "fighterId": "user-trex-queen",
    "profileId": "pose-v95-user-xeno-trex-queen",
    "path": "/assets/openai/sprites/static-enemy-v95/xeno-trex-queen.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "95f927aa4f382847bbf8a1f871d8b2f6ada8c84660aa0d597c132bab1fd6eb40",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          536,
          702
        ],
        "tip": [
          536,
          716
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          536,
          702
        ],
        "tip": [
          367,
          559
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          265,
          521
        ],
        "tip": [
          123,
          579
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          351,
          918
        ],
        "tip": [
          351,
          932
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          768,
          914
        ],
        "tip": [
          768,
          928
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          318,
          751
        ],
        "tip": [
          319,
          765
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          348,
          758
        ],
        "tip": [
          348,
          772
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          367,
          559
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          123,
          579
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          318,
          751
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          348,
          758
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          351,
          918
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          768,
          914
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "00208400000000000008000000f8003fe007fe3effe7efffffcfff30ffe32ffa3079c80f9d21080000140061604046000002"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.84
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.56
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.98
      },
      "release": {
        "spine": 0.096,
        "head": -0.35
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.7
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.805
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "heavy-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Grey queen-like crested beast uses its own forward neck and large hindfeet.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.14,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-big-xeno",
    "fighterId": "user-big-xeno",
    "profileId": "pose-v95-user-xeno-big-xeno-1",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-40-xeno-big-xeno-1.png",
    "sourceFacing": -1,
    "sourceWidth": 1377,
    "sourceHeight": 1142,
    "sourceSha256": "28c7e10e95a4ccc62fc44e961f5602e81d8835ee563f514a32adf3b5c33fbd7c",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          700,
          684
        ],
        "tip": [
          702,
          694
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          700,
          684
        ],
        "tip": [
          610,
          543
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          525,
          458
        ],
        "tip": [
          417,
          495
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          607,
          893
        ],
        "tip": [
          607,
          905
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          800,
          930
        ],
        "tip": [
          800,
          944
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          290,
          710
        ],
        "tip": [
          291,
          726
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          424,
          774
        ],
        "tip": [
          424,
          788
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1377,
      1142
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          610,
          543
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          417,
          495
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          290,
          710
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          424,
          774
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          607,
          893
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          800,
          930
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 22,
      "rows": 18,
      "mask": "002a000020000361003f8001fe001ff9007ffe03fff80fffc07ffe03fffc0ffff20fffc03fff001fdc01ce08220b0000900"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.84
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.56
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.98
      },
      "release": {
        "spine": 0.096,
        "head": -0.35
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.7
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.805
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "heavy-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Massive dark hunched torso with low forward hands and separated rear feet.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.14,
      "radiansPerSecond": 5.3
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-pale-spined",
    "fighterId": "user-pale-spined",
    "profileId": "pose-v95-user-quadrupede-pale-epineux",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-25-quadrupede-pale-epineux.png",
    "sourceFacing": -1,
    "sourceWidth": 1498,
    "sourceHeight": 1050,
    "sourceSha256": "a0fd251e4802655e3745b716af0ab1a80cb90eb16b4575263f5bbaf78bcf67db",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          1078,
          729
        ],
        "tip": [
          1083,
          740
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          1078,
          729
        ],
        "tip": [
          691,
          598
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          466,
          336
        ],
        "tip": [
          364,
          389
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          877,
          883
        ],
        "tip": [
          878,
          883
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1364,
          912
        ],
        "tip": [
          1364,
          926
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          197,
          772
        ],
        "tip": [
          201,
          783
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          445,
          868
        ],
        "tip": [
          445,
          882
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1498,
      1050
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          691,
          598
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          364,
          389
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          197,
          772
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          445,
          868
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          877,
          883
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1364,
          912
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 17,
      "mask": "00ff8001ff8003ff8027ff8007ff800fff801fffc00fffc04fffe03ffff87ffffc7cfffc7fff7e2fff5e4fba1e4f0004000000"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.78
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.52
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.91
      },
      "release": {
        "spine": 0.096,
        "head": -0.325
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.65
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Pale spined creature keeps its large mouth and long foreclaws separate from its back legs.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-tiger-biped",
    "fighterId": "user-tiger-biped",
    "profileId": "pose-v95-user-bipede-tigre",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-06-bipede-tigre.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "138d66d73d38d0d514b3766117e1aac4f00af108b9738c36b8ef608602ec70a7",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          564,
          721
        ],
        "tip": [
          565,
          721
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          564,
          721
        ],
        "tip": [
          445,
          574
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          359,
          502
        ],
        "tip": [
          301,
          478
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          556,
          953
        ],
        "tip": [
          558,
          967
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          810,
          1057
        ],
        "tip": [
          810,
          1071
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          251,
          737
        ],
        "tip": [
          251,
          751
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          552,
          679
        ],
        "tip": [
          552,
          693
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          445,
          574
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          301,
          478
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          251,
          737
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          552,
          679
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          556,
          953
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          810,
          1057
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "0020848870004102fff80fdf07fff81ffdc5fffc1ff7c7ffbe7fff83fffc7ffe09ff78cffc285dc0047e0a09e04007480010"
    },
    "poses": {
      "intro": {
        "spine": 0.224,
        "head": -1.08
      },
      "restraint": {
        "spine": -0.24,
        "head": 0.72
      },
      "struggle": {
        "spine": -0.32,
        "head": 1.26
      },
      "release": {
        "spine": 0.128,
        "head": -0.45
      },
      "round-win": {
        "spine": 0.176,
        "head": 0.9
      },
      "round-loss": {
        "spine": -0.288,
        "head": -1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Tiger-striped biped has asymmetrical native foot heights; no full stepping cycle is invented.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-raised-crest",
    "fighterId": "user-raised-crest",
    "profileId": "pose-v95-user-bipede-crete-relevee",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-07-bipede-crete-relevee.png",
    "sourceFacing": 1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "02578d158f03b630de2a30ad8603f977eec6b1b295df060e9b31ac2fd4223ac0",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          729,
          765
        ],
        "tip": [
          729,
          779
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          729,
          765
        ],
        "tip": [
          745,
          563
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          826,
          556
        ],
        "tip": [
          907,
          606
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          448,
          1080
        ],
        "tip": [
          448,
          1094
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          787,
          1064
        ],
        "tip": [
          787,
          1078
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          803,
          793
        ],
        "tip": [
          803,
          807
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1015,
          795
        ],
        "tip": [
          1015,
          809
        ]
      }
    ],
    "pinned": [
      0,
      896,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          745,
          563
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          907,
          606
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          803,
          793
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1015,
          795
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          448,
          1080
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          787,
          1064
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "2022c421060b1c0067480c7c05ffe09ffe0dbfe05bff41bff09fff08fff807ff847ffc87ffc833f8037b087fd0422e483800"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Forward low head below an extended raised tail/crest, with two separate claws.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-bulbous-quadruped",
    "fighterId": "user-bulbous-quadruped",
    "profileId": "pose-v95-user-quadrupede-bulbeux",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-08-quadrupede-bulbeux.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "38c9af494b1e9419dcebdd5d836afbec63b9f6a8d8120cf7d384a9587b0fc618",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          754,
          806
        ],
        "tip": [
          754,
          820
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          754,
          806
        ],
        "tip": [
          467,
          598
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          228,
          536
        ],
        "tip": [
          143,
          502
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          791,
          949
        ],
        "tip": [
          791,
          963
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          826,
          941
        ],
        "tip": [
          826,
          955
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          301,
          930
        ],
        "tip": [
          301,
          944
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          386,
          911
        ],
        "tip": [
          386,
          925
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          467,
          598
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          143,
          502
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          301,
          930
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          386,
          911
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          791,
          949
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          826,
          941
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "08204000000c10000838020007e0007e4007f8007fe133ff801ffff1fffe077bc0ffc81e3c21e3c000280008404442000002"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.78
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.52
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.91
      },
      "release": {
        "spine": 0.096,
        "head": -0.325
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.65
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Bulbous fleshy quadruped with a long thin tail and four compact support patches.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-black-bone-raptor",
    "fighterId": "user-black-bone-raptor",
    "profileId": "pose-v95-user-rapace-noir-os",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-11-rapace-noir-os.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "3610c65456a6f0262d6987b1bf0fa642e095d64ae28f527b433db85c75bdc23b",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          691,
          594
        ],
        "tip": [
          691,
          608
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          691,
          594
        ],
        "tip": [
          459,
          575
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          286,
          451
        ],
        "tip": [
          170,
          440
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          613,
          872
        ],
        "tip": [
          613,
          886
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          980,
          949
        ],
        "tip": [
          980,
          963
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          394,
          766
        ],
        "tip": [
          396,
          777
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          440,
          799
        ],
        "tip": [
          440,
          813
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          459,
          575
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          170,
          440
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          394,
          766
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          440,
          799
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          613,
          872
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          980,
          949
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "00200400000100000008001803f000ffe0cffffcfffff3fffe17f830ffe70fffe07ef802ef80123800010800004042000000"
    },
    "poses": {
      "intro": {
        "spine": 0.224,
        "head": -1.08
      },
      "restraint": {
        "spine": -0.24,
        "head": 0.72
      },
      "struggle": {
        "spine": -0.32,
        "head": 1.26
      },
      "release": {
        "spine": 0.128,
        "head": -0.45
      },
      "round-win": {
        "spine": 0.176,
        "head": 0.9
      },
      "round-loss": {
        "spine": -0.288,
        "head": -1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Narrow bone-armored running plate with small foreclaws; its painted gait pose is not a complete walk.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-blue-violet-biped",
    "fighterId": "user-blue-violet-biped",
    "profileId": "pose-v95-user-bipede-bleu-violet",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-12-bipede-bleu-violet.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "efbc42d94b00a53caa703d507a9be0dd5c3dfd895bfa49ea17fc74ea75e4e139",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          567,
          656
        ],
        "tip": [
          567,
          670
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          567,
          656
        ],
        "tip": [
          424,
          401
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          266,
          278
        ],
        "tip": [
          170,
          239
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          444,
          1115
        ],
        "tip": [
          444,
          1129
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          652,
          1127
        ],
        "tip": [
          652,
          1141
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          147,
          421
        ],
        "tip": [
          147,
          435
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          301,
          602
        ],
        "tip": [
          301,
          616
        ]
      }
    ],
    "pinned": [
      0,
      960,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          424,
          401
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          170,
          239
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          147,
          421
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          301,
          602
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          444,
          1115
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          652,
          1127
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "3022ce4e743ff847ffdc7ffc16fff97fffefffffcffffffffefdffffdfff3beffcbffe87ffe8dffe07bff07ffc4fff88c0c2"
    },
    "poses": {
      "intro": {
        "spine": 0.224,
        "head": -1.08
      },
      "restraint": {
        "spine": -0.24,
        "head": 0.72
      },
      "struggle": {
        "spine": -0.32,
        "head": 1.26
      },
      "release": {
        "spine": 0.128,
        "head": -0.45
      },
      "round-win": {
        "spine": 0.176,
        "head": 0.9
      },
      "round-loss": {
        "spine": -0.288,
        "head": -1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Blue-violet upright source with a high dome and two distinctly lifted hands.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-skeletal-quadruped",
    "fighterId": "user-skeletal-quadruped",
    "profileId": "pose-v95-user-quadrupede-squelettique",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-13-quadrupede-squelettique.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "4b5c491f2f79836763ca68b7e0e0c43788b1c08c3b371274126c669d1f12985b",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          567,
          710
        ],
        "tip": [
          567,
          724
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          567,
          710
        ],
        "tip": [
          363,
          679
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          220,
          602
        ],
        "tip": [
          147,
          602
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          502,
          822
        ],
        "tip": [
          502,
          836
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          668,
          814
        ],
        "tip": [
          668,
          828
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          158,
          830
        ],
        "tip": [
          158,
          843
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          324,
          822
        ],
        "tip": [
          324,
          836
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          363,
          679
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          147,
          602
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          158,
          830
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          324,
          822
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          502,
          822
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          668,
          814
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "00200000000810004008000000000211400078007fc007fe007ffbe9fff63ffe87dff8000420100000000000000042000000"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.78
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.52
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.91
      },
      "release": {
        "spine": 0.096,
        "head": -0.325
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.65
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Small skeletal quadruped keeps its thin limbs at the measured source supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-red-horned",
    "fighterId": "user-red-horned",
    "profileId": "pose-v95-user-quadrupede-rouge-corne",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-17-quadrupede-rouge-corne.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "394ababca00c4eb2b14a42e886601b35890d04042aa386fb068938321bc1a03c",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          666,
          744
        ],
        "tip": [
          660,
          756
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          666,
          744
        ],
        "tip": [
          486,
          617
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          309,
          532
        ],
        "tip": [
          212,
          548
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          590,
          953
        ],
        "tip": [
          590,
          967
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          826,
          976
        ],
        "tip": [
          826,
          990
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          350,
          985
        ],
        "tip": [
          350,
          999
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          390,
          979
        ],
        "tip": [
          390,
          993
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          486,
          617
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          212,
          548
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          350,
          985
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          390,
          979
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          590,
          953
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          826,
          976
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "2c30840140091040b00007f806ff387ffb8ffffe7ff3f7ffce67ff607fee0fffe1f7fcbbff73ffe400e7001c504447000008"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.78
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.52
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.91
      },
      "release": {
        "spine": 0.096,
        "head": -0.325
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.65
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Red horned quadruped has a low head, separated forefeet and raised tail.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-cryo-runner",
    "fighterId": "cryo-runner",
    "profileId": "enemy-214-cryo-adapted-runner",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-214-cryo-adapted-runner.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "a1b567c20db6f19cdfa7eda91074359debeaf2cb9647868e0dbc4b5813953783",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          652,
          551
        ],
        "tip": [
          652,
          565
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          652,
          551
        ],
        "tip": [
          1009,
          556
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1108,
          444
        ],
        "tip": [
          1312,
          502
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          390,
          837
        ],
        "tip": [
          390,
          851
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          756,
          829
        ],
        "tip": [
          758,
          840
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1204,
          829
        ],
        "tip": [
          1204,
          843
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1391,
          817
        ],
        "tip": [
          1391,
          831
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1009,
          556
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1312,
          502
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1204,
          829
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1391,
          817
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          390,
          837
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          756,
          829
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0048080000801f0a003f11987587fb607fff7ffffe7ffffefffffe9ffff307fbf30ef5fa0f7bfe6fffff07e8790b68f0"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Cryogenic runner source has four original low supports and a looping tail without a dedicated tail clip.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-cryo-crusher",
    "fighterId": "cryo-crusher",
    "profileId": "enemy-217-cryo-adapted-crusher",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-217-cryo-adapted-crusher.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "bbe2c3b2729b6ac2f63acb3429d3bdd1ecf25ca21048e4a5bda004bd0798d759",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          751,
          614
        ],
        "tip": [
          751,
          628
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          751,
          614
        ],
        "tip": [
          1108,
          547
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1258,
          456
        ],
        "tip": [
          1395,
          539
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          565,
          846
        ],
        "tip": [
          565,
          860
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          851,
          846
        ],
        "tip": [
          851,
          860
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1129,
          854
        ],
        "tip": [
          1129,
          868
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1316,
          850
        ],
        "tip": [
          1316,
          864
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1108,
          547
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1395,
          539
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1129,
          854
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1316,
          850
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          565,
          846
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          851,
          846
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "08080c0000000003e00003f80007fe00bffe00ffff03ffff77ffffefffeffffff6fffff679fffc59fffc75a1ec030fc2"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Cold armored crest above four broad measured supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-cryo-lurker",
    "fighterId": "cryo-lurker",
    "profileId": "enemy-219-cryo-adapted-lurker",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-219-cryo-adapted-lurker.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "4a3714d06bb14cd3f37955a13c77d65804b415a26f1b29d11475217f6db2d4a4",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          677,
          651
        ],
        "tip": [
          677,
          665
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          677,
          651
        ],
        "tip": [
          988,
          605
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1117,
          527
        ],
        "tip": [
          1270,
          572
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          482,
          800
        ],
        "tip": [
          482,
          814
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          716,
          763
        ],
        "tip": [
          709,
          771
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1088,
          800
        ],
        "tip": [
          1088,
          814
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1399,
          796
        ],
        "tip": [
          1399,
          810
        ]
      }
    ],
    "pinned": [
      0,
      576,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          988,
          605
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1270,
          572
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1088,
          800
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1399,
          796
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          482,
          800
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          716,
          763
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "080708001200003060004f90019fb002bfec2c7ff81ffff97fffff75ffff7bfffe7ffffefffffef3dffe3fe7ff018bc0"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Purple low lurker source retains its long reaching foreclaws.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-cryo-ravager",
    "fighterId": "cryo-ravager",
    "profileId": "enemy-221-cryo-adapted-ravager",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-221-cryo-adapted-ravager.png",
    "sourceFacing": 1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "9297e52b7e3fbe5956b6cfdaef527ec3919dc9cecab7f3f57a1e767cdde1eb76",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          671,
          683
        ],
        "tip": [
          671,
          697
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          671,
          683
        ],
        "tip": [
          842,
          525
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          926,
          413
        ],
        "tip": [
          1007,
          355
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          637,
          1073
        ],
        "tip": [
          637,
          1087
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          957,
          1077
        ],
        "tip": [
          957,
          1091
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          848,
          840
        ],
        "tip": [
          848,
          854
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1154,
          779
        ],
        "tip": [
          1154,
          793
        ]
      }
    ],
    "pinned": [
      0,
      896,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          842,
          525
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1007,
          355
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          848,
          840
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1154,
          779
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          637,
          1073
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          957,
          1077
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "0022000008087f4007f8007fa407f8107f820ffc007f804ffc0cffe04ffeb1ffe7bffeefffaffffe7ef78eaf7840ce800030"
    },
    "poses": {
      "intro": {
        "spine": -0.14,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.15,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.2,
        "head": -0.91
      },
      "release": {
        "spine": -0.08,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.11,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.18,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "blade-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Cold red ravager source with long low blades and separate hind toes.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-cryo-boiler",
    "fighterId": "cryo-boiler",
    "profileId": "enemy-222-cryo-adapted-boiler",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-222-cryo-adapted-boiler.png",
    "sourceFacing": 1,
    "sourceWidth": 1238,
    "sourceHeight": 1271,
    "sourceSha256": "0a37f495ed857beb16725b229a4fbdbe1b918b819fd56f348ec353a385fa6225",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          746,
          645
        ],
        "tip": [
          746,
          659
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          746,
          645
        ],
        "tip": [
          914,
          450
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1011,
          305
        ],
        "tip": [
          1117,
          297
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          543,
          1165
        ],
        "tip": [
          543,
          1179
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1000,
          1161
        ],
        "tip": [
          1000,
          1175
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          929,
          731
        ],
        "tip": [
          929,
          745
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1137,
          753
        ],
        "tip": [
          1137,
          767
        ]
      }
    ],
    "pinned": [
      0,
      1024,
      1238,
      1271
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          914,
          450
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1117,
          297
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          929,
          731
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1137,
          753
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          543,
          1165
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1000,
          1161
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "24182144fed33ff9bbff0e7fec37fe10ffe09ffc037fc01ffe57ffefdffeffffef7ffeffffeffffeffffe7fffeffffc8c886"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Pale sac-covered biped bends from its own narrow hip/neck placement.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 5.3999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-cryo-burster",
    "fighterId": "cryo-burster",
    "profileId": "enemy-224-cryo-adapted-burster",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-224-cryo-adapted-burster.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "ede720f5aa9f1c5b800d825e5bd65092fb5b16f4810fb814a30d5c348476dd32",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          560,
          580
        ],
        "tip": [
          560,
          594
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          560,
          580
        ],
        "tip": [
          1000,
          572
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1158,
          493
        ],
        "tip": [
          1324,
          543
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          345,
          866
        ],
        "tip": [
          345,
          880
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          726,
          866
        ],
        "tip": [
          726,
          880
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1034,
          900
        ],
        "tip": [
          1034,
          914
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1233,
          850
        ],
        "tip": [
          1233,
          864
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1000,
          572
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1324,
          543
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1034,
          900
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1233,
          850
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          345,
          866
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          726,
          866
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "49680c9fce03fffc6d7e6c9e7619ff67f3fffffffeffffffffffffdffffe6fffe73fffff1cfff37efff84ffffe41fee4"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Cold sac-bearing runner keeps four distinct visible supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-cryo-monica",
    "fighterId": "cryo-monica",
    "profileId": "enemy-225-cryo-adapted-monica-line",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-225-cryo-adapted-monica-line.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "10e4a825fe25a868443a4dcc0485b446287cf54f15f084735d3e678037703f6d",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          988,
          609
        ],
        "tip": [
          989,
          620
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          988,
          609
        ],
        "tip": [
          1100,
          477
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1200,
          357
        ],
        "tip": [
          1287,
          369
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          789,
          916
        ],
        "tip": [
          789,
          930
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1167,
          904
        ],
        "tip": [
          1167,
          918
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1154,
          609
        ],
        "tip": [
          1154,
          623
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1291,
          634
        ],
        "tip": [
          1291,
          648
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1100,
          477
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1287,
          369
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1154,
          609
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1291,
          634
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          789,
          916
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1167,
          904
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0800000002e70007f4000ff8001ff8002ff8040ff8001ff0201ff0401ff841bff8087ff80ffcc0dffae473ddfc336998"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Compact Monica source has short hanging forearms beneath a forward dome.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-cryo-ripper",
    "fighterId": "cryo-ripper",
    "profileId": "enemy-231-cryo-adapted-atarax-ripper",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-231-cryo-adapted-atarax-ripper.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "d4b0299a85bc3831ba5a231e4f2fb99b870d4092f99f0b2f8aab72545b61e368",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          785,
          688
        ],
        "tip": [
          785,
          702
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          785,
          688
        ],
        "tip": [
          1065,
          491
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1225,
          383
        ],
        "tip": [
          1358,
          364
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          606,
          920
        ],
        "tip": [
          606,
          934
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1050,
          916
        ],
        "tip": [
          1050,
          930
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1059,
          742
        ],
        "tip": [
          1059,
          756
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1397,
          767
        ],
        "tip": [
          1397,
          781
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1065,
          491
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1358,
          364
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1059,
          742
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1397,
          767
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          606,
          920
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1050,
          916
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "004a0c0003f00037fe101ffc353ffc07fffc3cbffc797ff275fffbf3ffff7ffffe7ffffe1fffce63e7f934fdee0007c0"
    },
    "poses": {
      "intro": {
        "spine": -0.161,
        "head": 0.84
      },
      "restraint": {
        "spine": 0.1725,
        "head": -0.56
      },
      "struggle": {
        "spine": 0.23,
        "head": -0.98
      },
      "release": {
        "spine": -0.092,
        "head": 0.35
      },
      "round-win": {
        "spine": -0.1265,
        "head": -0.7
      },
      "round-loss": {
        "spine": 0.207,
        "head": 0.805
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Layered cold armor has a high spine, heavy skull and low foreclaws.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.14,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-cryo-ripper-queen",
    "fighterId": "cryo-ripper-queen",
    "profileId": "enemy-232-cryo-adapted-ripper-queen",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-232-cryo-adapted-ripper-queen.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "95484d0e0d42bfbe59514410707ef01ca2b95f7055d95ae6cf1a3c913b4b3379",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          863,
          653
        ],
        "tip": [
          868,
          656
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          863,
          653
        ],
        "tip": [
          1125,
          493
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1192,
          366
        ],
        "tip": [
          1312,
          348
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          515,
          937
        ],
        "tip": [
          515,
          951
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1075,
          933
        ],
        "tip": [
          1075,
          947
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1114,
          856
        ],
        "tip": [
          1118,
          867
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1411,
          726
        ],
        "tip": [
          1411,
          740
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1125,
          493
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1312,
          348
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1114,
          856
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1411,
          726
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          515,
          937
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1075,
          933
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0863ec100ffd1c0ffe7d3ffc717ffc1c7ffcbefffc77fff87ffffb7fffff7fffeefffbff3fffff0fe7f77bedff5be9f7"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Cold ripper queen crown and asymmetrical arms retain their native silhouette.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-cryo-foundry-crusher",
    "fighterId": "cryo-foundry-crusher",
    "profileId": "enemy-234-cryo-adapted-foundry-crusher",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-234-cryo-adapted-foundry-crusher.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "5bd7c1ef40fc37e3a9f5d6ab9153307bd1c443e811ac01b9448ba6e6da3ac85d",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          747,
          609
        ],
        "tip": [
          747,
          623
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          747,
          609
        ],
        "tip": [
          1146,
          564
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1341,
          502
        ],
        "tip": [
          1420,
          605
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          623,
          842
        ],
        "tip": [
          623,
          856
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          934,
          821
        ],
        "tip": [
          934,
          835
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1233,
          854
        ],
        "tip": [
          1233,
          868
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1382,
          837
        ],
        "tip": [
          1382,
          851
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1146,
          564
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1420,
          605
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1233,
          854
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1382,
          837
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          623,
          842
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          934,
          821
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0828000000f00410f810007c8001fe001ffe0c7fff01ffff1fffff7fffffffffff7cfffef8effe54f7fe64fcfc003fe0"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Cold foundry shell uses its own forward skull and four broad feet.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-cryo-reef-stalker",
    "fighterId": "cryo-reef-stalker",
    "profileId": "enemy-235-cryo-adapted-reef-stalker",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-235-cryo-adapted-reef-stalker.png",
    "sourceFacing": 1,
    "sourceWidth": 1774,
    "sourceHeight": 887,
    "sourceSha256": "5efad3c87c62cfa63723592b0641dca88dc37cdae402d025ae1db0932f4379aa",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          1007,
          604
        ],
        "tip": [
          1007,
          618
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          1007,
          604
        ],
        "tip": [
          1400,
          499
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1522,
          423
        ],
        "tip": [
          1592,
          412
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          762,
          738
        ],
        "tip": [
          762,
          752
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1133,
          730
        ],
        "tip": [
          1133,
          744
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1462,
          724
        ],
        "tip": [
          1469,
          735
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1654,
          719
        ],
        "tip": [
          1654,
          733
        ]
      }
    ],
    "pinned": [
      0,
      576,
      1774,
      887
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1400,
          499
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1592,
          412
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1462,
          724
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1654,
          719
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          762,
          738
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1133,
          730
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 28,
      "rows": 14,
      "mask": "0080160000106c00002280001ff20003ffc0841ffc103fffc5ebffee65ffff9ffffffebfbffff3e7fefe101fffa003e75f"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Long low reef-stalker plate has a raised tail and narrow claw supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-cryo-pale-hunter",
    "fighterId": "cryo-pale-hunter",
    "profileId": "enemy-238-cryo-adapted-pale-crucible-hunter",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-238-cryo-adapted-pale-crucible-hunter.png",
    "sourceFacing": 1,
    "sourceWidth": 1774,
    "sourceHeight": 887,
    "sourceSha256": "22eeeea6ea215e55ba585442b1e82ea09596f8bc12bf1d1fd4f2c0513bfd1d60",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          911,
          566
        ],
        "tip": [
          911,
          580
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          911,
          566
        ],
        "tip": [
          1227,
          527
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1432,
          385
        ],
        "tip": [
          1472,
          412
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          662,
          734
        ],
        "tip": [
          662,
          748
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1064,
          719
        ],
        "tip": [
          1064,
          733
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1333,
          695
        ],
        "tip": [
          1335,
          709
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1591,
          697
        ],
        "tip": [
          1597,
          701
        ]
      }
    ],
    "pinned": [
      0,
      512,
      1774,
      887
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1227,
          527
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1472,
          412
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1333,
          695
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1591,
          697
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          662,
          734
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1064,
          719
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 28,
      "rows": 14,
      "mask": "208200000000d400067e00200ffc40d3ff868efff870ffff83cffff81fffff427bfffc09ffdfc03f9efc01f8ee40100081"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Pale hunter source has a horizontal ribcage and long low forelimbs.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-cryo-dust-runner",
    "fighterId": "cryo-dust-runner",
    "profileId": "enemy-239-cryo-adapted-dust-runner",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-239-cryo-adapted-dust-runner.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "019f943dad00f41b01d25d5fa1371f75cd204d2294cd2950d7fd8fced10603ea",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          681,
          568
        ],
        "tip": [
          681,
          582
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          681,
          568
        ],
        "tip": [
          1088,
          568
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1187,
          448
        ],
        "tip": [
          1337,
          489
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          378,
          829
        ],
        "tip": [
          378,
          843
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          839,
          833
        ],
        "tip": [
          839,
          847
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1229,
          846
        ],
        "tip": [
          1229,
          860
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1415,
          791
        ],
        "tip": [
          1415,
          805
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1088,
          568
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1337,
          489
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1229,
          846
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1415,
          791
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          378,
          829
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          839,
          833
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "10080c1e00007f920873a0fef5f9f9fe7ffefc7ffe71fffe7ffffe9fffed53ffff0fbdfe2e3ffe0f6fff07f1fc0019f1"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Cold dust-runner has individually located foreclaws and a wide hind stance.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-cryo-salvage-brute",
    "fighterId": "cryo-salvage-brute",
    "profileId": "enemy-240-cryo-adapted-salvage-hive-brute",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-240-cryo-adapted-salvage-hive-brute.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "43940d2a2d6f112a34c894a8a58b78b72350f19789bdc802e3b81dc80e716385",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          863,
          572
        ],
        "tip": [
          863,
          586
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          863,
          572
        ],
        "tip": [
          1121,
          377
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1208,
          294
        ],
        "tip": [
          1291,
          315
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          722,
          858
        ],
        "tip": [
          722,
          872
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1042,
          837
        ],
        "tip": [
          1042,
          851
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1250,
          755
        ],
        "tip": [
          1250,
          769
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1357,
          771
        ],
        "tip": [
          1357,
          785
        ]
      }
    ],
    "pinned": [
      0,
      576,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1121,
          377
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1291,
          315
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1250,
          755
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1357,
          771
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          722,
          858
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1042,
          837
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "086004100616000ff6103ffe103ffc003ffc043ffc023fe8207ff340fff801fff80bfffd7fbffc7ffbfc73fc7c2e2bfc"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Massive salvage brute leans onto broad low forelimb supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-cryo-caravan-stalker",
    "fighterId": "cryo-caravan-stalker",
    "profileId": "enemy-242-cryo-adapted-caravan-stalker",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-242-cryo-adapted-caravan-stalker.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "f5a963f52a2a66929c3aad9d5ad3b2c97d3b8e927a604302bd30820db1372018",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          764,
          556
        ],
        "tip": [
          764,
          570
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          764,
          556
        ],
        "tip": [
          1179,
          481
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1337,
          427
        ],
        "tip": [
          1387,
          419
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          552,
          834
        ],
        "tip": [
          552,
          848
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          926,
          829
        ],
        "tip": [
          926,
          843
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1162,
          834
        ],
        "tip": [
          1162,
          848
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1378,
          833
        ],
        "tip": [
          1378,
          847
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1179,
          481
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1387,
          419
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1162,
          834
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1378,
          833
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          552,
          834
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          926,
          829
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "080a0c140f800010004003f80003fe00bffe02ffff05fffe0ffff277bfb0fefff8fdfcff7dbfffbfdffe7139f8034fce"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Cold caravan stalker stands on four long narrow painted feet.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-cryo-joe",
    "fighterId": "cryo-joe",
    "profileId": "enemy-249-cryo-adapted-working-joe",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-249-cryo-adapted-working-joe.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "5c10ab69761beab48a83e4b3d7664df6b46dbfc389f3a7f3764e35a89a39459b",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          524,
          704
        ],
        "tip": [
          524,
          718
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          524,
          704
        ],
        "tip": [
          472,
          444
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          524,
          336
        ],
        "tip": [
          552,
          203
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          439,
          1413
        ],
        "tip": [
          439,
          1427
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          675,
          1399
        ],
        "tip": [
          675,
          1413
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          425,
          846
        ],
        "tip": [
          425,
          860
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          680,
          837
        ],
        "tip": [
          680,
          851
        ]
      }
    ],
    "pinned": [
      0,
      1216,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          472,
          444
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          552,
          203
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          425,
          846
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          680,
          837
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          439,
          1413
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          675,
          1399
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "0c010dd213c003e243c407c007e107e207e007e007e087f807f217f107f007e307e207e207e00fe207e80ff84ff80310"
    },
    "poses": {
      "intro": {
        "spine": -0.182,
        "head": 0.9
      },
      "restraint": {
        "spine": 0.195,
        "head": -0.6
      },
      "struggle": {
        "spine": 0.26,
        "head": -1.05
      },
      "release": {
        "spine": -0.104,
        "head": 0.375
      },
      "round-win": {
        "spine": -0.143,
        "head": -0.75
      },
      "round-loss": {
        "spine": 0.234,
        "head": 0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Cold uniformed Joe has two visible hanging hands and measured boot supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-cryo-combat-synth",
    "fighterId": "cryo-combat-synth",
    "profileId": "enemy-250-cryo-adapted-combat-synthetic",
    "path": "/assets/openai/sprites/static-enemy-v99/enemy-250-cryo-adapted-combat-synthetic.png",
    "sourceFacing": 1,
    "sourceWidth": 1206,
    "sourceHeight": 1305,
    "sourceSha256": "34a35e940934ba67db9498033a8688333f70dc8916ec2057fb4941e46f15d5f3",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          599,
          679
        ],
        "tip": [
          599,
          693
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          599,
          679
        ],
        "tip": [
          623,
          410
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          683,
          245
        ],
        "tip": [
          703,
          137
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          370,
          1160
        ],
        "tip": [
          370,
          1174
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          880,
          1148
        ],
        "tip": [
          880,
          1162
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          744,
          530
        ],
        "tip": [
          744,
          544
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          820,
          538
        ],
        "tip": [
          820,
          552
        ]
      }
    ],
    "pinned": [
      0,
      960,
      1206,
      1305
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          623,
          410
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          703,
          137
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          744,
          530
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          820,
          538
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          370,
          1160
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          880,
          1148
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 19,
      "rows": 21,
      "mask": "400c485f1007e001fcc03f0007e001fe041fe003ff027fe01ff821fc007f800ff913ff447be01e1c07cbf07d7e47be000600"
    },
    "poses": {
      "intro": {
        "spine": -0.112,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.12,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.16,
        "head": -0.7
      },
      "release": {
        "spine": -0.064,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.088,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.144,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "robot-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Cold combat synthetic keeps its rifle and grips within one measured carried region.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.0
    },
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            599,
            406
          ],
          [
            969,
            546
          ],
          [
            969,
            671
          ],
          [
            643,
            606
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-armored-foundry-crusher",
    "fighterId": "armored-foundry-crusher",
    "profileId": "enemy-130-armored-foundry-crusher",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-130-armored-foundry-crusher.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "a33dd70e916f6623ebfb07195c54633d264ed8728ef98af310cdba016b0053ce",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          726,
          643
        ],
        "tip": [
          726,
          657
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          726,
          643
        ],
        "tip": [
          1142,
          564
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1316,
          493
        ],
        "tip": [
          1395,
          572
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          598,
          825
        ],
        "tip": [
          598,
          839
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          922,
          817
        ],
        "tip": [
          922,
          831
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1191,
          817
        ],
        "tip": [
          1191,
          831
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1337,
          821
        ],
        "tip": [
          1337,
          835
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1142,
          564
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1395,
          572
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1191,
          817
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1337,
          821
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          598,
          825
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          922,
          817
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "00080c0000000002e00034f80003fe003ffc08fffe01fffe1ffffe3ffffe7ffffe35fffc01effc00e77c24cd4000da7c"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Bronze armored foundry shell on four short native claws.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-armored-reef-stalker",
    "fighterId": "armored-reef-stalker",
    "profileId": "enemy-131-armored-reef-stalker",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-131-armored-reef-stalker.png",
    "sourceFacing": 1,
    "sourceWidth": 1619,
    "sourceHeight": 971,
    "sourceSha256": "31d50e6f4080060e685339cbd9b74ecf7de8f27a44603ad258e287a61736e5f8",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          897,
          660
        ],
        "tip": [
          895,
          664
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          897,
          660
        ],
        "tip": [
          1212,
          534
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1370,
          437
        ],
        "tip": [
          1418,
          424
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          648,
          792
        ],
        "tip": [
          648,
          806
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1055,
          792
        ],
        "tip": [
          1059,
          798
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1344,
          779
        ],
        "tip": [
          1344,
          793
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1483,
          752
        ],
        "tip": [
          1483,
          766
        ]
      }
    ],
    "pinned": [
      0,
      576,
      1619,
      971
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1212,
          534
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1418,
          424
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1344,
          779
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1483,
          752
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          648,
          792
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1055,
          792
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 26,
      "rows": 16,
      "mask": "0000e00000fc00001df0000b86000ffd8009ffe201fff3e1fffc7cfffbbeffffaffffffb7fbfff7effff971fffc00f1f78000000"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Armored dark reef stalker has a low horizontal body and four thin supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-armored-pale-hunter",
    "fighterId": "armored-pale-hunter",
    "profileId": "enemy-134-armored-pale-crucible-hunter",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-134-armored-pale-crucible-hunter.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "ddda607d63df47f58bd1b3b960525386ff1d7357bdc1256269b438577ea22193",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          772,
          619
        ],
        "tip": [
          772,
          633
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          772,
          619
        ],
        "tip": [
          1058,
          568
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1262,
          452
        ],
        "tip": [
          1349,
          444
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          615,
          817
        ],
        "tip": [
          615,
          831
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1030,
          813
        ],
        "tip": [
          1030,
          827
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1179,
          783
        ],
        "tip": [
          1184,
          793
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1399,
          763
        ],
        "tip": [
          1399,
          777
        ]
      }
    ],
    "pinned": [
      0,
      576,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1058,
          568
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1349,
          444
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1179,
          783
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1399,
          763
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          615,
          817
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1030,
          813
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "00080c0000020000200013f42013fac2affeca3ffc61fffc75fffc3ffffadf7ffed2fffe01f3fe0ff7ff25452f014bf8"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Pale armored hunter is kept at its native measured body/foot scale.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-armored-dust-runner",
    "fighterId": "armored-dust-runner",
    "profileId": "enemy-135-armored-dust-runner",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-135-armored-dust-runner.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "3ff7a1cf80c4f9ee0a2cf9823a30c804981f08c2a599b86bcd511e268415e2ce",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          780,
          560
        ],
        "tip": [
          780,
          574
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          780,
          560
        ],
        "tip": [
          1096,
          560
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1160,
          472
        ],
        "tip": [
          1254,
          477
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          469,
          817
        ],
        "tip": [
          469,
          831
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          826,
          808
        ],
        "tip": [
          826,
          822
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1154,
          808
        ],
        "tip": [
          1154,
          822
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1382,
          800
        ],
        "tip": [
          1382,
          814
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1096,
          560
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1254,
          477
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1154,
          808
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1382,
          800
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          469,
          817
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          826,
          808
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0008002000000100403e00807f3c0061b1e8601ff8707ff8fffff9fffff843ffe723fffb173dfe57bc7f00637802d884"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Armored dust runner has a high rear pelvis and low reaching foreclaws.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-armored-salvage-brute",
    "fighterId": "armored-salvage-brute",
    "profileId": "enemy-136-armored-salvage-hive-brute",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-136-armored-salvage-hive-brute.png",
    "sourceFacing": 1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "243fa8b3fd29998168aca340e0cf9ad58b222b0e1765d7b14c5925d44623f4f3",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          683,
          718
        ],
        "tip": [
          683,
          732
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          683,
          718
        ],
        "tip": [
          914,
          529
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1011,
          436
        ],
        "tip": [
          1073,
          494
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          505,
          953
        ],
        "tip": [
          505,
          967
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          618,
          875
        ],
        "tip": [
          612,
          878
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1017,
          930
        ],
        "tip": [
          1015,
          942
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1154,
          938
        ],
        "tip": [
          1154,
          952
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          914,
          529
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1073,
          494
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1017,
          930
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1154,
          938
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          505,
          953
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          618,
          875
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "0020c000004000000014007c0407f110ffd65ffc02ffc01ffc03ffb07ffc0fffc1fffeffffeffffed029b85f7a4142000002"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Gold-black salvage brute has broad forepaws and uneven native rear support heights.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-armored-caravan-stalker",
    "fighterId": "armored-caravan-stalker",
    "profileId": "enemy-138-armored-caravan-stalker",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-138-armored-caravan-stalker.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "c244d655a9af48f5de1273d147edcf2b44417a312bd04322340bb70fdc055c28",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          810,
          618
        ],
        "tip": [
          810,
          632
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          810,
          618
        ],
        "tip": [
          1142,
          576
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1245,
          419
        ],
        "tip": [
          1312,
          514
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          602,
          796
        ],
        "tip": [
          602,
          810
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          863,
          800
        ],
        "tip": [
          863,
          814
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1071,
          804
        ],
        "tip": [
          1071,
          818
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1299,
          813
        ],
        "tip": [
          1299,
          827
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1142,
          576
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1312,
          514
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1071,
          804
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1299,
          813
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          602,
          796
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          863,
          800
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "08080c0002010012500000940017f30027fb043ffc00fffc1dfffd13fff2effff47effb606efdc6ef7fc347d90006bd8"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Armored caravan source retains the individual dorsal tubes and low body stance.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-acid-queen",
    "fighterId": "acid-queen",
    "profileId": "enemy-164-acid-blooded-queen",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-164-acid-blooded-queen.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "58149a549c93dcb5e08810acacc6db11812a0449629c8319fbedbe81b5e339b5",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          959,
          663
        ],
        "tip": [
          959,
          677
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          959,
          663
        ],
        "tip": [
          1075,
          493
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1258,
          336
        ],
        "tip": [
          1345,
          315
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          760,
          941
        ],
        "tip": [
          760,
          955
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1175,
          937
        ],
        "tip": [
          1175,
          951
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1180,
          647
        ],
        "tip": [
          1180,
          661
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1278,
          539
        ],
        "tip": [
          1278,
          553
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1075,
          493
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1345,
          315
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1180,
          647
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1278,
          539
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          760,
          941
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1175,
          937
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "087f8c105fec003ff70017fd0017fe0083fe0427fe000ff8934ffa401ff85cbff87ffff667fd90dc3fdce3f9f0413af0"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Acid queen has its own large crown, small front arms and separate toes.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-acid-crusher",
    "fighterId": "acid-crusher",
    "profileId": "enemy-165-acid-blooded-crusher",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-165-acid-blooded-crusher.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "9f61341d13979b151920acec31fa253dfc4a4a6c6f715195c19c3856af285ba3",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          648,
          667
        ],
        "tip": [
          648,
          681
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          648,
          667
        ],
        "tip": [
          1071,
          543
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1220,
          427
        ],
        "tip": [
          1366,
          572
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          523,
          854
        ],
        "tip": [
          523,
          868
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          810,
          850
        ],
        "tip": [
          810,
          864
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1142,
          858
        ],
        "tip": [
          1142,
          872
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1357,
          842
        ],
        "tip": [
          1357,
          856
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1071,
          543
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1366,
          572
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1142,
          858
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1357,
          842
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          523,
          854
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          810,
          850
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0004280000080017e40007f9020ffc38fffe2bffff3fffff7fffff7ffffe7ffffe7ffbfa3bbdfe3ffffe31c1f7002e41"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Acid crusher crest and heavily armored ribs remain above four broad supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-acid-burster",
    "fighterId": "acid-burster",
    "profileId": "enemy-172-acid-blooded-burster",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-172-acid-blooded-burster.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "418d66579148161b258054357fa7a80eeff7505924a1cc1f2ae7c839c5091766",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          552,
          568
        ],
        "tip": [
          552,
          582
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          552,
          568
        ],
        "tip": [
          1005,
          539
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1150,
          452
        ],
        "tip": [
          1308,
          481
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          336,
          891
        ],
        "tip": [
          336,
          905
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          696,
          855
        ],
        "tip": [
          696,
          869
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1082,
          885
        ],
        "tip": [
          1082,
          899
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1260,
          859
        ],
        "tip": [
          1260,
          873
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1005,
          539
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1308,
          481
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1082,
          885
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1260,
          859
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          336,
          891
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          696,
          855
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "01080c1fc6033fd5ef7e1f167c0fff72fffe77ffffffffffbffffef9ffee07fff36ffffe2efff64efff97ffffe18f9dc"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Acid burster has four measured supports and a high curled tail with no independent clip.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-acid-k-series",
    "fighterId": "acid-k-series",
    "profileId": "enemy-176-acid-blooded-k-series-yellow-xenomorph",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-176-acid-blooded-k-series-yellow-xenomorph.png",
    "sourceFacing": 1,
    "sourceWidth": 1236,
    "sourceHeight": 1273,
    "sourceSha256": "d202d52dc2e63f69e03c44e9fb09a8fe1910a6fd73a4763a77c2b0bb37a37b96",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          669,
          811
        ],
        "tip": [
          669,
          825
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          669,
          811
        ],
        "tip": [
          759,
          466
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          857,
          349
        ],
        "tip": [
          935,
          341
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          528,
          1144
        ],
        "tip": [
          528,
          1158
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          868,
          1124
        ],
        "tip": [
          868,
          1138
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          864,
          721
        ],
        "tip": [
          864,
          735
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1055,
          689
        ],
        "tip": [
          1055,
          703
        ]
      }
    ],
    "pinned": [
      0,
      960,
      1236,
      1273
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          759,
          466
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          935,
          341
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          864,
          721
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1055,
          689
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          528,
          1144
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          868,
          1124
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "8a3e69fff8fbffc1fff21fff23fff81fffa3ffff37ff57dffefdffefbffe7fff53ffec8fffecffe887ff00fff48bdf080142"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Golden acid K-series crown uses the native narrow waist and long shin placement.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.2
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-acid-ripper",
    "fighterId": "acid-ripper",
    "profileId": "enemy-179-acid-blooded-atarax-ripper",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-179-acid-blooded-atarax-ripper.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "aae93df2812ad6228d33dc9252fb21432d1bd5d111fdd51d1db03cf7b7372a6c",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          818,
          676
        ],
        "tip": [
          818,
          690
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          818,
          676
        ],
        "tip": [
          1030,
          464
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1129,
          365
        ],
        "tip": [
          1233,
          344
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          619,
          954
        ],
        "tip": [
          624,
          963
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1013,
          953
        ],
        "tip": [
          1018,
          954
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1042,
          771
        ],
        "tip": [
          1042,
          785
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1312,
          807
        ],
        "tip": [
          1312,
          808
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1030,
          464
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1233,
          344
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1042,
          771
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1312,
          807
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          619,
          954
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1013,
          953
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0868000010131023f4004ff8011ff8881ff8003ff8583ff8387ff93afff37ffff81ffffc1fff9c01df9431d3dc01cbc0"
    },
    "poses": {
      "intro": {
        "spine": -0.161,
        "head": 0.84
      },
      "restraint": {
        "spine": 0.1725,
        "head": -0.56
      },
      "struggle": {
        "spine": 0.23,
        "head": -0.98
      },
      "release": {
        "spine": -0.092,
        "head": 0.35
      },
      "round-win": {
        "spine": -0.1265,
        "head": -0.7
      },
      "round-loss": {
        "spine": 0.207,
        "head": 0.805
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Acid ripper has broad layered armor and individually placed low claws.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.14,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-acid-ripper-queen",
    "fighterId": "acid-ripper-queen",
    "profileId": "enemy-180-acid-blooded-ripper-queen",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-180-acid-blooded-ripper-queen.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "2810b39839189f284a0def67d4f00f17b1d97eb5a1f63eb568801b429fab0ad2",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          818,
          647
        ],
        "tip": [
          820,
          656
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          818,
          647
        ],
        "tip": [
          1059,
          481
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1146,
          381
        ],
        "tip": [
          1266,
          373
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          515,
          900
        ],
        "tip": [
          515,
          914
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1079,
          908
        ],
        "tip": [
          1074,
          922
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1287,
          804
        ],
        "tip": [
          1287,
          818
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1002,
          841
        ],
        "tip": [
          1002,
          855
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1059,
          481
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1266,
          373
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1287,
          804
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1002,
          841
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          515,
          900
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1079,
          908
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "080380140ff1013fff103ff9b1fff802fff83ffff8bdfffc3bffe33fffe03ffff4bdf7fa03efbe6793fc17cbec000800"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Gold-edged ripper queen retains its raised crown and native large hands. Overlapping lower limbs are not reconstructed; support contacts refer to the visible painted claw regions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-acid-foundry-crusher",
    "fighterId": "acid-foundry-crusher",
    "profileId": "enemy-182-acid-blooded-foundry-crusher",
    "path": "/assets/openai/sprites/static-enemy-v98/enemy-182-acid-blooded-foundry-crusher.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "0d1c545f00ebeeebe0a90c0171b6f5ed40403558fcdb1783ae905f6028eff111",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          768,
          651
        ],
        "tip": [
          768,
          665
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          768,
          651
        ],
        "tip": [
          1158,
          585
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1295,
          539
        ],
        "tip": [
          1370,
          609
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          638,
          883
        ],
        "tip": [
          638,
          897
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          934,
          867
        ],
        "tip": [
          934,
          881
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1196,
          887
        ],
        "tip": [
          1196,
          901
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1374,
          875
        ],
        "tip": [
          1374,
          889
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1158,
          585
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1370,
          609
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1196,
          887
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1374,
          875
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          638,
          883
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          934,
          867
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "00290c0001ec0012f40010780401fc80bffe0e7ffe41fffe4ffffe3ffffe7ffffef9fffe9ddefc45effe25fffe001bc0"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Acid foundry shell and four broad foot regions are preserved from this exact source.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-import-joe-classic",
    "fighterId": "import-joe-classic",
    "profileId": "pose-v103-import-synth-workingjoe-classic",
    "path": "/assets/openai/sprites/static-import-v103/synth-workingjoe-classic.png",
    "sourceFacing": -1,
    "sourceWidth": 1671,
    "sourceHeight": 941,
    "sourceSha256": "c22e85f1bce901d74cd62f5616413ba0d1d365a354e3b5d601eb8d1c9a37f422",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          876,
          534
        ],
        "tip": [
          876,
          548
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          876,
          534
        ],
        "tip": [
          854,
          357
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          858,
          267
        ],
        "tip": [
          840,
          217
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          826,
          873
        ],
        "tip": [
          826,
          887
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          903,
          882
        ],
        "tip": [
          903,
          896
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          840,
          665
        ],
        "tip": [
          840,
          679
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          890,
          651
        ],
        "tip": [
          890,
          665
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1671,
      941
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          854,
          357
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          840,
          217
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          840,
          665
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          890,
          651
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          826,
          873
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          903,
          882
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 27,
      "rows": 15,
      "mask": "000e000001c0000038000007000000e020001c000003a000007000000e020001c00000380002070000006004003c0000038000"
    },
    "poses": {
      "intro": {
        "spine": 0.182,
        "head": -0.9
      },
      "restraint": {
        "spine": -0.195,
        "head": 0.6
      },
      "struggle": {
        "spine": -0.26,
        "head": 1.05
      },
      "release": {
        "spine": 0.104,
        "head": -0.375
      },
      "round-win": {
        "spine": 0.143,
        "head": 0.75
      },
      "round-loss": {
        "spine": -0.234,
        "head": -0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Small left-facing classic Joe in a wide original plate; native alpha dimensions are not replaced by human proportions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.3
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-joe-battle",
    "fighterId": "import-joe-battle",
    "profileId": "pose-v103-import-synth-workingjoe-battle",
    "path": "/assets/openai/sprites/static-import-v103/synth-workingjoe-battle.png",
    "sourceFacing": -1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "0d48c1824ae9fc62ec15fc62fa47e8ce48386c2482604e6be5af5aee8aaa53d9",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          552,
          794
        ],
        "tip": [
          552,
          808
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          552,
          794
        ],
        "tip": [
          514,
          449
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          472,
          359
        ],
        "tip": [
          467,
          250
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          444,
          1418
        ],
        "tip": [
          444,
          1432
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          566,
          1446
        ],
        "tip": [
          566,
          1460
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          387,
          907
        ],
        "tip": [
          387,
          921
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          599,
          945
        ],
        "tip": [
          599,
          959
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          514,
          449
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          467,
          250
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          387,
          907
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          599,
          945
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          444,
          1418
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          566,
          1446
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "03c003c003c023e003e007e007f007f007f007f007f007e007e207e107e003e003e213e003e003e003e067e047e009e0"
    },
    "poses": {
      "intro": {
        "spine": 0.182,
        "head": -0.9
      },
      "restraint": {
        "spine": -0.195,
        "head": 0.6
      },
      "struggle": {
        "spine": -0.26,
        "head": 1.05
      },
      "release": {
        "spine": 0.104,
        "head": -0.375
      },
      "round-win": {
        "spine": 0.143,
        "head": 0.75
      },
      "round-loss": {
        "spine": -0.234,
        "head": -0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Armored battle Joe has a separate helmet, torso and two measured low hands.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-joe-hazmat",
    "fighterId": "import-joe-hazmat",
    "profileId": "pose-v103-import-synth-workingjoe-hazmat",
    "path": "/assets/openai/sprites/static-import-v103/synth-workingjoe-hazmat.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "7aa651cff7b40f0b146a7643ec49e9b7949af276152ea8719431de3b8b2533e7",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          547,
          723
        ],
        "tip": [
          547,
          737
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          547,
          723
        ],
        "tip": [
          529,
          440
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          524,
          288
        ],
        "tip": [
          533,
          151
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          387,
          1451
        ],
        "tip": [
          387,
          1465
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          713,
          1441
        ],
        "tip": [
          713,
          1455
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          288,
          841
        ],
        "tip": [
          288,
          855
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          793,
          827
        ],
        "tip": [
          793,
          841
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          529,
          440
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          533,
          151
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          288,
          841
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          793,
          827
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          387,
          1451
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          713,
          1441
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "038107c407c003d00fe40ff01ff11ff01ff81ff81ff81ff81ffc1ffd0ffa0ff31ffb1ff51ff01f700770477446780638"
    },
    "poses": {
      "intro": {
        "spine": -0.182,
        "head": 0.9
      },
      "restraint": {
        "spine": 0.195,
        "head": -0.6
      },
      "struggle": {
        "spine": 0.26,
        "head": -1.05
      },
      "release": {
        "spine": -0.104,
        "head": 0.375
      },
      "round-win": {
        "spine": -0.143,
        "head": -0.75
      },
      "round-loss": {
        "spine": 0.234,
        "head": 0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Orange hazmat source carries a long low weapon; its measured carried region remains rigid.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "rigidZonesV163": [
      {
        "bone": "hips",
        "polygon": [
          [
            236,
            775
          ],
          [
            392,
            775
          ],
          [
            392,
            1271
          ],
          [
            217,
            1271
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-joe-tactical",
    "fighterId": "import-joe-tactical",
    "profileId": "pose-v103-import-synth-workingjoe-tactical",
    "path": "/assets/openai/sprites/static-import-v103/synth-workingjoe-tactical.png",
    "sourceFacing": -1,
    "sourceWidth": 1024,
    "sourceHeight": 1535,
    "sourceSha256": "50d2e6fecdaf64c7bdf8632431dfb0e85ccfed12b1452f5cca42fe805b85fc0c",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          519,
          708
        ],
        "tip": [
          519,
          722
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          519,
          708
        ],
        "tip": [
          472,
          406
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          495,
          269
        ],
        "tip": [
          495,
          142
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          444,
          1426
        ],
        "tip": [
          444,
          1440
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          566,
          1464
        ],
        "tip": [
          566,
          1478
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          349,
          529
        ],
        "tip": [
          349,
          543
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          321,
          628
        ],
        "tip": [
          321,
          642
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1535
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          472,
          406
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          495,
          142
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          349,
          529
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          321,
          628
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          444,
          1426
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          566,
          1464
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "07c007c007c103f007f867f807f80ff00ff00ff00ff10ff007f207f107e807e7a3c283e203e103e003fc43e047e087e8"
    },
    "poses": {
      "intro": {
        "spine": 0.182,
        "head": -0.9
      },
      "restraint": {
        "spine": -0.195,
        "head": 0.6
      },
      "struggle": {
        "spine": -0.26,
        "head": 1.05
      },
      "release": {
        "spine": 0.104,
        "head": -0.375
      },
      "round-win": {
        "spine": 0.143,
        "head": 0.75
      },
      "round-loss": {
        "spine": -0.234,
        "head": -0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Tactical Joe keeps its original front hand placement and two long boot supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-blue-drone",
    "fighterId": "import-blue-drone",
    "profileId": "pose-v103-import-xeno-blueluminescent-drone",
    "path": "/assets/openai/sprites/static-import-v103/xeno-blueluminescent-drone.png",
    "sourceFacing": -1,
    "sourceWidth": 1021,
    "sourceHeight": 1540,
    "sourceSha256": "0538301caab64c8f4269782d465d08f54d778f1718e83ac0bf06e72aa8e8f46c",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          518,
          692
        ],
        "tip": [
          518,
          706
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          518,
          692
        ],
        "tip": [
          541,
          389
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          470,
          270
        ],
        "tip": [
          356,
          237
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          394,
          1464
        ],
        "tip": [
          394,
          1478
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          760,
          1426
        ],
        "tip": [
          760,
          1440
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          309,
          853
        ],
        "tip": [
          309,
          867
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          337,
          768
        ],
        "tip": [
          337,
          782
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1021,
      1540
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          541,
          389
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          356,
          237
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          309,
          853
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          337,
          768
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          394,
          1464
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          760,
          1426
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 25,
      "mask": "07e08ff01ff43ffa3ff83ffd9bfd03fb03f323e027e02fe00ff41ff69ff11ff807fc077e237603bb939f23ff87fe1fbc0000"
    },
    "poses": {
      "intro": {
        "spine": 0.224,
        "head": -1.08
      },
      "restraint": {
        "spine": -0.24,
        "head": 0.72
      },
      "struggle": {
        "spine": -0.32,
        "head": 1.26
      },
      "release": {
        "spine": 0.128,
        "head": -0.45
      },
      "round-win": {
        "spine": 0.176,
        "head": 0.9
      },
      "round-loss": {
        "spine": -0.288,
        "head": -1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Blue luminous drone retains all original translucent halo pixels in the mesh occupancy.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 5.3999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-blue-queen",
    "fighterId": "import-blue-queen",
    "profileId": "pose-v103-import-xeno-blueluminescent-queen",
    "path": "/assets/openai/sprites/static-import-v103/xeno-blueluminescent-queen.png",
    "sourceFacing": -1,
    "sourceWidth": 1021,
    "sourceHeight": 1540,
    "sourceSha256": "68213cbc38e12efe1025ca89b3fd33f2348a82a53a37e062da651e8ba3655a69",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          496,
          707
        ],
        "tip": [
          496,
          721
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          496,
          707
        ],
        "tip": [
          589,
          441
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          461,
          321
        ],
        "tip": [
          323,
          317
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          418,
          1455
        ],
        "tip": [
          418,
          1469
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          727,
          1422
        ],
        "tip": [
          727,
          1436
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          271,
          829
        ],
        "tip": [
          271,
          843
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          294,
          673
        ],
        "tip": [
          294,
          687
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1021,
      1540
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          589,
          441
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          323,
          317
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          271,
          829
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          294,
          673
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          418,
          1455
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          727,
          1422
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 25,
      "mask": "31fc03fc0ff81ffc3ffc3ffc7ffc37f837e03ff21ff01ff09ff03ff9bff89ffc47fe67fe11ff019f0f9f07ffa7ff4ffe0000"
    },
    "poses": {
      "intro": {
        "spine": 0.126,
        "head": -0.72
      },
      "restraint": {
        "spine": -0.135,
        "head": 0.48
      },
      "struggle": {
        "spine": -0.18,
        "head": 0.84
      },
      "release": {
        "spine": 0.072,
        "head": -0.3
      },
      "round-win": {
        "spine": 0.099,
        "head": 0.6
      },
      "round-loss": {
        "spine": -0.162,
        "head": -0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Luminous blue queen source has a wider open crown and individually placed toes.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.3999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-open-crest",
    "fighterId": "user-open-crest",
    "profileId": "pose-v95-user-bipede-crete-ajouree",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-15-bipede-crete-ajouree.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "428f8e2d2acc92787260ce6b80fadbbcab6782874028c2fade61aa2f2c02382f",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          617,
          644
        ],
        "tip": [
          617,
          658
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          617,
          644
        ],
        "tip": [
          444,
          563
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          336,
          478
        ],
        "tip": [
          228,
          482
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          424,
          1096
        ],
        "tip": [
          424,
          1110
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          884,
          1084
        ],
        "tip": [
          884,
          1098
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          290,
          779
        ],
        "tip": [
          285,
          788
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          257,
          830
        ],
        "tip": [
          259,
          844
        ]
      }
    ],
    "pinned": [
      0,
      896,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          444,
          563
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          228,
          482
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          290,
          779
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          257,
          830
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          424,
          1096
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          884,
          1084
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "3060842f000c7863ff3e4ff7e7fc1ebfdce7ff8ebffde0fffc1fffe5ff181dfcc7ffd015fe281be007ee007df05883000000"
    },
    "poses": {
      "intro": {
        "spine": 0.224,
        "head": -1.08
      },
      "restraint": {
        "spine": -0.24,
        "head": 0.72
      },
      "struggle": {
        "spine": -0.32,
        "head": 1.26
      },
      "release": {
        "spine": 0.128,
        "head": -0.45
      },
      "round-win": {
        "spine": 0.176,
        "head": 0.9
      },
      "round-loss": {
        "spine": -0.288,
        "head": -1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Open long crest and forward low hands, without filling any source holes or inventing fingers.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-green-dome",
    "fighterId": "user-green-dome",
    "profileId": "pose-v95-user-bipede-dome-verdoyant",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-18-bipede-dome-verdoyant.png",
    "sourceFacing": 1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "7b53249ba6e7f4f4f04eac94c8fef068463937a7d884feba5cc2fe324921c5a4",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          641,
          714
        ],
        "tip": [
          641,
          728
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          641,
          714
        ],
        "tip": [
          691,
          490
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          752,
          405
        ],
        "tip": [
          880,
          394
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          563,
          1100
        ],
        "tip": [
          563,
          1114
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          706,
          1096
        ],
        "tip": [
          706,
          1110
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          980,
          486
        ],
        "tip": [
          985,
          490
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1111,
          509
        ],
        "tip": [
          1111,
          523
        ]
      }
    ],
    "pinned": [
      0,
      960,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          691,
          490
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          880,
          394
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          980,
          486
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1111,
          509
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          563,
          1100
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          706,
          1096
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "082044000001fc201ff483ff843ff991ffc70ffc0bf8e03f208ff309ffe01dfa819fe83fffc1fffc3cf809ff804f8200000a"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Green domed source has high forward hands and narrow native foot offsets.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-violet-lobes",
    "fighterId": "user-violet-lobes",
    "profileId": "pose-v95-user-quadrupede-lobes-violets",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-21-quadrupede-lobes-violets.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "8bd1f08747535106f605166b97d75cad9b4026fc42d711d3c9efa6e3673ea4ff",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          664,
          722
        ],
        "tip": [
          658,
          734
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          664,
          722
        ],
        "tip": [
          451,
          668
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          293,
          590
        ],
        "tip": [
          193,
          594
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          767,
          861
        ],
        "tip": [
          767,
          875
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          780,
          795
        ],
        "tip": [
          781,
          809
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          139,
          887
        ],
        "tip": [
          140,
          897
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          323,
          908
        ],
        "tip": [
          323,
          922
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          451,
          668
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          193,
          594
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          139,
          887
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          323,
          908
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          767,
          861
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          780,
          795
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "00200000000000000010020000e0101f0003f0007ff867fffe37ffe07f800ff807ffc0ff7801c28001600000400002000000"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.78
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.52
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.91
      },
      "release": {
        "spine": 0.096,
        "head": -0.325
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.65
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Violet-lobed quadruped has a low forward head and uneven native rear supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-green-vesicles",
    "fighterId": "user-green-vesicles",
    "profileId": "pose-v95-user-quadrupede-vesicules-vertes",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-22-quadrupede-vesicules-vertes.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "ddd33d23528edb649cd894aaa5f572f7d0815e710b0c30f8da5e6561fcfc4e65",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          579,
          637
        ],
        "tip": [
          579,
          651
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          579,
          637
        ],
        "tip": [
          370,
          598
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          270,
          553
        ],
        "tip": [
          94,
          579
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          426,
          909
        ],
        "tip": [
          426,
          918
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          783,
          928
        ],
        "tip": [
          783,
          942
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          156,
          958
        ],
        "tip": [
          156,
          972
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          223,
          1007
        ],
        "tip": [
          219,
          1013
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          370,
          598
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          94,
          579
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          156,
          958
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          223,
          1007
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          426,
          909
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          783,
          928
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "1c22800100011001001c0e83f6c9f8ff580ff708fff90fffc0dffc03fd981ffd83fff87f3e2785a0721d0009d04046000002"
    },
    "poses": {
      "intro": {
        "spine": 0.168,
        "head": -0.78
      },
      "restraint": {
        "spine": -0.18,
        "head": 0.52
      },
      "struggle": {
        "spine": -0.24,
        "head": 0.91
      },
      "release": {
        "spine": 0.096,
        "head": -0.325
      },
      "round-win": {
        "spine": 0.132,
        "head": 0.65
      },
      "round-loss": {
        "spine": -0.216,
        "head": -0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Green-vesicle source retains the bent hindlimbs and two forward reaching supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-black-dome",
    "fighterId": "user-black-dome",
    "profileId": "pose-v95-user-quadrupede-dome-noir",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-23-quadrupede-dome-noir.png",
    "sourceFacing": 1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "d4aa135264e99b4ea84d3cb623d00473e2b6dabbcdb52a236ecb878f2de1c494",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          714,
          725
        ],
        "tip": [
          714,
          739
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          714,
          725
        ],
        "tip": [
          938,
          610
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1026,
          505
        ],
        "tip": [
          1123,
          494
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          583,
          945
        ],
        "tip": [
          583,
          959
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          644,
          949
        ],
        "tip": [
          644,
          963
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          980,
          947
        ],
        "tip": [
          980,
          961
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          938,
          610
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1123,
          494
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          980,
          947
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          583,
          945
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          644,
          949
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "002004000000000000000007a000fc100fe407fe00ffe41ff819f74e3f7473e603fda01efb800f3800000800004002000000"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Black-domed low body has long native forelimbs; no biped gait is imposed. The far forelimb is occluded; no extra hand contact is fabricated.",
    "occludedContactsV165": [
      "handFar"
    ],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-black-fin",
    "fighterId": "user-black-fin",
    "profileId": "pose-v95-user-quadrupede-nageoire-noire",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-24-quadrupede-nageoire-noire.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "3b3a78091028793320e98006ea40645dc5da59b78051eb1055c49dbee220d615",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          590,
          749
        ],
        "tip": [
          590,
          763
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          590,
          749
        ],
        "tip": [
          383,
          702
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          285,
          657
        ],
        "tip": [
          190,
          691
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          664,
          847
        ],
        "tip": [
          657,
          855
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          750,
          850
        ],
        "tip": [
          749,
          850
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          177,
          826
        ],
        "tip": [
          177,
          840
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          227,
          830
        ],
        "tip": [
          238,
          851
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          383,
          702
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          190,
          691
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          177,
          826
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          227,
          830
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          664,
          847
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          750,
          850
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "0020000000000000000000000000000f0001ffc23ffe07ffce7ffff3fffb7fffc7eff0020400000000000000000040000000"
    },
    "poses": {
      "intro": {
        "spine": 0.112,
        "head": -0.54
      },
      "restraint": {
        "spine": -0.12,
        "head": 0.36
      },
      "struggle": {
        "spine": -0.16,
        "head": 0.63
      },
      "release": {
        "spine": 0.064,
        "head": -0.225
      },
      "round-win": {
        "spine": 0.088,
        "head": 0.45
      },
      "round-loss": {
        "spine": -0.144,
        "head": -0.5175
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "low-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Very low black-fin quadruped needs individually fixed support regions, separate from its neck.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.09,
      "radiansPerSecond": 4.8999999999999995
    },
    "rigidZonesV163": [],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-user-orange-biped",
    "fighterId": "user-orange-biped",
    "profileId": "pose-v95-user-bipede-brun-orange",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-26-bipede-brun-orange.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "247f29bbb7f13f97d3b7aaf939b66178445735ffd00b4fee9cfbd79b2a29bb49",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          563,
          756
        ],
        "tip": [
          563,
          770
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          563,
          756
        ],
        "tip": [
          556,
          498
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          509,
          405
        ],
        "tip": [
          432,
          390
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          324,
          1053
        ],
        "tip": [
          324,
          1067
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          826,
          1057
        ],
        "tip": [
          826,
          1071
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          208,
          660
        ],
        "tip": [
          208,
          674
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          471,
          868
        ],
        "tip": [
          468,
          879
        ]
      }
    ],
    "pinned": [
      0,
      896,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          556,
          498
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          432,
          390
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          208,
          660
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          471,
          868
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          324,
          1053
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          826,
          1057
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "0020c0080018bb033d080fe7d0fffe1ffdc1ffee1fff67ffbc3fffc3fff82fee00ffd887fc29f7c01d3c0389f810c601019a"
    },
    "poses": {
      "intro": {
        "spine": 0.224,
        "head": -1.08
      },
      "restraint": {
        "spine": -0.24,
        "head": 0.72
      },
      "struggle": {
        "spine": -0.32,
        "head": 1.26
      },
      "release": {
        "spine": 0.128,
        "head": -0.45
      },
      "round-win": {
        "spine": 0.176,
        "head": 0.9
      },
      "round-loss": {
        "spine": -0.288,
        "head": -1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Orange crouched biped retains its two bent hindlimbs and long low near hand.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-unclassified-multiarm",
    "fighterId": "user-unclassified-multiarm",
    "profileId": "pose-v95-user-xeno-caste-to-define",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-53-xeno-caste-to-define.png",
    "sourceFacing": -1,
    "sourceWidth": 1121,
    "sourceHeight": 1403,
    "sourceSha256": "94959012e396b121574ceee15d3a92851a7e8cdb84bb1f11ecb233e7dbb1dd98",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          556,
          774
        ],
        "tip": [
          556,
          788
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          556,
          774
        ],
        "tip": [
          516,
          502
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          507,
          350
        ],
        "tip": [
          465,
          269
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          488,
          1274
        ],
        "tip": [
          488,
          1288
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          587,
          1303
        ],
        "tip": [
          587,
          1317
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          405,
          823
        ],
        "tip": [
          400,
          837
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          697,
          851
        ],
        "tip": [
          697,
          865
        ]
      },
      {
        "id": "clawUpperFar",
        "parent": "hips",
        "pivot": [
          403,
          722
        ],
        "tip": [
          403,
          736
        ]
      },
      {
        "id": "clawUpperNear",
        "parent": "hips",
        "pivot": [
          486,
          703
        ],
        "tip": [
          486,
          717
        ]
      }
    ],
    "pinned": [
      0,
      1088,
      1121,
      1403
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          516,
          502
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          465,
          269
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          405,
          823
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          697,
          851
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          488,
          1274
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          587,
          1303
        ]
      },
      "clawUpperFar": {
        "bone": "clawUpperFar",
        "point": [
          403,
          722
        ]
      },
      "clawUpperNear": {
        "bone": "clawUpperNear",
        "point": [
          486,
          703
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 18,
      "rows": 22,
      "mask": "4400813e887fc02ff843f010fd803fc20ff847fc00ff007fc21ff8c7fd1bfdc0bff0479097e8003920dec02fb47bf6870d0"
    },
    "poses": {
      "intro": {
        "spine": 0.14,
        "head": -0.72
      },
      "restraint": {
        "spine": -0.15,
        "head": 0.48
      },
      "struggle": {
        "spine": -0.2,
        "head": 0.84
      },
      "release": {
        "spine": 0.08,
        "head": -0.3
      },
      "round-win": {
        "spine": 0.11,
        "head": 0.6
      },
      "round-loss": {
        "spine": -0.18,
        "head": -0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "multiarm-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Four-arm front-view source; additional visible hand anchors are recorded rather than reconstructing a human two-arm silhouette.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-flesh-experiment",
    "fighterId": "user-flesh-experiment",
    "profileId": "pose-v95-user-xeno-experiment-flesh",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-59-xeno-experiment-flesh.png",
    "sourceFacing": -1,
    "sourceWidth": 1121,
    "sourceHeight": 1403,
    "sourceSha256": "975e31ea6711917a6b6bb73444561ea3adda8ed6c797a5179712ba5a82a95e3d",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          457,
          660
        ],
        "tip": [
          457,
          674
        ]
      },
      {
        "id": "thorax",
        "parent": "hips",
        "pivot": [
          457,
          660
        ],
        "tip": [
          444,
          471
        ]
      },
      {
        "id": "cranialCluster",
        "parent": "thorax",
        "pivot": [
          435,
          341
        ],
        "tip": [
          453,
          233
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          280,
          1226
        ],
        "tip": [
          280,
          1240
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          625,
          1226
        ],
        "tip": [
          625,
          1240
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          354,
          665
        ],
        "tip": [
          354,
          679
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          479,
          747
        ],
        "tip": [
          479,
          761
        ]
      }
    ],
    "pinned": [
      0,
      1088,
      1121,
      1403
    ],
    "contacts": {
      "chest": {
        "bone": "thorax",
        "point": [
          444,
          471
        ]
      },
      "head": {
        "bone": "cranialCluster",
        "point": [
          453,
          233
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          354,
          665
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          479,
          747
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          280,
          1226
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          625,
          1226
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 18,
      "rows": 22,
      "mask": "4000880100fa507f240fc803f008fe023f7847df01f7c17dfa7ff28fee03fdc8fff03ffe9eec039a01e744f3e400de88012"
    },
    "poses": {
      "intro": {
        "thorax": 0.084,
        "cranialCluster": -0.42
      },
      "restraint": {
        "thorax": -0.09,
        "cranialCluster": 0.28
      },
      "struggle": {
        "thorax": -0.12,
        "cranialCluster": 0.49
      },
      "release": {
        "thorax": 0.048,
        "cranialCluster": -0.175
      },
      "round-win": {
        "thorax": 0.066,
        "cranialCluster": 0.35
      },
      "round-loss": {
        "thorax": -0.108,
        "cranialCluster": -0.4025
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "conjoined-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Fused cranial cluster is one small control region; no separate heads or hidden human legs are reconstructed.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "cranialCluster",
      "degrees": 0.07,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-user-renaissance",
    "fighterId": "user-renaissance",
    "profileId": "pose-v95-user-xeno-experiment-renaissance",
    "path": "/assets/openai/sprites/static-enemy-v95/ref-61-xeno-experiment-renaissance.png",
    "sourceFacing": -1,
    "sourceWidth": 1121,
    "sourceHeight": 1403,
    "sourceSha256": "f16469e31d48f35448cafaffd790fd2f0b01214e7b2dd471ff1526b2703cb9b6",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          573,
          691
        ],
        "tip": [
          573,
          705
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          573,
          691
        ],
        "tip": [
          565,
          432
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          560,
          328
        ],
        "tip": [
          548,
          203
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          427,
          1261
        ],
        "tip": [
          427,
          1275
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          655,
          1269
        ],
        "tip": [
          655,
          1283
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          375,
          803
        ],
        "tip": [
          375,
          817
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          724,
          807
        ],
        "tip": [
          724,
          821
        ]
      }
    ],
    "pinned": [
      0,
      1088,
      1121,
      1403
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          565,
          432
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          548,
          203
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          375,
          803
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          724,
          807
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          427,
          1261
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          655,
          1269
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 18,
      "rows": 22,
      "mask": "40008078007e800fe003f000fc003f020fd003f803fe007f801ff017fc01fe007e800f84237900d86076001dc06f7002000"
    },
    "poses": {
      "intro": {
        "spine": 0.224,
        "head": -1.08
      },
      "restraint": {
        "spine": -0.24,
        "head": 0.72
      },
      "struggle": {
        "spine": -0.32,
        "head": 1.26
      },
      "release": {
        "spine": 0.128,
        "head": -0.45
      },
      "round-win": {
        "spine": 0.176,
        "head": 0.9
      },
      "round-loss": {
        "spine": -0.288,
        "head": -1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Slender pale native body with long hanging fingers and two narrow supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-synth-eloise",
    "fighterId": "import-synth-eloise",
    "profileId": "pose-v106-import-synth-eloise",
    "path": "/assets/openai/sprites/static-import-v106/synth-eloise.png",
    "sourceFacing": -1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "59c16d4b87a66e65d9e83a172a66a307bbfb8c5f0e536e0bf1cfc731f77d1dd3",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          538,
          718
        ],
        "tip": [
          538,
          732
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          538,
          718
        ],
        "tip": [
          543,
          411
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          543,
          284
        ],
        "tip": [
          500,
          170
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          368,
          1451
        ],
        "tip": [
          368,
          1465
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          703,
          1423
        ],
        "tip": [
          703,
          1437
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          245,
          893
        ],
        "tip": [
          245,
          907
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          425,
          766
        ],
        "tip": [
          425,
          780
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          543,
          411
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          500,
          170
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          245,
          893
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          425,
          766
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          368,
          1451
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          703,
          1423
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "03c807e017e007f803fc03fc13f003f003f813fc03f80bf0bfe03fe13fe03fe13ff20f702f70277c673847705f781f10"
    },
    "poses": {
      "intro": {
        "spine": 0.182,
        "head": -0.9
      },
      "restraint": {
        "spine": -0.195,
        "head": 0.6
      },
      "struggle": {
        "spine": -0.26,
        "head": 1.05
      },
      "release": {
        "spine": 0.104,
        "head": -0.375
      },
      "round-win": {
        "spine": 0.143,
        "head": 0.75
      },
      "round-loss": {
        "spine": -0.234,
        "head": -0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Eloise source includes protruding arrows and a carried bow-like region, preserved by measured rigid source regions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            571,
            241
          ],
          [
            882,
            208
          ],
          [
            892,
            629
          ],
          [
            585,
            600
          ]
        ]
      },
      {
        "bone": "hips",
        "polygon": [
          [
            132,
            789
          ],
          [
            462,
            818
          ],
          [
            481,
            1144
          ],
          [
            132,
            1144
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-synth-jerri-1",
    "fighterId": "import-synth-jerri-1",
    "profileId": "pose-v106-import-synth-jerri-1",
    "path": "/assets/openai/sprites/static-import-v106/synth-jerri-1.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "d519f175452f9d785c9feba77014405b54699d162147c283c2d83c5253b6145a",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          675,
          644
        ],
        "tip": [
          675,
          658
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          675,
          644
        ],
        "tip": [
          695,
          432
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          679,
          255
        ],
        "tip": [
          633,
          208
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          567,
          1119
        ],
        "tip": [
          567,
          1133
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          849,
          1181
        ],
        "tip": [
          849,
          1195
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          374,
          505
        ],
        "tip": [
          374,
          519
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          552,
          502
        ],
        "tip": [
          552,
          516
        ]
      }
    ],
    "pinned": [
      0,
      960,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          695,
          432
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          633,
          208
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          374,
          505
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          552,
          502
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          567,
          1119
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          849,
          1181
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "2078841ff001fe001fe042fe042fe8bffc03ffe03ffc01ffe001ff807ff80fdf859ff885fda84ff800ef003ee043ce4000e2"
    },
    "poses": {
      "intro": {
        "spine": 0.112,
        "head": -0.6
      },
      "restraint": {
        "spine": -0.12,
        "head": 0.4
      },
      "struggle": {
        "spine": -0.16,
        "head": 0.7
      },
      "release": {
        "spine": 0.064,
        "head": -0.25
      },
      "round-win": {
        "spine": 0.088,
        "head": 0.5
      },
      "round-loss": {
        "spine": -0.144,
        "head": -0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "robot-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Copper Jerri has a long forward gun, native small smoking mouth and two separated toe groups.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 4.8999999999999995
    },
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            170,
            378
          ],
          [
            679,
            359
          ],
          [
            698,
            583
          ],
          [
            166,
            602
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-synth-jerri-2",
    "fighterId": "import-synth-jerri-2",
    "profileId": "pose-v106-import-synth-jerri-2",
    "path": "/assets/openai/sprites/static-import-v106/synth-jerri-2.png",
    "sourceFacing": -1,
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "sourceSha256": "45869ec34206c04275202587568f4815593c368032404f03f54153d0fdb9e011",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          683,
          621
        ],
        "tip": [
          683,
          635
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          683,
          621
        ],
        "tip": [
          691,
          382
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          706,
          270
        ],
        "tip": [
          656,
          212
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          544,
          1127
        ],
        "tip": [
          544,
          1141
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          833,
          1173
        ],
        "tip": [
          833,
          1187
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          370,
          529
        ],
        "tip": [
          370,
          543
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          532,
          502
        ],
        "tip": [
          532,
          516
        ]
      }
    ],
    "pinned": [
      0,
      960,
      1254,
      1254
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          691,
          382
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          656,
          212
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          370,
          529
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          532,
          502
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          544,
          1127
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          833,
          1173
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 20,
      "mask": "0078c01fc001fe025fe885fe000fe207fd03ffec3ffc03ffe860ff007ff80fdb819fd825fd84cff840ff233ee053ce0004e0"
    },
    "poses": {
      "intro": {
        "spine": 0.112,
        "head": -0.6
      },
      "restraint": {
        "spine": -0.12,
        "head": 0.4
      },
      "struggle": {
        "spine": -0.16,
        "head": 0.7
      },
      "release": {
        "spine": 0.064,
        "head": -0.25
      },
      "round-win": {
        "spine": 0.088,
        "head": 0.5
      },
      "round-loss": {
        "spine": -0.144,
        "head": -0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "robot-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Dark Jerri retains the large forward gun and the original source tail without independent tail animation.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 4.8999999999999995
    },
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            158,
            397
          ],
          [
            776,
            328
          ],
          [
            795,
            579
          ],
          [
            166,
            625
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-wy-covenant-david",
    "fighterId": "import-wy-covenant-david",
    "profileId": "pose-v106-import-wy-covenant-david",
    "path": "/assets/openai/sprites/static-import-v106/wy-covenant-david.png",
    "sourceFacing": -1,
    "sourceWidth": 1198,
    "sourceHeight": 1313,
    "sourceSha256": "f0b7e966868af9f5020ad84f9413ec20de0932bbd1b304ae507e7acf9ca6bf73",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          621,
          626
        ],
        "tip": [
          621,
          640
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          621,
          626
        ],
        "tip": [
          613,
          339
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          565,
          234
        ],
        "tip": [
          536,
          158
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          561,
          1216
        ],
        "tip": [
          561,
          1230
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          605,
          1216
        ],
        "tip": [
          605,
          1230
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          577,
          731
        ],
        "tip": [
          577,
          745
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          645,
          691
        ],
        "tip": [
          645,
          705
        ]
      }
    ],
    "pinned": [
      0,
      1088,
      1198,
      1313
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          613,
          339
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          536,
          158
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          577,
          731
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          645,
          691
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          561,
          1216
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          605,
          1216
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 19,
      "rows": 21,
      "mask": "00e6043c01078408f8001f4003fc207d500f9081f0003e4007d000f0801ec021ce0039ca670044e0001c8007b280f8000c00"
    },
    "poses": {
      "intro": {
        "spine": 0.182,
        "head": -0.9
      },
      "restraint": {
        "spine": -0.195,
        "head": 0.6
      },
      "struggle": {
        "spine": -0.26,
        "head": 1.05
      },
      "release": {
        "spine": 0.104,
        "head": -0.375
      },
      "round-win": {
        "spine": 0.143,
        "head": 0.75
      },
      "round-loss": {
        "spine": -0.234,
        "head": -0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Side-facing David source retains its native coat, hat, hanging hands and overlapping boot stance.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-alien-king-from-alien-extemrination",
    "fighterId": "import-alien-king-from-alien-extemrination",
    "profileId": "pose-v106-import-alien-king-from-alien-extemrination",
    "path": "/assets/openai/sprites/static-import-v106/alien-king-from-alien-extemrination.png",
    "sourceFacing": -1,
    "sourceWidth": 1402,
    "sourceHeight": 1122,
    "sourceSha256": "6fea0618f4565efbef7acd42a387f38aa42e30303f921936e902842ff3999868",
    "bones": [
      {
        "id": "bodyBase",
        "parent": null,
        "pivot": [
          844,
          728
        ],
        "tip": [
          846,
          742
        ]
      },
      {
        "id": "core",
        "parent": "bodyBase",
        "pivot": [
          844,
          728
        ],
        "tip": [
          777,
          606
        ]
      },
      {
        "id": "crown",
        "parent": "core",
        "pivot": [
          728,
          569
        ],
        "tip": [
          629,
          364
        ]
      },
      {
        "id": "bodySupportFarAnchor",
        "parent": "bodyBase",
        "pivot": [
          311,
          1004
        ],
        "tip": [
          311,
          1018
        ]
      },
      {
        "id": "bodySupportNearAnchor",
        "parent": "bodyBase",
        "pivot": [
          905,
          979
        ],
        "tip": [
          911,
          983
        ]
      },
      {
        "id": "appendageMouthFarAnchor",
        "parent": "bodyBase",
        "pivot": [
          100,
          783
        ],
        "tip": [
          103,
          800
        ]
      },
      {
        "id": "appendageMouthNearAnchor",
        "parent": "bodyBase",
        "pivot": [
          1269,
          216
        ],
        "tip": [
          1269,
          230
        ]
      }
    ],
    "pinned": [
      0,
      832,
      1402,
      1122
    ],
    "contacts": {
      "chest": {
        "bone": "core",
        "point": [
          777,
          606
        ]
      },
      "head": {
        "bone": "crown",
        "point": [
          629,
          364
        ]
      },
      "appendageMouthFar": {
        "bone": "appendageMouthFarAnchor",
        "point": [
          100,
          783
        ]
      },
      "appendageMouthNear": {
        "bone": "appendageMouthNearAnchor",
        "point": [
          1269,
          216
        ]
      },
      "bodySupportFar": {
        "bone": "bodyBase",
        "point": [
          311,
          1004
        ]
      },
      "bodySupportNear": {
        "bone": "bodyBase",
        "point": [
          905,
          979
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 22,
      "rows": 18,
      "mask": "0034401f2374fe1fc3fdef47f7f9ffff8d7ffdbfffe07fffc1fffe1ffffbbdfffcffffec3effe0f5ff9f91c27e700200800"
    },
    "poses": {
      "intro": {
        "core": 0.084,
        "crown": -0.54
      },
      "restraint": {
        "core": -0.09,
        "crown": 0.36
      },
      "struggle": {
        "core": -0.12,
        "crown": 0.63
      },
      "release": {
        "core": 0.048,
        "crown": -0.225
      },
      "round-win": {
        "core": 0.066,
        "crown": 0.45
      },
      "round-loss": {
        "core": -0.108,
        "crown": -0.5175
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "multiarm-crowned",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Insectoid king uses a body core and crown cage. The two extended mouth-bearing appendages are named as appendages, never human hands.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "crown",
      "degrees": 0.09,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "bodySupportFar",
      "bodySupportNear"
    ],
    "supportRootBoneV165": "bodyBase"
  },
  {
    "id": "rig-v165-import-green-alien-king",
    "fighterId": "import-green-alien-king",
    "profileId": "pose-v106-import-green-alien-king",
    "path": "/assets/openai/sprites/static-import-v106/green-alien-king.png",
    "sourceFacing": -1,
    "sourceWidth": 1312,
    "sourceHeight": 1199,
    "sourceSha256": "6d821694425ae18150bd948a1dd0164d2024c669817e2c25635ca8f2ba057a79",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          649,
          697
        ],
        "tip": [
          649,
          711
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          649,
          697
        ],
        "tip": [
          527,
          513
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          428,
          461
        ],
        "tip": [
          332,
          461
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          545,
          1085
        ],
        "tip": [
          545,
          1099
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          704,
          1114
        ],
        "tip": [
          704,
          1128
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          365,
          823
        ],
        "tip": [
          365,
          837
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1004,
          942
        ],
        "tip": [
          1004,
          957
        ]
      }
    ],
    "pinned": [
      0,
      896,
      1312,
      1199
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          527,
          513
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          332,
          461
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          365,
          823
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1004,
          942
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          545,
          1085
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          704,
          1114
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 21,
      "rows": 19,
      "mask": "0793413d8417ed809fe802ff847fff4b7ff843ffe05bff91dfbf12fff00ff780ffdc0fff603fff807ffc03fde03ffe00fff0"
    },
    "poses": {
      "intro": {
        "spine": 0.126,
        "head": -0.72
      },
      "restraint": {
        "spine": -0.135,
        "head": 0.48
      },
      "struggle": {
        "spine": -0.18,
        "head": 0.84
      },
      "release": {
        "spine": 0.072,
        "head": -0.3
      },
      "round-win": {
        "spine": 0.099,
        "head": 0.6
      },
      "round-loss": {
        "spine": -0.162,
        "head": -0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Green king keeps its extended crest and long blade-like side appendage in source pose.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-xeno-gorillaxeno",
    "fighterId": "import-xeno-gorillaxeno",
    "profileId": "pose-v106-import-xeno-gorillaxeno",
    "path": "/assets/openai/sprites/static-import-v106/xeno-gorillaxeno.png",
    "sourceFacing": -1,
    "sourceWidth": 1602,
    "sourceHeight": 982,
    "sourceSha256": "130e1d46adfaa2824bfd5d0616817f4eedac4b764511d9c34306adb2ee10a4fc",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          749,
          562
        ],
        "tip": [
          749,
          576
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          749,
          562
        ],
        "tip": [
          498,
          420
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          377,
          342
        ],
        "tip": [
          229,
          355
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          732,
          891
        ],
        "tip": [
          732,
          905
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          927,
          887
        ],
        "tip": [
          927,
          901
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          160,
          883
        ],
        "tip": [
          160,
          897
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          468,
          908
        ],
        "tip": [
          468,
          922
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1602,
      982
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          498,
          420
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          229,
          355
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          160,
          883
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          468,
          908
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          732,
          891
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          927,
          887
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 26,
      "rows": 16,
      "mask": "07d03003fd0001ffe000ffe0007ffc0c1fff4fc7ffeff9ffffc63ffffc0fffe003dfe201effc0473ff181cffe14fbff1880e1800"
    },
    "poses": {
      "intro": {
        "spine": 0.119,
        "head": -0.6
      },
      "restraint": {
        "spine": -0.1275,
        "head": 0.4
      },
      "struggle": {
        "spine": -0.17,
        "head": 0.7
      },
      "release": {
        "spine": 0.068,
        "head": -0.25
      },
      "round-win": {
        "spine": 0.0935,
        "head": 0.5
      },
      "round-loss": {
        "spine": -0.153,
        "head": -0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Blue knuckle-supported gorilla plate has a low front skull and broad original forefeet.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.3999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-import-xeno-kingrogue",
    "fighterId": "import-xeno-kingrogue",
    "profileId": "pose-v106-import-xeno-kingrogue",
    "path": "/assets/openai/sprites/static-import-v106/xeno-kingrogue.png",
    "sourceFacing": 1,
    "sourceWidth": 1492,
    "sourceHeight": 1054,
    "sourceSha256": "7d8d9bbe52b72be700b975999effb39b7045f03a59d8b3858214cae0eb9dafa1",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          1012,
          606
        ],
        "tip": [
          1012,
          620
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          1012,
          606
        ],
        "tip": [
          1077,
          452
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1165,
          351
        ],
        "tip": [
          1246,
          367
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          536,
          993
        ],
        "tip": [
          536,
          1007
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1133,
          937
        ],
        "tip": [
          1133,
          951
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1133,
          674
        ],
        "tip": [
          1133,
          688
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1246,
          654
        ],
        "tip": [
          1244,
          667
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1492,
      1054
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1077,
          452
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1246,
          367
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1133,
          674
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1246,
          654
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          536,
          993
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1133,
          937
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 17,
      "mask": "000be2003ff0001ffc7c1ff87fbff87ffffc3ffffc0ffffc06fff8021ff000dff812fff801ffe003f9c80383f003c4f203c000"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Large purple rogue king retains its very wide crown and long lifted tail without a tail clip.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 4.8999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-xeno-spacejokeygiant",
    "fighterId": "import-xeno-spacejokeygiant",
    "profileId": "pose-v106-import-xeno-spacejokeygiant",
    "path": "/assets/openai/sprites/static-import-v106/xeno-spacejokeygiant.png",
    "sourceFacing": 1,
    "sourceWidth": 1281,
    "sourceHeight": 1227,
    "sourceSha256": "d8a4ef94f428d918cda37ce7b8787763a45c4d3b98df2e752e8b7410c41700f3",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          529,
          664
        ],
        "tip": [
          529,
          678
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          529,
          664
        ],
        "tip": [
          548,
          412
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          529,
          298
        ],
        "tip": [
          552,
          230
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          401,
          1136
        ],
        "tip": [
          401,
          1150
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          673,
          1110
        ],
        "tip": [
          673,
          1124
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          317,
          710
        ],
        "tip": [
          317,
          724
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          756,
          706
        ],
        "tip": [
          752,
          719
        ]
      }
    ],
    "pinned": [
      0,
      960,
      1281,
      1227
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          548,
          412
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          552,
          230
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          317,
          710
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          756,
          706
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          401,
          1136
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          673,
          1110
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 21,
      "rows": 20,
      "mask": "0380801f8003fe149ff0c0ff0407f8187f8003ff081ff400ffe003fe003ffc81fff00fff007fe843fe404fea5277e483fe0000000"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Bronze giant source is kept at its original full native dimensions, with separately measured neck and toes.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 4.8
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-game-afe-synth-warden",
    "fighterId": "import-game-afe-synth-warden",
    "profileId": "pose-v106-import-game-afe-synth-warden",
    "path": "/assets/openai/sprites/static-game-v106/game-afe-synth-warden.png",
    "sourceFacing": -1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "019e4e3a3c1c184b8ded522ce17d129ba844965abbfbcb62d61d0f7598d9462e",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          599,
          780
        ],
        "tip": [
          599,
          794
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          599,
          780
        ],
        "tip": [
          580,
          406
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          557,
          298
        ],
        "tip": [
          552,
          170
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          472,
          1427
        ],
        "tip": [
          472,
          1441
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          816,
          1441
        ],
        "tip": [
          816,
          1455
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          363,
          600
        ],
        "tip": [
          363,
          614
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          274,
          572
        ],
        "tip": [
          274,
          586
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          580,
          406
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          552,
          170
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          363,
          600
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          274,
          572
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          472,
          1427
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          816,
          1441
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "09e00be01be021f901f851f8c7f89ff97ffa7ffe0ff871f801fa01fb03f823f803f813fd87fc01dc21dc23de47fe87be"
    },
    "poses": {
      "intro": {
        "spine": 0.182,
        "head": -0.9
      },
      "restraint": {
        "spine": -0.195,
        "head": 0.6
      },
      "struggle": {
        "spine": -0.26,
        "head": 1.05
      },
      "release": {
        "spine": 0.104,
        "head": -0.375
      },
      "round-win": {
        "spine": 0.143,
        "head": 0.75
      },
      "round-loss": {
        "spine": -0.234,
        "head": -0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Warden rifle, supporting hands and barrel occupy one measured rigid region.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            85,
            501
          ],
          [
            637,
            487
          ],
          [
            656,
            681
          ],
          [
            85,
            681
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-import-game-afe2-warden",
    "fighterId": "import-game-afe2-warden",
    "profileId": "pose-v106-import-game-afe2-warden",
    "path": "/assets/openai/sprites/static-game-v106/game-afe2-warden.png",
    "sourceFacing": -1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "6207a125227262064da6aa244f42aa206364777ddea5f2d87bce05fd08e1c19a",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          743,
          568
        ],
        "tip": [
          743,
          582
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          743,
          568
        ],
        "tip": [
          569,
          468
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          448,
          319
        ],
        "tip": [
          361,
          203
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          515,
          887
        ],
        "tip": [
          515,
          901
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1067,
          954
        ],
        "tip": [
          1067,
          968
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          87,
          896
        ],
        "tip": [
          87,
          910
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          996,
          920
        ],
        "tip": [
          996,
          934
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          569,
          468
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          361,
          203
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          87,
          896
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          996,
          920
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          515,
          887
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1067,
          954
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "4ff80c1ffe0b3ffdf67ffdffbfffc3effdfee7ffffdfff7bbfffebbffff77fffff7ffffe7fefff7ffffeffffe0ce9fe2"
    },
    "poses": {
      "intro": {
        "spine": 0.119,
        "head": -0.6
      },
      "restraint": {
        "spine": -0.1275,
        "head": 0.4
      },
      "struggle": {
        "spine": -0.17,
        "head": 0.7
      },
      "release": {
        "spine": 0.068,
        "head": -0.25
      },
      "round-win": {
        "spine": 0.0935,
        "head": 0.5
      },
      "round-loss": {
        "spine": -0.153,
        "head": -0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Broad forward-plated Warden has four visible supporting limb regions, without invented humanoid limb articulation.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-import-game-afe2-bulwark",
    "fighterId": "import-game-afe2-bulwark",
    "profileId": "pose-v106-import-game-afe2-bulwark",
    "path": "/assets/openai/sprites/static-game-v106/game-afe2-bulwark.png",
    "sourceFacing": -1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "4841d54ff6e1e7b98c06d4496f1f7fb188a5e981eb835ce67e7a97dd36c9966b",
    "bones": [
      {
        "id": "chassis",
        "parent": null,
        "pivot": [
          913,
          551
        ],
        "tip": [
          913,
          565
        ]
      },
      {
        "id": "platform",
        "parent": "chassis",
        "pivot": [
          913,
          551
        ],
        "tip": [
          868,
          439
        ]
      },
      {
        "id": "sensorReference",
        "parent": "platform",
        "pivot": [
          851,
          369
        ],
        "tip": [
          855,
          361
        ]
      },
      {
        "id": "rearSupportNearAnchor",
        "parent": "chassis",
        "pivot": [
          1042,
          936
        ],
        "tip": [
          1042,
          947
        ]
      },
      {
        "id": "frontSupportFarAnchor",
        "parent": "chassis",
        "pivot": [
          435,
          965
        ],
        "tip": [
          436,
          976
        ]
      },
      {
        "id": "frontSupportNearAnchor",
        "parent": "chassis",
        "pivot": [
          1346,
          976
        ],
        "tip": [
          1346,
          990
        ]
      },
      {
        "id": "muzzleFar",
        "parent": "chassis",
        "pivot": [
          150,
          118
        ],
        "tip": [
          150,
          132
        ]
      },
      {
        "id": "muzzleNear",
        "parent": "chassis",
        "pivot": [
          487,
          71
        ],
        "tip": [
          487,
          85
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "platform",
        "point": [
          868,
          439
        ]
      },
      "head": {
        "bone": "sensorReference",
        "point": [
          855,
          361
        ]
      },
      "frontSupportFar": {
        "bone": "frontSupportFarAnchor",
        "point": [
          435,
          965
        ]
      },
      "frontSupportNear": {
        "bone": "frontSupportNearAnchor",
        "point": [
          1346,
          976
        ]
      },
      "rearSupportNear": {
        "bone": "chassis",
        "point": [
          1042,
          936
        ]
      },
      "muzzleFar": {
        "bone": "muzzleFar",
        "point": [
          150,
          118
        ]
      },
      "muzzleNear": {
        "bone": "muzzleNear",
        "point": [
          487,
          71
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "7380087fe4027ff8603ff8000f7f0007bf8823ffc803ffe040ffe000dffc01ffff01fbfd03fffd03dddc47fbfe4fa47e"
    },
    "poses": {
      "intro": {
        "platform": 0.098,
        "sensorReference": -0.0
      },
      "restraint": {
        "platform": -0.105,
        "sensorReference": 0.0
      },
      "struggle": {
        "platform": -0.14,
        "sensorReference": 0.0
      },
      "release": {
        "platform": 0.056,
        "sensorReference": -0.0
      },
      "round-win": {
        "platform": 0.077,
        "sensorReference": 0
      },
      "round-loss": {
        "platform": -0.126,
        "sensorReference": -0.0
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "platform-robot",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Bulwark uses one small rigid gun-platform articulation above its three visible fixed foot regions. The occluded fourth foot is not fabricated.",
    "occludedContactsV165": [
      "rearSupportFar"
    ],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "sensorReference",
      "degrees": 0.0,
      "radiansPerSecond": 5.1
    },
    "rigidDefaultBoneV165": "chassis",
    "rigidZonesV163": [
      {
        "bone": "platform",
        "polygon": [
          [
            62,
            17
          ],
          [
            810,
            4
          ],
          [
            1179,
            240
          ],
          [
            1216,
            622
          ],
          [
            552,
            622
          ],
          [
            278,
            452
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "rearSupportNear",
      "frontSupportFar",
      "frontSupportNear"
    ],
    "supportRootBoneV165": "chassis",
    "articulatedRegionBoneV165": "platform"
  },
  {
    "id": "rig-v165-import-game-afe2-exploder",
    "fighterId": "import-game-afe2-exploder",
    "profileId": "pose-v106-import-game-afe2-exploder",
    "path": "/assets/openai/sprites/static-game-v106/game-afe2-exploder.png",
    "sourceFacing": -1,
    "sourceWidth": 1672,
    "sourceHeight": 941,
    "sourceSha256": "54719bf217e334ec6446c7bf0d762252d5d7216cbca17a8b95eadc8a242d4cb5",
    "bones": [
      {
        "id": "supportBase",
        "parent": null,
        "pivot": [
          877,
          516
        ],
        "tip": [
          877,
          530
        ]
      },
      {
        "id": "bodyMass",
        "parent": "supportBase",
        "pivot": [
          877,
          516
        ],
        "tip": [
          578,
          416
        ]
      },
      {
        "id": "oralRim",
        "parent": "bodyMass",
        "pivot": [
          330,
          380
        ],
        "tip": [
          194,
          421
        ]
      },
      {
        "id": "rearSupportFarAnchor",
        "parent": "supportBase",
        "pivot": [
          755,
          832
        ],
        "tip": [
          755,
          838
        ]
      },
      {
        "id": "rearSupportNearAnchor",
        "parent": "supportBase",
        "pivot": [
          1261,
          832
        ],
        "tip": [
          1261,
          846
        ]
      },
      {
        "id": "frontSupportFarAnchor",
        "parent": "supportBase",
        "pivot": [
          125,
          823
        ],
        "tip": [
          119,
          828
        ]
      },
      {
        "id": "frontSupportNearAnchor",
        "parent": "supportBase",
        "pivot": [
          452,
          836
        ],
        "tip": [
          451,
          836
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1672,
      941
    ],
    "contacts": {
      "chest": {
        "bone": "bodyMass",
        "point": [
          578,
          416
        ]
      },
      "head": {
        "bone": "oralRim",
        "point": [
          194,
          421
        ]
      },
      "frontSupportFar": {
        "bone": "frontSupportFarAnchor",
        "point": [
          125,
          823
        ]
      },
      "frontSupportNear": {
        "bone": "frontSupportNearAnchor",
        "point": [
          452,
          836
        ]
      },
      "rearSupportFar": {
        "bone": "supportBase",
        "point": [
          755,
          832
        ]
      },
      "rearSupportNear": {
        "bone": "supportBase",
        "point": [
          1261,
          832
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 27,
      "rows": 15,
      "mask": "0018c000fbc0803fdc930ffcf027ffff74ffffe99ffffe73fffbfc7fffee53fffff0fff7fc3de61f0f7bfb81eff77800100000"
    },
    "poses": {
      "intro": {
        "bodyMass": 0.084,
        "oralRim": -0.42
      },
      "restraint": {
        "bodyMass": -0.09,
        "oralRim": 0.28
      },
      "struggle": {
        "bodyMass": -0.12,
        "oralRim": 0.49
      },
      "release": {
        "bodyMass": 0.048,
        "oralRim": -0.175
      },
      "round-win": {
        "bodyMass": 0.066,
        "oralRim": 0.35
      },
      "round-loss": {
        "bodyMass": -0.108,
        "oralRim": -0.4025
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "sac-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Exploder body mass and oral rim use a small nonhuman cage, with its four painted claw supports fixed.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "oralRim",
      "degrees": 0.07,
      "radiansPerSecond": 5.3999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "rearSupportFar",
      "rearSupportNear",
      "frontSupportFar",
      "frontSupportNear"
    ],
    "supportRootBoneV165": "supportBase"
  },
  {
    "id": "rig-v165-import-game-dd-synthetic",
    "fighterId": "import-game-dd-synthetic",
    "profileId": "pose-v106-import-game-dd-synthetic",
    "path": "/assets/openai/sprites/static-game-v106/game-dd-synthetic.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "9c18db44333a21bdb9f7c1d9857c9ca15f4cdea3846c3ee8918a0136b3e67bf5",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          547,
          709
        ],
        "tip": [
          547,
          723
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          547,
          709
        ],
        "tip": [
          529,
          430
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          528,
          262
        ],
        "tip": [
          543,
          161
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          458,
          1389
        ],
        "tip": [
          458,
          1403
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          661,
          1380
        ],
        "tip": [
          661,
          1394
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          429,
          822
        ],
        "tip": [
          429,
          836
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          651,
          808
        ],
        "tip": [
          651,
          822
        ]
      }
    ],
    "pinned": [
      0,
      1216,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          529,
          430
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          543,
          161
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          429,
          822
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          651,
          808
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          458,
          1389
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          661,
          1380
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "080003c003c003c0078017c007c807d017d007e207e007e817e203e103c003c50bde0fd607d017c817e427f057f00000"
    },
    "poses": {
      "intro": {
        "spine": -0.182,
        "head": 0.9
      },
      "restraint": {
        "spine": 0.195,
        "head": -0.6
      },
      "struggle": {
        "spine": 0.26,
        "head": -1.05
      },
      "release": {
        "spine": -0.104,
        "head": 0.375
      },
      "round-win": {
        "spine": -0.143,
        "head": -0.75
      },
      "round-loss": {
        "spine": 0.234,
        "head": 0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Orange-uniformed synthetic retains its straight original limbs and separately located head.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-synth-incinerator",
    "fighterId": "synth-incinerator",
    "profileId": "pose-v110-afe-synth-incinerator",
    "path": "/assets/openai/sprites/static-game-v110/game-afe-synth-incinerator.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "003f9f4c65c2c7ff4f32c0f82bfc8b08ad19ab8893f1abaa6fd27f628db92318",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          406,
          775
        ],
        "tip": [
          406,
          789
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          406,
          775
        ],
        "tip": [
          387,
          411
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          415,
          298
        ],
        "tip": [
          411,
          241
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          137,
          1408
        ],
        "tip": [
          137,
          1422
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          736,
          1399
        ],
        "tip": [
          736,
          1413
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          326,
          619
        ],
        "tip": [
          326,
          633
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          538,
          586
        ],
        "tip": [
          538,
          600
        ]
      }
    ],
    "pinned": [
      0,
      1216,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          387,
          411
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          411,
          241
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          326,
          619
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          538,
          586
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          137,
          1408
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          736,
          1399
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "000007080f803f807f007f807f80ffe0ffffffff7fff3fa03fc83fc13fe03df07dfa79f078fc73f470f075f8e07c0042"
    },
    "poses": {
      "intro": {
        "spine": -0.112,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.12,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.16,
        "head": -0.7
      },
      "release": {
        "spine": -0.064,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.088,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.144,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "robot-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Incinerator rifle and grips retain one rigid source transform above the wide boot stance.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.0
    },
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            236,
            496
          ],
          [
            1024,
            487
          ],
          [
            1024,
            666
          ],
          [
            245,
            728
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-synth-detonator",
    "fighterId": "synth-detonator",
    "profileId": "pose-v110-afe-synth-detonator",
    "path": "/assets/openai/sprites/static-game-v110/game-afe-synth-detonator.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "7d8f8003e80da96f8a045462ab789d86a1c39900ac55edc6db8627e17b553483",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          514,
          747
        ],
        "tip": [
          514,
          761
        ]
      },
      {
        "id": "armoredTorso",
        "parent": "hips",
        "pivot": [
          514,
          747
        ],
        "tip": [
          529,
          392
        ]
      },
      {
        "id": "collarRim",
        "parent": "armoredTorso",
        "pivot": [
          566,
          236
        ],
        "tip": [
          566,
          194
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          160,
          1352
        ],
        "tip": [
          160,
          1366
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          793,
          1399
        ],
        "tip": [
          793,
          1413
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          165,
          742
        ],
        "tip": [
          165,
          756
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          885,
          778
        ],
        "tip": [
          891,
          791
        ]
      }
    ],
    "pinned": [
      0,
      1216,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "armoredTorso",
        "point": [
          529,
          392
        ]
      },
      "collarReference": {
        "bone": "collarRim",
        "point": [
          566,
          194
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          165,
          742
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          885,
          778
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          160,
          1352
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          793,
          1399
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "00c001e007e00ff01ff03ff83ff97ff97ffc7ffc7ffe7fee7ffe1ffe1e783e783d787a787b3a7238703c753e743e8000"
    },
    "poses": {
      "intro": {
        "armoredTorso": -0.14,
        "collarRim": 0.0
      },
      "restraint": {
        "armoredTorso": 0.15,
        "collarRim": -0.0
      },
      "struggle": {
        "armoredTorso": 0.2,
        "collarRim": -0.0
      },
      "release": {
        "armoredTorso": -0.08,
        "collarRim": 0.0
      },
      "round-win": {
        "armoredTorso": -0.11,
        "collarRim": 0
      },
      "round-loss": {
        "armoredTorso": 0.18,
        "collarRim": 0.0
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "collar-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "The source has an open collar and exposed neck wires, not a skull. The collar reference is not reconstructed as a head.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "collarRim",
      "degrees": 0.0,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "collarReference"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-synth-containment",
    "fighterId": "synth-containment",
    "profileId": "pose-v110-afe-synth-containment",
    "path": "/assets/openai/sprites/static-game-v110/game-afe-synth-containment.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "d065df84b529a30469df39215cb97d0d9b74b2323148f124d6ba6b04c2531bc2",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          529,
          737
        ],
        "tip": [
          529,
          751
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          529,
          737
        ],
        "tip": [
          538,
          421
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          538,
          265
        ],
        "tip": [
          538,
          156
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          250,
          1404
        ],
        "tip": [
          250,
          1418
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          731,
          1404
        ],
        "tip": [
          731,
          1418
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          212,
          846
        ],
        "tip": [
          212,
          860
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          694,
          666
        ],
        "tip": [
          694,
          680
        ]
      }
    ],
    "pinned": [
      0,
      1216,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          538,
          421
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          538,
          156
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          212,
          846
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          694,
          666
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          250,
          1404
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          731,
          1404
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "01c009c803f807fe0ffe0ffe1ffe1ffe3ffe3ffe3ffe7ffe7ffe3ffe1ffe1efe1e7e9e7e1e7d1c703874187c387c1a08"
    },
    "poses": {
      "intro": {
        "spine": -0.112,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.12,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.16,
        "head": -0.7
      },
      "release": {
        "spine": -0.064,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.088,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.144,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "robot-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Containment shield and lowered pistol have separate rigid measured regions; feet remain source-bound.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.0
    },
    "rigidZonesV163": [
      {
        "bone": "hips",
        "polygon": [
          [
            628,
            170
          ],
          [
            930,
            194
          ],
          [
            934,
            1177
          ],
          [
            628,
            1177
          ]
        ]
      },
      {
        "bone": "hips",
        "polygon": [
          [
            142,
            761
          ],
          [
            260,
            761
          ],
          [
            283,
            988
          ],
          [
            198,
            1007
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-synth-enforcer",
    "fighterId": "synth-enforcer",
    "profileId": "pose-v111-afe-synth-enforcer",
    "path": "/assets/openai/sprites/static-game-v111/game-afe-synth-enforcer.png",
    "sourceFacing": -1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "028ef6780368173b86af8774c45f0c74856002b730afed8e8e4e7071bcacfe25",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          623,
          737
        ],
        "tip": [
          623,
          751
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          623,
          737
        ],
        "tip": [
          628,
          487
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          590,
          279
        ],
        "tip": [
          595,
          208
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          411,
          1399
        ],
        "tip": [
          411,
          1413
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          930,
          1404
        ],
        "tip": [
          930,
          1418
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          255,
          406
        ],
        "tip": [
          255,
          420
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          458,
          411
        ],
        "tip": [
          458,
          425
        ]
      }
    ],
    "pinned": [
      0,
      1216,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          628,
          487
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          595,
          208
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          255,
          406
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          458,
          411
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          411,
          1399
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          930,
          1404
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "010000e001f00df8fffcfffc7ffc1ffc0ffc00fc00fc01fc01fc03fc03fe079e079f078f078f038747974fa76fa70806"
    },
    "poses": {
      "intro": {
        "spine": 0.112,
        "head": -0.6
      },
      "restraint": {
        "spine": -0.12,
        "head": 0.4
      },
      "struggle": {
        "spine": -0.16,
        "head": 0.7
      },
      "release": {
        "spine": 0.064,
        "head": -0.25
      },
      "round-win": {
        "spine": 0.088,
        "head": 0.5
      },
      "round-loss": {
        "spine": -0.144,
        "head": -0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "robot-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Long aimed rifle remains rigid instead of bending with the supported torso presentation.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.0
    },
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            28,
            265
          ],
          [
            580,
            269
          ],
          [
            698,
            515
          ],
          [
            99,
            510
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-synth-peacekeeper",
    "fighterId": "synth-peacekeeper",
    "profileId": "pose-v112-afe2-peacekeeper",
    "path": "/assets/openai/sprites/static-game-v112/game-afe2-peacekeeper.png",
    "sourceFacing": -1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "dfb6a5df19cabb190ebcf44583eb2e62242ff4e2f6ce4cc41643f4878fbab406",
    "bones": [
      {
        "id": "chassis",
        "parent": null,
        "pivot": [
          609,
          690
        ],
        "tip": [
          602,
          697
        ]
      },
      {
        "id": "platform",
        "parent": "chassis",
        "pivot": [
          609,
          690
        ],
        "tip": [
          609,
          411
        ]
      },
      {
        "id": "sensorReference",
        "parent": "platform",
        "pivot": [
          599,
          232
        ],
        "tip": [
          604,
          156
        ]
      },
      {
        "id": "supportFarAnchor",
        "parent": "chassis",
        "pivot": [
          448,
          1361
        ],
        "tip": [
          448,
          1375
        ]
      },
      {
        "id": "supportNearAnchor",
        "parent": "chassis",
        "pivot": [
          840,
          1427
        ],
        "tip": [
          840,
          1441
        ]
      },
      {
        "id": "toolFarAnchor",
        "parent": "chassis",
        "pivot": [
          344,
          742
        ],
        "tip": [
          344,
          756
        ]
      },
      {
        "id": "toolNearAnchor",
        "parent": "chassis",
        "pivot": [
          925,
          751
        ],
        "tip": [
          925,
          765
        ]
      }
    ],
    "pinned": [
      0,
      1216,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "platform",
        "point": [
          609,
          411
        ]
      },
      "head": {
        "bone": "sensorReference",
        "point": [
          604,
          156
        ]
      },
      "toolFar": {
        "bone": "toolFarAnchor",
        "point": [
          344,
          742
        ]
      },
      "toolNear": {
        "bone": "toolNearAnchor",
        "point": [
          925,
          751
        ]
      },
      "supportFar": {
        "bone": "chassis",
        "point": [
          448,
          1361
        ]
      },
      "supportNear": {
        "bone": "chassis",
        "point": [
          840,
          1427
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "0df10dfd03fe27fe07fe13fe3bff07f717ff0fff0fff1ffffffff3bf379c37fc4bde13de0bce0bce17ff47ef401f035e"
    },
    "poses": {
      "intro": {
        "platform": 0.098,
        "sensorReference": -0.0
      },
      "restraint": {
        "platform": -0.105,
        "sensorReference": 0.0
      },
      "struggle": {
        "platform": -0.14,
        "sensorReference": 0.0
      },
      "release": {
        "platform": 0.056,
        "sensorReference": -0.0
      },
      "round-win": {
        "platform": 0.077,
        "sensorReference": 0
      },
      "round-loss": {
        "platform": -0.126,
        "sensorReference": -0.0
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "platform-robot",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Peacekeeper cylindrical body is a single small articulated platform; its measured tool region stays rigid.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "sensorReference",
      "degrees": 0.0,
      "radiansPerSecond": 5.0
    },
    "rigidDefaultBoneV165": "chassis",
    "rigidZonesV163": [
      {
        "bone": "platform",
        "polygon": [
          [
            382,
            14
          ],
          [
            797,
            14
          ],
          [
            797,
            506
          ],
          [
            382,
            506
          ]
        ]
      },
      {
        "bone": "chassis",
        "polygon": [
          [
            14,
            827
          ],
          [
            429,
            629
          ],
          [
            486,
            728
          ],
          [
            52,
            898
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "supportFar",
      "supportNear"
    ],
    "supportRootBoneV165": "chassis",
    "articulatedRegionBoneV165": "platform"
  },
  {
    "id": "rig-v165-afe2-spider",
    "fighterId": "afe2-spider",
    "profileId": "pose-v113-afe2-spider",
    "path": "/assets/openai/sprites/static-game-v113/game-afe2-spider.png",
    "sourceFacing": -1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "117374e254ba63b1904465597a1adc33626c20c79148c0fed16ea8fbceb6852f",
    "bones": [
      {
        "id": "chassis",
        "parent": null,
        "pivot": [
          743,
          568
        ],
        "tip": [
          743,
          582
        ]
      },
      {
        "id": "platform",
        "parent": "chassis",
        "pivot": [
          743,
          568
        ],
        "tip": [
          706,
          406
        ]
      },
      {
        "id": "sensorReference",
        "parent": "platform",
        "pivot": [
          573,
          386
        ],
        "tip": [
          531,
          415
        ]
      },
      {
        "id": "rearSupportFarAnchor",
        "parent": "chassis",
        "pivot": [
          664,
          705
        ],
        "tip": [
          664,
          719
        ]
      },
      {
        "id": "rearSupportNearAnchor",
        "parent": "chassis",
        "pivot": [
          1411,
          734
        ],
        "tip": [
          1411,
          748
        ]
      },
      {
        "id": "frontSupportFarAnchor",
        "parent": "chassis",
        "pivot": [
          104,
          755
        ],
        "tip": [
          104,
          769
        ]
      },
      {
        "id": "frontSupportNearAnchor",
        "parent": "chassis",
        "pivot": [
          1154,
          858
        ],
        "tip": [
          1154,
          872
        ]
      }
    ],
    "pinned": [
      0,
      576,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "platform",
        "point": [
          706,
          406
        ]
      },
      "head": {
        "bone": "sensorReference",
        "point": [
          531,
          415
        ]
      },
      "frontSupportFar": {
        "bone": "frontSupportFarAnchor",
        "point": [
          104,
          755
        ]
      },
      "frontSupportNear": {
        "bone": "frontSupportNearAnchor",
        "point": [
          1154,
          858
        ]
      },
      "rearSupportFar": {
        "bone": "chassis",
        "point": [
          664,
          705
        ]
      },
      "rearSupportNear": {
        "bone": "chassis",
        "point": [
          1411,
          734
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "000808000000000640207f8061ff800ffffa9ffffd3ffffc3bfffe7bffee72f9e7fafceff814f00051f9404078000000"
    },
    "poses": {
      "intro": {
        "platform": 0.098,
        "sensorReference": -0.0
      },
      "restraint": {
        "platform": -0.105,
        "sensorReference": 0.0
      },
      "struggle": {
        "platform": -0.14,
        "sensorReference": 0.0
      },
      "release": {
        "platform": 0.056,
        "sensorReference": -0.0
      },
      "round-win": {
        "platform": 0.077,
        "sensorReference": 0
      },
      "round-loss": {
        "platform": -0.126,
        "sensorReference": -0.0
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "platform-robot",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Spider body/sensor assembly articulates as one plate over four measured fixed support regions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "sensorReference",
      "degrees": 0.0,
      "radiansPerSecond": 5.1
    },
    "rigidDefaultBoneV165": "chassis",
    "rigidZonesV163": [
      {
        "bone": "platform",
        "polygon": [
          [
            407,
            195
          ],
          [
            1034,
            191
          ],
          [
            1100,
            543
          ],
          [
            382,
            580
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "rearSupportFar",
      "rearSupportNear",
      "frontSupportFar",
      "frontSupportNear"
    ],
    "supportRootBoneV165": "chassis",
    "articulatedRegionBoneV165": "platform"
  },
  {
    "id": "rig-v165-afe2-igniter",
    "fighterId": "afe2-igniter",
    "profileId": "pose-v113-afe2-igniter",
    "path": "/assets/openai/sprites/static-game-v113/game-afe2-igniter.png",
    "sourceFacing": -1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "555d13ccdebedc07ba850b196fa39c063593ff1506ab35553e27ef83c2423ae6",
    "bones": [
      {
        "id": "chassis",
        "parent": null,
        "pivot": [
          670,
          714
        ],
        "tip": [
          669,
          714
        ]
      },
      {
        "id": "platform",
        "parent": "chassis",
        "pivot": [
          670,
          714
        ],
        "tip": [
          637,
          425
        ]
      },
      {
        "id": "sensorReference",
        "parent": "platform",
        "pivot": [
          646,
          213
        ],
        "tip": [
          642,
          151
        ]
      },
      {
        "id": "supportFarAnchor",
        "parent": "chassis",
        "pivot": [
          439,
          1356
        ],
        "tip": [
          439,
          1370
        ]
      },
      {
        "id": "supportNearAnchor",
        "parent": "chassis",
        "pivot": [
          897,
          1423
        ],
        "tip": [
          897,
          1437
        ]
      },
      {
        "id": "toolFarAnchor",
        "parent": "chassis",
        "pivot": [
          179,
          482
        ],
        "tip": [
          179,
          496
        ]
      },
      {
        "id": "toolNearAnchor",
        "parent": "chassis",
        "pivot": [
          552,
          666
        ],
        "tip": [
          552,
          680
        ]
      }
    ],
    "pinned": [
      0,
      1216,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "platform",
        "point": [
          637,
          425
        ]
      },
      "head": {
        "bone": "sensorReference",
        "point": [
          642,
          151
        ]
      },
      "toolFar": {
        "bone": "toolFarAnchor",
        "point": [
          179,
          482
        ]
      },
      "toolNear": {
        "bone": "toolNearAnchor",
        "point": [
          552,
          666
        ]
      },
      "supportFar": {
        "bone": "chassis",
        "point": [
          439,
          1356
        ]
      },
      "supportNear": {
        "bone": "chassis",
        "point": [
          897,
          1423
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "00f008fe01ff03ff03ff07ffffffffffffff3ffe41f819fc03fc03fc039c03fe03de13ce01ce03c707e707ff470f004f"
    },
    "poses": {
      "intro": {
        "platform": 0.098,
        "sensorReference": -0.0
      },
      "restraint": {
        "platform": -0.105,
        "sensorReference": 0.0
      },
      "struggle": {
        "platform": -0.14,
        "sensorReference": 0.0
      },
      "release": {
        "platform": 0.056,
        "sensorReference": -0.0
      },
      "round-win": {
        "platform": 0.077,
        "sensorReference": 0
      },
      "round-loss": {
        "platform": -0.126,
        "sensorReference": -0.0
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "platform-robot",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Igniter torso and forward weapon share one tiny platform transform rather than a fabricated humanoid head turn.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "sensorReference",
      "degrees": 0.0,
      "radiansPerSecond": 5.0
    },
    "rigidDefaultBoneV165": "chassis",
    "rigidZonesV163": [
      {
        "bone": "platform",
        "polygon": [
          [
            0,
            38
          ],
          [
            1024,
            38
          ],
          [
            1024,
            803
          ],
          [
            19,
            652
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "supportFar",
      "supportNear"
    ],
    "supportRootBoneV165": "chassis",
    "articulatedRegionBoneV165": "platform"
  },
  {
    "id": "rig-v165-afe2-bombardier",
    "fighterId": "afe2-bombardier",
    "profileId": "pose-v113-afe2-bombardier",
    "path": "/assets/openai/sprites/static-game-v113/game-afe2-bombardier.png",
    "sourceFacing": -1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "a7eee87701bd47c18287ef264196e3eb8479a289e357e208460bc690db28bcd4",
    "bones": [
      {
        "id": "chassis",
        "parent": null,
        "pivot": [
          576,
          733
        ],
        "tip": [
          576,
          747
        ]
      },
      {
        "id": "platform",
        "parent": "chassis",
        "pivot": [
          576,
          733
        ],
        "tip": [
          562,
          430
        ]
      },
      {
        "id": "sensorReference",
        "parent": "platform",
        "pivot": [
          562,
          227
        ],
        "tip": [
          571,
          165
        ]
      },
      {
        "id": "supportFarAnchor",
        "parent": "chassis",
        "pivot": [
          411,
          1361
        ],
        "tip": [
          411,
          1375
        ]
      },
      {
        "id": "supportNearAnchor",
        "parent": "chassis",
        "pivot": [
          882,
          1432
        ],
        "tip": [
          882,
          1446
        ]
      },
      {
        "id": "toolFarAnchor",
        "parent": "chassis",
        "pivot": [
          127,
          378
        ],
        "tip": [
          127,
          392
        ]
      },
      {
        "id": "toolNearAnchor",
        "parent": "chassis",
        "pivot": [
          452,
          499
        ],
        "tip": [
          449,
          500
        ]
      }
    ],
    "pinned": [
      0,
      1216,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "platform",
        "point": [
          562,
          430
        ]
      },
      "head": {
        "bone": "sensorReference",
        "point": [
          571,
          165
        ]
      },
      "toolFar": {
        "bone": "toolFarAnchor",
        "point": [
          127,
          378
        ]
      },
      "toolNear": {
        "bone": "toolNearAnchor",
        "point": [
          452,
          499
        ]
      },
      "supportFar": {
        "bone": "chassis",
        "point": [
          411,
          1361
        ]
      },
      "supportNear": {
        "bone": "chassis",
        "point": [
          882,
          1432
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "08f009f001fc07fefffefffefffe3ffe3ffe01fc11f803fc03fc07bc07dc079e079e078e138e238f0fc74fef4f0f000f"
    },
    "poses": {
      "intro": {
        "platform": 0.098,
        "sensorReference": -0.0
      },
      "restraint": {
        "platform": -0.105,
        "sensorReference": 0.0
      },
      "struggle": {
        "platform": -0.14,
        "sensorReference": 0.0
      },
      "release": {
        "platform": 0.056,
        "sensorReference": -0.0
      },
      "round-win": {
        "platform": 0.077,
        "sensorReference": 0
      },
      "round-loss": {
        "platform": -0.126,
        "sensorReference": -0.0
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "platform-robot",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Bombardier body and launcher form one rigid upper platform; native metal supports remain fixed.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "sensorReference",
      "degrees": 0.0,
      "radiansPerSecond": 5.0
    },
    "rigidDefaultBoneV165": "chassis",
    "rigidZonesV163": [
      {
        "bone": "platform",
        "polygon": [
          [
            9,
            47
          ],
          [
            1024,
            47
          ],
          [
            1024,
            832
          ],
          [
            42,
            647
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "supportFar",
      "supportNear"
    ],
    "supportRootBoneV165": "chassis",
    "articulatedRegionBoneV165": "platform"
  },
  {
    "id": "rig-v165-afe2-huntsman",
    "fighterId": "afe2-huntsman",
    "profileId": "pose-v113-afe2-huntsman",
    "path": "/assets/openai/sprites/static-game-v113/game-afe2-huntsman.png",
    "sourceFacing": -1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "fa9be46b17c1f80a98e4085cc1a749b3256bc4149de2028824042f4dcfbd05fc",
    "bones": [
      {
        "id": "chassis",
        "parent": null,
        "pivot": [
          793,
          593
        ],
        "tip": [
          793,
          607
        ]
      },
      {
        "id": "platform",
        "parent": "chassis",
        "pivot": [
          793,
          593
        ],
        "tip": [
          789,
          377
        ]
      },
      {
        "id": "sensorReference",
        "parent": "platform",
        "pivot": [
          619,
          386
        ],
        "tip": [
          556,
          394
        ]
      },
      {
        "id": "rearSupportFarAnchor",
        "parent": "chassis",
        "pivot": [
          606,
          779
        ],
        "tip": [
          606,
          793
        ]
      },
      {
        "id": "rearSupportNearAnchor",
        "parent": "chassis",
        "pivot": [
          1428,
          792
        ],
        "tip": [
          1428,
          806
        ]
      },
      {
        "id": "frontSupportFarAnchor",
        "parent": "chassis",
        "pivot": [
          191,
          817
        ],
        "tip": [
          191,
          831
        ]
      },
      {
        "id": "frontSupportNearAnchor",
        "parent": "chassis",
        "pivot": [
          1121,
          866
        ],
        "tip": [
          1121,
          880
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "platform",
        "point": [
          789,
          377
        ]
      },
      "head": {
        "bone": "sensorReference",
        "point": [
          556,
          394
        ]
      },
      "frontSupportFar": {
        "bone": "frontSupportFarAnchor",
        "point": [
          191,
          817
        ]
      },
      "frontSupportNear": {
        "bone": "frontSupportNearAnchor",
        "point": [
          1121,
          866
        ]
      },
      "rearSupportFar": {
        "bone": "chassis",
        "point": [
          606,
          779
        ]
      },
      "rearSupportNear": {
        "bone": "chassis",
        "point": [
          1428,
          792
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "00080800000110078018ffc003ffc00ffff8dffffcbffffc3ffffe7ffffe7879ef7671e7faf9eff801ff004df8380002"
    },
    "poses": {
      "intro": {
        "platform": 0.098,
        "sensorReference": -0.0
      },
      "restraint": {
        "platform": -0.105,
        "sensorReference": 0.0
      },
      "struggle": {
        "platform": -0.14,
        "sensorReference": 0.0
      },
      "release": {
        "platform": 0.056,
        "sensorReference": -0.0
      },
      "round-win": {
        "platform": 0.077,
        "sensorReference": 0
      },
      "round-loss": {
        "platform": -0.126,
        "sensorReference": -0.0
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "platform-robot",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Huntsman body/sensor assembly uses four native fixed support regions and no leg-cycle reconstruction.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "sensorReference",
      "degrees": 0.0,
      "radiansPerSecond": 5.1
    },
    "rigidDefaultBoneV165": "chassis",
    "rigidZonesV163": [
      {
        "bone": "platform",
        "polygon": [
          [
            403,
            158
          ],
          [
            1150,
            158
          ],
          [
            1212,
            551
          ],
          [
            390,
            622
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "rearSupportFar",
      "rearSupportNear",
      "frontSupportFar",
      "frontSupportNear"
    ],
    "supportRootBoneV165": "chassis",
    "articulatedRegionBoneV165": "platform"
  },
  {
    "id": "rig-v165-import-xeno-titan-queen-nolegs",
    "fighterId": "import-xeno-titan-queen-nolegs",
    "profileId": "pose-v113-import-xeno-titan-queen-nolegs",
    "path": "/assets/openai/sprites/static-import-v113/xeno-titan-queen-nolegs.png",
    "sourceFacing": -1,
    "sourceWidth": 1577,
    "sourceHeight": 997,
    "sourceSha256": "ff244cf0247560b68ec993e6a5c9471e24e7faa0e20d93776ccc392ee5e207de",
    "bones": [
      {
        "id": "abdomenBase",
        "parent": null,
        "pivot": [
          968,
          746
        ],
        "tip": [
          968,
          760
        ]
      },
      {
        "id": "thoracicStem",
        "parent": "abdomenBase",
        "pivot": [
          968,
          746
        ],
        "tip": [
          784,
          550
        ]
      },
      {
        "id": "cranialCage",
        "parent": "thoracicStem",
        "pivot": [
          635,
          464
        ],
        "tip": [
          546,
          426
        ]
      },
      {
        "id": "abdomenSupportFarAnchor",
        "parent": "abdomenBase",
        "pivot": [
          1070,
          852
        ],
        "tip": [
          1070,
          866
        ]
      },
      {
        "id": "abdomenSupportNearAnchor",
        "parent": "abdomenBase",
        "pivot": [
          1313,
          869
        ],
        "tip": [
          1313,
          883
        ]
      },
      {
        "id": "gripFarAnchor",
        "parent": "abdomenBase",
        "pivot": [
          445,
          806
        ],
        "tip": [
          458,
          820
        ]
      },
      {
        "id": "gripNearAnchor",
        "parent": "abdomenBase",
        "pivot": [
          614,
          852
        ],
        "tip": [
          614,
          866
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1577,
      997
    ],
    "contacts": {
      "chest": {
        "bone": "thoracicStem",
        "point": [
          784,
          550
        ]
      },
      "head": {
        "bone": "cranialCage",
        "point": [
          546,
          426
        ]
      },
      "handFar": {
        "bone": "gripFarAnchor",
        "point": [
          445,
          806
        ]
      },
      "handNear": {
        "bone": "gripNearAnchor",
        "point": [
          614,
          852
        ]
      },
      "abdomenSupportFar": {
        "bone": "abdomenBase",
        "point": [
          1070,
          852
        ]
      },
      "abdomenSupportNear": {
        "bone": "abdomenBase",
        "point": [
          1313,
          869
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 25,
      "rows": 16,
      "mask": "280018103f00003fff003fff823ffc841fff0c1fff7a0fff7e07bffff3dffdff9ffcfffffffffffff83ffff963fff6080104"
    },
    "poses": {
      "intro": {
        "thoracicStem": 0.126,
        "cranialCage": -0.72
      },
      "restraint": {
        "thoracicStem": -0.135,
        "cranialCage": 0.48
      },
      "struggle": {
        "thoracicStem": -0.18,
        "cranialCage": 0.84
      },
      "release": {
        "thoracicStem": 0.072,
        "cranialCage": -0.3
      },
      "round-win": {
        "thoracicStem": 0.099,
        "cranialCage": 0.6
      },
      "round-loss": {
        "thoracicStem": -0.162,
        "cranialCage": -0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "legless-body",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "The plate has a coiled abdomen and foreclaws, with no legs. Abdomen support contacts are named without inventing feet.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "cranialCage",
      "degrees": 0.12,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "abdomenSupportFar",
      "abdomenSupportNear"
    ],
    "supportRootBoneV165": "abdomenBase"
  },
  {
    "id": "rig-v165-synth-tecsek",
    "fighterId": "synth-tecsek",
    "profileId": "pose-v116-tecsek",
    "path": "/assets/openai/sprites/static-automaton-v116/tecsek.png",
    "sourceFacing": -1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "8fe28e660a999d6375efa9f9321da40499766fb127fb16589aa35a7107d83545",
    "bones": [
      {
        "id": "chassis",
        "parent": null,
        "pivot": [
          884,
          612
        ],
        "tip": [
          883,
          612
        ]
      },
      {
        "id": "platform",
        "parent": "chassis",
        "pivot": [
          884,
          612
        ],
        "tip": [
          851,
          386
        ]
      },
      {
        "id": "sensorReference",
        "parent": "platform",
        "pivot": [
          789,
          336
        ],
        "tip": [
          743,
          328
        ]
      },
      {
        "id": "supportFarAnchor",
        "parent": "chassis",
        "pivot": [
          648,
          945
        ],
        "tip": [
          646,
          956
        ]
      },
      {
        "id": "supportNearAnchor",
        "parent": "chassis",
        "pivot": [
          1125,
          949
        ],
        "tip": [
          1126,
          962
        ]
      },
      {
        "id": "toolFarAnchor",
        "parent": "chassis",
        "pivot": [
          602,
          531
        ],
        "tip": [
          602,
          545
        ]
      },
      {
        "id": "toolNearAnchor",
        "parent": "chassis",
        "pivot": [
          984,
          589
        ],
        "tip": [
          984,
          603
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "platform",
        "point": [
          851,
          386
        ]
      },
      "head": {
        "bone": "sensorReference",
        "point": [
          743,
          328
        ]
      },
      "toolFar": {
        "bone": "toolFarAnchor",
        "point": [
          602,
          531
        ]
      },
      "toolNear": {
        "bone": "toolNearAnchor",
        "point": [
          984,
          589
        ]
      },
      "supportFar": {
        "bone": "chassis",
        "point": [
          648,
          945
        ]
      },
      "supportNear": {
        "bone": "chassis",
        "point": [
          1125,
          949
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "007fc815ffea7bfff67ffff9ff7f9cf8fffd3bffce31ffce39ff8e3dffee1ff396477ffe02b9f402f8f045f9f048e1e0"
    },
    "poses": {
      "intro": {
        "platform": 0.098,
        "sensorReference": -0.0
      },
      "restraint": {
        "platform": -0.105,
        "sensorReference": 0.0
      },
      "struggle": {
        "platform": -0.14,
        "sensorReference": 0.0
      },
      "release": {
        "platform": 0.056,
        "sensorReference": -0.0
      },
      "round-win": {
        "platform": 0.077,
        "sensorReference": 0
      },
      "round-loss": {
        "platform": -0.126,
        "sensorReference": -0.0
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "platform-robot",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Tecsek rigid upper frame includes long scythes, with its two broad foot regions protected independently.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "sensorReference",
      "degrees": 0.0,
      "radiansPerSecond": 5.1
    },
    "rigidDefaultBoneV165": "chassis",
    "rigidZonesV163": [
      {
        "bone": "platform",
        "polygon": [
          [
            129,
            0
          ],
          [
            1279,
            0
          ],
          [
            1478,
            427
          ],
          [
            1474,
            891
          ],
          [
            1337,
            937
          ],
          [
            1362,
            522
          ],
          [
            1154,
            332
          ],
          [
            1125,
            622
          ],
          [
            697,
            626
          ],
          [
            685,
            415
          ],
          [
            411,
            427
          ],
          [
            170,
            696
          ],
          [
            129,
            605
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "supportFar",
      "supportNear"
    ],
    "supportRootBoneV165": "chassis",
    "articulatedRegionBoneV165": "platform",
    "staticProofRectsV165": [
      [
        536,
        871,
        785,
        1024
      ],
      [
        959,
        871,
        1254,
        1024
      ]
    ]
  },
  {
    "id": "rig-v165-synth-automated-powerloader",
    "fighterId": "synth-automated-powerloader",
    "profileId": "pose-v116-automated-powerloader",
    "path": "/assets/openai/sprites/static-automaton-v116/automated-powerloader.png",
    "sourceFacing": -1,
    "sourceWidth": 1226,
    "sourceHeight": 1283,
    "sourceSha256": "61fb2a0b6668e154ca41b50820c9875dcbfac68a1a08247cfa2005884e6d63a8",
    "bones": [
      {
        "id": "chassis",
        "parent": null,
        "pivot": [
          899,
          774
        ],
        "tip": [
          899,
          788
        ]
      },
      {
        "id": "platform",
        "parent": "chassis",
        "pivot": [
          899,
          774
        ],
        "tip": [
          867,
          434
        ]
      },
      {
        "id": "sensorReference",
        "parent": "platform",
        "pivot": [
          749,
          324
        ],
        "tip": [
          643,
          328
        ]
      },
      {
        "id": "supportFarAnchor",
        "parent": "chassis",
        "pivot": [
          576,
          1165
        ],
        "tip": [
          576,
          1179
        ]
      },
      {
        "id": "supportNearAnchor",
        "parent": "chassis",
        "pivot": [
          934,
          1165
        ],
        "tip": [
          934,
          1179
        ]
      },
      {
        "id": "toolFarAnchor",
        "parent": "chassis",
        "pivot": [
          280,
          654
        ],
        "tip": [
          280,
          668
        ]
      },
      {
        "id": "toolNearAnchor",
        "parent": "chassis",
        "pivot": [
          588,
          843
        ],
        "tip": [
          588,
          857
        ]
      }
    ],
    "pinned": [
      0,
      1024,
      1226,
      1283
    ],
    "contacts": {
      "chest": {
        "bone": "platform",
        "point": [
          867,
          434
        ]
      },
      "head": {
        "bone": "sensorReference",
        "point": [
          643,
          328
        ]
      },
      "toolFar": {
        "bone": "toolFarAnchor",
        "point": [
          280,
          654
        ]
      },
      "toolNear": {
        "bone": "toolNearAnchor",
        "point": [
          588,
          843
        ]
      },
      "supportFar": {
        "bone": "chassis",
        "point": [
          576,
          1165
        ]
      },
      "supportNear": {
        "bone": "chassis",
        "point": [
          934,
          1165
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 20,
      "rows": 21,
      "mask": "000d2000c0023fc19ffc01ffe41ffe0fffe4fffe7fffefffffdfffeffffcffff023ffa0fff806ffc00ff821ffe81ffc01dfc00080"
    },
    "poses": {
      "intro": {
        "platform": 0.098,
        "sensorReference": -0.0
      },
      "restraint": {
        "platform": -0.105,
        "sensorReference": 0.0
      },
      "struggle": {
        "platform": -0.14,
        "sensorReference": 0.0
      },
      "release": {
        "platform": 0.056,
        "sensorReference": -0.0
      },
      "round-win": {
        "platform": 0.077,
        "sensorReference": 0
      },
      "round-loss": {
        "platform": -0.126,
        "sensorReference": -0.0
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "platform-robot",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Powerloader cab, frame and forks are one tiny upper-body rigid platform, with no fabricated human head joint.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "sensorReference",
      "degrees": 0.0,
      "radiansPerSecond": 4.8999999999999995
    },
    "rigidDefaultBoneV165": "chassis",
    "rigidZonesV163": [
      {
        "bone": "platform",
        "polygon": [
          [
            0,
            16
          ],
          [
            1226,
            16
          ],
          [
            1226,
            928
          ],
          [
            221,
            963
          ],
          [
            0,
            801
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "supportFar",
      "supportNear"
    ],
    "supportRootBoneV165": "chassis",
    "articulatedRegionBoneV165": "platform"
  },
  {
    "id": "rig-v165-drive-v123-acm-boiler",
    "fighterId": "drive-v123-acm-boiler",
    "profileId": "pose-v123-drive-acm-boiler",
    "path": "/assets/user/drive-v123/enemies/acm-boiler.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "aa46ca7430e0a61d8387217b07393609e82e36f52eea48dd2c5278bf20af8109",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          919,
          576
        ],
        "tip": [
          919,
          590
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          919,
          576
        ],
        "tip": [
          1096,
          369
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1158,
          224
        ],
        "tip": [
          1262,
          191
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          888,
          970
        ],
        "tip": [
          888,
          984
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1108,
          970
        ],
        "tip": [
          1108,
          984
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1088,
          672
        ],
        "tip": [
          1088,
          686
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1254,
          645
        ],
        "tip": [
          1249,
          655
        ]
      }
    ],
    "pinned": [
      0,
      832,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1096,
          369
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1262,
          191
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1088,
          672
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1254,
          645
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          888,
          970
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1108,
          970
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "086ffe100ffff40ffff81ffe710fff62b3efec2ff0ff4ffaff5ffbfc7ffafffbfecffffe623ffe1eafbc607fe4010fe0"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Drive boiler has a narrow thorax and individually located dangling claw tips.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-acm-crusher",
    "fighterId": "drive-v123-acm-crusher",
    "profileId": "pose-v123-drive-acm-crusher",
    "path": "/assets/user/drive-v123/enemies/acm-crusher.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "7c4ec54415712f6ff0a03cda10d39c04b5114ae4fdf75f52fb5d46d2fb21db25",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          714,
          585
        ],
        "tip": [
          714,
          599
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          714,
          585
        ],
        "tip": [
          1129,
          543
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1283,
          477
        ],
        "tip": [
          1391,
          564
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          534,
          853
        ],
        "tip": [
          534,
          867
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          810,
          829
        ],
        "tip": [
          810,
          843
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1125,
          846
        ],
        "tip": [
          1125,
          860
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1337,
          837
        ],
        "tip": [
          1337,
          851
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1129,
          543
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1391,
          564
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1125,
          846
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1337,
          837
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          534,
          853
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          810,
          829
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "08302c102002000c62101e78415ffc001ffe041ffe007fff00ffff41ffffcffffffffff77fbffc03dffc33f4ec003a00"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Drive crusher source keeps the original four heavily armored support positions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-afe-burster",
    "fighterId": "drive-v123-afe-burster",
    "profileId": "pose-v123-drive-afe-burster",
    "path": "/assets/user/drive-v123/enemies/afe-burster.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "35387c3dd2b2f1ca1cc1e4d68fc2703b55c9fe8d4a5d50e621ecfec351a3f8bd",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          719,
          579
        ],
        "tip": [
          719,
          593
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          719,
          579
        ],
        "tip": [
          1100,
          539
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1258,
          419
        ],
        "tip": [
          1353,
          427
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          534,
          892
        ],
        "tip": [
          534,
          906
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          929,
          833
        ],
        "tip": [
          929,
          847
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1183,
          875
        ],
        "tip": [
          1183,
          889
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1353,
          813
        ],
        "tip": [
          1353,
          825
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1100,
          539
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1353,
          427
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1183,
          875
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1353,
          813
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          534,
          892
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          929,
          833
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "00081cfc0417ffa0e7dfee78bd64fe0e60ff00ffff03ffff83fff7005ff404fff709fff803fffe438ffe218ffc0201c0"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Drive burster retains the very high source tail and four low claw supports without a gait clip.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-afe-runner",
    "fighterId": "drive-v123-afe-runner",
    "profileId": "pose-v123-drive-afe-runner",
    "path": "/assets/user/drive-v123/enemies/afe-runner.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "c361545e0844989ed704d29b9549cbc3c28fc95fe847c65226777841c695ddfd",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          702,
          655
        ],
        "tip": [
          702,
          669
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          702,
          655
        ],
        "tip": [
          1100,
          638
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1224,
          461
        ],
        "tip": [
          1337,
          464
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          482,
          891
        ],
        "tip": [
          482,
          905
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          913,
          925
        ],
        "tip": [
          912,
          932
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1254,
          925
        ],
        "tip": [
          1254,
          930
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1436,
          879
        ],
        "tip": [
          1436,
          893
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1100,
          638
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1337,
          464
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1254,
          925
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1436,
          879
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          482,
          891
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          913,
          925
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "00068c063ffa10ffdcfff7817fde3ae6fa7fe43e7fffffffffffffbffffa3ffff973fdff0339ff07dfbf03df7f09155a"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Drive runner has a high dome and long forelimbs; individual support offsets are retained.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-afe-spitter",
    "fighterId": "drive-v123-afe-spitter",
    "profileId": "pose-v123-drive-afe-spitter",
    "path": "/assets/user/drive-v123/enemies/afe-spitter.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "74b67a559ce5f6fb7ed7a3ee4ffdcb31163027480ed0ca3cbad188a85355ddca",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          907,
          591
        ],
        "tip": [
          914,
          598
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          907,
          591
        ],
        "tip": [
          1133,
          406
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1258,
          236
        ],
        "tip": [
          1349,
          174
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          830,
          958
        ],
        "tip": [
          830,
          972
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1167,
          933
        ],
        "tip": [
          1167,
          947
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1237,
          614
        ],
        "tip": [
          1237,
          628
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1428,
          555
        ],
        "tip": [
          1435,
          561
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1133,
          406
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1349,
          174
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1237,
          614
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1428,
          555
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          830,
          958
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1167,
          933
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "7403f81003fe600ffffc2ffe9e0ffade0fff331fe2073ffe0e7fff0fffbf0fe7be021fb8011ffe071aea405efc080ef0"
    },
    "poses": {
      "intro": {
        "spine": -0.224,
        "head": 1.08
      },
      "restraint": {
        "spine": 0.24,
        "head": -0.72
      },
      "struggle": {
        "spine": 0.32,
        "head": -1.26
      },
      "release": {
        "spine": -0.128,
        "head": 0.45
      },
      "round-win": {
        "spine": -0.176,
        "head": -0.9
      },
      "round-loss": {
        "spine": 0.288,
        "head": 1.035
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Drive spitter retains the source long crest and measured forward claw positions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.18,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-comic-rogue-king",
    "fighterId": "drive-v123-comic-rogue-king",
    "profileId": "pose-v123-drive-comic-rogue-king",
    "path": "/assets/user/drive-v123/enemies/comic-rogue-king.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "2a68e0b0a65555a137ae813ee143cb7aa11301211e9bf91a5f7c69e0e68d7744",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          976,
          626
        ],
        "tip": [
          976,
          640
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          976,
          626
        ],
        "tip": [
          1104,
          427
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1279,
          332
        ],
        "tip": [
          1378,
          352
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          810,
          978
        ],
        "tip": [
          810,
          992
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1167,
          962
        ],
        "tip": [
          1167,
          976
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1142,
          804
        ],
        "tip": [
          1142,
          818
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1395,
          792
        ],
        "tip": [
          1395,
          806
        ]
      }
    ],
    "pinned": [
      0,
      832,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1104,
          427
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1378,
          352
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1142,
          804
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1395,
          792
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          810,
          978
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1167,
          962
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "001fff041fff001ffe101ffe003fff002fff043fff60dfff78fff777ffffff7ffffffffefffffedff9ff5bfefe6fbffa"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Large flat-colored rogue-king plate has its own crown cage; no new hidden limbs or source shading are drawn.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-creature-alien3-runner",
    "fighterId": "drive-v123-creature-alien3-runner",
    "profileId": "pose-v123-drive-creature-alien3-runner",
    "path": "/assets/user/drive-v123/enemies/creature-alien3-runner.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "5b98514567e4e9d2ed3bdd6b5182634907d2ef0e2c1cd2548d61fa5c1a75b3c6",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          747,
          448
        ],
        "tip": [
          747,
          462
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          747,
          448
        ],
        "tip": [
          1100,
          423
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1200,
          357
        ],
        "tip": [
          1382,
          357
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          530,
          818
        ],
        "tip": [
          530,
          832
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          747,
          821
        ],
        "tip": [
          747,
          835
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1167,
          829
        ],
        "tip": [
          1167,
          843
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1374,
          821
        ],
        "tip": [
          1374,
          835
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1100,
          423
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1382,
          357
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1167,
          829
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1374,
          821
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          530,
          818
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          747,
          821
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "00080c1010030029fe0205fe08ffff91ffff0dbfff7f3ff3f37df7d7fef7e7f27efff37e7bff7e87dffefdf0c00bfc74"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Drive Alien3 runner is measured from its own source rather than borrowing the other runner geometry.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-creature-aliens-queen-mobile",
    "fighterId": "drive-v123-creature-aliens-queen-mobile",
    "profileId": "pose-v123-drive-creature-aliens-queen-mobile",
    "path": "/assets/user/drive-v123/enemies/creature-aliens-queen-mobile.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "08a4647601a947d94a09b6723363ececdac41a1a4411119a2fc83e02a8996568",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          843,
          634
        ],
        "tip": [
          843,
          648
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          843,
          634
        ],
        "tip": [
          1071,
          431
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1233,
          328
        ],
        "tip": [
          1353,
          336
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          801,
          966
        ],
        "tip": [
          801,
          980
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1071,
          966
        ],
        "tip": [
          1071,
          980
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1189,
          660
        ],
        "tip": [
          1195,
          669
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1258,
          607
        ],
        "tip": [
          1258,
          621
        ]
      }
    ],
    "pinned": [
      0,
      832,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1071,
          431
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1353,
          336
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1189,
          660
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1258,
          607
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          801,
          966
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1071,
          966
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "003f88017fe0001ffc106ffc861ffebe3ffe782ff6706ff0603ff04cdff0667ff87afffa3fffb81fffb0605dc01fdff0"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Drive mobile queen has a very large dark crown and narrow individually measured toe supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-creature-prometheus-engineer-biosuit",
    "fighterId": "drive-v123-creature-prometheus-engineer-biosuit",
    "profileId": "pose-v123-drive-creature-prometheus-engineer-biosuit",
    "path": "/assets/user/drive-v123/enemies/creature-prometheus-engineer-biosuit.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "27e88b31e5a6089e8fc3f29030e60679adcd9f212a7c515b2baf1842f040c8b9",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          519,
          737
        ],
        "tip": [
          519,
          751
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          519,
          737
        ],
        "tip": [
          524,
          430
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          524,
          274
        ],
        "tip": [
          529,
          128
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          505,
          1437
        ],
        "tip": [
          505,
          1451
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          595,
          1441
        ],
        "tip": [
          595,
          1455
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          533,
          794
        ],
        "tip": [
          533,
          808
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          628,
          775
        ],
        "tip": [
          628,
          789
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          524,
          430
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          529,
          128
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          533,
          794
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          628,
          775
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          505,
          1437
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          595,
          1441
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "03c003c003c0238007c037c033d003c003c003c003c003e023e003c003c003c303821b8c03c01388038063e043e80bc0"
    },
    "poses": {
      "intro": {
        "spine": -0.175,
        "head": 0.9
      },
      "restraint": {
        "spine": 0.1875,
        "head": -0.6
      },
      "struggle": {
        "spine": 0.25,
        "head": -1.05
      },
      "release": {
        "spine": -0.1,
        "head": 0.375
      },
      "round-win": {
        "spine": -0.1375,
        "head": -0.75
      },
      "round-loss": {
        "spine": 0.225,
        "head": 0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "engineer",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Side-view Engineer biosuit retains its native long stature and close boot placement.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-fte-pathogen-popper-profile-v13",
    "fighterId": "drive-v123-fte-pathogen-popper-profile-v13",
    "profileId": "pose-v123-drive-fte-pathogen-popper-profile-v13",
    "path": "/assets/user/drive-v123/enemies/fte-pathogen-popper-profile-v13.png",
    "sourceFacing": 1,
    "sourceWidth": 1585,
    "sourceHeight": 992,
    "sourceSha256": "2814abceca3840aa8a9e57595369e29a10864350c40a6e0d65c4fa0e24cd9bea",
    "bones": [
      {
        "id": "supportBase",
        "parent": null,
        "pivot": [
          822,
          496
        ],
        "tip": [
          822,
          510
        ]
      },
      {
        "id": "sac",
        "parent": "supportBase",
        "pivot": [
          822,
          496
        ],
        "tip": [
          818,
          368
        ]
      },
      {
        "id": "oralRim",
        "parent": "sac",
        "pivot": [
          1182,
          428
        ],
        "tip": [
          1285,
          428
        ]
      },
      {
        "id": "rearSupportFarAnchor",
        "parent": "supportBase",
        "pivot": [
          266,
          868
        ],
        "tip": [
          266,
          882
        ]
      },
      {
        "id": "rearSupportNearAnchor",
        "parent": "supportBase",
        "pivot": [
          430,
          806
        ],
        "tip": [
          430,
          820
        ]
      },
      {
        "id": "frontSupportFarAnchor",
        "parent": "supportBase",
        "pivot": [
          1323,
          868
        ],
        "tip": [
          1323,
          882
        ]
      },
      {
        "id": "frontSupportNearAnchor",
        "parent": "supportBase",
        "pivot": [
          1384,
          859
        ],
        "tip": [
          1384,
          873
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1585,
      992
    ],
    "contacts": {
      "chest": {
        "bone": "sac",
        "point": [
          818,
          368
        ]
      },
      "head": {
        "bone": "oralRim",
        "point": [
          1285,
          428
        ]
      },
      "frontSupportFar": {
        "bone": "frontSupportFarAnchor",
        "point": [
          1323,
          868
        ]
      },
      "frontSupportNear": {
        "bone": "frontSupportNearAnchor",
        "point": [
          1384,
          859
        ]
      },
      "rearSupportFar": {
        "bone": "supportBase",
        "point": [
          266,
          868
        ]
      },
      "rearSupportNear": {
        "bone": "supportBase",
        "point": [
          430,
          806
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 25,
      "rows": 16,
      "mask": "000010007fc0047ff8007ffe003fff903ffff03ffff01ffff00ffff807bffc07f7de07ec2f03f37fc1f889f0ec8838000001"
    },
    "poses": {
      "intro": {
        "sac": -0.084,
        "oralRim": 0.42
      },
      "restraint": {
        "sac": 0.09,
        "oralRim": -0.28
      },
      "struggle": {
        "sac": 0.12,
        "oralRim": -0.49
      },
      "release": {
        "sac": -0.048,
        "oralRim": 0.175
      },
      "round-win": {
        "sac": -0.066,
        "oralRim": -0.35
      },
      "round-loss": {
        "sac": 0.108,
        "oralRim": 0.4025
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "sac-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Popper has a large sac and oral rim, not a humanoid skull; a small body/oral cage stays above four fixed supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "oralRim",
      "degrees": 0.07,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "rearSupportFar",
      "rearSupportNear",
      "frontSupportFar",
      "frontSupportNear"
    ],
    "supportRootBoneV165": "supportBase"
  },
  {
    "id": "rig-v165-drive-v123-fte-pathogen-queen-right-v13",
    "fighterId": "drive-v123-fte-pathogen-queen-right-v13",
    "profileId": "pose-v123-drive-fte-pathogen-queen-right-v13",
    "path": "/assets/user/drive-v123/enemies/fte-pathogen-queen-right-v13.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "fc89279a6f535760115052b5efd33935ab7ec4c4f974bdd865fbba6cda409827",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          996,
          543
        ],
        "tip": [
          996,
          557
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          996,
          543
        ],
        "tip": [
          1021,
          423
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1100,
          240
        ],
        "tip": [
          1299,
          249
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          859,
          929
        ],
        "tip": [
          859,
          943
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          1200,
          970
        ],
        "tip": [
          1200,
          984
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          656,
          514
        ],
        "tip": [
          656,
          528
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1333,
          655
        ],
        "tip": [
          1333,
          669
        ]
      }
    ],
    "pinned": [
      0,
      768,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1021,
          423
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1299,
          249
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          656,
          514
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1333,
          655
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          859,
          929
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1200,
          970
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "087fec003ff10407f8500ffc011ffc203ff8143ff6607ff8fd7fffff7fffffffff3ffeff3fffe217aefb01de76004e78"
    },
    "poses": {
      "intro": {
        "spine": -0.126,
        "head": 0.72
      },
      "restraint": {
        "spine": 0.135,
        "head": -0.48
      },
      "struggle": {
        "spine": 0.18,
        "head": -0.84
      },
      "release": {
        "spine": -0.072,
        "head": 0.3
      },
      "round-win": {
        "spine": -0.099,
        "head": -0.6
      },
      "round-loss": {
        "spine": 0.162,
        "head": 0.69
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "crowned-biped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Pathogen queen retains its broad crown and a separately protected carried organic region.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.12,
      "radiansPerSecond": 5.1
    },
    "rigidZonesV163": [
      {
        "bone": "hips",
        "polygon": [
          [
            1179,
            423
          ],
          [
            1536,
            468
          ],
          [
            1536,
            755
          ],
          [
            1216,
            742
          ]
        ]
      }
    ],
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-fte-pathogen-runner-nodules-v13",
    "fighterId": "drive-v123-fte-pathogen-runner-nodules-v13",
    "profileId": "pose-v123-drive-fte-pathogen-runner-nodules-v13",
    "path": "/assets/user/drive-v123/enemies/fte-pathogen-runner-nodules-v13.png",
    "sourceFacing": 1,
    "sourceWidth": 1672,
    "sourceHeight": 941,
    "sourceSha256": "4cdadb4fd4a9592c4015e931cf43593a40673eb55e068842a399f0db2a68732f",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          967,
          525
        ],
        "tip": [
          967,
          539
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          967,
          525
        ],
        "tip": [
          1297,
          489
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1405,
          430
        ],
        "tip": [
          1541,
          461
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          624,
          778
        ],
        "tip": [
          624,
          792
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          976,
          792
        ],
        "tip": [
          976,
          806
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1449,
          799
        ],
        "tip": [
          1449,
          813
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1559,
          774
        ],
        "tip": [
          1559,
          788
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1672,
      941
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1297,
          489
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1541,
          461
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1449,
          799
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1559,
          774
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          624,
          778
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          976,
          792
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 27,
      "rows": 15,
      "mask": "04306080201c018907e07000fe8f000ff1e83fff1ffffff3fffffe2dffffc03ffff903feff1277dfe00ffffd0cef9e90000000"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Nodular pathogen runner uses the individual low ribcage and four source claw regions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.3999999999999995
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-fte-pathogen-stalker-profile-v13",
    "fighterId": "drive-v123-fte-pathogen-stalker-profile-v13",
    "profileId": "pose-v123-drive-fte-pathogen-stalker-profile-v13",
    "path": "/assets/user/drive-v123/enemies/fte-pathogen-stalker-profile-v13.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "31d64b37d7e8321e968ec2c4765386d289020969dff101cb2e6ec066d3f8221b",
    "bones": [
      {
        "id": "contactBase",
        "parent": null,
        "pivot": [
          656,
          622
        ],
        "tip": [
          659,
          634
        ]
      },
      {
        "id": "bodyMass",
        "parent": "contactBase",
        "pivot": [
          656,
          622
        ],
        "tip": [
          805,
          551
        ]
      },
      {
        "id": "sensoryFront",
        "parent": "bodyMass",
        "pivot": [
          1000,
          618
        ],
        "tip": [
          1084,
          647
        ]
      },
      {
        "id": "frontSupportFarAnchor",
        "parent": "contactBase",
        "pivot": [
          988,
          916
        ],
        "tip": [
          988,
          930
        ]
      },
      {
        "id": "frontSupportNearAnchor",
        "parent": "contactBase",
        "pivot": [
          1220,
          891
        ],
        "tip": [
          1220,
          905
        ]
      },
      {
        "id": "rearSupportFarAnchor",
        "parent": "contactBase",
        "pivot": [
          181,
          903
        ],
        "tip": [
          178,
          904
        ]
      },
      {
        "id": "rearSupportNearAnchor",
        "parent": "contactBase",
        "pivot": [
          619,
          900
        ],
        "tip": [
          619,
          914
        ]
      },
      {
        "id": "raisedHookFar",
        "parent": "contactBase",
        "pivot": [
          448,
          149
        ],
        "tip": [
          448,
          163
        ]
      },
      {
        "id": "raisedHookNear",
        "parent": "contactBase",
        "pivot": [
          1105,
          224
        ],
        "tip": [
          1100,
          227
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "bodyMass",
        "point": [
          805,
          551
        ]
      },
      "head": {
        "bone": "sensoryFront",
        "point": [
          1084,
          647
        ]
      },
      "rearSupportFar": {
        "bone": "rearSupportFarAnchor",
        "point": [
          181,
          903
        ]
      },
      "rearSupportNear": {
        "bone": "rearSupportNearAnchor",
        "point": [
          619,
          900
        ]
      },
      "frontSupportFar": {
        "bone": "contactBase",
        "point": [
          988,
          916
        ]
      },
      "frontSupportNear": {
        "bone": "contactBase",
        "point": [
          1220,
          891
        ]
      },
      "raisedHookFar": {
        "bone": "raisedHookFar",
        "point": [
          448,
          149
        ]
      },
      "raisedHookNear": {
        "bone": "raisedHookNear",
        "point": [
          1105,
          224
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "05fb7c37fbfe07bfff1f97fc43bfb203ff6f07ffb127ffe02fffff6fffff1ffffffffffe7dffff7ff7fc7dfbfe3f739e"
    },
    "poses": {
      "intro": {
        "bodyMass": -0.084,
        "sensoryFront": 0.42
      },
      "restraint": {
        "bodyMass": 0.09,
        "sensoryFront": -0.28
      },
      "struggle": {
        "bodyMass": 0.12,
        "sensoryFront": -0.49
      },
      "release": {
        "bodyMass": -0.048,
        "sensoryFront": 0.175
      },
      "round-win": {
        "bodyMass": -0.066,
        "sensoryFront": -0.35
      },
      "round-loss": {
        "bodyMass": 0.108,
        "sensoryFront": 0.4025
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "sensory-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "The headless-looking stalker has a sensory front and six appendages; raised hooks are separately anchored, not converted to human arms.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "sensoryFront",
      "degrees": 0.07,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "frontSupportFar",
      "frontSupportNear",
      "rearSupportFar",
      "rearSupportNear"
    ],
    "supportRootBoneV165": "contactBase"
  },
  {
    "id": "rig-v165-drive-v123-kenner-gorilla",
    "fighterId": "drive-v123-kenner-gorilla",
    "profileId": "pose-v123-drive-kenner-gorilla",
    "path": "/assets/user/drive-v123/enemies/kenner-gorilla.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "262fbfcedf22db9973c99aa925c5b98bfeeffc57680efb61d7f66e917dff1602",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          880,
          618
        ],
        "tip": [
          880,
          632
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          880,
          618
        ],
        "tip": [
          1054,
          431
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1173,
          278
        ],
        "tip": [
          1266,
          240
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          689,
          895
        ],
        "tip": [
          689,
          909
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          913,
          954
        ],
        "tip": [
          913,
          968
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1210,
          864
        ],
        "tip": [
          1215,
          867
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1387,
          829
        ],
        "tip": [
          1387,
          843
        ]
      }
    ],
    "pinned": [
      0,
      640,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1054,
          431
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1266,
          240
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1210,
          864
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1387,
          829
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          689,
          895
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          913,
          954
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "081fc8043ffabc7ffcfc5ffffd9ffc7c5ff87c6fdb7e1fee6f3ffe707ffe3fffff3fffff80ff7f067e3f49fffe489fbe"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Drive gorilla has a high blue dome and long knuckle support regions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-neca-panther-kenner-tribute-v14",
    "fighterId": "drive-v123-neca-panther-kenner-tribute-v14",
    "profileId": "pose-v123-drive-neca-panther-kenner-tribute-v14",
    "path": "/assets/user/drive-v123/enemies/neca-panther-kenner-tribute-v14.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "e9656951a04ad058bcd17ee80a829e7c201f0067aa18341a9120fdfc89c52b52",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          685,
          659
        ],
        "tip": [
          685,
          673
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          685,
          659
        ],
        "tip": [
          1129,
          580
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1274,
          468
        ],
        "tip": [
          1407,
          510
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          228,
          862
        ],
        "tip": [
          228,
          876
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          606,
          891
        ],
        "tip": [
          606,
          905
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1166,
          941
        ],
        "tip": [
          1165,
          955
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1378,
          858
        ],
        "tip": [
          1378,
          872
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1129,
          580
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1407,
          510
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1166,
          941
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1378,
          858
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          228,
          862
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          606,
          891
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "1e0c0c7ffe00fbfe00d0fc70e4b8fefffbff7fffff1fffff1bffff3fffe31ff7f47ff7fe7ff3f97fe4fe3cf57f0061f8"
    },
    "poses": {
      "intro": {
        "spine": -0.168,
        "head": 0.78
      },
      "restraint": {
        "spine": 0.18,
        "head": -0.52
      },
      "struggle": {
        "spine": 0.24,
        "head": -0.91
      },
      "release": {
        "spine": -0.096,
        "head": 0.325
      },
      "round-win": {
        "spine": -0.132,
        "head": -0.65
      },
      "round-loss": {
        "spine": 0.216,
        "head": 0.7475
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Drive panther keeps the painted lifted forelimb support heights and curled tail; no full run is reconstructed.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.13,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-neca-rhino-kenner-orange-v14",
    "fighterId": "drive-v123-neca-rhino-kenner-orange-v14",
    "profileId": "pose-v123-drive-neca-rhino-kenner-orange-v14",
    "path": "/assets/user/drive-v123/enemies/neca-rhino-kenner-orange-v14.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "9b46647433f09dc4c0e9494396ab4773472c2e0e6933ad2096e22ae4aaf13b85",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          498,
          564
        ],
        "tip": [
          498,
          578
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          498,
          564
        ],
        "tip": [
          743,
          625
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          776,
          539
        ],
        "tip": [
          822,
          481
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          170,
          858
        ],
        "tip": [
          170,
          872
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          498,
          851
        ],
        "tip": [
          497,
          851
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          980,
          866
        ],
        "tip": [
          980,
          880
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1353,
          833
        ],
        "tip": [
          1353,
          847
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          743,
          625
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          822,
          481
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          980,
          866
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1353,
          833
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          170,
          858
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          498,
          851
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "000008005e40009fc8108ff407cff803fffa01fffc01fffe1fffff3fffd81ff9e03fbcf87f9f3fff9ffeff67fe031000"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Orange Kenner rhino source has long rigid-looking armor arcs and four individually located support regions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-neca-rhino-kenner-version2-blue-v14",
    "fighterId": "drive-v123-neca-rhino-kenner-version2-blue-v14",
    "profileId": "pose-v123-drive-neca-rhino-kenner-version2-blue-v14",
    "path": "/assets/user/drive-v123/enemies/neca-rhino-kenner-version2-blue-v14.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "bd955bec16dc7c4fb8d3502268109b02fa13efcc46ea76dbf83844958d6fcd91",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          691,
          471
        ],
        "tip": [
          691,
          485
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          691,
          471
        ],
        "tip": [
          980,
          490
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1110,
          429
        ],
        "tip": [
          1280,
          557
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          183,
          895
        ],
        "tip": [
          183,
          909
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          500,
          862
        ],
        "tip": [
          500,
          876
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          1071,
          887
        ],
        "tip": [
          1071,
          901
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          1291,
          906
        ],
        "tip": [
          1290,
          906
        ]
      }
    ],
    "pinned": [
      0,
      704,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          980,
          490
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1280,
          557
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          1071,
          887
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          1291,
          906
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          183,
          895
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          500,
          862
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "040808001b800377c007f7e451fff003fff803fffe01fffc7ffffe7fff9f3fdfb83f9fc87fcff2ffd3fcffc7fc0a00b8"
    },
    "poses": {
      "intro": {
        "spine": -0.119,
        "head": 0.6
      },
      "restraint": {
        "spine": 0.1275,
        "head": -0.4
      },
      "struggle": {
        "spine": 0.17,
        "head": -0.7
      },
      "release": {
        "spine": -0.068,
        "head": 0.25
      },
      "round-win": {
        "spine": -0.0935,
        "head": -0.5
      },
      "round-loss": {
        "spine": 0.153,
        "head": 0.575
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "armored-quadruped",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Blue rhino source is separately measured rather than mirroring the orange source metadata.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.1,
      "radiansPerSecond": 5.1
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear",
      "handFar",
      "handNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-neca-snake-series13-v14",
    "fighterId": "drive-v123-neca-snake-series13-v14",
    "profileId": "pose-v123-drive-neca-snake-series13-v14",
    "path": "/assets/user/drive-v123/enemies/neca-snake-series13-v14.png",
    "sourceFacing": 1,
    "sourceWidth": 1122,
    "sourceHeight": 1402,
    "sourceSha256": "3d2ffa2d4e41238b35f7f007f0490e195b54677b1dda1867106264acbe3fbb46",
    "bones": [
      {
        "id": "coilRoot",
        "parent": null,
        "pivot": [
          453,
          1129
        ],
        "tip": [
          452,
          1129
        ]
      },
      {
        "id": "vertebralStem",
        "parent": "coilRoot",
        "pivot": [
          453,
          1129
        ],
        "tip": [
          470,
          699
        ]
      },
      {
        "id": "cranialArc",
        "parent": "vertebralStem",
        "pivot": [
          587,
          388
        ],
        "tip": [
          708,
          367
        ]
      },
      {
        "id": "coilSupportFarAnchor",
        "parent": "coilRoot",
        "pivot": [
          272,
          1324
        ],
        "tip": [
          272,
          1338
        ]
      },
      {
        "id": "coilSupportNearAnchor",
        "parent": "coilRoot",
        "pivot": [
          634,
          1320
        ],
        "tip": [
          634,
          1334
        ]
      }
    ],
    "pinned": [
      0,
      1152,
      1122,
      1402
    ],
    "contacts": {
      "chest": {
        "bone": "vertebralStem",
        "point": [
          470,
          699
        ]
      },
      "head": {
        "bone": "cranialArc",
        "point": [
          708,
          367
        ]
      },
      "coilSupportFar": {
        "bone": "coilRoot",
        "point": [
          272,
          1324
        ]
      },
      "coilSupportNear": {
        "bone": "coilRoot",
        "point": [
          634,
          1320
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 18,
      "rows": 22,
      "mask": "0f8087f401ff001ff047f801fe207f823fc08fe003f8407e401f084fc901e602f9011e0057c5b0fe043f81ffc07fff8fff8"
    },
    "poses": {
      "intro": {
        "vertebralStem": -0.084,
        "cranialArc": 0.48
      },
      "restraint": {
        "vertebralStem": 0.09,
        "cranialArc": -0.32
      },
      "struggle": {
        "vertebralStem": 0.12,
        "cranialArc": -0.56
      },
      "release": {
        "vertebralStem": -0.048,
        "cranialArc": 0.2
      },
      "round-win": {
        "vertebralStem": -0.066,
        "cranialArc": -0.4
      },
      "round-loss": {
        "vertebralStem": 0.108,
        "cranialArc": 0.46
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "serpentine",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Legless Snake plate uses a coil base, vertebral stem and cranial arc. No hands, hips, feet or walk are reconstructed.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Named visible native support regions stay fixed. The legacy mesh API does not imply human hips, hands or feet. Hidden limbs, full walks and exact source-game anatomy are not reconstructed. Unpinned pixels keep nearest-bone weights outside explicit rigid regions.",
    "struggleOscillationV165": {
      "bone": "cranialArc",
      "degrees": 0.08,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "coilSupportFar",
      "coilSupportNear"
    ],
    "absentContactsV165": [
      "handFar",
      "handNear"
    ],
    "supportRootBoneV165": "coilRoot"
  },
  {
    "id": "rig-v165-drive-v123-game-working-joe-hazard",
    "fighterId": "drive-v123-game-working-joe-hazard",
    "profileId": "pose-v123-drive-game-working-joe-hazard",
    "path": "/assets/user/drive-v123/enemies/game-working-joe-hazard.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "15f264d12367d9bc3377839864ade8e9eb502126f16fc58bff832456ceec8b07",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          538,
          766
        ],
        "tip": [
          538,
          780
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          538,
          766
        ],
        "tip": [
          543,
          454
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          533,
          269
        ],
        "tip": [
          557,
          151
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          486,
          1441
        ],
        "tip": [
          486,
          1455
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          599,
          1418
        ],
        "tip": [
          599,
          1432
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          524,
          775
        ],
        "tip": [
          524,
          789
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          562,
          756
        ],
        "tip": [
          562,
          770
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          543,
          454
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          557,
          151
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          524,
          775
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          562,
          756
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          486,
          1441
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          599,
          1418
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "03c107c003c023c007c407d837d003c003c003c003c003e023c203e913c003c2238817bc07800794079827e043e803c0"
    },
    "poses": {
      "intro": {
        "spine": -0.182,
        "head": 0.9
      },
      "restraint": {
        "spine": 0.195,
        "head": -0.6
      },
      "struggle": {
        "spine": 0.26,
        "head": -1.05
      },
      "release": {
        "spine": -0.104,
        "head": 0.375
      },
      "round-win": {
        "spine": -0.143,
        "head": -0.75
      },
      "round-loss": {
        "spine": 0.234,
        "head": 0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Drive hazard Joe retains its side-profile suit and closely overlapping native boot supports.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-game-working-joe-standard",
    "fighterId": "drive-v123-game-working-joe-standard",
    "profileId": "pose-v123-drive-game-working-joe-standard",
    "path": "/assets/user/drive-v123/enemies/game-working-joe-standard.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "012742134db3e9844a9f3152cd5ef4bec5fd5fac26391a41aae75833a3503fc6",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          524,
          775
        ],
        "tip": [
          524,
          789
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          524,
          775
        ],
        "tip": [
          510,
          468
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          547,
          288
        ],
        "tip": [
          566,
          156
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          495,
          1456
        ],
        "tip": [
          495,
          1470
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          613,
          1418
        ],
        "tip": [
          613,
          1432
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          529,
          770
        ],
        "tip": [
          529,
          784
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          562,
          751
        ],
        "tip": [
          562,
          765
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          510,
          468
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          566,
          156
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          529,
          770
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          562,
          751
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          495,
          1456
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          613,
          1418
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "03c003c003c003c007c407c037c003c003c003c00be003c023c003e803c003c003c61f8417a0079007c023e043e803c0"
    },
    "poses": {
      "intro": {
        "spine": -0.182,
        "head": 0.9
      },
      "restraint": {
        "spine": 0.195,
        "head": -0.6
      },
      "struggle": {
        "spine": 0.26,
        "head": -1.05
      },
      "release": {
        "spine": -0.104,
        "head": 0.375
      },
      "round-win": {
        "spine": -0.143,
        "head": -0.75
      },
      "round-loss": {
        "spine": 0.234,
        "head": 0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Drive standard Joe retains the native straight profile and original limb lengths.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-prometheus-engineer-chair-suit-v16",
    "fighterId": "drive-v123-prometheus-engineer-chair-suit-v16",
    "profileId": "pose-v123-drive-prometheus-engineer-chair-suit-v16",
    "path": "/assets/user/drive-v123/enemies/prometheus-engineer-chair-suit-v16.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "8c39f9677bd34a97ff3e64e8189c9c31dcbea8b34d792f5372312d340d8da743",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          538,
          751
        ],
        "tip": [
          538,
          765
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          538,
          751
        ],
        "tip": [
          510,
          440
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          524,
          284
        ],
        "tip": [
          524,
          137
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          500,
          1446
        ],
        "tip": [
          500,
          1460
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          599,
          1441
        ],
        "tip": [
          599,
          1455
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          505,
          813
        ],
        "tip": [
          505,
          827
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          613,
          803
        ],
        "tip": [
          613,
          817
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          510,
          440
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          524,
          137
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          505,
          813
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          613,
          803
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          500,
          1446
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          599,
          1441
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "03c003e003e007e007e207e807e007e007e003e003e003e003e003e103c00fc307c81b8483880380039003e843e803e8"
    },
    "poses": {
      "intro": {
        "spine": -0.175,
        "head": 0.9
      },
      "restraint": {
        "spine": 0.1875,
        "head": -0.6
      },
      "struggle": {
        "spine": 0.25,
        "head": -1.05
      },
      "release": {
        "spine": -0.1,
        "head": 0.375
      },
      "round-win": {
        "spine": -0.1375,
        "head": -0.75
      },
      "round-loss": {
        "spine": 0.225,
        "head": 0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "engineer",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Full helmeted chair-suit source has its own native narrow profile and long lower support band.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  },
  {
    "id": "rig-v165-drive-v123-game-combat-synthetic-avp2",
    "fighterId": "drive-v123-game-combat-synthetic-avp2",
    "profileId": "pose-v123-drive-game-combat-synthetic-avp2",
    "path": "/assets/user/drive-v123/enemies/game-combat-synthetic-avp2.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "152450addbfcb4bdd7e8ec35c7c1f43a465d51056028551b26261090cb091ed6",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          514,
          718
        ],
        "tip": [
          514,
          732
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          514,
          718
        ],
        "tip": [
          529,
          411
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          562,
          260
        ],
        "tip": [
          571,
          165
        ]
      },
      {
        "id": "soleFar",
        "parent": "hips",
        "pivot": [
          462,
          1432
        ],
        "tip": [
          462,
          1446
        ]
      },
      {
        "id": "soleNear",
        "parent": "hips",
        "pivot": [
          590,
          1432
        ],
        "tip": [
          590,
          1446
        ]
      },
      {
        "id": "gripFar",
        "parent": "hips",
        "pivot": [
          458,
          770
        ],
        "tip": [
          458,
          784
        ]
      },
      {
        "id": "gripNear",
        "parent": "hips",
        "pivot": [
          562,
          799
        ],
        "tip": [
          562,
          813
        ]
      }
    ],
    "pinned": [
      0,
      1280,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          529,
          411
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          571,
          165
        ]
      },
      "handFar": {
        "bone": "gripFar",
        "point": [
          458,
          770
        ]
      },
      "handNear": {
        "bone": "gripNear",
        "point": [
          562,
          799
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          462,
          1432
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          590,
          1432
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "040009c001e003c007c407e017e017e003e00be803e003e003d203c903d003c303c837c487880f80439473c043e803c0"
    },
    "poses": {
      "intro": {
        "spine": -0.182,
        "head": 0.9
      },
      "restraint": {
        "spine": 0.195,
        "head": -0.6
      },
      "struggle": {
        "spine": 0.26,
        "head": -1.05
      },
      "release": {
        "spine": -0.104,
        "head": 0.375
      },
      "round-win": {
        "spine": -0.143,
        "head": -0.75
      },
      "round-loss": {
        "spine": 0.234,
        "head": 0.8625
      }
    },
    "presentationRevision": 165,
    "animation": "authored-native-supported-presentation-v165",
    "anatomyV165": "humanoid-synthetic",
    "evidence": "individually-viewed-and-authored-source-pixel-anchors-v165",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV165": "Drive combat synthetic retains its existing side-view body, tattoos and long measured limb proportions.",
    "occludedContactsV165": [],
    "supportPolicyV165": "Both visible foot regions remain fixed; grounded foreclaws are also fixed. Static sparse anchors do not reconstruct hidden joints or a gait. Unpinned robe/tail pixels still follow nearest-bone weights unless inside an explicit rigid region.",
    "struggleOscillationV165": {
      "bone": "head",
      "degrees": 0.15,
      "radiansPerSecond": 5.0
    },
    "referenceContactsV165": [
      "chest",
      "head"
    ],
    "supportContactsV165": [
      "footFar",
      "footNear"
    ]
  }
]);
