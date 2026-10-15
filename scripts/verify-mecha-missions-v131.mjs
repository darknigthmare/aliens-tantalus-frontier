import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameEngine as ProductionEngine } from '../src/game-production-runtime.js';
import { validateMissionTopologyV52, validateMissionPhysicalTopologyV57 } from '../src/mission-levels-v52.js';
import { validateMissionTopologyV58 } from '../src/topology-coherence-v58.js';
import { createDefaultSave, beginOperation, recordOperationResumeState, resolveOperation, migrateSave } from '../src/save.js';
import { validateOperationCompletionV131 } from '../src/operation-receipts-v131.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, CREW, VEHICLES } from '../src/content.js';
import { MECHA_CAMPAIGNS_V131, MECHA_ART_STATUS_V131, buildMechaMissionV131, withMechaMissionsV131, validateMechaMissionStateV131 } from '../src/mecha-missions-v131.js';
import { MECHA_LOADOUTS_V131, createMechaSystemsV131, spendMechaActionV131, damageMechaSystemsV131,
  advanceMechaSystemsV131, beginMechaCoolingV131, beginMechaRepairV131, validateMechaSystemsV131,
  resolveMechaHitRegionV131, drawMechaPrototypeV131 } from '../src/mecha-systems-v131.js';

// Idempotent admission permits this suite while the independent production
// composition patch is in progress; every inherited method is the real runtime.
const Engine = withMechaMissionsV131(ProductionEngine);
function fixture(kind = 'titan', extra = {}) {
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
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ({}),
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const events = [], captures = [];
  const engine = new Engine(canvas, { onEvent: event => {
    events.push(event);
    if (event.type === 'mission-complete') captures.push(engine.captureResumeState());
  } });
  const campaign = MECHA_CAMPAIGNS_V131.find(entry => entry.id === `special-${kind}-v131`), world = WORLDS.find(entry => entry.id === campaign.worldId);
  const missionLevel = buildMechaMissionV131({ world, campaign });
  const options = { world, campaign, weapon: WEAPONS[0], enemyCatalog: ENEMIES, seed: 426,
    equipment: [], crew: [], missionLevel, levelSeed: missionLevel.levelSeed, ...extra };
  engine.start(options);
  const key = (type, code) => {
    const event = new Event(type, { cancelable: true }); Object.assign(event, { code, repeat: false, ctrlKey: false, metaKey: false, altKey: false, isComposing: false });
    windowEvents.dispatchEvent(event);
  };
  return { engine, actor: engine.player, options, events, captures, key };
}
const scenery = (engine, id) => engine.destructibleSceneryV130.objects.find(entry => entry.id === id);
function qualify(subject) {
  const { engine, key } = subject;
  key('keydown', 'KeyE'); key('keyup', 'KeyE'); assert.equal(engine.mechaMissionV131.mounted, true);
  for (let i = 0; i < 4 && !scenery(engine, 'mecha-drill-primary-v131').destroyed; i++) {
    assert.equal(engine.fire(), true); engine.updateBullets(0.6); engine.update(0.41);
  }
  assert.equal(scenery(engine, 'mecha-drill-primary-v131').destroyed, true);
  key('keydown', 'KeyD'); engine.update(3); key('keyup', 'KeyD');
  key('keydown', 'KeyC'); engine.update(0.02); key('keyup', 'KeyC');
  assert.equal(scenery(engine, 'mecha-drill-secondary-v131').destroyed, true,
    JSON.stringify({ vehicle: { x: engine.vehicle.x, y: engine.vehicle.y, w: engine.vehicle.w, facing: engine.vehicle.facing },
      state: engine.mechaMissionV131.systems, busy: engine.canMechaActV131(engine.player, { mounted: true }), events: subject.events.slice(-4) }));
  assert.equal(engine.mechaMissionV131.phase, 'arena');
  return engine.enemies.find(enemy => enemy.mechaBossV131);
}
function clearSieges(subject) {
  const { engine } = subject;
  assert.equal(engine.interact(), true); assert.equal(engine.mechaMissionV131.phase, 'route');
  assert.equal(engine.interact(), true);
  for (let wave = 1; wave <= 3; wave++) {
    assert.equal(engine.mechaMissionV131.wave, wave);
    for (const enemy of engine.enemies.filter(actor => actor.alive && actor.mechaWaveV131))
      engine.applyEnemyDamage(enemy, 300, { owner: engine.player, kind: 'mecha-primary-v131', mechaV131: true });
    engine.update(1.6);
  }
  assert.equal(engine.mechaMissionV131.phase, 'boss'); return engine.enemies.find(enemy => enemy.mechaBossV131);
}
function finishBoss(subject, boss) {
  const { engine } = subject;
  const phases = engine.mechaPlanV131.mechaMissionV131.boss.phases;
  for (let i = 0; i < phases - 1; i++) {
    engine.applyEnemyDamage(boss, boss.maxHealth / phases + 2, { owner: engine.player, kind: 'mecha-primary-v131', mechaV131: true,
      x: boss.x, y: boss.y + boss.h * 0.5 }); engine.update(0.02);
    assert.equal(boss.bossV131.phase, i + 1);
  }
  engine.applyEnemyDamage(boss, boss.maxHealth, { owner: engine.player, kind: 'mecha-primary-v131', mechaV131: true, y: boss.y + boss.h * 0.5 });
  assert.equal(boss.alive, true); assert.equal(boss.health, 1); assert.equal(engine.mechaMissionV131.phase, 'finish');
  // Only the finishing proximity is arranged here; damage, phase transitions,
  // input qualification, rewards and restoration all execute runtime methods.
  engine.vehicle.x = boss.x - engine.vehicle.w - 24; engine.pinMechaPilotV131();
  for (const item of engine.destructibleSceneryV130.objects.filter(item => !item.id.startsWith('mecha-drill') && !item.destroyed))
    engine.damageDestructibleSceneryV130(item.id, 500, { owner: engine.player, kind: 'mecha-secondary-v131' });
  assert.equal(engine.interact(), true); assert.equal(boss.alive, false); assert.equal(engine.mechaMissionV131.phase, 'extract');
  engine.vehicle.x = engine.objective.x - engine.vehicle.w + 30; engine.pinMechaPilotV131();
  engine.keys.add('KeyE'); engine.update(2.1); engine.keys.delete('KeyE');
  assert.equal(engine.mission.state, 'complete');
}

