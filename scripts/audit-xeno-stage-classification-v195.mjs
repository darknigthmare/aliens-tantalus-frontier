/** Source admission for the original-stage classification, anchored to V194. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readRepository = path => readFileSync(new URL('../' + path, import.meta.url));
const validHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const safePath = path => /^[a-zA-Z0-9._/-]+$/.test(path)
  && !path.split('/').some(segment => !segment || segment === '.' || segment === '..');
const kinds = new Set(['runtime', 'verifier', 'configuration', 'document-input']);

function freezeReceipts(receipts) {
  for (const receipt of Object.values(receipts)) Object.freeze(receipt);
  return Object.freeze(receipts);
}

export const STAGE_CLASSIFICATION_BASELINE_V195 = 'cdecfd08073198086915eec3983bcb0bd29851ed';
export const STAGE_CLASSIFICATION_HISTORICAL_DECLARATIONS_V195 = freezeReceipts({
  'scripts/audit-xeno-iconic-stages-v194.mjs': {
    start: 'export const ICONIC_STAGES_BASELINE_V194',
    end: '\nexport function reviewedIconicStagesDigestV194',
    sha256: 'df5feb177c0b906324d24533eb0d5faf46f58f0052e40dc2ca50e2cf6d3b2811'
  }
});

// Filled after the classification sources are frozen.
export const STAGE_CLASSIFICATION_SUCCESSORS_V195 = freezeReceipts({
  "package.json": {
    "kind": "configuration",
    "previousSha256": "22c26aace0a2b3626baac1ea5989cfe0083dbb2a89bd8603438173b4f23e6839",
    "currentSha256": "5b4966f510544fd11f875aebe1e35f91b050c78d19fd73bc84b900bd49f7db4b"
  },
  "scripts/audit-xeno-iconic-stages-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "ccf9fb2dbc0b85ce01d78d97f6b82d84de1fcd5ff4e0bad64b3de571bbb98637",
    "currentSha256": "847d725ec0e5897e188fa75e18dfec1b5d89c25b2f4d028d9efead8746ae9e6f"
  },
  "scripts/verify-audit-continuation-v163.mjs": {
    "kind": "verifier",
    "previousSha256": "bb54d93654af6501df67f42290044d6f976272f623ac961474d8c5c04aec69d2",
    "currentSha256": "90a8a7ca78bd37090fa874bc7dceed579e270cd0dde0401f189a08fe90ae9e42"
  },
  "scripts/verify-i18n-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "5ed569c7e0a2958eb8f014aee99b1d4725451005b07a9d585f8067d2abd0539a",
    "currentSha256": "42b0ccc673175b75239051783d0c9680f23b1c9d4453d18e5cfeb4d2270752cd"
  },
  "scripts/verify-native-qa-resources-v187.mjs": {
    "kind": "verifier",
    "previousSha256": "b57a5f720668e617db1b935357cc845a3f0d0a23dd0f80465d78eeb4b5ac5bcc",
    "currentSha256": "3d74468054d983cffa97b0c9b0ca5f30d29c582bdfb937da19df29aee1d628c1"
  },
  "scripts/verify-public-release-v86.mjs": {
    "kind": "verifier",
    "previousSha256": "df71f84a77a3e0b5152cde5fd8a88fc463b08661476b23bd61b9cd3ce4ef0b28",
    "currentSha256": "9749281ae5158e47a75798554d6cadf4407faa7bea40e81b3f22f734390c52f2"
  },
  "scripts/verify-xeno-animation-audio-audit-v189.mjs": {
    "kind": "verifier",
    "previousSha256": "0c70cacb594a01c1251999b28ab22b4000cf18ae6bc83bb523610535028b7736",
    "currentSha256": "4b20af48d29fa7a602a46cb885ed428dbf9e9ceabdbd9ef0d455d01441dac953"
  },
  "scripts/verify-xeno-arbiter-campaign-audit-v190.mjs": {
    "kind": "verifier",
    "previousSha256": "5e5c2827202f58cfc4ab06b7864d6d28f5477b653581df649d243a6c324e7192",
    "currentSha256": "2d6ae67c96ad1bc63586c7cf8f72e9ecc9dc98797d2f6c8f5afe196c384f9d13"
  },
  "scripts/verify-xeno-arbiter-protocols-audit-v191.mjs": {
    "kind": "verifier",
    "previousSha256": "d8d14f67017737dcd13c27ae0cbdca139fc7af7dd90f496704819febe401624c",
    "currentSha256": "da4990e7e42d4bf3b9cb8dc44fa9f7b14ce69d8bda6a6f8bf167f2994bac86c7"
  },
  "scripts/verify-xeno-franchise-stages-audit-v192.mjs": {
    "kind": "verifier",
    "previousSha256": "2bf78028fc6a1306a842e9d1a57d9f840889d59c1b0f9cfbaeb01f67fa2a8d60",
    "currentSha256": "f67c80a34ae3cd04a9cd70d9a9957513c0783be138b1cb38fcb2281c8f225ff9"
  },
  "scripts/verify-xeno-iconic-stages-audit-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "769dce201578df1e40cc48db8ae7fd4a468862b0245216f222a5c866b16894c3",
    "currentSha256": "28b18ecb7dfd4532b257e95118946be0d016efd95a2b29099fddd03ccede798d"
  },
  "scripts/verify-xeno-iconic-stages-v194.mjs": {
    "kind": "verifier",
    "previousSha256": "c41b559bdf1a8bab90e68eca7822bc73e4d8175175dea9ebf9bb54f2b661deec",
    "currentSha256": "5697a9caef6652e697ae9ada4af6c414ad36aab8bb38ff3fd092d1844d3e34ef"
  },
  "scripts/verify-xeno-original-arenas-v193.mjs": {
    "kind": "verifier",
    "previousSha256": "1fab9b5e4ccb9d8b88a6ce63456db53f3118cd0bbbe5efd905bc7b7ed8714ce2",
    "currentSha256": "b9baa83ecab145a41b7e946d19a684b31cefd00f03672b23bdfb03071b8f6ebc"
  },
  "scripts/verify-xeno-stage-operations-audit-v188.mjs": {
    "kind": "verifier",
    "previousSha256": "04a460335b231182df8325625fa0a178358a10a2a14a153aec4ff2d18b6c2fdd",
    "currentSha256": "2ba4904e76df75f29d93b8d0e6d887d15a9962e183552d046924a0f62b1106bb"
  },
  "scripts/verify-xeno-trials-completion-audit-v186.mjs": {
    "kind": "verifier",
    "previousSha256": "1b4e256e64dafb44b62c8cc14bbae94868a8d5dc610f014c333bcf41f717b97b",
    "currentSha256": "0634b9cabcd12581a142fe05f2face9606b80fc160ebdbb1ecb01bdf26a10721"
  },
  "src/xeno-trials-iconic-stages-v194.js": {
    "kind": "runtime",
    "previousSha256": "71e40095a880997dfb8985b7b64546e6a0bbf0171ab84ba5d7efa6cbc297e398",
    "currentSha256": "8da1b1610dd23610e4de8d56a690f6464214dec1c1b925892df71f717df31e4f"
  },
  "sw.js": {
    "kind": "runtime",
    "previousSha256": "c184a920f652f026a57cf0aeed90c5a3d6ceff0caa9ff6371ee20b68e7fe92dd",
    "currentSha256": "f52deb7f6476f98fa8966d44de76e5e3533519c864fca40d7f72ad742edb4bba"
  }
});
export const STAGE_CLASSIFICATION_NEW_INPUTS_V195 = freezeReceipts({
  "scripts/verify-xeno-stage-classification-audit-v195.mjs": {
    "kind": "verifier",
    "sha256": "8d17c9620c8df0a828a6a4fc94220d729cd5daf639e700bd2ee8a5a787b36938"
  }
});

export function reviewedStageClassificationDigestV195(path, endpointV194) {
  if (!Object.hasOwn(STAGE_CLASSIFICATION_SUCCESSORS_V195, path)) return endpointV194;
  const receipt = STAGE_CLASSIFICATION_SUCCESSORS_V195[path];
  assert.equal(endpointV194, receipt.previousSha256, 'Incorrect V194 endpoint for V195: ' + path);
  assert.ok(validHash(receipt.previousSha256) && validHash(receipt.currentSha256), 'Invalid V195 successor digest: ' + path);
  assert.notEqual(receipt.previousSha256, receipt.currentSha256, 'Unchanged V195 successor: ' + path);
  return receipt.currentSha256;
}

export function stageClassificationRuntimeSourcesV195(historical) {
  const result = { ...historical };
  for (const [path, receipt] of Object.entries(STAGE_CLASSIFICATION_SUCCESSORS_V195)) {
    if (receipt.kind !== 'runtime') continue;
    if (result[path] !== undefined && result[path] !== receipt.currentSha256)
      assert.equal(result[path], receipt.previousSha256, 'Incorrect V195 runtime view predecessor: ' + path);
    result[path] = receipt.currentSha256;
  }
  return Object.freeze(result);
}

export function verifyStageClassificationV195(readSource = readRepository) {
  const successors = Object.entries(STAGE_CLASSIFICATION_SUCCESSORS_V195);
  const inputs = Object.entries(STAGE_CLASSIFICATION_NEW_INPUTS_V195);
  assert.ok(successors.length > 0 && inputs.length > 0, 'V195 inputs await final source freeze');
  const paths = [...successors, ...inputs].map(([path]) => path);
  assert.equal(new Set(paths).size, paths.length, 'Duplicate V195 source admission');
  assert.ok(!paths.includes('scripts/audit-xeno-stage-classification-v195.mjs'), 'V195 cannot admit its own bytes');

  for (const [path, receipt] of successors) {
    assert.ok(safePath(path) && kinds.has(receipt.kind), 'Invalid V195 successor path or kind: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'kind', 'previousSha256']);
    assert.equal(sha(readSource(path)), reviewedStageClassificationDigestV195(path, receipt.previousSha256),
      'Unreviewed V195 successor bytes: ' + path);
  }
  for (const [path, receipt] of inputs) {
    assert.ok(safePath(path) && ['verifier', 'document-input'].includes(receipt.kind) && validHash(receipt.sha256),
      'Invalid V195 source receipt: ' + path);
    assert.deepEqual(Object.keys(receipt).sort(), ['kind', 'sha256']);
    assert.equal(sha(readSource(path)), receipt.sha256, 'Unreviewed V195 added-input bytes: ' + path);
  }
  for (const [path, receipt] of Object.entries(STAGE_CLASSIFICATION_HISTORICAL_DECLARATIONS_V195)) {
    const source = readSource(path).toString();
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start, 'Missing historical declaration anchors: ' + path);
    assert.equal(sha(source.slice(start, end)), receipt.sha256, 'Historical receipt declarations changed: ' + path);
  }
  return Object.freeze({
    baselineCommit: STAGE_CLASSIFICATION_BASELINE_V195,
    successors: successors.length,
    addedInputs: inputs.length,
    historicalResultsTransferred: false
  });
}
