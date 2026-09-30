import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';

const modules = [
  'enemy-user-campaign-v88', 'enemy-user-campaign-runtime-v88', 'enemy-discovery-v88',
  'player-opening-v88', 'hub-opening-v88', 'title-scene-angle-assets-v88', 'title-scene-motion-v88'
];

test('V88 precaches the complete new gameplay, opening and title dependency set', async () => {
  const worker = await readFile('sw.js', 'utf8');
  assert.match(worker, /atf-v86-xeno-trials-v99-shell-1/);
  for (const name of modules) {
    await access(`src/${name}.js`);
    assert.ok(worker.includes(`'/src/${name}.js'`), name);
  }
});

test('V88 opening freight reuses the accessible styled dialogue choices', async () => {
  const app = await readFile('src/app.js', 'utf8');
  const css = await readFile('hub-stations-v61.css', 'utf8');
  assert.match(app, /button\.className = 'hub-dialogue-choice'; button\.dataset\.openingFreightV88/);
  assert.match(css, /\.hub-dialogue-choice:focus-visible/);
});

test('V88 build excludes rejected images, reference prompts and private browser proofs', () => {
  const root = process.cwd();
  const filter = createBuildAssetFilter(root);
  for (const name of [
    'docs/V88_OPENING_PROGRESS_20260923.md',
    'docs/references/v88-art-candidates',
    'docs/references/v88-art-candidates/sulaco-front-description-rejected.png',
    'docs/references/v88-art-candidates/sulaco-rear-description-rejected.png',
    'docs/references/v88-art-candidates/REFERENCES.md',
    'docs/references/v88-title-menu/IMPLEMENTATION.md',
    'docs/references/V88_ENEMY_REFERENCE_REVIEW.json',
    'docs/references/v87-release-qa/report.json'
  ]) assert.equal(filter(resolve(root, name)), false, name);
  for (const name of modules) assert.equal(filter(resolve(root, `src/${name}.js`)), true);
});
