import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import { DEPTH_LAB_ASSETS_V97 } from '../src/depth-lab-model-v97.js';
import { PRODUCTION_CACHE_V86 } from '../scripts/verify-production-v86.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = file => readFileSync(join(root, file), 'utf8');
test('V97 opt-in depth laboratory is shipped and cached separately from the campaign', () => {
  const filter = createBuildAssetFilter(root), build = source('scripts/build.mjs'), sw = source('sw.js');
  for (const path of ['depth-lab-v97.html', 'depth-lab-v97.css']) assert.ok(build.includes(`'${path}'`));
  for (const path of ['depth-lab-v97.html', 'depth-lab-v97.css', 'src/depth-lab-v97.js', 'src/depth-lab-model-v97.js',
    'src/enemy-dedicated-poses-v97.js', 'src/enemy-dedicated-batch-v97.js',
    'src/xeno-trials-presentation-v97.js', 'src/xeno-trials-selection-v97.js']) {
    assert.ok(sw.includes(`'/${path}'`), path); assert.equal(filter(join(root, path)), true);
  }
  for (const path of DEPTH_LAB_ASSETS_V97) assert.equal(filter(join(root, path)), true, path);
  assert.ok(sw.includes(PRODUCTION_CACHE_V86));
  assert.match(source('src/xeno-trials-ui-v96.js'), /href="\/depth-lab-v97\.html" target="_blank" rel="noopener"/);
  assert.doesNotMatch(source('src/app.js'), /from ['"].*depth-lab/);
});
test('V97 private jobs, receipts, QA previews and held sprites never enter a build', () => {
  const filter = createBuildAssetFilter(root);
  for (const path of ['docs/references/v97-batch-050', 'docs/references/v97-batch-050/ADMISSION.json',
    'docs/references/v97-batch-050/browser-assets-v97.mjs',
    'assets/openai/sprites/static-enemy-v97/enemy-060-albino-queen.png',
    'assets/openai/sprites/static-enemy-v97/enemy-112-armored-queen.png',
    'assets/openai/sprites/static-enemy-v97/candidate.png']) assert.equal(filter(join(root, path)), false, path);
});
