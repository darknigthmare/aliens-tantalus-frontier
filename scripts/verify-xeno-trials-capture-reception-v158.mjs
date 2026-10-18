import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { XENO_TRIALS_CAPTURE_RECEPTION_V158 as config, sampleXenoTrialsCaptureReceptionV158 as receive } from '../src/xeno-trials-capture-reception-v158.js';
import { XENO_TRIALS_RIGS_V154 as rigs, getXenoTrialsRigMeshV154 as mesh, getXenoTrialsRigCueV154 as cue, sampleXenoTrialsRigV154 as sample,
 drawXenoTrialsRigV154 as draw, projectXenoTrialsMeshPointV157 as project, xenoTrialsTriangleAreaV154 as area } from '../src/xeno-trials-rig-v154.js';
import { getXenoTrialsRenderMetricsV110 as metrics } from '../src/xeno-trials-scale-v110.js';
import { createXenoTrialsMatchV96 as create, stepXenoTrialsMatchV96 as step, setXenoTrialsPausedV96 as pause } from '../src/xeno-trials-engine-v96.js';
const copy=x=>JSON.parse(JSON.stringify(x)),DT=1/120;
const near=(a,b,tolerance=1e-7)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} != ${b}`);
const length=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const host=()=>new Proxy({},{get:()=>()=>{}});
const image=r=>({naturalWidth:r.sourceWidth,naturalHeight:r.sourceHeight,complete:true});
const prepared=(elapsed,direction=1,facing=1,extra={})=>({clip:'restraint',elapsed,progress:0,role:'captive',contactDirectionV158:direction,facingV158:facing,...extra});
function realCapture(id){
 const m=create({playerId:id,opponentId:'prowler',seed:1,difficulty:'hard',introSeconds:0,roundSeconds:120,holdRoundTransition:true});
 for(let i=0;i<6000&&!m.grappleV153;i++)step(m,DT,{});
 assert.ok(m.grappleV153,`native CPU capture ${id}`);return m;
}
test('three exact project identities receive the missing receptions, with no canonical or floor-pin approval',()=>{
 assert.equal(config.targets.length,3);assert.equal(config.duration,.36);assert.equal(config.fullFloorPin,false);assert.equal(config.canonExact,false);
 assert.deepEqual(config.targets.map(t=>t.taskId).sort(),['ART153-10','ART153-17','ART153-24']);
 assert.deepEqual(config.phases.map(p=>p.id),['prise','absorption','appuis','raccord']);assert.ok(Object.isFrozen(config.targets));
 for(const spec of config.targets){const r=rigs.find(r=>r.fighterId===spec.fighterId);assert.equal(r.profileId,spec.profileId);
  assert.equal(createHash('sha256').update(readFileSync(new URL('..'+r.path,import.meta.url))).digest('hex'),r.sourceSha256);}
});
for(const spec of config.targets){const r=rigs.find(r=>r.fighterId===spec.fighterId),M=mesh(r),met=metrics(r.fighterId);
 test(`${r.fighterId}: all four reception phases draw real deformation while the native sole bands and triangle orientation survive`,()=>{
  const phases=new Set();let changes=0;
  for(const direction of [-1,1])for(const facing of [-1,1])for(let tick=1;tick<config.duration*120;tick++){
   const c=prepared(tick/120,direction,facing),frame=sample(r,c),base=sample(r,{...c,contactDirectionV158:undefined});
   assert.ok(frame.captureReceptionV158,`${tick}/${direction}/${facing}`);phases.add(frame.captureReceptionV158.phase);
   assert.equal(frame.animation,'original-native-capture-reception-v158');assert.equal(frame.captureReceptionV158.taskId,spec.taskId);
   assert.ok(frame.vertices.flat().every(Number.isFinite));
   for(const t of M.triangles)assert.ok(area(...t.map(i=>frame.vertices[i]))>=area(...t.map(i=>M.vertices[i].source))*.2);
   const soleTop=Math.max(...r.bones.filter(b=>/^foot[01]$/.test(b.id)).map(b=>b.pivot[1]-35));
   M.vertices.forEach(({source},index)=>{if(source[1]>=soleTop)source.forEach((v,axis)=>near(frame.vertices[index][axis],v));});
   changes+=frame.vertices.filter((p,i)=>length(p,base.vertices[i])>.5).length;
   // Every reported V158 joint is the actual barycentric projection of the
   // painted triangle, rather than an intended skeleton target.
   for(const [joint,prefix]of[['hips','thigh'],['knees','shin'],['ankles','foot']])for(const index of [0,1]){
    const p=project(r,frame,r.bones.find(b=>b.id===prefix+index).pivot);p.forEach((v,axis)=>near(frame.captureReceptionV158[joint][index][axis],v));
   }
  }
  assert.deepEqual([...phases].sort(),['absorption','appuis','prise','raccord']);assert.ok(changes>5000);
  const c=prepared(.14),frame=sample(r,c),base=sample(r,{...c,contactDirectionV158:undefined});
  const headShift=length(project(r,frame,r.contacts.head.point),project(r,base,r.contacts.head.point))*met.height/r.sourceHeight;
  assert.ok(headShift>3&&headShift<12,`visible head/torso response ${headShift}worldpx`);
 });
 test(`${r.fighterId}: upper body and carried weapon retain rigid local proportions; mirrored world contacts use the real draw affine`,()=>{
  const c=prepared(.14),f=sample(r,c),b=sample(r,{...c,contactDirectionV158:undefined});
  const upper=M.vertices.map((v,i)=>v.source[1]<=spec.rigidBottom?i:-1).filter(i=>i>=0);
  for(let i=0;i<upper.length-1;i+=7)near(length(f.vertices[upper[i]],f.vertices[upper[i+1]]),length(b.vertices[upper[i]],b.vertices[upper[i+1]]));
  const a=draw(host(),r,image(r),f,met,500,450,1),z=draw(host(),r,image(r),f,met,500,450,-1);assert.ok(a&&z);
  for(const name of Object.keys(a.contacts)){near(a.contacts[name][0]+z.contacts[name][0],1000);near(a.contacts[name][1],z.contacts[name][1]);}
  for(const joint of ['hips','knees','ankles'])for(const index of [0,1]){
   near(a.captureReceptionV158[joint][index][0]+z.captureReceptionV158[joint][index][0],1000);
   near(a.captureReceptionV158[joint][index][1],450+(f.captureReceptionV158[joint][index][1]-met.bottom*r.sourceHeight)*met.height/r.sourceHeight);
  }
  assert.ok(a.captureReceptionV158.ankles.every(p=>p[1]<=450));
 });
 test(`${r.fighterId}: entry, settled hold and interruption at every early tick join without a position jump`,()=>{
  const native=sample(r,prepared(0));native.vertices.forEach((p,i)=>p.forEach((v,k)=>near(v,M.vertices[i].source[k])));
  for(const clip of ['restraint','struggle'])for(let tick=1;tick<44;tick++){
   const seconds=tick/120,c=prepared(seconds,-1,-1,{clip,progress:clip==='struggle'?.3:0}),held=sample(r,c);
   const released=sample(r,{...c,clip:'release',progress:0,elapsed:0,heldSeconds:seconds,releaseFrom:clip});
   held.vertices.forEach((p,i)=>p.forEach((v,k)=>near(v,released.vertices[i][k])));
   const end=sample(r,{...c,clip:'release',progress:1,elapsed:.25,heldSeconds:seconds,releaseFrom:clip});
   end.vertices.forEach((p,i)=>p.forEach((v,k)=>near(v,M.vertices[i].source[k])));
  }
  for(const seconds of [.36,.5,1.2]){
   const c=prepared(seconds),f=sample(r,c),base=sample(r,{...c,contactDirectionV158:undefined});assert.equal(f.captureReceptionV158,undefined);assert.deepEqual(f,base);
  }
  const reduced=sample(r,prepared(.14),true);assert.equal(reduced.captureReceptionV158,undefined);reduced.vertices.forEach((p,i)=>p.forEach((v,k)=>near(v,M.vertices[i].source[k])));
 });
 test(`${r.fighterId}: native CPU contact owns timing; pause and guard escape never change the physical engine when rendering`,()=>{
  const a=realCapture(r.fighterId),b=copy(a);let frames=0;
  for(let i=0;i<60;i++){
   for(const f of b.fighters){const rig=rigs.find(r=>r.fighterId===f.id),c=cue(rig,b,f);if(c){const frame=sample(rig,c);if(frame.captureReceptionV158)frames++;draw(host(),rig,image(rig),frame,metrics(f.id),f.x,450-f.y,f.facing);}}
   step(a,DT,{guard:i>42});step(b,DT,{guard:i>42});assert.deepEqual(b,a);
  }
  assert.ok(frames>20);
  const c=cue(r,b,b.fighters[0]);pause(b,true);const frozen=copy(b),frame=sample(r,c);
  for(let i=0;i<15;i++){step(b,DT,{guard:true});assert.deepEqual(b,frozen);assert.deepEqual(sample(r,cue(r,b,b.fighters[0])),frame);}
 });
}
test('bad identities, phases, roles, geometry and nonobserved contacts leave the already admitted frame unchanged',()=>{
 const r=rigs[1],M=mesh(r),base=sample(r,prepared(0)),c=prepared(.14);
 for(const[rig,m,frame,cue]of[[{...r},M,base,c],[rigs[0],mesh(rigs[0]),sample(rigs[0],{clip:'restraint',elapsed:.14,progress:0}),c],
  [r,M,base,{...c,role:'captor'}],[r,M,base,{...c,clip:'intro'}],[r,M,base,{...c,contactDirectionV158:undefined}],
  [r,M,base,{...c,elapsed:NaN}],[r,{...M,vertices:[]},base,c],[r,M,{...base,vertices:[[NaN,0]]},c]])assert.equal(receive(rig,m,frame,cue),frame);
 assert.equal(receive(r,M,base,c,true),base);
});
test('a genuine engine projectile interruption returns from the actual early reception without a snap or engine mutation',async()=>{
 const {getXenoTrialsBodyBoundsV105:bounds}=await import('../src/xeno-trials-geometry-v105.js');
 const {XENO_TRIALS_ATTACKS_V96:attacks}=await import('../src/xeno-trials-engine-v96.js');
 for(const spec of config.targets){
  const m=realCapture(spec.fighterId),r=rigs.find(r=>r.fighterId===spec.fighterId);for(let i=0;i<12;i++)step(m,DT,{},{});
  const observed=cue(r,m,m.fighters[0]);assert.ok(sample(r,observed).captureReceptionV158);const body=bounds(m.fighters[1]);
  // Declared unit setup: a projectile already in flight, as in the inherited
  // V153 interruption regression. The production collision releases the hold.
  m.projectiles.push({id:++m.serial,owner:'player',x:body.left-1,y:body.bottom+body.height*.5,vx:560,vy:0,direction:1,life:1,spec:attacks.light,power:1,style:'pulse'});
  step(m,DT,{},{});assert.equal(m.grappleV153,undefined);
  const c=cue(r,m,m.fighters[0]);assert.equal(c.clip,'release');assert.equal(c.contactDirectionV158,observed.contactDirectionV158);assert.ok(c.heldSeconds<config.duration);
  const released=sample(r,c),held=sample(r,{...c,clip:'restraint',elapsed:c.heldSeconds,progress:0});
  released.vertices.forEach((p,i)=>p.forEach((v,axis)=>near(v,held.vertices[i][axis])));
  const before=copy(m);draw(host(),r,image(r),released,metrics(r.fighterId),m.fighters[0].x,450,m.fighters[0].facing);assert.deepEqual(m,before);
 }
});
test('separation cannot reverse an observed reception direction, and malformed new receipts fail closed',()=>{
 const m=realCapture('dd-darwin-era-cultist'),r=rigs[1];for(let i=0;i<12;i++)step(m,DT,{},{});
 const observed=cue(r,m,m.fighters[0]);m.fighters[1].x=m.fighters[0].x-500;step(m,DT,{},{});
 const released=cue(r,m,m.fighters[0]);assert.equal(released.contactDirectionV158,observed.contactDirectionV158);
 const clean=sample(r,prepared(.14));
 for(const extra of [{hips:null},{knees:[[NaN,0],[0,0]]},{seconds:NaN},{releaseGain:2}]){
  const frame={...clean,captureReceptionV158:{...clean.captureReceptionV158,...extra}};
  assert.equal(draw(host(),r,image(r),frame,metrics(r.fighterId),500,450,1),null);
 }
});
