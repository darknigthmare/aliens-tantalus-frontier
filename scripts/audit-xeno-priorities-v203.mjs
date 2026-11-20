/** Reviewed source inputs for Xeno Trials V203, anchored to the public V202 commit. */
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

export const XENO_PRIORITIES_BASELINE_V203 = '362d1d77cf730e60e9505bcb17ab70a2f2e1fd4c';
export const XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V203 = freezeReceipts({
  "scripts/audit-xeno-priorities-v202.mjs": {
    "start": "export const XENO_PRIORITIES_BASELINE_V202",
    "end": "\nexport function reviewedXenoPrioritiesDigestV202",
    "sha256": "0a711b16688b9892c1d9df6b5a34870eaa6239e036c9e55c05e7c1f2a00c0c22"
  }
});

export const XENO_PRIORITIES_SUCCESSORS_V203 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "e049d7504c7105a60c3b551800d91eceedfabda18655323ea43c0a3a683bb305",
    "currentSha256": "c1e646109aa27eb23bc7f64fee619249d4486b956cef1d95c19d5f84f4e03de2"
  },
  "scripts/audit-xeno-priorities-v202.mjs": {
    "kind": "verifier",
    "previousSha256": "2673e8f8c97d4f58cc9ff21b9ef32e5528194cd366715c4514033c45609b915d",
    "currentSha256": "156277c7808bef288b607093c22aacea6f52810d20d485a15771de8dd538a258"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "a7e3029687ee37c1ca31d686c4d024d7e205a0618cbd44947205d233a62161a1",
    "currentSha256": "ff3bef30e38ae680861eec4aa900d636907d147cfcfbbd021a44b6ed561c1866"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "06951d818dd06e577a380665f58b30fd3e60d549adb16a4105d559b31aec6f73",
    "currentSha256": "31d5c99aa65e83bc390efa1e4bf14759235382f2b9021b2ebd500d087b7acaef"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "7e2fe1862bb3ba9794d0d2a12245b8b431b767987735b1d1c9a477c12b9e444a",
    "currentSha256": "c8754414b7420f61adb06181bd4ee05b993e35671efba9c79bc7672a1e5e7fa4"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "a778a28f5068ea69f958dc161a3afad7d1511622c34cc55f71b7a24181c1d13a",
    "currentSha256": "b874502f04a9d7a59f2ee04fb6cc776246a4c2d77ae9804b6de436dd6aa23858"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "6391c881dee637add73f4eb0a0ba95ac86652977d90e380721ef26080ba938ce",
    "currentSha256": "d7370404697b053cc40df26181fe61fa93d2c57cc7dde519a333bca0848514c6"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "346a038da5aff622b3b7c9dd0106b058e0503d940929d852a27b8dbd350ceda4",
    "currentSha256": "6d168a9cf905c952e580c30668d43ed856b09ea144ad3471f164eb0be8cf461e"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "666da400701e500829606febdd78696e7ce8d3e5dccebb4f8fba6eb3e33d299d",
    "currentSha256": "361e0fe3380d8ad164ece22422b08864c4a025e32bf82e47f5d4863d9fc673c4"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "2009d4007e3b66c01e20c8c99e5e27da903416ff130f46e0c07ebbd1f57f04f0",
    "currentSha256": "ac1063c8e61d74259193738e45e3b8f1125b0d4ddf4b32b8c1e22ae752b9e1d7"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "588e86c0763254b3394f52e255e4a773ed2e54503cf8b3936c7c74e677d5ff1b",
    "currentSha256": "984bf94f129c3a330655be4f2cb87b1f674a2a56da0c048cab2d68cf5890ad7e"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "9d2e6a1587c7f2fad60bad4b29a52849bb35bbe8b3dd468744466f78c203e28e",
    "currentSha256": "3ceef130a254d97d83d65f1f835720d86398a7acd1e20a5d0d9093f3fd58b676"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "db525a1452d8183edad10324b67d85ebf8261b213a433fb59a2058870a5459dc",
    "currentSha256": "453051505461a4840799ec732bc892f55a21704becf836fb3f6d9002c11e42ad"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "verifier",
    "previousSha256": "0269c50c5062993e59774e20755cbcb65f0f64f440fadc2a3cc064d7c773ebda",
    "currentSha256": "22cc612ff35a6ecb6ca44a29b041cc8dc7832c814f82fe02a14e671cf93e680f"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "verifier",
    "previousSha256": "15231fa769811c890ea7fdc5ec45d52b6cdb42868c3f193026b6d6e9a30238ee",
    "currentSha256": "6a58b52a1bf35498a21f0b2ec993d29ee8ace62b0daa6ffe3f48e8b13e769fa7"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "verifier",
    "previousSha256": "2defcb6a0530cf2aed3b25977034e43b2d0170d348e5b90055065ab9f2c04a0a",
    "currentSha256": "cd2086566512b6015c15f6e253caea481f241b2a18ceeca522a79e60bb92aef4"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "4bdd7bd0cf7555fcc8651b6a075404aba389d0b837b4130f8c79be8d5a346fd2",
    "currentSha256": "cc1f4765aaa03bff1d6716a9ea07baff86bb069312ddef6a64e94b97380c5a31"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "verifier",
    "previousSha256": "43625f363debe8f09925083f8562330d8558e71358ee76f46a564150a030c205",
    "currentSha256": "b50939424e6a60147bc00538c6cb1e487bc1c9024661e280067aedbc9e4e891b"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "297ecd2bf35df68f9aa72c37890d3bf6acbab968b94254a0598e01f9ebb05951",
    "currentSha256": "b32f873533d15e3e2f94afbae7bc30e47bb7a664f665227e923e244a2a456aaa"
  },
  "scripts/verify-xeno-trials-operation-i18n-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "f6b87b1376c3ccb259204ab81cd9bd7bc952991a2f9fa38f1eb15c51b4accf80",
    "currentSha256": "22c488e25a15b337a2fb8d0c6c26dbe5ab67fc9acaede2c1f37f36d425acb6f8"
  },
  "scripts/verify-xeno-trials-priority-actions-v202.mjs": {
    "kind": "verifier",
    "previousSha256": "3c31951de4fbc7520952def4d8356e85f2c5e5b5441f439000c9cd571d1531e2",
    "currentSha256": "48ab3e5032ec41fcd5dda71244e8f2ef86b14e8a83a065dda7a6e00418301abe"
  },
  "scripts/verify-xeno-trials-runtime-completion-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "7557108435446b41942561f576f1a26c95b3b56a08c5ae458c7bcb72f11ebf97",
    "currentSha256": "f6669201cab678f4183fe910cf43df78fe019dba9875192df3db68aa35c5ee5d"
  },
  "src/xeno-trials-action-atlas-v199.js": {
    "kind": "runtime",
    "previousSha256": "67ceae06860937eb69f2611b909fe907d88163dbc174b3dee2ee351920f65d84",
    "currentSha256": "09c74da23c48e43ef5bae370ae4ad5d0acc8b91430180e256dad3174c4e9f719"
  },
  "src/xeno-trials-animation-coverage-v199.js": {
    "kind": "runtime",
    "previousSha256": "53d9fae477428a66b39ce5506c2e2bfe0f7f0d943698498c6a4c914917501687",
    "currentSha256": "ab093549669c287ae3506055cfc99a32bad0dbedfb289969c8f5e1adb1b284f1"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "previousSha256": "4121a945554e750f0becabc5315d7c9ad0cbaaffc36dd45b4028cba72464b7fe",
    "currentSha256": "d14b2d0fe9edd877bd90059e6112d10203c1faf528fed159730a39941a91f4ed"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "previousSha256": "adf2c09166f3407e918266c6aaea259602cd0e797285688934c1c1349d62c4eb",
    "currentSha256": "1b0198ef0004658fca49773ec0cd244da6608d70f6df87c8c9b44daa88d497e9"
  },
  "src/xeno-trials-reactions-v186.js": {
    "kind": "runtime",
    "previousSha256": "f0f01ee666d625e836c2889ae3e383cf29cf98c85dbef1491c4ba26a8a5a9fec",
    "currentSha256": "1e0a316c2e434c8293b246c556f2eb9551ccece52ca19777491db560db10a570"
  },
  "src/xeno-trials-rig-v154.js": {
    "kind": "runtime",
    "previousSha256": "18d04027566617a55da53ab0c7cf6f45cbfec990ac50c8ed5f0fa21b7376ce91",
    "currentSha256": "883de966d4a15fa2a8919c53e846a74a67116ff71e27993eb4f4e1acefcdae4a"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "76b7689351a6aaa5a582a37ac65f822adfcb26008a62f0da8dda66fc430ce7e1",
    "currentSha256": "a2260d10671d81e14ed2c5418ac2c13cab94e84f68b5bbd8d47fa06fcfecd7ed"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "c2c52137ce5fac73a179ec346c10b7124bf407ac34894bb1f4f9695718523b93",
    "currentSha256": "f7740785d8023632a1c15064afa32b013d316a54e96677e3d152d34b53136f67"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "104355b3f567483b3658ea3f2414abedd6615152a132463cf76f3536807dceef",
    "currentSha256": "4151bf5abd87e94bdd7aad627e3f0b0346e368987eca27d2ae3f09c2c5a71ab6"
  },
  "xeno-trials-v96.css": {
    "kind": "runtime",
    "previousSha256": "dab7671183b71e96810cf64c20fa5f9bdab8322e3998b404e1fd193420285366",
    "currentSha256": "0d16f12a4202b4f61960c6f8e1e52d9e8c30ae995eba67a9923a662ff38e7a62"
  }
});
export const XENO_PRIORITIES_NEW_INPUTS_V203 = freezeReceipts({
  "assets/openai/sprites/xeno-trials-v203/armored-joe-ground-special-sheet.png": {
    "kind": "asset",
    "sha256": "cf3c2495d6c70ce1bb94673e65b2310ba78fa064e097c1c72abc17b81ee60c9c"
  },
  "assets/openai/sprites/xeno-trials-v203/chrysalis-air-combat-sheet.png": {
    "kind": "asset",
    "sha256": "59ccc1bd3e6c0f95f5555045c7ac01b81ba69b1faa6a34b802a11791f4046bb5"
  },
  "assets/openai/sprites/xeno-trials-v203/razor-claws-air-combat-sheet.png": {
    "kind": "asset",
    "sha256": "7e5eafc8475ed00aa50768cb43a950d094eb735a85b64947c372d9d7e0171e2b"
  },
  "assets/openai/sprites/xeno-trials-v203/synth-good-boy-ground-special-sheet.png": {
    "kind": "asset",
    "sha256": "6b6f4cf30602e8b962e78168350a2fe5dab721965d493df26561fc5317c72b28"
  },
  "scripts/public-xeno-priority-admissions-v203.mjs": {
    "kind": "verifier",
    "sha256": "6f41d0e89110c180b0a2a575e912a4a8024643491891f95c85e401a59ced61fa"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "verifier",
    "sha256": "1e9d129d5828595f1606ae81417980491995ade9b857c68e14b9de4ff2c9fe1d"
  },
  "scripts/verify-xeno-trials-defense-v203.mjs": {
    "kind": "verifier",
    "sha256": "e263a23ea0053533a5882875bbc15ea4bebeed231c13cbe3c8fbad1747db70e2"
  },
  "scripts/verify-xeno-trials-extraction-presentation-v203.mjs": {
    "kind": "verifier",
    "sha256": "cca0001031b7671c12c9e03f078d10bfda411dc4abf129f1914134b758888c03"
  },
  "scripts/verify-xeno-trials-priority-actions-v203.mjs": {
    "kind": "verifier",
    "sha256": "9a5e08a10339e8debe494b21c37777e550bb746e0e9139cbaf53fda93e9181a9"
  },
  "src/xeno-trials-defense-data-v203.js": {
    "kind": "runtime",
    "sha256": "9d78c3ba9532b5b0890bbfa9731cf2b8507438ad5d388e40f46639a62a68775c"
  },
  "src/xeno-trials-extraction-presentation-v203.js": {
    "kind": "runtime",
    "sha256": "faa7aad61f2fba9479bd4e89d29f222bee712c7e8f5985b54634a491c1dfa4a5"
  },
  "src/xeno-trials-priority-air-data-v203.js": {
    "kind": "runtime",
    "sha256": "48d312c4c8171d32f0e5899a29177a38137a4acddb64478af7b926c37d750411"
  },
  "src/xeno-trials-priority-ground-data-v203.js": {
    "kind": "runtime",
    "sha256": "5a949c90ee0b81e1527a5d7639ff763a876a46c7f5042cffb807aaafe2729ec9"
  }
});

