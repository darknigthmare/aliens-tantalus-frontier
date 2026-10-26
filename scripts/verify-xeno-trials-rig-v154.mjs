import test from 'node:test';
import { XENO_TRIALS_RIG_DATA_V163 } from '../src/xeno-trials-rig-data-v163.js';
import { XENO_TRIALS_RIG_DATA_V165 } from '../src/xeno-trials-rig-data-v165.js';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { XENO_TRIALS_RIGS_V154 as rigs,getXenoTrialsRigV154 as rigFor,getXenoTrialsRigMeshV154 as mesh,
 getXenoTrialsRigCueV154 as cue,sampleXenoTrialsRigV154 as sample,drawXenoTrialsRigV154 as draw,xenoTrialsTriangleAreaV154 as area } from '../src/xeno-trials-rig-v154.js';
import { XENO_TRIALS_FIGHTERS_V96 as roster,getXenoTrialsFighterV96 as def,getXenoTrialsArtV96 as art } from '../src/xeno-trials-data-v96.js';
import {createXenoTrialsMatchV96 as create,stepXenoTrialsMatchV96 as step,setXenoTrialsPausedV96 as pause,nextXenoTrialsRoundV96 as next} from '../src/xeno-trials-engine-v96.js';
import {createXenoTrialsRuntimeV96 as runtime} from '../src/xeno-trials-runtime-v96.js';
const HUMAN='dd-darwin-era-cultist',DT=1/120,copy=x=>JSON.parse(JSON.stringify(x));
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
const context=()=>{const calls=[];return new Proxy({calls,measureText:s=>({width:String(s).length*7}),createLinearGradient:()=>({addColorStop(){}})}, {get:(t,k)=>k in t?t[k]:(...a)=>{calls.push([k,...a]);}});};
const image=r=>({naturalWidth:r.sourceWidth,naturalHeight:r.sourceHeight,complete:true});
const metrics=r=>({width:r.sourceWidth*.25,height:r.sourceHeight*.25,pivotX:.5,bottom:1});
function live(){const m=create({playerId:HUMAN,opponentId:'prowler',introSeconds:0,holdRoundTransition:true,roundSeconds:120,difficulty:'hard',seed:153});
 for(let i=0;i<5400&&!m.grappleV153;i++)step(m,DT,{});assert.ok(m.grappleV153,'CPU must actually obtain contact');return m;}
