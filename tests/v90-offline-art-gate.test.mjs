import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import { TITLE_SHIP_ANGLE_ASSETS_V88 } from '../src/title-scene-angle-assets-v88.js';
import { PORT_ASSETS_V90 } from '../src/hub-port-meridien-v90.js';

test('V90 physical port modules ship with the renewed offline shell', async () => {
  const worker = await readFile('sw.js', 'utf8');
  assert.match(worker, /atf-v86-reference-library-v100-shell-1/);
  const filter = createBuildAssetFilter(process.cwd());
  for (const name of ['port-meridien-v90', 'hub-port-meridien-v90']) {
    await access('src/' + name + '.js');
    assert.ok(worker.includes("'/src/" + name + ".js'"), name);
    assert.equal(filter(resolve('src/' + name + '.js')), true);
  }
});

test('V90 unapproved art, full prompts and private QA remain outside production', () => {
  const filter = createBuildAssetFilter(process.cwd());
  for (const name of [
    'docs/V90_PORT_MERIDIEN_20260923.md',
    'docs/V90_CATALOG_BEHAVIORS_20260923.md',
    'docs/V90_NATIVE_CAMPAIGN_BEHAVIORS_20260923.md',
    'docs/references/v90-art-batch',
    'docs/references/v90-art-batch/GENERATIONS.json',
    'docs/references/v90-art-batch/index.html',
    'docs/references/v90-art-batch/film-queen-1986-base.png',
    'docs/references/V90_SOURCE_BACKED_GAPS_20260923.md',
    'docs/references/V90_IMPLEMENTATION_STATUS.md'
  ]) assert.equal(filter(resolve(name)), false, name);
  assert.equal(filter(resolve('docs/references/V64_ENEMY_SOURCES.json')), true);
});

test('V90 accepted angles and ten quay bitmaps have offline entries', async () => {
  const worker = await readFile('sw.js', 'utf8');
  const filter = createBuildAssetFilter(process.cwd());
  for (const path of [...TITLE_SHIP_ANGLE_ASSETS_V88.map(a => a.src), ...Object.values(PORT_ASSETS_V90)]) {
    assert.ok(worker.includes("'" + path + "'"), path);
    assert.equal(filter(resolve(path.slice(1))), true, path);
    await access(path.slice(1));
  }
});
