import test from 'node:test';
import assert from 'node:assert/strict';
import { humanGaitKindV133, humanGaitStrideV133, sampleHumanGaitV133 } from '../src/player-gait-v133.js';
import { advancePlayerLocomotionStateV129, resolvePlayerLocomotionRigV129 } from '../src/player-locomotion-rig-v129.js';
import { resolvePlayerBodyRigV125, resolvePlayerArmPoseV125, PLAYER_BODY_RIG_ASSETS_V125 } from '../src/player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128 } from '../src/player-transit-rig-v128.js';
import { constrainPlayerMuzzleV124 } from '../src/player-control-v124.js';
import { getHeldWeaponPoseV125, translateHeldWeaponPoseV125 } from '../src/held-weapon-renderer-v125.js';
import { WEAPONS } from '../src/content-core-v50.js';
const images = new Map([...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126, ...PLAYER_TRANSIT_RIG_ASSETS_V128].map(asset => [asset.imageKey, { complete: true, naturalWidth: asset.sourceWidth, naturalHeight: asset.sourceHeight }]));
const actor = patch => ({ x:100,y:200,w:42,h:92,alive:true,grounded:true,vx:245,vy:0,facing:1,costumeId:'costume-001',weaponRigMotionV125:{distance:0,shotAt:-Infinity},...patch });
const close = (a,b,label='') => assert.ok(Math.abs(a-b)<1e-6, `${label}: ${a} != ${b}`);
function observed({ speed=245,rate=60,seconds=1,patch={},surface='mission' }={}) {
  let subject=actor({vx:speed,...patch}),state=advancePlayerLocomotionStateV129(null,subject,0,{surface});
  const frames=[];
  for(let n=1;n<=seconds*rate;n++) {
    subject={...subject,x:100+speed*n/rate,weaponRigMotionV125:{distance:Math.abs(speed)*n/rate}};
    state=advancePlayerLocomotionStateV129(state,subject,n/rate,{surface}); subject.playerLocomotionStateV129=state;
    const body=resolvePlayerBodyRigV125({actor:subject,images,surface,timeSeconds:n/rate});
    frames.push(resolvePlayerLocomotionRigV129({actor:subject,bodyRig:body,images,locomotionState:state}));
  }
  return {subject,state,frames};
}
test('ordinary movement has a supported human stride and a bounded 3–5 step cadence without changing velocity',()=>{
  for(const surface of ['mission','hub','bioforge']) for(const speed of [155,245,270]) {
    const {subject,state,frames}=observed({speed,surface}); const last=frames.at(-1);
    assert.equal(subject.vx,speed); assert.ok(state.stride>=73 && state.stride<=139);
    assert.ok(last.presentationV133.stepsPerSecond>=3 && last.presentationV133.stepsPerSecond<5);
    assert.equal(state.gait,speed<235?'walk':'run'); close(last.presentationV133.standingHeight,96.5);
    assert.ok(last.presentationV133.footLiftLimit<=6);
  }
});
test('the same travelled distance preserves phase, rigid stature and foot placement at30/60/144Hz',()=>{
  for(const rate of [30,60,144]) {
    const {state,frames}=observed({rate}),last=frames.at(-1),reference=observed().frames.at(-1);
    close(state.distance,245); close(last.phase,reference.phase);
    for(const side of ['near','far']) for(const key of ['hip','knee','ankle','sole']) {
      close(last.legs[side][key].x,reference.legs[side][key].x); close(last.legs[side][key].y,reference.legs[side][key].y);
    }
  }
});
test('walking retains support while running has brief bounded flight, and neither boot clips the floor',()=>{
  for(const speed of [155,245,270]) for(const patch of [{},{facing:-1},{crouching:true}]) {
    const {frames}=observed({speed,seconds:2,patch}); let verified=0;
    frames.forEach((frame,index)=>{
      const supported=Object.values(frame.contacts.feet).some(foot=>foot.planted);
      if(frame.presentationV136.duty>=.5) assert.ok(supported,'Walking and crouching need continuous support.');
      else if(!supported) {
        assert.equal(frame.presentationV136.flight,true);
        assert.ok(Math.min(...Object.values(frame.contacts.feet).map(foot=>foot.lift))<=3,'Running flight stays close to the physical deck.');
      }
      for(const side of ['near','far']) {
        const leg=frame.legs[side], previous=frames[index-1]; assert.equal(leg.reachClamped,false);
        assert.ok(leg.heel.y<=292+1e-6 && leg.toe.y<=292+1e-6, 'The actual boot ends stay above the collision plane.');
        if(previous?.contacts.feet[side].planted && frame.contacts.feet[side].planted) {
          close(leg.sole.x,previous.legs[side].sole.x); close(leg.sole.y,previous.legs[side].sole.y); verified++;
        }
      }
    }); assert.ok(verified>50,'Two real seconds retain enough consecutive measured contacts, including the shorter running support duty.');
  }
});
test('upper-body motion keeps native proportions, a fixed physical foot pivot and restrained lean',()=>{
  const {frames}=observed(); let varying=0,previous=null;
  for(const frame of frames) {
    const body=frame.bodyRig,m=body.matrix,support=body.sourceFrame.support;
    close(Math.hypot(m.a,m.b),Math.hypot(m.c,m.d),'Isotropic native pixels');
    close(m.a*m.c+m.b*m.d,0,'No shear'); close(m.a*support.x+m.c*support.y+m.e,body.pivot.x); close(m.b*support.x+m.d*support.y+m.f,292);
    assert.ok(Math.abs(body.locomotionMotionV133.lean)<=.024); assert.ok(frame.presentationV133.pelvisBob<=.6);
    if(previous!==body.frame)varying++; previous=body.frame;
  } assert.ok(varying>=7);
});
test('wall contact and stopping cannot advance phase through the render clock or continue a phantom stride',()=>{
  const {subject,state}=observed(); const stopped={...subject,vx:0};
  const settled=advancePlayerLocomotionStateV129(state,stopped,2); stopped.playerLocomotionStateV129=settled;
  for(const timeSeconds of [2,10,200]) {
    const body=resolvePlayerBodyRigV125({actor:stopped,images,timeSeconds}),rig=resolvePlayerLocomotionRigV129({actor:stopped,bodyRig:body,images,locomotionState:settled});
    assert.equal(rig.mode,'idle'); assert.equal(rig.presentationV133.stepsPerSecond,0); assert.equal(body.locomotionMotionV133.lean,0); close(rig.phase,state.phase);
  }
  const blocked=advancePlayerLocomotionStateV129(settled,{...stopped,vx:245},201); assert.equal(blocked.moving,false); close(blocked.cycles,settled.cycles);
});
test('the accepted-shot geometry before the observation and the following rendered motion use the same shared gait phase',()=>{
  const {subject,state}=observed({seconds:.5}), current={...subject,x:subject.x+245/60,weaponRigMotionV125:{...subject.weaponRigMotionV125,distance:state.distance+245/60,shotAt:31/60}};
  const before=resolvePlayerBodyRigV125({actor:current,images,timeSeconds:31/60});
  current.playerLocomotionStateV129=advancePlayerLocomotionStateV129(state,current,31/60);
  const after=resolvePlayerBodyRigV125({actor:current,images,timeSeconds:31/60}); assert.deepEqual(after.matrix,before.matrix); assert.deepEqual(after.shoulders,before.shoulders);
  for(const descriptor of WEAPONS.filter(item=>['M41A Pulse Rifle','M4A3 Service Pistol','M56 Smartgun'].includes(item.name))) {
    const pose={actor:current,descriptor,aim:{x:1,y:-.3},timeSeconds:31/60};
    assert.deepEqual(getHeldWeaponPoseV125({...pose,bodyRig:before}),getHeldWeaponPoseV125({...pose,bodyRig:after}));
  }
});
test('gait tuning never borrows a human rig for custom bodies, costumes, or dedicated ladder and casualty poses',()=>{
  for(const patch of [{climbing:true},{grounded:false,climbing:true},{downed:true,alive:false},{userEquipmentV95:{armorId:'custom'}},{costumeId:'franchise-nostromo-crew'}]) {
    const subject=actor(patch),body=resolvePlayerBodyRigV125({actor:subject,images}),rig=resolvePlayerLocomotionRigV129({actor:subject,bodyRig:body,images});
    assert.equal(rig.eligible,false);
  }
  assert.equal(humanGaitKindV133(actor({vx:155})),'walk'); close(humanGaitStrideV133(actor({vx:270}),'run',.5),138);
  const frozen=Object.freeze(actor()); assert.ok(Number.isFinite(sampleHumanGaitV133(frozen,.5).cycles)); assert.equal(frozen.x,100);
});

