import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { HubGame as NativeHub, HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { HubGame as RosterHub } from '../src/hub-v52-runtime.js';
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
import { HUB_NPC_SERVICE_TRAFFIC_CIRCUITS_V163 } from '../src/npc-service-traffic-v163.js';
import { createAnnexNpcsV141, getAnnexNpcPlacementV141 } from '../src/hub-annex-npc-life-v141.js';
import { HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { HUB_NPC_ANNEX_WORKPOST_ROUTE_DEFINITIONS_V165 as definitions,
  HUB_NPC_ANNEX_WORKPOST_ROUTES_V165 as routes, normalizeNpcAnnexWorkpostRoutesV165,
  withHubNpcAnnexWorkpostRoutesV165 } from '../src/npc-annex-workpost-routes-v165.js';

import { withHubTrainingV132, normalizeHubTrainingV132 } from '../src/hub-training-v132.js';
import { getHubBulkheadColliderV134 } from '../src/hub-bulkhead-depth-v134.js';
import { withHubSpatialDesignV136 } from '../src/hub-spatial-design-v136.js';
import { resolveHumanAtlasGeometryV133 } from '../src/human-visual-contract-v133.js';
import { resolveSpriteSheet } from '../src/sprite-animation-runtime.js';
import { withHubNpcCalLogisticsRouteV165 } from '../src/npc-cal-logistics-route-v165.js';
import { withHubNpcInterdeckPassageV165 } from '../src/npc-interdeck-passage-v165.js';
import { withHubNpcInterdeckRoutesV165, normalizeNpcInterdeckRoutesV165, NPC_INTERDECK_DEFINITIONS_V165 as interdeckDefinitions } from '../src/npc-interdeck-routes-v165.js';
import { npcLiftSocketV165, createNpcLiftTransitV165, advanceNpcLiftTransitV165, normalizeNpcLiftTransitV165, npcLiftPoseV165, npcLiftDoorProgressV165 } from '../src/npc-lift-transit-v165.js';
import { requestShipPortDockV87, stepShipPortV87, canAccessPortCounterV87 } from '../src/ship-port-state-v87.js';

const LifeHub = withHubNpcLifeV136(RoutineHub);
const DoorPaintHub = withHubSpatialDesignV136(NativeHub);
class FixtureBase {
  initializeNpcRoutinesV62(...args) { return RoutineHub.prototype.initializeNpcRoutinesV62.apply(this, args); }
  getNpcRoutineResolutionsV62(...args) { return RoutineHub.prototype.getNpcRoutineResolutionsV62.apply(this, args); }
  setNpcRoutineContextV62(...args) { return RoutineHub.prototype.setNpcRoutineContextV62.apply(this, args); }
  createNpcs(...args) { return LifeHub.prototype.createNpcs.apply(this, args); }
  ensureAnnexNpcCohortV141(...args) { return LifeHub.prototype.ensureAnnexNpcCohortV141.apply(this, args); }
  activeAnnexNpcsV141(...args) { return LifeHub.prototype.activeAnnexNpcsV141.apply(this, args); }
  tickAnnexNpcLifeV141(...args) { return LifeHub.prototype.tickAnnexNpcLifeV141.apply(this, args); }
  tickParentNpcLifeV136(...args) { return LifeHub.prototype.tickParentNpcLifeV136.apply(this, args); }
  stepHubNpcLifeV136(...args) { return LifeHub.prototype.stepHubNpcLifeV136.apply(this, args); }
  interactWithAnnexNpcV141(...args) { return LifeHub.prototype.interactWithAnnexNpcV141.apply(this, args); }
  npcAnimationRequest(...args) { return LifeHub.prototype.npcAnimationRequest.apply(this, args); }
  hubDoorPairV142(...args) { return AnnexHub.prototype.hubDoorPairV142.apply(this, args); }
  getParentAnnexDoorV71(...args) { return AnnexHub.prototype.getParentAnnexDoorV71.apply(this, args); }
  currentRoom() { return HUB_DECKS[this.state.deck].rooms.find(room => room.id === this.state.roomId); }
  currentAnnexV71() { return this.local ? getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[this.local]) : null; }
  isAnnexActiveV71() { return Boolean(this.local); }
  sampleNpcAnimation() {}
  drawNpcLifeV136() { return false; }
  drawDoor(...args) { return DoorPaintHub.prototype.drawDoor.apply(this, args); }
  drawDepthContactShadowV116() { return true; }
  setNpcCrisisAlert() {}
  emitStatus() {}
  start(save = {}, { routineContextV62 = { clock: { day: 1, hour: 7 } } } = {}) {
    this.calClimbImageV165 = { complete: true, naturalWidth: 1254, naturalHeight: 1254 };
    this.state = { deck: save.deck ?? 0, roomId: save.roomId || 'combat-information' };
    this.local = save.activeAnnexId || null;
    this.player = { x: save.positionX ?? 5000, y: save.positionY ?? 532, w: 44, h: 92, alive: true };
    this.hubCommercialStateV71 = { returnContext: null };
    this.hubNpcInteractions = {}; this.hubNpcSequence = 0; this.hubNpcAnimation = { reset() {} };
    this.events = []; this.onAction = event => this.events.push(event); this.audio = { ui() {} };
    this.initializeNpcRoutinesV62(save, routineContextV62);
    this.doorStates = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, this.state.deck).map(door => ({ ...door }));
    this.npcs = this.createNpcs(this.state.deck); this.obstacles = buildHubObstacleGeometryV87(this.state.deck); this.running = true;
    this.persisted = []; this.onPersist = value => this.persisted.push(value);
  }
  update(dt) {
    if (!this.running) return;
    if (this.local) { this.tickParentNpcLifeV136(dt); this.tickAnnexNpcLifeV141(dt); }
    else for (const actor of this.npcs) {
      actor.workClock = Math.max(0, actor.workClock - dt);
      actor.supportClock = Math.max(0, actor.supportClock - dt);
      this.stepHubNpcLifeV136(actor, dt);
    }
  }
  persist() { this.onPersist({ npcRoutineState: structuredClone(this.npcRoutineStateV62) }); }
  getSnapshot() { return {}; }
}
const TestHub = withHubNpcInterdeckPassageV165(withHubNpcInterdeckRoutesV165(withHubNpcCalLogisticsRouteV165(withHubNpcAnnexWorkpostRoutesV165(withHubNpcAnnexLeasesV163(withHubNpcAnnexServiceRoutesV163(
  withHubNpcMedicalRouteV162(withHubNpcServiceRoutesV161(withHubNpcAnnexCirculationV159(withHubNpcCirculationV158(FixtureBase))))))))));
function dockedCampaign() {
  let save=createDefaultSave();save.clock={day:1,hour:5};save.scene='hub';save.needsPlayerCreationV84=false;
  if(save.onboardingV84)save.onboardingV84.phase='complete';save.strategy.currentOperation=null;
  Object.assign(save.hub.systems,{hull:100,power:100,oxygen:100,quarantine:100});
  const context={careReady:true,manifestReady:true,physical:{roomId:'dropship-hangar'},
    authorization:{granted:true,portId:'frontier-civil-relay',sectorId:'current-service-sector',campaignHours:5}};
  const request=requestShipPortDockV87(save,{transactionId:'interdeck-v165-port-fixture'},context);assert.ok(request.ok,request.code);save=request.save;
  for(let i=1;i<=14;i++){const step=stepShipPortV87(save,{simulationTime:i,dtSeconds:1},context);assert.ok(step.ok,step.code);save=step.save;}
  assert.ok(canAccessPortCounterV87(save));return save;
}
const portCampaign=dockedCampaign();
const runtime = (hour=7,save={},options={}) => {const h=new TestHub();h.start(save,{routineContextV62:{clock:{day:1,hour},save:options.portUnavailable?createDefaultSave():portCampaign}});
  h.npcJunClimbArtReadyV165=()=>options.artUnavailable!==true;return h;};
const context = (h,hour,extra={})=>h.setNpcRoutineContextV62({clock:{day:1,hour},...extra},{persist:false,rebuild:true});
const tick = (h,seconds,rate=60)=>{for(let i=0;i<seconds*rate;i++)h.update(1/rate);};
test('V185 a passenger on another deck or in another room cannot indefinitely hold an annex service owner', () => {
  const h=runtime(9,{deck:3,roomId:'reactor'});
  const original=h.npcInterdeckStateV165;
  // Isolate one already-admitted passenger circuit without inventing a new
  // public route. The authority and physics remain exercised by the other
  // native interdeck tests in this suite.
  h.npcInterdeckStateV165={...original,routes:Object.fromEntries(
    Object.entries(original.routes).map(([id,entry])=>[id,{...entry,actor:null}]))};
  const inez=h.npcInterdeckStateV165.routes['inez-civil'];
  inez.actor={deck:2,roomId:'quarantine',stage:'walking-lift'};
  assert.equal(h.npcInterdeckPassingRequestV165('idris-engine'),false,
    'other-deck travel cannot own Idris\'s engine-room door');
  inez.actor={deck:3,roomId:'dropship-hangar',stage:'walking-lift'};
  assert.equal(h.npcInterdeckPassingRequestV165('idris-engine'),false,
    'same-deck hangar travel does not occupy the reactor');
  inez.actor={deck:3,roomId:'reactor',stage:'walking-portal'};
  assert.equal(h.npcInterdeckPassingRequestV165('idris-engine'),true,
    'actual shared reactor passage still retains priority');
  inez.actor={deck:3,roomId:'reactor',stage:'returned'};
  assert.equal(h.npcInterdeckPassingRequestV165('idris-engine'),false,
    'a returned passenger cannot reserve the passage');
  assert.equal(h.npcInterdeckPassingRequestV165('unknown-route'),false);
});
const entry=(h,id)=>h.getSnapshot().npcInterdeckRoutesV165.routes[id];
const liftActor = () => {const lift=npcLiftSocketV165(0,'hub-midship-lift');return{crewId:'crew-10-david-8r',roomId:lift.roomId,
  x:lift.x-22-96,y:532,w:44,h:92,facing:1,alive:true};};

