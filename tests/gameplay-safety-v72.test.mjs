import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { GameEngine as BaseMissionEngine } from '../src/game-v51-runtime.js';
import { buildSpriteHitboxRuntime } from '../src/game-v52-runtime.js';
import { SPRITE_HITBOXES, resolveSpriteSheet } from '../src/sprite-animation-runtime.js';
import { updateEnemySupportStatusesV72, restoreGameplaySupportV72 } from '../src/gameplay-support-v72.js';
import { beginOperation, createDefaultSave, migrateSave, resolveOperation, sanitizeOperationResumeState } from '../src/save.js';
import { CAMPAIGNS, CREW, ENEMIES, EQUIPMENT, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';

function withRuntime(run) {
  const saved = Object.fromEntries(['Image', 'addEventListener', 'requestAnimationFrame', 'document'].map((key) => [key, globalThis[key]]));
  const listeners = new Map();
  const frames = [];
  const listen = (type, listener) => listeners.set(type, [...(listeners.get(type) || []), listener]);
  globalThis.Image = class { constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; } set src(value) { this.currentSrc = value; } };
  globalThis.addEventListener = listen;
  globalThis.document = { hidden: false, addEventListener: listen };
  globalThis.requestAnimationFrame = (callback) => { frames.push(callback); return frames.length; };
  const world = WORLDS.find((entry) => entry.biomes.includes('industrial')) || WORLDS[0];
  const options = {
    seed: 720072, world,
    campaign: { ...CAMPAIGNS[0], id: 'safety-v72', mode: 'FRONTIER', worldId: world.id, objective: 'restore atmospheric processing' },
    levelSeed: { ...LEVEL_SEEDS[0], id: 'safety-level-v72', seed: 720072, worldId: world.id, objective: 'restore atmospheric processing' },
    enemyCatalog: ENEMIES.slice(0, 52), weapon: WEAPONS.find((entry) => entry.magazine >= 30), equipment: EQUIPMENT.slice(0, 8), crew: CREW,
    vehicle: VEHICLES.find((entry) => entry.family === 'ground'), difficulty: 'standard'
  };
  const engine = new GameEngine({ width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} });
  const dispatch = (type, overrides = {}) => {
    const event = { code: '', repeat: false, preventDefault() { this.prevented = true; }, ...overrides };
    for (const listener of listeners.get(type) || []) listener(event);
    return event;
  };
  try { engine.start(options); return run({ engine, options, frames, dispatch }); }
  finally { for (const [key, value] of Object.entries(saved)) value === undefined ? delete globalThis[key] : globalThis[key] = value; }
}

test('V72 pause and asset-loading suspension reject every player resource action', () => withRuntime(({ engine }) => {
  Object.assign(engine.player, { health: 20, ammo: 0 });
  const actions = [
    () => engine.useMedkit(engine.player), () => engine.reload(engine.player),
    () => engine.activateTracker(engine.player), () => engine.useEquipment(EQUIPMENT[0].id, engine.player),
    () => engine.interact(engine.player), () => engine.toggleVehicle(engine.player),
    () => engine.fire(engine.player), () => engine.activateNeuroCountermeasure(engine.player)
  ];
  for (const flag of ['paused', 'enemyAtlasLoadingPausedV65']) {
    engine[flag] = true;
    const before = JSON.stringify(engine.captureResumeState());
    for (const action of actions) assert.equal(action(), false, flag);
    assert.equal(JSON.stringify(engine.captureResumeState()), before, flag);
    engine[flag] = false;
  }
  assert.equal(engine.useMedkit(engine.player), true, 'normal gameplay remains functional');
}));

test('V72 stopped, dead and disabled co-op actors cannot consume shared medkits', () => withRuntime(({ engine }) => {
  for (const actor of [engine.player, engine.coop]) actor.health = 20;
  const before = engine.inventory.medkits;
  assert.equal(engine.useMedkit(engine.coop), false);
  engine.player.alive = false;
  assert.equal(engine.interact(engine.player), false);
  engine.player.alive = true;
  engine.stop();
  assert.equal(engine.useMedkit(engine.player), false);
  assert.equal(engine.inventory.medkits, before);
}));

