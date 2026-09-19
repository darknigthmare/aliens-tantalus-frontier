import { migrateShipAnimalStateV87, transitionShipAnimalV87, transitionShipAnimalGroupV87,
  SHIP_ANIMAL_OFFERS_V87, getShipAnimalOfferMembersV87, getShipAnimalHabitatLocationV87 } from './ship-animal-state-v87.js';
import { getShipAnimalHabitatsV87, SHIP_ANIMAL_ANNEX_V87 } from './ship-animal-habitat-v87.js';
import { SHIP_PORT_ANNEX_V87, SHIP_PORT_MEETINGS_V87 } from './ship-port-room-v87.js';
import { HUB_DECKS, HUB_WORLD } from './hub-game.js';
import { buildHubDoorNetworkV58 } from './topology-coherence-v58.js';

export const SHIP_ANIMAL_DELIVERY_TIMING_V87 = Object.freeze({ intake: 2, acclimating: 4, maxDelta: .25 });
const PHASES = ['awaiting-pickup', 'carried', 'awaiting-recovery', 'intake', 'acclimating', 'delivered'];
const clone = value => structuredClone(value);
const record = value => value && typeof value === 'object' && !Array.isArray(value);
const finite = value => typeof value === 'number' && Number.isFinite(value);
const EPS = 1e-7;
const near = (a, b, margin) => Math.abs(a - b) <= margin;
const equalPose = (a, b) => a?.roomId === b?.roomId && a?.deckId === b?.deckId
  && near(a?.x, b?.x, EPS) && near(a?.y, b?.y, EPS);
