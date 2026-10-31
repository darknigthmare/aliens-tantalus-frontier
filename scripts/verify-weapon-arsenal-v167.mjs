import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLegacyWeaponFeedV167, validateWeaponFeedV167, weaponFeedCarriedRoundsV167,
  weaponFeedLoadedRoundsV167, weaponFeedReserveRoundsV167, spendAcceptedRoundV167,
  beginWeaponReloadV167, advanceWeaponReloadV167, cancelWeaponReloadV167,
  captureWeaponFeedV167, restoreWeaponFeedV167
} from '../src/weapon-magazine-inventory-v167.js';
import {
  createWeaponMasteryV167, awardAcceptedWeaponDamageV167, requiredWeaponXpV167,
  weaponLevelFromXpV167, captureWeaponMasteryV167, restoreWeaponMasteryV167,
  weaponMasterySummaryV167
} from '../src/weapon-mastery-v167.js';
import {
  startTacticalReloadV77, updateTacticalReloadV77, cancelTacticalReloadV77,
  captureTacticalReloadV77, restoreTacticalReloadV77
} from '../src/tactical-reload-v77.js';

const rifle = { id: 'weapon-001-m41a-pulse-rifle', name: 'M41A Pulse Rifle', family: 'ballistic', reload: 1.45 };
const owner = (ammo = 12, reserve = 38) => ({ alive: true, downed: false, inVehicle: false,
  ventTransit: false, weaponMode: 'rifle', magazineSize: 30, ammo, ammoReserve: reserve });
const feed = (ammo = 12, reserve = 38) => createLegacyWeaponFeedV167({
  weaponId: rifle.id, ownerId: 'player', ammoTypeId: '10x24-caseless',
  magazineSize: 30, ammo, reserve, feed: 'box' });
const allRounds = f => f.chamber + f.looseRounds + f.magazines.reduce((sum, m) => sum + m.rounds, 0);

test('P0: legacy numeric ammunition is conserved and split into physical magazines', () => {
  const f = feed(12, 1000);
  assert.equal(validateWeaponFeedV167(f), true);
  assert.equal(weaponFeedLoadedRoundsV167(f), 12);
  assert.equal(weaponFeedReserveRoundsV167(f), 1000);
  assert.equal(weaponFeedCarriedRoundsV167(f), 1012);
  assert.ok(f.magazines.every(m => m.rounds <= m.capacity));
  assert.equal(f.chamber, 0);
});

test('P0: accepted shot spends exactly one round; replay and dry fire spend none', () => {
  const f = feed(3, 0);
  assert.equal(spendAcceptedRoundV167(f, 'shot1'), true);
  assert.equal(weaponFeedLoadedRoundsV167(f), 2);
  assert.equal(spendAcceptedRoundV167(f, 'shot1'), false);
  assert.equal(weaponFeedLoadedRoundsV167(f), 2);
  assert.equal(spendAcceptedRoundV167(f, 'shot2'), true);
  assert.equal(spendAcceptedRoundV167(f, 'shot3'), true);
  assert.equal(spendAcceptedRoundV167(f, 'shot4'), false);
  assert.equal(weaponFeedCarriedRoundsV167(f), 0);
});

test('P0: tactical reload cancellation after ejection preserves every round', () => {
  const f = feed();
  assert.equal(beginWeaponReloadV167(f, null, 'tactical'), true);
  const tx = f.reload.id, previous = allRounds(f);
  assert.equal(advanceWeaponReloadV167(f, tx, .4), true);
  assert.equal(f.mountedMagazineId, null);
  assert.equal(cancelWeaponReloadV167(f, tx), true);
  assert.equal(f.reload, null);
  assert.equal(allRounds(f), previous);
  assert.equal(weaponFeedCarriedRoundsV167(f), previous);
  assert.equal(beginWeaponReloadV167(f, tx, 'tactical'), false);
});

test('P0: speed reload drops a real partly loaded magazine instead of refunding it', () => {
  const f = feed();
  const original = f.mountedMagazineId, previous = allRounds(f);
  assert.equal(beginWeaponReloadV167(f, null, 'speed'), true);
  const tx = f.reload.id;
  assert.equal(advanceWeaponReloadV167(f, tx, .8), true);
  assert.equal(f.magazines.find(m => m.id === original).location, 'world');
  assert.equal(advanceWeaponReloadV167(f, tx, 1), true);
  assert.equal(allRounds(f), previous);
  assert.equal(weaponFeedCarriedRoundsV167(f), previous - 12);
  assert.equal(advanceWeaponReloadV167(f, tx, 1), false);
});

test('P0: reload phase markers are monotonic, unique and survive exact restoration', () => {
  const f = feed();
  assert.equal(beginWeaponReloadV167(f, null), true);
  const tx = f.reload.id;
  assert.equal(advanceWeaponReloadV167(f, tx, .4), true);
  const snapshot = captureWeaponFeedV167(f);
  const restored = restoreWeaponFeedV167(snapshot, { ownerId: 'player', expectedCarriedRounds: 50 });
  assert.ok(restored);
  assert.equal(advanceWeaponReloadV167(restored, tx, .3), false);
  assert.equal(advanceWeaponReloadV167(restored, tx, .8), true);
  assert.equal(advanceWeaponReloadV167(restored, tx, .95), true);
  assert.equal(advanceWeaponReloadV167(restored, tx, 1), true);
  assert.equal(validateWeaponFeedV167(restored), true);
  assert.equal(allRounds(restored), 50);
});

