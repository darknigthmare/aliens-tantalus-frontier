import assert from 'node:assert/strict';
import { test } from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { HubGame as RosterHub } from '../src/hub-v52-runtime.js';
import { HubGame as RoutineHub, getNpcRoutineStandingAnchorV158 } from '../src/hub-v62-runtime.js';
import { HubGame as AnnexHub } from '../src/hub-v71-runtime.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { resolveNpcRoutineV62 } from '../src/npc-dialogue-v62.js';
import { withHubNpcLifeV136, spreadNpcStationSpawnsV136 } from '../src/npc-life-v136.js';
import { withHubNpcCirculationV158 } from '../src/npc-circulation-v158.js';
import { withHubNpcAnnexCirculationV159 } from '../src/npc-annex-circulation-v159.js';
import { createAnnexNpcsV141 } from '../src/hub-annex-npc-life-v141.js';
import { HUB_ANNEX_BY_ID_V137 } from '../src/hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from '../src/hub-annex-runtime-geometry-v139.js';
import { getHubRoomPresentationV119 } from '../src/hub-room-presentation-v119.js';
import { resolveHumanAtlasGeometryV133 } from '../src/human-visual-contract-v133.js';
import { resolveSpriteSheet } from '../src/sprite-animation-runtime.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { getHubLiveDestinationSignPlansV161 } from '../src/hub-destination-signage-runtime-v138.js';
import { HUB_NPC_SERVICE_ROUTES_V161, HUB_NPC_SERVICE_ROUTE_DEFINITIONS_V161, normalizeNpcServiceRoutesV161,
  withHubNpcServiceRoutesV161 } from '../src/npc-service-routes-v161.js';

const config = route => HUB_NPC_SERVICE_ROUTE_DEFINITIONS_V161.find(d => d.id === route.definition.id);
const routine = (route, hour, extra = {}) => resolveNpcRoutineV62(route.definition.crewId, { clock: { day: 1, hour }, ...extra });
const dutyActor = route => createAnnexNpcsV141([{ ...config(route), roomId: route.definition.annexRoomId }],
  new Map([[route.definition.crewId, routine(route, route.definition.deck === 3 ? 8 : 17)]]))[0];
const parent = route => HUB_DECKS[route.definition.deck].rooms.find(r => r.id === route.definition.parentRoomId);
const actor = (route, extra = {}) => {
  const c = route.definition;
  return { ...spreadNpcStationSpawnsV136([{ ...RosterHub.prototype.createNpcs.call({}, c.deck).find(n => n.crewId === c.crewId),
    mobile: false, x: getNpcRoutineStandingAnchorV158(c.crewId, c.parentRoomId, 'station') }], [parent(route)])[0], vx: 0, ...extra };
};
function simulate(route, a, seconds, { state = route.create(a, dutyActor(route)), duty = true, rate = 60,
  resolution = routine(route, route.definition.deck === 3 ? 8 : 17), ...options } = {}) {
  const frames = [];
  for (let i = 0; i < seconds * rate; i++) {
    const before = { ...state };
    state = route.advance(state, a, 1 / rate, { resolution, duty, ...options });
    if (state.roomId === before.roomId) assert.ok(Math.abs(state.x - before.x) <= 27 / rate + 1e-7);
    else {
      assert.equal(before.stage, 'covering'); assert.equal(state.stage, 'revealing'); assert.equal(state.doorProgress, 0);
      assert.equal(state.distance, before.distance); assert.equal(state.actualVelocity, 0);
    }
    Object.assign(a, { x: state.x, y: state.y, roomId: state.roomId, facing: state.facing, vx: state.actualVelocity });
    assert.equal(a.y + a.h, 624); frames.push({ ...state });
  }
  return { a, state, frames };
}

