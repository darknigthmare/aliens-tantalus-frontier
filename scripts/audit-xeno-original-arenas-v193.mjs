/** Source admission for the original Tantalus arena batch, anchored to public V192. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedIconicStagesDigestV194, iconicStagesRuntimeSourcesV194,
  verifyIconicStagesV194 } from './audit-xeno-iconic-stages-v194.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safePath = path => /^[a-zA-Z0-9._/-]+$/.test(path)
  && !path.split('/').some(segment => !segment || segment === '.' || segment === '..');
const kinds = new Set(['runtime', 'verifier', 'asset', 'configuration', 'document-input']);

function freezeReceipts(receipts) {
  for (const receipt of Object.values(receipts)) Object.freeze(receipt);
  return Object.freeze(receipts);
}

export const ORIGINAL_ARENAS_BASELINE_V193 = '81b4f2fd0d9e742b423236e7b574847fd9ae77ee';
export const ORIGINAL_ARENAS_HISTORICAL_DECLARATIONS_V193 = freezeReceipts({
  'scripts/audit-xeno-franchise-stages-v192.mjs': {
    start: 'export const FRANCHISE_STAGES_BASELINE_V192',
    end: '\n/** Strict predecessor transition:',
    sha256: '2c6b43a8dee80a2d22bcc0521cc6fc38bac9720a8338a077de66c36e7df11649'
  }
});

// Populated after the product files and their targeted checks are frozen.
export const ORIGINAL_ARENAS_SUCCESSORS_V193 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "9d752c871f793cce13f8172bbd8ef9fefc9840dd250e4fc373f7af527c983751",
    "currentSha256": "b8183038b2ad6081a2fdd36b76614b3fa122fb53c22e3a32fe5f03ecdce334f3"
  },
  "scripts/audit-xeno-franchise-stages-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "1b81d869f800134db8569ed1b4d0c863c3ba96422633df43fa5fd388cf1e3aa6",
    "currentSha256": "1fc97315b11f3d2c53aa7358f578a698894fc936380fba6ca9902c31d7c5cb03"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "dc1c7e4eadc4cc343df32c4d8249ab5fe3da75badd3affdca6fe90ff65f93bc7",
    "currentSha256": "c94c88f252e6d61996cf2a5b80fcd18bfb11e74847ba20081bb7136c4abba4ff"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "2d66a6b22bf32c2ab59e36beae620f7d0b9de4fcedf7719ec1f802a4a3875ee7",
    "currentSha256": "867cd2ccdaa6cd9513ec5cc165734875c5a852b8e9d6e892a908fae48fdfb048"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "21aa4ac22bc8b224381ede6e72268756da9a52eb88a1948769bc9e0a85c1972b",
    "currentSha256": "c83150c2cd179d994e81b74ae49e565e45122451a5f01a1814b753a18c35127d"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "a5edb3a05c4ad9c7d4f5c5f46b4b8b949936833e2c3f2cf46934149750cd9cf9",
    "currentSha256": "8bb7a46fe1b74d45a24cc43f082de02d907f8db293dfc03af7d343f37db927d8"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "6217e92e0f7835020f29c83ff84b5d94f60fa6bfa36aabf6dae369cfe6f9cf18",
    "currentSha256": "7f614a33cb1a0a770196c77a9befd6feee3c0f8549c424efe88ff547b823d268"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "a6725a4c34488ce5667bc60fb7bab5d368b443e3fb1c5649faa6eb17acda4221",
    "currentSha256": "fb45411a569acddc5e1b02408ffdda9488f89a0b666b75efab7c3c950d45eeb4"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "c77c9e0cc36555124659654b1d67b1f396a4f1f71ef49c87e204143c784aa826",
    "currentSha256": "d5de2d3f27b8239ca2cd4f316558eb1e544dd78e60b1402170520cabab8284fb"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "dabd9aed91290e2ac69a591f57228bf82f73fbbb5dda8a6e93e078dcba84158b",
    "currentSha256": "4bcd62b57f73a3f8eeb2d8c7e19b5082880ef1c7915fbab8e02672751dec68a7"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "0d1f45ce351f74d587b6026e3af85bdb03fbf24a3c279d83976d04f46e64ad12",
    "currentSha256": "850293798424b072518e0d1abbb692a0b0d7e08c4f58096a360ba0dc6dc7ff5e"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "d3749114bfa94a2b06b79dad73b214f5d0a6f7b3b0a593205c51f551d93d1e76",
    "currentSha256": "14616612001f67f6d43f77abb1737567419b7034dd2c590c5ee201536e4e1cea"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "622af86524bd09255bd4c6c1d6e071cfb27283eb42d4003a73c544254ae1e4fe",
    "currentSha256": "3e3a3b4d6612acd740a97746f7823cd27d7d93e132093a808d83e844523a9f82"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "938fec182d1b0f87ebe414c5cfc21df3f2e401738fc768105ff194093c474713",
    "currentSha256": "81e677b6bf13f68d0eac305788c024d09f2d33bed453d8236e024709a38345a0"
  },
  "scripts/verify-xeno-trials-franchise-stage-render-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "6a9534f625dbe088eb97942031bb11b0ec1557fa6ac065cd2424b235152b608b",
    "currentSha256": "880ce131e06d7ffab5ab7f757c7dcb05a41fbe25f6d49dcba5bc9be8c14b683f"
  },
  "scripts/verify-xeno-trials-franchise-stage-ui-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "e87741d4510d3acaad78cb9df8194f56a4da9d9f1755f9ee8abf0c03defe932a",
    "currentSha256": "20f26174facc06b5ac064584ec657420e00d1986d5d9769d2c90adb65fd7bd66"
  },
  "scripts/verify-xeno-trials-franchise-stages-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "03175d6248c93ff9bb496c2880a3138e7a6c52af89e86d2f8510381b29a784ca",
    "currentSha256": "df8b0ddf807882b505b4b0d7f3d6c5faa7434c913a73f61504078c7d06de4a90"
  },
  "scripts/verify-xeno-trials-i18n-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "2c330325962fb53ae5f36670b45f2f6e712c6047faafabc53fb9b519c2702861",
    "currentSha256": "406352c5fadf875e0027f07e98e8068c64086a825a00f02ab74275b0ba878f11"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "previousSha256": "d9b0f2405eeae7eb2b1ea0d1f6a389ac736f89f4558e9e66c965b58498ebd90c",
    "currentSha256": "56a53509b997c06888a7eff08a98baed78b496ae587ae963ba9c11fb5400cf27"
  },
  "src/xeno-trials-data-v96.js": {
    "kind": "runtime",
    "previousSha256": "b47b1003093ab9bc8ead8df1f54426e1b7afa134affa2c3da5a5b251cf5a1679",
    "currentSha256": "e947b0036785be19d94c20ba00f24963ebe0bd34b5fd4a9ac3d9ec8337f81152"
  },
  "src/xeno-trials-franchise-stage-scenes-v192.js": {
    "kind": "runtime",
    "previousSha256": "a84c257a126065850a24a15ad6cefceaee324d0e310e114695f8453b0e11cdb4",
    "currentSha256": "49dec3de69ad3cf81258f122c0a755a8777e3e120f63b08da01dbf976477ef6c"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "bfc51c36e372ef2e7eaa1d45970eef30b6bb15f213281d90b660e21afab08d2d",
    "currentSha256": "b125d7ebb04e9a5204f26fdec8113fd147e4b3ca5f6f62a6a00e5db7fc7b8312"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "d75d4b20999a793aa87993922e32d109759d3dba3e7a500d50f3d829068fcb84",
    "currentSha256": "0040561476b5ac3a129c0b5bcab4e7047a781d60fda226b1db5961d9bb5496ce"
  }
});
export const ORIGINAL_ARENAS_NEW_INPUTS_V193 = freezeReceipts({
  "assets/openai/stages/xeno-trials-v193/colony/abyssal-pumps.png": {
    "kind": "asset",
    "sha256": "58e546406d13d99a52fc805dc6bf939342a76333e6d7fa30f5524b2c52f3cd82"
  },
  "assets/openai/stages/xeno-trials-v193/colony/orbital-concourse.png": {
    "kind": "asset",
    "sha256": "91207e53ac356833733f493705e98c1691cdf27f471a83285e5871f3b4b33d73"
  },
  "assets/openai/stages/xeno-trials-v193/colony/polar-operations.png": {
    "kind": "asset",
    "sha256": "8ad5ffa956ddf73ba98117fe62d85bb31b3bfa410c1adca54182546a1d930961"
  },
  "assets/openai/stages/xeno-trials-v193/colony/triage-pavilion.png": {
    "kind": "asset",
    "sha256": "d615106abfbff40479e5f07cd5d6f3aac55f246982dec369a69270685d05daf7"
  },
  "assets/openai/stages/xeno-trials-v193/frontier/basalt-survey-vault.png": {
    "kind": "asset",
    "sha256": "cc89267f385a723c117206b03c42dc61af85f5391e0454e9e4308f7cefe8f72f"
  },
  "assets/openai/stages/xeno-trials-v193/frontier/cloud-harvester.png": {
    "kind": "asset",
    "sha256": "1bff4e355be7978587219b8b479a9d927125cb61eb9593e43eeae0519ba359f3"
  },
  "assets/openai/stages/xeno-trials-v193/frontier/robotics-theater.png": {
    "kind": "asset",
    "sha256": "6fc978e67f1d73131ccb6ec3f5b58a79a561e24f5865d8dabf4ec78ef1f3df95"
  },
  "assets/openai/stages/xeno-trials-v193/frontier/salvage-cradle.png": {
    "kind": "asset",
    "sha256": "4b0f119491cc08a4fd37eb1840a942a09d3eb4c81e718a247cf61f6399532fd0"
  },
  "assets/openai/stages/xeno-trials-v193/industrial/casting-floor.png": {
    "kind": "asset",
    "sha256": "63c66706853b31502b7dde7c4c181d91e2ef5034178482512c996c24b5424b5d"
  },
  "assets/openai/stages/xeno-trials-v193/industrial/freight-flight-deck.png": {
    "kind": "asset",
    "sha256": "b3134ff4c6b990eea92609696e4419d68f262b47bc76e98028e4a111f2c3d838"
  },
  "assets/openai/stages/xeno-trials-v193/industrial/hibernation-ring.png": {
    "kind": "asset",
    "sha256": "60910d88c850cd6122afc089268234fef438dd13d5a7acf6c708a4e77e99d832"
  },
  "assets/openai/stages/xeno-trials-v193/industrial/tender-service-rack.png": {
    "kind": "asset",
    "sha256": "411530b3a442653f728cae1cf8603f955ba68e485a2bac4d6c767ea14232dd2d"
  },
  "scripts/public-xeno-original-arena-admissions-v193.mjs": {
    "kind": "verifier",
    "sha256": "7272f29dc23cd9c48e53406062ec090d0f9fcd75757e7e940be5e18bc3f83a1f"
  },
  "scripts/verify-xeno-original-arenas-audit-v193.mjs": {
    "kind": "verifier",
    "sha256": "3e198e006f540c68a8a2d99b3c25d19d25162b147b327cf3b7b347a533efd7b6"
  },
  "scripts/verify-xeno-original-arenas-v193.mjs": {
    "kind": "verifier",
    "sha256": "3aafbc5fcd657f7c6e32dccc95d1a36008a0a6ace9f184d09ece5b89adcc6f9a"
  },
  "src/xeno-trials-original-arenas-v193.js": {
    "kind": "runtime",
    "sha256": "fda7109a3acb4ca40266d75655c485666d6ad8e639b2b0f031d8961d5c608d19"
  }
});

export function reviewedOriginalArenasDigestV193(path, endpointV192) {
  if (!Object.hasOwn(ORIGINAL_ARENAS_SUCCESSORS_V193, path)) return reviewedIconicStagesDigestV194(path, endpointV192);
  const receipt = ORIGINAL_ARENAS_SUCCESSORS_V193[path];
  assert.equal(endpointV192, receipt.previousSha256, 'Incorrect V192 endpoint for V193: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V193 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V193 successor: ' + path);
  return reviewedIconicStagesDigestV194(path, receipt.currentSha256);
}

export function originalArenasRuntimeSourcesV193(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(ORIGINAL_ARENAS_SUCCESSORS_V193)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedIconicStagesDigestV194(path, receipt.currentSha256);
    if (result[path] !== undefined)
      assert.ok([receipt.previousSha256, receipt.currentSha256, current].includes(result[path]), 'Incorrect V193 runtime view predecessor: ' + path);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(ORIGINAL_ARENAS_NEW_INPUTS_V193)) {
    if (receipt.kind === 'runtime') result[path] = reviewedIconicStagesDigestV194(path, receipt.sha256);
  }
  return iconicStagesRuntimeSourcesV194(result);
}

export function verifyOriginalArenasV193(readSource = readRepository) {
  const successors = Object.entries(ORIGINAL_ARENAS_SUCCESSORS_V193);
  const inputs = Object.entries(ORIGINAL_ARENAS_NEW_INPUTS_V193);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V193 inputs await final source freeze');

  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V193 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-original-arenas-v193.mjs'), 'V193 cannot admit its own bytes');
  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V193 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedOriginalArenasDigestV193(path, receipt.previousSha256), 'Unreviewed V193 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && kinds.has(receipt.kind) && validHash(receipt.sha256), 'Invalid V193 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), reviewedIconicStagesDigestV194(path, receipt.sha256), 'Unreviewed V193 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(ORIGINAL_ARENAS_HISTORICAL_DECLARATIONS_V193)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  verifyIconicStagesV194(readSource);
  return Object.freeze({
    baselineCommit: ORIGINAL_ARENAS_BASELINE_V193,
    successors: successors.length,
    addedInputs: inputs.length,
    historicalResultsTransferred: false
  });
}
