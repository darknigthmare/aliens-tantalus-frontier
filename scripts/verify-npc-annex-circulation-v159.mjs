import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openSync, readSync, closeSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { HubGame as NativeHub } from '../src/hub-opening-v88.js';
import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { HubGame as RosterHub } from '../src/hub-v52-runtime.js';
import { HubGame as RoutineHub } from '../src/hub-v62-runtime.js';
import { HubGame as AnnexHub } from '../src/hub-v71-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { resolveNpcRoutineV62 } from '../src/npc-dialogue-v62.js';
import { withHubNpcLifeV136, spreadNpcStationSpawnsV136 } from '../src/npc-life-v136.js';
import { withHubNpcCirculationV158 } from '../src/npc-circulation-v158.js';
import { createAnnexNpcsV141 } from '../src/hub-annex-npc-life-v141.js';
import { HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { getHubRoomPresentationV119 } from '../src/hub-room-presentation-v119.js';
import { resolveHumanAtlasGeometryV133 } from '../src/human-visual-contract-v133.js';
import { resolveSpriteSheet } from '../src/sprite-animation-runtime.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { HUB_NPC_ANNEX_CIRCULATION_V159 as C, normalizeNpcAnnexCirculationV159, createNpcAnnexCirculationStateV159,
  npcAnnexDoorPassageV159, advanceNpcAnnexCirculationV159, npcAnnexOcclusionV159, withHubNpcAnnexCirculationV159 } from '../src/npc-annex-circulation-v159.js';

const id = C.crewId, parent = HUB_DECKS[1].rooms.find(r => r.id === 'science-lab');
const annex = getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137['synthetic-bay']);
const routine = (hour, extra = {}) => resolveNpcRoutineV62(id, { clock: { day: 1, hour }, ...extra });
const dutyActor = () => createAnnexNpcsV141([{ crewId: id, roomId: 'synthetic-bay', targetX: 960, duty: 'synthetic-diagnostics' }], new Map([[id, routine(9)]]))[0];
const actor = extra => ({ ...spreadNpcStationSpawnsV136([{ ...RosterHub.prototype.createNpcs.call({},1).find(n => n.crewId === id),
  mobile: false, x: 4234 }], [parent])[0], vx: 0, facing: -1, ...extra });
function simulate(a, seconds, { state = createNpcAnnexCirculationStateV159(a, dutyActor()), resolution = routine(9),
  duty = true, rate = 60, ...options } = {}) {
  const frames = [];
  for (let i = 0; i < seconds * rate; i++) {
    const before = { ...state };
    state = advanceNpcAnnexCirculationV159(state, a, 1 / rate, { resolution, duty, ...options });
    if (state.roomId === before.roomId) assert.ok(Math.abs(state.x - before.x) <= 27 / rate + 1e-7, 'Only physical walking changes a room-local position.');
    else {
      assert.equal(before.stage, 'covering'); assert.equal(state.stage, 'revealing');
      assert.equal(state.doorProgress, 0); assert.equal(state.distance, before.distance, 'A chart change spends no walking distance.');
      assert.equal(state.actualVelocity, 0); assert.equal(state.y + a.h, 624);
    }
    Object.assign(a, { x: state.x, y: state.y, roomId: state.roomId, facing: state.facing, vx: state.actualVelocity });
    frames.push({ ...state });
  }
  return { a, state, frames };
}

test('the single route uses exact native actors, true paired door sockets and complete effective 2D rooms', () => {
  assert.equal(C.actorWidth,44); assert.equal(C.actorHeight,92); assert.equal(C.parentRoomId,'science-lab');
  const a = actor(), d = dutyActor(); assert.equal(a.spriteId,d.spriteId); assert.equal(a.crewId,d.crewId);
  assert.equal(a.x,4350); assert.ok(d.x > 433.85 && d.x < 439.48);
  const passage = npcAnnexDoorPassageV159({ ...a, x:4178 }, 'synthetic-bay');
  assert.equal(passage.arrival.x,122); assert.equal(passage.arrival.y,532); assert.equal(passage.offsetX,0);
  const reverse = npcAnnexDoorPassageV159({ ...d, x:122 },'science-lab'); assert.equal(reverse.arrival.x,4178);
  for (const room of [parent,annex]) {
    const p=getHubRoomPresentationV119(room); assert.equal(p.presentationMode,'2d'); assert.equal(p.projectionV139.dxPerY,0);
    assert.equal(p.projectionV139.mixedProjectionAllowed,false);
  }
});

test('the full outgoing floor walk, covered native SAS and return spend only true local walking distance', () => {
  const out=simulate(actor(),25); assert.equal(out.state.stage,'service'); assert.equal(out.a.roomId,'synthetic-bay');
  assert.equal(out.state.crossings,1); assert.equal(out.state.arrivals,1); assert.ok(Math.abs(out.a.x-dutyActor().x)<.25);
  assert.ok(out.frames.some(f=>f.stage==='opening'&&f.doorProgress>0));
  assert.ok(out.frames.some(f=>f.stage==='covering'&&f.doorProgress<1));
  assert.ok(out.frames.some(f=>f.stage==='revealing'&&f.doorProgress>0));
  assert.ok(out.frames.every(f=>f.y+92===624)); assert.ok(out.state.distance>480&&out.state.distance<490);
  const back=simulate(out.a,25,{state:out.state,duty:false,resolution:routine(10.5)});
  assert.equal(back.a.roomId,'science-lab'); assert.equal(back.state.stage,'service'); assert.equal(back.state.crossings,2);
  assert.equal(back.state.arrivals,2); assert.ok(Math.abs(back.a.x-4350)<.25); assert.ok(back.state.distance>960&&back.state.distance<980);
});

