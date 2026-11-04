import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { createContext, runInContext } from 'node:vm';
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

const calQaSourcesV181=new Map();
function calQaSourceV181(name, callback = false) {
  const key=name+':'+callback;
  if(calQaSourcesV181.has(key))return calQaSourcesV181.get(key);
  const python = `import ast,json,sys
from pathlib import Path
tree=ast.parse(Path(sys.argv[1]).read_text()); scope={}
for node in tree.body:
 if isinstance(node,ast.Assign) and isinstance(node.value,ast.Constant) and isinstance(node.value.value,str):
  for target in node.targets:
   if isinstance(target,ast.Name): scope[target.id]=node.value.value
if sys.argv[3]=='literal': result=scope[sys.argv[2]]
else:
 owner=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name==sys.argv[2])
 call=next(n for n in ast.walk(owner) if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.attr=='evaluate')
 result=eval(compile(ast.Expression(call.args[0]),'<actual-Cal-QA-observer>','eval'),scope)
print(json.dumps(result))`;
  const source=JSON.parse(execFileSync('python3', ['-c', python,
    process.env.ATF_QA_CAL_SOURCE || new URL('qa-npc-cal-logistics-route-v165.py', import.meta.url).pathname,
    name, callback ? 'callback' : 'literal'], { encoding: 'utf8', timeout: 30000 }));
  calQaSourcesV181.set(key,source);return source;
}
function calQaChecksV181(cases) {
  const python = `import ast,json,math,sys
from pathlib import Path
tree=ast.parse(Path(sys.argv[1]).read_text())
names={'observed_station_origin_v181','station_origin_bookmark_v181','observed_station_logistics_return_v181'}
functions=[node for node in tree.body if isinstance(node,ast.FunctionDef) and node.name in names]
assert len(functions)==3
scope={'math':math};exec(compile(ast.Module(body=functions,type_ignores=[]),'<actual-Cal-QA-guards>','exec'),scope)
print(json.dumps([scope[row['function']](*row['arguments']) for row in json.loads(sys.stdin.read())]))`;
  return JSON.parse(execFileSync('python3', ['-c', python,
    process.env.ATF_QA_CAL_SOURCE || new URL('qa-npc-cal-logistics-route-v165.py', import.meta.url).pathname],
    { input: JSON.stringify(cases), encoding: 'utf8', timeout: 30000 }));
}
function actualCalObservationV181(hub) {
  return runInContext('(' + calQaSourceV181('OBSERVE') + ')()', createContext({ __ATF_HUB__: hub, structuredClone }));
}

test('the Cal QA station receipt requires the actual pre-watch native owner and rejects an inferred or already traveled origin', () => {
  const initial=actualCalObservationV181(runtime()), cases=[{function:'observed_station_origin_v181',arguments:[initial]}];
  for(const mutate of[
    s=>{s.clock.hour=9.5;}, s=>{s.routine.phase='work';}, s=>{s.routine.roomId='dropship-hangar';},
    s=>{s.routine.alert=true;}, s=>{s.routine.needsCare=true;}, s=>{s.routine.missionAssigned=true;},
    s=>{s.route.actor.x+=1;}, s=>{s.route.actor.homeX+=1;}, s=>{s.route.actor.deck=3;},
    s=>{s.route.actor.admittedRoomId='logistics';}, s=>{s.route.actor.distance=1;},
    s=>{s.route.actor.crossings=1;}, s=>{s.route.actor.arrivals=1;}, s=>{s.route.actor.stage='walking';},
    s=>{s.actual.alive=false;}, s=>{s.actual.w=43;}, s=>{s.ownerCount=2;}, s=>{s.visibleSingleton=false;}
  ]) {const state=structuredClone(initial);mutate(state);cases.push({function:'observed_station_origin_v181',arguments:[state]});}
  const results=calQaChecksV181(cases), origin=results[0];
  assert.ok(origin);assert.equal(origin.x,initial.actual.x);assert.equal(origin.y,532);
  assert.equal(origin.source,'observed-native-station-before-watch');assert.equal(origin.deck,2);
  assert.deepEqual(results.slice(1),Array(cases.length-1).fill(null));
});

