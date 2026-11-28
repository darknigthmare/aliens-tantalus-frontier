import { ENEMY_DISPLAY_ALPHA_V110 } from './enemy-display-alpha-v110.js';

const width = 1774, height = 887;
const artPath = '/assets/user/castes-v87/game_avp_capcom_arachnoid.png';
const poseFrame = ([phase, path, bounds, rootX, textureWidth, textureHeight]) => Object.freeze({
  phase, path, bounds: Object.freeze(bounds), rootX, textureWidth, textureHeight
});
const heavyFrames = [
  ['windup', '/assets/openai/xeno-trials-v209/characters/arachnoid-heavy-windup.png', [138, 18, 1658, 872], 1004],
  ['contact', '/assets/openai/xeno-trials-v209/characters/arachnoid-heavy-impact.png', [124, 15, 1675, 834], 986],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/arachnoid-heavy-recovery.png', [275, 17, 1393, 851], 900],
].map(poseFrame);
// Carry the shoulder-to-pivot offset of the neutral plate across the three grounded keys.
const arachnoidPounceFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/arachnoid-special-windup.png', [129, 65, 1319, 981], 905],
  ['contact', '/assets/openai/xeno-trials-v209/characters/arachnoid-special-active-grounded.png', [28, 243, 1737, 772], 1189, 1774, 887],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/arachnoid-special-recovery.png', [172, 45, 1347, 980], 860]
].map(poseFrame));
const pantherFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/panther-special-windup.png', [82, 58, 1478, 952], 790],
  ['contact', '/assets/openai/xeno-trials-v209/characters/panther-special-active.png', [50, 56, 1504, 956], 780],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/panther-special-recovery.png', [89, 51, 1445, 980], 780]
].map(poseFrame));
const gridFrames = Object.freeze([
  poseFrame(['windup', '/assets/openai/xeno-trials-v209/characters/grid-heavy-windup-v226.png', [25, 54, 1627, 851], 1259]),
  // Keep the rightmost claw with its existing 9-pixel source margin.
  poseFrame(['contact', '/assets/openai/xeno-trials-v209/characters/grid-heavy-impact.png', [17, 51, 1765, 860], 1176]),
  poseFrame(['recovery', '/assets/openai/xeno-trials-v209/characters/grid-heavy-recovery.png', [157, 39, 1462, 847], 1175])
]);
const gridTailFrames = Object.freeze([
  // Keep the pivot about 60 pixels ahead of the painted shoulder in each phase.
  poseFrame(['windup', '/assets/openai/xeno-trials-v209/characters/grid-special-windup.png', [231, 21, 1657, 822], 1224]),
  poseFrame(['contact', '/assets/openai/xeno-trials-v209/characters/grid-special-contact.png', [115, 57, 1684, 844], 985]),
  poseFrame(['recovery', '/assets/openai/xeno-trials-v209/characters/grid-special-recovery.png', [307, 48, 1495, 823], 1167])
]);
const gorillaFrames = Object.freeze([
  // Match the chest axis of the neutral plate, using the same crest length to retain scale.
  poseFrame(['windup', '/assets/openai/xeno-trials-v209/characters/gorilla-special-windup.png', [69, 166, 1188, 1089], 804]),
  poseFrame(['contact', '/assets/openai/xeno-trials-v209/characters/gorilla-special-active-four-spines.png', [27, 220, 1244, 1057], 762]),
  poseFrame(['recovery', '/assets/openai/xeno-trials-v209/characters/gorilla-special-recovery.png', [44, 116, 1194, 1033], 794])
]);
const gorillaHeavyFrames = Object.freeze([
  // Retain the neutral 35-pixel offset ahead of the painted chest axis.
  poseFrame(['windup', '/assets/openai/xeno-trials-v209/characters/gorilla-heavy-windup-four-spines.png', [147, 16, 983, 1229], 750]),
  poseFrame(['contact', '/assets/openai/xeno-trials-v209/characters/gorilla-heavy-impact-four-spines.png', [12, 106, 1243, 1138], 670]),
  poseFrame(['recovery', '/assets/openai/xeno-trials-v209/characters/gorilla-heavy-recovery-four-spines.png', [16, 188, 1150, 1124], 751])
]);
const arachnoidLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/arachnoid-light-windup.png', [148, 25, 1368, 1006], 865],
  ['contact', '/assets/openai/xeno-trials-v209/characters/arachnoid-light-impact.png', [83, 119, 1700, 829], 1101, 1774, 887],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/arachnoid-light-recovery.png', [219, 19, 1302, 1009], 898]
].map(poseFrame));
const pantherLightFrames = Object.freeze([
  poseFrame(['windup', '/assets/openai/xeno-trials-v209/characters/panther-light-windup.png', [109, 45, 1341, 932], 716]),
  poseFrame(['contact', '/assets/openai/xeno-trials-v209/characters/panther-light-contact.png', [53, 22, 1490, 928], 731]),
  poseFrame(['recovery', '/assets/openai/xeno-trials-v209/characters/panther-light-recovery.png', [168, 32, 1428, 982], 801])
]);
const gorillaLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/gorilla-light-windup.png', [26, 50, 1191, 1194], 674],
  ['contact', '/assets/openai/xeno-trials-v209/characters/gorilla-light-contact.png', [15, 185, 1244, 1125], 609],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/gorilla-light-recovery.png', [20, 153, 1233, 1144], 687]
].map(poseFrame));
const gridLightFrames = Object.freeze([
  poseFrame(['windup', '/assets/openai/xeno-trials-v209/characters/grid-light-windup.png', [164, 18, 1545, 874], 1124]),
  poseFrame(['contact', '/assets/openai/xeno-trials-v209/characters/grid-light-contact.png', [110, 11, 1760, 873], 1136]),
  null
]);
const pantherHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/panther-heavy-windup.png', [110, 12, 1325, 990], 715],
  ['contact', '/assets/openai/xeno-trials-v209/characters/panther-heavy-contact.png', [76, 39, 1468, 951], 691],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/panther-heavy-recovery.png', [94, 42, 1478, 964], 702]
].map(poseFrame));
const warriorHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/warrior-heavy-windup-v227.png', [40, 76, 1456, 962], 1113],
  ['contact', '/assets/openai/xeno-trials-v209/characters/warrior-heavy-contact-v227.png', [40, 29, 1499, 990], 997],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/warrior-heavy-recovery-v227.png', [64, 22, 1466, 992], 1092]
].map(poseFrame));
const runnerHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/runner-heavy-windup-v227.png', [42, 287, 1501, 815], 1097],
  ['contact', '/assets/openai/xeno-trials-v209/characters/runner-heavy-contact-v227.png', [34, 284, 1506, 750], 1034],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/runner-heavy-recovery-v227.png', [52, 224, 1474, 819], 1098]
].map(poseFrame));
const queenLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/queen-light-windup-v227.png', [21, 27, 1519, 997], 1083],
  ['contact', '/assets/openai/xeno-trials-v209/characters/queen-light-contact-v227.png', [21, 19, 1523, 994], 1082],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/queen-light-recovery-v227.png', [20, 23, 1522, 992], 1081]
].map(poseFrame));
const rhinoLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/rhino-light-windup-v228.png', [35, 89, 1502, 924], 723],
  ['contact', '/assets/openai/xeno-trials-v209/characters/rhino-light-contact-v228.png', [9, 24, 1525, 933], 642],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/rhino-light-recovery-v228.png', [37, 82, 1501, 931], 741]
].map(poseFrame));
const rhinoHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/rhino-heavy-windup-v228.png', [35, 79, 1502, 923], 691],
  ['contact', '/assets/openai/xeno-trials-v209/characters/rhino-heavy-contact-v228.png', [37, 92, 1501, 907], 584],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/rhino-heavy-recovery-v228.png', [28, 36, 1495, 939], 590]
].map(poseFrame));
const mantisLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/mantis-light-windup-v228.png', [34, 108, 1208, 1173], 657],
  ['contact', '/assets/openai/xeno-trials-v209/characters/mantis-light-contact-v228.png', [34, 8, 1193, 1240], 621, 1219, 1290],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/mantis-light-recovery-v228.png', [26, 81, 1226, 1150], 691]
].map(poseFrame));
const mantisHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/mantis-heavy-atlas-v228.png', [157, 19, 588, 465], 374],
  ['contact', '/assets/openai/xeno-trials-v209/characters/mantis-heavy-atlas-v228.png', [842, 35, 1423, 465], 1112],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/mantis-heavy-atlas-v228.png', [163, 529, 595, 999], 411]
].map(poseFrame));
const armoredJoeLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/armored-joe-light-atlas-v228.png', [248, 18, 522, 477], 364],
  ['contact', '/assets/openai/xeno-trials-v209/characters/armored-joe-light-atlas-v228.png', [943, 18, 1298, 477], 1062],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/armored-joe-light-atlas-v228.png', [247, 533, 525, 993], 355]
].map(poseFrame));
const armoredJoeHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/armored-joe-heavy-atlas-v228.png', [32, 113, 476, 920], 238],
  ['contact', '/assets/openai/xeno-trials-v209/characters/armored-joe-heavy-atlas-v228.png', [535, 173, 1006, 919], 681],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/armored-joe-heavy-atlas-v228.png', [1073, 173, 1514, 919], 1232]
].map(poseFrame));
const synthSniperLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/synth-sniper-light-windup-v228.png', [459, 57, 1082, 987], 751],
  ['contact', '/assets/openai/xeno-trials-v209/characters/synth-sniper-light-contact-v228.png', [455, 56, 1206, 984], 729],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/synth-sniper-light-recovery-v228.png', [507, 64, 1035, 985], 730]
].map(poseFrame));
const synthSniperHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/synth-sniper-heavy-windup-v228.png', [400, 14, 1111, 1010], 724],
  ['contact', '/assets/openai/xeno-trials-v209/characters/synth-sniper-heavy-contact-v228.png', [230, 71, 1215, 985], 704],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/synth-sniper-heavy-recovery-v228.png', [448, 78, 1136, 994], 793]
].map(poseFrame));
const synthHeavyLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/synth-heavy-light-windup-v228.png', [447, 47, 1165, 995], 752],
  ['contact', '/assets/openai/xeno-trials-v209/characters/synth-heavy-light-contact-v228.png', [336, 130, 1244, 952], 700],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/synth-heavy-light-recovery-v228.png', [493, 45, 1196, 990], 755]
].map(poseFrame));
const synthHeavyHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/synth-heavy-heavy-atlas-v228.png', [158, 8, 522, 510], 360],
  ['contact', '/assets/openai/xeno-trials-v209/characters/synth-heavy-heavy-atlas-v228.png', [819, 74, 1414, 505], 1102],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/synth-heavy-heavy-atlas-v228.png', [149, 568, 600, 1016], 362]
].map(poseFrame));
const predalienLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/predalien-light-windup-v229.png', [81, 82, 1467, 967], 982],
  ['contact', '/assets/openai/xeno-trials-v209/characters/predalien-light-contact-v229.png', [103, 109, 1471, 949], 865],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/predalien-light-recovery-v229.png', [147, 42, 1340, 980], 1037]
].map(poseFrame));
const predalienHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/predalien-heavy-windup-v229.png', [154, 19, 1310, 985], 899],
  ['contact', '/assets/openai/xeno-trials-v209/characters/predalien-heavy-contact-v229.png', [58, 73, 1519, 968], 888],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/predalien-heavy-recovery-v229.png', [142, 62, 1325, 960], 1035]
].map(poseFrame));
const boilerLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/boiler-light-windup-v229.png', [41, 26, 1500, 994], 1016],
  ['contact', '/assets/openai/xeno-trials-v209/characters/boiler-light-contact-v229.png', [61, 26, 1486, 995], 941],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/boiler-light-recovery-v229.png', [49, 12, 1503, 1009], 1065]
].map(poseFrame));
const boilerHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/boiler-heavy-windup-v229.png', [47, 36, 1510, 1001], 1028],
  ['contact', '/assets/openai/xeno-trials-v209/characters/boiler-heavy-contact-v229.png', [44, 25, 1504, 998], 977],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/boiler-heavy-recovery-v229.png', [64, 27, 1485, 1003], 1081]
].map(poseFrame));
const royalGuardLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/royal-guard-light-atlas-v229.png', [37, 11, 627, 486], 400],
  ['contact', '/assets/openai/xeno-trials-v209/characters/royal-guard-light-atlas-v229.png', [837, 11, 1459, 486], 1147],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/royal-guard-light-atlas-v229.png', [49, 526, 627, 1010], 401]
].map(poseFrame));
const royalGuardHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/royal-guard-heavy-atlas-v229.png', [47, 11, 630, 477], 407],
  ['contact', '/assets/openai/xeno-trials-v209/characters/royal-guard-heavy-atlas-v229.png', [829, 26, 1480, 474], 1122],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/royal-guard-heavy-atlas-v229.png', [58, 532, 623, 1006], 399]
].map(poseFrame));
const razorClawsLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/razor-claws-light-atlas-v229.png', [51, 10, 648, 456], 352],
  ['contact', '/assets/openai/xeno-trials-v209/characters/razor-claws-light-atlas-v229.png', [802, 10, 1524, 456], 1109],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/razor-claws-light-atlas-v229.png', [64, 519, 682, 986], 373]
].map(poseFrame));
const razorClawsHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/razor-claws-heavy-atlas-v229.png', [90, 13, 635, 486], 376],
  ['contact', '/assets/openai/xeno-trials-v209/characters/razor-claws-heavy-atlas-v229.png', [830, 18, 1486, 486], 1130],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/razor-claws-heavy-atlas-v229.png', [62, 521, 704, 998], 387]
].map(poseFrame));
const xenoborgLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/xenoborg-light-atlas-v229.png', [62, 15, 873, 497], 628],
  ['contact', '/assets/openai/xeno-trials-v209/characters/xenoborg-light-atlas-v229.png', [39, 542, 989, 993], 603],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/xenoborg-light-atlas-v229.png', [46, 1033, 881, 1520], 618]
].map(poseFrame));
const xenoborgHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/xenoborg-heavy-atlas-v229.png', [33, 14, 887, 500], 616],
  ['contact', '/assets/openai/xeno-trials-v209/characters/xenoborg-heavy-atlas-v229.png', [23, 594, 992, 989], 606],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/xenoborg-heavy-atlas-v229.png', [44, 1049, 907, 1512], 598]
].map(poseFrame));
const combatSynthLightFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/combat-synth-light-atlas-v229.png', [56, 120, 475, 873], 243],
  ['contact', '/assets/openai/xeno-trials-v209/characters/combat-synth-light-atlas-v229.png', [536, 121, 1015, 872], 725],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/combat-synth-light-atlas-v229.png', [1062, 121, 1485, 873], 1246]
].map(poseFrame));
const combatSynthHeavyFrames = Object.freeze([
  ['windup', '/assets/openai/xeno-trials-v209/characters/combat-synth-heavy-atlas-v229.png', [66, 157, 428, 871], 273],
  ['contact', '/assets/openai/xeno-trials-v209/characters/combat-synth-heavy-atlas-v229.png', [486, 238, 1031, 871], 770],
  ['recovery', '/assets/openai/xeno-trials-v209/characters/combat-synth-heavy-atlas-v229.png', [1064, 255, 1491, 871], 1256]
].map(poseFrame));
// Preserve every faint alpha pixel, but ground the painted toes rather than the
// translucent fringe. One measured density is shared by all phases of an action.
const atlasFramesV232 = (name, entries) => Object.freeze(entries.map(([phase, bounds, rootX, rootY]) =>
  Object.freeze({ ...poseFrame([phase, `/assets/openai/xeno-trials-v232/characters/${name}-atlas-v232.png`, bounds, rootX]), rootY })));
