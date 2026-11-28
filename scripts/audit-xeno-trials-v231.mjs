import { reviewedXenoTrialsDigestV232, xenoTrialsRuntimeSourcesV232, verifyXenoTrialsV232 } from './audit-xeno-trials-v232.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V231 = '012fc8237fef4dbc81c9649719db1fe2fdc3e08e';
export const XENO_TRIALS_DECLARATIONS_V231 = freeze({
  "scripts/audit-xeno-trials-v230.mjs": {
    "start": "export const XENO_TRIALS_BASELINE_V230",
    "end": "\nexport function reviewedXenoTrialsDigestV230",
    "sha256": "da9c830efa2e75649b41876663432c502fc097f0733d2fba8f444f065a0a6814"
  }
});
export const XENO_TRIALS_SUCCESSORS_V231 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "0b3d838e4c9f67242327bdc879115aea7b1fe3e54d1ab095c3319f14234f0b18",
    "previousSha256": "abd2978dd48e668de4864c222deab1c2e190f0c8c24fb20ee6b75dec16e91453"
  },
  "scripts/audit-xeno-trials-v230.mjs": {
    "kind": "tooling",
    "sha256": "9858887fcd7dc33854e28c769c307d0ed7e3bf6f0a96a444f674f4562064b6b8",
    "previousSha256": "a800e994deb7dd861ff3f639abcf208eeedd544fcfc3373e46bcde06bb30c55b"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "f7043ac6b2f0a30bd12323b0e382018624ba47f12b2a95b9b02267d35b52f76a",
    "previousSha256": "e31f8a8bde4617fadf8dce67503217503e63ad3ad5a0976231cdf21361ebb124"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "ca155e5eca39b52a8597acd9d060e879281db1e425ba27db1b665bc103f5d04e",
    "previousSha256": "ffa6adb6408345d0e7457cf8e4e5203f6e3d7ec14b685a66b9f31712f522fa23"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "2243b7306a206ba74b4b3e07b6ef7150dd2e4c0b47bdde8537f18ae70d273586",
    "previousSha256": "62b298004bbf052d06cfdfe04d5e87a68613baae31fc33c8c65ba2a29b97b0d0"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "9a94e19f9aede70fd51d48b8a78f47e0263b05fccaa8382f4aa6ac902f9564c3",
    "previousSha256": "e81f4dbfd338c0139bab98267ecd789ea7fd26b6058556ec58ce16b5769acba9"
  },
  "scripts/verify-xeno-trials-grapple-v153.mjs": {
    "kind": "tooling",
    "sha256": "60cae55269c20132c4c01f6aa6b9589bf4b36d02e80f6a6853d1262313edd341",
    "previousSha256": "fe2ddc1a71b91be9c40096d7b7d258ac99bc6717e972e90ee5f98aafa2066fdf"
  },
  "scripts/verify-xeno-trials-research-v210.mjs": {
    "kind": "tooling",
    "sha256": "04cd1775e7fdfb0e347527a789ef47f0cfbdaed89ecc3a1531c27580edbca174",
    "previousSha256": "1c4911f24b78ca0ad1d20285a4b26b8c18ceee0d334d4aeaab492f9bbc2a09a5"
  },
  "scripts/verify-xeno-trials-super-kits-v209.mjs": {
    "kind": "tooling",
    "sha256": "7f688372fc955de8cfc4ffdada880cdcdab914466c6012bbd2178df107bc05da",
    "previousSha256": "2b0394dc8f24525717fca618d00ac3287318b2a75193ded7539690092073a425"
  },
  "scripts/verify-xeno-trials-super-kits-v210.mjs": {
    "kind": "tooling",
    "sha256": "a4aeb17299936f09f1830f1d9eef304fc4e8be3f97a0376fcd70d230e8d1ddee",
    "previousSha256": "84a6fc5ef5da02b9e87118b5c3e3155f6b93004cf6c6ebb78b262d53b7c3026a"
  },
  "scripts/verify-xeno-trials-supers-v148.mjs": {
    "kind": "tooling",
    "sha256": "1f696818c4928ed5d445ea9ab105897962abf77cb3ac12665b9ce2e38d984a86",
    "previousSha256": "16b725a6c47162a8e1997a91b711c6e8983bdf7aaf560817a1482e4d97ecc20f"
  },
  "src/xeno-trials-duel-checkpoint-v197.js": {
    "kind": "runtime",
    "sha256": "fa84e0d7c5d3b3f4178f67086345e8f101defb6624de822a437e66d678c3bb61",
    "previousSha256": "b7a6d014d4d058009543959721c15a17f276b606f4caa088083b56f5632917b9"
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "sha256": "f380ab717aa3079522a18a739534cca88916e1cb470a2b556a7d141427377755",
    "previousSha256": "95698b746cebd5ebbc2911d8a15efb0fdd1b9d8ce3f383cc5300b2dfb0f3b1c8"
  },
  "src/xeno-trials-modes-v119.js": {
    "kind": "runtime",
    "sha256": "d072788f9dd5a8da4a9d29140cc04ee29b0b1070d446c8c59e5b4b9a46967039",
    "previousSha256": "03485b8db260cdddbbce04ab4c2f622bccef7c7fa1e615043b605d35d406e232"
  },
  "src/xeno-trials-offline-v223.js": {
    "kind": "runtime",
    "sha256": "ff518da48d044adb68180948aa6ece43f1bfb53827276a286c9226798257b14c",
    "previousSha256": "a8035bbc07046810ac47e3733d5289fa2b6a2cd8c48e95aa786c0dd9e10f9a5d"
  },
  "src/xeno-trials-presentation-art-v230.js": {
    "kind": "runtime",
    "sha256": "2ddb6e3b4b9e9959f3f6051a993ef8c0d865451d545e3cb9d798a6f5e22ddc80",
    "previousSha256": "3d83622167a75daaeaea2f164e2a31276f074b3ebb32eefb426d504992dfe619"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "sha256": "4629c89ae7f26d9bffa51fb6f16c32385d8b838f1b6f0861e50565525d8cf385",
    "previousSha256": "a11b77a02869554dcbbc63858a89548c1feb885ab72a32bc1c0f7cd67d57741b"
  },
  "src/xeno-trials-recruits-v230.js": {
    "kind": "runtime",
    "sha256": "949f1aa772249fbc5f5db8d48ebf9dae3cc6f13c1534ccb7c348655a82ebb2ce",
    "previousSha256": "c045dd40f0f048071775f49a4c17b44ef2a9cb1f0d7fb34863d13ecca20ecb10"
  },
  "src/xeno-trials-research-v210.js": {
    "kind": "runtime",
    "sha256": "8f4d3128f3638d7a15a8ec98f735d4cc294fd89dc6a4ae47ec697ed0f068cd3a",
    "previousSha256": "48e3d5f7f3f385becab37932e6fd4ce51fd1155b4fd39ee4433c0b08dd0e3b3d"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "8bd091840e6d52ac4e59043ea452fcd0de46719634b74d38263491fc391c6264",
    "previousSha256": "2044203eb774d0d239ab04d2cfb82db89e5d1d7ed72702122d54722097eac22c"
  },
  "src/xeno-trials-signature-kit-v208.js": {
    "kind": "runtime",
    "sha256": "eaf1bd7ab02ff5dec2e774bb169c2c63ce4cd5dba76066126736c50c5f6d0bf2",
    "previousSha256": "d63c359a32258b042a84133c643334b139eb9328bb103ef83f061370433ee3a9"
  },
  "src/xeno-trials-super-kits-v209.js": {
    "kind": "runtime",
    "sha256": "5f0e43a477bb9334fdc864aae91ee74a35562423d5e8b837d2dabf0f657f933e",
    "previousSha256": "5be54e444e98c71904148928e9b5d2c1d5b47307afe480ceba698750b4e81c22"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "4247de68cf057c5f8f3bb4c00348cc72310dc77de9c64a1fb80ba99a2ce3e60a",
    "previousSha256": "209e96c8a0c0db7ed60858fc8523d2ebb5ec452b7343a8f5867f3b4e865668fc"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "d031efe1777d3771d1ca7601da86a6a1d911e449ed437745d48a2a57721c2a5f",
    "previousSha256": "5df642635882f1c2a52a77de8f68090e27a566f71f79e26a9eec9b1911455771"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V231 = freeze({
  "assets/openai/xeno-trials-v231/predalien-avpr-intro.png": {
    "kind": "asset",
    "sha256": "8b118b863dbe80c3dbcb76b34b9424c1a1d7456646eb3cbcde73d3f90f88f348"
  },
  "assets/openai/xeno-trials-v231/predalien-avpr-neutral.png": {
    "kind": "asset",
    "sha256": "dc9dec47f5dccd1c1a42f4390b9cf050ee8b80043f43bed89d77c43f28bab792"
  },
  "assets/openai/xeno-trials-v231/predalien-avpr-select.png": {
    "kind": "asset",
    "sha256": "8a317bc91b466e5ea0f24da4f1d5deb229ee9ec703e84b0ec2a9151b8ce4db17"
  },
  "assets/openai/xeno-trials-v231/predalien-avpr-victory.png": {
    "kind": "asset",
    "sha256": "7a804377b94601d8530fcbd4f83bae31c02a159363d00b74d68bfd863bcdc04a"
  },
  "assets/openai/xeno-trials-v231/striker-neutral.png": {
    "kind": "asset",
    "sha256": "b44db527d7d533434ecf492a7d2e971a335913ba103fc9a03a85d10fa3cfed90"
  },
  "docs/forge/xeno-trials/V231-CHARACTER-KITS-AND-ROUTES.md": {
    "kind": "documentation",
    "sha256": "64a520140c2727e3353e8f4ebd8b961b989434a709ca26485442651fc97027b8"
  },
  "docs/forge/xeno-trials/character-art-v231.json": {
    "kind": "documentation",
    "sha256": "1046993c81f65401da1183e3c90d44b063c75f0df317712681ee0e29bc223439"
  },
  "docs/forge/xeno-trials/combat-guide-coverage-v231.json": {
    "kind": "documentation",
    "sha256": "1bd314adf8c55448474a460eb7e38f15d0576eae916c16d3d2b7dc961851dc6d"
  },
  "docs/forge/xeno-trials/recruit-checkpoints-v230.json": {
    "kind": "documentation",
    "sha256": "d4069116dfadccc7e71b159e1c0afb19d7d478c7eac3a0034d87138c3971000b"
  },
  "docs/forge/xeno-trials/striker-active-checkpoints-v230.json": {
    "kind": "documentation",
    "sha256": "28fdbb32f4ef7b69593fbc17ac099314d60f643647146aa2c5c4e9e3b6d8513e"
  },
  "scripts/public-xeno-referenced-art-admissions-v231.mjs": {
    "kind": "tooling",
    "sha256": "a5c0408a4b066df3b3a28a63326f3d10c0479bd5b02760279d79983db714932d"
  },
  "scripts/verify-xeno-trials-character-route-ui-v231.mjs": {
    "kind": "tooling",
    "sha256": "036c7f1876ace022738dc4c9da2a71bc2a144109aa367bac1c928a2b796c0cb6"
  },
  "scripts/verify-xeno-trials-character-routes-v231.mjs": {
    "kind": "tooling",
    "sha256": "f934df6da271a3b48f02d2d95494d1a7b97295e827b891e4a3a895e81fdd25d5"
  },
  "scripts/verify-xeno-trials-recruit-compatibility-v231.mjs": {
    "kind": "tooling",
    "sha256": "2c8121a5bdf711f653228bc072c2593586a85edb725adec97a2337d0bc4c3daa"
  },
  "scripts/verify-xeno-trials-recruit-kits-v231.mjs": {
    "kind": "tooling",
    "sha256": "43342b75d9f2b8e95c2d6b08c6c110b3c5ab5ea9bf2f048cf001caf67a94de37"
  },
  "scripts/verify-xeno-trials-research-art-v231.mjs": {
    "kind": "tooling",
    "sha256": "d037e690d6ceb9b6cd703923d4363e39c694225a74b9b85db287f8512980972a"
  },
  "src/xeno-trials-character-route-ui-v231.js": {
    "kind": "runtime",
    "sha256": "d6d021a213ea834981d184e489f9602009f03fbd8454b8b21812558d1e11dea1"
  },
  "src/xeno-trials-character-routes-v231.js": {
    "kind": "runtime",
    "sha256": "c4b0dd8b9674d73d0f20437b6e0df09074356b9e1ff0d79a9bbeb433ccb8589f"
  },
  "src/xeno-trials-recruit-kits-v231.js": {
    "kind": "runtime",
    "sha256": "7e42eb8912e51ee2b011233b65d4f7526b6d7c4b7084b68fd9c32b5721ad7506"
  },
  "src/xeno-trials-research-art-v231.js": {
    "kind": "runtime",
    "sha256": "ff63efaecea38a4dbeca752691824dc1fc181891992c4aa92e77ffa2b0c006a9"
  }
});

export function reviewedXenoTrialsDigestV231(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V231, path)) return reviewedXenoTrialsDigestV232(path, endpoint);
  const receipt = XENO_TRIALS_SUCCESSORS_V231[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V230 endpoint for V231: ' + path);
  return reviewedXenoTrialsDigestV232(path, receipt.sha256);
}

export function xenoTrialsRuntimeSourcesV231(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V231)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV232(path, receipt.sha256);
    if (result[path] !== undefined && result[path] !== current) reviewedXenoTrialsDigestV231(path, result[path]);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V231)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV232(path, receipt.sha256);
    if (result[path] !== undefined) assert.equal(result[path], current, 'Incorrect V231 runtime input: ' + path);
    result[path] = current;
  }
  return xenoTrialsRuntimeSourcesV232(result);
}

export function verifyXenoTrialsV231(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V231);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V231);
  assert.ok(successors.length > 0, 'Incomplete V231 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v231.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V231 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V231 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V231 receipt: ' + path);
    assert.equal(sha(readSource(path)), reviewedXenoTrialsDigestV232(path, receipt.sha256), 'Unreviewed V231 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V231 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V231 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V231)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V230 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V230 declarations changed: ' + path);
  }
  verifyXenoTrialsV232(readSource);
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V231, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