test('NPC carriage spends real boarding, covered travel and exiting time without touching player charts',()=>{
  for(const rate of[12,60]) {
    const actor=liftActor();let trip=createNpcLiftTransitV165(actor,{fromDeck:0,toDeck:2,shaftId:'hub-midship-lift',exitDirection:-1});
    const phases=new Set();let walked=0,handoffs=0,complete=false;
    for(let i=0;i<20*rate&&!complete;i++) {
      assert.deepEqual(normalizeNpcLiftTransitV165(trip),trip);phases.add(trip.phase);
      const before=npcLiftPoseV165(trip),step=advanceNpcLiftTransitV165(trip,1/rate);
      walked+=step.walked;if(step.handoff){handoffs++;assert.equal(npcLiftDoorProgressV165(trip),0);assert.equal(trip.phase,'travel');
        assert.equal(npcLiftPoseV165(step.trip).deck,2);assert.equal(step.walked,0);}
      if(step.trip) {
        const after=npcLiftPoseV165(step.trip);
        assert.ok(Math.abs(after.x-before.x)<=27/rate+1e-7);assert.equal(after.y,532);
      }
      trip=step.trip;complete=step.complete;
    }
    assert.ok(complete);assert.deepEqual([...phases],['boarding','closing','travel','opening','exiting']);
    assert.equal(handoffs,1);assert.ok(Math.abs(walked-192)<.00001);
  }
});
test('occupied arrival holds the same closed source cabin and exact saved passenger phase',()=>{
  let trip=createNpcLiftTransitV165(liftActor(),{fromDeck:0,toDeck:3,shaftId:'hub-midship-lift'});
  for(let i=0;i<1000&&trip.phase!=='travel';i++)trip=advanceNpcLiftTransitV165(trip,1/60).trip;
  const saved=structuredClone(trip);
  for(let i=0;i<120;i++) {
    const result=advanceNpcLiftTransitV165(trip,1/60,{arrivalClear:false});assert.ok(result.blocked);assert.deepEqual(result.trip,saved);
    trip=result.trip;assert.equal(npcLiftPoseV165(trip).deck,0);
  }
  assert.deepEqual(advanceNpcLiftTransitV165(trip,1/60,{running:false}).trip,saved);
  for(const patch of[{crewId:'crew-other'},{fromDeck:3},{cabinX:trip.cabinX+1},{originX:trip.originX+1},
    {elapsed:100},{phase:'walking'},{carriageSeconds:100},{toDeck:0}])assert.equal(normalizeNpcLiftTransitV165({...trip,...patch}),null);
});
test('a destination phase cannot be saved before the physical carriage duration',()=>{
  const trip=createNpcLiftTransitV165(liftActor(),{fromDeck:0,toDeck:2,shaftId:'hub-midship-lift'});
  assert.equal(normalizeNpcLiftTransitV165({...trip,phase:'opening'}),null);
  assert.equal(normalizeNpcLiftTransitV165({...trip,phase:'exiting'}),null);
});
for(const d of interdeckDefinitions) {
  test(d.id+': composed physical owners carry the singleton, visit the paired annex and return to the exact origin',()=>{
    const nativeResolution=resolveNpcRoutineV62(d.crewId,{clock:{day:1,hour:5}});
    const h=runtime(5,{deck:nativeResolution.deck,roomId:nativeResolution.roomId});
    const oldPrimary=(d.legacyRouteId&&h.getNpcServiceActorV161(d.legacyRouteId))||h.npcs.find(a=>a.crewId===d.crewId);
    assert.ok(oldPrimary,'actual origin must be observed before the watch');
    const origin={x:oldPrimary.x,y:oldPrimary.y,roomId:oldPrimary.roomId};
    context(h,d.id==='david-durandal'?11:d.id==='inez-civil'?20:d.id==='jun-sanitary'?17:8);
    assert.equal(h.npcInterdeckBodiesV165.get(d.id),oldPrimary,'lease keeps exact object identity');
    let last=entry(h,d.id).actor,seen=new Set(),crossDeck=0;
    for(let i=0;i<500*12;i++) {
      h.update(1/12);const current=entry(h,d.id).actor;
      assert.ok(current,JSON.stringify(entry(h,d.id)));seen.add(current.stage);if(current.lift)seen.add('lift:'+current.lift.phase);
      if(current.deck!==last.deck){assert.equal(last.lift.phase,'travel');assert.equal(current.lift.phase,'opening');
        assert.equal(current.distance,last.distance);crossDeck++;}
      assert.equal(h.getNpcInterdeckActorsV165().filter(a=>a.crewId===d.crewId).length,1);
      assert.equal(h.npcInterdeckBodiesV165.get(d.id),oldPrimary);
      const actualBodies=new Set([...h.getNpcInterdeckActorsV165(),...h.getNpcAnnexServiceActorsV163(),...h.getNpcServiceTrafficActorsV163(),...h.npcs,...h.ensureAnnexNpcCohortV141()].filter(a=>a.crewId===d.crewId));
      assert.equal(actualBodies.size,1,'every real owner/cohort retains the same physical object');
      assert.ok(normalizeNpcInterdeckRoutesV165(h.npcInterdeckStateV165).routes[d.id].actor,'every phase must persist strictly');
      last=current;if(current.stage==='service')break;
    }
    const out=entry(h,d.id);assert.equal(out.actor.stage,'service',JSON.stringify({route:out,peers:h.getNpcServicePeersV163(out.actor.deck,d.crewId).map(p=>({crewId:p.crewId,x:p.x,y:p.y,roomId:p.roomId})),traffic:h.getSnapshot().npcServiceTrafficV163}));
    assert.equal(out.actor.roomId,d.annexRoomId);assert.equal(out.actor.crossings,1);
    if(d.id==='jun-sanitary')assert.ok(Math.abs(out.actor.verticalDistance-248)<1e-7);
    assert.equal(out.actor.liftJourneys,1);assert.equal(crossDeck,1);assert.ok(seen.has('lift:boarding'));assert.ok(seen.has('lift:exiting'));
    h.persist();const resumed=runtime(d.id==='david-durandal'?11:d.id==='inez-civil'?20:d.id==='jun-sanitary'?17:8,h.persisted.at(-1));
    assert.deepEqual(entry(resumed,d.id).actor,out.actor);
    if(out.origin.source==='legacy-physical-owner')assert.equal(resumed.npcInterdeckBodiesV165.get(d.id),resumed.getNpcServiceActorV161(d.legacyRouteId));
    context(resumed,22);
    for(let i=0;i<500*12&&!entry(resumed,d.id).returned;i++)resumed.update(1/12);
    const back=entry(resumed,d.id);assert.ok(back.returned,JSON.stringify({route:back,peers:resumed.getNpcServicePeersV163(back.actor?.deck??d.nativeDeck,d.crewId).map(a=>({crewId:a.crewId,roomId:a.roomId,x:a.x,y:a.y})),reservation:resumed.npcLiftCabinReservationV165(d.shaftId),traffic:resumed.getSnapshot().npcServiceTrafficV163}));assert.equal(back.returned.x,origin.x);
    assert.equal(back.returned.y,origin.y);assert.equal(back.returned.roomId,origin.roomId);
    if(d.id==='jun-sanitary')assert.ok(Math.abs(back.returned.verticalDistance-496)<1e-7);
    assert.equal(back.returned.liftJourneys,2);assert.equal(back.returned.crossings,2);assert.ok(back.returned.distance>out.actor.distance);
  });
}
test('civil rendezvous must really be docked before Inez leaves the borrowed origin',()=>{
  const h=runtime(5,{deck:2,roomId:'quarantine'},{portUnavailable:true});
  const body=h.getNpcServiceActorV161('inez-bioforge'),x=body.x;context(h,20);tick(h,3);
  const e=entry(h,'inez-civil');assert.equal(e.actor.x,x);assert.equal(e.actor.stage,'retained');
  assert.equal(e.actor.reason,'port-unavailable');assert.equal(e.actor.distance,0);assert.equal(body,h.npcInterdeckBodiesV165.get('inez-civil'));
});
test('07h native annex initial conditions do not manufacture an observed station origin',()=>{
  const h=runtime(7,{deck:0,roomId:'briefing'});context(h,10);
  const e=entry(h,'maksim-cockpit');assert.equal(e.actor,null);assert.equal(e.origin,null);assert.equal(e.returned,null);
});
for(const d of interdeckDefinitions) {
  test(d.id+': a real pre-watch body survives the strategy screen save boundary before borrowing',()=>{
    const r=resolveNpcRoutineV62(d.crewId,{clock:{day:1,hour:5}}),before=runtime(5,{deck:r.deck,roomId:r.roomId});
    const physical=(d.legacyRouteId&&before.getNpcServiceActorV161(d.legacyRouteId))||before.npcs.find(a=>a.crewId===d.crewId);
    assert.ok(physical);const bookmark={x:physical.x,y:physical.y,roomId:physical.roomId};before.persist();
    const save=before.persisted.at(-1),retained=save.npcInterdeckRoutesV165.routes[d.id].retained;
    assert.equal(retained.x,bookmark.x);assert.equal(retained.roomId,bookmark.roomId);
    assert.equal(save.npcInterdeckRoutesV165.routes[d.id].actor,null,'dormant retained pose does not own another route');
    const hour=d.id==='david-durandal'?11:d.id==='inez-civil'?20:d.id==='jun-sanitary'?17:8;
    const resumed=runtime(hour,save),e=entry(resumed,d.id);
    assert.ok(e.actor,JSON.stringify(e));const restoredBody=resumed.npcInterdeckBodiesV165.get(d.id);
    assert.ok(restoredBody,'the retained Save must rehydrate an actual body, not only its ledger');
    if(retained.source==='legacy-physical-owner')assert.equal(restoredBody,resumed.getNpcServiceActorV161(d.legacyRouteId));
    assert.equal(restoredBody.x,bookmark.x);assert.equal(restoredBody.roomId,bookmark.roomId);assert.equal(e.origin.x,bookmark.x);assert.equal(e.actor.x,bookmark.x);
    assert.equal(e.actor.y,bookmark.y);assert.equal(e.actor.roomId,bookmark.roomId);assert.equal(e.actor.distance,0);
    assert.equal(e.actor.liftJourneys,0);assert.equal(e.actor.crossings,0);
  });
}

