import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import { READY_ENEMY_PROFILE_REGISTRY_V66 } from '../src/enemy-profile-registry-v66.js';
import {
  V55_EXPECTED_ATLASES,
  V55_EXPECTED_CELLS,
  V55_NEW_SHEET_IDS,
  V55_SHEET_FAMILY_COUNTS,
  buildSpriteManifestV55,
  manifestCellCount,
  validateV55SpriteAssets
} from '../scripts/sync-sprite-manifest-v55.mjs';
import {
  assertRuntimeWiredV55,
  buildAssetRuntimeInventoryV55,
  inspectRuntimeWiringV55,
  renderAssetRuntimeInventoryMarkdownV55
} from '../scripts/build-asset-runtime-inventory-v55.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(repoRoot, 'assets/openai/sprites/manifest.json');

const loadBuiltManifest = async () => buildSpriteManifestV55(JSON.parse(await readFile(manifestPath, 'utf8')));

const simulatedRuntimeFromManifest = (manifest) => Object.fromEntries(manifest.sheets.map((sheet) => [sheet.id, {
  id: sheet.id,
  path: sheet.files.normalized,
  family: sheet.family,
  sourceFacing: sheet.sourceFacing === 'left' ? -1 : 1,
  identityVerified: sheet.identityVerified,
  clipSet: sheet.clips,
  pivot: sheet.pivot,
  hitbox: sheet.hitbox
}]));

