import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createContext, runInContext } from 'node:vm';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
import { normalizeNpcServiceTrafficV163, withHubNpcServiceTrafficV163 } from '../src/npc-service-traffic-v163.js';
import { withHubNpcInterdeckRoutesV165 } from '../src/npc-interdeck-routes-v165.js';
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
const TestHub = withHubNpcAnnexServiceRoutesV163(withHubNpcMedicalRouteV162(withHubNpcServiceRoutesV161(withHubNpcAnnexCirculationV159(withHubNpcCirculationV158(FixtureBase)))));
function runtime(hour = 5.5, save = {}, options = {}) { const h = new TestHub(); h.start(save, { ...options, routineContextV62: { clock: { day: 1, hour } } }); return h; }
function tick(h, seconds) { for (let i = 0; i < seconds * 60; i++) h.update(1 / 60); }
function context(h, hour, extra = {}, rebuild = true) { return h.setNpcRoutineContextV62({ clock: { day: 1, hour }, ...extra }, { persist: false, rebuild }); }

const definition = route => definitions.find(d => d.id === route.definition.id);
const watchHour = route => route.definition.id === 'asha-refuge' ? 17.5 : 10.5;
const routine = (route, hour = watchHour(route), extra = {}) => resolveNpcRoutineV62(route.definition.crewId, { clock: { day: 1, hour }, ...extra });
const homeRoom = route => HUB_DECKS[route.definition.deck].rooms.find(room => room.id === (route.definition.homeRoomId || route.definition.parentRoomId));
const initialActor = route => {
  const c = route.definition, room = homeRoom(route);
  return { ...spreadNpcStationSpawnsV136([{ ...RosterHub.prototype.createNpcs.call({}, c.deck).find(n => n.crewId === c.crewId),
    mobile: false, x: getNpcRoutineStandingAnchorV158(c.crewId, room.id, 'station') }], [room])[0], vx: 0 };
};
const post = route => createAnnexNpcsV141([{ ...definition(route), roomId: route.definition.annexRoomId }],
  new Map([[route.definition.crewId, routine(route)]]))[0];
function simulate(route, actor, seconds = 110, { state = route.create(actor, post(route)), duty = true,
  resolution = routine(route), rate = 60, doors = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, route.definition.deck).map(d => ({ ...d })),
  openBulkheads = true, ...options } = {}) {
  const frames = [];
  for (let i = 0; i < seconds * rate; i++) {
    if (openBulkheads) for (const door of doors) {
      const target = Math.abs(actor.x + actor.w / 2 - door.x) < 182 ? 1 : 0;
      door.progress += (target - door.progress) * Math.min(1, 7 / rate);
    }
    const before = state;
    state = route.advance(state, actor, 1 / rate, { duty, resolution, doors, ...options });
    const portalChange = (before.roomId === route.definition.annexRoomId) !== (state.roomId === route.definition.annexRoomId);
    if (!portalChange) assert.ok(Math.abs(state.x - before.x) <= 27 / rate + 1e-6, route.definition.id + ': physical horizontal step');
    else {
      assert.equal(before.stage, 'covering'); assert.equal(state.stage, 'revealing'); assert.equal(state.doorProgress, 0);
      assert.equal(state.distance, before.distance); assert.equal(state.actualVelocity, 0);
    }
    Object.assign(actor, { x: state.x, y: state.y, roomId: state.roomId, facing: state.facing, vx: state.actualVelocity || 0 });
    assert.equal(actor.y + actor.h, 624); frames.push({ ...state });
  }
  return { actor, state, frames, doors };
}
const snapshot = (hub, id) => hub.getSnapshot().npcAnnexRoutesV163.routes[id];
for (const route of routes) {
  const c = route.definition;
  test(c.id + ': uses the actual native identity, safe authored station, supported faces and whole-room2D projection', () => {
    const a = initialActor(route), p = post(route), s = route.create(a, p);
    assert.ok(s); assert.equal(a.spriteId, p.spriteId); assert.equal(a.w, 44); assert.equal(a.h, 92);
    assert.equal(p.y + p.h, 624); assert.ok(getAnnexNpcPlacementV141(c.annexRoomId, c.crewId).rails.some(r => p.x >= r.min && p.x <= r.max));
    for (const roomId of [c.homeRoomId || c.parentRoomId, c.parentRoomId, c.annexRoomId]) {
      const presentation = getHubRoomPresentationV119(roomId); assert.equal(presentation.presentationMode, '2d');
      assert.equal(presentation.projectionV139.mixedProjectionAllowed, false);
    }
    const out = simulate(route, a), covered = out.frames.find(f => f.stage === 'covering'); assert.ok(covered);
    assert.equal(out.state.stage, 'service'); assert.equal(out.state.roomId, c.annexRoomId); assert.equal(out.state.crossings, 1);
    const forward = route.passage({ ...a, ...covered }, c.annexRoomId); assert.ok(forward);
    const reverse = route.passage({ ...a, ...forward.arrival, roomId: c.annexRoomId }, c.parentRoomId); assert.ok(reverse);
    assert.equal(reverse.arrival.x, covered.x); assert.equal(forward.arrival.y, 532);
    const sheet = resolveSpriteSheet(a.spriteId), clip = route.occlusion({ ...covered, doorProgress: 1 });
    for (const facing of [-1, 1]) for (let frame = 0; frame < 12; frame++) {
      const g = resolveHumanAtlasGeometryV133({ actor: { ...a, ...covered, facing }, sheet, column: frame % 4, row: Math.floor(frame / 4), surface: 'hub' });
      assert.ok(g.visible.x >= clip.x - 1e-9 && g.visible.x + g.visible.width <= clip.x + clip.w + 1e-9);
      assert.ok(Math.abs(g.visible.y + g.visible.height - 624) < 1e-9);
    }
  });
  test(c.id + ': completes measured outbound and return at60 and12Hz, never counting the covered coordinate handoff as walking', () => {
    for (const rate of [60, 12]) {
      const out = simulate(route, initialActor(route), 110, { rate }); assert.equal(out.state.arrivals, 1);
      const back = simulate(route, out.actor, 110, { state: out.state, duty: false, resolution: routine(route, 5.5), rate, doors: out.doors });
      assert.equal(back.state.stage, 'service'); assert.equal(back.state.roomId, homeRoom(route).id);
      assert.equal(back.state.crossings, 2); assert.equal(back.state.arrivals, 2);
      assert.ok(Math.abs(back.state.x - back.state.homeX) < .25);
      assert.ok(Math.abs(back.state.distance - out.state.distance * 2) < .03);
    }
  });
  test(c.id + ': every native leaf phase resumes under163 while foreign bodies, unsupported feet and invalid watches are rejected', () => {
    const out = simulate(route, initialActor(route));
    for (const stage of ['walking', 'opening', 'covering', 'revealing', 'service']) {
      const saved = out.frames.find(f => f.stage === stage); assert.ok(saved);
      const restored = route.normalize({ schema: 163, actor: saved }).actor; assert.ok(restored);
      const continued = simulate(route, { ...initialActor(route), ...restored }, 110, { state: restored });
      assert.equal(continued.state.crossings, 1); assert.equal(continued.state.stage, 'service');
    }
    const valid = out.frames[0];
    for (const patch of [{ crewId: 'other' }, { deck: 99 }, { y: 531 }, { x: -50 }, { homeX: 0 },
      { dutyX: 90000 }, { velocity: 80 }, { stage: 'teleport' }, { doorProgress: 2 }])
      assert.equal(route.normalize({ schema: 163, actor: { ...valid, ...patch } }).actor, null);
    assert.equal(route.normalize({ schema: 162, actor: valid }).actor, null);
    const whole = normalizeNpcAnnexServiceRoutesV163({ schema: 163, routes: { [c.id]: { schema: 163, actor: valid } } });
    whole.routes[c.id].actor.x = 0; assert.notEqual(valid.x, 0);
  });
  test(c.id + ': destination occupancy, pause, contact hold and native medical priority prevent extra portal crossings', () => {
    const out = simulate(route, initialActor(route)), first = out.frames.find(s => s.stage === 'opening');
    const atDoor = { ...initialActor(route), ...first }, passage = route.passage(atDoor, c.annexRoomId);
    const occupied = { ...passage.arrival, alive: true, roomId: c.annexRoomId };
    const held = simulate(route, atDoor, 2, { state: first, player: occupied });
    assert.equal(held.state.reason, 'occupied'); assert.equal(held.state.crossings, 0); assert.equal(held.state.x, first.x);
    assert.equal(route.advance(first, atDoor, 1 / 60, { resolution: routine(route), duty: true, running: false }), first);
    const interacting = { ...initialActor(route), workClock: 2.4 };
    const contact = simulate(route, interacting, 1); assert.equal(contact.state.reason, 'interaction'); assert.equal(contact.state.distance, 0);
    const medical = simulate(route, initialActor(route), 1, { resolution: routine(route, watchHour(route), { crew: [{ id: c.crewId, health: 20, injuries: [] }] }) });
    assert.equal(medical.state.reason, 'medical-recovery'); assert.equal(medical.state.distance, 0);
  });
  test(c.id + ': the composite actual owner persists through reload, native dialogue and returned watch handoff', () => {
    const h = runtime(), actor = h.getNpcAnnexServiceActorV163(c.id); assert.ok(actor);
    context(h, watchHour(route)); assert.equal(h.getNpcAnnexServiceActorV163(c.id), actor); tick(h, 110);
    assert.equal(snapshot(h, c.id).actor?.roomId, c.annexRoomId); assert.equal(snapshot(h, c.id).actor.stage, 'service');
    h.local = c.annexRoomId; h.state.deck = c.deck;
    const event = h.interactWithAnnexNpcV141(actor); assert.equal(event.crewId, c.crewId); assert.equal(event.roomId, c.annexRoomId);
    const before = actor.x; tick(h, 1); assert.equal(actor.x, before);
    h.persist(); const persisted = h.persisted.at(-1), restored = runtime(watchHour(route), persisted);
    assert.deepEqual(snapshot(restored, c.id).actor, snapshot(h, c.id).actor);
    const visible = restored.ensureAnnexNpcCohortV141().filter(n => n.crewId === c.crewId);
    assert.equal(visible.length, 1); assert.equal(visible[0], restored.getNpcAnnexServiceActorV163(c.id));
    context(restored, c.id === 'asha-refuge' ? 20.5 : c.id === 'mara-archives' ? 14.5 : 13.5); tick(restored, 110);
    const end = snapshot(restored, c.id)
    if (c.id === 'mara-archives') {
      assert.ok(end.actor); assert.equal(end.actor.roomId, 'briefing'); assert.equal(end.actor.stage, 'service');
      assert.equal(end.actor.crossings, 2); assert.notEqual(end.actor.x, end.actor.homeX);
      context(restored, 21.5); tick(restored, 80);
      assert.equal(snapshot(restored, c.id).actor.roomId, 'bridge');
      assert.ok(Math.abs(snapshot(restored, c.id).actor.x - snapshot(restored, c.id).actor.homeX) < .25);
    } else {
      assert.equal(end.actor, null); assert.equal(end.nativeHandoff.observedTravel, false);
      assert.equal(end.nativeHandoff.fromRoomId, c.parentRoomId);
    }
  });
}

