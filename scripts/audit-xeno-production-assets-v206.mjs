/** Source-only production inputs for Xeno Trials V206. Published V205 receipts
 * remain historical evidence; this extension admits no new playable state. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safePath = path => /^[a-zA-Z0-9._/-]+$/.test(path)
  && !path.split('/').some(segment => !segment || segment === '.' || segment === '..');
const kinds = new Set(['production-asset', 'verifier', 'configuration', 'document-input']);
const mutableReports = new Set(['docs/forge/xeno-trials/V206-ASSETS.md']);
function freezeReceipts(receipts) {
  for (const receipt of Object.values(receipts)) Object.freeze(receipt);
  return Object.freeze(receipts);
}

export const XENO_PRODUCTION_ASSETS_BASELINE_V206 = '50a974f16a07bd54e2fcb5cd243be8a55abe32fb';
export const XENO_PRODUCTION_ASSETS_HISTORICAL_DECLARATIONS_V206 = freezeReceipts({
  "scripts/audit-xeno-visual-assets-v205.mjs": {
    "start": "export const XENO_VISUAL_ASSETS_BASELINE_V205",
    "end": "\nexport function reviewedXenoVisualAssetsDigestV205",
    "sha256": "d90cab54a99ac4f8c3eb79d2e33b4441b80a17d87ebe86a4106296646eee30b2"
  }
});
export const XENO_PRODUCTION_ASSETS_SUCCESSORS_V206 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "f29e5ced2089abc670609dcc4183d6a492b195113839c6733f69976fb9f88994",
    "currentSha256": "d5d2e4c965479a658b2289e7e51fff6456c099fb99e9b322ea289a3cd40a89ef"
  },
  "scripts/audit-xeno-visual-assets-v205.mjs": {
    "kind": "verifier",
    "previousSha256": "657506aa8fa45d7029aed2db92d18b938f64a0f051434580e96e43d092d6d75c",
    "currentSha256": "df20ceb51b521cb2b0f6a16c5ad6af6552cbbe0f8b6bbe5539275a8370bd0d14"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "d5121997a0d946419a955e20499a4d848420b587d81ed174fdd456dda42fcea8",
    "currentSha256": "a48aaf9540b38871ff7e96433b9b90863e20e00926e9d3c25c255e0c9f812d63"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "ac45b6c2c2fe4a28e55058d9a457b5f1c600f9f84e29f22c6ae92afa0d0ed522",
    "currentSha256": "f4d8ce2a42b33855527b8e3173c3999c2e294707e37b9f222da26fc0644039c8"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "f34cd5a4a2c16c32a5ba1b6884c3f138a8c8334233e989141655fd1238f37d04",
    "currentSha256": "7283bb82903a742f2dd662072b0bad6c1da4fb5ca60c3c56001b4e54e734ffd2"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "99300ca42eb32149e4bcd2b19b97cca41e606caeed4d6402393acfd215cc1e0f",
    "currentSha256": "1b81da575ba68fcb5186cd5c47cd9d25f525904b84000b97e1b05ad796dab2cc"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "e91b20e116d6c39f1fdc969b8929b5075fb7266bf300f31d07fc9f695726fd05",
    "currentSha256": "58eedf345dc2e98f1f4e67cba8558e1e5575d731b104c604c45f4a33bd8373b6"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "e1a52ebfdea6e2683f75cc3e6c99df1ead87248297cde1d8ecdc3b389943190b",
    "currentSha256": "bba7d655e9b21a5fdba4d59d89442b358dfe485047c00c9d2f03184886cf9f4d"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "92db45f7a67ff95b8f08e43b6bb3b5348a73e041256fc9f5fb3a33c71b1e79d7",
    "currentSha256": "c44b244ba3bacb7657b7023e4ed97bfe4afa4aa9edcdefd21a6c99707c2c30e2"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "55548b59ed4b494f9ebe4d1f28890200b06ed6ac38508665fe3fe934c9d618e6",
    "currentSha256": "3b4a88a92b59daa19b7e8fb377f6b236904a94bf9ac107c4603c57dcf28eb522"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "08afb2fc482076332abe5af5390b3a4c5afc2562940504a2ca6143f4471a76bb",
    "currentSha256": "273fffa43b99557eb5a08264697f4cce63ab3f85e7597ea1dbe85f0c4634eab8"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "verifier",
    "previousSha256": "86dc60d9208ec8e0967b5dce833dab5d48c0f37c7be667799a3eab0d0f12c0fe",
    "currentSha256": "0b9cdf68d5c356f25e14a355f262a5c620292ca8a300193573b7d6bc9c35bc92"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "verifier",
    "previousSha256": "1377d502e2242cac6607030bab88cc48563d83ec3ea053c38b8866e7b62cd963",
    "currentSha256": "23f218a916011b7d49cbc4d889f604b37ecadb713dea70d00e7cf9d4d7e8fdc0"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "verifier",
    "previousSha256": "25b1e6d01419a025d0a5376e8f89a043a84eedcb7f2ae908bd2914edff40b69e",
    "currentSha256": "b39b36e1132d8d4e7f46cbcba9a44f0b99fc26b1d07eab42f37d8de58f180e91"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "verifier",
    "previousSha256": "7a36f6846031ace8e460db3303bbf031c24405aa9f982b13036268416e55734e",
    "currentSha256": "83d234514adf5adf9ea5fdc8f320b113df9a06c62ea1f2b91a027fc5a0f1cd25"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "verifier",
    "previousSha256": "8c98acb271d6288bcabaa8e033d619d9d1115fb3faf79de97d314c4718a3c7af",
    "currentSha256": "2ea616dd3c765de747b47d62bec31cdd4a8bf8d1e0be1d78920814a312263a4f"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "18b603225674fd215a964a43ac31dec60fde56d8c14ca353a2a3939c24aebfef",
    "currentSha256": "feafbe3d8222bb236fa73be5987b7032ab26b14979e849254d6b391509d7a29c"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "verifier",
    "previousSha256": "9a3d34a5035ec69c48b8da40a9e3f1b1dd657ea15b8d1b1fda6bd634c172a205",
    "currentSha256": "66c6615e1b4ca620c778069af509b54402cfe2a0a0f85083615b7d3f2ea88a6d"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "33c44c1c73120bc9d397c8cbe0beaf4f4080f1eec111995d4091d8bb16c43e25",
    "currentSha256": "01430d9b819378a9d41d90771b3a6b00207ae01fa9f2c8be69768b0e51f7e008"
  },
  "scripts/verify-xeno-visual-assets-audit-v205.mjs": {
    "kind": "verifier",
    "previousSha256": "ba872e265f267e3a90dcaba0c6521b2910e364c0db1b805639516d325bd645fd",
    "currentSha256": "ad5605b10105f185fd495929ffe7e674ea67cc178bae9a9d49d622b0732f4bd2"
  }
});
export const XENO_PRODUCTION_ASSETS_NEW_INPUTS_V206 = freezeReceipts({
  "assets/openai/xeno-trials-v206/characters/arachnoid-heavy-impact.png": {
    "kind": "production-asset",
    "sha256": "f419648b5f16ed82eba9dfb69921dbeae12b42e6605c9891df2df91cedc352f3"
  },
  "assets/openai/xeno-trials-v206/characters/arachnoid-heavy-recovery.png": {
    "kind": "production-asset",
    "sha256": "4b937172bac49554e3408a5818fd813d87d2bb35dec1dc4e5d395f35bb34396b"
  },
  "assets/openai/xeno-trials-v206/characters/arachnoid-heavy-windup.png": {
    "kind": "production-asset",
    "sha256": "9ed3a04cd0cc39d714ba9dba4887ca186b287c87a25f1f00830dd3014d7571dc"
  },
  "assets/openai/xeno-trials-v206/characters/arachnoid-special-active-grounded.png": {
    "kind": "production-asset",
    "sha256": "92de99e7ab0a0b999e440954ca35627fd9e7a4074780a24e52f1a4de55fa64e4"
  },
  "assets/openai/xeno-trials-v206/characters/gorilla-heavy-windup-four-spines.png": {
    "kind": "production-asset",
    "sha256": "d3b61ecafc1793d1c335c57e3c716b5892dad010b8cf6a288cabc20fff24464b"
  },
  "assets/openai/xeno-trials-v206/characters/gorilla-special-recovery.png": {
    "kind": "production-asset",
    "sha256": "59d0d2ab8bf46f3b0187d829c2cb24989a3e3126a526fec36caf7a0982d5e95c"
  },
  "assets/openai/xeno-trials-v206/characters/gorilla-special-windup.png": {
    "kind": "production-asset",
    "sha256": "0f3490592578c5cd56fb5a0a74259928e57e7f3f464edea5ce4ff29a39d29c1f"
  },
  "assets/openai/xeno-trials-v206/characters/grid-heavy-recovery.png": {
    "kind": "production-asset",
    "sha256": "573bd6642150f3a313dc77a08fd3a57d82260ebf83c40694115b969405ee8369"
  },
  "assets/openai/xeno-trials-v206/characters/grid-special-recovery.png": {
    "kind": "production-asset",
    "sha256": "c962ee28d95bf773d516084a8c31584589d6f0ded0fbf900259fce61759e033e"
  },
  "assets/openai/xeno-trials-v206/characters/grid-special-windup.png": {
    "kind": "production-asset",
    "sha256": "96d69dcf4e4262c0f69dfb52d3e43349f63c531a706236b14ff1d66b8585e94c"
  },
  "assets/openai/xeno-trials-v206/characters/panther-light-recovery.png": {
    "kind": "production-asset",
    "sha256": "4016ecb27af2fd111470d502ae12a20bc213dca48db8c8dcd8ba39d946c724af"
  },
  "assets/openai/xeno-trials-v206/characters/panther-light-windup.png": {
    "kind": "production-asset",
    "sha256": "1301b08f9048deaa18020f3908be9035061dd0e41281d0fe3c13b8014555f07d"
  },
  "assets/openai/xeno-trials-v206/characters/panther-special-active.png": {
    "kind": "production-asset",
    "sha256": "44d1dc982a8184f40b8efc5bff31eb6504f86d1eb2ac531cc451274dd0716d40"
  },
  "assets/openai/xeno-trials-v206/characters/panther-special-recovery.png": {
    "kind": "production-asset",
    "sha256": "b75bc63ac51284d99c42a73fc5077e2312653feafdd86e2ea8f324df4208fb90"
  },
  "assets/openai/xeno-trials-v206/characters/panther-special-windup.png": {
    "kind": "production-asset",
    "sha256": "d594c9581134d92cacdcb9d65ad6622bd2f0b138faf503d42612fe079fb4c09a"
  },
  "docs/forge/xeno-trials/ASSET_LOT_V206.json": {
    "kind": "document-input",
    "sha256": "68b86005b542f4467eff14974ae249fd1d25832095ba53db484dc225b1e7ee2e"
  },
  "scripts/public-xeno-production-admissions-v206.mjs": {
    "kind": "verifier",
    "sha256": "06f33ce48dfb3ae096aad234ce627ca65af49ae1a72483fa356d2c7ff5ef50d8"
  },
  "scripts/verify-xeno-production-assets-v206.mjs": {
    "kind": "verifier",
    "sha256": "5f231063b6a88420cfbacd170ad447da254e14ff18badd7771d89141afab07cb"
  }
});

const freezeJoin = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freezeJoin); Object.freeze(value); }
  return value;
};
// Tantalus join after fa2d62fe (V206, PR #50): merge of this line into the Tantalus
// branch (V188 + PR #49 + main/Obscura). Each receipt maps the exact fa2d62fe endpoint,
// the bytes the V206 chain reviews, to the merged bytes. The Tantalus chain ends with its
// own TANTALUS_PRIORITIES_XENO_TRIALS_JOIN_V188; V187 requires both chains to agree
// wherever both pin a path. The V186-V206 receipts above stay historical.
// BEGIN TANTALUS JOIN RECEIPTS
export const XENO_TRIALS_TANTALUS_JOIN_V206 = freezeJoin({ baseline: 'fa2d62feed6f1042660914ac47998a96c1e2bdce', successors: {
  ".gitattributes": {
    "previousSha256": "f4a034b696995b035a2ecf218829f79eb373eabfc551f6c798f01de4d5b96db8",
    "currentSha256": "1d4733487bb47787d8a5bcbf3839ce9e24c05e17f39ecde65303d7ab73ff8aae"
  },
  ".github/workflows/forge-regression.yml": {
    "previousSha256": "47e85b0921be154df7c2626217832f01aae86149e4f14c3d1ba27f4235002297",
    "currentSha256": "3a9a92d9262af8726532486440dddac7ee6c47421d4c45697dc61a14ad2da720"
  },
  ".vercelignore": {
    "previousSha256": "0f02f4a68543feb83c3c9ca7796a662271c062d91c392b26687a8b90bd90b2e3",
    "currentSha256": "499a5f9fbf9f5d183dadc869ebac3453b5e9d364be3437c645d79d4aeea98309"
  },
  "LICENSE_NOTICE.md": {
    "previousSha256": "9a9f2b4bad2c4f0cd2a0b4b2b274607f12c80884489c41c30d1ea2fa1efea714",
    "currentSha256": "7cb68d12e9f47641c45c8d61d5dbf5ba846ff3688a1f5be2ed9a637cfc88fa74"
  },
  "assets/audio/manifest.json": {
    "previousSha256": "fe1591ced8f54e576de99963bb6034ee35a06d07cafa5022279bd04ac9fef8ab",
    "currentSha256": "d62af84b5e5732ae052f5d488790867880ec2cf16b22c15be5d4ae2570517edd"
  },
  "bioforge-v80.css": {
    "previousSha256": "7c81329084b7f189fc6893571ff50f1b806de302360c4a5a5ca9056732555d39",
    "currentSha256": "759e4893bdb3cbc163e4e24432adf1b582429ca7377f0aa153abe22cf6b64178"
  },
  "catalog-v62.css": {
    "previousSha256": "bfa4b96ed445e8274760e3f7ad9cf876d9eec5ee5ab958f0c66e88177b01c780",
    "currentSha256": "6ab2b5141eefb3defbba0b9c4e9b2f37ef0ca86b9e79fb7360c725392bae30b8"
  },
  "command-v110.css": {
    "previousSha256": "4c22914bedd2d9de880126cd29dd5e458d37e85d56603fae15600b4621b94c42",
    "currentSha256": "fcd7c6d52cc691fbd22841a2488808f4024ac8a2b55a6bbad36977217b24aa21"
  },
  "crew-v85.css": {
    "previousSha256": "1faf6a4bbe6b03ff639d22722837a401a043981dbbb3c64893b116f8c659bc59",
    "currentSha256": "1e7fc4a93232a8779c80aa008f88defe864b93c7253b84cb4db8694549f0d2bc"
  },
  "docs/arsenal/README.md": {
    "previousSha256": "61c87b06e64ba5d2bdb3d91d22fb33b0fb8038309be8c3d98a43547444e13b4f",
    "currentSha256": "112cf2ec236f1fc8da0af8268db1ffc857741d028560942e0413a66e0562a336"
  },
  "docs/forge/xeno-trials/ASSET_LOT_V205.json": {
    "previousSha256": "5b9137d9bd660da8f78987e864c5381bb6ab39e24e6421042cd47704e6710d76",
    "currentSha256": "fead0cfdafd70259680cf507e430f0b8af6d800ad49113c95135717314403793"
  },
  "docs/narrative/CAMPAGNE_PRINCIPALE.md": {
    "previousSha256": "95287e9c3f9be2b88db9e391a9a143c4c69be8956b6763e4113645974b9e878d",
    "currentSha256": "83ae6c7fcd0dd4e159e18e821b26de89e3c353620eb9a9660eb450be59cd2590"
  },
  "hub-level.css": {
    "previousSha256": "13e29b3719e1246d595dadca4c786cbeb5a471dece902104b0ccd29a1de9908d",
    "currentSha256": "12c8e9e7f561a2eaec89fe9dfac46a190b1cd801a303cd85e95820b66821c818"
  },
  "hub-stations-v61.css": {
    "previousSha256": "eaf2b041ec39337b763d6d919859a7f79276c5eff920049980428b365202dfd5",
    "currentSha256": "863d52f5e9b27f5c2395e4619a855a613eeec68290148b09ccbf965593269e57"
  },
  "index.html": {
    "previousSha256": "ee97f3a438cf92e3b4a34beb28ca9c5d7687a40fe5cab389fcf5876085a789e3",
    "currentSha256": "a3655c982389d7a0af384f484254db817b04dfd9d3a2af0518a79714244314d2"
  },
  "package.json": {
    "previousSha256": "d5d2e4c965479a658b2289e7e51fff6456c099fb99e9b322ea289a3cd40a89ef",
    "currentSha256": "ce7fd604dcf4a997abd678f201a5e33e2bdaee7b58fea114ec81922a66bae2b2"
  },
  "player-appearance-v126.css": {
    "previousSha256": "da7045c7fd7d41da99eecf48d316150b2d16fac276fe635bb881034bd68c9320",
    "currentSha256": "d77e484c08e74e9094bb54489f06d1ca0c82a98b63b64d8c0367e15ceee0e9b8"
  },
  "player-onboarding-v84.css": {
    "previousSha256": "ae49e974d70f1a46dbd28da6d5515fac0124c992591cf0c1c50ad3e7e3d1cfbf",
    "currentSha256": "6777002acd6f07dc583388b59aecf11a03e7e254aca7dab3c93c3b21d49522a4"
  },
  "runtime-level.css": {
    "previousSha256": "28f938a757c83c1ca286d8520afd164fe1b6f8bc1524bfd9d3fb8e7e0f36f4f8",
    "currentSha256": "1f6bcc91957eadc2dedef5cab122a31a4be60bcef26ffcdc83130e625bd30fff"
  },
  "scripts/audit-native-qa-resources-v187.mjs": {
    "previousSha256": "74908e96de43186a67240f9ac0590d3e9d3bee4418cce371cbd097478c7bd68a",
    "currentSha256": "e230ff8baf9dc681dace32ff9beb3c24eb5d4dda464128dbbcbe8e7d86930e47"
  },
  "scripts/audit-xeno-visual-assets-v205.mjs": {
    "previousSha256": "df20ceb51b521cb2b0f6a16c5ad6af6552cbbe0f8b6bbe5539275a8370bd0d14",
    "currentSha256": "dc75881e8412471238f8e36e0d2568e11f6103118efc24a97a26fe3a9752415e"
  },
  "scripts/build-asset-filter.mjs": {
    "previousSha256": "a48aaf9540b38871ff7e96433b9b90863e20e00926e9d3c25c255e0c9f812d63",
    "currentSha256": "384b67baf7303dd12f74e90836510fd2a884068a18ceaf96cc89412a0ce50073"
  },
  "scripts/qa-audio-native-v162.py": {
    "previousSha256": "7146b44fe3e2f6db5daebc24db544a179576572c6fe5f233f5a64cea28b42f23",
    "currentSha256": "25b9f61d43375cdb14b339cbde91521127312a07c08e292aa19b93121e519c43"
  },
  "scripts/qa-black-cocoon-browser-v158.mjs": {
    "previousSha256": "b1f51ea9b508f9dc914664b8cf565e2c4be0ee5637756377c5a79465d0fd3604",
    "currentSha256": "fc5b73f2315d19766cf1a609066f3f4fa89b557caf64e6b4e4bf618e1702cef8"
  },
  "scripts/qa-campaign-convoy-history-v162.py": {
    "previousSha256": "1ca0444509b2207d92c18a88050361250e7ac3e71281d99f232ceaf666a36deb",
    "currentSha256": "4c7733592f7a9b152d6584e9c01caa5a088216e1ba975139bddfd819edb3285c"
  },
  "scripts/qa-campaign-convoy-v161.py": {
    "previousSha256": "fe8706215dd054c998ec4d056afe84864f8d8ef5c6705a2f7d81964744bccc7a",
    "currentSha256": "16cb29a0aed50b4bdb10045b91ae49ccf352383867a960406c8855988f06e26c"
  },
  "scripts/qa-campaign-lethe-v163.py": {
    "previousSha256": "a642cf68109814d9c445b12c329a522f8dd24e94f6942064535f56d717be9099",
    "currentSha256": "0e1f4f82d76611b55609c215a0d2457340cc168e9321bdce2af3a4a8164645a5"
  },
  "scripts/qa-campaign-story-v160.py": {
    "previousSha256": "764abd5e5c1b572049842d8babb203dd1aa9f57678a85ff128baad347db74d31",
    "currentSha256": "7d3ded62763a4db3f5fa1a2554c91d46656f87d0f18459896e2b804301ee3e71"
  },
  "scripts/qa-forge-npcs-v158.py": {
    "previousSha256": "f4ddfc933272eaa547c31abc998b28fd4ccfb539da99e94ae7b40187a088f9f9",
    "currentSha256": "a0adc5378c5a79df12fab12987e87970804e9e38c0d7895369629db3203bef82"
  },
  "scripts/qa-harpoon-native-v162.py": {
    "previousSha256": "85700322cf4f7698afb58528e3f7efa23c53241ffd6005070788d0c78b8291b5",
    "currentSha256": "2bc34b751ad17892ab4cbf94811ea72b7b010702238167dfe86801c18d11a268"
  },
  "scripts/qa-hub-lift-transit-v163.py": {
    "previousSha256": "98d903bc5715944c2e2feaad609a0c5cf3000ffd8c18659aaacb509dc960e46a",
    "currentSha256": "b13c06a38448fdaa6bf88e9d8bf803b5219db4afadc4d07537f273c4adda59af"
  },
  "scripts/qa-hub-navigation-v133.mjs": {
    "previousSha256": "a6273b6ea62709fee62a2b5ab8996da2c1b967cad98c83f4cb497de07b8c7e40",
    "currentSha256": "962bcda0288d96fb3006a4c16dfb56562606ba170e69f184a310ac0d2dc10c53"
  },
  "scripts/qa-title-compositions-v163.py": {
    "previousSha256": "ce9302dbf0941059913744e3671f46eb31f1e5833d31a1596bf6b79c5522c121",
    "currentSha256": "e5ea9bd5a6dddf15ad3c4993f7233ff1ec3f8aac497ab815e16b19df86d381d3"
  },
  "scripts/qa-trials-continuity-v163.py": {
    "previousSha256": "fdb2fd7252e79d4c9a160aa32ae101950ac8d04498441df54764f5a1f8dbecbb",
    "currentSha256": "be26d35484c30516f1a6a243d4a74e993389c551bb57fddd1121caf0252d3e76"
  },
  "scripts/verify-audit-continuation-v157.mjs": {
    "previousSha256": "641676a21373c30747555d01f180a8c38f07819091860c6c1924bf6f5c08b5cf",
    "currentSha256": "a92ffa1c385c12159293a1d18d36c881180f48291bc58947076ed2f7b67784d3"
  },
  "scripts/verify-audit-continuation-v158.mjs": {
    "previousSha256": "87ca45b2c3c48d96e9ae02f4a57241b723372e3e12cd172ef4f978f34ba3eb98",
    "currentSha256": "09977386675167a50d8e399532c948c344d753237ca50383d93bb5cda112fc68"
  },
  "scripts/verify-audit-v143.mjs": {
    "previousSha256": "3884df6e20f1d9bfeab80087c5b4e208ef773b3ecbe3ed27fd2cd962b280b45e",
    "currentSha256": "76d171125474cecafae9e656fbbefa0bff5d124858ed38362d6f976d03dcc2a9"
  },
  "scripts/verify-black-cocoon-presentation-v158.mjs": {
    "previousSha256": "96029dc66cb8781bd30bd91482dbfbc7466679020fd22420784e7baaac43bfa5",
    "currentSha256": "cb52f555918b941d0eed87a3e4b10fcfdab8563536e47187b8b42dad3db6e930"
  },
  "scripts/verify-campaign-lethe-v163.mjs": {
    "previousSha256": "2bbeef4cb4340350e187cdd22945e800df43cd3207d8f72429992250b05883b8",
    "currentSha256": "dcd9ef0b0814546780eed9fbf40ffbe90444d673d782025b0405df77951161c0"
  },
  "scripts/verify-campaign-story-v160.mjs": {
    "previousSha256": "8a7d9b5722882df610e87dfb4d393c5c879f281d06bb127c645d01649587d885",
    "currentSha256": "1a2c71beee2bc19433d6c67120ce582067e31ed2181309448d00398e454b06d0"
  },
  "scripts/verify-ecosystem-missions-v131.mjs": {
    "previousSha256": "c716b405a36ef91816d72e8f97a1fd431717e31ac5c98c37e6e02d20e5a26fb4",
    "currentSha256": "51fcb1f19305187be4a944a03e359c1c2e4c318dbc8a7f5d3f6c62aacaa3341b"
  },
  "scripts/verify-enemy-tactics-v130.mjs": {
    "previousSha256": "8fa1f8de291e353563d45d741d3563d71fdb1434101e8cc776123f5c2229c17a",
    "currentSha256": "e5bb1021d7e5b5dd62c98823d7eba1cb5e4b0de6a1101f9e28d3d8c6c2474cff"
  },
  "scripts/verify-forge-npcs-v158.mjs": {
    "previousSha256": "ae3813cbb02f125e450fcf08217c2ffa8512915d98bb983961d1a2810a9ec34d",
    "currentSha256": "f4a31b5e47c01e150aaa0b26a819130f560a717b157a0e307d58e17dbc6f0dab"
  },
  "scripts/verify-hub-lift-transit-v163.mjs": {
    "previousSha256": "91c11a74e3ebdd63beb3147a959bee1e5f2b679de87ea811b3516d515f7a0f0a",
    "currentSha256": "75c66348aced19ffd5c9c95a5c2dd2224f27c9cbfcd238dd9737d8f774fc8553"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "previousSha256": "f4d8ce2a42b33855527b8e3173c3999c2e294707e37b9f222da26fc0644039c8",
    "currentSha256": "4abcfb2e30d5cc770e9299c5af4b766fc5b1f20de1628f4f7a17b611ce428263"
  },
  "scripts/verify-i18n-v185.mjs": {
    "previousSha256": "436bdd6dc79cb9e177f08d736661194dd42883b2f3240d2f75696319661c8d74",
    "currentSha256": "213b46c0fb271c8ced722882295c76b2130c1a847bb4d006ff8f0cc19f447ae6"
  },
  "scripts/verify-legacy-operations-v131.mjs": {
    "previousSha256": "950fbaa2c7b92d1b062ac7b933862c52c7787ca00671e1922213686100ec3e28",
    "currentSha256": "5f6d68c9ebf657650f7700d40d512fd939c7d1bc32b0968af8e457e6669cc2fe"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "previousSha256": "7283bb82903a742f2dd662072b0bad6c1da4fb5ca60c3c56001b4e54e734ffd2",
    "currentSha256": "05367a5372ae834063f6fce495b70d431553977c46efef28337921eb71525bde"
  },
  "scripts/verify-placeables-extension-v132.mjs": {
    "previousSha256": "961f003da975a98262df42df0c0801e27b0cd24ac37062b97676049afb12fc2a",
    "currentSha256": "ea484d509c56907a786a39bdd59dfc56144c77fe3f91c0c95b722e698387c6ac"
  },
  "scripts/verify-public-release-v86.mjs": {
    "previousSha256": "1b81da575ba68fcb5186cd5c47cd9d25f525904b84000b97e1b05ad796dab2cc",
    "currentSha256": "e93456f5bc7a8647c4c4ba3a6d9a05ba59ef0f9c864b73515a832b86f6361705"
  },
  "scripts/verify-xeno-arbiter-campaign-v190.mjs": {
    "previousSha256": "54554db19910b260837967ece8f6ec6918e6c946ea6a2b5b643679ab84d3b41f",
    "currentSha256": "dc0a787e1f6e10f2f64f82a961d8c40a114efddd43bf85d78a227be1d02a1739"
  },
  "scripts/verify-xeno-arbiter-i18n-v190.mjs": {
    "previousSha256": "82f70d17fa5b4fd08f8b78392ff49649ea9b72cd057c0a8bd845540ce2a8d20c",
    "currentSha256": "dee31b23b12aece4bda6614d498d08169550073d010f0b2f572e55e234e1b4fd"
  },
  "scripts/verify-xeno-arbiter-protocols-i18n-v191.mjs": {
    "previousSha256": "60657d043c9332bb0853a8c781ebc86e7e681b3325937d6661952711bab29125",
    "currentSha256": "56681c6badbd674b2d1d6fa68f4a7a0ba23086297e4c2a058c26ec5169123e83"
  },
  "scripts/verify-xeno-trials-animation-audio-i18n-v189.mjs": {
    "previousSha256": "ba529cf66760f865a60d4dffb4b471fd06fcacb1682c3eb9e24272ec9576f65d",
    "currentSha256": "07fac42fadf2c09fbc1f6a17e70eb51e5944a2985f48edb6312a703bbdb6db3a"
  },
  "scripts/verify-xeno-trials-franchise-stage-ui-v192.mjs": {
    "previousSha256": "8592e5aaa11fa366c3a3d1f546ff67ffdcc36b3e2fbf766c8908341ba388b750",
    "currentSha256": "d89892a09d7ad05597bdcc910f0dd0c90bbd0efca3dc67ba067b678beff87226"
  },
  "scripts/verify-xeno-trials-i18n-v186.mjs": {
    "previousSha256": "406352c5fadf875e0027f07e98e8068c64086a825a00f02ab74275b0ba878f11",
    "currentSha256": "3e137d2697b235ea1c26c88caba797ba0369695aa1191b4a698e1035383abae2"
  },
  "scripts/verify-xeno-trials-operation-i18n-v188.mjs": {
    "previousSha256": "003f7d67f4ffc33841a958fafb1568bc0e8b0d4e81e794722b83c10e5edc4f39",
    "currentSha256": "10f0c13247f31cb295a5ebbe317fe189a2f32cabdbc28148734dc0fe9c53cbd5"
  },
  "src/alien-survival-runtime-v70.js": {
    "previousSha256": "65d5c0c4ca446021b6ff58ed6be61fc622c0908ede9d9d74b730fa0efef2fd93",
    "currentSha256": "ce5457b475195eaa02020384d3d6355cdf34901e178eb9bc96ab4e2a8617e46b"
  },
  "src/alien-survival-ui-v70.js": {
    "previousSha256": "5a06adb0a5bf769e5d6bdf5c6438b0f7829df73d9b3e87655c9f574c876ea5ec",
    "currentSha256": "22f5bd37d5c8309f900b78d1f3b0f046eeecd3026d0917089ec16bd7328c6196"
  },
  "src/alpha-bravo-coop-runtime-v69.js": {
    "previousSha256": "85a9ca41d593a723bf0cc55c13bc1f40e5afae05e5b3085bf51423813b08aed1",
    "currentSha256": "2da4a5c7fafec2675ed92df47078ef47f30b776e83adf290210eb8483fe2dda9"
  },
  "src/apc-convoy-runtime-v121.js": {
    "previousSha256": "b1fa0c689763ca94ddb37b99020acedcd176d057b5d26f16ef24f9171c39a4a9",
    "currentSha256": "afcdfd3f15db9ca405e40bee563a2d1ffff5d90bcaa2c6db377385e22a77b32b"
  },
  "src/app.js": {
    "previousSha256": "570a0bb52c52a92eefe596408ec6fb54f446c77998d69b80c4332576783a6c30",
    "currentSha256": "92264173234501d4eba42e8236749863b853c79a9b843ed0876ace8a8f3e997b"
  },
  "src/archive-relay-presentation-v160.js": {
    "previousSha256": "e628ccee6aa0a2ee40eea1fdd3b66b11800c3185c39bbd91c18d662c05749a30",
    "currentSha256": "c64c9e1a7167fe87ddf79b4f599ef4e99756bfa856ed4303e95ed24f257b5403"
  },
  "src/archive-relay-runtime-v122.js": {
    "previousSha256": "e77a3eeccb624e501e61d5c883e357a9e5ddfc0ce97a881e1a7ce488319666b2",
    "currentSha256": "0234fe37a68b2895755de98d48b1f36a1d677c421df92a09959a357914ea3c12"
  },
  "src/audio-assets-v77.js": {
    "previousSha256": "bbbc868dbf7e0715be6d717d1c5ff142246a95a52ba3ff2e97f4ad11c9f34ce2",
    "currentSha256": "fec1cd050aa97c1a0350954ece0945145ab84b77240b19f15fcca6eb8805c109"
  },
  "src/audio.js": {
    "previousSha256": "7dab1c16460a748543686d3a1fc4306e36fe0e2b28ce505663ff5d2a1a6584bc",
    "currentSha256": "ec544d2e6975093041c94e8587f4191d60cfa2d2ce787a902e697c4bbeba37ca"
  },
  "src/bioforge-runtime-v80.js": {
    "previousSha256": "a476e63ddd9e51429d6b29cd16da1799dce4bd8cd56e166009e0c7ef6de93df2",
    "currentSha256": "1a12c4fc94e85767e6744be8e01861b9e1a325fd05c793f50bedc8ac9ae7448d"
  },
  "src/black-cocoon-presentation-v158.js": {
    "previousSha256": "69169757f789461886aed3788b79e5ba9adcbd8bfa41b5cab81af85ff0be0767",
    "currentSha256": "b82fd90a95873e4ae9a48ed27f1ed7f15c72dbd38a13bdb47bc17a6ef19fae0b"
  },
  "src/black-cocoon-runtime-v121.js": {
    "previousSha256": "d2c40f3a1c5e03468d5a26bf30075f18f94914a0d8b0f7b6caec9fcc01abff05",
    "currentSha256": "42504a0d78f2fdb5e7b91c315d23d065e4f25d5e80fb7199bd060326a6188555"
  },
  "src/c12-horde-runtime-v121.js": {
    "previousSha256": "473351ede70a64f4a42260d7168d57d25461d589c03b5872e0c58108a69d52d2",
    "currentSha256": "08bf29cb6309f7e992a874b3f761edbf39a7b464a9e73edc930eddadb03ef327"
  },
  "src/campaign-consequences.js": {
    "previousSha256": "359a55917b4cb2cfa2be07485d202cbfc57ca993dbeaaec5097801bda4504f0e",
    "currentSha256": "05105a1165afa9ea1c1aad2196cbbc6e2c4a8339063ce35aa3d0fccb09b0a4f8"
  },
  "src/cargo-brutal-runtime-v67.js": {
    "previousSha256": "40332c0214212b5916d7880d8df64d5d84b270a7f4ed2e27ae3f7782d8903e9c",
    "currentSha256": "9487c281d5f07e40b1771c18033ac68928a96a7cfb51c1efda37791173b1af8a"
  },
  "src/catalog-scale-v72.js": {
    "previousSha256": "f778ab5a45e01900c99b7912c8ddcab65597b76590e2168e8a0c7d36b84e8f1f",
    "currentSha256": "ed80e44ad26691b6009884ba370e96877192a8fc2b701d946681692dbda37e62"
  },
  "src/catalog-ui-v62.js": {
    "previousSha256": "97c6e8e1769a87881e125ea4766f0a102621c013f736d5219db7cb477a66b1c4",
    "currentSha256": "4308f0cb74a3a90ac55a78877386080a11cf84b6b0dc50e744bfdf5eaf01f06d"
  },
  "src/cloud-ui-v119.js": {
    "previousSha256": "66f76387285d3d7f65a5c10ffde93e23a92a2a4f962d4ee6b603af35b7b66b49",
    "currentSha256": "b828647d72de3dd0c1c1b070bee76d6f472dbed9d6b967e50ee5bc40546a995d"
  },
  "src/content-core-v50.js": {
    "previousSha256": "6d073593ea5854b17ae626556ba6bf6259f835bd4eb59ba3e0d1a5c785418fdb",
    "currentSha256": "720ddfcc4bcf9522877c555ae7a9958c18feca506567e00294b1703f72236589"
  },
  "src/content.js": {
    "previousSha256": "a7fb0c9bc6da8ff2bf9c008dfbbf2f580a9207ac9a8b1ec6f8e06025003363ff",
    "currentSha256": "3541cb9916316e755e998c95ff61bee23acb867f333c572fed122809c40708a5"
  },
  "src/crew-ui-v85.js": {
    "previousSha256": "f50ab347b6b209dedf954a0e5dcde236b16cf62360df502a1bea38a67edf453a",
    "currentSha256": "ca538c46b5134d1b9f2ff7d8f6d1e0392a5c729f73456051de3ad682aff01835"
  },
  "src/ecosystem-missions-v131.js": {
    "previousSha256": "63bb1d49b9ee5b34114ea3353897fe9a1fd6314a6841ab04ef221552d3a3c889",
    "currentSha256": "bced08c735be1c49f01afab83cc0e134960f2bdc90a480dca2d056eabc3e0be3"
  },
  "src/ecosystem-systems-v131.js": {
    "previousSha256": "8ee1253920709a8d00ded0306b8937de490941a46abc718b9f0e2f89c34bb7a3",
    "currentSha256": "b3719aaea2f23be2a031c15cb66d857386f11a3f410230d5885f6c9f21e16272"
  },
  "src/enemy-dedicated-poses-v99.js": {
    "previousSha256": "2c8e366bb38b8a0e54e5376572f4fc6543ef9fd01e5ba9e0a6137a76a66e8ec5",
    "currentSha256": "200a21a8d6939cabdca388ad23449a88e97f14589470fc3e52e1e114939d33ec"
  },
  "src/enemy-user-campaign-runtime-v88.js": {
    "previousSha256": "3bb9a8086aba8e66f655d112a189580d541e5f287c03d9f1077c3d78d241384f",
    "currentSha256": "5732766c2b0e23ba2edd535f8c2bce9b4856cb4f8e7817da9cb686840aaf4436"
  },
  "src/field-media-ui-v135.js": {
    "previousSha256": "30c23b3543823af45377ecc75536a91a4bc770ee84ce075aad99e9edeff35435",
    "currentSha256": "ceb7f23f62c042e0dc6e9bddb1c32bd05469a0d24d934bf05ccb4f680611c346"
  },
  "src/game-complete-core.js": {
    "previousSha256": "219406a37f2c7750aaebe0b06646f7a659e8618b0fa562d83e07218798945b2c",
    "currentSha256": "287b638b3caf82cc8aceaacbe2e21837b5fb47f8535b08ebf486a61bf1f3d77a"
  },
  "src/game-final-runtime.js": {
    "previousSha256": "fb94b1028dc182ccc97313064f2f47ad958733db47268ae7b308dc0085d4aba6",
    "currentSha256": "b2f0817d43bee94f4d40430e696277ac9272d7f97ad891ac77baf4cb083915fa"
  },
  "src/game-production-base.js": {
    "previousSha256": "95b136fcc0caade82a784522dcedc635d6acb2ad91ba6517c6d07fb36ca89793",
    "currentSha256": "3166ac26df25719f6c35250a8e7f8964b5109c689edf9a28fd26ae30b15cc460"
  },
  "src/game-production-resume.js": {
    "previousSha256": "dbb0f31045e4da9a0acfa15e3ff334b3bf96da489a1c54db43e0d944664d2929",
    "currentSha256": "c73d044c8d19f3558a579148f3cf7c47e57075a58cbf53ee66695fb59995cf7b"
  },
  "src/game-production-runtime.js": {
    "previousSha256": "2c12ae1bfe30bd28c19035cf84e2cbbe10c88d2c39fc24b5dab21d91229a2886",
    "currentSha256": "4adf7a4a892d7272f0e359fe4c00065d48069ec80eaff718e07bba6479150aac"
  },
  "src/game-runtime.js": {
    "previousSha256": "9005aae32379ade306e187ea6c3d156f1a3083178bc0c0808d9963cdd6b8f379",
    "currentSha256": "a2dd71ff5cfc8b450172618f82a0f98710a4736e9cc64818a06b949ff7aba6d0"
  },
  "src/game-v51-runtime.js": {
    "previousSha256": "50551b2f20e6fabd825ab6c6865244f2a47e77aecd337fc0d79386fdd5d4f017",
    "currentSha256": "8adb6bf47a43266b87227bf9539130b8dff2b8aaf09a3af59ae19cf69f188c19"
  },
  "src/game-v52-level-runtime.js": {
    "previousSha256": "f394cdc77d4684846cbfb5552ec950f4ba9948d75a09091177627ae7763112c4",
    "currentSha256": "ec3e2ecf4bdf90d9cdeaf6c432343123785376a2aedcc9be08517592fff10cf7"
  },
  "src/game-v52-runtime.js": {
    "previousSha256": "ac0049ef9ba4a732b126d2de85984e78e74a9fbef2ca36b428d0fbcf23fa821f",
    "currentSha256": "e609f9ebe6f63a526ad3706d359bb7478578470414e75b7c5aae5b35341f9558"
  },
  "src/game.js": {
    "previousSha256": "092e72bcffdbe66b1801c180c79b2f854d1ebbdc85d53ded138a88881c7404bd",
    "currentSha256": "554cc78f82a3b9a82d4b2c5102342cc7eb69aa74de94ebdbf0667f46da536e1f"
  },
  "src/hive-missions-v131.js": {
    "previousSha256": "b4538a7e3cd6fa58275a29e8585c52b3788000bbbb61bc39419e5dd6f5756b20",
    "currentSha256": "6358b7625e5958781916d592e1f1d0228eb43de53e570c48289fbb1a39d82557"
  },
  "src/hub-bulkhead-depth-v134.js": {
    "previousSha256": "b330fdbf92aa34f8cfb49b58a9229bdedbf4a17ec11663d9ae6e2146a1eec41b",
    "currentSha256": "7ad9e27e4623dde938aeea29272adc5a58362cdd3b5d996863430619ae8d7ff3"
  },
  "src/hub-circulation-v137.js": {
    "previousSha256": "e4aecbda986750a67926449a7fd392f2845ca913383690759ad7a5e5f25ebdb9",
    "currentSha256": "39997d5bcd4a93d9a2d23cabcf252fb6e448ca4f967f731e6073b35e0def07a1"
  },
  "src/hub-depth-presentation-v116.js": {
    "previousSha256": "a8b53d01cc99acea92544bc50ef34360b03a47e80015158a60761ae9513b1314",
    "currentSha256": "d618f3d2d059a369caae3730fc47fa027f2cff9d3d1f2eb699fd82753fc6d68f"
  },
  "src/hub-destination-signage-v138.js": {
    "previousSha256": "42d26e99ad1a71134b051a2edf49f3b804f7d3d63ea6d5b7de2cfb5cae4fe8c7",
    "currentSha256": "4c9c018e696c6ffcaaf2f494e1455ffb0f0e55320f2f9e341b6c625fbbdc40e5"
  },
  "src/hub-lift-transit-v163.js": {
    "previousSha256": "05c6efb9553eb7908a633b1c811651efe6c292c4a036c2f8628fa051c1bae824",
    "currentSha256": "95b5247498c581847207c7b477af94d7a289a5e1d19650d4490416807794acba"
  },
  "src/hub-port-meridien-v90.js": {
    "previousSha256": "9f3f75b8e8a9fbe77deb5afa428a5ba158db05b98ebe2e7af08b844af248eb93",
    "currentSha256": "c6b38c0fd78f8576cfc72769b6b3b0a8bda12764dfdffb2b35f20bbf23ff1fc9"
  },
  "src/hub-room-projection-v139.js": {
    "previousSha256": "2306aca239279dfc799902e4be4e973ca75a3e68170d455ab74df14e395b95ac",
    "currentSha256": "db89bf0d3434028f9e715a2c29670326d2d91d85041e330bf8cc8b5fc4ee847f"
  },
  "src/hub-support-planes-v139.js": {
    "previousSha256": "6663a4953375fd09385a77a84106b45346dc0c4d920ab96897e3100e20d4a605",
    "currentSha256": "1362a53d2f2d80c01a3835f651e7654982f5a4f941d958691fda4a8f1c58300a"
  },
  "src/hub-v51-runtime.js": {
    "previousSha256": "1cc35c82a83910dc154305f952118194162cde11382388734529bb5a73a54a4e",
    "currentSha256": "4ef079604de7e2d5a18057ddcd401219c786242484a59b5f77dd902f695d2588"
  },
  "src/hub-v52-runtime.js": {
    "previousSha256": "7b67eb2cb7c5281e3ae0acd69adfb252db555a00f879194a553012b8d53efb4c",
    "currentSha256": "013d80f0fac643ec67ea00947b936c49be856ead9fd453a4a0e8376c1d803c93"
  },
  "src/hub-v71-runtime.js": {
    "previousSha256": "0013ef68e3db38888a83e97b88ab5615b8a3b4ebe9f229c7d659a5381433956a",
    "currentSha256": "bddf73a89222aa36e8863deac625d3cf5a3d6b058778afbd838291a52cceca24"
  },
  "src/hub-v81-runtime.js": {
    "previousSha256": "26a75cc4fe0e7280146b370c9183cd89a52dabddd865f408289439fe824e4067",
    "currentSha256": "7ad8064b42b405f8194781e3926909aac77916a9eeda422ac2e5cb07e8332444"
  },
  "src/i18n-en-catalog-v185.js": {
    "previousSha256": "67d75b265b97eba14e2aa52b353bb3c6987bb9764a9d17d101b373a21e899a52",
    "currentSha256": "82032a9550d2fc5695a7d4f4e0de8ed0ebfd096e207fb7bfb746d835b3ef1aba"
  },
  "src/i18n-v185.js": {
    "previousSha256": "592b025ceca9008e73bff267be72a2a3b614767fc220f82cbf2a3ef792060e7e",
    "currentSha256": "5ca3bcd1416f0a342af209493b0d7e41613ac4a5efa8972ee6a451eda1502737"
  },
  "src/legacy-operation-state-v131.js": {
    "previousSha256": "95c3759015297bd0c6e5120222758ded484675d41610db68c40faa7d75c7a0f1",
    "currentSha256": "bda3ae3681cf383b1a8100e9110ba931ab62ba4d4f0f94a02d4a98ed80add7da"
  },
  "src/legacy-operations-v131.js": {
    "previousSha256": "ab9d4021dde9dcf8609f1a23e43643b0d4f94857836f9df8145641537ce0328d",
    "currentSha256": "ebeb8393217142382d16f0319df409eea4f3775aba25e62867000dedadcc4aec"
  },
  "src/mecha-missions-v131.js": {
    "previousSha256": "0f420f4ba4c7a4af3ea55d0c735d613a531020e342a60b1bef355006ac064d35",
    "currentSha256": "872932986e98c5e25744a204e7a7297fcc98001fc6e5a7409beba4c106627ab2"
  },
  "src/mecha-systems-v131.js": {
    "previousSha256": "9b80b30a3f065eae669f809d9d19266e90078d79fcbc1450e07d4e636bc350a9",
    "currentSha256": "8b4392cc457b3365aa075be83ff5adcef63edc6de45f84fb4fe0f571b3487087"
  },
  "src/mission-insertion-ui-v62.js": {
    "previousSha256": "7ee5a40ec08e355ca0d36ac386599e700b27129df3726232192fb28e5131d62e",
    "currentSha256": "c875da1636078baa8ef2e84059112579d7d6945eef75b23430cd29dfb32fa2ce"
  },
  "src/narrative-archives-ui-v68.js": {
    "previousSha256": "e4c8b6707eb40df6995f90629129275eda6d24557b7f44fd81a113d4bed80c2a",
    "currentSha256": "49b3dfd7770d956a639fab3bd80f2ae17f1cc45257ff9e18d5bf2859db43eec7"
  },
  "src/narrative-collectables-runtime-v68.js": {
    "previousSha256": "a95591168a10032265fccb51333f5a2886f4f647f878005c8a84676b95eed809",
    "currentSha256": "6b3d6129a603011456e4e309098a59e396b4853f72f14623979072c03fad0a3c"
  },
  "src/narrative-evidence-v132.js": {
    "previousSha256": "cbc87304d7fa4169a1432564a9d83681a0e1d020e656a191bd44756da32a9b32",
    "currentSha256": "61ec802599eaa817d762a0a91b437b0414c7979ea4628a6142956c22ba2146c3"
  },
  "src/npc-cal-logistics-route-v165.js": {
    "previousSha256": "e8206918faeede321fac0b43275da1a62a80e9591c7ff97b86ec8cf9ed7f5acc",
    "currentSha256": "e946b9050d5346c3467e6af00821095a8e7929cc88025b1adad0fc8142ed640d"
  },
  "src/npc-dialogue-portraits-v168.js": {
    "previousSha256": "04a7f8db4f4bb7bd10b2da6d90b8a0e20f647c3c9d0b6123fee77fd65d1b56c7",
    "currentSha256": "147141d9b25c9ff873ccf53eb6b19199d55879bff1eca983bdfa4e539565915c"
  },
  "src/npc-dialogue-v62.js": {
    "previousSha256": "806cfb582c5506cf62d09fc1addbf9a2461839c8d38e0e8a24221ef8ec73ac21",
    "currentSha256": "8a6ae1df0901c682f37cf59fe494a865fe1a6316efef8b1e726985440d742afc"
  },
  "src/npc-life-v136.js": {
    "previousSha256": "ccd320fd541abf156e59cac8e2af45322b908204e5141849252de487102c66d9",
    "currentSha256": "4ce51e73f59eddbc006fdde1b6bc754dd4d0b85e7f6cc8164a0b24c3ee56ea4e"
  },
  "src/npc-service-routes-v161.js": {
    "previousSha256": "a915ff8b546cc1066881e0ebf1b0e7a86b9fdf1af2748af5aa39e8ee396b9d4c",
    "currentSha256": "e977559b8fc6bfbedfffa2184f7a89057319fbcc595bc3f9a05bb0054f33cd8f"
  },
  "src/player-appearance-runtime-v126.js": {
    "previousSha256": "cce67f9128241fcf6e8f6932a57ec73b080c7e875acf024e15259450dbd9188b",
    "currentSha256": "8bb9769611a9c117fdebd039343d59a57e2e3c9c97a508224134c079cf1b5c11"
  },
  "src/player-body-rig-v125.js": {
    "previousSha256": "401f81aaf0b2f1ab3b90353486782aa755fb54fd16084a5beda964c5d6c8a1df",
    "currentSha256": "f281fa6f7ff16263b5b6dc5a249e5db0a76e994bd2d680af7b637deaf26e0f71"
  },
  "src/player-control-v124.js": {
    "previousSha256": "d024e6da1ad1f5f766c441e5be2e786553909bd9d921516d196b090bae4f446e",
    "currentSha256": "739c4b18f6253299ec1ed6d95db90b6edbea64117e7eb615cf2e1ca17d1083a7"
  },
  "src/player-creator-ui-v84.js": {
    "previousSha256": "0b5174e5ff3948b5ec987bc2fdee1aca277d64d4eb668ef369461df272bb566f",
    "currentSha256": "9236238396c302f012900efb31dff8fad515a36ecbe6c93e7d1a1aa473dd0482"
  },
  "src/player-locomotion-rig-v129.js": {
    "previousSha256": "4af0bb1aaca511418267e0e5fead565de6ec739263c35ffa84eeb85573416dda",
    "currentSha256": "e3001bebca64500ccd12a0ba50fc3c16fe1700acbf89845a694f52e16f62bd06"
  },
  "src/player-modular-rig-v126.js": {
    "previousSha256": "2fef117a684b16b6c426ed93f932ce91e660648682f50600c799f5cd6126c8f9",
    "currentSha256": "a63248ee1295dd786ac030c3825e596fe4927f202c4cf7ccd82b5c9d9a4699c5"
  },
  "src/player-transit-rig-v128.js": {
    "previousSha256": "5aceb439b4d5b5421073e4a9bd0fa0e5a7f8d2673fbbf3e88dbc69ebd98472fd",
    "currentSha256": "9ac395f6122f45f1c96b70238f81129bf501eab61d11c0529415cf71115f6b08"
  },
  "src/player-weapon-runtime-v125.js": {
    "previousSha256": "a2d11f762b1064be9b888e7d1e9502e161784be9f09012376b11426fe88b2032",
    "currentSha256": "88ab2fb9c476a8d07b1cecd961c9b7844833283406ea74b9fa1915401d534ca6"
  },
  "src/port-meridien-v90.js": {
    "previousSha256": "85b74e81e8ba87b66cedaf7fd36a12ebf8d7c1bd40c4a25ab7e5f9d91fc86778",
    "currentSha256": "897e2d837cc512a24cb9093374a915cd1b0e6ab1d9f06336a9c5d7e7bd229c41"
  },
  "src/refuge-v87.css": {
    "previousSha256": "fce1e18a977737d258969dac8bed077c9a65b58857e3e916248bd5c835e01751",
    "currentSha256": "af34f1b5237ad0103e2abf9707030eb65293ae2deb08853f6bc20ad258ee6f7d"
  },
  "src/save.js": {
    "previousSha256": "977662049f595d83c4fb51a3516d80481ebbd37567a96d3a46f62e557ca177a8",
    "currentSha256": "711bc839d8f57c6390c6d5752ba82773bdd36f9e8743ea16a623115ec593a4e2"
  },
  "src/ship-port-room-v87.js": {
    "previousSha256": "43b45bcd8e73446e7544651ba4f2e5850e0d1b5158d544438df93dd637db504c",
    "currentSha256": "0842577ad1707e108a5c0bb7ccd2eb93283d5d7c5fce208a54f836560c736498"
  },
  "src/ship-port-v87.css": {
    "previousSha256": "280b758be54bcb9433fb8353dc73b6bb047b79ce9f1210c47e5bde05ec9f29b9",
    "currentSha256": "45bf14ef6d7ef549d4b88b732d199f85c05f2524dc34ae67e7617c88361971fa"
  },
  "src/special-operations-v131.js": {
    "previousSha256": "4595ded20b4c7c44a7942039ca3ed8d12bba9f20a44a622ff840caca7a0e4bb5",
    "currentSha256": "433ddc7b821c98b973c10fc9e3aa39bc66c77e8cf9364dd9f1a25d03b70b08af"
  },
  "src/special-operations-v67.js": {
    "previousSha256": "3a6760b8d8629764ce078263a0538a95bcfa90fe23a63ec3df9b62e358afd0f2",
    "currentSha256": "28a8ff555e69859ec9e3445c05aa2544ff262132d910a0856ed1792c8ca4b11f"
  },
  "src/vertical-world-v130.js": {
    "previousSha256": "9ba42f3fe1658abd5487eb6702744211faccbeec2ad6f1a8a65029cacb5ce641",
    "currentSha256": "613fda47d3edf9cc42770671542f6755511dcc77efac7e8bdcdd0efa2e317222"
  },
  "src/weapon-actions-v131.js": {
    "previousSha256": "4ff367efb3c919ba51fcb5595f119d54f462a3453dbd95ca1d6c40110f44172a",
    "currentSha256": "58a11d9f471f1049e3db691f86581410ef1edbc603016bedf50427201e8f1b2a"
  },
  "src/weapon-magazine-recovery-runtime-v168.js": {
    "previousSha256": "73eb796bf6d9159239e8a8c499bc8b73db9975a69016df5b7d9ef2d2d4eccf13",
    "currentSha256": "8fb77f86e0f5a3f02ec756ad659fe86347927bb8c2de1d54798e04f71453dcdd"
  },
  "styles.css": {
    "previousSha256": "5d7f49517ea4377aaf2847e7ef5f5dd5f6e4b015301e1280072d41fd9edab36c",
    "currentSha256": "21f254351e30dd23c320bee7ecb29781496549fcc9df3c5ce42712ce4e678950"
  },
  "sw.js": {
    "previousSha256": "8352d786320ead53a5cdcbb8582ee1d1d2212798a0b92b006f07d912ac254cec",
    "currentSha256": "ca04653a5201d372ab43f4a38d60706817bcc9d5c4c43541d63d301331032103"
  },
  "title-screen-v61.css": {
    "previousSha256": "3a748b04d5e6c9a7e04c189b2c1910c3163a0840968be6bcbb6352e10e16369f",
    "currentSha256": "88fe408917883476acd0e645178319e231a53dbc4192d5d50d0af79a772be4fd"
  },
  "xeno-trials-fullscreen-v119.css": {
    "previousSha256": "a558da2c981d1a0be32e04b5204a23fec3941954e82658cc235372477b1550b6",
    "currentSha256": "bd5ef078de84720b02e7a08522b89fc11632aa606bef3eac5287a545a99c324a"
  },
  "xeno-trials-v96.css": {
    "previousSha256": "24344bdeced7e1602eab98a4df38e1d06ba92ef7d27f0a3a2a07f7dd0e4a027e",
    "currentSha256": "a1744d001fadd8a2ea3917b5c79cfcc3a4794987c0ef9e8310c23389b0acb15c"
  }
} });
// END TANTALUS JOIN RECEIPTS

export function reviewedXenoTrialsTantalusJoinV206(path, endpointV206) {
  if (!Object.hasOwn(XENO_TRIALS_TANTALUS_JOIN_V206.successors, path)) return endpointV206;
  const join = XENO_TRIALS_TANTALUS_JOIN_V206.successors[path];
  assert.equal(endpointV206, join.previousSha256, 'Broken fa2d62fe-to-tantalus-join source chain: ' + path);
  assert.ok(validHash(join.currentSha256), 'Invalid tantalus-join source digest: ' + path);
  assert.notEqual(join.currentSha256, join.previousSha256, 'A tantalus-join successor must identify changed bytes: ' + path);
  return join.currentSha256;
}

// Terminal runtime view: every runtime endpoint the V205 view publishes at fa2d62fe
// advances to its reviewed merged bytes; any other value is rejected.
export function xenoTrialsTantalusJoinRuntimeSourcesV206(view) {
  const result = { ...view };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_TANTALUS_JOIN_V206.successors)) {
    if (!Object.hasOwn(result, path)) continue;
    if (result[path] === receipt.previousSha256) result[path] = receipt.currentSha256;
    else assert.equal(result[path], receipt.currentSha256, 'Incorrect tantalus-join runtime view predecessor: ' + path);
  }
  return Object.freeze(result);
}

export function reviewedXenoProductionAssetsDigestV206(path, endpointV205) {
  if (!Object.hasOwn(XENO_PRODUCTION_ASSETS_SUCCESSORS_V206, path)) return reviewedXenoTrialsTantalusJoinV206(path, endpointV205);
  const receipt = XENO_PRODUCTION_ASSETS_SUCCESSORS_V206[path];
  assert.equal(endpointV205, receipt.previousSha256, 'Incorrect V205 endpoint for V206: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V206 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V206 successor: ' + path);
  return reviewedXenoTrialsTantalusJoinV206(path, receipt.currentSha256);
}

export function verifyXenoTrialsTantalusJoinV206(readSource = readRepository) {
  const join = XENO_TRIALS_TANTALUS_JOIN_V206;
  assert.match(join.baseline, /^[a-f0-9]{40}$/, 'The Tantalus join needs its exact fa2d62fe baseline');
  assert.equal(Object.hasOwn(join.successors, 'scripts/audit-xeno-production-assets-v206.mjs'), false, 'The join cannot admit its own bytes');
  for (const [path, receipt] of Object.entries(join.successors)) {
    assert.ok(safePath(path), 'Invalid tantalus-join source path: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
    assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256));
    assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'A tantalus-join successor must identify changed bytes: ' + path);
    assert.equal(sha(readSource(path)), receipt.currentSha256, 'Unreviewed tantalus-join source bytes: ' + path);
  }
  return Object.freeze({ baselineCommit: join.baseline, successors: Object.keys(join.successors).length });
}

export function verifyXenoProductionAssetsV206(readSource = readRepository) {
  assert.match(XENO_PRODUCTION_ASSETS_BASELINE_V206, /^[a-f0-9]{40}$/, 'V206 requires the published V205 commit');
  const successors = Object.entries(XENO_PRODUCTION_ASSETS_SUCCESSORS_V206);
  const inputs = Object.entries(XENO_PRODUCTION_ASSETS_NEW_INPUTS_V206);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V206 inputs await final source freeze');
  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V206 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-production-assets-v206.mjs'), 'V206 cannot admit its own bytes');
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V206 source path or kind: ' + path);
    assert.ok(!path.startsWith('src/') && path !== 'sw.js', 'V206 production art cannot change runtime: ' + path);
    assert.ok(!mutableReports.has(path), 'V206 results report is not an immutable input');
    if (receipt.kind === 'production-asset')
      assert.match(path, /^assets\/openai\/xeno-trials-v206\/characters\/[a-z0-9-]+\.png$/, 'Invalid V206 production image path');
  }
  for (const [path, receipt] of successors) {
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedXenoProductionAssetsDigestV206(path, receipt.previousSha256),
      'Unreviewed V206 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.ok(validHash(receipt.sha256), 'Invalid V206 input digest: ' + path);
    assert.equal(sha(readSource(path)), reviewedXenoTrialsTantalusJoinV206(path, receipt.sha256), 'Unreviewed V206 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_PRODUCTION_ASSETS_HISTORICAL_DECLARATIONS_V206)) {
    const source = readSource(path).toString(), start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V205 declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V205 declarations changed: ' + path);
  }
  verifyXenoTrialsTantalusJoinV206(readSource);
  return Object.freeze({ baselineCommit: XENO_PRODUCTION_ASSETS_BASELINE_V206, successors: successors.length,
    addedInputs: inputs.length, runtimeChanges: 0, historicalResultsTransferred: false });
}
