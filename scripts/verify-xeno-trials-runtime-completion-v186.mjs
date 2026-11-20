import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createXenoTrialsRuntimeV96} from '../src/xeno-trials-runtime-v96.js';
import {XenoTrialsUiV96} from '../src/xeno-trials-ui-v96.js';
import {createXenoTrialsMatchV96,stepXenoTrialsMatchV96,getXenoTrialsSnapshotV96} from '../src/xeno-trials-engine-v96.js';
import {createXenoTrialsProgressV96,beginXenoTrialsV96,normalizeXenoTrialsProgressV96,checkpointXenoTrialsV186} from '../src/xeno-trials-progress-v96.js';
import {createXenoTrialsHordeCheckpointV186} from '../src/xeno-trials-horde-checkpoint-v186.js';
import {getXenoTrialsBodyBoundsV105 as bounds} from '../src/xeno-trials-geometry-v105.js';
import {getXenoTrialsArtV96} from '../src/xeno-trials-data-v96.js';
import {getXenoTrialsSpriteAtlasV188} from '../src/xeno-trials-sprite-atlas-v188.js';
import {ARBITER_MISSIONS_V190,createArbiterReceiptV190} from '../src/xeno-arbiter-campaign-v190.js';

// Production engine/controller and the real UI checkpoint method. DOM, RAF,
// image decoding and standard gamepads are declared deterministic host doubles.
// Native PNG dimensions are read from files; no screenshot/browser QA is claimed.
const clone=value=>JSON.parse(JSON.stringify(value));
function target(extra={}){const events=new Map();return Object.assign({
 addEventListener(type,fn){if(!events.has(type))events.set(type,new Set());events.get(type).add(fn);},
 removeEventListener(type,fn){events.get(type)?.delete(fn);},
 emit(type,event={}){for(const fn of [...(events.get(type)||[])])fn({preventDefault(){},stopPropagation(){},...event});},
 count(){return [...events.values()].reduce((sum,set)=>sum+set.size,0);}
},extra);}
const pad=()=>({index:0,connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))});
const press=(controller,index,value=true)=>{controller.buttons[index]={pressed:value,value:value?1:0};};
function ticket(id='xth180-incoming-1',playerId='warrior'){
 const progress=createXenoTrialsProgressV96();
 if(!progress.unlocked.includes(playerId))progress.unlocked.push(playerId);
 const t=beginXenoTrialsV96(progress,{playerId,activityV119:{branch:'horde',id}});
 assert.equal(t.applied,true);return t;
}
function archiveOperationTicket(kind){
 // Declared strategic receipts authorize the archive, with no local game-state fixture.
 const arbiterProgressV190={schema:190,completedCampaignIds:ARBITER_MISSIONS_V190.map(mission=>mission.campaignId),
  returns:ARBITER_MISSIONS_V190.map((mission,index)=>({campaignId:mission.campaignId,
   operationId:`operation-${index+1}-${mission.campaignId}`,receipt:createArbiterReceiptV190(mission)}))};
 const t=beginXenoTrialsV96(createXenoTrialsProgressV96(),{playerId:'runner',activityV119:{branch:'operations',id:`xto191-arbiter-vault-${kind}`}},{arbiterProgressV190});
 assert.equal(t.applied,true);return t;
}
function ownerFor(initial){
 let progress=initial,owned=true,commits=0;const status={textContent:''},ui=Object.create(XenoTrialsUiV96.prototype);
 Object.assign(ui,{active:true,generation:7,unsavedResult:null,canCommit:()=>owned,getProgress:()=>progress,
  onCommit:value=>{progress=clone(value);commits++;},el:()=>status});
 return{ui,status,get progress(){return progress;},get commits(){return commits;},set owned(value){owned=value;},
  checkpoint(snapshot,generation=7){return ui.persistCheckpointV186(snapshot,generation);}};
}
function dimensions(path){
 try{const bytes=readFileSync(new URL(`..${path}`,import.meta.url));if(bytes.subarray(1,4).toString()==='PNG')return{naturalWidth:bytes.readUInt32BE(16),naturalHeight:bytes.readUInt32BE(20),complete:true};}catch{}
 return{naturalWidth:1024,naturalHeight:1024,complete:true};
}
function host(options={}){
 const window=target(),document=target({hidden:false,focused:true,hasFocus(){return this.focused;}});
 const draws=[],ctx=new Proxy({globalAlpha:1,fillText(){},measureText:value=>({width:String(value).length*7}),
  drawImage(...args){draws.push(args);},createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},
  {get:(object,key)=>object[key]??(()=>{})});
 const canvas=target({tagName:'CANVAS',width:800,height:600,getContext:()=>ctx,setAttribute(){},closest:()=>null,
  focus(){document.activeElement=this;}});document.activeElement=canvas;
 const root=target({contains:item=>item?.control===true}),queue=new Map(),results=[],checkpoints=[];
 let serial=0,time=0,pads=options.pads||[];
 const runtime=createXenoTrialsRuntimeV96({canvas,window,document,controlsRoot:root,config:options.config||ticket().config,
  loadImage:async path=>dimensions(path),getGamepads:()=>pads,
  requestAnimationFrame:callback=>{queue.set(++serial,callback);return serial;},cancelAnimationFrame:id=>queue.delete(id),
  onResult:result=>results.push(result),onCheckpoint:(raw,reason)=>{checkpoints.push({raw:clone(raw),reason});return options.owner?.checkpoint(raw)??true;},
  ...options});
 const frames=(count=1,ms=1000/60)=>{for(let index=0;index<count;index++){time+=ms;const callbacks=[...queue.values()];queue.clear();for(const callback of callbacks)callback(time);}};
 return{runtime,window,document,canvas,root,queue,draws,results,checkpoints,frames,set pads(value){pads=value;},
  async start({skip=true}={}){assert.equal(await runtime.start(),true);if(skip)runtime.skipSequence();
   for(let frame=0;frame<600&&runtime.getState().presentation.blocksSimulation&&!runtime.getState().paused;frame++)frames(1);
   assert.equal(runtime.getState().presentation.blocksSimulation,false);frames(2);},
  state:()=>runtime.getState()};
}
const coreFrom=(state,reference)=>Object.fromEntries(Object.keys(reference).map(key=>[key,state[key]]));
const controls=match=>{const player=match.fighters[0],enemy=match.fighters.slice(1).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0];return{left:enemy?.x<player.x,right:enemy?.x>player.x,heavy:match.tick%180===0,light:match.tick%180===90};};
function workUntil(h,reached){
 let state=h.state();
 for(let frame=0;frame<550&&!state.result&&!reached(state.operationV188);frame++){
  const x=state.fighters[0].x,target=state.operationViewV188.target.x;
  h.runtime.setInput('left',x>target+15);h.runtime.setInput('right',x<target-15);h.runtime.setInput('interact',true);
  h.frames(1,1000/120);state=h.state();
 }
 assert.ok(reached(state.operationV188),`tick ${state.tick}, objective progress ${state.operationV188.progress}`);
 return state;
}

