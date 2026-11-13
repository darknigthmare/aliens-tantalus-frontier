/** Four reviewed image_gen sheets: 40 drawn key poses.
 * Native plates remain unchanged; exact canon reconstruction and complete
 * locomotion/special choreography are not claimed. Alpha thresholds are
 * explicit because generated antialiasing includes faint alpha=1 dust. */
export const XENO_TRIALS_SPRITE_ATLAS_DATA_V188 = [
  {
    "fighterId": "warrior",
    "profileId": "castes-film_warrior_aliens_1986",
    "sourcePose": {
      "profileId": "castes-film_warrior_aliens_1986",
      "path": "/assets/user/castes-v87/film_warrior_aliens_1986.png",
      "sha256": "c791a14045116531425d270c3edd61384b063d82a0bddf4e23195e9397ecb65f",
      "width": 1536,
      "height": 1024,
      "facing": 1,
      "alphaBounds": [
        65,
        26,
        1465,
        1002
      ],
      "anatomy": "biped",
      "work": "Aliens (1986)"
    },
    "reviewStatus": "accepted-drawn-atlas",
    "identityVerified": true,
    "alphaVerified": true,
    "anchorsVerified": true,
    "wholeBodyVerified": true,
    "canonExact": false,
    "fullLocomotion": false,
    "fullProne": true,
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.0043560633014591565,
    "provenance": {
      "generation": "OpenAI image_gen; four identity-bound sheets, 10 separately drawn key poses each. See docs/forge/xeno-trials/sprite-production-v188.json.",
      "reference": "Existing fan-made-user-import plate; franchise reference and project adaptation remain distinct. No exact canon reconstruction is certified."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v188/warrior-combat-sheet.png",
      "sha256": "2ef7903a864d621f42d4720cf61483b7445141519a5752c36e39fb6418148e91",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 314,
    "frames": [
      {
        "id": "idle",
        "rect": [
          0,
          0,
          385,
          396
        ],
        "alphaBounds": [
          28,
          44,
          352,
          358
        ],
        "anchor": [
          254,
          358
        ],
        "supports": [
          [
            206,
            356
          ]
        ]
      },
      {
        "id": "walk-a",
        "rect": [
          385,
          0,
          398,
          396
        ],
        "alphaBounds": [
          34,
          46,
          373,
          355
        ],
        "anchor": [
          260,
          355
        ],
        "supports": [
          [
            171,
            352
          ],
          [
            322,
            351
          ]
        ]
      },
      {
        "id": "walk-b",
        "rect": [
          783,
          0,
          381,
          396
        ],
        "alphaBounds": [
          26,
          47,
          350,
          355
        ],
        "anchor": [
          262,
          355
        ],
        "supports": [
          [
            174,
            353
          ],
          [
            305,
            353
          ]
        ]
      },
      {
        "id": "attack-windup",
        "rect": [
          1164,
          0,
          397,
          396
        ],
        "alphaBounds": [
          37,
          56,
          368,
          357
        ],
        "anchor": [
          282,
          357
        ],
        "supports": [
          [
            183,
            355
          ],
          [
            314,
            353
          ]
        ]
      },
      {
        "id": "attack-impact",
        "rect": [
          1561,
          0,
          422,
          396
        ],
        "alphaBounds": [
          30,
          57,
          410,
          358
        ],
        "anchor": [
          284,
          358
        ],
        "supports": [
          [
            154,
            355
          ]
        ]
      },
      {
        "id": "attack-recovery",
        "rect": [
          0,
          396,
          380,
          397
        ],
        "alphaBounds": [
          25,
          55,
          355,
          353
        ],
        "anchor": [
          246,
          353
        ],
        "supports": [
          [
            168,
            350
          ],
          [
            298,
            349
          ]
        ]
      },
      {
        "id": "guard",
        "rect": [
          380,
          396,
          390,
          397
        ],
        "alphaBounds": [
          30,
          52,
          368,
          353
        ],
        "anchor": [
          260,
          353
        ],
        "supports": [
          [
            175,
            350
          ],
          [
            312,
            349
          ]
        ]
      },
      {
        "id": "hit-recoil",
        "rect": [
          770,
          396,
          376,
          397
        ],
        "alphaBounds": [
          23,
          29,
          349,
          353
        ],
        "anchor": [
          245,
          353
        ],
        "supports": [
          [
            212,
            351
          ],
          [
            292,
            349
          ]
        ]
      },
      {
        "id": "ko-fall",
        "rect": [
          1146,
          396,
          411,
          397
        ],
        "alphaBounds": [
          28,
          134,
          389,
          352
        ],
        "anchor": [
          218,
          352
        ],
        "supports": [
          [
            148,
            349
          ],
          [
            324,
            348
          ],
          [
            340,
            348
          ]
        ]
      },
      {
        "id": "ko-ground",
        "rect": [
          1557,
          396,
          426,
          397
        ],
        "alphaBounds": [
          22,
          214,
          401,
          350
        ],
        "anchor": [
          213,
          350
        ],
        "supports": [
          [
            93,
            347
          ],
          [
            132,
            346
          ]
        ]
      }
    ]
  },
  {
    "fighterId": "runner",
    "profileId": "castes-film_runner_alien3_1992",
    "sourcePose": {
      "profileId": "castes-film_runner_alien3_1992",
      "path": "/assets/user/castes-v87/film_runner_alien3_1992.png",
      "sha256": "f117c7ad0e6da9a02d3a4ce315066d75acfd67a909620f560ff6cd8c3d7b64b3",
      "width": 1536,
      "height": 1024,
      "facing": 1,
      "alphaBounds": [
        48,
        248,
        1510,
        841
      ],
      "anatomy": "quadruped",
      "work": "Alien 3 (1992)"
    },
    "reviewStatus": "accepted-drawn-atlas",
    "identityVerified": true,
    "alphaVerified": true,
    "anchorsVerified": true,
    "wholeBodyVerified": true,
    "canonExact": false,
    "fullLocomotion": false,
    "fullProne": true,
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.005993835603550961,
    "provenance": {
      "generation": "OpenAI image_gen; four identity-bound sheets, 10 separately drawn key poses each. See docs/forge/xeno-trials/sprite-production-v188.json.",
      "reference": "Existing fan-made-user-import plate; franchise reference and project adaptation remain distinct. No exact canon reconstruction is certified."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v188/runner-combat-sheet.png",
      "sha256": "3df7c0df3b7c7d4109d888c46ac1a9f2beffbe89b6fd8cf065e63abdba14ea74",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 172,
    "frames": [
      {
        "id": "idle",
        "rect": [
          0,
          0,
          410,
          396
        ],
        "alphaBounds": [
          22,
          142,
          393,
          314
        ],
        "anchor": [
          230,
          314
        ],
        "supports": [
          [
            124,
            311
          ],
          [
            140,
            310
          ],
          [
            292,
            310
          ],
          [
            304,
            310
          ]
        ]
      },
      {
        "id": "walk-a",
        "rect": [
          410,
          0,
          389,
          396
        ],
        "alphaBounds": [
          18,
          143,
          372,
          314
        ],
        "anchor": [
          220,
          314
        ],
        "supports": [
          [
            98,
            310
          ],
          [
            114,
            310
          ],
          [
            199,
            310
          ]
        ]
      },
      {
        "id": "walk-b",
        "rect": [
          799,
          0,
          378,
          396
        ],
        "alphaBounds": [
          10,
          141,
          361,
          314
        ],
        "anchor": [
          226,
          314
        ],
        "supports": [
          [
            88,
            310
          ],
          [
            105,
            310
          ]
        ]
      },
      {
        "id": "attack-windup",
        "rect": [
          1177,
          0,
          382,
          396
        ],
        "alphaBounds": [
          19,
          144,
          359,
          314
        ],
        "anchor": [
          238,
          314
        ],
        "supports": [
          [
            99,
            310
          ],
          [
            116,
            310
          ],
          [
            218,
            310
          ]
        ]
      },
      {
        "id": "attack-impact",
        "rect": [
          1559,
          0,
          424,
          396
        ],
        "alphaBounds": [
          22,
          143,
          403,
          314
        ],
        "anchor": [
          239,
          314
        ],
        "supports": [
          [
            105,
            310
          ],
          [
            121,
            310
          ],
          [
            210,
            310
          ]
        ]
      },
      {
        "id": "attack-recovery",
        "rect": [
          0,
          396,
          411,
          397
        ],
        "alphaBounds": [
          23,
          117,
          391,
          296
        ],
        "anchor": [
          230,
          296
        ],
        "supports": [
          [
            114,
            293
          ],
          [
            125,
            292
          ]
        ]
      },
      {
        "id": "guard",
        "rect": [
          411,
          396,
          381,
          397
        ],
        "alphaBounds": [
          23,
          125,
          357,
          296
        ],
        "anchor": [
          224,
          296
        ],
        "supports": [
          [
            103,
            292
          ]
        ]
      },
      {
        "id": "hit-recoil",
        "rect": [
          792,
          396,
          368,
          397
        ],
        "alphaBounds": [
          27,
          83,
          336,
          296
        ],
        "anchor": [
          182,
          296
        ],
        "supports": [
          [
            103,
            292
          ],
          [
            122,
            292
          ]
        ]
      },
      {
        "id": "ko-fall",
        "rect": [
          1160,
          396,
          409,
          397
        ],
        "alphaBounds": [
          32,
          172,
          394,
          296
        ],
        "anchor": [
          222,
          296
        ],
        "supports": [
          [
            110,
            292
          ],
          [
            126,
            292
          ]
        ]
      },
      {
        "id": "ko-ground",
        "rect": [
          1569,
          396,
          414,
          397
        ],
        "alphaBounds": [
          20,
          210,
          388,
          295
        ],
        "anchor": [
          190,
          295
        ],
        "supports": [
          [
            51,
            292
          ],
          [
            80,
            292
          ],
          [
            209,
            291
          ],
          [
            293,
            291
          ]
        ]
      }
    ]
  },
  {
    "fighterId": "prowler",
    "profileId": "castes-game_afe_prowler",
    "sourcePose": {
      "profileId": "castes-game_afe_prowler",
      "path": "/assets/user/castes-v87/game_afe_prowler.png",
      "sha256": "48edd1af2710048a065433b9e2c8dc20a03b05bc0a46a47394704f3a0c8bd544",
      "width": 1536,
      "height": 1024,
      "facing": 1,
      "alphaBounds": [
        38,
        10,
        1511,
        1011
      ],
      "anatomy": "quadruped",
      "work": "Aliens: Fireteam Elite (2021)"
    },
    "reviewStatus": "accepted-drawn-atlas",
    "identityVerified": true,
    "alphaVerified": true,
    "anchorsVerified": true,
    "wholeBodyVerified": true,
    "canonExact": false,
    "fullLocomotion": false,
    "fullProne": true,
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.004490760976840626,
    "provenance": {
      "generation": "OpenAI image_gen; four identity-bound sheets, 10 separately drawn key poses each. See docs/forge/xeno-trials/sprite-production-v188.json.",
      "reference": "Existing fan-made-user-import plate; franchise reference and project adaptation remain distinct. No exact canon reconstruction is certified."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v188/prowler-combat-sheet.png",
      "sha256": "602d78555ace3a5ed55a5ea35165fffa3689dba21fbd345d1956f53fc4b6bf35",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 259,
    "frames": [
      {
        "id": "idle",
        "rect": [
          0,
          0,
          393,
          396
        ],
        "alphaBounds": [
          33,
          71,
          360,
          330
        ],
        "anchor": [
          209,
          330
        ],
        "supports": [
          [
            79,
            327
          ],
          [
            192,
            326
          ],
          [
            251,
            328
          ],
          [
            269,
            326
          ]
        ]
      },
      {
        "id": "walk-a",
        "rect": [
          393,
          0,
          393,
          396
        ],
        "alphaBounds": [
          27,
          74,
          373,
          330
        ],
        "anchor": [
          218,
          330
        ],
        "supports": [
          [
            226,
            328
          ],
          [
            240,
            326
          ],
          [
            352,
            327
          ]
        ]
      },
      {
        "id": "walk-b",
        "rect": [
          786,
          0,
          389,
          396
        ],
        "alphaBounds": [
          20,
          74,
          365,
          329
        ],
        "anchor": [
          222,
          329
        ],
        "supports": [
          [
            191,
            325
          ],
          [
            203,
            327
          ],
          [
            215,
            325
          ],
          [
            220,
            326
          ]
        ]
      },
      {
        "id": "attack-windup",
        "rect": [
          1175,
          0,
          389,
          396
        ],
        "alphaBounds": [
          26,
          72,
          358,
          329
        ],
        "anchor": [
          226,
          329
        ],
        "supports": [
          [
            65,
            325
          ],
          [
            78,
            326
          ],
          [
            92,
            326
          ],
          [
            330,
            327
          ]
        ]
      },
      {
        "id": "attack-impact",
        "rect": [
          1564,
          0,
          419,
          396
        ],
        "alphaBounds": [
          31,
          72,
          400,
          329
        ],
        "anchor": [
          240,
          329
        ],
        "supports": [
          [
            50,
            326
          ],
          [
            85,
            327
          ],
          [
            100,
            326
          ],
          [
            264,
            327
          ]
        ]
      },
      {
        "id": "attack-recovery",
        "rect": [
          0,
          396,
          391,
          397
        ],
        "alphaBounds": [
          31,
          62,
          358,
          327
        ],
        "anchor": [
          205,
          327
        ],
        "supports": [
          [
            42,
            323
          ],
          [
            77,
            324
          ],
          [
            91,
            323
          ],
          [
            264,
            325
          ]
        ]
      },
      {
        "id": "guard",
        "rect": [
          391,
          396,
          388,
          397
        ],
        "alphaBounds": [
          37,
          62,
          363,
          327
        ],
        "anchor": [
          224,
          327
        ],
        "supports": [
          [
            41,
            323
          ],
          [
            75,
            325
          ],
          [
            89,
            323
          ],
          [
            258,
            325
          ]
        ]
      },
      {
        "id": "hit-recoil",
        "rect": [
          779,
          396,
          379,
          397
        ],
        "alphaBounds": [
          26,
          56,
          344,
          326
        ],
        "anchor": [
          184,
          326
        ],
        "supports": [
          [
            50,
            322
          ],
          [
            88,
            324
          ],
          [
            103,
            323
          ]
        ]
      },
      {
        "id": "ko-fall",
        "rect": [
          1158,
          396,
          405,
          397
        ],
        "alphaBounds": [
          34,
          125,
          385,
          327
        ],
        "anchor": [
          226,
          327
        ],
        "supports": [
          [
            80,
            323
          ],
          [
            119,
            323
          ],
          [
            282,
            324
          ],
          [
            363,
            324
          ]
        ]
      },
      {
        "id": "ko-ground",
        "rect": [
          1563,
          396,
          420,
          397
        ],
        "alphaBounds": [
          24,
          204,
          400,
          326
        ],
        "anchor": [
          193,
          326
        ],
        "supports": [
          [
            107,
            322
          ],
          [
            146,
            324
          ],
          [
            166,
            323
          ],
          [
            331,
            322
          ]
        ]
      }
    ]
  },
  {
    "fighterId": "spitter",
    "profileId": "castes-game_acm_spitter",
    "sourcePose": {
      "profileId": "castes-game_acm_spitter",
      "path": "/assets/user/castes-v87/game_acm_spitter.png",
      "sha256": "c281ad7c020999e2796af1c904be45c028bd8643e45bfc45b93edaf5ba4642c7",
      "width": 1536,
      "height": 1024,
      "facing": 1,
      "alphaBounds": [
        22,
        19,
        1510,
        1003
      ],
      "anatomy": "biped",
      "work": "Aliens: Colonial Marines (2013)"
    },
    "reviewStatus": "accepted-drawn-atlas",
    "identityVerified": true,
    "alphaVerified": true,
    "anchorsVerified": true,
    "wholeBodyVerified": true,
    "canonExact": false,
    "fullLocomotion": false,
    "fullProne": true,
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.007594973633364374,
    "provenance": {
      "generation": "OpenAI image_gen; four identity-bound sheets, 10 separately drawn key poses each. See docs/forge/xeno-trials/sprite-production-v188.json.",
      "reference": "Existing fan-made-user-import plate; franchise reference and project adaptation remain distinct. No exact canon reconstruction is certified."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v188/spitter-combat-sheet.png",
      "sha256": "e59450c2680221e2080682bd77c2c83352dd9d72125aa2f6bca27c8277a6f2b5",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 259,
    "frames": [
      {
        "id": "idle",
        "rect": [
          0,
          0,
          402,
          396
        ],
        "alphaBounds": [
          22,
          56,
          388,
          315
        ],
        "anchor": [
          252,
          315
        ],
        "supports": [
          [
            155,
            313
          ],
          [
            181,
            312
          ]
        ]
      },
      {
        "id": "walk-a",
        "rect": [
          402,
          0,
          398,
          396
        ],
        "alphaBounds": [
          19,
          56,
          384,
          315
        ],
        "anchor": [
          254,
          315
        ],
        "supports": [
          [
            154,
            311
          ],
          [
            288,
            312
          ]
        ]
      },
      {
        "id": "walk-b",
        "rect": [
          800,
          0,
          383,
          396
        ],
        "alphaBounds": [
          16,
          56,
          365,
          315
        ],
        "anchor": [
          246,
          315
        ],
        "supports": [
          [
            157,
            312
          ],
          [
            320,
            312
          ]
        ]
      },
      {
        "id": "attack-windup",
        "rect": [
          1183,
          0,
          386,
          396
        ],
        "alphaBounds": [
          13,
          54,
          369,
          315
        ],
        "anchor": [
          261,
          315
        ],
        "supports": [
          [
            141,
            313
          ],
          [
            162,
            312
          ]
        ]
      },
      {
        "id": "attack-impact",
        "rect": [
          1569,
          0,
          414,
          396
        ],
        "alphaBounds": [
          14,
          56,
          399,
          315
        ],
        "anchor": [
          273,
          315
        ],
        "supports": [
          [
            120,
            313
          ],
          [
            142,
            312
          ]
        ]
      },
      {
        "id": "attack-recovery",
        "rect": [
          0,
          396,
          405,
          397
        ],
        "alphaBounds": [
          17,
          49,
          388,
          316
        ],
        "anchor": [
          251,
          316
        ],
        "supports": [
          [
            144,
            314
          ],
          [
            168,
            313
          ]
        ]
      },
      {
        "id": "guard",
        "rect": [
          405,
          396,
          380,
          397
        ],
        "alphaBounds": [
          21,
          46,
          355,
          316
        ],
        "anchor": [
          245,
          316
        ],
        "supports": [
          [
            126,
            313
          ],
          [
            148,
            313
          ]
        ]
      },
      {
        "id": "hit-recoil",
        "rect": [
          785,
          396,
          376,
          397
        ],
        "alphaBounds": [
          30,
          45,
          344,
          316
        ],
        "anchor": [
          210,
          316
        ],
        "supports": [
          [
            155,
            313
          ],
          [
            179,
            313
          ]
        ]
      },
      {
        "id": "ko-fall",
        "rect": [
          1161,
          396,
          403,
          397
        ],
        "alphaBounds": [
          32,
          144,
          381,
          314
        ],
        "anchor": [
          212,
          314
        ],
        "supports": [
          [
            142,
            311
          ],
          [
            169,
            310
          ],
          [
            316,
            311
          ]
        ]
      },
      {
        "id": "ko-ground",
        "rect": [
          1564,
          396,
          419,
          397
        ],
        "alphaBounds": [
          18,
          193,
          400,
          313
        ],
        "anchor": [
          205,
          313
        ],
        "supports": [
          [
            86,
            311
          ]
        ]
      }
    ]
  }
];
