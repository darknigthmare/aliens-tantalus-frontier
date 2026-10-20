import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, CREW, NEURO_XENO_PROFILES } from '../src/content.js';
import { WEAPON_ACTION_PROFILES_V131, resolveWeaponActionProfileV131 } from '../src/weapon-actions-v131.js';
import { attachCrewDeploymentV85 } from '../src/crew-runtime-v85.js';

// Real final production engine and accepted fire/reload/field-work/damage/save
// paths. Only browser APIs and the physical test scene are supplied by this host.
const named = name => WEAPONS.find(weapon => weapon.name === name);
const RIGHT = Object.freeze({ x: 1, y: 0 });

function fixture(name = 'Combat Knife', options = {}) {
  const windowEvents = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = windowEvents[name].bind(windowEvents);
  globalThis.document = Object.assign(new EventTarget(), { hidden: false, activeElement: null, hasFocus: () => true });
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 1024; naturalHeight = 1024; width = 1024; height = 1024;
    async decode() {}
    set src(value) {
      this._src = value;
      try {
        const data = readFileSync(new URL(`..${new URL(value, 'http://qa.invalid').pathname}`, import.meta.url));
        if (data.subarray(1, 4).toString() === 'PNG') {
          this.naturalWidth = this.width = data.readUInt32BE(16); this.naturalHeight = this.height = data.readUInt32BE(20);
        }
      } catch { /* Browser host only; production retains its own readiness guards. */ }
      queueMicrotask(() => { this.dispatchEvent(new Event('load')); this.onload?.(); });
    }
    get src() { return this._src; }
  };
  globalThis.requestAnimationFrame = () => 1; globalThis.cancelAnimationFrame = () => {};
  const ctx = new Proxy({ texts: [], fillText(value) { this.texts.push(String(value)); },
    measureText: value => ({ width: String(value).length * 7 }),
    createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) },
  { get(target, property) { return property in target ? target[property] : () => {}; } });
  const canvas = Object.assign(new EventTarget(), { width: 1280, height: 720, getContext: () => ctx,
    focus() { document.activeElement = this; }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }) });
  const events = [], engine = new GameEngine(canvas, { onEvent: event => events.push(event) });
  const weapon = named(name); assert.ok(weapon);
  const start = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon, enemyCatalog: ENEMIES.slice(0, 1),
    crew: [], equipment: [], seed: 426, ...options };
  engine.start(start);
  Object.assign(engine, { platforms: [{ id: 'qa-floor', x: 0, y: 930, w: 6200, h: 150, floor: true }],
    ladders: [], lifts: [], walls: [], covers: [], doors: [], hazards: [], vents: [], enemies: [],
    missionLevelRuntime: null, destructibleSceneryV130: null });
  Object.assign(engine.player, { x: 160, y: 838, vx: 0, vy: 0, grounded: true, pointerAimV83: RIGHT });
  Object.assign(engine.coop, { x: 110, y: 838, vx: 0, vy: 0, grounded: true });
  engine.ensureSceneWeaponEffectsV124();
  return { engine, actor: engine.player, weapon, events, start, ctx };
}

function enemy(engine, x = 218, index = engine.enemies.length) {
  const target = engine.createEnemy(ENEMIES.find(item => item.id === 'enemy-005-warrior'), index, x, 930);
  Object.assign(target, { health: 500, maxHealth: 500, armor: 0, alert: true, revealed: 1, speed: 0 });
  engine.enemies.push(target);
  return target;
}
function physics(engine, seconds, rate = 120) {
  let remaining = seconds;
  while (remaining > 1e-9) { const delta = Math.min(remaining, 1 / rate); engine.updateBullets(delta); remaining -= delta; }
}
function simulate(engine, seconds, rate = 120) {
  let remaining = seconds;
  while (remaining > 1e-9) { const delta = Math.min(remaining, 1 / rate); engine.update(delta); remaining -= delta; }
}
function noGenericBullets(subject) {
  assert.equal(subject.engine.bullets.length, 0);
}

test('every V131 identity has its exact immutable action and an explicit source or adaptation receipt', () => {
  assert.ok(WEAPON_ACTION_PROFILES_V131.length >= 86);
  for (const profile of WEAPON_ACTION_PROFILES_V131) {
    assert.equal(resolveWeaponActionProfileV131({ id: profile.weaponId }), profile);
    assert.ok(Object.isFrozen(profile)); assert.ok(Object.isFrozen(profile.evidence));
    assert.equal(profile.evidence.canonExact, false);
    assert.ok(['documented-mechanism-original-game-tuning', 'project-original-game-mechanism', 'category-adaptation-not-certified-canon'].includes(profile.evidence.status));
  }
  assert.equal(resolveWeaponActionProfileV131(named('4C2 Astra')).rounds, 3);
  assert.equal(resolveWeaponActionProfileV131(named('6A Jaipur Submachine Gun')).pellets, 4);
  assert.equal(resolveWeaponActionProfileV131(named('2B1 Vajra')).radius, 90);
  assert.equal(resolveWeaponActionProfileV131(named('M94 Impact Grenade')).kind, 'launcher');
  for (const descriptor of [named('X1 Fireball'), named('Combat Knife'), named('M40 HEDP Grenade'),
    named('M41A Pulse Rifle'), { id: 'weapon-999-shotgun', name: 'Shotgun', family: 'ballistic' }, { name: 'N79 EVA Laser' }])
    assert.equal(resolveWeaponActionProfileV131(descriptor), null);
});

