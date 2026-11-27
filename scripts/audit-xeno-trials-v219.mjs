import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { reviewedXenoTrialsDigestV220, xenoTrialsRuntimeSourcesV220, verifyXenoTrialsV220 } from './audit-xeno-trials-v220.mjs';

const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const freeze = rows => Object.freeze(Object.fromEntries(Object.entries(rows).map(([path, row]) => [path, Object.freeze(row)])));

export const XENO_TRIALS_BASELINE_V219 = '0d630718965c8cc17a5cbe0f1b6de729e4dd2518';
export const XENO_TRIALS_DECLARATIONS_V219 = freeze({
  'scripts/audit-xeno-trials-v218.mjs': {
    start: 'export const XENO_TRIALS_BASELINE_V218',
    end: '\nexport function reviewedXenoTrialsDigestV218',
    sha256: '4a53e094c5ee63a56a7ff1e9997a8a3d30e7215e3b2020871f69f018513bc895'
  }
});
export const XENO_TRIALS_SUCCESSORS_V219 = freeze({
  "package.json": {
    "kind": "tooling",
    "sha256": "8bb04ef8d355d66fe2e60b62a3f16070053100b3cea471dcd6bbeff6be077634",
    "previousSha256": "fde27be068c365a169c779e2d1a6da63dc9a53cf74a8fa252439ad3fcd7d6734"
  },
  "scripts/audit-xeno-trials-v218.mjs": {
    "kind": "tooling",
    "sha256": "4793e46f64f62e1250fed319dac25c3e4beaffcc79b90138129484d59f2ce010",
    "previousSha256": "a4dc1bac0e95335e93204f1867c666d939063fe48d93ff1bf0e95a08c3c5bc30"
  },
  "scripts/build-xeno-trials-v207.mjs": {
    "kind": "tooling",
    "sha256": "ba67ca145b65d432bcfda798373f9fcd522e4e333b5f3caef4f8cf20c06f5707",
    "previousSha256": "c7f975d2986629f56c4966c56945ffe0a9ab3caf90ddbaa6a756134614c69ff2"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "tooling",
    "sha256": "06dcea1bbdc2a939cf80915291112775057b2036892b087957b214ff3abeb089",
    "previousSha256": "3a4eab8811fd106c1805ca29df73db891ef5f26ac542378126b34153fad83fc7"
  },
  "scripts/verify-native-rig-terminal-v163.mjs": {
    "kind": "tooling",
    "sha256": "4008a4269942e689a5c2c68099d9570f1c6ea212b6ba54188239a236c9b835de",
    "previousSha256": "7e40cc10ae88b20a0e470dc524f55fa46203b8110c278587adff0a66e2c20845"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "tooling",
    "sha256": "f5d5f2d1e732bd651611405b7b192ef2a7703bb023fa9441d76ce71b19fd36dc",
    "previousSha256": "e86ba1f3651ad1e8b04ee8d414acb3e5b16a6f6d4e2c010f19c7e777566d92e2"
  },
  "scripts/verify-xeno-gameplay-audit-v213.mjs": {
    "kind": "tooling",
    "sha256": "810b1300479c3463f2e6065221f84b2e8a28496e455e24c85d307ebcec05d11f",
    "previousSha256": "06324846d8073c4111b79a17d49be08459ec459d278eb7c19b02415364e2ec47"
  },
  "scripts/verify-xeno-trials-ai-v213.mjs": {
    "kind": "tooling",
    "sha256": "767d39eaaac602cfae2caaa1cbd421b348d389f2fe8ce0628cb3026c0eb16b8b",
    "previousSha256": "1924a963d7660461f7dcec63ede2bc9b1b4b68ca63d71938d91408a3af2ed322"
  },
  "src/i18n-auto-v185.js": {
    "kind": "runtime",
    "sha256": "86ee61c4db36fd8d97c8c0c13e909f95f1c755f7d7f8995680920bfe670d9ea8",
    "previousSha256": "ffff28dbd9b0790c39faab35e1b152caf91a6f415938983f968b40661ab87077"
  },
  "src/xeno-trials-ai-v209.js": {
    "kind": "runtime",
    "sha256": "2b6165429768db73e9ab30a4ec2fb26df2839f8fbac2ee768223590cde5ed69b",
    "previousSha256": "4c94593d476aec0b68aa0ec08cbee1b9078dc68d0ec6055268da14781bddb096"
  },
  "src/xeno-trials-finishers-v207.js": {
    "kind": "runtime",
    "sha256": "530cf419647a38889227b2e071d920db05e051c2e4bb1c5f92e5e81baaa9c606",
    "previousSha256": "c47479fbea2cc830428f1efc0efe1eb91121ebb0816bd16baab60f62977e7898"
  },
  "src/xeno-trials-operation-presentation-v188.js": {
    "kind": "runtime",
    "sha256": "f88624dd6e877587e70e42baab2ddd6e7fe13f11c7e48f116285338396ef5217",
    "previousSha256": "3d66cc21d739b349abd9c4529fc797e97887f3697175f1ae237d731923faca44"
  },
  "src/xeno-trials-operations-v188.js": {
    "kind": "runtime",
    "sha256": "f9d5c54ef43e3675c0a2dc8186de46b978a98366db98280e0d249057ad768521",
    "previousSha256": "2889823e75ce76a007237491035b65c803169252169c37b59a8cc77fc2dc86d4"
  },
  "src/xeno-trials-practice-v207.js": {
    "kind": "runtime",
    "sha256": "398dc9dbd4dd6ca753e41a69fd292fc041b6a507a23b31f826b356beec7bad54",
    "previousSha256": "4a1f27eec1ac749816135b23dbba6e0e47c3e17f6c7d1911b28464a270aedf4c"
  },
  "src/xeno-trials-runtime-v96.js": {
    "kind": "runtime",
    "sha256": "6913343b3ddfb2871dc3c9573176908f588e4975e7d4f1c8b4b91c1ad3ece129",
    "previousSha256": "91a789bb04c5ccc457a36bbdadf4df3cfb4e3faa91a6afc8b984c1b46a350946"
  },
  "src/xeno-trials-sequences-v155.js": {
    "kind": "runtime",
    "sha256": "08f06fa9cb93149e14e81ca6ea1a851ff44752df3d3ad75f55bef19042bf4169",
    "previousSha256": "7397652a06e87332374bad342ad117c8df8738d1d75c16a2dcd9c4d25a3d3472"
  },
  "src/xeno-trials-ui-v96.js": {
    "kind": "runtime",
    "sha256": "594543472687bd92ab2f3e6df144ac845266ed99c3071fcc722da73d54f63c20",
    "previousSha256": "87a8c4f38a50aff1fcaf09b601f6268c655b36bb62c437e1d154651c7dfef0ff"
  },
  "sw.js": {
    "kind": "runtime",
    "sha256": "96601ef536388330f350014a233f2ee3ddac030999bcd25b6569879e58ac63bf",
    "previousSha256": "418383aff22f9dcfa3a6f7a97c2538580d96adcdf6cf00bfba8b213b1b35bb68"
  }
});
export const XENO_TRIALS_NEW_INPUTS_V219 = freeze({
  "docs/forge/xeno-trials/V219-GAMEPLAY.md": {
    "kind": "documentation",
    "sha256": "16d8c7cc45e7d8f42694c51309848d1dc5ac3244abdd3ce1b728126318b615aa"
  },
  "scripts/verify-xeno-trials-beacon-battery-v219.mjs": {
    "kind": "tooling",
    "sha256": "1b451d5ba17d6bb99f6c683065083b3014f70f6b14942127626ab444b7851400"
  },
  "scripts/verify-xeno-trials-finishers-v219.mjs": {
    "kind": "tooling",
    "sha256": "1686f9794fd1f95822218952439c5fd6acdb60fa6a0d5c84594243a43cd99507"
  },
  "scripts/verify-xeno-trials-landing-v219.mjs": {
    "kind": "tooling",
    "sha256": "67ce94581621a2361944ca6b1913caace3ea24fd8b3fdb0f3f07f8204912fe5f"
  },
  "scripts/verify-xeno-trials-practice-v219.mjs": {
    "kind": "tooling",
    "sha256": "8ef91060164ff05c9f4b2e220032567da31f131451469f562c1023739edb7fda"
  },
  "src/xeno-trials-finishers-v219.js": {
    "kind": "runtime",
    "sha256": "2131aa474ab6eb8dc2cbd29c89229a979d606da7c94b72c3bceecb6ec82861a4"
  },
  "src/xeno-trials-practice-v219.js": {
    "kind": "runtime",
    "sha256": "ec7132198bdcd30f16b4661c2f4b09cf01e1beea96a63fa3a1060d5fcf504638"
  }
});

