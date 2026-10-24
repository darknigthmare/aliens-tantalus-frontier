import assert from 'node:assert/strict';
import { test } from 'node:test';
import { HubGame, HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from '../src/hub-game.js';
import { buildHubDoorNetworkV58 } from '../src/topology-coherence-v58.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { resolveNpcRoutineV62, NPC_IDENTITIES_V62 } from '../src/npc-dialogue-v62.js';
import { HubGame as RoutineHubV62 } from '../src/hub-v62-runtime.js';
import { spreadNpcStationSpawnsV136 } from '../src/npc-life-v136.js';
import { annexNpcDutiesV141, createAnnexNpcsV141 } from '../src/hub-annex-npc-life-v141.js';
import { createHubLiftTripV163, normalizeHubLiftTransitV163, advanceHubLiftTripV163,
  liftPoseV163, liftDoorProgressV163, liftPhaseDurationV163, liftDestinationPeersV163,
  getLiftOcclusionV163, withHubLiftTransitV163 } from '../src/hub-lift-transit-v163.js';

const sockets = deck => buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deck);
const liftAt = (deck, shaft = 'hub-midship-lift') => sockets(deck).find(d => d.shaftId === shaft);
const actorAt = (lift, offset = -76) => ({ x: lift.x - 22 + offset, y: 532, w: 44, h: 92,
  health: 100, alive: true, grounded: true, facing: 1, vx: 0, vy: 0 });
const create = (deck = 1, extra = {}) => {
  const lift = liftAt(deck, extra.shaft), player = actorAt(lift);
  return createHubLiftTripV163(null, { lift, player, deck, direction: deck === 3 ? -1 : 1, ...extra });
};

test('both shafts and all four native decks preserve matched sockets, floor, bounded walking and an opaque chart handoff', () => {
  for (const shaft of ['hub-midship-lift', 'hub-aft-lift']) for (let deck = 0; deck < 4; deck++) {
    for (const offset of [-120, 0, 120]) for (const reducedMotion of [false, true]) {
      const lift = liftAt(deck, shaft), player = actorAt(lift, offset);
      let state = create(deck, { shaft, lift, player, reducedMotion, wrap: true });
      assert.ok(state.trip); const seen = new Set(); let handoffs = 0;
      for (let frame = 0; frame < 1000 && state.trip; frame++) {
        const before = state.trip, old = liftPoseV163(before);
        const step = advanceHubLiftTripV163(state, 1 / 60); seen.add(before.phase);
        if (step.handoff) { handoffs++; assert.equal(liftDoorProgressV163(before), 0); assert.equal(step.state.trip.phase, 'opening'); }
        if (step.state.trip) {
          const pose = liftPoseV163(step.state.trip);
          assert.ok(Math.abs(pose.x - old.x) <= 90 / 60 + 1e-8);
          assert.equal(pose.y + pose.h, 624); assert.equal(pose.w, 44); assert.equal(pose.h, 92);
          assert.equal(liftAt(before.toDeck, shaft).x - 22, before.cabinX);
        }
        state = step.state;
      }
      assert.equal(state.trip, null); assert.equal(handoffs, 1); assert.equal(seen.size, 4);
    }
  }
});

test('arrival occupancy, pause and large elapsed frames cannot bypass admission or phase boundaries', () => {
  let state = create();
  assert.deepEqual(advanceHubLiftTripV163(state, .1, { sourceClear: false }).state, state);
  assert.deepEqual(advanceHubLiftTripV163(state, 0).state, state);
  for (let i = 0; i < 1000 && state.trip.phase !== 'travel'; i++) state = advanceHubLiftTripV163(state, .1).state;
  const blocked = advanceHubLiftTripV163(state, 100, { arrivalClear: false });
  assert.equal(blocked.blocked, true); assert.equal(blocked.handoff, false); assert.deepEqual(blocked.state, state);
  const next = advanceHubLiftTripV163(state, 100).state;
  assert.equal(next.trip.elapsed, .1); assert.equal(next.trip.phase, 'travel');
});

