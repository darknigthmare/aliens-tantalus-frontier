import assert from 'node:assert/strict';
import { EQUIPMENT } from '../src/content-core-v50.js';
import { buildEquipmentActionRuntime, GameEngine as FinalEngine } from '../src/game-final-runtime.js';
import { withPlayerFieldActionsV124, FIELD_ACTIONS_V124 } from '../src/player-field-actions-v124.js';
import { withPlaceablesRuntimeV86 } from '../src/placeables-runtime-v86.js';
import { createPlaceablesStateV86, validatePlaceablePlacementV86, capturePlaceablesStateV86, restorePlaceablesStateV86 } from '../src/placeables-state-v86.js';
import { buildPlaceableDockModelV86, renderPlaceableDockMarkupV86 } from '../src/placeables-ui-v86.js';

const IDS = Object.fromEntries(EQUIPMENT.slice(0, 30).map(item => [item.name, item.id]));
const actor = (coop = false) => ({ x: coop ? 25 : 100, y: 108, w: 42, h: 92, vx: 0, vy: 0, grounded: true, facing: 1,
  alive: true, downed: false, coop, operatorId: coop ? 'bravo' : 'alpha', health: 30, maxHealth: 100, armor: 50, maxArmor: 100,
  ammoReserve: 20, supportClock: 0, interactionClock: 0, toolUseClock: 0, actionClock: 0, reloading: false });

// Only rendering/physics are replaced. Actions, targets, inventories, support
// lifecycle and placement validation below execute the shipped runtime code.
class HarnessBase {
  start({ names = ['Medkit', 'Access Tuner', 'Cutting Torch', 'Flashlight', 'Maintenance Jack', 'Portable Battery', 'Synthetic Repair Kit', 'Catch Pole', 'Portable Sentry'] } = {}) {
    this.events = []; this.onEvent = event => this.events.push(event); this.running = true; this.paused = false;
    this.player = actor(); this.coop = actor(true); this.coopEnabled = false; this.keys = new Set();
    this.mission = { state: 'active', elapsed: 0, objectives: { power: false, route: false } };
    this.missionLevelRuntime = { id: 'fixture-level' }; this.missionLevelBounds = { width: 2000, height: 600 };
    this.platforms = [{ id: 'floor', x: 0, y: 200, w: 2000, h: 50, floor: true }];
    this.walls = []; this.covers = []; this.doors = []; this.vents = []; this.ladders = []; this.lifts = []; this.hazards = [];
    this.enemies = []; this.bullets = []; this.hostileProjectiles = []; this.supportDeployments = [];
    this.equipmentActions = new Map(names.map(name => {
      const runtime = buildEquipmentActionRuntime(EQUIPMENT.find(item => item.id === IDS[name]));
      return [runtime.id, { ...runtime, remaining: runtime.charges, uses: 0 }];
    }));
    this.inventory = { medkits: 1 + [...this.equipmentActions.values()].filter(item => item.action === 'medical').reduce((sum, item) => sum + item.charges, 0), cutter: false };
    this.fieldEffects = { scans: 0, repairs: 0, breaches: 0, illumination: 0, protection: 0, weaponBoostShots: 0, restraints: 0, jammerUntil: 0 };
    this.environmentStatus = { oxygen: 40, maxOxygen: 100 }; this.stealthRuntime = { lightBoost: 0 }; this.tracker = { energy: 50 }; this.animationTime = 0;
    return this.getSnapshot();
  }
  getSnapshot() { return {}; }
  updatePlayer(who, delta, controls = {}) {
    if (this.keys.has(controls.right)) who.x += 10;
    who.actionClock = Math.max(0, who.actionClock - delta); who.interactionClock = Math.max(0, who.interactionClock - delta);
  }
  activeSquadActors() { return []; }
  updateEquipmentDeployments() {}
  updateHostileProjectiles() {}
  updateEnemy() {}
  setInteractionAnimation(who, kind, duration) { who.interactionKind = kind; who.interactionClock = duration; who.actionClock = duration; }
  setToolAnimation(who, kind, duration) { who.toolId = kind; who.toolUseClock = duration; }
  useEquipment() { throw new Error('An unvalidated action reached the instant legacy handler.'); }
  damagePlayer(who, amount) { who.health = Math.max(0, who.health - amount); if (!who.health) who.alive = false; return amount; }
  damageSquadMember(who, amount) { return this.damagePlayer(who, amount); }
  applyEnemyDamage(who, amount) { who.health -= amount; }
  isVehicleAccessLockedV59() { return false; }
  setCheckpoint(id, x, y) { this.checkpoint = { id, x, y }; }
  setCoop(enabled) { this.coopEnabled = enabled; }
  stop() { this.running = false; }
  drawWorld() {}
  captureResumeState() { return { inventory: { ...this.inventory }, equipment: [...this.equipmentActions.values()].map(item => ({ id: item.id, remaining: item.remaining, uses: item.uses })) }; }
  applyResumeState(raw) { Object.assign(this.inventory, raw.inventory); for (const saved of raw.equipment || []) Object.assign(this.equipmentActions.get(saved.id), saved); return { applied: true }; }
  crewCanSupportV85(who, kind) { return who.crewV85.gear.some(item => item.function === kind && who.crewV85.charges[item.instanceId] > 0); }
  useCrewToolV85(who, kind) {
    const item = who.crewV85.gear.find(entry => entry.function === kind && who.crewV85.charges[entry.instanceId] > 0);
    if (!item) return false; who.crewV85.charges[item.instanceId] -= 1; who.health = Math.min(who.maxHealth, who.health + 40); return true;
  }
}
const Engine = withPlayerFieldActionsV124(withPlaceablesRuntimeV86(HarnessBase));
const fresh = options => { const engine = new Engine(); engine.start(options); return engine; };
const finish = (engine, who = engine.player) => { const task = engine.getFieldActionSnapshotV124(who); assert.ok(task); return engine.advanceFieldActionV124(who, task.duration + 0.01); };
const assertions = [];
function check(name, run) { run(); assertions.push(name); }

