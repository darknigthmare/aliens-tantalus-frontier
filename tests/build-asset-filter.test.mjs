import assert from 'node:assert/strict';
import { access, cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import test from 'node:test';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';

test('la copie ne traverse pas les intermédiaires V64/V65 et conserve les atlas runtime', async (t) => {
  const fixture = await mkdtemp(join(tmpdir(), 'tantalus-build-filter-'));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  const sourceRoot = join(fixture, 'source');
  const outputRoot = join(fixture, 'output');
  const excludedFiles = [
    'assets/openai/sprites/raw/qa.png',
    'assets/openai/sprites/normalized/equipment/superseded.png',
    'assets/openai/sprites/normalized/facehugger-motion-v65/preview.webp',
    'assets/openai/sprites/frames/v64/enemy/idle.png',
    'assets/openai/sprites/reference-masters/v64/master.png',
    'assets/openai/sprites/previews/v64/preview.png',
    'assets/openai/sprites/metadata/v64/manifest.json',
    'assets/openai/sprites/frames/v65/enemy/idle.png',
    'assets/openai/sprites/reference-masters/v65/master.png',
    'assets/openai/sprites/previews/v65/preview.png',
    'assets/openai/sprites/metadata/v65/manifest.json'
  ];
  const runtimeFiles = [
    'src/app.js',
    'docs/references/V65_ENEMY_PROFILE_ASSETS.json',
    'assets/openai/sprites/manifest.json',
    'assets/openai/sprites/normalized/enemies/newborn.png',
    'assets/openai/sprites/normalized/enemy-profiles-v65/enemy-002-facehugger.webp',
    'assets/openai/sprites/normalized/equipment-v56/equipment.png',
    'assets/openai/sprites/frames/v63/frame.png',
    'assets/openai/sprites/previews/v650/preview.png'
  ];
  for (const file of [...excludedFiles, ...runtimeFiles]) {
    const source = join(sourceRoot, file);
    await mkdir(dirname(source), { recursive: true });
    await writeFile(source, `fixture:${file}`);
  }
  const filter = createBuildAssetFilter(sourceRoot);
  assert.equal(filter(join(sourceRoot, 'assets/openai/v65-enemy-profile-normalization-report.json')), false, 'Le rapport de candidats non acceptés reste en production locale');
  assert.equal(filter(join(sourceRoot, 'assets/openai/sprites/normalized/enemy-profiles-v65/enemy-053-albino-ovomorph.webp')), false, 'Un atlas non accepté ne doit pas être publié');
  const visited = new Set();
  await cp(sourceRoot, outputRoot, {
    recursive: true,
    filter(source) {
      visited.add(relative(sourceRoot, source).replaceAll('\\', '/'));
      return filter(source);
    }
  });
  for (const file of excludedFiles) {
    assert.equal(visited.has(file), false, `${file}: le dossier parent doit être écarté avant lecture`);
    await assert.rejects(access(join(outputRoot, file)), { code: 'ENOENT' });
    await access(join(sourceRoot, file));
  }
  for (const file of runtimeFiles) {
    assert.equal(await readFile(join(outputRoot, file), 'utf8'), `fixture:${file}`);
  }
});
