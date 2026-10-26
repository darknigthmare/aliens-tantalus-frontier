import assert from 'node:assert/strict';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
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
import { withHubNpcInterdeckRoutesV165, normalizeNpcInterdeckRoutesV165, NPC_INTERDECK_DEFINITIONS_V165 as interdeckDefinitions } from '../src/npc-interdeck-routes-v165.js';
import { npcLiftSocketV165, createNpcLiftTransitV165, advanceNpcLiftTransitV165, normalizeNpcLiftTransitV165, npcLiftPoseV165, npcLiftDoorProgressV165 } from '../src/npc-lift-transit-v165.js';
import { requestShipPortDockV87, stepShipPortV87, canAccessPortCounterV87 } from '../src/ship-port-state-v87.js';

import { withHubNpcInterdeckPassageV165, normalizeNpcInterdeckPassageV165,
  NPC_INTERDECK_PASSAGE_GEOMETRY_V165 as passageGeometry } from '../src/npc-interdeck-passage-v165.js';

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
    // Headless readiness metadata, as in Cal's targeted verifier. Physical
    // owner state and coordinates still come exclusively from real schedules.
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

const observed = hub => ({
  david: hub.npcInterdeckStateV165.routes['david-durandal'],
  rook: hub.getNpcServicePhysicalStateV165('rook-cctv'),
  echo: hub.npcAnnexLeasesStateV163.routes['echo-escape'],
  passage: hub.npcInterdeckPassageStateV165
});
const stage = hub => hub.npcInterdeckPassageStateV165.session?.phase || 'released';
const bodyList = hub => [hub.npcInterdeckBodiesV165.get('david-durandal'),
  hub.getNpcAnnexWorkpostActorV165('rook-cctv'), hub.getNpcAnnexLeaseActorV163('echo-escape')].filter(Boolean);
const mainChart = body => HUB_DECKS[0].rooms.some(room => room.id === body.roomId);
function checkStep(hub, before, dt) {
  const bodies = bodyList(hub);
  for (const body of bodies) {
    const old = before.find(entry => entry.crewId === body.crewId);
    if (old?.roomId === body.roomId && old.y === body.y)
      assert.ok(Math.abs(body.x - old.x) <= 27 * dt + 1e-5, JSON.stringify({ old, body }));
    assert.equal(body.y + body.h, 624);
  }
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
    const a = bodies[i], b = bodies[j];
    if (a.roomId === b.roomId || mainChart(a) && mainChart(b))
      assert.ok(a.x + a.w <= b.x + 1e-5 || b.x + b.w <= a.x + 1e-5,
        'real bodies must not overlap: ' + JSON.stringify({ a, b, passage: observed(hub).passage }));
    const oldA = before.find(body => body.crewId === a.crewId), oldB = before.find(body => body.crewId === b.crewId);
    if (oldA && oldB && mainChart(oldA) && mainChart(oldB) && mainChart(a) && mainChart(b))
      assert.equal(Math.sign(a.x - b.x), Math.sign(oldA.x - oldB.x), 'a common floor never permits overtaking');
  }
}
function advanceObserved(hub, seconds, until = () => false, savedStages = null) {
  for (let i = 0; i < seconds * 10; i++) {
    const before = bodyList(hub).map(body => ({ crewId: body.crewId, roomId: body.roomId,
      x: body.x, y: body.y, w: body.w, h: body.h }));
    hub.update(.1); checkStep(hub, before, .1);
    const phase = stage(hub);
    if (savedStages && !savedStages.has(phase)) {
      hub.persist(); savedStages.set(phase, structuredClone(hub.persisted.at(-1)));
    }
    if (until(hub)) return true;
  }
  return false;
}
class NoInterdeckPassing extends TestHub {
  planNpcInterdeckPassageV165() {}
}
function blocked07Save() {
  const hub = new NoInterdeckPassing();
  hub.start({}, { routineContextV62: { clock: { day: 1, hour: 7 }, save: portCampaign } });
  const david = hub.npcs.find(body => body.crewId === 'crew-10-david-8r');
  assert.ok(david); assert.equal(david.x, 3031);
  context(hub, 11); tick(hub, 500, 10);
  const state = observed(hub);
  assert.equal(state.david.actor.x, 3300);
  assert.equal(state.david.actor.reason, 'occupied');
  assert.equal(state.rook.x, 3356);
  assert.ok(hub.npcCirculationActorV158.x < state.david.actor.x);
  hub.persist(); return hub.persisted.at(-1);
}
let blocked;
test('the uncoordinated real 07→11 owners reproduce David3300 against Rook3356 after500s', () => {
  blocked = blocked07Save();
  assert.equal(blocked.npcInterdeckPassageV165.session, null);
});

