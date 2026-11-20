/** Source admission for the priority Trials stages, anchored to the public V197 build. */
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

export const XENO_PRIORITY_STAGES_BASELINE_V198 = '5a41ed1fa6e8bfc9dcbc4ef19410bd622b862abc';
export const XENO_PRIORITY_STAGES_HISTORICAL_DECLARATIONS_V198 = freezeReceipts({
  "scripts/audit-xeno-priorities-v197.mjs": {
    "start": "export const XENO_PRIORITIES_BASELINE_V197",
    "end": "\nexport function reviewedXenoPrioritiesDigestV197",
    "sha256": "01b57e1f27f9e5112e56422fbc104e390c0728c9e0d1b18a980def8425a66276"
  }
});

export const XENO_PRIORITY_STAGES_SUCCESSORS_V198 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "7d6fe707f3cda125d5c49be8f3436368d34982965dd6ee566dfb8495bd6cb14d",
    "currentSha256": "69fc3bbd93ec61b58856fd09184c37ca2eb57031af88e58562f1544f9dff2208"
  },
  "scripts/audit-xeno-priorities-v197.mjs": {
    "kind": "verifier",
    "previousSha256": "20b994e74143c4f7a7f2d5034afa3f9ec0a3efb3c0ffeb49fdd2f12dda4704fb",
    "currentSha256": "93c27a331f1a4c7c3c7485b9c9b80a0f6b209084cd3ec93beb9126992b5a51a4"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "5c0cf6e9e93f94e1962b764e618b32fe469c700df475fa6a5c50f32955603660",
    "currentSha256": "48978c385211ea39f4c42a793e684ee80db97d6cad0ba3f43010e83a436d2626"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "75c1b6ffaf75508fa00f2a3b48119e02ff266e528937167c32ffa56a9a2c93ca",
    "currentSha256": "7d8fba924e32b147db8a44db3eb28f309f8e6ace6b0714824916e189ca3801af"
  },
  "scripts/public-xeno-referenced-stage-admissions-v196.mjs": {
    "kind": "verifier",
    "previousSha256": "cded695cf139677b5b85f69f5bf7aa87aa4f3ce9ed542c49b786803dfc413a17",
    "currentSha256": "ae6beee22bb5c8626980f610376e7d210f1d557b1dd095aa5564f407bdd3e520"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "d8283b571ed048028c5aefad7266c24897db89a8b92efb687be9f08ee59f8949",
    "currentSha256": "48436eca414f432c20165c267e15b960fff113c1537cd1ec1d5cd7e1f06dcb27"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "eb686f0c5c54da5c2d14da0c7eefbe9a283a6135472dd696f020d3ed8d724bb7",
    "currentSha256": "daaca906a494123f46960047d9d844290ceffe47a229778dfd6cd628b7a9ff16"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "718f4c52f63bddae4228be59b379efd11d4ca5580c7f592d00d026e9da45a79b",
    "currentSha256": "fdc52416387449fb3a7d1dc9e9405004f95e97d19168cace9191587c14f631c1"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "858d513a90de0206e81dc9f7bf1c52690203240d490c2a822751dd414d270415",
    "currentSha256": "ef2b12b104389bea1cde3472439244ab9d53a73045224f322b8dc5aec41d0b3e"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "d42ac69dea6b0987bfb47cbbf65195aa1c8c0cf34c26a770def39b51c6dd17b9",
    "currentSha256": "ebef72c6ac46f04303f4acc69951e169f2a997c1d75f2f58b2186de393e7153a"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "832e2e62ef41aa175fb19c12cb203ad1e5f714ac9818fde0bd1a1c005f5bdb0b",
    "currentSha256": "e470012d6fae33b1a16cb2bd8bca3ad34b856299ffafbcd4e64f66df8bb483aa"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "c0719fb66c6d5955acded5c9a8153a9ac281b9c8f517b555f7957f655cb77899",
    "currentSha256": "6531bf5b28d7c6398e54409846f72338ef4012df169ebfd154155227ef076a7a"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "442df82c2002a744fbff5e7ff58a50448cd995c7b2c3e0ef44e1540e069100c6",
    "currentSha256": "79075fb9f044845292d12022c3b6adfbbdf86e13970f33cbadeeeeec7b3484d9"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "8348607ce936320d8dee48f7757997d4d2bac36e84bbf5601114b3e1f17534f9",
    "currentSha256": "e1ef14fb4d88fe3f7c36463de21e32c2155eb7ae3082e2f80b195330072265a6"
  },
  "scripts/verify-xeno-priorities-audit-v197.mjs": {
    "kind": "verifier",
    "previousSha256": "1ac8750be9c063b0cc827ef085a9406b0da06425c4422ff7b773ea214df0f0b2",
    "currentSha256": "e45c825c7e331fc386624b538fee6edc9745453d1c6d59c8f249ec4bafcb4f80"
  },
  "scripts/verify-xeno-referenced-film-stages-v196.mjs": {
    "kind": "verifier",
    "previousSha256": "baabf763a223de4b2faa8e1a9decfa55685eaf3ec5f31be22855dc98fd7d11b2",
    "currentSha256": "086dd632ffdbdf607f9d0d3a7a5b37481d95eb65a51bedf0cf6684e555ffe392"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "verifier",
    "previousSha256": "326ec961e8316db9c29e045f92ecd0949d9ee46641c1112848ef9c9f9952265d",
    "currentSha256": "451e280f7e5e9b2299af1f2b23b92b771dcd2c1cf47c2402fc43c602ac6586e5"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "4c9f7f21a2e6ad11faf9425c061fc7bcc4208eef47ccb5311c544570d6d5f0f8",
    "currentSha256": "f1eb0afc62690c761df05868daa3b7288e2656639be357f7c387a15f0575e6b3"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "3b73e06d0ab57d575f2e7cc6f7dd90447d1b6454c464005d8a9fbe03ff42ae8b",
    "currentSha256": "580901aab92be7a6688a68015550159aa4aeb6a0dfa755e6decea473c03ae248"
  },
  "scripts/verify-xeno-trials-franchise-stage-render-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "760d346b30fc8824de1a796b44d073287f1ee4ad6c4d769f54ed7fd326757265",
    "currentSha256": "db1309047c14fabcaeacfe70c07340b16400cc0761716d19343b1b9b2caccf38"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "previousSha256": "c24cd72c9f2554d74b2602bb1972e056e1b19dcfb1d38119acde46240dfadb2a",
    "currentSha256": "99ab7e46fd2d380b36886531bd02e872bf8e05771a47eba8dabcf309663d88f0"
  },
  "src/xeno-trials-data-v96.js": {
    "kind": "runtime",
    "previousSha256": "4395f26a897fd0726a8cf06bcd4932e5faa643c4c16d6e0983f66b3fad9da153",
    "currentSha256": "7ecf7ca89a9532f949751b6a69bca358a19654dde90499de4f08ba74fdc3a2fc"
  },
  "src/xeno-trials-franchise-stage-render-v192.js": {
    "kind": "runtime",
    "previousSha256": "ddcccb371d93541bda9ea21b853b491fa6eeff79f0677352498b021f4c1e2eb6",
    "currentSha256": "9540ed7ba3e952ffb5d9a891db508dc12a174a452bd2bb5041a7a8ba9bb06d1a"
  },
  "src/xeno-trials-franchise-stage-scenes-v192.js": {
    "kind": "runtime",
    "previousSha256": "39cc7a8c46f186ce1db6efcea91a39ae487bdc53be80c85529680c2f2d82f48d",
    "currentSha256": "ba82c9a0b7f6eeeff4d160ecc54b45b402a94a47ff75773679de7f15135fd467"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "c91a7fe7ac17c6b32200f743c3af51765a84769c64537fb9908e8b9a07267be5",
    "currentSha256": "e041ac1e4b8af2f3ab96dbecb3f9a22e7c2450abf99706e45357491148c81ddc"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "2923ea1ab491df750995833c0a61040e1211edb3edde7eee82f7bf25555baa92",
    "currentSha256": "c7df0b9fe4ff8e1ebc7707c0d5a770e77835c57058555fa5b246e6e5045154a8"
  }
});
export const XENO_PRIORITY_STAGES_NEW_INPUTS_V198 = freezeReceipts({
  "assets/openai/stages/xeno-trials-v198/arcade-containment-laboratory-base.png": {
    "kind": "asset",
    "sha256": "a44e4ca114def530715696203b3068a66344aafbfdd8908bbf747f82717b380c"
  },
  "assets/openai/stages/xeno-trials-v198/arcade-containment-laboratory-props.png": {
    "kind": "asset",
    "sha256": "ec6c7e1f46d5c0c1a86c167ad8db40186c9c93a90c053c0585d4d51c09bd06a2"
  },
  "assets/openai/stages/xeno-trials-v198/covenant-maintenance-workshop-base.png": {
    "kind": "asset",
    "sha256": "1bf5b5c13704a57b84c27583dc6dcfafabc75ee02ee649a87c298fb74ff9cb9a"
  },
  "assets/openai/stages/xeno-trials-v198/covenant-maintenance-workshop-props.png": {
    "kind": "asset",
    "sha256": "ef7cb7705dca17291f99db26fbbb7337a9a06be6588ad13a5a18836e88fe2af2"
  },
  "assets/openai/stages/xeno-trials-v198/hadleys-hope-service-corridor-base.png": {
    "kind": "asset",
    "sha256": "b40c979eddf50fca0e704966997879823a439ee886ab1819d7799a55215c047d"
  },
  "assets/openai/stages/xeno-trials-v198/hadleys-hope-service-corridor-props.png": {
    "kind": "asset",
    "sha256": "01fa05c9a37019fe4e887aa761ce2633808246751be4f36c0eae46de230d2261"
  },
  "assets/openai/stages/xeno-trials-v198/nostromo-maintenance-base.png": {
    "kind": "asset",
    "sha256": "6927406118ce70dc072df6698755d9bec0a271cc2da6cc2dd85c54e7723b5fc6"
  },
  "assets/openai/stages/xeno-trials-v198/nostromo-maintenance-props.png": {
    "kind": "asset",
    "sha256": "2c645da4ad18edfc85d91943a20dc8a52ba3860966afe42073c039d7999d2529"
  },
  "assets/openai/stages/xeno-trials-v198/sevastopol-synthetic-line-base.png": {
    "kind": "asset",
    "sha256": "980ac55bbab82dfd8c212b6d1ae7741c934d1b168f38561a429e33d48c1ac7f0"
  },
  "assets/openai/stages/xeno-trials-v198/sevastopol-synthetic-line-props.png": {
    "kind": "asset",
    "sha256": "f5af73d6c7fc19235f977dc2e5ac939bd958db3a0063a536dbc490d48c528667"
  },
  "scripts/public-xeno-priority-stage-admissions-v198.mjs": {
    "kind": "verifier",
    "sha256": "7573cf9605e11d430fba8bc003463ff0a9f9b2e56f3a5f9b7063772d89a86dd1"
  },
  "scripts/verify-xeno-priority-stages-audit-v198.mjs": {
    "kind": "verifier",
    "sha256": "011369c697a81cecb6e818fc20346c90bfc3d343485d8cf46963573348615a81"
  },
  "scripts/verify-xeno-priority-stages-v198.mjs": {
    "kind": "verifier",
    "sha256": "9410f97a837195ab924038c86e91cdbfda0269dbe05407e78ce95908d3dab90c"
  },
  "src/xeno-trials-priority-stages-v198.js": {
    "kind": "runtime",
    "sha256": "d5d36a1bbf82826004749cce9d3f89de5f9d2da4a6d9799251aabe2d37fcde80"
  }
});