test('the Cal QA local receipt binds the real catwalk and physical return to the observed station without crediting V62 travel', () => {
  const h=runtime(), initial=actualCalObservationV181(h);
  const [origin]=calQaChecksV181([{function:'observed_station_origin_v181',arguments:[initial]}]);
  context(h,9.5);tick(h,180);h.local='logistics';const arrival=actualCalObservationV181(h);
  context(h,12.5);const rows=[];let previousPhase=null;
  for(let i=0;i<180*60;i++) {
    const s=routeState(h), phase=s.actor?s.actor.roomId+'/'+s.actor.stage:'handoff';
    if(phase!==previousPhase||i%120===0||s.nativeHandoff)
      rows.push({route:{actor:s.actor,nativeHandoff:s.nativeHandoff},ownerCount:h.getNpcServiceOwnedActorsV163().filter(a=>a.crewId===D.crewId).length});
    previousPhase=phase;
    if(s.nativeHandoff)break;
    h.update(1/60);
  }
  const final=routeState(h), base={origin,arrival,rows,final};
  assert.equal(final.nativeHandoff.observedTravel,false);
  const cases=[{function:'observed_station_logistics_return_v181',arguments:[origin,arrival,rows,final]}];
  for(const mutate of[
    c=>{c.origin={...c.origin,x:c.origin.x+1};},c=>{c.arrival.route.actor.homeX+=1;},
    c=>{c.arrival.route.actor.y=532;},c=>{c.arrival.route.actor.crossings=2;},c=>{c.arrival.ownerCount=2;},
    c=>{c.rows.find(r=>r.route.actor).ownerCount=2;},c=>{c.rows.find(r=>r.route.actor).route.actor.admittedRoomId='logistics';},
    c=>{c.rows.filter(r=>r.route.actor).at(-1).route.actor.x+=1;},
    c=>{c.rows.filter(r=>r.route.actor).at(-1).route.actor.arrivals=1;},
    c=>{c.final.nativeHandoff.observedTravel=true;},c=>{c.final.nativeHandoff.fromRoomId='dropship-hangar';},c=>{c.rows=[];}
  ]) {
    const candidate=structuredClone(base);mutate(candidate);
    cases.push({function:'observed_station_logistics_return_v181',arguments:[candidate.origin,candidate.arrival,candidate.rows,candidate.final]});
  }
  const results=calQaChecksV181(cases);assert.equal(results[0],true);
  assert.deepEqual(results.slice(1),Array(cases.length-1).fill(false));
});

test('the Cal QA captures native hub entry only through a read-only UI event without replacing RAF or pausing the game', () => {
  const h=runtime(), before=routeState(h), actor=h.getNpcCalLogisticsActorV165();h.animationTime=1.5;
  let listener=null, removed=0;
  const sandbox=createContext({__ATF_HUB__:h,structuredClone,performance:{now:()=>12},
    document:{addEventListener:(type,fn)=>{assert.equal(type,'click');listener=fn;},
      removeEventListener:(type,fn)=>{assert.equal(type,'click');assert.equal(fn,listener);removed++;}}});
  sandbox.window=sandbox;
  runInContext('('+calQaSourceV181('observe_next_hub_entry_v181',true)+')()',sandbox);
  listener({target:{closest:()=>({dataset:{view:'command'}})}});assert.equal(sandbox.__ATF_CAL_WATCH_ENTRY_V181__,undefined);
  listener({target:{closest:()=>({dataset:{view:'hub'}})}});
  assert.deepEqual(sandbox.__ATF_CAL_WATCH_ENTRY_V181__.state.route.actor,before.actor);
  assert.equal(sandbox.__ATF_CAL_WATCH_ENTRY_V181__.capturedAt,12);assert.equal(sandbox.__ATF_CAL_WATCH_ENTRY_V181__.nativeTime,1.5);
  assert.equal(removed,1);assert.equal(h.getNpcCalLogisticsActorV165(),actor);
  assert.deepEqual(routeState(h),before);assert.equal(h.running,true);
});

function nativeCalInteractionSamplesV182(){
  const h=runtime();h.local='logistics';context(h,9.5);
  const owner=h.getNpcCalLogisticsActorV165(),identities=new WeakMap([[owner,1]]);
  const sample=(options={})=>{const state=actualCalObservationV181(h);return{...state,nativeTime:state.route.actor.time,
    ownerStamp:identities.get(h.getNpcCalLogisticsActorV165())||null,dialogOpen:false,...options};};
  let previous=null,before=null;
  for(let i=0;i<180*60;i++){
    const current=sample(),a=current.route.actor;
    if(previous?.route.actor.roomId==='logistics'&&previous.route.actor.stage==='walking'&&a.roomId==='logistics'
      &&a.stage==='walking'&&a.y===376&&a.velocity>0&&a.x>previous.route.actor.x){
      before={...current,walkingEvidence:{previous:previous.route.actor,current:a}};break;
    }
    previous=current;h.update(1/60);
  }
  assert.ok(before,'A real mounted controller reaches a moving catwalk phase.');
  // The native interaction owns workClock/count. These two DTO flags model
  // the app dialogue boundary; the engine itself remains available to tick.
  h.interactWithAnnexNpcV141(owner);
  const accepted=sample({running:false,dialogOpen:true}),rows=[];
  for(let i=0;i<3*60;i++){h.update(1/60);rows.push(sample());}
  assert.equal(h.getNpcCalLogisticsActorV165(),owner);
  return{before,accepted,rows};
}

