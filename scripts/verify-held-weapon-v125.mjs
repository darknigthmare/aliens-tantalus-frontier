import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { WEAPONS } from '../src/content-core-v50.js';
import { USER_EQUIPMENT_V95 } from '../src/user-equipment-v95.js';
import { HELD_WEAPON_PROFILES_V125, resolveHeldWeaponProfileV125 as profile } from '../src/held-weapon-profiles-v125.js';
import { getHeldWeaponPoseV125 as pose, drawHeldWeaponV125 as draw, translateHeldWeaponPoseV125 as translate,
  HELD_WEAPON_SURFACE_HEIGHTS_V125 } from '../src/held-weapon-renderer-v125.js';
import { startTacticalReloadV77, updateTacticalReloadV77, cancelTacticalReloadV77 } from '../src/tactical-reload-v77.js';
import { resolvePlayerBodyRigV125, resolvePlayerArmPoseV125 } from '../src/player-body-rig-v125.js';

const named = name => WEAPONS.find(weapon => weapon.name === name);
const actor = overrides => ({ x: 100, y: 200, w: 42, h: 92, facing: 1, alive: true, grounded: true,
  ammo: 0, magazineSize: 30, ammoReserve: 90, weaponMode: 'rifle', ...overrides });
const rig = overrides => ({ eligible: true, ready: true, standingHeight: 112,
  shoulders: { near: { x: 119, y: 221 }, far: { x: 113, y: 222 } },
  neutralGrip: { x: 130, y: 235 }, pouch: { x: 116, y: 250 },
  armLengths: { near: { upper: 18, fore: 19 }, far: { upper: 18, fore: 19 } }, ...overrides });
const approximately = (actual, expected, message = '') => assert.ok(Math.abs(actual - expected) < 1e-8, `${message}: ${actual} != ${expected}`);
const pointAt = (value, pivot) => ({
  x: value.matrix.a * pivot.x * value.profile.sourceWidth + value.matrix.c * pivot.y * value.profile.sourceHeight + value.matrix.e,
  y: value.matrix.b * pivot.x * value.profile.sourceWidth + value.matrix.d * pivot.y * value.profile.sourceHeight + value.matrix.f
});
const equalPoint = (actual, expected) => { approximately(actual.x, expected.x); approximately(actual.y, expected.y); };

test('178 catalogue and 3 admitted user weapons resolve to their full native sources and real PNG dimensions', () => {
  const userWeapons = USER_EQUIPMENT_V95.filter(item => item.kind === 'weapon');
  assert.equal(HELD_WEAPON_PROFILES_V125.length, WEAPONS.length + userWeapons.length);
  const images = new Map();
  for (const weapon of [...WEAPONS, ...userWeapons]) {
    const value = profile(weapon);
    assert.ok(value, weapon.id); assert.equal(value.weaponId, weapon.id);
    assert.equal(value.sourceLayout, 'native-full-canvas'); assert.equal(value.sheetId, null);
    assert.equal(value.evidence.canonExact, false); assert.ok(Object.isFrozen(value));
    for (const key of ['gripPivot', 'muzzlePivot', 'supportPivot', 'reloadPivot', 'ejectionPivot']) {
      if (!value[key]) continue;
      assert.ok(Object.isFrozen(value[key]));
      for (const number of Object.values(value[key])) assert.ok(Number.isFinite(number) && number >= 0 && number <= 1, weapon.id);
    }
    approximately(Math.hypot(value.boreAxis.x, value.boreAxis.y), 1);
    images.set(value.imageKey, value);
  }
  assert.equal(images.size, 75);
  for (const value of images.values()) {
    const bytes = readFileSync(new URL(`..${value.path}`, import.meta.url));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', value.path);
    assert.equal(bytes.readUInt32BE(16), value.sourceWidth, value.path);
    assert.equal(bytes.readUInt32BE(20), value.sourceHeight, value.path);
    const [left, top, right, bottom] = value.alphaBounds;
    assert.ok(left >= 0 && top >= 0 && right <= value.sourceWidth && bottom <= value.sourceHeight);
    assert.ok(right > left && bottom > top);
  }
});

