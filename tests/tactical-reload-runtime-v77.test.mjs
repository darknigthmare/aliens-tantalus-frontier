import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { TACTICAL_RELOAD_PRESENTATION_V77, captureTacticalReloadV77, getTacticalReloadHudV77 } from '../src/tactical-reload-v77.js';
import { bindTacticalReloadButtonV77 } from '../src/mission-input-v77.js';
import { drawTacticalReloadHudV77 } from '../src/tactical-reload-hud-v77.js';
import { sanitizeOperationResumeState } from '../src/save.js';
import { CAMPAIGNS, CREW, ENEMIES, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';

function withRuntime(run) {
  const names = ['Image', 'addEventListener', 'requestAnimationFrame', 'document', 'navigator'];
  const previous = new Map(names.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const listeners = new Map();
  const listen = (type, callback) => listeners.set(type, [...(listeners.get(type) || []), callback]);
  const pads = [];
  const events = [];
  const frames = [];
  const document = { hidden: false, activeElement: null, addEventListener: listen };
  const mocks = {
    Image: class { constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; } set src(value) { this.currentSrc = value; } },
    addEventListener: listen, requestAnimationFrame: (callback) => { frames.push(callback); return frames.length; },
    document, navigator: { getGamepads: () => pads }
  };
  for (const [key, value] of Object.entries(mocks)) Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener() {}, focus() { document.activeElement = canvas; } };
  const engine = new GameEngine(canvas, { onEvent: (event) => events.push(event) });
  const world = WORLDS.find((entry) => entry.biomes.includes('industrial')) || WORLDS[0];
  const options = {
    seed: 770077, world, crew: CREW, vehicle: VEHICLES.find((entry) => entry.family === 'ground'),
    campaign: { ...CAMPAIGNS[0], id: 'reload-v77', worldId: world.id, objective: 'restore atmospheric processing' },
    levelSeed: { ...LEVEL_SEEDS[0], id: 'reload-level-v77', seed: 770077, worldId: world.id, objective: 'restore atmospheric processing' },
    enemyCatalog: ENEMIES.slice(0, 52), weapon: { ...WEAPONS[0], magazine: 30, reload: 1.45 }, difficulty: 'standard'
  };
  const dispatch = (type, options = {}) => {
    const event = { code: '', repeat: false, preventDefault() { this.prevented = true; }, ...options };
    for (const listener of listeners.get(type) || []) listener(event);
    return event;
  };
  try {
    engine.start(options);
    engine.enemies = [];
    engine.hazards = [];
    Object.assign(engine.player, { ammo: 7, ammoReserve: 61 });
    return run({ engine, options, events, pads, frames, dispatch, document });
  } finally {
    engine.stop();
    for (const [key, descriptor] of previous) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
  }
}

const tick = (engine, seconds) => {
  const count = Math.max(1, Math.ceil(seconds / 0.01));
  for (let step = 0; step < count; step += 1) engine.update(seconds / count);
};
const attempt = (engine, fraction = 0.54, actor = engine.player) => {
  assert.equal(engine.reload(actor), true);
  tick(engine, actor.tacticalReload.profile.duration * fraction);
  assert.equal(engine.reload(actor), true);
};
const pad = (index) => ({ index, id: 'Test standard pad ' + index, mapping: 'standard', connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) });

function startPhysicalVentPlan(engine, options) {
  const world = WORLDS[6] || WORLDS[0];
  const plan = buildMissionLevelV52({
    campaign: { ...options.campaign, worldId: world.id },
    world, levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical', variant: 12
  });
  const ventOptions = { ...options, seed: plan.levelSeed.seed, campaign: plan.campaign, world: plan.world, levelSeed: plan.levelSeed, missionLevel: plan };
  engine.stop();
  engine.start(ventOptions);
  engine.enemies = []; engine.hazards = [];
  return ventOptions;
}

