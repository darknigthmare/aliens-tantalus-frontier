import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from '../src/player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128, PLAYER_TRANSIT_PRESENTATION_V128 } from '../src/player-transit-rig-v128.js';
import { advancePlayerLocomotionStateV129, resolvePlayerLocomotionRigV129 } from '../src/player-locomotion-rig-v129.js';
import { advanceHumanPatrolAnimationV133 } from '../src/human-patrol-animation-v133.js';

const images=new Map([...PLAYER_BODY_RIG_ASSETS_V125,...PLAYER_MODULAR_RIG_ASSETS_V126,...PLAYER_TRANSIT_RIG_ASSETS_V128]
  .map(asset=>[asset.imageKey,{complete:true,naturalWidth:asset.sourceWidth,naturalHeight:asset.sourceHeight}]));
const actor=(speed=155,facing=1)=>({x:500,y:532,w:44,h:92,grounded:true,alive:true,facing,
  vx:speed*facing,vy:0,costumeId:'costume-001',health:100,armor:35,ammo:24,ammoReserve:64,shots:0});
const close=(a,b,tolerance=1e-6)=>assert.ok(Math.abs(a-b)<tolerance,`${a} differs from ${b}`);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const thighAngle=(leg,facing)=>Math.atan2((leg.knee.x-leg.hip.x)*facing,leg.knee.y-leg.hip.y)*180/Math.PI;
function observed(speed,{fps=120,facing=1,surface='hub',seconds=3}={}){
  let subject=actor(speed,facing),state=advancePlayerLocomotionStateV129(null,subject,0,{surface});
  const frames=[];
  for(let tick=1;tick<=seconds*fps;tick++){
    subject={...subject,x:500+speed*facing*tick/fps};
    state=advancePlayerLocomotionStateV129(state,subject,tick/fps,{surface});
    subject.playerLocomotionStateV129=state;
    const body=resolvePlayerBodyRigV125({actor:subject,images,surface,timeSeconds:tick/fps});
    const rig=resolvePlayerLocomotionRigV129({actor:subject,bodyRig:body,images,locomotionState:state});
    frames.push({subject,state,rig,body});
  }
  return {subject,state,frames};
}

test('steady simulated travel has restrained thighs, useful foot clearance and rigid legs instead of a high-knee march',()=>{
  for(const surface of ['hub','mission','bioforge'])for(const facing of [-1,1])for(const speed of [155,270,370]){
    const {frames}=observed(speed,{surface,facing}),steady=frames.filter(frame=>frame.state.entrance>=frame.state.stride);
    const hips=[];let maxLift=0,plantedPairs=0,previous=null;
    assert.ok(steady.length>120);
    for(const {subject,rig,body}of steady){
      assert.equal(rig.ready,true);assert.equal(subject.vx,speed*facing);
      assert.equal(rig.bodyRig.matrix,body.matrix,'Lower-body balance cannot move an accepted weapon/body affine');
      assert.ok(Math.abs(rig.legs.near.sole.x-rig.legs.far.sole.x)<55,'Boots cannot reproduce the former 63px running split');
      for(const side of ['near','far']){
        const leg=rig.legs[side],contact=rig.contacts.feet[side],angle=thighAngle(leg,facing);
        assert.ok(angle>=-(speed===155?28:38)&&angle<=(speed===155?28:38),`${speed}: thigh ${angle}`);
        const shin=Math.atan2((leg.ankle.x-leg.knee.x)*facing,leg.ankle.y-leg.knee.y)*180/Math.PI;
        assert.ok(Math.abs(angle-shin)<=55,'Knee flexion remains restrained through recovery');
        close(distance(leg.hip,leg.knee),24);close(distance(leg.knee,leg.ankle),23.5);
        assert.equal(leg.reachClamped,false);assert.equal(leg.clearanceAdjusted,false);
        assert.ok(leg.heel.y<=624+1e-6&&leg.toe.y<=624+1e-6);
        assert.ok(contact.lift<=4+1e-6);maxLift=Math.max(maxLift,contact.lift);
        const nativeHipX=subject.x+subject.w/2+facing*(side==='near'?-4.5:6);
        assert.ok(Math.abs(leg.hip.x-nativeHipX)<=3+1e-6,'Sagittal weight transfer stays within three pixels of the belt axis');
        if(contact.planted&&previous?.contacts.feet[side].planted){
          close(leg.sole.x,previous.legs[side].sole.x);close(leg.sole.y,previous.legs[side].sole.y);plantedPairs++;
        }
      }
      hips.push(rig.legs.near.hip.y);previous=rig;
    }
    assert.ok(maxLift>=2&&maxLift<=4.001);
    assert.ok(Math.max(...hips)-Math.min(...hips)<(speed===155?3:5));
    assert.ok(plantedPairs>40,'Natural tuning cannot hide foot skating by removing support declarations');
  }
  assert.equal(PLAYER_TRANSIT_PRESENTATION_V128.upperLeg,48);assert.equal(PLAYER_TRANSIT_PRESENTATION_V128.lowerLeg,47);
});

