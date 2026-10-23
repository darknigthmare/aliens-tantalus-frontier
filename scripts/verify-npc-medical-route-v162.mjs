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

const id = D.crewId, parent = HUB_DECKS[1].rooms.find(r => r.id === 'medical');
const annex = getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137.morgue);
const resolution = (hour, extra = {}) => resolveNpcRoutineV62(id, { clock: { day: 1, hour }, ...extra });
const resolutions = hour => new Map(NPC_IDENTITIES_V62.map(m => [m.crewId,
  resolveNpcRoutineV62(m.crewId, { clock: { day: 1, hour } })]));
const dutyActor = () => createAnnexNpcsV141([{ ...D, roomId: D.annexRoomId }], new Map([[id, resolution(10.5)]]))[0];
const actor = (extra = {}) => ({ ...spreadNpcStationSpawnsV136([{ ...RosterHub.prototype.createNpcs.call({}, 1).find(n => n.crewId === id),
  x: getNpcRoutineStandingAnchorV158(id, 'medical', 'station'), mobile: false }], [parent])[0], vx: 0, ...extra });
function simulate(a, seconds, { state = route.create(a, dutyActor()), duty = true, rate = 60,
  running = true, ...options } = {}) {
  const frames = [];
  for (let i = 0; i < seconds * rate; i++) {
    const before = { ...state };
    state = route.advance(state, a, 1 / rate, { resolution: resolution(10.5), duty, running, ...options });
    if (state.roomId === before.roomId) assert.ok(Math.abs(state.x - before.x) <= 27 / rate + 1e-7);
    else {
      assert.equal(before.stage, 'covering'); assert.equal(state.stage, 'revealing'); assert.equal(state.doorProgress, 0);
      assert.equal(state.distance, before.distance); assert.equal(state.actualVelocity, 0);
    }
    Object.assign(a, { x: state.x, y: state.y, roomId: state.roomId, facing: state.facing, vx: state.actualVelocity || 0 });
    assert.equal(a.y + a.h, 624); frames.push({ ...state });
  }
  return { a, state, frames };
}

test('the forensic route uses Noor native identity, actual medical/morgue doors, clear native post and complete2D rooms', () => {
  const a = actor(), d = dutyActor(); assert.equal(a.x, 3181); assert.equal(d.x, 977.5);
  assert.equal(a.spriteId, d.spriteId); assert.equal(a.w, 44); assert.equal(a.h, 92);
  assert.equal(route.definition.connectionId, 'morgue'); assert.equal(route.definition.schema, 162);
  const passage = route.passage({ ...a, x: 2878 }, 'morgue'); assert.equal(passage.arrival.x, 1754); assert.equal(passage.arrival.y, 532);
  assert.equal(route.passage({ ...d, x: 1754 }, 'medical').arrival.x, 2878);
  for (const room of [parent, annex]) {
    const p = getHubRoomPresentationV119(room); assert.equal(p.presentationMode, '2d');
    assert.equal(p.projectionV139.mixedProjectionAllowed, false);
  }
  assert.ok(getAnnexNpcPlacementV141('morgue', id).rails.some(r => d.x >= r.min && d.x <= r.max));
});

test('outbound and return walk only measured floor distance, changing charts solely behind opaque native leaves', () => {
  const out = simulate(actor(), 50); assert.equal(out.state.roomId, 'morgue'); assert.equal(out.state.stage, 'service');
  assert.equal(out.state.crossings, 1); assert.equal(out.state.arrivals, 1); assert.ok(Math.abs(out.a.x - 977.5) < .25);
  const back = simulate(out.a, 50, { state: out.state, duty: false });
  assert.equal(back.state.roomId, 'medical'); assert.equal(back.state.stage, 'service'); assert.equal(back.state.crossings, 2);
  assert.equal(back.state.arrivals, 2); assert.ok(Math.abs(back.state.distance - out.state.distance * 2) < .02);
  assert.ok(out.frames.some(s => s.stage === 'opening')); assert.ok(out.frames.some(s => s.stage === 'covering'));
  assert.ok(out.frames.some(s => s.stage === 'revealing')); assert.ok(out.frames.every(s => s.y === 532));
});

