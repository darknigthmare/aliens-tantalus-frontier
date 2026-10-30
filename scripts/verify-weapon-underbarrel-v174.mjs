import test from 'node:test';
import assert from 'node:assert/strict';
import {
 M41A_UNDERBARREL_HOST_V174,M41A_UNDERBARREL_SOURCE_V174,
 validateUnderbarrelV174,createM41AUnderbarrelV174,setM41AModeV174,
 fireM41AUnderbarrelV174,pumpM41AUnderbarrelV174,
 beginM41AUnderbarrelReloadV174,advanceM41AUnderbarrelReloadV174,
 cancelM41AUnderbarrelReloadV174,M41AAmmoHudV174,
 captureM41AUnderbarrelV174,restoreM41AUnderbarrelV174
} from '../src/weapon-underbarrel-v174.js';
const create=(tube=3,chamber=1,reserve=8)=>createM41AUnderbarrelV174({
 ownerId:'player',weaponInstanceId:'player:m41a',tube,chamber,reserve,capacity:4
});
test('V174 explicit Royal Armouries M41A model identity, not inventing film capacity',()=>{
 assert.equal(M41A_UNDERBARREL_HOST_V174,'weapon-001-m41a-pulse-rifle');
 assert.match(M41A_UNDERBARREL_SOURCE_V174,/royalarmouries\.org/);
 const state=create();
 assert.equal(state.capacity,4);
 assert.equal(validateUnderbarrelV174(state),true);
 assert.equal(createM41AUnderbarrelV174({ownerId:'p',weaponInstanceId:'id',capacity:0}),null);
});
test('V174 M41A secondary ammunition is independent of main rifle reserve',()=>{
 const s=create();
 const original=M41AAmmoHudV174(s,{primaryLoaded:99,primaryReserve:180});
 assert.equal(original.primary.loaded,99);
 assert.equal(original.launcher.loaded,4);
 assert.equal(setM41AModeV174(s,'launcher','sel'),true);
 const shot=fireM41AUnderbarrelV174(s,'shot1');
 assert.equal(shot?.caliber,'30mm');
 assert.equal(shot?.spentCaseEvidence,'UNVERIFIED_NO_CASING_SPAWN');
 const hud=M41AAmmoHudV174(s,{primaryLoaded:99,primaryReserve:180});
 assert.equal(hud.primary.loaded,99);
 assert.equal(hud.primaryOutOfAmmo,false);
 assert.equal(hud.launcher.needsPump,true);
 assert.equal(hud.launcher.chambered,false);
});
test('V174 one grenade fired, then real pump required; replay cannot spend again',()=>{
 const s=create();
 assert.equal(setM41AModeV174(s,'launcher','sel'),true);
 assert.ok(fireM41AUnderbarrelV174(s,'f'));
 assert.equal(fireM41AUnderbarrelV174(s,'f'),null);
 assert.equal(fireM41AUnderbarrelV174(s,'f2'),null);
 assert.equal(s.tube+s.chamber+s.reserve,11);
 const cycle=pumpM41AUnderbarrelV174(s,'p');
 assert.equal(cycle.chamber,1);
 assert.equal(cycle.tube,2);
 assert.equal(pumpM41AUnderbarrelV174(s,'p'),null);
 assert.equal(s.tube+s.chamber+s.reserve,11);
 assert.ok(fireM41AUnderbarrelV174(s,'f2'));
 assert.equal(s.tube+s.chamber+s.reserve,10);
});
test('V174 partial round-by-round reload survives interruption with no refund',()=>{
 const s=create(0,0,8);
 assert.equal(setM41AModeV174(s,'launcher','sel'),true);
 assert.equal(beginM41AUnderbarrelReloadV174(s,'r'),true);
 assert.equal(advanceM41AUnderbarrelReloadV174(s,'r',.3),true);
 assert.equal(s.tube,1);
 assert.equal(s.reserve,7);
 assert.equal(cancelM41AUnderbarrelReloadV174(s,'r'),true);
 assert.equal(s.tube+s.chamber+s.reserve,8);
 assert.equal(beginM41AUnderbarrelReloadV174(s,'r'),false);
 assert.equal(beginM41AUnderbarrelReloadV174(s,'r2'),true);
 for(const n of [.5,1])assert.equal(advanceM41AUnderbarrelReloadV174(s,'r2',n),true);
 assert.equal(s.tube,4);
 assert.equal(s.reserve,4);
 assert.equal(validateUnderbarrelV174(s),true);
});
test('V174 2 independent HUD counters never mark rifle empty because launcher empty',()=>{
 const s=create(0,0,0);
 assert.equal(setM41AModeV174(s,'launcher','mode'),true);
 const ready=M41AAmmoHudV174(s,{primaryLoaded:25,primaryReserve:96});
 assert.equal(ready.launcher.empty,true);
 assert.equal(ready.launcher.redCounter,true);
 assert.equal(ready.primaryOutOfAmmo,false);
 assert.equal(ready.primary.canFire,true);
 assert.equal(M41AAmmoHudV174(s,{primaryLoaded:0,primaryReserve:96}).primaryOutOfAmmo,true);
});
test('V174 restore validates owner, instance, total count, replay receipts',()=>{
 const s=create();
 assert.equal(setM41AModeV174(s,'launcher','sel'),true);
 fireM41AUnderbarrelV174(s,'shot');
 const snapshot=captureM41AUnderbarrelV174(s);
 const restored=restoreM41AUnderbarrelV174(snapshot,{ownerId:'player',instanceId:'player:m41a',expectedTotal:11});
 assert.deepEqual(restored,snapshot);
 assert.equal(fireM41AUnderbarrelV174(restored,'shot'),null);
 assert.equal(restoreM41AUnderbarrelV174(snapshot,{ownerId:'coop'}),null);
 assert.equal(restoreM41AUnderbarrelV174(snapshot,{expectedTotal:12}),null);
});
test('V174 invalid long receipt cannot corrupt loaded state',()=>{
 const s=create();
 assert.equal(setM41AModeV174(s,'launcher','sel'),true);
 const before=JSON.stringify(s);
 assert.equal(fireM41AUnderbarrelV174(s,'x'.repeat(89)),null);
 assert.equal(JSON.stringify(s),before);
 assert.equal(setM41AModeV174(s,'primary','y'.repeat(88)),false);
 assert.equal(JSON.stringify(s),before);
});
test('V174 reject forged topologies and do not infer sequel models',()=>{
 const s=create();
 const x=structuredClone(s);
 x.hostWeaponId='proposed-l56a3-smartgun';
 assert.equal(validateUnderbarrelV174(x),false);
 x.hostWeaponId=M41A_UNDERBARREL_HOST_V174;
 x.spent=1;x.needsPump=false;
 assert.equal(validateUnderbarrelV174(x),false);
 x.spent=0;x.needsPump=false;
 x.chamber=2;
 assert.equal(validateUnderbarrelV174(x),false);
});
