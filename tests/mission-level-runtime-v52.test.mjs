import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GameEngine as ProductionCoreEngine } from '../src/game-production-core.js';
import {
  MISSION_STRUCTURAL_PROP_FILES,
  getMissionSurfaceMetrics
} from '../src/game-v51-runtime.js';
import { MISSION_STRUCTURE_CROPS_V87 } from '../src/mission-structure-art-v87.js';
import { collectMissionDeckRunsV87, buildMissionSupportSpansV87 } from '../src/mission-structure-layout-v87.js';
import { withV52MissionRuntime } from '../src/game-v52-runtime.js';
import {
  MISSION_LAYER_COVER_CONTRACTS_V62,
  MISSION_LEVEL_LAYER_FILES_V52,
  MISSION_LEVEL_ZONE_LAYER_FILES_V56,
  MISSION_LEVEL_ZONE_LAYER_FILES_V58,
  computeMissionLayerCoverCropV62,
  resolveMissionLevelLayerFilesV56,
  withV52LevelRuntime
} from '../src/game-v52-level-runtime.js';
import {
  MISSION_LEVEL_TEMPLATES_V52,
  MISSION_TEMPLATE_IDS_V52,
  buildMissionLevelV52
} from '../src/mission-levels-v52.js';
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

function readPngHeader(assetPath) {
  const filePath = fileURLToPath(new URL(`..${assetPath}`, import.meta.url));
  const bytes = readFileSync(filePath);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bitDepth: bytes[24],
    colorType: bytes[25]
  };
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

test('V62 normalise uniquement les trois fallbacks Tantalus sur une toile 2:1 sans déformer les sources', () => {
  const farPath = MISSION_LEVEL_LAYER_FILES_V52['ship-interior-vertical'].far;
  const midPath = MISSION_LEVEL_LAYER_FILES_V52['ship-interior-vertical'].mid;
  const contract = MISSION_LAYER_COVER_CONTRACTS_V62[farPath];
  assert.equal(contract.targetAspect, 2);
  assert.equal(MISSION_LAYER_COVER_CONTRACTS_V62[midPath], contract);
  assert.equal(MISSION_LAYER_COVER_CONTRACTS_V62['/assets/openai/metroidvania/zones/ship-docking-far.png'], undefined);

  const farCrop = computeMissionLayerCoverCropV62({ naturalWidth: 1717, naturalHeight: 916 }, contract.targetAspect);
  const midCrop = computeMissionLayerCoverCropV62({ naturalWidth: 1774, naturalHeight: 887 }, contract.targetAspect);
  assert.deepEqual(
    { x: farCrop.sourceX, width: farCrop.sourceWidth, height: farCrop.sourceHeight },
    { x: 0, width: 1717, height: 858.5 }
  );
  assert.equal(farCrop.sourceY, 28.75);
  assert.deepEqual(midCrop, {
    sourceX: 0,
    sourceY: 0,
    sourceWidth: 1774,
    sourceHeight: 887,
    targetAspect: 2
  });

  withBrowserMocks(() => {
    const engine = createEngine();
    engine.camera = { x: 0, y: 0 };
    const context = recordingContext();
    const far = {
      complete: true,
      naturalWidth: 1717,
      naturalHeight: 916,
      missionCoverContractV62: contract
    };
    engine.drawMissionLevelCover(context, far, 0.075, 0.94, 1.08, 0);
    assert.ok(context.drawCalls.length >= 2);
    assert.ok(context.drawCalls.every((call) => call.length === 9));
    const first = context.drawCalls[0];
    assert.deepEqual(first.slice(1, 5), [0, 28.75, 1717, 858.5]);
    assert.equal(first[7], 1555.2);
    assert.equal(first[8], 777.6);
  });
});

