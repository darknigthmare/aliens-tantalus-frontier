import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameEngine } from '../src/game-production-runtime.js';
import { HIVE_CAMPAIGNS_V131, buildHiveMissionV131 } from '../src/hive-missions-v131.js';
import { createHiveControlV131, hivePhaseV131, validateHiveControlV131, hiveEndingAvailabilityV131 } from '../src/hive-control-v131.js';
import { WORLDS, WEAPONS, ENEMIES, CREW } from '../src/content.js';

// Host substitutes are DOM, images and RAF. Isolated channel tests suspend
// hostile AI explicitly; player movement, doors, possession, ally navigation,
// damage delivery, resources, event captures and persistence are production code.
function fixture(index = 0, { peace = true, onEvent, ...extra } = {}) {
  const windowEvents = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = windowEvents[name].bind(windowEvents);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 1024; naturalHeight = 1024; width = 1024; height = 1024;
    async decode() {}
    set src(value) { this._src = value; queueMicrotask(() => this.dispatchEvent(new Event('load'))); }
    get src() { return this._src; }
  };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const canvas = Object.assign(new EventTarget(), { getContext: () => ({}), focus() { document.activeElement = this; },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const events = [], campaign = HIVE_CAMPAIGNS_V131[index], level = buildHiveMissionV131({ campaign, world: WORLDS[0] });
  const engine = new GameEngine(canvas, { onEvent: event => { events.push(event); onEvent?.(event, engine); } });
  const options = { campaign, world: WORLDS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 8), missionLevel: level,
    equipment: [], crew: [], seed: 426, ...extra };
  engine.start(options);
  if (peace) engine.updateEnemy = () => {};
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true });
    Object.assign(event, { code, repeat: false, ctrlKey: false, altKey: false, metaKey: false, isComposing: false });
    windowEvents.dispatchEvent(event);
  };
  return { engine, level, options, events, key };
}
function tick(engine, seconds) {
  for (let remaining = seconds; remaining > 1e-9;) { const dt = Math.min(1 / 60, remaining); engine.update(dt); remaining -= dt; }
}
function station(engine, id) { return engine.hiveManifestV131.stations.find(entry => entry.id === id); }
function local(engine, id) {
  const place = typeof id === 'object' ? id : station(engine, id);
  Object.assign(engine.player, { x: place.x - engine.player.w / 2, y: place.floorY - engine.player.h, vx: 0, vy: 0,
    grounded: true, climbing: false, interactionClock: 0, toolUseClock: 0 });
}
function hold(f, id, seconds = null) {
  local(f.engine, id); f.key('keydown', 'KeyE'); tick(f.engine, seconds ?? ((station(f.engine, id)?.duration || 0) + 0.1));
  f.key('keyup', 'KeyE'); tick(f.engine, 1 / 60);
}
function tap(f, id) { local(f.engine, id); f.key('keydown', 'KeyE'); f.key('keyup', 'KeyE'); tick(f.engine, 1 / 60); }
function commission(f) { hold(f, 'commission'); assert.equal(f.engine.hiveV131.commissioned, true); }
function beatBoss(f) {
  const boss = f.engine.hiveBossV131();
  assert.equal(f.engine.hiveV131.bossReleased, true);
  for (let phase = 0; phase < 3; phase++) {
    for (let hits = 0; hits < 100 && boss.alive && !f.engine.hiveV131.bossShielded; hits++)
      f.engine.applyEnemyDamage(boss, 95, { owner: f.engine.player, kind: 'integration-damage' });
    if (phase < 2) { assert.equal(f.engine.hiveV131.bossShielded, true); hold(f, 'boss-relay'); assert.equal(f.engine.hiveV131.bossShielded, false); }
  }
  assert.equal(f.engine.hiveV131.bossDefeated, true); assert.equal(boss.alive, false);
}
function walkTo(f, x) {
  const direction = x > f.engine.player.x + f.engine.player.w / 2 ? 'KeyD' : 'KeyA';
  f.key('keydown', direction);
  for (let frame = 0; frame < 1600 && Math.abs(f.engine.player.x + f.engine.player.w / 2 - x) > 20; frame++) tick(f.engine, 1 / 60);
  f.key('keyup', direction); tick(f.engine, 0.2);
  assert.ok(Math.abs(f.engine.player.x + f.engine.player.w / 2 - x) < 65, `Unable to walk to ${x}: actor ${f.engine.player.x}`);
}

