import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GameEngine } from '../src/game-production-runtime.js';
import { HIVE_CAMPAIGNS_V131, buildHiveMissionV131 } from '../src/hive-missions-v131.js';
import { createHiveControlV131 } from '../src/hive-control-v131.js';
import { createJeriSurfaceStateV135, buildJeriSurfaceSceneV135, attachJeriSurfaceV135, stepJeriSurfaceV135,
  releaseJeriSurfaceV135, validateJeriSurfaceStateV135, findJeriSurfaceV135 } from '../src/jeri-surface-motion-v135.js';
import { WORLDS, WEAPONS, ENEMIES } from '../src/content.js';

const campaign = HIVE_CAMPAIGNS_V131[0], level = buildHiveMissionV131({ campaign });
const sceneFor = state => buildJeriSurfaceSceneV135({ ...level.geometry, ...level.dimensions }, state, level.hiveMissionV131.stations);
const actor = (x = 958, y = 668) => ({ x, y, w: 42, h: 92, vx: 0, vy: 0, alive: true, downed: false });
function simulate(pose, state, scene, input, seconds) {
  for (let left = seconds; left > 1e-9; left -= 1/60) ({ actor: pose, state } = stepJeriSurfaceV135(pose, state, scene, input, Math.min(left,1/60)));
  return { actor: pose, state };
}
test('Jeri contacts derive from authored solids and ignore backgrounds and opened gates', () => {
  const hive = createHiveControlV131('jeri-false-son'), scene = sceneFor(hive);
  assert.equal(findJeriSurfaceV135(actor(100,668),scene),null);
  assert.equal(findJeriSurfaceV135(actor(),scene)?.surfaceId,'hive-gate-worker');
  assert.equal(findJeriSurfaceV135(actor(500,482),scene)?.face,'underside');
  assert.equal(findJeriSurfaceV135(actor(500,810),scene),null,'The bottom of the floor is outside the playable attachment route.');
  hive.inspections.push('inspection-worker');
  assert.equal(findJeriSurfaceV135(actor(),sceneFor(hive)),null);
});
test('wall climb transfers exactly to the existing underside and cannot cross the closed inspection', () => {
  const scene = sceneFor(createHiveControlV131('jeri-false-son'));
  let result = attachJeriSurfaceV135(actor(),createJeriSurfaceStateV135(),scene);
  assert.equal(result.changed,true); assert.equal(result.state.face,'left');
  result = simulate(result.actor,result.state,scene,{vertical:-1},2);
  assert.equal(result.actor.x,958); assert.equal(result.actor.y,482);
  assert.equal(result.state.surfaceId,'hive-service'); assert.equal(result.state.face,'underside');
  result = simulate(result.actor,result.state,scene,{horizontal:1},5);
  assert.equal(result.actor.x,958,'The closed full-height shutter still blocks the ceiling route.');
  result = simulate(result.actor,result.state,scene,{horizontal:-1},1);
  assert.ok(Math.abs(result.actor.x-768)<.01); assert.equal(result.actor.y,482);
  assert.equal(validateJeriSurfaceStateV135(result.state,result.actor,scene).valid,true);
});
test('swept surface movement stops at thin obstructions for large and subdivided frame steps', () => {
  const scene = {width:1000,height:850,solids:[{id:'roof',x:0,y:300,w:1000,h:20,surfaceKind:'platform'},
    {id:'partition',x:550,y:320,w:2,h:200,surfaceKind:'wall'}]};
  const start = attachJeriSurfaceV135(actor(500,320),createJeriSurfaceStateV135(),scene);
  let result = simulate(start.actor,start.state,scene,{horizontal:1},1);
  assert.equal(result.actor.x,508); assert.equal(result.actor.y,320);
  result = stepJeriSurfaceV135(start.actor,start.state,scene,{horizontal:1},100);
  assert.equal(result.actor.x,508); assert.equal(result.state.mode,'attached');
});
test('release, lost surface and edge fall preserve a local pose and never snap to a station', () => {
  const hive = createHiveControlV131('jeri-false-son'), scene = sceneFor(hive);
  const attached = attachJeriSurfaceV135(actor(),createJeriSurfaceStateV135(),scene);
  const jump = releaseJeriSurfaceV135(attached.actor,attached.state,true);
  assert.equal(jump.actor.x,958); assert.equal(jump.actor.y,668); assert.ok(jump.actor.vx<0 && jump.actor.vy<0);
  assert.equal(jump.state.mode,'free'); assert.equal(attachJeriSurfaceV135(jump.actor,jump.state,scene).changed,false);
  hive.inspections.push('inspection-worker');
  const lost = stepJeriSurfaceV135(attached.actor,attached.state,sceneFor(hive),{},1/60);
  assert.equal(lost.state.mode,'free'); assert.equal(lost.actor.x,958);
  const ceiling = attachJeriSurfaceV135(actor(451,482),createJeriSurfaceStateV135(),scene);
  const edge = simulate(ceiling.actor,ceiling.state,scene,{horizontal:-1},.1);
  assert.equal(edge.state.mode,'free'); assert.ok(Math.abs(edge.actor.x-451)<2);
});
test('saved contacts bind actual actor pose, geometry, schema and terminal state; old saves detach', () => {
  const scene = sceneFor(createHiveControlV131('jeri-false-son'));
  const attached = attachJeriSurfaceV135(actor(),createJeriSurfaceStateV135(),scene);
  assert.equal(validateJeriSurfaceStateV135(attached.state,attached.actor,scene).valid,true);
  for (const patch of [{surfaceId:'painted-background'},{face:'top'},{schema:134},{cooldown:NaN},{distance:-1}])
    assert.equal(validateJeriSurfaceStateV135({...attached.state,...patch},attached.actor,scene).valid,false);
  assert.equal(validateJeriSurfaceStateV135(attached.state,{...attached.actor,x:920},scene).valid,false);
  assert.equal(validateJeriSurfaceStateV135(attached.state,attached.actor,scene,{terminal:true}).valid,false);
  assert.equal(validateJeriSurfaceStateV135({...createJeriSurfaceStateV135(),surfaceId:'hive-gate-worker'},attached.actor,scene).valid,false);
  assert.equal(validateJeriSurfaceStateV135(undefined,actor(),scene).state.mode,'free');
});

