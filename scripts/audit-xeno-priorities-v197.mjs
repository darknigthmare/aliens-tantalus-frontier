/** Source admission for the priority Trials systems, anchored to the public V196 build. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedXenoPriorityStagesDigestV198, verifyXenoPriorityStagesV198,
  xenoPriorityStagesRuntimeSourcesV198 } from './audit-xeno-priority-stages-v198.mjs';

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

export const XENO_PRIORITIES_BASELINE_V197 = 'bf9d2b9f00ce3562533a27451edb808c080a813d';
export const XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V197 = freezeReceipts({
  "scripts/audit-xeno-referenced-film-stages-v196.mjs": {
    "start": "export const REFERENCED_FILM_STAGES_BASELINE_V196",
    "end": "\nexport function reviewedReferencedFilmStagesDigestV196",
    "sha256": "cbba4ce376b5fc7dddc7300e060abb9d6fab8d3c35e304ea872d7f4d8e1bb0a3"
  }
});

export const XENO_PRIORITIES_SUCCESSORS_V197 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "c63213a49c770bca3f666c9cba5eb523c10854329ce015aa9fa78b6972a322b0",
    "currentSha256": "7d6fe707f3cda125d5c49be8f3436368d34982965dd6ee566dfb8495bd6cb14d"
  },
  "scripts/audit-xeno-referenced-film-stages-v196.mjs": {
    "kind": "verifier",
    "previousSha256": "d6e4f7829b77eb41e5c489ef57ed16258cb988d7711cfe457d9e39d5ad26179e",
    "currentSha256": "09bd7c68ed93746b3fb1381449cd295ff43b2213047191874c09f37f73eb2f0c"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "831980ae9f2ad588fc834e5b251402829a73ed5a6476609374e63ec39a32e1a3",
    "currentSha256": "5c0cf6e9e93f94e1962b764e618b32fe469c700df475fa6a5c50f32955603660"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "e1990d727776385aa0e570e68d55149ae0982d4e6eab32d0c785b62bb627cf65",
    "currentSha256": "75c1b6ffaf75508fa00f2a3b48119e02ff266e528937167c32ffa56a9a2c93ca"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "825ae35ef41980b53f2b0a6ed99b8aaa0b42c41bd88157d7c4e837db3becd7c4",
    "currentSha256": "d8283b571ed048028c5aefad7266c24897db89a8b92efb687be9f08ee59f8949"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "4a9963458619732cfd63ce0bebb756e7fef36376f6fd28a5c66daf7e10f7e182",
    "currentSha256": "eb686f0c5c54da5c2d14da0c7eefbe9a283a6135472dd696f020d3ed8d724bb7"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "9b6efc2e0e351fb7ac02f62a9165af93d6ced7a51463688e61da3231c36d17b2",
    "currentSha256": "718f4c52f63bddae4228be59b379efd11d4ca5580c7f592d00d026e9da45a79b"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "7e5d92fcd38da27ba4ef7e9f102490408d572d5d59c28966ac8d82185b22a64f",
    "currentSha256": "858d513a90de0206e81dc9f7bf1c52690203240d490c2a822751dd414d270415"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "beccff93644e9f94e36aea29d22795cd9ab3df00eb932b4406a079cb741c3ec7",
    "currentSha256": "d42ac69dea6b0987bfb47cbbf65195aa1c8c0cf34c26a770def39b51c6dd17b9"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "a6c01b97fe1467ccf02a350a84c17cf47fbe48b476d11d98cda2546ae2d4c27c",
    "currentSha256": "832e2e62ef41aa175fb19c12cb203ad1e5f714ac9818fde0bd1a1c005f5bdb0b"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "e33946326ea9165aa1688ada558c718f2028830565b497a6bcf198875a613c4b",
    "currentSha256": "c0719fb66c6d5955acded5c9a8153a9ac281b9c8f517b555f7957f655cb77899"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "9a3bf59310fb6cf6748db633966f647b66742d0724ebbdd477d84c303e956005",
    "currentSha256": "442df82c2002a744fbff5e7ff58a50448cd995c7b2c3e0ef44e1540e069100c6"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "6c41fc7ce04bdec060f33e8320002e5479974259e448435e86d9bf70951a749c",
    "currentSha256": "8348607ce936320d8dee48f7757997d4d2bac36e84bbf5601114b3e1f17534f9"
  },
  "scripts/verify-xeno-referenced-film-stages-audit-v196.mjs": {
    "kind": "verifier",
    "previousSha256": "d8bdb296426e9e46785c69b4ca636f3772dabf7b2c16e8877dab8ccd784e553a",
    "currentSha256": "4a096bc7770240b3d35fa9430153e1f1abe9163c411e7d20009b2d28bb7b9565"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "verifier",
    "previousSha256": "76cf479d73c6dbb9faa8ba51d408a4317eb4ba4c0bf89eb28a631d144ce25a75",
    "currentSha256": "326ec961e8316db9c29e045f92ecd0949d9ee46641c1112848ef9c9f9952265d"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "a7c15792a337cee2d84c665065ba61afd4d1309fa042a4b98864d8470b447d3b",
    "currentSha256": "4c9f7f21a2e6ad11faf9425c061fc7bcc4208eef47ccb5311c544570d6d5f0f8"
  },
  "scripts/verify-xeno-trials-animation-coverage-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "cc7804417b2989e4721f017ae41774771c797f80413fb555a270d405c3c44114",
    "currentSha256": "6b0d3a99128faa4e068709e53a231df1721aafa8bb5c3c26a4a61bf5f327ed94"
  },
  "scripts/verify-xeno-trials-animation-ui-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "88945758336563bf0573453c4eff4a1082da769de946c4389153db4ae8f2cf8b",
    "currentSha256": "ad85575477c0725f700548fb25bd005e4fd1a700dafb422cfa76333765dcc8ee"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "012788b6f711fd33624c3d2a771d48a18f220ed4b650efa7aa643a04ede26a6a",
    "currentSha256": "3b73e06d0ab57d575f2e7cc6f7dd90447d1b6454c464005d8a9fbe03ff42ae8b"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "previousSha256": "faa06ef1c24f69d968d266718c79591e088f3e26da51abe4f8d497ddfbad9ae0",
    "currentSha256": "c24cd72c9f2554d74b2602bb1972e056e1b19dcfb1d38119acde46240dfadb2a"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "previousSha256": "5ebe7bcf0d67445a7e90e0df02786aa7d939711f109694ba3522be73ccbf54a5",
    "currentSha256": "9d2384a6e568d63ecc1d0280e03bf6ed6b166b9a86d227dd7e912d81920bc8bc"
  },
  "src/xeno-trials-rig-v154.js": {
    "kind": "runtime",
    "previousSha256": "c380d8b4613ef37cb978880050c37a183b4113bfa7e833817810fc95ef1a93a5",
    "currentSha256": "f45cdc1df35e803238f552cc1eddd64ce77c15ed9fe32a4db8083dd819d71d68"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "811d2c4ec16e19ab8fe809c2be657128bc19086074ba73f4ea9f2d96c51dd211",
    "currentSha256": "c91a7fe7ac17c6b32200f743c3af51765a84769c64537fb9908e8b9a07267be5"
  },
  "src/xeno-trials-sprite-atlas-v191.js": {
    "kind": "runtime",
    "previousSha256": "c47885f2f0ca45838affa5be93e5a576c517f093a8ef3be0122e5b95ca04c89e",
    "currentSha256": "360521c5189ecf8dc4ff474d6a233326631aa6e61b69594b28123e26a1c9ca21"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "4bfbc4431e67f76a53d96de8c34fcbb9f046a5c3576a8d1bb18f774ab85f9375",
    "currentSha256": "0b1a580451f07f01a0ebe1b0f45a67b1cf6170ebf649566be9f6322b639324b4"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "d94603f7d8c03b99a41d3c21c3a2c621997e01362a551005a072bb8a6c355e93",
    "currentSha256": "2923ea1ab491df750995833c0a61040e1211edb3edde7eee82f7bf25555baa92"
  }
});
export const XENO_PRIORITIES_NEW_INPUTS_V197 = freezeReceipts({
  "assets/openai/sprites/xeno-trials-v197/import-game-afe2-warden-combat-sheet.png": {
    "kind": "asset",
    "sha256": "9451b447ff81bb7331783316931551eec5cc513bd07991c7ab28917ec9a85a98"
  },
  "assets/openai/sprites/xeno-trials-v197/synth-guard-combat-sheet.png": {
    "kind": "asset",
    "sha256": "ad520ee97bb87cf25f49e8b2d7b352b7a10398c797e42c7d322f0188ee95b767"
  },
  "assets/openai/sprites/xeno-trials-v197/synth-trooper-combat-sheet.png": {
    "kind": "asset",
    "sha256": "6975bc64a23b6ad2376bc073f6288a937de06501f906ab722128ac39e96b2dc3"
  },
  "scripts/public-xeno-sprite-admissions-v197.mjs": {
    "kind": "verifier",
    "sha256": "9fbfb75e379c54ad3d9170d16f53572e6498a55ae200af6de60482e30abef352"
  },
  "scripts/verify-xeno-priorities-audit-v197.mjs": {
    "kind": "verifier",
    "sha256": "1ac8750be9c063b0cc827ef085a9406b0da06425c4422ff7b773ea214df0f0b2"
  },
  "scripts/verify-xeno-trials-duel-checkpoint-v197.mjs": {
    "kind": "verifier",
    "sha256": "d146516d5c695314ac65295301a7f49c7e89ac9517d55b850a442236e3cd2186"
  },
  "scripts/verify-xeno-trials-pilot-sequences-v197.mjs": {
    "kind": "verifier",
    "sha256": "bbcd1f814cd6384cb11632ed2ef1cef1d13091f31885856d7ca5966b5d2ec453"
  },
  "scripts/verify-xeno-trials-priorities-v197.mjs": {
    "kind": "verifier",
    "sha256": "7abd7a79566cfbbf24006f3f3924f98f9b3e2d32e22878c936b1a056f7eb1b50"
  },
  "scripts/verify-xeno-trials-rig-v197.mjs": {
    "kind": "verifier",
    "sha256": "11e3407acb6920169f491e139a966c3bccc025cc97bd772dbe3e496f6f62d13e"
  },
  "src/xeno-trials-animation-coverage-v197.js": {
    "kind": "runtime",
    "sha256": "f44096781a9361e446a8d9f910746b2b326bc7a00f390a83748499aafbde1f98"
  },
  "src/xeno-trials-duel-checkpoint-v197.js": {
    "kind": "runtime",
    "sha256": "e04a7b245d34def62da90057de876147ed5c7f33d390f870c648b5d2e6bc61fb"
  },
  "src/xeno-trials-pilot-sequences-v197.js": {
    "kind": "runtime",
    "sha256": "32336bc74e228cb36415260dc2526d36fcda0988abc809e09aa4c1211cad7f47"
  },
  "src/xeno-trials-rig-data-v197.js": {
    "kind": "runtime",
    "sha256": "a7603581fb613c389d8ba4241c740f621843ecb5eb41b5a7d8de886aa19064fa"
  },
  "src/xeno-trials-sprite-combat-data-v197.js": {
    "kind": "runtime",
    "sha256": "496f3d52824e675ade0ca492ba9bc8b14a441691fc79f51a290f899bce31c6f6"
  }
});

export function reviewedXenoPrioritiesDigestV197(path, endpointV196) {
  if (!Object.hasOwn(XENO_PRIORITIES_SUCCESSORS_V197, path)) return reviewedXenoPriorityStagesDigestV198(path, endpointV196);
  const receipt = XENO_PRIORITIES_SUCCESSORS_V197[path];
  assert.equal(endpointV196, receipt.previousSha256, 'Incorrect V196 endpoint for V197: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V197 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V197 successor: ' + path);
  return reviewedXenoPriorityStagesDigestV198(path, receipt.currentSha256);
}

export function xenoPrioritiesRuntimeSourcesV197(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_SUCCESSORS_V197)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoPriorityStagesDigestV198(path, receipt.currentSha256);
    if (result[path] !== undefined)
      assert.ok([receipt.previousSha256, receipt.currentSha256, current].includes(result[path]),
        'Incorrect V197 runtime view predecessor: ' + path);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_NEW_INPUTS_V197)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoPriorityStagesDigestV198(path, receipt.sha256);
    if (result[path] !== undefined)
      assert.ok([receipt.sha256, current].includes(result[path]), 'Incorrect new V197 runtime digest: ' + path);
    result[path] = current;
  }
  return xenoPriorityStagesRuntimeSourcesV198(result);
}

export function verifyXenoPrioritiesV197(readSource = readRepository) {
  const successors = Object.entries(XENO_PRIORITIES_SUCCESSORS_V197);
  const inputs = Object.entries(XENO_PRIORITIES_NEW_INPUTS_V197);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V197 inputs await final source freeze');
  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V197 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-priorities-v197.mjs'), 'V197 cannot admit its own bytes');

  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V197 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedXenoPrioritiesDigestV197(path, receipt.previousSha256),
      'Unreviewed V197 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && kinds.has(receipt.kind) && validHash(receipt.sha256), 'Invalid V197 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), reviewedXenoPriorityStagesDigestV198(path, receipt.sha256), 'Unreviewed V197 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V197)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  verifyXenoPriorityStagesV198(readSource);
  return Object.freeze({
    baselineCommit: XENO_PRIORITIES_BASELINE_V197,
    successors: successors.length,
    addedInputs: inputs.length,
    historicalResultsTransferred: false
  });
}