test('201 live raw snapshots pass the real UI checkpoint transaction without changing economy or ticket identity',async()=>{
 const t=ticket(),owner=ownerFor(t.state),h=host({config:t.config,owner});await h.start();
 for(let index=0;index<201;index++){
  h.frames(1,1000/120);assert.equal(owner.checkpoint(h.state()),true,`snapshot ${index}`);
  const cp=owner.progress.pending.checkpointV186;assert.equal(cp.tick,h.state().tick);assert.equal(cp.snapshot.config.matchId,t.config.matchId);
 }
 assert.equal(owner.commits,201);assert.equal(owner.progress.credits,t.state.credits);assert.equal(owner.progress.xp,0);
 assert.deepEqual(owner.progress.ledger,[]);assert.equal(owner.progress.wins,0);assert.equal(owner.progress.pending.matchId,t.state.pending.matchId);
 h.runtime.stop();
});

test('runtime pause saves its raw engine state through the UI and reload restores the exact admitted checkpoint',async()=>{
 const t=ticket(),owner=ownerFor(t.state),h=host({config:t.config,owner});await h.start();h.runtime.setInput('right',true);h.frames(35);
 assert.equal(h.runtime.pause(),true);assert.equal(h.checkpoints.at(-1).reason,'pause');assert.ok(!('presentation' in h.checkpoints.at(-1).raw));
 const saved=normalizeXenoTrialsProgressV96(clone(owner.progress));const cp=saved.pending.checkpointV186;assert.ok(cp);
 const r=host({config:saved.pending.config,resumeSnapshot:cp.snapshot});await r.start();
 assert.equal(r.state().resumedV186,true);assert.equal(r.state().paused,true);assert.equal(r.state().presentation.blocksSimulation,false);
 assert.deepEqual(coreFrom(r.state(),cp.snapshot),cp.snapshot);assert.equal(r.state().checkpointV186.reason,'restored');
 const before=r.state().tick;r.frames(25);assert.equal(r.state().tick,before);assert.equal(r.runtime.resume(),true);r.frames(3);assert.ok(r.state().tick>before);
 h.runtime.stop();r.runtime.stop();
});

