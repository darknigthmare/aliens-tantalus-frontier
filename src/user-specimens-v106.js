import { USER_PACK_V100 } from './user-pack-v100.js';
import { USER_SPECIMEN_RECORDS_V112 } from './user-specimens-v112.js';

// Native cutouts used by the confinement bench. This does not create a fighter,
// hatching cycle, new species or a claim of animation / canonical scale.
const records = [
  {
    "slug": "xeno-blueluminescent-egg",
    "referenceId": "pack-v100-xeno-blueluminescent-egg",
    "path": "/assets/openai/sprites/static-import-v106/xeno-blueluminescent-egg.png",
    "sha256": "7c904968ec8cb8c7a994050adb2b6d7f6b4d2203f9e5ac2fc3037ad0a7170b4e",
    "sourceWidth": 1698,
    "sourceHeight": 926,
    "alphaBounds": [
      531,
      9,
      1167,
      908
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.980561555075594
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-blueluminescent-egg"
  },
  {
    "slug": "xeno-blueluminescent-facehugger",
    "referenceId": "pack-v100-xeno-blueluminescent-facehugger",
    "path": "/assets/openai/sprites/static-import-v106/xeno-blueluminescent-facehugger.png",
    "sha256": "14615a669c99aa4363cf0e787c69044ff83f2dd103d50530eec8023d92fe2660",
    "sourceWidth": 1698,
    "sourceHeight": 926,
    "alphaBounds": [
      27,
      34,
      1672,
      889
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9600431965442765
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Vue ventrale conservée ; non admise comme marche latérale.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-blueluminescent-facehugger"
  },
  {
    "slug": "xeno-blueluminescent-chestburster",
    "referenceId": "pack-v100-xeno-blueluminescent-chestburster",
    "path": "/assets/openai/sprites/static-import-v106/xeno-blueluminescent-chestburster.png",
    "sha256": "7b8c4251e8e2dc4f5d2b86e9d1e9b9d4d248d01ed609374cbb4281c38f43ba0e",
    "sourceWidth": 1698,
    "sourceHeight": 926,
    "alphaBounds": [
      32,
      70,
      1690,
      855
    ],
    "pivot": {
      "x": 0.4,
      "y": 0.9233261339092873
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "juvenile-or-parasite",
    "groupId": "pack-v100-xeno-blueluminescent-chestburster"
  },
  {
    "slug": "xeno-ovomorph-breedingegg",
    "referenceId": "pack-v100-xeno-ovomorph-breedingegg",
    "path": "/assets/openai/sprites/static-import-v106/xeno-ovomorph-breedingegg.png",
    "sha256": "d4d8e1a6835ddbeeb93daab07703229f30de068d6537b65f34a1858efec51a79",
    "sourceWidth": 1121,
    "sourceHeight": 1403,
    "alphaBounds": [
      127,
      115,
      1024,
      1301
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9272986457590877
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-ovomorph-breedingegg"
  },
  {
    "slug": "xeno-ovomorph-hyperfertile-eggs",
    "referenceId": "pack-v100-xeno-ovomorph-hyperfertile-eggs",
    "path": "/assets/openai/sprites/static-import-v106/xeno-ovomorph-hyperfertile-eggs.png",
    "sha256": "5a09ae3d8de25df30f7c63b64ffce1219279263a4645225dd94c4199c0a7b4bd",
    "sourceWidth": 1639,
    "sourceHeight": 959,
    "alphaBounds": [
      461,
      26,
      1183,
      938
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9781021897810219
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-ovomorph-hyperfertile-eggs"
  },
  {
    "slug": "xeno-ovomorph-praetorian-eggs",
    "referenceId": "pack-v100-xeno-ovomorph-praetorian-eggs",
    "path": "/assets/openai/sprites/static-import-v106/xeno-ovomorph-praetorian-eggs.png",
    "sha256": "43fede93af2a46c32c1880758668b88fbad01fd0608f1548d954df5e552ddc88",
    "sourceWidth": 1202,
    "sourceHeight": 1308,
    "alphaBounds": [
      110,
      67,
      1121,
      1269
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9701834862385321
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-ovomorph-praetorian-eggs"
  },
  {
    "slug": "xeno-bambibuster",
    "referenceId": "pack-v100-xeno-bambibuster",
    "path": "/assets/openai/sprites/static-import-v106/xeno-bambibuster.png",
    "sha256": "a287fd4b42d1722c757a3d418932a53fec62fcdeed242301b704aa5f8794f3bb",
    "sourceWidth": 1537,
    "sourceHeight": 1023,
    "alphaBounds": [
      217,
      47,
      1411,
      986
    ],
    "pivot": {
      "x": 0.4,
      "y": 0.9638318670576735
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "juvenile-or-parasite",
    "groupId": "pack-v100-xeno-bambibuster"
  },
  {
    "slug": "xeno-chestbusterpredalien-movie",
    "referenceId": "pack-v100-xeno-chestbusterpredalien-movie",
    "path": "/assets/openai/sprites/static-import-v106/xeno-chestbusterpredalien-movie.png",
    "sha256": "0444bcc5c4bba08c159fc60e9757e083a4eab6ba1dc882b9c19dbbb06400aa05",
    "sourceWidth": 1537,
    "sourceHeight": 1023,
    "alphaBounds": [
      23,
      67,
      1512,
      958
    ],
    "pivot": {
      "x": 0.4,
      "y": 0.9364613880742912
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "juvenile-or-parasite",
    "groupId": "pack-v100-xeno-chestbusterpredalien-movie"
  },
  {
    "slug": "xeno-cocoon-front",
    "referenceId": "pack-v100-xeno-cocoon-front",
    "path": "/assets/openai/sprites/static-import-v106/xeno-cocoon-front.png",
    "sha256": "4ca67874539d044396339455683f864b5463f0769bc711ae1ff483cfcf23d431",
    "sourceWidth": 1102,
    "sourceHeight": 1427,
    "alphaBounds": [
      55,
      48,
      1052,
      1381
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9677645409950946
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Vue frontale du même cocon, pas un autre ennemi. Crédit source : Legacy Effects — Alien Romulus (2024) — Adam Milicevic.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-cocoon"
  },
  {
    "slug": "xeno-cocoon-side",
    "referenceId": "pack-v100-xeno-cocoon-side",
    "path": "/assets/openai/sprites/static-import-v106/xeno-cocoon-side.png",
    "sha256": "220ee45a5a78d20f3729d211b47caaec8de704eb0d8fc437b5363536d11bcaf7",
    "sourceWidth": 1102,
    "sourceHeight": 1427,
    "alphaBounds": [
      216,
      50,
      975,
      1374
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9628591450595655
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Vue latérale du même cocon, pas un autre ennemi.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-cocoon"
  },
  {
    "slug": "xeno-cocoon",
    "referenceId": "pack-v100-xeno-cocoon",
    "path": "/assets/openai/sprites/static-import-v106/xeno-cocoon.png",
    "sha256": "64642060723c234f821b58faf1bf1b7501e8ee1467490ec5d9289e55d51b77ea",
    "sourceWidth": 1102,
    "sourceHeight": 1427,
    "alphaBounds": [
      220,
      44,
      1034,
      1382
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9684653118430273
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Vue trois-quarts du même cocon, pas un autre ennemi.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-cocoon"
  },
  {
    "slug": "xeno-eggmorphing",
    "referenceId": "pack-v100-xeno-eggmorphing",
    "path": "/assets/openai/sprites/static-import-v106/xeno-eggmorphing.png",
    "sha256": "46c8b2c7e1e560d6738510f4dcaaadb5bc2b7f8423032c9f3ca26e365f39f491",
    "sourceWidth": 1051,
    "sourceHeight": 1497,
    "alphaBounds": [
      57,
      77,
      973,
      1439
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9612558450233801
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-eggmorphing"
  },
  {
    "slug": "xeno-mutated-egg",
    "referenceId": "pack-v100-xeno-mutated-egg",
    "path": "/assets/openai/sprites/static-import-v106/xeno-mutated-egg.png",
    "sha256": "a97bf2f959771a4f78b78f02b1f05a1826bc7b11eb6bea64eb4a7cdcd4a52a8b",
    "sourceWidth": 1731,
    "sourceHeight": 909,
    "alphaBounds": [
      528,
      27,
      1193,
      892
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9812981298129813
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-mutated-egg"
  },
  {
    "slug": "xeno-mutated-facehugger-sideview",
    "referenceId": "pack-v100-xeno-mutated-facehugger-sideview",
    "path": "/assets/openai/sprites/static-import-v106/xeno-mutated-facehugger-sideview.png",
    "sha256": "eb6ed00b452f6c384e5af4815609d677cff46f83e0eb0029dfc7beb64b049e62",
    "sourceWidth": 1343,
    "sourceHeight": 1171,
    "alphaBounds": [
      40,
      28,
      1319,
      1127
    ],
    "pivot": {
      "x": 0.4,
      "y": 0.9624252775405636
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "juvenile-or-parasite",
    "groupId": "pack-v100-xeno-mutated-facehugger-sideview"
  },
  {
    "slug": "xeno-offspring-adult",
    "referenceId": "pack-v100-xeno-offspring-adult",
    "path": "/assets/openai/sprites/static-import-v106/xeno-offspring-adult.png",
    "sha256": "7205bf37d687eb2f974a36c9ee2fd24e49808cfcab3d7f55ceb9b481a56475ef",
    "sourceWidth": 1650,
    "sourceHeight": 953,
    "alphaBounds": [
      32,
      14,
      1642,
      937
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9832109129066107
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Créature ailée en pose accroupie tournée à droite ; ailes non animées, vol non certifié.",
    "role": "winged-specimen",
    "groupId": "pack-v100-xeno-offspring-adult"
  },
  {
    "slug": "xeno-offspring-egg",
    "referenceId": "pack-v100-xeno-offspring-egg",
    "path": "/assets/openai/sprites/static-import-v106/xeno-offspring-egg.png",
    "sha256": "3cab64fe4e67bb1f35535d18e0ef822fc84a63e65e66418edd200da27d14647e",
    "sourceWidth": 1055,
    "sourceHeight": 1491,
    "alphaBounds": [
      89,
      44,
      953,
      1375
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9221998658618377
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Sac/œuf avec organisme visible ; pas de naissance ni de filiation runtime inventée.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-offspring-egg"
  },
  {
    "slug": "xeno-ovomorph-praetomorph",
    "referenceId": "pack-v100-xeno-ovomorph-praetomorph",
    "path": "/assets/openai/sprites/static-import-v106/xeno-ovomorph-praetomorph.png",
    "sha256": "c187ca4a5532cd2b3e83870d72d04fba58c57064d947bdf349b2a377bd84608d",
    "sourceWidth": 1267,
    "sourceHeight": 1241,
    "alphaBounds": [
      247,
      56,
      1044,
      1189
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9580983078162773
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-ovomorph-praetomorph"
  },
  {
    "slug": "xeno-queenmother-ovomorph",
    "referenceId": "pack-v100-xeno-queenmother-ovomorph",
    "path": "/assets/openai/sprites/static-import-v106/xeno-queenmother-ovomorph.png",
    "sha256": "2ff1ea0d6ad7d871826955fe382eafe52b13cf1c7a3a54bec4e27f6a5cd540f6",
    "sourceWidth": 1537,
    "sourceHeight": 1023,
    "alphaBounds": [
      126,
      18,
      1380,
      998
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9755620723362659
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-queenmother-ovomorph"
  },
  {
    "slug": "xeno-red-queenchestbuster-1",
    "referenceId": "pack-v100-xeno-red-queenchestbuster-1",
    "path": "/assets/openai/sprites/static-import-v106/xeno-red-queenchestbuster-1.png",
    "sha256": "781cf6d5d97d5660f61eba75ffc08a6986262ceb6b21238de5dba602a469d6d4",
    "sourceWidth": 1333,
    "sourceHeight": 1180,
    "alphaBounds": [
      75,
      75,
      1279,
      1115
    ],
    "pivot": {
      "x": 0.4,
      "y": 0.9449152542372882
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "juvenile-or-parasite",
    "groupId": "pack-v100-xeno-red-queenchestbuster-1"
  },
  {
    "slug": "xeno-rotenline-larvae",
    "referenceId": "pack-v100-xeno-rotenline-larvae",
    "path": "/assets/openai/sprites/static-import-v106/xeno-rotenline-larvae.png",
    "sha256": "cb56ca503c3990b5d273b2bd37946058eac36e73b52dae1c679fa78f10940671",
    "sourceWidth": 1537,
    "sourceHeight": 1023,
    "alphaBounds": [
      75,
      19,
      1510,
      992
    ],
    "pivot": {
      "x": 0.4,
      "y": 0.9696969696969697
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Larve nommée par la source ; queue compacte conservée, pas de cycle biologique inventé.",
    "role": "juvenile-or-parasite",
    "groupId": "pack-v100-xeno-rotenline-larvae"
  },
  {
    "slug": "xeno-royal-facehugger-alternate-to-repair",
    "referenceId": "pack-v100-xeno-royal-facehugger-alternate-to-repair",
    "path": "/assets/openai/sprites/static-import-v106/xeno-royal-facehugger-alternate-to-repair.png",
    "sha256": "e745f848ca03d2f94ace1163ec2911caf36cfba09613c69b774b41f9a0b4ac4f",
    "sourceWidth": 1351,
    "sourceHeight": 1164,
    "alphaBounds": [
      68,
      46,
      1313,
      1159
    ],
    "pivot": {
      "x": 0.43,
      "y": 0.9957044673539519
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "juvenile-or-parasite",
    "groupId": "pack-v100-xeno-royal-facehugger-alternate-to-repair"
  },
  {
    "slug": "xeno-toadpole",
    "referenceId": "pack-v100-xeno-toadpole",
    "path": "/assets/openai/sprites/static-import-v106/xeno-toadpole.png",
    "sha256": "36f6fd6852ff04a853f9bf3ef9e324c85547ba55fd8d81fa369f5a7036bdea7e",
    "sourceWidth": 1537,
    "sourceHeight": 1023,
    "alphaBounds": [
      90,
      342,
      1475,
      675
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.6598240469208211
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Larve aquatique en profil gauche ; ne pas faire marcher au sol.",
    "role": "aquatic-specimen",
    "groupId": "pack-v100-xeno-toadpole"
  },
  {
    "slug": "xeno-xenoearth-ovomorph",
    "referenceId": "pack-v100-xeno-xenoearth-ovomorph",
    "path": "/assets/openai/sprites/static-import-v106/xeno-xenoearth-ovomorph.png",
    "sha256": "0c68565d4f7841a56fede84fdcfb9b6a0ee8bcdea587b76ac0c61da346c695ec",
    "sourceWidth": 1052,
    "sourceHeight": 1495,
    "alphaBounds": [
      36,
      142,
      997,
      1461
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9772575250836121
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1.",
    "role": "contained-specimen",
    "groupId": "pack-v100-xeno-xenoearth-ovomorph"
  },
  {
    "slug": "engineer-blackgoo-jar",
    "referenceId": "pack-v100-engineer-blackgoo-jar",
    "path": "/assets/openai/sprites/static-import-v106/engineer-blackgoo-jar.png",
    "sha256": "171c423590a5a19262d9a3d7051abeb77074885bb867d1fd238e886d2fdedcb7",
    "sourceWidth": 1119,
    "sourceHeight": 1405,
    "alphaBounds": [
      315,
      88,
      800,
      1328
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9451957295373665
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Whole silhouette preserved, backdrop and floor absent. Minor native edge fringe retained. Static adaptation, not canonExact or animation.",
    "role": "equipment",
    "groupId": "pack-v100-engineer-blackgoo-jar"
  },
  {
    "slug": "enginner-blackgoo-vial",
    "referenceId": "pack-v100-enginner-blackgoo-vial",
    "path": "/assets/openai/sprites/static-import-v106/enginner-blackgoo-vial.png",
    "sha256": "fee0a267dba41d09454def5ca6406d6841fe77f46977887d5797d4fbc108c36b",
    "sourceWidth": 1173,
    "sourceHeight": 1341,
    "alphaBounds": [
      448,
      16,
      729,
      1309
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9761372110365399
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Complete closed pointed vial preserved. Non-organic object, not an autonomous enemy. Bright reflections retained, no actual halo in browser composites.",
    "role": "equipment",
    "groupId": "pack-v100-enginner-blackgoo-vial"
  },
  {
    "slug": "wy-prometheus-suit",
    "referenceId": "pack-v100-wy-prometheus-suit",
    "path": "/assets/openai/sprites/static-import-v106/wy-prometheus-suit.png",
    "sha256": "48cd295a11b5d19110e19ae502ab4a7e1a3a38e9cf3fedd0ab1a533831d5f083",
    "sourceWidth": 1039,
    "sourceHeight": 1513,
    "alphaBounds": [
      349,
      23,
      704,
      1481
    ],
    "pivot": {
      "x": 0.51,
      "y": 0.9788499669530734
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Complete empty Prometheus suit with dark open face cavity preserved; no person inserted. Equipment object, not an autonomous enemy. No visible halo in browser composites.",
    "role": "equipment",
    "groupId": "pack-v100-wy-prometheus-suit"
  }
];
export const USER_SPECIMEN_ART_V106 = Object.freeze([...records, ...USER_SPECIMEN_RECORDS_V112].map(art => {
  const original = USER_PACK_V100.find(entry => entry.id === art.referenceId);
  if (!original) throw new Error('Unknown specimen reference: ' + art.referenceId);
  return Object.freeze({ ...art, name: original.name, biology: original.biology,
    stage: original.stage, lineage: original.lineage, sourcePath: original.path,
    sourceSha256: original.sourceSha256, alteredOf: original.alteredOf,
    animationStatus: 'missing', canonExact: false, automaticEncounter: false,
    alphaBounds: Object.freeze(art.alphaBounds), pivot: Object.freeze(art.pivot) });
}));
export const USER_SPECIMEN_GROUPS_V106 = Object.freeze([...new Set(USER_SPECIMEN_ART_V106.map(art => art.groupId))]
  .map(id => Object.freeze({ id, views: Object.freeze(USER_SPECIMEN_ART_V106.filter(art => art.groupId === id)) })));
export function getSpecimenPlacementV106(art, position = .5, viewport = { width: 800, height: 380 }) {
  const w = Math.max(1, Number(viewport.width) || 800), h = Math.max(1, Number(viewport.height) || 380);
  const [left, top, right, bottom] = art.alphaBounds;
  const margin = Math.min(12, w * .08);
  const scale = Math.min((w * .68) / (right - left), (h * .60) / (bottom - top));
  const visualWidth = (right - left) * scale;
  const center = Math.max(visualWidth / 2 + margin, Math.min(w - visualWidth / 2 - margin,
    (Number.isFinite(Number(position)) ? Number(position) : .5) * w));
  const bottomY = art.role === 'aquatic-specimen' ? h * .65 : h * .88;
  return Object.freeze({ x: center - (left + right) / 2 * scale,
    y: bottomY - bottom * scale, width: art.sourceWidth * scale, height: art.sourceHeight * scale,
    bounds: Object.freeze({ left: center - visualWidth / 2, right: center + visualWidth / 2, top: bottomY - (bottom - top) * scale, bottom: bottomY }) });
}
