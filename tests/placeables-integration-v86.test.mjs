import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, CREW, ENEMIES, EQUIPMENT, LEVEL_SEEDS, WEAPONS, WORLDS } from '../src/content.js';
import { getPlaceableDefinitionV86 } from '../src/placeables-state-v86.js';
import { sanitizeOperationResumeState } from '../src/save.js';

const ids = { sentry: 'equipment-020-portable-sentry', 'cryo-trap': 'equipment-024-cryo-mine',
  'shock-trap': 'equipment-026-electroshock-trap', containment: 'equipment-028-portable-quarantine' };
const key = actor => actor.crewId || actor.operatorId;
const copy = value => JSON.parse(JSON.stringify(value));

function withRuntime(run) {
  const globals = ['Image', 'addEventListener', 'requestAnimationFrame', 'document', 'navigator'];
  const saved = new Map(globals.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const document = { hidden: false, activeElement: null, addEventListener() {} };
  const mocks = { Image: class { constructor() { this.complete = true; this.naturalWidth = this.naturalHeight = 1024; } set src(src) { this.currentSrc = src; } },
    addEventListener() {}, requestAnimationFrame: () => 0, document, navigator: { getGamepads: () => [] } };
  for (const [name, value] of Object.entries(mocks)) Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
  const engines = [];
  const make = (changes = {}) => {
    const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener() {},
      focus() { document.activeElement = canvas; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) };
    const events = [];
    const engine = new GameEngine(canvas, { onEvent: event => events.push(event) }); engines.push(engine);
    const options = { seed: 860086, world: WORLDS[0], campaign: { ...CAMPAIGNS[0], id: 'placeables-integration-v86', mode: 'FRONTIER' },
      levelSeed: { ...LEVEL_SEEDS[0], id: 'placeables-fixture-v86', seed: 860086 }, weapon: WEAPONS[0],
      equipment: EQUIPMENT.filter(item => Object.values(ids).includes(item.id)), crew: CREW.slice(0, 4),
      enemyCatalog: ENEMIES.slice(0, 52), playerIdentityV84: { name: 'Alex Navarro', callsign: 'ECHO-9' }, difficulty: 'standard', ...changes };
    engine.start(options); ready(engine); arena(engine);
    assert.equal(typeof engine.confirmPlaceableV86, 'function', 'fixture must exercise the exported production GameEngine, not a standalone mixin');
    return { engine, events, options };
  };
  try { return run(make); } finally {
    for (const engine of engines) engine.stop();
    for (const [name, descriptor] of saved) descriptor ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name];
  }
}

function ready(engine) { engine.paused = false; engine.enemyAtlasLoadingPausedV65 = false; engine.mission.state = 'active'; }
function position(actor, x = 600, facing = 1) { Object.assign(actor, { x, y: 930 - actor.h, vx: 0, vy: 0, grounded: true,
  alive: true, downed: false, inVehicle: false, climbing: false, ventTransit: null, facing, fireClock: 0 }); }
