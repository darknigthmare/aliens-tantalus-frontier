import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';

test('V89 keeps exercise interruption and title context available offline', async () => {
  const worker = await readFile('sw.js', 'utf8');
  assert.match(worker, /atf-v86-trials-roster-v101-shell-1/);
  const filter = createBuildAssetFilter(process.cwd());
  for (const name of ['opening-exercise-v89', 'hub-opening-exercise-v89', 'title-menu-context-v89']) {
    await access('src/' + name + '.js');
    assert.ok(worker.includes("'/src/" + name + ".js'"), name);
    assert.equal(filter(resolve('src/' + name + '.js')), true);
  }
});

test('V89 candidate images, prompts and private implementation evidence cannot enter dist', () => {
  const filter = createBuildAssetFilter(process.cwd());
  for (const name of [
    'docs/V89_OPENING_EXERCISE_20260923.md',
    'docs/references/v89-art-candidates',
    'docs/references/v89-art-candidates/facehugger-1979-reference-candidate.png',
    'docs/references/v89-art-candidates/REFERENCES.md',
    'docs/references/V89_IMPLEMENTATION_STATUS.md',
    'docs/references/v89-menu/IMPLEMENTATION.md',
    'docs/references/V89_OPENING_EXERCISE.md'
  ]) assert.equal(filter(resolve(name)), false, name);
  assert.equal(filter(resolve('docs/references/V64_ENEMY_SOURCES.json')), true, 'keep the existing public provenance contract');
});
