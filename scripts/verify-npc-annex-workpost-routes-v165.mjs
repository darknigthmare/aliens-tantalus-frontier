import assert from 'node:assert/strict';
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
const TestHub = withHubNpcAnnexWorkpostRoutesV165(withHubNpcAnnexLeasesV163(withHubNpcAnnexServiceRoutesV163(
  withHubNpcMedicalRouteV162(withHubNpcServiceRoutesV161(withHubNpcAnnexCirculationV159(withHubNpcCirculationV158(FixtureBase)))))));
const runtime = (hour = 7, save = {}, options = {}) => {
  const hub = new TestHub(); hub.start(save, { ...options, routineContextV62: { clock: { day: 1, hour } } }); return hub;
};
const state = (hub, id) => hub.getSnapshot().npcAnnexWorkpostRoutesV165.routes[id];
const context = (hub, hour, extra = {}, rebuild = true) => hub.setNpcRoutineContextV62(
  { clock: { day: 1, hour }, ...extra }, { persist: false, rebuild });
const tick = (hub, seconds) => { for (let i = 0; i < seconds * 60; i++) hub.update(1 / 60); };
class IndependentOwnersWithoutArbitration extends TestHub {
  planNpcWorkpostPassageV165() { this.npcWorkpostPassageV165 = null; }
}
function blockedLegacyOwnerSave() {
  // Reproduce the actual development failure using the same independent
  // native owners, before the passing-place coordinator is installed. No
  // body coordinates, collision, speed or priority are fabricated here.
  const hub = new IndependentOwnersWithoutArbitration(); hub.start({}, {
    routineContextV62: { clock: { day: 1, hour: 7 } }
  });
  context(hub, 10); tick(hub, 110);
  assert.equal(hub.getNpcAnnexWorkpostActorV165('rook-cctv').roomId, 'combat-information');
  assert.equal(hub.npcCirculationActorV158.roomId, 'combat-information');
  assert.equal(hub.getSnapshot().npcServiceTrafficV163.actors.find(actor => actor.crewId === 'crew-10-david-8r').routeId,
    'echo-escape');
  hub.persist(); return hub.persisted.at(-1);
}
const dFor = route => definitions.find(definition => definition.id === route.definition.id);
const resolution = (route, hour = 10, extra = {}) => resolveNpcRoutineV62(route.definition.crewId,
  { clock: { day: 1, hour }, ...extra });
const post = route => createAnnexNpcsV141([{ ...dFor(route), roomId: route.definition.annexRoomId }],
  new Map([[route.definition.crewId, resolution(route)]]))[0];
function pureStart(route) {
  const hub = runtime(7, { deck: route.definition.deck, roomId: route.definition.parentRoomId });
  return { ...hub.getNpcAnnexWorkpostActorV165(route.definition.id), lifeV136: null };
}
function simulate(route, actor, seconds = 110, { state: previous = route.create(actor, post(route)), duty = true,
  routine = resolution(route), rate = 60, ...options } = {}) {
  const frames = []; let current = previous;
  for (let i = 0; i < seconds * rate; i++) {
    const before = current;
    current = route.advance(before, actor, 1 / rate, { duty, resolution: routine, ...options });
    if (before.roomId === current.roomId) assert.ok(Math.abs(current.x - before.x) <= 27 / rate + 1e-6);
    else {
      assert.equal(before.stage, 'covering'); assert.equal(current.stage, 'revealing');
      assert.equal(current.doorProgress, 0); assert.equal(current.distance, before.distance);
    }
    Object.assign(actor, { x: current.x, y: current.y, roomId: current.roomId, facing: current.facing,
      vx: current.actualVelocity || 0 });
    assert.equal(actor.y + actor.h, 624); frames.push({ ...current });
  }
  return { actor, state: current, frames };
}