test('only real native journeys normalize; malformed identities, source poses and arbitrary phases cannot become arrivals', () => {
  const state = create();
  for (const patch of [{ id: 4 }, { shaftId: 'teleport' }, { toDeck: 7 }, { fromDeck: 1.5 },
    { originX: 0 }, { cabinX: state.trip.cabinX + 1 }, { elapsed: Infinity }, { phase: 'arrived' },
    { elapsed: 20 }, { facing: 0 }, { reducedMotion: 'yes' }])
    assert.equal(normalizeHubLiftTransitV163({ ...state, trip: { ...state.trip, ...patch } }).trip, null);
  for (const patch of [{ grounded: false }, { h: 80 }, { y: 530 }, { health: 0 }, { x: 10 }])
    assert.equal(create(1, { player: { ...actorAt(liftAt(1)), ...patch } }).trip, null);
  assert.equal(create(0, { direction: -1 }).trip, null);
});

class FixtureBase {
  start(save = {}) {
    this.state = { deck: save.deck ?? 1, roomId: save.roomId || liftAt(1).roomId, visited: [] };
    const lift = liftAt(this.state.deck);
    this.player = { ...actorAt(lift), x: save.positionX ?? actorAt(lift).x, y: save.positionY ?? 532 };
    this.keys = new Set(); this.running = true; this.audio = { ui() {} }; this.camera = { x: 0 };
    this.doorStates = sockets(this.state.deck).map(d => ({ ...d })); this.npcs = []; this.obstacles = this.createObstacles(this.state.deck);
    this.persisted = []; this.onPersist = patch => this.persisted.push(structuredClone(patch));
  }
  createNpcs() { return []; }
  createObstacles(deck) { return buildHubObstacleGeometryV87(deck); }
  nearestLift() { return this.doorStates.find(d => d.lift && Math.abs(this.player.x + 22 - d.x) < 128); }
  useLift(...args) { return HubGame.prototype.useLift.apply(this, args); }
  update() {}
  emitStatus() {}
  persist() { this.onPersist({ ...this.state, positionX: this.player.x, positionY: this.player.y }); }
  getSnapshot() { return {}; }
  interact() { this.interactions = (this.interactions || 0) + 1; }
  fire() { this.shots = (this.shots || 0) + 1; }
  setControl() { this.controls = (this.controls || 0) + 1; }
}
const NativeTransit = withHubLiftTransitV163(FixtureBase);
const tick = (hub, count = 1) => { for (let i = 0; i < count; i++) hub.update(1 / 60); };

test('the real native useLift persists one coherent arrival, and all four phases survive Save migration and runtime restart', () => {
  for (const phase of ['boarding', 'closing', 'travel', 'opening']) {
    const hub = new NativeTransit(); hub.start(); assert.equal(hub.useLift(1), true);
    for (let i = 0; i < 900 && hub.hubLiftTransitV163.trip.phase !== phase; i++) tick(hub);
    assert.equal(hub.hubLiftTransitV163.trip.phase, phase); tick(hub, 2); hub.persist();
    const save = createDefaultSave(); Object.assign(save.hub, hub.persisted.at(-1));
    const migrated = migrateSave(JSON.parse(JSON.stringify(save)));
    assert.deepEqual(migrated.hub.hubLiftTransitV163, hub.hubLiftTransitV163);
    const restored = new NativeTransit(); restored.start(migrated.hub);
    assert.deepEqual(restored.hubLiftTransitV163, hub.hubLiftTransitV163);
    tick(restored, 600); assert.equal(restored.state.deck, 2); assert.equal(restored.hubLiftTransitV163.trip, null);
    for (const patch of restored.persisted) {
      const trip = patch.hubLiftTransitV163.trip;
      if (trip) assert.equal(patch.deck, trip.phase === 'opening' ? trip.toDeck : trip.fromDeck);
    }
    assert.equal(restored.player.x, liftAt(2).x - 22); assert.equal(restored.player.y + restored.player.h, 624);
  }
});