test('original mission entries/builders and mixin are distinct, explicit and do not rename the P-5000', () => {
  assert.equal(withMechaMissionsV131(Engine), Engine);
  assert.equal(MECHA_CAMPAIGNS_V131.length, 2); assert.deepEqual(MECHA_CAMPAIGNS_V131.map(entry => entry.specialOperationId), ['titan-equalizer', 'protocol-z110']);
  for (const campaign of MECHA_CAMPAIGNS_V131) {
    const plan = buildMechaMissionV131({ campaign }); assert.equal(plan.validation.mechaV131.valid, true);
    assert.equal(plan.mechaMissionV131.operationId, campaign.specialOperationId); assert.ok(plan.destructibleSceneryV130.length >= 4);
    assert.equal(validateMissionTopologyV52(plan).valid, true); assert.equal(validateMissionPhysicalTopologyV57(plan).valid, true);
    assert.equal(validateMissionTopologyV58(plan).valid, true); assert.equal(plan.geometry.ladders.length, 0);
    assert.ok(plan.graph.nodes.every(node => node.id.startsWith('mecha-')));
  }
  const original = VEHICLES.find(entry => entry.id === 'vehicle-007-p-5000-powered-work-loader'); assert.ok(original);
  const { engine } = fixture(); assert.ok(engine.vehicle.id.startsWith('prototype-mecha-')); assert.notEqual(engine.vehicle.id, original.id);
  assert.equal(MECHA_ART_STATUS_V131.productionReady, false); assert.equal(engine.getSnapshot().mechaV131.artStatus.mode, 'original-vector-prototype');
});

