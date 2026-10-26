import { HUB_DECKS, buildHubObstacleGeometryV87 } from './hub-game.js';
import { HubGame as RosterHubV52 } from './hub-v52-runtime.js';
import { getNpcRoutineStandingAnchorV158 } from './hub-v62-runtime.js';
import { HUB_ANNEX_BY_ID_V137 } from './hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from './hub-annex-runtime-geometry-v139.js';
import { annexNpcDutiesV141, createAnnexNpcsV141, getAnnexNpcPlacementV141 } from './hub-annex-npc-life-v141.js';
import { createServiceRouteV161 } from './npc-service-routes-v161.js';
import { moveNpcAgainstGeometryV136, advanceNpcLifeV136, spreadNpcStationSpawnsV136 } from './npc-life-v136.js';
import { drawHumanAtlasV133 } from './human-visual-contract-v133.js';
import { CAL_CLIMB_ASSET_V165, CAL_CLIMB_BODY_V165, resolveCalClimbRigV165,
  calClimbImageReadyV165, drawCalClimbRigV165 } from './npc-cal-climb-rig-v165.js';

const ID='crew-16-cal-mercer',HOME='vehicle-bay',ANNEX='logistics',DECK=2;
const parent=HUB_DECKS[DECK].rooms.find(room=>room.id===HOME);
const annex=getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[ANNEX]);
const ladder=annex.ladders.find(item=>item.id==='logistics-ladder');
const catwalk=annex.platforms.find(item=>item.id==='logistics-catwalk');
const floor=annex.platforms.find(item=>item.role==='floor');
const definition={id:'cal-logistics',crewId:ID,deck:DECK,parentRoomId:HOME,
  annexRoomId:ANNEX,targetX:1000,duty:'freight-handling-inspection'};
const portal=createServiceRouteV161(definition,{schema:165,stateField:'npcCalLogisticsRouteV165'});
const post=()=>createAnnexNpcsV141([{...definition,roomId:ANNEX}],new Map())[0];
const postX=post().x;
const baseX=ladder.x-CAL_CLIMB_BODY_V165.waistStandoff-22;
const finite=Number.isFinite,copy=value=>value==null?value:JSON.parse(JSON.stringify(value));
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const crossing=state=>['opening','covering','revealing'].includes(state?.stage);
const vertical=state=>['floor-mount','climbing-up','top-dismount','top-mount','climbing-down','floor-dismount'].includes(state?.stage);
const phases=['walking','service','opening','covering','revealing','floor-mount','climbing-up',
  'top-dismount','top-mount','climbing-down','floor-dismount'];
const reasons=['daily-schedule','active-crisis','infestation','medical-recovery','mission-assignment',
  'unavailable','interaction','occupied','art-unavailable','pose-unavailable'];
export const NPC_CAL_LOGISTICS_ROUTE_V165=Object.freeze({schema:165,...definition,actorWidth:44,actorHeight:92,
  floorY:floor.y,catwalkY:catwalk.y,ladderId:ladder.id,ladderBaseX:baseX,postX,
  maximumHorizontalSpeed:27,maximumVerticalSpeed:24,mountSeconds:.65,
  source:'actual-native-Cal-parent-paired-door-real-ladder-and-catwalk',
  scope:'same-deck-parent-annex-vertical-round-trip',stationToWorkTravelObserved:false,npcLiftTransportImplemented:false});
export const NPC_CAL_LOGISTICS_GEOMETRY_V165=Object.freeze({parent,annex,ladder,catwalk,floor,
  faces:portal.faces,climbLane:{x:baseX-12,y:ladder.top-104,w:68,h:ladder.bottom-ladder.top+104}});