test('horde intermission and the arrival of reinforcements save their own native state',async()=>{
 const t=ticket('xth180-incoming-1','queen'),owner=ownerFor(t.state),h=host({config:t.config,owner});await h.start();
 let active=h.state();
 for(let frame=0;frame<550&&active.hordeV180.phase==='active'&&!active.result;frame++){
  const {left,right}=controls(active);
  const input={left,right,heavy:active.tick%120===0,light:active.tick%120===50,special:active.tick%120===80};
  for(const [action,pressed] of Object.entries(input))h.runtime.setInput(action,pressed);
  h.frames(1,1000/120);active=h.state();
 }
 assert.equal(active.hordeV180.phase,'intermission',`tick ${active.tick}, kills ${active.hordeV180.totalKills}`);assert.ok(active.tick<600);
 assert.equal(h.checkpoints.at(-1)?.reason,'wave-clear');
 const first=normalizeXenoTrialsProgressV96(clone(owner.progress)).pending.checkpointV186.snapshot;
 assert.equal(first.tick,active.tick);assert.equal(first.hordeV180.wavesCleared,1);
 assert.equal(first.hordeV180.totalKills,5);assert.equal(first.fighters.length,1);
 const r=host({config:t.config,owner,resumeSnapshot:first});await r.start();
 assert.equal(r.state().paused,true);assert.deepEqual(coreFrom(r.state(),first),first);
 assert.equal(r.runtime.resume(),true);
 const commit=owner.ui.onCommit;
 owner.ui.onCommit=()=>{throw new Error('storage unavailable');};
 for(let frame=0;frame<125&&r.state().tick<first.hordeV180.nextWaveTick;frame++)r.frames(1,1000/120);
 owner.ui.onCommit=commit;
 const next=r.state();
 assert.equal(next.hordeV180.wave,2);assert.equal(next.hordeV180.phase,'active');
 assert.equal(next.hordeV180.wavesCleared,1);assert.equal(next.hordeV180.totalKills,5);
 assert.equal(r.checkpoints.at(-1)?.reason,'wave-start');
 assert.equal(next.checkpointV186.saved,false);
 assert.equal(owner.progress.pending.checkpointV186.tick,first.tick);
 assert.equal(r.runtime.pause(),true);
 const durable=normalizeXenoTrialsProgressV96(clone(owner.progress));
 const second=durable.pending.checkpointV186.snapshot;
 assert.equal(second.tick,next.tick);assert.deepEqual(coreFrom(r.state(),second),second);
 const reloaded=host({config:durable.pending.config,resumeSnapshot:second});await reloaded.start();
 assert.equal(reloaded.state().paused,true);assert.deepEqual(coreFrom(reloaded.state(),second),second);
 assert.equal(durable.pending.matchId,t.config.matchId);assert.equal(durable.credits,t.state.credits);
 assert.equal(durable.xp,t.state.xp);assert.deepEqual(durable.ledger,t.state.ledger);
 h.runtime.stop();r.runtime.stop();reloaded.runtime.stop();
});

