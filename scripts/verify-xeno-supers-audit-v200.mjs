import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  XENO_SUPERS_BASELINE_V200 as baseline,
  XENO_SUPERS_HISTORICAL_DECLARATIONS_V200 as declarations,
  XENO_SUPERS_NEW_INPUTS_V200 as inputs,
  XENO_SUPERS_SUCCESSORS_V200 as successors,
  xenoSupersRuntimeSourcesV200 as runtimeSources,
  reviewedXenoSupersDigestV200 as advance,
  verifyXenoSupersV200 as verify
} from './audit-xeno-supers-v200.mjs';
import { reviewedXenoPrioritiesDigestV201 as advanceToV201 } from './audit-xeno-priorities-v201.mjs';
import {
  xenoPrioritiesRuntimeSourcesV199 as priorRuntimeSources,
  verifyXenoPrioritiesV199 as verifyPrior
} from './audit-xeno-priorities-v199.mjs';
import { verifyStageClassificationV195 as verifyEarlier } from './audit-xeno-stage-classification-v195.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const readBaseline = path => git(['show', baseline + ':' + path]);
const readPublished = path => git(['show', '005568f7f285ca5ec704e0e87498b2e5b68211a9:' + path]);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const prior = 'scripts/audit-xeno-priorities-v199.mjs';
const relay = 'scripts/audit-xeno-supers-v200.mjs';
const terminal = 'scripts/audit-xeno-priorities-v201.mjs';
const verifier = 'scripts/verify-xeno-supers-audit-v200.mjs';
const report = 'docs/forge/xeno-trials/V200-SUPERS.md';
const spritePrefix = 'assets/openai/sprites/xeno-trials-v200/';
const textures = [
  'import-game-afe2-exploder-super-sheet.png',
  'import-game-afe2-harbinger-super-sheet.png',
  'import-game-afe2-warden-super-sheet.png',
].map(name => spritePrefix + name);

test('V200 preserves V199 historical declarations and every successor starts at its exact Git bytes', () => {
  assert.equal(baseline, '5d3f7ef5df15e36e2d8b6aeece61c81cc4b73d0c');
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
    assert.equal(sha(readPublished(path)), receipt.currentSha256, path);
    assert.equal(advance(path, receipt.previousSha256), sha(read(path)), path);
    for (const forged of [receipt.currentSha256, '0'.repeat(64), null])
      assert.throws(() => advance(path, forged), /Incorrect V199 endpoint for V200/, path);
  }
  for (const [path, receipt] of Object.entries(inputs)) {
    assert.ok(!published.has(path), path);
    assert.ok(Object.isFrozen(receipt), path);
    assert.equal(sha(readPublished(path)), receipt.sha256, path);
    assert.equal(sha(read(path)), advanceToV201(path, receipt.sha256), path);
  }
  assert.equal(advance('constructor', 'history'), 'history');
});

test('the historical audit relay rejects changed V200 runtime and sprite atlas bytes', () => {
  const assets = Object.keys(inputs).filter(path => inputs[path].kind === 'asset').sort();
  assert.deepEqual(assets, textures);
  assert.ok(Object.values(successors).every(receipt => receipt.kind !== 'asset'));
  assert.equal(new Set(assets.map(path => inputs[path].sha256)).size, assets.length);
  for (const path of assets) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true, path);
  }
  const runtimePath = Object.keys(inputs).find(path => inputs[path].kind === 'runtime')
    ?? Object.keys(successors).find(path => successors[path].kind === 'runtime');
  assert.ok(runtimePath, 'A reviewed runtime connects the new super atlases.');
  for (const audit of [verify, verifyPrior, verifyEarlier]) {
    assert.equal(audit().historicalResultsTransferred, false);
    for (const path of [assets[0], runtimePath]) {
      const changed = candidate => candidate === path ? Buffer.from('unreviewed V200 input') : read(candidate);
      assert.throws(() => audit(changed), error => error.message.includes(path), path);
    }
  }
});

test('V200 extends the effective runtime and retains strict predecessor checks', () => {
  const historical = Object.freeze({ untouched: 'historic' });
  const effective = priorRuntimeSources(historical);
  assert.deepEqual(historical, { untouched: 'historic' });
  assert.ok(Object.isFrozen(effective));
  assert.deepEqual(priorRuntimeSources(effective), effective);
  for (const [path, receipt] of Object.entries(successors)) {
    if (receipt.kind !== 'runtime') continue;
    assert.equal(effective[path], advanceToV201(path, receipt.currentSha256), path);
    assert.throws(() => runtimeSources({ [path]: '0'.repeat(64) }), /Incorrect V200 runtime view predecessor/);
  }
  for (const [path, receipt] of Object.entries(inputs)) {
    if (receipt.kind !== 'runtime') continue;
    assert.equal(effective[path], advanceToV201(path, receipt.sha256), path);
    assert.throws(() => runtimeSources({ [path]: '0'.repeat(64) }), /Incorrect new V200 runtime digest/);
  }
});

test('the V200 audit relays to V201 and its tooling and mutable report stay source-only', () => {
  assert.match(read(prior).toString(), /from '\.\/audit-xeno-supers-v200\.mjs'/);
  assert.match(read(relay).toString(), /from '\.\/audit-xeno-priorities-v201\.mjs'/);
  assert.doesNotMatch(read(terminal).toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  for (const path of [relay, terminal, verifier, report]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of [relay, terminal, report])
    assert.ok(!Object.hasOwn(inputs, path) && !Object.hasOwn(successors, path), path);
  for (const path of [spritePrefix + 'unreviewed-super-sheet.png', 'scripts/audit-xeno-supers-unreviewed-v200.mjs'])
    assert.equal(isPublicDistributionPathV86(path), false, path);
  assert.equal(collectReleaseTestsV143(JSON.parse(read('package.json')).scripts)
    .filter(path => path === verifier).length, 1);
});
