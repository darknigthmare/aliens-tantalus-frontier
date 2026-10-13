import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content-core-v50.js';
import { ECOSYSTEM_CAMPAIGNS_V131, buildEcosystemMissionV131 } from '../src/ecosystem-missions-v131.js';
import { buildHiveMissionV131, HIVE_CAMPAIGNS_V131 } from '../src/hive-missions-v131.js';
import { createHiveControlV131, validateHiveControlV131 } from '../src/hive-control-v131.js';
import { MECHA_CAMPAIGNS_V131, buildMechaMissionV131, validateMechaMissionStateV131 } from '../src/mecha-missions-v131.js';
import { createMechaSystemsV131 } from '../src/mecha-systems-v131.js';
import { LEGACY_CAMPAIGNS_V131, LEGACY_STATIONS_V131, createLegacyOperationStateV131, validateLegacyOperationStateV131 } from '../src/legacy-operation-state-v131.js';
import { buildLegacyMissionV131 } from '../src/legacy-operations-v131.js';
import { validateOperationCompletionV131 } from '../src/operation-receipts-v131.js';
import { createDefaultSave, beginOperation, recordOperationResumeState, resolveOperation, migrateSave } from '../src/save.js';

// A real production completion supplies the ecological witness. Browser APIs
// alone are substituted, with actual shipped PNG dimensions. Other families
// use explicit state fixtures certified by their own pure gameplay validator.
const root=fileURLToPath(new URL('../',import.meta.url));
function dimensions(source) {
  let descriptor;
  try { descriptor=openSync(resolve(root,`.${new URL(source,'http://fixture.invalid').pathname}`),'r');
    const header=Buffer.alloc(24);readSync(descriptor,header,0,24,0);return [header.readUInt32BE(16),header.readUInt32BE(20)];
  } catch {return [0,0];} finally {if(descriptor!==undefined)closeSync(descriptor);}
}
function host() {
  const events=new EventTarget();for(const name of ['addEventListener','removeEventListener'])globalThis[name]=events[name].bind(events);
  globalThis.document=Object.assign(new EventTarget(),{hidden:false,activeElement:null,hasFocus:()=>true});
  globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
  globalThis.Image=class extends EventTarget {
    complete=true;naturalWidth=0;naturalHeight=0;
    set src(value){this._src=value;[this.naturalWidth,this.naturalHeight]=dimensions(value);queueMicrotask(()=>{const event=new Event(this.naturalWidth?'load':'error');this.dispatchEvent(event);this[`on${event.type}`]?.(event);});}
    get src(){return this._src;}async decode(){if(!this.naturalWidth)throw new Error('Missing real fixture image');}
  };
  const ctx=new Proxy({measureText:text=>({width:String(text).length*7}),createLinearGradient:()=>({addColorStop(){}}),
    createRadialGradient:()=>({addColorStop(){}}),getImageData:()=>({data:new Uint8ClampedArray(4),width:1,height:1})},
  {get:(value,key)=>key in value?value[key]:()=>{}});
  return Object.assign(new EventTarget(),{width:1280,height:720,getContext:()=>ctx,focus(){document.activeElement=this;},getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720})});
}
function locate(engine,x,floorY=570){Object.assign(engine.player,{x:x-engine.player.w/2,y:floorY-engine.player.h,vx:0,vy:0,grounded:true});}
function tick(engine,seconds){for(let elapsed=0;elapsed<seconds-1e-9;elapsed+=1/60)engine.update(Math.min(1/60,seconds-elapsed));}
function destroy(engine,actor){return engine.applyEnemyDamage(actor,999,{owner:engine.player,kind:'rifle',x:actor.x-30,y:actor.y+20});}
let ecologicalWitness=null;
async function completedEcologicalWitness() {
  if(ecologicalWitness)return structuredClone(ecologicalWitness);
  const campaign=ECOSYSTEM_CAMPAIGNS_V131.find(campaign=>campaign.specialOperationId==='queen-mother-song');
  const world=WORLDS.find(world=>world.id===campaign.worldId),plan=buildEcosystemMissionV131({campaign,world,levelSeeds:LEVEL_SEEDS});
  const save=createDefaultSave(),operation=beginOperation(save,campaign,world).operation;
  Object.assign(operation,{levelSeedId:plan.levelSeed.id,missionLevelSignature:plan.signature,missionTemplateId:plan.templateId});
  const engine=new GameEngine(host(),{onEvent:()=>{}});
  engine.start({campaign,world,levelSeed:plan.levelSeed,missionLevel:plan,weapon:WEAPONS[0],enemyCatalog:ENEMIES,equipment:[],crew:[],seed:426});
  for(let index=0;index<8;index++)await Promise.resolve();
  engine.enemyAtlasLoadingPausedV65=false;engine.userCasteLoadingV88=false;engine.running=true;engine.paused=false;
  let event=null;
  engine.onEvent=value=>{if(value.type==='mission-complete'){event=value;assert.equal(recordOperationResumeState(save,engine.captureResumeState()),true);}};
  for(const actor of engine.enemies.filter(actor=>actor.ecosystemActorV131.role==='target'))destroy(engine,actor);
  for(let index=0;index<4;index++)destroy(engine,engine.ecosystemActorV131('eco131-boss'));
  locate(engine,4280);assert.equal(engine.interact(),true);locate(engine,4540);assert.equal(engine.interact(),true);locate(engine,4400);
  for(let frame=0;frame<1350;frame++){
    for(const actor of engine.enemies.filter(actor=>actor.alive))destroy(engine,actor);
    engine.update(1/60);
  }
  locate(engine,4950);engine.keys.add('KeyE');tick(engine,2.05);
  assert.equal(engine.mission.state,'complete');assert.ok(event);
  assert.equal(engine.validateEcosystemResumeV131(save.strategy.currentOperation.resumeState).valid,true);
  ecologicalWitness={save,operation:save.strategy.currentOperation,rewards:event.rewards};return structuredClone(ecologicalWitness);
}
test('real Queen Mother terminal capture certifies its deployment and pays exactly once across migration',async()=>{
  const {save,operation,rewards}=await completedEcologicalWitness();
  const certified=validateOperationCompletionV131(operation,rewards);assert.equal(certified.valid,true,`${certified.reason} ${JSON.stringify({operationId:operation.id,campaignId:operation.campaignId,worldId:operation.worldId,levelSeedId:operation.levelSeedId,identity:operation.resumeState.identity,receipt:operation.resumeState.operationReceiptV131,signature:operation.missionLevelSignature,rawSignature:operation.resumeState.missionLevel.signature,mission:operation.resumeState.mission.state,player:{alive:operation.resumeState.player.alive,downed:operation.resumeState.player.downed}})}`);
  const before=save.galaxy.resources.credits,result=resolveOperation(save,{success:true,rewards,kills:operation.resumeState.player.kills});
  assert.equal(result.ok,true);assert.equal(save.galaxy.resources.credits-before,rewards.credits);
  assert.equal(save.strategy.lastOperation.operationResultV131.ending,'royal-route-broken');
  const migrated=migrateSave(save),paid=migrated.galaxy.resources.credits;
  migrated.strategy.currentOperation=operation;
  assert.equal(resolveOperation(migrated,{success:true,rewards}).reason,'operation-already-resolved');
  assert.equal(migrated.galaxy.resources.credits,paid);
});
const corruptions={
  'deployment proof copied from another run':operation=>{operation.resumeState.operationReceiptV131.deploymentId='operation-999-other';},
  'foreign world identity':operation=>{operation.resumeState.identity.worldId='world-01-acheron-lv-426';},
  'signature from another mission':operation=>{operation.resumeState.missionLevel.signature='foreign-template';},
  'biological boss still alive':operation=>{const actor=operation.resumeState.enemies.find(actor=>actor.id==='eco131-boss');actor.alive=true;actor.health=150;},
  'choir still alive after recorded neutralization':operation=>{const actor=operation.resumeState.enemies.find(actor=>actor.id==='eco131-target-0');actor.alive=true;actor.health=110;},
  'a missing actor':operation=>{operation.resumeState.enemies.pop();},
  'noninteger kills with mathematically consistent credits':operation=>{const raw=operation.resumeState;raw.player.kills=.5;raw.coop.kills=0;raw.mission.rewards.credits=606;raw.specialOperation.ecosystemV131.rewards.credits=606;},
  'kills exceeding the entire dead actor roster':operation=>{const raw=operation.resumeState;raw.player.kills=500;raw.coop.kills=0;raw.mission.rewards.credits=6600;raw.specialOperation.ecosystemV131.rewards.credits=6600;},
  'a recovered vehicle bonus in an infantry ecosystem':operation=>{const raw=operation.resumeState;for(const rewards of [raw.mission.rewards,raw.specialOperation.ecosystemV131.rewards]){rewards.vehicleRecovered=true;rewards.credits+=100;}},
  'mission retry mismatch in its reward':operation=>{operation.resumeState.mission.retries++;},
  'player outside the extraction area':operation=>{operation.resumeState.player.x=180;},
  'inventory reward divergence':operation=>{operation.resumeState.inventory.salvage++;}
};
for(const [name,corrupt]of Object.entries(corruptions))test(`receipt rejects ${name} without changing strategic state`,async()=>{
  const {save,operation}=await completedEcologicalWitness();corrupt(operation);save.strategy.currentOperation=operation;
  const before=structuredClone(save),certified=validateOperationCompletionV131(operation);
  assert.equal(certified.valid,false,name);
  const resolution=resolveOperation(save,{success:true,rewards:operation.resumeState.mission.rewards});
  assert.equal(resolution.ok,false,name);assert.deepEqual(save,before);
});
test('supplied UI rewards must equal the terminal witness, even when their isolated totals are valid',async()=>{
  const {operation,rewards}=await completedEcologicalWitness();
  assert.equal(validateOperationCompletionV131(operation,{...rewards,credits:rewards.credits+1}).valid,false);
});
function hiveStateFixture(operationId='jeri-false-son') {
  const campaign=HIVE_CAMPAIGNS_V131.find(campaign=>campaign.specialOperationId===operationId),world=WORLDS.find(world=>world.id===campaign.worldId);
  const plan=buildHiveMissionV131({campaign,world}),manifest=plan.hiveMissionV131,state=createHiveControlV131(operationId);
  Object.assign(state,{commissioned:true,bossPhase:2,bossDefeated:true,bossReleased:true,bossShielded:false,complete:true,rewardClaimed:true,
    exitProgress:2,phase:'complete',killedIds:['hive-boss']});
  if(operationId==='jeri-false-son')Object.assign(state,{rescued:true,finalInspection:true,inspections:['inspection-worker','inspection-nurse','inspection-queen']});
  if(operationId==='atax-false-queen')Object.assign(state,{recruitedIds:manifest.recruitIds.slice(0,2),arteries:['artery-claw','artery-shadow','artery-bulwark']});
  const actors=manifest.recruitIds.map(id=>({id,x:650,y:690,health:70,alive:true,loyalty:70,recruited:state.recruitedIds.includes(id),lost:false,order:'follow',attackClock:0}));
  const surviving=actors.filter(actor=>actor.recruited).map(actor=>actor.id);
  state.rewards={credits:612,salvage:0,intel:0,vehicleRecovered:false,noCasualty:true,retries:0,elapsedSeconds:10,
    operationId,ending:state.ending,rescued:state.rescued,hushSaved:state.hushSaved,survivingRecruits:surviving,chargeRemaining:Math.round(state.charge),canonExact:false};
  assert.equal(validateHiveControlV131(state,manifest).valid,true);
  const save=createDefaultSave(),operation=beginOperation(save,campaign,world).operation;
  operation.levelSeedId=plan.levelSeed.id;operation.missionLevelSignature=plan.signature;
  const raw={schema:1,identity:{campaignId:campaign.id,worldId:campaign.worldId,levelSeedId:plan.levelSeed.id},
    missionLevel:{signature:plan.signature},operationReceiptV131:{deploymentId:operation.id,campaignId:campaign.id},
    player:{alive:true,downed:false,kills:1,inVehicle:false,x:3669,y:668},coop:{enabled:false,kills:0},vehicle:{active:false},
    mission:{state:'complete',elapsed:10,retries:0,casualties:0,rewards:structuredClone(state.rewards)},inventory:{salvage:0,intel:0},
    hiveMissionV131:{schema:131,signature:plan.signature,state,actors},
    enemies:manifest.enemyIds.map(id=>({id,x:1000,y:690,alive:id!=='hive-boss',health:id==='hive-boss'?0:100}))};
  operation.resumeState=raw;return operation;
}
test('hive typed witnesses accept a commissioned, inspected Jeri chapter with actual dead boss records',()=>{
  const operation=hiveStateFixture(),checked=validateOperationCompletionV131(operation);assert.equal(checked.valid,true,checked.reason);
});
test('hive typed witnesses reject killedIds diverging from recorded actors',()=>{
  const operation=hiveStateFixture();operation.resumeState.enemies.find(actor=>actor.id==='hive-patrol-a').alive=false;
  operation.resumeState.enemies.find(actor=>actor.id==='hive-patrol-a').health=0;
  assert.equal(validateOperationCompletionV131(operation).valid,false);
});
test('ATAX recruited IDs require a matching live recruited roster, with preserved surviving reward IDs',()=>{
  const operation=hiveStateFixture('atax-false-queen');assert.equal(validateOperationCompletionV131(operation).valid,true);
  operation.resumeState.hiveMissionV131.actors[0].recruited=false;
  assert.equal(validateOperationCompletionV131(operation).valid,false);
});
function typedOperation(campaign,plan,rewards) {
  const save=createDefaultSave(),world=WORLDS.find(world=>world.id===campaign.worldId);
  if(!save.galaxy.unlockedWorldIds.includes(world.id))save.galaxy.unlockedWorldIds.push(world.id);
  const operation=beginOperation(save,campaign,world).operation;
  Object.assign(operation,{levelSeedId:plan.levelSeed.id,missionLevelSignature:plan.signature});
  operation.resumeState={schema:1,identity:{campaignId:campaign.id,worldId:campaign.worldId,levelSeedId:plan.levelSeed.id},
    missionLevel:{signature:plan.signature},operationReceiptV131:{deploymentId:operation.id,campaignId:campaign.id},
    player:{alive:true,downed:false,kills:1,inVehicle:false,x:100,y:480},coop:{enabled:false,kills:0},vehicle:{active:false},
    mission:{state:'complete',elapsed:10,retries:0,casualties:0,rewards:structuredClone(rewards)},inventory:{salvage:0,intel:0},
    enemies:[],specialOperation:{operationId:campaign.specialOperationId}};
  return operation;
}
function mechaStateFixture() {
  const campaign=MECHA_CAMPAIGNS_V131.find(campaign=>campaign.specialOperationId==='titan-equalizer'),plan=buildMechaMissionV131({campaign});
  const rewards={credits:1100,salvage:0,intel:0,noCasualty:true,retries:0,elapsedSeconds:10,operationId:campaign.specialOperationId};
  const systems=createMechaSystemsV131('atlas',{colossal:true});systems.shots=1;systems.strikes=1;
  const operation=typedOperation(campaign,plan,rewards),raw=operation.resumeState;
  const state={schema:131,operationId:campaign.specialOperationId,phase:'complete',loadoutId:'atlas',route:'red',
    mounted:true,primaryQualified:true,secondaryQualified:true,wave:0,emitted:0,waveClock:0,bossPhase:4,bossDefeated:true,
    finishReady:false,extractionProgress:2,maintenanceUsed:false,complete:true,rewardClaimed:true,elapsed:10,rewards,journal:[],systems,
    vehicle:{x:3250,y:414,vx:0,vy:0,facing:1},
    enemies:[{id:'mecha-titan-v131',profileId:'mecha-titan-v131',boss:true,x:2450,y:380,health:0,alive:false,bossState:{phase:4}}],
    bullets:[],hostiles:[]};
  assert.equal(validateMechaMissionStateV131(state).valid,true);
  raw.specialOperation.mechaV131=state;raw.enemies=state.enemies.map(actor=>({id:actor.id,x:actor.x,y:actor.y,health:actor.health,alive:actor.alive}));
  raw.vehicle={id:'prototype-mecha-atlas-v131',active:true,occupied:true,driver:'player',destroyed:false,x:3250,y:414,hull:systems.hull,fuel:systems.energy};
  raw.player.inVehicle=true;raw.player.x=3250+231*.42-21;raw.player.y=414+306*.16;
  return operation;
}
test('a certified Titan typed witness retains vehicle, pilot, boss and canonical reward affinity',()=>{
  const operation=mechaStateFixture(),checked=validateOperationCompletionV131(operation);assert.equal(checked.valid,true,checked.reason);
  // The native actor serializer derives occupancy from vehicle.driver rather
  // than persisting an independent inVehicle field.
  delete operation.resumeState.player.inVehicle;
  assert.equal(validateOperationCompletionV131(operation).valid,true);
});
test('Titan witness rejects a living raw boss or a cabin outside extraction even when the typed boss record stays terminal',()=>{
  const first=mechaStateFixture();first.resumeState.enemies[0].alive=true;first.resumeState.enemies[0].health=20;
  assert.equal(validateOperationCompletionV131(first).valid,false);
  const second=mechaStateFixture();second.resumeState.vehicle.x=260;second.resumeState.specialOperation.mechaV131.vehicle.x=260;
  second.resumeState.player.x=260+231*.42-21;assert.equal(validateOperationCompletionV131(second).valid,false);
});
function legacyStateFixture(kind) {
  const campaign=LEGACY_CAMPAIGNS_V131.find(campaign=>campaign.kind===kind),world=WORLDS.find(world=>world.id===campaign.worldId);
  const plan=buildLegacyMissionV131({campaign,world,levelSeeds:LEVEL_SEEDS}),stations=LEGACY_STATIONS_V131[kind],state=createLegacyOperationStateV131(kind);
  Object.assign(state,{stage:stations.length-1,elapsed:10,hold:stations.at(-1).seconds,complete:true,rewardClaimed:true,
    journal:stations.slice(0,-1).map(station=>station.id)});
  if(kind==='broodstorm'){state.nests=[0,0];state.escort.x=2110;state.escort.arrived=true;}
  state.actors=[{id:kind==='nostromo'?'hunt-0':kind==='abyss'?'predator-0':'queen-0',role:kind==='nostromo'?'hunt':kind==='abyss'?'predator':'queen',
    x:1500,y:400,health:0,alive:false,attackClock:0}];
  state.rewards={credits:620,salvage:0,intel:0,retries:0,elapsedSeconds:10,noCasualty:true,operationId:campaign.specialOperationId,
    chapter:kind,status:'partial',synchronization:state.synchronization};
  assert.equal(validateLegacyOperationStateV131(state).valid,true,kind);
  const operation=typedOperation(campaign,plan,state.rewards),raw=operation.resumeState,exit=stations.at(-1);
  raw.specialOperation.legacyMissionV131=state;
  raw.enemies=state.actors.map(actor=>({id:`legacy-${actor.id}`,x:actor.x,y:actor.y,health:actor.health,alive:actor.alive}));
  raw.player.x=exit.x-21;raw.player.y=exit.y-46;
  if(kind!=='nostromo')raw.vehicle={active:true,occupied:state.aboard,driver:state.aboard?'player':null,destroyed:false,hull:state.hull,fuel:state.fuel,
    x:exit.x-90,y:exit.y-43};
  return operation;
}
test('all three legacy typed witnesses preserve terminal actor, extraction and resource affinity',()=>{
  for(const kind of ['nostromo','abyss','broodstorm']){
    const checked=validateOperationCompletionV131(legacyStateFixture(kind));assert.equal(checked.valid,true,`${kind}:${checked.reason}`);
  }
});
test('legacy witness rejects raw actor mismatch, missing driver and extraction outside the actual final station',()=>{
  const first=legacyStateFixture('nostromo');first.resumeState.enemies[0].x+=20;assert.equal(validateOperationCompletionV131(first).valid,false);
  const second=legacyStateFixture('broodstorm');second.resumeState.vehicle.driver=null;assert.equal(validateOperationCompletionV131(second).valid,false);
  const third=legacyStateFixture('nostromo');third.resumeState.player.x=2020;assert.equal(validateOperationCompletionV131(third).valid,false);
});
