import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_USER_CASTES_V87 } from '../src/enemy-user-castes-v87.js';

globalThis.addEventListener = () => {};
globalThis.requestAnimationFrame = () => 1;
globalThis.Image = class {
  complete = true; naturalWidth = 1024; naturalHeight = 1024; width = 1024; height = 1024;
  set src(value) { this.currentSrc = value; }
};
const { BioforgeRuntimeV80 } = await import('../src/bioforge-runtime-v80.js');
const { BIOFORGE_TERRESTRIAL_ROSTER_V80 } = await import('../src/bioforge-session-v80.js');
const { getOvomorphChildIdV66 } = await import('../src/enemy-ovomorph-cycle-v66.js');

function fixture(configuration = { profileId: 'enemy-002-facehugger', quantity: 2 }) {
  const noop = () => {};
  const ctx = new Proxy({ globalAlpha: 1, measureText: value => ({ width: String(value).length * 8 }) }, { get: (target, key) => target[key] ?? noop });
  const events = [], writes = [];
  let clock = 1000;
  const engine = new BioforgeRuntimeV80({ width: 1280, height: 720, getContext: () => ctx, addEventListener: noop, focus: noop }, {
    assets: {}, testMode: true, autoLoop: false, now: () => ++clock,
    onEvent: event => events.push(event), onPersist: state => writes.push(structuredClone(state))
  });
  for (const d of ENEMY_USER_CASTES_V87) engine.images.set(d.imageKey, {
    complete: true, naturalWidth: d.sourceWidth, naturalHeight: d.sourceHeight, src: d.path
  });
  if (configuration) engine.start({ configuration, autoLoop: false, testMode: true, assets: {} });
  return { engine, events, writes };
}

function enter(engine) {
  const first = engine.doors.find(door => door.id === 'control-seal');
  const second = engine.doors.find(door => door.id === 'inner-interlock');
  const printer = engine.bioforgeLevelV80.stations.find(station => station.type === 'printer');
  engine.player.x = first.x - engine.player.w - 10; assert.equal(engine.interact(), true);
  engine.player.x = second.x - engine.player.w - 45; assert.equal(engine.interact(), true);
  engine.player.x = printer.x - 20; assert.equal(engine.interact(), true);
  engine.player.x = engine.bioforgeLevelV80.arenaBounds.x + 8; engine.update(.016);
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'sealing');
  assert.equal(engine.advanceBioforgePhaseV80().event.type, 'bioforge-printer-ready');
  engine.player.x = 1320;
}

function print(engine) {
  const operation = engine.advanceBioforgePhaseV80();
  assert.equal(operation.applied, true, operation.reason);
  assert.equal(operation.event.type, 'bioforge-specimen-printed');
  return engine.enemies.find(enemy => enemy.id === operation.event.specimenId);
}

function resume(engine) {
  const next = fixture(null).engine;
  const state = engine.captureBioforgeResumeStateV80();
  assert.ok(state.state.runtimeV81.physicalV87, 'the actual runtime remains fully capturable');
  assert.equal(next.start({ resumeState: state, autoLoop: false, testMode: true, assets: {} }).started, true);
  return next;
}

test('48 queue entries use twelve physical slots successively, without consuming a saturated queue', () => {
  const { engine } = fixture({ profileId: 'enemy-002-facehugger', quantity: 48 });
  enter(engine);
  for (let index = 0; index < 12; index++) print(engine);
  const before = structuredClone(engine.bioforgeRootV80.activeSession);
  engine.bioforgePhaseClockV80 = .7;
  assert.equal(engine.advanceBioforgePhaseV80().reason, 'active-count-capacity');
  assert.deepEqual(engine.bioforgeRootV80.activeSession, before);
  assert.equal(engine.bioforgePhaseClockV80, .7);
  for (let index = 12; index < 48; index++) {
    const victim = engine.enemies.find(enemy => enemy.alive);
    assert.equal(engine.killBioforgeSpecimenV80(victim.id), true);
    print(engine);
    assert.equal(engine.enemies.filter(enemy => enemy.alive).length, 12);
  }
  assert.equal(engine.enemies.length, 48);
  assert.equal(new Set(engine.enemies.map(enemy => enemy.id)).size, 48);
  assert.equal(engine.getBioforgeSnapshotV80().printed, 48);
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'combat');
  assert.equal(resume(engine).enemies.length, 48);
});