test('30/60/120Hz own the same physical rail and never interpolate the giant coordinate-chart difference', () => {
  const runs=[30,60,120].map(rate=>simulate(actor(),13,{rate}));
  for(const r of runs) {assert.equal(r.a.roomId,runs[1].a.roomId);assert.ok(Math.abs(r.a.x-runs[1].a.x)<1);}
  for(const r of runs) assert.ok(r.frames.every(f=>Math.abs(f.velocity)<=27.000001));
});

test('a physical solid and a native live peer stop the whole approach, then release it without skipping the door', () => {
  const solid=simulate(actor(),15,{colliders:[{x:4240,y:500,w:16,h:124}]});
  assert.ok(solid.a.x>=4256);assert.equal(solid.state.crossings,0);assert.equal(solid.state.arrivals,0);
  const peer=actor({crewId:'crew-other',x:4250});
  const blocked=simulate(actor(),15,{peers:[peer]});assert.ok(blocked.a.x>=peer.x+44+12-.001);assert.equal(blocked.state.crossings,0);
  const resumed=simulate(blocked.a,25,{state:blocked.state});assert.equal(resumed.state.stage,'service');assert.equal(resumed.state.crossings,1);
});

test('both real openings reject occupied bodies and busy/locked portals before any chart handoff', () => {
  const a=actor({x:4178}), target=dutyActor();
  const state={...createNpcAnnexCirculationStateV159(actor(),target),x:a.x,stage:'opening',targetRoomId:'synthetic-bay'};
  for(const options of [{portalBusy:true},{peers:[{...target,crewId:'other-crew',x:122}]},{player:{...target,x:122}}, {player:{...a}}]) {
    const held=simulate({...a},3,{state, ...options});assert.equal(held.a.roomId,'science-lab');assert.equal(held.state.doorProgress,0);assert.equal(held.state.crossings,0);
  }
  const covered={...state,stage:'covering',doorProgress:.6};
  const held=simulate({...a},2,{state:covered,peers:[{...target,crewId:'other-crew',x:122}]});assert.equal(held.state.doorProgress,.6);assert.equal(held.state.stage,'covering');
});

test('pause, interaction, emergencies outside the SAS and invalid delta retain native feet; reduced motion bounds door duration', () => {
  const partial=simulate(actor(),3), state=partial.state;
  assert.equal(state.stage,'walking');
  for(const delta of [0,-1,Infinity,NaN]) assert.equal(advanceNpcAnnexCirculationV159(state,partial.a,delta),state);
  assert.equal(advanceNpcAnnexCirculationV159(state,partial.a,5,{running:false}),state);
  for(const extra of [{crisis:{id:'actual',active:true}},{infestation:{active:true,stage:'confirmation'}}]) {
    const resolution=routine(9,extra); assert.equal(resolution.alert,true);
    const held=simulate({...partial.a},3,{state,resolution});assert.equal(held.a.x,partial.a.x);assert.equal(held.state.doorProgress,state.doorProgress);
  }
  const held=simulate({...partial.a,workClock:2.4},2,{state});assert.equal(held.a.x,partial.a.x);assert.equal(held.state.doorProgress,state.doorProgress);
  const slow=simulate(actor(),25), reduced=simulate(actor(),25,{reducedMotion:true});
  assert.equal(reduced.state.crossings,1);assert.equal(reduced.state.stage,'service');assert.ok(Math.abs(reduced.state.distance-slow.state.distance)<.1);
  const dropped=advanceNpcAnnexCirculationV159(createNpcAnnexCirculationStateV159(actor(),dutyActor()),actor(),20,{resolution:routine(9),duty:true});
  assert.equal(dropped.time,.1);assert.ok(4350-dropped.x<=2.7);
});

test('crisis and infestation safely clear either face instead of freezing a reserved SAS or allowing passage through its body', () => {
  const out=simulate(actor(),25), back=simulate(out.a,25,{state:out.state,duty:false,resolution:routine(10.5)});
  const samples=[out,back].flatMap(run=>['opening','covering','revealing','walking'].map(stage=>
    run.frames.find(s=>s.stage===stage&&(stage==='walking'?s.doorProgress>0:s.doorProgress>.2&&s.doorProgress<.8))));
  assert.ok(samples.every(Boolean));
  for(const sample of samples)for(const extra of [{crisis:{id:'actual',active:true}},{infestation:{active:true,stage:'confirmation'}}]){
    const a=actor({x:sample.x,y:sample.y,roomId:sample.roomId}),resolution=routine(9,extra);
    const held=simulate(a,8,{state:sample,resolution});
    assert.equal(held.state.roomId,sample.roomId,'Emergency withdrawal never changes coordinate charts.');
    assert.equal(held.state.crossings,sample.crossings);assert.equal(held.state.arrivals,sample.arrivals);
    assert.equal(held.state.doorProgress,0);assert.equal(held.state.stage,'walking');
    assert.ok(held.state.x>sample.x+60,'The body really withdraws before releasing the leaf.');
    assert.ok(held.frames.every(s=>s.y===532&&Math.abs(s.velocity)<=27.000001));
    assert.ok(held.frames.every(s=>normalizeNpcAnnexCirculationV159({schema:159,actor:s}).actor));
    const stationary=simulate({...held.a},2,{state:held.state,resolution});
    assert.equal(stationary.state.x,held.state.x);assert.equal(stationary.state.doorProgress,0);
    const resumed=simulate(held.a,35,{state:held.state,resolution:routine(9)});
    assert.equal(resumed.state.roomId,'synthetic-bay');assert.equal(resumed.state.stage,'service');
  }
});

