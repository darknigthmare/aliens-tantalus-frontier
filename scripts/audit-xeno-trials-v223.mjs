import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedXenoTrialsDigestV224, xenoTrialsRuntimeSourcesV224, verifyXenoTrialsV224 } from './audit-xeno-trials-v224.mjs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V223 = 'c71642176e92027790600eec631445ab6f82fcf2';
export const XENO_TRIALS_DECLARATIONS_V223 = freeze({
  'scripts/audit-xeno-trials-v222.mjs': {
    start: 'export const XENO_TRIALS_BASELINE_V222',
    end: '\nexport function reviewedXenoTrialsDigestV222',
    sha256: '28841bc5b10d44d698c5bb88b55dd4a60a1a9153e30ba27a69e0d9fb001b3543'
  }
});
export const XENO_TRIALS_SUCCESSORS_V223 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "a2bebbf65300d773915e6056f62dfeb4083a62119c143a487c804fc2cdbe57b1",
    "previousSha256": "8fde5b17479d22a699430fe33052f7b1465c8cfe93bfda593459fe068e6ad0d1"
  },
  "scripts/audit-xeno-trials-v222.mjs": {
    "kind": "tooling",
    "sha256": "822cd3e41b6ebb49ef15ca5e86e8362084a282a4ed53d0c97ca9ad5b2069e9bb",
    "previousSha256": "77b707f3612be10893130b67fd58d96b0e8b3ef6acf951d34dae8b5e950d10c3"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "ee03878c279fdaf3d841669a7f0a77c84ca3f817d91596b33a19e33ea4ca2626",
    "previousSha256": "982c92f53f9bef94eb8d70d0b4ed8de3105257e882d38f3ec16379d885da07e2"
  },
  "scripts/public-xeno-pose-admissions-v209.mjs": {
    "kind": "tooling",
    "sha256": "3b2c242ec09c5d68baf570b6aec733ab0654504451e55e8e0186b7861d1735df",
    "previousSha256": "9efbe85dba8e740940bb133195cc6c0da3b149ab67101dcff9401b96ef4b9e65"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "2c868da7a9aae4845b49c9fd145d19afde1fe65e78e3dc59b0a855bb89f19fe3",
    "previousSha256": "b070b1a2686ea0570866621f0bb74e60ab1050b98f2141ba687cb1ef80c7ab97"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "06ac0315b7ebbcb3befb3fc6b5404c9ad43c3e39dcebc4b7b219488358b87948",
    "previousSha256": "376da2b578908b00e0c6539e5395904ed603ae59b486f0796536963b6828cac2"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "7742be1050a36432d79788f948de01d56bf47c2a177af22154cc841cd631ee7b",
    "previousSha256": "b664d7915929ba9ae65efd494c6a4358a30e75a6437e2e5bd24c354d01a618b5"
  },
  "scripts/verify-xeno-trials-ai-v213.mjs": {
    "kind": "tooling",
    "sha256": "b0bec71a5070edc8ca48ff194d0a5e92548a966c1df80db28442cec1cdaeef2c",
    "previousSha256": "97753b541a19bf571eb972d293706e2d4ff692002729322306c10e1910d6450f"
  },
  "scripts/verify-xeno-trials-animation-ui-v189.mjs": {
    "kind": "tooling",
    "sha256": "c0f445800ebff770d36a463d797fc8232a9cf95cbd97eac7b094c55ccd6af840",
    "previousSha256": "b69bffff444f3c6f6863ce1e0cd9d2c0a054c18e1fde4b4e6453854343177530"
  },
  "scripts/verify-xeno-trials-artifact-v207.mjs": {
    "kind": "tooling",
    "sha256": "aa16009240203fe52e36c10ccdff16dbb458cf138f805efa9a9a272ba2c90b83",
    "previousSha256": "26fe04be86cf3882799229ebacc6b18375f43d9f12b5b374c6cf42b8e0e73317"
  },
  "scripts/verify-xeno-trials-horde-minigames-v213.mjs": {
    "kind": "tooling",
    "sha256": "9ad2ebfccddec4067e37c8a693e7c16bf2a8ffd6165341fba4d3f88efa7b734d",
    "previousSha256": "eb132d9115e63b82b682d28866fbac75dfcd66633554ea97ff8e258d902e0062"
  },
  "scripts/verify-xeno-trials-poses-v209.mjs": {
    "kind": "tooling",
    "sha256": "56d33e2c9ee7a1b9eefd1733c350f84eea1ebbe0db5a1dfad1651d8646f7643e",
    "previousSha256": "41a0588e30752479e2b66cff7f9d9ffd4d8adfd5debd329627bd3d87563c4ecc"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "4770d7fbd70668301901d8fded59f3009de0435d348026d6bcde6904a93aded1",
    "previousSha256": "421fa650c43b6c16cd800dcba13681c47319a887f593d7b2c67c1e8cf1f3b0cf"
  },
  "src/xeno-trials-ai-v209.js": {
    "kind": "runtime",
    "sha256": "8dc724ada8c040cb4e25f2e88e3ba0c05adcff78922f525a3cf298d7ce13754f",
    "previousSha256": "776f5bb6fd944b9bc1afc5c11f72c6d6e6d142fefef4c74a4b49257f77d27461"
  },
  "src/xeno-trials-animation-coverage-v199.js": {
    "kind": "runtime",
    "sha256": "e0dd00becfc2edfa10d29b135d4b01df04b31f6d8053c40fde9faf68c54f266f",
    "previousSha256": "7a201f078f663f645ee71c419e2e96dcba2a21a88908e160eb2001b4a11d0d28"
  },
  "src/xeno-trials-finishers-v207.js": {
    "kind": "runtime",
    "sha256": "a01a6d3a65e3b102a9bc360688128ec89d0cef5b29d0fb67132e5f327b847a09",
    "previousSha256": "d145aac98b27459343724967aa66ca52275f6acdee903ea628ebadaeeeb35ab0"
  },
  "src/xeno-trials-finishers-v219.js": {
    "kind": "runtime",
    "sha256": "48190f6193a86e83c79754749cdf57bc43d3062b481093d836630519a847008c",
    "previousSha256": "2131aa474ab6eb8dc2cbd29c89229a979d606da7c94b72c3bceecb6ec82861a4"
  },
  "src/xeno-trials-horde-minigames-v213.js": {
    "kind": "runtime",
    "sha256": "aa67be3ea02d48b7f8d135b76c48af58d0e7c0160e29230bd50e4c16d1f9eba7",
    "previousSha256": "32d5df2c25239450963912cdf2366515ff61ea292d7cd62fea7e372ce5f89225"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "sha256": "cd49eee0450202ce4268a9dee728068d04129969e05f941cd18108b03c6fbe33",
    "previousSha256": "95e9e40702f3e4c13662c8acff6f8f8c633eb48f29ac76f3732711cdbaa64d2d"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "sha256": "5a5f124a3082198478b36dba30dc070a80c753438bb443bee64ec409b95b63ca",
    "previousSha256": "79db261079e371f79e33addfc2f004c8fd16d2df3183b9fc98ebc5f2fb29938b"
  },
  "src/xeno-trials-poses-v209.js": {
    "kind": "runtime",
    "sha256": "83787cc558718a1fdb7356d29dff24a0553b988100f5b702e8aea240d2da7845",
    "previousSha256": "02495d604e3bd4474ab29a2dfb9a2036e20f1b515022306ff63694be6069b48d"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "c816083a9486958a41068230aa53e8086e0d4bef1675e80a6745422df21372e8",
    "previousSha256": "0824976df264dbf164b518c3c8f169e335aeae62b5d25b17325c374abb645d4b"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "sha256": "596dafae4627afa1340a72cf001e5a65431b7ed47e4ef069e9c655e8657a7fa3",
    "previousSha256": "dc33a41032653d526035b50372c62fd477f6c0ca489436638af74a8e8571874e"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "a2041dd4d5693f862e084c172ecffa88d94b9c45b8138d2949676e8b2d3977f7",
    "previousSha256": "6b6fd2a31d67a1be9ab2b0042bc6f7202a35700e11fc6ba544b35cdad4333e48"
  },
  "src/xeno-trials-stage-events-v211.js": {
    "kind": "runtime",
    "sha256": "0d935d016a02975fbae09f6700bf6df1b67731b08fccb08f57019a00437e7d44",
    "previousSha256": "6768ae08c8f82d95b56e97651b25a4e1359f36039644879a986f64dc979bb51f"
  },
  "src/xeno-trials-standalone.js": {
    "kind": "runtime",
    "sha256": "0c88b0223d65cdac13c5fa0f8180d4e681b9871e1e64b163e3cddcadde34f5db",
    "previousSha256": "c86ab30299471a73432bb4c34f679048d0b1ddea17e6cf181f634ed942abfdd3"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "3b5190236f11c98a4a78ab29062a364c2e0deadbac9d09af68921e33888c9596",
    "previousSha256": "9818503b63ddd4fe0d55caf63cdf05178b027773010b9a1b9891c422edf2817a"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "e0cf1dceedc9e2833d9b954e80ed8aa30a3e9d9a1371b9e7c72992a1b77e4a4b",
    "previousSha256": "d3db8f435e0032158d40dece84060f87b60a843b8274d6a2b1d9ae9bf9b82ba3"
  },
  "xeno-trials-fullscreen-v119.css": {
    "kind": "runtime",
    "sha256": "d87d99d72b86311f87ed2d22018460cbbdcd45a6e0e52d5b9866c33a4b104fc4",
    "previousSha256": "5712579ed9a15006b6dc70374d5834c08e04dd5786b340c512ecf8a4a519d478"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V223 = freeze({
  "assets/openai/xeno-trials-v209/characters/arachnoid-light-impact.png": {
    "kind": "asset",
    "sha256": "3012fed84a9ee51b399af0a7f493d0bc7b56c46f78bd7822a5514c85af854ae6"
  },
  "assets/openai/xeno-trials-v209/characters/arachnoid-light-recovery.png": {
    "kind": "asset",
    "sha256": "70892c9d5536bc966a7acf487990be675ac7399d934d0dedd9ee85596fae0714"
  },
  "assets/openai/xeno-trials-v209/characters/arachnoid-light-windup.png": {
    "kind": "asset",
    "sha256": "82053d2dc53dfa7a25c71e0c7e46117a90134e5934977eae919d13b1554daa2d"
  },
  "assets/openai/xeno-trials-v209/characters/panther-light-recovery.png": {
    "kind": "asset",
    "sha256": "4016ecb27af2fd111470d502ae12a20bc213dca48db8c8dcd8ba39d946c724af"
  },
  "assets/openai/xeno-trials-v209/characters/panther-light-windup.png": {
    "kind": "asset",
    "sha256": "1301b08f9048deaa18020f3908be9035061dd0e41281d0fe3c13b8014555f07d"
  },
  "docs/forge/xeno-trials/V223-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "5ceeb36b3e74b034cfdba3a3b122fdc7a9c954b27a851dc30204d1de2a92811f"
  },
  "scripts/verify-xeno-trials-finishers-v223.mjs": {
    "kind": "tooling",
    "sha256": "746220536f993aa676077571c1c4d086380ba84961f407997a127ff74845d23b"
  },
  "scripts/verify-xeno-trials-grounding-v223.mjs": {
    "kind": "tooling",
    "sha256": "976cf04bc4584fb0a06f28c5437867c74dad02604e1ed4ff9d8060b0af86eb82"
  },
  "scripts/verify-xeno-trials-offline-v223.mjs": {
    "kind": "tooling",
    "sha256": "a377bd366fb582df51da71467b039cd890aed7aa7c1d450ffe463eb0265db075"
  },
  "scripts/verify-xeno-trials-practice-v223.mjs": {
    "kind": "tooling",
    "sha256": "466eb439233b6249dc18a2adbcd9681dfe99f22bd06e98c65fdac9c5d02f0d48"
  },
  "scripts/xeno-trials-offline-worker-v223.mjs": {
    "kind": "tooling",
    "sha256": "3c92aaf6c5c77fce9d9c097187f30a5be15e0a828f386648fcb7ba31e26acf7f"
  },
  "src/xeno-trials-finishers-v223.js": {
    "kind": "runtime",
    "sha256": "bce5019515e947005265b79112f0022c8d4986910d344a2fb334262231edae93"
  },
  "src/xeno-trials-offline-v223.js": {
    "kind": "runtime",
    "sha256": "5fde1ebde9ec0117705dfb52b67fb5d59586fb3693187baf68c489595d3e4fac"
  },
  "src/xeno-trials-practice-v223.js": {
    "kind": "runtime",
    "sha256": "f6c673b3465121c031c706f1aa413d15f94fc6901920c8146154e0a4822ff594"
  }
});

export function reviewedXenoTrialsDigestV223(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V223, path)) return reviewedXenoTrialsDigestV224(path, endpoint);
  const receipt = XENO_TRIALS_SUCCESSORS_V223[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V222 endpoint for V223: ' + path);
  return reviewedXenoTrialsDigestV224(path, receipt.sha256);
}

export function xenoTrialsRuntimeSourcesV223(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V223)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV224(path, receipt.sha256);
    if (result[path] !== undefined && result[path] !== current) reviewedXenoTrialsDigestV223(path, result[path]);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V223)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV224(path, receipt.sha256);
    if (result[path] !== undefined) assert.equal(result[path], current, 'Incorrect V223 runtime input: ' + path);
    result[path] = current;
  }
  return xenoTrialsRuntimeSourcesV224(result);
}

export function verifyXenoTrialsV223(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V223);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V223);
  assert.ok(successors.length > 0, 'Incomplete V223 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v223.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V223 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V223 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V223 receipt: ' + path);
    assert.equal(sha(readSource(path)), reviewedXenoTrialsDigestV224(path, receipt.sha256), 'Unreviewed V223 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V223 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V223 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V223)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V222 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V222 declarations changed: ' + path);
  }
  verifyXenoTrialsV224(readSource);
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V223, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
