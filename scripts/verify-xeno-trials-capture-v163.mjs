import {createContext,runInContext} from 'node:vm';
import {createXenoTrialsRuntimeV96} from '../src/xeno-trials-runtime-v96.js';
import {XenoTrialsUiV96} from '../src/xeno-trials-ui-v96.js';
import {getXenoTrialsBodyBoundsV105 as bodyBounds,getXenoTrialsBodyGapV105 as bodyGap} from '../src/xeno-trials-geometry-v105.js';
import {getXenoTrialsAttackV147 as attackSpec} from '../src/xeno-trials-signatures-v147.js';
import {XENO_TRIALS_ATTACKS_V96 as baseAttacks} from '../src/xeno-trials-engine-v96.js';
import * as captureInputEngine from '../src/xeno-trials-engine-v96.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {inflateSync} from 'node:zlib';
import {XENO_TRIALS_CAPTURE_ATLASES_V163 as atlases} from '../src/xeno-trials-capture-data-v163.js';
import {XENO_TRIALS_CAPTURE_V163 as config,getXenoTrialsCaptureAtlasV163 as atlasFor,getXenoTrialsCaptureViewV163 as view,
 drawXenoTrialsCaptureTargetV163 as draw,getXenoTrialsCaptureReceiptV163 as receipt,sampleXenoTrialsPreparationV163 as prep} from '../src/xeno-trials-capture-v163.js';
import {XENO_TRIALS_RIGS_V154 as rigs,getXenoTrialsRigMeshV154 as mesh,sampleXenoTrialsRigV154 as sample,
 getXenoTrialsRigCueV154 as cue,projectXenoTrialsMeshPointV157 as project,xenoTrialsTriangleAreaV154 as area} from '../src/xeno-trials-rig-v154.js';
import {createXenoTrialsMatchV96 as create,stepXenoTrialsMatchV96 as step,setXenoTrialsPausedV96 as pause} from '../src/xeno-trials-engine-v96.js';
import {getXenoTrialsArtV96 as art,getXenoTrialsFighterV96 as definition} from '../src/xeno-trials-data-v96.js';
const clone=v=>JSON.parse(JSON.stringify(v)),DT=1/120,near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
const images=new Map([...atlases,...rigs].map(a=>[a.path,{naturalWidth:a.sourceWidth,naturalHeight:a.sourceHeight,complete:true}]));
function native(id){const m=create({playerId:id,opponentId:'prowler',introSeconds:0,roundSeconds:120,seed:153,difficulty:'hard'});
 for(let i=0;i<5400&&!m.grappleV153;i++)step(m,DT,{});assert.ok(m.grappleV153,'native CPU must earn contact');return m;}