test('every real native chart and door phase saves/reloads exactly, corrupt room/feet/progress/identity are rejected', () => {
  const out=simulate(actor(),25), samples=['walking','opening','covering','revealing','service'].map(stage=>out.frames.find(f=>f.stage===stage));
  assert.ok(samples.every(Boolean));
  for(const s of samples) {
    const restored=normalizeNpcAnnexCirculationV159(JSON.parse(JSON.stringify({schema:159,actor:s}))).actor;
    assert.ok(restored,s.stage); for(const k of ['x','y','roomId','stage','doorProgress','distance','crossings'])assert.equal(restored[k],s[k]);
    const after=simulate(actor({x:s.x,y:s.y,roomId:s.roomId}),25,{state:restored});assert.equal(after.state.crossings,1);assert.equal(after.state.arrivals,1);
  }
  for(const patch of [{crewId:'other'},{y:531},{deck:2},{x:1},{velocity:100},{doorProgress:2},{stage:'teleport'},{roomId:'quarantine'},{stage:'covering',x:4350},{dutyX:900},{homeX:4178}])
    assert.equal(normalizeNpcAnnexCirculationV159({schema:159,actor:{...samples[0],...patch}}).actor,null);
});

test('native leaf occlusion clips the full intact anatomical hull, keeps feet support and exposes no sprite at closed handoff', () => {
  const sheet=resolveSpriteSheet(actor().spriteId), a=actor({x:4178});
  for(const progress of [1,.75,.5,.1,0]) {
    const clip=npcAnnexOcclusionV159({roomId:'science-lab',stage:'covering',doorProgress:progress});
    assert.ok(clip.y<=520); assert.ok(clip.y+clip.h>=627); assert.equal(clip.w===0,progress===0);
    for(const facing of [-1,1])for(let frame=0;frame<12;frame++){
      const g=resolveHumanAtlasGeometryV133({actor:{...a,facing},sheet,column:frame%4,row:Math.floor(frame/4),surface:'hub'});
      assert.equal(g.pivot.y,624);assert.equal(g.visible.y+g.visible.height,624);
      if(progress===1)assert.ok(g.visible.x>=clip.x&&g.visible.x+g.visible.width<=clip.x+clip.w);
    }
  }
});

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
  npcAnimationRequest(...args){return LifeHub.prototype.npcAnimationRequest.apply(this,args);}
  sampleNpcAnimation(n){this.samples.push({id:n.crewId,x:n.x,roomId:n.roomId,vx:n.vx});}
  drawNpcLifeV136(){return false;}
  drawDepthContactShadowV116(){return true;}
  setNpcCrisisAlert(){}
  currentAnnexV71(){return this.local?annex:null;}
  isAnnexActiveV71(){return Boolean(this.local);}
  start(save={}, {routineContextV62={clock:{day:1,hour:5}}}={}){
    this.state={deck:save.deck??1,roomId:'science-lab'};this.player={x:3950,y:532,w:44,h:92,alive:true};
    this.samples=[];this.initializeNpcRoutinesV62(save,routineContextV62);
    this.doorStates=buildHubDoorNetworkV58(HUB_DECKS,HUB_WORLD,this.state.deck).map(d=>({...d}));
    this.npcs=this.createNpcs(this.state.deck);this.obstacles=buildHubObstacleGeometryV87(this.state.deck);this.running=true;
    this.persisted=[];this.onPersist=patch=>this.persisted.push(patch);
  }
  update(dt){
    if(!this.running)return;
    if(this.local){this.tickParentNpcLifeV136(dt);this.tickAnnexNpcLifeV141(dt);}
    else for(const n of this.npcs){n.workClock=Math.max(0,n.workClock-dt);n.supportClock=Math.max(0,n.supportClock-dt);this.stepHubNpcLifeV136(n,dt);}
    for(const d of this.doorStates){const target=this.hubNpcBulkheadDemandV158?.(d)?1:0;d.progress+=(target-d.progress)*Math.min(1,dt*7);}
  }
  persist(){this.onPersist({npcRoutineState:structuredClone(this.npcRoutineStateV62)});}
  getSnapshot(){return {};}
  emitStatus(){}
}
const TestHub=withHubNpcAnnexCirculationV159(withHubNpcCirculationV158(FixtureBase));
function runtime(hour=5,save={}){const h=new TestHub();h.start(save,{routineContextV62:{clock:{day:1,hour}}});return h;}
function tick(h,seconds){for(let i=0;i<seconds*60;i++)h.update(1/60);}
function context(h,hour,extra={}){return h.setNpcRoutineContextV62({clock:{day:1,hour},...extra},{persist:false});}

