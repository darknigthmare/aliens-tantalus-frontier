import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  XENO_PRIORITIES_BASELINE_V201 as baseline,
  XENO_PRIORITIES_HISTORICAL_DECLARATIONS_V201 as declarations,
  XENO_PRIORITIES_NEW_INPUTS_V201 as inputs,
  XENO_PRIORITIES_SUCCESSORS_V201 as successors,
  reviewedXenoPrioritiesDigestV201 as advance,
  verifyXenoPrioritiesV201 as verify,
  xenoPrioritiesRuntimeSourcesV201 as runtimeSources
} from './audit-xeno-priorities-v201.mjs';
import { reviewedXenoPrioritiesDigestV202 as advanceToV202 } from './audit-xeno-priorities-v202.mjs';
import { verifyXenoSupersV200 as verifyPrior, xenoSupersRuntimeSourcesV200 as runtimeRelay } from './audit-xeno-supers-v200.mjs';
import { verifyXenoPrioritiesV199 as verifyEarlier } from './audit-xeno-priorities-v199.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const readPublished = path => git(['show', '56caa02c812915225554133f6eaa1625eb1393fe:' + path]);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const prior = 'scripts/audit-xeno-supers-v200.mjs';
const relay = 'scripts/audit-xeno-priorities-v201.mjs';
const terminal = 'scripts/audit-xeno-gameplay-v210.mjs';
const verifier = 'scripts/verify-xeno-priorities-audit-v201.mjs';
const report = 'docs/forge/xeno-trials/V201-PRIORITIES.md';

test('V201 preserves the published V200 declarations and accepts each successor only from its exact predecessor', () => {
  assert.equal(baseline, '005568f7f285ca5ec704e0e87498b2e5b68211a9');
  assert.deepEqual(Object.keys(declarations), [prior]);
  const receipt = declarations[prior];
  const extract = source => {
    const start = source.indexOf(receipt.start);
    const end = source.indexOf(receipt.end, start + receipt.start.length);
    assert.ok(start >= 0 && end > start);
    return source.slice(start, end);
  };
  const historical = extract(git(['show', baseline + ':' + prior]).toString());
  assert.equal(extract(read(prior).toString()), historical);
  assert.equal(sha(historical), receipt.sha256);
  const published = new Set(git(['ls-tree', '-r', '--name-only', baseline]).toString().trim().split('\n'));
  assert.ok(Object.hasOwn(successors, prior));
  for (const [path, entry] of Object.entries(successors)) {
    assert.ok(published.has(path), path);
    assert.ok(Object.isFrozen(entry), path);
    assert.equal(sha(git(['show', baseline + ':' + path])), entry.previousSha256, path);
    assert.equal(sha(readPublished(path)), entry.currentSha256, path);
    assert.equal(advance(path, entry.previousSha256), sha(read(path)), path);
    assert.throws(() => advance(path, entry.currentSha256), /Incorrect V200 endpoint for V201/, path);
  }
  for (const [path, entry] of Object.entries(inputs)) {
    assert.ok(!published.has(path), path);
    assert.ok(Object.isFrozen(entry), path);
    assert.equal(sha(readPublished(path)), entry.sha256, path);
    assert.equal(sha(read(path)), advanceToV202(path, entry.sha256), path);
  }
  assert.equal(advance('constructor', 'untouched'), 'untouched');
});

test('V201 assets and runtime are exact public admissions, verified by the historical audit relays', () => {
  const assets = Object.keys(inputs).filter(path => inputs[path].kind === 'asset');
  assert.ok(assets.length > 0);
  assert.equal(new Set(assets.map(path => inputs[path].sha256)).size, assets.length);
  for (const path of assets) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true, path);
  }
  const newRuntime = Object.keys(inputs).find(path => inputs[path].kind === 'runtime');
  assert.ok(newRuntime);
  for (const audit of [verify, verifyPrior, verifyEarlier]) {
    assert.equal(audit().historicalResultsTransferred, false);
    for (const path of [assets[0], newRuntime]) {
      const changed = candidate => candidate === path ? Buffer.from('unreviewed V201 input') : read(candidate);
      assert.throws(() => audit(changed), error => error.message.includes(path), path);
    }
  }
  const historical = Object.freeze({ untouched: 'history' });
  const effective = runtimeRelay(historical);
  assert.deepEqual(historical, { untouched: 'history' });
  assert.ok(Object.isFrozen(effective));
  assert.deepEqual(runtimeRelay(effective), effective);
  for (const [path, entry] of Object.entries(successors)) {
    if (entry.kind !== 'runtime') continue;
    assert.equal(effective[path], advanceToV202(path, entry.currentSha256), path);
    assert.throws(() => runtimeSources({ [path]: '0'.repeat(64) }), /Incorrect V201 runtime view predecessor/, path);
  }
  assert.equal(effective[newRuntime], advanceToV202(newRuntime, inputs[newRuntime].sha256));
  assert.throws(() => runtimeSources({ [newRuntime]: '0'.repeat(64) }), /Incorrect new V201 runtime digest/);
});

test('the V201 audit relays to V202 and release evidence stays at exact source-only paths', () => {
  assert.match(read(prior).toString(), /from '\.\/audit-xeno-priorities-v201\.mjs'/);
  assert.match(read(relay).toString(), /from '\.\/audit-xeno-priorities-v202\.mjs'/);
  assert.doesNotMatch(read(terminal).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  for (const path of [relay, terminal, verifier, report]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of [relay, terminal, report])
    assert.ok(!Object.hasOwn(inputs, path) && !Object.hasOwn(successors, path), path);
  for (const path of ['assets/openai/sprites/xeno-trials-v201/unreviewed-sheet.png', 'scripts/audit-xeno-priorities-unreviewed-v201.mjs'])
    assert.equal(isPublicDistributionPathV86(path), false, path);
  assert.equal(collectReleaseTestsV143(JSON.parse(read('package.json')).scripts).filter(path => path === verifier).length, 1);
});
