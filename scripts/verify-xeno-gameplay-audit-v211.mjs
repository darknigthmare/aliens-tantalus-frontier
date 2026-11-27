import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { XENO_GAMEPLAY_BASELINE_V211, XENO_GAMEPLAY_SUCCESSORS_V211, XENO_GAMEPLAY_NEW_INPUTS_V211,
  reviewedXenoGameplayDigestV211, xenoGameplayRuntimeSourcesV211, verifyXenoGameplayV211 } from './audit-xeno-gameplay-v211.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { XENO_GAMEPLAY_BASELINE_V212, reviewedXenoGameplayDigestV212 } from './audit-xeno-gameplay-v212.mjs';

const root = new URL('..', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 8 * 1024 * 1024 });

test('V211 continues the published V210 byte receipts and rejects forged predecessors', () => {
  assert.equal(XENO_GAMEPLAY_BASELINE_V211, 'b721fe98bc62b2374e9aac012c302e42e9768b4b');
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V211)) {
    assert.equal(sha(git('show', `${XENO_GAMEPLAY_BASELINE_V211}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_GAMEPLAY_BASELINE_V212}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoGameplayDigestV211(path, receipt.previousSha256), reviewedXenoGameplayDigestV212(path, receipt.sha256), path);
    assert.throws(() => reviewedXenoGameplayDigestV211(path, '0'.repeat(64)), /Incorrect V210 endpoint for V211/);
  }
  const historical = new Set(git('ls-tree', '-r', '--name-only', XENO_GAMEPLAY_BASELINE_V211).toString().split('\n'));
  for (const path of Object.keys(XENO_GAMEPLAY_NEW_INPUTS_V211)) assert.equal(historical.has(path), false, path);
  assert.equal(verifyXenoGameplayV211().historicalResultsTransferred, false);
});

test('V211 keeps QA and the Bible status outside the games and rejects modified bytes', () => {
  const runtime = xenoGameplayRuntimeSourcesV211({ legacy: 'untouched' });
  assert.equal(runtime.legacy, 'untouched');
  assert.deepEqual(xenoGameplayRuntimeSourcesV211(runtime), runtime);
  for (const [path, { kind }] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V211)) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(kind), path);
  }
  const path = 'src/xeno-trials-finishers-v211.js';
  assert.throws(() => verifyXenoGameplayV211(candidate => candidate === path ? Buffer.from('tampered') : read(candidate)),
    /Unreviewed V211 source bytes: src\/xeno-trials-finishers-v211\.js/);
});
