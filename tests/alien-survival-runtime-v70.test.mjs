import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ALIEN_SURVIVAL_CAMPAIGN_ID_V70,
  ALIEN_SURVIVAL_DOOR_DEFINITIONS_V70,
  ALIEN_SURVIVAL_OPERATION_ID_V70,
  ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70,
  ALIEN_SURVIVAL_ROOM_IDS_V70
} from '../src/alien-survival-systems-v70.js';
import {
  ALIEN_SURVIVAL_ACID_DAMAGE_INTERVAL_V70,
  ALIEN_SURVIVAL_INTERACTION_RADIUS_V70,
  ALIEN_SURVIVAL_WELD_SECONDS_V70,
  ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70,
  withAlienSurvivalRuntimeV70
} from '../src/alien-survival-runtime-v70.js';

const FLOOR_Y = 700;
const ROOM_WIDTH = 1000;
const DEPLOYMENT_ID = 'runtime-survival-v70';
const SURVIVAL_CAMPAIGN = Object.freeze({
  id: ALIEN_SURVIVAL_CAMPAIGN_ID_V70,
  name: 'SYSTÈMES DE SURVIE ALIEN',
  specialOperationId: ALIEN_SURVIVAL_OPERATION_ID_V70
});

const clone = (value) => structuredClone(value);
const accepted = (result) => result === true || result?.ok === true || result?.applied === true;
const rejected = (result) => result === false || result?.ok === false || result?.applied === false;

function assertAccepted(result, message = 'action V70 refusée') {
  assert.equal(accepted(result), true, `${message}${result?.reason ? ` (${result.reason})` : ''}`);
}

function assertRejected(result, expectedReason = null, message = 'action V70 acceptée à tort') {
  assert.equal(rejected(result), true, message);
  if (expectedReason) assert.equal(result?.reason, expectedReason);
}

function centerDistance(left, right) {
  return Math.hypot(
    Number(left?.x || 0) + Number(left?.w || 0) / 2 - (Number(right?.x || 0) + Number(right?.w || 0) / 2),
    Number(left?.y || 0) + Number(left?.h || 0) / 2 - (Number(right?.y || 0) + Number(right?.h || 0) / 2)
  );
}

function buildPhysicalLevel() {
  const biomeZones = ALIEN_SURVIVAL_ROOM_IDS_V70.map((id, index) => ({
    id,
    label: id.replace('ship-', '').toUpperCase(),
    x: index * ROOM_WIDTH,
    y: 0,
    w: ROOM_WIDTH,
    h: FLOOR_Y
  }));
  const platforms = biomeZones.map((zone) => ({
    id: `${zone.id}-deck`,
    zoneId: zone.id,
    kind: 'floor',
    x: zone.x + 20,
    y: FLOOR_Y,
    w: zone.w - 40,
    h: 20
  }));
  const doors = ALIEN_SURVIVAL_DOOR_DEFINITIONS_V70.map((definition) => {
    const fromIndex = ALIEN_SURVIVAL_ROOM_IDS_V70.indexOf(definition.fromRoomId);
    const toIndex = ALIEN_SURVIVAL_ROOM_IDS_V70.indexOf(definition.toRoomId);
    const boundary = toIndex > 0 ? toIndex * ROOM_WIDTH : (fromIndex + 1) * ROOM_WIDTH;
    return {
      ...definition,
      x: boundary - 38,
      y: FLOOR_Y - 128,
      w: 76,
      h: 128,
      open: false,
      progress: 0,
      levelLocked: false,
      lockedBy: null
    };
  });
  return {
    biomeZones,
    platforms,
    doors,
    graph: {
      nodes: biomeZones.map((zone) => ({
        id: `${zone.id}-node`,
        zoneId: zone.id,
        x: zone.x + zone.w / 2,
        y: FLOOR_Y
      })),
      routes: [
        { id: 'main-deck', kind: 'primary' },
        { id: 'maintenance-duct', kind: 'alternate' },
        { id: 'service-gantry', kind: 'alternate' }
      ]
    }
  };
}

class AlienSurvivalHarnessBase {
  constructor({ events = [] } = {}) {
    this.events = events;
    this.onEvent = (event) => this.events.push(clone(event));
    this.keys = new Set();
    this.images = new Map();
    this.canvas = { width: 1280, height: 720 };
    this.camera = { x: 0, y: 0 };
    this.running = true;
    this.worldTicks = 0;
    this.basePlayerUpdates = 0;
    this.restartCount = 0;
  }

