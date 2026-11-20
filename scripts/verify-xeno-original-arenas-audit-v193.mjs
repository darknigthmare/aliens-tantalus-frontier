import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  ORIGINAL_ARENAS_BASELINE_V193 as baseline,
  ORIGINAL_ARENAS_HISTORICAL_DECLARATIONS_V193 as declarations,
  ORIGINAL_ARENAS_NEW_INPUTS_V193 as inputs,
  ORIGINAL_ARENAS_SUCCESSORS_V193 as successors,
  originalArenasRuntimeSourcesV193 as runtimeSources,
  reviewedOriginalArenasDigestV193 as advance,
  verifyOriginalArenasV193 as verify
} from './audit-xeno-original-arenas-v193.mjs';
import {
  FRANCHISE_STAGES_SUCCESSORS_V192 as priorSuccessors,
  FRANCHISE_STAGES_NEW_INPUTS_V192 as priorInputs,
  FRANCHISE_STAGES_PRESERVED_PLATES_V192 as priorPlates,
  franchiseStagesRuntimeSourcesV192 as runtimeRelay,
  verifyFranchiseStagesV192 as verifyPrevious
} from './audit-xeno-franchise-stages-v192.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('V193 preserves the published V192 audit declarations and anchors every successor in the published tree', () => {
  assert.equal(baseline, '81b4f2fd0d9e742b423236e7b574847fd9ae77ee');
  assert.deepEqual([priorSuccessors, priorInputs, priorPlates].map(entries => Object.keys(entries).length), [29, 62, 12]);
  for (const [path, receipt] of Object.entries(declarations)) {
    const extract = bytes => {
      const source = bytes.toString();
      const start = source.indexOf(receipt.start);
      const end = source.indexOf(receipt.end, start + receipt.start.length);
      assert.ok(start >= 0 && end > start, path);
      return source.slice(start, end);
    };
    assert.equal(extract(read(path)), extract(git(['show', `${baseline}:${path}`])));
    assert.equal(sha(extract(read(path))), receipt.sha256);
  }
  const publishedPaths = new Set(git(['ls-tree', '-r', '--name-only', baseline]).toString().trim().split('\n'));
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(publishedPaths.has(path), path);
    assert.equal(sha(git(['show', `${baseline}:${path}`])), receipt.previousSha256, path);
    assert.equal(advance(path, receipt.previousSha256), receipt.currentSha256, path);
    assert.throws(() => advance(path, receipt.currentSha256), /Incorrect V192 endpoint for V193/);
  }
  for (const path of Object.keys(inputs)) assert.ok(!publishedPaths.has(path), path);
  assert.equal(advance('src/unreviewed-v193.js', 'history'), 'history');
  assert.equal(advance('constructor', 'history'), 'history');
});

test('the exact twelve new atlas inputs are verified through the audit relay', () => {
  const atlases = Object.entries(inputs).filter(([path, receipt]) =>
    path.startsWith('assets/openai/stages/xeno-trials-v193/') && receipt.kind === 'asset');
  assert.equal(atlases.length, 12);
  assert.equal(new Set(atlases.map(([, receipt]) => receipt.sha256)).size, 12);
  assert.equal(verify().historicalResultsTransferred, false);
  assert.equal(verifyPrevious().historicalResultsTransferred, false);
  const [atlas] = atlases[0];
  const changed = path => path === atlas ? Buffer.from('unreviewed V193 plate') : read(path);
  assert.throws(() => verify(changed), error => error.message.includes(atlas));
  assert.throws(() => verifyPrevious(changed), error => error.message.includes(atlas));
});

test('the runtime view includes reviewed V193 sources and rejects a false predecessor', () => {
  const historical = Object.freeze({ untouched: 'history' });
  const reviewed = runtimeRelay(historical);
  assert.equal(historical.untouched, 'history');
  assert.ok(Object.isFrozen(reviewed));
  assert.deepEqual(runtimeRelay(reviewed), reviewed);
  for (const [path, receipt] of Object.entries(successors)) {
    if (receipt.kind === 'runtime') assert.equal(reviewed[path], receipt.currentSha256, path);
  }
  const newRuntime = Object.entries(inputs).filter(([, receipt]) => receipt.kind === 'runtime');
  assert.ok(newRuntime.length > 0);
  for (const [path, receipt] of newRuntime) assert.equal(reviewed[path], receipt.sha256, path);
  const successor = Object.entries(successors).find(([, receipt]) => receipt.kind === 'runtime');
  assert.ok(successor);
  assert.throws(() => runtimeSources({ [successor[0]]: '0'.repeat(64) }), /Incorrect V193 runtime view predecessor/);
});

test('audit tooling and the outcome report stay source-only, with no broad V193 path admission', () => {
  const terminal = 'scripts/audit-xeno-original-arenas-v193.mjs';
  const verifier = 'scripts/verify-xeno-original-arenas-audit-v193.mjs';
  const report = 'docs/forge/xeno-trials/V193-ORIGINAL-ARENAS.md';
  for (const path of [terminal, verifier, report]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of [terminal, report]) {
    assert.ok(!Object.hasOwn(successors, path) && !Object.hasOwn(inputs, path), path);
  }
  for (const path of ['scripts/audit-xeno-original-unreviewed-v193.mjs',
    'assets/openai/stages/xeno-trials-v193/colony/unreviewed.png']) {
    assert.equal(isPublicDistributionPathV86(path), false, path);
  }
  assert.equal(collectReleaseTestsV143(JSON.parse(read('package.json')).scripts)
    .filter(path => path === verifier).length, 1);
});