test('les six zones vaisseau V56 restent isolées tandis que V58 branche les 12 zones suivantes', () => withBrowserMocks(() => {
  const templateId = 'ship-interior-vertical';
  const zoneId = 'ship-docking';
  const dedicatedZoneIds = [
    'ship-docking',
    'ship-cargo',
    'ship-engineering',
    'ship-habitation',
    'ship-command',
    'ship-extraction'
  ];
  const dedicated = MISSION_LEVEL_ZONE_LAYER_FILES_V56[templateId][zoneId];

  assert.deepEqual(Object.keys(MISSION_LEVEL_ZONE_LAYER_FILES_V56), [templateId]);
  assert.deepEqual(Object.keys(MISSION_LEVEL_ZONE_LAYER_FILES_V56[templateId]), dedicatedZoneIds);
  assert.deepEqual(resolveMissionLevelLayerFilesV56(templateId, zoneId), dedicated);
  assert.equal(resolveMissionLevelLayerFilesV56('unknown-template', zoneId), null);
  assert.equal(
    resolveMissionLevelLayerFilesV56('colony-multiroute', zoneId),
    MISSION_LEVEL_LAYER_FILES_V52['colony-multiroute'],
    'un id de zone appartenant au vaisseau ne crée pas de faux override colonie'
  );

  let fallbackZoneCount = 0;
  let dedicatedZoneCount = 0;
  for (const [candidateTemplateId, template] of Object.entries(MISSION_LEVEL_TEMPLATES_V52)) {
    for (const zone of template.zones) {
      const resolved = resolveMissionLevelLayerFilesV56(candidateTemplateId, zone.id);
      if (candidateTemplateId === templateId && dedicatedZoneIds.includes(zone.id)) {
        assert.equal(resolved, MISSION_LEVEL_ZONE_LAYER_FILES_V56[templateId][zone.id]);
        dedicatedZoneCount += 1;
      } else {
        assert.equal(resolved, MISSION_LEVEL_LAYER_FILES_V52[candidateTemplateId]);
        fallbackZoneCount += 1;
      }
    }
  }
  assert.equal(dedicatedZoneCount, 6);
  assert.equal(fallbackZoneCount, 12);

  for (const dedicatedZoneId of dedicatedZoneIds) {
    const zoneLayers = MISSION_LEVEL_ZONE_LAYER_FILES_V56[templateId][dedicatedZoneId];
    for (const [kind, assetPath] of Object.entries(zoneLayers)) {
      assert.equal(assetPath, `/assets/openai/metroidvania/zones/${dedicatedZoneId}-${kind}.png`);
      const png = readPngHeader(assetPath);
      assert.deepEqual([png.width, png.height, png.bitDepth], [1600, 900, 8]);
      assert.equal(png.colorType, kind === 'far' ? 2 : 6, `${dedicatedZoneId}:${kind}`);
    }
  }

  const campaign = { ...CAMPAIGNS[0], id: 'runtime-ship-docking-art', objective: 'board a drifting vessel', worldId: WORLDS[6].id };
  const plan = buildMissionLevelV52({
    campaign,
    world: WORLDS[6],
    levelSeeds: LEVEL_SEEDS,
    templateId,
    variant: 4
  });
  const engine = createEngine();
  const snapshot = engine.start(optionsFor(plan));
  assert.equal(snapshot.missionLevelRuntime.activeZoneId, zoneId);
  assert.deepEqual(snapshot.missionLevelRuntime.activeArtLayers, dedicated);

  const dedicatedImages = {};
  for (const [kind, assetPath] of Object.entries(dedicated)) {
    const image = engine.images.get(`level:${templateId}:zone:${zoneId}:${kind}`);
    assert.equal(image?.currentSrc, assetPath);
    assert.equal(engine.missionLevelLayerImage(kind), image);
    dedicatedImages[kind] = image;
  }
  const dedicatedContext = recordingContext();
  engine.drawBackdrop(dedicatedContext);
  engine.drawForeground(dedicatedContext);
  for (const image of Object.values(dedicatedImages)) {
    assert.ok(dedicatedContext.drawCalls.some((call) => call[0] === image));
  }

  for (const additionalZoneId of dedicatedZoneIds.slice(1)) {
    engine.missionLevelVisualState.activeZoneId = additionalZoneId;
    const additionalLayers = MISSION_LEVEL_ZONE_LAYER_FILES_V56[templateId][additionalZoneId];
    assert.equal(resolveMissionLevelLayerFilesV56(templateId, additionalZoneId), additionalLayers);
    assert.deepEqual(engine.getMissionLevelSnapshot().activeArtLayers, additionalLayers);
    const additionalContext = recordingContext();
    engine.drawBackdrop(additionalContext);
    engine.drawForeground(additionalContext);
    for (const [kind, assetPath] of Object.entries(additionalLayers)) {
      const image = engine.images.get(`level:${templateId}:zone:${additionalZoneId}:${kind}`);
      assert.equal(image?.currentSrc, assetPath);
      assert.equal(engine.missionLevelLayerImage(kind), image);
      assert.ok(additionalContext.drawCalls.some((call) => call[0] === image));
    }
  }

  const fallbackTemplateId = 'colony-multiroute';
  const fallbackCampaign = {
    ...CAMPAIGNS[0],
    id: 'runtime-colony-fallback-art',
    objective: 'cross a hostile colony',
    worldId: WORLDS[0].id
  };
  const fallbackPlan = buildMissionLevelV52({
    campaign: fallbackCampaign,
    world: WORLDS[0],
    levelSeeds: LEVEL_SEEDS,
    templateId: fallbackTemplateId,
    variant: 5
  });
  const fallbackEngine = createEngine();
  const fallbackSnapshot = fallbackEngine.start(optionsFor(fallbackPlan));
  const colonyZoneId = fallbackPlan.biomeZones[0].id;
  const colonyLayers = MISSION_LEVEL_ZONE_LAYER_FILES_V58[fallbackTemplateId][colonyZoneId];
  assert.equal(fallbackSnapshot.missionLevelRuntime.activeZoneId, colonyZoneId);
  assert.deepEqual(
    fallbackSnapshot.missionLevelRuntime.activeArtLayers,
    colonyLayers
  );
  const fallbackContext = recordingContext();
  fallbackEngine.drawBackdrop(fallbackContext);
  fallbackEngine.drawForeground(fallbackContext);
  for (const kind of ['far', 'mid', 'foreground']) {
    const fallback = fallbackEngine.images.get(`level:${fallbackTemplateId}:zone:${colonyZoneId}:${kind}`);
    assert.equal(fallbackEngine.missionLevelLayerImage(kind), fallback);
    assert.ok(fallbackContext.drawCalls.some((call) => call[0] === fallback));
  }
}));

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
  const atlas = engine.images.get('missionDoorStatesV58');
  Object.assign(atlas, { naturalWidth: 2048, naturalHeight: 2048 });
  const door = engine.doors[0];
  door.progress = 0;
  const bounds = engine.getDoorRenderState(door, { open: false });
  assert.ok(bounds.w > door.w * 3, 'the old 44px collider did not cover the 168px bitmap');
  assert.equal(bounds.h, door.h + 28);

  const ctx = recordingContext();
  engine.drawDoor(ctx, door);
  const draw = ctx.drawCalls.find((call) => call[0] === atlas);
  assert.ok(draw);
  assert.deepEqual(draw.slice(1, 5), [bounds.source.x, bounds.source.y, bounds.source.w, bounds.source.h]);
  assert.deepEqual(draw.slice(5), [bounds.x, bounds.y, bounds.w, bounds.h]);

  engine.walls = [];
  engine.covers = [];
  const previousX = bounds.x - engine.player.w - 2;
  Object.assign(engine.player, { x: bounds.x - engine.player.w + 3, y: bounds.y + bounds.h - engine.player.h, vx: 120 });
  engine.resolveHorizontal(engine.player, previousX);
  assert.equal(engine.player.x, bounds.x - engine.player.w);
}));

