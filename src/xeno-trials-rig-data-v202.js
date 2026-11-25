// Screen-space pivots and support contacts measured on the admitted RGBA plates.
// Angles are small, original presentations and grounded recovery gestures.
export const XENO_TRIALS_RIG_DATA_V202 = [
  {
    fighterId: "albino-ripper",
    profileId: "enemy-075-albino-atarax-ripper",
    sourceSha256: "32ff991d11c5bc959a7ab39a362c0b523515c596e1082bef085443bcbc6b04c2",
    anatomy: "ivory-ripper-with-jaw-guard-lamellar-shoulder-and-bent-tail-hook",
    bones: [
      {"id": "hips", "parent": null, "pivot": [673, 724], "tip": [618, 755]},
      {"id": "spine", "parent": "hips", "pivot": [641, 675], "tip": [772, 527]},
      {"id": "jawGuard", "parent": "spine", "pivot": [958, 419], "tip": [1072, 493]},
      {"id": "crown", "parent": "jawGuard", "pivot": [940, 365], "tip": [832, 319]},
      {"id": "shoulder", "parent": "spine", "pivot": [752, 510], "tip": [650, 607]},
      {"id": "longClaw", "parent": "shoulder", "pivot": [670, 661], "tip": [750, 781]},
      {"id": "farClaw", "parent": "spine", "pivot": [878, 673], "tip": [1057, 787]},
      {"id": "tailRoot", "parent": "hips", "pivot": [561, 667], "tip": [425, 775]},
      {"id": "tailHook", "parent": "tailRoot", "pivot": [239, 821], "tip": [145, 693]}
    ],
    contacts: {
      "rearClaw": {"bone": "hips", "point": [413, 1023]},
      "forwardClaw": {"bone": "hips", "point": [892, 1037]},
      "jawGuard": {"bone": "jawGuard", "point": [1072, 493]},
      "crown": {"bone": "crown", "point": [832, 319]},
      "shoulder": {"bone": "shoulder", "point": [650, 607]},
      "longClaw": {"bone": "longClaw", "point": [750, 781]},
      "farClaw": {"bone": "farClaw", "point": [1057, 787]},
      "tailRoot": {"bone": "tailRoot", "point": [425, 775]},
      "tailHook": {"bone": "tailHook", "point": [145, 693]}
    },
    poses: {
      "intro": {"jawGuard": -3.9, "crown": -1.2, "tailHook": 1.6},
      "round-win": {"jawGuard": -4.5, "farClaw": -2.9, "tailRoot": 1.1},
      "round-loss": {"jawGuard": 4.9, "crown": 1.2, "tailHook": -2.4},
      "recovery": {"shoulder": 1.5, "longClaw": 3.4, "farClaw": 2, "tailRoot": -0.8}
    }
  },
  {
    fighterId: "acid-combat-synth",
    profileId: "enemy-198-acid-blooded-combat-synthetic",
    sourceSha256: "d842755a850635f1cfa60b353b1531b983697d86c570457db9a6d7dbcb01d05b",
    anatomy: "acid-resistant-synthetic-with-sealed-optics-and-rigid-carbine",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [602, 608], "tip": [597, 668]},
      {"id": "spine", "parent": "hips", "pivot": [602, 580], "tip": [578, 365]},
      {"id": "helmet", "parent": "spine", "pivot": [722, 245], "tip": [777, 150]},
      {"id": "visor", "parent": "helmet", "pivot": [766, 142], "tip": [798, 183]},
      {"id": "shoulder", "parent": "spine", "pivot": [542, 311], "tip": [485, 439]},
      {"id": "forearm", "parent": "shoulder", "pivot": [496, 474], "tip": [703, 523]},
      {"id": "tool", "parent": "spine", "pivot": [823, 523], "tip": [959, 559]}
    ],
    contacts: {
      "rearBoot": {"bone": "hips", "point": [395, 1082]},
      "frontBoot": {"bone": "hips", "point": [916, 1085]},
      "spine": {"bone": "spine", "point": [578, 365]},
      "helmet": {"bone": "helmet", "point": [777, 150]},
      "visor": {"bone": "visor", "point": [798, 183]},
      "shoulder": {"bone": "shoulder", "point": [485, 439]}
    },
    poses: {
      "intro": {"helmet": -4.4, "spine": -0.85, "visor": 0.7},
      "round-win": {"helmet": -3.3, "spine": 1.45},
      "round-loss": {"helmet": 5.1, "spine": 1.2, "shoulder": 1.45},
      "recovery": {"helmet": 3.2, "spine": -1.65, "visor": -1.1}
    }
  },
  {
    fighterId: "user-blue-violet-biped",
    profileId: "pose-v95-user-bipede-bleu-violet",
    sourceSha256: "efbc42d94b00a53caa703d507a9be0dd5c3dfd895bfa49ea17fc74ea75e4e139",
    anatomy: "metallic-violet-jaw-with-spined-countertail-and-double-forearms",
    bones: [
      {"id": "hips", "parent": null, "pivot": [630, 613], "tip": [596, 695]},
      {"id": "spine", "parent": "hips", "pivot": [579, 570], "tip": [419, 353]},
      {"id": "head", "parent": "spine", "pivot": [271, 268], "tip": [125, 288]},
      {"id": "dorsal", "parent": "spine", "pivot": [539, 262], "tip": [631, 336]},
      {"id": "arm", "parent": "spine", "pivot": [422, 348], "tip": [499, 499]},
      {"id": "nearClaw", "parent": "arm", "pivot": [467, 533], "tip": [299, 601]},
      {"id": "farClaw", "parent": "spine", "pivot": [251, 467], "tip": [148, 433]},
      {"id": "tailRoot", "parent": "hips", "pivot": [681, 604], "tip": [844, 556]},
      {"id": "tailBend", "parent": "tailRoot", "pivot": [1083, 570], "tip": [1183, 764]},
      {"id": "tailBlade", "parent": "tailBend", "pivot": [1094, 963], "tip": [841, 1054]}
    ],
    contacts: {
      "farFoot": {"bone": "hips", "point": [436, 1117]},
      "nearFoot": {"bone": "hips", "point": [650, 1131]},
      "head": {"bone": "head", "point": [125, 288]},
      "dorsal": {"bone": "dorsal", "point": [631, 336]},
      "arm": {"bone": "arm", "point": [499, 499]},
      "nearClaw": {"bone": "nearClaw", "point": [299, 601]},
      "farClaw": {"bone": "farClaw", "point": [148, 433]},
      "tailBend": {"bone": "tailBend", "point": [1183, 764]},
      "tailBlade": {"bone": "tailBlade", "point": [841, 1054]}
    },
    poses: {
      "intro": {"head": 3.5, "dorsal": 0.9, "tailBlade": 1.4},
      "round-win": {"head": 4.2, "farClaw": -3.1, "tailBend": 0.9},
      "round-loss": {"head": -4.7, "dorsal": -1.2, "tailBlade": -2.1},
      "recovery": {"nearClaw": 3.5, "arm": -1.15, "tailBend": -1.5, "tailBlade": 1.2}
    }
  },
  {
    fighterId: "cryo-monica",
    profileId: "enemy-225-cryo-adapted-monica-line",
    sourceSha256: "10e4a825fe25a868443a4dcc0485b446287cf54f15f084735d3e678037703f6d",
    anatomy: "cryo-monica-with-a-curved-dome-trailing-tubes-and-tapered-tail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [884, 559], "tip": [884, 612]},
      {"id": "spine", "parent": "hips", "pivot": [908, 514], "tip": [1024, 328]},
      {"id": "dome", "parent": "spine", "pivot": [1154, 275], "tip": [1257, 307]},
      {"id": "dorsalTubes", "parent": "spine", "pivot": [980, 256], "tip": [889, 182]},
      {"id": "arm", "parent": "spine", "pivot": [998, 354], "tip": [922, 468]},
      {"id": "nearClaw", "parent": "arm", "pivot": [950, 510], "tip": [1012, 621]},
      {"id": "farClaw", "parent": "spine", "pivot": [1126, 514], "tip": [1275, 626]},
      {"id": "tailRoot", "parent": "hips", "pivot": [805, 507], "tip": [712, 677]},
      {"id": "tailPoint", "parent": "tailRoot", "pivot": [561, 817], "tip": [319, 847]}
    ],
    contacts: {
      "backFoot": {"bone": "hips", "point": [784, 912]},
      "frontFoot": {"bone": "hips", "point": [1175, 910]},
      "dome": {"bone": "dome", "point": [1257, 307]},
      "dorsalTubes": {"bone": "dorsalTubes", "point": [889, 182]},
      "arm": {"bone": "arm", "point": [922, 468]},
      "nearClaw": {"bone": "nearClaw", "point": [1012, 621]},
      "farClaw": {"bone": "farClaw", "point": [1275, 626]},
      "tailRoot": {"bone": "tailRoot", "point": [712, 677]},
      "tailPoint": {"bone": "tailPoint", "point": [319, 847]}
    },
    poses: {
      "intro": {"dome": -3.5, "dorsalTubes": 2.1, "tailPoint": 0.8},
      "round-win": {"dome": -4.4, "nearClaw": -2.5, "tailRoot": 0.8},
      "round-loss": {"dome": 4.8, "farClaw": 2.7, "dorsalTubes": -1.4},
      "recovery": {"arm": -1.1, "nearClaw": 3.8, "tailPoint": -2.2}
    }
  },
  {
    fighterId: "cryo-ripper-queen",
    profileId: "enemy-232-cryo-adapted-ripper-queen",
    sourceSha256: "95484d0e0d42bfbe59514410707ef01ca2b95f7055d95ae6cf1a3c913b4b3379",
    anatomy: "ice-edged-queen-with-layered-frill-and-tall-tail-hook",
    bones: [
      {"id": "hips", "parent": null, "pivot": [798, 610], "tip": [833, 626]},
      {"id": "spine", "parent": "hips", "pivot": [770, 561], "tip": [973, 363]},
      {"id": "head", "parent": "spine", "pivot": [1182, 349], "tip": [1331, 375]},
      {"id": "frill", "parent": "head", "pivot": [1185, 195], "tip": [1066, 81]},
      {"id": "shoulder", "parent": "spine", "pivot": [977, 407], "tip": [924, 554]},
      {"id": "nearClaw", "parent": "shoulder", "pivot": [924, 579], "tip": [1107, 719]},
      {"id": "farClaw", "parent": "spine", "pivot": [1199, 542], "tip": [1389, 663]},
      {"id": "tailRoot", "parent": "hips", "pivot": [719, 552], "tip": [545, 591]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [326, 670], "tip": [133, 687]},
      {"id": "tailHook", "parent": "tailSweep", "pivot": [114, 538], "tip": [291, 363]}
    ],
    contacts: {
      "backFoot": {"bone": "hips", "point": [510, 943]},
      "frontFoot": {"bone": "hips", "point": [1103, 936]},
      "head": {"bone": "head", "point": [1331, 375]},
      "frill": {"bone": "frill", "point": [1066, 81]},
      "shoulder": {"bone": "shoulder", "point": [924, 554]},
      "nearClaw": {"bone": "nearClaw", "point": [1107, 719]},
      "farClaw": {"bone": "farClaw", "point": [1389, 663]},
      "tailSweep": {"bone": "tailSweep", "point": [133, 687]},
      "tailHook": {"bone": "tailHook", "point": [291, 363]}
    },
    poses: {
      "intro": {"head": -2.8, "frill": -1.4, "tailHook": 1.5},
      "round-win": {"head": -4.1, "nearClaw": -2.5, "tailSweep": 1.25},
      "round-loss": {"head": 4.6, "frill": 1.7, "farClaw": 2.5},
      "recovery": {"shoulder": 1.3, "nearClaw": 3.6, "tailHook": -2.1}
    }
  },
  {
    fighterId: "armored-foundry-crusher",
    profileId: "enemy-130-armored-foundry-crusher",
    sourceSha256: "a33dd70e916f6623ebfb07195c54633d264ed8728ef98af310cdba016b0053ce",
    anatomy: "bronze-crusher-with-three-seamed-visor-plates-and-low-sweep",
    bones: [
      {"id": "hips", "parent": null, "pivot": [731, 596], "tip": [740, 642]},
      {"id": "spine", "parent": "hips", "pivot": [747, 493], "tip": [1071, 461]},
      {"id": "helm", "parent": "spine", "pivot": [1296, 507], "tip": [1343, 407]},
      {"id": "visorBeak", "parent": "helm", "pivot": [1347, 510], "tip": [1408, 631]},
      {"id": "dorsal", "parent": "spine", "pivot": [1024, 347], "tip": [929, 335]},
      {"id": "foreBrace", "parent": "spine", "pivot": [1075, 610], "tip": [1187, 742]},
      {"id": "tailRoot", "parent": "hips", "pivot": [621, 472], "tip": [407, 589]},
      {"id": "tailTip", "parent": "tailRoot", "pivot": [289, 607], "tip": [144, 647]}
    ],
    contacts: {
      "backNear": {"bone": "hips", "point": [596, 833]},
      "backFar": {"bone": "hips", "point": [926, 831]},
      "frontNear": {"bone": "hips", "point": [1199, 831]},
      "frontFar": {"bone": "hips", "point": [1341, 824]},
      "helm": {"bone": "helm", "point": [1343, 407]},
      "visorBeak": {"bone": "visorBeak", "point": [1408, 631]},
      "dorsal": {"bone": "dorsal", "point": [929, 335]},
      "foreBrace": {"bone": "foreBrace", "point": [1187, 742]},
      "tailTip": {"bone": "tailTip", "point": [144, 647]}
    },
    poses: {
      "intro": {"helm": -4.1, "dorsal": 1.35},
      "round-win": {"helm": -4.7, "visorBeak": -1.4, "tailTip": 1.45},
      "round-loss": {"helm": 4.2, "visorBeak": 2, "dorsal": -1.6},
      "recovery": {"helm": 1.2, "foreBrace": 3.2, "tailTip": -1.6, "dorsal": 1.2}
    }
  },
  {
    fighterId: "armored-reef-stalker",
    profileId: "enemy-131-armored-reef-stalker",
    sourceSha256: "31d50e6f4080060e685339cbd9b74ecf7de8f27a44603ad258e287a61736e5f8",
    anatomy: "shell-backed-reef-stalker-with-sweeping-crest-and-thin-probing-tail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [870, 632], "tip": [888, 666]},
      {"id": "spine", "parent": "hips", "pivot": [873, 541], "tip": [1092, 500]},
      {"id": "head", "parent": "spine", "pivot": [1322, 393], "tip": [1463, 439]},
      {"id": "crownSpikes", "parent": "spine", "pivot": [1209, 385], "tip": [1105, 254]},
      {"id": "foreArm", "parent": "spine", "pivot": [1163, 522], "tip": [1117, 624]},
      {"id": "foreClaw", "parent": "foreArm", "pivot": [1180, 673], "tip": [1329, 790]},
      {"id": "tailRoot", "parent": "hips", "pivot": [819, 510], "tip": [629, 578]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [466, 671], "tip": [241, 690]},
      {"id": "tailFilament", "parent": "tailSweep", "pivot": [156, 658], "tip": [88, 585]}
    ],
    contacts: {
      "hindNear": {"bone": "hips", "point": [646, 790]},
      "hindFar": {"bone": "hips", "point": [1044, 792]},
      "foreNear": {"bone": "hips", "point": [1351, 785]},
      "foreFar": {"bone": "hips", "point": [1490, 761]},
      "head": {"bone": "head", "point": [1463, 439]},
      "crownSpikes": {"bone": "crownSpikes", "point": [1105, 254]},
      "foreArm": {"bone": "foreArm", "point": [1117, 624]},
      "foreClaw": {"bone": "foreClaw", "point": [1329, 790]},
      "tailSweep": {"bone": "tailSweep", "point": [241, 690]},
      "tailFilament": {"bone": "tailFilament", "point": [88, 585]}
    },
    poses: {
      "intro": {"head": -3.8, "crownSpikes": 1.5, "tailFilament": 1.1},
      "round-win": {"head": -4.2, "foreArm": -1.6, "tailSweep": 1.65},
      "round-loss": {"head": 4.85, "crownSpikes": -2.2, "tailFilament": -2.15},
      "recovery": {"foreArm": 1.4, "foreClaw": 3.9, "head": 1.2, "tailSweep": -1.2}
    }
  },
  {
    fighterId: "armored-pale-hunter",
    profileId: "enemy-134-armored-pale-crucible-hunter",
    sourceSha256: "ddda607d63df47f58bd1b3b960525386ff1d7357bdc1256269b438577ea22193",
    anatomy: "pale-armored-hunter-with-chamfered-crest-and-spurred-forearm",
    bones: [
      {"id": "hips", "parent": null, "pivot": [773, 589], "tip": [789, 638]},
      {"id": "spine", "parent": "hips", "pivot": [784, 491], "tip": [1026, 431]},
      {"id": "head", "parent": "spine", "pivot": [1217, 421], "tip": [1364, 435]},
      {"id": "crest", "parent": "head", "pivot": [1189, 358], "tip": [1087, 264]},
      {"id": "dorsalSpines", "parent": "spine", "pivot": [1012, 344], "tip": [961, 282]},
      {"id": "armPlate", "parent": "spine", "pivot": [1024, 465], "tip": [933, 568]},
      {"id": "foreClaw", "parent": "armPlate", "pivot": [991, 663], "tip": [1185, 780]},
      {"id": "tailRoot", "parent": "hips", "pivot": [740, 451], "tip": [589, 531]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [431, 621], "tip": [226, 631]},
      {"id": "tailPoint", "parent": "tailSweep", "pivot": [139, 580], "tip": [84, 435]}
    ],
    contacts: {
      "hindNear": {"bone": "hips", "point": [614, 822]},
      "hindFar": {"bone": "hips", "point": [1026, 815]},
      "foreNear": {"bone": "hips", "point": [1206, 798]},
      "foreFar": {"bone": "hips", "point": [1403, 773]},
      "head": {"bone": "head", "point": [1364, 435]},
      "crest": {"bone": "crest", "point": [1087, 264]},
      "dorsalSpines": {"bone": "dorsalSpines", "point": [961, 282]},
      "armPlate": {"bone": "armPlate", "point": [933, 568]},
      "foreClaw": {"bone": "foreClaw", "point": [1185, 780]},
      "tailSweep": {"bone": "tailSweep", "point": [226, 631]},
      "tailPoint": {"bone": "tailPoint", "point": [84, 435]}
    },
    poses: {
      "intro": {"head": -3.6, "crest": 1.2, "tailPoint": 0.9},
      "round-win": {"head": -4.3, "dorsalSpines": -1.4, "armPlate": -1.35},
      "round-loss": {"head": 4.8, "crest": -1.15, "tailPoint": -2.4},
      "recovery": {"armPlate": 1.55, "foreClaw": 3.95, "tailSweep": 1, "head": 1.8}
    }
  },
  {
    fighterId: "armored-dust-runner",
    profileId: "enemy-135-armored-dust-runner",
    sourceSha256: "3ff7a1cf80c4f9ee0a2cf9823a30c804981f08c2a599b86bcd511e268415e2ce",
    anatomy: "armored-dust-runner-with-gloss-dome-and-spoked-tail-circle",
    bones: [
      {"id": "hips", "parent": null, "pivot": [770, 559], "tip": [768, 600]},
      {"id": "spine", "parent": "hips", "pivot": [787, 507], "tip": [998, 521]},
      {"id": "dome", "parent": "spine", "pivot": [1136, 456], "tip": [1280, 484]},
      {"id": "mandible", "parent": "dome", "pivot": [1208, 510], "tip": [1282, 561]},
      {"id": "foreArm", "parent": "spine", "pivot": [1040, 559], "tip": [975, 694]},
      {"id": "foreClaw", "parent": "foreArm", "pivot": [1001, 745], "tip": [1150, 810]},
      {"id": "tailRoot", "parent": "hips", "pivot": [694, 484], "tip": [528, 566]},
      {"id": "tailLoop", "parent": "tailRoot", "pivot": [317, 596], "tip": [121, 491]},
      {"id": "tailTip", "parent": "tailLoop", "pivot": [195, 256], "tip": [470, 298]}
    ],
    contacts: {
      "rearNear": {"bone": "hips", "point": [470, 824]},
      "rearFar": {"bone": "hips", "point": [824, 812]},
      "frontNear": {"bone": "hips", "point": [1164, 826]},
      "frontFar": {"bone": "hips", "point": [1385, 808]},
      "dome": {"bone": "dome", "point": [1280, 484]},
      "mandible": {"bone": "mandible", "point": [1282, 561]},
      "foreArm": {"bone": "foreArm", "point": [975, 694]},
      "foreClaw": {"bone": "foreClaw", "point": [1150, 810]},
      "tailLoop": {"bone": "tailLoop", "point": [121, 491]},
      "tailTip": {"bone": "tailTip", "point": [470, 298]}
    },
    poses: {
      "intro": {"dome": -3.5, "mandible": 0.9, "tailTip": 1.5},
      "round-win": {"dome": -4.45, "foreArm": -1.25, "tailLoop": 1.35},
      "round-loss": {"dome": 4.9, "mandible": -1.6, "tailTip": -2.5},
      "recovery": {"foreArm": 1.6, "foreClaw": 3.25, "tailLoop": -1.2, "dome": 1.3}
    }
  },
  {
    fighterId: "armored-salvage-brute",
    profileId: "enemy-136-armored-salvage-hive-brute",
    sourceSha256: "243fa8b3fd29998168aca340e0cf9ad58b222b0e1765d7b14c5925d44623f4f3",
    anatomy: "bronze-salvage-brute-with-massive-forearm-guards-and-spined-back",
    bones: [
      {"id": "hips", "parent": null, "pivot": [579, 712], "tip": [584, 778]},
      {"id": "spine", "parent": "hips", "pivot": [598, 624], "tip": [752, 496]},
      {"id": "dome", "parent": "spine", "pivot": [969, 410], "tip": [1103, 470]},
      {"id": "dorsal", "parent": "spine", "pivot": [835, 370], "tip": [744, 308]},
      {"id": "nearArm", "parent": "spine", "pivot": [778, 519], "tip": [778, 664]},
      {"id": "gauntlet", "parent": "nearArm", "pivot": [809, 710], "tip": [960, 903]},
      {"id": "tailRoot", "parent": "hips", "pivot": [502, 704], "tip": [365, 838]},
      {"id": "tailPoint", "parent": "tailRoot", "pivot": [254, 909], "tip": [108, 932]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [502, 960]},
      "rearLow": {"bone": "hips", "point": [750, 963]},
      "nearFist": {"bone": "hips", "point": [958, 952]},
      "farFist": {"bone": "hips", "point": [1151, 946]},
      "dome": {"bone": "dome", "point": [1103, 470]},
      "dorsal": {"bone": "dorsal", "point": [744, 308]},
      "nearArm": {"bone": "nearArm", "point": [778, 664]},
      "gauntlet": {"bone": "gauntlet", "point": [960, 903]},
      "tailRoot": {"bone": "tailRoot", "point": [365, 838]},
      "tailPoint": {"bone": "tailPoint", "point": [108, 932]}
    },
    poses: {
      "intro": {"dome": -3.8, "dorsal": 1.6, "tailPoint": 0.7},
      "round-win": {"dome": -4.4, "gauntlet": -2.5, "tailRoot": 1.3},
      "round-loss": {"dome": 4.6, "dorsal": -1.8, "tailPoint": -1.4},
      "recovery": {"nearArm": 1.8, "gauntlet": 3.55, "dome": 1.4, "tailRoot": -0.85}
    }
  },
  {
    fighterId: "armored-caravan-stalker",
    profileId: "enemy-138-armored-caravan-stalker",
    sourceSha256: "c244d655a9af48f5de1273d147edcf2b44417a312bd04322340bb70fdc055c28",
    anatomy: "armored-caravan-hunter-with-twin-rear-vents-and-lengthened-wrists",
    bones: [
      {"id": "hips", "parent": null, "pivot": [794, 600], "tip": [789, 633]},
      {"id": "spine", "parent": "hips", "pivot": [810, 524], "tip": [1010, 461]},
      {"id": "dome", "parent": "spine", "pivot": [1219, 398], "tip": [1336, 440]},
      {"id": "vents", "parent": "spine", "pivot": [989, 354], "tip": [908, 310]},
      {"id": "foreArm", "parent": "spine", "pivot": [1029, 479], "tip": [991, 603]},
      {"id": "foreWrist", "parent": "foreArm", "pivot": [998, 656], "tip": [1078, 784]},
      {"id": "tailRoot", "parent": "hips", "pivot": [756, 463], "tip": [570, 524]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [438, 642], "tip": [256, 721]},
      {"id": "tailHook", "parent": "tailSweep", "pivot": [212, 728], "tip": [130, 694]}
    ],
    contacts: {
      "hindNear": {"bone": "hips", "point": [605, 798]},
      "hindFar": {"bone": "hips", "point": [863, 808]},
      "foreNear": {"bone": "hips", "point": [1073, 812]},
      "foreFar": {"bone": "hips", "point": [1303, 819]},
      "dome": {"bone": "dome", "point": [1336, 440]},
      "vents": {"bone": "vents", "point": [908, 310]},
      "foreArm": {"bone": "foreArm", "point": [991, 603]},
      "foreWrist": {"bone": "foreWrist", "point": [1078, 784]},
      "tailSweep": {"bone": "tailSweep", "point": [256, 721]},
      "tailHook": {"bone": "tailHook", "point": [130, 694]}
    },
    poses: {
      "intro": {"dome": -4, "vents": 1.15, "tailHook": 1.15},
      "round-win": {"dome": -4.3, "foreArm": -1.45, "tailSweep": 1.7},
      "round-loss": {"dome": 4.55, "vents": -1.8, "tailHook": -2.25},
      "recovery": {"foreArm": 1.1, "foreWrist": 3.5, "dome": 1.65, "tailSweep": -1.2}
    }
  },
  {
    fighterId: "acid-k-series",
    profileId: "enemy-176-acid-blooded-k-series-yellow-xenomorph",
    sourceSha256: "d202d52dc2e63f69e03c44e9fb09a8fe1910a6fd73a4763a77c2b0bb37a37b96",
    anatomy: "yellow-acid-coated-dome-with-crescent-spined-tail-and-hanging-claws",
    bones: [
      {"id": "hips", "parent": null, "pivot": [625, 755], "tip": [619, 813]},
      {"id": "spine", "parent": "hips", "pivot": [622, 660], "tip": [709, 405]},
      {"id": "dome", "parent": "spine", "pivot": [848, 330], "tip": [995, 385]},
      {"id": "crest", "parent": "dome", "pivot": [885, 252], "tip": [746, 200]},
      {"id": "arm", "parent": "spine", "pivot": [668, 393], "tip": [590, 555]},
      {"id": "nearClaw", "parent": "arm", "pivot": [674, 634], "tip": [856, 718]},
      {"id": "farClaw", "parent": "spine", "pivot": [911, 619], "tip": [1042, 668]},
      {"id": "tailRoot", "parent": "hips", "pivot": [521, 729], "tip": [318, 825]},
      {"id": "tailLoop", "parent": "tailRoot", "pivot": [168, 767], "tip": [165, 524]},
      {"id": "tailBlade", "parent": "tailLoop", "pivot": [307, 333], "tip": [243, 188]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [521, 1140]},
      "frontFoot": {"bone": "hips", "point": [880, 1131]},
      "dome": {"bone": "dome", "point": [995, 385]},
      "crest": {"bone": "crest", "point": [746, 200]},
      "arm": {"bone": "arm", "point": [590, 555]},
      "nearClaw": {"bone": "nearClaw", "point": [856, 718]},
      "farClaw": {"bone": "farClaw", "point": [1042, 668]},
      "tailLoop": {"bone": "tailLoop", "point": [165, 524]},
      "tailBlade": {"bone": "tailBlade", "point": [243, 188]}
    },
    poses: {
      "intro": {"dome": -3.4, "crest": -1.15, "tailBlade": 1.65},
      "round-win": {"dome": -4.8, "farClaw": -2.7, "tailLoop": 1.1},
      "round-loss": {"dome": 4.85, "crest": 1.4, "tailBlade": -2.3},
      "recovery": {"arm": 1.1, "nearClaw": 3.6, "dome": 1.6, "tailLoop": -1.05}
    }
  },
  {
    fighterId: "user-green-dome",
    profileId: "pose-v95-user-bipede-dome-verdoyant",
    sourceSha256: "7b53249ba6e7f4f4f04eac94c8fef068463937a7d884feba5cc2fe324921c5a4",
    anatomy: "verdant-crown-with-extended-inner-jaw-and-looped-tail-scythe",
    bones: [
      {"id": "hips", "parent": null, "pivot": [542, 650], "tip": [553, 715]},
      {"id": "spine", "parent": "hips", "pivot": [530, 616], "tip": [670, 416]},
      {"id": "head", "parent": "spine", "pivot": [869, 308], "tip": [1009, 390]},
      {"id": "jaw", "parent": "head", "pivot": [998, 428], "tip": [1103, 502]},
      {"id": "dorsal", "parent": "spine", "pivot": [621, 402], "tip": [536, 305]},
      {"id": "foreArm", "parent": "spine", "pivot": [693, 365], "tip": [636, 539]},
      {"id": "tailRoot", "parent": "hips", "pivot": [496, 618], "tip": [322, 712]},
      {"id": "tailLoop", "parent": "tailRoot", "pivot": [234, 858], "tip": [311, 1054]},
      {"id": "tailPoint", "parent": "tailLoop", "pivot": [789, 1006], "tip": [1015, 946]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [333, 1123]},
      "frontFoot": {"bone": "hips", "point": [710, 1106]},
      "head": {"bone": "head", "point": [1009, 390]},
      "jaw": {"bone": "jaw", "point": [1103, 502]},
      "dorsal": {"bone": "dorsal", "point": [536, 305]},
      "foreArm": {"bone": "foreArm", "point": [636, 539]},
      "tailLoop": {"bone": "tailLoop", "point": [311, 1054]},
      "tailPoint": {"bone": "tailPoint", "point": [1015, 946]}
    },
    poses: {
      "intro": {"head": -3.6, "jaw": 0.95, "dorsal": 1.5},
      "round-win": {"head": -4.2, "jaw": -2.6, "tailPoint": 1.15},
      "round-loss": {"head": 4.4, "jaw": 2.45, "tailPoint": -2.2},
      "recovery": {"jaw": 1.75, "foreArm": 3.5, "tailLoop": 1.4, "tailPoint": -0.95}
    }
  },
  {
    fighterId: "user-violet-lobes",
    profileId: "pose-v95-user-quadrupede-lobes-violets",
    sourceSha256: "8bd1f08747535106f605166b97d75cad9b4026fc42d711d3c9efa6e3673ea4ff",
    anatomy: "violet-lobed-skull-with-ventral-jaw-and-rounded-tail-bulb",
    bones: [
      {"id": "hips", "parent": null, "pivot": [656, 704], "tip": [641, 764]},
      {"id": "spine", "parent": "hips", "pivot": [641, 675], "tip": [462, 633]},
      {"id": "skull", "parent": "spine", "pivot": [305, 564], "tip": [168, 522]},
      {"id": "lobes", "parent": "skull", "pivot": [325, 513], "tip": [399, 445]},
      {"id": "jaw", "parent": "skull", "pivot": [222, 550], "tip": [154, 616]},
      {"id": "foreArm", "parent": "spine", "pivot": [442, 604], "tip": [504, 730]},
      {"id": "tailRoot", "parent": "hips", "pivot": [744, 616], "tip": [872, 658]},
      {"id": "tailCurve", "parent": "tailRoot", "pivot": [958, 678], "tip": [1043, 658]},
      {"id": "bulb", "parent": "tailCurve", "pivot": [1094, 613], "tip": [1166, 593]}
    ],
    contacts: {
      "hindNear": {"bone": "hips", "point": [778, 869]},
      "hindFar": {"bone": "hips", "point": [644, 878]},
      "frontNear": {"bone": "hips", "point": [322, 912]},
      "frontFar": {"bone": "hips", "point": [131, 889]},
      "skull": {"bone": "skull", "point": [168, 522]},
      "lobes": {"bone": "lobes", "point": [399, 445]},
      "jaw": {"bone": "jaw", "point": [154, 616]},
      "foreArm": {"bone": "foreArm", "point": [504, 730]},
      "tailCurve": {"bone": "tailCurve", "point": [1043, 658]},
      "bulb": {"bone": "bulb", "point": [1166, 593]}
    },
    poses: {
      "intro": {"skull": 3.2, "lobes": 1.7, "bulb": 0.9},
      "round-win": {"skull": 4.35, "jaw": -2.4, "tailCurve": -1.2},
      "round-loss": {"skull": -4.6, "lobes": -1.75, "bulb": -2.2},
      "recovery": {"jaw": 2.8, "foreArm": 1.6, "tailCurve": 1.85, "bulb": 1.3}
    }
  },
  {
    fighterId: "user-black-dome",
    profileId: "pose-v95-user-quadrupede-dome-noir",
    sourceSha256: "d4aa135264e99b4ea84d3cb623d00473e2b6dabbcdb52a236ecb878f2de1c494",
    anatomy: "smoky-black-crown-with-arched-neck-and-single-visible-forepaw",
    bones: [
      {"id": "hips", "parent": null, "pivot": [687, 656], "tip": [670, 718]},
      {"id": "spine", "parent": "hips", "pivot": [701, 584], "tip": [929, 561]},
      {"id": "neck", "parent": "spine", "pivot": [1009, 496], "tip": [1063, 493]},
      {"id": "dome", "parent": "neck", "pivot": [1040, 419], "tip": [1171, 470]},
      {"id": "arm", "parent": "spine", "pivot": [955, 590], "tip": [923, 721]},
      {"id": "wrist", "parent": "arm", "pivot": [935, 795], "tip": [940, 886]},
      {"id": "tailRoot", "parent": "hips", "pivot": [636, 581], "tip": [504, 704]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [317, 892], "tip": [197, 804]},
      {"id": "tailTip", "parent": "tailSweep", "pivot": [171, 781], "tip": [97, 750]}
    ],
    contacts: {
      "hindNear": {"bone": "hips", "point": [573, 946]},
      "hindFar": {"bone": "hips", "point": [644, 949]},
      "forePad": {"bone": "hips", "point": [983, 952]},
      "neck": {"bone": "neck", "point": [1063, 493]},
      "dome": {"bone": "dome", "point": [1171, 470]},
      "arm": {"bone": "arm", "point": [923, 721]},
      "wrist": {"bone": "wrist", "point": [940, 886]},
      "tailSweep": {"bone": "tailSweep", "point": [197, 804]},
      "tailTip": {"bone": "tailTip", "point": [97, 750]}
    },
    poses: {
      "intro": {"dome": -3.6, "neck": -0.95, "tailTip": 1.35},
      "round-win": {"dome": -4.2, "neck": -1.1, "tailSweep": 0.9},
      "round-loss": {"dome": 4.15, "neck": 1.3, "tailTip": -2.1},
      "recovery": {"arm": 1.5, "wrist": 3.35, "dome": 1.45, "tailSweep": -1.1}
    }
  },
  {
    fighterId: "user-black-fin",
    profileId: "pose-v95-user-quadrupede-nageoire-noire",
    sourceSha256: "3b3a78091028793320e98006ea40645dc5da59b78051eb1055c49dbee220d615",
    anatomy: "black-fin-projection-with-rear-tendrils-and-spined-balanced-tail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [610, 650], "tip": [624, 707]},
      {"id": "spine", "parent": "hips", "pivot": [598, 570], "tip": [402, 573]},
      {"id": "muzzle", "parent": "spine", "pivot": [268, 633], "tip": [154, 681]},
      {"id": "fin", "parent": "muzzle", "pivot": [274, 502], "tip": [382, 450]},
      {"id": "rearTendrils", "parent": "spine", "pivot": [644, 556], "tip": [770, 475]},
      {"id": "foreArm", "parent": "spine", "pivot": [390, 616], "tip": [465, 684]},
      {"id": "tailRoot", "parent": "hips", "pivot": [715, 627], "tip": [881, 707]},
      {"id": "tailBend", "parent": "tailRoot", "pivot": [1012, 718], "tip": [1060, 653]},
      {"id": "tailHook", "parent": "tailBend", "pivot": [1137, 621], "tip": [1208, 678]}
    ],
    contacts: {
      "foreFar": {"bone": "hips", "point": [171, 824]},
      "foreNear": {"bone": "hips", "point": [271, 849]},
      "hindFar": {"bone": "hips", "point": [630, 844]},
      "hindNear": {"bone": "hips", "point": [775, 838]},
      "muzzle": {"bone": "muzzle", "point": [154, 681]},
      "fin": {"bone": "fin", "point": [382, 450]},
      "rearTendrils": {"bone": "rearTendrils", "point": [770, 475]},
      "foreArm": {"bone": "foreArm", "point": [465, 684]},
      "tailBend": {"bone": "tailBend", "point": [1060, 653]},
      "tailHook": {"bone": "tailHook", "point": [1208, 678]}
    },
    poses: {
      "intro": {"muzzle": 3.5, "fin": 1.25, "tailHook": 1},
      "round-win": {"muzzle": 4.4, "rearTendrils": -1.85, "tailBend": 1.15},
      "round-loss": {"muzzle": -4.7, "fin": -1.6, "tailHook": -2.4},
      "recovery": {"foreArm": 2.9, "muzzle": 1.8, "tailBend": -1.15, "tailHook": 0.9}
    }
  },
  {
    fighterId: "user-orange-biped",
    profileId: "pose-v95-user-bipede-brun-orange",
    sourceSha256: "247f29bbb7f13f97d3b7aaf939b66178445735ffd00b4fee9cfbd79b2a29bb49",
    anatomy: "orange-runner-with-lapped-dome-forked-claws-and-coiled-scythe",
    bones: [
      {"id": "hips", "parent": null, "pivot": [581, 767], "tip": [590, 815]},
      {"id": "spine", "parent": "hips", "pivot": [564, 727], "tip": [493, 436]},
      {"id": "muzzle", "parent": "spine", "pivot": [467, 405], "tip": [314, 402]},
      {"id": "dome", "parent": "muzzle", "pivot": [445, 325], "tip": [593, 294]},
      {"id": "farClaw", "parent": "spine", "pivot": [342, 556], "tip": [211, 656]},
      {"id": "arm", "parent": "spine", "pivot": [607, 450], "tip": [613, 627]},
      {"id": "nearClaw", "parent": "arm", "pivot": [587, 715], "tip": [484, 838]},
      {"id": "tailRoot", "parent": "hips", "pivot": [653, 701], "tip": [824, 721]},
      {"id": "tailLoop", "parent": "tailRoot", "pivot": [985, 655], "tip": [923, 536]},
      {"id": "tailScythe", "parent": "tailLoop", "pivot": [1052, 416], "tip": [1114, 516]}
    ],
    contacts: {
      "forwardFoot": {"bone": "hips", "point": [314, 1054]},
      "rearFoot": {"bone": "hips", "point": [818, 1057]},
      "muzzle": {"bone": "muzzle", "point": [314, 402]},
      "dome": {"bone": "dome", "point": [593, 294]},
      "farClaw": {"bone": "farClaw", "point": [211, 656]},
      "arm": {"bone": "arm", "point": [613, 627]},
      "nearClaw": {"bone": "nearClaw", "point": [484, 838]},
      "tailLoop": {"bone": "tailLoop", "point": [923, 536]},
      "tailScythe": {"bone": "tailScythe", "point": [1114, 516]}
    },
    poses: {
      "intro": {"muzzle": 3.3, "dome": 1.45, "tailScythe": 1.3},
      "round-win": {"muzzle": 4.05, "farClaw": -2.3, "tailLoop": -1.25},
      "round-loss": {"muzzle": -4.55, "dome": -1.15, "tailScythe": -2.1},
      "recovery": {"arm": -1.2, "nearClaw": 3.7, "tailLoop": 1.35, "tailScythe": 0.85}
    }
  },
  {
    fighterId: "user-renaissance",
    profileId: "pose-v95-user-xeno-experiment-renaissance",
    sourceSha256: "f16469e31d48f35448cafaffd790fd2f0b01214e7b2dd471ff1526b2703cb9b6",
    anatomy: "tall-renaissance-profile-with-hooded-skull-and-long-mantled-arms",
    bones: [
      {"id": "hips", "parent": null, "pivot": [533, 682], "tip": [568, 746]},
      {"id": "spine", "parent": "hips", "pivot": [529, 638], "tip": [542, 392]},
      {"id": "neck", "parent": "spine", "pivot": [523, 338], "tip": [552, 293]},
      {"id": "hood", "parent": "neck", "pivot": [536, 252], "tip": [635, 159]},
      {"id": "farArm", "parent": "spine", "pivot": [481, 418], "tip": [437, 584]},
      {"id": "farHand", "parent": "farArm", "pivot": [395, 692], "tip": [370, 810]},
      {"id": "nearArm", "parent": "spine", "pivot": [647, 402], "tip": [721, 603]},
      {"id": "nearHand", "parent": "nearArm", "pivot": [746, 702], "tip": [730, 800]}
    ],
    contacts: {
      "farFoot": {"bone": "hips", "point": [421, 1266]},
      "nearFoot": {"bone": "hips", "point": [660, 1275]},
      "spine": {"bone": "spine", "point": [542, 392]},
      "neck": {"bone": "neck", "point": [552, 293]},
      "hood": {"bone": "hood", "point": [635, 159]},
      "farArm": {"bone": "farArm", "point": [437, 584]},
      "farHand": {"bone": "farHand", "point": [370, 810]},
      "nearArm": {"bone": "nearArm", "point": [721, 603]},
      "nearHand": {"bone": "nearHand", "point": [730, 800]}
    },
    poses: {
      "intro": {"neck": 2.65, "hood": 2.4, "spine": -0.6},
      "round-win": {"hood": 4.3, "nearArm": -2.1, "nearHand": -2.1},
      "round-loss": {"neck": -3.9, "hood": -2.15, "farArm": 1.45},
      "recovery": {"nearArm": 2.4, "nearHand": 2.7, "farHand": -2.15, "hood": 1.35}
    }
  },
  {
    fighterId: "import-alien-king-from-alien-extemrination",
    profileId: "pose-v106-import-alien-king-from-alien-extemrination",
    sourceSha256: "6fea0618f4565efbef7acd42a387f38aa42e30303f921936e902842ff3999868",
    anatomy: "chitinous-king-with-dorsal-sail-and-two-distinct-appendage-mouths",
    bones: [
      {"id": "hips", "parent": null, "pivot": [824, 719], "tip": [852, 752]},
      {"id": "spine", "parent": "hips", "pivot": [806, 678], "tip": [727, 543]},
      {"id": "crownSail", "parent": "spine", "pivot": [671, 523], "tip": [477, 102]},
      {"id": "ventralMouth", "parent": "spine", "pivot": [673, 724], "tip": [724, 870]},
      {"id": "farArm", "parent": "spine", "pivot": [507, 602], "tip": [333, 662]},
      {"id": "farMouth", "parent": "farArm", "pivot": [224, 666], "tip": [107, 742]},
      {"id": "nearArm", "parent": "spine", "pivot": [920, 476], "tip": [1163, 311]},
      {"id": "nearMouth", "parent": "nearArm", "pivot": [1219, 242], "tip": [1298, 168]},
      {"id": "blade", "parent": "spine", "pivot": [885, 380], "tip": [1112, 89]},
      {"id": "rearTendril", "parent": "hips", "pivot": [394, 434], "tip": [181, 548]}
    ],
    contacts: {
      "farSupport": {"bone": "hips", "point": [316, 1000]},
      "nearSupport": {"bone": "hips", "point": [906, 980]},
      "rearRake": {"bone": "hips", "point": [1114, 839]},
      "crownSail": {"bone": "crownSail", "point": [477, 102]},
      "ventralMouth": {"bone": "ventralMouth", "point": [724, 870]},
      "farArm": {"bone": "farArm", "point": [333, 662]},
      "farMouth": {"bone": "farMouth", "point": [107, 742]},
      "nearArm": {"bone": "nearArm", "point": [1163, 311]},
      "nearMouth": {"bone": "nearMouth", "point": [1298, 168]},
      "blade": {"bone": "blade", "point": [1112, 89]},
      "rearTendril": {"bone": "rearTendril", "point": [181, 548]}
    },
    poses: {
      "intro": {"crownSail": 2.25, "nearMouth": 1.4, "ventralMouth": -1.1},
      "round-win": {"crownSail": 3.45, "farMouth": -2.1, "blade": 1.1},
      "round-loss": {"crownSail": -3.6, "ventralMouth": 2.5, "rearTendril": -1.5},
      "recovery": {"farArm": 1.1, "nearArm": -1.1, "nearMouth": 3.1, "ventralMouth": -2.15}
    }
  },
  {
    fighterId: "import-green-alien-king",
    profileId: "pose-v106-import-green-alien-king",
    sourceSha256: "6d821694425ae18150bd948a1dd0164d2024c669817e2c25635ca8f2ba057a79",
    anatomy: "green-bladed-king-with-crowned-skull-and-two-low-tail-segments",
    bones: [
      {"id": "hips", "parent": null, "pivot": [657, 788], "tip": [676, 867]},
      {"id": "spine", "parent": "hips", "pivot": [605, 733], "tip": [548, 482]},
      {"id": "head", "parent": "spine", "pivot": [433, 452], "tip": [267, 436]},
      {"id": "frontCrown", "parent": "head", "pivot": [294, 365], "tip": [364, 142]},
      {"id": "rearCrown", "parent": "head", "pivot": [450, 406], "tip": [529, 68]},
      {"id": "foreArm", "parent": "spine", "pivot": [520, 542], "tip": [490, 657]},
      {"id": "claw", "parent": "foreArm", "pivot": [436, 730], "tip": [362, 820]},
      {"id": "mantleBlade", "parent": "spine", "pivot": [768, 376], "tip": [967, 518]},
      {"id": "tailRoot", "parent": "hips", "pivot": [758, 804], "tip": [970, 919]},
      {"id": "tailCurl", "parent": "tailRoot", "pivot": [1104, 1060], "tip": [953, 1122]}
    ],
    contacts: {
      "frontToe": {"bone": "hips", "point": [542, 1085]},
      "rearToe": {"bone": "hips", "point": [719, 1109]},
      "groundTail": {"bone": "hips", "point": [747, 1144]},
      "head": {"bone": "head", "point": [267, 436]},
      "frontCrown": {"bone": "frontCrown", "point": [364, 142]},
      "rearCrown": {"bone": "rearCrown", "point": [529, 68]},
      "foreArm": {"bone": "foreArm", "point": [490, 657]},
      "claw": {"bone": "claw", "point": [362, 820]},
      "mantleBlade": {"bone": "mantleBlade", "point": [967, 518]},
      "tailRoot": {"bone": "tailRoot", "point": [970, 919]}
    },
    poses: {
      "intro": {"head": 2.65, "frontCrown": 1.55, "rearCrown": -0.7},
      "round-win": {"head": 3.5, "rearCrown": 1.25, "mantleBlade": 1.2},
      "round-loss": {"head": -4.05, "frontCrown": -1.65, "mantleBlade": -1.25},
      "recovery": {"foreArm": 1.1, "claw": 3.9, "rearCrown": 1.6, "tailRoot": 0.75}
    }
  },
  {
    fighterId: "armored-ripper",
    profileId: "enemy-127-armored-atarax-ripper",
    sourceSha256: "48090b66b436696c579d82ae7715e4e78109490c323526106a76968c58e2bb69",
    anatomy: "atarax-ripper-with-overlapping-shoulder-shields-and-low-hinged-tail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [838, 600], "tip": [824, 647]},
      {"id": "spine", "parent": "hips", "pivot": [817, 559], "tip": [882, 312]},
      {"id": "head", "parent": "spine", "pivot": [1159, 282], "tip": [1292, 284]},
      {"id": "crest", "parent": "head", "pivot": [1180, 202], "tip": [1091, 149]},
      {"id": "armShield", "parent": "spine", "pivot": [822, 312], "tip": [752, 417]},
      {"id": "nearClaw", "parent": "armShield", "pivot": [812, 470], "tip": [880, 593]},
      {"id": "farClaw", "parent": "spine", "pivot": [1115, 507], "tip": [1257, 649]},
      {"id": "tailRoot", "parent": "hips", "pivot": [752, 528], "tip": [614, 635]},
      {"id": "tailHook", "parent": "tailRoot", "pivot": [391, 638], "tip": [221, 710]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [656, 903]},
      "forwardFoot": {"bone": "hips", "point": [1078, 903]},
      "head": {"bone": "head", "point": [1292, 284]},
      "crest": {"bone": "crest", "point": [1091, 149]},
      "armShield": {"bone": "armShield", "point": [752, 417]},
      "nearClaw": {"bone": "nearClaw", "point": [880, 593]},
      "farClaw": {"bone": "farClaw", "point": [1257, 649]},
      "tailRoot": {"bone": "tailRoot", "point": [614, 635]},
      "tailHook": {"bone": "tailHook", "point": [221, 710]}
    },
    poses: {
      "intro": {"head": -3.6, "crest": -1.3, "tailHook": 1.45},
      "round-win": {"head": -4.2, "nearClaw": -2.6, "tailRoot": 1},
      "round-loss": {"head": 4.65, "crest": 1.4, "farClaw": 2.4},
      "recovery": {"armShield": 1.1, "nearClaw": 3.45, "farClaw": 2, "tailHook": -1.9}
    }
  },
  {
    fighterId: "cryo-ripper",
    profileId: "enemy-231-cryo-adapted-atarax-ripper",
    sourceSha256: "d4b0299a85bc3831ba5a231e4f2fb99b870d4092f99f0b2f8aab72545b61e368",
    anatomy: "cryo-ripper-with-iced-shoulders-long-claw-and-stiff-hook-tail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [775, 633], "tip": [761, 682]},
      {"id": "spine", "parent": "hips", "pivot": [782, 589], "tip": [954, 354]},
      {"id": "head", "parent": "spine", "pivot": [1203, 347], "tip": [1354, 330]},
      {"id": "crown", "parent": "head", "pivot": [1250, 230], "tip": [1115, 163]},
      {"id": "shoulder", "parent": "spine", "pivot": [966, 305], "tip": [854, 449]},
      {"id": "nearClaw", "parent": "shoulder", "pivot": [891, 589], "tip": [919, 682]},
      {"id": "farClaw", "parent": "spine", "pivot": [1199, 531], "tip": [1392, 733]},
      {"id": "tailRoot", "parent": "hips", "pivot": [724, 510], "tip": [547, 652]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [375, 714], "tip": [205, 742]},
      {"id": "tailHook", "parent": "tailSweep", "pivot": [126, 687], "tip": [109, 514]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [610, 910]},
      "forwardFoot": {"bone": "hips", "point": [1054, 917]},
      "head": {"bone": "head", "point": [1354, 330]},
      "crown": {"bone": "crown", "point": [1115, 163]},
      "shoulder": {"bone": "shoulder", "point": [854, 449]},
      "nearClaw": {"bone": "nearClaw", "point": [919, 682]},
      "farClaw": {"bone": "farClaw", "point": [1392, 733]},
      "tailSweep": {"bone": "tailSweep", "point": [205, 742]},
      "tailHook": {"bone": "tailHook", "point": [109, 514]}
    },
    poses: {
      "intro": {"head": -3.6, "crown": -1.2, "tailHook": 1.3},
      "round-win": {"head": -4.25, "nearClaw": -2.5, "tailSweep": 1.3},
      "round-loss": {"head": 4.55, "farClaw": 2.7, "tailHook": -1.5},
      "recovery": {"shoulder": 1.4, "nearClaw": 3.15, "farClaw": 1.8, "tailSweep": -1}
    }
  },
  {
    fighterId: "cryo-combat-synth",
    profileId: "enemy-250-cryo-adapted-combat-synthetic",
    sourceSha256: "34a35e940934ba67db9498033a8688333f70dc8916ec2057fb4941e46f15d5f3",
    anatomy: "thermally-shielded-synthetic-with-insulated-carbine-and-sealed-optics",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [569, 650], "tip": [569, 709]},
      {"id": "spine", "parent": "hips", "pivot": [578, 623], "tip": [555, 359]},
      {"id": "helmet", "parent": "spine", "pivot": [679, 249], "tip": [727, 169]},
      {"id": "visor", "parent": "helmet", "pivot": [733, 160], "tip": [747, 219]},
      {"id": "shoulder", "parent": "spine", "pivot": [486, 305], "tip": [448, 475]},
      {"id": "forearm", "parent": "shoulder", "pivot": [460, 498], "tip": [673, 549]},
      {"id": "carbine", "parent": "spine", "pivot": [750, 537], "tip": [925, 587]}
    ],
    contacts: {
      "rearBoot": {"bone": "hips", "point": [380, 1177]},
      "forwardBoot": {"bone": "hips", "point": [893, 1163]},
      "spine": {"bone": "spine", "point": [555, 359]},
      "helmet": {"bone": "helmet", "point": [727, 169]},
      "visor": {"bone": "visor", "point": [747, 219]},
      "shoulder": {"bone": "shoulder", "point": [448, 475]}
    },
    poses: {
      "intro": {"helmet": -4.2, "spine": -0.95, "visor": 1.2},
      "round-win": {"helmet": -3.15, "spine": 1.5},
      "round-loss": {"helmet": 4.35, "spine": 1.38, "shoulder": 1.35},
      "recovery": {"helmet": 3.65, "spine": -1.55, "visor": -0.9}
    }
  },
  {
    fighterId: "acid-ripper",
    profileId: "enemy-179-acid-blooded-atarax-ripper",
    sourceSha256: "aae93df2812ad6228d33dc9252fb21432d1bd5d111fdd51d1db03cf7b7372a6c",
    anatomy: "acid-ripper-with-curved-acid-coated-plates-and-deep-jaw-hinge",
    bones: [
      {"id": "hips", "parent": null, "pivot": [770, 691], "tip": [759, 731]},
      {"id": "spine", "parent": "hips", "pivot": [756, 624], "tip": [901, 398]},
      {"id": "head", "parent": "spine", "pivot": [1152, 361], "tip": [1299, 365]},
      {"id": "crown", "parent": "head", "pivot": [1166, 263], "tip": [1075, 189]},
      {"id": "shoulder", "parent": "spine", "pivot": [933, 372], "tip": [770, 514]},
      {"id": "nearClaw", "parent": "shoulder", "pivot": [780, 589], "tip": [824, 684]},
      {"id": "farClaw", "parent": "spine", "pivot": [1143, 589], "tip": [1306, 682]},
      {"id": "tailRoot", "parent": "hips", "pivot": [710, 573], "tip": [549, 680]},
      {"id": "tailCurve", "parent": "tailRoot", "pivot": [340, 728], "tip": [228, 701]},
      {"id": "tailTip", "parent": "tailCurve", "pivot": [209, 614], "tip": [244, 533]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [563, 936]},
      "forwardFoot": {"bone": "hips", "point": [1003, 936]},
      "head": {"bone": "head", "point": [1299, 365]},
      "crown": {"bone": "crown", "point": [1075, 189]},
      "shoulder": {"bone": "shoulder", "point": [770, 514]},
      "nearClaw": {"bone": "nearClaw", "point": [824, 684]},
      "farClaw": {"bone": "farClaw", "point": [1306, 682]},
      "tailCurve": {"bone": "tailCurve", "point": [228, 701]},
      "tailTip": {"bone": "tailTip", "point": [244, 533]}
    },
    poses: {
      "intro": {"head": -3.5, "crown": -1.45, "tailTip": 1.2},
      "round-win": {"head": -4.6, "nearClaw": -2.35, "tailCurve": 1.35},
      "round-loss": {"head": 4.45, "crown": 1.4, "farClaw": 2.65},
      "recovery": {"shoulder": 1.4, "nearClaw": 3.4, "tailTip": -2.15}
    }
  },
  {
    fighterId: "acid-ripper-queen",
    profileId: "enemy-180-acid-blooded-ripper-queen",
    sourceSha256: "2810b39839189f284a0def67d4f00f17b1d97eb5a1f63eb568801b429fab0ad2",
    anatomy: "acid-queen-with-open-crown-plate-lattice-and-forearm-spikes",
    bones: [
      {"id": "hips", "parent": null, "pivot": [680, 645], "tip": [675, 694]},
      {"id": "spine", "parent": "hips", "pivot": [675, 584], "tip": [852, 403]},
      {"id": "head", "parent": "spine", "pivot": [1136, 354], "tip": [1278, 377]},
      {"id": "lattice", "parent": "head", "pivot": [1161, 226], "tip": [1050, 151]},
      {"id": "shoulder", "parent": "spine", "pivot": [870, 433], "tip": [822, 563]},
      {"id": "nearClaw", "parent": "shoulder", "pivot": [859, 649], "tip": [1001, 842]},
      {"id": "farClaw", "parent": "spine", "pivot": [1129, 603], "tip": [1280, 808]},
      {"id": "tailRoot", "parent": "hips", "pivot": [610, 591], "tip": [454, 633]},
      {"id": "tailLoop", "parent": "tailRoot", "pivot": [333, 682], "tip": [200, 694]},
      {"id": "tailPoint", "parent": "tailLoop", "pivot": [184, 549], "tip": [312, 454]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [510, 894]},
      "forwardFoot": {"bone": "hips", "point": [1078, 908]},
      "head": {"bone": "head", "point": [1278, 377]},
      "lattice": {"bone": "lattice", "point": [1050, 151]},
      "shoulder": {"bone": "shoulder", "point": [822, 563]},
      "nearClaw": {"bone": "nearClaw", "point": [1001, 842]},
      "farClaw": {"bone": "farClaw", "point": [1280, 808]},
      "tailLoop": {"bone": "tailLoop", "point": [200, 694]},
      "tailPoint": {"bone": "tailPoint", "point": [312, 454]}
    },
    poses: {
      "intro": {"head": -3.1, "lattice": -1.45, "tailPoint": 0.9},
      "round-win": {"head": -4.35, "nearClaw": -2.7, "tailLoop": 1.15},
      "round-loss": {"head": 4.45, "lattice": 1.35, "farClaw": 2.75},
      "recovery": {"shoulder": 1.25, "nearClaw": 3.8, "farClaw": 1.85, "tailPoint": -1.7}
    }
  },
  {
    fighterId: "acid-foundry-crusher",
    profileId: "enemy-182-acid-blooded-foundry-crusher",
    sourceSha256: "0d1c545f00ebeeebe0a90c0171b6f5ed40403558fcdb1783ae905f6028eff111",
    anatomy: "acid-furnace-crusher-with-broad-scooped-helmet-and-pinched-shoulder-plates",
    bones: [
      {"id": "hips", "parent": null, "pivot": [714, 593], "tip": [712, 649]},
      {"id": "spine", "parent": "hips", "pivot": [731, 498], "tip": [1057, 503]},
      {"id": "crownHinge", "parent": "spine", "pivot": [1287, 531], "tip": [1257, 293]},
      {"id": "visor", "parent": "crownHinge", "pivot": [1347, 577], "tip": [1429, 633]},
      {"id": "dorsal", "parent": "spine", "pivot": [989, 372], "tip": [929, 340]},
      {"id": "foreBrace", "parent": "spine", "pivot": [1085, 663], "tip": [1159, 787]},
      {"id": "tailRoot", "parent": "hips", "pivot": [619, 503], "tip": [428, 603]},
      {"id": "tailPoint", "parent": "tailRoot", "pivot": [347, 642], "tip": [163, 677]}
    ],
    contacts: {
      "rearNear": {"bone": "hips", "point": [570, 884]},
      "rearFar": {"bone": "hips", "point": [922, 877]},
      "foreNear": {"bone": "hips", "point": [1194, 891]},
      "foreFar": {"bone": "hips", "point": [1371, 880]},
      "crownHinge": {"bone": "crownHinge", "point": [1257, 293]},
      "visor": {"bone": "visor", "point": [1429, 633]},
      "dorsal": {"bone": "dorsal", "point": [929, 340]},
      "foreBrace": {"bone": "foreBrace", "point": [1159, 787]},
      "tailPoint": {"bone": "tailPoint", "point": [163, 677]}
    },
    poses: {
      "intro": {"crownHinge": -3.55, "dorsal": 1.35},
      "round-win": {"crownHinge": -4.15, "visor": -1.35, "tailPoint": 1.45},
      "round-loss": {"crownHinge": 4.1, "visor": 1.7, "dorsal": -1.8},
      "recovery": {"crownHinge": 1.25, "foreBrace": 3.45, "tailPoint": -1.5, "dorsal": 1.1}
    }
  },
  {
    fighterId: "user-brute",
    profileId: "pose-v95-user-xeno-brute",
    sourceSha256: "c093b0f9bf4ab5b6fa79de9f5787d2552957d1959670c639054c1c01875fca13",
    anatomy: "copper-brute-with-low-pushing-head-and-narrow-dorsal-prongs",
    bones: [
      {"id": "hips", "parent": null, "pivot": [555, 746], "tip": [552, 819]},
      {"id": "spine", "parent": "hips", "pivot": [555, 708], "tip": [456, 494]},
      {"id": "head", "parent": "spine", "pivot": [316, 475], "tip": [156, 650]},
      {"id": "prongs", "parent": "head", "pivot": [370, 395], "tip": [415, 220]},
      {"id": "arm", "parent": "spine", "pivot": [580, 491], "tip": [647, 670]},
      {"id": "nearClaw", "parent": "arm", "pivot": [676, 765], "tip": [599, 998]},
      {"id": "farClaw", "parent": "spine", "pivot": [322, 740], "tip": [230, 1014]},
      {"id": "tailRoot", "parent": "hips", "pivot": [778, 893], "tip": [899, 915]},
      {"id": "tailBend", "parent": "tailRoot", "pivot": [1024, 772], "tip": [947, 584]},
      {"id": "tailHook", "parent": "tailBend", "pivot": [804, 424], "tip": [826, 268]}
    ],
    contacts: {
      "forwardFoot": {"bone": "hips", "point": [437, 1199]},
      "backFoot": {"bone": "hips", "point": [858, 1221]},
      "head": {"bone": "head", "point": [156, 650]},
      "prongs": {"bone": "prongs", "point": [415, 220]},
      "arm": {"bone": "arm", "point": [647, 670]},
      "nearClaw": {"bone": "nearClaw", "point": [599, 998]},
      "farClaw": {"bone": "farClaw", "point": [230, 1014]},
      "tailBend": {"bone": "tailBend", "point": [947, 584]},
      "tailHook": {"bone": "tailHook", "point": [826, 268]}
    },
    poses: {
      "intro": {"head": 3.2, "prongs": 1.5, "tailHook": 0.8},
      "round-win": {"head": 4.5, "nearClaw": -2.35, "tailBend": 1.35},
      "round-loss": {"head": -4.5, "prongs": -1.8, "tailHook": -2},
      "recovery": {"arm": 1.1, "nearClaw": 3.4, "farClaw": 2.15, "tailBend": -1.25}
    }
  },
  {
    fighterId: "afe2-spider",
    profileId: "pose-v113-afe2-spider",
    sourceSha256: "117374e254ba63b1904465597a1adc33626c20c79148c0fed16ea8fbceb6852f",
    anatomy: "four-legged-spider-frame-with-a-rigid-central-platform-and-independent-braces",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [740, 545], "tip": [740, 584]},
      {"id": "platform", "parent": "hips", "pivot": [735, 510], "tip": [659, 337]},
      {"id": "forwardShoulder", "parent": "platform", "pivot": [424, 526], "tip": [347, 368]},
      {"id": "forwardBrace", "parent": "forwardShoulder", "pivot": [347, 382], "tip": [207, 610]},
      {"id": "nearShoulder", "parent": "platform", "pivot": [840, 528], "tip": [947, 393]},
      {"id": "nearBrace", "parent": "nearShoulder", "pivot": [950, 403], "tip": [1071, 675]},
      {"id": "rearShoulder", "parent": "platform", "pivot": [1154, 533], "tip": [1287, 375]},
      {"id": "rearBrace", "parent": "rearShoulder", "pivot": [1287, 393], "tip": [1401, 640]}
    ],
    contacts: {
      "forwardPad": {"bone": "hips", "point": [107, 761]},
      "centralPad": {"bone": "hips", "point": [654, 703]},
      "nearPad": {"bone": "hips", "point": [1152, 845]},
      "rearPad": {"bone": "hips", "point": [1417, 735]},
      "platform": {"bone": "platform", "point": [659, 337]},
      "forwardShoulder": {"bone": "forwardShoulder", "point": [347, 368]},
      "forwardBrace": {"bone": "forwardBrace", "point": [207, 610]},
      "nearShoulder": {"bone": "nearShoulder", "point": [947, 393]},
      "rearShoulder": {"bone": "rearShoulder", "point": [1287, 375]},
      "rearBrace": {"bone": "rearBrace", "point": [1401, 640]}
    },
    poses: {
      "intro": {"platform": -1.35, "forwardShoulder": 1.35, "rearShoulder": 0.7},
      "round-win": {"platform": -2.1, "nearShoulder": 1.75, "rearBrace": -1.25},
      "round-loss": {"platform": 2.2, "forwardBrace": 1.55, "rearShoulder": -1.3},
      "recovery": {"platform": 1.35, "nearShoulder": -1.45, "forwardShoulder": 1.75, "rearBrace": 0.9}
    }
  }
];
