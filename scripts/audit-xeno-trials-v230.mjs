import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V230 = '0fb2ac0c03465fa76c977a4ef883374a4c791f16';
export const XENO_TRIALS_DECLARATIONS_V230 = freeze({
  "scripts/audit-xeno-trials-v229.mjs": {
    "start": "export const XENO_TRIALS_BASELINE_V229",
    "end": "\nexport function reviewedXenoTrialsDigestV229",
    "sha256": "7b83338c8dffd8307c08270be2b2a2f7d20f117a372321c79904e5cf6ca9c8d5"
  }
});
export const XENO_TRIALS_SUCCESSORS_V230 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "abd2978dd48e668de4864c222deab1c2e190f0c8c24fb20ee6b75dec16e91453",
    "previousSha256": "499fffcfa1af01680eab6d33f062f1f899389da28507272d635282d1f7e6fbdb"
  },
  "scripts/audit-xeno-trials-v229.mjs": {
    "kind": "tooling",
    "sha256": "030858276c7c16c575079bf202861edf0604d4d46585866d4d940c09d34f0ea4",
    "previousSha256": "74f8a4545432f56021b23193b46fce1c71f2d0bb3c54962506d15c2a3b27c9b9"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "e31f8a8bde4617fadf8dce67503217503e63ad3ad5a0976231cdf21361ebb124",
    "previousSha256": "a8c1a8173f2c1f60fc92cda929848beb673f42524bbbd804a7a4a97db3b1a7ce"
  },
  "scripts/verify-audit-continuation-v156.mjs": {
    "kind": "tooling",
    "sha256": "17e560360f73cc88f6133016cdd953004ac18f3d8fc4d533ebc203de6d2c7115",
    "previousSha256": "3806aea6670131ca1981878b522392ac2a1094c560e9cb1cbe00916b90675f4d"
  },
  "scripts/verify-audit-continuation-v157.mjs": {
    "kind": "tooling",
    "sha256": "aa39b15df90597ef7f2fbfa18bc08fd361e47ea60dc4390d491b7f8def5eafea",
    "previousSha256": "641676a21373c30747555d01f180a8c38f07819091860c6c1924bf6f5c08b5cf"
  },
  "scripts/verify-audit-continuation-v158.mjs": {
    "kind": "tooling",
    "sha256": "6c399f2578eb199b23dd77916bab56fcc245cdfced32e2f46444180e31b49903",
    "previousSha256": "87ca45b2c3c48d96e9ae02f4a57241b723372e3e12cd172ef4f978f34ba3eb98"
  },
  "scripts/verify-audit-continuation-v159.mjs": {
    "kind": "tooling",
    "sha256": "6cd0d0dcec3fe15bfde7316ed7b1118131d12629c044c0b7fcd223ddf2d82595",
    "previousSha256": "2ebf516d1b324e6b89b3b180ff98fc2caa3e1f4d89424afb020b70c0389d90d2"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "ffa6adb6408345d0e7457cf8e4e5203f6e3d7ec14b685a66b9f31712f522fa23",
    "previousSha256": "8392642310c45a7676b11af96ae0a1d984828b74f591175d2ef8280db684e0d3"
  },
  "scripts/verify-native-rig-catalog-v163.mjs": {
    "kind": "tooling",
    "sha256": "37d0b7b4fac3d4216f714ff10edb0f2a48713f3f04ee98f3bb945e61aa43962a",
    "previousSha256": "3264d4009437b84e25979fb7deeb20b1bc401cd2d12d1721b9a1566fde24afe3"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "62b298004bbf052d06cfdfe04d5e87a68613baae31fc33c8c65ba2a29b97b0d0",
    "previousSha256": "d296473ec81142c058949291cf66636e7f63744727f3b2a5e50b45a0b08bcd2a"
  },
  "scripts/verify-xeno-arbiter-protocols-v191.mjs": {
    "kind": "tooling",
    "sha256": "385eae022b8d4d872180655bc0d8fcb5013144cfd9f49c602969ce21def9e017",
    "previousSha256": "346eeae53f154b0c1b3d75627f61d056d5b4211859ea9eacad239704aab2f89a"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "e81f4dbfd338c0139bab98267ecd789ea7fd26b6058556ec58ce16b5769acba9",
    "previousSha256": "38d56691269a06286237be8c2c3dcd5f618945c110f1a43e07a1df095de71f9e"
  },
  "scripts/verify-xeno-trials-acid-v152.mjs": {
    "kind": "tooling",
    "sha256": "19454d08d09cd07184689fc9a79c41bde797e3741eafa35cb9161d92b4a2a95e",
    "previousSha256": "9bd1e91d9d7679abbb39579bd9e031e667db3624b52ab4777a7719c59d147308"
  },
  "scripts/verify-xeno-trials-actions-v199.mjs": {
    "kind": "tooling",
    "sha256": "5d7f279c61d62bc8866ea740910d2370df66a212312cc58472a9049faaf8095c",
    "previousSha256": "f31cd18cafdeb5a9e9f838b8709536c7519667e4c41bb0755c66c90e15f2852b"
  },
  "scripts/verify-xeno-trials-animation-audio-i18n-v189.mjs": {
    "kind": "tooling",
    "sha256": "e810b78bb942837bbb9e5116449c24042a427305547f605792db34912b8267d6",
    "previousSha256": "ce7d6098439f814dfe5512e999519f61032ba846f278a6f700e2f9d0e6306604"
  },
  "scripts/verify-xeno-trials-animation-coverage-v189.mjs": {
    "kind": "tooling",
    "sha256": "3e0b19ebff808269f8e74d75f49f8fa805f68c1184dbd4f80ff274c85ba87c2d",
    "previousSha256": "2a9634934eea04372a9b8cef745308854a8d809d0bc56bb6571d840dd7468daf"
  },
  "scripts/verify-xeno-trials-animation-coverage-v191.mjs": {
    "kind": "tooling",
    "sha256": "9bb935f8e391023d5d45ed9daf1506dbd4b56059ce9ffbbf80614bb12f1ae620",
    "previousSha256": "6b0d3a99128faa4e068709e53a231df1721aafa8bb5c3c26a4a61bf5f327ed94"
  },
  "scripts/verify-xeno-trials-animation-ui-v189.mjs": {
    "kind": "tooling",
    "sha256": "00915d35f169e91f08410c21e01cd6c8068b6786e1991da4ebe9e03b685b8146",
    "previousSha256": "876ca5638cd6fdb426bff988e399538d0f3be15fd27d9f6cb9496de4b6d5fcb5"
  },
  "scripts/verify-xeno-trials-castes-v151.mjs": {
    "kind": "tooling",
    "sha256": "cba8faf074c24d3644a08b378c1849122b3c1539ec592631fa4cc6139b0b0792",
    "previousSha256": "c19f6ec4d05a7e252f9dd33e6ca1f539caafb4f19075b6913054a2f0c55136e0"
  },
  "scripts/verify-xeno-trials-controls-v150.mjs": {
    "kind": "tooling",
    "sha256": "d43e3f7544d88fb02fe063ded60ca1e9b3f8bf2e0b901ad13dfd08d0c44ef756",
    "previousSha256": "532e144f7a337b1ee8b8e9bd420bd23fe2f103970072891a30adf190c153fe76"
  },
  "scripts/verify-xeno-trials-feedback-v149.mjs": {
    "kind": "tooling",
    "sha256": "1752e22711922918873cd78dad55bcf155d063eb16c9f1c1b3bd833cddb3ba5a",
    "previousSha256": "2cc60dbd099da623eac050029484ba4cae97b6e921e624a5dccee00fd9d27f50"
  },
  "scripts/verify-xeno-trials-grapple-v153.mjs": {
    "kind": "tooling",
    "sha256": "fe2ddc1a71b91be9c40096d7b7d258ac99bc6717e972e90ee5f98aafa2066fdf",
    "previousSha256": "3ee6f7c175061a97b5656c4f35a2782af105ccc7523b6db3d681fe7185baecd3"
  },
  "scripts/verify-xeno-trials-menu-media-v222.mjs": {
    "kind": "tooling",
    "sha256": "acb833ba5b9c1c125e1be3e679bb0c4f770dec009b018c528cd23a5d7c44f4ee",
    "previousSha256": "00a065f5f68c89f99ce5cb9cce6a2a804ce292166a6dc2413989a960f4132e15"
  },
  "scripts/verify-xeno-trials-presentations-v156.mjs": {
    "kind": "tooling",
    "sha256": "06f8a06ab2a028a56b62d98892f725718b854620182b388ca82df93fa2d065e9",
    "previousSha256": "3e9dfb0ffda695cb321c3d00ca5662c805713b3f851124f91cb7510cfad3f111"
  },
  "scripts/verify-xeno-trials-priorities-v197.mjs": {
    "kind": "tooling",
    "sha256": "1e4991784c1fd87b8b368450a8db06f8d447ac220822e0b5c8351d7f60ac2a81",
    "previousSha256": "7abd7a79566cfbbf24006f3f3924f98f9b3e2d32e22878c936b1a056f7eb1b50"
  },
  "scripts/verify-xeno-trials-research-v209.mjs": {
    "kind": "tooling",
    "sha256": "198db417a304bee11f3dea5b6feacccdf00c21816fd1aa702faf6811d60c68d9",
    "previousSha256": "97212f679f9480d3372d15b2385f7abe1751a50b0aa3da818c7ec31345e4b620"
  },
  "scripts/verify-xeno-trials-rig-v154.mjs": {
    "kind": "tooling",
    "sha256": "35c033281db5440483b62d29799ba60daccaf164a3e5944f5084e903a5a32863",
    "previousSha256": "27feaf6aaa3ae4b55ed7b5709c82664a6e175b13b78c2728b21f73f409f056bb"
  },
  "scripts/verify-xeno-trials-roster-audit-v227.mjs": {
    "kind": "tooling",
    "sha256": "8a27c7fb546392c9691325b17cd666775b4b9a9a0cbe59745a558232c92b30cc",
    "previousSha256": "21ea020e171e4c84879f331f9511c664e4039f9bc9d4986e94561ba9143f1d34"
  },
  "scripts/verify-xeno-trials-roster-ui-v227.mjs": {
    "kind": "tooling",
    "sha256": "6279cb3d7f571544dbef6a175de6a2dd58314f3fb97ca196286a5e325858820e",
    "previousSha256": "aada644df05bdf33cb7c0f0fcf15a8aa4f3f55a4899b842edde1f2467ac0d21d"
  },
  "scripts/verify-xeno-trials-sequences-v155.mjs": {
    "kind": "tooling",
    "sha256": "4fd9521619d30e4507da1d07fdfe0284a34827cc31bc8bd03669c01e8fe368cf",
    "previousSha256": "1a758b0533212c6f8716fb005260304e80311b78bc363f8eb3c2d7a67e370fec"
  },
  "scripts/verify-xeno-trials-signatures-v147.mjs": {
    "kind": "tooling",
    "sha256": "0d2d750f68f9dc24d766d4a2136f3e71a94af42cec4fb85066e7a26a7d60f69e",
    "previousSha256": "c6195533e405473fc07dc53f6d52b5043261dde07c70bdc1226db6765c6afe57"
  },
  "scripts/verify-xeno-trials-stage-hazards-v188.mjs": {
    "kind": "tooling",
    "sha256": "cc57b848831be9d048808bceb45fcada6cb03cca1cf8de054d3e720cc60d967d",
    "previousSha256": "922fe4af05e466b91135b1c7f7aeb30b74c8265788718487dea3790ad7aaa081"
  },
  "scripts/verify-xeno-trials-supers-v148.mjs": {
    "kind": "tooling",
    "sha256": "16b725a6c47162a8e1997a91b711c6e8983bdf7aaf560817a1482e4d97ecc20f",
    "previousSha256": "52f234925569de1db69eabe6ba06829176645549fd3b4b686ae5471f410f399d"
  },
  "src/xeno-trials-data-v96.js": {
    "kind": "runtime",
    "sha256": "75afd4a57805704c9ee0f523c9bb19cbe37a7ac8e96fd52e8ca493e0ed5bb401",
    "previousSha256": "78560a3417aaf6a93bbedf6f1e653f7a5f84f0a33c5dba7aa86a8b88e5f8d458"
  },
  "src/xeno-trials-offline-v223.js": {
    "kind": "runtime",
    "sha256": "a8035bbc07046810ac47e3733d5289fa2b6a2cd8c48e95aa786c0dd9e10f9a5d",
    "previousSha256": "4d71af5ec7fe3fd1e8048b03d6dbbf379130046e267d994df3a4efe17891200f"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "2044203eb774d0d239ab04d2cfb82db89e5d1d7ed72702122d54722097eac22c",
    "previousSha256": "5b45ef050dc93ff932fbc16c9b88ae38c6f3a3ede9a48febf58b1af3a92d5d58"
  },
  "src/xeno-trials-selection-v97.js": {
    "kind": "runtime",
    "sha256": "f4cec995e8f913b00919d4795ad3800f52bbdb774e55c4ab9e29f91ab4b413f3",
    "previousSha256": "1855fdd1aee70c83f0cd0e47892c87ee83e3ce6450390150c74123d40a9b3e08"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "209e96c8a0c0db7ed60858fc8523d2ebb5ec452b7343a8f5867f3b4e865668fc",
    "previousSha256": "d090724a6bbcf687498f7a067d78cb14d8366dd370f11eb061e6ee905cb23d62"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "5df642635882f1c2a52a77de8f68090e27a566f71f79e26a9eec9b1911455771",
    "previousSha256": "776eb8906d11fe0849dd02810ac2ff4cd7ce98af4c8b08d7e5a66f3cdac403f2"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V230 = freeze({
  "assets/openai/xeno-trials-v230/warrior-intro.png": {
    "kind": "asset",
    "sha256": "9efcd828be3067c83a73f4b3214ddeaf7bea057bbfec0f85d26b276342647d7e"
  },
  "assets/openai/xeno-trials-v230/warrior-select.png": {
    "kind": "asset",
    "sha256": "469b8c02f9b21df04aca935f65852f365b0ea51abcbe94735ac2965ffe116471"
  },
  "docs/forge/xeno-trials/V230-ROSTER-PRESENTATIONS.md": {
    "kind": "documentation",
    "sha256": "bf87f4972e3382a1308c00ab98cd730d9719103c90530b290a9ce3a5a312f396"
  },
  "docs/forge/xeno-trials/combat-guide-coverage-v230.json": {
    "kind": "documentation",
    "sha256": "2e9649305858d324aafb16d54ad92dc163a4f50551c73285e1ed11957ce973a4"
  },
  "docs/forge/xeno-trials/presentation-art-v230.json": {
    "kind": "documentation",
    "sha256": "6a76f01611316676d52a0de9555837b94c9a4d3983bfd38e27bb38fc5cbcdfb7"
  },
  "scripts/public-xeno-presentation-admissions-v230.mjs": {
    "kind": "tooling",
    "sha256": "78b3c860a92b9df0bcbcf96cd596de1e46bebbe9bc74dae6902659e66eaf5201"
  },
  "scripts/verify-xeno-trials-presentation-art-v230.mjs": {
    "kind": "tooling",
    "sha256": "9775ff0f428b5b8a4f7b2321c21af0c47ba282ec1231bff5149ca2f94952e672"
  },
  "scripts/verify-xeno-trials-presentation-v230.mjs": {
    "kind": "tooling",
    "sha256": "fe1648d735e357fc50adeec2926243af7d12a9d31dde243e9aa1fc1c135f10aa"
  },
  "scripts/verify-xeno-trials-recruits-v230.mjs": {
    "kind": "tooling",
    "sha256": "9811a0866e453454ad482a979b4d1cd6de17fda90c4379d1a2d8810476068a02"
  },
  "scripts/verify-xeno-trials-selection-motion-v230.mjs": {
    "kind": "tooling",
    "sha256": "8fa60e7ef490b6d2db6f79cf2e3315a0702beb5dde716d6588f044ef3021b5bf"
  },
  "src/xeno-trials-presentation-art-v230.js": {
    "kind": "runtime",
    "sha256": "3d83622167a75daaeaea2f164e2a31276f074b3ebb32eefb426d504992dfe619"
  },
  "src/xeno-trials-presentation-v230.js": {
    "kind": "runtime",
    "sha256": "24c296a96b23631b699b563edbc902e44f4ec84551f16610a6fab9e8ef7e5ca0"
  },
  "src/xeno-trials-recruits-v230.js": {
    "kind": "runtime",
    "sha256": "c045dd40f0f048071775f49a4c17b44ef2a9cb1f0d7fb34863d13ecca20ecb10"
  },
  "src/xeno-trials-selection-motion-v230.js": {
    "kind": "runtime",
    "sha256": "626dc580ed2fecfaa6d044001bcd4c240158237293756f86ac9cb3d87ab29866"
  }
});

export function reviewedXenoTrialsDigestV230(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V230, path)) return endpoint;
  const receipt = XENO_TRIALS_SUCCESSORS_V230[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V229 endpoint for V230: ' + path);
  return receipt.sha256;
}

export function xenoTrialsRuntimeSourcesV230(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V230)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoTrialsDigestV230(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V230)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V230 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoTrialsV230(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V230);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V230);
  assert.ok(successors.length > 0, 'Incomplete V230 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v230.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V230 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V230 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V230 receipt: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V230 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V230 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V230 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V230)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V229 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V229 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V230, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