export function reviewedXenoPrioritiesDigestV203(path, endpointV202) {
  if (!Object.hasOwn(XENO_PRIORITIES_SUCCESSORS_V203, path)) return endpointV202;
  const receipt = XENO_PRIORITIES_SUCCESSORS_V203[path];
  assert.equal(endpointV202, receipt.previousSha256, 'Incorrect V202 endpoint for V203: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V203 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V203 successor: ' + path);
  return receipt.currentSha256;
}

export function xenoPrioritiesRuntimeSourcesV203(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_SUCCESSORS_V203)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.currentSha256)
      assert.equal(result[path], receipt.previousSha256, 'Incorrect V203 runtime view predecessor: ' + path);
    result[path] = receipt.currentSha256;
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_NEW_INPUTS_V203)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined)
      assert.equal(result[path], receipt.sha256, 'Incorrect new V203 runtime digest: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoPrioritiesV203(readSource = readRepository) {
  const successors = Object.entries(XENO_PRIORITIES_SUCCESSORS_V203);
  const inputs = Object.entries(XENO_PRIORITIES_NEW_INPUTS_V203);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V203 inputs await final source freeze');
  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V203 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-priorities-v203.mjs'), 'V203 cannot admit its own bytes');

  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V203 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedXenoPrioritiesDigestV203(path, receipt.previousSha256),
      'Unreviewed V203 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && kinds.has(receipt.kind) && validHash(receipt.sha256), 'Invalid V203 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V203 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V203)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  return Object.freeze({ baselineCommit: XENO_PRIORITIES_BASELINE_V203, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
