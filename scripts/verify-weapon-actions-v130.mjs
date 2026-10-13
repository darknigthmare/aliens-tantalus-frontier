import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, CREW, NEURO_XENO_PROFILES } from '../src/content.js';
import { WEAPON_ACTION_PROFILES_V130, resolveWeaponActionProfileV130 } from '../src/weapon-actions-v130.js';
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
function noGunfire(subject) {
  assert.equal(subject.engine.bullets.length, 0);
  assert.equal(subject.engine.weaponEffectsV124.stats.acceptedShots, 0);
  assert.equal(subject.engine.weaponEffectsV124.casings.length, 0);
}

test('exact catalogue categories and every finish are admitted without relabelling guns, M94 or Fireball', () => {
  for (const profile of WEAPON_ACTION_PROFILES_V130) {
    const weapon = WEAPONS.find(weapon => weapon.id === profile.weaponId);
    assert.equal(resolveWeaponActionProfileV130(weapon), profile);
    assert.ok(Object.isFrozen(profile));
  }
  for (const name of ['Combat Knife', 'Stun Baton', 'Cutting Torch', 'M40 HEDP Grenade', 'Smart Disc']) {
    const variants = WEAPONS.filter(weapon => weapon.name.split(' — ')[0] === name);
    assert.ok(variants.length > 1);
    assert.ok(variants.every(weapon => resolveWeaponActionProfileV130(weapon)));
  }
  for (const descriptor of [named('M41A Pulse Rifle'), named('M94 Impact Grenade'), named('X1 Fireball'),
    { id: 'weapon-999-combat-knife', name: 'Combat Knife', family: 'melee' }, { name: 'Combat Knife' }])
    assert.equal(resolveWeaponActionProfileV130(descriptor), null);
});

test('all carried melee implements strike only a close visible target, preserving ammo and exact action art', () => {
  for (const name of ['Combat Knife', 'Wrist Blades', 'Fire Axe', 'Maintenance Jack', 'Combi-Stick']) {
    const subject = fixture(name), target = enemy(subject.engine, 210), health = target.health;
    const resources = { ammo: subject.actor.ammo, reserve: subject.actor.ammoReserve, shots: subject.actor.shots };
    assert.equal(subject.engine.fire(subject.actor), true, name);
    assert.ok(target.health < health, `${name} reaches the actual close target.`);
    assert.deepEqual({ ammo: subject.actor.ammo, reserve: subject.actor.ammoReserve, shots: subject.actor.shots }, resources);
    assert.equal(subject.engine.reload(subject.actor), false);
    assert.equal(subject.engine.fire(subject.actor), false, 'Cooldown rejects a duplicate hit.');
    const pose = subject.engine.resolvePlayerAppearanceActionV127(subject.actor);
    assert.equal(pose.eligible, true, name);
    assert.equal(pose.props[0].itemId, subject.weapon.id, 'The actual implement replaces the generic knife artwork.');
    noGunfire(subject);
  }
});

test('a knife can swing with no ammunition but cannot hit distant, rear or occluded targets', () => {
  for (const scenario of ['empty', 'distance', 'rear', 'wall', 'door', 'cover', 'background']) {
    const subject = fixture(), { engine, actor } = subject;
    actor.ammo = actor.ammoReserve = 0;
    const target = enemy(engine, scenario === 'distance' ? 450 : scenario === 'rear' ? 100 : 215);
    const health = target.health;
    if (scenario === 'background') Object.assign(target, { dormant: true, rearEntryV130: { phase: 'approaching' } });
    const obstruction = { id: 'obstruction', x: 205, y: 700, w: 5, h: 230 };
    if (scenario === 'wall') engine.walls = [obstruction];
    if (scenario === 'cover') engine.covers = [obstruction];
    if (scenario === 'door') engine.closedDoorColliders = () => [obstruction];
    assert.equal(engine.fire(actor), true);
    if (scenario === 'empty') assert.ok(target.health < health); else assert.equal(target.health, health, scenario);
    assert.equal(actor.ammo, 0); assert.equal(actor.ammoReserve, 0); assert.equal(actor.reloading, false);
    noGunfire(subject);
  }
});