const samePlace = (a, b) => equalPose(a, b) && a?.hubId === b?.hubId;
const fail = (save, code) => ({ ok: false, changed: false, code, save: clone(save), events: [] });
const unchanged = (save, code = 'unchanged') => ({ ok: true, changed: false, code, save: clone(save), events: [] });
const berth = (save, animal) => getShipAnimalHabitatsV87(save).find(h => h.id === animal.habitatId && h.installed);
const meeting = id => SHIP_PORT_MEETINGS_V87.find(entry => entry.animalId === id);
const localTransit = animal => animal.routineV87?.phase === 'walk';
const membersOf = animal => getShipAnimalOfferMembersV87(SHIP_ANIMAL_OFFERS_V87[animal?.acquisition?.offerId]);
const leaderOf = (state, animalId) => {
  const animal = Object.hasOwn(state.animals, animalId) && state.animals[animalId];
  return animal ? state.animals[membersOf(animal)[0]] : null;
};
const anchorFor = (save, animal) => getShipAnimalHabitatLocationV87(berth(save, animal), animal.id);
const receivingPoint = habitat => habitat.receivingPoint ? { ...habitat.location, ...habitat.receivingPoint } : habitat.location;
function touchMembers(state, animal, { time = null, activity = null } = {}) {
  for (const id of membersOf(animal)) {
    const member = state.animals[id]; member.revision += 1;
    if (time !== null) member.lastSimulationTime = time;
    if (activity !== null) member.activity = activity;
  }
}
function validPlayer(player) {
  if (!record(player) || player.alive === false || !finite(player.x) || !finite(player.y)
    || player.y < 0 || player.y > HUB_WORLD.floorY + 12) return false;
  if (player.roomId === SHIP_PORT_ANNEX_V87.id)
    return player.deckId === 'engineering' && player.x >= 0 && player.x <= SHIP_PORT_ANNEX_V87.world.width;
  if (player.roomId === SHIP_ANIMAL_ANNEX_V87.id)
    return player.deckId === 'habitat' && player.x >= 0 && player.x <= SHIP_ANIMAL_ANNEX_V87.world.width;
  const room = HUB_DECKS.find(deck => deck.id === player.deckId)?.rooms.find(r => r.id === player.roomId);
  return Boolean(room && player.x >= room.xStart - 1 && player.x <= room.xEnd + 1);
}
const pose = (player, time) => ({ roomId: player.roomId, deckId: player.deckId, x: player.x, y: player.y, time });
function expectedTransit(animal, habitat) {
  const offer = meeting(animal.id);
  const from = animal.location?.from;
  return offer && habitat && animal.location.kind === 'transit' && !localTransit(animal)
    && from?.hubId === 'frontier-civil-relay' && from.roomId === SHIP_PORT_ANNEX_V87.id
    && from.deckId === 'engineering' && from.x === offer.x && from.y === 624
    && samePlace(animal.location.to, getShipAnimalHabitatLocationV87(habitat, animal.id));
}
function initialDelivery(time) {
  return { schema: 87, phase: 'awaiting-pickup', elapsed: 0, lastSimulationTime: time,
    carrierLocation: null, waypoints: [], checkpoints: [] };
}
function checkpointMatches(point, index) {
  if (!validPlayer(point) || !finite(point.time) || point.time < 0) return false;
  if (index === 0) return point.roomId === SHIP_PORT_ANNEX_V87.id
    && near(point.x, SHIP_PORT_ANNEX_V87.entranceLocalX, 140);
  if (index === 1) return point.roomId === 'dropship-hangar' && point.deckId === 'engineering'
    && near(point.x, SHIP_PORT_ANNEX_V87.parentDoorBounds.x + SHIP_PORT_ANNEX_V87.parentDoorBounds.w / 2, 170);
  if (index === 2) return point.roomId === 'crew-quarters' && point.deckId === 'habitat';
  return index === 3 && point.roomId === 'animal-care' && point.deckId === 'habitat'
    && near(point.x, SHIP_ANIMAL_ANNEX_V87.entranceLocalX, 150);
}
function validateDelivery(save, animal, delivery = animal.deliveryV87) {
  if (delivery === undefined) return null;
  if (!record(delivery) || delivery.schema !== 87 || !PHASES.includes(delivery.phase)
    || !finite(delivery.elapsed) || delivery.elapsed < 0 || !finite(delivery.lastSimulationTime)
    || delivery.lastSimulationTime < 0 || !Array.isArray(delivery.waypoints) || delivery.waypoints.length > 32
    || !Array.isArray(delivery.checkpoints) || delivery.checkpoints.length > 4
    || !delivery.checkpoints.every(checkpointMatches)
    || !delivery.waypoints.every(p => validPlayer(p) && finite(p.time) && p.time >= 0)
    || [...delivery.checkpoints, ...delivery.waypoints].some(p => p.time > delivery.lastSimulationTime + EPS)
    || delivery.checkpoints.some((p, i) => i && p.time < delivery.checkpoints[i - 1].time)
    || delivery.waypoints.some((p, i) => i && p.time < delivery.waypoints[i - 1].time)) return 'invalid-delivery';
  const habitat = berth(save, animal);
  if (!habitat) return 'habitat-unavailable';
  if (delivery.phase === 'delivered') return delivery.elapsed === 0 && delivery.carrierLocation === null
    && delivery.checkpoints.length === 4 && (animal.location.kind === 'resident' || localTransit(animal))
    ? null : 'invalid-delivery';
  if (delivery.phase === 'intake' || delivery.phase === 'acclimating')
    return animal.location.kind === delivery.phase && samePlace(animal.location, getShipAnimalHabitatLocationV87(habitat, animal.id))
      && delivery.checkpoints.length === 4 && delivery.carrierLocation === null
      && delivery.elapsed < SHIP_ANIMAL_DELIVERY_TIMING_V87[delivery.phase] ? null : 'invalid-delivery';
  if (!expectedTransit(animal, habitat) || delivery.elapsed !== 0) return 'invalid-delivery';
  if (delivery.phase === 'awaiting-pickup') return animal.location.progress === 0
    && delivery.carrierLocation === null && !delivery.waypoints.length && !delivery.checkpoints.length
    ? null : 'invalid-delivery';
  return delivery.waypoints.length && validPlayer(delivery.carrierLocation)
    && equalPose(delivery.carrierLocation, delivery.waypoints.at(-1))
    && delivery.carrierLocation.time === delivery.waypoints.at(-1).time
    && delivery.carrierLocation.time === delivery.lastSimulationTime
    && near(animal.location.progress, delivery.checkpoints.length / 5, EPS) ? null : 'invalid-delivery';
}
function load(save) {
  if (!record(save)) return { error: 'invalid-save' };
  const state = migrateShipAnimalStateV87(save.shipAnimalsV1);
  if (state.schema !== 1) return { error: 'unsupported-schema' };
  if (state.quarantined.length) return { error: 'state-needs-review' };
  const candidate = { ...save, shipAnimalsV1: state };
  for (const animal of Object.values(state.animals)) {
    const members = membersOf(animal), leader = state.animals[members[0]];
    const delivery = leader.deliveryV87;
    if (members.length > 1) {
      const present = members.filter(id => state.animals[id].deliveryV87 !== undefined);
      if (present.length && present.length !== members.length) return { error: 'invalid-group-delivery' };
      if (present.length) {
        const reference = state.animals[members[1]].deliveryV87;
        if (!record(delivery) || delivery.unitId !== leader.acquisition.transactionId
          || !Array.isArray(delivery.memberIds) || delivery.memberIds.length !== members.length
          || delivery.memberIds.some((id, i) => id !== members[i]) || Object.hasOwn(delivery, 'leaderId')
          || !record(reference) || reference.schema !== 87 || reference.unitId !== delivery.unitId
          || reference.leaderId !== leader.id || Object.keys(reference).length !== 3) return { error: 'invalid-group-delivery' };
      }
    } else if (delivery && ['unitId', 'memberIds', 'leaderId'].some(key => Object.hasOwn(delivery, key)))
      return { error: 'invalid-delivery' };
    const error = validateDelivery(candidate, animal, delivery);
    if (error) return { error };
    if (delivery?.lastSimulationTime > state.lastSimulationTime + EPS)
      return { error: 'invalid-delivery-clock' };
  }
  if (Object.values(state.animals).filter(a => a.deliveryV87?.phase === 'carried').length > 1)
    return { error: 'multiple-carried-containers' };
  return { state };
}
function commitCandidate(save, state, events, code) {
  if (!Number.isSafeInteger(state.revision + 1)
    || Object.values(state.animals).some(a => !Number.isSafeInteger(a.revision))) return fail(save, 'invalid-revision');
  const candidate = clone(save); state.revision += 1; candidate.shipAnimalsV1 = state;
  return { ok: true, changed: true, code, save: candidate, events };
}
function validContextTime(state, time) {
  return time === undefined || time === null || finite(time) && near(time, state.lastSimulationTime, EPS);
}

