import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine as ProductionCoreEngine } from '../src/game-production-core.js';
import {
  MISSION_STRUCTURAL_PROP_FILES,
  getMissionSurfaceMetrics
} from '../src/game-v51-runtime.js';
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

function recordingContext() {
  const gradient = { addColorStop() {} };
  const drawCalls = [];
  const base = {
    drawCalls,
    drawImage: (...args) => drawCalls.push(args),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    measureText: (text) => ({ width: String(text).length * 8 })
  };
  return new Proxy(base, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
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
    assert.ok(engine.covers.length > 0);
    assert.ok(engine.covers.every((cover) => engine.images.has(cover.art)), `unmapped cover art in ${templateId}`);

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

test('les trois props structurels sont chargés et dessinés dans le vaisseau', () => withBrowserMocks(() => {
  const campaign = { ...CAMPAIGNS[0], id: 'runtime-ship-props', objective: 'board a drifting vessel', worldId: WORLDS[6].id };
  const plan = buildMissionLevelV52({
    campaign,
    world: WORLDS[6],
    levelSeeds: LEVEL_SEEDS,
    templateId: 'ship-interior-vertical',
    variant: 2
  });
  const engine = createEngine();
  engine.start(optionsFor(plan));
  for (const [key, path] of Object.entries(MISSION_STRUCTURAL_PROP_FILES)) {
    assert.equal(engine.images.get(key)?.currentSrc, path, `${key} loaded by production runtime`);
  }

  const ctx = recordingContext();
  assert.ok(engine.drawCeilingCables(ctx) > 0);
  assert.ok(engine.drawMaintenancePipes(ctx) > 0);
  assert.ok(engine.drawForegroundPipes(ctx) > 0);
  for (const key of Object.keys(MISSION_STRUCTURAL_PROP_FILES)) {
    const image = engine.images.get(key);
    assert.ok(ctx.drawCalls.some((call) => call[0] === image), `${key} consumed by a draw call`);
  }
}));

test('les bounds de collision d’un sas fermé égalent ses bounds bitmap', () => withBrowserMocks(() => {
  const campaign = { ...CAMPAIGNS[0], id: 'runtime-ship-door-bounds', objective: 'board a drifting vessel', worldId: WORLDS[6].id };
  const plan = buildMissionLevelV52({ campaign, world: WORLDS[6], levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical' });
  const engine = createEngine();
  engine.start(optionsFor(plan));
  const locked = engine.images.get('lockedDoor');
  Object.assign(locked, { naturalWidth: 185, naturalHeight: 176 });
  const door = engine.doors[0];
  door.progress = 0;
  const bounds = engine.getDoorRenderState(door, { open: false });
  assert.ok(bounds.w > door.w * 3, 'the old 44px collider did not cover the 168px bitmap');
  assert.equal(bounds.h, door.h + 28);

  const ctx = recordingContext();
  engine.drawDoor(ctx, door);
  const draw = ctx.drawCalls.find((call) => call[0] === locked);
  assert.ok(draw);
  assert.deepEqual(draw.slice(1), [bounds.x, bounds.y, bounds.w, bounds.h]);

  engine.walls = [];
  engine.covers = [];
  const previousX = bounds.x - engine.player.w - 2;
  Object.assign(engine.player, { x: bounds.x - engine.player.w + 3, y: bounds.y + bounds.h - engine.player.h, vx: 120 });
  engine.resolveHorizontal(engine.player, previousX);
  assert.equal(engine.player.x, bounds.x - engine.player.w);
}));

test('surfaceOffset partage exactement la pose, la collision et le rendu des sols et plateformes', () => withBrowserMocks(() => {
  const campaign = { ...CAMPAIGNS[0], id: 'runtime-surface-contract', objective: 'board a drifting vessel', worldId: WORLDS[6].id };
  const plan = buildMissionLevelV52({ campaign, world: WORLDS[6], levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical' });
  const engine = createEngine();
  engine.start(optionsFor(plan));

  const platform = { x: 520, y: 704, w: 320, h: 24, art: 'catwalk' };
  const metrics = getMissionSurfaceMetrics(platform);
  assert.ok(metrics.surfaceOffset > 0, 'le catwalk possède une ligne de contact interne au bitmap');
  assert.equal(metrics.renderY + metrics.surfaceOffset, metrics.surfaceY);

  const platformContext = recordingContext();
  engine.drawPlatform(platformContext, platform);
  const platformDraw = platformContext.drawCalls.find((call) => call[0] === engine.images.get('catwalk'));
  assert.ok(platformDraw);
  assert.equal(platformDraw[2], metrics.renderY);
  assert.equal(platformDraw[4], metrics.renderHeight);

  const actor = { x: platform.x + 40, y: metrics.surfaceY - 82, w: 42, h: 92, vy: 180, grounded: false };
  engine.platforms = [platform];
  engine.resolveVertical(actor, metrics.surfaceY - 5);
  assert.equal(actor.y + actor.h, metrics.surfaceY);
  assert.equal(actor.y + actor.h, platformDraw[2] + metrics.surfaceOffset);
  assert.equal(actor.grounded, true);

  const floor = { x: -200, y: 930, w: 1800, h: 150, art: 'floor', floor: true };
  const floorMetrics = getMissionSurfaceMetrics(floor);
  assert.equal(floorMetrics.surfaceOffset, 0);
  assert.equal(floorMetrics.renderY, floorMetrics.surfaceY);
  engine.platforms = [floor];
  const floorContext = recordingContext();
  engine.drawFloors(floorContext);
  const floorDraw = floorContext.drawCalls.find((call) => call[0] === engine.images.get('floor'));
  assert.ok(floorDraw);
  assert.equal(floorDraw[2], floorMetrics.surfaceY);
  assert.equal(floorDraw[4], floorMetrics.renderHeight);
}));