check('medical action reserves, pauses and commits one shared kit after 2.2 seconds', () => {
  const engine = fresh(), who = engine.player, stock = engine.inventory.medkits, state = engine.equipmentActions.get(IDS.Medkit), remaining = state.remaining;
  assert.equal(engine.useMedkit(who), true); assert.equal(who.health, 30); assert.equal(engine.inventory.medkits, stock);
  assert.equal(who.fieldActionV124.duration, 2.2); assert.equal(engine.useMedkit(who), false);
  engine.advanceFieldActionV124(who, 1); engine.paused = true; engine.advanceFieldActionV124(who, 30);
  assert.equal(who.fieldActionV124.elapsed, 1); assert.equal(who.health, 30);
  engine.paused = false; assert.equal(finish(engine), true); assert.equal(who.health, 78);
  assert.equal(engine.inventory.medkits, stock - 1); assert.equal(state.remaining, remaining - 1); assert.equal(state.uses, 1);
  assert.equal(engine.isFieldActionBusyV124(who), false); assert.equal(engine.advanceFieldActionV124(who, 9), false);
});

check('movement and impact cancel without spending and a fresh action gets a new serial', () => {
  const engine = fresh(), stock = engine.inventory.medkits;
  engine.useMedkit(); const firstSerial = engine.player.fieldActionV124.serial;
  engine.keys.add('KeyD'); engine.updatePlayer(engine.player, 0.1, { right: 'KeyD' });
  assert.equal(engine.isFieldActionBusyV124(), false); assert.equal(engine.inventory.medkits, stock);
  engine.keys.clear(); engine.useMedkit(); assert.ok(engine.player.fieldActionV124.serial > firstSerial);
  engine.damagePlayer(engine.player, 1); assert.equal(engine.isFieldActionBusyV124(), false); assert.equal(engine.inventory.medkits, stock);
});

check('one medical unit cannot be reserved by two operators or by both H and the equipment dock', () => {
  const engine = fresh(); engine.coopEnabled = true; engine.inventory.medkits = 1;
  assert.equal(engine.useEquipment(IDS.Medkit), true); assert.equal(engine.useMedkit(engine.coop), false);
  assert.equal(finish(engine), true); assert.equal(engine.inventory.medkits, 0); assert.equal(engine.useMedkit(engine.coop), false);
  assert.equal(engine.useEquipment(IDS.Medkit, engine.coop), false);
});

