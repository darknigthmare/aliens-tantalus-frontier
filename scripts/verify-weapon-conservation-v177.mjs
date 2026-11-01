import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import {
  createLegacyWeaponFeedV167, validateWeaponFeedV167, weaponFeedLoadedRoundsV167,
  weaponFeedReserveRoundsV167, weaponFeedCarriedRoundsV167, spendAcceptedRoundV167,
  beginWeaponReloadV167, advanceWeaponReloadV167, captureWeaponFeedV167,
  restoreWeaponFeedV167
} from '../src/weapon-magazine-inventory-v167.js';
import { startTacticalReloadV77, updateTacticalReloadV77, cancelTacticalReloadV77 } from '../src/tactical-reload-v77.js';
import * as world from '../src/weapon-magazine-world-v168.js';
import { withMagazineRecoveryWorldV168 } from '../src/weapon-magazine-recovery-runtime-v168.js';
import { missionV136 } from './forge-native-host-v136.mjs';
import { WEAPONS } from '../src/content.js';

const rifle = { id:'weapon-001-m41a-pulse-rifle', name:'M41A Pulse Rifle', family:'ballistic', reload:1.45 };
const make = ({ammo=12,reserve=38,size=30,feed='box'}={}) => createLegacyWeaponFeedV167({
  weaponId:rifle.id,ownerId:'player',ammoTypeId:'caseless-test',magazineSize:size,ammo,reserve,feed
});
const actor = feed => ({alive:true,downed:false,inVehicle:false,ventTransit:false,
  weaponMode:'rifle',magazineSize:feed.magazineSize,ammo:weaponFeedLoadedRoundsV167(feed),
  ammoReserve:weaponFeedReserveRoundsV167(feed),weaponFeedV167:feed,
  x:100,y:200,w:30,h:60,facing:1});
const mirror = p => {p.ammo=weaponFeedLoadedRoundsV167(p.weaponFeedV167);p.ammoReserve=weaponFeedReserveRoundsV167(p.weaponFeedV167);};

test('V177: migrated loose ammunition remains usable after the bounded magazine pool is exhausted', () => {
  // A one-round test capacity reaches the historical129-container bound
  // without pretending this fixture is the film rifle's magazine capacity.
  let p=actor(make({ammo:0,reserve:200,size:1}));
  const ids=new Set(p.weaponFeedV167.magazines.map(m=>m.id));
  for(let shot=0;shot<200;shot++){
    assert.equal(startTacticalReloadV77(p,rifle),true,'reserve must remain usable at shot '+shot);
    assert.equal(updateTacticalReloadV77(p,3,{weapon:rifle})?.type,'complete');
    assert.equal(spendAcceptedRoundV167(p.weaponFeedV167,'spent:'+shot),true);
    mirror(p);
    assert.equal(weaponFeedCarriedRoundsV167(p.weaponFeedV167),199-shot);
    assert.ok(p.weaponFeedV167.magazines.length<=129);
    assert.ok(p.weaponFeedV167.magazines.every(m=>ids.has(m.id)),'reuse a real empty container');
    if(shot===144){
      const feed=restoreWeaponFeedV167(captureWeaponFeedV167(p.weaponFeedV167),{ownerId:'player',expectedCarriedRounds:55});
      assert.ok(feed);p=actor(feed);
    }
  }
  assert.equal(p.ammo+p.ammoReserve,0);
  assert.equal(validateWeaponFeedV167(p.weaponFeedV167),true);
});

test('V177: shot and reload refusals at serial/revision limits never mutate ammunition', () => {
  for(const revision of [9999999,10000000]){
    const feed=make();feed.magazines.find(m=>m.location==='mounted').revision=revision;
    assert.equal(validateWeaponFeedV167(feed),true);
    const before=structuredClone(feed);
    assert.equal(spendAcceptedRoundV167(feed,'blocked'),false);
    assert.deepEqual(feed,before);
  }
  const feed=make();feed.nextTransactionSerial=10000000;
  const before=structuredClone(feed);
  const selected=feed.magazines.find(m=>m.location==='inventory'&&m.rounds>0);
  assert.equal(beginWeaponReloadV167(feed,null,'tactical',selected.id),false);
  assert.deepEqual(feed,before);
});

