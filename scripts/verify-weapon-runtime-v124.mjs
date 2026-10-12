import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, EQUIPMENT, CREW, NEURO_XENO_PROFILES } from '../src/content.js';
import { attachCrewDeploymentV85 } from '../src/crew-runtime-v85.js';

// Actual production start/update/fire/reload/deployment paths; only browser host
// APIs are substituted. Raster lighting is checked by the separate UI smoke.
function fixture(options = {}) {
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
  const engine = new GameEngine(canvas);
  const start = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0],
    enemyCatalog: ENEMIES.slice(0, 1), equipment: [], crew: [], seed: 426, ...options };
  engine.start(start);
  Object.assign(engine, { platforms: [{ id: 'qa-floor', x: -200, y: 930, w: 6800, h: 200, floor: true }],
    ladders: [], lifts: [], walls: [], covers: [], doors: [], hazards: [], enemies: [], missionLevelRuntime: null });
  Object.assign(engine.player, { x: 160, y: 838, vx: 0, vy: 0, grounded: true, operatorId: 'echo-9' });
  Object.assign(engine.coop, { x: 110, y: 838, vx: 0, vy: 0, grounded: true, operatorId: 'bravo-2' });
  engine.ensureSceneWeaponEffectsV124();
  return { engine, actor: engine.player, start };
}

function advance(engine, seconds, rate = 120) {
  let remaining = seconds;
  while (remaining > 1e-10) {
    const delta = Math.min(1 / rate, remaining);
    engine.update(delta);
    remaining -= delta;
  }
}

function weaponFixture(id = 'weapon-004-vp70-combat-pistol', extra = {}) {
  const weapon = WEAPONS.find(item => item.id === id); assert.ok(weapon, `Missing weapon ${id}.`);
  const result = fixture({ ...extra, weapon });
  const { engine, actor } = result;
  Object.assign(engine.weaponPickup, { x: actor.x, y: actor.y, taken: false });
  assert.equal(engine.interact(actor), true, 'The actual pickup must equip the selected weapon.');
  assert.equal(actor.weaponMode, 'rifle');
  advance(engine, 0.7);
  assert.equal(engine.weaponDescriptorV124(actor).id, id);
  return { ...result, weapon };
}

function nearbyEnemy(engine, actor = engine.player) {
  const enemy = engine.createEnemy(ENEMIES.find(entry => entry.id === 'enemy-005-warrior'), 0,
    actor.x + actor.w + 12, actor.y + actor.h);
  engine.enemies = [enemy];
  return enemy;
}

function cancelReloadThroughMedicalWork(engine, actor) {
  actor.health = 30;
  assert.equal(engine.useMedkit(actor), true);
  assert.equal(actor.reloading, false);
  assert.equal(engine.cancelFieldActionV124(actor), true);
}

test('one accepted pistol shot emits one case and light; cooldown, dry and paused triggers emit none', () => {
  const { engine, actor } = weaponFixture();
  const ammo = actor.ammo;
  assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, ammo - 1);
  const first = engine.weaponEffectsSnapshotV124();
  assert.equal(first.stats.acceptedShots, 1); assert.equal(first.stats.ejectedCasings, 1);
  assert.equal(first.stats.emittedLights, 1); assert.equal(first.counts.lights, 1);
  assert.equal(engine.weaponEffectsV124.casings[0].weaponId, 'weapon-004-vp70-combat-pistol');
  assert.equal(engine.fire(actor), false); assert.deepEqual(engine.weaponEffectsSnapshotV124(), first);
  engine.togglePause(); engine.advanceSceneWeaponEffectsV124(10);
  assert.equal(engine.fire(actor), false); assert.deepEqual(engine.weaponEffectsSnapshotV124(), first);
  engine.togglePause(); advance(engine, 1); actor.ammo = 0;
  const accepted = engine.weaponEffectsV124.stats.acceptedShots, cases = engine.weaponEffectsV124.stats.ejectedCasings;
  assert.equal(engine.fire(actor), false);
  assert.equal(engine.weaponEffectsV124.stats.acceptedShots, accepted); assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, cases);
});