test('Mara cannot cross a closed native bulkhead or restore a body into an unreserved leaf; its real open phase is durable', () => {
  const route = routes.find(r => r.definition.id === 'mara-archives');
  const closed = simulate(route, initialActor(route), 70, { openBulkheads: false });
  assert.equal(closed.state.roomId, 'bridge'); assert.equal(closed.state.crossings, 0); assert.ok(closed.state.blocked);
  const moving = simulate(route, initialActor(route));
  const threshold = moving.frames.find(s => s.x < 1288 && s.x + 44 > 1272); assert.ok(threshold);
  assert.ok(threshold.bulkheadProgress['command:hub-west-bulkhead'] >= .82);
  assert.ok(route.normalize({ schema: 163, actor: threshold }).actor);
  assert.equal(route.normalize({ schema: 163, actor: { ...threshold, bulkheadProgress: {} } }).actor, null);
  assert.equal(route.normalize({ schema: 163, actor: { ...threshold, bulkheadProgress: { foreign: 1 } } }).actor, null);
  assert.equal(route.normalize({ schema: 163, actor: { ...threshold, targetPostX: 100000 } }).actor, null);
});

test('all ten composed actors retain their exact singleton when another owner hands off for care, mission or unavailable lifecycle', () => {
  for (const route of routes) for (const reason of ['medical', 'mission', 'unavailable']) {
    const h = runtime(), departing = h.getNpcAnnexServiceActorV163(route.definition.id);
    const other = routes.filter(r => r !== route).map(r => [r.definition.id, h.getNpcAnnexServiceActorV163(r.definition.id)]);
    const inherited = [h.npcCirculationActorV158, h.npcAnnexActorV159, h.getNpcServiceActorV161('idris-engine'),
      h.getNpcServiceActorV161('leila-galley'), h.getNpcMedicalActorV162()];
    assert.ok(departing); assert.ok(inherited.every(Boolean));
    if (reason === 'unavailable') departing.downed = true;
    else context(h, 5.5, reason === 'medical' ? { crew: [{ id: route.definition.crewId, health: 20, injuries: [] }] }
      : { operation: { crewIds: [route.definition.crewId] } }, false);
    h.update(1 / 60); assert.equal(h.getNpcAnnexServiceActorV163(route.definition.id), null);
    assert.equal(snapshot(h, route.definition.id).nativeHandoff.observedTravel, false);
    for (const [id, actor] of other) assert.equal(h.getNpcAnnexServiceActorV163(id), actor);
    assert.deepEqual([h.npcCirculationActorV158, h.npcAnnexActorV159, h.getNpcServiceActorV161('idris-engine'),
      h.getNpcServiceActorV161('leila-galley'), h.getNpcMedicalActorV162()], inherited);
  }
});

