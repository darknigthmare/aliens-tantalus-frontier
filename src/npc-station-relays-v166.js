import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from './hub-game.js';
import { HubGame as RosterHubV52 } from './hub-v52-runtime.js';
import { getNpcRoutineStandingAnchorV158 } from './hub-v62-runtime.js';
import { buildHubDoorNetworkV58 } from './topology-coherence-v58.js';
import { getHubBulkheadColliderV134 } from './hub-bulkhead-depth-v134.js';
import { moveNpcAgainstGeometryV136, spreadNpcStationSpawnsV136 } from './npc-life-v136.js';
import { annexNpcDutiesV141 } from './hub-annex-npc-life-v141.js';
import { HUB_NPC_ANNEX_WORKPOST_ROUTES_V165 } from './npc-annex-workpost-routes-v165.js';
import { NPC_INTERDECK_DEFINITIONS_V165, normalizeNpcInterdeckRoutesV165, getNpcInterdeckGeometryV165 } from './npc-interdeck-routes-v165.js';
import { npcLiftSocketV165, normalizeNpcLiftTransitV165, createNpcLiftTransitV165,
  advanceNpcLiftTransitV165, npcLiftPoseV165, npcLiftDurationV165, npcLiftDoorProgressV165 } from './npc-lift-transit-v165.js';
import { getLiftOcclusionV163 } from './hub-lift-transit-v163.js';
import { drawHumanAtlasV133 } from './human-visual-contract-v133.js';
import { HUB_ANNEX_BY_ID_V137 } from './hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from './hub-annex-runtime-geometry-v139.js';

const finite=Number.isFinite, copy=v=>v==null?v:JSON.parse(JSON.stringify(v));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const deckOf=id=>HUB_DECKS.findIndex(d=>d.rooms.some(r=>r.id===id));
const roomAt=(deck,x)=>HUB_DECKS[deck]?.rooms.find(r=>x+22>=r.xStart&&x+22<r.xEnd);
const doorsFor=deck=>buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck).filter(d=>!d.lift);
const doorIds=HUB_DECKS.flatMap((_,deck)=>doorsFor(deck).map(d=>d.id));
const stages=['station','courtesy','walking-lift','waiting-lift','lift','walking-workpost','local','walking-home','returned'];
const reasons=['daily-schedule','occupied','interaction','active-crisis','infestation','medical-recovery','mission-assignment','unavailable'];
export const NPC_STATION_RELAY_DEFINITIONS_V166=Object.freeze([
  {id:'rook-station-relay',crewId:'crew-06-rook',stationDeck:3,stationRoomId:'sensor-array',deck:0,
    parentRoomId:'combat-information',annexRoomId:'cctv',localId:'rook-cctv',shaftId:'hub-aft-lift'},
  {id:'tamsin-station-relay',crewId:'crew-02-tamsin-velez',stationDeck:0,stationRoomId:'briefing',deck:2,
    parentRoomId:'armory',annexRoomId:'proving-ground',localId:'tamsin-proving',shaftId:'hub-midship-lift'}
].map(d=>{
  // Read the native safe work anchor, including its authored door-clearance
  // displacement. This is a goal to walk to, never an instantiated body at
  // the destination: adoption still requires the actual transported object.
  const identity=RosterHubV52.prototype.createNpcs.call({},d.stationDeck).find(a=>a.crewId===d.crewId);
  const room=HUB_DECKS[d.deck].rooms.find(r=>r.id===d.parentRoomId);
  const workGoalX=spreadNpcStationSpawnsV136([{...identity,mobile:false,roomId:d.parentRoomId,
    x:getNpcRoutineStandingAnchorV158(d.crewId,d.parentRoomId,'work')}],[room])[0].x;
  return Object.freeze({...d,workGoalX});
}));
const localRoute=d=>HUB_NPC_ANNEX_WORKPOST_ROUTES_V165.find(r=>r.definition.id===d.localId);
const empty=()=>({actor:null,stationOrigin:null,workBookmark:null,localOwner:false,localState:null,returned:null,nativeHandoff:null,courtesy:null});
const stationCourtesySource='physical-station-courtesy-v166';
const cockpitArrivalX=()=>{const face=getNpcInterdeckGeometryV165('maksim-cockpit').faces.parent;
  return face.opening.x+(face.opening.w-44)/2;};
function normalizeStationCourtesy(d,c,o,a){
  if(!c||d.id!=='tamsin-station-relay'||c.source!==stationCourtesySource
    ||c.routeId!=='maksim-cockpit:deck-0'||c.ownerCrewId!=='crew-08-maksim-orlov'
    ||c.originX!==o.x||c.originRoomId!==o.roomId||c.goalX!==cockpitArrivalX()
    ||!['clearing','holding','returning','returned'].includes(c.phase)
    ||![c.targetX,c.startTime,c.startDistance].every(finite)||c.targetX<24||c.targetX>=c.goalX
    ||c.startTime<0||c.startTime>a.time||c.startDistance<0||c.startDistance>a.distance
    ||a.direction!=='outbound'||a.deck!==d.stationDeck||a.x<24||a.x>o.x
    ||a.distance-c.startDistance+1e-6<Math.abs(a.x-o.x)
    ||(c.phase==='returned'?a.stage!=='station'||a.x!==o.x||a.velocity!==0:a.stage!=='courtesy')
    ||c.phase==='holding'&&(a.x!==c.targetX||a.velocity!==0))return null;
  const slot=(c.goalX-c.targetX)/68;
  if(slot<1||slot>16||Math.abs(slot-Math.round(slot))>1e-8)return null;
  return{source:stationCourtesySource,routeId:c.routeId,ownerCrewId:c.ownerCrewId,originX:o.x,originRoomId:o.roomId,
    goalX:c.goalX,targetX:c.targetX,phase:c.phase,startTime:c.startTime,startDistance:c.startDistance};
}
const normalizeDoors=value=>value&&typeof value==='object'&&!Array.isArray(value)
  &&Object.entries(value).every(([id,p])=>doorIds.includes(id)&&finite(p)&&p>=0&&p<=1)
  ?Object.fromEntries(doorIds.map(id=>[id,value[id]||0])):null;