for (const route of HUB_NPC_SERVICE_ROUTES_V161) {
  const c = route.definition;
  test(`${c.id}: exact native rig, supported paired sockets, whole-room projection and service post`, () => {
    const a = actor(route), d = dutyActor(route), s = route.create(a, d); assert.ok(s);
    assert.equal(a.spriteId, d.spriteId); assert.equal(a.w, 44); assert.equal(a.h, 92);
    const snap = simulate(route, a, 70), covering = snap.frames.find(f => f.stage === 'covering');
    const passage = route.passage({ ...a, ...covering }, c.annexRoomId); assert.ok(passage);
    assert.equal(passage.offsetX, 0); assert.equal(passage.arrival.y, 532);
    const reverse = route.passage({ ...a, ...passage.arrival, roomId: c.annexRoomId }, c.parentRoomId);
    assert.equal(reverse.arrival.x, covering.x);
    for (const room of [parent(route), getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[c.annexRoomId])]) {
      const p = getHubRoomPresentationV119(room); assert.equal(p.presentationMode, '2d');
      assert.equal(p.projectionV139.mixedProjectionAllowed, false);
    }
    assert.equal(snap.state.stage, 'service'); assert.ok(Math.abs(snap.a.x - d.x) < .25);
  });

  test(`${c.id}: complete outbound/return spend only real distance and preserve intact feet and atlas leaf occlusion`, () => {
    const out = simulate(route, actor(route), 70); assert.equal(out.state.crossings, 1); assert.equal(out.state.arrivals, 1);
    for (const stage of ['opening', 'covering', 'revealing', 'service']) assert.ok(out.frames.some(f => f.stage === stage));
    const back = simulate(route, out.a, 70, { state: out.state, duty: false });
    assert.equal(back.state.roomId, c.parentRoomId); assert.equal(back.state.stage, 'service');
    assert.equal(back.state.crossings, 2); assert.equal(back.state.arrivals, 2);
    assert.ok(Math.abs(back.state.distance - out.state.distance * 2) < .02);
    const covered = out.frames.find(f => f.stage === 'covering'), sheet = resolveSpriteSheet(out.a.spriteId);
    for (const progress of [1, .5, 0]) {
      const clip = route.occlusion({ ...covered, doorProgress: progress });
      assert.equal(clip.w === 0, progress === 0); assert.ok(clip.y + clip.h >= 624);
      for (const facing of [-1, 1]) for (let frame = 0; frame < 12; frame++) {
        const g = resolveHumanAtlasGeometryV133({ actor: { ...out.a, ...covered, facing }, sheet,
          column: frame % 4, row: Math.floor(frame / 4), surface: 'hub' });
        assert.equal(g.pivot.y, 624); assert.ok(Math.abs(g.visible.y + g.visible.height - 624) < 1e-9);
        if (progress === 1) assert.ok(g.visible.x >= clip.x && g.visible.x + g.visible.width <= clip.x + clip.w);
      }
    }
  });

  test(`${c.id}: every native door phase resumes, while wrong identities/rooms/support/post/velocity are rejected`, () => {
    const out = simulate(route, actor(route), 70);
    for (const stage of ['walking', 'opening', 'covering', 'revealing', 'service']) {
      const s = out.frames.find(f => f.stage === stage), restored = route.normalize({ schema: 161, actor: s }).actor;
      assert.ok(restored, stage); for (const key of ['x', 'y', 'roomId', 'stage', 'doorProgress', 'distance']) assert.equal(restored[key], s[key]);
      const end = simulate(route, actor(route, { ...restored }), 70, { state: restored }); assert.equal(end.state.crossings, 1);
    }
    const s = out.frames[0];
    for (const patch of [{ crewId: 'crew-05-bishop-9' }, { roomId: 'quarantine' }, { deck: 0 }, { y: 530 },
      { dutyX: 8000 }, { homeX: 0 }, { x: -2 }, { doorProgress: 2 }, { velocity: 100 }, { stage: 'teleport' }])
      assert.equal(route.normalize({ schema: 161, actor: { ...s, ...patch } }).actor, null);
  });

  test(`${c.id}: pause, interaction, occupied door, physical peers and crisis withdraw without extra crossings`, () => {
    const start = simulate(route, actor(route), 1);
    assert.equal(route.advance(start.state, start.a, 1 / 60, { resolution: routine(route, 8), duty: true, running: false }), start.state);
    const interaction = simulate(route, { ...start.a, workClock: 2 }, 2, { state: start.state }); assert.equal(interaction.a.x, start.a.x);
    const out = simulate(route, actor(route), 70), atDoor = out.frames.find(f => f.stage === 'covering');
    const a = actor(route, { ...atDoor }), passage = route.passage(a, c.annexRoomId);
    const player = { ...passage.arrival, roomId: c.annexRoomId, w: 44, h: 92, alive: true };
    const held = simulate(route, a, 1, { state: atDoor, player }); assert.equal(held.state.roomId, c.parentRoomId);
    assert.equal(held.state.x, atDoor.x); assert.equal(held.state.doorProgress, atDoor.doorProgress); assert.equal(held.state.reason, 'occupied');
    const withdrawn = simulate(route, a, 70, { state: held.state,
      resolution: routine(route, 8, { crisis: { id: 'actual', active: true } }) });
    assert.equal(withdrawn.state.roomId, c.parentRoomId); assert.equal(withdrawn.state.crossings, 0);
    assert.equal(withdrawn.state.doorProgress, 0); assert.ok(withdrawn.a.x > atDoor.x + 27);
    assert.equal(withdrawn.state.reason, 'active-crisis');
    const peer = { x: start.a.x - 90, y: 532, w: 44, h: 92, roomId: c.parentRoomId, crewId: 'physical-peer', alive: true };
    const waiting = simulate(route, { ...start.a }, 3, { state: start.state, peers: [peer] });
    assert.ok(waiting.a.x >= peer.x + peer.w + 12 - 1e-5); assert.equal(waiting.state.crossings, 0);
  });
}

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
  npcAnimationRequest(...args) { return LifeHub.prototype.npcAnimationRequest.apply(this, args); }
  hubDoorPairV142(...args) { return AnnexHub.prototype.hubDoorPairV142.apply(this, args); }
  sampleNpcAnimation() {}
  drawNpcLifeV136() { return false; }
  drawDepthContactShadowV116() { return true; }
  setNpcCrisisAlert() {}
  currentAnnexV71() { return this.local ? getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[this.local]) : null; }
  isAnnexActiveV71() { return Boolean(this.local); }
  start(save = {}, { routineContextV62 = { clock: { day: 1, hour: 5 } } } = {}) {
    this.state = { deck: save.deck ?? 3, roomId: save.roomId || 'reactor' };
    this.player = { x: this.state.deck === 3 ? 2400 : 2350, y: 532, w: 44, h: 92, alive: true };
    this.initializeNpcRoutinesV62(save, routineContextV62);
    this.doorStates = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, this.state.deck).map(d => ({ ...d }));
    this.npcs = this.createNpcs(this.state.deck); this.obstacles = buildHubObstacleGeometryV87(this.state.deck); this.running = true;
    this.persisted = []; this.onPersist = patch => this.persisted.push(patch);
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
const TestHub = withHubNpcServiceRoutesV161(withHubNpcAnnexCirculationV159(withHubNpcCirculationV158(FixtureBase)));
function runtime(hour = 5, save = {}) { const h = new TestHub(); h.start(save, { routineContextV62: { clock: { day: 1, hour } } }); return h; }
function tick(h, seconds) { for (let i = 0; i < seconds * 60; i++) h.update(1 / 60); }
function context(h, hour, extra = {}) { return h.setNpcRoutineContextV62({ clock: { day: 1, hour }, ...extra }, { persist: false }); }
const snapshot = (h, id) => h.getSnapshot().npcServiceRoutesV161.routes[id];