function arena(engine) {
  // Deterministic real level geometry; only the fixture environment is changed.
  // No movement, deployment, damage, firing, capture or restore method is mocked.
  engine.missionLevelBounds = { width: 6200, height: 1080 };
  engine.platforms = [{ id: 'v86-fixture-floor', x: 0, y: 930, w: 6200, h: 150, floor: true }];
  for (const name of ['walls', 'covers', 'doors', 'ladders', 'vents', 'lifts', 'enemies', 'hostileProjectiles', 'bullets', 'hazards', 'supplies', 'drops']) engine[name] = [];
  engine.objective = engine.powerNode = engine.archiveTerminal = null;
  if (engine.vehicle) engine.vehicle.active = false;
  for (const [i, actor] of engine.squadActors.entries()) position(actor, 4200 + i * 160);
  position(engine.coop, 3600); position(engine.player);
}
function advance(engine, seconds, fps = 60) {
  const count = Math.round(seconds * fps);
  for (let i = 0; i < count; i++) engine.updateEquipmentDeployments(1 / fps);
}
function deploy(engine, kind, actor = engine.player, fps = 60) {
  assert.equal(engine.useEquipment(ids[kind], actor), true, `preview ${kind}`);
  const preview = engine.getPlaceablesSnapshotV86().previews.find(item => item.actorCrewId === key(actor));
  assert.ok(preview?.valid, `preview refused: ${preview?.reason}`);
  assert.equal(engine.confirmPlaceableV86(actor), true);
  const instance = engine.placeableInstanceV86(preview.instanceId);
  advance(engine, getPlaceableDefinitionV86(ids[kind]).installSeconds, fps);
  assert.equal(instance.status, kind === 'containment' && instance.duration <= 0 ? 'spent' : 'deployed', kind);
  return instance;
}
function target(engine, instance, side = 1, range = 180) {
  const enemy = engine.createEnemy(ENEMIES.find(item => item.name === 'Drone / Big Chap' && item.modifier === 'Standard') || ENEMIES[3], 87,
    instance.x + side * range, 930, {});
  Object.assign(enemy, { x: instance.x + side * range, y: instance.y - 15, health: 100000, maxHealth: 100000, armor: 0,
    alive: true, dormant: false, ventTransit: null, alert: true, attackClock: 0, staggerClock: 0, hurtClock: 0, jammedClock: 0, v52HurtClock: 0, attacking: false });
  engine.enemies = [enemy]; return enemy;
}

for (const kind of Object.keys(ids)) test(`production ${kind}: preview/timed installation consumes exactly one issued instance`, () => withRuntime(make => {
  const { engine, events } = make(); const equipment = engine.equipmentActions.get(ids[kind]); const remaining = equipment.remaining;
  const initial = engine.placeablesV86.instances.filter(item => item.catalogId === ids[kind]);
  assert.equal(initial.length, equipment.charges);
  assert.equal(engine.useEquipment(ids[kind]), true);
  const preview = engine.getPlaceablesSnapshotV86().previews[0];
  assert.equal(preview.valid, true); assert.equal(equipment.remaining, remaining);
  assert.equal(engine.confirmPlaceableV86(), true); assert.equal(engine.confirmPlaceableV86(), false);
  const duration = getPlaceableDefinitionV86(ids[kind]).installSeconds;
  advance(engine, duration - .1);
  assert.equal(engine.placeableInstanceV86(preview.instanceId).status, 'carried'); assert.equal(equipment.remaining, remaining);
  advance(engine, .1);
  const instance = engine.placeableInstanceV86(preview.instanceId);
  assert.equal(instance.status, 'deployed'); assert.equal(instance.onGround, true); assert.equal(instance.y + instance.h, 930);
  assert.equal(instance.ownerCrewId, key(engine.player)); assert.equal(instance.facing, 1);
  assert.equal(equipment.remaining, remaining - 1); assert.equal(equipment.uses, 1);
  assert.equal(events.filter(event => event.type === 'placeable-deployed').length, 1);
  assert.equal(engine.supportDeployments.some(item => item.id === instance.instanceId), false, 'no second V72 projection');
}));

for (const fps of [30, 60, 120]) test(`production tasks pause and complete identically at ${fps} FPS`, () => withRuntime(make => {
  const { engine } = make(); const equipment = engine.equipmentActions.get(ids.sentry);
  engine.useEquipment(ids.sentry); engine.confirmPlaceableV86();
  advance(engine, 1, fps); const before = copy(engine.getPlaceablesSnapshotV86());
  engine.paused = true; advance(engine, 3, fps);
  assert.deepEqual(engine.getPlaceablesSnapshotV86(), before); assert.equal(equipment.uses, 0);
  engine.paused = false; engine.enemyAtlasLoadingPausedV65 = true; advance(engine, 1, fps);
  assert.deepEqual(engine.getPlaceablesSnapshotV86(), before);
  engine.enemyAtlasLoadingPausedV65 = false; advance(engine, 1.5, fps);
  assert.equal(engine.placeablesV86.instances[0].status, 'deployed'); assert.equal(equipment.uses, 1);
  assert.equal(engine.placeableTasksV86.size, 0);
}));