test('a real shotgun trigger spends one shell and emits one shot/ejection event for its six distinct pellets', () => {
  const subject = fixture('M37A2 Pump Shotgun'), { engine, actor } = subject;
  const ammo = actor.ammo, target = enemy(engine, 285), health = target.health;
  assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, ammo - 1);
  assert.equal(engine.weaponProjectilesV131.length, 6); assert.equal(actor.shots, 1);
  assert.equal(new Set(engine.weaponProjectilesV131.map(projectile => projectile.vy)).size, 6);
  assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 1); assert.equal(engine.weaponEffectsV124.casings.length, 0);
  assert.equal(engine.fire(actor), false); simulate(engine, .21);
  assert.ok(target.health < health); assert.equal(engine.weaponEffectsV124.stats.ejectedCasings, 1);
  assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 1); noGenericBullets(subject);
});

test('J1 and J2 keep the actual equipped shotgun bash for an unaimed contact without spending a shell or emitting firearm props', () => {
  for (const role of ['player', 'coop']) for (const empty of [false, true]) {
    const subject = fixture('M37A2 Pump Shotgun'), { engine, weapon } = subject;
    if (role === 'coop') {
      engine.setCoop(true);
      assert.equal(attachCrewDeploymentV85(engine.coop, { ...CREW[1], gearV85: [
        { instanceId: 'contact-pump', catalogId: weapon.id, kind: 'weapon' }
      ] }), true);
    }
    const actor = engine[role];
    Object.assign(actor, { pointerAimV83: null, gamepadAimV83: null, aimingV124: false, fireClock: 0 });
    if (empty) actor.ammo = 0;
    const target = enemy(engine, actor.x + 45), health = target.health;
    const ammo = actor.ammo, reserve = actor.ammoReserve, shots = actor.shots;
    const registered = engine.penetrationTelemetry.shots;
    assert.equal(engine.fire(actor), true); assert.ok(target.health < health);
    assert.equal(actor.meleeKind, 'rifle-bash'); assert.ok(actor.meleeClock > 0);
    assert.equal(actor.ammo, ammo); assert.equal(actor.ammoReserve, reserve); assert.equal(actor.shots, shots);
    assert.equal(actor.reloading, false); assert.equal(Number(actor.v52FireClock) || 0, 0);
    assert.equal(engine.penetrationTelemetry.shots, registered); assert.equal(engine.weaponCyclesV131.size, 0);
    assert.equal(engine.weaponProjectilesV131.length, 0); assert.equal(engine.weaponBeamsV131.length, 0); noGenericBullets(subject);
    assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 0);
    assert.equal(engine.weaponEffectsV124.casings.length, 0); assert.equal(engine.weaponEffectsV124.lights.length, 0);
    const action = engine.resolvePlayerAppearanceActionV127(actor);
    assert.equal(action.kind, 'rifle-bash'); assert.equal(action.eligible, true);
    assert.equal(action.props.length, 1); assert.equal(action.props[0].itemId, weapon.id);
    assert.equal(action.props[0].part, 'equipped-weapon-bash'); assert.equal(action.props[0].firing, false);
  }
});

test('explicit pointer, keyboard and held aiming remain shotgun shots at the same close contact for either operator', () => {
  for (const role of ['player', 'coop']) for (const input of ['pointer', 'direction', 'held']) {
    const subject = fixture('M37A2 Pump Shotgun'), { engine } = subject;
    if (role === 'coop') {
      engine.setCoop(true);
      assert.equal(attachCrewDeploymentV85(engine.coop, { ...CREW[1], gearV85: [
        { instanceId: 'aimed-pump', catalogId: subject.weapon.id, kind: 'weapon' }
      ] }), true);
    }
    const actor = engine[role], ammo = actor.ammo;
    Object.assign(actor, { pointerAimV83: input === 'pointer' ? RIGHT : null, gamepadAimV83: null, aimingV124: false });
    if (input === 'direction') engine.keys.add(role === 'coop' ? 'KeyL' : 'KeyD');
    if (input === 'held') engine.keys.add(role === 'coop' ? 'ShiftRight' : 'ShiftLeft');
    enemy(engine, actor.x + 45);
    assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, ammo - 1); assert.equal(actor.shots, 1);
    assert.equal(Number(actor.meleeClock) || 0, 0); assert.equal(engine.weaponProjectilesV131.length, 6);
    assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 1); noGenericBullets(subject);
    assert.notEqual(engine.resolvePlayerAppearanceActionV127(actor).kind, 'rifle-bash');
  }
});