function stationOrigin(d,o){const r=HUB_DECKS[d.stationDeck].rooms.find(r=>r.id===d.stationRoomId);
  return o?.crewId===d.crewId&&o.deck===d.stationDeck&&o.roomId===d.stationRoomId&&o.y===532
    &&finite(o.x)&&o.x>=r.xStart+24&&o.x<=r.xEnd-68&&[-1,1].includes(o.facing)
    &&o.source==='observed-native-station-before-watch'&&finite(o.observedHour)&&o.observedHour>=0&&o.observedHour<6
    ?{crewId:d.crewId,deck:o.deck,roomId:o.roomId,x:o.x,y:532,facing:o.facing,source:o.source,observedHour:o.observedHour}:null;
}
function workBookmark(d,b){return b?.crewId===d.crewId&&b.deck===d.deck&&b.roomId===d.parentRoomId
  &&b.x===d.workGoalX&&b.y===532&&b.source==='actual-walking-arrival'
  ?{crewId:d.crewId,deck:d.deck,roomId:d.parentRoomId,x:b.x,y:532,source:b.source}:null;}
export function normalizeNpcStationRelaysV166(value){
  const routes={};
  for(const d of NPC_STATION_RELAY_DEFINITIONS_V166){
    const raw=value?.schema===166?value.routes?.[d.id]:null,o=stationOrigin(d,raw?.stationOrigin),a=raw?.actor;
    routes[d.id]=empty();if(!o||!a){
      const h=raw?.nativeHandoff;
      if(o&&h?.crewId===d.crewId&&h.observedTravel===false
        &&(deckOf(h.fromRoomId)>=0||h.fromRoomId===d.annexRoomId)
        &&['medical-recovery','mission-assignment','unavailable'].includes(h.reason))
        routes[d.id]={...empty(),stationOrigin:o,workBookmark:workBookmark(d,raw.workBookmark),nativeHandoff:{crewId:d.crewId,
          fromRoomId:h.fromRoomId,toRoomId:h.toRoomId||null,reason:h.reason,observedTravel:false}};
      continue;
    }
    const w=raw.workBookmark==null?null:workBookmark(d,raw.workBookmark);
    const courtesy=normalizeStationCourtesy(d,raw.courtesy,o,a);
    if(raw.courtesy!=null&&!courtesy||a.stage==='courtesy'&&!courtesy)continue;
    if(raw.workBookmark!=null&&!w||typeof raw.localOwner!=='boolean'||!stages.includes(a.stage)||!reasons.includes(a.reason)
      ||a.crewId!==d.crewId||![d.stationDeck,d.deck].includes(a.deck)||!['outbound','return'].includes(a.direction)
      ||![a.x,a.y,a.velocity,a.time,a.distance,a.localDistance,a.localTime].every(finite)
      ||a.y!==532||a.x<24||a.x>(a.roomId===d.annexRoomId?getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[d.annexRoomId]).world.width:HUB_WORLD.width)-68
      ||Math.abs(a.velocity)>27.000001||a.time<0||a.time>1e9||a.distance<0||a.distance>1e9
      ||a.localDistance<0||a.localDistance>1e9||a.localTime<0||a.localTime>1e9||![-1,1].includes(a.facing)
      ||typeof a.returnRequested!=='boolean'||!Number.isInteger(a.liftJourneys)||a.liftJourneys<0||a.liftJourneys>2
      ||!Number.isInteger(a.localCrossings)||a.localCrossings<0||a.localCrossings>1e6
      ||!Number.isInteger(a.localArrivals)||a.localArrivals<0||a.localArrivals>1e6||!normalizeDoors(a.bulkheadProgress)
      ||raw.localOwner!==(a.stage==='local'))continue;
    const l=raw.localOwner?localRoute(d).normalize(raw.localState):null;
    if(raw.localOwner&&(!w||!l?.actor||l.actor.homeX!==w.x||l.actor.x!==a.x||l.actor.y!==a.y
      ||l.actor.roomId!==a.roomId||l.actor.time!==a.localTime||l.actor.distance!==a.localDistance
      ||l.actor.crossings!==a.localCrossings||l.actor.arrivals!==a.localArrivals||a.deck!==d.deck))continue;
    if(!raw.localOwner&&(raw.localState!=null||roomAt(a.deck,a.x)?.id!==a.roomId))continue;
    const lift=a.lift?normalizeNpcLiftTransitV165(a.lift):null;
    if(a.stage==='lift'){
      if(!lift||lift.crewId!==d.crewId||lift.shaftId!==d.shaftId
        ||lift.fromDeck!==(a.direction==='outbound'?d.stationDeck:d.deck)
        ||lift.toDeck!==(a.direction==='outbound'?d.deck:d.stationDeck))continue;
      const p=npcLiftPoseV165(lift);if(p.x!==a.x||p.y!==a.y||p.deck!==a.deck)continue;
    }else if(a.lift)continue;
    const afterCarriage=lift&&['opening','exiting'].includes(lift.phase);
    const expectedJourneys=a.stage==='lift'?(a.direction==='outbound'?Number(afterCarriage):1+Number(afterCarriage))
      :['walking-workpost','local'].includes(a.stage)?1:['walking-home','returned'].includes(a.stage)?2
        :a.direction==='return'?1:0;
    if(a.liftJourneys!==expectedJourneys||a.stage==='local'&&a.direction!=='outbound'
      ||a.stage==='station'&&a.direction!=='outbound'||a.stage==='returned'&&a.direction!=='return'
      ||a.direction==='return'&&(!w||a.localCrossings<2||a.localArrivals<2))continue;
    if(a.direction==='outbound'&&a.stage!=='local'&&(w||a.localCrossings!==0||a.localArrivals!==0
      ||a.localDistance!==0||a.localTime!==0))continue;
    if(['station','returned'].includes(a.stage)&&(a.deck!==o.deck||a.roomId!==o.roomId||a.x!==o.x||a.velocity!==0))continue;
    if(a.stage==='walking-workpost'&&(a.direction!=='outbound'||a.deck!==d.deck))continue;
    if(a.stage==='walking-home'&&(a.direction!=='return'||a.deck!==o.deck))continue;
    if(['walking-lift','waiting-lift'].includes(a.stage)&&a.deck===(a.direction==='outbound'?d.deck:o.deck))continue;
    if(a.stage==='waiting-lift'&&(a.velocity!==0||Math.abs(a.x-(npcLiftSocketV165(a.deck,d.shaftId).x-22))!==96))continue;
    let returned=null;
    if(a.stage==='returned'){
      const r=raw.returned;
      if(!w||!r||r.crewId!==d.crewId||r.deck!==o.deck||r.roomId!==o.roomId||r.x!==o.x||r.y!==532
        ||r.observedTravel!==true||r.liftJourneys!==2||r.localCrossings!==a.localCrossings||r.localCrossings<2
        ||r.distance!==a.distance||a.liftJourneys!==2||a.localArrivals<2)continue;
      returned={crewId:d.crewId,deck:o.deck,roomId:o.roomId,x:o.x,y:532,liftJourneys:2,
        localCrossings:r.localCrossings,distance:r.distance,observedTravel:true};
    }
    routes[d.id]={actor:{crewId:d.crewId,deck:a.deck,roomId:a.roomId,x:a.x,y:532,velocity:a.velocity,facing:a.facing,
      stage:a.stage,direction:a.direction,reason:a.reason,time:a.time,distance:a.distance,liftJourneys:a.liftJourneys,
      localDistance:a.localDistance,localTime:a.localTime,localCrossings:a.localCrossings,localArrivals:a.localArrivals,
      returnRequested:a.returnRequested,lift,bulkheadProgress:normalizeDoors(a.bulkheadProgress)},
      stationOrigin:o,workBookmark:w,localOwner:raw.localOwner,localState:l,returned,nativeHandoff:null,courtesy};
  }
  const shafts=new Map();for(const[d,e]of Object.entries(routes))if(e.actor?.lift){const id=e.actor.lift.shaftId;
    if(!shafts.has(id))shafts.set(id,[]);shafts.get(id).push(d);}
  for(const ids of shafts.values())if(ids.length>1)for(const id of ids)routes[id]=empty();
  return{schema:166,routes};
}

