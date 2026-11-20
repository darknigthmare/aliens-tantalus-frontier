/** Reviewed source inputs for Xeno Trials V202, anchored to the public V201 commit. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedXenoPrioritiesDigestV203, verifyXenoPrioritiesV203,
  xenoPrioritiesRuntimeSourcesV203 } from './audit-xeno-priorities-v203.mjs';

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

export const XENO_PRIORITIES_BASELINE_V202 = '56caa02c812915225554133f6eaa1625eb1393fe';
export const XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V202 = freezeReceipts({
  "scripts/audit-xeno-priorities-v201.mjs": {
    "start": "export const XENO_PRIORITIES_BASELINE_V201",
    "end": "\nexport function reviewedXenoPrioritiesDigestV201",
    "sha256": "14f51ab521b8b5e9e4dfffbacf7d537c28c38dca6f9203bc5671bbabe4aabf71"
  }
});

export const XENO_PRIORITIES_SUCCESSORS_V202 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "aafd6c5769d0760a5baa02746931e4cd66725cf71ed46890171adb9bc83fc77a",
    "currentSha256": "e049d7504c7105a60c3b551800d91eceedfabda18655323ea43c0a3a683bb305"
  },
  "scripts/audit-xeno-priorities-v201.mjs": {
    "kind": "verifier",
    "previousSha256": "b5e9f6728fc8936cf693f20e37611999a344f0ff00dc9afe3bce9a29d2034257",
    "currentSha256": "708ab64cace62b74937950e4d62b1b5bba551d35bf954ebf2cabe0f1e3478236"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "570d31f2ed7ff1b93b10fd92ec4cc28d21d03031f4d28832d9f48051c4fa1982",
    "currentSha256": "a7e3029687ee37c1ca31d686c4d024d7e205a0618cbd44947205d233a62161a1"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "c4c24a971b39c5fd83bdabb8cb5a80ef8d3398ee5684c29e998645db261f4216",
    "currentSha256": "06951d818dd06e577a380665f58b30fd3e60d549adb16a4105d559b31aec6f73"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "95f8879bdb5b2d1b3bf7add6504ecc169b388807081f5ae7a44e621fd9db6328",
    "currentSha256": "7e2fe1862bb3ba9794d0d2a12245b8b431b767987735b1d1c9a477c12b9e444a"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "033ab3d2b3c2524e2f7605823e3b21027c2183c939f6fa1c0c1d531981f5ff40",
    "currentSha256": "a778a28f5068ea69f958dc161a3afad7d1511622c34cc55f71b7a24181c1d13a"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "81a3203cccf11d3b998395b5f0592a52951e13eb731da0a86f771d0dbc6e8608",
    "currentSha256": "6391c881dee637add73f4eb0a0ba95ac86652977d90e380721ef26080ba938ce"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "34ace4e30113c470d2be51b550fd69fd8299230b52d225bd298b6965e350e674",
    "currentSha256": "346a038da5aff622b3b7c9dd0106b058e0503d940929d852a27b8dbd350ceda4"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "3a51b46214bed2343c8100c24402827ef404fb8c920254f8db9b581303e1b25d",
    "currentSha256": "666da400701e500829606febdd78696e7ce8d3e5dccebb4f8fba6eb3e33d299d"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "8983e24c22a57562ae2d9db43efcb79439b5d710d18722743497085634a13558",
    "currentSha256": "2009d4007e3b66c01e20c8c99e5e27da903416ff130f46e0c07ebbd1f57f04f0"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "cbe460ffa2d6a21c3f593588ae4e653487160e656a4fcf2a66c44c17eb775429",
    "currentSha256": "588e86c0763254b3394f52e255e4a773ed2e54503cf8b3936c7c74e677d5ff1b"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "3eff6448925d6b274f25e0fdd271c5542cc5c768a3c7dfd70d08d765d46a16b8",
    "currentSha256": "9d2e6a1587c7f2fad60bad4b29a52849bb35bbe8b3dd468744466f78c203e28e"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "7d071b6449d8e3fb42791d64b61e2acc4878995c80b71eb4181f824eb9d4c04c",
    "currentSha256": "db525a1452d8183edad10324b67d85ebf8261b213a433fb59a2058870a5459dc"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "verifier",
    "previousSha256": "ca087d488df71b6800c4dc562e59cbf9ffd1676797a6b9a78c0980242cc3faf3",
    "currentSha256": "0269c50c5062993e59774e20755cbcb65f0f64f440fadc2a3cc064d7c773ebda"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "verifier",
    "previousSha256": "39f04cf1383e3d9e22a7659b91e383c6874bc877b8f23c9df56504a8d969d6cf",
    "currentSha256": "2defcb6a0530cf2aed3b25977034e43b2d0170d348e5b90055065ab9f2c04a0a"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "b71c604d1afac04e66a21a56f301d10f5075e0aa2afd5f5d669160c23bb56f5e",
    "currentSha256": "4bdd7bd0cf7555fcc8651b6a075404aba389d0b837b4130f8c79be8d5a346fd2"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "verifier",
    "previousSha256": "69a3e60a4f2fd899b0e8158d6d63b04bc50117c8d6df9c27cd4a10610605b697",
    "currentSha256": "43625f363debe8f09925083f8562330d8558e71358ee76f46a564150a030c205"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "1c17faa58a35ac6e7d9a16acba290da17a2c771b2e84980bf083a7feee932f9c",
    "currentSha256": "297ecd2bf35df68f9aa72c37890d3bf6acbab968b94254a0598e01f9ebb05951"
  },
  "scripts/verify-xeno-trials-franchise-stage-ui-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "8b9be577ee9296576384111f88e2f1abba7901481baf53ae6e21a9858cb1142a",
    "currentSha256": "8592e5aaa11fa366c3a3d1f546ff67ffdcc36b3e2fbf766c8908341ba388b750"
  },
  "scripts/verify-xeno-trials-operation-i18n-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "a0dacda1a8b954e574cf4396c220ee4e891ebea10fd5972fcc261ae0abea5f76",
    "currentSha256": "f6b87b1376c3ccb259204ab81cd9bd7bc952991a2f9fa38f1eb15c51b4accf80"
  },
  "scripts/verify-xeno-trials-priority-actions-v201.mjs": {
    "kind": "verifier",
    "previousSha256": "ffc7337d5dfb4c4416dd5ebf4cef2ccd3aea4adce09a445ac5a37cf1773fc461",
    "currentSha256": "153f83634cbaf0785b35075ab379d1af710dd52b18c684bb33da31cb92592888"
  },
  "scripts/verify-xeno-trials-runtime-completion-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "d4f0cc3770ccc1da5a209b907aac388e6e6c768d01d72fd5a2d4dfb17a0aeeca",
    "currentSha256": "7557108435446b41942561f576f1a26c95b3b56a08c5ae458c7bcb72f11ebf97"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "previousSha256": "1883ce4f203f8531bcd8559b0086e5fa584c7cb8f4ea62cf3f2993cf8c6a3557",
    "currentSha256": "e73c3b85d712f605878d062355557d5ad898f6b8380bab959cef6ef653a63c0e"
  },
  "src/xeno-trials-action-atlas-v199.js": {
    "kind": "runtime",
    "previousSha256": "536e2430c8c5d35c1b24f31e54bf0b5cd6c351e76566f24c98d16e3c4038a856",
    "currentSha256": "67ceae06860937eb69f2611b909fe907d88163dbc174b3dee2ee351920f65d84"
  },
  "src/xeno-trials-animation-coverage-v199.js": {
    "kind": "runtime",
    "previousSha256": "b06552842d990be79c5df0c95fef5d5337f34caa3741ee0fa5732887692d1703",
    "currentSha256": "53d9fae477428a66b39ce5506c2e2bfe0f7f0d943698498c6a4c914917501687"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "previousSha256": "1442a416ae5ea57800c0845acb2e834f2b92ac26f894a644f53418e3a0b530c5",
    "currentSha256": "4121a945554e750f0becabc5315d7c9ad0cbaaffc36dd45b4028cba72464b7fe"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "previousSha256": "d69140bff7fb869e88d026269119dc85114dc673180110609eb1084a69fc42a2",
    "currentSha256": "adf2c09166f3407e918266c6aaea259602cd0e797285688934c1c1349d62c4eb"
  },
  "src/xeno-trials-rig-v154.js": {
    "kind": "runtime",
    "previousSha256": "12afc2435e308c1b5646227b352eeaefe637cac80cbbdf7bb569c4471a7637b7",
    "currentSha256": "18d04027566617a55da53ab0c7cf6f45cbfec990ac50c8ed5f0fa21b7376ce91"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "2492ab73e33f170400d3e4db732eb822e4e8f1dde3dfec54fd45029e6cd1da8c",
    "currentSha256": "76b7689351a6aaa5a582a37ac65f822adfcb26008a62f0da8dda66fc430ce7e1"
  },
  "src/xeno-trials-sprite-atlas-v191.js": {
    "kind": "runtime",
    "previousSha256": "dbed720ed485a1e38de051bafc1002e8aaa7ffd75b474eba46e4c92aea65bd63",
    "currentSha256": "1a871905320679057363740920f7f56ad087b3a29a781574f211cfd3f34e2256"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "4372d35f77ea7b4438011d6ea0784cd03bbb458d99e3aeb228ffa084746cfcb6",
    "currentSha256": "c2c52137ce5fac73a179ec346c10b7124bf407ac34894bb1f4f9695718523b93"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "1812e0c25957f1de4401b4b49cb562f0e4335623b4a5775f9e447260811cdcc0",
    "currentSha256": "104355b3f567483b3658ea3f2414abedd6615152a132463cf76f3536807dceef"
  },
  "xeno-trials-v96.css": {
    "kind": "runtime",
    "previousSha256": "ddfe065daa5bb7eec0df45e3cd94c750944081f800092f6fa4f5ed1220ad23e3",
    "currentSha256": "dab7671183b71e96810cf64c20fa5f9bdab8322e3998b404e1fd193420285366"
  }
});
export const XENO_PRIORITIES_NEW_INPUTS_V202 = freezeReceipts({
  "assets/openai/sprites/xeno-trials-v202/prowler-air-combat-sheet.png": {
    "kind": "asset",
    "sha256": "0a7e7417876095af72c4718a1ea688655ec6936184d882524dbb89e9788de58f"
  },
  "assets/openai/sprites/xeno-trials-v202/ravager-air-combat-sheet.png": {
    "kind": "asset",
    "sha256": "3f2afd87bcbd4398853a5e6123c4f533e396816d3f9caf050d41be80c8ddb6d8"
  },
  "assets/openai/sprites/xeno-trials-v202/rhino-ground-special-sheet.png": {
    "kind": "asset",
    "sha256": "b351bf300cf1a95b5b224028fc8cfa6bd1ca2e3294578be7e0eeb2efa65cb967"
  },
  "assets/openai/sprites/xeno-trials-v202/synth-heavy-ground-special-sheet.png": {
    "kind": "asset",
    "sha256": "df8619d416e78c38e7285c9c2058dc51b006501467bd6a9bb9d707a977649eb5"
  },
  "scripts/public-xeno-priority-admissions-v202.mjs": {
    "kind": "verifier",
    "sha256": "7ce0e39d2acb5e8b14811c05e92a6dd3431a1f6b5dbca99a3250689776224b2d"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "verifier",
    "sha256": "15231fa769811c890ea7fdc5ec45d52b6cdb42868c3f193026b6d6e9a30238ee"
  },
  "scripts/verify-xeno-trials-beacon-windows-v202.mjs": {
    "kind": "verifier",
    "sha256": "016c3ed573e3b65e0633b3c03d72188bf64c13628d0c93267e228404f7b5831c"
  },
  "scripts/verify-xeno-trials-priority-actions-v202.mjs": {
    "kind": "verifier",
    "sha256": "3c31951de4fbc7520952def4d8356e85f2c5e5b5441f439000c9cd571d1531e2"
  },
  "scripts/verify-xeno-trials-rig-v202.mjs": {
    "kind": "verifier",
    "sha256": "238af5c3e9e441d6a3d869adb7a97a800d8a4438c704de1166debea0cfc9c18a"
  },
  "src/xeno-trials-priority-air-data-v202.js": {
    "kind": "runtime",
    "sha256": "e781bf661b09d651ea1e8b90c5092285d6900ea9d29412cb1414cc05826bde99"
  },
  "src/xeno-trials-priority-ground-data-v202.js": {
    "kind": "runtime",
    "sha256": "7ca4e08870e95ef3d40087e6dee7daee526aac817e369d134e7e63118477c0b8"
  },
  "src/xeno-trials-rig-data-v202.js": {
    "kind": "runtime",
    "sha256": "518d34a963e356992c0f703adc63c219620501c0d09cc0ed13b31b4827ffb75d"
  }
});

export function reviewedXenoPrioritiesDigestV202(path, endpointV201) {
  if (!Object.hasOwn(XENO_PRIORITIES_SUCCESSORS_V202, path)) return reviewedXenoPrioritiesDigestV203(path, endpointV201);
  const receipt = XENO_PRIORITIES_SUCCESSORS_V202[path];
  assert.equal(endpointV201, receipt.previousSha256, 'Incorrect V201 endpoint for V202: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V202 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V202 successor: ' + path);
  return reviewedXenoPrioritiesDigestV203(path, receipt.currentSha256);
}

export function xenoPrioritiesRuntimeSourcesV202(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_SUCCESSORS_V202)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoPrioritiesDigestV203(path, receipt.currentSha256);
    if (result[path] !== undefined)
      assert.ok([receipt.previousSha256, receipt.currentSha256, current].includes(result[path]),
        'Incorrect V202 runtime view predecessor: ' + path);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_NEW_INPUTS_V202)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoPrioritiesDigestV203(path, receipt.sha256);
    if (result[path] !== undefined)
      assert.ok([receipt.sha256, current].includes(result[path]), 'Incorrect new V202 runtime digest: ' + path);
    result[path] = current;
  }
  return xenoPrioritiesRuntimeSourcesV203(result);
}

export function verifyXenoPrioritiesV202(readSource = readRepository) {
  const successors = Object.entries(XENO_PRIORITIES_SUCCESSORS_V202);
  const inputs = Object.entries(XENO_PRIORITIES_NEW_INPUTS_V202);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V202 inputs await final source freeze');
  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V202 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-priorities-v202.mjs'), 'V202 cannot admit its own bytes');

  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V202 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedXenoPrioritiesDigestV202(path, receipt.previousSha256),
      'Unreviewed V202 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && kinds.has(receipt.kind) && validHash(receipt.sha256), 'Invalid V202 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), reviewedXenoPrioritiesDigestV203(path, receipt.sha256), 'Unreviewed V202 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V202)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  verifyXenoPrioritiesV203(readSource);
  return Object.freeze({ baselineCommit: XENO_PRIORITIES_BASELINE_V202, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
