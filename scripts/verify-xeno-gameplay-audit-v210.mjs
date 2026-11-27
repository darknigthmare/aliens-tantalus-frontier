import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { XENO_GAMEPLAY_BASELINE_V210, XENO_GAMEPLAY_SUCCESSORS_V210, XENO_GAMEPLAY_NEW_INPUTS_V210,
  reviewedXenoGameplayDigestV210, xenoGameplayRuntimeSourcesV210, verifyXenoGameplayV210 } from './audit-xeno-gameplay-v210.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { XENO_GAMEPLAY_BASELINE_V211, reviewedXenoGameplayDigestV211 } from './audit-xeno-gameplay-v211.mjs';

const root = new URL('..', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('V210 retains the released V209 endpoints and rejects a fabricated predecessor', () => {
  const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 8 * 1024 * 1024 });
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V210)) {
    assert.equal(sha(git('show', XENO_GAMEPLAY_BASELINE_V210 + ':' + path)), receipt.previousSha256, path);
    assert.equal(sha(git('show', XENO_GAMEPLAY_BASELINE_V211 + ':' + path)), receipt.sha256, path);
    assert.equal(reviewedXenoGameplayDigestV210(path, receipt.previousSha256), reviewedXenoGameplayDigestV211(path, receipt.sha256), path);
    assert.throws(() => reviewedXenoGameplayDigestV210(path, '0'.repeat(64)), /Incorrect V209 endpoint for V210/);
  }
  const historical = git('ls-tree', '-r', '--name-only', XENO_GAMEPLAY_BASELINE_V210).toString().split('\n');
  for (const path of Object.keys(XENO_GAMEPLAY_NEW_INPUTS_V210)) assert.ok(!historical.includes(path), path);
  assert.equal(verifyXenoGameplayV210().historicalResultsTransferred, false);
});

test('V210 admits only exact new runtime paths and checks changed bytes', () => {
  const terminal = 'scripts/audit-xeno-gameplay-v210.mjs';
  assert.deepEqual([...read(terminal).toString().matchAll(/(?:from\s*|import\s*\(?\s*)['"]\.\/([^'"\n]+)['"]/g)]
    .map(match => match[1]), ['audit-xeno-gameplay-v211.mjs']);
  const runtime = xenoGameplayRuntimeSourcesV210({ legacy: 'untouched' });
  assert.equal(runtime.legacy, 'untouched');
  assert.deepEqual(xenoGameplayRuntimeSourcesV210(runtime), runtime);
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V210)) {
    const built = ['runtime', 'asset'].includes(receipt.kind);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), built, path);
  }
  const tampered = 'src/xeno-trials-research-v210.js';
  assert.throws(() => verifyXenoGameplayV210(path => path === tampered ? Buffer.from('tampered') : read(path)),
    /Unreviewed V210 source bytes: src\/xeno-trials-research-v210\.js/);
});
