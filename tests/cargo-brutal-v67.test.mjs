import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CARGO_BRUTAL_PHASES_V67,
  createCargoBrutalStateV67,
  sanitizeCargoBrutalStateV67,
  withCargoBrutalRuntimeV67
} from '../src/cargo-brutal-runtime-v67.js';
import { GameEngine as ProductionGameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, CREW, ENEMIES, EQUIPMENT, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import {
  beginOperation, createDefaultSave, migrateSave, recordOperationResumeState, resolveOperation
} from '../src/save.js';

const EXPECTED_PHASES = Object.freeze([
  'restore-power',
  'mount-loader',
  'clear-route',
  'escort-convoy',
  'retrieve-core',
  'carry-core',
  'matriarch',
  'extract'
]);

const distance = (first, second) => Math.hypot(
  (Number(first?.x) || 0) - (Number(second?.x) || 0),
  (Number(first?.y) || 0) - (Number(second?.y) || 0)
);

function createProductionCargoOptions(resumeState = null) {
  const campaign = CAMPAIGNS.find((entry) => entry.id === 'special-cargo-brutal');
  const world = WORLDS.find((entry) => entry.id === campaign.worldId);
  const vehicle = VEHICLES.find((entry) => entry.id === 'vehicle-007-p-5000-powered-work-loader');
  const missionLevel = buildMissionLevelV52({
    campaign,
    world,
    levelSeeds: LEVEL_SEEDS,
    templateId: campaign.templateId,
    variant: 1
  });
  return {
    seed: missionLevel.levelSeed.seed,
    campaign,
    world,
    levelSeed: missionLevel.levelSeed,
    missionLevel,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    vehicle,
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW,
    difficulty: 'standard',
    ...(resumeState ? { resumeState } : {})
  };
}

function walkRightUntil(engine, predicate, maxFrames = 360) {
  engine.keys.add('KeyD');
  try {
    for (let frame = 0; frame < maxFrames && !predicate(); frame += 1) engine.update(1 / 60);
  } finally {
    engine.keys.delete('KeyD');
  }
  return predicate();
}

class CargoHarnessBaseEngine {
  constructor({ events = [] } = {}) {
    this.events = events;
    this.onEvent = (event) => this.events.push(event);
    this.keys = new Set();
    this.images = new Map();
    this.audio = { ui() {}, alarm() {}, shot() {} };
  }

  start(options = {}) {
    this.campaign = options.campaign || { id: 'special-cargo-brutal', name: 'CARGO BRUTAL', objective: 'secure the power loader' };
    this.player = {
      id: 'player', x: 120, y: 840, w: 44, h: 90, alive: true, inVehicle: false,
      facing: 1, actionClock: 0, health: 100, armor: 50
    };
    this.coop = { id: 'coop', x: 70, y: 840, w: 44, h: 90, alive: true, inVehicle: false, coop: true };
    this.coopEnabled = false;
    this.mission = {
      state: 'active', phase: 'restore-power', failureReason: null, elapsed: 0,
      objectives: { power: false, route: false, boss: false, archive: false, extract: false },
      rewards: { credits: 900, salvage: 12 }
    };
    this.powerNode = { id: 'power', x: 420, y: 840, w: 64, h: 70, active: false };
    this.vehicle = {
      id: options.vehicle?.id || 'vehicle-007-p-5000-powered-work-loader',
      name: 'P-5000 Powered Work Loader', x: 780, y: 780, w: 150, h: 150,
      active: true, occupied: false, driver: null, passengers: [], destroyed: false,
      maxHull: 500, hull: 500, fuel: 100, facing: 1
    };
    this.objective = { id: 'cargo-extraction', x: 5680, y: 840, w: 84, h: 90, complete: false };
    this.enemies = [
      { id: 'cargo-drone-1', name: 'Cargo Drone', x: 1800, y: 840, w: 60, h: 90, alive: true, health: 80, maxHealth: 80, isBoss: false },
      { id: 'base-boss', name: 'Hive Alpha', x: 4500, y: 760, w: 120, h: 170, alive: true, health: 500, maxHealth: 500, isBoss: true }
    ];
    this.covers = [];
    this.particles = [];
    this.camera = { x: 0, y: 0 };
    this.animationTime = 0;
    return this.getSnapshot();
  }

  update(delta = 0) {
    this.mission.elapsed += Math.max(0, Number(delta) || 0);
    this.animationTime += Math.max(0, Number(delta) || 0);
  }

  interact(actor = this.player) {
    if (!actor?.alive || this.mission.state !== 'active') return false;
    if (!this.powerNode.active && distance(actor, this.powerNode) < 180) {
      this.powerNode.active = true;
      this.mission.objectives.power = true;
      this.onEvent({ type: 'objective-action', action: 'power-restored' });
      return true;
    }
    if (distance(actor.inVehicle ? this.vehicle : actor, this.objective) < 180 && !this.missingExtractionRequirement()) {
      return this.completeMission(actor);
    }
    if (distance(actor, this.vehicle) < 240) return this.toggleVehicle(actor);
    return false;
  }

  toggleVehicle(actor = this.player) {
    if (!actor?.alive || !this.vehicle.active || this.vehicle.destroyed) return false;
    if (actor.inVehicle) {
      actor.inVehicle = false;
      this.vehicle.driver = null;
      this.vehicle.occupied = false;
    } else {
      actor.inVehicle = true;
      this.vehicle.driver = actor;
      this.vehicle.occupied = true;
    }
    this.onEvent({ type: 'vehicle', occupied: this.vehicle.occupied });
    return true;
  }

  fire() { return false; }
  updateVehicleDriver() { return false; }
  updateEnemy() {}
  drawEnemy() {}
  drawWorld() {}
  drawHud() {}
  phaseLabel() { return this.mission.phase; }
  objectiveProgressText() { return ''; }
  getInteractionPrompt() { return ''; }
  missingExtractionRequirement() { return ''; }
  setInteractionAnimation() {}
  locked(requirement) { this.onEvent({ type: 'locked', requirement }); return false; }

  damageVehicle(amount, source = 'enemy') {
    if (!this.vehicle.active || this.vehicle.destroyed) return 0;
    this.vehicle.hull = Math.max(0, this.vehicle.hull - Math.max(0, Number(amount) || 0));
    if (this.vehicle.hull === 0) {
      this.vehicle.destroyed = true;
      this.vehicle.occupied = false;
      this.vehicle.driver = null;
      this.player.inVehicle = false;
      this.onEvent({ type: 'vehicle-destroyed', source });
    }
    return amount;
  }

  defeatEnemy(enemy, owner = this.player) {
    if (!enemy?.alive) return false;
    enemy.alive = false;
    enemy.health = 0;
    if (enemy.isBoss) this.mission.objectives.boss = true;
    this.onEvent({ type: 'enemy-defeated', enemyId: enemy.id, boss: Boolean(enemy.isBoss), owner: owner?.id });
    return true;
  }

  applyEnemyDamage(enemy, amount, source = {}) {
    if (!enemy?.alive) return 0;
    enemy.health -= Math.max(0, Number(amount) || 0);
    if (enemy.health <= 0) this.defeatEnemy(enemy, source.owner || this.player);
    return amount;
  }

  createEnemy(profile = {}, index = 0, x = 0, y = 840, options = {}) {
    const enemy = {
      id: `${profile.id || 'cargo-wave'}-${index}-${this.enemies.length}`,
      name: profile.name || 'Cargo Wave Drone', x, y, w: 60, h: 90,
      alive: true, maxHealth: Number(profile.health) || 80, health: Number(profile.health) || 80,
      damage: Number(profile.damage) || 12, isBoss: Boolean(options.boss)
    };
    this.enemies.push(enemy);
    return enemy;
  }

  failMission(reason) {
    if (this.mission.state !== 'active') return false;
    this.mission.state = 'failed';
    this.mission.failureReason = String(reason || 'failed');
    this.onEvent({ type: 'mission-failed', reason: this.mission.failureReason });
    return true;
  }

  completeMission() {
    if (this.mission.state !== 'active') return false;
    this.mission.state = 'complete';
    this.mission.objectives.extract = true;
    this.objective.complete = true;
    this.onEvent({ type: 'mission-complete', rewards: this.mission.rewards });
    return true;
  }

  captureResumeState() {
    return {
      schema: 1,
      identity: { campaignId: this.campaign.id },
      mission: structuredClone(this.mission),
      vehicle: {
        id: this.vehicle.id, x: this.vehicle.x, y: this.vehicle.y, hull: this.vehicle.hull,
        destroyed: this.vehicle.destroyed, occupied: this.vehicle.occupied
      }
    };
  }

  applyResumeState(rawState) {
    if (!rawState || rawState.schema !== 1 || rawState.identity?.campaignId !== this.campaign.id) {
      return { applied: false, reason: 'identity-mismatch', restored: 0 };
    }
    if (rawState.mission) this.mission = structuredClone(rawState.mission);
    if (rawState.vehicle) Object.assign(this.vehicle, rawState.vehicle);
    return { applied: true, reason: 'restored', restored: 2 };
  }

  getGameplayReport() { return { missionState: this.mission.state }; }
  getSnapshot() { return { missionState: this.mission.state, missionPhase: this.mission.phase }; }
}

const CargoHarnessEngine = withCargoBrutalRuntimeV67(CargoHarnessBaseEngine);

function createEngine(events = []) {
  const engine = new CargoHarnessEngine({ events });
  engine.start({
    campaign: { id: 'special-cargo-brutal', name: 'CARGO BRUTAL', objective: 'secure the power loader' },
    vehicle: { id: 'vehicle-007-p-5000-powered-work-loader' },
    enemyCatalog: [{ id: 'cargo-drone', name: 'Cargo Drone', health: 75, damage: 11 }]
  });
  return engine;
}

function cargoState(engine) {
  return engine.cargoBrutalV67 || engine.cargoBrutal || engine.specialOperation?.cargoBrutalV67 || null;
}

function setActorAt(engine, target, { loader = false } = {}) {
  assert.ok(target && Number.isFinite(Number(target.x)), 'surface physique Cargo Brutal absente');
  if (loader) {
    engine.vehicle.x = Number(target.x);
    engine.vehicle.y = Number(target.y) || engine.vehicle.y;
  }
  engine.player.x = Number(target.x);
  engine.player.y = Number(target.y) || engine.player.y;
}

function physicalSurface(engine, key) {
  const state = cargoState(engine);
  const aliases = {
    obstacles: [engine.cargoObstaclesV67, state?.obstacles],
    convoy: [engine.cargoConvoyV67, state?.convoy],
    core: [engine.cargoCoreV67, state?.core],
    installNode: [engine.cargoCoreInstallV67, state?.installNode, state?.core?.installNode],
    matriarch: [engine.cargoMatriarchV67, state?.matriarch]
  };
  return aliases[key].find((entry) => entry != null) || null;
}

function interactCargo(engine, actor = engine.player) {
  return typeof engine.cargoBrutalInteractV67 === 'function'
    ? engine.cargoBrutalInteractV67(actor)
    : engine.interact(actor);
}

function mountLoader(engine) {
  setActorAt(engine, engine.powerNode);
  assert.equal(engine.interact(engine.player), true);
  assert.equal(cargoState(engine).powerRestored, true);
  setActorAt(engine, engine.vehicle);
  assert.equal(engine.toggleVehicle(engine.player), true);
  assert.equal(engine.player.inVehicle, true);
  assert.equal(cargoState(engine).loaderMounted, true);
}

function clearPhysicalRoute(engine) {
  const obstacles = physicalSurface(engine, 'obstacles');
  assert.ok(Array.isArray(obstacles) && obstacles.length >= 2);
  for (const obstacle of obstacles) {
    let attempts = 0;
    while (!obstacle.cleared && attempts < 8) {
      setActorAt(engine, obstacle, { loader: true });
      interactCargo(engine);
      attempts += 1;
    }
    assert.equal(obstacle.cleared, true, obstacle.id);
  }
  assert.equal(cargoState(engine).obstaclesCleared, cargoState(engine).obstacleTarget);
  assert.equal(cargoState(engine).phase, 'escort-convoy');
}

function finishConvoy(engine) {
  const convoy = physicalSurface(engine, 'convoy');
  assert.ok(convoy);
  setActorAt(engine, convoy, { loader: true });
  interactCargo(engine);
  assert.equal(cargoState(engine).convoy.active, true);
  for (let step = 0; step < 360 && !cargoState(engine).convoy.complete; step += 1) {
    for (const enemy of engine.enemies) if (!enemy.isBoss) enemy.alive = false;
    setActorAt(engine, cargoState(engine).convoy, { loader: true });
    engine.update(0.25);
  }
  assert.equal(cargoState(engine).convoy.complete, true);
  assert.equal(cargoState(engine).phase, 'retrieve-core');
}

test('les phases et l’état Cargo Brutal V67 sont explicites, sérialisables et assainis', () => {
  const phases = Array.isArray(CARGO_BRUTAL_PHASES_V67)
    ? [...CARGO_BRUTAL_PHASES_V67]
    : Object.values(CARGO_BRUTAL_PHASES_V67);
  assert.deepEqual(phases, EXPECTED_PHASES);

  const initial = createCargoBrutalStateV67();
  assert.equal(initial.schema, 67);
  assert.equal(initial.phase, 'restore-power');
  assert.equal(initial.powerRestored, false);
  assert.equal(initial.loaderMounted, false);
  assert.ok(initial.obstacleTarget >= 2);
  assert.equal(initial.obstaclesCleared, 0);
  assert.doesNotThrow(() => JSON.stringify(initial));

  const sanitized = sanitizeCargoBrutalStateV67({
    ...initial,
    phase: 'carry-core',
    powerRestored: true,
    loaderMounted: true,
    obstaclesCleared: 999,
    convoy: { ...initial.convoy, active: true, health: -50, progress: 9 },
    core: { ...initial.core, retrieved: true, carried: true }
  });
  assert.equal(sanitized.phase, 'carry-core');
  assert.equal(sanitized.obstaclesCleared, sanitized.obstacleTarget);
  assert.equal(sanitized.convoy.health, 0);
  assert.equal(sanitized.convoy.progress, 1);
  assert.equal(sanitized.core.retrieved, true);
  assert.equal(sanitizeCargoBrutalStateV67({ schema: 999 }).phase, 'restore-power');
});

test('Cargo Brutal se joue physiquement de la remise sous tension à l’extraction', () => {
  const events = [];
  const engine = createEngine(events);
  assert.ok(engine.isCargoBrutalV67());
  assert.ok(cargoState(engine));
  assert.equal(cargoState(engine).phase, 'restore-power');

  mountLoader(engine);
  assert.equal(cargoState(engine).phase, 'clear-route');
  clearPhysicalRoute(engine);
  finishConvoy(engine);
  cargoState(engine).convoy.health = 32;
  engine.syncCargoBrutalWorldV67();
  assert.equal(cargoState(engine).convoy.survivors, 1);
  assert.equal(engine.cargoSurvivorsV67.filter((survivor) => survivor.alive).length, 1);

  const core = physicalSurface(engine, 'core');
  setActorAt(engine, core, { loader: true });
  assert.equal(interactCargo(engine), true);
  assert.equal(cargoState(engine).core.retrieved, true);
  assert.equal(cargoState(engine).core.carried, true);
  assert.equal(cargoState(engine).phase, 'carry-core');

  const installNode = physicalSurface(engine, 'installNode');
  setActorAt(engine, installNode, { loader: true });
  assert.equal(interactCargo(engine), true);
  assert.equal(cargoState(engine).core.installed, true);
  assert.equal(cargoState(engine).matriarch.active, true);
  assert.equal(cargoState(engine).phase, 'matriarch');

  const matriarch = engine.enemies.find((enemy) => enemy.id === cargoState(engine).matriarch.id || enemy.isBoss);
  assert.ok(matriarch);
  for (let strike = 0; strike < 8 && matriarch.alive; strike += 1) {
    engine.applyEnemyDamage(matriarch, Math.max(1, matriarch.maxHealth), { owner: engine.player, kind: 'test' });
  }
  assert.equal(cargoState(engine).matriarch.defeated, true);
  assert.equal(cargoState(engine).phase, 'extract');

  setActorAt(engine, engine.objective, { loader: true });
  assert.equal(interactCargo(engine), true);
  assert.equal(engine.mission.state, 'complete');
  assert.equal(cargoState(engine).complete, true);
  const completion = events.find((event) => event.type === 'mission-complete');
  assert.ok(completion);
  assert.deepEqual(completion.rewards.strategicBonus, { credits: 300, alloy: 45 });
  assert.equal(completion.rewards.cargoBrutal, true);
  assert.equal(completion.rewards.survivorsExtracted, 1);
  assert.deepEqual(events.slice(-2).map((event) => (
    event.type === 'mission-complete' ? event.type : `${event.type}:${event.action || ''}`
  )), ['objective-action:cargo-complete', 'mission-complete']);
  assert.ok(events.filter((event) => event.type === 'objective-action').length >= 6);
});

test('la perte du P-5000 ou du convoi produit un véritable échec de mission', () => {
  const loaderEvents = [];
  const loaderFailure = createEngine(loaderEvents);
  mountLoader(loaderFailure);
  loaderFailure.damageVehicle(99999, 'cargo-matriarch');
  assert.equal(loaderFailure.vehicle.destroyed, true);
  assert.equal(loaderFailure.mission.state, 'failed');
  assert.match(loaderFailure.mission.failureReason, /loader|p-5000|chargeur/i);
  assert.ok(loaderEvents.some((event) => event.type === 'mission-failed'));

  const convoyEvents = [];
  const convoyFailure = createEngine(convoyEvents);
  mountLoader(convoyFailure);
  clearPhysicalRoute(convoyFailure);
  const convoy = physicalSurface(convoyFailure, 'convoy');
  setActorAt(convoyFailure, convoy, { loader: true });
  interactCargo(convoyFailure);
  cargoState(convoyFailure).convoy.health = 0;
  convoyFailure.update(0.016);
  assert.equal(convoyFailure.mission.state, 'failed');
  assert.match(convoyFailure.mission.failureReason, /convoi|survivant/i);
  assert.ok(convoyEvents.some((event) => event.type === 'mission-failed'));
});

test('la sauvegarde/reprise conserve la phase, le convoi, les obstacles et le noyau sans état fantôme', () => {
  const source = createEngine();
  mountLoader(source);
  clearPhysicalRoute(source);
  const sourceState = cargoState(source);
  sourceState.convoy.active = true;
  sourceState.convoy.health = 61;
  sourceState.convoy.progress = 0.47;
  sourceState.core.retrieved = false;

  const resumeState = source.captureResumeState();
  assert.doesNotThrow(() => JSON.stringify(resumeState));
  const cargoResume = resumeState.cargoBrutalV67 || resumeState.specialOperation?.cargoBrutalV67;
  assert.equal(cargoResume?.schema, 67);
  assert.equal(cargoResume?.phase, 'escort-convoy');

  const restored = createEngine();
  const result = restored.applyResumeState(structuredClone(resumeState));
  assert.equal(result.applied, true);
  const restoredState = cargoState(restored);
  assert.equal(restoredState.phase, 'escort-convoy');
  assert.equal(restoredState.obstaclesCleared, restoredState.obstacleTarget);
  assert.equal(restoredState.convoy.active, true);
  assert.equal(restoredState.convoy.health, 61);
  assert.equal(restoredState.convoy.progress, 0.47);
  assert.equal(restoredState.core.retrieved, false);
  assert.equal(restored.vehicle.destroyed, false);
});

test('le bonus Cargo Brutal est versé en crédits et alliage une seule fois par resolveOperation', () => {
  const save = createDefaultSave(1);
  const campaign = CAMPAIGNS.find((entry) => entry.id === 'special-cargo-brutal');
  const world = WORLDS.find((entry) => entry.id === campaign.worldId);
  assert.ok(campaign && world);
  if (!save.galaxy.unlockedWorldIds.includes(world.id)) save.galaxy.unlockedWorldIds.push(world.id);
  const deployment = beginOperation(save, campaign, world);
  assert.equal(deployment.ok, true);
  deployment.operation.specialOperationId = 'cargo-brutal';
  deployment.operation.issuedVehicleId = 'vehicle-007-p-5000-powered-work-loader';
  const activeReloaded = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  assert.equal(activeReloaded.strategy.currentOperation.specialOperationId, 'cargo-brutal');
  assert.equal(activeReloaded.strategy.currentOperation.issuedVehicleId, 'vehicle-007-p-5000-powered-work-loader');
  const baseReward = structuredClone(deployment.operation.reward);
  const before = { ...save.galaxy.resources };
  const rewards = { cargoBrutal: true, strategicBonus: { credits: 300, alloy: 45 } };

  const outcome = resolveOperation(save, { success: true, kills: 0, rewards });
  assert.equal(outcome.ok, true);
  assert.deepEqual(outcome.specialOperationBonus, { credits: 300, alloy: 45 });
  assert.equal(save.galaxy.resources.credits, before.credits + baseReward.credits + 300);
  assert.equal(save.galaxy.resources.alloy, before.alloy + baseReward.alloy + 45);
  assert.deepEqual(save.strategy.lastOperation.specialOperationBonus, { credits: 300, alloy: 45 });

  const reloaded = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  assert.equal(reloaded.galaxy.resources.credits, save.galaxy.resources.credits);
  assert.equal(reloaded.galaxy.resources.alloy, save.galaxy.resources.alloy);
  assert.deepEqual(reloaded.strategy.lastOperation.specialOperationBonus, { credits: 300, alloy: 45 });
  assert.equal(reloaded.strategy.lastOperation.specialOperationId, 'cargo-brutal');
  assert.equal(reloaded.strategy.lastOperation.issuedVehicleId, 'vehicle-007-p-5000-powered-work-loader');

  const afterFirstResolution = { ...save.galaxy.resources };
  const duplicate = resolveOperation(save, { success: true, kills: 0, rewards });
  assert.deepEqual(duplicate, { ok: false, reason: 'no-operation' });
  assert.deepEqual(save.galaxy.resources, afterFirstResolution);
});

test('le vrai moteur recrée une vague Cargo avec les mêmes IDs et états logiques, re-ancrée au niveau', () => {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  class MockImage {
    constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
    set src(value) { this.currentSrc = value; }
  }
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try {
    const campaign = CAMPAIGNS.find((entry) => entry.id === 'special-cargo-brutal');
    const world = WORLDS.find((entry) => entry.id === campaign.worldId);
    const vehicle = VEHICLES.find((entry) => entry.id === 'vehicle-007-p-5000-powered-work-loader');
    const createOptions = () => {
      const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId: campaign.templateId, variant: 1 });
      return {
        seed: missionLevel.levelSeed.seed,
        campaign,
        world,
        levelSeed: missionLevel.levelSeed,
        missionLevel,
        weapon: WEAPONS[0],
        enemyCatalog: ENEMIES,
        vehicle,
        equipment: EQUIPMENT.slice(0, 8),
        crew: CREW,
        difficulty: 'standard'
      };
    };
    const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
    const source = new ProductionGameEngine(canvas, { onEvent() {} });
    source.start(createOptions());
    const rosterStart = source.enemies.length;
    assert.equal(source.spawnCargoWaveV67(25, 'biology-audit'), 25);
    const rosterWave = source.enemies.filter((enemy) => enemy.waveTag === 'cargo:biology-audit');
    assert.equal(rosterWave.length, 25);
    assert.ok(rosterWave.every((enemy) => ['xenomorph', 'hybrid'].includes(enemy.biology)), 'une vague Cargo ne doit pas injecter humains, synthétiques ou pathogènes');
    source.enemies.splice(rosterStart);
    Object.assign(source.cargoBrutalV67, {
      phase: 'escort-convoy',
      powerRestored: true,
      loaderMounted: true,
      obstaclesCleared: source.cargoBrutalV67.obstacleTarget
    });
    for (const obstacle of source.cargoBrutalV67.obstacles) Object.assign(obstacle, { hits: obstacle.requiredHits, cleared: true });
    Object.assign(source.cargoBrutalV67.convoy, { active: true, complete: false, progress: 0.24, wavesSpawned: 1 });
    assert.equal(source.spawnCargoWaveV67(3, 'convoy-1'), 3);
    const sourceWave = source.enemies.filter((enemy) => enemy.waveTag === 'cargo:convoy-1');
    assert.equal(sourceWave.length, 3);
    Object.assign(sourceWave[1], {
      facing: -1,
      alert: true,
      health: Math.max(1, sourceWave[1].maxHealth - 17),
      attackClock: 0.73,
      staggerClock: 0.18
    });

    const resumeState = structuredClone(source.captureResumeState());
    assert.equal(resumeState.specialOperation.cargoWaveEnemiesV67.length, 3);
    const profile = createDefaultSave(2);
    if (!profile.galaxy.unlockedWorldIds.includes(world.id)) profile.galaxy.unlockedWorldIds.push(world.id);
    assert.equal(beginOperation(profile, campaign, world).ok, true);
    assert.equal(recordOperationResumeState(profile, resumeState), true);
    const persistedResume = migrateSave(JSON.parse(JSON.stringify(profile)), 2).strategy.currentOperation.resumeState;
    const expected = new Map(persistedResume.specialOperation.cargoWaveEnemiesV67.map((enemy) => [enemy.id, enemy]));
    const restoredEvents = [];
    const restored = new ProductionGameEngine(canvas, { onEvent: (event) => restoredEvents.push(event) });
    restored.start({ ...createOptions(), resumeState: persistedResume });
    assert.equal(restored.lastResumeResult.applied, true);
    const restoredWave = restored.enemies.filter((enemy) => enemy.waveTag === 'cargo:convoy-1');
    assert.deepEqual(restoredWave.map((enemy) => enemy.id).sort(), [...expected.keys()].sort());
    assert.equal(new Set(restoredWave.map((enemy) => enemy.id)).size, restoredWave.length);
    for (const enemy of restoredWave) {
      const saved = expected.get(enemy.id);
      assert.equal(enemy.alive, saved.alive, `${enemy.id}:alive`);
      assert.equal(enemy.health, saved.health, `${enemy.id}:health`);
      assert.equal(enemy.maxHealth, saved.maxHealth, `${enemy.id}:maxHealth`);
      assert.equal(enemy.x, saved.x, `${enemy.id}:x`);
      const surface = restored.platforms.find((platform) => platform.id === enemy.cargoSurfaceIdV67);
      assert.ok(surface, `${enemy.id}:surface`);
      assert.equal(enemy.y + enemy.h, surface.y, `${enemy.id}:grounded-y`);
      assert.equal(enemy.facing, saved.facing, `${enemy.id}:facing`);
      assert.equal(enemy.alert, saved.alert, `${enemy.id}:alert`);
      assert.equal(enemy.waveTag, saved.waveTag, `${enemy.id}:waveTag`);
    }
    assert.equal(restored.cargoBrutalV67.convoy.wavesSpawned, 1);
    const emittedBefore = restoredEvents.filter((event) => event.type === 'objective-wave').length;
    restored.updateCargoConvoyV67(0);
    assert.equal(restoredEvents.filter((event) => event.type === 'objective-wave').length, emittedBefore);
    assert.equal(restored.cargoBrutalV67.convoy.wavesSpawned, 1);
  } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
});

