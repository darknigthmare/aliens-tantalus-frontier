import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { resolveNpcRoutineV62 } from '../src/npc-dialogue-v62.js';
import { HubGame as RoutineHub, HUB_NPC_ROSTER, getNpcRoutineStandingAnchorV158 } from '../src/hub-v62-runtime.js';
import { withHubNpcLifeV136 } from '../src/npc-life-v136.js';
import { HUB_NPC_CIRCULATION_V158, normalizeNpcCirculationV158, createNpcCirculationStateV158,
  npcCirculationPathV158, advanceNpcCirculationV158, withHubNpcCirculationV158 } from '../src/npc-circulation-v158.js';

const id = HUB_NPC_CIRCULATION_V158.crewId;
const routine = (hour, extra = {}) => resolveNpcRoutineV62(id, { clock: { day: 1, hour }, ...extra });
const actor = (extra = {}) => ({ crewId: id, roomId: 'briefing', x: 1849, y: 532, w: 44, h: 92,
  facing: 1, alive: true, workClock: 0, supportClock: 0, ...extra });
const doors = () => buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, 0).map(door => ({ ...door }));
function simulate(a, seconds, { resolution = routine(12), state = createNpcCirculationStateV158(a, resolution),
  rate = 60, open = true, colliders = [], peers = [] } = {}) {
  const leaves = doors(), frames = [];
  for (let i = 0; i < seconds * rate; i++) {
    if (open) for (const door of leaves) {
      const target = Math.abs(a.x + a.w / 2 - door.x) < 182 ? 1 : 0;
      door.progress += (target - door.progress) * Math.min(1, 7 / rate);
    }
    const before = a.x;
    state = advanceNpcCirculationV158(state, a, 1 / rate, { resolution, doors: leaves, colliders, peers });
    Object.assign(a, { x: state.x, y: state.y, roomId: state.roomId, facing: state.facing });
    assert.ok(Math.abs(a.x - before) <= 27 / rate + 1e-7, 'Every position change belongs to the actual walking delta.');
    frames.push({ ...state, leaf: leaves.find(d => d.id === HUB_NPC_CIRCULATION_V158.doorId).progress });
  }
  return { a, state, leaves, frames };
}

test('the circuit reuses the real two rooms, exact native standing posts and authored bulkhead waypoints', () => {
  assert.deepEqual(HUB_NPC_CIRCULATION_V158.roomIds, ['briefing', 'combat-information']);
  assert.equal(getNpcRoutineStandingAnchorV158(id, 'briefing', 'work'), 1849);
  assert.equal(getNpcRoutineStandingAnchorV158(id, 'combat-information', 'break'), 3195);
  const path = npcCirculationPathV158(createNpcCirculationStateV158(actor(), routine(12)), doors());
  assert.deepEqual(path.filter(p => p.doorId).map(p => [p.x, p.side]), [[2506, 'approach'], [2570, 'crossed']]);
  assert.ok(path.every(p => ['briefing', 'combat-information'].includes(p.roomId)));
  assert.equal(path.at(-1).x, 3195);
  assert.deepEqual(buildHubObstacleGeometryV87(0).filter(c => c.collisionMode !== 'one-way-top'
    && c.x < 3840 && c.x + c.w > 1280 && c.y < 624 && c.y + c.h > 532), []);
});

test('a real outbound walk crosses an actor-opened leaf, performs the native stop, and walks back', () => {
  const out = simulate(actor(), 65);
  assert.equal(out.state.mode, 'service'); assert.equal(out.state.arrivals, 1);
  assert.equal(out.a.roomId, 'combat-information'); assert.ok(Math.abs(out.a.x - 3195) < .25);
  assert.ok(out.frames.some(f => f.x > 2560 && f.leaf >= .82));
  assert.ok(out.frames.filter(f => f.x >= 2508 && f.x < 2568).every(f => f.leaf >= .82));
  assert.ok(out.frames.every((f, i, fs) => !i || f.x >= fs[i - 1].x));
  const back = simulate(out.a, 65, { state: out.state, resolution: routine(14) });
  assert.equal(back.state.mode, 'service'); assert.equal(back.state.arrivals, 2);
  assert.equal(back.a.roomId, 'briefing'); assert.ok(Math.abs(back.a.x - 1849) < .25);
  assert.ok(back.frames.every((f, i, fs) => !i || f.x <= fs[i - 1].x));
  assert.equal(back.state.distance > 2690, true);
});