test('four historical rigs and twenty-five historical poses remain intact beside the measured presentation catalogs',()=>{
 assert.equal(rigs.length,4);assert.equal(rigs.reduce((n,r)=>n+Object.keys(r.poses).length,0),25);assert.ok(Object.isFrozen(rigs));
 assert.equal(roster.length,189);for(const f of roster)assert.equal(Boolean(rigFor(f,art(f.id))),[...rigs,...XENO_TRIALS_RIG_DATA_V163,...XENO_TRIALS_RIG_DATA_V165].some(r=>r.fighterId===f.id),f.id);
 for(const r of rigs){assert.equal(r.canonExact,false);assert.equal(r.animation,'authored-keyframes-native-mesh');assert.ok(Object.isFrozen(r.bones));}
});
for(const r of rigs){
 test(`${r.fighterId}: native bytes, dimensions, alpha grid and dependency order are pinned`,()=>{
  const bytes=readFileSync(new URL('..'+r.path,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),r.sourceSha256);
  assert.equal(bytes.readUInt32BE(16),r.sourceWidth);assert.equal(bytes.readUInt32BE(20),r.sourceHeight);
  const ids=new Set();for(const b of r.bones){assert.ok(!ids.has(b.id));assert.ok(!b.parent||ids.has(b.parent));ids.add(b.id);assert.ok([...b.pivot,...b.tip].every(Number.isFinite));}
  assert.equal(r.mesh.mask.length,Math.ceil(r.mesh.cols*r.mesh.rows/4));assert.ok(mesh(r).triangles.length<=800);
  for(const a of Object.values(r.contacts))assert.ok(ids.has(a.bone));assert.equal(mesh(r),mesh(r));
 });
 test(`${r.fighterId}: profile, path, source orientation, dimensions and exposed SHA must agree`,()=>{
  const d=def(r.fighterId),a=art(d.id);assert.equal(rigFor(d,a),r);
  for(const patch of [{id:'other'},{profileId:'other'}])assert.equal(rigFor({...d,...patch},a),null);
  for(const patch of [{id:'other'},{path:'other'},{sourceFacing:-a.sourceFacing},{sourceWidth:1},{sha256:'a'.repeat(64)}])assert.equal(rigFor(d,{...a,...patch}),null);
 });
 test(`${r.fighterId}: every key pose is finite, nonfolding and retains both fixed support points`,()=>{
  const m=mesh(r);for(const clip of Object.keys(r.poses))for(let i=0;i<=60;i++){
   const f=sample(r,{clip,progress:i/60,elapsed:i/60*1.8});assert.ok(f.vertices.flat().every(Number.isFinite));
   for(const ids of m.triangles)assert.ok(area(...ids.map(j=>f.vertices[j]))>=area(...ids.map(j=>m.vertices[j].source))*.2,clip);
   for(const key of ['footNear','footFar']){near(f.contacts[key][0],r.contacts[key].point[0]);near(f.contacts[key][1],r.contacts[key].point[1]);}
  }
 });
 test(`${r.fighterId}: reduced motion and both ends of R1/intro restore the exact source geometry`,()=>{
  for(const clip of Object.keys(r.poses)){
   const f=sample(r,{clip,progress:.5,elapsed:.6},true);assert.equal(f.active,false);
   f.vertices.forEach((p,i)=>p.forEach((n,k)=>near(n,mesh(r).vertices[i].source[k])));
  }
  for(const clip of ['intro','round-win','round-loss'])for(const p of [0,1])assert.equal(sample(r,{clip,progress:p,elapsed:p*1.8}).active,false);
 });
 test(`${r.fighterId}: native image draw and mirrored contact maps retain the same scale and floor`,()=>{
  const f=sample(r,{clip:'struggle',progress:.5,elapsed:.6}),before=copy(f),a=context(),b=context();
  const right=draw(a,r,image(r),f,metrics(r),500,450,1),left=draw(b,r,image(r),f,metrics(r),500,450,-1);
  assert.ok(right?.drawn&&left?.drawn);assert.equal(a.calls.filter(c=>c[0]==='drawImage').length,mesh(r).triangles.length);
  for(const key of Object.keys(right.contacts)){near(right.contacts[key][0]+left.contacts[key][0],1000);near(right.contacts[key][1],left.contacts[key][1]);}
  assert.deepEqual(f,before);assert.equal(right.sourcePath,r.path);assert.equal(right.sourceSha256,r.sourceSha256);
 });
}
test('foreign rigs, unsupported clips and malformed samples fail closed',()=>{
 assert.equal(mesh({...rigs[0]}),null);assert.equal(sample({...rigs[0]},{clip:'intro',progress:.5,elapsed:.5}),null);
 for(const c of ['other','__proto__','constructor'])assert.equal(sample(rigs[0],{clip:c,progress:.5,elapsed:.5}),null);
 for(const value of [NaN,Infinity,-Infinity,undefined])assert.equal(sample(rigs[0],{clip:'intro',progress:value,elapsed:.5}),null);
});
test('a wrong-sized or unready sprite cannot be drawn as another creature',()=>{
 const r=rigs[0],f=sample(r,{clip:'intro',progress:.5,elapsed:.5}),ctx=context();
 assert.equal(draw(ctx,r,{...image(r),naturalHeight:1},f,metrics(r),0,0,1),null);
 assert.equal(draw(ctx,r,{...image(r),complete:false},f,metrics(r),0,0,1),null);
 assert.equal(draw(ctx,r,image(r),{...f,vertices:[[NaN,0]]},metrics(r),0,0,1),null);
 assert.equal(draw(ctx,r,{...image(r),naturalWidth:0,width:r.sourceWidth},f,metrics(r),0,0,1),null);
 assert.equal(draw(ctx,r,image(r),{...f,contacts:null},metrics(r),0,0,1),null);
 assert.equal(draw(ctx,r,image(r),f,metrics(r),NaN,0,1),null);assert.equal(ctx.calls.length,0);
});
test('inverted skin triangles do not partially paint the actor',()=>{
 const r=rigs[0],f=sample(r,{clip:'struggle',progress:.5,elapsed:.6}),ids=mesh(r).triangles[0];
 [f.vertices[ids[0]],f.vertices[ids[1]]]=[f.vertices[ids[1]],f.vertices[ids[0]]];const ctx=context();
 assert.equal(draw(ctx,r,image(r),f,metrics(r),0,0,1),null);assert.equal(ctx.calls.length,0);
});
test('intro motion belongs only to the presented fighter and consumes no match tick',()=>{
 const m=create({playerId:HUMAN,opponentId:'prowler',introSeconds:0}),before=copy(m),p={fighterSlot:0,elapsedMs:500,blocksSimulation:true};
 assert.equal(cue(rigs[1],m,m.fighters[0],p).clip,'intro');assert.equal(cue(rigs[0],m,m.fighters[1],p),null);assert.deepEqual(m,before);
});
test('a naturally obtained restraint selects captor/captive motion and the actual escape progress',()=>{
 const m=live();for(let i=0;i<25;i++)step(m,DT,{});const before=copy(m);
 assert.equal(cue(rigs[1],m,m.fighters[0]).role,'captive');assert.equal(cue(rigs[0],m,m.fighters[1]).role,'captor');assert.deepEqual(m,before);
 for(let i=0;i<24;i++)step(m,DT,{guard:true});const c=cue(rigs[1],m,m.fighters[0]);assert.equal(c.clip,'struggle');assert.ok(c.progress>0&&c.progress<1);
});
test('pause freezes exact pose samples without changing damage or escape timing',()=>{
 const m=live();for(let i=0;i<24;i++)step(m,DT,{guard:true});pause(m,true);
 const c=cue(rigs[1],m,m.fighters[0]),before=sample(rigs[1],c),state=copy(m);
 for(let i=0;i<100;i++){step(m,DT,{guard:true});assert.deepEqual(sample(rigs[1],cue(rigs[1],m,m.fighters[0])),before);}
 assert.deepEqual(m,state);
});
test('real guard escape selects a finite release without replay into a new round',()=>{
 const m=live();for(let i=0;i<80&&m.grappleV153;i++)step(m,DT,{guard:true});assert.equal(m.fighters[0].stats.grappleEscapesV153,1);
 assert.equal(cue(rigs[1],m,m.fighters[0]).clip,'release');for(let i=0;i<31;i++)step(m,DT,{},{});assert.equal(cue(rigs[1],m,m.fighters[0]),null);
 // Explicit unit boundary fixture: fast transition with a recent old-round end event.
 m.events.push({id:++m.serial,tick:m.tick,type:'grapple-end-v153',side:'player',attacker:'opponent'});m.phase='round-over';next(m);
 assert.equal(cue(rigs[1],m,m.fighters[0]),null);
});
test('R1 win and defeat are reversible, while draw and final result get no invented fatality',()=>{
 const m=create({playerId:HUMAN,opponentId:'prowler',introSeconds:0});m.phase='round-over';m.phaseTime=.8;m.roundWinner='opponent';const before=copy(m);
 assert.equal(cue(rigs[1],m,m.fighters[0]).clip,'round-loss');assert.equal(cue(rigs[0],m,m.fighters[1]).clip,'round-win');assert.deepEqual(m,before);
 m.roundWinner='draw';assert.equal(cue(rigs[1],m,m.fighters[0]),null);m.phase='match-over';assert.equal(cue(rigs[0],m,m.fighters[1]),null);
});
test('the actual Prowler preparation owns its cue, never a light hit or leap landing',()=>{
 const m=create({playerId:'prowler',opponentId:HUMAN,introSeconds:0});step(m,DT,{special:true},{});
 assert.equal(cue(rigs[0],m,m.fighters[0]).clip,'windup');for(let i=0;i<41;i++)step(m,DT,{},{});assert.equal(cue(rigs[0],m,m.fighters[0]),null);
});
test('sampling and drawing cannot change a complete physical match or its deterministic outcome',()=>{
 const a=create({playerId:HUMAN,opponentId:'prowler',introSeconds:0,seed:154}),b=copy(a),ctx=context();
 for(let i=0;i<600;i++){
  step(a,DT,{});step(b,DT,{});
  for(const f of b.fighters){const r=rigFor(def(f.id),art(f.id)),c=cue(r,b,f);if(c){const s=sample(r,c);draw(ctx,r,image(r),s,metrics(r),f.x,450-f.y,f.facing);}}
 }
 assert.deepEqual(b,a);
});
test('runtime receipts are detached, per-frame and cleared by stop',async()=>{
 const host=new EventTarget(),doc=Object.assign(new EventTarget(),{hidden:false,hasFocus:()=>true}),ctx=context(),frames=new Map();let serial=0;
 const canvas=Object.assign(new EventTarget(),{width:1000,height:560,getContext:()=>ctx,setAttribute(){},focus(){},ownerDocument:doc});
 const r=runtime({canvas,window:host,document:doc,requestAnimationFrame:f=>{frames.set(++serial,f);return serial;},cancelAnimationFrame:id=>frames.delete(id),
  loadImage:async path=>{const d=rigs.find(r=>r.path===path);return d?image(d):{naturalWidth:1000,naturalHeight:560,complete:true};},config:{playerId:HUMAN,opponentId:'prowler',seed:153}});
 assert.equal(await r.start(),true);for(let t=0;t<700;t+=50){const queued=[...frames];frames.clear();for(const[,f]of queued)f(t);}
 const state=r.getState();assert.ok(state.rigViewsV154.some(v=>v.side==='player'&&v.clip==='intro'&&v.drawn));
 state.rigViewsV154[0].contacts.head[0]=999999;assert.notEqual(r.getState().rigViewsV154[0].contacts.head[0],999999);
 r.pause();const before=r.getState();for(const[,f]of frames)f(999);assert.deepEqual(r.getState(),before);r.stop();assert.equal(r.getState().rigViewsV154.length,0);
});

