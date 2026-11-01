import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS,HUB_WORLD,buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { HubGame as RoutineHub } from '../src/hub-v62-runtime.js';
import { HubGame as AnnexHub } from '../src/hub-v71-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { getHubBulkheadColliderV134 } from '../src/hub-bulkhead-depth-v134.js';
import { annexNpcDutiesV141 } from '../src/hub-annex-npc-life-v141.js';
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

// Exactly the same native population, geometry and physical-owner sequence
// as app.js. This fixture supplies neither actor positions nor route poses;
// only image readiness is represented without a browser's image decoder.
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
    this.player={x:5000,y:532,w:44,h:92,alive:true};
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
const runtime=(hour=5,save={})=>{
  const h=new TestHub();h.start(save,{routineContextV62:{clock:{day:1,hour}}});
  h.npcJunClimbArtReadyV165=()=>true;return h;
};
const context=(h,hour,extra={})=>h.setNpcRoutineContextV62({clock:{day:1,hour},...extra},{persist:false,rebuild:true});
const tick=(h,seconds,rate=12)=>{for(let i=0;i<seconds*rate;i++)h.update(1/rate);};
const entry=(h,id)=>h.getSnapshot().npcStationRelaysV166.routes[id];
const nativeBookmark=actor=>({crewId:actor.crewId,roomId:actor.roomId,x:actor.x,y:actor.y,facing:actor.facing});
const stationDefinitions=[
  {crewId:'crew-06-rook',stationRoomId:'sensor-array',stationDeck:3,localRouteId:'rook-cctv',workRoomId:'combat-information',workDeck:0,annexRoomId:'cctv'},
  {crewId:'crew-02-tamsin-velez',stationRoomId:'briefing',stationDeck:0,localRouteId:'tamsin-proving',workRoomId:'armory',workDeck:2,annexRoomId:'proving-ground'}
];
const definition=c=>relayDefinitions.find(d=>d.crewId===c.crewId);
const body=(h,d)=>h.getNpcStationRelayActorV166(d.id);
const localState=(h,c)=>h.getNpcServicePhysicalStateV165(c.localRouteId);
function allBodies(h,c) {
  return new Set([...(h.getNpcServiceOwnedActorsV163?.()||[]),...(h.getNpcStationRelayActorsV166?.()||[]),
    ...(h.getNpcInterdeckActorsV165?.()||[]),...(h.getNpcAnnexWorkpostActorsV165?.()||[]),
    ...(h.getNpcServiceTrafficActorsV163?.()||[]),...(h.npcs||[]),...h.ensureAnnexNpcCohortV141()]
    .filter(a=>a?.crewId===c.crewId));
}



import { npcLiftQueueCourtesyPlanV177, npcLiftQueueCourtesyClearedV177 } from '../src/npc-lift-transit-v165.js';
import { requestShipPortDockV87, stepShipPortV87, canAccessPortCounterV87 } from '../src/ship-port-state-v87.js';

const shaftId='hub-midship-lift';
const tracked=[
  {id:'inez-civil',crewId:'crew-09-inez-harlow',kind:'inter'},
  {id:'maksim-cockpit',crewId:'crew-08-maksim-orlov',kind:'inter'},
  {id:'tamsin-station-relay',crewId:'crew-02-tamsin-velez',kind:'relay'}
];
function queueFixtureEntries(){
  return tracked.map((d,index)=>{
    const fromDeck=[2,3,0][index],toDeck=[3,0,2][index],roomId=npcLiftSocketV165(fromDeck,shaftId).roomId;
    const actor={crewId:d.crewId,deck:fromDeck,roomId,x:2254,y:532,velocity:0,
      stage:'waiting-lift',direction:'outbound',lift:null};
    return{definition:{id:d.id,crewId:d.crewId,deck:toDeck,shaftId},state:{actor,origin:{deck:fromDeck,x:500}},
      body:{crewId:d.crewId,roomId,x:2254,y:532,w:44,h:92,vx:0,alive:true},destinationX:500,canYield:true};
  });
}
function declaredPortFixture(){
  let save=createDefaultSave();save.clock={day:1,hour:5};save.scene='hub';save.needsPlayerCreationV84=false;
  if(save.onboardingV84)save.onboardingV84.phase='complete';save.strategy.currentOperation=null;
  Object.assign(save.hub.systems,{hull:100,power:100,oxygen:100,quarantine:100});
  const pc={careReady:true,manifestReady:true,physical:{roomId:'dropship-hangar'},authorization:{granted:true,
    portId:'frontier-civil-relay',sectorId:'current-service-sector',campaignHours:5}};
  save=requestShipPortDockV87(save,{transactionId:'queue-v177-declared-fixture'},pc).save;
  for(let i=1;i<=14;i++)save=stepShipPortV87(save,{simulationTime:i,dtSeconds:1},pc).save;
  assert.ok(canAccessPortCounterV87(save));return save;
}
const route=(h,d)=>d.kind==='inter'?h.npcInterdeckStateV165.routes[d.id]:h.npcStationRelaysStateV166.routes[d.id];
const actual=(h,d)=>d.kind==='inter'?h.npcInterdeckBodiesV165.get(d.id):h.getNpcStationRelayActorV166(d.id);
// actualVelocity is an unsaved render sample; velocity is the persisted controller state.
const persistentActor=a=>{if(!a)return a;const{actualVelocity,...saved}=a;return structuredClone(saved);};
function assertSoleBodies(h){
  for(const d of tracked)assert.equal(allBodies(h,d).size,1,`${d.id} must have exactly one actual physical body`);
  const carriages=h.getNpcLiftQueueEntriesV177().filter(e=>e.state?.actor?.lift);
  assert.ok(carriages.length<=1,'The cabin must never have two NPC owners');
  for(const d of tracked){const e=route(h,d),a=e.actor,b=actual(h,d);
    if(a){assert.ok(b,`${d.id} active owner must retain its actual body`);assert.ok(allBodies(h,d).has(b));
      assert.equal(b.x,a.x);assert.equal(b.y,a.y);assert.equal(b.roomId,a.roomId);}}
}
function occupiedQueue(){
  const port=declaredPortFixture(),h=runtime(5,{deck:3,roomId:'dropship-hangar'});
  // Declared fixture: the player's cabin reservation blocks all three real
  // owner controllers, rather than placing or moving their bodies by test code.
  h.hubLiftTransitV163={trip:{shaftId}};
  for(const hour of[8,9,20]){context(h,hour,{save:port});tick(h,300);}
  for(const d of tracked){const a=route(h,d).actor;assert.equal(a.stage,'waiting-lift');assert.equal(a.x,2254);assert.equal(a.liftJourneys,0);}
  assertSoleBodies(h);return{h,port};
}