const bigChapLightFramesV232 = atlasFramesV232('big-chap-light', [
  ['windup', [19, 102, 492, 932], 265, 706],
  ['contact', [512, 87, 1040, 918], 750, 706],
  ['recovery', [1057, 85, 1506, 825], 1290, 707]
]);
const bigChapHeavyFramesV232 = atlasFramesV232('big-chap-heavy', [
  ['windup', [79, 63, 514, 1007], 283, 764],
  ['contact', [545, 54, 1082, 976], 766, 764],
  ['recovery', [1113, 23, 1482, 970], 1280, 764]
]);
const deaconLightFramesV232 = atlasFramesV232('deacon-light', [
  ['windup', [41, 32, 978, 506], 500, 495],
  ['contact', [35, 514, 1012, 1006], 480, 998],
  ['recovery', [21, 1043, 1004, 1522], 500, 1513]
]);
const deaconHeavyFramesV232 = atlasFramesV232('deacon-heavy', [
  ['windup', [65, 22, 986, 506], 500, 494],
  ['contact', [73, 557, 986, 1016], 470, 982],
  ['recovery', [135, 1053, 922, 1482], 500, 1477]
]);
const pantherSource = ['pose-v94-kenner-panther', '/assets/openai/sprites/static-enemy-v94/kenner-panther-neca.png',
  '575f23d532b10eb34f2dd0df9e8a860e1511cdecf4e7ab20eb5fa7742acc549c', 1310, 1201];
