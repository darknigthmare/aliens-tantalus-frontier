import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, CREW, ENEMIES, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';

class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
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

test('le danger électrique v55 applique dégâts, impulsion et verrouillage des contrôles dans le GameEngine final', () => withBrowserRuntime(() => {
  const world = WORLDS[0];
  const campaign = CAMPAIGNS.find((entry) => entry.worldId === world.id) || CAMPAIGNS[0];
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical' });
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener() {} };
  const engine = new GameEngine(canvas, { onEvent() {} });
  engine.start({
    seed: missionLevel.levelSeed.seed,
    campaign,
    world,
    levelSeed: missionLevel.levelSeed,
    missionLevel,
    vehicle: VEHICLES[0],
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES.slice(0, 16),
    crew: CREW.slice(0, 4)
  });

  const hazard = engine.hazards.find((entry) => entry.kind === 'electrical');
  assert.ok(hazard, 'hazard électrique compilé dans le niveau jouable');
  hazard.active = true;
  Object.assign(engine.player, {
    x: hazard.x + 12,
    y: hazard.y - engine.player.h + 12,
    armor: 0,
    health: 100,
    vx: 140,
    vy: 0,
    grounded: true,
    hazardClock: 0,
    hazardKind: null,
    actionClock: 0
  });

  engine.applyHazards(engine.player);
  assert.equal(engine.player.health, 100 - hazard.damage);
  assert.equal(engine.player.hazardKind, 'electrical');
  assert.equal(engine.player.hazardClock, 1.25);
  assert.equal(engine.player.actionClock, 1.25);
  assert.equal(engine.player.vx, 0);
  assert.equal(engine.player.vy, -80);

  const before = { x: engine.player.x, bullets: engine.bullets.length };
  engine.keys.add('KeyD');
  engine.keys.add('Space');
  engine.keys.add('KeyF');
  engine.updatePlayer(engine.player, 0.016, {
    left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF'
  });
  assert.equal(engine.player.x, before.x, 'le choc bloque le déplacement horizontal');
  assert.equal(engine.bullets.length, before.bullets, 'le choc bloque le tir');
  assert.ok(engine.player.hazardClock > 1.2, 'le stun persiste au-delà du tick courant');
}));
