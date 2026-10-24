import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { HubGame as RosterHub } from '../src/hub-v52-runtime.js';
import { HubGame as RoutineHub, getNpcRoutineStandingAnchorV158 } from '../src/hub-v62-runtime.js';
import { HubGame as AnnexHub } from '../src/hub-v71-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { resolveNpcRoutineV62, NPC_IDENTITIES_V62 } from '../src/npc-dialogue-v62.js';
import { withHubNpcLifeV136, spreadNpcStationSpawnsV136 } from '../src/npc-life-v136.js';
import { withHubNpcCirculationV158 } from '../src/npc-circulation-v158.js';
import { withHubNpcAnnexCirculationV159 } from '../src/npc-annex-circulation-v159.js';
import { withHubNpcServiceRoutesV161, normalizeNpcServiceRoutesV161 } from '../src/npc-service-routes-v161.js';
import { annexNpcDutiesV141, createAnnexNpcsV141, getAnnexNpcPlacementV141 } from '../src/hub-annex-npc-life-v141.js';
import { HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { getHubRoomPresentationV119 } from '../src/hub-room-presentation-v119.js';
import { resolveHumanAtlasGeometryV133 } from '../src/human-visual-contract-v133.js';
import { resolveSpriteSheet } from '../src/sprite-animation-runtime.js';
import { getHubLiveDestinationSignPlansV161 } from '../src/hub-destination-signage-runtime-v138.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { HUB_NPC_MEDICAL_ROUTE_V162 as route, HUB_NPC_MEDICAL_ROUTE_DEFINITION_V162 as D,
  normalizeNpcMedicalRouteV162, withHubNpcMedicalRouteV162 } from '../src/npc-medical-route-v162.js';

import { HUB_NPC_ANNEX_SERVICE_ROUTES_V163 as routes, HUB_NPC_ANNEX_SERVICE_ROUTE_DEFINITIONS_V163 as definitions, normalizeNpcAnnexServiceRoutesV163, withHubNpcAnnexServiceRoutesV163 } from '../src/npc-annex-service-routes-v163.js';
import { HUB_NPC_ANNEX_LEASE_DEFINITIONS_V163 as leaseDefinitions, getNpcAnnexLeaseRouteV163, normalizeNpcAnnexLeasesV163, withHubNpcAnnexLeasesV163 } from '../src/npc-annex-leases-v163.js';
import { normalizeNpcServiceTrafficV163 } from '../src/npc-service-traffic-v163.js';
const LifeHub = withHubNpcLifeV136(RoutineHub);
class FixtureBase {
  initializeNpcRoutinesV62(...a) { return RoutineHub.prototype.initializeNpcRoutinesV62.apply(this, a); }
  getNpcRoutineResolutionsV62(...a) { return RoutineHub.prototype.getNpcRoutineResolutionsV62.apply(this, a); }
  setNpcRoutineContextV62(...a) { return RoutineHub.prototype.setNpcRoutineContextV62.apply(this, a); }
  createNpcs(...a) { return LifeHub.prototype.createNpcs.apply(this, a); }
  ensureAnnexNpcCohortV141(...a) { return LifeHub.prototype.ensureAnnexNpcCohortV141.apply(this, a); }
  activeAnnexNpcsV141(...a) { return LifeHub.prototype.activeAnnexNpcsV141.apply(this, a); }
  tickAnnexNpcLifeV141(...a) { return LifeHub.prototype.tickAnnexNpcLifeV141.apply(this, a); }
  tickParentNpcLifeV136(...a) { return LifeHub.prototype.tickParentNpcLifeV136.apply(this, a); }
  stepHubNpcLifeV136(...a) { return LifeHub.prototype.stepHubNpcLifeV136.apply(this, a); }
  interactWithAnnexNpcV141(...a) { return LifeHub.prototype.interactWithAnnexNpcV141.apply(this, a); }
  npcAnimationRequest(...a) { return LifeHub.prototype.npcAnimationRequest.apply(this, a); }
  hubDoorPairV142(...a) { return AnnexHub.prototype.hubDoorPairV142.apply(this, a); }
  getParentAnnexDoorV71(...args) { return AnnexHub.prototype.getParentAnnexDoorV71.apply(this, args); }
  currentRoom() { return HUB_DECKS[this.state.deck].rooms.find(room => room.id === this.state.roomId); }
  sampleNpcAnimation() {}
  drawNpcLifeV136() { return false; }
  drawDepthContactShadowV116() { return true; }
  setNpcCrisisAlert() {}
  currentAnnexV71() { return this.local ? getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[this.local]) : null; }
  isAnnexActiveV71() { return Boolean(this.local); }
  start(save = {}, { routineContextV62 = { clock: { day: 1, hour: 5.5 } } } = {}) {
    this.state = { deck: save.deck ?? 1, roomId: save.roomId || 'medical' };
    this.player = { x: 5000, y: 532, w: 44, h: 92, alive: true };
    this.hubCommercialStateV71 = { returnContext: null };
    this.hubNpcInteractions = {}; this.hubNpcSequence = 0; this.hubNpcAnimation = { reset() {} };
    this.events = []; this.onAction = e => this.events.push(e); this.audio = { ui() {} };
    this.initializeNpcRoutinesV62(save, routineContextV62);
    this.doorStates = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, this.state.deck).map(d => ({ ...d }));
    this.npcs = this.createNpcs(this.state.deck); this.obstacles = buildHubObstacleGeometryV87(this.state.deck); this.running = true;
    this.persisted = []; this.onPersist = p => this.persisted.push(p);
  }
  update(dt) {
    if (!this.running) return;
    if (this.local) { this.tickParentNpcLifeV136(dt); this.tickAnnexNpcLifeV141(dt); }
    else for (const n of this.npcs) { n.workClock = Math.max(0, n.workClock - dt); n.supportClock = Math.max(0, n.supportClock - dt); this.stepHubNpcLifeV136(n, dt); }
  }
  persist() { this.onPersist({ npcRoutineState: structuredClone(this.npcRoutineStateV62) }); }
  getSnapshot() { return {}; }
  emitStatus() {}
}
const TestHub = withHubNpcAnnexLeasesV163(withHubNpcAnnexServiceRoutesV163(withHubNpcMedicalRouteV162(withHubNpcServiceRoutesV161(withHubNpcAnnexCirculationV159(withHubNpcCirculationV158(FixtureBase))))));
function runtime(hour = 5.5, save = {}, options = {}) { const h = new TestHub(); h.start(save, { ...options, routineContextV62: { clock: { day: 1, hour } } }); return h; }
function tick(h, seconds) { for (let i = 0; i < seconds * 60; i++) h.update(1 / 60); }
function context(h, hour, extra = {}, rebuild = true) { return h.setNpcRoutineContextV62({ clock: { day: 1, hour }, ...extra }, { persist: false, rebuild }); }