test('a failed physical preflight creates no actor, event, consumed entry or phase-clock reset', () => {
  const { engine, events } = fixture(); enter(engine);
  const before = structuredClone(engine.bioforgeRootV80.activeSession);
  engine.bioforgePhaseClockV80 = .91;
  engine.spawnBioforgeSpecimenV80 = () => null;
  assert.equal(engine.advanceBioforgePhaseV80().reason, 'no-safe-spawn-position');
  assert.deepEqual(engine.bioforgeRootV80.activeSession, before);
  assert.equal(engine.bioforgePhaseClockV80, .91);
  assert.equal(engine.enemies.length, 0);
  assert.ok(!events.some(event => event.type === 'bioforge-specimen-printed'));
});

test('operator clearance blocks the twelfth slot until that real area is vacated', () => {
  const { engine } = fixture({ profileId: 'enemy-002-facehugger', quantity: 12 }); enter(engine);
  engine.player.x = 1350;
  for (let i = 0; i < 11; i++) print(engine);
  assert.equal(engine.advanceBioforgePhaseV80().reason, 'no-safe-spawn-position');
  engine.player.x = 1320; print(engine);
  assert.equal(engine.enemies.filter(enemy => enemy.alive).length, 12);
});

test('legacy twelve-body resume without physicalV87 accepts the old safe eight-pixel operator clearance', () => {
  const { engine } = fixture({ profileId: 'enemy-002-facehugger', quantity: 12 }); enter(engine);
  for (let i = 0; i < 12; i++) print(engine);
  const state = engine.captureBioforgeResumeStateV80();
  delete state.state.runtimeV81.physicalV87;
  state.state.runtimeV81.player.x = 1350;
  state.player.x = 1350;
  const next = fixture(null).engine;
  assert.equal(next.start({ resumeState: state, autoLoop: false, testMode: true, assets: {} }).started, true);
  assert.equal(next.enemies.length, 12);
  assert.equal(next.getBioforgeSnapshotV80().lastPurge, null);
  for (const enemy of next.enemies) {
    const p = next.player;
    assert.ok(enemy.x >= p.x + p.w || enemy.x + enemy.w <= p.x || enemy.y >= p.y + p.h || enemy.y + enemy.h <= p.y);
  }
});

test('combat, armour damage and firing run while printing; local kills never award campaign loot', () => {
  const { engine, events } = fixture({ profileId: 'enemy-004-drone-big-chap', quantity: 4 }); enter(engine);
  const enemy = print(engine);
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'printing');
  assert.equal(engine.fire(), true);
  const initial = enemy.health;
  const damage = engine.applyEnemyDamage(enemy, 10, { owner: engine.player });
  assert.equal(damage, Math.max(1, 10 - enemy.armor * .35));
  assert.equal(enemy.health, initial - damage);
  engine.applyEnemyDamage(enemy, 10000, { owner: engine.player });
  assert.equal(enemy.alive, false);
  assert.equal(engine.player.kills, 1);
  assert.deepEqual(engine.drops, []);
  assert.equal(engine.inventory.salvage, 0);
  assert.equal(engine.campaign, null);
  assert.ok(!events.some(event => ['kill', 'mission-complete', 'boss-defeated'].includes(event.type)));
  assert.ok(resume(engine).enemies.some(actor => actor.id === enemy.id && !actor.alive));
});