test('stun baton contacts apply a real native stun without a projectile, permanent speed loss or ammo transaction', () => {
  const subject = fixture('Stun Baton'), { engine, actor } = subject, target = enemy(engine, 210);
  target.speed = 100;
  const health = target.health, ammo = actor.ammo, reserve = actor.ammoReserve;
  assert.equal(engine.fire(actor), true);
  assert.ok(target.health < health); assert.equal(target.statusEffect, 'stun');
  assert.ok(target.staggerClock >= 1.1); assert.equal(target.speed, 100);
  assert.equal(actor.ammo, ammo); assert.equal(actor.ammoReserve, reserve); assert.equal(engine.reload(actor), false);
  const saved = JSON.parse(JSON.stringify(engine.captureResumeState()));
  target.staggerClock = 0; target.statusEffect = null;
  assert.equal(engine.applyResumeState(saved).applied, true);
  assert.equal(target.statusEffect, 'stun'); assert.equal(target.staggerClock, saved.weaponActionsV130.statuses[0].staggerClock);
  engine.togglePause(); simulate(engine, 1);
  assert.equal(target.staggerClock, saved.weaponActionsV130.statuses[0].staggerClock);
  noGunfire(subject);
});

test('a carried torch damages only a close contact and swaps fuel with the existing tank reload transaction', () => {
  const subject = fixture('Cutting Torch'), { engine, actor } = subject;
  const target = enemy(engine, 205), health = target.health, ammo = actor.ammo;
  assert.equal(engine.fire(actor), true); assert.ok(target.health < health);
  assert.equal(target.statusEffect, 'burn'); assert.equal(actor.ammo, ammo - 1); noGunfire(subject);
  simulate(engine, .8); actor.ammo = 0; actor.ammoReserve = 3;
  assert.equal(engine.reload(actor), true); assert.equal(actor.tacticalReload.profile.family, 'tank');
  simulate(engine, actor.tacticalReload.completeAt + .1);
  assert.equal(actor.ammo, 3); assert.equal(actor.ammoReserve, 0); assert.equal(actor.reloading, false);
  const distant = fixture('Cutting Torch'); enemy(distant.engine, 600);
  const fuel = distant.actor.ammo;
  assert.equal(distant.engine.fire(distant.actor), false); assert.equal(distant.actor.ammo, fuel); noGunfire(distant);
});

test('torch breach keeps the real target, commits fuel once and cancels on movement, impact or save without spending', () => {
  for (const scenario of ['complete', 'movement', 'impact', 'save', 'changed']) {
    const subject = fixture('Cutting Torch'), { engine, actor } = subject;
    const wall = { id: 'breach-panel', x: 212, y: 780, w: 24, h: 150, breakable: true };
    engine.walls = [wall];
    const fuel = actor.ammo;
    assert.equal(engine.fire(actor), true); assert.equal(actor.fieldActionV124.kind, 'breach');
    assert.equal(actor.ammo, fuel); assert.equal(wall.destroyed, undefined);
    simulate(engine, .3);
    if (scenario === 'movement') engine.keys.add('KeyD');
    if (scenario === 'impact') engine.damagePlayer(actor, 4, { source: 'impact' });
    if (scenario === 'save') assert.equal(engine.applyResumeState(JSON.parse(JSON.stringify(engine.captureResumeState()))).applied, true);
    if (scenario === 'changed') wall.breakable = false;
    simulate(engine, FIELD_SECONDS);
    assert.equal(actor.ammo, fuel - Number(scenario === 'complete'));
    assert.equal(Boolean(wall.destroyed), scenario === 'complete');
    assert.equal(actor.fieldActionV124, null); noGunfire(subject);
  }
});
const FIELD_SECONDS = 3;