test('real keyboard edges start, attempt and finish once; held repeats do not fail the timing', () => withRuntime(({ engine, dispatch, events }) => {
  dispatch('keydown', { code: 'KeyR' });
  assert.equal(engine.player.reloading, true);
  assert.equal(engine.player.reloadClock, 1.45);
  assert.equal(engine.finishReload(engine.player), false);
  assert.deepEqual([engine.player.ammo, engine.player.ammoReserve], [7, 61]);
  tick(engine, 1.45 * 0.54);
  dispatch('keydown', { code: 'KeyR', repeat: true });
  assert.equal(engine.player.tacticalReload.attemptAt, null);
  dispatch('keyup', { code: 'KeyR' });
  dispatch('keydown', { code: 'KeyR' });
  assert.equal(engine.player.tacticalReload.result, 'perfect');
  assert.ok(engine.player.reloadClock < 1.45 * 0.3);
  tick(engine, 0.5);
  assert.deepEqual([engine.player.ammo, engine.player.ammoReserve], [30, 38]);
  tick(engine, 0.4);
  assert.equal(events.filter((event) => event.type === 'reload-complete').length, 1);
  assert.equal(engine.finishReload(engine.player), false);
}));

test('production pause, atlas suspension and blur freeze tactical simulation and input', () => withRuntime(({ engine, dispatch }) => {
  engine.reload(engine.player);
  tick(engine, 0.2);
  for (const flag of ['paused', 'enemyAtlasLoadingPausedV65']) {
    engine[flag] = true;
    const before = captureTacticalReloadV77(engine.player);
    dispatch('keydown', { code: 'KeyR' });
    engine.advancePlayerReloadV77(engine.player, 20);
    assert.deepEqual(captureTacticalReloadV77(engine.player), before);
    engine[flag] = false;
  }
  dispatch('blur');
  assert.equal(engine.paused, true);
  const before = captureTacticalReloadV77(engine.player);
  engine.advancePlayerReloadV77(engine.player, 20);
  assert.deepEqual(captureTacticalReloadV77(engine.player), before);
  engine.togglePause();
  tick(engine, 2);
  assert.equal(engine.player.ammo, 30);
}));

for (const [result, fraction] of [['normal', null], ['success', 0.44], ['perfect', 0.54], ['failed', 0.1]]) {
  test('production native save roundtrip resumes ' + result + ' without lost attempt or duplicate ammunition', () => withRuntime(({ engine, options }) => {
    if (fraction === null) { engine.reload(engine.player); tick(engine, 0.237); }
    else attempt(engine, fraction);
    const state = sanitizeOperationResumeState(JSON.parse(JSON.stringify(engine.captureResumeState())));
    const before = captureTacticalReloadV77(engine.player);
    engine.stop();
    engine.start({ ...options, resumeState: state });
    engine.enemies = []; engine.hazards = [];
    assert.deepEqual(captureTacticalReloadV77(engine.player), before);
    assert.equal(engine.player.reloading, true);
    assert.equal(engine.player.tacticalReload.result, result);
    tick(engine, 3);
    assert.deepEqual([engine.player.ammo, engine.player.ammoReserve], [30, 38]);
    const completed = sanitizeOperationResumeState(JSON.parse(JSON.stringify(engine.captureResumeState())));
    engine.stop();
    engine.start({ ...options, resumeState: completed });
    engine.enemies = []; engine.hazards = [];
    tick(engine, 3);
    assert.deepEqual([engine.player.ammo, engine.player.ammoReserve], [30, 38]);
  }));
}

test('perfect bonus affects actual projectiles, at most three rounds, and never a blocked trigger', () => withRuntime(({ engine, options }) => {
  attempt(engine);
  tick(engine, 0.5);
  engine.player.fireClock = 1;
  assert.equal(engine.fire(engine.player), false);
  assert.equal(engine.player.tacticalReload.bonusRemaining, 3);
  engine.enemies = [];
  const damages = [];
  for (let index = 0; index < 4; index += 1) {
    engine.player.fireClock = 0;
    assert.equal(engine.fire(engine.player), true);
    damages.push(engine.bullets.at(-1).damage);
  }
  assert.deepEqual(damages, [options.weapon.damage * 1.15, options.weapon.damage * 1.15, options.weapon.damage * 1.15, options.weapon.damage]);
  assert.equal(engine.player.ammo, 26);
}));