test('reload uses simulation time, resumes its exact cursor and transfers the laboratory rounds only once', () => {
  const { engine } = fixture(); enter(engine); print(engine);
  Object.assign(engine.player, { ammo: 0, health: 42, armor: 11, shots: 77 });
  assert.equal(engine.player.ammoReserve, 1600);
  assert.equal(engine.reload(), true);
  engine.update(.1); engine.update(.1);
  const elapsed = engine.player.tacticalReload.elapsed;
  const restored = resume(engine);
  assert.equal(restored.player.tacticalReload.elapsed, elapsed);
  assert.equal(restored.player.ammo, 0);
  assert.equal(restored.player.health, 42);
  assert.equal(restored.player.armor, 11);
  assert.equal(restored.player.shots, 77);
  restored.paused = true; restored.update(.1);
  assert.equal(restored.player.tacticalReload.elapsed, elapsed);
  restored.paused = false;
  for (let i = 0; i < 20; i++) restored.update(.1);
  assert.equal(restored.player.ammo, 12);
  assert.equal(restored.player.ammoReserve, 1588);
  assert.equal(restored.player.reloading, false);
  const again = resume(restored);
  assert.equal(again.player.ammo, 12);
  assert.equal(again.player.ammoReserve, 1588);
});

test('mixed reinforcement and per-line cancellation preserve old identities and affect only queued bodies', () => {
  const { engine } = fixture(); enter(engine);
  const existing = print(engine);
  const added = engine.reinforceBioforgeV87({ composition: [{ lineId: 'runtime-eggs-1', profileId: 'enemy-001-ovomorph', quantity: 2 }] }, { requestId: 'runtime-reinforcement-1' });
  assert.equal(added.applied, true);
  const line = engine.bioforgeRootV80.activeSession.composition.find(entry => entry.profileId === 'enemy-001-ovomorph');
  assert.equal(engine.cancelBioforgeQueueV87({ lineId: line.lineId }).applied, true);
  assert.equal(existing.alive, true);
  assert.equal(engine.bioforgeRootV80.activeSession.queue.filter(entry => entry.status === 'cancelled').length, 2);
  assert.equal(engine.reinforceBioforgeV87({ composition: [{ lineId: 'runtime-eggs-1', profileId: 'enemy-001-ovomorph', quantity: 2 }] }, { requestId: 'runtime-reinforcement-1' }).event.type, 'bioforge-reinforcements-replayed');
  print(engine);
  const restored = resume(engine);
  assert.deepEqual(restored.enemies.map(actor => actor.id), engine.enemies.map(actor => actor.id));
  assert.equal(restored.getBioforgeSnapshotV80().capacity.cancelled, 2);
});

test('form focus clears held movement and fire without pausing the independent printer simulation', t => {
  const { engine } = fixture(); enter(engine); print(engine);
  const oldDocument = globalThis.document;
  globalThis.document = { activeElement: { closest: () => ({ tagName: 'INPUT' }) } };
  t.after(() => { if (oldDocument === undefined) delete globalThis.document; else globalThis.document = oldDocument; });
  engine.keys.add('KeyD'); engine.keys.add('KeyF');
  const before = { x: engine.player.x, ammo: engine.player.ammo, time: engine.animationTime };
  engine.update(.1);
  assert.equal(engine.keys.size, 0);
  assert.equal(engine.player.x, before.x);
  assert.equal(engine.player.ammo, before.ammo);
  assert.equal(engine.fire(), false);
  assert.equal(engine.reload(), false);
  assert.ok(engine.animationTime > before.time);
});

test('failed persistence rolls a reinforcement back to the last durable state and stops without a second write', () => {
  const { engine } = fixture(); enter(engine); print(engine);
  const before = structuredClone(engine.bioforgeRootV80.activeSession);
  let attempts = 0;
  engine.onBioforgePersistV80 = () => { attempts++; throw new Error('QuotaExceededError'); };
  const operation = engine.reinforceBioforgeV87({ composition: [{ lineId: 'quota-reinforcements', profileId: 'enemy-003-chestburster', quantity: 3 }] }, { requestId: 'quota-request' });
  assert.equal(operation.applied, false);
  assert.equal(operation.reason, 'persistence-failed');
  assert.equal(attempts, 1);
  assert.deepEqual(engine.bioforgeRootV80.activeSession, before);
  assert.equal(engine.running, false);
  assert.equal(engine.paused, true);
  engine.update(.1); engine.togglePause();
  assert.equal(engine.cancelBioforgeQueueV87().reason, 'persistence-failed');
  assert.equal(engine.advanceBioforgePhaseV80().reason, 'persistence-failed');
  assert.equal(attempts, 1);
  assert.equal(engine.running, false);
});