for (const route of HUB_NPC_SERVICE_ROUTES_V161) {
  const c = route.definition, hour = c.deck === 3 ? 8 : 17;
  test(`${c.id}: true owner survives native routine rebuild, hidden deck, conversation clocks, reload and return handoff`, () => {
    const h = runtime(5, { deck: c.deck, roomId: c.parentRoomId }), a = h.getNpcServiceActorV161(c.id); assert.ok(a); assert.equal(a.roomId, c.parentRoomId);
    context(h, hour); tick(h, 4); const x = a.x;
    context(h, hour + .25); assert.equal(h.getNpcServiceActorV161(c.id), a); assert.equal(a.x, x);
    h.state.deck = 0; h.npcs = h.createNpcs(0); tick(h, 66);
    assert.equal(a.roomId, c.annexRoomId); assert.equal(snapshot(h, c.id).actor.stage, 'service');
    assert.equal(h.ensureAnnexNpcCohortV141().filter(n => n.crewId === c.crewId).length, 1);
    a.workClock = 2.4; h.local = c.annexRoomId; tick(h, 1); assert.ok(Math.abs(a.workClock - 1.4) < 1e-6);
    h.running = false; const frozen = snapshot(h, c.id); tick(h, 1); assert.deepEqual(snapshot(h, c.id), frozen);
    h.persist(); const patch = h.persisted.at(-1); const restored = runtime(hour, { ...patch, deck: c.deck });
    assert.deepEqual(snapshot(restored, c.id).actor, snapshot(h, c.id).actor);
    h.running = true; h.local = null; context(h, c.deck === 3 ? 12 : 19); tick(h, 70);
    const final = snapshot(h, c.id); assert.equal(final.actor, null); assert.equal(final.nativeHandoff.fromRoomId, c.parentRoomId);
    assert.equal(final.nativeHandoff.observedTravel, false);
  });
  test(`${c.id}: actual V71 player gate uses the shared reservation while BISHOP and other door owners remain independent`, () => {
    const h = runtime(5, { deck: c.deck }); context(h, hour);
    for (let i = 0; i < 3000 && !snapshot(h, c.id).reserved; i++) h.update(1 / 60);
    assert.equal(snapshot(h, c.id).reserved, true);
    assert.equal(AnnexHub.prototype.beginAnnexTransitionV71.call(h, c.annexRoomId, 'enter'), null);
    assert.equal(h.hubDoorBlockedV142.annexId, c.annexRoomId);
    const pair = h.hubDoorPairV142(getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[c.annexRoomId]));
    assert.deepEqual(pair.parent.opening, snapshot(h, c.id).sourceFace.opening);
    assert.deepEqual(pair.local.opening, snapshot(h, c.id).annexFace.opening);
    assert.equal(pair.parent.opening.w, pair.local.opening.w);
    assert.equal(pair.parent.target.w, snapshot(h, c.id).sourceFace.target.w);
    const native = AnnexHub.prototype.hubDoorPairV142.call(h, getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[c.annexRoomId]));
    for (const face of ['parent', 'local']) {
      const f = pair[face], original = native[face], scale = f.target.w / original.target.w;
      assert.ok(Math.abs(f.target.h / original.target.h - scale) < 1e-9, 'Scale the whole native frame uniformly.');
      assert.ok(Math.abs(f.opening.w / original.opening.w - scale) < 1e-9, 'Preserve the painted aperture inset.');
      assert.ok(f.target.w <= f.socket.w && f.target.h <= f.socket.h);
      assert.equal(f.target.y + f.target.h, 624); assert.deepEqual(f.source, original.source);
    }
    assert.equal(pair.parent.target.w, pair.local.target.w); assert.equal(pair.parent.target.h, pair.local.target.h);
    if (c.id === 'leila-galley') { assert.equal(pair.parent.opening.w, 71); assert.ok(pair.parent.target.h > native.parent.target.h); }
    else assert.deepEqual(pair.parent, native.parent);
    assert.equal(h.npcAnnexDoorReservedV159('synthetic-bay'), false);
    for (const room of [parent(route), { ...getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[c.annexRoomId]), xStart: 0 }]) {
      const plaque = getHubLiveDestinationSignPlansV161(h, room).find(sign => sign.connectionId === c.connectionId);
      assert.ok(plaque); const face = room.id === c.parentRoomId ? pair.parent : pair.local;
      assert.deepEqual(plaque.portalTarget, face.target);
      assert.ok(Math.abs(plaque.bounds.y + plaque.bounds.h + 10 - face.target.y) < 1e-9);
    }
    const other = snapshot(h, c.id === 'idris-engine' ? 'leila-galley' : 'idris-engine');
    assert.notEqual(other.actor?.crewId, c.crewId); assert.notEqual(other.actor, snapshot(h, c.id).actor);
  });
}