export function normalizeNpcCalLogisticsRouteV165(value) {
  const a=value?.schema===165?value.actor:null,h=value?.schema===165?value.nativeHandoff:null;
  const nativeHandoff=!a&&h?.crewId===ID&&[HOME,ANNEX].includes(h.fromRoomId)
    &&HUB_DECKS.some(deck=>deck.rooms.some(room=>room.id===h.toRoomId))
    &&['daily-schedule','medical-recovery','mission-assignment','unavailable'].includes(h.reason)&&h.observedTravel===false
    ?{crewId:ID,fromRoomId:h.fromRoomId,toRoomId:h.toRoomId,reason:h.reason,observedTravel:false,owner:'native-v62-routine'}:null;
  const empty={schema:165,actor:null,nativeHandoff};
  if(!a||a.crewId!==ID||a.deck!==DECK||![HOME,ANNEX].includes(a.roomId)||![HOME,ANNEX].includes(a.targetRoomId)
    ||!phases.includes(a.stage)||![HOME,ANNEX].includes(a.admittedRoomId)
    ||![a.x,a.y,a.homeX,a.dutyX,a.postX,a.velocity,a.verticalVelocity,a.phaseProgress,a.doorProgress,
      a.time,a.distance,a.verticalDistance].every(finite)
    ||a.postX!==postX||a.dutyX!==baseX||a.homeX<parent.xStart+96||a.homeX>parent.xEnd-140
    ||Math.abs(a.velocity)>27.000001||Math.abs(a.verticalVelocity)>24.000001
    ||a.phaseProgress<0||a.phaseProgress>1||a.doorProgress<0||a.doorProgress>1
    ||a.time<0||a.time>1e9||a.distance<0||a.distance>1e9||a.verticalDistance<0||a.verticalDistance>1e9
    ||![-1,1].includes(a.facing)||!Number.isInteger(a.crossings)||a.crossings<0||a.crossings>1e6
    ||!Number.isInteger(a.arrivals)||a.arrivals<0||a.arrivals>1e6)return empty;
  if(a.roomId===HOME&&(a.y!==532||a.x<parent.xStart+24||a.x>parent.xEnd-68||vertical(a)))return empty;
  if(a.roomId===ANNEX&&(a.x<24||a.x>annex.world.width-68||a.y<376||a.y>532))return empty;
  if(vertical(a)) {
    if(a.roomId!==ANNEX||Math.abs(a.x-baseX)>.26||a.velocity!==0||a.facing!==1)return empty;
    if(['floor-mount','floor-dismount'].includes(a.stage)&&a.y!==532
      ||['top-mount','top-dismount'].includes(a.stage)&&a.y!==376)return empty;
    const kind=a.stage==='climbing-up'||a.stage==='climbing-down'?'climb':a.stage;
    if(!resolveCalClimbRigV165({...a,w:44,h:92,ladderId:ladder.id},ladder,{kind,progress:a.phaseProgress})?.eligible)return empty;
  } else if(a.roomId===ANNEX&&![376,532].includes(a.y))return empty;
  if(a.roomId===ANNEX&&a.y===376&&(a.x<catwalk.x+12||a.x+44>catwalk.x+catwalk.w-12))return empty;
  if(crossing(a)) {
    const face=a.roomId===HOME?portal.faces.parent:portal.faces.local;
    const x=face.opening.x+(face.opening.w-44)/2;
    if(a.y!==532||Math.abs(a.x-x)>.26||a.velocity!==0||a.verticalVelocity!==0)return empty;
    if(['opening','covering'].includes(a.stage)&&a.roomId===(a.targetRoomId===ANNEX?ANNEX:HOME)
      ||a.stage==='revealing'&&a.roomId!==a.targetRoomId)return empty;
  }
  if(a.stage==='service'&&(Math.abs(a.x-(a.roomId===ANNEX?postX:a.homeX))>.26
    ||a.roomId===ANNEX&&a.y!==376||a.roomId!==a.targetRoomId))return empty;
  return {schema:165,nativeHandoff:null,actor:{crewId:ID,deck:DECK,roomId:a.roomId,x:a.x,y:a.y,
    homeX:a.homeX,dutyX:baseX,postX,targetRoomId:a.targetRoomId,stage:a.stage,
    velocity:a.velocity,verticalVelocity:a.verticalVelocity,phaseProgress:a.phaseProgress,
    facing:a.facing,doorProgress:a.doorProgress,time:a.time,distance:a.distance,verticalDistance:a.verticalDistance,
    crossings:a.crossings,arrivals:a.arrivals,admittedRoomId:a.admittedRoomId,
    reason:reasons.includes(a.reason)?a.reason:'unavailable'}};
}