test('V72 focused form controls do not route text typing or browser shortcuts to gameplay', () => withRuntime(({ engine, dispatch }) => {
  engine.player.health = 20;
  const before = engine.inventory.medkits;
  const target = { closest: () => ({ tagName: 'INPUT' }) };
  const event = dispatch('keydown', { code: 'Space', target });
  dispatch('keydown', { code: 'KeyH', target });
  dispatch('keydown', { code: 'KeyP', target });
  dispatch('keydown', { code: 'KeyR', ctrlKey: true });
  assert.equal(event.prevented, undefined);
  assert.equal(engine.keys.size, 0);
  assert.equal(engine.player.jumpBuffer, 0);
  assert.equal(engine.inventory.medkits, before);
  assert.equal(engine.paused, false);
  const modalText = { closest: (selector) => selector.includes('[role="dialog"]') ? {} : null };
  dispatch('keydown', { code: 'KeyP', target: modalText });
  assert.equal(engine.paused, false, 'P typed inside a modal never toggles gameplay behind it');
}));

test('V72 blur and hidden-tab events pause safely and discard held or buffered input', () => withRuntime(({ engine, dispatch }) => {
  dispatch('keydown', { code: 'KeyD' });
  dispatch('keydown', { code: 'Space' });
  dispatch('blur');
  assert.equal(engine.paused, true);
  assert.equal(engine.keys.size, 0);
  assert.equal(engine.player.jumpBuffer, 0);
  dispatch('keydown', { code: 'KeyD' });
  assert.equal(engine.keys.size, 0, 'pause does not store movement for later');
  dispatch('keydown', { code: 'Escape' });
  assert.equal(engine.paused, false);
  globalThis.document.hidden = true;
  dispatch('visibilitychange');
  assert.equal(engine.paused, true);
  globalThis.document.hidden = false;
  dispatch('visibilitychange');
  assert.equal(engine.paused, true, 'returning to tab never silently resumes combat');
}));

test('V72 rapid stop/start cannot leave multiple requestAnimationFrame simulation loops', () => withRuntime(({ engine, options, frames }) => {
  let updates = 0;
  engine.update = () => { updates += 1; };
  engine.draw = () => {};
  engine.refreshEnemyAtlasAvailabilityV65 = () => {};
  engine.stop();
  engine.start(options);
  const pending = frames.splice(0);
  for (const callback of pending) callback(performance.now() + 16);
  assert.equal(updates, 1);
  assert.equal(frames.length, 1, 'only the current generation may schedule another frame');
  engine.keys.add('KeyD');
  engine.player.jumpBuffer = 0.14;
  engine.stop();
  assert.equal(engine.keys.size, 0);
  assert.equal(engine.player.jumpBuffer, 0);
}));

test('V72 rifle resume preserves the real magazine instead of truncating it to a sidearm', () => withRuntime(({ engine, options }) => {
  Object.assign(engine.player, { weaponMode: 'rifle', magazineSize: engine.weaponRuntime.magazine, ammo: engine.weaponRuntime.magazine - 1 });
  engine.weaponPickup.taken = true;
  const state = JSON.parse(JSON.stringify(engine.captureResumeState()));
  assert.ok(state.player.ammo > 12, 'fixture has more rounds than the initial sidearm');
  engine.stop();
  engine.start({ ...options, resumeState: state });
  assert.equal(engine.player.weaponMode, 'rifle');
  assert.equal(engine.player.magazineSize, engine.weaponRuntime.magazine);
  assert.equal(engine.player.ammo, state.player.ammo);
  engine.player.ammo = 0;
  engine.player.ammoReserve = engine.player.magazineSize;
  assert.equal(engine.reload(engine.player), true);
  engine.finishReload(engine.player);
  assert.equal(engine.player.ammo, engine.weaponRuntime.magazine);
}));

