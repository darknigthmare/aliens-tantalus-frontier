import test from 'node:test';
import assert from 'node:assert/strict';

import { GameEngine } from '../src/game-production-runtime.js';
import {
  CAMPAIGNS,
  CREW,
  ENEMIES,
  EQUIPMENT,
  LEVEL_SEEDS,
  NEURO_XENO_PROFILES,
  VEHICLES,
  WEAPONS,
  WORLDS
} from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1600;
    this.naturalHeight = 900;
  }

  set src(value) { this.currentSrc = value; }
}

function withBrowserRuntime(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    performance: globalThis.performance
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.performance = { now: () => 1000 };
  try { return run(); } finally { Object.assign(globalThis, previous); }
}

function buildScenario({ neuroProfile = null } = {}) {
  const world = WORLDS[6] || WORLDS[0];
  const sourceCampaign = CAMPAIGNS.find((entry) => entry.worldId === world.id) || CAMPAIGNS[0];
  const campaign = {
    ...sourceCampaign,
    id: neuroProfile ? 'v57-neuro-xeno-visual' : 'v57-marine-visual',
    worldId: world.id,
    objective: 'board a drifting vessel'
  };
  const missionLevel = buildMissionLevelV52({
    campaign,
    world,
    levelSeeds: LEVEL_SEEDS,
    templateId: 'ship-interior-vertical',
    variant: 57
  });
  return {
    seed: missionLevel.levelSeed.seed,
    campaign,
    world,
    levelSeed: missionLevel.levelSeed,
    missionLevel,
    neuroProfile,
    vehicle: VEHICLES.find((entry) => entry.family === 'ground') || VEHICLES[0],
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES.slice(0, 24),
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW.slice(0, 4),
    difficulty: 'standard'
  };
}

function createEngine() {
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener() {} };
  return new GameEngine(canvas, { onEvent() {} });
}

function exposePlayerTo(engine, hazard, overrides = {}) {
  Object.assign(engine.player, {
    alive: true,
    inVehicle: false,
    x: 100,
    y: 100,
    w: 42,
    h: 92,
    armor: 0,
    health: 100,
    hazardClock: 0,
    hazardKind: null,
    actionClock: 0,
    vx: 0,
    vy: 0,
    ...overrides
  });
  engine.hazards = [{
    id: `v57-${hazard.kind}`,
    active: true,
    x: 90,
    y: 170,
    w: 100,
    h: 30,
    damage: 0,
    ...hazard
  }];
  engine.applyHazards(engine.player);
}

test('V57 garde darkness non physique, electrical étourdissant et flood ralentissant', () => withBrowserRuntime(() => {
  const engine = createEngine();
  engine.start(buildScenario());

  exposePlayerTo(engine, { kind: 'darkness', damage: 0 }, { vx: 135, vy: 37 });
  assert.equal(engine.player.health, 100, 'darkness ne doit pas infliger de dégâts');
  assert.equal(engine.player.vx, 135, 'darkness ne doit pas repousser horizontalement');
  assert.equal(engine.player.vy, 37, 'darkness ne doit pas faire rebondir verticalement');

  exposePlayerTo(engine, { kind: 'electrical', damage: 8, stun: 1.25 }, { vx: 140, vy: 0 });
  assert.equal(engine.player.hazardKind, 'electrical');
  assert.equal(engine.player.health, 92);
  assert.ok(engine.player.hazardClock >= 1.25, 'electrical doit conserver sa durée de stun');
  assert.ok(engine.player.actionClock >= 1.25, 'electrical doit verrouiller temporairement les actions');
  assert.equal(engine.player.vx, 0, 'electrical interrompt le mouvement horizontal');

  exposePlayerTo(engine, { kind: 'flood', damage: 0 }, { vx: 200, vy: 17 });
  assert.equal(engine.player.hazardKind, 'flood');
  assert.ok(engine.environmentStatus.slowFactor < 1, 'flood active le coefficient de traînée horizontal');
  assert.equal(engine.player.vy, 17, 'flood ne déclenche aucun rebond vertical');
  const speedBeforeFloodTick = Math.abs(engine.player.vx);
  engine.updatePlayer(engine.player, 0.016, {
    left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF'
  });
  assert.ok(Math.abs(engine.player.vx) < speedBeforeFloodTick, 'la traînée flood ralentit réellement le déplacement horizontal');
}));

test('V57 fixe explicitement la forme visuelle du joueur pour Neuro-Xeno et marine', () => withBrowserRuntime(() => {
  const profile = NEURO_XENO_PROFILES.find((entry) => entry.playerClassCompatible);
  assert.ok(profile, 'le catalogue doit fournir un profil Neuro-Xeno jouable');

  const neuroEngine = createEngine();
  neuroEngine.start(buildScenario({ neuroProfile: profile }));
  assert.equal(neuroEngine.player.playerClass, 'neuro-xeno');
  assert.equal(neuroEngine.player.visualForm, 'xenomorph');

  const marineEngine = createEngine();
  marineEngine.start(buildScenario());
  assert.equal(marineEngine.player.playerClass, 'marine');
  assert.equal(marineEngine.player.visualForm, 'marine');
}));

test('V57 expose dans le snapshot chaque nom de zone à partir de son label auteur', () => withBrowserRuntime(() => {
  const options = buildScenario();
  const engine = createEngine();
  const snapshot = engine.start(options);
  const zones = snapshot.missionLevelRuntime?.zones || [];

  assert.equal(zones.length, options.missionLevel.biomeZones.length);
  for (const zone of zones) {
    const authored = options.missionLevel.biomeZones.find((entry) => entry.id === zone.id);
    assert.ok(authored, `zone runtime inconnue: ${zone.id}`);
    assert.equal(zone.name, authored.label, `${zone.id}: le nom doit refléter label`);
    assert.ok(zone.name.trim().length > 0, `${zone.id}: nom vide interdit`);
  }
}));