test('sync v55 builds an idempotent 51-atlas / 816-cell manifest without writing it', async () => {
  const manifest = await loadBuiltManifest();
  assert.equal(manifest.release, 'v55');
  assert.equal(manifest.sheets.length, V55_EXPECTED_ATLASES);
  assert.equal(manifestCellCount(manifest), V55_EXPECTED_CELLS);
  assert.equal(V55_NEW_SHEET_IDS.length, 20);
  assert.deepEqual(V55_SHEET_FAMILY_COUNTS, { enemy: 8, npc: 8, vehicle: 4 });
  assert.equal(new Set(manifest.sheets.map((sheet) => sheet.id)).size, V55_EXPECTED_ATLASES);

  const v55Sheets = manifest.sheets.filter((sheet) => V55_NEW_SHEET_IDS.includes(sheet.id));
  assert.equal(v55Sheets.length, 20);
  for (const sheet of v55Sheets) {
    assert.equal(sheet.wave, 'v55');
    assert.equal(sheet.sourceFacing, 'right');
    assert.equal(sheet.identityVerified, true);
    assert.equal(sheet.files.normalizedStatus, 'ready');
    assert.match(sheet.files.normalized, /^\/assets\/openai\/sprites\/normalized\//);
    assert.ok(manifest.clipSets[sheet.clips], `${sheet.id}: clip set absent`);
    assert.ok(manifest.contracts.hitboxes[sheet.hitbox], `${sheet.id}: hitbox absent`);
    assert.ok(manifest.contracts.pivots[sheet.pivot], `${sheet.id}: pivot absent`);
    await access(resolve(repoRoot, sheet.files.normalized.replace(/^\/+/, '')));
  }

  assert.deepEqual(buildSpriteManifestV55(manifest), manifest);
  const assets = await validateV55SpriteAssets(repoRoot);
  assert.equal(assets.checked, 40);
});

test('inventory v55 preserves its release batch and reports the current shared visual coverage', async () => {
  const manifest = await loadBuiltManifest();
  const simulatedRuntime = simulatedRuntimeFromManifest(manifest);
  const wiring = assertRuntimeWiredV55(simulatedRuntime);
  assert.equal(wiring.ready, true);
  assert.equal(wiring.wiredSheetCount, 20);

  const inventory = buildAssetRuntimeInventoryV55({ manifest, runtimeSheets: simulatedRuntime });
  assert.equal(inventory.summary.spriteAtlases, 51);
  assert.equal(inventory.summary.spriteCells, 816);
  assert.equal(inventory.summary.v55NewAtlases, 20);
  assert.equal(inventory.summary.npcMissionSheets, 8);
  assert.equal(inventory.enemies.v55DedicatedArchetypeCount, 8);
  assert.equal(inventory.enemies.v55ResolvedProfileCount, 88);
  assert.equal(inventory.enemies.v55ExactProfileCount, 8);
  assert.equal(inventory.enemies.v55FamilyReuseProfileCount, 80);
  assert.equal(inventory.enemies.coverage.total, 571);
  assert.equal(inventory.enemies.coverage.modern, 539);
  assert.equal(inventory.enemies.coverage.legacy, 32);
  // Keep the V55 batch/snapshot fixed. The shared resolver relabels accepted
  // standard V66 replacements as source-locked adaptations, never pixel exact.
  const v66Replacements = READY_ENEMY_PROFILE_REGISTRY_V66.length;
  assert.ok(READY_ENEMY_PROFILE_REGISTRY_V66.every((profile) => profile.modifier === 'Standard'
    && profile.asset.identityStatus === 'source-locked-adaptation'));
  const expectedIdentityCounts = {
    exact: 29 - v66Replacements,
    'source-locked-adaptation': 1 + v66Replacements,
    'project-adaptation': 18,
    'project-original': 7,
    'authored-family': 516
  };
  assert.deepEqual(inventory.enemies.coverage.byIdentityStatus, expectedIdentityCounts);
  assert.equal(inventory.enemies.exactProfileCount, expectedIdentityCounts.exact);
  assert.equal(inventory.enemies.familyReuseProfileCount, 516);
  assert.equal(inventory.enemies.missingDedicatedProfileCount, 0);
  assert.equal(inventory.vehicles.v55DedicatedChassisCount, 4);
  assert.equal(inventory.vehicles.v55ResolvedProfileCount, 32);
  assert.equal(inventory.vehicles.v55ExactProfileCount, 4);
  assert.equal(inventory.vehicles.v55FamilyReuseProfileCount, 28);
  assert.equal(inventory.vehicles.exactProfileCount, 5);
  assert.equal(inventory.vehicles.familyReuseProfileCount, 28);
  assert.equal(inventory.vehicles.missingDedicatedProfileCount, 246);
  assert.equal(inventory.vehicles.withoutExactBitmapProfileCount, 274);

  const hangar = inventory.hub.dropshipHangar;
  assert.equal(hangar.composition, 'modular');
  assert.equal(hangar.allowsMonolith, false);
  assert.equal(hangar.layers.length, 2);
  assert.equal(new Set(hangar.layers.map((layer) => layer.asset)).size, 2);
  assert.deepEqual(hangar.layers.map((layer) => layer.phase), ['back', 'front']);
  assert.match(hangar.physicalDropship.asset, /ud-4l-cheyenne-dropship-action-sheet\.png$/);
  assert.match(hangar.electricalHazard.asset, /electrical-arc-hazard\.png$/);
  assert.equal(inventory.summary.missionProps, 17);
  assert.equal(inventory.summary.missionElectricalHazards, 1);

  const markdown = renderAssetRuntimeInventoryMarkdownV55(inventory);
  assert.match(markdown, /51 atlas \/ 816 cellules/);
  assert.match(markdown, /20 atlas v55/);
  assert.match(markdown, /Hangar modulaire et hazard électrique/);
});

test('final inventory gate follows the actual shared runtime registry', () => {
  const wiring = inspectRuntimeWiringV55(SPRITE_SHEETS);
  if (wiring.ready) {
    assert.doesNotThrow(() => assertRuntimeWiredV55(SPRITE_SHEETS));
    assert.equal(wiring.wiredSheetCount, 20);
  } else {
    assert.ok(wiring.missingSheetIds.length > 0 || wiring.invalidSheetIds.length > 0);
    assert.throws(() => assertRuntimeWiredV55(SPRITE_SHEETS), /inventory output is blocked/);
  }
});
