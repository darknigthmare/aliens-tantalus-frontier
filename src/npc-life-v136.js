import { HUB_DECKS, buildHubObstacleGeometryV87 } from './hub-game.js';
import { getHubBulkheadColliderV134 } from './hub-bulkhead-depth-v134.js';
import { resolveSpriteSheet } from './sprite-animation-runtime.js';
import { resolveHumanAtlasGeometryV133, drawHumanAtlasV133 } from './human-visual-contract-v133.js';
import { getHubInteractionPropBoundsV136 } from './hub-prop-placements-v136.js';
import { annexNpcDutiesV141, createAnnexNpcsV141 } from './hub-annex-npc-life-v141.js';
import { buildHubNpcInteractionEvent } from './hub-v52-runtime.js';
import { getHubDoorDestinationDescriptorsV138 } from './hub-destination-signage-v138.js';
import { getShipPortInteractionV87, SHIP_PORT_MEETINGS_V87 } from './ship-port-room-v87.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, finite(value, low)));
const sign = value => value < 0 ? -1 : 1;
const approach = (value, target, amount) => value + clamp(target - value, -amount, amount);
const hash = value => { let n = 2166136261; for (const c of String(value)) n = Math.imul(n ^ c.codePointAt(0), 16777619); return n >>> 0; };
const blockedVertically = (actor, box) => box && box.collisionMode !== 'one-way-top'
  && [box.x, box.y, box.w, box.h].every(Number.isFinite) && box.w > 0 && box.h > 0
  && actor.y + actor.h > box.y + .001 && actor.y < box.y + box.h - .001;
const NPC_STANDING_GAP = 12;

// Rear-wall passages are walking bays, not idle work stations. Reserve their
// real sockets when a cohort is built; moving crew may still cross them using
// the ordinary physical controller and the door still checks live occupancy.
const parentDoorBays = room => getHubDoorDestinationDescriptorsV138(room)
  .filter(door => door.face === 'parent').map(door => door.socket);
const clearsDoorBays = (actor, x, bays) => bays.every(box => !blockedVertically(actor, box)
  || x + actor.w + NPC_STANDING_GAP <= box.x || x >= box.x + box.w + NPC_STANDING_GAP);

function standingPeers(actor, peers) {
  const identity = actor.crewId || actor.id;
  return peers.filter(peer => peer && peer !== actor && (!identity || (peer.crewId || peer.id) !== identity)
    && peer.alive !== false && [peer.x, peer.y, peer.w, peer.h].every(Number.isFinite)
    && peer.w > 0 && peer.h > 0 && Math.abs(actor.y + actor.h - peer.y - peer.h) < 16);
}

function nearestPeerAhead(actor, peers, direction) {
  let nearest = null;
  for (const peer of peers) {
    const ahead = direction * (peer.x + peer.w / 2 - actor.x - actor.w / 2) > 0;
    if (!ahead) continue;
    const distance = direction > 0 ? peer.x - actor.x - actor.w - NPC_STANDING_GAP
      : actor.x - peer.x - peer.w - NPC_STANDING_GAP;
    if (!nearest || distance < nearest.distance) nearest = { peer, distance: Math.max(0, distance) };
  }
  return nearest;
}

/** Swept horizontal contacts share the actual closed leaves and solid room
 * geometry. Background tabletops never acquire a new collision plane. */
export function moveNpcAgainstGeometryV136(actor, proposedX, colliders = []) {
  const start = finite(actor.x), dx = finite(proposedX, start) - start;
  let x = start + dx;
  for (const box of colliders) {
    if (!blockedVertically(actor, box)) continue;
    if (dx > 0 && start + actor.w <= box.x + .001 && x + actor.w > box.x) x = Math.min(x, box.x - actor.w);
    else if (dx < 0 && start >= box.x + box.w - .001 && x < box.x + box.w) x = Math.max(x, box.x + box.w);
    else if (start + actor.w > box.x && start < box.x + box.w
      && dx * (start + actor.w / 2 - box.x - box.w / 2) < 0) x = start;
  }
  return { x, blocked: Math.abs(x - (start + dx)) > 1e-7 };
}

