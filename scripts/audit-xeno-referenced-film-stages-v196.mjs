/** Source admission for the referenced film stages, anchored to V195. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedXenoPrioritiesDigestV197, verifyXenoPrioritiesV197,
  xenoPrioritiesRuntimeSourcesV197 } from './audit-xeno-priorities-v197.mjs';

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

export const REFERENCED_FILM_STAGES_BASELINE_V196 = '371853ce7e00180c26bd675850cf73bfdcae7d4e';
export const REFERENCED_FILM_STAGES_HISTORICAL_DECLARATIONS_V196 = freezeReceipts({
  'scripts/audit-xeno-stage-classification-v195.mjs': {
    start: 'export const STAGE_CLASSIFICATION_BASELINE_V195',
    end: '\nexport function reviewedStageClassificationDigestV195',
    sha256: '04f516d641a11b2a58ffb6a9347076c543515c68df98087a4e3fac58c8ee25bc'
  }
});

export const REFERENCED_FILM_STAGES_SUCCESSORS_V196 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "5b4966f510544fd11f875aebe1e35f91b050c78d19fd73bc84b900bd49f7db4b",
    "currentSha256": "c63213a49c770bca3f666c9cba5eb523c10854329ce015aa9fa78b6972a322b0"
  },
  "scripts/audit-xeno-stage-classification-v195.mjs": {
    "kind": "verifier",
    "previousSha256": "6095719a0218f158b46849c23740f41c655b2fdee021d2e71b443835f4b5bede",
    "currentSha256": "83d7e10a8bc1470fc34f820895c9fc53a40c62e1d26f51102fc54875e5f5f07a"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "1bca5d7cd1737eccfacd82fc0297004e59adf279cf6e02abfd19a123992e513d",
    "currentSha256": "831980ae9f2ad588fc834e5b251402829a73ed5a6476609374e63ec39a32e1a3"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "79cc48524255048f01ab1be8629fc121f731f04c232a0c0ba9bdec7c216b4678",
    "currentSha256": "e1990d727776385aa0e570e68d55149ae0982d4e6eab32d0c785b62bb627cf65"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "90a8a7ca78bd37090fa874bc7dceed579e270cd0dde0401f189a08fe90ae9e42",
    "currentSha256": "825ae35ef41980b53f2b0a6ed99b8aaa0b42c41bd88157d7c4e837db3becd7c4"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "42b0ccc673175b75239051783d0c9680f23b1c9d4453d18e5cfeb4d2270752cd",
    "currentSha256": "4a9963458619732cfd63ce0bebb756e7fef36376f6fd28a5c66daf7e10f7e182"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "3d74468054d983cffa97b0c9b0ca5f30d29c582bdfb937da19df29aee1d628c1",
    "currentSha256": "9b6efc2e0e351fb7ac02f62a9165af93d6ced7a51463688e61da3231c36d17b2"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "9749281ae5158e47a75798554d6cadf4407faa7bea40e81b3f22f734390c52f2",
    "currentSha256": "7e5d92fcd38da27ba4ef7e9f102490408d572d5d59c28966ac8d82185b22a64f"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "4b20af48d29fa7a602a46cb885ed428dbf9e9ceabdbd9ef0d455d01441dac953",
    "currentSha256": "beccff93644e9f94e36aea29d22795cd9ab3df00eb932b4406a079cb741c3ec7"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "2d6ae67c96ad1bc63586c7cf8f72e9ecc9dc98797d2f6c8f5afe196c384f9d13",
    "currentSha256": "a6c01b97fe1467ccf02a350a84c17cf47fbe48b476d11d98cda2546ae2d4c27c"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "da4990e7e42d4bf3b9cb8dc44fa9f7b14ce69d8bda6a6f8bf167f2994bac86c7",
    "currentSha256": "e33946326ea9165aa1688ada558c718f2028830565b497a6bcf198875a613c4b"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "f67c80a34ae3cd04a9cd70d9a9957513c0783be138b1cb38fcb2281c8f225ff9",
    "currentSha256": "9a3bf59310fb6cf6748db633966f647b66742d0724ebbdd477d84c303e956005"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "28b18ecb7dfd4532b257e95118946be0d016efd95a2b29099fddd03ccede798d",
    "currentSha256": "6c41fc7ce04bdec060f33e8320002e5479974259e448435e86d9bf70951a749c"
  },
  "scripts/verify-xeno-iconic-stages-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "5697a9caef6652e697ae9ada4af6c414ad36aab8bb38ff3fd092d1844d3e34ef",
    "currentSha256": "1d03fa14119333922b9f158f82935f6d2d0813e435b088df102086185d8f30d7"
  },
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "verifier",
    "previousSha256": "8d17c9620c8df0a828a6a4fc94220d729cd5daf639e700bd2ee8a5a787b36938",
    "currentSha256": "76cf479d73c6dbb9faa8ba51d408a4317eb4ba4c0bf89eb28a631d144ce25a75"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "2ba4904e76df75f29d93b8d0e6d887d15a9962e183552d046924a0f62b1106bb",
    "currentSha256": "a7c15792a337cee2d84c665065ba61afd4d1309fa042a4b98864d8470b447d3b"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "0634b9cabcd12581a142fe05f2face9606b80fc160ebdbb1ecb01bdf26a10721",
    "currentSha256": "012788b6f711fd33624c3d2a771d48a18f220ed4b650efa7aa643a04ede26a6a"
  },
  "scripts/verify-xeno-trials-franchise-stage-render-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "4a08a7ff45ad7f7020f86f85cb5afd11fb19cdf8a1e813f1f78b413afc3728e2",
    "currentSha256": "760d346b30fc8824de1a796b44d073287f1ee4ad6c4d769f54ed7fd326757265"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "previousSha256": "b20cf7bff73badd41d6ff98e08f38ad31b58e6f76345b6459e0e5b1406646668",
    "currentSha256": "faa06ef1c24f69d968d266718c79591e088f3e26da51abe4f8d497ddfbad9ae0"
  },
  "src/xeno-trials-data-v96.js": {
    "kind": "runtime",
    "previousSha256": "334acb5eca041cce9358281d485b7daa83c36558edc9beff621c696f71d19049",
    "currentSha256": "4395f26a897fd0726a8cf06bcd4932e5faa643c4c16d6e0983f66b3fad9da153"
  },
  "src/xeno-trials-franchise-stage-render-v192.js": {
    "kind": "runtime",
    "previousSha256": "2a1b3f7ea250a00c1b8c57e33d21cedc1fa6f66b192b975e42d65b7ded7176bc",
    "currentSha256": "ddcccb371d93541bda9ea21b853b491fa6eeff79f0677352498b021f4c1e2eb6"
  },
  "src/xeno-trials-franchise-stage-scenes-v192.js": {
    "kind": "runtime",
    "previousSha256": "af4a3f436a7493c296289a0d3c16940699f6738af8526978a2f074d969db6b8c",
    "currentSha256": "39cc7a8c46f186ce1db6efcea91a39ae487bdc53be80c85529680c2f2d82f48d"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "11c5a8a8970492cf0de11725e1fe82866cc65197d99dcc1b151faada1d8041c0",
    "currentSha256": "4bfbc4431e67f76a53d96de8c34fcbb9f046a5c3576a8d1bb18f774ab85f9375"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "f52deb7f6476f98fa8966d44de76e5e3533519c864fca40d7f72ad742edb4bba",
    "currentSha256": "d94603f7d8c03b99a41d3c21c3a2c621997e01362a551005a072bb8a6c355e93"
  }
});
export const REFERENCED_FILM_STAGES_NEW_INPUTS_V196 = freezeReceipts({
  "assets/openai/stages/xeno-trials-v196/bouvet-pyramid-entrance-base.png": {
    "kind": "asset",
    "sha256": "6baac5648547e2e71719cb0bbd2d2191c067dd485c36a1decc24a1a6065f087b"
  },
  "assets/openai/stages/xeno-trials-v196/bouvet-pyramid-entrance-props.png": {
    "kind": "asset",
    "sha256": "0fef55198979dcda7a3135b92cd5d77ab8ab1165229ca146a8cd45cd6f261fe7"
  },
  "assets/openai/stages/xeno-trials-v196/fiorina-evac-shore-base.png": {
    "kind": "asset",
    "sha256": "555a82671b747803a0afe6c6aa0fbfd4f30a48f0a14b88542e68a35da1132faf"
  },
  "assets/openai/stages/xeno-trials-v196/fiorina-evac-shore-props.png": {
    "kind": "asset",
    "sha256": "71d81abd7f6e6028e801faa28782083898aef8018ab0471456c01627d80d44e1"
  },
  "assets/openai/stages/xeno-trials-v196/hadleys-hope-operations-base.png": {
    "kind": "asset",
    "sha256": "ab217a69d6c20bb71e797d5c4b245129cc6fb4016aad79634809f62dcce9454e"
  },
  "assets/openai/stages/xeno-trials-v196/hadleys-hope-operations-props.png": {
    "kind": "asset",
    "sha256": "e6c33f9f82f64ea6a700564e89c66f444062a6034b14932716682cdd288f723a"
  },
  "assets/openai/stages/xeno-trials-v196/nostromo-bridge-base.png": {
    "kind": "asset",
    "sha256": "914de5e94c73c5aa605f454107aa05fc84cd459e8cc3715b2756829f256afbe8"
  },
  "assets/openai/stages/xeno-trials-v196/nostromo-bridge-props.png": {
    "kind": "asset",
    "sha256": "774b6ef3abe0842a69aeb1d69b8ac29f0187257ca4aa6f687e548e019ab4ae8d"
  },
  "assets/openai/stages/xeno-trials-v196/nostromo-infirmary-base.png": {
    "kind": "asset",
    "sha256": "184de9cb19260d6867b13082300aa1cdbe121e2815d7d75649ca0cf05ac13e79"
  },
  "assets/openai/stages/xeno-trials-v196/nostromo-infirmary-props.png": {
    "kind": "asset",
    "sha256": "6d6e6c457a68c8ccae9a671a0f7934fadd07215d1b0d1e5e0243a3662f9dcfa6"
  },
  "assets/openai/stages/xeno-trials-v196/renaissance-laboratory-base.png": {
    "kind": "asset",
    "sha256": "c8fe9a69d1a8b7d6eaac1e8ad7b611f0c84fd28d0a34f731f7ddbccff1dde41f"
  },
  "assets/openai/stages/xeno-trials-v196/renaissance-laboratory-props.png": {
    "kind": "asset",
    "sha256": "f2626015a4a25c27649cf63396c718b34db17ba43707a0b220673b4782a0fc1a"
  },
  "scripts/public-xeno-referenced-stage-admissions-v196.mjs": {
    "kind": "verifier",
    "sha256": "cded695cf139677b5b85f69f5bf7aa87aa4f3ce9ed542c49b786803dfc413a17"
  },
  "scripts/verify-xeno-referenced-film-stages-audit-v196.mjs": {
    "kind": "verifier",
    "sha256": "d8bdb296426e9e46785c69b4ca636f3772dabf7b2c16e8877dab8ccd784e553a"
  },
  "scripts/verify-xeno-referenced-film-stages-v196.mjs": {
    "kind": "verifier",
    "sha256": "baabf763a223de4b2faa8e1a9decfa55685eaf3ec5f31be22855dc98fd7d11b2"
  },
  "src/xeno-trials-referenced-stages-v196.js": {
    "kind": "runtime",
    "sha256": "99267149507e98e90d59c0fb6f52060640399d1c52bdb6f20d50ff13abf49f34"
  }
});

export function reviewedReferencedFilmStagesDigestV196(path, endpointV195) {
  if (!Object.hasOwn(REFERENCED_FILM_STAGES_SUCCESSORS_V196, path)) return reviewedXenoPrioritiesDigestV197(path, endpointV195);
  const receipt = REFERENCED_FILM_STAGES_SUCCESSORS_V196[path];
  assert.equal(endpointV195, receipt.previousSha256, 'Incorrect V195 endpoint for V196: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V196 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V196 successor: ' + path);
  return reviewedXenoPrioritiesDigestV197(path, receipt.currentSha256);
}

export function referencedFilmStagesRuntimeSourcesV196(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(REFERENCED_FILM_STAGES_SUCCESSORS_V196)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoPrioritiesDigestV197(path, receipt.currentSha256);
    if (result[path] !== undefined)
      assert.ok([receipt.previousSha256, receipt.currentSha256, current].includes(result[path]),
        'Incorrect V196 runtime view predecessor: ' + path);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(REFERENCED_FILM_STAGES_NEW_INPUTS_V196)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoPrioritiesDigestV197(path, receipt.sha256);
    if (result[path] !== undefined)
      assert.ok([receipt.sha256, current].includes(result[path]), 'Incorrect new V196 runtime digest: ' + path);
    result[path] = current;
  }
  return xenoPrioritiesRuntimeSourcesV197(result);
}

export function verifyReferencedFilmStagesV196(readSource = readRepository) {
  const successors = Object.entries(REFERENCED_FILM_STAGES_SUCCESSORS_V196);
  const inputs = Object.entries(REFERENCED_FILM_STAGES_NEW_INPUTS_V196);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V196 inputs await final source freeze');
  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V196 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-referenced-film-stages-v196.mjs'), 'V196 cannot admit its own bytes');

  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V196 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedReferencedFilmStagesDigestV196(path, receipt.previousSha256),
      'Unreviewed V196 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && kinds.has(receipt.kind) && validHash(receipt.sha256), 'Invalid V196 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), reviewedXenoPrioritiesDigestV197(path, receipt.sha256), 'Unreviewed V196 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(REFERENCED_FILM_STAGES_HISTORICAL_DECLARATIONS_V196)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  verifyXenoPrioritiesV197(readSource);
  return Object.freeze({
    baselineCommit: REFERENCED_FILM_STAGES_BASELINE_V196,
    successors: successors.length,
    addedInputs: inputs.length,
    historicalResultsTransferred: false
  });
}
