import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GameEngine,
  buildMissionPlan,
  buildWeaponRuntime,
  buildEnemyRuntime,
  buildVehicleRuntime,
  buildEquipmentRuntime,
  buildCrewRuntime,
  buildNeuroRuntime
} from '../src/game-runtime.js';
import {
  CAMPAIGNS,
  WORLDS,
  WEAPONS,
  EQUIPMENT,
  ENEMIES,
  VEHICLES,
  CREW,
  APEX_DOSSIERS,
  NEURO_XENO_PROFILES,
  LEVEL_SEEDS
} from '../src/content.js';

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
  try { return run(); } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
}

function createEngine(events = []) {
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  return new GameEngine(canvas, { onEvent: (event) => events.push(event) });
}

const baseOptions = {
  campaign: CAMPAIGNS.find((campaign) => campaign.mode === 'FRONTIER'),
  world: WORLDS[4],
  levelSeed: LEVEL_SEEDS[8],
  weapon: WEAPONS[0],
  enemyCatalog: ENEMIES.slice(0, 52),
  vehicle: VEHICLES[0],
  equipment: EQUIPMENT.slice(0, 12),
  crew: CREW.slice(0, 4),
  apexDossier: APEX_DOSSIERS[0],
  difficulty: 'standard'
};

test('every catalog entry compiles into an executable runtime contract', () => {
  for (const weapon of WEAPONS) {
    const runtime = buildWeaponRuntime(weapon);
    assert.equal(runtime.id, weapon.id);
    assert.equal(runtime.damage, weapon.damage);
    assert.equal(runtime.fireRate, weapon.fireRate);
    assert.equal(runtime.magazine, weapon.magazine);
    assert.equal(runtime.reload, weapon.reload);
    assert.equal(runtime.penetration, weapon.penetration);
    assert.deepEqual(runtime.tags, weapon.tags);
  }
  for (const enemy of ENEMIES) {
    const runtime = buildEnemyRuntime(enemy, 'standard');
    assert.equal(runtime.id, enemy.id);
    assert.equal(runtime.sourceBehavior, enemy.behavior);
    assert.equal(runtime.acid, enemy.acid);
    assert.equal(runtime.frequency, enemy.frequency);
    assert.deepEqual(runtime.habitats, enemy.habitats);
    assert.deepEqual(runtime.encounterWorldIds, enemy.encounterWorldIds);
  }
  for (const vehicle of VEHICLES) {
    const runtime = buildVehicleRuntime(vehicle);
    assert.equal(runtime.id, vehicle.id);
    assert.equal(runtime.hull, vehicle.hull);
    assert.equal(runtime.speed, vehicle.speed);
    assert.equal(runtime.cargo, vehicle.cargo);
    assert.equal(runtime.seats.length, vehicle.seats.length);
    assert.deepEqual(runtime.actions, vehicle.actions);
  }
  assert.equal(buildEquipmentRuntime(EQUIPMENT).length, 106);
  assert.equal(buildCrewRuntime(CREW).length, 16);
  for (const profile of NEURO_XENO_PROFILES) {
    const runtime = buildNeuroRuntime(profile);
    assert.equal(runtime.id, profile.id);
    assert.equal(runtime.controlDifficulty, profile.controlDifficulty);
    assert.equal(runtime.signalRange, profile.signalRange);
    assert.equal(runtime.failureMode, profile.failureMode);
    assert.equal(runtime.active, profile.playerClassCompatible);
  }
  for (let index = 0; index < LEVEL_SEEDS.length; index += 1) {
    const levelSeed = LEVEL_SEEDS[index];
    const campaign = CAMPAIGNS[index % CAMPAIGNS.length];
    const world = WORLDS.find((entry) => entry.id === levelSeed.worldId) || WORLDS[0];
    const plan = buildMissionPlan({ campaign, world, levelSeed, difficulty: 'standard', vehicle: VEHICLES[index % VEHICLES.length] });
    assert.equal(plan.level.id, levelSeed.id);
    assert.equal(plan.level.seed, levelSeed.seed);
    assert.equal(plan.level.objective, levelSeed.objective);
    assert.deepEqual(plan.level.hazards, levelSeed.hazards);
    assert.equal(plan.level.routes, levelSeed.routes);
    assert.equal(plan.campaign.id, campaign.id);
    assert.equal(plan.world.id, world.id);
  }
  assert.equal(CAMPAIGNS.length, 437);
  assert.equal(WEAPONS.length, 146);
  assert.equal(ENEMIES.length, 571);
  assert.equal(VEHICLES.length, 279);
  assert.equal(LEVEL_SEEDS.length, 800);
});

