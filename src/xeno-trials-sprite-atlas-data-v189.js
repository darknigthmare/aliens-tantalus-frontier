/** Eight reviewed drawn motion/combat atlases: 80 new key poses.
 * Exact canon reconstruction and complete locomotion/movesets are not claimed.
 * All four V188 atlases and their 40 frames remain unchanged. */
export const XENO_TRIALS_SPRITE_ATLAS_DATA_V189 = [
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
    "kind": "motion",
    "reviewStatus": "accepted-drawn-atlas",
    "identityVerified": true,
    "alphaVerified": true,
    "anchorsVerified": true,
    "wholeBodyVerified": true,
    "canonExact": false,
    "fullLocomotion": false,
    "fullProne": false,
    "movementCoverage": "eight-step-loop-two-air-poses",
    "primaryAction": null,
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.0040775225639997454,
    "provenance": {
      "generation": "OpenAI image_gen; eight drawn walk phases and two air poses. See docs/forge/xeno-trials/sprite-motion-production-v189.json.",
      "reference": "Project fan-made source plate and unchanged V188 combat sheet; project identity coherence only, not certified franchise anatomy or full motion."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v189/warrior-motion-sheet.png",
      "sha256": "94427ecc53b8e4388b5af3a3ade4c41e017ff2b071e4f47623ee3f7888e6faf8",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 312,
    "frames": [
      {
        "id": "walk-0",
        "rect": [
          0,
          0,
          407,
          396
        ],
        "alphaBounds": [
          30,
          46,
          391,
          358
        ],
        "pelvis": [
          245,
          229
        ],
        "anchor": [
          245,
          358
        ],
        "supports": [
          [
            161,
            355
          ],
          [
            348,
            355
          ]
        ]
      },
      {
        "id": "walk-1",
        "rect": [
          407,
          0,
          364,
          396
        ],
        "alphaBounds": [
          18,
          66,
          326,
          358
        ],
        "pelvis": [
          232,
          247
        ],
        "anchor": [
          232,
          358
        ],
        "supports": [
          [
            285,
            356
          ]
        ]
      },
      {
        "id": "walk-2",
        "rect": [
          771,
          0,
          390,
          396
        ],
        "alphaBounds": [
          38,
          53,
          353,
          358
        ],
        "pelvis": [
          276,
          236
        ],
        "anchor": [
          276,
          358
        ],
        "supports": [
          [
            262,
            356
          ]
        ]
      },
      {
        "id": "walk-3",
        "rect": [
          1161,
          0,
          404,
          396
        ],
        "alphaBounds": [
          37,
          41,
          368,
          358
        ],
        "pelvis": [
          286,
          218
        ],
        "anchor": [
          286,
          358
        ],
        "supports": [
          [
            189,
            356
          ]
        ]
      },
      {
        "id": "walk-4",
        "rect": [
          1565,
          0,
          418,
          396
        ],
        "alphaBounds": [
          36,
          45,
          383,
          358
        ],
        "pelvis": [
          271,
          229
        ],
        "anchor": [
          271,
          358
        ],
        "supports": [
          [
            148,
            356
          ],
          [
            154,
            356
          ],
          [
            343,
            356
          ],
          [
            377,
            355
          ]
        ]
      },
      {
        "id": "walk-5",
        "rect": [
          0,
          396,
          379,
          397
        ],
        "alphaBounds": [
          31,
          60,
          338,
          358
        ],
        "pelvis": [
          230,
          237
        ],
        "anchor": [
          230,
          358
        ],
        "supports": [
          [
            257,
            356
          ]
        ]
      },
      {
        "id": "walk-6",
        "rect": [
          379,
          396,
          392,
          397
        ],
        "alphaBounds": [
          44,
          47,
          355,
          358
        ],
        "pelvis": [
          259,
          225
        ],
        "anchor": [
          259,
          358
        ],
        "supports": [
          [
            218,
            356
          ]
        ]
      },
      {
        "id": "walk-7",
        "rect": [
          771,
          396,
          406,
          397
        ],
        "alphaBounds": [
          37,
          44,
          371,
          358
        ],
        "pelvis": [
          267,
          232
        ],
        "anchor": [
          267,
          358
        ],
        "supports": [
          [
            171,
            355
          ]
        ]
      },
      {
        "id": "air-rise",
        "rect": [
          1177,
          396,
          407,
          397
        ],
        "alphaBounds": [
          37,
          24,
          380,
          311
        ],
        "pelvis": [
          258,
          189
        ],
        "anchor": [
          258,
          318
        ],
        "supports": []
      },
      {
        "id": "air-fall",
        "rect": [
          1584,
          396,
          399,
          397
        ],
        "alphaBounds": [
          27,
          60,
          371,
          349
        ],
        "pelvis": [
          261,
          232
        ],
        "anchor": [
          261,
          361
        ],
        "supports": []
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
    "kind": "motion",
    "reviewStatus": "accepted-drawn-atlas",
    "identityVerified": true,
    "alphaVerified": true,
    "anchorsVerified": true,
    "wholeBodyVerified": true,
    "canonExact": false,
    "fullLocomotion": false,
    "fullProne": false,
    "movementCoverage": "eight-step-loop-two-air-poses",
    "primaryAction": null,
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.004927433965897744,
    "provenance": {
      "generation": "OpenAI image_gen; eight drawn walk phases and two air poses. See docs/forge/xeno-trials/sprite-motion-production-v189.json.",
      "reference": "Project fan-made source plate and unchanged V188 combat sheet; project identity coherence only, not certified franchise anatomy or full motion."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v189/runner-motion-sheet.png",
      "sha256": "d065e3fa0dd3ba01b38e03c9a1c46cbb43472a58442988502c7cb0ffcb4038ef",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 163,
    "frames": [
      {
        "id": "walk-0",
        "rect": [
          0,
          0,
          411,
          396
        ],
        "alphaBounds": [
          29,
          138,
          382,
          301
        ],
        "pelvis": [
          224,
          216
        ],
        "anchor": [
          224,
          301
        ],
        "supports": [
          [
            123,
            299
          ],
          [
            267,
            299
          ]
        ]
      },
      {
        "id": "walk-1",
        "rect": [
          411,
          0,
          389,
          396
        ],
        "alphaBounds": [
          27,
          155,
          359,
          301
        ],
        "pelvis": [
          219,
          226
        ],
        "anchor": [
          219,
          301
        ],
        "supports": [
          [
            115,
            299
          ],
          [
            304,
            299
          ]
        ]
      },
      {
        "id": "walk-2",
        "rect": [
          800,
          0,
          387,
          396
        ],
        "alphaBounds": [
          31,
          145,
          355,
          302
        ],
        "pelvis": [
          227,
          219
        ],
        "anchor": [
          227,
          302
        ],
        "supports": [
          [
            135,
            300
          ],
          [
            152,
            298
          ],
          [
            221,
            299
          ],
          [
            239,
            298
          ]
        ]
      },
      {
        "id": "walk-3",
        "rect": [
          1187,
          0,
          389,
          396
        ],
        "alphaBounds": [
          32,
          139,
          361,
          301
        ],
        "pelvis": [
          241,
          216
        ],
        "anchor": [
          241,
          301
        ],
        "supports": [
          [
            109,
            297
          ],
          [
            191,
            299
          ],
          [
            355,
            297
          ]
        ]
      },
      {
        "id": "walk-4",
        "rect": [
          1576,
          0,
          407,
          396
        ],
        "alphaBounds": [
          31,
          136,
          372,
          301
        ],
        "pelvis": [
          249,
          217
        ],
        "anchor": [
          249,
          301
        ],
        "supports": [
          [
            103,
            299
          ],
          [
            298,
            299
          ]
        ]
      },
      {
        "id": "walk-5",
        "rect": [
          0,
          396,
          408,
          397
        ],
        "alphaBounds": [
          43,
          126,
          375,
          275
        ],
        "pelvis": [
          230,
          194
        ],
        "anchor": [
          230,
          275
        ],
        "supports": [
          [
            136,
            273
          ],
          [
            152,
            272
          ],
          [
            185,
            271
          ],
          [
            312,
            273
          ]
        ]
      },
      {
        "id": "walk-6",
        "rect": [
          408,
          396,
          389,
          397
        ],
        "alphaBounds": [
          38,
          128,
          361,
          275
        ],
        "pelvis": [
          225,
          196
        ],
        "anchor": [
          225,
          275
        ],
        "supports": [
          [
            215,
            273
          ],
          [
            233,
            272
          ]
        ]
      },
      {
        "id": "walk-7",
        "rect": [
          797,
          396,
          392,
          397
        ],
        "alphaBounds": [
          33,
          114,
          357,
          275
        ],
        "pelvis": [
          233,
          185
        ],
        "anchor": [
          233,
          275
        ],
        "supports": [
          [
            116,
            273
          ],
          [
            132,
            272
          ],
          [
            225,
            271
          ],
          [
            232,
            271
          ]
        ]
      },
      {
        "id": "air-rise",
        "rect": [
          1189,
          396,
          388,
          397
        ],
        "alphaBounds": [
          34,
          103,
          363,
          250
        ],
        "pelvis": [
          211,
          179
        ],
        "anchor": [
          211,
          264
        ],
        "supports": []
      },
      {
        "id": "air-fall",
        "rect": [
          1577,
          396,
          406,
          397
        ],
        "alphaBounds": [
          30,
          114,
          372,
          280
        ],
        "pelvis": [
          246,
          201
        ],
        "anchor": [
          246,
          286
        ],
        "supports": []
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
    "kind": "motion",
    "reviewStatus": "accepted-drawn-atlas",
    "identityVerified": true,
    "alphaVerified": true,
    "anchorsVerified": true,
    "wholeBodyVerified": true,
    "canonExact": false,
    "fullLocomotion": false,
    "fullProne": false,
    "movementCoverage": "eight-step-loop-two-air-poses",
    "primaryAction": null,
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.003815489391759532,
    "provenance": {
      "generation": "OpenAI image_gen; eight drawn walk phases and two air poses. See docs/forge/xeno-trials/sprite-motion-production-v189.json.",
      "reference": "Project fan-made source plate and unchanged V188 combat sheet; project identity coherence only, not certified franchise anatomy or full motion."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v189/prowler-motion-sheet.png",
      "sha256": "18a82319135b052a164606ce76699cd612deb7b78323a67c2bb10bfcb1b8c29e",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 253,
    "frames": [
      {
        "id": "walk-0",
        "rect": [
          0,
          0,
          396,
          396
        ],
        "alphaBounds": [
          27,
          77,
          370,
          330
        ],
        "pelvis": [
          207,
          216
        ],
        "anchor": [
          207,
          330
        ],
        "supports": [
          [
            49,
            326
          ],
          [
            62,
            327
          ],
          [
            274,
            326
          ],
          [
            295,
            327
          ]
        ]
      },
      {
        "id": "walk-1",
        "rect": [
          396,
          0,
          392,
          396
        ],
        "alphaBounds": [
          28,
          89,
          368,
          331
        ],
        "pelvis": [
          214,
          230
        ],
        "anchor": [
          214,
          331
        ],
        "supports": [
          [
            169,
            327
          ],
          [
            179,
            327
          ],
          [
            256,
            327
          ],
          [
            275,
            328
          ]
        ]
      },
      {
        "id": "walk-2",
        "rect": [
          788,
          0,
          394,
          396
        ],
        "alphaBounds": [
          25,
          79,
          367,
          329
        ],
        "pelvis": [
          217,
          222
        ],
        "anchor": [
          217,
          329
        ],
        "supports": [
          [
            149,
            325
          ],
          [
            169,
            326
          ],
          [
            191,
            326
          ],
          [
            270,
            325
          ]
        ]
      },
      {
        "id": "walk-3",
        "rect": [
          1182,
          0,
          390,
          396
        ],
        "alphaBounds": [
          25,
          77,
          361,
          329
        ],
        "pelvis": [
          223,
          216
        ],
        "anchor": [
          223,
          329
        ],
        "supports": [
          [
            53,
            326
          ],
          [
            175,
            325
          ],
          [
            332,
            325
          ],
          [
            344,
            327
          ]
        ]
      },
      {
        "id": "walk-4",
        "rect": [
          1572,
          0,
          411,
          396
        ],
        "alphaBounds": [
          29,
          78,
          385,
          330
        ],
        "pelvis": [
          236,
          216
        ],
        "anchor": [
          236,
          330
        ],
        "supports": [
          [
            38,
            327
          ],
          [
            59,
            326
          ],
          [
            74,
            328
          ],
          [
            363,
            327
          ]
        ]
      },
      {
        "id": "walk-5",
        "rect": [
          0,
          396,
          393,
          397
        ],
        "alphaBounds": [
          25,
          83,
          367,
          338
        ],
        "pelvis": [
          207,
          237
        ],
        "anchor": [
          207,
          338
        ],
        "supports": [
          [
            70,
            335
          ],
          [
            177,
            334
          ],
          [
            286,
            334
          ],
          [
            297,
            335
          ]
        ]
      },
      {
        "id": "walk-6",
        "rect": [
          393,
          396,
          382,
          397
        ],
        "alphaBounds": [
          26,
          86,
          359,
          339
        ],
        "pelvis": [
          207,
          239
        ],
        "anchor": [
          207,
          339
        ],
        "supports": [
          [
            59,
            335
          ],
          [
            179,
            335
          ],
          [
            235,
            336
          ],
          [
            247,
            336
          ]
        ]
      },
      {
        "id": "walk-7",
        "rect": [
          775,
          396,
          394,
          397
        ],
        "alphaBounds": [
          27,
          82,
          363,
          337
        ],
        "pelvis": [
          225,
          232
        ],
        "anchor": [
          225,
          337
        ],
        "supports": [
          [
            32,
            335
          ],
          [
            56,
            333
          ],
          [
            80,
            335
          ],
          [
            294,
            334
          ]
        ]
      },
      {
        "id": "air-rise",
        "rect": [
          1169,
          396,
          396,
          397
        ],
        "alphaBounds": [
          35,
          75,
          363,
          297
        ],
        "pelvis": [
          224,
          198
        ],
        "anchor": [
          224,
          312
        ],
        "supports": []
      },
      {
        "id": "air-fall",
        "rect": [
          1565,
          396,
          418,
          397
        ],
        "alphaBounds": [
          33,
          79,
          382,
          339
        ],
        "pelvis": [
          232,
          229
        ],
        "anchor": [
          232,
          343
        ],
        "supports": []
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
    "kind": "motion",
    "reviewStatus": "accepted-drawn-atlas",
    "identityVerified": true,
    "alphaVerified": true,
    "anchorsVerified": true,
    "wholeBodyVerified": true,
    "canonExact": false,
    "fullLocomotion": false,
    "fullProne": false,
    "movementCoverage": "eight-step-loop-two-air-poses",
    "primaryAction": null,
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.0053066321514114185,
    "provenance": {
      "generation": "OpenAI image_gen; eight drawn walk phases and two air poses. See docs/forge/xeno-trials/sprite-motion-production-v189.json.",
      "reference": "Project fan-made source plate and unchanged V188 combat sheet; project identity coherence only, not certified franchise anatomy or full motion."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v189/spitter-motion-sheet.png",
      "sha256": "f65d382f75147dc754a56bd207ff72026d88924af225b88dc7788de566213885",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 274,
    "frames": [
      {
        "id": "walk-0",
        "rect": [
          0,
          0,
          411,
          396
        ],
        "alphaBounds": [
          20,
          67,
          399,
          341
        ],
        "pelvis": [
          252,
          240
        ],
        "anchor": [
          252,
          341
        ],
        "supports": [
          [
            141,
            338
          ],
          [
            164,
            338
          ],
          [
            303,
            337
          ],
          [
            314,
            338
          ]
        ]
      },
      {
        "id": "walk-1",
        "rect": [
          411,
          0,
          389,
          396
        ],
        "alphaBounds": [
          10,
          81,
          378,
          342
        ],
        "pelvis": [
          236,
          255
        ],
        "anchor": [
          236,
          342
        ],
        "supports": [
          [
            230,
            338
          ],
          [
            263,
            339
          ],
          [
            295,
            338
          ]
        ]
      },
      {
        "id": "walk-2",
        "rect": [
          800,
          0,
          385,
          396
        ],
        "alphaBounds": [
          15,
          72,
          378,
          342
        ],
        "pelvis": [
          247,
          245
        ],
        "anchor": [
          247,
          342
        ],
        "supports": [
          [
            243,
            338
          ],
          [
            276,
            338
          ]
        ]
      },
      {
        "id": "walk-3",
        "rect": [
          1185,
          0,
          387,
          396
        ],
        "alphaBounds": [
          16,
          60,
          377,
          340
        ],
        "pelvis": [
          253,
          230
        ],
        "anchor": [
          253,
          340
        ],
        "supports": [
          [
            155,
            336
          ],
          [
            166,
            336
          ],
          [
            178,
            337
          ],
          [
            196,
            336
          ]
        ]
      },
      {
        "id": "walk-4",
        "rect": [
          1572,
          0,
          411,
          396
        ],
        "alphaBounds": [
          14,
          67,
          389,
          338
        ],
        "pelvis": [
          272,
          240
        ],
        "anchor": [
          272,
          338
        ],
        "supports": [
          [
            313,
            335
          ]
        ]
      },
      {
        "id": "walk-5",
        "rect": [
          0,
          396,
          402,
          397
        ],
        "alphaBounds": [
          20,
          67,
          384,
          334
        ],
        "pelvis": [
          249,
          240
        ],
        "anchor": [
          249,
          334
        ],
        "supports": [
          [
            284,
            331
          ],
          [
            304,
            330
          ]
        ]
      },
      {
        "id": "walk-6",
        "rect": [
          402,
          396,
          386,
          397
        ],
        "alphaBounds": [
          18,
          59,
          366,
          334
        ],
        "pelvis": [
          235,
          232
        ],
        "anchor": [
          235,
          334
        ],
        "supports": [
          [
            152,
            331
          ],
          [
            176,
            330
          ],
          [
            204,
            330
          ]
        ]
      },
      {
        "id": "walk-7",
        "rect": [
          788,
          396,
          382,
          397
        ],
        "alphaBounds": [
          18,
          52,
          359,
          331
        ],
        "pelvis": [
          250,
          233
        ],
        "anchor": [
          250,
          331
        ],
        "supports": [
          [
            141,
            328
          ],
          [
            158,
            327
          ]
        ]
      },
      {
        "id": "air-rise",
        "rect": [
          1170,
          396,
          402,
          397
        ],
        "alphaBounds": [
          23,
          41,
          392,
          280
        ],
        "pelvis": [
          265,
          199
        ],
        "anchor": [
          265,
          300
        ],
        "supports": []
      },
      {
        "id": "air-fall",
        "rect": [
          1572,
          396,
          411,
          397
        ],
        "alphaBounds": [
          17,
          62,
          389,
          327
        ],
        "pelvis": [
          277,
          228
        ],
        "anchor": [
          277,
          329
        ],
        "supports": []
      }
    ]
  },
  {
    "fighterId": "queen",
    "profileId": "castes-film_queen_aliens_1986",
    "sourcePose": {
      "profileId": "castes-film_queen_aliens_1986",
      "path": "/assets/user/castes-v87/film_queen_aliens_1986.png",
      "sha256": "985abf27db63400d8a6a68101bfaa7dde3335da0e8986ea85c409ab30da5e991",
      "width": 1536,
      "height": 1024,
      "facing": 1,
      "alphaBounds": [
        22,
        26,
        1525,
        999
      ],
      "anatomy": "crowned-biped",
      "work": "Aliens (1986)"
    },
    "kind": "combat",
    "reviewStatus": "accepted-drawn-atlas",
    "identityVerified": true,
    "alphaVerified": true,
    "anchorsVerified": true,
    "wholeBodyVerified": true,
    "canonExact": false,
    "fullLocomotion": false,
    "fullProne": true,
    "movementCoverage": "two-step-combat-keys",
    "primaryAction": "foreclaw",
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.0032826938875390524,
    "provenance": {
      "generation": "OpenAI image_gen; ten drawn combat keys. See docs/forge/xeno-trials/sprite-production-v189.json.",
      "reference": "Existing fan-made project source plate, anatomical primary contact adaptation only. No full franchise reconstruction or special choreography certified."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v189/queen-combat-sheet.png",
      "sha256": "9a5713bec8891e44a80f9613a5be9dbb28c643dfe6490cfe5da6af3558521892",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 222,
    "frames": [
      {
        "id": "idle",
        "rect": [
          0,
          0,
          397,
          396
        ],
        "alphaBounds": [
          71,
          94,
          350,
          316
        ],
        "anchor": [
          229,
          316
        ],
        "supports": [
          [
            183,
            314
          ],
          [
            283,
            313
          ]
        ]
      },
      {
        "id": "walk-a",
        "rect": [
          397,
          0,
          396,
          396
        ],
        "alphaBounds": [
          56,
          93,
          331,
          316
        ],
        "anchor": [
          230,
          316
        ],
        "supports": [
          [
            157,
            312
          ],
          [
            275,
            313
          ]
        ]
      },
      {
        "id": "walk-b",
        "rect": [
          793,
          0,
          397,
          396
        ],
        "alphaBounds": [
          38,
          93,
          314,
          316
        ],
        "anchor": [
          233,
          316
        ],
        "supports": [
          [
            138,
            312
          ],
          [
            145,
            313
          ],
          [
            243,
            313
          ]
        ]
      },
      {
        "id": "attack-windup",
        "rect": [
          1190,
          0,
          396,
          396
        ],
        "alphaBounds": [
          20,
          91,
          294,
          316
        ],
        "anchor": [
          216,
          316
        ],
        "supports": [
          [
            123,
            314
          ],
          [
            244,
            313
          ]
        ]
      },
      {
        "id": "attack-impact",
        "rect": [
          1586,
          0,
          397,
          396
        ],
        "alphaBounds": [
          8,
          100,
          324,
          316
        ],
        "anchor": [
          223,
          316
        ],
        "supports": [
          [
            117,
            314
          ],
          [
            232,
            313
          ],
          [
            247,
            312
          ]
        ]
      },
      {
        "id": "attack-recovery",
        "rect": [
          0,
          396,
          397,
          397
        ],
        "alphaBounds": [
          71,
          88,
          345,
          312
        ],
        "anchor": [
          228,
          312
        ],
        "supports": [
          [
            179,
            310
          ],
          [
            193,
            308
          ],
          [
            287,
            309
          ]
        ]
      },
      {
        "id": "guard",
        "rect": [
          397,
          396,
          396,
          397
        ],
        "alphaBounds": [
          55,
          92,
          331,
          312
        ],
        "anchor": [
          232,
          312
        ],
        "supports": [
          [
            163,
            309
          ],
          [
            177,
            308
          ],
          [
            269,
            308
          ]
        ]
      },
      {
        "id": "hit-recoil",
        "rect": [
          793,
          396,
          397,
          397
        ],
        "alphaBounds": [
          41,
          77,
          296,
          312
        ],
        "anchor": [
          190,
          312
        ],
        "supports": [
          [
            169,
            310
          ],
          [
            184,
            308
          ],
          [
            273,
            309
          ],
          [
            289,
            308
          ]
        ]
      },
      {
        "id": "ko-fall",
        "rect": [
          1190,
          396,
          396,
          397
        ],
        "alphaBounds": [
          7,
          120,
          304,
          312
        ],
        "anchor": [
          214,
          312
        ],
        "supports": [
          [
            118,
            310
          ]
        ]
      },
      {
        "id": "ko-ground",
        "rect": [
          1586,
          396,
          397,
          397
        ],
        "alphaBounds": [
          9,
          195,
          317,
          311
        ],
        "anchor": [
          182,
          311
        ],
        "supports": [
          [
            42,
            307
          ],
          [
            177,
            308
          ],
          [
            260,
            308
          ]
        ]
      }
    ]
  },
  {
    "fighterId": "crusher-acm",
    "profileId": "castes-game_acm_crusher",
    "sourcePose": {
      "profileId": "castes-game_acm_crusher",
      "path": "/assets/user/castes-v87/game_acm_crusher.png",
      "sha256": "eca7855c29455b87bf9fc4e26afe2ab07adbd3ff4afa2c5ffb36dc6b4ebc2baa",
      "width": 1536,
      "height": 1024,
      "facing": 1,
      "alphaBounds": [
        12,
        128,
        1519,
        907
      ],
      "anatomy": "armored-quadruped",
      "work": "Aliens: Colonial Marines (2013)"
    },
    "kind": "combat",
    "reviewStatus": "accepted-drawn-atlas",
    "identityVerified": true,
    "alphaVerified": true,
    "anchorsVerified": true,
    "wholeBodyVerified": true,
    "canonExact": false,
    "fullLocomotion": false,
    "fullProne": true,
    "movementCoverage": "two-step-combat-keys",
    "primaryAction": "armored-head-contact",
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.007986974282888332,
    "provenance": {
      "generation": "OpenAI image_gen; ten drawn combat keys. See docs/forge/xeno-trials/sprite-production-v189.json.",
      "reference": "Existing fan-made project source plate, anatomical primary contact adaptation only. No full franchise reconstruction or special choreography certified."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v189/crusher-acm-combat-sheet.png",
      "sha256": "ee54a9038466e6a8a9969c8b7f437ea628f94625d37b183b0c31b9ca0fcd3850",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 209,
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
          23,
          98,
          389,
          307
        ],
        "anchor": [
          208,
          307
        ],
        "supports": [
          [
            281,
            304
          ],
          [
            298,
            303
          ]
        ]
      },
      {
        "id": "walk-a",
        "rect": [
          402,
          0,
          391,
          396
        ],
        "alphaBounds": [
          17,
          98,
          373,
          306
        ],
        "anchor": [
          202,
          306
        ],
        "supports": [
          [
            134,
            302
          ],
          [
            256,
            303
          ]
        ]
      },
      {
        "id": "walk-b",
        "rect": [
          793,
          0,
          386,
          396
        ],
        "alphaBounds": [
          10,
          98,
          369,
          303
        ],
        "anchor": [
          213,
          303
        ],
        "supports": [
          [
            120,
            299
          ],
          [
            137,
            300
          ],
          [
            152,
            299
          ],
          [
            287,
            300
          ]
        ]
      },
      {
        "id": "attack-windup",
        "rect": [
          1179,
          0,
          393,
          396
        ],
        "alphaBounds": [
          3,
          111,
          367,
          306
        ],
        "anchor": [
          226,
          306
        ],
        "supports": [
          [
            269,
            303
          ]
        ]
      },
      {
        "id": "attack-impact",
        "rect": [
          1572,
          0,
          411,
          396
        ],
        "alphaBounds": [
          5,
          121,
          399,
          305
        ],
        "anchor": [
          238,
          305
        ],
        "supports": [
          [
            107,
            301
          ],
          [
            229,
            301
          ],
          [
            247,
            302
          ]
        ]
      },
      {
        "id": "attack-recovery",
        "rect": [
          0,
          396,
          397,
          397
        ],
        "alphaBounds": [
          25,
          86,
          383,
          284
        ],
        "anchor": [
          205,
          284
        ],
        "supports": [
          [
            142,
            280
          ],
          [
            159,
            281
          ],
          [
            305,
            281
          ],
          [
            310,
            281
          ]
        ]
      },
      {
        "id": "guard",
        "rect": [
          397,
          396,
          393,
          397
        ],
        "alphaBounds": [
          38,
          111,
          361,
          286
        ],
        "anchor": [
          207,
          286
        ],
        "supports": [
          [
            234,
            282
          ],
          [
            248,
            283
          ],
          [
            260,
            282
          ]
        ]
      },
      {
        "id": "hit-recoil",
        "rect": [
          790,
          396,
          383,
          397
        ],
        "alphaBounds": [
          3,
          68,
          304,
          283
        ],
        "anchor": [
          165,
          283
        ],
        "supports": [
          [
            121,
            280
          ],
          [
            137,
            279
          ]
        ]
      },
      {
        "id": "ko-fall",
        "rect": [
          1173,
          396,
          389,
          397
        ],
        "alphaBounds": [
          6,
          124,
          361,
          284
        ],
        "anchor": [
          221,
          284
        ],
        "supports": [
          [
            158,
            281
          ],
          [
            241,
            281
          ],
          [
            254,
            280
          ],
          [
            270,
            281
          ]
        ]
      },
      {
        "id": "ko-ground",
        "rect": [
          1562,
          396,
          421,
          397
        ],
        "alphaBounds": [
          7,
          159,
          403,
          283
        ],
        "anchor": [
          203,
          283
        ],
        "supports": [
          [
            22,
            279
          ],
          [
            158,
            279
          ],
          [
            274,
            279
          ],
          [
            382,
            279
          ]
        ]
      }
    ]
  },
  {
    "fighterId": "ravager",
    "profileId": "castes-game_avp_extinction_ravager",
    "sourcePose": {
      "profileId": "castes-game_avp_extinction_ravager",
      "path": "/assets/user/castes-v87/game_avp_extinction_ravager.png",
      "sha256": "7e2d1e236ef7de411c5458aee40520951c2c6dec2dc932a21164eea087738cbe",
      "width": 1536,
      "height": 1024,
      "facing": 1,
      "alphaBounds": [
        32,
        49,
        1502,
        974
      ],
      "anatomy": "blade-armed-biped",
      "work": "Aliens vs. Predator: Extinction (2003)"
    },
    "kind": "combat",
    "reviewStatus": "accepted-drawn-atlas",
    "identityVerified": true,
    "alphaVerified": true,
    "anchorsVerified": true,
    "wholeBodyVerified": true,
    "canonExact": false,
    "fullLocomotion": false,
    "fullProne": true,
    "movementCoverage": "two-step-combat-keys",
    "primaryAction": "forearm-blade",
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.0062370525154027264,
    "provenance": {
      "generation": "OpenAI image_gen; ten drawn combat keys. See docs/forge/xeno-trials/sprite-production-v189.json.",
      "reference": "Existing fan-made project source plate, anatomical primary contact adaptation only. No full franchise reconstruction or special choreography certified."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v189/ravager-combat-sheet.png",
      "sha256": "adf1653945d6896211049ddff6f8bfd43780cf27c4ec22eba6cd44dc9fc27ab5",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 210,
    "frames": [
      {
        "id": "idle",
        "rect": [
          0,
          0,
          397,
          396
        ],
        "alphaBounds": [
          63,
          100,
          360,
          310
        ],
        "anchor": [
          218,
          310
        ],
        "supports": [
          [
            184,
            307
          ],
          [
            264,
            308
          ],
          [
            307,
            306
          ]
        ]
      },
      {
        "id": "walk-a",
        "rect": [
          397,
          0,
          396,
          396
        ],
        "alphaBounds": [
          51,
          100,
          346,
          310
        ],
        "anchor": [
          217,
          310
        ],
        "supports": [
          [
            168,
            307
          ],
          [
            270,
            308
          ]
        ]
      },
      {
        "id": "walk-b",
        "rect": [
          793,
          0,
          397,
          396
        ],
        "alphaBounds": [
          41,
          100,
          334,
          310
        ],
        "anchor": [
          218,
          310
        ],
        "supports": [
          [
            240,
            308
          ]
        ]
      },
      {
        "id": "attack-windup",
        "rect": [
          1190,
          0,
          396,
          396
        ],
        "alphaBounds": [
          32,
          99,
          326,
          310
        ],
        "anchor": [
          220,
          310
        ],
        "supports": [
          [
            139,
            307
          ],
          [
            259,
            308
          ]
        ]
      },
      {
        "id": "attack-impact",
        "rect": [
          1586,
          0,
          397,
          396
        ],
        "alphaBounds": [
          30,
          100,
          360,
          310
        ],
        "anchor": [
          216,
          310
        ],
        "supports": [
          [
            143,
            307
          ],
          [
            257,
            308
          ]
        ]
      },
      {
        "id": "attack-recovery",
        "rect": [
          0,
          396,
          397,
          397
        ],
        "alphaBounds": [
          64,
          104,
          347,
          299
        ],
        "anchor": [
          218,
          299
        ],
        "supports": [
          [
            179,
            297
          ],
          [
            243,
            297
          ]
        ]
      },
      {
        "id": "guard",
        "rect": [
          397,
          396,
          396,
          397
        ],
        "alphaBounds": [
          59,
          104,
          339,
          299
        ],
        "anchor": [
          220,
          299
        ],
        "supports": [
          [
            172,
            297
          ],
          [
            291,
            297
          ]
        ]
      },
      {
        "id": "hit-recoil",
        "rect": [
          793,
          396,
          397,
          397
        ],
        "alphaBounds": [
          42,
          105,
          316,
          299
        ],
        "anchor": [
          182,
          299
        ],
        "supports": [
          [
            198,
            298
          ],
          [
            294,
            296
          ]
        ]
      },
      {
        "id": "ko-fall",
        "rect": [
          1190,
          396,
          396,
          397
        ],
        "alphaBounds": [
          17,
          144,
          319,
          299
        ],
        "anchor": [
          184,
          299
        ],
        "supports": [
          [
            142,
            296
          ],
          [
            296,
            295
          ]
        ]
      },
      {
        "id": "ko-ground",
        "rect": [
          1586,
          396,
          397,
          397
        ],
        "alphaBounds": [
          25,
          194,
          348,
          297
        ],
        "anchor": [
          156,
          297
        ],
        "supports": [
          [
            150,
            295
          ],
          [
            199,
            295
          ],
          [
            294,
            293
          ],
          [
            341,
            294
          ]
        ]
      }
    ]
  },
  {
    "fighterId": "burster",
    "profileId": "castes-game_afe_burster",
    "sourcePose": {
      "profileId": "castes-game_afe_burster",
      "path": "/assets/user/castes-v87/game_afe_burster.png",
      "sha256": "b2db2418502099d9f2551434cf207ef72fe0a09dc68914fbc85e18705720ce13",
      "width": 1536,
      "height": 1024,
      "facing": 1,
      "alphaBounds": [
        21,
        90,
        1511,
        945
      ],
      "anatomy": "sac-bearing-quadruped",
      "work": "Aliens: Fireteam Elite (2021)"
    },
    "kind": "combat",
    "reviewStatus": "accepted-drawn-atlas",
    "identityVerified": true,
    "alphaVerified": true,
    "anchorsVerified": true,
    "wholeBodyVerified": true,
    "canonExact": false,
    "fullLocomotion": false,
    "fullProne": true,
    "movementCoverage": "two-step-combat-keys",
    "primaryAction": "low-body-contact",
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.007433763793424269,
    "provenance": {
      "generation": "OpenAI image_gen; ten drawn combat keys. See docs/forge/xeno-trials/sprite-production-v189.json.",
      "reference": "Existing fan-made project source plate, anatomical primary contact adaptation only. No full franchise reconstruction or special choreography certified."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v189/burster-combat-sheet.png",
      "sha256": "7227ce060096ee89b004df1afc4825fc56d7074d940455d400a289f5b0a3ec46",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 239,
    "frames": [
      {
        "id": "idle",
        "rect": [
          0,
          0,
          397,
          396
        ],
        "alphaBounds": [
          28,
          83,
          370,
          322
        ],
        "anchor": [
          183,
          322
        ],
        "supports": [
          [
            306,
            318
          ],
          [
            325,
            319
          ]
        ]
      },
      {
        "id": "walk-a",
        "rect": [
          397,
          0,
          395,
          396
        ],
        "alphaBounds": [
          32,
          84,
          375,
          321
        ],
        "anchor": [
          181,
          321
        ],
        "supports": [
          [
            81,
            317
          ],
          [
            356,
            317
          ]
        ]
      },
      {
        "id": "walk-b",
        "rect": [
          792,
          0,
          398,
          396
        ],
        "alphaBounds": [
          31,
          86,
          361,
          317
        ],
        "anchor": [
          186,
          317
        ],
        "supports": [
          [
            83,
            314
          ],
          [
            95,
            313
          ]
        ]
      },
      {
        "id": "attack-windup",
        "rect": [
          1190,
          0,
          396,
          396
        ],
        "alphaBounds": [
          38,
          73,
          329,
          319
        ],
        "anchor": [
          189,
          319
        ],
        "supports": [
          [
            247,
            315
          ],
          [
            257,
            315
          ],
          [
            269,
            315
          ],
          [
            275,
            315
          ]
        ]
      },
      {
        "id": "attack-impact",
        "rect": [
          1586,
          0,
          397,
          396
        ],
        "alphaBounds": [
          7,
          78,
          378,
          320
        ],
        "anchor": [
          187,
          320
        ],
        "supports": [
          [
            27,
            316
          ],
          [
            38,
            316
          ],
          [
            45,
            316
          ]
        ]
      },
      {
        "id": "attack-recovery",
        "rect": [
          0,
          396,
          397,
          397
        ],
        "alphaBounds": [
          33,
          73,
          369,
          317
        ],
        "anchor": [
          184,
          317
        ],
        "supports": [
          [
            88,
            314
          ],
          [
            108,
            313
          ]
        ]
      },
      {
        "id": "guard",
        "rect": [
          397,
          396,
          393,
          397
        ],
        "alphaBounds": [
          30,
          95,
          356,
          315
        ],
        "anchor": [
          189,
          315
        ],
        "supports": [
          [
            116,
            311
          ],
          [
            126,
            311
          ],
          [
            267,
            311
          ],
          [
            288,
            312
          ]
        ]
      },
      {
        "id": "hit-recoil",
        "rect": [
          790,
          396,
          387,
          397
        ],
        "alphaBounds": [
          4,
          54,
          343,
          314
        ],
        "anchor": [
          170,
          314
        ],
        "supports": [
          [
            259,
            310
          ],
          [
            280,
            311
          ],
          [
            286,
            310
          ]
        ]
      },
      {
        "id": "ko-fall",
        "rect": [
          1177,
          396,
          391,
          397
        ],
        "alphaBounds": [
          7,
          135,
          355,
          313
        ],
        "anchor": [
          201,
          313
        ],
        "supports": [
          [
            115,
            311
          ],
          [
            141,
            309
          ],
          [
            259,
            309
          ],
          [
            281,
            310
          ]
        ]
      },
      {
        "id": "ko-ground",
        "rect": [
          1568,
          396,
          415,
          397
        ],
        "alphaBounds": [
          9,
          216,
          389,
          318
        ],
        "anchor": [
          185,
          318
        ],
        "supports": [
          [
            59,
            316
          ],
          [
            145,
            314
          ]
        ]
      }
    ]
  }
];