// Only the browser host (events, image decode and RAF) is substituted here.
// This route walks from the genuine spawn using the production controls and AI.
function fixture() {
  const events = new EventTarget();
  for (const name of ['addEventListener','removeEventListener','dispatchEvent']) globalThis[name]=events[name].bind(events);
  globalThis.document=Object.assign(new EventTarget(),{hidden:false,activeElement:null,hasFocus:()=>true});
  globalThis.Image=class extends EventTarget {
    complete=true; naturalWidth=1024; naturalHeight=1024; width=1024; height=1024;
    async decode(){} set src(value){this._src=value;queueMicrotask(()=>this.dispatchEvent(new Event('load')));} get src(){return this._src;}
  };
  globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
  const canvas=Object.assign(new EventTarget(),{getContext:()=>({}),focus(){document.activeElement=this;},getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720})});
  const engine=new GameEngine(canvas,{onEvent:()=>{}});
  engine.start({campaign,world:WORLDS[0],weapon:WEAPONS[0],enemyCatalog:ENEMIES.slice(0,8),missionLevel:level,equipment:[],crew:[],seed:426});
  const key=(type,code)=>{const event=new Event(type,{cancelable:true});Object.assign(event,{code,repeat:false,ctrlKey:false,altKey:false,metaKey:false,isComposing:false});events.dispatchEvent(event);};
  return {engine,key};
}
function tick(engine, seconds) {for(let left=seconds;left>1e-9;left-=1/60)engine.update(Math.min(left,1/60));}
function hold(f, code, seconds) {f.key('keydown',code);tick(f.engine,seconds);f.key('keyup',code);}
function tap(f, code) {f.key('keydown',code);f.key('keyup',code);}
function routeToWall(f) {
  hold(f,'KeyD',.5);hold(f,'KeyE',2.1);assert.equal(f.engine.hiveV131.commissioned,true);
  hold(f,'KeyD',4);assert.equal(f.engine.player.x,958);assert.deepEqual(f.engine.hiveV131.inspections,[]);
  tap(f,'KeyV');assert.equal(f.engine.jeriSurfaceV135.mode,'attached');
}
test('native keyboard route, adhesion, paused inputs, resume and release keep inspections mandatory', () => {
  const f=fixture(), e=f.engine;routeToWall(f);
  const appearance=e.player.appearanceV126, operator=e.player.operatorId;
  const wallRig=e.resolvePlayerAppearanceTransitV128(e.player);
  assert.equal(wallRig.eligible,true,wallRig.reason);assert.equal(wallRig.source,'physical-ladder-position');
  assert.equal(e.playerAppearanceLadderV128(e.player).physicalSurfaceIdV135,'hive-gate-worker');
  assert.ok(Math.abs(wallRig.bodyRig.standingHeight-96.5)<.01);
  assert.ok(Math.abs(wallRig.contacts.feet.near.point.x-1000)<5);
  assert.ok(Math.abs(wallRig.contacts.hands.near.point.x-1000)<6);
  const charge=e.hiveV131.charge; tap(f,'KeyE'); assert.deepEqual(e.hiveV131.inspections,[]); assert.equal(e.hiveV131.charge,charge);
  hold(f,'KeyW',1.4);assert.equal(e.jeriSurfaceV135.face,'underside');
  const ceilingRig=e.resolvePlayerAppearanceTransitV128(e.player);
  assert.equal(ceilingRig.eligible,true,ceilingRig.reason);
  assert.equal(e.playerAppearanceLadderV128(e.player).physicalSurfaceIdV135,'hive-service');
  const invertedSole=e.player.y*2+e.player.h-ceilingRig.contacts.feet.near.point.y;
  assert.ok(Math.abs(invertedSole-482)<1.1,`Inverted sole ${invertedSole} must meet the physical underside.`);
  hold(f,'KeyA',.8);assert.ok(e.player.x<830 && e.player.x>750);assert.equal(e.player.y,482);
  const raw=e.captureResumeState();assert.equal(e.validateHiveResumeV131(raw).valid,true);
  const before=structuredClone({p:raw.player,s:e.jeriSurfaceV135,h:e.hiveV131});
  tap(f,'KeyP');hold(f,'KeyD',.5);tap(f,'KeyV');tap(f,'Space');
  assert.deepEqual(e.captureResumeState().player,before.p);assert.deepEqual(e.jeriSurfaceV135,before.s);assert.deepEqual(e.hiveV131,before.h);
  tap(f,'KeyP');assert.equal(e.applyResumeState(raw).applied,true);
  assert.equal(e.player.climbing,true);assert.equal(e.jeriSurfaceV135.face,'underside');assert.equal(e.player.y,482);
  assert.deepEqual(e.player.appearanceV126,appearance);assert.equal(e.player.operatorId,operator);
  tap(f,'KeyE');assert.deepEqual(e.hiveV131.inspections,[]);assert.equal(e.hiveV131.channel,null);
  assert.equal(e.completeMission(),false);assert.equal(e.hiveV131.bossReleased,false);
  tap(f,'Space');tick(e,.1);assert.equal(e.jeriSurfaceV135.mode,'free');tick(e,1);
  assert.equal(e.player.y,668);assert.equal(e.player.grounded,true);assert.equal(e.player.w,42);assert.equal(e.player.h,92);
  assert.equal(e.hiveV131.complete,false);assert.equal(e.hiveV131.rewardClaimed,false);e.stop();
});
test('invalid contact resume is atomic, opened-door attachment is refused, legacy checkpoints migrate', () => {
  const f=fixture(),e=f.engine;routeToWall(f);const valid=e.captureResumeState();
  const bad=structuredClone(valid);bad.hiveMissionV131.jeriSurfaceV135.surfaceId='hive-gate-final';
  const before=e.captureResumeState();assert.equal(e.applyResumeState(bad).applied,false);assert.deepEqual(e.captureResumeState(),before);
  const moved=structuredClone(valid);moved.player.x=240;assert.equal(e.applyResumeState(moved).applied,false);
  const opened=structuredClone(valid);opened.hiveMissionV131.state.inspections.push('inspection-worker');
  assert.equal(e.applyResumeState(opened).applied,false);
  const legacy=structuredClone(valid);delete legacy.hiveMissionV131.jeriSurfaceV135;
  assert.equal(e.applyResumeState(legacy).applied,true);assert.equal(e.jeriSurfaceV135.mode,'free');assert.equal(e.player.climbing,false);
  tick(e,1);assert.equal(e.player.y,668);e.stop();
});