test('three authored hive missions have distinct campaigns, physical routes and disclosed missing character art', () => {
  const plans = HIVE_CAMPAIGNS_V131.map(campaign => buildHiveMissionV131({ campaign }));
  assert.equal(new Set(plans.map(plan => plan.signature)).size, 3);
  for (const plan of plans) {
    assert.equal(plan.validation.valid, true); assert.equal(plan.validation.connectedNodes, 10);
    assert.equal(plan.graph.routes.length, 3); assert.equal(plan.geometry.ladders.length, 4);
    assert.ok(plan.hiveMissionV131.artDebt.length > 0); assert.equal(plan.routeRuntime.source, 'hive-mission-v131');
  }
  assert.equal(plans[0].hiveMissionV131.stations.filter(place => place.profile).length, 3);
  assert.equal(plans[1].hiveMissionV131.stations.filter(place => place.order).length, 3);
  assert.equal(plans[2].hiveMissionV131.stations.filter(place => place.id.startsWith('pylon-')).length, 3);
  assert.ok(HIVE_CAMPAIGNS_V131.every(campaign => campaign.canonExact === false));
});

test('Jeri insertion, commissioning and the worker inspection are reachable by actual keyboard movement', () => {
  const f = fixture(0, { peace: false });
  const avatar = f.engine.player, appearance = avatar.appearanceV126;
  const spawn = avatar.x;
  walkTo(f, 240); assert.ok(avatar.x > spawn);
  f.key('keydown', 'KeyE'); tick(f.engine, 2.1); f.key('keyup', 'KeyE'); tick(f.engine, 0.05);
  assert.equal(f.engine.hiveV131.commissioned, true);
  walkTo(f, 920);
  assert.ok(avatar.x + avatar.w < 1000, 'The shutter must be in its authored column, not an oversized invisible bitmap collider.');
  f.key('keydown', 'KeyE'); f.key('keyup', 'KeyE'); tick(f.engine, 0.5);
  assert.ok(f.engine.hiveV131.inspections.includes('inspection-worker'));
  assert.equal(f.engine.doors.find(door => door.id === 'hive-gate-worker').open, true);
  walkTo(f, 1100);
  assert.equal(f.engine.player, avatar); assert.equal(avatar.appearanceV126, appearance);
  assert.equal(f.engine.getSnapshot().destructibleSceneryV130?.active || false, false);
  f.engine.stop();
});

test('failed caste inspection raises a persistent alarm without opening the shutter or granting charge', () => {
  const f = fixture(); commission(f);
  assert.equal(f.engine.performHiveActionV131('profile', 'warrior').applied, true);
  const charge = f.engine.hiveV131.charge;
  tap(f, 'inspection-worker');
  assert.equal(f.engine.hiveV131.failedInspections, 1);
  assert.ok(f.engine.hiveV131.threats.includes('inspection-worker'));
  assert.equal(f.engine.doors.find(door => door.id === 'hive-gate-worker').open, false);
  assert.equal(f.engine.hiveV131.charge, charge);
  assert.equal(f.engine.applyResumeState(f.engine.captureResumeState()).applied, true);
  f.engine.stop();
});

test('Jeri segmented damage, implantation deadline and checkpoint recovery are real failure states', () => {
  const f = fixture(); commission(f);
  const actor = f.engine.player;
  f.engine.damagePlayer(actor, 10, { hitY: actor.y + 2, source: 'test-segment' });
  assert.equal(f.engine.hiveV131.segments.head, 93); assert.equal(f.engine.hiveV131.segments.torso, 140);
  for (let frame = 0; frame < 1501; frame++) f.engine.update(0.1);
  assert.equal(f.engine.mission.state, 'failed'); assert.equal(f.engine.hiveV131.implanted, true);
  assert.equal(f.engine.restartFromCheckpoint(), true);
  assert.equal(f.engine.mission.state, 'active'); assert.equal(f.engine.hiveV131.implanted, false);
  assert.equal(f.engine.player, actor); assert.equal(f.engine.mission.retries, 1);
  f.engine.stop();
});

