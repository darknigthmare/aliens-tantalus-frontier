import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_GAMEPLAY_BASELINE_V209 = 'b13f7401083ec257182f3d8a1948fd510791604d';
export const XENO_GAMEPLAY_SUCCESSORS_V209 = freeze({
  ".github/workflows/xeno-trials-standalone-v207.yml": {
    "kind": "tooling",
    "sha256": "4b7ed309162bf28a46582ab617c1c1df7cffe20c490ba168f3308643342b5a26",
    "previousSha256": "8672df6852048782daf4e3798a5a3fa9b74bf3b1965f9380ea4e774fb448be59"
  },
  "package.json": {
    "kind": "tooling",
    "sha256": "eea498f06a6b5499716cacd2ad005352a1ab79c2a345662b25f63bba7745155e",
    "previousSha256": "165536a81630ae36c429db384413d6cfca9d11b383ed3764dd2abaad4628bf31"
  },
  "scripts/audit-xeno-gameplay-v208.mjs": {
    "kind": "tooling",
    "sha256": "75b8a169422d61b2720e9761d58166ff51ea75ef591918a059c1d55dd4a0af7b",
    "previousSha256": "abfdc0cbeba835e18546014afb0e2604d5b630e694a2862575b4f16cf4221ee1"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "tooling",
    "sha256": "25769f431d0dfb8f8e60bbf858bf796cc12e3d36f4428e7d8fefefdf9407d6fe",
    "previousSha256": "a48aaf9540b38871ff7e96433b9b90863e20e00926e9d3c25c255e0c9f812d63"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "7cba878676be3118fad268269f533900440768eb42d10f558585cc1218d57a8b",
    "previousSha256": "6773e35578cf8e534a76b3b20aaa6fd28a97644b0ec458b532919aba35386ba1"
  },
  "scripts/build.mjs": {
    "kind": "tooling",
    "sha256": "ca5f6231675068a4aa7deff7d7f21a0e2864b12208122ce357236837c241b70b",
    "previousSha256": "47f7b9dbb85ff529afc50f666387453da3c1803ae5affa712a5d6041480cc36c"
  },
  "scripts/verify-aliens1986-main-succession-v116.mjs": {
    "kind": "tooling",
    "sha256": "b49ce7c45a5cabad262c6482ad1bb0bf57f387e854c4b231ae4285b93a31167b",
    "previousSha256": "07249527a430a642dcff9f3ccd7cf2887e9f248e2ac1c7affad9e74b3a7f6c31"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "47a2804688ef60559c48353d9312a867d5dc258a56525cc56fc6b35946536c3b",
    "previousSha256": "d039103964038598f237b56681aad7608b7d80cdea3a7cf0c5fc862adf3d04cb"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "208d2a31005b5e0813b8933168eb8cfd7a2fea30c152cc9bbfa1438ff9c8b199",
    "previousSha256": "37e9afc503c973241d5cd4d1dc6de74aa88cdbfb602b1191400b87e2534cec14"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "tooling",
    "sha256": "3210fee74f717419a2dfff157f5b33e796829a2004c06b12e8e26b244f33922a",
    "previousSha256": "720cabf3fba6a7cc64cfb15286e571844e741c8216ec4e5810525f54c6c37c38"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "40d918d3beb7612b4a1f772078a259d0533df1f28f3ac8354a931f1ddd2d3e56",
    "previousSha256": "89ce0213f89d8be66bfcab977c8410f30c5efa28980d709010eaea11ba823af7"
  },
  "scripts/verify-river-of-pain-succession.mjs": {
    "kind": "tooling",
    "sha256": "37490528803328c5a05ce0e93b78034f545c1c407c3975ef1bac0536bf6ab4a4",
    "previousSha256": "96858f4e3b3553f8233495fc3f0aa67ae50c4d4c780577ef3035e63722a77711"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "tooling",
    "sha256": "da554f9df77c3326691adfa96eb9548f0ce502bae07b7dbac624622e9357f076",
    "previousSha256": "884ea993617bad85e8b70ef3f98467bd8c31ea4fdd97a85df464968a53d8c9b8"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "tooling",
    "sha256": "0a995d35f5220f6b6a66d87bf6804a3f0fba5969b467bc82bb187a7b83330787",
    "previousSha256": "fd041029f277a3f87fbcac35047fada4def7b831be4d9655abc9ba7fdc34f2d4"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "tooling",
    "sha256": "f7b75100d49cce90c83047274d3dcb1168f76ee8f7351602a2d12d3419e2ae07",
    "previousSha256": "9b8fcaa043bfb36d3bf39c9ccbdeb783c8d1fd8a1ccaea93a85eacccb50dc97f"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "tooling",
    "sha256": "774f3935a030dadbc7eea19ddc92b3ea636f7e1e518d355629953e0aa75488f6",
    "previousSha256": "24bb88407ddc834f65e18c3cf68ee923e9d4e637fd140d528d7e951090d7f8bc"
  },
  "scripts/verify-xeno-gameplay-audit-v208.mjs": {
    "kind": "tooling",
    "sha256": "37de2bfd4dad66b5e06edd77aa2014fc6cead9b654c0de748d6a3eff74aa11d1",
    "previousSha256": "0b481d997da7c2d5a9c728ad7854ca0f3fae145795754c94017a59f3bef08755"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "tooling",
    "sha256": "404c83fabcbbdbfb8a09b12a8ec518f4dcbf158ddad36d4b91ddbbc8c449245b",
    "previousSha256": "3aafd2e0156a077516aeb7da7267cfea5479b9770ab393788dea2bbff2190dc4"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "tooling",
    "sha256": "6235883186e9f16f59f849a4a4b62c97db0fbcffe65ec88d84c9174f410f5d3f",
    "previousSha256": "36c2d5c1bf74776e6b81220a759c994777dacb0c7e511fc0709ea7c50acbdc4a"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "tooling",
    "sha256": "4761643abea0deda0982c57fc29a8d9143d0e95d3829b5314e0c01e8942feb4a",
    "previousSha256": "d1ed156715826dc072b2f8df84ecd99a6c5f5fe354110c60532278a307d29112"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "tooling",
    "sha256": "632ee181e3ece849af54d536f4b1e340ce2bcca3096e96688fa33ea35767d88c",
    "previousSha256": "cdf7dab29b278a384dbbb7a8c70ddd93eeb589eefe79e6672c7149aeb6e49e05"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "tooling",
    "sha256": "f29ee91323d9c40871a82154bee654ff4d10f4782fa3dabb694193da3e96b9be",
    "previousSha256": "a5f126967c69ed97816606662df6f26a8da516ea396711ff43fd5eedff14ec84"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "kind": "tooling",
    "sha256": "87e3b21c4d45c5aeb9946b9cc1721651509321dde4ea310172ff4753669a9e31",
    "previousSha256": "7b5b1a8f500197d517ab58aa140fa295276b6daa8267574691768c805639408b"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "tooling",
    "sha256": "2f96cbd8f90c00b4334d63b1999ba1806eb714a10c1553e3345903bf0cd6e1a9",
    "previousSha256": "7a217a754245780b036b44b2c5b847f6a51b49ebf9b62e809c15fdb79cfe1976"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "tooling",
    "sha256": "4bf2d641e4a4642a614f4fb65dad477e51e9f05e440c008cac8c588a99ae0009",
    "previousSha256": "6933981bb8c636b5f731ec1c1c6e23c2675a4ec5d7c5bfb9e6502d3c69cb872a"
  },
  "scripts/verify-xeno-standalone-audit-v207.mjs": {
    "kind": "tooling",
    "sha256": "0c73ae410b2ea608c73dcd70edc178fbb9486e022595605711ba1e52fe596604",
    "previousSha256": "16ab8c772ae030cf227ce8242074c9f29086058ba3ddbc749ef7bff52341fbbe"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "tooling",
    "sha256": "f181fd9c8ab5642154e6f3c8b501917879c368eaed589f989d309a83c172ca2a",
    "previousSha256": "ba414953fd8f38f2009b646421d1ab938991aa1a65ff567cceaadf096eab4cd8"
  },
  "scripts/verify-xeno-trials-artifact-v207.mjs": {
    "kind": "tooling",
    "sha256": "b738fb56c7646cdfc864d67eed118fffb24333dd0f83278851a5916c1b5e4039",
    "previousSha256": "2aae56fb0c74ea76f898e378a38eabda20fe4e4997b28793284374bca08ee21c"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "fe127c45dd26ff2e3612df3bdd45ebfa4990127f8b54a20fd2c21c16d65119e6",
    "previousSha256": "f72033dea18a75660f1d3449568387226742fc4f98553656e7e9e54129bfbd44"
  },
  "scripts/verify-xeno-trials-grapple-v153.mjs": {
    "kind": "tooling",
    "sha256": "e6f2a363da7c3d46287f92170763deecbf30540de1fb13a22afb5677564867be",
    "previousSha256": "6cc90d28711d2ac58ac02a3d2443f08b17e788ef8b2cacc543b9232e63556397"
  },
  "scripts/verify-xeno-trials-signature-kit-v208.mjs": {
    "kind": "tooling",
    "sha256": "723d89ce8493b90743c2be79e13401a2e980dad191baa1804902a9716ae2cc5b",
    "previousSha256": "f3b97b9cee87f076b5b2c04b3a00be1fd206322b7232aa5fd6962072bc471a79"
  },
  "scripts/verify-xeno-trials-supers-v148.mjs": {
    "kind": "tooling",
    "sha256": "ae6e34893ca7b8a42a2bb5264c7c0076ce119d9b377e986d713315d9b4a62229",
    "previousSha256": "f9391f04e54787882823afb4201d5611c48ddad1ab72678a5926ae283a93e4b3"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "tooling",
    "sha256": "001c43a71f76d43f27f641814f52da96f7c3e2a84604ef999593d5ccbd3d9148",
    "previousSha256": "e64dddca00f0c2669addd19518377902a08adebe53015e87eb99c610c9f9e764"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "fcab1be705858e16afae3fcc506b3b5e93490ba609add3714946d9fc63e2f08b",
    "previousSha256": "663f22439a2146e7b17dfacb0ece5ccb2988aa530b1eb2f58ab62af5da80a7cd"
  },
  "src/xeno-trials-ai-v119.js": {
    "kind": "runtime",
    "sha256": "147e2a07f8b90957e5369cb6d4b077f51d4cd33b2ecf6b3fc1ebdd6fde655723",
    "previousSha256": "9d8ab3b216c6cb854a0f9aef548fff8cbef810528341cb46873d32a1dd16e8d3"
  },
  "src/xeno-trials-capture-v163.js": {
    "kind": "runtime",
    "sha256": "f7cd107328f3fccc7c76e492605807c4f28ebfd6c3d6de6fdca251a2f5f2a4d8",
    "previousSha256": "533741b71b5c929409f80255ab49d06a6a7c2cee9e1c56391d9e777dbd8eeaf4"
  },
  "src/xeno-trials-data-v96.js": {
    "kind": "runtime",
    "sha256": "80a7aeee2986bd6c741d74ea30c0c79d1b646956340caa62d3e2d34de701de37",
    "previousSha256": "35187237611c078a13f9710c72e8d211fce5db1be63e45d7f4b17f4904f3bb7d"
  },
  "src/xeno-trials-duel-checkpoint-v197.js": {
    "kind": "runtime",
    "sha256": "71606868a12292f78f0302e2a747005c077357822f2a7579e7d40b006acc6640",
    "previousSha256": "6a0a1213659aa9e0872f62abdf8b7a9daee09801999877b93bb31b0ea22a8f34"
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "sha256": "316182c02aa2787bbc93957dcc9e3a5e0900bf9f7a5ae09e57adaebedc790483",
    "previousSha256": "f0cf28ecb57cc80ac48626d1cd35034219f118e8fa843139a6c5490f2599615d"
  },
  "src/xeno-trials-finishers-v207.js": {
    "kind": "runtime",
    "sha256": "2b3fd46a1dc252e381cfe6ef40cd882daccf1d6ac61790a8ed160384911877e7",
    "previousSha256": "fbd5cb73981b99f05730be6373c7b4ba759538fb2aad095d5437716d08af27df"
  },
  "src/xeno-trials-finishers-v208.js": {
    "kind": "runtime",
    "sha256": "c42c6fcd9052dacad79d50cdb283f422223908cc7b55a46495e9f1e3f6030aff",
    "previousSha256": "03e891a58c8ecfc1e5f244eb45524f1f2c9f9ff987fa13730fd8baad6217ef02"
  },
  "src/xeno-trials-horde-checkpoint-v186.js": {
    "kind": "runtime",
    "sha256": "6860491ff7af344e2db91df88a3d76b68bd7988840358944de939bbd7f273046",
    "previousSha256": "c180006a758c4077eaac4c9740de7e9dc88a57850d2565875ca554511ef0be14"
  },
  "src/xeno-trials-moveset-v207.js": {
    "kind": "runtime",
    "sha256": "6b99d2e85f84eca6e46e67ad23637979ed033df6b0ce3228cbe8adf072f202de",
    "previousSha256": "4007c6176fd86e23f822ffd8660de7c688429b49fc5f46876e007b2c9d8dd2a5"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "4e2cd31096d5f414a6263f2e340f72d5f4870743ec87ce033f5c1f91ded8785b",
    "previousSha256": "b218d3ac2c2a140c1c612fbbae12b5bbf088513247934fb5e88930e2e0b3c5ec"
  },
  "src/xeno-trials-practice-v208.js": {
    "kind": "runtime",
    "sha256": "cd3824120d1f1dc25ab2c97b8383f56a9df6f3ca269564dfeecbda75d832d09a",
    "previousSha256": "c7f74f8aac103f90f112440dcf5d8301cd35acac0e3294bf5967167f076510c9"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "sha256": "8a309501af8f6f027d75feb9cc30c91e5ad3de2acf067eb4f534ac0dc95d1bf6",
    "previousSha256": "eee120c2cf0b9c5f2da6c2ea7011a2ec9a4126bc3fef71b44d8b70177827bbc5"
  },
  "src/xeno-trials-ripostes-v208.js": {
    "kind": "runtime",
    "sha256": "0ce683e2f3c09517369378f86f4c8b36a29f13f83740e2f785ff64b1a14482dd",
    "previousSha256": "0f0ebcf1a46083961d9068eb702cd8f1cf7ed03c205ae3f21214c0b4330b55a3"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "e4c108e5c31c6933a54ebb4fbf7255673a44a7566fddb79091acedf2fb0e4013",
    "previousSha256": "c98c92eb9cdc8832a4c7c551988758a6d2d9ba3796fb5093c23befd7400b1d2a"
  },
  "src/xeno-trials-signature-kit-v208.js": {
    "kind": "runtime",
    "sha256": "450f23e5f08482833e78df4c733b359b0ce5205628f92aac58b1653643988c42",
    "previousSha256": "2e6a5b1fe7b65a2f82b1fcb7dda2c73cee8597a0703197710c6619d4cfd8fd77"
  },
  "src/xeno-trials-signatures-v147.js": {
    "kind": "runtime",
    "sha256": "e2a209c91f5a99f52c343d0639060a3fc647221565ae7716cb30afbc6f49201e",
    "previousSha256": "d135669891d63c2f16ff25f41dc5555e5bcfbe38217cc375061b601d559c52fd"
  },
  "src/xeno-trials-supers-v148.js": {
    "kind": "runtime",
    "sha256": "f7694ef973af36e71ee837745017c277e9cb7ed42a8a0897ad7c8781f43a638f",
    "previousSha256": "f937435a068268f4771f58dea31e4b6e74a28ce658e0269a4222614a68695bb5"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "8a2bc2f2b8f784d523d984beee81bb9606a56a708fb5e0777fdd86b1f19207a9",
    "previousSha256": "02659c512f5e560be9c0c70ad10c031cc99ca7f05e0bd851a9de400cfa53c5e9"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "9409d6064cd784cc7e4cb407b196296f533514a126fa1bbb4e6a588b53ae1669",
    "previousSha256": "88b8e4f776cff70349b59af38eaefac727f2d4bae9dd34dac4b0e182487358ef"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "sha256": "a61904ec7ee1c43169e9c4bef1eab2cc2e2bae13725289ab93b8d4949fa855c1",
    "previousSha256": "c01e7366288f8aec02fbea59d5109c26141c3d4aad7ff883af2688d4e7a86590"
  },
  "xeno-trials-v96.css": {
    "kind": "runtime",
    "sha256": "68b91964bde303513f0f6e8e01f5930e4233559b3f38782d230b49a59f07e99f",
    "previousSha256": "3db3446694432c8909c5d0c322336487830898b7615257f349412302ce612973"
  }
});
export const XENO_GAMEPLAY_NEW_INPUTS_V209 = freeze({
  "assets/openai/xeno-trials-v209/characters/arachnoid-heavy-impact.png": {
    "kind": "asset",
    "sha256": "f419648b5f16ed82eba9dfb69921dbeae12b42e6605c9891df2df91cedc352f3"
  },
  "assets/openai/xeno-trials-v209/characters/arachnoid-heavy-recovery.png": {
    "kind": "asset",
    "sha256": "4b937172bac49554e3408a5818fd813d87d2bb35dec1dc4e5d395f35bb34396b"
  },
  "assets/openai/xeno-trials-v209/characters/arachnoid-heavy-windup.png": {
    "kind": "asset",
    "sha256": "9ed3a04cd0cc39d714ba9dba4887ca186b287c87a25f1f00830dd3014d7571dc"
  },
  "docs/forge/xeno-trials/V209-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "d7ee71128750e04988b09c23cc7ef8fe96f5af76d86fb43459d74fae8784274b"
  },
  "scripts/public-xeno-pose-admissions-v209.mjs": {
    "kind": "tooling",
    "sha256": "880226b38414bef4160507ec648e5271e42de4470eebc26b13a7a23dca48098e"
  },
  "scripts/verify-xeno-gameplay-audit-v209.mjs": {
    "kind": "tooling",
    "sha256": "fd46496fc311eabbef2e4759ef20ee1c591f89a789e609dbcdd27d34ee946237"
  },
  "scripts/verify-xeno-trials-ai-v209.mjs": {
    "kind": "tooling",
    "sha256": "c8548bc5fd48b7da200a735bb120f376c1b163e92f19ea63aa67d46ea4798b89"
  },
  "scripts/verify-xeno-trials-finishers-v209.mjs": {
    "kind": "tooling",
    "sha256": "ce047ae2e69dc4735b928677e38e9e6f50a66229c6134cbf210f3daa18c19058"
  },
  "scripts/verify-xeno-trials-poses-v209.mjs": {
    "kind": "tooling",
    "sha256": "6226e7e5ed1ab510c75c157b5200411f89394f35777dacd4e4e8ebfd4871ba31"
  },
  "scripts/verify-xeno-trials-practice-v209.mjs": {
    "kind": "tooling",
    "sha256": "e09c4d2c65083a77859eb2a3c125620116b17466597957ec8d88f312622c1204"
  },
  "scripts/verify-xeno-trials-research-lab-v209.mjs": {
    "kind": "tooling",
    "sha256": "fa710490384db681858d73e092fb20c6f1758852317d23a5336c2811c434d666"
  },
  "scripts/verify-xeno-trials-research-v209.mjs": {
    "kind": "tooling",
    "sha256": "97212f679f9480d3372d15b2385f7abe1751a50b0aa3da818c7ec31345e4b620"
  },
  "scripts/verify-xeno-trials-signature-kit-v209.mjs": {
    "kind": "tooling",
    "sha256": "313f78845873e4dcd6907625724da4a612fe659a3d5abb9dadeb7fe8983912f6"
  },
  "scripts/verify-xeno-trials-super-kits-v209.mjs": {
    "kind": "tooling",
    "sha256": "cd5763cbd2ece61a5fa1b722739676ed0e2e65a5a212820f26b89423d9c27720"
  },
  "src/xeno-trials-ai-v209.js": {
    "kind": "runtime",
    "sha256": "ff89d465fdd2c78c6193f83cb2b8103b02f3769b1cfefcb6679697552dbe6093"
  },
  "src/xeno-trials-finishers-v209.js": {
    "kind": "runtime",
    "sha256": "2140f4c04415674385e3a114ca7919ba6e6928e11efb8764e37f565bb50efd31"
  },
  "src/xeno-trials-poses-v209.js": {
    "kind": "runtime",
    "sha256": "cedaadc973872a58c6db0e9022ef3cc5328ee72067e9c8abc7952be9f3bc6a37"
  },
  "src/xeno-trials-practice-v209.js": {
    "kind": "runtime",
    "sha256": "2eef744552f02c558e5dada13b62ec574b225a3bd90aedf01f002189cfd9a560"
  },
  "src/xeno-trials-research-lab-ui-v209.js": {
    "kind": "runtime",
    "sha256": "5595c8135c101925d55444dc070888b2a8162899d221f0d25e5f79bd5b3b12f7"
  },
  "src/xeno-trials-research-lab-v209.js": {
    "kind": "runtime",
    "sha256": "38c7fadadde539860dea19fc3859a921d154e10004ce1d07219e2490b7686f93"
  },
  "src/xeno-trials-research-v209.js": {
    "kind": "runtime",
    "sha256": "87d5ffff9a3dd1e8d4a7d93d6471c210512c08fc703009d9658c9bb9b1c5af92"
  },
  "src/xeno-trials-signature-kit-v209.js": {
    "kind": "runtime",
    "sha256": "519d6459d874fa982a0041c1f31e73566cffc8aad8eb590bdab88f443bba9d33"
  },
  "src/xeno-trials-super-kits-v209.js": {
    "kind": "runtime",
    "sha256": "a0cef090aaead6845691e67526cd6a7d304787115cb0b4bfbeccdf47ac8a3f1f"
  }
});
export const XENO_GAMEPLAY_DECLARATIONS_V209 = freeze({
  "scripts/audit-xeno-gameplay-v208.mjs": {
    "start": "export const XENO_GAMEPLAY_BASELINE_V208",
    "end": "\nexport function reviewedXenoGameplayDigestV208",
    "sha256": "9e6e2377156fb3b842bf2201a61b3d17ed1b25ed12eac9d5d9dcd161224e8c67"
  }
});

export function reviewedXenoGameplayDigestV209(path, endpoint) {
  if (!Object.hasOwn(XENO_GAMEPLAY_SUCCESSORS_V209, path)) return endpoint;
  const receipt = XENO_GAMEPLAY_SUCCESSORS_V209[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V208 endpoint for V209: ' + path);
  return receipt.sha256;
}

export function xenoGameplayRuntimeSourcesV209(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V209)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoGameplayDigestV209(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V209)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V209 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoGameplayV209(readSource = readRepository) {
  const successors = Object.entries(XENO_GAMEPLAY_SUCCESSORS_V209);
  const inputs = Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V209);
  assert.ok(successors.length > 0 && inputs.length > 0, 'Incomplete V209 source freeze');
  const paths = new Set(['scripts/audit-xeno-gameplay-v209.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V209 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V209 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256), 'Invalid V209 receipt: ' + path);
    if (Object.hasOwn(receipt, 'previousSha256'))
      assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V209 predecessor: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V209 source bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_DECLARATIONS_V209)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V208 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V208 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_GAMEPLAY_BASELINE_V209, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