test('scatter weapons conserve total damage, lose damage at range and Jaipur splits exactly four pieces', () => {
  const damage = [];
  for (const x of [280, 600]) {
    const subject = fixture('Type 76 Auto Shotgun'), target = enemy(subject.engine, x), health = target.health;
    assert.equal(subject.engine.fire(subject.actor), true);
    assert.ok(Math.abs(subject.engine.weaponProjectilesV131.reduce((sum, projectile) => sum + projectile.damage, 0) - subject.weapon.damage) < 1e-8);
    physics(subject.engine, .75); damage.push(health - target.health); noGenericBullets(subject);
  }
  assert.ok(damage[0] > damage[1]);
  const subject = fixture('6A Jaipur Submachine Gun'), ammo = subject.actor.ammo;
  assert.equal(subject.engine.fire(subject.actor), true); assert.equal(subject.engine.weaponProjectilesV131.length, 4);
  assert.equal(subject.actor.ammo, ammo - 1); assert.equal(subject.engine.weaponEffectsV124.stats.acceptedShots, 1);
});

test('local coop and a real personal squad shotgun use their own shells and scatter profile', () => {
  const subject = fixture('Plasma Rifle'), { engine, actor } = subject;
  engine.setCoop(true);
  const kit = { ...CREW[1], gearV85: [{ instanceId: 'v131-pump', catalogId: named('M37A2 Pump Shotgun').id, kind: 'weapon' }] };
  assert.equal(attachCrewDeploymentV85(engine.coop, kit), true);
  engine.coop.pointerAimV83 = RIGHT;
  const ammo = engine.coop.ammo;
  assert.equal(engine.fire(engine.coop), true);
  assert.equal(engine.coop.ammo, ammo - 1); assert.equal(actor.shots, 0);
  assert.ok(engine.weaponProjectilesV131.every(projectile => projectile.owner === engine.coop && projectile.kind === 'scatter'));
  const member = Object.assign(engine.createPlayer(160, '#abc', false), { squadMember: true, crewId: 'v131-squad',
    x: 160, y: 838, grounded: true, fireClock: 0, actions: 0 });
  assert.equal(attachCrewDeploymentV85(member, { ...kit, id: CREW[0].id }), true);
  engine.squadActors = [member]; enemy(engine, 270);
  assert.equal(engine.fireCrewWeaponV85(member), true);
  assert.equal(engine.weaponProjectilesV131.filter(projectile => projectile.owner === member).length, 6);
  assert.equal(member.ammo, named('M37A2 Pump Shotgun').magazine - 1);
});

test('fuel pulses form a real short cone, commit fuel once and do not damage a target behind an intact pane', () => {
  const subject = fixture('Type 99 Incinerator'), { engine, actor } = subject;
  const target = enemy(engine, 350), health = target.health;
  const plan = { signature: 'qa-flame-pane', destructibleSceneryV130: [
    { id: 'flame-pane', material: 'glass', x: 290, y: 750, w: 8, h: 180, plane: 'gameplay', hp: 32 }
  ] };
  engine.missionLevelRuntime = plan; engine.configureDestructibleSceneryV130(plan);
  const ammo = actor.ammo;
  assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, ammo - 1);
  assert.equal(engine.weaponProjectilesV131.length, 0); assert.equal(engine.weaponBeamsV131.length, 1);
  assert.ok(engine.weaponBeamsV131[0].segments.every(segment => segment.endX <= 290.001));
  assert.ok(engine.destructibleSceneryV130.objects[0].hp < 32); assert.equal(target.health, health);
  const live = fixture('M240 Incinerator Unit'), exposed = enemy(live.engine, 275), before = exposed.health;
  assert.equal(live.engine.fire(live.actor), true); assert.ok(exposed.health < before);
  assert.equal(exposed.statusEffect, 'burn'); noGenericBullets(live);
  physics(live.engine, 1); assert.ok(exposed.health < before - live.weapon.damage, 'Actual burn damage continues after the fuel pulse.');
});

test('continuous flame and laser/plasma heat block spending while overheated and freeze/cool on actual pause transitions', () => {
  const subject = fixture('Type 99 Incinerator'), { engine, actor } = subject;
  const profile = resolveWeaponActionProfileV131(subject.weapon);
  for (let shot = 0; shot < 30 && !engine.thermalWeaponV131(actor, profile).overheated; shot++) {
    assert.equal(engine.fire(actor), true); simulate(engine, .11);
  }
  const thermal = engine.thermalWeaponV131(actor, profile); assert.equal(thermal.overheated, true);
  const ammo = actor.ammo, heat = thermal.heat;
  assert.equal(engine.fire(actor), false); assert.equal(actor.ammo, ammo);
  engine.togglePause(); simulate(engine, 2); physics(engine, 2); assert.equal(thermal.heat, heat);
  const saved = JSON.parse(JSON.stringify(engine.captureResumeState()));
  engine.togglePause(); assert.equal(engine.applyResumeState(saved).applied, true);
  assert.equal(engine.thermalWeaponV131(actor, profile).overheated, true);
  simulate(engine, 3); assert.equal(engine.thermalWeaponV131(actor, profile).overheated, false);
  assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, ammo - 1);
});