test('save normalization preserves both independent route states and existing V158/V159 fields without sharing references', () => {
  const h = runtime(5); context(h, 8); tick(h, 8); h.persist(); const patch = h.persisted.at(-1);
  const save = createDefaultSave(); save.hub = { ...save.hub, ...patch };
  const migrated = migrateSave(save); assert.deepEqual(migrated.hub.npcServiceRoutesV161, normalizeNpcServiceRoutesV161(patch.npcServiceRoutesV161));
  assert.deepEqual(migrated.hub.npcAnnexCirculationV159, patch.npcAnnexCirculationV159);
  assert.deepEqual(migrated.hub.npcCirculationV158, patch.npcCirculationV158);
  assert.equal(normalizeNpcServiceRoutesV161({ schema: 999, routes: patch.npcServiceRoutesV161.routes }).routes['idris-engine'].actor, null);
  const cloned = normalizeNpcServiceRoutesV161(patch.npcServiceRoutesV161); cloned.routes['idris-engine'].actor.x = 0;
  assert.notEqual(h.getNpcServiceActorV161('idris-engine').x, 0);
});

test('Forge/editor sessions admit no service singleton, route save or door reservation', () => {
  for (const options of [{ editorProject: {} }, { forgeJourneyV141: true }]) {
    const h = new TestHub(); h.start({}, { ...options, routineContextV62: { clock: { day: 1, hour: 8 } } }); tick(h, 2);
    for (const route of HUB_NPC_SERVICE_ROUTES_V161) {
      assert.equal(h.getNpcServiceActorV161(route.definition.id), null);
      assert.equal(snapshot(h, route.definition.id).actor, null);
      assert.equal(h.npcAnnexDoorReservedV159(route.definition.annexRoomId), false);
    }
  }
});