test('Jeri completes inspections, timed rescue, three SAINT phases and final inspection before a valid synchronous victory save', () => {
  let victorySave = null;
  const f = fixture(0, { onEvent: (event, engine) => { if (event.type === 'mission-complete') victorySave = engine.captureResumeState(); } });
  commission(f); tap(f, 'inspection-worker');
  assert.equal(f.engine.performHiveActionV131('profile', 'nurse').applied, true); tap(f, 'inspection-nurse');
  hold(f, 'rescue'); assert.equal(f.engine.hiveV131.rescued, true); beatBoss(f);
  assert.equal(f.engine.performHiveActionV131('profile', 'royal-echo').applied, true); tap(f, 'inspection-queen');
  hold(f, 'extraction'); assert.equal(f.engine.mission.state, 'complete');
  assert.ok(victorySave); assert.equal(f.engine.validateHiveResumeV131(victorySave).valid, true);
  assert.equal(victorySave.hiveMissionV131.state.rewardClaimed, true);
  assert.equal(victorySave.hiveMissionV131.state.rewards.operationId, 'jeri-false-son');
  assert.equal(f.engine.completeMission(), false);
  assert.equal(f.events.filter(event => event.type === 'mission-complete').length, 1); f.engine.stop();
});

test('ATAX recruitment requires proximity, occlusion and finite charge and keeps the original player and crew references', () => {
  const f = fixture(1, { crew: CREW.slice(0, 1) }); commission(f);
  const original = f.engine.player, squad = f.engine.squadActors, crewMember = squad[0], recruit = f.engine.hiveActorsV131[0];
  assert.equal(f.engine.recruitHiveActorV131(recruit.id).applied, false);
  local(f.engine, { x: recruit.x + recruit.w / 2, floorY: recruit.y + recruit.h });
  f.engine.walls.push({ id: 'recruit-blocker', x: f.engine.player.x + 10, y: f.engine.player.y, w: 8, h: f.engine.player.h });
  assert.equal(f.engine.recruitHiveActorV131(recruit.id).applied, false);
  f.engine.walls = []; const charge = f.engine.hiveV131.charge;
  assert.equal(f.engine.recruitHiveActorV131(recruit.id).applied, true); assert.equal(f.engine.hiveV131.charge, charge - 12);
  assert.equal(f.engine.recruitHiveActorV131(recruit.id).applied, false);
  assert.equal(f.engine.player, original); assert.equal(f.engine.squadActors, squad); assert.equal(f.engine.squadActors[0], crewMember);
  f.engine.stop();
});

test('possession moves a recruited caste, consumes charge, returns safely and never swaps or moves J1 by reference', () => {
  const f = fixture(1); commission(f);
  const recruit = f.engine.hiveActorsV131[0]; local(f.engine, { x: recruit.x + recruit.w / 2, floorY: recruit.y + recruit.h });
  f.engine.recruitHiveActorV131(recruit.id);
  const original = f.engine.player, x = original.x, appearance = original.appearanceV126, charge = f.engine.hiveV131.charge;
  assert.equal(f.engine.possessHiveActorV131(recruit.id).applied, true);
  const recruitX = recruit.x; f.key('keydown', 'KeyD'); tick(f.engine, 0.5); f.key('keyup', 'KeyD');
  assert.ok(recruit.x > recruitX + 90); assert.equal(original.x, x); assert.equal(f.engine.player, original);
  assert.equal(original.appearanceV126, appearance);
  assert.ok(f.engine.hiveV131.charge < charge - 6);
  assert.equal(f.engine.applyResumeState(f.engine.captureResumeState()).applied, true);
  assert.equal(f.engine.player, original); assert.equal(f.engine.hiveControlledActorV131(), recruit);
  assert.equal(f.engine.releaseHivePossessionV131(), true); assert.equal(f.engine.hiveV131.possession, null);
  assert.deepEqual(original.appearanceV126, appearance); assert.equal(original.x, x); f.engine.stop();
});