test('actual routine rebuilds keep one exact native body through the outgoing trip, annex duty and physical return', () => {
  const h=runtime(), a=h.npcAnnexActorV159;assert.ok(a);assert.equal(a.roomId,'science-lab');assert.equal(a.x,4350);
  context(h,9);assert.equal(h.npcAnnexActorV159,a);tick(h,10);const x=a.x,room=a.roomId;
  context(h,9.25);assert.equal(h.npcAnnexActorV159,a);assert.equal(a.x,x);assert.equal(a.roomId,room);
  tick(h,15);assert.equal(h.npcAnnexStateV159.stage,'service');assert.equal(a.roomId,'synthetic-bay');
  assert.equal(h.npcs.filter(n=>n.crewId===id).length,0);assert.equal(h.ensureAnnexNpcCohortV141().filter(n=>n.crewId===id).length,1);
  context(h,10.5);tick(h,25);assert.equal(a.roomId,'science-lab');assert.ok(Math.abs(a.x-4350)<.25);
  tick(h,.1);assert.equal(h.npcAnnexActorV159,null);assert.equal(h.npcAnnexHandoffV159.toRoomId,'quarantine');assert.equal(h.npcAnnexHandoffV159.observedTravel,false);
});

test('a fresh 09h duty is an explicit native initial condition; it never asserts an outgoing journey before load', () => {
  const h=runtime(9),a=h.npcAnnexActorV159;assert.equal(a.roomId,'synthetic-bay');assert.equal(a.x,dutyActor().x);
  const s=h.getSnapshot().npcAnnexCirculationV159;assert.equal(s.initialCondition,'synthetic-bay');assert.equal(s.preLoadTravelObserved,false);assert.equal(s.actor.crossings,0);
  context(h,10.5);tick(h,25);assert.equal(a.roomId,'science-lab');assert.ok(Math.abs(a.x-4350)<.25);
});

test('camera/other-deck/annex/duct visibility changes preserve the singleton, clocks and owned trip', () => {
  const h=runtime(),a=h.npcAnnexActorV159;context(h,9);tick(h,3);const x=a.x;
  h.state.deck=0;h.npcs=h.createNpcs(0);assert.equal(h.npcs.some(n=>n.crewId===id),false);tick(h,3);assert.ok(a.x<x);
  h.local=true;h.player.x=900;h.player.y=532;tick(h,6);assert.equal(a.roomId,'synthetic-bay');assert.equal(h.activeAnnexNpcsV141().filter(n=>n===a).length,1);
  a.workClock=2.4;tick(h,1);assert.ok(Math.abs(a.workClock-1.4)<1e-6);const heldX=a.x;tick(h,.5);assert.equal(a.x,heldX);
  h.running=false;const snapshot=structuredClone(h.getSnapshot().npcAnnexCirculationV159);tick(h,2);assert.deepEqual(h.getSnapshot().npcAnnexCirculationV159,snapshot);
  h.running=true;h.ventActorV62={};h.local=false;tick(h,15);assert.equal(h.npcAnnexActorV159,a);assert.equal(h.npcAnnexStateV159.stage,'service');
});

test('priority mission/medical handoff preserves the real origin and native quarantine/medical availability without a false completed route', () => {
  for(const extra of [{operation:{crewIds:[id]}},{crew:[{id,health:20,injuries:[]}]}]){
    const h=runtime(9),a=h.npcAnnexActorV159;const before=structuredClone(h.hubNpcInteractions||{});
    context(h,9,extra);assert.equal(h.npcAnnexActorV159,null);assert.equal(h.npcAnnexHandoffV159.fromRoomId,'synthetic-bay');
    assert.equal(h.npcAnnexHandoffV159.observedTravel,false);assert.deepEqual(h.hubNpcInteractions||{},before);
    const target=h.npcRoutineResolutionsV62.get(id);
    if(target.deck===h.state.deck){assert.equal(h.npcs.filter(n=>n.crewId===id).length,1,'The first real routine rebuild must retain the medical actor.');
      assert.equal(h.npcs.find(n=>n.crewId===id).roomId,target.roomId);}
    h.state.deck=target.deck;h.npcs=h.createNpcs(target.deck);
    assert.equal(h.npcs.filter(n=>n.crewId===id).length,1);assert.equal(h.npcs.find(n=>n.crewId===id).roomId,target.roomId);
    assert.equal(a.roomId,'synthetic-bay','The old physical body is not silently relabelled as a walker in the other deck.');
  }
});