test('present corrupted physical data fails safe instead of granting fresh health or rounds', () => {
  const { engine } = fixture(); enter(engine); print(engine);
  const state = engine.captureBioforgeResumeStateV80();
  state.state.runtimeV81.physicalV87.player.ammo = 99999;
  const fresh = fixture(null).engine;
  const result = fresh.start({ resumeState: state, assets: {}, testMode: true, autoLoop: false });
  assert.equal(result.started, false);
  assert.equal(fresh.running, false);
  assert.equal(fresh.enemies.length, 0);
  assert.equal(fresh.getBioforgeSnapshotV80().lastPurge.reason, 'corrupt-physical-resume');
});

test('page suspension persists exact physical state without purging or regenerating ammunition on restart', () => {
  const { engine, writes } = fixture(); enter(engine); print(engine);
  engine.fire(); engine.damagePlayer(9, { source: 'qa-local-hit' });
  engine.update(.1);
  const expected = engine.captureBioforgeRuntimeStateV81().physicalV87;
  const writeCount = writes.length;
  engine.stop({ purge: false, reason: 'page-unload' });
  assert.equal(writes.length, writeCount + 1);
  assert.equal(engine.running, false);
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'printing');
  assert.equal(engine.getBioforgeSnapshotV80().lastPurge, null);
  assert.deepEqual(writes.at(-1).runtimeV81.physicalV87, expected);
  const next = fixture(null).engine;
  assert.equal(next.start({ resumeState: { schema: 80, state: writes.at(-1) }, autoLoop: false, testMode: true, assets: {} }).started, true);
  const actual = next.captureBioforgeRuntimeStateV81().physicalV87;
  assert.deepEqual(actual.enemies, expected.enemies);
  assert.equal(actual.player.health, expected.player.health);
  assert.equal(actual.player.armor, expected.player.armor);
  assert.equal(actual.player.ammo, expected.player.ammo);
  assert.equal(actual.player.ammoReserve, expected.player.ammoReserve);
});

test('the twelve-cost guard can stop printing below twelve bodies and resumes after a real kill', () => {
  const { engine } = fixture({ profileId: 'enemy-001-ovomorph', quantity: 8 }); enter(engine);
  for (let i = 0; i < 6; i++) print(engine);
  assert.equal(engine.getBioforgeSnapshotV80().population.activeCount, 6);
  assert.equal(engine.getBioforgeSnapshotV80().population.activeCost, 12);
  assert.equal(engine.advanceBioforgePhaseV80().reason, 'active-cost-capacity');
  engine.killBioforgeSpecimenV80(engine.enemies[5].id);
  print(engine);
  assert.equal(engine.getBioforgeSnapshotV80().population.activeCost, 12);
});