test('combat, resources, cover, tracker, gates, boss, archive and extraction change state', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine(events);
  engine.start(baseOptions);
  const initial = engine.getSnapshot();
  assert.equal(initial.missionState, 'active');
  assert.equal(initial.missionContract.campaignId, baseOptions.campaign.id);
  assert.equal(initial.weaponRuntime.id, baseOptions.weapon.id);
  assert.equal(initial.selectedVehicle.id, baseOptions.vehicle.id);
  assert.equal(initial.catalogRuntime.equipment, baseOptions.equipment.length);
  assert.equal(initial.catalogRuntime.crew, baseOptions.crew.length);
  assert.equal(initial.catalogRuntime.apex, baseOptions.apexDossier.id);

  Object.assign(engine.player, { x: engine.weaponPickup.x, y: engine.weaponPickup.y, grounded: true });
  assert.equal(engine.interact(engine.player), true);
  assert.equal(engine.player.weaponMode, 'rifle');
  assert.equal(engine.player.magazineSize, baseOptions.weapon.magazine);
  const liveEnemies = engine.enemies.filter((enemy) => enemy.alive);
  for (const enemy of liveEnemies) enemy.alive = false;
  const ammoBefore = engine.player.ammo;
  assert.equal(engine.fire(engine.player), true);
  assert.equal(engine.player.ammo, ammoBefore - 1);
  for (const enemy of liveEnemies) enemy.alive = true;
  engine.player.fireClock = 0;
  engine.player.ammo = 0;
  assert.equal(engine.reload(engine.player), true);
  engine.finishReload(engine.player);
  assert.ok(engine.player.ammo > 0);

  const trackerEnergy = engine.tracker.energy;
  assert.equal(engine.activateTracker(engine.player), true);
  assert.ok(engine.tracker.energy < trackerEnergy);
  assert.ok(engine.tracker.contacts.length >= 0);

  Object.assign(engine.player, { x: engine.covers[0].x - 18, y: engine.covers[0].y + engine.covers[0].h - engine.player.h, crouching: true, grounded: true, inCover: true });
  const coveredHealth = engine.player.health;
  engine.damagePlayer(engine.player, 20, { source: 'projectile' });
  const coveredLoss = coveredHealth - engine.player.health;
  engine.player.inCover = false;
  const exposedHealth = engine.player.health;
  engine.damagePlayer(engine.player, 20, { source: 'projectile' });
  assert.ok(exposedHealth - engine.player.health > coveredLoss);
  assert.ok(engine.player.damageBlocked > 0);

  Object.assign(engine.player, { x: engine.powerNode.x, y: engine.powerNode.y, health: 100 });
  assert.equal(engine.interact(engine.player), true);
  assert.equal(engine.mission.objectives.power, true);
  const keyCarrier = engine.enemies.find((enemy) => enemy.keyCarrier);
  engine.applyEnemyDamage(keyCarrier, 9999, { owner: engine.player, kind: 'test' });
  const key = engine.drops.find((drop) => drop.type === 'security-key');
  Object.assign(engine.player, { x: key.x, y: key.y });
  assert.equal(engine.interact(engine.player), true);
  assert.equal(engine.inventory.securityKeys, 1);
  assert.equal(engine.mission.objectives.route, true);
  const boss = engine.enemies.find((enemy) => enemy.isBoss);
  engine.applyEnemyDamage(boss, 99999, { owner: engine.player, kind: 'test' });
  assert.equal(engine.mission.objectives.boss, true);
  Object.assign(engine.player, { x: engine.archiveTerminal.x, y: engine.archiveTerminal.y });
  assert.equal(engine.interact(engine.player), true);
  assert.equal(engine.inventory.intel, 3);
  Object.assign(engine.player, { x: engine.objective.x, y: engine.objective.y });
  assert.equal(engine.interact(engine.player), true);
  assert.equal(engine.mission.state, 'complete');
  assert.ok(engine.mission.rewards.credits > 480);
  assert.ok(events.some((event) => event.type === 'mission-complete' && event.rewards));
}));

test('local coop can revive, death retries at a checkpoint and vehicle has hull, fuel, turret and speed consequences', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine(events);
  engine.setCoop(true);
  engine.start(baseOptions);
  Object.assign(engine.coop, { x: engine.player.x + 20, y: engine.player.y });
  engine.damagePlayer(engine.coop, 999, { source: 'queen' });
  assert.equal(engine.coop.downed, true);
  assert.equal(engine.mission.state, 'active');
  assert.equal(engine.interact(engine.player), true);
  assert.equal(engine.coop.alive, true);
  assert.equal(engine.coop.health, 38);

  Object.assign(engine.player, { x: engine.vehicle.x, y: engine.vehicle.y });
  assert.equal(engine.toggleVehicle(engine.player), true);
  const xBefore = engine.vehicle.x;
  const fuelBefore = engine.vehicle.fuel;
  engine.keys.add('KeyD');
  engine.updateVehicleDriver(engine.player, 0.25, { left: 'KeyA', right: 'KeyD', fire: 'KeyF' });
  engine.keys.delete('KeyD');
  assert.ok(engine.vehicle.x > xBefore);
  assert.ok(engine.vehicle.fuel < fuelBefore);
  const turretBefore = engine.vehicle.turretAmmo;
  engine.player.fireClock = 0;
  assert.equal(engine.fire(engine.player), true);
  assert.equal(engine.vehicle.turretAmmo, turretBefore - 1);
  const hullBefore = engine.vehicle.hull;
  engine.damageVehicle(20, 'spitter');
  assert.equal(engine.vehicle.hull, hullBefore - 20);

  engine.ejectVehicleOccupants();
  engine.damagePlayer(engine.player, 9999, { source: 'queen' });
  engine.damagePlayer(engine.coop, 9999, { source: 'queen' });
  assert.equal(engine.mission.state, 'failed');
  const salvageBefore = engine.inventory.salvage;
  assert.equal(engine.restartFromCheckpoint(), true);
  assert.equal(engine.mission.state, 'active');
  assert.equal(engine.player.alive, true);
  assert.ok(engine.inventory.salvage <= salvageBefore);
  assert.ok(events.some((event) => event.type === 'mission-restarted'));
}));