test('production recovery/redeployment preserves damaged health and spent ammunition without a charge refund', () => withRuntime(make => {
  const { engine } = make(); const sentry = deploy(engine, 'sentry'); const equipment = engine.equipmentActions.get(ids.sentry);
  engine.damagePlaceableV86(sentry.instanceId, 27); sentry.ammo = 61;
  const before = { remaining: equipment.remaining, uses: equipment.uses };
  assert.equal(engine.recoverPlaceableV86(sentry.instanceId), true); advance(engine, 2);
  assert.equal(sentry.status, 'carried'); assert.equal(sentry.onGround, false); assert.equal(sentry.health, 73); assert.equal(sentry.ammo, 61);
  assert.deepEqual({ remaining: equipment.remaining, uses: equipment.uses }, before);
  const redeployed = deploy(engine, 'sentry'); assert.equal(redeployed, sentry);
  assert.equal(sentry.health, 73); assert.equal(sentry.ammo, 61);
  assert.deepEqual({ remaining: equipment.remaining, uses: equipment.uses }, before);
}));

test('production cancellation on movement, health/armor impact and explicit cancel cannot consume stock', () => withRuntime(make => {
  for (const cancel of ['movement', 'damage', 'cancel']) {
    const { engine, events } = make(); const equipment = engine.equipmentActions.get(ids.sentry);
    engine.useEquipment(ids.sentry); engine.confirmPlaceableV86(); advance(engine, .5);
    if (cancel === 'movement') { engine.keys.add('KeyD'); engine.updatePlayer(engine.player, 1 / 60, { right: 'KeyD' }); engine.keys.clear(); }
    else if (cancel === 'damage') engine.damagePlayer(engine.player, 10, { bypassCover: true, source: 'enemy' });
    else engine.cancelPlaceableV86(engine.player);
    assert.equal(engine.placeableTasksV86.size, 0, cancel); assert.equal(equipment.uses, 0, cancel);
    advance(engine, 5); assert.ok(engine.placeablesV86.instances.every(item => item.status === 'carried'));
    assert.ok(events.some(event => event.type === 'placeable-task-cancelled'), cancel);
  }
}));

test('production preview refuses open doors, actors and access shafts without spending charges', () => withRuntime(make => {
  const { engine } = make(); const x = engine.player.x + engine.player.w + 18;
  for (const [name, object] of [['doors', { open: true }], ['ladders', {}], ['vents', {}], ['lifts', {}]]) {
    engine[name] = [{ id: `blocked-${name}`, x, y: 780, w: 80, h: 150, ...object }];
    assert.equal(engine.useEquipment(ids.sentry), true);
    assert.equal(engine.getPlaceablesSnapshotV86().previews[0].valid, false, name);
    assert.equal(engine.confirmPlaceableV86(), false, name); assert.equal(engine.equipmentActions.get(ids.sentry).uses, 0);
    engine.cancelPlaceableV86(); engine[name] = [];
  }
}));

test('production restart restores exact instances and cancels interrupted install/fold tasks', () => withRuntime(make => {
  const { engine, options } = make(); const sentry = deploy(engine, 'sentry');
  engine.damagePlaceableV86(sentry.instanceId, 19); sentry.ammo = 7;
  engine.recoverPlaceableV86(sentry.instanceId); advance(engine, .5);
  const before = copy(engine.captureResumeState().placeablesV86);
  const saved = sanitizeOperationResumeState(copy(engine.captureResumeState()));
  assert.equal(saved.placeablesV86.instances.find(item => item.instanceId === sentry.instanceId).ammo, 7);
  engine.stop(); engine.start({ ...options, resumeState: saved }); ready(engine);
  assert.equal(engine.lastResumeResult.applied, true);
  assert.deepEqual(engine.captureResumeState().placeablesV86, before);
  assert.equal(engine.placeableTasksV86.size, 0); assert.equal(engine.placeablePreviewsV86.size, 0);
  assert.equal(engine.placeableInstanceV86(sentry.instanceId).status, 'deployed');
  assert.equal(engine.applyResumeState(saved).applied, true);
  assert.deepEqual(engine.captureResumeState().placeablesV86, before);
  arena(engine); position(engine.player, 1500);
  engine.useEquipment(ids['cryo-trap']); engine.confirmPlaceableV86(); advance(engine, .5);
  const pending = copy(engine.captureResumeState()); const uses = engine.equipmentActions.get(ids['cryo-trap']).uses;
  assert.equal(engine.applyResumeState(pending).applied, true);
  assert.equal(engine.placeableTasksV86.size, 0); assert.equal(engine.equipmentActions.get(ids['cryo-trap']).uses, uses);
  assert.equal(engine.placeablesV86.instances.filter(item => item.kind === 'cryo-trap' && item.status === 'carried').length, 8);
}));

