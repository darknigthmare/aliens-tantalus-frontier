import test from 'node:test';
import assert from 'node:assert/strict';

import { GameEngine } from '../src/game-production-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import {
  ALIEN_SURVIVAL_CAMPAIGN_ID_V70,
  ALIEN_SURVIVAL_DOOR_DEFINITIONS_V70,
  ALIEN_SURVIVAL_EXTERIOR_ROOM_ID_V70,
  ALIEN_SURVIVAL_OPERATION_ID_V70,
  ALIEN_SURVIVAL_ROOM_IDS_V70,
  ALIEN_SURVIVAL_SCHEMA_V70
} from '../src/alien-survival-systems-v70.js';
import { ALIEN_SURVIVAL_SYSTEMS_SHEET_V70 } from '../src/alien-survival-visuals-v70.js';
import { ALIEN_SURVIVAL_INSERTION_SAFE_RADIUS_V70 } from '../src/alien-survival-runtime-v70.js';
import {
  CAMPAIGNS,
  CREW,
  ENEMIES,
  EQUIPMENT,
  LEVEL_SEEDS,
  VEHICLES,
  WEAPONS,
  WORLDS
} from '../src/content.js';

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 512;
  }

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
  try {
    return run();
  } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
}

function startProductionMission(campaign, variant) {
  const world = WORLDS.find((entry) => entry.id === campaign.worldId);
  assert.ok(world, `${campaign.id}: monde réel introuvable`);
  const missionLevel = buildMissionLevelV52({
    campaign,
    world,
    levelSeeds: LEVEL_SEEDS,
    templateId: campaign.templateId || 'colony-multiroute',
    variant
  });
  const canvas = {
    width: 1280,
    height: 720,
    getContext: () => ({}),
    addEventListener: () => {}
  };
  const engine = new GameEngine(canvas, { onEvent: () => {} });
  const snapshot = engine.start({
    seed: missionLevel.levelSeed.seed,
    campaign: missionLevel.campaign,
    world: missionLevel.world,
    levelSeed: missionLevel.levelSeed,
    missionLevel,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    vehicle: VEHICLES.find((entry) => entry.family === 'ground') || VEHICLES[0],
    equipment: EQUIPMENT,
    crew: CREW,
    difficulty: 'standard',
    strategicBriefing: { id: `production-v70-${variant}` }
  });
  return { engine, missionLevel, snapshot };
}

