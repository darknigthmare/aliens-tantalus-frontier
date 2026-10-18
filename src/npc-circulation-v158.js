import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from './hub-game.js';
import { buildHubDoorNetworkV58 } from './topology-coherence-v58.js';
import { buildNpcPhysicalRouteV62 } from './npc-dialogue-v62.js';
import { getNpcRoutineStandingAnchorV158, resolveNpcWaypointAnchorV62 } from './hub-v62-runtime.js';
import { HubGame as RosterHubV52 } from './hub-v52-runtime.js';
import { advanceNpcLifeV136, moveNpcAgainstGeometryV136 } from './npc-life-v136.js';
import { getHubBulkheadColliderV134 } from './hub-bulkhead-depth-v134.js';
import { annexNpcDutiesV141 } from './hub-annex-npc-life-v141.js';

const CREW_ID = 'crew-14-echo-a';
const ROOM_IDS = Object.freeze(['briefing', 'combat-information']);
const CENTRAL_ID = 'command:hub-central-bulkhead';
const ROOMS = HUB_DECKS[0].rooms.filter(room => ROOM_IDS.includes(room.id));
const finite = value => typeof value === 'number' && Number.isFinite(value);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const modes = ['travel', 'service', 'suspended'];
const phases = ['station', 'work', 'break'];
const reasons = ['daily-schedule', 'active-crisis', 'infestation', 'mission-assignment', 'medical-recovery', 'unavailable'];
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const overlapsLeaf = (actor, door) => {
  const box = getHubBulkheadColliderV134(door);
  return actor && actor.alive !== false && actor.x < box.x + box.w && actor.x + actor.w > box.x
    && actor.y < box.y + box.h && actor.y + actor.h > box.y;
};

export const HUB_NPC_CIRCULATION_V158 = Object.freeze({ schema: 158, crewId: CREW_ID, deck: 0,
  roomIds: ROOM_IDS, doorId: CENTRAL_ID, source: 'native-v62-routine-and-v58-door-network',
  maximumSpeed: 27, acceleration: 92, actorWidth: 44, actorHeight: 92,
  excluded: Object.freeze(['lift-transit', 'annex-transit', 'other-crew-identities']) });

/** Only actual bounded ship coordinates are durable. The historical V62
 * routine ledger remains an intention ledger, not a claim of completed travel. */
export function normalizeNpcCirculationV158(value) {
  const empty = { schema: 158, actor: null };
  const a = value?.schema === 158 && value.actor;
  if (!a || a.crewId !== CREW_ID || a.deck !== 0 || !ROOM_IDS.includes(a.roomId)
    || !ROOM_IDS.includes(a.fromRoomId) || !ROOM_IDS.includes(a.targetRoomId)
    || !phases.includes(a.targetPhase) || !modes.includes(a.mode)
    || ![a.x, a.y, a.velocity, a.time, a.distance].every(finite)
    || a.x < ROOMS[0].xStart + 24 || a.x + 44 > ROOMS[1].xEnd - 24
    || a.y !== HUB_WORLD.floorY - 92 || Math.abs(a.velocity) > 27.000001
    || a.time < 0 || a.time > 1e9 || a.distance < 0 || a.distance > 1e9
    || !Number.isInteger(a.waypointIndex) || a.waypointIndex < 0 || a.waypointIndex > 6
    || !Number.isInteger(a.arrivals) || a.arrivals < 0 || a.arrivals > 1e6
    || ![-1, 1].includes(a.facing)
    || !finite(a.doorProgress ?? 0) || (a.doorProgress ?? 0) < 0 || (a.doorProgress ?? 0) > 1) return empty;
  // During the crossing either old side is admissible; outside the actual
  // leaf a save cannot label a body as standing in the other compartment.
  if (a.x + 44 <= 2552 && a.roomId !== 'briefing'
    || a.x >= 2568 && a.roomId !== 'combat-information') return empty;
  const pathLength = a.fromRoomId === a.targetRoomId ? 1 : 5;
  if (a.waypointIndex > pathLength || a.mode === 'travel' && a.waypointIndex === pathLength
    || a.mode === 'service' && a.roomId !== a.targetRoomId
    || a.targetRoomId === 'briefing' && a.targetPhase !== 'work'
    || a.targetRoomId === 'combat-information' && !['station', 'break'].includes(a.targetPhase)) return empty;
  if (a.x < 2568 && a.x + 44 > 2552 && (a.doorProgress ?? 0) < .82) return empty;
  return { schema: 158, actor: { crewId: CREW_ID, deck: 0, roomId: a.roomId,
    x: a.x, y: a.y, facing: a.facing, velocity: a.velocity,
    fromRoomId: a.fromRoomId, targetRoomId: a.targetRoomId, targetPhase: a.targetPhase,
    waypointIndex: a.waypointIndex, mode: a.mode,
    reason: reasons.includes(a.reason) ? a.reason : 'unavailable',
    time: a.time, distance: a.distance, arrivals: a.arrivals, doorProgress: a.doorProgress ?? 0 } };
}

