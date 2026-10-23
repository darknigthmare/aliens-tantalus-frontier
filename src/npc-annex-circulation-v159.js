import { HUB_DECKS, HUB_WORLD, buildHubObstacleGeometryV87 } from './hub-game.js';
import { HubGame as RosterHubV52 } from './hub-v52-runtime.js';
import { getNpcRoutineStandingAnchorV158 } from './hub-v62-runtime.js';
import { HUB_ANNEX_BY_ID_V137 } from './hub-annex-registry-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from './hub-annex-runtime-geometry-v139.js';
import { getHubDoorDestinationDescriptorsV138 } from './hub-destination-signage-v138.js';
import { annexNpcDutiesV141, createAnnexNpcsV141, getAnnexNpcPlacementV141 } from './hub-annex-npc-life-v141.js';
import { getHubDoorFaceV142, projectHubDoorActorV142 } from './hub-door-passage-v142.js';
import { advanceNpcLifeV136, moveNpcAgainstGeometryV136, spreadNpcStationSpawnsV136 } from './npc-life-v136.js';
import { getHubRoomPresentationV119 } from './hub-room-presentation-v119.js';
import { drawHumanAtlasV133 } from './human-visual-contract-v133.js';
import { CREW_SPRITE_IDS, CREW_MISSION_SPRITE_IDS, resolveSpriteClip } from './sprite-animation-runtime.js';

// V161 composition may place additional route owners outside this wrapper.
const handoffRebuildV161 = Symbol('bishop-annex-handoff-rebuild');
const ID = 'crew-05-bishop-9', PARENT = 'science-lab', ANNEX = 'synthetic-bay', DECK = 1;
const parent = HUB_DECKS[DECK].rooms.find(room => room.id === PARENT);
const annex = getHubAnnexRuntimeGeometryV139(HUB_ANNEX_BY_ID_V137[ANNEX]);
const descriptor = getHubDoorDestinationDescriptorsV138(parent).find(door => door.destinationId === ANNEX);
const parentFace = getHubDoorFaceV142(descriptor.socket, { ...annex.entrance, x: annex.entranceLocalX - annex.entrance.w / 2 }, annex.art.alphaBounds.door);
const localFace = getHubDoorFaceV142({ ...annex.entrance, x: annex.entranceLocalX - annex.entrance.w / 2 }, descriptor.socket, annex.art.alphaBounds.door);
const faces = { [PARENT]: parentFace, [ANNEX]: localFace };
const finite = Number.isFinite;
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const stages = ['walking', 'service', 'opening', 'covering', 'revealing'];
const reasons = ['daily-schedule', 'active-crisis', 'infestation', 'mission-assignment', 'medical-recovery', 'unavailable', 'interaction', 'occupied'];
const crossing = state => ['opening', 'covering', 'revealing'].includes(state?.stage);
const inDoorway = actor => {
  const opening = actor && faces[actor.roomId]?.opening;
  return Boolean(opening && actor.x <= opening.x + opening.w + 12
    && actor.x + (actor.w || 44) >= opening.x - 12);
};
const socketX = roomId => faces[roomId].opening.x + faces[roomId].opening.w / 2 - 22;
const homeTemplate = () => {
  const actor = RosterHubV52.prototype.createNpcs.call({}, DECK).find(npc => npc.crewId === ID);
  // BISHOP's station/break is the laboratory. His work is quarantine, so a
  // computed "laboratory work" anchor must never become a fabricated duty.
  return spreadNpcStationSpawnsV136([{ ...actor, mobile: false,
    x: getNpcRoutineStandingAnchorV158(ID, PARENT, 'station') }], [parent])[0];
};

export const HUB_NPC_ANNEX_CIRCULATION_V159 = Object.freeze({ schema: 159, crewId: ID, deck: DECK,
  parentRoomId: PARENT, annexRoomId: ANNEX, connectionId: descriptor.connectionId,
  maximumSpeed: 27, acceleration: 92, actorWidth: 44, actorHeight: 92,
  openingSeconds: .42, coveringSeconds: .65, reducedDoorSeconds: .12,
  crossingPolicy: 'paired-airlock-covered-coordinate-handoff',
  source: 'native-v52-actor-v157-watch-v138-sockets-v142-paired-doors',
  excluded: Object.freeze(['quarantine-laboratory-transit', 'lift-transit', 'other-annex-routes', 'new-back-view-art']) });

