import assert from 'node:assert/strict';
import { test } from 'node:test';
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

test('V166 contains exactly the two observed station-to-work relays, preserving their distinct local owner IDs',()=>{
  assert.equal(relayDefinitions.length,2);
  for(const c of stationDefinitions) {
    const d=definition(c);assert.ok(d);assert.notEqual(d.id,c.localRouteId);
    const r=resolveNpcRoutineV62(c.crewId,{clock:{day:1,hour:5}});
    assert.equal(r.roomId,c.stationRoomId);assert.equal(r.deck,c.stationDeck);
  }
});

test('only Rook and Tamsin are added to the strict timed passenger protocol; an occupied destination preserves the closed source chart',()=>{
  for(const c of stationDefinitions) {
    const socket=npcLiftSocketV165(c.stationDeck,'hub-midship-lift');
    const actor={crewId:c.crewId,roomId:socket.roomId,x:socket.x-22-96,y:532,w:44,h:92,facing:1,alive:true};
    let trip=createNpcLiftTransitV165(actor,{fromDeck:c.stationDeck,toDeck:c.workDeck,shaftId:'hub-midship-lift'});
    assert.ok(trip);assert.deepEqual(normalizeNpcLiftTransitV165(trip),trip);
    for(let i=0;i<2000&&trip.phase!=='travel';i++)trip=advanceNpcLiftTransitV165(trip,1/12).trip;
    assert.equal(trip.phase,'travel');const saved=structuredClone(trip),source=npcLiftPoseV165(trip);
    for(let i=0;i<24;i++) {
      const step=advanceNpcLiftTransitV165(trip,1/12,{arrivalClear:false});
      assert.equal(step.blocked,true);assert.equal(step.handoff,false);assert.equal(step.walked,0);
      assert.deepEqual(step.trip,saved);assert.equal(npcLiftPoseV165(step.trip).deck,c.stationDeck);
    }
    assert.equal(source.y,532);
    assert.equal(createNpcLiftTransitV165({...actor,crewId:'crew-other'},
      {fromDeck:c.stationDeck,toDeck:c.workDeck,shaftId:'hub-midship-lift'}),null);
  }
});