test('roquettes and impact launchers use distinct speed/gravity and explode on real terrain contacts', () => {
  for (const name of ['M12 RPG', 'M94 Impact Grenade', 'U1A2 GL Conversion', '2B1 Vajra']) {
    const subject = fixture(name), { engine, actor } = subject, ammo = actor.ammo;
    engine.walls = [{ id: 'launcher-wall', x: 400, y: 500, w: 3, h: 430 }];
    const hidden = enemy(engine, 425), health = hidden.health;
    assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, ammo - 1);
    const projectile = engine.weaponProjectilesV131[0], vy = projectile.vy;
    physics(engine, .1);
    assert.ok(Math.abs(projectile.vy - (vy + resolveWeaponActionProfileV131(subject.weapon).gravity * .1)) < 1e-8);
    physics(engine, .6);
    assert.equal(engine.weaponProjectilesV131.length, 0); assert.equal(hidden.health, health);
    assert.equal(subject.events.filter(event => event.type === 'launcher-impact-v131').length, 1);
    assert.ok(engine.enemyTacticsV130.noises.some(noise => noise.kind === 'explosion'));
    noGenericBullets(subject);
  }
});
test('an impact launcher breaks the actual near pane without damaging a contact behind that intact pane in the same blast', () => {
  const subject = fixture('M12 RPG'), { engine, actor } = subject;
  const plan = { signature: 'qa-rocket-glass', destructibleSceneryV130: [
    { id: 'rocket-pane', material: 'glass', x: 350, y: 750, w: 8, h: 180, plane: 'gameplay' }
  ] };
  engine.missionLevelRuntime = plan; engine.configureDestructibleSceneryV130(plan);
  const hidden = enemy(engine, 400), health = hidden.health;
  assert.equal(engine.fire(actor), true); physics(engine, .5);
  assert.equal(engine.destructibleSceneryV130.objects[0].destroyed, true); assert.equal(hidden.health, health);
  assert.equal(subject.events.filter(event => event.type === 'launcher-impact-v131').length, 1);
});

test('bow draw is a real delayed transaction, freezes while paused and launches one gravity-affected arrow after resume', () => {
  const subject = fixture('Compound Bow'), { engine, actor } = subject, ammo = actor.ammo;
  assert.equal(engine.fire(actor), true); assert.equal(engine.fire(actor), false);
  assert.equal(actor.ammo, ammo); assert.equal(engine.weaponProjectilesV131.length, 0);
  physics(engine, .1); const remaining = engine.weaponCyclesV131.get(actor).remaining;
  engine.togglePause(); physics(engine, 1); assert.equal(engine.weaponCyclesV131.get(actor).remaining, remaining);
  const saved = JSON.parse(JSON.stringify(engine.captureResumeState())); engine.togglePause();
  assert.equal(engine.applyResumeState(saved).applied, true);
  physics(engine, remaining + .02);
  assert.equal(actor.ammo, ammo - 1); assert.equal(actor.shots, 1); assert.equal(engine.weaponProjectilesV131.length, 1);
  const arrow = engine.weaponProjectilesV131[0], vy = arrow.vy; physics(engine, .2);
  assert.ok(arrow.vy > vy); assert.equal(arrow.kind, 'arrow'); assert.equal(engine.weaponEffectsV124.casings.length, 0);
  assert.equal(engine.reload(actor), false); noGenericBullets(subject);
});

test('a bow charge interrupted by real field work, injury, ladder or a changed weapon spends no arrow', () => {
  for (const scenario of ['medical', 'impact', 'ladder', 'weapon']) {
    const subject = fixture('Compound Bow'), { engine, actor } = subject, ammo = actor.ammo;
    assert.equal(engine.fire(actor), true); physics(engine, .1);
    if (scenario === 'medical') { actor.health = 30; assert.equal(engine.useMedkit(actor), true); }
    if (scenario === 'impact') engine.damagePlayer(actor, 5, { source: 'impact' });
    if (scenario === 'ladder') actor.climbing = true;
    if (scenario === 'weapon') actor.weaponMode = 'sidearm';
    physics(engine, .5);
    assert.equal(actor.ammo, ammo); assert.equal(engine.weaponProjectilesV131.length, 0);
    assert.equal(engine.weaponCyclesV131.size, 0); noGenericBullets(subject);
  }
});