test('both actual door frames admit all12 native frames and both facings without clipping arms or changing aspect or floor', () => {
  const out = simulate(actor(), 50), sheet = resolveSpriteSheet(out.a.spriteId);
  for (const roomId of ['medical', 'morgue']) {
    const x = roomId === 'medical' ? 2878 : 1754;
    for (const progress of [1, .5, 0]) {
      const clip = route.occlusion({ roomId, stage: 'covering', doorProgress: progress });
      assert.equal(clip.w === 0, progress === 0); assert.ok(clip.y + clip.h >= 624);
      for (const facing of [-1, 1]) for (let frame = 0; frame < 12; frame++) {
        const g = resolveHumanAtlasGeometryV133({ actor: { ...out.a, x, facing }, sheet,
          column: frame % 4, row: Math.floor(frame / 4), surface: 'hub' });
        assert.ok(Math.abs(g.visible.y + g.visible.height - 624) < 1e-9);
        if (progress === 1) assert.ok(g.visible.x >= clip.x && g.visible.x + g.visible.width <= clip.x + clip.w);
      }
    }
  }
});

test('all native door phases normalize/reload under independent162 schema; foreign identities, posts and forged watch handoffs are rejected', () => {
  const out = simulate(actor(), 50);
  for (const stage of ['walking', 'opening', 'covering', 'revealing', 'service']) {
    const s = out.frames.find(f => f.stage === stage), restored = route.normalize({ schema: 162, actor: s }).actor;
    assert.ok(restored); const end = simulate(actor(restored), 50, { state: restored }); assert.equal(end.state.crossings, 1);
    assert.equal(route.normalize({ schema: 161, actor: s }).actor, null);
  }
  const s = out.frames[0];
  for (const patch of [{ crewId: 'crew-05-bishop-9' }, { roomId: 'animal-care' }, { deck: 0 }, { y: 531 },
    { dutyX: 1700 }, { homeX: 0 }, { doorProgress: 2 }, { velocity: 80 }, { stage: 'teleport' }])
    assert.equal(route.normalize({ schema: 162, actor: { ...s, ...patch } }).actor, null);
  const valid = { crewId: id, fromRoomId: 'medical', toRoomId: 'animal-care', reason: 'annex-assignment',
    observedTravel: false, owner: 'native-v141-annex-watch' };
  assert.deepEqual(route.normalize({ schema: 162, nativeHandoff: valid }).nativeHandoff, valid);
  for (const patch of [{ toRoomId: 'bioforge' }, { owner: 'native-v62-routine' }, { reason: 'daily-schedule' },
    { fromRoomId: 'animal-care' }, { fromRoomId: 'morgue' }, { observedTravel: true }, { crewId: 'other' }])
    assert.equal(route.normalize({ schema: 162, nativeHandoff: { ...valid, ...patch } }).nativeHandoff, null);
  assert.equal(normalizeNpcServiceRoutesV161({ schema: 162, routes: { 'noor-morgue': { schema: 162, actor: s } } }).routes['noor-morgue'], undefined);
});