  start(options = {}) {
    const level = buildPhysicalLevel();
    this.campaign = options.campaign || { id: 'ordinary-campaign' };
    this.missionPlan = { campaign: this.campaign };
    this.difficulty = options.difficulty || 'standard';
    this.missionLevelRuntime = { biomeZones: level.biomeZones, graph: level.graph };
    this.missionLevelBounds = { width: ALIEN_SURVIVAL_ROOM_IDS_V70.length * ROOM_WIDTH, height: 900 };
    this.missionLevelVisualState = { activeZoneId: null };
    this.routeRuntime = { routes: clone(level.graph.routes) };
    this.platforms = level.platforms;
    this.doors = level.doors;
    this.vents = [{ id: 'survival-maintenance-vent', authoredNetworkV62: true }];
    this.hazards = [{ id: 'cargo-vacuum', kind: 'vacuum', zoneId: 'ship-cargo', active: true }];
    this.player = {
      id: 'player', x: 110, y: FLOOR_Y - 76, w: 44, h: 76, alive: true,
      health: 100, maxHealth: 100, armor: 20, facing: 1, actionClock: 0, zoneId: 'ship-docking'
    };
    this.coop = {
      id: 'coop', x: 165, y: FLOOR_Y - 76, w: 44, h: 76, alive: true,
      health: 100, maxHealth: 100, armor: 20, facing: 1, actionClock: 0,
      coop: true, zoneId: 'ship-docking'
    };
    this.coopEnabled = true;
    this.inventory = { cutter: false, pressureSuit: false };
    this.toolPickup = { id: 'base-tool', x: 1250, y: FLOOR_Y - 48, w: 48, h: 48, taken: false };
    this.powerNode = { id: 'base-power', x: 2500, y: FLOOR_Y - 70, w: 64, h: 70, active: false };
    this.archiveTerminal = { id: 'base-archive', x: 3600, y: FLOOR_Y - 80, w: 70, h: 80, active: false };
    this.objective = {
      id: 'survival-extraction', roomId: 'ship-extraction', zoneId: 'ship-extraction',
      x: 5700, y: FLOOR_Y - 90, w: 84, h: 90, complete: false
    };
    this.enemies = [
      {
        id: 'xeno-runtime-01', name: 'Xenomorph Drone', biology: 'xenomorph', species: 'drone',
        x: 3370, y: FLOOR_Y - 82, w: 54, h: 82, alive: true, health: 80, maxHealth: 80
      },
      {
        id: 'synthetic-runtime-01', name: 'Combat Synthetic', biology: 'synthetic', species: 'android',
        x: 4380, y: FLOOR_Y - 82, w: 54, h: 82, alive: true, health: 80, maxHealth: 80
      }
    ];
    this.mission = {
      state: 'active', phase: 'infiltration', failureReason: null, elapsed: 0,
      objectives: { power: false, route: false, boss: false, archive: false, extract: false },
      rewards: { credits: 700, salvage: 9 }
    };
    this.lastResumeResult = null;
    if (options.resumeState) this.lastResumeResult = this.applyResumeState(options.resumeState);
    return this.getSnapshot();
  }

  update(delta = 0) {
    const seconds = Math.max(0, Number(delta) || 0);
    if (this.mission?.state === 'active') {
      this.mission.elapsed += seconds;
      this.worldTicks += 1;
      const movingEnemy = this.enemies.find((enemy) => enemy.alive);
      if (movingEnemy) movingEnemy.x += seconds * 8;
    }
    const controls = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space' };
    this.updatePlayer(this.player, seconds, controls);
    if (this.coopEnabled) this.updatePlayer(this.coop, seconds, controls);
  }

  updatePlayer(actor, delta = 0, controls = {}) {
    if (!actor?.alive) return false;
    this.basePlayerUpdates += 1;
    const speed = 180 * Math.max(0, Number(delta) || 0);
    if (controls.left && this.keys.has(controls.left)) actor.x -= speed;
    if (controls.right && this.keys.has(controls.right)) actor.x += speed;
    if (controls.up && this.keys.has(controls.up)) actor.y -= speed;
    if (controls.down && this.keys.has(controls.down)) actor.y += speed;
    return true;
  }

  interact(actor = this.player) {
    if (!actor?.alive || this.mission?.state !== 'active') return false;
    if (centerDistance(actor, this.objective) <= 180) {
      const requirement = this.missingExtractionRequirement(actor);
      return requirement ? this.locked(requirement) : this.completeMission(actor);
    }
    const door = this.doors.find((entry) => centerDistance(actor, entry) <= 120);
    if (door) {
      const requirement = this.doorRequirement(door, actor);
      if (requirement) return this.locked(requirement);
      door.open = !door.open;
      door.progress = door.open ? 1 : 0;
      return true;
    }
    return false;
  }

  doorRequirement() { return ''; }
  missingExtractionRequirement() { return ''; }
  getInteractionPrompt() { return ''; }
  phaseLabel() { return this.mission?.phase || ''; }
  objectiveProgressText() { return ''; }
  setInteractionAnimation(actor, id, duration) { this.lastInteractionAnimation = { actor: actor?.id, id, duration }; }
  setToolAnimation(actor, id, duration) { this.lastToolAnimation = { actor: actor?.id, id, duration }; }
  locked(requirement) { this.lastLockedRequirement = requirement; return false; }

  damagePlayer(actor = this.player, amount = 0, options = {}) {
    const target = actor?.alive ? actor : this.player;
    if (!target?.alive) return 0;
    const damage = Math.max(0, Number(amount) || 0);
    target.health = Math.max(0, target.health - damage);
    target.alive = target.health > 0;
    this.onEvent({ type: 'player-damaged', amount: damage, source: options.source || 'test', actorId: target.id });
    return damage;
  }

