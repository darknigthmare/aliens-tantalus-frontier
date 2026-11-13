import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createXenoTrialsRuntimeV96} from '../src/xeno-trials-runtime-v96.js';
import {XenoTrialsUiV96} from '../src/xeno-trials-ui-v96.js';
import {createXenoTrialsMatchV96,stepXenoTrialsMatchV96,getXenoTrialsSnapshotV96} from '../src/xeno-trials-engine-v96.js';
import {createXenoTrialsProgressV96,beginXenoTrialsV96,normalizeXenoTrialsProgressV96,checkpointXenoTrialsV186} from '../src/xeno-trials-progress-v96.js';
import {createXenoTrialsHordeCheckpointV186} from '../src/xeno-trials-horde-checkpoint-v186.js';
import {getXenoTrialsBodyBoundsV105 as bounds} from '../src/xeno-trials-geometry-v105.js';

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
function ticket(id='xth180-incoming-1'){
 const t=beginXenoTrialsV96(createXenoTrialsProgressV96(),{playerId:'warrior',activityV119:{branch:'horde',id}});
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
   saw=true;const ghostIds=new Set(state.defeatedViewsV186.map(ghost=>ghost.instanceId));
   assert.ok(state.rigViewsV154.some(view=>ghostIds.has(view.side)&&view.reactionV186?.state==='ko'));
   const ids=new Set(state.fighters.map(f=>f.instanceIdV180));assert.ok(state.defeatedViewsV186.every(ghost=>!ids.has(ghost.instanceId)));
   const saved=createXenoTrialsHordeCheckpointV186(state,t.config);assert.ok(saved);assert.ok(!('defeatedViewsV186' in saved.snapshot));break;
  }
 }
 assert.equal(saw,true);h.runtime.stop();
});