test('egg waits at its release cursor for a free active slot; a real child survives parent death and resume exactly once', () => {
  const { engine, events } = fixture({ composition: [
    { lineId: 'eggs', profileId: 'enemy-001-ovomorph', quantity: 1 },
    { lineId: 'facehuggers', profileId: 'enemy-002-facehugger', quantity: 1 }
  ], maxConcurrent: 2 }); enter(engine);
  const egg = print(engine), sibling = print(engine);
  const originalX = egg.x;
  engine.player.x = egg.x - 110;
  assert.equal(engine.enemyMeleePathClearV64(egg, engine.player), true);
  assert.ok(engine.closedDoorColliders().every(door => door.w === 40));
  for (let i = 0; i < 20; i++) engine.update(.1);
  assert.equal(egg.x, originalX, 'an egg never runs toward the player');
  assert.equal(egg.ovomorphCycleV66.phase, 'hatch');
  assert.equal(egg.ovomorphCycleV66.elapsed, .5);
  assert.equal(egg.ovomorphCycleV66.spawned, false);
  assert.equal(egg.ovomorphCycleV66.releaseBlocked, true);
  assert.equal(engine.enemies.length, 2);
  let restored = resume(engine);
  const restoredEgg = restored.enemies.find(actor => actor.id === egg.id);
  assert.equal(restoredEgg.ovomorphCycleV66.elapsed, .5);
  assert.equal(restoredEgg.ovomorphCycleV66.spawned, false);
  assert.equal(restored.killBioforgeSpecimenV80(sibling.id), true);
  restored.update(.1);
  const child = restored.enemies.find(actor => actor.id === getOvomorphChildIdV66(egg));
  assert.ok(child?.alive);
  assert.equal(child.profileId, 'enemy-002-facehugger');
  assert.equal(child.ovomorphParentIdV66, egg.id);
  assert.equal(restored.getBioforgeSnapshotV80().population.activeCount, 2);
  assert.equal(restored.getBioforgeSnapshotV80().population.activeCost, 3);
  assert.equal(restored.killBioforgeSpecimenV80(egg.id), true);
  assert.equal(restored.finishBioforgeV80('cleared').applied, false, 'a descendant is not an empty arena');
  restored = resume(restored);
  assert.equal(restored.enemies.length, 3);
  assert.equal(restored.enemies.find(actor => actor.id === egg.id).alive, false);
  assert.equal(restored.enemies.find(actor => actor.id === child.id).alive, true);
  assert.equal(restored.killBioforgeSpecimenV80(child.id), true);
  assert.equal(restored.bioforgeRootV80.activeSession.killedIds.length, 2, 'child is not a fabricated queue specimen');
  const deadResume = resume(restored);
  assert.equal(deadResume.enemies.find(actor => actor.id === child.id).alive, false);
  deadResume.update(.1);
  assert.equal(deadResume.getBioforgeSnapshotV80().phase, 'result');
  assert.equal(deadResume.enemies.filter(actor => actor.id === child.id).length, 1);
  assert.deepEqual(deadResume.drops, []);
  assert.ok(!events.some(event => event.type === 'kill'));
});

test('a real Facehugger attack deals armour and health damage once; resume keeps its resolved impact', () => {
  const { engine } = fixture({ profileId: 'enemy-002-facehugger', quantity: 1 }); enter(engine);
  const enemy = print(engine);
  engine.player.x = enemy.x - 75;
  enemy.attackClock = 0;
  let resolved = false;
  for (let i = 0; i < 60; i++) {
    engine.update(.02);
    if (enemy.facehuggerAttackV65?.impactResolved) { resolved = true; break; }
  }
  assert.equal(resolved, true, 'production windup and impact ran instead of generic contact damage');
  assert.ok(engine.player.health < 100 && engine.player.armor < 50);
  const health = engine.player.health;
  const restored = resume(engine);
  assert.equal(restored.enemies[0].facehuggerAttackV65.impactResolved, true);
  restored.update(.001);
  assert.equal(restored.player.health, health);
});

test('operator death is a local result with no mission failure, campaign write or reward', () => {
  const { engine, events } = fixture(); enter(engine); print(engine);
  Object.assign(engine.player, { health: 2, armor: 0 });
  engine.damagePlayer(engine.player, 10, { source: 'test-impact' });
  assert.equal(engine.player.health, 0);
  assert.equal(engine.player.alive, false);
  assert.equal(engine.getBioforgeSnapshotV80().phase, 'result');
  assert.equal(engine.mission.state, 'active');
  assert.equal(engine.bioforgeRootV80.activeSession.result.outcome, 'failed');
  assert.ok(!events.some(event => ['mission-failed', 'player-down', 'kill', 'boss-defeated'].includes(event.type)));
  const restored = resume(engine);
  assert.equal(restored.player.alive, false);
  assert.equal(restored.player.health, 0);
});

test('periodic checkpoints store post-impact cursor and exclude projectiles without refunding spent ammunition', () => {
  const { engine, writes } = fixture(); enter(engine); print(engine);
  engine.fire();
  const ammo = engine.player.ammo;
  for (let i = 0; i < 6; i++) engine.update(.1);
  const last = writes.at(-1);
  assert.ok(last.runtimeV81.physicalV87);
  assert.equal(last.runtimeV81.physicalV87.player.ammo, ammo);
  assert.equal(last.runtimeV81.physicalV87.player.shots, 1);
  assert.ok(!JSON.stringify(last).includes('bioforge-shot-1'));
  const restored = resume(engine);
  assert.equal(restored.bullets.length, 0);
  assert.equal(restored.player.ammo, ammo);
});