test('difficulty changes spawn and threat tuning', () => withBrowserMocks(() => {
  const story = createEngine();
  story.start({ ...baseOptions, difficulty: 'story', enemyCatalog: [ENEMIES[4]] });
  const nightmare = createEngine();
  nightmare.start({ ...baseOptions, difficulty: 'nightmare', enemyCatalog: [ENEMIES[4]] });
  assert.equal(story.enemies.length, 12);
  assert.equal(nightmare.enemies.length, 24);
  assert.ok(nightmare.enemies[0].maxHealth > story.enemies[0].maxHealth);
  assert.ok(nightmare.enemies[0].damage > story.enemies[0].damage);
  assert.ok(nightmare.enemies[0].speed > story.enemies[0].speed);
}));

test('compatible Neuro-Xeno profile creates a signal-limited melee class with an effective failure and relink', () => withBrowserMocks(() => {
  const events = [];
  const profile = NEURO_XENO_PROFILES.find((entry) => entry.playerClassCompatible && entry.failureMode === 'signal-loss') || NEURO_XENO_PROFILES.find((entry) => entry.playerClassCompatible);
  const engine = createEngine(events);
  engine.start({ ...baseOptions, neuroProfile: profile, enemyCatalog: [ENEMIES[4]] });
  assert.equal(engine.player.playerClass, 'neuro-xeno');
  assert.equal(engine.getSnapshot().neuro.profileId, profile.id);
  const target = engine.enemies.find((enemy) => !enemy.isBoss);
  Object.assign(engine.player, { x: target.x - 70, y: target.y, facing: 1 });
  const healthBefore = target.health;
  const signalBefore = engine.neuro.signal;
  assert.equal(engine.fire(engine.player), true);
  assert.ok(target.health < healthBefore);
  assert.ok(engine.neuro.signal < signalBefore);
  engine.neuro.signal = 0;
  engine.updateNeuroControl(0.01);
  assert.equal(engine.mission.state, 'failed');
  assert.equal(engine.neuro.state, 'failed');
  assert.ok(events.some((event) => event.type === 'neuro-failure' && event.failureMode === profile.failureMode));
  assert.equal(engine.restartFromCheckpoint(), true);
  assert.equal(engine.neuro.state, 'linked');
  assert.equal(engine.neuro.signal, 45);
}));

test('all Frontier Forge tile types materially alter the mission world', () => withBrowserMocks(() => {
  const tileTypes = ['floor', 'platform', 'wall', 'door', 'vent', 'ladder', 'lift', 'spawn', 'objective', 'enemy', 'vehicle', 'terminal', 'hazard'];
  const tiles = tileTypes.map((type, index) => ({ position: `${2 + index * 2}:${type === 'floor' ? 15 : type === 'spawn' ? 14 : 10}`, type }));
  tiles.push({ position: '29:10', type: 'terminal' });
  const editorProject = { schema: 1, kind: 'mission', size: [32, 18], tiles };
  const engine = createEngine();
  engine.start({ ...baseOptions, editorProject, enemyCatalog: [ENEMIES[4]] });
  const snapshot = engine.getSnapshot();
  assert.equal(snapshot.editorMode, true);
  assert.equal(snapshot.editorTileCount, tiles.length);
  for (const type of tileTypes) assert.ok(snapshot.editorTileCounts[type] >= 1, type);
  assert.equal(snapshot.wallCount, 1);
  assert.equal(snapshot.doorCount, 1);
  assert.equal(snapshot.ladderCount, 1);
  assert.equal(snapshot.liftCount, 1);
  assert.equal(snapshot.hazardCount, 1);
  assert.equal(snapshot.enemiesAlive, 1);
  assert.equal(snapshot.vehicle.active, true);
  assert.equal(snapshot.missionPhase, 'restore-power');
  assert.equal(engine.objective.id, 'editor-objective');
  assert.ok(engine.player.x > 0);
}));
