import assert from 'node:assert/strict';
import { test } from 'node:test';
import { withHubTrainingV132,normalizeHubTrainingV132 } from '../src/hub-training-v132.js';
import { getHubBulkheadColliderV134 } from '../src/hub-bulkhead-depth-v134.js';
import { normalizeHubVentStateV62 } from '../src/hub-v62-runtime.js';
import { HUB_VENT_NETWORK_V62,enterVentNetworkV62,advanceVentTransitionV62 } from '../src/vent-network-v62.js';
import { HUB_DECKS,HUB_WORLD,buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { HubGame as RoutineHub } from '../src/hub-v62-runtime.js';
import { HubGame as AnnexHub } from '../src/hub-v71-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { resolveNpcRoutineV62 } from '../src/npc-dialogue-v62.js';
import { withHubNpcLifeV136 } from '../src/npc-life-v136.js';
import { withHubNpcCirculationV158 } from '../src/npc-circulation-v158.js';
import { withHubNpcAnnexCirculationV159 } from '../src/npc-annex-circulation-v159.js';
import { withHubNpcServiceRoutesV161 } from '../src/npc-service-routes-v161.js';
import { withHubNpcMedicalRouteV162 } from '../src/npc-medical-route-v162.js';
import { withHubNpcAnnexServiceRoutesV163 } from '../src/npc-annex-service-routes-v163.js';
import { withHubNpcAnnexLeasesV163 } from '../src/npc-annex-leases-v163.js';
import { withHubNpcAnnexWorkpostRoutesV165 } from '../src/npc-annex-workpost-routes-v165.js';
import { HUB_NPC_ANNEX_WORKPOST_ROUTES_V165 } from '../src/npc-annex-workpost-routes-v165.js';
import { withHubNpcCalLogisticsRouteV165 } from '../src/npc-cal-logistics-route-v165.js';
import { withHubNpcInterdeckRoutesV165 } from '../src/npc-interdeck-routes-v165.js';
import { withHubNpcInterdeckPassageV165 } from '../src/npc-interdeck-passage-v165.js';
import { HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { createDefaultSave,migrateSave } from '../src/save.js';
import { npcLiftSocketV165,createNpcLiftTransitV165,advanceNpcLiftTransitV165,
  npcLiftPoseV165,normalizeNpcLiftTransitV165 } from '../src/npc-lift-transit-v165.js';
import { withHubNpcStationRelaysV166,normalizeNpcStationRelaysV166,
  NPC_STATION_RELAY_DEFINITIONS_V166 as relayDefinitions } from '../src/npc-station-relays-v166.js';

// This separate regression fixture copies the admitted native-owner chain.
// Observer/player poses are declared initial Save conditions; NPC poses are
// always produced by the real roster, carriage and physical controllers.
const LifeHub=withHubNpcLifeV136(RoutineHub);
class FixtureBase {
  initializeNpcRoutinesV62(...a){return RoutineHub.prototype.initializeNpcRoutinesV62.apply(this,a);}
  getNpcRoutineResolutionsV62(...a){return RoutineHub.prototype.getNpcRoutineResolutionsV62.apply(this,a);}
  setNpcRoutineContextV62(...a){return RoutineHub.prototype.setNpcRoutineContextV62.apply(this,a);}
  createNpcs(...a){return LifeHub.prototype.createNpcs.apply(this,a);}
  ensureAnnexNpcCohortV141(...a){return LifeHub.prototype.ensureAnnexNpcCohortV141.apply(this,a);}
  activeAnnexNpcsV141(...a){return LifeHub.prototype.activeAnnexNpcsV141.apply(this,a);}
  tickAnnexNpcLifeV141(...a){return LifeHub.prototype.tickAnnexNpcLifeV141.apply(this,a);}
  tickParentNpcLifeV136(...a){return LifeHub.prototype.tickParentNpcLifeV136.apply(this,a);}
  stepHubNpcLifeV136(...a){return LifeHub.prototype.stepHubNpcLifeV136.apply(this,a);}
  interactWithAnnexNpcV141(...a){return LifeHub.prototype.interactWithAnnexNpcV141.apply(this,a);}
  npcAnimationRequest(...a){return LifeHub.prototype.npcAnimationRequest.apply(this,a);}
  hubDoorPairV142(...a){return AnnexHub.prototype.hubDoorPairV142.apply(this,a);}
  getParentAnnexDoorV71(...a){return AnnexHub.prototype.getParentAnnexDoorV71.apply(this,a);}
  currentRoom(){return HUB_DECKS[this.state.deck].rooms.find(r=>r.id===this.state.roomId);}
  currentAnnexV71(){return this.local?getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[this.local]):null;}
  isAnnexActiveV71(){return Boolean(this.local);}
  sampleNpcAnimation(){}
  drawNpcLifeV136(){return false;}
  drawDepthContactShadowV116(){return true;}
  setNpcCrisisAlert(){}
  emitStatus(){}
  start(save={}, {routineContextV62={clock:{day:1,hour:5}}}={}) {
    this.calClimbImageV165={complete:true,naturalWidth:1254,naturalHeight:1254};
    this.state={deck:save.deck??0,roomId:save.roomId||'briefing'};
    this.local=save.activeAnnexId||null;
    this.player={x:save.positionX??5000,y:save.positionY??532,w:44,h:92,alive:true};
    const vent=normalizeHubVentStateV62(save.ventTransitV62);
    this.ventActorV62=vent?.actor||null;this.ventEntryContextV62=vent?.entryContext||null;
    this.hubCommercialStateV71={returnContext:null};this.hubNpcInteractions={};this.hubNpcSequence=0;
    this.hubNpcAnimation={reset(){}};this.events=[];this.onAction=e=>this.events.push(e);this.audio={ui(){}};
    this.initializeNpcRoutinesV62(save,routineContextV62);
    this.doorStates=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,this.state.deck).map(d=>({...d}));
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
const ExistingHub=withHubNpcInterdeckPassageV165(withHubNpcInterdeckRoutesV165(withHubNpcCalLogisticsRouteV165(
  withHubNpcAnnexWorkpostRoutesV165(withHubNpcAnnexLeasesV163(withHubNpcAnnexServiceRoutesV163(
    withHubNpcMedicalRouteV162(withHubNpcServiceRoutesV161(withHubNpcAnnexCirculationV159(withHubNpcCirculationV158(FixtureBase))))))))));
const TestHub=withHubNpcStationRelaysV166(ExistingHub);
const SecurityCommandsV166=withHubTrainingV132(FixtureBase).prototype;
class LockedRelayFixtureV166 extends TestHub {
  start(save={},options={}) {
    this.hubTrainingV132=normalizeHubTrainingV132(save.hubTrainingV132);
    return super.start(save,options);
  }
  nearestAnnexStationV71(...a){return AnnexHub.prototype.nearestAnnexStationV71.apply(this,a);}
  hubTrainingContactV132(...a){return SecurityCommandsV166.hubTrainingContactV132.apply(this,a);}
  getHubTrainingCommandsV132(...a){return SecurityCommandsV166.getHubTrainingCommandsV132.apply(this,a);}
  executeHubTrainingCommandV132(...a){return SecurityCommandsV166.executeHubTrainingCommandV132.apply(this,a);}
  enforceSecurityLocksV132(...a){return SecurityCommandsV166.enforceSecurityLocksV132.apply(this,a);}
  getNpcServiceOwnerYieldGoalV165(id,actor) {
    if(id===this.withdrawOwnerId&&Number.isFinite(this.withdrawToObservedFloorX))return this.withdrawToObservedFloorX;
    return super.getNpcServiceOwnerYieldGoalV165(id,actor);
  }
  persist() {
    const sink=this.onPersist;this.onPersist=patch=>sink({...patch,deck:this.state.deck,roomId:this.state.roomId,
      activeAnnexId:this.local||null,positionX:this.player.x,positionY:this.player.y,
      ventTransitV62:this.ventActorV62?normalizeHubVentStateV62({actor:this.ventActorV62,entryContext:this.ventEntryContextV62}):null,
      hubTrainingV132:normalizeHubTrainingV132(this.hubTrainingV132)});
    try{return super.persist();}finally{this.onPersist=sink;}
  }
}
const context=(h,hour)=>h.setNpcRoutineContextV62({clock:{day:1,hour}},{persist:false,rebuild:true});
function runtime(hour=5,save={}) {
  const h=new LockedRelayFixtureV166();h.start(save,{routineContextV62:{clock:{day:1,hour}}});
  h.npcJunClimbArtReadyV165=()=>true;return h;
}
const consoleRoom=getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137.cctv);
const consoleSave=()=>({deck:0,roomId:'combat-information',activeAnnexId:'cctv',
  positionX:consoleRoom.station.bounds.x+consoleRoom.station.bounds.w/2-22,positionY:532});
const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const roomDeck=id=>HUB_DECKS.findIndex(d=>d.rooms.some(r=>r.id===id));
const door=(h,deck,id)=>h.npcStationRelayDoorsV166[deck].find(d=>d.id===id);
const actualDoor=(h,id)=>h.doorStates.find(d=>d.id===id);
const relay=(h,id)=>h.getSnapshot().npcStationRelaysV166.routes[id];
const physicalNpcBodies=h=>[...new Set([...(h.getNpcServiceOwnedActorsV163?.()||[]),
  ...(h.getNpcServiceTrafficActorsV163?.()||[]),...(h.npcs||[])])];
const occupyingNpcs=(h,deck,box)=>physicalNpcBodies(h).filter(a=>roomDeck(a.roomId)===deck&&overlaps(a,box));
function assertLeaf(h,deck,id,expected) {
  const owned=door(h,deck,id),visible=actualDoor(h,id);
  assert.ok(owned);
  assert.ok(h.hubTrainingV132.lockedDoorIds.includes(id),'the asserted leaf must be genuinely retained in the native security lock ledger');
  if(expected==='occupied')assert.ok(owned.progress>=.82,JSON.stringify({id,progress:owned.progress,
    occupants:occupyingNpcs(h,deck,getHubBulkheadColliderV134(owned)).map(a=>({crewId:a.crewId,x:a.x,roomId:a.roomId}))}));
  else assert.equal(owned.progress,0,id+' closes once its actual chart is clear');
  if(visible)assert.equal(visible.progress,owned.progress,'visible native leaf matches the same authoritative aperture');
}

test('a genuine remote CCTV lock preserves Rook on a declared station-floor courtesy detour, restores it and closes after real withdrawal',()=>{
  const id='rook-station-relay',h=runtime(5,consoleSave()),body=h.getNpcStationRelayActorV166(id);
  assert.ok(body);assert.equal(body.roomId,'sensor-array');assert.equal(body.y,532);
  const stationOrigin=structuredClone(relay(h,id).stationOrigin);
  const station=HUB_DECKS[3].rooms.find(r=>r.id==='sensor-array');
  // This is explicitly a temporary floor courtesy, not the admitted full
  // station→carriage→work journey tested in the untouched20-test contract.
  // Both targets are real authored floor points; no actor pose is assigned.
  h.withdrawOwnerId=id;h.withdrawToObservedFloorX=station.xStart-96;context(h,9);
  const owned=door(h,3,'engineering:hub-east-bulkhead'),box=getHubBulkheadColliderV134(owned);
  const foreign=door(h,0,'command:hub-east-bulkhead');let reached=false;
  for(let i=0;i<80*60;i++) {
    h.update(1/60);const e=relay(h,id);
    assert.ok(e.actor);assert.equal(h.getNpcStationRelayActorV166(id),body);
    assert.equal(e.actor.stage,'walking-lift');assert.equal(e.actor.deck,3);assert.equal(e.actor.liftJourneys,0);
    if(body.x<box.x+box.w-1&&body.x>box.x+box.w-6&&overlaps(body,box)){reached=true;break;}
  }
  assert.ok(reached,'the retained native Rook must walk into the real source-deck bulkhead');
  assert.ok(h.hubTrainingContactV132('cctv'));assert.equal(h.currentAnnexV71().id,'cctv');assert.notEqual(h.state.deck,3);
  assert.equal(occupyingNpcs(h,0,getHubBulkheadColliderV134(foreign)).length,0);
  assert.ok(h.executeHubTrainingCommandV132('door-toggle',owned.id),'use the real security console command, without bypassing its same-chart safety guard');
  assert.ok(h.executeHubTrainingCommandV132('door-toggle',foreign.id));h.update(1/60);
  assert.ok(overlaps(body,box));assertLeaf(h,3,owned.id,'occupied');assertLeaf(h,0,foreign.id,'clear');
  h.persist();const saved=h.persisted.at(-1),pose=saved.npcStationRelaysV166.routes[id].actor;
  assert.ok(pose);assert.ok(pose.bulkheadProgress[owned.id]>=.82);assert.equal(pose.liftJourneys,0);
  for(const observerDeck of[0,3]) {
    // A changed observer is a disclosed initial condition for the SAME saved
    // NPC pose. It is never counted as a player interdeck journey.
    const fixture=observerDeck===0?saved:{...saved,deck:3,roomId:'sensor-array',activeAnnexId:null,positionX:5000,positionY:532};
    const resumed=runtime(9,fixture),restored=resumed.getNpcStationRelayActorV166(id);
    assert.ok(restored);assert.equal(restored.x,pose.x);assert.equal(restored.y,pose.y);
    assert.deepEqual(relay(resumed,id).actor,pose);resumed.update(1/60);
    assert.ok(overlaps(restored,box));assertLeaf(resumed,3,owned.id,'occupied');
    resumed.withdrawOwnerId=id;resumed.withdrawToObservedFloorX=stationOrigin.x;let cleared=false;
    for(let i=0;i<10*60;i++) {
      const before={x:restored.x,y:restored.y};resumed.update(1/60);
      assert.equal(restored.y,before.y);assert.equal(restored.y+restored.h,624);assert.equal(restored.grounded,true);
      assert.ok(Math.abs(restored.x-before.x)<=27/60+1e-6,'withdrawal spends bounded motion on the original real floor');
      assert.equal(relay(resumed,id).actor.liftJourneys,0);
      assert.ok(normalizeNpcStationRelaysV166(resumed.npcStationRelaysStateV166).routes[id].actor);
      if(!overlaps(restored,box)){cleared=true;break;}
      assertLeaf(resumed,3,owned.id,'occupied');
    }
    assert.ok(cleared);resumed.update(1/60);assertLeaf(resumed,3,owned.id,'clear');assertLeaf(resumed,0,foreign.id,'clear');
    assert.equal(resumed.getNpcStationRelayActorV166(id),restored);
    assert.deepEqual(relay(resumed,id).stationOrigin,stationOrigin);
    const e=relay(resumed,id);assert.equal(e.actor.liftJourneys,0);assert.equal(e.actor.localCrossings,0);
    assert.equal(e.actor.localArrivals,0);assert.equal(e.actor.stage,'walking-lift');
    assert.equal(e.localOwner,false);assert.equal(e.workBookmark,null);assert.equal(e.returned,null);
  }
});

test('a locked leaf also preserves the actual inherited Jun-maintenance owner and its supported withdrawal',()=>{
  const h=runtime(5,consoleSave());context(h,8);
  const owned=door(h,3,'engineering:hub-east-bulkhead'),box=getHubBulkheadColliderV134(owned);let body=null;
  for(let i=0;i<80*60;i++) {
    h.update(1/60);const candidate=h.getNpcAnnexLeaseActorV163('jun-maintenance');
    if(candidate&&candidate.x>=box.x-22&&candidate.x<box.x-18&&overlaps(candidate,box)){body=candidate;break;}
  }
  assert.ok(body);assert.ok(h.getNpcServiceOwnedActorsV163().includes(body));
  assert.ok(!h.getNpcStationRelayActorsV166().includes(body));assert.equal(h.npcInterdeckStateV165.routes['jun-sanitary'].actor,null);
  assert.ok(h.executeHubTrainingCommandV132('door-toggle',owned.id));h.update(1/60);assertLeaf(h,3,owned.id,'occupied');
  h.persist();const saved=h.persisted.at(-1),jun=saved.npcAnnexLeasesV163.routes['jun-maintenance'];assert.ok(jun.actor);
  for(const observerDeck of[0,3]) {
    const fixture=observerDeck===0?saved:{...saved,deck:3,roomId:'sensor-array',activeAnnexId:null,positionX:5000,positionY:532};
    const resumed=runtime(8,fixture),restored=resumed.getNpcAnnexLeaseActorV163('jun-maintenance');
    assert.ok(restored);assert.equal(restored.x,jun.actor.x);assert.equal(restored.y,jun.actor.y);
    resumed.update(1/60);assertLeaf(resumed,3,owned.id,'occupied');
    resumed.withdrawOwnerId='jun-maintenance';resumed.withdrawToObservedFloorX=jun.actor.homeX;let cleared=false;
    for(let i=0;i<10*60;i++) {
      const x=restored.x;resumed.update(1/60);assert.equal(restored.y+restored.h,624);
      assert.ok(Math.abs(restored.x-x)<=27/60+1e-6);
      if(!overlaps(restored,box)){cleared=true;break;}assertLeaf(resumed,3,owned.id,'occupied');
    }
    assert.ok(cleared);resumed.update(1/60);assertLeaf(resumed,3,owned.id,'clear');
    assert.equal(resumed.getNpcAnnexLeaseActorV163('jun-maintenance'),restored);
  }
});

test('the real off-screen Cal courtesy retains its locked bulkhead until every actual floor body has cleared',()=>{
  const h=runtime(5,consoleSave()),observedFloor=h.getNpcAnnexLeaseActorV163('jun-maintenance');
  assert.ok(observedFloor);assert.equal(observedFloor.roomId,'life-support');assert.equal(observedFloor.y,532);
  // WEST is intentionally not lockable: it would isolate the hangar. A
  // declared owner courtesy toward this actual05h floor bookmark makes the
  // same native Cal pass the CENTRAL leaf, which the console may lock.
  h.withdrawOwnerId='maksim-cockpit';h.withdrawToObservedFloorX=observedFloor.x;context(h,8);
  const owned=door(h,3,'engineering:hub-central-bulkhead'),box=getHubBulkheadColliderV134(owned);let body=null;
  for(let i=0;i<100*60;i++) {
    h.update(1/60);const candidate=h.getNpcServiceTrafficActorsV163(3).find(a=>a.crewId==='crew-16-cal-mercer');
    if(candidate&&candidate.x>=box.x-22&&candidate.x<box.x-18&&overlaps(candidate,box)){body=candidate;break;}
  }
  assert.ok(body,'Cal must physically yield from his native hangar post under the existing Maksim owner');
  assert.ok(!h.getNpcServiceOwnedActorsV163().includes(body));
  const record=h.getSnapshot().npcServiceTrafficV163.actors.find(a=>a.crewId===body.crewId);
  assert.ok(record);assert.equal(record.deck,3);assert.ok(record.distance>0);assert.equal(record.ownerCrewId,'crew-08-maksim-orlov');
  assert.equal(h.npcInterdeckStateV165.routes['maksim-cockpit'].actor.liftJourneys,0,
    'the declared floor courtesy is never counted as a completed carriage');
  assert.ok(h.executeHubTrainingCommandV132('door-toggle',owned.id));h.update(1/60);
  assert.ok(overlaps(body,box));assertLeaf(h,3,owned.id,'occupied');h.persist();const saved=h.persisted.at(-1);
  const pose=saved.npcServiceTrafficV163.actors.find(a=>a.crewId===body.crewId);assert.ok(pose);
  for(const observerDeck of[0,3]) {
    const fixture=observerDeck===0?saved:{...saved,deck:3,roomId:'reactor',activeAnnexId:null,positionX:5000,positionY:532};
    const resumed=runtime(8,fixture),restored=resumed.getNpcServiceTrafficActorsV163(3).find(a=>a.crewId===body.crewId);
    resumed.withdrawOwnerId='maksim-cockpit';resumed.withdrawToObservedFloorX=observedFloor.x;
    assert.ok(restored);assert.equal(restored.x,pose.x);assert.equal(restored.y,532);
    assert.deepEqual(resumed.getSnapshot().npcServiceTrafficV163.actors.find(a=>a.crewId===body.crewId),pose);
    let cleared=false,closed=false;
    for(let i=0;i<12*60;i++) {
      const before=restored.x;resumed.update(1/60);assert.equal(restored.y+restored.h,624);
      assert.ok(Math.abs(restored.x-before)<=27/60+1e-6);
      if(!overlaps(restored,box))cleared=true;
      if(occupyingNpcs(resumed,3,box).length)assertLeaf(resumed,3,owned.id,'occupied');
      else {assertLeaf(resumed,3,owned.id,'clear');closed=true;break;}
    }
    assert.ok(cleared);assert.ok(closed,'the locked leaf closes after all bodies actually intersecting its chart have cleared');
    assert.equal(resumed.getNpcServiceTrafficActorsV163(3).find(a=>a.crewId===body.crewId),restored);
  }
});

test('the actual main-chart player holds the same visible locked industrial aperture',()=>{
  const source=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,2).find(d=>d.id==='industrial:hub-east-bulkhead');
  const box=getHubBulkheadColliderV134(source),room=HUB_DECKS[2].rooms.find(r=>box.x+22>=r.xStart&&box.x+22<r.xEnd);
  const h=runtime(6,{deck:2,roomId:room.id,positionX:box.x,positionY:532,
    hubTrainingV132:normalizeHubTrainingV132({schema:132,lockedDoorIds:[source.id]})});
  assert.equal(h.isAnnexActiveV71(),false);assert.ok(!h.ventActorV62);assert.ok(overlaps(h.player,box));
  assert.equal(occupyingNpcs(h,2,box).length,0);h.update(1/60);assertLeaf(h,2,source.id,'occupied');
  assert.equal(h.player.y+h.player.h,624);
});