test('the unmodified catalogue M41A uses its real 99-round magazine and only three accepted bonus shots', () => withRuntime(({ engine, options }) => {
  const catalogueOptions = { ...options, weapon: WEAPONS[0] };
  engine.stop(); engine.start(catalogueOptions);
  engine.enemies = []; engine.hazards = [];
  assert.equal(WEAPONS[0].name, 'M41A Pulse Rifle');
  assert.equal(engine.player.magazineSize, 99);
  assert.equal(engine.player.ammo, 99);
  assert.equal(engine.weaponProfile(engine.player).interval, 1 / 7.7);
  Object.assign(engine.player, { ammo: 7, ammoReserve: 201 });
  assert.equal(engine.reload(engine.player), true);
  assert.equal(engine.player.tacticalReload.profile.duration, 1.45);
  tick(engine, 1.45 * 0.54);
  assert.equal(engine.reload(engine.player), true);
  const saved = sanitizeOperationResumeState(JSON.parse(JSON.stringify(engine.captureResumeState())));
  const expected = captureTacticalReloadV77(engine.player);
  engine.stop(); engine.start({ ...catalogueOptions, resumeState: saved });
  engine.enemies = []; engine.hazards = [];
  assert.deepEqual(captureTacticalReloadV77(engine.player), expected);
  tick(engine, 0.5);
  assert.deepEqual([engine.player.ammo, engine.player.ammoReserve], [99, 109]);
  assert.equal(engine.player.ammo + engine.player.ammoReserve, 208);
  const multipliers = [];
  const damages = [];
  for (let shot = 0; shot < 4; shot += 1) {
    engine.player.fireClock = 0;
    assert.equal(engine.fire(engine.player), true);
    multipliers.push(engine.bullets.at(-1).tacticalReloadBonusV77);
    damages.push(engine.bullets.at(-1).damage);
  }
  assert.deepEqual(multipliers, [1.15, 1.15, 1.15, 1]);
  assert.deepEqual(damages, [WEAPONS[0].damage * 1.15, WEAPONS[0].damage * 1.15, WEAPONS[0].damage * 1.15, WEAPONS[0].damage]);
  assert.deepEqual([engine.player.ammo, engine.player.ammoReserve], [95, 109]);
}));

test('an old one-round M41A save gains capacity but cannot manufacture missing ammunition', () => withRuntime(({ engine, options }) => {
  const oldSave = JSON.parse(JSON.stringify(engine.captureResumeState()));
  oldSave.player.ammo = 1;
  oldSave.player.weapon = 'rifle';
  delete oldSave.player.tacticalReloadV77;
  for (const reserve of [0, 12]) {
    oldSave.player.ammoReserve = reserve;
    const saved = sanitizeOperationResumeState(oldSave);
    engine.stop(); engine.start({ ...options, weapon: WEAPONS[0], resumeState: saved });
    engine.enemies = []; engine.hazards = [];
    assert.equal(engine.player.magazineSize, 99);
    assert.equal(engine.player.tacticalReload, null);
    assert.deepEqual([engine.player.ammo, engine.player.ammoReserve], [1, reserve]);
    tick(engine, 2);
    assert.deepEqual([engine.player.ammo, engine.player.ammoReserve], [1, reserve], 'resuming alone does not refill the larger magazine');
    assert.equal(engine.reload(engine.player), reserve > 0);
    tick(engine, 2);
    assert.deepEqual([engine.player.ammo, engine.player.ammoReserve], [1 + reserve, 0]);
  }
}));