test('dedicated, contextual and Neuro melee damage the target without firearm effects', () => {
  const neuroProfile = NEURO_XENO_PROFILES.find(profile => profile.playerClassCompatible);
  for (const action of ['dedicated', 'contextual', 'neuro']) {
    const { engine, actor } = fixture(action === 'neuro' ? { neuroProfile } : {});
    const enemy = nearbyEnemy(engine), health = enemy.health;
    const registeredShots = engine.penetrationTelemetry.shots, noiseBurst = engine.stealthRuntime.noiseBurstUntil;
    assert.equal(action === 'dedicated' ? engine.melee(actor) : engine.fire(actor), true);
    assert.ok(enemy.health < health); assert.equal(actor.shots, 0); assert.equal(Number(actor.v52FireClock) || 0, 0);
    assert.equal(engine.penetrationTelemetry.shots, registeredShots);
    assert.equal(engine.stealthRuntime.noiseBurstUntil, noiseBurst, `${action} must not create a rifle gunfire noise burst.`);
    const effects = engine.weaponEffectsSnapshotV124();
    assert.equal(effects.stats.acceptedShots, 0); assert.equal(effects.counts.casings, 0); assert.equal(effects.counts.lights, 0);
  }
});

test('actual M41A, M56, flame and energy weapons emit their light without brass', () => {
  const energy = WEAPONS.find(item => item.family === 'energy'); assert.ok(energy);
  for (const id of ['weapon-001-m41a-pulse-rifle', 'weapon-005-m56-smartgun', 'weapon-006-m240-incinerator-unit', energy.id]) {
    const { engine, actor } = weaponFixture(id);
    assert.equal(engine.fire(actor), true); assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 1);
    assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0, `${id} must not manufacture brass.`);
    assert.equal(engine.weaponEffectsV124.lights.length, 1);
  }
});

test('local coop effects use the actual operator weapon instead of the global selected rifle', () => {
  const { engine, actor } = weaponFixture('weapon-001-m41a-pulse-rifle');
  engine.setCoop(true);
  const member = { ...CREW[1], gearV85: [{ instanceId: 'qa-bravo-pistol', catalogId: 'weapon-003-m4a3-service-pistol', kind: 'weapon' }] };
  assert.equal(attachCrewDeploymentV85(engine.coop, member), true);
  assert.equal(engine.weaponDescriptorV124(engine.coop).id, 'weapon-003-m4a3-service-pistol');
  assert.equal(engine.fire(actor), true); assert.equal(engine.fire(engine.coop), true);
  assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 2); assert.equal(engine.weaponEffectsV124.casings.length, 1);
  assert.equal(engine.weaponEffectsV124.casings[0].weaponId, 'weapon-003-m4a3-service-pistol');
});

test('a pump ejects once after its 0.18-second cycle and its pending cycle freezes while paused', () => {
  const { engine, actor } = weaponFixture('weapon-007-m37a2-pump-shotgun');
  assert.equal(engine.fire(actor), true); assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0);
  advance(engine, 0.1); engine.togglePause();
  const frozen = engine.weaponEffectsSnapshotV124(); advance(engine, 1);
  assert.deepEqual(engine.weaponEffectsSnapshotV124(), frozen);
  engine.togglePause(); advance(engine, 0.07); assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0);
  advance(engine, 0.011); assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 1);
  assert.equal(engine.weaponEffectsV124.casings[0].casingKind, 'shotgun');
  advance(engine, 1); assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 1);
  assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 1);
});

