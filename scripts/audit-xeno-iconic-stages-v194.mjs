/** Source admission for V194, anchored to the published V193 tree. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

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

export const ICONIC_STAGES_BASELINE_V194 = '371ccf06bebf3e1ce8e2e8d0772669fcdebf9354';
export const ICONIC_STAGES_HISTORICAL_DECLARATIONS_V194 = freezeReceipts({
  'scripts/audit-xeno-original-arenas-v193.mjs': {
    start: 'export const ORIGINAL_ARENAS_BASELINE_V193',
    end: '\nexport function reviewedOriginalArenasDigestV193',
    sha256: '6fbf90602a9df37c701faaedf85074e3552a34e7386ff66a3917fabe955fe946'
  }
});

// Filled after the product sources and their targeted checks are frozen.
export const ICONIC_STAGES_SUCCESSORS_V194 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "b8183038b2ad6081a2fdd36b76614b3fa122fb53c22e3a32fe5f03ecdce334f3",
    "currentSha256": "22c26aace0a2b3626baac1ea5989cfe0083dbb2a89bd8603438173b4f23e6839"
  },
  "scripts/audit-xeno-original-arenas-v193.mjs": {
    "kind": "verifier",
    "previousSha256": "c53cf633d4b603cf7b175f493816a191313e70ffd8adfd8b61dd3ac8fd2f6f8d",
    "currentSha256": "588ee28157a4746bb987de77437218636be54be96773b3941b6a1fb896dbc87f"
  },
  "scripts/build-asset-filter.mjs": {
    "kind": "verifier",
    "previousSha256": "c94c88f252e6d61996cf2a5b80fcd18bfb11e74847ba20081bb7136c4abba4ff",
    "currentSha256": "1bca5d7cd1737eccfacd82fc0297004e59adf279cf6e02abfd19a123992e513d"
  },
  "scripts/build.mjs": {
    "kind": "verifier",
    "previousSha256": "867cd2ccdaa6cd9513ec5cc165734875c5a852b8e9d6e892a908fae48fdfb048",
    "currentSha256": "79cc48524255048f01ab1be8629fc121f731f04c232a0c0ba9bdec7c216b4678"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "c83150c2cd179d994e81b74ae49e565e45122451a5f01a1814b753a18c35127d",
    "currentSha256": "bb54d93654af6501df67f42290044d6f976272f623ac961474d8c5c04aec69d2"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "8bb7a46fe1b74d45a24cc43f082de02d907f8db293dfc03af7d343f37db927d8",
    "currentSha256": "5ed569c7e0a2958eb8f014aee99b1d4725451005b07a9d585f8067d2abd0539a"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "7f614a33cb1a0a770196c77a9befd6feee3c0f8549c424efe88ff547b823d268",
    "currentSha256": "b57a5f720668e617db1b935357cc845a3f0d0a23dd0f80465d78eeb4b5ac5bcc"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "fb45411a569acddc5e1b02408ffdda9488f89a0b666b75efab7c3c950d45eeb4",
    "currentSha256": "df71f84a77a3e0b5152cde5fd8a88fc463b08661476b23bd61b9cd3ce4ef0b28"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "d5de2d3f27b8239ca2cd4f316558eb1e544dd78e60b1402170520cabab8284fb",
    "currentSha256": "0c70cacb594a01c1251999b28ab22b4000cf18ae6bc83bb523610535028b7736"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "4bcd62b57f73a3f8eeb2d8c7e19b5082880ef1c7915fbab8e02672751dec68a7",
    "currentSha256": "5e5c2827202f58cfc4ab06b7864d6d28f5477b653581df649d243a6c324e7192"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "850293798424b072518e0d1abbb692a0b0d7e08c4f58096a360ba0dc6dc7ff5e",
    "currentSha256": "d8d14f67017737dcd13c27ae0cbdca139fc7af7dd90f496704819febe401624c"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "14616612001f67f6d43f77abb1737567419b7034dd2c590c5ee201536e4e1cea",
    "currentSha256": "2bf78028fc6a1306a842e9d1a57d9f840889d59c1b0f9cfbaeb01f67fa2a8d60"
  },
  "scripts/verify-xeno-original-arenas-audit-v193.mjs": {
    "kind": "verifier",
    "previousSha256": "3e198e006f540c68a8a2d99b3c25d19d25162b147b327cf3b7b347a533efd7b6",
    "currentSha256": "c151b31406f07e66229f267ecb8e8ac375c41702acc5896a91fc5039993abdea"
  },
  "scripts/verify-xeno-original-arenas-v193.mjs": {
    "kind": "verifier",
    "previousSha256": "3aafbc5fcd657f7c6e32dccc95d1a36008a0a6ace9f184d09ece5b89adcc6f9a",
    "currentSha256": "1fab9b5e4ccb9d8b88a6ce63456db53f3118cd0bbbe5efd905bc7b7ed8714ce2"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "3e3a3b4d6612acd740a97746f7823cd27d7d93e132093a808d83e844523a9f82",
    "currentSha256": "04a460335b231182df8325625fa0a178358a10a2a14a153aec4ff2d18b6c2fdd"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "81e677b6bf13f68d0eac305788c024d09f2d33bed453d8236e024709a38345a0",
    "currentSha256": "1b4e256e64dafb44b62c8cc14bbae94868a8d5dc610f014c333bcf41f717b97b"
  },
  "scripts/verify-xeno-trials-franchise-stage-render-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "880ce131e06d7ffab5ab7f757c7dcb05a41fbe25f6d49dcba5bc9be8c14b683f",
    "currentSha256": "4a08a7ff45ad7f7020f86f85cb5afd11fb19cdf8a1e813f1f78b413afc3728e2"
  },
  "scripts/verify-xeno-trials-franchise-stage-ui-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "20f26174facc06b5ac064584ec657420e00d1986d5d9769d2c90adb65fd7bd66",
    "currentSha256": "8b9be577ee9296576384111f88e2f1abba7901481baf53ae6e21a9858cb1142a"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "previousSha256": "56a53509b997c06888a7eff08a98baed78b496ae587ae963ba9c11fb5400cf27",
    "currentSha256": "b20cf7bff73badd41d6ff98e08f38ad31b58e6f76345b6459e0e5b1406646668"
  },
  "src/xeno-trials-data-v96.js": {
    "kind": "runtime",
    "previousSha256": "e947b0036785be19d94c20ba00f24963ebe0bd34b5fd4a9ac3d9ec8337f81152",
    "currentSha256": "334acb5eca041cce9358281d485b7daa83c36558edc9beff621c696f71d19049"
  },
  "src/xeno-trials-franchise-stage-render-v192.js": {
    "kind": "runtime",
    "previousSha256": "af337193ed34e7bddc1a2724be1f8b23c752ab580f30990d5abab0e8c781fb64",
    "currentSha256": "2a1b3f7ea250a00c1b8c57e33d21cedc1fa6f66b192b975e42d65b7ded7176bc"
  },
  "src/xeno-trials-franchise-stage-scenes-v192.js": {
    "kind": "runtime",
    "previousSha256": "49dec3de69ad3cf81258f122c0a755a8777e3e120f63b08da01dbf976477ef6c",
    "currentSha256": "af4a3f436a7493c296289a0d3c16940699f6738af8526978a2f074d969db6b8c"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "previousSha256": "ea3d2105ed4d6a0e4f39fd8defe10799048cc667a602f30271c2a3c0a9a0cde4",
    "currentSha256": "811d2c4ec16e19ab8fe809c2be657128bc19086074ba73f4ea9f2d96c51dd211"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "previousSha256": "b125d7ebb04e9a5204f26fdec8113fd147e4b3ca5f6f62a6a00e5db7fc7b8312",
    "currentSha256": "11c5a8a8970492cf0de11725e1fe82866cc65197d99dcc1b151faada1d8041c0"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "0040561476b5ac3a129c0b5bcab4e7047a781d60fda226b1db5961d9bb5496ce",
    "currentSha256": "c184a920f652f026a57cf0aeed90c5a3d6ceff0caa9ff6371ee20b68e7fe92dd"
  }
});
export const ICONIC_STAGES_NEW_INPUTS_V194 = freezeReceipts({
  "assets/openai/stages/xeno-trials-v194/auriga-nursery-base.png": {
    "kind": "asset",
    "sha256": "f5810824cb43afeecd8cd069dd1d6d9544bfcb6517cc2b721b82faaa059aca54"
  },
  "assets/openai/stages/xeno-trials-v194/auriga-nursery-props.png": {
    "kind": "asset",
    "sha256": "cae9f85860511da146d0f7c20dbb91b0b36f97dcfb5296c2e91b3766f14915aa"
  },
  "assets/openai/stages/xeno-trials-v194/fiorina-tunnels-base.png": {
    "kind": "asset",
    "sha256": "7f3b2e3cec97d7be65953ca278f4cac17459893eeda0edc3ca7dae882ead8f6d"
  },
  "assets/openai/stages/xeno-trials-v194/fiorina-tunnels-props.png": {
    "kind": "asset",
    "sha256": "2dc1657f437c33c9b7a923be0d9713a62333dda1ae59ac4faefcb0ca3f7bba3d"
  },
  "assets/openai/stages/xeno-trials-v194/hadleys-hope-medlab-base.png": {
    "kind": "asset",
    "sha256": "0820ecc73c1a6181dc1d20de776052bf095b2577fae45f1983be11af63d95390"
  },
  "assets/openai/stages/xeno-trials-v194/hadleys-hope-medlab-props.png": {
    "kind": "asset",
    "sha256": "65aa8cb1f1ddb40ff2bb859c74c2d76051a77f0f92c5f17a2f620158b84a5e8b"
  },
  "assets/openai/stages/xeno-trials-v194/lv426-egg-hold-base.png": {
    "kind": "asset",
    "sha256": "c65112e96614a3cc06badd1d04d72c80f28861f544b78893a3c4d4af7ff4a05b"
  },
  "assets/openai/stages/xeno-trials-v194/lv426-egg-hold-props.png": {
    "kind": "asset",
    "sha256": "997f4484dc8e877abdad9cfe5885c107387b93e3a940b5a7498fde92c122d622"
  },
  "assets/openai/stages/xeno-trials-v194/narcissus-cabin-base.png": {
    "kind": "asset",
    "sha256": "e709366f9ded6041640626ee4005d90b9c7f97b0cea0e5483a487c864f1c6a24"
  },
  "assets/openai/stages/xeno-trials-v194/narcissus-cabin-props.png": {
    "kind": "asset",
    "sha256": "f71bd061693e243ef55536150874e3c371af66f4f486ad8d7895c0a3a528c38a"
  },
  "assets/openai/stages/xeno-trials-v194/nostromo-hypersleep-base.png": {
    "kind": "asset",
    "sha256": "686e1bc1d04bc547b5aba3ceab2eb98f119a70ebf34e7ac701a1d87d7e528485"
  },
  "assets/openai/stages/xeno-trials-v194/nostromo-hypersleep-props.png": {
    "kind": "asset",
    "sha256": "630898a4cd13d421e28b43d50e1d4e169737690edd88eb5d57121b56d103b2f5"
  },
  "assets/openai/stages/xeno-trials-v194/prometheus-medpod-base.png": {
    "kind": "asset",
    "sha256": "6b0dc27c1a35a4e119e912d085e7211835a366a3061aa8f80ba6a192d6110bde"
  },
  "assets/openai/stages/xeno-trials-v194/prometheus-medpod-props.png": {
    "kind": "asset",
    "sha256": "2508eb67a426ccc84bf377b65104f5e0013735f814cb021a2a43ad51b52e5031"
  },
  "assets/openai/stages/xeno-trials-v194/renaissance-zero-g-base.png": {
    "kind": "asset",
    "sha256": "a64491574c2c9d9a7823b5d6cec1213b02b052e69dd588ec69853fb7bc980ffc"
  },
  "assets/openai/stages/xeno-trials-v194/renaissance-zero-g-props.png": {
    "kind": "asset",
    "sha256": "af7fef765335aa7149bec51c400aca2287dbe51f7949abbb41033ae6d42efd10"
  },
  "scripts/public-xeno-iconic-stage-admissions-v194.mjs": {
    "kind": "verifier",
    "sha256": "baf0d37a0c787b6c8ea12a6f998425114af34dfbbf5e6d54df32e4578e862440"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "sha256": "769dce201578df1e40cc48db8ae7fd4a468862b0245216f222a5c866b16894c3"
  },
  "scripts/verify-xeno-iconic-stages-v194.mjs": {
    "kind": "verifier",
    "sha256": "c41b559bdf1a8bab90e68eca7822bc73e4d8175175dea9ebf9bb54f2b661deec"
  },
  "src/xeno-trials-iconic-stages-v194.js": {
    "kind": "runtime",
    "sha256": "71e40095a880997dfb8985b7b64546e6a0bbf0171ab84ba5d7efa6cbc297e398"
  }
});

export function reviewedIconicStagesDigestV194(path, endpointV193) {
  if (!Object.hasOwn(ICONIC_STAGES_SUCCESSORS_V194, path)) return endpointV193;
  const receipt = ICONIC_STAGES_SUCCESSORS_V194[path];
  assert.equal(endpointV193, receipt.previousSha256, 'Incorrect V193 endpoint for V194: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V194 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V194 successor: ' + path);
  return receipt.currentSha256;
}

export function iconicStagesRuntimeSourcesV194(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(ICONIC_STAGES_SUCCESSORS_V194)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.currentSha256)
      assert.equal(result[path], receipt.previousSha256, 'Incorrect V194 runtime view predecessor: ' + path);
    result[path] = receipt.currentSha256;
  }
  for (const [path, receipt] of Object.entries(ICONIC_STAGES_NEW_INPUTS_V194)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect new V194 runtime digest: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyIconicStagesV194(readSource = readRepository) {
  const successors = Object.entries(ICONIC_STAGES_SUCCESSORS_V194);
  const inputs = Object.entries(ICONIC_STAGES_NEW_INPUTS_V194);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V194 inputs await final source freeze');

  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V194 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-iconic-stages-v194.mjs'), 'V194 cannot admit its own bytes');
  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V194 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedIconicStagesDigestV194(path, receipt.previousSha256), 'Unreviewed V194 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && kinds.has(receipt.kind) && validHash(receipt.sha256), 'Invalid V194 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V194 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(ICONIC_STAGES_HISTORICAL_DECLARATIONS_V194)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  return Object.freeze({
    baselineCommit: ICONIC_STAGES_BASELINE_V194,
    successors: successors.length,
    addedInputs: inputs.length,
    historicalResultsTransferred: false
  });
}
