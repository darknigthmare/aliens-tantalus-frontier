import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import {
  V63_EXPECTED_ATLASES,
  V63_EXPECTED_CELLS,
  V63_SHEET_DEFINITION,
  V63_SPRITE_MANIFEST_PATH,
  buildSpriteManifestV63,
  manifestCellCount,
  validateV63SpriteAssets
} from '../scripts/sync-sprite-manifest-v63.mjs';

test('V63 ajoute une plaque Harpoon Gun et porte le manifeste à 192 atlas / 2724 cellules', async () => {
  const source = JSON.parse(await readFile(V63_SPRITE_MANIFEST_PATH, 'utf8'));
  const manifest = buildSpriteManifestV63(source);
  assert.equal(manifest.release, 'v63');
  assert.equal(V63_EXPECTED_ATLASES, 192);
  assert.equal(V63_EXPECTED_CELLS, 2724);
  assert.equal(manifest.sheets.length, 192);
  assert.equal(manifestCellCount(manifest), 2724);
  assert.equal(SPRITE_SHEETS[V63_SHEET_DEFINITION.id].path, V63_SHEET_DEFINITION.files.normalized);
  assert.deepEqual(V63_SHEET_DEFINITION.excelIds, ['ARM-0053']);
  assert.deepEqual(await validateV63SpriteAssets(), { checked: 2, missing: [] });
  assert.deepEqual(buildSpriteManifestV63(manifest), manifest);
});
