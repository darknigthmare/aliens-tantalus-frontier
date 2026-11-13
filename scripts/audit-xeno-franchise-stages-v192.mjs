/** Exact 0e98438 V191 -> V192 franchise-stage continuation.
 * Historical receipts remain immutable. This audit admits only named source
 * bytes; QA results, publication and canonical fidelity are never inherited.
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safe = path => typeof path === 'string' && /^[a-zA-Z0-9._/-]+$/.test(path) && !path.startsWith('/') && !path.split('/').some(part => part === '..' || !part);

export const FRANCHISE_STAGES_BASELINE_V192 = '0e9843808823a9ce9da73e5b2effeefa1ee51f26';
export const FRANCHISE_STAGES_HISTORICAL_DECLARATIONS_V192 = freeze({
  "scripts/audit-xeno-arbiter-protocols-v191.mjs": {
    "start": "export const ARBITER_PROTOCOLS_BASELINE_V191",
    "end": "\n/** Strict predecessor transition:",
    "sha256": "341e969f8d67518182edfdb3b5e3524bfac3be939c746f12ed94742b7164aa71"
  },
  "scripts/audit-xeno-arbiter-campaign-v190.mjs": {
    "start": "export const ARBITER_CAMPAIGN_BASELINE_V190",
    "end": "\n/** Strict predecessor transition:",
    "sha256": "fc8f19b49db898cc88c6a1069cbd1da92f04d1e1823919611c75b50e07607009"
  },
  "scripts/audit-xeno-animation-audio-v189.mjs": {
    "start": "export const ANIMATION_AUDIO_BASELINE_V189",
    "end": "\n/** A current digest",
    "sha256": "61916ef2e1a08e854525103e4abb41970730e6d3d111966c1c6cbaf71b562a44"
  },
  "scripts/audit-xeno-stage-operations-v188.mjs": {
    "start": "export const STAGE_OPERATIONS_BASELINE_V188",
    "end": "\nexport function reviewedStageOperationsDigestV188",
    "sha256": "877b259c841594d4a0cddca47c8977d389bf6c68816951dcbe95389bd49708e4"
  },
  "scripts/audit-native-qa-resources-v187.mjs": {
    "start": "export const NATIVE_QA_RESOURCES_BASELINE_V187",
    "end": "\nexport function reviewedNativeQaResourcesDigestV187",
    "sha256": "a1704b9d7c8381aec02750c5be09ae47f416bf51c4d1635952c1bdb2eaa3de5f"
  },
  "scripts/audit-xeno-trials-completion-v186.mjs": {
    "start": "export const COMPLETION_BASELINES_V186",
    "end": "\nexport function reviewedCompletionDigestV186",
    "sha256": "9c864a391884bd01ec0c4091515d10a7ed6eaf88b93281c0bfec94caabff0495"
  }
});

// Exact data preservation, not fifty played scenarios or a fidelity verdict.
export const FRANCHISE_STAGES_LEGACY_CATALOG_V192 = freeze({
  "count": 50,
  "canonicalSha256": "ee90bcdd3a3688703c68c2e9985da67efa6783210d04f6a8e8c9862985a55f1d",
  "stageIds": [
    "containment-deck",
    "reactor-ring",
    "hive-vault",
    "tantalus-bridge",
    "tantalus-cargo",
    "planet-surface",
    "xt179-ship-habitation",
    "xt179-ship-extraction",
    "xt179-ship-engineering",
    "xt179-ship-docking",
    "xt179-planet-surface",
    "xt179-planet-ruins",
    "xt179-planet-ridge",
    "xt179-planet-evac",
    "xt179-planet-caves",
    "xt179-planet-approach",
    "xt179-colony-utility",
    "xt179-colony-security",
    "xt179-colony-landing",
    "xt179-colony-habitat",
    "xt179-colony-civic",
    "xt179-colony-approach",
    "xt179-workshop",
    "xt179-vehicle-bay",
    "xt179-quarantine",
    "xt179-armory",
    "xt179-quarters",
    "xt179-mess",
    "xt179-medical",
    "xt179-laboratory",
    "xt179-sensors",
    "xt179-reactor",
    "xt179-life-support",
    "xt179-hangar",
    "xt179-cryo",
    "xt179-cic",
    "xt179-briefing",
    "xt179-bridge",
    "xt179-synthetic-bay",
    "xt179-proving-ground",
    "xt179-morgue",
    "xt179-archives",
    "xt179-logistics",
    "xt179-escape-pods",
    "xt179-arrival",
    "xt179-bioforge",
    "xt190-adjudication-vault",
    "xt190-specimen-transfer",
    "xt190-executive-gallery",
    "xt190-evidence-stack"
  ]
});

// Populated only after the implementation and its targeted evidence are frozen.
export const FRANCHISE_STAGES_SUCCESSORS_V192 = freeze({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "c60ed60d2a048704a901e7290ddfd082bab01cd71485a278b6473be9a8e700af",
    "currentSha256": "9d752c871f793cce13f8172bbd8ef9fefc9840dd250e4fc373f7af527c983751"
  },
  "scripts/audit-xeno-arbiter-protocols-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "7d8873ccc8c666ce8a01f72c0967e6f21a72bee6d064c679b891477f03247069",
    "currentSha256": "ea6befe6c95bb11f718fc9045eb55ec39d3083992d038b759bac130f554260aa"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "96bc04b1eed9e0f0ac18cb69112008ab9ff3350dc41778afcd88d49e3ddd3ca8",
    "currentSha256": "dc1c7e4eadc4cc343df32c4d8249ab5fe3da75badd3affdca6fe90ff65f93bc7"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "6c5b65f0e1a8e65cd151df461cc40ffe9526f34c0376bcf9910b85de839de767",
    "currentSha256": "2d66a6b22bf32c2ab59e36beae620f7d0b9de4fcedf7719ec1f802a4a3875ee7"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "73a263e0656907ed2e459d6b61a05f7b0b5802f63e805b3f403471da50e9c361",
    "currentSha256": "21aa4ac22bc8b224381ede6e72268756da9a52eb88a1948769bc9e0a85c1972b"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "b30146ae437a0a9ae1b15aed2ec7a3657d361cefbedb832e5ec95f3db6a02c66",
    "currentSha256": "a5edb3a05c4ad9c7d4f5c5f46b4b8b949936833e2c3f2cf46934149750cd9cf9"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "fcec08eee653444e96f968e24de33035b0cd52640bf3a9e756d654e2aa39be4a",
    "currentSha256": "6217e92e0f7835020f29c83ff84b5d94f60fa6bfa36aabf6dae369cfe6f9cf18"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "7a83130099372e425e42761c77e2f295f6f388e1d781973c765f84f92e005b2e",
    "currentSha256": "a6725a4c34488ce5667bc60fb7bab5d368b443e3fb1c5649faa6eb17acda4221"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "6941383c478b14a782cee9fd8dbd864d79795c7c3d53d7be5fead381889f1211",
    "currentSha256": "c77c9e0cc36555124659654b1d67b1f396a4f1f71ef49c87e204143c784aa826"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "838ced11831ead152798cacd5549c8b8ad462802fa5c26035796d6d2033ae396",
    "currentSha256": "dabd9aed91290e2ac69a591f57228bf82f73fbbb5dda8a6e93e078dcba84158b"
  },
  "scripts/verify-xeno-arbiter-i18n-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "45982e64b82f3bdc5125f68de11bea0ccbb3f71406112a0c9cfd2c9217cb80cb",
    "currentSha256": "82f70d17fa5b4fd08f8b78392ff49649ea9b72cd057c0a8bd845540ce2a8d20c"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "21e954ba7fd606628b3c7b58ed9f10166f1e992f4d1adc7ad700114e9cceba5a",
    "currentSha256": "0d1f45ce351f74d587b6026e3af85bdb03fbf24a3c279d83976d04f46e64ad12"
  },
  "scripts/verify-xeno-arbiter-protocols-i18n-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "3fc78af64421321eb89930abeed002a1de865a10811b8a807ff09f5cb1732f4c",
    "currentSha256": "60657d043c9332bb0853a8c781ebc86e7e681b3325937d6661952711bab29125"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "3a70875bb7b76ab058b918b742df811f993b36920152c926696969936f446f50",
    "currentSha256": "622af86524bd09255bd4c6c1d6e071cfb27283eb42d4003a73c544254ae1e4fe"
  },
  "scripts/verify-xeno-trials-animation-audio-i18n-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "53775aa7f5f177fc809bb748b185500ec0f1a8cdb152da85f485cc92b84459a5",
    "currentSha256": "ba529cf66760f865a60d4dffb4b471fd06fcacb1682c3eb9e24272ec9576f65d"
  },
  "scripts/verify-xeno-trials-animation-coverage-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "befbe652eb7c69f6f6a090be71a0f2a68f6ccd4b7eb9562d76ac2fe4b65db77e",
    "currentSha256": "cc7804417b2989e4721f017ae41774771c797f80413fb555a270d405c3c44114"
  },
  "scripts/verify-xeno-trials-boss-stages-v179.mjs": {
    "kind": "verifier",
    "previousSha256": "f258d4932ef9a7b2dc6b995f61b0f7e6e200f902353a010ad133e4e3b657ad0a",
    "currentSha256": "d45e282b46037d9320f4166fb05fddf323f74077791ff7eb5ba81c77183c4c8c"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "03bb0eca2693ab9d926446183789693bc328fb463cce7484db61caaa8f55e221",
    "currentSha256": "938fec182d1b0f87ebe414c5cfc21df3f2e401738fc768105ff194093c474713"
  },
  "scripts/verify-xeno-trials-feedback-v149.mjs": {
    "kind": "verifier",
    "previousSha256": "131a937e71959d4ca1342d5c690897a6d4eec7bf75e543871fee8686464df7fa",
    "currentSha256": "2cc60dbd099da623eac050029484ba4cae97b6e921e624a5dccee00fd9d27f50"
  },
  "scripts/verify-xeno-trials-i18n-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "fab987012b49e1601618731373500670b3dc9401ff19cdfa9ca42bfa56079af4",
    "currentSha256": "2c330325962fb53ae5f36670b45f2f6e712c6047faafabc53fb9b519c2702861"
  },
  "scripts/verify-xeno-trials-operation-i18n-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "8bbfa16a6713becc20e2135b7b5700760eadb23bad669c09d083ca98281f18b3",
    "currentSha256": "a0dacda1a8b954e574cf4396c220ee4e891ebea10fd5972fcc261ae0abea5f76"
  },
  "scripts/verify-xeno-trials-signatures-v147.mjs": {
    "kind": "verifier",
    "previousSha256": "abaf985401d0c9aac0abecb21ef56d2833d0af943d9f0266e5f6a8b58026f35a",
    "currentSha256": "cc07ea22c0520bbd88cf1a0319cdbd8b6d41f83166e7790764e013293543cf7e"
  },
  "scripts/verify-xeno-trials-stage-scenes-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "28b501874e8359d1caebeaa461e317d590aea7c10d56263e824e042c2840f56b",
    "currentSha256": "eecca29ffe85b7cc09fb3cf24faffd40f803cd97839b7b9a0dc03b77de4a794a"
  },
  "src/i18n-en-catalog-v185.js": {
    "kind": "runtime",
    "previousSha256": "38e16b8671fe14d85f04248fb8d31c27f408cf42dae7f43498e22f49a68ee20d",
    "currentSha256": "67d75b265b97eba14e2aa52b353bb3c6987bb9764a9d17d101b373a21e899a52"
  },
  "src/xeno-trials-data-v96.js": {
    "kind": "runtime",
    "previousSha256": "739847452dd808d3bcef3e36b60c2e723acff64c5d523ec7059e94ffac335a18",
    "currentSha256": "b47b1003093ab9bc8ead8df1f54426e1b7afa134affa2c3da5a5b251cf5a1679"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "287a7f3fb9f50eb743d19d98c14e446cb6e23f70d31007ec52144b2a9927dd35",
    "currentSha256": "ea3d2105ed4d6a0e4f39fd8defe10799048cc667a602f30271c2a3c0a9a0cde4"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "eaad814a05e343e08123ac82920412277ef59c33a9b535fda64f83c0356c5898",
    "currentSha256": "bfc51c36e372ef2e7eaa1d45970eef30b6bb15f213281d90b660e21afab08d2d"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "330dd2e96225fc60d21f40ca276193a76274377087766c1e63dff10f369d05d5",
    "currentSha256": "d75d4b20999a793aa87993922e32d109759d3dba3e7a500d50f3d829068fcb84"
  },
  "xeno-trials-v96.css": {
    "kind": "runtime",
    "previousSha256": "de84df4da6041632584aaf66cb7547a59273dd9c67272b95a8936bd856a40b84",
    "currentSha256": "ddfe065daa5bb7eec0df45e3cd94c750944081f800092f6fa4f5ed1220ad23e3"
  }
});
export const FRANCHISE_STAGES_NEW_INPUTS_V192 = freeze({
  "assets/openai/stages/xeno-trials-v192/games/bg386-freya-prospect.png": {
    "kind": "asset",
    "sha256": "8ac793a3913f423b1f6b0d31ff2928e3e258c2b8ba1de9d33958ace590bdfd96"
  },
  "assets/openai/stages/xeno-trials-v192/games/bg386-pyramid.png": {
    "kind": "asset",
    "sha256": "6160a9766970e9b5335b737dd6f34db9069f1034a730ee03871b17fa86eb1b65"
  },
  "assets/openai/stages/xeno-trials-v192/games/endeavor-hangar.png": {
    "kind": "asset",
    "sha256": "e9bfba3276e0ed09f749120c82a91130afe3eef7325dec77c85e411f017a7c08"
  },
  "assets/openai/stages/xeno-trials-v192/games/katanga-refinery.png": {
    "kind": "asset",
    "sha256": "95304ac474b397207ffbec6efd627fb6d2096babd15dd868111d6f57344d4bed"
  },
  "assets/openai/stages/xeno-trials-v192/games/lethe-berkleys-docks.png": {
    "kind": "asset",
    "sha256": "55ec6435783644a1676cbd3beadeec3d3d63b08612f72d3a854a7913e050b667"
  },
  "assets/openai/stages/xeno-trials-v192/games/lethe-dead-hills.png": {
    "kind": "asset",
    "sha256": "871ffcc7041091fe6da8d6719f2749da40f7b3e7ec5ce9db97291fd0343599cf"
  },
  "assets/openai/stages/xeno-trials-v192/games/lethe-pioneer-station.png": {
    "kind": "asset",
    "sha256": "29767429874a8bc548322968b4e5791e7159ca463ceb6b3beff22f7001a683bf"
  },
  "assets/openai/stages/xeno-trials-v192/games/lv1201-ancient-ruins.png": {
    "kind": "asset",
    "sha256": "089e4ab554fd8014fcd74dd47d369286737c9034e215b3cb734ee7d2a09d02d3"
  },
  "assets/openai/stages/xeno-trials-v192/games/lv1201-forward-facility.png": {
    "kind": "asset",
    "sha256": "576113bba6e7b512b2fb841a12381a213073b08a55110d6b0749d67f931ad598"
  },
  "assets/openai/stages/xeno-trials-v192/games/lv895-engineer-ruins.png": {
    "kind": "asset",
    "sha256": "da667028cd088ccfacde51ec69d3f68bc61aa1c0102c16a4b179355aea3ac65e"
  },
  "assets/openai/stages/xeno-trials-v192/games/otago-flight-deck.png": {
    "kind": "asset",
    "sha256": "b042c36b08974c1723542e5363c4258793126037901df3edfc778d06a9c29228"
  },
  "assets/openai/stages/xeno-trials-v192/games/purdan-zeta-colony.png": {
    "kind": "asset",
    "sha256": "d33134258f0e2759c1835e1b4bb3f83b8814ed9f6447a5d7e6805823b225f7eb"
  },
  "assets/openai/stages/xeno-trials-v192/games/sevastopol-lorenz-systech.png": {
    "kind": "asset",
    "sha256": "48e670315901e4f322ea6006bd5ab999848abd462ea01d6b01e2a6a6fb3a6872"
  },
  "assets/openai/stages/xeno-trials-v192/games/sevastopol-reactor-nest.png": {
    "kind": "asset",
    "sha256": "b6fed92716398be8c41e58bbac4ba2852fff9b770cea7e66e4c1cbb864b27ecf"
  },
  "assets/openai/stages/xeno-trials-v192/games/sevastopol-san-cristobal.png": {
    "kind": "asset",
    "sha256": "ec2998426de29eb887062ddd8b8c36f2c50b138fa3ca3f8b4ea12930de5cee0c"
  },
  "assets/openai/stages/xeno-trials-v192/print/ataegina-mountain-hold.png": {
    "kind": "asset",
    "sha256": "a7a8d0e248ec951c10a7cc9d8a39bf85166765eaf6da0f9f04a9b60844291370"
  },
  "assets/openai/stages/xeno-trials-v192/print/charon-rogue-lab.png": {
    "kind": "asset",
    "sha256": "21c93e6f9f0487d8224cf3a8e41d18026a50cfae87165640806295f8763c12b6"
  },
  "assets/openai/stages/xeno-trials-v192/print/charybdis-industrial.png": {
    "kind": "asset",
    "sha256": "3ddcc32166848597a1638ac856d9a9e5f84541a9948fe42ce29d98bb5b110a96"
  },
  "assets/openai/stages/xeno-trials-v192/print/cold-forge-containment.png": {
    "kind": "asset",
    "sha256": "c4205a0013038a0e53f866a09d8ef0e5d4d2ed73e4b492b7a16762c78d8c734f"
  },
  "assets/openai/stages/xeno-trials-v192/print/earth-war-city.png": {
    "kind": "asset",
    "sha256": "0b9eaa73e94c594f99554e77ac553485a8694aadbc41d117cd62df0d09ccfba4"
  },
  "assets/openai/stages/xeno-trials-v192/print/epsilon-station.png": {
    "kind": "asset",
    "sha256": "6addf6baae1d6d4c94464a949aad02fd3ff3c0054ceaade46ae5898046c3e7d9"
  },
  "assets/openai/stages/xeno-trials-v192/print/euryale-rainforest.png": {
    "kind": "asset",
    "sha256": "16df35ff70087c38ad054248560d8dbf47fa656e5d985d7500aad994dc83aae0"
  },
  "assets/openai/stages/xeno-trials-v192/print/innominata-labyrinth.png": {
    "kind": "asset",
    "sha256": "eff888fc1f07fc30d6bd4c1c65ee9b761ade346d26cdcf9951b9894e3431e1bb"
  },
  "assets/openai/stages/xeno-trials-v192/print/jericho-three-laboratory.png": {
    "kind": "asset",
    "sha256": "2872ed8059c2296f6cbd21a4d8324086273b02b59f62cb0e8e4caab4ce89540c"
  },
  "assets/openai/stages/xeno-trials-v192/print/lv178-trimonite-mine.png": {
    "kind": "asset",
    "sha256": "9c35260d1aff16991e1338ef2c1dd839ec42bd434152051de211f2de2d292ff7"
  },
  "assets/openai/stages/xeno-trials-v192/print/marion-engineering.png": {
    "kind": "asset",
    "sha256": "de2da77be656bccb6842e2471022f7bca35777ed97e4340ae82f31302593c099"
  },
  "assets/openai/stages/xeno-trials-v192/print/ryushi-prosperity-wells.png": {
    "kind": "asset",
    "sha256": "dc50d20a20f7ea7ded9b4bd9bde6dc5741862509d6201917a5f5378f520c6ee2"
  },
  "assets/openai/stages/xeno-trials-v192/print/sphacteria-dead-orbit.png": {
    "kind": "asset",
    "sha256": "e4c67cd99512c91541508f46ab651647999ac2474fc4522f141f0efc5d306d10"
  },
  "assets/openai/stages/xeno-trials-v192/print/tobler-nine-factory.png": {
    "kind": "asset",
    "sha256": "772bede44986215228268cc82b4b48d1979843d538f8fe13cd453d1fa5ded66b"
  },
  "assets/openai/stages/xeno-trials-v192/print/xenomorph-prime-genocide.png": {
    "kind": "asset",
    "sha256": "654d1aadf486ac3eb19e55e5b569256719573204590014fe178c90d779c6fe67"
  },
  "assets/openai/stages/xeno-trials-v192/screen/auriga-clone-laboratory.png": {
    "kind": "asset",
    "sha256": "b9680479935dc9005fa71ec1137eae227d5afee4e2befed58d3fc6a55c1b39a1"
  },
  "assets/openai/stages/xeno-trials-v192/screen/auriga-flooded-galley.png": {
    "kind": "asset",
    "sha256": "758e8402cab71da7e23c35a093a1e44b68e629f9c978c566ce13b6d8b8902385"
  },
  "assets/openai/stages/xeno-trials-v192/screen/fury161-leadworks.png": {
    "kind": "asset",
    "sha256": "d6c9c60e7d35f8b83d56cfb97aa1cca8551ba6eb78b8763ce449b3b59bacec9f"
  },
  "assets/openai/stages/xeno-trials-v192/screen/hadleys-hope-street.png": {
    "kind": "asset",
    "sha256": "4431eca04ed21483153a214384cae8ef8d707073d25879150e77c8aaa56427ed"
  },
  "assets/openai/stages/xeno-trials-v192/screen/jacksons-star-street.png": {
    "kind": "asset",
    "sha256": "803460306f67f4405eafb021b39961fcf49c7c59ef1df12dd321710bc70cff96"
  },
  "assets/openai/stages/xeno-trials-v192/screen/lv223-ampule-chamber.png": {
    "kind": "asset",
    "sha256": "7cdb16f4a981b396f7cf18fa0b948d7e94c8a96187a53b3d0b5eba66d301a481"
  },
  "assets/openai/stages/xeno-trials-v192/screen/lv223-orrery.png": {
    "kind": "asset",
    "sha256": "0b6dbec645368452cc1be1bef4756bb43214d54a36e7f1a795b2d8d8f1fca0e4"
  },
  "assets/openai/stages/xeno-trials-v192/screen/lv426-atmosphere-hive.png": {
    "kind": "asset",
    "sha256": "e0fc3bf9a40957f1197217e9e1b59a34b450114a085839d365fbcc91a6ea4d42"
  },
  "assets/openai/stages/xeno-trials-v192/screen/lv426-derelict-pilot.png": {
    "kind": "asset",
    "sha256": "705b9e2472f28ed42aaaaa4d9e6f5f6fa7e62bfdf4966f20305ded20acb5da81"
  },
  "assets/openai/stages/xeno-trials-v192/screen/maginot-bridge.png": {
    "kind": "asset",
    "sha256": "8319297a331349cae2f6f7fef462abd3a786b946f146764e0482bd885e47cedf"
  },
  "assets/openai/stages/xeno-trials-v192/screen/maginot-specimen-hold.png": {
    "kind": "asset",
    "sha256": "b83b5416ccb2cc4e42af6facf98070bf8bce628cdce0ac72868403cc10713ff0"
  },
  "assets/openai/stages/xeno-trials-v192/screen/neverland-jungle.png": {
    "kind": "asset",
    "sha256": "2c07b4ea6dfba35ee66dabb007e2c7bde255a1b84ca3a6b9201d8963ea6a4969"
  },
  "assets/openai/stages/xeno-trials-v192/screen/neverland-laboratory.png": {
    "kind": "asset",
    "sha256": "47e6ce18d3ca9a636a5fd02d254f4aa288d10a1037d00a9f73138d0b78f9f875"
  },
  "assets/openai/stages/xeno-trials-v192/screen/new-siam-crash-site.png": {
    "kind": "asset",
    "sha256": "9b9aaaf4481f797e06be2924a3ce3a75160ab34dea4477f9e05ecc8c86006d00"
  },
  "assets/openai/stages/xeno-trials-v192/screen/nostromo-chain-room.png": {
    "kind": "asset",
    "sha256": "8a1c04badcb4b20c924a32025101a3d130446316a190d3a578beae3daba27f86"
  },
  "assets/openai/stages/xeno-trials-v192/screen/nostromo-galley.png": {
    "kind": "asset",
    "sha256": "d1d961a054985a9e9830c73af857a3082c2eb82367872786fb225b0d4c6d1bb3"
  },
  "assets/openai/stages/xeno-trials-v192/screen/planet4-necropolis.png": {
    "kind": "asset",
    "sha256": "1f4bd26439489f98e509f4608af6a0ed7050ddbd5e18f86412bd4ffb5a6d7cf8"
  },
  "assets/openai/stages/xeno-trials-v192/screen/planet4-wheat-field.png": {
    "kind": "asset",
    "sha256": "3f2723ac5b1c96850957df286dbb4c538ee5d0de759cb8d65affad1695610574"
  },
  "assets/openai/stages/xeno-trials-v192/screen/renaissance-cryo-chamber.png": {
    "kind": "asset",
    "sha256": "dad60b863259de4be1304ffefb9ddfae1d557d8b1a9cb7e889636d1070612c64"
  },
  "assets/openai/stages/xeno-trials-v192/screen/sulaco-hangar.png": {
    "kind": "asset",
    "sha256": "b5d17af2f6afd453fa3693c26edcc7e5f09af48040274982f18f42037cd79261"
  },
  "docs/forge/xeno-trials/franchise-stage-art-production-v192.json": {
    "kind": "document-input",
    "sha256": "110b63a603be72d1a23593841dc105b5e9a7ab99b87543327addde2a23deba59"
  },
  "docs/forge/xeno-trials/franchise-stage-sources-v192.json": {
    "kind": "document-input",
    "sha256": "39fcb2a0201fe1a804eb338ed752257b044436d9acd40ecaa64038be38bd4dd8"
  },
  "docs/forge/xeno-trials/i18n-franchise-stages-review-v192.json": {
    "kind": "document-input",
    "sha256": "500d1112c6ca90fc20df1a1c5fc7d3c718285fad34d9c17f88329bbb2f4dd13e"
  },
  "scripts/public-xeno-franchise-stage-admissions-v192.mjs": {
    "kind": "verifier",
    "sha256": "2fac8b33c0faa74a238daf49d35fd01e6d67bf6be7367879bc87d71690c1b783"
  },
  "scripts/qa-xeno-trials-franchise-stages-v192.py": {
    "kind": "verifier",
    "sha256": "86997dd8d6c4c8b1c14e8ae2b2e597a9f9948f8371a1dff247e15ea08f92ee73"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "sha256": "d3749114bfa94a2b06b79dad73b214f5d0a6f7b3b0a593205c51f551d93d1e76"
  },
  "scripts/verify-xeno-trials-franchise-stage-render-v192.mjs": {
    "kind": "verifier",
    "sha256": "6a9534f625dbe088eb97942031bb11b0ec1557fa6ac065cd2424b235152b608b"
  },
  "scripts/verify-xeno-trials-franchise-stage-ui-v192.mjs": {
    "kind": "verifier",
    "sha256": "e87741d4510d3acaad78cb9df8194f56a4da9d9f1755f9ee8abf0c03defe932a"
  },
  "scripts/verify-xeno-trials-franchise-stages-v192.mjs": {
    "kind": "verifier",
    "sha256": "03175d6248c93ff9bb496c2880a3138e7a6c52af89e86d2f8510381b29a784ca"
  },
  "src/xeno-trials-franchise-stage-render-v192.js": {
    "kind": "runtime",
    "sha256": "af337193ed34e7bddc1a2724be1f8b23c752ab580f30990d5abab0e8c781fb64"
  },
  "src/xeno-trials-franchise-stage-scenes-v192.js": {
    "kind": "runtime",
    "sha256": "a84c257a126065850a24a15ad6cefceaee324d0e310e114695f8453b0e11cdb4"
  },
  "src/xeno-trials-franchise-stages-v192.js": {
    "kind": "runtime",
    "sha256": "7d90f7f1d9fe0733cdbf000593feb4c79d674f0c4daa5d106d8b69144f94cd29"
  }
});
export const FRANCHISE_STAGES_PRESERVED_PLATES_V192 = freeze({
  "assets/openai/sprites/static-enemy-v92/game_avp_capcom_smasher.png": "0efaa9b6afe6f817567725d7aae0b57c15093d1f68a8e480bb34ede566c7dee8",
  "assets/openai/sprites/static-enemy-v93/game_avp_capcom_chrysalis.png": "616aeca6329e615cd42be6324d50de450d22b62d8950c7891acaf56e4a70abb7",
  "assets/openai/sprites/static-enemy-v95/ref-56-xeno-defender.png": "729a6d131424591995e8f948f9f0e6059fe0a82397a5c54f28d1269a0b46cb83",
  "assets/openai/sprites/static-enemy-v95/xeno-brute.png": "c093b0f9bf4ab5b6fa79de9f5787d2552957d1959670c639054c1c01875fca13",
  "assets/user/castes-v87/film_queen_aliens_1986.png": "985abf27db63400d8a6a68101bfaa7dde3335da0e8986ea85c409ab30da5e991",
  "assets/user/castes-v87/film_runner_alien3_1992.png": "f117c7ad0e6da9a02d3a4ce315066d75acfd67a909620f560ff6cd8c3d7b64b3",
  "assets/user/castes-v87/film_warrior_aliens_1986.png": "c791a14045116531425d270c3edd61384b063d82a0bddf4e23195e9397ecb65f",
  "assets/user/castes-v87/game_acm_crusher.png": "eca7855c29455b87bf9fc4e26afe2ab07adbd3ff4afa2c5ffb36dc6b4ebc2baa",
  "assets/user/castes-v87/game_acm_spitter.png": "c281ad7c020999e2796af1c904be45c028bd8643e45bfc45b93edaf5ba4642c7",
  "assets/user/castes-v87/game_afe_burster.png": "b2db2418502099d9f2551434cf207ef72fe0a09dc68914fbc85e18705720ce13",
  "assets/user/castes-v87/game_afe_prowler.png": "48edd1af2710048a065433b9e2c8dc20a03b05bc0a46a47394704f3a0c8bd544",
  "assets/user/castes-v87/game_avp_extinction_ravager.png": "7e2d1e236ef7de411c5458aee40520951c2c6dec2dc932a21164eea087738cbe"
});

/** Strict predecessor transition: current or observed digests are never proofs. */
export function reviewedFranchiseStagesDigestV192(path, endpointV191) {
  const receipt = FRANCHISE_STAGES_SUCCESSORS_V192[path];
  if (!receipt) return endpointV191;
  assert.equal(endpointV191, receipt.previousSha256, 'Incorrect V191 endpoint for V192: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V192 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V192 successor: ' + path);
  return receipt.currentSha256;
}

