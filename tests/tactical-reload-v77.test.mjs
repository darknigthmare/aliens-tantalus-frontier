import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TACTICAL_RELOAD_FAMILIES_V77, getTacticalReloadProfileV77,
  startTacticalReloadV77 as start, pressTacticalReloadV77 as press,
  updateTacticalReloadV77 as update, cancelTacticalReloadV77 as cancel,
  captureTacticalReloadV77 as capture, restoreTacticalReloadV77 as restore,
  getTacticalReloadHudV77 as hud, consumeTacticalReloadBonusV77 as bonus
} from '../src/tactical-reload-v77.js';

const marine = (overrides = {}) => ({ alive: true, downed: false, inVehicle: false, weaponMode: 'rifle', magazineSize: 30, ammo: 7, ammoReserve: 61, ...overrides });
const rifle = { id: 'weapon-001-m41a-pulse-rifle', family: 'ballistic', reload: 1.45 };
const clone = (value) => JSON.parse(JSON.stringify(value));
function attempt(actor, fraction, weapon = rifle) {
  assert.equal(start(actor, weapon), true);
  update(actor, actor.tacticalReload.profile.duration * fraction, { weapon });
  assert.equal(press(actor, weapon), true);
  return actor.tacticalReload;
}

test('normal reload needs no second press and transfers ammunition exactly once', () => {
  const actor = marine();
  assert.equal(press(actor, rifle), true);
  assert.equal(actor.reloadClock, 1.45);
  update(actor, 1.449);
  assert.deepEqual([actor.ammo, actor.ammoReserve], [7, 61]);
  const event = update(actor, 0.01);
  assert.deepEqual(event, { type: 'complete', result: 'normal', loaded: 23 });
  assert.deepEqual([actor.ammo, actor.ammoReserve, actor.reloading, actor.reloadClock], [30, 38, false, 0]);
  assert.equal(update(actor, 100), null);
  assert.deepEqual([actor.ammo, actor.ammoReserve], [30, 38]);
  assert.equal(bonus(actor), 1);
});

test('weapon families have distinct readable windows and honor equipped reload duration', () => {
  const descriptors = [
    ['sidearm', { name: 'M4A3 Service Pistol' }], ['rifle', rifle],
    ['shotgun', { name: 'M37A2 Pump Shotgun' }], ['smartgun', { family: 'smart' }],
    ['launcher', { name: 'M83 SADAR' }], ['tank', { family: 'flame' }], ['energy', { family: 'electric' }]
  ];
  for (const [family, descriptor] of descriptors) {
    const profile = getTacticalReloadProfileV77(descriptor);
    assert.equal(profile.family, family);
    const [startSuccess, endSuccess] = profile.successWindow;
    const [startPerfect, endPerfect] = profile.perfectWindow;
    assert.ok(0 < startSuccess && startSuccess < startPerfect && startPerfect < endPerfect && endPerfect < endSuccess && endSuccess < 1);
  }
  assert.equal(new Set(Object.values(TACTICAL_RELOAD_FAMILIES_V77).map((entry) => entry.duration)).size, 7);
  assert.equal(getTacticalReloadProfileV77({ ...rifle, reload: 3.23 }).duration, 3.23);
  assert.equal(getTacticalReloadProfileV77({ ...rifle, reload: Infinity }).duration, 1.45);
  for (const family of ['melee', 'tool', 'sentry']) assert.equal(getTacticalReloadProfileV77({ family }), null);
});

for (const [name, fraction, expected] of [['early', 0.1, 'failed'], ['success', 0.44, 'success'], ['perfect', 0.54, 'perfect'], ['late', 0.9, 'failed']]) {
  test(`${name} second press consumes a single attempt and resolves ${expected}`, () => {
    const actor = marine();
    const state = attempt(actor, fraction);
    assert.equal(state.result, expected);
    const saved = capture(actor);
    for (let index = 0; index < 6; index += 1) assert.equal(press(actor, rifle), false);
    assert.deepEqual(capture(actor), saved);
    if (expected === 'failed') assert.ok(state.completeAt > state.profile.duration);
    else assert.ok(state.completeAt < state.profile.duration);
    assert.ok(state.completeAt >= state.attemptAt + state.profile.recovery);
    assert.deepEqual(update(actor, 20), { type: 'complete', result: expected, loaded: 23 });
    assert.equal(actor.ammo + actor.ammoReserve, 68);
  });
}

