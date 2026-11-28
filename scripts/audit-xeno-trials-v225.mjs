import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V225 = 'cede59c2c927bde0188ac8eca8f56a6dc9be2f3c';
export const XENO_TRIALS_DECLARATIONS_V225 = freeze({
  "scripts/audit-xeno-trials-v224.mjs": {
    "start": "export const XENO_TRIALS_BASELINE_V224",
    "end": "\nexport function reviewedXenoTrialsDigestV224",
    "sha256": "d704089e3ce67a9170a4d5a162f9dff10fc3e1288c049c4c001076ddf34d8f8d"
  }
});
export const XENO_TRIALS_SUCCESSORS_V225 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "9894e127c48f48ccfbe4fa211959954809852bc13966941bb33b4a9f46112ff0",
    "previousSha256": "e99ff8661d0bffb35037fb6a1f54efcb07ad7fbb27741af57d035afa2e219f1c"
  },
  "scripts/audit-xeno-trials-v224.mjs": {
    "kind": "tooling",
    "sha256": "9a708d3284c53eb241fc806635d09b85dd347ca4e0f01656b54e306636dea6df",
    "previousSha256": "df0547c321a6da63cac385f3a6b41962ba095c056764b933f01b5ba38c3820b0"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "86ca8b409be89f29e58c13968e614bc6d6053e20492ce1638efb8b60b8fa2cc3",
    "previousSha256": "9095a748443bce8d4b87496da797b0786dafa3d0dee10c13795abc82b2509291"
  },
  "scripts/public-xeno-pose-admissions-v209.mjs": {
    "kind": "tooling",
    "sha256": "1a840fe14bc73bc325e61f50dacca17f7f54f4c95993494aab11d8e2552e19dc",
    "previousSha256": "ee3698b41f11c34c1bed86d093b92d977e4b8611e2b0a3d1a22388e84445bfea"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "7139627d918ad836fd7678f35c19dd1a37df5bbf43988732c6c5f9f58e949307",
    "previousSha256": "8ca2bebb248188df0f5dabca5e28f9fe483cf26fab56a6626d4cc7033d938e38"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "b57891db9bbd3042a3c3add5d0d0ef11c4259ff664c81d22f35c9ec25e544f54",
    "previousSha256": "5ca18592715ac54bc043e711b64de6093d8460f79a83c02f5656a56266a61b2c"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "73f9be6240131ffa0c0fdc68febab18d206cebd0787820f99fbfe69c3ff7f6cc",
    "previousSha256": "afa5c24bbc348e36c45e97bd33e3f3ac90187e2e653aa7da2b9db673e334619f"
  },
  "scripts/verify-xeno-trials-ai-v213.mjs": {
    "kind": "tooling",
    "sha256": "29777fd6d8e1c36b957f7db9d920c72f8a8cedb09531d2d0ff7e2bad03fbc211",
    "previousSha256": "703cbccc58226f85772e95aafd9c16d0809091dd1d0c8eec51830dc5ce23ea49"
  },
  "scripts/verify-xeno-trials-artifact-v207.mjs": {
    "kind": "tooling",
    "sha256": "0f74a56001d479cebbdb2f519cf48074ce8502c04860c4454fa84cec2cd0f6f6",
    "previousSha256": "aa16009240203fe52e36c10ccdff16dbb458cf138f805efa9a9a272ba2c90b83"
  },
  "scripts/verify-xeno-trials-horde-minigames-v213.mjs": {
    "kind": "tooling",
    "sha256": "288847d0fed4c660f8d5b5f41959f72ab821b4cc244c6f6a7a76bcdd0faf959c",
    "previousSha256": "0da790f984e286646fb96305e61016a0449ee03fa01d5ca0ea09b2b06f43072e"
  },
  "scripts/verify-xeno-trials-offline-v223.mjs": {
    "kind": "tooling",
    "sha256": "ea5f38f8744a04e5bb2ea0a17840f01e03e7c0f8457e06b6bd57e1e9f2bbc8ee",
    "previousSha256": "2a26bcf40f6404659cbd9c4016f2e2cf952a9f4c51085639730a72469f5e1bab"
  },
  "scripts/verify-xeno-trials-poses-v209.mjs": {
    "kind": "tooling",
    "sha256": "feea22a8379c43127ad2d3bf635ac31899226c65ef9b9db48bcc737d3b996aa0",
    "previousSha256": "836f052f5f699f0223afffecdba84023726478a0ee6482443fddec56e5b511fb"
  },
  "scripts/xeno-trials-offline-worker-v223.mjs": {
    "kind": "tooling",
    "sha256": "0ee42bc41ea1fa9dcdc38e775ed2936c7ffb2c593243aeb322bdfa86a042cbc5",
    "previousSha256": "d4103353d0426d5c4ab761e7c0aa307fafba906f1d003997fa28de273c81ecce"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "3c53e725d2708627c6336d78d5aaace000364c22724a3bff8b6719fbaa1dbf9d",
    "previousSha256": "b969f87aadc2cb0ff58ad3d3abfb4c7813f42a84d6918938573d31337c2405b7"
  },
  "src/xeno-trials-ai-v209.js": {
    "kind": "runtime",
    "sha256": "ad056c64d49835332434c753689e2836f4880274a0a1fb922949e7afd4ea70a7",
    "previousSha256": "576a36a3ee7e4b220c4b2f55cb3e021285d3a4388f1c04837b18f2846d0155a9"
  },
  "src/xeno-trials-horde-minigames-v213.js": {
    "kind": "runtime",
    "sha256": "ccc45019d52d8989b76661c5083bbb6f071579b05e4bd910441be228e97ab137",
    "previousSha256": "1a6018c54ede053456e6291bedba838c0c07bee3833c86fd155ca9401b4a54e7"
  },
  "src/xeno-trials-offline-v223.js": {
    "kind": "runtime",
    "sha256": "4d71af5ec7fe3fd1e8048b03d6dbbf379130046e267d994df3a4efe17891200f",
    "previousSha256": "358349d6987de28c7e178ac6f3be5f24a9acbb7c83fbf0d7051a2412aa1070ce"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "sha256": "65bd813f85cffe99082b130d2f43fa6b62e39b7a213aa1f9d2ee0230cce4905d",
    "previousSha256": "90832129925348c339afb93f86541dd15806b93df8f10282e62e7a523ffeb7de"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "sha256": "0dbb1242cd31bd54c453edd519492a654ce1951d6335bc2ae3b6fbee25b383a8",
    "previousSha256": "02067a343e689e569705571448e1ca904829d55162d6f3bf5ab90454be4d792b"
  },
  "src/xeno-trials-poses-v209.js": {
    "kind": "runtime",
    "sha256": "3355574a3c9aa3d563c248396013056a0249d68e8e2f4ae001d0d08097fc5a98",
    "previousSha256": "2e1a32b8f06166389fc2c2c969003def84b7aa0c613b1c698e523c058d974e0f"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "4d324a3f03acc2d754e65adb250602ac06bdf2f54bfb8c0b350a421b31b27202",
    "previousSha256": "8c99f131d680d72c458218513d4195c88c335364c20af7aafc037bd3e1191db1"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "5b45ef050dc93ff932fbc16c9b88ae38c6f3a3ede9a48febf58b1af3a92d5d58",
    "previousSha256": "89406bcefe7837f29cce0b320a3fb91968c2b2bc8687f7a0bc95cb0571d22240"
  },
  "src/xeno-trials-sequences-v155.js": {
    "kind": "runtime",
    "sha256": "185007daf80db9d232f66ffb8c6d5d2dadf408870cf59ca9f601e582c4ec41b5",
    "previousSha256": "928e3cd4578e25b165090c0417e62c657c7aeee3f0edfdfd4b6f28184c561769"
  },
  "src/xeno-trials-spatial-outro-v220.js": {
    "kind": "runtime",
    "sha256": "f75cdfcc2688b50c1f6761be9045cc47114f6deb97aa91acbb58ba2cd611d032",
    "previousSha256": "f5e5251f2df8e04b7bd3b03a87e8fc3630166b0de07957e9823dca4ca0c233e7"
  },
  "src/xeno-trials-stage-events-v211.js": {
    "kind": "runtime",
    "sha256": "7614bad7a2e1180442fbf9179a2bc62ebfacccf6b4d140725bf1aaf885ae9dcd",
    "previousSha256": "620ed6096958bc2227f9d35a332de7b4bf0be3c8689fd4f4d71f0f2142b04d8e"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "a4c8791ce07456649654f9bc0f0f44977df4da9eb561ebbdeeac18d20f447ba5",
    "previousSha256": "43d1f8c8500a3749fe356b08e9a319673dbe6acb837e6600bf6aeba2fabb35a9"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "f786712d66e1da3c7cad9008eb4225182ce29d96ff71c68a90a3cebb0312ff39",
    "previousSha256": "7830210ed9fd19e31f93c03b09ae64d90885743d3adda8ca14c2702b9e3de056"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V225 = freeze({
  "assets/openai/xeno-trials-v209/characters/gorilla-heavy-windup-four-spines.png": {
    "kind": "asset",
    "sha256": "d3b61ecafc1793d1c335c57e3c716b5892dad010b8cf6a288cabc20fff24464b"
  },
  "docs/forge/xeno-trials/V225-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "964d0b63c40531897aa5817becb569d659bb594cac88bbce4e6f6d2693381a0c"
  },
  "scripts/verify-xeno-trials-archive-transfer-v225.mjs": {
    "kind": "tooling",
    "sha256": "57b9155322f06e98d38ca804c95fbf743f2f50cc58532d150a6441f4e52a5687"
  },
  "scripts/verify-xeno-trials-practice-v225.mjs": {
    "kind": "tooling",
    "sha256": "d333b6db06a56cc47c4f331476532e556c9a2e74e280220aa8e3d1666a06825a"
  },
  "scripts/verify-xeno-trials-survival-outro-v225.mjs": {
    "kind": "tooling",
    "sha256": "1101e71c677e25cad4327a147be5c7c23a45403301827ca1500d4178fa91b539"
  },
  "src/xeno-trials-archive-transfer-v225.js": {
    "kind": "runtime",
    "sha256": "ad151e872835e9e885311a03cb5ddd0ba453a7c1b80c3405f1c4e823bc0fcc77"
  },
  "src/xeno-trials-practice-v225.js": {
    "kind": "runtime",
    "sha256": "0e95bdbd80e44224eb68315a9acff7efb9cbc09ccbd0cb7bed7c72d00adb3edb"
  }
});

export function reviewedXenoTrialsDigestV225(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V225, path)) return endpoint;
  const receipt = XENO_TRIALS_SUCCESSORS_V225[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V224 endpoint for V225: ' + path);
  return receipt.sha256;
}

export function xenoTrialsRuntimeSourcesV225(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V225)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoTrialsDigestV225(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V225)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V225 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoTrialsV225(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V225);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V225);
  assert.ok(successors.length > 0, 'Incomplete V225 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v225.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V225 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V225 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V225 receipt: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V225 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V225 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V225 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V225)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V224 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V224 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V225, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
