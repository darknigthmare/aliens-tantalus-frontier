import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V224 = '322dde60f662621588fc733adec98929136f2043';
export const XENO_TRIALS_DECLARATIONS_V224 = freeze({
  "scripts/audit-xeno-trials-v223.mjs": {
    "start": "export const XENO_TRIALS_BASELINE_V223",
    "end": "\nexport function reviewedXenoTrialsDigestV223",
    "sha256": "98dd90eb66fc530d616e36db335ca5fae16a8fcf0e1777d941b4d010bab36b29"
  }
});
export const XENO_TRIALS_SUCCESSORS_V224 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "e99ff8661d0bffb35037fb6a1f54efcb07ad7fbb27741af57d035afa2e219f1c",
    "previousSha256": "a2bebbf65300d773915e6056f62dfeb4083a62119c143a487c804fc2cdbe57b1"
  },
  "scripts/audit-xeno-trials-v223.mjs": {
    "kind": "tooling",
    "sha256": "742fc58fc5fe8f053aaf21654d7a8e851c81ea0d89bd5f3dc32455500853ffff",
    "previousSha256": "63dfee1910225b78f41472deec1603f5aba63e69b8c2f33fc18653edc99c9d0b"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "9095a748443bce8d4b87496da797b0786dafa3d0dee10c13795abc82b2509291",
    "previousSha256": "ee03878c279fdaf3d841669a7f0a77c84ca3f817d91596b33a19e33ea4ca2626"
  },
  "scripts/public-xeno-pose-admissions-v209.mjs": {
    "kind": "tooling",
    "sha256": "ee3698b41f11c34c1bed86d093b92d977e4b8611e2b0a3d1a22388e84445bfea",
    "previousSha256": "3b2c242ec09c5d68baf570b6aec733ab0654504451e55e8e0186b7861d1735df"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "8ca2bebb248188df0f5dabca5e28f9fe483cf26fab56a6626d4cc7033d938e38",
    "previousSha256": "2c868da7a9aae4845b49c9fd145d19afde1fe65e78e3dc59b0a855bb89f19fe3"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "5ca18592715ac54bc043e711b64de6093d8460f79a83c02f5656a56266a61b2c",
    "previousSha256": "06ac0315b7ebbcb3befb3fc6b5404c9ad43c3e39dcebc4b7b219488358b87948"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "afa5c24bbc348e36c45e97bd33e3f3ac90187e2e653aa7da2b9db673e334619f",
    "previousSha256": "7742be1050a36432d79788f948de01d56bf47c2a177af22154cc841cd631ee7b"
  },
  "scripts/verify-xeno-trials-ai-v213.mjs": {
    "kind": "tooling",
    "sha256": "703cbccc58226f85772e95aafd9c16d0809091dd1d0c8eec51830dc5ce23ea49",
    "previousSha256": "b0bec71a5070edc8ca48ff194d0a5e92548a966c1df80db28442cec1cdaeef2c"
  },
  "scripts/verify-xeno-trials-horde-minigames-v213.mjs": {
    "kind": "tooling",
    "sha256": "0da790f984e286646fb96305e61016a0449ee03fa01d5ca0ea09b2b06f43072e",
    "previousSha256": "9ad2ebfccddec4067e37c8a693e7c16bf2a8ffd6165341fba4d3f88efa7b734d"
  },
  "scripts/verify-xeno-trials-offline-v223.mjs": {
    "kind": "tooling",
    "sha256": "2a26bcf40f6404659cbd9c4016f2e2cf952a9f4c51085639730a72469f5e1bab",
    "previousSha256": "a377bd366fb582df51da71467b039cd890aed7aa7c1d450ffe463eb0265db075"
  },
  "scripts/verify-xeno-trials-poses-v209.mjs": {
    "kind": "tooling",
    "sha256": "836f052f5f699f0223afffecdba84023726478a0ee6482443fddec56e5b511fb",
    "previousSha256": "56d33e2c9ee7a1b9eefd1733c350f84eea1ebbe0db5a1dfad1651d8646f7643e"
  },
  "scripts/xeno-trials-offline-worker-v223.mjs": {
    "kind": "tooling",
    "sha256": "d4103353d0426d5c4ab761e7c0aa307fafba906f1d003997fa28de273c81ecce",
    "previousSha256": "3c92aaf6c5c77fce9d9c097187f30a5be15e0a828f386648fcb7ba31e26acf7f"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "b969f87aadc2cb0ff58ad3d3abfb4c7813f42a84d6918938573d31337c2405b7",
    "previousSha256": "4770d7fbd70668301901d8fded59f3009de0435d348026d6bcde6904a93aded1"
  },
  "src/xeno-trials-ai-v209.js": {
    "kind": "runtime",
    "sha256": "576a36a3ee7e4b220c4b2f55cb3e021285d3a4388f1c04837b18f2846d0155a9",
    "previousSha256": "8dc724ada8c040cb4e25f2e88e3ba0c05adcff78922f525a3cf298d7ce13754f"
  },
  "src/xeno-trials-horde-minigames-v213.js": {
    "kind": "runtime",
    "sha256": "1a6018c54ede053456e6291bedba838c0c07bee3833c86fd155ca9401b4a54e7",
    "previousSha256": "aa67be3ea02d48b7f8d135b76c48af58d0e7c0160e29230bd50e4c16d1f9eba7"
  },
  "src/xeno-trials-offline-v223.js": {
    "kind": "runtime",
    "sha256": "358349d6987de28c7e178ac6f3be5f24a9acbb7c83fbf0d7051a2412aa1070ce",
    "previousSha256": "5fde1ebde9ec0117705dfb52b67fb5d59586fb3693187baf68c489595d3e4fac"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "sha256": "90832129925348c339afb93f86541dd15806b93df8f10282e62e7a523ffeb7de",
    "previousSha256": "cd49eee0450202ce4268a9dee728068d04129969e05f941cd18108b03c6fbe33"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "sha256": "02067a343e689e569705571448e1ca904829d55162d6f3bf5ab90454be4d792b",
    "previousSha256": "5a5f124a3082198478b36dba30dc070a80c753438bb443bee64ec409b95b63ca"
  },
  "src/xeno-trials-poses-v209.js": {
    "kind": "runtime",
    "sha256": "2e1a32b8f06166389fc2c2c969003def84b7aa0c613b1c698e523c058d974e0f",
    "previousSha256": "83787cc558718a1fdb7356d29dff24a0553b988100f5b702e8aea240d2da7845"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "8c99f131d680d72c458218513d4195c88c335364c20af7aafc037bd3e1191db1",
    "previousSha256": "c816083a9486958a41068230aa53e8086e0d4bef1675e80a6745422df21372e8"
  },
  "src/xeno-trials-purge-presentation-v204.js": {
    "kind": "runtime",
    "sha256": "701c6c8982504b279f34d16e05078a90644184ead2d779731a4ea8c1b0c585ff",
    "previousSha256": "bc92b566360aa7e7022f31d151bacb371482c26ac1e109cea07c778dcbd44fdb"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "89406bcefe7837f29cce0b320a3fb91968c2b2bc8687f7a0bc95cb0571d22240",
    "previousSha256": "a2041dd4d5693f862e084c172ecffa88d94b9c45b8138d2949676e8b2d3977f7"
  },
  "src/xeno-trials-sequences-v155.js": {
    "kind": "runtime",
    "sha256": "928e3cd4578e25b165090c0417e62c657c7aeee3f0edfdfd4b6f28184c561769",
    "previousSha256": "9c9237da82cd9c0d2346b4c5747dc8a872cfe6f02dfa08757adc8e1fa1ea29c6"
  },
  "src/xeno-trials-spatial-outro-v220.js": {
    "kind": "runtime",
    "sha256": "f5e5251f2df8e04b7bd3b03a87e8fc3630166b0de07957e9823dca4ca0c233e7",
    "previousSha256": "5fdb62877830ac8015347671e1f5ebab732ac1922e0c6bd407de37b43164817c"
  },
  "src/xeno-trials-stage-events-v211.js": {
    "kind": "runtime",
    "sha256": "620ed6096958bc2227f9d35a332de7b4bf0be3c8689fd4f4d71f0f2142b04d8e",
    "previousSha256": "0d935d016a02975fbae09f6700bf6df1b67731b08fccb08f57019a00437e7d44"
  },
  "src/xeno-trials-stage-hazards-v188.js": {
    "kind": "runtime",
    "sha256": "07ce7bf2e0b5c3744a7375faaf6f8acf6eeec72c0d57e5875030a767fbc31560",
    "previousSha256": "d6a1df8e41b5ffc567de4fb1d042ee8ca92bed1126373585d362b0bf6958bf79"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "43d1f8c8500a3749fe356b08e9a319673dbe6acb837e6600bf6aeba2fabb35a9",
    "previousSha256": "3b5190236f11c98a4a78ab29062a364c2e0deadbac9d09af68921e33888c9596"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "7830210ed9fd19e31f93c03b09ae64d90885743d3adda8ca14c2702b9e3de056",
    "previousSha256": "e0cf1dceedc9e2833d9b954e80ed8aa30a3e9d9a1371b9e7c72992a1b77e4a4b"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "sha256": "2e8c4ef4a4ebb2f7ddbb6bf5f5d8b4861bc7843f6734abdb1d1f683b02610c00",
    "previousSha256": "d87d99d72b86311f87ed2d22018460cbbdcd45a6e0e52d5b9866c33a4b104fc4"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V224 = freeze({
  "assets/openai/xeno-trials-v209/characters/arachnoid-special-recovery.png": {
    "kind": "asset",
    "sha256": "b0107abfb5e960471a11d3f51a688e41d28297e3dbc4f096f5e1519956b32005"
  },
  "assets/openai/xeno-trials-v209/characters/arachnoid-special-windup.png": {
    "kind": "asset",
    "sha256": "0325aa7feefaec49c34b67b2e25271e1cd74f2915be924ebcd917d229bcf1a4d"
  },
  "assets/openai/xeno-trials-v209/characters/grid-special-recovery.png": {
    "kind": "asset",
    "sha256": "c962ee28d95bf773d516084a8c31584589d6f0ded0fbf900259fce61759e033e"
  },
  "assets/openai/xeno-trials-v209/characters/grid-special-windup.png": {
    "kind": "asset",
    "sha256": "96d69dcf4e4262c0f69dfb52d3e43349f63c531a706236b14ff1d66b8585e94c"
  },
  "docs/forge/xeno-trials/V224-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "909a9a66225dc261bffcc8ba93a00ba97eaec992a4bd074e91d60119936530ed"
  },
  "scripts/verify-xeno-trials-decompression-v224.mjs": {
    "kind": "tooling",
    "sha256": "1eb21d2b5276bdf0e357790fc62ed6f2bf6a6718a23051c73cd03ca6013deed6"
  },
  "scripts/verify-xeno-trials-practice-v224.mjs": {
    "kind": "tooling",
    "sha256": "1b791aeb63ab06707a25a14021b495077f219a927fa2a395088095ee195248ad"
  },
  "scripts/verify-xeno-trials-spatial-outro-v224.mjs": {
    "kind": "tooling",
    "sha256": "bf423685867d0c877e99caece33eb3419e1dc0578cc5389fb9d39be5756035b4"
  },
  "src/xeno-trials-practice-v224.js": {
    "kind": "runtime",
    "sha256": "67502a55ed55869adcdf6a8f894a8bab4cde90d5d9a73be538be31d544bbd029"
  }
});

export function reviewedXenoTrialsDigestV224(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V224, path)) return endpoint;
  const receipt = XENO_TRIALS_SUCCESSORS_V224[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V223 endpoint for V224: ' + path);
  return receipt.sha256;
}

export function xenoTrialsRuntimeSourcesV224(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V224)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoTrialsDigestV224(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V224)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V224 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoTrialsV224(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V224);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V224);
  assert.ok(successors.length > 0, 'Incomplete V224 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v224.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V224 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V224 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V224 receipt: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V224 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V224 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V224 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V224)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V223 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V223 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V224, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
