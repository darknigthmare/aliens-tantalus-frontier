import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameEngine as ProductionEngine } from '../src/game-production-runtime.js';
import { ENEMIES, WORLDS, WEAPONS, LEVEL_SEEDS, CREW } from '../src/content-core-v50.js';
import { ECOSYSTEM_CAMPAIGNS_V131, buildEcosystemMissionV131, withEcosystemMissionsV131 } from '../src/ecosystem-missions-v131.js';
import { SAURIA_CASTES_V131, validateEcosystemStateV131, advancePopulationV131, biosphereIntegrityV131, ecosystemPhaseV131 } from '../src/ecosystem-systems-v131.js';
import { validateMissionTopologyV52, validateMissionPhysicalTopologyV57 } from '../src/mission-levels-v52.js';
import { validateMissionTopologyV58 } from '../src/topology-coherence-v58.js';

// Substitute browser APIs only. Production combat, geometry, saves and resource
// consumption run unchanged; PNG dimensions come from existing real files.
const Engine = withEcosystemMissionsV131(ProductionEngine);
const root = fileURLToPath(new URL('../', import.meta.url));
function imageSize(source) {
  let descriptor;
  try { descriptor = openSync(resolve(root, `.${new URL(source, 'http://fixture.invalid').pathname}`), 'r');
    const header = Buffer.alloc(24); readSync(descriptor, header, 0, 24, 0); return [header.readUInt32BE(16), header.readUInt32BE(20)];
  } catch { return [0, 0]; } finally { if (descriptor !== undefined) closeSync(descriptor); }
}
function host() {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener']) globalThis[name] = events[name].bind(events);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(value) { this._src = value; [this.naturalWidth, this.naturalHeight] = imageSize(value);
      queueMicrotask(() => { const event = new Event(this.naturalWidth ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); }); }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw new Error('Missing fixture PNG'); }
  };
  const ctx = new Proxy({ measureText: text => ({ width: String(text).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }),
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 }) }, { get: (value, key) => key in value ? value[key] : () => {} });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  return { canvas, ctx };
}
async function fixture(operation = 'queen-mother-song', resumeState = null, crew = []) {
  const browser = host(), events = [], engine = new Engine(browser.canvas, { onEvent: event => events.push(event) });
  const campaign = ECOSYSTEM_CAMPAIGNS_V131.find(campaign => campaign.specialOperationId === operation);
  const options = { world: WORLDS[0], campaign, weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 6), equipment: [], crew,
    levelSeeds: LEVEL_SEEDS, seed: 426, resumeState };
  options.missionLevel = buildEcosystemMissionV131(options); engine.start(options);
  for (let index = 0; index < 8; index++) await Promise.resolve();
  engine.enemyAtlasLoadingPausedV65 = false; engine.userCasteLoadingV88 = false; engine.running = true; engine.paused = false;
  return { ...browser, engine, events, options };
}
function locate(engine, x, floorY = 570) { Object.assign(engine.player, { x: x - engine.player.w / 2, y: floorY - engine.player.h, vx: 0, vy: 0, grounded: true }); }
function advance(engine, seconds) { for (let elapsed = 0; elapsed < seconds - 1e-9; elapsed += 1 / 60) engine.update(Math.min(1 / 60, seconds - elapsed)); }
function destroy(engine, id, damage = 999) { const enemy = engine.ecosystemActorV131(id); assert.ok(enemy); return engine.applyEnemyDamage(enemy, damage, { owner: engine.player, kind: 'rifle', x: enemy.x - 40, y: enemy.y + 20 }); }
function targets(engine) { for (let index = 0; index < engine.ecosystemV131.targets.length; index++) destroy(engine, `eco131-target-${index}`); }
function boss(engine) { const actor = engine.ecosystemActorV131('eco131-boss'); for (let index = 0; index < 4 && actor.alive; index++) destroy(engine, actor.id); }

