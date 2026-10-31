import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from './hub-game.js';
import { HubGame as RosterHubV52 } from './hub-v52-runtime.js';
import { buildHubTraversalGeometryV87 } from './hub-v51-runtime.js';
import { buildHubDoorNetworkV58 } from './topology-coherence-v58.js';
import { createServiceRouteV161 } from './npc-service-routes-v161.js';
import { annexNpcDutiesV141, createAnnexNpcsV141 } from './hub-annex-npc-life-v141.js';
import { HUB_ANNEX_BY_ID_V137 } from './hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from './hub-annex-runtime-geometry-v139.js';
import { getHubDoorDestinationDescriptorsV138 } from './hub-destination-signage-v138.js';
import { projectHubDoorActorV142 } from './hub-door-passage-v142.js';
import { getHubBulkheadColliderV134 } from './hub-bulkhead-depth-v134.js';
import { moveNpcAgainstGeometryV136 } from './npc-life-v136.js';
import { drawHumanAtlasV133 } from './human-visual-contract-v133.js';
import { getLiftOcclusionV163 } from './hub-lift-transit-v163.js';
import { canAccessPortCounterV87 } from './ship-port-state-v87.js';
import { getHubLadderMountV139 } from './hub-support-planes-v139.js';
import { npcClimbLandingXV165 } from './npc-cal-climb-rig-v165.js';
import { JUN_CLIMB_ASSET_V165, resolveJunClimbRigV165, drawJunClimbRigV165, junClimbImageReadyV165 } from './npc-jun-climb-rig-v165.js';
import { npcLiftSocketV165, normalizeNpcLiftTransitV165, createNpcLiftTransitV165,
  advanceNpcLiftTransitV165, npcLiftPoseV165, npcLiftDoorProgressV165, npcLiftDurationV165 } from './npc-lift-transit-v165.js';

const finite = Number.isFinite, copy = value => value == null ? value : JSON.parse(JSON.stringify(value));
const overlap = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
const mainRoom = (deck,x) => HUB_DECKS[deck]?.rooms.find(r=>x+22>=r.xStart&&x+22<r.xEnd);
const deckOf = roomId => HUB_DECKS.findIndex(d=>d.rooms.some(r=>r.id===roomId));
const crossing = a => ['portal-opening','portal-covering','portal-revealing'].includes(a?.stage);
const stages = ['retained','walking-lift','waiting-lift','lift','walking-portal','portal-opening','portal-covering',
  'portal-revealing','walking-post','service','walking-home','returned','vertical'];
const reasons = ['daily-schedule','occupied','active-crisis','infestation','mission-assignment','medical-recovery','unavailable','interaction','art-unavailable','port-unavailable'];
export const NPC_INTERDECK_DEFINITIONS_V165 = Object.freeze([
  {id:'david-durandal',crewId:'crew-10-david-8r',nativeDeck:0,deck:2,parentRoomId:'workshop',annexRoomId:'durandal',
    targetX:1020,duty:'computer-diagnostic-review',shaftId:'hub-aft-lift',legacyRouteId:null,
    origins:['cryo-bay','combat-information']},
  {id:'inez-civil',crewId:'crew-09-inez-harlow',nativeDeck:2,deck:3,parentRoomId:'dropship-hangar',annexRoomId:'frontier-civil-counter',
    targetX:694,duty:'civil-arrival-biosafety',shaftId:'hub-midship-lift',legacyRouteId:'inez-bioforge',
    origins:['quarantine','science-lab']},
  {id:'maksim-cockpit',crewId:'crew-08-maksim-orlov',nativeDeck:3,deck:0,parentRoomId:'bridge',annexRoomId:'flight-control-cockpit',
    targetX:710,duty:'flight-watch',shaftId:'hub-midship-lift',legacyRouteId:'maksim-arrival',
    origins:['dropship-hangar','briefing','bridge']},
  {id:'jun-sanitary',crewId:'crew-11-jun-park',nativeDeck:3,deck:1,parentRoomId:'crew-quarters',annexRoomId:'sanitary-bay',
    targetX:1014,duty:'sanitary-water-fixture-inspection',shaftId:'hub-midship-lift',legacyRouteId:'jun-water',
    origins:['life-support','workshop','mess']}
].map(d=>Object.freeze({...d,origins:Object.freeze(d.origins)})));
const byId = new Map(NPC_INTERDECK_DEFINITIONS_V165.map(d=>[d.id,d]));
const geometries = new Map();
export function getNpcInterdeckGeometryV165(id) {
  if(geometries.has(id))return geometries.get(id);
  const d=byId.get(id);if(!d)return null;
  const portal=createServiceRouteV161(d,{schema:165,stateField:'npcInterdeckRoutesV165',nativeTemplateDeck:d.nativeDeck});
  const parent=HUB_DECKS[d.deck].rooms.find(r=>r.id===d.parentRoomId);
  const annex=getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[d.annexRoomId]);
  const descriptor=getHubDoorDestinationDescriptorsV138(parent).find(p=>p.destinationId===d.annexRoomId);
  const post=createAnnexNpcsV141([{...d,roomId:d.annexRoomId}],new Map())[0];
  const traversal=buildHubTraversalGeometryV87(d.deck);
  const result={parent,annex,descriptor,faces:portal.faces,post,platforms:traversal.platforms,
    ladders:traversal.ladders.filter(l=>l.roomId===d.parentRoomId)};
  geometries.set(id,result);return result;
}
const doorsFor = deck => buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,deck).filter(d=>!d.lift);
const allDoorIds = HUB_DECKS.flatMap((_,deck)=>doorsFor(deck).map(d=>d.id));
const normalizeDoors = value => value&&typeof value==='object'&&!Array.isArray(value)
  &&Object.entries(value).every(([id,p])=>allDoorIds.includes(id)&&finite(p)&&p>=0&&p<=1)
  ?Object.fromEntries(allDoorIds.map(id=>[id,value[id]||0])):null;