test('Cal walking interaction observation requires real E, active native hold and physical resumption of the externally identified owner',()=>{
  const create=runInContext('('+calQaSourceV181('CAL_INTERACTION_PROGRESS_V182')+')',createContext({}));
  const {before,accepted,rows}=nativeCalInteractionSamplesV182(),progress=create(before,accepted,0);
  let result=progress.observe(accepted,5000);
  assert.equal(result.status,'waiting');assert.equal(progress.snapshot(5000).heldFrames,0,'Dialogue wall time cannot count as active hold.');
  for(const row of rows){result=progress.observe(row,5000+(row.nativeTime-accepted.nativeTime)*1000);if(result.status!=='waiting')break;}
  assert.equal(result.status,'resumed',JSON.stringify(result));
  const receipt=progress.snapshot(9000);
  assert.ok(receipt.heldFrames>100);assert.ok(receipt.heldNativeSeconds>2.3&&receipt.heldNativeSeconds<2.4);
  assert.ok(receipt.resumedDistance>=1);assert.equal(receipt.logicalOwnerStamp,1);
});

test('Cal interaction guards reject another owner, pause, occupancy, cabin, injected motion, false walking and missing resumption',()=>{
  const create=runInContext('('+calQaSourceV181('CAL_INTERACTION_PROGRESS_V182')+')',createContext({}));
  const {before,accepted,rows}=nativeCalInteractionSamplesV182();
  for(const [label,mutate] of[
    ['new equal-looking body',s=>{s.ownerStamp=null;}],['paused game',s=>{s.running=false;}],
    ['occupied instead of interaction',s=>{s.route.actor.reason='occupied';}],
    ['cabin',s=>{s.route.actor.lift={phase:'travel'};}],['foreign deck',s=>{s.route.actor.deck=3;}],
    ['distance grows while pose stays',s=>{s.route.actor.distance+=.2;}],
    ['pose and distance injected during hold',s=>{s.route.actor.x+=.2;s.actual.x+=.2;s.route.actor.distance+=.2;}],
    ['clock rearmed',s=>{s.actual.workClock=2.4;}],['clock reversed',s=>{s.nativeTime-=1;}]
  ]){
    const progress=create(before,accepted,0);assert.equal(progress.observe(rows[0],20).status,'waiting');
    const bad=structuredClone(rows[1]);mutate(bad);
    assert.equal(progress.observe(bad,40).status,'failed',label);
  }
  for(const mutate of[
    s=>{s.walkingEvidence.current.distance=s.walkingEvidence.previous.distance;},
    s=>{s.route.actor.reason='occupied';},s=>{s.actual.vx=0;}
  ]){const bad=structuredClone(before);mutate(bad);assert.equal(create(bad,accepted,0).observe(rows[0],20).status,'failed');}
  const noResume=create(before,accepted,0);
  for(const row of rows.filter(s=>s.actual.workClock>0))assert.equal(noResume.observe(row,2000).status,'waiting');
  const waiting=structuredClone(rows.at(-1));waiting.route.actor={...accepted.route.actor,time:accepted.route.actor.time+8.01,
    velocity:0,reason:'daily-schedule'};waiting.actual={...accepted.actual,workClock:0};waiting.nativeTime=accepted.nativeTime+8.01;
  assert.equal(noResume.observe(waiting,10000).reason,'cal-interaction-no-physical-resumption');
  assert.equal(create(before,accepted,0).check(90001),'cal-interaction-wall-budget');
});

test('the actual Cal QA WeakMap rejects a replacement object with equal body fields without assigning an actor stamp',()=>{
  const h=runtime(),actor=h.getNpcCalLogisticsActorV165();let selected=actor;
  const host=Object.create(h);host.getNpcCalLogisticsActorV165=()=>selected;
  const before=JSON.stringify(actor);
  const sandbox=createContext({__ATF_HUB__:host,structuredClone,document:{querySelector:()=>({hidden:true})}});sandbox.window=sandbox;
  runInContext('('+calQaSourceV181('exercise_walking_interaction_v182',true)+')()',sandbox);
  assert.equal(sandbox.__ATF_CAL_INTERACTION_REFERENCE_V182__.read().ownerStamp,1);
  selected={...actor};
  assert.equal(sandbox.__ATF_CAL_INTERACTION_REFERENCE_V182__.read().ownerStamp,null);
  assert.equal(JSON.stringify(actor),before,'The external reference map never assigns metadata to the actual actor.');
  assert.equal(h.getNpcCalLogisticsActorV165(),actor);
});

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