test('every exact window boundary is inclusive without floating point bias', () => {
  for (const [family, definition] of Object.entries(TACTICAL_RELOAD_FAMILIES_V77)) {
    const descriptor = { name: family === 'tank' ? 'incinerator' : family, family: family === 'energy' ? 'energy' : family };
    for (const [fraction, expected] of [...definition.success.map((edge) => [edge, 'success']), ...definition.perfect.map((edge) => [edge, 'perfect'])]) {
      const actor = marine();
      attempt(actor, fraction, descriptor);
      assert.equal(actor.tacticalReload.result, expected, `${family} boundary ${fraction}`);
    }
  }
});

test('limited reserves and mid-reload reserve changes conserve the live inventory', () => {
  const actor = marine({ ammoReserve: 2 });
  start(actor, rifle);
  assert.deepEqual(update(actor, 2), { type: 'complete', result: 'normal', loaded: 2 });
  assert.deepEqual([actor.ammo, actor.ammoReserve], [9, 0]);
  const shared = marine();
  start(shared, rifle);
  shared.ammoReserve = 4;
  shared.ammo = 29;
  update(shared, 2);
  assert.deepEqual([shared.ammo, shared.ammoReserve], [30, 3]);
});

test('short and long weapon timings keep success faster and retain a real recovery interval', () => {
  for (const family of Object.keys(TACTICAL_RELOAD_FAMILIES_V77)) {
    assert.equal(getTacticalReloadProfileV77(family).family, family);
    for (const reload of [0.35, 12]) {
      const weapon = { id: family, family, reload };
      const profile = getTacticalReloadProfileV77(weapon);
      for (const fraction of [profile.successWindow[1], profile.perfectWindow[1]]) {
        const actor = marine();
        const state = attempt(actor, fraction, weapon);
        assert.ok(state.completeAt < reload, `${family} ${reload}s reload must finish faster`);
        assert.ok(state.completeAt >= state.elapsed + profile.recovery);
      }
    }
  }
});

test('a changed balancing duration cannot move an in-flight reload window after resume', () => {
  const actor = marine();
  start(actor, rifle);
  update(actor, 0.2);
  const snapshot = capture(actor);
  const rebalanced = { ...rifle, reload: 4.2 };
  const resumed = marine();
  assert.equal(restore(resumed, snapshot, rebalanced), true);
  assert.deepEqual(capture(resumed), snapshot);
  update(resumed, 0.583, { weapon: rebalanced });
  press(resumed, rebalanced);
  assert.equal(resumed.tacticalReload.result, 'perfect');
  assert.equal(resumed.tacticalReload.profile.duration, 1.45);
});

test('perfect bonus is capped by actual rounds loaded and cannot be replayed', () => {
  const actor = marine({ ammoReserve: 2 });
  attempt(actor, 0.54);
  update(actor, 2);
  assert.equal(hud(actor).bonusRemaining, 2);
  assert.deepEqual([bonus(actor, rifle), bonus(actor, rifle), bonus(actor, rifle)], [1.15, 1.15, 1]);
  assert.equal(hud(actor).bonusMultiplier, 1);
  const full = marine();
  attempt(full, 0.54);
  update(full, 2);
  assert.deepEqual(Array.from({ length: 5 }, () => bonus(full)), [1.15, 1.15, 1.15, 1, 1]);
});

test('invalid states cannot start a reload or consume the remaining perfect bonus', () => {
  for (const overrides of [{ alive: false }, { downed: true }, { inVehicle: true }, { ventTransit: {} }, { ammo: 30 }, { ammoReserve: 0 }, { magazineSize: 0 }, { weaponMode: 'neuro-melee' }]) {
    const actor = marine(overrides);
    assert.equal(start(actor), false);
    assert.equal(actor.tacticalReload, undefined);
  }
  const actor = marine();
  attempt(actor, 0.54);
  update(actor, 2);
  actor.inVehicle = true;
  assert.equal(bonus(actor, rifle), 1);
  actor.inVehicle = false;
  assert.equal(bonus(actor, rifle), 1);
});