test('new annex owners are absent in editor/Forge contexts and normalization rejects a foreign outer schema', () => {
  for (const options of [{ editorProject: {} }, { forgeJourneyV141: true }]) {
    const h = runtime(10.5, {}, options); tick(h, 1);
    for (const r of routes) { assert.equal(h.getNpcAnnexServiceActorV163(r.definition.id), null); assert.equal(snapshot(h, r.definition.id).actor, null); }
  }
  for (const r of Object.values(normalizeNpcAnnexServiceRoutesV163({ schema: 162, routes: {} }).routes)) assert.equal(r.actor, null);
});

const overlaps = (a, b) => a.x < b.x + b.w - 1e-7 && a.x + a.w > b.x + 1e-7
  && a.y < b.y + b.h && a.y + a.h > b.y;

// Isolate the production courtesy planner and physical walker on real native
// routine bodies. The passenger/timetable remain fixed while their blockers
// clear; full interdeck journeys retain their separate integration suite.
const interdeckCourtesyMethodsV165 = withHubNpcInterdeckRoutesV165(class {}).prototype;
class CourtesyQueueHubV163 extends withHubNpcServiceTrafficV163(class extends FixtureBase { update() {} }) {
  getNpcServiceOwnedActorsV163() { return this.queueOwners || []; }
  getNpcInterdeckActorsV165() { return this.queueOwners || []; }
  getNpcServiceTrafficIntentsV163() {
    return interdeckCourtesyMethodsV165.getNpcServiceTrafficIntentsV163.call(this);
  }
  canPreemptNpcServiceCourtesyV165(...args) {
    return interdeckCourtesyMethodsV165.canPreemptNpcServiceCourtesyV165.apply(this, args);
  }
}
function courtesyQueueV163(direction = 1, count = 2, saved = null) {
  const h = new CourtesyQueueHubV163();
  h.start({ deck: 0, roomId: 'briefing', ...(saved ? { npcServiceTrafficV163: saved } : {}) },
    { routineContextV62: { clock: { day: 1, hour: 12.5 } } });
  const native = id => h.getNpcServicePeersV163(0).find(peer => peer.crewId === id);
  const owner = native('crew-08-maksim-orlov'), first = native('crew-12-asha-mbaye'),
    second = native('crew-07-sanaa-doyle'), third = native('crew-06-rook');
  const goal = direction === 1 ? 2254 : 2446;
  Object.assign(owner, { x: goal - direction * 16, y: 532, w: 44, h: 92 });
  // The unrelated briefing body is parked outside the disclosed queue.
  native('crew-01-mara-vega').x = 1450;
  const peers = [first, second, ...(count === 3 ? [third] : [])];
  if (count !== 3) third.x = 1550;
  if (!saved) peers.forEach((peer, index) => Object.assign(peer,
    { x: goal + direction * (40 + index * 56), y: 532, w: 44, h: 92, workClock: 0, supportClock: 0 }));
  h.queueOwners = [owner];
  h.npcInterdeckBodiesV165 = new Map([['maksim-cockpit', owner]]);
  h.npcInterdeckStateV165 = { routes: { 'maksim-cockpit': { actor: {
    x: owner.x, y: 532, deck: 0, roomId: 'briefing', stage: 'walking-lift' } } } };
  assert.equal(h.getNpcServiceTrafficIntentsV163()[0].goalX, goal);
  return { h, owner, peers, goal, direction };
}

test('courtesy expands only the occupied bay chain in both directions and moves the same bodies without overtaking', () => {
  for (const direction of [1, -1]) for (const count of [2, 3]) {
    const { h, owner, peers, goal } = courtesyQueueV163(direction, count);
    const initial = peers.map(peer => peer.x), untouched = h.getNpcServicePeersV163(0)
      .filter(peer => peer !== owner && !peers.includes(peer)).map(peer => ({ peer, x: peer.x }));
    h.planNpcServiceCourtesyV163();
    assert.deepEqual(h.npcTrafficStateV163.actors.map(row => row.crewId), peers.map(peer => peer.crewId));
    for (const [index, peer] of peers.entries()) {
      assert.equal(h.npcTrafficBodiesV163.get(peer.crewId), peer);
      assert.equal(peer.x, initial[index], 'Planning reserves a bay without moving its body.');
      assert.equal(h.npcTrafficStateV163.actors[index].targetX, goal + direction * 68 * (index + 1));
    }
    const walked = new Map(peers.map(peer => [peer, 0]));
    for (let frame = 0; frame < 600; frame++) {
      const before = new Map(peers.map(peer => [peer, peer.x]));
      h.update(1 / 60);
      for (const [index, peer] of peers.entries()) {
        const step = Math.abs(peer.x - before.get(peer)); walked.set(peer, walked.get(peer) + step);
        assert.ok(step <= 27 / 60 + 1e-7);
        assert.equal(h.getNpcServiceTrafficActorsV163(0).find(body => body.crewId === peer.crewId), peer);
        assert.equal(h.npcs.filter(body => body.crewId === peer.crewId).length, 1);
        assert.ok(!overlaps(peer, owner));
        if (index) assert.ok(direction * (peer.x - peers[index - 1].x) >= 56 - 1e-7);
      }
    }
    for (const [index, peer] of peers.entries()) {
      const state = h.npcTrafficStateV163.actors.find(row => row.crewId === peer.crewId);
      assert.ok(Math.abs(peer.x - (goal + direction * 68 * (index + 1))) < .25);
      assert.equal(state.homeX, initial[index]); assert.ok(state.distance > 20);
      assert.ok(Math.abs(state.distance - walked.get(peer)) < 1e-7);
    }
    for (const { peer, x } of untouched) assert.equal(peer.x, x, 'A body outside the occupied chain stays untouched.');
    const saved = normalizeNpcServiceTrafficV163(h.npcTrafficStateV163);
    assert.equal(saved.actors.length, peers.length);
    const reloaded = courtesyQueueV163(direction, count, JSON.parse(JSON.stringify(saved)));
    assert.deepEqual(normalizeNpcServiceTrafficV163(reloaded.h.npcTrafficStateV163), saved);
    for (const state of saved.actors) {
      const body = reloaded.h.getNpcServiceTrafficActorsV163(0).find(peer => peer.crewId === state.crewId);
      assert.equal(body.x, state.x); assert.equal(body.roomId, state.roomId);
    }
  }
});