function validOrigin(d,o) {
  const room=HUB_DECKS[o?.deck]?.rooms.find(r=>r.id===o.roomId);
  return o?.crewId===d.crewId&&d.origins.includes(o.roomId)&&room&&o.y===532
    &&finite(o.x)&&o.x>=room.xStart+24&&o.x<=room.xEnd-68&&[-1,1].includes(o.facing)
    &&['native-observed-body','legacy-physical-owner','traffic-physical-owner'].includes(o.source);
}
function normalizeOrigin(d,o) {
  return validOrigin(d,o)?{crewId:d.crewId,deck:o.deck,roomId:o.roomId,x:o.x,y:532,facing:o.facing,source:o.source}:null;
}
export function normalizeNpcInterdeckRoutesV165(value) {
  const routes={};
  for(const d of NPC_INTERDECK_DEFINITIONS_V165) {
    const raw=value?.schema===165?value.routes?.[d.id]:null,a=raw?.actor,o=raw?.origin;
    const retained=normalizeOrigin(d,raw?.retained);
    const empty={actor:null,origin:null,retained,returned:null,nativeHandoff:null,admissionReady:raw?.admissionReady!==false};routes[d.id]=empty;
    if(!a) {
      if(validOrigin(d,o)&&raw.returned?.crewId===d.crewId&&raw.returned.roomId===o.roomId&&raw.returned.deck===o.deck
        &&raw.returned.x===o.x&&raw.returned.y===o.y&&raw.returned.observedTravel===true
        &&finite(raw.returned.distance)&&raw.returned.distance>=0&&Number.isInteger(raw.returned.liftJourneys)&&raw.returned.liftJourneys>=0&&raw.returned.liftJourneys<=2
        &&Number.isInteger(raw.returned.crossings)&&raw.returned.crossings>=0&&raw.returned.crossings<=2)
        routes[d.id]={...empty,origin:normalizeOrigin(d,o),returned:{crewId:d.crewId,deck:o.deck,roomId:o.roomId,x:o.x,y:532,distance:raw.returned.distance,verticalDistance:finite(raw.returned.verticalDistance)?raw.returned.verticalDistance:0,liftJourneys:raw.returned.liftJourneys,crossings:raw.returned.crossings,observedTravel:true}};
      if(raw?.nativeHandoff?.crewId===d.crewId&&raw.nativeHandoff.observedTravel===false
        &&(HUB_DECKS.some(deck=>deck.rooms.some(r=>r.id===raw.nativeHandoff.fromRoomId))||raw.nativeHandoff.fromRoomId===d.annexRoomId)
        &&['medical-recovery','mission-assignment','unavailable','daily-schedule'].includes(raw.nativeHandoff.reason))
        routes[d.id].nativeHandoff={crewId:d.crewId,fromRoomId:raw.nativeHandoff.fromRoomId,toRoomId:raw.nativeHandoff.toRoomId||null,reason:raw.nativeHandoff.reason,observedTravel:false};
      continue;
    }
    const g=getNpcInterdeckGeometryV165(d.id),local=a.roomId===d.annexRoomId;
    if(!validOrigin(d,o)||a.crewId!==d.crewId||!Number.isInteger(a.deck)||!HUB_DECKS[a.deck]
      ||!stages.includes(a.stage)||!reasons.includes(a.reason)||!['outbound','return'].includes(a.direction)
      ||![a.x,a.y,a.velocity,a.time,a.distance,a.verticalDistance,a.doorProgress].every(finite)
      ||a.x<24||a.x>(local?g.annex.world.width:HUB_WORLD.width)-68||a.y<0||a.y>532
      ||a.time<0||a.time>1e9||a.distance<0||a.distance>1e9||a.verticalDistance<0||a.verticalDistance>1e9
      ||Math.abs(a.velocity)>27.000001||![-1,1].includes(a.facing)||a.doorProgress<0||a.doorProgress>1
      ||!Number.isInteger(a.crossings)||a.crossings<0||a.crossings>1e6
      ||!Number.isInteger(a.liftJourneys)||a.liftJourneys<0||a.liftJourneys>1e6
      ||!Number.isInteger(a.parentLevel)||a.parentLevel<0||a.parentLevel>2||d.id!=='jun-sanitary'&&a.parentLevel!==0
      ||typeof a.departed!=='boolean'||typeof a.returnRequested!=='boolean'||!normalizeDoors(a.bulkheadProgress)
      ||!local&&mainRoom(a.deck,a.x)?.id!==a.roomId||local&&a.deck!==d.deck)continue;
    if(![o.deck,d.deck].includes(a.deck)||a.crossings>2||a.liftJourneys>2
      ||local&&(a.crossings!==1||o.deck!==d.deck&&a.liftJourneys!==1)
      ||['walking-post','service'].includes(a.stage)&&(!local||a.direction!=='outbound')
      ||a.stage==='walking-home'&&(a.direction!=='return'||a.deck!==o.deck||local)
      ||['walking-lift','waiting-lift'].includes(a.stage)&&(local||a.deck===(a.direction==='outbound'?d.deck:o.deck))
      ||o.deck===d.deck&&a.liftJourneys!==0)continue;
    if(a.stage==='waiting-lift'&&(a.y!==532||a.velocity!==0||Math.abs(a.x-(npcLiftSocketV165(a.deck,d.shaftId).x-22))!==96))continue;
    const lift=a.lift?normalizeNpcLiftTransitV165(a.lift):null;
    if(a.stage==='lift') {
      if(!lift||lift.crewId!==d.crewId||lift.shaftId!==d.shaftId)continue;
      const p=npcLiftPoseV165(lift);
      if(a.x!==p.x||a.y!==p.y||a.deck!==p.deck||a.roomId!==npcLiftSocketV165(p.deck,d.shaftId).roomId)continue;
      const expectedFrom=a.direction==='outbound'?o.deck:d.deck,expectedTo=a.direction==='outbound'?d.deck:o.deck;
      if(lift.fromDeck!==expectedFrom||lift.toDeck!==expectedTo)continue;
    }else if(a.lift)continue;
    if(a.stage!=='vertical'&&a.y!==(d.id==='jun-sanitary'&&!local&&a.deck===1&&a.roomId==='crew-quarters'?[532,408,284][a.parentLevel||0]:532))continue;
    if(crossing(a)) {
      if(!local&&a.roomId!==d.parentRoomId||a.deck!==d.deck||a.velocity!==0)continue;
      const face=local?g.faces.local:g.faces.parent;
      if(Math.abs(a.x-(face.opening.x+(face.opening.w-44)/2))>.001)continue;
      if(a.stage==='portal-revealing'?(local!==(a.direction==='outbound')):(local!==(a.direction==='return')))continue;
    }
    if(a.stage==='service'&&(!local||a.x!==g.post.x||a.y!==532))continue;
    if(!local&&a.stage!=='vertical'&&doorsFor(a.deck).some(door=>a.bulkheadProgress[door.id]<.82
      &&overlap({...a,w:44,h:92},getHubBulkheadColliderV134(door))))continue;
    if(a.stage==='retained'&&(a.x!==o.x||a.y!==o.y||a.deck!==o.deck||a.roomId!==o.roomId||a.departed))continue;
    if(a.stage==='vertical'&&!validVerticalStateV165(a,g))continue;
    routes[d.id]={actor:{crewId:d.crewId,deck:a.deck,roomId:a.roomId,x:a.x,y:a.y,velocity:a.velocity,
      facing:a.facing,stage:a.stage,direction:a.direction,reason:a.reason,time:a.time,distance:a.distance,
      verticalDistance:a.verticalDistance,doorProgress:a.doorProgress,crossings:a.crossings,liftJourneys:a.liftJourneys,
      departed:a.departed,returnRequested:a.returnRequested,lift,bulkheadProgress:normalizeDoors(a.bulkheadProgress),
      upperLanding:Boolean(a.upperLanding),parentLevel:Number.isInteger(a.parentLevel)?a.parentLevel:0,vertical:a.vertical?copy(a.vertical):null},origin:normalizeOrigin(d,o),retained:null,returned:null,nativeHandoff:null,admissionReady:false};
  }
  // A shaft is one cabin across every deck. Conflicting restored passengers
  // are rejected together; load order can never choose a second winner.
  const occupants=new Map();
  for(const [id,entry]of Object.entries(routes))if(entry.actor?.lift){const shaft=entry.actor.lift.shaftId;
    if(!occupants.has(shaft))occupants.set(shaft,[]);occupants.get(shaft).push(id);}
  for(const ids of occupants.values())if(ids.length>1)for(const id of ids)routes[id]={actor:null,origin:null,returned:null,nativeHandoff:null};
  return{schema:165,routes};
}
export function npcJunParentRigV165(a) {
  const g=getNpcInterdeckGeometryV165('jun-sanitary'),native=g.ladders.find(l=>l.id===a.vertical?.ladderId);
  if(!native)return null;const ladder={...native,x:getHubLadderMountV139(native).left};
  const v=a.vertical,kind=v.kind.startsWith('climb-')?'climb':v.kind;
  return resolveJunClimbRigV165({...a,w:44,h:92,ladderId:native.id,facing:1},ladder,
    {kind,progress:v.progress,landingX:v.landingX,baseX:v.baseX});
}
function validVerticalStateV165(a,g) {
  const v=a.vertical,l=g.ladders.find(l=>l.id===v?.ladderId),index=g.ladders.indexOf(l);
  if(a.crewId!=='crew-11-jun-park'||a.roomId!=='crew-quarters'||a.deck!==1||!l
    ||!['floor-mount','climb-up','top-dismount','top-mount','climb-down','floor-dismount'].includes(v.kind)
    ||!finite(v.progress)||v.progress<0||v.progress>1||!finite(v.baseX)||!finite(v.landingX)
    ||a.y<l.top-92||a.y>l.bottom-92||a.velocity!==0||a.facing!==1)return false;
  const baseX=getHubLadderMountV139(l).left-40,landingX=index===1?580:baseX;
  if(v.baseX!==baseX||v.landingX!==landingX||a.parentLevel!==(a.direction==='return'?index+1:index))return false;
  const expectedX=v.kind.startsWith('top-')?npcClimbLandingXV165(baseX,landingX,v.kind,v.progress):baseX;
  if(Math.abs(a.x-expectedX)>1e-7||v.kind.startsWith('floor-')&&a.y!==l.bottom-92
    ||v.kind.startsWith('top-')&&a.y!==l.top-92)return false;
  const rig=npcJunParentRigV165(a);if(!rig?.eligible)return false;
  const supports=[{x:0,y:624,w:HUB_WORLD.width,h:96},...g.platforms];
  return Object.values(rig.contacts.feet).every(foot=>foot.support!=='physical-platform'
    ||supports.some(s=>Math.abs(s.y-foot.point.y)<.01&&foot.point.x>=s.x&&foot.point.x<=s.x+s.w));
}