const arachnoidSource = ['castes-game_avp_capcom_arachnoid', artPath,
  '84f47e12acfa88b5658a736863e4ad8b61a9b43bfa5cb61a34abe87649b2e3ee', 1536, 1024];
const gridSource = ['castes-film_grid_avp_2004', '/assets/user/castes-v87/film_grid_avp_2004.png',
  '49d756a01928adb1c3fa787d47efbb158da988699fd9d0008bf9a723a7002a74', 1536, 1024];
const gorillaSource = ['pose-v94-kenner-gorilla', '/assets/openai/sprites/static-enemy-v94/kenner-gorilla-neca.png',
  'c91b539cebeb76fd69ac39ef5c9966166584a45f8a51a064c09a7306d54f4685', 1254, 1254];
const warriorSource = ['castes-film_warrior_aliens_1986', '/assets/user/castes-v87/film_warrior_aliens_1986.png',
  'c791a14045116531425d270c3edd61384b063d82a0bddf4e23195e9397ecb65f', 1536, 1024];
const runnerSource = ['castes-film_runner_alien3_1992', '/assets/user/castes-v87/film_runner_alien3_1992.png',
  'f117c7ad0e6da9a02d3a4ce315066d75acfd67a909620f560ff6cd8c3d7b64b3', 1536, 1024];
