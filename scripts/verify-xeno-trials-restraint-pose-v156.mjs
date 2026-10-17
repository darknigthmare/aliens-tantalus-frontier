import test from 'node:test';
import assert from 'node:assert/strict';
import { XENO_TRIALS_RESTRAINT_POSE_V156 as config, sampleXenoTrialsRestraintPoseV156 as lower } from '../src/xeno-trials-restraint-pose-v156.js';
import { XENO_TRIALS_RIGS_V154 as rigs, getXenoTrialsRigMeshV154 as mesh, getXenoTrialsRigCueV154 as cue,
 sampleXenoTrialsRigV154 as sample, drawXenoTrialsRigV154 as draw, xenoTrialsTriangleAreaV154 as area } from '../src/xeno-trials-rig-v154.js';
import { createXenoTrialsMatchV96 as create,stepXenoTrialsMatchV96 as step,setXenoTrialsPausedV96 as pause } from '../src/xeno-trials-engine-v96.js';
const copy=value=>JSON.parse(JSON.stringify(value)),DT=1/120,HUMAN='dd-darwin-era-cultist';
const near=(a,b,tolerance=1e-7)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} != ${b}`);
const context=()=>new Proxy({calls:[]},{get:(target,key)=>key in target?target[key]:(...args)=>target.calls.push([key,...args])});
const image=r=>({naturalWidth:r.sourceWidth,naturalHeight:r.sourceHeight,complete:true});
const metrics=r=>({width:r.sourceWidth*.2,height:r.sourceHeight*.2,pivotX:.5,bottom:1});
const hold=(elapsed,clip='restraint')=>({clip,elapsed,progress:clip==='struggle'?.5:0,role:'captive'});
function live(){const match=create({playerId:HUMAN,opponentId:'prowler',introSeconds:0,holdRoundTransition:true,roundSeconds:120,difficulty:'hard',seed:153});
 for(let i=0;i<5400&&!match.grappleV153;i++)step(match,DT,{});assert.ok(match.grappleV153,'natural CPU grapple');return match;}

test('only the three exact V153 targets receive an explicitly partial, original lowering',()=>{
 assert.ok(Object.isFrozen(config));assert.equal(config.canonExact,false);assert.equal(config.fullFloorPin,false);
 assert.deepEqual(config.targets.map(t=>t.fighterId).sort(),rigs.filter(r=>r.fighterId!=='prowler').map(r=>r.fighterId).sort());
 for(const spec of config.targets){assert.ok(spec.lowering>=72&&spec.lowering<=150);assert.ok(Object.isFrozen(spec));}
 const prowler=sample(rigs[0],{...hold(.5),role:'captor'});assert.equal(prowler.restraintPoseV156,undefined);
});
for(const spec of config.targets){const rig=rigs.find(r=>r.fighterId===spec.fighterId),M=mesh(rig);
 test(`${rig.fighterId}: painted torso lowers while fixed sole bands and nonfolding skin survive every entry/release tick`,()=>{
  let minimum=Infinity;
  for(const clip of ['restraint','struggle','release'])for(let tick=0;tick<=120;tick++){
   const c=clip==='release'?{clip,progress:tick/120,elapsed:tick/480,heldSeconds:.5,releaseFrom:'struggle',role:'captive'}:hold(tick/120,clip),frame=sample(rig,c);
   assert.ok(frame.vertices.flat().every(Number.isFinite));
   for(const ids of M.triangles){const ratio=area(...ids.map(i=>frame.vertices[i]))/area(...ids.map(i=>M.vertices[i].source));minimum=Math.min(minimum,ratio);assert.ok(ratio>=.2,`${clip}/${tick}: ${ratio}`);}
   const supportY=Math.max(...rig.bones.filter(b=>/^foot[01]$/.test(b.id)).map(b=>b.pivot[1]-35));
   M.vertices.forEach(({source},index)=>{if(source[1]>=supportY)source.forEach((v,axis)=>near(frame.vertices[index][axis],v));});
   for(const key of ['footNear','footFar'])frame.contacts[key].forEach((v,axis)=>near(v,rig.contacts[key].point[axis]));
  }
  assert.ok(minimum>.27,`reviewed geometry safety margin ${minimum}`);
  const frame=sample(rig,hold(.5)),head=rig.contacts.head.point;
  near(frame.contacts.head[1]-head[1],spec.lowering,4);assert.equal(frame.restraintPoseV156.fullFloorPin,false);
  // Measured hip/knee/ankle segment lengths, rather than desired IK targets.
  frame.restraintPoseV156.knees.forEach((knee,index)=>{
   const hip=frame.restraintPoseV156.hips[index],sourceHip=rig.bones.find(b=>b.id===`thigh${index}`).pivot,
    sourceKnee=rig.bones.find(b=>b.id===`shin${index}`).pivot,ankle=rig.bones.find(b=>b.id===`foot${index}`).pivot;
   for(const[a,b,c,d]of[[hip,knee,sourceHip,sourceKnee],[knee,ankle,sourceKnee,ankle]]){
    const ratio=Math.hypot(a[0]-b[0],a[1]-b[1])/Math.hypot(c[0]-d[0],c[1]-d[1]);assert.ok(ratio>.97&&ratio<1.03,`segment ratio ${ratio}`);
   }
  });
 });
 test(`${rig.fighterId}: mirrored native draws retain body scale, floor and truthful lowered contacts`,()=>{
  const frame=sample(rig,hold(.5)),before=copy(frame),right=draw(context(),rig,image(rig),frame,metrics(rig),500,450,1),left=draw(context(),rig,image(rig),frame,metrics(rig),500,450,-1);
  assert.ok(right?.drawn&&left?.drawn);assert.equal(right.animation,config.animation);
  for(const key of Object.keys(right.contacts)){near(right.contacts[key][0]+left.contacts[key][0],1000);near(right.contacts[key][1],left.contacts[key][1]);}
  right.restraintPoseV156.knees.forEach((p,i)=>{near(p[0]+left.restraintPoseV156.knees[i][0],1000);near(p[1],left.restraintPoseV156.knees[i][1]);});
  assert.deepEqual(frame,before);
 });
 test(`${rig.fighterId}: entry and release join continuously even when a capture ends early`,()=>{
  for(const seconds of [.025,.1,.5,1.1])for(const clip of ['restraint','struggle']){
   const held=sample(rig,hold(seconds,clip)),released=sample(rig,{clip:'release',progress:0,elapsed:0,role:'captive',heldSeconds:seconds,releaseFrom:clip});
   held.vertices.forEach((p,i)=>p.forEach((v,axis)=>near(v,released.vertices[i][axis])));
   for(const key of Object.keys(held.contacts))held.contacts[key].forEach((v,axis)=>near(v,released.contacts[key][axis]));
   const settled=sample(rig,{clip:'release',progress:1,elapsed:.25,role:'captive',heldSeconds:seconds,releaseFrom:clip});assert.equal(settled.active,false);
   settled.vertices.forEach((p,i)=>p.forEach((v,axis)=>near(v,M.vertices[i].source[axis])));
  }
  const reduced=sample(rig,hold(.5),true);assert.equal(reduced.active,false);assert.equal(reduced.restraintPoseV156,undefined);
  reduced.vertices.forEach((p,i)=>p.forEach((v,axis)=>near(v,M.vertices[i].source[axis])));
 });
}
test('malformed cage geometry, non-target profiles and folded draw samples retain/fall back to the exact admitted pose',()=>{
 const rig=rigs[1],M=mesh(rig),base=sample(rig,hold(0));
 for(const[r,m,f,c]of[[{...rig,profileId:'foreign'},M,base,hold(.5)],[{...rig,bones:[]},M,base,hold(.5)],[rig,{...M,vertices:[{source:[NaN,0]}]},base,hold(.5)],
  [rig,M,{...base,vertices:[[NaN,0]]},hold(.5)],[rig,M,base,{...hold(.5),elapsed:NaN}],[rig,M,base,{...hold(.5),role:'captor'}]])assert.equal(lower(r,m,f,c),f);
 const folded=sample(rig,hold(.5)),ids=M.triangles[0];[folded.vertices[ids[0]],folded.vertices[ids[1]]]=[folded.vertices[ids[1]],folded.vertices[ids[0]]];
 const ctx=context();assert.equal(draw(ctx,rig,image(rig),folded,metrics(rig),500,450,1),null);assert.equal(ctx.calls.length,0);
 for(const bad of [{knees:null},{hips:[[NaN,0],[0,0]]},{sourceLowering:NaN},{gain:2}]){
  const clean=sample(rig,hold(.5)),ctx=context();assert.equal(draw(ctx,rig,image(rig),{...clean,restraintPoseV156:{...clean.restraintPoseV156,...bad}},metrics(rig),500,450,1),null);assert.equal(ctx.calls.length,0);
 }
});
test('real capture, pause and escape use only engine ticks, with a continuous release and no physical teleport',()=>{
 const match=live();for(let i=0;i<36;i++)step(match,DT,{});const rig=rigs[1],c=cue(rig,match,match.fighters[0]),before=copy(match),frame=sample(rig,c);
 assert.ok(frame.restraintPoseV156.sourceLowering===config.targets.find(t=>t.fighterId===HUMAN).lowering);assert.deepEqual(match,before);pause(match,true);const frozen=copy(match);
 for(let i=0;i<80;i++){step(match,DT,{guard:true});assert.deepEqual(sample(rig,cue(rig,match,match.fighters[0])),frame);}assert.deepEqual(match,frozen);pause(match,false);
 const heldX=match.fighters.map(f=>f.x);for(let i=0;i<80&&match.grappleV153;i++)step(match,DT,{guard:true});
 const release=cue(rig,match,match.fighters[0]);assert.equal(release.clip,'release');assert.equal(release.role,'captive');assert.equal(release.releaseFrom,'struggle');assert.ok(release.heldSeconds>0);
 assert.deepEqual(match.fighters.map(f=>f.x),heldX);assert.equal(match.fighters[0].stats.grappleEscapesV153,1);
});
test('KO, airborne/separated fighters, new rounds and terminal phases cannot retain the lowering',()=>{
 const m=live(),f=m.fighters[0],r=rigs[1];for(let i=0;i<35;i++)step(m,DT,{});
 const before=copy(m);f.hp=0;assert.equal(cue(r,m,f),null);Object.assign(m,copy(before));m.phase='match-over';assert.equal(cue(r,m,m.fighters[0]),null);
 Object.assign(m,copy(before));m.fighters[0].y=12;for(let i=0;i<2;i++)step(m,DT,{},{});assert.equal(m.grappleV153,undefined);assert.equal(cue(r,m,m.fighters[0]),null);
});
test('sampling through a whole deterministic duel does not change combat damage, positions, rewards or terminal result',()=>{
 const a=create({playerId:HUMAN,opponentId:'prowler',introSeconds:0,seed:153,roundSeconds:20}),b=copy(a);let observed=0;
 for(let tick=0;tick<12000&&a.phase!=='match-over';tick++){
  step(a,DT,{});step(b,DT,{});for(const fighter of b.fighters){const r=rigs.find(r=>r.fighterId===fighter.id),c=cue(r,b,fighter);if(c){const frame=sample(r,c);if(frame.restraintPoseV156)observed++;draw(context(),r,image(r),frame,metrics(r),fighter.x,450-fighter.y,fighter.facing);}}
 }
 assert.ok(observed>0);assert.equal(a.phase,'match-over');assert.deepEqual(b,a);
});
