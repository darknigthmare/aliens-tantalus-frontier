import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { XENO_STANDALONE_PARENTS_V207, XENO_STANDALONE_SUCCESSORS_V207, XENO_STANDALONE_NEW_INPUTS_V207,
  reviewedXenoStandaloneDigestV207, verifyXenoStandaloneV207 } from './audit-xeno-standalone-v207.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { XENO_GAMEPLAY_BASELINE_V208, reviewedXenoGameplayDigestV208 } from './audit-xeno-gameplay-v208.mjs';

const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = value => createHash('sha256').update(value).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: new URL('..', import.meta.url), maxBuffer: 8 * 1024 * 1024 });

test('V207 chains exact source bytes from the public main and V206 parents', () => {
  const { merged, trials, main } = XENO_STANDALONE_PARENTS_V207;
  assert.equal(git('show', '-s', '--format=%P', merged).toString().trim(), [trials, main].join(' '));
  for (const [path, receipt] of Object.entries(XENO_STANDALONE_SUCCESSORS_V207)) {
    assert.equal(sha(git('show', XENO_GAMEPLAY_BASELINE_V208 + ':' + path)), receipt.sha256, path);
    for (const [parent, expected] of Object.entries(receipt.parents)) {
      assert.equal(sha(git('show', XENO_STANDALONE_PARENTS_V207[parent] + ':' + path)), expected, path);
      assert.equal(reviewedXenoStandaloneDigestV207(path, expected), reviewedXenoGameplayDigestV208(path, receipt.sha256), path);
    }
    assert.throws(() => reviewedXenoStandaloneDigestV207(path, '0'.repeat(64)), /Incorrect V207 predecessor/);
  }
  assert.deepEqual(verifyXenoStandaloneV207(), {
    successors: Object.keys(XENO_STANDALONE_SUCCESSORS_V207).length,
    addedInputs: Object.keys(XENO_STANDALONE_NEW_INPUTS_V207).length,
    historicalResultsTransferred: false
  });
});

test('standalone admission rejects modified sources and connects the terminal review', () => {
  const terminal = 'scripts/audit-xeno-gameplay-v212.mjs';
  assert.doesNotMatch(read(terminal).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  assert.ok(!Object.hasOwn(XENO_STANDALONE_SUCCESSORS_V207, terminal));
  assert.ok(!Object.hasOwn(XENO_STANDALONE_NEW_INPUTS_V207, terminal));
  for (const path of [terminal, ...Object.keys(XENO_STANDALONE_NEW_INPUTS_V207).filter(path => path.startsWith('scripts/'))]) {
    assert.ok(isPublicDistributionPathV86(path), path);
    assert.ok(!isPublicDistributionPathV86(path, { built: true }), path);
  }
  const altered = path => path === 'src/xeno-trials-standalone.js' ? Buffer.concat([read(path), Buffer.from('\n// edited')]) : read(path);
  assert.throws(() => verifyXenoStandaloneV207(altered), /Unreviewed V207 source bytes.*xeno-trials-standalone/);
});