test('occupied real arrival waits behind closed leaves, then completes when the peer clears; player controls remain exclusive', () => {
  const hub = new NativeTransit(); hub.start(); assert.equal(hub.useLift(1), true);
  hub.createNpcs = () => { throw new Error('occupancy must never call the virtual owner builder'); };
  const destination = liftAt(2), peer = { crewId: 'crew-01-mara-vega', deck: 2, roomId: destination.roomId,
    x: destination.x - 22, y: 532 };
  hub.getSnapshot = () => ({ npcServiceRoutesV161: { routes: { test: { actor: peer } } } });
  tick(hub, 600); assert.equal(hub.state.deck, 1); assert.equal(hub.hubLiftTransitV163.trip.phase, 'travel');
  assert.equal(hub.liftBlockedV163, true); assert.equal(liftDoorProgressV163(hub.hubLiftTransitV163.trip), 0);
  hub.fire(); hub.setControl('right', true); assert.equal(hub.interactions, undefined);
  assert.equal(hub.shots, undefined); assert.equal(hub.controls, undefined);
  peer.x += 200; delete hub.createNpcs; tick(hub, 600); assert.equal(hub.state.deck, 2);
  assert.equal(hub.hubLiftTransitV163.trip, null);
});

test('an already occupied arrival refuses boarding without taking controls or moving either native body', () => {
  const hub = new NativeTransit(); hub.start();
  const lift = liftAt(2), peer = { crewId: 'crew-01-mara-vega', roomId: lift.roomId, x: lift.x - 22, y: 532 };
  hub.getSnapshot = () => ({ npcServiceRoutesV161: { routes: { occupied: { actor: peer } } } });
  const origin = structuredClone(hub.player), peerOrigin = structuredClone(peer);
  assert.equal(hub.useLift(1), false); assert.equal(hub.hubLiftTransitV163.trip, null);
  assert.deepEqual(hub.player, origin); assert.deepEqual(peer, peerOrigin);
  assert.match(hub.statusPrompt(), /ARRIVÉE OCCUPÉE/);
  hub.setControl('right', true); assert.equal(hub.controls, 1);
  peer.x += 200; assert.equal(hub.useLift(1), true);
});

test('the real12h30 native timetable cannot strand a deck3 traveller behind the stationary armory cohort', () => {
  const hub = new NativeTransit(); hub.start({ deck: 3, roomId: 'reactor' });
  hub.npcRoutineResolutionsV62 = new Map(NPC_IDENTITIES_V62.map(identity => [identity.crewId,
    resolveNpcRoutineV62(identity.crewId, { clock: { day: 1, hour: 12.5 } })]));
  const destination = liftAt(2), occupants = liftDestinationPeersV163(hub, 2)
    .filter(p => p.roomId === destination.roomId && p.x < destination.x + 22 && p.x + p.w > destination.x - 22);
  assert.deepEqual(occupants.map(p => p.crewId).sort(), ['crew-02-tamsin-velez']);
  assert.ok(occupants.every(p => p.mobile === false && p.x === 2350));
  const before = structuredClone(hub.player), resolutions = [...hub.npcRoutineResolutionsV62];
  assert.equal(hub.useLift(-1), false); tick(hub, 2400);
  assert.equal(hub.hubLiftTransitV163.trip, null); assert.equal(hub.state.deck, 3);
  assert.deepEqual(hub.player, before); assert.deepEqual([...hub.npcRoutineResolutionsV62], resolutions);
  hub.interact(); hub.setControl('right', true); assert.equal(hub.interactions, 1); assert.equal(hub.controls, 1);
});

test('detached arrival peers match the shipped life factory annex exclusion and idle spacing before owner overlays', () => {
  for (const hour of [6, 9.5, 12.5, 17.5, 20]) for (let deck = 0; deck < 4; deck++) {
    const resolutions = new Map(NPC_IDENTITIES_V62.map(identity => [identity.crewId,
      resolveNpcRoutineV62(identity.crewId, { clock: { day: 1, hour } })]));
    const hub = { state: { deck: (deck + 1) % 4 }, npcRoutineResolutionsV62: resolutions,
      getSnapshot: () => ({}), createNpcs() { throw new Error('Never transfer live owner/cohort state for a query'); } };
    const context = { npcRoutineResolutionsV62: resolutions, doorStates: sockets(deck) };
    const annexIds = new Set(createAnnexNpcsV141(annexNpcDutiesV141(resolutions, context), resolutions).map(n => n.crewId));
    const expected = spreadNpcStationSpawnsV136(RoutineHubV62.prototype.createNpcs.call(context, deck)
      .filter(n => !annexIds.has(n.crewId)), HUB_DECKS[deck].rooms);
    assert.deepEqual(liftDestinationPeersV163(hub, deck), expected, `${hour}/deck${deck}`);
    assert.equal(hub.npcRoutineResolutionsV62, resolutions); assert.equal(hub.annexNpcCohortV141, undefined);
  }
});