test('walking speed and actual crossing are stable at 30, 60 and 120 Hz', () => {
  const results = [30, 60, 120].map(rate => simulate(actor(), 36, { rate }));
  for (const result of results) assert.ok(Math.abs(result.a.x - results[1].a.x) < .05);
  for (const result of results) assert.ok(result.frames.every(frame => Math.abs(frame.velocity) <= 27.000001));
});

test('a closed native leaf, solid prop and live peer each stop the whole body without advancing phantom nodes', () => {
  const closed = simulate(actor(), 50, { open: false });
  assert.equal(closed.a.x, 2508); assert.equal(closed.a.roomId, 'briefing');
  assert.equal(closed.state.arrivals, 0); assert.equal(closed.state.waypointIndex, 2);
  const box = { x: 2200, y: 426, w: 16, h: 198 };
  const prop = simulate(actor(), 50, { colliders: [box] });
  assert.equal(prop.a.x, 2156); assert.equal(prop.state.arrivals, 0);
  const peer = actor({ crewId: 'crew-06-rook', x: 2250 });
  const held = simulate(actor(), 50, { peers: [peer] });
  assert.ok(held.a.x + 44 + 12 <= peer.x + 1e-6);
  assert.equal(held.state.arrivals, 0); assert.ok(held.frames.every(f => f.x >= 1849));
  const resumed = simulate(closed.a, 45, { state: closed.state });
  assert.equal(resumed.state.mode, 'service'); assert.equal(resumed.state.arrivals, 1);
});

test('each emergency preserves feet, pauses the trip and resumes from that exact physical position', () => {
  const emergencies = [
    { crisis: { id: 'real-crisis', active: true } },
    { operation: { crewIds: [id] } },
    { crew: [{ id, health: 20, injuries: [] }] }
  ];
  for (const extra of emergencies) {
    const first = simulate(actor(), 10), before = first.a.x;
    const held = simulate(first.a, 4, { state: first.state, resolution: routine(12, extra) });
    assert.equal(held.a.x, before); assert.equal(held.state.mode, 'suspended');
    assert.equal(held.state.velocity, 0); assert.equal(held.state.actualVelocity, 0);
    const resumed = simulate(held.a, 60, { state: held.state });
    assert.equal(resumed.state.mode, 'service'); assert.equal(resumed.state.arrivals, 1);
  }
});

test('pause, invalid deltas, interaction and dropped frames cannot fabricate movement', () => {
  const a = actor(), state = createNpcCirculationStateV158(a, routine(12));
  for (const delta of [0, -1, NaN, Infinity]) assert.equal(advanceNpcCirculationV158(state, a, delta), state);
  assert.equal(advanceNpcCirculationV158(state, a, 3, { running: false }), state);
  const held = advanceNpcCirculationV158(state, { ...a, workClock: 2.4 }, .1, { resolution: routine(12) });
  assert.equal(held.x, a.x); assert.equal(held.actualVelocity, 0);
  const stalledFrame = advanceNpcCirculationV158(state, a, 20, { resolution: routine(12), doors: doors() });
  assert.ok(stalledFrame.x - a.x <= 2.7); assert.equal(stalledFrame.time, .1);
});

test('real pose, waypoint progress and completion survive a strict bounded save without changing V62 intention', () => {
  const partial = simulate(actor(), 36);
  const restored = normalizeNpcCirculationV158(JSON.parse(JSON.stringify({ schema: 158, actor: partial.state })));
  assert.ok(restored.actor); assert.equal(restored.actor.x, partial.a.x);
  assert.equal(restored.actor.waypointIndex, partial.state.waypointIndex);
  const a = actor({ x: restored.actor.x, roomId: restored.actor.roomId });
  const after = simulate(a, 35, { state: restored.actor });
  assert.equal(after.state.mode, 'service'); assert.equal(after.state.arrivals, 1);
  for (const corrupt of [{ ...partial.state, crewId: 'crew-01-mara-vega' }, { ...partial.state, x: 5 },
    { ...partial.state, roomId: 'briefing', x: 3000 }, { ...partial.state, y: 531 },
    { ...partial.state, velocity: 1000 }, { ...partial.state, waypointIndex: 99 }]) {
    assert.equal(normalizeNpcCirculationV158({ schema: 158, actor: corrupt }).actor, null);
  }
  assert.equal(normalizeNpcCirculationV158({ schema: 159, actor: partial.state }).actor, null);
});