test('courtesy chain reservations remain atomic for player, owner, contact, crisis, mission, care and circuit limits', () => {
  const cases = [
    ['player', ({ h, goal, direction }) => { h.player.x = goal + direction * 176; }],
    ['owner', ({ h, peers }) => { h.queueOwners.push(peers[1]); }],
    ['work', ({ peers }) => { peers[1].workClock = 1; }],
    ['support', ({ peers }) => { peers[1].supportClock = 1; }],
    ['downed', ({ peers }) => { peers[1].downed = true; }],
    ...['alert', 'missionAssigned', 'needsCare'].map(flag => [flag, ({ h, peers }) => {
      const id = peers[1].crewId, resolution = h.npcRoutineResolutionsV62.get(id);
      h.npcRoutineResolutionsV62.set(id, { ...resolution, [flag]: true });
    }]),
    ['circuit limit', ({ h, goal, direction }) => {
      const intent = h.getNpcServiceTrafficIntentsV163()[0];
      if (direction === 1) intent.maxX = goal + 100; else intent.minX = goal - 100;
      h.getNpcServiceTrafficIntentsV163 = () => [intent];
    }]
  ];
  for (const direction of [1, -1]) for (const [label, prepare] of cases) {
    const fixture = courtesyQueueV163(direction); prepare(fixture);
    const before = fixture.peers.map(peer => peer.x);
    fixture.h.planNpcServiceCourtesyV163();
    assert.equal(fixture.h.npcTrafficStateV163.actors.length, 0, label + '/' + direction);
    assert.deepEqual(fixture.peers.map(peer => peer.x), before, label + ': no partial movement');
  }
});

test('courtesy chain preemption preserves the original bookmark, body and travelled distance', () => {
  const { h, owner, peers, goal } = courtesyQueueV163();
  const peer = peers[0], before = { crewId: peer.crewId, deck: 0, roomId: peer.roomId, homeRoomId: peer.roomId,
    x: peer.x, y: 532, homeX: 2180, targetX: peer.x, velocity: 0, time: 5, distance: peer.x - 2180,
    facing: 1, phase: 'holding', routineKey: h.npcRoutineResolutionsV62.get(peer.crewId).deterministicKey,
    ownerCrewId: 'crew-01-mara-vega', routeId: 'mara-archives',
    bulkheadProgress: Object.fromEntries(h.npcTrafficDoorsV163[0].map(door => [door.id, door.progress])) };
  h.npcTrafficStateV163.actors.push(before); h.npcTrafficBodiesV163.set(peer.crewId, peer);
  h.planNpcServiceCourtesyV163();
  assert.equal(h.npcTrafficStateV163.actors.length, 2);
  assert.equal(h.npcTrafficStateV163.actors[0], before);
  assert.equal(h.npcTrafficBodiesV163.get(peer.crewId), peer);
  assert.equal(before.ownerCrewId, owner.crewId); assert.equal(before.routeId, 'maksim-cockpit:deck-0');
  assert.equal(before.homeX, 2180); assert.equal(before.time, 5); assert.equal(before.distance, peer.x - 2180);
  const protectedFixture = courtesyQueueV163(), protectedPeer = protectedFixture.peers[1];
  const protectedState = { ...before, crewId: protectedPeer.crewId, x: protectedPeer.x, homeX: protectedPeer.x,
    targetX: protectedPeer.x, ownerCrewId: 'crew-14-echo-a', routeId: 'echo-escape',
    routineKey: protectedFixture.h.npcRoutineResolutionsV62.get(protectedPeer.crewId).deterministicKey };
  protectedFixture.h.npcTrafficStateV163.actors.push(protectedState);
  protectedFixture.h.npcTrafficBodiesV163.set(protectedPeer.crewId, protectedPeer);
  const snapshot = structuredClone(protectedState);
  protectedFixture.h.planNpcServiceCourtesyV163();
  assert.deepEqual(protectedFixture.h.npcTrafficStateV163.actors, [snapshot], 'A foreign reservation cannot be absorbed into the chain.');
});

for (const id of ['maksim-arrival', 'inez-bioforge', 'mara-archives']) {
  test(id + ': a complete native watch visibly clears actual unowned peers without crossing, duplicating or moving another route owner', () => {
    const route = routes.find(r => r.definition.id === id), c = route.definition;
    const h = runtime(5.5, { deck: c.deck, roomId: homeRoom(route).id });
    h.player.x = id === 'inez-bioforge' ? 783 : id === 'mara-archives' ? 300 : 225;
    const actor = h.getNpcAnnexServiceActorV163(id), oldOwners = h.getNpcServiceOwnedActorsV163();
    context(h, 10.5);
    const moved = new Set(), before = new Map(); let restoredCount = 0;
    for (let frame = 0; frame < 6600; frame++) {
      h.update(1 / 60);
      const peers = h.getNpcServicePeersV163(c.deck, c.crewId);
      assert.ok(!peers.some(peer => peer.roomId === actor.roomId && overlaps(actor, peer)), id + ': owner never crosses a peer');
      const traffic = h.getNpcServiceTrafficActorsV163(c.deck);
      assert.equal(new Set([...traffic, ...h.getNpcServiceOwnedActorsV163()].map(a => a.crewId)).size,
        traffic.length + h.getNpcServiceOwnedActorsV163().length);
      for (const body of traffic) {
        assert.equal(body.y + body.h, 624);
        assert.ok(!oldOwners.includes(body), 'courtesy cannot adopt a different physical owner');
        assert.equal(h.npcs.filter(n => n.crewId === body.crewId).length, 1);
        assert.equal(h.npcs.find(n => n.crewId === body.crewId), body);
        assert.ok(!h.getNpcServicePeersV163(c.deck, body.crewId).some(other => overlaps(body, other)), body.crewId + ': no overlap');
        const prior = before.get(body.crewId);
        if (prior) assert.ok(Math.abs(body.x - prior.x) <= 27 / 60 + 1e-7);
        before.set(body.crewId, { x: body.x });
        if (Math.abs(body.vx) > .1) moved.add(body.crewId);
      }
      if (frame % 120 === 0 && h.npcTrafficStateV163.actors.length) {
        const saved = normalizeNpcServiceTrafficV163(h.npcTrafficStateV163);
        assert.equal(saved.actors.length, h.npcTrafficStateV163.actors.length, 'every actual courtesy pose restores');
        assert.deepEqual(saved, normalizeNpcServiceTrafficV163(saved)); restoredCount++;
      }
    }
    assert.equal(snapshot(h, id).actor.roomId, c.annexRoomId);
    assert.equal(snapshot(h, id).actor.crossings, 1);
    assert.ok(moved.size >= 1); assert.ok(restoredCount > 2);
    h.persist(); const restored = runtime(10.5, { ...h.persisted.at(-1), deck: c.deck, roomId: c.parentRoomId });
    assert.deepEqual(restored.getSnapshot().npcServiceTrafficV163.actors, h.getSnapshot().npcServiceTrafficV163.actors);
    const states = h.npcTrafficStateV163.actors;
    for (const state of states) for (const patch of [{ y: 531 }, { x: -1 }, { targetX: 90000 }, { crewId: 'intruder' }, { velocity: 90 }, { bulkheadProgress: { foreign: 1 } }])
      assert.equal(normalizeNpcServiceTrafficV163({ schema: 163, actors: [{ ...state, ...patch }] }).actors.length, 0);
    const released = states[0];
    context(h, 10.5, { crew: [{ id: released.crewId, health: 20, injuries: [] }] });
    h.update(1 / 60);
    assert.ok(!h.getNpcServiceTrafficActorsV163().some(body => body.crewId === released.crewId));
    assert.equal(h.getSnapshot().npcServiceTrafficV163.handoffs.find(a => a.crewId === released.crewId).observedTravel, false);
    assert.equal(h.getNpcAnnexServiceActorV163(id), actor);
  });
}