function diagnostic(h,d,c) {
  return JSON.stringify({relay:entry(h,d.id),local:localState(h,c),
    peers:h.getNpcServicePeersV163?.(entry(h,d.id).actor?.deck??c.workDeck,c.crewId)
      .map(a=>({crewId:a.crewId,roomId:a.roomId,x:a.x,y:a.y})),
    traffic:h.getSnapshot().npcServiceTrafficV163,passage:h.getSnapshot().npcInterdeckPassageV165});
}
function traceUntil(h,d,c,done,{seconds=900,rate=12,identity=body(h,d),recordSaves=false}={}) {
  const phases=new Set(),checkpoints=new Map();let prior=null,deckChanges=0,adoptions=0,releases=0;
  for(let i=0;i<seconds*rate;i++) {
    const e=entry(h,d.id),actual=body(h,d),local=localState(h,c);
    assert.ok(actual&&e.actor,'every observed physical relay body must have a valid persistent ledger: '+diagnostic(h,d,c));
    if(e.actor) {
      assert.ok(actual,diagnostic(h,d,c));assert.equal(actual,identity,'the physical object cannot be cloned at a relay boundary');
      assert.equal(actual.w,44);assert.equal(actual.h,92);assert.equal(actual.y,532);
      const owners=allBodies(h,c);assert.equal(owners.size,1,diagnostic(h,d,c));assert.ok(owners.has(actual));
      assert.ok(normalizeNpcStationRelaysV166(h.getSnapshot().npcStationRelaysV166).routes[d.id].actor,
        'every active phase must round-trip through its real Save normalizer');
      phases.add(e.actor.stage);if(e.actor.lift)phases.add('lift:'+e.actor.lift.phase);
      if(e.localOwner) {
        assert.equal(h.getNpcServiceActorV161(c.localRouteId),actual,'the actual factory Symbol owns the same transported body');
        assert.ok(local);phases.add('local:'+local.stage);
        assert.equal(local.x,actual.x);assert.equal(local.y,actual.y);assert.equal(local.roomId,actual.roomId);
      }
      if(prior?.entry.actor) {
        const p=prior.entry.actor,s=e.actor,dt=1/rate;
        if(e.localOwner&&!prior.entry.localOwner) {
          adoptions++;assert.equal(prior.actual.roomId,c.workRoomId);assert.equal(prior.actual.y,532);
          assert.ok(Math.abs(prior.actual.x-e.workBookmark.x)<=27*dt+.26,'work bookmark was physically reached');
        }
        if(!e.localOwner&&prior.entry.localOwner) {
          releases++;assert.equal(actual.roomId,c.workRoomId);assert.ok(Math.abs(actual.x-e.workBookmark.x)<.26);
        }
        if(s.deck!==p.deck) {
          assert.equal(p.lift?.phase,'travel');assert.equal(s.lift?.phase,'opening');
          assert.equal(s.distance,p.distance,'covered carriage changes chart, never walking distance');deckChanges++;
        } else if(actual.roomId===prior.actual.roomId||HUB_DECKS[s.deck].rooms.some(r=>r.id===actual.roomId)
          &&HUB_DECKS[p.deck].rooms.some(r=>r.id===prior.actual.roomId)) {
          assert.ok(Math.abs(actual.x-prior.actual.x)<=27*dt+.00001,'one physical body cannot be advanced twice in the same frame');
          if(actual.roomId!==prior.actual.roomId) {
            const left=Math.min(actual.x,prior.actual.x)+22,right=Math.max(actual.x,prior.actual.x)+22;
            const crossed=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,s.deck).filter(door=>!door.lift&&door.x>=left&&door.x<=right);
            for(const door of crossed)assert.ok(s.bulkheadProgress[door.id]>=.82,
              'crossing a native main-room bulkhead still requires its physical aperture to be open');
          }
        } else {
          assert.ok(e.localOwner&&prior.entry.localOwner,JSON.stringify({
            reason:'only the real local owner can change to/from its annex chart',
            prior,current:{actual:nativeBookmark(actual),entry:e,local}}));
          assert.equal(prior.local.stage,'covering');assert.equal(local.stage,'revealing');assert.equal(local.doorProgress,0);
        }
        if(e.localOwner&&prior.entry.localOwner&&local&&prior.local) {
          assert.ok(local.time-prior.local.time<=dt+.000001,'the local owner clock advances once, not once per relay');
          assert.ok(local.distance-prior.local.distance<=27*dt+.00001||local.roomId!==prior.local.roomId);
        }
        assert.ok(s.time-p.time<=dt+.000001,'relay clock advances once per physical update');
      }
      const key=e.localOwner?'local:'+local.stage:e.actor.stage==='lift'?'lift:'+e.actor.lift.phase:e.actor.stage;
      if(recordSaves&&!checkpoints.has(key)) {
        h.persist();checkpoints.set(key,{save:structuredClone(h.persisted.at(-1)),entry:structuredClone(e),actual:nativeBookmark(actual)});
      }
      prior={entry:structuredClone(e),actual:nativeBookmark(actual),local:local?structuredClone(local):null};
    }
    if(done(e,local,actual))return{entry:e,actual,phases,checkpoints,deckChanges,adoptions,releases};
    h.update(1/rate);
  }
  assert.fail('The complete physical journey did not reach its real destination: '+diagnostic(h,d,c));
}