const leaseSnapshot = (h, id) => h.getSnapshot().npcAnnexLeasesV163.routes[id];
test('native command re-entry restores the actual05h30 legacy bookmark before a first-frame lease instead of sampling its new annex duty', () => {
 for (const d of leaseDefinitions) {
  const home=d.originRoomIds.at(-1),h=runtime(5.5,{deck:d.deck,roomId:home});
  const initial=h.getNpcAnnexLeaseActorV163(d.id),origin={x:initial.x,roomId:initial.roomId};
  h.persist();const exited=structuredClone(h.persisted.at(-1));
  assert.equal(leaseSnapshot(h,d.id).actor,null);
  // The real command screen rebuilds routines without replacing the saved hub
  // pose. Re-entering starts that supported05h30 snapshot with the new clock.
  h.running=false;context(h,9.5);
  assert.equal(h.getNpcAnnexLeaseActorV163(d.id),initial);
  assert.equal(leaseSnapshot(h,d.id).actor.homeX,origin.x);
  h.start({...exited,deck:d.deck,roomId:home},{routineContextV62:{clock:{day:1,hour:9.5}}});
  const actual=h.getNpcAnnexLeaseActorV163(d.id);
  assert.ok(actual,d.id+' retains its supported legacy body before the first update');
  assert.equal(actual.x,origin.x);assert.equal(actual.roomId,origin.roomId);
  h.update(1/60);
  let state=leaseSnapshot(h,d.id).actor;
  assert.ok(state);assert.equal(state.homeX,origin.x);assert.equal(state.roomId,origin.roomId);
  assert.equal(state.crossings,0);assert.equal(state.y,532);assert.ok(Math.abs(state.x-origin.x)<=27/60);
  assert.equal(h.getNpcAnnexLeaseActorV163(d.id),actual);
  assert.equal([...h.npcs,...h.ensureAnnexNpcCohortV141()].filter(a=>a.crewId===d.crewId).length,1);
  for(let i=0;i<180*60&&state.stage!=='covering';i++){
   h.update(1/60);state=leaseSnapshot(h,d.id).actor;
   assert.equal(h.getNpcAnnexLeaseActorV163(d.id),actual);
  }
  assert.equal(state.stage,'covering');h.persist();
  const resumed=runtime(9.5,{...h.persisted.at(-1),deck:d.deck,roomId:home});
  assert.deepEqual(leaseSnapshot(resumed,d.id).actor,state,'exact covered-door phase survives the UI-origin circuit');
 }
});
for (const d of leaseDefinitions) {
 test(d.id + ': leases the exact legacy singleton before its native handoff and walks the whole actual deck and paired portal', () => {
  const origin = d.originRoomIds.at(-1), h = runtime(5.5,{deck:d.deck,roomId:origin});
  h.player.x = d.id === 'noor-animal' ? 3321 : d.id === 'echo-escape' ? 3000 : 3018;
  const actor = h.getNpcAnnexLeaseActorV163(d.id), start = {x:actor.x,y:actor.y,roomId:actor.roomId}; assert.ok(actor);
  context(h,9.5); assert.equal(h.getNpcAnnexLeaseActorV163(d.id),actor);
  assert.equal(leaseSnapshot(h,d.id).actor.x,start.x); assert.equal(leaseSnapshot(h,d.id).actor.roomId,start.roomId);
  let previous=leaseSnapshot(h,d.id).actor, transfers=0, dutyMoved=false;
  const phaseSaves=new Map();let occupationSave=null;
  for(let i=0;i<220*60;i++) {
   h.update(1/60); const state=leaseSnapshot(h,d.id).actor; assert.ok(state); assert.equal(state.y,532);
   if((state.roomId===d.annexRoomId)!==(previous.roomId===d.annexRoomId)) {
    transfers++; assert.equal(previous.stage,'covering');assert.equal(state.stage,'revealing');assert.equal(state.doorProgress,0);
    assert.equal(state.distance,previous.distance);
   } else assert.ok(Math.abs(state.x-previous.x)<=27/60+1e-6);
   if(state.roomId===d.annexRoomId&&state.stage==='service'&&Math.abs(actor.vx)>.1)dutyMoved=true;
   if(!phaseSaves.has(state.stage)){h.persist();phaseSaves.set(state.stage,{save:structuredClone(h.persisted.at(-1)),entry:leaseSnapshot(h,d.id)});}
   if(!occupationSave&&state.roomId===d.annexRoomId&&state.stage==='service'&&Math.abs(actor.vx)>8){
    h.persist();occupationSave={save:structuredClone(h.persisted.at(-1)),entry:leaseSnapshot(h,d.id)};
   }
   assert.equal(h.getNpcAnnexLeaseActorV163(d.id),actor);previous=state;
  }
  assert.equal(leaseSnapshot(h,d.id).actor.roomId,d.annexRoomId);assert.equal(leaseSnapshot(h,d.id).actor.stage,'service');
  assert.equal(transfers,1); assert.equal(leaseSnapshot(h,d.id).actor.crossings,1);
  assert.ok(dutyMoved,'native local occupation still moves on its authored rail');
  for(const stage of ['walking','opening','covering','revealing','service']){
   const saved=phaseSaves.get(stage);assert.ok(saved,stage+' recorded');
   const resumed=runtime(9.5,{...saved.save,deck:d.deck,roomId:d.parentRoomId});
   assert.deepEqual(leaseSnapshot(resumed,d.id).actor,saved.entry.actor,stage+' exact supported source/door resumes');
  }
  assert.ok(occupationSave);
  const occupationResumed=runtime(9.5,{...occupationSave.save,deck:d.deck,roomId:d.parentRoomId});
  assert.deepEqual(leaseSnapshot(occupationResumed,d.id).occupation,occupationSave.entry.occupation);
  for(const patch of [{velocity:90},{x:0},{homeX:0},{tripPhase:'teleport'},{direction:0},{workX:90000}]){
   const invalid={...occupationSave.entry,occupation:{...occupationSave.entry.occupation,...patch}};
   assert.equal(normalizeNpcAnnexLeasesV163({schema:163,routes:{[d.id]:invalid}}).routes[d.id].occupation,null);
  }
  assert.equal(occupationResumed.getNpcAnnexLeaseActorV163(d.id).lifeV136.tripPhase,occupationSave.entry.occupation.tripPhase);
  const pose=occupationResumed.getNpcAnnexLeaseActorV163(d.id).x;occupationResumed.update(1/60);
  assert.ok(Math.abs(occupationResumed.getNpcAnnexLeaseActorV163(d.id).x-pose)<=27/60+1e-6);
  const presentations=leaseSnapshot(h,d.id).presentation;
  assert.ok(presentations.every(p=>['2d','2.5d'].includes(p.mode)&&!p.mixedProjectionAllowed));
  assert.equal(presentations.find(p=>p.roomId===d.annexRoomId).mode,d.id==='jun-maintenance'?'2.5d':'2d');
  h.local=d.annexRoomId; h.state.deck=d.deck;
  const cohort=h.ensureAnnexNpcCohortV141().filter(n=>n.crewId===d.crewId);assert.equal(cohort.length,1);assert.equal(cohort[0],actor);
  const event=h.interactWithAnnexNpcV141(actor);assert.equal(event.crewId,d.crewId);
  const x=actor.x;h.update(1/60);assert.equal(actor.x,x);
  h.persist();const save=h.persisted.at(-1),snap=leaseSnapshot(h,d.id);
  const publicProfile=createDefaultSave();Object.assign(publicProfile.hub,save,{deck:d.deck,roomId:d.parentRoomId});
  const migrated=migrateSave(JSON.parse(JSON.stringify(publicProfile)));
  assert.deepEqual(migrated.hub.npcAnnexLeasesV163,normalizeNpcAnnexLeasesV163(h.npcAnnexLeasesStateV163));
  const publicReload=runtime(9.5,migrated.hub);
  assert.deepEqual(leaseSnapshot(publicReload,d.id).actor,snap.actor,'public Save import preserves both actual lease and legacy source bookmark');
  assert.deepEqual(leaseSnapshot(publicReload,d.id).occupation,snap.occupation);
  const restored=runtime(9.5,{...save,deck:d.deck,roomId:d.parentRoomId});
  assert.deepEqual(leaseSnapshot(restored,d.id).actor,snap.actor);
  assert.equal(restored.getNpcAnnexLeaseActorV163(d.id).x,actor.x);
  const care=runtime(9.5,{...save,deck:d.deck,roomId:d.parentRoomId});
  context(care,9.5,{crew:[{id:d.crewId,health:20,injuries:[]}]},false);care.update(1/60);
  assert.equal(leaseSnapshot(care,d.id).actor,null);assert.equal(leaseSnapshot(care,d.id).nativeHandoff.fromRoomId,d.annexRoomId);
  for(const reason of ['medical','mission']){
   const loaded=new TestHub();loaded.start({...save,deck:d.deck,roomId:d.parentRoomId},{routineContextV62:{clock:{day:1,hour:9.5},
    ...(reason==='medical'?{crew:[{id:d.crewId,health:20,injuries:[]}]}:{operation:{crewIds:[d.crewId]}})}});
   const delegated=leaseSnapshot(loaded,d.id);assert.equal(delegated.actor,null);
   assert.equal(delegated.nativeHandoff.fromRoomId,d.annexRoomId);assert.equal(delegated.nativeHandoff.observedTravel,false);
   assert.equal(delegated.nativeHandoff.reason,reason==='medical'?'medical-recovery':'mission-assignment');
  }
  context(restored,12.5);tick(restored,220);
  const end=leaseSnapshot(restored,d.id);assert.equal(end.actor,null);assert.ok(end.returned);
  assert.equal(end.returned.roomId,start.roomId);assert.ok(Math.abs(end.returned.x-start.x)<.26);
  assert.equal(end.returned.crossings,2);assert.equal(end.returned.observedTravel,true);
 });
}

