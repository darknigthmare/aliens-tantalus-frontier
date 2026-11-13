import test from 'node:test';
import assert from 'node:assert/strict';
import {XENO_TRIALS_OPERATIONS_V188 as OPS,getXenoTrialsOperationV188,createXenoTrialsOperationStateV188 as create,
 stepXenoTrialsOperationV188 as step,validateXenoTrialsOperationSnapshotV188 as validate,getXenoTrialsOperationReceiptV188 as receipt,
 validateXenoTrialsOperationReceiptV188 as validReceipt,isXenoTrialsOperationForwardV188 as forward,getXenoTrialsOperationViewV188 as view} from '../src/xeno-trials-operations-v188.js';
import {XENO_TRIALS_BOSS_STAGES_V179 as STAGES} from '../src/xeno-trials-boss-stages-v179.js';
import {createXenoTrialsMatchV96,stepXenoTrialsMatchV96,getXenoTrialsSnapshotV96,setXenoTrialsPausedV96,restoreXenoTrialsHordeMatchV180} from '../src/xeno-trials-engine-v96.js';
import {createXenoTrialsHordeCheckpointV186} from '../src/xeno-trials-horde-checkpoint-v186.js';
import {getXenoTrialsBodyBoundsV105 as bounds} from '../src/xeno-trials-geometry-v105.js';

const clone=value=>JSON.parse(JSON.stringify(value));
const config=entry=>({matchId:`ops-${entry.id}`,seed:188,playerId:'warrior',stageId:entry.stageId,activityV119:{branch:'operations',id:entry.id},operationV188:{id:entry.id}});
function fixture(entry){const c=config(entry),state=create(entry.id,c),m={config:c,tick:0,phase:'active',paused:false,timeRemaining:entry.roundSeconds,
 fighters:[{id:'warrior',side:'player',x:entry.startX,y:0,hp:220,facing:1}]};return{entry,c,state,m};}
function target(entry,state){
 if(entry.kind==='escort')return{x:state.cargoX};
 if(entry.kind==='extraction'){if(state.carrying>=0)return entry.depot;if(state.delivered.every(Boolean))return entry.exit;}
 return entry.objectives[state.completed.findIndex(done=>!done)]||entry.exit;
}
// Objective-unit fixtures set only actor positions to the current physical
// target. No progress, health, outcome, tick or reward is fabricated.
function next(row,interact=true){row.m.tick++;row.m.timeRemaining-=1/120;step(row.state,row.m,1/120,{interact});}
function drive(row){for(let count=0;count<row.entry.roundSeconds*120&&row.state.status==='active';count++){
 row.m.fighters[0].x=target(row.entry,row.state).x;next(row,true);
}return row;}

test('forty autonomous objective protocols map uniquely to all forty authored stages and retain five real mechanics',()=>{
 assert.equal(OPS.length,40);assert.equal(new Set(OPS.map(op=>op.id)).size,40);assert.equal(new Set(OPS.map(op=>op.kind)).size,5);
 assert.deepEqual(new Set(OPS.map(op=>op.stageId)),new Set(STAGES.map(stage=>stage.id)));
 assert.equal(getXenoTrialsOperationV188('xth180-incoming-1'),null);
 for(const op of OPS){assert.ok(op.objectives.length>=1&&op.objectives.length<=3);assert.ok(op.objectives.every(o=>o.requiredTicks>0&&o.radius>0));assert.equal(op.canonExact,false);}
});

for(const entry of OPS)test(`${entry.id}: positional work wins independently of kills; ignoring the objective fails with a strict bound receipt`,()=>{
 const row=drive(fixture(entry));assert.equal(row.state.status,'completed');assert.equal(row.state.failureReason,null);assert.ok(validate(row.state,row.c,row.m));
 assert.equal(row.m.fighters.length,1,'Unit fixture has no combat shortcut');
 const success=receipt(row.state,row.c);assert.ok(validReceipt(success,row.c));assert.equal(success.completedObjectives,entry.objectives.length);
 assert.equal(validReceipt({...success,operationId:OPS[(OPS.indexOf(entry)+1)%OPS.length].id},row.c),false);
 assert.equal(validReceipt({...success,seed:189},row.c),false);assert.equal(validReceipt({...success,bonus:9999},row.c),false);
 const failure=fixture(entry);failure.m.fighters[0].x=-750;
 while(failure.state.status==='active')next(failure,false);
 assert.equal(failure.state.status,'failed');assert.ok(['time','structure-destroyed'].includes(failure.state.failureReason));
 assert.ok(validate(failure.state,failure.c,failure.m));assert.ok(validReceipt(receipt(failure.state,failure.c),failure.c));
});

