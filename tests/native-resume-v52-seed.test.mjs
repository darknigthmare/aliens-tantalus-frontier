import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import {
  CAMPAIGNS, CREW, ENEMIES, EQUIPMENT, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS
} from '../src/content.js';
import { sanitizeOperationResumeState } from '../src/save.js';

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

function createEngine() {
  return new GameEngine(
    { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} },
    { onEvent: () => {} }
  );
}

test('un seed v52 32 bits survit à la sauvegarde native et restaure niveau et escouade', () => withBrowserMocks(() => {
  const campaign = { ...CAMPAIGNS[0], id: 'resume-v52-high-seed', worldId: WORLDS[0].id };
  const world = WORLDS[0];
  const compiled = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, variant: 52 });
  const levelSeed = { ...compiled.levelSeed, seed: 0xf1234567 };
  const missionLevel = { ...compiled, levelSeed };
  const options = {
    seed: levelSeed.seed,
    campaign,
    world,
    levelSeed,
    missionLevel,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    vehicle: VEHICLES.find((entry) => entry.family === 'ground') || VEHICLES[0],
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW.slice(0, 4),
    difficulty: 'standard'
  };

  const first = createEngine();
  first.start(options);
  first.player.health = 77;
  first.squadActors[0].health = 31;
  first.setCheckpoint('power', 1440, 720);
  const nativeState = first.captureResumeState();
  const sanitized = sanitizeOperationResumeState(nativeState);

  assert.equal(nativeState.identity.seed, 0xf1234567);
  assert.equal(sanitized.identity.seed, 0xf1234567);

  const resumed = createEngine();
  resumed.start({ ...options, resumeState: sanitized });

  assert.equal(resumed.lastResumeResult.applied, true);
  assert.notEqual(resumed.lastResumeResult.reason, 'identity-mismatch');
  assert.equal(resumed.lastResumeResult.squadRestored, first.squadActors.length);
  assert.equal(resumed.player.health, 77);
  assert.equal(resumed.squadActors[0].health, 31);
  assert.equal(resumed.checkpoint.id, 'power');
  assert.equal(resumed.captureResumeState().missionLevel.signature, missionLevel.signature);
}));