test('a medical priority during the covered SAS delegates once without completing local travel or leaving a ghost reservation', () => {
  const h=runtime();context(h,9);tick(h,7.2);const a=h.npcAnnexActorV159,s=h.npcAnnexStateV159;
  assert.equal(s.stage,'covering');const before={x:a.x,roomId:a.roomId,crossings:s.crossings,arrivals:s.arrivals};
  context(h,9,{crew:[{id,health:20,injuries:[]}]});assert.equal(h.npcAnnexActorV159,null);assert.equal(h.npcAnnexStateV159,null);
  assert.equal(h.npcAnnexDoorReservedV159('synthetic-bay'),false);assert.equal(h.npcAnnexDoorDemandV159('synthetic-bay'),0);
  assert.equal(h.npcs.filter(n=>n.crewId===id&&n.roomId==='medical').length,1);
  assert.deepEqual({x:a.x,roomId:a.roomId,crossings:s.crossings,arrivals:s.arrivals},before);
  assert.equal(h.npcAnnexHandoffV159.fromRoomId,before.roomId);assert.equal(h.npcAnnexHandoffV159.observedTravel,false);
});

test('the real annex dialogue emits one native consequence at the actual speaker and holds the same moving singleton once', () => {
  const h=runtime();context(h,9);tick(h,10);const a=h.npcAnnexActorV159;assert.equal(a.roomId,'synthetic-bay');assert.ok(a.vx>0);
  h.local=true;h.player.x=900;h.hubNpcAnimation={reset(){}};h.hubNpcInteractions={};h.hubNpcSequence=0;
  const actions=[];h.onAction=e=>actions.push(e);const x=a.x,distance=h.npcAnnexStateV159.distance;
  const event=LifeHub.prototype.interactWithAnnexNpcV141.call(h,a);assert.ok(event);assert.equal(actions.length,1);
  assert.equal(event.roomId,'synthetic-bay');assert.equal(h.hubNpcInteractions[id].count,1);
  tick(h,2);assert.equal(a.x,x);assert.equal(h.npcAnnexStateV159.distance,distance);assert.ok(Math.abs(a.workClock-.4)<1e-6);
  tick(h,15);assert.equal(h.npcAnnexStateV159.stage,'service');assert.equal(h.hubNpcInteractions[id].count,1);assert.equal(actions.length,1);
});

test('pause persistence and public save migration detach physical progress and handoff receipts, without altering ECHO state', () => {
  const h=runtime();context(h,9);tick(h,8);h.persist();const patch=h.persisted.at(-1);
  assert.ok(patch.npcAnnexCirculationV159.actor);const save=createDefaultSave();save.hub={...save.hub,...patch};
  const migrated=migrateSave(save);assert.deepEqual(migrated.hub.npcAnnexCirculationV159,patch.npcAnnexCirculationV159);
  const restored=runtime(9,{...patch,deck:1});assert.equal(restored.npcAnnexActorV159.x,h.npcAnnexActorV159.x);
  assert.equal(restored.npcAnnexStateV159.doorProgress,h.npcAnnexStateV159.doorProgress);tick(restored,25);assert.equal(restored.npcAnnexStateV159.crossings,1);
  patch.npcAnnexCirculationV159.actor.x=0;assert.notEqual(h.npcAnnexActorV159.x,0);
  assert.deepEqual(migrated.hub.npcCirculationV158,patch.npcCirculationV158);
});

test('Forge/editor isolation neither admits a native body nor emits this campaign state into its active cohort', () => {
  for(const options of [{editorProject:{}},{forgeJourneyV141:true}]){
    const h=new TestHub();h.start({}, {...options,routineContextV62:{clock:{day:1,hour:9}}});
    assert.equal(h.npcAnnexActorV159,null);assert.equal(h.npcAnnexStateV159,null);tick(h,5);assert.equal(h.getSnapshot().npcAnnexCirculationV159.actor,null);
  }
});

test('the real V71 player gate reserves only this occupied SAS and keeps other annex transitions available', () => {
  const h=runtime();context(h,9);tick(h,7);assert.ok(h.npcAnnexDoorReservedV159('synthetic-bay'));
  assert.equal(AnnexHub.prototype.beginAnnexTransitionV71.call(h,'synthetic-bay','enter'),null);
  assert.equal(h.hubDoorBlockedV142.annexId,'synthetic-bay');assert.equal(h.npcAnnexDoorReservedV159('morgue'),false);
});

test('only the owned emergency walk overrides stationary native ready/work requests, preserving action and lifecycle priorities', () => {
  const h=runtime();context(h,9);tick(h,7.2);context(h,9,{crisis:{id:'actual',active:true}});tick(h,1);
  const a=h.npcAnnexActorV159;assert.ok(a.vx>.1);assert.equal(h.npcAnnexStateV159.stage,'walking');
  a.workClock=12;const physical=structuredClone(h.npcAnnexStateV159);
  assert.equal(LifeHub.prototype.npcAnimationRequest.call(h,a).clipId,'role-support');
  assert.deepEqual(h.npcAnimationRequest(a),{sheetId:a.spriteId,clipId:'walk'});
  for(const patch of [{downed:true},{dead:true},{alive:false},{hurtClock:1},{vehicleAccessPhase:'entering'},
    {climbing:true},{fireClock:1},{crouching:true},{inCover:true},{grounded:false},{inVehicle:true},{ventTransit:{}},
    {crewId:'recruit-v85-deadbeef-000001',visualProfileId:'echo9-standard-v85',crewV85:{schema:85,crewId:'recruit-v85-deadbeef-000001',visualProfileId:'echo9-standard-v85'}}]){
    const before=Object.fromEntries(Object.keys(patch).map(key=>[key,{present:Object.hasOwn(a,key),value:a[key]}]));
    Object.assign(a,patch);
    assert.deepEqual(h.npcAnimationRequest(a),LifeHub.prototype.npcAnimationRequest.call(h,a));
    for(const [key,value] of Object.entries(before)){if(value.present)a[key]=value.value;else delete a[key];}
  }
  const other={...a};assert.deepEqual(h.npcAnimationRequest(other),LifeHub.prototype.npcAnimationRequest.call(h,other));
  h.running=false;assert.deepEqual(h.npcAnimationRequest(a),LifeHub.prototype.npcAnimationRequest.call(h,a));
  tick(h,1);assert.deepEqual(h.npcAnnexStateV159,physical);assert.equal(a.workClock,12);assert.equal(a.alerted,true);
});