  defeatEnemy(enemy, owner = this.player) {
    if (!enemy?.alive) return false;
    enemy.alive = false;
    enemy.health = 0;
    this.onEvent({ type: 'enemy-defeated', enemyId: enemy.id, ownerId: owner?.id });
    return true;
  }

  failMission(reason = 'failed') {
    if (this.mission?.state !== 'active') return false;
    this.mission.state = 'failed';
    this.mission.failureReason = String(reason);
    this.onEvent({ type: 'mission-failed', reason: this.mission.failureReason });
    return true;
  }

  completeMission() {
    if (this.mission?.state !== 'active') return false;
    this.mission.state = 'complete';
    this.mission.objectives.extract = true;
    this.objective.complete = true;
    this.onEvent({ type: 'mission-complete', rewards: clone(this.mission.rewards) });
    return true;
  }

  restartFromCheckpoint() {
    this.restartCount += 1;
    this.mission.state = 'active';
    this.mission.failureReason = null;
    return true;
  }

  captureResumeState() {
    return {
      schema: 1,
      identity: { campaignId: this.campaign?.id || '' },
      mission: clone(this.mission),
      player: clone(this.player),
      coop: clone(this.coop),
      inventory: clone(this.inventory),
      toolPickup: clone(this.toolPickup),
      doors: this.doors.map((door) => clone(door)),
      specialOperation: {}
    };
  }

  applyResumeState(rawState) {
    if (!rawState || rawState.schema !== 1 || rawState.identity?.campaignId !== this.campaign?.id) {
      return { applied: false, reason: 'identity-mismatch', restored: 0 };
    }
    if (rawState.mission) this.mission = clone(rawState.mission);
    if (rawState.player) Object.assign(this.player, clone(rawState.player));
    if (rawState.coop) Object.assign(this.coop, clone(rawState.coop));
    if (rawState.inventory) Object.assign(this.inventory, clone(rawState.inventory));
    if (rawState.toolPickup) Object.assign(this.toolPickup, clone(rawState.toolPickup));
    for (const savedDoor of rawState.doors || []) {
      const door = this.doors.find((entry) => entry.id === savedDoor.id);
      if (door) Object.assign(door, clone(savedDoor));
    }
    return { applied: true, reason: 'restored', restored: 6 };
  }

  drawWorld() { this.baseWorldDraws = (this.baseWorldDraws || 0) + 1; }
  drawHud() { this.baseHudDraws = (this.baseHudDraws || 0) + 1; }
  getGameplayReport() { return { missionState: this.mission?.state || 'idle', worldTicks: this.worldTicks }; }
  getSnapshot() { return { missionState: this.mission?.state || 'idle', missionPhase: this.mission?.phase || '' }; }
}

const AlienSurvivalHarness = withAlienSurvivalRuntimeV70(AlienSurvivalHarnessBase);

function createEngine({ events = [], resumeState = null, campaign = SURVIVAL_CAMPAIGN, difficulty = 'standard' } = {}) {
  const engine = new AlienSurvivalHarness({ events });
  engine.start({
    campaign,
    difficulty,
    strategicBriefing: { id: DEPLOYMENT_ID },
    ...(resumeState ? { resumeState } : {})
  });
  return engine;
}

function roomForX(engine, x) {
  return engine.missionLevelRuntime.biomeZones.find((zone) => x >= zone.x && x <= zone.x + zone.w)?.id || null;
}

function moveActorTo(engine, target, actor = engine.player) {
  assert.ok(target && Number.isFinite(Number(target.x)) && Number.isFinite(Number(target.y)), 'cible physique V70 absente');
  actor.x = Number(target.x) + Number(target.w || 0) / 2 - Number(actor.w || 0) / 2;
  actor.y = Number(target.y) + Number(target.h || 0) / 2 - Number(actor.h || 0) / 2;
  actor.zoneId = target.roomId || target.zoneId || roomForX(engine, actor.x + actor.w / 2);
  return actor;
}

function moveActorToRoom(engine, roomId, actor = engine.player) {
  const platform = engine.platforms.find((entry) => entry.zoneId === roomId);
  assert.ok(platform, `${roomId}: pont physique absent`);
  actor.x = platform.x + platform.w / 2 - actor.w / 2;
  actor.y = platform.y - actor.h;
  actor.zoneId = roomId;
  return actor;
}

function moveActorFeetTo(engine, target, actor = engine.player) {
  assert.ok(target && Number.isFinite(Number(target.x)) && Number.isFinite(Number(target.y)), 'surface dangereuse V70 absente');
  actor.x = Number(target.x) + Number(target.w || 0) / 2 - Number(actor.w || 0) / 2;
  actor.y = Number(target.y) + Number(target.h || 0) - Number(actor.h || 0);
  actor.zoneId = target.roomId || target.zoneId || roomForX(engine, actor.x + actor.w / 2);
  return actor;
}

function station(engine, idOrType) {
  const value = engine.alienSurvivalStationV70(idOrType);
  assert.ok(value, `${idOrType}: station V70 absente`);
  return value;
}

function routePower(engine, circuitId, enabled = true, actor = engine.player) {
  moveActorTo(engine, station(engine, 'power'), actor);
  const result = engine.setAlienSurvivalPowerRouteV70(circuitId, enabled, actor);
  assertAccepted(result, `routage ${circuitId}=${enabled}`);
  return result;
}