test('P0: corrupt or cross-owner snapshots cannot be restored', () => {
  const snapshot = captureWeaponFeedV167(feed());
  assert.equal(restoreWeaponFeedV167(snapshot, { ownerId: 'coop' }), null);
  assert.equal(restoreWeaponFeedV167(snapshot, { expectedCarriedRounds: 123 }), null);
  const forged = structuredClone(snapshot);
  forged.magazines[1].id = forged.magazines[0].id;
  assert.equal(restoreWeaponFeedV167(forged), null);
  const forged2 = structuredClone(snapshot);
  forged2.magazines[0].rounds = 1000;
  assert.equal(restoreWeaponFeedV167(forged2), null);
});


test('V194: long accepted-shot identity is rejected BEFORE spending or recording false success', () => {
  const f = feed(3, 0);
  const before = structuredClone(f);
  const tooLong = 's'.repeat(156); // valid as input, invalid after shot: prefix
  assert.equal(spendAcceptedRoundV167(f, tooLong), false);
  assert.deepEqual(f, before, 'failed receipt must not consume a physical round');
  const boundary = 's'.repeat(155);
  assert.equal(spendAcceptedRoundV167(f, boundary), true);
  assert.equal(weaponFeedLoadedRoundsV167(f), 2);
  assert.ok(f.receipts.includes('shot:' + boundary));
  const restored = restoreWeaponFeedV167(captureWeaponFeedV167(f), {
    ownerId: 'player', expectedCarriedRounds: 2
  });
  assert.deepEqual(restored, f);
  assert.equal(spendAcceptedRoundV167(restored, boundary), false);
  assert.equal(weaponFeedLoadedRoundsV167(restored), 2);
});

test('V194: a reload whose terminal receipt cannot be recorded is rejected atomically', () => {
  const f = feed();
  for (const receipt of ['r'.repeat(154), 'r'.repeat(160)]) {
    const before = structuredClone(f);
    assert.equal(beginWeaponReloadV167(f, receipt, 'speed'), false);
    assert.deepEqual(f, before, 'invalid terminal key must not create or move any mag');
  }
  const boundary = 'r'.repeat(153);
  assert.equal(beginWeaponReloadV167(f, boundary, 'tactical'), true);
  const beforeRounds = allRounds(f);
  assert.equal(advanceWeaponReloadV167(f, boundary, 1), true);
  assert.equal(allRounds(f), beforeRounds);
  assert.ok(f.receipts.includes('reload:' + boundary));
  assert.equal(beginWeaponReloadV167(f, boundary), false, 'completed reload is idempotent');
  const restored = restoreWeaponFeedV167(captureWeaponFeedV167(f), {
    ownerId: 'player', expectedCarriedRounds: beforeRounds
  });
  assert.ok(restored);
  assert.equal(beginWeaponReloadV167(restored, boundary), false);
});

test('V194: long or exhausted generated IDs cannot turn a reserve into a ghost magazine', () => {
  const f = feed(12, 0);
  f.looseRounds = 10;
  f.nextSerial = 10000000;
  assert.equal(validateWeaponFeedV167(f), true);
  const before = structuredClone(f);
  assert.equal(beginWeaponReloadV167(f, null), false);
  assert.deepEqual(f, before, 'serial overflow must not convert loose rounds');
  f.nextSerial = 1;
  f.weaponInstanceId = 'p'.repeat(158);
  assert.equal(validateWeaponFeedV167(f), true);
  const longBefore = structuredClone(f);
  assert.equal(beginWeaponReloadV167(f, 'short'), false);
  assert.deepEqual(f, longBefore, 'oversized derived magazine ID must never mutate state');

  const g = feed(12, 38);
  g.nextTransactionSerial = 10000000;
  assert.equal(validateWeaponFeedV167(g), true);
  const original = structuredClone(g);
  assert.equal(beginWeaponReloadV167(g, null), false);
  assert.deepEqual(g, original, 'auto transaction serial overflow must reject without changes');
});