test('le vrai GameEngine démarre la campagne V70 avec son niveau, ses systèmes, son atlas et sa reprise', () => withBrowserMocks(() => {
  const campaign = CAMPAIGNS.find((entry) => entry.id === ALIEN_SURVIVAL_CAMPAIGN_ID_V70);
  assert.ok(campaign, 'campagne SYSTÈMES DE SURVIE ALIEN absente du contenu réel');

  const { engine, missionLevel, snapshot } = startProductionMission(campaign, 70);
  assert.equal(missionLevel.templateId, 'ship-interior-vertical');
  assert.equal(missionLevel.validation.valid, true);
  assert.equal(engine.isAlienSurvivalMissionV70(), true);
  assert.equal(engine.alienSurvivalV70.schema, ALIEN_SURVIVAL_SCHEMA_V70);
  assert.deepEqual(engine.alienSurvivalV70.rooms.map((room) => room.id), ALIEN_SURVIVAL_ROOM_IDS_V70);
  assert.equal(snapshot.alienSurvivalV70.rooms.length, 6);
  const logicalDoorById = new Map(engine.alienSurvivalV70.doors.map((door) => [door.id, door]));
  const physicalDoorById = new Map(engine.doors.map((door) => [door.id, door]));
  for (const definition of ALIEN_SURVIVAL_DOOR_DEFINITIONS_V70.filter((door) => door.id !== 'outer-airlock')) {
    const physical = physicalDoorById.get(definition.id);
    assert.ok(physical, `${definition.id}: porte physique absente`);
    assert.deepEqual(
      [logicalDoorById.get(definition.id).fromRoomId, logicalDoorById.get(definition.id).toRoomId],
      [physical.fromZoneId, physical.toZoneId],
      `${definition.id}: topologie pression différente du niveau physique`
    );
  }
  const physicalOuter = physicalDoorById.get('outer-airlock');
  const logicalOuter = logicalDoorById.get('outer-airlock');
  assert.equal(logicalOuter.fromRoomId, physicalOuter.fromZoneId);
  assert.equal(logicalOuter.toRoomId, ALIEN_SURVIVAL_EXTERIOR_ROOM_ID_V70);
  assert.equal(engine.alienSurvivalV70.rooms.some((room) => room.id === ALIEN_SURVIVAL_EXTERIOR_ROOM_ID_V70), false);

  assert.equal(engine.alienSurvivalStationsV70.length, 5);
  for (const station of engine.alienSurvivalStationsV70) {
    const surface = engine.platforms.find((entry) => entry.id === station.surfaceId);
    assert.ok(surface, `${station.id}: surface physique absente`);
    assert.equal(station.roomId, surface.zoneId, `${station.id}: station placée dans la mauvaise salle`);
    assert.equal(station.y + station.h, surface.y, `${station.id}: station détachée de sa surface`);
  }

  const atlas = engine.images.get(ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.imageKey);
  assert.ok(atlas, 'atlas système V70 non chargé par le runtime production');
  assert.equal(atlas.currentSrc, ALIEN_SURVIVAL_SYSTEMS_SHEET_V70.path);
  assert.equal(atlas.complete, true);

  for (const method of [
    'getAlienSurvivalUiStateV70',
    'setAlienSurvivalPowerRouteV70',
    'openAlienSurvivalCctvV70',
    'beginAlienSurvivalWeldV70',
    'authorizeAlienSurvivalSelfDestructV70',
    'armAlienSurvivalSelfDestructV70'
  ]) assert.equal(typeof engine[method], 'function', `${method}: API UI V70 absente`);
  assert.equal(engine.getAlienSurvivalUiStateV70().active, true);

  const pressureBefore = engine.alienSurvivalV70.rooms.map((room) => room.pressure);
  const ticksBefore = engine.alienSurvivalV70.pressure.simulatedTicks;
  engine.update(0.5);
  assert.ok(engine.alienSurvivalV70.pressure.simulatedTicks > ticksBefore);
  assert.notDeepEqual(engine.alienSurvivalV70.rooms.map((room) => room.pressure), pressureBefore);

  const resumeState = engine.captureResumeState();
  assert.equal(resumeState.specialOperation.operationId, ALIEN_SURVIVAL_OPERATION_ID_V70);
  assert.equal(resumeState.specialOperation.alienSurvivalV70.schema, ALIEN_SURVIVAL_SCHEMA_V70);
  assert.equal(resumeState.specialOperation.alienSurvivalV70.campaignId, ALIEN_SURVIVAL_CAMPAIGN_ID_V70);
  assert.equal(resumeState.specialOperation.alienSurvivalV70.rooms.length, 6);
  assert.doesNotThrow(() => JSON.stringify(resumeState));
}));

test('le vrai GameEngine laisse une campagne ordinaire hors du runtime V70', () => withBrowserMocks(() => {
  const campaign = CAMPAIGNS.find((entry) => !entry.specialOperationId);
  assert.ok(campaign, 'campagne ordinaire réelle absente');
  const { engine, snapshot } = startProductionMission(campaign, 71);
  assert.equal(engine.isAlienSurvivalMissionV70(), false);
  assert.equal(engine.alienSurvivalV70, null);
  assert.equal(engine.getAlienSurvivalUiStateV70().active, false);
  assert.equal(snapshot.alienSurvivalV70, undefined);
}));