test('V177: automatic reload prefers the fullest spare and never reduces loaded ammunition', () => {
  const feed=make({ammo:12,reserve:38}),spares=feed.magazines.filter(m=>m.location==='inventory');
  feed.magazines.splice(1,2,spares[1],spares[0]); // a partial spare appears first
  const total=weaponFeedCarriedRoundsV167(feed);
  assert.equal(beginWeaponReloadV167(feed),true);
  assert.equal(feed.reload.selectedId,spares[0].id,'select30 rounds, not the first8-round spare');
  assert.equal(advanceWeaponReloadV167(feed,feed.reload.id,1),true);
  assert.equal(spendAcceptedRoundV167(feed,'one-shot'),true);
  const before=structuredClone(feed);
  assert.equal(beginWeaponReloadV167(feed),false,'do not swap29 loaded rounds for a12-round spare');
  assert.deepEqual(feed,before);
  const partial=feed.magazines.find(m=>m.location==='inventory'&&m.rounds===12);
  assert.equal(beginWeaponReloadV167(feed,null,'tactical',partial.id),true,'explicit partial selection remains available');
  assert.equal(advanceWeaponReloadV167(feed,feed.reload.id,1),true);
  assert.equal(weaponFeedCarriedRoundsV167(feed),total-1);
});

test('V177: a restored replacement at its revision limit cannot partly eject the old magazine', () => {
  const feed=make();assert.equal(beginWeaponReloadV167(feed),true);
  feed.magazines.find(m=>m.id===feed.reload.selectedId).revision=10000000;
  assert.equal(validateWeaponFeedV167(feed),true);
  const before=structuredClone(feed);
  assert.equal(advanceWeaponReloadV167(feed,feed.reload.id,1),false);
  assert.deepEqual(feed,before);
});

test('V177: prefixed receipts fit the persisted ID boundary before any round is spent', () => {
  const feed=make(),before=structuredClone(feed);
  assert.equal(spendAcceptedRoundV167(feed,'r'.repeat(160)),false);
  assert.deepEqual(feed,before);
  assert.equal(beginWeaponReloadV167(feed,'r'.repeat(160)),false);
  assert.deepEqual(feed,before);
});

function recoveryEngine(feed){
  class Base{
    reload(p){return startTacticalReloadV77(p,rifle);}
    advancePlayerReloadV77(p,d){return updateTacticalReloadV77(p,d,{weapon:rifle});}
    interact(){return false;}
    getInteractionPrompt(){return 'S  COUVERTURE · F  TIR · R  RECHARGER';}
  }
  const engine=new(withMagazineRecoveryWorldV168(Base))();
  Object.assign(engine,{player:actor(feed),mission:{id:'test-room'},coopEnabled:false,
    canPerformGameplayAction:()=>true,events:[]});
  engine.onEvent=e=>engine.events.push(e);return engine;
}
function emptyDrop(){
  const feed=make({ammo:0,reserve:200,size:1}),engine=recoveryEngine(feed),p=engine.player;
  // Exhaust and retain one real magazine, then eject it through V77.
  assert.equal(startTacticalReloadV77(p,rifle),true);
  updateTacticalReloadV77(p,3,{weapon:rifle});
  assert.equal(spendAcceptedRoundV167(feed,'first-shot'),true);mirror(p);
  assert.equal(engine.speedReloadWeaponV168(p),true);
  engine.advancePlayerReloadV77(p,.6);
  assert.equal(cancelTacticalReloadV77(p,'test-interrupt'),true);
  engine.syncMagazineDropsV168(p);
  return {engine,feed,p,drop:feed.magazines.find(m=>m.location==='world')};
}

test('V177: E recovers an empty real magazine as a container without granting a round', () => {
  const {engine,feed,p,drop}=emptyDrop(),total=weaponFeedCarriedRoundsV167(feed);
  assert.equal(drop.rounds,0);
  assert.match(engine.getInteractionPrompt(p),/CHARGEUR VIDE/);
  assert.equal(engine.interact(p),true);
  assert.equal(drop.location,'inventory');
  assert.equal(weaponFeedCarriedRoundsV167(feed),total);
  assert.equal(p.ammoReserve,weaponFeedReserveRoundsV167(feed));
  assert.equal(engine.events.length,1);assert.equal(engine.events[0].rounds,0);
  assert.equal(engine.interact(p),false,'an already recovered container cannot be cloned');
});