test('escort stalls without grounded contact and nearby hostile bodies damage the real cart state',()=>{
 const r=fixture(OPS.find(op=>op.kind==='escort'));r.m.fighters[0].x=-750;
 for(let t=0;t<120;t++)next(r,true);assert.equal(r.state.cargoTravelTicks,0);assert.equal(r.state.cargoX,r.entry.cargoStartX);
 r.m.fighters[0].x=r.state.cargoX;r.m.fighters[0].y=10;next(r,true);assert.equal(r.state.cargoTravelTicks,0);
 r.m.fighters[0].y=0;r.m.fighters.push({id:'runner',side:'opponent',x:r.state.cargoX,y:0,hp:15,facing:1});
 for(let t=0;t<120;t++)next(r,false);assert.equal(r.state.integrity,97);assert.equal(r.state.cargoTravelTicks,0);
});

test('relay order and uninterrupted local charging cannot be replaced by interacting at distant or later consoles',()=>{
 const r=fixture(OPS.find(op=>op.kind==='relay'));r.m.fighters[0].x=r.entry.objectives[1].x;
 for(let t=0;t<300;t++)next(r,true);assert.deepEqual(r.state.progress,[0,0,0]);
 r.m.fighters[0].x=r.entry.objectives[0].x;for(let t=0;t<70;t++)next(r,true);assert.equal(r.state.progress[0],70);
 r.m.fighters[0].x=-750;for(let t=0;t<35;t++)next(r,true);assert.equal(r.state.progress[0],0);
});

test('unfinished purge regrows, sealed conduits stay sealed and an unattended network loses integrity',()=>{
 const r=fixture(OPS.find(op=>op.kind==='purge'));r.m.fighters[0].x=r.entry.objectives[0].x;
 for(let t=0;t<100;t++)next(r,true);const charged=r.state.progress[0];r.m.fighters[0].x=-750;
 for(let t=0;t<180;t++)next(r,false);assert.ok(r.state.progress[0]<charged);assert.ok(r.state.integrity<100);
 r.m.fighters[0].x=r.entry.objectives[0].x;while(!r.state.completed[0])next(r,true);const sealed=clone(r.state);
 r.m.fighters[0].x=-750;for(let t=0;t<180;t++)next(r,false);assert.equal(r.state.completed[0],true);assert.equal(r.state.progress[0],sealed.progress[0]);
});

test('beacons charge only during their actual visible window and stale work decays outside it',()=>{
 const r=fixture(OPS.find(op=>op.kind==='beacon')),objective=r.entry.objectives[0];r.m.fighters[0].x=objective.x;
 for(let t=0;t<objective.windowStartTicks-1;t++)next(r,true);assert.equal(r.state.progress[0],0);
 for(let t=0;t<40;t++)next(r,true);assert.ok(r.state.progress[0]>0);assert.equal(view({...r.m,operationV188:r.state}).entities[0].windowOpen,true);
 while(r.state.elapsedTicks<objective.windowStartTicks+objective.windowTicks)next(r,false);
 assert.equal(view({...r.m,operationV188:r.state}).entities[0].windowOpen,false);
});

test('extraction requires one carried object, a depot delivery for each, then a separate extraction dwell',()=>{
 const r=fixture(OPS.find(op=>op.kind==='extraction'));r.m.fighters[0].x=r.entry.exit.x;
 for(let t=0;t<250;t++)next(r,true);assert.equal(r.state.status,'active');assert.equal(r.state.exitTicks,0);
 r.m.fighters[0].x=r.entry.objectives[0].x;while(r.state.carrying<0)next(r,true);assert.equal(r.state.carrying,0);
 r.m.fighters[0].x=r.entry.objectives[1].x;for(let t=0;t<250;t++)next(r,true);assert.equal(r.state.carrying,0);assert.equal(r.state.completed[1],false);
 r.m.fighters[0].x=r.entry.depot.x;for(let t=0;t<r.entry.depot.requiredTicks;t++)next(r,true);
 assert.equal(r.state.carrying,-1);assert.equal(r.state.delivered[0],true);assert.equal(r.state.status,'active');
 drive(r);assert.equal(r.state.status,'completed');assert.equal(r.state.exitTicks,r.entry.exit.requiredTicks);
});