test('fresh distant specimens patrol around their actual spawn instead of teleporting to zero', () => {
  const { engine } = fixture({ profileId: 'enemy-004-drone-big-chap', quantity: 4 }); enter(engine);
  const actors = [print(engine), print(engine), print(engine)];
  const far = actors.at(-1), initial = far.x;
  assert.equal(far.spawnX, initial);
  engine.player.x = 1320;
  engine.update(.01);
  assert.ok(Math.abs(far.x - initial) < 10);
});

test('an upper catwalk walker remains on its actual support rather than floating across the gap', () => {
  const { engine } = fixture({ profileId: 'enemy-002-facehugger', quantity: 12 }); enter(engine);
  for (let i = 0; i < 12; i++) print(engine);
  const upper = engine.enemies.find(actor => actor.groundY === 470 && actor.x >= 1930);
  Object.assign(engine.player, { x: 1470, y: 378, grounded: true });
  upper.x = 1930; upper.alert = true;
  for (let i = 0; i < 30; i++) {
    engine.update(.05);
    assert.ok(upper.x >= 1930);
    assert.ok(upper.x + upper.w <= 2320);
  }
});

test('the declared 1600-round laboratory reserve covers48 actual profiles and48 egg descendants without rewards', () => {
  const { engine } = fixture();
  for (const [index, entry] of BIOFORGE_TERRESTRIAL_ROSTER_V80.entries()) {
    const actor = engine.createBioforgeActorV87({ id: `ammo-audit-${index}`, profileId: entry.profileId, index });
    let shots = Math.ceil(actor.maxHealth / Math.max(1, 28 - actor.armor * .35));
    if (entry.profileId === 'enemy-001-ovomorph') {
      const child = engine.createBioforgeActorV87({ id: 'ammo-audit-child', profileId: 'enemy-002-facehugger', index: 0 });
      shots += Math.ceil(child.maxHealth / Math.max(1, 28 - child.armor * .35));
    }
    assert.ok(shots * 48 <= engine.player.ammo + engine.player.ammoReserve, entry.profileId);
  }
});

test('the canvas HUD names a real mixed composition instead of claiming no selected profile', () => {
  const { engine } = fixture({ composition: [
    { lineId: 'hud-eggs', profileId: 'enemy-001-ovomorph', quantity: 2 },
    { lineId: 'hud-face', profileId: 'enemy-002-facehugger', quantity: 1 }
  ] });
  const labels = [];
  engine.drawBioforgeHudV80({ fillRect() {}, strokeRect() {}, fillText(text) { labels.push(text); } });
  assert.ok(labels.some(label => label.includes('MIXTE (2 PROFILS)')));
  assert.ok(labels.every(label => !label.includes('AUCUN PROFIL')));
});

test('a mixed imported/Altered session preserves separate identities, health, ammunition and attack clocks across resume', () => {
  const d = ENEMY_USER_CASTES_V87.find(entry => entry.basename === 'film_warrior_aliens_1986');
  const { engine } = fixture({ composition: [
    { lineId: 'old-warrior', profileId: 'enemy-005-warrior', quantity: 1 },
    { lineId: 'native-warrior', profileId: d.id, quantity: 1 }
  ] });
  enter(engine);
  const old = print(engine), imported = print(engine);
  assert.notEqual(old.profileId, imported.profileId);
  assert.equal(imported.visualSheetId, null);
  assert.equal(imported.visualMode, 'static-pose');
  engine.applyEnemyDamage(imported, 35, { owner: engine.player });
  imported.attackClock = .43;
  Object.assign(engine.player, { ammo: 5, ammoReserve: 588 });
  const saved = engine.captureBioforgeResumeStateV80();
  assert.ok(saved.state.runtimeV81.physicalV87);
  const next = resume(engine);
  assert.deepEqual(next.enemies.map(actor => [actor.id, actor.profileId, actor.health, actor.attackClock]),
    engine.enemies.map(actor => [actor.id, actor.profileId, actor.health, actor.attackClock]));
  assert.equal(next.player.ammo, 5);
  assert.equal(next.player.ammoReserve, 588, 'old reserve is never refilled by the new fresh-session allowance');
  assert.equal(next.enemies[1].visualSheetId, null);
  const sheets = next.getVisibleEnemyAtlasSheetsV65([next.enemies[1]]);
  assert.deepEqual(sheets.map(sheet => sheet.path), [d.path], 'the imported branch never requests a family atlas');
  next.purgeBioforgeV80('test-import-purge');
  assert.equal(next.enemies.length, 0);
});

