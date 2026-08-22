import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { access, readFile } from 'node:fs/promises';
import { MISSION_LEVEL_LAYER_FILES_V52 } from '../src/game-v52-level-runtime.js';
import { MISSION_STRUCTURAL_PROP_FILES } from '../src/game-v51-runtime.js';
import { SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import { HUB_ART_ASSETS_V55 } from '../src/hub-art-runtime-v55.js';

const relativeImports = (source) => {
  const imports = [];
  for (const pattern of [
    /(?:import|export)\s+(?:[^'"]*?\sfrom\s*)?['"](\.[^'"]+)['"]/g,
    /import\(\s*['"](\.[^'"]+)['"]\s*\)/g
  ]) {
    for (const match of source.matchAll(pattern)) imports.push(match[1]);
  }
  return imports;
};

const localPath = (webPath) => path.join(process.cwd(), ...webPath.split('/').filter(Boolean));

test('le cache hors-ligne couvre toute la fermeture ESM publique sans fallback HTML pour les modules', async () => {
  const worker = await readFile('sw.js', 'utf8');
  const visited = new Set();

  async function visit(webPath) {
    if (visited.has(webPath)) return;
    visited.add(webPath);
    const source = await readFile(localPath(webPath), 'utf8');
    for (const specifier of relativeImports(source)) {
      let resolved = path.posix.normalize(path.posix.join(path.posix.dirname(webPath), specifier));
      if (!path.posix.extname(resolved)) resolved += '.js';
      if (!resolved.startsWith('/')) resolved = '/' + resolved;
      await visit(resolved);
    }
  }

  await visit('/src/app.js');
  for (const modulePath of visited) {
    assert.ok(
      worker.includes(`'${modulePath}'`) || worker.includes(`"${modulePath}"`),
      `${modulePath} manque dans CORE`
    );
  }

  for (const modulePath of [
    '/src/game-v52-runtime.js',
    '/src/game-v52-level-runtime.js',
    '/src/sprite-animation-runtime.js',
    '/src/mission-levels-v52.js',
    '/src/enemy-visual-overrides-v55.js',
    '/src/npc-mission-runtime-v55.js',
    '/src/vehicle-visual-runtime-v55.js',
    '/src/hub-art-runtime-v55.js',
  ]) {
    assert.ok(
      worker.includes(`'${modulePath}'`) || worker.includes(`"${modulePath}"`),
      `${modulePath} manque dans CORE v55`
    );
  }

  const runtimeAssets = new Set([
    ...Object.values(SPRITE_SHEETS).map((sheet) => sheet.path),
    ...Object.values(MISSION_LEVEL_LAYER_FILES_V52).flatMap((layers) => Object.values(layers)),
    ...Object.values(MISSION_STRUCTURAL_PROP_FILES),
    ...HUB_ART_ASSETS_V55,
  ]);
  assert.equal(Object.keys(SPRITE_SHEETS).length, 51);
  for (const assetPath of runtimeAssets) {
    await access(localPath(assetPath));
    assert.ok(
      worker.includes(`'${assetPath}'`) || worker.includes(`"${assetPath}"`),
      `${assetPath} manque dans CORE v55`
    );
  }

  assert.match(worker, /const CACHE = ['"]atf-v55-/);
  assert.match(worker, /event\.request\.mode === 'navigate'/);
  assert.doesNotMatch(worker, /cached\s*\|\|\s*caches\.match\(['"]\/index\.html/);
});