test('stationary Inez is a physical peer, not a transparent backdrop; her native Bioforge watch releases Noor route', () => {
  const peers = createAnnexNpcsV141(annexNpcDutiesV141(resolutions(8)), resolutions(8)).filter(n => n.crewId !== id);
  const inez = peers.find(n => n.crewId === 'crew-09-inez-harlow' && n.roomId === 'morgue'); assert.ok(inez);
  const held = simulate(actor(), 50, { peers, resolution: resolution(8) });
  assert.equal(held.state.roomId, 'morgue'); assert.equal(held.state.stage, 'walking');
  assert.ok(held.a.x >= inez.x + inez.w + 12 - 1e-5); assert.equal(held.state.arrivals, 0);
  const later = createAnnexNpcsV141(annexNpcDutiesV141(resolutions(10.5)), resolutions(10.5)).filter(n => n.crewId !== id);
  assert.equal(later.find(n => n.crewId === inez.crewId).roomId, 'bioforge');
  const continued = simulate(held.a, 20, { state: held.state, peers: later });
  assert.equal(continued.state.stage, 'service'); assert.equal(continued.state.crossings, 1); assert.equal(continued.state.arrivals, 1);
});

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
  getParentAnnexDoorV71() { return { bounds: { x: 2815, y: 432, w: 170, h: 192 } }; }
  sampleNpcAnimation() {}
  drawNpcLifeV136() { return false; }
  drawDepthContactShadowV116() { return true; }
  setNpcCrisisAlert() {}
  currentAnnexV71() { return this.local ? getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[this.local]) : null; }
  isAnnexActiveV71() { return Boolean(this.local); }
  start(save = {}, { routineContextV62 = { clock: { day: 1, hour: 5.5 } } } = {}) {
    this.state = { deck: save.deck ?? 1, roomId: save.roomId || 'medical' };
    this.player = { x: 2730, y: 532, w: 44, h: 92, alive: true };
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
const TestHub = withHubNpcMedicalRouteV162(withHubNpcServiceRoutesV161(withHubNpcAnnexCirculationV159(withHubNpcCirculationV158(FixtureBase))));
function runtime(hour = 5.5, save = {}, options = {}) { const h = new TestHub(); h.start(save, { ...options, routineContextV62: { clock: { day: 1, hour } } }); return h; }
function tick(h, seconds) { for (let i = 0; i < seconds * 60; i++) h.update(1 / 60); }
function context(h, hour, extra = {}, rebuild = true) { return h.setNpcRoutineContextV62({ clock: { day: 1, hour }, ...extra }, { persist: false, rebuild }); }
const snap = h => h.getSnapshot().npcMedicalRouteV162.routes['noor-morgue'];

test('one real medical body survives native rebuilds, both coordinate charts, off-camera time, dialogue hold and exact resume', () => {
  const h = runtime(), a = h.getNpcMedicalActorV162(); assert.equal(a.x, 3181); context(h, 10.5); tick(h, 5);
  const x = a.x; context(h, 10.75); assert.equal(h.getNpcMedicalActorV162(), a); assert.equal(a.x, x);
  h.state.deck = 0; h.npcs = h.createNpcs(0); tick(h, 45); assert.equal(a.roomId, 'morgue'); assert.equal(snap(h).actor.stage, 'service');
  h.local = 'morgue'; const event = h.interactWithAnnexNpcV141(a); assert.equal(event.crewId, id); assert.equal(event.roomId, 'morgue');
  const heldX = a.x; tick(h, 1); assert.equal(a.x, heldX); assert.ok(Math.abs(a.workClock - 1.4) < 1e-6);
  h.running = false; const frozen = snap(h); tick(h, 2); assert.deepEqual(snap(h), frozen);
  h.persist(); const patch = h.persisted.at(-1), restored = runtime(10.75, { ...patch, deck: 1 });
  assert.deepEqual(snap(restored).actor, snap(h).actor); assert.equal(h.hubNpcInteractions[id].count, 1);
  assert.equal(h.ensureAnnexNpcCohortV141().filter(n => n.crewId === id).length, 1);
});

test('native animal-care watch gets its own identity only after Noor really returns to medical, with explicit unobserved delegation', () => {
  const h = runtime(); context(h, 8); tick(h, 8); const a = h.getNpcMedicalActorV162(); assert.equal(a.roomId, 'medical');
  context(h, 9); tick(h, 10); const s = snap(h);
  assert.equal(h.getNpcMedicalActorV162(), null); assert.equal(s.actor, null);
  assert.deepEqual(s.nativeHandoff, { crewId: id, fromRoomId: 'medical', toRoomId: 'animal-care', reason: 'annex-assignment',
    observedTravel: false, owner: 'native-v141-annex-watch' });
  const cohort = h.ensureAnnexNpcCohortV141().filter(n => n.crewId === id);
  assert.equal(cohort.length, 1); assert.equal(cohort[0].roomId, 'animal-care'); assert.equal(h.npcs.filter(n => n.crewId === id).length, 0);
  const fresh = runtime(9); assert.equal(fresh.getNpcMedicalActorV162(), null);
  assert.equal(fresh.ensureAnnexNpcCohortV141().find(n => n.crewId === id).roomId, 'animal-care');
});

test('medical recovery, mission assignment and unavailable handoffs preserve every other composed physical body', () => {
  for (const reason of ['medical', 'mission', 'unavailable']) {
    const h = runtime(), a = h.getNpcMedicalActorV162();
    const peers = [h.getNpcServiceActorV161('leila-galley'), h.npcAnnexActorV159, h.getNpcServiceActorV161('idris-engine')];
    if (reason === 'unavailable') a.downed = true;
    else context(h, 5.5, reason === 'medical' ? { crew: [{ id, health: 20, injuries: [] }] } : { operation: { crewIds: [id] } }, false);
    h.update(1 / 60); assert.equal(h.getNpcMedicalActorV162(), null); assert.equal(snap(h).nativeHandoff.observedTravel, false);
    for (const peer of peers) {
      const current = peer.crewId === 'crew-05-bishop-9' ? h.npcAnnexActorV159 : h.getNpcServiceActorV161(peer.crewId === 'crew-03-idris-kwan' ? 'idris-engine' : 'leila-galley');
      assert.equal(current, peer); const visible = h.npcs.filter(n => n.crewId === peer.crewId);
      assert.equal(visible.length, peer.roomId === 'reactor' ? 0 : 1); if (visible.length) assert.equal(visible[0], peer);
    }
  }
});

test('the actual player gate, paired renderer targets and destination plaques use the same fitted medical/morgue apertures', () => {
  const h = runtime(); context(h, 10.5);
  for (let i = 0; i < 2000 && !snap(h).reserved; i++) h.update(1 / 60);
  assert.ok(snap(h).reserved); assert.equal(AnnexHub.prototype.beginAnnexTransitionV71.call(h, 'morgue', 'enter'), null);
  const pair = h.hubDoorPairV142(annex);
  for (const [key, savedKey] of [['parent', 'sourceFace'], ['local', 'annexFace']]) {
    for (const field of ['target', 'opening', 'source']) assert.deepEqual(pair[key][field], snap(h)[savedKey][field]);
    for (const field of ['x', 'y', 'w', 'h']) assert.equal(pair[key].socket[field], snap(h)[savedKey].socket[field]);
  }
  assert.equal(pair.parent.opening.w, pair.local.opening.w); assert.equal(pair.parent.target.h, pair.local.target.h);
  for (const room of [parent, { ...annex, xStart: 0 }]) {
    const plaque = getHubLiveDestinationSignPlansV161(h, room).find(s => s.connectionId === 'morgue');
    const face = room.id === 'medical' ? pair.parent : pair.local; assert.deepEqual(plaque.portalTarget, face.target);
    assert.ok(Math.abs(plaque.bounds.y + plaque.bounds.h + 10 - face.target.y) < 1e-9);
  }
});

test('medical162 save is detached and independent of161 service routes, while sandbox worlds admit neither new medical body nor reservation', () => {
  const h = runtime(); context(h, 10.5); tick(h, 5); h.persist(); const patch = h.persisted.at(-1);
  const save = createDefaultSave(); save.hub = { ...save.hub, ...patch }; const migrated = migrateSave(save);
  assert.deepEqual(migrated.hub.npcMedicalRouteV162, normalizeNpcMedicalRouteV162(patch.npcMedicalRouteV162));
  assert.deepEqual(migrated.hub.npcServiceRoutesV161, normalizeNpcServiceRoutesV161(patch.npcServiceRoutesV161));
  const detached = normalizeNpcMedicalRouteV162(patch.npcMedicalRouteV162); detached.routes['noor-morgue'].actor.x = 0;
  assert.notEqual(h.getNpcMedicalActorV162().x, 0);
  assert.equal(normalizeNpcMedicalRouteV162({ schema: 999, routes: patch.npcMedicalRouteV162.routes }).routes['noor-morgue'].actor, null);
  for (const options of [{ editorProject: {} }, { forgeJourneyV141: true }]) {
    const sandbox = runtime(10.5, {}, options); tick(sandbox, 2); assert.equal(sandbox.getNpcMedicalActorV162(), null);
    assert.equal(snap(sandbox).actor, null); assert.equal(sandbox.npcAnnexDoorReservedV159('morgue'), false);
  }
});

test('the three earlier inner owners preserve the new visible Noor body through their own native priority handoffs', () => {
  for (const owner of ['bishop', 'idris-engine', 'leila-galley']) for (const reason of ['medical', 'mission', 'unavailable']) {
    const h = runtime(), noor = h.getNpcMedicalActorV162();
    const departing = owner === 'bishop' ? h.npcAnnexActorV159 : h.getNpcServiceActorV161(owner);
    assert.ok(departing); const crewId = departing.crewId, x = noor.x;
    if (reason === 'unavailable') departing.downed = true;
    else context(h, 5.5, reason === 'medical' ? { crew: [{ id: crewId, health: 20, injuries: [] }] }
      : { operation: { crewIds: [crewId] } }, false);
    h.update(1 / 60);
    assert.equal(h.getNpcMedicalActorV162(), noor);
    const visible = h.npcs.filter(n => n.crewId === id); assert.equal(visible.length, 1); assert.equal(visible[0], noor);
    assert.equal(noor.x, x); assert.equal(noor.roomId, 'medical'); assert.equal(noor.y + noor.h, 624);
    assert.equal(owner === 'bishop' ? h.npcAnnexActorV159 : h.getNpcServiceActorV161(owner), null);
  }
});