test('three authored ecosystems provide two physical routes, five ladders and distinct honest operation contracts', () => {
  assert.equal(ECOSYSTEM_CAMPAIGNS_V131.length, 3);
  for (const campaign of ECOSYSTEM_CAMPAIGNS_V131) {
    const plan = buildEcosystemMissionV131({ campaign, levelSeeds: LEVEL_SEEDS });
    assert.equal(plan.ecosystemV131.operationId, campaign.specialOperationId);
    assert.ok(validateMissionTopologyV52(plan).valid); assert.ok(validateMissionPhysicalTopologyV57(plan).valid); assert.ok(validateMissionTopologyV58(plan).valid);
    assert.equal(plan.graph.routes.length, 2); assert.equal(plan.geometry.ladders.length, 5);
    assert.equal(campaign.implementationStatus, 'partial'); assert.equal(campaign.canonExact, false);
  }
});
test('mission cannot start on a generic mislabeled template', async () => {
  const { engine, options } = await fixture();
  assert.throws(() => engine.start({ ...options, missionLevel: { ...options.missionLevel, ecosystemV131: undefined } }), /authored/);
});
test('all three operations save and resume immediately after insertion, before any first simulation tick', async () => {
  for (const campaign of ECOSYSTEM_CAMPAIGNS_V131) {
    const { engine } = await fixture(campaign.specialOperationId), save = engine.captureResumeState();
    assert.ok(engine.validateEcosystemResumeV131(save).valid, campaign.id);
    const { engine: resumed } = await fixture(campaign.specialOperationId, save);
    assert.equal(resumed.lastResumeResult.applied, true, campaign.id);
  }
});
test('Queen Mother is protected by three independent destructible choirs and requires four separate combat phases', async () => {
  const { engine } = await fixture(); const queen = engine.ecosystemActorV131('eco131-boss');
  assert.equal(destroy(engine, queen.id), 0); assert.equal(queen.health, 600);
  destroy(engine, 'eco131-target-0'); assert.deepEqual(engine.ecosystemV131.targets, [true, false, false]);
  assert.equal(destroy(engine, queen.id), 0);
  targets(engine);
  for (let phase = 2; phase <= 4; phase++) { destroy(engine, queen.id); assert.equal(engine.ecosystemV131.bossPhase, phase); assert.equal(queen.alive, true); }
  destroy(engine, queen.id); assert.equal(queen.alive, false); assert.equal(engine.ecosystemV131.bossDefeated, true);
  assert.equal(engine.completeMission(), false, 'Boss death alone cannot extract');
});
test('a real projectile damages the choir and glass blocks a projectile before the biological target', async () => {
  const { engine } = await fixture(); const actor = engine.ecosystemActorV131('eco131-target-1');
  engine.bullets.push({ x: 1600, y: actor.y + 40, w: 8, h: 4, vx: 1800, vy: 0, life: 1, damage: 40, owner: engine.player, kind: 'rifle', hit: false });
  engine.updateBullets(.1); assert.equal(actor.health, 70);
  const glass = engine.destructibleSceneryV130.objects.find(object => object.id === 'eco-observation-glass'); assert.ok(glass);
  actor.x = 1500; const health = actor.health;
  engine.bullets.push({ x: 1380, y: 500, w: 8, h: 4, vx: 1800, vy: 0, life: 1, damage: 8, owner: engine.player, kind: 'rifle', hit: false });
  engine.updateBullets(.1); assert.equal(actor.health, health); assert.ok(glass.hp < glass.maxHp);
});
test('emprise grows, nursery hold consumes real time, isolation consumes one charge, pause freezes all pressure', async () => {
  const { engine } = await fixture(); locate(engine, 1150, 355);
  advance(engine, 1); assert.ok(engine.ecosystemV131.pressure > 0);
  engine.keys.add('KeyE'); advance(engine, 1); assert.equal(engine.ecosystemV131.nursery[0], false);
  advance(engine, 1.05); assert.equal(engine.ecosystemV131.nursery[0], true);
  engine.keys.clear(); engine.ecosystemV131.pressure = 70; locate(engine, 570);
  assert.equal(engine.interact(), true); assert.equal(engine.ecosystemV131.focusCharges, 2); assert.equal(engine.ecosystemV131.pressure, 25);
  engine.paused = true; const before = structuredClone(engine.ecosystemV131); advance(engine, 3); assert.deepEqual(engine.ecosystemV131, before); assert.equal(engine.interact(), false);
});
test('maternal susceptibility and submission slow real movement without permanently changing costume mobility', async () => {
  const ordinary = (await fixture()).engine, pressured = (await fixture()).engine;
  locate(ordinary, 180); locate(pressured, 180); pressured.ecosystemV131.pressure = 90;
  ordinary.keys.add('KeyD'); pressured.keys.add('KeyD');
  const origin = ordinary.player.x, mobility = pressured.costumeRuntime?.mobility;
  advance(ordinary, .8); advance(pressured, .8);
  assert.ok(pressured.player.x - origin < (ordinary.player.x - origin) * .7);
  assert.equal(pressured.costumeRuntime?.mobility, mobility);
  assert.equal(pressured.ecosystemSnapshotV131().influenceState, 'submission');
});
test('Queen Mother victory requires two powered beacons, local defence and a held physical extraction, rewards are one-shot', async () => {
  const { engine } = await fixture(); targets(engine); boss(engine);
  locate(engine, 4280); assert.equal(engine.interact(), true);
  advance(engine, 2); assert.equal(engine.ecosystemV131.defenceElapsed, 0);
  locate(engine, 4540); assert.equal(engine.interact(), true);
  // Kill actual defenders to isolate the authored hold rules.
  for (const actor of engine.enemies.filter(actor => actor.alive)) destroy(engine, actor.id);
  locate(engine, 180); advance(engine, 2); assert.equal(engine.ecosystemV131.defenceElapsed, 0);
  locate(engine, 4400); for (let index = 0; index < 1350; index++) {
    for (const actor of engine.enemies.filter(actor => actor.alive)) destroy(engine, actor.id);
    engine.update(1 / 60);
  }
  assert.equal(engine.ecosystemV131.defenceElapsed, 22);
  locate(engine, 4950); engine.keys.add('KeyE'); advance(engine, 1); assert.equal(engine.mission.state, 'active');
  advance(engine, 1.05); assert.equal(engine.mission.state, 'complete'); assert.ok(engine.ecosystemV131.rewardClaimed);
  assert.equal(engine.completeMission(), false); assert.ok(validateEcosystemStateV131(engine.ecosystemV131).valid);
});
test('Hive World organs feed real alert, reactive tissue preserves an upper route, boss collapse enforces return and failure', async () => {
  const { engine } = await fixture('hive-world');
  engine.player.fireClock = 0; engine.player.v52FireClock = 0; assert.equal(engine.fire(engine.player), true); assert.ok(engine.ecosystemV131.pressure > 0);
  engine.ecosystemV131.pressure = 75; engine.syncEcosystemV131(); assert.ok(engine.walls.some(wall => wall.id === 'eco-reactive-tissue'));
  assert.ok(engine.platforms.some(platform => platform.y === 355 && platform.x <= 2850 && platform.x + platform.w > 2850));
  engine.ecosystemV131.pressure = 20; engine.syncEcosystemV131(); assert.ok(!engine.walls.some(wall => wall.id === 'eco-reactive-tissue'));
  targets(engine); boss(engine); assert.equal(engine.ecosystemV131.phase, 'collapse');
  locate(engine, 180); engine.keys.add('KeyE'); advance(engine, 2.05); assert.equal(engine.mission.state, 'complete');
  const failed = (await fixture('hive-world')).engine; targets(failed); boss(failed); failed.ecosystemV131.collapseRemaining = .03; advance(failed, .1);
  assert.equal(failed.mission.state, 'failed'); assert.match(failed.mission.failureReason, /effondrement/);
});
test('Pangaea has seven distinct live castes, healthy populations and infection transmission; nest containment reverses isolated infection', async () => {
  const { engine } = await fixture('pangaea-second-extinction'); const state = engine.ecosystemV131;
  assert.equal(SAURIA_CASTES_V131.length, 7); assert.equal(new Set(SAURIA_CASTES_V131.map(caste => caste.action)).size, 7);
  assert.equal(state.population.length, 14); assert.equal(state.population.filter(member => member.status === 'healthy').length, 7);
  const member = state.population[0], before = member.infection;
  advancePopulationV131(state, 2, new Map(state.population.map(member => [member.id, { x: 100, y: 570 }]))); assert.ok(member.infection > before);
  targets(engine); const raised = member.infection;
  advancePopulationV131(state, 2, new Map(state.population.map((member, index) => [member.id, { x: index * 1000, y: 570 }]))); assert.ok(member.infection < raised);
  state.integrity = biosphereIntegrityV131(state); assert.ok(validateEcosystemStateV131(state).valid);
});
test('Pangaea vaccination needs a healthy physical host and limited charges; losing too many hosts fails the mission', async () => {
  const { engine } = await fixture('pangaea-second-extinction');
  const member = engine.ecosystemV131.population[0], hostActor = engine.ecosystemActorV131(member.id);
  locate(engine, centerX(hostActor)); engine.keys.add('KeyE'); advance(engine, 2.05);
  assert.equal(member.status, 'rescued'); assert.equal(engine.ecosystemV131.rescued, 1); assert.equal(engine.ecosystemV131.vaccineCharges, 4);
  assert.equal(hostActor.alive, false); assert.equal(engine.ecosystemV131.deadHealthy, 0);
  engine.keys.clear(); assert.equal(destroy(engine, 'eco131-boss'), 0);
  for (const member of engine.ecosystemV131.population.filter(member => member.status === 'healthy').slice(0, 5)) destroy(engine, member.id);
  advance(engine, .1); assert.equal(engine.mission.state, 'failed');
});
function centerX(actor) { return actor.x + actor.w / 2; }
test('original creature controllers respect sight blockers and warn before contact, acid and charge attacks', async () => {
  const { engine } = await fixture('pangaea-second-extinction');
  const hunter = engine.enemies.find(actor => actor.ecosystemActorV131.caste === 'hunter' && actor.ecosystemActorV131.role === 'sauria');
  locate(engine, centerX(hunter) - 100); engine.walls = [{ id: 'test-cover', x: engine.player.x + 60, y: 450, w: 8, h: 120 }];
  const health = engine.player.health, x = hunter.x; for (let index = 0; index < 120; index++) engine.updateEnemy(hunter, 1 / 60);
  assert.equal(engine.player.health, health); assert.equal(hunter.x, x);
  engine.walls = []; for (let index = 0; index < 8; index++) engine.updateEnemy(hunter, 1 / 60);
  assert.equal(engine.player.health, health, 'No instant contact on first perception');
  const spitter = engine.enemies.find(actor => actor.ecosystemActorV131.caste === 'spitter' && actor.ecosystemActorV131.role === 'sauria');
  locate(engine, centerX(spitter) - 160, 355); spitter.attackClock = 0;
  engine.updateEnemy(spitter, .1); assert.equal(engine.hostileProjectiles.length, 0);
  for (let index = 0; index < 8; index++) engine.updateEnemy(spitter, .1);
  assert.ok(engine.hostileProjectiles.length > 0, JSON.stringify({ x: spitter.x, y: spitter.y, clock: spitter.clock, attackClock: spitter.attackClock, windup: spitter.windup,
    actor: { x: engine.player.x, y: engine.player.y, alive: engine.player.alive, downed: engine.player.downed }, line: engine.ecosystemLineClearV131(spitter, engine.player), caste: spitter.ecosystemActorV131.caste }));
  assert.ok(engine.hostileProjectiles.some(projectile => projectile.vy !== 0));
});
test('Sauria charge, leap, burrow, swimming bounds and frontal plates change real combat outcomes', async () => {
  const { engine } = await fixture('pangaea-second-extinction');
  const casteActor = id => engine.enemies.find(actor => actor.ecosystemActorV131.caste === id && actor.ecosystemActorV131.role === 'sauria');
  const charger = casteActor('charger'); locate(engine, centerX(charger) - 200);
  charger.attackClock = 0; const start = charger.x;
  for (let index = 0; index < 9; index++) engine.updateEnemy(charger, .1);
  assert.equal(charger.actionPhase, 2); const windupDistance = start - charger.x;
  const chargeStart = charger.x; engine.updateEnemy(charger, .1);
  assert.ok(chargeStart - charger.x > windupDistance / 9 * 2, 'Acceleration follows the announced charge');
  const leaper = casteActor('leaper'); locate(engine, centerX(leaper) - 170, 355); leaper.attackClock = 0;
  for (let index = 0; index < 8; index++) engine.updateEnemy(leaper, .1);
  assert.ok(leaper.y < 355 - leaper.h, 'Leaper follows an actual ballistic rise');
  const burrower = casteActor('burrower'); locate(engine, centerX(burrower) - 100); burrower.clock = 0;
  engine.updateEnemy(burrower, .1); assert.equal(burrower.actionPhase, 1); assert.equal(destroy(engine, burrower.id, 10), 0);
  burrower.clock = 2.1; engine.updateEnemy(burrower, .1); assert.equal(burrower.actionPhase, 0); assert.equal(destroy(engine, burrower.id, 10), 10);
  const swimmer = casteActor('swimmer'); locate(engine, 2850);
  for (let index = 0; index < 100; index++) engine.updateEnemy(swimmer, .1);
  assert.ok(swimmer.x + swimmer.w <= 2820 && swimmer.x >= 2300);
  const sentinel = casteActor('sentinel'); sentinel.facing = -1;
  const front = engine.applyEnemyDamage(sentinel, 20, { owner: engine.player, x: sentinel.x - 10, kind: 'rifle' });
  const rear = engine.applyEnemyDamage(sentinel, 20, { owner: engine.player, x: sentinel.x + sentinel.w + 10, kind: 'rifle' });
  assert.equal(front, 9); assert.equal(rear, 20);
});
test('resume round-trips biological progression, pressure, actors, ammunition, squad and checkpoint without regenerating rewards', async () => {
  const { engine } = await fixture('queen-mother-song', null, CREW.slice(0, 1));
  targets(engine); destroy(engine, 'eco131-boss'); engine.ecosystemV131.pressure = 39;
  engine.player.ammoReserve = 53; const save = engine.captureResumeState(); assert.ok(engine.validateEcosystemResumeV131(save).valid);
  const resumed = (await fixture('queen-mother-song', save, CREW.slice(0, 1))).engine;
  assert.equal(resumed.lastResumeResult.applied, true); assert.equal(resumed.ecosystemV131.pressure, 39);
  assert.equal(resumed.ecosystemV131.bossPhase, 2); assert.equal(resumed.ecosystemActorV131('eco131-boss').health, 450);
  assert.equal(resumed.player.ammoReserve, 53); assert.equal(resumed.squadActors.length, engine.squadActors.length);
  resumed.failMission('fixture'); assert.equal(resumed.restartFromCheckpoint(), true); assert.equal(resumed.mission.state, 'active');
});
test('forged progression, identity, missing actors and completed missions without required defence are rejected atomically', async () => {
  const { engine } = await fixture(); const before = engine.captureResumeState();
  for (const corrupt of [
    raw => { raw.identity.campaignId = 'other'; },
    raw => { raw.specialOperation.ecosystemV131.targets[0] = true; },
    raw => { raw.enemies.pop(); },
    raw => { raw.specialOperation.ecosystemV131.actors[0].x += 20; },
    raw => { raw.enemies.find(actor => actor.id === 'eco131-boss').id = 'eco131-forged-boss'; raw.specialOperation.ecosystemV131.actors.find(actor => actor.id === 'eco131-boss').id = 'eco131-forged-boss'; },
    raw => { raw.specialOperation.ecosystemV131.pressure = NaN; },
    raw => { raw.specialOperation.ecosystemV131.bossPhase = 4; raw.specialOperation.ecosystemV131.phase = ecosystemPhaseV131(raw.specialOperation.ecosystemV131); },
    raw => { const state = raw.specialOperation.ecosystemV131; state.complete = true; state.rewardClaimed = true; state.rewards = {}; state.bossDefeated = true;
      state.targets.fill(true); state.extractionProgress = 2; state.phase = 'complete'; raw.mission.state = 'complete'; }
  ]) {
    const raw = structuredClone(before); corrupt(raw); assert.equal(engine.applyResumeState(raw).applied, false);
    assert.deepEqual(engine.captureResumeState(), before);
  }
});
test('mission-complete observers synchronously capture terminal biological state and the final reward outcome', async () => {
  const { engine } = await fixture('hive-world'); targets(engine); boss(engine);
  let captured = null, emitted = null; const sink = engine.onEvent;
  engine.onEvent = event => { if (event.type === 'mission-complete') { emitted = event; captured = engine.captureResumeState(); } sink(event); };
  locate(engine, 180); engine.keys.add('KeyE'); advance(engine, 2.05);
  assert.ok(captured); assert.equal(captured.specialOperation.ecosystemV131.complete, true);
  assert.equal(captured.specialOperation.ecosystemV131.rewardClaimed, true);
  assert.equal(captured.specialOperation.ecosystemV131.ending, emitted.rewards.ending);
  assert.deepEqual(captured.specialOperation.ecosystemV131.rewards, emitted.rewards);
  assert.ok(engine.validateEcosystemResumeV131(captured).valid);
});
test('Pangaea resume validates rescued actors and population health, then can complete only after three rescues and the colossus', async () => {
  const { engine } = await fixture('pangaea-second-extinction'); targets(engine);
  for (const member of engine.ecosystemV131.population.filter(member => member.status === 'healthy').slice(0, 3)) {
    const actor = engine.ecosystemActorV131(member.id); locate(engine, centerX(actor)); engine.keys.add('KeyE'); advance(engine, 2.05); engine.keys.clear();
  }
  assert.equal(engine.ecosystemV131.rescued, 3); boss(engine);
  const save = engine.captureResumeState(); assert.ok(engine.validateEcosystemResumeV131(save).valid);
  const resumed = (await fixture('pangaea-second-extinction', save)).engine;
  assert.ok(resumed.lastResumeResult.applied); assert.equal(resumed.ecosystemV131.rescued, 3);
  locate(resumed, 4950); resumed.keys.add('KeyE'); advance(resumed, 2.05);
  assert.equal(resumed.mission.state, 'complete'); assert.ok(validateEcosystemStateV131(resumed.ecosystemV131).valid);
});