test('controlled caste attacks respect a wall and cannot spend charge or damage a target through it', () => {
  const f = fixture(1); commission(f);
  const recruit = f.engine.hiveActorsV131[0], target = f.engine.enemies[0];
  local(f.engine, { x: recruit.x + recruit.w / 2, floorY: 760 }); f.engine.recruitHiveActorV131(recruit.id);
  Object.assign(target, { x: recruit.x + recruit.w + 20, y: 760 - target.h, dormant: false });
  f.engine.walls = [{ id: 'attack-wall', x: recruit.x + recruit.w + 6, y: 550, w: 8, h: 210 }];
  const health = target.health, charge = f.engine.hiveV131.charge;
  assert.equal(f.engine.hiveAttackV131(recruit), false); assert.equal(target.health, health); assert.equal(f.engine.hiveV131.charge, charge);
  f.engine.walls = []; assert.equal(f.engine.hiveAttackV131(recruit), true);
  assert.ok(target.health < health); assert.equal(f.engine.hiveV131.charge, charge - 1.5); f.engine.stop();
});

test('ATAX orders navigate real ladders to three arteries and all are required before the chamber boss', () => {
  const f = fixture(1); commission(f);
  for (const actor of f.engine.hiveActorsV131.slice(0, 2)) { local(f.engine, { x: actor.x + actor.w / 2, floorY: 760 }); f.engine.recruitHiveActorV131(actor.id); }
  for (const [order, id] of [['bulwark', 'artery-bulwark'], ['shadow', 'artery-shadow'], ['claw', 'artery-claw']]) {
    local(f.engine, id); assert.equal(f.engine.issueHiveOrderV131(order).applied, true);
    const goal = station(f.engine, id);
    for (let frame = 0; frame < 2400 && !f.engine.hiveActorsV131.some(actor => actor.hiveRecruitedV131
      && Math.hypot(actor.x + actor.w / 2 - goal.x, actor.y + actor.h - goal.floorY) <= 140); frame++) tick(f.engine, 1 / 60);
    hold(f, id); assert.ok(f.engine.hiveV131.arteries.includes(id), `An ally must physically reach ${id}.`);
  }
  assert.equal(f.engine.hiveV131.bossReleased, true);
  beatBoss(f); hold(f, 'extraction'); assert.equal(f.engine.mission.state, 'complete');
  assert.equal(f.engine.validateHiveResumeV131(f.engine.captureResumeState()).valid, true); f.engine.stop();
});

test('Eloise pylons consume charge, remove a real barrier, add a bridge and expose the contested hazard', () => {
  const f = fixture(2); commission(f);
  const before = f.engine.hiveV131.charge;
  assert.ok(f.engine.walls.some(wall => wall.id === 'hive-corporate-barrier'));
  hold(f, 'pylon-0');
  assert.equal(f.engine.hiveV131.pylons[0], 'attuned'); assert.equal(f.engine.hiveV131.charge, before - 8);
  assert.equal(f.engine.walls.some(wall => wall.id === 'hive-corporate-barrier'), false);
  assert.ok(f.engine.platforms.some(surface => surface.id === 'hive-organic-bridge'));
  const once = f.engine.hiveV131.charge; hold(f, 'pylon-0'); assert.equal(f.engine.hiveV131.charge, once);
  hold(f, 'pylon-1'); assert.ok(f.engine.hazards.some(hazard => hazard.active));
  const saved = f.engine.captureResumeState(); assert.equal(f.engine.applyResumeState(saved).applied, true);
  assert.ok(f.engine.platforms.some(surface => surface.id === 'hive-organic-bridge')); f.engine.stop();
});

test('Eloise has four conditional endings with a single immutable chosen conclusion', () => {
  const f = fixture(2); commission(f);
  hold(f, 'hush');
  const firstborn = f.engine.hiveActorsV131[0]; local(f.engine, { x: firstborn.x + firstborn.w / 2, floorY: 460 });
  assert.equal(f.engine.recruitHiveActorV131(firstborn.id).applied, true);
  for (const id of ['pylon-0', 'pylon-1', 'pylon-2']) hold(f, id);
  beatBoss(f); local(f.engine, 'nexus');
  const endings = hiveEndingAvailabilityV131(f.engine.hiveV131, f.engine.hiveActorsV131);
  assert.equal(endings.length, 4); assert.ok(endings.find(ending => ending.id === 'coexistence').canApply);
  assert.equal(endings.find(ending => ending.id === 'severance').canApply, false);
  assert.equal(f.engine.decideHiveEndingV131('coexistence').applied, true);
  assert.equal(f.engine.decideHiveEndingV131('sacrifice').applied, false);
  hold(f, 'extraction'); assert.equal(f.engine.mission.state, 'complete');
  const saved = f.engine.captureResumeState(); assert.equal(saved.hiveMissionV131.state.rewards.ending, 'coexistence');
  assert.equal(f.engine.validateHiveResumeV131(saved).valid, true); f.engine.stop();
});