test('le vrai moteur de production démarre Cargo Brutal à pied avec le P-5000 fourni', () => {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  class MockImage {
    constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
    set src(value) { this.currentSrc = value; }
  }
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try {
    const events = [];
    const campaign = CAMPAIGNS.find((entry) => entry.id === 'special-cargo-brutal');
    const world = WORLDS.find((entry) => entry.id === campaign.worldId);
    const vehicle = VEHICLES.find((entry) => entry.id === 'vehicle-007-p-5000-powered-work-loader');
    const missionLevel = buildMissionLevelV52({
      campaign,
      world,
      levelSeeds: LEVEL_SEEDS,
      templateId: campaign.templateId,
      variant: 1
    });
    const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
    const engine = new ProductionGameEngine(canvas, { onEvent: (event) => events.push(event) });
    const snapshot = engine.start({
      seed: missionLevel.levelSeed.seed,
      campaign,
      world,
      levelSeed: missionLevel.levelSeed,
      missionLevel,
      weapon: WEAPONS[0],
      enemyCatalog: ENEMIES,
      vehicle,
      equipment: EQUIPMENT.slice(0, 8),
      crew: CREW,
      difficulty: 'standard'
    });
    assert.equal(snapshot.cargoBrutalV67.phase, 'restore-power');
    assert.equal(snapshot.cargoBrutalV67.insertion, 'on-foot');
    assert.equal(engine.player.inVehicle, false);
    assert.equal(engine.vehicle.id, vehicle.id);
    assert.equal(engine.vehicle.missionIssued, true);
    assert.equal(engine.cargoMatriarchV67.cargoDormantV67, true);
    assert.equal(engine.applyEnemyDamage(engine.cargoMatriarchV67, 50, { owner: engine.player }), 0);

    Object.assign(engine.player, { x: engine.powerNode.x, y: engine.powerNode.y });
    assert.equal(engine.interact(engine.player), true);
    assert.equal(engine.cargoBrutalV67.phase, 'mount-loader');
    Object.assign(engine.player, { x: engine.vehicle.x, y: engine.vehicle.y });
    assert.equal(engine.toggleVehicle(engine.player), true);
    engine.updateVehicleAccessTransitionV59(2);
    engine.vehicle.accessSecureClock = 0;
    engine.update(0.016);
    assert.equal(engine.player.inVehicle, true);
    assert.equal(engine.cargoBrutalV67.phase, 'clear-route');
    assert.ok(events.some((event) => event.type === 'special-operation-started' && event.insertion === 'on-foot'));
  } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
});