test('pause, repeated render ticks and JSON reload preserve the same deterministic objective continuation',()=>{
 for(const kind of ['escort','relay','purge','beacon','extraction']){
  const r=fixture(OPS.find(op=>op.kind===kind));r.m.fighters[0].x=target(r.entry,r.state).x;for(let t=0;t<100;t++)next(r,true);
  const before=clone(r.state);r.m.paused=true;for(let t=0;t<100;t++)step(r.state,r.m,1/120,{interact:true});assert.deepEqual(r.state,before);
  r.m.paused=false;step(r.state,r.m,1/120,{interact:true});assert.deepEqual(r.state,before,'Same native tick cannot add work');
  const resumed=clone(r);drive(r);drive(resumed);assert.deepEqual(resumed.state,r.state);
 }
});

test('all forty protocols admit contact by the real bounds of Queen and Ultramorph without shrinking giant bodies',()=>{
 for(const entry of OPS)for(const id of ['queen','ultramorph']){
  const r=fixture(entry),f=r.m.fighters[0];f.id=id;
  for(let t=0;t<entry.roundSeconds*120&&r.state.status==='active';t++){
   const destination=target(entry,r.state);f.x=0;const native=bounds(f);f.x=destination.x-native.center;
   const contact=bounds(f);assert.ok(contact.left<=destination.x+92&&contact.right>=destination.x-92);
   assert.equal(contact.width,native.width,'Giant contact does not shrink the native body');next(r,true);
  }
  assert.equal(r.state.status,'completed',`${entry.id}/${id}`);
 }
});

test('snapshot and forward guards reject forged tasks, carry slots, counters, identity, healing and removed deliveries',()=>{
 const r=drive(fixture(OPS.find(op=>op.kind==='extraction'))),base=r.state;
 for(const mutate of [s=>s.seed++,s=>s.operationId='xto188-relay-1',s=>s.progress[0]=99999,s=>s.carrying=7,s=>s.delivered[0]=false,s=>s.cargoX++,s=>s.extra=true]){
  const candidate=clone(base);mutate(candidate);assert.equal(validate(candidate,r.c),false);
 }
 const first=fixture(OPS[0]),earlier=clone(first.state);first.m.fighters[0].x=first.state.cargoX;for(let t=0;t<20;t++)next(first,true);
 assert.equal(forward(earlier,first.state),true);assert.equal(forward(first.state,earlier),false);
 assert.equal(forward({...first.state,integrity:90},{...first.state,lastTick:first.state.lastTick+1,integrity:100}),false);
});

for(const kind of ['escort','relay','purge','beacon','extraction'])test(`${kind}: production fixed-step engine pauses/restores and wins from physical interactions with live enemies still present`,()=>{
 const entry=OPS.find(op=>op.kind===kind),m=createXenoTrialsMatchV96({...config(entry),introSeconds:0,holdRoundTransition:true});
 assert.ok(m.operationV188);assert.equal(m.config.stageId,entry.stageId);
 // Spatial fixture only: hostile CPUs receive explicit neutral controls and
 // their existing bodies are parked away. All HP/progress/hazards/ticks and the
 // final verdict use the production engine. The fixture does not kill a foe.
 for(const[index,enemy]of m.fighters.slice(1).entries())enemy.x=-700+index*30;
 for(let t=0;t<100;t++){m.fighters[0].x=target(entry,m.operationV188).x;stepXenoTrialsMatchV96(m,1/120,{interact:true},{});}
 setXenoTrialsPausedV96(m,true);const before=getXenoTrialsSnapshotV96(m);for(let t=0;t<100;t++)stepXenoTrialsMatchV96(m,1/120,{interact:true},{});
 assert.deepEqual(getXenoTrialsSnapshotV96(m),before);
 const cp=createXenoTrialsHordeCheckpointV186(before,m.config);assert.ok(cp,'Full engine checkpoint admission');
 const resumed=restoreXenoTrialsHordeMatchV180(clone(cp.snapshot));assert.ok(resumed);assert.deepEqual(resumed.operationV188,m.operationV188);
 setXenoTrialsPausedV96(resumed,false);
 for(let t=0;t<entry.roundSeconds*120&&!resumed.result;t++){resumed.fighters[0].x=target(entry,resumed.operationV188).x;stepXenoTrialsMatchV96(resumed,1/120,{interact:true},{});}
 assert.equal(resumed.result?.winner,'player');assert.equal(resumed.result.reason,'operation-complete');assert.equal(resumed.hordeV180.totalKills,0);
 assert.ok(resumed.fighters.some(f=>f.side==='opponent'&&f.hp>0));assert.equal(resumed.result.operationV188.status,'completed');
});