test('a fired harpoon/arrow can be recovered exactly once by its actual owner with the matching weapon', () => {
  for (const name of ['Compound Bow', 'Harpoon Gun']) {
    const subject = fixture(name), { engine, actor } = subject;
    Object.assign(engine, { powerNode: null, archiveTerminal: null, objective: null, vents: [], vehicle: { ...engine.vehicle, active: false } });
    engine.walls = [{ id: 'recover-wall', x: 270, y: 500, w: 3, h: 430 }];
    const reserve = actor.ammoReserve;
    assert.equal(engine.fire(actor), true); physics(engine, .6);
    assert.equal(engine.recoverableWeaponsV131.length, 1);
    const item = engine.recoverableWeaponsV131[0];
    Object.assign(actor, { x: item.x - actor.w / 2, y: item.y - actor.h / 2, fireClock: 0 });
    assert.equal(engine.interact(actor), true); assert.equal(actor.ammoReserve, reserve + 1);
    assert.equal(engine.recoverableWeaponsV131.length, 0); assert.equal(engine.interact(actor), false);
    assert.equal(actor.ammoReserve, reserve + 1);
  }
});

for (const name of ['Compound Bow', 'Harpoon Gun']) test(`${name} recovery admission is read-only and preserves owner, equipped profile, 72px boundary and line of sight`, () => {
  const subject = fixture(name), { engine, actor, weapon, events } = subject;
  Object.assign(engine, { powerNode: null, archiveTerminal: null, objective: null, vents: [], vehicle: { ...engine.vehicle, active: false } });
  engine.walls = [{ id: 'recover-wall', x: 270, y: 500, w: 3, h: 430 }];
  const reserve = actor.ammoReserve;
  assert.equal(engine.fire(actor), true); physics(engine, .6);
  assert.equal(engine.recoverableWeaponsV131.length, 1);
  const recoverables = engine.recoverableWeaponsV131, item = recoverables[0], itemBefore = { ...item };
  // An actual impact produced this item. Remove that test wall explicitly so
  // the admitted case has a clear path; retaining the wall must remain denied.
  engine.walls = [];
  Object.assign(actor, { x: item.x - actor.w / 2 - 72, y: item.y - actor.h / 2, fireClock: 0 });
  const admittedX = actor.x, eventCount = events.length, interactionClock = actor.interactionClock;
  assert.equal(engine.recoverableWeaponIndexV131(), 0);
  assert.equal(engine.recoverableWeaponIndexV131(actor), 0);
  assert.equal(engine.recoverableWeaponsV131, recoverables);
  assert.deepEqual(item, itemBefore);
  assert.equal(actor.ammoReserve, reserve); assert.equal(events.length, eventCount);
  assert.equal(actor.interactionClock, interactionClock);

  actor.x = admittedX - .001;
  assert.equal(engine.recoverableWeaponIndexV131(actor), -1);
  assert.equal(engine.interact(actor), false);
  actor.x = admittedX;
  engine.walls = [{ id: 'recover-occluder', x: item.x - 36, y: item.y - 30, w: 3, h: 60 }];
  assert.equal(engine.recoverableWeaponIndexV131(actor), -1);
  assert.equal(engine.interact(actor), false);
  engine.walls = [];

  const weaponMode = actor.weaponMode;
  actor.weaponMode = 'sidearm';
  assert.notEqual(engine.weaponActionProfileV131(actor)?.weaponId, weapon.id);
  assert.equal(engine.recoverableWeaponIndexV131(actor), -1);
  assert.equal(engine.interact(actor), false);
  actor.weaponMode = weaponMode;
  assert.equal(engine.weaponActionProfileV131(actor)?.weaponId, weapon.id);

  engine.setCoop(true);
  // Give the second fixture operator the same equipped profile, so rejection
  // below isolates projectile ownership rather than a mismatched sidearm.
  Object.assign(engine.coop, { x: actor.x, y: actor.y, weaponMode });
  assert.equal(engine.canPerformGameplayAction(engine.coop), true);
  assert.equal(engine.weaponActionProfileV131(engine.coop)?.weaponId, weapon.id);
  assert.equal(engine.recoverableWeaponIndexV131(engine.coop), -1);
  assert.equal(engine.interact(engine.coop), false);

  engine.togglePause();
  assert.equal(engine.recoverableWeaponIndexV131(actor), -1);
  assert.equal(engine.interact(actor), false);
  engine.togglePause();
  assert.equal(actor.ammoReserve, reserve); assert.equal(engine.recoverableWeaponsV131.length, 1);
  assert.equal(events.filter(event => event.type === 'weapon-recovered-v131').length, 0);

  assert.equal(engine.recoverableWeaponIndexV131(actor), 0);
  assert.equal(engine.interact(actor), true);
  assert.equal(actor.ammoReserve, reserve + 1); assert.equal(engine.recoverableWeaponsV131.length, 0);
  assert.equal(events.filter(event => event.type === 'weapon-recovered-v131').length, 1);
  assert.equal(engine.recoverableWeaponIndexV131(actor), -1);
  assert.equal(engine.interact(actor), false); assert.equal(actor.ammoReserve, reserve + 1);
});