test('personal coop and squad firearm kits remain independent of J1 carrying a knife', () => {
  const subject = fixture('Combat Knife'), { engine, actor } = subject;
  engine.setCoop(true);
  const kit = { ...CREW[1], gearV85: [{ instanceId: 'v130-pistol', catalogId: named('M4A3 Service Pistol').id, kind: 'weapon' }] };
  assert.equal(attachCrewDeploymentV85(engine.coop, kit), true);
  Object.assign(engine.coop, { x: 160, y: 838, pointerAimV83: RIGHT });
  const target = enemy(engine, 210), health = target.health, ammo = engine.coop.ammo;
  const knifeAmmo = actor.ammo;
  assert.equal(engine.fire(actor), true); assert.ok(target.health < health); assert.equal(actor.ammo, knifeAmmo);
  assert.equal(engine.weaponActionProfileV130(engine.coop), null);
  assert.equal(engine.fire(engine.coop), true); assert.equal(engine.coop.ammo, ammo - 1);
  assert.equal(actor.shots, 0); assert.equal(engine.coop.shots, 1);
  assert.equal(engine.bullets[0].owner, engine.coop);
  assert.equal(engine.weaponDescriptorV124(engine.coop).id, kit.gearV85[0].catalogId);
  const member = Object.assign(engine.createPlayer(160, '#abc', false), { squadMember: true, crewId: 'v130-squad',
    x: 160, y: 838, grounded: true, fireClock: 0, actions: 0, crewV85: null });
  assert.equal(attachCrewDeploymentV85(member, { ...kit, id: CREW[0].id }), true);
  engine.squadActors = [member];
  assert.equal(engine.weaponActionProfileV130(member), null);
  assert.equal(engine.fireCrewWeaponV85(member), true); assert.equal(member.shots, 1);
  assert.equal(member.ammo, named('M4A3 Service Pistol').magazine - 1);
  assert.equal(engine.bullets.at(-1).owner, member);
});

test('J2 uses the real field pickup to equip the shared knife and strike without spending its fake magazine', () => {
  const subject = fixture('Combat Knife'), { engine } = subject;
  engine.setCoop(true);
  Object.assign(engine.weaponPickup, { x: engine.coop.x, y: engine.coop.y, taken: false });
  assert.equal(engine.interact(engine.coop), true); simulate(engine, .7);
  engine.coop.pointerAimV83 = RIGHT;
  const target = enemy(engine, engine.coop.x + engine.coop.w + 8), health = target.health, ammo = engine.coop.ammo;
  assert.equal(engine.weaponActionProfileV130(engine.coop).kind, 'melee');
  assert.equal(engine.fire(engine.coop), true); assert.ok(target.health < health);
  assert.equal(engine.coop.ammo, ammo); noGunfire(subject);
});

test('real grenade throws spend exactly one personal grenade, fly an arc, bounce and never reload a firearm magazine', () => {
  const subject = fixture('M40 HEDP Grenade'), { engine, actor } = subject;
  actor.ammo = 0; actor.ammoReserve = 2;
  assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, 0); assert.equal(actor.ammoReserve, 1);
  assert.equal(engine.reload(actor), false); assert.equal(engine.fire(actor), false);
  const projectile = engine.weaponProjectilesV130[0], initial = { x: projectile.x, y: projectile.y, vy: projectile.vy };
  physics(engine, .2);
  assert.ok(projectile.x > initial.x); assert.ok(projectile.y < initial.y);
  assert.ok(projectile.vy > initial.vy); assert.equal(projectile.remaining.toFixed(2), '1.40');
  const pose = engine.resolvePlayerAppearanceActionV127(actor);
  assert.equal(pose.kind, 'throw-grenade'); assert.equal(pose.props.length, 0, 'The thrown grenade is not duplicated in a hand.');
  physics(engine, 1.25);
  assert.ok(projectile.y + projectile.h <= 930.001); assert.ok(projectile.vx < 380, 'Actual floor bounce damps travel.');
  assert.equal(engine.weaponProjectilesV130.length, 1); noGunfire(subject);
  physics(engine, .16);
  assert.equal(engine.weaponProjectilesV130.length, 0);
  assert.equal(subject.events.filter(event => event.type === 'grenade-exploded-v130').length, 1);
  assert.equal(actor.ammoReserve, 1); noGunfire(subject);
});