/** Attach delivery data to an already acquired individual, never create ownership. */
export function initializeShipAnimalDeliveryV87(save, { animalId } = {}) {
  const { state, error } = load(save);
  if (error) return fail(save, error);
  const animal = leaderOf(state, animalId);
  if (!animal) return fail(save, 'animal-not-owned');
  if (animal.deliveryV87) return unchanged(save, 'already-initialized');
  const members = membersOf(animal);
  if (members.some(id => !expectedTransit(state.animals[id], berth(save, state.animals[id])) || state.animals[id].location.progress !== 0))
    return fail(save, 'invalid-commercial-transit');
  animal.deliveryV87 = initialDelivery(state.lastSimulationTime);
  if (members.length > 1) {
    animal.deliveryV87.unitId = animal.acquisition.transactionId;
    animal.deliveryV87.memberIds = members;
    for (const id of members.slice(1)) state.animals[id].deliveryV87 = {
      schema: 87, unitId: animal.deliveryV87.unitId, leaderId: animal.id };
  }
  touchMembers(state, animal);
  return commitCandidate(save, state, [], 'delivery-initialized');
}

export function pickupShipAnimalDeliveryV87(save, { animalId } = {}, {
  player, portAccessible = false, simulationTime = null
} = {}) {
  const prepared = initializeShipAnimalDeliveryV87(save, { animalId });
  if (!prepared.ok) return prepared;
  const { state, error } = load(prepared.save);
  if (error) return fail(save, error);
  const animal = leaderOf(state, animalId);
  const delivery = animal.deliveryV87;
  const recovering = delivery.phase === 'awaiting-recovery';
  if (delivery.phase !== 'awaiting-pickup' && !recovering) return unchanged(save, 'already-picked-up');
  if (!validContextTime(state, simulationTime)) return fail(save, 'invalid-simulation-time');
  if (!recovering && portAccessible !== true) return fail(save, 'port-inaccessible');
  if (Object.values(state.animals).some(a => a.deliveryV87?.phase === 'carried')) return fail(save, 'hands-occupied');
  const anchor = recovering ? delivery.carrierLocation
    : { roomId: SHIP_PORT_ANNEX_V87.id, deckId: 'engineering', x: meeting(animal.id).x, y: 624 };
  if (!validPlayer(player) || recovering && player.alive !== true
    || player.roomId !== anchor.roomId || player.deckId !== anchor.deckId
    || !near(player.x, anchor.x, 85) || !near(player.y, anchor.y, 12))
    return fail(save, recovering ? 'physical-recovery-required' : 'physical-pickup-required');
  delivery.phase = 'carried'; delivery.lastSimulationTime = state.lastSimulationTime;
  delivery.carrierLocation = pose(player, state.lastSimulationTime);
  // A physical re-grasp may move within reach, but never resets the route proof.
  delivery.waypoints = [...(recovering ? delivery.waypoints : []), clone(delivery.carrierLocation)].slice(-32);
  touchMembers(state, animal, { activity: 'carried' });
  return commitCandidate(save, state,
    [{ type: recovering ? 'animal-container-recovered' : 'animal-container-picked-up', animalId }],
    recovering ? 'recovered' : 'picked-up');
}

