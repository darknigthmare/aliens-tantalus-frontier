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
// Native image dimensions use declared host decoding doubles. No browser QA is claimed.
// Actor positions, HP, clocks, objectives, hazards and outcomes are engine-owned.
const clone=value=>JSON.parse(JSON.stringify(value));
function target(extra={}){const events=new Map();return Object.assign({
 addEventListener(type,fn){if(!events.has(type))events.set(type,new Set());events.get(type).add(fn);},
 removeEventListener(type,fn){events.get(type)?.delete(fn);},
 emit(type,event={}){for(const fn of [...(events.get(type)||[])])fn({preventDefault(){},stopPropagation(){},...event});},
 count(){return [...events.values()].reduce((sum,set)=>sum+set.size,0);}
},extra);}
const pad=()=>({index:0,connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))});
const press=(controller,index,value=true)=>{controller.buttons[index]={pressed:value,value:value?1:0};};
function ticket(id='xto188-escort-1'){
 const t=beginXenoTrialsV96(createXenoTrialsProgressV96(),{playerId:'warrior',activityV119:{branch:id.startsWith('xto188-')?'operations':'horde',id}});
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


test('native keyboard E holds the physical cargo interaction and release stops its charge',async()=>{
 const h=host();await h.start();const initial=h.state();
 assert.equal(initial.config.operationV188.id,'xto188-escort-1');
 assert.equal(initial.operationV188.cargoTravelTicks,0);
 h.window.emit('keydown',{code:'KeyE',target:h.canvas});h.frames(12);
 const held=h.state();assert.ok(held.operationV188.cargoTravelTicks>0);assert.equal(held.fighters[0].previousInput.interact,true);
 h.window.emit('keyup',{code:'KeyE',target:h.canvas});h.frames(2);const released=h.state().operationV188.cargoTravelTicks;
 h.frames(12);assert.equal(h.state().operationV188.cargoTravelTicks,released);h.runtime.stop();
});

test('operation checkpoint contains the exact objective and hazard clocks and restores paused',async()=>{
 const t=ticket(),owner=ownerFor(t.state),h=host({config:t.config,owner});await h.start();
 h.runtime.setInput('interact',true);h.frames(26);assert.equal(h.runtime.pause(),true);
 const cp=normalizeXenoTrialsProgressV96(clone(owner.progress)).pending.checkpointV186;
 assert.ok(cp.snapshot.operationV188.cargoTravelTicks>0);assert.ok(cp.snapshot.stageHazardsV188);
 assert.equal(cp.snapshot.stageHazardsV188.lastTick,cp.tick);
 const r=host({config:t.config,resumeSnapshot:cp.snapshot});await r.start();
 assert.equal(r.state().paused,true);assert.deepEqual(r.state().operationV188,cp.snapshot.operationV188);
 assert.deepEqual(r.state().stageHazardsV188,cp.snapshot.stageHazardsV188);
 const frozen=clone(r.state());r.frames(90);assert.equal(r.state().tick,frozen.tick);
 assert.deepEqual(r.state().operationV188,frozen.operationV188);assert.deepEqual(r.state().stageHazardsV188,frozen.stageHazardsV188);
 r.runtime.resume();r.runtime.setInput('interact',true);r.frames(10);
 assert.ok(r.state().operationV188.elapsedTicks>frozen.operationV188.elapsedTicks);
 assert.ok(r.state().stageHazardsV188.lastTick>frozen.stageHazardsV188.lastTick);h.runtime.stop();r.runtime.stop();
});

test('restored operation rejects held L3 until a complete neutral sample rearms interaction',async()=>{
 const t=ticket(),owner=ownerFor(t.state),h=host({config:t.config,owner});await h.start();h.frames(5);h.runtime.pause();
 const cp=owner.progress.pending.checkpointV186,controller=pad();press(controller,10);
 const r=host({config:t.config,resumeSnapshot:cp.snapshot,pads:[controller]});await r.start();
 r.runtime.resume();r.frames(5);const frozen=r.state().operationV188.cargoTravelTicks;
 assert.equal(r.state().gamepadV186.needsNeutral,true);assert.equal(r.state().fighters[0].previousInput.interact,false);
 r.frames(10);assert.equal(r.state().operationV188.cargoTravelTicks,frozen);
 press(controller,10,false);r.frames(2);assert.equal(r.state().gamepadV186.needsNeutral,false);
 press(controller,10);r.frames(10);assert.equal(r.state().fighters[0].previousInput.interact,true);
 assert.ok(r.state().operationV188.cargoTravelTicks>frozen);h.runtime.stop();r.runtime.stop();
});

test('legacy horde ignores L3, keeps its eight action fields and never enables operations or hazards',async()=>{
 const controller=pad(),h=host({config:ticket('xth180-incoming-1').config,pads:[controller]});await h.start();h.frames(2);press(controller,10);h.frames(5);
 const state=h.state();assert.equal(state.operationV188,undefined);assert.equal(state.stageHazardsV188,undefined);
 assert.equal(state.operationViewV188,null);assert.equal(state.stageHazardViewV188,null);
 assert.deepEqual(Object.keys(state.fighters[0].previousInput).sort(),['left','right','jump','guard','light','heavy','special','super'].sort());
 assert.ok(Object.values(state.fighters[0].previousInput).every(value=>value===false));h.runtime.stop();
});

test('touch pointer interaction reaches the native input and pause releases the objective charge',async()=>{
 const h=host();await h.start();const button={control:true,dataset:{xenoAction:'interact'},getAttribute:key=>key==='data-xeno-action'?'interact':null,setPointerCapture(){},closest(){return this;}};
 h.root.emit('pointerdown',{target:button,pointerId:1,pointerType:'touch'});h.frames(8);
 assert.equal(h.state().fighters[0].previousInput.interact,true);assert.ok(h.state().operationV188.cargoTravelTicks>0);
 h.runtime.pause();const before=h.state().operationV188.cargoTravelTicks;
 h.root.emit('pointerup',{target:button,pointerId:1,pointerType:'touch'});h.runtime.resume();h.frames(5);
 assert.equal(h.state().fighters[0].previousInput.interact,false);assert.equal(h.state().operationV188.cargoTravelTicks,before);h.runtime.stop();
});