for(const c of stationDefinitions) {
  test(c.crewId+': observed05h station, real carriage, actual work bookmark, one local circuit and complete return preserve one body',()=>{
    const d=definition(c),h=runtime(5,{deck:c.stationDeck,roomId:c.stationRoomId});
    const original=h.npcs.find(a=>a.crewId===c.crewId);assert.ok(original,'observe the native station body before changing its watch');
    const station=nativeBookmark(original);assert.equal(station.roomId,c.stationRoomId);assert.equal(station.y,532);
    assert.equal(body(h,d),original);assert.equal(entry(h,d.id).actor.stage,'station');
    context(h,9);assert.equal(body(h,d),original);
    const out=traceUntil(h,d,c,(e,local)=>e.localOwner&&local?.roomId===c.annexRoomId&&local.stage==='service',
      {identity:original,recordSaves:true});
    assert.equal(out.entry.stationOrigin.x,station.x);assert.equal(out.entry.stationOrigin.roomId,station.roomId);
    assert.equal(out.entry.workBookmark.roomId,c.workRoomId);assert.equal(out.entry.workBookmark.y,532);
    assert.equal(out.entry.actor.liftJourneys,1);assert.equal(out.deckChanges,1);assert.equal(out.adoptions,1);
    assert.equal(localState(h,c).crossings,1);assert.equal(localState(h,c).arrivals,1);
    for(const phase of['lift:boarding','lift:closing','lift:travel','lift:opening','lift:exiting',
      'walking-workpost','local:opening','local:covering','local:revealing','local:service'])assert.ok(out.phases.has(phase),phase);
    assert.equal(h.adoptNpcServicePhysicalOwnerV166(c.localRouteId,{...original},
      {ownerId:d.id,workBookmark:out.entry.workBookmark}),false,'adoption cannot replace a real Symbol owner with a clone');
    assert.equal(h.releaseNpcServicePhysicalOwnerV166(c.localRouteId,original,{ownerId:'foreign-relay'}),null);
    assert.equal(h.releaseNpcServicePhysicalOwnerV166(c.localRouteId,original,{ownerId:d.id}),null,
      'an actor still in the annex cannot be restituted to a transport at its distant work bookmark');
    assert.equal(h.getNpcServiceActorV161(c.localRouteId),original);
    h.local=c.annexRoomId;const event=h.interactWithAnnexNpcV141(original);
    assert.equal(event.crewId,c.crewId);assert.equal(event.roomId,c.annexRoomId);assert.equal(body(h,d),original);
    h.local=null;context(h,12);
    const back=traceUntil(h,d,c,e=>Boolean(e.returned),{identity:original});
    assert.equal(back.entry.returned.x,station.x);assert.equal(back.entry.returned.y,station.y);
    assert.equal(back.entry.returned.roomId,station.roomId);assert.equal(back.entry.returned.observedTravel,true);
    assert.equal(back.entry.returned.liftJourneys,2);assert.equal(back.entry.returned.localCrossings,2);assert.equal(back.deckChanges,1);
    assert.equal(h.getNpcServiceActorV161(c.localRouteId),null,'the old local Symbol cannot retain a second body after station restitution');
    assert.equal(original.roomId,station.roomId);assert.equal(original.x,station.x);assert.equal(original.y,station.y);
    assert.equal(body(h,d),original);assert.equal(back.entry.actor.stage,'returned');
    assert.equal(h.createNpcs(c.stationDeck).find(a=>a.crewId===c.crewId),original,
      'station restitution publishes the same real body, not an orphaned memory object');
    assert.equal(allBodies(h,c).size,1);
  });

  test(c.crewId+': every actual transport and local door phase rehydrates one owner at the exact saved support and continues',()=>{
    const d=definition(c),h=runtime(5,{deck:c.stationDeck,roomId:c.stationRoomId});context(h,9);
    const out=traceUntil(h,d,c,(e,local)=>e.localOwner&&local?.roomId===c.annexRoomId&&local.stage==='service',
      {recordSaves:true});
    for(const key of['lift:boarding','lift:closing','lift:travel','lift:opening','lift:exiting',
      'walking-workpost','local:opening','local:covering','local:revealing','local:service'])assert.ok(out.checkpoints.has(key),key);
    for(const [phase,checkpoint] of out.checkpoints) {
      const resumed=runtime(9,checkpoint.save),e=entry(resumed,d.id),restored=body(resumed,d);
      assert.deepEqual(e.actor,checkpoint.entry.actor,'transport/local ledger must resume exactly: '+phase);
      assert.deepEqual(e.stationOrigin,checkpoint.entry.stationOrigin);assert.deepEqual(e.workBookmark,checkpoint.entry.workBookmark);
      assert.equal(e.localOwner,checkpoint.entry.localOwner);assert.deepEqual(nativeBookmark(restored),checkpoint.actual);
      assert.equal(allBodies(resumed,c).size,1);
      if(e.localOwner)assert.equal(resumed.getNpcServiceActorV161(c.localRouteId),restored);
      const stage=e.localOwner?localState(resumed,c).stage:e.actor.stage==='lift'?'lift:'+e.actor.lift.phase:e.actor.stage;
      if(stage==='service')continue;
      traceUntil(resumed,d,c,(next,local)=>{
        const current=next.localOwner?local.stage:next.actor?.stage==='lift'?'lift:'+next.actor.lift.phase:next.actor?.stage;
        return current!==stage;
      },{seconds:300,identity:restored});
    }
  });

  test(c.crewId+': observed05h station is retained by the native strategy Save before09h rather than replaced with a sampled work body',()=>{
    const d=definition(c),h=runtime(5,{deck:c.stationDeck,roomId:c.stationRoomId}),original=body(h,d);
    assert.ok(original);const origin=nativeBookmark(original);h.persist();
    const saved=h.persisted.at(-1);assert.equal(saved.npcStationRelaysV166.routes[d.id].stationOrigin.x,origin.x);
    const resumed=runtime(9,saved),e=entry(resumed,d.id),restored=body(resumed,d);
    assert.ok(restored);assert.equal(restored.roomId,origin.roomId);assert.equal(restored.x,origin.x);assert.equal(restored.y,origin.y);
    assert.equal(e.actor.liftJourneys,0);assert.equal(e.actor.distance,0);assert.equal(e.stationOrigin.x,origin.x);
    assert.equal(allBodies(resumed,c).size,1);assert.equal(resumed.getNpcServiceActorV161(c.localRouteId),null);
  });

  test(c.crewId+': return saves after local release, inside the homeward carriage and on the station floor restore no zombie local owner',()=>{
    const d=definition(c),h=runtime(5,{deck:c.stationDeck,roomId:c.stationRoomId});context(h,9);
    traceUntil(h,d,c,(e,local)=>e.localOwner&&local?.roomId===c.annexRoomId&&local.stage==='service');
    context(h,12);
    const back=traceUntil(h,d,c,e=>Boolean(e.returned),{recordSaves:true});
    for(const phase of['walking-lift','lift:travel','walking-home']) {
      const checkpoint=back.checkpoints.get(phase);assert.ok(checkpoint,phase);
      assert.equal(checkpoint.entry.localOwner,false);assert.equal(checkpoint.entry.localState,null);
      assert.equal(checkpoint.entry.actor.direction,'return');assert.equal(checkpoint.entry.actor.localCrossings,2);
      const savedLocal=checkpoint.save.npcAnnexWorkpostRoutesV165.routes[c.localRouteId];
      assert.equal(savedLocal.actor,null,'the actual local Symbol must be empty before saving '+phase);
      const resumed=runtime(12,checkpoint.save),e=entry(resumed,d.id),restored=body(resumed,d);
      assert.ok(restored);assert.deepEqual(e.actor,checkpoint.entry.actor);assert.deepEqual(e.stationOrigin,checkpoint.entry.stationOrigin);
      assert.deepEqual(e.workBookmark,checkpoint.entry.workBookmark);assert.deepEqual(nativeBookmark(restored),checkpoint.actual);
      assert.equal(e.localOwner,false);assert.equal(e.localState,null);assert.equal(resumed.getNpcServiceActorV161(c.localRouteId),null);
      assert.equal(allBodies(resumed,c).size,1);assert.ok(allBodies(resumed,c).has(restored));
      // An arrival courtesy, if still active at this genuine checkpoint,
      // keeps its observed peer bookmark and distance across the same Save.
      const savedCourtesy=(checkpoint.save.npcServiceTrafficV163?.actors||[]).filter(a=>a.ownerCrewId===c.crewId);
      const restoredCourtesy=resumed.getSnapshot().npcServiceTrafficV163.actors;
      for(const savedPeer of savedCourtesy) {
        assert.deepEqual(restoredCourtesy.find(a=>a.crewId===savedPeer.crewId),savedPeer);
        const peer=resumed.getNpcServiceTrafficActorsV163().find(a=>a.crewId===savedPeer.crewId);
        assert.ok(peer,JSON.stringify({reason:'a validated saved courtesy requires its real restored physical body',phase,
          savedCourtesy:savedPeer,currentTraffic:resumed.getSnapshot().npcServiceTrafficV163,
          routine:resumed.npcRoutineResolutionsV62?.get(savedPeer.crewId),relay:entry(resumed,d.id),
          bodyMap:[...(resumed.npcTrafficBodiesV163?.values()||[])].map(a=>({crewId:a.crewId,roomId:a.roomId,x:a.x,y:a.y})),
          peerCaches:[...(resumed.npcTrafficPeersV163?.entries()||[])].map(([deck,cache])=>({deck,key:cache.key,
            actors:cache.actors.map(a=>({crewId:a.crewId,roomId:a.roomId,x:a.x,y:a.y,routineKey:a.routineDeterministicKeyV62}))})),
          owners:resumed.getNpcServiceOwnedActorsV163().map(a=>({crewId:a.crewId,roomId:a.roomId,x:a.x,y:a.y})),
          visible:resumed.npcs.map(a=>({crewId:a.crewId,roomId:a.roomId,x:a.x,y:a.y}))}));
        assert.equal(peer.x,savedPeer.x);assert.equal(peer.y,532);assert.equal(peer.roomId,savedPeer.roomId);
      }
      const completed=traceUntil(resumed,d,c,next=>Boolean(next.returned),{identity:restored});
      assert.equal(completed.entry.returned.x,checkpoint.entry.stationOrigin.x);
      assert.equal(completed.entry.returned.y,532);assert.equal(completed.entry.returned.roomId,c.stationRoomId);
      assert.equal(completed.entry.returned.liftJourneys,2);assert.equal(completed.entry.returned.localCrossings,2);
      assert.equal(completed.entry.returned.observedTravel,true);assert.equal(body(resumed,d),restored);
      assert.equal(resumed.getNpcServiceActorV161(c.localRouteId),null);
      assert.equal(resumed.createNpcs(c.stationDeck).find(a=>a.crewId===c.crewId),restored);
    }
  });

  test(c.crewId+': an actually occupied annex arrival and a paused engine cannot transfer, clone or advance either owner',()=>{
    const d=definition(c),h=runtime(5,{deck:c.stationDeck,roomId:c.stationRoomId});context(h,9);
    const original=body(h,d);
    traceUntil(h,d,c,(e,local)=>e.localOwner&&local?.stage==='opening',{identity:original});
    const route=HUB_NPC_ANNEX_WORKPOST_ROUTES_V165.find(r=>r.definition.id===c.localRouteId);
    const passage=route.passage(original,c.annexRoomId);assert.ok(passage);
    h.local=c.annexRoomId;h.player={...passage.arrival,alive:true};
    const source=nativeBookmark(original);tick(h,2);
    assert.equal(localState(h,c).reason,'occupied');assert.equal(localState(h,c).crossings,0);
    assert.equal(original.roomId,c.workRoomId);assert.equal(original.x,source.x);assert.equal(body(h,d),original);
    const before=structuredClone(entry(h,d.id)),localBefore=structuredClone(localState(h,c));h.running=false;tick(h,2);
    assert.deepEqual(entry(h,d.id),before);assert.deepEqual(localState(h,c),localBefore);
    h.running=true;h.local=null;h.player={x:5000,y:532,w:44,h:92,alive:true};
    traceUntil(h,d,c,(e,local)=>e.localOwner&&local?.roomId===c.annexRoomId&&local.stage==='service',{identity:original});
    assert.equal(localState(h,c).crossings,1);
  });

  test(c.crewId+': care and mission priorities delegate the real station owner without claiming an observed loop or creating a workpost substitute',()=>{
    for(const extra of[{crew:[{id:c.crewId,health:20,injuries:[]}]},{operation:{crewIds:[c.crewId]}}]) {
      const d=definition(c),h=runtime(5,{deck:c.stationDeck,roomId:c.stationRoomId});assert.ok(body(h,d));
      context(h,9,extra);tick(h,1);
      const e=entry(h,d.id);assert.equal(e.actor,null);assert.equal(e.localOwner,false);assert.equal(e.returned,null);
      assert.equal(e.nativeHandoff.observedTravel,false);assert.equal(h.getNpcServiceActorV161(c.localRouteId),null);
    }
  });

  test(c.crewId+': a native alert before departure cannot manufacture a workpost, carriage or completed station loop',()=>{
    const d=definition(c),h=runtime(5,{deck:c.stationDeck,roomId:c.stationRoomId});
    const original=body(h,d);assert.ok(original);context(h,9,{crisis:{id:'relay-native-alert',active:true}});tick(h,1);
    const e=entry(h,d.id);assert.equal(e.returned,null);assert.equal(e.localOwner,false);
    assert.equal(h.getNpcServiceActorV161(c.localRouteId),null);
    if(e.actor) {
      assert.equal(e.actor.deck,c.stationDeck);assert.equal(e.actor.roomId,c.stationRoomId);
      assert.equal(e.actor.liftJourneys,0);assert.equal(e.actor.lift,null);assert.equal(e.actor.distance,0);
      assert.equal(body(h,d),original);
    } else assert.equal(e.nativeHandoff.observedTravel,false);
  });
}

