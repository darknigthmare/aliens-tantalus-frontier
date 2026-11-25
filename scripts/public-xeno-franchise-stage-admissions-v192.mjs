import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { XENO_TRIALS_FRANCHISE_STAGES_V192 } from '../src/xeno-trials-franchise-stages-v192.js';

const prefix = 'assets/openai/stages/xeno-trials-v192';
export const PUBLIC_XENO_FRANCHISE_STAGE_DIRECTORIES_V192 = Object.freeze([
  prefix, `${prefix}/screen`, `${prefix}/games`, `${prefix}/print`
]);
// Exact accepted original-image identities and measured crops, pinned before release.
export const PUBLIC_XENO_FRANCHISE_STAGE_IMAGES_V192 = Object.freeze([
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/nostromo-galley.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2523209,
    "colorType": 2,
    "sha256": "d1d961a054985a9e9830c73af857a3082c2eb82367872786fb225b0d4c6d1bb3",
    "sourceRects": [
      [
        0,
        0,
        1536,
        296
      ],
      [
        0,
        299,
        1536,
        405
      ],
      [
        0,
        707,
        1536,
        317
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/nostromo-chain-room.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2654537,
    "colorType": 2,
    "sha256": "8a1c04badcb4b20c924a32025101a3d130446316a190d3a578beae3daba27f86",
    "sourceRects": [
      [
        0,
        0,
        1536,
        339
      ],
      [
        0,
        343,
        1536,
        338
      ],
      [
        0,
        685,
        1536,
        339
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/lv426-derelict-pilot.png",
    "width": 2172,
    "height": 724,
    "bytes": 2388615,
    "colorType": 2,
    "sha256": "705b9e2472f28ed42aaaaa4d9e6f5f6fa7e62bfdf4966f20305ded20acb5da81",
    "sourceRects": [
      [
        0,
        0,
        2172,
        236
      ],
      [
        0,
        241,
        2172,
        237
      ],
      [
        0,
        483,
        2172,
        241
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/hadleys-hope-street.png",
    "width": 2172,
    "height": 724,
    "bytes": 2606874,
    "colorType": 2,
    "sha256": "4431eca04ed21483153a214384cae8ef8d707073d25879150e77c8aaa56427ed",
    "sourceRects": [
      [
        0,
        0,
        2172,
        237
      ],
      [
        0,
        242,
        2172,
        239
      ],
      [
        0,
        486,
        2172,
        238
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/lv426-atmosphere-hive.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2631227,
    "colorType": 2,
    "sha256": "e0fc3bf9a40957f1197217e9e1b59a34b450114a085839d365fbcc91a6ea4d42",
    "sourceRects": [
      [
        0,
        0,
        1536,
        337
      ],
      [
        0,
        342,
        1536,
        337
      ],
      [
        0,
        684,
        1536,
        340
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/sulaco-hangar.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2423544,
    "colorType": 2,
    "sha256": "b5d17af2f6afd453fa3693c26edcc7e5f09af48040274982f18f42037cd79261",
    "sourceRects": [
      [
        0,
        0,
        1536,
        304
      ],
      [
        0,
        310,
        1536,
        393
      ],
      [
        0,
        710,
        1536,
        314
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/fury161-leadworks.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2522620,
    "colorType": 2,
    "sha256": "d6c9c60e7d35f8b83d56cfb97aa1cca8551ba6eb78b8763ce449b3b59bacec9f",
    "sourceRects": [
      [
        0,
        0,
        1536,
        337
      ],
      [
        0,
        342,
        1536,
        338
      ],
      [
        0,
        686,
        1536,
        338
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/auriga-clone-laboratory.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2337774,
    "colorType": 2,
    "sha256": "b9680479935dc9005fa71ec1137eae227d5afee4e2befed58d3fc6a55c1b39a1",
    "sourceRects": [
      [
        0,
        0,
        1536,
        339
      ],
      [
        0,
        345,
        1536,
        335
      ],
      [
        0,
        686,
        1536,
        338
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/auriga-flooded-galley.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2403189,
    "colorType": 2,
    "sha256": "758e8402cab71da7e23c35a093a1e44b68e629f9c978c566ce13b6d8b8902385",
    "sourceRects": [
      [
        0,
        0,
        1536,
        336
      ],
      [
        0,
        342,
        1536,
        337
      ],
      [
        0,
        685,
        1536,
        339
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/lv223-orrery.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2621902,
    "colorType": 2,
    "sha256": "0b6dbec645368452cc1be1bef4756bb43214d54a36e7f1a795b2d8d8f1fca0e4",
    "sourceRects": [
      [
        0,
        0,
        1536,
        320
      ],
      [
        0,
        323,
        1536,
        358
      ],
      [
        0,
        685,
        1536,
        339
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/lv223-ampule-chamber.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2414059,
    "colorType": 2,
    "sha256": "7cdb16f4a981b396f7cf18fa0b948d7e94c8a96187a53b3d0b5eba66d301a481",
    "sourceRects": [
      [
        0,
        0,
        1536,
        333
      ],
      [
        0,
        337,
        1536,
        341
      ],
      [
        0,
        682,
        1536,
        342
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/planet4-necropolis.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2753964,
    "colorType": 2,
    "sha256": "1f4bd26439489f98e509f4608af6a0ed7050ddbd5e18f86412bd4ffb5a6d7cf8",
    "sourceRects": [
      [
        0,
        0,
        1536,
        338
      ],
      [
        0,
        343,
        1536,
        337
      ],
      [
        0,
        685,
        1536,
        339
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/planet4-wheat-field.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2733419,
    "colorType": 2,
    "sha256": "3f2723ac5b1c96850957df286dbb4c538ee5d0de759cb8d65affad1695610574",
    "sourceRects": [
      [
        0,
        0,
        1536,
        338
      ],
      [
        0,
        341,
        1536,
        339
      ],
      [
        0,
        683,
        1536,
        341
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/renaissance-cryo-chamber.png",
    "width": 1536,
    "height": 1024,
    "bytes": 3003317,
    "colorType": 2,
    "sha256": "dad60b863259de4be1304ffefb9ddfae1d557d8b1a9cb7e889636d1070612c64",
    "sourceRects": [
      [
        0,
        0,
        1536,
        306
      ],
      [
        0,
        312,
        1536,
        402
      ],
      [
        0,
        720,
        1536,
        304
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/jacksons-star-street.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2409258,
    "colorType": 2,
    "sha256": "803460306f67f4405eafb021b39961fcf49c7c59ef1df12dd321710bc70cff96",
    "sourceRects": [
      [
        0,
        0,
        1536,
        337
      ],
      [
        0,
        342,
        1536,
        339
      ],
      [
        0,
        686,
        1536,
        338
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/maginot-specimen-hold.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2546378,
    "colorType": 2,
    "sha256": "b83b5416ccb2cc4e42af6facf98070bf8bce628cdce0ac72868403cc10713ff0",
    "sourceRects": [
      [
        0,
        0,
        1536,
        335
      ],
      [
        0,
        341,
        1536,
        338
      ],
      [
        0,
        685,
        1536,
        339
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/maginot-bridge.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2474981,
    "colorType": 2,
    "sha256": "8319297a331349cae2f6f7fef462abd3a786b946f146764e0482bd885e47cedf",
    "sourceRects": [
      [
        0,
        0,
        1536,
        335
      ],
      [
        0,
        343,
        1536,
        336
      ],
      [
        0,
        687,
        1536,
        337
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/new-siam-crash-site.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2722781,
    "colorType": 2,
    "sha256": "9b9aaaf4481f797e06be2924a3ce3a75160ab34dea4477f9e05ecc8c86006d00",
    "sourceRects": [
      [
        0,
        0,
        1536,
        337
      ],
      [
        0,
        342,
        1536,
        338
      ],
      [
        0,
        687,
        1536,
        337
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/neverland-laboratory.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2457927,
    "colorType": 2,
    "sha256": "47e6ce18d3ca9a636a5fd02d254f4aa288d10a1037d00a9f73138d0b78f9f875",
    "sourceRects": [
      [
        0,
        0,
        1536,
        336
      ],
      [
        0,
        344,
        1536,
        335
      ],
      [
        0,
        686,
        1536,
        338
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/screen/neverland-jungle.png",
    "width": 1536,
    "height": 1024,
    "bytes": 3170315,
    "colorType": 2,
    "sha256": "2c07b4ea6dfba35ee66dabb007e2c7bde255a1b84ca3a6b9201d8963ea6a4969",
    "sourceRects": [
      [
        0,
        0,
        1536,
        337
      ],
      [
        0,
        342,
        1536,
        337
      ],
      [
        0,
        684,
        1536,
        340
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/sevastopol-lorenz-systech.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2384774,
    "colorType": 2,
    "sha256": "48e670315901e4f322ea6006bd5ab999848abd462ea01d6b01e2a6a6fb3a6872",
    "sourceRects": [
      [
        0,
        0,
        1536,
        338
      ],
      [
        0,
        341,
        1536,
        363
      ],
      [
        0,
        707,
        1536,
        317
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/sevastopol-san-cristobal.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2297933,
    "colorType": 2,
    "sha256": "ec2998426de29eb887062ddd8b8c36f2c50b138fa3ca3f8b4ea12930de5cee0c",
    "sourceRects": [
      [
        0,
        0,
        1536,
        315
      ],
      [
        0,
        319,
        1536,
        418
      ],
      [
        0,
        742,
        1536,
        282
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/sevastopol-reactor-nest.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2605031,
    "colorType": 2,
    "sha256": "b6fed92716398be8c41e58bbac4ba2852fff9b770cea7e66e4c1cbb864b27ecf",
    "sourceRects": [
      [
        0,
        0,
        1536,
        337
      ],
      [
        0,
        342,
        1536,
        339
      ],
      [
        0,
        685,
        1536,
        339
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/lv1201-forward-facility.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2969189,
    "colorType": 2,
    "sha256": "576113bba6e7b512b2fb841a12381a213073b08a55110d6b0749d67f931ad598",
    "sourceRects": [
      [
        0,
        0,
        1536,
        338
      ],
      [
        0,
        342,
        1536,
        338
      ],
      [
        0,
        684,
        1536,
        340
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/lv1201-ancient-ruins.png",
    "width": 1536,
    "height": 1024,
    "bytes": 3316773,
    "colorType": 2,
    "sha256": "089e4ab554fd8014fcd74dd47d369286737c9034e215b3cb734ee7d2a09d02d3",
    "sourceRects": [
      [
        0,
        0,
        1536,
        336
      ],
      [
        0,
        342,
        1536,
        336
      ],
      [
        0,
        684,
        1536,
        340
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/bg386-freya-prospect.png",
    "width": 1536,
    "height": 1024,
    "bytes": 3556506,
    "colorType": 2,
    "sha256": "8ac793a3913f423b1f6b0d31ff2928e3e258c2b8ba1de9d33958ace590bdfd96",
    "sourceRects": [
      [
        0,
        0,
        1536,
        314
      ],
      [
        0,
        318,
        1536,
        364
      ],
      [
        0,
        685,
        1536,
        339
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/bg386-pyramid.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2770974,
    "colorType": 2,
    "sha256": "6160a9766970e9b5335b737dd6f34db9069f1034a730ee03871b17fa86eb1b65",
    "sourceRects": [
      [
        0,
        0,
        1536,
        336
      ],
      [
        0,
        341,
        1536,
        339
      ],
      [
        0,
        685,
        1536,
        339
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/katanga-refinery.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2836892,
    "colorType": 2,
    "sha256": "95304ac474b397207ffbec6efd627fb6d2096babd15dd868111d6f57344d4bed",
    "sourceRects": [
      [
        0,
        0,
        1536,
        337
      ],
      [
        0,
        343,
        1536,
        338
      ],
      [
        0,
        687,
        1536,
        337
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/endeavor-hangar.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2672232,
    "colorType": 2,
    "sha256": "e9bfba3276e0ed09f749120c82a91130afe3eef7325dec77c85e411f017a7c08",
    "sourceRects": [
      [
        0,
        0,
        1536,
        338
      ],
      [
        0,
        341,
        1536,
        340
      ],
      [
        0,
        684,
        1536,
        340
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/lv895-engineer-ruins.png",
    "width": 1536,
    "height": 1024,
    "bytes": 3061725,
    "colorType": 2,
    "sha256": "da667028cd088ccfacde51ec69d3f68bc61aa1c0102c16a4b179355aea3ac65e",
    "sourceRects": [
      [
        0,
        0,
        1536,
        337
      ],
      [
        0,
        341,
        1536,
        338
      ],
      [
        0,
        683,
        1536,
        341
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/lethe-dead-hills.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2804325,
    "colorType": 2,
    "sha256": "871ffcc7041091fe6da8d6719f2749da40f7b3e7ec5ce9db97291fd0343599cf",
    "sourceRects": [
      [
        0,
        0,
        1536,
        337
      ],
      [
        0,
        342,
        1536,
        340
      ],
      [
        0,
        686,
        1536,
        338
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/lethe-berkleys-docks.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2710128,
    "colorType": 2,
    "sha256": "55ec6435783644a1676cbd3beadeec3d3d63b08612f72d3a854a7913e050b667",
    "sourceRects": [
      [
        0,
        0,
        1536,
        337
      ],
      [
        0,
        342,
        1536,
        337
      ],
      [
        0,
        684,
        1536,
        340
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/lethe-pioneer-station.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2719669,
    "colorType": 2,
    "sha256": "29767429874a8bc548322968b4e5791e7159ca463ceb6b3beff22f7001a683bf",
    "sourceRects": [
      [
        0,
        0,
        1536,
        344
      ],
      [
        0,
        348,
        1536,
        379
      ],
      [
        0,
        732,
        1536,
        292
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/otago-flight-deck.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2551726,
    "colorType": 2,
    "sha256": "b042c36b08974c1723542e5363c4258793126037901df3edfc778d06a9c29228",
    "sourceRects": [
      [
        0,
        0,
        1536,
        335
      ],
      [
        0,
        339,
        1536,
        381
      ],
      [
        0,
        724,
        1536,
        300
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/games/purdan-zeta-colony.png",
    "width": 1536,
    "height": 1024,
    "bytes": 2785568,
    "colorType": 2,
    "sha256": "d33134258f0e2759c1835e1b4bb3f83b8814ed9f6447a5d7e6805823b225f7eb",
    "sourceRects": [
      [
        0,
        0,
        1536,
        337
      ],
      [
        0,
        342,
        1536,
        341
      ],
      [
        0,
        689,
        1536,
        335
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/ryushi-prosperity-wells.png",
    "width": 1774,
    "height": 887,
    "bytes": 2610944,
    "colorType": 2,
    "sha256": "dc50d20a20f7ea7ded9b4bd9bde6dc5741862509d6201917a5f5378f520c6ee2",
    "sourceRects": [
      [
        0,
        0,
        1774,
        287
      ],
      [
        0,
        291,
        1774,
        330
      ],
      [
        0,
        625,
        1774,
        262
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/charon-rogue-lab.png",
    "width": 2172,
    "height": 724,
    "bytes": 2370791,
    "colorType": 2,
    "sha256": "21c93e6f9f0487d8224cf3a8e41d18026a50cfae87165640806295f8763c12b6",
    "sourceRects": [
      [
        0,
        0,
        2172,
        214
      ],
      [
        0,
        223,
        2172,
        286
      ],
      [
        0,
        511,
        2172,
        213
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/innominata-labyrinth.png",
    "width": 2172,
    "height": 724,
    "bytes": 2141404,
    "colorType": 2,
    "sha256": "eff888fc1f07fc30d6bd4c1c65ee9b761ade346d26cdcf9951b9894e3431e1bb",
    "sourceRects": [
      [
        0,
        0,
        2172,
        215
      ],
      [
        0,
        224,
        2172,
        278
      ],
      [
        0,
        504,
        2172,
        220
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/sphacteria-dead-orbit.png",
    "width": 2172,
    "height": 724,
    "bytes": 2658996,
    "colorType": 2,
    "sha256": "e4c67cd99512c91541508f46ab651647999ac2474fc4522f141f0efc5d306d10",
    "sourceRects": [
      [
        0,
        0,
        2172,
        218
      ],
      [
        0,
        221,
        2172,
        293
      ],
      [
        0,
        516,
        2172,
        208
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/xenomorph-prime-genocide.png",
    "width": 1672,
    "height": 941,
    "bytes": 2377309,
    "colorType": 2,
    "sha256": "654d1aadf486ac3eb19e55e5b569256719573204590014fe178c90d779c6fe67",
    "sourceRects": [
      [
        0,
        0,
        1672,
        307
      ],
      [
        0,
        311,
        1672,
        312
      ],
      [
        0,
        625,
        1672,
        316
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/epsilon-station.png",
    "width": 2172,
    "height": 724,
    "bytes": 2250560,
    "colorType": 2,
    "sha256": "6addf6baae1d6d4c94464a949aad02fd3ff3c0054ceaade46ae5898046c3e7d9",
    "sourceRects": [
      [
        0,
        0,
        2172,
        218
      ],
      [
        0,
        225,
        2172,
        260
      ],
      [
        0,
        487,
        2172,
        237
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/tobler-nine-factory.png",
    "width": 2172,
    "height": 724,
    "bytes": 2706321,
    "colorType": 2,
    "sha256": "772bede44986215228268cc82b4b48d1979843d538f8fe13cd453d1fa5ded66b",
    "sourceRects": [
      [
        0,
        0,
        2172,
        232
      ],
      [
        0,
        238,
        2172,
        242
      ],
      [
        0,
        483,
        2172,
        241
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/earth-war-city.png",
    "width": 2172,
    "height": 724,
    "bytes": 2379934,
    "colorType": 2,
    "sha256": "0b9eaa73e94c594f99554e77ac553485a8694aadbc41d117cd62df0d09ccfba4",
    "sourceRects": [
      [
        0,
        0,
        2172,
        234
      ],
      [
        0,
        240,
        2172,
        281
      ],
      [
        0,
        524,
        2172,
        200
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/lv178-trimonite-mine.png",
    "width": 2172,
    "height": 724,
    "bytes": 2505708,
    "colorType": 2,
    "sha256": "9c35260d1aff16991e1338ef2c1dd839ec42bd434152051de211f2de2d292ff7",
    "sourceRects": [
      [
        0,
        0,
        2172,
        235
      ],
      [
        0,
        243,
        2172,
        260
      ],
      [
        0,
        505,
        2172,
        219
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/marion-engineering.png",
    "width": 2172,
    "height": 724,
    "bytes": 2437862,
    "colorType": 2,
    "sha256": "de2da77be656bccb6842e2471022f7bca35777ed97e4340ae82f31302593c099",
    "sourceRects": [
      [
        0,
        0,
        2172,
        217
      ],
      [
        0,
        225,
        2172,
        272
      ],
      [
        0,
        499,
        2172,
        225
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/cold-forge-containment.png",
    "width": 2172,
    "height": 724,
    "bytes": 2449231,
    "colorType": 2,
    "sha256": "c4205a0013038a0e53f866a09d8ef0e5d4d2ed73e4b492b7a16762c78d8c734f",
    "sourceRects": [
      [
        0,
        0,
        2172,
        232
      ],
      [
        0,
        238,
        2172,
        268
      ],
      [
        0,
        509,
        2172,
        215
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/charybdis-industrial.png",
    "width": 2172,
    "height": 724,
    "bytes": 2486726,
    "colorType": 2,
    "sha256": "3ddcc32166848597a1638ac856d9a9e5f84541a9948fe42ce29d98bb5b110a96",
    "sourceRects": [
      [
        0,
        0,
        2172,
        231
      ],
      [
        0,
        238,
        2172,
        262
      ],
      [
        0,
        503,
        2172,
        221
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/ataegina-mountain-hold.png",
    "width": 1774,
    "height": 887,
    "bytes": 2883902,
    "colorType": 2,
    "sha256": "a7a8d0e248ec951c10a7cc9d8a39bf85166765eaf6da0f9f04a9b60844291370",
    "sourceRects": [
      [
        0,
        0,
        1774,
        292
      ],
      [
        0,
        298,
        1774,
        288
      ],
      [
        0,
        591,
        1774,
        296
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/jericho-three-laboratory.png",
    "width": 2172,
    "height": 724,
    "bytes": 2444935,
    "colorType": 2,
    "sha256": "2872ed8059c2296f6cbd21a4d8324086273b02b59f62cb0e8e4caab4ce89540c",
    "sourceRects": [
      [
        0,
        0,
        2172,
        229
      ],
      [
        0,
        235,
        2172,
        262
      ],
      [
        0,
        499,
        2172,
        225
      ]
    ]
  },
  {
    "path": "assets/openai/stages/xeno-trials-v192/print/euryale-rainforest.png",
    "width": 2172,
    "height": 724,
    "bytes": 2741193,
    "colorType": 2,
    "sha256": "16df35ff70087c38ad054248560d8dbf47fa656e5d985d7500aad994dc83aae0",
    "sourceRects": [
      [
        0,
        0,
        2172,
        237
      ],
      [
        0,
        243,
        2172,
        235
      ],
      [
        0,
        483,
        2172,
        241
      ]
    ]
  }
].map(row => Object.freeze(row)));
const files = new Set(PUBLIC_XENO_FRANCHISE_STAGE_IMAGES_V192.map(row => row.path));
const directories = new Set(PUBLIC_XENO_FRANCHISE_STAGE_DIRECTORIES_V192);
export function publicXenoFranchiseStagePathAdmissionV192(path, { directory = false } = {}) {
  if (path === prefix || path.startsWith(prefix + '/'))
    return directory ? directories.has(path) : files.has(path);
  return null;
}
export async function verifyXenoFranchiseStageAdmissionsV192(root) {
  const stages = XENO_TRIALS_FRANCHISE_STAGES_V192;
  assert.equal(stages.length, 50, 'The release requires fifty measured and integrated stage images.');
  assert.equal(files.size, 50); assert.equal(new Set(stages.map(stage => stage.id)).size, 50);
  assert.deepEqual(new Set(stages.map(stage => stage.backdrop.slice(1))), files);
  assert.equal(new Set(PUBLIC_XENO_FRANCHISE_STAGE_IMAGES_V192.map(row => row.sha256)).size, 50);
  let totalBytes = 0;
  for (const row of PUBLIC_XENO_FRANCHISE_STAGE_IMAGES_V192) {
    const bytes = await readFile(join(root, row.path)), stage = stages.find(value => value.backdrop === '/' + row.path);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', row.path);
    assert.equal(bytes.subarray(12, 16).toString(), 'IHDR', row.path);
    assert.equal(bytes.length, row.bytes, row.path);
    assert.equal(bytes.readUInt32BE(16), row.width, row.path); assert.equal(bytes.readUInt32BE(20), row.height, row.path);
    assert.equal(bytes[24], 8, row.path); assert.equal(bytes[25], row.colorType, row.path);
    assert.ok([2, 6].includes(row.colorType), row.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256, row.path);
    assert.equal(stage.atlasV192.sha256, row.sha256); assert.equal(stage.atlasV192.width, row.width);
    assert.equal(stage.atlasV192.height, row.height);
    assert.deepEqual(stage.atlasV192.sourceRects, row.sourceRects, row.path);
    assert.equal(row.sourceRects.length, 3, row.path);
    let previousBottom = 0;
    for (const rect of row.sourceRects) {
      assert.ok(rect.length === 4 && rect.every(Number.isInteger), row.path);
      const [x, y, width, height] = rect;
      assert.ok(x === 0 && width === row.width && height > 0 && y >= previousBottom && y + height <= row.height, row.path);
      previousBottom = y + height;
    }
    totalBytes += bytes.length;
  }
  return { images: files.size, stages: stages.length, imagePlanes: stages.length * 3, bytes: totalBytes };
}