test('inner native handoffs publish through every composed owner instead of replacing visible Leila with a timetable template', () => {
  for (const owner of ['idris-engine', 'bishop']) for (const reason of ['medical', 'mission', 'unavailable']) {
    const h = runtime(5, { deck: 1, roomId: 'mess' });
    const leila = h.getNpcServiceActorV161('leila-galley');
    const idris = h.getNpcServiceActorV161('idris-engine'), bishop = h.npcAnnexActorV159;
    const departing = owner === 'bishop' ? bishop : idris, id = departing.crewId;
    assert.equal(h.npcs.find(n => n.crewId === leila.crewId), leila);
    assert.ok(bishop && idris && leila);
    const states = structuredClone(h.getSnapshot().npcServiceRoutesV161);
    if (reason === 'unavailable') departing.downed = true;
    else h.setNpcRoutineContextV62({ clock: { day: 1, hour: 5 },
      ...(reason === 'medical' ? { crew: [{ id, health: 20, injuries: [] }] } : { operation: { crewIds: [id] } }) },
    { persist: false, rebuild: false });
    // Exercise UPDATE's publication, not the routine setter's separate,
    // already virtual rebuild path. The active Leila body must survive it.
    h.update(1 / 60);
    assert.equal(h.getNpcServiceActorV161('leila-galley'), leila);
    assert.equal(h.npcs.filter(n => n.crewId === leila.crewId).length, 1);
    assert.equal(h.npcs.find(n => n.crewId === leila.crewId), leila, `${owner}/${reason}: preserve the real visible Leila reference`);
    assert.equal(leila.x, states.routes['leila-galley'].actor.x);
    const released = owner === 'bishop' ? h.npcAnnexActorV159 : h.getNpcServiceActorV161('idris-engine');
    const releasedState = owner === 'bishop' ? h.getSnapshot().npcAnnexCirculationV159 : snapshot(h, 'idris-engine');
    assert.equal(released, null, `${owner}/${reason}: the virtual rebuild must not re-admit the just released body`);
    assert.equal(releasedState.nativeHandoff.observedTravel, false);
    const retained = owner === 'bishop' ? idris : bishop;
    assert.equal(owner === 'bishop' ? h.getNpcServiceActorV161('idris-engine') : h.npcAnnexActorV159, retained);
    assert.equal(h.npcs.filter(n => n.crewId === retained.crewId).length, retained.roomId === 'science-lab' ? 1 : 0);
    if (retained.roomId === 'science-lab') assert.equal(h.npcs.find(n => n.crewId === retained.crewId), retained);
    assert.equal(h.npcAnnexDoorReservedV159(owner === 'bishop' ? 'synthetic-bay' : 'engine-room'), false);
  }
});

test('an inner handoff cannot create a parent duplicate while the real Leila is physically in her annex', () => {
  for (const owner of ['idris-engine', 'bishop']) for (const reason of ['medical', 'mission', 'unavailable']) {
    const h = runtime(5, { deck: 1, roomId: 'mess' }); context(h, 17); tick(h, 70);
    const leila = h.getNpcServiceActorV161('leila-galley'); assert.equal(leila.roomId, 'galley-service');
    // The next native day restores BISHOP's laboratory station, but elapsed
    // strategy hours never manufacture a walk home for the owned annex body.
    h.setNpcRoutineContextV62({ clock: { day: 2, hour: 5 } }, { persist: false, rebuild: true });
    h.local = 'galley-service';
    const departing = owner === 'bishop' ? h.npcAnnexActorV159 : h.getNpcServiceActorV161('idris-engine');
    const retained = owner === 'bishop' ? h.getNpcServiceActorV161('idris-engine') : h.npcAnnexActorV159;
    assert.ok(departing && retained); const id = departing.crewId, x = leila.x;
    if (reason === 'unavailable') departing.alive = false;
    else h.setNpcRoutineContextV62({ clock: { day: 2, hour: 5 },
      ...(reason === 'medical' ? { crew: [{ id, health: 20, injuries: [] }] } : { operation: { crewIds: [id] } }) },
    { persist: false, rebuild: false });
    h.update(1 / 60);
    assert.equal(h.getNpcServiceActorV161('leila-galley'), leila);
    const cohort = h.activeAnnexNpcsV141().filter(n => n.crewId === leila.crewId);
    assert.equal(cohort.length, 1); assert.equal(cohort[0], leila);
    assert.equal(h.npcs.filter(n => n.crewId === leila.crewId).length, 0, `${owner}/${reason}: no sampled parent duplicate`);
    assert.ok(Math.abs(leila.x - x) <= 27 / 60 + 1e-7);
    assert.equal(owner === 'bishop' ? h.getNpcServiceActorV161('idris-engine') : h.npcAnnexActorV159, retained);
    assert.equal(owner === 'bishop' ? h.npcAnnexActorV159 : h.getNpcServiceActorV161('idris-engine'), null);
  }
});

