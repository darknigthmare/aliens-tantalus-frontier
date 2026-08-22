import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const inventory = JSON.parse(await readFile(resolve(repoRoot, 'docs/ASSET_RUNTIME_INVENTORY_V54.json'), 'utf8'));

test('l’inventaire v54 conserve tous les totaux du catalogue et des niveaux physiques', () => {
  assert.deepEqual(inventory.summary, {
    playerSubjects: 1,
    playerSheets: 2,
    npcs: 16,
    enemyArchetypes: 52,
    enemyModifiers: 11,
    enemyProfiles: 568,
    vehicleChassis: 36,
    vehicleFits: 8,
    vehicleProfiles: 279,
    hubRooms: 16,
    hubProps: 16,
    hubFarLayers: 4,
    missionProps: 16,
    missionTemplates: 3,
    missionGlobalLayers: 9
  });
});

test('les variantes ennemies et véhicules s’additionnent sans profil fantôme', () => {
  assert.equal(Object.values(inventory.enemies.modifierProfileCounts).reduce((sum, count) => sum + count, 0), 568);
  assert.equal(inventory.enemies.modifierProfileCounts['Neuro-Linked'], 48);
  assert.equal(inventory.enemies.exactProfileCount + inventory.enemies.familyReuseProfileCount + inventory.enemies.missingDedicatedProfileCount, 568);
  assert.equal(inventory.enemies.archetypes.reduce((sum, entry) => sum + entry.profileCount, 0), 568);
  assert.equal(inventory.vehicles.chassis.reduce((sum, entry) => sum + entry.profileCount, 0), 279);
  assert.equal(inventory.vehicles.exactProfileCount + inventory.vehicles.missingDedicatedProfileCount, 279);
});

test('aucun trou connu n’est masqué par un faux statut terminé', () => {
  const combat = inventory.player.sheets.find((sheet) => sheet.id === 'player.echo9-marine.combat');
  assert.equal(combat.identityVerified, true);
  assert.equal(combat.runtimeState, 'loaded-exact');
  assert.equal(inventory.enemies.exactProfileCount, 110);
  assert.equal(inventory.enemies.missingDedicatedProfileCount, 242);
  assert.equal(inventory.npcs.unknownIdFallback, null);
  assert.ok(inventory.enemies.archetypes.every((entry) => entry.identityStatus === 'exact' || entry.fallbackReason));
  assert.equal(inventory.vehicles.chassis.filter((entry) => entry.dedicatedBitmapState === 'loaded-exact').length, 1);
  assert.ok(inventory.hub.rooms.every((room) => room.collisionSource === 'room-profile'));
  assert.ok(inventory.mission.props.every((prop) => prop.loadState === 'loaded'));
  assert.equal(inventory.mission.props.some((prop) => prop.runtimeKey === 'barricade'), false);
});
