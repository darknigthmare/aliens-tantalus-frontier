import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { XENO_TRIALS_SWARM_SPRITES_V180 as PROFILES, getXenoTrialsSwarmSpriteV180, createXenoTrialsSwarmMotionV180,
  sampleXenoTrialsSwarmSpriteV180 as sample, drawXenoTrialsSwarmSpriteV180 as draw } from '../src/xeno-trials-swarm-sprites-v180.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import { getXenoTrialsRigV154, getXenoTrialsRigMeshV154, xenoTrialsTriangleAreaV154 } from '../src/xeno-trials-rig-v154.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-engine-v96.js';

const actor = id => ({ id,x:400,y:0,hp:100,stun:0,guard:false,facing:1 });
const setup = id => { const art=getXenoTrialsArtV96(id),metrics=getXenoTrialsRenderMetricsV110(id),profile=getXenoTrialsSwarmSpriteV180(id);
  return {fighter:actor(id),art,metrics,profile,rig:getXenoTrialsRigV154(getXenoTrialsFighterV96(id),art)}; };
const options = (row,phase) => ({metrics:row.metrics,moving:true,distance:row.profile.stride*row.metrics.width/row.art.sourceWidth*2*phase});

test('five exact native source identities retain their bytes, transparent alpha and franchise work attribution', () => {
  assert.equal(PROFILES.length,5);
  assert.equal(new Set(PROFILES.flatMap(profile=>profile.poses.map(pose=>pose.id))).size,40);
  for(const profile of PROFILES){
    const png=readFileSync(new URL(`..${profile.path}`,import.meta.url));
    assert.equal(createHash('sha256').update(png).digest('hex'),profile.sourceSha256,profile.fighterId);
    assert.equal(png.readUInt32BE(16),profile.sourceWidth);assert.equal(png.readUInt32BE(20),profile.sourceHeight);
    assert.equal(png[25],6,'Native source is RGBA; no opaque replacement sheet');
    assert.ok(profile.sourceWork);assert.equal(profile.canonExact,false);assert.equal(profile.fullLocomotion,false);
    assert.ok(profile.sourceProvenance);
  }
});

for(const profile of PROFILES)for(const pose of profile.poses)test(`${pose.id}: source mesh remains finite, oriented and supported`, () => {
  const row=setup(profile.fighterId),before=JSON.stringify(row.fighter),frame=sample(row.fighter,row.art,options(row,pose.phase));
  assert.ok(frame);const mesh=getXenoTrialsRigMeshV154(row.rig);
  assert.equal(JSON.stringify(row.fighter),before,'Rendering never changes physical actor');
  assert.equal(frame.vertices.length,mesh.vertices.length);
  assert.ok(frame.vertices.some((p,index)=>Math.hypot(p[0]-mesh.vertices[index].source[0],p[1]-mesh.vertices[index].source[1])>.1),'Actual texture deformation, not a translated plate');
  for(const ids of mesh.triangles){
    const a=xenoTrialsTriangleAreaV154(...ids.map(index=>mesh.vertices[index].source));
    const b=xenoTrialsTriangleAreaV154(...ids.map(index=>frame.vertices[index]));
    assert.ok(Number.isFinite(b)&&b>=a*.2,'No inverted/folded source triangle');
  }
  for(const chain of profile.chains){
    const native=row.rig.contacts[chain.contact].point,displayed=frame.contacts[chain.contact];
    assert.ok(displayed[1]<=native[1]+1e-7,'No support is pushed below its painted floor');
    assert.ok(Math.hypot(displayed[0]-native[0],displayed[1]-native[1])<=profile.stride);
  }
});

test('eight source poses per identity are distinct and the cyclic seam is continuous', () => {
  for(const profile of PROFILES){const row=setup(profile.fighterId);
    const frames=profile.poses.map(pose=>sample(row.fighter,row.art,options(row,pose.phase)));
    assert.equal(new Set(frames.map(frame=>JSON.stringify(frame.vertices))).size,8);
    const a=sample(row.fighter,row.art,options(row,0)),b=sample(row.fighter,row.art,options(row,1-1e-8));
    assert.ok(Math.max(...a.vertices.map((p,i)=>Math.hypot(p[0]-b.vertices[i][0],p[1]-b.vertices[i][1])))<.001);
  }
});