test('strict identity prevents numbered-slug modulo, spoofed images and unknown V95 items', () => {
  for (const source of ['weapon-176-wrong-slug', 'weapon-016-wrong-slug', 'weapon-001', 'M41A Pulse Rifle', 'toString', '__proto__',
    { id: 'weapon-999-anything', name: 'M41A Pulse Rifle', imageKey: 'weaponV117:1' },
    { id: 'weapon-176-wrong-slug', family: 'sidearm' }, { imageKey: 'weaponV117:1', path: '/unreviewed.png' },
    'item-v95-user-invented-gun', ...USER_EQUIPMENT_V95.filter(item => item.kind === 'armor'), null, [], 7]) {
    assert.equal(profile(source), null, JSON.stringify(source));
  }
  const weapon = named('M41A Pulse Rifle');
  assert.equal(profile(weapon.id), profile(weapon));
  assert.equal(profile({ weaponId: weapon.id }), profile(weapon));
  assert.equal(profile({ id: weapon.id, imageKey: 'wrong', family: 'energy' }), profile(weapon));
});

test('the issued sidearm has one explicit M4A3 art assignment without changing catalogue membership', () => {
  const fallback = profile('sidearm');
  assert.equal(fallback.weaponId, named('M4A3 Service Pistol').id);
  assert.equal(fallback.fallbackFor, 'sidearm');
  assert.equal(fallback.evidence.identity, 'explicit-runtime-sidearm-art-assignment');
  assert.equal(profile({ mode: 'sidearm' }), fallback);
  assert.equal(profile({ id: 'sidearm' }), fallback);
  assert.equal(profile(fallback), fallback);
  assert.equal(profile('rifle'), null); assert.equal(profile({ family: 'ballistic' }), null);
  assert.equal(profile({ mode: 'apc-turret', weaponId: named('M41A Pulse Rifle').id }), null);
});

test('missing native pivots are reviewed and fixed deployables never become a handheld rifle', () => {
  for (const name of ['ES-4 Electroshock Pistol', 'Compound Bow', 'Plasma Rifle']) {
    const value = profile(named(name));
    assert.equal(value.evidence.primaryAnchors, 'visually-reviewed-native-pixels-v125');
    assert.ok(value.gripPivot); assert.ok(value.muzzlePivot);
  }
  const bow = profile(named('Compound Bow'));
  assert.equal(bow.sizeAxis, 'height'); assert.equal(bow.type, 'bow'); assert.equal(bow.axisMeaning, 'arrow-rest');
  const sentries = WEAPONS.filter(weapon => weapon.family === 'sentry');
  assert.equal(sentries.length, 4);
  for (const weapon of sentries) {
    const value = profile(weapon);
    assert.equal(value.portable, false); assert.equal(value.portability, 'deployable');
    assert.equal(pose({ actor: actor(), descriptor: weapon }), null);
  }
});

test('horizontal pistol uses its true bore, not a diagonal grip-to-muzzle alignment', () => {
  const value = pose({ actor: actor(), descriptor: named('VP70 Combat Pistol'), aim: { x: 1, y: 0 }, bodyRig: rig() });
  equalPoint(pointAt(value, value.profile.gripPivot), value.grip);
  equalPoint(pointAt(value, value.profile.muzzlePivot), value.muzzle);
  approximately(value.aimX, 1); approximately(value.aimY, 0);
  assert.ok(value.muzzle.y < value.grip.y - 5, 'the muzzle remains visibly above the pistol grip');
  assert.equal(value.support, null); assert.equal(value.serviceHand, null);
  approximately(Math.hypot(value.matrix.a, value.matrix.b), Math.hypot(value.matrix.c, value.matrix.d));
});