test('native annex ticking keeps a leased Jun visible to Pablo collisions without taking a second movement owner at60Hz and low FPS', () => {
 for (const dt of [1/60,.034]) {
  const h=runtime(5.5,{deck:3,roomId:'life-support'});context(h,9.5);
  const entry=()=>h.npcAnnexLeasesStateV163.routes['jun-maintenance'];
  for(let i=0;i<Math.ceil(180/dt)&&(entry().actor.roomId!=='maintenance-spine'||entry().actor.stage!=='service');i++)h.update(dt);
  assert.equal(entry().actor.roomId,'maintenance-spine');assert.equal(entry().actor.stage,'service');
  h.local='maintenance-spine';h.player.x=1338.3882819596042; // Actual failed browser approach pose, on its real floor.
  const jun=h.getNpcAnnexLeaseActorV163('jun-maintenance');
  const pablo=h.activeAnnexNpcsV141().find(n=>n.crewId==='crew-13-pablo-reyes');assert.ok(pablo);
  for(let i=0;i<Math.ceil(40/dt);i++){
   const oldJun=jun.x,oldPablo=pablo.x;h.update(dt);
   assert.ok(Math.abs(jun.x-pablo.x)>=44+12-1e-6,'the real same-floor bodies keep their native standing gap');
   assert.ok(Math.abs(jun.x-oldJun)<=27*dt+1e-6);assert.ok(Math.abs(pablo.x-oldPablo)<=27*dt+1e-6);
   assert.equal(jun.y+jun.h,624);assert.equal(pablo.y+pablo.h,624);
   const actual=h.activeAnnexNpcsV141();assert.equal(actual.filter(n=>n.crewId===jun.crewId).length,1);
   assert.equal(actual.find(n=>n.crewId===jun.crewId),jun);assert.equal(actual.find(n=>n.crewId===pablo.crewId),pablo);
  }
 }
});