test('V177 courtesy elects a stable real departure cycle and rejects unsafe candidates',()=>{
  const entries=queueFixtureEntries(),before=structuredClone(entries);
  const plan=npcLiftQueueCourtesyPlanV177(entries,{shaftId});
  assert.equal(plan.winnerRouteId,'inez-civil');assert.equal(plan.yieldRouteId,'maksim-cockpit');
  assert.equal(plan.arrivalX,2254);assert.equal(plan.holdingX,2446);
  assert.deepEqual(npcLiftQueueCourtesyPlanV177([...entries].reverse(),{shaftId}),plan);
  assert.deepEqual(entries,before,'Planning cannot move or relabel a body');
  assert.equal(npcLiftQueueCourtesyPlanV177(entries,{shaftId,occupied:true}),null);
  for(const mutate of[
    a=>a.splice(2,1),
    a=>a[1].canYield=false,
    a=>a.push(structuredClone(a[1])),
    a=>a[1].body.x++,
    a=>a[1].body.downed=true,
    a=>a[1].body.alive=false,
    a=>a[1].body.w=40,
    a=>a[1].state.localOwner=true,
    a=>a[1].state.actor.stage='service',
    a=>a[1].state.actor.lift={phase:'boarding'},
    a=>a[1].state.actor.direction='unknown',
    a=>a[1].state.actor.x=a[1].body.x=2447
  ]){const invalid=structuredClone(entries);mutate(invalid);assert.equal(npcLiftQueueCourtesyPlanV177(invalid,{shaftId}),null);}
});

test('V177 departure remains blocked until the actual stopped body clears the entire arriving sweep',()=>{
  const entries=queueFixtureEntries(),plan=npcLiftQueueCourtesyPlanV177(entries,{shaftId}),e=entries[1];
  assert.equal(npcLiftQueueCourtesyClearedV177(plan,e),false);
  for(const x of[2254,2300,2350,2400,2445]){
    e.state.actor.x=e.body.x=x;assert.equal(npcLiftQueueCourtesyClearedV177(plan,e),false);
  }
  e.state.actor.x=e.body.x=2446;assert.equal(npcLiftQueueCourtesyClearedV177(plan,e),true);
  for(const mutate of[
    a=>a.body.vx=1,
    a=>a.state.actor.velocity=1,
    a=>a.state.actor.deck=2,
    a=>a.body.x=2445,
    a=>a.canYield=false
  ]){const invalid=structuredClone(e);mutate(invalid);assert.equal(npcLiftQueueCourtesyClearedV177(plan,invalid),false);}
  assert.equal(npcLiftQueueCourtesyClearedV177({...plan,holdingX:2254},e),false);
});