test('a partly consumed perfect magazine and a coop reload retain distinct states after native resume', () => withRuntime(({ engine, options }) => {
  engine.setCoop(true);
  attempt(engine);
  tick(engine, 0.5);
  engine.enemies = [];
  engine.player.fireClock = 0;
  assert.equal(engine.fire(engine.player), true);
  engine.coop.ammo = 0;
  engine.reload(engine.coop);
  tick(engine, 0.23);
  const expectedPlayer = captureTacticalReloadV77(engine.player);
  const expectedCoop = captureTacticalReloadV77(engine.coop);
  const saved = sanitizeOperationResumeState(JSON.parse(JSON.stringify(engine.captureResumeState())));
  engine.stop();
  engine.start({ ...options, resumeState: saved });
  engine.enemies = []; engine.hazards = [];
  assert.equal(engine.coopEnabled, true);
  assert.deepEqual(captureTacticalReloadV77(engine.player), expectedPlayer);
  assert.deepEqual(captureTacticalReloadV77(engine.coop), expectedCoop);
  const multipliers = [];
  for (let index = 0; index < 3; index += 1) {
    engine.player.fireClock = 0;
    engine.fire(engine.player);
    multipliers.push(engine.bullets.at(-1).tacticalReloadBonusV77);
  }
  assert.deepEqual(multipliers, [1.15, 1.15, 1]);
  engine.setCoop(false);
  assert.equal(engine.coop.tacticalReload.phase, 'cancelled');
  tick(engine, 2);
  assert.equal(engine.coop.ammo, 0);
}));

test('death and successful animated embark interrupt immediately before save or transfer', () => withRuntime(({ engine }) => {
  attempt(engine);
  engine.downPlayer(engine.player, 'test');
  assert.equal(engine.player.tacticalReload.phase, 'cancelled');
  assert.deepEqual([engine.player.ammo, engine.player.ammoReserve], [7, 61]);
  engine.restartFromCheckpoint();
  engine.player.ammo = 7;
  engine.reload(engine.player);
  const failedVehicle = engine.toggleVehicle(engine.player);
  assert.equal(failedVehicle, false);
  assert.equal(engine.player.reloading, true, 'rejected embark is not an interruption');
  Object.assign(engine.player, { x: engine.vehicle.x, y: engine.vehicle.y });
  assert.equal(engine.toggleVehicle(engine.player), true);
  assert.equal(engine.player.tacticalReload.phase, 'cancelled');
  assert.equal(engine.captureResumeState().player.tacticalReloadV77.phase, 'cancelled');
  tick(engine, 3);
  assert.deepEqual([engine.player.ammo, engine.player.ammoReserve], [7, 61]);
}));

test('two standard gamepads have independent reload edges and holding X cannot submit twice', () => withRuntime(({ engine, pads }) => {
  engine.setCoop(true);
  Object.assign(engine.coop, { ammo: 0, ammoReserve: 20 });
  pads.push(pad(0), pad(1));
  engine.gamepadInputV77.poll();
  pads[0].buttons[2].pressed = true;
  pads[1].buttons[2].pressed = true;
  engine.gamepadInputV77.poll();
  assert.equal(engine.player.reloading, true);
  assert.equal(engine.coop.reloading, true);
  tick(engine, 0.1);
  engine.gamepadInputV77.poll();
  assert.equal(engine.player.tacticalReload.attemptAt, null);
  assert.equal(engine.coop.tacticalReload.attemptAt, null);
  pads[1].buttons[2].pressed = false; engine.gamepadInputV77.poll();
  pads[1].buttons[2].pressed = true; engine.gamepadInputV77.poll();
  assert.equal(engine.coop.tacticalReload.result, 'failed');
  assert.equal(engine.player.tacticalReload.result, 'normal');
  pads[0].buttons[2].pressed = false; engine.gamepadInputV77.poll();
  tick(engine, 1.45 * 0.54 - 0.1);
  pads[0].buttons[2].pressed = true; engine.gamepadInputV77.poll();
  assert.equal(engine.player.tacticalReload.result, 'perfect');
}));

