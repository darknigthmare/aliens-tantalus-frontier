import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {XENO_TRIALS_REACTIONS_V186 as PROFILES,createXenoTrialsReactionObserverV186 as observer,
 sampleXenoTrialsReactionV186 as sample,drawXenoTrialsReactionV186 as draw} from '../src/xeno-trials-reactions-v186.js';
import {getXenoTrialsArtV96,getXenoTrialsFighterV96} from '../src/xeno-trials-data-v96.js';
import {getXenoTrialsRigV154,getXenoTrialsRigMeshV154,xenoTrialsTriangleAreaV154} from '../src/xeno-trials-rig-v154.js';
import {getXenoTrialsRenderMetricsV110} from '../src/xeno-trials-scale-v110.js';
import {createXenoTrialsMatchV96,stepXenoTrialsMatchV96,XENO_TRIALS_ATTACKS_V96} from '../src/xeno-trials-engine-v96.js';

const fighter=(id='runner',extra={})=>({id,x:500,y:0,hp:180,stun:0,hitFlash:0,guard:false,facing:1,side:'player',...extra});
const match=actors=>({tick:0,round:1,phase:'active',fighters:actors});
const actor=id=>{const f=fighter(id),art=getXenoTrialsArtV96(id),rig=getXenoTrialsRigV154(getXenoTrialsFighterV96(id),art);return{f,art,rig,mesh:getXenoTrialsRigMeshV154(rig),metrics:getXenoTrialsRenderMetricsV110(id)};};

test('five unchanged native RGBA sources provide forty individually identified reaction states',()=>{
 assert.equal(PROFILES.length,5);assert.equal(new Set(PROFILES.flatMap(p=>p.states.map(s=>s.id))).size,40);
 for(const profile of PROFILES){const bytes=readFileSync(new URL(`..${profile.path}`,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),profile.sourceSha256);
  assert.equal(bytes[25],6);assert.equal(bytes.readUInt32BE(16),profile.sourceWidth);assert.equal(bytes.readUInt32BE(20),profile.sourceHeight);
  assert.ok(profile.sourceProvenance);assert.ok(profile.sourceWork);assert.equal(profile.canonExact,false);assert.equal(profile.fullProne,false);
 }
});

for(const profile of PROFILES)for(const state of profile.states)test(`${state.id}: actual source deformation remains supported and never folds during its full transition`,()=>{
 const row=actor(profile.fighterId),before=JSON.stringify(row.f),seen=[];
 for(let index=0;index<=20;index++){
  const frame=sample(row.f,row.art,{state:state.state,progress:index/20});assert.ok(frame,`${state.id}/${index}`);
  assert.equal(frame.vertices.length,row.mesh.vertices.length);assert.equal(JSON.stringify(row.f),before);
  for(const ids of row.mesh.triangles){const beforeArea=xenoTrialsTriangleAreaV154(...ids.map(i=>row.mesh.vertices[i].source)),afterArea=xenoTrialsTriangleAreaV154(...ids.map(i=>frame.vertices[i]));assert.ok(Number.isFinite(afterArea)&&afterArea>=beforeArea*.2);}
  for(const name of profile.supports){const native=row.rig.contacts[name].point,display=frame.contacts[name];assert.ok(Math.hypot(display[0]-native[0],display[1]-native[1])<1e-6,`${name}: complete support band stays fixed`);}
  seen.push(frame.vertices.some((p,i)=>Math.hypot(p[0]-row.mesh.vertices[i].source[0],p[1]-row.mesh.vertices[i].source[1])>3));
 }
 assert.ok(seen.some(Boolean),'Real nonzero articulated deformation is produced');
});

test('heavy windup, contact and recovery join continuously and finish at the exact original plate',()=>{
 for(const profile of PROFILES){const r=actor(profile.fighterId);
  for(const[left,right]of [['heavy-windup','heavy-contact'],['heavy-contact','heavy-recovery']]){
   const a=sample(r.f,r.art,{state:left,progress:1}),b=sample(r.f,r.art,{state:right,progress:0});
   assert.ok(Math.max(...a.vertices.map((p,i)=>Math.hypot(p[0]-b.vertices[i][0],p[1]-b.vertices[i][1])))<1e-6);
  }
  const end=sample(r.f,r.art,{state:'heavy-recovery',progress:1});
  assert.ok(end.vertices.every((p,i)=>Math.hypot(p[0]-r.mesh.vertices[i].source[0],p[1]-r.mesh.vertices[i].source[1])<1e-6));
 }
});

test('guard-break and recovery share the same supported lowered endpoint',()=>{
 for(const profile of PROFILES){const r=actor(profile.fighterId),a=sample(r.f,r.art,{state:'guard-break',progress:1}),b=sample(r.f,r.art,{state:'recover',progress:0});assert.deepEqual(a.vertices,b.vertices);}
});

