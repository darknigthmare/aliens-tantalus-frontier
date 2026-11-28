import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V229 = 'e9832e50b65e7b40170cc67c17e81503c3f4f271';
export const XENO_TRIALS_DECLARATIONS_V229 = freeze({
  "scripts/audit-xeno-trials-v228.mjs": {
    "start": "export const XENO_TRIALS_BASELINE_V228",
    "end": "\nexport function reviewedXenoTrialsDigestV228",
    "sha256": "3cd83fa96ed6dd84df95fbbadb3644e39c25c5b5f785357de59488d561e3c364"
  }
});
export const XENO_TRIALS_SUCCESSORS_V229 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "499fffcfa1af01680eab6d33f062f1f899389da28507272d635282d1f7e6fbdb",
    "previousSha256": "1de64713d82eea9c2c68cc446eb77520adba2c745b3e9a12665cb613508ee3e4"
  },
  "scripts/audit-xeno-trials-v228.mjs": {
    "kind": "tooling",
    "sha256": "d51af1f89bfc82c4a48fadc43d1ac2ce6643706b71367b139b0112e4530f7396",
    "previousSha256": "3c824b783daf775b25d5dc244d71bdbf55f860c383fc6f0e39565f61ba8804d9"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "a8c1a8173f2c1f60fc92cda929848beb673f42524bbbd804a7a4a97db3b1a7ce",
    "previousSha256": "5da7388f5cebfd57446c8faa48239a06ec5826688156b2f9d90f84625dac05e4"
  },
  "scripts/public-xeno-pose-admissions-v209.mjs": {
    "kind": "tooling",
    "sha256": "814dbabd5d99098c69a1347ffc3c301550266d538ac4c2af6c30b31059cbe736",
    "previousSha256": "9368e5a05a48f27bf2adcf62e891823265b571fc125cbfae853e3e43be5638cf"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "8392642310c45a7676b11af96ae0a1d984828b74f591175d2ef8280db684e0d3",
    "previousSha256": "a85c621912832d7a9f201d3dcec982c62966d9fcbc7a196d834005b784e15b09"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "d296473ec81142c058949291cf66636e7f63744727f3b2a5e50b45a0b08bcd2a",
    "previousSha256": "5ce7cef9eb07a1dc4aba90646f60c5022e2762762df9090b0258d8973f61c172"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "38d56691269a06286237be8c2c3dcd5f618945c110f1a43e07a1df095de71f9e",
    "previousSha256": "f3974f8f20fb3859180fb287914c163c5ee5d7a668c8e7433e553945e3a76178"
  },
  "scripts/verify-xeno-trials-poses-v209.mjs": {
    "kind": "tooling",
    "sha256": "6e77b58805a15b90b49aec6a141ddd6e8ff1d9ec460f44c45bf6c9224d3c34cc",
    "previousSha256": "ae58d2b951502b76c11f06dcd05830a2032b10dc6ce54d6b83d38b1fa532a736"
  },
  "src/xeno-trials-poses-v209.js": {
    "kind": "runtime",
    "sha256": "7268c1858d827537a1720b2a9dc9396a01a8cb5698c74ee86643cbb818c4947b",
    "previousSha256": "ba39095a152afb65ade8c3bad17ff8abfcdd42229d0e6b201c968db9be1d284f"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "776eb8906d11fe0849dd02810ac2ff4cd7ce98af4c8b08d7e5a66f3cdac403f2",
    "previousSha256": "7d3004e7c7e82005e2e3d5a3a3f141969b0439bb42806c9f0cfefeaeef32b4a2"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V229 = freeze({
  "assets/openai/xeno-trials-v209/characters/boiler-heavy-contact-v229.png": {
    "kind": "asset",
    "sha256": "7c1bc2dbc566edc336b13c89a1d9fbf7c48426653609f4c47cefecc1006e7b08"
  },
  "assets/openai/xeno-trials-v209/characters/boiler-heavy-recovery-v229.png": {
    "kind": "asset",
    "sha256": "a5f509bad6f8bc1c1aba5fbebb28e35885584e448c8628d7032be35b1685587d"
  },
  "assets/openai/xeno-trials-v209/characters/boiler-heavy-windup-v229.png": {
    "kind": "asset",
    "sha256": "9134a7f64e5658c6dc6616e603ce0800ab96e36b070d39fda54c8a58896faa53"
  },
  "assets/openai/xeno-trials-v209/characters/boiler-light-contact-v229.png": {
    "kind": "asset",
    "sha256": "7f3ae95c95d3993c62669559f6bb138b3a605cafa197ee8b6f4de314c447260a"
  },
  "assets/openai/xeno-trials-v209/characters/boiler-light-recovery-v229.png": {
    "kind": "asset",
    "sha256": "9d5bd5483743e6e216c479485a82be6250adab5e61f7c0e70e1e008729356d8c"
  },
  "assets/openai/xeno-trials-v209/characters/boiler-light-windup-v229.png": {
    "kind": "asset",
    "sha256": "d9df03486712634df0fe7fa45b2b9c86cb87c947135131f16f759df5c198349f"
  },
  "assets/openai/xeno-trials-v209/characters/combat-synth-heavy-atlas-v229.png": {
    "kind": "asset",
    "sha256": "126d382bd6a8283660300dbcfe963f526c7f6643702f8dff5d39f54f4cb4b159"
  },
  "assets/openai/xeno-trials-v209/characters/combat-synth-light-atlas-v229.png": {
    "kind": "asset",
    "sha256": "bfc304d6139ff8633f05ac339243f206fc6749a7e2ac51209aeb90bd5567ca97"
  },
  "assets/openai/xeno-trials-v209/characters/predalien-heavy-contact-v229.png": {
    "kind": "asset",
    "sha256": "58d673302cfdeb7f215ab7dcb7a773af15d4279dc92fa8aebe5b11ff76c16df8"
  },
  "assets/openai/xeno-trials-v209/characters/predalien-heavy-recovery-v229.png": {
    "kind": "asset",
    "sha256": "4c2876a80882bb6d30c68faa40a8289942d19c6149d07d15b9640bdb7f81d176"
  },
  "assets/openai/xeno-trials-v209/characters/predalien-heavy-windup-v229.png": {
    "kind": "asset",
    "sha256": "81a5e06c8737f656f8e2a960682f898693fbe14cad9fbfd194e37e4c6f1432ec"
  },
  "assets/openai/xeno-trials-v209/characters/predalien-light-contact-v229.png": {
    "kind": "asset",
    "sha256": "6594f8e1d0f60c55236fcb85328aae3b68781c107b4962db1608ef995fa11064"
  },
  "assets/openai/xeno-trials-v209/characters/predalien-light-recovery-v229.png": {
    "kind": "asset",
    "sha256": "aa2b6066cb36bdd8ad454daa75b40cb287e1754b5efe2159dd28c4b971cb264d"
  },
  "assets/openai/xeno-trials-v209/characters/predalien-light-windup-v229.png": {
    "kind": "asset",
    "sha256": "e143cbaa3fc5b2a896a97baf072e41157ce4412e76047b49addfa177f332234c"
  },
  "assets/openai/xeno-trials-v209/characters/razor-claws-heavy-atlas-v229.png": {
    "kind": "asset",
    "sha256": "26af781bcba0de3fda6afef18ff9c9c0b2898065eba6ec7def6362c79b483290"
  },
  "assets/openai/xeno-trials-v209/characters/razor-claws-light-atlas-v229.png": {
    "kind": "asset",
    "sha256": "6fd947e7c7309e45561e95f7bbc241572333ec612d1001397371851a39d19777"
  },
  "assets/openai/xeno-trials-v209/characters/royal-guard-heavy-atlas-v229.png": {
    "kind": "asset",
    "sha256": "b4c8b74c61df65a29a8f826a07e7abf595bf1935a3ac4fd62c00eb1ba17e8bee"
  },
  "assets/openai/xeno-trials-v209/characters/royal-guard-light-atlas-v229.png": {
    "kind": "asset",
    "sha256": "0a12cb0cb25a215631c5a52f6046c1fd36447d521d78181f19ec31fe3ec1d317"
  },
  "assets/openai/xeno-trials-v209/characters/xenoborg-heavy-atlas-v229.png": {
    "kind": "asset",
    "sha256": "d11ca6d80817e204ea584468fefa950ba987771851685d014e0315bf41f1fbb3"
  },
  "assets/openai/xeno-trials-v209/characters/xenoborg-light-atlas-v229.png": {
    "kind": "asset",
    "sha256": "1acdf9209a4ce9f351d8a16c4c07cc81267d45c4ae1d256faf148dc3644964a3"
  },
  "docs/forge/xeno-trials/V229-SPRITE-PHASES.md": {
    "kind": "documentation",
    "sha256": "b2f01f71aa36811c7c23aeba982cb6103801fcd394055f01897ccacd1bf25b3b"
  },
  "docs/forge/xeno-trials/sprite-production-v229.json": {
    "kind": "documentation",
    "sha256": "b08b689f9b28cedcf1858004c45522977852b83683795bf00f64795c4e6f948e"
  }
});

export function reviewedXenoTrialsDigestV229(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V229, path)) return endpoint;
  const receipt = XENO_TRIALS_SUCCESSORS_V229[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V228 endpoint for V229: ' + path);
  return receipt.sha256;
}

export function xenoTrialsRuntimeSourcesV229(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V229)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoTrialsDigestV229(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V229)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V229 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoTrialsV229(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V229);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V229);
  assert.ok(successors.length > 0, 'Incomplete V229 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v229.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V229 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V229 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V229 receipt: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V229 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V229 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V229 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V229)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V228 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V228 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V229, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