test('native context factories do not immediately re-admit a lifecycle handoff or replace other route owners', () => {
  for (const owner of ['idris-engine', 'bishop', 'leila-galley']) for (const flag of ['downed', 'alive']) {
    const h = runtime(5, { deck: 1, roomId: 'mess' });
    const bodies = { bishop: h.npcAnnexActorV159, 'idris-engine': h.getNpcServiceActorV161('idris-engine'),
      'leila-galley': h.getNpcServiceActorV161('leila-galley') };
    bodies[owner][flag] = flag === 'downed';
    h.setNpcRoutineContextV62({ clock: { day: 1, hour: 5 } }, { persist: false, rebuild: true });
    for (const [id, body] of Object.entries(bodies)) {
      const current = id === 'bishop' ? h.npcAnnexActorV159 : h.getNpcServiceActorV161(id);
      if (id === owner) assert.equal(current, null, `${id}/${flag}: factory must retain its explicit lifecycle handoff`);
      else {
        assert.equal(current, body); const visible = h.npcs.filter(n => n.crewId === body.crewId);
        assert.equal(visible.length, body.roomId === 'reactor' ? 0 : 1);
        if (visible.length) assert.equal(visible[0], body);
      }
    }
  }
});

// The production Python controls run against the real V88 player/door owner
// and V136 parent-deck walking. DOM/images/RAF are host doubles; the disclosed
// fixture gives one native crew body a short patrol across the return aperture.
// No actor is moved or removed by the driver after fixture initialization.
async function nativeExitQaDriverV161(root) {
  const assert = (await import('node:assert/strict')).default;
  const { HubGame } = await import(new URL('src/hub-opening-v88.js', root));
  const { withHubNpcLifeV136 } = await import(new URL('src/npc-life-v136.js', root));
  const { createDefaultSave } = await import(new URL('src/save.js', root));
  const { hostV136 } = await import(new URL('scripts/forge-native-host-v136.mjs', root));
  const { createInterface } = await import('node:readline');
  const options = JSON.parse(process.argv[2]), host = hostV136(), events = [], attempts = [];
  document.createElement = () => ({ ...host.canvas, style: {}, getContext: () => host.canvas.getContext('2d') });
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.clock.hour = 5;
  Object.assign(save.hub, { deck: 3, roomId: 'reactor', positionX: 1678, positionY: 532 });
  const NativeDoorHub = withHubNpcLifeV136(HubGame);
  const hub = new NativeDoorHub(host.canvas, { audio: { ui() {}, unlock() {} }, onPersist() {}, onStatus() {},
    onAction: event => events.push(structuredClone(event)) });
  hub.start(save.hub, { routineContextV62: { clock: save.clock, save }, onboardingV84: save.onboardingV84 });
  globalThis.__ATF_HUB__ = hub;
  const rate = options.rate || 60; let elapsed = 0, blocker = null, maxBlockerSpeed = 0;
  const advance = ms => {
    for (let left = ms / 1000; left > 1e-9;) {
      const dt = Math.min(1 / rate, left), before = blocker?.x;
      if (hub.running) hub.update(dt);
      if (blocker) {
        assert.equal(hub.npcs.find(npc => npc.crewId === blocker.crewId), blocker);
        assert.equal(blocker.y + blocker.h, 624);
        const speed = Math.abs(blocker.x - before) / dt;
        assert.ok(speed <= 27 + 1e-6); maxBlockerSpeed = Math.max(maxBlockerSpeed, speed);
      }
      elapsed += dt; left -= dt;
    }
  };
  const until = (predicate, timeout) => {
    const deadline = elapsed + timeout / 1000;
    while (!predicate()) {
      if (elapsed >= deadline - 1e-9) throw new Error('Native wait timed out');
      advance(Math.min(1000 / rate, (deadline - elapsed) * 1000));
    }
  };
  const passage = () => {
    const annex = hub.currentAnnexV71(), exit = hub.nearestAnnexExitV71();
    return annex && exit && hub.prepareHubDoorPassageV142(annex, 'exit', exit.endpointId);
  };
  const key = (type, code) => {
    if (blocker && type === 'keydown' && code === 'KeyE')
      attempts.push({ elapsed, passageReady: Boolean(passage()), blockerX: blocker.x });
    host.events.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), { code, repeat: false }));
  };
  // Reach the annex through its actual interaction and covered-leaf handoff.
  host.canvas.focus(); key('keydown', 'KeyE'); key('keyup', 'KeyE');
  until(() => hub.currentAnnexV71()?.id === 'engine-room' && !hub.annexTransitionV71 && !hub.hubDoorClosingV142, 45000);
  blocker = hub.npcs.find(npc => npc.crewId === 'crew-08-maksim-orlov'); assert.ok(blocker);
  Object.assign(blocker, { x: 1661.7375, y: 532, min: 1661.7375, max: 1800, roomId: 'reactor',
    mobile: !options.blocked, resumeVx: 27, vx: 0, facing: 1, lifeV136: null,
    workClock: 0, supportClock: 0, alertClock: 0, alerted: false, routinePhaseV62: 'idle' });
  assert.equal(blocker.w, 44); assert.equal(blocker.h, 92); assert.equal(passage(), null);
  elapsed = 0; events.length = 0;
  const snapshot = () => ({ elapsed, player: { x: hub.player.x, y: hub.player.y, w: hub.player.w, h: hub.player.h, vx: hub.player.vx },
    annex: hub.currentAnnexV71()?.id || null, transition: Boolean(hub.annexTransitionV71), heldKeys: [...hub.keys],
    blocker: { crewId: blocker.crewId, x: blocker.x, y: blocker.y, w: blocker.w, h: blocker.h },
    maxBlockerSpeed, attempts, events, passageReady: Boolean(passage()),
    config: { id: 'idris-engine', annex: 'engine-room', annexDoor: 122 } });
  console.log(JSON.stringify(snapshot()));
  for await (const line of createInterface({ input: process.stdin })) {
    const request = JSON.parse(line); let error = null;
    try {
      if (request.type === 'focus') host.canvas.focus();
      else if (request.type === 'wait') advance(request.ms);
      else if (request.type === 'key') {
        key(request.down ? 'keydown' : 'keyup', request.key);
        if (request.press) { advance(request.ms || 0); key('keyup', request.key); }
      } else if (request.type === 'predicate') {
        const predicate = Function('return (' + request.expression + ')')();
        until(() => predicate(request.arg), request.timeout);
      } else if (request.type === 'stop') break;
    } catch (failure) { error = failure.message; }
    console.log(JSON.stringify({ ...snapshot(), error }));
  }
}