export function createNpcCalLogisticsStateV165(actor) {
  if(actor?.crewId!==ID||![HOME,ANNEX].includes(actor.roomId))return null;
  const atHome=actor.roomId===HOME;
  const template=RosterHubV52.prototype.createNpcs.call({},DECK).find(item=>item.crewId===ID);
  const origin=spreadNpcStationSpawnsV136([{...template,roomId:HOME,
    x:getNpcRoutineStandingAnchorV158(ID,HOME,'station'),mobile:false}],[parent])[0];
  return normalizeNpcCalLogisticsRouteV165({schema:165,actor:{crewId:ID,deck:DECK,roomId:actor.roomId,
    x:actor.x,y:actor.y,homeX:atHome?actor.x:origin.x,dutyX:baseX,postX,
    targetRoomId:actor.roomId,stage:'service',velocity:0,verticalVelocity:0,phaseProgress:0,
    facing:actor.facing===-1?-1:1,doorProgress:0,time:0,distance:0,verticalDistance:0,
    crossings:0,arrivals:0,admittedRoomId:actor.roomId,reason:'daily-schedule'}}).actor;
}
function interruption(resolution,actor) {
  if(!resolution||actor.alive===false||actor.downed)return'unavailable';
  if(resolution.needsCare)return'medical-recovery';
  if(resolution.missionAssigned)return'mission-assignment';
  if(resolution.alert)return resolution.reason==='active-crisis'?'active-crisis':'infestation';
  if(actor.workClock>0||actor.supportClock>0)return'interaction';
  return null;
}
function laneOccupied(actor,peers,player) {
  return [...peers,...(player?[player]:[])].some(body=>body!==actor&&body.crewId!==ID&&body.alive!==false
    &&body.roomId===ANNEX&&[body.x,body.y,body.w,body.h].every(finite)
    &&overlap(body,NPC_CAL_LOGISTICS_GEOMETRY_V165.climbLane));
}
function walkCatwalk(previous,actor,dt,goal,peers,player) {
  const s={...previous},origin=s.x;
  const bodies=[...peers,...(player?[player]:[])].filter(body=>body!==actor&&body.crewId!==ID&&body.alive!==false
    &&body.roomId===ANNEX&&[body.x,body.y,body.w,body.h].every(finite)&&Math.abs(body.y+body.h-catwalk.y)<16);
  const boxes=[...annex.colliders,...bodies.map(body=>({x:body.x-12,y:body.y,w:body.w+24,h:body.h}))];
  for(let remaining=dt;remaining>1e-8;) {
    const step=Math.min(1/120,remaining);remaining-=step;
    const distance=Math.abs(goal-s.x),direction=Math.sign(goal-s.x);
    let speed=Math.min(27,Math.sqrt(2*92*Math.max(0,distance-.1)));
    for(const body of bodies)if(direction*(body.x+body.w/2-s.x-22)>0) {
      const gap=direction>0?body.x-s.x-44-12:s.x-body.x-body.w-12;
      speed=Math.min(speed,Math.sqrt(2*92*Math.max(0,gap-.2)));
    }
    const velocity=s.velocity+clamp(direction*speed-s.velocity,-92*step,92*step);
    const proposed=clamp(s.x+(s.velocity+velocity)*.5*step,Math.min(s.x,goal),Math.max(s.x,goal));
    const contact=moveNpcAgainstGeometryV136({...actor,x:s.x},proposed,boxes);
    s.x=contact.x;s.velocity=contact.blocked?0:velocity;s.blocked||=contact.blocked;
  }
  s.actualVelocity=(s.x-origin)/dt;s.distance=Math.min(1e9,s.distance+Math.abs(s.x-origin));
  if(Math.abs(s.actualVelocity)>.1)s.facing=Math.sign(s.actualVelocity);
  return s;
}

