import test from 'node:test';
import assert from 'node:assert/strict';
import {
 M41A_UNDERBARREL_HOST_V174,M41A_UNDERBARREL_SOURCE_V174,
 validateUnderbarrelV174,createM41AUnderbarrelV174,setM41AModeV174,
 AFE2_UNDERBARREL_SWAP_V190,switchM41AModeV190,getAFE2UnderbarrelAutoIntentV191,M41A_PROP_LINEAGE_V192,
 fireM41AUnderbarrelV174,pumpM41AUnderbarrelV174,
 beginM41AUnderbarrelReloadV174,advanceM41AUnderbarrelReloadV174,
 cancelM41AUnderbarrelReloadV174,M41AAmmoHudV174,
 captureM41AUnderbarrelV174,restoreM41AUnderbarrelV174
} from '../src/weapon-underbarrel-v174.js';
import { M41A_PULSE_RIFLE_PROFILE_V117 } from '../src/weapon-native-visuals-v117.js';
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

test('V174 forged pending receipts and contradictory pump topology fail without mutation',()=>{
 const state=create(0,0,8);
 assert.equal(setM41AModeV174(state,'launcher','mode'),true);
 assert.equal(beginM41AUnderbarrelReloadV174(state,'reload1'),true);
 for(const prior of ['reload:reload1','cancel:reload1']){
   const forged=structuredClone(state);
   forged.receipts.push(prior);
   const before=structuredClone(forged);
   assert.equal(validateUnderbarrelV174(forged),false,prior);
   assert.equal(restoreM41AUnderbarrelV174(forged),null,prior);
   assert.equal(advanceM41AUnderbarrelReloadV174(forged,'reload1',1),false,prior);
   assert.equal(cancelM41AUnderbarrelReloadV174(forged,'reload1'),false,prior);
   assert.deepEqual(forged,before,'rejected replay cannot mutate any field');
 }
 const progressMismatch=structuredClone(state);
 progressMismatch.pending.progress=.75; // forged progression without insertion
 assert.equal(validateUnderbarrelV174(progressMismatch),false);
 assert.equal(restoreM41AUnderbarrelV174(progressMismatch),null);
 const chamberForgery=create();
 chamberForgery.spent=1;chamberForgery.needsPump=true;chamberForgery.chamber=1;
 assert.equal(validateUnderbarrelV174(chamberForgery),false);
});
test('V174 legitimate partial launcher reload still restores and completes exactly',()=>{
 const s=create(0,0,8);
 assert.equal(setM41AModeV174(s,'launcher','set'),true);
 assert.equal(beginM41AUnderbarrelReloadV174(s,'tx'),true);
 assert.equal(advanceM41AUnderbarrelReloadV174(s,'tx',.5),true);
 const snapshot=captureM41AUnderbarrelV174(s);
 assert.equal(snapshot.pending.inserted,2);
 assert.equal(snapshot.reserve,6);
 const restored=restoreM41AUnderbarrelV174(snapshot,
   {ownerId:'player',instanceId:'player:m41a',expectedTotal:8});
 assert.deepEqual(restored,snapshot);
 assert.equal(advanceM41AUnderbarrelReloadV174(restored,'tx',1),true);
 assert.equal(restored.tube,4);
 assert.equal(restored.reserve,4);
 assert.equal(restored.pending,null);
 assert.equal(validateUnderbarrelV174(restored),true);
 assert.equal(advanceM41AUnderbarrelReloadV174(restored,'tx',1),false);
});

test('V190 AFE2-specific mid-reload mode swap conserves inserted and reserve ammunition',()=>{
 const s=create(0,0,8);
 assert.equal(setM41AModeV174(s,'launcher','enter'),true);
 assert.equal(beginM41AUnderbarrelReloadV174(s,'load'),true);
 assert.equal(advanceM41AUnderbarrelReloadV174(s,'load',.5),true);
 const before=s.tube+s.chamber+s.reserve;
 assert.equal(before,8);
 const receipt=switchM41AModeV190(s,'primary','switch1',{ruleset:'afe2-2026'});
 assert.deepEqual(receipt,{mode:'primary',receipt:'switch1',previousReloadCancelled:true,
   interruptedReload:{receipt:'load',inserted:2,remaining:2},loaded:2,reserve:6,
   sourceScope:'afe2-2026-source-behavior'});
 assert.equal(s.pending,null);
 assert.equal(s.tube+s.chamber+s.reserve,before);
 assert.equal(s.events.filter(e=>e.type==='reload-interrupted'&&e.receipt==='load').length,1);
 assert.equal(s.events.filter(e=>e.type==='mode-switched'&&e.receipt==='switch1').length,1);
 assert.equal(advanceM41AUnderbarrelReloadV174(s,'load',1),false);
 assert.equal(beginM41AUnderbarrelReloadV174(s,'load'),false);
 assert.equal(validateUnderbarrelV174(s),true);
 const restored=restoreM41AUnderbarrelV174(captureM41AUnderbarrelV174(s),
   {ownerId:'player',instanceId:'player:m41a',expectedTotal:8});
 assert.deepEqual(restored,s);
 assert.equal(switchM41AModeV190(restored,'launcher','switch2',{ruleset:'afe2-2026'})?.loaded,2);
 assert.equal(restored.tube+restored.chamber+restored.reserve,8);
});

