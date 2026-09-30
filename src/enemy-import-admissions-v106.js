/** Native files admitted after per-image alpha and opaque-background visual review.
 * These are static adaptations; original documentary files remain unchanged.
 * A source reference, a successful tool call or a pending review is not admission. */
const freezeAdmission = entry => Object.freeze({ ...entry,
  alphaBounds: Object.freeze(entry.alphaBounds), pivot: Object.freeze(entry.pivot) });

export const ENEMY_IMPORT_ADMISSIONS_V106 = Object.freeze([
  {
    "slug": "engineer-battlesuit",
    "referenceId": "pack-v100-engineer-battlesuit",
    "path": "/assets/openai/sprites/static-import-v106/engineer-battlesuit.png",
    "sha256": "ac70046fea2137b88645df096713e9a8740d8916c7fde59f03d4514d7d055a5d",
    "sourceWidth": 1119,
    "sourceHeight": 1405,
    "alphaBounds": [
      361,
      30,
      822,
      1389
    ],
    "pivot": {
      "x": 0.54,
      "y": 0.9886120996441281
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Whole silhouette preserved, backdrop and floor absent. Minor native edge fringe retained. Static adaptation, not canonExact or animation."
  },
  {
    "slug": "engineer-behemotsuit",
    "referenceId": "pack-v100-engineer-behemotsuit",
    "path": "/assets/openai/sprites/static-import-v106/engineer-behemotsuit.png",
    "sha256": "43a10e3f3e0fc80f4a18af5efcec45aa2fda0b8012beb136590765855be9ff24",
    "sourceWidth": 1341,
    "sourceHeight": 1173,
    "alphaBounds": [
      263,
      19,
      1229,
      1163
    ],
    "pivot": {
      "x": 0.43,
      "y": 0.9914748508098892
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Whole body and blade preserved; native bright edge fringes, stronger highlights than source. Frontal pose, facing +1 is a rendering convention not a canonical profile."
  },
  {
    "slug": "engineer-ceremonialsuit",
    "referenceId": "pack-v100-engineer-ceremonialsuit",
    "path": "/assets/openai/sprites/static-import-v106/engineer-ceremonialsuit.png",
    "sha256": "5ef5669cc6ef4dc1e8540ced1eb687ff7875f97963b8b4b05795a581a069fa14",
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "alphaBounds": [
      192,
      19,
      827,
      1524
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9921875
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Whole hooded figure, bowl, robe and sandals preserved. Opaque-background browser composite confirms no visible halo; raw RGB preview was misleading."
  },
  {
    "slug": "engineer-mala-kak",
    "referenceId": "pack-v100-engineer-mala-kak",
    "path": "/assets/openai/sprites/static-import-v106/engineer-mala-kak.png",
    "sha256": "1037a725cd7b40189c4c2080659360999aba5ba956136583a061c66d22e94d02",
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "alphaBounds": [
      247,
      21,
      775,
      1515
    ],
    "pivot": {
      "x": 0.52,
      "y": 0.986328125
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Adaptation: source portrait ended below knees; robe and feet were completed for a full-body silhouette. Trunk, purple/teal drapery and upper-body identity preserved. No visible halo in browser composites."
  },
  {
    "slug": "engineer-original-space-jokey-variant",
    "referenceId": "pack-v100-engineer-original-space-jokey-variant",
    "path": "/assets/openai/sprites/static-import-v106/engineer-original-space-jokey-variant.png",
    "sha256": "e385a7d5d34cef3874570d36988d85e9aee4678ee550423a4b8b06fcbc1361ea",
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "alphaBounds": [
      224,
      7,
      825,
      1527
    ],
    "pivot": {
      "x": 0.51,
      "y": 0.994140625
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Whole star-shaped crest, hands and feet preserved. Narrow but nonzero native margins (7px top, 9px bottom); no silhouette clipping. Frontal rendering facing is a convention. No actual halo in browser composites."
  },
  {
    "slug": "engineer-respirator",
    "referenceId": "pack-v100-engineer-respirator",
    "path": "/assets/openai/sprites/static-import-v106/engineer-respirator.png",
    "sha256": "f28aaede973fe09efba81c2ed631587f41999741fb1366c80f3f65fec584a97d",
    "sourceWidth": 1085,
    "sourceHeight": 1449,
    "alphaBounds": [
      291,
      50,
      748,
      1433
    ],
    "pivot": {
      "x": 0.48,
      "y": 0.9889579020013802
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Whole respirator humanoid preserved, both boots grounded. No actual halo on opaque browser backgrounds. Static 3/4 adaptation, not a side-view animation."
  },
  {
    "slug": "engineer-spacejokey",
    "referenceId": "pack-v100-engineer-spacejokey",
    "path": "/assets/openai/sprites/static-import-v106/engineer-spacejokey.png",
    "sha256": "891cf221a535c4c30b019060bc96600397c5074d0eb86d6c48f6ad398cf7c6a1",
    "sourceWidth": 737,
    "sourceHeight": 2135,
    "alphaBounds": [
      120,
      46,
      610,
      2112
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9892271662763467
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Complete narrow side-profile subject, trunk connection, fingers and toes preserved. No actual halo on opaque browser backgrounds."
  },
  {
    "slug": "engineer-suit-open",
    "referenceId": "pack-v100-engineer-suit-open",
    "path": "/assets/openai/sprites/static-import-v106/engineer-suit-open.png",
    "sha256": "7910ae292e065168c431e133c858b587ab1fff9ec1623b767e7829d69cb464e0",
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "alphaBounds": [
      263,
      22,
      769,
      1521
    ],
    "pivot": {
      "x": 0.51,
      "y": 0.990234375
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Complete unhelmeted head, armored torso, open hands and feet preserved. Browser composite confirms no actual backdrop/halo."
  },
  {
    "slug": "engineer-wararmor",
    "referenceId": "pack-v100-engineer-wararmor",
    "path": "/assets/openai/sprites/static-import-v106/engineer-wararmor.png",
    "sha256": "93cc507c3cd7c05d9cbb28887cb55bb60db893e03f1bd43a6d59ea06757ddfdd",
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "alphaBounds": [
      94,
      48,
      851,
      1498
    ],
    "pivot": {
      "x": 0.62,
      "y": 0.9752604166666666
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Whole armed humanoid preserved, raised weapon and feet included. Ship machine/chair and jars removed. No actual halo on opaque browser backgrounds."
  },
  {
    "slug": "engineer-woman",
    "referenceId": "pack-v100-engineer-woman",
    "path": "/assets/openai/sprites/static-import-v106/engineer-woman.png",
    "sha256": "1516ee07daa2d7378732e5935a6451f6debbde552311943522296d6a9af77da1",
    "sourceWidth": 1114,
    "sourceHeight": 1412,
    "alphaBounds": [
      324,
      29,
      792,
      1376
    ],
    "pivot": {
      "x": 0.5,
      "y": 0.9745042492917847
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Whole adult armored woman, face, hands and toes preserved. Front/3/4 stance: facing is a render convention. No actual halo on opaque browser backgrounds."
  },
  {
    "slug": "synth-eloise",
    "referenceId": "pack-v100-synth-eloise",
    "path": "/assets/openai/sprites/static-import-v106/synth-eloise.png",
    "sha256": "59c16d4b87a66e65d9e83a172a66a307bbfb8c5f0e536e0bf1cfc731f77d1dd3",
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "alphaBounds": [
      151,
      11,
      884,
      1496
    ],
    "pivot": {
      "x": 0.53,
      "y": 0.9739583333333334
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Whole supplied adult synthetic-adaptation design preserved, including dorsal tube tips, modified forearm, green fluid strands and both boots. Hair/tubes completed within safe frame where source touched the edge. No actual halo on opaque browser backgrounds."
  },
  {
    "slug": "synth-jerri-1",
    "referenceId": "pack-v100-synth-jerri-1",
    "path": "/assets/openai/sprites/static-import-v106/synth-jerri-1.png",
    "sha256": "d519f175452f9d785c9feba77014405b54699d162147c283c2d83c5253b6145a",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "alphaBounds": [
      181,
      39,
      1079,
      1226
    ],
    "pivot": {
      "x": 0.56,
      "y": 0.9776714513556619
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Bronze synthetic Jerri variant preserved separately, with grey rifle, cigar, both feet and entire looping tail/blade. No background smoke/floor. No visible halo in browser composites."
  },
  {
    "slug": "synth-jerri-2",
    "referenceId": "pack-v100-synth-jerri-2",
    "path": "/assets/openai/sprites/static-import-v106/synth-jerri-2.png",
    "sha256": "45869ec34206c04275202587568f4815593c368032404f03f54153d0fdb9e011",
    "sourceWidth": 1254,
    "sourceHeight": 1254,
    "alphaBounds": [
      166,
      31,
      1078,
      1233
    ],
    "pivot": {
      "x": 0.56,
      "y": 0.9832535885167464
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Black synthetic Jerri variant preserved separately, with olive rifle, cigar, both feet and entire looping tail/blade. No background smoke/floor. No visible halo in browser composites."
  },
  {
    "slug": "wy-apesuit",
    "referenceId": "pack-v100-wy-apesuit",
    "path": "/assets/openai/sprites/static-import-v106/wy-apesuit.png",
    "sha256": "f5c943f4af8cfd9b3148774faafc1433f511b44f626857a2b803c51464d1bf24",
    "sourceWidth": 1102,
    "sourceHeight": 1427,
    "alphaBounds": [
      366,
      45,
      798,
      1375
    ],
    "pivot": {
      "x": 0.52,
      "y": 0.9635599159074982
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Complete supplied human protective APE suit, helmet/cage, gloves, belt, canister and boots preserved. Static adaptation; no implied canon-exact equipment reconstruction. No visible halo in browser composites."
  },
  {
    "slug": "wy-covenant-david",
    "referenceId": "pack-v100-wy-covenant-david",
    "path": "/assets/openai/sprites/static-import-v106/wy-covenant-david.png",
    "sha256": "f0b7e966868af9f5020ad84f9413ec20de0932bbd1b304ae507e7acf9ca6bf73",
    "sourceWidth": 1198,
    "sourceHeight": 1313,
    "alphaBounds": [
      469,
      32,
      722,
      1277
    ],
    "pivot": {
      "x": 0.51,
      "y": 0.9725818735719726
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Complete supplied David synthetic side profile, cap, clothing, patches and boots preserved. Face remains a generated adaptation, not an exact reconstruction claim. No visible halo in browser composites."
  },
  {
    "slug": "alien-king-from-alien-extemrination",
    "referenceId": "pack-v100-alien-king-from-alien-extemrination",
    "path": "/assets/openai/sprites/static-import-v106/alien-king-from-alien-extemrination.png",
    "sha256": "6fea0618f4565efbef7acd42a387f38aa42e30303f921936e902842ff3999868",
    "sourceWidth": 1402,
    "sourceHeight": 1122,
    "alphaBounds": [
      9,
      15,
      1363,
      1080
    ],
    "pivot": {
      "x": 0.57,
      "y": 0.9625668449197861
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Corps entier et appendices distinctifs conservés, vue oblique presque frontale de la source et non profil strict. Crête bleu-gris, brun cuivre, griffes et pointes présents. Quelques franges colorées natives et léger renforcement de brillance ; pose fixe adaptée, ni pixels 1:1 ni animation."
  },
  {
    "slug": "green-alien-king",
    "referenceId": "pack-v100-green-alien-king",
    "path": "/assets/openai/sprites/static-import-v106/green-alien-king.png",
    "sha256": "6d821694425ae18150bd948a1dd0164d2024c669817e2c25635ca8f2ba057a79",
    "sourceWidth": 1312,
    "sourceHeight": 1199,
    "alphaBounds": [
      216,
      5,
      1165,
      1192
    ],
    "pivot": {
      "x": 0.47,
      "y": 0.994161801501251
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Vue latérale gauche seule, sans fusion avec la vue frontale ; original deux vues conservé. Noir/vert, cornes, lames, pieds et queue conservés. Marge haute native étroite de 5px et basse 7px, contours colorés discrets ; aucune coupure détectée à alpha>=16. Pose statique adaptée non 1:1."
  },
  {
    "slug": "xeno-gorillaxeno",
    "referenceId": "pack-v100-xeno-gorillaxeno",
    "path": "/assets/openai/sprites/static-import-v106/xeno-gorillaxeno.png",
    "sha256": "130e1d46adfaa2824bfd5d0616817f4eedac4b764511d9c34306adb2ee10a4fc",
    "sourceWidth": 1602,
    "sourceHeight": 982,
    "alphaBounds": [
      85,
      11,
      1579,
      976
    ],
    "pivot": {
      "x": 0.38,
      "y": 0.9938900203665988
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Quadrupède complet, poings porteurs, membres arrière, tête/crête et queue préservés. Points bleus présents uniquement sur la carapace. Pose et palette conservées ; fins liserés natifs clairs/colorés, microtextures réinterprétées. Sprite fixe adapté non 1:1 et non animé."
  },
  {
    "slug": "xeno-kingrogue",
    "referenceId": "pack-v100-xeno-kingrogue",
    "path": "/assets/openai/sprites/static-import-v106/xeno-kingrogue.png",
    "sha256": "7d8d9bbe52b72be700b975999effb39b7045f03a59d8b3858214cae0eb9dafa1",
    "sourceWidth": 1492,
    "sourceHeight": 1054,
    "alphaBounds": [
      106,
      14,
      1356,
      1036
    ],
    "pivot": {
      "x": 0.57,
      "y": 0.9829222011385199
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Silhouette complète contrôlée : couronne, appendices dorsaux, mains, deux jambes et boucle de queue/lame conservés. Le rendu natif renforce légèrement la saturation magenta et les reflets, avec une fine frange colorée autour de certaines pointes. Adaptation statique, non reproduction pixel-à-pixel ou canon certifié. Crédit PRIME1 STUDIO à afficher dans le dossier/métadonnées, original crédité intact."
  },
  {
    "slug": "xeno-spacejokeygiant",
    "referenceId": "pack-v100-xeno-spacejokeygiant",
    "path": "/assets/openai/sprites/static-import-v106/xeno-spacejokeygiant.png",
    "sha256": "d8a4ef94f428d918cda37ce7b8787763a45c4d3b98df2e752e8b7410c41700f3",
    "sourceWidth": 1281,
    "sourceHeight": 1227,
    "alphaBounds": [
      209,
      34,
      948,
      1209
    ],
    "pivot": {
      "x": 0.44,
      "y": 0.9853300733496333
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Silhouette complète contrôlée, grand dôme sans trompe, bras/mains, deux jambes/pieds et queue conservés. La génération accentue les reflets cuivre et violets ainsi qu'une fine frange colorée native ; proportions et pose reconnaissables. Aucun changement d'anatomie majeur constaté. Adaptation statique non certifiée 1:1/canon, aucune taille lore déduite du nom Giant."
  }
,
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
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1."
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
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1."
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
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1."
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
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1."
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
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1."
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
    "reviewNote": "Larve nommée par la source ; queue compacte conservée, pas de cycle biologique inventé."
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
    "reviewNote": "Découpe native fixe ; silhouette complète, revue sur blanc, bleu nuit et magenta sans halo visible. Adaptation non certifiée 1:1."
  }

,
  {
    "slug": "game-afe-synth-warden",
    "referenceId": "game-afe-synth-warden",
    "path": "/assets/openai/sprites/static-game-v106/game-afe-synth-warden.png",
    "sha256": "019e4e3a3c1c184b8ded522ce17d129ba844965abbfbcb62d61d0f7598d9462e",
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "alphaBounds": [
      91,
      37,
      913,
      1505
    ],
    "pivot": {
      "x": 0.62,
      "y": 0.9798177083333334
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Full native PNG composited without visible background, halo or cropped anatomy; static adaptation only. Arme représentée ; tir existant de simulation sans acide.",
    "reference": {
      "id": "game-afe-synth-warden",
      "name": "Synth Warden",
      "work": "Aliens: Fireteam Elite (2021)",
      "biology": "synthetic",
      "kind": "organism",
      "stage": "adult",
      "faction": "Weyland-Yutani",
      "lineage": "Synth Warden",
      "alteredOf": null,
      "relationship": "source-game-adaptation",
      "referenceUrls": [
        "https://www.gamespot.com/articles/aliens-fireteam-elite-synthetic-enemy-guide-every-type-and-how-to-kill-them/1100-6495625/"
      ],
      "sourceCredit": null
    }
  },
  {
    "slug": "game-afe2-warden",
    "referenceId": "game-afe2-warden",
    "path": "/assets/openai/sprites/static-game-v106/game-afe2-warden.png",
    "sha256": "6207a125227262064da6aa244f42aa206364777ddea5f2d87bce05fd08e1c19a",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      18,
      35,
      1520,
      1012
    ],
    "pivot": {
      "x": 0.64,
      "y": 0.98828125
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Full native PNG composited without visible background, halo or cropped anatomy; static adaptation only. Aucune arme à feu ajoutée au comportement.",
    "reference": {
      "id": "game-afe2-warden",
      "name": "Warden",
      "work": "Aliens: Fireteam Elite 2 (2026)",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "faction": "Hive",
      "lineage": "Warden",
      "alteredOf": null,
      "relationship": "source-game-adaptation",
      "referenceUrls": [
        "https://steamcommunity.com/app/3448650/allnews/",
        "https://www.avpcentral.com/images/aliens-fireteam-2-xenomorph-types/warden.webp"
      ],
      "sourceCredit": null
    }
  },
  {
    "slug": "game-afe2-bulwark",
    "referenceId": "game-afe2-bulwark",
    "path": "/assets/openai/sprites/static-game-v106/game-afe2-bulwark.png",
    "sha256": "4841d54ff6e1e7b98c06d4496f1f7fb188a5e981eb835ce67e7a97dd36c9966b",
    "sourceWidth": 1536,
    "sourceHeight": 1024,
    "alphaBounds": [
      79,
      21,
      1467,
      1003
    ],
    "pivot": {
      "x": 0.57,
      "y": 0.9794921875
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Full native PNG composited without visible background, halo or cropped anatomy; static adaptation only. Aucune arme à feu ajoutée au comportement.",
    "reference": {
      "id": "game-afe2-bulwark",
      "name": "Bulwark",
      "work": "Aliens: Fireteam Elite 2 (2026)",
      "biology": "synthetic",
      "kind": "organism",
      "stage": "adult",
      "faction": "Weyland-Yutani",
      "lineage": "Bulwark",
      "alteredOf": null,
      "relationship": "source-game-adaptation",
      "referenceUrls": [
        "https://www.avpcentral.com/aliens-fireteam-2-xenomorph-types",
        "https://www.avpcentral.com/images/aliens-fireteam-2-xenomorph-types/bulwark.webp"
      ],
      "sourceCredit": null
    }
  },
  {
    "slug": "game-dd-wy-commando",
    "referenceId": "game-dd-wy-commando",
    "path": "/assets/openai/sprites/static-game-v106/game-dd-wy-commando.png",
    "sha256": "1bcafd4c6b5e06611d0184c317f76422749d43e4b97a14f39316eef3eca3c012",
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "alphaBounds": [
      104,
      21,
      802,
      1476
    ],
    "pivot": {
      "x": 0.54,
      "y": 0.9609375
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Full native PNG composited without visible background, halo or cropped anatomy; static adaptation only. Arme représentée ; tir existant de simulation sans acide.",
    "reference": {
      "id": "game-dd-wy-commando",
      "name": "Weyland-Yutani Commando",
      "work": "Aliens: Dark Descent (2023)",
      "biology": "human",
      "kind": "organism",
      "stage": "adult",
      "faction": "Weyland-Yutani",
      "lineage": "Weyland-Yutani Commando",
      "alteredOf": "enemy-043-weyland-yutani-commando",
      "relationship": "source-game-altered",
      "referenceUrls": [
        "https://www.raymondsebastien.com/projects/JvgEP0",
        "https://i.pinimg.com/736x/9e/70/b6/9e70b6bd630a3c4dca3e80bf63c0cb7b.jpg"
      ],
      "sourceCredit": "Raymond Sébastien — concept de production"
    }
  },
  {
    "slug": "game-afe2-exploder",
    "referenceId": "game-afe2-exploder",
    "path": "/assets/openai/sprites/static-game-v106/game-afe2-exploder.png",
    "sha256": "54719bf217e334ec6446c7bf0d762252d5d7216cbca17a8b95eadc8a242d4cb5",
    "sourceWidth": 1672,
    "sourceHeight": 941,
    "alphaBounds": [
      34,
      79,
      1658,
      885
    ],
    "pivot": {
      "x": 0.48,
      "y": 0.9404888416578109
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Full native PNG composited without visible background, halo or cropped anatomy; static adaptation only. Explosion spécifique non implémentée ; mêlée terrestre simplifiée. Aucune arme à feu ajoutée au comportement.",
    "reference": {
      "id": "game-afe2-exploder",
      "name": "Exploder",
      "work": "Aliens: Fireteam Elite 2 (2026)",
      "biology": "xenomorph",
      "kind": "organism",
      "stage": "adult",
      "faction": "Hive",
      "lineage": "Exploder",
      "alteredOf": null,
      "relationship": "source-game-adaptation",
      "referenceUrls": [
        "https://steamcommunity.com/app/3448650/allnews/",
        "https://www.avpcentral.com/images/aliens-fireteam-2-xenomorph-types/exploder.webp"
      ],
      "sourceCredit": null
    }
  },
  {
    "slug": "game-afe2-harbinger",
    "referenceId": "game-afe2-harbinger",
    "path": "/assets/openai/sprites/static-game-v106/game-afe2-harbinger.png",
    "sha256": "b4075997666e8ac06a1bae21f62f11ff6813218e7208c7e2d8946fe0316259f4",
    "sourceWidth": 1448,
    "sourceHeight": 1086,
    "alphaBounds": [
      53,
      23,
      1444,
      1075
    ],
    "pivot": {
      "x": 0.58,
      "y": 0.9898710865561694
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Full native PNG composited without visible background, halo or cropped anatomy; static adaptation only. Pouvoirs spécifiques non implémentés ; mêlée terrestre simplifiée. Aucune arme à feu ajoutée au comportement.",
    "reference": {
      "id": "game-afe2-harbinger",
      "name": "Harbinger",
      "work": "Aliens: Fireteam Elite 2 (2026)",
      "biology": "pathogen",
      "kind": "organism",
      "stage": "adult",
      "faction": "Pathogen",
      "lineage": "Harbinger",
      "alteredOf": null,
      "relationship": "source-game-adaptation",
      "referenceUrls": [
        "https://steamcommunity.com/app/3448650/allnews/",
        "https://www.avpcentral.com/images/aliens-fireteam-2-xenomorph-types/harbinger.webp"
      ],
      "sourceCredit": null
    }
  },
  {
    "slug": "game-dd-synthetic",
    "referenceId": "game-dd-synthetic",
    "path": "/assets/openai/sprites/static-game-v106/game-dd-synthetic.png",
    "sha256": "9c18db44333a21bdb9f7c1d9857c9ca15f4cdea3846c3ee8918a0136b3e67bf5",
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "alphaBounds": [
      340,
      77,
      737,
      1460
    ],
    "pivot": {
      "x": 0.52,
      "y": 0.9505208333333334
    },
    "sourceFacing": 1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Full native PNG composited without visible background, halo or cropped anatomy; static adaptation only. Aucune arme à feu ajoutée au comportement.",
    "reference": {
      "id": "game-dd-synthetic",
      "name": "Synthetic",
      "work": "Aliens: Dark Descent (2023)",
      "biology": "synthetic",
      "kind": "organism",
      "stage": "adult",
      "faction": "Weyland-Yutani",
      "lineage": "Synthetic",
      "alteredOf": null,
      "relationship": "source-game-adaptation",
      "referenceUrls": [
        "https://www.raymondsebastien.com/projects/JvgEP0",
        "https://i.pinimg.com/originals/de/1c/97/de1c974670d0be2961963cb98ab73c9c.jpg"
      ],
      "sourceCredit": "Raymond Sébastien — concept de production"
    }
  },
  {
    "slug": "game-dd-guardian",
    "referenceId": "game-dd-guardian",
    "path": "/assets/openai/sprites/static-game-v106/game-dd-guardian.png",
    "sha256": "9c78992ce49b080c73fef68a9813a1717970b5dae4be4e03d409a9876169d1c8",
    "sourceWidth": 1024,
    "sourceHeight": 1536,
    "alphaBounds": [
      102,
      50,
      897,
      1486
    ],
    "pivot": {
      "x": 0.6,
      "y": 0.9674479166666666
    },
    "sourceFacing": -1,
    "reviewStatus": "accepted-static-adaptation",
    "reviewNote": "Full native PNG composited without visible background, halo or cropped anatomy; static adaptation only. Arme représentée ; tir existant de simulation sans acide.",
    "reference": {
      "id": "game-dd-guardian",
      "name": "Guardian — Darwin Era",
      "work": "Aliens: Dark Descent (2023)",
      "biology": "human",
      "kind": "organism",
      "stage": "adult",
      "faction": "Darwin Era",
      "lineage": "Guardian — Darwin Era",
      "alteredOf": null,
      "relationship": "source-game-adaptation",
      "referenceUrls": [
        "https://www.raymondsebastien.com/projects/g0Va4P",
        "https://i.pinimg.com/736x/ea/c1/0b/eac10badc42ac5f8c2787720e654fcb8.jpg",
        "https://www.avpcentral.com/images/taming-a-xenomorph/xenomorph-cult-guardian.webp"
      ],
      "sourceCredit": "Raymond Sébastien — concept de production"
    }
  }

].map(freezeAdmission));