function scanEveryCctvFeed(engine, actor = engine.player) {
  if (!engine.alienSurvivalV70.power.routes.cctv) routePower(engine, 'cctv', true, actor);
  moveActorTo(engine, station(engine, 'cctv'), actor);
  assertAccepted(engine.openAlienSurvivalCctvV70(actor), 'ouverture CCTV');
  const required = engine.alienSurvivalV70.cctv.requiredFeedIds;
  for (let guard = 0; guard < required.length * 2 && !engine.alienSurvivalV70.cctv.scanComplete; guard += 1) {
    assertAccepted(engine.cycleAlienSurvivalCctvV70(1), 'cycle CCTV');
  }
  assert.deepEqual([...engine.alienSurvivalV70.cctv.visitedFeedIds].sort(), [...required].sort());
  assert.equal(engine.alienSurvivalV70.cctv.scanComplete, true);
  assertAccepted(engine.closeAlienSurvivalCctvV70(), 'fermeture CCTV');
}

function collectWeldingKit(engine, actor = engine.player) {
  if (engine.inventory.cutter && engine.alienSurvivalWeldingKitV70?.taken) return;
  moveActorTo(engine, engine.alienSurvivalWeldingKitV70, actor);
  assertAccepted(engine.collectAlienSurvivalWeldingKitV70(actor), 'collecte du kit de soudure');
  assert.equal(engine.inventory.cutter, true);
  assert.equal(engine.alienSurvivalWeldingKitV70.taken, true);
}

function runWorldSeconds(engine, seconds, step = 0.1) {
  let remaining = seconds;
  let guard = 0;
  while (remaining > 0.0000001 && guard < 10000) {
    const delta = Math.min(step, remaining);
    engine.update(delta);
    remaining -= delta;
    guard += 1;
  }
}

function completeWeld(engine, actor = engine.player) {
  collectWeldingKit(engine, actor);
  if (!engine.alienSurvivalV70.cctv.scanComplete) scanEveryCctvFeed(engine, actor);
  const door = engine.alienSurvivalPhysicalDoorV70(ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70);
  moveActorTo(engine, door, actor);
  assertAccepted(engine.beginAlienSurvivalWeldV70(door.id, actor), 'démarrage de la soudure');
  runWorldSeconds(engine, ALIEN_SURVIVAL_WELD_SECONDS_V70 + 0.2, 0.1);
  const stateDoor = engine.alienSurvivalStateDoorV70(door.id);
  assert.equal(stateDoor.welded, true, 'la porte logique doit être soudée');
  assert.equal(door.survivalWeldedV70, true, 'la porte physique doit être soudée');
  assert.ok(engine.alienSurvivalV70.welding.completedDoorIds.includes(door.id));
  return door;
}

function stabilizeAndCycleAirlock(engine, actor = engine.player) {
  moveActorTo(engine, station(engine, 'power'), actor);
  if (engine.alienSurvivalV70.power.routes.cctv) assertAccepted(engine.setAlienSurvivalPowerRouteV70('cctv', false, actor));
  if (!engine.alienSurvivalV70.power.routes.security) assertAccepted(engine.setAlienSurvivalPowerRouteV70('security', true, actor));
  if (!engine.alienSurvivalV70.power.routes['life-support']) assertAccepted(engine.setAlienSurvivalPowerRouteV70('life-support', true, actor));
  moveActorToRoom(engine, 'ship-habitation', actor);
  for (let guard = 0; guard < 80; guard += 1) {
    const command = engine.alienSurvivalV70.rooms.find((room) => room.id === 'ship-command');
    const extraction = engine.alienSurvivalV70.rooms.find((room) => room.id === 'ship-extraction');
    if (extraction.pressure >= 75 && extraction.oxygen >= 60 && Math.abs(command.pressure - extraction.pressure) <= 12) break;
    engine.update(0.1);
  }
  moveActorTo(engine, station(engine, 'pressure'), actor);
  const equalization = engine.cycleAlienSurvivalAirlockV70(actor);
  assertAccepted(equalization, 'égalisation physique du sas');
  assert.equal(equalization.equalized, true);
  assert.equal(engine.alienSurvivalStateDoorV70('outer-airlock').open, false);
  assertAccepted(engine.cycleAlienSurvivalAirlockV70(actor), 'ouverture physique du sas');
  runWorldSeconds(engine, 1.25, 0.05);
  const stateDoor = engine.alienSurvivalStateDoorV70('outer-airlock');
  assert.equal(stateDoor.open, true);
  assert.ok(engine.alienSurvivalV70.pressure.equalizedDoorIds.includes('outer-airlock'));
  return stateDoor;
}

function ensurePersistentAcidEvidence(engine) {
  const pool = engine.alienSurvivalV70.acidPools.find((entry) => entry.active !== false);
  assert.ok(pool, 'flaque acide persistante initiale absente');
  if (pool.ageSeconds < 1) {
    moveActorToRoom(engine, 'ship-command');
    runWorldSeconds(engine, 1.1, 0.1);
  }
  assert.ok(engine.alienSurvivalV70.acid.maxPersistenceSeconds >= 1);
  return pool;
}