/** Drop at the last validated anchor, never at a respawn or unvalidated player pose. */
export function dropShipAnimalDeliveryV87(save, { animalId } = {}, { reason = 'carrier-discontinuity' } = {}) {
  const { state, error } = load(save);
  if (error) return fail(save, error);
  if (reason !== 'carrier-discontinuity') return fail(save, 'invalid-drop-reason');
  const animal = leaderOf(state, animalId);
  if (!animal) return fail(save, 'animal-not-owned');
  const delivery = animal.deliveryV87;
  if (!delivery) return fail(save, 'delivery-not-started');
  if (delivery.phase === 'awaiting-recovery') return unchanged(save, 'already-awaiting-recovery');
  if (delivery.phase !== 'carried') return fail(save, 'container-not-carried');
  // Keep location, progress, waypoints, checkpoints and every simulation clock exact.
  delivery.phase = 'awaiting-recovery'; touchMembers(state, animal);
  return commitCandidate(save, state,
    [{ type: 'animal-container-dropped', animalId, reason }], 'awaiting-recovery');
}

function portalPair(from, to, annex) {
  const parent = { roomId: annex.parentRoomId, deckId: annex.parentDeck,
    x: annex.parentDoorBounds.x + annex.parentDoorBounds.w / 2 };
  const annexPoint = { roomId: annex.id, deckId: annex.parentDeck, x: annex.entranceLocalX };
  const matches = (point, expected) => point.roomId === expected.roomId && point.deckId === expected.deckId
    && near(point.x, expected.x, 170) && near(point.y, 624, 18);
  return matches(from, parent) && matches(to, annexPoint) || matches(from, annexPoint) && matches(to, parent);
}
function continuousCarry(from, to, dt) {
  if (!validPlayer(from) || !validPlayer(to)) return false;
  if (from.roomId === to.roomId && from.deckId === to.deckId)
    return near(from.x, to.x, 800 * dt + 12) && near(from.y, to.y, 1800 * dt + 12);
  if (portalPair(from, to, SHIP_PORT_ANNEX_V87) || portalPair(from, to, SHIP_ANIMAL_ANNEX_V87)) return true;
  const fromDeck = HUB_DECKS.findIndex(d => d.id === from.deckId);
  const toDeck = HUB_DECKS.findIndex(d => d.id === to.deckId);
  if (fromDeck < 0 || toDeck < 0) return false;
  if (fromDeck === toDeck) {
    const rooms = HUB_DECKS[fromDeck].rooms;
    const first = rooms.findIndex(r => r.id === from.roomId), second = rooms.findIndex(r => r.id === to.roomId);
    return first >= 0 && second >= 0 && Math.abs(first - second) === 1
      && near(from.x, to.x, 800 * dt + 12) && near(from.y, to.y, 1800 * dt + 12);
  }
  return buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, fromDeck).some(door => door.lift
    && door.roomId === from.roomId && near(from.x, door.x, 128)
    && door.destinations.some(destination => destination.deckId === to.deckId
      && destination.roomId === to.roomId && near(to.x, destination.destinationCenterX, 40)));
}
function transition(candidate, animalId, location, stage, time, extra = {}) {
  const animal = candidate.shipAnimalsV1.animals[animalId];
  const members = membersOf(animal);
  if (members.length > 1) return transitionShipAnimalGroupV87(candidate, {
    offerId: animal.acquisition.offerId, transactionId: 'delivery-v87-' + animal.bondedGroupId + '-' + stage,
    locationsByAnimalId: Object.fromEntries(members.map(id => {
      const member = candidate.shipAnimalsV1.animals[id];
      return [id, location.kind === 'transit' ? { ...member.location, progress: location.progress }
        : { kind: location.kind, ...anchorFor(candidate, member) }];
    }))
  }, { ...extra, simulationTime: time, canTransition: () => true });
  return transitionShipAnimalV87(candidate, {
    animalId, location, transactionId: 'delivery-v87-' + animalId + '-' + stage
  }, { ...extra, simulationTime: time, canTransition: () => true });
}