test('native left-facing Mark 7 and V95 AcidProto mirror once across horizontal and vertical aims', () => {
  for (const descriptor of [named('Mark 7 Mod 2 CQB Pistol'), 'item-v95-user-engineer-acid-proto']) {
    assert.equal(profile(descriptor).sourceFacing, -1);
    for (const facing of [1, -1]) {
      const body = actor({ facing });
      for (const aim of [{ x: facing, y: 0, facing }, { x: 0, y: -1, facing }, { x: facing, y: 1, facing }]) {
        const value = pose({ actor: body, descriptor, aim });
        assert.equal(value.mirror, facing === 1);
        equalPoint(pointAt(value, value.profile.muzzlePivot), value.muzzle);
        const length = Math.hypot(aim.x, aim.y);
        approximately(value.aimX, aim.x / length); approximately(value.aimY, aim.y / length);
        if (aim.y === 0) assert.ok((value.muzzle.x - value.grip.x) * facing > 0);
      }
    }
  }
});

test('angled Smartgun barrel aligns to all eight directions without changing native proportions', () => {
  for (let sector = 0; sector < 8; sector += 1) {
    const angle = sector * Math.PI / 4, aim = { x: Math.cos(angle), y: Math.sin(angle) };
    const value = pose({ actor: actor({ facing: aim.x < -.1 ? -1 : 1 }), descriptor: named('M56 Smartgun'), aim });
    approximately(value.aimX, aim.x); approximately(value.aimY, aim.y);
    equalPoint(pointAt(value, value.profile.gripPivot), value.grip);
    equalPoint(pointAt(value, value.profile.supportPivot), value.foregrip);
    equalPoint(pointAt(value, value.profile.muzzlePivot), value.muzzle);
    assert.equal(value.ejectionPort, null, 'caseless ammunition does not add a false ejection point');
    const determinant = value.matrix.a * value.matrix.d - value.matrix.b * value.matrix.c;
    approximately(Math.abs(determinant), value.scale ** 2);
  }
});

test('crouch, peek and smaller surfaces move anatomical contacts while preserving weapon size within a surface', () => {
  const descriptor = named('M41A Pulse Rifle');
  const standing = pose({ actor: actor(), descriptor });
  const crouching = pose({ actor: actor({ crouching: true }), descriptor });
  const peeking = pose({ actor: actor({ crouching: true, coverV124: { peeking: true, peekRise: 12 } }), descriptor });
  approximately(standing.scale, crouching.scale); approximately(peeking.scale, crouching.scale);
  assert.ok(crouching.grip.y > standing.grip.y);
  approximately(peeking.grip.y, crouching.grip.y - 12);
  const bioforge = pose({ actor: actor(), descriptor, surface: 'bioforge' });
  approximately(bioforge.scale / standing.scale, HELD_WEAPON_SURFACE_HEIGHTS_V125.bioforge / HELD_WEAPON_SURFACE_HEIGHTS_V125.mission);
  const overridden = pose({ actor: actor({ crouching: true }), descriptor, bodyRig: rig({ standingHeight: 80, poseHeight: 48 }) });
  approximately(overridden.standingHeight, 80);
  approximately(overridden.scale, 80 * profile(descriptor).sizeRatio / (profile(descriptor).alphaBounds[2] - profile(descriptor).alphaBounds[0]));
});

test('actual simulation shot time drives deterministic translation recoil and ignores draw-derived clocks', () => {
  const descriptor = named('M41A Pulse Rifle');
  const body = actor({ weaponRigMotionV125: { weaponId: descriptor.id, shotAt: 5, time: 5.04 },
    v52FireClock: .34, playerPresentationV124: { recoil: 0 } });
  const snapshot = JSON.stringify(body);
  const first = pose({ actor: body, descriptor, timeSeconds: 5.04 });
  const repeated = pose({ actor: body, descriptor, timeSeconds: 5.04 });
  const recovered = pose({ actor: body, descriptor, timeSeconds: 5.2 });
  assert.deepEqual(first, repeated); assert.ok(first.recoil > 0);
  assert.ok(first.grip.x < recovered.grip.x); approximately(first.aimY, recovered.aimY);
  approximately(pose({ actor: body, descriptor, timeSeconds: 5.04, reducedMotion: true }).recoil, 0);
  approximately(pose({ actor: { ...body, weaponRigMotionV125: null }, descriptor, timeSeconds: 5.04 }).recoil, 0);
  approximately(pose({ actor: body, descriptor: named('M4A3 Service Pistol'), timeSeconds: 5.04 }).recoil, 0);
  assert.equal(JSON.stringify(body), snapshot);
});