test('real keyboard hangar selection, boarding and route menu admit four genuinely different loadouts', () => {
  const { engine, key } = fixture('z110');
  assert.equal(engine.player.inVehicle, false); assert.equal(engine.mechaMissionMenuV131().loadouts.length, 4);
  key('keydown', 'KeyD'); engine.update(0.02); key('keyup', 'KeyD'); engine.update(0.02);
  assert.equal(engine.mechaMissionV131.loadoutId, 'vulcain'); assert.equal(engine.vehicle.maxHull, 440);
  assert.equal(engine.selectMechaLoadoutV131('meduse'), true); assert.equal(engine.vehicle.maxHull, 420);
  assert.equal(engine.selectMechaLoadoutV131('unknown'), false);
  key('keydown', 'KeyE'); key('keyup', 'KeyE'); assert.equal(engine.mechaMissionV131.phase, 'route'); assert.equal(engine.vehicle.driver, engine.player);
  assert.equal(engine.selectMechaLoadoutV131('atlas'), false);
  key('keydown', 'KeyS'); engine.update(0.02); key('keyup', 'KeyS'); assert.equal(engine.mechaMissionV131.route, 'black');
  key('keydown', 'KeyE'); key('keyup', 'KeyE'); assert.equal(engine.mechaMissionV131.phase, 'siege'); assert.equal(engine.enemies.length, 5);
  assert.ok(engine.enemies.every(enemy => ['enemy-006-runner', 'enemy-010-spitter'].includes(enemy.mechaProfileIdV131)));
});

test('TALOS qualification uses actual cannon collision, walking and the keyboard hydraulic secondary', () => {
  const subject = fixture(), ammo = subject.actor.ammo;
  const boss = qualify(subject);
  assert.equal(subject.actor.ammo, ammo); assert.equal(subject.engine.mechaMissionV131.primaryQualified, true);
  assert.equal(subject.engine.mechaMissionV131.secondaryQualified, true); assert.ok(subject.engine.mechaMissionV131.systems.shots >= 1);
  assert.ok(subject.engine.mechaMissionV131.systems.strikes >= 1); assert.equal(boss.w, 300); assert.equal(boss.h, 340);
  assert.equal(subject.engine.vehicle.w, 231); assert.equal(subject.engine.vehicle.h, 306);
});

test('using the wrong tool cannot destroy the hydraulic drill or produce free tutorial progression', () => {
  const { engine } = fixture(); engine.interact();
  const target = scenery(engine, 'mecha-drill-secondary-v131');
  assert.equal(engine.damageDestructibleSceneryV130(target.id, 500, { owner: engine.player, kind: 'mecha-primary-v131' }), 0);
  assert.equal(target.hp, 76); assert.equal(engine.mechaMissionV131.secondaryQualified, false);
  assert.equal(engine.completeMission(), false); assert.equal(engine.mission.state, 'active');
});

test('weapons spend energy/heat once and respect cooldown, broken arms, dry energy, repair, cooling and pause', () => {
  for (const id of Object.keys(MECHA_LOADOUTS_V131)) {
    const state = createMechaSystemsV131(id), profile = MECHA_LOADOUTS_V131[id];
    assert.equal(spendMechaActionV131(state, 'primary'), true); assert.equal(state.energy, 100 - profile.primary.energy);
    assert.equal(state.heat, profile.primary.heat); assert.equal(state.shots, 1); assert.equal(spendMechaActionV131(state, 'primary'), false);
    advanceMechaSystemsV131(state, profile.primary.interval + 0.01); state.systems.rightArm = 0;
    assert.equal(spendMechaActionV131(state, 'primary'), false); state.systems.rightArm = 100; state.energy = 0;
    assert.equal(spendMechaActionV131(state, 'primary'), false); state.energy = 100;
    damageMechaSystemsV131(state, 20, 'leftArm'); assert.equal(beginMechaRepairV131(state), true); assert.equal(spendMechaActionV131(state, 'secondary'), false);
    assert.equal(beginMechaCoolingV131(state), false); advanceMechaSystemsV131(state, 2.4); assert.equal(state.repairKits, 1);
    state.heat = 70; assert.equal(beginMechaCoolingV131(state), true); assert.equal(spendMechaActionV131(state, 'primary'), false);
    advanceMechaSystemsV131(state, 1.4); assert.equal(state.coolant, 3); assert.equal(state.coolingClock, 0);
    assert.equal(validateMechaSystemsV131(state).valid, true);
  }
  const { engine } = fixture(); engine.interact(); const before = cloneSystems(engine);
  engine.paused = true; assert.equal(engine.fire(), false); assert.equal(engine.melee(), false); assert.equal(engine.reload(), false); engine.update(2);
  assert.deepEqual(cloneSystems(engine), before);
});