const phaseSaves = new Map();
test('the planner restores the blocked singleton, uses both real pockets, then releases exact Rook/ECHO bookmarks', () => {
  const h = runtime(11, blocked || blocked07Save());
  const bodies = bodyList(h), david = h.npcInterdeckBodiesV165.get('david-durandal');
  const echoOrigin = h.npcInterdeckPassageStateV165.session.echoOrigin;
  const complete = advanceObserved(h, 700, hub => stage(hub) === 'released'
    && observed(hub).david.actor?.stage === 'service', phaseSaves);
  assert.ok(complete, JSON.stringify(observed(h)));
  assert.equal(h.npcInterdeckBodiesV165.get('david-durandal'), david);
  for (const body of bodies) assert.ok(bodyList(h).includes(body), 'the same three physical objects survive arbitration');
  assert.equal(observed(h).rook.x, 3356);
  assert.equal(observed(h).rook.roomId, 'combat-information');
  assert.equal(observed(h).echo.actor, null);
  assert.equal(observed(h).echo.returned.crossings, 2);
  assert.ok(Math.abs(observed(h).echo.returned.x - echoOrigin.x) < .26);
  assert.equal(observed(h).passage.retention.rookOrigin.x, 3356);
  assert.equal(observed(h).passage.retention.davidOrigin.x, 3031);
  for (const phase of ['clear-cctv', 'outbound-escape', 'echo-west', 'rook-home', 'echo-home', 'released'])
    assert.ok(phaseSaves.has(phase), phase);
  h.persist(); phaseSaves.set('destination-service', structuredClone(h.persisted.at(-1)));
});

test('each observed passing phase persists and resumes its exact intentions and physical owner coordinates', () => {
  assert.ok(phaseSaves.size > 4);
  for (const [phase, save] of phaseSaves) {
    const saved = normalizeNpcInterdeckPassageV165(save.npcInterdeckPassageV165);
    assert.deepEqual(saved, save.npcInterdeckPassageV165);
    const h = runtime(11, save);
    assert.deepEqual(h.npcInterdeckPassageStateV165, saved, phase);
    for (const id of ['david-durandal']) assert.deepEqual(h.npcInterdeckStateV165.routes[id].actor,
      save.npcInterdeckRoutesV165.routes[id].actor, phase);
    assert.deepEqual(h.getNpcServicePhysicalStateV165('rook-cctv'),
      save.npcAnnexWorkpostRoutesV165.routes['rook-cctv'].actor, phase);
    advanceObserved(h, 1);
    h.persist(); assert.deepEqual(normalizeNpcInterdeckPassageV165(h.persisted.at(-1).npcInterdeckPassageV165),
      h.persisted.at(-1).npcInterdeckPassageV165);
  }
});

test('return to David3031 observes ECHO’s changed native intention and restores both bookmarks after Rook3356', () => {
  const save = phaseSaves.get('destination-service'); assert.ok(save);
  const h = runtime(11, save), david = h.npcInterdeckBodiesV165.get('david-durandal');
  const echoCrossings = h.npcAnnexLeasesStateV163.routes['echo-escape'].returned.crossings;
  context(h, 22);
  const phases = new Set(); let returnEchoOrigin = null;
  const complete = advanceObserved(h, 700, hub => {
    phases.add(stage(hub));
    const session = observed(hub).passage.session;
    if (session?.direction === 'return' && session.echoBorrowed) returnEchoOrigin ||= structuredClone(session.echoOrigin);
    return observed(hub).david.returned?.observedTravel === true && stage(hub) === 'released';
  });
  assert.ok(complete, JSON.stringify(observed(h)));
  assert.equal(observed(h).david.returned.x, 3031);
  assert.equal(observed(h).passage.retention, null);
  assert.equal(observed(h).rook.x, 3356);
  assert.equal(observed(h).echo.actor, null);
  assert.equal(observed(h).echo.returned.crossings, echoCrossings);
  assert.ok(returnEchoOrigin, 'the eastbound native station intention requires a real passing lease');
  assert.ok(returnEchoOrigin.x > 3031);
  assert.ok(Math.abs(observed(h).echo.returned.x - returnEchoOrigin.x) < .26);
  assert.ok(phases.has('return-escape'));
  assert.ok(phases.has('david-west')); assert.ok(phases.has('rook-home'));
  assert.ok(david, 'return uses the observed outbound passenger');
});

