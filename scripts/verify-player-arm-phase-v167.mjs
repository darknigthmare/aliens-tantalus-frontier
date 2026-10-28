import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125,
  resolvePlayerArmPoseV125 } from '../src/player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, createPlayerNeutralPoseV126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128 } from '../src/player-transit-rig-v128.js';
import { PLAYER_COLONIAL_RIG_ASSETS_V129, PLAYER_COLONIAL_LEG_DEFINITIONS_V129 } from '../src/player-colonial-art-v129.js';
import { advancePlayerLocomotionStateV129, resolvePlayerLocomotionRigV129 } from '../src/player-locomotion-rig-v129.js';

const images=new Map([...PLAYER_BODY_RIG_ASSETS_V125,...PLAYER_MODULAR_RIG_ASSETS_V126,
  ...PLAYER_TRANSIT_RIG_ASSETS_V128,...PLAYER_COLONIAL_RIG_ASSETS_V129].map(asset=>[asset.imageKey,
  {complete:true,naturalWidth:asset.sourceWidth,naturalHeight:asset.sourceHeight}]));
const actor=patch=>({x:400,y:532,w:44,h:92,alive:true,grounded:true,
  facing:1,vx:0,vy:0,costumeId:'costume-001',...patch});
const close=(a,b,message='coordinate')=>assert.ok(Math.abs(a-b)<1e-7,`${message}: ${a} != ${b}`);
function body(subject,state,surface='mission') {
  const observed={...subject,playerLocomotionStateV129:state};
  const native=resolvePlayerBodyRigV125({actor:observed,images,surface,timeSeconds:state.time,reducedMotion:true});
  const resolved=resolvePlayerLocomotionRigV129({actor:observed,bodyRig:native,images,
    locomotionState:state,legDefinitions:PLAYER_COLONIAL_LEG_DEFINITIONS_V129});
  assert.equal(resolved.eligible,true);
  return resolved.bodyRig;
}
function offsets(rig,pose=createPlayerNeutralPoseV126(rig)) {
  return {near:pose.grip.x-rig.shoulders.near.x-rig.facing*8*rig.scale,
    far:pose.support.x-rig.shoulders.far.x+rig.facing*8*rig.scale};
}
function advance(subject,state,tick,surface='mission') {
  subject={...subject,x:subject.x+subject.vx/120};
  state=advancePlayerLocomotionStateV129(state,subject,tick/120,{surface});
  return {subject,state,rig:body(subject,state,surface)};
}

test('the same observed empty-handed stride cannot move its arms when only the render clock changes',()=>{
  let checks=0;
  for(const surface of ['mission','hub','bioforge'])for(const facing of [-1,1])for(const speed of [80,155,270]) {
    let subject=actor({facing,vx:speed*facing}),state=advancePlayerLocomotionStateV129(null,subject,0,{surface});
    for(let tick=1;tick<=120;tick++) {
      const step=advance(subject,state,tick,surface);subject=step.subject;state=step.state;
      if(tick%15)continue;
      const original=JSON.stringify(step.rig),pose=createPlayerNeutralPoseV126(step.rig);
      for(const timeSeconds of [0,.25,77,10000])
        assert.deepEqual(createPlayerNeutralPoseV126({...step.rig,timeSeconds}),pose,
          'Rendering cannot advance an arm independently of its observed legs');
      assert.equal(JSON.stringify(step.rig),original);checks++;
    }
  }
  assert.equal(checks,144);
});

test('relaxed near and far arms counter the actual legs through forward travel and backpedalling',()=>{
  let opposed=0,maximumSway=0;
  for(const facing of [-1,1])for(const direction of [-1,1])for(const speed of [80,155,270]) {
    let subject=actor({facing,vx:direction*speed}),state=advancePlayerLocomotionStateV129(null,subject,0);
    for(let tick=1;tick<=240;tick++) {
      const step=advance(subject,state,tick);subject=step.subject;state=step.state;
      const sway=offsets(step.rig),legs=step.rig.locomotionV129.legs;
      close(sway.near,-sway.far,'The two relaxed arms oppose one another');
      maximumSway=Math.max(maximumSway,Math.abs(sway.near));
      assert.ok(Math.abs(sway.near)<=4*step.rig.scale+1e-7);
      const legSeparation=(legs.near.ankle.x-legs.near.hip.x)-(legs.far.ankle.x-legs.far.hip.x);
      if(Math.abs(legSeparation)>2&&Math.abs(sway.near)>.05) {
        assert.ok(legSeparation*sway.near<0,
          `Near arm must counter its actual leg: facing=${facing}, direction=${direction}, speed=${speed}, tick=${tick}`);
        opposed++;
      }
      const arms=resolvePlayerArmPoseV125(step.rig,createPlayerNeutralPoseV126(step.rig));
      assert.ok(arms);
      for(const arm of Object.values(arms)) {
        assert.ok(Number.isFinite(arm.elbow.x)&&Number.isFinite(arm.elbow.y));
      }
    }
  }
  assert.ok(opposed>1500);assert.ok(maximumSway>1);
});

test('a blocked departure and an undecorated body retain neutral hands without observed travel',()=>{
  const subject=actor({vx:155});let state=advancePlayerLocomotionStateV129(null,subject,0);
  for(const now of [.1,1,10]) {
    state=advancePlayerLocomotionStateV129(state,subject,now);
    const rig=body(subject,state),sway=offsets(rig);
    assert.equal(state.distance,0);close(sway.near,0);close(sway.far,0);
  }
  const native=resolvePlayerBodyRigV125({actor:{...subject,weaponRigMotionV125:{distance:200}},images,
    timeSeconds:0,reducedMotion:true});
  assert.equal(native.moving,true);
  const neutral=createPlayerNeutralPoseV126(native);
  assert.deepEqual(createPlayerNeutralPoseV126({...native,timeSeconds:91}),neutral);
  close(offsets(native).near,0);close(offsets(native).far,0);
});

test('the existing observed stop settles relaxed hands once, then remains still',()=>{
  for(const facing of [-1,1])for(const speed of [80,155,270]) {
    let subject=actor({facing,vx:speed*facing}),state=advancePlayerLocomotionStateV129(null,subject,0);
    for(let tick=1;tick<=97;tick++)({subject,state}=advance(subject,state,tick));
    subject={...subject,vx:0};let previousEnvelope=1,last;
    for(let frame=1;frame<=40;frame++) {
      state=advancePlayerLocomotionStateV129(state,subject,97/120+frame/120);
      const rig=body(subject,state),pose=createPlayerNeutralPoseV126(rig),sway=offsets(rig,pose);
      const envelope=rig.locomotionV129.presentationV136.motionEnvelope;
      assert.ok(envelope<=previousEnvelope+1e-7);previousEnvelope=envelope;
      assert.ok(Math.abs(sway.near)<=4*rig.scale*envelope+1e-7);
      assert.deepEqual(createPlayerNeutralPoseV126({...rig,timeSeconds:10000}),pose);
      close(state.distance,Math.abs(subject.x-400));last={rig,pose};
    }
    assert.equal(previousEnvelope,0);close(offsets(last.rig).near,0);close(offsets(last.rig).far,0);
    const original=JSON.stringify(last.rig);
    assert.deepEqual(createPlayerNeutralPoseV126({...last.rig,timeSeconds:50000}),last.pose);
    assert.equal(JSON.stringify(last.rig),original);
  }
});