check('incapacity, air, climbing, loading and vehicle access refuse tools', () => {
  for (const patch of [{ grounded: false }, { alive: false }, { downed: true }, { climbing: true }, { ventTransit: {} }, { inVehicle: true }, { grappledClock: 1 }, { stunClock: 1 }, { hazardKind: 'electrical', hazardClock: 1 }]) {
    const engine = fresh(); Object.assign(engine.player, patch); const stock = engine.inventory.medkits;
    assert.equal(engine.useMedkit(), false); assert.equal(engine.inventory.medkits, stock);
  }
  for (const key of ['enemyAtlasLoadingPausedV65', 'userCasteLoadingV88']) { const engine = fresh(); engine[key] = true; assert.equal(engine.useEquipment(IDS.Flashlight), false); }
});

check('the access tuner opens only a reachable eligible door and cannot bypass mission gates', () => {
  const engine = fresh(); const remote = { id: 'remote', x: 1200, y: 0, w: 30, h: 200, open: false, lockedBy: 'security' };
  const gate = { id: 'mission', x: 170, y: 0, w: 20, h: 200, open: false, lockedBy: 'boss', levelLocked: true };
  engine.doors = [remote, gate]; const state = engine.equipmentActions.get(IDS['Access Tuner']); const charges = state.remaining;
  assert.equal(engine.useEquipment(state.id), false); assert.equal(state.remaining, charges);
  const local = { ...gate, id: 'local', lockedBy: 'security', levelLocked: false }; engine.doors = [remote, local];
  assert.equal(engine.useEquipment(state.id), true); assert.equal(local.open, false); finish(engine);
  assert.equal(local.open, true); assert.equal(remote.open, false); assert.equal(engine.mission.objectives.route, true); assert.equal(state.remaining, charges - 1);
});

check('a changed or obstructed target cancels instead of switching targets or spending', () => {
  const engine = fresh(); const door = { id: 'door', x: 180, y: 0, w: 20, h: 200, open: false, lockedBy: 'security' };
  engine.doors = [door]; const state = engine.equipmentActions.get(IDS['Access Tuner']); const count = state.remaining;
  engine.useEquipment(state.id); engine.walls.push({ id: 'new-blocker', x: 148, y: 0, w: 12, h: 200 });
  engine.advanceFieldActionV124(engine.player, 3); assert.equal(door.open, false); assert.equal(state.remaining, count); assert.equal(engine.isFieldActionBusyV124(), false);
  engine.walls = []; engine.useEquipment(state.id); engine.doors = [{ ...door, id: 'replacement' }];
  engine.advanceFieldActionV124(engine.player, 3); assert.equal(engine.doors[0].open, false); assert.equal(state.remaining, count);
});

check('the cutting tool never destroys an arbitrary wall or a distant wall', () => {
  const engine = fresh(); const far = { id: 'far', x: 800, y: 0, w: 30, h: 200, art: 'breakable' };
  engine.walls = [far, { id: 'structural', x: 180, y: 0, w: 20, h: 200 }];
  assert.equal(engine.useEquipment(IDS['Cutting Torch']), false);
  const near = { id: 'cuttable', x: 180, y: 0, w: 20, h: 200, art: 'breakable' }; engine.walls = [far, near];
  assert.equal(engine.useEquipment(IDS['Cutting Torch']), true); finish(engine); assert.equal(near.destroyed, true); assert.equal(far.destroyed, undefined);
});

check('repair and energy transfer require a useful local target', () => {
  const engine = fresh(); engine.player.armor = 100; engine.tracker.energy = 100;
  engine.vehicle = { id: 'far-apc', active: true, x: 900, y: 100, w: 160, h: 100, hull: 30, maxHull: 100, fuel: 20 };
  engine.powerNode = { id: 'far-power', x: 1200, y: 140, w: 30, h: 60, active: false };
  assert.equal(engine.useEquipment(IDS['Maintenance Jack']), false); assert.equal(engine.useEquipment(IDS['Portable Battery']), false);
  assert.equal(engine.vehicle.hull, 30); assert.equal(engine.powerNode.active, false);
  engine.player.armor = 20; assert.equal(engine.useEquipment(IDS['Maintenance Jack']), true); finish(engine);
  assert.ok(engine.player.armor > 20); assert.equal(engine.vehicle.hull, 30);
});