/** A job visit goes beside the room's real interaction prop, on its existing
 * walking rail. It cannot send a technician to another room or through a lift. */
export function npcWorkAnchorV136(actor, room) {
  // Annex inspection rails already reserve every visible fitting and approach.
  // Parent-room station visits must not invent a route across those exclusions.
  if (actor.annexNativeV141) {
    const visit = actor.annexServiceVisitV157;
    // Only a factory-reviewed continuous rail can own a local service trip.
    // Do not infer routes to arbitrary tables or cross reserved animal volumes.
    return visit && actor.routinePhaseV62 === 'work' && actor.roomId === room?.id
      && visit.supportId === actor.annexSupportIdV156
      && [visit.homeX, visit.workX, actor.min, actor.max].every(Number.isFinite)
      && visit.homeX >= actor.min && visit.homeX <= actor.max
      && visit.workX >= actor.min && visit.workX <= actor.max
      && Math.abs(visit.workX - visit.homeX) >= 28 ? visit.workX : null;
  }
  const box = getHubInteractionPropBoundsV136(room);
  if (!box || ![box.x, box.w, room.xStart, room.xEnd].every(Number.isFinite)
    || actor.routinePhaseV62 !== 'work' || actor.mobile || room.id !== actor.roomId) return null;
  const middle = actor.x + actor.w / 2;
  const doorBays = parentDoorBays(room);
  const candidates = [box.x - actor.w - 16, box.x + box.w + 16]
    .filter(x => x >= room.xStart + 96 && x + actor.w <= room.xEnd - 96
      && Math.abs(x - actor.x) >= 28 && Math.abs(x - actor.x) <= 240
      && clearsDoorBays(actor, x, doorBays))
    .sort((a, b) => Math.abs(a + actor.w / 2 - middle) - Math.abs(b + actor.w / 2 - middle));
  return candidates[0] ?? null;
}

/** Several scheduled specialists may report to one room. Allocate their idle
 * standing positions when that cohort is created, before its first frame. */
export function spreadNpcStationSpawnsV136(npcs, rooms = []) {
  const placed = [];
  return (npcs || []).map(source => {
    const npc = { ...source }, room = rooms.find(entry => entry.id === npc.roomId);
    if (!npc.mobile && room && Number.isFinite(npc.x)) {
      const low = room.xStart + 96, high = room.xEnd - npc.w - 96;
      const doorBays = parentDoorBays(room);
      const free = x => clearsDoorBays(npc, x, doorBays)
        && !placed.some(peer => peer.roomId === npc.roomId && Math.abs(peer.y - npc.y) < 16
        && x < peer.x + peer.w + 14 && x + npc.w + 14 > peer.x);
      const base = clamp(npc.x, low, high);
      for (let offset = 0; offset <= room.xEnd - room.xStart; offset += 58) {
        const candidates = offset ? [base + offset, base - offset] : [base];
        const x = candidates.find(value => value >= low && value <= high && free(value));
        if (x !== undefined) { npc.x = x; npc.min = x; npc.max = x; break; }
      }
    }
    placed.push(npc); return npc;
  });
}

function workStationOccupied(state, actor, peers) {
  return peers.some(peer => peer !== actor && (peer.crewId || peer.id) !== (actor.crewId || actor.id)
    && peer.alive !== false && peer.roomId === actor.roomId && (
      peer.lifeV136 && ['approach', 'work', 'return'].includes(peer.lifeV136.tripPhase)
        && Math.abs(peer.lifeV136.workX - state.workX) < actor.w + 18
      || Math.abs(peer.x - state.workX) < actor.w + 14));
}