function completePreDestructMechanics(engine) {
  completeWeld(engine);
  stabilizeAndCycleAirlock(engine);
  ensurePersistentAcidEvidence(engine);
  return engine;
}

function authorizeAndArm(engine, actor = engine.player) {
  const engineering = station(engine, 'survival-engineering-auth');
  const command = station(engine, 'survival-command-auth');
  moveActorTo(engine, engineering, actor);
  assertAccepted(engine.authorizeAlienSurvivalSelfDestructV70(engineering.id, actor), 'autorisation ingénierie');
  moveActorTo(engine, command, actor);
  assertAccepted(engine.authorizeAlienSurvivalSelfDestructV70(command.id, actor), 'autorisation commandement');
  assertAccepted(engine.armAlienSurvivalSelfDestructV70(actor), 'armement auto-destruction');
  assert.equal(engine.alienSurvivalV70.selfDestruct.armed, true);
  return engine.alienSurvivalV70.selfDestruct;
}

test('V70 ne s’active que pour la campagne dédiée et matérialise les six salles, stations, portes et l’acide', () => {
  const ordinary = createEngine({ campaign: { id: 'ordinary-campaign' } });
  assert.equal(ordinary.isAlienSurvivalMissionV70(), false);
  assert.equal(ordinary.alienSurvivalV70, null);
  ordinary.update(0.5);
  assert.equal(ordinary.worldTicks, 1, 'la campagne ordinaire garde le moteur de base');

  const events = [];
  const engine = createEngine({ events });
  assert.equal(engine.isAlienSurvivalMissionV70(), true);
  assert.equal(engine.alienSurvivalV70.schema, 70);
  assert.deepEqual(engine.alienSurvivalV70.rooms.map((room) => room.id), ALIEN_SURVIVAL_ROOM_IDS_V70);
  assert.equal(engine.alienSurvivalStationsV70.length, 5);
  assert.equal(engine.alienSurvivalCameraFeedsV70.length, 6);
  assert.equal(engine.alienSurvivalPhysicalDoorsV70().length, 4);
  assert.ok(engine.alienSurvivalV70.acidPools.length >= 1);
  assert.equal(engine.hazards.find((hazard) => hazard.id === 'cargo-vacuum').active, false);
  for (const surface of [...engine.alienSurvivalStationsV70, engine.alienSurvivalWeldingKitV70]) {
    const deck = engine.platforms.find((entry) => entry.id === surface.surfaceId);
    assert.ok(deck, `${surface.id}: pont physique manquant`);
    assert.equal(surface.y + surface.h, deck.y, `${surface.id}: prop détaché du pont`);
  }
  assert.ok(events.some((event) => event.type === 'alien-survival-started' && event.roomCount === 6));
});

test('le reroutage exige la proximité du répartiteur et respecte une capacité stricte de deux circuits', () => {
  const engine = createEngine();
  const remote = engine.setAlienSurvivalPowerRouteV70('cctv', true, engine.player);
  assertRejected(remote, 'physical-console-required');

  const power = station(engine, 'power');
  moveActorTo(engine, power);
  assert.ok(centerDistance(engine.player, power) <= ALIEN_SURVIVAL_INTERACTION_RADIUS_V70);
  assertAccepted(engine.setAlienSurvivalPowerRouteV70('security', true, engine.player));
  assertAccepted(engine.setAlienSurvivalPowerRouteV70('cctv', true, engine.player));
  const overCapacity = engine.setAlienSurvivalPowerRouteV70('life-support', true, engine.player);
  assertRejected(overCapacity, 'power-capacity-exceeded');
  assert.deepEqual(engine.alienSurvivalV70.power.routes, { 'life-support': false, security: true, cctv: true });

  assertAccepted(engine.setAlienSurvivalPowerRouteV70('cctv', false, engine.player));
  assertAccepted(engine.setAlienSurvivalPowerRouteV70('life-support', true, engine.player));
  assert.equal(Object.values(engine.alienSurvivalV70.power.routes).filter(Boolean).length, 2);
  assert.ok(engine.alienSurvivalV70.power.rerouteCount >= 4);
});

test('la CCTV exige énergie et console, visite réellement six flux et ne met jamais le monde en pause', () => {
  const engine = createEngine();
  assertRejected(engine.openAlienSurvivalCctvV70(engine.player), 'physical-console-required');
  routePower(engine, 'cctv', true);
  assertRejected(engine.openAlienSurvivalCctvV70(engine.player), 'physical-console-required');

  moveActorTo(engine, station(engine, 'cctv'));
  assertAccepted(engine.openAlienSurvivalCctvV70(engine.player));
  assert.equal(engine.alienSurvivalV70.cctv.active, true);
  const playerX = engine.player.x;
  const elapsed = engine.mission.elapsed;
  const ticks = engine.worldTicks;
  const enemy = engine.enemies.find((entry) => entry.alive);
  const enemyX = enemy.x;
  engine.keys.add('KeyD');
  engine.update(0.5);
  engine.keys.delete('KeyD');
  assert.equal(engine.player.x, playerX, 'l’opérateur CCTV doit rester devant sa console');
  assert.ok(engine.mission.elapsed > elapsed, 'l’horloge de jeu doit continuer');
  assert.ok(engine.worldTicks > ticks, 'la simulation du monde doit continuer');
  assert.ok(enemy.x > enemyX, 'les ennemis doivent continuer leur simulation');

  for (let guard = 0; guard < 12 && !engine.alienSurvivalV70.cctv.scanComplete; guard += 1) {
    assertAccepted(engine.cycleAlienSurvivalCctvV70(1));
  }
  assert.equal(engine.alienSurvivalV70.cctv.scanComplete, true);
  assert.equal(new Set(engine.alienSurvivalV70.cctv.visitedFeedIds).size, 6);
  assertAccepted(engine.closeAlienSurvivalCctvV70());
  assert.equal(engine.alienSurvivalV70.cctv.active, false);
});