test('an emergency during the zero-progress approach reserves the physical opening and withdraws without opening or crossing it', () => {
  const h=runtime();context(h,9);
  for(let i=0;i<1500&&h.npcAnnexActorV159.x>4200;i++)h.update(1/60);
  const a=h.npcAnnexActorV159,before=structuredClone(h.npcAnnexStateV159);
  assert.equal(before.stage,'walking');assert.equal(before.doorProgress,0);
  assert.equal(h.npcAnnexDoorReservedV159('synthetic-bay'),true);
  a.workClock=12;context(h,9,{crisis:{id:'actual',active:true}});
  let samples=0;
  for(let i=0;i<900&&h.npcAnnexDoorReservedV159('synthetic-bay');i++){
    h.update(1/60);const s=h.npcAnnexStateV159;
    assert.equal(s.roomId,before.roomId);assert.equal(s.crossings,before.crossings);assert.equal(s.arrivals,before.arrivals);
    assert.equal(s.doorProgress,0);assert.equal(a.y+a.h,624);assert.equal(h.npcAnnexDoorDemandV159('synthetic-bay'),0);
    if(s.actualVelocity>.1){assert.equal(h.npcAnimationRequest(a).clipId,'walk');samples++;}
  }
  const opening=h.getSnapshot().npcAnnexCirculationV159.sourceFace.opening;
  assert.ok(samples>60);assert.ok(a.x>opening.x+opening.w+12);assert.ok(a.workClock>0);
  assert.equal(h.npcAnnexDoorReservedV159('synthetic-bay'),false);
  h.update(1/60);assert.equal(a.vx,0);assert.notEqual(h.npcAnimationRequest(a).clipId,'walk');
});

test('the real owner releases an emergency SAS only after withdrawing its body, including a reload during that withdrawal', () => {
  for(const stage of ['opening','covering','revealing','walking'])for(const clock of [null,'workClock','supportClock']){
    const h=runtime();context(h,9);
    for(let i=0;i<1500;i++){
      const s=h.npcAnnexStateV159;
      if(s.stage===stage&&s.doorProgress>.2&&s.doorProgress<1)break;
      h.update(1/60);
    }
    assert.equal(h.npcAnnexStateV159.stage,stage);assert.ok(h.npcAnnexStateV159.doorProgress>0);
    const a=h.npcAnnexActorV159,origin={roomId:a.roomId,x:a.x,crossings:h.npcAnnexStateV159.crossings};
    if(clock)a[clock]=12;
    const extra={crisis:{id:'actual',active:true}};context(h,9,extra);h.update(1/60);
    assert.equal(h.npcAnnexActorV159,a);assert.equal(a.roomId,origin.roomId);
    assert.equal(h.npcAnnexDoorReservedV159('synthetic-bay'),true);
    h.persist();const patch=h.persisted.at(-1),saved=patch.npcAnnexCirculationV159.actor;
    const resumed=runtime(9,patch);context(resumed,9,extra);
    assert.equal(resumed.npcAnnexActorV159.x,saved.x);assert.equal(resumed.npcAnnexStateV159.doorProgress,saved.doorProgress);
    // Native interaction clocks are transient rather than part of the route
    // save. Exercise one in both real owners; only their update may elapse it.
    if(clock)resumed.npcAnnexActorV159[clock]=12;
    for(const owner of [h,resumed]){
      const clockBefore=clock&&owner.npcAnnexActorV159[clock],timeBefore=owner.npcAnnexStateV159.time;
      for(let i=0;i<900&&owner.npcAnnexDoorReservedV159('synthetic-bay');i++){
        const before=structuredClone(owner.npcAnnexStateV159);owner.update(1/60);
        const s=owner.npcAnnexStateV159,body=owner.npcAnnexActorV159;
        assert.equal(s.roomId,origin.roomId);assert.equal(s.crossings,origin.crossings);
        if(s.doorProgress<before.doorProgress){
          const receipt=owner.getSnapshot().npcAnnexCirculationV159;
          const opening=(s.roomId==='science-lab'?receipt.sourceFace:receipt.annexFace).opening;
          assert.ok(body.x>opening.x+opening.w+12||body.x+body.w<opening.x-12,'The leaf may close only after the entire body clears it.');
        }
      }
      assert.equal(owner.npcAnnexDoorReservedV159('synthetic-bay'),false);
      assert.equal(owner.npcAnnexDoorDemandV159('synthetic-bay'),0);
      if(clock){
        const remaining=owner.npcAnnexActorV159[clock],elapsed=owner.npcAnnexStateV159.time-timeBefore;
        assert.ok(remaining>0,'Emergency withdrawal must clear the SAS before its interaction clock expires.');
        assert.ok(Math.abs(remaining-(clockBefore-elapsed))<1e-6,'The real owner still elapses its interaction clock once per frame.');
      }
      const final=owner.getSnapshot().npcAnnexCirculationV159;
      const opening=(origin.roomId==='science-lab'?final.sourceFace:final.annexFace).opening;
      assert.ok(owner.npcAnnexActorV159.x>opening.x+opening.w+12);
      assert.ok(owner.npcAnnexActorV159.x>origin.x);
      const stable=owner.npcAnnexActorV159.x;tick(owner,1);assert.equal(owner.npcAnnexActorV159.x,stable);
      context(owner,9,{crisis:{active:false}});tick(owner,35);assert.equal(owner.npcAnnexStateV159.stage,'service');
      assert.equal(owner.npcAnnexStateV159.roomId,'synthetic-bay');
    }
  }
});


