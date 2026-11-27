import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_GAMEPLAY_BASELINE_V210 = '8e883b3d104e3566366bbebff4ecac38fd3834d0';
export const XENO_GAMEPLAY_SUCCESSORS_V210 = freeze({
  ".github/workflows/xeno-trials-standalone-v207.yml": {
    "kind": "tooling",
    "sha256": "457bc64ad48fae17246d3e161595cb7d5d555bbb4a1e14c9e4ea8d327c0dc9aa",
    "previousSha256": "4b7ed309162bf28a46582ab617c1c1df7cffe20c490ba168f3308643342b5a26"
  },
  "package.json": {
    "kind": "tooling",
    "sha256": "5799266c3c27cb3dad2ab49c63c1314c87b278aef00e5d07682a0cb4517df443",
    "previousSha256": "eea498f06a6b5499716cacd2ad005352a1ab79c2a345662b25f63bba7745155e"
  },
  "scripts/audit-xeno-gameplay-v209.mjs": {
    "kind": "tooling",
    "sha256": "39ccb51bce13c039d8e768f301c324e5636fae4d850e711a482bf3481470e29b",
    "previousSha256": "e4f7404f8a881d86e0a3dc9197faba82e7a14e44888885105cea7ec779ac55df"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "tooling",
    "sha256": "b73391e1cf11a27d10d8a700e1dc4ab65dfdad40d1a68ed7049eec7ac609ab37",
    "previousSha256": "25769f431d0dfb8f8e60bbf858bf796cc12e3d36f4428e7d8fefefdf9407d6fe"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "0156ae32f36e9410c9b4111c3f1c01a9adccd2af63cc6d2ed5f5c21a4c39c970",
    "previousSha256": "7cba878676be3118fad268269f533900440768eb42d10f558585cc1218d57a8b"
  },
  "scripts/build.mjs": {
    "kind": "tooling",
    "sha256": "29af2acd34f801d0a9583c59f6afa8386455c921c037761b0d080b7c528b1e5b",
    "previousSha256": "ca5f6231675068a4aa7deff7d7f21a0e2864b12208122ce357236837c241b70b"
  },
  "scripts/verify-aliens1986-main-succession-v116.mjs": {
    "kind": "tooling",
    "sha256": "972f40d33e928e0859f8ecbb0165a07f3f0e39b63c6391a27c2293523d6118d9",
    "previousSha256": "b49ce7c45a5cabad262c6482ad1bb0bf57f387e854c4b231ae4285b93a31167b"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "4ed06b0a6db3c0a88c5e71767da4124a7a52bde7f150bd3451ac83d98af0c0f6",
    "previousSha256": "47a2804688ef60559c48353d9312a867d5dc258a56525cc56fc6b35946536c3b"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "c620ad923820d65754d018a6cda383c3c027f1906f0f861c7ff96641c4b8aa31",
    "previousSha256": "208d2a31005b5e0813b8933168eb8cfd7a2fea30c152cc9bbfa1438ff9c8b199"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "tooling",
    "sha256": "7f46fb36849a43f6c94d52c0d392c64341a0d0cfd56696613fdfa142177c6555",
    "previousSha256": "3210fee74f717419a2dfff157f5b33e796829a2004c06b12e8e26b244f33922a"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "87c162dfcb7e93ba7f17ada883c8da846926528fbb64b2889cd8c8dee63ee026",
    "previousSha256": "40d918d3beb7612b4a1f772078a259d0533df1f28f3ac8354a931f1ddd2d3e56"
  },
  "scripts/verify-river-of-pain-succession.mjs": {
    "kind": "tooling",
    "sha256": "a5636abda346f6f3fe4c58b40517b0b8f981cf571463b4d63d52be77c7631259",
    "previousSha256": "37490528803328c5a05ce0e93b78034f545c1c407c3975ef1bac0536bf6ab4a4"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "tooling",
    "sha256": "f8ab388470c385f539d637b0ede1bf3b23e97faa04f20000ef2781ff0d3a9526",
    "previousSha256": "da554f9df77c3326691adfa96eb9548f0ce502bae07b7dbac624622e9357f076"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "tooling",
    "sha256": "72f649c34de5411d0cf9a4278e9798e3aeffbc7534c557ab5326515ee911f313",
    "previousSha256": "0a995d35f5220f6b6a66d87bf6804a3f0fba5969b467bc82bb187a7b83330787"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "tooling",
    "sha256": "ac87196e3b25738ded7fa384d4db4423ebabfcd41d33fd8d977139a0ca1e4338",
    "previousSha256": "f7b75100d49cce90c83047274d3dcb1168f76ee8f7351602a2d12d3419e2ae07"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "tooling",
    "sha256": "ade9e483559b083b852a6fc7f8c6b176bf9315f441eb3155e5509cc914cfc135",
    "previousSha256": "774f3935a030dadbc7eea19ddc92b3ea636f7e1e518d355629953e0aa75488f6"
  },
  "scripts/verify-xeno-gameplay-audit-v208.mjs": {
    "kind": "tooling",
    "sha256": "bbf1999b567a95878755eb8cd5ffdc78153253230ebb4e8916b9991f9380b784",
    "previousSha256": "37de2bfd4dad66b5e06edd77aa2014fc6cead9b654c0de748d6a3eff74aa11d1"
  },
  "scripts/verify-xeno-gameplay-audit-v209.mjs": {
    "kind": "tooling",
    "sha256": "fd9e82166aa3b8ebb6e9c5ae47e339c989dd053ba6b74035140733ce0d90839f",
    "previousSha256": "fd46496fc311eabbef2e4759ef20ee1c591f89a789e609dbcdd27d34ee946237"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "tooling",
    "sha256": "ccc87bce6e03dc3919ba92f79c733c1277eade71169fedddeff37286ce62bbdd",
    "previousSha256": "404c83fabcbbdbfb8a09b12a8ec518f4dcbf158ddad36d4b91ddbbc8c449245b"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "tooling",
    "sha256": "b3a54ae6f9e35268806212f81ece1680184570648d961130480a89d4caa99738",
    "previousSha256": "6235883186e9f16f59f849a4a4b62c97db0fbcffe65ec88d84c9174f410f5d3f"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "tooling",
    "sha256": "2e5509b46080f0563d020988d0b9db78fb7d8943330724816e480875814bce17",
    "previousSha256": "4761643abea0deda0982c57fc29a8d9143d0e95d3829b5314e0c01e8942feb4a"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "tooling",
    "sha256": "c50fe6d7f2e28651a5d8e47b3d4a8ce82c1b2b66e995802d8d15c9a816bc3aa5",
    "previousSha256": "632ee181e3ece849af54d536f4b1e340ce2bcca3096e96688fa33ea35767d88c"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "tooling",
    "sha256": "21e81e273d75dee30bf73fe8f63af9441914ac7095f2d4dd9e9c072d5f4b59f6",
    "previousSha256": "f29ee91323d9c40871a82154bee654ff4d10f4782fa3dabb694193da3e96b9be"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "kind": "tooling",
    "sha256": "709d310c180e8de3c48b2c6a4f7992c6384278c43336bad60864fceb9c5a22e7",
    "previousSha256": "87e3b21c4d45c5aeb9946b9cc1721651509321dde4ea310172ff4753669a9e31"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "tooling",
    "sha256": "56c149e193a274157d6dfffaeec1e50595e240855b2311dcb67eec94022f4b9f",
    "previousSha256": "2f96cbd8f90c00b4334d63b1999ba1806eb714a10c1553e3345903bf0cd6e1a9"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "tooling",
    "sha256": "d06e340536d9234627000494fe3a0460b5a918adbf002ffdcedb3e98c5645df2",
    "previousSha256": "4bf2d641e4a4642a614f4fb65dad477e51e9f05e440c008cac8c588a99ae0009"
  },
  "scripts/verify-xeno-standalone-audit-v207.mjs": {
    "kind": "tooling",
    "sha256": "be370c620902eb909595a7260f905100a6ce21c90d4873232b62c17d17fba018",
    "previousSha256": "0c73ae410b2ea608c73dcd70edc178fbb9486e022595605711ba1e52fe596604"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "tooling",
    "sha256": "1b392f39dce6e963b85ed7cc4b7218f481d54c7e34527fb534dae9673560d2c5",
    "previousSha256": "f181fd9c8ab5642154e6f3c8b501917879c368eaed589f989d309a83c172ca2a"
  },
  "scripts/verify-xeno-trials-castes-v151.mjs": {
    "kind": "tooling",
    "sha256": "c3ee55a5f487c911bde7df6f135160c50bf2c6210bfd9c50cd1bd0e7d335a869",
    "previousSha256": "2bf512fda34d179c7b0e6b426945ee02bed56baeb6b0e1810bb50904b67cc7e1"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "tooling",
    "sha256": "91aaebb0178367d583ca27f12016991e10f22be2d25059de8c21cb6dc551e943",
    "previousSha256": "fe127c45dd26ff2e3612df3bdd45ebfa4990127f8b54a20fd2c21c16d65119e6"
  },
  "scripts/verify-xeno-trials-franchise-stage-render-v192.mjs": {
    "kind": "tooling",
    "sha256": "1b1050c1c6eb0e8cbe756673849af4484a83edd613ea0d355601af3ab02a47f7",
    "previousSha256": "db1309047c14fabcaeacfe70c07340b16400cc0761716d19343b1b9b2caccf38"
  },
  "scripts/verify-xeno-trials-grapple-v153.mjs": {
    "kind": "tooling",
    "sha256": "ca64879779da758ff58bfdbe3b3288a6b4a47a94492eac27fc8e3ea7f4925c9a",
    "previousSha256": "e6f2a363da7c3d46287f92170763deecbf30540de1fb13a22afb5677564867be"
  },
  "scripts/verify-xeno-trials-roster-v179.mjs": {
    "kind": "tooling",
    "sha256": "cbc986297622323323658776c2270aed7b9ace697ad0ff30a803f11f042039b1",
    "previousSha256": "9399d4156d69c03a86058a314d68738fd04ddfb8abba401ac8dfe070a5cc2989"
  },
  "scripts/verify-xeno-trials-super-kits-v209.mjs": {
    "kind": "tooling",
    "sha256": "4f6bfbfe8634353f86a353c368dea4d8a5e1fb513fb26d06e9ed20571d4f57e7",
    "previousSha256": "cd5763cbd2ece61a5fa1b722739676ed0e2e65a5a212820f26b89423d9c27720"
  },
  "scripts/verify-xeno-trials-supers-v148.mjs": {
    "kind": "tooling",
    "sha256": "0adfc00cd062a4ad3dbeb9ce57666fb2036e4e82f2f213c7184756ded73d745a",
    "previousSha256": "ae6e34893ca7b8a42a2bb5264c7c0076ce119d9b377e986d713315d9b4a62229"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "tooling",
    "sha256": "500b785badab7bfc96e5ee7438d2c77eb451a65b65232b1d2158da40e5c9fb7e",
    "previousSha256": "001c43a71f76d43f27f641814f52da96f7c3e2a84604ef999593d5ccbd3d9148"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "6a5dd00ace5d5701372b366dcbfa8a96ef426ce161fdcd0152abf94d151273c2",
    "previousSha256": "fcab1be705858e16afae3fcc506b3b5e93490ba609add3714946d9fc63e2f08b"
  },
  "src/xeno-trials-ai-v119.js": {
    "kind": "runtime",
    "sha256": "0bf3bab2ab874c138f4a948cac2a9b8aadfae254de3f2169ea2e10b2651d6a43",
    "previousSha256": "147e2a07f8b90957e5369cb6d4b077f51d4cd33b2ecf6b3fc1ebdd6fde655723"
  },
  "src/xeno-trials-ai-v209.js": {
    "kind": "runtime",
    "sha256": "d834033a8c0a98ec32ca8eaf4ed0f45240526f003c71dd43e4875c19169ef74c",
    "previousSha256": "ff89d465fdd2c78c6193f83cb2b8103b02f3769b1cfefcb6679697552dbe6093"
  },
  "src/xeno-trials-capture-v163.js": {
    "kind": "runtime",
    "sha256": "14a2ed247f0f1b09b4c9a77a91005742a2ccd5a50017000f4b705aa67b92256d",
    "previousSha256": "f7cd107328f3fccc7c76e492605807c4f28ebfd6c3d6de6fdca251a2f5f2a4d8"
  },
  "src/xeno-trials-data-v96.js": {
    "kind": "runtime",
    "sha256": "78560a3417aaf6a93bbedf6f1e653f7a5f84f0a33c5dba7aa86a8b88e5f8d458",
    "previousSha256": "80a7aeee2986bd6c741d74ea30c0c79d1b646956340caa62d3e2d34de701de37"
  },
  "src/xeno-trials-duel-checkpoint-v197.js": {
    "kind": "runtime",
    "sha256": "fb619549aef4c1f1d0252113dc0fe9c62f12bfc3807c6ed6a7979fc73ab1b42a",
    "previousSha256": "71606868a12292f78f0302e2a747005c077357822f2a7579e7d40b006acc6640"
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "sha256": "19dbb0777f0a6bc9c418fc5b2ba58b97e606ec716ee8f150c2b5f915f7d34898",
    "previousSha256": "316182c02aa2787bbc93957dcc9e3a5e0900bf9f7a5ae09e57adaebedc790483"
  },
  "src/xeno-trials-finishers-v207.js": {
    "kind": "runtime",
    "sha256": "e77c88bd73bf68126df17a83d1a6f06aa66acaecdd541a3b748d8b6984e3c7c3",
    "previousSha256": "2b3fd46a1dc252e381cfe6ef40cd882daccf1d6ac61790a8ed160384911877e7"
  },
  "src/xeno-trials-finishers-v208.js": {
    "kind": "runtime",
    "sha256": "d821ef70bd56421388cac1aee69f01a7dbbde6138b8e10247ab9d92211a43e4a",
    "previousSha256": "c42c6fcd9052dacad79d50cdb283f422223908cc7b55a46495e9f1e3f6030aff"
  },
  "src/xeno-trials-horde-checkpoint-v186.js": {
    "kind": "runtime",
    "sha256": "af11ad03a2c5db0e5453866b926f4058beff6b930356015d979c68111b795a4b",
    "previousSha256": "6860491ff7af344e2db91df88a3d76b68bd7988840358944de939bbd7f273046"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "56ac685a2a7f03e01cb4e7545eed39c70c7ff1fe95410d880947e5d636e56834",
    "previousSha256": "4e2cd31096d5f414a6263f2e340f72d5f4870743ec87ce033f5c1f91ded8785b"
  },
  "src/xeno-trials-ripostes-v208.js": {
    "kind": "runtime",
    "sha256": "421bca494f308b034d74600d24c325924fd6e9b6d27dce67ccc71329c4307a0b",
    "previousSha256": "0ce683e2f3c09517369378f86f4c8b36a29f13f83740e2f785ff64b1a14482dd"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "7d612b8ebd07f67daeab833bbc53aaf9b1041c7ee3db64e8786f296ee20421a1",
    "previousSha256": "e4c108e5c31c6933a54ebb4fbf7255673a44a7566fddb79091acedf2fb0e4013"
  },
  "src/xeno-trials-signature-kit-v208.js": {
    "kind": "runtime",
    "sha256": "1440af20e9d1e3455cfbb635f0a3cfcfe5ac79f9a5238a8e936e909ac66973ae",
    "previousSha256": "450f23e5f08482833e78df4c733b359b0ce5205628f92aac58b1653643988c42"
  },
  "src/xeno-trials-signatures-v147.js": {
    "kind": "runtime",
    "sha256": "2e06a2dfda9b52189cf8137f5ce836d04e11d9f8b0500141e7c25e3d0635c446",
    "previousSha256": "e2a209c91f5a99f52c343d0639060a3fc647221565ae7716cb30afbc6f49201e"
  },
  "src/xeno-trials-super-kits-v209.js": {
    "kind": "runtime",
    "sha256": "97bb3ad765c9756bba2fe0c6ed1b204447920b3f8d509f24f58635c245b07fd2",
    "previousSha256": "a0cef090aaead6845691e67526cd6a7d304787115cb0b4bfbeccdf47ac8a3f1f"
  },
  "src/xeno-trials-supers-v148.js": {
    "kind": "runtime",
    "sha256": "2d115ec7042b141affcdc31e18dd43673cf35a1e4ad9b0b335351c7ea059e9ad",
    "previousSha256": "f7694ef973af36e71ee837745017c277e9cb7ed42a8a0897ad7c8781f43a638f"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "5d64749af753a8a39dc9ccfcfcf181f15281272506347636bfe3a93d9504cec1",
    "previousSha256": "8a2bc2f2b8f784d523d984beee81bb9606a56a708fb5e0777fdd86b1f19207a9"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "3c73fffc15981ccf0cef41421586f5b759e07fdb2724a998094e4b10166b5d9f",
    "previousSha256": "9409d6064cd784cc7e4cb407b196296f533514a126fa1bbb4e6a588b53ae1669"
  }
});
export const XENO_GAMEPLAY_NEW_INPUTS_V210 = freeze({
  "assets/openai/xeno-trials-v210/research/guard-plates.png": {
    "kind": "asset",
    "sha256": "be30e31d315fe6fd7bd96c25fa1777b381aed5c56ab8659586988a886e4165ea"
  },
  "assets/openai/xeno-trials-v210/research/specimen-plates.png": {
    "kind": "asset",
    "sha256": "bd60e2741cad28d6ff30d34057faef8ac713869764592502cbe40829e93dac76"
  },
  "docs/forge/xeno-trials/V210-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "5bdb881f0598e32ea6e560fa8eda9e7b9e61c7c45aa8b6c2b2e556cd038a8dff"
  },
  "scripts/public-xeno-research-admissions-v210.mjs": {
    "kind": "tooling",
    "sha256": "1f2ec651c179cee093319571a2125e7f9fb1530e29307b1f8fea1b7404571346"
  },
  "scripts/verify-xeno-gameplay-audit-v210.mjs": {
    "kind": "tooling",
    "sha256": "afee06844c514f4c1277f11641203f817e687765aea854b711517ad9ec964cbd"
  },
  "scripts/verify-xeno-trials-finishers-v210.mjs": {
    "kind": "tooling",
    "sha256": "15860481fd01a80294bf6278b148e88242ff6080e90137aba7dc4388d728dd3c"
  },
  "scripts/verify-xeno-trials-movement-v210.mjs": {
    "kind": "tooling",
    "sha256": "486678fc8b2b908054d08e9568df48195f116ad134b213429de649747cfc72c1"
  },
  "scripts/verify-xeno-trials-practice-v210.mjs": {
    "kind": "tooling",
    "sha256": "98bfd3dbbe6fa9f354744f65d0ef99f19382a54821f0803c3b30c740be47394c"
  },
  "scripts/verify-xeno-trials-research-v210.mjs": {
    "kind": "tooling",
    "sha256": "1c4911f24b78ca0ad1d20285a4b26b8c18ceee0d334d4aeaab492f9bbc2a09a5"
  },
  "scripts/verify-xeno-trials-signature-kit-v210.mjs": {
    "kind": "tooling",
    "sha256": "c2a2636231e357e748c0df26476b6d3076452b42d8ba8b770f55e96d8f864479"
  },
  "scripts/verify-xeno-trials-super-kits-v210.mjs": {
    "kind": "tooling",
    "sha256": "59fcf0a39468d4a037af7b23292b3629575a2b5fff7ed6485544ecd35188246b"
  },
  "src/xeno-trials-finishers-v210.js": {
    "kind": "runtime",
    "sha256": "525c3a33e5509dd9cee64e2162c7ccf1fcb75b93e80ff89c9f912e4681b8bf90"
  },
  "src/xeno-trials-movement-v210.js": {
    "kind": "runtime",
    "sha256": "3cf845464ddf02f5d0f7f7e1318c558f8ade03b4b7b6e249fc7d064a2c359042"
  },
  "src/xeno-trials-practice-v210.js": {
    "kind": "runtime",
    "sha256": "bcb08311cd3d85a348c30fa204a3e2e69931ccf1389fdec5f5eaf6758bad3122"
  },
  "src/xeno-trials-research-media-v210.js": {
    "kind": "runtime",
    "sha256": "9cb1b3a68cb631d57ee58ed6972b2cb77d4e466577572275ecdf5b8f03976a9b"
  },
  "src/xeno-trials-research-v210.js": {
    "kind": "runtime",
    "sha256": "48e3d5f7f3f385becab37932e6fd4ce51fd1155b4fd39ee4433c0b08dd0e3b3d"
  },
  "src/xeno-trials-signature-kit-v210.js": {
    "kind": "runtime",
    "sha256": "948457cca1a3ac599b878b7da7130ebf27a7d90bf267331f5482f4f42b0dab18"
  },
  "src/xeno-trials-super-kits-v210.js": {
    "kind": "runtime",
    "sha256": "35f0f465d1048d0e13aadfadd0b226cc3a5c8897a474db8acd2ca95bf24aa821"
  }
});
export const XENO_GAMEPLAY_DECLARATIONS_V210 = freeze({
  "scripts/audit-xeno-gameplay-v209.mjs": {
    "start": "export const XENO_GAMEPLAY_BASELINE_V209",
    "end": "\nexport function reviewedXenoGameplayDigestV209",
    "sha256": "36ee9c20717246aaf291d12e4314591f5555ee9afaf37bd1097a726a7ee458cf"
  }
});

export function reviewedXenoGameplayDigestV210(path, endpoint) {
  if (!Object.hasOwn(XENO_GAMEPLAY_SUCCESSORS_V210, path)) return endpoint;
  const receipt = XENO_GAMEPLAY_SUCCESSORS_V210[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V209 endpoint for V210: ' + path);
  return receipt.sha256;
}

export function xenoGameplayRuntimeSourcesV210(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V210)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoGameplayDigestV210(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V210)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V210 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoGameplayV210(readSource = readRepository) {
  const successors = Object.entries(XENO_GAMEPLAY_SUCCESSORS_V210);
  const inputs = Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V210);
  assert.ok(successors.length > 0 && inputs.length > 0, 'Incomplete V210 source freeze');
  const paths = new Set(['scripts/audit-xeno-gameplay-v210.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V210 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V210 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256), 'Invalid V210 receipt: ' + path);
    if (Object.hasOwn(receipt, 'previousSha256'))
      assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V210 predecessor: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V210 source bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_DECLARATIONS_V210)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V209 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V209 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_GAMEPLAY_BASELINE_V210, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