export function reviewedXenoTrialsDigestV219(path, endpoint) {
  if (!Object.hasOwn(XENO_TRIALS_SUCCESSORS_V219, path)) return reviewedXenoTrialsDigestV220(path, endpoint);
  const receipt = XENO_TRIALS_SUCCESSORS_V219[path];
  assert.equal(endpoint, receipt.previousSha256, 'Incorrect V218 endpoint for V219: ' + path);
  return reviewedXenoTrialsDigestV220(path, receipt.sha256);
}

export function xenoTrialsRuntimeSourcesV219(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(XENO_TRIALS_SUCCESSORS_V219)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV220(path, receipt.sha256);
    if (result[path] !== undefined && result[path] !== receipt.sha256 && result[path] !== current)
      reviewedXenoTrialsDigestV219(path, result[path]);
    result[path] = current;
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_NEW_INPUTS_V219)) {
    if (receipt.kind !== 'runtime') continue;
    const current = reviewedXenoTrialsDigestV220(path, receipt.sha256);
    if (result[path] !== undefined && result[path] !== receipt.sha256)
      assert.equal(result[path], current, 'Incorrect V219 runtime input: ' + path);
    result[path] = current;
  }
  return xenoTrialsRuntimeSourcesV220(result);
}

export function verifyXenoTrialsV219(readSource = readRepository) {
  const successors = Object.entries(XENO_TRIALS_SUCCESSORS_V219);
  const inputs = Object.entries(XENO_TRIALS_NEW_INPUTS_V219);
  assert.ok(successors.length > 0, 'Incomplete V219 source freeze');
  const paths = new Set(['scripts/audit-xeno-trials-v219.mjs']);
  for (const [path, receipt] of [...successors, ...inputs]) {
    assert.ok(/^[a-zA-Z0-9._/-]+$/.test(path) && !path.split('/').some(part => !part || part === '.' || part === '..'),
      'Invalid V219 receipt path: ' + path);
    assert.ok(!paths.has(path), 'Duplicate or self-referencing V219 receipt: ' + path);
    paths.add(path);
    assert.ok(['runtime', 'asset', 'tooling', 'documentation'].includes(receipt.kind) && isHash(receipt.sha256),
      'Invalid V219 receipt: ' + path);
    assert.equal(sha(readSource(path)), reviewedXenoTrialsDigestV220(path, receipt.sha256), 'Unreviewed V219 source bytes: ' + path);
  }
  for (const [path, receipt] of successors) {
    assert.ok(isHash(receipt.previousSha256) && receipt.previousSha256 !== receipt.sha256, 'Invalid V219 predecessor: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(!Object.hasOwn(receipt, 'previousSha256'), 'V219 input has a predecessor: ' + path);
  }
  for (const [path, receipt] of Object.entries(XENO_TRIALS_DECLARATIONS_V219)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing V218 declaration boundaries: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical V218 declarations changed: ' + path);
  }
  verifyXenoTrialsV220(readSource);
  return Object.freeze({ baseline: XENO_TRIALS_BASELINE_V219, successors: successors.length,
    addedInputs: inputs.length, historicalResultsTransferred: false });
}
