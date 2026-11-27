import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V218 = 'f27167fa74fa89558cee7efbaf7f21a6367df4cb';
export const XENO_TRIALS_DECLARATIONS_V218 = freeze({
  'scripts/audit-xeno-trials-v217.mjs': {
    start: 'export const XENO_TRIALS_BASELINE_V217',
    end: '\nexport function reviewedXenoTrialsDigestV217',
    sha256: '69972b76069ae22419a7b45f881b94cb3bc958a4a219a15c8d8ca0d74bdbe7dd'
  }
});
export const XENO_TRIALS_SUCCESSORS_V218 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "fde27be068c365a169c779e2d1a6da63dc9a53cf74a8fa252439ad3fcd7d6734",
    "previousSha256": "97d768ae813a2730fcc5981c507a9530ff53f53057983420644cdcd4e1bf1c04"
  },
  "scripts/audit-xeno-trials-v217.mjs": {
    "kind": "tooling",
    "sha256": "c89ca770d8bd25ef82ed680c84b499de7f34813f0446234dbd0d9b34f247a1a5",
    "previousSha256": "50251f2cf455ea3fba30538bb7c83e6feb8db6e9a017947a3bd2edf72852e54b"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "c7f975d2986629f56c4966c56945ffe0a9ab3caf90ddbaa6a756134614c69ff2",
    "previousSha256": "d50fb3f117da83582640d5cb0839c97dacd13e722f0abdd65a300242394c9291"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "3a4eab8811fd106c1805ca29df73db891ef5f26ac542378126b34153fad83fc7",
    "previousSha256": "6b18fcbdde3b0d5ae0829ffd1f2731b5c692207d0432dbbd06a1f54088e82b66"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "e86ba1f3651ad1e8b04ee8d414acb3e5b16a6f6d4e2c010f19c7e777566d92e2",
    "previousSha256": "c7dce0e51cc333088ba99efbe6662c9878eb6378bae5012504b433f1ffa66257"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "06324846d8073c4111b79a17d49be08459ec459d278eb7c19b02415364e2ec47",
    "previousSha256": "21eba5339942dd046106f5bf6032cffeca0e6a73c5945fcd7c09784bd9d8c2c9"
  },
  "scripts/verify-xeno-trials-ai-v213.mjs": {
    "kind": "tooling",
    "sha256": "1924a963d7660461f7dcec63ede2bc9b1b4b68ca63d71938d91408a3af2ed322",
    "previousSha256": "be67b9a53ad6e0850aa47c05c8495cb121d68339f5eef21f7dfabb7e2e95edb8"
  },
  "scripts/verify-xeno-trials-defense-v213.mjs": {
    "kind": "tooling",
    "sha256": "4be60229a0669f7414e5b22734549e588e4db391c1e58b5380ab3eed5db2cc6f",
    "previousSha256": "2060f845d1a23981dd29ba25114e4ebee81223b70d7b882c38de348ef478398f"
  },
  "scripts/verify-xeno-trials-horde-minigames-v213.mjs": {
    "kind": "tooling",
    "sha256": "8e229d3027373692427156579ab6dc9a488c5e416be5b32384d24c231937ba52",
    "previousSha256": "ec867f41a1bcd4255ede4285762f3250b7582ce225a90c04463ff0ec1039505a"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "ffff28dbd9b0790c39faab35e1b152caf91a6f415938983f968b40661ab87077",
    "previousSha256": "f11b295cbeaf995f9c11e37eca78582bb83b7225ed2dac59d323977cc3433d66"
  },
  "src/xeno-trials-ai-v209.js": {
    "kind": "runtime",
    "sha256": "4c94593d476aec0b68aa0ec08cbee1b9078dc68d0ec6055268da14781bddb096",
    "previousSha256": "ede00382a9f8b5a48010ec4de0ffe6baf19ca23efe36f17a559bcb4317af2682"
  },
  "src/xeno-trials-defense-v211.js": {
    "kind": "runtime",
    "sha256": "078f05528de7cda08592c3b134dfc76711ca7ace40e55f8aafdcf24da048fc10",
    "previousSha256": "7ea5dd5ddc05702e2c7de60c06c09b05f5972482de9ed31c9384363197c08868"
  },
  "src/xeno-trials-duel-checkpoint-v197.js": {
    "kind": "runtime",
    "sha256": "b7a6d014d4d058009543959721c15a17f276b606f4caa088083b56f5632917b9",
    "previousSha256": "6463f157095eac9e2873e7609ec9ed3b891a6e2a11c22bf421a52f53b0dc3d2c"
  },
  "src/xeno-trials-engine-v96.js": {
    "kind": "runtime",
    "sha256": "76b6280f42b633fc4dd73b696eb2f6028216f86df56e7bedf156666a46f6e77f",
    "previousSha256": "51e873c10c72c82dccea9214f9897ce831ce6bac83ca208eeaa622d6b0ca1273"
  },
  "src/xeno-trials-grapple-v153.js": {
    "kind": "runtime",
    "sha256": "5361a716c52270bd336568e6c083da917a71ab92d9776aba06063f6ab14ad850",
    "previousSha256": "32683be6ed15f983c1f11386caafab0da2df18aab22d9b975f20609728e53f5d"
  },
  "src/xeno-trials-horde-minigames-v213.js": {
    "kind": "runtime",
    "sha256": "90df5c0f9cc5f81a2df3299ebfab7026bd55a03044561f00cdc70759bb1f3b68",
    "previousSha256": "b31d0a39207e35df675b9d9306d279faa25d4d5aebcd0df5b4f0cf25083f0f2d"
  },
  "src/xeno-trials-movement-v210.js": {
    "kind": "runtime",
    "sha256": "8d2f381b8d7841222d3845689f693bb20ca04f3b1fda8b3d8e5b0c9251673eec",
    "previousSha256": "bed35e1c811e221ff58ba58e360cd6efe1f484c8bcdf34677f0f52161164194b"
  },
  "src/xeno-trials-moveset-v207.js": {
    "kind": "runtime",
    "sha256": "3d3eea58506a44662dce0b67e343ae97b40ead87d91860a23ad9e1fc018af030",
    "previousSha256": "a35092a9615c77262d77bca395e0dfeb1ae273ef08863eddf84ebf0bcc35ed88"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "sha256": "3d66cc21d739b349abd9c4529fc797e97887f3697175f1ae237d731923faca44",
    "previousSha256": "bbf4b33f0728fa1ca49b6a8d32f6f91931cb916c48f68eb2977717ee5324e230"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "sha256": "2889823e75ce76a007237491035b65c803169252169c37b59a8cc77fc2dc86d4",
    "previousSha256": "fc548f529c48b60598a4be3f3c2252675bba39d949e13a499386cae95922702d"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "4a1f27eec1ac749816135b23dbba6e0e47c3e17f6c7d1911b28464a270aedf4c",
    "previousSha256": "823622925ab294222ec3ac2a2882b96f4a5bb413935c4e44a47abc5bae20c8c2"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "91a789bb04c5ccc457a36bbdadf4df3cfb4e3faa91a6afc8b984c1b46a350946",
    "previousSha256": "c071941554df967956fbd6e786b330c9527cc3c2ebdd64267532317a5c5ec213"
  },
  "src/xeno-trials-sprite-atlas-v191.js": {
    "kind": "runtime",
    "sha256": "a049d3863e0fd77bf3a58d750707e5d69213c3d36603ce7f2a4d0a6d2c9e2cf6",
    "previousSha256": "24e984f892ddddb30ec8a54637aaee227486eb37b121163f4789fb6fbfabbd11"
  },
  "src/xeno-trials-stage-events-v211.js": {
    "kind": "runtime",
    "sha256": "4d8153d5b5986e9f1a7c8374d0e28a8de8993dc2ab2406e2e98dae84eeb2f3fe",
    "previousSha256": "fa5978b4cef4fb2539742241ff3367e83ff82e4a9fb5a65e8c7ce5ad8fc95b5f"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "87a8c4f38a50aff1fcaf09b601f6268c655b36bb62c437e1d154651c7dfef0ff",
    "previousSha256": "e9586690b1934b5fca9b5cfe3b59ea0a66e42efc9369fef07f39dbea33c8ff99"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "418383aff22f9dcfa3a6f7a97c2538580d96adcdf6cf00bfba8b213b1b35bb68",
    "previousSha256": "ba8813acd682fb198d8696a431db5fac52983a0aa65a1247de355ea9505071bd"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V218 = freeze({
  "docs/forge/xeno-trials/V218-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "9d2a4feda4da7fe7e8b75a330653436b98ed2bc374c329588fe6bfc6d0d2f054"
  },
  "scripts/verify-xeno-trials-contact-v218.mjs": {
    "kind": "tooling",
    "sha256": "ed2912d9109c73484ed443d5a9919d67defbfb638bc7ca30bc18b31b47b26bbd"
  },
  "scripts/verify-xeno-trials-practice-v218.mjs": {
    "kind": "tooling",
    "sha256": "5ccfc7ba5064f48d87ced346d9523bf926b1161d67888e2432c0f96c9b7e6a94"
  },
  "scripts/verify-xeno-trials-relay-pressure-v218.mjs": {
    "kind": "tooling",
    "sha256": "bc3a05963911576d3d0e302ddf97e907a82c6f37d513a9065f6dce6774160292"
  },
  "src/xeno-trials-practice-v218.js": {
    "kind": "runtime",
    "sha256": "085880706e91fb35305ba0bd08c3fe26d76921a70a66e22bcad0d37b581ea804"
  }
});

export function reviewedXenoTrialsDigestV218(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V218, path)) return endpoint;
  const receipt = XENO_TRIALS_SUCCESSORS_V218[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V217 endpoint for V218: ' + path);
  return receipt.sha256;
}

export function xenoTrialsRuntimeSourcesV218(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V218)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoTrialsDigestV218(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V218)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V218 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoTrialsV218(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V218);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V218);
  assert.ok(successors.length > 0, 'Incomplete V218 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v218.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V218 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V218 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V218 receipt: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V218 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V218 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V218 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V218)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V217 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V217 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V218, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