test('Cargo Brutal ancre chaque acteur et prop au pont physique et le panneau est atteignable sans téléportation', () => {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  class MockImage {
    constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
    set src(value) { this.currentSrc = value; }
  }
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try {
    const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
    const engine = new ProductionGameEngine(canvas, { onEvent() {} });
    engine.start(createProductionCargoOptions());
    const state = engine.cargoBrutalV67;
    const groundedEntities = [
      ['panneau puissance', engine.powerNode],
      ['P-5000', engine.vehicle],
      ...state.obstacles.map((obstacle) => [obstacle.id, obstacle]),
      ['convoi', state.convoy],
      ['noyau', state.core],
      ['coupleur', state.installNode],
      ['matriarche', engine.cargoMatriarchV67],
      ['extraction', engine.objective],
      ...engine.cargoSurvivorsV67.map((survivor) => [survivor.id, survivor])
    ];
    for (const [label, entity] of groundedEntities) {
      const surface = engine.platforms.find((platform) => platform.id === entity.cargoSurfaceIdV67);
      assert.ok(surface, `${label}: surface physique manquante`);
      assert.equal(entity.y + entity.h, surface.y, `${label}: pieds détachés du pont`);
      assert.ok(entity.y >= 0 && entity.y + entity.h <= engine.missionLevelBounds.height, `${label}: hors niveau`);
    }

    const insertionX = engine.player.x;
    const reached = walkRightUntil(engine, () => /RÉTABLIR LA PUISSANCE/.test(engine.getInteractionPrompt(engine.player)));
    assert.equal(reached, true, 'le panneau doit être accessible en marchant depuis le spawn');
    assert.ok(engine.player.x > insertionX, 'le joueur doit réellement parcourir le niveau');
    assert.equal(engine.interact(engine.player), true);
    assert.equal(engine.cargoBrutalV67.phase, 'mount-loader');
    assert.equal(walkRightUntil(engine, () => /MONTER DANS LE P-5000/.test(engine.getInteractionPrompt(engine.player))), true);
    assert.equal(engine.interact(engine.player), true);
    for (let frame = 0; frame < 300 && !engine.player.inVehicle; frame += 1) engine.update(1 / 60);
    assert.equal(engine.player.inVehicle, true);

    const firstObstacle = engine.cargoBrutalV67.obstacles[0];
    assert.equal(walkRightUntil(engine, () => /DÉPLACER/.test(engine.getInteractionPrompt(engine.player)), 900), true);
    for (let strike = 0; strike < firstObstacle.requiredHits; strike += 1) assert.equal(engine.interact(engine.player), true);
    assert.equal(firstObstacle.cleared, true);

    const bulkhead = engine.doors.find((door) => door.id === 'cargo-bulkhead');
    assert.ok(bulkhead);
    assert.equal(walkRightUntil(engine, () => !bulkhead.open && /ACTIONNER LA PORTE DE SOUTE/.test(engine.getInteractionPrompt(engine.player)), 900), true);
    assert.equal(engine.player.inVehicle, true, 'la porte doit rester actionnable depuis le P-5000');
    assert.equal(engine.interact(engine.player), true);
    assert.equal(bulkhead.open, true);
    assert.equal(walkRightUntil(engine, () => engine.vehicle.x > bulkhead.x + bulkhead.w + 12, 900), true, 'le P-5000 doit franchir le bulkhead après ouverture');
  } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
});