/** Strict actual coordinates and finite native door phases, never the old
 * timetable's sampled room pose. Historical V158/ECHO state is untouched. */
export function normalizeNpcAnnexCirculationV159(value) {
  const rawHandoff = value?.schema === 159 && value.nativeHandoff;
  const nativeHandoff = rawHandoff?.crewId === ID && [PARENT, ANNEX].includes(rawHandoff.fromRoomId)
    && HUB_DECKS.some(deck => deck.rooms.some(room => room.id === rawHandoff.toRoomId))
    && reasons.includes(rawHandoff.reason) && rawHandoff.observedTravel === false
    ? { crewId: ID, fromRoomId: rawHandoff.fromRoomId, toRoomId: rawHandoff.toRoomId,
      reason: rawHandoff.reason, observedTravel: false, owner: 'native-v62-routine' } : null;
  const empty = { schema: 159, actor: null, nativeHandoff }, a = value?.schema === 159 && value.actor;
  if (!a || a.crewId !== ID || a.deck !== DECK || ![PARENT, ANNEX].includes(a.roomId)
    || ![PARENT, ANNEX].includes(a.targetRoomId) || !stages.includes(a.stage)
    || ![a.x, a.y, a.homeX, a.dutyX, a.velocity, a.time, a.distance, a.doorProgress].every(finite)
    || a.y !== 532 || a.homeX < parent.xStart + 96 || a.homeX > parent.xEnd - 140
    || a.dutyX < 24 || a.dutyX > annex.world.width - 68
    || a.x < (a.roomId === PARENT ? parent.xStart + 24 : 24)
    || a.x > (a.roomId === PARENT ? parent.xEnd - 68 : annex.world.width - 68)
    || Math.abs(a.velocity) > 27.000001 || ![-1, 1].includes(a.facing)
    || a.time < 0 || a.time > 1e9 || a.distance < 0 || a.distance > 1e9
    || a.doorProgress < 0 || a.doorProgress > 1
    || !Number.isInteger(a.crossings) || a.crossings < 0 || a.crossings > 1e6
    || !Number.isInteger(a.arrivals) || a.arrivals < 0 || a.arrivals > 1e6
    || ![PARENT, ANNEX].includes(a.admittedRoomId)) return empty;
  const dutyPlan = getAnnexNpcPlacementV141(ANNEX, ID);
  if (!dutyPlan?.rails.some(rail => a.dutyX >= rail.min && a.dutyX <= rail.max)
    || overlap({ x: a.homeX, y: 532, w: 44, h: 92 }, { ...descriptor.socket, x: descriptor.socket.x - 12, w: descriptor.socket.w + 24 })) return empty;
  if (a.stage === 'service' && Math.abs(a.x - (a.roomId === ANNEX ? a.dutyX : a.homeX)) > .26) return empty;
  if (crossing(a) && (Math.abs(a.x - socketX(a.roomId)) > .26 || a.velocity !== 0)
    || ['opening', 'covering'].includes(a.stage) && a.roomId === a.targetRoomId
    || a.stage === 'revealing' && a.roomId !== a.targetRoomId
    || a.stage === 'service' && a.roomId !== a.targetRoomId) return empty;
  return { schema: 159, nativeHandoff: null, actor: { crewId: ID, deck: DECK, roomId: a.roomId, x: a.x, y: a.y,
    homeX: a.homeX, dutyX: a.dutyX, targetRoomId: a.targetRoomId, stage: a.stage,
    velocity: a.velocity, facing: a.facing, doorProgress: a.doorProgress,
    time: a.time, distance: a.distance, crossings: a.crossings, arrivals: a.arrivals,
    admittedRoomId: a.admittedRoomId, reason: reasons.includes(a.reason) ? a.reason : 'unavailable' } };
}

export function npcAnnexInterruptionV159(resolution, actor) {
  if (!resolution || actor?.alive === false || actor?.downed) return 'unavailable';
  if (resolution.alert) return resolution.reason === 'active-crisis' ? 'active-crisis' : 'infestation';
  if (resolution.missionAssigned) return 'mission-assignment';
  if (resolution.needsCare) return 'medical-recovery';
  return null;
}