test('Arbiter objective completions autosave immediately and an acquired caisson resumes before delivery',async()=>{
 for(const kind of ['relay','extraction']){
  const t=archiveOperationTicket(kind),owner=ownerFor(t.state),h=host({config:t.config,owner});await h.start();
  const first=workUntil(h,operation=>operation.completed[0]);
  assert.ok(first.tick<600);assert.equal(first.hordeV180.wave,1);
  assert.equal(h.checkpoints.length,1);assert.equal(h.checkpoints[0].reason,'operation-objective');
  const saved=normalizeXenoTrialsProgressV96(clone(owner.progress));const pickup=saved.pending.checkpointV186.snapshot;
  assert.equal(pickup.tick,first.tick);assert.deepEqual(pickup.operationV188,first.operationV188);
  assert.deepEqual(pickup.stageHazardsV188,first.stageHazardsV188);
  const r=host({config:saved.pending.config,owner,resumeSnapshot:pickup});await r.start();
  assert.equal(r.state().paused,true);assert.deepEqual(coreFrom(r.state(),pickup),pickup);
  if(kind==='extraction'){
   assert.equal(r.state().operationV188.carrying,0);assert.equal(r.state().operationV188.delivered[0],false);
   assert.equal(r.runtime.resume(),true);
   const commit=owner.ui.onCommit;owner.ui.onCommit=()=>{throw new Error('storage unavailable');};
   const delivered=workUntil(r,operation=>operation.delivered[0]);owner.ui.onCommit=commit;
   assert.ok(delivered.tick-pickup.tick<600);assert.equal(r.checkpoints.at(-1)?.reason,'operation-delivery');
   assert.equal(delivered.operationV188.carrying,-1);assert.equal(delivered.checkpointV186.saved,false);
   assert.equal(owner.progress.pending.checkpointV186.tick,pickup.tick);
   assert.equal(r.runtime.saveCheckpoint(),true);
   const durable=normalizeXenoTrialsProgressV96(clone(owner.progress));const deposit=durable.pending.checkpointV186.snapshot;
   assert.equal(deposit.tick,delivered.tick);assert.deepEqual(deposit.operationV188,delivered.operationV188);
   assert.deepEqual(deposit.stageHazardsV188,delivered.stageHazardsV188);
   const reloaded=host({config:durable.pending.config,resumeSnapshot:deposit});await reloaded.start();
   assert.equal(reloaded.state().paused,true);assert.deepEqual(coreFrom(reloaded.state(),deposit),deposit);reloaded.runtime.stop();
  }
  assert.equal(owner.progress.pending.matchId,t.config.matchId);assert.equal(owner.progress.credits,t.state.credits);
  assert.equal(owner.progress.xp,t.state.xp);assert.deepEqual(owner.progress.ledger,t.state.ledger);
  h.runtime.stop();r.runtime.stop();
 }
});

test('a refused milestone retries during live play and persistent refusal exhausts its retry budget',async()=>{
 for(const recover of [true,false]){
  const t=archiveOperationTicket('extraction'),owner=ownerFor(t.state),h=host({config:t.config,owner});await h.start();
  assert.equal(h.runtime.saveCheckpoint(),true);
  const original=clone(owner.progress.pending.checkpointV186);const commit=owner.ui.onCommit;let attempts=0;
  owner.ui.onCommit=value=>{
   attempts++;
   if(!recover||attempts===1)throw new Error('storage unavailable');
   commit(value);
  };
  const pickup=workUntil(h,operation=>operation.completed[0]);
  for(const action of ['left','right','interact'])h.runtime.setInput(action,false);
  assert.equal(pickup.checkpointV186.saved,false);assert.deepEqual(owner.progress.pending.checkpointV186,original);
  assert.equal(attempts,1);
  h.frames(24);
  assert.equal(attempts,1,'no early retry during the first 400 ms');
  h.frames(86);
  assert.equal(h.state().paused,false);assert.equal(h.state().hordeV180.wave,1);
  assert.ok(h.state().tick-pickup.tick<600,'ordinary periodic save has not run');
  assert.deepEqual(h.checkpoints.slice(1).map(row=>row.reason),recover
   ? ['operation-objective','milestone-retry'] : ['operation-objective','milestone-retry','milestone-retry']);
  assert.equal(attempts,recover?2:3);
  assert.equal(owner.commits,recover?2:1);
  const durable=normalizeXenoTrialsProgressV96(clone(owner.progress));
  assert.equal(durable.pending.matchId,t.config.matchId);
  assert.equal(durable.credits,t.state.credits);assert.equal(durable.xp,t.state.xp);assert.deepEqual(durable.ledger,t.state.ledger);
  if(recover){
   const saved=durable.pending.checkpointV186.snapshot;
   assert.equal(h.state().checkpointV186.saved,true);assert.ok(saved.tick>pickup.tick);
   assert.equal(saved.operationV188.carrying,0);assert.equal(saved.operationV188.delivered[0],false);
   const restored=host({config:durable.pending.config,resumeSnapshot:saved});await restored.start();
   assert.equal(restored.state().paused,true);assert.deepEqual(coreFrom(restored.state(),saved),saved);restored.runtime.stop();
  }else{
   assert.equal(h.state().checkpointV186.saved,false);assert.deepEqual(durable.pending.checkpointV186,original);
  }
  h.runtime.stop();
 }
});