for (const role of ['player', 'coop']) {
  test(role + ' entering a physical vent cancels timing immediately and survives native resume without free rounds', () => withRuntime(({ engine, options }) => {
    const ventOptions = startPhysicalVentPlan(engine, options);
    if (role === 'coop') engine.setCoop(true);
    const actor = engine[role];
    actor.ammo = 2; actor.ammoReserve = 40;
    const portal = engine.missionVentNetworkV62.entrances[0];
    Object.assign(actor, { x: portal.worldPosition.x - actor.w / 2, y: portal.worldPosition.y - actor.h, grounded: true });
    assert.equal(engine.reload(actor), true);
    engine.advancePlayerReloadV77(actor, actor.tacticalReload.profile.duration * 0.54);
    engine.inventory.cutter = true;
    assert.ok(engine.enterMissionVentV62(actor));
    assert.equal(actor.tacticalReload.phase, 'cancelled');
    assert.equal(actor.tacticalReload.cancelReason, 'vent-transit');
    assert.equal(actor.reloading, false);
    assert.equal(engine.reload(actor), false);
    const expected = captureTacticalReloadV77(actor);
    const saved = sanitizeOperationResumeState(JSON.parse(JSON.stringify(engine.captureResumeState())));
    engine.stop(); engine.start({ ...ventOptions, resumeState: saved });
    engine.enemies = []; engine.hazards = [];
    const restored = engine[role];
    assert.ok(restored.ventTransit);
    assert.deepEqual(captureTacticalReloadV77(restored), expected);
    tick(engine, 2);
    assert.equal(engine.reload(restored), false);
    assert.equal(restored.reloading, false);
    assert.equal(restored.tacticalReload.bonusRemaining, 0);
    assert.equal(getTacticalReloadHudV77(restored).visible, false, 'cancel feedback expires even while the body is concealed');
    assert.deepEqual([restored.ammo, restored.ammoReserve], [2, 40]);
  }));
}

test('an out-of-range vent request leaves the existing reload intact', () => withRuntime(({ engine, options }) => {
  startPhysicalVentPlan(engine, options);
  engine.player.ammo = 2;
  const portal = engine.missionVentNetworkV62.entrances[0];
  Object.assign(engine.player, { x: portal.worldPosition.x + 800, y: portal.worldPosition.y - engine.player.h });
  engine.reload(engine.player);
  const before = captureTacticalReloadV77(engine.player);
  assert.equal(engine.beginMissionVentTraversalV62(engine.player, { entranceId: portal.id, actorKind: 'player', maximumDistance: 135 }), null);
  assert.deepEqual(captureTacticalReloadV77(engine.player), before);
}));

test('gamepad reconnect, pause and UI focus cannot manufacture an active-reload attempt', () => withRuntime(({ engine, pads, document }) => {
  pads.push(pad(0));
  pads[0].buttons[2].pressed = true;
  engine.gamepadInputV77.poll();
  assert.equal(engine.player.reloading, false, 'connection with held X is ignored');
  pads[0].buttons[2].pressed = false; engine.gamepadInputV77.poll();
  pads[0].buttons[2].pressed = true; engine.gamepadInputV77.poll();
  assert.equal(engine.player.reloading, true);
  pads[0].buttons[9].pressed = true; engine.gamepadInputV77.poll();
  assert.equal(engine.paused, true);
  pads[0].buttons[9].pressed = false; engine.gamepadInputV77.poll();
  pads[0].buttons[9].pressed = true; engine.gamepadInputV77.poll();
  assert.equal(engine.paused, false);
  assert.equal(engine.player.tacticalReload.attemptAt, null);
  pads[0].buttons[2].pressed = false; pads[0].buttons[9].pressed = false; engine.gamepadInputV77.poll();
  document.activeElement = { closest: () => ({}) };
  pads[0].buttons[2].pressed = true; engine.gamepadInputV77.poll();
  assert.equal(engine.player.tacticalReload.attemptAt, null);
}));