test('courtesy respects a physical obstruction, pause and native locked bulkheads rather than clearing through them', () => {
  const h = runtime(5.5, { deck: 0, roomId: 'bridge' }); h.player.x = 300;
  context(h, 10.5); h.hubTrainingV132 = { lockedDoorIds: ['command:hub-west-bulkhead'] };
  tick(h, 110);
  assert.equal(snapshot(h, 'mara-archives').actor.crossings, 0);
  assert.equal(snapshot(h, 'mara-archives').actor.roomId, 'bridge');
  assert.ok(h.getNpcServiceTrafficActorsV163(0).every(a => a.x + a.w <= 1272 || a.x >= 1288));
  const before = h.getSnapshot().npcServiceTrafficV163; h.running = false; h.update(.1);
  assert.deepEqual(h.getSnapshot().npcServiceTrafficV163, before);
});

test('courtesy adopts the exact already-moved native body and its contact priority, then expires contact clocks off camera', () => {
  const h = runtime(5.5, { deck: 3, roomId: 'dropship-hangar' }); h.player.x = 225;
  context(h, 10.5); h.update(1 / 60);
  const cal = h.npcs.find(a => a.crewId === 'crew-16-cal-mercer'); assert.ok(cal);
  // A native routine/interaction may change the actual object after its
  // template was cached. This fixture isolates that legitimate new pose.
  cal.x += 60; cal.workClock = 2.4;
  assert.equal(h.getNpcServicePeersV163(3).find(a => a.crewId === cal.crewId), cal);
  h.local = 'arrival-airlock';
  assert.equal(h.getNpcServicePeersV163(3).find(a => a.crewId === cal.crewId), cal, 'parent life remains live behind annex camera');
  h.local = null; h.ventActorV62 = {};
  assert.equal(h.getNpcServicePeersV163(3).find(a => a.crewId === cal.crewId), cal, 'parent life remains live behind vent camera');
  h.ventActorV62 = null;
  const x = cal.x; h.update(1 / 60);
  assert.ok(!h.getNpcServiceTrafficActorsV163().includes(cal)); assert.equal(cal.x, x);
  cal.workClock = 0;
  const before = cal.x; h.update(1 / 60);
  assert.equal(h.getNpcServiceTrafficActorsV163(3).find(a => a.crewId === cal.crewId), cal);
  assert.equal(h.npcTrafficStateV163.actors.find(a => a.crewId === cal.crewId).homeX, before);
  assert.ok(Math.abs(cal.x - before) <= 27 / 60 + 1e-7);
  cal.workClock = .4;
  h.state.deck = 1; h.state.roomId = 'medical'; h.npcs = h.createNpcs(1);
  const held = cal.x; tick(h, 1);
  assert.equal(cal.workClock, 0); assert.ok(cal.x > held + 1);
  assert.equal(h.getNpcServiceTrafficActorsV163(3).find(a => a.crewId === cal.crewId), cal);
});

test('an imported courtesy reservation cannot use a real routine key to move a native body onto a different deck or route', () => {
  const h = runtime(5.5, { deck: 3, roomId: 'dropship-hangar' }); h.player.x = 225;
  context(h, 10.5); tick(h, 1);
  const cal = h.npcTrafficStateV163.actors.find(a => a.crewId === 'crew-16-cal-mercer'); assert.ok(cal);
  for (const patch of [{ routeId: 'invented' }, { ownerCrewId: 'crew-04-noor-okafor' }, { deck: 0 }, { homeRoomId: 'sensor-array' }])
    assert.equal(normalizeNpcServiceTrafficV163({ schema: 163, actors: [{ ...cal, ...patch }] }).actors.length, 0);
  const crossDeck = { ...cal, deck: 0, homeRoomId: 'bridge', roomId: 'bridge',
    x: 545, homeX: 545, targetX: 1626, routeId: 'mara-archives', ownerCrewId: 'crew-01-mara-vega',
    bulkheadProgress: Object.fromEntries(buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, 0).filter(d => !d.lift).map(d => [d.id, 0])) };
  assert.equal(normalizeNpcServiceTrafficV163({ schema: 163, actors: [crossDeck] }).actors.length, 1);
  const restored = runtime(10.5, { deck: 3, roomId: 'dropship-hangar', npcServiceTrafficV163: { schema: 163, actors: [crossDeck] } });
  restored.getNpcServicePeersV163(3);
  assert.ok(!restored.getNpcServiceTrafficActorsV163().some(a => a.crewId === cal.crewId));
  assert.ok(!restored.npcTrafficStateV163.actors.some(a => a.crewId === cal.crewId));
  assert.equal(restored.getSnapshot().npcServiceTrafficV163.handoffs.find(a => a.crewId === cal.crewId).observedTravel, false);
});

// These are adversarial observer/control fixtures, not a second gameplay
// implementation. Extract the actual browser callback from the Python AST.
function serviceQaCallbackV163(name, method = 'evaluate', index = 0) {
  const python = `import ast, json, sys
from pathlib import Path
tree = ast.parse(Path(sys.argv[1]).read_text())
scope = {}
for node in tree.body:
    if isinstance(node, ast.Assign) and isinstance(node.value, ast.Constant) and isinstance(node.value.value, str):
        for target in node.targets:
            if isinstance(target, ast.Name): scope[target.id] = node.value.value
owner = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == sys.argv[2])
calls = sorted([n for n in ast.walk(owner) if isinstance(n, ast.Call) and isinstance(n.func, ast.Attribute) and n.func.attr == sys.argv[4]], key=lambda n: (n.lineno, n.col_offset))
assert 0 <= int(sys.argv[5]) < len(calls)
expression = ast.Expression(calls[int(sys.argv[5])].args[0])
Path(sys.argv[3]).write_text(json.dumps(eval(compile(expression, '<actual-service-qa-callback>', 'eval'), scope)))
`;
  const path = process.env.ATF_QA_ANNEX_SERVICE_SOURCE || new URL('qa-npc-annex-service-routes-v163.py', import.meta.url).pathname;
  const directory = mkdtempSync(join(tmpdir(), 'annex-service-qa-ast-')), output = join(directory, 'callback.json');
  try {
    execFileSync('python3', ['-c', python, path, name, output, method, String(index)], { stdio: 'inherit', timeout: 30000 });
    return JSON.parse(readFileSync(output, 'utf8'));
  } finally { rmSync(directory, { recursive: true, force: true }); }
}
function serviceObserverHostV163(sample) {
  let now = 0, serial = 0; const rafs = new Map(), timers = new Map();
  const hub = { running: true, state: { deck: 1, roomId: 'crew-quarters' },
    player: { x: 1187, y: 532, w: 44, h: 92, vx: 0, alive: true }, animationTime: 0,
    npcRoutineResolutionsV62: new Map(), npcRoutineContextV62: { clock: { day: 1, hour: 20.5 } },
    getSnapshot: () => ({ npcAnnexRoutesV163: { routes: { 'asha-refuge': structuredClone(sample) } } }),
    currentAnnexV71: () => null };
  const sandbox = createContext({ __ATF_HUB__: hub, structuredClone, performance: { now: () => now },
    requestAnimationFrame: fn => { rafs.set(++serial, fn); return serial; }, cancelAnimationFrame: id => rafs.delete(id),
    setInterval: (fn, period) => { timers.set(++serial, { fn, period, next: now + period }); return serial; },
    clearInterval: id => timers.delete(id),
    document: { querySelector: () => ({ toDataURL: () => 'data:image/png;base64,' }) } });
  sandbox.window = sandbox;
  return { hub, sandbox, rafs, timers, run: (source, config) => runInContext('(' + source + ')', sandbox)(config),
    async frame(ms = 1000 / 60, nativeSeconds = ms / 1000) {
      now += ms; hub.animationTime += nativeSeconds;
      for (const timer of [...timers.values()]) if (now >= timer.next) { timer.next = now + timer.period; timer.fn(); }
      for (const [id, fn] of [...rafs]) if (rafs.delete(id)) fn(now);
      await Promise.resolve();
    } };
}
const ashaQaConfigV163 = { id: 'asha-refuge', crew: 'crew-12-asha-mbaye', deck: 1,
  parent: 'crew-quarters', annex: 'personal-refuge', annexDoor: 122 };
