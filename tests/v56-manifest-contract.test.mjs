import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { NPC_MISSION_IDENTITIES_V55, NPC_MISSION_IDENTITIES_V56 } from '../src/npc-mission-runtime-v55.js';
import {
  EQUIPMENT_VISUAL_DEDICATED_ATLAS_COUNT_V56,
  EQUIPMENT_VISUAL_PROFILES_V56
} from '../src/equipment-visual-runtime-v56.js';
import { WEAPON_VISUAL_PROFILES_V56 } from '../src/weapon-visual-runtime-v56.js';
import {
  V56_EXPECTED_ATLASES,
  V56_EXPECTED_CELLS,
  V56_NEW_ATLAS_COUNT,
  V56_NEW_SHEET_IDS,
  V56_SPRITE_MANIFEST_PATH,
  V56_SHEET_FAMILY_COUNTS,
  V56_SHEET_DEFINITIONS,
  buildSpriteManifestV56,
  manifestCellCount,
  validateV56SpriteAssets
} from '../scripts/sync-sprite-manifest-v56.mjs';

test('v56 enregistre uniquement les 127 atlas physiques prêts et leurs 2500 cellules', async () => {
  const source = JSON.parse(await readFile(V56_SPRITE_MANIFEST_PATH, 'utf8'));
  const manifest = buildSpriteManifestV56(source);

  assert.equal(manifest.release, 'v56');
  assert.equal(V56_NEW_ATLAS_COUNT, 127);
  assert.equal(V56_EXPECTED_ATLASES, 178);
  assert.equal(V56_EXPECTED_CELLS, 2500);
  assert.equal(manifest.sheets.length, V56_EXPECTED_ATLASES);
  assert.equal(manifestCellCount(manifest), V56_EXPECTED_CELLS);
  assert.equal(V56_NEW_SHEET_IDS.length, V56_NEW_ATLAS_COUNT);
  assert.deepEqual(V56_SHEET_FAMILY_COUNTS, {
    enemy: 34,
    equipment: 29,
    npc: 8,
    player: 3,
    vehicle: 28,
    weapon: 25
  });
  assert.equal(EQUIPMENT_VISUAL_PROFILES_V56.length, 30);
  assert.equal(EQUIPMENT_VISUAL_DEDICATED_ATLAS_COUNT_V56, 29);
  assert.equal(WEAPON_VISUAL_PROFILES_V56.length, 26);
  assert.equal(Object.keys(NPC_MISSION_IDENTITIES_V55).length, 8);
  assert.equal(Object.keys(NPC_MISSION_IDENTITIES_V56).length, 16);
  assert.equal(new Set(manifest.sheets.map((sheet) => sheet.id)).size, V56_EXPECTED_ATLASES);

  for (const definition of V56_SHEET_DEFINITIONS) {
    const sheet = manifest.sheets.find((entry) => entry.id === definition.id);
    assert.ok(sheet, definition.id);
    assert.equal(sheet.wave, 'v56');
    assert.equal(sheet.family, definition.family);
    assert.equal(sheet.sourceFacing, 'right');
    assert.equal(sheet.identityVerified, true);
    assert.equal(sheet.files.normalizedStatus, 'ready');
  }

  const equipment = V56_SHEET_DEFINITIONS.filter((entry) => entry.family === 'equipment');
  assert.equal(equipment.length, 29);
  assert.ok(equipment.every((entry) => entry.grid === 'v56-equipment-2x2'));

  assert.equal(
    manifest.sheets.filter((entry) => entry.files.normalized === '/assets/openai/sprites/normalized/weapons/cutting-torch-action-sheet.png').length,
    1
  );
  assert.equal(manifest.sheets.some((entry) => entry.id === 'weapon.pathogen-containment-projector.action'), true);
  assert.equal(
    manifest.sheets.find((entry) => entry.id === 'weapon.pathogen-containment-projector.action')?.files.normalized,
    '/assets/openai/sprites/normalized/weapons/pathogen-containment-projector-action-sheet.png'
  );

  assert.deepEqual(buildSpriteManifestV56(manifest), manifest);
  const assets = await validateV56SpriteAssets();
  assert.equal(assets.checked, 254);
});
