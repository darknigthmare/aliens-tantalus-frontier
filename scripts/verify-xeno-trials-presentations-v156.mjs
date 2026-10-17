import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { XENO_TRIALS_SEQUENCES_V155 as historical, XENO_TRIALS_ADDED_SEQUENCES_V156 as added, XENO_TRIALS_SEQUENCES_V156 as sequences,
 getXenoTrialsSequenceV155 as entry,sampleXenoTrialsSequenceV155 as sample,
 getXenoTrialsSequenceCueV156 as cue,createXenoTrialsTerminalV156 as terminal,
 createXenoTrialsTauntV156 as taunt,advanceXenoTrialsTauntV156 as advanceTaunt,
 createXenoTrialsOutroV155 as outro,advanceXenoTrialsOutroV155 as advance,skipXenoTrialsOutroV155 as skip } from '../src/xeno-trials-sequences-v155.js';
import { XENO_TRIALS_RIGS_V154 as rigs,getXenoTrialsRigMeshV154 as mesh,drawXenoTrialsRigV154 as draw,xenoTrialsTriangleAreaV154 as area } from '../src/xeno-trials-rig-v154.js';
import { XENO_TRIALS_FIGHTERS_V96 as roster } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96 as create,stepXenoTrialsMatchV96 as step,nextXenoTrialsRoundV96 as next } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsRuntimeV96 as runtime } from '../src/xeno-trials-runtime-v96.js';
import { XenoTrialsUiV96 } from '../src/xeno-trials-ui-v96.js';
const copy = x => JSON.parse(JSON.stringify(x));
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const HUMAN = 'dd-darwin-era-cultist';
const image = r => ({naturalWidth:r.sourceWidth,naturalHeight:r.sourceHeight,complete:true});
const metrics = r => ({width:r.sourceWidth*.25,height:r.sourceHeight*.25,pivotX:.5,bottom:1});
function target(props={}) {
 const handlers=new Map();
 return Object.assign({addEventListener(k,f){if(!handlers.has(k))handlers.set(k,new Set());handlers.get(k).add(f);},
 removeEventListener(k,f){handlers.get(k)?.delete(f);},
 emit(k,e={}){for(const f of [...handlers.get(k)||[]])f({preventDefault(){},stopPropagation(){},...e});}},props);
}
function host(extra={}) {
 const window=target(),document=target({hidden:false,focused:true,hasFocus(){return this.focused;}});
 const text=[],ctx=new Proxy({fillText:s=>text.push(String(s)),measureText:s=>({width:String(s).length*7}),createLinearGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]||(()=>{})});
 const canvas=target({tagName:'CANVAS',width:1000,height:560,getContext:()=>ctx,setAttribute(){},closest:()=>null,focus(){document.activeElement=this;}});
 const queue=new Map(),results=[];let serial=0,time=0;
 const r=runtime({canvas,window,document,config:{playerId:HUMAN,opponentId:'prowler',seed:155,difficulty:'hard',roundSeconds:30,rulesV119:{initialHp:1}},
  loadImage:async path=>image(rigs.find(r=>r.path===path)||{sourceWidth:1000,sourceHeight:560}),
  requestAnimationFrame:f=>{queue.set(++serial,f);return serial;},cancelAnimationFrame:id=>queue.delete(id),onResult:x=>results.push(copy(x)),...extra});
 const frames=(n=1,ms=100)=>{for(let i=0;i<n;i++){time+=ms;const calls=[...queue.values()];queue.clear();for(const f of calls)f(time);assert.ok(queue.size<=1,'at most one scheduled frame');}};
 return {r,canvas,window,document,queue,results,text,frames,
  key(code,down=true){window.emit(down?'keydown':'keyup',{code,target:canvas});},
  async start(){assert.equal(await r.start(),true);},
  terminal(){for(let i=0;i<2000&&r.getState().phase!=='match-over';i++)frames();assert.equal(r.getState().phase,'match-over');}
 };
}
// Exercise the actual constructor's button callback and updateMatch focus state;
// only unrelated roster rendering is omitted from this small DOM double.
function attachUi(h) {
 const elements=new Map([['canvas',h.canvas]]),attributes=new Map();
 const el=key=>{
  if(!elements.has(key))elements.set(key,target({tagName:'BUTTON',hidden:false,disabled:false,
   setAttribute(){},focus(){h.document.activeElement=this;},closest:()=>null}));
  return elements.get(key);
 };
 el('form').elements=new Proxy({}, {get:(_,key)=>el(`form-${String(key)}`)});
 const root=target({ownerDocument:h.document,
  getAttribute:key=>attributes.get(key),setAttribute:(key,value)=>attributes.set(key,value),
  querySelector:selector=>el(selector.match(/data-xt="([^"]+)"/)?.[1]||'super-control')});
 class MinimalUi extends XenoTrialsUiV96 {
  updateOpponents() {} restorePendingSelection() {} render() {}
 }
 const ui=new MinimalUi({root,getProgress:()=>({}),canCommit:()=>true,onCommit(){},onReturn(){}});
 ui.active=true;ui.runtime=h.r;
 return ui;
}
const physical = s => copy({tick:s.tick,time:s.timeRemaining,result:s.result,fighters:s.fighters,events:s.events,wins:s.wins,rng:s.rng,projectiles:s.projectiles});

const activeView={phase:'active',blocksSimulation:false,fighterSlot:null};
const neutral=()=>create({playerId:HUMAN,opponentId:'prowler',introSeconds:0,roundSeconds:15,roundsToWin:1});
const finishDraw=()=>{
 const m=neutral();
 for(let r=0;r<3;r++){
  for(let i=0;i<2000&&m.phase==='active';i++)step(m,.1,{},{});
  if(m.phase==='round-over')assert.equal(next(m),true);
 }
 assert.equal(m.result.winner,'draw');assert.equal(m.roundReason,'time');return m;
};
const finishRuntime=h=>{for(let i=0;i<3000&&(h.r.getState().phase!=='match-over'||h.queue.size);i++)h.frames();assert.equal(h.r.getState().phase,'match-over');};
test('forty exact presentations cover the forty source IDs while the twenty V155 entries stay historical',()=>{
 assert.equal(historical.length,20);assert.equal(added.length,20);assert.equal(sequences.length,40);assert.equal(new Set(sequences.map(s=>s.id)).size,40);
 assert.equal(sequences.reduce((n,s)=>n+s.keys.length,0),200);assert.equal(roster.length,189);
 const p=JSON.parse(readFileSync(new URL('../docs/forge/xeno-trials/progress-v155.json',import.meta.url)));
 const alias={'win-r1':'round-win','lose-r1':'round-loss','win-final':'outro-win','lose-final':'outro-loss'};
 for(const [id] of p.tables['02_Production'].rows){const [fighter,kind]=id.split('::');assert.ok(sequences.some(s=>s.id===fighter+'::'+(alias[kind]||kind)),id);}
 for(const r of rigs){assert.equal(added.filter(s=>s.rigId===r.id).length,5);assert.equal(entry({...r},'taunt'),null);}
 assert.equal(roster.filter(f=>!rigs.some(r=>r.fighterId===f.id)).length,185);
 for(const s of added){assert.equal(s.canonExact,false);assert.equal(s.evidence,'original-versus-presentation');assert.ok(Object.isFrozen(s.keys));}
});
for(const r of rigs)test(r.fighterId+': new multi-beat sequences remain grounded, mirror and reduce exactly to source art',()=>{
 for(const s of added.filter(s=>s.rigId===r.id)){
  const geometry=[];
  for(let i=0;i<=60;i++){
   const c={clip:s.kind,progress:i/60,elapsed:i/60*s.durationMs/1000,opponentFamily:'human'},f=sample(r,c);
   assert.ok(f?.vertices.flat().every(Number.isFinite));geometry.push(f.angles);
   for(const ids of mesh(r).triangles)assert.ok(area(...ids.map(j=>f.vertices[j]))>=area(...ids.map(j=>mesh(r).vertices[j].source))*.2,s.id);
   for(const name of ['footNear','footFar'])for(let axis=0;axis<2;axis++)close(f.contacts[name][axis],r.contacts[name].point[axis]);
  }
  assert.notDeepEqual(geometry[12],geometry[30]);
  const c={clip:s.kind,progress:.5,elapsed:.6,opponentFamily:'human'},f=sample(r,c),reduced=sample(r,c,true),ctx=new Proxy({},{get:()=>()=>{}});
  const a=draw(ctx,r,image(r),f,metrics(r),500,450,1),b=draw(ctx,r,image(r),f,metrics(r),500,450,-1);assert.ok(a&&b);
  for(const name of Object.keys(a.contacts)){close(a.contacts[name][0]+b.contacts[name][0],1000);close(a.contacts[name][1],b.contacts[name][1]);}
  assert.equal(reduced.active,false);reduced.vertices.forEach((p,i)=>p.forEach((v,k)=>close(v,mesh(r).vertices[i].source[k])));
 }
});
test('intro response reads the actual other fighter family, has no fabricated rivalry and retains both solo intros',()=>{
 const m=neutral(),before=copy(m),p={phase:'intro-player',fighterSlot:0,elapsedMs:564,blocksSimulation:true};
 assert.equal(cue(rigs[1],m,m.fighters[0],p),null);
 const c=cue(rigs[0],m,m.fighters[1],p);assert.equal(c.clip,'intro-rival');assert.equal(c.opponentFamily,'human');
 const human=sample(rigs[0],c),alien=sample(rigs[0],{...c,opponentFamily:'xenomorph'});assert.notDeepEqual(human.angles,alien.angles);
 assert.equal(sample(rigs[0],{...c,opponentFamily:'invented'}),null);assert.equal(sample(rigs[0],{...c,opponentFamily:undefined}),null);
 assert.deepEqual(m,before);
});
test('all admitted opponent families retain the responding native rig on either entrance',()=>{
 const families=new Set(roster.map(f=>f.family));assert.equal(families.has('hybrid'),true);
 for(const r of rigs)for(const opponent of roster)for(const side of [0,1]){
  const m=create({playerId:side?opponent.id:r.fighterId,opponentId:side?r.fighterId:opponent.id,introSeconds:0});
  const before=copy(m),slot=1-side;
  const c=cue(r,m,m.fighters[side],{phase:slot?'intro-opponent':'intro-player',fighterSlot:slot,elapsedMs:564,blocksSimulation:true});
  assert.equal(c.opponentFamily,opponent.family);const frame=sample(r,c);
  assert.equal(frame?.sequenceIdV156,`${r.fighterId}::intro-rival`,`${r.fighterId} facing ${opponent.id} on side ${side}`);
  assert.ok(frame.vertices.flat().every(Number.isFinite));assert.deepEqual(m,before);
 }
 for(const family of ['invented',undefined,'fauna'])if(!families.has(family))
  assert.equal(sample(rigs[0],{clip:'intro-rival',progress:.47,elapsed:.564,opponentFamily:family}),null);
});
for(const reducedMotion of [false,true])test(`Défi button returns keyboard combat to canvas (reduced motion: ${reducedMotion})`,async()=>{
 let ui;const h=host({reducedMotion,onState:s=>ui?.updateMatch(s)});ui=attachUi(h);await h.start();
 h.r.skipSequence();h.r.skipSequence();for(let i=0;i<45&&!h.r.getState().canTauntV156;i++)h.frames();
 assert.equal(h.r.getState().canTauntV156,true);const before=physical(h.r.getState());
 h.document.activeElement=ui.el('taunt');ui.el('taunt').onclick();
 assert.equal(h.document.activeElement,h.canvas);assert.equal(h.r.getState().paused,false);
 assert.equal(h.r.getState().tauntV156.phase,reducedMotion?'complete':'playing');assert.deepEqual(physical(h.r.getState()),before);
 for(const [code,action] of [['KeyD','right'],['KeyJ','light'],['KeyS','guard']]){
  h.window.emit('keydown',{code,target:h.document.activeElement});h.frames();
  assert.equal(h.r.getState().fighters[0].previousInput[action],true,action);
  h.window.emit('keyup',{code,target:h.document.activeElement});h.frames();
 }
 assert.equal(h.r.pause(),true);const paused=h.r.getState(),modal=ui.el('resume-overlay');
 assert.equal(h.document.activeElement,modal);ui.el('taunt').onclick();
 assert.equal(h.document.activeElement,modal);assert.deepEqual(h.r.getState(),paused);
 h.r.stop();
});
test('a refused Défi or a pause during its callback does not move keyboard focus away from its owner',()=>{
 const h=host(),ui=attachUi(h),button=ui.el('taunt'),modal=ui.el('resume-overlay');
 h.document.activeElement=button;ui.runtime={taunt:()=>false};button.onclick();assert.equal(h.document.activeElement,button);
 ui.runtime={taunt(){h.document.activeElement=modal;return true;},getState:()=>({paused:true})};
 button.onclick();assert.equal(h.document.activeElement,modal);
 const previous={taunt(){ui.runtime=null;return true;},getState:()=>({paused:false})};
 ui.runtime=previous;button.onclick();assert.equal(h.document.activeElement,modal);
});
test('real time-limit draws admit neutral recovery without awarding wins or altering the terminal engine',()=>{
 const m=finishDraw(),before=copy(m),t=terminal(m,'draw');assert.equal(t.participants.length,2);assert.equal(t.kind,'draw');
 assert.deepEqual(m.wins,{player:0,opponent:0});assert.equal(t.durationMs,1800);
 for(const f of m.fighters){const r=rigs.find(r=>r.fighterId===f.id);assert.equal(cue(r,m,f,null,t).clip,'draw');}
 let end=t;for(let i=0;i<18;i++)end=advance(end,100);assert.equal(end.phase,'complete');assert.deepEqual(m,before);
 assert.equal(terminal({...m,phase:'active'},'draw'),null);assert.equal(terminal({...m,result:{...m.result,winner:'player'}},'draw'),null);
 assert.equal(cue(rigs[1],m,m.fighters[0],null,{...t,terminalTick:t.terminalTick+1}),null);
});
test('round draws and rematches are keyed only by actual intermission and next-round countdown',()=>{
 const m=neutral();for(let i=0;i<2000&&m.phase==='active';i++)step(m,.1,{},{});
 assert.equal(m.roundWinner,'draw');const before=copy(m);assert.equal(cue(rigs[1],m,m.fighters[0],null).clip,'draw');assert.deepEqual(m,before);
 assert.equal(next(m),true);const p={phase:'countdown',round:m.round,blocksSimulation:true,fighterSlot:null,elapsedMs:1200};
 assert.equal(cue(rigs[1],m,m.fighters[0],p).clip,'rematch');assert.equal(cue(rigs[1],m,m.fighters[0],{...p,phase:'active',blocksSimulation:false}),null);
 const r1=neutral();assert.equal(cue(rigs[1],r1,r1.fighters[0],{...p,round:1}),null);
});
test('exit requires a completed real result sequence and joins either winner or loser pose continuously',()=>{
 const m=neutral();m.phase='match-over';m.result={completed:true,winner:'opponent',reason:'time'};
 const old=outro(m),complete={...old,phase:'complete',elapsedMs:old.durationMs},t=terminal(m,'outro',false,complete),before=copy(m);
 assert.equal(terminal(m,'outro',false,old),null);assert.equal(terminal(m,'outro',false,{...complete,skipped:true}),null);
 assert.equal(terminal(m,'outro',false,{...complete,matchId:'foreign'}),null);assert.equal(t.durationMs,600);
 for(const p of t.participants){const r=rigs.find(r=>r.id===p.rigId),f=m.fighters.find(f=>f.side===p.side),c=cue(r,m,f,null,t),start=sample(r,c),last=sample(r,{clip:p.previousKind,progress:1,elapsed:1.8});assert.deepEqual(start.angles,last.angles);assert.equal(sample(r,{...c,progress:1,elapsed:.6}).active,false);}
 assert.deepEqual(m,before);
});
test('taunt admission rejects every unavailable physical state and all unsupported identities',()=>{
 const m=neutral(),before=copy(m),t=taunt(m,activeView);assert.equal(t.kind,'taunt');assert.equal(t.durationMs,1100);assert.deepEqual(m,before);
 for(const r of rigs)assert.ok(taunt(create({playerId:r.fighterId,introSeconds:0}),activeView));
 const held=copy(m);held.grappleV153={attacker:'opponent',target:'player',bornTick:0,escapeProgress:0};assert.equal(taunt(held,activeView),null);
 const released=copy(m);released.events.push({id:1,tick:0,type:'grapple-end-v153',side:'player',attacker:'opponent',grappleId:1,reason:'escaped'});assert.equal(taunt(released,activeView),null);
 assert.equal(taunt(m,{blocksSimulation:true}),null);assert.equal(taunt(m,activeView,{right:true}),null);
 for(const [key,value] of [['hp',0],['y',2],['vy',1],['attack',{kind:'light'}],['guard',true],['stun',.1],['hitFlash',.1]]){const c=copy(m);c.fighters[0][key]=value;assert.equal(taunt(c,activeView),null,key);}
 for(const f of roster.filter(f=>!rigs.some(r=>r.fighterId===f.id)))assert.equal(taunt(create({playerId:f.id,introSeconds:0}),activeView),null);
 assert.equal(taunt({...m,paused:true},activeView),null);assert.equal(taunt({...m,phase:'round-over'},activeView),null);
});
test('taunt runs alongside combat, cancels on physical intervention and never restores a cancelled pose',()=>{
 const m=neutral(),t=taunt(m,activeView),before=copy(m);const next=advanceTaunt(t,m,100);assert.equal(next.elapsedMs,100);assert.deepEqual(m,before);
 assert.equal(advanceTaunt(t,{...m,grappleV153:{attacker:'opponent',target:'player'}},100).phase,'cancelled');
 assert.equal(advanceTaunt(t,{...m,paused:true},100),t);assert.equal(advanceTaunt(t,m,NaN),t);
 for(const action of ['left','right','jump','guard','light','heavy','special','super'])assert.equal(advanceTaunt(t,m,100,{[action]:true}).phase,'cancelled');
 for(const [key,value] of [['hp',m.fighters[0].hp-1],['y',4],['attack',{}],['guard',true],['stun',.2],['hitFlash',.2]]){const c=copy(m);c.fighters[0][key]=value;const end=advanceTaunt(t,c,100);assert.equal(end.phase,'cancelled');assert.equal(advanceTaunt(end,m,100),end);}
 const reduced=advanceTaunt(t,m,100,{},true);assert.equal(reduced.phase,'complete');assert.equal(reduced.reducedMotion,true);
 assert.equal(cue(rigs[1],m,m.fighters[0],activeView,null,{...t,matchId:'foreign'}),null);
});
test('native intro draws the responding rig and T/button API leave a deterministic combat trace untouched',async()=>{
 const a=host(),b=host();await a.start();await b.start();a.frames(3);b.frames(3);
 assert.ok(a.r.getState().rigViewsV154.some(v=>v.sequenceIdV155?.endsWith('::intro-rival')));
 a.r.skipSequence();a.r.skipSequence();b.r.skipSequence();b.r.skipSequence();
 for(let i=0;i<45&&!a.r.getState().canTauntV156;i++){a.frames();b.frames();}
 assert.equal(a.r.getState().canTauntV156,true);const before=physical(a.r.getState());a.key('KeyT');assert.equal(a.r.getState().tauntV156.phase,'playing');assert.deepEqual(physical(a.r.getState()),before);
 assert.equal(a.r.taunt(),false);for(let i=0;i<5;i++){a.frames();b.frames();assert.deepEqual(physical(a.r.getState()),physical(b.r.getState()));}
 assert.ok(a.r.getState().rigViewsV154.some(v=>v.sequenceIdV155?.endsWith('::taunt')));const frozen=a.r.getState();assert.equal(a.r.pause(),true);a.frames(20);assert.equal(a.r.getState().tauntV156.elapsedMs,frozen.tauntV156.elapsedMs);assert.equal(a.r.resume(),true);
 a.r.setInput('right',true);a.frames();assert.equal(a.r.getState().tauntV156.phase,'cancelled');a.r.setInput('right',false);a.r.stop();b.r.stop();
});
test('native next-round event draws rematch; final result then draws exit exactly once with engine frozen',async()=>{
 const h=host();await h.start();let rematch=false,exit=false,terminalPhysical=null;
 for(let i=0;i<3000&&(h.r.getState().phase!=='match-over'||h.queue.size);i++){
  h.frames();const s=h.r.getState();rematch ||= s.rigViewsV154.some(v=>v.sequenceIdV155?.endsWith('::rematch'));
  if(s.phase==='match-over'){terminalPhysical ||=physical(s);assert.deepEqual(physical(s),terminalPhysical);}
  if(s.terminalV156?.kind==='outro'&&s.terminalV156.phase==='playing')exit ||= s.rigViewsV154.some(v=>v.sequenceIdV155?.endsWith('::outro'));
 }
 assert.equal(rematch,true);assert.equal(exit,true);assert.equal(h.results.length,1);assert.equal(h.queue.size,0);assert.equal(h.r.getState().terminalV156.phase,'complete');h.r.stop();
});
test('exit pause, skip, stop and reduced-motion cancellation retain the same result and no late frames',async()=>{
 for(const action of ['pause','skip','stop','reduced']){
  const h=host();await h.start();for(let i=0;i<3000&&h.r.getState().terminalV156?.kind!=='outro';i++)h.frames();assert.equal(h.r.getState().terminalV156.kind,'outro');
  const before=physical(h.r.getState());
  if(action==='pause'){assert.equal(h.r.pause(),true);const paused=h.r.getState();h.frames(20);assert.deepEqual(h.r.getState(),paused);assert.equal(h.r.resume(),true);h.frames(10);}
  if(action==='skip'){assert.equal(h.r.skipSequence(),true);assert.equal(h.r.getState().terminalV156.skipped,true);}
  if(action==='stop')h.r.stop();
  if(action==='reduced'){h.window.matchMedia=()=>({matches:true});h.frames();assert.equal(h.r.getState().terminalV156.reducedMotion,true);}
  assert.deepEqual(physical(h.r.getState()),before);assert.equal(h.results.length,1);assert.equal(h.queue.size,0);assert.equal(h.r.resume(),false);h.r.stop();assert.equal(h.r.getState().terminalV156,null);assert.equal(h.r.getState().tauntV156,null);
 }
});
