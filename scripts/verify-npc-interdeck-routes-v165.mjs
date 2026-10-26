import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from '../src/hub-game.js';
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

import { withHubNpcCalLogisticsRouteV165 } from '../src/npc-cal-logistics-route-v165.js';
import { withHubNpcInterdeckPassageV165 } from '../src/npc-interdeck-passage-v165.js';
import { withHubNpcInterdeckRoutesV165, normalizeNpcInterdeckRoutesV165, NPC_INTERDECK_DEFINITIONS_V165 as interdeckDefinitions } from '../src/npc-interdeck-routes-v165.js';
import { npcLiftSocketV165, createNpcLiftTransitV165, advanceNpcLiftTransitV165, normalizeNpcLiftTransitV165, npcLiftPoseV165, npcLiftDoorProgressV165 } from '../src/npc-lift-transit-v165.js';
import { requestShipPortDockV87, stepShipPortV87, canAccessPortCounterV87 } from '../src/ship-port-state-v87.js';

const LifeHub = withHubNpcLifeV136(RoutineHub);
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
  drawDepthContactShadowV116() { return true; }
  setNpcCrisisAlert() {}
  emitStatus() {}
  start(save = {}, { routineContextV62 = { clock: { day: 1, hour: 7 } } } = {}) {
    this.calClimbImageV165 = { complete: true, naturalWidth: 1254, naturalHeight: 1254 };
    this.state = { deck: save.deck ?? 0, roomId: save.roomId || 'combat-information' };
    this.player = { x: 5000, y: 532, w: 44, h: 92, alive: true };
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
