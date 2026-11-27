import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { XENO_GAMEPLAY_BASELINE_V208, XENO_GAMEPLAY_SUCCESSORS_V208, XENO_GAMEPLAY_NEW_INPUTS_V208,
  reviewedXenoGameplayDigestV208, xenoGameplayRuntimeSourcesV208, verifyXenoGameplayV208 } from './audit-xeno-gameplay-v208.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { XENO_GAMEPLAY_BASELINE_V209, reviewedXenoGameplayDigestV209 } from './audit-xeno-gameplay-v209.mjs';

const root = new URL('..', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('V208 retains the released V207 endpoints and rejects a fabricated predecessor', () => {
  const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 8 * 1024 * 1024 });
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V208)) {
    assert.equal(sha(git('show', XENO_GAMEPLAY_BASELINE_V208 + ':' + path)), receipt.previousSha256, path);
    assert.equal(sha(git('show', XENO_GAMEPLAY_BASELINE_V209 + ':' + path)), receipt.sha256, path);
    assert.equal(reviewedXenoGameplayDigestV208(path, receipt.previousSha256), reviewedXenoGameplayDigestV209(path, receipt.sha256), path);
    assert.throws(() => reviewedXenoGameplayDigestV208(path, '0'.repeat(64)), /Incorrect V207 endpoint for V208/);
  }
  const historical = git('ls-tree', '-r', '--name-only', XENO_GAMEPLAY_BASELINE_V208).toString().split('\n');
  for (const path of Object.keys(XENO_GAMEPLAY_NEW_INPUTS_V208)) assert.ok(!historical.includes(path), path);
  assert.equal(verifyXenoGameplayV208().historicalResultsTransferred, false);
});

test('V208 admits only exact new runtime paths and checks changed bytes', () => {
  const terminal = 'scripts/audit-xeno-selection-v214.mjs';
  assert.doesNotMatch(read(terminal).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  const runtime = xenoGameplayRuntimeSourcesV208({ legacy: 'untouched' });
  assert.equal(runtime.legacy, 'untouched');
  assert.deepEqual(xenoGameplayRuntimeSourcesV208(runtime), runtime);
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V208)) {
    const built = receipt.kind === 'runtime';
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), built, path);
  }
  const tampered = 'src/xeno-trials-defense-v208.js';
  assert.throws(() => verifyXenoGameplayV208(path => path === tampered ? Buffer.from('tampered') : read(path)),
    /Unreviewed V208 source bytes: src\/xeno-trials-defense-v208\.js/);
});
