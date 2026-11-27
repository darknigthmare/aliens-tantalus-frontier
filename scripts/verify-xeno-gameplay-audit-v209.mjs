import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { XENO_GAMEPLAY_BASELINE_V209, XENO_GAMEPLAY_SUCCESSORS_V209, XENO_GAMEPLAY_NEW_INPUTS_V209,
  reviewedXenoGameplayDigestV209, xenoGameplayRuntimeSourcesV209, verifyXenoGameplayV209 } from './audit-xeno-gameplay-v209.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

const root = new URL('..', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('V209 retains the released V208 endpoints and rejects a fabricated predecessor', () => {
  const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 8 * 1024 * 1024 });
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V209)) {
    assert.equal(sha(git('show', XENO_GAMEPLAY_BASELINE_V209 + ':' + path)), receipt.previousSha256, path);
    assert.equal(reviewedXenoGameplayDigestV209(path, receipt.previousSha256), receipt.sha256, path);
    assert.throws(() => reviewedXenoGameplayDigestV209(path, '0'.repeat(64)), /Incorrect V208 endpoint for V209/);
  }
  const historical = git('ls-tree', '-r', '--name-only', XENO_GAMEPLAY_BASELINE_V209).toString().split('\n');
  for (const path of Object.keys(XENO_GAMEPLAY_NEW_INPUTS_V209)) assert.ok(!historical.includes(path), path);
  assert.equal(verifyXenoGameplayV209().historicalResultsTransferred, false);
});

test('V209 admits only exact new runtime paths and checks changed bytes', () => {
  const terminal = 'scripts/audit-xeno-gameplay-v209.mjs';
  assert.doesNotMatch(read(terminal).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  const runtime = xenoGameplayRuntimeSourcesV209({ legacy: 'untouched' });
  assert.equal(runtime.legacy, 'untouched');
  assert.deepEqual(xenoGameplayRuntimeSourcesV209(runtime), runtime);
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V209)) {
    const built = ['runtime', 'asset'].includes(receipt.kind);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), built, path);
  }
  const tampered = 'src/xeno-trials-research-v209.js';
  assert.throws(() => verifyXenoGameplayV209(path => path === tampered ? Buffer.from('tampered') : read(path)),
    /Unreviewed V209 source bytes: src\/xeno-trials-research-v209\.js/);
});
