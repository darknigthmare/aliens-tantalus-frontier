import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS,HUB_WORLD,buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { HubGame as RosterHub } from '../src/hub-v52-runtime.js';
import { HubGame as RoutineHub,getNpcRoutineStandingAnchorV158 } from '../src/hub-v62-runtime.js';
import { HubGame as AnnexHub } from '../src/hub-v71-runtime.js';
import { spreadNpcStationSpawnsV136 } from '../src/npc-life-v136.js';
import { withHubNpcLifeV136 } from '../src/npc-life-v136.js';
import { withHubNpcCirculationV158 } from '../src/npc-circulation-v158.js';
import { withHubNpcAnnexCirculationV159 } from '../src/npc-annex-circulation-v159.js';
import { withHubNpcServiceRoutesV161 } from '../src/npc-service-routes-v161.js';
import { withHubNpcMedicalRouteV162 } from '../src/npc-medical-route-v162.js';
import { withHubNpcAnnexServiceRoutesV163 } from '../src/npc-annex-service-routes-v163.js';
import { withHubNpcAnnexLeasesV163 } from '../src/npc-annex-leases-v163.js';
import { withHubNpcAnnexWorkpostRoutesV165 } from '../src/npc-annex-workpost-routes-v165.js';
import { HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { resolveNpcRoutineV62 } from '../src/npc-dialogue-v62.js';
import { createDefaultSave,migrateSave } from '../src/save.js';
import { resolveCalClimbRigV165 } from '../src/npc-cal-climb-rig-v165.js';
import { NPC_CAL_LOGISTICS_ROUTE_V165 as D,NPC_CAL_LOGISTICS_GEOMETRY_V165 as G,
  createNpcCalLogisticsStateV165,normalizeNpcCalLogisticsRouteV165,
  advanceNpcCalLogisticsV165,withHubNpcCalLogisticsRouteV165 } from '../src/npc-cal-logistics-route-v165.js';

const nativeActor=()=>spreadNpcStationSpawnsV136([{...RosterHub.prototype.createNpcs.call({},D.deck).find(a=>a.crewId===D.crewId),
  roomId:D.parentRoomId,x:getNpcRoutineStandingAnchorV158(D.crewId,D.parentRoomId,'station'),mobile:false}],[G.parent])[0];
const routine=(hour=9.5,extra={})=>resolveNpcRoutineV62(D.crewId,{clock:{day:1,hour},...extra});
function simulate(seconds=180,{actor=nativeActor(),state=createNpcCalLogisticsStateV165(actor),rate=60,duty=true,
  resolution=routine(),artReady=true,...options}={}) {
  const frames=[];
  for(let i=0;i<seconds*rate;i++) {
    const before=state;
    state=advanceNpcCalLogisticsV165(state,actor,1/rate,{resolution,duty,artReady,...options});
    if(state.roomId===before.roomId){
      assert.ok(Math.abs(state.x-before.x)<=27/rate+.00001);
      assert.ok(Math.abs(state.y-before.y)<=24/rate+.00001);
    } else {
      assert.equal(before.stage,'covering');assert.equal(state.stage,'revealing');assert.equal(state.doorProgress,0);
      assert.equal(state.distance,before.distance);assert.equal(state.verticalDistance,before.verticalDistance);
    }
    Object.assign(actor,{x:state.x,y:state.y,roomId:state.roomId,facing:state.facing,vx:state.actualVelocity||0});
    const normalized=normalizeNpcCalLogisticsRouteV165({schema:165,actor:state}).actor;
    assert.ok(normalized,JSON.stringify(state));
    frames.push({...state});
  }
  return{actor,state,frames};
}

test('Cal owns his real station identity and reaches the real468catwalk through the paired624door and mounted ladder',()=>{
  for(const rate of[12,60]) {
    const actor=nativeActor(),home=actor.x,out=simulate(180,{actor,rate});
    assert.equal(out.state.roomId,'logistics');assert.equal(out.state.y,376);assert.equal(out.state.stage,'service');
    assert.ok(Math.abs(out.state.x-D.postX)<.25);assert.equal(out.state.crossings,1);assert.equal(out.state.arrivals,1);
    assert.ok(Math.abs(out.state.verticalDistance-156)<.00001);assert.equal(out.state.homeX,home);
    for(const phase of['opening','covering','revealing','floor-mount','climbing-up','top-dismount'])
      assert.ok(out.frames.some(frame=>frame.stage===phase),phase);
    assert.ok(out.frames.some(frame=>frame.y>376&&frame.y<532));
    assert.deepEqual(G.faces.parent.pairedSize,G.faces.local.pairedSize);
  }
});

test('the full descending return uses the same real rungs and portal, then reaches its exact floor bookmark',()=>{
  for(const rate of[12,60]) {
    const out=simulate(180,{rate}),home=out.state.homeX;
    const back=simulate(180,{rate,actor:out.actor,state:out.state,duty:false,resolution:routine(12.5)});
    assert.equal(back.state.roomId,D.parentRoomId);assert.equal(back.state.y,532);assert.equal(back.state.stage,'service');
    assert.ok(Math.abs(back.state.x-home)<.25);assert.equal(back.state.crossings,2);assert.equal(back.state.arrivals,2);
    assert.ok(Math.abs(back.state.verticalDistance-312)<.00001);
    for(const phase of['top-mount','climbing-down','floor-dismount'])assert.ok(back.frames.some(frame=>frame.stage===phase));
  }
});

test('each actual floor, leaf, mounting, climbing and upper service phase persists exactly and resumes without extra arrivals',()=>{
  const out=simulate();
  for(const phase of['walking','opening','covering','revealing','floor-mount','climbing-up','top-dismount','service']) {
    const frame=out.frames.find(value=>value.stage===phase);assert.ok(frame);
    const saved=normalizeNpcCalLogisticsRouteV165({schema:165,actor:frame}).actor;assert.ok(saved);
    const resumed=simulate(180,{actor:{...nativeActor(),...saved},state:saved});
    assert.equal(resumed.state.roomId,'logistics');assert.equal(resumed.state.y,376);
    assert.equal(resumed.state.stage,'service');assert.equal(resumed.state.crossings,1);assert.equal(resumed.state.arrivals,1);
  }
});

test('missing climb art or an occupied real ladder holds Cal at a supported floor waypoint, never a walk translated vertically',()=>{
  const held=simulate(180,{artReady:false});
  assert.equal(held.state.roomId,'logistics');assert.equal(held.state.y,532);assert.equal(held.state.arrivals,0);
  assert.equal(held.state.verticalDistance,0);assert.equal(held.state.reason,'art-unavailable');
  const occupied=simulate(180,{player:{crewId:'player',roomId:'logistics',alive:true,
    x:D.ladderBaseX,y:532,w:44,h:92}});
  assert.equal(occupied.state.y,532);assert.equal(occupied.state.arrivals,0);assert.equal(occupied.state.verticalDistance,0);
});

test('pause, contact and alert freeze the same braced limb supports; watch reversal finishes a safe landing before descending',()=>{
  const out=simulate(),middle=out.frames.find(frame=>frame.stage==='climbing-up'&&frame.y<490&&frame.y>430);
  const actor={...nativeActor(),...middle,w:44,h:92,ladderId:G.ladder.id};
  assert.equal(advanceNpcCalLogisticsV165(middle,actor,1/60,{running:false}),middle);
  const before=resolveCalClimbRigV165(actor,G.ladder);
  const crisisResolution=routine(9.5,{crisis:{id:'boarding'}});assert.equal(crisisResolution.alert,true);
  const stopped=advanceNpcCalLogisticsV165(middle,actor,1/60,{resolution:crisisResolution,duty:true,artReady:true});
  assert.equal(stopped.reason,'active-crisis');
  assert.equal(stopped.x,middle.x);assert.equal(stopped.y,middle.y);
  assert.deepEqual(resolveCalClimbRigV165({...actor,x:stopped.x,y:stopped.y},G.ladder).contacts,before.contacts);
  const reversed=simulate(180,{actor:{...actor},state:middle,duty:false,resolution:routine(12.5)});
  assert.equal(reversed.state.roomId,D.parentRoomId);assert.equal(reversed.state.stage,'service');
  assert.equal(reversed.state.arrivals,1,'an unfinished inspection is not counted as a service arrival');
  assert.ok(reversed.frames.some(frame=>frame.stage==='top-dismount'));
  assert.ok(reversed.frames.some(frame=>frame.stage==='climbing-down'));
});

test('Cal saves reject unsupported levels, foreign bodies, wrong ladders, invented landings and a service post on the floor',()=>{
  const out=simulate(),valid=out.frames.find(frame=>frame.stage==='climbing-up'&&frame.y<490);
  for(const patch of[{crewId:'crew-other'},{deck:3},{x:valid.x+10},{y:200},{phaseProgress:2},
    {verticalVelocity:80},{postX:100000},{dutyX:100000},{stage:'lift-transit'},{facing:-1}])
    assert.equal(normalizeNpcCalLogisticsRouteV165({schema:165,actor:{...valid,...patch}}).actor,null);
  assert.equal(normalizeNpcCalLogisticsRouteV165({schema:164,actor:valid}).actor,null);
  assert.equal(normalizeNpcCalLogisticsRouteV165({schema:165,actor:{...out.state,y:532}}).actor,null);
});

test('the actual Save field is additive and preserves valid mounted progress without accepting a foreign route',()=>{
  const save=createDefaultSave();assert.deepEqual(save.hub.npcCalLogisticsRouteV165,normalizeNpcCalLogisticsRouteV165());
  const out=simulate(),frame=out.frames.find(value=>value.stage==='climbing-up'&&value.y<490);
  save.hub.npcCalLogisticsRouteV165={schema:165,actor:frame};
  assert.deepEqual(migrateSave(save).hub.npcCalLogisticsRouteV165.actor,
    normalizeNpcCalLogisticsRouteV165(save.hub.npcCalLogisticsRouteV165).actor);
});

// This fixture invokes the real native roster, population, routine, geometry,
// traffic and owner mixins. Only the image resource is represented by its
// loaded dimensions; browser admission still has to observe the real pixels.
const LifeHub=withHubNpcLifeV136(RoutineHub);
class FixtureBase {
  initializeNpcRoutinesV62(...args){return RoutineHub.prototype.initializeNpcRoutinesV62.apply(this,args);}
  getNpcRoutineResolutionsV62(...args){return RoutineHub.prototype.getNpcRoutineResolutionsV62.apply(this,args);}
  setNpcRoutineContextV62(...args){return RoutineHub.prototype.setNpcRoutineContextV62.apply(this,args);}
  createNpcs(...args){return LifeHub.prototype.createNpcs.apply(this,args);}
  ensureAnnexNpcCohortV141(...args){return LifeHub.prototype.ensureAnnexNpcCohortV141.apply(this,args);}
  activeAnnexNpcsV141(...args){return LifeHub.prototype.activeAnnexNpcsV141.apply(this,args);}
  tickAnnexNpcLifeV141(...args){return LifeHub.prototype.tickAnnexNpcLifeV141.apply(this,args);}
  tickParentNpcLifeV136(...args){return LifeHub.prototype.tickParentNpcLifeV136.apply(this,args);}
  stepHubNpcLifeV136(...args){return LifeHub.prototype.stepHubNpcLifeV136.apply(this,args);}
  interactWithAnnexNpcV141(...args){return LifeHub.prototype.interactWithAnnexNpcV141.apply(this,args);}
  npcAnimationRequest(...args){return LifeHub.prototype.npcAnimationRequest.apply(this,args);}
  hubDoorPairV142(...args){return AnnexHub.prototype.hubDoorPairV142.apply(this,args);}
  getParentAnnexDoorV71(...args){return AnnexHub.prototype.getParentAnnexDoorV71.apply(this,args);}
  currentRoom(){return HUB_DECKS[this.state.deck].rooms.find(room=>room.id===this.state.roomId);}
  currentAnnexV71(){return this.local?getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[this.local]):null;}
  isAnnexActiveV71(){return Boolean(this.local);}
  sampleNpcAnimation(){}
  drawNpcLifeV136(){return false;}
  drawDepthContactShadowV116(){return true;}
  setNpcCrisisAlert(){}
  emitStatus(){}
  start(save={}, {routineContextV62={clock:{day:1,hour:5.5}}}={}) {
    this.state={deck:save.deck??2,roomId:save.roomId||'vehicle-bay'};
    this.player={x:5000,y:532,w:44,h:92,alive:true};
    this.hubCommercialStateV71={returnContext:null};this.hubNpcInteractions={};this.hubNpcSequence=0;
    this.hubNpcAnimation={reset(){}};this.events=[];this.onAction=event=>this.events.push(event);this.audio={ui(){}};
    this.initializeNpcRoutinesV62(save,routineContextV62);
    this.doorStates=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,this.state.deck).map(door=>({...door}));
    this.npcs=this.createNpcs(this.state.deck);this.obstacles=buildHubObstacleGeometryV87(this.state.deck);this.running=true;
    this.persisted=[];this.onPersist=value=>this.persisted.push(value);
  }
  update(dt) {
    if(!this.running)return;
    if(this.local){this.tickParentNpcLifeV136(dt);this.tickAnnexNpcLifeV141(dt);}
    else for(const actor of this.npcs) {
      actor.workClock=Math.max(0,actor.workClock-dt);actor.supportClock=Math.max(0,actor.supportClock-dt);
      this.stepHubNpcLifeV136(actor,dt);
    }
  }
  persist(){this.onPersist({npcRoutineState:structuredClone(this.npcRoutineStateV62)});}
  getSnapshot(){return{};}
}
const TestHub=withHubNpcCalLogisticsRouteV165(withHubNpcAnnexWorkpostRoutesV165(withHubNpcAnnexLeasesV163(
  withHubNpcAnnexServiceRoutesV163(withHubNpcMedicalRouteV162(withHubNpcServiceRoutesV161(
    withHubNpcAnnexCirculationV159(withHubNpcCirculationV158(FixtureBase))))))));