test('la soudure est une action temporisée annulable par mouvement, distance ou dégâts avant de verrouiller la porte', () => {
  const events = [];
  const engine = createEngine({ events });
  const door = engine.alienSurvivalPhysicalDoorV70(ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70);
  moveActorTo(engine, door);
  assertRejected(engine.beginAlienSurvivalWeldV70(door.id, engine.player));
  collectWeldingKit(engine);
  moveActorTo(engine, door);
  assertRejected(engine.beginAlienSurvivalWeldV70(door.id, engine.player), 'cctv-scan-required');
  scanEveryCctvFeed(engine);

  moveActorTo(engine, door);
  assertAccepted(engine.beginAlienSurvivalWeldV70(door.id, engine.player));
  assert.ok(engine.alienSurvivalWorldActionV70);
  engine.keys.add('KeyD');
  engine.update(0.05);
  engine.keys.delete('KeyD');
  assert.equal(engine.alienSurvivalWorldActionV70, null, 'le mouvement doit annuler la soudure');
  assert.equal(engine.alienSurvivalStateDoorV70(door.id).welded, false);

  moveActorTo(engine, door);
  assertAccepted(engine.beginAlienSurvivalWeldV70(door.id, engine.player));
  engine.damagePlayer(engine.player, 2, { source: 'runtime-test' });
  engine.update(0.01);
  assert.equal(engine.alienSurvivalWorldActionV70, null, 'les dégâts doivent annuler la soudure');

  moveActorTo(engine, door);
  assertAccepted(engine.beginAlienSurvivalWeldV70(door.id, engine.player));
  engine.player.x += 500;
  engine.player.zoneId = roomForX(engine, engine.player.x);
  engine.update(0.01);
  assert.equal(engine.alienSurvivalWorldActionV70, null, 'quitter la portée doit annuler la soudure');

  moveActorTo(engine, door);
  assertAccepted(engine.beginAlienSurvivalWeldV70(door.id, engine.player));
  runWorldSeconds(engine, ALIEN_SURVIVAL_WELD_SECONDS_V70 - 0.1, 0.1);
  assert.equal(engine.alienSurvivalStateDoorV70(door.id).welded, false, 'la soudure ne doit pas finir trop tôt');
  engine.update(0.11);
  assert.equal(engine.alienSurvivalStateDoorV70(door.id).welded, true);
  assert.equal(door.open, false);
  assert.equal(door.levelLocked, true);
  assert.equal(door.survivalWeldedV70, true);
  assert.ok(events.filter((event) => event.type === 'alien-survival-weld-cancelled').length >= 3);
  assert.ok(events.some((event) => event.type === 'alien-survival-door-welded' && event.doorId === door.id));
});

test('le support-vie restaure la salle d’extraction et le sas égalise puis ouvre physiquement', () => {
  const engine = createEngine();
  routePower(engine, 'security', true);
  const extractionBefore = engine.alienSurvivalV70.rooms.find((room) => room.id === 'ship-extraction').pressure;
  moveActorTo(engine, station(engine, 'pressure'));
  const equalization = engine.cycleAlienSurvivalAirlockV70(engine.player);
  assertAccepted(equalization, 'égalisation contrôlée du sas');
  assert.equal(equalization.equalized, true);
  assert.equal(engine.alienSurvivalStateDoorV70('outer-airlock').open, false);

  routePower(engine, 'life-support', true);
  moveActorToRoom(engine, 'ship-habitation');
  runWorldSeconds(engine, 2.5, 0.05);
  const extraction = engine.alienSurvivalV70.rooms.find((room) => room.id === 'ship-extraction');
  assert.ok(extraction.pressure > extractionBefore);
  assert.ok(extraction.pressure >= 75 && extraction.oxygen >= 60);

  moveActorTo(engine, station(engine, 'pressure'));
  assertAccepted(engine.cycleAlienSurvivalAirlockV70(engine.player));
  runWorldSeconds(engine, 1.25, 0.05);
  const stateDoor = engine.alienSurvivalStateDoorV70('outer-airlock');
  const physicalDoor = engine.alienSurvivalPhysicalDoorV70('outer-airlock');
  assert.equal(stateDoor.open, true);
  assert.equal(physicalDoor.open, true);
  assert.ok(engine.alienSurvivalV70.pressure.equalizedDoorIds.includes('outer-airlock'));
  assert.ok(engine.alienSurvivalV70.pressure.stabilizedRoomIds.includes('ship-extraction'));

  const grouped = createEngine();
  routePower(grouped, 'life-support', true);
  grouped.update(1);
  const stepped = createEngine();
  routePower(stepped, 'life-support', true);
  for (let frame = 0; frame < 60; frame += 1) stepped.update(1 / 60);
  assert.deepEqual(grouped.alienSurvivalV70.rooms, stepped.alienSurvivalV70.rooms, 'pression runtime non déterministe à 60 Hz');
});

