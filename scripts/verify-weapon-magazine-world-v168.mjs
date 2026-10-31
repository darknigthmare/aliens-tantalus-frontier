import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLegacyWeaponFeedV167, weaponFeedCarriedRoundsV167, weaponFeedLoadedRoundsV167,
  weaponFeedReserveRoundsV167, beginWeaponReloadV167, advanceWeaponReloadV167
} from '../src/weapon-magazine-inventory-v167.js';
import { startTacticalReloadV77, updateTacticalReloadV77, cancelTacticalReloadV77 } from '../src/tactical-reload-v77.js';
import {
  validateMagazineWorldV168, stampEjectedMagazinesV168, visibleDroppedMagazinesV168,
  nearestDroppedMagazineV168, recoverDroppedMagazineV168,
  captureMagazineFeedV168, restoreMagazineFeedV168
} from '../src/weapon-magazine-world-v168.js';
import { withMagazineRecoveryWorldV168 } from '../src/weapon-magazine-recovery-runtime-v168.js';

const rifle = { id: 'weapon-001-m41a-pulse-rifle', name: 'M41A Pulse Rifle',
  family: 'ballistic', reload: 1.45 };
const make = (ownerId = 'player', ammo = 12, reserve = 38) => createLegacyWeaponFeedV167({
  weaponId: rifle.id, ownerId, ammoTypeId: 'caseless-gameplay', feed: 'box',
  magazineSize: 30, ammo, reserve
});
const actor = feed => ({ alive: true, downed: false, inVehicle: false,
  ventTransit: false, weaponMode: 'rifle', magazineSize: 30, shots: 0,
  ammo: weaponFeedLoadedRoundsV167(feed), ammoReserve: weaponFeedReserveRoundsV167(feed),
  weaponFeedV167: feed, x: 100, y: 200, w: 30, h: 60, facing: 1 });
const stamp = (feed, levelId = 'room-a') => stampEjectedMagazinesV168(feed,
  { ownerId: feed.ownerId, levelId, x: 120, y: 260, plane: 'gameplay' });
const drop = feed => {
  assert.equal(beginWeaponReloadV167(feed, null, 'speed'), true);
  const id = feed.reload.id;
  assert.equal(advanceWeaponReloadV167(feed, id, .4), true);
  return id;
};

test('V168: no world drop before an accepted ejection marker', () => {
  const f = make();
  assert.equal(beginWeaponReloadV167(f, null, 'speed'), true);
  assert.equal(stamp(f), 0);
  assert.equal(visibleDroppedMagazinesV168(f, 'room-a').length, 0);
});

test('V168: physical ejection is stamped only once, including after replay', () => {
  const f = make(); drop(f);
  assert.equal(stamp(f), 1);
  assert.equal(stamp(f), 0);
  const snapshot = captureMagazineFeedV168(f);
  assert.ok(snapshot);
  assert.deepEqual(visibleDroppedMagazinesV168(f, 'room-a'),
    visibleDroppedMagazinesV168(restoreMagazineFeedV168(snapshot, { ownerId: 'player', expectedCarriedRounds: 38 }), 'room-a'));
});

test('V168: world positions are validated; missing, forged and cross-owner snapshots fail closed', () => {
  const f = make(); drop(f);
  assert.equal(captureMagazineFeedV168(f), null);
  assert.equal(stamp(f), 1);
  const snapshot = captureMagazineFeedV168(f);
  assert.equal(restoreMagazineFeedV168(snapshot, { ownerId: 'coop' }), null);
  assert.equal(restoreMagazineFeedV168(snapshot, { expectedCarriedRounds: 50 }), null);
  for (const invalid of [null, NaN, Infinity, 'bad']) {
    const copy = structuredClone(snapshot);
    copy.magazines.find(m => m.location === 'world').worldV168.x = invalid;
    assert.equal(restoreMagazineFeedV168(copy), null);
  }
});

test('V168: cannot pick up through a blocked ray, other level or other owner', () => {
  const f = make(); drop(f); stamp(f);
  const m = visibleDroppedMagazinesV168(f, 'room-a')[0];
  const options = { ownerId: 'player', levelId: 'room-a', x: 120, y: 260,
    magazineId: m.id };
  assert.equal(recoverDroppedMagazineV168(f, { ...options, ownerId: 'coop' }), null);
  assert.equal(recoverDroppedMagazineV168(f, { ...options, levelId: 'room-b' }), null);
  assert.equal(recoverDroppedMagazineV168(f, { ...options, x: 999 }), null);
  assert.equal(recoverDroppedMagazineV168(f, { ...options, lineOfSight: () => false }), null);
  assert.equal(m.rounds, 12);
});

test('V168: one pickup transfers exact surviving rounds, no phantom/duplicate', () => {
  const f = make(), total = weaponFeedCarriedRoundsV167(f);
  drop(f); stamp(f);
  assert.equal(weaponFeedCarriedRoundsV167(f), total - 12);
  const m = visibleDroppedMagazinesV168(f, 'room-a')[0];
  const opt = { ownerId: 'player', levelId: 'room-a', x: 120, y: 260, magazineId: m.id };
  const got = recoverDroppedMagazineV168(f, opt);
  assert.equal(got.rounds, 12);
  assert.equal(weaponFeedCarriedRoundsV167(f), total);
  assert.equal(recoverDroppedMagazineV168(f, opt), null);
  assert.equal(visibleDroppedMagazinesV168(f, 'room-a').length, 0);
});