const ctx=()=>new Proxy({globalAlpha:1,calls:[]},{get:(t,k)=>k in t?t[k]:(...args)=>t.calls.push([k,...args])});
// Inspect the actual atlas bytes using only Node's standard library. The source
// contract is non-interlaced 8-bit RGBA PNG; Python imaging packages are not a
// dependency of the repository's Node/CI verification phase.
function rgbaAlpha(bytes){
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(bytes.toString('ascii',12,16),'IHDR');assert.equal(bytes.readUInt32BE(8),13);
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 assert.equal(bytes[24],8);assert.equal(bytes[25],6);assert.equal(bytes[26],0);assert.equal(bytes[27],0);assert.equal(bytes[28],0);
 const chunks=[];
 for(let offset=8;offset<bytes.length;){
  const length=bytes.readUInt32BE(offset);assert.ok(offset+length+12<=bytes.length);
  if(bytes.toString('ascii',offset+4,offset+8)==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+length));
  offset+=length+12;
 }
 const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,alpha=new Uint8Array(width*height);
 assert.equal(raw.length,(stride+1)*height);
 const paeth=(a,b,c)=>{const p=a+b-c,aa=Math.abs(p-a),bb=Math.abs(p-b),cc=Math.abs(p-c);return aa<=bb&&aa<=cc?a:bb<=cc?b:c;};
 let previous=new Uint8Array(stride),offset=0;
 for(let y=0;y<height;y++){
  const filter=raw[offset++],row=new Uint8Array(stride);assert.ok(filter<=4);
  for(let i=0;i<stride;i++){
   const left=i>=4?row[i-4]:0,up=previous[i],corner=i>=4?previous[i-4]:0;
   let prediction=0;
   if(filter===1)prediction=left;
   else if(filter===2)prediction=up;
   else if(filter===3)prediction=Math.floor((left+up)/2);
   else if(filter===4)prediction=paeth(left,up,corner);
   row[i]=(raw[offset++]+prediction)&255;
  }
  for(let x=0;x<width;x++)alpha[y*width+x]=row[x*4+3];
  previous=row;
 }
 assert.equal(offset,raw.length);return{width,height,alpha};
}
function inspectAtlasAlpha(bytes,atlas){
 const {width,height,alpha}=rgbaAlpha(bytes),labels=new Uint32Array(alpha.length),queue=new Uint32Array(alpha.length),large=new Set();
 let zero=0,solid=0,component=0;
 for(let index=0;index<alpha.length;index++){
  if(alpha[index]===0)zero++;if(alpha[index]>=128)solid++;
  if(alpha[index]<=2||labels[index])continue;
  // scipy.ndimage.label's default two-dimensional connectivity is the same
  // four-neighbour cross. Label every component before applying size>1000.
  const id=++component;let head=0,tail=1;queue[0]=index;labels[index]=id;
  const visit=next=>{if(alpha[next]>2&&!labels[next]){labels[next]=id;queue[tail++]=next;}};
  while(head<tail){
   const next=queue[head++],x=next%width;
   if(x>0)visit(next-1);if(x+1<width)visit(next+1);
   if(next>=width)visit(next-width);if(next+width<alpha.length)visit(next+width);
  }
  if(tail>1000)large.add(id);
 }
 const at=point=>{
  const[x,y]=point;assert.ok(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<width&&y<height);
  return alpha[y*width+x];
 };
 const frames=atlas.frames.map(frame=>{
  const[x0,y0,x1,y1]=frame.rect;assert.ok([x0,y0,x1,y1].every(Number.isInteger)&&x0>=0&&y0>=0&&x1<=width&&y1<=height&&x1>x0&&y1>y0);
  const bodies=new Set();let pixels=0;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
   const index=y*width+x;if(alpha[index]>2)pixels++;
   if(large.has(labels[index]))bodies.add(labels[index]);
  }
  return{bodies:[...bodies],pixels,solidContacts:Object.values(frame.contacts).every(point=>at(point)>=128),floor:at(frame.contacts.floorSupport)};
 });
 return{mode:'RGBA',zero,solid,bodyCount:large.size,frames};
}
test('27 original painted poses have pinned byte provenance, real alpha and nine separated bodies per atlas',()=>{
 const report=atlases.map(a=>inspectAtlasAlpha(readFileSync(new URL('..'+a.path,import.meta.url)),a));
 assert.equal(atlases.length,3);assert.equal(config.taskIds.length,9);assert.equal(atlases.reduce((n,a)=>n+a.frames.length,0),27);
 for(const[a,i]of atlases.map((a,i)=>[a,i])){const bytes=readFileSync(new URL('..'+a.path,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sourceSha256);assert.equal(bytes.length,a.bytes);
  assert.equal(bytes.readUInt32BE(16),1536);assert.equal(bytes.readUInt32BE(20),1024);assert.equal(a.canonExact,false);
  const r=report[i];assert.equal(r.mode,'RGBA');assert.equal(r.bodyCount,9);assert.ok(r.zero>1000000);assert.ok(r.solid>300000);
  for(const[f,j]of a.frames.map((f,j)=>[f,j])){assert.equal(r.frames[j].bodies.length,1);assert.equal(r.frames[j].pixels,f.alphaPixelsOver2);assert.ok(r.frames[j].solidContacts);assert.ok(r.frames[j].floor>=128);assert.equal(f.contacts.floorSupport[1],f.supportY);}
 }
});
test('identity binding refuses another costume, historical source or SHA',()=>{
 for(const a of atlases){assert.equal(atlasFor(definition(a.fighterId),art(a.fighterId)),a);
  assert.equal(atlasFor({...definition(a.fighterId),id:'warrior'},art(a.fighterId)),null);
  for(const patch of [{id:'other'},{path:atlases[(atlases.indexOf(a)+1)%3].referencePath},{sha256:'x'.repeat(64)}])assert.equal(atlasFor(definition(a.fighterId),{...art(a.fighterId),...patch}),null);
 }
});
for(const atlas of atlases){
 test(atlas.fighterId+': real contact reaches an articulated supported floor pin, exact drawn hand contacts and a distinct guard resistance',()=>{
  const m=native(atlas.fighterId);let observed=null;
  for(let i=0;i<75;i++){step(m,DT,{});const state=clone(m),v=view(m,images);assert.deepEqual(m,state);if(v?.pairedContacts)observed=v;}
  assert.ok(observed?.fullFloorPin);assert.ok(observed.gaps.every(g=>g<=8));assert.equal(observed.layout.frame.id,'floor-pin');
  for(const limb of observed.captorPose.pairedPinV163.limbs){assert.ok(limb.lengthRatio>=.8&&limb.lengthRatio<=1.25);assert.ok(limb.degrees<=18);}
  near(observed.layout.contacts.floorSupport[1],450);assert.ok(Math.abs(observed.rootOffset)<=config.maxVisualRootOffset);
  assert.ok(observed.layout.bounds.right-observed.layout.bounds.left<200,'floor body retains native human stature');
  for(const ids of mesh(observed.rig).triangles)assert.ok(area(...ids.map(i=>observed.captorPose.vertices[i]))>=area(...ids.map(i=>mesh(observed.rig).vertices[i].source))*.2);
  const phases=new Set();for(let i=0;i<60&&m.grappleV153;i++){step(m,DT,{guard:true});const v=view(m,images);if(v?.pairedContacts){phases.add(v.layout.frame.id);assert.ok(v.gaps.every(g=>g<=8));}}
  assert.deepEqual([...phases].sort(),['floor-pin','resistance']);
 });
 test(atlas.fighterId+': mirrored geometric boundary fixture keeps actual supports, hand gaps and native size',()=>{
  const m=native(atlas.fighterId);for(let i=0;i<65;i++){step(m,DT,{});view(m,images);}
  const a=view(m,images),other=clone(m);
  for(const f of other.fighters){f.x=1000-f.x;f.facing*=-1;}other.grappleV153.attackerX=1000-other.grappleV153.attackerX;other.grappleV153.targetX=1000-other.grappleV153.targetX;
  const b=view(other,images);assert.ok(a.pairedContacts&&b.pairedContacts);
  for(const key of Object.keys(a.layout.contacts)){near(a.layout.contacts[key][0]+b.layout.contacts[key][0],1000);near(a.layout.contacts[key][1],b.layout.contacts[key][1]);}
  for(let i=0;i<2;i++){near(a.actualHands[i][0]+b.actualHands[i][0],1000);near(a.actualHands[i][1],b.actualHands[i][1]);near(a.gaps[i],b.gaps[i]);}
 });
 test(atlas.fighterId+': pause is exact, native guard escape releases once, recovery does not rewrite a match',()=>{
  const a=native(atlas.fighterId);for(let i=0;i<60;i++){step(a,DT,{});view(a,images);}
  pause(a,true);const frozen=clone(a),before=receipt(view(a,images),'captive');
  for(let i=0;i<12;i++){step(a,DT,{guard:true});assert.deepEqual(receipt(view(a,images),'captive'),before);}assert.deepEqual(a,frozen);pause(a,false);
  const b=clone(a);let recoveryFrames=new Set();for(let i=0;i<160;i++){
   const controls=i<75?{guard:true}:{};step(a,DT,controls,{});step(b,DT,controls,{});const v=view(a,images);
   if(v?.record.phase==='recovery')recoveryFrames.add(v.layout.frame.id);
   if(v){const c=ctx(),image=images.get(v.atlas.path),state=clone(a);assert.ok(draw(c,image,v)?.drawn);assert.deepEqual(a,state);}
  }
  assert.deepEqual(a,b);assert.equal(a.fighters[0].stats.grappleEscapesV153,1);assert.ok(recoveryFrames.has('elbow-release'));assert.ok(recoveryFrames.has('half-kneel'));assert.ok(recoveryFrames.has('recovered'));
 });
 test(atlas.fighterId+': missing or wrong-size atlas retains the historical native fallback',()=>{
  const m=native(atlas.fighterId);for(let i=0;i<65;i++)step(m,DT,{});
  const missing=new Map(images);missing.delete(atlas.path);assert.equal(view(m,missing),null);
  missing.set(atlas.path,{naturalWidth:1,naturalHeight:1024});assert.equal(view(m,missing),null);
  const v=view(m,images),c=ctx();assert.equal(draw(c,{naturalWidth:1,naturalHeight:1},v),null);assert.equal(c.calls.length,0);
 });
 test(atlas.fighterId+': Prowler forelimbs start release at the actual held skin and finish within the native quarter-second stun',()=>{
  const m=native(atlas.fighterId);for(let i=0;i<60;i++){step(m,DT,{},{});view(m,images);}
  let held=null;
  for(let i=0;i<72;i++){held=view(m,images);step(m,DT,{guard:true},{});if(!m.grappleV153)break;}
  assert.ok(!m.grappleV153);const release=view(m,images);
  assert.ok(release.captorRecovery);assert.equal(release.captorPose.pairedReleaseV163.duration,.25);
  release.captorPose.vertices.forEach((p,i)=>p.forEach((v,k)=>near(v,held.captorPose.vertices[i][k])));
  const heldTime=m.tick,lastState=clone(m);assert.equal(lastState.fighters[1].stun,.25);
  for(let i=0;i<31;i++){step(m,DT,{},{});view(m,images);}
  assert.ok((m.tick-heldTime)/120>=.25);assert.equal(view(m,images).captorRecovery,false);assert.ok(m.fighters[1].stun<=1e-7);
 });
}
test('Prowler real startup owns bounded body absorption; lower source band and all supports stay exact',()=>{
 const r=rigs[0],m=create({playerId:'prowler',opponentId:atlases[0].fighterId,introSeconds:0});
 step(m,DT,{special:true},{});let loaded=false;
 for(let i=0;i<45;i++){const c=cue(r,m,m.fighters[0]);if(c?.clip==='windup'){
  const f=sample(r,c),p=prep(r,f,c);if(p.preparationV163?.gain>.5)loaded=true;
  mesh(r).vertices.forEach((v,i)=>{if(v.source[1]>=877){near(f.vertices[i][0],p.vertices[i][0]);near(f.vertices[i][1],p.vertices[i][1]);}});
  for(const key of ['footNear','footFar']){const a=project(r,f,r.contacts[key].point),b=project(r,p,r.contacts[key].point);a.forEach((v,i)=>near(v,b[i]));}
  assert.equal(prep(r,f,c,true),f);
 }step(m,DT,{},{});}
 assert.ok(loaded);assert.ok(!cue(r,m,m.fighters[0])||cue(r,m,m.fighters[0]).clip!=='windup');
});
test('nine task IDs are technique-only and no renderer changes authority, costs or source art bytes',()=>{
 const source=readFileSync(new URL('../src/xeno-trials-capture-v163.js',import.meta.url),'utf8');
 assert.equal(config.canonExact,false);assert.ok(!/match\.(tick|phase|fighters|grappleV153)\s*=/.test(source));
 assert.ok(source.includes('engineBodiesUnchanged:true'));assert.ok(source.includes('new-original-native-art-not-canonical-reference'));
});


// Explicit DOM, decoded-image dimensions, RAF and menu-render doubles. The
// production engine/controller, constructor-installed pause handler and actual
// Python QA observer execute unchanged. This is not Chromium or pixel evidence.
function captureEventTarget(extra={}){
 const listeners=new Map();
 return Object.assign({addEventListener(type,fn){if(!listeners.has(type))listeners.set(type,new Set());listeners.get(type).add(fn);},
  removeEventListener(type,fn){listeners.get(type)?.delete(fn);},
  emit(type,event={}){for(const fn of [...(listeners.get(type)||[])])fn({preventDefault(){},stopPropagation(){},...event});},
  closest(){return null;},click(){if(!this.disabled){this.clicks=(this.clicks||0)+1;this.onclick?.();}}},extra);
}
function captureRuntimeHost(config={}){
 const win=captureEventTarget(),doc=captureEventTarget({hidden:false,hasFocus:()=>true});
 const context=new Proxy({measureText:s=>({width:String(s).length*8}),createLinearGradient:()=>({addColorStop(){}}),
  createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]??(()=>{})});
 const canvas=captureEventTarget({tagName:'CANVAS',width:1000,height:560,setAttribute(){},getContext:()=>context,focus(){doc.activeElement=this;}});
 const elements=new Map([['canvas',canvas]]);
 const element=key=>{if(!elements.has(key))elements.set(key,captureEventTarget({tagName:'BUTTON',disabled:false}));return elements.get(key);};
 element('form').elements=new Proxy({},{get:(o,k)=>o[k]??(o[k]=captureEventTarget())});
 const root=captureEventTarget({querySelector:selector=>element(selector.match(/data-xt="([^"]+)"/)[1]),contains:()=>false,ownerDocument:doc});
 class PauseUi extends XenoTrialsUiV96 {updateOpponents(){} restorePendingSelection(){} render(){}}
 const ui=new PauseUi({root,getProgress:()=>({}),onCommit(){},canCommit:()=>true,onReturn(){}});
 const queue=new Map();let serial=0,time=0;
 const requestAnimationFrame=fn=>{queue.set(++serial,fn);return serial;};
 const runtime=createXenoTrialsRuntimeV96({canvas,window:win,document:doc,controlsRoot:root,
  config:{playerId:'prowler',opponentId:'import-game-dd-wy-commando',stageId:'tantalus-cargo',seed:153,difficulty:'hard',roundSeconds:120,...config},
  loadImage:async path=>images.get(path)||{naturalWidth:1024,naturalHeight:1024,complete:true},
  requestAnimationFrame,cancelAnimationFrame:id=>queue.delete(id)});
 ui.runtime=runtime;
 const frame=(count=1,deltaMs=1000/120)=>{for(let i=0;i<count;i++){time+=deltaMs;for(const[id,fn]of [...queue])if(queue.delete(id))fn(time);}};
 return{runtime,canvas,element,requestAnimationFrame,frame,now:()=>time,
  key(code,type='keydown'){win.emit(type,{target:canvas,code});},
  async start(){assert.equal(await runtime.start(),true);
   for(let i=0;i<1200&&runtime.getState().presentation.blocksSimulation;i++)frame();
   assert.equal(runtime.getState().presentation.blocksSimulation,false);frame(2);}
 };
}
async function nativePlayerCaptureForPause(h,{onAttempt}={}){
 await h.start();let move=null,guard=false;
 for(let i=0;i<6600;i++){
  const m=h.runtime.getState();
  if(m.grappleV153){if(move)h.key(move,'keyup');if(guard)h.key('KeyS','keyup');return m;}
  assert.notEqual(m.phase,'match-over','The player must earn a capture before the duel ends.');
  const[a,b]=m.fighters,direction=b.x>=a.x?1:-1,gap=bodyGap(a,b,direction),ab=bodyBounds(a),bb=bodyBounds(b);
  const contact=(bb.center-ab.center)*direction>=0&&gap>=-8&&gap<=6&&ab.bottom<=bb.top&&bb.bottom<=ab.top;
  const targetAttack=b.attack?attackSpec(definition(b.id),b.attack.kind,baseAttacks[b.attack.kind]):null;
  const threat=Boolean(targetAttack&&b.attack.age<targetAttack.startup+targetAttack.active);
  const recovery=Boolean(targetAttack&&b.attack.age>=targetAttack.startup+targetAttack.active);
  const desired=gap>6?(direction>0?'ArrowRight':'ArrowLeft'):null;
  if(desired!==move){if(move)h.key(move,'keyup');move=desired;if(move)h.key(move);}
  const wantGuard=Boolean(contact&&threat&&!a.attack&&a.stun<=0&&a.y===0&&a.stamina>1);
  if(wantGuard!==guard){h.key('KeyS',wantGuard?'keydown':'keyup');guard=wantGuard;}
  const special=attackSpec(definition(a.id),'special',baseAttacks.special);
  const attack=m.phase==='active'&&!m.paused&&contact&&recovery&&!a.attack&&a.stun<=0
   &&a.y===0&&b.y===0&&b.vy===0&&a.specialCooldown<=0&&a.stamina>=special.cost;
  if(attack){onAttempt?.(m,special);h.key('KeyL');}h.frame();if(attack)h.key('KeyL','keyup');
 }
 assert.fail('The bounded native keyboard policy did not obtain a capture.');
}
function captureQaLiteral(name){
 const source=readFileSync(process.env.ATF_CAPTURE_DRIVER_SOURCE||new URL('./qa-xeno-trials-capture-v163.py',import.meta.url),'utf8');
 const match=source.match(new RegExp('^'+name+" = r'''([\\s\\S]*?)'''",'m'));
 assert.ok(match,'The test executes the actual raw JS literal '+name+' from the Python QA.');return match[1];
}
function captureQaObserver(h){
 const copies=[],encodings=[];
 const context=createContext({structuredClone,captureInputEngine,performance:{now:h.now},requestAnimationFrame:h.requestAnimationFrame,
  __ATF_XENO_TRIALS_V96__:{snapshot:()=>({match:h.runtime.getState()})},
  document:{querySelector:selector=>selector==='[data-xt="canvas"]'?h.canvas:selector==='[data-xt="pause"]'?h.element('pause'):null,
   createElement(tag){assert.equal(tag,'canvas');return{width:0,height:0,getContext(){return{drawImage(source){
     assert.equal(source,h.canvas);const m=h.runtime.getState();copies.push({tick:m.tick,paused:m.paused});}};},
    toDataURL(){const m=h.runtime.getState();encodings.push({tick:m.tick,paused:m.paused});return'data:image/png;base64,declared-bitmap-double';}};}}});
 // Resolve only the browser module URL into the actual production namespace.
 // The native clone pause/release functions are neither replaced nor mocked.
 const observerSource=captureQaLiteral('CAPTURE_OBSERVER')
  .replace("await import('/src/xeno-trials-engine-v96.js')",'captureInputEngine');
 const observe=runInContext('('+observerSource+')',context);
 context.__ATF_ARM_CAPTURE_FLOOR_V207__=observe;
 const startup=runInContext('('+captureQaLiteral('PLAYER_STARTUP_OBSERVER_V177')+')',context);
 const exportFrames=runInContext('('+captureQaLiteral('CAPTURE_EXPORT')+')',context);
 return{observe,startup,exportFrames,copies,encodings,out:stage=>context.__ATF_CAPTURE_OBSERVER_V163__?.[stage],
  startupState:()=>context.__ATF_PLAYER_STARTUP_PROOF_V177__};
}
function captureBinding(m,stage='floor'){
 const hold=m.grappleV153;
 return{stage,timeoutMs:stage==='floor'?45000:15000,matchId:m.config.matchId,round:m.round,
  fighterIds:m.fighters.map(f=>f.id),sides:m.fighters.map(f=>f.side),attackerSide:hold.attacker,
  targetSide:hold.target,targetId:m.fighters.find(f=>f.side===hold.target).id,
  holdId:hold.id,sinceTick:hold.bornTick,after:true};
}
test('capture QA pauses the real public button before a six-tick transfer delay, then resumes the same CPU escape once',async t=>{
 const h=captureRuntimeHost();
 try{
  const acquired=await nativePlayerCaptureForPause(h);
  assert.equal(acquired.grappleV153.attacker,'player');assert.equal(acquired.opponentInputSourceV163,'cpu');
  let before=h.runtime.getState();
  for(let i=0;i<180&&before.grappleV153?.escapeProgress<66;i++){h.frame();before=h.runtime.getState();}
  assert.equal(before.grappleV153?.id,acquired.grappleV153.id);assert.equal(before.grappleV153.escapeProgress,66);
  const qa=captureQaObserver(h),binding=captureBinding(before);
  assert.ok(qa.observe(binding).armed);h.frame();
  const floor=qa.out('floor');
  assert.equal(floor.error,null);assert.equal(floor.ready,true);
  const recorded=floor.floor.state.match;
  assert.equal(recorded.tick,before.tick,'The already-painted admissible floor must pause in the arm callback.');
  assert.equal(recorded.grappleV153.escapeProgress,66);assert.equal(qa.encodings.length,0);
  // This declared six-tick transfer latency reproduces the old external P race:
  // an unpaused CPU reaches escape=72 on tick six, before P could arrive.
  h.frame(6);const frozen=h.runtime.getState();
  t.diagnostic(JSON.stringify({floorTick:recorded.tick,floorEscape:recorded.grappleV153.escapeProgress,
   delayedReadTick:frozen.tick,paused:frozen.paused,holdId:frozen.grappleV153?.id,
   ends:frozen.events.filter(e=>e.type==='grapple-end-v153')}));
  assert.equal(frozen.paused,true);assert.equal(frozen.tick,recorded.tick);
  assert.deepEqual(frozen.grappleV153,recorded.grappleV153);assert.equal(h.element('pause').clicks,1);
  assert.deepEqual(clone(floor.pauseAction),{method:'DOM click on production pause button',selector:'[data-xt="pause"]',
   beforeTick:recorded.tick,beforePaused:false,holdId:recorded.grappleV153.id,
   afterTick:frozen.tick,afterPaused:true,afterHoldId:frozen.grappleV153.id});
  const image=qa.exportFrames({stage:'floor',fields:['floor']}).floor;
  assert.deepEqual(image.state.match,recorded);assert.equal(qa.encodings[0].paused,true);
  assert.deepEqual(qa.copies[0],{tick:recorded.tick,paused:false});
  h.frame(240);assert.deepEqual(h.runtime.getState(),frozen,'Native state must remain exactly frozen throughout the pause.');
  assert.ok((await qa.observe({...binding,stage:'post',timeoutMs:15000})).armed);
  h.key('KeyP');h.key('KeyP','keyup');
  for(let i=0;i<120&&!qa.out('post').done;i++)h.frame();
  const post=qa.out('post');assert.equal(post.error,null);assert.ok(post.struggle&&post.release);
  assert.equal(post.struggle.state.match.grappleV153.id,recorded.grappleV153.id);
  assert.ok(post.struggle.state.match.grappleV153.escapeProgress>recorded.grappleV153.escapeProgress);
  const released=post.release.state.match,ends=released.events.filter(e=>e.type==='grapple-end-v153'&&e.grappleId===binding.holdId);
  assert.equal(ends.length,1);assert.equal(ends[0].reason,'escaped');
  assert.equal(ends[0].tick,recorded.tick+72-recorded.grappleV153.escapeProgress);
  assert.equal(released.fighters.find(f=>f.side===binding.targetSide).stats.grappleEscapesV153,1);
  assert.equal(released.result,null);
  assert.ok(released.captureViewsV163.some(v=>v.role==='captive'&&v.phase==='recovery'&&v.grappleId===binding.holdId&&v.targetId===binding.targetId));
  assert.equal(post.ready,true);assert.ok(post.recovered);
  assert.equal(post.recovered.state.match.tick-released.tick,54);
  const recoveryFrozen=h.runtime.getState();assert.equal(recoveryFrozen.paused,true);
  assert.equal(recoveryFrozen.tick,post.recovered.state.match.tick);assert.equal(recoveryFrozen.result,null);
  assert.equal(h.element('pause').clicks,2);assert.equal(post.pauseAction.observedNativeTicks,54);
  assert.deepEqual(clone(post.pauseModel.afterPause.fighters),recoveryFrozen.fighters);
  assert.deepEqual(clone(post.pauseModel.afterPause.events),post.recovered.state.match.events);
  assert.deepEqual(clone(post.pauseAction.inputTransition.afterPauseExpected),clone(post.pauseAction.inputTransition.afterPauseObserved));
  h.frame(240);assert.deepEqual(h.runtime.getState(),recoveryFrozen,'Slow evidence transfer cannot add combat after the bounded recovery.');
  const exported=qa.exportFrames({stage:'post',fields:['struggle','release','recovered']});
  assert.ok(exported.release);assert.ok(exported.recovered);
  assert.deepEqual(clone(post.pauseAction.inputTransition.afterKeyupExpected),clone(post.pauseAction.inputTransition.afterKeyupObserved));
  assert.ok(qa.encodings.every(frame=>frame.paused),'All native PNG encoding must occur while publicly paused.');
  // Declared corrupted read fixtures test export rejection; the real engine
  // and the genuine recovery receipt remain untouched.
  const runtime=h.runtime;
  try{
    for(const patch of [{paused:false},{tick:recoveryFrozen.tick+1},{round:recoveryFrozen.round+1},
      {config:{...recoveryFrozen.config,matchId:'other'}},{result:{winner:'opponent'}},
      {fighters:recoveryFrozen.fighters.map((f,i)=>i?f:{...f,hp:f.hp-1})},
      {fighters:recoveryFrozen.fighters.map((f,i)=>i?f:{...f,stamina:f.stamina-1})},
      {fighters:recoveryFrozen.fighters.map((f,i)=>i?f:{...f,previousInput:{...f.previousInput,guard:!f.previousInput.guard}})},
      {fighters:recoveryFrozen.fighters.map((f,i)=>i?f:{...f,rearmControls:{...f.rearmControls,guard:!f.rearmControls.guard}})},
      {events:[...recoveryFrozen.events,{type:'unobserved-event',tick:recoveryFrozen.tick}]}]){
      h.runtime={getState:()=>({...clone(recoveryFrozen),...patch})};
      assert.throws(()=>qa.exportFrames({stage:'post',fields:['release']}),/exact public recovery pause/);
    }
  }finally{h.runtime=runtime;}
  for(const paused of [false,true]){
    const queue=[];let current=clone(frozen);
    const fixture={runtime:{getState:()=>clone(current)},canvas:h.canvas,
      element(){assert.fail('A completed result must never reach the recovery pause control.');},
      now:()=>0,requestAnimationFrame:fn=>queue.push(fn)};
    const rejected=captureQaObserver(fixture);await rejected.observe({...binding,stage:'post',timeoutMs:15000});
    // This adversarial result-read fixture checks rejection, not another duel.
    current={...clone(released),paused,phase:'match-over',result:{winner:'opponent',reason:'ko'}};
    queue.shift()();
    assert.match(rejected.out('post').error,/Native match completed before recovery pause/);
    assert.equal(rejected.out('post').ready,false);
    assert.equal(current.result.winner,'opponent');
    assert.throws(()=>rejected.exportFrames({stage:'post',fields:['release']}),/Native match completed/);
  }
 }finally{h.runtime.stop();}
});
test('recorded native keys earn a four-HP hold and only real post-release guard survives the exact recovery pause',async t=>{
 // Fixed commands recorded from the native Python/Node bridge, not Chromium
 // input or a saved combat state. Original file trials-low-hp-16-8.json SHA256:
 // df4650ae5c2f69e524fdeb1e68ecfd93b249563e9cf6488d0c0ec4fccbcd28f0
 // Recording parameters: read delay200ms, evaluate transport16ms, key8ms,
 // phase0, seed96001 and round99s; all CPU combat and keyboard handlers native.
 // wallTime is the bridge's declared host clock in ms. Tick/round/phase are
 // checks, never scheduling instructions or values assigned to the engine.
 const commands=[
  {"key":"ArrowRight","type":"keydown","tick":109,"round":1,"phase":"active","wallTime":6335.9999999999645},
  {"key":"KeyS","type":"keydown","tick":109,"round":1,"phase":"active","wallTime":6343.9999999999645},
  {"key":"KeyS","type":"keyup","tick":223,"round":1,"phase":"active","wallTime":7295.9999999999645},
  {"key":"KeyS","type":"keydown","tick":227,"round":1,"phase":"active","wallTime":7332.6666666666315},
  {"key":"KeyS","type":"keyup","tick":313,"round":1,"phase":"active","wallTime":8048.6666666666315},
  {"key":"ArrowRight","type":"keyup","tick":343,"round":1,"phase":"active","wallTime":8292.666666666631},
  {"key":"ArrowRight","type":"keydown","tick":373,"round":1,"phase":"active","wallTime":8536.666666666631},
  {"key":"ArrowRight","type":"keyup","tick":431,"round":1,"phase":"active","wallTime":9016.666666666631},
  {"key":"KeyS","type":"keydown","tick":431,"round":1,"phase":"active","wallTime":9024.666666666631},
  {"key":"ArrowRight","type":"keydown","tick":461,"round":1,"phase":"active","wallTime":9268.666666666631},
  {"key":"KeyS","type":"keyup","tick":603,"round":1,"phase":"active","wallTime":10456.666666666631},
  {"key":"ArrowRight","type":"keyup","tick":661,"round":1,"phase":"active","wallTime":10936.666666666631},
  {"key":"ArrowRight","type":"keydown","tick":689,"round":1,"phase":"active","wallTime":11180.666666666631},
  {"key":"KeyS","type":"keydown","tick":719,"round":1,"phase":"active","wallTime":11424.666666666631},
  {"key":"KeyS","type":"keyup","tick":749,"round":1,"phase":"active","wallTime":11668.666666666631},
  {"key":"ArrowRight","type":"keyup","tick":777,"round":1,"phase":"active","wallTime":11912.666666666631},
  {"key":"ArrowRight","type":"keydown","tick":807,"round":1,"phase":"active","wallTime":12156.666666666631},
  {"key":"KeyS","type":"keydown","tick":807,"round":1,"phase":"active","wallTime":12164.666666666631},
  {"key":"KeyS","type":"keyup","tick":837,"round":1,"phase":"active","wallTime":12408.666666666631},
  {"key":"ArrowRight","type":"keyup","tick":895,"round":1,"phase":"active","wallTime":12888.666666666631},
  {"key":"KeyS","type":"keydown","tick":895,"round":1,"phase":"active","wallTime":12896.666666666631},
  {"key":"ArrowRight","type":"keydown","tick":925,"round":1,"phase":"active","wallTime":13140.666666666631},
  {"key":"KeyS","type":"keyup","tick":955,"round":1,"phase":"active","wallTime":13384.666666666631},
  {"key":"ArrowRight","type":"keyup","tick":1011,"round":1,"phase":"active","wallTime":13864.666666666631},
  {"key":"KeyS","type":"keydown","tick":1013,"round":1,"phase":"active","wallTime":13872.666666666631},
  {"key":"ArrowRight","type":"keydown","tick":1043,"round":1,"phase":"active","wallTime":14116.666666666631},
  {"key":"KeyS","type":"keyup","tick":1071,"round":1,"phase":"active","wallTime":14360.666666666631},
  {"key":"ArrowRight","type":"keyup","tick":1129,"round":1,"phase":"active","wallTime":14840.666666666631},
  {"key":"ArrowRight","type":"keydown","tick":1159,"round":1,"phase":"active","wallTime":15084.666666666631},
  {"key":"ArrowRight","type":"keyup","tick":1187,"round":1,"phase":"active","wallTime":15328.666666666631},
  {"key":"KeyS","type":"keydown","tick":1189,"round":1,"phase":"active","wallTime":15336.666666666631},
  {"key":"ArrowRight","type":"keydown","tick":1217,"round":1,"phase":"active","wallTime":15580.666666666631},
  {"key":"KeyS","type":"keyup","tick":1331,"round":1,"phase":"active","wallTime":16532.66666666663},
  {"key":"ArrowRight","type":"keyup","tick":1389,"round":1,"phase":"active","wallTime":17012.66666666663},
  {"key":"KeyL","type":"keydown","tick":1391,"round":1,"phase":"active","wallTime":17020.66666666663},
  {"key":"KeyL","type":"keyup","tick":1397,"round":1,"phase":"active","wallTime":17068.66666666663},
  {"key":"ArrowRight","type":"keydown","tick":1425,"round":1,"phase":"active","wallTime":17312.66666666663},
  {"key":"ArrowRight","type":"keyup","tick":1483,"round":1,"phase":"active","wallTime":17792.66666666663},
  {"key":"ArrowRight","type":"keydown","tick":1513,"round":1,"phase":"active","wallTime":18036.66666666663},
  {"key":"KeyL","type":"keydown","tick":1655,"round":1,"phase":"active","wallTime":19224.66666666663},
  {"key":"KeyL","type":"keyup","tick":1661,"round":1,"phase":"active","wallTime":19272.66666666663},
  {"key":"ArrowRight","type":"keyup","tick":1747,"round":1,"phase":"active","wallTime":19988.66666666663},
  {"key":"ArrowRight","type":"keydown","tick":1775,"round":1,"phase":"active","wallTime":20232.66666666663},
  {"key":"ArrowRight","type":"keyup","tick":1919,"round":1,"phase":"active","wallTime":21420.66666666663},
  {"key":"ArrowRight","type":"keydown","tick":1947,"round":1,"phase":"active","wallTime":21664.66666666663},
  {"key":"ArrowRight","type":"keyup","tick":1977,"round":1,"phase":"active","wallTime":21908.66666666663},
  {"key":"ArrowRight","type":"keydown","tick":2007,"round":1,"phase":"active","wallTime":22152.66666666663},
  {"key":"ArrowRight","type":"keyup","tick":2035,"round":1,"phase":"active","wallTime":22396.66666666663},
  {"key":"ArrowRight","type":"keydown","tick":2093,"round":1,"phase":"active","wallTime":22876.66666666663},
  {"key":"ArrowRight","type":"keyup","tick":2123,"round":1,"phase":"active","wallTime":23120.66666666663},
  {"key":"KeyS","type":"keydown","tick":2151,"round":1,"phase":"active","wallTime":23364.66666666663},
  {"key":"ArrowRight","type":"keydown","tick":2209,"round":1,"phase":"active","wallTime":23844.66666666663},
  {"key":"KeyS","type":"keyup","tick":2211,"round":1,"phase":"active","wallTime":23852.66666666663},
  {"key":"ArrowRight","type":"keyup","tick":2239,"round":1,"phase":"active","wallTime":24096.66666666663},
  {"key":"KeyS","type":"keydown","tick":2269,"round":1,"phase":"active","wallTime":24340.66666666663},
  {"key":"ArrowRight","type":"keydown","tick":2299,"round":1,"phase":"active","wallTime":24584.66666666663},
  {"key":"KeyS","type":"keyup","tick":2413,"round":1,"phase":"active","wallTime":25536.66666666663},
  {"key":"ArrowRight","type":"keyup","tick":2441,"round":1,"phase":"active","wallTime":25780.66666666663},
  {"key":"ArrowRight","type":"keydown","tick":2499,"round":1,"phase":"active","wallTime":26260.66666666663},
  {"key":"ArrowRight","type":"keyup","tick":2529,"round":1,"phase":"active","wallTime":26504.66666666663},
  {"key":"KeyS","type":"keydown","tick":2529,"round":1,"phase":"active","wallTime":26512.66666666663},
  {"key":"ArrowRight","type":"keydown","tick":2615,"round":1,"phase":"active","wallTime":27228.66666666663},
  {"key":"KeyS","type":"keyup","tick":2617,"round":1,"phase":"active","wallTime":27236.66666666663},
  {"key":"KeyL","type":"keydown","tick":2617,"round":1,"phase":"active","wallTime":27244.66666666663},
  {"key":"KeyL","type":"keyup","tick":2623,"round":1,"phase":"active","wallTime":27292.66666666663},
  {"key":"ArrowRight","type":"keyup","tick":2653,"round":1,"phase":"active","wallTime":27536.66666666663}
 ];
 assert.equal(commands.length,66);
 const results={};let firstFloor=null;
 for(const guard of [false,true]){
  const h=captureRuntimeHost({seed:96001,roundSeconds:99});
  try{
   await h.start();h.frame(55);
   const initial=h.runtime.getState();
   assert.equal(initial.tick,57);assert.equal(initial.round,1);assert.equal(initial.phase,'active');
   assert.equal(initial.config.seed,96001);assert.equal(initial.config.roundSeconds,99);
   assert.equal(initial.fighters[0].hp,185);assert.equal(initial.fighters[1].hp,220);
   assert.equal(initial.opponentInputSourceV163,'cpu');
   const qa=captureQaObserver(h),binding={stage:'floor',timeoutMs:45000,matchId:initial.config.matchId,
    round:initial.round,fighterIds:initial.fighters.map(f=>f.id),sides:initial.fighters.map(f=>f.side),
    attackerSide:'player',targetSide:'opponent',targetId:'import-game-dd-wy-commando',
    holdId:null,sinceTick:initial.tick,after:true};
   // Match the bridge's 60Hz frame delivery from its ordinary post-start clock.
   // No tick alignment, HP/pose edit, artificial opponent input or runtime patch.
   let wallTime=h.now(),nextFrame=wallTime+1000/60;
   const advanceTo=target=>{
    assert.ok(Number.isFinite(target)&&target>=wallTime);
    while(nextFrame<=target+1e-7){wallTime=nextFrame;h.frame(1,1000/60);nextFrame+=1000/60;}
    wallTime=target;
   };
   const waitFor=(predicate,budgetMs)=>{
    const deadline=wallTime+budgetMs;
    while(!predicate()&&wallTime<deadline)advanceTo(Math.min(nextFrame,deadline));
    assert.ok(predicate(),'The declared native replay wait exceeded '+budgetMs+'ms');
   };
   assert.ok(qa.observe(binding).armed);
   for(const [index,command] of commands.entries()){
    advanceTo(command.wallTime);
    const before=h.runtime.getState();
    assert.deepEqual([before.tick,before.round,before.phase],[command.tick,command.round,command.phase],
     'Recorded command '+index+' must reach its native tick without state adjustment');
    assert.equal(before.config.matchId,initial.config.matchId);
    h.key(command.key,command.type);
   }
   waitFor(()=>qa.out('floor').done,45000);
   const floor=qa.out('floor');assert.equal(floor.error,null);assert.equal(floor.ready,true);
   const held=h.runtime.getState();
   assert.equal(held.paused,true);assert.equal(held.tick,2701);assert.equal(held.round,1);
   assert.equal(held.fighters[0].hp,4);assert.equal(held.fighters[1].hp,187);
   assert.equal(held.grappleV153.id,84);assert.equal(held.grappleV153.bornTick,2656);
   assert.equal(held.grappleV153.attacker,'player');assert.equal(held.grappleV153.target,'opponent');
   assert.equal(held.grappleV153.escapeProgress,33);assert.equal(held.result,null);
   assert.equal(h.element('pause').clicks,1);assert.equal(qa.encodings.length,0);
   assert.equal(floor.floor.state.match.tick,held.tick);
   assert.equal(held.captureViewsV163.length,2);
   assert.ok(held.captureViewsV163.every(v=>v.fullFloorPin&&v.pairedContacts));
   if(firstFloor)assert.deepEqual(held,firstFloor,'Both continuations must start from the same natively earned state');
   else firstFloor=clone(held);
   assert.ok((await qa.observe({...captureBinding(held),stage:'post',timeoutMs:15000})).armed);
   // Continuation input transport is the same declared 8ms per key as the
   // recording. It advances real RAF on both paths and never changes a fighter.
   const key=(code,type)=>{
    advanceTo(wallTime+4);h.key(code,type);advanceTo(wallTime+4);
   };
   key('KeyP','keydown');key('KeyP','keyup');
   waitFor(()=>qa.out('post').release||qa.out('post').done,15000);
   const post=qa.out('post');assert.equal(post.error,null);assert.ok(post.struggle&&post.release);
   const release=post.release.state.match;
   assert.equal(release.tick,2741);
   assert.equal(release.grappleV153,undefined);assert.equal(release.fighters[0].hp,4);
   const ends=release.events.filter(e=>e.type==='grapple-end-v153'&&e.grappleId===held.grappleV153.id);
   assert.equal(ends.length,1);assert.equal(ends[0].reason,'escaped');
   if(guard)key('KeyS','keydown');
   try{
    waitFor(()=>post.done,15000);
   }finally{if(guard)key('KeyS','keyup');}
   const final=h.runtime.getState(),afterRelease=final.events.filter(e=>e.tick>=release.tick);
   results[guard?'guarded':'unguarded']={floorTick:held.tick,releaseTick:release.tick,
    finalTick:final.tick,hp:final.fighters[0].hp,phase:final.phase,paused:final.paused,
    blocks:afterRelease.filter(e=>e.type==='block'&&e.side==='player'),
    hits:afterRelease.filter(e=>e.type==='hit'&&e.side==='player'),error:post.error};
   if(guard){
    assert.equal(post.error,null);assert.equal(post.ready,true);
    assert.equal(final.paused,true);assert.equal(final.phase,'active');assert.equal(final.result,null);
    assert.equal(final.fighters[0].hp,3);assert.equal(final.grappleV153,undefined);
    assert.equal(final.tick-release.tick,54);assert.equal(post.pauseAction.observedNativeTicks,54);
    assert.equal(results.guarded.blocks.length,1);assert.equal(results.guarded.blocks[0].damage,1);
    assert.equal(results.guarded.blocks[0].tick,2794);
    assert.equal(results.guarded.hits.length,0);
    assert.equal(post.recovered.state.match.fighters[0].previousInput.guard,true);
    assert.equal(final.fighters[0].previousInput.guard,false);assert.equal(final.fighters[0].rearmControls.guard,false);
    const exported=qa.exportFrames({stage:'post',fields:['struggle','release','recovered']});
    assert.equal(exported.recovered.state.match.tick,final.tick);assert.equal(exported.recovered.state.match.fighters[0].hp,3);
    assert.ok(qa.encodings.every(frame=>frame.paused));
    h.frame(120,1000/60);assert.deepEqual(h.runtime.getState(),final,'Exports and delayed reads cannot advance the paused combat');
   }else{
    assert.equal(final.fighters[0].hp,0);assert.equal(final.phase,'round-over');
    assert.equal(final.tick,2797);
    assert.equal(final.roundWinner,'opponent');assert.equal(final.roundReason,'ko');
    assert.equal(post.ready,false);assert.match(post.error,/Recovery continuation requires/);
    assert.equal(post.pauseAction,undefined);assert.equal(h.element('pause').clicks,1);
    assert.equal(results.unguarded.blocks.length,0);assert.ok(results.unguarded.hits.some(e=>e.damage===4));
    assert.throws(()=>qa.exportFrames({stage:'post',fields:['recovered']}),/Recovery continuation requires/);
    assert.equal(qa.encodings.length,0);
   }
  }finally{h.runtime.stop();}
 }
 assert.equal(results.guarded.releaseTick,results.unguarded.releaseTick);
 t.diagnostic(JSON.stringify({method:'Recorded native command fixture; declared RAF/DOM/input transport, no Chromium or acquisition-policy guarantee.',...results}));
});

test('capture QA rejects unavailable public pause, changed tick or identity, ended holds and lost floor support',()=>{
 // Adversarial read/control fixtures are cloned from a real engine hold and
 // its real rendered receipt. They test rejection, never claim a UI playthrough.
 const m=native(atlases[0].fighterId);for(let i=0;i<65;i++){step(m,DT,{});view(m,images);}
 const state=()=>{const v=view(m,images);return{...clone(m),captureViewsV163:[{side:v.target.side,...receipt(v,'captive')}]};};
 const before=state();assert.ok(before.captureViewsV163[0].pairedContacts);
 pause(m,true);const after=state(),binding=captureBinding(before);
 const cases=[
  ['missing public button',{}, {},'missing'],
  ['disabled public button',{}, {},'disabled'],
  ['ignored public handler',{}, {},'ignored'],
  ['already paused',{paused:true}],
  ['different match',{config:{...before.config,matchId:'different-native-match'}}],
  ['different first hold',{grappleV153:{...before.grappleV153,id:before.grappleV153.id+1}}],
  ['hold ended before pause',{grappleV153:undefined,events:[...before.events,{type:'grapple-end-v153',tick:before.tick,grappleId:binding.holdId,reason:'escaped'}]}],
  ['tick advances during pause',{}, {tick:after.tick+1}],
  ['public handler loses hold',{}, {grappleV153:undefined}],
  ['public handler replaces hold',{}, {grappleV153:{...after.grappleV153,id:after.grappleV153.id+1}}],
  ['public handler changes participant',{}, {fighters:after.fighters.map((f,i)=>i?f:{...f,id:'warrior'})}],
  ['public handler loses floor support',{}, {captureViewsV163:after.captureViewsV163.map(v=>({...v,contacts:{...v.contacts,floorSupport:[v.contacts.floorSupport[0],v.floor+1]}}))}]
 ];
 for(const[label,beforePatch,afterPatch={},mode]of cases){
  const initial={...clone(before),...beforePatch},paused={...clone(after),...afterPatch};
  let current=initial;const queue=[],control={disabled:mode==='disabled',click(){if(mode!=='ignored')current=paused;}};
  const h={runtime:{getState:()=>clone(current)},canvas:{width:1000,height:560},element:()=>mode==='missing'?null:control,
   now:()=>0,requestAnimationFrame:fn=>queue.push(fn)};
  const qa=captureQaObserver(h);qa.observe(binding);for(const fn of queue.splice(0))fn();
  assert.ok(qa.out('floor').error,label+' must fail');assert.equal(qa.out('floor').ready,false,label+' cannot publish floor success');
 }
});

test('the first floor observer binds the native hold to its exact accepted special event',async()=>{
 const h=captureRuntimeHost();
 try{
  await nativePlayerCaptureForPause(h);
  let before=h.runtime.getState();
  for(let i=0;i<180&&before.grappleV153?.escapeProgress<66;i++){h.frame();before=h.runtime.getState();}
  assert.equal(before.grappleV153.escapeProgress,66);
  const contact=before.events.find(e=>e.type==='grapple-start-v153'&&e.grappleId===before.grappleV153.id);
  const special=before.events.findLast(e=>e.type==='attack'&&e.side==='player'&&e.id<contact.id);
  assert.equal(special.kind,'special');
  const binding={...captureBinding(before),attackEventId:special.id};
  for(const wrongEvent of [special.id-1,special.id+1]){
   const qa=captureQaObserver(h);qa.observe({...binding,attackEventId:wrongEvent});
   assert.match(qa.out('floor').error,/does not belong to the observed accepted special/);
   assert.equal(qa.out('floor').ready,false);assert.equal(h.element('pause').clicks||0,0);
   assert.deepEqual(h.runtime.getState(),before,'A wrong expected event cannot pause or change the native hold.');
  }
  const valid=captureQaObserver(h);valid.observe(binding);
  assert.equal(valid.out('floor').error,null);assert.equal(valid.out('floor').ready,true);
  assert.equal(valid.out('floor').floor.state.match.tick,before.tick);
  assert.equal(h.element('pause').clicks,1);assert.equal(h.runtime.getState().paused,true);
 }finally{h.runtime.stop();}
});

// Both original PR36 observation-window regressions remain native.
test('atomic floor protects an already-painted native floor before a grouped RAF can release it',async()=>{
 const h=captureRuntimeHost();
 try{
  const acquired=await nativePlayerCaptureForPause(h);
  while(h.runtime.getState().grappleV153?.escapeProgress<67)h.frame();
  const arm=h.runtime.getState();assert.equal(arm.grappleV153.id,acquired.grappleV153.id);
  const qa=captureQaObserver(h);qa.observe(captureBinding(arm));
  const pausedAtArm=h.runtime.getState().paused;
  h.frame(1,50);
  assert.equal(pausedAtArm,true,'Already-painted floor must pause synchronously before the next grouped native frame');
  assert.equal(qa.out('floor').error,null);assert.equal(qa.out('floor').ready,true);
  assert.equal(qa.out('floor').floor.state.match.tick,arm.tick);assert.equal(h.runtime.getState().tick,arm.tick);
  assert.equal(h.runtime.getState().grappleV153.id,arm.grappleV153.id);
 }finally{h.runtime.stop();}
});
test('atomic startup arms same-hold floor before a declared700ms external read latency',async()=>{
 const h=captureRuntimeHost(),qa=captureQaObserver(h);let attempt=0;
 try{
  const acquired=await nativePlayerCaptureForPause(h,{onAttempt(m,special){
   qa.startup({matchId:m.config.matchId,round:m.round,playerId:m.fighters[0].id,targetId:m.fighters[1].id,
    attemptNumber:++attempt,lastEventId:Math.max(...m.events.map(e=>e.id)),specialsBefore:m.fighters[0].stats.specials,
    specialStartup:special.startup,after:true,timeoutMs:55000,captureFloor:true});
  }});
  const initial=qa.startupState();assert.ok(initial.ready);const proof=initial.frame.preparationProof;
  const start=acquired.events.find(e=>e.type==='grapple-start-v153'&&e.grappleId===acquired.grappleV153.id);
  const attack=acquired.events.findLast(e=>e.type==='attack'&&e.side==='player'&&e.id<start.id);
  assert.equal(proof.attackEventId,attack.id);assert.equal(proof.attackId+1,attack.id);
  // Ordinary120Hz host frames continue while the external caller does no work.
  // No simulation clock, scheduler callback or native match field is replaced.
  h.frame(84);
  const floor=qa.out('floor'),frozen=h.runtime.getState();
  assert.ok(floor,'Accepted startup must have armed its floor before the caller returns');
  assert.equal(floor.error,null);assert.equal(floor.ready,true);assert.equal(frozen.paused,true);
  assert.equal(floor.expected.attackEventId,attack.id);assert.equal(floor.expected.startupAttemptNumber,attempt);
  assert.equal(floor.floor.state.match.grappleV153.id,acquired.grappleV153.id);
  assert.equal(frozen.grappleV153.id,acquired.grappleV153.id);assert.equal(frozen.tick,floor.floor.state.match.tick);
  assert.equal(h.element('pause').clicks,1);assert.equal(qa.encodings.length,0);
  assert.ok(frozen.captureViewsV163.some(v=>v.fullFloorPin&&v.pairedContacts&&v.targetId===acquired.fighters[1].id
   &&v.grappleId===acquired.grappleV153.id&&Math.abs(v.contacts.floorSupport[1]-v.floor)<1e-6));
 }finally{h.runtime.stop();}
});
