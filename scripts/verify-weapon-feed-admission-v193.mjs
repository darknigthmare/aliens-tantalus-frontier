import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPONS } from '../src/content-core-v50.js';
import { getWeaponPresentationProfileV124 } from '../src/weapon-presentation-profiles-v124.js';
import { canInitializeDetachableFeedV193,inspectDetachableFeedV193 } from '../src/weapon-feed-admission-v193.js';
import { createLegacyWeaponFeedV167,isDetachableMagazineFeedV177 } from '../src/weapon-magazine-inventory-v167.js';
import { captureMagazineFeedV168 } from '../src/weapon-magazine-world-v168.js';
import { GameEngine } from '../src/game-production-runtime.js';
import { missionV136 } from './forge-native-host-v136.mjs';
const named=id=>WEAPONS.find(w=>w.id===id);
const rifles=['weapon-001-m41a-pulse-rifle','weapon-041-m41a-pulse-rifle-field',
  'weapon-081-m41a-pulse-rifle-veteran','weapon-121-m41a-pulse-rifle-prototype'];
const belts=['weapon-005-m56-smartgun','weapon-045-m56-smartgun-field',
  'weapon-085-m56-smartgun-veteran','weapon-125-m56-smartgun-prototype'];
const inventory=w=>({alive:true,downed:false,inVehicle:false,ventTransit:false,reloading:false,
  ammo:1,ammoReserve:12,magazineSize:w.magazine});
const legacy=(w,a)=>createLegacyWeaponFeedV167({weaponId:w.id,ownerId:'player',ammoTypeId:'legacy-test',
  magazineSize:a.magazineSize,ammo:a.ammo,reserve:a.ammoReserve,
  feed:getWeaponPresentationProfileV124(w).reload.feed});

test('V193 all four exact M56 identities reject inherited drum presentation without mutations',()=>{
  for(const id of belts){const w=named(id),a=inventory(w),before=structuredClone(a);
    assert.equal(getWeaponPresentationProfileV124(w).reload.feed,'drum');
    assert.equal(canInitializeDetachableFeedV193(w,a).detachable,false,id);
    assert.equal(isDetachableMagazineFeedV177('drum',id),false,id);
    assert.deepEqual(a,before);}
});
test('V193 actual catalog admits only the four reviewed M41A identities',()=>{
  assert.deepEqual(WEAPONS.filter(w=>inspectDetachableFeedV193(w).detachable).map(w=>w.id),rifles);
  for(const id of rifles){const p=inspectDetachableFeedV193(named(id));
    assert.equal(p.feed,'box');assert.equal(p.ammoType,'caseless');
    assert.equal(p.mechanismSource.field,'Alimentation');assert.equal(p.mechanismSource.value,'box');
    assert.equal(p.mechanismSource.sourceWeaponId,rifles[0]);assert.equal(p.mechanismSource.media,'Aliens (1986)');
    assert.equal(p.ammunitionSourceMedia,'Alien vs. Predator (Atari Jaguar, 1994)');
    assert.equal(p.canonExact,false);assert.equal(p.visualFidelity1to1,false);}
});
test('V193 ammunition or forged presentation cannot authorize another mechanism or media',()=>{
  const unknown={id:'weapon-999-m56-smartgun',name:'M56 Smartgun',family:'smart',magazine:99};
  const fake={weaponId:unknown.id,ammunition:'caseless',reload:{feed:'box'},
    evidence:{catalogueMatch:true,status:'documented-ammunition'}};
  assert.equal(inspectDetachableFeedV193(unknown,{profile:fake}).detachable,false);
  assert.equal(inspectDetachableFeedV193(named(belts[1]),{profile:{...fake,weaponId:belts[1]}}).detachable,false);
  assert.equal(inspectDetachableFeedV193(named(rifles[0]),{profile:{reload:{feed:'drum'}}}).feed,'box');
  assert.equal(inspectDetachableFeedV193(named('weapon-002-m41a2-pulse-rifle')).detachable,false);
});
test('V193 descriptor and actor capacities are authoritative, refusals are read-only',()=>{
  const w=named(rifles[0]),a=inventory(w),before=structuredClone(a);
  for(const bad of[{...a,magazineSize:30},{...a,ammo:-1},{...a,ammo:100},{...a,ammoReserve:NaN},null])
    assert.equal(canInitializeDetachableFeedV193(w,bad).detachable,false);
  assert.equal(canInitializeDetachableFeedV193({...w,magazine:30},{...a,magazineSize:30}).detachable,false);
  assert.equal(canInitializeDetachableFeedV193({...w,family:'melee'},a).detachable,false);
  assert.equal(canInitializeDetachableFeedV193(w,a).detachable,true);assert.deepEqual(a,before);
});
test('V193 production initialization leaves all M56s and unreviewed guns on numeric ammo',()=>{
  for(const id of [...belts,'weapon-003-m4a3-service-pistol']){
    const w=named(id),a=inventory(w),before=structuredClone(a),e={player:a,coop:null,coopEnabled:false,reloadWeaponV77:()=>w};
    GameEngine.prototype.initializeWeaponFeedsV167.call(e);assert.deepEqual(a,before,id);
  }
  for(const id of rifles){const w=named(id),a=inventory(w),e={player:a,coop:null,coopEnabled:false,reloadWeaponV77:()=>w};
    GameEngine.prototype.initializeWeaponFeedsV167.call(e);assert.equal(a.weaponFeedV167?.weaponDefinitionId,id);}
});
test('V193 production checkpoint cannot restore a denied source mechanism through an older physical save',()=>{
  const engines=[];
  try{for(const id of [...belts,'weapon-003-m4a3-service-pistol']){
    const w=named(id),{engine}=missionV136({weapon:w,experimentalPhysicalMagazinesV167:true});engines.push(engine);
    const snapshot=engine.captureResumeState(),total=snapshot.player.ammo+snapshot.player.ammoReserve;
    snapshot.player.weaponFeedV167=captureMagazineFeedV168(legacy(w,engine.player));
    assert.ok(snapshot.player.weaponFeedV167,'declared historical physical-feed fixture');
    const before=structuredClone(snapshot),receipt=engine.applyResumeState(snapshot);
    assert.equal(receipt.applied,true);assert.equal(receipt.weaponFeedRestoredV167.player,false,id);
    assert.equal(engine.player.weaponFeedV167,null);assert.equal(engine.player.ammo+engine.player.ammoReserve,total);
    assert.deepEqual(snapshot,before);
  }}finally{for(const e of engines)e.dispose?.();}
});
test('V193 a forged M56 world-feed cannot start a speed reload or mutate its receipt ledger',()=>{
  for(const id of belts){const w=named(id),a=inventory(w);a.weaponFeedV167=legacy(w,a);
    const before=structuredClone(a),e={player:a,coopEnabled:false,canPerformGameplayAction:()=>true};
    assert.equal(GameEngine.prototype.speedReloadWeaponV168.call(e,a),false,id);assert.deepEqual(a,before);}
});