check('synthetic repair does not heal a human and restraint cannot hold a queen', () => {
  const engine = fresh(); engine.coopEnabled = true;
  assert.equal(engine.useEquipment(IDS['Synthetic Repair Kit']), false);
  engine.coop.biology = 'synthetic'; engine.coop.x = 45; assert.equal(engine.useEquipment(IDS['Synthetic Repair Kit']), true); finish(engine);
  assert.ok(engine.coop.health > 30); assert.equal(engine.player.health, 30);
  engine.enemies = [{ id: 'queen', x: 150, y: 0, w: 200, h: 200, alive: true, isBoss: true }];
  assert.equal(engine.useEquipment(IDS['Catch Pole']), false);
});

check('flashlight toggles repeatedly without losing its charge and its cone stops at a wall', () => {
  const engine = fresh(); const state = engine.equipmentActions.get(IDS.Flashlight), charges = state.remaining;
  for (let index = 0; index < 24; index += 1) assert.equal(engine.useEquipment(state.id), true);
  assert.equal(state.remaining, charges); assert.equal(engine.player.fieldLightV124, false);
  engine.useEquipment(state.id); assert.equal(engine.stealthRuntime.lightBoost, 0.38);
  engine.walls = [{ id: 'occluder', x: 180, y: 0, w: 20, h: 250 }]; const points = [];
  const ctx = { save() {}, restore() {}, createRadialGradient: () => ({ addColorStop() {} }), beginPath() {}, moveTo() {},
    lineTo(x, y) { points.push({ x, y }); }, closePath() {}, fill() {} };
  engine.drawFieldLightV124(ctx, engine.player); assert.equal(points.length, 17); assert.ok(points.every(point => point.x <= 180 + 1e-8));
  const saved = engine.captureResumeState(); engine.useEquipment(state.id); engine.applyResumeState(saved);
  assert.equal(engine.player.fieldLightV124, true);
});

check('personal crew tools spend the selected personal instance and leave shared stock intact', () => {
  const engine = fresh(); engine.coopEnabled = true;
  const first = { instanceId: 'personal-med-a', catalogId: IDS.Medkit, function: 'medical', charges: 1 };
  const second = { instanceId: 'personal-med-b', catalogId: IDS['Trauma Kit'], function: 'medical', charges: 1 };
  engine.coop.crewV85 = { personalEquipment: true, gear: [first, second], charges: { [first.instanceId]: 1, [second.instanceId]: 1 } };
  const stock = engine.inventory.medkits;
  assert.equal(engine.useEquipment(second.instanceId, engine.coop), true); finish(engine, engine.coop);
  assert.equal(engine.coop.crewV85.charges[first.instanceId], 1); assert.equal(engine.coop.crewV85.charges[second.instanceId], 0);
  assert.deepEqual(engine.coop.crewV85.gear, [first, second]); assert.equal(engine.inventory.medkits, stock);
  const model = buildPlaceableDockModelV86(engine, 'coop'); assert.deepEqual(model.items.map(item => item.id), [first.instanceId, second.instanceId]);
});

check('pending field actions are cancelled on restore or mission replacement without spending', () => {
  const engine = fresh(); const stock = engine.inventory.medkits;
  engine.useMedkit(); const saved = engine.captureResumeState(); engine.applyResumeState(saved);
  assert.equal(engine.isFieldActionBusyV124(), false); assert.equal(engine.inventory.medkits, stock);
  engine.useMedkit(); engine.missionLevelRuntime = { id: 'another-level' }; engine.advanceFieldActionV124(engine.player, 5);
  assert.equal(engine.isFieldActionBusyV124(), false); assert.equal(engine.inventory.medkits, stock);
});

