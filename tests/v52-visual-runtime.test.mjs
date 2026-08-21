import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { CAMPAIGNS, CREW, ENEMIES, LEVEL_SEEDS, WEAPONS, WORLDS } from '../src/content.js';

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
  try { return run(); } finally { Object.assign(globalThis, previous); }
}

test('les objectifs v52 sont rendus par des props et jamais par un grand rectangle prototype', () => withBrowserMocks(() => {
  const campaign = { ...CAMPAIGNS[0], id: 'visual-objective-v52', worldId: WORLDS[0].id, objective: 'rescue survivors' };
  const world = WORLDS[0];
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId: 'colony-multiroute' });
  const engine = new GameEngine(
    { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} },
    { onEvent: () => {} }
  );
  engine.start({
    seed: missionLevel.levelSeed.seed,
    campaign,
    world,
    levelSeed: missionLevel.levelSeed,
    missionLevel,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    crew: CREW.slice(0, 4)
  });

  const node = engine.objectiveNodes[0];
  const props = [];
  const fills = [];
  engine.drawWorldProp = (...args) => props.push(args);
  const ctx = {
    save() {}, restore() {}, translate() {}, rotate() {},
    fillRect(x, y, width, height) { fills.push({ x, y, width, height }); },
    strokeRect() {},
    set globalAlpha(value) { this.alpha = value; },
    set shadowColor(value) { this.shadow = value; },
    set shadowBlur(value) { this.blur = value; },
    set fillStyle(value) { this.fill = value; },
    set strokeStyle(value) { this.stroke = value; }
  };

  engine.drawMissionObjectiveProp(ctx, node);

  assert.equal(props.length, 1);
  assert.ok(['crates', 'breakable', 'cover', 'lamp'].includes(props[0][1]));
  assert.ok(fills.length > 0);
  assert.ok(fills.every((entry) => Math.abs(entry.width) <= 12 && Math.abs(entry.height) <= 12));
}));