test('l’acide persiste, naît uniquement des xénomorphes, blesse et corrode une soudure de façon déterministe', () => {
  const grouped = createEngine();
  const stepped = createEngine();
  grouped.update(1.2);
  for (let frame = 0; frame < 72; frame += 1) stepped.update(1 / 60);
  assert.deepEqual(
    grouped.alienSurvivalV70.acidPools.map((pool) => ({ id: pool.id, ageSeconds: pool.ageSeconds })),
    stepped.alienSurvivalV70.acidPools.map((pool) => ({ id: pool.id, ageSeconds: pool.ageSeconds }))
  );

  const engine = createEngine();
  const xeno = engine.enemies.find((enemy) => /xeno/i.test(enemy.id));
  const synthetic = engine.enemies.find((enemy) => /synthetic/i.test(enemy.id));
  const before = engine.alienSurvivalV70.acidPools.length;
  assert.equal(engine.defeatEnemy(xeno, engine.player), true);
  assert.equal(engine.alienSurvivalV70.acidPools.length, before + 1);
  const xenoPool = engine.alienSurvivalV70.acidPools.find((pool) => pool.sourceEnemyId === xeno.id);
  assert.ok(xenoPool?.persistent);
  const afterXeno = engine.alienSurvivalV70.acidPools.length;
  assert.equal(engine.defeatEnemy(synthetic, engine.player), true);
  assert.equal(engine.alienSurvivalV70.acidPools.length, afterXeno, 'un synthétique ne doit pas produire d’acide xénomorphe');

  moveActorFeetTo(engine, xenoPool);
  const health = engine.player.health;
  runWorldSeconds(engine, ALIEN_SURVIVAL_ACID_DAMAGE_INTERVAL_V70 + 0.1, 0.05);
  assert.ok(engine.player.health < health, 'une flaque active doit infliger des dégâts');

  const stateDoor = engine.alienSurvivalStateDoorV70(ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70);
  const physicalDoor = engine.alienSurvivalPhysicalDoorV70(stateDoor.id);
  Object.assign(stateDoor, { welded: true, open: false, weldIntegrity: 100 });
  if (!engine.alienSurvivalV70.welding.completedDoorIds.includes(stateDoor.id)) {
    engine.alienSurvivalV70.welding.completedDoorIds.push(stateDoor.id);
  }
  engine.syncAlienSurvivalDoorStateV70();
  const corrosionPool = engine.alienSurvivalV70.acidPools.find((pool) => pool.sourceEnemyId === xeno.id);
  assert.ok(corrosionPool, 'la flaque xénomorphe doit survivre aux ticks immuables');
  Object.assign(corrosionPool, {
    roomId: stateDoor.fromRoomId,
    x: physicalDoor.x,
    y: physicalDoor.y + physicalDoor.h - 18,
    w: physicalDoor.w,
    h: 24,
    intensity: 1,
    active: true
  });
  moveActorToRoom(engine, 'ship-docking');
  runWorldSeconds(engine, 1.5, 0.05);
  assert.ok(
    engine.alienSurvivalStateDoorV70(ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70).weldIntegrity < 100,
    'l’acide doit corroder la soudure persistante'
  );
});

test('l’auto-destruction impose les deux consoles physiques et son compte à rebours suit les secondes de jeu, CCTV comprise', () => {
  const events = [];
  const engine = createEngine({ events });
  completePreDestructMechanics(engine);
  moveActorToRoom(engine, 'ship-docking');
  assertRejected(engine.authorizeAlienSurvivalSelfDestructV70('survival-engineering-auth', engine.player), 'physical-authorization-required');

  const destruct = authorizeAndArm(engine);
  assert.equal(destruct.authorizations.engineering, true);
  assert.equal(destruct.authorizations.command, true);
  const before = destruct.remainingSeconds;

  moveActorTo(engine, station(engine, 'power'));
  assertAccepted(engine.setAlienSurvivalPowerRouteV70('life-support', false, engine.player));
  assertAccepted(engine.setAlienSurvivalPowerRouteV70('cctv', true, engine.player));
  moveActorTo(engine, station(engine, 'cctv'));
  assertAccepted(engine.openAlienSurvivalCctvV70(engine.player));
  const elapsed = engine.mission.elapsed;
  engine.update(1.25);
  assert.ok(engine.alienSurvivalV70.selfDestruct.remainingSeconds < before);
  assert.ok(Math.abs((before - engine.alienSurvivalV70.selfDestruct.remainingSeconds) - 1.25) <= 0.001);
  assert.ok(Math.abs((engine.mission.elapsed - elapsed) - 1.25) <= 0.001);
  assert.equal(engine.alienSurvivalV70.cctv.active, true);

  engine.alienSurvivalV70.selfDestruct.remainingSeconds = 0.1;
  engine.update(0.11);
  assert.equal(engine.alienSurvivalV70.selfDestruct.expired, true);
  assert.equal(engine.mission.state, 'failed');
  assert.ok(events.some((event) => event.type === 'alien-survival-self-destruct-expired'));
  assert.ok(events.some((event) => event.type === 'mission-failed'));
});

