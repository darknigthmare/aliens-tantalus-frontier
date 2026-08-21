import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APEX_DOSSIERS, CAMPAIGNS, COSTUMES, EQUIPMENT, NEURO_XENO_PROFILES,
  SHIP_MODULES, VEHICLES, WEAPONS, WORLDS
} from '../src/content.js';
import {
  applyCostume, beginOperation, completeResearchProject, createDefaultSave,
  equipCatalogItem, executeStrategicAction, migrateSave, procureCatalogItem,
  recordOperationFlag, resolveOperation, selectStrategicVehicle
} from '../src/save.js';
import {
  ensureAdvancedState, installShipModule, performDiplomacy,
  selectApexDossier, selectNeuroProfile
} from '../src/advanced-systems.js';
import { applyCampaignConsequence } from '../src/campaign-consequences.js';
import { createHubCrisis, resolveHubCrisisEvent, simulateGalaxy } from '../src/world-crisis.js';

test('la boucle v1-v51 complète produit des conséquences jouables et survit à la sauvegarde', () => {
  const save = createDefaultSave(1);
  ensureAdvancedState(save);
  Object.assign(save.galaxy.resources, { credits: 999999, alloy: 9999, fuel: 9999, medical: 9999, research: 9999, pathogen: 9999 });
  Object.assign(save.hub.systems, { power: 100, supplies: 100, research: 100 });

  const clockBefore = structuredClone(save.clock);
  const command = executeStrategicAction(save, 'frontier-recon');
  assert.equal(command.ok, true);
  assert.notDeepEqual(save.clock, clockBefore);

  const research = completeResearchProject(save, 'vehicle-doctrine');
  assert.equal(research.ok, true);
  const module = SHIP_MODULES.find((entry) => !save.hub.moduleIds.includes(entry.id));
  const installed = installShipModule(save, module.id);
  assert.equal(installed.ok, true);
  assert.ok(save.hub.moduleIds.includes(module.id));

  const weapon = WEAPONS.find((entry) => !save.strategy.inventory.weaponIds.includes(entry.id));
  const equipment = EQUIPMENT.find((entry) => !save.strategy.inventory.equipmentIds.includes(entry.id));
  const vehicle = VEHICLES.find((entry) => !save.strategy.inventory.vehicleIds.includes(entry.id));
  procureCatalogItem(save, 'weapon', weapon);
  procureCatalogItem(save, 'equipment', equipment);
  procureCatalogItem(save, 'vehicle', vehicle);
  equipCatalogItem(save, 'weapon', weapon.id);
  equipCatalogItem(save, 'equipment', equipment.id);
  selectStrategicVehicle(save, vehicle.id);
  applyCostume(save, COSTUMES[7].id);
  assert.equal(save.player.weaponIds.at(-1), weapon.id);
  assert.equal(save.player.equipmentIds.at(-1), equipment.id);
  assert.equal(save.strategy.selectedVehicleId, vehicle.id);

  const neuro = NEURO_XENO_PROFILES.find((entry) => entry.playerClassCompatible);
  selectNeuroProfile(save, neuro.id);
  selectApexDossier(save, APEX_DOSSIERS[3].id);
  assert.equal(save.strategy.selectedNeuroProfileId, neuro.id);
  assert.equal(save.strategy.selectedApexDossierId, APEX_DOSSIERS[3].id);

  const mire = CAMPAIGNS.find((entry) => entry.mode === 'MIRE' && entry.pairId);
  const world = WORLDS.find((entry) => entry.id === mire.worldId);
  if (!save.galaxy.unlockedWorldIds.includes(world.id)) save.galaxy.unlockedWorldIds.push(world.id);
  const diplomacyBefore = save.galaxy.worldState[world.id].stability;
  performDiplomacy(save, world, 'aid');
  assert.ok(save.galaxy.worldState[world.id].stability > diplomacyBefore);

  const deployment = beginOperation(save, mire, world);
  assert.equal(deployment.ok, true);
  recordOperationFlag(save, 'power-restored');
  recordOperationFlag(save, 'shortcut');
  const outcome = resolveOperation(save, { success: true, kills: 11 });
  assert.equal(outcome.ok, true);
  assert.equal(save.strategy.currentOperation, null);
  assert.ok(save.galaxy.completedCampaignIds.includes(mire.id));
  const consequence = applyCampaignConsequence(save, mire, world, outcome);
  assert.equal(consequence.consequence.mode, 'MIRE');
  assert.equal(save.galaxy.alerts[0].type, 'campaign-consequence');

  const simulated = simulateGalaxy(save, { hours: 6, advanceClock: false, generateCrisis: false });
  assert.ok(simulated.worldChanges.length > 0);
  Object.assign(save, simulated.save);
  const crisis = createHubCrisis(save, { force: true, kind: 'pathogen' });
  assert.equal(crisis.kind, 'pathogen');
  const crisisResult = resolveHubCrisisEvent(save, { action: 'crisis:resolved', crisisId: crisis.id, kind: crisis.kind });
  assert.equal(crisisResult.handled, true);
  assert.equal(save.hub.activeCrisis.resolved, true);

  const persisted = migrateSave(JSON.parse(JSON.stringify(save)), save.profile);
  ensureAdvancedState(persisted);
  assert.equal(persisted.schema, 51);
  assert.equal(persisted.player.costumeId, COSTUMES[7].id);
  assert.ok(persisted.hub.moduleIds.includes(module.id));
  assert.equal(persisted.strategy.selectedVehicleId, vehicle.id);
  assert.equal(persisted.strategy.selectedNeuroProfileId, neuro.id);
  assert.equal(persisted.strategy.selectedApexDossierId, APEX_DOSSIERS[3].id);
  assert.ok(persisted.galaxy.completedCampaignIds.includes(mire.id));
  assert.ok(persisted.galaxy.alerts.some((entry) => entry.type === 'campaign-consequence'));
});