test('real reload clock drives the service hand, remains frozen during pause and cancels without visual or inventory residue', () => {
  const descriptor = named('M41A Pulse Rifle'), body = actor();
  assert.equal(startTacticalReloadV77(body, descriptor), true);
  updateTacticalReloadV77(body, body.tacticalReload.completeAt * .25, { weapon: descriptor });
  const snapshot = JSON.stringify(body);
  const value = pose({ actor: body, descriptor, bodyRig: rig(), timeSeconds: 20 });
  assert.equal(value.reloadPhase, 'remove'); assert.equal(value.reloading, true);
  equalPoint(value.support, value.reloadPort); equalPoint(value.serviceHand, value.reloadPort);
  equalPoint(pointAt(value, value.profile.muzzlePivot), value.muzzle);
  assert.notEqual(value.aimY, 0); assert.equal(JSON.stringify(body), snapshot);
  updateTacticalReloadV77(body, 10, { weapon: descriptor, paused: true });
  assert.deepEqual(pose({ actor: body, descriptor, bodyRig: rig(), timeSeconds: 20 }), value);
  cancelTacticalReloadV77(body, 'test-interrupted');
  const stopped = pose({ actor: body, descriptor, bodyRig: rig(), timeSeconds: 20 });
  assert.equal(stopped.reloading, false); assert.equal(stopped.reloadPhase, 'idle');
  assert.equal(stopped.serviceHand, null); equalPoint(stopped.support, stopped.foregrip);
  assert.equal(body.ammo, 0); assert.equal(body.ammoReserve, 90);
});

test('pistol reload adds a service hand and pump/revolver gestures retain their distinct feed systems', () => {
  for (const [name, feed, expectedPhase] of [['M4A3 Service Pistol', 'box', 'remove'],
    ['M37A2 Pump Shotgun', 'tube', 'open-loading-port'], ['Frontier Revolver', 'cylinder', 'open-cylinder']]) {
    const descriptor = named(name), body = actor();
    assert.equal(startTacticalReloadV77(body, descriptor), true);
    updateTacticalReloadV77(body, body.tacticalReload.completeAt * .25, { weapon: descriptor });
    const value = pose({ actor: body, descriptor, bodyRig: rig() });
    assert.equal(value.reloadFeed, feed); assert.equal(value.reloadPhase, expectedPhase);
    assert.ok(value.serviceHand); equalPoint(value.support, value.reloadPort);
    if (feed === 'tube') {
      updateTacticalReloadV77(body, body.tacticalReload.completeAt * .15, { weapon: descriptor });
      assert.match(pose({ actor: body, descriptor }).reloadPhase, /shell/);
    }
    assert.equal(body.ammo, 0); assert.equal(body.ammoReserve, 90);
  }
});

test('obstacle retraction translates every contact and the actual draw affine without mutating its input', () => {
  const descriptor = named('Type 76 Auto Shotgun'), body = actor();
  startTacticalReloadV77(body, descriptor);
  updateTacticalReloadV77(body, body.tacticalReload.completeAt * .45, { weapon: descriptor });
  const value = pose({ actor: body, descriptor, bodyRig: rig(), aim: { x: 1, y: -1 } });
  const snapshot = JSON.stringify(value), moved = translate(value, -8, 3);
  for (const key of ['grip', 'support', 'foregrip', 'serviceHand', 'muzzle', 'ejectionPort', 'reloadPort']) {
    assert.ok(value[key], key); equalPoint(moved[key], { x: value[key].x - 8, y: value[key].y + 3 });
  }
  equalPoint(pointAt(moved, moved.profile.muzzlePivot), moved.muzzle);
  approximately(moved.muzzle.pivotX, moved.grip.x); approximately(moved.muzzle.ejectionX, moved.ejectionPort.x);
  approximately(moved.muzzle.reloadY, moved.reloadPort.y); approximately(moved.visibleBounds.width, value.visibleBounds.width);
  approximately(moved.matrix.e, value.matrix.e - 8); approximately(moved.matrix.f, value.matrix.f + 3);
  assert.equal(JSON.stringify(value), snapshot);
});

