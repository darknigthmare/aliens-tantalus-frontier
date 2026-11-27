import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V220 = 'bd1cafad4b0ba8f006b0fed9ca0dbd4114c94193';
export const XENO_TRIALS_DECLARATIONS_V220 = freeze({
  'scripts/audit-xeno-trials-v219.mjs': {
    start: 'export const XENO_TRIALS_BASELINE_V219',
    end: '\nexport function reviewedXenoTrialsDigestV219',
    sha256: 'f1bc3af52f121444597711bbe7eadae7070cb12be7a2e45053ea32c93349af75'
  }
});
export const XENO_TRIALS_SUCCESSORS_V220 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "d8dacd07c50fe829a6a5960dbf59007b4fde0bcd591b7d79e49b00cdda23e591",
    "previousSha256": "8bb04ef8d355d66fe2e60b62a3f16070053100b3cea471dcd6bbeff6be077634"
  },
  "scripts/audit-xeno-trials-v219.mjs": {
    "kind": "tooling",
    "sha256": "e3f38fe474053419bfe5e2fa1cee5c601db0a29bf825be3dc00394c5ab7f9471",
    "previousSha256": "d5dc54bd1a55c997c9736a640456f93c55309e50d15a0287f83b974123bb8916"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "9fde68a57c0362c314216d89053e5b1b0ebfc903f670f94f635c754e7fea3f6b",
    "previousSha256": "ba67ca145b65d432bcfda798373f9fcd522e4e333b5f3caef4f8cf20c06f5707"
  },
  "scripts/public-xeno-pose-admissions-v209.mjs": {
    "kind": "tooling",
    "sha256": "60b5a2a4d230ca34e387ecedfb44e14dd7474a873b371f13fa5666ac3bb7fd50",
    "previousSha256": "880226b38414bef4160507ec648e5271e42de4470eebc26b13a7a23dca48098e"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "218c3228cc6bb29be62ded8a21b7554ccb254bb732d20c9e09e7f5ce5a2eda4b",
    "previousSha256": "06dcea1bbdc2a939cf80915291112775057b2036892b087957b214ff3abeb089"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "ae6dd9991efd38be8eb87ce98bdf23367b4a0e074210f92050120f87e518fb2c",
    "previousSha256": "f5d5f2d1e732bd651611405b7b192ef2a7703bb023fa9441d76ce71b19fd36dc"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "c0194542a8832f8ac11289606b708944fd80892db384f3eea7315141b8e1d83c",
    "previousSha256": "810b1300479c3463f2e6065221f84b2e8a28496e455e24c85d307ebcec05d11f"
  },
  "scripts/verify-xeno-trials-ai-v213.mjs": {
    "kind": "tooling",
    "sha256": "97753b541a19bf571eb972d293706e2d4ff692002729322306c10e1910d6450f",
    "previousSha256": "767d39eaaac602cfae2caaa1cbd421b348d389f2fe8ce0628cb3026c0eb16b8b"
  },
  "scripts/verify-xeno-trials-artifact-v207.mjs": {
    "kind": "tooling",
    "sha256": "5608af5cc6e1bfd2e6f879162dca48733bb30c85bb16d78ded7a23ea5c51bc5f",
    "previousSha256": "b738fb56c7646cdfc864d67eed118fffb24333dd0f83278851a5916c1b5e4039"
  },
  "scripts/verify-xeno-trials-horde-minigames-v213.mjs": {
    "kind": "tooling",
    "sha256": "8f20cdfbcfc72f89629d0c3f551e7c732efbe6a6fa8c7b50ff6287fe80645e46",
    "previousSha256": "8e229d3027373692427156579ab6dc9a488c5e416be5b32384d24c231937ba52"
  },
  "scripts/verify-xeno-trials-landing-v219.mjs": {
    "kind": "tooling",
    "sha256": "bdcb46edf69336537b75993e862dac0cf010b7ff779efc2d492f2e3244e7d47f",
    "previousSha256": "67ce94581621a2361944ca6b1913caace3ea24fd8b3fdb0f3f07f8204912fe5f"
  },
  "scripts/verify-xeno-trials-poses-v209.mjs": {
    "kind": "tooling",
    "sha256": "48b6b11bacb3179ae8fdf1020ddc4dbc5a49be379e9dff85862f96d539875bf2",
    "previousSha256": "6226e7e5ed1ab510c75c157b5200411f89394f35777dacd4e4e8ebfd4871ba31"
  },
  "scripts/verify-xeno-trials-ui-v186.mjs": {
    "kind": "tooling",
    "sha256": "2ee7b6cff3f1352b50a3e086b398be91643c23fca0569f1cc7826daff01fef95",
    "previousSha256": "1c74c02d41bb5fd2c6aba4135eb3c5b89546afb9057dbfb9cf90be40d4e0cf6c"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "04d44d2957c7c0c371d59dff7da7cb0f3ece3d22e5a67cdf2146d5a3d3da84c8",
    "previousSha256": "86ee61c4db36fd8d97c8c0c13e909f95f1c755f7d7f8995680920bfe670d9ea8"
  },
  "src/xeno-trials-ai-v209.js": {
    "kind": "runtime",
    "sha256": "776f5bb6fd944b9bc1afc5c11f72c6d6e6d142fefef4c74a4b49257f77d27461",
    "previousSha256": "2b6165429768db73e9ab30a4ec2fb26df2839f8fbac2ee768223590cde5ed69b"
  },
  "src/xeno-trials-grapple-v212.js": {
    "kind": "runtime",
    "sha256": "53b29eb6a94d1bdec4b1e3fe15efb22eaa68863cc9438cd54e52776c31f8566b",
    "previousSha256": "c32bdff8454cc0efa0d1c843d581f28a89fc916b2cf9dff1a7f34e94a0f8abd8"
  },
  "src/xeno-trials-horde-minigames-v213.js": {
    "kind": "runtime",
    "sha256": "e257b416190a1654a6afa4c54034ec71b5d2d547687ecfeaabb9e0fca3d146a6",
    "previousSha256": "90df5c0f9cc5f81a2df3299ebfab7026bd55a03044561f00cdc70759bb1f3b68"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "sha256": "d3dcc38335a1c66f248fb74a655129d92aefaa1dc217e964731fed6cf9af7e05",
    "previousSha256": "f88624dd6e877587e70e42baab2ddd6e7fe13f11c7e48f116285338396ef5217"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "sha256": "d257cfae50644bbc7f5dedd4a171f8a83b113b7244c7607bd4e17195540fbdc2",
    "previousSha256": "f9d5c54ef43e3675c0a2dc8186de46b978a98366db98280e0d249057ad768521"
  },
  "src/xeno-trials-poses-v209.js": {
    "kind": "runtime",
    "sha256": "0afd3041c7fb892e7fec83108e1d016cc9df8bc294dd6fe26dc2a4b38c778e33",
    "previousSha256": "cedaadc973872a58c6db0e9022ef3cc5328ee72067e9c8abc7952be9f3bc6a37"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "95603e708d6ba92b3dd3eef6845a4c1318147166fbdfb0eb4940c62aed88cb52",
    "previousSha256": "398dc9dbd4dd6ca753e41a69fd292fc041b6a507a23b31f826b356beec7bad54"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "sha256": "dc33a41032653d526035b50372c62fd477f6c0ca489436638af74a8e8571874e",
    "previousSha256": "fcf46f34ccee6f5b535db6e3250111a82132db5d6a6f2114c17ca60ceb6aff48"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "56ededa3cf1f24c1a1afca9e56d24f1b3aed92d2b159de9b0c51786051f69b78",
    "previousSha256": "6913343b3ddfb2871dc3c9573176908f588e4975e7d4f1c8b4b91c1ad3ece129"
  },
  "src/xeno-trials-selection-v97.js": {
    "kind": "runtime",
    "sha256": "acb6bda6327ef144d4d5d78223c12fdbdb8df2832565fa748c4f2970b64a4a9f",
    "previousSha256": "16d03a6ebf76c4961ca04008d38688a406d76b75e1f6ceec329ad1647ffad1da"
  },
  "src/xeno-trials-sequences-v155.js": {
    "kind": "runtime",
    "sha256": "9c9237da82cd9c0d2346b4c5747dc8a872cfe6f02dfa08757adc8e1fa1ea29c6",
    "previousSha256": "08f06fa9cb93149e14e81ca6ea1a851ff44752df3d3ad75f55bef19042bf4169"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "f4c6086ae0a1e4e9fb9b445bb6940f3e54f7ab90cd8a82ac17e151a716098085",
    "previousSha256": "594543472687bd92ab2f3e6df144ac845266ed99c3071fcc722da73d54f63c20"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "0f2c6e86b7a23a89ed427726829b9f010fcefdd6ad86ecb2feab3674ff0eebdb",
    "previousSha256": "96601ef536388330f350014a233f2ee3ddac030999bcd25b6569879e58ac63bf"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V220 = freeze({
  "assets/openai/xeno-trials-v209/characters/arachnoid-special-active-grounded.png": {
    "kind": "asset",
    "sha256": "92de99e7ab0a0b999e440954ca35627fd9e7a4074780a24e52f1a4de55fa64e4"
  },
  "docs/forge/xeno-trials/V220-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "369f2dfb7e97da45a0e428e906dcadcad60c70cf85e0dbc2c2cf86b72a2800ee"
  },
  "scripts/verify-xeno-trials-grapple-v220.mjs": {
    "kind": "tooling",
    "sha256": "7df621ab6d1642e46005c595a816a59aa9b73a26f217f5214278f8acac595c3b"
  },
  "scripts/verify-xeno-trials-practice-v220.mjs": {
    "kind": "tooling",
    "sha256": "183660eddb482f3d3fd5bc4d91e6d3a7ff9ab0f7d4ef3c3b46756a671f7e3f8a"
  },
  "scripts/verify-xeno-trials-relief-hold-v220.mjs": {
    "kind": "tooling",
    "sha256": "41fa672065dbcfe413c9c730d5a8b8bea2e1e35e983fcadc7e846e8f07ecf4c1"
  },
  "scripts/verify-xeno-trials-spatial-outro-v220.mjs": {
    "kind": "tooling",
    "sha256": "f57f085aa3a84ada50b833eb376a2ade96237a61cac4043dc665cd7572c67be3"
  },
  "src/xeno-trials-practice-v220.js": {
    "kind": "runtime",
    "sha256": "b238541f9dd9bb97c946c896879ec78dc09fb33ec227a98a23097f038feb485b"
  },
  "src/xeno-trials-spatial-outro-v220.js": {
    "kind": "runtime",
    "sha256": "197cef717513b89a4c0745956460ae316240393735a0099c154b28ab0bddcce0"
  }
});

export function reviewedXenoTrialsDigestV220(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V220, path)) return endpoint;
  const receipt = XENO_TRIALS_SUCCESSORS_V220[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V219 endpoint for V220: ' + path);
  return receipt.sha256;
}

export function xenoTrialsRuntimeSourcesV220(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V220)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoTrialsDigestV220(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V220)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V220 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoTrialsV220(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V220);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V220);
  assert.ok(successors.length > 0, 'Incomplete V220 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v220.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V220 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V220 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V220 receipt: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V220 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V220 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V220 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V220)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V219 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V219 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V220, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