test('a07h workpost load remains an explicit local initial condition and invents no earlier station transport',()=>{
  for(const c of stationDefinitions) {
    const d=definition(c),h=runtime(7,{deck:c.workDeck,roomId:c.workRoomId}),e=entry(h,d.id);
    assert.equal(e.actor,null);assert.equal(e.stationOrigin,null);assert.equal(e.returned,null);
    const local=h.getNpcServiceActorV161(c.localRouteId);assert.ok(local);assert.equal(local.roomId,c.workRoomId);
    context(h,9);assert.equal(entry(h,d.id).actor,null);assert.equal(entry(h,d.id).returned,null);
    assert.equal(h.getNpcServiceActorV161(c.localRouteId),local);
  }
});

test('Save defaults and migration add strict relay ledgers without accepting a foreign route or schema',()=>{
  const save=createDefaultSave();assert.deepEqual(save.hub.npcStationRelaysV166,normalizeNpcStationRelaysV166());
  const c=stationDefinitions[0],d=definition(c),h=runtime(5,{deck:c.stationDeck,roomId:c.stationRoomId});h.persist();
  const actual=h.persisted.at(-1).npcStationRelaysV166;
  save.hub.npcStationRelaysV166=actual;assert.deepEqual(migrateSave(save).hub.npcStationRelaysV166,normalizeNpcStationRelaysV166(actual));
  const foreign=normalizeNpcStationRelaysV166({schema:165,routes:actual.routes});
  assert.ok(Object.values(foreign.routes).every(e=>e.actor===null&&e.stationOrigin===null));
  assert.equal(normalizeNpcStationRelaysV166({...actual,routes:{...actual.routes,foreign:actual.routes[d.id]}}).routes.foreign,undefined);
});