test('le P-5000 garde exactement sa pose après trois captures et reprises ProductionGameEngine', () => {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  class MockImage {
    constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
    set src(value) { this.currentSrc = value; }
  }
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try {
    const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
    let engine = new ProductionGameEngine(canvas, { onEvent() {} });
    engine.start(createProductionCargoOptions());

    assert.equal(walkRightUntil(engine, () => /RÉTABLIR LA PUISSANCE/.test(engine.getInteractionPrompt(engine.player))), true);
    assert.equal(engine.interact(engine.player), true);
    assert.equal(walkRightUntil(engine, () => /MONTER DANS LE P-5000/.test(engine.getInteractionPrompt(engine.player))), true);
    assert.equal(engine.interact(engine.player), true);
    for (let frame = 0; frame < 300 && !engine.player.inVehicle; frame += 1) engine.update(1 / 60);
    assert.equal(engine.player.inVehicle, true, 'la séquence physique de montée doit aboutir');

    const loaderStartX = engine.vehicle.x;
    engine.keys.add('KeyD');
    for (let frame = 0; frame < 600 && engine.vehicle.x <= loaderStartX + 80; frame += 1) engine.update(1 / 60);
    engine.keys.delete('KeyD');
    assert.ok(engine.vehicle.x > loaderStartX + 40, 'le loader doit avoir roulé avant la sauvegarde');

    let resumeState = structuredClone(engine.captureResumeState());
    let expectedPose = { x: engine.vehicle.x, y: engine.vehicle.y };
    for (let cycle = 1; cycle <= 3; cycle += 1) {
      const restored = new ProductionGameEngine(canvas, { onEvent() {} });
      restored.start(createProductionCargoOptions(resumeState));
      assert.equal(restored.lastResumeResult.applied, true, `reprise ${cycle} non appliquée`);
      assert.equal(restored.vehicle.x, expectedPose.x, `dérive x après reprise ${cycle}`);
      assert.equal(restored.vehicle.y, expectedPose.y, `dérive y après reprise ${cycle}`);
      const surface = restored.platforms.find((platform) => platform.id === restored.vehicle.cargoSurfaceIdV67);
      assert.ok(surface, `reprise ${cycle}: surface loader manquante`);
      assert.equal(restored.vehicle.y + restored.vehicle.h, surface.y, `reprise ${cycle}: loader détaché du pont`);
      resumeState = structuredClone(restored.captureResumeState());
      expectedPose = { x: restored.vehicle.x, y: restored.vehicle.y };
      engine = restored;
    }
    assert.equal(engine.cargoBrutalV67.phase, 'clear-route');
  } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
});