check('incendiary supplies and hazard protection remain with the operator who used them', () => {
  const engine = fresh({ names: ['Incinerator Fuel Pack', 'M3 Personnel Armor'] }); engine.coopEnabled = true;
  engine.player.weaponMode = 'sidearm'; engine.coop.weaponMode = 'sidearm';
  const playerDamage = FinalEngine.prototype.weaponProfile.call(engine, engine.player).damage;
  const coopDamage = FinalEngine.prototype.weaponProfile.call(engine, engine.coop).damage;
  assert.equal(engine.useEquipment(IDS['Incinerator Fuel Pack'], engine.coop), true); finish(engine, engine.coop);
  assert.ok(engine.coop.fieldWeaponBoostShotsV124 > 0); assert.equal(engine.player.fieldWeaponBoostShotsV124, 0);
  assert.equal(FinalEngine.prototype.weaponProfile.call(engine, engine.player).damage, playerDamage);
  assert.equal(FinalEngine.prototype.weaponProfile.call(engine, engine.coop).damage, coopDamage * 1.28);
  assert.equal(engine.useEquipment(IDS['M3 Personnel Armor'], engine.coop), true); finish(engine, engine.coop);
  assert.ok(engine.coop.fieldProtectionV124 > 0); assert.equal(engine.player.fieldProtectionV124, 0); assert.equal(engine.fieldEffects.protection, 0);
  const saved = engine.captureResumeState(); const shots = engine.coop.fieldWeaponBoostShotsV124, protection = engine.coop.fieldProtectionV124;
  engine.coop.fieldWeaponBoostShotsV124 = 0; engine.coop.fieldProtectionV124 = 0; engine.applyResumeState(saved);
  assert.equal(engine.coop.fieldWeaponBoostShotsV124, shots); assert.equal(engine.coop.fieldProtectionV124, protection);
});

check('protective layers deplete on effective hazard contacts without reducing them forever', () => {
  const engine = fresh(); engine.missionPlan = { world: { danger: 1 } }; engine.costumeRuntime = { resistances: [] };
  engine.vehicleHandling = { environmentalImmunity: [] }; engine.player.health = 100; engine.player.fieldProtectionV124 = 2;
  engine.hazards = [{ id: 'heat', x: 0, y: 170, w: 600, h: 30, active: true, kind: 'heat', damage: 10, armorDrain: 0, oxygenDrain: 0, trackerDrain: 0 }];
  engine.environmentStatus.protectedHits = 0;
  for (let index = 0; index < 3; index += 1) { engine.player.hazardClock = 0; FinalEngine.prototype.applyHazards.call(engine, engine.player); }
  assert.equal(engine.player.health, 80); assert.equal(engine.player.fieldProtectionV124, 0); assert.equal(engine.environmentStatus.protectedHits, 2);
  // A foreign operator's stored supply never becomes shared mitigation.
  engine.coop.fieldProtectionV124 = 20; engine.player.hazardClock = 0; FinalEngine.prototype.applyHazards.call(engine, engine.player);
  assert.equal(engine.player.health, 70); assert.equal(engine.coop.fieldProtectionV124, 20);
});

check('legacy support migrates once to J1, while malformed new support is bounded', () => {
  const engine = fresh(), saved = engine.captureResumeState(); delete saved.playerFieldActionsV124;
  saved.gameplaySupportV72 = { schema: 1, fieldEffects: { protection: 4, weaponBoostShots: 3 } };
  engine.applyResumeState(saved); assert.equal(engine.player.fieldProtectionV124, 4); assert.equal(engine.player.fieldWeaponBoostShotsV124, 3);
  assert.equal(engine.coop.fieldProtectionV124, 0); assert.equal(engine.coop.fieldWeaponBoostShotsV124, 0);
  const modern = engine.captureResumeState(); modern.playerFieldActionsV124.support.player = { protection: -9, weaponBoostShots: Infinity };
  engine.applyResumeState(modern); assert.equal(engine.player.fieldProtectionV124, 0); assert.equal(engine.player.fieldWeaponBoostShotsV124, 0);
});

check('placement cannot reach through a thin obstacle between hands and valid ground', () => {
  const engine = fresh(); const state = createPlaceablesStateV86(engine.equipmentActions), instance = state.instances[0];
  const world = { platforms: engine.platforms, bounds: engine.missionLevelBounds };
  const input = { instance, actor: engine.player, x: 160, y: 200 - instance.h, facing: 1, world };
  assert.equal(validatePlaceablePlacementV86(input).ok, true);
  world.walls = [{ x: 148, y: 0, w: 6, h: 200 }]; assert.equal(validatePlaceablePlacementV86(input).code, 'reach-blocked');
  world.walls = []; engine.player.ventTransit = {}; assert.equal(validatePlaceablePlacementV86(input).code, 'actor-busy');
});