/** Called after physical verification; retains the historical caller's object. */
export function franchiseStagesRuntimeSourcesV192(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(FRANCHISE_STAGES_SUCCESSORS_V192)) if (receipt.kind === 'runtime') {
    if (result[path] !== undefined && result[path] !== receipt.currentSha256)
      assert.equal(result[path], receipt.previousSha256, 'Incorrect V192 runtime view predecessor: ' + path);
    result[path] = receipt.currentSha256;
  }
  for (const [path, receipt] of Object.entries(FRANCHISE_STAGES_NEW_INPUTS_V192))
    if (receipt.kind === 'runtime') result[path] = receipt.sha256;
  return Object.freeze(result);
}

export function verifyFranchiseStagesV192(readSource = readRepository) {
  assert.ok(Object.keys(FRANCHISE_STAGES_SUCCESSORS_V192).length > 0, 'V192 successors await final source freeze');
  assert.ok(Object.keys(FRANCHISE_STAGES_NEW_INPUTS_V192).length > 0, 'V192 added inputs await final source freeze');
  const paths = [], kinds = ['runtime', 'verifier', 'asset', 'configuration', 'document-input'];
  for (const [path, receipt] of Object.entries(FRANCHISE_STAGES_SUCCESSORS_V192)) {
    assert.ok(safe(path), 'Unsafe V192 successor path: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.ok(kinds.includes(receipt.kind)); paths.push(path);
    assert.equal(sha(readSource(path)), reviewedFranchiseStagesDigestV192(path, receipt.previousSha256), 'Unreviewed V192 successor bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(FRANCHISE_STAGES_NEW_INPUTS_V192)) {
    assert.ok(safe(path), 'Unsafe V192 added-input path: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.ok(kinds.includes(receipt.kind) && validHash(receipt.sha256)); paths.push(path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V192 added-input bytes: ' + path);
  }
  for (const [path, digest] of Object.entries(FRANCHISE_STAGES_PRESERVED_PLATES_V192)) {
    assert.ok(safe(path) && validHash(digest)); paths.push(path);
    assert.equal(sha(readSource(path)), digest, 'Historical source plate changed: ' + path);
  }
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V192 source admission');
  assert.equal(paths.includes('scripts/audit-xeno-franchise-stages-v192.mjs'), false, 'V192 cannot admit its own bytes');
  for (const [path, receipt] of Object.entries(FRANCHISE_STAGES_HISTORICAL_DECLARATIONS_V192)) {
    const text = readSource(path).toString(), start = text.indexOf(receipt.start), end = text.indexOf(receipt.end);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(text.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  return Object.freeze({ baselineCommit: FRANCHISE_STAGES_BASELINE_V192,
    successors: Object.keys(FRANCHISE_STAGES_SUCCESSORS_V192).length,
    addedInputs: Object.keys(FRANCHISE_STAGES_NEW_INPUTS_V192).length,
    preservedPlates: Object.keys(FRANCHISE_STAGES_PRESERVED_PLATES_V192).length,
    historicalResultsTransferred: false });
}
