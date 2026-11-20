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

export function reviewedXenoProductionAssetsDigestV206(path, endpointV205) {
  if (!Object.hasOwn(XENO_PRODUCTION_ASSETS_SUCCESSORS_V206, path)) return endpointV205;
  const receipt = XENO_PRODUCTION_ASSETS_SUCCESSORS_V206[path];
  assert.equal(endpointV205, receipt.previousSha256, 'Incorrect V205 endpoint for V206: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V206 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V206 successor: ' + path);
  return receipt.currentSha256;
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
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V206 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_PRODUCTION_ASSETS_HISTORICAL_DECLARATIONS_V206)) {
    const source = readSource(path).toString(), start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V205 declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V205 declarations changed: ' + path);
  }
  return Object.freeze({ baselineCommit: XENO_PRODUCTION_ASSETS_BASELINE_V206, successors: successors.length,
    addedInputs: inputs.length, runtimeChanges: 0, historicalResultsTransferred: false });
}