/**
 * Call AFTER resident routines at the same target clock. Per-delivery clock
 * deduplicates the tick; root time is max(existing,target), never a second +dt.
 */
export function stepShipAnimalDeliveryV87(save, { delta = 0, simulationTime = null } = {}, {
  player, paused = false, transferBlocked = false
} = {}) {
  if (paused || transferBlocked) return unchanged(save, paused ? 'paused' : 'transfer-blocked');
  const { state, error } = load(save);
  if (error) return fail(save, error);
  if (!finite(delta) || delta < 0 || delta > .25 || (simulationTime !== null && !finite(simulationTime)))
    return fail(save, 'invalid-active-delta');
  const target = simulationTime === null ? state.lastSimulationTime + delta : simulationTime;
  if (target < state.lastSimulationTime - EPS || target > state.lastSimulationTime + delta + EPS)
    return fail(save, 'invalid-simulation-time');
  const pending = Object.values(state.animals).filter(a => a.deliveryV87
    && ['carried', 'intake', 'acclimating'].includes(a.deliveryV87.phase) && !localTransit(a));
  if (!pending.length || delta === 0) return unchanged(save, 'no-active-delivery');
  let candidate = clone(save); candidate.shipAnimalsV1 = state;
  const events = [];
  let changed = false;
  for (const original of pending) {
    let animal = candidate.shipAnimalsV1.animals[original.id];
    let delivery = animal.deliveryV87;
    const dt = Math.min(delta, Math.max(0, target - delivery.lastSimulationTime));
    if (dt <= EPS) continue;
    if (!validPlayer(player)) return fail(save, 'physical-carrier-required');
    if (delivery.phase === 'carried') {
      if (!continuousCarry(delivery.carrierLocation, player, dt)) return fail(save, 'discontinuous-carry');
      const current = pose(player, target);
      delivery.carrierLocation = current;
      delivery.waypoints = [...delivery.waypoints, clone(current)].slice(-32);
      const stage = delivery.checkpoints.length;
      if (stage < 4 && checkpointMatches(current, stage)) {
        delivery.checkpoints.push(clone(current));
        const result = transition(candidate, animal.id, { ...animal.location, progress: (stage + 1) / 5 },
          'route-' + (stage + 1), target);
        if (!result.ok) return fail(save, result.code);
        candidate = result.save; animal = candidate.shipAnimalsV1.animals[original.id]; delivery = animal.deliveryV87;
        events.push({ type: 'animal-carry-checkpoint', animalId: animal.id, checkpoint: stage + 1 });
      }
    } else {
      const habitat = berth(candidate, animal), receiving = receivingPoint(habitat);
      if (player.roomId !== receiving.roomId || player.deckId !== receiving.deckId
        || !near(player.x, receiving.x, 100) || !near(player.y, receiving.y, 12)) continue;
      delivery.elapsed += dt;
      const duration = SHIP_ANIMAL_DELIVERY_TIMING_V87[delivery.phase];
      if (delivery.elapsed + EPS >= duration) {
        const next = delivery.phase === 'intake' ? 'acclimating' : 'resident';
        delivery.elapsed = 0;
        const result = transition(candidate, animal.id, { kind: next, ...anchorFor(candidate, animal) }, next, target,
          { arrivalCheckPassed: next === 'acclimating', acclimationComplete: next === 'resident' });
        if (!result.ok) return fail(save, result.code);
        candidate = result.save; animal = candidate.shipAnimalsV1.animals[original.id]; delivery = animal.deliveryV87;
        delivery.phase = next === 'resident' ? 'delivered' : next;
        events.push({ type: 'animal-delivery-stage', animalId: animal.id, phase: delivery.phase });
      }
    }
    delivery.lastSimulationTime = target; touchMembers(candidate.shipAnimalsV1, animal, { time: target });
    changed = true;
  }
  if (!changed) return unchanged(save);
  candidate.shipAnimalsV1.lastSimulationTime = Math.max(candidate.shipAnimalsV1.lastSimulationTime, target);
  return commitCandidate(save, candidate.shipAnimalsV1, events, 'delivery-advanced');
}