export function createNpcAnnexCirculationStateV159(actor, dutyActor) {
  if (actor?.crewId !== ID || ![PARENT, ANNEX].includes(actor.roomId) || !dutyActor) return null;
  return normalizeNpcAnnexCirculationV159({ schema: 159, actor: { crewId: ID, deck: DECK,
    roomId: actor.roomId, x: actor.x, y: actor.y, homeX: actor.roomId === PARENT ? actor.x : homeTemplate().x,
    dutyX: dutyActor.x, targetRoomId: actor.roomId, stage: 'service', velocity: 0,
    facing: actor.facing === -1 ? -1 : 1, doorProgress: 0, time: 0, distance: 0,
    crossings: 0, arrivals: 0, admittedRoomId: actor.roomId, reason: 'daily-schedule' } }).actor;
}

export function npcAnnexDoorPassageV159(actor, destinationRoomId, { peers = [], player = null } = {}) {
  const source = actor.roomId, local = destinationRoomId === ANNEX;
  if (source === destinationRoomId || !faces[source] || !faces[destinationRoomId]) return null;
  const sourcePeers = peers.filter(n => n !== actor && n.crewId !== ID && n.alive !== false && n.roomId === source);
  if (player?.roomId === source && player.alive !== false) sourcePeers.push(player);
  if (sourcePeers.some(body => overlap(actor, body))) return null;
  const occupied = peers.filter(n => n !== actor && n.crewId !== ID && n.alive !== false && n.roomId === destinationRoomId);
  if (player?.roomId === destinationRoomId && player.alive !== false) occupied.push(player);
  return projectHubDoorActorV142(actor, faces[source], faces[destinationRoomId], {
    bounds: { x: local ? 24 : parent.xStart + 24, y: 0,
      w: local ? annex.world.width - 48 : parent.xEnd - parent.xStart - 48, h: 720 },
    surfaces: local ? annex.platforms : [{ x: parent.xStart, y: 624, w: parent.xEnd - parent.xStart, h: 96 }],
    solids: local ? annex.colliders : buildHubObstacleGeometryV87(DECK), occupied
  });
}

/** Whole-body floor walking spends actual horizontal distance. A rear portal
 * has a separate, durable door cycle: only a fully covering leaf may change
 * coordinate charts. It cannot manufacture gait, distance, rewards or events. */
