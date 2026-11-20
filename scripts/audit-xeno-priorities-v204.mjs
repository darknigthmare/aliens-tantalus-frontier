/** Reviewed source inputs for Xeno Trials V204, anchored to the public V203 commit. */
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

export const XENO_PRIORITIES_BASELINE_V204 = '0f001296db2e63cd62d938877926ee8412a37338';
export const XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V204 = freezeReceipts({
  "scripts/audit-xeno-priorities-v203.mjs": {
    "start": "export const XENO_PRIORITIES_BASELINE_V203",
    "end": "\nexport function reviewedXenoPrioritiesDigestV203",
    "sha256": "78f3221632bd600a4d830a99a09b4a8d26231f902168107153550568bdfdbc67"
  }
});

export const XENO_PRIORITIES_SUCCESSORS_V204 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "c1e646109aa27eb23bc7f64fee619249d4486b956cef1d95c19d5f84f4e03de2",
    "currentSha256": "ceb95f8217d9f12527d757f05bd6d08a66190476a1cd68506a3bfdc416ff2476"
  },
  "scripts/audit-xeno-priorities-v203.mjs": {
    "kind": "verifier",
    "previousSha256": "b64bc3c21c8ca9da86f3b9ea9ba820fd9dde6a7bab58505bd4067cce9bda6b94",
    "currentSha256": "13b51c3e078e14c4e5489313062fb1aee1a8e8230a17d72789350cf788285dc1"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "ff3bef30e38ae680861eec4aa900d636907d147cfcfbbd021a44b6ed561c1866",
    "currentSha256": "e838a6801482b2c10d355b480304052c4cf8f0f3a86bc0626bcad06671b70941"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "31d5c99aa65e83bc390efa1e4bf14759235382f2b9021b2ebd500d087b7acaef",
    "currentSha256": "ebbe9a97a7cab715bc3711373fc77fb97e0994e031c59fcd9763642540650408"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "c8754414b7420f61adb06181bd4ee05b993e35671efba9c79bc7672a1e5e7fa4",
    "currentSha256": "f700865f2c63863c2ffdb47aec81a6f216940343ec027e22004c04a300b88813"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "b874502f04a9d7a59f2ee04fb6cc776246a4c2d77ae9804b6de436dd6aa23858",
    "currentSha256": "e4c7cc61ce057df839d3fa51fcfdfe88cc36468fb3da95bc2d82d24a45da8252"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "d7370404697b053cc40df26181fe61fa93d2c57cc7dde519a333bca0848514c6",
    "currentSha256": "2d9504849d4aaa959c508693e1c62a34c78f3fbda21c228e719a74d8125f5ca3"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "6d168a9cf905c952e580c30668d43ed856b09ea144ad3471f164eb0be8cf461e",
    "currentSha256": "14765788c28585b0c2661dc8ad7c7366a3c971153f7eb29ab1fdcbff7ac01142"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "361e0fe3380d8ad164ece22422b08864c4a025e32bf82e47f5d4863d9fc673c4",
    "currentSha256": "38e54c4319c4829238d060c3521a21f1bfc42b6e9c60e4bea25a6e366d56a0d4"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "ac1063c8e61d74259193738e45e3b8f1125b0d4ddf4b32b8c1e22ae752b9e1d7",
    "currentSha256": "ecb7f7aeea78c96abdd50f7a14fb1ac7a1abedfe38dc63342d98ba3e03cfa192"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "984bf94f129c3a330655be4f2cb87b1f674a2a56da0c048cab2d68cf5890ad7e",
    "currentSha256": "327306980ee53f457831035088f5ff4716310439858429817f1e469d5cc9bfb4"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "3ceef130a254d97d83d65f1f835720d86398a7acd1e20a5d0d9093f3fd58b676",
    "currentSha256": "0bbd5e697343d3d40737ca595a3047bb3bac50789338715f813fd4a86f7fa80e"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "453051505461a4840799ec732bc892f55a21704becf836fb3f6d9002c11e42ad",
    "currentSha256": "23529a33369853b74f226a3597ad6a1d8a4dabf057c5d1db04e959fbab3b8e68"
  },
  "scripts/verify-xeno-priorities-audit-v201.mjs": {
    "kind": "verifier",
    "previousSha256": "22cc612ff35a6ecb6ca44a29b041cc8dc7832c814f82fe02a14e671cf93e680f",
    "currentSha256": "e7175588d9890deef21eeeafda5019361406c1f47395f33fe04cf3d960215cde"
  },
  "scripts/verify-xeno-priorities-audit-v202.mjs": {
    "kind": "verifier",
    "previousSha256": "6a58b52a1bf35498a21f0b2ec993d29ee8ace62b0daa6ffe3f48e8b13e769fa7",
    "currentSha256": "42e19c41cfcd37bbb3e477ed8f304d64ffe962d1e8483b696ed2a0de19c4e004"
  },
  "scripts/verify-xeno-priorities-audit-v203.mjs": {
    "kind": "verifier",
    "previousSha256": "1e9d129d5828595f1606ae81417980491995ade9b857c68e14b9de4ff2c9fe1d",
    "currentSha256": "12e0fa9dc903fe56ee316a1b4b0db270890926dda8b1f7114cdfc45e48c78e18"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "verifier",
    "previousSha256": "cd2086566512b6015c15f6e253caea481f241b2a18ceeca522a79e60bb92aef4",
    "currentSha256": "7978d0de93d916c404290579cdd794b4a34c2149c9d567fa3623174657c99207"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "cc1f4765aaa03bff1d6716a9ea07baff86bb069312ddef6a64e94b97380c5a31",
    "currentSha256": "a29e0655735220930d0747032087fa5e7d44687c072c683bfbbba80b59d9c0fa"
  },
  "scripts/verify-xeno-supers-audit-v200.mjs": {
    "kind": "verifier",
    "previousSha256": "b50939424e6a60147bc00538c6cb1e487bc1c9024661e280067aedbc9e4e891b",
    "currentSha256": "741231fb303e79a410eaa10eb613f49d55568a6379c5e3976a1db75f4b201fb4"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "b32f873533d15e3e2f94afbae7bc30e47bb7a664f665227e923e244a2a456aaa",
    "currentSha256": "a2723f2869f1f14050cd0b64b29cec7cf57057f2e4ada7c2c6b273e4e0721c21"
  },
  "scripts/verify-xeno-trials-operation-i18n-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "22c488e25a15b337a2fb8d0c6c26dbe5ab67fc9acaede2c1f37f36d425acb6f8",
    "currentSha256": "003f7d67f4ffc33841a958fafb1568bc0e8b0d4e81e794722b83c10e5edc4f39"
  },
  "scripts/verify-xeno-trials-priority-actions-v203.mjs": {
    "kind": "verifier",
    "previousSha256": "9a5e08a10339e8debe494b21c37777e550bb746e0e9139cbaf53fda93e9181a9",
    "currentSha256": "70f418bcc7b2f4513109637227e511aeda56c86fe5511fe9ef2c293e5fd374fd"
  },
  "scripts/verify-xeno-trials-runtime-completion-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "f6669201cab678f4183fe910cf43df78fe019dba9875192df3db68aa35c5ee5d",
    "currentSha256": "1d790aee13980bc91693aa7f03a2420a956ddde762fb5a5eea7b6abd6eb4efc3"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "previousSha256": "e73c3b85d712f605878d062355557d5ad898f6b8380bab959cef6ef653a63c0e",
    "currentSha256": "efd03c160bef3d4fc96c7480087e736b99b6a2e9aafbe88db0d03f486e9c475e"
  },
  "src/xeno-trials-action-atlas-v199.js": {
    "kind": "runtime",
    "previousSha256": "09c74da23c48e43ef5bae370ae4ad5d0acc8b91430180e256dad3174c4e9f719",
    "currentSha256": "8e1eda7b2baabbc380c868eba4c59293afceb7c3458a46bcdc6f62b1d1e28141"
  },
  "src/xeno-trials-animation-coverage-v199.js": {
    "kind": "runtime",
    "previousSha256": "ab093549669c287ae3506055cfc99a32bad0dbedfb289969c8f5e1adb1b284f1",
    "currentSha256": "0331c15ba3e4bb62768002693021ed6c4b4b871d81ac038917f41984d2613c20"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "previousSha256": "d14b2d0fe9edd877bd90059e6112d10203c1faf528fed159730a39941a91f4ed",
    "currentSha256": "2baeb561c78a7db4f5d33e7d15671a844f4b688b2b0aee88219eff22004074d6"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "previousSha256": "1b0198ef0004658fca49773ec0cd244da6608d70f6df87c8c9b44daa88d497e9",
    "currentSha256": "8048575ec19093b452e2acb5e0414bb9e3861ad7c7db2a983ea83199136e4375"
  },
  "src/xeno-trials-rig-v154.js": {
    "kind": "runtime",
    "previousSha256": "883de966d4a15fa2a8919c53e846a74a67116ff71e27993eb4f4e1acefcdae4a",
    "currentSha256": "014776eebd5748f5b1b16fd04c0e1cad419e4a7a497b2f922f86817801be887f"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "a2260d10671d81e14ed2c5418ac2c13cab94e84f68b5bbd8d47fa06fcfecd7ed",
    "currentSha256": "afe24a25866e8ff5e1ffafae522be49493391e477fce10bd37abfe2428ddc0e2"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "f7740785d8023632a1c15064afa32b013d316a54e96677e3d152d34b53136f67",
    "currentSha256": "ee90244bfe1a80290197d17533bc34660637c30632c1f7623eff6ab85c3e3ca0"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "4151bf5abd87e94bdd7aad627e3f0b0346e368987eca27d2ae3f09c2c5a71ab6",
    "currentSha256": "adf22180e5c0cd959206a33d385a53fa262bfb9d94722642d7a8680536adb438"
  },
  "xeno-trials-v96.css": {
    "kind": "runtime",
    "previousSha256": "0d16f12a4202b4f61960c6f8e1e52d9e8c30ae995eba67a9923a662ff38e7a62",
    "currentSha256": "24344bdeced7e1602eab98a4df38e1d06ba92ef7d27f0a3a2a07f7dd0e4a027e"
  }
});
export const XENO_PRIORITIES_NEW_INPUTS_V204 = freezeReceipts({
  "assets/openai/sprites/xeno-trials-v204/import-xeno-kingrogue-ground-special-sheet.png": {
    "kind": "asset",
    "sha256": "b6fb2973f92c3392d311c4c66d2d4b2055f41093f1022459de6651c4bb09e29a"
  },
  "assets/openai/sprites/xeno-trials-v204/smasher-air-combat-sheet.png": {
    "kind": "asset",
    "sha256": "8ea5efeefefc23f6b411c6051303476408facb2e9a7d775dc24932e58f2b334d"
  },
  "assets/openai/sprites/xeno-trials-v204/synth-containment-air-combat-sheet.png": {
    "kind": "asset",
    "sha256": "c9de0c7c39f3357f5aa565306cc5dd5e0162ba46e20054c33cb3ceff83f96292"
  },
  "assets/openai/sprites/xeno-trials-v204/synth-tecsek-ground-special-sheet.png": {
    "kind": "asset",
    "sha256": "5deb0b2f4ea03d3415bcb086db9f87e859d8c7d091c24a25c6aecc183f6329b0"
  },
  "scripts/public-xeno-priority-admissions-v204.mjs": {
    "kind": "verifier",
    "sha256": "d4368f75b2c98bda7719bdd11d85308e1d223fdae3ed711aa3020f0542b166f4"
  },
  "scripts/verify-xeno-priorities-audit-v204.mjs": {
    "kind": "verifier",
    "sha256": "1fc34befc13f1fbfe9319e0e1fc7ef6745d34b0d0d1f7f9253b241a9639eddef"
  },
  "scripts/verify-xeno-trials-defense-v204.mjs": {
    "kind": "verifier",
    "sha256": "918e064a6840fe0440e0a1c35e28fd8746ac5a69fb8cf840551b09472ff46804"
  },
  "scripts/verify-xeno-trials-priority-actions-v204.mjs": {
    "kind": "verifier",
    "sha256": "60b321291a062f2acbb0ccab790804cf11a89a144c677c98584ce1cd2835acac"
  },
  "scripts/verify-xeno-trials-purge-presentation-v204.mjs": {
    "kind": "verifier",
    "sha256": "48044d07937fdf04ad22b965a47729ed107118c2c9ce36166d903229c5229af4"
  },
  "src/xeno-trials-defense-data-v204.js": {
    "kind": "runtime",
    "sha256": "e9573d170ee93a08c6d5dbc43b38d68aedf7f754455360fb39349443675a645b"
  },
  "src/xeno-trials-priority-air-data-v204.js": {
    "kind": "runtime",
    "sha256": "78977bc0852186988089648eca1138b94e27f515641bbfc8116e62a92a466250"
  },
  "src/xeno-trials-priority-ground-data-v204.js": {
    "kind": "runtime",
    "sha256": "379417a5ee05ac5d712c6e134a6c35ba06ea25230c32b6d05bea235eaf9f3254"
  },
  "src/xeno-trials-purge-presentation-v204.js": {
    "kind": "runtime",
    "sha256": "bc92b566360aa7e7022f31d151bacb371482c26ac1e109cea07c778dcbd44fdb"
  }
});