test('downward heavy-weapon reload keeps the service port and return grip inside actual Echo9 arm reach', () => {
  for (const name of ['M41A Pulse Rifle', 'M37A2 Pump Shotgun', 'M56 Smartgun', 'Heavy Pulse Rifle']) {
    const descriptor = named(name);
    for (const progress of [.25, .72, .90]) {
      const body = actor({ aimingV124: true, reloading: true,
        tacticalReload: { weaponKey: descriptor.id, phase: 'reloading', elapsed: progress, completeAt: 1 } });
      const bodyRig = resolvePlayerBodyRigV125({ actor: body });
      const value = pose({ actor: body, descriptor, bodyRig, aim: { x: 0, y: 1 } });
      const arms = resolvePlayerArmPoseV125(bodyRig, value);
      assert.ok(arms.near.reachError < .001, `${name} near at ${progress}`);
      assert.ok(arms.far.reachError < .001, `${name} service at ${progress}`);
      equalPoint(arms.near.hand, value.grip); equalPoint(arms.far.hand, value.support);
      equalPoint(pointAt(value, value.profile.muzzlePivot), value.muzzle);
    }
  }
});

test('draw uses the full native image and the pose affine; slow, broken and wrong-size images do not substitute', () => {
  const value = pose({ actor: actor(), descriptor: named('M41A Pulse Rifle') });
  const calls = [], ctx = { save: () => calls.push(['save']), restore: () => calls.push(['restore']),
    transform: (...args) => calls.push(['transform', ...args]), drawImage: (...args) => calls.push(['drawImage', ...args]) };
  const image = { complete: true, naturalWidth: value.profile.sourceWidth, naturalHeight: value.profile.sourceHeight };
  assert.equal(draw(ctx, image, value), true);
  assert.deepEqual(calls[1], ['transform', ...['a', 'b', 'c', 'd', 'e', 'f'].map(key => value.matrix[key])]);
  assert.deepEqual(calls[2], ['drawImage', image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight]);
  const completed = calls.length;
  for (const wrong of [null, { ...image, complete: false }, { ...image, naturalWidth: 0 }, { ...image, naturalHeight: 256 }]) {
    assert.equal(draw(ctx, wrong, value), false); assert.equal(calls.length, completed);
  }
  const brokenCtx = { ...ctx, drawImage: () => { throw new Error('decoded source unavailable'); } };
  assert.equal(draw(brokenCtx, image, value), false); assert.equal(calls.at(-1)[0], 'restore');
});

test('incapacity, travel and an occupied tool/action leave no floating held firearm', () => {
  const descriptor = named('M41A Pulse Rifle');
  for (const state of [{ alive: false }, { downed: true }, { inVehicle: true }, { ventTransit: {} }, { climbing: true },
    { grappling: true }, { toolUseClock: .2 }, { interactionClock: .2 }, { meleeClock: .2 },
    { fieldActionV124: { kind: 'medkit', elapsed: 1 } }, { placeableActionV124: { kind: 'deploy' } }]) {
    assert.equal(pose({ actor: actor(state), descriptor }), null, JSON.stringify(state));
  }
  assert.equal(pose({ actor: actor(), descriptor, bodyRig: rig({ eligible: false }) }), null);
  assert.deepEqual(pose({ actor: actor(), descriptor, bodyRig: rig({ ready: false }) }),
    pose({ actor: actor(), descriptor, bodyRig: rig({ ready: true }) }), 'readiness cannot change pure shot geometry');
});