// Native engine integration with real assets' measured dimensions and a
// recording Canvas. This is not a browser/visual/human-playtest substitute.
test('native engine update/draw/pause own the true paired leaves and one supported source actor without changing player/camera/resources', async () => {
  const root=fileURLToPath(new URL('../',import.meta.url));
  function freshInput(){
    const events=new EventTarget();
    for(const name of ['addEventListener','removeEventListener'])globalThis[name]=events[name].bind(events);
    globalThis.document=Object.assign(new EventTarget(),{hidden:false,activeElement:null,hasFocus:()=>true});
  }
  freshInput();
  globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
  globalThis.Image=class extends EventTarget {
    complete=true;naturalWidth=0;naturalHeight=0;
    set src(source){this._src=source;let fd;try{fd=openSync(resolve(root,'.'+new URL(source,'http://fixture.invalid').pathname),'r');
      const b=Buffer.alloc(32);readSync(fd,b,0,32,0);if(b.subarray(1,4).toString()==='PNG'){this.naturalWidth=b.readUInt32BE(16);this.naturalHeight=b.readUInt32BE(20);}
      else if(b.subarray(0,4).toString()==='RIFF'&&b.subarray(12,16).toString()==='VP8X'){this.naturalWidth=b.readUIntLE(24,3)+1;this.naturalHeight=b.readUIntLE(27,3)+1;}
    }catch{}finally{if(fd!==undefined)closeSync(fd);}queueMicrotask(()=>{const e=new Event(this.naturalWidth?'load':'error');this.dispatchEvent(e);this['on'+e.type]?.(e);});}
    get src(){return this._src;}async decode(){if(!this.naturalWidth)throw Error('Missing fixture asset');}
  };
  let depth=0,clipActive=false,lastRect=null,zeroClip=false;const rects=[],stack=[],marks=[];
  const ctx=new Proxy({save(){depth++;stack.push([clipActive,zeroClip]);},restore(){assert.ok(depth>0);depth--;[clipActive,zeroClip]=stack.pop();},
    rect(...args){rects.push(args);lastRect=args;},clip(){clipActive=true;zeroClip ||= lastRect?.[2]===0;},
    fillRect(...args){if(['#9fb978','#e0e7bc'].includes(this.fillStyle))marks.push({args,clipActive,zeroClip});},
    measureText:t=>({width:String(t).length*6}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),
    getImageData:()=>({data:new Uint8ClampedArray(4),width:1,height:1})},{get:(o,k)=>k in o?o[k]:()=>{}});
  const makeCanvas=()=>Object.assign(new EventTarget(),{width:1280,height:720,getContext:()=>ctx,focus(){document.activeElement=this;},getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720})});
  const canvas=makeCanvas();
  const Game=withHubNpcAnnexCirculationV159(withHubNpcCirculationV158(withHubNpcLifeV136(NativeHub)));
  const patches=[],actions=[],save=createDefaultSave();save.needsPlayerCreationV84=false;
  const h=new Game(canvas,{onAction:e=>actions.push(structuredClone(e)),onPersist:p=>patches.push(structuredClone(p)),onStatus(){}});
  save.crew.find(c=>c.id===id).appearanceV110={schema:110,markingId:'olive'};
  h.start({deck:1,roomId:'science-lab',positionX:3950},{routineContextV62:{save,crew:save.crew,clock:{day:1,hour:5}}});
  for(let i=0;i<8;i++)await Promise.resolve();
  const a=h.npcAnnexActorV159;assert.ok(a);const player=h.player,camera={...h.camera},resources=structuredClone(save.galaxy.resources);
  h.setNpcRoutineContextV62({clock:{day:1,hour:9}},{persist:false});
  const seen=new Set();let pauseState;
  for(let i=0;i<1500;i++){
    h.update(1/60);const s=h.npcAnnexStateV159;if(!s)assert.fail('Lost native route owner');
    if(!seen.has(s.stage)){seen.add(s.stage);h.draw();const view=h.getSnapshot();
      if(s.stage==='covering'){assert.ok(marks.length>0);assert.ok(marks.slice(-2).every(m=>m.clipActive));pauseState=structuredClone(s);h.pause();h.update(.1);assert.deepEqual(h.npcAnnexStateV159,pauseState);h.persist();
        assert.deepEqual(patches.at(-1).npcAnnexCirculationV159.actor,normalizeNpcAnnexCirculationV159({schema:159,actor:s}).actor);h.running=true;}
      if(['opening','covering'].includes(s.stage)){
        const receipt=view.hubDoorPassageV142.doors.find(d=>d.annexId==='synthetic-bay'&&!d.local);assert.ok(receipt);assert.equal(receipt.progress,s.doorProgress);
      }
    }
  }
  assert.deepEqual([...seen].sort(),['covering','opening','revealing','service','walking']);assert.ok(pauseState);
  assert.equal(h.npcAnnexActorV159,a);assert.equal(a.roomId,'synthetic-bay');assert.equal(a.y+a.h,624);assert.equal(h.player,player);
  assert.equal(h.player.x,3950);assert.deepEqual(h.camera,camera);assert.deepEqual(save.galaxy.resources,resources);
  assert.equal(actions.some(e=>e.type==='hub:annex-transition'),false,'NPC chart changes never activate a player annex or emit player rewards.');
  h.setNpcRoutineContextV62({clock:{day:1,hour:10.5}},{persist:false});
  let closedParent=false,partialParent=false;
  for(let i=0;i<1500&&!closedParent;i++){h.update(1/60);const s=h.npcAnnexStateV159;
    if(s?.roomId==='science-lab'&&s.stage==='revealing'&&s.doorProgress===0){
      marks.length=0;h.draw();assert.equal(marks.length,2);assert.ok(marks.every(m=>m.clipActive&&m.zeroClip));closedParent=true;
    }}
  assert.ok(closedParent,'The parent return at full native leaf cover must hide both olive strips.');
  for(let i=0;i<60&&!partialParent;i++){h.update(1/60);const s=h.npcAnnexStateV159;if(s?.stage==='revealing'&&s.doorProgress>.2&&s.doorProgress<.8){
    marks.length=0;h.draw();assert.equal(marks.length,2);assert.ok(marks.every(m=>m.clipActive&&!m.zeroClip));partialParent=true;}}
  assert.ok(partialParent);h.draw();assert.equal(depth,0);h.stop(false);

  for(const [phase,clock] of [['covering',null],['covering','workClock'],['covering','supportClock'],['approach','workClock']]){
    freshInput();const emergency=new Game(makeCanvas(),{onAction(){},onPersist(){},onStatus(){}});
    emergency.start({deck:1,roomId:'science-lab',positionX:3950},{routineContextV62:{save,crew:save.crew,clock:{day:1,hour:5}}});
    emergency.setNpcRoutineContextV62({clock:{day:1,hour:9}},{persist:false});
    for(let i=0;i<1500&&(phase==='approach'?emergency.npcAnnexActorV159.x>4200:emergency.npcAnnexStateV159.stage!=='covering');i++)emergency.update(1/60);
    const body=emergency.npcAnnexActorV159,origin=structuredClone(emergency.npcAnnexStateV159);
    if(clock)body[clock]=12;
    emergency.setNpcRoutineContextV62({clock:{day:1,hour:9},crisis:{id:'actual',active:true}},{persist:false});
    const frames=new Set();let firstX,lastGait,movingSamples=0,lastClosedStep=false;
    for(let i=0;i<900&&emergency.npcAnnexDoorReservedV159('synthetic-bay');i++){
      emergency.update(1/60);const s=emergency.npcAnnexStateV159;emergency.draw();
      assert.equal(body.roomId,origin.roomId);assert.equal(s.crossings,origin.crossings);assert.equal(body.y+body.h,624);
      if(Math.abs(s.actualVelocity)>.1){
        const sample=emergency.sampleNpcAnimation(body,{emit:false});assert.equal(sample.clip.id,'walk');
        assert.equal(sample.sheet.id,body.spriteId);assert.ok(sample.humanPatrolV133?.moving);
        firstX ??= body.x;lastGait=sample.humanPatrolV133;frames.add(sample.frame);movingSamples++;
        assert.ok(lastGait.distance<=body.x-firstX+1e-6,'Gait spends actual floor distance without stride debt.');
        if(s.doorProgress===0)lastClosedStep=true;
      }
    }
    assert.ok(movingSamples>60&&frames.size>1&&lastGait.distance>50&&lastClosedStep);
    assert.equal(emergency.npcAnnexDoorReservedV159('synthetic-bay'),false);
    if(clock)assert.ok(body[clock]>0,'A live interaction clock does not suppress the emergency gait.');
    emergency.update(1/60);const still=structuredClone(emergency.npcAnnexStateV159),x=body.x;
    assert.notEqual(emergency.npcAnimationRequest(body).clipId,'walk');assert.equal(body.alerted,true);
    emergency.draw();const idle=emergency.sampleNpcAnimation(body,{emit:false});assert.equal(idle.humanPatrolV133,null);
    emergency.pause();emergency.update(.1);assert.equal(body.x,x);assert.deepEqual(emergency.npcAnnexStateV159,still);
    emergency.stop(false);
  }
  assert.equal(depth,0);
});
