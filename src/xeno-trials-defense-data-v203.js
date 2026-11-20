// Source-pixel pivots and support contacts measured on the admitted RGBA plates.
// Angles are original guard and recoil gestures, with continuous guard-break recovery.
export const XENO_TRIALS_DEFENSE_DATA_V203 = [
  {
    fighterId: "synth-containment",
    profileId: "pose-v110-afe-synth-containment",
    sourceSha256: "d065df84b529a30469df39215cb97d0d9b74b2323148f124d6ba6b04c2531bc2",
    anatomy: "shielded-containment-synthetic-with-fixed-shield-and-carried-baton",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [520, 702], "tip": [520, 771]},
      {"id": "spine", "parent": "hips", "pivot": [524, 649], "tip": [499, 349]},
      {"id": "helmet", "parent": "spine", "pivot": [548, 234], "tip": [604, 175]},
      {"id": "batonArm", "parent": "spine", "pivot": [381, 335], "tip": [213, 562]},
      {"id": "glove", "parent": "batonArm", "pivot": [202, 597], "tip": [171, 761]},
      {"id": "shieldCage", "parent": "hips", "pivot": [785, 621], "tip": [782, 1012]}
    ],
    contacts: {
      "leftBoot": {"bone": "hips", "point": [255, 1407]},
      "rightBoot": {"bone": "hips", "point": [740, 1407]},
      "spine": {"bone": "spine", "point": [499, 349]},
      "helmet": {"bone": "helmet", "point": [604, 175]},
      "batonArm": {"bone": "batonArm", "point": [213, 562]}
    },
    poses: {
      "guard": {"spine": 2.1, "helmet": 4.6, "batonArm": -2.4},
      "hurt": {"spine": -2.5, "helmet": -6.0, "batonArm": 2.65},
      "guard-break": {"spine": -3.8, "helmet": -6.2, "batonArm": 3.6},
      "recover": {"spine": -3.8, "helmet": -6.2, "batonArm": 3.6}
    }
  },
  {
    fighterId: "arachnoid",
    profileId: "castes-game_avp_capcom_arachnoid",
    sourceSha256: "84f47e12acfa88b5658a736863e4ad8b61a9b43bfa5cb61a34abe87649b2e3ee",
    anatomy: "horizontal-arachnoid-with-raised-tail-sweep-and-pointed-head",
    bones: [
      {"id": "hips", "parent": null, "pivot": [533, 668], "tip": [543, 711]},
      {"id": "spine", "parent": "hips", "pivot": [573, 640], "tip": [842, 633]},
      {"id": "muzzle", "parent": "spine", "pivot": [1001, 596], "tip": [1206, 696]},
      {"id": "horn", "parent": "muzzle", "pivot": [1152, 610], "tip": [1108, 512]},
      {"id": "frontUpper", "parent": "spine", "pivot": [840, 633], "tip": [910, 791]},
      {"id": "frontBrace", "parent": "frontUpper", "pivot": [957, 831], "tip": [1112, 887]},
      {"id": "tailRoot", "parent": "hips", "pivot": [614, 591], "tip": [456, 549]},
      {"id": "tailLoop", "parent": "tailRoot", "pivot": [261, 391], "tip": [291, 175]},
      {"id": "tailBlade", "parent": "tailLoop", "pivot": [654, 79], "tip": [824, 272]}
    ],
    contacts: {
      "rearPad": {"bone": "hips", "point": [333, 977]},
      "midPad": {"bone": "hips", "point": [810, 975]},
      "forePad": {"bone": "hips", "point": [1133, 926]},
      "foreFar": {"bone": "hips", "point": [1361, 959]},
      "spine": {"bone": "spine", "point": [842, 633]},
      "muzzle": {"bone": "muzzle", "point": [1206, 696]},
      "horn": {"bone": "horn", "point": [1108, 512]},
      "frontUpper": {"bone": "frontUpper", "point": [910, 791]},
      "frontBrace": {"bone": "frontBrace", "point": [1112, 887]},
      "tailLoop": {"bone": "tailLoop", "point": [291, 175]},
      "tailBlade": {"bone": "tailBlade", "point": [824, 272]}
    },
    poses: {
      "guard": {"spine": 0.72, "muzzle": 2.85, "horn": 1.05, "tailBlade": -1.4},
      "hurt": {"muzzle": -5.7, "frontUpper": -2.5, "tailLoop": 1.5},
      "guard-break": {"spine": -2.9, "muzzle": -6.1, "frontBrace": 3.3, "tailLoop": -2.3},
      "recover": {"spine": -2.9, "muzzle": -6.1, "frontBrace": 3.3, "tailLoop": -2.3}
    }
  },
  {
    fighterId: "grid",
    profileId: "castes-film_grid_avp_2004",
    sourceSha256: "49d756a01928adb1c3fa787d47efbb158da988699fd9d0008bf9a723a7002a74",
    anatomy: "grid-scarred-dome-with-three-dorsal-tubes-and-open-reaching-claws",
    bones: [
      {"id": "hips", "parent": null, "pivot": [980, 528], "tip": [970, 582]},
      {"id": "spine", "parent": "hips", "pivot": [1008, 507], "tip": [1059, 286]},
      {"id": "dome", "parent": "spine", "pivot": [1157, 228], "tip": [1334, 214]},
      {"id": "dorsal", "parent": "spine", "pivot": [975, 319], "tip": [884, 179]},
      {"id": "nearArm", "parent": "spine", "pivot": [1054, 275], "tip": [966, 440]},
      {"id": "nearHand", "parent": "nearArm", "pivot": [989, 463], "tip": [1043, 603]},
      {"id": "farHand", "parent": "spine", "pivot": [1217, 463], "tip": [1449, 543]},
      {"id": "tailRoot", "parent": "hips", "pivot": [929, 479], "tip": [835, 635]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [526, 838], "tip": [223, 859]},
      {"id": "tailBlade", "parent": "tailSweep", "pivot": [98, 796], "tip": [121, 640]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [854, 950]},
      "forwardFoot": {"bone": "hips", "point": [1299, 959]},
      "spine": {"bone": "spine", "point": [1059, 286]},
      "dome": {"bone": "dome", "point": [1334, 214]},
      "dorsal": {"bone": "dorsal", "point": [884, 179]},
      "nearArm": {"bone": "nearArm", "point": [966, 440]},
      "nearHand": {"bone": "nearHand", "point": [1043, 603]},
      "farHand": {"bone": "farHand", "point": [1449, 543]},
      "tailSweep": {"bone": "tailSweep", "point": [223, 859]},
      "tailBlade": {"bone": "tailBlade", "point": [121, 640]}
    },
    poses: {
      "guard": {"spine": 1.8, "dome": 4.4, "nearHand": -3.9, "farHand": -1.2},
      "hurt": {"dome": -5.25, "dorsal": -1.55, "nearHand": 4.5, "tailBlade": 1.5},
      "guard-break": {"spine": -3.25, "dome": -5.8, "nearArm": 2.4, "farHand": 3.8, "tailSweep": -1.8},
      "recover": {"spine": -3.25, "dome": -5.8, "nearArm": 2.4, "farHand": 3.8, "tailSweep": -1.8}
    }
  },
  {
    fighterId: "razor-claws",
    profileId: "castes-game_avp_capcom_razor_claws",
    sourceSha256: "a1d024f5a20e4a7210b7f77f011ed2f81e6a177ba787afd07a430b5cd71d1987",
    anatomy: "magenta-carapace-with-shielding-mandibles-and-double-razor-blades",
    bones: [
      {"id": "hips", "parent": null, "pivot": [889, 579], "tip": [858, 621]},
      {"id": "spine", "parent": "hips", "pivot": [908, 519], "tip": [910, 293]},
      {"id": "dome", "parent": "spine", "pivot": [1057, 312], "tip": [1224, 365]},
      {"id": "dorsalSpurs", "parent": "spine", "pivot": [870, 275], "tip": [783, 123]},
      {"id": "nearArm", "parent": "spine", "pivot": [861, 333], "tip": [801, 405]},
      {"id": "armBlade", "parent": "nearArm", "pivot": [796, 412], "tip": [819, 538]},
      {"id": "farArm", "parent": "spine", "pivot": [1031, 424], "tip": [1089, 500]},
      {"id": "farBlade", "parent": "farArm", "pivot": [1229, 477], "tip": [1362, 594]},
      {"id": "tailRoot", "parent": "hips", "pivot": [787, 566], "tip": [659, 754]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [391, 847], "tip": [214, 737]}
    ],
    contacts: {
      "rearHooks": {"bone": "hips", "point": [596, 961]},
      "frontHooks": {"bone": "hips", "point": [1078, 959]},
      "spine": {"bone": "spine", "point": [910, 293]},
      "dome": {"bone": "dome", "point": [1224, 365]},
      "dorsalSpurs": {"bone": "dorsalSpurs", "point": [783, 123]},
      "nearArm": {"bone": "nearArm", "point": [801, 405]},
      "armBlade": {"bone": "armBlade", "point": [819, 538]},
      "farArm": {"bone": "farArm", "point": [1089, 500]},
      "farBlade": {"bone": "farBlade", "point": [1362, 594]},
      "tailSweep": {"bone": "tailSweep", "point": [214, 737]}
    },
    poses: {
      "guard": {"spine": 1.75, "dome": 4.1, "armBlade": -4.7, "farBlade": -3.2},
      "hurt": {"dome": -5.65, "farBlade": 2.3, "dorsalSpurs": 1.4, "tailSweep": 1.8},
      "guard-break": {"spine": -3.4, "dome": -5.15, "nearArm": 2.15, "armBlade": 4.3, "farArm": 3.1},
      "recover": {"spine": -3.4, "dome": -5.15, "nearArm": 2.15, "armBlade": 4.3, "farArm": 3.1}
    }
  },
  {
    fighterId: "predalien",
    profileId: "castes-game_predalien_avp2_primal_hunt",
    sourceSha256: "3c39acccb5bcfd571026d2511553946078be96b4f2c0e2c2470b39197f770bb5",
    anatomy: "predalien-mandibles-with-dorsal-spurs-and-a-long-countertail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [1057, 514], "tip": [1064, 577]},
      {"id": "spine", "parent": "hips", "pivot": [1064, 484], "tip": [1089, 312]},
      {"id": "head", "parent": "spine", "pivot": [1152, 212], "tip": [1266, 200]},
      {"id": "mandible", "parent": "head", "pivot": [1229, 212], "tip": [1275, 233]},
      {"id": "dorsalSpurs", "parent": "spine", "pivot": [1066, 261], "tip": [1038, 179]},
      {"id": "nearArm", "parent": "spine", "pivot": [1015, 326], "tip": [936, 433]},
      {"id": "nearHand", "parent": "nearArm", "pivot": [938, 486], "tip": [954, 614]},
      {"id": "farHand", "parent": "spine", "pivot": [1236, 470], "tip": [1353, 606]},
      {"id": "tailRoot", "parent": "hips", "pivot": [1012, 489], "tip": [847, 510]},
      {"id": "tailBlade", "parent": "tailRoot", "pivot": [403, 465], "tip": [202, 235]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [926, 926]},
      "frontFoot": {"bone": "hips", "point": [1189, 924]},
      "spine": {"bone": "spine", "point": [1089, 312]},
      "head": {"bone": "head", "point": [1266, 200]},
      "mandible": {"bone": "mandible", "point": [1275, 233]},
      "dorsalSpurs": {"bone": "dorsalSpurs", "point": [1038, 179]},
      "nearArm": {"bone": "nearArm", "point": [936, 433]},
      "nearHand": {"bone": "nearHand", "point": [954, 614]},
      "farHand": {"bone": "farHand", "point": [1353, 606]},
      "tailBlade": {"bone": "tailBlade", "point": [202, 235]}
    },
    poses: {
      "guard": {"spine": 1.75, "head": 4.4, "mandible": 1.6, "nearArm": -2.35, "farHand": -2.7},
      "hurt": {"head": -5.65, "mandible": -2.15, "nearHand": 1.85, "tailBlade": 1.15},
      "guard-break": {"spine": -3.1, "head": -5.85, "dorsalSpurs": 1.65, "nearHand": 3.7, "farHand": 4.1},
      "recover": {"spine": -3.1, "head": -5.85, "dorsalSpurs": 1.65, "nearHand": 3.7, "farHand": 4.1}
    }
  },
  {
    fighterId: "xenoborg",
    profileId: "castes-game_xenoborg_avp1999",
    sourceSha256: "d6532326d96fbdd14e7feb8d19946b92edac55a0f8ae88ccc916cc692b192a09",
    anatomy: "mechanical-xenoborg-with-rigid-forward-turret-and-spurred-tail",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [968, 566], "tip": [977, 612]},
      {"id": "spine", "parent": "hips", "pivot": [998, 519], "tip": [991, 330]},
      {"id": "head", "parent": "spine", "pivot": [1108, 284], "tip": [1194, 233]},
      {"id": "piston", "parent": "spine", "pivot": [998, 386], "tip": [963, 445]},
      {"id": "weapon", "parent": "spine", "pivot": [1140, 540], "tip": [1401, 607]},
      {"id": "tailRoot", "parent": "hips", "pivot": [887, 579], "tip": [742, 659]},
      {"id": "tailSpurs", "parent": "tailRoot", "pivot": [519, 659], "tip": [268, 498]},
      {"id": "tailBlade", "parent": "tailSpurs", "pivot": [213, 394], "tip": [84, 221]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [819, 919]},
      "frontFoot": {"bone": "hips", "point": [1145, 924]},
      "spine": {"bone": "spine", "point": [991, 330]},
      "head": {"bone": "head", "point": [1194, 233]},
      "piston": {"bone": "piston", "point": [963, 445]},
      "tailSpurs": {"bone": "tailSpurs", "point": [268, 498]},
      "tailBlade": {"bone": "tailBlade", "point": [84, 221]}
    },
    poses: {
      "guard": {"spine": 1.55, "head": 4.3, "tailSpurs": 1.25},
      "hurt": {"spine": -2.45, "head": -5.25, "tailBlade": 1.4},
      "guard-break": {"spine": -3.5, "head": -5.5, "piston": 2.6, "tailSpurs": -1.4},
      "recover": {"spine": -3.5, "head": -5.5, "piston": 2.6, "tailSpurs": -1.4}
    }
  },
  {
    fighterId: "royal-guard",
    profileId: "castes-game_avp_capcom_royal_guard",
    sourceSha256: "f8678cd4d343ec643c79791258fc4d25540aba43de40fc4b20ae720818b04cd3",
    anatomy: "golden-royal-guard-with-long-crown-and-overlapping-forearm-spurs",
    bones: [
      {"id": "hips", "parent": null, "pivot": [882, 559], "tip": [887, 612]},
      {"id": "spine", "parent": "hips", "pivot": [908, 505], "tip": [908, 317]},
      {"id": "skull", "parent": "spine", "pivot": [1094, 247], "tip": [1257, 303]},
      {"id": "crown", "parent": "skull", "pivot": [1029, 214], "tip": [851, 110]},
      {"id": "nearArm", "parent": "spine", "pivot": [894, 335], "tip": [775, 438]},
      {"id": "foreSpur", "parent": "nearArm", "pivot": [822, 472], "tip": [991, 533]},
      {"id": "farArm", "parent": "spine", "pivot": [1078, 435], "tip": [1219, 514]},
      {"id": "farClaw", "parent": "farArm", "pivot": [1294, 493], "tip": [1345, 482]},
      {"id": "tailRoot", "parent": "hips", "pivot": [789, 568], "tip": [677, 649]},
      {"id": "tailHook", "parent": "tailRoot", "pivot": [461, 761], "tip": [165, 663]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [682, 959]},
      "frontFoot": {"bone": "hips", "point": [1133, 943]},
      "spine": {"bone": "spine", "point": [908, 317]},
      "skull": {"bone": "skull", "point": [1257, 303]},
      "crown": {"bone": "crown", "point": [851, 110]},
      "nearArm": {"bone": "nearArm", "point": [775, 438]},
      "foreSpur": {"bone": "foreSpur", "point": [991, 533]},
      "farArm": {"bone": "farArm", "point": [1219, 514]},
      "farClaw": {"bone": "farClaw", "point": [1345, 482]},
      "tailHook": {"bone": "tailHook", "point": [165, 663]}
    },
    poses: {
      "guard": {"spine": 1.85, "skull": 4.35, "foreSpur": -4.5, "farClaw": -3.3},
      "hurt": {"skull": -5.5, "crown": 1.4, "foreSpur": 2.5, "tailHook": 1.8},
      "guard-break": {"spine": -1.85, "skull": -4.15, "nearArm": 2.15, "farArm": 3.45, "tailHook": -1.4},
      "recover": {"spine": -1.85, "skull": -4.15, "nearArm": 2.15, "farArm": 3.45, "tailHook": -1.4}
    }
  },
  {
    fighterId: "boiler",
    profileId: "castes-game_acm_boiler",
    sourceSha256: "c1385916ec2e5bb3f1d6ff421f2a58850cb907697bdbcc7845d3b1f729f00ac1",
    anatomy: "boiler-with-luminous-cranial-vesicles-and-ribbed-spine-plates",
    bones: [
      {"id": "hips", "parent": null, "pivot": [980, 649], "tip": [952, 705]},
      {"id": "spine", "parent": "hips", "pivot": [1001, 612], "tip": [1152, 433]},
      {"id": "skull", "parent": "spine", "pivot": [1280, 389], "tip": [1452, 414]},
      {"id": "crownSacs", "parent": "skull", "pivot": [1250, 279], "tip": [1194, 200]},
      {"id": "dorsalSacs", "parent": "spine", "pivot": [1096, 279], "tip": [1108, 126]},
      {"id": "foreBrace", "parent": "spine", "pivot": [1047, 433], "tip": [1172, 534]},
      {"id": "tailRoot", "parent": "hips", "pivot": [884, 563], "tip": [768, 577]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [573, 642], "tip": [233, 666]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [726, 963]},
      "forwardFoot": {"bone": "hips", "point": [1187, 968]},
      "spine": {"bone": "spine", "point": [1152, 433]},
      "skull": {"bone": "skull", "point": [1452, 414]},
      "crownSacs": {"bone": "crownSacs", "point": [1194, 200]},
      "dorsalSacs": {"bone": "dorsalSacs", "point": [1108, 126]},
      "foreBrace": {"bone": "foreBrace", "point": [1172, 534]},
      "tailSweep": {"bone": "tailSweep", "point": [233, 666]}
    },
    poses: {
      "guard": {"spine": 1.8, "skull": 4.2, "crownSacs": -0.85, "foreBrace": -3.6},
      "hurt": {"skull": -5.65, "crownSacs": 1.6, "dorsalSacs": -2.7, "tailSweep": 1.5},
      "guard-break": {"spine": -3.1, "skull": -5.05, "dorsalSacs": 2.15, "foreBrace": 4.2, "tailSweep": -1.35},
      "recover": {"spine": -3.1, "skull": -5.05, "dorsalSacs": 2.15, "foreBrace": 4.2, "tailSweep": -1.35}
    }
  },
  {
    fighterId: "stalker-arcade",
    profileId: "castes-game_avp_capcom_stalker",
    sourceSha256: "e1e4fd52067a1d69b170935855f21ed6f38686fed8804c890bb961c67d6e5ad7",
    anatomy: "arcade-stalker-with-bright-pearl-crown-and-jointed-forward-claws",
    bones: [
      {"id": "hips", "parent": null, "pivot": [803, 503], "tip": [794, 563]},
      {"id": "spine", "parent": "hips", "pivot": [791, 472], "tip": [943, 291]},
      {"id": "head", "parent": "spine", "pivot": [1082, 244], "tip": [1343, 277]},
      {"id": "crown", "parent": "head", "pivot": [1050, 182], "tip": [980, 109]},
      {"id": "shoulder", "parent": "spine", "pivot": [945, 270], "tip": [952, 372]},
      {"id": "longClaw", "parent": "shoulder", "pivot": [977, 428], "tip": [1180, 524]},
      {"id": "farClaw", "parent": "spine", "pivot": [1119, 454], "tip": [1359, 456]},
      {"id": "tailRoot", "parent": "hips", "pivot": [768, 458], "tip": [673, 563]},
      {"id": "tailArc", "parent": "tailRoot", "pivot": [417, 628], "tip": [261, 556]},
      {"id": "tailTip", "parent": "tailArc", "pivot": [219, 449], "tip": [119, 289]}
    ],
    contacts: {
      "rearFoot": {"bone": "hips", "point": [733, 903]},
      "forwardFoot": {"bone": "hips", "point": [1082, 931]},
      "spine": {"bone": "spine", "point": [943, 291]},
      "head": {"bone": "head", "point": [1343, 277]},
      "crown": {"bone": "crown", "point": [980, 109]},
      "shoulder": {"bone": "shoulder", "point": [952, 372]},
      "longClaw": {"bone": "longClaw", "point": [1180, 524]},
      "farClaw": {"bone": "farClaw", "point": [1359, 456]},
      "tailArc": {"bone": "tailArc", "point": [261, 556]},
      "tailTip": {"bone": "tailTip", "point": [119, 289]}
    },
    poses: {
      "guard": {"spine": 1.5, "head": 4.2, "longClaw": -3.65, "farClaw": -2.25},
      "hurt": {"head": -5.15, "crown": 1.2, "longClaw": 3.8, "tailTip": 1.5},
      "guard-break": {"spine": -2.7, "head": -5.3, "shoulder": 2.6, "longClaw": 3.1, "farClaw": 4.05, "tailArc": -1.2},
      "recover": {"spine": -2.7, "head": -5.3, "shoulder": 2.6, "longClaw": 3.1, "farClaw": 4.05, "tailArc": -1.2}
    }
  },
  {
    fighterId: "gorilla",
    profileId: "pose-v94-kenner-gorilla",
    sourceSha256: "c91b539cebeb76fd69ac39ef5c9966166584a45f8a51a064c09a7306d54f4685",
    anatomy: "frontal-heavy-gorilla-with-pillar-crown-and-massive-forearm-shields",
    bones: [
      {"id": "hips", "parent": null, "pivot": [798, 744], "tip": [798, 807]},
      {"id": "spine", "parent": "hips", "pivot": [807, 698], "tip": [841, 522]},
      {"id": "head", "parent": "spine", "pivot": [864, 453], "tip": [866, 160]},
      {"id": "crownFlange", "parent": "head", "pivot": [929, 351], "tip": [983, 217]},
      {"id": "leftShoulder", "parent": "spine", "pivot": [673, 456], "tip": [539, 567]},
      {"id": "leftGauntlet", "parent": "leftShoulder", "pivot": [522, 647], "tip": [513, 898]},
      {"id": "rightShoulder", "parent": "spine", "pivot": [1009, 536], "tip": [1023, 695]},
      {"id": "rightGauntlet", "parent": "rightShoulder", "pivot": [1015, 761], "tip": [1017, 1037]},
      {"id": "tailRoot", "parent": "hips", "pivot": [732, 838], "tip": [673, 1003]},
      {"id": "tailTip", "parent": "tailRoot", "pivot": [365, 963], "tip": [202, 704]}
    ],
    contacts: {
      "leftToe": {"bone": "hips", "point": [587, 1203]},
      "rightToe": {"bone": "hips", "point": [1032, 1211]},
      "foreSupport": {"bone": "hips", "point": [1043, 1086]},
      "spine": {"bone": "spine", "point": [841, 522]},
      "head": {"bone": "head", "point": [866, 160]},
      "crownFlange": {"bone": "crownFlange", "point": [983, 217]},
      "leftShoulder": {"bone": "leftShoulder", "point": [539, 567]},
      "leftGauntlet": {"bone": "leftGauntlet", "point": [513, 898]},
      "rightShoulder": {"bone": "rightShoulder", "point": [1023, 695]},
      "rightGauntlet": {"bone": "rightGauntlet", "point": [1017, 1037]},
      "tailTip": {"bone": "tailTip", "point": [202, 704]}
    },
    poses: {
      "guard": {"head": 3.7, "crownFlange": -1.25, "leftGauntlet": -4.7, "rightGauntlet": 1.6},
      "hurt": {"head": -4.95, "leftShoulder": 2.3, "rightGauntlet": -2.65, "tailTip": 1.4},
      "guard-break": {"spine": -2.35, "head": -5.55, "leftGauntlet": 4.1, "rightShoulder": -2.9, "tailTip": -1.15},
      "recover": {"spine": -2.35, "head": -5.55, "leftGauntlet": 4.1, "rightShoulder": -2.9, "tailTip": -1.15}
    }
  },
  {
    fighterId: "rhino",
    profileId: "pose-v94-kenner-rhino",
    sourceSha256: "056cff7c33e15760ea867185dba4228542eabc291328034d40246589180e7ce8",
    anatomy: "rhino-sweeping-horns-with-forward-brace-and-red-ribbed-carapace",
    bones: [
      {"id": "hips", "parent": null, "pivot": [920, 721], "tip": [923, 792]},
      {"id": "spine", "parent": "hips", "pivot": [884, 671], "tip": [647, 524]},
      {"id": "head", "parent": "spine", "pivot": [426, 535], "tip": [276, 603]},
      {"id": "frontHorn", "parent": "head", "pivot": [311, 573], "tip": [147, 570]},
      {"id": "crownSpurs", "parent": "head", "pivot": [557, 401], "tip": [510, 246]},
      {"id": "nearShoulder", "parent": "spine", "pivot": [592, 530], "tip": [573, 710]},
      {"id": "extendedClaw", "parent": "nearShoulder", "pivot": [431, 715], "tip": [177, 865]},
      {"id": "tailRoot", "parent": "hips", "pivot": [994, 625], "tip": [1144, 644]},
      {"id": "tailPoint", "parent": "tailRoot", "pivot": [1177, 667], "tip": [1269, 661]}
    ],
    contacts: {
      "leftFore": {"bone": "hips", "point": [333, 1021]},
      "rightFore": {"bone": "hips", "point": [631, 1081]},
      "rearPad": {"bone": "hips", "point": [1176, 1056]},
      "spine": {"bone": "spine", "point": [647, 524]},
      "head": {"bone": "head", "point": [276, 603]},
      "frontHorn": {"bone": "frontHorn", "point": [147, 570]},
      "crownSpurs": {"bone": "crownSpurs", "point": [510, 246]},
      "nearShoulder": {"bone": "nearShoulder", "point": [573, 710]},
      "extendedClaw": {"bone": "extendedClaw", "point": [177, 865]},
      "tailPoint": {"bone": "tailPoint", "point": [1269, 661]}
    },
    poses: {
      "guard": {"spine": -1.75, "head": -4.1, "frontHorn": -1.45, "extendedClaw": 2.7},
      "hurt": {"head": 4.05, "crownSpurs": -1.1, "nearShoulder": 2.1, "tailPoint": -1.6},
      "guard-break": {"spine": 1.65, "head": 3.85, "frontHorn": 1.15, "extendedClaw": -3.4, "tailPoint": 1.65},
      "recover": {"spine": 1.65, "head": 3.85, "frontHorn": 1.15, "extendedClaw": -3.4, "tailPoint": 1.65}
    }
  },
  {
    fighterId: "panther",
    profileId: "pose-v94-kenner-panther",
    sourceSha256: "575f23d532b10eb34f2dd0df9e8a860e1511cdecf4e7ab20eb5fa7742acc549c",
    anatomy: "low-panther-with-raised-looped-tail-and-broad-red-brow",
    bones: [
      {"id": "hips", "parent": null, "pivot": [505, 726], "tip": [516, 792]},
      {"id": "spine", "parent": "hips", "pivot": [521, 693], "tip": [759, 691]},
      {"id": "head", "parent": "spine", "pivot": [994, 622], "tip": [1152, 693]},
      {"id": "crown", "parent": "head", "pivot": [1024, 549], "tip": [920, 508]},
      {"id": "nearShoulder", "parent": "spine", "pivot": [770, 699], "tip": [674, 813]},
      {"id": "frontBrace", "parent": "nearShoulder", "pivot": [622, 860], "tip": [708, 1059]},
      {"id": "farBrace", "parent": "spine", "pivot": [887, 846], "tip": [983, 1002]},
      {"id": "tailRoot", "parent": "hips", "pivot": [502, 652], "tip": [379, 516]},
      {"id": "tailLoop", "parent": "tailRoot", "pivot": [347, 344], "tip": [407, 139]},
      {"id": "tailBlade", "parent": "tailLoop", "pivot": [442, 341], "tip": [600, 439]}
    ],
    contacts: {
      "rearFar": {"bone": "hips", "point": [199, 974]},
      "rearNear": {"bone": "hips", "point": [445, 939]},
      "frontNear": {"bone": "hips", "point": [762, 1097]},
      "frontFar": {"bone": "hips", "point": [1059, 1048]},
      "spine": {"bone": "spine", "point": [759, 691]},
      "head": {"bone": "head", "point": [1152, 693]},
      "crown": {"bone": "crown", "point": [920, 508]},
      "nearShoulder": {"bone": "nearShoulder", "point": [674, 813]},
      "frontBrace": {"bone": "frontBrace", "point": [708, 1059]},
      "farBrace": {"bone": "farBrace", "point": [983, 1002]},
      "tailLoop": {"bone": "tailLoop", "point": [407, 139]},
      "tailBlade": {"bone": "tailBlade", "point": [600, 439]}
    },
    poses: {
      "guard": {"spine": 1.4, "head": 4.3, "crown": 0.9, "frontBrace": -3.15, "tailBlade": -0.95},
      "hurt": {"head": -4.75, "crown": -1.2, "nearShoulder": 2.15, "tailLoop": 1.45},
      "guard-break": {"spine": -1.65, "head": -3.85, "frontBrace": 3.6, "farBrace": 1.95, "tailBlade": 1.45},
      "recover": {"spine": -1.65, "head": -3.85, "frontBrace": 3.6, "farBrace": 1.95, "tailBlade": 1.45}
    }
  },
  {
    fighterId: "mantis",
    profileId: "pose-v96-kenner-mantis",
    sourceSha256: "d84bcb3069b7eb0119fb627a6f5aef5eb60da3478b3e18a9d254a4302a564ef7",
    anatomy: "mantis-with-rigid-scythe-edges-and-segmented-green-cephalic-armour",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [458, 653], "tip": [481, 709]},
      {"id": "spine", "parent": "hips", "pivot": [478, 609], "tip": [685, 423]},
      {"id": "head", "parent": "spine", "pivot": [863, 350], "tip": [1029, 344]},
      {"id": "crest", "parent": "head", "pivot": [808, 222], "tip": [665, 44]},
      {"id": "dorsalHooks", "parent": "spine", "pivot": [627, 399], "tip": [499, 260]},
      {"id": "armShield", "parent": "spine", "pivot": [706, 437], "tip": [717, 595]},
      {"id": "tailRoot", "parent": "hips", "pivot": [394, 589], "tip": [225, 598]},
      {"id": "tailLoop", "parent": "tailRoot", "pivot": [90, 484], "tip": [47, 268]}
    ],
    contacts: {
      "rearHook": {"bone": "hips", "point": [391, 1152]},
      "frontHook": {"bone": "hips", "point": [726, 1088]},
      "spine": {"bone": "spine", "point": [685, 423]},
      "head": {"bone": "head", "point": [1029, 344]},
      "crest": {"bone": "crest", "point": [665, 44]},
      "dorsalHooks": {"bone": "dorsalHooks", "point": [499, 260]},
      "armShield": {"bone": "armShield", "point": [717, 595]},
      "tailLoop": {"bone": "tailLoop", "point": [47, 268]}
    },
    poses: {
      "guard": {"spine": -0.45, "head": -2.15, "crest": 3.6, "dorsalHooks": -2.25, "tailLoop": -0.8},
      "hurt": {"head": -5.7, "crest": 1.45, "tailLoop": 1.25},
      "guard-break": {"spine": -2.55, "head": -5.25, "crest": 1.4, "armShield": 2.55, "tailLoop": -1.45},
      "recover": {"spine": -2.55, "head": -5.25, "crest": 1.4, "armShield": 2.55, "tailLoop": -1.45}
    }
  },
  {
    fighterId: "synth-sniper",
    profileId: "pose-v94-afe-synth-sniper",
    sourceSha256: "6541a21be18321c71b2e8e2a8b76f5ac7e58581babe5e190a3dcde6247f5977b",
    anatomy: "relay-sniper-with-fixed-sidearm-and-free-balancing-forearm",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [534, 775], "tip": [545, 859]},
      {"id": "spine", "parent": "hips", "pivot": [531, 705], "tip": [520, 381]},
      {"id": "head", "parent": "spine", "pivot": [524, 276], "tip": [573, 175]},
      {"id": "rightShoulder", "parent": "spine", "pivot": [691, 401], "tip": [765, 586]},
      {"id": "rightGlove", "parent": "rightShoulder", "pivot": [785, 663], "tip": [810, 806]},
      {"id": "sidearm", "parent": "spine", "pivot": [314, 234], "tip": [405, 91]}
    ],
    contacts: {
      "leftBoot": {"bone": "hips", "point": [412, 1400]},
      "rightBoot": {"bone": "hips", "point": [761, 1403]},
      "spine": {"bone": "spine", "point": [520, 381]},
      "head": {"bone": "head", "point": [573, 175]},
      "rightShoulder": {"bone": "rightShoulder", "point": [765, 586]},
      "rightGlove": {"bone": "rightGlove", "point": [810, 806]}
    },
    poses: {
      "guard": {"spine": 1.4, "head": 4.8, "rightShoulder": -2.15, "rightGlove": -2.6},
      "hurt": {"spine": -2.25, "head": -5.4, "rightShoulder": 3.1},
      "guard-break": {"spine": -3.15, "head": -5.75, "rightShoulder": 3.3, "rightGlove": 2},
      "recover": {"spine": -3.15, "head": -5.75, "rightShoulder": 3.3, "rightGlove": 2}
    }
  },
  {
    fighterId: "synth-heavy",
    profileId: "pose-v94-afe-synth-heavy",
    sourceSha256: "71a4ad45aafe454e33eb7a90a9f4574b59c731fe9406f19a5382987a6a9d5a4d",
    anatomy: "heavy-rifle-synthetic-with-rigid-carry-block-and-sealed-helmet",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [401, 782], "tip": [401, 862]},
      {"id": "spine", "parent": "hips", "pivot": [408, 705], "tip": [391, 422]},
      {"id": "helmet", "parent": "spine", "pivot": [440, 304], "tip": [478, 216]},
      {"id": "nearShoulder", "parent": "spine", "pivot": [213, 387], "tip": [150, 576]},
      {"id": "nearGlove", "parent": "nearShoulder", "pivot": [185, 597], "tip": [276, 621]},
      {"id": "rifle", "parent": "spine", "pivot": [576, 394], "tip": [890, 126]}
    ],
    contacts: {
      "frontBoot": {"bone": "hips", "point": [688, 1379]},
      "rearBoot": {"bone": "hips", "point": [171, 1382]},
      "spine": {"bone": "spine", "point": [391, 422]},
      "helmet": {"bone": "helmet", "point": [478, 216]},
      "nearShoulder": {"bone": "nearShoulder", "point": [150, 576]},
      "nearGlove": {"bone": "nearGlove", "point": [276, 621]}
    },
    poses: {
      "guard": {"spine": 1.55, "helmet": 4.25, "nearShoulder": -1.7},
      "hurt": {"spine": -2.1, "helmet": -5.2, "nearShoulder": 2.8},
      "guard-break": {"spine": -3.5, "helmet": -5.45, "nearShoulder": 3.2, "nearGlove": 1.4},
      "recover": {"spine": -3.5, "helmet": -5.45, "nearShoulder": 3.2, "nearGlove": 1.4}
    }
  },
  {
    fighterId: "import-engineer-respirator",
    profileId: "pose-v106-import-engineer-respirator",
    sourceSha256: "f28aaede973fe09efba81c2ed631587f41999741fb1366c80f3f65fec584a97d",
    anatomy: "respirator-engineer-with-carapace-shoulders-and-double-thick-gloves",
    bones: [
      {"id": "hips", "parent": null, "pivot": [507, 761], "tip": [504, 830]},
      {"id": "spine", "parent": "hips", "pivot": [517, 685], "tip": [507, 379]},
      {"id": "mask", "parent": "spine", "pivot": [537, 254], "tip": [583, 188]},
      {"id": "collar", "parent": "spine", "pivot": [487, 287], "tip": [402, 273]},
      {"id": "nearShoulder", "parent": "spine", "pivot": [412, 319], "tip": [336, 487]},
      {"id": "nearGlove", "parent": "nearShoulder", "pivot": [349, 573], "tip": [418, 761]},
      {"id": "farGlove", "parent": "spine", "pivot": [639, 599], "tip": [711, 748]}
    ],
    contacts: {
      "nearHeel": {"bone": "hips", "point": [402, 1373]},
      "farHeel": {"bone": "hips", "point": [613, 1327]},
      "spine": {"bone": "spine", "point": [507, 379]},
      "mask": {"bone": "mask", "point": [583, 188]},
      "collar": {"bone": "collar", "point": [402, 273]},
      "nearShoulder": {"bone": "nearShoulder", "point": [336, 487]},
      "nearGlove": {"bone": "nearGlove", "point": [418, 761]},
      "farGlove": {"bone": "farGlove", "point": [711, 748]}
    },
    poses: {
      "guard": {"spine": 1.45, "mask": 4.4, "nearGlove": -4.7, "farGlove": -2.6},
      "hurt": {"spine": -1.7, "mask": -5.4, "nearShoulder": 2.05, "collar": -0.9},
      "guard-break": {"spine": -2.85, "mask": -5.95, "nearGlove": 3.7, "farGlove": 3.4},
      "recover": {"spine": -2.85, "mask": -5.95, "nearGlove": 3.7, "farGlove": 3.4}
    }
  },
  {
    fighterId: "import-game-afe2-bulwark",
    profileId: "pose-v106-import-game-afe2-bulwark",
    sourceSha256: "4841d54ff6e1e7b98c06d4496f1f7fb188a5e981eb835ce67e7a97dd36c9966b",
    anatomy: "tracked-bulwark-with-twin-shields-linked-platform-and-three-visible-drive-feet",
    preserveRigidRegions: true,
    bones: [
      {"id": "hips", "parent": null, "pivot": [915, 549], "tip": [936, 593]},
      {"id": "platform", "parent": "hips", "pivot": [898, 519], "tip": [854, 337]},
      {"id": "rearChassis", "parent": "platform", "pivot": [996, 428], "tip": [1105, 493]},
      {"id": "forwardArm", "parent": "platform", "pivot": [777, 468], "tip": [489, 442]},
      {"id": "nearShield", "parent": "forwardArm", "pivot": [498, 386], "tip": [184, 126]},
      {"id": "farShield", "parent": "platform", "pivot": [752, 351], "tip": [510, 91]},
      {"id": "farKnee", "parent": "hips", "pivot": [714, 740], "tip": [610, 717]},
      {"id": "nearKnee", "parent": "hips", "pivot": [1061, 740], "tip": [1215, 642]}
    ],
    contacts: {
      "frontPad": {"bone": "hips", "point": [435, 959]},
      "centerPad": {"bone": "hips", "point": [1043, 931]},
      "rearPad": {"bone": "hips", "point": [1347, 968]},
      "platform": {"bone": "platform", "point": [854, 337]},
      "rearChassis": {"bone": "rearChassis", "point": [1105, 493]},
      "farKnee": {"bone": "farKnee", "point": [610, 717]},
      "nearKnee": {"bone": "nearKnee", "point": [1215, 642]}
    },
    poses: {
      "guard": {"platform": -2.1, "rearChassis": -0.9, "farKnee": 1.2},
      "hurt": {"platform": 2.65, "rearChassis": 1.05, "nearKnee": 1.8},
      "guard-break": {"platform": 3.8, "farKnee": 1.8, "nearKnee": -2.2},
      "recover": {"platform": 3.8, "farKnee": 1.8, "nearKnee": -2.2}
    }
  },
  {
    fighterId: "import-game-afe2-exploder",
    profileId: "pose-v106-import-game-afe2-exploder",
    sourceSha256: "54719bf217e334ec6446c7bf0d762252d5d7216cbca17a8b95eadc8a242d4cb5",
    anatomy: "exploder-with-forehead-globes-armoured-sacks-and-arched-tail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [859, 511], "tip": [896, 564]},
      {"id": "spine", "parent": "hips", "pivot": [818, 466], "tip": [526, 428]},
      {"id": "head", "parent": "spine", "pivot": [322, 368], "tip": [108, 400]},
      {"id": "facialSacs", "parent": "head", "pivot": [262, 350], "tip": [295, 290]},
      {"id": "dorsalSacs", "parent": "spine", "pivot": [509, 322], "tip": [514, 179]},
      {"id": "foreBrace", "parent": "spine", "pivot": [569, 556], "tip": [521, 728]},
      {"id": "tailRoot", "parent": "hips", "pivot": [917, 307], "tip": [1148, 379]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [1279, 466], "tip": [1521, 458]},
      {"id": "tailTip", "parent": "tailSweep", "pivot": [1612, 358], "tip": [1647, 254]}
    ],
    contacts: {
      "frontFar": {"bone": "hips", "point": [126, 821]},
      "frontNear": {"bone": "hips", "point": [451, 836]},
      "rearFar": {"bone": "hips", "point": [755, 826]},
      "rearNear": {"bone": "hips", "point": [1257, 836]},
      "spine": {"bone": "spine", "point": [526, 428]},
      "head": {"bone": "head", "point": [108, 400]},
      "facialSacs": {"bone": "facialSacs", "point": [295, 290]},
      "dorsalSacs": {"bone": "dorsalSacs", "point": [514, 179]},
      "foreBrace": {"bone": "foreBrace", "point": [521, 728]},
      "tailSweep": {"bone": "tailSweep", "point": [1521, 458]},
      "tailTip": {"bone": "tailTip", "point": [1647, 254]}
    },
    poses: {
      "guard": {"spine": -1.45, "head": -4.3, "facialSacs": -1.15, "foreBrace": 2.85},
      "hurt": {"head": 5.3, "dorsalSacs": -2.2, "tailSweep": 1.55},
      "guard-break": {"spine": 2.6, "head": 5.6, "dorsalSacs": -1.55, "foreBrace": -3.7, "tailTip": -1.5},
      "recover": {"spine": 2.6, "head": 5.6, "dorsalSacs": -1.55, "foreBrace": -3.7, "tailTip": -1.5}
    }
  },
  {
    fighterId: "import-game-afe2-harbinger",
    profileId: "pose-v106-import-game-afe2-harbinger",
    sourceSha256: "b4075997666e8ac06a1bae21f62f11ff6813218e7208c7e2d8946fe0316259f4",
    anatomy: "harbinger-with-lateral-jaw-and-six-hooked-armatures",
    bones: [
      {"id": "hips", "parent": null, "pivot": [647, 555], "tip": [671, 610]},
      {"id": "spine", "parent": "hips", "pivot": [639, 511], "tip": [521, 296]},
      {"id": "jaws", "parent": "spine", "pivot": [501, 301], "tip": [444, 215]},
      {"id": "topLeft", "parent": "spine", "pivot": [425, 163], "tip": [237, 86]},
      {"id": "topRight", "parent": "spine", "pivot": [573, 175], "tip": [874, 131]},
      {"id": "midLeft", "parent": "spine", "pivot": [444, 336], "tip": [197, 368]},
      {"id": "midRight", "parent": "spine", "pivot": [595, 306], "tip": [950, 417]},
      {"id": "lowLeft", "parent": "spine", "pivot": [521, 425], "tip": [262, 548]},
      {"id": "lowRight", "parent": "spine", "pivot": [580, 412], "tip": [908, 595]},
      {"id": "tailRoot", "parent": "hips", "pivot": [708, 612], "tip": [795, 713]},
      {"id": "tailTip", "parent": "tailRoot", "pivot": [1034, 829], "tip": [1340, 861]}
    ],
    contacts: {
      "leftTalons": {"bone": "hips", "point": [407, 1000]},
      "rightTalons": {"bone": "hips", "point": [1051, 1007]},
      "spine": {"bone": "spine", "point": [521, 296]},
      "jaws": {"bone": "jaws", "point": [444, 215]},
      "topLeft": {"bone": "topLeft", "point": [237, 86]},
      "topRight": {"bone": "topRight", "point": [874, 131]},
      "midLeft": {"bone": "midLeft", "point": [197, 368]},
      "midRight": {"bone": "midRight", "point": [950, 417]},
      "lowLeft": {"bone": "lowLeft", "point": [262, 548]},
      "lowRight": {"bone": "lowRight", "point": [908, 595]},
      "tailTip": {"bone": "tailTip", "point": [1340, 861]}
    },
    poses: {
      "guard": {"jaws": -4.45, "topLeft": -2.1, "topRight": 1.6, "midLeft": -3.7, "midRight": 3.55, "lowRight": 2.5},
      "hurt": {"spine": 2.35, "jaws": 4.25, "topLeft": 3.1, "midRight": -2.6, "lowLeft": 3.1},
      "guard-break": {"spine": 2.85, "jaws": 5.15, "topRight": -2.7, "midLeft": 3.1, "lowRight": -3.2, "tailTip": 1.55},
      "recover": {"spine": 2.85, "jaws": 5.15, "topRight": -2.7, "midLeft": 3.1, "lowRight": -3.2, "tailTip": 1.55}
    }
  },
  {
    fighterId: "drive-v123-creature-romulus-offspring",
    profileId: "pose-v123-drive-creature-romulus-offspring",
    sourceSha256: "56e0a9200983dff0591fdd3dd9bce0d48d70c7b6f69f9720166ed21186e60eaf",
    anatomy: "pale-upright-offspring-with-long-neck-and-a-thin-countertail",
    bones: [
      {"id": "hips", "parent": null, "pivot": [973, 403], "tip": [973, 449]},
      {"id": "spine", "parent": "hips", "pivot": [977, 356], "tip": [975, 195]},
      {"id": "neck", "parent": "spine", "pivot": [998, 182], "tip": [1010, 107]},
      {"id": "head", "parent": "neck", "pivot": [1008, 84], "tip": [1061, 77]},
      {"id": "nearArm", "parent": "spine", "pivot": [968, 191], "tip": [966, 335]},
      {"id": "nearHand", "parent": "nearArm", "pivot": [998, 431], "tip": [1022, 584]},
      {"id": "farHand", "parent": "spine", "pivot": [1036, 426], "tip": [1073, 579]},
      {"id": "tailRoot", "parent": "hips", "pivot": [922, 438], "tip": [882, 552]},
      {"id": "tailSweep", "parent": "tailRoot", "pivot": [800, 672], "tip": [647, 756]},
      {"id": "tailTip", "parent": "tailSweep", "pivot": [391, 789], "tip": [266, 739]}
    ],
    contacts: {
      "nearHeel": {"bone": "hips", "point": [961, 954]},
      "forwardToe": {"bone": "hips", "point": [1050, 984]},
      "spine": {"bone": "spine", "point": [975, 195]},
      "neck": {"bone": "neck", "point": [1010, 107]},
      "head": {"bone": "head", "point": [1061, 77]},
      "nearArm": {"bone": "nearArm", "point": [966, 335]},
      "nearHand": {"bone": "nearHand", "point": [1022, 584]},
      "farHand": {"bone": "farHand", "point": [1073, 579]},
      "tailSweep": {"bone": "tailSweep", "point": [647, 756]},
      "tailTip": {"bone": "tailTip", "point": [266, 739]}
    },
    poses: {
      "guard": {"spine": 1.8, "neck": 1.55, "head": 4.5, "nearHand": -3.6, "farHand": -2.1},
      "hurt": {"spine": -2.45, "head": -5.3, "nearArm": 2.2, "tailSweep": 1.2},
      "guard-break": {"spine": -3.45, "neck": -1.4, "head": -6, "nearHand": 3.65, "farHand": 2.75, "tailTip": 1.35},
      "recover": {"spine": -3.45, "neck": -1.4, "head": -6, "nearHand": 3.65, "farHand": 2.75, "tailTip": 1.35}
    }
  }
];
