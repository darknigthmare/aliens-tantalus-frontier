// Source-pixel pivots and support contacts measured on the admitted RGBA plates.
// Angles are original guard and recoil gestures, with continuous guard-break recovery.
export const XENO_TRIALS_DEFENSE_DATA_V204 = [
  {
    fighterId: "armored-joe",
    profileId: "enemy-145-armored-working-joe",
    sourceSha256: "e361bb35804e23c66a2b981375d3eff3b99361f684ba394ce93f6bf9c7d28210",
    anatomy: "armored-joe-with-ribbed-vest-and-paired-balancing-gloves",
    bones: [
      {"id": "hips", "parent": null, "pivot": [527, 778], "tip": [527, 834]},
      {"id": "spine", "parent": "hips", "pivot": [527, 705], "tip": [485, 398]},
      {"id": "head", "parent": "spine", "pivot": [545, 300], "tip": [583, 213]},
      {"id": "shoulder", "parent": "spine", "pivot": [433, 408], "tip": [377, 583]},
      {"id": "nearGlove", "parent": "shoulder", "pivot": [387, 649], "tip": [405, 789]},
      {"id": "farGlove", "parent": "spine", "pivot": [639, 618], "tip": [667, 789]}
    ],
    contacts: {
      "nearBoot": {"bone": "hips", "point": [419, 1309]},
      "farBoot": {"bone": "hips", "point": [604, 1288]},
      "spine": {"bone": "spine", "point": [485, 398]},
      "head": {"bone": "head", "point": [583, 213]},
      "shoulder": {"bone": "shoulder", "point": [377, 583]},
      "nearGlove": {"bone": "nearGlove", "point": [405, 789]},
      "farGlove": {"bone": "farGlove", "point": [667, 789]}
    },
    poses: {
      "guard": {"spine": 1.6, "head": 4.3, "shoulder": -1.45, "nearGlove": -4.35},
      "hurt": {"spine": -2.05, "head": -4.95, "nearGlove": 2.3},
      "guard-break": {"spine": -3.4, "head": -5.8, "shoulder": 2.7, "nearGlove": 3.5, "farGlove": 2.1},
      "recover": {"spine": -3.4, "head": -5.8, "shoulder": 2.7, "nearGlove": 3.5, "farGlove": 2.1}
    }
  },
  {
    fighterId: "albino-runner",
    profileId: "enemy-058-albino-runner",
    sourceSha256: "4f4acbfc53b41843c4a394ada331a391e6142402c28ce8bec18bd08741ea8bfa",
    anatomy: "ivory-runner-with-a-flat-dome-and-curved-tail-over-a-four-foot-stance",
    bones: [
      {"id": "hips", "parent": null, "pivot": [684, 519], "tip": [691, 573]},
      {"id": "spine", "parent": "hips", "pivot": [717, 482], "tip": [963, 438]},
      {"id": "dome", "parent": "spine", "pivot": [1133, 447], "tip": [1280, 484]},
      {"id": "jaw", "parent": "dome", "pivot": [1224, 489], "tip": [1275, 535]},
      {"id": "nearArm", "parent": "spine", "pivot": [989, 456], "tip": [905, 591]},
      {"id": "nearWrist", "parent": "nearArm", "pivot": [919, 635], "tip": [1047, 756]},
      {"id": "tailRoot", "parent": "hips", "pivot": [631, 489], "tip": [510, 514]},
      {"id": "tailArc", "parent": "tailRoot", "pivot": [270, 552], "tip": [163, 435]},
      {"id": "tailPoint", "parent": "tailArc", "pivot": [242, 282], "tip": [377, 226]}
    ],
    contacts: {
      "rearNear": {"bone": "hips", "point": [500, 791]},
      "rearFar": {"bone": "hips", "point": [833, 780]},
      "frontNear": {"bone": "hips", "point": [1124, 801]},
      "frontFar": {"bone": "hips", "point": [1266, 787]},
      "spine": {"bone": "spine", "point": [963, 438]},
      "dome": {"bone": "dome", "point": [1280, 484]},
      "jaw": {"bone": "jaw", "point": [1275, 535]},
      "nearArm": {"bone": "nearArm", "point": [905, 591]},
      "nearWrist": {"bone": "nearWrist", "point": [1047, 756]},
      "tailArc": {"bone": "tailArc", "point": [163, 435]},
      "tailPoint": {"bone": "tailPoint", "point": [377, 226]}
    },
    poses: {
      "guard": {"spine": 1.1, "dome": 3.3, "jaw": 1.45, "nearWrist": -2.6, "tailPoint": -0.95},
      "hurt": {"dome": -4.6, "jaw": -1.35, "nearArm": 2.05, "tailArc": 1.1},
      "guard-break": {"spine": -2.55, "dome": -4.65, "nearWrist": 3.4, "tailArc": -1.6},
      "recover": {"spine": -2.55, "dome": -4.65, "nearWrist": 3.4, "tailArc": -1.6}
    }
  },
  {
    fighterId: "albino-crusher",
    profileId: "enemy-061-albino-crusher",
    sourceSha256: "f34fdc28ebd3f4c4d2674210c71b758c32edd35ae49c68549805238f92e5bcd6",
    anatomy: "ivory-crusher-with-crown-carapace-and-low-hooked-tail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [761, 573], "tip": [770, 626]},
      {"id": "spine", "parent": "hips", "pivot": [761, 503], "tip": [1001, 470]},
      {"id": "head", "parent": "spine", "pivot": [1229, 440], "tip": [1429, 533]},
      {"id": "crown", "parent": "head", "pivot": [1243, 356], "tip": [1087, 251]},
      {"id": "nearShoulder", "parent": "spine", "pivot": [1026, 491], "tip": [1001, 589]},
      {"id": "foreBrace", "parent": "nearShoulder", "pivot": [1029, 638], "tip": [1122, 763]},
      {"id": "tailRoot", "parent": "hips", "pivot": [694, 505], "tip": [498, 591]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [277, 714], "tip": [147, 721]},
      {"id": "tailHook", "parent": "tailSweep", "pivot": [121, 694], "tip": [165, 612]}
    ],
    contacts: {
      "rearNear": {"bone": "hips", "point": [638, 775]},
      "rearFar": {"bone": "hips", "point": [852, 775]},
      "frontNear": {"bone": "hips", "point": [1136, 796]},
      "frontFar": {"bone": "hips", "point": [1301, 787]},
      "spine": {"bone": "spine", "point": [1001, 470]},
      "head": {"bone": "head", "point": [1429, 533]},
      "crown": {"bone": "crown", "point": [1087, 251]},
      "nearShoulder": {"bone": "nearShoulder", "point": [1001, 589]},
      "foreBrace": {"bone": "foreBrace", "point": [1122, 763]},
      "tailHook": {"bone": "tailHook", "point": [165, 612]}
    },
    poses: {
      "guard": {"spine": 1.2, "head": 3.8, "crown": 0.85, "foreBrace": -3.1},
      "hurt": {"head": -4.85, "crown": 1.6, "foreBrace": 2.2, "tailHook": 0.95},
      "guard-break": {"spine": -2.6, "head": -4.6, "crown": 1.2, "nearShoulder": 2.1, "foreBrace": 3.55},
      "recover": {"spine": -2.6, "head": -4.6, "crown": 1.2, "nearShoulder": 2.1, "foreBrace": 3.55}
    }
  },
  {
    fighterId: "cryo-lurker",
    profileId: "enemy-219-cryo-adapted-lurker",
    sourceSha256: "4a3714d06bb14cd3f37955a13c77d65804b415a26f1b29d11475217f6db2d4a4",
    anatomy: "cryo-lurker-with-sweeping-spines-and-long-bracing-forelimbs",
    bones: [
      {"id": "hips", "parent": null, "pivot": [682, 612], "tip": [712, 652]},
      {"id": "spine", "parent": "hips", "pivot": [712, 545], "tip": [954, 500]},
      {"id": "head", "parent": "spine", "pivot": [1119, 512], "tip": [1299, 582]},
      {"id": "spines", "parent": "spine", "pivot": [975, 461], "tip": [936, 237]},
      {"id": "upperArm", "parent": "spine", "pivot": [966, 552], "tip": [866, 673]},
      {"id": "nearBrace", "parent": "upperArm", "pivot": [912, 705], "tip": [1071, 789]},
      {"id": "farBrace", "parent": "spine", "pivot": [1085, 659], "tip": [1303, 770]},
      {"id": "tailRoot", "parent": "hips", "pivot": [640, 489], "tip": [461, 519]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [207, 540], "tip": [114, 621]},
      {"id": "tailTip", "parent": "tailSweep", "pivot": [119, 712], "tip": [221, 768]}
    ],
    contacts: {
      "hindNear": {"bone": "hips", "point": [479, 796]},
      "hindFar": {"bone": "hips", "point": [714, 756]},
      "frontNear": {"bone": "hips", "point": [1096, 801]},
      "frontFar": {"bone": "hips", "point": [1406, 796]},
      "spine": {"bone": "spine", "point": [954, 500]},
      "head": {"bone": "head", "point": [1299, 582]},
      "spines": {"bone": "spines", "point": [936, 237]},
      "upperArm": {"bone": "upperArm", "point": [866, 673]},
      "nearBrace": {"bone": "nearBrace", "point": [1071, 789]},
      "farBrace": {"bone": "farBrace", "point": [1303, 770]},
      "tailSweep": {"bone": "tailSweep", "point": [114, 621]},
      "tailTip": {"bone": "tailTip", "point": [221, 768]}
    },
    poses: {
      "guard": {"spine": 1.15, "head": 3.55, "nearBrace": -3.35, "spines": 0.6, "tailTip": -0.95},
      "hurt": {"head": -4.85, "spines": -1.6, "upperArm": 2.25, "tailSweep": 1.15},
      "guard-break": {"spine": -2.45, "head": -4.75, "nearBrace": 3.5, "farBrace": 2.65, "tailSweep": -1.3},
      "recover": {"spine": -2.45, "head": -4.75, "nearBrace": 3.5, "farBrace": 2.65, "tailSweep": -1.3}
    }
  },
  {
    fighterId: "acid-boiler",
    profileId: "enemy-170-acid-blooded-boiler",
    sourceSha256: "69a8b01cbef7625e2a7bf0e1243b9fb7c3c987cac97acb1ce5988237bc2f1cdc",
    anatomy: "acid-coated-boiler-with-lobed-crown-and-soft-hinged-neck",
    bones: [
      {"id": "hips", "parent": null, "pivot": [724, 670], "tip": [744, 730]},
      {"id": "spine", "parent": "hips", "pivot": [710, 610], "tip": [770, 328]},
      {"id": "head", "parent": "spine", "pivot": [975, 319], "tip": [1154, 314]},
      {"id": "crownSacs", "parent": "head", "pivot": [1032, 217], "tip": [966, 171]},
      {"id": "dorsalTubes", "parent": "spine", "pivot": [735, 302], "tip": [730, 174]},
      {"id": "nearArm", "parent": "spine", "pivot": [681, 353], "tip": [621, 536]},
      {"id": "nearClaw", "parent": "nearArm", "pivot": [661, 584], "tip": [744, 712]},
      {"id": "farClaw", "parent": "spine", "pivot": [955, 579], "tip": [1100, 744]},
      {"id": "tailRoot", "parent": "hips", "pivot": [607, 678], "tip": [507, 861]},
      {"id": "tailHook", "parent": "tailRoot", "pivot": [319, 998], "tip": [148, 858]}
    ],
    contacts: {
      "nearClawPad": {"bone": "hips", "point": [607, 1114]},
      "farClawPad": {"bone": "hips", "point": [983, 1114]},
      "spine": {"bone": "spine", "point": [770, 328]},
      "head": {"bone": "head", "point": [1154, 314]},
      "crownSacs": {"bone": "crownSacs", "point": [966, 171]},
      "dorsalTubes": {"bone": "dorsalTubes", "point": [730, 174]},
      "nearArm": {"bone": "nearArm", "point": [621, 536]},
      "nearClaw": {"bone": "nearClaw", "point": [744, 712]},
      "farClaw": {"bone": "farClaw", "point": [1100, 744]},
      "tailHook": {"bone": "tailHook", "point": [148, 858]}
    },
    poses: {
      "guard": {"spine": 1.7, "head": 4.1, "crownSacs": 1.1, "nearClaw": -3.6, "farClaw": -2.4},
      "hurt": {"head": -5.1, "dorsalTubes": -0.8, "nearArm": 1.75, "tailHook": 1.25},
      "guard-break": {"spine": -2.35, "head": -4.95, "nearClaw": 3.25, "farClaw": 3.0, "tailHook": -1.1},
      "recover": {"spine": -2.35, "head": -4.95, "nearClaw": 3.25, "farClaw": 3.0, "tailHook": -1.1}
    }
  },
  {
    fighterId: "acid-queen",
    profileId: "enemy-164-acid-blooded-queen",
    sourceSha256: "58149a549c93dcb5e08810acacc6db11812a0449629c8319fbedbe81b5e339b5",
    anatomy: "acid-queen-with-a-fan-shaped-carapace-and-extended-arm-pairs",
    bones: [
      {"id": "hips", "parent": null, "pivot": [919, 593], "tip": [959, 654]},
      {"id": "spine", "parent": "hips", "pivot": [924, 524], "tip": [1057, 391]},
      {"id": "head", "parent": "spine", "pivot": [1247, 330], "tip": [1401, 368]},
      {"id": "crown", "parent": "head", "pivot": [1194, 179], "tip": [931, 81]},
      {"id": "dorsalSpurs", "parent": "spine", "pivot": [1033, 328], "tip": [945, 251]},
      {"id": "nearArm", "parent": "spine", "pivot": [1031, 424], "tip": [919, 510]},
      {"id": "nearClaws", "parent": "nearArm", "pivot": [966, 563], "tip": [1175, 647]},
      {"id": "farClaws", "parent": "spine", "pivot": [1185, 463], "tip": [1266, 526]},
      {"id": "tailRoot", "parent": "hips", "pivot": [842, 535], "tip": [707, 682]},
      {"id": "tailBend", "parent": "tailRoot", "pivot": [538, 796], "tip": [340, 735]},
      {"id": "tailTip", "parent": "tailBend", "pivot": [284, 721], "tip": [142, 780]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [759, 945]},
      "frontFoot": {"bone": "hips", "point": [1173, 931]},
      "spine": {"bone": "spine", "point": [1057, 391]},
      "head": {"bone": "head", "point": [1401, 368]},
      "crown": {"bone": "crown", "point": [931, 81]},
      "dorsalSpurs": {"bone": "dorsalSpurs", "point": [945, 251]},
      "nearArm": {"bone": "nearArm", "point": [919, 510]},
      "nearClaws": {"bone": "nearClaws", "point": [1175, 647]},
      "farClaws": {"bone": "farClaws", "point": [1266, 526]},
      "tailBend": {"bone": "tailBend", "point": [340, 735]},
      "tailTip": {"bone": "tailTip", "point": [142, 780]}
    },
    poses: {
      "guard": {"spine": 1.3, "head": 3.15, "crown": 0.75, "nearClaws": -3.6, "farClaws": -2.1},
      "hurt": {"head": -4.4, "crown": 0.95, "dorsalSpurs": -1.4, "nearArm": 2.0, "tailTip": 1.15},
      "guard-break": {"spine": -1.65, "head": -3.65, "nearClaws": 3.4, "farClaws": 2.35, "tailBend": -1.05},
      "recover": {"spine": -1.65, "head": -3.65, "nearClaws": 3.4, "farClaws": 2.35, "tailBend": -1.05}
    }
  },
  {
    fighterId: "cryo-burster",
    profileId: "enemy-224-cryo-adapted-burster",
    sourceSha256: "ede720f5aa9f1c5b800d825e5bd65092fb5b16f4810fb814a30d5c348476dd32",
    anatomy: "cryo-burster-with-ice-spines-over-venom-lobes-and-high-tail-arc",
    bones: [
      {"id": "hips", "parent": null, "pivot": [577, 605], "tip": [554, 647]},
      {"id": "spine", "parent": "hips", "pivot": [603, 554], "tip": [1015, 556]},
      {"id": "head", "parent": "spine", "pivot": [1154, 496], "tip": [1403, 584]},
      {"id": "crownSacs", "parent": "head", "pivot": [1271, 435], "tip": [1140, 344]},
      {"id": "dorsal", "parent": "spine", "pivot": [903, 451], "tip": [726, 396]},
      {"id": "nearArm", "parent": "spine", "pivot": [994, 586], "tip": [875, 710]},
      {"id": "nearWrist", "parent": "nearArm", "pivot": [915, 770], "tip": [1033, 882]},
      {"id": "tailRoot", "parent": "hips", "pivot": [500, 489], "tip": [319, 472]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [147, 426], "tip": [128, 286]},
      {"id": "tailTip", "parent": "tailSweep", "pivot": [312, 130], "tip": [584, 137]}
    ],
    contacts: {
      "hindNear": {"bone": "hips", "point": [344, 868]},
      "hindFar": {"bone": "hips", "point": [728, 861]},
      "foreNear": {"bone": "hips", "point": [1043, 896]},
      "foreFar": {"bone": "hips", "point": [1231, 856]},
      "spine": {"bone": "spine", "point": [1015, 556]},
      "head": {"bone": "head", "point": [1403, 584]},
      "crownSacs": {"bone": "crownSacs", "point": [1140, 344]},
      "dorsal": {"bone": "dorsal", "point": [726, 396]},
      "nearArm": {"bone": "nearArm", "point": [875, 710]},
      "nearWrist": {"bone": "nearWrist", "point": [1033, 882]},
      "tailSweep": {"bone": "tailSweep", "point": [128, 286]},
      "tailTip": {"bone": "tailTip", "point": [584, 137]}
    },
    poses: {
      "guard": {"spine": 0.85, "head": 3.1, "crownSacs": 1.15, "nearWrist": -2.65},
      "hurt": {"head": -4.6, "dorsal": -1.45, "nearArm": 1.45, "tailTip": 1.1},
      "guard-break": {"spine": -2.2, "head": -4.35, "crownSacs": 1.6, "nearWrist": 3.3, "tailSweep": -1.15},
      "recover": {"spine": -2.2, "head": -4.35, "crownSacs": 1.6, "nearWrist": 3.3, "tailSweep": -1.15}
    }
  },
  {
    fighterId: "import-joe-classic",
    profileId: "pose-v103-import-synth-workingjoe-classic",
    sourceSha256: "c22e85f1bce901d74cd62f5616413ba0d1d365a354e3b5d601eb8d1c9a37f422",
    anatomy: "working-joe-in-profile-with-vertical-elbow-and-flexible-jacket",
    bones: [
      {"id": "hips", "parent": null, "pivot": [853, 576], "tip": [856, 654]},
      {"id": "spine", "parent": "hips", "pivot": [861, 526], "tip": [856, 264]},
      {"id": "head", "parent": "spine", "pivot": [838, 164], "tip": [793, 88]},
      {"id": "shoulder", "parent": "spine", "pivot": [873, 269], "tip": [901, 365]},
      {"id": "forearm", "parent": "shoulder", "pivot": [886, 400], "tip": [871, 518]},
      {"id": "hood", "parent": "spine", "pivot": [871, 184], "tip": [843, 232]}
    ],
    contacts: {
      "frontBoot": {"bone": "hips", "point": [818, 883]},
      "backBoot": {"bone": "hips", "point": [906, 893]},
      "spine": {"bone": "spine", "point": [856, 264]},
      "head": {"bone": "head", "point": [793, 88]},
      "shoulder": {"bone": "shoulder", "point": [901, 365]},
      "forearm": {"bone": "forearm", "point": [871, 518]},
      "hood": {"bone": "hood", "point": [843, 232]}
    },
    poses: {
      "guard": {"spine": -1.55, "head": -4.3, "shoulder": 1.35, "forearm": 4.45},
      "hurt": {"spine": 2.15, "head": 5.15, "forearm": -2.4},
      "guard-break": {"spine": 3.25, "head": 5.4, "shoulder": -2.55, "forearm": -3.6, "hood": 1.7},
      "recover": {"spine": 3.25, "head": 5.4, "shoulder": -2.55, "forearm": -3.6, "hood": 1.7}
    }
  },
  {
    fighterId: "import-joe-tactical",
    profileId: "pose-v103-import-synth-workingjoe-tactical",
    sourceSha256: "50d2e6fecdaf64c7bdf8632431dfb0e85ccfed12b1452f5cca42fe805b85fc0c",
    anatomy: "tactical-joe-with-twin-optics-crossed-gauntlets-and-squared-pack",
    bones: [
      {"id": "hips", "parent": null, "pivot": [520, 698], "tip": [548, 781]},
      {"id": "spine", "parent": "hips", "pivot": [516, 645], "tip": [548, 349]},
      {"id": "head", "parent": "spine", "pivot": [499, 269], "tip": [440, 164]},
      {"id": "optics", "parent": "head", "pivot": [433, 143], "tip": [387, 136]},
      {"id": "upperArm", "parent": "spine", "pivot": [638, 352], "tip": [652, 530]},
      {"id": "forearm", "parent": "upperArm", "pivot": [635, 551], "tip": [391, 544]},
      {"id": "nearGlove", "parent": "forearm", "pivot": [366, 576], "tip": [321, 631]},
      {"id": "pack", "parent": "spine", "pivot": [712, 297], "tip": [726, 499]}
    ],
    contacts: {
      "frontBoot": {"bone": "hips", "point": [433, 1427]},
      "backBoot": {"bone": "hips", "point": [562, 1458]},
      "spine": {"bone": "spine", "point": [548, 349]},
      "head": {"bone": "head", "point": [440, 164]},
      "optics": {"bone": "optics", "point": [387, 136]},
      "upperArm": {"bone": "upperArm", "point": [652, 530]},
      "forearm": {"bone": "forearm", "point": [391, 544]},
      "nearGlove": {"bone": "nearGlove", "point": [321, 631]},
      "pack": {"bone": "pack", "point": [726, 499]}
    },
    poses: {
      "guard": {"spine": -1.25, "head": -4.0, "upperArm": 1.35, "nearGlove": 4.15},
      "hurt": {"spine": 2.05, "head": 5.0, "optics": 1.35, "forearm": -2.45},
      "guard-break": {"spine": 3.15, "head": 5.1, "upperArm": -2.5, "forearm": -3.5, "pack": 1.5},
      "recover": {"spine": 3.15, "head": 5.1, "upperArm": -2.5, "forearm": -3.5, "pack": 1.5}
    }
  },
  {
    fighterId: "import-engineer-armorsuit",
    profileId: "pose-v105-import-engineer-armorsuit",
    sourceSha256: "8ec6c6e19885f2ff4f1a368d1944f01dce11423e62f59271fb03da9a528faddc",
    anatomy: "engineer-armour-with-ribbed-torso-and-long-plated-gauntlets",
    bones: [
      {"id": "hips", "parent": null, "pivot": [399, 826], "tip": [399, 909]},
      {"id": "spine", "parent": "hips", "pivot": [403, 779], "tip": [391, 407]},
      {"id": "mask", "parent": "spine", "pivot": [419, 320], "tip": [435, 162]},
      {"id": "headCanal", "parent": "mask", "pivot": [368, 253], "tip": [328, 182]},
      {"id": "nearShoulder", "parent": "spine", "pivot": [245, 379], "tip": [158, 628]},
      {"id": "nearHand", "parent": "nearShoulder", "pivot": [194, 751], "tip": [225, 873]},
      {"id": "farHand", "parent": "spine", "pivot": [589, 704], "tip": [652, 870]}
    ],
    contacts: {
      "nearBoot": {"bone": "hips", "point": [233, 1605]},
      "farBoot": {"bone": "hips", "point": [518, 1585]},
      "spine": {"bone": "spine", "point": [391, 407]},
      "mask": {"bone": "mask", "point": [435, 162]},
      "headCanal": {"bone": "headCanal", "point": [328, 182]},
      "nearShoulder": {"bone": "nearShoulder", "point": [158, 628]},
      "nearHand": {"bone": "nearHand", "point": [225, 873]},
      "farHand": {"bone": "farHand", "point": [652, 870]}
    },
    poses: {
      "guard": {"spine": 1.6, "mask": 4.45, "nearShoulder": -1.65, "nearHand": -3.8},
      "hurt": {"spine": -2.1, "mask": -5.0, "nearHand": 2.4, "headCanal": -1.05},
      "guard-break": {"spine": -3, "mask": -5.55, "nearShoulder": 2.35, "nearHand": 3.55, "farHand": 2.7},
      "recover": {"spine": -3, "mask": -5.55, "nearShoulder": 2.35, "nearHand": 3.55, "farHand": 2.7}
    }
  },
  {
    fighterId: "import-engineer-behemotsuit",
    profileId: "pose-v106-import-engineer-behemotsuit",
    sourceSha256: "43a10e3f3e0fc80f4a18af5efcec45aa2fda0b8012beb136590765855be9ff24",
    anatomy: "behemot-engineer-with-braced-ribcage-and-rigid-blade-forearm",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [610, 586], "tip": [601, 638]},
      {"id": "spine", "parent": "hips", "pivot": [608, 528], "tip": [608, 224]},
      {"id": "head", "parent": "spine", "pivot": [610, 179], "tip": [602, 75]},
      {"id": "mask", "parent": "head", "pivot": [613, 93], "tip": [613, 152]},
      {"id": "nearShoulder", "parent": "spine", "pivot": [437, 200], "tip": [373, 373]},
      {"id": "gauntlet", "parent": "nearShoulder", "pivot": [331, 437], "tip": [325, 571]},
      {"id": "bladeCage", "parent": "hips", "pivot": [861, 456], "tip": [989, 640]}
    ],
    contacts: {
      "farBoot": {"bone": "hips", "point": [384, 1106]},
      "nearBoot": {"bone": "hips", "point": [797, 1069]},
      "spine": {"bone": "spine", "point": [608, 224]},
      "head": {"bone": "head", "point": [602, 75]},
      "mask": {"bone": "mask", "point": [613, 152]},
      "nearShoulder": {"bone": "nearShoulder", "point": [373, 373]},
      "gauntlet": {"bone": "gauntlet", "point": [325, 571]}
    },
    poses: {
      "guard": {"spine": 1.23, "head": 4.4, "nearShoulder": -1.5, "gauntlet": -3.95},
      "hurt": {"spine": -1.9, "head": -4.95, "nearShoulder": 2.0, "mask": 0.95},
      "guard-break": {"spine": -2.7, "head": -5.2, "nearShoulder": 2.5, "gauntlet": 3.35},
      "recover": {"spine": -2.7, "head": -5.2, "nearShoulder": 2.5, "gauntlet": 3.35}
    }
  },
  {
    fighterId: "import-engineer-spacejokey",
    profileId: "pose-v106-import-engineer-spacejokey",
    sourceSha256: "891cf221a535c4c30b019060bc96600397c5074d0eb86d6c48f6ad398cf7c6a1",
    anatomy: "tall-space-jockey-biosuit-with-ribbed-hose-and-stacked-arm-plates",
    bones: [
      {"id": "hips", "parent": null, "pivot": [417, 1097], "tip": [403, 1165]},
      {"id": "spine", "parent": "hips", "pivot": [408, 985], "tip": [403, 514]},
      {"id": "helmet", "parent": "spine", "pivot": [311, 388], "tip": [252, 160]},
      {"id": "respirator", "parent": "helmet", "pivot": [223, 281], "tip": [233, 374]},
      {"id": "shoulder", "parent": "spine", "pivot": [476, 427], "tip": [490, 708]},
      {"id": "forearm", "parent": "shoulder", "pivot": [427, 815], "tip": [315, 1043]},
      {"id": "glove", "parent": "forearm", "pivot": [272, 1106], "tip": [180, 1203]}
    ],
    contacts: {
      "frontBoot": {"bone": "hips", "point": [320, 2014]},
      "backBoot": {"bone": "hips", "point": [505, 2023]},
      "spine": {"bone": "spine", "point": [403, 514]},
      "helmet": {"bone": "helmet", "point": [252, 160]},
      "respirator": {"bone": "respirator", "point": [233, 374]},
      "shoulder": {"bone": "shoulder", "point": [490, 708]},
      "forearm": {"bone": "forearm", "point": [315, 1043]},
      "glove": {"bone": "glove", "point": [180, 1203]}
    },
    poses: {
      "guard": {"spine": -1.35, "helmet": -4.0, "shoulder": 1.25, "forearm": 2.55},
      "hurt": {"spine": 1.75, "helmet": 4.35, "respirator": -1.15, "glove": -2.25},
      "guard-break": {"spine": 2.55, "helmet": 4.85, "shoulder": -2.1, "forearm": -3.2, "glove": -1.8},
      "recover": {"spine": 2.55, "helmet": 4.85, "shoulder": -2.1, "forearm": -3.2, "glove": -1.8}
    }
  },
  {
    fighterId: "import-engineer-woman",
    profileId: "pose-v106-import-engineer-woman",
    sourceSha256: "1516ee07daa2d7378732e5935a6451f6debbde552311943522296d6a9af77da1",
    anatomy: "engineer-with-a-frontal-sculpted-biosuit-and-articulated-palms",
    bones: [
      {"id": "hips", "parent": null, "pivot": [536, 600], "tip": [536, 674]},
      {"id": "spine", "parent": "hips", "pivot": [539, 546], "tip": [530, 302]},
      {"id": "head", "parent": "spine", "pivot": [517, 215], "tip": [517, 125]},
      {"id": "nearShoulder", "parent": "spine", "pivot": [414, 282], "tip": [366, 475]},
      {"id": "nearHand", "parent": "nearShoulder", "pivot": [363, 549], "tip": [388, 719]},
      {"id": "farHand", "parent": "spine", "pivot": [632, 472], "tip": [684, 700]}
    ],
    contacts: {
      "nearBoot": {"bone": "hips", "point": [398, 1271]},
      "farBoot": {"bone": "hips", "point": [677, 1255]},
      "spine": {"bone": "spine", "point": [530, 302]},
      "head": {"bone": "head", "point": [517, 125]},
      "nearShoulder": {"bone": "nearShoulder", "point": [366, 475]},
      "nearHand": {"bone": "nearHand", "point": [388, 719]},
      "farHand": {"bone": "farHand", "point": [684, 700]}
    },
    poses: {
      "guard": {"spine": 1.4, "head": 3.8, "nearShoulder": -1.95, "nearHand": -4.35},
      "hurt": {"spine": -2.0, "head": -4.6, "farHand": 2.55},
      "guard-break": {"spine": -2.6, "head": -5.0, "nearHand": 3.9, "farHand": 2.55},
      "recover": {"spine": -2.6, "head": -5.0, "nearHand": 3.9, "farHand": 2.55}
    }
  },
  {
    fighterId: "import-synth-jerri-1",
    profileId: "pose-v106-import-synth-jerri-1",
    sourceSha256: "d519f175452f9d785c9feba77014405b54699d162147c283c2d83c5253b6145a",
    anatomy: "jerri-with-a-rigid-carbine-cradle-and-flexing-neck-and-tail",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [681, 613], "tip": [684, 684]},
      {"id": "spine", "parent": "hips", "pivot": [670, 544], "tip": [675, 296]},
      {"id": "head", "parent": "spine", "pivot": [675, 242], "tip": [550, 174]},
      {"id": "dome", "parent": "head", "pivot": [693, 145], "tip": [812, 97]},
      {"id": "shoulder", "parent": "spine", "pivot": [761, 296], "tip": [792, 405]},
      {"id": "carbine", "parent": "spine", "pivot": [621, 459], "tip": [242, 482]},
      {"id": "tailRoot", "parent": "hips", "pivot": [835, 579], "tip": [958, 693]},
      {"id": "tailLoop", "parent": "tailRoot", "pivot": [1040, 855], "tip": [949, 1003]},
      {"id": "tailTip", "parent": "tailLoop", "pivot": [579, 789], "tip": [342, 789]}
    ],
    contacts: {
      "frontFoot": {"bone": "hips", "point": [567, 1123]},
      "backFoot": {"bone": "hips", "point": [849, 1183]},
      "spine": {"bone": "spine", "point": [675, 296]},
      "head": {"bone": "head", "point": [550, 174]},
      "dome": {"bone": "dome", "point": [812, 97]},
      "shoulder": {"bone": "shoulder", "point": [792, 405]},
      "tailLoop": {"bone": "tailLoop", "point": [949, 1003]},
      "tailTip": {"bone": "tailTip", "point": [342, 789]}
    },
    poses: {
      "guard": {"spine": -1.35, "head": -4.25, "dome": -0.75, "tailLoop": 1.05},
      "hurt": {"spine": 1.95, "head": 5.1, "dome": 0.85, "tailTip": -1.1},
      "guard-break": {"spine": 2.9, "head": 5.15, "shoulder": -1.7, "tailLoop": -1.35},
      "recover": {"spine": 2.9, "head": 5.15, "shoulder": -1.7, "tailLoop": -1.35}
    }
  },
  {
    fighterId: "import-wy-covenant-david",
    profileId: "pose-v106-import-wy-covenant-david",
    sourceSha256: "f0b7e966868af9f5020ad84f9413ec20de0932bbd1b304ae507e7acf9ca6bf73",
    anatomy: "hooded-david-in-profile-with-padded-shoulder-and-free-gauntlet",
    bones: [
      {"id": "hips", "parent": null, "pivot": [594, 659], "tip": [600, 722]},
      {"id": "spine", "parent": "hips", "pivot": [606, 594], "tip": [615, 346]},
      {"id": "head", "parent": "spine", "pivot": [561, 230], "tip": [531, 146]},
      {"id": "hood", "parent": "head", "pivot": [594, 173], "tip": [618, 81]},
      {"id": "shoulder", "parent": "spine", "pivot": [645, 325], "tip": [656, 522]},
      {"id": "forearm", "parent": "shoulder", "pivot": [633, 552], "tip": [609, 671]},
      {"id": "glove", "parent": "forearm", "pivot": [594, 683], "tip": [573, 740]}
    ],
    contacts: {
      "frontBoot": {"bone": "hips", "point": [540, 1179]},
      "backBoot": {"bone": "hips", "point": [603, 1220]},
      "spine": {"bone": "spine", "point": [615, 346]},
      "head": {"bone": "head", "point": [531, 146]},
      "hood": {"bone": "hood", "point": [618, 81]},
      "shoulder": {"bone": "shoulder", "point": [656, 522]},
      "forearm": {"bone": "forearm", "point": [609, 671]},
      "glove": {"bone": "glove", "point": [573, 740]}
    },
    poses: {
      "guard": {"spine": -1.35, "head": -4.35, "shoulder": 1.35, "forearm": 3.7},
      "hurt": {"spine": 1.95, "head": 4.65, "hood": 0.85, "glove": -2.4},
      "guard-break": {"spine": 3.0, "head": 5.1, "shoulder": -2.2, "forearm": -3.65, "glove": -1.25},
      "recover": {"spine": 3.0, "head": 5.1, "shoulder": -2.2, "forearm": -3.65, "glove": -1.25}
    }
  },
  {
    fighterId: "import-xeno-kingrogue",
    profileId: "pose-v106-import-xeno-kingrogue",
    sourceSha256: "7d8d9bbe52b72be700b975999effb39b7045f03a59d8b3858214cae0eb9dafa1",
    anatomy: "rogue-king-with-splayed-spinal-spikes-and-a-long-spined-countertail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [908, 563], "tip": [891, 613]},
      {"id": "spine", "parent": "hips", "pivot": [922, 510], "tip": [1030, 443]},
      {"id": "head", "parent": "spine", "pivot": [1224, 355], "tip": [1327, 443]},
      {"id": "crown", "parent": "head", "pivot": [1198, 252], "tip": [1131, 182]},
      {"id": "dorsal", "parent": "spine", "pivot": [1018, 307], "tip": [893, 165]},
      {"id": "nearArm", "parent": "spine", "pivot": [1023, 458], "tip": [1001, 546]},
      {"id": "nearClaw", "parent": "nearArm", "pivot": [1071, 596], "tip": [1150, 692]},
      {"id": "farClaw", "parent": "spine", "pivot": [1200, 563], "tip": [1250, 673]},
      {"id": "tailRoot", "parent": "hips", "pivot": [853, 453], "tip": [673, 479]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [474, 395], "tip": [184, 259]},
      {"id": "tailBlade", "parent": "tailSweep", "pivot": [266, 378], "tip": [355, 458]}
    ],
    contacts: {
      "rearTalons": {"bone": "hips", "point": [529, 987]},
      "frontTalons": {"bone": "hips", "point": [1145, 949]},
      "spine": {"bone": "spine", "point": [1030, 443]},
      "head": {"bone": "head", "point": [1327, 443]},
      "crown": {"bone": "crown", "point": [1131, 182]},
      "dorsal": {"bone": "dorsal", "point": [893, 165]},
      "nearArm": {"bone": "nearArm", "point": [1001, 546]},
      "nearClaw": {"bone": "nearClaw", "point": [1150, 692]},
      "farClaw": {"bone": "farClaw", "point": [1250, 673]},
      "tailSweep": {"bone": "tailSweep", "point": [184, 259]},
      "tailBlade": {"bone": "tailBlade", "point": [355, 458]}
    },
    poses: {
      "guard": {"spine": 1.25, "head": 3.45, "crown": 0.9, "nearClaw": -3.3, "farClaw": -1.6},
      "hurt": {"head": -4.4, "crown": 1.05, "dorsal": -1.4, "nearArm": 2.35, "tailBlade": 0.95},
      "guard-break": {"spine": -2.4, "head": -4.5, "nearClaw": 3.65, "farClaw": 2.7, "tailSweep": -1.15},
      "recover": {"spine": -2.4, "head": -4.5, "nearClaw": 3.65, "farClaw": 2.7, "tailSweep": -1.15}
    }
  },
  {
    fighterId: "import-game-afe-synth-warden",
    profileId: "pose-v106-import-game-afe-synth-warden",
    sourceSha256: "019e4e3a3c1c184b8ded522ce17d129ba844965abbfbcb62d61d0f7598d9462e",
    anatomy: "warden-synthetic-with-fixed-carbine-and-overlapping-sleeve-plates",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [604, 765], "tip": [607, 827]},
      {"id": "spine", "parent": "hips", "pivot": [607, 698], "tip": [625, 360]},
      {"id": "head", "parent": "spine", "pivot": [555, 286], "tip": [562, 175]},
      {"id": "visor", "parent": "head", "pivot": [548, 154], "tip": [496, 199]},
      {"id": "shoulder", "parent": "spine", "pivot": [695, 349], "tip": [719, 468]},
      {"id": "forearm", "parent": "shoulder", "pivot": [684, 527], "tip": [443, 583]},
      {"id": "carbine", "parent": "spine", "pivot": [478, 513], "tip": [220, 559]}
    ],
    contacts: {
      "frontBoot": {"bone": "hips", "point": [468, 1428]},
      "backBoot": {"bone": "hips", "point": [817, 1435]},
      "spine": {"bone": "spine", "point": [625, 360]},
      "head": {"bone": "head", "point": [562, 175]},
      "visor": {"bone": "visor", "point": [496, 199]},
      "shoulder": {"bone": "shoulder", "point": [719, 468]}
    },
    poses: {
      "guard": {"spine": -1.35, "head": -4.15, "visor": -0.95},
      "hurt": {"spine": 2.1, "head": 4.85, "shoulder": -1.5},
      "guard-break": {"spine": 3.0, "head": 5.0, "shoulder": -2.05, "visor": 1.15},
      "recover": {"spine": 3.0, "head": 5.0, "shoulder": -2.05, "visor": 1.15}
    }
  },
  {
    fighterId: "import-game-dd-wy-commando",
    profileId: "pose-v106-import-game-dd-wy-commando",
    sourceSha256: "1bcafd4c6b5e06611d0184c317f76422749d43e4b97a14f39316eef3eca3c012",
    anatomy: "white-armoured-commando-with-protected-rifle-cradle-and-sensor-helmet",
    bones: [
      {"id": "hips", "parent": null, "pivot": [531, 726], "tip": [527, 789]},
      {"id": "spine", "parent": "hips", "pivot": [538, 667], "tip": [478, 363]},
      {"id": "head", "parent": "spine", "pivot": [482, 209], "tip": [429, 115]},
      {"id": "opticBar", "parent": "head", "pivot": [433, 122], "tip": [370, 129]},
      {"id": "shoulder", "parent": "spine", "pivot": [600, 335], "tip": [621, 520]},
      {"id": "carbineBlock", "parent": "spine", "pivot": [471, 506], "tip": [199, 607]},
      {"id": "grip", "parent": "carbineBlock", "pivot": [391, 614], "tip": [283, 632]}
    ],
    contacts: {
      "frontBoot": {"bone": "hips", "point": [443, 1410]},
      "backBoot": {"bone": "hips", "point": [730, 1407]},
      "spine": {"bone": "spine", "point": [478, 363]},
      "head": {"bone": "head", "point": [429, 115]},
      "opticBar": {"bone": "opticBar", "point": [370, 129]}
    },
    poses: {
      "guard": {"spine": -1.05, "head": -4.25, "opticBar": -0.85},
      "hurt": {"spine": 1.75, "head": 4.5, "opticBar": 1.25},
      "guard-break": {"spine": 2.55, "head": 5.05, "opticBar": 1.8},
      "recover": {"spine": 2.55, "head": 5.05, "opticBar": 1.8}
    }
  },
  {
    fighterId: "synth-enforcer",
    profileId: "pose-v111-afe-synth-enforcer",
    sourceSha256: "028ef6780368173b86af8774c45f0c74856002b730afed8e8e4e7071bcacfe25",
    anatomy: "enforcer-with-rigid-aimed-long-arm-and-open-head-silhouette",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [635, 719], "tip": [628, 813]},
      {"id": "spine", "parent": "hips", "pivot": [635, 653], "tip": [677, 353]},
      {"id": "head", "parent": "spine", "pivot": [604, 279], "tip": [555, 206]},
      {"id": "shoulder", "parent": "spine", "pivot": [775, 370], "tip": [726, 531]},
      {"id": "armBrace", "parent": "shoulder", "pivot": [688, 517], "tip": [513, 433]},
      {"id": "longArm", "parent": "spine", "pivot": [370, 342], "tip": [136, 339]}
    ],
    contacts: {
      "frontBoot": {"bone": "hips", "point": [405, 1393]},
      "backBoot": {"bone": "hips", "point": [932, 1407]},
      "spine": {"bone": "spine", "point": [677, 353]},
      "head": {"bone": "head", "point": [555, 206]},
      "shoulder": {"bone": "shoulder", "point": [726, 531]},
      "armBrace": {"bone": "armBrace", "point": [513, 433]}
    },
    poses: {
      "guard": {"spine": -1.35, "head": -4.3, "shoulder": 1.25},
      "hurt": {"spine": 1.9, "head": 4.85, "shoulder": -1.55},
      "guard-break": {"spine": 2.65, "head": 5.15, "shoulder": -2.35, "armBrace": -1.25},
      "recover": {"spine": 2.65, "head": 5.15, "shoulder": -2.35, "armBrace": -1.25}
    }
  },
  {
    fighterId: "synth-automated-powerloader",
    profileId: "pose-v116-automated-powerloader",
    sourceSha256: "61fb2a0b6668e154ca41b50820c9875dcbfac68a1a08247cfa2005884e6d63a8",
    anatomy: "automated-loader-with-rigid-lifting-frame-and-jointed-drive-struts",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [892, 767], "tip": [892, 851]},
      {"id": "platform", "parent": "hips", "pivot": [875, 679], "tip": [773, 382]},
      {"id": "cab", "parent": "platform", "pivot": [773, 391], "tip": [618, 329]},
      {"id": "liftArm", "parent": "platform", "pivot": [1064, 601], "tip": [846, 767]},
      {"id": "frontFork", "parent": "liftArm", "pivot": [589, 816], "tip": [350, 907]},
      {"id": "rearFork", "parent": "platform", "pivot": [271, 609], "tip": [58, 612]},
      {"id": "rearCylinder", "parent": "platform", "pivot": [1070, 329], "tip": [1128, 499]},
      {"id": "nearKnee", "parent": "hips", "pivot": [910, 872], "tip": [959, 1038]},
      {"id": "farKnee", "parent": "hips", "pivot": [659, 895], "tip": [607, 1041]}
    ],
    contacts: {
      "frontPad": {"bone": "hips", "point": [577, 1169]},
      "rearPad": {"bone": "hips", "point": [942, 1166]},
      "platform": {"bone": "platform", "point": [773, 382]},
      "rearCylinder": {"bone": "rearCylinder", "point": [1128, 499]},
      "nearKnee": {"bone": "nearKnee", "point": [959, 1038]},
      "farKnee": {"bone": "farKnee", "point": [607, 1041]}
    },
    poses: {
      "guard": {"platform": -1.65, "rearCylinder": -0.8, "farKnee": 1.25},
      "hurt": {"platform": 1.95, "rearCylinder": 1.25, "nearKnee": -1.5},
      "guard-break": {"platform": 2.95, "nearKnee": -1.95, "farKnee": 1.35},
      "recover": {"platform": 2.95, "nearKnee": -1.95, "farKnee": 1.35}
    }
  }
];
