import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { GameEngine as ProductionEngine } from '../src/game-production-runtime.js';
import { EQUIPMENT, WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { PLACEABLE_CATALOG_V86, PLACEABLE_EXTENSION_CATALOG_V132, getPlaceableDefinitionV86, createPlaceablesStateV86,
  capturePlaceablesStateV86, restorePlaceablesStateV86 } from '../src/placeables-state-v86.js';
import { withPlaceablesExtensionV132, validatePlaceablesExtensionStateV132 } from '../src/placeables-extension-v132.js';
import { buildPlaceableDockModelV86, renderPlaceableDockMarkupV86 } from '../src/placeables-ui-v86.js';
import { PLACEABLE_VISUAL_PROFILES_V86, resolvePlaceableDrawSpecV86 } from '../src/placeables-visual-v86.js';
import { playerAppearanceGroundSupportV129 } from '../src/player-appearance-runtime-v126.js';
import { WEAPON_ACTION_PROFILES_V131 } from '../src/weapon-actions-v131.js';

const IDS = Object.fromEntries(EQUIPMENT.slice(0, 30).map(item => [item.name, item.id]));
const ALL = ['Portable Sentry', 'Cryo Mine', 'Electroshock Trap', 'Portable Quarantine', 'Signal Jammer', 'Ammo Satchel', 'Portable Battery', 'Colony Beacon'];
const actorId = actor => actor.crewId || actor.operatorId || (actor.coop ? 'coop' : 'player');
function fixture({ names = ALL, nativeGeometry = false, ...extra } = {}) {
  const events = new EventTarget();
  for (const name of ['addEventListener', 'removeEventListener', 'dispatchEvent']) globalThis[name] = events[name].bind(events);
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
  const emitted = [], engine = new ProductionEngine(canvas, { onEvent: event => emitted.push(event) });
  const plan = { ...buildMissionLevelV52({ world: WORLDS[0], campaign: CAMPAIGNS[0], levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical' }),
    dimensions: { width: 5200, height: 1080 }, destructibleSceneryV130: [] };
  const options = { world: WORLDS[0], campaign: CAMPAIGNS[0], weapon: WEAPONS[0], enemyCatalog: ENEMIES.slice(0, 1),
    equipment: names.map(name => EQUIPMENT.find(item => item.id === IDS[name])), crew: [], seed: 426,
    missionLevel: plan, verticalWorldV130: false, ...extra };
  engine.start(options);
  if (!nativeGeometry) Object.assign(engine, { platforms: [{ id: 'qa-floor', x: 0, y: 930, w: 5200, h: 150, floor: true }],
    ladders: [], lifts: [], elevators: [], vents: [], covers: [], doors: [], hazards: [], walls: [] });
  Object.assign(engine, { enemies: [], hostileProjectiles: [], bullets: [] });
  const floorY = nativeGeometry ? engine.platforms.find(item => item.x <= 160 && item.x + item.w >= 202).y : 930;
  Object.assign(engine.player, { x: 160, y: floorY - engine.player.h, vx: 0, vy: 0, grounded: true, facing: 1 });
  Object.assign(engine.coop, { x: 100, y: floorY - engine.coop.h, vx: 0, vy: 0, grounded: true, facing: 1 });
  return { engine, actor: engine.player, options, emitted };
}
function carried(engine, name) { return engine.placeablesV86.instances.find(item => item.catalogId === IDS[name] && item.status === 'carried'); }
function deploy(engine, name, actor = engine.player, mode) {
  const instance = carried(engine, name); assert.ok(instance, name);
  assert.equal(engine.useEquipment(instance.catalogId, actor), true, name);
  if (mode) assert.equal(engine.setPlaceableModeV132(instance.instanceId, mode, actor), true);
  assert.equal(engine.confirmPlaceableV86(actor), true, engine.refreshPlaceablePreviewV86(actor)?.reason);
  engine.updateEquipmentDeployments(getPlaceableDefinitionV86(instance.catalogId).installSeconds + 0.01);
  assert.equal(instance.status, 'deployed', name); return instance;
}
function finish(engine, seconds = 2.1) { engine.updateEquipmentDeployments(seconds); }
function enemy(engine, x = 650, name = 'Warrior') {
  const definition = ENEMIES.find(item => item.name === name) || ENEMIES.find(item => item.id === 'enemy-005-warrior');
  const result = engine.createEnemy(definition, 0, x, 930); engine.enemies.push(result); return result;
}
function shot(engine, actor = engine.player) {
  actor.fireClock = 0; actor.meleeClock = 0; actor.reloading = false;
  engine.keys.add(actor === engine.coop ? 'ShiftRight' : 'ShiftLeft');
  assert.equal(engine.fire(actor), true); engine.updateBullets(0.65);
}

test('the shipped runtime admits all six families from 25 exact equipment IDs, without cyclic substitutes or free stock', () => {
  const { engine } = fixture();
  assert.equal(ProductionEngine.placeablesExtensionV132, true);
  assert.equal(withPlaceablesExtensionV132(ProductionEngine), ProductionEngine, 'Admission is idempotent.');
  const snapshot = engine.getPlaceablesExtensionSnapshotV132();
  assert.equal(snapshot.ready, true); assert.equal(snapshot.admittedCatalogs, 25);
  for (const value of Object.values(snapshot.counts)) assert.ok(value > 0);
  const empty = fixture({ names: ['Medkit', 'Access Tuner'] }).engine;
  assert.equal(empty.placeablesV86.instances.length, 0);
  assert.equal(empty.useEquipment(IDS['Portable Sentry']), false);
  const actions = engine.equipmentActions;
  assert.equal(createPlaceablesStateV86(actions).sourceIssued.length, 4, 'Legacy V86 alone does not repurpose field tools.');
  assert.equal(PLACEABLE_CATALOG_V86.length, 12); assert.equal(PLACEABLE_EXTENSION_CATALOG_V132.length, 13);
});

test('each physical family has its own exact authored transparent sheet, not a mapping onto four unrelated drawings', async () => {
  assert.equal(PLACEABLE_VISUAL_PROFILES_V86.length, 8);
  assert.equal(new Set(PLACEABLE_VISUAL_PROFILES_V86.map(item => item.path)).size, 8);
  const { engine } = fixture();
  for (const profile of PLACEABLE_VISUAL_PROFILES_V86) {
    const data = await readFile(new URL(`..${profile.path}`, import.meta.url));
    assert.equal(createHash('sha256').update(data).digest('hex'), profile.sha256);
    assert.equal(data.readUInt32BE(16), 512); assert.equal(data.readUInt32BE(20), 512);
    assert.equal(data[25], 6, 'The admitted tool sheet carries alpha.');
    const instance = engine.placeablesV86.instances.find(item => item.kind === profile.kind);
    assert.ok(resolvePlaceableDrawSpecV86({ ...instance, x: 300, y: 500 }));
  }
});

test('a late legacy operator identity does not strip J1 material or loan it to J2', () => {
  const { engine, actor } = fixture({ names: ['Portable Sentry'] }); engine.setCoop(true);
  actor.operatorId = 'echo-9'; engine.coop.operatorId = 'bravo-2';
  assert.equal(engine.useEquipment(IDS['Portable Sentry'], actor), true);
  assert.equal(engine.useEquipment(IDS['Portable Sentry'], engine.coop), false);
  assert.ok(buildPlaceableDockModelV86(engine).items.find(item => item.id === IDS['Portable Sentry']).available > 0);
});

test('personal carried instances reserve and deploy once; J2 receives ownership only by physically recovering the same unit', () => {
  const { engine, actor } = fixture({ names: ['Portable Sentry'], coop: true }); engine.setCoop(true);
  const original = carried(engine, 'Portable Sentry'), state = engine.equipmentActions.get(original.catalogId), before = state.remaining;
  assert.equal(engine.useEquipment(original.catalogId, engine.coop), false);
  assert.equal(buildPlaceableDockModelV86(engine, 'coop').items.find(item => item.id === original.catalogId).available, 0);
  deploy(engine, 'Portable Sentry'); original.ammo = 17; original.health = 52;
  assert.equal(state.remaining, before - 1); assert.equal(state.uses, 1);
  actor.x = original.x - actor.w - 40; engine.coop.x = original.x - engine.coop.w - 8;
  assert.equal(engine.recoverPlaceableV86(original.instanceId, engine.coop), true); finish(engine);
  assert.equal(original.status, 'carried'); assert.equal(original.carrierCrewIdV132, actorId(engine.coop));
  assert.equal(original.health, 52); assert.equal(original.ammo, 17);
  assert.equal(engine.useEquipment(original.catalogId, engine.coop), true); assert.equal(engine.confirmPlaceableV86(engine.coop), true); finish(engine, 2.6);
  assert.equal(state.remaining, before - 1); assert.equal(state.uses, 1); assert.equal(original.ammo, 17);
});

test('thin walls, doors, shafts, objectives and changing source quantities refuse installation without phantom expenses', () => {
  for (const kind of ['wall', 'door', 'lift', 'objective']) {
    const { engine, actor } = fixture({ names: ['Portable Quarantine'] }), instance = carried(engine, 'Portable Quarantine');
    const state = engine.equipmentActions.get(instance.catalogId), before = state.remaining;
    const x = actor.x + actor.w + 18;
    if (kind === 'wall') engine.walls.push({ x: actor.x + actor.w + 6, y: 750, w: 2, h: 180 });
    if (kind === 'door') engine.doors.push({ x, y: 760, w: 60, h: 170, progress: 1 });
    if (kind === 'lift') engine.lifts.push({ x, y: 820, topY: 300, baseY: 915, w: 96, h: 15 });
    if (kind === 'objective') engine.objective = { x, y: 830, w: 80, h: 100 };
    assert.equal(engine.useEquipment(instance.catalogId), true); assert.equal(engine.confirmPlaceableV86(), false, kind);
    assert.equal(state.remaining, before); assert.equal(instance.status, 'carried');
  }
  const { engine } = fixture({ names: ['Portable Sentry'] }), instance = carried(engine, 'Portable Sentry'), state = engine.equipmentActions.get(instance.catalogId);
  engine.useEquipment(instance.catalogId); engine.confirmPlaceableV86(); state.remaining = 0;
  finish(engine, 3); assert.equal(instance.status, 'carried'); assert.equal(state.uses, 0);
});

test('install and extension tasks freeze under pause and both loading gates, and cancel on movement or impact', () => {
  const { engine, actor } = fixture({ names: ['Portable Quarantine'] }), instance = carried(engine, 'Portable Quarantine');
  engine.useEquipment(instance.catalogId); engine.confirmPlaceableV86(); engine.updateEquipmentDeployments(0.5);
  for (const gate of ['paused', 'enemyAtlasLoadingPausedV65', 'userCasteLoadingV88']) {
    engine[gate] = true; engine.updateEquipmentDeployments(10); assert.equal(engine.placeableTasksV86.values().next().value.elapsed, 0.5); engine[gate] = false;
  }
  actor.x += 13; finish(engine, 3); assert.equal(instance.status, 'carried'); assert.equal(engine.equipmentActions.get(instance.catalogId).uses, 0);
  actor.x -= 13; const barrier = deploy(engine, 'Portable Quarantine', actor, 'barrier');
  assert.equal(engine.pushPlaceableV132(barrier.instanceId, 1), true); engine.updateEquipmentDeployments(0.4);
  engine.paused = true; finish(engine, 4); assert.equal(engine.placeableExtensionTasksV132.values().next().value.elapsed, 0.4); engine.paused = false;
  const x = barrier.x; engine.damagePlayer(actor, 4); finish(engine, 2); assert.equal(barrier.x, x); assert.equal(engine.isPlaceableBusyV86(actor), false);
});

test('the quarantine armature is a real recoverable barrier: swept Marines, aliens and projectiles stop at its intact face', () => {
  const { engine, actor } = fixture({ names: ['Portable Quarantine'] }), barrier = deploy(engine, 'Portable Quarantine', actor, 'barrier');
  const target = enemy(engine, barrier.x + barrier.w + 90), health = target.health;
  const previous = actor.x; actor.x = barrier.x + barrier.w + 60; actor.vx = 900;
  engine.resolveHorizontal(actor, previous); assert.equal(actor.x, barrier.x - actor.w); assert.equal(actor.vx, 0);
  const enemyPrevious = target.x; target.x = barrier.x - target.w - 40; target.vx = -900;
  engine.resolveHorizontal(target, enemyPrevious); assert.equal(target.x, barrier.x + barrier.w);
  target.x += 90; actor.x = 160; const before = barrier.health; shot(engine);
  assert.ok(barrier.health < before); assert.equal(target.health, health);
  assert.equal(engine.walls.filter(item => item.placeableBarrierV132).length, 1);
  const inventory = { ...engine.inventory }; while (barrier.health > 0) shot(engine);
  assert.equal(engine.walls.some(item => item.placeableBarrierV132), false); assert.deepEqual(engine.inventory, inventory);
  shot(engine); assert.ok(target.health < health);
});

test('an earlier terrain or enemy contact cannot damage the barrier and splash cannot hit an alien behind it', () => {
  for (const blocker of ['wall', 'enemy']) {
    const { engine, actor } = fixture({ names: ['Portable Quarantine'] }); actor.x = 380;
    const barrier = deploy(engine, 'Portable Quarantine', actor, 'barrier'); actor.x = 160;
    if (blocker === 'wall') engine.walls.unshift({ x: 300, y: 680, w: 16, h: 250 });
    else enemy(engine, 270);
    const before = barrier.health; shot(engine); assert.equal(barrier.health, before, blocker);
  }
  const { engine, actor } = fixture({ names: ['Portable Quarantine'] }); actor.x = 420;
  const barrier = deploy(engine, 'Portable Quarantine', actor, 'barrier'); actor.x = 160;
  const direct = enemy(engine, 310), hidden = enemy(engine, barrier.x + barrier.w + 30), hiddenHealth = hidden.health;
  engine.bullets.push({ x: 220, y: 865, w: 8, h: 5, vx: 900, vy: 0, damage: 30, life: 2, hit: false,
    owner: actor, family: 'explosive', splash: 450, armorBypass: 0, remainingPenetration: 0, maxHits: 1 });
  engine.updateBullets(0.6); assert.ok(direct.health < direct.maxHealth); assert.equal(hidden.health, hiddenHealth);
  assert.equal(barrier.health, barrier.maxHealth);
});

test('real stream, laser, plasma, bolt and shotgun actions damage the armature through their native resource and impact paths', () => {
  for (const kind of ['stream', 'laser', 'plasma', 'bolt', 'scatter']) {
    const profile = WEAPON_ACTION_PROFILES_V131.find(item => item.kind === kind && !item.charge); assert.ok(profile, kind);
    const weapon = WEAPONS.find(item => item.id === profile.weaponId);
    const { engine, actor } = fixture({ names: ['Portable Quarantine'], weapon });
    const barrier = deploy(engine, 'Portable Quarantine', actor, 'barrier'), hidden = enemy(engine, barrier.x + barrier.w + 12), health = hidden.health, ammo = actor.ammo;
    shot(engine); assert.ok(barrier.health < barrier.maxHealth, kind); assert.equal(actor.ammo, ammo - 1, kind);
    if (kind !== 'scatter') assert.equal(hidden.health, health, kind);
    assert.equal(engine.equipmentActions.get(barrier.catalogId).uses, 1);
  }
});

test('a real rocket blast damages the exposed barrier after resolving intact occlusion and cannot cross a preceding opaque wall', () => {
  for (const blocked of [false, true]) {
    const profile = WEAPON_ACTION_PROFILES_V131.find(item => item.kind === 'rocket'); assert.ok(profile);
    const { engine, actor } = fixture({ names: ['Portable Quarantine'], weapon: WEAPONS.find(item => item.id === profile.weaponId) });
    actor.x = 460; const barrier = deploy(engine, 'Portable Quarantine', actor, 'barrier'); actor.x = 160;
    const hidden = enemy(engine, barrier.x + barrier.w + 10), health = hidden.health, ammo = actor.ammo;
    if (blocked) engine.walls.unshift({ x: barrier.x - 18, y: 650, w: 6, h: 280 });
    shot(engine); assert.equal(actor.ammo, ammo - 1); assert.equal(hidden.health, health);
    if (blocked) assert.equal(barrier.health, barrier.maxHealth); else assert.ok(barrier.health < barrier.maxHealth);
  }
});

test('native blade, cutting-torch and returning-disc contacts damage the same physical unit without creating enemy rewards', () => {
  for (const name of ['Combat Knife', 'Cutting Torch', 'Smart Disc']) {
    const weapon = WEAPONS.find(item => item.name === name); assert.ok(weapon, name);
    const { engine, actor } = fixture({ names: ['Portable Quarantine'], weapon });
    const barrier = deploy(engine, 'Portable Quarantine', actor, 'barrier'), inventory = { ...engine.inventory }, ammo = actor.ammo;
    actor.x = barrier.x - actor.w; shot(engine); assert.ok(barrier.health < barrier.maxHealth, name);
    assert.equal(actor.ammo, name === 'Cutting Torch' ? ammo - 1 : ammo); assert.deepEqual(engine.inventory, inventory);
    assert.equal(actor.kills, 0); assert.equal(engine.enemies.length, 0);
  }
});

test('paused or background-plane damage sources cannot modify a committed physical unit', () => {
  const { engine, actor } = fixture({ names: ['Portable Quarantine'] }), barrier = deploy(engine, 'Portable Quarantine', actor, 'barrier');
  assert.equal(engine.damagePlaceableV86(barrier.instanceId, 50, { planeV130: 'background' }), 0);
  assert.equal(engine.damagePlaceableV86(barrier.instanceId, 50, { owner: { rearEntryV130: { phase: 'approach' } } }), 0);
  engine.paused = true; assert.equal(engine.damagePlaceableV86(barrier.instanceId, 50, { owner: actor }), 0);
  assert.equal(barrier.health, barrier.maxHealth);
});

test('hostile shots apply once per projectile, respect a nearer Marine, and release the same barrier after destruction', () => {
  const { engine, actor } = fixture({ names: ['Portable Quarantine'] }), barrier = deploy(engine, 'Portable Quarantine', actor, 'barrier');
  const hp = actor.health, armor = actor.armor;
  for (let i = 0; i < 2; i++) engine.hostileProjectiles.push({ x: barrier.x + barrier.w + 100, y: 865, w: 7, h: 4, vx: -900, vy: 0, damage: 10, life: 2, hit: false });
  engine.updateHostileProjectiles(0.6); assert.equal(barrier.health, 40); assert.equal(actor.health, hp); assert.equal(actor.armor, armor);
  actor.x = barrier.x + barrier.w + 25;
  engine.hostileProjectiles.push({ x: actor.x + actor.w + 100, y: actor.y + 30, w: 7, h: 4, vx: -900, vy: 0, damage: 10, life: 2, hit: false });
  engine.updateHostileProjectiles(0.6); assert.equal(barrier.health, 40); assert.ok(actor.health < hp || actor.armor < armor);
});

test('push and lock are timed physical operations with swept actor/protected-access refusal, and folding remains possible', () => {
  const { engine } = fixture({ names: ['Portable Quarantine'] }), barrier = deploy(engine, 'Portable Quarantine', engine.player, 'barrier');
  const x = barrier.x, uses = engine.equipmentActions.get(barrier.catalogId).uses;
  assert.equal(engine.togglePlaceableLockV132(barrier.instanceId), true); finish(engine, 1.3); assert.equal(barrier.lockedV132, true);
  assert.equal(engine.pushPlaceableV132(barrier.instanceId, 1), false);
  assert.equal(engine.togglePlaceableLockV132(barrier.instanceId), true); finish(engine, 1.3);
  engine.walls.push({ x: barrier.x + barrier.w + 6, y: barrier.y, w: 2, h: barrier.h });
  assert.equal(engine.pushPlaceableV132(barrier.instanceId, 1), false); engine.walls = engine.walls.filter(item => item.placeableBarrierV132);
  assert.equal(engine.pushPlaceableV132(barrier.instanceId, 1), true); finish(engine, 1.3); assert.equal(barrier.x, x + 24);
  engine.doors.push({ x: barrier.x + barrier.w + 4, y: barrier.y - 30, w: 16, h: 114, progress: 1 });
  assert.equal(engine.pushPlaceableV132(barrier.instanceId, 1), false);
  assert.equal(engine.recoverPlaceableV86(barrier.instanceId), true); finish(engine);
  assert.equal(barrier.status, 'carried'); assert.equal(engine.walls.some(item => item.placeableBarrierV132), false);
  assert.equal(engine.equipmentActions.get(barrier.catalogId).uses, uses);
});

test('real melee and a telegraphed alien strike damage the barrier; rear-plane enemies cannot trigger traps', () => {
  const { engine, actor } = fixture({ names: ['Portable Quarantine', 'Electroshock Trap'] }), barrier = deploy(engine, 'Portable Quarantine', actor, 'barrier');
  assert.equal(engine.melee(actor), true); assert.equal(barrier.health, 26);
  actor.x = 160; const attacker = enemy(engine, barrier.x + barrier.w + 8); attacker.damage = 7; attacker.attackClock = 0; attacker.alert = true;
  engine.updateEnemy(attacker, 0.36); assert.equal(barrier.health, 19);
  const other = fixture({ names: ['Electroshock Trap'] }), trap = deploy(other.engine, 'Electroshock Trap');
  const rear = enemy(other.engine, trap.x); rear.rearEntryV130 = { phase: 'approach', entranceId: 'missing', progress: 0.5, elapsed: 0, delay: 0 }; rear.dormant = false;
  finish(other.engine, 0.1); other.engine.updateEnemy(rear, 0.1); assert.equal(trap.armed, true);
});

test('a fast actual production enemy crossing between frames triggers one mine, while a preceding thin wall protects it', () => {
  for (const blocked of [false, true]) {
    const { engine, actor, emitted } = fixture({ names: ['Electroshock Trap'] }); actor.x = 360;
    const trap = deploy(engine, 'Electroshock Trap'); actor.x = 160;
    const target = enemy(engine, 600), health = target.health;
    target.speed = 25000; target.facing = -1; target.alert = true;
    target.tacticsV130 = { mode: 'pursuit', clock: 0, sight: 1, lost: 0,
      lastKnown: { x: actor.x, y: actor.y, w: actor.w, h: actor.h, floorY: actor.y + actor.h },
      targetId: actor.id || 'player', lastNoiseId: 0, homeX: target.x, homeY: target.y, direction: -1 };
    if (blocked) engine.walls.push({ x: 520, y: 650, w: 2, h: 280 });
    engine.updateEnemy(target, 1 / 60);
    if (blocked) { assert.equal(trap.armed, true); assert.equal(target.health, health); }
    else {
      assert.ok(target.x + target.w < trap.x, 'The real native movement ends outside the mine footprint.');
      assert.equal(trap.armed, false); assert.equal(trap.status, 'spent'); assert.ok(target.health < health);
      finish(engine, 0.1); engine.updateEnemy(target, 0.1);
      assert.equal(emitted.filter(event => event.type === 'placeable-spent' && event.instanceId === trap.instanceId).length, 1);
      actor.x = trap.x - actor.w - 18;
      assert.equal(engine.recoverPlaceableV86(trap.instanceId), true); finish(engine);
      assert.equal(trap.armed, false);
    }
  }
});

test('a human lands on the actual barrier top and the appearance support helper confirms its soles', () => {
  const { engine, actor } = fixture({ names: ['Portable Quarantine'] }), barrier = deploy(engine, 'Portable Quarantine', actor, 'barrier');
  actor.x = barrier.x + 20; actor.y = barrier.y - actor.h + 12; actor.vy = 160; actor.grounded = false;
  engine.resolveVertical(actor, barrier.y - 8);
  assert.equal(actor.y + actor.h, barrier.y); assert.equal(actor.grounded, true);
  const support = playerAppearanceGroundSupportV129(actor, [...engine.platforms, ...engine.walls]);
  assert.deepEqual(support, [{ left: barrier.x, right: barrier.x + barrier.w, y: barrier.y }]);
  engine.damagePlaceableV86(barrier.instanceId, barrier.health);
  assert.deepEqual(playerAppearanceGroundSupportV129(actor, [...engine.platforms, ...engine.walls]), []);
});

test('finite ammunition transfers reserve the same cache across coop, cancel on impact and never refill on recovery', () => {
  const { engine, actor } = fixture({ names: ['Ammo Satchel'] }); engine.setCoop(true);
  const cache = deploy(engine, 'Ammo Satchel'), initial = cache.resourceRemainingV132;
  actor.ammoReserve = 99994; engine.coop.x = actor.x - 40;
  assert.equal(engine.useDeployedPlaceableV132(cache.instanceId), true); assert.equal(engine.useDeployedPlaceableV132(cache.instanceId, engine.coop), false);
  engine.updateEquipmentDeployments(0.4); engine.damagePlayer(actor, 3); finish(engine, 2);
  assert.equal(cache.resourceRemainingV132, initial); assert.equal(actor.ammoReserve, 99994);
  assert.equal(engine.useDeployedPlaceableV132(cache.instanceId), true); finish(engine, 1.4);
  assert.equal(actor.ammoReserve, 99999); assert.equal(cache.resourceRemainingV132, initial - 5);
  assert.equal(engine.recoverPlaceableV86(cache.instanceId), true); finish(engine);
  assert.equal(cache.resourceRemainingV132, initial - 5); assert.equal(engine.useEquipment(cache.catalogId), true); engine.confirmPlaceableV86(); finish(engine, 1.4);
  actor.ammoReserve = 0; engine.useDeployedPlaceableV132(cache.instanceId); finish(engine, 1.4);
  assert.equal(cache.resourceRemainingV132, 0); assert.equal(cache.status, 'spent'); assert.equal(actor.ammoReserve, initial - 5);
  assert.equal(engine.useDeployedPlaceableV132(cache.instanceId), false); assert.equal(engine.equipmentActions.get(cache.catalogId).uses, 1);
});

test('portable energy is bounded and conserved, and the deployed jammer affects only local visible synthetics', () => {
  const { engine, actor } = fixture({ names: ['Portable Battery'] }), battery = deploy(engine, 'Portable Battery');
  const initial = battery.resourceRemainingV132; engine.tracker.energy = 94;
  engine.useDeployedPlaceableV132(battery.instanceId); finish(engine, 1.4);
  assert.equal(engine.tracker.energy, 100); assert.equal(battery.resourceRemainingV132, initial - 6);
  assert.equal(engine.useDeployedPlaceableV132(battery.instanceId), false);
  const jam = fixture({ names: ['Signal Jammer'] }), jammer = deploy(jam.engine, 'Signal Jammer');
  const visible = enemy(jam.engine, jammer.x + 100, 'Working Joe'), alien = enemy(jam.engine, jammer.x + 180), hidden = enemy(jam.engine, jammer.x + 300, 'Combat Synthetic');
  jam.engine.walls.push({ x: jammer.x + 260, y: 650, w: 10, h: 280 });
  jam.engine.updateEquipmentDeployments(0.1); assert.ok(visible.jammedClock > 0); assert.ok(!(alien.jammedClock > 0)); assert.ok(!(hidden.jammedClock > 0));
  const duration = jammer.duration; jam.engine.paused = true; finish(jam.engine, 10); assert.equal(jammer.duration, duration); jam.engine.paused = false;
  finish(jam.engine, duration + 0.1); assert.equal(jammer.status, 'spent'); assert.equal(jammer.duration, 0);
  assert.equal(jam.engine.recoverPlaceableV86(jammer.instanceId), true); finish(jam.engine); assert.equal(jammer.duration, 0);
});

test('relay checkpoint events capture a committed spent unit and cannot duplicate an activation after resume', () => {
  const { engine } = fixture({ names: ['Colony Beacon'] }), beacon = deploy(engine, 'Colony Beacon');
  let atEvent; const previous = engine.onEvent; engine.onEvent = event => { if (event.type === 'checkpoint') atEvent = engine.captureResumeState(); previous(event); };
  assert.equal(engine.useDeployedPlaceableV132(beacon.instanceId), true); finish(engine, 1.4);
  assert.ok(atEvent); const captured = atEvent.placeablesV86.instances.find(item => item.instanceId === beacon.instanceId);
  assert.equal(captured.resourceRemainingV132, 0); assert.equal(captured.status, 'spent');
  assert.equal(validatePlaceablesExtensionStateV132(atEvent.placeablesExtensionV132, atEvent.placeablesV86.instances), true);
  assert.equal(engine.applyResumeState(atEvent).applied, true); assert.equal(engine.useDeployedPlaceableV132(beacon.instanceId), false);
});

test('resume cancels pending transfers/folds atomically, conserves spent resources and reconstructs one supported barrier', () => {
  const { engine, options } = fixture({ names: ['Portable Quarantine', 'Portable Battery'], nativeGeometry: true }), barrier = deploy(engine, 'Portable Quarantine', engine.player, 'barrier');
  barrier.health = 41; barrier.lockedV132 = true; engine.syncPlaceableBarriersV132();
  const saved = engine.captureResumeState(); assert.ok(saved.placeablesExtensionV132);
  assert.equal(engine.recoverPlaceableV86(barrier.instanceId), true); engine.updateEquipmentDeployments(0.7);
  assert.equal(engine.applyResumeState(saved).applied, true);
  const restored = engine.placeableInstanceV86(barrier.instanceId);
  assert.equal(restored.health, 41); assert.equal(restored.status, 'deployed'); assert.equal(restored.lockedV132, true);
  assert.equal(engine.walls.filter(item => item.placeableBarrierV132).length, 1); assert.equal(engine.isPlaceableBusyV86(engine.player), false);
  const restarted = fixture({ names: ['Portable Quarantine', 'Portable Battery'], nativeGeometry: true, resumeState: saved }).engine;
  assert.equal(restarted.placeableInstanceV86(barrier.instanceId).health, 41);
  restarted.syncPlaceableBarriersV132(); assert.equal(restarted.walls.filter(item => item.placeableBarrierV132).length, 1);
  engine.player.x = 450; const battery = deploy(engine, 'Portable Battery'); engine.tracker.energy = 97;
  engine.useDeployedPlaceableV132(battery.instanceId); finish(engine, 1.4); const resource = battery.resourceRemainingV132;
  const partial = engine.captureResumeState(); engine.tracker.energy = 0; engine.useDeployedPlaceableV132(battery.instanceId); engine.updateEquipmentDeployments(0.3);
  assert.equal(engine.applyResumeState(partial).applied, true); assert.equal(engine.placeableInstanceV86(battery.instanceId).resourceRemainingV132, resource);
  assert.equal(engine.tracker.energy, 100); assert.equal(engine.placeableExtensionTasksV132.size, 0);
  assert.equal(options.equipment.length, 2);
});

test('malformed, duplicated, inflated and geometrically unsafe save records never mint inventory or obstruct protected mission access', () => {
  const { engine } = fixture({ names: ['Portable Battery', 'Portable Quarantine'] }), battery = deploy(engine, 'Portable Battery');
  const raw = capturePlaceablesStateV86(engine.placeablesV86), initial = battery.maxResourceV132;
  raw.instances.find(item => item.instanceId === battery.instanceId).resourceRemainingV132 = 999999;
  raw.instances.find(item => item.instanceId === battery.instanceId).maxResourceV132 = 999999;
  const bounded = restorePlaceablesStateV86(raw, engine.equipmentActions, { extensionV132: true, bounds: engine.missionLevelBounds });
  assert.equal(bounded.instances.find(item => item.instanceId === battery.instanceId).resourceRemainingV132, initial);
  raw.instances.push({ ...raw.instances[0] });
  assert.equal(restorePlaceablesStateV86(raw, engine.equipmentActions, { extensionV132: true }).instances[0].resourceRemainingV132, 0);
  engine.player.x = 450; const barrier = deploy(engine, 'Portable Quarantine', engine.player, 'barrier'), save = engine.captureResumeState();
  const bad = structuredClone(save); bad.placeablesV86.instances.find(item => item.instanceId === barrier.instanceId).y = 600;
  engine.applyResumeState(bad); assert.equal(engine.placeableInstanceV86(barrier.instanceId).status, 'destroyed'); assert.equal(engine.walls.some(item => item.placeableBarrierV132), false);
  assert.equal(validatePlaceablesExtensionStateV132({ ...save.placeablesExtensionV132, instanceIds: [...save.placeablesExtensionV132.instanceIds, battery.instanceId] }, save.placeablesV86.instances), false);
});

test('a foreign rejected resume is never allowed to initialize or deplete the freshly issued bag', () => {
  const { engine, options } = fixture({ names: ['Portable Battery', 'Ammo Satchel'], nativeGeometry: true, hordeDirectorV132: false });
  const initial = capturePlaceablesStateV86(engine.placeablesV86), raw = engine.captureResumeState();
  raw.identity.campaignId = 'foreign'; raw.placeablesExtensionV132.instanceIds.push('invalid');
  engine.start({ ...options, resumeState: raw }); assert.equal(engine.lastResumeResult.applied, false);
  assert.deepEqual(capturePlaceablesStateV86(engine.placeablesV86), initial);
});

test('checkpoint restart cancels unfinished manipulations while preserving the physical unit and its depletion', () => {
  const { engine, actor } = fixture({ names: ['Portable Quarantine'], nativeGeometry: true }), barrier = deploy(engine, 'Portable Quarantine', actor, 'barrier');
  barrier.health = 39; assert.equal(engine.togglePlaceableLockV132(barrier.instanceId), true); engine.updateEquipmentDeployments(0.4);
  const state = capturePlaceablesStateV86(engine.placeablesV86), uses = engine.equipmentActions.get(barrier.catalogId).uses;
  engine.failMission('qa-interruption'); assert.equal(engine.restartFromCheckpoint(), true);
  assert.deepEqual(capturePlaceablesStateV86(engine.placeablesV86), state); assert.equal(engine.placeableExtensionTasksV132.size, 0);
  assert.equal(engine.equipmentActions.get(barrier.catalogId).uses, uses); assert.equal(engine.walls.filter(item => item.placeableBarrierV132).length, 1);
});

test('the actual dock exposes all finite resources and barrier controls, then disables operations under pause', () => {
  const { engine } = fixture(), barrier = deploy(engine, 'Portable Quarantine', engine.player, 'barrier');
  let model = buildPlaceableDockModelV86(engine), markup = renderPlaceableDockMarkupV86(model);
  assert.match(markup, /data-placeable-extension="push-right"/); assert.match(markup, /data-placeable-extension="lock"/);
  assert.match(markup, /Barrage mobile/); assert.match(markup, /Replier sans ravitailler/);
  assert.equal(model.nearby.find(item => item.instanceId === barrier.instanceId).modeV132, 'barrier');
  engine.paused = true; model = buildPlaceableDockModelV86(engine); assert.equal(model.canAct, false); assert.ok(model.items.every(item => item.disabled));
  assert.match(renderPlaceableDockMarkupV86(model), /data-placeable-extension="push-right"[^>]*disabled/);
  assert.equal(engine.pushPlaceableV132(barrier.instanceId, 1), false);
});