test('pause freezes input, cursor, transfer and result feedback', () => {
  const actor = marine();
  assert.equal(start(actor, rifle, { paused: true }), false);
  start(actor, rifle);
  update(actor, 0.7);
  const snapshot = capture(actor);
  assert.equal(press(actor, rifle, { paused: true }), false);
  update(actor, 60, { paused: true });
  assert.deepEqual(capture(actor), snapshot);
  update(actor, 0.75);
  const complete = capture(actor);
  update(actor, 60, { paused: true });
  assert.deepEqual(capture(actor), complete);
});

test('invalid deltas do not skip the timing minigame and a huge finite delta completes once', () => {
  const actor = marine();
  start(actor, rifle);
  const snapshot = capture(actor);
  for (const delta of [-1, NaN, Infinity, -Infinity, '1']) update(actor, delta);
  assert.deepEqual(capture(actor), snapshot);
  assert.deepEqual(update(actor, Number.MAX_VALUE), { type: 'complete', result: 'normal', loaded: 23 });
  assert.equal(hud(actor).visible, false);
  assert.equal(update(actor, Number.MAX_VALUE), null);
});

for (const [name, changes, weapon, expected] of [
  ['death', { alive: false }, rifle, 'incapacitated'], ['downed', { downed: true }, rifle, 'incapacitated'],
  ['vent transit', { ventTransit: { phase: 'at-node' } }, rifle, 'vent-transit'],
  ['vehicle entry', { inVehicle: true }, rifle, 'vehicle'], ['mode change', { weaponMode: 'sidearm' }, rifle, 'weapon-changed'],
  ['magazine change', { magazineSize: 40 }, rifle, 'weapon-changed'], ['same-family weapon change', {}, { ...rifle, id: 'another-rifle' }, 'weapon-changed']
]) {
  test(`${name} interrupts before the transfer even when a frame passes completion`, () => {
    const actor = marine();
    attempt(actor, 0.54);
    Object.assign(actor, changes);
    assert.deepEqual(update(actor, 4, { weapon }), { type: 'cancelled', reason: expected, result: 'perfect', loaded: 0 });
    assert.deepEqual([actor.ammo, actor.ammoReserve, actor.reloading], [7, 61, false]);
    update(actor, 4, { weapon });
    assert.deepEqual([actor.ammo, actor.ammoReserve], [7, 61]);
    assert.equal(hud(actor).animation, 'reload_cancel');
  });
}

test('explicit interruption allows a new sequence with a fresh attempt but no refunded rounds', () => {
  const actor = marine();
  attempt(actor, 0.54);
  assert.equal(cancel(actor, 'stagger'), true);
  assert.equal(cancel(actor, 'stagger'), false);
  assert.equal(press(actor, rifle), true);
  assert.equal(actor.tacticalReload.attemptAt, null);
  update(actor, 20);
  assert.deepEqual([actor.ammo, actor.ammoReserve], [30, 38]);
});

for (const fraction of [null, 0.1, 0.44, 0.54, 0.9]) {
  test(`save/resume preserves exact attempt and completion for ${fraction ?? 'normal'} timing`, () => {
    const original = marine();
    if (fraction === null) { start(original, rifle); update(original, 0.213); }
    else { attempt(original, fraction); update(original, 0.071); }
    const snapshot = JSON.parse(JSON.stringify(capture(original)));
    const resumed = marine({ ammo: original.ammo, ammoReserve: original.ammoReserve });
    assert.equal(restore(resumed, snapshot, rifle), true);
    assert.deepEqual(capture(resumed), snapshot);
    assert.equal(resumed.reloadClock, original.reloadClock);
    assert.deepEqual(hud(resumed), hud(original));
    assert.deepEqual(update(resumed, 4), update(original, 4));
    assert.deepEqual(capture(resumed), capture(original));
    assert.deepEqual([resumed.ammo, resumed.ammoReserve], [original.ammo, original.ammoReserve]);
  });
}