/** Cross-version restored reservations are rejected together. No restore
 * order is allowed to select one of two bodies inside the same cabin. */
export function normalizeNpcSharedLiftOwnersV166(hub={}){
  const relays=normalizeNpcStationRelaysV166(hub.npcStationRelaysV166),interdeck=normalizeNpcInterdeckRoutesV165(hub.npcInterdeckRoutesV165);
  for(const e of Object.values(relays.routes))if(e.actor?.lift){
    const collisions=Object.values(interdeck.routes).filter(old=>old.actor?.lift?.shaftId===e.actor.lift.shaftId);
    if(collisions.length){Object.assign(e,empty());for(const old of collisions)Object.assign(old,{actor:null,origin:null,retained:null,returned:null,nativeHandoff:null,admissionReady:true});}
  }
  return{npcStationRelaysV166:relays,npcInterdeckRoutesV165:interdeck};
}
function walk(a,body,goal,dt,peers,player,doors){
  const initial=a.x,s={...a},bodies=[...peers,...(player?[player]:[])].filter(p=>p!==body&&p.crewId!==body.crewId
    &&p.alive!==false&&deckOf(p.roomId)===a.deck&&p.y===532);
  const boxes=[...buildHubObstacleGeometryV87(a.deck),...doors.filter(d=>d.progress<.82).map(getHubBulkheadColliderV134),
    ...bodies.map(p=>({x:p.x-12,y:p.y,w:p.w+24,h:p.h}))];
  for(let remaining=dt;remaining>1e-8;){const step=Math.min(1/120,remaining);remaining-=step;
    const desired=Math.sign(goal-s.x)*Math.min(27,Math.sqrt(2*92*Math.max(0,Math.abs(goal-s.x)-.02)));
    const v=s.velocity+clamp(desired-s.velocity,-92*step,92*step);
    const proposed=clamp(s.x+(s.velocity+v)*.5*step,Math.min(s.x,goal),Math.max(s.x,goal));
    const moved=moveNpcAgainstGeometryV136({...body,x:s.x,y:532},proposed,boxes);s.x=moved.x;s.velocity=moved.blocked?0:v;
  }
  if(Math.abs(s.x-goal)<.1){const snap=moveNpcAgainstGeometryV136({...body,x:s.x,y:532},goal,boxes);if(!snap.blocked&&snap.x===goal){s.x=goal;s.velocity=0;}}
  s.distance+=Math.abs(s.x-initial);s.actualVelocity=(s.x-initial)/dt;if(s.x!==initial)s.facing=Math.sign(s.x-initial);
  s.roomId=roomAt(s.deck,s.x)?.id||s.roomId;s.reason=Math.abs(s.x-initial)<1e-8&&s.x!==goal?'occupied':'daily-schedule';return s;
}
function initial(d,body,hour,doors){
  const origin={crewId:d.crewId,deck:d.stationDeck,roomId:d.stationRoomId,x:body.x,y:532,facing:body.facing===-1?-1:1,
    source:'observed-native-station-before-watch',observedHour:hour};
  return{...empty(),stationOrigin:origin,actor:{crewId:d.crewId,deck:d.stationDeck,roomId:d.stationRoomId,
    x:body.x,y:532,facing:origin.facing,velocity:0,stage:'station',direction:'outbound',reason:'daily-schedule',time:0,
    distance:0,liftJourneys:0,localDistance:0,localTime:0,localCrossings:0,localArrivals:0,returnRequested:false,lift:null,
    bulkheadProgress:Object.fromEntries(doors.flatMap(ds=>ds.map(d=>[d.id,d.progress||0])))}};
}