export function advanceNpcCalLogisticsV165(previous,actor,delta,{resolution,duty=false,peers=[],player=null,
  portalBusy=false,running=true,reducedMotion=false,artReady=false,yieldGoalX=null}={}) {
  if(!previous||!actor||!running||!finite(delta)||delta<=0)return previous;
  const dt=Math.min(delta,.1),priority=interruption(resolution,actor);
  const target=duty?ANNEX:HOME;
  if(crossing(previous)||!vertical(previous)&&previous.y===532) {
    const next=portal.advance(previous,actor,dt,{resolution,duty,peers,player,portalBusy,reducedMotion,
      yieldGoalX,returnToOrigin:true});
    let out={...next,postX,dutyX:baseX,verticalVelocity:0,verticalDistance:previous.verticalDistance,phaseProgress:0};
    if(out.roomId===ANNEX&&out.stage==='service'&&out.y===532) {
      // The foot of the ladder is a waypoint, never the catwalk duty arrival.
      out.arrivals=previous.arrivals;out.stage='walking';
      if(out.reason!=='daily-schedule')return out;
      if(!artReady)out.reason='art-unavailable';
      else if(laneOccupied(actor,peers,player))out.reason='occupied';
      else {out.stage='floor-mount';out.facing=1;out.velocity=0;out.phaseProgress=0;}
    }
    return out;
  }
  let s={...previous,time:Math.min(1e9,previous.time+dt),targetRoomId:target,
    actualVelocity:0,verticalVelocity:0,reason:priority||'daily-schedule'};
  if(priority)return{...s,velocity:0};
  if(vertical(s)) {
    if(!artReady)return{...s,velocity:0,reason:'art-unavailable'};
    if(laneOccupied(actor,peers,player))return{...s,velocity:0,reason:'occupied'};
    s.facing=1;s.velocity=0;
    if(s.stage==='climbing-up'||s.stage==='climbing-down') {
      const goal=s.stage==='climbing-up'?376:532,origin=s.y;
      const proposed=s.y+clamp(goal-s.y,-24*dt,24*dt);
      const pose=resolveCalClimbRigV165({...actor,y:proposed,facing:1,ladderId:ladder.id},ladder);
      if(!pose?.eligible)return{...s,reason:'pose-unavailable'};
      s.y=proposed;s.verticalVelocity=(s.y-origin)/dt;
      s.verticalDistance=Math.min(1e9,s.verticalDistance+Math.abs(s.y-origin));
      if(Math.abs(s.y-goal)<1e-8){s.y=goal;s.stage=goal===376?'top-dismount':'floor-dismount';s.phaseProgress=0;s.verticalVelocity=0;}
    } else {
      const progress=Math.min(1,s.phaseProgress+dt/.65);
      const pose=resolveCalClimbRigV165({...actor,facing:1,ladderId:ladder.id},ladder,{kind:s.stage,progress});
      if(!pose?.eligible)return{...s,reason:'pose-unavailable'};
      s.phaseProgress=progress;
      if(progress===1) {
        if(s.stage==='floor-mount')s.stage='climbing-up';
        else if(s.stage==='top-mount')s.stage='climbing-down';
        else if(s.stage==='top-dismount')s.stage=target===ANNEX?'walking':'top-mount';
        else s.stage='walking';
        s.phaseProgress=0;
      }
    }
    return s;
  }
  if(s.roomId===ANNEX&&s.y===376) {
    if(s.stage==='service'&&target===ANNEX)return s;
    s.stage='walking';const goal=target===ANNEX?postX:baseX;
    s=walkCatwalk(s,actor,dt,goal,peers,player);
    if(Math.abs(s.x-goal)<.25&&Math.abs(s.velocity)<3) {
      s.velocity=0;
      if(target===ANNEX){s.stage='service';s.arrivals=Math.min(1e6,s.arrivals+1);}
      else if(!artReady)s.reason='art-unavailable';
      else if(laneOccupied(actor,peers,player))s.reason='occupied';
      else{s.stage='top-mount';s.phaseProgress=0;s.facing=1;}
    }
    return s;
  }
  return s;
}

/** The local Cal circuit owns one native body. It does not run the player's
 * ladder physics, change the player's deck, synthesize a lift passenger or
 * replace the physical support with a painted station. */