for (const ending of ['completed', 'cancelled']) test(`a pump cycle waits through ${ending} medical work and resumes from the current receiver`, () => {
  const { engine, actor } = weaponFixture('weapon-007-m37a2-pump-shotgun');
  assert.equal(engine.fire(actor), true); advance(engine, .04);
  const ammo = actor.ammo, reserve = actor.ammoReserve;
  actor.health = 30; assert.equal(engine.useMedkit(actor), true);
  advance(engine, .4);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0, 'A holstered shotgun cannot eject while the operator treats a wound.');
  assert.equal(engine.pendingWeaponCyclesV124.length, 1);
  const remaining = engine.pendingWeaponCyclesV124[0].due - engine.animationTime;
  assert.ok(remaining > .13 && remaining < .15, 'The unperformed part of the cycle is retained.');
  engine.togglePause(); const paused = engine.weaponEffectsSnapshotV124(); advance(engine, .5);
  assert.deepEqual(engine.weaponEffectsSnapshotV124(), paused); engine.togglePause();
  if (ending === 'cancelled') assert.equal(engine.cancelFieldActionV124(actor), true);
  else advance(engine, actor.fieldActionV124.duration - actor.fieldActionV124.elapsed + .001);
  assert.equal(engine.isFieldActionBusyV124(actor), false);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0);
  assert.equal(actor.ammo, ammo); assert.equal(actor.ammoReserve, reserve);
  advance(engine, .05); assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0);
  // The world can move or turn the actor while their previous shot is waiting.
  // The cosmetic cycle must resolve the receiver anew, not reuse that shot's coordinates.
  actor.x += 80; actor.facing = -1; actor.combatAimV83 = { x: -1, y: 0 };
  const due = engine.pendingWeaponCyclesV124[0].due;
  advance(engine, Math.max(0, due - engine.animationTime) + .000001);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 1);
  assert.equal(engine.pendingWeaponCyclesV124.length, 0);
  const body = engine.weaponEffectsV124.casings[0], muzzle = engine.resolvePlayerMuzzleV124(actor, actor.combatAimV83);
  const portX = Number.isFinite(muzzle.ejectionX) ? muzzle.ejectionX : muzzle.pivotX - 5;
  const portY = Number.isFinite(muzzle.ejectionY) ? muzzle.ejectionY : muzzle.pivotY - 3;
  assert.ok(Math.abs(body.x - portX) < 1.01); assert.ok(Math.abs(body.y - portY) < 1.01);
  assert.ok(body.vx > 0, 'A left-facing weapon ejects backwards to the right.');
  advance(engine, .6);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 1);
  assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 1);
  assert.equal(actor.ammo, ammo); assert.equal(actor.ammoReserve, reserve);
});

test('a pump cycle waits through tube reloading without inventing a detachable magazine', () => {
  const { engine, actor } = weaponFixture('weapon-007-m37a2-pump-shotgun');
  assert.equal(engine.fire(actor), true); advance(engine, .04);
  assert.equal(engine.reload(actor), true);
  advance(engine, actor.tacticalReload.profile.duration + .001);
  assert.equal(actor.reloading, false); assert.equal(actor.ammo, actor.magazineSize);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0);
  assert.equal(engine.weaponEffectsV124.stats.discardedMagazines, 0);
  advance(engine, .2);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 1);
  assert.equal(engine.weaponEffectsV124.stats.discardedMagazines, 0);
});

test('a pump cycle stays pending while installing equipment and resumes after cancellation', () => {
  const sentry = EQUIPMENT.find(item => item.id === 'equipment-020-portable-sentry');
  const { engine, actor } = weaponFixture('weapon-007-m37a2-pump-shotgun', { equipment: [sentry] });
  assert.equal(engine.fire(actor), true); advance(engine, .04);
  assert.equal(engine.useEquipment(sentry.id, actor), true); assert.equal(engine.confirmPlaceableV86(actor), true);
  advance(engine, .5);
  assert.equal(engine.isPlaceableBusyV86(actor), true);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0);
  assert.equal(engine.cancelPlaceableV86(actor), true);
  advance(engine, .2);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 1);
});