test('V190 legacy/film fire-mode rule does not cancel a native pending reload',()=>{
 const s=create(0,0,6);
 assert.equal(setM41AModeV174(s,'launcher','selected'),true);
 assert.equal(beginM41AUnderbarrelReloadV174(s,'r1'),true);
 assert.equal(advanceM41AUnderbarrelReloadV174(s,'r1',.5),true);
 const before=structuredClone(s);
 assert.equal(switchM41AModeV190(s,'primary','swap'),null);
 assert.deepEqual(s,before,'no cancellation without the explicit AFE2 contract');
 assert.equal(switchM41AModeV190(s,'primary','swap',{ruleset:'unknown'}),null);
 assert.deepEqual(s,before);
 assert.equal(setM41AModeV174(s,'primary','swap'),false);
 assert.equal(advanceM41AUnderbarrelReloadV174(s,'r1',1),true);
 assert.equal(switchM41AModeV190(s,'primary','swap')?.previousReloadCancelled,false);
 assert.equal(s.pending,null);
});

test('V190 invalid or replayed mode requests never alter rounds or transactional receipts',()=>{
 const s=create(0,0,8);
 assert.equal(setM41AModeV174(s,'launcher','enter'),true);
 assert.equal(beginM41AUnderbarrelReloadV174(s,'part'),true);
 assert.equal(advanceM41AUnderbarrelReloadV174(s,'part',.25),true);
 const snapshot=structuredClone(s);
 for(const [mode,receipt,options] of [
   ['primary','x'.repeat(88),{ruleset:'afe2-2026'}],
   ['launcher','wrong',{ruleset:'afe2-2026'}],
   ['primary','same',{ruleset:'tantalus'}],
   ['forged','wrong',{ruleset:'afe2-2026'}]
 ]){assert.equal(switchM41AModeV190(s,mode,receipt,options),null);assert.deepEqual(s,snapshot);}
 assert.ok(switchM41AModeV190(s,'primary','accepted',{ruleset:'afe2-2026'}));
 const committed=structuredClone(s);
 assert.equal(switchM41AModeV190(s,'primary','accepted',{ruleset:'afe2-2026'}),null);
 assert.deepEqual(s,committed);
 const forged=structuredClone(snapshot);forged.pending.inserted=4;
 assert.equal(switchM41AModeV190(forged,'primary','illegal',{ruleset:'afe2-2026'}),null);
 assert.equal(forged.pending.inserted,4,'invalid forged state was not patched');
});

test('V190 AFE2 rule carries official source scope but does not assert visual 1:1',()=>{
 assert.equal(AFE2_UNDERBARREL_SWAP_V190.sourceWork,'Aliens: Fireteam Elite 2 (2026)');
 assert.match(AFE2_UNDERBARREL_SWAP_V190.sourceUrl,/daybreakgames\.com.*91726-patchnotes/);
 assert.equal(AFE2_UNDERBARREL_SWAP_V190.playableInTantalus,false);
 assert.equal(AFE2_UNDERBARREL_SWAP_V190.exactVisuals,false);
 const state=create();
 assert.equal(switchM41AModeV190(state,'launcher','ordinary')?.previousReloadCancelled,false);
});

test('V191 AFE2 automatic selection requires an actually chambered alternate round',()=>{
 const s=createM41AUnderbarrelV174({ownerId:'p',weaponInstanceId:'p:m41a',
  tube:0,chamber:1,reserve:0,capacity:4,mode:'primary'});
 const source=structuredClone(s);
 assert.deepEqual(getAFE2UnderbarrelAutoIntentV191(s,{primaryLoaded:0,
   autoSwitchWhenEmpty:true}),{action:'switch',mode:'launcher',
   reason:'primary-empty-launcher-chambered'});
 assert.deepEqual(getAFE2UnderbarrelAutoIntentV191(s,{primaryLoaded:0,
   autoSwitchWhenEmpty:false}),{action:'none',mode:'primary',reason:'no-authorized-auto-action'});
 assert.deepEqual(s,source,'decision must not fire or change active fire mode');
 assert.equal(switchM41AModeV190(s,'launcher','auto-accepted')?.mode,'launcher');
 assert.deepEqual(getAFE2UnderbarrelAutoIntentV191(s,{primaryLoaded:8,
   autoSwitchWhenEmpty:true}).action,'none');
 assert.ok(fireM41AUnderbarrelV174(s,'one'));
 assert.deepEqual(getAFE2UnderbarrelAutoIntentV191(s,{primaryLoaded:8,
   autoSwitchWhenEmpty:true}),{action:'switch',mode:'primary',
   reason:'launcher-empty-primary-ready'});
});

