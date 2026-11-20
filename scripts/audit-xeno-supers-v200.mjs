/** Source admission for the three Trials super attacks, anchored to the public V199 build. */
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

export const XENO_SUPERS_BASELINE_V200 = '5d3f7ef5df15e36e2d8b6aeece61c81cc4b73d0c';
export const XENO_SUPERS_HISTORICAL_DECLARATIONS_V200 = freezeReceipts({
  "scripts/audit-xeno-priorities-v199.mjs": {
    "start": "export const XENO_PRIORITIES_BASELINE_V199",
    "end": "\nexport function reviewedXenoPrioritiesDigestV199",
    "sha256": "72644875ece06b4af455d266cfa40b08ed9f237a0ecc4db5a413bb8738586836"
  }
});

export const XENO_SUPERS_SUCCESSORS_V200 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "0b737c4f733cf7fa1543c37e1e45202308151824dcf55169b05c5c82d1e4d948",
    "currentSha256": "a85a6fc342be9aed90820e26a171424dbaf026b954eca8505f7bbe7994db027d"
  },
  "scripts/audit-xeno-priorities-v199.mjs": {
    "kind": "verifier",
    "previousSha256": "6d893428faa29d5add56754ffc30868489eade9a366278e1e2c2e28493e7906f",
    "currentSha256": "4be6e34245046ff3d422af4a71bfaf3ef9b0f1e452fe2691156ab76337696269"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "9462b449028da08fe96e23b4bb956f4aa03f1b93d44299b17774cc2d8236d59a",
    "currentSha256": "52f0c9aa6a7d251eb4f9084026d82aa3ea09ec90f541388252c69fdd23d67ecf"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "4f7e1547ce730040a9c4c7a274fc81219a37ed99a2ba360c49e0a29dfe506e1d",
    "currentSha256": "d157924a54a1dd8fbe8ea8b05f6be94663155c9daf0bc045eb2249c4f2b31857"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "cb269ba6daa77e3aa0e5d321ff8911edc0b795e7d0cfd9fc7f906c0a49f7caae",
    "currentSha256": "e34b90bf5da67604f629464d9c3c5342345026b8cbda3b1b27c339533439295b"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "c6464e754dbed671517de592c4ae091aef2b97bca3e4a236ca17a6245522c331",
    "currentSha256": "2179ca4a1b0abf35d31cd3148e9a0d6935b16c4dd2dde19bcd4c9bbdbe45b0c4"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "414fda95ca671dc1530bbbb22d0df59a809cf473c805d2410c3aadf98d68835e",
    "currentSha256": "9f8b9ee58015e91a9e08ca72afdb02cb56c21ccfe5eae0c711067f82b18774fa"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "c2bd8253d5aa6de4d4403fd0dd1753ea58cee1e461cd34cef750a83c4e2240a9",
    "currentSha256": "42426475663015c614259bc3de31ca445557922f62062eaeda3fc899c65c5ebb"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "9e5966b177cfd7085d9d64339760d3f5af8710a8bd098b37716c7782b25f96de",
    "currentSha256": "4dcc29b967e8aa86152f91fd90c32ac61242dfd7fe8945b507346e43b6f52ec9"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "4cdb345b99e921179313e1cd710bc36c071346062c9cf218511d1263701e5aa5",
    "currentSha256": "7c51f521461ccf1d961854dca114bc781a49f2fb356284c1dc1ecd26e9818732"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "0f3662b6914bbec7e585697a29d6ae682d260e187c8c185cf8032e1717478eb2",
    "currentSha256": "6488c516799cbb6cb197c84fff27e8ae2f44d450d736d88ad7bf79505ae2bd85"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "e613435f247d40fbfb9bcc718ecca4d712b66aa1a8e96bf9f380a390c16d2823",
    "currentSha256": "1c5306e5b37a88feb1293b0a38a06c097ca10f4a4353f4aba759de3d576b1d38"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "f25f63b6e3e4fd83c48cb970c4dbb761e05f79e8bf835fa382c774ded4681eb9",
    "currentSha256": "afba7a86e0234cffb1df120334fd241c69af2397e3736ad74eb57ea9eb395961"
  },
  "scripts/verify-xeno-priorities-audit-v199.mjs": {
    "kind": "verifier",
    "previousSha256": "81ee4b207d3b10e02746e261c0cd649ac1864dafa1dc48005601405a323dc00a",
    "currentSha256": "88f4b0fca8e793ff1486d315f54377a91292b291d8c006a6a7f773f9ef95453b"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "verifier",
    "previousSha256": "fd36414e859a3c9cbb2984bbd6a5b4e0bdcd124565ba1414fd1f0965de6e44fa",
    "currentSha256": "fb2d3d113405f9cfe8a444c04d39202c33dc8d39c99cbaa1ab49d9227a50f871"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "d6c4cf28c67e710a839384552ee8ec7c5b241fee41fca69c025426c44235a1b0",
    "currentSha256": "5945befc219ca2c1c17661fe4bc799fc2a6c90714327da909d718ada8989a222"
  },
  "scripts/verify-xeno-trials-animation-ui-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "bf5042d3f20ffb1eee63b5b7753aa41c763a0a90eee1c1143d8dff6f8bc370d6",
    "currentSha256": "b69bffff444f3c6f6863ce1e0cd9d2c0a054c18e1fde4b4e6453854343177530"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "db4631fd014daee0cea0c7ff61bb6c330701557ee0b0f176321bc8958bcb3138",
    "currentSha256": "6b7e7f5119c4c8e9ba6b07226feace93a57fd786c0695af388e57b29d05f4128"
  },
  "src/xeno-trials-action-atlas-v199.js": {
    "kind": "runtime",
    "previousSha256": "5a5e087c82f22da24b9e88eee368ae36cd45261e1137847a49639806b58e0fc6",
    "currentSha256": "6d148ab55b9293462d8bc8cd6887cc6166ea115aa07876f12e973c2264522f19"
  },
  "src/xeno-trials-animation-coverage-v199.js": {
    "kind": "runtime",
    "previousSha256": "5c9ccd801ca3601cb2a420822f79cb31b3c43671a7dc1239373eab3429330e9d",
    "currentSha256": "b24711a052f55d42e039c88d5a75f2af8078e48b3edb0294aa6606865866c12d"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "0f47b354fb88a16dd37271819e3c0826fa26a6b42c8f98754daff12773a365bc",
    "currentSha256": "e254b8993226ea3a1fc24313e824ec368c90631f24afd3032d779aeabf310cd3"
  },
  "src/xeno-trials-sprite-atlas-v191.js": {
    "kind": "runtime",
    "previousSha256": "b8736c881544ebe7c7177b37c27a4dbfbce4bf3efe59ef487987e43edd566f25",
    "currentSha256": "9ddeca7dc8d3d2001cd9a52867eac6ae7b18034bd00143b672bfe41745f0acc1"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "39af156842b317e1a157063b4be2d0eb8db9548834be407543b493579f002c50",
    "currentSha256": "ebaf5aab2e0dc5765922e77102c22307264726fabf058c33c9508bf02dceddfa"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "57516f558228bad34688e0adb474f21f53d801964d98ef78920d2ffdf93c081e",
    "currentSha256": "ceb35a86c8f2d06d3250645b58e6b160efc0b337a08ac3be012aa3ff012ee721"
  }
});
export const XENO_SUPERS_NEW_INPUTS_V200 = freezeReceipts({
  "assets/openai/sprites/xeno-trials-v200/import-game-afe2-exploder-super-sheet.png": {
    "kind": "asset",
    "sha256": "523fb8a23efc5875718476583133860164c024ac864cfabb2c7eab7aa04f5c34"
  },
  "assets/openai/sprites/xeno-trials-v200/import-game-afe2-harbinger-super-sheet.png": {
    "kind": "asset",
    "sha256": "043f9f057def364e957df834e26f7c16be8f96be2571e61720de63b756316b92"
  },
  "assets/openai/sprites/xeno-trials-v200/import-game-afe2-warden-super-sheet.png": {
    "kind": "asset",
    "sha256": "a4422ede2ee1893d83f77bd81404fd61648dd2fa4d1cf044f5b0d0c1184bf8fd"
  },
  "scripts/public-xeno-super-admissions-v200.mjs": {
    "kind": "verifier",
    "sha256": "b8ec7473af01bba13f15de2eab2cb476eba928db68b6e91eea85878109827a13"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "verifier",
    "sha256": "076ec08707a0ed7cc0610e0e5ec52c639ed73bff6fba761d02b3e8e34c47e2b8"
  },
  "scripts/verify-xeno-trials-supers-v200.mjs": {
    "kind": "verifier",
    "sha256": "c3142450edfdb839bec64ccf532805fb667b37b4ad3e2f5f70539778237a9455"
  },
  "src/xeno-trials-super-data-v200.js": {
    "kind": "runtime",
    "sha256": "fa85102ad1c73b64134e73ad214ad5eb366c03b53650b0e96900e6743e00205a"
  }
});

