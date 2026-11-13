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
 const frames=(count=1,ms=1000/60)=>{for(let index=0;index<count;index++){time+=ms;options.audioDirector?.context?.advance?.(time/1000);const callbacks=[...queue.values()];queue.clear();for(const callback of callbacks)callback(time);}};
 return{runtime,window,document,canvas,root,queue,draws,results,checkpoints,frames,set pads(value){pads=value;},
  async start({skip=true}={}){assert.equal(await runtime.start(),true);if(skip)runtime.skipSequence();
   for(let frame=0;frame<600&&runtime.getState().presentation.blocksSimulation&&!runtime.getState().paused;frame++)frames(1);
   assert.equal(runtime.getState().presentation.blocksSimulation,false);frames(2);},
  state:()=>runtime.getState()};
}
const coreFrom=(state,reference)=>Object.fromEntries(Object.keys(reference).map(key=>[key,state[key]]));
const controls=match=>{const player=match.fighters[0],enemy=match.fighters.slice(1).sort((a,b)=>Math.abs(a.x-player.x)-Math.abs(b.x-player.x))[0];return{left:enemy?.x<player.x,right:enemy?.x>player.x,heavy:match.tick%180===0,light:match.tick%180===90};};



// WebAudio below is a declared host double for controller integration only.
// The separate Playwright QA observes Chromium's actual WebAudio graph.
class Parameter {constructor(value=1){this.value=value;}setValueAtTime(v){this.value=v;}linearRampToValueAtTime(v){this.value=v;}exponentialRampToValueAtTime(v){this.value=v;}}
class AudioNodeDouble {
 constructor(context,kind){this.context=context;this.kind=kind;this.gain=new Parameter();this.frequency=new Parameter();this.links=new Set();context.nodes.push(this);}
 connect(node){this.links.add(node);return node;}disconnect(){this.links.clear();}start(){this.started=true;}
 stop(at=this.context.currentTime){this.endsAt=at;if(at<=this.context.currentTime&&!this.ended){this.ended=true;this.onended?.();}}
}
class AudioContextDouble {
 constructor(){this.state='running';this.currentTime=0;this.nodes=[];this.destination={};this.closeCalls=0;this.suspendCalls=0;}
 createGain(){return new AudioNodeDouble(this,'gain');}createOscillator(){return new AudioNodeDouble(this,'oscillator');}
 resume(){this.state='running';return Promise.resolve();}suspend(){this.suspendCalls++;this.state='suspended';return Promise.resolve();}
 close(){this.closeCalls++;this.state='closed';return Promise.resolve();}
 advance(time){this.currentTime=time;for(const node of this.nodes)if(node.endsAt<=time&&!node.ended){node.ended=true;node.onended?.();}}
}
function director({locked=false,effects=.7}={}){
 const d={enabled:true,disposed:false,volumes:{master:1,effects,music:0},context:null,master:null,unlocks:0,
  unlock(){this.unlocks++;if(!this.context){this.context=new AudioContextDouble();this.master=this.context.createGain();this.master.gain.value=this.volumes.effects*.26;this.master.connect(this.context.destination);}return this.context.resume();}};
 if(!locked)d.unlock();return d;
}
const ownReceipt=(state,revision=189)=>state.rigViewsV154.find(view=>view.side==='player'&&view[`spriteAtlasV${revision}`]);

test('runtime does not construct audio before a trusted input and rejects an untrusted unlock',async()=>{
 const audio=director({locked:true}),h=host({audioDirector:audio});await h.start();h.frames(10);
 assert.equal(audio.context,null);assert.equal(h.state().audioV189.status,'locked');
 assert.equal(await h.runtime.unlockAudio({type:'keydown',isTrusted:false}),false);assert.equal(audio.context,null);
 h.window.emit('keydown',{type:'keydown',code:'ArrowLeft',target:h.canvas,isTrusted:true});await Promise.resolve();h.frames(2);
 assert.equal(audio.unlocks,1);assert.equal(h.state().audioV189.contextState,'running');assert.equal(h.state().audioV189.usingSharedContext,true);h.runtime.stop();
});

test('native controller displacement paints all eight Warrior motion frames while pause freezes simulation',async()=>{
 const t=beginXenoTrialsV96(createXenoTrialsProgressV96(),{playerId:'warrior',opponentId:'smasher',difficulty:'easy'});assert.equal(t.applied,true);
 const h=host({config:t.config});await h.start();h.runtime.setInput('left',true);const seen=new Set(),start=h.state().fighters[0].x;
 for(let frame=0;frame<500&&seen.size<8;frame++){h.frames(1,1000/120);const r=ownReceipt(h.state());if(r?.spriteAtlasV189.kind==='motion'&&r.spriteAtlasV189.frameId.startsWith('walk-'))seen.add(r.spriteAtlasV189.frameId);}
 assert.deepEqual([...seen].sort(),Array.from({length:8},(_,i)=>`walk-${i}`));assert.ok(h.state().fighters[0].x<start-20);
 h.runtime.pause();const frozen=h.state();h.frames(40);assert.equal(h.state().tick,frozen.tick);assert.deepEqual(h.state().rigViewsV154,frozen.rigViewsV154);
 h.runtime.resume();h.runtime.setInput('left',true);h.frames(8);assert.ok(h.state().tick>frozen.tick);h.runtime.stop();
});