test('E reopens on the source deck if an arrival becomes occupied in transit, including exact Save/resume during return', () => {
  const hub = new NativeTransit(); hub.start(); assert.equal(hub.useLift(1), true);
  const lift = liftAt(2), peer = { crewId: 'crew-01-mara-vega', roomId: lift.roomId, x: lift.x - 22, y: 532 };
  hub.getSnapshot = () => ({ npcServiceRoutesV161: { routes: { occupied: { actor: peer } } } });
  tick(hub, 600); const trip = structuredClone(hub.hubLiftTransitV163.trip), peerOrigin = structuredClone(peer);
  assert.equal(trip.phase, 'travel'); assert.equal(hub.liftBlockedV163, true);
  const x = hub.player.x; hub.interact(); assert.equal(hub.hubLiftTransitV163.trip.phase, 'returning');
  assert.equal(hub.hubLiftTransitV163.trip.fromDeck, trip.fromDeck); assert.equal(hub.hubLiftTransitV163.trip.toDeck, trip.toDeck);
  assert.equal(liftDoorProgressV163(hub.hubLiftTransitV163.trip), 0); tick(hub, 7); hub.persist();
  const save = createDefaultSave(); Object.assign(save.hub, hub.persisted.at(-1));
  const restored = new NativeTransit(); restored.start(migrateSave(JSON.parse(JSON.stringify(save))).hub);
  assert.deepEqual(restored.hubLiftTransitV163, hub.hubLiftTransitV163);
  tick(restored, 120); assert.equal(restored.hubLiftTransitV163.trip, null); assert.equal(restored.state.deck, 1);
  assert.equal(restored.player.x, x); assert.equal(restored.player.y + restored.player.h, 624);
  assert.deepEqual(peer, peerOrigin); restored.setControl('right', true); assert.equal(restored.controls, 1);
  assert.ok(restored.persisted.every(patch => patch.deck === 1));
});

test('a mismatched resumed chart cancels the journey without moving the imported body; Forge keeps its inherited lift', () => {
  const state = create(), hub = new NativeTransit();
  hub.start({ deck: 1, roomId: liftAt(1).roomId, positionX: 120, hubLiftTransitV163: state });
  assert.equal(hub.hubLiftTransitV163.trip, null); assert.equal(hub.player.x, 120);
  const forge = new NativeTransit(); forge.editorPlaytest = true; forge.start(); forge.useLift(1);
  assert.equal(forge.state.deck, 2); assert.equal(forge.hubLiftTransitV163.trip, null);
});

test('E can abandon a blocked cabin approach at its actual floor pose without rewinding or changing decks', () => {
  const hub = new NativeTransit(); hub.start(); const origin = hub.player.x;
  assert.equal(hub.useLift(1), true); tick(hub, 12); const approached = hub.player.x;
  assert.ok(approached > origin); hub.interact();
  assert.equal(hub.hubLiftTransitV163.trip, null); assert.equal(hub.player.x, approached);
  assert.equal(hub.state.deck, 1); assert.equal(hub.player.y + hub.player.h, 624);
  assert.equal(hub.persisted.at(-1).hubLiftTransitV163.trip, null);
  assert.equal(hub.persisted.at(-1).positionX, approached);
});

