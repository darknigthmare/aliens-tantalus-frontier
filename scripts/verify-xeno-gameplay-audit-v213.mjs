import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { XENO_GAMEPLAY_BASELINE_V213, XENO_GAMEPLAY_SUCCESSORS_V213, XENO_GAMEPLAY_NEW_INPUTS_V213,
  reviewedXenoGameplayDigestV213, xenoGameplayRuntimeSourcesV213, verifyXenoGameplayV213 } from './audit-xeno-gameplay-v213.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

const root = new URL('..', import.meta.url);
const read = path => readFileSync(new URL(path, root));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 8 * 1024 * 1024 });

test('V213 continues the published V212 byte receipts and rejects forged predecessors', () => {
  assert.equal(XENO_GAMEPLAY_BASELINE_V213, 'de7d162658f14b3e5820a5bd5b1e72deeafdcc24');
  for (const [path, receipt] of Object.entries(XENO_GAMEPLAY_SUCCESSORS_V213)) {
    assert.equal(sha(git('show', `${XENO_GAMEPLAY_BASELINE_V213}:${path}`)), receipt.previousSha256, path);
    assert.equal(reviewedXenoGameplayDigestV213(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoGameplayDigestV213(path, '0'.repeat(64)), /Incorrect V212 endpoint for V213/);
  }
  const historical = new Set(git('ls-tree', '-r', '--name-only', XENO_GAMEPLAY_BASELINE_V213).toString().split('\n'));
  for (const path of Object.keys(XENO_GAMEPLAY_NEW_INPUTS_V213)) assert.equal(historical.has(path), false, path);
  assert.equal(verifyXenoGameplayV213().historicalResultsTransferred, false);
});

test('V213 keeps QA and the Bible status outside the games and rejects modified bytes', () => {
  const runtime = xenoGameplayRuntimeSourcesV213({ legacy: 'untouched' });
  assert.equal(runtime.legacy, 'untouched');
  assert.deepEqual(xenoGameplayRuntimeSourcesV213(runtime), runtime);
  for (const [path, { kind }] of Object.entries(XENO_GAMEPLAY_NEW_INPUTS_V213)) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), ['runtime', 'asset'].includes(kind), path);
  }
  const path = 'src/xeno-trials-finishers-v213.js';
  assert.throws(() => verifyXenoGameplayV213(candidate => candidate === path ? Buffer.from('tampered') : read(candidate)),
    /Unreviewed V213 source bytes: src\/xeno-trials-finishers-v213\.js/);
});