test('pause and loading freeze royal charge, choir, possession and mission time; UI actions revalidate availability', () => {
  const f = fixture(2); commission(f);
  for (const reason of ['paused', 'enemyAtlasLoadingPausedV65', 'userCasteLoadingV88']) {
    f.engine[reason] = true;
    const before = f.engine.captureResumeState(); tick(f.engine, 1);
    assert.equal(f.engine.performHiveActionV131('consciousness', 'hive').applied, false);
    assert.deepEqual(f.engine.captureResumeState(), before); f.engine[reason] = false;
  }
  assert.equal(f.engine.performHiveActionV131('consciousness', 'hive').applied, true);
  assert.ok(f.engine.getHiveCommandModelV131().consciousnesses.every(choice => typeof choice.reason === 'string')); f.engine.stop();
});

test('finite capsules, invalid ledger, foreign identities and duplicate actors cannot grant resources or mutate a session', () => {
  const f = fixture(1); commission(f); tap(f, 'capsule-c');
  const charge = f.engine.hiveV131.charge; tap(f, 'capsule-c'); assert.equal(f.engine.hiveV131.charge, charge);
  const original = f.engine.captureResumeState();
  for (const modify of [save => save.identity.seed++, save => save.hiveMissionV131.state.charge++,
    save => save.hiveMissionV131.actors.push({ ...save.hiveMissionV131.actors[0] })]) {
    const forged = structuredClone(original); modify(forged);
    assert.equal(f.engine.applyResumeState(forged).applied, false);
    assert.deepEqual(f.engine.captureResumeState(), original);
  }
  f.engine.stop();
});

test('state validators reject every terminal state that skipped the mission-specific prerequisites', () => {
  for (const campaign of HIVE_CAMPAIGNS_V131) {
    const plan = buildHiveMissionV131({ campaign }), forged = createHiveControlV131(campaign.specialOperationId);
    Object.assign(forged, { complete: true, rewardClaimed: true, rewards: {}, bossDefeated: true,
      bossReleased: true, bossPhase: 2, exitProgress: 2, killedIds: ['hive-boss'] });
    forged.phase = hivePhaseV131(forged);
    assert.equal(validateHiveControlV131(forged, plan.hiveMissionV131).valid, false);
  }
});

test('starting another operation clears hive state and leaves no active possession or inherited mission roster', () => {
  const f = fixture(1); commission(f);
  f.engine.start({ ...f.options, campaign: { id: 'ordinary-restart', mode: 'FRONTIER' }, missionLevel: undefined });
  assert.equal(f.engine.hiveV131, null); assert.equal(f.engine.hiveManifestV131, null);
  assert.deepEqual(f.engine.hiveActorsV131, []); f.engine.stop();
});