function runtime(hour=5.5,save={}) {
  const hub=new TestHub();hub.start(save,{routineContextV62:{clock:{day:1,hour}}});
  hub.calClimbImageV165={complete:true,naturalWidth:1254,naturalHeight:1254};return hub;
}
const context=(hub,hour,extra={})=>hub.setNpcRoutineContextV62({clock:{day:1,hour},...extra},{persist:false,rebuild:true});
const tick=(hub,seconds)=>{for(let i=0;i<seconds*60;i++)hub.update(1/60);};
const routeState=hub=>hub.getSnapshot().npcCalLogisticsRouteV165;

test('the composed owner keeps the same native Cal through the real watch, ladder, dialogue, save and returning floor bookmark',()=>{
  const hub=runtime(),actor=hub.getNpcCalLogisticsActorV165();assert.ok(actor);
  const homeX=actor.x;assert.equal(actor.roomId,D.parentRoomId);assert.equal(actor.y,532);
  assert.equal(hub.getNpcServiceOwnedActorsV163().filter(body=>body.crewId===D.crewId).length,1);
  context(hub,9.5);assert.equal(hub.getNpcCalLogisticsActorV165(),actor);tick(hub,180);
  assert.equal(actor.roomId,'logistics',JSON.stringify(routeState(hub)));assert.equal(actor.y,376);
  assert.equal(routeState(hub).actor.stage,'service');assert.equal(routeState(hub).actor.arrivals,1);
  hub.local='logistics';assert.deepEqual(hub.ensureAnnexNpcCohortV141().filter(body=>body.crewId===D.crewId),[actor]);
  const event=hub.interactWithAnnexNpcV141(actor);assert.equal(event.crewId,D.crewId);assert.equal(event.roomId,'logistics');
  hub.persist();const restored=runtime(9.5,hub.persisted.at(-1));
  assert.deepEqual(routeState(restored).actor,routeState(hub).actor);
  const returning=restored.getNpcCalLogisticsActorV165();context(restored,12.5);
  let returned=false;
  for(let i=0;i<180*60;i++) {
    const s=routeState(restored).actor;
    if(s?.roomId===D.parentRoomId&&s.stage==='service'&&s.crossings===2) {
      assert.ok(Math.abs(s.x-homeX)<.26);assert.equal(s.y,532);returned=true;
    }
    restored.update(1/60);
  }
  assert.ok(returned);assert.equal(returning.roomId,D.parentRoomId);
  const end=routeState(restored);assert.equal(end.actor,null);assert.equal(end.nativeHandoff.observedTravel,false);
});