export function advanceNpcAnnexCirculationV159(previous, actor, delta, {
  resolution, duty = false, peers = [], player = null, portalBusy = false, running = true,
  reducedMotion = false, colliders = actor?.roomId === ANNEX ? annex.colliders : buildHubObstacleGeometryV87(DECK)
} = {}) {
  if (!previous || !actor || !running || !finite(delta) || delta <= 0) return previous;
  const dt = Math.min(delta, .1), originalX = actor.x;
  let s = { ...previous, x: actor.x, y: actor.y, time: Math.min(1e9, previous.time + dt), actualVelocity: 0, blocked: false };
  const interruption = npcAnnexInterruptionV159(resolution, actor);
  const emergency = interruption === 'active-crisis' || interruption === 'infestation';
  const clearingDoor = emergency && (crossing(s) || s.doorProgress > 0 || inDoorway(actor));
  if (!clearingDoor && (interruption || actor.workClock > 0 || actor.supportClock > 0)) return { ...s, velocity: 0,
    reason: interruption || 'interaction' };
  // An emergency cannot leave a frozen body owning both faces indefinitely.
  // Reopen its current leaf, withdraw on the real floor in the same chart,
  // then close only after the whole body clears the opening. Merely dropping
  // the reservation would instead allow a player to pass through that body.
  if (clearingDoor && s.stage !== 'revealing' && crossing(s))
    s = { ...s, targetRoomId: s.roomId, stage: 'revealing' };
  const targetRoomId = clearingDoor ? s.roomId : duty ? ANNEX : PARENT;
  // A committed cycle finishes before a changed timetable can reverse it.
  // Emergency withdrawal above cancels it without changing coordinate charts.
  if (!crossing(s) && targetRoomId !== s.targetRoomId) s = { ...s, targetRoomId, stage: 'walking', velocity: 0 };
  s.reason = interruption || 'daily-schedule';
  const doorDuration = stage => reducedMotion ? .12 : stage === 'covering' ? .65 : .42;
  if (crossing(s)) {
    if (s.stage === 'opening') {
      if (portalBusy || !npcAnnexDoorPassageV159(actor, s.targetRoomId, { peers, player })) return { ...s, reason: 'occupied' };
      s.doorProgress = Math.min(1, s.doorProgress + dt / doorDuration(s.stage));
      if (s.doorProgress >= 1) s.stage = 'covering';
    } else if (s.stage === 'covering') {
      if (portalBusy || !npcAnnexDoorPassageV159(actor, s.targetRoomId, { peers, player })) return { ...s, reason: 'occupied' };
      s.doorProgress = Math.max(0, s.doorProgress - dt / doorDuration(s.stage));
      if (s.doorProgress === 0) {
        const passage = !portalBusy && npcAnnexDoorPassageV159(actor, s.targetRoomId, { peers, player });
        if (!passage) return { ...s, reason: 'occupied' };
        // The only coordinate-chart handoff. It occurs behind a fully closed
        // native leaf, at the same measured aperture offset and supported feet.
        Object.assign(s, { x: passage.arrival.x, y: passage.arrival.y, roomId: s.targetRoomId,
          stage: 'revealing', crossings: Math.min(1e6, s.crossings + 1) });
      }
    } else {
      const occupants = peers.filter(n => n !== actor && n.crewId !== ID && n.alive !== false && n.roomId === s.roomId);
      if (player?.roomId === s.roomId && player.alive !== false) occupants.push(player);
      if (portalBusy || occupants.some(body => overlap(actor, body))) return { ...s, reason: 'occupied' };
      s.doorProgress = Math.min(1, s.doorProgress + dt / doorDuration(s.stage));
      if (s.doorProgress >= 1) s.stage = 'walking';
    }
    return { ...s, velocity: 0 };
  }
  const atDestination = s.roomId === s.targetRoomId;
  const goal = atDestination ? s.roomId === ANNEX ? s.dutyX : s.homeX : socketX(s.roomId);
  if (s.stage === 'service') {
    s.doorProgress = Math.max(0, s.doorProgress - dt / (reducedMotion ? .12 : .65));
    return { ...s, velocity: 0 };
  }
  const physicalPeers = peers.filter(p => p && p !== actor && p.crewId !== ID && p.alive !== false && p.roomId === s.roomId
    && [p.x, p.y, p.w, p.h].every(finite) && Math.abs(p.y + p.h - actor.y - actor.h) < 16);
  if (player?.roomId === s.roomId && player.alive !== false && [player.x, player.y, player.w, player.h].every(finite)
    && Math.abs(player.y + player.h - actor.y - actor.h) < 16) physicalPeers.push(player);
  const boxes = [...colliders, ...physicalPeers.map(p => ({ x: p.x - 12, y: p.y, w: p.w + 24, h: p.h }))];
  for (let remaining = dt; remaining > 1e-8;) {
    const step = Math.min(1 / 120, remaining); remaining -= step;
    const distance = Math.abs(goal - s.x), direction = Math.sign(goal - s.x);
    let speed = Math.min(27, Math.sqrt(2 * 92 * Math.max(0, distance - .1)));
    for (const p of physicalPeers) {
      if (direction * (p.x + p.w / 2 - s.x - actor.w / 2) <= 0) continue;
      const gap = direction > 0 ? p.x - s.x - actor.w - 12 : s.x - p.x - p.w - 12;
      speed = Math.min(speed, Math.sqrt(2 * 92 * Math.max(0, gap - .2)));
    }
    const velocity = s.velocity + clamp(direction * speed - s.velocity, -92 * step, 92 * step);
    const proposed = clamp(s.x + (s.velocity + velocity) * .5 * step, Math.min(s.x, goal), Math.max(s.x, goal));
    const contact = moveNpcAgainstGeometryV136({ ...actor, x: s.x }, proposed, boxes);
    s.x = contact.x; s.velocity = contact.blocked ? 0 : velocity; s.blocked ||= contact.blocked;
    if (Math.abs(s.x - goal) < .25 && Math.abs(s.velocity) < 3) {
      s.velocity = 0;
      if (atDestination) { s.stage = 'service'; s.arrivals = Math.min(1e6, s.arrivals + 1); }
      else s.stage = 'opening';
      break;
    }
  }
  s.actualVelocity = (s.x - originalX) / dt;
  s.distance = Math.min(1e9, s.distance + Math.abs(s.x - originalX));
  if (Math.abs(s.actualVelocity) > .1) s.facing = Math.sign(s.actualVelocity);
  // Keep the paired opening free until the departing whole body clears it.
  const opening = faces[s.roomId].opening;
  if (atDestination && (s.x + actor.w < opening.x - 12 || s.x > opening.x + opening.w + 12))
    s.doorProgress = Math.max(0, s.doorProgress - dt / (reducedMotion ? .12 : .65));
  return s;
}