test('showing any leased annex advances its saved native occupation once without resetting it through the ordinary NPC tick', () => {
 for(const d of leaseDefinitions){
  const h=runtime(5.5,{deck:d.deck,roomId:d.originRoomIds.at(-1)});context(h,9.5);
  const entry=()=>h.npcAnnexLeasesStateV163.routes[d.id];
  for(let i=0;i<180*60&&(entry().actor.roomId!==d.annexRoomId||entry().actor.stage!=='service');i++)h.update(1/60);
  assert.equal(entry().actor.roomId,d.annexRoomId);assert.equal(entry().actor.stage,'service');
  const actor=h.getNpcAnnexLeaseActorV163(d.id);h.local=d.annexRoomId;
  const oldTime=entry().occupation.time,oldX=actor.x;h.update(.034);
  assert.ok(Math.abs(entry().occupation.time-oldTime-.034)<1e-7,d.id+' has exactly one occupation clock');
  assert.equal(h.getNpcAnnexLeaseActorV163(d.id),actor);assert.ok(Math.abs(actor.x-oldX)<=27*.034+1e-6);
  assert.equal(h.activeAnnexNpcsV141().filter(n=>n.crewId===d.crewId).length,1);
 }
});

test('all three leases keep one exact owner across priority releases without replacing any other leased body', () => {
 for(const d of leaseDefinitions) for(const reason of ['medical','mission','unavailable']) {
  const h=runtime(5.5);context(h,9.5);tick(h,1);
  const actor=h.getNpcAnnexLeaseActorV163(d.id);assert.ok(actor);
  const retained=leaseDefinitions.filter(other=>other!==d).map(other=>[other.id,h.getNpcAnnexLeaseActorV163(other.id)]);
  if(reason==='unavailable')actor.downed=true;
  else context(h,9.5,reason==='medical'?{crew:[{id:d.crewId,health:20,injuries:[]}]}:{operation:{crewIds:[d.crewId]}},false);
  h.update(1/60);const snap=leaseSnapshot(h,d.id);
  assert.equal(snap.actor,null);assert.equal(snap.nativeHandoff.observedTravel,false);
  for(const [id,body]of retained)assert.equal(h.getNpcAnnexLeaseActorV163(id),body);
  assert.equal(h.getNpcAnnexLeaseActorV163(d.id),null);
  if(reason==='unavailable')assert.equal(h.ensureAnnexNpcCohortV141().filter(a=>a.crewId===d.crewId).length,0,'a just downed leased body cannot become a fresh healthy native annex clone');
 }
});

