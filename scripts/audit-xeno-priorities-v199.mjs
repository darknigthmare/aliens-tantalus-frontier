/** Source admission for the priority Trials animations and legacy duel checkpoint, anchored to the public V198 build. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safePath = path => /^[a-zA-Z0-9._/-]+$/.test(path)
  && !path.split('/').some(segment => !segment || segment === '.' || segment === '..');
const kinds = new Set(['runtime', 'asset', 'verifier', 'configuration', 'document-input']);

function freezeReceipts(receipts) {
  for (const receipt of Object.values(receipts)) Object.freeze(receipt);
  return Object.freeze(receipts);
}

export const XENO_PRIORITIES_BASELINE_V199 = '80892c2f55f485d50fba612b1801bc21c3da4347';
export const XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V199 = freezeReceipts({
  "scripts/audit-xeno-priority-stages-v198.mjs": {
    "start": "export const XENO_PRIORITY_STAGES_BASELINE_V198",
    "end": "\nexport function reviewedXenoPriorityStagesDigestV198",
    "sha256": "6fa6e80d246d81825da96cc6732ea6e00eccbff481e19e27daa79b25f5b1dd92"
  }
});

export const XENO_PRIORITIES_SUCCESSORS_V199 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "69fc3bbd93ec61b58856fd09184c37ca2eb57031af88e58562f1544f9dff2208",
    "currentSha256": "0b737c4f733cf7fa1543c37e1e45202308151824dcf55169b05c5c82d1e4d948"
  },
  "scripts/audit-xeno-priority-stages-v198.mjs": {
    "kind": "verifier",
    "previousSha256": "0f81e8af1446adeb7bbcf3e24307d07a543636aa6bb58a8670377d887104ee0d",
    "currentSha256": "c0aee7ce1ad6eba0f349c9d0dc5e4ad4162f491864dbef80c9353afa6eba7a60"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "48978c385211ea39f4c42a793e684ee80db97d6cad0ba3f43010e83a436d2626",
    "currentSha256": "9462b449028da08fe96e23b4bb956f4aa03f1b93d44299b17774cc2d8236d59a"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "7d8fba924e32b147db8a44db3eb28f309f8e6ace6b0714824916e189ca3801af",
    "currentSha256": "4f7e1547ce730040a9c4c7a274fc81219a37ed99a2ba360c49e0a29dfe506e1d"
  },
  "scripts/public-xeno-sprite-admissions-v197.mjs": {
    "kind": "verifier",
    "previousSha256": "9fbfb75e379c54ad3d9170d16f53572e6498a55ae200af6de60482e30abef352",
    "currentSha256": "2f52933b190dd54c518eea90cfef64d149e0b2b7937b890dd74eb40d44eb0f99"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "48436eca414f432c20165c267e15b960fff113c1537cd1ec1d5cd7e1f06dcb27",
    "currentSha256": "cb269ba6daa77e3aa0e5d321ff8911edc0b795e7d0cfd9fc7f906c0a49f7caae"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "daaca906a494123f46960047d9d844290ceffe47a229778dfd6cd628b7a9ff16",
    "currentSha256": "c6464e754dbed671517de592c4ae091aef2b97bca3e4a236ca17a6245522c331"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "fdc52416387449fb3a7d1dc9e9405004f95e97d19168cace9191587c14f631c1",
    "currentSha256": "414fda95ca671dc1530bbbb22d0df59a809cf473c805d2410c3aadf98d68835e"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "ef2b12b104389bea1cde3472439244ab9d53a73045224f322b8dc5aec41d0b3e",
    "currentSha256": "c2bd8253d5aa6de4d4403fd0dd1753ea58cee1e461cd34cef750a83c4e2240a9"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "ebef72c6ac46f04303f4acc69951e169f2a997c1d75f2f58b2186de393e7153a",
    "currentSha256": "9e5966b177cfd7085d9d64339760d3f5af8710a8bd098b37716c7782b25f96de"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "e470012d6fae33b1a16cb2bd8bca3ad34b856299ffafbcd4e64f66df8bb483aa",
    "currentSha256": "4cdb345b99e921179313e1cd710bc36c071346062c9cf218511d1263701e5aa5"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "6531bf5b28d7c6398e54409846f72338ef4012df169ebfd154155227ef076a7a",
    "currentSha256": "0f3662b6914bbec7e585697a29d6ae682d260e187c8c185cf8032e1717478eb2"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "79075fb9f044845292d12022c3b6adfbbdf86e13970f33cbadeeeeec7b3484d9",
    "currentSha256": "e613435f247d40fbfb9bcc718ecca4d712b66aa1a8e96bf9f380a390c16d2823"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "e1ef14fb4d88fe3f7c36463de21e32c2155eb7ae3082e2f80b195330072265a6",
    "currentSha256": "f25f63b6e3e4fd83c48cb970c4dbb761e05f79e8bf835fa382c774ded4681eb9"
  },
  "scripts/verify-xeno-priority-stages-audit-v198.mjs": {
    "kind": "verifier",
    "previousSha256": "011369c697a81cecb6e818fc20346c90bfc3d343485d8cf46963573348615a81",
    "currentSha256": "5be7868d1cbbf837ef4e61a2eedf3ade4026f6426084907b551126506b67aed2"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "verifier",
    "previousSha256": "451e280f7e5e9b2299af1f2b23b92b771dcd2c1cf47c2402fc43c602ac6586e5",
    "currentSha256": "fd36414e859a3c9cbb2984bbd6a5b4e0bdcd124565ba1414fd1f0965de6e44fa"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "f1eb0afc62690c761df05868daa3b7288e2656639be357f7c387a15f0575e6b3",
    "currentSha256": "d6c4cf28c67e710a839384552ee8ec7c5b241fee41fca69c025426c44235a1b0"
  },
  "scripts/verify-xeno-trials-animation-ui-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "ad85575477c0725f700548fb25bd005e4fd1a700dafb422cfa76333765dcc8ee",
    "currentSha256": "bf5042d3f20ffb1eee63b5b7753aa41c763a0a90eee1c1143d8dff6f8bc370d6"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "580901aab92be7a6688a68015550159aa4aeb6a0dfa755e6decea473c03ae248",
    "currentSha256": "db4631fd014daee0cea0c7ff61bb6c330701557ee0b0f176321bc8958bcb3138"
  },
  "scripts/verify-xeno-trials-duel-checkpoint-v197.mjs": {
    "kind": "verifier",
    "previousSha256": "d146516d5c695314ac65295301a7f49c7e89ac9517d55b850a442236e3cd2186",
    "currentSha256": "dcf08474c47de8791d8241c6a5efc1d7a698ab9641dd0011b09ab686254440d0"
  },
  "scripts/verify-xeno-trials-runtime-completion-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "0bb1e78f1a0611e1f849d8c4e4919d35df9ba3ceec1430414f77e0cee883bba9",
    "currentSha256": "4c54aeee92872326570230c451f42561df0ff9d094f6d55d64fa51a6acc5446e"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "previousSha256": "99ab7e46fd2d380b36886531bd02e872bf8e05771a47eba8dabcf309663d88f0",
    "currentSha256": "1883ce4f203f8531bcd8559b0086e5fa584c7cb8f4ea62cf3f2993cf8c6a3557"
  },
  "src/xeno-trials-duel-checkpoint-v197.js": {
    "kind": "runtime",
    "previousSha256": "e04a7b245d34def62da90057de876147ed5c7f33d390f870c648b5d2e6bc61fb",
    "currentSha256": "efbf6a21a06da266f0a98138cf2829411284d75514f2a2a01cf294dc728d2863"
  },
  "src/xeno-trials-rig-v154.js": {
    "kind": "runtime",
    "previousSha256": "f45cdc1df35e803238f552cc1eddd64ce77c15ed9fe32a4db8083dd819d71d68",
    "currentSha256": "634032c8792dc4277b7226135d28e395c56eec067966957eab0c54299e18a69d"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "e041ac1e4b8af2f3ab96dbecb3f9a22e7c2450abf99706e45357491148c81ddc",
    "currentSha256": "0f47b354fb88a16dd37271819e3c0826fa26a6b42c8f98754daff12773a365bc"
  },
  "src/xeno-trials-sprite-atlas-v191.js": {
    "kind": "runtime",
    "previousSha256": "360521c5189ecf8dc4ff474d6a233326631aa6e61b69594b28123e26a1c9ca21",
    "currentSha256": "b8736c881544ebe7c7177b37c27a4dbfbce4bf3efe59ef487987e43edd566f25"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "0b1a580451f07f01a0ebe1b0f45a67b1cf6170ebf649566be9f6322b639324b4",
    "currentSha256": "39af156842b317e1a157063b4be2d0eb8db9548834be407543b493579f002c50"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "c7df0b9fe4ff8e1ebc7707c0d5a770e77835c57058555fa5b246e6e5045154a8",
    "currentSha256": "57516f558228bad34688e0adb474f21f53d801964d98ef78920d2ffdf93c081e"
  }
});
export const XENO_PRIORITIES_NEW_INPUTS_V199 = freezeReceipts({
  "assets/openai/sprites/xeno-trials-v199/drive-v123-fte-pathogen-brute-profile-v13-super-sheet.png": {
    "kind": "asset",
    "sha256": "bdac32bbf780106e003483a88b738f7ee188d54975929dd847be50fcdb1c10ab"
  },
  "assets/openai/sprites/xeno-trials-v199/drive-v123-fte-pathogen-queen-right-v13-super-sheet.png": {
    "kind": "asset",
    "sha256": "2309042354ee8c8ec36c523fba363957d84db6d3f1706a53b72f5a80397ffbfd"
  },
  "assets/openai/sprites/xeno-trials-v199/runner-air-combat-sheet.png": {
    "kind": "asset",
    "sha256": "3f6a105040b0723d1fb9144bb3ff04cab8b2a98d4854f046cf7eb28b1888f8d9"
  },
  "assets/openai/sprites/xeno-trials-v199/warrior-air-combat-sheet.png": {
    "kind": "asset",
    "sha256": "feed3c518f974460b8d1df6ab37aba53ab64e37165a93cc16eae9e6c4741db65"
  },
  "scripts/public-xeno-action-admissions-v199.mjs": {
    "kind": "verifier",
    "sha256": "fccf23753141992b5aa21b94dc6ba203ab621386d7d0abfb3f4d081d41c706aa"
  },
  "scripts/verify-xeno-priorities-audit-v199.mjs": {
    "kind": "verifier",
    "sha256": "81ee4b207d3b10e02746e261c0cd649ac1864dafa1dc48005601405a323dc00a"
  },
  "scripts/verify-xeno-trials-actions-v199.mjs": {
    "kind": "verifier",
    "sha256": "f31cd18cafdeb5a9e9f838b8709536c7519667e4c41bb0755c66c90e15f2852b"
  },
  "scripts/verify-xeno-trials-rig-v199.mjs": {
    "kind": "verifier",
    "sha256": "7f8286c09cd578d16253fa59b8674c9648c8d79f97bba48ded5f9e7caccdf191"
  },
  "src/xeno-trials-action-atlas-v199.js": {
    "kind": "runtime",
    "sha256": "5a5e087c82f22da24b9e88eee368ae36cd45261e1137847a49639806b58e0fc6"
  },
  "src/xeno-trials-action-data-v199.js": {
    "kind": "runtime",
    "sha256": "f68b58c23576fdc13fb85ee8ddea8ec1537bdb3ca6a60f3a540a43c226b10898"
  },
  "src/xeno-trials-animation-coverage-v199.js": {
    "kind": "runtime",
    "sha256": "5c9ccd801ca3601cb2a420822f79cb31b3c43671a7dc1239373eab3429330e9d"
  },
  "src/xeno-trials-rig-data-v199.js": {
    "kind": "runtime",
    "sha256": "374c19409d11a3ab91842042a75581bf9488348fedff318b19e3678f86a6d814"
  }
});

export function reviewedXenoPrioritiesDigestV199(path, endpointV198) {
  if (!Object.hasOwn(XENO_PRIORITIES_SUCCESSORS_V199, path)) return endpointV198;
  const receipt = XENO_PRIORITIES_SUCCESSORS_V199[path];
  assert.equal(endpointV198, receipt.previousSha256, 'Incorrect V198 endpoint for V199: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V199 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V199 successor: ' + path);
  return receipt.currentSha256;
}

export function xenoPrioritiesRuntimeSourcesV199(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_SUCCESSORS_V199)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.currentSha256)
      assert.equal(result[path], receipt.previousSha256, 'Incorrect V199 runtime view predecessor: ' + path);
    result[path] = receipt.currentSha256;
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_NEW_INPUTS_V199)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined)
      assert.equal(result[path], receipt.sha256, 'Incorrect new V199 runtime digest: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoPrioritiesV199(readSource = readRepository) {
  const successors = Object.entries(XENO_PRIORITIES_SUCCESSORS_V199);
  const inputs = Object.entries(XENO_PRIORITIES_NEW_INPUTS_V199);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V199 inputs await final source freeze');
  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V199 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-priorities-v199.mjs'), 'V199 cannot admit its own bytes');

  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V199 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedXenoPrioritiesDigestV199(path, receipt.previousSha256),
      'Unreviewed V199 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && kinds.has(receipt.kind) && validHash(receipt.sha256), 'Invalid V199 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V199 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V199)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  return Object.freeze({
    baselineCommit: XENO_PRIORITIES_BASELINE_V199,
    successors: successors.length,
    addedInputs: inputs.length,
    historicalResultsTransferred: false
  });
}
