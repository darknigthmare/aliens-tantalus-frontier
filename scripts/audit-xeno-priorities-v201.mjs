/** Reviewed source inputs for Xeno Trials V201, anchored to the public V200 commit. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedXenoPrioritiesDigestV202, verifyXenoPrioritiesV202,
  xenoPrioritiesRuntimeSourcesV202 } from './audit-xeno-priorities-v202.mjs';

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

export const XENO_PRIORITIES_BASELINE_V201 = '005568f7f285ca5ec704e0e87498b2e5b68211a9';
export const XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V201 = freezeReceipts({
  "scripts/audit-xeno-supers-v200.mjs": {
    "start": "export const XENO_SUPERS_BASELINE_V200",
    "end": "\nexport function reviewedXenoSupersDigestV200",
    "sha256": "77199ff96189874e73d4db0db5658ad0268a77e2d41996b2b0283d6bfd134084"
  }
});

export const XENO_PRIORITIES_SUCCESSORS_V201 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "a85a6fc342be9aed90820e26a171424dbaf026b954eca8505f7bbe7994db027d",
    "currentSha256": "aafd6c5769d0760a5baa02746931e4cd66725cf71ed46890171adb9bc83fc77a"
  },
  "scripts/audit-xeno-supers-v200.mjs": {
    "kind": "verifier",
    "previousSha256": "117daa5a2f8190b460278bda262cb6c8c56185e76f8cde6bc240ede35cbb20f2",
    "currentSha256": "4f93e48541259da834d125363fd405bcc14a8cc7a8cf810e3e099d76c983ffb5"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "52f0c9aa6a7d251eb4f9084026d82aa3ea09ec90f541388252c69fdd23d67ecf",
    "currentSha256": "570d31f2ed7ff1b93b10fd92ec4cc28d21d03031f4d28832d9f48051c4fa1982"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "d157924a54a1dd8fbe8ea8b05f6be94663155c9daf0bc045eb2249c4f2b31857",
    "currentSha256": "c4c24a971b39c5fd83bdabb8cb5a80ef8d3398ee5684c29e998645db261f4216"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "e34b90bf5da67604f629464d9c3c5342345026b8cbda3b1b27c339533439295b",
    "currentSha256": "95f8879bdb5b2d1b3bf7add6504ecc169b388807081f5ae7a44e621fd9db6328"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "2179ca4a1b0abf35d31cd3148e9a0d6935b16c4dd2dde19bcd4c9bbdbe45b0c4",
    "currentSha256": "033ab3d2b3c2524e2f7605823e3b21027c2183c939f6fa1c0c1d531981f5ff40"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "9f8b9ee58015e91a9e08ca72afdb02cb56c21ccfe5eae0c711067f82b18774fa",
    "currentSha256": "81a3203cccf11d3b998395b5f0592a52951e13eb731da0a86f771d0dbc6e8608"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "42426475663015c614259bc3de31ca445557922f62062eaeda3fc899c65c5ebb",
    "currentSha256": "34ace4e30113c470d2be51b550fd69fd8299230b52d225bd298b6965e350e674"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "4dcc29b967e8aa86152f91fd90c32ac61242dfd7fe8945b507346e43b6f52ec9",
    "currentSha256": "3a51b46214bed2343c8100c24402827ef404fb8c920254f8db9b581303e1b25d"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "7c51f521461ccf1d961854dca114bc781a49f2fb356284c1dc1ecd26e9818732",
    "currentSha256": "8983e24c22a57562ae2d9db43efcb79439b5d710d18722743497085634a13558"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "6488c516799cbb6cb197c84fff27e8ae2f44d450d736d88ad7bf79505ae2bd85",
    "currentSha256": "cbe460ffa2d6a21c3f593588ae4e653487160e656a4fcf2a66c44c17eb775429"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "1c5306e5b37a88feb1293b0a38a06c097ca10f4a4353f4aba759de3d576b1d38",
    "currentSha256": "3eff6448925d6b274f25e0fdd271c5542cc5c768a3c7dfd70d08d765d46a16b8"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "afba7a86e0234cffb1df120334fd241c69af2397e3736ad74eb57ea9eb395961",
    "currentSha256": "7d071b6449d8e3fb42791d64b61e2acc4878995c80b71eb4181f824eb9d4c04c"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "verifier",
    "previousSha256": "fb2d3d113405f9cfe8a444c04d39202c33dc8d39c99cbaa1ab49d9227a50f871",
    "currentSha256": "39f04cf1383e3d9e22a7659b91e383c6874bc877b8f23c9df56504a8d969d6cf"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "5945befc219ca2c1c17661fe4bc799fc2a6c90714327da909d718ada8989a222",
    "currentSha256": "b71c604d1afac04e66a21a56f301d10f5075e0aa2afd5f5d669160c23bb56f5e"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "verifier",
    "previousSha256": "076ec08707a0ed7cc0610e0e5ec52c639ed73bff6fba761d02b3e8e34c47e2b8",
    "currentSha256": "69a3e60a4f2fd899b0e8158d6d63b04bc50117c8d6df9c27cd4a10610605b697"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "6b7e7f5119c4c8e9ba6b07226feace93a57fd786c0695af388e57b29d05f4128",
    "currentSha256": "1c17faa58a35ac6e7d9a16acba290da17a2c771b2e84980bf083a7feee932f9c"
  },
  "scripts/verify-xeno-trials-runtime-completion-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "4c54aeee92872326570230c451f42561df0ff9d094f6d55d64fa51a6acc5446e",
    "currentSha256": "d4f0cc3770ccc1da5a209b907aac388e6e6c768d01d72fd5a2d4dfb17a0aeeca"
  },
  "src/xeno-trials-action-atlas-v199.js": {
    "kind": "runtime",
    "previousSha256": "6d148ab55b9293462d8bc8cd6887cc6166ea115aa07876f12e973c2264522f19",
    "currentSha256": "536e2430c8c5d35c1b24f31e54bf0b5cd6c351e76566f24c98d16e3c4038a856"
  },
  "src/xeno-trials-animation-coverage-v199.js": {
    "kind": "runtime",
    "previousSha256": "b24711a052f55d42e039c88d5a75f2af8078e48b3edb0294aa6606865866c12d",
    "currentSha256": "b06552842d990be79c5df0c95fef5d5337f34caa3741ee0fa5732887692d1703"
  },
  "src/xeno-trials-horde-ui-v180.js": {
    "kind": "runtime",
    "previousSha256": "6d0972f7203ebe9354765afe5f2a896072829b7c36589b9d3a6b78bba754805d",
    "currentSha256": "56d91c673b4246c208fe1aa45f125da8b5083a80f549993a1646883a5be45eed"
  },
  "src/xeno-trials-rig-v154.js": {
    "kind": "runtime",
    "previousSha256": "634032c8792dc4277b7226135d28e395c56eec067966957eab0c54299e18a69d",
    "currentSha256": "12afc2435e308c1b5646227b352eeaefe637cac80cbbdf7bb569c4471a7637b7"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "e254b8993226ea3a1fc24313e824ec368c90631f24afd3032d779aeabf310cd3",
    "currentSha256": "2492ab73e33f170400d3e4db732eb822e4e8f1dde3dfec54fd45029e6cd1da8c"
  },
  "src/xeno-trials-sprite-atlas-v191.js": {
    "kind": "runtime",
    "previousSha256": "9ddeca7dc8d3d2001cd9a52867eac6ae7b18034bd00143b672bfe41745f0acc1",
    "currentSha256": "dbed720ed485a1e38de051bafc1002e8aaa7ffd75b474eba46e4c92aea65bd63"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "ebaf5aab2e0dc5765922e77102c22307264726fabf058c33c9508bf02dceddfa",
    "currentSha256": "4372d35f77ea7b4438011d6ea0784cd03bbb458d99e3aeb228ffa084746cfcb6"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "ceb35a86c8f2d06d3250645b58e6b160efc0b337a08ac3be012aa3ff012ee721",
    "currentSha256": "1812e0c25957f1de4401b4b49cb562f0e4335623b4a5775f9e447260811cdcc0"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "previousSha256": "b18a69b97f9fd95a894106e530154f0c63e3609f6875dbbff8d941a49b76c658",
    "currentSha256": "a558da2c981d1a0be32e04b5204a23fec3941954e82658cc235372477b1550b6"
  }
});
export const XENO_PRIORITIES_NEW_INPUTS_V201 = freezeReceipts({
  "assets/openai/sprites/xeno-trials-v201/import-game-afe2-warden-air-combat-sheet.png": {
    "kind": "asset",
    "sha256": "38872a32417ddbee5a62affc3e1cdf36c6ab5934f64ff359853f6e4c5089c172"
  },
  "assets/openai/sprites/xeno-trials-v201/mantis-ground-special-sheet.png": {
    "kind": "asset",
    "sha256": "102343a26d8d5f4339329a9f426834280df33acd8c7d216338ddd17aad5bcfe1"
  },
  "assets/openai/sprites/xeno-trials-v201/queen-air-combat-sheet.png": {
    "kind": "asset",
    "sha256": "d9e31f58de09841f8ec64149fcc433fbed2b81f6b8eb6ff4a8fc15e8cb1f69fb"
  },
  "assets/openai/sprites/xeno-trials-v201/synth-sniper-ground-special-sheet.png": {
    "kind": "asset",
    "sha256": "135332bfa49869570d2c0d88b9529fbfd862509cb474494dec2646cb96b8849b"
  },
  "scripts/public-xeno-priority-admissions-v201.mjs": {
    "kind": "verifier",
    "sha256": "f0b2b296336b229664072e5da9763c47ab4ade5be46b269b1c5e608a77719c30"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "verifier",
    "sha256": "ca087d488df71b6800c4dc562e59cbf9ffd1676797a6b9a78c0980242cc3faf3"
  },
  "scripts/verify-xeno-trials-priority-actions-v201.mjs": {
    "kind": "verifier",
    "sha256": "ffc7337d5dfb4c4416dd5ebf4cef2ccd3aea4adce09a445ac5a37cf1773fc461"
  },
  "scripts/verify-xeno-trials-reinforcements-v201.mjs": {
    "kind": "verifier",
    "sha256": "7a8d4636562cd639f1603afdca1d31a47e4858a5c9fe10e7df1a7db07734b90f"
  },
  "scripts/verify-xeno-trials-rig-v201.mjs": {
    "kind": "verifier",
    "sha256": "fb06f3929be3ea45983c0bbba3f70dec59eca5a874a6b055dfdbd03fd2967cc6"
  },
  "src/xeno-trials-priority-air-data-v201.js": {
    "kind": "runtime",
    "sha256": "d511e2787b6cd29319ce7acff42a314800570cb5d4278606cbb5de86d43874c6"
  },
  "src/xeno-trials-priority-ground-data-v201.js": {
    "kind": "runtime",
    "sha256": "18369317daaf6d7ff8513c99ffca70eb10f5a01a8422e731a2d75ef18bb51ef5"
  },
  "src/xeno-trials-reinforcements-v201.js": {
    "kind": "runtime",
    "sha256": "c302c1a04b7254248cb598b0c9c32df8330a85c877896bb19cad9545b490b0e1"
  },
  "src/xeno-trials-rig-data-v201.js": {
    "kind": "runtime",
    "sha256": "02678c8cf7e8863da04534b27e9e0d22c9865c4abd311c4e763339b75b0d6deb"
  }
});

export function reviewedXenoPrioritiesDigestV201(path, endpointV200) {
  if (!Object.hasOwn(XENO_PRIORITIES_SUCCESSORS_V201, path)) return reviewedXenoPrioritiesDigestV202(path, endpointV200);
  const receipt = XENO_PRIORITIES_SUCCESSORS_V201[path];
  assert.equal(endpointV200, receipt.previousSha256, 'Incorrect V200 endpoint for V201: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V201 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V201 successor: ' + path);
  return reviewedXenoPrioritiesDigestV202(path, receipt.currentSha256);
}

export function xenoPrioritiesRuntimeSourcesV201(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_SUCCESSORS_V201)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoPrioritiesDigestV202(path, receipt.currentSha256);
    if (result[path] !== undefined)
      assert.ok([receipt.previousSha256, receipt.currentSha256, current].includes(result[path]),
        'Incorrect V201 runtime view predecessor: ' + path);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_NEW_INPUTS_V201)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoPrioritiesDigestV202(path, receipt.sha256);
    if (result[path] !== undefined)
      assert.ok([receipt.sha256, current].includes(result[path]), 'Incorrect new V201 runtime digest: ' + path);
    result[path] = current;
  }
  return xenoPrioritiesRuntimeSourcesV202(result);
}

export function verifyXenoPrioritiesV201(readSource = readRepository) {
  const successors = Object.entries(XENO_PRIORITIES_SUCCESSORS_V201);
  const inputs = Object.entries(XENO_PRIORITIES_NEW_INPUTS_V201);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V201 inputs await final source freeze');
  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V201 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-priorities-v201.mjs'), 'V201 cannot admit its own bytes');

  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V201 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedXenoPrioritiesDigestV201(path, receipt.previousSha256),
      'Unreviewed V201 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && kinds.has(receipt.kind) && validHash(receipt.sha256), 'Invalid V201 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), reviewedXenoPrioritiesDigestV202(path, receipt.sha256), 'Unreviewed V201 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V201)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  verifyXenoPrioritiesV202(readSource);
  return Object.freeze({ baselineCommit: XENO_PRIORITIES_BASELINE_V201, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