for (const route of routes) {
  const c = route.definition, definition = dFor(route);
  test(c.id + ': starts with the actual native work body before the watch, preserving its real roster identity', () => {
    const hub = runtime(7, { deck: c.deck, roomId: c.parentRoomId }), actor = hub.getNpcAnnexWorkpostActorV165(c.id);
    const native = RosterHub.prototype.createNpcs.call({}, definition.nativeTemplateDeck).find(member => member.crewId === c.crewId);
    assert.ok(actor); assert.equal(actor.crewId, native.crewId); assert.equal(actor.spriteId, native.spriteId);
    assert.equal(actor.w, 44); assert.equal(actor.h, 92); assert.equal(actor.y, 532);
    assert.equal(actor.roomId, c.parentRoomId); assert.notEqual(c.deck, definition.nativeTemplateDeck);
    assert.equal(state(hub, c.id).actor.crossings, 0); assert.equal(state(hub, c.id).originCondition, 'native-workpost-body');
    assert.equal(state(hub, c.id).stationToWorkTravelObserved, false);
    assert.equal(state(hub, c.id).npcLiftTransportImplemented, false);
    const reservation = HUB_NPC_SERVICE_TRAFFIC_CIRCUITS_V163[c.id];
    assert.equal(reservation.ownerCrewId, c.crewId); assert.equal(reservation.deck, c.deck);
    assert.deepEqual(reservation.roomIds, [c.parentRoomId]);
    assert.ok(hub.getNpcServiceOwnedActorsV163().includes(actor));
  });
  test(c.id + ': walks the local outbound and return at12/60Hz with measured distance and identical paired openings', () => {
    for (const rate of [12, 60]) {
      const actor = pureStart(route), homeX = actor.x, outward = simulate(route, actor, 110, { rate });
      assert.equal(outward.state.roomId, c.annexRoomId); assert.equal(outward.state.stage, 'service');
      assert.equal(outward.state.crossings, 1); assert.ok(outward.state.distance > 0);
      const placement = getAnnexNpcPlacementV141(c.annexRoomId, c.crewId);
      assert.ok(placement.rails.some(rail => actor.x >= rail.min && actor.x <= rail.max));
      assert.deepEqual(route.faces.parent.pairedSize, route.faces.local.pairedSize);
      const back = simulate(route, actor, 110, { rate, state: outward.state, duty: false, routine: resolution(route, 13) });
      assert.equal(back.state.roomId, c.parentRoomId); assert.equal(back.state.stage, 'service');
      assert.equal(back.state.crossings, 2); assert.equal(back.state.arrivals, 2);
      assert.ok(Math.abs(back.state.x - homeX) < .26);
      assert.ok(Math.abs(back.state.distance - outward.state.distance * 2) < .03);
    }
  });
  test(c.id + ': all leaf phases round-trip through its own schema without admitting another crew, deck, support or phase', () => {
    const out = simulate(route, pureStart(route));
    for (const stage of ['walking', 'opening', 'covering', 'revealing', 'service']) {
      const frame = out.frames.find(value => value.stage === stage); assert.ok(frame);
      const saved = route.normalize({ schema: 165, actor: frame }).actor; assert.ok(saved);
      const continued = simulate(route, { ...pureStart(route), ...saved }, 110, { state: saved });
      assert.equal(continued.state.roomId, c.annexRoomId); assert.equal(continued.state.crossings, 1);
    }
    const frame = out.frames[0];
    for (const patch of [{ crewId: 'crew-unknown' }, { deck: definition.nativeTemplateDeck }, { y: 531 },
      { homeX: -1 }, { x: -20 }, { dutyX: 50000 }, { velocity: 30 }, { stage: 'lift-transit' },
      { doorProgress: 2 }, { admittedRoomId: 'mess' }])
      assert.equal(route.normalize({ schema: 165, actor: { ...frame, ...patch } }).actor, null);
    assert.equal(route.normalize({ schema: 163, actor: frame }).actor, null);
    const whole = normalizeNpcAnnexWorkpostRoutesV165({ schema: 165, routes: { [c.id]: { schema: 165, actor: frame } } });
    assert.ok(whole.routes[c.id].actor); whole.routes[c.id].actor.x = -1; assert.notEqual(frame.x, -1);
  });
  test(c.id + ': destination occupation, pause and native interaction keep the body on its supported source chart', () => {
    const out = simulate(route, pureStart(route)), opening = out.frames.find(frame => frame.stage === 'opening');
    const actor = { ...pureStart(route), ...opening }, arrival = route.passage(actor, c.annexRoomId).arrival;
    const held = simulate(route, actor, 2, { state: opening,
      player: { ...arrival, alive: true, roomId: c.annexRoomId } });
    assert.equal(held.state.crossings, 0); assert.equal(held.state.reason, 'occupied');
    assert.equal(route.advance(opening, actor, 1 / 60, { duty: true, resolution: resolution(route), running: false }), opening);
    const interacting = pureStart(route); interacting.workClock = 2;
    const paused = simulate(route, interacting, 1); assert.equal(paused.state.distance, 0);
    assert.equal(paused.state.reason, 'interaction');
  });
  test(c.id + ': the composed owner survives watch changes, actual dialogue, persistence and a complete return before native handoff', () => {
    const hub = runtime(7, { deck: c.deck, roomId: c.parentRoomId }), actor = hub.getNpcAnnexWorkpostActorV165(c.id);
    const originX = actor.x; context(hub, 10); assert.equal(hub.getNpcAnnexWorkpostActorV165(c.id), actor);
    tick(hub, 110); assert.equal(actor.roomId, c.annexRoomId, JSON.stringify({ route: state(hub, c.id),
      peers: hub.npcs.map(value => ({ crewId: value.crewId, x: value.x, roomId: value.roomId, vx: value.vx })),
      traffic: hub.getSnapshot().npcServiceTrafficV163 }));
    assert.equal(state(hub, c.id).actor.stage, 'service');
    hub.local = c.annexRoomId;
    const visible = hub.ensureAnnexNpcCohortV141().filter(member => member.crewId === c.crewId);
    assert.deepEqual(visible, [actor]);
    const event = hub.interactWithAnnexNpcV141(actor); assert.equal(event.crewId, c.crewId);
    assert.equal(event.roomId, c.annexRoomId);
    hub.persist(); const restored = runtime(10, hub.persisted.at(-1));
    assert.deepEqual(state(restored, c.id).actor, state(hub, c.id).actor);
    const returning = restored.getNpcAnnexWorkpostActorV165(c.id); context(restored, 13);
    let observedReturn = false;
    for (let i = 0; i < 110 * 60; i++) {
      const s = state(restored, c.id).actor;
      if (s?.roomId === c.parentRoomId && s.stage === 'service' && s.crossings === 2) {
        assert.ok(Math.abs(s.x - originX) < .26); observedReturn = true;
      }
      restored.update(1 / 60);
    }
    assert.ok(observedReturn); assert.equal(returning.roomId, c.parentRoomId);
    const end = state(restored, c.id); assert.equal(end.actor, null);
    assert.equal(end.nativeHandoff.fromRoomId, c.parentRoomId); assert.equal(end.nativeHandoff.observedTravel, false);
  });
  test(c.id + ': medical and mission owners take priority without cloning either local-route actor', () => {
    for (const extra of [{ crew: [{ id: c.crewId, health: 20, injuries: [] }] }, { operation: { crewIds: [c.crewId] } }]) {
      const hub = runtime(7), other = routes.find(value => value !== route);
      const otherActor = hub.getNpcAnnexWorkpostActorV165(other.definition.id);
      context(hub, 7, extra, false); hub.update(1 / 60);
      assert.equal(hub.getNpcAnnexWorkpostActorV165(c.id), null);
      assert.equal(hub.getNpcAnnexWorkpostActorV165(other.definition.id), otherActor);
      assert.equal(state(hub, c.id).nativeHandoff.observedTravel, false);
    }
  });
}