test('grenade blasts damage exposed contacts and glass while walls, intact glass and background depth protect other contacts', () => {
  const subject = fixture('M40 HEDP Grenade'), { engine, actor } = subject;
  assert.equal(engine.fire(actor), true); physics(engine, 1.5);
  const projectile = engine.weaponProjectilesV130[0];
  const exposed = enemy(engine, projectile.x - 45), hidden = enemy(engine, projectile.x + 80);
  const background = enemy(engine, projectile.x - 45);
  Object.assign(background, { dormant: true, rearEntryV130: { phase: 'approaching' } });
  const plan = { signature: 'qa-grenade-glass', destructibleSceneryV130: [
    { id: 'glass-v130', material: 'glass', x: projectile.x + 55, y: 750, w: 8, h: 180, plane: 'gameplay' }
  ] };
  engine.missionLevelRuntime = plan; engine.configureDestructibleSceneryV130(plan);
  const pane = engine.destructibleSceneryV130.objects[0]; assert.ok(pane);
  const exposedHealth = exposed.health, hiddenHealth = hidden.health, backgroundHealth = background.health;
  physics(engine, .11);
  assert.ok(exposed.health < exposedHealth); assert.equal(hidden.health, hiddenHealth);
  assert.equal(background.health, backgroundHealth); assert.equal(pane.destroyed, true);
  assert.ok(engine.enemyTacticsV130.noises.some(noise => noise.kind === 'explosion'));
  assert.equal(subject.events.filter(event => event.type === 'grenade-exploded-v130').length, 1);
  physics(engine, 1); assert.equal(hidden.health, hiddenHealth, 'A spent blast never repeats through its newly broken pane.');
});

test('knife, torch and disc contacts damage only their first foreground decoration using the existing scenery system', () => {
  for (const name of ['Combat Knife', 'Cutting Torch', 'Smart Disc']) {
    const subject = fixture(name), { engine, actor } = subject;
    const plan = { signature: `qa-scenery-${name}`, destructibleSceneryV130: [
      { id: 'front-panel', material: 'panel', x: name === 'Smart Disc' ? 260 : 205, y: 760, w: 8, h: 170, plane: 'gameplay' },
      { id: 'background-panel', material: 'panel', x: 205, y: 760, w: 8, h: 170, plane: 'background' }
    ] };
    engine.missionLevelRuntime = plan; engine.configureDestructibleSceneryV130(plan);
    const front = engine.destructibleSceneryV130.objects[0], background = engine.destructibleSceneryV130.objects[1];
    const target = enemy(engine, front.x + 20), health = target.health, ammo = actor.ammo;
    assert.equal(engine.fire(actor), true); physics(engine, .3);
    assert.ok(front.hp < front.maxHp, name); assert.equal(background.hp, background.maxHp);
    assert.equal(target.health, health, `${name} is spent on the nearer intact decoration.`);
    assert.equal(actor.ammo, ammo - Number(name === 'Cutting Torch')); noGunfire(subject);
  }
});

test('an opaque wall shields glass and an inactive J2 body never receives an otherwise exposed grenade blast', () => {
  const subject = fixture('M40 HEDP Grenade'), { engine, actor } = subject;
  assert.equal(engine.coopEnabled, false);
  assert.equal(engine.fire(actor), true); physics(engine, 1.5);
  const projectile = engine.weaponProjectilesV130[0];
  const plan = { signature: 'qa-opaque-before-glass', destructibleSceneryV130: [
    { id: 'shielded-glass', material: 'glass', x: projectile.x + 65, y: 750, w: 8, h: 180, plane: 'gameplay' }
  ] };
  engine.missionLevelRuntime = plan; engine.configureDestructibleSceneryV130(plan);
  engine.walls.push({ id: 'opaque-before-glass', x: projectile.x + 35, y: 700, w: 6, h: 230 });
  Object.assign(engine.coop, { x: projectile.x - 25, y: 838 });
  const health = engine.coop.health, armor = engine.coop.armor;
  physics(engine, .11);
  assert.equal(engine.destructibleSceneryV130.objects[0].hp, 32);
  assert.equal(engine.coop.health, health); assert.equal(engine.coop.armor, armor);
  assert.equal(subject.events.filter(event => event.type === 'grenade-exploded-v130').length, 1);
});