function passivePose(state, actor, reducedMotion) {
  if (state.mode === 'moving' || state.mode === 'blocked' || state.mode === 'yielding' || state.mode === 'alert'
    || actor.workClock > 0 || actor.supportClock > 0) return null;
  if (reducedMotion) return { clipId: 'idle', frame: 0 };
  if (state.tripPhase === 'work') {
    // These are the shipped role-work cells: tool/tablet, inspection and radio.
    const frames = actor.interaction?.kind === 'intel' || actor.interaction?.kind === 'piloting'
      ? [8, 8, 9, 10, 10, 11, 8] : [8, 9, 10, 10, 9, 8];
    return { clipId: 'role-work', frame: frames[Math.min(frames.length - 1, Math.floor(state.tripClock * 2))] };
  }
  const period = 8 + state.seed % 7, at = (state.time + (state.seed % 701) / 100) % period;
  const working = actor.routinePhaseV62 === 'work';
  if (working && at < 2.5) return { clipId: 'role-work', frame: [8, 9, 10, 9, 8][Math.min(4, Math.floor(at * 2))] };
  // Long neutral holds remove the constant four-cell shrugging loop. A short
  // equipment glance has a per-person phase, with no physical gameplay effect.
  return { clipId: 'idle', frame: at < .35 ? 1 : at < .95 ? 2 : at < 1.3 ? 1 : 0 };
}

/** Runtime-only, deterministic schedules. Save/campaign clocks and dialogue
 * rewards remain owned by their existing services. A pause advances nothing. */