test('V72 temporary slow effects expire and do not compound with 30/60/120 FPS updates', () => {
  for (const fps of [30, 60, 120]) {
    const enemy = { speed: 100, jammedClock: 4, restrainedClock: 8, supportSlowClockV72: 6, supportSlowFactorV72: 0.38 };
    let distance = 0;
    for (let tick = 0; tick < fps * 10; tick += 1) {
      updateEnemySupportStatusesV72(enemy, 1 / fps, () => { distance += enemy.speed / fps; });
      assert.equal(enemy.speed, 100, `permanent speed at ${fps} FPS`);
    }
    assert.equal(enemy.jammedClock, 0);
    assert.equal(enemy.restrainedClock, 0);
    assert.equal(enemy.supportSlowClockV72, 0);
    assert.equal(enemy.supportSlowFactorV72, 1);
    assert.ok(Math.abs(distance - (6 * 38 + 2 * 55 + 2 * 100)) < 3, `duration independent of FPS: ${distance}`);
  }
});

test('V72 sentry requires 2D range and clear fire path through real doors/platforms', () => withRuntime(({ engine }) => {
  const enemy = { ...engine.enemies[0], alive: true, dormant: false, ventTransit: null, x: 300, y: 80, w: 40, h: 60, health: 1000, maxHealth: 1000 };
  const sentry = { id: 'test-sentry', kind: 'sentry', x: 50, y: 80, w: 38, h: 42, range: 620, ammo: 9, damage: 20, cooldown: 0 };
  engine.enemies = [enemy];
  engine.supportDeployments = [sentry];
  engine.walls = [];
  engine.platforms = [];
  let doors = [{ x: 180, y: 0, w: 32, h: 180 }];
  engine.closedDoorColliders = () => doors;
  engine.updateEquipmentDeployments(0.1);
  assert.equal(sentry.ammo, 9, 'closed door blocks fire');
  doors = [];
  engine.walls = [{ x: 180, y: 0, w: 32, h: 180 }];
  engine.updateEquipmentDeployments(0.1);
  assert.equal(sentry.ammo, 9, 'solid wall blocks fire');
  engine.walls = [];
  enemy.y = 280;
  engine.platforms = [{ x: 0, y: 200, w: 500, h: 24 }];
  engine.updateEquipmentDeployments(0.1);
  assert.equal(sentry.ammo, 9, 'floor between storeys blocks fire');
  engine.platforms = [];
  enemy.y = 900;
  engine.updateEquipmentDeployments(0.1);
  assert.equal(sentry.ammo, 9, 'same X is insufficient outside 2D range');
  enemy.y = 80;
  engine.updateEquipmentDeployments(0.1);
  assert.equal(sentry.ammo, 8, 'clear target is actually attacked');
  assert.ok(enemy.health < 1000);
}));