test('V195: revision-bound pickup cannot destroy an existing physical magazine',()=>{
  const f=make(); drop(f); stamp(f);
  const m=f.magazines.find(row=>row.location==='world');
  m.revision=10000000;
  const args={ownerId:'player',levelId:'room-a',x:120,y:260,magazineId:m.id};
  assert.equal(validateMagazineWorldV168(f,{requirePosition:true}),true);
  const before=structuredClone(f);
  assert.equal(recoverDroppedMagazineV168(f,args),null);
  assert.deepEqual(f,before,'overflow refusal is atomic: no inventory moves or receipt');
  assert.equal(visibleDroppedMagazinesV168(f,'room-a').length,1);
  assert.ok(captureMagazineFeedV168(f),'the refused pickup remains a valid save');
  m.revision=9999999;
  const success=recoverDroppedMagazineV168(f,args);
  assert.equal(success?.rounds,12);
  assert.equal(m.revision,10000000);
  assert.equal(validateMagazineWorldV168(f,{requirePosition:true}),true);
  const stored=captureMagazineFeedV168(f);
  assert.deepEqual(restoreMagazineFeedV168(stored,{ownerId:'player',
    expectedCarriedRounds:50}),stored);
  assert.equal(recoverDroppedMagazineV168(f,args),null);
});

test('V168: speed-reload policy is exercised through native V77, no numeric ammo printing', () => {
  const f = make(), p = actor(f);
  p.reloadPolicyV168 = 'speed';
  assert.equal(startTacticalReloadV77(p, rifle), true);
  delete p.reloadPolicyV168;
  assert.equal(p.weaponFeedV167.reload.policy, 'speed');
  assert.equal(updateTacticalReloadV77(p, .6, { weapon: rifle }), null);
  assert.equal(stamp(p.weaponFeedV167), 1);
  assert.equal(weaponFeedCarriedRoundsV167(p.weaponFeedV167), 38);
  const event = updateTacticalReloadV77(p, 3, { weapon: rifle });
  assert.equal(event?.type, 'complete');
  assert.equal(p.ammo, weaponFeedLoadedRoundsV167(p.weaponFeedV167));
  assert.equal(p.ammoReserve, weaponFeedReserveRoundsV167(p.weaponFeedV167));
  assert.equal(stamp(p.weaponFeedV167), 0);
});

test('V168: cancelling a speed reload after ejection preserves a recoverable magazine', () => {
  const f = make(), p = actor(f);
  p.reloadPolicyV168 = 'speed';
  assert.equal(startTacticalReloadV77(p, rifle), true);
  assert.equal(updateTacticalReloadV77(p, .6, { weapon: rifle }), null);
  assert.equal(cancelTacticalReloadV77(p, 'interrupt'), true);
  assert.equal(stamp(f), 1);
  const m = visibleDroppedMagazinesV168(f, 'room-a')[0];
  assert.equal(recoverDroppedMagazineV168(f, { ownerId: 'player',
    levelId: 'room-a', x: 120, y: 260, magazineId: m.id }).rounds, 12);
  assert.equal(weaponFeedCarriedRoundsV167(f), 50);
});

test('V168: world feed rejects invalid locations and never silently moves magazines', () => {
  const f = make(); drop(f); stamp(f);
  const m = f.magazines.find(x => x.location === 'world');
  m.location = 'inventory';
  assert.equal(validateMagazineWorldV168(f), false);
  assert.equal(captureMagazineFeedV168(f), null);
});

test('V168: nearest pickup selects the physically closest and does not invent labels', () => {
  const f = make(); drop(f); stamp(f);
  const nearby = nearestDroppedMagazineV168(f, { ownerId: 'player', levelId: 'room-a', x: 120, y: 260 });
  assert.equal(nearby.rounds, 12);
  assert.equal(nearby.distance, 0);
  assert.equal(nearestDroppedMagazineV168(f, { ownerId: 'player', levelId: 'room-a', x: 120, y: 260,
    lineOfSight: () => false }), null);
});

test('V168: production mixin can recover, mirror counts and emit one receipt without changing base interactions', () => {
  class Base {
    reload(a) { return startTacticalReloadV77(a, rifle); }
    advancePlayerReloadV77(a, d) { return updateTacticalReloadV77(a, d, { weapon: rifle }); }
    captureResumeState() { return { player: {} }; }
    interact() { return false; }
    getInteractionPrompt() { return 'S  COUVERTURE · F  TIR · R  RECHARGER'; }
    drawWorld() { return 1; }
  }
  const f = make(), p = actor(f), events = [];
  const engine = new (withMagazineRecoveryWorldV168(Base))();
  Object.assign(engine, { player: p, mission: { id: 'room-a' }, coopEnabled: false,
    canPerformGameplayAction: () => true, onEvent: event => events.push(event) });
  assert.equal(engine.speedReloadWeaponV168(p), true);
  assert.equal(engine.advancePlayerReloadV77(p, .6), null);
  const m = visibleDroppedMagazinesV168(f, 'room-a')[0];
  assert.ok(m);
  p.reloading = false;
  p.tacticalReload = null;
  assert.match(engine.getInteractionPrompt(p), /CHARGEUR/);
  assert.equal(engine.interact(p), true);
  assert.equal(events.length, 1);
  assert.equal(events[0].rounds, 12);
  assert.equal(p.ammoReserve, weaponFeedReserveRoundsV167(f));
  assert.equal(engine.interact(p), false);
});

test('V168: existing priority interactions take precedence over magazine pickup', () => {
  class Base { interact() { return 'mission-action'; } }
  const engine = new (withMagazineRecoveryWorldV168(Base))();
  engine.player = actor(make());
  assert.equal(engine.interact(engine.player), 'mission-action');
});