test('normalization rejects forged owners, unsupported bookmarks and arbitrary phases or durations', () => {
  const valid = phaseSaves.get('outbound-escape')?.npcInterdeckPassageV165; assert.ok(valid?.session);
  for (const patch of [{ source: 'fake' }, { phase: 'teleport' }, { direction: 'sideways' }, { waitX: -1 },
    { elapsed: Infinity }, { order: 'overtake' }, { pausedReason: 'mission-assignment' },
    { davidOrigin: { ...valid.session.davidOrigin, crewId: 'crew-06-rook' } },
    { rookOrigin: { ...valid.session.rookOrigin, roomId: 'bridge' } },
    { echoOrigin: { ...valid.session.echoOrigin, y: 531 } }])
    assert.equal(normalizeNpcInterdeckPassageV165({ schema: 165, session: { ...valid.session, ...patch } }).session, null);
});

test('a paused or stopped planner does not forge movement or suppress medical and mission priorities', () => {
  const save = phaseSaves.get('clear-cctv'); assert.ok(save);
  for (const field of ['needsCare', 'missionAssigned']) {
    const h = runtime(11, save), body = h.getNpcAnnexWorkpostActorV165('rook-cctv');
    const previous = { x: body.x, y: body.y, roomId: body.roomId };
    const resolution = h.npcRoutineResolutionsV62.get(body.crewId);
    h.npcRoutineResolutionsV62.set(body.crewId, { ...resolution, [field]: true });
    h.planNpcInterdeckPassageV165(.1);
    assert.equal(h.npcInterdeckPassageStateV165.session, null);
    assert.equal(h.npcInterdeckPassageStateV165.retention, null);
    assert.deepEqual({ x: body.x, y: body.y, roomId: body.roomId }, previous);
  }
  const h = runtime(11, save), before = structuredClone(observed(h));
  h.running = false; h.update(.1); assert.deepEqual(observed(h), before);
});

test('an already returning real ECHO lease finishes its two crossings without a new loan when David is already east', () => {
  const old = new NoInterdeckPassing();
  old.start({}, { routineContextV62: { clock: { day: 1, hour: 7 }, save: portCampaign } });
  context(old, 10); tick(old, 240, 10);
  assert.equal(old.npcAnnexLeasesStateV163.routes['echo-escape'].actor.roomId, 'escape-pods');
  context(old, 11); old.update(.1);
  const returning = old.npcAnnexLeasesStateV163.routes['echo-escape'];
  assert.equal(returning.actor.crossings, 1);
  assert.notEqual(returning.actor.targetRoomId, 'escape-pods');
  old.persist(); const h = runtime(11, old.persisted.at(-1));
  assert.equal(stage(h), 'drain-echo', JSON.stringify(observed(h)));
  assert.equal(observed(h).passage.session.drainOnly, true);
  const origin = h.npcAnnexLeasesStateV163.routes['echo-escape'].actor.homeX;
  const initialDistance = h.npcAnnexLeasesStateV163.routes['echo-escape'].actor.distance;
  let finishedOld = false, observedNew = false;
  const done = advanceObserved(h, 900, hub => {
    const current = observed(hub), echo = current.echo;
    if (!finishedOld && !echo.actor && echo.returned) {
      assert.equal(echo.returned.crossings, 2);
      assert.ok(Math.abs(echo.returned.x - origin) < .26);
      assert.ok(echo.returned.distance > initialDistance);
      finishedOld = true;
    }
    if (finishedOld && echo.actor) observedNew = true;
    return finishedOld && stage(hub) === 'released' && !echo.actor;
  });
  assert.ok(done, JSON.stringify(observed(h)));
  assert.equal(observedNew, false, 'drain-only never requalifies the old return as another excursion');
  assert.equal(observed(h).echo.returned.crossings, 2);
});

test('a saved cross-zero ECHO walk is reused for one real full visit instead of fabricating a two-crossing return', () => {
  const old = new NoInterdeckPassing();
  old.start({}, { routineContextV62: { clock: { day: 1, hour: 7 }, save: portCampaign } });
  context(old, 10); tick(old, 1, 10); context(old, 11); old.update(.1);
  const uncommitted = structuredClone(old.npcAnnexLeasesStateV163.routes['echo-escape']);
  assert.equal(uncommitted.actor.crossings, 0);
  assert.notEqual(uncommitted.actor.targetRoomId, 'escape-pods');
  old.persist(); const h = runtime(11, old.persisted.at(-1));
  assert.equal(stage(h), 'clear-cctv');
  assert.equal(observed(h).echo.actor.homeX, uncommitted.actor.homeX);
  assert.equal(observed(h).echo.actor.distance, uncommitted.actor.distance);
  assert.equal(observed(h).echo.actor.crossings, 0);
  assert.equal(observed(h).echo.returned, null);
  const done = advanceObserved(h, 700, hub => stage(hub) === 'released' && observed(hub).echo.returned?.crossings === 2);
  assert.ok(done, JSON.stringify(observed(h)));
  assert.ok(Math.abs(observed(h).echo.returned.x - uncommitted.actor.homeX) < .26);
});