test('bolts and harpoons retain real finite trajectories and a Sonic Harpoon applies real disorientation', () => {
  for (const name of ['Bolt Gun', 'Harpoon Gun', 'Foundry Nailgun', 'Sonic Harpoon']) {
    const subject = fixture(name), { engine, actor } = subject;
    const target = enemy(engine, 300), health = target.health, ammo = actor.ammo;
    assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, ammo - 1);
    assert.equal(engine.weaponProjectilesV131[0].kind, 'bolt'); physics(engine, .4);
    assert.ok(target.health < health, name);
    assert.equal(engine.weaponEffectsV124.casings.length, 0, name);
    if (name === 'Sonic Harpoon') assert.equal(target.statusEffect, 'disoriented');
    noGenericBullets(subject);
  }
});

test('laser contacts are instantaneous and occluded while plasma and charged HEL remain actual moving cell projectiles', () => {
  const laser = fixture('N79 EVA Laser'), target = enemy(laser.engine, 360), health = target.health, ammo = laser.actor.ammo;
  assert.equal(laser.engine.fire(laser.actor), true); assert.ok(target.health < health);
  assert.equal(laser.actor.ammo, ammo - 1); assert.equal(laser.engine.weaponProjectilesV131.length, 0);
  assert.equal(laser.engine.weaponBeamsV131.length, 1); assert.equal(target.statusEffect, 'ionized'); noGenericBullets(laser);
  const shielded = fixture('N79 EVA Laser'), hidden = enemy(shielded.engine, 360), before = hidden.health;
  shielded.engine.walls = [{ id: 'laser-wall', x: 300, y: 500, w: 3, h: 430 }];
  assert.equal(shielded.engine.fire(shielded.actor), true); assert.equal(hidden.health, before);
  for (const name of ['Plasma Rifle', 'EDS-93 Zadak Plasma Discharger', 'P.649 HEL', 'EVI-87 Zvezda Plasma Rifle']) {
    const subject = fixture(name), profile = resolveWeaponActionProfileV131(subject.weapon), ammo = subject.actor.ammo;
    assert.equal(subject.engine.fire(subject.actor), true);
    if (profile.charge) { assert.equal(subject.actor.ammo, ammo); physics(subject.engine, profile.charge + .01); }
    assert.equal(subject.actor.ammo, ammo - 1); assert.equal(subject.engine.weaponProjectilesV131[0].kind, 'plasma');
    assert.equal(subject.engine.weaponProjectilesV131[0].vx, 620); noGenericBullets(subject);
  }
});

test('electric, acidic, freezing and chemical projectiles produce real temporary effects that survive a JSON resume', () => {
  for (const [name, status] of [['ES-4 Electroshock Pistol', 'stun'], ['Ripper Acid Projector', 'corroded'],
    ['Cryo Lance', 'frozen'], ['Pathogen Containment Projector', 'contaminated']]) {
    const subject = fixture(name), { engine, actor } = subject, target = enemy(engine, 275), health = target.health;
    target.speed = 100;
    assert.equal(engine.fire(actor), true); physics(engine, .3);
    assert.ok(target.health < health); assert.equal(target.statusEffect, status);
    const saved = JSON.parse(JSON.stringify(engine.captureResumeState())), remaining = engine.weaponStatusesV131.get(target).remaining;
    const stagger = target.staggerClock; target.staggerClock = 0;
    assert.equal(engine.applyResumeState(saved).applied, true);
    assert.equal(engine.weaponStatusesV131.get(target).remaining, remaining);
    if (status === 'stun' || status === 'frozen') assert.equal(target.staggerClock, stagger);
    const before = target.health, armor = target.armor;
    engine.togglePause(); physics(engine, 1); assert.equal(target.health, before);
    engine.togglePause(); physics(engine, 1);
    if (status === 'corroded' || status === 'contaminated') assert.ok(target.health < before, status);
    engine.updateEnemy(target, .01); assert.equal(target.speed, 100, 'Temporary slowing never compounds the base speed.');
    physics(engine, 3); assert.equal(target.statusEffect, null); assert.equal(target.armor, armor);
    noGenericBullets(subject);
  }
});

test('three-round bursts commit each actual cartridge at its own interval and cancel remaining rounds on reload/weapon change', () => {
  for (const name of ['4C2 Astra', 'AM-16 Gruppa', 'SVAT-92 Sokol']) {
    const subject = fixture(name), { engine, actor } = subject, ammo = actor.ammo;
    assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, ammo - 1); assert.equal(actor.shots, 1);
    physics(engine, .069); assert.equal(actor.ammo, ammo - 1);
    physics(engine, .08); assert.equal(actor.ammo, ammo - 3); assert.equal(actor.shots, 3);
    assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 3); assert.equal(engine.weaponCyclesV131.size, 0);
  }
  for (const scenario of ['reload', 'weapon']) {
    const { engine, actor } = fixture('4C2 Astra'), ammo = actor.ammo;
    assert.equal(engine.fire(actor), true);
    if (scenario === 'reload') assert.equal(engine.reload(actor), true); else actor.weaponMode = 'sidearm';
    physics(engine, .15); assert.equal(actor.ammo, ammo - 1); assert.equal(actor.shots, 1);
  }
});

