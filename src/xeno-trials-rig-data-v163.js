/**
 * Individually measured native source-pixel rigs. Small authored presentation
 * poses only: no source-game motion, hidden-limb reconstruction or full walk.
 * Exact image hashes, dimensions and facing gate admission in the renderer.
 */
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
export const XENO_TRIALS_RIG_DATA_V163 = freeze([
  {
    "id": "rig-v163-synth-trooper",
    "fighterId": "synth-trooper",
    "profileId": "pose-v94-afe-synth-trooper",
    "path": "/assets/openai/sprites/static-enemy-v94/game-afe-synth-trooper.png",
    "sourceFacing": -1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "524e20c5f99303a243baaa8e2e763f22e2bb983decc24d34e90ebb89c1260338",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          504,
          764
        ],
        "tip": [
          504,
          804
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          504,
          764
        ],
        "tip": [
          496,
          412
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          490,
          256
        ],
        "tip": [
          484,
          140
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          374,
          356
        ],
        "tip": [
          328,
          580
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          328,
          580
        ],
        "tip": [
          289,
          754
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          289,
          754
        ],
        "tip": [
          285,
          829
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          442,
          770
        ],
        "tip": [
          433,
          1025
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          433,
          1025
        ],
        "tip": [
          431,
          1375
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          431,
          1375
        ],
        "tip": [
          377,
          1431
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          665,
          364
        ],
        "tip": [
          727,
          568
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          727,
          568
        ],
        "tip": [
          714,
          756
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          714,
          756
        ],
        "tip": [
          704,
          830
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          581,
          770
        ],
        "tip": [
          636,
          1020
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          636,
          1020
        ],
        "tip": [
          696,
          1392
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          696,
          1392
        ],
        "tip": [
          696,
          1474
        ]
      }
    ],
    "pinned": [
      0,
      880,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          496,
          412
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          484,
          140
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          289,
          754
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          377,
          1431
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          714,
          756
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          696,
          1474
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "00000380138003d007e007f007f00ff00ff80ff80ff81ff81ff01ff11fe01ff11ff01ff43ff03bf0b3f007b05fb00070"
    },
    "poses": {
      "intro": {
        "spine": -0.8,
        "head": 1.8
      },
      "restraint": {
        "spine": 1.1,
        "head": -1.6
      },
      "struggle": {
        "spine": 1.4,
        "head": -2.2
      },
      "release": {
        "spine": -0.4,
        "head": 0.8
      },
      "round-win": {
        "spine": 0.7,
        "head": 1.5
      },
      "round-loss": {
        "spine": -0.9,
        "head": -1.9
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "armored-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Rifle hangs outside the left thigh. The carried hand/rifle polygon follows the torso; both boots stay fixed.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed.",
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            267,
            631
          ],
          [
            365,
            625
          ],
          [
            321,
            1060
          ],
          [
            271,
            1296
          ],
          [
            183,
            1296
          ],
          [
            211,
            1122
          ]
        ]
      }
    ]
  },
  {
    "id": "rig-v163-synth-guard",
    "fighterId": "synth-guard",
    "profileId": "pose-v94-afe-synth-guard",
    "path": "/assets/openai/sprites/static-enemy-v94/game-afe-synth-guard.png",
    "sourceFacing": -1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "b0d36997b4ea3ddc7816bd1738b89de239fc441707611de8cbcf6333d6523c05",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          522,
          775
        ],
        "tip": [
          522,
          815
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          522,
          775
        ],
        "tip": [
          527,
          360
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          526,
          262
        ],
        "tip": [
          521,
          151
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          360,
          358
        ],
        "tip": [
          291,
          549
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          291,
          549
        ],
        "tip": [
          396,
          536
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          396,
          536
        ],
        "tip": [
          440,
          524
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          452,
          780
        ],
        "tip": [
          410,
          1053
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          410,
          1053
        ],
        "tip": [
          379,
          1390
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          379,
          1390
        ],
        "tip": [
          351,
          1467
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          689,
          359
        ],
        "tip": [
          790,
          513
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          790,
          513
        ],
        "tip": [
          675,
          539
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          675,
          539
        ],
        "tip": [
          617,
          542
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          588,
          780
        ],
        "tip": [
          642,
          1045
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          642,
          1045
        ],
        "tip": [
          613,
          1390
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          613,
          1390
        ],
        "tip": [
          676,
          1456
        ]
      }
    ],
    "pinned": [
      0,
      790,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          527,
          360
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          521,
          151
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          396,
          536
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          351,
          1467
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          675,
          539
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          676,
          1456
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "000001c009c007e04ff40ff83ff83ffc3ffc1ff807e007e007e007e107f017f20ff00ff28fe00ee006e206e00ef80e70"
    },
    "poses": {
      "intro": {
        "spine": -0.8,
        "head": 1.8
      },
      "restraint": {
        "spine": 1.1,
        "head": -1.6
      },
      "struggle": {
        "spine": 1.4,
        "head": -2.2
      },
      "release": {
        "spine": -0.4,
        "head": 0.8
      },
      "round-win": {
        "spine": 0.7,
        "head": 1.5
      },
      "round-loss": {
        "spine": -0.9,
        "head": -1.9
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "armed-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Horizontal two-hand gun and both hand contacts are carried as one rigid assembly; no independently bent wrists.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed.",
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            140,
            421
          ],
          [
            459,
            376
          ],
          [
            785,
            397
          ],
          [
            821,
            501
          ],
          [
            702,
            594
          ],
          [
            535,
            614
          ],
          [
            450,
            566
          ],
          [
            216,
            610
          ],
          [
            140,
            527
          ]
        ]
      }
    ]
  },
  {
    "id": "rig-v163-synth-sniper",
    "fighterId": "synth-sniper",
    "profileId": "pose-v94-afe-synth-sniper",
    "path": "/assets/openai/sprites/static-enemy-v94/game-afe-synth-sniper.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "6541a21be18321c71b2e8e2a8b76f5ac7e58581babe5e190a3dcde6247f5977b",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          525,
          784
        ],
        "tip": [
          525,
          824
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          525,
          784
        ],
        "tip": [
          511,
          457
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          523,
          283
        ],
        "tip": [
          530,
          173
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          377,
          366
        ],
        "tip": [
          243,
          414
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          243,
          414
        ],
        "tip": [
          324,
          244
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          324,
          244
        ],
        "tip": [
          356,
          192
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          448,
          786
        ],
        "tip": [
          408,
          1064
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          408,
          1064
        ],
        "tip": [
          417,
          1396
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          417,
          1396
        ],
        "tip": [
          340,
          1441
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          692,
          398
        ],
        "tip": [
          768,
          601
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          768,
          601
        ],
        "tip": [
          809,
          800
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          809,
          800
        ],
        "tip": [
          802,
          871
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          601,
          786
        ],
        "tip": [
          664,
          1055
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          664,
          1055
        ],
        "tip": [
          754,
          1402
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          754,
          1402
        ],
        "tip": [
          771,
          1481
        ]
      }
    ],
    "pinned": [
      0,
      825,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          511,
          457
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          530,
          173
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          324,
          244
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          340,
          1441
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          809,
          800
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          771,
          1481
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "060007c00fc00fc01fe01ff03ff83ff813f803fc07fc07fc07fc07fc07fc07f02778077807780738077807787f581e58"
    },
    "poses": {
      "intro": {
        "spine": 0.8,
        "head": -1.8
      },
      "restraint": {
        "spine": -1.1,
        "head": 1.6
      },
      "struggle": {
        "spine": -1.4,
        "head": 2.2
      },
      "release": {
        "spine": 0.4,
        "head": -0.8
      },
      "round-win": {
        "spine": -0.7,
        "head": -1.5
      },
      "round-loss": {
        "spine": 0.9,
        "head": 1.9
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "armed-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Raised pistol and its gripping hand are locked together; lower body stays in the source stance.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed.",
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            273,
            155
          ],
          [
            355,
            114
          ],
          [
            397,
            22
          ],
          [
            452,
            31
          ],
          [
            420,
            204
          ],
          [
            388,
            269
          ],
          [
            303,
            279
          ]
        ]
      }
    ]
  },
  {
    "id": "rig-v163-synth-heavy",
    "fighterId": "synth-heavy",
    "profileId": "pose-v94-afe-synth-heavy",
    "path": "/assets/openai/sprites/static-enemy-v94/game-afe-synth-heavy.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "71a4ad45aafe454e33eb7a90a9f4574b59c731fe9406f19a5382987a6a9d5a4d",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          408,
          783
        ],
        "tip": [
          408,
          823
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          408,
          783
        ],
        "tip": [
          425,
          455
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          442,
          309
        ],
        "tip": [
          445,
          188
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          226,
          403
        ],
        "tip": [
          156,
          572
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          156,
          572
        ],
        "tip": [
          285,
          625
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          285,
          625
        ],
        "tip": [
          341,
          625
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          319,
          791
        ],
        "tip": [
          258,
          1062
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          258,
          1062
        ],
        "tip": [
          170,
          1387
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          170,
          1387
        ],
        "tip": [
          143,
          1437
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          558,
          376
        ],
        "tip": [
          599,
          337
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          599,
          337
        ],
        "tip": [
          572,
          326
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          572,
          326
        ],
        "tip": [
          571,
          306
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          493,
          791
        ],
        "tip": [
          625,
          1032
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          625,
          1032
        ],
        "tip": [
          691,
          1380
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          691,
          1380
        ],
        "tip": [
          751,
          1439
        ]
      }
    ],
    "pinned": [
      0,
      800,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          425,
          455
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          445,
          188
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          285,
          625
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          143,
          1437
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          572,
          326
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          751,
          1439
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "0033033f079f0fbf1ffe3ffd7ffa7ff07fe07fd27f807f805fca3fe03fe07df3bdf2fdf6fdf479f0f3f076f8f1f80cf0"
    },
    "poses": {
      "intro": {
        "spine": 0.8,
        "head": -1.8
      },
      "restraint": {
        "spine": -1.1,
        "head": 1.6
      },
      "struggle": {
        "spine": -1.4,
        "head": 2.2
      },
      "release": {
        "spine": 0.4,
        "head": -0.8
      },
      "round-win": {
        "spine": -0.7,
        "head": -1.5
      },
      "round-loss": {
        "spine": 0.9,
        "head": 1.9
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "armed-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Diagonal heavy gun, support hand and trigger hand share a rigid polygon; the head is excluded from that polygon.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed.",
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            259,
            699
          ],
          [
            418,
            540
          ],
          [
            729,
            218
          ],
          [
            938,
            49
          ],
          [
            1018,
            144
          ],
          [
            860,
            337
          ],
          [
            611,
            602
          ],
          [
            454,
            710
          ],
          [
            311,
            770
          ]
        ]
      }
    ]
  },
  {
    "id": "rig-v163-armored-joe",
    "fighterId": "armored-joe",
    "profileId": "enemy-145-armored-working-joe",
    "path": "/assets/openai/sprites/static-enemy-v96/armored-working-joe.png",
    "sourceFacing": 1,
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "sourceSha256": "e361bb35804e23c66a2b981375d3eff3b99361f684ba394ce93f6bf9c7d28210",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          531,
          787
        ],
        "tip": [
          531,
          827
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          531,
          787
        ],
        "tip": [
          513,
          478
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          539,
          314
        ],
        "tip": [
          541,
          201
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          426,
          395
        ],
        "tip": [
          380,
          595
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          380,
          595
        ],
        "tip": [
          404,
          786
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          404,
          786
        ],
        "tip": [
          420,
          843
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          464,
          788
        ],
        "tip": [
          465,
          1030
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          465,
          1030
        ],
        "tip": [
          423,
          1308
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          423,
          1308
        ],
        "tip": [
          460,
          1351
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          626,
          431
        ],
        "tip": [
          645,
          615
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          645,
          615
        ],
        "tip": [
          672,
          784
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          672,
          784
        ],
        "tip": [
          670,
          844
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          585,
          788
        ],
        "tip": [
          601,
          1013
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          601,
          1013
        ],
        "tip": [
          600,
          1277
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          600,
          1277
        ],
        "tip": [
          656,
          1310
        ]
      }
    ],
    "pinned": [
      0,
      884,
      1024,
      1536
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          513,
          478
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          541,
          201
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          404,
          786
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          460,
          1351
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          672,
          784
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          656,
          1310
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 16,
      "rows": 24,
      "mask": "0000000001c001c003c007c017c007e007e007e017e007e007f007f103e007e007e007e407c007e007f027e040400600"
    },
    "poses": {
      "intro": {
        "spine": 0.8,
        "head": -1.8
      },
      "restraint": {
        "spine": -1.1,
        "head": 1.6
      },
      "struggle": {
        "spine": -1.4,
        "head": 2.2
      },
      "release": {
        "spine": 0.4,
        "head": -0.8
      },
      "round-win": {
        "spine": -0.7,
        "head": -1.5
      },
      "round-loss": {
        "spine": 0.9,
        "head": 1.9
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "unarmed-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Separate visible forearms and legs; no hidden anatomical region is invented. Restrained poses keep the source feet planted.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed."
  },
  {
    "id": "rig-v163-combat-synth",
    "fighterId": "combat-synth",
    "profileId": "enemy-146-armored-combat-synthetic",
    "path": "/assets/openai/sprites/static-enemy-v96/armored-combat-synthetic.png",
    "sourceFacing": 1,
    "sourceWidth": 1205,
    "sourceHeight": 1306,
    "sourceSha256": "fb161cf728b2f8f4fa5f7ef7b894a7aed7a2f5cae79e122cbabc96ad2d4afd39",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          559,
          660
        ],
        "tip": [
          559,
          700
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          559,
          660
        ],
        "tip": [
          591,
          366
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          600,
          268
        ],
        "tip": [
          613,
          168
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          449,
          307
        ],
        "tip": [
          405,
          504
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          405,
          504
        ],
        "tip": [
          631,
          551
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          631,
          551
        ],
        "tip": [
          673,
          563
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          482,
          674
        ],
        "tip": [
          456,
          866
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          456,
          866
        ],
        "tip": [
          366,
          1148
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          366,
          1148
        ],
        "tip": [
          437,
          1198
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          699,
          344
        ],
        "tip": [
          736,
          470
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          736,
          470
        ],
        "tip": [
          852,
          573
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          852,
          573
        ],
        "tip": [
          872,
          594
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          645,
          683
        ],
        "tip": [
          676,
          870
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          676,
          870
        ],
        "tip": [
          724,
          1132
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          724,
          1132
        ],
        "tip": [
          833,
          1184
        ]
      }
    ],
    "pinned": [
      0,
      716,
      1205,
      1306
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          591,
          366
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          613,
          168
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          631,
          551
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          437,
          1198
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          852,
          573
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          833,
          1184
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 19,
      "rows": 21,
      "mask": "0008009c0007c001fb007f000fe001ff003ff807ff807ff00fe021f9803f800ff011fe013fc0073801e7803ef847c0000000"
    },
    "poses": {
      "intro": {
        "spine": 0.8,
        "head": -1.8
      },
      "restraint": {
        "spine": -1.1,
        "head": 1.6
      },
      "struggle": {
        "spine": -1.4,
        "head": 2.2
      },
      "release": {
        "spine": 0.4,
        "head": -0.8
      },
      "round-win": {
        "spine": -0.7,
        "head": -1.5
      },
      "round-loss": {
        "spine": 0.9,
        "head": 1.9
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "mechanical-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Mechanical joint centers and sole supports were measured on this 1205x1306 plate. Weapon and gripping fingers stay rigid.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed.",
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            593,
            437
          ],
          [
            836,
            428
          ],
          [
            1037,
            568
          ],
          [
            1016,
            608
          ],
          [
            926,
            613
          ],
          [
            816,
            659
          ],
          [
            710,
            651
          ],
          [
            614,
            602
          ]
        ]
      }
    ]
  },
  {
    "id": "rig-v163-import-engineer-armorsuit",
    "fighterId": "import-engineer-armorsuit",
    "profileId": "pose-v105-import-engineer-armorsuit",
    "path": "/assets/openai/sprites/static-import-v105/engineer-armorsuit.png",
    "sourceFacing": 1,
    "sourceWidth": 904,
    "sourceHeight": 1739,
    "sourceSha256": "8ec6c6e19885f2ff4f1a368d1944f01dce11423e62f59271fb03da9a528faddc",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          423,
          827
        ],
        "tip": [
          423,
          867
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          423,
          827
        ],
        "tip": [
          421,
          483
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          417,
          331
        ],
        "tip": [
          408,
          142
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          245,
          377
        ],
        "tip": [
          158,
          631
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          158,
          631
        ],
        "tip": [
          197,
          822
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          197,
          822
        ],
        "tip": [
          207,
          922
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          327,
          838
        ],
        "tip": [
          297,
          1192
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          297,
          1192
        ],
        "tip": [
          230,
          1597
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          230,
          1597
        ],
        "tip": [
          264,
          1661
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          552,
          442
        ],
        "tip": [
          574,
          637
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          574,
          637
        ],
        "tip": [
          637,
          828
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          637,
          828
        ],
        "tip": [
          647,
          923
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          498,
          838
        ],
        "tip": [
          512,
          1208
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          512,
          1208
        ],
        "tip": [
          514,
          1581
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          514,
          1581
        ],
        "tip": [
          601,
          1621
        ]
      }
    ],
    "pinned": [
      0,
      1000,
      904,
      1739
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          421,
          483
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          408,
          142
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          197,
          822
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          264,
          1661
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          637,
          828
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          601,
          1621
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 15,
      "rows": 28,
      "mask": "07081f883f83fc03fc07fd1ff01fe2ffc4ff81ff03ff07fe07fc0ff81ff01ff87f807f81fe03fcc7710ef91ffc3ff87fc0f1a4000"
    },
    "poses": {
      "intro": {
        "spine": 0.8,
        "head": -1.8
      },
      "restraint": {
        "spine": -1.1,
        "head": 1.6
      },
      "struggle": {
        "spine": -1.4,
        "head": 2.2
      },
      "release": {
        "spine": 0.4,
        "head": -0.8
      },
      "round-win": {
        "spine": -0.7,
        "head": -1.5
      },
      "round-loss": {
        "spine": 0.9,
        "head": 1.9
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "engineer-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Tall native 904x1739 biosuit; joints follow this exact silhouette rather than a 1024x1536 human template.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed."
  },
  {
    "id": "rig-v163-import-engineer-woman",
    "fighterId": "import-engineer-woman",
    "profileId": "pose-v106-import-engineer-woman",
    "path": "/assets/openai/sprites/static-import-v106/engineer-woman.png",
    "sourceFacing": 1,
    "sourceWidth": 1114,
    "sourceHeight": 1412,
    "sourceSha256": "1516ee07daa2d7378732e5935a6451f6debbde552311943522296d6a9af77da1",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          537,
          597
        ],
        "tip": [
          537,
          637
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          537,
          597
        ],
        "tip": [
          531,
          365
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          512,
          217
        ],
        "tip": [
          515,
          110
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          411,
          284
        ],
        "tip": [
          366,
          492
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          366,
          492
        ],
        "tip": [
          386,
          661
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          386,
          661
        ],
        "tip": [
          400,
          731
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          459,
          610
        ],
        "tip": [
          435,
          945
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          435,
          945
        ],
        "tip": [
          397,
          1266
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          397,
          1266
        ],
        "tip": [
          421,
          1337
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          607,
          304
        ],
        "tip": [
          630,
          481
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          630,
          481
        ],
        "tip": [
          674,
          657
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          674,
          657
        ],
        "tip": [
          686,
          724
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          600,
          610
        ],
        "tip": [
          628,
          942
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          628,
          942
        ],
        "tip": [
          669,
          1247
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          669,
          1247
        ],
        "tip": [
          737,
          1308
        ]
      }
    ],
    "pinned": [
      0,
      797,
      1114,
      1412
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          531,
          365
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          515,
          110
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          386,
          661
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          421,
          1337
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          674,
          657
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          737,
          1308
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 18,
      "rows": 23,
      "mask": "438000f0c03c481f0207c201f8007e481f8a67e001f8427e001fc027f100f8007e001f8247e011b806660219c047f809c6000000"
    },
    "poses": {
      "intro": {
        "spine": 0.8,
        "head": -1.8
      },
      "restraint": {
        "spine": -1.1,
        "head": 1.6
      },
      "struggle": {
        "spine": -1.4,
        "head": 2.2
      },
      "release": {
        "spine": 0.4,
        "head": -0.8
      },
      "round-win": {
        "spine": -0.7,
        "head": -1.5
      },
      "round-loss": {
        "spine": 0.9,
        "head": 1.9
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "engineer-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Hands end above the knees; the pelvis, knee plates and barefoot sole contacts are independently measured on the 1114x1412 plate.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed."
  },
  {
    "id": "rig-v163-import-wy-apesuit",
    "fighterId": "import-wy-apesuit",
    "profileId": "pose-v106-import-wy-apesuit",
    "path": "/assets/openai/sprites/static-import-v106/wy-apesuit.png",
    "sourceFacing": -1,
    "sourceWidth": 1102,
    "sourceHeight": 1427,
    "sourceSha256": "f5c943f4af8cfd9b3148774faafc1433f511b44f626857a2b803c51464d1bf24",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          548,
          688
        ],
        "tip": [
          548,
          728
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          548,
          688
        ],
        "tip": [
          544,
          401
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          539,
          272
        ],
        "tip": [
          536,
          142
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          438,
          352
        ],
        "tip": [
          417,
          532
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          417,
          532
        ],
        "tip": [
          407,
          708
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          407,
          708
        ],
        "tip": [
          407,
          761
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          485,
          700
        ],
        "tip": [
          482,
          1009
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          482,
          1009
        ],
        "tip": [
          485,
          1248
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          485,
          1248
        ],
        "tip": [
          421,
          1295
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          708,
          367
        ],
        "tip": [
          732,
          537
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          732,
          537
        ],
        "tip": [
          713,
          708
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          713,
          708
        ],
        "tip": [
          705,
          770
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          612,
          700
        ],
        "tip": [
          641,
          1010
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          641,
          1010
        ],
        "tip": [
          665,
          1291
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          665,
          1291
        ],
        "tip": [
          652,
          1347
        ]
      }
    ],
    "pinned": [
      0,
      840,
      1102,
      1427
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          544,
          401
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          536,
          142
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          407,
          708
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          421,
          1295
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          713,
          708
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          652,
          1347
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 18,
      "rows": 23,
      "mask": "21c000f0003e000fc403f101fc003f800fe003f809fe007f801fc007f000f8003f010fc423f000fc003f001fc207f0821c000000"
    },
    "poses": {
      "intro": {
        "spine": -0.8,
        "head": 1.8
      },
      "restraint": {
        "spine": 1.1,
        "head": -1.6
      },
      "struggle": {
        "spine": 1.4,
        "head": -2.2
      },
      "release": {
        "spine": -0.4,
        "head": 0.8
      },
      "round-win": {
        "spine": 0.7,
        "head": 1.5
      },
      "round-loss": {
        "spine": -0.9,
        "head": -1.9
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "human-suited-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Bulky garment silhouette stays attached to its own belt and collar. Measured boot supports preserve native stature.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed."
  },
  {
    "id": "rig-v163-warrior",
    "fighterId": "warrior",
    "profileId": "castes-film_warrior_aliens_1986",
    "path": "/assets/user/castes-v87/film_warrior_aliens_1986.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "c791a14045116531425d270c3edd61384b063d82a0bddf4e23195e9397ecb65f",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          1081,
          526
        ],
        "tip": [
          1081,
          566
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          1081,
          526
        ],
        "tip": [
          1127,
          358
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1181,
          221
        ],
        "tip": [
          1247,
          111
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          1078,
          265
        ],
        "tip": [
          952,
          409
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          952,
          409
        ],
        "tip": [
          1003,
          555
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          1003,
          555
        ],
        "tip": [
          1007,
          684
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          1057,
          548
        ],
        "tip": [
          1005,
          708
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          1005,
          708
        ],
        "tip": [
          851,
          875
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          851,
          875
        ],
        "tip": [
          879,
          979
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          1230,
          312
        ],
        "tip": [
          1256,
          439
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          1256,
          439
        ],
        "tip": [
          1360,
          554
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          1360,
          554
        ],
        "tip": [
          1407,
          635
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          1121,
          551
        ],
        "tip": [
          1260,
          697
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          1260,
          697
        ],
        "tip": [
          1167,
          894
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          1167,
          894
        ],
        "tip": [
          1271,
          968
        ]
      },
      {
        "id": "tail0",
        "parent": "hips",
        "pivot": [
          1037,
          529
        ],
        "tip": [
          829,
          681
        ]
      },
      {
        "id": "tail1",
        "parent": "tail0",
        "pivot": [
          829,
          681
        ],
        "tip": [
          597,
          810
        ]
      },
      {
        "id": "tail2",
        "parent": "tail1",
        "pivot": [
          597,
          810
        ],
        "tip": [
          321,
          829
        ]
      },
      {
        "id": "tail3",
        "parent": "tail2",
        "pivot": [
          321,
          829
        ],
        "tip": [
          131,
          722
        ]
      },
      {
        "id": "tail4",
        "parent": "tail3",
        "pivot": [
          131,
          722
        ],
        "tip": [
          100,
          552
        ]
      },
      {
        "id": "tail5",
        "parent": "tail4",
        "pivot": [
          100,
          552
        ],
        "tip": [
          201,
          445
        ]
      },
      {
        "id": "tail6",
        "parent": "tail5",
        "pivot": [
          201,
          445
        ],
        "tip": [
          322,
          418
        ]
      }
    ],
    "pinned": [
      0,
      740,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1127,
          358
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1247,
          111
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          1003,
          555
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          879,
          979
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          1360,
          554
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1271,
          968
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0801f80007fc1037fc1017fc4017fc0027f03f03f87803fc6da7fcee4ffe77ffff7afffe3ff7fe3fcefe7ffefc7fbf3e"
    },
    "poses": {
      "intro": {
        "spine": 0.8,
        "head": -1.8
      },
      "restraint": {
        "spine": -1.1,
        "head": 1.6
      },
      "struggle": {
        "spine": -1.4,
        "head": 2.2
      },
      "release": {
        "spine": 0.4,
        "head": -0.8
      },
      "round-win": {
        "spine": -0.7,
        "head": -1.5
      },
      "round-loss": {
        "spine": 0.9,
        "head": 1.9
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "xenomorph-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Digitigrade knees and hocks, long head and eight measured tail landmarks; no human skeleton is stretched onto this pose.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed."
  },
  {
    "id": "rig-v163-drive-v123-afe-prowler",
    "fighterId": "drive-v123-afe-prowler",
    "profileId": "pose-v123-drive-afe-prowler",
    "path": "/assets/user/drive-v123/enemies/afe-prowler.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "ec7d6be2ecdbf0b02a6b6148ead52338f483b8a8813d7cf7b2cea6f07f6d2d1f",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          763,
          606
        ],
        "tip": [
          763,
          646
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          763,
          606
        ],
        "tip": [
          1110,
          570
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1221,
          483
        ],
        "tip": [
          1364,
          519
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          1103,
          591
        ],
        "tip": [
          967,
          750
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          967,
          750
        ],
        "tip": [
          1119,
          926
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          1119,
          926
        ],
        "tip": [
          1161,
          954
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          718,
          614
        ],
        "tip": [
          466,
          708
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          466,
          708
        ],
        "tip": [
          389,
          852
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          389,
          852
        ],
        "tip": [
          447,
          932
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          1232,
          570
        ],
        "tip": [
          1240,
          752
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          1240,
          752
        ],
        "tip": [
          1360,
          881
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          1360,
          881
        ],
        "tip": [
          1424,
          917
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          815,
          623
        ],
        "tip": [
          895,
          703
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          895,
          703
        ],
        "tip": [
          748,
          799
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          748,
          799
        ],
        "tip": [
          859,
          892
        ]
      },
      {
        "id": "tail0",
        "parent": "hips",
        "pivot": [
          747,
          554
        ],
        "tip": [
          531,
          541
        ]
      },
      {
        "id": "tail1",
        "parent": "tail0",
        "pivot": [
          531,
          541
        ],
        "tip": [
          306,
          551
        ]
      },
      {
        "id": "tail2",
        "parent": "tail1",
        "pivot": [
          306,
          551
        ],
        "tip": [
          111,
          525
        ]
      },
      {
        "id": "tail3",
        "parent": "tail2",
        "pivot": [
          111,
          525
        ],
        "tip": [
          62,
          422
        ]
      },
      {
        "id": "tail4",
        "parent": "tail3",
        "pivot": [
          62,
          422
        ],
        "tip": [
          128,
          315
        ]
      },
      {
        "id": "tail5",
        "parent": "tail4",
        "pivot": [
          128,
          315
        ],
        "tip": [
          420,
          95
        ]
      },
      {
        "id": "tail6",
        "parent": "tail5",
        "pivot": [
          420,
          95
        ],
        "tip": [
          680,
          48
        ]
      }
    ],
    "pinned": [
      0,
      820,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1110,
          570
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1364,
          519
        ]
      },
      "handFar": {
        "bone": "hips",
        "point": [
          1119,
          926
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          447,
          932
        ]
      },
      "handNear": {
        "bone": "hips",
        "point": [
          1360,
          881
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          859,
          892
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "03f00c03f0508f82431e58807fb011f1f03ac27affffffff7fffffbfffffc7ffff73fff007fbbf071fdf479eff0b98fb"
    },
    "poses": {
      "intro": {
        "spine": 0.8,
        "head": -1.8
      },
      "restraint": {
        "spine": -1.1,
        "head": 1.6
      },
      "struggle": {
        "spine": -1.4,
        "head": 2.2
      },
      "release": {
        "spine": 0.4,
        "head": -0.8
      },
      "round-win": {
        "spine": -0.7,
        "head": -1.5
      },
      "round-loss": {
        "spine": 0.9,
        "head": 1.9
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "xenomorph-quadruped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Four visible supports measured on this distinct red Drive plate. Rear and front support names refer only to this art; no V154 Prowler contacts are copied.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed."
  },
  {
    "id": "rig-v163-drive-v123-creature-resurrection-newborn-v2",
    "fighterId": "drive-v123-creature-resurrection-newborn-v2",
    "profileId": "pose-v123-drive-creature-resurrection-newborn-v2",
    "path": "/assets/user/drive-v123/enemies/creature-resurrection-newborn-v2.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "60350fb7a6097a4986dea51b2b4211d6cddac065dc4df8753e22af3a244eb3fd",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          788,
          448
        ],
        "tip": [
          788,
          488
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          788,
          448
        ],
        "tip": [
          783,
          293
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          814,
          197
        ],
        "tip": [
          823,
          94
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          752,
          242
        ],
        "tip": [
          773,
          425
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          773,
          425
        ],
        "tip": [
          801,
          588
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          801,
          588
        ],
        "tip": [
          816,
          659
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          774,
          460
        ],
        "tip": [
          737,
          665
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          737,
          665
        ],
        "tip": [
          714,
          902
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          714,
          902
        ],
        "tip": [
          801,
          967
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          824,
          276
        ],
        "tip": [
          845,
          442
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          845,
          442
        ],
        "tip": [
          872,
          583
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          872,
          583
        ],
        "tip": [
          870,
          642
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          804,
          461
        ],
        "tip": [
          773,
          667
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          773,
          667
        ],
        "tip": [
          768,
          902
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          768,
          902
        ],
        "tip": [
          813,
          936
        ]
      }
    ],
    "pinned": [
      0,
      711,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          783,
          293
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          823,
          94
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          801,
          588
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          801,
          967
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          872,
          583
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          813,
          936
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "007c08007e00003e00003e00003c00003c08001c00001c00011c00201e00001e02023800003842003800403c00083c00"
    },
    "poses": {
      "intro": {
        "spine": 0.52,
        "head": -1.1700000000000002
      },
      "restraint": {
        "spine": -0.7150000000000001,
        "head": 1.04
      },
      "struggle": {
        "spine": -0.9099999999999999,
        "head": 1.4300000000000002
      },
      "release": {
        "spine": 0.26,
        "head": -0.52
      },
      "round-win": {
        "spine": -0.45499999999999996,
        "head": -0.9750000000000001
      },
      "round-loss": {
        "spine": 0.5850000000000001,
        "head": 1.2349999999999999
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "hybrid-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "The far limbs are partly occluded and remain in their native silhouette. Only the measured head and trunk receive small poses; this does not reconstruct a far-side walk.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed."
  },
  {
    "id": "rig-v163-drive-v123-creature-romulus-offspring",
    "fighterId": "drive-v123-creature-romulus-offspring",
    "profileId": "pose-v123-drive-creature-romulus-offspring",
    "path": "/assets/user/drive-v123/enemies/creature-romulus-offspring.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "56e0a9200983dff0591fdd3dd9bce0d48d70c7b6f69f9720166ed21186e60eaf",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          984,
          415
        ],
        "tip": [
          984,
          455
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          984,
          415
        ],
        "tip": [
          996,
          223
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1008,
          131
        ],
        "tip": [
          1005,
          56
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          966,
          188
        ],
        "tip": [
          962,
          357
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          962,
          357
        ],
        "tip": [
          1019,
          543
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          1019,
          543
        ],
        "tip": [
          1022,
          609
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          967,
          429
        ],
        "tip": [
          984,
          665
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          984,
          665
        ],
        "tip": [
          954,
          956
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          954,
          956
        ],
        "tip": [
          1019,
          994
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          1017,
          213
        ],
        "tip": [
          1039,
          388
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          1039,
          388
        ],
        "tip": [
          1072,
          565
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          1072,
          565
        ],
        "tip": [
          1070,
          635
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          1009,
          431
        ],
        "tip": [
          1000,
          662
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          1000,
          662
        ],
        "tip": [
          997,
          948
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          997,
          948
        ],
        "tip": [
          1053,
          972
        ]
      },
      {
        "id": "tail0",
        "parent": "hips",
        "pivot": [
          970,
          404
        ],
        "tip": [
          878,
          527
        ]
      },
      {
        "id": "tail1",
        "parent": "tail0",
        "pivot": [
          878,
          527
        ],
        "tip": [
          808,
          664
        ]
      },
      {
        "id": "tail2",
        "parent": "tail1",
        "pivot": [
          808,
          664
        ],
        "tip": [
          653,
          758
        ]
      },
      {
        "id": "tail3",
        "parent": "tail2",
        "pivot": [
          653,
          758
        ],
        "tip": [
          430,
          788
        ]
      },
      {
        "id": "tail4",
        "parent": "tail3",
        "pivot": [
          430,
          788
        ],
        "tip": [
          276,
          758
        ]
      },
      {
        "id": "tail5",
        "parent": "tail4",
        "pivot": [
          276,
          758
        ],
        "tip": [
          251,
          702
        ]
      },
      {
        "id": "tail6",
        "parent": "tail5",
        "pivot": [
          251,
          702
        ],
        "tip": [
          284,
          654
        ]
      }
    ],
    "pinned": [
      0,
      697,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          996,
          223
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1005,
          56
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          1019,
          543
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          1019,
          994
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          1072,
          565
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1053,
          972
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "00038c0003800003c0004380000380002388040782000780001780201fc01c5f821d7b980ff3420803004043800803c0"
    },
    "poses": {
      "intro": {
        "spine": 0.8,
        "head": -1.8
      },
      "restraint": {
        "spine": -1.1,
        "head": 1.6
      },
      "struggle": {
        "spine": -1.4,
        "head": 2.2
      },
      "release": {
        "spine": 0.4,
        "head": -0.8
      },
      "round-win": {
        "spine": -0.7,
        "head": -1.5
      },
      "round-loss": {
        "spine": 0.9,
        "head": 1.9
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "pathogen-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Very slender overlapping lower legs stay pinned. Tail landmarks follow the actual low arc; no unobserved rear-leg frame is invented.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed."
  },
  {
    "id": "rig-v163-drive-v123-fte-pathogen-brute-profile-v13",
    "fighterId": "drive-v123-fte-pathogen-brute-profile-v13",
    "profileId": "pose-v123-drive-fte-pathogen-brute-profile-v13",
    "path": "/assets/user/drive-v123/enemies/fte-pathogen-brute-profile-v13.png",
    "sourceFacing": 1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "88ecdfbbbf8cf6e64aa210a646174e1989f675794561b5c0198df857733e992a",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          949,
          533
        ],
        "tip": [
          949,
          573
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          949,
          533
        ],
        "tip": [
          1124,
          378
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          1282,
          364
        ],
        "tip": [
          1410,
          405
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          1117,
          374
        ],
        "tip": [
          968,
          507
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          968,
          507
        ],
        "tip": [
          1091,
          624
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          1091,
          624
        ],
        "tip": [
          1264,
          854
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          932,
          549
        ],
        "tip": [
          970,
          667
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          970,
          667
        ],
        "tip": [
          833,
          793
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          833,
          793
        ],
        "tip": [
          1006,
          951
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          1164,
          423
        ],
        "tip": [
          1065,
          545
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          1065,
          545
        ],
        "tip": [
          1196,
          673
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          1196,
          673
        ],
        "tip": [
          1292,
          898
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          974,
          552
        ],
        "tip": [
          1010,
          672
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          1010,
          672
        ],
        "tip": [
          904,
          790
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          904,
          790
        ],
        "tip": [
          1015,
          915
        ]
      },
      {
        "id": "tail0",
        "parent": "hips",
        "pivot": [
          920,
          471
        ],
        "tip": [
          727,
          543
        ]
      },
      {
        "id": "tail1",
        "parent": "tail0",
        "pivot": [
          727,
          543
        ],
        "tip": [
          477,
          601
        ]
      },
      {
        "id": "tail2",
        "parent": "tail1",
        "pivot": [
          477,
          601
        ],
        "tip": [
          236,
          609
        ]
      },
      {
        "id": "tail3",
        "parent": "tail2",
        "pivot": [
          236,
          609
        ],
        "tip": [
          78,
          526
        ]
      },
      {
        "id": "tail4",
        "parent": "tail3",
        "pivot": [
          78,
          526
        ],
        "tip": [
          81,
          444
        ]
      },
      {
        "id": "tail5",
        "parent": "tail4",
        "pivot": [
          81,
          444
        ],
        "tip": [
          226,
          397
        ]
      },
      {
        "id": "tail6",
        "parent": "tail5",
        "pivot": [
          226,
          397
        ],
        "tip": [
          322,
          402
        ]
      }
    ],
    "pinned": [
      0,
      693,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          1124,
          378
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          1410,
          405
        ]
      },
      "handFar": {
        "bone": "hand0",
        "point": [
          1091,
          624
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          1006,
          951
        ]
      },
      "handNear": {
        "bone": "hand1",
        "point": [
          1196,
          673
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          1015,
          915
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "00036c1007f20007f8000ffc050ffc903ffffc3fffc87fffffffe07fe7e80e57fd461ffe000ef8001ffc40cffc0803c0"
    },
    "poses": {
      "intro": {
        "spine": 0.52,
        "head": -1.1700000000000002
      },
      "restraint": {
        "spine": -0.7150000000000001,
        "head": 1.04
      },
      "struggle": {
        "spine": -0.9099999999999999,
        "head": 1.4300000000000002
      },
      "release": {
        "spine": 0.26,
        "head": -0.52
      },
      "round-win": {
        "spine": -0.45499999999999996,
        "head": -0.9750000000000001
      },
      "round-loss": {
        "spine": 0.5850000000000001,
        "head": 1.2349999999999999
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "pathogen-heavy-biped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Heavy forelimb/claw mass and dorsal spikes remain rigid with their own chest; lower supports stay at the observed hocks and soles.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed."
  },
  {
    "id": "rig-v163-synth-good-boy",
    "fighterId": "synth-good-boy",
    "profileId": "pose-v116-sunspot-good-boy",
    "path": "/assets/openai/sprites/static-automaton-v116/sunspot-good-boy.png",
    "sourceFacing": -1,
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "sourceSha256": "e8b138616c3599b8642a385af6bf53deedf2da3c52d6791a7b1918dc95a9b747",
    "bones": [
      {
        "id": "hips",
        "parent": null,
        "pivot": [
          1172,
          398
        ],
        "tip": [
          1172,
          438
        ]
      },
      {
        "id": "spine",
        "parent": "hips",
        "pivot": [
          1172,
          398
        ],
        "tip": [
          650,
          391
        ]
      },
      {
        "id": "head",
        "parent": "spine",
        "pivot": [
          404,
          255
        ],
        "tip": [
          197,
          237
        ]
      },
      {
        "id": "upper0",
        "parent": "spine",
        "pivot": [
          534,
          422
        ],
        "tip": [
          636,
          606
        ]
      },
      {
        "id": "fore0",
        "parent": "upper0",
        "pivot": [
          636,
          606
        ],
        "tip": [
          574,
          839
        ]
      },
      {
        "id": "hand0",
        "parent": "fore0",
        "pivot": [
          574,
          839
        ],
        "tip": [
          504,
          917
        ]
      },
      {
        "id": "thigh0",
        "parent": "hips",
        "pivot": [
          1131,
          446
        ],
        "tip": [
          1372,
          615
        ]
      },
      {
        "id": "shin0",
        "parent": "thigh0",
        "pivot": [
          1372,
          615
        ],
        "tip": [
          1388,
          832
        ]
      },
      {
        "id": "foot0",
        "parent": "shin0",
        "pivot": [
          1388,
          832
        ],
        "tip": [
          1311,
          889
        ]
      },
      {
        "id": "upper1",
        "parent": "spine",
        "pivot": [
          434,
          427
        ],
        "tip": [
          509,
          605
        ]
      },
      {
        "id": "fore1",
        "parent": "upper1",
        "pivot": [
          509,
          605
        ],
        "tip": [
          421,
          789
        ]
      },
      {
        "id": "hand1",
        "parent": "fore1",
        "pivot": [
          421,
          789
        ],
        "tip": [
          334,
          853
        ]
      },
      {
        "id": "thigh1",
        "parent": "hips",
        "pivot": [
          1082,
          450
        ],
        "tip": [
          1155,
          613
        ]
      },
      {
        "id": "shin1",
        "parent": "thigh1",
        "pivot": [
          1155,
          613
        ],
        "tip": [
          1052,
          789
        ]
      },
      {
        "id": "foot1",
        "parent": "shin1",
        "pivot": [
          1052,
          789
        ],
        "tip": [
          991,
          853
        ]
      }
    ],
    "pinned": [
      0,
      760,
      1536,
      1024
    ],
    "contacts": {
      "chest": {
        "bone": "spine",
        "point": [
          650,
          391
        ]
      },
      "head": {
        "bone": "head",
        "point": [
          197,
          237
        ]
      },
      "handFar": {
        "bone": "hips",
        "point": [
          574,
          839
        ]
      },
      "footFar": {
        "bone": "hips",
        "point": [
          1311,
          889
        ]
      },
      "handNear": {
        "bone": "hips",
        "point": [
          421,
          789
        ]
      },
      "footNear": {
        "bone": "hips",
        "point": [
          991,
          853
        ]
      }
    },
    "mesh": {
      "cell": 64,
      "cols": 24,
      "rows": 16,
      "mask": "0800081ff0403fffe07ffff87ffffdbffffc87fffd47fff903e5fc23e5fe03e4ee07fcec0fcbee3fdbfe43f83e401181"
    },
    "poses": {
      "intro": {
        "head": 1.26
      },
      "restraint": {
        "head": -1.1199999999999999
      },
      "struggle": {
        "head": -1.54
      },
      "release": {
        "head": 0.5599999999999999
      },
      "round-win": {
        "head": 1.0499999999999998
      },
      "round-loss": {
        "head": -1.3299999999999998
      }
    },
    "animation": "authored-native-upper-body-rig-v163",
    "anatomyV163": "mechanical-quadruped",
    "evidence": "individually-viewed-source-pixel-landmarks-v163",
    "referenceStatus": "project-art-adaptation-not-source-game-motion",
    "canonExact": false,
    "fullLocomotion": false,
    "captureSequenceAdmission": false,
    "notesV163": "Mechanical four-leg chassis: four native leg chains, sensor head and barrel/chassis region. No organic gait or flexing gun barrels is inferred.",
    "supportPolicyV163": "Native lower support band remains fixed; hidden limbs are not reconstructed.",
    "rigidZonesV163": [
      {
        "bone": "spine",
        "polygon": [
          [
            538,
            114
          ],
          [
            1184,
            130
          ],
          [
            1358,
            273
          ],
          [
            1393,
            435
          ],
          [
            1313,
            488
          ],
          [
            506,
            488
          ]
        ]
      }
    ]
  }
]);