test('la Matriarche reprend sa phase avec les mêmes dégâts et la même vitesse sans cumul', () => {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  class MockImage {
    constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
    set src(value) { this.currentSrc = value; }
  }
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try {
    const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
    const source = new ProductionGameEngine(canvas, { onEvent() {} });
    source.start(createProductionCargoOptions());
    source.cargoBrutalV67.matriarch.active = true;
    source.cargoBrutalV67.matriarch.phase = 1;
    source.cargoMatriarchV67.cargoDormantV67 = false;
    source.cargoMatriarchV67.health = source.cargoMatriarchV67.maxHealth * 0.5;
    source.updateCargoMatriarchPhasesV67();
    assert.equal(source.cargoBrutalV67.matriarch.phase, 2);
    const expectedStats = {
      damage: source.cargoMatriarchV67.damage,
      speed: source.cargoMatriarchV67.speed
    };

    let resumeState = structuredClone(source.captureResumeState());
    for (let cycle = 1; cycle <= 3; cycle += 1) {
      const restored = new ProductionGameEngine(canvas, { onEvent() {} });
      restored.start(createProductionCargoOptions(resumeState));
      assert.equal(restored.cargoBrutalV67.matriarch.phase, 2);
      assert.equal(restored.cargoMatriarchV67.damage, expectedStats.damage, `dégâts après reprise ${cycle}`);
      assert.equal(restored.cargoMatriarchV67.speed, expectedStats.speed, `vitesse après reprise ${cycle}`);
      resumeState = structuredClone(restored.captureResumeState());
    }
  } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
});