test('the real Z-110 cannon contacts the existing xenomorph collision silhouettes at its neutral firing height', () => {
  const { engine } = fixture('z110'); engine.interact(); engine.interact();
  const health = engine.enemies.map(enemy => enemy.health);
  assert.equal(engine.fire(), true); engine.updateBullets(1.2);
  assert.ok(engine.enemies.some((enemy, index) => enemy.health < health[index]),
    JSON.stringify(engine.enemies.map(enemy => ({ id: enemy.id, x: enemy.x, y: enemy.y, h: enemy.h, hitbox: enemy.spriteHitbox?.local }))));
  assert.equal(engine.mechaMissionV131.systems.shots, 1);
});

test('bounded projectile pools refuse a new discharge before spending energy and keep hostile spawn counts finite', () => {
  const { engine } = fixture('z110'); engine.interact(); engine.interact();
  const state = cloneSystems(engine);
  engine.bullets = Array.from({ length: 32 }, () => ({ x: 100, y: 100, w: 8, h: 5, life: 1, vx: 0, vy: 0, damage: 1 }));
  assert.equal(engine.fire(), false); assert.deepEqual(cloneSystems(engine), state);
  engine.hostileProjectiles = Array.from({ length: 32 }, () => ({ x: 100, y: 100, w: 8, h: 5, life: 1, vx: 0, vy: 0, damage: 1 }));
  assert.equal(engine.spawnEnemyProjectile(engine.enemies[0], engine.player), false); assert.equal(engine.hostileProjectiles.length, 32);
});

test('the held aim button retains the heavy cannon angle without moving or spending energy and clears on input loss', () => {
  const { engine, key } = fixture(); engine.interact(); const x = engine.vehicle.x, energy = engine.mechaMissionV131.systems.energy;
  key('keydown', 'ShiftLeft'); key('keydown', 'KeyW'); engine.update(0.02); key('keyup', 'KeyW'); engine.update(0.02);
  assert.equal(engine.player.combatAimV83.direction, 'up'); assert.equal(engine.player.combatAimV83.latchedV130, true);
  assert.equal(engine.vehicle.x, x); assert.equal(engine.mechaMissionV131.systems.energy, energy);
  assert.equal(engine.fire(), true); assert.ok(engine.bullets[0].vy < 0); assert.ok(Math.abs(engine.bullets[0].vx) < 1e-9);
  engine.clearGameplayInput(); assert.equal(engine.mechaAimV131, null);
});

test('the heavy prototype can jump onto its authored maintenance flank without replaying a held jump', () => {
  const { engine } = fixture(); engine.interact(); engine.vehicle.x = 1160; engine.pinMechaPilotV131();
  engine.keys.add('Space'); engine.keys.add('KeyD'); engine.update(1.4); engine.keys.delete('KeyD');
  assert.equal(engine.vehicle.y + engine.vehicle.h, 650); assert.equal(engine.vehicle.vy, 0);
  engine.update(0.3); assert.equal(engine.vehicle.y + engine.vehicle.h, 650);
  engine.keys.delete('Space'); engine.update(0.02); engine.keys.add('Space'); engine.update(0.02);
  assert.ok(engine.vehicle.vy < 0); assert.ok(engine.vehicle.y + engine.vehicle.h < 650);
});

test('a pilot medical action advances while dismounted and cannot freeze the world or shield the parked machine', () => {
  const { engine, actor } = fixture(); engine.interact(); assert.equal(engine.toggleVehicle(actor), true);
  actor.health = 30; engine.inventory.medkits = 1;
  assert.equal(engine.useMedkit(actor), true); assert.equal(engine.isFieldActionBusyV124(actor), true);
  assert.equal(engine.mountMechaV131(actor), false);
  const hull = engine.vehicle.hull; assert.equal(engine.damageVehicle(12, { hitRegionV131: 'leftArm' }), 12); assert.equal(engine.vehicle.hull, hull - 12);
  engine.update(2.3); assert.ok(actor.health > 30); assert.equal(engine.inventory.medkits, 0);
  assert.equal(engine.isFieldActionBusyV124(actor), false); assert.equal(engine.mountMechaV131(actor), true);
});
function cloneSystems(engine) { return structuredClone(engine.mechaMissionV131.systems); }