test('V177 native owners physically clear 192px, survive pause/reload and return without duplicate bodies',t=>{
  let{h,port}=occupiedQueue();const dt=1/12;
  h.hubLiftTransitV163={trip:null};
  const originalOrigins=tracked.map(d=>structuredClone(route(h,d).origin||route(h,d).stationOrigin));
  const rearDoor=h.doorStates.find(d=>d.shaftId===shaftId);
  assert.equal(rearDoor.blocking,false,'This path is the floor in front of the rear-wall lift door');
  assert.equal(rearDoor.progress,0);
  const elected=npcLiftQueueCourtesyPlanV177(h.getNpcLiftQueueEntriesV177(),{shaftId});
  assert.equal(elected?.yieldRouteId,'maksim-cockpit');
  const winner=tracked[0],yielding=tracked[1];let parked=false,reloaded=false,walked=0,samples=0,maxStep=0,reloadX=null;
  let courtesyBody=actual(h,yielding);
  for(let i=0;i<300*12;i++){
    const prior=route(h,yielding).actor,previous=prior&&{x:prior.x,deck:prior.deck,roomId:prior.roomId,lift:prior.lift};
    if(!parked){
      const views=h.getNpcLiftQueueEntriesV177(),e=views.find(v=>v.definition.id===yielding.id);
      const clear=npcLiftQueueCourtesyClearedV177(elected,e);
      if(clear){parked=true;assert.equal(walked,192);assert.equal(route(h,winner).actor.liftJourneys,0);}
      else{
        const w=route(h,winner).actor,d=views.find(v=>v.definition.id===winner.id).definition;
        assert.equal(w.lift,null,'No boarding permission while the peer is physically crossing');
        assert.ok(h.npcLiftQueueBlockersV165(d,w).some(b=>b.routeId===yielding.id));
      }
    }
    if(!reloaded&&previous?.x>2290&&previous.x<2350){
      reloadX=previous.x;h.persist();const saved=structuredClone(h.persisted.at(-1)),before=structuredClone(h.getNpcLiftQueueEntriesV177()
        .filter(v=>tracked.some(d=>d.id===v.definition.id)).map(v=>({id:v.definition.id,actor:persistentActor(v.state.actor)})));
      const pose=JSON.stringify(before);h.running=false;tick(h,5);assert.equal(JSON.stringify(h.getNpcLiftQueueEntriesV177()
        .filter(v=>tracked.some(d=>d.id===v.definition.id)).map(v=>({id:v.definition.id,actor:persistentActor(v.state.actor)}))),pose);
      const resumed=runtime(20,{...saved,deck:3,roomId:'dropship-hangar'});context(resumed,20,{save:port});
      assert.deepEqual(resumed.getNpcLiftQueueEntriesV177().filter(v=>tracked.some(d=>d.id===v.definition.id))
        .map(v=>({id:v.definition.id,actor:persistentActor(v.state.actor)})),before,'Reload preserves live coordinates and counters');
      assert.deepEqual(npcLiftQueueCourtesyPlanV177(resumed.getNpcLiftQueueEntriesV177(),{shaftId}),elected,
        'Re-election uses the same route/deck/direction after reload');
      h=resumed;reloaded=true;courtesyBody=actual(h,yielding);assertSoleBodies(h);
    }
    h.update(dt);assertSoleBodies(h);
    if(!parked){
      const a=route(h,yielding).actor;
      assert.equal(actual(h,yielding),courtesyBody,'The walking owner must retain its real body between reloads');
      assert.equal(h.doorStates.find(d=>d.shaftId===shaftId).progress,0,'Courtesy must not open closed rear leaves');
      assert.equal(a.deck,previous.deck);assert.equal(a.roomId,previous.roomId);assert.equal(a.lift,null);
      const step=a.x-previous.x;assert.ok(step>=-1e-8&&step<=27*dt+.1,`Actual courtesy step ${step} must respect normal walking speed`);
      walked+=step;samples++;maxStep=Math.max(maxStep,step);
      const left={x:a.x,y:a.y,w:44,h:92};
      assert.ok(!buildHubObstacleGeometryV87(a.deck).some(box=>box.collisionMode!=='one-way-top'
        &&left.x<box.x+box.w&&left.x+left.w>box.x&&left.y<box.y+box.h&&left.y+left.h>box.y));
      const peers=h.getNpcServiceOwnedActorsV163().filter(b=>b!==actual(h,yielding)&&b.roomId===a.roomId);
      assert.ok(!peers.some(b=>left.x<b.x+b.w&&left.x+left.w>b.x&&left.y<b.y+b.h&&left.y+left.h>b.y),
        'The courtesy body must never pass through another owner');
    }
  }
  assert.ok(parked&&reloaded&&samples>80,'The complete 192px walk and a real mid-walk reload must have occurred');
  for(const d of tracked)assert.ok(route(h,d).actor?.liftJourneys>=1||route(h,d).returned?.liftJourneys>=1);
  context(h,22,{save:port});
  for(let i=0;i<600*12;i++){h.update(dt);assertSoleBodies(h);}
  for(let i=0;i<tracked.length;i++){
    const d=tracked[i],e=route(h,d),origin=originalOrigins[i];
    assert.equal(e.returned?.observedTravel,true,`${d.id} must return through its physical owner`);
    assert.equal(e.returned.liftJourneys,2);assert.equal(e.returned.x,origin.x);
    assert.equal(e.returned.y,origin.y);assert.equal(e.returned.roomId,origin.roomId);assert.equal(e.returned.deck,origin.deck);
    assert.ok(e.returned.distance>4000);assert.equal(allBodies(h,d).size,1);
  }
  t.diagnostic(JSON.stringify({declaredFixture:'native owner composition; port authorization and occupied player cabin',
    courtesy:{walked,samples,maxStep,dt,reloadX,closedRearLeaves:true},
    returns:tracked.map(d=>({routeId:d.id,...route(h,d).returned,actualBodies:allBodies(h,d).size}))}));
});