const queenSource = ['castes-film_queen_aliens_1986', '/assets/user/castes-v87/film_queen_aliens_1986.png',
  '985abf27db63400d8a6a68101bfaa7dde3335da0e8986ea85c409ab30da5e991', 1536, 1024];
const rhinoSource = ['pose-v94-kenner-rhino', '/assets/openai/sprites/static-enemy-v94/kenner-rhino-neca.png',
  '056cff7c33e15760ea867185dba4228542eabc291328034d40246589180e7ce8', 1310, 1201, -1];
const mantisSource = ['pose-v96-kenner-mantis', '/assets/openai/sprites/static-enemy-v96/mantis-alien-neca.png',
  'd84bcb3069b7eb0119fb627a6f5aef5eb60da3478b3e18a9d254a4302a564ef7', 1226, 1283];
const armoredJoeSource = ['enemy-145-armored-working-joe', '/assets/openai/sprites/static-enemy-v96/armored-working-joe.png',
  'e361bb35804e23c66a2b981375d3eff3b99361f684ba394ce93f6bf9c7d28210', 1024, 1536];
const synthSniperSource = ['pose-v94-afe-synth-sniper', '/assets/openai/sprites/static-enemy-v94/game-afe-synth-sniper.png',
  '6541a21be18321c71b2e8e2a8b76f5ac7e58581babe5e190a3dcde6247f5977b', 1024, 1536];