test('normalization cannot turn a saved station into an unflown work arrival or an unreturned home landing',()=>{
  for(const c of stationDefinitions) {
    const d=definition(c),h=runtime(5,{deck:c.stationDeck,roomId:c.stationRoomId});h.persist();
    const save=h.persisted.at(-1).npcStationRelaysV166,original=save.routes[d.id];
    assert.ok(original.actor);assert.equal(original.actor.liftJourneys,0);
    for(const patch of[{crewId:'crew-other'},{velocity:28},{y:531},{time:-1},{stage:'teleport'},
      {stage:'walking-workpost',deck:c.workDeck,roomId:c.workRoomId,x:d.workGoalX},
      {stage:'walking-home',direction:'return'}, {localCrossings:2,localArrivals:2}]) {
      const forged={...save,routes:{...save.routes,[d.id]:{...original,actor:{...original.actor,...patch}}}};
      assert.equal(normalizeNpcStationRelaysV166(forged).routes[d.id].actor,null,JSON.stringify(patch));
    }
    for(const patch of[{stationOrigin:{...original.stationOrigin,observedHour:7}},
      {localOwner:true},{workBookmark:{crewId:c.crewId,deck:c.workDeck,roomId:c.workRoomId,
        x:d.workGoalX,y:532,source:'actual-walking-arrival'}}]) {
      const forged={...save,routes:{...save.routes,[d.id]:{...original,...patch}}};
      assert.equal(normalizeNpcStationRelaysV166(forged).routes[d.id].actor,null,JSON.stringify(patch));
    }
  }
});