test('V167 David: paused05→08→11 refresh retains the observed native station without rewinding a physical legacy owner',()=>{
  // A genuine legacy owner is allowed to spend real distance before its
  // alternate watch. Retention cannot rewind it to an earlier station.
  const legacy=runtime(5,{deck:2,roomId:'quarantine'});
  const primary=legacy.getNpcServiceActorV161('inez-bioforge');assert.ok(primary);
  const originalLegacy={x:primary.x,y:primary.y,roomId:primary.roomId};
  context(legacy,11);
  for(let i=0;i<10*60&&Math.abs(primary.x-originalLegacy.x)<=8;i++)legacy.update(1/60);
  const beforeBorrow=legacy.getNpcServicePhysicalStateV165('inez-bioforge');
  assert.ok(beforeBorrow&&beforeBorrow.distance>0&&Math.abs(primary.x-originalLegacy.x)>8,
    'the control requires actual movement through the existing legacy controller');
  assert.equal(beforeBorrow.stage,'walking');assert.equal(primary.roomId,originalLegacy.roomId);
  const movingLegacy={x:primary.x,y:primary.y,roomId:primary.roomId};
  context(legacy,20);
  assert.equal(legacy.getNpcServiceActorV161('inez-bioforge'),primary);
  assert.deepEqual({x:primary.x,y:primary.y,roomId:primary.roomId},movingLegacy,
    'a timetable refresh cannot restore an obsolete bookmark over a real moving owner');
  assert.equal(entry(legacy,'inez-civil').actor,null,'the alternate route waits for the real local owner');
  legacy.update(1/60);
  assert.ok(Math.abs(primary.x-movingLegacy.x)<=27/60+1e-6,'the legacy return spends bounded real distance');
  assert.equal(primary.y,movingLegacy.y);

  const h=runtime(5,{deck:0,roomId:'cryo-bay'}),crew='crew-10-david-8r';
  const physical=h.npcs.find(a=>a.crewId===crew);assert.ok(physical);
  const pose={x:physical.x,y:physical.y,roomId:physical.roomId};
  const retained05=structuredClone(entry(h,'david-durandal').retained);
  assert.ok(retained05);assert.equal(retained05.source,'native-observed-body');
  assert.equal(retained05.roomId,pose.roomId);assert.equal(retained05.x,pose.x);
  assert.equal(entry(h,'david-durandal').actor,null);
  h.running=false;context(h,8);
  const at08=structuredClone(entry(h,'david-durandal'));
  const cohort08=h.npcs.filter(a=>a.crewId===crew);
  const seen08=h.npcInterdeckObservedV165.get(crew);
  context(h,11);
  const at11=entry(h,'david-durandal'),borrowed=h.npcInterdeckBodiesV165.get('david-durandal');
  const diagnostic=JSON.stringify({at08,at11,cohort08:cohort08.map(a=>({x:a.x,y:a.y,roomId:a.roomId})),
    seen08:seen08&&{x:seen08.x,y:seen08.y,roomId:seen08.roomId}});
  assert.equal(at08.actor,null,'08h is before the Durandal watch: '+diagnostic);
  assert.deepEqual(at08.retained,retained05,'a sampled08h work room is not observed physical travel: '+diagnostic);
  assert.equal(cohort08.length,1,'one real native cohort body at08h');
  assert.equal(seen08,physical,'a paused rebuild keeps the actually observed native owner');
  assert.equal(cohort08[0],physical);
  assert.deepEqual({x:cohort08[0].x,y:cohort08[0].y,roomId:cohort08[0].roomId},pose);
  assert.ok(at11.actor&&borrowed,diagnostic);assert.equal(borrowed,physical);
  assert.equal(at11.origin.source,'native-observed-body');
  assert.deepEqual({x:at11.origin.x,y:at11.origin.y,roomId:at11.origin.roomId},pose);
  assert.deepEqual({x:borrowed.x,y:borrowed.y,roomId:borrowed.roomId},pose);
  assert.equal(at11.actor.distance,0);assert.equal(at11.actor.crossings,0);assert.equal(at11.actor.liftJourneys,0);
  assert.equal(new Set([...h.getNpcInterdeckActorsV165(),...h.npcs].filter(a=>a.crewId===crew)).size,1);
});

test('V167 David: a reused hub restores saved05h before stale08h natives can replace its station',()=>{
  const h=runtime(5,{deck:0,roomId:'cryo-bay'}),crew='crew-10-david-8r';
  const physical=h.npcs.find(a=>a.crewId===crew);assert.ok(physical);
  const pose={x:physical.x,y:physical.y,roomId:physical.roomId};h.persist();
  const saved05=structuredClone(h.persisted.at(-1)),savedBytes=JSON.stringify(saved05);
  const retained05=structuredClone(saved05.npcInterdeckRoutesV165.routes['david-durandal'].retained);
  assert.ok(retained05);assert.equal(retained05.source,'native-observed-body');
  assert.equal(saved05.npcInterdeckRoutesV165.routes['david-durandal'].actor,null);
  h.running=false;context(h,8);
  const stale08=h.npcs.filter(a=>a.crewId===crew).map(a=>({x:a.x,y:a.y,roomId:a.roomId}));
  h.start(structuredClone(saved05),{routineContextV62:{clock:{day:1,hour:11},save:portCampaign}});
  const fresh=runtime(11,structuredClone(saved05)),restored=entry(h,'david-durandal'),control=entry(fresh,'david-durandal');
  const actual=h.npcInterdeckBodiesV165.get('david-durandal'),freshBody=fresh.npcInterdeckBodiesV165.get('david-durandal');
  const diagnostic=JSON.stringify({savedRetained:retained05,stale08,restored,control});
  assert.equal(JSON.stringify(saved05),savedBytes,'restarting either runtime cannot rewrite the earlier save');
  assert.ok(restored.actor&&actual&&control.actor&&freshBody,diagnostic);
  assert.deepEqual(restored.origin,control.origin,'reused and new hubs restore the same observed station: '+diagnostic);
  assert.deepEqual({x:restored.origin.x,y:restored.origin.y,roomId:restored.origin.roomId},pose);
  assert.equal(restored.origin.source,'native-observed-body');
  assert.deepEqual({x:actual.x,y:actual.y,roomId:actual.roomId},pose);
  assert.equal(actual.w,44);assert.equal(actual.h,92);
  assert.equal(restored.actor.distance,0);assert.equal(restored.actor.crossings,0);assert.equal(restored.actor.liftJourneys,0);
  assert.deepEqual(restored.actor,control.actor);
  assert.equal(new Set([...h.getNpcInterdeckActorsV165(),...h.npcs].filter(a=>a.crewId===crew)).size,1,
    'the reused hub publishes one rehydrated body rather than the stale timetable sample');
});

test('diagnostic07: actual DAVID Rook ECHO order after the native07h to11h watch',()=>{
  const h=runtime(7,{deck:0,roomId:'combat-information'});const native=h.npcs.find(a=>a.crewId==='crew-10-david-8r');
  assert.ok(native);const initial=h.getSnapshot();context(h,11);const samples=[];let lastX=null,lastProgress=0;
  for(let i=0;i<500*12;i++) {
    h.update(1/12);const e=entry(h,'david-durandal');
    if(e.actor?.x!==lastX){lastX=e.actor?.x;lastProgress=i/12;}
    if(i%120===0||i===500*12-1)samples.push({time:i/12,route:e,
      owners:h.getNpcServiceOwnedActorsV163().map(a=>({crewId:a.crewId,roomId:a.roomId,x:a.x,y:a.y,vx:a.vx})),
      peers:h.getNpcServicePeersV163(0).map(a=>({crewId:a.crewId,roomId:a.roomId,x:a.x,y:a.y,vx:a.vx})),
      traffic:h.getSnapshot().npcServiceTrafficV163,leases:h.getSnapshot().npcAnnexLeasesV163,
      workposts:h.getSnapshot().npcAnnexWorkpostRoutesV165,doors:h.doorStates.map(d=>({id:d.id,x:d.x,progress:d.progress}))});
  }
  const result={initial,final:h.getSnapshot(),lastProgress,samples};
  const path=process.env.ATF_NPC_DIAGNOSTIC_PATH||join(mkdtempSync(join(tmpdir(),'atf-interdeck-diagnostic-')),'david07-diagnostic.json');
  mkdirSync(dirname(path),{recursive:true});writeFileSync(path,JSON.stringify(result,null,2)+'\n');
  console.log('V165 actual07h diagnostic:',JSON.stringify({path,lastProgress,route:entry(h,'david-durandal'),
    peers:samples.at(-1).peers,owners:samples.at(-1).owners}));
});