export function reviewedXenoPrioritiesDigestV204(path, endpointV203) {
  if (!Object.hasOwn(XENO_PRIORITIES_SUCCESSORS_V204, path)) return endpointV203;
  const receipt = XENO_PRIORITIES_SUCCESSORS_V204[path];
  assert.equal(endpointV203, receipt.previousSha256, 'Incorrect V203 endpoint for V204: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V204 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V204 successor: ' + path);
  return receipt.currentSha256;
}

export function xenoPrioritiesRuntimeSourcesV204(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_SUCCESSORS_V204)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.currentSha256)
      assert.equal(result[path], receipt.previousSha256, 'Incorrect V204 runtime view predecessor: ' + path);
    result[path] = receipt.currentSha256;
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_NEW_INPUTS_V204)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined)
      assert.equal(result[path], receipt.sha256, 'Incorrect new V204 runtime digest: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoPrioritiesV204(readSource = readRepository) {
  const successors = Object.entries(XENO_PRIORITIES_SUCCESSORS_V204);
  const inputs = Object.entries(XENO_PRIORITIES_NEW_INPUTS_V204);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V204 inputs await final source freeze');
  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V204 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-priorities-v204.mjs'), 'V204 cannot admit its own bytes');

  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V204 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedXenoPrioritiesDigestV204(path, receipt.previousSha256),
      'Unreviewed V204 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && kinds.has(receipt.kind) && validHash(receipt.sha256), 'Invalid V204 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V204 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V204)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  return Object.freeze({ baselineCommit: XENO_PRIORITIES_BASELINE_V204, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