test('V191 unchambered tube demands real pumping, never a phantom automatic shot',()=>{
 const s=create(2,1,0);
 assert.equal(setM41AModeV174(s,'launcher','enter'),true);
 fireM41AUnderbarrelV174(s,'fire1');
 assert.equal(s.needsPump,true);
 assert.deepEqual(getAFE2UnderbarrelAutoIntentV191(s,{primaryLoaded:0,
   autoSwitchWhenEmpty:true,autoReload:true}),{action:'none',mode:'launcher',
   reason:'manual-pump-required'});
 assert.equal(s.tube,2);
 assert.ok(pumpM41AUnderbarrelV174(s,'pump1'));
 assert.equal(s.chamber,1);
 const before=structuredClone(s);
 const pending=getAFE2UnderbarrelAutoIntentV191(s,{primaryLoaded:0,
   autoSwitchWhenEmpty:true});
 assert.equal(pending.action,'none','do not switch away from a ready active launcher');
 assert.deepEqual(s,before);
});

test('V191 automatic reload suggestion cannot invent ammunition or skip pending transfer',()=>{
 const s=create(0,0,3);
 assert.equal(setM41AModeV174(s,'launcher','enter'),true);
 assert.deepEqual(getAFE2UnderbarrelAutoIntentV191(s,{primaryLoaded:0,
   autoReload:true}),{action:'reload',mode:'launcher',reason:'launcher-reserve-available'});
 assert.equal(beginM41AUnderbarrelReloadV174(s,'pending'),true);
 const saved=structuredClone(s);
 assert.deepEqual(getAFE2UnderbarrelAutoIntentV191(s,{primaryLoaded:0,
   autoSwitchWhenEmpty:true,autoReload:true}),{action:'none',reason:'reload-in-progress',mode:'launcher'});
 assert.deepEqual(s,saved);
 assert.equal(cancelM41AUnderbarrelReloadV174(s,'pending'),true);
 assert.equal(s.tube+s.chamber+s.reserve,3);
 const blank=create(0,0,0);
 assert.deepEqual(getAFE2UnderbarrelAutoIntentV191(blank,{primaryLoaded:0,
   primaryReserve:0,autoSwitchWhenEmpty:true,autoReload:true}),{
   action:'none',mode:'primary',reason:'both-feeds-empty'});
 assert.equal(getAFE2UnderbarrelAutoIntentV191(blank,{primaryLoaded:-1}),null);
 assert.equal(getAFE2UnderbarrelAutoIntentV191(blank,{primaryLoaded:0,autoReload:'yes'}),null);
});

test('V192 film-reference prop lineage is separate from optional AFE2 gameplay and current art',()=>{
 const p=M41A_PROP_LINEAGE_V192;
 assert.equal(p.primaryFilm,'Aliens (1986)');
 assert.equal(p.laterFilm,'Alien 3 (1992)');
 assert.match(p.evidence,/royalarmouries\.org/);
 assert.equal(p.laterReusedOrRefurbished,true);
 assert.equal(p.internalLauncherOnAllProps,false);
 assert.equal(p.ammoCounterOnAllProps,false);
 assert.equal(p.filmedRevisionPaintVerified,false);
 assert.equal(p.nativeTantalusArt1to1Verified,false);
 const inGame=M41A_PULSE_RIFLE_PROFILE_V117;
 assert.equal(inGame.catalogId,'weapon-001');
 assert.equal(inGame.sourceWork,'Aliens (1986)');
 assert.equal(inGame.visualMode,'static-pose');
 assert.equal(inGame.animationStatus,'missing');
 assert.equal(inGame.canonExact,false);
 assert.equal(inGame.approximate,true);
 assert.equal(inGame.legacyAnimation.sheetId,'weapon.m41a-pulse-rifle.action');
 // Checking metadata cannot be substituted for inspecting the real PNG,
 // comparing primary source views and watching the live rig animate.
 assert.equal(AFE2_UNDERBARREL_SWAP_V190.exactVisuals,false);
});