test('an arriving cabin waits on its real source chart until the destination floor departure has cleared',()=>{
  const h=runtime(5,{deck:2,roomId:'quarantine'});context(h,20);let held=false,boarded=false;
  for(let i=0;i<220*12;i++) {
    h.update(1/12);const inez=entry(h,'inez-civil'),maksim=entry(h,'maksim-cockpit');
    if(inez.actor?.stage==='waiting-lift'&&inez.liftQueue.some(q=>q.routeId==='maksim-cockpit')) {
      held=true;assert.equal(inez.actor.deck,2);assert.equal(inez.actor.lift,null);assert.equal(inez.actor.liftJourneys,0);
    }
    if(inez.actor?.lift?.phase==='boarding'){boarded=true;assert.notEqual(maksim.actor?.deck,3);break;}
  }
  assert.ok(held,'the actual two-passenger source/destination conflict must be observed');
  assert.ok(boarded,'the same waiting passenger boards only after a real departure clears its arrival corridor');
});

function nativePaintRecorderV165() {
  const calls=[];const context={measureText:text=>({width:String(text).length*6})};
  for(const method of ['save','restore','beginPath','closePath','moveTo','lineTo','rect','clip','fill','stroke',
    'fillRect','strokeRect','fillText','drawImage','translate','scale'])
    context[method]=(...args)=>calls.push({method,args});
  return{context,calls};
}
test('native06h door drawing paints ordinary bulkheads when every passenger ledger is empty',()=>{
  const h=runtime(6,{deck:0,roomId:'combat-information'}),{context:ctx,calls}=nativePaintRecorderV165();
  assert.ok(Object.values(h.npcInterdeckStateV165.routes).every(e=>e.actor===null));
  assert.equal(h.npcLiftCabinReservationV165(),null);
  assert.equal(h.npcLiftCabinReservationV165(''),null);
  assert.equal(h.npcLiftCabinReservationV165('hub-midship-lift'),null);
  const before=structuredClone(h.npcInterdeckStateV165),ordinary=h.doorStates.filter(d=>!d.lift);
  assert.ok(ordinary.length);assert.ok(ordinary.every(d=>d.shaftId===undefined));
  for(const door of ordinary) {
    const progress=door.progress;
    assert.doesNotThrow(()=>{h.drawDoor(ctx,door,'back');h.drawDoor(ctx,door,'front');});
    assert.equal(door.progress,progress);
    const painted=h.bulkheadDrawnV134.get(door.id);
    assert.ok(painted,'the inherited native bulkhead painter must actually complete');
    assert.deepEqual(painted.drawnPhases,['back','front']);
    assert.equal(painted.progress,progress);
  }
  assert.ok(calls.some(c=>c.method==='fillRect'),'native architectural pixels are painted');
  assert.deepEqual(h.npcInterdeckStateV165,before,'ordinary rendering cannot create a passenger or move its ledger');
});
test('native lift drawing still follows a real passenger and clips its intact atlas behind closing and closed leaves',()=>{
  const h=runtime(5,{deck:0,roomId:'cryo-bay'}),{context:ctx,calls}=nativePaintRecorderV165();
  const liftImage={complete:true,naturalWidth:187,naturalHeight:191};
  h.propImages=new Map([['/assets/openai/hub/props/lift-door.png',liftImage]]);
  context(h,11);let closing=false,closed=false;
  for(let i=0;i<60*12&&(!closing||!closed);i++) {
    h.update(1/12);const e=h.npcInterdeckStateV165.routes['david-durandal'],t=e.actor?.lift;
    if(!t||t.phase==='closing'&&(t.elapsed<.2||closing)||t.phase!=='closing'&&t.phase!=='travel'||t.phase==='travel'&&closed)continue;
    const body=h.npcInterdeckBodiesV165.get('david-durandal'),door=h.doorStates.find(d=>d.shaftId===t.shaftId);
    const before=structuredClone(e.actor),progress=npcLiftDoorProgressV165(t);calls.length=0;
    h.drawDoor(ctx,door,'front');assert.equal(door.progress,progress);
    assert.deepEqual(h.npcLiftCabinReservationV165(t.shaftId),{owner:'david-durandal',crewId:body.crewId,shaftId:t.shaftId,phase:t.phase});
    assert.equal(h.npcLiftCabinReservationV165(),null);
    assert.equal(h.npcLiftCabinReservationV165('hub-midship-lift'),null);
    const interior=h.hubSpatialLiftsV136.get(door.id).interior;
    assert.equal(interior.progress,progress);assert.equal(interior.target.h,156);
    assert.ok(calls.filter(c=>c.method==='drawImage'&&c.args[0]===liftImage).length>=1,'the real native lift frame/leaves painter runs');
    if(t.phase==='closing')assert.ok(progress>0&&progress<1);else assert.equal(progress,0);
    const geometry=resolveHumanAtlasGeometryV133({actor:body,sheet:resolveSpriteSheet(body.spriteId),column:0,row:0,surface:'hub'});
    assert.ok(geometry);const actorImage={complete:true,naturalWidth:geometry.sourceWidth,naturalHeight:geometry.sourceHeight};
    const clip=h.npcInterdeckClipV165(body);assert.ok(clip);assert.equal(clip.w,interior.opening.w*progress);
    calls.length=0;assert.equal(h.drawNpcLifeV136(ctx,actorImage,body,null,geometry),true);
    assert.ok(calls.some(c=>c.method==='rect'&&c.args.every((v,index)=>v===[clip.x,clip.y,clip.w,clip.h][index])));
    assert.ok(calls.some(c=>c.method==='clip'),'the passenger draw really applies the native aperture clip');
    const atlasDraw=calls.find(c=>c.method==='drawImage'&&c.args[0]===actorImage);assert.ok(atlasDraw);
    assert.deepEqual(atlasDraw.args.slice(-2),[geometry.sprite.width,geometry.sprite.height],'occlusion preserves the complete source sprite scale');
    assert.deepEqual(e.actor,before);if(t.phase==='closing')closing=true;else closed=true;
  }
  assert.ok(closing&&closed,'both an opening-width partial cover and the fully opaque travelling cover are exercised');
});

const SecurityCommandsV165=withHubTrainingV132(FixtureBase).prototype;
class LockedBulkheadFixtureV165 extends TestHub {
  start(save={},options={}) {
    this.hubTrainingV132=normalizeHubTrainingV132(save.hubTrainingV132);
    return super.start(save,options);
  }
  nearestAnnexStationV71(...args) {return AnnexHub.prototype.nearestAnnexStationV71.apply(this,args);}
  hubTrainingContactV132(...args) {return SecurityCommandsV165.hubTrainingContactV132.apply(this,args);}
  getHubTrainingCommandsV132(...args) {return SecurityCommandsV165.getHubTrainingCommandsV132.apply(this,args);}
  executeHubTrainingCommandV132(...args) {return SecurityCommandsV165.executeHubTrainingCommandV132.apply(this,args);}
  enforceSecurityLocksV132(...args) {return SecurityCommandsV165.enforceSecurityLocksV132.apply(this,args);}
  getNpcServiceOwnerYieldGoalV165(id,actor) {
    if(id===(this.withdrawOwnerId||'david-durandal')&&Number.isFinite(this.withdrawToObservedFloorX))return this.withdrawToObservedFloorX;
    return super.getNpcServiceOwnerYieldGoalV165(id,actor);
  }
  persist() {
    const sink=this.onPersist;this.onPersist=patch=>sink({...patch,deck:this.state.deck,roomId:this.state.roomId,
      activeAnnexId:this.local||null,positionX:this.player.x,positionY:this.player.y,
      hubTrainingV132:normalizeHubTrainingV132(this.hubTrainingV132)});
    try{return super.persist();}finally{this.onPersist=sink;}
  }
}
const bodyOverlaps=(actor,box)=>actor.x<box.x+box.w&&actor.x+actor.w>box.x&&actor.y<box.y+box.h&&actor.y+actor.h>box.y;
function securityRuntimeV165(hour,save) {
  const h=new LockedBulkheadFixtureV165();h.start(save,{routineContextV62:{clock:{day:1,hour},save:portCampaign}});return h;
}
test('a real remote CCTV lock preserves an interdeck body crossing a bulkhead through save/reload and supported withdrawal',()=>{
  const consoleRoom=getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137.cctv);
  // The observer starts at the actual CCTV console; David starts in his real
  // native05h station and reaches the other deck through his timed cabin.
  const h=securityRuntimeV165(5,{deck:0,roomId:'combat-information',activeAnnexId:'cctv',
    positionX:consoleRoom.station.bounds.x+consoleRoom.station.bounds.w/2-22,positionY:532});
  assert.ok(h.hubTrainingContactV132('cctv'));context(h,11);
  const door=h.npcInterdeckDoorsV165[2].find(d=>d.id==='industrial:hub-east-bulkhead'),bounds=getHubBulkheadColliderV134(door);
  const foreign=h.npcInterdeckDoorsV165[3].find(d=>d.id==='engineering:hub-east-bulkhead');
  let observedExit=null,crossingBody=null;
  for(let i=0;i<140*60;i++) {
    h.update(1/60);const a=entry(h,'david-durandal').actor;
    if(a?.deck===2&&a.stage==='walking-portal'&&observedExit===null)observedExit={x:a.x,y:a.y,deck:a.deck};
    const body=h.npcInterdeckBodiesV165.get('david-durandal');
    if(body&&a.deck===2&&a.stage==='walking-portal'&&body.x>=bounds.x-6&&body.x<bounds.x+2&&bodyOverlaps(body,bounds)) {
      crossingBody=body;break;
    }
  }
  assert.ok(observedExit&&crossingBody,'the same body must physically arrive and walk into the real industrial bulkhead');
  assert.equal(observedExit.y,532);assert.equal(entry(h,'david-durandal').actor.liftJourneys,1);
  assert.notEqual(h.state.deck,2);assert.equal(h.currentAnnexV71().id,'cctv');
  assert.ok(h.executeHubTrainingCommandV132('door-toggle',door.id),'the genuine remote security command accepts this connected route');
  assert.ok(h.executeHubTrainingCommandV132('door-toggle',foreign.id));
  h.update(1/60);assert.ok(bodyOverlaps(crossingBody,bounds));
  assert.ok(door.progress>=.82,'an occupied locked leaf must retain the real passage threshold');
  assert.equal(foreign.progress,0,'the same coordinates on another deck do not occupy its locked leaf');
  h.persist();const saved=h.persisted.at(-1),pose=saved.npcInterdeckRoutesV165.routes['david-durandal'].actor;
  assert.ok(pose,'the occupied body must remain valid in the durable route schema');
  assert.ok(pose.bulkheadProgress[door.id]>=.82);assert.ok(saved.hubTrainingV132.lockedDoorIds.includes(door.id));
  for(const observerDeck of [0,2]) {
    // These are declared observer initial conditions for the same saved body,
    // never an NPC coordinate edit or a claimed player interdeck journey.
    const save=observerDeck===0?saved:{...saved,deck:2,roomId:'vehicle-bay',activeAnnexId:null,positionX:5000,positionY:532};
    const resumed=securityRuntimeV165(11,save),body=resumed.npcInterdeckBodiesV165.get('david-durandal');
    assert.ok(body);assert.equal(body.x,pose.x);assert.equal(body.y,pose.y);
    assert.deepEqual(entry(resumed,'david-durandal').actor,pose);
    const owned=resumed.npcInterdeckDoorsV165[2].find(d=>d.id===door.id);
    const visible=resumed.doorStates.find(d=>d.id===door.id);
    resumed.update(1/60);assert.ok(owned.progress>=.82);if(visible)assert.equal(visible.progress,owned.progress);
    assert.ok(bodyOverlaps(body,bounds));resumed.withdrawToObservedFloorX=observedExit.x;
    let cleared=false;
    for(let i=0;i<10*60;i++) {
      const previous={x:body.x,y:body.y};resumed.update(1/60);
      assert.equal(body.y,previous.y);assert.equal(body.y+body.h,624);assert.equal(body.grounded,true);
      assert.equal(entry(resumed,'david-durandal').actor.deck,2);assert.equal(entry(resumed,'david-durandal').actor.liftJourneys,1);
      assert.ok(Math.abs(body.x-previous.x)<=27/60+1e-6,'withdrawal spends real bounded floor motion');
      if(visible)assert.equal(visible.progress,owned.progress);
      assert.ok(normalizeNpcInterdeckRoutesV165(resumed.npcInterdeckStateV165).routes['david-durandal'].actor);
      if(!bodyOverlaps(body,bounds)){cleared=true;break;}
      assert.ok(owned.progress>=.82,'both visible and off-screen leaves stay clear until the whole body has withdrawn');
    }
    assert.ok(cleared);resumed.update(1/60);assert.equal(owned.progress,0);if(visible)assert.equal(visible.progress,0);
    assert.equal(resumed.npcInterdeckDoorsV165[3].find(d=>d.id===foreign.id).progress,0);
    assert.equal(resumed.npcInterdeckBodiesV165.get('david-durandal'),body,'withdrawal and closing keep one actual body');
  }
});

