import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  XENO_PRIORITIES_BASELINE_V197 as baseline,
  XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V197 as declarations,
  XENO_PRIORITIES_NEW_INPUTS_V197 as inputs,
  XENO_PRIORITIES_SUCCESSORS_V197 as successors,
  xenoPrioritiesRuntimeSourcesV197 as runtimeSources,
  reviewedXenoPrioritiesDigestV197 as advance,
  verifyXenoPrioritiesV197 as verify
} from './audit-xeno-priorities-v197.mjs';
import {
  referencedFilmStagesRuntimeSourcesV196 as priorRuntimeSources,
  verifyReferencedFilmStagesV196 as verifyPrior
} from './audit-xeno-referenced-film-stages-v196.mjs';
import { verifyStageClassificationV195 as verifyEarlier } from './audit-xeno-stage-classification-v195.mjs';
import { reviewedXenoPriorityStagesDigestV198 as advanceToV198 } from './audit-xeno-priority-stages-v198.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const readBaseline = path => git(['show', baseline + ':' + path]);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const prior = 'scripts/audit-xeno-referenced-film-stages-v196.mjs';
const terminal = 'scripts/audit-xeno-priorities-v197.mjs';
const verifier = 'scripts/verify-xeno-priorities-audit-v197.mjs';
const report = 'docs/forge/xeno-trials/V197-PRIORITIES.md';
const spritePrefix = 'assets/openai/sprites/xeno-trials-v197/';

test('V197 preserves V196 historical declarations and every successor starts at its exact Git bytes', () => {
  assert.equal(baseline, 'bf9d2b9f00ce3562533a27451edb808c080a813d');
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
      assert.throws(() => advance(path, forged), /Incorrect V196 endpoint for V197/, path);
  }
  for (const [path, receipt] of Object.entries(inputs)) {
    assert.ok(!published.has(path), path);
    assert.ok(Object.isFrozen(receipt), path);
    assert.equal(sha(read(path)), advanceToV198(path, receipt.sha256), path);
  }
  assert.equal(advance('constructor', 'history'), 'history');
});

test('the historical audit relay rejects changed V197 runtime and atlas bytes', () => {
  const assets = Object.keys(inputs).filter(path => inputs[path].kind === 'asset');
  assert.ok(assets.length >= 2 && assets.length <= 3);
  assert.ok(assets.includes(spritePrefix + 'synth-trooper-combat-sheet.png'));
  assert.ok(Object.values(successors).every(receipt => receipt.kind !== 'asset'));
  assert.equal(new Set(assets.map(path => inputs[path].sha256)).size, assets.length);
  for (const path of assets) {
    assert.match(path, /^assets\/openai\/sprites\/xeno-trials-v197\/(?:synth-trooper|synth-guard|import-game-afe2-warden)-combat-sheet\.png$/);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true, path);
  }
  for (const audit of [verify, verifyPrior, verifyEarlier]) {
    assert.equal(audit().historicalResultsTransferred, false);
    for (const path of [assets[0], 'src/xeno-trials-runtime-v96.js', 'src/xeno-trials-duel-checkpoint-v197.js']) {
      const changed = candidate => candidate === path ? Buffer.from('unreviewed V197 input') : read(candidate);
      assert.throws(() => audit(changed), error => error.message.includes(path), path);
    }
  }
});

test('V197 extends the effective runtime and retains strict predecessor checks', () => {
  const historical = Object.freeze({ untouched: 'historic' });
  const effective = priorRuntimeSources(historical);
  assert.deepEqual(historical, { untouched: 'historic' });
  assert.ok(Object.isFrozen(effective));
  assert.deepEqual(priorRuntimeSources(effective), effective);
  for (const [path, receipt] of Object.entries(successors)) {
    if (receipt.kind !== 'runtime') continue;
    assert.equal(effective[path], advanceToV198(path, receipt.currentSha256), path);
    assert.throws(() => runtimeSources({ [path]: '0'.repeat(64) }), /Incorrect V197 runtime view predecessor/);
  }
  for (const [path, receipt] of Object.entries(inputs)) {
    if (receipt.kind !== 'runtime') continue;
    assert.equal(effective[path], advanceToV198(path, receipt.sha256), path);
    assert.throws(() => runtimeSources({ [path]: '0'.repeat(64) }), /Incorrect new V197 runtime digest/);
  }
});

test('the terminal audit, its test and the mutable outcome report are exact source-only paths', () => {
  assert.match(read(prior).toString(), /from '\.\/audit-xeno-priorities-v197\.mjs'/);
  assert.match(read(terminal).toString(), /from '\.\/audit-xeno-priority-stages-v198\.mjs'/);
  for (const path of [terminal, verifier, report]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of [terminal, report])
    assert.ok(!Object.hasOwn(inputs, path) && !Object.hasOwn(successors, path), path);
  for (const path of [spritePrefix + 'unreviewed-combat-sheet.png', 'scripts/audit-xeno-priorities-unreviewed-v197.mjs'])
    assert.equal(isPublicDistributionPathV86(path), false, path);
  assert.equal(collectReleaseTestsV143(JSON.parse(read('package.json')).scripts)
    .filter(path => path === verifier).length, 1);
});