test('gamepad held movement never erases a simultaneous keyboard source; slot two stays player two', () => withRuntime(({ engine, pads, dispatch }) => {
  engine.setCoop(true);
  pads.push(pad(0), pad(1)); engine.gamepadInputV77.poll();
  dispatch('keydown', { code: 'KeyD' });
  pads[0].axes[0] = 1; engine.gamepadInputV77.poll();
  pads[0].axes[0] = 0; engine.gamepadInputV77.poll();
  assert.equal(engine.keys.has('KeyD'), true);
  dispatch('keyup', { code: 'KeyD' });
  assert.equal(engine.keys.has('KeyD'), false);
  pads[0].connected = false; engine.gamepadInputV77.poll();
  engine.coop.ammo = 0;
  pads[1].buttons[2].pressed = true; engine.gamepadInputV77.poll();
  assert.equal(engine.coop.reloading, true);
  assert.equal(engine.player.reloading, false);
}));

test('gamepad API failure releases only its keys and hidden tabs cannot be unpaused by a controller', () => withRuntime(({ engine, pads, dispatch, document }) => {
  pads.push(pad(0)); engine.gamepadInputV77.poll();
  pads[0].axes[0] = 1; engine.gamepadInputV77.poll();
  dispatch('keydown', { code: 'KeyD' });
  navigator.getGamepads = () => { throw new Error('Gamepad permission unavailable'); };
  assert.doesNotThrow(() => engine.gamepadInputV77.poll());
  assert.equal(engine.keys.has('KeyD'), true);
  dispatch('keyup', { code: 'KeyD' });
  assert.equal(engine.keys.has('KeyD'), false);
  navigator.getGamepads = () => pads;
  pads[0].axes[0] = 0; engine.gamepadInputV77.poll();
  dispatch('blur'); document.hidden = true;
  pads[0].buttons[9].pressed = true; engine.gamepadInputV77.poll();
  assert.equal(engine.paused, true);
}));

test('touch reload samples contact and suppresses synthetic clicks while keeping accessible activation', () => withRuntime(({ engine }) => {
  const listeners = new Map();
  const button = { addEventListener(type, callback) { listeners.set(type, callback); }, removeEventListener(type) { listeners.delete(type); }, setAttribute() {} };
  const clean = bindTacticalReloadButtonV77(button, engine);
  const event = { button: 0, detail: 1, isPrimary: false, pointerType: 'touch', preventDefault() {} };
  listeners.get('pointerdown')(event);
  assert.equal(engine.player.reloading, true);
  listeners.get('click')(event);
  assert.equal(engine.player.tacticalReload.attemptAt, null);
  tick(engine, 1.45 * 0.54);
  listeners.get('pointerdown')(event);
  assert.equal(engine.player.tacticalReload.result, 'perfect');
  tick(engine, 0.5);
  engine.player.ammo = 0;
  listeners.get('click')({ ...event, detail: 0 });
  assert.equal(engine.player.reloading, true);
  clean();
  assert.equal(listeners.size, 0);
}));

test('HUD draws the live cursor and result for both actors with an explicit shared animation contract', () => withRuntime(({ engine }) => {
  engine.setCoop(true);
  engine.coop.ammo = 0;
  engine.reload(engine.player); engine.reload(engine.coop);
  tick(engine, 0.5);
  const calls = [];
  const ctx = new Proxy({}, { get: (_target, name) => (...args) => calls.push([name, ...args]), set: () => true });
  drawTacticalReloadHudV77(engine, ctx);
  assert.ok(calls.some((call) => call[0] === 'fillText' && call[1].includes('RECHARGEMENT')));
  assert.ok(calls.some((call) => call[0] === 'fillText' && call[1].startsWith('J2')));
  const cursor = getTacticalReloadHudV77(engine.player).cursor;
  assert.ok(calls.some((call) => call[0] === 'fillRect' && Math.abs(call[1] - (30 + 328 * cursor - 1)) < 1e-9 && call[3] === 2));
  assert.equal(engine.getSnapshot().player.tacticalReloadV77.canAttempt, true);
  assert.equal(TACTICAL_RELOAD_PRESENTATION_V77.dedicatedBranchAnimations, false);
}));