// Typed terminal witnesses isolate receipt validation; these are not gameplay
// completion shortcuts and are never imported by the browser route below.
import { createDefaultSave, beginOperation } from '../src/save.js';
import { validateOperationCompletionV131 } from '../src/operation-receipts-v131.js';
function terminalWitness() {
  const state=createHiveControlV131('jeri-false-son'),manifest=level.hiveMissionV131;
  Object.assign(state,{commissioned:true,bossPhase:2,bossDefeated:true,bossReleased:true,complete:true,rewardClaimed:true,
    exitProgress:2,phase:'complete',killedIds:['hive-boss'],rescued:true,finalInspection:true,
    inspections:['inspection-worker','inspection-nurse','inspection-queen']});
  state.rewards={credits:612,salvage:0,intel:0,vehicleRecovered:false,noCasualty:true,retries:0,elapsedSeconds:10,
    operationId:state.operationId,ending:null,rescued:true,hushSaved:false,survivingRecruits:[],chargeRemaining:90,canonExact:false};
  const save=createDefaultSave(),world=WORLDS.find(world=>world.id===campaign.worldId),operation=beginOperation(save,campaign,world).operation;
  Object.assign(operation,{levelSeedId:level.levelSeed.id,missionLevelSignature:level.signature});
  operation.resumeState={schema:1,identity:{campaignId:campaign.id,worldId:campaign.worldId,levelSeedId:level.levelSeed.id},
    missionLevel:{signature:level.signature},operationReceiptV131:{deploymentId:operation.id,campaignId:campaign.id},
    player:{alive:true,downed:false,kills:1,inVehicle:false,x:3669,y:668},coop:{enabled:false,kills:0},vehicle:{active:false},
    mission:{state:'complete',elapsed:10,retries:0,casualties:0,rewards:structuredClone(state.rewards)},inventory:{salvage:0,intel:0},
    hiveMissionV131:{schema:131,signature:level.signature,state,actors:[]},
    enemies:manifest.enemyIds.map(id=>({id,x:1000,y:690,alive:id!=='hive-boss',health:id==='hive-boss'?0:100}))};
  return operation;
}
test('terminal receipts accept legacy or detached Jeri metadata and reject attached or malformed metadata', () => {
  const operation=terminalWitness();assert.equal(validateOperationCompletionV131(operation).valid,true);
  const own=operation.resumeState.hiveMissionV131;
  own.jeriSurfaceV135=createJeriSurfaceStateV135();assert.equal(validateOperationCompletionV131(operation).valid,true);
  own.jeriSurfaceV135={...createJeriSurfaceStateV135(),mode:'attached',face:'underside',surfaceId:'hive-service'};
  assert.equal(validateOperationCompletionV131(operation).reason,'operation-jeri-surface-v135');
  own.jeriSurfaceV135={...createJeriSurfaceStateV135(),cooldown:-1};
  assert.equal(validateOperationCompletionV131(operation).reason,'operation-jeri-surface-v135');
});
