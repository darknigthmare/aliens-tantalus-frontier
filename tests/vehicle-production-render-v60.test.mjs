import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, CREW, ENEMIES, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import {
  resolveSpriteSheet,
  resolveVehicleAnimation,
  shouldFlipSprite
} from '../src/sprite-animation-runtime.js';
import { getEntitySpriteCollisionBounds } from '../src/game-v52-runtime.js';

const READY_VEHICLE_FAMILIES = Object.freeze([
  Object.freeze({ family: 'air', id: 'vehicle-009-ud-4l-cheyenne-dropship', sheetId: 'vehicle.ud4l-cheyenne-dropship.action' }),
  Object.freeze({ family: 'space', id: 'vehicle-013-uscss-nostromo-shuttle', sheetId: 'vehicle.narcissus-lifeboat.action.v56' }),
  Object.freeze({ family: 'rail', id: 'vehicle-017-seegson-maintenance-tram', sheetId: 'vehicle.seegson-maintenance-tram.action.v56' }),
  Object.freeze({ family: 'submersible', id: 'vehicle-019-submersible-survey-skiff', sheetId: 'vehicle.eva7c-pressure-pod.action.v56' }),
  Object.freeze({ family: 'maritime', id: 'vehicle-020-ceto-patrol-boat', sheetId: 'vehicle.ceto-patrol-boat.action.v56' }),
  Object.freeze({ family: 'exosuit', id: 'vehicle-007-p-5000-powered-work-loader', sheetId: 'vehicle.p5000-powered-work-loader.action' })
]);

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 1024;
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

function mockContext(trace) {
  const gradient = { addColorStop() {} };
  const base = {
    measureText: (value) => ({ width: String(value).length * 8 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    beginPath: () => { trace.canvasShapes += 1; },
    fill: () => { trace.canvasShapes += 1; },
    stroke: () => { trace.canvasShapes += 1; },
    fillRect: () => { trace.canvasShapes += 1; },
    strokeRect: () => { trace.canvasShapes += 1; },
    scale: (x, y) => trace.scales.push([x, y]),
    drawImage: (image) => trace.draws.push(image?.currentSrc || 'unknown')
  };
  return new Proxy(base, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
}

function buildEngine(vehicle, context) {
  const world = WORLDS[0];
  const campaign = CAMPAIGNS.find((entry) => entry.worldId === world.id) || CAMPAIGNS[0];
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical' });
  const canvas = { width: 1280, height: 720, getContext: () => context, addEventListener() {} };
  const engine = new GameEngine(canvas, { onEvent() {} });
  engine.start({
    seed: missionLevel.levelSeed.seed,
    campaign,
    world,
    levelSeed: missionLevel.levelSeed,
    missionLevel,
    vehicle,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES.slice(0, 24),
    crew: CREW.slice(0, 4)
  });
  return engine;
}

test('les familles de véhicules non-ground prêtes dessinent leur vraie plaque avec échelle et hitbox cohérentes', () => withBrowserRuntime(() => {
  for (const expected of READY_VEHICLE_FAMILIES) {
    const vehicle = VEHICLES.find((entry) => entry.id === expected.id);
    assert.ok(vehicle, `${expected.family}: entrée catalogue ${expected.id}`);
    assert.equal(vehicle.family, expected.family);

    const request = resolveVehicleAnimation(vehicle);
    assert.equal(request?.sheetId, expected.sheetId, `${expected.family}: resolver`);
    const sheet = resolveSpriteSheet(request.sheetId);
    assert.ok(sheet, `${expected.family}: plaque enregistrée`);

    const trace = { draws: [], scales: [], canvasShapes: 0 };
    const context = mockContext(trace);
    const engine = buildEngine(vehicle, context);
    engine.vehicle.facing = 1;
    engine.drawVehicle(context);

    assert.ok(trace.draws.includes(sheet.path), `${expected.family}: bitmap ${sheet.path}`);
    assert.equal(trace.canvasShapes, 0, `${expected.family}: aucun substitut Canvas`);
    assert.equal(engine.vehicle.spriteHitbox?.sheetId, sheet.id, `${expected.family}: hitbox liée à la plaque`);
    assert.equal(engine.vehicle.spriteHitbox?.flip, false, `${expected.family}: orientation source`);
    assert.equal(engine.vehicle.spriteHitbox?.sprite.width, sheet.renderWidth, `${expected.family}: largeur de rendu`);
    assert.equal(engine.vehicle.spriteHitbox?.sprite.height, sheet.renderHeight, `${expected.family}: hauteur de rendu`);
    assert.ok(engine.vehicle.spriteHitbox.world.w > 0 && engine.vehicle.spriteHitbox.world.h > 0, `${expected.family}: hitbox positive`);
    assert.equal(engine.vehicle.spritePivot.world.x, engine.vehicle.x + engine.vehicle.w / 2, `${expected.family}: pivot horizontal`);
    assert.equal(engine.vehicle.spritePivot.world.y, engine.vehicle.y + engine.vehicle.h, `${expected.family}: pivot au sol`);
    assert.deepEqual(getEntitySpriteCollisionBounds(engine.vehicle), engine.vehicle.spriteHitbox.world, `${expected.family}: collision visible active`);
  }
}));

test('le miroir des plaques véhicule suit le facing sans déplacer le pivot ni la hitbox', () => withBrowserRuntime(() => {
  const expected = READY_VEHICLE_FAMILIES.find((entry) => entry.family === 'air');
  const vehicle = VEHICLES.find((entry) => entry.id === expected.id);
  const sheet = resolveSpriteSheet(expected.sheetId);
  const trace = { draws: [], scales: [], canvasShapes: 0 };
  const context = mockContext(trace);
  const engine = buildEngine(vehicle, context);

  engine.vehicle.facing = -1;
  engine.drawVehicle(context);

  assert.equal(shouldFlipSprite(sheet, engine.vehicle.facing), true);
  assert.ok(trace.scales.some(([x, y]) => x === -1 && y === 1), 'le contexte applique un miroir horizontal');
  assert.equal(engine.vehicle.spriteHitbox.flip, true);
  assert.equal(engine.vehicle.spritePivot.world.x, engine.vehicle.x + engine.vehicle.w / 2);
  assert.equal(engine.vehicle.spritePivot.world.y, engine.vehicle.y + engine.vehicle.h);
  assert.ok(Number.isFinite(engine.vehicle.spriteHitbox.world.x));
  assert.ok(Number.isFinite(engine.vehicle.spriteHitbox.world.y));
}));
