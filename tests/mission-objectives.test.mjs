import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine, buildObjectiveRuntime } from '../src/game-complete.js';
import { CAMPAIGNS, WORLDS, WEAPONS, ENEMIES, VEHICLES, LEVEL_SEEDS } from '../src/content.js';

const objectiveTexts = [
  'rescue survivors', 'restore atmospheric processing', 'seal the hive', 'recover black-box data',
  'escort a colony convoy', 'purge a reactor nest', 'board a drifting vessel', 'hold the extraction zone',
  'track an apex specimen', 'recover a synthetic', 'capture a live organism', 'destroy a neuro-link relay',
  'defend the colony', 'navigate the vent network', 'secure the power loader', 'escape the quarantine'
];

class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
  set src(value) { this.currentSrc = value; }
}

function withBrowserMocks(run) {
  const previous = { Image: globalThis.Image, addEventListener: globalThis.addEventListener, requestAnimationFrame: globalThis.requestAnimationFrame };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return run(); } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
}

function createEngine(objective, events = [], extra = {}) {
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const engine = new GameEngine(canvas, { onEvent: (event) => events.push(event) });
  const campaign = { ...CAMPAIGNS[1], id: `test-${objective.replaceAll(' ', '-')}`, objective, mode: extra.mode || 'FRONTIER', routes: extra.routes || 5 };
  engine.start({
    campaign,
    world: WORLDS[0],
    levelSeed: { ...LEVEL_SEEDS[0], objective, routes: extra.routes || 5, width: extra.width || 6, height: extra.height || 4 },
    weapon: WEAPONS[4],
    enemyCatalog: ENEMIES.slice(0, 52),
    vehicle: VEHICLES[0],
    difficulty: 'standard'
  });
  return engine;
}

test('the sixteen promised campaign objectives compile to sixteen distinct mechanical contracts', () => {
  const runtimes = objectiveTexts.map((objective) => buildObjectiveRuntime(objective, { mode: 'FRONTIER', routes: 5, enemyCount: 16, doorCount: 4, ventCount: 2 }));
  assert.equal(new Set(runtimes.map((runtime) => runtime.id)).size, 16);
  assert.equal(new Set(runtimes.map((runtime) => runtime.action)).size, 16);
  for (const runtime of runtimes) {
    assert.ok(runtime.requirements.length > 0, runtime.id);
    assert.equal(runtime.sourceText, objectiveTexts[runtimes.indexOf(runtime)]);
  }
  assert.ok(runtimes.find((runtime) => runtime.id === 'seal-hive').nodeCount >= 3);
  assert.ok(runtimes.find((runtime) => runtime.id === 'hold-extraction').holdSeconds > 0);
  assert.ok(runtimes.find((runtime) => runtime.id === 'track-apex').trackerPulses >= 2);
  assert.ok(runtimes.find((runtime) => runtime.id === 'purge-reactor').purgeTarget >= 4);
  assert.ok(runtimes.find((runtime) => runtime.id === 'board-vessel').doorTarget >= 1);
  assert.ok(runtimes.find((runtime) => runtime.id === 'navigate-vents').ventTarget >= 1);
  assert.ok(runtimes.find((runtime) => runtime.id === 'escape-quarantine').timeLimit > 0);
  const frontierHold = buildObjectiveRuntime('hold the extraction zone', { mode: 'FRONTIER' });
  const survivalHold = buildObjectiveRuntime('hold the extraction zone', { mode: 'SURVIVAL' });
  const crucibleHold = buildObjectiveRuntime('hold the extraction zone', { mode: 'CRUCIBLE' });
  assert.ok(survivalHold.holdSeconds > frontierHold.holdSeconds);
  assert.ok(crucibleHold.waveCount > frontierHold.waveCount);
});

test('all sixteen objectives configure the live engine and the selected weapon is equipped on insertion', () => withBrowserMocks(() => {
  for (const objective of objectiveTexts) {
    const engine = createEngine(objective);
    const expected = buildObjectiveRuntime(objective, { mode: 'FRONTIER', routes: 5, enemyCount: engine.objectiveInitialEnemyCount, doorCount: 4, ventCount: 1 });
    const snapshot = engine.getSnapshot();
    assert.equal(snapshot.objectiveRuntime.id, expected.id, objective);
    assert.equal(snapshot.objectiveRuntime.action, expected.action, objective);
    assert.deepEqual(snapshot.objectiveRuntime.requirements, expected.requirements, objective);
    assert.equal(engine.player.weaponMode, 'rifle', objective);
    assert.equal(engine.player.magazineSize, WEAPONS[4].magazine, objective);
    assert.equal(engine.weaponPickup.taken, true, objective);
  }
}));