test('production cooperative reservations are unique, disabling J2 cancels only its unfinished task', () => withRuntime(make => {
  const { engine } = make(); engine.setCoop(true); position(engine.coop, 1400);
  assert.equal(engine.useEquipment(ids.sentry, engine.player), true);
  assert.equal(engine.useEquipment(ids.sentry, engine.coop), true);
  const previews = engine.getPlaceablesSnapshotV86().previews;
  assert.equal(previews.length, 2); assert.notEqual(previews[0].instanceId, previews[1].instanceId);
  engine.confirmPlaceableV86(engine.player); engine.confirmPlaceableV86(engine.coop); advance(engine, .5);
  engine.setCoop(false);
  assert.equal(engine.placeableTasksV86.size, 1); assert.ok(engine.placeableTasksV86.has(key(engine.player)));
  advance(engine, 2); assert.equal(engine.equipmentActions.get(ids.sentry).uses, 1);
  assert.equal(engine.placeablesV86.instances.filter(item => item.status === 'deployed').length, 1);
}));

for (const kind of ['cryo-trap', 'shock-trap']) test(`production ${kind} consumes once, slows a real enemy and never rearms after recovery`, () => withRuntime(make => {
  const { engine } = make(); const trap = deploy(engine, kind); const enemy = target(engine, trap, 1, 0);
  enemy.y = 930 - enemy.h; const health = enemy.health;
  engine.updateEquipmentDeployments(1 / 60);
  assert.equal(trap.status, 'spent'); assert.equal(trap.armed, false); assert.ok(enemy.supportSlowClockV72 > 0);
  if (kind === 'shock-trap') assert.ok(enemy.health < health); else assert.equal(enemy.health, health);
  const afterHit = enemy.health; engine.updateEquipmentDeployments(1 / 60); assert.equal(enemy.health, afterHit);
  engine.enemies = []; assert.equal(engine.recoverPlaceableV86(trap.instanceId), true);
  advance(engine, getPlaceableDefinitionV86(ids[kind]).foldSeconds); assert.equal(trap.status, 'carried');
  deploy(engine, kind); assert.equal(trap.armed, false);
  target(engine, trap, 1, 0); engine.updateEquipmentDeployments(1 / 60);
  assert.equal(engine.enemies[0].supportSlowClockV72 || 0, 0);
}));

test('production containment duration expires once, stays spent across save and cannot replenish', () => withRuntime(make => {
  const { engine } = make(); const field = deploy(engine, 'containment');
  advance(engine, field.duration + 1);
  assert.equal(field.status, 'spent'); assert.equal(field.duration, 0); assert.equal(field.onGround, true);
  const snapshot = copy(engine.captureResumeState()); engine.applyResumeState(snapshot);
  const restored = engine.placeableInstanceV86(field.instanceId); assert.equal(restored.duration, 0); assert.equal(restored.status, 'spent');
  assert.equal(engine.recoverPlaceableV86(restored.instanceId), true); advance(engine, 2);
  assert.equal(restored.status, 'carried'); deploy(engine, 'containment'); assert.equal(restored.duration, 0);
}));

test('production fresh mission has no phantom deployed stock or legacy migration label', () => withRuntime(make => {
  const { engine } = make();
  assert.equal(engine.placeablesV86.migration, undefined);
  assert.ok(engine.placeablesV86.instances.every(item => item.status === 'carried' && !item.onGround));
  assert.equal(engine.placeablesV86.instances.length, 18);
}));