test('medical or mission reassignment delegates the one real Cal and never manufactures a healthy local substitute',()=>{
  for(const extra of[{crew:[{id:D.crewId,health:20,injuries:[]}]},{operation:{crewIds:[D.crewId]}}]) {
    const hub=runtime();assert.ok(hub.getNpcCalLogisticsActorV165());
    context(hub,9.5,extra);hub.update(1/60);
    assert.equal(hub.getNpcCalLogisticsActorV165(),null);assert.equal(routeState(hub).nativeHandoff.observedTravel,false);
    assert.equal(hub.getNpcServiceOwnedActorsV163().filter(body=>body.crewId===D.crewId).length,0);
  }
});

test('a coupled journey may request the real logistics pocket outside the watch, hold its same owner, then restore its floor bookmark',()=>{
  class PassingCal extends TestHub {
    getNpcServicePassingDutyV165(id,actor) {
      return id==='cal-logistics'&&actor.crewId===D.crewId?this.passing:super.getNpcServicePassingDutyV165?.(id,actor);
    }
    shouldHoldNpcServiceOwnerV165(id,actor,s) {
      return id==='cal-logistics'&&actor.crewId===D.crewId?this.passing:super.shouldHoldNpcServiceOwnerV165?.(id,actor,s);
    }
  }
  const hub=new PassingCal();hub.start({}, {routineContextV62:{clock:{day:1,hour:5.5}}});
  hub.calClimbImageV165={complete:true,naturalWidth:1254,naturalHeight:1254};
  const actor=hub.getNpcCalLogisticsActorV165(),homeX=actor.x;
  hub.passing=true;context(hub,12.5);tick(hub,180);
  const held=routeState(hub).actor;assert.equal(held.stage,'service');assert.equal(held.roomId,'logistics');
  assert.equal(held.y,376);assert.equal(held.reason,'occupied');assert.equal(held.crossings,1);
  assert.equal(hub.getNpcCalLogisticsActorV165(),actor);tick(hub,1);
  assert.equal(actor.x,held.x);assert.equal(actor.y,376);
  hub.passing=false;
  let returned=false;
  for(let i=0;i<180*60;i++) {
    const s=routeState(hub).actor;
    if(s?.roomId===D.parentRoomId&&s.stage==='service'&&s.crossings===2) {
      assert.ok(Math.abs(s.x-homeX)<.26);assert.equal(s.y,532);returned=true;
    }
    hub.update(1/60);
  }
  assert.ok(returned);assert.equal(routeState(hub).nativeHandoff.observedTravel,false);
  const origin=nativeActor(),start=origin.x,yielded=simulate(2,{actor:origin,yieldGoalX:start+50});
  assert.ok(yielded.state.x>start);assert.equal(yielded.state.crossings,0);assert.equal(yielded.state.arrivals,0);
});