test('minigun spool-up delays its first round, then heat and the ordinary magazine/reload remain owned by that operator', () => {
  const subject = fixture('L59 Minigun'), { engine, actor } = subject, ammo = actor.ammo;
  assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, ammo); assert.equal(engine.weaponProjectilesV131.length, 0);
  simulate(engine, .24); assert.equal(actor.ammo, ammo - 1);
  simulate(engine, .09); assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, ammo - 2);
  assert.ok(engine.thermalWeaponV131(actor, resolveWeaponActionProfileV131(subject.weapon)).heat > 0);
  noGenericBullets(subject);
});

test('flechette collision uses the actual swept destination when penetrating instead of travelling the same displacement twice', () => {
  const subject = fixture('X45 Bombard'), { engine, actor } = subject;
  const target = enemy(engine, 280), health = target.health;
  assert.equal(engine.fire(actor), true); const projectile = engine.weaponProjectilesV131[0], x = projectile.x;
  physics(engine, .1, 30);
  assert.ok(target.health < health); assert.ok(Math.abs(projectile.x - (x + 110)) < 1e-8);
  assert.equal(projectile.hits, 1); noGenericBullets(subject);
});

test('pending typed projectiles and heat survive JSON resume, reject injected identities/duplicates and never refund their ammunition', () => {
  const subject = fixture('Plasma Rifle'), { engine, actor } = subject, ammo = actor.ammo;
  assert.equal(engine.fire(actor), true); physics(engine, .1);
  const saved = JSON.parse(JSON.stringify(engine.captureResumeState())), projectile = saved.weaponActionsV131.projectiles[0];
  saved.weaponActionsV131.projectiles.push({ ...projectile }, { ...projectile, id: 'weapon-action-v131:991', weaponId: 'weapon-999-unknown' },
    { ...projectile, id: 'weapon-action-v131:992', weaponId: named('N79 EVA Laser').id },
    { ...projectile, id: 'weapon-action-v131:993', ownerId: 'foreign' },
    { ...projectile, id: 'weapon-action-v131:994', hits: 1 });
  assert.equal(engine.applyResumeState(saved).applied, true);
  assert.equal(engine.weaponProjectilesV131.length, 1); assert.equal(actor.ammo, ammo - 1);
  const restored = engine.weaponProjectilesV131[0]; assert.equal(restored.x, projectile.x); assert.equal(restored.vx, projectile.vx);
  engine.enemyAtlasLoadingPausedV65 = true; physics(engine, 2); assert.equal(restored.x, projectile.x);
  engine.enemyAtlasLoadingPausedV65 = false; physics(engine, .1); assert.ok(restored.x > projectile.x);
});

test('all new action kinds keep gameplay guards, rear planes and mounted/Fireball/V130 delegation intact', () => {
  for (const name of ['M37A2 Pump Shotgun', 'M240 Incinerator Unit', 'M12 RPG', 'Compound Bow', 'N79 EVA Laser', 'Cryo Lance']) {
    const subject = fixture(name), { engine, actor } = subject, ammo = actor.ammo;
    const target = enemy(engine, 275), health = target.health;
    Object.assign(target, { dormant: true, rearEntryV130: { phase: 'approaching' } });
    assert.equal(engine.fire(actor), true); physics(engine, .8); assert.equal(target.health, health);
    actor.fireClock = 0; actor.climbing = true;
    const after = actor.ammo; assert.equal(engine.fire(actor), false); assert.equal(actor.ammo, after);
    assert.ok(actor.ammo <= ammo); noGenericBullets(subject);
  }
  const fireball = fixture('X1 Fireball'); assert.equal(fireball.engine.fire(fireball.actor), true);
  assert.equal(fireball.engine.bullets[0].impactMechanismV122, 'D17-gel-projectile-impact-explosion');
  const knife = fixture('Combat Knife'); assert.equal(knife.engine.fire(knife.actor), true); noGenericBullets(knife);
  const mounted = fixture('M37A2 Pump Shotgun'); Object.assign(mounted.actor, { inVehicle: true });
  Object.assign(mounted.engine.vehicle, { occupied: true, driver: mounted.actor, canFire: true, turretAmmo: 20, accessSecureClock: 0 });
  assert.equal(mounted.engine.fire(mounted.actor), true); assert.equal(mounted.engine.bullets[0].kind, 'apc-turret');
  assert.equal(mounted.engine.weaponProjectilesV131.length, 0);
});