test('an interrupted result write retries once and returning preserves the proved outcome',context=>{
 context.mock.timers.enable({apis:['setTimeout']});
 const t=beginXenoTrialsV96(createXenoTrialsProgressV96(),{
  playerId:'warrior',opponentId:'runner',difficulty:'easy',roundSeconds:30,
  activityV119:{branch:'on-demand',id:'on-demand',rules:{initialHp:1}}
 });
 assert.equal(t.applied,true);
 const match=createXenoTrialsMatchV96({...t.config,introSeconds:0});
 for(let tick=0;tick<3000&&!match.result;tick++)stepXenoTrialsMatchV96(match,1/120,controls(match));
 assert.equal(match.phase,'match-over');assert.equal(match.result.reason,'ko');
 for(const scenario of ['return','stay','owner-change','persistent']){
  const owner=ownerFor(t.state),elements=new Map(),ui=owner.ui;
  Object.assign(ui,{root:{removeAttribute(){}},render(){},el(key){
   if(!elements.has(key))elements.set(key,{hidden:true,textContent:''});
   return elements.get(key);
  }});
  const commit=ui.onCommit;let attempts=0;
  ui.onCommit=value=>{
   attempts++;
   if(attempts===1||scenario==='persistent'&&attempts===2)throw new Error('storage unavailable');
   commit(value);
  };
  assert.equal(ui.finish(match.result),false);
  assert.equal(ui.unsavedResult,match.result);assert.equal(ui.el('retry-save').hidden,false);
  assert.equal(owner.progress.pending.matchId,t.config.matchId);assert.deepEqual(owner.progress.ledger,[]);
  if(scenario==='owner-change')owner.owned=false;
  if(scenario==='return'||scenario==='owner-change')ui.close();
  context.mock.timers.tick(499);
  assert.equal(attempts,scenario==='return'?2:1,'no deferred write before half a second');
  context.mock.timers.tick(2500);
  assert.equal(attempts,scenario==='owner-change'?1:2);
  if(scenario==='owner-change'){
   assert.equal(owner.progress.pending.matchId,t.config.matchId);assert.deepEqual(owner.progress.ledger,[]);
   assert.equal(owner.progress.credits,t.state.credits);continue;
  }
  if(scenario==='persistent'){
   assert.equal(owner.progress.pending.matchId,t.config.matchId);assert.deepEqual(owner.progress.ledger,[]);
   assert.equal(ui.unsavedResult,match.result);assert.equal(ui.el('retry-save').hidden,false);
   assert.equal(ui.finish(ui.unsavedResult),true,'manual retry stays available after the deferred retry fails');
  }
  assert.equal(ui.unsavedResult,null);assert.equal(ui.el('retry-save').hidden,true);
  assert.equal(owner.progress.pending,null);assert.equal(owner.progress.ledger.length,1);
  const receipt=owner.progress.ledger[0];
  assert.equal(receipt.matchId,t.config.matchId);assert.equal(receipt.winner,match.result.winner);
  assert.equal(owner.progress.credits,t.state.credits+receipt.credits);assert.equal(owner.progress.xp,t.state.xp+receipt.xp);
  assert.equal(ui.finish(match.result),false);assert.equal(owner.progress.ledger.length,1);
 }
});

