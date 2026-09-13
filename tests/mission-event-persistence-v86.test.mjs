import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, CREW, ENEMIES, EQUIPMENT, LEVEL_SEEDS, WEAPONS, WORLDS } from '../src/content.js';
import { SaveSystem, createDefaultSave, beginOperation, recordOperationFlag, recordOperationResumeState } from '../src/save.js';

// Execute the current application functions, not a copied save callback. Only DOM,
// bitmap availability and the final drawing port are replaced; GameEngine.loop,
// update/placement/capture and SaveSystem.commit are the production implementations.
const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const functions = ['captureMissionResumeState', 'handleGameEvent'].map(name => {
  const source = app.match(new RegExp(`^function ${name}\\([^]*?^\\}`, 'm'))?.[0];
  assert.ok(source, `application function ${name} must remain testable`);
  return source;
});
const noticeState = app.match(/^let lastMissionSaveFailureToastV86 = [^\n]+/m)?.[0];
assert.ok(noticeState, 'the application must own its notification throttle');
const sentryId = 'equipment-020-portable-sentry';
const copy = value => JSON.parse(JSON.stringify(value));

function withRuntime(run) {
  const names = ['Image', 'addEventListener', 'requestAnimationFrame', 'document', 'navigator'];
  const globals = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const counters = { draws: 0, frames: 0 };
  const document = { hidden: false, activeElement: null, addEventListener() {} };
  const mocks = { Image: class { constructor() { this.complete = true; this.naturalWidth = this.naturalHeight = 1024; } set src(src) { this.currentSrc = src; } },
    addEventListener() {}, requestAnimationFrame() { counters.frames++; return counters.frames; }, document, navigator: { getGamepads: () => [] } };
  for (const [name, value] of Object.entries(mocks)) Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
  let engine;
  try {
    const values = new Map();
    const backend = { values, denied: false, attempts: 0, getItem: key => values.get(key) ?? null,
      setItem(key, value) { this.attempts++; if (this.denied) throw new Error('QuotaExceededError'); values.set(key, value); },
      removeItem(key) { values.delete(key); } };
    const save = createDefaultSave(1);
    save.needsPlayerCreationV84 = false;
    save.player.equipmentIds = [sentryId];
    save.strategy.inventory.equipmentIds.push(sentryId);
    const campaign = CAMPAIGNS.find(item => !item.specialOperationId && save.galaxy.unlockedWorldIds.includes(item.worldId));
    const world = WORLDS.find(item => item.id === campaign.worldId);
    beginOperation(save, campaign, world);
    const saveSystem = new SaveSystem(backend); saveSystem.commit(save);
    const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener() {},
      focus() { document.activeElement = canvas; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) };
    engine = new GameEngine(canvas, { onEvent() {} });
    engine.start({ seed: 860086, world, campaign, levelSeed: { ...LEVEL_SEEDS[0], seed: 860086 },
      weapon: WEAPONS[0], equipment: EQUIPMENT.filter(item => item.id === sentryId), crew: CREW.slice(0, 4),
      enemyCatalog: ENEMIES.slice(0, 52), playerIdentityV84: { name: 'Alex Navarro', callsign: 'ECHO-9' }, difficulty: 'standard' });
    engine.paused = engine.enemyAtlasLoadingPausedV65 = false; engine.mission.state = 'active';
    engine.missionLevelBounds = { width: 6200, height: 1080 };
    engine.platforms = [{ id: 'quota-fixture-floor', x: 0, y: 930, w: 6200, h: 150, floor: true }];
    for (const name of ['walls', 'covers', 'doors', 'ladders', 'vents', 'lifts', 'enemies', 'hostileProjectiles', 'bullets', 'hazards', 'supplies', 'drops']) engine[name] = [];
    engine.objective = engine.powerNode = engine.archiveTerminal = null;
    if (engine.vehicle) engine.vehicle.active = false;
    const position = (actor, x) => Object.assign(actor, { x, y: 930 - actor.h, vx: 0, vy: 0, grounded: true,
      alive: true, downed: false, inVehicle: false, climbing: false, ventTransit: null, facing: 1 });
    position(engine.player, 600); position(engine.coop, 3600);
    engine.squadActors.forEach((actor, index) => position(actor, 4200 + index * 160));
    engine.draw = () => { counters.draws++; };
    engine.refreshEnemyAtlasAvailabilityV65 = () => {};
    const log = { textContent: '', dataset: {} }, toasts = [], results = [];
    const clock = { now: 100000 };
    const context = { saveSystem, engine, clone: structuredClone, recordOperationFlag, recordOperationResumeState,
      Date: { now: () => clock.now }, standaloneContext: null, profileEpochV78: 1,
      missionOwnerV78: { epoch: 1, profile: 1, operationId: saveSystem.data.strategy.currentOperation.id },
      byId: () => log, toast: message => toasts.push(message), renderMissionEquipment() {},
      isAlphaBravoRuntimeEventV69: () => false, isAlienSurvivalRuntimeEventV70: () => false,
      ALPHA_BRAVO_PERSISTENT_EVENTS_V69: new Set(), ALIEN_SURVIVAL_PERSISTENT_EVENTS_V70: new Set(),
      escapeHtml: value => String(value), audio: { alarm() {} } };
    vm.createContext(context);
    vm.runInContext(noticeState + '\n' + functions.join('\n'), context);
    recordOperationResumeState(saveSystem.data, engine.captureResumeState()); saveSystem.commit();
    engine.onEvent = event => { const result = context.handleGameEvent(event); results.push({ type: event.type, result }); };
    counters.draws = counters.frames = backend.attempts = 0;
    return run({ engine, saveSystem, backend, context, log, toasts, clock, counters, results });
  } finally {
    if (engine) { engine.onEvent = () => {}; engine.stop(); }
    for (const [name, descriptor] of globals) descriptor ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name];
  }
}

