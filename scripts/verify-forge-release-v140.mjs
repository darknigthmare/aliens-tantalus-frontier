import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolve } from 'node:path';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { createBuildAssetFilter } from './build-asset-filter.mjs';

test('Forge repository tooling never becomes a built public path', () => {
  for (const path of ['docs/forge/README-V130.md', 'docs/forge/QA-V130.md',
    '.github/workflows/forge-regression.yml', 'scripts/fixtures/forge-v130.html']) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of ['docs/unreviewed.md', 'docs/forge/other.md',
    '.github/workflows/other.yml', 'scripts/fixtures/other.html',
    'src/../docs/forge/README-V130.md', '/docs/forge/README-V130.md']) {
    assert.equal(isPublicDistributionPathV86(path), false, path);
  }
});

test('Forge styles are admitted exactly and authoring documentation is excluded by the asset filter', () => {
  for (const name of ['editor-v130', 'workbench-v133', 'navigator-v134', 'construction-v135', 'control-v136']) {
    assert.equal(isPublicDistributionPathV86(`src/forge-${name}.css`, { built: true }), true);
  }
  assert.equal(isPublicDistributionPathV86('src/forge-other.css', { built: true }), false);
  const filter = createBuildAssetFilter(process.cwd());
  assert.equal(filter(resolve('docs/forge')), false);
  assert.equal(filter(resolve('docs/forge/README-V130.md')), false);
  assert.equal(filter(resolve('src/forge-editor-v130.css')), true);
});

test('V141 admits the reviewed Hudson PNG without opening its folder to additional candidates', () => {
  const folder = 'assets/openai/sprites/player/v141';
  const admitted = `${folder}/hudson-torso-candidate-v141.png`;
  const filter = createBuildAssetFilter(process.cwd());
  assert.equal(isPublicDistributionPathV86(folder, { directory: true, built: true }), true);
  assert.equal(isPublicDistributionPathV86(admitted, { built: true }), true);
  assert.equal(filter(resolve(admitted)), true);
  for (const path of [`${folder}/other-torso.png`, `${folder}/hicks.png`,
    `${folder}/nested/hudson-torso-candidate-v141.png`, `${folder}/measurements.json`]) {
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    assert.equal(filter(resolve(path)), false, path);
  }
});