test('V72 oxygen, equipped effects and deployed consumables survive the native save roundtrip', () => withRuntime(({ engine, options }) => {
  const allOptions = { ...options, equipment: EQUIPMENT };
  engine.start(allOptions);
  for (const action of ['deploy-sentry', 'cryo-trap', 'containment-field', 'protective-layer', 'incendiary-load']) {
    const equipment = [...engine.equipmentActions.values()].find((entry) => entry.action === action);
    assert.ok(equipment, action);
    assert.equal(engine.useEquipment(equipment.id), true, action);
  }
  engine.animationTime = 500;
  engine.environmentStatus.oxygen = 17;
  engine.environmentStatus.lastHazard = 'vacuum';
  engine.environmentStatus.slowUntil = 501.2;
  engine.environmentStatus.slowFactor = 0.55;
  engine.fieldEffects.jammerUntil = 504;
  const sentry = engine.supportDeployments.find((entry) => entry.kind === 'sentry');
  sentry.ammo = 3;
  const trap = engine.supportDeployments.find((entry) => entry.kind === 'cryo-trap');
  trap.armed = false;
  engine.enemies[0].jammedClock = 2.5;
  const state = sanitizeOperationResumeState(JSON.parse(JSON.stringify(engine.captureResumeState())));
  const protection = engine.fieldEffects.protection;
  const boostShots = engine.fieldEffects.weaponBoostShots;
  engine.stop();
  engine.start({ ...allOptions, resumeState: state });
  assert.equal(engine.lastResumeResult.supportRestoredV72, true);
  assert.equal(engine.environmentStatus.oxygen, 17);
  assert.equal(engine.environmentStatus.lastHazard, 'vacuum');
  assert.ok(Math.abs(engine.environmentStatus.slowUntil - engine.animationTime - 1.2) < 0.0001);
  assert.equal(engine.fieldEffects.jammerUntil - engine.animationTime, 4);
  assert.equal(engine.fieldEffects.protection, protection);
  assert.equal(engine.fieldEffects.weaponBoostShots, boostShots);
  assert.equal(engine.supportDeployments.length, 3);
  assert.equal(engine.supportDeployments.find((entry) => entry.id === sentry.id).ammo, 3);
  assert.equal(engine.supportDeployments.find((entry) => entry.id === trap.id).armed, false);
  assert.equal(engine.enemies[0].jammedClock, 2.5);
  const before = JSON.stringify(engine.captureResumeState().gameplaySupportV72);
  engine.applyResumeState(state);
  assert.equal(JSON.stringify(engine.captureResumeState().gameplaySupportV72), before, 'restoring repeatedly does not duplicate deployments or reset duration');
}));

test('V72 support restore rejects unknown/duplicate deployments and derives damage from equipment', () => withRuntime(({ engine, options }) => {
  engine.start({ ...options, equipment: EQUIPMENT });
  const equipment = [...engine.equipmentActions.values()].find((entry) => entry.action === 'deploy-sentry');
  engine.useEquipment(equipment.id);
  const source = engine.captureResumeState().gameplaySupportV72;
  const saved = source.deployments[0];
  saved.damage = 9999999;
  saved.ammo = 9999999;
  source.deployments.push({ ...saved }, { ...saved, id: 'unknown-equipment:1' }, { ...saved, id: `${equipment.id}:99999` });
  restoreGameplaySupportV72(engine, source);
  assert.equal(engine.supportDeployments.length, 1);
  assert.equal(engine.supportDeployments[0].damage, 8 + equipment.magnitude * 0.45);
  assert.equal(engine.supportDeployments[0].ammo, 12 + Math.floor(equipment.magnitude / 2));
}));

test('V72 une victoire ordinaire sérialisée ne peut pas repayer ses ressources ou sa progression', () => {
  const save = createDefaultSave(1);
  const campaign = CAMPAIGNS.find((entry) => save.galaxy.unlockedWorldIds.includes(entry.worldId));
  const world = WORLDS.find((entry) => entry.id === campaign.worldId);
  assert.equal(beginOperation(save, campaign, world).ok, true);
  assert.equal(resolveOperation(save, { success: true, kills: 3 }).ok, true);
  const loaded = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  const before = structuredClone({ resources: loaded.galaxy.resources, statistics: loaded.statistics, completed: loaded.galaxy.completedCampaignIds });
  assert.deepEqual(resolveOperation(loaded, { success: true, kills: 3 }), { ok: false, reason: 'no-operation' });
  assert.deepEqual({ resources: loaded.galaxy.resources, statistics: loaded.statistics, completed: loaded.galaxy.completedCampaignIds }, before);
});

