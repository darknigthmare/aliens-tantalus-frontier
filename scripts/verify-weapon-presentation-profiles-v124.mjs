import assert from 'node:assert/strict';
import test from 'node:test';
import { WEAPONS } from '../src/content-core-v50.js';
import { getWeaponPresentationProfileV124 as profile, WEAPON_PRESENTATION_PROFILES_V124, WEAPON_PRESENTATION_SOURCES_V124 } from '../src/weapon-presentation-profiles-v124.js';

const named = name => WEAPONS.find(weapon => weapon.name === name);

test('every admitted catalogue identity has an immutable presentation with bounded seconds and world pixels', () => {
  assert.equal(WEAPON_PRESENTATION_PROFILES_V124.length, WEAPONS.length);
  assert.equal(new Set(WEAPON_PRESENTATION_PROFILES_V124.map(value => value.weaponId)).size, WEAPONS.length);
  for (const weapon of WEAPONS) {
    const value = profile(weapon);
    assert.equal(value.weaponId, weapon.id);
    assert.equal(value.evidence.catalogueMatch, true);
    assert.equal(value.evidence.canonExact, false);
    assert.ok(Object.isFrozen(value)); assert.ok(Object.isFrozen(value.muzzle)); assert.ok(Object.isFrozen(value.reload));
    assert.ok(value.muzzle.intensity >= 0 && value.muzzle.intensity <= 1);
    assert.ok(value.muzzle.duration >= 0 && value.muzzle.duration < 0.3);
    assert.ok(value.muzzle.radius >= 0 && value.muzzle.radius <= 200);
    assert.ok(value.muzzle.reducedMotionIntensity <= value.muzzle.intensity);
    assert.match(value.muzzle.color, /^#[0-9a-f]{6}$/i);
    if (value.casing) {
      assert.ok(Object.isFrozen(value.casing)); assert.ok(Object.isFrozen(value.casing.size));
      assert.ok(value.casing.size.length > value.casing.size.radius);
      assert.ok(['shot', 'cycle', 'reload'].includes(value.casing.ejectOn));
    }
    for (const key of value.evidence.sourceKeys) assert.ok(WEAPON_PRESENTATION_SOURCES_V124[key]);
  }
});

test('M41A and M56 use sourced caseless ammunition, including every actual catalogue finish', () => {
  for (const weapon of WEAPONS.filter(value => /^(M41A Pulse Rifle|M56 Smartgun)( — |$)/.test(value.name))) {
    const value = profile(weapon.id);
    assert.equal(value.casing, null); assert.equal(value.ammunition, 'caseless');
    assert.equal(value.evidence.status, 'documented-ammunition');
    assert.equal(value.caliber, weapon.name.startsWith('M56') ? '10×28 mm' : '10×24 mm');
    assert.equal(value.muzzle.kind, 'flash'); assert.equal(value.reload.discard, 'magazine');
  }
  assert.equal(profile(named('M56 Smartgun')).reload.feed, 'drum');
  assert.equal(profile(named('M41A Pulse Rifle')).reload.feed, 'box');
});

test('accepted casing classes distinguish pistols, rifles, heavy guns and shotgun hulls', () => {
  const pistol = profile(named('VP70 Combat Pistol'));
  const rifle = profile(named('AM-16 Gruppa'));
  const heavy = profile(named('L59 Minigun'));
  const shotgun = profile(named('Type 76 Auto Shotgun'));
  assert.deepEqual([pistol, rifle, heavy, shotgun].map(value => value.casing.kind), ['pistol', 'rifle', 'heavy', 'shotgun']);
  assert.ok(pistol.casing.size.length < rifle.casing.size.length);
  assert.ok(heavy.casing.size.length > rifle.casing.size.length);
  assert.equal(shotgun.casing.shape, 'shell'); assert.notEqual(shotgun.casing.color, rifle.casing.color);
  assert.equal(shotgun.casing.ejectOn, 'shot'); assert.equal(shotgun.reload.feed, 'box');
  for (const value of [pistol, rifle, heavy, shotgun]) assert.equal(value.caliber, null);
});

test('pump-shotgun ejection belongs to a cycle event and has no discarded box magazine', () => {
  for (const name of ['M37A2 Pump Shotgun', 'M51 Breaching Scattergun']) {
    const value = profile(named(name));
    assert.equal(value.casing.ejectOn, 'cycle'); assert.equal(value.casing.kind, 'shotgun');
    assert.equal(value.casing.delay, 0.18); assert.equal(value.reload.feed, 'tube');
    assert.equal(value.reload.discard, 'none'); assert.equal(value.reload.ejectCount, 0);
  }
});

test('revolvers retain spent cases until reload and never drop a magazine', () => {
  for (const name of ['.357 Magnum Revolver', 'Frontier Revolver']) {
    const value = profile(named(name));
    assert.equal(value.casing.ejectOn, 'reload'); assert.equal(value.reload.discard, 'shell');
    assert.equal(value.reload.feed, 'cylinder'); assert.equal(value.reload.ejectCount, 'spent');
  }
  assert.equal(profile(named('.357 Magnum Revolver')).caliber, '.357 Magnum');
  assert.equal(profile(named('Frontier Revolver')).caliber, null);
});

test('energy weapons and burners cannot eject ballistic cases', () => {
  for (const weapon of WEAPONS.filter(value => ['energy', 'electric', 'sonic', 'flame', 'acid', 'cryo', 'chemical'].includes(value.family))) {
    assert.equal(profile(weapon).casing, null, weapon.name);
    assert.notEqual(profile(weapon).reload.discard, 'magazine', weapon.name);
  }
  assert.equal(profile(named('N79 EVA Laser')).muzzle.kind, 'energy');
  assert.equal(profile(named('N79 EVA Laser')).reload.discard, 'cell');
  assert.equal(profile(named('M240 Incinerator Unit')).muzzle.kind, 'flame');
  assert.equal(profile(named('M240 Incinerator Unit')).reload.discard, 'none');
});

test('X1 exact saved identity keeps its D17 gel impact mechanism rather than a continuous flame jet', () => {
  const value = profile('weapon-171-x1-fireball');
  assert.equal(value.mechanism, 'gel-projectile'); assert.equal(value.muzzle.kind, 'flash');
  assert.equal(value.casing, null); assert.equal(value.evidence.status, 'documented-mechanism');
  const lookalike = profile({ id: 'weapon-999-x1-fireball', name: 'X1 Fireball', family: 'flame' });
  assert.equal(lookalike.mechanism, 'flamethrower');
  assert.equal(lookalike.evidence.catalogueMatch, false); assert.deepEqual(lookalike.evidence.sourceKeys, []);
});

test('arrows, bolts, tools, melee and fluid projectors do not invent gun flashes', () => {
  for (const name of ['Compound Bow', 'Harpoon Gun', 'Bolt Gun', 'Foundry Nailgun', 'Combat Knife', 'Smart Disc', 'Stun Baton', 'Cryo Lance', 'Ripper Acid Projector']) {
    const value = profile(named(name));
    assert.equal(value.casing, null, name); assert.equal(value.muzzle.kind, 'none', name);
    assert.equal(value.muzzle.radius, 0, name); assert.equal(value.muzzle.intensity, 0, name);
  }
  assert.equal(profile(named('Cutting Torch')).muzzle.kind, 'flame');
});

test('rockets and standalone grenades never leave fake rifle cases', () => {
  for (const name of ['M6B Rocket Launcher', 'M83 SADAR', 'M5 RPG', 'M12 RPG', 'M40 HEDP Grenade']) {
    const value = profile(named(name)); assert.equal(value.casing, null); assert.equal(value.reload.discard, 'none');
  }
  assert.equal(profile(named('M40 HEDP Grenade')).muzzle.kind, 'none');
  assert.equal(profile(named('Microburst')).casing.kind, 'heavy');
  assert.equal(profile(named('Microburst')).evidence.status, 'gameplay-approximation');
});

test('exact IDs, names and actual runtime weaponId descriptors resolve to one catalogue profile', () => {
  const weapon = named('M41A Pulse Rifle'), expected = profile(weapon);
  assert.equal(profile(weapon.id), expected); assert.equal(profile('weapon-001'), expected);
  assert.equal(profile(weapon.name), expected); assert.equal(profile({ name: weapon.name }), expected);
  assert.equal(profile({ weaponId: weapon.id, mode: 'rifle', damage: 1 }), expected);
  assert.equal(profile({ catalogId: 'weapon-001' }), expected);
  assert.equal(profile({ id: weapon.id, family: 'energy', caseless: false }), expected);
});

test('unknown numbers, wrong slugs and conflicting names cannot acquire unrelated catalogue evidence', () => {
  for (const id of ['weapon-999-m41a-pulse-rifle', 'weapon-001-wrong-slug', 'weapon-181', 'weapon-191']) {
    const value = profile({ id, name: 'M41A Pulse Rifle', family: 'ballistic' });
    assert.equal(value.evidence.catalogueMatch, false); assert.deepEqual(value.evidence.sourceKeys, []);
    assert.equal(value.caliber, null); assert.equal(value.casing.kind, 'rifle');
  }
  assert.equal(profile('weapon-999-m41a-pulse-rifle').muzzle.kind, 'none');
  assert.equal(profile('weapon-190-type-95-combat-pistol').casing.kind, 'pistol');
});

test('generic modes are conservative, including sentry and APC without assumed case ejection', () => {
  assert.equal(profile('sidearm').casing.kind, 'pistol'); assert.equal(profile({ mode: 'sidearm' }).casing.kind, 'pistol');
  assert.equal(profile({ family: 'ballistic' }).casing.kind, 'rifle');
  for (const source of ['sentry', 'apc-turret', { mode: 'apc-turret', weaponId: named('M41A Pulse Rifle').id }]) {
    const value = profile(source); assert.equal(value.casing, null); assert.equal(value.muzzle.kind, 'flash');
    assert.equal(value.evidence.catalogueMatch, false); assert.equal(value.reload.discard, 'none');
  }
  assert.equal(profile({ family: 'ballistic', caseless: true }).casing, null);
  assert.equal(profile({ family: 'ballistic', ejectsCasings: false }).casing, null);
});

test('reload presentation cannot mutate ammunition or declare unknown calibers', () => {
  const descriptor = { ...named('Type 76 Auto Shotgun'), ammo: 0, ammoReserve: 12 };
  const before = JSON.stringify(descriptor), value = profile(descriptor);
  for (let index = 0; index < 10; index += 1) assert.equal(profile(descriptor), value);
  assert.equal(JSON.stringify(descriptor), before); assert.equal(value.reload.emptyOnly, true);
  assert.equal(value.reload.discardAt, 0.35);
  assert.throws(() => { value.casing.size.length = 999; }, TypeError);
  assert.throws(() => { value.reload.discard = 'none'; }, TypeError);
  for (const source of [null, undefined, 0, [], {}, { family: 'unknown' }]) assert.equal(profile(source).muzzle.kind, 'none');
});
