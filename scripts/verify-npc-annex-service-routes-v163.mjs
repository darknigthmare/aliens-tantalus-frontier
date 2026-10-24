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
