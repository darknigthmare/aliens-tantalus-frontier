import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolve } from 'node:path';
import { PUBLIC_CAPTURE_ASSETS_V163, verifyPublicAdmissionsV163, publicReleasePathAdmissionV163 } from './public-release-admissions-v163.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { createBuildAssetFilter } from './build-asset-filter.mjs';
import { XENO_TRIALS_CAPTURE_ATLASES_V163 } from '../src/xeno-trials-capture-data-v163.js';

test('three original atlases bind exact source bytes to runtime, source admission and actual builder inclusion', async () => {
  assert.deepEqual(await verifyPublicAdmissionsV163(process.cwd()), { originalAtlases: 3, canonicalApproval: false });
  const filter = createBuildAssetFilter(process.cwd());
  assert.equal(PUBLIC_CAPTURE_ASSETS_V163.length, 3);
  for (const asset of PUBLIC_CAPTURE_ASSETS_V163) {
    const model = XENO_TRIALS_CAPTURE_ATLASES_V163.find(atlas => atlas.path === '/' + asset.path);
    assert.ok(model); assert.equal(model.sourceSha256, asset.sha256); assert.equal(model.bytes, asset.bytes);
    assert.equal(isPublicDistributionPathV86(asset.path), true);
    assert.equal(isPublicDistributionPathV86(asset.path, { built: true }), true);
    assert.equal(filter(resolve(asset.path)), true);
  }
});

test('the production exceptions cannot publish QA captures, sibling candidates or directory traversal', () => {
  const filter = createBuildAssetFilter(process.cwd());
  for (const path of ['assets/openai/sprites/trials-v163/qa-capture.png',
    'assets/openai/sprites/trials-v163/new-capture-v163.png',
    'assets/openai/sprites/trials-v163/candidate.png',
    'assets/openai/sprites/trials-v163/cultist-capture-v163.png/report.png']) {
    assert.equal(publicReleasePathAdmissionV163(path), false);
    assert.equal(isPublicDistributionPathV86(path), false);
    assert.equal(filter(resolve(path)), false);
  }
  // fs.cp passes resolved filesystem paths. Raw traversal is rejected by
  // distribution admission before it can name a member of the exception.
  const traversal = 'assets/openai/sprites/trials-v163/../cultist-capture-v163.png';
  assert.equal(publicReleasePathAdmissionV163(traversal), false);
  assert.equal(isPublicDistributionPathV86(traversal), false);
});