test('localized geometry hits and acid alter real subsystems, corrosion, mobility and cooling consumes a finite gel reserve', () => {
  const { engine } = fixture(); engine.interact(); const vehicle = engine.vehicle;
  assert.equal(resolveMechaHitRegionV131(vehicle, { y: vehicle.y + 10 }), 'cockpit');
  assert.equal(resolveMechaHitRegionV131(vehicle, { y: vehicle.y + vehicle.h - 10 }), 'hydraulics');
  const state = engine.mechaMissionV131.systems, cockpit = state.systems.cockpit;
  assert.equal(engine.damageVehicle(20, { x: vehicle.x + vehicle.w / 2, y: vehicle.y + 10, acid: true }), 20);
  assert.ok(state.systems.cockpit < cockpit); assert.ok(state.corrosion > 0); const hull = state.hull;
  engine.update(0.5); assert.ok(state.hull < hull);
  assert.equal(engine.reload(), true); const kit = state.coolant; engine.update(1.5); assert.equal(state.corrosion, 0); assert.equal(state.coolant, kit);
  assert.equal(engine.player.reloading, false); assert.equal(engine.reload(), false, 'An already cold machine cannot waste another gel.');
});

test('critical destruction ejects the real pilot and a checkpoint restart restores the vehicle/actor relation atomically', () => {
  const subject = fixture(); qualify(subject); const { engine } = subject;
  engine.update(0.1); assert.equal(engine.mechaCheckpointV131.specialOperation.mechaV131.mounted, true);
  engine.damageVehicle(200, { hitRegionV131: 'reactor' });
  assert.equal(engine.vehicle.destroyed, true); assert.equal(engine.player.inVehicle, false); assert.equal(engine.vehicle.driver, null);
  assert.equal(engine.mission.state, 'failed'); assert.equal(engine.restartFromCheckpoint(), true);
  assert.equal(engine.mission.state, 'active'); assert.equal(engine.vehicle.destroyed, false); assert.equal(engine.player.inVehicle, true);
  assert.equal(engine.vehicle.driver, engine.player); assert.equal(engine.coopEnabled, false);
});

test('swept acid chooses intact scenery before the mecha and uses the real impact height when its path is clear', () => {
  const { engine } = fixture(); engine.interact(); const state = engine.mechaMissionV131.systems;
  engine.vehicle.x = 1400; engine.pinMechaPilotV131();
  const wall = scenery(engine, 'mecha-arena-1-v131'), hull = state.hull;
  engine.hostileProjectiles.push({ x: 2000, y: 580, w: 14, h: 12, vx: -900, vy: 0, damage: 25, life: 3, acid: true, hit: false });
  engine.updateHostileProjectiles(1); assert.equal(state.hull, hull); assert.equal(wall.hp, 20);
  engine.damageDestructibleSceneryV130(wall.id, 500, { owner: engine.player, kind: 'mecha-primary-v131' });
  const hydraulic = state.systems.hydraulics;
  engine.hostileProjectiles.push({ x: 2000, y: 710, w: 14, h: 8, vx: -900, vy: 0, damage: 25, life: 3, acid: true, hit: false });
  engine.updateHostileProjectiles(1); assert.ok(state.hull < hull); assert.ok(state.systems.hydraulics < hydraulic);
});

test('emergency exit respects obstacle clearance, field work and real pilot proximity on remount', () => {
  const { engine, actor } = fixture(); engine.interact();
  assert.equal(engine.toggleVehicle(actor), true); assert.equal(actor.inVehicle, false); assert.equal(engine.vehicle.occupied, false);
  const x = actor.x; actor.x = 3000; assert.equal(engine.mountMechaV131(actor), false); actor.x = x;
  actor.reloading = true; assert.equal(engine.mountMechaV131(actor), false); actor.reloading = false;
  assert.equal(engine.mountMechaV131(actor), true); assert.equal(engine.vehicle.driver, actor);
  engine.paused = true; assert.equal(engine.toggleVehicle(actor), false);
});

test('simulation and all actions freeze under atlas loading or unavailable castes and maintain independent actor ammunition', () => {
  for (const property of ['enemyAtlasLoadingPausedV65', 'userCasteLoadingV88']) {
    const { engine } = fixture(); engine.interact(); const state = cloneSystems(engine), elapsed = engine.mission.elapsed;
    engine[property] = true; engine.keys.add('KeyD'); engine.keys.add('KeyF');
    const x = engine.vehicle.x; engine.update(10);
    assert.deepEqual(cloneSystems(engine), state); assert.equal(engine.mission.elapsed, elapsed); assert.equal(engine.vehicle.x, x);
    assert.equal(engine.interact(), false); assert.equal(engine.reload(), false); assert.equal(engine.fire(), false); assert.equal(engine.melee(), false);
  }
});