/** Opaque native leaves occlude an intact source sprite; no scaling, opacity
 * fade, depth slide, new back view or drawing on a fictitious support rail. */
export function npcAnnexOcclusionV159(state) {
  if (!['covering', 'revealing'].includes(state?.stage)) return null;
  const face = faces[state.roomId], p = state.doorProgress;
  return { x: face.opening.x + face.opening.w * (1 - p) / 2,
    y: face.opening.y, w: face.opening.w * p, h: face.socket.y + face.socket.h + 8 - face.opening.y,
    progress: p, policy: 'native-leaf-occlusion-on-supported-feet' };
}

export function withHubNpcAnnexCirculationV159(Base) {
  return class HubNpcAnnexCirculationV159 extends Base {
    start(hubState = {}, options = {}) {
      this.npcAnnexSandboxV159 = Boolean(options.editorProject || options.forgeJourneyV141 || this.forgeSessionV141);
      this.npcAnnexStateV159 = this.npcAnnexSandboxV159 ? null : normalizeNpcAnnexCirculationV159(hubState.npcAnnexCirculationV159).actor;
      this.npcAnnexHandoffV159 = normalizeNpcAnnexCirculationV159(hubState.npcAnnexCirculationV159).nativeHandoff;
      this.npcAnnexActorV159 = null; this.npcAnnexParentPeersV159 = [];
      const result = super.start(hubState, options);
      this.draw?.(); return result;
    }

    ensureAnnexNpcCohortV141() {
      const cohort = super.ensureAnnexNpcCohortV141();
      if (this.npcAnnexSandboxV159 || this.editorPlaytest || this.forgeSessionV141) return cohort;
      // Actual moving actor belongs to this owner, even after the historical
      // intention cohort changes/rebuilds at a quarter-hour boundary.
      const filtered = cohort.filter(n => n.crewId !== ID);
      const actor = this.npcAnnexActorV159;
      if (actor?.roomId === ANNEX) filtered.push(actor);
      return actor ? filtered : cohort;
    }

    createNpcs(deck) {
      if (this.npcAnnexSandboxV159 || this.editorPlaytest || this.forgeSessionV141) return super.createNpcs(deck);
      const resolution = this.npcRoutineResolutionsV62?.get(ID);
      if (!this.npcAnnexActorV159 && this.npcAnnexStateV159 && (resolution?.missionAssigned || resolution?.needsCare)) {
        this.npcAnnexHandoffV159 = { crewId: ID, fromRoomId: this.npcAnnexStateV159.roomId,
          toRoomId: resolution.roomId, reason: resolution.reason, observedTravel: false, owner: 'native-v62-routine' };
        this.npcAnnexStateV159 = null;
      }
      const released = this.shouldHandoffNpcAnnexV159(resolution);
      if (released) this.handoffNpcAnnexV159(resolution);
      // Release before the base factory reads annex membership, otherwise its
      // parent filter would suppress the newly medical/mission-owned identity.
      const natives = super.createNpcs(deck);
      if (!this.npcAnnexActorV159 && !released && !this[handoffRebuildV161]) {
        const duty = { roomId: ANNEX, crewId: ID, targetX: 960, duty: 'synthetic-diagnostics' };
        const dutyActor = createAnnexNpcsV141([duty], this.npcRoutineResolutionsV62).find(n => n.crewId === ID);
        const saved = this.npcAnnexStateV159;
        // A fresh load may adopt the existing standing V141 duty. That is an
        // initial condition, never evidence that a pre-load journey was walked.
        const source = natives.find(n => n.crewId === ID && n.roomId === PARENT)
          || super.ensureAnnexNpcCohortV141().find(n => n.crewId === ID && n.roomId === ANNEX);
        let parentSource = source;
        if (!source && !saved && resolution?.roomId === PARENT && resolution.deck === DECK) {
          // createNpcs can be requested while the player is on another deck.
          parentSource = super.createNpcs(DECK).find(n => n.crewId === ID && n.roomId === PARENT);
        }
        if (dutyActor && (saved || parentSource?.alive !== false && parentSource)
          && !resolution?.missionAssigned && !resolution?.needsCare) {
          const template = parentSource || homeTemplate();
          const actor = this.npcAnnexActorV159 = { ...template, ...(saved ? { x: saved.x, y: saved.y,
            roomId: saved.roomId, facing: saved.facing } : {}), vx: 0, mobile: false };
          this.npcAnnexStateV159 = saved || createNpcAnnexCirculationStateV159(actor, dutyActor);
          this.npcAnnexHandoffV159 = null;
          if (!this.npcAnnexStateV159) this.npcAnnexActorV159 = null;
        }
      }
      const actor = this.npcAnnexActorV159;
      if (!actor) return natives;
      this.refreshNpcAnnexIntentV159();
      if (deck === DECK) this.npcAnnexParentPeersV159 = natives.filter(n => n.crewId !== ID);
      else if (!this.npcAnnexParentPeersV159?.length) this.npcAnnexParentPeersV159 = super.createNpcs(DECK).filter(n => n.crewId !== ID);
      return [...natives.filter(n => n.crewId !== ID), ...(deck === DECK && actor.roomId === PARENT ? [actor] : [])];
    }

    shouldHandoffNpcAnnexV159(resolution = this.npcRoutineResolutionsV62?.get(ID)) {
      const actor = this.npcAnnexActorV159, s = this.npcAnnexStateV159;
      if (!actor || !s || !resolution) return false;
      if (resolution.missionAssigned || resolution.needsCare || actor.alive === false || actor.downed) return true;
      const duty = annexNpcDutiesV141(this.npcRoutineResolutionsV62, this).some(d => d.crewId === ID && d.roomId === ANNEX);
      return !resolution.alert && !duty && resolution.roomId !== PARENT && actor.roomId === PARENT && s.stage === 'service';
    }

    handoffNpcAnnexV159(resolution) {
      const actor = this.npcAnnexActorV159;
      if (!actor) return;
      this.npcAnnexHandoffV159 = { crewId: ID, fromRoomId: actor.roomId, toRoomId: resolution.roomId,
        reason: npcAnnexInterruptionV159(resolution, actor) || 'daily-schedule', observedTravel: false, owner: 'native-v62-routine' };
      this.npcAnnexActorV159 = null; this.npcAnnexStateV159 = null;
    }

    refreshNpcAnnexIntentV159() {
      const actor = this.npcAnnexActorV159, r = this.npcRoutineResolutionsV62?.get(ID);
      if (!actor || !r) return;
      Object.assign(actor, { routinePhaseV62: actor.roomId === ANNEX ? 'work' : r.roomId === PARENT ? r.phase : 'station',
        routineReasonV62: r.reason, routineDeterministicKeyV62: r.deterministicKey,
        alerted: Boolean(r.alert), annexNativeV141: actor.roomId === ANNEX,
        annexDutyV141: actor.roomId === ANNEX ? 'synthetic-diagnostics' : undefined,
        min: actor.x, max: actor.x, mobile: false });
    }

    stepHubNpcLifeV136(actor, delta, options) {
      if (actor === this.npcAnnexActorV159) return;
      return super.stepHubNpcLifeV136(actor, delta, options);
    }

    npcAnimationRequest(npc) {
      const request = super.npcAnimationRequest(npc), s = this.npcAnnexStateV159;
      if (npc !== this.npcAnnexActorV159 || npc?.crewId !== ID || this.running === false || s?.stage !== 'walking'
        || !['active-crisis', 'infestation'].includes(s.reason)
        || !(Math.abs(s.actualVelocity) > .1 && Math.abs(npc.vx) > .1)
        || npc.inVehicle || npc.ventTransit || npc.grounded === false || npc.crouching || npc.inCover
        || !['ready', 'role-support'].includes(request?.clipId)) return request;
      const sheetId = CREW_SPRITE_IDS[ID];
      if (![sheetId, CREW_MISSION_SPRITE_IDS[ID]].includes(request.sheetId)
        || !resolveSpriteClip(sheetId, 'walk')?.loop) return request;
      // Only the real emergency withdrawal outranks a stationary alert/work
      // pose. Its own native walk spends measured floor distance; lifecycle,
      // combat, traversal and alternate uniform requests retain precedence.
      // Include the final moving frame that has just closed the cleared leaf.
      return { sheetId, clipId: 'walk' };
    }

    tickAnnexNpcLifeV141(delta) {
      // Let the existing loop own every other crew member, never this singleton.
      const actor = this.npcAnnexActorV159;
      const active = this.activeAnnexNpcsV141;
      this.activeAnnexNpcsV141 = () => active.call(this).filter(n => n !== actor);
      try { return super.tickAnnexNpcLifeV141(delta); } finally { this.activeAnnexNpcsV141 = active; }
    }

    npcAnnexDoorDemandV159(annexId) {
      return annexId === ANNEX && this.npcAnnexActorV159 ? this.npcAnnexStateV159?.doorProgress || 0 : 0;
    }

    npcAnnexDoorReservedV159(annexId) {
      const s = this.npcAnnexStateV159;
      const actor = this.npcAnnexActorV159;
      return annexId === ANNEX && Boolean(s && actor && (crossing(s) || s.doorProgress > 0 || inDoorway(actor)));
    }

    drawSheetCell(ctx, image, ...args) {
      const actor = this.npcAnnexActorV159;
      const clip = actor && this.npcImageCrewIds?.get(image) === ID && this.npcs?.includes(actor)
        && npcAnnexOcclusionV159(this.npcAnnexStateV159);
      if (!clip) return super.drawSheetCell(ctx, image, ...args);
      // V52 adds the optional uniform marking AFTER the body renderer. Keep
      // that entire native draw (including its fallback) behind the same leaf.
      ctx.save(); ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip();
      try { return super.drawSheetCell(ctx, image, ...args); } finally { ctx.restore(); }
    }

    drawNpcLifeV136(ctx, image, actor, sample, geometry) {
      const clip = actor === this.npcAnnexActorV159 && npcAnnexOcclusionV159(this.npcAnnexStateV159);
      if (!clip) return super.drawNpcLifeV136(ctx, image, actor, sample, geometry);
      ctx.save(); ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip();
      super.drawNpcLifeV136(ctx, image, actor, sample, geometry) || drawHumanAtlasV133(ctx, image, geometry);
      ctx.restore(); return true;
    }

    drawDepthContactShadowV116(ctx, actor, supportY) {
      const clip = actor === this.npcAnnexActorV159 && npcAnnexOcclusionV159(this.npcAnnexStateV159);
      if (!clip) return super.drawDepthContactShadowV116(ctx, actor, supportY);
      ctx.save(); ctx.beginPath(); ctx.rect(clip.x, clip.y, clip.w, clip.h); ctx.clip();
      const result = super.drawDepthContactShadowV116(ctx, actor, supportY); ctx.restore(); return result;
    }

    update(delta) {
      const before = this.npcAnnexActorV159, wasRunning = this.running;
      const clocks = before && Object.fromEntries(['workClock', 'supportClock', 'alertClock'].map(k => [k, finite(before[k]) ? before[k] : 0]));
      const result = super.update(delta);
      if (!wasRunning || !this.running || this.npcAnnexSandboxV159 || !finite(delta) || delta <= 0) return result;
      const actor = this.npcAnnexActorV159, previous = this.npcAnnexStateV159;
      if (!actor || !previous) return result;
      const resolution = this.npcRoutineResolutionsV62?.get(ID);
      if (this.shouldHandoffNpcAnnexV159(resolution)) {
        this.handoffNpcAnnexV159(resolution);
        // Publish through all outer route owners. Direct super sampling would
        // replace their physical actors with native timetable templates.
        // Keep only this just-released owner from immediate re-admission if
        // its transient lifecycle has not yet reached the native crew record.
        const rebuilding = this[handoffRebuildV161]; this[handoffRebuildV161] = true;
        try { this.npcs = this.createNpcs(this.state.deck); }
        finally { this[handoffRebuildV161] = rebuilding; }
        return result;
      }
      const dt = Math.min(delta, .1);
      if (actor === before) for (const [key, value] of Object.entries(clocks))
        actor[key] = finite(actor[key]) && actor[key] > value ? actor[key] : Math.max(0, value - dt);
      const cohort = this.ensureAnnexNpcCohortV141();
      const peers = [...(this.state?.deck === DECK ? this.npcs || [] : this.npcAnnexParentPeersV159 || []), ...cohort];
      const local = this.currentAnnexV71?.();
      const player = !this.ventActorV62 && this.player && { ...this.player, roomId: local?.id || (this.state?.deck === DECK ? this.state.roomId : null) };
      const duty = annexNpcDutiesV141(this.npcRoutineResolutionsV62, this).some(d => d.crewId === ID && d.roomId === ANNEX);
      const portalBusy = this.annexTransitionV71?.annexId === ANNEX || this.hubDoorClosingV142?.annexId === ANNEX
        || this.hubTrainingV132?.lockedDoorIds?.some(id => [ANNEX, descriptor.connectionId, descriptor.id].includes(id));
      const next = advanceNpcAnnexCirculationV159(previous, actor, dt, { resolution,
        duty, peers, player, portalBusy, reducedMotion: this.reducedMotion });
      const changedRoom = next.roomId !== actor.roomId;
      Object.assign(actor, { x: next.x, y: next.y, roomId: next.roomId, facing: next.facing, vx: next.actualVelocity || 0 });
      this.npcAnnexStateV159 = next; this.refreshNpcAnnexIntentV159();
      if (changedRoom) this.npcs = [...(this.npcs || []).filter(n => n.crewId !== ID),
        ...(this.state?.deck === DECK && actor.roomId === PARENT ? [actor] : [])];
      if (next.stage === 'service' && next.reason === 'daily-schedule') {
        const life = advanceNpcLifeV136(actor.lifeV136, actor, dt, { room: actor.roomId === ANNEX ? annex : parent,
          peers, context: `annex-circulation-v159:${actor.roomId}`, colliders: actor.roomId === ANNEX ? annex.colliders : buildHubObstacleGeometryV87(DECK),
          reducedMotion: this.reducedMotion });
        if (life) actor.lifeV136 = life;
      } else actor.lifeV136 = { schema: 136, context: 'annex-circulation-v159', x: actor.x, y: actor.y,
        time: next.time, velocity: next.velocity, actualVelocity: actor.vx, facing: actor.facing,
        mode: Math.abs(actor.vx) > .1 ? 'moving' : next.reason !== 'daily-schedule' ? 'alert' : next.blocked ? 'blocked' : 'idle',
        passive: null, previousPassive: null, blend: 1 };
      // Every camera/deck/duct shares the same physical animation owner. The
      // covered chart change is explicitly not spent as a giant walking step.
      const visible = actor.roomId === ANNEX ? this.currentAnnexV71?.()?.id === ANNEX
        : this.state?.deck === DECK && !this.isAnnexActiveV71?.() && !this.ventActorV62;
      if (!visible) this.sampleNpcAnimation?.(actor, { emit: false, discardEvents: true });
      return result;
    }

    persist() {
      const original = this.onPersist; let patch;
      this.onPersist = value => { patch = value; };
      try { super.persist(); } finally { this.onPersist = original; }
      if (patch) original({ ...patch, npcAnnexCirculationV159: normalizeNpcAnnexCirculationV159({ schema: 159, actor: this.npcAnnexStateV159, nativeHandoff: this.npcAnnexHandoffV159 }) });
    }

    getSnapshot() {
      return { ...super.getSnapshot(), npcAnnexCirculationV159: {
        ...normalizeNpcAnnexCirculationV159({ schema: 159, actor: this.npcAnnexStateV159, nativeHandoff: this.npcAnnexHandoffV159 }),
        actualVelocity: this.npcAnnexActorV159?.vx || 0, reserved: this.npcAnnexDoorReservedV159(ANNEX),
        occlusion: npcAnnexOcclusionV159(this.npcAnnexStateV159),
        initialCondition: this.npcAnnexStateV159?.admittedRoomId || null,
        preLoadTravelObserved: false, scope: 'one-native-parent-annex-route',
        sourceFace: clone(parentFace), annexFace: clone(localFace),
        presentation: [parent, annex].map(room => ({ roomId: room.id, mode: getHubRoomPresentationV119(room).presentationMode,
          projection: getHubRoomPresentationV119(room).projectionV139.projection, mixedProjectionAllowed: false })) } };
    }
  };
}