test('lease states are detached and foreign sources, crew, support, phase, occupation and schema do not restore', () => {
 const h=runtime(5.5);context(h,9.5);tick(h,1);
 for(const d of leaseDefinitions){const valid=leaseSnapshot(h,d.id);
  for(const patch of [{crewId:'other'},{deck:9},{y:531},{x:-1},{stage:'teleport'},{homeX:0},{velocity:90},{doorProgress:2}])
   assert.equal(normalizeNpcAnnexLeasesV163({schema:163,routes:{[d.id]:{...valid,actor:{...valid.actor,...patch}}}}).routes[d.id].actor,null);
  assert.equal(normalizeNpcAnnexLeasesV163({schema:163,routes:{[d.id]:{...valid,originRoomId:d.parentRoomId}}}).routes[d.id].actor,null);
  const raw={schema:163,routes:{[d.id]:valid}},normalized=normalizeNpcAnnexLeasesV163(raw);
  normalized.routes[d.id].actor.x=0;assert.notEqual(valid.actor.x,0);
  h.persist();const save=structuredClone(h.persisted.at(-1));
  if(d.id==='echo-escape')save.npcCirculationV158.actor.x+=10;
  else if(d.id==='noor-animal')save.npcMedicalRouteV162.routes['noor-morgue'].actor.x+=10;
  else save.npcAnnexRoutesV163.routes['jun-water'].actor.x+=10;
  const rejected=runtime(9.5,save);assert.equal(leaseSnapshot(rejected,d.id).actor,null,'foreign legacy source cannot license a leased arrival');
 }
 assert.ok(Object.values(normalizeNpcAnnexLeasesV163({schema:162,routes:{}}).routes).every(e=>!e.actor));
});