test('locked shared leaves retain the existing Jun-maintenance owner until its real floor withdrawal clears the opening',()=>{
  const consoleRoom=getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137.cctv);
  const h=securityRuntimeV165(5,{deck:0,roomId:'combat-information',activeAnnexId:'cctv',
    positionX:consoleRoom.station.bounds.x+consoleRoom.station.bounds.w/2-22,positionY:532});
  context(h,8);const door=h.npcInterdeckDoorsV165[3].find(d=>d.id==='engineering:hub-east-bulkhead'),bounds=getHubBulkheadColliderV134(door);
  let body=null;
  for(let i=0;i<80*60;i++) {
    h.update(1/60);const candidate=h.getNpcAnnexLeaseActorV163('jun-maintenance');
    if(candidate&&candidate.x>=bounds.x-22&&candidate.x<bounds.x-18&&bodyOverlaps(candidate,bounds)){body=candidate;break;}
  }
  assert.ok(body,'Jun must reach the real sensors bulkhead through his unchanged V163 floor controller');
  assert.equal(h.npcInterdeckStateV165.routes['jun-sanitary'].actor,null);
  assert.ok(h.getNpcServiceOwnedActorsV163().includes(body));assert.ok(!h.getNpcInterdeckActorsV165().includes(body));
  assert.ok(h.executeHubTrainingCommandV132('door-toggle',door.id));h.update(1/60);
  assert.ok(bodyOverlaps(body,bounds));assert.ok(door.progress>=.82,'the interdeck layer must not crush a different physical owner');
  h.persist();const saved=h.persisted.at(-1),jun=saved.npcAnnexLeasesV163.routes['jun-maintenance'];assert.ok(jun.actor);
  for(const observerDeck of [0,3]) {
    const save=observerDeck===0?saved:{...saved,deck:3,roomId:'sensor-array',activeAnnexId:null,positionX:5000,positionY:532};
    const resumed=securityRuntimeV165(8,save),actor=resumed.getNpcAnnexLeaseActorV163('jun-maintenance');
    assert.equal(actor.x,jun.actor.x);assert.equal(actor.y,jun.actor.y);
    const owned=resumed.npcInterdeckDoorsV165[3].find(d=>d.id===door.id),visible=resumed.doorStates.find(d=>d.id===door.id);
    resumed.update(1/60);assert.ok(owned.progress>=.82);if(visible)assert.equal(visible.progress,owned.progress);
    resumed.withdrawOwnerId='jun-maintenance';resumed.withdrawToObservedFloorX=jun.actor.homeX;let cleared=false;
    for(let i=0;i<10*60;i++) {
      const x=actor.x;resumed.update(1/60);assert.equal(actor.y+actor.h,624);
      assert.ok(Math.abs(actor.x-x)<=27/60+1e-6);assert.equal(resumed.npcInterdeckStateV165.routes['jun-sanitary'].actor,null);
      if(visible)assert.equal(visible.progress,owned.progress);
      if(!bodyOverlaps(actor,bounds)){cleared=true;break;}assert.ok(owned.progress>=.82);
    }
    assert.ok(cleared);resumed.update(1/60);assert.equal(owned.progress,0);if(visible)assert.equal(visible.progress,0);
    assert.equal(resumed.getNpcAnnexLeaseActorV163('jun-maintenance'),actor);
  }
});
test('the genuine main-chart player also keeps its occupied locked bulkhead above the passage threshold',()=>{
  const locked=normalizeHubTrainingV132({schema:132,lockedDoorIds:['industrial:hub-east-bulkhead']});
  assert.deepEqual(locked.lockedDoorIds,['industrial:hub-east-bulkhead']);
  const h=securityRuntimeV165(6,{deck:2,roomId:'vehicle-bay',positionX:3840,positionY:532,hubTrainingV132:locked});
  const owned=h.npcInterdeckDoorsV165[2].find(d=>d.id==='industrial:hub-east-bulkhead');
  const visible=h.doorStates.find(d=>d.id===owned.id),box=getHubBulkheadColliderV134(owned);
  assert.ok(bodyOverlaps(h.player,box));assert.equal(h.isAnnexActiveV71(),false);
  assert.ok(h.getNpcInterdeckActorsV165().length===0);h.update(1/60);
  assert.ok(owned.progress>=.82);assert.equal(visible.progress,owned.progress);assert.equal(h.player.y+h.player.h,624);
});