test('both relays and the four V165 passengers share exclusive real cabin reservations without overlapping a second passenger',()=>{
  const h=runtime(5,{deck:0,roomId:'briefing'});
  // Observe the other actual station through the native population factory,
  // preserving its returned object rather than inventing a remote pose.
  assert.ok(h.createNpcs(3).find(a=>a.crewId==='crew-06-rook'));
  context(h,9);
  const seen=new Set(),activePhases=new Set(['boarding','closing','travel','opening','exiting']);let sawExisting=false;
  for(let i=0;i<900*12;i++) {
    const relays=h.getSnapshot().npcStationRelaysV166.routes;
    const actors=[...Object.entries(h.npcInterdeckStateV165.routes).map(([id,e])=>({id,actor:e.actor,legacy:true})),
      ...Object.entries(relays).map(([id,e])=>({id,actor:e.actor,legacy:false}))];
    const occupied=new Map();
    for(const p of actors) {
      const trip=p.actor?.lift;if(!trip||!activePhases.has(trip.phase))continue;
      assert.ok(!occupied.has(trip.shaftId),JSON.stringify({first:occupied.get(trip.shaftId),second:p.id,actors}));
      occupied.set(trip.shaftId,p.id);
      const reservation=h.npcLiftCabinReservationV165(trip.shaftId);
      assert.ok(reservation);assert.equal(reservation.owner,p.id);assert.equal(reservation.crewId,trip.crewId);
      if(p.legacy)sawExisting=true;else seen.add(p.id);
    }
    if(relayDefinitions.every(d=>seen.has(d.id))&&sawExisting
      &&stationDefinitions.every(c=>localState(h,c)?.roomId===c.annexRoomId&&localState(h,c)?.stage==='service'))break;
    h.update(1/12);
  }
  assert.ok(sawExisting,'a real V165 passenger must use the same coordinator in this watch');
  for(const d of relayDefinitions)assert.ok(seen.has(d.id),d.id+' never boarded a real reserved cabin');
});