test('the actual on-screen interact control cancels boarding and reopens a travelling source cabin without admitting movement', () => {
  class ControlsBase extends FixtureBase {
    setControl(...args) { return HubGame.prototype.setControl.apply(this, args); }
  }
  const ControlsTransit = withHubLiftTransitV163(ControlsBase);
  for (const phase of ['boarding', 'travel']) {
    const hub = new ControlsTransit(); hub.start(); assert.equal(hub.useLift(1), true);
    for (let i = 0; i < 900 && hub.hubLiftTransitV163.trip.phase !== phase; i++) tick(hub);
    tick(hub, 2); const before = structuredClone(hub.hubLiftTransitV163), pose = structuredClone(hub.player);
    hub.setControl('right', true); hub.setControl('jump', true); hub.setControl('interact', false);
    assert.equal(hub.keys.size, 0); assert.deepEqual(hub.hubLiftTransitV163, before);
    hub.setControl('interact', true); hub.setControl('interact', false);
    assert.equal(hub.state.deck, 1); assert.equal(hub.player.x, pose.x); assert.equal(hub.player.y, pose.y);
    if (phase === 'boarding') assert.equal(hub.hubLiftTransitV163.trip, null);
    else { assert.equal(hub.hubLiftTransitV163.trip.phase, 'returning'); tick(hub, 120); }
    assert.equal(hub.hubLiftTransitV163.trip, null); assert.equal(hub.state.deck, 1);
    hub.setControl('left', true); assert.ok(hub.keys.has('KeyA')); hub.setControl('left', false); assert.equal(hub.keys.size, 0);
  }
});

test('off-deck occupancy overlays durable owner locations without adopting, cloning or moving their actors', () => {
  const actual = { crewId: 'crew-09-inez-harlow', deck: 2, roomId: 'bioforge', x: 1205, y: 532 };
  const hub = { state: { deck: 1 }, getSnapshot: () => ({ npcAnnexRoutesV163: { routes: { route: { actor: actual } } } }),
    createNpcs() { throw new Error('mutating owner builder'); } };
  const before = structuredClone(actual), peers = liftDestinationPeersV163(hub, 2);
  assert.equal(peers.some(p => p.crewId === actual.crewId), false); assert.deepEqual(actual, before);
  actual.roomId = 'quarantine'; const main = liftDestinationPeersV163(hub, 2).find(p => p.crewId === actual.crewId);
  assert.equal(main.x, actual.x); assert.equal(main.w, 44); assert.notEqual(main, actual);
});

test('live route and courtesy bodies have no deck field: their real room still reserves a destination socket', () => {
  const lift = liftAt(2), body = { crewId: 'crew-09-inez-harlow', roomId: lift.roomId, x: lift.x - 22, y: 532, w: 44, h: 92 };
  const courtesy = { crewId: 'crew-02-cal-rooke', roomId: lift.roomId, x: lift.x + 120, y: 532, w: 44, h: 92 };
  const hub = { state: { deck: 1 }, getNpcServiceActorV161: () => null, getNpcMedicalActorV162: () => null,
    getNpcAnnexServiceActorsV163: () => [body], getNpcServiceTrafficActorsV163: () => [courtesy],
    getSnapshot() { throw new Error('Live owners must not use a snapshot or rebuild'); } };
  const peers = liftDestinationPeersV163(hub, 2);
  assert.equal(peers.find(p => p.crewId === body.crewId).x, body.x);
  assert.equal(peers.find(p => p.crewId === courtesy.crewId).x, courtesy.x);
  assert.equal(peers.filter(p => p.crewId === body.crewId).length, 1);
});

test('occlusion uses the rendered156px recess, never the larger interaction socket or a differently sized paired face', () => {
  const door = liftAt(1), width = 156 * 187 / 191;
  const target = { x: door.x - width / 2, y: 624 - 156, w: width, h: 156 };
  const hub = { hubSpatialLiftsV136: new Map([[door.id, { target }]]) };
  for (const p of [0, .5, 1]) {
    const m = getLiftOcclusionV163(hub, door, p); assert.deepEqual(m.target, target);
    assert.equal(m.target.y + m.target.h, 624); assert.equal(m.visibleWidth, p * m.opening.w);
  }
  assert.equal(liftPhaseDurationV163({ phase: 'travel', fromDeck: 1, toDeck: 2, reducedMotion: true }), .24);
});