const synthHeavySource = ['pose-v94-afe-synth-heavy', '/assets/openai/sprites/static-enemy-v94/game-afe-synth-heavy.png',
  '71a4ad45aafe454e33eb7a90a9f4574b59c731fe9406f19a5382987a6a9d5a4d', 1024, 1536];
const predalienSource = ['castes-game_predalien_avp2_primal_hunt', '/assets/user/castes-v87/game_predalien_avp2_primal_hunt.png',
  '3c39acccb5bcfd571026d2511553946078be96b4f2c0e2c2470b39197f770bb5', 1536, 1024];
const boilerSource = ['castes-game_acm_boiler', '/assets/user/castes-v87/game_acm_boiler.png',
  'c1385916ec2e5bb3f1d6ff421f2a58850cb907697bdbcc7845d3b1f729f00ac1', 1536, 1024];
const royalGuardSource = ['castes-game_avp_capcom_royal_guard', '/assets/user/castes-v87/game_avp_capcom_royal_guard.png',
  'f8678cd4d343ec643c79791258fc4d25540aba43de40fc4b20ae720818b04cd3', 1536, 1024];
const razorClawsSource = ['castes-game_avp_capcom_razor_claws', '/assets/user/castes-v87/game_avp_capcom_razor_claws.png',
  'a1d024f5a20e4a7210b7f77f011ed2f81e6a177ba787afd07a430b5cd71d1987', 1536, 1024];
const xenoborgSource = ['castes-game_xenoborg_avp1999', '/assets/user/castes-v87/game_xenoborg_avp1999.png',
  'd6532326d96fbdd14e7feb8d19946b92edac55a0f8ae88ccc916cc692b192a09', 1536, 1024];
const combatSynthSource = ['enemy-146-armored-combat-synthetic', '/assets/openai/sprites/static-enemy-v96/armored-combat-synthetic.png',
  'fb161cf728b2f8f4fa5f7ef7b894a7aed7a2f5cae79e122cbabc96ad2d4afd39', 1205, 1306];
const bigChapSourceV232 = ['v209-big-chap', '/assets/openai/sprites/normalized/enemy-profiles-v66/enemy-004-drone-big-chap.webp',
  'fcbe7d2625a8878afc5d91fc34636d27f8ac6f4f40ed34bebf052a5883ccd9fb', 256, 256];
const deaconSourceV232 = ['castes-film_deacon_2012', '/assets/user/castes-v87/film_deacon_2012.png',
  '6788ba772edfcb4b7989b1fa55606670c610a9fec74230316b5e36c906048853', 1536, 1024];

