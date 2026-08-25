import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import {
  V59_EXPECTED_ATLASES,
  V59_EXPECTED_CELLS,
  V59_NEW_ATLAS_COUNT,
  V59_NEW_SHEET_IDS,
  V59_SHEET_DEFINITIONS,
  V59_SPRITE_MANIFEST_PATH,
  buildSpriteManifestV59,
  manifestCellCount,
  validateV59SpriteAssets
} from '../scripts/sync-sprite-manifest-v59.mjs';

test('V59 ajoute exactement quatre plaques véhicule et porte le manifeste à 182 atlas / 2564 cellules', async () => {
  const source = JSON.parse(await readFile(V59_SPRITE_MANIFEST_PATH, 'utf8'));
  const manifest = buildSpriteManifestV59(source);
  assert.equal(manifest.release, 'v59');
  assert.equal(V59_NEW_ATLAS_COUNT, 4);
  assert.equal(V59_EXPECTED_ATLASES, 182);
  assert.equal(V59_EXPECTED_CELLS, 2564);
  assert.equal(manifest.sheets.length, V59_EXPECTED_ATLASES);
  assert.equal(manifestCellCount(manifest), V59_EXPECTED_CELLS);
  assert.equal(new Set(manifest.sheets.map((sheet) => sheet.id)).size, V59_EXPECTED_ATLASES);
  assert.deepEqual(new Set(V59_NEW_SHEET_IDS), new Set(V59_SHEET_DEFINITIONS.map((sheet) => sheet.id)));

  for (const definition of V59_SHEET_DEFINITIONS) {
    const sheet = manifest.sheets.find((entry) => entry.id === definition.id);
    assert.ok(sheet, definition.id);
    assert.equal(sheet.wave, 'v59');
    assert.equal(sheet.family, 'vehicle');
    assert.equal(sheet.grid, 'v50-4x4');
    assert.equal(sheet.clips, 'vehicle-access-damage-v59');
    assert.equal(sheet.sourceFacing, 'right');
    assert.equal(sheet.identityVerified, true);
    assert.equal(sheet.files.normalizedStatus, 'ready');
    assert.equal(SPRITE_SHEETS[sheet.id]?.path, sheet.files.normalized);
    assert.ok(sheet.runtime.consumers.includes('src/game-v52-runtime.js'));
  }

  assert.deepEqual(buildSpriteManifestV59(manifest), manifest);
  const assets = await validateV59SpriteAssets();
  assert.equal(assets.checked, 8);
  assert.equal(assets.missing.length, 0);
});