export function receiveShipAnimalDeliveryV87(save, { animalId } = {}, {
  player, simulationTime = null, transferBlocked = false
} = {}) {
  const { state, error } = load(save);
  if (error) return fail(save, error);
  const animal = leaderOf(state, animalId);
  const delivery = animal?.deliveryV87;
  if (!delivery) return fail(save, 'delivery-not-started');
  if (['intake', 'acclimating', 'delivered'].includes(delivery.phase)) return unchanged(save, 'already-received');
  if (transferBlocked) return fail(save, 'transfer-blocked');
  if (!validContextTime(state, simulationTime)) return fail(save, 'invalid-simulation-time');
  if (delivery.phase !== 'carried' || delivery.checkpoints.length !== 4) return fail(save, 'physical-route-incomplete');
  const habitat = berth(save, animal), receiving = receivingPoint(habitat);
  if (!validPlayer(player) || player.roomId !== receiving.roomId || player.deckId !== receiving.deckId
    || !near(player.x, receiving.x, 85) || !near(player.y, receiving.y, 12)
    || !equalPose(player, delivery.carrierLocation)) return fail(save, 'physical-reception-required');
  let candidate = { ...clone(save), shipAnimalsV1: state };
  const finished = transition(candidate, animal.id, { ...animal.location, progress: 1 }, 'transport-complete', state.lastSimulationTime);
  if (!finished.ok) return fail(save, finished.code);
  const received = transition(finished.save, animal.id, { kind: 'intake', ...anchorFor(finished.save, animal) },
    'intake', state.lastSimulationTime, { transportComplete: true });
  if (!received.ok) return fail(save, received.code);
  candidate = received.save;
  const delivered = candidate.shipAnimalsV1.animals[animal.id];
  delivered.deliveryV87.phase = 'intake'; delivered.deliveryV87.elapsed = 0;
  delivered.deliveryV87.carrierLocation = null;
  delivered.deliveryV87.lastSimulationTime = state.lastSimulationTime;
  return commitCandidate(save, candidate.shipAnimalsV1,
    [{ type: 'animal-reception-started', animalId: animal.id }], 'intake-started');
}

/** Render-only projection: stock, validated carried/dropped anchor or intake berth. */
export function sampleShipAnimalDeliveriesV87(save) {
  const { state, error } = load(save);
  if (error) return [];
  return Object.values(state.animals).flatMap(animal => {
    const delivery = animal.deliveryV87;
    if (!delivery || !PHASES.includes(delivery.phase) || delivery.phase === 'delivered' || localTransit(animal)) return [];
    const location = delivery.phase === 'awaiting-pickup' ? animal.location.from
      : ['carried', 'awaiting-recovery'].includes(delivery.phase) ? delivery.carrierLocation
        : delivery.memberIds ? receivingPoint(berth(save, animal)) : animal.location;
    return [{ animalId: animal.id, ...(delivery.memberIds ? { animalIds: [...delivery.memberIds], unitId: delivery.unitId } : {}),
      phase: delivery.phase, elapsed: delivery.elapsed,
      roomId: location.roomId, deckId: location.deckId, x: location.x, y: location.y,
      carried: delivery.phase === 'carried', checkpoints: delivery.checkpoints.length }];
  });
}

/** Read-only resolution from either member; never creates another ownership list or route. */
export function getShipAnimalDeliveryUnitV87(save, animalId) {
  const { state, error } = load(save);
  if (error) return null;
  const leader = leaderOf(state, animalId);
  if (!leader?.deliveryV87) return null;
  return { animalId: leader.id, animalIds: membersOf(leader), unitId: leader.deliveryV87.unitId || leader.id,
    phase: leader.deliveryV87.phase, delivery: clone(leader.deliveryV87) };
}
