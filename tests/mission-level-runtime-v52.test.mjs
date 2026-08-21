import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine as ProductionCoreEngine } from '../src/game-production-core.js';
import { withV52MissionRuntime } from '../src/game-v52-runtime.js';
import { MISSION_LEVEL_LAYER_FILES_V52, withV52LevelRuntime } from '../src/game-v52-level-runtime.js';
import { MISSION_TEMPLATE_IDS_V52, buildMissionLevelV52 } from '../src/mission-levels-v52.js';
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

const V52RuntimeEngine = withV52LevelRuntime(withV52MissionRuntime(ProductionCoreEngine));

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1600;
    this.naturalHeight = 900;
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
  try { return run(); } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
}

function createEngine(events = []) {
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  return new V52RuntimeEngine(canvas, { onEvent: (event) => events.push(event) });
}

function optionsFor(plan) {
  return {
    seed: plan.levelSeed.seed,
    campaign: plan.campaign,
    world: plan.world,
    levelSeed: plan.levelSeed,
    missionLevel: plan,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    vehicle: VEHICLES.find((entry) => entry.family === 'ground') || VEHICLES[0],
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW,
    difficulty: 'standard'
  };
}

test('les trois templates sont réellement consommés par le runtime mission', () => withBrowserMocks(() => {
  const topologySignatures = new Set();
  const geometrySignatures = new Set();

  for (const [index, templateId] of MISSION_TEMPLATE_IDS_V52.entries()) {
    const campaign = { ...CAMPAIGNS[index], id: `runtime-${templateId}`, worldId: WORLDS[index].id };
    const world = WORLDS[index];
    const plan = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId, variant: index + 1 });
    const events = [];
    const engine = createEngine(events);
    const snapshot = engine.start(optionsFor(plan));
    const runtime = snapshot.missionLevelRuntime;

    assert.equal(runtime.templateId, templateId);
    assert.equal(runtime.signature, plan.signature);
    assert.equal(runtime.validation.valid, true);
    assert.equal(engine.missionLevelRuntime, plan);
    assert.equal(engine.routeRuntime.topologySignature, plan.topologySignature);
    assert.equal(runtime.routes.length, 3);
    assert.equal(runtime.zones.length, plan.biomeZones.length);
    assert.equal(engine.missionLevelEvents.size, plan.events.length);
    assert.equal(engine.missionLevelSpawns.size, plan.spawns.length);
    assert.equal(engine.hazards.length, plan.hazards.length);
    assert.ok(engine.platforms.length > plan.graph.nodes.length);
    assert.ok(engine.ladders.length > 0);
    assert.ok(engine.enemies.some((enemy) => enemy.levelSpawnId));
    assert.ok(events.some((event) => event.type === 'mission-level-ready' && event.templateId === templateId));

    const layerFiles = MISSION_LEVEL_LAYER_FILES_V52[templateId];
    assert.deepEqual(runtime.artLayers, layerFiles);
    for (const kind of ['far', 'mid', 'foreground']) {
      const image = engine.images.get(`level:${templateId}:${kind}`);
      assert.equal(image?.currentSrc, layerFiles[kind]);
    }

    const firstEvent = plan.events[0];
    const eventState = engine.missionLevelEvents.get(firstEvent.id);
    const before = eventState.triggerCount;
    const shouldTrigger = !eventState.triggered;
    assert.equal(engine.triggerMissionLevelEvent(firstEvent.id, 'test'), shouldTrigger);
    assert.equal(engine.triggerMissionLevelEvent(firstEvent.id, 'test-repeat'), false);
    assert.equal(engine.missionLevelEvents.get(firstEvent.id).triggerCount, before + (shouldTrigger ? 1 : 0));

    topologySignatures.add(runtime.topologySignature);
    geometrySignatures.add(JSON.stringify({
      platforms: engine.platforms.map((entry) => [entry.x, entry.y, entry.w, entry.h]),
      ladders: engine.ladders.map((entry) => [entry.x, entry.top, entry.bottom]),
      doors: engine.doors.map((entry) => [entry.x, entry.y, entry.w, entry.h]),
      vents: engine.vents.map((entry) => [entry.x, entry.y, entry.targetX, entry.targetY])
    }));
  }

  assert.equal(topologySignatures.size, 3);
  assert.equal(geometrySignatures.size, 3);
}));

test('les événements contextuels activent spawns, hazards et état visuel une seule fois', () => withBrowserMocks(() => {
  const campaign = { ...CAMPAIGNS[0], id: 'runtime-colony-events', worldId: WORLDS[0].id };
  const plan = buildMissionLevelV52({
    campaign,
    world: WORLDS[0],
    levelSeeds: LEVEL_SEEDS,
    templateId: 'colony-multiroute',
    variant: 3
  });
  const events = [];
  const engine = createEngine(events);
  engine.start(optionsFor(plan));

  const event = plan.events.find((entry) => entry.actions.some((action) => action.startsWith('spawn:')));
  const spawnId = event.actions.find((action) => action.startsWith('spawn:')).split(':')[1];
  const spawn = engine.missionLevelSpawns.get(spawnId);
  assert.ok(event && spawn);
  assert.equal(spawn.active, false);

  assert.equal(engine.triggerMissionLevelEvent(event.id, 'test'), true);
  assert.equal(engine.triggerMissionLevelEvent(event.id, 'test-repeat'), false);
  assert.equal(spawn.active, true);
  assert.equal(engine.missionLevelEvents.get(event.id).triggerCount, 1);
  assert.ok(engine.missionLevelTelemetry.events >= 1);
  assert.ok(events.some((entry) => entry.type === 'mission-level-event' && entry.eventId === event.id));
}));