test('grenade fuse and trajectory freeze on pause/loading and survive JSON resume without refunding or duplicating a charge', () => {
  const subject = fixture('M40 HEDP Grenade'), { engine, actor } = subject;
  const ammo = actor.ammo;
  assert.equal(engine.fire(actor), true); physics(engine, .4);
  const state = JSON.parse(JSON.stringify(engine.captureResumeState()));
  const projectile = structuredClone(state.weaponActionsV130.projectiles[0]);
  engine.togglePause(); physics(engine, 2); simulate(engine, 2);
  assert.deepEqual(engine.captureResumeState().weaponActionsV130.projectiles[0], projectile);
  engine.togglePause(); engine.enemyAtlasLoadingPausedV65 = true; physics(engine, 2);
  assert.deepEqual(engine.captureResumeState().weaponActionsV130.projectiles[0], projectile);
  engine.enemyAtlasLoadingPausedV65 = false;
  state.weaponActionsV130.projectiles.push({ ...projectile }, { ...projectile, id: 'weapon-action-v130:900', ownerId: 'foreign' },
    { ...projectile, id: 'weapon-action-v130:901', weaponId: 'weapon-999-unknown' });
  assert.equal(engine.applyResumeState(state).applied, true);
  assert.equal(engine.weaponProjectilesV130.length, 1); assert.equal(actor.ammo, ammo - 1);
  assert.deepEqual(engine.captureResumeState().weaponActionsV130.projectiles[0], projectile);
  physics(engine, projectile.remaining + .01);
  assert.equal(engine.weaponProjectilesV130.length, 0); assert.equal(actor.ammo, ammo - 1);
  assert.equal(subject.events.filter(event => event.type === 'grenade-exploded-v130').length, 1);
});

test('grenades stop at thin walls and checkpoint restart cannot fabricate thrown supplies', () => {
  const subject = fixture('M40 HEDP Grenade'), { engine, actor } = subject;
  engine.walls = [{ id: 'thin-wall', x: 260, y: 500, w: 3, h: 430 }];
  actor.ammo = 1; actor.ammoReserve = 0;
  assert.equal(engine.fire(actor), true); physics(engine, .5, 30);
  assert.ok(engine.weaponProjectilesV130[0].x + 10 <= 260);
  assert.equal(actor.ammo, 0); assert.equal(engine.fire(actor), false);
  engine.failMission('qa'); assert.equal(engine.restartFromCheckpoint(), true);
  assert.equal(actor.ammo, 0); assert.equal(actor.ammoReserve, 0); assert.equal(engine.weaponProjectilesV130.length, 0);
});

test('a Smart Disc is thrown and recovered, hits a visible target once and never contacts a rear-depth enemy', () => {
  const subject = fixture('Smart Disc'), { engine, actor } = subject;
  const target = enemy(engine, 280), background = enemy(engine, 230);
  Object.assign(background, { dormant: true, rearEntryV130: { phase: 'approaching' } });
  const health = target.health, backgroundHealth = background.health, ammo = actor.ammo, reserve = actor.ammoReserve;
  assert.equal(engine.fire(actor), true); assert.equal(engine.fire(actor), false);
  physics(engine, .4);
  assert.ok(target.health < health); assert.equal(background.health, backgroundHealth);
  const after = target.health;
  physics(engine, 1);
  assert.equal(engine.weaponProjectilesV130.length, 0); assert.equal(target.health, after);
  assert.equal(actor.ammo, ammo); assert.equal(actor.ammoReserve, reserve); noGunfire(subject);
});

