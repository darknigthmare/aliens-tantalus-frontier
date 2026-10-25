import assert from 'node:assert/strict';
import test from 'node:test';
import { WEAPONS } from '../src/content-core-v50.js';
import { USER_EQUIPMENT_V95 } from '../src/user-equipment-v95.js';
import { resolveHeldWeaponProfileV125 } from '../src/held-weapon-profiles-v125.js';
import { getHeldWeaponPoseV125 } from '../src/held-weapon-renderer-v125.js';
import { resolvePlayerBodyRigV125 } from '../src/player-body-rig-v125.js';
import { startTacticalReloadV77, pressTacticalReloadV77, updateTacticalReloadV77,
  cancelTacticalReloadV77, captureTacticalReloadV77, restoreTacticalReloadV77,
  getTacticalReloadHudV77 } from '../src/tactical-reload-v77.js';
import { getReloadPresentationProgressV163 as progress,
  RELOAD_DISCARD_PROGRESS_V163 } from '../src/reload-presentation-v163.js';

const named = name => WEAPONS.find(w => w.name === name);
const actor = extra => ({ x: 100, y: 200, w: 42, h: 92, facing: 1, alive: true,
  grounded: true, ammo: 15, magazineSize: 30, ammoReserve: 90,
  weaponMode: 'rifle', operatorId: 'echo-9', ...extra });
const pose = (a, w, aim = { x: a.facing, y: 0 }) => getHeldWeaponPoseV125({ actor: a,
  descriptor: w, aim, bodyRig: resolvePlayerBodyRigV125({ actor: a, surface: 'mission', timeSeconds: 0 }) });
const near = (a, b, epsilon = 1e-8) => assert.ok(Math.abs(a - b) <= epsilon, `${a} differs from ${b}`);
const samePoint = (a, b) => { near(a.x, b.x); near(a.y, b.y); };
const outcomes = { failed: .2, success: .44, perfect: .54 };

test('the accepted second press cannot jump the native hand, rigid weapon or service phase', () => {
  const w = named('M41A Pulse Rifle');
  for (const [expected, fraction] of Object.entries(outcomes)) {
    const a = actor();
    assert.equal(startTacticalReloadV77(a, w), true);
    const duration = a.tacticalReload.profile.duration;
    updateTacticalReloadV77(a, duration * fraction, { weapon: w });
    const before = pose(a, w), inventory = [a.ammo, a.ammoReserve];
    assert.equal(pressTacticalReloadV77(a, w), true);
    const after = pose(a, w);
    assert.equal(a.tacticalReload.result, expected);
    assert.equal(before.reloadPhase, after.reloadPhase);
    near(before.reloadProgress, after.reloadProgress);
    for (const key of ['grip', 'support', 'reloadPort', 'muzzle']) samePoint(before[key], after[key]);
    for (const key of ['a', 'b', 'c', 'd', 'e', 'f']) near(before.matrix[key], after.matrix[key]);
    assert.deepEqual([a.ammo, a.ammoReserve], inventory);
  }
});

test('all native feed families retain identical attempt-edge contacts in both facings and eight aims', () => {
  const feeds = new Map();
  for (const w of [...WEAPONS, ...USER_EQUIPMENT_V95.filter(w => w.kind === 'weapon')]) {
    const p = resolveHeldWeaponProfileV125(w);
    if (p?.portable && p.reload.feed !== 'none' && !feeds.has(p.reload.feed)) feeds.set(p.reload.feed, w);
  }
  assert.deepEqual([...feeds.keys()].sort(), ['box', 'cell', 'cylinder', 'drum', 'single', 'tank', 'tube']);
  for (const [feed, w] of feeds) for (const facing of [-1, 1]) for (const crouching of [false, true]) {
    for (let sector = 0; sector < 8; sector++) {
      const aim = { x: Math.cos(sector * Math.PI / 4), y: Math.sin(sector * Math.PI / 4), facing };
      for (const mode of ['success', 'perfect', 'failed']) {
        const a = actor({ facing, crouching });
        assert.equal(startTacticalReloadV77(a, w), true, feed + '/' + w.id);
        const p = a.tacticalReload.profile;
        const fraction = mode === 'failed' ? .12 : mode === 'success'
          ? (p.successWindow[0] + p.perfectWindow[0]) / 2 : (p.perfectWindow[0] + p.perfectWindow[1]) / 2;
        updateTacticalReloadV77(a, p.duration * fraction, { weapon: w });
        const before = pose(a, w, aim);
        assert.ok(before, feed + '/' + w.id);
        assert.equal(pressTacticalReloadV77(a, w), true);
        const after = pose(a, w, aim);
        assert.equal(a.tacticalReload.result, mode);
        near(before.reloadProgress, after.reloadProgress);
        samePoint(before.support, after.support);
        samePoint(before.grip, after.grip);
        assert.equal(after.armReachV160.feasible, before.armReachV160.feasible);
      }
    }
  }
});