test('native jump velocity chooses drawn rise and fall with no artificial foot supports',async()=>{
 const t=beginXenoTrialsV96(createXenoTrialsProgressV96(),{playerId:'warrior',opponentId:'smasher',difficulty:'easy'}),h=host({config:t.config});await h.start();
 h.runtime.setInput('jump',true);h.frames(2,1000/120);h.runtime.setInput('jump',false);const phases=new Map();
 for(let frame=0;frame<250;frame++){const s=h.state(),r=ownReceipt(s);if(r?.spriteAtlasV189.frameId.startsWith('air-'))phases.set(r.spriteAtlasV189.frameId,{r,f:s.fighters[0]});h.frames(1,1000/120);if(phases.size===2&&h.state().fighters[0].y===0)break;}
 assert.deepEqual([...phases.keys()].sort(),['air-fall','air-rise']);assert.ok(phases.get('air-rise').f.vy>0);assert.ok(phases.get('air-fall').f.vy<=0);
 for(const {r}of phases.values()){assert.deepEqual(r.supports,[]);assert.equal(r.spriteAtlasV189.grounded,false);}
 assert.equal(h.state().fighters[0].y,0);assert.equal(ownReceipt(h.state()),undefined);assert.ok(ownReceipt(h.state(),188));h.runtime.stop();
});

test('pause, local mute, global zero effects and stop release only owned audio nodes',async()=>{
 const audio=director(),h=host({audioDirector:audio});await h.start();h.frames(10);assert.ok(h.state().audioV189.activeVoices>0);
 h.runtime.pause();assert.equal(h.state().audioV189.activeVoices,0);assert.equal(audio.context.state,'running');
 h.runtime.setAudioEnabled(false);h.runtime.resume();h.frames(5);assert.equal(h.state().audioV189.status,'muted');assert.equal(h.state().audioV189.activeVoices,0);
 h.runtime.setAudioEnabled(true);h.frames(3);assert.ok(h.state().audioV189.activeVoices>0);
 audio.volumes.effects=0;audio.master.gain.value=0;h.frames(3);assert.equal(h.state().audioV189.activeVoices,0);assert.equal(h.state().audioV189.gain,0);
 h.runtime.stop();assert.equal(h.state().audioV189.status,'stopped');assert.equal(audio.context.closeCalls,0);assert.equal(audio.context.suspendCalls,0);assert.equal(h.state().audioV189.timers,0);assert.equal(h.state().audioV189.animationFrames,0);
});

test('a real checkpoint transaction keeps audio out of engine persistence and primes old event serials on restore',async()=>{
 const t=ticket(),owner=ownerFor(t.state),audio=director(),h=host({config:t.config,owner,audioDirector:audio});await h.start();h.runtime.setInput('heavy',true);h.frames(60);h.runtime.pause();
 const cp=normalizeXenoTrialsProgressV96(clone(owner.progress)).pending.checkpointV186;assert.ok(cp);assert.equal('audioV189'in cp.snapshot,false);assert.equal('rigViewsV154'in cp.snapshot,false);
 const restoredAudio=director(),r=host({config:t.config,resumeSnapshot:cp.snapshot,audioDirector:restoredAudio});await r.start();r.frames(30);
 assert.equal(r.state().paused,true);assert.equal(r.state().audioV189.consumedSerial,cp.snapshot.serial);assert.equal(r.state().audioV189.emittedCues,0);assert.equal(r.state().audioV189.activeVoices,0);assert.equal(r.state().tick,cp.tick);
 h.runtime.stop();r.runtime.stop();
});

test('public runtime stop cancels pending shared unlock promises and rejects late provider work', {timeout:2000}, async()=>{
 const audio=director({locked:true});let resolveProvider;
 audio.unlock=function(){this.unlocks++;this.context=new AudioContextDouble();this.context.state='suspended';this.master=this.context.createGain();this.master.connect(this.context.destination);return new Promise(resolve=>{resolveProvider=resolve;});};
 const h=host({audioDirector:audio});await h.start();
 const first=h.runtime.unlockAudio({type:'keydown',isTrusted:true}),duplicate=h.runtime.unlockAudio({type:'keydown',isTrusted:true});
 assert.equal(audio.unlocks,1);assert.equal(h.state().audioV189.activeVoices,0);h.runtime.stop();
 assert.deepEqual(await Promise.all([first,duplicate]),[false,false]);assert.equal(h.state().audioV189.status,'stopped');
 audio.context.state='running';resolveProvider(true);await Promise.resolve();await Promise.resolve();h.frames(3);
 assert.equal(h.state().audioV189.activeVoices,0);assert.equal(audio.context.nodes.filter(node=>node.kind==='oscillator').length,0);
 assert.equal(audio.context.closeCalls,0);assert.equal(audio.context.suspendCalls,0);assert.equal(await h.runtime.unlockAudio({type:'keydown',isTrusted:true}),false);
});