const ashaBlockedServiceV163 = () => ({ actor: { crewId: 'crew-12-asha-mbaye', deck: 1,
  roomId: 'personal-refuge', x: 908.4330357142857, y: 532, stage: 'service', reason: 'occupied',
  doorProgress: 0, crossings: 1, arrivals: 1, time: 71.96855600000056 }, nativeHandoff: null,
  sourceFace: { opening: { x: 1168.88, w: 80.24 } } });

test('annex-service QA rejects the false Asha service occupation and waits for the actual local opening', async () => {
  const sample = ashaBlockedServiceV163(), h = serviceObserverHostV163(sample);
  let result = null;
  const pending = h.run(serviceQaCallbackV163('wait_occupied_return'), ashaQaConfigV163).then(value => { result = value; });
  await h.frame();
  assert.equal(result, null, 'service/occupied at x908 cannot certify an occupied return aperture');
  Object.assign(sample.actor, { x: 122, stage: 'opening', time: sample.actor.time + 29 });
  await h.frame(29000); await pending;
  assert.equal(result.status, 'occupied'); assert.equal(result.latest.actor.x, 122);
  assert.equal(result.latest.actor.stage, 'opening'); assert.equal(result.latest.actor.crossings, 1);
  assert.equal(result.simBudgetSeconds, 50); assert.equal(result.wallBudgetMs, 360000); assert.equal(result.stallBudgetMs, 45000);
  assert.equal(h.rafs.size, 0); assert.equal(h.timers.size, 0);
});

function ashaDependencyHostV163() {
  const sample = ashaBlockedServiceV163(), h = serviceObserverHostV163(sample);
  const dependency = { origin: { crewId: 'crew-11-jun-park', deck: 3, roomId: 'life-support',
    x: 3158, y: 532, source: 'legacy-physical-owner' }, nativeHandoff: null, returned: null,
    actor: { crewId: 'crew-11-jun-park', x: 1243, y: 532, deck: 1, roomId: 'crew-quarters',
      stage: 'walking-home', doorProgress: 0, crossings: 2, liftJourneys: 1,
      lift: null, time: 70, distance: 5000 } };
  h.sample = sample; h.dependency = dependency; h.passageRequested = true;
  h.hub.player.x = 125;
  h.hub.currentAnnexV71 = () => ({ id: 'personal-refuge' });
  h.hub.nearestAnnexExitV71 = () => ({ annexId: 'personal-refuge' });
  h.hub.npcInterdeckStateV165 = { routes: { 'jun-sanitary': dependency } };
  h.hub.npcInterdeckPassingRequestV165 = id => id === 'asha-refuge' && h.passageRequested;
  h.returnJun = () => {
    dependency.actor = null; h.passageRequested = false;
    dependency.returned = { crewId: 'crew-11-jun-park', deck: 3, roomId: 'life-support',
      x: 3158, y: 532, crossings: 2, liftJourneys: 2, verticalDistance: 496,
      distance: 9200, observedTravel: true };
  };
  return h;
}