test('Excel, inherited task IDs and exact source-only documents agree with the implemented lot',async()=>{
 const {execFileSync}=await import('node:child_process');
 const {isPublicDistributionPathV86}=await import('./verify-public-release-v86.mjs');
 const prefix='docs/forge/xeno-trials/',read=path=>readFileSync(new URL('../'+prefix+path,import.meta.url));
 const data=JSON.parse(read('progress-v154.json'));
 assert.deepEqual(data.rosterIds,[...roster.map(f=>f.id)]);
 assert.equal(data.bones,rigs.reduce((n,r)=>n+r.bones.length,0));assert.equal(data.keyPoses,25);
 assert.equal(data.completedTechnicalTasks,8);assert.equal(data.partialTasks,9);assert.equal(data.openTasks,11);assert.equal(data.approved1to1,0);
 const old=JSON.parse(read('progress-v153.json'));
 assert.deepEqual(data.taskIds,old.openArtTasks.map(r=>r[0]));assert.equal(data.tables['03_Production'].rows.length,28);
 assert.equal(createHash('sha256').update(read(data.workbook)).digest('hex'),data.workbookSha256);
 for(const name of ['V154-NATIVE-RIGS.md','progress-v154.json',data.workbook]){
  assert.equal(isPublicDistributionPathV86(prefix+name),true);assert.equal(isPublicDistributionPathV86(prefix+name,{built:true}),false);
 }
 assert.equal(isPublicDistributionPathV86(prefix+'unreviewed-v154.xlsx'),false);
 const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
 for(const path of ['xeno-trials-rig-v154.js','xeno-trials-rig-data-v154.js'])assert.equal(sw.split('/src/'+path).length-1,1);
 const script=`import sys,zipfile,json,xml.etree.ElementTree as E
p=json.load(open(sys.argv[1])); ns={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(sys.argv[2]) as z:
 sheets=E.fromstring(z.read('xl/workbook.xml')).find('m:sheets',ns)
 assert len(sheets)==8
 assert len([n for n in z.namelist() if n.startswith('xl/tables/') and n.endswith('.xml')])==7
 for n in z.namelist():
  if n.startswith('xl/worksheets/sheet') and n.endswith('.xml'):
   assert not E.fromstring(z.read(n)).findall('.//m:c[@t="e"]',ns),n
 sheet=E.fromstring(z.read('xl/worksheets/sheet1.xml'))
 values=[float(sheet.find('.//m:c[@r="E%d"]/m:v'%r,ns).text) for r in range(7,16)]
 assert values==[189,4,69,25,28,8,9,11,0],values
 assert len(sheet.findall('.//m:f',ns))==9
print('Excel verified: 8 sheets, 7 tables, 9 formula caches, no formula errors')`;
 const p=new URL('../'+prefix,import.meta.url);
 assert.match(execFileSync('python3',['-c',script,new URL('progress-v154.json',p).pathname,new URL(data.workbook,p).pathname],{encoding:'utf8'}),/Excel verified/);
});