check('deployment movement cancellation keeps the same object and presents actual timed progress', () => {
  const engine = fresh(); const catalog = IDS['Portable Sentry'];
  assert.equal(engine.useEquipment(catalog), true); assert.equal(engine.confirmPlaceableV86(), true);
  const task = engine.player.placeableActionV124; assert.equal(task.kind, 'deploy'); assert.equal(task.duration, 2.5);
  engine.updateEquipmentDeployments(1); assert.equal(engine.player.placeableActionV124.progress, 0.4);
  engine.keys.add('KeyD'); engine.updatePlayer(engine.player, 0.1, { right: 'KeyD' }); engine.keys.clear();
  assert.equal(engine.placeableTasksV86.size, 0); assert.equal(engine.player.placeableActionV124, null);
  assert.equal(engine.placeablesV86.instances[0].status, 'carried'); assert.equal(engine.equipmentActions.get(catalog).uses, 0);
  engine.useEquipment(catalog); engine.confirmPlaceableV86(); assert.ok(engine.player.placeableActionV124.serial > task.serial);
  engine.updateEquipmentDeployments(2.5); assert.equal(engine.placeablesV86.instances[0].status, 'deployed'); assert.equal(engine.equipmentActions.get(catalog).uses, 1);
});

check('folding safes the sentry and retains damage, ammunition and charge history across redeployment and restore', () => {
  const engine = fresh(); const catalog = IDS['Portable Sentry']; engine.useEquipment(catalog); engine.confirmPlaceableV86(); engine.updateEquipmentDeployments(2.5);
  const instance = engine.placeablesV86.instances[0]; instance.ammo = 37; instance.health = 61;
  engine.enemies = [{ id: 'target', x: 400, y: 108, w: 42, h: 92, alive: true, health: 100 }];
  assert.equal(engine.recoverPlaceableV86(instance.instanceId), true); engine.updateEquipmentDeployments(0.5);
  assert.equal(instance.ammo, 37); assert.equal(engine.bullets.length, 0);
  engine.updateEquipmentDeployments(1.5); assert.equal(instance.status, 'carried'); assert.equal(instance.health, 61); assert.equal(instance.ammo, 37);
  engine.enemies = []; engine.useEquipment(catalog); engine.confirmPlaceableV86(); engine.updateEquipmentDeployments(2.5);
  assert.equal(engine.equipmentActions.get(catalog).uses, 1); assert.equal(instance.ammo, 37);
  const saved = capturePlaceablesStateV86(engine.placeablesV86); const restored = restorePlaceablesStateV86(saved, engine.equipmentActions, { bounds: engine.missionLevelBounds });
  assert.equal(restored.instances[0].ammo, 37); assert.equal(restored.instances[0].health, 61); assert.equal(restored.instances[0].status, 'deployed');
});

check('airborne recovery is refused and death clears the deployment action presentation', () => {
  const engine = fresh(); const catalog = IDS['Portable Sentry']; engine.useEquipment(catalog); engine.confirmPlaceableV86(); engine.updateEquipmentDeployments(2.5);
  engine.player.grounded = false; assert.equal(engine.recoverPlaceableV86(engine.placeablesV86.instances[0].instanceId), false);
  engine.player.grounded = true; engine.useEquipment(catalog); engine.player.x += 100; engine.refreshPlaceablePreviewV86(engine.player); engine.confirmPlaceableV86();
  engine.player.alive = false; engine.updateEquipmentDeployments(0.1); assert.equal(engine.placeableTasksV86.size, 0); assert.equal(engine.player.placeableActionV124, null);
});

check('dock gives an accessible cancel action, useful refusal reasons and reusable light labels', () => {
  const engine = fresh(); engine.useMedkit(); let model = buildPlaceableDockModelV86(engine);
  assert.ok(model.items.every(item => item.disabled)); assert.match(renderPlaceableDockMarkupV86(model), /cancel-field/);
  engine.cancelFieldActionV124(); model = buildPlaceableDockModelV86(engine); let markup = renderPlaceableDockMarkupV86(model);
  assert.match(markup, /ALLUMER/); assert.match(markup, /Aucune cible compatible/);
  engine.useEquipment(IDS.Flashlight); markup = renderPlaceableDockMarkupV86(buildPlaceableDockModelV86(engine)); assert.match(markup, /ÉTEINDRE/);
});

console.log(JSON.stringify({ ok: true, checks: assertions.length, actionFamilies: Object.keys(FIELD_ACTIONS_V124).length, checksPassed: assertions }, null, 2));