test('V165 workpost ownership is additive in Save defaults/migration and excludes unknown routes and foreign schemas', () => {
  const save = createDefaultSave(); assert.deepEqual(save.hub.npcAnnexWorkpostRoutesV165, normalizeNpcAnnexWorkpostRoutesV165());
  const route = routes[0], actor = pureStart(route), value = route.create(actor, post(route));
  save.hub.npcAnnexWorkpostRoutesV165 = { schema: 165, routes: { [route.definition.id]: { schema: 165, actor: value }, foreign: { actor: value } } };
  const restored = migrateSave(save); assert.deepEqual(restored.hub.npcAnnexWorkpostRoutesV165.routes[route.definition.id].actor, value);
  assert.equal(restored.hub.npcAnnexWorkpostRoutesV165.routes.foreign, undefined);
  assert.ok(Object.values(normalizeNpcAnnexWorkpostRoutesV165({ schema: 163, routes: save.hub.npcAnnexWorkpostRoutesV165.routes }).routes)
    .every(entry => entry.actor === null));
  for (const options of [{ editorProject: {} }, { forgeJourneyV141: true }]) {
    const hub = runtime(10, save.hub, options);
    assert.equal(hub.getNpcAnnexWorkpostActorV165(route.definition.id), null);
  }
});

test('the CCTV passing place preserves both physical owners and native courtesy through retreat, reload and eastbound release', () => {
  const hub = runtime(10, blockedLegacyOwnerSave()), rook = hub.getNpcAnnexWorkpostActorV165('rook-cctv');
  const echo = hub.npcCirculationActorV158, echoX = echo.x;
  tick(hub, 8);
  const snapshot = hub.getSnapshot(), passage = snapshot.npcAnnexWorkpostRoutesV165.passage;
  assert.equal(passage.mode, 'outbound'); assert.equal(passage.priorityRouteId, 'rook-cctv');
  assert.equal(hub.npcCirculationActorV158, echo); assert.equal(hub.getNpcAnnexWorkpostActorV165('rook-cctv'), rook);
  assert.ok(echo.x < echoX); assert.equal(echo.y + echo.h, 624);
  const courtesy = snapshot.npcServiceTrafficV163.actors.find(actor => actor.crewId === 'crew-10-david-8r');
  assert.ok(courtesy); assert.equal(courtesy.ownerCrewId, rook.crewId); assert.equal(courtesy.routeId, 'rook-cctv');
  hub.persist(); const restored = runtime(10, hub.persisted.at(-1)), resumed = restored.getSnapshot();
  assert.deepEqual(resumed.npcAnnexWorkpostRoutesV165.passage, passage);
  assert.deepEqual(resumed.npcAnnexWorkpostRoutesV165.routes['rook-cctv'].actor,
    snapshot.npcAnnexWorkpostRoutesV165.routes['rook-cctv'].actor);
  assert.deepEqual(resumed.npcAnnexLeasesV163.routes['echo-escape'].actor,
    snapshot.npcAnnexLeasesV163.routes['echo-escape'].actor);
  assert.deepEqual(resumed.npcServiceTrafficV163.actors, snapshot.npcServiceTrafficV163.actors);
  tick(restored, 110);
  assert.equal(state(restored, 'rook-cctv').actor.roomId, 'cctv');
  assert.equal(state(restored, 'rook-cctv').actor.crossings, 1);
  assert.equal(restored.getSnapshot().npcAnnexLeasesV163.routes['echo-escape'].actor.roomId, 'escape-pods');
  assert.equal(restored.getNpcAnnexLeaseActorV163('echo-escape').crewId, echo.crewId);
});