test('restoring completed transfer and a partly consumed bonus never duplicates either', () => {
  const actor = marine();
  attempt(actor, 0.54);
  update(actor, actor.reloadClock);
  bonus(actor, rifle);
  const snapshot = capture(actor);
  const resumed = marine({ ammo: actor.ammo, ammoReserve: actor.ammoReserve });
  assert.equal(restore(resumed, snapshot, rifle), true);
  assert.deepEqual(capture(resumed), snapshot);
  update(resumed, 4);
  assert.deepEqual([resumed.ammo, resumed.ammoReserve], [30, 38]);
  assert.deepEqual([bonus(resumed, rifle), bonus(resumed, rifle), bonus(resumed, rifle)], [1.15, 1.15, 1]);
});

test('cancelled reload can be restored for a downed actor without resuming or transferring', () => {
  const actor = marine();
  start(actor, rifle);
  update(actor, 0.1);
  actor.alive = false;
  update(actor, 0);
  const snapshot = capture(actor);
  const resumed = marine({ alive: false });
  assert.equal(restore(resumed, snapshot, rifle), true);
  assert.deepEqual(capture(resumed), snapshot);
  assert.equal(resumed.reloading, false);
  assert.equal(update(resumed, 4), null);
  assert.deepEqual([resumed.ammo, resumed.ammoReserve], [7, 61]);
});

test('malformed or cross-weapon snapshots fail closed and never write inventory', () => {
  const actor = marine();
  attempt(actor, 0.54);
  const original = capture(actor);
  const corruptions = [
    (s) => { s.schema = 900; }, (s) => { s.transferred = true; }, (s) => { s.attemptAt = null; },
    (s) => { s.elapsed = Infinity; }, (s) => { s.completeAt = 0; }, (s) => { s.profile.perfectBonusMultiplier = 999; },
    (s) => { s.profile.family = 'toString'; s.profile.successWindow = [0, 1]; }, (s) => { s.bonusRemaining = 3; },
    (s) => { s.roundsLoaded = 2; }, (s) => { s.profile.perfectWindow = [0, 1]; }, (s) => { s.weaponKey = 'another-rifle'; }
  ];
  for (const corrupt of corruptions) {
    const snapshot = clone(original);
    corrupt(snapshot);
    const resumed = marine();
    assert.equal(restore(resumed, snapshot, rifle), false);
    assert.deepEqual([resumed.ammo, resumed.ammoReserve, resumed.reloading, resumed.reloadClock], [7, 61, false, 0]);
  }
  for (const snapshot of [null, [], {}, 'reload']) assert.equal(restore(marine(), snapshot), false);
});

test('capture and HUD return copies so UI and save preparation cannot change simulation', () => {
  const actor = marine();
  start(actor, rifle);
  assert.equal(hud(actor).animation, 'reload_start');
  const copied = capture(actor);
  copied.profile.successWindow[0] = 0;
  hud(actor).perfectWindow[0] = 0;
  assert.equal(actor.tacticalReload.profile.successWindow[0], 0.4);
  assert.equal(actor.tacticalReload.profile.perfectWindow[0], 0.51);
  update(actor, 0.2);
  assert.equal(hud(actor).animation, 'reload_normal');
  assert.equal(hud(actor).canAttempt, true);
  press(actor, rifle);
  assert.equal(hud(actor).animation, 'reload_fail_recover');
  assert.equal(hud(actor).canAttempt, false);
});

test('cooperative actors own independent clocks, attempts, inventory and perfect rounds', () => {
  const first = marine();
  const second = marine({ weaponMode: 'sidearm', magazineSize: 12, ammo: 0, ammoReserve: 20 });
  attempt(first, 0.54);
  start(second);
  update(second, 0.1);
  press(second);
  const secondBefore = capture(second);
  update(first, 4);
  assert.deepEqual(capture(second), secondBefore);
  assert.equal(first.tacticalReload.result, 'perfect');
  assert.equal(second.tacticalReload.result, 'failed');
  assert.deepEqual([second.ammo, second.ammoReserve], [0, 20]);
  assert.equal(bonus(first), 1.15);
  assert.equal(bonus(second), 1);
});