export function reviewedXenoPriorityStagesDigestV198(path, endpointV197) {
  if (!Object.hasOwn(XENO_PRIORITY_STAGES_SUCCESSORS_V198, path)) return endpointV197;
  const receipt = XENO_PRIORITY_STAGES_SUCCESSORS_V198[path];
  assert.equal(endpointV197, receipt.previousSha256, 'Incorrect V197 endpoint for V198: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V198 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V198 successor: ' + path);
  return receipt.currentSha256;
}

export function xenoPriorityStagesRuntimeSourcesV198(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_PRIORITY_STAGES_SUCCESSORS_V198)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.currentSha256)
      assert.equal(result[path], receipt.previousSha256, 'Incorrect V198 runtime view predecessor: ' + path);
    result[path] = receipt.currentSha256;
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITY_STAGES_NEW_INPUTS_V198)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined)
      assert.equal(result[path], receipt.sha256, 'Incorrect new V198 runtime digest: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoPriorityStagesV198(readSource = readRepository) {
  const successors = Object.entries(XENO_PRIORITY_STAGES_SUCCESSORS_V198);
  const inputs = Object.entries(XENO_PRIORITY_STAGES_NEW_INPUTS_V198);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V198 inputs await final source freeze');
  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V198 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-priority-stages-v198.mjs'), 'V198 cannot admit its own bytes');

  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V198 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedXenoPriorityStagesDigestV198(path, receipt.previousSha256),
      'Unreviewed V198 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && kinds.has(receipt.kind) && validHash(receipt.sha256), 'Invalid V198 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V198 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITY_STAGES_HISTORICAL_DECLARATIONS_V198)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  return Object.freeze({
    baselineCommit: XENO_PRIORITY_STAGES_BASELINE_V198,
    successors: successors.length,
    addedInputs: inputs.length,
    historicalResultsTransferred: false
  });
}