test('restore objective completes after the physical power interaction and emits final rewards once', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine('restore atmospheric processing', events);
  Object.assign(engine.player, { x: engine.powerNode.x, y: engine.powerNode.y });
  assert.equal(engine.interact(engine.player), true);
  assert.equal(engine.mission.objectives.power, true);
  Object.assign(engine.player, { x: engine.objective.x, y: engine.objective.y });
  assert.equal(engine.interact(engine.player), true);
  const completions = events.filter((event) => event.type === 'mission-complete');
  assert.equal(completions.length, 1);
  assert.deepEqual(completions[0].rewards, engine.mission.rewards);
  assert.equal(completions[0].rewards.objectiveId, 'restore-atmosphere');
  assert.ok(completions[0].rewards.credits > 0);
}));

test('hold objective starts at the extraction zone, spawns hostile waves and only then completes', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine('hold the extraction zone', events);
  engine.mission.objectives.route = true;
  Object.assign(engine.player, { x: engine.objective.x, y: engine.objective.y });
  assert.equal(engine.interact(engine.player), true);
  assert.equal(engine.objectiveState.started, true);
  assert.equal(engine.mission.state, 'active');
  const before = engine.enemies.length;
  engine.updateHoldObjective(engine.objectiveRuntime.holdSeconds + 0.01);
  assert.ok(engine.enemies.length > before);
  assert.equal(engine.objectiveState.complete, true);
  assert.equal(engine.mission.state, 'complete');
  assert.ok(events.some((event) => event.type === 'objective-wave'));
  assert.ok(events.some((event) => event.type === 'mission-complete'));
}));

test('live capture requires a weakened boss and killing the target fails the objective', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine('capture a live organism', events);
  engine.mission.objectives.route = true;
  const boss = engine.enemies.find((enemy) => enemy.isBoss);
  Object.assign(engine.player, { x: boss.x - 20, y: boss.y });
  assert.equal(engine.interact(engine.player), false);
  boss.health = boss.maxHealth * 0.24;
  assert.equal(engine.interact(engine.player), true);
  assert.equal(engine.objectiveState.captured, true);
  assert.equal(boss.captured, true);
  assert.ok(events.some((event) => event.type === 'objective-action' && event.action === 'specimen-captured'));

  const failedEvents = [];
  const failed = createEngine('capture a live organism', failedEvents);
  const failedBoss = failed.enemies.find((enemy) => enemy.isBoss);
  failed.applyEnemyDamage(failedBoss, 99999, { owner: failed.player, kind: 'test' });
  assert.equal(failed.mission.state, 'failed');
  assert.ok(failedEvents.some((event) => event.type === 'objective-failed' && event.reason === 'specimen-killed'));
}));

test('tracker, vent and vehicle objectives use their actual systems as gates', () => withBrowserMocks(() => {
  const tracker = createEngine('track an apex specimen');
  assert.match(tracker.missingExtractionRequirement(), /TRACES APEX/);
  tracker.activateTracker(tracker.player);
  tracker.tracker.cooldown = 0;
  tracker.activateTracker(tracker.player);
  const boss = tracker.enemies.find((enemy) => enemy.isBoss);
  tracker.applyEnemyDamage(boss, 99999, { owner: tracker.player, kind: 'test' });
  assert.equal(tracker.missingExtractionRequirement(), '');

  const vent = createEngine('navigate the vent network');
  assert.match(vent.missingExtractionRequirement(), /CONDUITS/);
  vent.inventory.cutter = true;
  Object.assign(vent.player, { x: vent.vents[0].x, y: vent.vents[0].y });
  assert.equal(vent.interact(vent.player), true);
  assert.equal(vent.missingExtractionRequirement(), '');

  const vehicle = createEngine('secure the power loader');
  vehicle.mission.objectives.power = true;
  assert.match(vehicle.missingExtractionRequirement(), /VÉHICULE/);
  vehicle.vehicle.x = vehicle.objective.x - 100;
  assert.equal(vehicle.missingExtractionRequirement(), '');
}));

test('level width and height alter the live threat target instead of remaining labels', () => withBrowserMocks(() => {
  const compact = createEngine('defend the colony', [], { width: 3, height: 2 });
  const expansive = createEngine('defend the colony', [], { width: 11, height: 7 });
  assert.ok(expansive.levelScaleRuntime.area > compact.levelScaleRuntime.area);
  assert.ok(expansive.levelScaleRuntime.threatTarget > compact.levelScaleRuntime.threatTarget);
  assert.ok(expansive.enemies.length > compact.enemies.length);
}));