// Reuse the actual native routine and cohort factories. The small outer loop
// excludes renderer/player combat; production browser QA exercises that loop.
const LifeHub = withHubNpcLifeV136(RoutineHub);
class FixtureBase {
  initializeNpcRoutinesV62(...args) { return RoutineHub.prototype.initializeNpcRoutinesV62.apply(this, args); }
  getNpcRoutineResolutionsV62(...args) { return RoutineHub.prototype.getNpcRoutineResolutionsV62.apply(this, args); }
  setNpcRoutineContextV62(...args) { return RoutineHub.prototype.setNpcRoutineContextV62.apply(this, args); }
  createNpcs(...args) { return LifeHub.prototype.createNpcs.apply(this, args); }
  ensureAnnexNpcCohortV141(...args) { return LifeHub.prototype.ensureAnnexNpcCohortV141.apply(this, args); }
  stepHubNpcLifeV136(...args) { return LifeHub.prototype.stepHubNpcLifeV136.apply(this, args); }
  setNpcCrisisAlert() {}
  start(save = {}, { routineContextV62 = { clock: { day: 1, hour: 13 } } } = {}) {
    this.state = { deck: save.deck || 0 }; this.player = { x: 50, w: 44 };
    this.initializeNpcRoutinesV62(save, routineContextV62);
    this.doorStates = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, this.state.deck).map(d => ({ ...d }));
    this.npcs = this.createNpcs(this.state.deck); this.obstacles = buildHubObstacleGeometryV87(this.state.deck);
    this.running = true; this.persisted = []; this.onPersist = patch => this.persisted.push(patch);
  }
  update(delta) {
    if (this.running === false) return;
    for (const n of this.npcs) {
      n.workClock = Math.max(0, n.workClock - delta); n.supportClock = Math.max(0, n.supportClock - delta);
      this.stepHubNpcLifeV136(n, delta);
    }
    for (const d of this.doorStates) {
      const target = Math.abs(this.player.x + 22 - d.x) < 182 || this.hubNpcBulkheadDemandV158(d) ? 1 : 0;
      d.progress += (target - d.progress) * Math.min(1, delta * 7);
    }
  }
  persist() { this.onPersist({ npcRoutineState: structuredClone(this.npcRoutineStateV62) }); }
  getSnapshot() { return {}; }
}
const TestHub = withHubNpcCirculationV158(FixtureBase);
function runtime(hour = 13, save = {}) {
  const h = new TestHub(); h.start(save, { routineContextV62: { clock: { day: 1, hour } } }); return h;
}
function tick(h, seconds) { for (let i = 0; i < seconds * 60; i++) h.update(1 / 60); }
function context(h, hour, extra = {}) { return h.setNpcRoutineContextV62({ clock: { day: 1, hour }, ...extra }, { persist: false }); }

test('routine rebuilds, dialogue-ledger refreshes and hour changes preserve the single native actor and its feet', () => {
  const h = runtime(), identity = h.npcCirculationActorV158;
  assert.equal(identity.x, 3195); context(h, 14); assert.equal(identity.x, 3195);
  tick(h, 10); const x = identity.x;
  context(h, 14.25); assert.equal(h.npcCirculationActorV158, identity); assert.equal(identity.x, x);
  assert.equal(h.npcs.filter(n => n.crewId === id).length, 1);
  const intentBefore = structuredClone(h.npcRoutineStateV62);
  tick(h, 55); assert.equal(h.npcCirculationStateV158.mode, 'service');
  assert.equal(identity.roomId, 'briefing'); assert.ok(Math.abs(identity.x - 1849) < .25);
  assert.deepEqual(h.npcRoutineStateV62, intentBefore, 'Physical walking cannot rewrite campaign intent or award dialogue effects.');
  context(h, 15); assert.equal(h.npcCirculationActorV158, identity);
});

test('another deck retains the real command leaf, peer occupancy, progress, and the same returning actor', () => {
  const h = runtime(); context(h, 14); tick(h, 10);
  const identity = h.npcCirculationActorV158, x = identity.x;
  h.state.deck = 1; h.doorStates = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, 1).map(d => ({ ...d }));
  h.npcs = h.createNpcs(1); assert.ok(h.npcs.every(n => n.crewId !== id));
  tick(h, 30); assert.ok(identity.x < x); assert.equal(identity.roomId, 'briefing');
  const offscreenX = identity.x, ownLeaf = h.npcCirculationDoorsV158.find(d => d.id.endsWith(':hub-central-bulkhead'));
  assert.ok(ownLeaf.progress > 0);
  h.state.deck = 0; h.doorStates = doors(); h.npcs = h.createNpcs(0);
  assert.equal(h.npcCirculationActorV158, identity); assert.equal(identity.x, offscreenX);
  assert.equal(h.npcs.filter(n => n.crewId === id).length, 1);
  assert.equal(h.doorStates.find(d => d.id === ownLeaf.id).progress, ownLeaf.progress);
});