export function advanceNpcLifeV136(previous, actor, delta, {
  colliders = [], room = null, peers = [], context = '', reducedMotion = false, suspended = false
} = {}) {
  const valid = actor && [actor.x, actor.y, actor.w, actor.h].every(Number.isFinite) && actor.w > 0 && actor.h > 0;
  if (!valid) return null;
  const seed = hash(actor.crewId || actor.id || 'crew');
  const prior = previous?.schema === 136 && previous.context === context
    && Math.abs(previous.x - actor.x) < .01 && Math.abs(previous.y - actor.y) < .01 ? previous : null;
  const initialDirection = Math.sign(finite(actor.resumeVx, finite(actor.patrolSpeed))) || (seed % 2 ? -1 : 1);
  const state = prior ? { ...prior } : { schema: 136, context, seed, x: actor.x, y: actor.y, time: 0,
    velocity: 0, actualVelocity: 0, direction: initialDirection, facing: initialDirection,
    mode: 'idle', dwell: 0, homeX: actor.x, workX: npcWorkAnchorV136(actor, room),
    tripPhase: 'rest', tripClock: 0, tripDelay: 6 + seed % 9, passive: null, previousPassive: null, blend: 1 };
  if (suspended || !Number.isFinite(delta) || delta <= 0) return state;
  const dt = Math.min(delta, .1), originalX = actor.x;
  const cohort = standingPeers(actor, peers);
  const peerColliders = cohort.map(peer => ({ x: peer.x - NPC_STANDING_GAP, y: peer.y,
    w: peer.w + 2 * NPC_STANDING_GAP, h: peer.h }));
  state.yieldingTo = null;
  state.time += dt; state.blend = Math.min(1, state.blend + dt / .14);
  const urgent = actor.alerted || actor.alive === false || actor.downed || actor.workClock > 0 || actor.supportClock > 0;
  if (urgent) {
    state.velocity = 0; state.actualVelocity = 0;
    state.mode = actor.alerted || actor.alive === false || actor.downed ? 'alert' : 'interaction';
  } else {
    state.tripClock += dt;
    if (!actor.mobile && state.workX !== null && actor.routinePhaseV62 === 'work') {
      if (state.tripPhase === 'rest' && state.tripClock >= state.tripDelay && !workStationOccupied(state, actor, peers)) {
        state.tripPhase = 'approach'; state.tripClock = 0;
      }
      if (state.tripPhase === 'work' && state.tripClock >= 3.5) { state.tripPhase = 'return'; state.tripClock = 0; }
    }
    let x = actor.x;
    const trip = !actor.mobile && ['approach', 'return'].includes(state.tripPhase);
    const low = trip ? Math.min(state.homeX, state.workX) : finite(actor.min, x);
    const high = trip ? Math.max(state.homeX, state.workX) : finite(actor.max, x);
    const target = trip ? state.tripPhase === 'approach' ? state.workX : state.homeX
      : actor.mobile ? state.direction > 0 ? high : low : x;
    const moving = trip || actor.mobile && high - low > 1;
    let blocked = false, yielding = false, peerStopped = false;
    if (!moving) state.velocity = 0;
    for (let remaining = moving ? dt : 0; remaining > 1e-8;) {
      const step = Math.min(1 / 120, remaining); remaining -= step;
      state.dwell = Math.max(0, state.dwell - step);
      const distance = Math.abs(target - x), direction = Math.sign(target - x);
      let speed = Math.min(27, Math.sqrt(2 * 92 * Math.max(0, distance - .15)));
      const ahead = nearestPeerAhead({ ...actor, x }, cohort, direction);
      if (ahead) {
        // A closing person consumes stopping distance too. A person walking
        // away permits normal following; neither case changes the free speed.
        const peerVelocity = finite(ahead.peer.lifeV136?.velocity, finite(ahead.peer.vx));
        const safeSpeed = Math.max(0, direction * peerVelocity
          + Math.sqrt(2 * 92 * Math.max(0, ahead.distance - .2)));
        if (safeSpeed < speed) {
          speed = safeSpeed; yielding = true;
          state.yieldingTo = ahead.peer.crewId || ahead.peer.id || 'crew';
        }
        peerStopped ||= ahead.distance < .6 && Math.abs(state.velocity) < 3;
      }
      const desired = moving && !state.dwell ? direction * speed : 0;
      const nextVelocity = approach(state.velocity, desired, 92 * step);
      const proposed = clamp(x + (state.velocity + nextVelocity) * .5 * step, Math.min(low, high), Math.max(low, high));
      const contact = moveNpcAgainstGeometryV136({ ...actor, x }, proposed, colliders);
      const peerContact = moveNpcAgainstGeometryV136({ ...actor, x }, contact.x, peerColliders);
      x = peerContact.x; state.velocity = contact.blocked || peerContact.blocked ? 0 : nextVelocity;
      blocked ||= contact.blocked;
      if (peerContact.blocked) { yielding = true; peerStopped = true; }
      if (distance < .25 && Math.abs(state.velocity) < 3) { state.velocity = 0; break; }
    }
    state.x = x; state.actualVelocity = (x - originalX) / dt;
    if (Math.abs(state.actualVelocity) > .1) state.facing = sign(state.actualVelocity);
    const reached = Math.abs(target - x) < .4 && Math.abs(state.velocity) < 3;
    if (moving && reached) {
      if (trip) { state.tripPhase = state.tripPhase === 'approach' ? 'work' : 'rest'; state.tripClock = 0; }
      else if (!state.dwell) { state.direction *= -1; state.dwell = .7 + (seed % 8) / 10; }
    }
    // This is a single walking rail: patrols stop, hold and turn away instead
    // of crossing another body. A job approach yields its reservation and
    // physically returns home; a blocked return waits for room to open.
    if (peerStopped && !state.dwell) {
      if (actor.mobile) { state.direction *= -1; state.dwell = .55 + (seed % 5) / 10; }
      else if (state.tripPhase === 'approach') { state.tripPhase = 'return'; state.tripClock = 0; }
    }
    // An inaccessible job anchor is abandoned; a closed route leaf is waited
    // at until the real door opens. Neither case advances a phantom walk.
    if (blocked && trip) { state.tripPhase = 'return'; state.tripClock = 0; }
    state.mode = blocked ? 'blocked' : Math.abs(state.actualVelocity) > .1 ? 'moving'
      : yielding ? 'yielding' : state.dwell ? 'turn' : 'idle';
  }
  const nextPose = passivePose(state, actor, reducedMotion);
  if (nextPose?.clipId !== state.passive?.clipId || nextPose?.frame !== state.passive?.frame) {
    state.previousPassive = state.passive; state.passive = nextPose; state.blend = reducedMotion ? 1 : 0;
  }
  if (!state.passive || state.mode === 'moving') state.previousPassive = null;
  return state;
}