export function withHubNpcStationRelaysV166(Base){return class HubNpcStationRelaysV166 extends Base{
  start(save={},options={}){
    this.npcStationRelaySandboxV166=Boolean(options.editorProject||options.forgeJourneyV141||this.forgeSessionV141);
    const coordinated=normalizeNpcSharedLiftOwnersV166(this.npcStationRelaySandboxV166?{}:save);
    this.npcStationRelaysStateV166=coordinated.npcStationRelaysV166;this.npcStationRelayBodiesV166=new Map();
    for(const d of NPC_STATION_RELAY_DEFINITIONS_V166){const e=this.npcStationRelaysStateV166.routes[d.id];
      if(e.localOwner){const saved=localRoute(d).normalize(save.npcAnnexWorkpostRoutesV165?.routes?.[d.localId]);
        if(JSON.stringify(saved)!==JSON.stringify(e.localState))this.npcStationRelaysStateV166.routes[d.id]=empty();}}
    this.npcStationRelayDoorsV166=HUB_DECKS.map((_,deck)=>doorsFor(deck).map(door=>({...door,
      progress:Math.max(0,...Object.values(this.npcStationRelaysStateV166.routes).map(e=>e.actor?.bulkheadProgress[door.id]||0))})));
    this.npcStationRelayRestoringV166=true;
    const result=super.start({...save,...coordinated,npcStationRelaysV166:this.npcStationRelaysStateV166},options);
    this.prepareNpcStationRelaysV166();this.npcStationRelayRestoringV166=false;
    // An active off-screen courtesy is a physical body, not just a saved
    // reservation. Reconcile every saved chart before publishing the resumed
    // world; this uses the existing strict native-origin restoration and
    // spends neither a movement step nor an extra owner update.
    for(const deck of new Set((this.npcTrafficStateV163?.actors||[]).map(a=>a.deck)))
      this.getNpcServicePeersV163?.(deck);
    // Initial off-screen populations are instantiated at their actual initial
    // clock, before any watch change. They become the one retained body.
    if(!this.npcStationRelaySandboxV166&&(this.npcRoutineContextV62?.clock?.hour??24)<6)
      for(const deck of new Set(NPC_STATION_RELAY_DEFINITIONS_V166.map(d=>d.stationDeck)))if(deck!==this.state?.deck)this.createNpcs(deck);
    this.syncNpcStationRelayDoorsV166();this.publishNpcStationRelaysV166();return result;
  }
  syncNpcStationRelayDoorsV166(){
    if(!this.state||!this.doorStates||this.npcStationRelayVisibleDoorsV166===this.doorStates)return;
    for(const actual of this.doorStates){const saved=this.npcStationRelayDoorsV166?.[this.state.deck]?.find(d=>d.id===actual.id);
      if(saved)actual.progress=Math.max(actual.progress||0,saved.progress||0);}
    this.npcStationRelayVisibleDoorsV166=this.doorStates;
  }
  getNpcStationRelayActorV166(id){return this.npcStationRelayBodiesV166?.get(id)||null;}
  getNpcStationRelayActorsV166(deck=null){return NPC_STATION_RELAY_DEFINITIONS_V166.map(d=>this.getNpcStationRelayActorV166(d.id))
    .filter(a=>a&&(deck==null||deckOf(a.roomId)===deck));}
  hubNpcLeaseOwnerV163(crewId){const d=NPC_STATION_RELAY_DEFINITIONS_V166.find(d=>d.crewId===crewId),e=d&&this.npcStationRelaysStateV166?.routes[d.id];
    return e?.actor&&!e.localOwner?d.id:super.hubNpcLeaseOwnerV163?.(crewId)||null;}
  getNpcServiceOwnedActorsV163(){return[...new Map([...(super.getNpcServiceOwnedActorsV163?.()||[]),...this.getNpcStationRelayActorsV166()].map(a=>[a.crewId,a])).values()];}
  observeNpcStationRelaysV166(natives,deck){
    if(this.npcStationRelaySandboxV166||!this.npcStationRelaysStateV166)return;
    const hour=this.npcRoutineContextV62?.clock?.hour;
    if(!finite(hour)||hour>=6)return;
    for(const d of NPC_STATION_RELAY_DEFINITIONS_V166){const e=this.npcStationRelaysStateV166.routes[d.id];
      if(e.actor||deck!==d.stationDeck)continue;const r=this.npcRoutineResolutionsV62?.get(d.crewId);
      const body=natives.find(a=>a.crewId===d.crewId&&a.roomId===d.stationRoomId&&a.y===532&&a.w===44&&a.h===92);
      if(!body||body.alive===false||body.downed||!r||r.alert||r.needsCare||r.missionAssigned)continue;
      this.npcStationRelaysStateV166.routes[d.id]=initial(d,body,hour,this.npcStationRelayDoorsV166);
      this.npcStationRelayBodiesV166.set(d.id,body);body.mobile=false;body.vx=0;body.facing=this.npcStationRelaysStateV166.routes[d.id].actor.facing;
    }
  }
  prepareNpcStationRelaysV166(){
    if(this.npcStationRelaySandboxV166||!this.npcStationRelaysStateV166)return;
    for(const d of NPC_STATION_RELAY_DEFINITIONS_V166){const e=this.npcStationRelaysStateV166.routes[d.id];
      if(!e.actor||this.npcStationRelayBodiesV166.has(d.id))continue;
      if(e.localOwner){const body=this.getNpcServiceActorV161?.(d.localId);
        if(body&&this.adoptNpcServicePhysicalOwnerV166(d.localId,body,{ownerId:d.id,workBookmark:e.workBookmark}))this.npcStationRelayBodiesV166.set(d.id,body);
      }else if(this.npcStationRelayRestoringV166){const body=RosterHubV52.prototype.createNpcs.call({},d.stationDeck).find(a=>a.crewId===d.crewId);
        if(body){this.npcStationRelayBodiesV166.set(d.id,body);this.applyNpcStationRelayPoseV166(body,e.actor);}}
    }
  }
  createNpcs(deck){const natives=super.createNpcs(deck);this.observeNpcStationRelaysV166(natives,deck);this.prepareNpcStationRelaysV166();
    const ids=new Set(this.getNpcStationRelayActorsV166().map(a=>a.crewId));
    return[...natives.filter(a=>!ids.has(a.crewId)),...this.getNpcStationRelayActorsV166(deck)];}
  ensureAnnexNpcCohortV141(){const natives=super.ensureAnnexNpcCohortV141(),actors=this.getNpcStationRelayActorsV166(),ids=new Set(actors.map(a=>a.crewId));
    return[...natives.filter(a=>!ids.has(a.crewId)),...actors.filter(a=>deckOf(a.roomId)<0)];}
  stepHubNpcLifeV136(actor,...args){if(this.getNpcStationRelayActorsV166().includes(actor))return;return super.stepHubNpcLifeV136(actor,...args);}
  tickAnnexNpcLifeV141(delta){const actors=new Set(this.getNpcStationRelayActorsV166()),active=this.activeAnnexNpcsV141;
    this.activeAnnexNpcsV141=()=>active.call(this).filter(a=>!actors.has(a));
    try{return super.tickAnnexNpcLifeV141(delta);}finally{this.activeAnnexNpcsV141=active;}}
  shouldRetainNpcServiceOwnerV165(id,actor,s){const d=NPC_STATION_RELAY_DEFINITIONS_V166.find(d=>d.localId===id),e=d&&this.npcStationRelaysStateV166?.routes[d.id];
    return Boolean(e?.localOwner&&this.getNpcStationRelayActorV166(d.id)===actor)||Boolean(super.shouldRetainNpcServiceOwnerV165?.(id,actor,s));}
  getNpcServicePassingDutyV165(id,actor){const inherited=super.getNpcServicePassingDutyV165?.(id,actor);
    if(typeof inherited==='boolean')return inherited;
    const d=NPC_STATION_RELAY_DEFINITIONS_V166.find(d=>d.localId===id),e=d&&this.npcStationRelaysStateV166?.routes[d.id];
    if(e?.localOwner&&actor===this.getNpcStationRelayActorV166(d.id))return e.actor.localArrivals<1||!e.actor.returnRequested;
    return inherited;}
  npcLiftCabinReservationV165(shaftId){const d=NPC_STATION_RELAY_DEFINITIONS_V166.find(d=>this.npcStationRelaysStateV166?.routes[d.id].actor?.lift?.shaftId===shaftId);
    return d?{owner:d.id,crewId:d.crewId,shaftId,phase:this.npcStationRelaysStateV166.routes[d.id].actor.lift.phase}:super.npcLiftCabinReservationV165?.(shaftId)||null;}
  npcLiftQueueBlockersV165(d,a){const entries=[...NPC_INTERDECK_DEFINITIONS_V165.map(def=>({d:def,e:this.npcInterdeckStateV165?.routes[def.id]})),
    ...NPC_STATION_RELAY_DEFINITIONS_V166.map(def=>({d:def,e:this.npcStationRelaysStateV166?.routes[def.id]}))];
    const own=entries.find(v=>v.d.id===d.id)?.e,dest=a.direction==='outbound'?d.deck:own?.stationOrigin?.deck??own?.origin?.deck;
    return entries.filter(v=>v.d.id!==d.id&&v.d.shaftId===d.shaftId).flatMap(({d:def,e})=>{
      const other=e?.actor;if(!other||e.localOwner||other.stage==='returned'||other.stage==='station'||other.deck!==dest)return[];
      const target=other.direction==='return'?(e.stationOrigin?.deck??e.origin?.deck):def.deck;
      return target===other.deck?[]:[{routeId:def.id,crewId:def.crewId,fromDeck:other.deck,toDeck:target,
        roomId:other.roomId,stage:other.stage,reason:'clear-physical-departure-before-arriving-cabin'}];});}
  applyNpcStationRelayPoseV166(body,a){Object.assign(body,{x:a.x,y:532,roomId:a.roomId,facing:a.facing,vx:a.actualVelocity||0,
    mobile:false,min:a.x,max:a.x,climbing:false,grounded:true,annexNativeV141:false,annexDutyV141:undefined});
    body.lifeV136={schema:136,context:'station-relay-v166',x:a.x,y:532,time:a.time,velocity:a.velocity,actualVelocity:body.vx,
      facing:a.facing,mode:Math.abs(body.vx)>.1?'moving':a.reason==='daily-schedule'?'idle':'blocked',passive:null,previousPassive:null,blend:1};}
  publishNpcStationRelaysV166(){if(!this.state)return;const ids=new Set(this.getNpcStationRelayActorsV166().map(a=>a.crewId));
    this.npcs=[...(this.npcs||[]).filter(a=>!ids.has(a.crewId)),...this.getNpcStationRelayActorsV166(this.state.deck)];}
  hubNpcBulkheadDemandV158(door){return Boolean(super.hubNpcBulkheadDemandV158?.(door)||Object.values(this.npcStationRelaysStateV166?.routes||{})
    .some(e=>e.actor&&!e.localOwner&&!e.actor.lift&&!['station','returned'].includes(e.actor.stage)&&e.actor.deck===door.deckIndex&&Math.abs(e.actor.x+22-door.x)<182));}
  getNpcServiceTrafficIntentsV163(){const inherited=super.getNpcServiceTrafficIntentsV163?.()||[];
    for(const d of NPC_STATION_RELAY_DEFINITIONS_V166){const e=this.npcStationRelaysStateV166?.routes[d.id],a=e?.actor,actor=this.getNpcStationRelayActorV166(d.id);
      if(!a||!actor||e.localOwner||['station','returned','courtesy'].includes(a.stage)||a.lift&&!['boarding','exiting'].includes(a.lift.phase))continue;
      const cabin=npcLiftSocketV165(a.deck,d.shaftId).x-22;
      const yieldGoal=this.getNpcServiceOwnerYieldGoalV165?.(d.id,actor);
      const goalX=finite(yieldGoal)?yieldGoal:a.lift?(a.lift.phase==='boarding'?a.lift.cabinX:a.lift.exitX)
        :a.stage==='walking-workpost'?d.workGoalX:a.stage==='walking-home'?e.stationOrigin.x:a.stage==='waiting-lift'?cabin:cabin+(Math.sign(a.x-cabin)||-1)*96;
      inherited.push({routeId:d.id+':deck-'+a.deck,actor,deck:a.deck,goalX,roomIds:HUB_DECKS[a.deck].rooms.map(r=>r.id),
        minX:24,maxX:HUB_WORLD.width-68,doorIds:doorsFor(a.deck).map(d=>d.id)});
    }return inherited;}
  canPlanNpcServiceOwnerCourtesyV166(intent,peer){
    const e=this.npcStationRelaysStateV166?.routes['tamsin-station-relay'],a=e?.actor;
    const passenger=this.npcInterdeckStateV165?.routes['maksim-cockpit']?.actor;
    if(intent?.routeId!=='maksim-cockpit:deck-0'||intent.deck!==0||intent.goalX!==cockpitArrivalX()
      ||intent.actor!==this.npcInterdeckBodiesV165?.get('maksim-cockpit')
      ||passenger?.stage!=='walking-portal'||passenger.direction!=='outbound'||passenger.deck!==0
      ||peer!==this.getNpcStationRelayActorV166('tamsin-station-relay')||!a||e.localOwner||e.workBookmark
      ||a.deck!==0||a.y!==532||peer.w!==44||peer.h!==92||a.lift||a.liftJourneys!==0
      ||this.hubNpcLeaseOwnerV163(peer.crewId)!=='tamsin-station-relay')return false;
    if(a.stage==='courtesy')return ['clearing','holding'].includes(e.courtesy?.phase)
      &&e.courtesy.routeId===intent.routeId&&e.courtesy.ownerCrewId===intent.actor.crewId;
    return a.stage==='station'&&!annexNpcDutiesV141(this.npcRoutineResolutionsV62,this)
      .some(d=>d.crewId===peer.crewId&&d.roomId==='proving-ground');
  }
  canReserveNpcServiceOwnerCourtesyV166(intent,peer,targetX){
    if(!this.canPlanNpcServiceOwnerCourtesyV166(intent,peer)||!finite(targetX))return false;
    const slot=(intent.goalX-targetX)/68;
    if(targetX<24||slot<1||slot>16||Math.abs(slot-Math.round(slot))>1e-8)return false;
    return [intent.actor,peer].every(body=>{const r=this.npcRoutineResolutionsV62?.get(body.crewId);
      return body.alive!==false&&!body.downed&&body.workClock<=0&&body.supportClock<=0&&r
        &&!r.alert&&!r.missionAssigned&&!r.needsCare;});
  }
  reserveNpcServiceOwnerCourtesyV166(intent,peer,targetX){
    // Called only after V163 admitted the complete ordered plan. It assigns
    // a goal to this owner, never a pose or another movement controller.
    if(!this.canReserveNpcServiceOwnerCourtesyV166(intent,peer,targetX))return false;
    const e=this.npcStationRelaysStateV166.routes['tamsin-station-relay'],a=e.actor;
    const prior=a.stage==='courtesy'?e.courtesy:null;
    e.courtesy={source:stationCourtesySource,routeId:intent.routeId,ownerCrewId:intent.actor.crewId,
      originX:e.stationOrigin.x,originRoomId:e.stationOrigin.roomId,goalX:intent.goalX,targetX,phase:'clearing',
      startTime:prior?.startTime??a.time,startDistance:prior?.startDistance??a.distance};
    e.actor={...a,stage:'courtesy'};
    return true;
  }
  canPreemptNpcServiceCourtesyV165(intent,saved){
    const d=NPC_STATION_RELAY_DEFINITIONS_V166.find(d=>intent?.routeId===d.id+':deck-'+intent.deck&&intent.actor?.crewId===d.crewId);
    // Retarget this owner's existing real courtesy body when the floor goal
    // changes from its waiting mark to the actual boarding corridor. Keep
    // the original body, bookmark, spent distance and routine key intact.
    if(d&&saved?.deck===intent.deck&&saved.ownerCrewId===d.crewId&&saved.routeId===intent.routeId)return true;
    return Boolean(super.canPreemptNpcServiceCourtesyV165?.(intent,saved));
  }
  getNpcServiceArrivalCourtesyGeometryV166(routeId,owner){
    const d=NPC_STATION_RELAY_DEFINITIONS_V166.find(d=>routeId===d.id+':deck-'+d.deck&&owner?.crewId===d.crewId);
    const e=d&&this.npcStationRelaysStateV166?.routes[d.id],s=d&&this.getNpcServicePhysicalStateV165?.(d.localId);
    if(!e?.localOwner||this.getNpcStationRelayActorV166(d.id)!==owner||!e.actor.returnRequested
      ||s?.roomId!==d.annexRoomId||s.crossings!==1)return super.getNpcServiceArrivalCourtesyGeometryV166?.(routeId,owner)||null;
    const face=localRoute(d).faces.parent;
    return{arrival:{x:face.opening.x+(face.opening.w-44)/2,y:532,w:44,h:92},localId:d.localId,deck:d.deck};
  }
  hasNpcServiceArrivalCourtesyGrantV166(saved){
    const d=NPC_STATION_RELAY_DEFINITIONS_V166.find(d=>saved?.routeId===d.id+':deck-'+d.deck&&saved.ownerCrewId===d.crewId);
    return Boolean(d&&this.getNpcServiceArrivalCourtesyGeometryV166(saved.routeId,this.getNpcStationRelayActorV166(d.id)))
      ||Boolean(super.hasNpcServiceArrivalCourtesyGrantV166?.(saved));
  }
  reserveNpcStationRelayArrivalsV166(){
    for(const d of NPC_STATION_RELAY_DEFINITIONS_V166){const e=this.npcStationRelaysStateV166?.routes[d.id],owner=this.getNpcStationRelayActorV166(d.id);
      if(!e?.localOwner||!e.actor.returnRequested||!owner)continue;
      const s=this.getNpcServicePhysicalStateV165?.(d.localId);
      if(!s||s.roomId!==d.annexRoomId||s.crossings!==1)continue;
      const face=localRoute(d).faces.parent,arrival={x:face.opening.x+(face.opening.w-44)/2,y:532,w:44,h:92};
      const peers=this.getNpcServicePeersV163(d.deck,d.crewId);
      for(const peer of peers)if(peer.alive!==false&&overlap(arrival,peer)){
        const direction=peer.x<arrival.x?-1:1;
        this.reserveNpcServiceArrivalCourtesyV166?.({routeId:d.id+':deck-'+d.deck,owner,peer,deck:d.deck,targetX:arrival.x+direction*68});
      }
    }
  }
  update(delta){
    this.syncNpcStationRelayDoorsV166();this.prepareNpcStationRelaysV166();const wasRunning=this.running;
    if(wasRunning&&finite(delta)&&delta>0)this.reserveNpcStationRelayArrivalsV166();
    const before=new Map(NPC_STATION_RELAY_DEFINITIONS_V166.map(d=>[d.id,{body:this.getNpcStationRelayActorV166(d.id),
      local:this.npcStationRelaysStateV166?.routes[d.id]?.localOwner,
      clocks:Object.fromEntries(['workClock','supportClock','alertClock'].map(k=>[k,finite(this.getNpcStationRelayActorV166(d.id)?.[k])?this.getNpcStationRelayActorV166(d.id)[k]:0]))}]));
    const result=super.update(delta);
    if(!wasRunning||!this.running||!finite(delta)||delta<=0||this.npcStationRelaySandboxV166)return result;
    const dt=Math.min(delta,.1);
    const physicalPeers=[...(this.getNpcServiceOwnedActorsV163?.()||[]),
      ...(this.getNpcServiceTrafficActorsV163?.()||[]),...(this.npcs||[])];
    for(let deck=0;deck<HUB_DECKS.length;deck++)for(const door of this.npcStationRelayDoorsV166[deck]){
      const actual=this.state.deck===deck?this.doorStates?.find(d=>d.id===door.id):null;
      const demand=this.hubNpcBulkheadDemandV158({...door,deckIndex:deck});
      if(actual){if(demand)actual.progress+=(1-actual.progress)*Math.min(1,dt*7);door.progress=actual.progress;}
      else door.progress+=(Number(demand)-door.progress)*Math.min(1,dt*7);
      if(this.hubTrainingV132?.lockedDoorIds?.includes(door.id)){
        const collider=getHubBulkheadColliderV134(door);
        const mainPlayer=this.state?.deck===deck&&!this.isAnnexActiveV71?.()&&!this.ventActorV62?this.player:null;
        const occupied=physicalPeers.some(actor=>deckOf(actor.roomId)===deck&&overlap(actor,collider))
          ||Boolean(mainPlayer&&overlap(mainPlayer,collider));
        door.progress=occupied?Math.max(.82,door.progress):0;
        if(actual)actual.progress=door.progress;
      }
    }
    for(const d of NPC_STATION_RELAY_DEFINITIONS_V166){const e=this.npcStationRelaysStateV166.routes[d.id],body=this.getNpcStationRelayActorV166(d.id);if(!e.actor||!body)continue;
      if(!before.get(d.id)?.local&&before.get(d.id)?.body===body)for(const[key,value]of Object.entries(before.get(d.id).clocks))
        body[key]=finite(body[key])&&body[key]>value?body[key]:Math.max(0,value-dt);
      const r=this.npcRoutineResolutionsV62?.get(d.crewId),old=e.actor;
      const priority=!r||body.alive===false||body.downed?'unavailable':r.needsCare?'medical-recovery':r.missionAssigned?'mission-assignment':null;
      const alert=r?.alert?(r.reason==='active-crisis'?'active-crisis':'infestation'):null;
      const watch=annexNpcDutiesV141(this.npcRoutineResolutionsV62,this).some(w=>w.crewId===d.crewId&&w.roomId===d.annexRoomId);
      if(priority&&!old.lift){e.nativeHandoff={crewId:d.crewId,fromRoomId:body.roomId,toRoomId:r?.roomId||null,reason:priority,observedTravel:false};
        e.actor=null;e.localOwner=false;e.localState=null;e.courtesy=null;this.npcStationRelayBodiesV166.delete(d.id);
        this.npcs=(this.npcs||[]).filter(a=>a.crewId!==d.crewId);this.npcs=this.createNpcs(this.state.deck);continue;}
      let a={...old,time:Math.min(1e9,old.time+dt),actualVelocity:0};
      if(!watch&&!['station','returned','courtesy'].includes(a.stage)||priority||alert)a.returnRequested=true;
      if(e.localOwner){const s=this.getNpcServicePhysicalStateV165?.(d.localId);
        if(!s||this.getNpcServiceActorV161(d.localId)!==body)continue;
        a={...a,x:s.x,y:s.y,roomId:s.roomId,facing:s.facing,velocity:0,reason:s.reason,distance:a.distance+Math.max(0,s.distance-a.localDistance),
          localDistance:s.distance,localTime:s.time,localCrossings:s.crossings,localArrivals:s.arrivals};
        e.actor=a;e.localState=localRoute(d).normalize({schema:165,actor:s});
        if(a.returnRequested&&s.crossings>=2&&s.arrivals>=2&&s.stage==='service'&&s.roomId===d.parentRoomId&&s.doorProgress===0){
          const released=this.releaseNpcServicePhysicalOwnerV166(d.localId,body,{ownerId:d.id});
          if(released===body){e.localOwner=false;e.localState=null;e.actor={...a,stage:'walking-lift',direction:'return',velocity:0};}
        }continue;
      }
      if((priority||alert||body.workClock>0||body.supportClock>0)&&!a.lift){e.actor={...a,velocity:0,reason:priority||alert||'interaction'};this.applyNpcStationRelayPoseV166(body,e.actor);continue;}
      const peers=this.getNpcServicePeersV163?.(a.deck,d.crewId)||[],player=!this.ventActorV62&&this.player
        ?{...this.player,roomId:this.currentAnnexV71?.()?.id||(this.state.deck===a.deck?this.state.roomId:null)}:null;
      const yieldGoal=this.getNpcServiceOwnerYieldGoalV165?.(d.id,body),cabin=npcLiftSocketV165(a.deck,d.shaftId).x-22;
      if(a.stage==='courtesy'){
        const c=e.courtesy,p=this.npcInterdeckStateV165?.routes['maksim-cockpit']?.actor;
        // On the return, the passenger is already east of the waiting body.
        // Follow it home while the other ordered courtesy bodies remain west;
        // waiting for its distant lift would reverse their restitution order.
        const returning=!p||p.direction==='return'&&(p.deck!==a.deck
          ||deckOf(p.roomId)===a.deck&&p.x>=a.x+56);
        if(returning)c.phase='returning';
        const goal=c.phase==='returning'?e.stationOrigin.x:c.targetX;
        a=walk(a,body,goal,dt,peers,player,this.npcStationRelayDoorsV166[a.deck]);
        if(a.x===goal){if(c.phase==='returning'){a.stage='station';c.phase='returned';}
          else c.phase='holding';}
        a.bulkheadProgress=Object.fromEntries(this.npcStationRelayDoorsV166.flatMap(ds=>ds.map(d=>[d.id,d.progress||0])));
        e.actor=a;this.applyNpcStationRelayPoseV166(body,a);continue;
      }
      if(a.stage==='station'||a.stage==='returned'){
        if(!watch){e.actor=a;this.applyNpcStationRelayPoseV166(body,a);continue;}
        e.returned=null;e.workBookmark=null;e.courtesy=null;a={...a,stage:'walking-lift',direction:'outbound',returnRequested:false,
          distance:0,liftJourneys:0,localDistance:0,localTime:0,localCrossings:0,localArrivals:0};
      }
      if(a.stage==='walking-lift'){
        const goal=finite(yieldGoal)?yieldGoal:cabin+(Math.sign(a.x-cabin)||-1)*96;
        a=walk(a,body,goal,dt,peers,player,this.npcStationRelayDoorsV166[a.deck]);
        if(a.x===goal&&!finite(yieldGoal))a={...a,stage:'waiting-lift',velocity:0};
      }else if(a.stage==='waiting-lift'){
        if(finite(yieldGoal))a.stage='walking-lift';
        else if(!this.npcLiftCabinReservationV165(d.shaftId)&&this.hubLiftTransitV163?.trip?.shaftId!==d.shaftId
          &&!this.npcLiftQueueBlockersV165(d,a).length&&!this.npcLiftPhysicalOccupancyV165(d,a,a.deck,a.x,cabin)){
          const goalDeck=a.direction==='outbound'?d.deck:e.stationOrigin.deck;
          const destinationX=a.direction==='outbound'?d.workGoalX:e.stationOrigin.x;
          const lift=createNpcLiftTransitV165(body,{fromDeck:a.deck,toDeck:goalDeck,shaftId:d.shaftId,exitDirection:Math.sign(destinationX-cabin)||-1});
          if(lift)a={...a,stage:'lift',lift};
        }else a.reason='occupied';
      }else if(a.stage==='lift'){
        const t=a.lift,current=npcLiftPoseV165(t),next=npcLiftPoseV165({...t,elapsed:Math.min(npcLiftDurationV165(t),t.elapsed+dt)});
        const step=advanceNpcLiftTransitV165(t,dt,{sourceClear:!this.npcLiftPhysicalOccupancyV165(d,a,t.fromDeck,current.x,next.x),
          arrivalClear:!this.npcLiftPhysicalOccupancyV165(d,a,t.toDeck,t.cabinX,t.exitX),
          exitClear:!this.npcLiftPhysicalOccupancyV165(d,a,t.toDeck,current.x,next.x)});
        const pose=step.trip?npcLiftPoseV165(step.trip):step.pose;
        a={...a,lift:step.trip,distance:a.distance+step.walked,reason:step.blocked?'occupied':'daily-schedule'};
        if(pose)Object.assign(a,{x:pose.x,y:pose.y,deck:pose.deck,roomId:npcLiftSocketV165(pose.deck,d.shaftId).roomId,facing:pose.facing});
        a.actualVelocity=step.walked?Math.sign(a.x-old.x)*step.walked/dt:0;
        if(step.handoff)a.liftJourneys++;if(step.complete)a.stage=a.direction==='outbound'?'walking-workpost':'walking-home';
      }else if(a.stage==='walking-workpost'||a.stage==='walking-home'){
        const goal=finite(yieldGoal)?yieldGoal:a.stage==='walking-home'?e.stationOrigin.x:d.workGoalX;
        a=walk(a,body,goal,dt,peers,player,this.npcStationRelayDoorsV166[a.deck]);
        if(a.x===goal&&!finite(yieldGoal)){
          this.applyNpcStationRelayPoseV166(body,a);
          if(a.stage==='walking-workpost'){
            const bookmark={crewId:d.crewId,deck:d.deck,roomId:d.parentRoomId,x:a.x,y:532,source:'actual-walking-arrival'};
            if(this.adoptNpcServicePhysicalOwnerV166(d.localId,body,{ownerId:d.id,workBookmark:bookmark})){
              e.workBookmark=bookmark;e.localOwner=true;a.stage='local';
              const s=this.getNpcServicePhysicalStateV165(d.localId);e.localState=localRoute(d).normalize({schema:165,actor:s});
            }else a.reason='occupied';
          }else{
            a.stage='returned';e.returned={crewId:d.crewId,deck:e.stationOrigin.deck,roomId:e.stationOrigin.roomId,
              x:e.stationOrigin.x,y:532,liftJourneys:a.liftJourneys,localCrossings:a.localCrossings,distance:a.distance,observedTravel:true};
          }
        }
      }
      a.bulkheadProgress=Object.fromEntries(this.npcStationRelayDoorsV166.flatMap(ds=>ds.map(d=>[d.id,d.progress||0])));
      e.actor=a;if(!e.localOwner)this.applyNpcStationRelayPoseV166(body,a);
    }
    this.publishNpcStationRelaysV166();return result;
  }
  drawDoor(ctx,door,...args){const t=NPC_STATION_RELAY_DEFINITIONS_V166.map(d=>this.npcStationRelaysStateV166?.routes[d.id]?.actor?.lift)
    .find(t=>t&&t.shaftId===door.shaftId&&npcLiftPoseV165(t).deck===this.state?.deck);if(door.lift&&t)door.progress=npcLiftDoorProgressV165(t);
    return super.drawDoor(ctx,door,...args);}
  npcStationRelayClipV166(actor){const d=NPC_STATION_RELAY_DEFINITIONS_V166.find(d=>this.getNpcStationRelayActorV166(d.id)===actor),e=d&&this.npcStationRelaysStateV166.routes[d.id],t=e?.actor?.lift;
    if(!t||['boarding','exiting'].includes(t.phase))return null;const door=this.doorStates?.find(v=>v.shaftId===d.shaftId),progress=npcLiftDoorProgressV165(t),m=door&&getLiftOcclusionV163(this,door,progress);
    return m?.opening?{...m.opening,x:m.opening.x+m.opening.w*(1-progress)/2,w:m.opening.w*progress}:null;}
  drawNpcLifeV136(ctx,image,actor,sample,geometry){const clip=this.npcStationRelayClipV166(actor);if(!clip)return super.drawNpcLifeV136(ctx,image,actor,sample,geometry);
    ctx.save();ctx.beginPath();ctx.rect(clip.x,clip.y,clip.w,clip.h);ctx.clip();try{super.drawNpcLifeV136(ctx,image,actor,sample,geometry)||drawHumanAtlasV133(ctx,image,geometry);}finally{ctx.restore();}return true;}
  drawSheetCell(ctx,image,...args){const actor=this.getNpcStationRelayActorsV166().find(a=>this.npcImageCrewIds?.get(image)===a.crewId&&this.npcs?.includes(a));
    const clip=actor&&this.npcStationRelayClipV166(actor);if(!clip)return super.drawSheetCell(ctx,image,...args);
    ctx.save();ctx.beginPath();ctx.rect(clip.x,clip.y,clip.w,clip.h);ctx.clip();try{return super.drawSheetCell(ctx,image,...args);}finally{ctx.restore();}}
  drawDepthContactShadowV116(ctx,actor,y){const clip=this.npcStationRelayClipV166(actor);if(!clip)return super.drawDepthContactShadowV116(ctx,actor,y);
    ctx.save();ctx.beginPath();ctx.rect(clip.x,clip.y,clip.w,clip.h);ctx.clip();try{return super.drawDepthContactShadowV116(ctx,actor,y);}finally{ctx.restore();}}
  persist(){const original=this.onPersist;let patch;this.onPersist=value=>{patch=value;};try{super.persist();}finally{this.onPersist=original;}
    if(patch)original({...patch,npcStationRelaysV166:normalizeNpcStationRelaysV166(this.npcStationRelaysStateV166)});}
  getSnapshot(){const snapshot=super.getSnapshot(),state=normalizeNpcStationRelaysV166(this.npcStationRelaysStateV166);
    return{...snapshot,npcStationRelaysV166:{...state,scope:'observed-station-cabin-local-owner-cabin-station',preLoadTravelObserved:false,
      routes:Object.fromEntries(NPC_STATION_RELAY_DEFINITIONS_V166.map(d=>[d.id,{...state.routes[d.id],definition:d,
        initialCondition:state.routes[d.id].stationOrigin?'observed-native-station-before-watch':this.getNpcServiceActorV161?.(d.localId)?'native-workpost-initial-condition':null}]))}};}
};}
