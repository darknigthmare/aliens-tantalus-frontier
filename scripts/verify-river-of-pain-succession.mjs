import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  RIVER_OF_PAIN_BASELINE_20261125, RIVER_OF_PAIN_SUCCESSORS_20261125,
  reviewedRiverOfPainDigest20261125, verifyRiverOfPainSuccession20261125,
  NATIVE_QA_RESOURCES_SUCCESSORS_V187,
  OBSCURA_VERIFIER_SUCCESSOR_20261115,
  reviewedNativeQaResourcesDigestV187, reviewedObscuraDigest20261115,
} from './audit-native-qa-resources-v187.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('Fleuve admits five exact host successors without rewriting the Obscura receipt', () => {
  assert.equal(RIVER_OF_PAIN_BASELINE_20261125, '882ffdee7ed83a549bf2c1c4b9fa38de8e70edc2');
  assert.deepEqual(Object.keys(RIVER_OF_PAIN_SUCCESSORS_20261125).sort(), [
    'index.html', 'package.json', 'scripts/verify-public-release-v86.mjs',
    'src/app.js', 'src/title-screen-v61.js',
  ]);
  assert.deepEqual(OBSCURA_VERIFIER_SUCCESSOR_20261115, {
    path: 'scripts/verify-public-release-v86.mjs',
    previousSha256: '328c764b2bf467d0bc21ae86abf415a7722bd0a88cba486eb2167c22fa8f0b84',
    currentSha256: 'a303c2a1d1ee26fb5fb0e9312efac2f6a093dc50d8c1c88a40ca99fefcd3f8e3',
  });
  assert.deepEqual(verifyRiverOfPainSuccession20261125(), {
    successors: 5, recoveredDlcVersion: '0.9.0-candidate.1', historicalEvidenceTransferred: false,
  });
});

test('V187 and Obscura resolve through the new exact endpoint while unrelated paths pass through', () => {
  for (const [path, receipt] of Object.entries(RIVER_OF_PAIN_SUCCESSORS_20261125)) {
    const predecessor = NATIVE_QA_RESOURCES_SUCCESSORS_V187[path]?.previousSha256 ?? receipt.previousSha256;
    assert.equal(reviewedNativeQaResourcesDigestV187(path, predecessor), sha(read(path)), path);
  }
  const old = OBSCURA_VERIFIER_SUCCESSOR_20261115;
  assert.equal(reviewedObscuraDigest20261115(old.path, old.previousSha256), sha(read(old.path)));
  assert.equal(reviewedRiverOfPainDigest20261125('src/unreviewed.js', 'unchanged'), 'unchanged');
});

test('Fleuve rejects fabricated predecessors and unreviewed changes to every admitted file', () => {
  for (const [path, receipt] of Object.entries(RIVER_OF_PAIN_SUCCESSORS_20261125)) {
    for (const forged of ['0'.repeat(64), receipt.currentSha256]) {
      assert.throws(() => reviewedRiverOfPainDigest20261125(path, forged), /Broken Fleuve source predecessor/);
    }
    const changed = target => target === path
      ? Buffer.concat([read(target), Buffer.from('\n/* unreviewed change */')]) : read(target);
    assert.throws(() => verifyRiverOfPainSuccession20261125(changed), /Unreviewed Fleuve source bytes/);
  }
});

test('the terminal audit retains its no-import and no-self-receipt invariants', () => {
  const terminalPath = 'scripts/audit-native-qa-resources-v187.mjs';
  assert.doesNotMatch(read(terminalPath).toString(), /from\s+['\"][^'\"]*audit-/);
  assert.ok(!Object.hasOwn(RIVER_OF_PAIN_SUCCESSORS_20261125, terminalPath));
});