test('annex-service QA accepts only the declared Jun dependency and its complete physical return receipt', async () => {
  const source = serviceQaCallbackV163('arm_asha_return_dependency');
  const controller = withHubNpcInterdeckRoutesV165(class {}).prototype;
  for (const id of ['jun-sanitary', 'maksim-cockpit', 'inez-civil']) {
    const linked = controller.npcInterdeckPassingRequestV165.call({
      npcInterdeckStateV165: { routes: { [id]: { actor: {} } } } }, 'asha-refuge');
    assert.equal(linked, id === 'jun-sanitary', 'The observer follows the actual controller relation.');
  }
  const h = ashaDependencyHostV163(); h.run(source, ashaQaConfigV163);
  let completed = null;
  const pending = h.sandbox.__ATF_ASHA_JUN_DEPENDENCY_V163__.then(value => { completed = value; });
  await h.frame(0);
  // These deliberate observer samples test a long prerequisite separately
  // from Asha's 50-second walk. They do not claim to simulate Jun's journey.
  for (let second = 15; second <= 300; second += 15) {
    h.dependency.actor.x -= 15; h.dependency.actor.time += 15;
    await h.frame(15000); assert.equal(completed, null);
  }
  h.returnJun(); await h.frame(15000); await pending;
  assert.equal(completed.status, 'returned'); assert.equal(completed.simSeconds, 315);
  assert.equal(completed.reason, 'jun-complete-native-return');
  assert.equal(completed.wallBudgetMs, 900000); assert.equal(completed.simBudgetSeconds, 360);
  assert.equal(completed.stallBudgetMs, 45000); assert.equal(completed.observedOrigin.x, 3158);
  assert.equal(h.rafs.size, 0); assert.equal(h.timers.size, 0);

  const invalid = [
    ['missing dependency', x => { delete x.hub.npcInterdeckStateV165.routes['jun-sanitary']; }, 'jun-dependency-missing'],
    ['unrequested actor', x => { x.passageRequested = false; }, 'jun-passing-request-not-active'],
    ['different physical owner', x => { x.dependency.actor.crewId = 'crew-08-maksim-orlov'; }, 'foreign-jun-physical-owner'],
    ['different origin', x => { x.dependency.origin.x += 10; }, 'jun-origin-mismatch'],
    ['sampled origin', x => { x.dependency.origin.source = 'native-v62-routine'; }, 'jun-origin-mismatch'],
    ['Asha handoff', x => { x.sample.nativeHandoff = { observedTravel: false }; }, 'asha-owner-changed-during-jun-return'],
    ['Asha no longer held', x => { x.sample.actor.stage = 'walking'; }, 'asha-is-not-held-for-jun'],
    ['player moves', x => { x.hub.player.x += 1; }, 'player-left-native-refuge-threshold'],
    ['native pause', x => { x.hub.running = false; }, 'player-left-native-refuge-threshold'],
    ['Jun mission', x => { x.hub.npcRoutineResolutionsV62.set('crew-11-jun-park', { missionAssigned: true }); }, 'jun-priority-handoff-is-not-a-return'],
    ['Jun handoff', x => { x.dependency.nativeHandoff = { observedTravel: false }; }, 'jun-priority-handoff-is-not-a-return'],
    ['lost actor', x => { x.dependency.actor = null; x.passageRequested = false; }, 'jun-lost-without-complete-physical-return'],
    ...[
      ['unobserved', { observedTravel: false }], ['foreign receipt', { crewId: 'crew-08-maksim-orlov' }],
      ['wrong destination', { roomId: 'crew-quarters' }], ['short return', { x: 3157 }],
      ['missing coordinate', { x: undefined }], ['non-finite coordinate', { x: NaN }],
      ['incomplete crossings', { crossings: 1 }], ['incomplete lift', { liftJourneys: 1 }],
      ['incomplete climb', { verticalDistance: 495 }], ['backwards distance', { distance: 4999 }],
      ['missing climb', { verticalDistance: undefined }], ['non-finite climb', { verticalDistance: NaN }],
      ['non-finite distance', { distance: NaN }]
    ].map(([label, patch]) => [label, x => { x.returnJun(); Object.assign(x.dependency.returned, patch); },
      'jun-lost-without-complete-physical-return'])
  ];
  for (const [label, mutate, reason] of invalid) {
    const fixture = ashaDependencyHostV163(); fixture.run(source, ashaQaConfigV163);
    let result = null;
    fixture.sandbox.__ATF_ASHA_JUN_DEPENDENCY_V163__.then(value => { result = value; });
    await fixture.frame(0); mutate(fixture); await fixture.frame(1000);
    assert.equal(result?.status, 'failed', label); assert.equal(result.reason, reason, label);
    assert.equal(fixture.rafs.size, 0, label); assert.equal(fixture.timers.size, 0, label);
  }
});

test('annex-service QA keeps physical, simulation and wall guards and cleans every completed observer', async () => {
  const dependencySource = serviceQaCallbackV163('arm_asha_return_dependency');
  for (const mode of ['frozen', 'wall', 'simulation', 'reversed-clock', 'missing-clock']) {
    const h = ashaDependencyHostV163(); h.run(dependencySource, ashaQaConfigV163);
    let result = null;
    h.sandbox.__ATF_ASHA_JUN_DEPENDENCY_V163__.then(value => { result = value; });
    await h.frame(0);
    for (let step = 1; !result && step <= 362; step++) {
      // Animation, elapsed time and unrelated passengers cannot count as
      // physical progress by the exact Jun owner.
      h.dependency.actor.time += 1; h.dependency.actor.animationTime = step;
      h.hub.npcInterdeckStateV165.routes['maksim-cockpit'] = { actor: { x: step * 27, time: step } };
      if (mode !== 'frozen') h.dependency.actor.x -= 1;
      if (mode === 'missing-clock') h.hub.animationTime = NaN;
      await h.frame(mode === 'wall' ? 30000 : 1000,
        mode === 'wall' ? 10 : mode === 'reversed-clock' ? -1 : 1);
    }
    const reason = { frozen: 'jun-no-physical-progress', wall: 'jun-wall-budget-exhausted',
      simulation: 'jun-simulation-budget-exhausted', 'reversed-clock': 'native-simulation-clock-reversed',
      'missing-clock': 'native-simulation-clock-missing' }[mode];
    assert.equal(result?.status, 'failed', mode); assert.equal(result.reason, reason, mode);
    assert.equal(h.rafs.size, 0, mode); assert.equal(h.timers.size, 0, mode);
  }

  const occupationSource = serviceQaCallbackV163('wait_occupied_return');
  for (const mode of ['frozen', 'wall', 'simulation', 'priority', 'wrong-crossing']) {
    const sample = ashaBlockedServiceV163(), h = serviceObserverHostV163(sample);
    let result = null; h.run(occupationSource, ashaQaConfigV163).then(value => { result = value; });
    await h.frame(0);
    for (let step = 1; !result && step <= 52; step++) {
      sample.actor.time += 1;
      if (mode !== 'frozen') sample.actor.x -= 1;
      if (mode === 'priority') sample.actor.reason = 'medical-recovery';
      if (mode === 'wrong-crossing') sample.actor.crossings = 2;
      await h.frame(mode === 'wall' ? 30000 : 1000);
    }
    const reason = { frozen: 'no-physical-return-progress', wall: 'wall-return-budget-exhausted',
      simulation: 'simulated-return-budget-exhausted', priority: 'native-priority-interrupted-return',
      'wrong-crossing': 'unexpected-portal-handoff-before-occupation' }[mode];
    assert.equal(result?.status, 'failed', mode); assert.equal(result.reason, reason, mode);
    assert.equal(h.rafs.size, 0, mode); assert.equal(h.timers.size, 0, mode);
  }

  const collectionSource = serviceQaCallbackV163('collect');
  for (const mode of ['frozen', 'wall', 'simulation', 'completed']) {
    const sample = ashaBlockedServiceV163(), h = serviceObserverHostV163(sample);
    h.run(collectionSource, { ...ashaQaConfigV163, name: mode, stop: 'handoff' });
    let result = null, failure = null;
    h.sandbox.__ATF_V163_COLLECTION__.then(value => { result = value; }, error => { failure = error; });
    await h.frame(0);
    if (mode === 'frozen') await h.frame(45001);
    else if (mode === 'wall') {
      for (let step = 0; step < 16; step++) {
        sample.actor.x -= 1; sample.actor.time += 1; await h.frame(30000);
      }
      await h.frame(1001);
    } else {
      if (mode === 'completed') sample.nativeHandoff = { fromRoomId: ashaQaConfigV163.parent };
      else sample.actor.time += 151;
      await h.frame(1000);
    }
    if (mode === 'completed') { assert.ok(result?.rows.length >= 2); assert.equal(failure, null); }
    else assert.match(failure?.message || '', mode === 'simulation' ? /simulation guard/ : /wall\/progress guard/);
    assert.equal(h.rafs.size, 0, mode); assert.equal(h.timers.size, 0, mode);
  }
});