test('V177: a rejected speed reload cannot start a hidden legacy reload or change a foreign feed', () => {
  for(const mismatch of ['reserve','owner']){
    const engine=recoveryEngine(make()),p=engine.player;
    if(mismatch==='reserve')p.ammoReserve++;
    else p.weaponFeedV167.ownerId='coop';
    const before=structuredClone(p);
    assert.equal(engine.speedReloadWeaponV168(p),false,mismatch);
    assert.deepEqual(p,before,mismatch);
  }
  const engine=recoveryEngine(make()),p=engine.player;p.ammoReserve++;
  const total=p.ammo+p.ammoReserve;
  assert.equal(engine.reload(p),true,'normal R retains the numeric compatibility path');
  assert.equal(p.weaponFeedV167,null);
  assert.equal(engine.advancePlayerReloadV77(p,3)?.type,'complete');
  assert.equal(p.ammo+p.ammoReserve,total);
});

test('V177: a refused pickup at the persisted revision ceiling leaves the world object intact', () => {
  const feed=make(),engine=recoveryEngine(feed),p=engine.player;
  assert.equal(engine.speedReloadWeaponV168(p),true);
  engine.advancePlayerReloadV77(p,.6);
  assert.equal(cancelTacticalReloadV77(p,'test-interrupt'),true);
  const drop=feed.magazines.find(m=>m.location==='world');drop.revision=10000000;
  assert.equal(world.validateMagazineWorldV168(feed,{requirePosition:true}),true);
  const before=structuredClone(feed);
  assert.equal(world.recoverDroppedMagazineV168(feed,{ownerId:'player',levelId:'test-room',
    magazineId:drop.id,x:p.x+p.w/2,y:p.y+p.h-3}),null);
  assert.deepEqual(feed,before);
});

test('V177: resume binds the physical feed to the equipped weapon, capacity and separate loaded/reserve counts', () => {
  assert.equal(typeof world.restoreEquippedMagazineFeedV177,'function');
  const feed=make(),raw=world.captureMagazineFeedV168(feed);
  const expected={ownerId:'player',weaponId:rifle.id,magazineSize:30,loaded:12,reserve:38,enabled:true};
  assert.deepEqual(world.restoreEquippedMagazineFeedV177(raw,expected),raw);
  for(const change of [{ownerId:'coop'},{weaponId:'weapon-002-m41a2-pulse-rifle'},
    {magazineSize:31},{loaded:11,reserve:39},{loaded:13,reserve:37},{enabled:false},{enabled:undefined}]){
    assert.equal(world.restoreEquippedMagazineFeedV177(raw,{...expected,...change}),null);
  }
  assert.deepEqual(raw,feed,'rejected checkpoints cannot rewrite the supplied snapshot');
});

test('V177: corrupt magazine records fail closed without throwing or rewriting a checkpoint', () => {
  for(const invalid of [null,undefined,7,[]]){
    const raw=make();raw.magazines[0]=invalid;
    const before=structuredClone(raw);
    assert.equal(validateWeaponFeedV167(raw),false);
    assert.equal(captureWeaponFeedV167(raw),null);
    assert.equal(restoreWeaponFeedV167(raw),null);
    assert.equal(world.restoreEquippedMagazineFeedV177(raw,{ownerId:'player',weaponId:rifle.id,
      magazineSize:30,loaded:12,reserve:38,enabled:true}),null);
    assert.deepEqual(raw,before);
  }
});

test('V177: generic detachable reload cannot admit tank, cell or linked-belt mechanisms', () => {
  for(const kind of ['tank','cell','belt']){
    const feed=make({feed:kind}),engine=recoveryEngine(feed),before=structuredClone(engine.player);
    assert.equal(engine.speedReloadWeaponV168(engine.player),false,kind);
    assert.deepEqual(engine.player,before,kind);
  }
  const player=actor(make()),coop={...actor(make()),weaponFeedV167:undefined};
  const smartgun={id:'weapon-005-m56-smartgun',name:'M56 Smartgun',family:'smart'};
  const engine={player,coop,coopEnabled:true,reloadWeaponV77:p=>p===player?rifle:smartgun};
  delete player.weaponFeedV167;
  GameEngine.prototype.initializeWeaponFeedsV167.call(engine);
  assert.equal(player.weaponFeedV167?.feed,'box');
  assert.equal(coop.weaponFeedV167,undefined,'belt/harness awaits its specialist native admission');
});