// Run the actual Python driver against the native owners of ladder movement and
// terminal actions. DOM/images/RAF, persistence storage and the already-covered
// lift trip to the terminal are explicit doubles; no Chromium is launched here.
async function nativeQaDriverV165(root) {
  const { HubGame } = await import(new URL('src/hub-opening-v88.js', root));
  const { createDefaultSave } = await import(new URL('src/save.js', root));
  const { hostV136 } = await import(new URL('scripts/forge-native-host-v136.mjs', root));
  const { getNpcInterdeckGeometryV165 } = await import(new URL('src/npc-interdeck-routes-v165.js', root));
  const { ShipCompanionControllerV87 } = await import(new URL('src/ship-companion-controller-v87.js', root));
  const { createInterface } = await import('node:readline');
  const options = JSON.parse(process.argv[2]), docking = options.kind === 'dock', host = hostV136();
  class NodeDouble extends EventTarget {
    constructor() { super(); this.dataset = {}; this.children = []; this.style = {}; this.open = false; }
    setAttribute() {} append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    focus() { document.activeElement = this; } getContext() { return host.canvas.getContext('2d'); }
    showModal() { this.open = true; } close() { this.open = false; this.dispatchEvent(new Event('close')); }
  }
  document.createElement = () => new NodeDouble(); document.body = new NodeDouble();
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.clock.hour = 5;
  if (save.onboardingV84) save.onboardingV84.phase = 'complete';
  Object.assign(save.hub, { deck: docking ? 3 : 1, roomId: docking ? 'dropship-hangar' : 'mess',
    positionX: docking ? 24 : 2350, positionY: 532 });
  Object.assign(save.hub.systems, { hull: 100, power: 100, oxygen: 100, quarantine: 100 });
  let controller;
  const hub = new HubGame(host.canvas, { audio: { ui() {}, unlock() {} }, onPersist() {}, onStatus() {},
    onAction: action => controller?.handle(action) });
  hub.start(save.hub, { routineContextV62: { clock: save.clock, save }, onboardingV84: save.onboardingV84 });
  const system = { profile: 1, data: save, commit(patch) {
    if (options.blocked) throw new Error('Disclosed storage failure');
    this.data = { ...this.data, ...structuredClone(patch) };
  } };
  if (docking) controller = new ShipCompanionControllerV87({ hub, saveSystem: system, isActive: () => true, toast() {} });
  else if (options.blocked && options.kind !== 'jun-clearance') hub.v51Ladders = hub.v51Ladders.filter(ladder => ladder.id !== 'quarters-floor');
  globalThis.__ATF_HUB__ = hub; globalThis.__ATF_V51__ = { saveSystem: system };
  const rate = options.rate || 60, releases = [], crouchReleases = [];
  const duct = { frames: 0, crouchedFrames: 0, highestX: 0 }; let elapsed = 0;
  const snapshot = () => ({ elapsed, player: { x: hub.player.x, y: hub.player.y, h: hub.player.h,
    w: hub.player.w, vx: hub.player.vx, grounded: hub.player.grounded, climbing: hub.player.climbing,
    crouching: hub.player.crouching }, deck: hub.state.deck, annex: hub.currentAnnexV71()?.id || null,
    running: hub.running, port: structuredClone(system.data.shipPortV1), dialogOpen: controller?.ui.isOpen || false,
    heldKeys: [...hub.keys], releases, crouchReleases, duct, config: { id: docking ? 'inez-civil' : 'jun-sanitary', nativeDeck: 1, deck: 1, cabinX: 2350,
      parentX: 828,
      ladders: getNpcInterdeckGeometryV165('jun-sanitary').ladders } });
  const key = (type, code) => {
    if (type === 'keyup' && code === 'KeyW') releases.push(snapshot().player);
    if (type === 'keyup' && code === 'KeyC') crouchReleases.push(snapshot().player);
    host.events.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), { code, repeat: false }));
  };
  const advance = ms => {
    let left = ms / 1000;
    while (left > 1e-9) { const dt = Math.min(1 / rate, left); if (hub.running) hub.update(dt); elapsed += dt; left -= dt;
      if (hub.player.y === 284 && hub.player.x + hub.player.w > 888) {
        duct.frames++; if (hub.player.crouching) duct.crouchedFrames++; duct.highestX = Math.max(duct.highestX, hub.player.x);
      }
    }
  };
  const until = (predicate, timeout) => {
    const deadline = elapsed + timeout / 1000;
    while (!predicate()) {
      if (elapsed >= deadline) throw new Error('Native wait timed out');
      advance(1000 / rate);
    }
  };
  console.log(JSON.stringify(snapshot()));
  for await (const line of createInterface({ input: process.stdin })) {
    const request = JSON.parse(line); let error = null;
    try {
      if (request.type === 'focus') host.canvas.focus();
      else if (request.type === 'wait') advance(request.ms);
      else if (request.type === 'clearance-wall') hub.v51Walls.push({ x: 850, y: 260, w: 32, h: 116 });
      else if (request.type === 'key') {
        key(request.down ? 'keydown' : 'keyup', request.key);
        if (request.press) { advance(request.ms || 0); key('keyup', request.key); }
      } else if (request.type === 'predicate') {
        const predicate = Function('return (' + request.expression + ')')();
        until(() => predicate(request.arg), request.timeout);
      } else if (request.type === 'visibility') until(() => controller.ui.isOpen === request.visible, request.timeout);
      else if (request.type === 'click') {
        if (!controller.ui.isOpen) throw new Error('Cannot click hidden terminal');
        const button = request.action === 'dock' ? controller.ui.dockButton : controller.ui.closeButton;
        if (button.disabled) throw new Error('Cannot click disabled terminal action');
        button.dispatchEvent(new Event('click')); await Promise.resolve();
      } else if (request.type === 'stop') break;
    } catch (failure) { error = failure.message; }
    console.log(JSON.stringify({ ...snapshot(), error }));
  }
}