function runNativeExitQaV161(cases) {
  const directory = mkdtempSync(join(tmpdir(), 'service-exit-native-qa-'));
  const root = new URL('../', import.meta.url).href, driver = join(directory, 'driver.mjs');
  const input = join(directory, 'input.json'), output = join(directory, 'output.json');
  const qa = process.env.ATF_QA_SERVICE_SOURCE || fileURLToPath(new URL('qa-npc-service-routes-v161.py', import.meta.url));
  writeFileSync(driver, `(${nativeExitQaDriverV161.toString()})(${JSON.stringify(root)});\n`);
  writeFileSync(input, JSON.stringify({ driver, qa, cases, node: process.execPath, output }));
  const python = String.raw`import ast, json, subprocess, sys
from pathlib import Path
from types import SimpleNamespace
spec = json.loads(Path(sys.argv[1]).read_text())
tree = ast.parse(Path(spec['qa']).read_text())
functions = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in ['walk_to', 'leave_annex']]
if not any(n.name == 'leave_annex' for n in functions):
    # A before-source run executes the original inline exit statements, not
    # a separately maintained implementation of the old control sequence.
    candidates = []
    for owner in ast.walk(tree):
        for field, body in ast.iter_fields(owner):
            if not isinstance(body, list): continue
            for index, node in enumerate(body):
                call = node.value if isinstance(node, ast.Expr) else None
                if not isinstance(call, ast.Call) or not isinstance(call.func, ast.Name) or call.func.id != 'walk_to' or len(call.args) != 3: continue
                target = call.args[2]
                if isinstance(target, ast.Subscript) and isinstance(target.value, ast.Name) and target.value.id == 'config' and isinstance(target.slice, ast.Constant) and target.slice.value == 'annexDoor':
                    candidates.append(body[index:index + 3])
    assert len(candidates) == 1 and len(candidates[0]) == 3
    extracted = ast.parse('def leave_annex(page, config): pass').body[0]
    extracted.body = candidates[0]; functions.append(extracted)
module = ast.fix_missing_locations(ast.Module(body=functions, type_ignores=[]))
class Page:
    def __init__(self, case):
        self.proc = subprocess.Popen([spec['node'], spec['driver'], json.dumps(case)],
                                     stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        line = self.proc.stdout.readline()
        if not line: raise RuntimeError(self.proc.stderr.read())
        self.state = json.loads(line)
        self.keyboard = SimpleNamespace(
            press=lambda key, delay=0: self.call(type='key', key=key, down=True, press=True, ms=delay),
            down=lambda key: self.call(type='key', key=key, down=True),
            up=lambda key: self.call(type='key', key=key, down=False))
    def call(self, **request):
        self.proc.stdin.write(json.dumps(request) + '\n'); self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        if not line: raise RuntimeError(self.proc.stderr.read())
        self.state = json.loads(line)
        if self.state.get('error'): raise AssertionError(self.state['error'])
        return self.state
    def locator(self, selector):
        assert selector == '#hub-canvas'
        return SimpleNamespace(focus=lambda: self.call(type='focus'))
    def wait_for_function(self, expression, arg=None, timeout=30000):
        self.call(type='predicate', expression=expression, arg=arg, timeout=timeout)
    def close(self):
        self.proc.stdin.write('{"type":"stop"}\n'); self.proc.stdin.flush()
        self.proc.stdin.close(); self.proc.wait(timeout=5)
        self.proc.stdout.close(); self.proc.stderr.close()
results = []
for case in spec['cases']:
    page = Page(case)
    namespace = {'time': SimpleNamespace(monotonic=lambda: page.state['elapsed']),
                 'observed': lambda page, config: page.call(type='read')}
    exec(compile(module, '<actual-native-service-exit-qa>', 'exec'), namespace)
    error = None
    try: namespace['leave_annex'](page, page.state['config'])
    except AssertionError as failure: error = str(failure)
    results.append({'case': case, **page.state, 'error': error})
    page.close()
Path(spec['output']).write_text(json.dumps(results))
`;
  try {
    execFileSync('python3', ['-c', python, input], { stdio: 'inherit', timeout: 30000 });
    return JSON.parse(readFileSync(output, 'utf8'));
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('native service QA waits for a walking parent occupant before the real player exit', () => {
  const [result] = runNativeExitQaV161([{}]);
  assert.equal(result.error, null, JSON.stringify(result));
  assert.equal(result.annex, null); assert.equal(result.transition, false);
  assert.equal(result.player.y + result.player.h, 624); assert.equal(result.player.x, 1678);
  assert.ok(result.elapsed > 2 && result.elapsed < 45);
  assert.equal(result.attempts.length, 1); assert.equal(result.attempts[0].passageReady, true);
  assert.ok(result.maxBlockerSpeed > 26 && result.maxBlockerSpeed <= 27 + 1e-6);
  assert.deepEqual(result.events.map(event => event.action), ['hub:annex-exit-start', 'hub:annex-exit-complete']);
});

test('native service QA still refuses a stationary return occupant within the same45s budget', () => {
  const [result] = runNativeExitQaV161([{ blocked: true }]);
  assert.match(result.error, /Native wait timed out/);
  assert.equal(result.annex, 'engine-room'); assert.equal(result.transition, false);
  assert.ok(Math.abs(result.elapsed - 45) < 1e-6); assert.equal(result.player.y, 532);
  assert.equal(result.blocker.x, 1661.7375); assert.equal(result.passageReady, false);
  assert.equal(result.events.length, 0); assert.ok(!result.heldKeys.includes('KeyE'));
});

