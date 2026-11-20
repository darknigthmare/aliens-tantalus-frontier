// Screen-space pivots and support contacts measured on the admitted RGBA plates.
// Angles are small, original presentations and grounded recovery gestures.
export const XENO_TRIALS_RIG_DATA_V201 = [
  {
    fighterId: "mecha-2",
    profileId: "pose-v95-user-xeno-mecha-2",
    sourceSha256: "bf707b9cacac1244b3f78cf024ec100771cc01daea1e93335027b7637d52865f",
    anatomy: "blue-servo-plating-with-pincer-hand-and-tipped-cable-tail",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [767, 555], "tip": [783, 609]},
      {"id": "spine", "parent": "hips", "pivot": [759, 542], "tip": [665, 248]},
      {"id": "head", "parent": "spine", "pivot": [632, 228], "tip": [494, 256]},
      {"id": "upperArm", "parent": "spine", "pivot": [706, 322], "tip": [818, 424]},
      {"id": "pincer", "parent": "upperArm", "pivot": [823, 432], "tip": [808, 601]},
      {"id": "tailRoot", "parent": "hips", "pivot": [872, 463], "tip": [1046, 601]},
      {"id": "cableLoop", "parent": "tailRoot", "pivot": [1138, 665], "tip": [1401, 557]},
      {"id": "tailBlade", "parent": "cableLoop", "pivot": [1358, 450], "tip": [1174, 345]}
    ],
    contacts: {
      "frontFoot": {"bone": "hips", "point": [557, 818]},
      "rearFoot": {"bone": "hips", "point": [944, 818]},
      "head": {"bone": "head", "point": [494, 256]},
      "upperArm": {"bone": "upperArm", "point": [818, 424]},
      "pincer": {"bone": "pincer", "point": [808, 601]},
      "cableLoop": {"bone": "cableLoop", "point": [1401, 557]},
      "tailBlade": {"bone": "tailBlade", "point": [1174, 345]}
    },
    poses: {
      "intro": {"head": 3.8, "pincer": -1.5, "tailBlade": 1.3},
      "round-win": {"head": -3.1, "pincer": 2.1, "cableLoop": 1.5, "tailBlade": -0.9},
      "round-loss": {"head": -4.9, "upperArm": 1.4, "tailBlade": 2.2},
      "recovery": {"pincer": 3.6, "upperArm": -1.7, "cableLoop": -1.5, "tailBlade": -1.6}
    }
  },
  {
    fighterId: "albino-combat-synth",
    profileId: "enemy-094-albino-combat-synthetic",
    sourceSha256: "36bd4bb9795f8a3f4716cec27df5da521ef0170760215ce1228987e5552bfb13",
    anatomy: "armored-synthetic-with-articulated-helmet-and-rifle-held-as-unit",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [583, 653], "tip": [589, 705]},
      {"id": "spine", "parent": "hips", "pivot": [589, 618], "tip": [591, 347]},
      {"id": "helmet", "parent": "spine", "pivot": [720, 242], "tip": [804, 198]},
      {"id": "upperArm", "parent": "spine", "pivot": [565, 341], "tip": [478, 495]},
      {"id": "forearm", "parent": "upperArm", "pivot": [498, 513], "tip": [711, 568]},
      {"id": "rifle", "parent": "spine", "pivot": [807, 559], "tip": [991, 591]}
    ],
    contacts: {
      "rearBoot": {"bone": "hips", "point": [420, 1163]},
      "forwardBoot": {"bone": "hips", "point": [927, 1163]},
      "spine": {"bone": "spine", "point": [591, 347]},
      "helmet": {"bone": "helmet", "point": [804, 198]},
      "upperArm": {"bone": "upperArm", "point": [478, 495]}
    },
    poses: {
      "intro": {"helmet": -4.7, "spine": -0.7},
      "round-win": {"helmet": -3, "spine": 1.6},
      "round-loss": {"helmet": 4.8, "spine": 1.3},
      "recovery": {"helmet": 3.9, "spine": -1.1, "upperArm": 2.1}
    }
  },
  {
    fighterId: "albino-six",
    profileId: "enemy-070-albino-specimen-six-line",
    sourceSha256: "10a9d8197cf2f844d492e2cb90268550795e6009b61e610cca8cfb91a0639994",
    anatomy: "ivory-crown-with-three-dorsal-tubes-and-a-long-ventral-coil",
    bones: [
      {"id": "hips", "parent": null, "pivot": [761, 707], "tip": [744, 778]},
      {"id": "spine", "parent": "hips", "pivot": [752, 658], "tip": [912, 522]},
      {"id": "dome", "parent": "spine", "pivot": [975, 416], "tip": [1117, 410]},
      {"id": "upperArm", "parent": "spine", "pivot": [892, 490], "tip": [969, 616]},
      {"id": "claws", "parent": "upperArm", "pivot": [980, 624], "tip": [1127, 677]},
      {"id": "dorsalTubes", "parent": "spine", "pivot": [846, 493], "tip": [784, 328]},
      {"id": "tailRoot", "parent": "hips", "pivot": [675, 607], "tip": [550, 741]},
      {"id": "tailCoil", "parent": "tailRoot", "pivot": [417, 848], "tip": [160, 886]},
      {"id": "tailTip", "parent": "tailCoil", "pivot": [108, 744], "tip": [202, 601]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [559, 1020]},
      "frontFoot": {"bone": "hips", "point": [940, 1017]},
      "dome": {"bone": "dome", "point": [1117, 410]},
      "upperArm": {"bone": "upperArm", "point": [969, 616]},
      "claws": {"bone": "claws", "point": [1127, 677]},
      "dorsalTubes": {"bone": "dorsalTubes", "point": [784, 328]},
      "tailCoil": {"bone": "tailCoil", "point": [160, 886]},
      "tailTip": {"bone": "tailTip", "point": [202, 601]}
    },
    poses: {
      "intro": {"dome": -3.5, "dorsalTubes": 1.3, "tailTip": 1.1},
      "round-win": {"dome": -4.7, "claws": -2.5, "tailCoil": 0.9},
      "round-loss": {"dome": 4.8, "dorsalTubes": -1.5, "tailTip": -1.8},
      "recovery": {"claws": 3.7, "upperArm": -0.8, "tailCoil": -1.7}
    }
  },
  {
    fighterId: "armored-red",
    profileId: "enemy-123-armored-red-xenomorph",
    sourceSha256: "416b5223221fdb44af5a96ae9d8353221591b20ae9ac336e467d27dafb25b142",
    anatomy: "crimson-lamellar-carapace-with-extended-right-claws-and-barbed-tail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [829, 535], "tip": [826, 573]},
      {"id": "spine", "parent": "hips", "pivot": [791, 470], "tip": [1005, 312]},
      {"id": "dome", "parent": "spine", "pivot": [1159, 293], "tip": [1303, 270]},
      {"id": "spurs", "parent": "spine", "pivot": [998, 286], "tip": [810, 169]},
      {"id": "forwardArm", "parent": "spine", "pivot": [1126, 358], "tip": [1154, 470]},
      {"id": "forwardClaw", "parent": "forwardArm", "pivot": [1189, 486], "tip": [1380, 610]},
      {"id": "tailRoot", "parent": "hips", "pivot": [677, 510], "tip": [524, 652]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [405, 719], "tip": [154, 752]},
      {"id": "tailTip", "parent": "tailSweep", "pivot": [86, 703], "tip": [88, 612]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [549, 931]},
      "forwardFoot": {"bone": "hips", "point": [1108, 936]},
      "dome": {"bone": "dome", "point": [1303, 270]},
      "spurs": {"bone": "spurs", "point": [810, 169]},
      "forwardArm": {"bone": "forwardArm", "point": [1154, 470]},
      "forwardClaw": {"bone": "forwardClaw", "point": [1380, 610]},
      "tailSweep": {"bone": "tailSweep", "point": [154, 752]},
      "tailTip": {"bone": "tailTip", "point": [88, 612]}
    },
    poses: {
      "intro": {"dome": -3.4, "spurs": 0.9, "tailTip": 2},
      "round-win": {"dome": -4.5, "forwardClaw": -3, "tailSweep": 0.8},
      "round-loss": {"dome": 4.6, "spurs": -1.7, "tailTip": 1.5},
      "recovery": {"forwardArm": -0.9, "forwardClaw": 3.6, "tailSweep": -1.3}
    }
  },
  {
    fighterId: "armored-k-series",
    profileId: "enemy-124-armored-k-series-yellow-xenomorph",
    sourceSha256: "28fc592dc0e74dc7afe0d7ec34fa58165e24da5b69620ff997392693e80c5f54",
    anatomy: "golden-plate-shoulder-with-hanging-talons-and-upright-tail-scythe",
    bones: [
      {"id": "hips", "parent": null, "pivot": [768, 586], "tip": [782, 666]},
      {"id": "spine", "parent": "hips", "pivot": [740, 526], "tip": [808, 291]},
      {"id": "dome", "parent": "spine", "pivot": [933, 275], "tip": [1052, 230]},
      {"id": "upperArm", "parent": "spine", "pivot": [796, 305], "tip": [728, 412]},
      {"id": "nearClaws", "parent": "upperArm", "pivot": [803, 472], "tip": [936, 605]},
      {"id": "farClaws", "parent": "spine", "pivot": [1029, 496], "tip": [1126, 498]},
      {"id": "tailRoot", "parent": "hips", "pivot": [689, 524], "tip": [577, 607]},
      {"id": "tailHook", "parent": "tailRoot", "pivot": [363, 577], "tip": [405, 293]},
      {"id": "tailScythe", "parent": "tailHook", "pivot": [428, 219], "tip": [386, 93]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [638, 931]},
      "frontFoot": {"bone": "hips", "point": [980, 938]},
      "dome": {"bone": "dome", "point": [1052, 230]},
      "upperArm": {"bone": "upperArm", "point": [728, 412]},
      "nearClaws": {"bone": "nearClaws", "point": [936, 605]},
      "farClaws": {"bone": "farClaws", "point": [1126, 498]},
      "tailHook": {"bone": "tailHook", "point": [405, 293]},
      "tailScythe": {"bone": "tailScythe", "point": [386, 93]}
    },
    poses: {
      "intro": {"dome": -3.7, "tailScythe": 2},
      "round-win": {"dome": -4.2, "nearClaws": 2.4, "tailHook": 1.1},
      "round-loss": {"dome": 4.1, "farClaws": 2.7, "tailScythe": -2.4},
      "recovery": {"upperArm": -1.2, "nearClaws": -2.8, "farClaws": 3.5, "tailHook": -0.9}
    }
  },
  {
    fighterId: "armored-ripper-queen",
    profileId: "enemy-128-armored-ripper-queen",
    sourceSha256: "ff323a9e17b03011395212ddae1426a730df34ebe1d5d206f6f2f46fe489545f",
    anatomy: "armored-ripper-with-long-crown-sweeps-and-double-foreclaws",
    bones: [
      {"id": "hips", "parent": null, "pivot": [759, 596], "tip": [766, 670]},
      {"id": "spine", "parent": "hips", "pivot": [731, 528], "tip": [933, 314]},
      {"id": "dome", "parent": "spine", "pivot": [1173, 358], "tip": [1361, 377]},
      {"id": "crown", "parent": "dome", "pivot": [1252, 277], "tip": [1054, 86]},
      {"id": "upperArm", "parent": "spine", "pivot": [919, 410], "tip": [815, 535]},
      {"id": "nearClaws", "parent": "upperArm", "pivot": [870, 577], "tip": [1072, 832]},
      {"id": "farClaws", "parent": "spine", "pivot": [1195, 556], "tip": [1424, 735]},
      {"id": "tailRoot", "parent": "hips", "pivot": [673, 568], "tip": [531, 617]},
      {"id": "tailCurl", "parent": "tailRoot", "pivot": [335, 670], "tip": [105, 514]},
      {"id": "tailTip", "parent": "tailCurl", "pivot": [154, 386], "tip": [275, 272]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [489, 938]},
      "frontFoot": {"bone": "hips", "point": [1143, 940]},
      "dome": {"bone": "dome", "point": [1361, 377]},
      "crown": {"bone": "crown", "point": [1054, 86]},
      "upperArm": {"bone": "upperArm", "point": [815, 535]},
      "nearClaws": {"bone": "nearClaws", "point": [1072, 832]},
      "farClaws": {"bone": "farClaws", "point": [1424, 735]},
      "tailCurl": {"bone": "tailCurl", "point": [105, 514]},
      "tailTip": {"bone": "tailTip", "point": [275, 272]}
    },
    poses: {
      "intro": {"dome": -3.1, "crown": -1.1, "tailTip": 1.2},
      "round-win": {"dome": -3.8, "nearClaws": -3.2, "tailCurl": 1.4},
      "round-loss": {"dome": 4.6, "crown": 1.3, "farClaws": 2.2},
      "recovery": {"upperArm": 1.2, "nearClaws": 3.7, "farClaws": -2.5, "tailTip": -1.7}
    }
  },
  {
    fighterId: "user-warrior-red",
    profileId: "pose-v95-user-xeno-warrior-red",
    sourceSha256: "c9ed4247aa61b27018dcb1b01e4210ce3e47592f66467bd7407d46e039fd1e3d",
    anatomy: "low-crimson-quadruped-with-a-keel-and-high-counterbalancing-blade",
    bones: [
      {"id": "hips", "parent": null, "pivot": [787, 684], "tip": [804, 735]},
      {"id": "spine", "parent": "hips", "pivot": [747, 687], "tip": [484, 675]},
      {"id": "dome", "parent": "spine", "pivot": [365, 613], "tip": [231, 650]},
      {"id": "upperArm", "parent": "spine", "pivot": [502, 695], "tip": [601, 826]},
      {"id": "elbow", "parent": "upperArm", "pivot": [604, 841], "tip": [579, 940]},
      {"id": "tailRoot", "parent": "hips", "pivot": [829, 658], "tip": [989, 667]},
      {"id": "tailBend", "parent": "tailRoot", "pivot": [1103, 584], "tip": [1020, 527]},
      {"id": "tailBlade", "parent": "tailBend", "pivot": [821, 345], "tip": [732, 137]}
    ],
    contacts: {
      "frontFar": {"bone": "hips", "point": [274, 1077]},
      "frontNear": {"bone": "hips", "point": [513, 1106]},
      "rearFar": {"bone": "hips", "point": [767, 1035]},
      "rearNear": {"bone": "hips", "point": [1052, 1072]},
      "dome": {"bone": "dome", "point": [231, 650]},
      "upperArm": {"bone": "upperArm", "point": [601, 826]},
      "elbow": {"bone": "elbow", "point": [579, 940]},
      "tailRoot": {"bone": "tailRoot", "point": [989, 667]},
      "tailBend": {"bone": "tailBend", "point": [1020, 527]},
      "tailBlade": {"bone": "tailBlade", "point": [732, 137]}
    },
    poses: {
      "intro": {"dome": 3.9, "tailBlade": 1.5},
      "round-win": {"dome": 4.3, "elbow": -2.1, "tailBend": -0.9},
      "round-loss": {"dome": -4.4, "tailBlade": -2.1, "tailRoot": 1.1},
      "recovery": {"upperArm": 1.4, "elbow": 3.2, "tailBend": 2.1}
    }
  },
  {
    fighterId: "user-chameleon-2",
    profileId: "pose-v95-user-xeno-chameleon-2",
    sourceSha256: "fe08176517bb488c5e42b60c1df72c48aa07bf9a3677615a91e9bf76a44d0b63",
    anatomy: "red-countercurled-tail-and-separate-shoulder-shell-on-a-low-stalk",
    bones: [
      {"id": "hips", "parent": null, "pivot": [819, 485], "tip": [844, 536]},
      {"id": "spine", "parent": "hips", "pivot": [781, 462], "tip": [531, 392]},
      {"id": "muzzle", "parent": "spine", "pivot": [371, 404], "tip": [273, 465]},
      {"id": "shoulderShell", "parent": "spine", "pivot": [589, 275], "tip": [518, 240]},
      {"id": "tailRoot", "parent": "hips", "pivot": [912, 445], "tip": [1046, 541]},
      {"id": "tailBend", "parent": "tailRoot", "pivot": [1122, 599], "tip": [1312, 723]},
      {"id": "tailCurl", "parent": "tailBend", "pivot": [1440, 713], "tip": [1406, 559]}
    ],
    contacts: {
      "forePad": {"bone": "hips", "point": [248, 756]},
      "midFront": {"bone": "hips", "point": [806, 756]},
      "rearFar": {"bone": "hips", "point": [1011, 701]},
      "rearNear": {"bone": "hips", "point": [1150, 733]},
      "muzzle": {"bone": "muzzle", "point": [273, 465]},
      "shoulderShell": {"bone": "shoulderShell", "point": [518, 240]},
      "tailRoot": {"bone": "tailRoot", "point": [1046, 541]},
      "tailBend": {"bone": "tailBend", "point": [1312, 723]},
      "tailCurl": {"bone": "tailCurl", "point": [1406, 559]}
    },
    poses: {
      "intro": {"muzzle": 3.7, "shoulderShell": 1.3, "tailCurl": 0.9},
      "round-win": {"muzzle": 4.4, "shoulderShell": -2.4, "tailBend": -1.3},
      "round-loss": {"muzzle": -4.8, "tailCurl": 2.1, "tailRoot": 0.9},
      "recovery": {"muzzle": 2.3, "shoulderShell": 3.5, "tailBend": 1.1, "tailCurl": -1.9}
    }
  },
  {
    fighterId: "user-pale-spined",
    profileId: "pose-v95-user-quadrupede-pale-epineux",
    sourceSha256: "a0fd251e4802655e3745b716af0ab1a80cb90eb16b4575263f5bbaf78bcf67db",
    anatomy: "pale-pack-hunter-with-a-continuous-horn-long-jaw-and-neck-spines",
    bones: [
      {"id": "hips", "parent": null, "pivot": [1031, 544], "tip": [1050, 606]},
      {"id": "spine", "parent": "hips", "pivot": [1026, 499], "tip": [759, 444]},
      {"id": "head", "parent": "spine", "pivot": [465, 336], "tip": [341, 382]},
      {"id": "horn", "parent": "head", "pivot": [470, 251], "tip": [778, 112]},
      {"id": "jaw", "parent": "head", "pivot": [422, 389], "tip": [375, 508]},
      {"id": "nearArm", "parent": "spine", "pivot": [764, 413], "tip": [816, 630]},
      {"id": "nearClaw", "parent": "nearArm", "pivot": [807, 690], "tip": [475, 835]},
      {"id": "dorsal", "parent": "spine", "pivot": [735, 341], "tip": [883, 227]}
    ],
    contacts: {
      "forePad": {"bone": "hips", "point": [432, 871]},
      "hindFar": {"bone": "hips", "point": [802, 873]},
      "hindNear": {"bone": "hips", "point": [1365, 912]},
      "head": {"bone": "head", "point": [341, 382]},
      "horn": {"bone": "horn", "point": [778, 112]},
      "jaw": {"bone": "jaw", "point": [375, 508]},
      "nearArm": {"bone": "nearArm", "point": [816, 630]},
      "nearClaw": {"bone": "nearClaw", "point": [475, 835]},
      "dorsal": {"bone": "dorsal", "point": [883, 227]}
    },
    poses: {
      "intro": {"head": 2.6, "horn": 0.8, "dorsal": 1.4},
      "round-win": {"head": 3.5, "jaw": -3.1, "dorsal": -1},
      "round-loss": {"head": -4, "horn": -1.3, "jaw": 2.5},
      "recovery": {"nearArm": 0.9, "nearClaw": 2.7, "dorsal": 1.7, "jaw": -1.8}
    }
  },
  {
    fighterId: "user-tiger-biped",
    profileId: "pose-v95-user-bipede-tigre",
    sourceSha256: "138d66d73d38d0d514b3766117e1aac4f00af108b9738c36b8ef608602ec70a7",
    anatomy: "tiger-striped-head-with-dual-horns-and-serrated-countertail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [567, 684], "tip": [585, 730]},
      {"id": "spine", "parent": "hips", "pivot": [539, 618], "tip": [442, 473]},
      {"id": "muzzle", "parent": "spine", "pivot": [362, 482], "tip": [268, 561]},
      {"id": "innerHorn", "parent": "muzzle", "pivot": [285, 396], "tip": [388, 271]},
      {"id": "outerHorn", "parent": "muzzle", "pivot": [422, 396], "tip": [576, 248]},
      {"id": "lowerArm", "parent": "spine", "pivot": [316, 618], "tip": [221, 710]},
      {"id": "tailRoot", "parent": "hips", "pivot": [650, 698], "tip": [789, 738]},
      {"id": "tailCurve", "parent": "tailRoot", "pivot": [980, 727], "tip": [952, 581]},
      {"id": "tailTip", "parent": "tailCurve", "pivot": [840, 352], "tip": [1072, 433]}
    ],
    contacts: {
      "raisedFoot": {"bone": "hips", "point": [559, 946]},
      "lowFoot": {"bone": "hips", "point": [821, 1106]},
      "muzzle": {"bone": "muzzle", "point": [268, 561]},
      "innerHorn": {"bone": "innerHorn", "point": [388, 271]},
      "outerHorn": {"bone": "outerHorn", "point": [576, 248]},
      "lowerArm": {"bone": "lowerArm", "point": [221, 710]},
      "tailCurve": {"bone": "tailCurve", "point": [952, 581]},
      "tailTip": {"bone": "tailTip", "point": [1072, 433]}
    },
    poses: {
      "intro": {"muzzle": 3.5, "outerHorn": 1.3, "tailTip": -0.8},
      "round-win": {"muzzle": 4.1, "innerHorn": -1.3, "lowerArm": -2.3},
      "round-loss": {"muzzle": -4.7, "outerHorn": -1.3, "tailTip": 2},
      "recovery": {"lowerArm": 3.3, "muzzle": 1.6, "tailCurve": 1.8, "tailTip": -1.5}
    }
  },
  {
    fighterId: "user-black-bone-raptor",
    profileId: "pose-v95-user-rapace-noir-os",
    sourceSha256: "3610c65456a6f0262d6987b1bf0fa642e095d64ae28f527b433db85c75bdc23b",
    anatomy: "ossified-raptor-with-an-open-neck-and-a-thin-countertail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [695, 601], "tip": [712, 673]},
      {"id": "spine", "parent": "hips", "pivot": [658, 570], "tip": [422, 564]},
      {"id": "neck", "parent": "spine", "pivot": [376, 533], "tip": [288, 447]},
      {"id": "snout", "parent": "neck", "pivot": [251, 439], "tip": [131, 439]},
      {"id": "backSpines", "parent": "spine", "pivot": [504, 519], "tip": [556, 445]},
      {"id": "claw", "parent": "spine", "pivot": [462, 653], "tip": [396, 772]},
      {"id": "tailRoot", "parent": "hips", "pivot": [744, 513], "tip": [932, 522]},
      {"id": "tailCurl", "parent": "tailRoot", "pivot": [1106, 584], "tip": [1149, 755]}
    ],
    contacts: {
      "raisedFoot": {"bone": "hips", "point": [598, 855]},
      "lowFoot": {"bone": "hips", "point": [977, 934]},
      "neck": {"bone": "neck", "point": [288, 447]},
      "snout": {"bone": "snout", "point": [131, 439]},
      "backSpines": {"bone": "backSpines", "point": [556, 445]},
      "claw": {"bone": "claw", "point": [396, 772]},
      "tailRoot": {"bone": "tailRoot", "point": [932, 522]},
      "tailCurl": {"bone": "tailCurl", "point": [1149, 755]}
    },
    poses: {
      "intro": {"neck": 2.5, "snout": 1.6, "tailCurl": 0.9},
      "round-win": {"neck": 3.6, "backSpines": -1.3, "claw": -2.3},
      "round-loss": {"neck": -3.7, "snout": -1.8, "tailCurl": -1.5},
      "recovery": {"snout": 2.4, "claw": 3.8, "tailRoot": 1.2, "tailCurl": -1.7}
    }
  },
  {
    fighterId: "user-red-horned",
    profileId: "pose-v95-user-quadrupede-rouge-corne",
    sourceSha256: "394ababca00c4eb2b14a42e886601b35890d04042aa386fb068938321bc1a03c",
    anatomy: "red-segmented-quadruped-with-a-long-helmet-crest-and-multiple-dorsal-knives",
    bones: [
      {"id": "hips", "parent": null, "pivot": [664, 735], "tip": [678, 795]},
      {"id": "spine", "parent": "hips", "pivot": [641, 695], "tip": [467, 596]},
      {"id": "head", "parent": "spine", "pivot": [299, 533], "tip": [142, 561]},
      {"id": "visor", "parent": "head", "pivot": [322, 450], "tip": [553, 356]},
      {"id": "dorsalKnives", "parent": "spine", "pivot": [530, 573], "tip": [718, 496]},
      {"id": "tailRoot", "parent": "hips", "pivot": [758, 690], "tip": [875, 767]},
      {"id": "tailBend", "parent": "tailRoot", "pivot": [1012, 849], "tip": [1117, 775]},
      {"id": "tailTip", "parent": "tailBend", "pivot": [1108, 592], "tip": [946, 439]}
    ],
    contacts: {
      "farFore": {"bone": "hips", "point": [254, 966]},
      "nearFore": {"bone": "hips", "point": [379, 989]},
      "farHind": {"bone": "hips", "point": [590, 952]},
      "nearHind": {"bone": "hips", "point": [838, 972]},
      "head": {"bone": "head", "point": [142, 561]},
      "visor": {"bone": "visor", "point": [553, 356]},
      "dorsalKnives": {"bone": "dorsalKnives", "point": [718, 496]},
      "tailBend": {"bone": "tailBend", "point": [1117, 775]},
      "tailTip": {"bone": "tailTip", "point": [946, 439]}
    },
    poses: {
      "intro": {"head": 3.8, "visor": 1.1, "dorsalKnives": 0.9},
      "round-win": {"head": 4.1, "dorsalKnives": -2.2, "tailBend": 0.9},
      "round-loss": {"head": -4.6, "visor": -1.2, "tailTip": -2.2},
      "recovery": {"visor": 2.1, "dorsalKnives": 1.8, "tailBend": 2, "tailTip": 1.7}
    }
  },
  {
    fighterId: "cryo-foundry-crusher",
    profileId: "enemy-234-cryo-adapted-foundry-crusher",
    sourceSha256: "5bd7c1ef40fc37e3a9f5d6ab9153307bd1c443e811ac01b9448ba6e6da3ac85d",
    anatomy: "cryo-crusher-with-enclosed-helmet-and-overlapping-dorsal-segments",
    bones: [
      {"id": "hips", "parent": null, "pivot": [749, 589], "tip": [768, 661]},
      {"id": "spine", "parent": "hips", "pivot": [745, 538], "tip": [1091, 461]},
      {"id": "crownHinge", "parent": "spine", "pivot": [1327, 477], "tip": [1213, 198]},
      {"id": "facemask", "parent": "crownHinge", "pivot": [1389, 528], "tip": [1450, 626]},
      {"id": "nearShoulder", "parent": "spine", "pivot": [1138, 593], "tip": [1159, 687]},
      {"id": "foreBrace", "parent": "nearShoulder", "pivot": [1147, 682], "tip": [1224, 787]},
      {"id": "dorsalPlate", "parent": "spine", "pivot": [1024, 391], "tip": [943, 337]},
      {"id": "tailRoot", "parent": "hips", "pivot": [701, 507], "tip": [503, 568]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [368, 614], "tip": [144, 619]}
    ],
    contacts: {
      "rearNear": {"bone": "hips", "point": [624, 849]},
      "rearFar": {"bone": "hips", "point": [938, 833]},
      "frontNear": {"bone": "hips", "point": [1236, 861]},
      "frontFar": {"bone": "hips", "point": [1380, 847]},
      "crownHinge": {"bone": "crownHinge", "point": [1213, 198]},
      "facemask": {"bone": "facemask", "point": [1450, 626]},
      "nearShoulder": {"bone": "nearShoulder", "point": [1159, 687]},
      "foreBrace": {"bone": "foreBrace", "point": [1224, 787]},
      "dorsalPlate": {"bone": "dorsalPlate", "point": [943, 337]},
      "tailSweep": {"bone": "tailSweep", "point": [144, 619]}
    },
    poses: {
      "intro": {"crownHinge": -3.2, "dorsalPlate": 1.2},
      "round-win": {"crownHinge": -3.8, "facemask": -1.5, "tailSweep": 1.7},
      "round-loss": {"crownHinge": 3.7, "facemask": 1.5, "dorsalPlate": -1.7},
      "recovery": {"crownHinge": 1.2, "foreBrace": 3, "nearShoulder": 1.3, "tailSweep": -1.1}
    }
  },
  {
    fighterId: "cryo-reef-stalker",
    profileId: "enemy-235-cryo-adapted-reef-stalker",
    sourceSha256: "5efad3c87c62cfa63723592b0641dca88dc37cdae402d025ae1db0932f4379aa",
    anatomy: "long-reef-stalker-with-a-ridged-neck-and-dragging-needle-tail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [1005, 574], "tip": [1007, 606]},
      {"id": "spine", "parent": "hips", "pivot": [991, 510], "tip": [1256, 454]},
      {"id": "head", "parent": "spine", "pivot": [1496, 379], "tip": [1616, 406]},
      {"id": "crownSpines", "parent": "spine", "pivot": [1357, 347], "tip": [1224, 216]},
      {"id": "farArm", "parent": "spine", "pivot": [1395, 492], "tip": [1448, 598]},
      {"id": "farForeclaw", "parent": "farArm", "pivot": [1459, 601], "tip": [1638, 692]},
      {"id": "tailRoot", "parent": "hips", "pivot": [972, 444], "tip": [737, 513]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [596, 564], "tip": [291, 617]},
      {"id": "tailTip", "parent": "tailSweep", "pivot": [170, 581], "tip": [99, 526]}
    ],
    contacts: {
      "hindNear": {"bone": "hips", "point": [759, 740]},
      "hindFar": {"bone": "hips", "point": [1143, 735]},
      "foreNear": {"bone": "hips", "point": [1475, 724]},
      "foreFar": {"bone": "hips", "point": [1657, 714]},
      "head": {"bone": "head", "point": [1616, 406]},
      "crownSpines": {"bone": "crownSpines", "point": [1224, 216]},
      "farArm": {"bone": "farArm", "point": [1448, 598]},
      "farForeclaw": {"bone": "farForeclaw", "point": [1638, 692]},
      "tailSweep": {"bone": "tailSweep", "point": [291, 617]},
      "tailTip": {"bone": "tailTip", "point": [99, 526]}
    },
    poses: {
      "intro": {"head": -3.7, "crownSpines": 1.2, "tailTip": 1.8},
      "round-win": {"head": -4.3, "farArm": -1.1, "tailSweep": 1.5},
      "round-loss": {"head": 4.6, "crownSpines": -1.8, "tailTip": -2.5},
      "recovery": {"farArm": 1.7, "farForeclaw": 3.5, "tailSweep": -1.6}
    }
  },
  {
    fighterId: "cryo-pale-hunter",
    profileId: "enemy-238-cryo-adapted-pale-crucible-hunter",
    sourceSha256: "22eeeea6ea215e55ba585442b1e82ea09596f8bc12bf1d1fd4f2c0513bfd1d60",
    anatomy: "ivory-project-adaptation-with-smooth-crown-dorsal-spines-and-long-arms",
    bones: [
      {"id": "hips", "parent": null, "pivot": [916, 564], "tip": [914, 628]},
      {"id": "spine", "parent": "hips", "pivot": [927, 444], "tip": [1194, 339]},
      {"id": "dome", "parent": "spine", "pivot": [1411, 353], "tip": [1550, 353]},
      {"id": "dorsalSpines", "parent": "spine", "pivot": [1226, 278], "tip": [1159, 180]},
      {"id": "frontArm", "parent": "spine", "pivot": [1213, 353], "tip": [1119, 542]},
      {"id": "frontWrist", "parent": "frontArm", "pivot": [1143, 569], "tip": [1344, 673]},
      {"id": "tailRoot", "parent": "hips", "pivot": [892, 411], "tip": [679, 478]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [481, 542], "tip": [245, 534]},
      {"id": "tailTip", "parent": "tailSweep", "pivot": [184, 484], "tip": [115, 339]}
    ],
    contacts: {
      "hindNear": {"bone": "hips", "point": [649, 727]},
      "hindFar": {"bone": "hips", "point": [1069, 724]},
      "foreNear": {"bone": "hips", "point": [1373, 711]},
      "foreFar": {"bone": "hips", "point": [1590, 692]},
      "dome": {"bone": "dome", "point": [1550, 353]},
      "dorsalSpines": {"bone": "dorsalSpines", "point": [1159, 180]},
      "frontArm": {"bone": "frontArm", "point": [1119, 542]},
      "frontWrist": {"bone": "frontWrist", "point": [1344, 673]},
      "tailSweep": {"bone": "tailSweep", "point": [245, 534]},
      "tailTip": {"bone": "tailTip", "point": [115, 339]}
    },
    poses: {
      "intro": {"dome": -4.1, "dorsalSpines": 1.4, "tailTip": 0.9},
      "round-win": {"dome": -4.4, "frontArm": 1.4, "tailSweep": 1.3},
      "round-loss": {"dome": 4.3, "dorsalSpines": -2.9, "tailTip": -1.7},
      "recovery": {"frontArm": -0.9, "frontWrist": 3.9, "dome": 1.5, "tailSweep": -1.1}
    }
  },
  {
    fighterId: "cryo-dust-runner",
    profileId: "enemy-239-cryo-adapted-dust-runner",
    sourceSha256: "019f943dad00f41b01d25d5fa1371f75cd204d2294cd2950d7fd8fced10603ea",
    anatomy: "low-dust-runner-with-a-ringed-tail-arc-and-a-long-forward-cranium",
    bones: [
      {"id": "hips", "parent": null, "pivot": [701, 500], "tip": [684, 561]},
      {"id": "spine", "parent": "hips", "pivot": [721, 472], "tip": [1026, 493]},
      {"id": "dome", "parent": "spine", "pivot": [1226, 449], "tip": [1396, 484]},
      {"id": "crown", "parent": "dome", "pivot": [1178, 386], "tip": [1064, 330]},
      {"id": "foreArm", "parent": "spine", "pivot": [1073, 517], "tip": [1029, 680]},
      {"id": "foreClaw", "parent": "foreArm", "pivot": [1066, 721], "tip": [1236, 847]},
      {"id": "tailRoot", "parent": "hips", "pivot": [647, 489], "tip": [493, 545]},
      {"id": "tailCurve", "parent": "tailRoot", "pivot": [233, 538], "tip": [100, 393]},
      {"id": "tailEnd", "parent": "tailCurve", "pivot": [165, 198], "tip": [528, 233]}
    ],
    contacts: {
      "rearNear": {"bone": "hips", "point": [377, 838]},
      "rearFar": {"bone": "hips", "point": [842, 835]},
      "frontNear": {"bone": "hips", "point": [1236, 854]},
      "frontFar": {"bone": "hips", "point": [1413, 801]},
      "dome": {"bone": "dome", "point": [1396, 484]},
      "crown": {"bone": "crown", "point": [1064, 330]},
      "foreArm": {"bone": "foreArm", "point": [1029, 680]},
      "foreClaw": {"bone": "foreClaw", "point": [1236, 847]},
      "tailCurve": {"bone": "tailCurve", "point": [100, 393]},
      "tailEnd": {"bone": "tailEnd", "point": [528, 233]}
    },
    poses: {
      "intro": {"dome": -3.2, "crown": 1.3, "tailEnd": 1.1},
      "round-win": {"dome": -4.7, "foreArm": -1.7, "tailCurve": 1.4},
      "round-loss": {"dome": 4.4, "crown": -1.2, "tailEnd": -2.6},
      "recovery": {"dome": 1.9, "foreClaw": 2.9, "foreArm": 1.1, "tailCurve": -1.1}
    }
  },
  {
    fighterId: "cryo-salvage-brute",
    profileId: "enemy-240-cryo-adapted-salvage-hive-brute",
    sourceSha256: "43940d2a2d6f112a34c894a8a58b78b72350f19789bdc802e3b81dc80e716385",
    anatomy: "heavy-cryo-brute-with-reinforced-gauntlet-and-stiff-low-sweep",
    bones: [
      {"id": "hips", "parent": null, "pivot": [849, 566], "tip": [856, 628]},
      {"id": "spine", "parent": "hips", "pivot": [861, 521], "tip": [1005, 356]},
      {"id": "dome", "parent": "spine", "pivot": [1147, 300], "tip": [1336, 342]},
      {"id": "dorsalSpines", "parent": "spine", "pivot": [987, 265], "tip": [877, 149]},
      {"id": "nearArm", "parent": "spine", "pivot": [1003, 398], "tip": [1008, 577]},
      {"id": "gauntlet", "parent": "nearArm", "pivot": [1073, 617], "tip": [1215, 777]},
      {"id": "tailRoot", "parent": "hips", "pivot": [740, 503], "tip": [589, 689]},
      {"id": "tailEnd", "parent": "tailRoot", "pivot": [449, 784], "tip": [182, 829]}
    ],
    contacts: {
      "hindNear": {"bone": "hips", "point": [733, 866]},
      "hindFar": {"bone": "hips", "point": [1045, 842]},
      "foreNear": {"bone": "hips", "point": [1219, 852]},
      "foreFar": {"bone": "hips", "point": [1364, 847]},
      "dome": {"bone": "dome", "point": [1336, 342]},
      "dorsalSpines": {"bone": "dorsalSpines", "point": [877, 149]},
      "nearArm": {"bone": "nearArm", "point": [1008, 577]},
      "gauntlet": {"bone": "gauntlet", "point": [1215, 777]},
      "tailRoot": {"bone": "tailRoot", "point": [589, 689]},
      "tailEnd": {"bone": "tailEnd", "point": [182, 829]}
    },
    poses: {
      "intro": {"dome": -3.7, "dorsalSpines": 1.4},
      "round-win": {"dome": -4.5, "gauntlet": -2, "tailEnd": 1.2},
      "round-loss": {"dome": 4.7, "dorsalSpines": -1.8, "tailEnd": -1.3},
      "recovery": {"nearArm": 1.3, "gauntlet": 3.5, "dome": 1.7, "tailRoot": -0.8}
    }
  },
  {
    fighterId: "cryo-caravan-stalker",
    profileId: "enemy-242-cryo-adapted-caravan-stalker",
    sourceSha256: "f5a963f52a2a66929c3aad9d5ad3b2c97d3b8e927a604302bd30820db1372018",
    anatomy: "pursuit-quadruped-with-two-dorsal-nozzles-and-drooping-segmented-tail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [763, 561], "tip": [752, 624]},
      {"id": "spine", "parent": "hips", "pivot": [775, 463], "tip": [1003, 417]},
      {"id": "dome", "parent": "spine", "pivot": [1299, 386], "tip": [1441, 410]},
      {"id": "dorsalVents", "parent": "spine", "pivot": [982, 321], "tip": [947, 240]},
      {"id": "frontArm", "parent": "spine", "pivot": [1078, 445], "tip": [1019, 596]},
      {"id": "frontWrist", "parent": "frontArm", "pivot": [1019, 638], "tip": [1138, 801]},
      {"id": "tailRoot", "parent": "hips", "pivot": [731, 433], "tip": [545, 510]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [414, 600], "tip": [212, 752]},
      {"id": "tailHook", "parent": "tailSweep", "pivot": [151, 756], "tip": [74, 710]}
    ],
    contacts: {
      "hindNear": {"bone": "hips", "point": [561, 842]},
      "hindFar": {"bone": "hips", "point": [922, 849]},
      "foreNear": {"bone": "hips", "point": [1161, 838]},
      "foreFar": {"bone": "hips", "point": [1392, 838]},
      "dome": {"bone": "dome", "point": [1441, 410]},
      "dorsalVents": {"bone": "dorsalVents", "point": [947, 240]},
      "frontArm": {"bone": "frontArm", "point": [1019, 596]},
      "frontWrist": {"bone": "frontWrist", "point": [1138, 801]},
      "tailSweep": {"bone": "tailSweep", "point": [212, 752]},
      "tailHook": {"bone": "tailHook", "point": [74, 710]}
    },
    poses: {
      "intro": {"dome": -3.7, "dorsalVents": 1.4, "tailHook": 0.9},
      "round-win": {"dome": -4.3, "frontArm": -1.3, "tailSweep": 1.6},
      "round-loss": {"dome": 4.3, "dorsalVents": -2.1, "tailHook": -2.1},
      "recovery": {"frontArm": 1.4, "frontWrist": 3.2, "dome": 1.4, "tailSweep": -1.1}
    }
  },
  {
    fighterId: "afe2-igniter",
    profileId: "pose-v113-afe2-igniter",
    sourceSha256: "555d13ccdebedc07ba850b196fa39c063593ff1506ab35553e27ef83c2423ae6",
    anatomy: "industrial-igniter-with-cylindrical-sensor-shoulder-guards-and-rigid-flame-tool",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [646, 660], "tip": [638, 723]},
      {"id": "platform", "parent": "hips", "pivot": [628, 604], "tip": [635, 363]},
      {"id": "sensor", "parent": "platform", "pivot": [618, 237], "tip": [566, 154]},
      {"id": "shoulder", "parent": "platform", "pivot": [789, 255], "tip": [887, 443]},
      {"id": "armBrace", "parent": "shoulder", "pivot": [866, 450], "tip": [670, 531]},
      {"id": "canister", "parent": "platform", "pivot": [936, 342], "tip": [922, 161]},
      {"id": "toolShell", "parent": "platform", "pivot": [415, 517], "tip": [112, 482]}
    ],
    contacts: {
      "forwardBoot": {"bone": "hips", "point": [419, 1365]},
      "rearBoot": {"bone": "hips", "point": [890, 1428]},
      "platform": {"bone": "platform", "point": [635, 363]},
      "sensor": {"bone": "sensor", "point": [566, 154]},
      "shoulder": {"bone": "shoulder", "point": [887, 443]},
      "canister": {"bone": "canister", "point": [922, 161]}
    },
    poses: {
      "intro": {"sensor": 3.6, "platform": -0.95, "canister": 0.8},
      "round-win": {"platform": 2.5, "sensor": -2.2},
      "round-loss": {"sensor": -4.2, "platform": -2.2, "canister": 1.3},
      "recovery": {"platform": 3.2, "sensor": 2.1, "shoulder": -1.3}
    }
  },
  {
    fighterId: "afe2-bombardier",
    profileId: "pose-v113-afe2-bombardier",
    sourceSha256: "a7eee87701bd47c18287ef264196e3eb8479a289e357e208460bc690db28bcd4",
    anatomy: "industrial-bombardier-with-optoelectronic-drum-and-rigid-launcher",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [639, 660], "tip": [609, 727]},
      {"id": "platform", "parent": "hips", "pivot": [642, 600], "tip": [628, 391]},
      {"id": "sensor", "parent": "platform", "pivot": [628, 234], "tip": [566, 178]},
      {"id": "shoulder", "parent": "platform", "pivot": [803, 255], "tip": [897, 454]},
      {"id": "armBrace", "parent": "shoulder", "pivot": [883, 461], "tip": [744, 503]},
      {"id": "topCap", "parent": "sensor", "pivot": [635, 129], "tip": [670, 70]},
      {"id": "launcherShell", "parent": "platform", "pivot": [408, 461], "tip": [101, 349]}
    ],
    contacts: {
      "forwardBoot": {"bone": "hips", "point": [387, 1358]},
      "rearBoot": {"bone": "hips", "point": [883, 1431]},
      "platform": {"bone": "platform", "point": [628, 391]},
      "sensor": {"bone": "sensor", "point": [566, 178]},
      "shoulder": {"bone": "shoulder", "point": [897, 454]},
      "topCap": {"bone": "topCap", "point": [670, 70]}
    },
    poses: {
      "intro": {"sensor": 4.2, "platform": 1.1},
      "round-win": {"platform": 2.2, "sensor": -2.8, "topCap": 0.8},
      "round-loss": {"sensor": -4.2, "platform": -2.5},
      "recovery": {"platform": -3.3, "sensor": 2.2, "shoulder": 1.6, "topCap": -1.1}
    }
  }
];