test('V194: impossible saved phase timing and terminal-receipt contradictions cannot be restored', () => {
  const f = feed();
  assert.equal(beginWeaponReloadV167(f, 'phase'), true);
  for (const [progress, phase] of [[0.8, 'inserted'], [0.95, 'chambered']]) {
    assert.equal(advanceWeaponReloadV167(f, 'phase', progress), true);
    const bad = structuredClone(f);
    bad.reload.progress = phase === 'inserted' ? 0.2 : 0.6;
    assert.equal(validateWeaponFeedV167(bad), false);
    assert.equal(captureWeaponFeedV167(bad), null);
    assert.equal(restoreWeaponFeedV167(bad), null);
    const unchanged = structuredClone(bad);
    assert.equal(advanceWeaponReloadV167(bad, 'phase', 1), false);
    assert.deepEqual(bad, unchanged);
  }
  const wrongReceipt = structuredClone(f);
  wrongReceipt.receipts.push('cancel:phase');
  assert.equal(validateWeaponFeedV167(wrongReceipt), false,
    'pending transaction cannot already be marked cancelled');
  const completedReceipt = structuredClone(f);
  completedReceipt.receipts.push('reload:phase');
  assert.equal(validateWeaponFeedV167(completedReceipt), false,
    'pending transaction cannot already be marked completed');
  assert.equal(cancelWeaponReloadV167(f, 'phase'), true);
  assert.ok(f.receipts.includes('cancel:phase'));
  assert.equal(beginWeaponReloadV167(f, 'phase'), false);
});

test('P0: V77 physical transaction can resume halfway with ammunition conservation', () => {
  const actor = owner();
  actor.weaponFeedV167 = feed();
  assert.equal(startTacticalReloadV77(actor, rifle), true);
  assert.ok(actor.tacticalReload.weaponReloadIdV167);
  assert.equal(updateTacticalReloadV77(actor, .6, { weapon: rifle }), null);
  assert.equal(actor.ammo, 0);
  assert.equal(actor.ammoReserve, 50);
  const payload = captureTacticalReloadV77(actor);
  const resumed = owner(actor.ammo, actor.ammoReserve);
  resumed.weaponFeedV167 = restoreWeaponFeedV167(captureWeaponFeedV167(actor.weaponFeedV167),
    { ownerId: 'player', expectedCarriedRounds: 50 });
  assert.equal(restoreTacticalReloadV77(resumed, payload, rifle), true);
  const completed = updateTacticalReloadV77(resumed, 2, { weapon: rifle });
  assert.equal(completed?.type, 'complete');
  assert.equal(weaponFeedCarriedRoundsV167(resumed.weaponFeedV167), 50);
  assert.equal(resumed.ammo, weaponFeedLoadedRoundsV167(resumed.weaponFeedV167));
  assert.equal(resumed.ammoReserve, weaponFeedReserveRoundsV167(resumed.weaponFeedV167));
});

test('P0: legacy V77 reloading is unchanged when no physical state exists', () => {
  const actor = owner(5, 15);
  assert.equal(startTacticalReloadV77(actor, rifle), true);
  assert.equal(Object.hasOwn(actor.tacticalReload, 'weaponReloadIdV167'), false);
  const result = updateTacticalReloadV77(actor, 3, { weapon: rifle });
  assert.equal(result?.type, 'complete');
  assert.equal(actor.ammo, 20);
  assert.equal(actor.ammoReserve, 0);
});

test('P0: mastery only awards accepted damage and rejects repeated receipts', () => {
  const ledger = createWeaponMasteryV167();
  const action = { ownerId: 'player', weaponId: rifle.id, receiptId: 'bullet:1',
    targetId: 'enemy-1', appliedDamage: 20 };
  assert.equal(awardAcceptedWeaponDamageV167(ledger, action)?.gained, 5);
  assert.equal(awardAcceptedWeaponDamageV167(ledger, action), null);
  assert.equal(awardAcceptedWeaponDamageV167(ledger, { ...action, targetId: 'enemy-2', appliedDamage: 0 }), null);
  assert.equal(awardAcceptedWeaponDamageV167(ledger, { ...action, ownerId: 'enemy' }), null);
  assert.equal(ledger.entries[0].xp, 5);
});

test('P0: mastery restores exact XP and prevents replay after save/load', () => {
  const ledger = createWeaponMasteryV167();
  const action = { ownerId: 'coop', weaponId: rifle.id, receiptId: 'shot:15',
    targetId: 'enemy-42', appliedDamage: 100 };
  awardAcceptedWeaponDamageV167(ledger, action);
  const state = restoreWeaponMasteryV167(captureWeaponMasteryV167(ledger));
  assert.equal(awardAcceptedWeaponDamageV167(state, action), null);
  assert.equal(weaponMasterySummaryV167(state, 'coop', rifle.id)?.xp, 25);
  assert.equal(weaponMasterySummaryV167(state, 'player', rifle.id)?.xp, 0);
});

test('P0: XP thresholds and capped 30-level mastery match the workbook contract', () => {
  assert.equal(requiredWeaponXpV167(1), 100);
  assert.equal(requiredWeaponXpV167(2), 273);
  assert.equal(requiredWeaponXpV167(30), 0);
  assert.equal(weaponLevelFromXpV167(0), 1);
  assert.equal(weaponLevelFromXpV167(100), 2);
  assert.equal(weaponLevelFromXpV167(1e9), 30);
  const tampered = createWeaponMasteryV167();
  tampered.entries.push({ ownerId: 'player', weaponId: rifle.id, level: 30, xp: -1, hitCount: 3 });
  assert.equal(restoreWeaponMasteryV167(tampered).entries.length, 0);
});
