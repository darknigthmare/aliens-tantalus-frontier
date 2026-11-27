import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { XENO_GAMEPLAY_BASELINE_V212, XENO_GAMEPLAY_SUCCESSORS_V212, XENO_GAMEPLAY_NEW_INPUTS_V212,
  reviewedXenoGameplayDigestV212, xenoGameplayRuntimeSourcesV212, verifyXenoGameplayV212 } from './audit-xeno-gameplay-v212.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { XENO_GAMEPLAY_BASELINE_V213, reviewedXenoGameplayDigestV213 } from './audit-xeno-gameplay-v213.mjs';

const root = new URL('..', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 8 * 1024 * 1024 });

test('V212 continues the published V211 byte receipts and rejects forged predecessors', () => {
  assert.equal(XENO_GAMEPLAY_BASELINE_V212, 'b32d3ca217c35a8fa532d2d48833a6f1ae3546ca');
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V212)) {
    assert.equal(sha(git('show', `${XENO_GAMEPLAY_BASELINE_V212}:${path}`)), receipt.previousSha256, path);
    assert.equal(sha(git('show', `${XENO_GAMEPLAY_BASELINE_V213}:${path}`)), receipt.sha256, path);
    assert.equal(reviewedXenoGameplayDigestV212(path, receipt.previousSha256), reviewedXenoGameplayDigestV213(path, receipt.sha256), path);
    assert.throws(() => reviewedXenoGameplayDigestV212(path, '0'.repeat(64)), /Incorrect V211 endpoint for V212/);
  }
  const historical = new Set(git('ls-tree', '-r', '--name-only', XENO_GAMEPLAY_BASELINE_V212).toString().split('\n'));
  for (const path of Object.keys(XENO_GAMEPLAY_NEW_INPUTS_V212)) assert.equal(historical.has(path), false, path);
  assert.equal(verifyXenoGameplayV212().historicalResultsTransferred, false);
});

test('V212 keeps QA and the Bible status outside the games and rejects modified bytes', () => {
  const runtime = xenoGameplayRuntimeSourcesV212({ legacy: 'untouched' });
  assert.equal(runtime.legacy, 'untouched');
  assert.deepEqual(xenoGameplayRuntimeSourcesV212(runtime), runtime);
  for (const [path, { kind }] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V212)) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(kind), path);
  }
  const path = 'src/xeno-trials-finishers-v212.js';
  assert.throws(() => verifyXenoGameplayV212(candidate => candidate === path ? Buffer.from('tampered') : read(candidate)),
    /Unreviewed V212 source bytes: src\/xeno-trials-finishers-v212\.js/);
});