test('manual and timed next rounds save the native score during the new countdown',async()=>{
 for(const manual of [true,false]){
  const t=beginXenoTrialsV96(createXenoTrialsProgressV96(),{
   playerId:'warrior',opponentId:'runner',difficulty:'easy',roundSeconds:30,
   activityV119:{branch:'on-demand',id:'on-demand',rules:{initialHp:1}}
  });
  assert.equal(t.applied,true);
  const owner=ownerFor(t.state),h=host({config:t.config,owner});
  await h.start();
  let active=h.state();
  for(let frame=0;frame<250&&active.phase==='active';frame++){
   const input=controls(active);
   for(const action of ['left','right','light','heavy'])h.runtime.setInput(action,input[action]);
   h.frames();
   active=h.state();
  }
  assert.equal(active.phase,'round-over');
  assert.ok(active.events.some(event=>event.type==='round-end'&&event.reason==='ko'));
  assert.ok(active.tick<600,'KO occurred before the periodic autosave');
  assert.equal(h.checkpoints.at(-1)?.reason,'round-end');
  assert.equal(owner.progress.pending.duelCheckpointV197.snapshot.roundWinner,active.roundWinner);
  const wins=active.wins;
  // The timed path models one refused write to exercise the real pause retry.
  const commit=owner.ui.onCommit;
  if(!manual)owner.ui.onCommit=()=>{throw new Error('storage unavailable');};
  if(manual)assert.equal(h.runtime.nextRound(),true);
  else for(let frame=0;frame<120&&h.state().round===1;frame++)h.frames();
  owner.ui.onCommit=commit;
  const countdown=h.state();
  assert.equal(countdown.round,2);
  assert.equal(countdown.presentation.phase,'countdown');
  assert.equal(h.checkpoints.at(-1).reason,'round-start');
  assert.equal(countdown.checkpointV186.saved,manual);
  assert.equal(owner.progress.pending.duelCheckpointV197.snapshot.round,manual?2:1);
  assert.deepEqual(owner.progress.pending.duelCheckpointV197.snapshot.wins,wins);

  assert.equal(h.runtime.pause(),true);
  assert.equal(h.checkpoints.at(-1).reason,'pause');
  assert.equal(h.checkpoints.at(-1).raw.round,2);
  assert.equal(h.state().checkpointV186.saved,true);
  h.runtime.stop();
  assert.equal(h.checkpoints.at(-1).reason,'stop');
  const durable=normalizeXenoTrialsProgressV96(clone(owner.progress));
  assert.equal(durable.credits,t.state.credits);
  assert.deepEqual(durable.ledger,t.state.ledger);
  const second=durable.pending.duelCheckpointV197.snapshot;
  assert.equal(second.round,2);
  assert.equal(second.tick,countdown.tick);
  assert.deepEqual(second.wins,wins);
  const restored=host({config:durable.pending.config,resumeDuelSnapshot:second});
  await restored.start();
  assert.equal(restored.state().paused,true);
  assert.deepEqual(coreFrom(restored.state(),second),second);
  assert.equal(restored.runtime.resume(),true);restored.frames(3);
  assert.ok(restored.state().tick>second.tick);
  assert.deepEqual(restored.state().wins,wins);
  assert.equal(restored.results.length,0);
  restored.runtime.stop();
 }
});

test('periodic checkpoints contain raw snapshots and a storage refusal is visible without awarding a result',async()=>{
 const t=ticket(),h=host({config:t.config,onCheckpoint:()=>false});await h.start();h.runtime.setInput('guard',true);h.frames(320);
 assert.equal(h.state().checkpointV186.saved,false);assert.equal(h.state().checkpointV186.reason,'periodic');assert.equal(h.results.length,0);
 h.runtime.stop();
});

test('a temporarily empty final wave reloads with the player alone and waits for its remaining reinforcements',async()=>{
 const t=ticket(),m=createXenoTrialsMatchV96({...t.config,introSeconds:0,holdRoundTransition:true});
 for(let step=0;step<20000&&!m.result&&m.hordeV180.wave< m.hordeV180.waveCount;step++)stepXenoTrialsMatchV96(m,1/120,controls(m));
 assert.equal(m.hordeV180.wave,m.hordeV180.waveCount);assert.equal(m.result,null);
 // Declared spatial fixture: position the final wave's existing first cohort
 // within one native sweep. HP, time, kills and damage remain engine-owned.
 while(m.fighters[0].attack)stepXenoTrialsMatchV96(m,1/120,{},{});
 const player=m.fighters[0];player.x=0;
 for(const[index,enemy]of m.fighters.slice(1).entries())enemy.x=bounds(player).right+(enemy.x-bounds(enemy).left)+index*4;
 for(let step=0;step<65&&m.fighters.length>1;step++)stepXenoTrialsMatchV96(m,1/120,{heavy:true},{});
 assert.equal(m.fighters.length,1);assert.ok(m.hordeV180.remaining>0);assert.equal(m.phase,'active');
 const transaction=checkpointXenoTrialsV186(t.state,getXenoTrialsSnapshotV96(m));assert.equal(transaction.applied,true);
 const cp=transaction.state.pending.checkpointV186,r=host({config:t.config,resumeSnapshot:cp.snapshot});await r.start();
 assert.equal(r.state().fighters.length,1);assert.equal(r.state().hordeV180.wave,m.hordeV180.wave);assert.equal(r.state().fighters[0].hp,player.hp);
 assert.equal(r.runtime.resume(),true);r.frames(60);assert.ok(r.state().fighters.length>1,'Director waits for the actual nextSpawnTick, then brings reinforcements');
 r.runtime.stop();
});

