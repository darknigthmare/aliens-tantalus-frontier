import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { XENO_GAMEPLAY_BASELINE_V213, XENO_GAMEPLAY_SUCCESSORS_V213, XENO_GAMEPLAY_NEW_INPUTS_V213,
  reviewedXenoGameplayDigestV213, xenoGameplayRuntimeSourcesV213, verifyXenoGameplayV213 } from './audit-xeno-gameplay-v213.mjs';
import { XENO_SELECTION_BASELINE_V214, XENO_SELECTION_DECLARATIONS_V214, XENO_SELECTION_SUCCESSORS_V214,
  reviewedXenoSelectionDigestV214, xenoSelectionRuntimeSourcesV214, verifyXenoSelectionV214 } from './audit-xeno-selection-v214.mjs';
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

test('V214 preserves V213 declarations and admits the selection sources from exact Git predecessors', () => {
  assert.equal(XENO_SELECTION_BASELINE_V214, '26608995d9619ff7c369c2a980e09d0bfbd181cc');
  const runtimePaths = ['src/i18n-auto-v185.js', 'src/xeno-trials-ui-v96.js', 'xeno-trials-fullscreen-v119.css'];
  assert.deepEqual(Object.entries(XENO_SELECTION_SUCCESSORS_V214).filter(([, row]) => row.kind === 'runtime')
    .map(([path]) => path).sort(), runtimePaths);
  for (const [path, receipt] of Object.entries(XENO_SELECTION_SUCCESSORS_V214)) {
    assert.equal(sha(git('show', `${XENO_SELECTION_BASELINE_V214}:${path}`)), receipt.previousSha256, path);
    assert.equal(reviewedXenoSelectionDigestV214(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => reviewedXenoSelectionDigestV214(path, receipt.sha256), /Incorrect V213 endpoint for V214/);
  }
  for (const [path, receipt] of Object.entries(XENO_SELECTION_DECLARATIONS_V214)) {
    const extract = bytes => {
      const source = bytes.toString();
      const start = source.indexOf(receipt.start);
      const end = source.indexOf(receipt.end, start + receipt.start.length);
      assert.ok(start >= 0 && end > start, path);
      return source.slice(start, end);
    };
    assert.equal(extract(read(path)), extract(git('show', `${XENO_SELECTION_BASELINE_V214}:${path}`)), path);
    assert.equal(sha(extract(read(path))), receipt.sha256, path);
  }
  const runtime = xenoGameplayRuntimeSourcesV213({ legacy: 'untouched' });
  for (const path of runtimePaths) assert.equal(runtime[path], XENO_SELECTION_SUCCESSORS_V214[path].sha256);
  assert.deepEqual(xenoSelectionRuntimeSourcesV214(runtime), runtime);
  assert.equal(verifyXenoSelectionV214().historicalResultsTransferred, false);
  const selection = 'src/xeno-trials-ui-v96.js';
  assert.throws(() => verifyXenoGameplayV213(path => path === selection ? Buffer.from('unreviewed UI') : read(path)),
    error => error.message.includes(selection) && error.message.includes('Unreviewed'));
});

test('V214 is the independent terminal and its only new audit script is source-only', () => {
  const path = 'scripts/audit-xeno-selection-v214.mjs';
  assert.match(read('scripts/audit-xeno-gameplay-v213.mjs').toString(), /from '\.\/audit-xeno-selection-v214\.mjs'/);
  assert.doesNotMatch(read(path).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  assert.ok(!Object.hasOwn(XENO_SELECTION_SUCCESSORS_V214, path));
  assert.equal(isPublicDistributionPathV86(path), true);
  assert.equal(isPublicDistributionPathV86(path, { built: true }), false);
  assert.equal(isPublicDistributionPathV86('scripts/audit-xeno-unreviewed-v214.mjs'), false);
});