function finishTaskOnFrame(engine) {
  const task = engine.placeableTasksV86.get(engine.player.crewId || engine.player.operatorId);
  assert.ok(task, 'the production runtime must have started a real manipulation');
  task.elapsed = task.duration - 0.001;
  engine.loop(engine.last + 16, engine.loopGeneration);
}
function beginSentry(engine) {
  assert.equal(engine.useEquipment(sentryId), true);
  assert.equal(engine.confirmPlaceableV86(), true);
  return engine.placeablesV86.instances.find(item => item.catalogId === sentryId);
}

test('real deployment event contains quota failure and preserves both RAF and the previous checkpoint', () => withRuntime(h => {
  const { engine, saveSystem, backend, counters, results, log, toasts } = h;
  const root = saveSystem.data, previous = root.strategy.currentOperation.resumeState;
  const before = copy(previous), bytes = backend.values.get(saveSystem.key(1));
  const sentry = beginSentry(engine); backend.denied = true;
  assert.doesNotThrow(() => finishTaskOnFrame(engine));
  assert.equal(engine.running, true); assert.equal(counters.draws, 1); assert.equal(counters.frames, 1);
  assert.equal(engine.placeableTasksV86.size, 0); assert.equal(sentry.status, 'deployed'); assert.equal(sentry.onGround, true);
  assert.equal(engine.equipmentActions.get(sentryId).uses, 1, 'gameplay is not rolled back or double-consumed');
  assert.equal(saveSystem.data, root); assert.equal(root.strategy.currentOperation.resumeState, previous);
  assert.deepEqual(previous, before); assert.equal(backend.values.get(saveSystem.key(1)), bytes);
  assert.equal(results.find(item => item.type === 'placeable-deployed')?.result, false);
  assert.match(log.textContent, /PROGRESSION NON ENREGISTRÉE/); assert.equal(toasts.length, 1);
  assert.doesNotThrow(() => engine.loop(engine.last + 16, engine.loopGeneration));
  assert.equal(counters.draws, 2); assert.equal(counters.frames, 2);
}));