test('action admission preserves pause, incapacitation, reload, ladder, field-work and mounted weapon contracts', () => {
  for (const name of ['Combat Knife', 'Stun Baton', 'Cutting Torch', 'M40 HEDP Grenade']) {
    for (const blocked of ['paused', 'loading', 'downed', 'climbing', 'vent', 'reload', 'working']) {
      const subject = fixture(name), { engine, actor } = subject;
      enemy(engine, 210); const ammo = actor.ammo;
      if (blocked === 'paused') engine.togglePause();
      if (blocked === 'loading') engine.enemyAtlasLoadingPausedV65 = true;
      if (blocked === 'downed') actor.downed = true;
      if (blocked === 'climbing') actor.climbing = true;
      if (blocked === 'vent') actor.ventTransit = {};
      if (blocked === 'reload') actor.reloading = true;
      if (blocked === 'working') { actor.health = 30; assert.equal(engine.useMedkit(actor), true); }
      assert.equal(engine.fire(actor), false, `${name}/${blocked}`); assert.equal(actor.ammo, ammo);
      assert.equal(engine.weaponProjectilesV130.length, 0); noGunfire(subject);
    }
  }
  const mounted = fixture(), { engine, actor } = mounted;
  Object.assign(actor, { inVehicle: true }); Object.assign(engine.vehicle,
    { occupied: true, driver: actor, canFire: true, turretAmmo: 20, accessSecureClock: 0 });
  const ammo = actor.ammo;
  assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, ammo);
  assert.equal(engine.bullets.at(-1).kind, 'apc-turret'); assert.equal(engine.weaponProjectilesV130.length, 0);
});

test('ordinary firearms and documented V122 Fireball retain their real accepted-shot mechanics', () => {
  for (const name of ['M41A Pulse Rifle', 'M94 Impact Grenade', 'X1 Fireball']) {
    const subject = fixture(name), { engine, actor } = subject, ammo = actor.ammo;
    assert.equal(engine.fire(actor), true); assert.equal(actor.ammo, ammo - 1);
    assert.equal(engine.weaponProjectilesV130.length, 0); assert.equal(engine.bullets.length, 1);
    if (name === 'X1 Fireball') {
      assert.equal(engine.bullets[0].impactMechanismV122, 'D17-gel-projectile-impact-explosion');
      assert.equal(Math.hypot(engine.bullets[0].vx, engine.bullets[0].vy), 480);
    }
  }
  const profile = NEURO_XENO_PROFILES.find(profile => profile.playerClassCompatible);
  const subject = fixture('Combat Knife', { neuroProfile: profile }); enemy(subject.engine, 210);
  assert.equal(subject.engine.fire(subject.actor), true); assert.equal(subject.engine.weaponActionProfileV130(subject.actor), null);
  noGunfire(subject);
});

test('the real HUD and field prompts describe contact, fuel, thrown grenades and disc recovery instead of fake gun magazines', () => {
  for (const [name, label, action] of [
    ['Combat Knife', 'CONTACT', 'FRAPPER AU CONTACT'], ['Stun Baton', 'BÂTON ÉLECTR', 'FRAPPER ET ÉTOURDIR'],
    ['Cutting Torch', 'CARB', 'CHANGER LE RÉSERVOIR'], ['M40 HEDP Grenade', 'GREN', 'LANCER UNE GRENADE'],
    ['Smart Disc', 'DISQUE PRÊT', 'LANCER LE DISQUE']
  ]) {
    const { engine, actor, ctx } = fixture(name);
    Object.assign(engine, { powerNode: null, archiveTerminal: null, objective: null,
      vehicle: { ...engine.vehicle, active: false }, covers: [], ladders: [] });
    engine.drawHud(ctx);
    const status = ctx.texts.find(text => text.startsWith('PV '));
    assert.ok(status?.includes(label), name); assert.ok(!status.includes('MUN'), name);
    assert.ok(engine.getInteractionPrompt(actor).includes(action), name);
    if (name === 'Smart Disc') {
      assert.equal(engine.fire(actor), true); ctx.texts.length = 0; engine.drawHud(ctx);
      assert.ok(ctx.texts.find(text => text.startsWith('PV ')).includes('DISQUE EN VOL'));
    }
  }
  const firearm = fixture('M41A Pulse Rifle'); firearm.engine.drawHud(firearm.ctx);
  assert.ok(firearm.ctx.texts.find(text => text.startsWith('PV ')).includes('MUN'));
});