test('a connected standard pad needs neutral before heavy attack and held heavy cannot manufacture a second press',async()=>{
 const controller=pad();press(controller,3);const h=host({pads:[controller]});await h.start();h.frames(3);
 assert.equal(h.state().gamepadV186.connected,true);assert.equal(h.state().gamepadV186.needsNeutral,true);assert.equal(h.state().fighters[0].attack,null);
 press(controller,3,false);h.frames(2);assert.equal(h.state().gamepadV186.needsNeutral,false);
 press(controller,3);h.frames(2);assert.equal(h.state().fighters[0].attack?.kind,'heavy');const first=h.state().fighters[0].attack.id;
 h.frames(50);assert.ok(h.state().fighters[0].attack===null||h.state().fighters[0].attack.id===first);
 press(controller,3,false);h.frames(2);assert.equal(h.state().fighters[0].previousInput.heavy,false);h.runtime.stop();
});

test('Start pauses once while held, release arms it and a fresh Start resumes once',async()=>{
 const controller=pad(),h=host({pads:[controller]});await h.start();h.frames(2);press(controller,9);h.frames(1);
 assert.equal(h.state().paused,true);const tick=h.state().tick;h.frames(40);assert.equal(h.state().paused,true);assert.equal(h.state().tick,tick);
 press(controller,9,false);h.frames(2);press(controller,9);h.frames(1);assert.equal(h.state().paused,false);
 h.frames(10);assert.equal(h.state().paused,false);assert.ok(h.state().tick>tick);h.runtime.stop();
});

test('disconnecting the owning pad pauses physics, releases held actions and parks its polling frame',async()=>{
 const controller=pad(),h=host({pads:[controller]});await h.start();h.frames(2);controller.axes[0]=1;h.frames(4);
 assert.equal(h.state().fighters[0].previousInput.right,true);h.pads=[];h.frames(1);assert.equal(h.state().paused,true);
 const before=h.state();h.frames(30);assert.equal(h.state().tick,before.tick);assert.equal(h.state().fighters[0].previousInput.right,false);
 assert.equal(h.state().gamepadV186.connected,false);assert.equal(h.queue.size,0);h.runtime.stop();
});

test('blur parks pad polling and focus restarts neutral sampling so Start can resume the same simulation',async()=>{
 const controller=pad(),h=host({pads:[controller]});await h.start();h.frames(2);
 h.document.focused=false;h.window.emit('blur');const tick=h.state().tick;h.frames(3);assert.equal(h.state().paused,true);assert.equal(h.queue.size,0);
 h.document.focused=true;h.window.emit('focus');h.frames(2);press(controller,9);h.frames(1);
 assert.equal(h.state().paused,false);h.frames(3);assert.ok(h.state().tick>tick);h.runtime.stop();
});

test('stop with an owning connected pad removes listeners and all simulation/pause RAF callbacks',async()=>{
 const controller=pad(),h=host({pads:[controller]});await h.start();h.frames(2);h.runtime.pause();assert.ok(h.queue.size>0);
 h.runtime.stop();h.runtime.stop();assert.equal(h.queue.size,0);assert.equal(h.window.count(),0);assert.equal(h.document.count(),0);assert.equal(h.root.count(),0);
 const tick=h.state().tick;press(controller,9);h.frames(40);assert.equal(h.state().tick,tick);assert.equal(h.queue.size,0);
 assert.deepEqual([h.canvas.width,h.canvas.height],[800,600]);
});

test('late checkpoint callbacks cannot commit after UI generation or save ownership changes',async()=>{
 const t=ticket(),owner=ownerFor(t.state),h=host({config:t.config,owner});await h.start();h.frames(10);const raw=h.state();
 assert.equal(owner.checkpoint(raw),true);const before=clone(owner.progress),count=owner.commits;
 owner.ui.generation++;assert.equal(owner.checkpoint(raw,7),false);owner.ui.generation=7;owner.owned=false;
 assert.equal(owner.checkpoint(raw,7),false);h.runtime.pause();h.runtime.stop();
 assert.deepEqual(owner.progress,before);assert.equal(owner.commits,count);assert.equal(owner.progress.wins,0);assert.deepEqual(owner.progress.ledger,[]);
});

