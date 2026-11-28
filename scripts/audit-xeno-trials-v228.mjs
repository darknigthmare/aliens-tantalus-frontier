import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V228 = '3025d07ca305fcb8a2402c185c16e68d8d12ce2c';
export const XENO_TRIALS_DECLARATIONS_V228 = freeze({
  "scripts/audit-xeno-trials-v227.mjs": {
    "start": "export const XENO_TRIALS_BASELINE_V227",
    "end": "\nexport function reviewedXenoTrialsDigestV227",
    "sha256": "72beb41cd2eae5585ec1ad3e9bcb5481e731043099de05aae7db2a8ef98de390"
  }
});
export const XENO_TRIALS_SUCCESSORS_V228 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "1de64713d82eea9c2c68cc446eb77520adba2c745b3e9a12665cb613508ee3e4",
    "previousSha256": "753d656376887b0d35393fd0ed9be451a878a47648707cbd8959921d358b42ab"
  },
  "scripts/audit-xeno-trials-v227.mjs": {
    "kind": "tooling",
    "sha256": "ca0b6602e179c7c662badab895f4780ba26ca4122da209f42e418e10c9a51161",
    "previousSha256": "6de1d081cb7b069af6b3cab2da074c191eae6ea84c680be27d95b7e77e2b54c5"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "5da7388f5cebfd57446c8faa48239a06ec5826688156b2f9d90f84625dac05e4",
    "previousSha256": "638ad4b4a9400624fd8ef44921a1ab16d6c1644f9cc34c7c09bb8eda582e394a"
  },
  "scripts/public-xeno-pose-admissions-v209.mjs": {
    "kind": "tooling",
    "sha256": "9368e5a05a48f27bf2adcf62e891823265b571fc125cbfae853e3e43be5638cf",
    "previousSha256": "74726cf320e557d4533f3d156de3d1505ebaea53824a183fdba29e515379c77e"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "a85c621912832d7a9f201d3dcec982c62966d9fcbc7a196d834005b784e15b09",
    "previousSha256": "89325ccff8daf40f1c53bb6ae510421c6dca9ec52d90b37501ccb856a547f9a4"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "5ce7cef9eb07a1dc4aba90646f60c5022e2762762df9090b0258d8973f61c172",
    "previousSha256": "45d621e1af750c1792e7237b07c927fe8e0f0639ad16e8eebdf9643313876a0e"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "f3974f8f20fb3859180fb287914c163c5ee5d7a668c8e7433e553945e3a76178",
    "previousSha256": "8165f5f40de2ce1d483d594e0da07318fb56ad293ad359e429eb2ebc31e1966a"
  },
  "scripts/verify-xeno-trials-poses-v209.mjs": {
    "kind": "tooling",
    "sha256": "ae58d2b951502b76c11f06dcd05830a2032b10dc6ce54d6b83d38b1fa532a736",
    "previousSha256": "65440038034a25b3cfbc2155530c2b1a4afd027ec348f5bb47a5e3d9694f925d"
  },
  "src/xeno-trials-poses-v209.js": {
    "kind": "runtime",
    "sha256": "ba39095a152afb65ade8c3bad17ff8abfcdd42229d0e6b201c968db9be1d284f",
    "previousSha256": "aec20e647457f1a82aff6be1c2bf6634d8dcb599f0229de2e06970c7c4f31d11"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "7d3004e7c7e82005e2e3d5a3a3f141969b0439bb42806c9f0cfefeaeef32b4a2",
    "previousSha256": "95b058eab771ff789b5076dec242c2aeb448e9b3b28ac025c2fccbc67e96f93f"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V228 = freeze({
  "assets/openai/xeno-trials-v209/characters/armored-joe-heavy-atlas-v228.png": {
    "kind": "asset",
    "sha256": "3781789d46dab6149390e57d24c8cc145889fdf535cd4d30592591e2f4901aab"
  },
  "assets/openai/xeno-trials-v209/characters/armored-joe-light-atlas-v228.png": {
    "kind": "asset",
    "sha256": "b64a0b074ac4d229dea3e16298caee795713eb458edf8a01411c25080f6eb92c"
  },
  "assets/openai/xeno-trials-v209/characters/mantis-heavy-atlas-v228.png": {
    "kind": "asset",
    "sha256": "3c4bdbd63cbe054f1f969f2e0eca7378d43a9de8ef2c25dd9630d3d6a9bf2f11"
  },
  "assets/openai/xeno-trials-v209/characters/mantis-light-contact-v228.png": {
    "kind": "asset",
    "sha256": "d49208d597cbad86c624df2ed025a86fd39da84a6d63d86b93ab3e6ee750eb53"
  },
  "assets/openai/xeno-trials-v209/characters/mantis-light-recovery-v228.png": {
    "kind": "asset",
    "sha256": "b11c4bb117c36db75bfbb757d9d8bc11a442ffbea0011dff400a749ac7ac19a4"
  },
  "assets/openai/xeno-trials-v209/characters/mantis-light-windup-v228.png": {
    "kind": "asset",
    "sha256": "62cb0145db0fc5f3c83eb8de0907638940e4b9883fff79a3389fe4bae1f14580"
  },
  "assets/openai/xeno-trials-v209/characters/rhino-heavy-contact-v228.png": {
    "kind": "asset",
    "sha256": "5039673693fb8f14bd23ac936ae6873a811d3ff9c22597a62e16dad7f79f39eb"
  },
  "assets/openai/xeno-trials-v209/characters/rhino-heavy-recovery-v228.png": {
    "kind": "asset",
    "sha256": "307daa03fcc4afbf712a8a01c7b9de721a49bdd343614e8289f880f0da0028ac"
  },
  "assets/openai/xeno-trials-v209/characters/rhino-heavy-windup-v228.png": {
    "kind": "asset",
    "sha256": "b38f380734d9e46517555e37e336de89c8259b47a8e9f8945835967a1b9c6e92"
  },
  "assets/openai/xeno-trials-v209/characters/rhino-light-contact-v228.png": {
    "kind": "asset",
    "sha256": "1dcc92f85ca5d53b40b3494f72b65d186d001932947194ba821c550939305238"
  },
  "assets/openai/xeno-trials-v209/characters/rhino-light-recovery-v228.png": {
    "kind": "asset",
    "sha256": "b8f31103ed7aa78a9167180085b5d513d3771eb75a492af075a381a62e6b929a"
  },
  "assets/openai/xeno-trials-v209/characters/rhino-light-windup-v228.png": {
    "kind": "asset",
    "sha256": "a52bb0cc13c01299b9633551f3e79f921a4e4f4640a98ce34b6dd89c4c22407b"
  },
  "assets/openai/xeno-trials-v209/characters/synth-heavy-heavy-atlas-v228.png": {
    "kind": "asset",
    "sha256": "db3cd02b113daa667c852e43497046ad52046b7ea48271acce0adf09ed49635f"
  },
  "assets/openai/xeno-trials-v209/characters/synth-heavy-light-contact-v228.png": {
    "kind": "asset",
    "sha256": "ca0a7193d360a69bb559531b1732845a179bb82a4039d2ee69897bb91179ab3f"
  },
  "assets/openai/xeno-trials-v209/characters/synth-heavy-light-recovery-v228.png": {
    "kind": "asset",
    "sha256": "4480d0fceca32f7c4ca873ec3f42004113259691df5e571c99d24d2dd1c2d07c"
  },
  "assets/openai/xeno-trials-v209/characters/synth-heavy-light-windup-v228.png": {
    "kind": "asset",
    "sha256": "e86c40d98c01b9c4b97a975dd676d3478d7cd7446e956d524d932c4b8dd83d13"
  },
  "assets/openai/xeno-trials-v209/characters/synth-sniper-heavy-contact-v228.png": {
    "kind": "asset",
    "sha256": "e888e73e30ccd3261d17ae5de1a0726f5ef80ed7d07ad2a31e45dcc3c8ae1aa9"
  },
  "assets/openai/xeno-trials-v209/characters/synth-sniper-heavy-recovery-v228.png": {
    "kind": "asset",
    "sha256": "466ce98bdd389b427f9fa3ab4983a8b06ed5b96830cf53bb51e995ab865d4073"
  },
  "assets/openai/xeno-trials-v209/characters/synth-sniper-heavy-windup-v228.png": {
    "kind": "asset",
    "sha256": "daee6fb1ee65e417322c660cf94cf2571db24b080bc2b26f9272800b5526be74"
  },
  "assets/openai/xeno-trials-v209/characters/synth-sniper-light-contact-v228.png": {
    "kind": "asset",
    "sha256": "b97c4b05f1119c76535e4ddcd2db58ccfa8b4e24dac0045f4e90a715d302804a"
  },
  "assets/openai/xeno-trials-v209/characters/synth-sniper-light-recovery-v228.png": {
    "kind": "asset",
    "sha256": "4e44d75e394428b7abcbba481e125dc0b63231438281c91626a52f0d27c89d96"
  },
  "assets/openai/xeno-trials-v209/characters/synth-sniper-light-windup-v228.png": {
    "kind": "asset",
    "sha256": "cbde1074f428f1720e500710f51b42bda1c58e4fce8672dea8db35957d457aaa"
  },
  "docs/forge/xeno-trials/V228-SPRITE-PHASES.md": {
    "kind": "documentation",
    "sha256": "58ae663b34fb8fd20f4259a5617119d47ec4b219227faa24edd617958bf77cba"
  },
  "docs/forge/xeno-trials/sprite-production-v228.json": {
    "kind": "documentation",
    "sha256": "4dd511b7ce1b8ba1bb5e2ba29f842c11f84759c23bc4c84d06f99a7db129c61c"
  }
});

export function reviewedXenoTrialsDigestV228(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V228, path)) return endpoint;
  const receipt = XENO_TRIALS_SUCCESSORS_V228[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V227 endpoint for V228: ' + path);
  return receipt.sha256;
}

export function xenoTrialsRuntimeSourcesV228(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V228)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.sha256) reviewedXenoTrialsDigestV228(path, result[path]);
    result[path] = receipt.sha256;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V228)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined) assert.equal(result[path], receipt.sha256, 'Incorrect V228 runtime input: ' + path);
    result[path] = receipt.sha256;
  }
  return Object.freeze(result);
}

export function verifyXenoTrialsV228(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V228);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V228);
  assert.ok(successors.length > 0, 'Incomplete V228 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v228.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V228 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V228 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V228 receipt: ' + path);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V228 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V228 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V228 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V228)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V227 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V227 declarations changed: ' + path);
  }
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V228, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
