// Measured native separated clothing; source PNG bytes remain untouched.
const freeze=value=>{if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export const PLAYER_COSTUME_PARTS_V165=freeze({
  "amanda-working": {
    "slug": "amanda-working",
    "upperAsset": {
      "id": "player.echo9.costume-parts-v165.amanda-working.upper",
      "kind": "costume-upper-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:amanda-working:upper",
      "path": "/assets/openai/sprites/player/costume-parts-v165/amanda-working/upper.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "154d7d59344220ce20e068b0c402b566951b0418b9f73d17d89863c8994ebb50",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "legAsset": {
      "id": "player.echo9.costume-parts-v165.amanda-working.legs",
      "kind": "costume-legs-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:amanda-working:legs",
      "path": "/assets/openai/sprites/player/costume-parts-v165/amanda-working/legs.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "62c2a289c479451d07ec8b530e2a69a5c637f9d6f83e40d2642a4cd131a24063",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "torso": {
      "upright": {
        "alphaBounds": [
          988,
          59,
          1221,
          330
        ],
        "alphaBoundsThreshold": 128,
        "width": 233,
        "source": {
          "x": 985,
          "y": 56,
          "width": 239,
          "height": 277
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 1036.318,
            "y": 175.902
          },
          "far": {
            "x": 1182.346,
            "y": 153.584
          },
          "waist": {
            "x": 1121.143,
            "y": 291.741
          }
        },
        "apertures": {
          "neck": {
            "x": 1127,
            "y": 83
          },
          "arm": {
            "x": 1021,
            "y": 159
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1111,
          "armPixels": 2670,
          "maxAlpha": 16
        }
      },
      "forward": {
        "alphaBounds": [
          68,
          376,
          290,
          631
        ],
        "alphaBoundsThreshold": 128,
        "width": 222,
        "source": {
          "x": 65,
          "y": 373,
          "width": 228,
          "height": 261
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 143.057,
            "y": 484.854
          },
          "far": {
            "x": 264.629,
            "y": 458.648
          },
          "waist": {
            "x": 175.829,
            "y": 594.715
          }
        },
        "apertures": {
          "neck": {
            "x": 214,
            "y": 406
          },
          "arm": {
            "x": 102,
            "y": 453
          }
        },
        "apertureMeasurements": {
          "neckPixels": 919,
          "armPixels": 2161,
          "maxAlpha": 16
        }
      },
      "compact": {
        "alphaBounds": [
          362,
          399,
          611,
          643
        ],
        "alphaBoundsThreshold": 128,
        "width": 249,
        "source": {
          "x": 359,
          "y": 396,
          "width": 255,
          "height": 250
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 429.909,
            "y": 518.932
          },
          "far": {
            "x": 572.195,
            "y": 484.814
          },
          "waist": {
            "x": 477.338,
            "y": 609.915
          }
        },
        "apertures": {
          "neck": {
            "x": 559,
            "y": 438
          },
          "arm": {
            "x": 425,
            "y": 511
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1098,
          "armPixels": 1380,
          "maxAlpha": 16
        }
      }
    },
    "arms": {
      "near": {
        "upper": {
          "alphaBounds": [
            724,
            372,
            868,
            657
          ],
          "alphaBoundsThreshold": 128,
          "width": 144,
          "source": {
            "x": 721,
            "y": 369,
            "width": 150,
            "height": 291
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 794.423,
            "y": 403.777
          },
          "distal": {
            "x": 795.474,
            "y": 605.362
          }
        },
        "fore": {
          "alphaBounds": [
            1033,
            389,
            1183,
            660
          ],
          "alphaBoundsThreshold": 128,
          "width": 150,
          "source": {
            "x": 1030,
            "y": 386,
            "width": 156,
            "height": 277
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1099.176,
            "y": 435.865
          },
          "distal": {
            "x": 1139.985,
            "y": 618.229
          }
        },
        "grip": {
          "alphaBounds": [
            93,
            714,
            270,
            944
          ],
          "alphaBoundsThreshold": 128,
          "width": 177,
          "source": {
            "x": 90,
            "y": 711,
            "width": 183,
            "height": 236
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 160.481,
            "y": 744.804
          },
          "distal": {
            "x": 183.712,
            "y": 857.75
          }
        },
        "service": {
          "alphaBounds": [
            359,
            715,
            562,
            962
          ],
          "alphaBoundsThreshold": 128,
          "width": 203,
          "source": {
            "x": 356,
            "y": 712,
            "width": 209,
            "height": 253
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 454.465,
            "y": 748.071
          },
          "distal": {
            "x": 455.562,
            "y": 875.188
          }
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            719,
            685,
            879,
            974
          ],
          "alphaBoundsThreshold": 128,
          "width": 160,
          "source": {
            "x": 716,
            "y": 682,
            "width": 166,
            "height": 295
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 804.828,
            "y": 716.657
          },
          "distal": {
            "x": 783.636,
            "y": 927.025
          }
        },
        "fore": {
          "alphaBounds": [
            1039,
            706,
            1187,
            972
          ],
          "alphaBoundsThreshold": 128,
          "width": 148,
          "source": {
            "x": 1036,
            "y": 703,
            "width": 154,
            "height": 272
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1122.459,
            "y": 747.24
          },
          "distal": {
            "x": 1100.203,
            "y": 933.853
          }
        },
        "grip": {
          "alphaBounds": [
            75,
            999,
            246,
            1208
          ],
          "alphaBoundsThreshold": 128,
          "width": 171,
          "source": {
            "x": 72,
            "y": 996,
            "width": 177,
            "height": 215
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 182.547,
            "y": 1029.735
          },
          "distal": {
            "x": 153.509,
            "y": 1144.48
          }
        },
        "service": {
          "alphaBounds": [
            375,
            1004,
            578,
            1231
          ],
          "alphaBoundsThreshold": 128,
          "width": 203,
          "source": {
            "x": 372,
            "y": 1001,
            "width": 209,
            "height": 233
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 491.667,
            "y": 1034.477
          },
          "distal": {
            "x": 481.167,
            "y": 1162.69
          }
        }
      }
    },
    "legs": {
      "pelvis": {
        "alphaBounds": [
          57,
          709,
          316,
          887
        ],
        "alphaBoundsThreshold": 128,
        "width": 259,
        "source": {
          "x": 54,
          "y": 706,
          "width": 265,
          "height": 184
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "waist": {
          "x": 186.5,
          "y": 785.784
        },
        "near": {
          "x": 113.656,
          "y": 847.444
        },
        "far": {
          "x": 275.531,
          "y": 843.954
        },
        "belt": {
          "x": 186.5,
          "y": 749.719
        }
      },
      "near": {
        "upper": {
          "alphaBounds": [
            408,
            657,
            596,
            919
          ],
          "alphaBoundsThreshold": 128,
          "width": 188,
          "source": {
            "x": 405,
            "y": 654,
            "width": 194,
            "height": 268
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 494.072,
            "y": 699.458
          },
          "distal": {
            "x": 523.518,
            "y": 885.862
          }
        },
        "lower": {
          "alphaBounds": [
            711,
            655,
            852,
            916
          ],
          "alphaBoundsThreshold": 128,
          "width": 141,
          "source": {
            "x": 708,
            "y": 652,
            "width": 147,
            "height": 267
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 786.344,
            "y": 706.361
          },
          "distal": {
            "x": 778.809,
            "y": 887.699
          }
        },
        "boot": {
          "alphaBounds": [
            1025,
            771,
            1221,
            928
          ],
          "alphaBoundsThreshold": 128,
          "width": 196,
          "source": {
            "x": 1022,
            "y": 768,
            "width": 202,
            "height": 163
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 1082.78,
            "y": 859.312
          },
          "proximal": {
            "x": 1082.78,
            "y": 859.312
          },
          "sole": {
            "x": 1147,
            "y": 927
          },
          "distal": {
            "x": 1147,
            "y": 927
          },
          "heel": {
            "x": 1046.526,
            "y": 913.826
          },
          "toe": {
            "x": 1201.74,
            "y": 913.826
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            84,
            943,
            307,
            1197
          ],
          "alphaBoundsThreshold": 128,
          "width": 223,
          "source": {
            "x": 81,
            "y": 940,
            "width": 229,
            "height": 260
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 167.192,
            "y": 989.762
          },
          "distal": {
            "x": 236.518,
            "y": 1167.243
          }
        },
        "lower": {
          "alphaBounds": [
            429,
            941,
            571,
            1195
          ],
          "alphaBoundsThreshold": 128,
          "width": 142,
          "source": {
            "x": 426,
            "y": 938,
            "width": 148,
            "height": 260
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 504.303,
            "y": 992.626
          },
          "distal": {
            "x": 489.242,
            "y": 1167.122
          }
        },
        "boot": {
          "alphaBounds": [
            721,
            1056,
            926,
            1207
          ],
          "alphaBoundsThreshold": 128,
          "width": 205,
          "source": {
            "x": 718,
            "y": 1053,
            "width": 211,
            "height": 157
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 777.433,
            "y": 1139.159
          },
          "proximal": {
            "x": 777.433,
            "y": 1139.159
          },
          "sole": {
            "x": 855,
            "y": 1206
          },
          "distal": {
            "x": 855,
            "y": 1206
          },
          "heel": {
            "x": 742.882,
            "y": 1191.681
          },
          "toe": {
            "x": 906.421,
            "y": 1191.681
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      }
    }
  },
  "working-joe-uniform": {
    "slug": "working-joe-uniform",
    "upperAsset": {
      "id": "player.echo9.costume-parts-v165.working-joe-uniform.upper",
      "kind": "costume-upper-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:working-joe-uniform:upper",
      "path": "/assets/openai/sprites/player/costume-parts-v165/working-joe-uniform/upper.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "d91f41a31097d56c288a45aa2341e5525efa2054628478ce8cda7f231a068547",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "legAsset": {
      "id": "player.echo9.costume-parts-v165.working-joe-uniform.legs",
      "kind": "costume-legs-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:working-joe-uniform:legs",
      "path": "/assets/openai/sprites/player/costume-parts-v165/working-joe-uniform/legs.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "9782c1874a32ced163fd4468c703db83d6ebe55512d5aa32e9f42ef51d824f45",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "torso": {
      "upright": {
        "alphaBounds": [
          997,
          62,
          1218,
          318
        ],
        "alphaBoundsThreshold": 128,
        "width": 221,
        "source": {
          "x": 994,
          "y": 59,
          "width": 227,
          "height": 262
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 1042.829,
            "y": 172.431
          },
          "far": {
            "x": 1181.336,
            "y": 151.349
          },
          "waist": {
            "x": 1123.286,
            "y": 281.859
          }
        },
        "apertures": {
          "neck": {
            "x": 1128,
            "y": 84
          },
          "arm": {
            "x": 1031,
            "y": 161
          }
        },
        "apertureMeasurements": {
          "neckPixels": 930,
          "armPixels": 3025,
          "maxAlpha": 16
        }
      },
      "forward": {
        "alphaBounds": [
          84,
          381,
          297,
          623
        ],
        "alphaBoundsThreshold": 128,
        "width": 213,
        "source": {
          "x": 81,
          "y": 378,
          "width": 219,
          "height": 248
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 156.014,
            "y": 484.304
          },
          "far": {
            "x": 272.657,
            "y": 459.435
          },
          "waist": {
            "x": 187.457,
            "y": 588.565
          }
        },
        "apertures": {
          "neck": {
            "x": 234,
            "y": 413
          },
          "arm": {
            "x": 128,
            "y": 466
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1278,
          "armPixels": 3928,
          "maxAlpha": 16
        }
      },
      "compact": {
        "alphaBounds": [
          382,
          405,
          617,
          631
        ],
        "alphaBoundsThreshold": 128,
        "width": 235,
        "source": {
          "x": 379,
          "y": 402,
          "width": 241,
          "height": 232
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 446.091,
            "y": 516.085
          },
          "far": {
            "x": 580.377,
            "y": 484.483
          },
          "waist": {
            "x": 490.853,
            "y": 600.356
          }
        },
        "apertures": {
          "neck": {
            "x": 573,
            "y": 444
          },
          "arm": {
            "x": 463,
            "y": 482
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1285,
          "armPixels": 3671,
          "maxAlpha": 16
        }
      }
    },
    "arms": {
      "near": {
        "upper": {
          "alphaBounds": [
            739,
            380,
            871,
            654
          ],
          "alphaBoundsThreshold": 128,
          "width": 132,
          "source": {
            "x": 736,
            "y": 377,
            "width": 138,
            "height": 280
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 803.555,
            "y": 410.551
          },
          "distal": {
            "x": 804.518,
            "y": 604.355
          }
        },
        "fore": {
          "alphaBounds": [
            1049,
            392,
            1186,
            658
          ],
          "alphaBoundsThreshold": 128,
          "width": 137,
          "source": {
            "x": 1046,
            "y": 389,
            "width": 143,
            "height": 272
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1109.441,
            "y": 438.0
          },
          "distal": {
            "x": 1146.713,
            "y": 617.0
          }
        },
        "grip": {
          "alphaBounds": [
            100,
            721,
            263,
            940
          ],
          "alphaBoundsThreshold": 128,
          "width": 163,
          "source": {
            "x": 97,
            "y": 718,
            "width": 169,
            "height": 225
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 162.144,
            "y": 750.33
          },
          "distal": {
            "x": 183.537,
            "y": 857.875
          }
        },
        "service": {
          "alphaBounds": [
            378,
            724,
            570,
            958
          ],
          "alphaBoundsThreshold": 128,
          "width": 192,
          "source": {
            "x": 375,
            "y": 721,
            "width": 198,
            "height": 240
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 468.292,
            "y": 755.331
          },
          "distal": {
            "x": 469.33,
            "y": 875.757
          }
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            730,
            685,
            879,
            968
          ],
          "alphaBoundsThreshold": 128,
          "width": 149,
          "source": {
            "x": 727,
            "y": 682,
            "width": 155,
            "height": 289
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 809.927,
            "y": 716.0
          },
          "distal": {
            "x": 790.192,
            "y": 922.0
          }
        },
        "fore": {
          "alphaBounds": [
            1059,
            708,
            1196,
            971
          ],
          "alphaBoundsThreshold": 128,
          "width": 137,
          "source": {
            "x": 1056,
            "y": 705,
            "width": 143,
            "height": 269
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1136.256,
            "y": 748.775
          },
          "distal": {
            "x": 1115.654,
            "y": 933.283
          }
        },
        "grip": {
          "alphaBounds": [
            78,
            1011,
            239,
            1210
          ],
          "alphaBoundsThreshold": 128,
          "width": 161,
          "source": {
            "x": 75,
            "y": 1008,
            "width": 167,
            "height": 205
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 179.258,
            "y": 1040.265
          },
          "distal": {
            "x": 151.918,
            "y": 1149.52
          }
        },
        "service": {
          "alphaBounds": [
            391,
            1014,
            571,
            1231
          ],
          "alphaBoundsThreshold": 128,
          "width": 180,
          "source": {
            "x": 388,
            "y": 1011,
            "width": 186,
            "height": 223
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 494.448,
            "y": 1043.134
          },
          "distal": {
            "x": 485.138,
            "y": 1165.699
          }
        }
      }
    },
    "legs": {
      "pelvis": {
        "alphaBounds": [
          68,
          721,
          296,
          879
        ],
        "alphaBoundsThreshold": 128,
        "width": 228,
        "source": {
          "x": 65,
          "y": 718,
          "width": 234,
          "height": 164
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "waist": {
          "x": 182.0,
          "y": 789.157
        },
        "near": {
          "x": 117.875,
          "y": 843.889
        },
        "far": {
          "x": 260.375,
          "y": 840.791
        },
        "belt": {
          "x": 182.0,
          "y": 757.144
        }
      },
      "near": {
        "upper": {
          "alphaBounds": [
            413,
            659,
            583,
            915
          ],
          "alphaBoundsThreshold": 128,
          "width": 170,
          "source": {
            "x": 410,
            "y": 656,
            "width": 176,
            "height": 262
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 490.831,
            "y": 700.486
          },
          "distal": {
            "x": 517.458,
            "y": 882.621
          }
        },
        "lower": {
          "alphaBounds": [
            715,
            659,
            847,
            909
          ],
          "alphaBoundsThreshold": 128,
          "width": 132,
          "source": {
            "x": 712,
            "y": 656,
            "width": 138,
            "height": 256
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 785.534,
            "y": 708.197
          },
          "distal": {
            "x": 778.481,
            "y": 881.892
          }
        },
        "boot": {
          "alphaBounds": [
            1028,
            784,
            1205,
            932
          ],
          "alphaBoundsThreshold": 128,
          "width": 177,
          "source": {
            "x": 1025,
            "y": 781,
            "width": 183,
            "height": 154
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 1080.179,
            "y": 867.25
          },
          "proximal": {
            "x": 1080.179,
            "y": 867.25
          },
          "sole": {
            "x": 1138,
            "y": 931
          },
          "distal": {
            "x": 1138,
            "y": 931
          },
          "heel": {
            "x": 1047.439,
            "y": 918.639
          },
          "toe": {
            "x": 1187.607,
            "y": 918.639
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            95,
            947,
            294,
            1189
          ],
          "alphaBoundsThreshold": 128,
          "width": 199,
          "source": {
            "x": 92,
            "y": 944,
            "width": 205,
            "height": 248
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 169.238,
            "y": 991.552
          },
          "distal": {
            "x": 231.104,
            "y": 1160.649
          }
        },
        "lower": {
          "alphaBounds": [
            428,
            943,
            562,
            1190
          ],
          "alphaBoundsThreshold": 128,
          "width": 134,
          "source": {
            "x": 425,
            "y": 940,
            "width": 140,
            "height": 253
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 499.061,
            "y": 993.203
          },
          "distal": {
            "x": 484.848,
            "y": 1162.89
          }
        },
        "boot": {
          "alphaBounds": [
            719,
            1055,
            902,
            1199
          ],
          "alphaBoundsThreshold": 128,
          "width": 183,
          "source": {
            "x": 716,
            "y": 1052,
            "width": 189,
            "height": 150
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 769.376,
            "y": 1134.304
          },
          "proximal": {
            "x": 769.376,
            "y": 1134.304
          },
          "sole": {
            "x": 838,
            "y": 1198
          },
          "distal": {
            "x": 838,
            "y": 1198
          },
          "heel": {
            "x": 738.534,
            "y": 1184.391
          },
          "toe": {
            "x": 884.522,
            "y": 1184.391
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      }
    }
  },
  "sevastopol-security": {
    "slug": "sevastopol-security",
    "upperAsset": {
      "id": "player.echo9.costume-parts-v165.sevastopol-security.upper",
      "kind": "costume-upper-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:sevastopol-security:upper",
      "path": "/assets/openai/sprites/player/costume-parts-v165/sevastopol-security/upper.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "8155ea98b9c2585b6bedc523811cbd3829ee11957cbb280cef32872bd92105ad",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "legAsset": {
      "id": "player.echo9.costume-parts-v165.sevastopol-security.legs",
      "kind": "costume-legs-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:sevastopol-security:legs",
      "path": "/assets/openai/sprites/player/costume-parts-v165/sevastopol-security/legs.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "817a58f2a1fe4fd782a693684762723ed1546ee5ea3513bd15ee48657c80e1d2",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "torso": {
      "upright": {
        "alphaBounds": [
          43,
          62,
          272,
          319
        ],
        "alphaBoundsThreshold": 128,
        "width": 229,
        "source": {
          "x": 40,
          "y": 59,
          "width": 235,
          "height": 263
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 102.295,
            "y": 178.725
          },
          "far": {
            "x": 238.263,
            "y": 156.199
          },
          "waist": {
            "x": 169.768,
            "y": 287.259
          }
        },
        "apertures": {
          "neck": {
            "x": 183,
            "y": 82
          },
          "arm": {
            "x": 86,
            "y": 202
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1297,
          "armPixels": 754,
          "maxAlpha": 16
        }
      },
      "forward": {
        "alphaBounds": [
          362,
          63,
          599,
          323
        ],
        "alphaBoundsThreshold": 128,
        "width": 237,
        "source": {
          "x": 359,
          "y": 60,
          "width": 243,
          "height": 266
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 426.082,
            "y": 180.354
          },
          "far": {
            "x": 557.296,
            "y": 165.179
          },
          "waist": {
            "x": 479.991,
            "y": 289.615
          }
        },
        "apertures": {
          "neck": {
            "x": 520,
            "y": 87
          },
          "arm": {
            "x": 412,
            "y": 203
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1357,
          "armPixels": 717,
          "maxAlpha": 16
        }
      },
      "compact": {
        "alphaBounds": [
          677,
          100,
          916,
          332
        ],
        "alphaBoundsThreshold": 128,
        "width": 239,
        "source": {
          "x": 674,
          "y": 97,
          "width": 245,
          "height": 238
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 746.29,
            "y": 220.106
          },
          "far": {
            "x": 873.824,
            "y": 186.23
          },
          "waist": {
            "x": 786.458,
            "y": 298.124
          }
        },
        "apertures": {
          "neck": {
            "x": 851,
            "y": 129
          },
          "arm": {
            "x": 732,
            "y": 234
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1414,
          "armPixels": 820,
          "maxAlpha": 16
        }
      }
    },
    "arms": {
      "near": {
        "upper": {
          "alphaBounds": [
            734,
            370,
            871,
            657
          ],
          "alphaBoundsThreshold": 128,
          "width": 137,
          "source": {
            "x": 731,
            "y": 367,
            "width": 143,
            "height": 293
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 801.0,
            "y": 402.0
          },
          "distal": {
            "x": 802.0,
            "y": 605.0
          }
        },
        "fore": {
          "alphaBounds": [
            1035,
            392,
            1176,
            660
          ],
          "alphaBoundsThreshold": 128,
          "width": 141,
          "source": {
            "x": 1032,
            "y": 389,
            "width": 147,
            "height": 274
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1097.206,
            "y": 438.346
          },
          "distal": {
            "x": 1135.566,
            "y": 618.692
          }
        },
        "grip": {
          "alphaBounds": [
            100,
            718,
            264,
            943
          ],
          "alphaBoundsThreshold": 128,
          "width": 164,
          "source": {
            "x": 97,
            "y": 715,
            "width": 170,
            "height": 231
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 162.525,
            "y": 748.134
          },
          "distal": {
            "x": 184.05,
            "y": 858.625
          }
        },
        "service": {
          "alphaBounds": [
            369,
            717,
            557,
            958
          ],
          "alphaBoundsThreshold": 128,
          "width": 188,
          "source": {
            "x": 366,
            "y": 714,
            "width": 194,
            "height": 247
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 457.411,
            "y": 749.268
          },
          "distal": {
            "x": 458.427,
            "y": 873.297
          }
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            724,
            686,
            874,
            970
          ],
          "alphaBoundsThreshold": 128,
          "width": 150,
          "source": {
            "x": 721,
            "y": 683,
            "width": 156,
            "height": 290
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 804.464,
            "y": 717.11
          },
          "distal": {
            "x": 784.596,
            "y": 923.837
          }
        },
        "fore": {
          "alphaBounds": [
            1045,
            708,
            1184,
            970
          ],
          "alphaBoundsThreshold": 128,
          "width": 139,
          "source": {
            "x": 1042,
            "y": 705,
            "width": 145,
            "height": 268
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1123.383,
            "y": 748.62
          },
          "distal": {
            "x": 1102.481,
            "y": 932.426
          }
        },
        "grip": {
          "alphaBounds": [
            76,
            1003,
            238,
            1210
          ],
          "alphaBoundsThreshold": 128,
          "width": 162,
          "source": {
            "x": 73,
            "y": 1000,
            "width": 168,
            "height": 213
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 177.887,
            "y": 1033.441
          },
          "distal": {
            "x": 150.377,
            "y": 1147.088
          }
        },
        "service": {
          "alphaBounds": [
            382,
            1012,
            562,
            1229
          ],
          "alphaBoundsThreshold": 128,
          "width": 180,
          "source": {
            "x": 379,
            "y": 1009,
            "width": 186,
            "height": 223
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 485.448,
            "y": 1041.134
          },
          "distal": {
            "x": 476.138,
            "y": 1163.699
          }
        }
      }
    },
    "legs": {
      "pelvis": {
        "alphaBounds": [
          71,
          722,
          291,
          874
        ],
        "alphaBoundsThreshold": 128,
        "width": 220,
        "source": {
          "x": 68,
          "y": 719,
          "width": 226,
          "height": 158
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "waist": {
          "x": 181.0,
          "y": 787.569
        },
        "near": {
          "x": 119.125,
          "y": 840.222
        },
        "far": {
          "x": 256.625,
          "y": 837.242
        },
        "belt": {
          "x": 181.0,
          "y": 756.771
        }
      },
      "near": {
        "upper": {
          "alphaBounds": [
            416,
            661,
            580,
            912
          ],
          "alphaBoundsThreshold": 128,
          "width": 164,
          "source": {
            "x": 413,
            "y": 658,
            "width": 170,
            "height": 257
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 491.084,
            "y": 701.676
          },
          "distal": {
            "x": 516.771,
            "y": 880.253
          }
        },
        "lower": {
          "alphaBounds": [
            715,
            659,
            844,
            905
          ],
          "alphaBoundsThreshold": 128,
          "width": 129,
          "source": {
            "x": 712,
            "y": 656,
            "width": 135,
            "height": 252
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 783.931,
            "y": 707.41
          },
          "distal": {
            "x": 777.038,
            "y": 878.325
          }
        },
        "boot": {
          "alphaBounds": [
            1029,
            788,
            1201,
            930
          ],
          "alphaBoundsThreshold": 128,
          "width": 172,
          "source": {
            "x": 1026,
            "y": 785,
            "width": 178,
            "height": 148
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 1079.705,
            "y": 867.875
          },
          "proximal": {
            "x": 1079.705,
            "y": 867.875
          },
          "sole": {
            "x": 1136,
            "y": 929
          },
          "distal": {
            "x": 1136,
            "y": 929
          },
          "heel": {
            "x": 1047.89,
            "y": 917.181
          },
          "toe": {
            "x": 1184.098,
            "y": 917.181
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            99,
            949,
            289,
            1187
          ],
          "alphaBoundsThreshold": 128,
          "width": 190,
          "source": {
            "x": 96,
            "y": 946,
            "width": 196,
            "height": 244
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 169.881,
            "y": 992.816
          },
          "distal": {
            "x": 228.948,
            "y": 1159.117
          }
        },
        "lower": {
          "alphaBounds": [
            431,
            944,
            562,
            1187
          ],
          "alphaBoundsThreshold": 128,
          "width": 131,
          "source": {
            "x": 428,
            "y": 941,
            "width": 137,
            "height": 249
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 500.47,
            "y": 993.39
          },
          "distal": {
            "x": 486.576,
            "y": 1160.329
          }
        },
        "boot": {
          "alphaBounds": [
            724,
            1062,
            899,
            1198
          ],
          "alphaBoundsThreshold": 128,
          "width": 175,
          "source": {
            "x": 721,
            "y": 1059,
            "width": 181,
            "height": 142
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 772.174,
            "y": 1136.899
          },
          "proximal": {
            "x": 772.174,
            "y": 1136.899
          },
          "sole": {
            "x": 838,
            "y": 1197
          },
          "distal": {
            "x": 838,
            "y": 1197
          },
          "heel": {
            "x": 742.68,
            "y": 1184.203
          },
          "toe": {
            "x": 882.287,
            "y": 1184.203
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      }
    },
    "helmet": {
      "right": {
        "asset": {
          "id": "player.echo9.costume-parts-v165.sevastopol-security.helmet",
          "kind": "costume-helmet-parts",
          "rigType": "echo9",
          "imageKey": "playerCostumePartsV165:sevastopol-security:helmet",
          "path": "/assets/openai/sprites/player/costume-parts-v165/sevastopol-security/helmet.png",
          "sourceWidth": 2172,
          "sourceHeight": 724,
          "width": 2172,
          "height": 724,
          "sha256": "4ab34c709692c1c404f650b512f2f97861058eebc0f2b54f55d2bcb24fc32f52",
          "sourceFacing": 1,
          "exact": false,
          "visualStatus": "adapted-separated-outfit-parts",
          "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
          "pixelEditsAfterGeneration": false
        },
        "part": {
          "alphaBounds": [
            293,
            31,
            979,
            683
          ],
          "alphaBoundsThreshold": 128,
          "width": 686,
          "source": {
            "x": 290,
            "y": 28,
            "width": 692,
            "height": 658
          },
          "ear": {
            "x": 533.1,
            "y": 350.48
          },
          "sourceFacing": 1,
          "fitScale": 0.321429,
          "apertures": {
            "face": {
              "x": 787,
              "y": 377
            }
          },
          "pivotMethod": "measured ear-relative attachment; same V129 helmet width at native head scale"
        }
      },
      "left": {
        "asset": {
          "id": "player.echo9.costume-parts-v165.sevastopol-security.helmet",
          "kind": "costume-helmet-parts",
          "rigType": "echo9",
          "imageKey": "playerCostumePartsV165:sevastopol-security:helmet",
          "path": "/assets/openai/sprites/player/costume-parts-v165/sevastopol-security/helmet.png",
          "sourceWidth": 2172,
          "sourceHeight": 724,
          "width": 2172,
          "height": 724,
          "sha256": "4ab34c709692c1c404f650b512f2f97861058eebc0f2b54f55d2bcb24fc32f52",
          "sourceFacing": 1,
          "exact": false,
          "visualStatus": "adapted-separated-outfit-parts",
          "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
          "pixelEditsAfterGeneration": false
        },
        "part": {
          "alphaBounds": [
            1309,
            30,
            1997,
            681
          ],
          "alphaBoundsThreshold": 128,
          "width": 688,
          "source": {
            "x": 1306,
            "y": 27,
            "width": 694,
            "height": 657
          },
          "ear": {
            "x": 1756.2,
            "y": 348.99
          },
          "sourceFacing": -1,
          "fitScale": 0.320494,
          "apertures": {
            "face": {
              "x": 1502,
              "y": 375
            }
          },
          "pivotMethod": "measured ear-relative attachment; same V129 helmet width at native head scale"
        }
      }
    }
  },
  "ripley-bomber": {
    "slug": "ripley-bomber",
    "upperAsset": {
      "id": "player.echo9.costume-parts-v165.ripley-bomber.upper",
      "kind": "costume-upper-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:ripley-bomber:upper",
      "path": "/assets/openai/sprites/player/costume-parts-v165/ripley-bomber/upper.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "22d77f343717d0b13db5a74dbff83f4569af37b947ef50667adc979f728b2c8b",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "legAsset": {
      "id": "player.echo9.costume-parts-v165.ripley-bomber.legs",
      "kind": "costume-legs-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:ripley-bomber:legs",
      "path": "/assets/openai/sprites/player/costume-parts-v165/ripley-bomber/legs.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "07dde04614fae9b148fb4bb765238eccd137c617d16cea61a200936c7e2bd1d3",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "torso": {
      "upright": {
        "alphaBounds": [
          989,
          56,
          1227,
          326
        ],
        "alphaBoundsThreshold": 128,
        "width": 238,
        "source": {
          "x": 986,
          "y": 53,
          "width": 244,
          "height": 276
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 1038.355,
            "y": 172.471
          },
          "far": {
            "x": 1187.516,
            "y": 150.235
          },
          "waist": {
            "x": 1125.0,
            "y": 287.882
          }
        },
        "apertures": {
          "neck": {
            "x": 1130,
            "y": 82
          },
          "arm": {
            "x": 1025,
            "y": 163
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1481,
          "armPixels": 3053,
          "maxAlpha": 16
        }
      },
      "forward": {
        "alphaBounds": [
          62,
          377,
          309,
          647
        ],
        "alphaBoundsThreshold": 128,
        "width": 247,
        "source": {
          "x": 59,
          "y": 374,
          "width": 253,
          "height": 276
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 145.51,
            "y": 492.257
          },
          "far": {
            "x": 280.771,
            "y": 464.51
          },
          "waist": {
            "x": 181.971,
            "y": 608.581
          }
        },
        "apertures": {
          "neck": {
            "x": 226,
            "y": 411
          },
          "arm": {
            "x": 99,
            "y": 457
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1475,
          "armPixels": 2581,
          "maxAlpha": 16
        }
      },
      "compact": {
        "alphaBounds": [
          358,
          403,
          631,
          655
        ],
        "alphaBoundsThreshold": 128,
        "width": 273,
        "source": {
          "x": 355,
          "y": 400,
          "width": 279,
          "height": 258
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 432.455,
            "y": 526.864
          },
          "far": {
            "x": 588.455,
            "y": 491.627
          },
          "waist": {
            "x": 484.455,
            "y": 620.831
          }
        },
        "apertures": {
          "neck": {
            "x": 562,
            "y": 444
          },
          "arm": {
            "x": 420,
            "y": 509
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1721,
          "armPixels": 2435,
          "maxAlpha": 16
        }
      }
    },
    "arms": {
      "near": {
        "upper": {
          "alphaBounds": [
            722,
            376,
            883,
            655
          ],
          "alphaBoundsThreshold": 128,
          "width": 161,
          "source": {
            "x": 719,
            "y": 373,
            "width": 167,
            "height": 285
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 800.737,
            "y": 407.108
          },
          "distal": {
            "x": 801.912,
            "y": 604.449
          }
        },
        "fore": {
          "alphaBounds": [
            1036,
            386,
            1191,
            663
          ],
          "alphaBoundsThreshold": 128,
          "width": 155,
          "source": {
            "x": 1033,
            "y": 383,
            "width": 161,
            "height": 283
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1104.382,
            "y": 433.902
          },
          "distal": {
            "x": 1146.551,
            "y": 620.305
          }
        },
        "grip": {
          "alphaBounds": [
            92,
            745,
            273,
            944
          ],
          "alphaBoundsThreshold": 128,
          "width": 181,
          "source": {
            "x": 89,
            "y": 742,
            "width": 187,
            "height": 205
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 161.006,
            "y": 771.652
          },
          "distal": {
            "x": 184.762,
            "y": 869.375
          }
        },
        "service": {
          "alphaBounds": [
            361,
            748,
            565,
            962
          ],
          "alphaBoundsThreshold": 128,
          "width": 204,
          "source": {
            "x": 358,
            "y": 745,
            "width": 210,
            "height": 220
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 456.935,
            "y": 776.653
          },
          "distal": {
            "x": 458.038,
            "y": 886.787
          }
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            721,
            691,
            887,
            971
          ],
          "alphaBoundsThreshold": 128,
          "width": 166,
          "source": {
            "x": 718,
            "y": 688,
            "width": 172,
            "height": 286
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 810.046,
            "y": 721.671
          },
          "distal": {
            "x": 788.06,
            "y": 925.488
          }
        },
        "fore": {
          "alphaBounds": [
            1049,
            708,
            1199,
            971
          ],
          "alphaBoundsThreshold": 128,
          "width": 150,
          "source": {
            "x": 1046,
            "y": 705,
            "width": 156,
            "height": 269
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1133.586,
            "y": 748.775
          },
          "distal": {
            "x": 1111.03,
            "y": 933.283
          }
        },
        "grip": {
          "alphaBounds": [
            77,
            1001,
            249,
            1207
          ],
          "alphaBoundsThreshold": 128,
          "width": 172,
          "source": {
            "x": 74,
            "y": 998,
            "width": 178,
            "height": 212
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 185.176,
            "y": 1031.294
          },
          "distal": {
            "x": 155.969,
            "y": 1144.392
          }
        },
        "service": {
          "alphaBounds": [
            375,
            1004,
            582,
            1230
          ],
          "alphaBoundsThreshold": 128,
          "width": 207,
          "source": {
            "x": 372,
            "y": 1001,
            "width": 213,
            "height": 232
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 493.966,
            "y": 1034.343
          },
          "distal": {
            "x": 483.259,
            "y": 1161.991
          }
        }
      }
    },
    "legs": {
      "pelvis": {
        "alphaBounds": [
          56,
          712,
          321,
          888
        ],
        "alphaBoundsThreshold": 128,
        "width": 265,
        "source": {
          "x": 53,
          "y": 709,
          "width": 271,
          "height": 182
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "waist": {
          "x": 188.5,
          "y": 787.922
        },
        "near": {
          "x": 113.969,
          "y": 848.889
        },
        "far": {
          "x": 279.594,
          "y": 845.438
        },
        "belt": {
          "x": 188.5,
          "y": 752.261
        }
      },
      "near": {
        "upper": {
          "alphaBounds": [
            407,
            654,
            613,
            921
          ],
          "alphaBoundsThreshold": 128,
          "width": 206,
          "source": {
            "x": 404,
            "y": 651,
            "width": 212,
            "height": 273
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 501.313,
            "y": 697.269
          },
          "distal": {
            "x": 533.578,
            "y": 887.229
          }
        },
        "lower": {
          "alphaBounds": [
            711,
            653,
            853,
            917
          ],
          "alphaBoundsThreshold": 128,
          "width": 142,
          "source": {
            "x": 708,
            "y": 650,
            "width": 148,
            "height": 270
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 786.878,
            "y": 704.952
          },
          "distal": {
            "x": 779.29,
            "y": 888.373
          }
        },
        "boot": {
          "alphaBounds": [
            1030,
            801,
            1231,
            920
          ],
          "alphaBoundsThreshold": 128,
          "width": 201,
          "source": {
            "x": 1027,
            "y": 798,
            "width": 207,
            "height": 125
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 1089.254,
            "y": 867.938
          },
          "proximal": {
            "x": 1089.254,
            "y": 867.938
          },
          "sole": {
            "x": 1155,
            "y": 919
          },
          "distal": {
            "x": 1155,
            "y": 919
          },
          "heel": {
            "x": 1052.075,
            "y": 909.257
          },
          "toe": {
            "x": 1211.249,
            "y": 909.257
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            81,
            943,
            327,
            1196
          ],
          "alphaBoundsThreshold": 128,
          "width": 246,
          "source": {
            "x": 78,
            "y": 940,
            "width": 252,
            "height": 259
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 172.772,
            "y": 989.577
          },
          "distal": {
            "x": 249.249,
            "y": 1166.36
          }
        },
        "lower": {
          "alphaBounds": [
            428,
            942,
            575,
            1195
          ],
          "alphaBoundsThreshold": 128,
          "width": 147,
          "source": {
            "x": 425,
            "y": 939,
            "width": 153,
            "height": 259
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 505.955,
            "y": 993.423
          },
          "distal": {
            "x": 490.364,
            "y": 1167.232
          }
        },
        "boot": {
          "alphaBounds": [
            725,
            1091,
            934,
            1206
          ],
          "alphaBoundsThreshold": 128,
          "width": 209,
          "source": {
            "x": 722,
            "y": 1088,
            "width": 215,
            "height": 121
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 782.534,
            "y": 1154.333
          },
          "proximal": {
            "x": 782.534,
            "y": 1154.333
          },
          "sole": {
            "x": 857,
            "y": 1205
          },
          "distal": {
            "x": 857,
            "y": 1205
          },
          "heel": {
            "x": 747.309,
            "y": 1194.333
          },
          "toe": {
            "x": 914.039,
            "y": 1194.333
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      }
    }
  },
  "bishop-utility": {
    "slug": "bishop-utility",
    "upperAsset": {
      "id": "player.echo9.costume-parts-v165.bishop-utility.upper",
      "kind": "costume-upper-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:bishop-utility:upper",
      "path": "/assets/openai/sprites/player/costume-parts-v165/bishop-utility/upper.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "5ea9ab2194818d33a234c51df819e853a3b36aeeb822a2c2db75778d10efc32e",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "legAsset": {
      "id": "player.echo9.costume-parts-v165.bishop-utility.legs",
      "kind": "costume-legs-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:bishop-utility:legs",
      "path": "/assets/openai/sprites/player/costume-parts-v165/bishop-utility/legs.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "9fcb95be2fd42bb19a520a7fc7ef3a2fa2adf426ee3da478c163b58d34bc4b84",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "torso": {
      "upright": {
        "alphaBounds": [
          986,
          59,
          1220,
          332
        ],
        "alphaBoundsThreshold": 128,
        "width": 234,
        "source": {
          "x": 983,
          "y": 56,
          "width": 240,
          "height": 279
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 1034.525,
            "y": 176.765
          },
          "far": {
            "x": 1181.18,
            "y": 154.282
          },
          "waist": {
            "x": 1119.714,
            "y": 293.459
          }
        },
        "apertures": {
          "neck": {
            "x": 1128,
            "y": 85
          },
          "arm": {
            "x": 1020,
            "y": 159
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1335,
          "armPixels": 2805,
          "maxAlpha": 16
        }
      },
      "forward": {
        "alphaBounds": [
          69,
          378,
          294,
          641
        ],
        "alphaBoundsThreshold": 128,
        "width": 225,
        "source": {
          "x": 66,
          "y": 375,
          "width": 231,
          "height": 269
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 145.071,
            "y": 490.269
          },
          "far": {
            "x": 268.286,
            "y": 463.241
          },
          "waist": {
            "x": 178.286,
            "y": 603.577
          }
        },
        "apertures": {
          "neck": {
            "x": 218,
            "y": 408
          },
          "arm": {
            "x": 104,
            "y": 457
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1339,
          "armPixels": 2497,
          "maxAlpha": 16
        }
      },
      "compact": {
        "alphaBounds": [
          359,
          399,
          619,
          649
        ],
        "alphaBoundsThreshold": 128,
        "width": 260,
        "source": {
          "x": 356,
          "y": 396,
          "width": 266,
          "height": 256
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 429.909,
            "y": 521.881
          },
          "far": {
            "x": 578.481,
            "y": 486.924
          },
          "waist": {
            "x": 479.433,
            "y": 615.102
          }
        },
        "apertures": {
          "neck": {
            "x": 559,
            "y": 436
          },
          "arm": {
            "x": 429,
            "y": 513
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1413,
          "armPixels": 2081,
          "maxAlpha": 16
        }
      }
    },
    "arms": {
      "near": {
        "upper": {
          "alphaBounds": [
            723,
            371,
            870,
            667
          ],
          "alphaBoundsThreshold": 128,
          "width": 147,
          "source": {
            "x": 720,
            "y": 368,
            "width": 153,
            "height": 302
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 794.891,
            "y": 404.003
          },
          "distal": {
            "x": 795.964,
            "y": 613.369
          }
        },
        "fore": {
          "alphaBounds": [
            1036,
            387,
            1196,
            675
          ],
          "alphaBoundsThreshold": 128,
          "width": 160,
          "source": {
            "x": 1033,
            "y": 384,
            "width": 166,
            "height": 294
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1106.588,
            "y": 436.805
          },
          "distal": {
            "x": 1150.118,
            "y": 630.609
          }
        },
        "grip": {
          "alphaBounds": [
            95,
            715,
            267,
            941
          ],
          "alphaBoundsThreshold": 128,
          "width": 172,
          "source": {
            "x": 92,
            "y": 712,
            "width": 178,
            "height": 232
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 160.575,
            "y": 745.268
          },
          "distal": {
            "x": 183.15,
            "y": 856.25
          }
        },
        "service": {
          "alphaBounds": [
            366,
            715,
            562,
            961
          ],
          "alphaBoundsThreshold": 128,
          "width": 196,
          "source": {
            "x": 363,
            "y": 712,
            "width": 202,
            "height": 252
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 458.173,
            "y": 747.937
          },
          "distal": {
            "x": 459.232,
            "y": 874.54
          }
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            714,
            685,
            884,
            978
          ],
          "alphaBoundsThreshold": 128,
          "width": 170,
          "source": {
            "x": 711,
            "y": 682,
            "width": 176,
            "height": 299
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 805.192,
            "y": 717.095
          },
          "distal": {
            "x": 782.675,
            "y": 930.375
          }
        },
        "fore": {
          "alphaBounds": [
            1037,
            707,
            1194,
            977
          ],
          "alphaBoundsThreshold": 128,
          "width": 157,
          "source": {
            "x": 1034,
            "y": 704,
            "width": 163,
            "height": 276
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1125.534,
            "y": 748.86
          },
          "distal": {
            "x": 1101.925,
            "y": 938.279
          }
        },
        "grip": {
          "alphaBounds": [
            76,
            998,
            247,
            1205
          ],
          "alphaBoundsThreshold": 128,
          "width": 171,
          "source": {
            "x": 73,
            "y": 995,
            "width": 177,
            "height": 213
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 183.547,
            "y": 1028.441
          },
          "distal": {
            "x": 154.509,
            "y": 1142.088
          }
        },
        "service": {
          "alphaBounds": [
            376,
            1002,
            579,
            1230
          ],
          "alphaBoundsThreshold": 128,
          "width": 203,
          "source": {
            "x": 373,
            "y": 999,
            "width": 209,
            "height": 234
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 492.667,
            "y": 1032.611
          },
          "distal": {
            "x": 482.167,
            "y": 1161.389
          }
        }
      }
    },
    "legs": {
      "pelvis": {
        "alphaBounds": [
          60,
          708,
          339,
          890
        ],
        "alphaBoundsThreshold": 128,
        "width": 279,
        "source": {
          "x": 57,
          "y": 705,
          "width": 285,
          "height": 188
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "waist": {
          "x": 199.5,
          "y": 786.51
        },
        "near": {
          "x": 121.031,
          "y": 849.556
        },
        "far": {
          "x": 295.406,
          "y": 845.987
        },
        "belt": {
          "x": 199.5,
          "y": 749.634
        }
      },
      "near": {
        "upper": {
          "alphaBounds": [
            422,
            658,
            634,
            925
          ],
          "alphaBoundsThreshold": 128,
          "width": 212,
          "source": {
            "x": 419,
            "y": 655,
            "width": 218,
            "height": 273
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 519.06,
            "y": 701.269
          },
          "distal": {
            "x": 552.265,
            "y": 891.229
          }
        },
        "lower": {
          "alphaBounds": [
            737,
            660,
            868,
            921
          ],
          "alphaBoundsThreshold": 128,
          "width": 131,
          "source": {
            "x": 734,
            "y": 657,
            "width": 137,
            "height": 267
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 807.0,
            "y": 711.361
          },
          "distal": {
            "x": 800.0,
            "y": 892.699
          }
        },
        "boot": {
          "alphaBounds": [
            1007,
            820,
            1226,
            934
          ],
          "alphaBoundsThreshold": 128,
          "width": 219,
          "source": {
            "x": 1004,
            "y": 817,
            "width": 225,
            "height": 120
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 1071.561,
            "y": 884.125
          },
          "proximal": {
            "x": 1071.561,
            "y": 884.125
          },
          "sole": {
            "x": 1144,
            "y": 933
          },
          "distal": {
            "x": 1144,
            "y": 933
          },
          "heel": {
            "x": 1031.052,
            "y": 923.708
          },
          "toe": {
            "x": 1204.48,
            "y": 923.708
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            101,
            952,
            361,
            1212
          ],
          "alphaBoundsThreshold": 128,
          "width": 260,
          "source": {
            "x": 98,
            "y": 949,
            "width": 266,
            "height": 266
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 197.995,
            "y": 999.866
          },
          "distal": {
            "x": 278.824,
            "y": 1181.54
          }
        },
        "lower": {
          "alphaBounds": [
            445,
            950,
            611,
            1216
          ],
          "alphaBoundsThreshold": 128,
          "width": 166,
          "source": {
            "x": 442,
            "y": 947,
            "width": 172,
            "height": 272
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 533.03,
            "y": 1004.065
          },
          "distal": {
            "x": 515.424,
            "y": 1186.805
          }
        },
        "boot": {
          "alphaBounds": [
            739,
            1059,
            950,
            1218
          ],
          "alphaBoundsThreshold": 128,
          "width": 211,
          "source": {
            "x": 736,
            "y": 1056,
            "width": 217,
            "height": 165
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 797.084,
            "y": 1146.565
          },
          "proximal": {
            "x": 797.084,
            "y": 1146.565
          },
          "sole": {
            "x": 877,
            "y": 1217
          },
          "distal": {
            "x": 877,
            "y": 1217
          },
          "heel": {
            "x": 761.522,
            "y": 1201.87
          },
          "toe": {
            "x": 929.848,
            "y": 1201.87
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      }
    }
  },
  "fireteam-seegson-maintenance": {
    "slug": "fireteam-seegson-maintenance",
    "upperAsset": {
      "id": "player.echo9.costume-parts-v165.fireteam-seegson-maintenance.upper",
      "kind": "costume-upper-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:fireteam-seegson-maintenance:upper",
      "path": "/assets/openai/sprites/player/costume-parts-v165/fireteam-seegson-maintenance/upper.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "ea8d6b1e8bc31e51956aa03ef475f5be481b329fa2f544fff9dbedf290e9b02d",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "legAsset": {
      "id": "player.echo9.costume-parts-v165.fireteam-seegson-maintenance.legs",
      "kind": "costume-legs-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:fireteam-seegson-maintenance:legs",
      "path": "/assets/openai/sprites/player/costume-parts-v165/fireteam-seegson-maintenance/legs.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "98961785a5711ccdc2e1ae818dff27339f8cf0c14c2d08209aa8c94de2fd771d",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "torso": {
      "upright": {
        "alphaBounds": [
          986,
          57,
          1228,
          353
        ],
        "alphaBoundsThreshold": 128,
        "width": 242,
        "source": {
          "x": 983,
          "y": 54,
          "width": 248,
          "height": 302
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 1036.184,
            "y": 184.686
          },
          "far": {
            "x": 1187.853,
            "y": 160.31
          },
          "waist": {
            "x": 1124.286,
            "y": 311.212
          }
        },
        "apertures": {
          "neck": {
            "x": 1131,
            "y": 79
          },
          "arm": {
            "x": 1022,
            "y": 166
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1104,
          "armPixels": 2750,
          "maxAlpha": 16
        }
      },
      "forward": {
        "alphaBounds": [
          59,
          383,
          301,
          665
        ],
        "alphaBoundsThreshold": 128,
        "width": 242,
        "source": {
          "x": 56,
          "y": 380,
          "width": 248,
          "height": 288
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 140.819,
            "y": 503.379
          },
          "far": {
            "x": 273.343,
            "y": 474.399
          },
          "waist": {
            "x": 176.543,
            "y": 624.874
          }
        },
        "apertures": {
          "neck": {
            "x": 219,
            "y": 412
          },
          "arm": {
            "x": 97,
            "y": 471
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1146,
          "armPixels": 2871,
          "maxAlpha": 16
        }
      },
      "compact": {
        "alphaBounds": [
          363,
          403,
          627,
          677
        ],
        "alphaBoundsThreshold": 128,
        "width": 264,
        "source": {
          "x": 360,
          "y": 400,
          "width": 270,
          "height": 280
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 435.0,
            "y": 537.678
          },
          "far": {
            "x": 585.857,
            "y": 499.364
          },
          "waist": {
            "x": 485.286,
            "y": 639.847
          }
        },
        "apertures": {
          "neck": {
            "x": 554,
            "y": 437
          },
          "arm": {
            "x": 410,
            "y": 533
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1323,
          "armPixels": 1216,
          "maxAlpha": 16
        }
      }
    },
    "arms": {
      "near": {
        "upper": {
          "alphaBounds": [
            719,
            378,
            877,
            692
          ],
          "alphaBoundsThreshold": 128,
          "width": 158,
          "source": {
            "x": 716,
            "y": 375,
            "width": 164,
            "height": 320
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 796.27,
            "y": 413.01
          },
          "distal": {
            "x": 797.423,
            "y": 635.108
          }
        },
        "fore": {
          "alphaBounds": [
            1040,
            390,
            1206,
            693
          ],
          "alphaBoundsThreshold": 128,
          "width": 166,
          "source": {
            "x": 1037,
            "y": 387,
            "width": 172,
            "height": 309
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1113.235,
            "y": 442.398
          },
          "distal": {
            "x": 1158.397,
            "y": 646.297
          }
        },
        "grip": {
          "alphaBounds": [
            87,
            719,
            274,
            945
          ],
          "alphaBoundsThreshold": 128,
          "width": 187,
          "source": {
            "x": 84,
            "y": 716,
            "width": 193,
            "height": 232
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 158.294,
            "y": 749.268
          },
          "distal": {
            "x": 182.837,
            "y": 860.25
          }
        },
        "service": {
          "alphaBounds": [
            365,
            719,
            580,
            967
          ],
          "alphaBoundsThreshold": 128,
          "width": 215,
          "source": {
            "x": 362,
            "y": 716,
            "width": 221,
            "height": 254
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 466.108,
            "y": 752.205
          },
          "distal": {
            "x": 467.27,
            "y": 879.837
          }
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            709,
            695,
            883,
            1031
          ],
          "alphaBoundsThreshold": 128,
          "width": 174,
          "source": {
            "x": 706,
            "y": 692,
            "width": 180,
            "height": 342
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 802.338,
            "y": 731.806
          },
          "distal": {
            "x": 779.291,
            "y": 976.385
          }
        },
        "fore": {
          "alphaBounds": [
            1033,
            714,
            1197,
            1028
          ],
          "alphaBoundsThreshold": 128,
          "width": 164,
          "source": {
            "x": 1030,
            "y": 711,
            "width": 170,
            "height": 320
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1125.481,
            "y": 762.682
          },
          "distal": {
            "x": 1100.82,
            "y": 982.969
          }
        },
        "grip": {
          "alphaBounds": [
            75,
            994,
            251,
            1214
          ],
          "alphaBoundsThreshold": 128,
          "width": 176,
          "source": {
            "x": 72,
            "y": 991,
            "width": 182,
            "height": 226
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 185.692,
            "y": 1026.353
          },
          "distal": {
            "x": 155.805,
            "y": 1147.137
          }
        },
        "service": {
          "alphaBounds": [
            380,
            996,
            596,
            1228
          ],
          "alphaBoundsThreshold": 128,
          "width": 216,
          "source": {
            "x": 377,
            "y": 993,
            "width": 222,
            "height": 238
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 504.138,
            "y": 1027.148
          },
          "distal": {
            "x": 492.966,
            "y": 1158.185
          }
        }
      }
    },
    "legs": {
      "pelvis": {
        "alphaBounds": [
          60,
          712,
          316,
          883
        ],
        "alphaBoundsThreshold": 128,
        "width": 256,
        "source": {
          "x": 57,
          "y": 709,
          "width": 262,
          "height": 177
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "waist": {
          "x": 188.0,
          "y": 785.765
        },
        "near": {
          "x": 116.0,
          "y": 845.0
        },
        "far": {
          "x": 276.0,
          "y": 841.647
        },
        "belt": {
          "x": 188.0,
          "y": 751.118
        }
      },
      "near": {
        "upper": {
          "alphaBounds": [
            412,
            660,
            604,
            922
          ],
          "alphaBoundsThreshold": 128,
          "width": 192,
          "source": {
            "x": 409,
            "y": 657,
            "width": 198,
            "height": 268
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 499.904,
            "y": 702.458
          },
          "distal": {
            "x": 529.976,
            "y": 888.862
          }
        },
        "lower": {
          "alphaBounds": [
            713,
            656,
            855,
            916
          ],
          "alphaBoundsThreshold": 128,
          "width": 142,
          "source": {
            "x": 710,
            "y": 653,
            "width": 148,
            "height": 266
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 788.878,
            "y": 707.165
          },
          "distal": {
            "x": 781.29,
            "y": 887.807
          }
        },
        "boot": {
          "alphaBounds": [
            1026,
            770,
            1224,
            927
          ],
          "alphaBoundsThreshold": 128,
          "width": 198,
          "source": {
            "x": 1023,
            "y": 767,
            "width": 204,
            "height": 163
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 1084.37,
            "y": 858.312
          },
          "proximal": {
            "x": 1084.37,
            "y": 858.312
          },
          "sole": {
            "x": 1150,
            "y": 926
          },
          "distal": {
            "x": 1150,
            "y": 926
          },
          "heel": {
            "x": 1047.746,
            "y": 912.826
          },
          "toe": {
            "x": 1204.543,
            "y": 912.826
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            96,
            942,
            312,
            1200
          ],
          "alphaBoundsThreshold": 128,
          "width": 216,
          "source": {
            "x": 93,
            "y": 939,
            "width": 222,
            "height": 264
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 176.58,
            "y": 989.498
          },
          "distal": {
            "x": 243.731,
            "y": 1169.774
          }
        },
        "lower": {
          "alphaBounds": [
            429,
            944,
            573,
            1197
          ],
          "alphaBoundsThreshold": 128,
          "width": 144,
          "source": {
            "x": 426,
            "y": 941,
            "width": 150,
            "height": 259
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 505.364,
            "y": 995.423
          },
          "distal": {
            "x": 490.091,
            "y": 1169.232
          }
        },
        "boot": {
          "alphaBounds": [
            721,
            1054,
            931,
            1208
          ],
          "alphaBoundsThreshold": 128,
          "width": 210,
          "source": {
            "x": 718,
            "y": 1051,
            "width": 216,
            "height": 160
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 778.809,
            "y": 1138.812
          },
          "proximal": {
            "x": 778.809,
            "y": 1138.812
          },
          "sole": {
            "x": 858,
            "y": 1207
          },
          "distal": {
            "x": 858,
            "y": 1207
          },
          "heel": {
            "x": 743.416,
            "y": 1192.377
          },
          "toe": {
            "x": 910.944,
            "y": 1192.377
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      }
    }
  },
  "fireteam-nostromo-jacket": {
    "slug": "fireteam-nostromo-jacket",
    "upperAsset": {
      "id": "player.echo9.costume-parts-v165.fireteam-nostromo-jacket.upper",
      "kind": "costume-upper-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:fireteam-nostromo-jacket:upper",
      "path": "/assets/openai/sprites/player/costume-parts-v165/fireteam-nostromo-jacket/upper.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "ad039798c76f8d8b385eb353de909f54b24978a2b0e3799c08b8936a04aa435a",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "legAsset": {
      "id": "player.echo9.costume-parts-v165.fireteam-nostromo-jacket.legs",
      "kind": "costume-legs-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:fireteam-nostromo-jacket:legs",
      "path": "/assets/openai/sprites/player/costume-parts-v165/fireteam-nostromo-jacket/legs.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "28d37b972d0dd8e4e72216e31431a689043f49ffec5dc7325e9b60fdcee69713",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "torso": {
      "upright": {
        "alphaBounds": [
          987,
          54,
          1227,
          343
        ],
        "alphaBoundsThreshold": 128,
        "width": 240,
        "source": {
          "x": 984,
          "y": 51,
          "width": 246,
          "height": 295
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 1036.77,
            "y": 178.667
          },
          "far": {
            "x": 1187.184,
            "y": 154.867
          },
          "waist": {
            "x": 1124.143,
            "y": 302.2
          }
        },
        "apertures": {
          "neck": {
            "x": 1141,
            "y": 76
          },
          "arm": {
            "x": 1024,
            "y": 158
          }
        },
        "apertureMeasurements": {
          "neckPixels": 776,
          "armPixels": 2557,
          "maxAlpha": 16
        }
      },
      "forward": {
        "alphaBounds": [
          59,
          378,
          311,
          660
        ],
        "alphaBoundsThreshold": 128,
        "width": 252,
        "source": {
          "x": 56,
          "y": 375,
          "width": 258,
          "height": 288
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 144.2,
            "y": 498.379
          },
          "far": {
            "x": 282.2,
            "y": 469.399
          },
          "waist": {
            "x": 181.4,
            "y": 619.874
          }
        },
        "apertures": {
          "neck": {
            "x": 233,
            "y": 408
          },
          "arm": {
            "x": 98,
            "y": 473
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1046,
          "armPixels": 2386,
          "maxAlpha": 16
        }
      },
      "compact": {
        "alphaBounds": [
          368,
          400,
          644,
          672
        ],
        "alphaBoundsThreshold": 128,
        "width": 276,
        "source": {
          "x": 365,
          "y": 397,
          "width": 282,
          "height": 278
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 443.273,
            "y": 533.695
          },
          "far": {
            "x": 600.987,
            "y": 495.661
          },
          "waist": {
            "x": 495.844,
            "y": 635.119
          }
        },
        "apertures": {
          "neck": {
            "x": 563,
            "y": 444
          },
          "arm": {
            "x": 412,
            "y": 544
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1183,
          "armPixels": 1441,
          "maxAlpha": 16
        }
      }
    },
    "arms": {
      "near": {
        "upper": {
          "alphaBounds": [
            724,
            372,
            884,
            681
          ],
          "alphaBoundsThreshold": 128,
          "width": 160,
          "source": {
            "x": 721,
            "y": 369,
            "width": 166,
            "height": 315
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 802.248,
            "y": 406.453
          },
          "distal": {
            "x": 803.416,
            "y": 625.014
          }
        },
        "fore": {
          "alphaBounds": [
            1042,
            385,
            1211,
            680
          ],
          "alphaBoundsThreshold": 128,
          "width": 169,
          "source": {
            "x": 1039,
            "y": 382,
            "width": 175,
            "height": 301
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1116.559,
            "y": 436.015
          },
          "distal": {
            "x": 1162.537,
            "y": 634.53
          }
        },
        "grip": {
          "alphaBounds": [
            92,
            710,
            284,
            941
          ],
          "alphaBoundsThreshold": 128,
          "width": 192,
          "source": {
            "x": 89,
            "y": 707,
            "width": 198,
            "height": 237
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 165.2,
            "y": 740.938
          },
          "distal": {
            "x": 190.4,
            "y": 854.375
          }
        },
        "service": {
          "alphaBounds": [
            363,
            711,
            587,
            968
          ],
          "alphaBoundsThreshold": 128,
          "width": 224,
          "source": {
            "x": 360,
            "y": 708,
            "width": 230,
            "height": 263
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 468.341,
            "y": 745.41
          },
          "distal": {
            "x": 469.551,
            "y": 877.674
          }
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            730,
            691,
            909,
            1011
          ],
          "alphaBoundsThreshold": 128,
          "width": 179,
          "source": {
            "x": 727,
            "y": 688,
            "width": 185,
            "height": 326
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 826.02,
            "y": 726.053
          },
          "distal": {
            "x": 802.311,
            "y": 958.986
          }
        },
        "fore": {
          "alphaBounds": [
            1028,
            702,
            1206,
            1007
          ],
          "alphaBoundsThreshold": 128,
          "width": 178,
          "source": {
            "x": 1025,
            "y": 699,
            "width": 184,
            "height": 311
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1128.376,
            "y": 749.287
          },
          "distal": {
            "x": 1101.609,
            "y": 963.26
          }
        },
        "grip": {
          "alphaBounds": [
            70,
            992,
            256,
            1211
          ],
          "alphaBoundsThreshold": 128,
          "width": 186,
          "source": {
            "x": 67,
            "y": 989,
            "width": 192,
            "height": 225
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 186.981,
            "y": 1024.206
          },
          "distal": {
            "x": 155.396,
            "y": 1144.441
          }
        },
        "service": {
          "alphaBounds": [
            375,
            997,
            606,
            1239
          ],
          "alphaBoundsThreshold": 128,
          "width": 231,
          "source": {
            "x": 372,
            "y": 994,
            "width": 237,
            "height": 248
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 507.759,
            "y": 1029.491
          },
          "distal": {
            "x": 495.81,
            "y": 1166.176
          }
        }
      }
    },
    "legs": {
      "pelvis": {
        "alphaBounds": [
          56,
          701,
          318,
          883
        ],
        "alphaBoundsThreshold": 128,
        "width": 262,
        "source": {
          "x": 53,
          "y": 698,
          "width": 268,
          "height": 188
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "waist": {
          "x": 187.0,
          "y": 779.51
        },
        "near": {
          "x": 113.312,
          "y": 842.556
        },
        "far": {
          "x": 277.062,
          "y": 838.987
        },
        "belt": {
          "x": 187.0,
          "y": 742.634
        }
      },
      "near": {
        "upper": {
          "alphaBounds": [
            415,
            655,
            595,
            914
          ],
          "alphaBoundsThreshold": 128,
          "width": 180,
          "source": {
            "x": 412,
            "y": 652,
            "width": 186,
            "height": 265
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 497.41,
            "y": 696.972
          },
          "distal": {
            "x": 525.602,
            "y": 881.241
          }
        },
        "lower": {
          "alphaBounds": [
            718,
            656,
            852,
            915
          ],
          "alphaBoundsThreshold": 128,
          "width": 134,
          "source": {
            "x": 715,
            "y": 653,
            "width": 140,
            "height": 265
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 789.603,
            "y": 706.968
          },
          "distal": {
            "x": 782.443,
            "y": 886.916
          }
        },
        "boot": {
          "alphaBounds": [
            1034,
            768,
            1220,
            925
          ],
          "alphaBoundsThreshold": 128,
          "width": 186,
          "source": {
            "x": 1031,
            "y": 765,
            "width": 192,
            "height": 163
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 1088.832,
            "y": 856.312
          },
          "proximal": {
            "x": 1088.832,
            "y": 856.312
          },
          "sole": {
            "x": 1150,
            "y": 924
          },
          "distal": {
            "x": 1150,
            "y": 924
          },
          "heel": {
            "x": 1054.428,
            "y": 910.826
          },
          "toe": {
            "x": 1201.723,
            "y": 910.826
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            92,
            939,
            308,
            1192
          ],
          "alphaBoundsThreshold": 128,
          "width": 216,
          "source": {
            "x": 89,
            "y": 936,
            "width": 222,
            "height": 259
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 172.58,
            "y": 985.577
          },
          "distal": {
            "x": 239.731,
            "y": 1162.36
          }
        },
        "lower": {
          "alphaBounds": [
            428,
            939,
            566,
            1193
          ],
          "alphaBoundsThreshold": 128,
          "width": 138,
          "source": {
            "x": 425,
            "y": 936,
            "width": 144,
            "height": 260
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 501.182,
            "y": 990.626
          },
          "distal": {
            "x": 486.545,
            "y": 1165.122
          }
        },
        "boot": {
          "alphaBounds": [
            726,
            1052,
            923,
            1205
          ],
          "alphaBoundsThreshold": 128,
          "width": 197,
          "source": {
            "x": 723,
            "y": 1049,
            "width": 203,
            "height": 159
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 780.23,
            "y": 1136.261
          },
          "proximal": {
            "x": 780.23,
            "y": 1136.261
          },
          "sole": {
            "x": 850,
            "y": 1204
          },
          "distal": {
            "x": 850,
            "y": 1204
          },
          "heel": {
            "x": 747.028,
            "y": 1189.478
          },
          "toe": {
            "x": 904.185,
            "y": 1189.478
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      }
    }
  },
  "fireteam-flightsuit": {
    "slug": "fireteam-flightsuit",
    "upperAsset": {
      "id": "player.echo9.costume-parts-v165.fireteam-flightsuit.upper",
      "kind": "costume-upper-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:fireteam-flightsuit:upper",
      "path": "/assets/openai/sprites/player/costume-parts-v165/fireteam-flightsuit/upper.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "b936ffb3b66d591f186bb4fc8afd684549ab566c6892926ae99291d522fe9056",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "legAsset": {
      "id": "player.echo9.costume-parts-v165.fireteam-flightsuit.legs",
      "kind": "costume-legs-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:fireteam-flightsuit:legs",
      "path": "/assets/openai/sprites/player/costume-parts-v165/fireteam-flightsuit/legs.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "5439984779ab2e028ff0098e79ba3aa98467d81cd094ce957f0b689867d9f290",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
      "pixelEditsAfterGeneration": false
    },
    "torso": {
      "upright": {
        "alphaBounds": [
          987,
          59,
          1222,
          328
        ],
        "alphaBoundsThreshold": 128,
        "width": 235,
        "source": {
          "x": 984,
          "y": 56,
          "width": 241,
          "height": 275
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 1035.733,
            "y": 175.039
          },
          "far": {
            "x": 1183.014,
            "y": 152.886
          },
          "waist": {
            "x": 1121.286,
            "y": 290.024
          }
        },
        "apertures": {
          "neck": {
            "x": 1128,
            "y": 86
          },
          "arm": {
            "x": 1020,
            "y": 157
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1198,
          "armPixels": 2753,
          "maxAlpha": 16
        }
      },
      "forward": {
        "alphaBounds": [
          61,
          375,
          301,
          636
        ],
        "alphaBoundsThreshold": 128,
        "width": 240,
        "source": {
          "x": 58,
          "y": 372,
          "width": 246,
          "height": 267
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 142.143,
            "y": 486.415
          },
          "far": {
            "x": 273.571,
            "y": 459.593
          },
          "waist": {
            "x": 177.571,
            "y": 598.862
          }
        },
        "apertures": {
          "neck": {
            "x": 219,
            "y": 407
          },
          "arm": {
            "x": 95,
            "y": 458
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1111,
          "armPixels": 2613,
          "maxAlpha": 16
        }
      },
      "compact": {
        "alphaBounds": [
          370,
          392,
          624,
          647
        ],
        "alphaBoundsThreshold": 128,
        "width": 254,
        "source": {
          "x": 367,
          "y": 389,
          "width": 260,
          "height": 261
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "joints": {
          "near": {
            "x": 439.273,
            "y": 517.339
          },
          "far": {
            "x": 584.416,
            "y": 481.682
          },
          "waist": {
            "x": 487.654,
            "y": 612.424
          }
        },
        "apertures": {
          "neck": {
            "x": 560,
            "y": 431
          },
          "arm": {
            "x": 423,
            "y": 521
          }
        },
        "apertureMeasurements": {
          "neckPixels": 1340,
          "armPixels": 1447,
          "maxAlpha": 16
        }
      }
    },
    "arms": {
      "near": {
        "upper": {
          "alphaBounds": [
            714,
            370,
            874,
            656
          ],
          "alphaBoundsThreshold": 128,
          "width": 160,
          "source": {
            "x": 711,
            "y": 367,
            "width": 166,
            "height": 292
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 792.248,
            "y": 401.889
          },
          "distal": {
            "x": 793.416,
            "y": 604.181
          }
        },
        "fore": {
          "alphaBounds": [
            1036,
            382,
            1200,
            674
          ],
          "alphaBoundsThreshold": 128,
          "width": 164,
          "source": {
            "x": 1033,
            "y": 379,
            "width": 170,
            "height": 298
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1108.353,
            "y": 432.496
          },
          "distal": {
            "x": 1152.971,
            "y": 628.992
          }
        },
        "grip": {
          "alphaBounds": [
            86,
            712,
            275,
            943
          ],
          "alphaBoundsThreshold": 128,
          "width": 189,
          "source": {
            "x": 83,
            "y": 709,
            "width": 195,
            "height": 237
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 158.056,
            "y": 742.938
          },
          "distal": {
            "x": 182.863,
            "y": 856.375
          }
        },
        "service": {
          "alphaBounds": [
            354,
            710,
            568,
            964
          ],
          "alphaBoundsThreshold": 128,
          "width": 214,
          "source": {
            "x": 351,
            "y": 707,
            "width": 220,
            "height": 260
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 454.638,
            "y": 744.008
          },
          "distal": {
            "x": 455.795,
            "y": 874.728
          }
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            714,
            685,
            888,
            984
          ],
          "alphaBoundsThreshold": 128,
          "width": 174,
          "source": {
            "x": 711,
            "y": 682,
            "width": 180,
            "height": 305
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 807.338,
            "y": 717.753
          },
          "distal": {
            "x": 784.291,
            "y": 935.399
          }
        },
        "fore": {
          "alphaBounds": [
            1046,
            704,
            1198,
            993
          ],
          "alphaBoundsThreshold": 128,
          "width": 152,
          "source": {
            "x": 1043,
            "y": 701,
            "width": 158,
            "height": 295
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1131.714,
            "y": 748.806
          },
          "distal": {
            "x": 1108.857,
            "y": 951.554
          }
        },
        "grip": {
          "alphaBounds": [
            72,
            995,
            251,
            1209
          ],
          "alphaBoundsThreshold": 128,
          "width": 179,
          "source": {
            "x": 69,
            "y": 992,
            "width": 185,
            "height": 220
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 184.579,
            "y": 1026.471
          },
          "distal": {
            "x": 154.182,
            "y": 1143.961
          }
        },
        "service": {
          "alphaBounds": [
            375,
            995,
            584,
            1233
          ],
          "alphaBoundsThreshold": 128,
          "width": 209,
          "source": {
            "x": 372,
            "y": 992,
            "width": 215,
            "height": 244
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 495.115,
            "y": 1026.954
          },
          "distal": {
            "x": 484.305,
            "y": 1161.38
          }
        }
      }
    },
    "legs": {
      "pelvis": {
        "alphaBounds": [
          47,
          702,
          338,
          901
        ],
        "alphaBoundsThreshold": 128,
        "width": 291,
        "source": {
          "x": 44,
          "y": 699,
          "width": 297,
          "height": 205
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "waist": {
          "x": 192.5,
          "y": 787.843
        },
        "near": {
          "x": 110.656,
          "y": 856.778
        },
        "far": {
          "x": 292.531,
          "y": 852.876
        },
        "belt": {
          "x": 192.5,
          "y": 747.523
        }
      },
      "near": {
        "upper": {
          "alphaBounds": [
            412,
            657,
            614,
            928
          ],
          "alphaBoundsThreshold": 128,
          "width": 202,
          "source": {
            "x": 409,
            "y": 654,
            "width": 208,
            "height": 277
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 504.482,
            "y": 700.917
          },
          "distal": {
            "x": 536.12,
            "y": 893.723
          }
        },
        "lower": {
          "alphaBounds": [
            714,
            655,
            857,
            923
          ],
          "alphaBoundsThreshold": 128,
          "width": 143,
          "source": {
            "x": 711,
            "y": 652,
            "width": 149,
            "height": 274
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 790.412,
            "y": 707.739
          },
          "distal": {
            "x": 782.771,
            "y": 893.94
          }
        },
        "boot": {
          "alphaBounds": [
            1025,
            787,
            1232,
            940
          ],
          "alphaBoundsThreshold": 128,
          "width": 207,
          "source": {
            "x": 1022,
            "y": 784,
            "width": 213,
            "height": 159
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 1086.023,
            "y": 873.062
          },
          "proximal": {
            "x": 1086.023,
            "y": 873.062
          },
          "sole": {
            "x": 1154,
            "y": 939
          },
          "distal": {
            "x": 1154,
            "y": 939
          },
          "heel": {
            "x": 1047.734,
            "y": 926.188
          },
          "toe": {
            "x": 1211.659,
            "y": 926.188
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            85,
            943,
            321,
            1204
          ],
          "alphaBoundsThreshold": 128,
          "width": 236,
          "source": {
            "x": 82,
            "y": 940,
            "width": 242,
            "height": 267
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 173.041,
            "y": 991.05
          },
          "distal": {
            "x": 246.409,
            "y": 1173.423
          }
        },
        "lower": {
          "alphaBounds": [
            422,
            942,
            571,
            1199
          ],
          "alphaBoundsThreshold": 128,
          "width": 149,
          "source": {
            "x": 419,
            "y": 939,
            "width": 155,
            "height": 263
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 501.015,
            "y": 994.236
          },
          "distal": {
            "x": 485.212,
            "y": 1170.793
          }
        },
        "boot": {
          "alphaBounds": [
            718,
            1056,
            932,
            1208
          ],
          "alphaBoundsThreshold": 128,
          "width": 214,
          "source": {
            "x": 715,
            "y": 1053,
            "width": 220,
            "height": 158
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 776.91,
            "y": 1139.71
          },
          "proximal": {
            "x": 776.91,
            "y": 1139.71
          },
          "sole": {
            "x": 857,
            "y": 1207
          },
          "distal": {
            "x": 857,
            "y": 1207
          },
          "heel": {
            "x": 740.843,
            "y": 1192.58
          },
          "toe": {
            "x": 911.562,
            "y": 1192.58
          },
          "supportMethod": "actual opaque bottom row; original ankle/heel/toe anatomical correspondence"
        }
      }
    }
  },
  "vasquez-bdu": {
    "slug": "vasquez-bdu",
    "upperAsset": {
      "id": "player.echo9.costume-parts-v165.vasquez-bdu.upper",
      "kind": "costume-upper-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:vasquez-bdu:upper",
      "path": "/assets/openai/sprites/player/costume-parts-v165/vasquez-bdu/upper.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "0f45d9f546ce08c2d31762a0305b5068779de95433a9d023c1341b32799b7c0c",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts-and-documented-costume-reference",
      "pixelEditsAfterGeneration": false
    },
    "legAsset": {
      "id": "player.echo9.costume-parts-v165.vasquez-bdu.legs",
      "kind": "costume-legs-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:vasquez-bdu:legs",
      "path": "/assets/openai/sprites/player/costume-parts-v165/vasquez-bdu/legs.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "ce9f840174e8e762af26483cc25a0898cf2315cac8402d77ab41c976374f95c5",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts-and-documented-costume-reference",
      "pixelEditsAfterGeneration": false
    },
    "torso": {
      "upright": {
        "alphaBounds": [
          994,
          54,
          1222,
          333
        ],
        "alphaBoundsThreshold": 128,
        "width": 228,
        "source": {
          "x": 991,
          "y": 51,
          "width": 234,
          "height": 285
        },
        "pivotMethod": "far shoulder and waist from normalized V126/V128 landmarks; near shoulder registered at the measured alpha<=16 arm-aperture center after native-pixel review",
        "joints": {
          "near": {
            "x": 1031,
            "y": 165
          },
          "far": {
            "x": 1184.175,
            "y": 151.376
          },
          "waist": {
            "x": 1124.285,
            "y": 293.612
          }
        },
        "apertures": {
          "neck": {
            "x": 1137,
            "y": 98
          },
          "arm": {
            "x": 1031,
            "y": 165
          }
        },
        "apertureMeasurements": {
          "neckPixels": 52,
          "armPixels": 1108,
          "maxAlpha": 16
        },
        "sourceFacing": 1
      },
      "forward": {
        "alphaBounds": [
          69,
          376,
          304,
          643
        ],
        "alphaBoundsThreshold": 128,
        "width": 235,
        "source": {
          "x": 66,
          "y": 373,
          "width": 241,
          "height": 273
        },
        "pivotMethod": "far shoulder and waist from normalized V126/V128 landmarks; near shoulder registered at the measured alpha<=16 arm-aperture center after native-pixel review",
        "joints": {
          "near": {
            "x": 104,
            "y": 476
          },
          "far": {
            "x": 277.143,
            "y": 462.537
          },
          "waist": {
            "x": 183.143,
            "y": 605.008
          }
        },
        "apertures": {
          "neck": {
            "x": 221,
            "y": 420
          },
          "arm": {
            "x": 104,
            "y": 476
          }
        },
        "apertureMeasurements": {
          "neckPixels": 105,
          "armPixels": 1172,
          "maxAlpha": 16
        },
        "sourceFacing": 1
      },
      "compact": {
        "alphaBounds": [
          361,
          400,
          628,
          655
        ],
        "alphaBoundsThreshold": 128,
        "width": 267,
        "source": {
          "x": 358,
          "y": 397,
          "width": 273,
          "height": 261
        },
        "pivotMethod": "far shoulder and waist from normalized V126/V128 landmarks; near shoulder registered at the measured alpha<=16 arm-aperture center after native-pixel review",
        "joints": {
          "near": {
            "x": 435,
            "y": 505
          },
          "far": {
            "x": 586.39,
            "y": 489.682
          },
          "waist": {
            "x": 484.675,
            "y": 620.424
          }
        },
        "apertures": {
          "neck": {
            "x": 564,
            "y": 452
          },
          "arm": {
            "x": 435,
            "y": 505
          }
        },
        "apertureMeasurements": {
          "neckPixels": 91,
          "armPixels": 1403,
          "maxAlpha": 16
        },
        "sourceFacing": 1
      }
    },
    "torsoLeft": {
      "upright": {
        "alphaBounds": [
          35,
          54,
          261,
          333
        ],
        "alphaBoundsThreshold": 128,
        "width": 226,
        "source": {
          "x": 32,
          "y": 51,
          "width": 232,
          "height": 285
        },
        "pivotMethod": "far shoulder and waist from normalized V126/V128 landmarks; near shoulder registered at the measured alpha<=16 arm-aperture center after native-pixel review; native left far/waist source landmarks reflected horizontally",
        "joints": {
          "near": {
            "x": 225,
            "y": 163
          },
          "far": {
            "x": 72.493,
            "y": 151.376
          },
          "waist": {
            "x": 131.857,
            "y": 293.612
          }
        },
        "apertures": {
          "neck": {
            "x": 118,
            "y": 97
          },
          "arm": {
            "x": 225,
            "y": 163
          }
        },
        "apertureMeasurements": {
          "neckPixels": 138,
          "armPixels": 1084,
          "maxAlpha": 16
        },
        "sourceFacing": -1
      },
      "forward": {
        "alphaBounds": [
          339,
          57,
          570,
          334
        ],
        "alphaBoundsThreshold": 128,
        "width": 231,
        "source": {
          "x": 336,
          "y": 54,
          "width": 237,
          "height": 283
        },
        "pivotMethod": "far shoulder and waist from normalized V126/V128 landmarks; near shoulder registered at the measured alpha<=16 arm-aperture center after native-pixel review; native left far/waist source landmarks reflected horizontally",
        "joints": {
          "near": {
            "x": 532,
            "y": 166
          },
          "far": {
            "x": 365.4,
            "y": 146.779
          },
          "waist": {
            "x": 457.8,
            "y": 294.585
          }
        },
        "apertures": {
          "neck": {
            "x": 421,
            "y": 100
          },
          "arm": {
            "x": 532,
            "y": 166
          }
        },
        "apertureMeasurements": {
          "neckPixels": 136,
          "armPixels": 1110,
          "maxAlpha": 16
        },
        "sourceFacing": -1
      },
      "compact": {
        "alphaBounds": [
          656,
          107,
          921,
          352
        ],
        "alphaBoundsThreshold": 128,
        "width": 265,
        "source": {
          "x": 653,
          "y": 104,
          "width": 271,
          "height": 251
        },
        "pivotMethod": "far shoulder and waist from normalized V126/V128 landmarks; near shoulder registered at the measured alpha<=16 arm-aperture center after native-pixel review; native left far/waist source landmarks reflected horizontally",
        "joints": {
          "near": {
            "x": 852,
            "y": 212
          },
          "far": {
            "x": 697.298,
            "y": 193.166
          },
          "waist": {
            "x": 798.251,
            "y": 318.78
          }
        },
        "apertures": {
          "neck": {
            "x": 734,
            "y": 150
          },
          "arm": {
            "x": 852,
            "y": 212
          }
        },
        "apertureMeasurements": {
          "neckPixels": 104,
          "armPixels": 1124,
          "maxAlpha": 16
        },
        "sourceFacing": -1
      }
    },
    "arms": {
      "near": {
        "upper": {
          "alphaBounds": [
            723,
            372,
            870,
            668
          ],
          "alphaBoundsThreshold": 128,
          "width": 147,
          "source": {
            "x": 720,
            "y": 369,
            "width": 153,
            "height": 302
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 794.891,
            "y": 405.003
          },
          "distal": {
            "x": 795.964,
            "y": 614.369
          }
        },
        "fore": {
          "alphaBounds": [
            1041,
            381,
            1204,
            674
          ],
          "alphaBoundsThreshold": 128,
          "width": 163,
          "source": {
            "x": 1038,
            "y": 378,
            "width": 169,
            "height": 299
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1112.912,
            "y": 431.67
          },
          "distal": {
            "x": 1157.258,
            "y": 628.838
          }
        },
        "grip": {
          "alphaBounds": [
            92,
            722,
            276,
            942
          ],
          "alphaBoundsThreshold": 128,
          "width": 184,
          "source": {
            "x": 89,
            "y": 719,
            "width": 190,
            "height": 226
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 162.15,
            "y": 751.464
          },
          "distal": {
            "x": 186.3,
            "y": 859.5
          }
        },
        "service": {
          "alphaBounds": [
            370,
            721,
            572,
            960
          ],
          "alphaBoundsThreshold": 128,
          "width": 202,
          "source": {
            "x": 367,
            "y": 718,
            "width": 208,
            "height": 245
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 464.995,
            "y": 753.0
          },
          "distal": {
            "x": 466.086,
            "y": 876.0
          }
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            723,
            692,
            884,
            979
          ],
          "alphaBoundsThreshold": 128,
          "width": 161,
          "source": {
            "x": 720,
            "y": 689,
            "width": 167,
            "height": 293
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 809.364,
            "y": 723.438
          },
          "distal": {
            "x": 788.039,
            "y": 932.35
          }
        },
        "fore": {
          "alphaBounds": [
            1043,
            710,
            1193,
            979
          ],
          "alphaBoundsThreshold": 128,
          "width": 150,
          "source": {
            "x": 1040,
            "y": 707,
            "width": 156,
            "height": 275
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1127.587,
            "y": 751.705
          },
          "distal": {
            "x": 1105.03,
            "y": 940.422
          }
        },
        "grip": {
          "alphaBounds": [
            76,
            1005,
            253,
            1207
          ],
          "alphaBoundsThreshold": 128,
          "width": 177,
          "source": {
            "x": 73,
            "y": 1002,
            "width": 183,
            "height": 208
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 187.321,
            "y": 1034.706
          },
          "distal": {
            "x": 157.264,
            "y": 1145.608
          }
        },
        "service": {
          "alphaBounds": [
            377,
            1005,
            582,
            1230
          ],
          "alphaBoundsThreshold": 128,
          "width": 205,
          "source": {
            "x": 374,
            "y": 1002,
            "width": 211,
            "height": 231
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 494.816,
            "y": 1035.208
          },
          "distal": {
            "x": 484.213,
            "y": 1162.292
          }
        }
      }
    },
    "legs": {
      "pelvis": {
        "alphaBounds": [
          52,
          698,
          343,
          885
        ],
        "alphaBoundsThreshold": 128,
        "width": 291,
        "source": {
          "x": 49,
          "y": 695,
          "width": 297,
          "height": 193
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "waist": {
          "x": 197.5,
          "y": 778.667
        },
        "near": {
          "x": 115.656,
          "y": 843.445
        },
        "far": {
          "x": 297.531,
          "y": 839.778
        },
        "belt": {
          "x": 197.5,
          "y": 740.778
        }
      },
      "near": {
        "upper": {
          "alphaBounds": [
            419,
            656,
            640,
            924
          ],
          "alphaBoundsThreshold": 128,
          "width": 221,
          "source": {
            "x": 416,
            "y": 653,
            "width": 227,
            "height": 274
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 520.18,
            "y": 699.431
          },
          "distal": {
            "x": 554.795,
            "y": 890.103
          }
        },
        "lower": {
          "alphaBounds": [
            743,
            656,
            881,
            920
          ],
          "alphaBoundsThreshold": 128,
          "width": 138,
          "source": {
            "x": 740,
            "y": 653,
            "width": 144,
            "height": 270
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 816.74,
            "y": 707.951
          },
          "distal": {
            "x": 809.366,
            "y": 891.374
          }
        },
        "boot": {
          "alphaBounds": [
            1017,
            806,
            1229,
            943
          ],
          "alphaBoundsThreshold": 128,
          "width": 212,
          "source": {
            "x": 1014,
            "y": 803,
            "width": 218,
            "height": 143
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 1079.497,
            "y": 883.062
          },
          "proximal": {
            "x": 1079.497,
            "y": 883.062
          },
          "sole": {
            "x": 1150,
            "y": 942
          },
          "distal": {
            "x": 1150,
            "y": 942
          },
          "heel": {
            "x": 1040.283,
            "y": 930.632
          },
          "toe": {
            "x": 1208.168,
            "y": 930.632
          },
          "supportMethod": "opaque sole support at measured alpha>=128 bottom edge; anatomical ankle/heel/toe from normalized V128 template",
          "sourceFacing": 1
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            97,
            951,
            370,
            1206
          ],
          "alphaBoundsThreshold": 128,
          "width": 273,
          "source": {
            "x": 94,
            "y": 948,
            "width": 279,
            "height": 261
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 198.845,
            "y": 997.946
          },
          "distal": {
            "x": 283.715,
            "y": 1176.126
          }
        },
        "lower": {
          "alphaBounds": [
            445,
            947,
            619,
            1211
          ],
          "alphaBoundsThreshold": 128,
          "width": 174,
          "source": {
            "x": 442,
            "y": 944,
            "width": 180,
            "height": 270
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 537.272,
            "y": 1000.658
          },
          "distal": {
            "x": 518.818,
            "y": 1182.025
          }
        },
        "boot": {
          "alphaBounds": [
            751,
            1056,
            966,
            1219
          ],
          "alphaBoundsThreshold": 128,
          "width": 215,
          "source": {
            "x": 748,
            "y": 1053,
            "width": 221,
            "height": 169
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 810.185,
            "y": 1145.768
          },
          "proximal": {
            "x": 810.185,
            "y": 1145.768
          },
          "sole": {
            "x": 890,
            "y": 1218
          },
          "distal": {
            "x": 890,
            "y": 1218
          },
          "heel": {
            "x": 773.949,
            "y": 1202.464
          },
          "toe": {
            "x": 945.466,
            "y": 1202.464
          },
          "supportMethod": "opaque sole support at measured alpha>=128 bottom edge; anatomical ankle/heel/toe from normalized V128 template",
          "sourceFacing": 1
        }
      }
    }
  },
  "rain-jacket": {
    "slug": "rain-jacket",
    "upperAsset": {
      "id": "player.echo9.costume-parts-v165.rain-jacket.upper",
      "kind": "costume-upper-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:rain-jacket:upper",
      "path": "/assets/openai/sprites/player/costume-parts-v165/rain-jacket/upper.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "93f92c17ff52b6c2756dfe94b00af1229c208334354d8a0c7480bf6629e2c0c6",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts-and-documented-costume-reference",
      "pixelEditsAfterGeneration": false
    },
    "legAsset": {
      "id": "player.echo9.costume-parts-v165.rain-jacket.legs",
      "kind": "costume-legs-parts",
      "rigType": "echo9",
      "imageKey": "playerCostumePartsV165:rain-jacket:legs",
      "path": "/assets/openai/sprites/player/costume-parts-v165/rain-jacket/legs.png",
      "sourceWidth": 1254,
      "sourceHeight": 1254,
      "width": 1254,
      "height": 1254,
      "sha256": "0d9c1fa27a65bdd92bdd0437bd28ffc7bdf395654612059d45ca55c8ef8acb24",
      "sourceFacing": 1,
      "exact": false,
      "visualStatus": "adapted-separated-outfit-parts",
      "provenance": "imagegen-adaptation-of-existing-game-clothing-parts-and-documented-costume-reference",
      "pixelEditsAfterGeneration": false
    },
    "torso": {
      "upright": {
        "alphaBounds": [
          974,
          33,
          1228,
          348
        ],
        "alphaBoundsThreshold": 128,
        "width": 254,
        "source": {
          "x": 971,
          "y": 30,
          "width": 260,
          "height": 321
        },
        "pivotMethod": "far shoulder and waist from normalized V126/V128 landmarks; near shoulder registered at the measured alpha<=16 arm-aperture center after native-pixel review",
        "joints": {
          "near": {
            "x": 1026,
            "y": 154
          },
          "far": {
            "x": 1185.862,
            "y": 142.941
          },
          "waist": {
            "x": 1119.143,
            "y": 303.53
          }
        },
        "apertures": {
          "neck": {
            "x": 1136,
            "y": 97
          },
          "arm": {
            "x": 1026,
            "y": 154
          }
        },
        "apertureMeasurements": {
          "neckPixels": 376,
          "armPixels": 1583,
          "maxAlpha": 16
        },
        "sourceFacing": 1
      },
      "forward": {
        "alphaBounds": [
          50,
          376,
          308,
          673
        ],
        "alphaBoundsThreshold": 128,
        "width": 258,
        "source": {
          "x": 47,
          "y": 373,
          "width": 264,
          "height": 303
        },
        "pivotMethod": "far shoulder and waist from normalized V126/V128 landmarks; near shoulder registered at the measured alpha<=16 arm-aperture center after native-pixel review",
        "joints": {
          "near": {
            "x": 111,
            "y": 478
          },
          "far": {
            "x": 278.515,
            "y": 472.261
          },
          "waist": {
            "x": 175.315,
            "y": 630.739
          }
        },
        "apertures": {
          "neck": {
            "x": 234,
            "y": 443
          },
          "arm": {
            "x": 111,
            "y": 478
          }
        },
        "apertureMeasurements": {
          "neckPixels": 522,
          "armPixels": 1603,
          "maxAlpha": 16
        },
        "sourceFacing": 1
      },
      "compact": {
        "alphaBounds": [
          349,
          401,
          645,
          671
        ],
        "alphaBoundsThreshold": 128,
        "width": 296,
        "source": {
          "x": 346,
          "y": 398,
          "width": 302,
          "height": 276
        },
        "pivotMethod": "far shoulder and waist from normalized V126/V128 landmarks; near shoulder registered at the measured alpha<=16 arm-aperture center after native-pixel review",
        "joints": {
          "near": {
            "x": 447,
            "y": 498
          },
          "far": {
            "x": 598.871,
            "y": 495.958
          },
          "waist": {
            "x": 486.108,
            "y": 634.39
          }
        },
        "apertures": {
          "neck": {
            "x": 570,
            "y": 480
          },
          "arm": {
            "x": 447,
            "y": 498
          }
        },
        "apertureMeasurements": {
          "neckPixels": 712,
          "armPixels": 1713,
          "maxAlpha": 16
        },
        "sourceFacing": 1
      }
    },
    "torsoLeft": {
      "upright": {
        "alphaBounds": [
          32,
          32,
          283,
          349
        ],
        "alphaBoundsThreshold": 128,
        "width": 251,
        "source": {
          "x": 29,
          "y": 29,
          "width": 257,
          "height": 323
        },
        "pivotMethod": "far shoulder and waist from normalized V126/V128 landmarks; near shoulder registered at the measured alpha<=16 arm-aperture center after native-pixel review; native left far/waist source landmarks reflected horizontally",
        "joints": {
          "near": {
            "x": 226,
            "y": 153
          },
          "far": {
            "x": 73.64,
            "y": 142.639
          },
          "waist": {
            "x": 139.572,
            "y": 304.247
          }
        },
        "apertures": {
          "neck": {
            "x": 114,
            "y": 99
          },
          "arm": {
            "x": 226,
            "y": 153
          }
        },
        "apertureMeasurements": {
          "neckPixels": 441,
          "armPixels": 1591,
          "maxAlpha": 16
        },
        "sourceFacing": -1
      },
      "forward": {
        "alphaBounds": [
          341,
          39,
          610,
          351
        ],
        "alphaBoundsThreshold": 128,
        "width": 269,
        "source": {
          "x": 338,
          "y": 36,
          "width": 275,
          "height": 318
        },
        "pivotMethod": "far shoulder and waist from normalized V126/V128 landmarks; near shoulder registered at the measured alpha<=16 arm-aperture center after native-pixel review; native left far/waist source landmarks reflected horizontally",
        "joints": {
          "near": {
            "x": 541,
            "y": 152
          },
          "far": {
            "x": 371.743,
            "y": 140.122
          },
          "waist": {
            "x": 479.343,
            "y": 306.605
          }
        },
        "apertures": {
          "neck": {
            "x": 415,
            "y": 107
          },
          "arm": {
            "x": 541,
            "y": 152
          }
        },
        "apertureMeasurements": {
          "neckPixels": 617,
          "armPixels": 1607,
          "maxAlpha": 16
        },
        "sourceFacing": -1
      },
      "compact": {
        "alphaBounds": [
          649,
          97,
          937,
          351
        ],
        "alphaBoundsThreshold": 128,
        "width": 288,
        "source": {
          "x": 646,
          "y": 94,
          "width": 294,
          "height": 260
        },
        "pivotMethod": "far shoulder and waist from normalized V126/V128 landmarks; near shoulder registered at the measured alpha<=16 arm-aperture center after native-pixel review; native left far/waist source landmarks reflected horizontally",
        "joints": {
          "near": {
            "x": 855,
            "y": 196
          },
          "far": {
            "x": 693.883,
            "y": 186.331
          },
          "waist": {
            "x": 803.597,
            "y": 316.56
          }
        },
        "apertures": {
          "neck": {
            "x": 730,
            "y": 166
          },
          "arm": {
            "x": 855,
            "y": 196
          }
        },
        "apertureMeasurements": {
          "neckPixels": 638,
          "armPixels": 1569,
          "maxAlpha": 16
        },
        "sourceFacing": -1
      }
    },
    "arms": {
      "near": {
        "upper": {
          "alphaBounds": [
            725,
            377,
            878,
            681
          ],
          "alphaBoundsThreshold": 128,
          "width": 153,
          "source": {
            "x": 722,
            "y": 374,
            "width": 159,
            "height": 310
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 799.825,
            "y": 410.895
          },
          "distal": {
            "x": 800.942,
            "y": 625.92
          }
        },
        "fore": {
          "alphaBounds": [
            1043,
            378,
            1213,
            687
          ],
          "alphaBoundsThreshold": 128,
          "width": 170,
          "source": {
            "x": 1040,
            "y": 375,
            "width": 176,
            "height": 315
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1118.0,
            "y": 431.437
          },
          "distal": {
            "x": 1164.25,
            "y": 639.372
          }
        },
        "grip": {
          "alphaBounds": [
            93,
            711,
            266,
            943
          ],
          "alphaBoundsThreshold": 128,
          "width": 173,
          "source": {
            "x": 90,
            "y": 708,
            "width": 179,
            "height": 238
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 158.956,
            "y": 742.072
          },
          "distal": {
            "x": 181.663,
            "y": 856.0
          }
        },
        "service": {
          "alphaBounds": [
            376,
            711,
            566,
            959
          ],
          "alphaBoundsThreshold": 128,
          "width": 190,
          "source": {
            "x": 373,
            "y": 708,
            "width": 196,
            "height": 254
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 465.351,
            "y": 744.205
          },
          "distal": {
            "x": 466.378,
            "y": 871.837
          }
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            728,
            696,
            896,
            976
          ],
          "alphaBoundsThreshold": 128,
          "width": 168,
          "source": {
            "x": 725,
            "y": 693,
            "width": 174,
            "height": 286
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 818.119,
            "y": 726.671
          },
          "distal": {
            "x": 795.867,
            "y": 930.488
          }
        },
        "fore": {
          "alphaBounds": [
            1049,
            706,
            1195,
            976
          ],
          "alphaBoundsThreshold": 128,
          "width": 146,
          "source": {
            "x": 1046,
            "y": 703,
            "width": 152,
            "height": 276
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 1131.331,
            "y": 747.86
          },
          "distal": {
            "x": 1109.376,
            "y": 937.279
          }
        },
        "grip": {
          "alphaBounds": [
            79,
            995,
            254,
            1207
          ],
          "alphaBoundsThreshold": 128,
          "width": 175,
          "source": {
            "x": 76,
            "y": 992,
            "width": 181,
            "height": 218
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 189.063,
            "y": 1026.176
          },
          "distal": {
            "x": 159.345,
            "y": 1142.568
          }
        },
        "service": {
          "alphaBounds": [
            381,
            996,
            580,
            1233
          ],
          "alphaBoundsThreshold": 128,
          "width": 199,
          "source": {
            "x": 378,
            "y": 993,
            "width": 205,
            "height": 243
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 495.368,
            "y": 1027.819
          },
          "distal": {
            "x": 485.075,
            "y": 1161.681
          }
        }
      }
    },
    "legs": {
      "pelvis": {
        "alphaBounds": [
          44,
          709,
          350,
          911
        ],
        "alphaBoundsThreshold": 128,
        "width": 306,
        "source": {
          "x": 41,
          "y": 706,
          "width": 312,
          "height": 208
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "waist": {
          "x": 197.0,
          "y": 796.137
        },
        "near": {
          "x": 110.937,
          "y": 866.112
        },
        "far": {
          "x": 302.187,
          "y": 862.15
        },
        "belt": {
          "x": 197.0,
          "y": 755.209
        }
      },
      "near": {
        "upper": {
          "alphaBounds": [
            416,
            664,
            642,
            950
          ],
          "alphaBoundsThreshold": 128,
          "width": 226,
          "source": {
            "x": 413,
            "y": 661,
            "width": 232,
            "height": 292
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 519.47,
            "y": 710.348
          },
          "distal": {
            "x": 554.867,
            "y": 913.826
          }
        },
        "lower": {
          "alphaBounds": [
            734,
            668,
            879,
            950
          ],
          "alphaBoundsThreshold": 128,
          "width": 145,
          "source": {
            "x": 731,
            "y": 665,
            "width": 151,
            "height": 288
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 811.481,
            "y": 723.493
          },
          "distal": {
            "x": 803.733,
            "y": 919.422
          }
        },
        "boot": {
          "alphaBounds": [
            999,
            821,
            1229,
            971
          ],
          "alphaBoundsThreshold": 128,
          "width": 230,
          "source": {
            "x": 996,
            "y": 818,
            "width": 236,
            "height": 156
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 1066.804,
            "y": 905.375
          },
          "proximal": {
            "x": 1066.804,
            "y": 905.375
          },
          "sole": {
            "x": 1143,
            "y": 970
          },
          "distal": {
            "x": 1143,
            "y": 970
          },
          "heel": {
            "x": 1024.26,
            "y": 957.458
          },
          "toe": {
            "x": 1206.399,
            "y": 957.458
          },
          "supportMethod": "opaque sole support at measured alpha>=128 bottom edge; anatomical ankle/heel/toe from normalized V128 template",
          "sourceFacing": 1
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            82,
            958,
            371,
            1226
          ],
          "alphaBoundsThreshold": 128,
          "width": 289,
          "source": {
            "x": 79,
            "y": 955,
            "width": 295,
            "height": 274
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 189.814,
            "y": 1007.339
          },
          "distal": {
            "x": 279.658,
            "y": 1194.603
          }
        },
        "lower": {
          "alphaBounds": [
            431,
            957,
            621,
            1237
          ],
          "alphaBoundsThreshold": 128,
          "width": 190,
          "source": {
            "x": 428,
            "y": 954,
            "width": 196,
            "height": 286
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 531.757,
            "y": 1013.911
          },
          "distal": {
            "x": 511.606,
            "y": 1206.268
          }
        },
        "boot": {
          "alphaBounds": [
            731,
            1055,
            986,
            1238
          ],
          "alphaBoundsThreshold": 128,
          "width": 255,
          "source": {
            "x": 728,
            "y": 1052,
            "width": 261,
            "height": 189
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "ankle": {
            "x": 801.196,
            "y": 1155.782
          },
          "proximal": {
            "x": 801.196,
            "y": 1155.782
          },
          "sole": {
            "x": 898,
            "y": 1237
          },
          "distal": {
            "x": 898,
            "y": 1237
          },
          "heel": {
            "x": 758.219,
            "y": 1219.435
          },
          "toe": {
            "x": 961.646,
            "y": 1219.435
          },
          "supportMethod": "opaque sole support at measured alpha>=128 bottom edge; anatomical ankle/heel/toe from normalized V128 template",
          "sourceFacing": 1
        }
      }
    },
    "legsLeft": {
      "pelvis": {
        "alphaBounds": [
          44,
          709,
          350,
          911
        ],
        "alphaBoundsThreshold": 128,
        "width": 306,
        "source": {
          "x": 41,
          "y": 706,
          "width": 312,
          "height": 208
        },
        "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
        "waist": {
          "x": 197.0,
          "y": 796.137
        },
        "near": {
          "x": 110.937,
          "y": 866.112
        },
        "far": {
          "x": 302.187,
          "y": 862.15
        },
        "belt": {
          "x": 197.0,
          "y": 755.209
        }
      },
      "near": {
        "upper": {
          "alphaBounds": [
            416,
            664,
            642,
            950
          ],
          "alphaBoundsThreshold": 128,
          "width": 226,
          "source": {
            "x": 413,
            "y": 661,
            "width": 232,
            "height": 292
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 519.47,
            "y": 710.348
          },
          "distal": {
            "x": 554.867,
            "y": 913.826
          }
        },
        "lower": {
          "alphaBounds": [
            734,
            668,
            879,
            950
          ],
          "alphaBoundsThreshold": 128,
          "width": 145,
          "source": {
            "x": 731,
            "y": 665,
            "width": 151,
            "height": 288
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 811.481,
            "y": 723.493
          },
          "distal": {
            "x": 803.733,
            "y": 919.422
          }
        },
        "boot": {
          "alphaBounds": [
            946,
            199,
            1218,
            361
          ],
          "alphaBoundsThreshold": 128,
          "width": 272,
          "source": {
            "x": 943,
            "y": 196,
            "width": 278,
            "height": 168
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette; native left artwork uses horizontally reflected source landmarks",
          "ankle": {
            "x": 1137.815,
            "y": 290.125
          },
          "proximal": {
            "x": 1137.815,
            "y": 290.125
          },
          "sole": {
            "x": 1048,
            "y": 360
          },
          "distal": {
            "x": 1048,
            "y": 360
          },
          "heel": {
            "x": 1188.127,
            "y": 346.375
          },
          "toe": {
            "x": 972.728,
            "y": 346.375
          },
          "supportMethod": "opaque sole support at measured alpha>=128 bottom edge; anatomical ankle/heel/toe from normalized V128 template",
          "sourceFacing": -1
        }
      },
      "far": {
        "upper": {
          "alphaBounds": [
            82,
            958,
            371,
            1226
          ],
          "alphaBoundsThreshold": 128,
          "width": 289,
          "source": {
            "x": 79,
            "y": 955,
            "width": 295,
            "height": 274
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 189.814,
            "y": 1007.339
          },
          "distal": {
            "x": 279.658,
            "y": 1194.603
          }
        },
        "lower": {
          "alphaBounds": [
            431,
            957,
            621,
            1237
          ],
          "alphaBoundsThreshold": 128,
          "width": 190,
          "source": {
            "x": 428,
            "y": 954,
            "width": 196,
            "height": 286
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette",
          "proximal": {
            "x": 531.757,
            "y": 1013.911
          },
          "distal": {
            "x": 511.606,
            "y": 1206.268
          }
        },
        "boot": {
          "alphaBounds": [
            653,
            494,
            923,
            659
          ],
          "alphaBoundsThreshold": 128,
          "width": 270,
          "source": {
            "x": 650,
            "y": 491,
            "width": 276,
            "height": 171
          },
          "pivotMethod": "corresponding V126/V128 anatomical landmarks normalized inside measured native silhouette; native left artwork uses horizontally reflected source landmarks",
          "ankle": {
            "x": 848.675,
            "y": 584.869
          },
          "proximal": {
            "x": 848.675,
            "y": 584.869
          },
          "sole": {
            "x": 752,
            "y": 658
          },
          "distal": {
            "x": 752,
            "y": 658
          },
          "heel": {
            "x": 894.18,
            "y": 642.261
          },
          "toe": {
            "x": 678.787,
            "y": 642.261
          },
          "supportMethod": "opaque sole support at measured alpha>=128 bottom edge; anatomical ankle/heel/toe from normalized V128 template",
          "sourceFacing": -1
        }
      }
    }
  }
});
export const PLAYER_COSTUME_PART_ASSETS_V165=freeze([
  {
    "id": "player.echo9.costume-parts-v165.amanda-working.upper",
    "kind": "costume-upper-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:amanda-working:upper",
    "path": "/assets/openai/sprites/player/costume-parts-v165/amanda-working/upper.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "154d7d59344220ce20e068b0c402b566951b0418b9f73d17d89863c8994ebb50",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.amanda-working.legs",
    "kind": "costume-legs-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:amanda-working:legs",
    "path": "/assets/openai/sprites/player/costume-parts-v165/amanda-working/legs.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "62c2a289c479451d07ec8b530e2a69a5c637f9d6f83e40d2642a4cd131a24063",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.working-joe-uniform.upper",
    "kind": "costume-upper-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:working-joe-uniform:upper",
    "path": "/assets/openai/sprites/player/costume-parts-v165/working-joe-uniform/upper.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "d91f41a31097d56c288a45aa2341e5525efa2054628478ce8cda7f231a068547",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.working-joe-uniform.legs",
    "kind": "costume-legs-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:working-joe-uniform:legs",
    "path": "/assets/openai/sprites/player/costume-parts-v165/working-joe-uniform/legs.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "9782c1874a32ced163fd4468c703db83d6ebe55512d5aa32e9f42ef51d824f45",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.sevastopol-security.upper",
    "kind": "costume-upper-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:sevastopol-security:upper",
    "path": "/assets/openai/sprites/player/costume-parts-v165/sevastopol-security/upper.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "8155ea98b9c2585b6bedc523811cbd3829ee11957cbb280cef32872bd92105ad",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.sevastopol-security.legs",
    "kind": "costume-legs-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:sevastopol-security:legs",
    "path": "/assets/openai/sprites/player/costume-parts-v165/sevastopol-security/legs.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "817a58f2a1fe4fd782a693684762723ed1546ee5ea3513bd15ee48657c80e1d2",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.sevastopol-security.helmet",
    "kind": "costume-helmet-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:sevastopol-security:helmet",
    "path": "/assets/openai/sprites/player/costume-parts-v165/sevastopol-security/helmet.png",
    "sourceWidth": 2172,
    "sourceHeight": 724,
    "width": 2172,
    "height": 724,
    "sha256": "4ab34c709692c1c404f650b512f2f97861058eebc0f2b54f55d2bcb24fc32f52",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.ripley-bomber.upper",
    "kind": "costume-upper-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:ripley-bomber:upper",
    "path": "/assets/openai/sprites/player/costume-parts-v165/ripley-bomber/upper.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "22d77f343717d0b13db5a74dbff83f4569af37b947ef50667adc979f728b2c8b",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.ripley-bomber.legs",
    "kind": "costume-legs-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:ripley-bomber:legs",
    "path": "/assets/openai/sprites/player/costume-parts-v165/ripley-bomber/legs.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "07dde04614fae9b148fb4bb765238eccd137c617d16cea61a200936c7e2bd1d3",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.bishop-utility.upper",
    "kind": "costume-upper-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:bishop-utility:upper",
    "path": "/assets/openai/sprites/player/costume-parts-v165/bishop-utility/upper.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "5ea9ab2194818d33a234c51df819e853a3b36aeeb822a2c2db75778d10efc32e",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.bishop-utility.legs",
    "kind": "costume-legs-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:bishop-utility:legs",
    "path": "/assets/openai/sprites/player/costume-parts-v165/bishop-utility/legs.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "9fcb95be2fd42bb19a520a7fc7ef3a2fa2adf426ee3da478c163b58d34bc4b84",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.fireteam-seegson-maintenance.upper",
    "kind": "costume-upper-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:fireteam-seegson-maintenance:upper",
    "path": "/assets/openai/sprites/player/costume-parts-v165/fireteam-seegson-maintenance/upper.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "ea8d6b1e8bc31e51956aa03ef475f5be481b329fa2f544fff9dbedf290e9b02d",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.fireteam-seegson-maintenance.legs",
    "kind": "costume-legs-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:fireteam-seegson-maintenance:legs",
    "path": "/assets/openai/sprites/player/costume-parts-v165/fireteam-seegson-maintenance/legs.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "98961785a5711ccdc2e1ae818dff27339f8cf0c14c2d08209aa8c94de2fd771d",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.fireteam-nostromo-jacket.upper",
    "kind": "costume-upper-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:fireteam-nostromo-jacket:upper",
    "path": "/assets/openai/sprites/player/costume-parts-v165/fireteam-nostromo-jacket/upper.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "ad039798c76f8d8b385eb353de909f54b24978a2b0e3799c08b8936a04aa435a",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.fireteam-nostromo-jacket.legs",
    "kind": "costume-legs-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:fireteam-nostromo-jacket:legs",
    "path": "/assets/openai/sprites/player/costume-parts-v165/fireteam-nostromo-jacket/legs.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "28d37b972d0dd8e4e72216e31431a689043f49ffec5dc7325e9b60fdcee69713",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.fireteam-flightsuit.upper",
    "kind": "costume-upper-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:fireteam-flightsuit:upper",
    "path": "/assets/openai/sprites/player/costume-parts-v165/fireteam-flightsuit/upper.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "b936ffb3b66d591f186bb4fc8afd684549ab566c6892926ae99291d522fe9056",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.fireteam-flightsuit.legs",
    "kind": "costume-legs-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:fireteam-flightsuit:legs",
    "path": "/assets/openai/sprites/player/costume-parts-v165/fireteam-flightsuit/legs.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "5439984779ab2e028ff0098e79ba3aa98467d81cd094ce957f0b689867d9f290",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.vasquez-bdu.upper",
    "kind": "costume-upper-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:vasquez-bdu:upper",
    "path": "/assets/openai/sprites/player/costume-parts-v165/vasquez-bdu/upper.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "0f45d9f546ce08c2d31762a0305b5068779de95433a9d023c1341b32799b7c0c",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts-and-documented-costume-reference",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.vasquez-bdu.legs",
    "kind": "costume-legs-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:vasquez-bdu:legs",
    "path": "/assets/openai/sprites/player/costume-parts-v165/vasquez-bdu/legs.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "ce9f840174e8e762af26483cc25a0898cf2315cac8402d77ab41c976374f95c5",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts-and-documented-costume-reference",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.rain-jacket.upper",
    "kind": "costume-upper-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:rain-jacket:upper",
    "path": "/assets/openai/sprites/player/costume-parts-v165/rain-jacket/upper.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "93f92c17ff52b6c2756dfe94b00af1229c208334354d8a0c7480bf6629e2c0c6",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts-and-documented-costume-reference",
    "pixelEditsAfterGeneration": false
  },
  {
    "id": "player.echo9.costume-parts-v165.rain-jacket.legs",
    "kind": "costume-legs-parts",
    "rigType": "echo9",
    "imageKey": "playerCostumePartsV165:rain-jacket:legs",
    "path": "/assets/openai/sprites/player/costume-parts-v165/rain-jacket/legs.png",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "width": 1254,
    "height": 1254,
    "sha256": "0d9c1fa27a65bdd92bdd0437bd28ffc7bdf395654612059d45ca55c8ef8acb24",
    "sourceFacing": 1,
    "exact": false,
    "visualStatus": "adapted-separated-outfit-parts",
    "provenance": "imagegen-adaptation-of-existing-game-clothing-parts-and-documented-costume-reference",
    "pixelEditsAfterGeneration": false
  }
]);
const torsoById=new Map(Object.values(PLAYER_COSTUME_PARTS_V165).map(kit=>['torso-'+kit.slug+'-v165',kit]));
const armsById=new Map(Object.values(PLAYER_COSTUME_PARTS_V165).map(kit=>['arms-'+kit.slug+'-v165',kit]));
export const PLAYER_COSTUME_LEG_DEFINITIONS_V165=freeze(Object.fromEntries(Object.values(PLAYER_COSTUME_PARTS_V165).map(kit=>['legs-'+kit.slug+'-v165',{asset:kit.legAsset,parts:kit.legs,...(kit.legsLeft?{partsLeft:kit.legsLeft}:{})}])));
// Native left torsos keep asymmetric lettering readable through the existing
// affine triangle. Their reflected source landmarks cancel the native facing
// reflection; older kits retain their original shared torso definitions.
export const getPlayerCostumeTorsoV165=(id,facing=1,family='upright')=>{
  const kit=torsoById.get(id),variants=facing<0&&kit?.torsoLeft?kit.torsoLeft:kit?.torso;
  const part=variants?.[family];
  return part?{asset:kit.upperAsset,part}:null;
};
export const getPlayerCostumeArmsV165=id=>{const kit=armsById.get(id);return kit?{asset:kit.upperAsset,parts:kit.arms}:null;};
export const getPlayerCostumeHelmetV165=(id,facing=1)=>id==='helmet-sevastopol-security-v165'?PLAYER_COSTUME_PARTS_V165['sevastopol-security']?.helmet?.[facing<0?'left':'right']||null:null;
