import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import {
  V61_EXPECTED_ATLASES,
  V61_EXPECTED_CELLS,
  V61_NEW_ATLAS_COUNT,
  V61_NEW_SHEET_IDS,
  V61_SHEET_DEFINITIONS,
  V61_SPRITE_MANIFEST_PATH,
  buildSpriteManifestV61,
  manifestCellCount,
  validateV61SpriteAssets
} from '../scripts/sync-sprite-manifest-v61.mjs';

test('V61 ajoute exactement neuf armes Excel et porte le manifeste à 191 atlas / 2708 cellules', async () => {
  const source = JSON.parse(await readFile(V61_SPRITE_MANIFEST_PATH, 'utf8'));
  const manifest = buildSpriteManifestV61(source);
  assert.equal(manifest.release, 'v61');
  assert.equal(V61_NEW_ATLAS_COUNT, 9);
  assert.equal(V61_EXPECTED_ATLASES, 191);
  assert.equal(V61_EXPECTED_CELLS, 2708);
  assert.equal(manifest.sheets.length, V61_EXPECTED_ATLASES);
  assert.equal(manifestCellCount(manifest), V61_EXPECTED_CELLS);
  assert.deepEqual(V61_NEW_SHEET_IDS, [
    'weapon.ak-4047-pulse-rifle.action',
    'weapon.f44aa-pulse-rifle.action',
    'weapon.m39-submachine-gun.action',
    'weapon.m42a-scope-rifle.action',
    'weapon.m5-rpg.action',
    'weapon.m6b-rocket-launcher.action',
    'weapon.m83-sadar.action',
    'weapon.m94-impact-grenade.action',
    'weapon.type-88-heavy-assault-rifle.action'
  ]);
  assert.deepEqual(buildSpriteManifestV61(manifest), manifest);

  for (const definition of V61_SHEET_DEFINITIONS) {
    const sheet = manifest.sheets.find((entry) => entry.id === definition.id);
    assert.equal(sheet.wave, 'v61');
    assert.equal(sheet.family, 'weapon');
    assert.equal(sheet.grid, 'v50-4x4');
    assert.equal(sheet.clips, 'weapon-action-v56');
    assert.equal(sheet.sourceFacing, 'right');
    assert.equal(sheet.identityVerified, true);
    assert.equal(SPRITE_SHEETS[sheet.id].path, sheet.files.normalized);
  }

  const assets = await validateV61SpriteAssets();
  assert.equal(assets.checked, 18);
  assert.deepEqual(assets.missing, []);
});