const groundedActions = Object.freeze([
  ['panther', {
    id: 'panther-pounce', action: 'special', revision: 221, animation: 'three-painted-panther-pounce-poses',
    source: pantherSource,
    // The neutral shoulder-to-hip and shoulder-to-skull spans are about 77% as long in source pixels.
    textureWidth: 1536, textureHeight: 1024, density: .77, frames: pantherFrames, limitations: ['three-painted-poses']
  }],
  ['grid', {
    id: 'grid-heavy', action: 'heavy', revision: 226, animation: 'painted-grid-heavy-poses',
    source: gridSource,
    textureWidth: 1774, textureHeight: 887, density: 1, frames: gridFrames, limitations: ['three-painted-poses']
  }],
  ['gorilla', {
    id: 'gorilla-ram', action: 'special', revision: 226, animation: 'painted-gorilla-ram-poses',
    source: gorillaSource,
    textureWidth: 1254, textureHeight: 1254, density: 1, frames: gorillaFrames, limitations: ['three-painted-poses']
  }],
  ['arachnoid', {
    id: 'arachnoid-light', action: 'light', revision: 223, animation: 'painted-arachnoid-light-poses', variant: 'grey',
    source: arachnoidSource,
    // Keep the approximately 34-pixel shoulder-to-neutral-pivot offset in each plate.
    textureWidth: 1536, textureHeight: 1024, density: 1, frames: arachnoidLightFrames, limitations: ['grey-only', 'three-painted-poses']
  }],
  ['panther', {
    id: 'panther-light', action: 'light', revision: 226, animation: 'painted-panther-light-poses', source: pantherSource,
    // The neutral shoulder-to-skull span is about 80% of the span in these light keys.
    textureWidth: 1536, textureHeight: 1024, density: .80, frames: pantherLightFrames, limitations: ['three-painted-poses']
  }],
  ['arachnoid', {
    id: 'arachnoid-pounce', action: 'special', revision: 224, animation: 'painted-grounded-pounce', variant: 'grey',
    source: arachnoidSource, textureWidth: 1536, textureHeight: 1024, density: 1,
    frames: arachnoidPounceFrames, limitations: ['grey-only', 'three-painted-poses']
  }],
  ['grid', {
    id: 'grid-tail', action: 'special', revision: 226, animation: 'painted-grid-tail-poses',
    source: gridSource, textureWidth: 1774, textureHeight: 887, density: 1,
    frames: gridTailFrames, limitations: ['three-painted-poses']
  }],
  ['gorilla', {
    id: 'gorilla-heavy', action: 'heavy', revision: 226, animation: 'painted-gorilla-heavy-poses',
    source: gorillaSource, textureWidth: 1254, textureHeight: 1254, density: 1,
    frames: gorillaHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['gorilla', {
    id: 'gorilla-light', action: 'light', revision: 227, animation: 'painted-gorilla-light-poses',
    source: gorillaSource, textureWidth: 1254, textureHeight: 1254, density: 1,
    frames: gorillaLightFrames, limitations: ['three-painted-poses']
  }],
  ['grid', {
    id: 'grid-light', action: 'light', revision: 227, animation: 'painted-grid-light-poses',
    source: gridSource, textureWidth: 1774, textureHeight: 887, density: 1,
    frames: gridLightFrames, limitations: ['windup-and-contact-only']
  }],
  ['panther', {
    id: 'panther-heavy', action: 'heavy', revision: 227, animation: 'painted-panther-heavy-poses',
    source: pantherSource, textureWidth: 1536, textureHeight: 1024, density: .77,
    frames: pantherHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['warrior', {
    id: 'warrior-heavy', action: 'heavy', revision: 227, animation: 'painted-warrior-heavy-poses',
    source: warriorSource, textureWidth: 1536, textureHeight: 1024, density: .98,
    frames: warriorHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['runner', {
    id: 'runner-heavy', action: 'heavy', revision: 227, animation: 'painted-runner-heavy-poses',
    source: runnerSource, textureWidth: 1536, textureHeight: 1024, density: 1,
    frames: runnerHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['queen', {
    id: 'queen-light', action: 'light', revision: 227, animation: 'painted-queen-light-poses',
    source: queenSource, textureWidth: 1536, textureHeight: 1024, density: 1,
    frames: queenLightFrames, limitations: ['three-painted-poses']
  }],
  ['rhino', {
    id: 'rhino-light', action: 'light', revision: 228, animation: 'painted-rhino-light-poses',
    source: rhinoSource, textureWidth: 1536, textureHeight: 1024, density: 1,
    frames: rhinoLightFrames, limitations: ['three-painted-poses']
  }],
  ['rhino', {
    id: 'rhino-heavy', action: 'heavy', revision: 228, animation: 'painted-rhino-heavy-poses',
    source: rhinoSource, textureWidth: 1536, textureHeight: 1024, density: 1,
    frames: rhinoHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['mantis', {
    id: 'mantis-light', action: 'light', revision: 228, animation: 'painted-mantis-light-poses',
    source: mantisSource, textureWidth: 1254, textureHeight: 1254, density: 1,
    frames: mantisLightFrames, limitations: ['three-painted-poses']
  }],
  ['mantis', {
    id: 'mantis-heavy', action: 'heavy', revision: 228, animation: 'painted-mantis-heavy-poses',
    source: mantisSource, textureWidth: 1536, textureHeight: 1024, density: 1.94,
    frames: mantisHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['armored-joe', {
    id: 'armored-joe-light', action: 'light', revision: 228, animation: 'painted-armored-joe-light-poses',
    source: armoredJoeSource, textureWidth: 1536, textureHeight: 1024, density: 2.46,
    frames: armoredJoeLightFrames, limitations: ['three-painted-poses']
  }],
  ['armored-joe', {
    id: 'armored-joe-heavy', action: 'heavy', revision: 228, animation: 'painted-armored-joe-heavy-poses',
    source: armoredJoeSource, textureWidth: 1536, textureHeight: 1024, density: 1.45,
    frames: armoredJoeHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['synth-sniper', {
    id: 'synth-sniper-light', action: 'light', revision: 228, animation: 'painted-synth-sniper-light-poses',
    source: synthSniperSource, textureWidth: 1536, textureHeight: 1024, density: 1.38,
    frames: synthSniperLightFrames, limitations: ['three-painted-poses']
  }],
  ['synth-sniper', {
    id: 'synth-sniper-heavy', action: 'heavy', revision: 228, animation: 'painted-synth-sniper-heavy-poses',
    source: synthSniperSource, textureWidth: 1536, textureHeight: 1024, density: 1.28,
    frames: synthSniperHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['synth-heavy', {
    id: 'synth-heavy-light', action: 'light', revision: 228, animation: 'painted-synth-heavy-light-poses',
    source: synthHeavySource, textureWidth: 1536, textureHeight: 1024, density: 1.4,
    frames: synthHeavyLightFrames, limitations: ['three-painted-poses']
  }],
  ['synth-heavy', {
    id: 'synth-heavy-heavy', action: 'heavy', revision: 228, animation: 'painted-synth-heavy-heavy-poses',
    source: synthHeavySource, textureWidth: 1536, textureHeight: 1024, density: 2.18,
    frames: synthHeavyHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['predalien', {
    id: 'predalien-light', action: 'light', revision: 229, animation: 'painted-predalien-light-poses',
    source: predalienSource, textureWidth: 1536, textureHeight: 1024, density: .93,
    frames: predalienLightFrames, limitations: ['three-painted-poses']
  }],
  ['predalien', {
    id: 'predalien-heavy', action: 'heavy', revision: 229, animation: 'painted-predalien-heavy-poses',
    source: predalienSource, textureWidth: 1536, textureHeight: 1024, density: .93,
    frames: predalienHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['boiler', {
    id: 'boiler-light', action: 'light', revision: 229, animation: 'painted-boiler-light-poses',
    source: boilerSource, textureWidth: 1536, textureHeight: 1024, density: .98,
    frames: boilerLightFrames, limitations: ['three-painted-poses']
  }],
  ['boiler', {
    id: 'boiler-heavy', action: 'heavy', revision: 229, animation: 'painted-boiler-heavy-poses',
    source: boilerSource, textureWidth: 1536, textureHeight: 1024, density: .98,
    frames: boilerHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['royal-guard', {
    id: 'royal-guard-light', action: 'light', revision: 229, animation: 'painted-royal-guard-light-poses',
    source: royalGuardSource, textureWidth: 1536, textureHeight: 1024, density: 1.91,
    frames: royalGuardLightFrames, limitations: ['three-painted-poses']
  }],
  ['royal-guard', {
    id: 'royal-guard-heavy', action: 'heavy', revision: 229, animation: 'painted-royal-guard-heavy-poses',
    source: royalGuardSource, textureWidth: 1536, textureHeight: 1024, density: 1.91,
    frames: royalGuardHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['razor-claws', {
    id: 'razor-claws-light', action: 'light', revision: 229, animation: 'painted-razor-claws-light-poses',
    source: razorClawsSource, textureWidth: 1536, textureHeight: 1024, density: 2.04,
    frames: razorClawsLightFrames, limitations: ['three-painted-poses']
  }],
  ['razor-claws', {
    id: 'razor-claws-heavy', action: 'heavy', revision: 229, animation: 'painted-razor-claws-heavy-poses',
    source: razorClawsSource, textureWidth: 1536, textureHeight: 1024, density: 2.04,
    frames: razorClawsHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['xenoborg', {
    id: 'xenoborg-light', action: 'light', revision: 229, animation: 'painted-xenoborg-light-poses',
    source: xenoborgSource, textureWidth: 1024, textureHeight: 1536, density: 1.692,
    frames: xenoborgLightFrames, limitations: ['three-painted-poses']
  }],
  ['xenoborg', {
    id: 'xenoborg-heavy', action: 'heavy', revision: 229, animation: 'painted-xenoborg-heavy-poses',
    source: xenoborgSource, textureWidth: 1024, textureHeight: 1536, density: 1.758,
    frames: xenoborgHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['combat-synth', {
    id: 'combat-synth-light', action: 'light', revision: 229, animation: 'painted-combat-synth-light-poses',
    source: combatSynthSource, textureWidth: 1536, textureHeight: 1024, density: 1.525,
    frames: combatSynthLightFrames, limitations: ['three-painted-poses']
  }],
  ['combat-synth', {
    id: 'combat-synth-heavy', action: 'heavy', revision: 229, animation: 'painted-combat-synth-heavy-poses',
    source: combatSynthSource, textureWidth: 1536, textureHeight: 1024, density: 1.651,
    frames: combatSynthHeavyFrames, limitations: ['three-painted-poses']
  }],
  ['mire-v209-bigchap', {
    id: 'big-chap-light-v232', action: 'light', revision: 232, animation: 'painted-big-chap-light-poses-v232',
    source: bigChapSourceV232, sourceRectV232: Object.freeze([0, 0, 256, 256]),
    textureWidth: 1536, textureHeight: 1024, density: 131 / 419,
    frames: bigChapLightFramesV232, limitations: ['three-painted-poses', 'measured-toe-anchor', 'project-adaptation']
  }],
  ['mire-v209-bigchap', {
    id: 'big-chap-heavy-v232', action: 'heavy', revision: 232, animation: 'painted-big-chap-heavy-poses-v232',
    source: bigChapSourceV232, sourceRectV232: Object.freeze([0, 0, 256, 256]),
    textureWidth: 1536, textureHeight: 1024, density: 131 / 440,
    frames: bigChapHeavyFramesV232, limitations: ['three-painted-poses', 'measured-toe-anchor', 'project-adaptation']
  }],
  ['mire-v209-deacon', {
    id: 'deacon-light-v232', action: 'light', revision: 232, animation: 'painted-deacon-light-poses-v232',
    source: deaconSourceV232, textureWidth: 1024, textureHeight: 1536, density: 984 / 460,
    frames: deaconLightFramesV232, limitations: ['three-painted-poses', 'measured-toe-anchor', 'project-adaptation']
  }],
  ['mire-v209-deacon', {
    id: 'deacon-heavy-v232', action: 'heavy', revision: 232, animation: 'painted-deacon-heavy-poses-v232',
    source: deaconSourceV232, textureWidth: 1024, textureHeight: 1536, density: 984 / 434,
    frames: deaconHeavyFramesV232, limitations: ['three-painted-poses', 'measured-toe-anchor', 'project-adaptation']
  }]
].map(([fighterId, entry]) => Object.freeze({ ...entry, fighterId, source: Object.freeze(entry.source), limitations: Object.freeze(entry.limitations),
  paths: Object.freeze([...new Set(entry.frames.filter(Boolean).map(frame => frame.path))]) })));
const heavyPaths = Object.freeze(heavyFrames.map(frame => frame.path));
const allPaths = Object.freeze([...heavyPaths, ...groundedActions.flatMap(entry => entry.paths)]);
const supported = (fighter, art) => fighter?.id === 'arachnoid' && fighter.variant !== 'purple'
  && art?.path === artPath && art.sourceFacing === 1;

export function getXenoTrialsGroundedPaintedActionsV223(fighter, art) {
  if (!fighter || !art) return [];
  // The historical Big Chap frame has no alpha-registry digest. Its exact
  // source path/profile/cell and production bytes are pinned independently.
  const sourceHash = art.sha256 ?? ENEMY_DISPLAY_ALPHA_V110[art.path]?.sha256
    ?? (art.profileId === bigChapSourceV232[0] && art.path === bigChapSourceV232[1] ? bigChapSourceV232[2] : undefined);
  return groundedActions.filter(entry => {
    if (entry.fighterId !== fighter.id || (entry.variant ?? null) !== (fighter.variant ?? null)
      || entry.variant && entry.variant !== art.visualStateV95) return false;
    const [profileId, path, sha256, width, height, sourceFacing = 1] = entry.source;
    return art.profileId === profileId && art.path === path && sourceHash === sha256 && art.sourceFacing === sourceFacing
      && art.sourceWidth === width && art.sourceHeight === height
      && (!entry.sourceRectV232 || Array.isArray(art.sourceRectV209) && art.sourceRectV209.length === 4
        && entry.sourceRectV232.every((value, index) => value === art.sourceRectV209[index]));
  });
}

export function getXenoTrialsGroundedPaintedActionV222(fighter, art) {
  return getXenoTrialsGroundedPaintedActionsV223(fighter, art)[0] ?? null;
}

export function getXenoTrialsPantherPounceFramesV221(fighter, art) {
  return fighter?.id === 'panther' ? getXenoTrialsGroundedPaintedActionV222(fighter, art)?.frames ?? null : null;
}

export function getXenoTrialsPoseAssetsV209(fighter, art) {
  if (!fighter) return allPaths;
  const authoredPaths = getXenoTrialsGroundedPaintedActionsV223(fighter, art).flatMap(action => action.paths);
  const legacyPaths = supported(fighter, art) ? heavyPaths : [];
  return Object.freeze([...legacyPaths, ...authoredPaths]);
}

export function drawXenoTrialsPoseV209(ctx, fighter, art, images, options) {
  const { groundedHeight, x, ground, spec, reducedMotion } = options;
  const attack = fighter.attack;
  if (fighter.y !== 0 || fighter.stun > 0 || reducedMotion
    || !Number.isFinite(attack?.age) || attack.age < 0 || ![-1, 1].includes(attack.facing)
    || ![groundedHeight, x, ground, spec?.startup, spec?.active, spec?.recovery].every(Number.isFinite) || groundedHeight <= 0) return null;
  const activeEnd = spec.startup + spec.active;
  if (attack.age >= activeEnd + spec.recovery) return null;
  const authored = getXenoTrialsGroundedPaintedActionsV223(fighter, art).find(action => action.action === attack.kind);
  if (!authored && (attack.kind !== 'heavy' || !supported(fighter, art))) return null;
  const phase = attack.age < spec.startup ? 0 : attack.age < activeEnd ? 1 : 2;
  const frame = authored ? authored.frames[phase] : heavyFrames[phase];
  if (!frame) return null;
  const image = images.get(frame.path);
  if (!image || image.complete === false || image.naturalWidth !== (frame.textureWidth ?? authored?.textureWidth ?? width)
    || image.naturalHeight !== (frame.textureHeight ?? authored?.textureHeight ?? height)) return null;
  const scale = groundedHeight / (authored ? art.sourceHeight : 834) * (authored?.density ?? 1);
  const [left, top, right, bottom] = frame.bounds;
  const w = right - left, h = bottom - top;
  ctx.save();
  try {
    ctx.translate(x, ground);
    ctx.scale(attack.facing, 1);
    ctx.drawImage(image, left, top, w, h, (left - frame.rootX) * scale,
      (top - (frame.rootY ?? bottom)) * scale, w * scale, h * scale);
  } finally { ctx.restore(); }
  const animation = authored?.animation ?? 'three-painted-heavy-poses';
  return { drawn: true, animation, poseV209: {
    phase: frame.phase, path: frame.path, attackId: attack.id, attackAge: attack.age, ground, sourceRect: [left, top, w, h],
  } };
}