test('pending pump effects are abandoned for unavailable actors, weapon changes and scene resets', () => {
  const transitions = [
    actor => { actor.alive = false; }, actor => { actor.downed = true; },
    actor => { actor.inVehicle = true; }, actor => { actor.ventTransit = {}; },
    actor => { actor.weaponMode = 'sidearm'; }
  ];
  for (const transition of transitions) {
    const { engine, actor } = weaponFixture('weapon-007-m37a2-pump-shotgun');
    assert.equal(engine.fire(actor), true); advance(engine, .04);
    actor.health = 30; assert.equal(engine.useMedkit(actor), true); advance(engine, .3);
    transition(actor); engine.advanceSceneWeaponEffectsV124(0);
    assert.equal(engine.pendingWeaponCyclesV124.length, 0);
    assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0);
    Object.assign(actor, { alive: true, downed: false, inVehicle: false, ventTransit: null, weaponMode: 'rifle' });
    engine.cancelFieldActionV124(actor); advance(engine, .5);
    assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0, 'Returning to an actor or weapon cannot replay its discarded event.');
  }
  const { engine, actor } = weaponFixture('weapon-007-m37a2-pump-shotgun');
  assert.equal(engine.fire(actor), true); engine.resetSceneWeaponEffectsV124(); advance(engine, .4);
  assert.equal(engine.pendingWeaponCyclesV124.length, 0); assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0);
});

test('disabling local coop discards its pending pump cycle instead of ejecting from an absent operator', () => {
  const { engine } = weaponFixture('weapon-007-m37a2-pump-shotgun');
  engine.setCoop(true);
  const member = { ...CREW[1], gearV85: [{ instanceId: 'qa-bravo-pump', catalogId: 'weapon-007-m37a2-pump-shotgun', kind: 'weapon' }] };
  assert.equal(attachCrewDeploymentV85(engine.coop, member), true);
  assert.equal(engine.fire(engine.coop), true); advance(engine, .04);
  engine.setCoop(false); advance(engine, .2);
  assert.equal(engine.pendingWeaponCyclesV124.length, 0);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0);
  engine.setCoop(true); advance(engine, .3);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0);
});

test('empty magazine and cell reload debris occurs once despite pause, cancellation and restart', () => {
  const energy = WEAPONS.find(item => /^N79/.test(item.name)) || WEAPONS.find(item => item.family === 'energy');
  for (const [id, stat] of [['weapon-004-vp70-combat-pistol', 'discardedMagazines'], [energy.id, 'discardedCells']]) {
    const { engine, actor } = weaponFixture(id); actor.ammo = 0;
    assert.equal(engine.reload(actor), true);
    const duration = actor.tacticalReload.profile.duration;
    advance(engine, duration * 0.2); assert.equal(engine.weaponEffectsV124.stats[stat], 0);
    engine.togglePause(); const paused = engine.weaponEffectsSnapshotV124(); advance(engine, 2);
    assert.deepEqual(engine.weaponEffectsSnapshotV124(), paused);
    engine.togglePause(); advance(engine, duration * 0.21);
    assert.equal(actor.ammo, 0); assert.equal(engine.weaponEffectsV124.stats[stat], 1);
    cancelReloadThroughMedicalWork(engine, actor);
    assert.equal(engine.reload(actor), true); advance(engine, duration * 0.41);
    assert.equal(engine.weaponEffectsV124.stats[stat], 1, 'The same discarded empty container cannot be dropped twice.');
    advance(engine, duration); assert.ok(actor.ammo > 0); assert.equal(engine.weaponEffectsV124.stats[stat], 1);
  }
});

test('a partially filled pistol magazine is retained during an actual tactical reload', () => {
  const { engine, actor } = weaponFixture();
  assert.equal(engine.fire(actor), true); advance(engine, 0.5);
  assert.equal(engine.reload(actor), true); advance(engine, actor.tacticalReload.completeAt + 0.1);
  assert.equal(actor.ammo, actor.magazineSize); assert.equal(engine.weaponEffectsV124.stats.discardedMagazines, 0);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 1, 'Only the accepted fired cartridge is on the floor.');
});