function prerequisiteControlBudgetV163(cases) {
  const directory = mkdtempSync(join(tmpdir(), 'asha-prerequisite-control-'));
  const input = join(directory, 'input.json'), output = join(directory, 'output.json');
  writeFileSync(input, JSON.stringify({ cases, output,
    qa: process.env.ATF_QA_ANNEX_SERVICE_SOURCE || new URL('qa-npc-annex-service-routes-v163.py', import.meta.url).pathname,
    config: ashaQaConfigV163 }));
  const python = String.raw`import ast, json, sys
from pathlib import Path
from types import SimpleNamespace
spec = json.loads(Path(sys.argv[1]).read_text())
tree = ast.parse(Path(spec['qa']).read_text())
function = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'pass_asha_dependency_door')
module = ast.fix_missing_locations(ast.Module(body=[function], type_ignores=[]))
class Page:
    # This is an adversarial clock/control receipt fixture, not a gameplay
    # model. The JavaScript gate and native projection are checked separately.
    def __init__(self, case):
        self.case = case; self.elapsed = 0; self.waits = []; self.presses = []; self.focused = False
        self.projection = {'arrival': {'x': 125 if case['entering'] else 1190, 'y': 532}}
        self.keyboard = SimpleNamespace(press=self.press)
    def locator(self, selector):
        assert selector == '#hub-canvas'
        return SimpleNamespace(focus=lambda: setattr(self, 'focused', True))
    def press(self, key):
        assert self.focused and key == 'KeyE'
        self.presses.append(key); self.elapsed += self.case.get('pressMs', 0) / 1000
    def wait_for_function(self, expression, arg=None, timeout=30000):
        self.waits.append(timeout)
        duration = self.case.get('readyMs', 0) if len(self.waits) == 1 else self.case.get('completeMs', 1100)
        self.elapsed += min(duration, timeout) / 1000
        if duration > timeout: raise TimeoutError('bounded native passage wait')
        return SimpleNamespace(json_value=lambda: self.projection)
    def observed(self):
        return {'player': {'x': self.projection['arrival']['x'] + self.case.get('arrivalError', 0), 'y': 532},
                'annex': spec['config']['annex'] if self.case['entering'] else None,
                'inputGuards': {'playerAlive': True}}
def check(label, condition):
    assert condition, label
rows = []
for case in spec['cases']:
    page = Page(case); report = {}
    namespace = {'time': SimpleNamespace(monotonic=lambda: page.elapsed), 'report': report, 'check': check,
                 'observed': lambda page, config: page.observed()}
    exec(compile(module, '<actual-asha-prerequisite-control>', 'exec'), namespace)
    error = None
    try: namespace['pass_asha_dependency_door'](page, spec['config'], case['entering'])
    except (AssertionError, TimeoutError) as failure: error = str(failure)
    rows.append({'case': case, 'error': error, 'elapsed': page.elapsed, 'waits': page.waits,
                 'presses': page.presses, 'passages': report.get('ashaDependencyPassages', [])})
Path(spec['output']).write_text(json.dumps(rows))
`;
  try {
    execFileSync('python3', ['-c', python, input], { stdio: 'inherit', timeout: 30000 });
    return JSON.parse(readFileSync(output, 'utf8'));
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('annex-service QA keeps native prerequisite gates, projected offsets and one45s budget for readiness plus E', () => {
  const readySource = serviceQaCallbackV163('pass_asha_dependency_door', 'wait_for_function', 0);
  const completeSource = serviceQaCallbackV163('pass_asha_dependency_door', 'wait_for_function', 1);
  for (const entering of [true, false]) {
    const opts = { config: ashaQaConfigV163, entering }, annex = { id: ashaQaConfigV163.annex };
    const door = { annex, annexId: annex.id, endpointId: 'native-refuge-leaf' };
    const projection = { arrival: { x: entering ? 125 : 1190, y: 532 } };
    const create = () => {
      const h = serviceObserverHostV163(ashaBlockedServiceV163()); h.preparations = [];
      h.hub.currentAnnexV71 = () => entering ? null : annex;
      h.hub.nearestParentAnnexDoorV71 = h.hub.nearestAnnexExitV71 = () => door;
      h.hub.npcAnnexDoorReservedV159 = () => false;
      h.hub.prepareHubDoorPassageV142 = (...args) => { h.preparations.push(args); return projection; };
      return h;
    };
    const valid = create(); assert.equal(valid.run(readySource, opts), projection);
    assert.deepEqual(valid.preparations, [[annex, entering ? 'enter' : 'exit', door.endpointId]]);
    for (const alter of [
      h => { h.hub.running = false; }, h => { h.hub.player.alive = false; }, h => { h.hub.player.vx = 1; },
      h => { h.hub.annexTransitionV71 = {}; }, h => { h.hub.hubDoorClosingV142 = {}; },
      h => { h.hub.annexStateReadOnlyV87 = true; }, h => { h.hub.npcAnnexDoorReservedV159 = () => true; },
      h => { h.hub.nearestParentAnnexDoorV71 = h.hub.nearestAnnexExitV71 = () => ({ ...door, annexId: 'foreign' }); }
    ]) {
      const blocked = create(); alter(blocked); assert.equal(blocked.run(readySource, opts), false);
      assert.equal(blocked.preparations.length, 0);
    }
    const obstructed = create(); obstructed.hub.prepareHubDoorPassageV142 = () => null;
    assert.equal(obstructed.run(readySource, opts), false, 'A blocked native arrival is not a usable E passage.');
    const completion = create(); assert.equal(Boolean(completion.run(completeSource, opts)), false);
    completion.hub.currentAnnexV71 = () => entering ? annex : null;
    assert.equal(completion.run(completeSource, opts), true);
    completion.hub.hubDoorClosingV142 = {}; assert.equal(completion.run(completeSource, opts), false);
  }
  const results = prerequisiteControlBudgetV163([
    { entering: true, readyMs: 43000, pressMs: 50, completeMs: 1100 },
    { entering: false, readyMs: 43000, pressMs: 50, completeMs: 1100 },
    { entering: false, readyMs: 45001 },
    { entering: false, readyMs: 44000, completeMs: 1100 },
    { entering: true, readyMs: 44900, pressMs: 150 },
    { entering: true, arrivalError: .4 }
  ]);
  for (const result of results.slice(0, 2)) {
    assert.equal(result.error, null); assert.ok(result.elapsed < 45);
    assert.deepEqual(result.presses, ['KeyE']); assert.equal(result.waits[0], 45000);
    assert.ok(Math.abs(result.waits[1] - 1950) < 1e-6);
    assert.equal(result.passages[0].player.x, result.case.entering ? 125 : 1190);
  }
  assert.equal(results[2].elapsed, 45); assert.deepEqual(results[2].presses, []);
  assert.equal(results[3].elapsed, 45); assert.deepEqual(results[3].presses, ['KeyE']);
  assert.equal(results[3].waits[1], 1000, 'The E completion cannot start a new45s wait.');
  assert.match(results[4].error, /exceeded45s before completion/); assert.equal(results[4].waits.length, 1);
  assert.match(results[5].error, /keeps the real projected arrival/);
  for (const result of results.slice(2)) { assert.ok(result.error); assert.equal(result.passages.length, 0); }
});