test('l’armement reste verrouillé si la sécurité est coupée après les deux autorisations', () => {
  const events = [];
  const engine = createEngine({ events });
  completePreDestructMechanics(engine);
  const engineering = station(engine, 'survival-engineering-auth');
  const command = station(engine, 'survival-command-auth');
  moveActorTo(engine, engineering);
  assertAccepted(engine.authorizeAlienSurvivalSelfDestructV70(engineering.id, engine.player));
  moveActorTo(engine, command);
  assertAccepted(engine.authorizeAlienSurvivalSelfDestructV70(command.id, engine.player));

  routePower(engine, 'security', false);
  moveActorTo(engine, command);
  assertRejected(engine.armAlienSurvivalSelfDestructV70(engine.player), 'security-power-required');
  assert.equal(engine.alienSurvivalV70.selfDestruct.armed, false);
  assert.equal(events.some((event) => event.type === 'alien-survival-self-destruct-armed'), false);

  routePower(engine, 'security', true);
  moveActorTo(engine, command);
  assertAccepted(engine.armAlienSurvivalSelfDestructV70(engine.player));
  assert.equal(engine.alienSurvivalV70.selfDestruct.armed, true);
});

test('l’extraction reste bloquée avant les six preuves puis publie un payload complet après la boucle jouable', () => {
  const events = [];
  const engine = createEngine({ events });
  moveActorTo(engine, engine.objective);
  assert.notEqual(engine.missingExtractionRequirement(engine.player), '');
  assert.equal(engine.interact(engine.player), false);
  assert.equal(engine.mission.state, 'active');

  completePreDestructMechanics(engine);
  authorizeAndArm(engine);
  moveActorTo(engine, engine.objective);
  assert.equal(engine.missingExtractionRequirement(engine.player), '');
  assert.equal(engine.interact(engine.player), true);
  assert.equal(engine.mission.state, 'complete');
  assert.equal(engine.alienSurvivalV70.extracted, true);
  const completion = events.find((event) => event.type === 'mission-complete');
  assert.ok(completion, 'événement mission-complete absent');
  const payload = completion.rewards?.alienSurvivalSystems || engine.mission.rewards?.alienSurvivalSystems;
  assert.ok(payload, 'rewards.alienSurvivalSystems absent');
  assert.equal(payload.complete, true);
  assert.equal(payload.operationId, ALIEN_SURVIVAL_OPERATION_ID_V70);
  assert.deepEqual(payload.mechanics.filter((entry) => entry.complete).map((entry) => entry.id), ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70);
  assert.equal(engine.buildAlienSurvivalResolutionPayloadV70().complete, true);
});

test('capture et reprise conservent pression, énergie, soudure, CCTV, acide et compte à rebours sans action fantôme', () => {
  const source = createEngine();
  completePreDestructMechanics(source);
  authorizeAndArm(source);
  source.update(0.75);
  const expected = clone(source.alienSurvivalV70);
  const resumeState = source.captureResumeState();
  assert.doesNotThrow(() => JSON.stringify(resumeState));
  const saved = resumeState.specialOperation?.alienSurvivalV70 || resumeState.alienSurvivalV70;
  assert.equal(saved?.schema, 70);
  assert.equal(saved?.deploymentOperationId, DEPLOYMENT_ID);

  const restored = createEngine({ resumeState: clone(resumeState) });
  assert.equal(restored.lastResumeResult?.applied, true);
  assert.equal(restored.lastResumeResult?.alienSurvivalRestoredV70, true);
  assert.deepEqual(restored.alienSurvivalV70.power, expected.power);
  assert.deepEqual(restored.alienSurvivalV70.rooms, expected.rooms);
  assert.deepEqual(restored.alienSurvivalV70.pressure, expected.pressure);
  assert.deepEqual(restored.alienSurvivalV70.welding, expected.welding);
  assert.deepEqual(restored.alienSurvivalV70.cctv.visitedFeedIds, expected.cctv.visitedFeedIds);
  assert.deepEqual(restored.alienSurvivalV70.acidPools, expected.acidPools);
  assert.deepEqual(restored.alienSurvivalV70.selfDestruct, expected.selfDestruct);
  assert.equal(restored.alienSurvivalV70.cctv.active, false, 'une vue CCTV ne doit jamais être reprise comme pause');
  assert.equal(restored.alienSurvivalWorldActionV70, null, 'une soudure transitoire ne doit jamais être restaurée');
  const physicalWeld = restored.alienSurvivalPhysicalDoorV70(ALIEN_SURVIVAL_WELDABLE_DOOR_ID_V70);
  assert.equal(physicalWeld.survivalWeldedV70, true);
  assert.equal(physicalWeld.open, false);
});