test('spent revolver cases follow accepted shots, not empty chambers after a partial refill', () => {
  const weapon = WEAPONS.find(item => item.name === 'Frontier Revolver') || WEAPONS.find(item => /Revolver$/.test(item.name)); assert.ok(weapon);
  const { engine, actor } = weaponFixture(weapon.id);
  actor.magazineSize = 6; actor.ammo = 6; actor.ammoReserve = 2;
  for (let shot = 0; shot < 6; shot++) { assert.equal(engine.fire(actor), true); advance(engine, 1 / engine.weaponRuntime.fireRate + 0.01); }
  assert.equal(actor.ammo, 0); assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 6);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0);
  assert.equal(engine.reload(actor), true); const duration = actor.tacticalReload.profile.duration;
  advance(engine, duration * 0.41); assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 6);
  advance(engine, duration); assert.equal(actor.ammo, 2); assert.equal(actor.ammoReserve, 0);
  actor.ammoReserve = 2; assert.equal(engine.reload(actor), true); advance(engine, duration * 0.41);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 6, 'Unloaded chambers are not fired cartridge cases.');
});

test('resting cases survive room/camera changes but a scene stop or resume starts a clean cosmetic pool', () => {
  const { engine, actor, start } = weaponFixture(); assert.equal(engine.fire(actor), true); advance(engine, 3);
  assert.equal(engine.weaponEffectsV124.casings.length, 1); assert.equal(engine.weaponEffectsV124.casings[0].resting, true);
  const id = engine.weaponEffectsV124.casings[0].id;
  engine.camera.x = 700; engine.room = 3; engine.mission.phase = 'next-room'; advance(engine, 0.1);
  assert.equal(engine.weaponEffectsV124.casings[0].id, id);
  const resumeState = engine.captureResumeState(); const restored = fixture({ ...start, resumeState }).engine;
  assert.equal(restored.weaponEffectsV124.casings.length, 0); assert.equal(restored.weaponEffectsV124.stats.acceptedShots, 0);
  engine.stop(); assert.equal(engine.weaponEffectsV124.casings.length, 0); assert.equal(engine.weaponEffectsV124.lights.length, 0);
});

test('hostile acid projectiles have no firearm effects; a real shooter projectile does', () => {
  const { engine, actor } = fixture();
  const enemy = nearbyEnemy(engine);
  enemy.behavior = 'spitter'; engine.spawnEnemyProjectile(enemy, actor);
  assert.equal(engine.hostileProjectiles.at(-1).acid, true); assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 0);
  enemy.behavior = 'shooter'; engine.spawnEnemyProjectile(enemy, actor);
  assert.equal(engine.hostileProjectiles.at(-1).acid, false); assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 1);
  assert.equal(engine.weaponEffectsV124.lights.length, 1);
});

test('an installed sentry emits at its own muzzle only after spending a real round', () => {
  const sentry = EQUIPMENT.find(item => item.id === 'equipment-020-portable-sentry');
  const { engine, actor } = fixture({ equipment: [sentry] });
  assert.equal(engine.useEquipment(sentry.id, actor), true); assert.equal(engine.confirmPlaceableV86(actor), true);
  advance(engine, 2.6); const instance = engine.placeablesV86.instances[0]; assert.equal(instance.status, 'deployed');
  const enemy = nearbyEnemy(engine); enemy.x = instance.x + 260; enemy.alert = false;
  const ammo = instance.ammo, actorShots = actor.shots;
  engine.updatePlaceableSentryV86(instance, 1 / 60);
  assert.equal(instance.ammo, ammo - 1); assert.equal(actor.shots, actorShots);
  assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 1); assert.equal(engine.weaponEffectsV124.lights.length, 1);
  assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 0, 'Undocumented sentry cases are not invented.');
  const bullet = engine.bullets.find(entry => entry.placeableInstanceIdV86 === instance.instanceId);
  assert.equal(engine.weaponEffectsV124.lights[0].x, bullet.x); assert.equal(engine.weaponEffectsV124.lights[0].y, bullet.y);
  instance.ammo = 0; engine.updatePlaceableSentryV86(instance, 1);
  assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 1);
});