function desiredPost(resolution) {
  const roomId = resolution?.phase === 'route' ? resolution.toRoomId : resolution?.roomId;
  if (!ROOM_IDS.includes(roomId)) return null;
  const phase = resolution.phase === 'route'
    ? resolution.hour >= 21 ? 'station' : roomId === resolution.schedule?.workRoomId ? 'work' : 'break'
    : phases.includes(resolution.phase) ? resolution.phase : 'station';
  return { roomId, phase };
}

export function npcCirculationInterruptionV158(resolution, actor) {
  if (!resolution || actor?.alive === false || actor?.downed) return 'unavailable';
  if (resolution.alert) return resolution.reason === 'active-crisis' ? 'active-crisis' : 'infestation';
  if (resolution.missionAssigned) return 'mission-assignment';
  if (resolution.needsCare) return 'medical-recovery';
  return desiredPost(resolution) ? null : 'unavailable';
}

export function createNpcCirculationStateV158(actor, resolution) {
  if (actor?.crewId !== CREW_ID || !ROOM_IDS.includes(actor.roomId)) return null;
  const post = desiredPost(resolution) || { roomId: actor.roomId, phase: 'station' };
  const anchor = getNpcRoutineStandingAnchorV158(CREW_ID, post.roomId, post.phase);
  return normalizeNpcCirculationV158({ schema: 158, actor: { crewId: CREW_ID, deck: 0,
    roomId: actor.roomId, x: actor.x, y: actor.y, facing: actor.facing === -1 ? -1 : 1, velocity: 0,
    fromRoomId: actor.roomId, targetRoomId: post.roomId, targetPhase: post.phase, waypointIndex: 0,
    mode: actor.roomId === post.roomId && Math.abs(actor.x - anchor) < .4 ? 'service' : 'travel',
    reason: 'daily-schedule', time: 0, distance: 0, arrivals: 0, doorProgress: 0 } }).actor;
}

/** These are the existing authored V62 waypoints, resolved against the real
 * V58 bulkhead. Departure uses the actor's current feet, never a sampled pose. */
export function npcCirculationPathV158(state, doors) {
  if (!state) return [];
  const route = buildNpcPhysicalRouteV62(state.fromRoomId, state.targetRoomId);
  if (!route || route.crossesDecks) return [];
  const points = route.waypoints.filter(point => point.kind === 'corridor' || point.kind === 'door').map(point => {
    const anchor = resolveNpcWaypointAnchorV62(point, { deckIndex: 0, doorStates: doors, crewId: CREW_ID });
    if (!anchor || point.kind === 'door' && !doors.some(door => door.id === CENTRAL_ID)) return null;
    return { id: point.id, x: anchor.x, roomId: point.roomId,
      ...(point.kind === 'door' ? { doorId: CENTRAL_ID, side: point.side } : {}) };
  });
  if (points.some(point => point === null)) return [];
  points.push({ id: `post:${state.targetRoomId}:${state.targetPhase}`,
    x: getNpcRoutineStandingAnchorV158(CREW_ID, state.targetRoomId, state.targetPhase), roomId: state.targetRoomId });
  return points;
}

