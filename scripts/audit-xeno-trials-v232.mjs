import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V232 = '762b9a775312c227af974cae5f49b8bf8ebd475a';
export const XENO_TRIALS_DECLARATIONS_V232 = freeze({
  "scripts/audit-xeno-trials-v231.mjs": {
    "start": "export const XENO_TRIALS_BASELINE_V231",
    "end": "\nexport function reviewedXenoTrialsDigestV231",
    "sha256": "42518f67d0f5273a7b3c81d600e27961ad466bffb6804323661d53d143beeb90"
  }
});
export const XENO_TRIALS_SUCCESSORS_V232 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "c7640e07c6eca2767378264c007822065dfa42ab62b88d65bc41a03a5d7fd340",
    "previousSha256": "0b3d838e4c9f67242327bdc879115aea7b1fe3e54d1ab095c3319f14234f0b18"
  },
  "scripts/audit-xeno-trials-v231.mjs": {
    "kind": "tooling",
    "sha256": "3a2b43849951c48bfdc0e6f20fc872313ab9c042c1b735f9ea7031b3f0f7ed92",
    "previousSha256": "9b346f423031653fae6cbaa22fb42bee3590a3e6ae67dd79c4832c935821e030"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "9b94847659c15319214cb3afd826bf032fcfeaffd6490876c26ffe440ae57113",
    "previousSha256": "f7043ac6b2f0a30bd12323b0e382018624ba47f12b2a95b9b02267d35b52f76a"
  },
  "scripts/public-xeno-pose-admissions-v209.mjs": {
    "kind": "tooling",
    "sha256": "f9507066a8e704aefb68295ff835dd56daffeb310bbd407eacc42f868d53c2b8",
    "previousSha256": "814dbabd5d99098c69a1347ffc3c301550266d538ac4c2af6c30b31059cbe736"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "276f0aab769857a9116a7e80eedade27d6dbe2d2ff7c6ee283ae0e704813ec29",
    "previousSha256": "ca155e5eca39b52a8597acd9d060e879281db1e425ba27db1b665bc103f5d04e"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "350bd785c974bac99344c94edfb0b8492a4e7229a7ec9be73a21d8afbb033cd1",
    "previousSha256": "2243b7306a206ba74b4b3e07b6ef7150dd2e4c0b47bdde8537f18ae70d273586"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "741d0471d05192a038816ee0bdbeceed88a86dcb342dee335e05183cede02686",
    "previousSha256": "9a94e19f9aede70fd51d48b8a78f47e0263b05fccaa8382f4aa6ac902f9564c3"
  },
  "src/xeno-trials-character-route-ui-v231.js": {
    "kind": "runtime",
    "sha256": "d4540bbda8decce8b5987cdc981fff827dadf8b595580d70a1cbeaa0ab4a4dfa",
    "previousSha256": "d6d021a213ea834981d184e489f9602009f03fbd8454b8b21812558d1e11dea1"
  },
  "src/xeno-trials-duel-checkpoint-v197.js": {
    "kind": "runtime",
    "sha256": "30eb2512e881d7ba4e90bdf846bbe6d59b0d39dae95ae79926cb19cef5947503",
    "previousSha256": "fa84e0d7c5d3b3f4178f67086345e8f101defb6624de822a437e66d678c3bb61"
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "sha256": "2b51964212aa7b390c5dc31894106b0ac2d52d353dfde3f9a2a29dc47669fcf0",
    "previousSha256": "f380ab717aa3079522a18a739534cca88916e1cb470a2b556a7d141427377755"
  },
  "src/xeno-trials-horde-checkpoint-v186.js": {
    "kind": "runtime",
    "sha256": "18c1858b90c41af2c625756a2f3f8bae3451f9bc7dbb6b7ba88d3cdd38e02c53",
    "previousSha256": "91990133a8a1d43736c2e4d062d30207fcf2d2055188eb360090a0b9a917698e"
  },
  "src/xeno-trials-modes-v119.js": {
    "kind": "runtime",
    "sha256": "0b4d89fa02902cb7f2cd70452a3729b6c25d71039dd1dbaed18bc4b6cdb988c1",
    "previousSha256": "d072788f9dd5a8da4a9d29140cc04ee29b0b1070d446c8c59e5b4b9a46967039"
  },
  "src/xeno-trials-poses-v209.js": {
    "kind": "runtime",
    "sha256": "f6d18b97f2f0d2e2582fb24d6ac2f506027f85ae2a9a46d7e7bbe44734bc2711",
    "previousSha256": "7268c1858d827537a1720b2a9dc9396a01a8cb5698c74ee86643cbb818c4947b"
  },
  "src/xeno-trials-progress-v96.js": {
    "kind": "runtime",
    "sha256": "25ac139cf268c2ff13811ecfb7fba9a38d8bec8e9e281138ea43fbd08b1f4ea3",
    "previousSha256": "4629c89ae7f26d9bffa51fb6f16c32385d8b838f1b6f0861e50565525d8cf385"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "20d1d092a8ab16a30ab68450e5c010b1bb8dad633f405637745cab47afe4ade1",
    "previousSha256": "8bd091840e6d52ac4e59043ea452fcd0de46719634b74d38263491fc391c6264"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "1c050060d17a60732c62f64eaf69db183b047df29febf93aec26722785403c3c",
    "previousSha256": "4247de68cf057c5f8f3bb4c00348cc72310dc77de9c64a1fb80ba99a2ce3e60a"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "89ed78027d0b0a2056eb28ca67ff19057c58ca6179a87c01eefc41dc388c7181",
    "previousSha256": "d031efe1777d3771d1ca7601da86a6a1d911e449ed437745d48a2a57721c2a5f"
  },
  "xeno-trials-v96.css": {
    "kind": "runtime",
    "sha256": "d16ad6003d36b537c347df87914d8382f002a9a98a3fe98a798d7a77dc6dd136",
    "previousSha256": "68b91964bde303513f0f6e8e01f5930e4233559b3f38782d230b49a59f07e99f"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V232 = freeze({
  "assets/openai/xeno-trials-v232/characters/big-chap-heavy-atlas-v232.png": {
    "kind": "asset",
    "sha256": "cf5125360b9bff4f9f1a22ee07acc5515a369d88323943aa0cc0c7dc221f54cc"
  },
  "assets/openai/xeno-trials-v232/characters/big-chap-light-atlas-v232.png": {
    "kind": "asset",
    "sha256": "5ea2e20218f27e65bba22de276df9405b74814af05952b30857baab30452112c"
  },
  "assets/openai/xeno-trials-v232/characters/deacon-heavy-atlas-v232.png": {
    "kind": "asset",
    "sha256": "c72d5c5150b5807cee358ac69f19f4f81ef0d690330afd8f54a4107c4979c049"
  },
  "assets/openai/xeno-trials-v232/characters/deacon-light-atlas-v232.png": {
    "kind": "asset",
    "sha256": "7747c023bb2884cf0c614c6807c8eda19268fdb65a663f355512ac7fbc502d8c"
  },
  "docs/forge/xeno-trials/V232-TEAMS-REPLAYS-AND-ROUTES.md": {
    "kind": "documentation",
    "sha256": "67ac6cff1f41c41d089f9c37552e27f085b26389dfd4370c6e3c6c4c2e0be7b9"
  },
  "docs/forge/xeno-trials/combat-art-v232.json": {
    "kind": "documentation",
    "sha256": "8fa8426cf87896c87031231f55e5d39dfb70eb9f020a005347a1f77cd4f7f7e8"
  },
  "docs/forge/xeno-trials/combat-guide-coverage-v232.json": {
    "kind": "documentation",
    "sha256": "c01dea9b11aa237eb124d148fec4db5271d4e19b52c979d49746eb6af47f5acb"
  },
  "scripts/fixtures/xeno-trials-character-route-v231.json": {
    "kind": "tooling",
    "sha256": "0c39c616014303207ad7f4dcee4c5fbc9141bde7904897b91a29c051a23453fb"
  },
  "scripts/verify-xeno-trials-assists-v232.mjs": {
    "kind": "tooling",
    "sha256": "de0d71a4b9f0ec5434240c678b95c9c238c5fd0bdf97e45a86ef73c3775d9dcf"
  },
  "scripts/verify-xeno-trials-character-routes-v232.mjs": {
    "kind": "tooling",
    "sha256": "b93d6c2ab00a04465ecdf5def2f05cfde304ead0d3d70f194e39291e51905616"
  },
  "scripts/verify-xeno-trials-combat-art-v232.mjs": {
    "kind": "tooling",
    "sha256": "7f9cbb7930006496288f13899ec3e058ae5710a925d71c1890448dfe0f33c274"
  },
  "scripts/verify-xeno-trials-exhibition-integration-v232.mjs": {
    "kind": "tooling",
    "sha256": "dbc1ba1f6f22228d9f80daf2d1918e573fc0907013b68c4ac41191d958ca806a"
  },
  "scripts/verify-xeno-trials-exhibition-ui-v232.mjs": {
    "kind": "tooling",
    "sha256": "3d2c8210763497c0a94844514771843a48b3cafc86da2fb7d46d57a4baa3c027"
  },
  "scripts/verify-xeno-trials-local-input-v232.mjs": {
    "kind": "tooling",
    "sha256": "bde48e229d051cf7ae8b45720a0e90a13328739f2066a211a5e5c21c9f6bbe64"
  },
  "scripts/verify-xeno-trials-replay-v232.mjs": {
    "kind": "tooling",
    "sha256": "dbd9219bb3d5f4967cff6a93d79c89a6753066477fe1d6f9cc459ed643f9e010"
  },
  "scripts/verify-xeno-trials-runtime-v232.mjs": {
    "kind": "tooling",
    "sha256": "4276efb186bc235f9a936e2319af5a00810b6597a40060c2f36af8245f9c0c04"
  },
  "scripts/verify-xeno-trials-tag-v232.mjs": {
    "kind": "tooling",
    "sha256": "d784334e8a6252c77da092666df650a3d9b22f0c2245d8190f8689db8bff464b"
  },
  "src/xeno-trials-assists-v232.js": {
    "kind": "runtime",
    "sha256": "e9ba85869235c0a54b649b820015776a69631c8d13028d4a9eba164244aa1001"
  },
  "src/xeno-trials-character-routes-v232.js": {
    "kind": "runtime",
    "sha256": "dd068e3919136f4cdf151299e7974030fe87880b0fed88e371a9d8c985557f0b"
  },
  "src/xeno-trials-exhibition-ui-v232.js": {
    "kind": "runtime",
    "sha256": "7732d652417fb73f8e8fa410ab006228b4fd75cd030568225255b92d00e47db6"
  },
  "src/xeno-trials-local-input-v232.js": {
    "kind": "runtime",
    "sha256": "9493bb5d87f029f7bd7ab7fd94b9e7dc99ea93f4440be96278e91c5b9a98341b"
  },
  "src/xeno-trials-replay-v232.js": {
    "kind": "runtime",
    "sha256": "3ad260909baa6efdfb8c5bdd07e5880983fd597354a3844dc0d9d9cb77040c18"
  },
  "src/xeno-trials-tag-v232.js": {
    "kind": "runtime",
    "sha256": "45a192c55c9aeb5624a496ed889ea3bdfd753f685333fe87626ab3f2f41551b3"
  }
});

export function reviewedXenoTrialsDigestV232(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V232, path)) return endpoint;
  const receipt = XENO_TRIALS_SUCCESSORS_V232[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V231 endpoint for V232: ' + path);
  return receipt.sha256;
}

export function xenoTrialsRuntimeSourcesV232(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V232)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoTrialsDigestV232(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V232)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V232 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoTrialsV232(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V232);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V232);
  assert.ok(successors.length > 0, 'Incomplete V232 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v232.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V232 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V232 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V232 receipt: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V232 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V232 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V232 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V232)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V231 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V231 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V232, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