test('Jeri reaches the high deck through real walking and ladders with its head below the HUD and filled parallax', () => {
  const f = fixture();
  walkTo(f, 240); f.key('keydown', 'KeyE'); tick(f.engine, 2.1); f.key('keyup', 'KeyE'); tick(f.engine, 0.1);
  walkTo(f, 920); f.key('keydown', 'KeyE'); f.key('keyup', 'KeyE'); tick(f.engine, 0.5);
  f.engine.performHiveActionV131('profile', 'nurse');
  walkTo(f, 1820); f.key('keydown', 'KeyE'); f.key('keyup', 'KeyE'); tick(f.engine, 0.5);
  walkTo(f, 2151); f.key('keydown', 'KeyW');
  for (let frame = 0; frame < 360 && f.engine.player.y + f.engine.player.h > 300.01; frame++) tick(f.engine, 1 / 60);
  f.key('keyup', 'KeyW'); tick(f.engine, 0.5);
  assert.equal(f.engine.player.y + f.engine.player.h, 300);
  assert.ok(f.engine.camera.y < 0); assert.ok(f.engine.player.y - f.engine.camera.y >= 190);
  assert.equal(f.engine.player.grounded, true);
  const draws = [], ctx = { save() {}, restore() {}, drawImage(...args) { draws.push(args); }, globalAlpha: 1 };
  const image = { complete: true, naturalWidth: 1024, naturalHeight: 512 };
  for (const factor of [0.075, 0.32, 1.12]) {
    draws.length = 0; f.engine.drawMissionLevelCover(ctx, image, factor, 0.5, 1.08, 0);
    assert.ok(draws.length && draws.every(args => args[2] <= 0 && args[2] + args[4] >= 720));
  }
  for (const reason of ['paused', 'enemyAtlasLoadingPausedV65', 'userCasteLoadingV88']) {
    const camera = { ...f.engine.camera }; f.engine[reason] = true; tick(f.engine, 0.4);
    assert.deepEqual(f.engine.camera, camera); f.engine[reason] = false;
  }
  assert.ok(f.engine.phaseLabel().includes('JERI')); assert.equal(f.engine.phaseLabel().includes('jeri-false-son'), false);
  assert.equal(f.engine.getHiveCommandModelV131().profileLabel, 'Nourrice'); f.engine.stop();
});

test('a possessed caste resumes an airborne trajectory exactly without making the parked original operator jump', () => {
  const f = fixture(1); commission(f);
  const actor = f.engine.hiveActorsV131[0]; local(f.engine, { x: actor.x + actor.w / 2, floorY: 760 });
  f.engine.recruitHiveActorV131(actor.id); f.engine.possessHiveActorV131(actor.id);
  const original = f.engine.player, parkedY = original.y;
  f.key('keydown', 'Space'); tick(f.engine, 0.2); f.key('keyup', 'Space');
  assert.equal(original.y, parkedY); assert.equal(actor.grounded, false);
  const save = f.engine.captureResumeState(), y = actor.y, vy = actor.vy;
  assert.equal(f.engine.applyResumeState(save).applied, true); assert.equal(actor.y, y); assert.equal(actor.vy, vy);
  tick(f.engine, 0.03); assert.ok(Math.abs(actor.y - y) < 15);
  f.engine.releaseHivePossessionV131(); tick(f.engine, 0.8);
  assert.equal(actor.y + actor.h, 760); assert.equal(actor.grounded, true); assert.equal(original.y, parkedY); f.engine.stop();
});

test('enemy windup impacts on recruits respect walls and preserve exactly-once damage across resume', () => {
  const f = fixture(1); commission(f);
  const actor = f.engine.hiveActorsV131[0], enemy = f.engine.enemies[0];
  local(f.engine, { x: actor.x + actor.w / 2, floorY: 760 }); f.engine.recruitHiveActorV131(actor.id);
  local(f.engine, 'commission');
  Object.assign(enemy, { x: actor.x + actor.w + 12, y: 760 - enemy.h, dormant: false });
  const update = GameEngine.prototype.updateEnemy.bind(f.engine);
  f.engine.walls = [{ id: 'claw-blocker', x: actor.x + actor.w + 3, y: 510, w: 8, h: 250 }];
  for (let frame = 0; frame < 12; frame++) update(enemy, 0.1);
  assert.equal(actor.health, 70); f.engine.walls = [];
  for (let frame = 0; frame < 3; frame++) update(enemy, 0.1);
  assert.equal(actor.health, 70);
  const beforeImpact = f.engine.captureResumeState();
  update(enemy, 0.1); update(enemy, 0.1); assert.ok(actor.health < 70);
  const damaged = actor.health, afterImpact = f.engine.captureResumeState();
  assert.equal(f.engine.applyResumeState(beforeImpact).applied, true); assert.equal(actor.health, 70);
  update(enemy, 0.1); update(enemy, 0.1); assert.equal(actor.health, damaged);
  assert.equal(f.engine.applyResumeState(afterImpact).applied, true);
  update(enemy, 0.1); assert.equal(actor.health, damaged);
  f.engine.stop();
});