function passage(d,a,peers,player) {
  const g=getNpcInterdeckGeometryV165(d.id),local=a.roomId===d.annexRoomId;
  const destination=local?d.parentRoomId:d.annexRoomId;
  const occupied=[...peers,...(player?[player]:[])].filter(p=>p.crewId!==d.crewId&&p.alive!==false&&p.roomId===destination);
  return projectHubDoorActorV142({...a,w:44,h:92},local?g.faces.local:g.faces.parent,local?g.faces.parent:g.faces.local,{
    bounds:{x:local?g.parent.xStart+24:24,y:0,w:local?g.parent.xEnd-g.parent.xStart-48:g.annex.world.width-48,h:720},
    surfaces:local?[{x:g.parent.xStart,y:624,w:g.parent.xEnd-g.parent.xStart,h:96},...g.platforms]:g.annex.platforms,
    solids:local?buildHubObstacleGeometryV87(d.deck):g.annex.colliders,occupied});
}
export function npcInterdeckOcclusionV165(id,a) {
  if(!crossing(a)||a.stage==='portal-opening')return null;
  const d=byId.get(id),g=getNpcInterdeckGeometryV165(id),face=a.roomId===d.annexRoomId?g.faces.local:g.faces.parent,p=a.doorProgress;
  return{x:face.opening.x+face.opening.w*(1-p)/2,y:face.opening.y,w:face.opening.w*p,
    h:face.socket.y+face.socket.h+8-face.opening.y,progress:p};
}
function walk(d,a,body,goal,dt,peers,player,doors) {
  const local=a.roomId===d.annexRoomId,g=getNpcInterdeckGeometryV165(d.id),origin=a.x;
  const bodies=[...peers,...(player?[player]:[])].filter(p=>p!==body&&p.crewId!==d.crewId&&p.alive!==false
    &&(local?p.roomId===d.annexRoomId:deckOf(p.roomId)===a.deck)&&Math.abs(p.y-a.y)<16&&[p.x,p.y,p.w,p.h].every(finite));
  const solids=[...(local?g.annex.colliders:buildHubObstacleGeometryV87(a.deck)),
    ...(!local?doors.filter(door=>door.progress<.82).map(getHubBulkheadColliderV134):[]),
    ...bodies.map(p=>({x:p.x-12,y:p.y,w:p.w+24,h:p.h}))];
  let s={...a};
  for(let remaining=dt;remaining>1e-8;) {
    const step=Math.min(1/120,remaining);remaining-=step;
    const desired=Math.sign(goal-s.x)*Math.min(27,Math.sqrt(2*92*Math.max(0,Math.abs(goal-s.x)-.02)));
    const velocity=s.velocity+clamp(desired-s.velocity,-92*step,92*step);
    const proposed=clamp(s.x+(s.velocity+velocity)*.5*step,Math.min(s.x,goal),Math.max(s.x,goal));
    const move=moveNpcAgainstGeometryV136({...body,x:s.x,y:s.y},proposed,solids);
    s.x=move.x;s.velocity=move.blocked?0:velocity;
  }
  if(Math.abs(s.x-goal)<.1){s.x=goal;s.velocity=0;}
  s.distance=Math.min(1e9,s.distance+Math.abs(s.x-origin));
  if(s.x!==origin)s.facing=Math.sign(s.x-origin);
  if(!local)s.roomId=mainRoom(s.deck,s.x)?.id||s.roomId;
  return{...s,actualVelocity:(s.x-origin)/dt,reason:Math.abs(s.x-origin)<1e-7&&Math.abs(s.x-goal)>.1?'occupied':'daily-schedule'};
}

function initialInterdeckActorV165(d,origin,doors) {
  return{crewId:d.crewId,deck:origin.deck,roomId:origin.roomId,x:origin.x,y:532,velocity:0,facing:origin.facing,
    stage:'retained',direction:'outbound',reason:'daily-schedule',time:0,distance:0,verticalDistance:0,
    doorProgress:0,crossings:0,liftJourneys:0,departed:false,returnRequested:false,lift:null,
    bulkheadProgress:Object.fromEntries(doors.flatMap(ds=>ds.map(door=>[door.id,door.progress||0]))),
    upperLanding:false,parentLevel:0,vertical:null};
}
/** V191 pure same-deck courtesy predicate (does not mutate a route).
 * A remote service, another-deck lift or finished passenger is not an
 * occupant of this rear portal. Actual same-deck walking / opening / floor
 * climbing keeps the existing passing rights and physical collision checks.
 */
export function isNpcServiceDeckPassingV191(ownerDeck, passengerRouteIds, routeStates){
  if(!Number.isInteger(ownerDeck)||ownerDeck<0||ownerDeck>=HUB_DECKS.length
    ||!Array.isArray(passengerRouteIds)||!routeStates)return false;
  return passengerRouteIds.some(id=>{
    const actor=routeStates[id]?.actor;
    return actor?.deck===ownerDeck && actor.stage!=='service'
      && actor.stage!=='returned'
      && (!actor.lift||['boarding','exiting'].includes(actor.lift.phase));
  });
}