test('temporary owner courtesy cannot teleport, invent an arrival, enter a foreign chart or survive a foreign passage grant', () => {
  const route = routes[0], actor = pureStart(route), initial = route.create(actor, post(route));
  const withdrawn = simulate(route, actor, 3, { state: initial, yieldGoalX: actor.x + 80 });
  assert.ok(withdrawn.state.distance > 0); assert.equal(withdrawn.state.crossings, 0);
  assert.equal(withdrawn.state.arrivals, 0); assert.equal(withdrawn.state.stage, 'walking');
  assert.equal(withdrawn.state.targetRoomId, 'cctv');
  const hub = runtime(10, blockedLegacyOwnerSave()); tick(hub, 1); hub.persist();
  const saved = hub.persisted.at(-1).npcAnnexWorkpostRoutesV165;
  assert.ok(saved.passage);
  for (const patch of [{ goalX: -999 }, { crewId: 'crew-10-david-8r' }, { deck: 2 },
    { priorityRouteId: 'tamsin-proving' }, { workpostHomeX: saved.passage.workpostHomeX + 1 }, { mode: 'lift' }])
    assert.equal(normalizeNpcAnnexWorkpostRoutesV165({ ...saved, passage: { ...saved.passage, ...patch } }).passage, null);
  assert.equal(normalizeNpcAnnexWorkpostRoutesV165({ ...saved, routes: {} }).passage, null);
});

test('retaining a passing-pocket owner preserves its exact body after a watch while medical and mission priorities still delegate it',()=>{
  class RetainedRook extends TestHub {
    shouldRetainNpcServiceOwnerV165(routeId,actor) {
      return routeId==='rook-cctv'&&actor.crewId==='crew-06-rook'
        ?true:super.shouldRetainNpcServiceOwnerV165?.(routeId,actor);
    }
    getNpcServicePassingDutyV165(routeId,actor) {
      return routeId==='rook-cctv'&&actor.crewId==='crew-06-rook'
        ?false:super.getNpcServicePassingDutyV165?.(routeId,actor);
    }
  }
  for(const extra of[{crew:[{id:'crew-06-rook',health:20,injuries:[]}]},
    {operation:{crewIds:['crew-06-rook']}}]) {
    const hub=new RetainedRook();hub.start({}, {routineContextV62:{clock:{day:1,hour:7}}});
    const rook=hub.getNpcAnnexWorkpostActorV165('rook-cctv'),homeX=rook.x;
    context(hub,22);tick(hub,1);
    assert.equal(hub.getNpcAnnexWorkpostActorV165('rook-cctv'),rook);
    assert.equal(rook.x,homeX);assert.equal(rook.roomId,'combat-information');
    assert.equal(state(hub,'rook-cctv').actor.crossings,0);
    context(hub,22,extra,false);hub.update(1/60);
    assert.equal(hub.getNpcAnnexWorkpostActorV165('rook-cctv'),null);
    assert.equal(state(hub,'rook-cctv').nativeHandoff.observedTravel,false);
  }
});