test('a preserved off-deck peer blocks travel, and the same interaction clock elapses only once per frame', () => {
  const h = runtime(); context(h, 14); tick(h, 5);
  const own = h.npcCirculationActorV158;
  const peer = actor({ crewId: 'crew-06-rook', roomId: 'combat-information', x: 2900 });
  h.state.deck = 1; h.doorStates = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, 1).map(d => ({ ...d }));
  h.npcs = h.createNpcs(1); h.npcCirculationCommandPeersV158 = [peer];
  own.workClock = 2.4; const x = own.x;
  tick(h, 1); assert.equal(own.x, x); assert.ok(Math.abs(own.workClock - 1.4) < .001);
  tick(h, 15); assert.ok(own.x >= peer.x + peer.w + 12 - .001);
  assert.equal(h.npcCirculationStateV158.arrivals, 0);
  h.npcCirculationCommandPeersV158 = []; tick(h, 60);
  assert.equal(h.npcCirculationStateV158.mode, 'service');
});

test('a real security lock holds the actual leaf on camera and off deck, then unlocking permits the same trip', () => {
  for (const offDeck of [false, true]) {
    const h = runtime(); context(h, 14);
    h.hubTrainingV132 = { lockedDoorIds: ['command:hub-central-bulkhead'] };
    if (offDeck) {
      h.state.deck = 1; h.doorStates = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, 1).map(d => ({ ...d }));
      h.npcs = h.createNpcs(1);
    }
    tick(h, 55);
    assert.equal(h.npcCirculationActorV158.x, 2568);
    assert.equal(h.npcCirculationActorV158.roomId, 'combat-information');
    assert.equal(h.npcCirculationStateV158.arrivals, 0);
    assert.equal(h.npcCirculationDoorsV158.find(d => d.id.endsWith(':hub-central-bulkhead')).progress, 0);
    h.hubTrainingV132.lockedDoorIds = []; tick(h, 45);
    assert.equal(h.npcCirculationStateV158.mode, 'service');
    assert.equal(h.npcCirculationStateV158.arrivals, 1);
  }
});

test('a reload in the middle of the native threshold restores the actual opening along with the body', () => {
  const h = runtime(); context(h, 14);
  while (h.npcCirculationActorV158.x >= 2568) h.update(1 / 60);
  const x = h.npcCirculationActorV158.x;
  assert.ok(x + 44 > 2552 && x < 2568);
  h.persist(); const patch = h.persisted.at(-1);
  assert.ok(patch.npcCirculationV158.actor.doorProgress >= .82);
  const restored = runtime(14, patch);
  assert.equal(restored.npcCirculationActorV158.x, x);
  assert.equal(restored.doorStates.find(d => d.id.endsWith(':hub-central-bulkhead')).progress,
    patch.npcCirculationV158.actor.doorProgress);
  // A lock requested while the existing body is already inside cannot close
  // through it; the opening is reserved until its feet have cleared the leaf.
  restored.hubTrainingV132 = { lockedDoorIds: ['command:hub-central-bulkhead'] };
  tick(restored, 5);
  assert.ok(restored.npcCirculationActorV158.x + 44 <= 2552);
  assert.equal(restored.doorStates.find(d => d.id.endsWith(':hub-central-bulkhead')).progress, 0);
});

test('the actual native duct exit rebinds the visible and physical sas on the same deck and after a deck change', () => {
  for (const initialDeck of [0, 1]) {
    const h = runtime(14, { deck: initialDeck }), identity = h.npcCirculationActorV158;
    Object.assign(h.state, { visited: [] }); Object.assign(h.player, { h: 92, y: 532 });
    Object.assign(h, { canvas: { width: 1280 }, camera: {}, floorY: 624,
      onAction() {}, emitStatus() {}, createObstacles: RoutineHub.prototype.createObstacles,
      configureTraversal: RoutineHub.prototype.configureTraversal });
    RoutineHub.prototype.completeVentExitV62.call(h, 'hub-briefing-exit');
    assert.equal(h.state.deck, 0); assert.equal(h.npcCirculationActorV158, identity);
    tick(h, 70);
    assert.equal(h.npcCirculationDoorsV158, h.doorStates);
    assert.equal(h.npcCirculationStateV158.mode, 'service');
    assert.equal(identity.roomId, 'briefing'); assert.ok(Math.abs(identity.x - 1849) < .25);
    assert.equal(h.npcCirculationStateV158.arrivals, 1);
  }
});