test('actual acceleration, gait changes, deceleration and a mirrored restart never lower a heel through its support',()=>{
  let subject=actor({vx:0}),state=advancePlayerLocomotionStateV129(null,subject,0),time=0;
  for(const target of [270,0,-270,0,155,0]) for(let frame=0;frame<60;frame++) {
    const delta=1/60, blend=1-Math.exp(-15*delta),previous=subject.vx;
    subject={...subject,vx:previous+(target-previous)*blend,x:subject.x+target*delta+(previous-target)*blend/15};
    if(Math.abs(subject.vx)>1)subject.facing=Math.sign(subject.vx);time+=delta;
    state=advancePlayerLocomotionStateV129(state,subject,time);subject.playerLocomotionStateV129=state;
    const body=resolvePlayerBodyRigV125({actor:subject,images,timeSeconds:time}),rig=resolvePlayerLocomotionRigV129({actor:subject,bodyRig:body,images,locomotionState:state});
    for(const leg of Object.values(rig.legs)) {assert.equal(leg.reachClamped,false);assert.ok(leg.heel.y<=292+1e-6 && leg.toe.y<=292+1e-6,`target${target}, frame${frame}`);}
  }
});

test('reflecting a preview at the same clock preserves its anatomical cell and both moving hands',()=>{
  for(const speed of [70,155,245]) for(const time of [.05,.34,.65,1.1,2.2]) {
    const right=actor({x:0,w:44,vx:speed,weaponRigMotionV125:{distance:speed*time,shotAt:-Infinity}});
    const left={...right,facing:-1,vx:-speed};
    const r=resolvePlayerBodyRigV125({actor:right,images,timeSeconds:time}),l=resolvePlayerBodyRigV125({actor:left,images,timeSeconds:time});
    assert.equal(r.frame,l.frame);close(r.locomotionMotionV133.phase,l.locomotionMotionV133.phase);
    for(const side of ['near','far']){close(r.shoulders[side].x+l.shoulders[side].x,44);close(r.shoulders[side].y,l.shoulders[side].y);}
    const unarmed=body=>({unarmed:true,visible:false,grip:{x:body.shoulders.near.x+body.facing*6,y:body.shoulders.near.y+25},support:null,translation:{x:0,y:0}});
    const rr=resolvePlayerArmPoseV125(r,unarmed(r)),ll=resolvePlayerArmPoseV125(l,unarmed(l));
    for(const side of ['near','far']){close(rr[side].hand.x+ll[side].hand.x,44);close(rr[side].hand.y,ll[side].hand.y);}
  }
});