export function withHubNpcInterdeckRoutesV165(Base) {
  return class HubNpcInterdeckRoutesV165 extends Base {
    constructor(...args) {
      super(...args);
      if(typeof Image==='function'){this.junClimbImageV165=new Image();this.junClimbImageV165.src=JUN_CLIMB_ASSET_V165.path;}
    }
    start(save={},options={}) {
      this.npcInterdeckSandboxV165=Boolean(options.editorProject||options.forgeJourneyV141||this.forgeSessionV141);
      this.npcInterdeckStateV165=normalizeNpcInterdeckRoutesV165(this.npcInterdeckSandboxV165?null:save.npcInterdeckRoutesV165);
      for(const d of NPC_INTERDECK_DEFINITIONS_V165) {
        const e=this.npcInterdeckStateV165.routes[d.id],origin=e.actor?e.origin:e.retained;if(!origin||origin.source!=='legacy-physical-owner')continue;
        const bookmark=save.npcAnnexRoutesV163?.routes?.[d.legacyRouteId]?.actor;
        if(!bookmark||bookmark.roomId!==origin.roomId||bookmark.deck!==origin.deck||bookmark.x!==origin.x||bookmark.y!==origin.y)
          this.npcInterdeckStateV165.routes[d.id]={actor:null,origin:null,returned:null,nativeHandoff:null,admissionReady:true};
      }
      this.npcInterdeckBodiesV165=new Map();this.npcInterdeckObservedV165=new Map();this.npcInterdeckRestoringV165=true;
      // A new start restores this Save's physical owners. A cohort left on
      // the reused engine by an earlier timetable is not a restored source.
      this.npcs=[];
      this.npcInterdeckDoorsV165=HUB_DECKS.map((_,deck)=>doorsFor(deck).map(door=>({...door,progress:
        Math.max(0,...Object.values(this.npcInterdeckStateV165.routes).map(e=>e.actor?.bulkheadProgress?.[door.id]||0))})));
      if(!this.junClimbImageV165&&typeof Image==='function'){this.junClimbImageV165=new Image();this.junClimbImageV165.src=JUN_CLIMB_ASSET_V165.path;}
      const result=super.start(save,options);this.prepareNpcInterdeckV165();this.npcInterdeckRestoringV165=false;
      this.syncNpcInterdeckDoorsV165();this.publishNpcInterdeckBodiesV165();this.draw?.();return result;
    }
    syncNpcInterdeckDoorsV165() {
      if(!this.state||!this.doorStates||this.npcInterdeckVisibleDoorSetV165===this.doorStates)return;
      for(const door of this.doorStates){const saved=this.npcInterdeckDoorsV165?.[this.state.deck]?.find(d=>d.id===door.id);
        if(saved)door.progress=Math.max(door.progress||0,saved.progress);}
      this.npcInterdeckVisibleDoorSetV165=this.doorStates;
    }
    getNpcInterdeckActorsV165(deck=null) {
      return[...(this.npcInterdeckBodiesV165?.values()||[])].filter(a=>deck==null||this.npcInterdeckEntryV165(a.crewId)?.actor?.deck===deck);
    }
    npcInterdeckEntryV165(crewId) {const d=NPC_INTERDECK_DEFINITIONS_V165.find(d=>d.crewId===crewId);return d&&this.npcInterdeckStateV165?.routes[d.id];}
    hubNpcLeaseOwnerV163(crewId) {
      const d=NPC_INTERDECK_DEFINITIONS_V165.find(d=>d.crewId===crewId);
      return d&&this.npcInterdeckStateV165?.routes[d.id]?.actor?d.id:super.hubNpcLeaseOwnerV163?.(crewId)||null;
    }
    hubNpcLeaseReentryBlockedV163(crewId) {
      const e=this.npcInterdeckEntryV165(crewId),d=NPC_INTERDECK_DEFINITIONS_V165.find(d=>d.crewId===crewId);
      return Boolean(e?.nativeHandoff?.reason==='unavailable'&&d&&this.npcInterdeckDutyV165(d))
        ||Boolean(super.hubNpcLeaseReentryBlockedV163?.(crewId));
    }
    canRestoreNpcPhysicalLeaseOriginV163(crewId,source) {
      const e=this.npcInterdeckEntryV165(crewId),origin=e?.actor?e.origin:e?.retained;
      const d=NPC_INTERDECK_DEFINITIONS_V165.find(d=>d.crewId===crewId);
      return Boolean(origin&&d&&this.npcInterdeckDutyV165(d)&&source?.roomId===origin.roomId&&source.x===origin.x&&source.y===origin.y)
        ||Boolean(super.canRestoreNpcPhysicalLeaseOriginV163?.(crewId,source));
    }
    getNpcServiceOwnedActorsV163() {
      const actors=[...(super.getNpcServiceOwnedActorsV163?.()||[]),...this.getNpcInterdeckActorsV165()];
      return [...new Map(actors.map(a=>[a.crewId,a])).values()];
    }
    prepareNpcInterdeckV165() {
      if(this.npcInterdeckSandboxV165||this.editorPlaytest||this.forgeSessionV141||!this.npcInterdeckStateV165)return;
      for(const d of NPC_INTERDECK_DEFINITIONS_V165) {
        let entry=this.npcInterdeckStateV165.routes[d.id];
        if(!entry.actor&&!this.npcInterdeckDutyV165(d))entry.admissionReady=true;
        if(this.npcInterdeckBodiesV165.has(d.id))continue;
        const inheritedOwner=super.hubNpcLeaseOwnerV163?.(d.crewId);
        if(inheritedOwner)continue;
        const primary=d.legacyRouteId&&this.getNpcServiceActorV161?.(d.legacyRouteId);
        const savedOrigin=entry.actor?entry.origin:entry.retained;
        if(this.npcInterdeckRestoringV165&&savedOrigin?.source==='legacy-physical-owner'&&!primary) {
          const r=this.npcRoutineResolutionsV62?.get(d.crewId);
          if(!entry.actor&&this.npcInterdeckDutyV165(d)&&r&&!r.alert&&!r.missionAssigned&&!r.needsCare) {
            // Reserve the validated saved legacy singleton before nested
            // timetable factories can hand it to a sampled alternate annex.
            // Its real owner alone rehydrates the body; we adopt that exact
            // object after the inherited factory returns.
            entry=this.npcInterdeckStateV165.routes[d.id]={actor:initialInterdeckActorV165(d,savedOrigin,this.npcInterdeckDoorsV165),
              origin:normalizeOrigin(d,savedOrigin),retained:null,returned:null,nativeHandoff:null,admissionReady:false};
          }
          continue;
        }
        const primaryState=primary&&this.getNpcServicePhysicalStateV165?.(d.legacyRouteId);
        if(!entry.actor&&primaryState&&(primaryState.stage!=='service'||primaryState.doorProgress>0))continue;
        const traffic=this.getNpcServiceTrafficActorsV163?.().find(a=>a.crewId===d.crewId);
        const observed=this.npcInterdeckObservedV165.get(d.crewId);
        const native=(this.npcs||[]).find(a=>a.crewId===d.crewId);
        let source=primary||traffic||observed||native;
        if(!source&&entry.retained&&this.npcInterdeckDutyV165(d)&&this.npcInterdeckRestoringV165) {
          const identity=RosterHubV52.prototype.createNpcs.call({},d.nativeDeck).find(a=>a.crewId===d.crewId);
          if(identity)source={...identity,...entry.retained,w:44,h:92,vx:0,mobile:false};
        }
        if(entry.actor) {
          if(!source&&this.npcInterdeckRestoringV165)source=RosterHubV52.prototype.createNpcs.call({},d.nativeDeck).find(a=>a.crewId===d.crewId);
          if(!source)continue;
        }else {
          const r=this.npcRoutineResolutionsV62?.get(d.crewId);
          if(!source||!d.origins.includes(source.roomId)||source.y!==532||source.alive===false||source.downed
            ||!r||r.alert||r.missionAssigned||r.needsCare||entry.returned&&!entry.admissionReady&&this.npcInterdeckDutyV165(d))continue;
          // Keep an observed origin before a watch changes. Ownership is only
          // borrowed when the alternate watch actually requests this circuit.
          this.npcInterdeckObservedV165.set(d.crewId,source);
          const retained={crewId:d.crewId,deck:deckOf(source.roomId),roomId:source.roomId,x:source.x,y:source.y,
            facing:source.facing===-1?-1:1,source:primary?'legacy-physical-owner':traffic?'traffic-physical-owner':entry.retained?.source||'native-observed-body'};
          if(!this.npcInterdeckDutyV165(d)){entry.retained=validOrigin(d,retained)?retained:null;continue;}
          const origin={crewId:d.crewId,deck:deckOf(source.roomId),roomId:source.roomId,x:source.x,y:source.y,
            facing:source.facing===-1?-1:1,source:primary?'legacy-physical-owner':traffic?'traffic-physical-owner':entry.retained?.source||'native-observed-body'};
          if(!validOrigin(d,origin))continue;
          const a=initialInterdeckActorV165(d,origin,this.npcInterdeckDoorsV165);
          entry=this.npcInterdeckStateV165.routes[d.id]={actor:a,origin,retained:null,returned:null,nativeHandoff:null,admissionReady:false};
        }
        const body=source;this.npcInterdeckBodiesV165.set(d.id,body);this.applyNpcInterdeckPoseV165(d,body,entry.actor);
      }
    }
    npcInterdeckDutyV165(d) {return annexNpcDutiesV141(this.npcRoutineResolutionsV62,this).some(w=>w.crewId===d.crewId&&w.roomId===d.annexRoomId);}
    createNpcs(deck) {
      this.prepareNpcInterdeckV165();let natives=super.createNpcs(deck);
      if(this.npcInterdeckSandboxV165||!this.npcInterdeckStateV165)return natives;
      for(const d of NPC_INTERDECK_DEFINITIONS_V165){
        const entry=this.npcInterdeckStateV165.routes[d.id],physical=this.npcInterdeckObservedV165.get(d.crewId);
        const resolution=this.npcRoutineResolutionsV62?.get(d.crewId);
        const primary=d.legacyRouteId&&this.getNpcServiceActorV161?.(d.legacyRouteId);
        const traffic=this.getNpcServiceTrafficActorsV163?.().find(a=>a.crewId===d.crewId);
        // A strategic refresh spends no physical time. Keep the actual native
        // object, including any position it really reached, instead of making
        // a fresh timetable sample its next observed origin. Real service and
        // courtesy owners, emergencies and care keep their existing priority.
        const keepObserved=this.running===false&&!this.npcInterdeckBodiesV165.has(d.id)
          &&entry.retained?.source==='native-observed-body'&&physical&&physical.alive!==false&&!physical.downed
          &&physical.y===532&&d.origins.includes(physical.roomId)&&!primary&&!traffic
          &&!super.hubNpcLeaseOwnerV163?.(d.crewId)&&resolution&&!resolution.alert&&!resolution.missionAssigned&&!resolution.needsCare;
        if(keepObserved){
          natives=natives.filter(a=>a.crewId!==d.crewId);
          if(deckOf(physical.roomId)===deck)natives.push(physical);
          continue;
        }
        const source=natives.find(a=>a.crewId===d.crewId);
        if(source&&!this.npcInterdeckBodiesV165.has(d.id)&&d.origins.includes(source.roomId))this.npcInterdeckObservedV165.set(d.crewId,source);}
      this.prepareNpcInterdeckV165();const ids=new Set(this.getNpcInterdeckActorsV165().map(a=>a.crewId));
      return[...natives.filter(a=>!ids.has(a.crewId)&&!this.hubNpcLeaseReentryBlockedV163(a.crewId)),...this.getNpcInterdeckActorsV165(deck).filter(a=>deckOf(a.roomId)===deck)];
    }
    ensureAnnexNpcCohortV141() {
      const cohort=super.ensureAnnexNpcCohortV141(),actors=this.getNpcInterdeckActorsV165(),ids=new Set(actors.map(a=>a.crewId));
      return[...cohort.filter(a=>!ids.has(a.crewId)),...actors.filter(a=>deckOf(a.roomId)<0)];
    }
    stepHubNpcLifeV136(actor,delta,options) {if(this.getNpcInterdeckActorsV165().includes(actor))return;return super.stepHubNpcLifeV136(actor,delta,options);}
    tickAnnexNpcLifeV141(delta) {
      const owned=new Set(this.getNpcInterdeckActorsV165()),active=this.activeAnnexNpcsV141;
      this.activeAnnexNpcsV141=()=>active.call(this).filter(a=>!owned.has(a));
      try{return super.tickAnnexNpcLifeV141(delta);}finally{this.activeAnnexNpcsV141=active;}
    }
    npcLiftCabinReservationV165(shaftId) {
      if(typeof shaftId!=='string'||!shaftId)return null;
      const entry=Object.entries(this.npcInterdeckStateV165?.routes||{}).find(([,e])=>e.actor?.lift&&e.actor.lift.shaftId===shaftId);
      return entry?{owner:entry[0],crewId:entry[1].actor.crewId,shaftId,phase:entry[1].actor.lift.phase}:null;
    }
    hubNpcBulkheadDemandV158(door) {
      if(super.hubNpcBulkheadDemandV158?.(door))return true;
      return Object.values(this.npcInterdeckStateV165?.routes||{}).some(e=>e.actor&&!e.actor.lift&&e.actor.stage!=='service'
        &&e.actor.deck===door.deckIndex&&deckOf(e.actor.roomId)>=0&&Math.abs(e.actor.x+22-door.x)<182);
    }
    npcAnnexDoorDemandV159(id) {return Math.max(super.npcAnnexDoorDemandV159?.(id)||0,...NPC_INTERDECK_DEFINITIONS_V165
      .filter(d=>d.annexRoomId===id).map(d=>this.npcInterdeckStateV165?.routes[d.id]?.actor?.doorProgress||0));}
    npcAnnexDoorReservedV159(id) {
      return Boolean(super.npcAnnexDoorReservedV159?.(id)||NPC_INTERDECK_DEFINITIONS_V165.some(d=>d.annexRoomId===id
        &&this.npcInterdeckStateV165?.routes[d.id]?.actor&&(crossing(this.npcInterdeckStateV165.routes[d.id].actor)
          ||this.npcInterdeckStateV165.routes[d.id].actor.doorProgress>0)));
    }
    hubDoorPairV142(space,endpointId=null) {
      const pair=super.hubDoorPairV142(space,endpointId),d=NPC_INTERDECK_DEFINITIONS_V165.find(d=>d.annexRoomId===space?.id);
      return pair&&d?{...pair,parent:{...pair.parent,...getNpcInterdeckGeometryV165(d.id).faces.parent},
        local:{...pair.local,...getNpcInterdeckGeometryV165(d.id).faces.local}}:pair;
    }
    applyNpcInterdeckPoseV165(d,body,a) {
      Object.assign(body,{x:a.x,y:a.y,roomId:a.roomId,facing:a.facing,vx:a.actualVelocity||0,mobile:false,min:a.x,max:a.x,
        annexNativeV141:a.roomId===d.annexRoomId,annexDutyV141:a.roomId===d.annexRoomId?d.duty:undefined,
        routinePhaseV62:a.stage==='service'?'work':'station',grounded:a.stage!=='vertical',climbing:a.stage==='vertical'});
      body.lifeV136={schema:136,context:'interdeck-v165:'+d.id,x:a.x,y:a.y,time:a.time,velocity:a.velocity,
        actualVelocity:body.vx,facing:a.facing,mode:Math.abs(body.vx)>.1?'moving':a.reason==='daily-schedule'?'idle':'blocked',
        passive:null,previousPassive:null,blend:1};
    }
    publishNpcInterdeckBodiesV165() {
      if(!this.state)return;const actors=this.getNpcInterdeckActorsV165(),ids=new Set(actors.map(a=>a.crewId));
      this.npcs=[...(this.npcs||[]).filter(a=>!ids.has(a.crewId)),...this.getNpcInterdeckActorsV165(this.state.deck).filter(a=>deckOf(a.roomId)>=0)];
    }
    npcInterdeckPeersV165(d,a) {
      const main=this.getNpcServicePeersV163?.(a.deck,d.crewId)||[];
      const annex=this.ensureAnnexNpcCohortV141().filter(p=>p.crewId!==d.crewId);
      return[...main,...annex].filter((p,i,all)=>all.findIndex(q=>q.crewId===p.crewId)===i);
    }
    npcInterdeckPlayerV165() {return !this.ventActorV62&&this.player?{...this.player,deck:this.state?.deck,roomId:this.currentAnnexV71?.()?.id||this.state?.roomId}:null;}
    update(delta) {
      this.syncNpcInterdeckDoorsV165();this.prepareNpcInterdeckV165();const clocks=new Map(this.getNpcInterdeckActorsV165().map(a=>[a,Object.fromEntries(['workClock','supportClock','alertClock'].map(k=>[k,finite(a[k])?a[k]:0]))]));
      const wasRunning=this.running,result=super.update(delta);
      if(!wasRunning||!this.running||!finite(delta)||delta<=0||this.npcInterdeckSandboxV165)return result;
      const dt=Math.min(delta,.1);
      const physicalPeers=[...(this.getNpcServiceOwnedActorsV163?.()||[]),
        ...(this.getNpcServiceTrafficActorsV163?.()||[]),...(this.npcs||[])];
      for(let deck=0;deck<HUB_DECKS.length;deck++) {
        const visible=this.state?.deck===deck?this.doorStates:[];
        for(const door of this.npcInterdeckDoorsV165[deck]) {
          const actual=visible?.find(v=>v.id===door.id);
          const demand=this.hubNpcBulkheadDemandV158({...door,deckIndex:deck});
          if(actual){if(demand)actual.progress=Math.min(1,actual.progress+(1-actual.progress)*Math.min(1,dt*7));door.progress=actual.progress;}
          else door.progress+=(Number(demand)-door.progress)*Math.min(1,dt*7);
          if(this.hubTrainingV132?.lockedDoorIds?.includes(door.id)) {
            const collider=getHubBulkheadColliderV134(door);
            const mainPlayer=this.state?.deck===deck&&!this.isAnnexActiveV71?.()&&!this.ventActorV62?this.player:null;
            const occupied=physicalPeers.some(actor=>deckOf(actor.roomId)===deck&&overlap(actor,collider))
              ||Boolean(mainPlayer&&overlap(mainPlayer,collider));
            door.progress=occupied?Math.max(.82,door.progress):0;
            if(actual)actual.progress=door.progress;
          }
        }
      }
      let persist=false,rebuild=false;
      for(const d of NPC_INTERDECK_DEFINITIONS_V165) {
        const e=this.npcInterdeckStateV165.routes[d.id],body=this.npcInterdeckBodiesV165.get(d.id);if(!e.actor||!body)continue;
        for(const [key,value]of Object.entries(clocks.get(body)||{}))body[key]=finite(body[key])&&body[key]>value?body[key]:Math.max(0,value-dt);
        const before=e.actor,peers=this.npcInterdeckPeersV165(d,before),player=this.npcInterdeckPlayerV165();
        let a={...before,time:Math.min(1e9,before.time+dt),actualVelocity:0};
        const r=this.npcRoutineResolutionsV62?.get(d.crewId);
        const priority=!r||body.alive===false||body.downed?'unavailable':r.needsCare?'medical-recovery':r.missionAssigned?'mission-assignment':null;
        const alert=r?.alert?(r.reason==='active-crisis'?'active-crisis':'infestation'):null;
        if(priority&&!a.lift&&!crossing(a)&&a.stage!=='vertical') {
          e.nativeHandoff={crewId:d.crewId,fromRoomId:a.roomId,toRoomId:r?.roomId||null,reason:priority,observedTravel:false};
          e.actor=null;this.npcInterdeckBodiesV165.delete(d.id);this.delegateNpcPhysicalLeaseV163?.(d.crewId);persist=true;rebuild=true;continue;
        }
        const portUnavailable=d.id==='inez-civil'&&!canAccessPortCounterV87(this.npcRoutineContextV62?.save);
        a.returnRequested=a.returnRequested||(!this.npcInterdeckDutyV165(d)&&a.departed)||Boolean(alert||priority)||Boolean(portUnavailable&&a.departed);
        if(portUnavailable&&!a.departed){a.reason='port-unavailable';a.velocity=0;e.actor=a;this.applyNpcInterdeckPoseV165(d,body,a);continue;}
        if(portUnavailable&&a.direction==='outbound'&&!a.lift&&!crossing(a)&&a.roomId!==d.annexRoomId){a.direction='return';a.stage=a.deck===e.origin.deck?'walking-home':'walking-lift';}
        if(portUnavailable&&a.direction==='outbound'&&['portal-opening','portal-covering'].includes(a.stage)){a.direction='return';a.stage='portal-revealing';}
        const paused=(alert||priority||body.workClock>0||body.supportClock>0)&&!a.lift&&!crossing(a)&&a.stage!=='vertical';
        if(paused){a.reason=alert||priority||'interaction';a.velocity=0;e.actor=a;this.applyNpcInterdeckPoseV165(d,body,a);continue;}
        a.reason='daily-schedule';
        const local=a.roomId===d.annexRoomId,g=getNpcInterdeckGeometryV165(d.id),doors=this.npcInterdeckDoorsV165[a.deck];
        const yieldGoal=this.getNpcServiceOwnerYieldGoalV165?.(d.id,body);
        const goalDeck=a.direction==='outbound'?d.deck:e.origin.deck,lift=npcLiftSocketV165(a.deck,d.shaftId);
        const cabinX=lift.x-22;
        if(a.stage==='retained') {a.stage=a.deck===d.deck?'walking-portal':'walking-lift';a.departed=true;}
        if(a.stage==='walking-lift'&&d.id==='jun-sanitary'&&a.parentLevel>0) {
          a=this.advanceJunParentApproachV165(d,a,body,dt,peers,player,doors);
        }else if(a.stage==='walking-lift') {
          const sign=Math.sign(a.x-cabinX)||-1,goal=finite(yieldGoal)?yieldGoal:cabinX+sign*96;
          a=walk(d,a,body,goal,dt,peers,player,doors);
          if(a.x===goal&&!finite(yieldGoal)){a.stage='waiting-lift';a.velocity=0;}
        }else if(a.stage==='waiting-lift') {
          if(finite(yieldGoal)){a.stage='walking-lift';e.actor=a;this.applyNpcInterdeckPoseV165(d,body,a);continue;}
          const reserved=this.npcLiftCabinReservationV165(d.shaftId),playerTrip=this.hubLiftTransitV163?.trip;
          const clear=!reserved&&playerTrip?.shaftId!==d.shaftId&&!this.npcLiftQueueBlockersV165(d,a).length&&!this.npcLiftPhysicalOccupancyV165(d,a,a.deck,a.x,cabinX);
          if(clear) {
            const destinationX=a.direction==='return'?e.origin.x:g.faces.parent.opening.x;
            const trip=createNpcLiftTransitV165(body,{fromDeck:a.deck,toDeck:goalDeck,shaftId:d.shaftId,exitDirection:Math.sign(destinationX-cabinX)||-1});
            if(trip){a.stage='lift';a.lift=trip;}
          }else a.reason='occupied';
        }else if(a.stage==='lift') {
          const t=a.lift,nextPose=npcLiftPoseV165({...t,elapsed:Math.min(npcLiftDurationV165(t),t.elapsed+dt)}),current=npcLiftPoseV165(t);
          const admission=advanceNpcLiftTransitV165(t,dt,{
            sourceClear:!this.npcLiftPhysicalOccupancyV165(d,a,t.fromDeck,current.x,nextPose.x),
            arrivalClear:!this.npcLiftPhysicalOccupancyV165(d,a,t.toDeck,t.cabinX,t.exitX),
            exitClear:!this.npcLiftPhysicalOccupancyV165(d,a,t.toDeck,current.x,nextPose.x)});
          a.lift=admission.trip;a.distance+=admission.walked;a.reason=admission.blocked?'occupied':'daily-schedule';
          const pose=admission.trip?npcLiftPoseV165(admission.trip):admission.pose;
          if(pose){a.x=pose.x;a.y=pose.y;a.deck=pose.deck;a.roomId=npcLiftSocketV165(pose.deck,d.shaftId).roomId;a.facing=pose.facing;}
          a.actualVelocity=admission.walked?Math.sign(a.x-before.x)*admission.walked/dt:0;
          if(admission.handoff){a.liftJourneys++;persist=true;}
          if(admission.complete){a.stage=a.direction==='outbound'?'walking-portal':'walking-home';persist=true;}
        }else if(['walking-portal','walking-post','walking-home'].includes(a.stage)) {
          if(d.id==='jun-sanitary'&&!local&&a.deck===d.deck&&a.stage==='walking-portal'&&a.parentLevel<2) {
            a=this.advanceJunParentApproachV165?.(d,a,body,dt,peers,player,doors)||{...a,reason:'art-unavailable'};
          }else {
            const face=local?g.faces.local:g.faces.parent;
            const goal=finite(yieldGoal)?yieldGoal:a.stage==='walking-post'?g.post.x:a.stage==='walking-home'?e.origin.x:face.opening.x+(face.opening.w-44)/2;
            a=walk(d,a,body,goal,dt,peers,player,doors);
            if(a.x===goal&&!finite(yieldGoal)){a.velocity=0;
              if(a.stage==='walking-post'){a.stage='service';}
              else if(a.stage==='walking-home')a.stage='returned';
              else a.stage='portal-opening';}
          }
        }else if(a.stage==='vertical')a=this.advanceJunParentApproachV165?.(d,a,body,dt,peers,player,doors)||{...a,reason:'art-unavailable'};
        else if(crossing(a)) {
          const busy=this.annexTransitionV71?.annexId===d.annexRoomId||this.hubDoorClosingV142?.annexId===d.annexRoomId
            ||portUnavailable&&a.direction==='outbound'&&a.stage!=='portal-revealing';
          const transit=!busy&&(a.stage==='portal-revealing'?![...peers,...(player?[player]:[])].some(p=>p.crewId!==d.crewId&&p.roomId===a.roomId&&p.alive!==false&&overlap({...a,w:44,h:92},p)):passage(d,a,peers,player));
          if(!transit){a.reason='occupied';}
          else if(a.stage==='portal-opening'){a.doorProgress=Math.min(1,a.doorProgress+dt/.42);if(a.doorProgress===1)a.stage='portal-covering';}
          else if(a.stage==='portal-covering'){
            a.doorProgress=Math.max(0,a.doorProgress-dt/.65);
            if(a.doorProgress===0){Object.assign(a,{roomId:local?d.parentRoomId:d.annexRoomId,x:transit.arrival.x,y:transit.arrival.y,
              stage:'portal-revealing',crossings:a.crossings+1});persist=true;}
          }else {
            a.doorProgress=Math.min(1,a.doorProgress+dt/.42);
            if(a.doorProgress===1)a.stage=local?'walking-post':a.deck===e.origin.deck?'walking-home':'walking-lift';
          }
        }else if(a.stage==='service'&&a.returnRequested) {a.direction='return';a.stage='walking-portal';a.velocity=0;}
        if(a.doorProgress>0&&!crossing(a)) {
          const face=a.roomId===d.annexRoomId?g.faces.local:g.faces.parent;
          if(a.x+44<face.opening.x-12||a.x>face.opening.x+face.opening.w+12)a.doorProgress=Math.max(0,a.doorProgress-dt/.65);
        }
        a.bulkheadProgress=Object.fromEntries(this.npcInterdeckDoorsV165.flatMap(ds=>ds.map(door=>[door.id,door.progress||0])));
        if(a.stage==='returned') {
          e.returned={crewId:d.crewId,deck:e.origin.deck,roomId:e.origin.roomId,x:e.origin.x,y:e.origin.y,
            distance:a.distance,verticalDistance:a.verticalDistance,liftJourneys:a.liftJourneys,crossings:a.crossings,observedTravel:true};e.actor=null;
          this.npcInterdeckBodiesV165.delete(d.id);Object.assign(body,{...e.origin,vx:0,climbing:false,grounded:true});
          if(e.origin.source==='legacy-physical-owner')this.returnNpcPhysicalLeaseV163?.(d.crewId);
          else if(d.legacyRouteId)this.delegateNpcPhysicalLeaseV163?.(d.crewId);
          persist=true;continue;
        }
        e.actor=a;this.applyNpcInterdeckPoseV165(d,body,a);
        if(before.stage!==a.stage||before.lift?.phase!==a.lift?.phase)persist=true;
        const visible=a.roomId===d.annexRoomId?this.currentAnnexV71?.()?.id===d.annexRoomId:this.state?.deck===a.deck&&!this.isAnnexActiveV71?.();
        if(!visible)this.sampleNpcAnimation?.(body,{emit:false,discardEvents:true});
      }
      if(rebuild)this.npcs=this.createNpcs(this.state.deck);
      this.publishNpcInterdeckBodiesV165();if(persist)this.persist();return result;
    }
    npcJunClimbArtReadyV165() {return junClimbImageReadyV165(this.junClimbImageV165);}
    npcJunRigV165(a) {return npcJunParentRigV165(a);}
    advanceJunParentApproachV165(d,previous,body,dt,peers,player,doors) {
      let a={...previous},g=getNpcInterdeckGeometryV165(d.id),returning=a.direction==='return';
      const index=a.vertical?g.ladders.findIndex(l=>l.id===a.vertical.ladderId):returning?a.parentLevel-1:a.parentLevel;
      const native=g.ladders[index];if(!native)return{...a,reason:'unavailable'};
      const left=getHubLadderMountV139(native).left,baseX=left-40,landingX=index===1?580:baseX;
      const lane={x:Math.min(baseX,landingX)-12,y:native.top-104,w:Math.abs(landingX-baseX)+80,h:native.bottom-native.top+104};
      const occupied=[...peers,...(player?[player]:[])].some(p=>p.crewId!==d.crewId&&p.alive!==false
        &&p.roomId==='crew-quarters'&&overlap(p,lane));
      if(!this.npcJunClimbArtReadyV165())return{...a,velocity:0,reason:'art-unavailable'};
      if(occupied)return{...a,velocity:0,reason:'occupied'};
      if(!a.vertical) {
        const goal=returning?landingX:baseX;a=walk(d,a,body,goal,dt,peers,player,doors);
        if(a.x!==goal)return a;
        a.stage='vertical';a.velocity=0;a.facing=1;
        a.vertical={ladderId:native.id,kind:returning?'top-mount':'floor-mount',progress:0,baseX,landingX};
        return a;
      }
      const v={...a.vertical},beforeX=a.x,beforeY=a.y;
      if(v.kind==='climb-up'||v.kind==='climb-down') {
        const goal=(v.kind==='climb-up'?native.top:native.bottom)-92;
        const proposed=a.y+clamp(goal-a.y,-24*dt,24*dt);
        const swept={x:a.x,y:Math.min(a.y,proposed),w:44,h:92+Math.abs(a.y-proposed)};
        if(buildHubObstacleGeometryV87(1).some(b=>b.collisionMode!=='one-way-top'&&overlap(swept,b)))return{...a,reason:'occupied'};
        a.y=proposed;v.progress=Math.abs(a.y-(native.bottom-92))/(native.bottom-native.top);
        if(Math.abs(a.y-goal)<1e-8){a.y=goal;v.kind=v.kind==='climb-up'?'top-dismount':'floor-dismount';v.progress=0;}
      }else {
        const duration=Math.max(.65,Math.abs(landingX-baseX)*1.5/27);
        v.progress=Math.min(1,v.progress+dt/duration);
        if(v.kind==='top-dismount'||v.kind==='top-mount')a.x=npcClimbLandingXV165(baseX,landingX,v.kind,v.progress);
        if(v.progress===1) {
          if(v.kind==='floor-mount'){v.kind='climb-up';v.progress=0;}
          else if(v.kind==='top-mount'){v.kind='climb-down';v.progress=1;}
          else {
            a.parentLevel=returning?index:index+1;a.upperLanding=a.parentLevel===2;
            a.stage=returning?'walking-lift':'walking-portal';a.vertical=null;
          }
        }
      }
      if(a.vertical)a.vertical=v;
      const swept={x:Math.min(beforeX,a.x),y:Math.min(beforeY,a.y),w:44+Math.abs(a.x-beforeX),h:92+Math.abs(a.y-beforeY)};
      if(buildHubObstacleGeometryV87(1).some(b=>b.collisionMode!=='one-way-top'&&overlap(swept,b)))return{...previous,velocity:0,reason:'occupied'};
      const rig=a.vertical?this.npcJunRigV165(a):null;
      if(a.vertical&&!rig?.eligible)return{...previous,velocity:0,reason:'art-unavailable'};
      a.verticalDistance+=Math.abs(a.y-beforeY);a.distance+=Math.abs(a.x-beforeX);
      a.actualVelocity=(a.x-beforeX)/dt;a.velocity=0;a.facing=1;return a;
    }
    npcLiftQueueBlockersV165(definition,actor) {
      const destination=actor.direction==='outbound'?definition.deck:this.npcInterdeckStateV165.routes[definition.id].origin.deck;
      return NPC_INTERDECK_DEFINITIONS_V165.filter(d=>d.id!==definition.id&&d.shaftId===definition.shaftId).flatMap(d=>{
        const e=this.npcInterdeckStateV165.routes[d.id],a=e?.actor;if(!a||a.deck!==destination)return[];
        const leaving=a.direction==='return'||a.returnRequested&&a.roomId===d.annexRoomId;
        const target=leaving?e.origin.deck:d.deck;
        if(a.deck===target)return[];
        return[{routeId:d.id,crewId:d.crewId,fromDeck:a.deck,toDeck:target,roomId:a.roomId,stage:a.stage,
          reason:'clear-physical-departure-before-arriving-cabin'}];
      });
    }
    npcLiftPhysicalOccupancyV165(d,a,deck,fromX,toX) {
      const room=npcLiftSocketV165(deck,d.shaftId).roomId,box={x:Math.min(fromX,toX),y:532,w:44+Math.abs(toX-fromX),h:92};
      const peers=this.getNpcServicePeersV163?.(deck,d.crewId)||[];
      const player=this.state?.deck===deck&&!this.isAnnexActiveV71?.()&&!this.ventActorV62?this.player:null;
      return[...peers,...(player?[player]:[])].some(p=>p.crewId!==d.crewId&&p.alive!==false&&overlap(box,p))
        ||buildHubObstacleGeometryV87(deck).some(p=>p.collisionMode!=='one-way-top'&&overlap(box,p));
    }
    npcInterdeckPassingRequestV165(routeId) {
      const passengers=routeId==='tamsin-proving'?['inez-civil']:['mara-archives','echo-escape'].includes(routeId)?['maksim-cockpit']
        :routeId==='cal-logistics'?['david-durandal']:routeId==='idris-engine'?['inez-civil','maksim-cockpit','jun-sanitary']
          :['asha-refuge','leila-galley'].includes(routeId)?['jun-sanitary']:[];
      // V191: a passenger elsewhere on the ship cannot occupy the reactor
      // corridor or retain Idris at the engine-room watch indefinitely.
      // Only a physically travelling body on the very same deck may request
      // his courtesy window. Native peer sweeps and door occupancy remain
      // authoritative even after the distant request is released.
      if(routeId==='idris-engine'){
        const owner=this.getNpcServiceActorV161?.(routeId);
        return isNpcServiceDeckPassingV191(owner?.deck,passengers,this.npcInterdeckStateV165?.routes);
      }
      return passengers.some(id=>Boolean(this.npcInterdeckStateV165?.routes[id]?.actor));
    }
    getNpcServicePassingDutyV165(routeId,actor) {
      if(this.npcInterdeckPassingRequestV165(routeId))return true;
      return super.getNpcServicePassingDutyV165?.(routeId,actor);
    }
    shouldHoldNpcServiceOwnerV165(routeId,actor,state) {
      return this.npcInterdeckPassingRequestV165(routeId)||Boolean(super.shouldHoldNpcServiceOwnerV165?.(routeId,actor,state));
    }
    getNpcServiceOwnerYieldGoalV165(routeId,actor) {
      if(routeId==='david-durandal') {
        const a=this.npcInterdeckStateV165?.routes[routeId]?.actor,cal=this.getNpcCalLogisticsActorV165?.();
        if(a?.roomId==='vehicle-bay'&&a.direction==='return'&&a.stage==='walking-lift'&&cal?.roomId==='vehicle-bay'&&a.x<cal.x) {
          const room=HUB_DECKS[2].rooms.find(r=>r.id==='vehicle-bay');
          const socket=getHubDoorDestinationDescriptorsV138(room).find(d=>d.destinationId==='logistics').socket;
          return socket.x+socket.w/2-22-78;
        }
      }
      return super.getNpcServiceOwnerYieldGoalV165?.(routeId,actor)??null;
    }
    canPreemptNpcServiceCourtesyV165(intent,saved) {
      const d=NPC_INTERDECK_DEFINITIONS_V165.find(d=>intent?.routeId===d.id+':deck-'+intent.deck&&intent.actor?.crewId===d.crewId);
      if(d&&saved?.deck===intent.deck) {
        if(saved.ownerCrewId===d.crewId&&saved.routeId===intent.routeId)return true;
        if(d.id==='maksim-cockpit'&&intent.deck===0&&saved.routeId==='mara-archives'&&saved.ownerCrewId==='crew-01-mara-vega')return true;
      }
      return Boolean(super.canPreemptNpcServiceCourtesyV165?.(intent,saved));
    }
    getNpcServiceTrafficIntentsV163() {
      const inherited=super.getNpcServiceTrafficIntentsV163?.()||[];
      const leased=new Set(this.getNpcInterdeckActorsV165().map(a=>a.crewId));
      const intents=inherited.filter(i=>!leased.has(i.actor?.crewId));
      for(const d of NPC_INTERDECK_DEFINITIONS_V165) {
        const a=this.npcInterdeckStateV165?.routes[d.id]?.actor,actor=this.npcInterdeckBodiesV165?.get(d.id);
        if(!a||!actor||!['walking-lift','waiting-lift','walking-portal','walking-home','lift'].includes(a.stage)||a.y!==532||deckOf(a.roomId)<0)continue;
        if(a.lift&&!['boarding','exiting'].includes(a.lift.phase))continue;
        const e=this.npcInterdeckStateV165.routes[d.id],g=getNpcInterdeckGeometryV165(d.id),cabinX=npcLiftSocketV165(a.deck,d.shaftId).x-22;
        const yieldGoal=this.getNpcServiceOwnerYieldGoalV165?.(d.id,actor);
        const goalX=finite(yieldGoal)?yieldGoal:a.lift?(a.lift.phase==='boarding'?a.lift.cabinX:a.lift.exitX):a.stage==='waiting-lift'?cabinX:a.stage==='walking-home'?e.origin.x:a.stage==='walking-lift'?cabinX+(Math.sign(a.x-cabinX)||-1)*96
          :d.id==='jun-sanitary'?144:g.faces.parent.opening.x+(g.faces.parent.opening.w-44)/2;
        intents.push({routeId:d.id+':deck-'+a.deck,actor,deck:a.deck,goalX,roomIds:HUB_DECKS[a.deck].rooms.map(r=>r.id),
          minX:24,maxX:HUB_WORLD.width-68,doorIds:doorsFor(a.deck).map(d=>d.id)});
      }
      return intents;
    }
    drawDoor(ctx,door,...args) {
      if(door.lift&&typeof door.shaftId==='string') {
        const trip=Object.values(this.npcInterdeckStateV165?.routes||{}).map(e=>e.actor?.lift)
          .find(trip=>trip&&trip.shaftId===door.shaftId&&npcLiftPoseV165(trip).deck===this.state?.deck);
        if(trip)door.progress=npcLiftDoorProgressV165(trip);
      }
      return super.drawDoor(ctx,door,...args);
    }
    npcInterdeckClipV165(actor) {
      const d=NPC_INTERDECK_DEFINITIONS_V165.find(d=>this.npcInterdeckBodiesV165?.get(d.id)===actor);
      if(!d)return null;const a=this.npcInterdeckStateV165.routes[d.id].actor;
      if(a.lift){if(['boarding','exiting'].includes(a.lift.phase))return null;const door=this.doorStates?.find(door=>door.shaftId===d.shaftId),m=door&&getLiftOcclusionV163(this,door,npcLiftDoorProgressV165(a.lift));
        return m?.opening?{...m.opening,x:m.opening.x+(m.opening.w-m.opening.w*npcLiftDoorProgressV165(a.lift))/2,w:m.opening.w*npcLiftDoorProgressV165(a.lift)}:null;}
      return npcInterdeckOcclusionV165(d.id,a);
    }
    npcAnimationRequest(actor) {
      const inherited=super.npcAnimationRequest(actor);
      return actor===this.npcInterdeckBodiesV165?.get('jun-sanitary')&&this.npcInterdeckStateV165?.routes['jun-sanitary']?.actor?.stage==='vertical'
        &&inherited?{...inherited,clipId:'idle',frame:0}:inherited;
    }
    drawJunParentRigV165(ctx) {
      const a=this.npcInterdeckStateV165.routes['jun-sanitary'].actor,rig=this.npcJunRigV165(a);
      const drawn=drawJunClimbRigV165(ctx,this.junClimbImageV165,rig);
      this.npcJunRenderV165={drawn,eligible:Boolean(rig?.eligible),reason:rig?.reason||null,
        kind:a.vertical.kind,contacts:rig?.contacts||null,asset:JUN_CLIMB_ASSET_V165.path,canonicalExact:false};
      return true;
    }
    drawNpcLifeV136(ctx,image,actor,sample,geometry) {
      if(actor===this.npcInterdeckBodiesV165?.get('jun-sanitary')) {
        const a=this.npcInterdeckStateV165.routes['jun-sanitary'].actor;
        if(a?.stage==='vertical')return this.drawJunParentRigV165(ctx);
      }
      const clip=this.npcInterdeckClipV165(actor);if(!clip)return super.drawNpcLifeV136(ctx,image,actor,sample,geometry);
      ctx.save();ctx.beginPath();ctx.rect(clip.x,clip.y,clip.w,clip.h);ctx.clip();
      try{super.drawNpcLifeV136(ctx,image,actor,sample,geometry)||drawHumanAtlasV133(ctx,image,geometry);}finally{ctx.restore();}return true;
    }
    drawSheetCell(ctx,image,...args) {
      const actor=this.getNpcInterdeckActorsV165().find(a=>this.npcImageCrewIds?.get(image)===a.crewId&&this.npcs?.includes(a));
      if(actor===this.npcInterdeckBodiesV165?.get('jun-sanitary')&&this.npcInterdeckStateV165?.routes['jun-sanitary']?.actor?.stage==='vertical')return this.drawJunParentRigV165(ctx);
      const clip=actor&&this.npcInterdeckClipV165(actor);if(!clip)return super.drawSheetCell(ctx,image,...args);
      ctx.save();ctx.beginPath();ctx.rect(clip.x,clip.y,clip.w,clip.h);ctx.clip();
      try{return super.drawSheetCell(ctx,image,...args);}finally{ctx.restore();}
    }
    drawDepthContactShadowV116(ctx,actor,supportY) {
      if(actor===this.npcInterdeckBodiesV165?.get('jun-sanitary')&&this.npcInterdeckStateV165?.routes['jun-sanitary']?.actor?.stage==='vertical')return false;
      const clip=this.npcInterdeckClipV165(actor);if(!clip)return super.drawDepthContactShadowV116(ctx,actor,supportY);
      ctx.save();ctx.beginPath();ctx.rect(clip.x,clip.y,clip.w,clip.h);ctx.clip();
      try{return super.drawDepthContactShadowV116(ctx,actor,supportY);}finally{ctx.restore();}
    }
    persist() {
      this.prepareNpcInterdeckV165();
      const original=this.onPersist;let patch;this.onPersist=value=>{patch=value;};
      try{super.persist();}finally{this.onPersist=original;}
      if(patch)original({...patch,npcInterdeckRoutesV165:normalizeNpcInterdeckRoutesV165(this.npcInterdeckStateV165)});
    }
    getSnapshot() {
      const snapshot=super.getSnapshot(),state=normalizeNpcInterdeckRoutesV165(this.npcInterdeckStateV165);
      return{...snapshot,npcInterdeckRoutesV165:{...state,scope:'actual-singleton-interdeck-annex-round-trip',
        courtesyPassingRequests:['tamsin-proving','mara-archives','echo-escape','cal-logistics','idris-engine','asha-refuge','leila-galley'].filter(id=>this.npcInterdeckPassingRequestV165(id)).map(routeId=>({routeId,reason:'physical-passenger-corridor',claimWatchCompletion:false})),
        routes:Object.fromEntries(NPC_INTERDECK_DEFINITIONS_V165.map(d=>[d.id,{...state.routes[d.id],
          definition:d,npcLiftTransportImplemented:true,preLoadTravelObserved:false,
          liftQueue:state.routes[d.id].actor?.stage==='waiting-lift'?this.npcLiftQueueBlockersV165(d,state.routes[d.id].actor):[],
          actualVelocity:this.npcInterdeckBodiesV165?.get(d.id)?.vx||0,
          cabin:state.routes[d.id].actor?.lift?{...state.routes[d.id].actor.lift,
            doorProgress:npcLiftDoorProgressV165(state.routes[d.id].actor.lift),reserved:true,
            coordinateHandoff:'opaque-covered-cabin',walkingDistanceIncludesChartJump:false}:null,
          verticalRig:d.id==='jun-sanitary'?{...this.npcJunRenderV165,artReady:this.npcJunClimbArtReadyV165(),canonicalExact:false}:null,
          occlusion:npcInterdeckOcclusionV165(d.id,state.routes[d.id].actor)}]))}};
    }
  };
}
