import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameEngine as ProductionCoreEngine } from '../src/game-production-core.js';
import { withV52MissionRuntime } from '../src/game-v52-runtime.js';
import { MISSION_LEVEL_TIMER_PROFILES, withV52LevelRuntime } from '../src/game-v52-level-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { CAMPAIGNS, CREW, ENEMIES, EQUIPMENT, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';

const RuntimeEngine = withV52LevelRuntime(withV52MissionRuntime(ProductionCoreEngine));

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

function missionPlan() {
  const world = WORLDS[9] || WORLDS[0];
  const campaign = { ...CAMPAIGNS[7], id: 'v54-planet-holdout', worldId: world.id, objective: 'recover black-box data' };
  return buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId: 'planet-exterior', variant: 4 });
}

function optionsFor(plan, overrides = {}) {
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
    difficulty: 'standard',
    ...overrides
  };
}

function createEngine(events = []) {
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  return new RuntimeEngine(canvas, { onEvent: (event) => events.push(event) });
}

function hudContext(texts) {
  const gradient = { addColorStop() {} };
  const base = {
    save() {}, restore() {}, fillRect() {}, strokeRect() {}, beginPath() {}, arc() {}, stroke() {},
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    measureText: (text) => ({ width: String(text).length * 8 }),
    fillText: (text) => texts.push(String(text))
  };
  return new Proxy(base, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
}

test('la balise planétaire déclenche une vraie vague de holdout et verrouille l’extraction jusqu’à la fin', () => withBrowserMocks(() => {
  const plan = missionPlan();
  const events = [];
  const engine = createEngine(events);
  engine.start(optionsFor(plan));

  engine.mission.objectives.boss = true;
  const archive = engine.archiveTerminal;
  Object.assign(engine.player, { x: archive.x, y: archive.y, vx: 0, vy: 0 });
  assert.equal(engine.interact(engine.player), true, 'the player physically activates the evacuation beacon');

  const timer = engine.missionLevelTimers.get('extraction');
  const evacuationSpawn = engine.missionLevelSpawns.get('planet-evac-wave');
  assert.equal(timer.state, 'running');
  assert.equal(timer.duration, MISSION_LEVEL_TIMER_PROFILES.extraction.seconds.standard);
  assert.equal(evacuationSpawn.active, true);
  assert.ok(engine.enemies.some((enemy) => enemy.levelSpawnId === evacuationSpawn.id && enemy.alive), 'the timed defence owns a live enemy wave');
  assert.ok(events.some((event) => event.type === 'mission-timer-started' && event.timerId === 'extraction'));

  Object.assign(engine.mission.objectives, { power: true, route: true, boss: true, archive: true, extract: false });
  Object.assign(engine.player, { x: engine.objective.x, y: engine.objective.y, vx: 0, vy: 0 });
  assert.match(engine.missingExtractionRequirement(), /TENIR LA ZONE/);
  assert.equal(engine.interact(engine.player), false, 'extraction cannot skip the active defence');
  assert.ok(events.some((event) => event.type === 'locked' && /TENIR LA ZONE/.test(event.requirement)));

  const hudTexts = [];
  engine.drawHud(hudContext(hudTexts));
  assert.ok(hudTexts.some((text) => /NAVETTE D’EXTRACTION EN APPROCHE/.test(text)), 'the countdown is visible in the canvas HUD');

  for (const enemy of engine.enemies) enemy.alive = false;
  engine.updateMissionLevelTimers(timer.duration - 0.25);
  assert.equal(timer.state, 'running');
  engine.update(0.3);
  assert.equal(timer.state, 'complete');
  assert.equal(engine.missionLevelExtractionUnlocked, true);
  assert.equal(engine.missingExtractionRequirement(), '');
  assert.ok(events.some((event) => event.type === 'mission-timer-complete' && event.timerId === 'extraction'));

  Object.assign(engine.player, { x: engine.objective.x, y: engine.objective.y, vx: 0, vy: 0 });
  assert.equal(engine.interact(engine.player), true);
  assert.equal(engine.mission.state, 'complete');
  assert.ok(events.some((event) => event.type === 'mission-complete'));
}));

test('le temps restant est repris sans redémarrer la vague et les anciennes sauvegardes ne refont pas le holdout', () => withBrowserMocks(() => {
  const plan = missionPlan();
  const first = createEngine();
  first.start(optionsFor(plan, { difficulty: 'story' }));
  assert.equal(first.triggerMissionLevelEvent('planet-beacon-defense', 'test'), true);
  first.updateMissionLevelTimers(3.25);
  const before = first.missionLevelTimers.get('extraction');
  const resumeState = first.captureResumeState();
  assert.equal(resumeState.missionLevel.timers.length, 1);
  assert.doesNotThrow(() => JSON.stringify(resumeState));

  const resumedEvents = [];
  const resumed = createEngine(resumedEvents);
  resumed.start(optionsFor(plan, { difficulty: 'story', resumeState }));
  const restored = resumed.missionLevelTimers.get('extraction');
  assert.equal(restored.state, 'running');
  assert.equal(restored.duration, MISSION_LEVEL_TIMER_PROFILES.extraction.seconds.story);
  assert.ok(Math.abs(restored.remaining - before.remaining) < 0.001);
  assert.equal(resumedEvents.some((event) => event.type === 'mission-timer-started'), false, 'resume does not duplicate the defence start');

  resumed.updateMissionLevelTimers(restored.remaining + 0.01);
  assert.equal(restored.state, 'complete');
  assert.equal(resumed.captureResumeState().missionLevel.timers[0].state, 'complete');

  const damagedState = structuredClone(resumeState);
  damagedState.missionLevel.timers[0].duration = 'invalid';
  damagedState.missionLevel.timers[0].remaining = 'invalid';
  const hardened = createEngine();
  hardened.start(optionsFor(plan, { difficulty: 'story', resumeState: damagedState }));
  const hardenedTimer = hardened.missionLevelTimers.get('extraction');
  assert.equal(hardenedTimer.duration, MISSION_LEVEL_TIMER_PROFILES.extraction.seconds.story);
  assert.equal(hardenedTimer.remaining, hardenedTimer.duration);

  const legacyState = structuredClone(resumeState);
  delete legacyState.missionLevel.timers;
  const legacy = createEngine();
  legacy.start(optionsFor(plan, { difficulty: 'story', resumeState: legacyState }));
  assert.equal(legacy.missionLevelTimers.get('extraction').state, 'complete');
  assert.equal(legacy.missionLevelExtractionUnlocked, true, 'a pre-v54 save never forces a completed player to refarm the holdout');
}));

test('l’application persiste les deux transitions du timer dans l’opération active', () => {
  const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const gateStart = source.indexOf('const persistentEvents = new Set([');
  const persistentGate = source.slice(gateStart, source.indexOf('if (persistentEvents.has', gateStart));
  for (const eventType of ['mission-timer-started', 'mission-timer-complete']) {
    assert.match(source, new RegExp(`event\\.type === '${eventType}'`), `${eventType} owns a mission log transition`);
    assert.match(persistentGate, new RegExp(`'${eventType}'`), `${eventType} belongs to the persistent event gate`);
  }
});
