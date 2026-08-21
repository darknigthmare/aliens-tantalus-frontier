import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import {
  APEX_DOSSIERS, CAMPAIGNS, COSTUMES, CREW, ENEMIES, EQUIPMENT,
  LEVEL_SEEDS, NEURO_XENO_PROFILES, VEHICLES, WEAPONS, WORLDS
} from '../src/content.js';
import {
  beginOperation, createDefaultSave, migrateSave, recordOperationResumeState,
  resolveOperationDeployment
} from '../src/save.js';

class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
  set src(value) { this.currentSrc = value; }
}

function withBrowserMocks(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return run(); } finally { Object.assign(globalThis, previous); }
}

function engine() {
  return new GameEngine(
    { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} },
    { onEvent: () => {} }
  );
}

const catalogs = {
  crewCatalog: CREW,
  weaponCatalog: WEAPONS,
  equipmentCatalog: EQUIPMENT,
  vehicleCatalog: VEHICLES,
  costumeCatalog: COSTUMES,
  neuroProfileCatalog: NEURO_XENO_PROFILES,
  apexDossierCatalog: APEX_DOSSIERS
};

test('le snapshot natif complet survit à recordOperationResumeState, JSON et migrateSave', () => withBrowserMocks(() => {
  const save = createDefaultSave(1);
  Object.assign(save.galaxy.resources, { fuel: 999, credits: 99999, medical: 999 });
  save.hub.systems.supplies = 100;
  const campaign = CAMPAIGNS.find((entry) => save.galaxy.unlockedWorldIds.includes(entry.worldId));
  const world = WORLDS.find((entry) => entry.id === campaign.worldId);
  const levelSeed = LEVEL_SEEDS[CAMPAIGNS.indexOf(campaign) % LEVEL_SEEDS.length];
  beginOperation(save, campaign, world);

  const deployment = resolveOperationDeployment(save, catalogs);
  const options = {
    seed: levelSeed.seed,
    world: { ...world, ...save.galaxy.worldState[world.id] },
    campaign,
    levelSeed,
    enemyCatalog: ENEMIES,
    weapon: deployment.weapon,
    equipment: deployment.equipment,
    crew: deployment.crew,
    vehicle: deployment.vehicle,
    costume: deployment.costume,
    neuroProfile: deployment.neuroProfile,
    apexDossier: deployment.apexDossier,
    difficulty: deployment.difficulty
  };

  const first = engine();
  first.start(options);
  first.setCheckpoint('power', 1880, 714);
  first.powerNode.active = true;
  first.supplies[0].used = true;
  const defeated = first.enemies.find((entry) => entry.alive && !entry.isBoss);
  first.defeatEnemy(defeated, first.player);
  first.drops.find((drop) => drop.id === `salvage-${defeated.id}`).taken = true;
  const nativeState = first.captureResumeState();

  assert.equal(recordOperationResumeState(save, nativeState), true);
  const migrated = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  const persisted = migrated.strategy.currentOperation.resumeState;
  assert.equal(persisted.schema, 1);
  assert.deepEqual(persisted.identity, nativeState.identity);
  assert.ok(persisted.enemies.some((entry) => entry.id === defeated.id && !entry.alive));
  assert.ok(persisted.drops.some((entry) => entry.id === `salvage-${defeated.id}` && entry.taken));

  const resumedDeployment = resolveOperationDeployment(migrated, catalogs);
  const resumed = engine();
  resumed.start({ ...options, resumeState: resumedDeployment.resumeState });
  assert.equal(resumed.lastResumeResult.applied, true);
  assert.equal(resumed.checkpoint.id, 'power');
  assert.equal(resumed.powerNode.active, true);
  assert.equal(resumed.supplies[0].used, true);
  assert.equal(resumed.enemies.find((entry) => entry.id === defeated.id).alive, false);
  assert.equal(resumed.drops.find((entry) => entry.id === `salvage-${defeated.id}`).taken, true);
}));