function replan(state, post) {
  return { ...state, fromRoomId: state.roomId, targetRoomId: post.roomId, targetPhase: post.phase,
    waypointIndex: 0, mode: 'travel', velocity: 0 };
}

/** Horizontal walking on the unchanged native rail: capped real delta,
 * acceleration, braking, swept solid contacts and whole-body peer clearance.
 * A blocked route waits; it never reverses into a patrol or skips a node. */
export function advanceNpcCirculationV158(previous, actor, delta, {
  resolution, doors = [], colliders = [], peers = [], running = true
} = {}) {
  if (!previous || !actor || !running || !finite(delta) || delta <= 0) return previous;
  const dt = Math.min(delta, .1), originalX = actor.x;
  let state = { ...previous, x: actor.x, y: actor.y, facing: actor.facing === -1 ? -1 : 1,
    time: Math.min(1e9, previous.time + dt),
    doorProgress: doors.find(door => door.id === CENTRAL_ID)?.progress ?? previous.doorProgress ?? 0 };
  const interrupted = npcCirculationInterruptionV158(resolution, actor);
  if (interrupted || actor.workClock > 0 || actor.supportClock > 0) {
    return { ...state, velocity: 0, actualVelocity: 0, mode: interrupted ? 'suspended' : state.mode,
      reason: interrupted || 'daily-schedule' };
  }
  const post = desiredPost(resolution);
  if (state.targetRoomId !== post.roomId || state.targetPhase !== post.phase || state.mode === 'suspended') state = replan(state, post);
  state.reason = 'daily-schedule';
  if (state.mode === 'service') return { ...state, velocity: 0, actualVelocity: 0 };
  const path = npcCirculationPathV158(state, doors);
  if (!path.length) return { ...state, mode: 'suspended', reason: 'unavailable', velocity: 0, actualVelocity: 0 };
  // Already passed corridor centres do not force a detour back through the
  // same room. Door approach/crossing points still require actual contact.
  const destination = path.at(-1).x, directionToPost = Math.sign(destination - state.x);
  while (state.waypointIndex < path.length - 1 && !path[state.waypointIndex].doorId
    && directionToPost * (path[state.waypointIndex].x - state.x) < -.4) state.waypointIndex++;
  let target = path[state.waypointIndex];
  if (!target) return { ...state, mode: 'suspended', reason: 'unavailable', velocity: 0, actualVelocity: 0 };
  const physicalPeers = peers.filter(peer => peer && peer !== actor && peer.crewId !== CREW_ID && peer.alive !== false
    && [peer.x, peer.y, peer.w, peer.h].every(finite) && Math.abs(peer.y + peer.h - actor.y - actor.h) < 16);
  const boxes = [...colliders, ...doors.filter(door => !door.lift && door.blocking !== false && door.progress < .82)
    .map(door => getHubBulkheadColliderV134(door)),
  ...physicalPeers.map(peer => ({ x: peer.x - 12, y: peer.y, w: peer.w + 24, h: peer.h }))];
  let x = state.x, blocked = false;
  for (let remaining = dt; remaining > 1e-8;) {
    const step = Math.min(1 / 120, remaining); remaining -= step;
    const distance = Math.abs(target.x - x), direction = Math.sign(target.x - x);
    let speed = Math.min(27, Math.sqrt(2 * 92 * Math.max(0, distance - .1)));
    for (const peer of physicalPeers) {
      if (direction * (peer.x + peer.w / 2 - x - actor.w / 2) <= 0) continue;
      const gap = direction > 0 ? peer.x - x - actor.w - 12 : x - peer.x - peer.w - 12;
      speed = Math.min(speed, Math.sqrt(2 * 92 * Math.max(0, gap - .2)));
    }
    const wanted = direction * speed;
    const velocity = state.velocity + clamp(wanted - state.velocity, -92 * step, 92 * step);
    const proposed = clamp(x + (state.velocity + velocity) * .5 * step,
      Math.min(x, target.x), Math.max(x, target.x));
    const contact = moveNpcAgainstGeometryV136({ ...actor, x }, proposed, boxes);
    x = contact.x; blocked ||= contact.blocked; state.velocity = contact.blocked ? 0 : velocity;
    if (Math.abs(target.x - x) < .25 && Math.abs(state.velocity) < 3) {
      state.velocity = 0; state.waypointIndex++;
      if (state.waypointIndex >= path.length) {
        state.mode = 'service'; state.arrivals = Math.min(1e6, state.arrivals + 1); break;
      }
      target = path[state.waypointIndex];
    }
  }
  state.x = x; state.distance = Math.min(1e9, state.distance + Math.abs(x - originalX));
  state.actualVelocity = (x - originalX) / dt;
  if (Math.abs(state.actualVelocity) > .1) state.facing = Math.sign(state.actualVelocity);
  const leaf = doors.find(door => door.id === CENTRAL_ID);
  if (leaf && x >= leaf.x + 8) state.roomId = 'combat-information';
  else if (leaf && x + actor.w <= leaf.x - 8) state.roomId = 'briefing';
  state.blocked = blocked;
  return state;
}