test('measured displacement observer blends start and stop, freezes repeated timestamps and rejects teleports', () => {
  const observe=createXenoTrialsSwarmMotionV180(),fighter=actor('runner');
  assert.equal(observe(fighter,0).moving,false);fighter.x+=3;
  const moving=observe(fighter,.02);assert.equal(moving.moving,true);assert.ok(moving.gain>0);
  assert.equal(observe(fighter,.02),moving);
  assert.equal(observe(fighter,.16).gain,0,'Stopping releases the pose continuously');
  fighter.x+=500;assert.deepEqual(observe(fighter,.18),{distance:0,moving:false,gain:0});
});

test('native strike timing stays continuous at startup, contact and recovery and leaves grounded supports fixed', () => {
  for(const profile of PROFILES){const row=setup(profile.fighterId);
    const spec=getXenoTrialsAttackV147(getXenoTrialsFighterV96(profile.fighterId),'light',XENO_TRIALS_ATTACKS_V96.light);
    for(const boundary of [spec.startup,spec.startup+spec.active]){
      const frames=[-1e-8,1e-8].map(epsilon=>sample({...row.fighter,attack:{kind:'light',age:boundary+epsilon}},row.art,{metrics:row.metrics,spec}));
      assert.ok(frames.every(Boolean));
      assert.ok(Math.max(...frames[0].vertices.map((p,i)=>Math.hypot(p[0]-frames[1].vertices[i][0],p[1]-frames[1].vertices[i][1])))<.001);
    }
    const strike=sample({...row.fighter,attack:{kind:'light',age:spec.startup+spec.active*.5}},row.art,{metrics:row.metrics,spec});
    assert.equal(strike.swarmV180.attackPhase,'contact');
    for(const name of ['footFar','footNear'])assert.ok(Math.hypot(...strike.contacts[name].map((v,i)=>v-row.rig.contacts[name].point[i]))<1e-6);
    assert.equal(sample({...row.fighter,attack:{kind:'light',age:spec.startup+spec.active+spec.recovery}},row.art,{metrics:row.metrics,spec}),null);
  }
});

test('both facing directions mirror the same native source and expose measured world contacts', () => {
  const row=setup('runner'),image={naturalWidth:row.art.sourceWidth,naturalHeight:row.art.sourceHeight};
  const ctx=new Proxy({},{get:(object,key)=>object[key]||(()=>{})});
  const views=[-1,1].map(facing=>draw(ctx,row.fighter,row.art,image,{...options(row,.25),x:400,y:450,facing}));
  assert.ok(views.every(view=>view?.drawn));
  for(const name of Object.keys(views[0].contacts)){
    assert.ok(Math.abs(views[0].contacts[name][0]+views[1].contacts[name][0]-800)<1e-6);
    assert.equal(views[0].contacts[name][1],views[1].contacts[name][1]);
  }
});

test('unsupported identity, art mismatch, missing image, capture priority, stopped motion and reduced motion retain native fallback', () => {
  const row=setup('runner'),o=options(row,.25),ctx=new Proxy({},{get:()=>()=>{}});
  assert.equal(getXenoTrialsSwarmSpriteV180('queen'),null);
  assert.equal(sample(row.fighter,{...row.art,path:'/wrong.png'},o),null);
  assert.equal(sample(row.fighter,row.art,{...o,blocked:true}),null);
  assert.equal(sample(row.fighter,row.art,{...o,reducedMotion:true}),null);
  assert.equal(sample(row.fighter,row.art,{...o,moving:false,gain:0}),null);
  assert.equal(sample({...row.fighter,hp:0},row.art,o),null);
  assert.equal(sample({...row.fighter,y:2},row.art,o),null);
  assert.equal(draw(ctx,row.fighter,row.art,null,o),null);
  assert.equal(draw(ctx,row.fighter,row.art,{naturalWidth:1,naturalHeight:1},o),null);
});