test('the final HUD shows actual fuel, cells, arrows, charge and heat rather than a fake rifle action', () => {
  for (const [name, label] of [['Compound Bow', 'FLÈCHES'], ['M240 Incinerator Unit', 'CARB'],
    ['N79 EVA Laser', 'CELL'], ['Cryo Lance', 'RÉSERV']]) {
    const subject = fixture(name); subject.engine.drawHud(subject.ctx);
    assert.ok(subject.ctx.texts.find(text => text.startsWith('PV ')).includes(label), name);
    if (name === 'Compound Bow') {
      assert.equal(subject.engine.fire(subject.actor), true); subject.ctx.texts.length = 0; subject.engine.drawHud(subject.ctx);
      assert.ok(subject.ctx.texts.find(text => text.startsWith('PV ')).includes('CHARGE EN COURS'));
    }
  }
});

test('a barrel crossing an opaque near wall cannot start flame or laser damage on its far side', () => {
  for (const name of ['M240 Incinerator Unit', 'N79 EVA Laser']) {
    const subject = fixture(name), { engine, actor } = subject;
    const muzzle = engine.resolvePlayerMuzzleV124(actor, RIGHT), target = enemy(engine, muzzle.x + 20), health = target.health;
    assert.ok(muzzle.x > muzzle.pivotX);
    engine.walls = [{ id: 'near-barrel-wall', x: (muzzle.pivotX + muzzle.x) / 2, y: 500, w: 3, h: 430 }];
    const ammo = actor.ammo;
    assert.equal(engine.fire(actor), false, 'A withdrawn barrel cannot emit a beam from a different firing direction.');
    assert.equal(actor.ammo, ammo); assert.equal(target.health, health);
    assert.equal(engine.weaponBeamsV131.length, 0);
  }
});

test('checkpoint retries preserve exhausted arrows, harpoons, fuel, cells and explosive stocks without minting rounds', () => {
  for (const name of ['Compound Bow', 'Harpoon Gun', 'M240 Incinerator Unit', 'N79 EVA Laser', 'Cryo Lance', 'M12 RPG', 'M94 Impact Grenade']) {
    const { engine, actor } = fixture(name);
    Object.assign(actor, { ammo: 0, ammoReserve: 2, health: 0, alive: false });
    engine.mission.state = 'failed';
    assert.equal(engine.restartFromCheckpoint(), true);
    assert.equal(actor.ammo, 0, name); assert.equal(actor.ammoReserve, 2, name);
    assert.equal(actor.alive, true);
  }
});

test('thermal state and delayed shots belong to each actual coop operator and personal crew cannot spend an empty kit', () => {
  const { engine, actor } = fixture('P.649 HEL'); engine.setCoop(true);
  engine.coop.pointerAimV83 = RIGHT;
  const profile = resolveWeaponActionProfileV131(named('P.649 HEL'));
  const hot = engine.thermalWeaponV131(actor, profile); hot.heat = 1; hot.overheated = true;
  assert.equal(engine.fire(actor), false); assert.equal(engine.fire(engine.coop), true);
  physics(engine, .56);
  assert.equal(engine.coop.shots, 1); assert.equal(actor.shots, 0);
  assert.ok(engine.weaponProjectilesV131.every(projectile => projectile.owner === engine.coop));
  const kit = { ...CREW[1], gearV85: [{ instanceId: 'pump-crew', catalogId: named('M37A2 Pump Shotgun').id, kind: 'weapon' }] };
  const member = Object.assign(engine.createPlayer(160, '#abc', false), { squadMember: true, crewId: 'empty-pump',
    x: 160, y: 838, grounded: true });
  assert.equal(attachCrewDeploymentV85(member, { ...kit, id: CREW[0].id }), true);
  Object.assign(member, { ammo: 0, ammoReserve: 0 }); engine.squadActors = [member]; enemy(engine, 280);
  assert.equal(engine.fireCrewWeaponV85(member), false); assert.equal(engine.weaponCyclesV131.has(member), false);
});

test('every released V131 weapon and finish executes its actual action through final production fire', () => {
  for (const profile of WEAPON_ACTION_PROFILES_V131) {
    const subject = fixture(profile.name), { engine, actor } = subject, ammo = actor.ammo;
    assert.equal(engine.fire(actor), true, profile.weaponId);
    if (profile.charge) physics(engine, profile.charge + .01);
    assert.equal(actor.ammo, ammo - 1, profile.weaponId); assert.equal(actor.shots, 1, profile.weaponId);
    assert.equal(engine.weaponEffectsV124.stats.acceptedShots, 1, profile.weaponId);
    if (['stream', 'laser'].includes(profile.kind)) assert.equal(engine.weaponBeamsV131[0].kind, profile.kind);
    else assert.equal(engine.weaponProjectilesV131[0].kind, profile.kind, profile.weaponId);
    noGenericBullets(subject);
  }
});