function runNativeQaV165(cases) {
  const directory = mkdtempSync(join(tmpdir(), 'interdeck-native-qa-'));
  const root = new URL('../', import.meta.url).href;
  const driver = join(directory, 'driver.mjs'), input = join(directory, 'input.json'), output = join(directory, 'output.json');
  const qa = process.env.ATF_QA_INTERDECK_SOURCE || fileURLToPath(new URL('qa-npc-interdeck-native-v165.py', import.meta.url));
  writeFileSync(driver, `(${nativeQaDriverV165.toString()})(${JSON.stringify(root)});\n`);
  writeFileSync(input, JSON.stringify({ driver, qa, cases, node: process.execPath, output }));
  const python = String.raw`import ast, json, subprocess, sys
from pathlib import Path
from types import SimpleNamespace
spec = json.loads(Path(sys.argv[1]).read_text())
names = ['walk_to', 'climb_parent', 'dock_native', 'follow_jun_parent']
module = ast.Module(body=[n for n in ast.parse(Path(spec['qa']).read_text()).body
                         if isinstance(n, ast.FunctionDef) and n.name in names], type_ignores=[])
class Page:
    def __init__(self, case):
        self.proc = subprocess.Popen([spec['node'], spec['driver'], json.dumps(case)],
                                     stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        self.state = json.loads(self.proc.stdout.readline())
        self.keyboard = SimpleNamespace(
            press=lambda key, delay=0: self.call(type='key', key=key, down=True, press=True, ms=delay),
            down=lambda key: self.call(type='key', key=key, down=True),
            up=lambda key: self.call(type='key', key=key, down=False))
    def call(self, **request):
        self.proc.stdin.write(json.dumps(request) + '\n'); self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        if not line: raise RuntimeError(self.proc.stderr.read())
        self.state = json.loads(line)
        if self.state.get('error'): raise AssertionError(self.state['error'])
        return self.state
    def locator(self, selector):
        action = 'dock' if selector == '[data-port-action="dock"]' else 'close'
        return SimpleNamespace(focus=lambda: self.call(type='focus'),
            wait_for=lambda state: self.call(type='visibility', visible=state == 'visible', timeout=45000),
            click=lambda: self.call(type='click', action=action))
    def wait_for_timeout(self, ms): self.call(type='wait', ms=ms)
    def wait_for_function(self, expression, arg=None, timeout=45000):
        self.call(type='predicate', expression=expression, arg=arg, timeout=timeout)
    def screenshot(self): return b''
    def close(self):
        self.proc.stdin.write('{"type":"stop"}\n'); self.proc.stdin.flush()
        self.proc.stdin.close(); self.proc.wait(timeout=5)
        self.proc.stdout.close(); self.proc.stderr.close()
def check(name, ok):
    if not ok: raise AssertionError(name)
results = []
for case in spec['cases']:
    page = Page(case)
    namespace = {'time': SimpleNamespace(monotonic=lambda: page.state['elapsed']),
        'observed': lambda page, c: page.call(type='read'), 'phase': lambda label: None,
        'check': check, 'png': lambda *args: None, 'player_lift_to': lambda *args: None}
    exec(compile(module, '<actual-native-interdeck-qa>', 'exec'), namespace)
    if case['kind'] == 'dock':
        walk_to = namespace['walk_to']
        namespace['walk_to'] = lambda page, c, x: walk_to(page, c, x) if x == 18 else None
    error, waiting_at = None, None
    try:
        if case['kind'] == 'jun-clearance':
            namespace['climb_parent'](page, page.state['config'])
            if case.get('blocked'): page.call(type='clearance-wall')
            waiting_at = page.state['elapsed']
            # This test covers observer controls against real player physics.
            # Its route callback only executes the original892px clearance walk;
            # no NPC travel/service completion is fabricated or claimed here.
            namespace['follow_floor_actor'] = lambda page, c, stop: namespace['walk_to'](page, c, 892)
            if 'follow_jun_parent' in namespace:
                namespace['follow_jun_parent'](page, page.state['config'], lambda r: True)
            else:
                # The old actual callback used the same upright walk to892.
                namespace['walk_to'](page, page.state['config'], 892)
        else:
            namespace['dock_native' if case['kind'] == 'dock' else 'climb_parent'](page, page.state['config'])
    except AssertionError as failure: error = str(failure)
    results.append({'case': case, **page.state, 'error': error, 'waitingAt': waiting_at})
    page.close()
Path(spec['output']).write_text(json.dumps(results))
`;
  try {
    execFileSync('python3', ['-c', python, input], { stdio: 'inherit', timeout: 30000 });
    return JSON.parse(readFileSync(output, 'utf8'));
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('native interdeck QA finishes both real ladder landings and still refuses a missing ladder', () => {
  const [arrived, blocked] = runNativeQaV165([{ kind: 'climb' }, { kind: 'climb', blocked: true }]);
  assert.equal(arrived.error, null); assert.ok(Math.abs(arrived.player.x - 700) <= 7);
  assert.equal(arrived.player.y, 284); assert.equal(arrived.player.grounded, true); assert.equal(arrived.player.climbing, false);
  assert.equal(arrived.releases.length, 2);
  assert.ok(arrived.releases.every(player => player.grounded && !player.climbing));
  assert.match(blocked.error, /Native wait timed out/); assert.ok(blocked.elapsed >= 90);
  assert.equal(blocked.player.y, 532); assert.ok(!blocked.heldKeys.includes('KeyW'), 'finally must release W on failure');
});

test('native interdeck QA observes automatic docking closure and refuses a rejected storage commit', () => {
  const [docked, rejected] = runNativeQaV165([{ kind: 'dock' }, { kind: 'dock', blocked: true }]);
  assert.equal(docked.error, null, JSON.stringify(docked)); assert.equal(docked.port.phase, 'docked');
  assert.equal(docked.dialogOpen, false); assert.equal(docked.running, true);
  assert.match(rejected.error, /Native wait timed out/); assert.notEqual(rejected.port.phase, 'docked');
  assert.equal(rejected.dialogOpen, true); assert.equal(rejected.running, false);
});

test('native Jun QA passes the real upper vent crouched at30/60Hz and stands only after leaving it', () => {
  for (const arrived of runNativeQaV165([{ kind: 'jun-clearance', rate: 30 }, { kind: 'jun-clearance', rate: 60 }])) {
    assert.equal(arrived.error, null, JSON.stringify(arrived));
    assert.ok(Math.abs(arrived.player.x - 828) <= 7); assert.equal(arrived.player.y, 284);
    assert.equal(arrived.player.grounded, true); assert.equal(arrived.player.climbing, false); assert.equal(arrived.player.crouching, false);
    assert.ok(arrived.player.x + arrived.player.w <= 888);
    assert.ok(arrived.duct.highestX >= 885 && arrived.duct.highestX <= 899);
    assert.ok(arrived.duct.frames > 0); assert.equal(arrived.duct.crouchedFrames, arrived.duct.frames);
    assert.equal(arrived.crouchReleases.length, 1); assert.ok(arrived.crouchReleases[0].x + 44 <= 888);
    assert.deepEqual(arrived.heldKeys, []);
  }
});

test('native Jun crouch never bypasses a solid blocker and releases its key on the unchanged120s walk failure', () => {
  const [blocked] = runNativeQaV165([{ kind: 'jun-clearance', blocked: true }]);
  assert.match(blocked.error, /Native walking did not reach 892/);
  assert.ok(blocked.elapsed - blocked.waitingAt >= 120 && blocked.elapsed - blocked.waitingAt < 120.3);
  assert.equal(blocked.player.x, 806); assert.equal(blocked.player.y, 284);
  assert.equal(blocked.duct.frames, 0); assert.equal(blocked.crouchReleases.length, 1);
  assert.deepEqual(blocked.heldKeys, []);
});

// The actual Python interaction helpers run against native keyboard movement,
// NPC/counter selection, the app's conversation callback and both real UI owners.
// The declared20h docked/17h sanitary initial fixtures own no claimed interdeck travel here;
// DOM/images/RAF and local storage transport are doubles, not Chromium evidence.
async function nativeServiceDialogueQaDriverV165(root) {
  const { HubGame } = await import(new URL('src/hub-opening-v88.js', root));
  const { withHubNpcLifeV136 } = await import(new URL('src/npc-life-v136.js', root));
  const { createDefaultSave, SaveSystem } = await import(new URL('src/save.js', root));
  const { requestShipPortDockV87, stepShipPortV87 } = await import(new URL('src/ship-port-state-v87.js', root));
  const { ShipCompanionControllerV87 } = await import(new URL('src/ship-companion-controller-v87.js', root));
  const { HubDialogueUiV76 } = await import(new URL('src/hub-dialogue-ui-v76.js', root));
  const { beginNpcConversationV62 } = await import(new URL('src/npc-dialogue-v62.js', root));
  const { getNpcInterdeckGeometryV165 } = await import(new URL('src/npc-interdeck-routes-v165.js', root));
  const { hostV136 } = await import(new URL('scripts/forge-native-host-v136.mjs', root));
  const { readFileSync } = await import('node:fs');
  const { createInterface } = await import('node:readline');
  const options = JSON.parse(process.argv[2]), host = hostV136(), events = [], attempts = [];
  const jun = options.route === 'jun-sanitary';
  const config = jun ? { id: 'jun-sanitary', crewId: 'crew-11-jun-park', annexRoomId: 'sanitary-bay',
    post: getNpcInterdeckGeometryV165('jun-sanitary').post.x }
    : { id: 'inez-civil', crewId: 'crew-09-inez-harlow', annexRoomId: 'frontier-civil-counter',
      post: getNpcInterdeckGeometryV165('inez-civil').post.x };
  class NodeDouble extends EventTarget {
    constructor() { super(); Object.assign(this, { dataset: {}, children: [], attrs: new Map(), style: {},
      hidden: false, disabled: false, open: false, isConnected: true,
      classList: { add() {}, remove() {}, toggle() {} } }); }
    setAttribute(k, v) { this.attrs.set(k, String(v)); } getAttribute(k) { return this.attrs.get(k) ?? null; }
    removeAttribute(k) { this.attrs.delete(k); } append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; } contains(n) { return this === n || this.children.includes(n); }
    focus() { document.activeElement = this; } scrollIntoView() {}
    querySelectorAll() { return []; } querySelector() { return null; }
    getContext() { return host.canvas.getContext('2d'); }
    showModal() { this.open = true; } close() { this.open = false; this.dispatchEvent(new Event('close')); }
  }
  document.createElement = () => new NodeDouble(); document.body = new NodeDouble(); document.documentElement = new NodeDouble();
  const nodes = new Map(), byId = id => nodes.get(id) || (nodes.set(id, new NodeDouble()), nodes.get(id));
  const dialogue = new HubDialogueUiV76({ layer: byId('hub-dialogue-layer'), dialog: byId('hub-dialogue'),
    background: byId('app'), documentRef: document });
  let save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.scene = 'hub'; save.clock.hour = 5;
  if (save.onboardingV84) save.onboardingV84.phase = 'complete';
  Object.assign(save.hub.systems, { hull: 100, power: 100, oxygen: 100, quarantine: 100 });
  const dockingContext = { careReady: true, manifestReady: true, physical: { roomId: 'dropship-hangar' },
    authorization: { granted: true, portId: 'frontier-civil-relay', sectorId: 'current-service-sector', campaignHours: 5 } };
  save = requestShipPortDockV87(save, { transactionId: 'native-speaker-qa-v165' }, dockingContext).save;
  for (let i = 1; i <= 14; i++) save = stepShipPortV87(save, { simulationTime: i, dtSeconds: 1 }, dockingContext).save;
  save.clock.hour = jun ? 17 : 20;
  Object.assign(save.hub, jun ? { deck: 1, roomId: 'crew-quarters', positionX: 828, positionY: 284 }
    : { deck: 3, roomId: 'dropship-hangar', positionX: 92, positionY: 532 });
  const memory = new Map(), system = new SaveSystem({ getItem: k => memory.get(k) ?? null,
    setItem: (k, v) => memory.set(k, String(v)), removeItem: k => memory.delete(k) });
  system.data = save; system.commit();
  let controller, openConversation, elapsed = 0;
  const Game = withHubNpcLifeV136(HubGame), hub = new Game(host.canvas, { audio: { ui() {}, unlock() {} },
    onPersist: state => system.commit({ hub: { ...system.data.hub, ...state } }), onStatus() {},
    onAction: event => { events.push({ elapsed, ...structuredClone(event) });
      if (event.type === 'hub:npc-interaction') openConversation(event);
      else if (event.action?.startsWith('ship-port:')) controller.handle(event); } });
  const appSource = readFileSync(new URL('src/app.js', root), 'utf8');
  const from = appSource.indexOf('function openNpcDialogueV62('), to = appSource.indexOf('function chooseNpcDialogueV62(', from);
  if (from < 0 || to < from) throw new Error('Actual app conversation callback is unavailable');
  openConversation = new Function('hubEngine', 'saveSystem', 'beginNpcConversationV62', 'hubDialogueUiV76', 'byId',
    'currentOwnerV84', 'setDialogueSpeakerPortraitV168', 'escapeHtml',
    `let pendingNpcConversationV62 = null, pendingHubInteraction = null;\n${appSource.slice(from, to)}\nreturn openNpcDialogueV62;`)(
    hub, system, beginNpcConversationV62, dialogue, byId, () => ({ profile: system.profile }), () => {}, String);
  controller = new ShipCompanionControllerV87({ hub, saveSystem: system, isActive: () => true,
    toast: message => { throw new Error(message); } });
  hub.start(system.data.hub, { routineContextV62: { clock: system.data.clock, save: system.data }, onboardingV84: system.data.onboardingV84 });
  globalThis.__ATF_HUB__ = hub; globalThis.__ATF_V51__ = { saveSystem: system };
  host.canvas.focus(); const rate = options.rate || 60;
  const advance = ms => { for (let left = ms / 1000; left > 1e-9;) {
    const dt = Math.min(1 / rate, left); if (hub.running) hub.update(dt); elapsed += dt; left -= dt;
  } };
  const until = (predicate, timeout) => { const deadline = elapsed + timeout / 1000;
    while (!predicate()) { if (elapsed >= deadline - 1e-9) throw new Error('Native wait timed out');
      advance(Math.min(1000 / rate, (deadline - elapsed) * 1000)); } };
  const key = (type, code) => { if (type === 'keydown' && code === 'KeyE') attempts.push({ elapsed, x: hub.player.x,
    prompt: hub.statusPrompt(), selected: (jun ? hub.nearestAnnexNpcV141() : hub.prioritizedCivilAnnexNpcV156())?.crewId || null });
    host.events.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), { code, repeat: false })); };
  key('keydown', 'KeyE'); key('keyup', 'KeyE');
  until(() => hub.currentAnnexV71()?.id === config.annexRoomId && !hub.annexTransitionV71 && !hub.hubDoorClosingV142, 45000);
  attempts.length = 0; events.length = 0;
  const actor = hub.activeAnnexNpcsV141().find(n => n.crewId === config.crewId);
  const initialActor = { x: actor.x, y: actor.y, roomId: actor.roomId }, startElapsed = elapsed;
  const read = Function('return (' + options.read + ')')();
  const snapshot = () => ({ elapsed, sinceEntry: elapsed - startElapsed, config, observation: read(config),
    initialActor, sameActor: hub.activeAnnexNpcsV141().find(n => n.crewId === config.crewId) === actor,
    currentActor: { x: actor.x, y: actor.y, roomId: actor.roomId }, dialogueOpen: dialogue.openState,
    speaker: byId('hub-dialogue-speaker').textContent || null, portOpen: controller.ui.isOpen,
    heldKeys: [...hub.keys], attempts, events });
  console.log(JSON.stringify(snapshot()));
  for await (const line of createInterface({ input: process.stdin })) {
    const request = JSON.parse(line); let error = null;
    try {
      if (request.type === 'focus') host.canvas.focus();
      else if (request.type === 'wait') advance(request.ms);
      else if (request.type === 'key') { key(request.down ? 'keydown' : 'keyup', request.key);
        if (request.press) { advance(request.ms || 0); key('keyup', request.key); } }
      else if (request.type === 'predicate') { const predicate = Function('return (' + request.expression + ')')();
        until(() => predicate(request.arg), request.timeout); }
      else if (request.type === 'visibility') until(() => dialogue.openState === request.visible, request.timeout);
      else if (request.type === 'stop') break;
    } catch (failure) { error = failure.message; }
    console.log(JSON.stringify({ ...snapshot(), error }));
  }
}