test('an actual occupied portal, a locked native bulkhead and pause cannot create extra physical lease transfers', () => {
 const d=leaseDefinitions[2],h=runtime(5.5,{deck:3,roomId:'life-support'});h.player.x=3018;
 context(h,9.5);h.hubTrainingV132={lockedDoorIds:['engineering:hub-east-bulkhead']};tick(h,90);
 const blocked=leaseSnapshot(h,d.id);assert.equal(blocked.actor.crossings,0);assert.equal(blocked.actor.roomId,'life-support');
 h.running=false;const paused=h.getSnapshot().npcAnnexLeasesV163;h.update(.1);assert.deepEqual(h.getSnapshot().npcAnnexLeasesV163,paused);
 const route=getNpcAnnexLeaseRouteV163(d.id,'life-support'),base=blocked.actor;
 const face=route.faces.parent,at={...h.getNpcAnnexLeaseActorV163(d.id),roomId:d.parentRoomId,x:face.opening.x+face.opening.w/2-22,y:532,vx:0};
 const opening={...base,roomId:d.parentRoomId,x:at.x,velocity:0,targetRoomId:d.annexRoomId,stage:'opening',doorProgress:.2};
 const passage=route.passage(at,d.annexRoomId);assert.ok(passage);
 let state=opening;
 for(let i=0;i<120;i++)state=route.advance(state,at,1/60,{resolution:h.npcRoutineResolutionsV62.get(d.crewId),duty:true,
  player:{...passage.arrival,alive:true,roomId:d.annexRoomId},returnToOrigin:true});
 assert.equal(state.crossings,0);assert.equal(state.reason,'occupied');assert.equal(state.x,at.x);
});

test('an ECHO lease borrowed in briefing restores the occupied native central threshold before drawing, without an origin-bookmark door rewind',()=>{
 // Alternate supported initial bookmark, not a claim that the preceding
 // native CIC→briefing trip was observed. It exercises the second admitted
 // origin of the same singleton and the otherwise untested central leaf.
 const seed=runtime(5.5);seed.persist();const save=seed.persisted.at(-1);
 save.npcCirculationV158.actor={...save.npcCirculationV158.actor,x:2010,roomId:'briefing',fromRoomId:'briefing',
  targetRoomId:'briefing',targetPhase:'work',mode:'service',waypointIndex:1,velocity:0,doorProgress:0};
 const h=runtime(5.5,{...save,deck:0,roomId:'briefing'});h.player.x=4000;
 const actor=h.getNpcAnnexLeaseActorV163('echo-escape');assert.equal(actor.roomId,'briefing');context(h,9.5);
 let captured=false;
 for(let i=0;i<80*60;i++){
  h.update(1/60);const entry=leaseSnapshot(h,'echo-escape');
  if(entry.actor&&entry.actor.x<2568&&entry.actor.x+44>2552){
   assert.ok(entry.actor.bulkheadProgress['command:hub-central-bulkhead']>=.82);
   h.persist();const save=h.persisted.at(-1),restored=runtime(9.5,{...save,deck:0,roomId:'briefing'});
   const leaf=restored.doorStates.find(d=>d.id==='command:hub-central-bulkhead');
   assert.ok(leaf.progress>=.82);assert.deepEqual(leaseSnapshot(restored,'echo-escape').actor,entry.actor);
   assert.equal(restored.getNpcAnnexLeaseActorV163('echo-escape').x,actor.x);captured=true;break;
  }
 }
 assert.ok(captured);
});
