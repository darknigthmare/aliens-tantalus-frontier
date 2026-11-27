import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { XENO_PRODUCTION_ASSETS_BASELINE_V206 as baseline, XENO_PRODUCTION_ASSETS_HISTORICAL_DECLARATIONS_V206 as declarations,
  XENO_PRODUCTION_ASSETS_SUCCESSORS_V206 as successors, XENO_PRODUCTION_ASSETS_NEW_INPUTS_V206 as inputs,
  reviewedXenoProductionAssetsDigestV206 as advance, verifyXenoProductionAssetsV206 as verify } from './audit-xeno-production-assets-v206.mjs';
import { verifyXenoVisualAssetsV205 as verifyPrior, xenoVisualAssetsRuntimeSourcesV205 as runtimeSources } from './audit-xeno-visual-assets-v205.mjs';
import { XENO_STANDALONE_PARENTS_V207, reviewedXenoStandaloneDigestV207 } from './audit-xeno-standalone-v207.mjs';
import { publicXenoProductionPathAdmissionV206, verifyXenoProductionAdmissionsV206 } from './public-xeno-production-admissions-v206.mjs';
import { isPublicDistributionPathV86, isPublicDistributionTextV86 } from './verify-public-release-v86.mjs';
import { createBuildAssetFilter } from './build-asset-filter.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const expectedIds = [
  "arachnoid-heavy-impact",
  "arachnoid-heavy-recovery",
  "arachnoid-heavy-windup",
  "arachnoid-special-active-grounded",
  "gorilla-heavy-windup-four-spines",
  "gorilla-special-recovery",
  "gorilla-special-windup",
  "grid-heavy-recovery",
  "grid-special-recovery",
  "grid-special-windup",
  "panther-light-recovery",
  "panther-light-windup",
  "panther-special-active",
  "panther-special-recovery",
  "panther-special-windup"
];
const excludedIds = [
  "grid-heavy-windup",
  "grid-light-windup",
  "grid-light-impact",
  "grid-light-recovery",
  "grid-special-active",
  "panther-light-impact",
  "gorilla-light-windup",
  "gorilla-light-impact",
  "gorilla-light-recovery",
  "gorilla-special-active",
  "gorilla-heavy-impact-four-spines",
  "gorilla-heavy-recovery-four-spines"
];

test('V206 extends the published V205 commit while preserving its complete historical declarations', () => {
  assert.equal(baseline, '50a974f16a07bd54e2fcb5cd243be8a55abe32fb');
  assert.deepEqual(Object.keys(declarations), ['scripts/audit-xeno-visual-assets-v205.mjs']);
  for (const [path, receipt] of Object.entries(declarations)) {
    const extract = source => { const start = source.indexOf(receipt.start), end = source.indexOf(receipt.end, start + receipt.start.length);
      assert.ok(start >= 0 && end > start); return source.slice(start, end); };
    const published = extract(git(['show', baseline + ':' + path]).toString());
    assert.equal(extract(read(path).toString()), published); assert.equal(sha(published), receipt.sha256);
  }
  const publishedPaths = new Set(git(['ls-tree', '-r', '--name-only', baseline]).toString().trim().split('\n'));
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(publishedPaths.has(path), path); assert.equal(sha(git(['show', baseline + ':' + path])), receipt.previousSha256, path);
    assert.equal(advance(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => advance(path, receipt.currentSha256), /Incorrect V205 endpoint for V206/, path);
  }
  for (const [path, receipt] of Object.entries(inputs)) {
    assert.equal(publishedPaths.has(path), false, path);
    assert.equal(sha(git(['show', XENO_STANDALONE_PARENTS_V207.trials + ':' + path])), receipt.sha256, path);
    assert.equal(sha(read(path)), reviewedXenoStandaloneDigestV207(path, receipt.sha256), path);
  }
  assert.equal(advance('constructor', 'untouched'), 'untouched');
});