test('real barrel retraction recentres the arm inside its original measured socket even with remaining anatomical reach',()=>{
  for(const name of ['M56 Smartgun','Heavy Pulse Rifle']) for(const facing of [1,-1]) {
    const subject=actor({x:100,y:200,vx:0,aimingV124:true,facing}),body=resolvePlayerBodyRigV125({actor:subject,images,timeSeconds:0});
    const descriptor=WEAPONS.find(item=>item.name===name),pose=getHeldWeaponPoseV125({actor:subject,descriptor,aim:{x:0,y:-1},bodyRig:body});
    const muzzle={...pose.muzzle,pivotX:body.shoulders.near.x,pivotY:body.shoulders.near.y};
    const clipped=constrainPlayerMuzzleV124({walls:[{x:0,y:169.99,w:1000,h:30}]},subject,{x:pose.aimX,y:pose.aimY},muzzle);
    assert.equal(clipped.obstructedV124,true);
    const retracted=translateHeldWeaponPoseV125(pose,clipped.x-muzzle.x,clipped.y-muzzle.y),frozen=JSON.stringify({body,retracted});
    const fitted=resolvePlayerArmPoseV125(body,retracted);
    assert.ok(fitted.near.shoulderShiftDistance>0&&fitted.near.shoulderShiftDistance<=fitted.near.maxShoulderShift);
    for(const side of ['near','far']) {const arm=fitted[side];assert.equal(arm.shiftLimited,false);assert.ok(arm.reachError<1e-7);close(arm.upper,body.armLengths[side].upper);close(arm.fore,body.armLengths[side].fore);}
    assert.equal(JSON.stringify({body,retracted}),frozen);assert.equal(resolvePlayerArmPoseV125(body,pose).near.shoulderShiftDistance,0);
  }
});