test('TALOS five phases, localized boss damage, telegraphed attacks and finisher produce one valid terminal event/save', () => {
  const subject = fixture(), boss = qualify(subject);
  subject.engine.update(2.3); assert.ok(boss.bossV131.windup > 0 || boss.bossV131.attack !== null);
  finishBoss(subject, boss);
  assert.equal(subject.events.filter(event => event.type === 'mecha-boss-phase-v131').length, 4);
  assert.equal(subject.events.filter(event => event.type === 'mission-complete').length, 1); assert.equal(subject.engine.completeMission(), false);
  assert.equal(subject.captures.length, 1); const raw = subject.captures[0];
  assert.equal(validateMechaMissionStateV131(raw.specialOperation.mechaV131).valid, true);
  assert.equal(subject.engine.validateMechaResumeV131(raw).valid, true);
  const restored = fixture('titan', { resumeState: raw }).engine;
  assert.equal(restored.lastResumeResult.applied, true); assert.equal(restored.mission.state, 'complete'); assert.equal(restored.mechaMissionV131.rewardClaimed, true);
  assert.equal(restored.completeMission(), false); assert.equal(restored.vehicle.driver, restored.player);
});

test('Z-110 runs three finite sieges and its distinct queen phases on both red/black routes', () => {
  for (const route of ['red', 'black']) {
    const subject = fixture('z110');
    subject.engine.interact(); assert.equal(subject.engine.selectMechaRouteV131(route), true); subject.engine.interact();
    for (let i = 1; i <= 3; i++) {
      assert.equal(subject.engine.mechaMissionV131.wave, i);
      for (const enemy of subject.engine.enemies.filter(actor => actor.alive))
        subject.engine.applyEnemyDamage(enemy, 300, { owner: subject.actor, kind: 'mecha-primary-v131', mechaV131: true });
      subject.engine.update(1.6);
    }
    assert.equal(subject.engine.mechaMissionV131.emitted, 21); assert.equal(subject.engine.drops.length, 0);
    const boss = subject.engine.enemies.find(enemy => enemy.mechaBossV131); assert.equal(boss.maxHealth, 920);
    finishBoss(subject, boss); assert.equal(subject.events.filter(event => event.type === 'mecha-boss-phase-v131').length, 2);
    assert.equal(validateMechaMissionStateV131(subject.captures[0].specialOperation.mechaV131).valid, true);
  }
});

test('a real mecha terminal observer records the seated pilot proof and certifies one strategic payout across migration', () => {
  const subject = fixture(), save = createDefaultSave();
  const operation = beginOperation(save, subject.options.campaign, subject.options.world).operation; assert.ok(operation);
  Object.assign(operation, { levelSeedId: subject.options.levelSeed.id, missionLevelSignature: subject.options.missionLevel.signature,
    missionTemplateId: subject.options.missionLevel.templateId });
  const observer = subject.engine.onEvent;
  let reward = null;
  subject.engine.onEvent = event => {
    observer(event);
    if (event.type === 'mission-complete') {
      reward = event.rewards; assert.equal(recordOperationResumeState(save, subject.engine.captureResumeState()), true);
    }
  };
  const boss = qualify(subject); finishBoss(subject, boss);
  const certified = validateOperationCompletionV131(operation, reward); assert.equal(certified.valid, true, certified.reason);
  const previous = save.galaxy.resources.credits;
  const settled = resolveOperation(save, { success: true, rewards: reward, kills: operation.resumeState.player.kills });
  assert.equal(settled.ok, true, settled.reason); assert.equal(save.galaxy.resources.credits - previous, 1100);
  const restored = migrateSave(save), balance = restored.galaxy.resources.credits;
  restored.strategy.currentOperation = operation;
  assert.equal(resolveOperation(restored, { success: true, rewards: reward }).reason, 'operation-already-resolved');
  assert.equal(restored.galaxy.resources.credits, balance);
});