test('exact V206 poses and documentation are retained in sources and rejected by the real build filter', async () => {
  const files = Object.entries(inputs).filter(([, receipt]) => receipt.kind === 'production-asset').map(([path]) => path);
  assert.deepEqual([...files].sort(), expectedIds.map(id => `assets/openai/xeno-trials-v206/characters/${id}.png`).sort());
  assert.deepEqual(await verifyXenoProductionAdmissionsV206(root), { productionImages: 15, runtimeImages: 0, sourceOnly: true });
  const filter = createBuildAssetFilter(root);
  const sourceOnly = [...files, 'scripts/audit-xeno-production-assets-v206.mjs', 'scripts/public-xeno-production-admissions-v206.mjs',
    'scripts/verify-xeno-production-assets-v206.mjs', 'docs/forge/xeno-trials/ASSET_LOT_V206.json', 'docs/forge/xeno-trials/V206-ASSETS.md'];
  for (const path of sourceOnly) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    if (!path.endsWith('.png')) assert.equal(isPublicDistributionTextV86(read(path).toString()), true, path);
  }
  // The builder applies this filter to src/assets; it never copies tooling.
  for (const path of files)
    assert.equal(filter(fileURLToPath(new URL('../' + path, import.meta.url))), false, path);
  for (const path of ['assets/openai/xeno-trials-v206', 'assets/openai/xeno-trials-v206/characters']) {
    assert.equal(publicXenoProductionPathAdmissionV206(path, { directory: true }), true);
    assert.equal(publicXenoProductionPathAdmissionV206(path, { directory: true, built: true }), false);
    assert.equal(filter(fileURLToPath(new URL('../' + path, import.meta.url))), false);
  }
  assert.equal(publicXenoProductionPathAdmissionV206('assets/openai/xeno-trials-v206/characters/unreviewed.png'), false);
  for (const id of excludedIds) {
    const path = `assets/openai/xeno-trials-v206/characters/${id}.png`;
    assert.equal(isPublicDistributionPathV86(path), false, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    assert.equal(filter(fileURLToPath(new URL('../' + path, import.meta.url))), false, path);
  }
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/UNREVIEWED_V206.md'), false);
});

test('corrupt production bytes fail through the V205 relay without granting a runtime admission or transferring results', () => {
  assert.equal(verify().runtimeChanges, 0); assert.equal(verify().historicalResultsTransferred, false);
  assert.equal(verifyPrior().historicalResultsTransferred, false);
  for (const path of [Object.keys(inputs).find(path => inputs[path].kind === 'production-asset'), 'scripts/verify-public-release-v86.mjs']) {
    const changed = candidate => candidate === path ? Buffer.from('unreviewed V206 content') : read(candidate);
    for (const check of [verify, verifyPrior]) assert.throws(() => check(changed), error => error.message.includes(path));
  }
  assert.ok([...Object.entries(inputs), ...Object.entries(successors)].every(([path, receipt]) =>
    !path.startsWith('src/') && path !== 'sw.js' && !['runtime', 'asset'].includes(receipt.kind)));
  const runtime = runtimeSources(Object.freeze({ unchanged: 'history' }));
  assert.deepEqual(runtimeSources(runtime), runtime);
  assert.equal(Object.keys(runtime).some(path => path.includes('v206')), false);
  const audit = 'scripts/audit-xeno-production-assets-v206.mjs';
  assert.match(read(audit).toString(), /from '\.\/audit-xeno-standalone-v207\.mjs'/);
  assert.doesNotMatch(read('scripts/audit-xeno-gameplay-v213.mjs').toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  assert.match(read('scripts/audit-xeno-visual-assets-v205.mjs').toString(), /from '\.\/audit-xeno-production-assets-v206\.mjs'/);
  assert.equal(Object.hasOwn(inputs, audit), false); assert.equal(Object.hasOwn(successors, audit), false);
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  assert.equal(tests.filter(path => path === 'scripts/verify-xeno-production-assets-v206.mjs').length, 1);
});