export function reviewedXenoSupersDigestV200(path, endpointV199) {
  if (!Object.hasOwn(XENO_SUPERS_SUCCESSORS_V200, path)) return endpointV199;
  const receipt = XENO_SUPERS_SUCCESSORS_V200[path];
  assert.equal(endpointV199, receipt.previousSha256, 'Incorrect V199 endpoint for V200: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V200 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V200 successor: ' + path);
  return receipt.currentSha256;
}

export function xenoSupersRuntimeSourcesV200(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_SUPERS_SUCCESSORS_V200)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.currentSha256)
      assert.equal(result[path], receipt.previousSha256, 'Incorrect V200 runtime view predecessor: ' + path);
    result[path] = receipt.currentSha256;
  }
  for (const [path, receipt] of Object.entries(XENO_SUPERS_NEW_INPUTS_V200)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined)
      assert.equal(result[path], receipt.sha256, 'Incorrect new V200 runtime digest: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoSupersV200(readSource = readRepository) {
  const successors = Object.entries(XENO_SUPERS_SUCCESSORS_V200);
  const inputs = Object.entries(XENO_SUPERS_NEW_INPUTS_V200);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V200 inputs await final source freeze');
  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V200 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-supers-v200.mjs'), 'V200 cannot admit its own bytes');

  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V200 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedXenoSupersDigestV200(path, receipt.previousSha256),
      'Unreviewed V200 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && kinds.has(receipt.kind) && validHash(receipt.sha256), 'Invalid V200 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V200 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_SUPERS_HISTORICAL_DECLARATIONS_V200)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  return Object.freeze({
    baselineCommit: XENO_SUPERS_BASELINE_V200,
    successors: successors.length,
    addedInputs: inputs.length,
    historicalResultsTransferred: false
  });
}
