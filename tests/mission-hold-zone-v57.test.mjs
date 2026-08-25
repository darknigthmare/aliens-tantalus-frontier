import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine as ProductionCoreEngine } from '../src/game-production-core.js';
import { withV52MissionRuntime } from '../src/game-v52-runtime.js';
import { withV52LevelRuntime } from '../src/game-v52-level-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
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
  const campaign = {
    ...(CAMPAIGNS[7] || CAMPAIGNS[0]),
    id: 'v57-planet-hold-zone',
    worldId: world.id,
    objective: 'recover black-box data'
  };
  return buildMissionLevelV52({
    campaign,
    world,
    levelSeeds: LEVEL_SEEDS,
    templateId: 'planet-exterior',
    variant: 4
  });
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

function placeAtExtraction(engine) {
  const target = engine.objective;
  Object.assign(engine.player, {
    x: target.x + target.w / 2 - engine.player.w / 2,
    y: target.y + target.h - engine.player.h,
    vx: 0,
    vy: 0,
    grounded: true,
    inVehicle: false,
    alive: true
  });
}

function placeOutsideHoldZone(engine) {
  const spawn = engine.missionLevelRuntime.anchors.spawn;
  Object.assign(engine.player, {
    x: spawn.x - engine.player.w / 2,
    y: spawn.y - engine.player.h,
    vx: 0,
    vy: 0,
    grounded: true,
    inVehicle: false,
    alive: true
  });
}

function startHoldout(engine, plan) {
  engine.start(optionsFor(plan));
  placeAtExtraction(engine);
  assert.equal(engine.triggerMissionLevelEvent('planet-beacon-defense', 'v57-test'), true);
  const timer = engine.missionLevelTimers.get('extraction');
  assert.ok(timer, 'le timer extraction existe');
  return timer;
}

test('le timer avance près de l’extraction, se met en pause hors zone puis reprend au retour', () => withBrowserMocks(() => {
  const plan = missionPlan();
  const events = [];
  const engine = createEngine(events);
  const timer = startHoldout(engine, plan);

  const initial = timer.remaining;
  engine.updateMissionLevelTimers(1.25);
  assert.equal(timer.state, 'running');
  assert.ok(Math.abs(timer.remaining - (initial - 1.25)) < 0.001, 'le temps est consommé dans la zone de défense');

  placeOutsideHoldZone(engine);
  const pausedAt = timer.remaining;
  engine.updateMissionLevelTimers(3.5);
  assert.equal(timer.state, 'paused', 'sortir de la zone met explicitement le holdout en pause');
  assert.ok(Math.abs(timer.remaining - pausedAt) < 0.001, 'aucune seconde ne progresse hors zone');
  assert.ok(events.some((event) => event.type === 'mission-timer-paused' && event.timerId === 'extraction'), 'la pause est observable par l’application');

  placeAtExtraction(engine);
  engine.updateMissionLevelTimers(0.75);
  assert.equal(timer.state, 'running', 'revenir dans la zone reprend le holdout');
  assert.ok(Math.abs(timer.remaining - (pausedAt - 0.75)) < 0.001, 'la reprise continue le même décompte');
  assert.ok(events.some((event) => event.type === 'mission-timer-resumed' && event.timerId === 'extraction'), 'la reprise est observable par l’application');
}));

test('attendre hors zone ne peut jamais terminer le holdout ni libérer l’extraction', () => withBrowserMocks(() => {
  const plan = missionPlan();
  const engine = createEngine();
  const timer = startHoldout(engine, plan);
  engine.updateMissionLevelTimers(0.5);

  placeOutsideHoldZone(engine);
  engine.updateMissionLevelTimers(0);
  const pausedAt = timer.remaining;
  engine.updateMissionLevelTimers(timer.duration + 5);
  assert.equal(timer.state, 'paused');
  assert.ok(Math.abs(timer.remaining - pausedAt) < 0.001);
  assert.equal(engine.missionLevelExtractionUnlocked, false, 'le sas extraction reste verrouillé hors zone');

  placeAtExtraction(engine);
  engine.updateMissionLevelTimers(timer.remaining + 0.01);
  assert.equal(timer.state, 'complete');
  assert.equal(timer.remaining, 0);
  assert.equal(engine.missionLevelExtractionUnlocked, true, 'seule la défense tenue dans la zone libère l’extraction');
}));

test('une sauvegarde conserve exactement un holdout en pause et sa reprise spatiale', () => withBrowserMocks(() => {
  const plan = missionPlan();
  const first = createEngine();
  const timer = startHoldout(first, plan);
  first.updateMissionLevelTimers(2.25);
  placeOutsideHoldZone(first);
  first.updateMissionLevelTimers(0);
  assert.equal(timer.state, 'paused');
  const pausedAt = timer.remaining;

  const resumeState = first.captureResumeState();
  const savedTimer = resumeState.missionLevel.timers.find((entry) => entry.id === 'extraction');
  assert.equal(savedTimer.state, 'paused', 'l’état paused est sérialisé');
  assert.ok(Math.abs(savedTimer.remaining - pausedAt) < 0.001, 'le temps restant est sérialisé sans dérive');

  const resumedEvents = [];
  const resumed = createEngine(resumedEvents);
  resumed.start(optionsFor(plan, { resumeState }));
  const restored = resumed.missionLevelTimers.get('extraction');
  assert.equal(restored.state, 'paused', 'la reprise ne transforme pas paused en running');
  assert.ok(Math.abs(restored.remaining - pausedAt) < 0.001, 'la reprise conserve le temps restant exact');
  assert.equal(resumedEvents.some((event) => event.type === 'mission-timer-started'), false, 'la vague n’est pas redémarrée par la sauvegarde');

  placeOutsideHoldZone(resumed);
  resumed.updateMissionLevelTimers(4);
  assert.equal(restored.state, 'paused');
  assert.ok(Math.abs(restored.remaining - pausedAt) < 0.001, 'le timer restauré reste figé hors zone');

  placeAtExtraction(resumed);
  resumed.updateMissionLevelTimers(1);
  assert.equal(restored.state, 'running');
  assert.ok(Math.abs(restored.remaining - (pausedAt - 1)) < 0.001, 'le timer restauré reprend au même point dans la zone');
}));