function runNativeServiceDialogueQaV165(cases) {
  const directory = mkdtempSync(join(tmpdir(), 'interdeck-speaker-qa-'));
  const root = new URL('../', import.meta.url).href, driver = join(directory, 'driver.mjs');
  const input = join(directory, 'input.json'), output = join(directory, 'output.json');
  const qa = process.env.ATF_QA_INTERDECK_SOURCE || fileURLToPath(new URL('qa-npc-interdeck-native-v165.py', import.meta.url));
  writeFileSync(driver, `(${nativeServiceDialogueQaDriverV165.toString()})(${JSON.stringify(root)});\n`);
  writeFileSync(input, JSON.stringify({ driver, qa, cases, node: process.execPath, output }));
  const python = String.raw`import ast, json, subprocess, sys
from pathlib import Path
from types import SimpleNamespace
spec = json.loads(Path(sys.argv[1]).read_text())
tree = ast.parse(Path(spec['qa']).read_text())
names = ['walk_to', 'approach_service_dialogue', 'open_service_dialogue']
functions = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in names]
constants = {n.targets[0].id: ast.literal_eval(n.value) for n in tree.body if isinstance(n, ast.Assign)
             and len(n.targets) == 1 and isinstance(n.targets[0], ast.Name)
             and n.targets[0].id in ['READ', 'NATIVE_SERVICE_SPEAKER_V165']}
if not any(n.name == 'approach_service_dialogue' for n in functions):
    # The before-source experiment executes the original inline statements.
    approaches, openings = [], []
    for owner in ast.walk(tree):
        for field, body in ast.iter_fields(owner):
            if not isinstance(body, list): continue
            for index, node in enumerate(body):
                text = ast.unparse(node) if isinstance(node, ast.Expr) else ''
                if text == "walk_to(page, c, c['post'] - 84)": approaches.append([node])
                if text == "page.locator('#hub-dialogue').wait_for(state='visible')": openings.append(body[index - 1:index + 1])
    assert len(approaches) == len(openings) == 1
    for name, body in [('approach_service_dialogue', approaches[0]), ('open_service_dialogue', openings[0])]:
        function = ast.parse('def ' + name + '(page, c): pass').body[0]
        function.body = body; functions.append(function)
module = ast.fix_missing_locations(ast.Module(body=functions, type_ignores=[]))
class Page:
    def __init__(self, case):
        self.proc = subprocess.Popen([spec['node'], spec['driver'], json.dumps({**case, 'read': constants['READ']})],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        line = self.proc.stdout.readline()
        if not line: raise RuntimeError(self.proc.stderr.read())
        self.state = json.loads(line)
        self.keyboard = SimpleNamespace(press=lambda key, delay=0: self.call(type='key', key=key, down=True, press=True, ms=delay))
    def call(self, **request):
        self.proc.stdin.write(json.dumps(request) + '\n'); self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        if not line: raise RuntimeError(self.proc.stderr.read())
        self.state = json.loads(line)
        if self.state.get('error'): raise AssertionError(self.state['error'])
        return self.state
    def locator(self, selector):
        return SimpleNamespace(focus=lambda: self.call(type='focus'),
            wait_for=lambda state, timeout=45000: self.call(type='visibility', visible=state == 'visible', timeout=timeout))
    def wait_for_timeout(self, ms): self.call(type='wait', ms=ms)
    def wait_for_function(self, expression, arg=None, timeout=45000):
        self.call(type='predicate', expression=expression, arg=arg, timeout=timeout)
    def close(self):
        self.proc.stdin.write('{"type":"stop"}\n'); self.proc.stdin.flush()
        self.proc.stdin.close(); self.proc.wait(timeout=5)
        self.proc.stdout.close(); self.proc.stderr.close()
def check(label, ok):
    if not ok: raise AssertionError(label)
results = []
for case in spec['cases']:
    page = Page(case)
    namespace = {**constants, 'time': SimpleNamespace(monotonic=lambda: page.state['elapsed']),
        'observed': lambda page, c: page.call(type='read')['observation'], 'check': check}
    exec(compile(module, '<actual-native-speaker-qa>', 'exec'), namespace)
    error, waiting_at = None, None
    try:
        if 'offset' in case: namespace['walk_to'](page, page.state['config'], page.state['config']['post'] + case['offset'])
        else: namespace['approach_service_dialogue'](page, page.state['config'])
        waiting_at = page.state['elapsed']
        namespace['open_service_dialogue'](page, page.state['config'])
    except AssertionError as failure: error = str(failure)
    results.append({'case': case, **page.state, 'waitingAt': waiting_at, 'error': error})
    page.close()
Path(spec['output']).write_text(json.dumps(results))
`;
  try {
    execFileSync('python3', ['-c', python, input], { stdio: 'inherit', timeout: 30000 });
    return JSON.parse(readFileSync(output, 'utf8'));
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('native interdeck QA approaches Inez through the real floor and opens her actual conversation at30/60Hz', () => {
  for (const arrived of runNativeServiceDialogueQaV165([{ rate: 30 }, { rate: 60 }])) {
    assert.equal(arrived.error, null, JSON.stringify(arrived));
    assert.equal(arrived.dialogueOpen, true); assert.equal(arrived.portOpen, false);
    assert.equal(arrived.observation.running, false); assert.match(arrived.speaker, /Inez Harlow/);
    assert.equal(arrived.attempts.length, 1); assert.equal(arrived.attempts[0].selected, 'crew-09-inez-harlow');
    assert.equal(arrived.events.length, 1); assert.equal(arrived.events[0].type, 'hub:npc-interaction');
    assert.equal(arrived.events[0].crewId, 'crew-09-inez-harlow'); assert.equal(arrived.observation.interaction.count, 1);
    assert.equal(arrived.sameActor, true); assert.deepEqual(arrived.currentActor, arrived.initialActor);
    assert.ok(arrived.observation.player.x > 720 && arrived.observation.player.x <= 738.7);
    assert.equal(arrived.observation.player.y, 532); assert.equal(arrived.heldKeys.length, 0);
  }
});

test('native interdeck QA refuses the competing counter and Mica prompts within the original45s without pressing E', () => {
  const results = runNativeServiceDialogueQaV165([{ offset: -84 }, { offset: 84 }]);
  for (const held of results) {
    assert.match(held.error, /Native wait timed out/, JSON.stringify(held));
    assert.ok(Math.abs(held.elapsed - held.waitingAt - 45) < .002, 'selector availability shares the existing45s limit');
    assert.equal(held.attempts.length, 0, 'a competing native target is never activated');
    assert.equal(held.events.length, 0); assert.equal(held.dialogueOpen, false); assert.equal(held.portOpen, false);
    assert.equal(held.observation.running, true); assert.equal(held.sameActor, true);
    assert.deepEqual(held.currentActor, held.initialActor);
  }
  assert.match(results[0].observation.prompt, /RESPONSABLE DU COMPTOIR/);
  assert.match(results[1].observation.prompt, /MICA/);
});

test('native Jun QA selects his real conversation beyond the sanitary station and refuses its competing prompt', () => {
  const results = runNativeServiceDialogueQaV165([{ route: 'jun-sanitary', rate: 30 }, { route: 'jun-sanitary', rate: 60 },
    { route: 'jun-sanitary', offset: -84 }, { route: 'jun-sanitary', offset: 37 }]);
  for (const arrived of results.slice(0, 2)) {
    assert.equal(arrived.error, null, JSON.stringify(arrived));
    assert.equal(arrived.dialogueOpen, true); assert.equal(arrived.observation.running, false);
    assert.match(arrived.speaker, /Jun Park/); assert.equal(arrived.attempts.length, 1);
    assert.equal(arrived.attempts[0].selected, 'crew-11-jun-park');
    assert.equal(arrived.events.length, 1); assert.equal(arrived.events[0].type, 'hub:npc-interaction');
    assert.equal(arrived.events[0].crewId, 'crew-11-jun-park'); assert.equal(arrived.observation.interaction.count, 1);
    assert.equal(arrived.sameActor, true); assert.deepEqual(arrived.currentActor, arrived.initialActor);
    assert.ok(arrived.observation.player.x > 1053); assert.equal(arrived.observation.player.y, 532);
    assert.deepEqual(arrived.heldKeys, []);
  }
  for (const blocked of results.slice(2)) {
    assert.match(blocked.error, /Native wait timed out/, JSON.stringify(blocked));
    assert.ok(Math.abs(blocked.elapsed - blocked.waitingAt - 45) < .002);
    assert.match(blocked.observation.prompt, /CONTRÔLER LES INSTALLATIONS SANITAIRES/);
    assert.equal(blocked.attempts.length, 0); assert.equal(blocked.events.length, 0);
    assert.equal(blocked.dialogueOpen, false); assert.equal(blocked.sameActor, true);
    assert.deepEqual(blocked.currentActor, blocked.initialActor);
  }
});