test('V177: recovering an empty world container makes a saturated speed-reload reserve usable again', () => {
  const feed=make({ammo:0,reserve:200,size:1}),engine=recoveryEngine(feed),p=engine.player;
  for(let i=0;i<129;i++){
    assert.equal(engine.speedReloadWeaponV168(p),true);
    assert.equal(engine.advancePlayerReloadV77(p,3)?.type,'complete');
    assert.equal(spendAcceptedRoundV167(feed,'speed-shot:'+i),true);mirror(p);
  }
  assert.equal(feed.magazines.length,129);
  assert.equal(feed.looseRounds,71);
  assert.equal(feed.magazines.filter(m=>m.location==='inventory').length,0);
  assert.equal(engine.speedReloadWeaponV168(p),false);
  assert.match(engine.getInteractionPrompt(p),/CHARGEUR VIDE/);
  assert.equal(engine.interact(p),true);
  assert.equal(p.ammo+p.ammoReserve,71,'recovering an empty container grants no ammunition');
  assert.equal(engine.speedReloadWeaponV168(p),true);
  assert.equal(engine.advancePlayerReloadV77(p,3)?.type,'complete');
  assert.equal(spendAcceptedRoundV167(feed,'after-empty-recovery'),true);mirror(p);
  assert.equal(weaponFeedCarriedRoundsV167(feed),70);
  assert.equal(feed.magazines.length,129);
  assert.equal(world.validateMagazineWorldV168(feed,{requirePosition:true}),true);
});

test('V177: a stale automatic transaction serial cannot reuse a completed receipt', () => {
  const feed=make();assert.equal(beginWeaponReloadV167(feed),true);
  assert.equal(advanceWeaponReloadV167(feed,feed.reload.id,1),true);
  feed.nextTransactionSerial=0;
  assert.equal(validateWeaponFeedV167(feed),true);
  const before=structuredClone(feed);
  const partial=feed.magazines.find(m=>m.location==='inventory'&&m.rounds>0);
  assert.equal(beginWeaponReloadV167(feed,null,'tactical',partial.id),false);
  assert.deepEqual(feed,before);
});

test('V177: production pause and checkpoint restoration keep exact feeds and reject cross-weapon or redistributed ammo', () => {
  // The actual production class runs with explicit DOM/image/RAF doubles.
  // This is an executable state test, not a browser or visual-playthrough claim.
  const weapon=WEAPONS.find(w=>w.id===rifle.id),engines=[];
  const create=(enabled=true)=>{
    const {engine}=missionV136({weapon,experimentalPhysicalMagazinesV167:enabled});
    engines.push(engine);return engine;
  };
  try{
    const engine=create(),p=engine.player;
    assert.equal(engine.fire(p),true);
    const total=p.ammo+p.ammoReserve;
    assert.equal(engine.reload(p),true);
    engine.advancePlayerReloadV77(p,.6);
    assert.equal(p.weaponFeedV167.reload.phase,'ejected');
    engine.togglePause();assert.equal(engine.paused,true);
    const feedBefore=captureWeaponFeedV167(p.weaponFeedV167);
    engine.advancePlayerReloadV77(p,10);
    assert.deepEqual(captureWeaponFeedV167(p.weaponFeedV167),feedBefore,'pause cannot move a reload marker');
    const snapshot=engine.captureResumeState();
    const resumed=create(),receipt=resumed.applyResumeState(snapshot);
    assert.equal(receipt.applied,true);
    assert.equal(receipt.weaponFeedRestoredV167.player,true);
    assert.equal(receipt.tacticalReloadRestoredV77.player,true);
    assert.deepEqual(captureWeaponFeedV167(resumed.player.weaponFeedV167),feedBefore);
    resumed.advancePlayerReloadV77(resumed.player,3);
    assert.equal(resumed.player.tacticalReload.phase,'complete');
    assert.equal(resumed.player.ammo+resumed.player.ammoReserve,total);
    assert.equal(weaponFeedCarriedRoundsV167(resumed.player.weaponFeedV167),total);
    for(const change of ['redistributed','weapon','legacy','broken-magazine']){
      const raw=structuredClone(snapshot),candidate=create(change!=='legacy');
      if(change==='redistributed'){raw.player.ammo++;raw.player.ammoReserve--;}
      if(change==='weapon')raw.player.weaponFeedV167.weaponDefinitionId='weapon-002-m41a2-pulse-rifle';
      if(change==='broken-magazine')raw.player.weaponFeedV167.magazines[0]=null;
      const result=candidate.applyResumeState(raw);
      assert.equal(result.applied,true,change);
      assert.equal(result.weaponFeedRestoredV167.player,false,change);
      assert.equal(result.tacticalReloadRestoredV77.player,false,change);
      assert.equal(candidate.player.reloading,false,change);
      assert.equal(candidate.player.ammo+candidate.player.ammoReserve,total,change);
    }
  }finally{for(const engine of engines)engine.dispose?.();}
});