test('missing or malformed pose blocks printing without consuming queue, actors, clock or saved bytes', () => {
  const d = ENEMY_USER_CASTES_V87[0];
  const { engine, writes, events } = fixture({ profileId: d.id, quantity: 1 });
  enter(engine);
  engine.images.delete(d.imageKey);
  engine.ensureEnemyAtlas = () => Promise.resolve(null);
  const before = structuredClone(engine.bioforgeRootV80), writeCount = writes.length, eventCount = events.length;
  engine.bioforgePhaseClockV80 = .8;
  assert.equal(engine.advanceBioforgePhaseV80().reason, 'user-pose-loading');
  assert.deepEqual(engine.bioforgeRootV80, before);
  assert.equal(writes.length, writeCount);
  assert.equal(engine.enemies.length, 0);
  assert.equal(engine.bioforgePhaseClockV80, .8);
  assert.ok(events.slice(eventCount).every(event => event.type === 'bioforge-printer-waiting'));
  engine.images.set(d.imageKey, { complete: true, naturalWidth: 1024, naturalHeight: 1024 });
  assert.equal(engine.advanceBioforgePhaseV80().reason, 'user-pose-invalid-dimensions');
  assert.deepEqual(engine.bioforgeRootV80, before);
  engine.images.set(d.imageKey, { complete: true, naturalWidth: d.sourceWidth, naturalHeight: d.sourceHeight });
  assert.equal(print(engine).profileId, d.id);
});

test('restored imported combat freezes if its native pose is unavailable and remains purgeable', () => {
  const d = ENEMY_USER_CASTES_V87.find(entry => entry.basename === 'film_warrior_aliens_1986');
  const { engine } = fixture({ profileId: d.id, quantity: 1 });
  enter(engine); print(engine);
  const next = resume(engine);
  next.images.delete(d.imageKey);
  next.ensureEnemyAtlas = () => Promise.resolve(null);
  next.refreshEnemyAtlasAvailabilityV65();
  assert.equal(next.enemyAtlasLoadingPausedV65, true);
  assert.equal(next.getBioforgeSnapshotV80().userPoseAssetIssue, 'user-pose-loading');
  const before = next.enemies.map(actor => [actor.x, actor.y, actor.health]);
  next.update(.1);
  assert.deepEqual(next.enemies.map(actor => [actor.x, actor.y, actor.health]), before);
  next.purgeBioforgeV80('missing-pose-purge');
  assert.equal(next.enemies.length, 0);
  assert.equal(next.getBioforgeSnapshotV80().userPoseAssetIssue, null);
  assert.equal(next.enemyAtlasLoadingPausedV65, false);
  const labels = [];
  const context = new Proxy({ globalAlpha: 1, fillText: value => labels.push(value) }, { get: (target, key) => target[key] ?? (() => {}) });
  next.ctx = context;
  next.draw();
  assert.ok(labels.every(label => !label.includes('SIMULATION EN ATTENTE')));
});

for (const entry of BIOFORGE_TERRESTRIAL_ROSTER_V80) {
  test(`real production AI and physical capture remain valid for ${entry.profileId}`, () => {
    const { engine } = fixture({ profileId: entry.profileId, quantity: 2 }); enter(engine);
    const enemy = print(engine);
    engine.player.x = enemy.x - 110;
    for (let i = 0; i < 30; i++) engine.update(.1);
    assert.ok(engine.captureBioforgeResumeStateV80().state.runtimeV81.physicalV87);
    assert.ok(engine.enemies.every(actor => !actor.alive || engine.getBioforgeSnapshotV80().isolation.secure));
    assert.ok(engine.getBioforgeSnapshotV80().population.activeCount <= 12);
    assert.ok(engine.getBioforgeSnapshotV80().population.activeCost <= 12);
    assert.equal(engine.campaign, null);
  });
}
