import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  XENO_PRIORITY_STAGES_BASELINE_V198 as baseline,
  XENO_PRIORITY_STAGES_HISTORICAL_DECLARATIONS_V198 as declarations,
  XENO_PRIORITY_STAGES_NEW_INPUTS_V198 as inputs,
  XENO_PRIORITY_STAGES_SUCCESSORS_V198 as successors,
  xenoPriorityStagesRuntimeSourcesV198 as runtimeSources,
  reviewedXenoPriorityStagesDigestV198 as advance,
  verifyXenoPriorityStagesV198 as verify
} from './audit-xeno-priority-stages-v198.mjs';
import {
  xenoPrioritiesRuntimeSourcesV197 as priorRuntimeSources,
  verifyXenoPrioritiesV197 as verifyPrior
} from './audit-xeno-priorities-v197.mjs';
import { verifyStageClassificationV195 as verifyEarlier } from './audit-xeno-stage-classification-v195.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const readBaseline = path => git(['show', baseline + ':' + path]);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const prior = 'scripts/audit-xeno-priorities-v197.mjs';
const terminal = 'scripts/audit-xeno-priority-stages-v198.mjs';
const verifier = 'scripts/verify-xeno-priority-stages-audit-v198.mjs';
const report = 'docs/forge/xeno-trials/V198-PRIORITY-STAGES.md';
const stagePrefix = 'assets/openai/stages/xeno-trials-v198/';
const textures = [
  'arcade-containment-laboratory',
  'covenant-maintenance-workshop',
  'hadleys-hope-service-corridor',
  'nostromo-maintenance',
  'sevastopol-synthetic-line'
].flatMap(slug => ['base', 'props'].map(layer => stagePrefix + slug + '-' + layer + '.png'));

test('V198 preserves V197 historical declarations and every successor starts at its exact Git bytes', () => {
  assert.equal(baseline, '5a41ed1fa6e8bfc9dcbc4ef19410bd622b862abc');
  assert.deepEqual(Object.keys(declarations), [prior]);
  for (const [path, receipt] of Object.entries(declarations)) {
    const extract = bytes => {
      const content = bytes.toString();
      const start = content.indexOf(receipt.start);
      const end = content.indexOf(receipt.end, start + receipt.start.length);
      assert.ok(start >= 0 && end > start, path);
      return content.slice(start, end);
    };
    const historical = extract(readBaseline(path));
    assert.equal(extract(read(path)), historical, path);
    assert.equal(sha(historical), receipt.sha256, path);
  }
  const published = new Set(git(['ls-tree', '-r', '--name-only', baseline]).toString().trim().split('\n'));
  assert.ok(Object.hasOwn(successors, prior));
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(published.has(path), path);
    assert.ok(Object.isFrozen(receipt), path);
    assert.equal(sha(readBaseline(path)), receipt.previousSha256, path);
    assert.equal(advance(path, receipt.previousSha256), sha(read(path)), path);
    for (const forged of [receipt.currentSha256, '0'.repeat(64), null])
      assert.throws(() => advance(path, forged), /Incorrect V197 endpoint for V198/, path);
  }
  for (const [path, receipt] of Object.entries(inputs)) {
    assert.ok(!published.has(path), path);
    assert.ok(Object.isFrozen(receipt), path);
    assert.equal(sha(read(path)), receipt.sha256, path);
  }
  assert.equal(advance('constructor', 'history'), 'history');
});

test('the historical audit relay rejects changed V198 runtime and stage texture bytes', () => {
  const assets = Object.keys(inputs).filter(path => inputs[path].kind === 'asset').sort();
  assert.deepEqual(assets, textures);
  assert.ok(Object.values(successors).every(receipt => receipt.kind !== 'asset'));
  assert.equal(new Set(assets.map(path => inputs[path].sha256)).size, assets.length);
  for (const path of assets) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true, path);
  }
  const runtimePath = Object.keys(inputs).find(path => inputs[path].kind === 'runtime');
  assert.ok(runtimePath, 'A separately reviewed runtime input registers the new stages.');
  for (const audit of [verify, verifyPrior, verifyEarlier]) {
    assert.equal(audit().historicalResultsTransferred, false);
    for (const path of [assets[0], runtimePath]) {
      const changed = candidate => candidate === path ? Buffer.from('unreviewed V198 input') : read(candidate);
      assert.throws(() => audit(changed), error => error.message.includes(path), path);
    }
  }
});

test('V198 extends the effective runtime and retains strict predecessor checks', () => {
  const historical = Object.freeze({ untouched: 'historic' });
  const effective = priorRuntimeSources(historical);
  assert.deepEqual(historical, { untouched: 'historic' });
  assert.ok(Object.isFrozen(effective));
  assert.deepEqual(priorRuntimeSources(effective), effective);
  for (const [path, receipt] of Object.entries(successors)) {
    if (receipt.kind !== 'runtime') continue;
    assert.equal(effective[path], receipt.currentSha256, path);
    assert.throws(() => runtimeSources({ [path]: '0'.repeat(64) }), /Incorrect V198 runtime view predecessor/);
  }
  for (const [path, receipt] of Object.entries(inputs)) {
    if (receipt.kind !== 'runtime') continue;
    assert.equal(effective[path], receipt.sha256, path);
    assert.throws(() => runtimeSources({ [path]: '0'.repeat(64) }), /Incorrect new V198 runtime digest/);
  }
});

test('the terminal audit, its test and the mutable outcome report are exact source-only paths', () => {
  assert.match(read(prior).toString(), /from '\.\/audit-xeno-priority-stages-v198\.mjs'/);
  assert.doesNotMatch(read(terminal).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  for (const path of [terminal, verifier, report]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of [terminal, report])
    assert.ok(!Object.hasOwn(inputs, path) && !Object.hasOwn(successors, path), path);
  for (const path of [stagePrefix + 'unreviewed-base.png', 'scripts/audit-xeno-priority-stages-unreviewed-v198.mjs'])
    assert.equal(isPublicDistributionPathV86(path), false, path);
  assert.equal(collectReleaseTestsV143(JSON.parse(read('package.json')).scripts)
    .filter(path => path === verifier).length, 1);
});
