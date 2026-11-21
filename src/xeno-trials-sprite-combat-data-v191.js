/** Four reviewed identity-bound combat atlases: forty newly drawn key poses.
 * Fan/project adaptations; complete locomotion and franchise-exact motion remain open. */
export const XENO_TRIALS_SPRITE_COMBAT_DATA_V191 = [
  {
    "fighterId": "defender",
    "profileId": "pose-v95-user-xeno-defender",
    "sourcePose": {
      "profileId": "pose-v95-user-xeno-defender",
      "path": "/assets/openai/sprites/static-enemy-v95/ref-56-xeno-defender.png",
      "sha256": "729a6d131424591995e8f948f9f0e6059fe0a82397a5c54f28d1269a0b46cb83",
      "width": 1024,
      "height": 1536,
      "facing": 1,
      "alphaBounds": [
        193,
        133,
        927,
        1418
      ],
      "anatomy": "armored-quadruped",
      "work": "Alien vs. Predator — Capcom, arcade (1994) · adaptation visuelle utilisateur"
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
    "primaryAction": "forelimb-contact",
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.006534856207647896,
    "provenance": {
      "generation": "OpenAI image_gen; ten newly drawn primary-contact, reaction and KO key poses. See docs/forge/xeno-trials/sprite-combat-production-v191.json.",
      "reference": "The exact active project source plate was viewed and supplied as an identity reference. These are project adaptations, not certified franchise frame reconstructions."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v191/defender-combat-sheet.png",
      "sha256": "dcfe59cdde5c6fcd53f94d1b2e994f7f987d7a32c2127f7d5dd6e0495d0b8584",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 351,
    "frames": [
      {
        "id": "idle",
        "rect": [
          0,
          0,
          401,
          396
        ],
        "alphaBounds": [
          49,
          12,
          328,
          363
        ],
        "anchor": [
          164,
          363
        ],
        "supports": [
          [
            83,
            361
          ],
          [
            217,
            360
          ]
        ]
      },
      {
        "id": "walk-a",
        "rect": [
          401,
          0,
          371,
          396
        ],
        "alphaBounds": [
          20,
          19,
          335,
          363
        ],
        "anchor": [
          175,
          363
        ],
        "supports": [
          [
            54,
            361
          ]
        ]
      },
      {
        "id": "walk-b",
        "rect": [
          772,
          0,
          388,
          396
        ],
        "alphaBounds": [
          3,
          28,
          331,
          362
        ],
        "anchor": [
          172,
          362
        ],
        "supports": [
          [
            130,
            360
          ]
        ]
      },
      {
        "id": "attack-windup",
        "rect": [
          1160,
          0,
          373,
          396
        ],
        "alphaBounds": [
          3,
          50,
          308,
          363
        ],
        "anchor": [
          168,
          363
        ],
        "supports": [
          [
            39,
            361
          ],
          [
            229,
            360
          ]
        ]
      },
      {
        "id": "attack-impact",
        "rect": [
          1533,
          0,
          450,
          396
        ],
        "alphaBounds": [
          5,
          68,
          430,
          364
        ],
        "anchor": [
          190,
          364
        ],
        "supports": [
          [
            27,
            361
          ],
          [
            408,
            362
          ]
        ]
      },
      {
        "id": "attack-recovery",
        "rect": [
          0,
          396,
          393,
          397
        ],
        "alphaBounds": [
          27,
          36,
          330,
          358
        ],
        "anchor": [
          167,
          358
        ],
        "supports": [
          [
            60,
            356
          ],
          [
            247,
            354
          ]
        ]
      },
      {
        "id": "guard",
        "rect": [
          393,
          396,
          373,
          397
        ],
        "alphaBounds": [
          13,
          44,
          310,
          356
        ],
        "anchor": [
          168,
          356
        ],
        "supports": [
          [
            46,
            354
          ],
          [
            234,
            353
          ],
          [
            249,
            352
          ]
        ]
      },
      {
        "id": "hit-recoil",
        "rect": [
          766,
          396,
          360,
          397
        ],
        "alphaBounds": [
          12,
          29,
          302,
          356
        ],
        "anchor": [
          175,
          356
        ],
        "supports": [
          [
            108,
            354
          ]
        ]
      },
      {
        "id": "ko-fall",
        "rect": [
          1126,
          396,
          403,
          397
        ],
        "alphaBounds": [
          6,
          99,
          356,
          355
        ],
        "anchor": [
          180,
          355
        ],
        "supports": [
          [
            45,
            353
          ],
          [
            251,
            354
          ],
          [
            267,
            352
          ]
        ]
      },
      {
        "id": "ko-ground",
        "rect": [
          1529,
          396,
          454,
          397
        ],
        "alphaBounds": [
          3,
          225,
          410,
          349
        ],
        "anchor": [
          245,
          349
        ],
        "supports": [
          [
            152,
            347
          ]
        ]
      }
    ]
  },
  {
    "fighterId": "chrysalis",
    "profileId": "castes-game_avp_capcom_chrysalis",
    "sourcePose": {
      "profileId": "castes-game_avp_capcom_chrysalis",
      "path": "/assets/openai/sprites/static-enemy-v93/game_avp_capcom_chrysalis.png",
      "sha256": "616aeca6329e615cd42be6324d50de450d22b62d8950c7891acaf56e4a70abb7",
      "width": 1536,
      "height": 1024,
      "facing": 1,
      "alphaBounds": [
        56,
        170,
        1463,
        851
      ],
      "anatomy": "armored-biped",
      "work": "Alien vs. Predator — Capcom (1994)"
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
    "lowAlphaMassFraction": 0.004924155835713423,
    "provenance": {
      "generation": "OpenAI image_gen; ten newly drawn primary-contact, reaction and KO key poses. See docs/forge/xeno-trials/sprite-combat-production-v191.json.",
      "reference": "The exact active project source plate was viewed and supplied as an identity reference. These are project adaptations, not certified franchise frame reconstructions."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v191/chrysalis-combat-sheet.png",
      "sha256": "a1b3a1f3129d3d0e719d8bfa72ac2570f30d597496b7caeb2e50993d6b89c488",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 237,
    "frames": [
      {
        "id": "idle",
        "rect": [
          0,
          0,
          401,
          396
        ],
        "alphaBounds": [
          14,
          88,
          376,
          325
        ],
        "anchor": [
          257,
          325
        ],
        "supports": [
          [
            185,
            323
          ]
        ]
      },
      {
        "id": "walk-a",
        "rect": [
          401,
          0,
          387,
          396
        ],
        "alphaBounds": [
          10,
          89,
          353,
          324
        ],
        "anchor": [
          247,
          324
        ],
        "supports": [
          [
            156,
            323
          ],
          [
            263,
            322
          ]
        ]
      },
      {
        "id": "walk-b",
        "rect": [
          788,
          0,
          387,
          396
        ],
        "alphaBounds": [
          13,
          88,
          362,
          325
        ],
        "anchor": [
          246,
          325
        ],
        "supports": [
          [
            239,
            323
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
          27,
          87,
          363,
          325
        ],
        "anchor": [
          247,
          325
        ],
        "supports": [
          [
            153,
            323
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
          9,
          94,
          403,
          325
        ],
        "anchor": [
          235,
          325
        ],
        "supports": [
          [
            140,
            323
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
          32,
          87,
          371,
          316
        ],
        "anchor": [
          249,
          316
        ],
        "supports": [
          [
            160,
            314
          ],
          [
            281,
            312
          ]
        ]
      },
      {
        "id": "guard",
        "rect": [
          397,
          396,
          397,
          397
        ],
        "alphaBounds": [
          45,
          88,
          351,
          316
        ],
        "anchor": [
          244,
          316
        ],
        "supports": [
          [
            149,
            314
          ],
          [
            185,
            312
          ]
        ]
      },
      {
        "id": "hit-recoil",
        "rect": [
          794,
          396,
          379,
          397
        ],
        "alphaBounds": [
          15,
          60,
          337,
          315
        ],
        "anchor": [
          231,
          315
        ],
        "supports": [
          [
            216,
            313
          ]
        ]
      },
      {
        "id": "ko-fall",
        "rect": [
          1173,
          396,
          373,
          397
        ],
        "alphaBounds": [
          8,
          138,
          364,
          317
        ],
        "anchor": [
          250,
          317
        ],
        "supports": [
          [
            128,
            313
          ],
          [
            289,
            315
          ]
        ]
      },
      {
        "id": "ko-ground",
        "rect": [
          1546,
          396,
          437,
          397
        ],
        "alphaBounds": [
          44,
          193,
          412,
          309
        ],
        "anchor": [
          252,
          309
        ],
        "supports": [
          [
            72,
            305
          ],
          [
            115,
            307
          ],
          [
            153,
            306
          ]
        ]
      }
    ]
  },
  {
    "fighterId": "smasher",
    "profileId": "castes-game_avp_capcom_smasher",
    "sourcePose": {
      "profileId": "castes-game_avp_capcom_smasher",
      "path": "/assets/openai/sprites/static-enemy-v92/game_avp_capcom_smasher.png",
      "sha256": "0efaa9b6afe6f817567725d7aae0b57c15093d1f68a8e480bb34ede566c7dee8",
      "width": 1536,
      "height": 1024,
      "facing": 1,
      "alphaBounds": [
        137,
        172,
        1308,
        894
      ],
      "anatomy": "heavy-biped",
      "work": "Alien vs. Predator — Capcom (1994)"
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
    "primaryAction": "forearm-strike",
    "alphaBoundsThreshold": 16,
    "cutEdgeAlphaMax": 1,
    "supportAlphaMin": 128,
    "lowAlphaMassFraction": 0.006145984430431004,
    "provenance": {
      "generation": "OpenAI image_gen; ten newly drawn primary-contact, reaction and KO key poses. See docs/forge/xeno-trials/sprite-combat-production-v191.json.",
      "reference": "The exact active project source plate was viewed and supplied as an identity reference. These are project adaptations, not certified franchise frame reconstructions."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v191/smasher-combat-sheet.png",
      "sha256": "96ffec697770ee5fe2c15e0d504693f6ac566003567d936a81145f3d1493c681",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 261,
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
          38,
          72,
          376,
          333
        ],
        "anchor": [
          261,
          333
        ],
        "supports": [
          [
            303,
            331
          ]
        ]
      },
      {
        "id": "walk-a",
        "rect": [
          397,
          0,
          399,
          396
        ],
        "alphaBounds": [
          36,
          77,
          362,
          333
        ],
        "anchor": [
          245,
          333
        ],
        "supports": [
          [
            172,
            329
          ],
          [
            305,
            331
          ]
        ]
      },
      {
        "id": "walk-b",
        "rect": [
          796,
          0,
          395,
          396
        ],
        "alphaBounds": [
          19,
          79,
          346,
          333
        ],
        "anchor": [
          239,
          333
        ],
        "supports": [
          [
            163,
            331
          ],
          [
            292,
            331
          ]
        ]
      },
      {
        "id": "attack-windup",
        "rect": [
          1191,
          0,
          395,
          396
        ],
        "alphaBounds": [
          24,
          86,
          359,
          335
        ],
        "anchor": [
          250,
          335
        ],
        "supports": [
          [
            120,
            332
          ],
          [
            264,
            332
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
          101,
          385,
          334
        ],
        "anchor": [
          245,
          334
        ],
        "supports": [
          [
            91,
            332
          ],
          [
            289,
            330
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
          34,
          76,
          354,
          332
        ],
        "anchor": [
          239,
          332
        ],
        "supports": [
          [
            173,
            330
          ],
          [
            290,
            330
          ]
        ]
      },
      {
        "id": "guard",
        "rect": [
          397,
          396,
          397,
          397
        ],
        "alphaBounds": [
          43,
          80,
          326,
          332
        ],
        "anchor": [
          231,
          332
        ],
        "supports": [
          [
            150,
            330
          ],
          [
            263,
            329
          ]
        ]
      },
      {
        "id": "hit-recoil",
        "rect": [
          794,
          396,
          397,
          397
        ],
        "alphaBounds": [
          17,
          60,
          308,
          332
        ],
        "anchor": [
          230,
          332
        ],
        "supports": [
          [
            245,
            330
          ]
        ]
      },
      {
        "id": "ko-fall",
        "rect": [
          1191,
          396,
          355,
          397
        ],
        "alphaBounds": [
          13,
          141,
          344,
          332
        ],
        "anchor": [
          225,
          332
        ],
        "supports": [
          [
            128,
            330
          ],
          [
            288,
            328
          ]
        ]
      },
      {
        "id": "ko-ground",
        "rect": [
          1546,
          396,
          437,
          397
        ],
        "alphaBounds": [
          48,
          223,
          406,
          335
        ],
        "anchor": [
          249,
          335
        ],
        "supports": [
          [
            178,
            333
          ]
        ]
      }
    ]
  },
  {
    "fighterId": "user-brute",
    "profileId": "pose-v95-user-xeno-brute",
    "sourcePose": {
      "profileId": "pose-v95-user-xeno-brute",
      "path": "/assets/openai/sprites/static-enemy-v95/xeno-brute.png",
      "sha256": "c093b0f9bf4ab5b6fa79de9f5787d2552957d1959670c639054c1c01875fca13",
      "width": 1121,
      "height": 1403,
      "facing": -1,
      "alphaBounds": [
        99,
        133,
        1072,
        1292
      ],
      "anatomy": "horned-biped",
      "work": "Lot AlienTentalus — adaptation de jeu non canonique"
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
    "lowAlphaMassFraction": 0.004035304922544361,
    "provenance": {
      "generation": "OpenAI image_gen; ten newly drawn primary-contact, reaction and KO key poses. See docs/forge/xeno-trials/sprite-combat-production-v191.json.",
      "reference": "The exact active project source plate was viewed and supplied as an identity reference. These are project adaptations, not certified franchise frame reconstructions."
    },
    "texture": {
      "path": "/assets/openai/sprites/xeno-trials-v191/user-brute-combat-sheet.png",
      "sha256": "b209caa8a98a62d12b5df640f4bcd78654b951bfeb7b9d951727a277e6adeb8a",
      "width": 1983,
      "height": 793,
      "facing": 1
    },
    "referenceHeight": 324,
    "frames": [
      {
        "id": "idle",
        "rect": [
          0,
          0,
          409,
          396
        ],
        "alphaBounds": [
          59,
          25,
          339,
          349
        ],
        "anchor": [
          191,
          349
        ],
        "supports": [
          [
            101,
            347
          ],
          [
            138,
            347
          ]
        ]
      },
      {
        "id": "walk-a",
        "rect": [
          409,
          0,
          385,
          396
        ],
        "alphaBounds": [
          38,
          25,
          321,
          347
        ],
        "anchor": [
          181,
          347
        ],
        "supports": [
          [
            252,
            346
          ],
          [
            267,
            343
          ]
        ]
      },
      {
        "id": "walk-b",
        "rect": [
          794,
          0,
          393,
          396
        ],
        "alphaBounds": [
          24,
          30,
          311,
          348
        ],
        "anchor": [
          189,
          348
        ],
        "supports": [
          [
            248,
            346
          ]
        ]
      },
      {
        "id": "attack-windup",
        "rect": [
          1187,
          0,
          391,
          396
        ],
        "alphaBounds": [
          16,
          43,
          347,
          348
        ],
        "anchor": [
          205,
          348
        ],
        "supports": [
          [
            38,
            346
          ],
          [
            77,
            346
          ]
        ]
      },
      {
        "id": "attack-impact",
        "rect": [
          1578,
          0,
          405,
          396
        ],
        "alphaBounds": [
          13,
          62,
          383,
          346
        ],
        "anchor": [
          192,
          346
        ],
        "supports": [
          [
            16,
            343
          ],
          [
            57,
            344
          ],
          [
            350,
            345
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
          47,
          37,
          337,
          352
        ],
        "anchor": [
          191,
          352
        ],
        "supports": [
          [
            58,
            350
          ],
          [
            81,
            348
          ],
          [
            105,
            350
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
          49,
          38,
          337,
          352
        ],
        "anchor": [
          191,
          352
        ],
        "supports": [
          [
            70,
            350
          ],
          [
            114,
            350
          ]
        ]
      },
      {
        "id": "hit-recoil",
        "rect": [
          793,
          396,
          386,
          397
        ],
        "alphaBounds": [
          19,
          47,
          324,
          349
        ],
        "anchor": [
          193,
          349
        ],
        "supports": [
          [
            66,
            347
          ],
          [
            110,
            347
          ],
          [
            280,
            345
          ]
        ]
      },
      {
        "id": "ko-fall",
        "rect": [
          1179,
          396,
          375,
          397
        ],
        "alphaBounds": [
          5,
          120,
          334,
          357
        ],
        "anchor": [
          185,
          357
        ],
        "supports": [
          [
            215,
            355
          ]
        ]
      },
      {
        "id": "ko-ground",
        "rect": [
          1554,
          396,
          429,
          397
        ],
        "alphaBounds": [
          13,
          171,
          412,
          348
        ],
        "anchor": [
          237,
          348
        ],
        "supports": [
          [
            93,
            346
          ],
          [
            208,
            345
          ],
          [
            321,
            344
          ],
          [
            392,
            346
          ]
        ]
      }
    ]
  }
];
