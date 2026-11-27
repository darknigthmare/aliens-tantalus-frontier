import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  ALIENS1986_MAIN_BASELINE_V116, ALIENS1986_MAIN_SUCCESSORS_V116,
  reviewedAliens1986MainDigestV116, verifyAliens1986MainSuccessionV116,
  RIVER_OF_PAIN_SUCCESSORS_20261125, reviewedRiverOfPainDigest20261125,
  verifyRiverOfPainSuccession20261125,
} from './audit-native-qa-resources-v187.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('Aliens continues exactly seven main files while preserving all five Fleuve endpoints', () => {
  assert.equal(ALIENS1986_MAIN_BASELINE_V116, '334fe15ba0b7e01de277a13bfc025b208163882d');
  assert.deepEqual(Object.keys(ALIENS1986_MAIN_SUCCESSORS_V116).sort(), [
    'index.html', 'package.json', 'scripts/build.mjs', 'scripts/dev.mjs',
    'scripts/verify-public-release-v86.mjs', 'src/app.js', 'src/title-screen-v61.js',
  ]);
  for (const [path, receipt] of Object.entries(RIVER_OF_PAIN_SUCCESSORS_20261125)) {
    assert.equal(ALIENS1986_MAIN_SUCCESSORS_V116[path].previousSha256, receipt.currentSha256, path);
    assert.equal(reviewedRiverOfPainDigest20261125(path, receipt.previousSha256), sha(read(path)), path);
  }
  assert.deepEqual(verifyRiverOfPainSuccession20261125(), {
    successors: 5, recoveredDlcVersion: '0.9.0-candidate.1', historicalEvidenceTransferred: false,
  });
  assert.deepEqual(verifyAliens1986MainSuccessionV116(), {
    successors: 7, historicalEvidenceTransferred: false,
  });
  // The native keyboard QA is a reviewed tooling change; the seven host receipts stay unchanged.
  assert.equal(sha(read('scripts/qa-title-compositions-v163.py')),
    '83a2cea01f17149d8a512c265604b572dac653c704001903989e66b8c94ecdba', 'Unreviewed native title keyboard QA bytes');
});

test('the new succession rejects fabricated predecessors and changed source bytes', () => {
  for (const [path, receipt] of Object.entries(ALIENS1986_MAIN_SUCCESSORS_V116)) {
    for (const forged of ['0'.repeat(64), receipt.currentSha256]) {
      assert.throws(() => reviewedAliens1986MainDigestV116(path, forged), /Broken Aliens main predecessor/);
    }
    const changed = target => target === path
      ? Buffer.concat([read(target), Buffer.from('\n/* unreviewed */')]) : read(target);
    assert.throws(() => verifyAliens1986MainSuccessionV116(changed), /Unreviewed Aliens main source bytes/);
  }
  assert.equal(reviewedAliens1986MainDigestV116('src/unrelated.js', 'unchanged'), 'unchanged');
});

test('the terminal audit remains independent of downstream audits and has no self receipt', () => {
  const path = 'scripts/audit-xeno-gameplay-v210.mjs';
  assert.doesNotMatch(read(path).toString(), /from\s+['"][^'"]*audit-/);
  assert.equal(Object.hasOwn(ALIENS1986_MAIN_SUCCESSORS_V116, path), false);
  assert.equal(Object.hasOwn(RIVER_OF_PAIN_SUCCESSORS_20261125, path), false);
});