test('successful retry persists the current recovered instance exactly without resurrecting the stale checkpoint', () => withRuntime(h => {
  const { engine, saveSystem, backend, counters, results } = h;
  const root = saveSystem.data, previous = root.strategy.currentOperation.resumeState;
  const sentry = beginSentry(engine); backend.denied = true; finishTaskOnFrame(engine);
  sentry.health = 73; sentry.ammo = 61;
  assert.equal(engine.recoverPlaceableV86(sentry.instanceId), true);
  backend.denied = false; finishTaskOnFrame(engine);
  assert.equal(results.find(item => item.type === 'placeable-recovered')?.result, true);
  assert.equal(counters.draws, 2); assert.equal(counters.frames, 2); assert.equal(saveSystem.data, root);
  assert.notEqual(root.strategy.currentOperation.resumeState, previous);
  const saved = root.strategy.currentOperation.resumeState.placeablesV86.instances.find(item => item.instanceId === sentry.instanceId);
  assert.equal(saved.status, 'carried'); assert.equal(saved.onGround, false); assert.equal(saved.ammo, 61); assert.equal(saved.health, 73);
  assert.equal(saved.sourceUseRecorded, true); assert.equal(engine.equipmentActions.get(sentryId).uses, 1);
  const reload = new SaveSystem(backend); reload.load(1);
  assert.deepEqual(reload.data.strategy.currentOperation.resumeState.placeablesV86, root.strategy.currentOperation.resumeState.placeablesV86);
}));

for (const type of ['placeable-deployed', 'placeable-recovered', 'placeable-destroyed', 'placeable-spent']) {
  test(`${type}: failed event persistence never publishes a partial resume`, () => withRuntime(h => {
    const { context, saveSystem, backend } = h;
    const before = copy(saveSystem.data), bytes = backend.values.get(saveSystem.key(1));
    backend.denied = true;
    assert.equal(context.handleGameEvent({ type }), false);
    assert.equal(backend.attempts, 1); assert.deepEqual(saveSystem.data, before);
    assert.equal(backend.values.get(saveSystem.key(1)), bytes);
  }));
}

test('quota warnings are rate limited while failures remain explicit and retryable', () => withRuntime(h => {
  const { context, backend, toasts, clock, log } = h; backend.denied = true;
  for (let i = 0; i < 120; i++) assert.equal(context.handleGameEvent({ type: 'placeable-spent' }), false);
  assert.equal(toasts.length, 1); assert.match(log.textContent, /NON ENREGISTRÉE/);
  clock.now += 9999; context.handleGameEvent({ type: 'placeable-spent' }); assert.equal(toasts.length, 1);
  clock.now++; context.handleGameEvent({ type: 'placeable-spent' }); assert.equal(toasts.length, 2);
  backend.denied = false; assert.equal(context.handleGameEvent({ type: 'placeable-spent' }), true);
  backend.denied = true; context.handleGameEvent({ type: 'placeable-spent' }); assert.equal(toasts.length, 3, 'a new failure after successful recovery is reported');
}));

for (const [reason, invalidate] of [
  ['stale epoch', h => { h.context.profileEpochV78++; }],
  ['other profile', h => { h.context.missionOwnerV78.profile = 2; }],
  ['other operation', h => { h.context.missionOwnerV78.operationId = 'different-operation'; }],
  ['protected recovery', h => { h.saveSystem.recoveryNeeded = { profile: 1 }; }]
]) test(`${reason}: an event cannot save a mission owned by another timeline`, () => withRuntime(h => {
  const bytes = h.backend.values.get(h.saveSystem.key(1)), previous = h.saveSystem.data.strategy.currentOperation.resumeState;
  invalidate(h); h.backend.denied = true;
  assert.equal(h.context.handleGameEvent({ type: 'placeable-deployed' }), false);
  assert.equal(h.backend.attempts, 0); assert.equal(h.toasts.length, 0);
  assert.equal(h.saveSystem.data.strategy.currentOperation.resumeState, previous);
  assert.equal(h.backend.values.get(h.saveSystem.key(1)), bytes);
}));

test('nonpersistent placement previews do not write a profile', () => withRuntime(h => {
  h.context.handleGameEvent({ type: 'placeable-preview' });
  h.context.handleGameEvent({ type: 'placeable-task-cancelled' });
  h.context.handleGameEvent({ type: 'placeable-shot' });
  assert.equal(h.backend.attempts, 0);
}));