test('the full runtime cohort preserves a pending departure, actual outbound service, and return to its native work post', () => {
  const seed = createNpcCirculationStateV158(actor(), routine(11));
  const h = runtime(13, { npcCirculationV158: { schema: 158, actor: seed } });
  const identity = h.npcCirculationActorV158;
  assert.equal(identity.x, 1849); tick(h, 65);
  assert.equal(identity.roomId, 'combat-information'); assert.equal(h.npcCirculationStateV158.arrivals, 1);
  assert.equal(h.npcCirculationStateV158.mode, 'service');
  context(h, 14); tick(h, 65);
  assert.equal(h.npcCirculationActorV158, identity); assert.equal(identity.roomId, 'briefing');
  assert.equal(h.npcCirculationStateV158.arrivals, 2);
  context(h, 15); tick(h, 5);
  assert.ok(identity.v52Animation === undefined, 'Node fixture never invents rendered frames.');
  assert.equal(identity.routinePhaseV62, 'work');
  assert.ok(identity.lifeV136.passive, 'The actual idle/work controller owns the returned native post.');
});

test('runtime pause and a saved mid-route reload never recreate ECHO at the timetable sample', () => {
  const h = runtime(); context(h, 14); tick(h, 20);
  const a = h.npcCirculationActorV158, x = a.x, state = structuredClone(h.npcCirculationStateV158);
  h.running = false; tick(h, 4); assert.equal(a.x, x); assert.deepEqual(h.npcCirculationStateV158, state);
  h.persist(); const patch = h.persisted.at(-1);
  assert.equal(patch.npcCirculationV158.actor.x, x);
  const restored = runtime(14, patch); assert.equal(restored.npcCirculationActorV158.x, x);
  assert.notEqual(x, 2846, 'The legacy 14:00 sample must not replace actual progress.');
  tick(restored, 50); assert.equal(restored.npcCirculationStateV158.mode, 'service');
});

test('the historical escape-pods assignment owns its identity, and editor/Forge worlds never receive this circuit', () => {
  const h = runtime(8); assert.ok(h.npcCirculationActorV158);
  context(h, 9.5); assert.equal(h.npcCirculationActorV158, null); assert.equal(h.npcCirculationStateV158, null);
  assert.ok(h.npcs.every(n => n.crewId !== id));
  assert.equal(h.ensureAnnexNpcCohortV141().filter(n => n.crewId === id).length, 1);
  const sandbox = new TestHub(); sandbox.start({}, { editorProject: {}, routineContextV62: { clock: { day: 1, hour: 14 } } });
  assert.equal(sandbox.npcCirculationActorV158, null);
  assert.equal(sandbox.getSnapshot().npcCirculationV158.actor, null);
});

test('a native conversation across a nearby threshold records the actual speaker room', () => {
  const h = runtime(), speaker = h.npcCirculationActorV158;
  h.currentRoom = () => HUB_DECKS[0].rooms.find(room => room.id === 'briefing');
  h.hubNpcAnimation = { reset() {} }; h.hubNpcInteractions = {}; h.hubNpcSequence = 0;
  h.onAction = event => { h.conversationEvent = event; }; h.emitStatus = () => {};
  RoutineHub.prototype.interactWithNpc.call(h, speaker);
  assert.equal(h.conversationEvent.roomId, 'combat-information');
  assert.equal(h.hubNpcInteractions[id].lastRoomId, 'combat-information');
  assert.equal(speaker.workClock, 2.4);
});

test('a trip can start off camera on another deck from the native roster without adding a second identity', () => {
  const h = runtime(13, { deck: 1 });
  assert.equal(h.npcCirculationActorV158.x, 3195); assert.ok(h.npcs.every(n => n.crewId !== id));
  context(h, 14); tick(h, 65);
  assert.equal(h.npcCirculationActorV158.roomId, 'briefing');
  assert.equal(h.npcCirculationStateV158.mode, 'service');
});