test('V72 les trois plaques royales dépassent deux silhouettes humaines et partagent un volume physique cohérent', () => withRuntime(({ engine }) => {
  const marine = resolveSpriteSheet('player.echo9-marine.locomotion');
  const marineHeight = marine.renderHeight * SPRITE_HITBOXES[marine.hitbox].height / marine.cellHeight;
  for (const id of ['enemy.xenomorph-queen.action.v56', 'enemy.xenomorph-queen.combat', 'enemy.ripper-queen.action']) {
    const sheet = resolveSpriteSheet(id);
    const body = SPRITE_HITBOXES[sheet.hitbox];
    assert.ok(sheet.renderHeight * body.height / sheet.cellHeight > marineHeight * 2, id);
    assert.equal(sheet.renderWidth / sheet.renderHeight, 224 / 170, 'art aspect ratio is preserved');
  }
  for (const name of ['Queen', 'Ripper Queen']) {
    const source = ENEMIES.find((entry) => entry.name === name && entry.modifier === 'Standard');
    assert.ok(source, name);
    const enemy = engine.createEnemy(source, 99, 1200, 930, { boss: true });
    const sheet = resolveSpriteSheet(enemy.visualSheetId);
    const body = SPRITE_HITBOXES[sheet.hitbox];
    assert.equal(enemy.royalScaleV72, true, name);
    assert.equal(enemy.w, body.width * sheet.renderWidth / sheet.cellWidth);
    assert.equal(enemy.h, body.height * sheet.renderHeight / sheet.cellHeight);
    assert.equal(enemy.y + enemy.h, 930, 'feet stay anchored');
    for (const facing of [-1, 1]) {
      enemy.facing = facing;
      const hitbox = buildSpriteHitboxRuntime(enemy, sheet).world;
      assert.ok(Math.abs(hitbox.x - enemy.x) < 0.0001);
      assert.ok(Math.abs(hitbox.y - enemy.y) < 0.0001);
      assert.equal(hitbox.w, enemy.w);
      assert.equal(hitbox.h, enemy.h);
    }
  }
}));

test('V72 une reine agrandie frappe des deux côtés sans devoir traverser le marine', () => withRuntime(({ engine }) => {
  const source = ENEMIES.find((entry) => entry.name === 'Queen' && entry.modifier === 'Standard');
  engine.walls = [];
  engine.doors = [];
  engine.platforms = [{ x: 0, y: 930, w: 6200, h: 150, floor: true }];
  for (const side of [-1, 1]) {
    const enemy = engine.createEnemy(source, 99, 1200, 930, { boss: true });
    Object.assign(enemy, { alert: true, attackClock: 0, rangedClock: 99 });
    engine.enemies = [enemy];
    Object.assign(engine.player, { x: side < 0 ? enemy.x - engine.player.w - 8 : enemy.x + enemy.w + 8, y: 930 - engine.player.h, health: 100, armor: 0, alive: true, inCover: false });
    const beforeX = enemy.x;
    BaseMissionEngine.prototype.updateEnemy.call(engine, enemy, 1 / 60);
    assert.equal(enemy.facing, side);
    assert.equal(enemy.x, beforeX, 'reached melee distance without crossing the player');
    assert.ok(engine.player.health < 100, 'large body still has reachable melee contact');
  }
}));

test('V72 la reprise d’une reine ancienne conserve ses pieds au sol après agrandissement', () => withRuntime(({ engine }) => {
  const source = ENEMIES.find((entry) => entry.name === 'Queen' && entry.modifier === 'Standard');
  const enemy = engine.createEnemy(source, 99, 1200, 930, { boss: true });
  engine.enemies = [enemy];
  const current = engine.captureResumeState();
  const old = structuredClone(current);
  delete old.enemies[0].bodyHeight;
  old.enemies[0].y = 930 - 112;
  assert.equal(engine.applyResumeState(old).applied, true);
  assert.ok(Math.abs(enemy.y + enemy.h - 930) < 0.0001, 'old 112px body is migrated feet-first');
  assert.equal(engine.applyResumeState(current).applied, true);
  assert.ok(Math.abs(enemy.y + enemy.h - 930) < 0.0001, 'new saves retain their explicit body height');
}));