test('a real acceleration sequence starts and turns in either direction without extending the first support into a split',()=>{
  for(const facing of [-1,1])for(const fps of [30,60,144])for(const initialFacing of [-1,1]){
    let subject={...actor(0,initialFacing),vx:0},state=advancePlayerLocomotionStateV129(null,subject,0,{surface:'hub'}),previous=null;
    let contacts=0,maximumSpan=0;
    for(let tick=1;tick<=fps*1.5;tick++){
      const gain=1-Math.pow(.7,60/fps);
      subject={...subject,vx:subject.vx+(270*facing-subject.vx)*gain,facing};
      subject.x+=subject.vx/fps;
      state=advancePlayerLocomotionStateV129(state,subject,tick/fps,{surface:'hub'});
      subject.playerLocomotionStateV129=state;
      const body=resolvePlayerBodyRigV125({actor:subject,images,surface:'hub',timeSeconds:tick/fps});
      const rig=resolvePlayerLocomotionRigV129({actor:subject,images,bodyRig:body,locomotionState:state});
      maximumSpan=Math.max(maximumSpan,Math.abs(rig.legs.near.sole.x-rig.legs.far.sole.x));
      for(const side of ['near','far']){
        const leg=rig.legs[side];
        assert.ok(Math.abs(thighAngle(leg,facing))<=38,'The first accelerating step keeps the running thigh envelope');
        assert.equal(leg.reachClamped,false);assert.equal(leg.clearanceAdjusted,false);
        assert.ok(leg.heel.y<=624+1e-6&&leg.toe.y<=624+1e-6);
        if(rig.contacts.feet[side].planted&&previous?.contacts.feet[side].planted){
          close(leg.sole.x,previous.legs[side].sole.x);close(leg.sole.y,previous.legs[side].sole.y);contacts++;
        }
      }
      previous=rig;
    }
    assert.ok(maximumSpan<55);assert.ok(contacts>fps/4,'Reduced first-step reach retains genuine stance contacts');
  }
});

test('actual travel retains the same phase and geometry at 30, 60 and 144Hz, and a frozen actor spends no new steps',()=>{
  for(const speed of [155,270,370])for(const facing of [-1,1]){
    const reference=observed(speed,{fps:60,facing,seconds:2});
    for(const fps of [30,144]){
      const other=observed(speed,{fps,facing,seconds:2});
      close(other.state.distance,2*speed);close(other.state.cycles,reference.state.cycles);
      for(const side of ['near','far'])for(const key of ['hip','knee','ankle','sole']){
        close(other.frames.at(-1).rig.legs[side][key].x,reference.frames.at(-1).rig.legs[side][key].x);
        close(other.frames.at(-1).rig.legs[side][key].y,reference.frames.at(-1).rig.legs[side][key].y);
      }
    }
    const unchanged=advancePlayerLocomotionStateV129(reference.state,reference.subject,2,{surface:'hub'});
    assert.equal(unchanged,reference.state);
    const wall=advancePlayerLocomotionStateV129(unchanged,reference.subject,2.1,{surface:'hub'});
    close(wall.cycles,unchanged.cycles);close(wall.distance,unchanged.distance);assert.equal(wall.moving,false);
  }
});

test('patrol acceleration cannot rewind frames by redividing historical distance with a new stride',()=>{
  const clip={id:'walk',loop:true,frames:[4,5,6,7]},subject=actor(22);
  let state=advanceHumanPatrolAnimationV133(null,subject,clip,0),time=0;
  const velocities=[...Array(120).fill(22),...Array.from({length:60},(_,n)=>22+n*4),...Array.from({length:60},(_,n)=>258-n*4)];
  for(const speed of velocities){
    const previous=state,dx=speed/60;time+=1/60;subject.x+=dx;subject.vx=speed;
    state=advanceHumanPatrolAnimationV133(previous,subject,clip,time);
    assert.ok(state.cycles>=previous.cycles,'Only forward observed travel advances the atlas phase');
    assert.ok(state.step>=previous.step,'A speed increase cannot jump the NPC back to an old walking cell');
    assert.ok(state.cycles-previous.cycles<=dx/Math.min(state.stride,previous.stride)+1e-8);
    close(state.distance,previous.distance+dx);
    const repeated=advanceHumanPatrolAnimationV133(state,subject,clip,time);
    close(repeated.cycles,state.cycles);assert.equal(repeated.step,state.step);
  }
  const stopped=advanceHumanPatrolAnimationV133(state,{...subject,vx:0},clip,time+1/60);
  close(stopped.cycles,state.cycles);assert.equal(stopped.suppressEvents,true);
});

test('slow and running patrols keep distance-owned cadence across frame rates without changing their physical actors',()=>{
  const clip={id:'walk',loop:true,frames:[4,5,6,7]};
  for(const speed of [22,70,270]){
    const results=[30,60,144].map(fps=>{
      const subject=actor(speed);let state=advanceHumanPatrolAnimationV133(null,subject,clip,0);
      for(let tick=1;tick<=fps*2;tick++){
        subject.x=500+speed*tick/fps;const before=structuredClone(subject);
        state=advanceHumanPatrolAnimationV133(state,subject,clip,tick/fps);assert.deepEqual(subject,before);
      }
      return state;
    });
    for(const result of results){close(result.distance,speed*2);close(result.cycles,results[0].cycles);assert.equal(result.step,results[0].step);}
    assert.ok(results[0].stepsPerSecond<=(speed===22?1.1:speed===70?2.6:4.3));
  }
});
