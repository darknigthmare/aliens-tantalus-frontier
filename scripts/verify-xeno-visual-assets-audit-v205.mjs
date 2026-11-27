import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { XENO_VISUAL_ASSETS_BASELINE_V205 as baseline, XENO_VISUAL_ASSETS_HISTORICAL_DECLARATIONS_V205 as declarations,
  XENO_VISUAL_ASSETS_SUCCESSORS_V205 as successors, XENO_VISUAL_ASSETS_NEW_INPUTS_V205 as inputs,
  reviewedXenoVisualAssetsDigestV205 as advance, verifyXenoVisualAssetsV205 as verify,
  xenoVisualAssetsRuntimeSourcesV205 as runtimeSources } from './audit-xeno-visual-assets-v205.mjs';
import { verifyXenoPrioritiesV204 as priorVerify } from './audit-xeno-priorities-v204.mjs';
import { reviewedXenoProductionAssetsDigestV206 as advanceToV206 } from './audit-xeno-production-assets-v206.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { collectReleaseTestsV143 } from './test-release-v143.mjs';
import { verifyXenoVisualAdmissionsV205, publicXenoVisualPathAdmissionV205 } from './public-xeno-visual-admissions-v205.mjs';
import { createBuildAssetFilter } from './build-asset-filter.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = path => readFileSync(new URL('../' + path, import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = args => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });

test('V205 preserves the published V204 receipts and accepts each transition only from its exact predecessor', () => {
  assert.equal(baseline, '2e784c74a8ad0779438d5f44e8184dd6f7423ddf');
  assert.deepEqual(Object.keys(declarations), ['scripts/audit-xeno-priorities-v204.mjs']);
  for (const [path, receipt] of Object.entries(declarations)) {
    const extract = source => { const start = source.indexOf(receipt.start), end = source.indexOf(receipt.end, start + receipt.start.length);
      assert.ok(start >= 0 && end > start); return source.slice(start, end); };
    const historical = extract(git(['show', baseline + ':' + path]).toString());
    assert.equal(extract(read(path).toString()), historical); assert.equal(sha(historical), receipt.sha256);
  }
  const published = new Set(git(['ls-tree', '-r', '--name-only', baseline]).toString().trim().split('\n'));
  for (const [path, receipt] of Object.entries(successors)) {
    assert.ok(published.has(path), path); assert.equal(sha(git(['show', baseline + ':' + path])), receipt.previousSha256, path);
    assert.equal(advance(path, receipt.previousSha256), sha(read(path)), path);
    assert.throws(() => advance(path, receipt.currentSha256), /Incorrect V204 endpoint for V205/, path);
  }
  for (const [path, receipt] of Object.entries(inputs)) { assert.equal(published.has(path), false, path); assert.equal(sha(read(path)), advanceToV206(path, receipt.sha256), path); }
  assert.equal(advance('constructor', 'untouched'), 'untouched');
});

test('V205 fails closed on modified images, source modules and missing relay endpoints', async () => {
  assert.equal(verify().historicalResultsTransferred, false);
  assert.equal(priorVerify().historicalResultsTransferred, false);
  const assets = Object.keys(inputs).filter(path => inputs[path].kind === 'asset');
  const runtime = Object.keys(inputs).find(path => inputs[path].kind === 'runtime');
  assert.equal(assets.length, 16); assert.ok(runtime);
  for (const path of [assets[0], runtime]) {
    const changed = candidate => candidate === path ? Buffer.from('unreviewed V205 content') : read(candidate);
    assert.throws(() => verify(changed), error => error.message.includes(path));
    assert.throws(() => priorVerify(changed), error => error.message.includes(path));
  }
  const effective = runtimeSources(Object.freeze({ unchanged: 'history' }));
  assert.equal(effective.unchanged, 'history'); assert.deepEqual(runtimeSources(effective), effective);
  const changedRuntime = Object.keys(successors).find(path => successors[path].kind === 'runtime');
  assert.throws(() => runtimeSources({ [changedRuntime]: '0'.repeat(64) }), /Incorrect V205 runtime view predecessor/);
  assert.equal((await verifyXenoVisualAdmissionsV205(root)).runtimeImages, 16);
});

test('exact runtime images can ship while production poses, documentation, audit and tests remain source-only', () => {
  const audit = 'scripts/audit-xeno-visual-assets-v205.mjs';
  assert.match(read(audit).toString(), /from '\.\/audit-xeno-production-assets-v206\.mjs'/);
  assert.match(read('scripts/audit-xeno-production-assets-v206.mjs').toString(), /from '\.\/audit-xeno-standalone-v207\.mjs'/);
  assert.doesNotMatch(read('scripts/audit-xeno-gameplay-v209.mjs').toString(), /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  assert.match(read('scripts/audit-xeno-priorities-v204.mjs').toString(), /from '\.\/audit-xeno-visual-assets-v205\.mjs'/);
  for (const path of [audit, 'scripts/public-xeno-visual-admissions-v205.mjs',
    'scripts/verify-xeno-trials-visual-assets-v205.mjs', 'scripts/verify-xeno-visual-assets-audit-v205.mjs',
    'docs/forge/xeno-trials/ASSET_LOT_V205.json', 'docs/forge/xeno-trials/V205-ASSETS.md']) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  const filter = createBuildAssetFilter(root);
  for (const [path, receipt] of Object.entries(inputs)) if (['asset', 'production-asset'].includes(receipt.kind)) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), receipt.kind === 'asset', path);
    assert.equal(filter(fileURLToPath(new URL('../' + path, import.meta.url))), receipt.kind === 'asset', path);
  }
  assert.equal(Object.values(inputs).filter(receipt => receipt.kind === 'asset').length, 16);
  assert.equal(Object.values(inputs).filter(receipt => receipt.kind === 'production-asset').length, 10);
  assert.equal(publicXenoVisualPathAdmissionV205('assets/openai/xeno-trials-v205/characters', { directory: true, built: true }), false);
  const sw = read('sw.js').toString();
  assert.equal(sw.split("'/src/xeno-trials-visual-assets-v205.js'").length - 1, 1);
  assert.equal(sw.includes('/assets/openai/xeno-trials-v205/'), false, 'optional effect images and production poses are not precached');
  assert.equal(publicXenoVisualPathAdmissionV205('assets/openai/xeno-trials-v205/unreviewed.png'), false);
  assert.equal(isPublicDistributionPathV86('docs/forge/xeno-trials/UNREVIEWED_V205.md'), false);
  assert.equal(Object.hasOwn(inputs, audit), false); assert.equal(Object.hasOwn(successors, audit), false);
  const tests = collectReleaseTestsV143(JSON.parse(read('package.json')).scripts);
  assert.equal(tests.filter(path => path === 'scripts/verify-xeno-trials-visual-assets-v205.mjs').length, 1);
  assert.equal(tests.filter(path => path === 'scripts/verify-xeno-visual-assets-audit-v205.mjs').length, 1);
});