test('shortened and extended clocks are monotone, continuous in velocity and finish with one real transfer', () => {
  for (const w of [named('M4A3 Service Pistol'), named('M41A Pulse Rifle'), named('M56 Smartgun')]) {
    for (const mode of ['normal', 'success', 'perfect', 'failed', 'late-failure']) {
      const a = actor({ ammo: 0, ammoReserve: 19 });
      startTacticalReloadV77(a, w);
      const p = a.tacticalReload.profile;
      const at = mode === 'normal' ? null : mode === 'failed' ? p.duration * .12 : mode === 'late-failure' ? p.duration * .98
        : p.duration * (mode === 'success' ? (p.successWindow[0] + p.perfectWindow[0]) / 2
          : (p.perfectWindow[0] + p.perfectWindow[1]) / 2);
      if (at !== null) {
        updateTacticalReloadV77(a, at, { weapon: w });
        const before = progress(a.tacticalReload);
        pressTacticalReloadV77(a, w);
        near(progress(a.tacticalReload), before);
        const anchor = Math.max(at, p.duration * RELOAD_DISCARD_PROGRESS_V163);
        const epsilon = 1e-7;
        const snapshot = { ...a.tacticalReload, elapsed: anchor };
        const speed = (progress({ ...snapshot, elapsed: anchor + epsilon }) - progress(snapshot)) / epsilon;
        near(speed, 1 / p.duration, 1e-4);
      }
      let previous = progress(a.tacticalReload), completions = 0;
      const inventory = a.ammo + a.ammoReserve;
      for (let remaining = a.reloadClock + .2; remaining > 0; remaining -= 1 / 240) {
        const event = updateTacticalReloadV77(a, Math.min(1 / 240, remaining), { weapon: w });
        const next = progress(a.tacticalReload);
        assert.ok(next >= previous - 1e-12 && next >= 0 && next <= 1);
        assert.equal(a.ammo + a.ammoReserve, inventory);
        if (event?.type === 'complete') completions++;
        previous = next;
      }
      assert.equal(completions, 1);
      assert.equal(a.ammo, 19); assert.equal(a.ammoReserve, 0);
      assert.equal(a.reloading, false); near(progress(a.tacticalReload), 1);
    }
  }
});

test('early failed attempts preserve the native discard beat and the original fixed HUD windows', () => {
  const w = named('M41A Pulse Rifle'), a = actor({ ammo: 0 });
  startTacticalReloadV77(a, w);
  const p = a.tacticalReload.profile;
  updateTacticalReloadV77(a, p.duration * .1, { weapon: w });
  pressTacticalReloadV77(a, w);
  for (const fraction of [.1, .2, .349, .35]) {
    const sampled = { ...a.tacticalReload, elapsed: p.duration * fraction };
    near(progress(sampled), fraction);
  }
  const hud = getTacticalReloadHudV77(a);
  assert.equal(hud.result, 'failed'); assert.equal(hud.canAttempt, false);
  near(hud.attemptCursor, .1); assert.deepEqual(hud.successWindow, p.successWindow);
  assert.deepEqual(hud.perfectWindow, p.perfectWindow);
  assert.equal(a.ammo, 0); assert.equal(a.ammoReserve, 90);
});

test('native capture/restore reproduces each service pose without another inventory transfer', () => {
  const w = named('M41A Pulse Rifle');
  for (const mode of ['normal', 'success', 'perfect', 'failed']) {
    const a = actor(); startTacticalReloadV77(a, w);
    const p = a.tacticalReload.profile;
    if (mode !== 'normal') {
      updateTacticalReloadV77(a, p.duration * outcomes[mode], { weapon: w });
      pressTacticalReloadV77(a, w);
    }
    updateTacticalReloadV77(a, .07, { weapon: w });
    const saved = JSON.parse(JSON.stringify(captureTacticalReloadV77(a))), before = pose(a, w);
    const b = actor({ ammo: a.ammo, ammoReserve: a.ammoReserve });
    assert.equal(restoreTacticalReloadV77(b, saved, w), true);
    const after = pose(b, w);
    samePoint(after.support, before.support); samePoint(after.grip, before.grip);
    near(after.reloadProgress, before.reloadProgress);
    assert.deepEqual([b.ammo, b.ammoReserve], [a.ammo, a.ammoReserve]);
    assert.deepEqual(captureTacticalReloadV77(b), saved);
  }
});

test('interruption and changed-weapon guards still cancel real service without consuming ammunition', () => {
  const w = named('M41A Pulse Rifle');
  for (const reason of ['medical-action', 'vent-transit', 'weapon-changed', 'mission-ended']) {
    const a = actor(); startTacticalReloadV77(a, w);
    updateTacticalReloadV77(a, .4, { weapon: w });
    assert.equal(cancelTacticalReloadV77(a, reason), true);
    const held = pose(a, w), hud = getTacticalReloadHudV77(a);
    assert.equal(held.reloading, false); assert.equal(held.reloadPhase, 'idle');
    assert.equal(hud.phase, 'cancelled'); assert.equal(hud.cancelReason, reason);
    assert.deepEqual([a.ammo, a.ammoReserve], [15, 90]);
    assert.equal(updateTacticalReloadV77(a, 99, { weapon: w }), null);
    assert.deepEqual([a.ammo, a.ammoReserve], [15, 90]);
  }
  const a = actor(); startTacticalReloadV77(a, w); a.weaponMode = 'sidearm';
  assert.equal(updateTacticalReloadV77(a, .1, { weapon: 'sidearm' }).reason, 'weapon-changed');
  assert.deepEqual([a.ammo, a.ammoReserve], [15, 90]);
});

test('presentation is pure and malformed or legacy minimalist states remain finite and bounded', () => {
  const w = named('M41A Pulse Rifle'), a = actor(); startTacticalReloadV77(a, w);
  updateTacticalReloadV77(a, .78, { weapon: w }); pressTacticalReloadV77(a, w);
  const before = structuredClone(a.tacticalReload);
  for (let i = 0; i < 20; i++) progress(a.tacticalReload);
  assert.deepEqual(a.tacticalReload, before);
  near(progress({ elapsed: .3, completeAt: 1 }), .3);
  for (const state of [null, {}, { elapsed: NaN, completeAt: 1 }, { elapsed: 1, completeAt: Infinity },
    { elapsed: 1, completeAt: 0 }, { elapsed: -8, completeAt: 1 }, { elapsed: 8, completeAt: 1 }]) {
    const value = progress(state); assert.ok(Number.isFinite(value) && value >= 0 && value <= 1);
  }
});