export function withHubNpcCirculationV158(Base) {
  return class HubNpcCirculationV158 extends Base {
    start(hubState = {}, options = {}) {
      this.npcCirculationSandboxV158 = Boolean(options.editorProject || options.forgeJourneyV141 || this.forgeSessionV141);
      this.npcCirculationStateV158 = this.npcCirculationSandboxV158 ? null : normalizeNpcCirculationV158(hubState.npcCirculationV158).actor;
      this.npcCirculationActorV158 = null;
      this.npcCirculationCommandPeersV158 = [];
      this.npcCirculationDoorsV158 = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, 0).map(door => ({ ...door }));
      const result = super.start(hubState, options);
      this.syncNpcCirculationDoorsV158();
      const leaf = this.npcCirculationDoorsV158.find(door => door.id === CENTRAL_ID);
      if (leaf && this.npcCirculationStateV158) leaf.progress = this.npcCirculationStateV158.doorProgress;
      this.draw?.();
      return result;
    }

    createNpcs(deck) {
      const natives = super.createNpcs(deck);
      if (this.npcCirculationSandboxV158 || this.editorPlaytest || this.forgeSessionV141) return natives;
      const resolution = this.npcRoutineResolutionsV62?.get(CREW_ID);
      const duty = annexNpcDutiesV141(this.npcRoutineResolutionsV62, this).some(duty => duty.crewId === CREW_ID);
      if (duty) {
        // The historical annex watch is still a conditional assignment. It is
        // explicitly outside this circuit, with no hidden parent duplicate.
        this.npcCirculationActorV158 = null; this.npcCirculationStateV158 = null; return natives;
      }
      if (!this.npcCirculationActorV158) {
        let sources = natives;
        if (deck !== 0) {
          const visibleDoors = this.doorStates;
          this.doorStates = this.npcCirculationDoorsV158 || buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, 0);
          try { sources = super.createNpcs(0); } finally { this.doorStates = visibleDoors; }
          this.npcCirculationCommandPeersV158 = sources.filter(actor => actor.crewId !== CREW_ID);
        }
        const source = sources.find(actor => actor.crewId === CREW_ID && ROOM_IDS.includes(actor.roomId));
        const saved = this.npcCirculationStateV158;
        if (source || saved) {
          const template = source || RosterHubV52.prototype.createNpcs.call(this, 0).find(actor => actor.crewId === CREW_ID);
          this.npcCirculationActorV158 = { ...template, ...(saved ? { x: saved.x, y: saved.y,
            roomId: saved.roomId, facing: saved.facing, vx: 0 } : {}) };
          this.npcCirculationStateV158 ||= createNpcCirculationStateV158(this.npcCirculationActorV158, resolution);
        }
      }
      const actor = this.npcCirculationActorV158;
      if (!actor || !this.npcCirculationStateV158) return natives;
      this.refreshNpcCirculationIntentV158(resolution);
      if (deck === 0) {
        this.syncNpcCirculationDoorsV158();
        this.npcCirculationCommandPeersV158 = natives.filter(native => native.crewId !== CREW_ID);
      }
      return [...natives.filter(native => native.crewId !== CREW_ID), ...(deck === 0 ? [actor] : [])];
    }

    refreshNpcCirculationIntentV158(resolution = this.npcRoutineResolutionsV62?.get(CREW_ID)) {
      const actor = this.npcCirculationActorV158;
      if (!actor || !resolution) return;
      Object.assign(actor, { routinePhaseV62: resolution.phase, routineReasonV62: resolution.reason,
        routineRouteV62: clone(resolution.route), routineRouteProgressV62: resolution.routeProgress,
        routineDeterministicKeyV62: resolution.deterministicKey, alerted: Boolean(resolution.alert),
        mobile: false, min: actor.x, max: actor.x });
    }

    setNpcRoutineContextV62(context = {}, options = {}) {
      const result = super.setNpcRoutineContextV62(context, { ...options, persist: false });
      this.refreshNpcCirculationIntentV158();
      if (options.persist !== false && this.state && this.player) this.persist();
      return result;
    }

    hubNpcBulkheadDemandV158(door) {
      const actor = this.npcCirculationActorV158;
      const locked = this.hubTrainingV132?.lockedDoorIds?.includes(door.id);
      return Boolean(actor && door.id === CENTRAL_ID && Math.abs(actor.x + actor.w / 2 - door.x) < 182
        && (!locked || overlapsLeaf(actor, door)));
    }

    syncNpcCirculationDoorsV158() {
      // Native duct exits replace their door array after createNpcs. Bind by
      // the actual command-door identity on the next owning tick, even when
      // the player's exit remains on the same deck.
      if (this.npcCirculationSandboxV158 || this.state?.deck !== 0
        || !this.doorStates?.some(door => door.id === CENTRAL_ID)) return;
      if (this.npcCirculationDoorsV158 === this.doorStates) return;
      for (const door of this.doorStates) {
        const previous = this.npcCirculationDoorsV158?.find(entry => entry.id === door.id);
        if (previous) door.progress = previous.progress;
      }
      this.npcCirculationDoorsV158 = this.doorStates;
    }

    stepHubNpcLifeV136(actor, delta, options) {
      if (actor === this.npcCirculationActorV158) return; // exactly one owning tick below
      return super.stepHubNpcLifeV136(actor, delta, options);
    }

    update(delta) {
      this.syncNpcCirculationDoorsV158();
      const wasRunning = this.running;
      const beforeActor = this.npcCirculationActorV158;
      const clocks = beforeActor && Object.fromEntries(['workClock', 'supportClock', 'alertClock']
        .map(key => [key, finite(beforeActor[key]) ? beforeActor[key] : 0]));
      const result = super.update(delta);
      if (!wasRunning || !this.running || this.npcCirculationSandboxV158 || !finite(delta) || delta <= 0) return result;
      const actor = this.npcCirculationActorV158, previous = this.npcCirculationStateV158;
      if (!actor || !previous) return result;
      this.syncNpcCirculationDoorsV158();
      const doors = this.npcCirculationDoorsV158 || [], dt = Math.min(delta, .1);
      if (actor === beforeActor) for (const [key, value] of Object.entries(clocks)) {
        // The parent loop, annex parent tick and off-deck path share one clock
        // owner. Preserve newly triggered holds, but never subtract twice.
        actor[key] = finite(actor[key]) && actor[key] > value ? actor[key] : Math.max(0, value - dt);
      }
      // The active parent loop already updates these very leaves. In an annex,
      // a duct or another deck, advance only the real command-deck leaf state.
      const nativeDoorsTicked = this.state?.deck === 0 && !this.isAnnexActiveV71?.() && !this.annexTransitionV71;
      if (!nativeDoorsTicked) for (const door of doors) {
        const target = this.hubNpcBulkheadDemandV158(door) ? 1 : 0;
        door.progress += (target - door.progress) * Math.min(1, dt * (this.reducedMotion ? 14 : 7));
      }
      const peers = this.state?.deck === 0 ? this.npcs || [] : this.npcCirculationCommandPeersV158 || [];
      for (const door of doors) if (this.hubTrainingV132?.lockedDoorIds?.includes(door.id)) {
        // Security remains authoritative off camera too. A body already in
        // the threshold reserves the opening until it physically clears it.
        const occupied = [actor, ...peers].some(person => overlapsLeaf(person, door));
        door.progress = occupied ? Math.max(.82, door.progress) : 0;
      }
      const resolution = this.npcRoutineResolutionsV62?.get(CREW_ID);
      let next = advanceNpcCirculationV158(previous, actor, dt, { resolution, doors,
        colliders: buildHubObstacleGeometryV87(0), peers });
      Object.assign(actor, { x: next.x, y: next.y, roomId: next.roomId, facing: next.facing,
        vx: next.actualVelocity || 0 });
      if (next.mode === 'service' && !npcCirculationInterruptionV158(resolution, actor)) {
        const room = ROOMS.find(room => room.id === actor.roomId);
        const life = advanceNpcLifeV136(actor.lifeV136, actor, dt, { room, peers,
          context: `circulation-service:${next.targetRoomId}:${next.targetPhase}`, colliders: buildHubObstacleGeometryV87(0),
          reducedMotion: this.reducedMotion });
        if (life) {
          actor.lifeV136 = life; Object.assign(actor, { x: life.x, vx: life.actualVelocity, facing: life.facing });
          next = { ...next, x: actor.x, facing: actor.facing, velocity: 0,
            distance: Math.min(1e9, next.distance + Math.abs(actor.x - next.x)) };
        }
      } else {
        actor.lifeV136 = { schema: 136, context: 'circulation-v158', x: actor.x, y: actor.y,
          time: next.time, velocity: next.velocity, actualVelocity: actor.vx, facing: actor.facing,
          mode: next.mode === 'suspended' ? 'alert' : Math.abs(actor.vx) > .1 ? 'moving' : next.blocked ? 'blocked' : 'idle',
          passive: null, previousPassive: null, blend: 1 };
      }
      this.npcCirculationStateV158 = next;
      if (this.state?.deck !== 0 || this.isAnnexActiveV71?.()) {
        this.sampleNpcAnimation?.(actor, { emit: false, discardEvents: true });
      }
      return result;
    }

    persist() {
      const original = this.onPersist;
      let patch;
      this.onPersist = value => { patch = value; };
      try { super.persist(); } finally { this.onPersist = original; }
      if (patch) original({ ...patch, npcCirculationV158: normalizeNpcCirculationV158({ schema: 158, actor: this.npcCirculationStateV158 }) });
    }

    getSnapshot() {
      return { ...super.getSnapshot(), npcCirculationV158: { ...normalizeNpcCirculationV158({ schema: 158,
        actor: this.npcCirculationStateV158 }),
      doors: (this.npcCirculationDoorsV158 || []).filter(door => door.id === CENTRAL_ID).map(door => ({
        id: door.id, x: door.x, progress: door.progress, demandedBy: this.hubNpcBulkheadDemandV158(door) ? CREW_ID : null })) } };
    }
  };
}