test('late image completion after owner closure leaves no callbacks, checkpoint or autonomous result',async()=>{
 let resolve;const image=new Promise(done=>{resolve=done;}),t=ticket(),owner=ownerFor(t.state),h=host({config:t.config,owner,loadImage:()=>image});
 const started=h.runtime.start();owner.ui.active=false;h.runtime.stop();resolve({naturalWidth:1536,naturalHeight:1024});assert.equal(await started,false);
 h.frames(300);assert.equal(h.queue.size,0);assert.equal(owner.commits,0);assert.equal(h.results.length,0);assert.equal(h.window.count(),0);
});

test('owner closure from an active connected-pad state callback cannot leave an orphan RAF',async()=>{
 const controller=pad();let h,closedAt=null;
 h=host({pads:[controller],onState:state=>{if(h&&state.gamepadV186?.connected&&!state.presentation.blocksSimulation&&closedAt===null){closedAt=state.tick;h.runtime.stop();}}});
 assert.equal(await h.runtime.start(),true);h.runtime.skipSequence();
 for(let frame=0;frame<600&&closedAt===null;frame++)h.frames(1);
 assert.notEqual(closedAt,null);assert.equal(h.queue.size,0);assert.equal(h.window.count(),0);assert.equal(h.document.count(),0);
 h.frames(50);assert.equal(h.state().tick,closedAt);assert.equal(h.results.length,0);
});

test('closing the owner inside a checkpoint callback does not recursively checkpoint the same runtime',async()=>{
 let h,calls=0;
 h=host({onCheckpoint:()=>{calls++;if(calls<20)h.runtime.stop();return false;}});
 await h.start();h.runtime.pause();
 assert.equal(calls,1,'A checkpoint callback that closes its owner is never called recursively by stop');
 assert.equal(h.queue.size,0);assert.equal(h.window.count(),0);assert.equal(h.results.length,0);
});

test('native engine kills render source-backed KO ghosts while other horde enemies remain alive, without entering checkpoints',async()=>{
 const t=ticket(),m=createXenoTrialsMatchV96({...t.config,introSeconds:0,holdRoundTransition:true}),player=m.fighters[0];
 stepXenoTrialsMatchV96(m,1/120,{},{});player.x=0;
 // Declared positions only: two contacts in the sweep, a third safely outside.
 for(const[index,enemy]of m.fighters.slice(1).entries())enemy.x=index<2?bounds(player).right+(enemy.x-bounds(enemy).left)+index*4:1000;
 const cp=createXenoTrialsHordeCheckpointV186(m,t.config);assert.ok(cp);const h=host({config:t.config,resumeSnapshot:cp.snapshot});await h.start();h.runtime.resume();h.frames(2);
 h.runtime.setInput('heavy',true);let saw=false;
 for(let frame=0;frame<60;frame++){
  h.frames(1);const state=h.state();assert.ok(state.defeatedViewsV186.length<=16);
  if(state.defeatedViewsV186.length&&state.fighters.some(f=>f.side==='opponent'&&f.hp>0)){
   saw=true;
   // V188 admits drawn corpses for four identities. A genuine ghost must
   // retain its exact source receipt through either admitted renderer.
   for(const ghost of state.defeatedViewsV186){
    const view=state.rigViewsV154.find(view=>view.side===ghost.instanceId);assert.ok(view);
    const atlas=getXenoTrialsSpriteAtlasV188(ghost,getXenoTrialsArtV96(ghost.id));
    if(atlas){
     assert.equal(view.spriteAtlasV188?.fighterId,ghost.id);
     assert.equal(view.spriteAtlasV188?.phase,'ko');
     assert.ok(['ko-fall','ko-ground'].includes(view.spriteAtlasV188?.frameId));
     assert.equal(view.spriteAtlasV188?.path,atlas.texture.path);
     assert.equal(view.spriteAtlasV188?.sha256,atlas.texture.sha256);
     assert.ok(view.bounds.bottom<=450+1e-6,'Drawn KO never floats below the contact line');
    }else assert.equal(view.reactionV186?.state,'ko');
   }
   const ids=new Set(state.fighters.map(f=>f.instanceIdV180));assert.ok(state.defeatedViewsV186.every(ghost=>!ids.has(ghost.instanceId)));
   const saved=createXenoTrialsHordeCheckpointV186(state,t.config);assert.ok(saved);assert.ok(!('defeatedViewsV186' in saved.snapshot));break;
  }
 }
 assert.equal(saw,true);h.runtime.stop();
});