test('l’insertion et le checkpoint V70 conservent une zone sûre physique sans effacer les menaces persistantes', () => withBrowserMocks(() => {
  const campaign = CAMPAIGNS.find((entry) => entry.id === ALIEN_SURVIVAL_CAMPAIGN_ID_V70);
  const { engine } = startProductionMission(campaign, 72);
  const distanceFromInsertion = (entity) => Math.hypot(
    entity.x + entity.w / 2 - (engine.player.x + engine.player.w / 2),
    entity.y + entity.h / 2 - (engine.player.y + engine.player.h / 2)
  );
  const aliveBefore = engine.enemies.filter((enemy) => enemy.alive).length;
  assert.ok(Math.min(...engine.enemies.filter((enemy) => enemy.alive).map(distanceFromInsertion)) >= ALIEN_SURVIVAL_INSERTION_SAFE_RADIUS_V70);
  assert.equal(engine.alienSurvivalInsertionSecurityV70.remainingUnsafe, 0);
  assert.ok(engine.alienSurvivalInsertionSecurityV70.movedEnemies >= 1);

  const threat = engine.enemies.find((enemy) => enemy.alive);
  Object.assign(threat, { x: engine.player.x + 18, y: engine.player.y, spawnX: engine.player.x + 18, alert: true, attacking: true });
  const pool = engine.createAlienSurvivalAcidPoolV70({
    id: 'acid-pool:checkpoint-regression', roomId: 'ship-docking',
    x: engine.player.x, y: engine.player.y + engine.player.h - 20, w: 96, h: 20
  });
  engine.hostileProjectiles.push({ x: engine.player.x, y: engine.player.y, w: 14, h: 10, vx: 0, damage: 99, life: 2, hit: false });
  engine.failMission('qa-insertion-regression');
  Object.assign(engine.player, { health: 0, alive: false, downed: true });

  assert.equal(engine.restartFromCheckpoint(), true);
  assert.equal(engine.player.health, 55);
  assert.equal(engine.player.alive, true);
  assert.ok(distanceFromInsertion(threat) >= ALIEN_SURVIVAL_INSERTION_SAFE_RADIUS_V70);
  assert.ok(distanceFromInsertion(pool) >= ALIEN_SURVIVAL_INSERTION_SAFE_RADIUS_V70);
  assert.equal(engine.hostileProjectiles.length, 0);
  assert.equal(engine.enemies.filter((enemy) => enemy.alive).length, aliveBefore);
  assert.equal(engine.alienSurvivalInsertionSecurityV70.reason, 'checkpoint-restart');
  assert.equal(engine.alienSurvivalInsertionSecurityV70.remainingUnsafe, 0);

  for (let frame = 0; frame < 180; frame += 1) engine.update(1 / 60);
  assert.equal(engine.mission.state, 'active');
  assert.equal(engine.player.alive, true);
  assert.ok(engine.player.health > 0);
}));

test('le délai générique de quarantaine ne remplace jamais le compte à rebours physique V70', () => withBrowserMocks(() => {
  const campaign = CAMPAIGNS.find((entry) => entry.id === ALIEN_SURVIVAL_CAMPAIGN_ID_V70);
  const { engine } = startProductionMission(campaign, 73);
  assert.equal(engine.objectiveRuntime.action, 'escape');
  assert.ok(engine.objectiveRuntime.timeLimit > 0);
  assert.equal(engine.alienSurvivalV70.selfDestruct.armed, false);

  engine.mission.elapsed = engine.objectiveRuntime.timeLimit + 12;
  engine.update(1 / 60);
  assert.equal(engine.mission.state, 'active');
  assert.equal(engine.mission.failureReason ?? null, null);
  assert.equal(engine.objectiveState.failed, false);

  engine.failMission('qa-checkpoint-overlay');
  assert.equal(engine.restartFromCheckpoint(), true);
  engine.update(1 / 60);
  assert.equal(engine.mission.state, 'active');
  assert.equal(engine.mission.failureReason ?? null, null);
  assert.notEqual(engine.getAlienSurvivalUiStateV70().status, 'quarantine-time-expired');
}));