test('an in-flight cannon, boss windup, partial coolant cycle and destructible arena resume without re-spending or replaying hits', () => {
  const subject = fixture(), boss = qualify(subject), { engine } = subject;
  engine.update(1.1);
  for (const item of engine.destructibleSceneryV130.objects.filter(item => !item.destroyed))
    engine.damageDestructibleSceneryV130(item.id, 20, { owner: engine.player, kind: 'mecha-primary-v131' });
  engine.vehicle.x = boss.x - 700; engine.pinMechaPilotV131();
  engine.mechaMissionV131.systems.primaryClock = 0; assert.equal(engine.fire(), true);
  engine.mechaMissionV131.systems.heat = 70; assert.equal(engine.reload(), true); engine.update(0.3);
  const raw = engine.captureResumeState(); assert.equal(engine.validateMechaResumeV131(raw).valid, true);
  const before = cloneSystems(engine), restored = fixture('titan', { resumeState: raw }).engine;
  assert.equal(restored.lastResumeResult.applied, true); assert.deepEqual(cloneSystems(restored), before);
  assert.equal(restored.bullets.length, engine.bullets.length); assert.equal(restored.vehicle.vx, engine.vehicle.vx);
  assert.deepEqual(restored.enemies.find(enemy => enemy.mechaBossV131).bossV131, boss.bossV131);
  const shots = before.shots; restored.update(1.2); engine.update(1.2); assert.equal(restored.mechaMissionV131.systems.shots, shots);
  assert.deepEqual(restored.getDestructibleScenerySnapshotV130().objects.map(item => [item.id, item.hp]), engine.getDestructibleScenerySnapshotV130().objects.map(item => [item.id, item.hp]));
});

test('wrong identity, impossible terminal state, local damage, boss refs and terrain mismatch reject before any mutation', () => {
  const subject = fixture(); qualify(subject); const { engine } = subject;
  const raw = engine.captureResumeState(); assert.equal(engine.validateMechaResumeV131(raw).valid, true);
  const before = engine.captureResumeState();
  for (const corrupt of [
    saved => { saved.identity.campaignId = 'special-z110-v131'; },
    saved => { saved.specialOperation.mechaV131.phase = 'complete'; saved.specialOperation.mechaV131.complete = true; },
    saved => { saved.specialOperation.mechaV131.systems.systems.reactor = -1; },
    saved => { saved.specialOperation.mechaV131.enemies[0].id = 'other-boss'; },
    saved => { saved.destructibleSceneryV130.objects[0].hp = 999; },
    saved => { saved.specialOperation.mechaV131.mounted = false; },
    saved => { saved.specialOperation.mechaV131.enemies[0] = null; },
    saved => { saved.enemies[0] = null; },
    saved => { saved.destructibleSceneryV130.objects[0] = null; }
  ]) {
    const saved = structuredClone(raw); corrupt(saved); assert.equal(engine.applyResumeState(saved).applied, false);
    assert.deepEqual(engine.captureResumeState(), before);
  }
});

test('ordinary production missions keep selected crew/vehicle, ammunition and controls when the mecha extension is not active', () => {
  const { engine } = fixture();
  engine.start({ world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1), equipment: [], crew: [CREW[0]], seed: 426 });
  assert.equal(engine.isMechaMissionV131(), false); assert.equal(engine.getSnapshot().mechaV131, undefined);
  assert.equal(engine.mechaMissionMenuV131(), null); assert.equal(engine.selectMechaLoadoutV131('atlas'), false);
});

test('the dedicated vector model uses finite primitives at normal and colossal scale with damaged states', () => {
  const { engine } = fixture();
  const paints = []; const ctx = { save() {}, restore() {}, translate(...args) { assert.ok(args.every(Number.isFinite)); },
    scale(...args) { assert.ok(args.every(Number.isFinite)); }, fillRect(...args) { assert.ok(args.every(Number.isFinite)); paints.push(args); },
    strokeRect(...args) { assert.ok(args.every(Number.isFinite)); }, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {} };
  drawMechaPrototypeV131(ctx, engine.vehicle, engine.mechaMissionV131.systems, 1);
  engine.mechaMissionV131.systems.systems.rightArm = 0; engine.mechaMissionV131.systems.heat = 100; engine.mechaMissionV131.systems.overheated = true;
  drawMechaPrototypeV131(ctx, engine.vehicle, engine.mechaMissionV131.systems, 2); assert.ok(paints.length > 10);
});