export function withHubNpcCalLogisticsRouteV165(Base) {
  return class HubNpcCalLogisticsRouteV165 extends Base {
    start(save={},options={}) {
      this.calLogisticsSandboxV165=Boolean(options.editorProject||options.forgeJourneyV141||this.forgeSessionV141);
      const normalized=normalizeNpcCalLogisticsRouteV165(this.calLogisticsSandboxV165?null:save.npcCalLogisticsRouteV165);
      this.calLogisticsStateV165=normalized.actor;this.calLogisticsHandoffV165=normalized.nativeHandoff;
      this.calLogisticsActorV165=null;this.calLogisticsRenderV165=null;
      if(!this.calClimbImageV165&&typeof globalThis.Image==='function') {
        const image=new globalThis.Image();image.decoding='async';image.src=CAL_CLIMB_ASSET_V165.path;
        this.calClimbImageV165=image;image.addEventListener?.('load',()=>this.draw?.(),{once:true});
      }
      return super.start(save,options);
    }

    getNpcCalLogisticsActorV165(){return this.calLogisticsActorV165;}
    getNpcServicePhysicalStateV165(routeId){
      return routeId==='cal-logistics'
        ?normalizeNpcCalLogisticsRouteV165({schema:165,actor:this.calLogisticsStateV165}).actor
        :super.getNpcServicePhysicalStateV165?.(routeId);
    }
    calLogisticsReentryBlockedV165(){
      return this.calLogisticsHandoffV165?.reason==='unavailable'
        &&annexNpcDutiesV141(this.npcRoutineResolutionsV62,this).some(item=>item.crewId===ID&&item.roomId===ANNEX);
    }
    getNpcServiceOwnedActorsV163(){
      const inherited=super.getNpcServiceOwnedActorsV163?.()||[],actor=this.calLogisticsActorV165;
      return actor?[...inherited.filter(item=>item.crewId!==ID),actor]:inherited;
    }
    getNpcServiceTrafficIntentsV163(){
      const inherited=super.getNpcServiceTrafficIntentsV163?.()||[];
      const actor=this.calLogisticsActorV165,s=this.calLogisticsStateV165;
      if(!actor||!s||s.roomId!==HOME||s.stage!=='walking'||s.reason!=='daily-schedule')return inherited;
      const yieldGoal=this.getNpcServiceOwnerYieldGoalV165?.('cal-logistics',actor);
      return [...inherited,{routeId:'cal-logistics',actor,deck:DECK,
        goalX:finite(yieldGoal)?yieldGoal:s.targetRoomId===ANNEX?portal.faces.parent.opening.x+(portal.faces.parent.opening.w-44)/2:s.homeX,
        roomIds:[HOME],minX:parent.xStart+24,maxX:parent.xEnd-68,doorIds:[]}];
    }

    createNpcs(deck){
      const natives=super.createNpcs(deck);
      if(this.calLogisticsSandboxV165||this.editorPlaytest||this.forgeSessionV141)return natives;
      if(this.calLogisticsReentryBlockedV165())return natives.filter(actor=>actor.crewId!==ID);
      const r=this.npcRoutineResolutionsV62?.get(ID);
      if(!this.calLogisticsActorV165&&!r?.needsCare&&!r?.missionAssigned) {
        const saved=this.calLogisticsStateV165;
        let source=natives.find(actor=>actor.crewId===ID&&actor.roomId===HOME)
          ||super.ensureAnnexNpcCohortV141().find(actor=>actor.crewId===ID&&actor.roomId===ANNEX);
        if(!source&&!saved&&r?.roomId===HOME&&r.deck===DECK)
          source=super.createNpcs(DECK).find(actor=>actor.crewId===ID&&actor.roomId===HOME);
        if(saved||source&&source.alive!==false) {
          const template=source||RosterHubV52.prototype.createNpcs.call({},DECK).find(actor=>actor.crewId===ID);
          const actor={...template,...(saved?{x:saved.x,y:saved.y,roomId:saved.roomId,facing:saved.facing}:{}),
            w:44,h:92,vx:0,mobile:false};
          const state=saved||createNpcCalLogisticsStateV165(actor);
          if(state){this.calLogisticsActorV165=actor;this.calLogisticsStateV165=state;this.calLogisticsHandoffV165=null;this.refreshCalLogisticsV165();}
        }
      }
      const actor=this.calLogisticsActorV165;
      return actor?[...natives.filter(item=>item.crewId!==ID),...(deck===DECK&&actor.roomId===HOME?[actor]:[])]:natives;
    }
    ensureAnnexNpcCohortV141(){
      const inherited=super.ensureAnnexNpcCohortV141(),actor=this.calLogisticsActorV165;
      if(this.calLogisticsReentryBlockedV165())return inherited.filter(item=>item.crewId!==ID);
      return actor?[...inherited.filter(item=>item.crewId!==ID),...(actor.roomId===ANNEX?[actor]:[])]:inherited;
    }
    stepHubNpcLifeV136(actor,delta,options){
      if(actor===this.calLogisticsActorV165)return;
      return super.stepHubNpcLifeV136(actor,delta,options);
    }
    tickAnnexNpcLifeV141(delta){
      const actor=this.calLogisticsActorV165,active=this.activeAnnexNpcsV141;
      this.activeAnnexNpcsV141=()=>active.call(this).filter(item=>item!==actor);
      try{return super.tickAnnexNpcLifeV141(delta);}finally{this.activeAnnexNpcsV141=active;}
    }
    refreshCalLogisticsV165(){
      const actor=this.calLogisticsActorV165,s=this.calLogisticsStateV165,r=this.npcRoutineResolutionsV62?.get(ID);
      if(!actor||!s)return;
      const local=actor.roomId===ANNEX,attached=vertical(s),working=local&&s.stage==='service'&&s.y===376;
      Object.assign(actor,{annexNativeV141:local,annexDutyV141:local?working?definition.duty:'freight-access-transit':undefined,
        annexSupportIdV156:working?catwalk.id:local&&s.y===532?floor.id:undefined,
        routinePhaseV62:working?'work':r?.roomId===actor.roomId?r.phase:'station',
        routineReasonV62:r?.reason,routineDeterministicKeyV62:r?.deterministicKey,
        climbing:attached,ladderId:attached?ladder.id:undefined,grounded:!attached,
        min:actor.x,max:actor.x,mobile:false,alerted:Boolean(r?.alert)});
    }

    npcAnimationRequest(actor){
      const inherited=super.npcAnimationRequest(actor);
      if(actor!==this.calLogisticsActorV165||!vertical(this.calLogisticsStateV165))return inherited;
      // The clean component renderer owns the cycle. Keep the legacy sample
      // on its one Cal climb key, without time-looped fake rung events.
      return inherited?.clipId==='climb'?{...inherited,frame:11}:inherited;
    }
    sampleNpcAnimation(actor,options={}){
      return actor===this.calLogisticsActorV165&&vertical(this.calLogisticsStateV165)
        ?super.sampleNpcAnimation(actor,{...options,emit:false,discardEvents:true})
        :super.sampleNpcAnimation(actor,options);
    }
    npcAnnexDoorDemandV159(id){
      return Math.max(super.npcAnnexDoorDemandV159?.(id)||0,
        id===ANNEX&&this.calLogisticsActorV165?this.calLogisticsStateV165?.doorProgress||0:0);
    }
    npcAnnexDoorReservedV159(id){
      if(super.npcAnnexDoorReservedV159?.(id))return true;
      const s=this.calLogisticsStateV165,actor=this.calLogisticsActorV165;
      if(id!==ANNEX||!actor||!s)return false;
      const face=actor.roomId===ANNEX?portal.faces.local:portal.faces.parent;
      return crossing(s)||s.doorProgress>0||s.y===532&&actor.x<=face.opening.x+face.opening.w+12&&actor.x+44>=face.opening.x-12;
    }
    hubDoorPairV142(space,endpointId=null){
      const inherited=super.hubDoorPairV142(space,endpointId);
      return inherited&&space?.id===ANNEX?{...inherited,parent:{...inherited.parent,...portal.faces.parent},
        local:{...inherited.local,...portal.faces.local}}:inherited;
    }
    drawNpcLifeV136(ctx,image,actor,sample,geometry){
      if(actor!==this.calLogisticsActorV165)return super.drawNpcLifeV136(ctx,image,actor,sample,geometry);
      const s=this.calLogisticsStateV165;
      if(vertical(s)){
        const kind=s.stage==='climbing-up'||s.stage==='climbing-down'?'climb':s.stage;
        const rig=resolveCalClimbRigV165(actor,ladder,{kind,progress:s.phaseProgress});
        const drawn=drawCalClimbRigV165(ctx,this.calClimbImageV165,rig);
        this.calLogisticsRenderV165={drawn,kind,contacts:rig?.contacts||null,arms:rig?.arms||null,
          legs:rig?.legs||null,source:rig?.source||null,asset:CAL_CLIMB_ASSET_V165.path,
          actorX:actor.x,actorY:actor.y,stage:s.stage,time:s.time,canonicalExact:false};
        // A restored mounted body waits for its own transparent asset. The
        // old whole-cell climb key contains a painted ladder and must never
        // be used as a substitute during that loading interval.
        return true;
      }
      const clip=portal.occlusion(s);
      if(!clip)return super.drawNpcLifeV136(ctx,image,actor,sample,geometry);
      ctx.save();ctx.beginPath();ctx.rect(clip.x,clip.y,clip.w,clip.h);ctx.clip();
      try{super.drawNpcLifeV136(ctx,image,actor,sample,geometry)||drawHumanAtlasV133(ctx,image,geometry);}
      finally{ctx.restore();}
      return true;
    }
    drawSheetCell(ctx,image,...args){
      const actor=this.calLogisticsActorV165;
      const clip=actor&&this.npcImageCrewIds?.get(image)===ID&&this.npcs?.includes(actor)
        &&portal.occlusion(this.calLogisticsStateV165);
      if(!clip)return super.drawSheetCell(ctx,image,...args);
      ctx.save();ctx.beginPath();ctx.rect(clip.x,clip.y,clip.w,clip.h);ctx.clip();
      try{return super.drawSheetCell(ctx,image,...args);}finally{ctx.restore();}
    }
    drawDepthContactShadowV116(ctx,actor,supportY){
      if(actor===this.calLogisticsActorV165&&vertical(this.calLogisticsStateV165))return false;
      const clip=actor===this.calLogisticsActorV165&&portal.occlusion(this.calLogisticsStateV165);
      if(!clip)return super.drawDepthContactShadowV116(ctx,actor,supportY);
      ctx.save();ctx.beginPath();ctx.rect(clip.x,clip.y,clip.w,clip.h);ctx.clip();
      try{return super.drawDepthContactShadowV116(ctx,actor,supportY);}finally{ctx.restore();}
    }

    update(delta){
      const wasRunning=this.running,before=this.calLogisticsActorV165;
      const clocks=before&&Object.fromEntries(['workClock','supportClock','alertClock'].map(key=>[key,finite(before[key])?before[key]:0]));
      const result=super.update(delta);
      if(!wasRunning||!this.running||this.calLogisticsSandboxV165||!finite(delta)||delta<=0)return result;
      const actor=this.calLogisticsActorV165,s=this.calLogisticsStateV165;if(!actor||!s)return result;
      const dt=Math.min(delta,.1),r=this.npcRoutineResolutionsV62?.get(ID);
      const priority=r?.needsCare?'medical-recovery':r?.missionAssigned?'mission-assignment'
        :actor.alive===false||actor.downed?'unavailable':null;
      if(priority){this.handoffCalLogisticsV165(priority,r);this.npcs=this.createNpcs(this.state.deck);return result;}
      if(actor===before)for(const[key,value]of Object.entries(clocks))
        actor[key]=finite(actor[key])&&actor[key]>value?actor[key]:Math.max(0,value-dt);
      const local=this.currentAnnexV71?.();
      const player=!this.ventActorV62&&this.player?{...this.player,roomId:local?.id||(this.state.deck===DECK?this.state.roomId:null)}:null;
      const peers=[...(this.getNpcServicePeersV163?.(DECK,ID)||[]),...this.ensureAnnexNpcCohortV141()];
      const passingDuty=this.getNpcServicePassingDutyV165?.('cal-logistics',actor);
      const duty=typeof passingDuty==='boolean'?passingDuty
        :annexNpcDutiesV141(this.npcRoutineResolutionsV62,this).some(item=>item.crewId===ID&&item.roomId===ANNEX);
      const portalBusy=this.annexTransitionV71?.annexId===ANNEX||this.hubDoorClosingV142?.annexId===ANNEX
        ||this.hubTrainingV132?.lockedDoorIds?.some(id=>[ANNEX,portal.definition.connectionId].includes(id));
      const heldAtPost=s.stage==='service'&&s.roomId===ANNEX&&s.doorProgress===0&&!r?.alert
        &&actor.workClock<=0&&actor.supportClock<=0
        &&this.shouldHoldNpcServiceOwnerV165?.('cal-logistics',actor,s)===true;
      const next=heldAtPost?{...s,time:Math.min(1e9,s.time+dt),velocity:0,verticalVelocity:0,
        actualVelocity:0,reason:'occupied'}:advanceNpcCalLogisticsV165(s,actor,dt,{resolution:r,duty,peers,player,portalBusy,
        yieldGoalX:this.getNpcServiceOwnerYieldGoalV165?.('cal-logistics',actor),
        running:true,reducedMotion:this.reducedMotion,artReady:calClimbImageReadyV165(this.calClimbImageV165)});
      const changed=next.roomId!==actor.roomId;
      Object.assign(actor,{x:next.x,y:next.y,roomId:next.roomId,facing:next.facing,vx:next.actualVelocity||0,vy:next.verticalVelocity||0});
      this.calLogisticsStateV165=next;this.refreshCalLogisticsV165();
      actor.lifeV136={schema:136,context:'cal-logistics-v165',x:actor.x,y:actor.y,time:next.time,
        velocity:next.velocity,actualVelocity:actor.vx,facing:actor.facing,
        mode:Math.abs(actor.vx)>.1?'moving':next.reason==='daily-schedule'?'idle':'blocked',
        passive:null,previousPassive:null,blend:1};
      if(next.stage==='service'&&next.roomId===ANNEX&&next.reason==='daily-schedule'){
        const life=advanceNpcLifeV136(actor.lifeV136,actor,dt,{room:annex,peers,colliders:annex.colliders,
          context:'cal-logistics-catwalk-v165',reducedMotion:this.reducedMotion});if(life)actor.lifeV136=life;
      }
      if(changed)this.npcs=[...(this.npcs||[]).filter(item=>item.crewId!==ID),...(this.state.deck===DECK&&actor.roomId===HOME?[actor]:[])];
      // Keep one real supported frame at the completed bookmark before the
      // native routine resumes. A completion must remain observable and
      // savable instead of disappearing in the same update that reaches it.
      if(s.stage==='service'&&s.roomId===HOME&&next.stage==='service'&&next.roomId===HOME
        &&!duty&&!r?.alert&&r?.roomId!==HOME){
        this.handoffCalLogisticsV165('daily-schedule',r);this.npcs=this.createNpcs(this.state.deck);
      }
      return result;
    }
    handoffCalLogisticsV165(reason,resolution){
      this.calLogisticsHandoffV165={crewId:ID,fromRoomId:this.calLogisticsActorV165?.roomId||HOME,
        toRoomId:resolution?.roomId,reason,observedTravel:false,owner:'native-v62-routine'};
      this.calLogisticsActorV165=null;this.calLogisticsStateV165=null;this.calLogisticsRenderV165=null;
    }
    persist(){
      const original=this.onPersist;let patch;this.onPersist=value=>{patch=value;};
      try{super.persist();}finally{this.onPersist=original;}
      if(patch)original({...patch,npcCalLogisticsRouteV165:normalizeNpcCalLogisticsRouteV165({schema:165,
        actor:this.calLogisticsStateV165,nativeHandoff:this.calLogisticsHandoffV165})});
    }
    getSnapshot(){
      return{...super.getSnapshot(),npcCalLogisticsRouteV165:{...normalizeNpcCalLogisticsRouteV165({schema:165,
        actor:this.calLogisticsStateV165,nativeHandoff:this.calLogisticsHandoffV165}),
        reserved:this.npcAnnexDoorReservedV159(ANNEX),occlusion:portal.occlusion(this.calLogisticsStateV165),
        sourceFace:copy(portal.faces.parent),annexFace:copy(portal.faces.local),postSupport:copy(catwalk),
        ladder:copy(ladder),climbLane:copy(NPC_CAL_LOGISTICS_GEOMETRY_V165.climbLane),
        artReady:calClimbImageReadyV165(this.calClimbImageV165),rig:copy(this.calLogisticsRenderV165),
        initialCondition:this.calLogisticsStateV165?.admittedRoomId||null,
        preLoadTravelObserved:false,stationToWorkTravelObserved:false,npcLiftTransportImplemented:false,
        scope:NPC_CAL_LOGISTICS_ROUTE_V165.scope}};
    }
  };
}
