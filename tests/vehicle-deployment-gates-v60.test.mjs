import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CAMPAIGNS, CREW, ENEMIES, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import {
  createDefaultSave,
  migrateSave,
  resolveOperationDeployment,
  selectStrategicVehicle
} from '../src/save.js';
import {
  getVehicleDeploymentGateV60,
  isVehicleDeploymentReadyV60,
  resolveReadyVehicleIdV60
} from '../src/vehicle-deployment-gates-v60.js';

const BLOCKED_BASE_IDS = Object.freeze([
  'vehicle-003-m570-armored-personnel-carrier',
  'vehicle-006-m292-combat-buggy',
  'vehicle-011-ad-19cd-dropship'
]);

const blockedBases = () => BLOCKED_BASE_IDS.map((id) => VEHICLES.find((vehicle) => vehicle.id === id));

class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
  set src(value) { this.currentSrc = value; }
}

function withBrowserRuntime(run) {
  const previous = { Image: globalThis.Image, addEventListener: globalThis.addEventListener, requestAnimationFrame: globalThis.requestAnimationFrame };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return run(); } finally { Object.assign(globalThis, previous); }
}

function buildEngine(vehicle, events = []) {
  const world = WORLDS[0];
  const campaign = CAMPAIGNS.find((entry) => entry.worldId === world.id) || CAMPAIGNS[0];
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical' });
  const engine = new GameEngine(
    { width: 1280, height: 720, getContext: () => ({}), addEventListener() {} },
    { onEvent: (event) => events.push(event) }
  );
  engine.start({
    seed: missionLevel.levelSeed.seed, campaign, world, levelSeed: missionLevel.levelSeed, missionLevel,
    vehicle, weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 48), crew: CREW.slice(0, 4)
  });
  return engine;
}

test('V60 bloque les trois châssis canon et leurs fits sans supprimer leurs IDs catalogue', () => {
  const families = blockedBases();
  assert.equal(families.every(Boolean), true);
  for (const vehicle of families) {
    const gate = getVehicleDeploymentGateV60(vehicle);
    assert.equal(gate.ready, false, vehicle.id);
    assert.equal(gate.status, 'BLOCKED_EXACT_SPRITE_REQUIRED', vehicle.id);
    assert.match(gate.reason, /plaque canonique exacte/i);
  }
  const blockedFits = VEHICLES.filter((vehicle) => String(vehicle.visualStatus).startsWith('BLOCKED_'));
  assert.equal(blockedFits.length, 24);
  assert.equal(blockedFits.every((vehicle) => !isVehicleDeploymentReadyV60(vehicle)), true);
});

test('la sélection stratégique refuse un bloqué tout en conservant son acquisition', () => {
  const save = createDefaultSave(1);
  const blocked = blockedBases()[0];
  save.strategy.inventory.vehicleIds.push(blocked.id);
  const before = save.strategy.selectedVehicleId;
  assert.throws(() => selectStrategicVehicle(save, blocked.id), /plaque canonique exacte/i);
  assert.equal(save.strategy.selectedVehicleId, before);
  assert.equal(save.strategy.inventory.vehicleIds.includes(blocked.id), true);
});

test('la migration préserve les IDs acquis et remplace sélection et manifeste bloqués par le dernier châssis prêt', () => {
  const save = createDefaultSave(1);
  const ready = VEHICLES.find((vehicle) => vehicle.id === 'vehicle-004-m22a3-jackson-tank');
  const blocked = blockedBases()[1];
  save.strategy.inventory.vehicleIds.push(ready.id, blocked.id);
  save.strategy.selectedVehicleId = blocked.id;
  save.strategy.currentOperation = {
    id: 'legacy-blocked-operation', campaignId: CAMPAIGNS[0].id, worldId: WORLDS[0].id, vehicleId: blocked.id,
    crewIds: save.strategy.selectedCrewIds, weaponIds: save.player.weaponIds, equipmentIds: [], flags: {}
  };
  const migrated = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  assert.equal(migrated.strategy.inventory.vehicleIds.includes(blocked.id), true);
  assert.equal(migrated.strategy.selectedVehicleId, ready.id);
  assert.equal(migrated.strategy.currentOperation.vehicleId, ready.id);
});

test('le résolveur de manifeste neutralise aussi un ancien save non migré', () => {
  const save = createDefaultSave(1);
  const ready = VEHICLES.find((vehicle) => vehicle.id === 'vehicle-004-m22a3-jackson-tank');
  const blocked = blockedBases()[2];
  save.strategy.inventory.vehicleIds.push(ready.id, blocked.id);
  save.strategy.currentOperation = {
    id: 'raw-blocked-operation', campaignId: CAMPAIGNS[0].id, worldId: WORLDS[0].id, vehicleId: blocked.id,
    crewIds: save.strategy.selectedCrewIds, weaponIds: save.player.weaponIds, equipmentIds: []
  };
  const deployment = resolveOperationDeployment(save, { vehicleCatalog: VEHICLES });
  assert.equal(deployment.vehicleId, ready.id);
  assert.equal(deployment.vehicle.id, ready.id);
  assert.equal(deployment.missing.vehicleId, blocked.id);
  assert.equal(resolveReadyVehicleIdV60(blocked.id, save.strategy.inventory.vehicleIds, VEHICLES), ready.id);
});

test('le runtime conserve l’identité demandée mais ne crée aucun véhicule actif ou pilotable', () => withBrowserRuntime(() => {
  for (const blocked of blockedBases()) {
    const events = [];
    const engine = buildEngine(blocked, events);
    assert.equal(engine.selectedVehicleRuntime.id, blocked.id);
    assert.equal(engine.selectedVehicleRuntime.deploymentReady, false);
    assert.equal(engine.selectedVehicleRuntime.canDrive, false);
    assert.equal(engine.selectedVehicleRuntime.canBoost, false);
    assert.equal(engine.selectedVehicleRuntime.canFire, false);
    assert.equal(engine.vehicle.active, false);
    assert.equal(engine.toggleVehicle(engine.player), false);
    assert.equal(engine.getSnapshot().selectedVehicle.deploymentStatus, 'BLOCKED_EXACT_SPRITE_REQUIRED');
    assert.ok(events.some((event) => event.type === 'vehicle-mode-blocked' && event.vehicleId === blocked.id));
    assert.equal(events.some((event) => event.type === 'vehicle-mode-ready' && event.vehicleId === blocked.id), false);
  }
}));

test('l’UI annonce honnêtement le blocage et ne propose aucun bouton d’affectation', async () => {
  const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(source, /PLAQUE EXACTE REQUISE/);
  assert.match(source, /CANON BLOQUÉ/);
  assert.match(source, /data-deployment-status/);
});