test('V87 le haut du module recadré partage exactement la pose, la collision et le rendu des sols et plateformes', () => withBrowserMocks(() => {
  const campaign = { ...CAMPAIGNS[0], id: 'runtime-surface-contract', objective: 'board a drifting vessel', worldId: WORLDS[6].id };
  const plan = buildMissionLevelV52({ campaign, world: WORLDS[6], levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical' });
  const engine = createEngine();
  engine.start(optionsFor(plan));

  const platform = { x: 520, y: 704, w: 320, h: 24, art: 'catwalk' };
  const metrics = getMissionSurfaceMetrics(platform);
  assert.equal(metrics.surfaceOffset, 0, 'le tablier propre commence sur le collider, sans garde-corps flottant');
  assert.equal(metrics.renderY + metrics.surfaceOffset, metrics.surfaceY);
  assert.equal(metrics.renderHeight, platform.h);

  const platformContext = recordingContext();
  engine.drawPlatform(platformContext, platform);
  const platformDraw = platformContext.drawCalls.find((call) => call[0] === engine.images.get('catwalk'));
  assert.ok(platformDraw);
  assert.equal(platformDraw.length, 9, 'source crop required; drawing the entire historical sheet is forbidden');
  const catwalkCrop = MISSION_STRUCTURE_CROPS_V87.catwalkDeck;
  assert.deepEqual(platformDraw.slice(1, 5), [catwalkCrop.x, catwalkCrop.y, catwalkCrop.w, catwalkCrop.h]);
  assert.equal(platformDraw[6], metrics.surfaceY);
  assert.equal(platformDraw[8], metrics.renderHeight);

  const actor = { x: platform.x + 40, y: metrics.surfaceY - 82, w: 42, h: 92, vy: 180, grounded: false };
  engine.platforms = [platform];
  engine.resolveVertical(actor, metrics.surfaceY - 5);
  assert.equal(actor.y + actor.h, metrics.surfaceY);
  assert.equal(actor.y + actor.h, platformDraw[6]);
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
  assert.equal(floorDraw.length, 9);
  const floorCrop = MISSION_STRUCTURE_CROPS_V87.floorPanel;
  assert.deepEqual(floorDraw.slice(1, 5), [floorCrop.x, floorCrop.y, floorCrop.w, floorCrop.h]);
  assert.equal(floorDraw[6], floorMetrics.surfaceY);
  assert.equal(floorDraw[8], floorMetrics.renderHeight);
}));

test('V87 une reprise avec cinq pixels de décalage ancien rejoint le pont corrigé sans perdre son état', () => withBrowserMocks(() => {
  const controls = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF', interact: 'KeyE', reload: 'KeyR' };
  for (const templateId of ['ship-interior-vertical', 'colony-multiroute']) {
    const plan = buildMissionLevelV52({ campaign: { ...CAMPAIGNS[0], id: `legacy-deck-resume-${templateId}` }, world: WORLDS[0], levelSeeds: LEVEL_SEEDS, templateId, variant: 4 });
    const node = plan.graph.nodes.find(entry => entry.id === (templateId === 'ship-interior-vertical' ? 'ship-dock-high' : 'colony-gate-high'));
    for (const offset of [-5, 0, 5]) {
      const engine = createEngine();
      engine.start(optionsFor(plan));
      const saved = engine.captureResumeState();
      Object.assign(saved.player, { x: node.x - engine.player.w / 2, y: node.y - engine.player.h + offset, ammo: 7, health: 73 });
      saved.missionLevel.doors[0].open = true;
      saved.missionLevel.doors[0].progress = 1;
      const result = engine.applyResumeState(saved);
      assert.equal(result.applied, true);
      assert.equal(result.missionLevelRestored, true);
      assert.equal(engine.missionLevelRuntime.signature, saved.missionLevel.signature);
      assert.equal(engine.player.y + engine.player.h, node.y + offset);
      const oldY = engine.player.y;
      for (let tick = 0; tick < 20; tick++) engine.updatePlayer(engine.player, 1 / 60, controls);
      assert.equal(engine.player.y + engine.player.h, node.y, `${templateId}:${offset}`);
      assert.ok(Math.abs(engine.player.y - oldY) <= 5);
      assert.equal(engine.player.grounded, true);
      assert.equal(engine.player.health, 73);
      assert.equal(engine.player.ammo, 7);
      assert.equal(engine.doors[0].open, true);
    }
  }
}));

test('V87 un vrai ascenseur Frontier Forge reste mobile, séparé des ponts et dessiné une seule fois', () => withBrowserMocks(() => {
  const plan = buildMissionLevelV52({ campaign: CAMPAIGNS[0], world: WORLDS[0], levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical' });
  const editorProject = {
    schema: 1, kind: 'mission', size: [32, 18],
    tiles: [
      { position: '4:15', type: 'floor' }, { position: '4:8', type: 'platform' },
      { position: '4:12', type: 'lift' }, { position: '2:14', type: 'spawn' },
      { position: '10:14', type: 'objective' }
    ]
  };
  const engine = createEngine();
  engine.start({ ...optionsFor(plan), editorProject });
  assert.equal(engine.editorMode, true);
  assert.equal(engine.lifts.length, 1);
  const lift = engine.lifts[0];
  assert.equal(lift.kind, 'lift');
  assert.ok(engine.platforms.includes(lift), 'moving collider and lift must share their live record');
  const drawn = [];
  const drawPlatform = engine.drawPlatform.bind(engine);
  engine.drawPlatform = (ctx, platform) => { drawn.push({ id: platform.id, y: platform.y }); return drawPlatform(ctx, platform); };
  const check = () => {
    assert.ok(!collectMissionDeckRunsV87(engine.platforms).some(platform => platform.id === lift.id));
    assert.ok(!buildMissionSupportSpansV87(engine.platforms).some(span => span.upperId === lift.id || span.lowerId === lift.id));
    drawn.length = 0;
    engine.drawWorld(recordingContext());
    assert.deepEqual(drawn.filter(platform => platform.id === lift.id), [{ id: lift.id, y: lift.y }]);
  };
  check();
  const beforeY = lift.y;
  engine.animationTime = 1;
  engine.updateLifts(1 / 60);
  assert.notEqual(lift.y, beforeY);
  check();
}));

test('un occupant de véhicule ne subit pas une chute fantôme hors des limites de mission', () => withBrowserMocks(() => {
  const campaign = { ...CAMPAIGNS[0], id: 'runtime-vehicle-bounds', worldId: WORLDS[0].id };
  const plan = buildMissionLevelV52({
    campaign,
    world: WORLDS[0],
    levelSeeds: LEVEL_SEEDS,
    templateId: 'colony-multiroute',
    variant: 2
  });
  const engine = createEngine();
  engine.start(optionsFor(plan));
  const actor = engine.player;
  const before = {
    x: actor.x,
    y: engine.missionLevelBounds.voidY + 240,
    health: actor.health
  };
  Object.assign(actor, { inVehicle: true, x: before.x, y: before.y });
  let damageCalls = 0;
  const damagePlayer = engine.damagePlayer.bind(engine);
  engine.damagePlayer = (...args) => {
    damageCalls += 1;
    return damagePlayer(...args);
  };

  assert.equal(engine.enforceMissionLevelActorBounds(actor), false);
  assert.deepEqual({ x: actor.x, y: actor.y, health: actor.health }, before);
  assert.equal(damageCalls, 0);
}));

test('une reprise de base refusée ne restaure aucun état de niveau même si sa signature de plan correspond', () => withBrowserMocks(() => {
  const campaign = { ...CAMPAIGNS[0], id: 'runtime-rejected-resume', worldId: WORLDS[0].id };
  const plan = buildMissionLevelV52({ campaign, world: WORLDS[0], levelSeeds: LEVEL_SEEDS, templateId: 'colony-multiroute', variant: 2 });
  const engine = createEngine();
  engine.start(optionsFor(plan));
  const original = engine.captureResumeState();
  const forged = structuredClone(original);
  forged.schema = -99;
  assert.equal(forged.missionLevel.signature, engine.missionLevelRuntime.signature);
  for (const door of forged.missionLevel.doors) Object.assign(door, { open: !door.open, levelLocked: !door.levelLocked, progress: 0.75 });
  for (const hazard of forged.missionLevel.hazards) hazard.active = !hazard.active;
  for (const event of forged.missionLevel.events) Object.assign(event, { triggered: !event.triggered, triggerCount: 999 });
  for (const spawn of forged.missionLevel.spawns) spawn.active = !spawn.active;
  forged.missionLevel.visualState.activeZoneId = 'invalid-import-zone';
  forged.missionLevel.telemetry.eventsTriggered = 999;
  const result = engine.applyResumeState(forged);
  assert.equal(result.applied, false);
  assert.equal(result.missionLevelRestored, false);
  assert.equal(result.missionLevelReason, 'base-resume-rejected');
  assert.deepEqual(engine.captureResumeState().missionLevel, original.missionLevel);
}));

test('une mission sans réseau de conduits ne rend pas son joueur invulnérable par égalité undefined', () => withBrowserMocks(() => {
  const engine = createEngine();
  const plan = buildMissionLevelV52({ campaign: CAMPAIGNS[0], world: WORLDS[0], levelSeeds: LEVEL_SEEDS, templateId: 'colony-multiroute' });
  engine.start(optionsFor(plan));
  engine.missionVentNetworkV62 = null;
  Object.assign(engine.player, { health: 100, armor: 0, ventTransit: null, inVehicle: false, alive: true });
  engine.damagePlayer(engine.player, 20, { bypassCover: true });
  assert.ok(engine.player.health < 100);
  const health = engine.player.health;
  engine.missionVentNetworkV62 = { id: 'real-vent-network' };
  engine.player.ventTransit = { networkId: 'real-vent-network' };
  engine.damagePlayer(engine.player, 20, { bypassCover: true });
  assert.equal(engine.player.health, health, 'seul un vrai transit protège des tirs extérieurs');
}));

test('le runtime conserve le volume royal, trouve son arène ouverte et refuse un ascenseur humanoïde', () => withBrowserMocks(() => {
  for (const templateId of MISSION_TEMPLATE_IDS_V52) {
    const engine = createEngine();
    const plan = buildMissionLevelV52({ campaign: CAMPAIGNS[0], world: WORLDS[0], levelSeeds: LEVEL_SEEDS, templateId });
    engine.start(optionsFor(plan));
    const boss = engine.enemies.find((enemy) => enemy.isBoss) || engine.enemies[0];
    Object.assign(boss, { isBoss: true, alive: true, w: 336, h: 268.28125 });
    engine.compileMissionLevelActors(plan);
    assert.equal(boss.largeActorPlacementV72.valid, true, templateId);
    assert.equal(boss.w, 336);
    assert.equal(boss.h, 268.28125);
    const before = { x: boss.x, y: boss.y };
    const surface = engine.missionLevelSurfaceFor(boss);
    assert.ok(surface);
    assert.equal(engine.advanceEnemyMissionNavigation(boss, engine.player, surface, { ...surface, y: surface.y + 140 }, 0.25), false);
    assert.deepEqual({ x: boss.x, y: boss.y }, before);
  }
}));