test('foreign-deck and duct projections cannot open real locks, and a valid CCTV annex keeps its native WEST route-safety refusal',()=>{
  const industrial=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,2).find(d=>d.id==='industrial:hub-east-bulkhead');
  const command=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,0).find(d=>d.id==='command:hub-central-bulkhead');
  const mainBox=getHubBulkheadColliderV134(command),entry=HUB_VENT_NETWORK_V62.entrances.find(p=>p.nodeId==='hub-briefing');
  const ductActor=advanceVentTransitionV62(HUB_VENT_NETWORK_V62,enterVentNetworkV62(HUB_VENT_NETWORK_V62,
    {id:'fixture-player',ventActorKind:'player',position:structuredClone(entry.worldPosition)},entry.id),500);
  const vent=normalizeHubVentStateV62({actor:ductActor,entryContext:{deck:0,roomId:'briefing',positionX:mainBox.x}});
  assert.ok(vent);assert.equal(vent.actor.ventTransit.phase,'at-node');
  const cases=[
    {name:'other real deck',targetDeck:2,target:industrial,save:{deck:1,roomId:'science-lab',positionX:getHubBulkheadColliderV134(industrial).x,positionY:532}},
    // The main renderer's retained projection is declared explicitly; the
    // real player is inside a validated native duct chart, not on that leaf.
    {name:'validated duct chart',targetDeck:0,target:command,save:{deck:0,roomId:'briefing',positionX:mainBox.x,positionY:532,ventTransitV62:vent}}
  ];
  for(const c of cases) {
    const h=runtime(6,{...c.save,hubTrainingV132:normalizeHubTrainingV132({schema:132,lockedDoorIds:[c.target.id]})});
    const box=getHubBulkheadColliderV134(c.target);assert.ok(overlaps(h.player,box),c.name);
    assert.equal(occupyingNpcs(h,c.targetDeck,box).length,0,c.name+' must isolate the player chart guard');
    h.update(1/60);assertLeaf(h,c.targetDeck,c.target.id,'clear');
    if(c.name==='validated duct chart')assert.equal(h.ventActorV62.ventTransit.phase,'at-node');
  }
  // A valid ordinary CCTV coordinate can coincide only with WEST; CENTRAL
  // lies outside this1920px annex. WEST is deliberately forbidden by the
  // real route-safety policy, so do not invent a normalized lock for it.
  const h=runtime(6,consoleSave()),west=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,0)
    .find(d=>d.id==='command:hub-west-bulkhead');
  assert.ok(h.hubTrainingContactV132('cctv'));
  assert.ok(h.player.x>=24&&h.player.x+h.player.w<=consoleRoom.world.width-24);
  assert.equal(h.getHubTrainingCommandsV132().doors.find(d=>d.id===west.id).canLock,false);
  assert.equal(h.executeHubTrainingCommandV132('door-toggle',west.id),false);
  assert.equal(h.hubTrainingV132.lockedDoorIds.includes(west.id),false);
  assert.deepEqual(normalizeHubTrainingV132({schema:132,lockedDoorIds:[west.id]}).lockedDoorIds,[]);
});