test('observer uses the native guard, damage, break, heavy attack and KO clocks without writing actor/save state',()=>{
 const f=fighter(),m=match([f]),observe=observer();observe(m,f);
 f.guard=true;m.tick=1;assert.equal(observe(m,f).state,'guard');m.tick=13;assert.equal(observe(m,f).progress,1);
 f.guard=false;m.tick=14;assert.equal(observe(m,f).gain,1);m.tick=20;assert.ok(observe(m,f).gain<1);m.tick=27;assert.equal(observe(m,f),null);
 f.hp-=10;f.hitFlash=.13;m.tick=28;assert.equal(observe(m,f).state,'hurt');m.tick=40;assert.ok(observe(m,f).progress>0);
 f.guardBrokenV147=true;f.stun=.72;m.tick=41;assert.equal(observe(m,f).state,'guard-break');m.tick=77;assert.equal(observe(m,f).state,'recover');
 f.guardBrokenV147=false;f.stun=0;f.hitFlash=0;m.tick=130;
 for(const[age,state]of [[.1,'heavy-windup'],[.25,'heavy-contact'],[.4,'heavy-recovery']]){f.attack={kind:'heavy',age};m.tick++;assert.equal(observe(m,f,{spec:XENO_TRIALS_ATTACKS_V96.heavy}).state,state);}
 f.attack=null;f.hp=0;m.tick++;const before=JSON.stringify(m),cue=observe(m,f);assert.equal(cue.state,'ko');assert.equal(cue.progress,0);assert.equal(JSON.stringify(m),before);
 m.tick+=54;assert.equal(observe(m,f).progress,1);
});

test('a real deterministic engine strike selects its native heavy phases and the receiving damage reaction',()=>{
 const m=createXenoTrialsMatchV96({playerId:'warrior',opponentId:'runner',introSeconds:0,roundSeconds:30});
 const observe=observer(),seen=new Set();
 for(let step=0;step<900;step++){
  const active=m.phase==='active';
  stepXenoTrialsMatchV96(m,1/120,active?{right:true,heavy:step%110===0}:{},{});
  const spec=XENO_TRIALS_ATTACKS_V96.heavy;
  const a=observe(m,m.fighters[0],{spec}),b=observe(m,m.fighters[1],{spec});
  if(a)seen.add(a.state);if(b)seen.add(b.state);
 }
 assert.ok(m.fighters[0].stats.damage>0,'Attack impacts come from the actual engine, with a neutral direct-control opponent');
 for(const state of ['heavy-windup','heavy-contact','heavy-recovery','hurt'])assert.ok(seen.has(state),state);
});

test('defeated horde actors are cosmetic clones, bounded to sixteen and expire after .65s of match ticks',()=>{
 const foes=Array.from({length:20},(_,index)=>fighter('runner',{side:'opponent',instanceIdV180:`horde-${index}`}));
 const player=fighter('warrior'),m={...match([player,...foes]),hordeV180:{totalKills:0}},observe=observer();observe.refresh(m);
 m.tick=1;m.fighters=[player];m.hordeV180.totalKills=20;
 const before=JSON.stringify(m),rows=observe.getDefeated(m);
 assert.equal(rows.length,16);assert.ok(rows.every(row=>row.fighter.hp===0&&row.opacity===1&&row.cue.progress===0));
 rows[0].fighter.x=123456;assert.notEqual(observe.getDefeated(m)[0].fighter.x,123456);assert.equal(JSON.stringify(m),before);
 m.tick=66;const fading=observe.getDefeated(m);assert.equal(fading.length,16);assert.ok(fading.every(row=>row.opacity>0&&row.opacity<1));
 m.tick=79;assert.equal(observe.getDefeated(m).length,0);
});

test('new match, round change, time rewind, reload and explicit clear never replay old KO ghosts',()=>{
 const create=()=>{const f=fighter('runner',{side:'opponent',instanceIdV180:'horde-1'}),p=fighter('warrior'),m={...match([p,f]),hordeV180:{totalKills:0}},observe=observer();observe.refresh(m);m.tick=1;m.fighters=[p];m.hordeV180.totalKills=1;assert.equal(observe.getDefeated(m).length,1);return{m,observe};};
 for(const reset of [m=>({...m}),m=>{m.round++;return m;},m=>{m.tick=0;return m;},m=>JSON.parse(JSON.stringify(m))]){const{m,observe}=create();assert.equal(observe.getDefeated(reset(m)).length,0);}
 const{m,observe}=create();observe.clear();assert.equal(observe.getDefeated(m).length,0);
 const p=fighter('warrior'),reloaded={...match([p]),tick:600,hordeV180:{totalKills:50}};assert.equal(observer().getDefeated(reloaded).length,0);
});

test('reduced motion returns exact native geometry, while blocked/capture/missing-image paths preserve caller fallback',()=>{
 const r=actor('prowler'),cue={state:'ko',progress:1},f=sample(r.f,r.art,cue,{reducedMotion:true});
 assert.ok(f.vertices.every((p,i)=>Math.hypot(p[0]-r.mesh.vertices[i].source[0],p[1]-r.mesh.vertices[i].source[1])<1e-6));
 assert.equal(sample(r.f,r.art,cue,{blocked:true}),null);assert.equal(sample(r.f,{...r.art,path:'/wrong.png'},cue),null);
 assert.equal(sample(r.f,r.art,{state:'fake',progress:1}),null);
 const ctx=new Proxy({},{get:()=>()=>{}});assert.equal(draw(ctx,r.f,r.art,null,{cue,metrics:r.metrics}),null);
 const image={naturalWidth:r.art.sourceWidth,naturalHeight:r.art.sourceHeight};
 const views=[-1,1].map(facing=>draw(ctx,r.f,r.art,image,{cue,metrics:r.metrics,x:500,y:450,facing}));
 assert.ok(views.every(Boolean));for(const name of Object.keys(views[0].contacts)){assert.ok(Math.abs(views[0].contacts[name][0]+views[1].contacts[name][0]-1000)<1e-6);assert.equal(views[0].contacts[name][1],views[1].contacts[name][1]);}
});