export function resolveNpcLifeAnimationV136(actor, state, request) {
  if (!request || state?.schema !== 136 || resolveSpriteSheet(request.sheetId)?.family !== 'npc') return request;
  if (state.mode === 'moving' && Math.abs(state.actualVelocity) > .1 && request.clipId === 'idle') return { ...request, clipId: 'walk' };
  if (state.passive && ['idle', 'role-work'].includes(request.clipId)) return { ...request, ...state.passive };
  return request;
}

export function withHubNpcLifeV136(Base) {
  return class HubNpcLifeV136 extends Base {
    start(hubState, options) {
      this.annexNpcCohortV141 = null;
      this.annexNpcCohortKeyV141 = null;
      this.annexNpcSandboxV141 = options?.forgeJourneyV141 === true;
      return super.start(hubState, options);
    }

    ensureAnnexNpcCohortV141() {
      const duties = annexNpcDutiesV141(this.npcRoutineResolutionsV62, this);
      const key = duties.map(duty => `${duty.crewId}:${this.npcRoutineResolutionsV62.get(duty.crewId).deterministicKey}`).join('|');
      if (key !== this.annexNpcCohortKeyV141 || !this.annexNpcCohortV141) {
        this.annexNpcCohortKeyV141 = key;
        this.annexNpcCohortV141 = createAnnexNpcsV141(duties, this.npcRoutineResolutionsV62);
      }
      return this.annexNpcCohortV141;
    }

    createNpcs(deck) {
      const annexIds = new Set(this.ensureAnnexNpcCohortV141().map(npc => npc.crewId));
      return spreadNpcStationSpawnsV136(super.createNpcs(deck).filter(npc => !annexIds.has(npc.crewId)), HUB_DECKS[deck]?.rooms || []);
    }

    activeAnnexNpcsV141() {
      if (this.editorPlaytest || this.forgeSessionV141 || this.annexNpcSandboxV141) return [];
      const room = this.currentAnnexV71?.();
      return room ? this.ensureAnnexNpcCohortV141().filter(npc => npc.roomId === room.id) : [];
    }

    tickAnnexNpcLifeV141(delta) {
      if (this.running === false || this.editorPlaytest || this.forgeSessionV141 || this.annexNpcSandboxV141 || !(delta > 0)) return;
      const room = this.currentAnnexV71?.(), peers = this.activeAnnexNpcsV141(), dt = Math.min(delta, .1);
      for (const npc of peers) {
        npc.workClock = Math.max(0, finite(npc.workClock) - dt);
        npc.supportClock = Math.max(0, finite(npc.supportClock) - dt);
        const life = advanceNpcLifeV136(npc.lifeV136, npc, dt, { room, peers,
          context: `annex:${room.id}:${npc.routineDeterministicKeyV62}`, colliders: room.colliders,
          reducedMotion: this.reducedMotion });
        npc.lifeV136 = life;
        Object.assign(npc, { x: life.x, vx: life.actualVelocity, facing: life.facing });
      }
    }

    nearestAnnexNpcV141() {
      if (!this.player || this.nearestAnnexStationV71?.()) return null;
      const center = this.player.x + this.player.w / 2, feet = this.player.y + this.player.h;
      return this.activeAnnexNpcsV141().filter(npc => Math.abs(feet - npc.y - npc.h) < 36)
        .map(npc => ({ npc, distance: Math.abs(center - npc.x - npc.w / 2) }))
        .filter(entry => entry.distance < 118).sort((a, b) => a.distance - b.distance)[0]?.npc || null;
    }

    prioritizedCivilAnnexNpcV156() {
      if (this.currentAnnexV71?.()?.id !== 'frontier-civil-counter'
        || this.annexTransitionV71 || this.hubDoorClosingV142 || this.hubDoorBlockedV142
        || this.annexStateReadOnlyV87 || this.nearestAnnexExitV71?.()
        || this.prioritizedParentAnnexDoorV133?.() || this.getCompanionInteractionV87?.()) return null;
      const npc = this.nearestAnnexNpcV141(), port = getShipPortInteractionV87(this);
      if (!npc || !port) return null;
      const center = this.player.x + this.player.w / 2;
      const meeting = port.animalId && SHIP_PORT_MEETINGS_V87.find(entry => entry.animalId === port.animalId);
      // Keep the existing physical port interaction anchors, including Mica's
      // historical x810, rather than stealing all animal/vendor interactions
      // whenever an off-duty crew member happens to be within talking range.
      const portX = meeting?.x ?? (port.vendorId === 'station-shop' ? 668 : 1965);
      const npcDistance = Math.abs(center - npc.x - npc.w / 2);
      return npcDistance + 4 < Math.abs(center - portX) ? npc : null;
    }

    statusPrompt() {
      const npc = this.prioritizedCivilAnnexNpcV156();
      return npc ? `E — ${npc.interaction.label} · ${npc.name}` : super.statusPrompt();
    }

    interact() {
      const npc = this.running && this.prioritizedCivilAnnexNpcV156();
      return npc ? this.interactWithAnnexNpcV141(npc) : super.interact();
    }

    interactWithAnnexNpcV141(npc) {
      if (!this.running || !this.activeAnnexNpcsV141().includes(npc)) return null;
      npc.vx = 0; npc.workClock = 2.4;
      this.hubNpcAnimation.reset(npc.crewId);
      const count = (this.hubNpcInteractions[npc.crewId]?.count || 0) + 1;
      const sequence = Math.max(this.hubNpcSequence + 1, count);
      const event = buildHubNpcInteractionEvent(npc, { deck: this.state.deck, roomId: npc.roomId, count, sequence });
      this.hubNpcSequence = sequence; this.hubNpcInteractions[npc.crewId] = { ...event.persistence.value };
      this.audio?.ui?.(); this.persist(); this.onAction(event);
      this.statusKey = ''; this.emitStatus(); return event;
    }

    drawAnnexNpcsV141(ctx) {
      for (const npc of this.activeAnnexNpcsV141()) {
        const sample = this.sampleNpcAnimation(npc, { emit: this.running !== false });
        const image = sample && this.npcImagesBySheetId?.get(sample.sheet.id);
        if (!sample || !image) continue;
        const geometry = resolveHumanAtlasGeometryV133({ actor: npc, sheet: sample.sheet,
          column: sample.column, row: sample.row, surface: 'hub' });
        npc.humanVisualV133 = geometry;
        this.drawDepthContactShadowV116?.(ctx, npc, npc.y + npc.h);
        this.drawNpcLifeV136(ctx, image, npc, sample, geometry) || drawHumanAtlasV133(ctx, image, geometry);
      }
    }

    drawPlayer(ctx) {
      // The Refuge has a dedicated render branch that bypasses the ordinary
      // annex NPC pass. Keep its depth order: decor, visitor, player, foreground.
      if (this.currentAnnexV71?.()?.id === 'personal-refuge') this.drawAnnexNpcsV141(ctx);
      return super.drawPlayer(ctx);
    }

    stepHubNpcLifeV136(npc, delta, { parentDeck = false } = {}) {
      const context = `hub:${this.state?.deck}:${npc.routineDeterministicKeyV62 || ''}`;
      const room = HUB_DECKS[this.state?.deck]?.rooms.find(entry => entry.id === npc.roomId);
      const roomObstacles = parentDeck ? buildHubObstacleGeometryV87(this.state?.deck || 0) : this.obstacles || [];
      const colliders = [...roomObstacles, ...(this.v51Walls || []),
        ...(this.v51Doors || []).filter(door => door.progress < .82),
        ...(this.doorStates || []).filter(door => !door.lift && door.blocking !== false && door.progress < .82)
          .map(door => getHubBulkheadColliderV134(door))];
      const state = advanceNpcLifeV136(npc.lifeV136, npc, delta, { context, room, colliders, peers: this.npcs || [], reducedMotion: this.reducedMotion });
      if (!state) { npc.vx = 0; return; }
      npc.lifeV136 = state; npc.x = state.x; npc.vx = state.actualVelocity; npc.facing = state.facing;
    }

    tickParentNpcLifeV136(delta) {
      if (this.running === false || this.editorPlaytest || this.forgeSessionV141 || this.annexNpcSandboxV141 || !(delta > 0)) return;
      // Annex player physics bypass the parent update. Keep its actual crew
      // moving once here, in world coordinates, without running player physics
      // against the annex's local walls or producing camera-owned sound events.
      const dt = Math.min(delta, .1);
      for (const npc of this.npcs || []) {
        npc.workClock = Math.max(0, finite(npc.workClock) - dt);
        npc.alertClock = Math.max(0, finite(npc.alertClock) - dt);
        npc.supportClock = Math.max(0, finite(npc.supportClock) - dt);
        this.stepHubNpcLifeV136(npc, dt, { parentDeck: true });
        this.sampleNpcAnimation?.(npc, { emit: false, discardEvents: true });
      }
    }

    npcAnimationRequest(npc) {
      return resolveNpcLifeAnimationV136(npc, npc?.lifeV136, super.npcAnimationRequest(npc));
    }

    drawNpcLifeV136(ctx, image, npc, sample, geometry) {
      const state = npc.lifeV136;
      if (!state?.previousPassive || !state.passive || state.blend >= 1 || Math.abs(npc.vx) > .1
        || this.reducedMotion || sample.clip.id !== state.passive.clipId || sample.frame !== state.passive.frame) return false;
      const frame = state.previousPassive.frame;
      const previousGeometry = resolveHumanAtlasGeometryV133({ actor: npc, sheet: sample.sheet,
        column: frame % 4, row: Math.floor(frame / 4), surface: 'hub' });
      if (!previousGeometry || !geometry || !image?.complete
        || image.naturalWidth !== geometry.sourceWidth || image.naturalHeight !== geometry.sourceHeight) return false;
      const alpha = Number.isFinite(ctx.globalAlpha) ? ctx.globalAlpha : 1;
      // Only stationary poses share this brief crossfade; walking contacts
      // always keep the single native distance-owned cell and its exact sole.
      const t = state.blend, blend = t * t * t * (10 + t * (-15 + 6 * t));
      ctx.save(); ctx.globalAlpha = alpha * (1 - blend); drawHumanAtlasV133(ctx, image, previousGeometry);
      ctx.globalAlpha = alpha * blend; drawHumanAtlasV133(ctx, image, geometry); ctx.restore();
      return true;
    }

    getSnapshot() {
      return { ...super.getSnapshot(), annexNpcLifeV141: this.activeAnnexNpcsV141().map(npc => ({
        crewId: npc.crewId, roomId: npc.roomId, duty: npc.annexDutyV141, x: npc.x, y: npc.y,
        min: npc.min, max: npc.max, vx: npc.vx, facing: npc.facing, mobile: npc.mobile,
        mode: npc.lifeV136?.mode || 'unobserved', time: npc.lifeV136?.time || 0,
        animation: npc.v52Animation || null, human: npc.humanVisualV133 || null
      })), npcLifeV136: (this.npcs || []).map(npc => ({
        crewId: npc.crewId, roomId: npc.roomId, x: npc.x, y: npc.y, vx: npc.vx, facing: npc.facing,
        mode: npc.lifeV136?.mode || 'unobserved', tripPhase: npc.lifeV136?.tripPhase || null,
        passive: npc.lifeV136?.passive || null, time: npc.lifeV136?.time || 0
      })) };
    }
  };
}
