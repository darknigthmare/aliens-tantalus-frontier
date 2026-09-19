import { migrateShipAnimalStateV87 } from './ship-animal-state-v87.js';
import { SHIP_ANIMAL_ANNEX_V87, SHIP_ANIMAL_HABITATS_V87, getShipAnimalHabitatsV87 } from './ship-animal-habitat-v87.js';
import { buildShipAnimalNavigationV87, planShipAnimalRouteV87, stepShipAnimalRouteV87,
  sampleShipAnimalRouteV87 } from './ship-animal-navigation-v87.js';

export const SHIP_ANIMAL_ROUTINE_BODIES_V87 = Object.freeze({
  'animal-moka': Object.freeze({ w: 38, h: 38, speed: 42 }),
  'animal-brume': Object.freeze({ w: 60, h: 58, speed: 54 }),
  'animal-luciole': Object.freeze({ w: 36, h: 36, speed: 42 }),
  'animal-noisette': Object.freeze({ w: 44, h: 30, speed: 18, movement: 'enclosure-hop', hopHeight: 3 }),
  'animal-cafe': Object.freeze({ w: 36, h: 32, speed: 17, movement: 'enclosure-hop', hopHeight: 3 }),
  'animal-tic': Object.freeze({ w: 30, h: 16, speed: 16, movement: 'enclosure-walk', hopHeight: 0 }),
  'animal-tac': Object.freeze({ w: 32, h: 16, speed: 15, movement: 'enclosure-walk', hopHeight: 0 })
});
const clone = value => structuredClone(value);
const finite = value => typeof value === 'number' && Number.isFinite(value);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const own = (value, key) => Boolean(value && Object.hasOwn(value, key));
const EPS = 1e-7;
const PHASES = ['idle', 'walk', 'eat', 'sleep', 'pet'];
const DURATION = Object.freeze({ idle: 6, eat: 8, sleep: 12, pet: 4 / 3 });
const place = point => ({ hubId: 'tantalus', deckId: point.deckId,
  roomId: point.roomId, x: point.x, y: point.y });
const samePlace = (a, b) => ['hubId', 'deckId', 'roomId'].every(key => a?.[key] === b?.[key])
  && Math.abs(a?.x - b?.x) < EPS && Math.abs(a?.y - b?.y) < EPS;
const eventIdValid = value => typeof value === 'string'
  && /^[a-zA-Z0-9][a-zA-Z0-9:._-]{0,95}$/.test(value)
  && !['__proto__', 'prototype', 'constructor'].includes(value);
const fail = (save, code) => ({ ok: false, changed: false, code, save: clone(save), events: [] });
const unchanged = (save, code = 'unchanged') => ({ ok: true, changed: false, code, save: clone(save), events: [] });

const enclosed = animal => Boolean(SHIP_ANIMAL_ROUTINE_BODIES_V87[animal?.id]?.movement);
const enclosureFor = animal => SHIP_ANIMAL_HABITATS_V87.find(habitat => habitat.id === animal?.habitatId
  && habitat.navigationDomain === 'enclosure-volume' && own(habitat.memberLocations, animal.id)
  && habitat.compatibleFamilyIds.includes(animal.familyId));
const targetsFor = (habitat, animal) => habitat.memberRoutineTargets?.[animal.id] || habitat.routineTargets;

// Each member has a safe half-volume. The pair remains together in one enclosure
// without two bodies being stacked, crossing a neighbour or reaching the human lane.
function enclosurePointValid(animal, point, grounded = false) {
  const habitat = enclosureFor(animal), body = SHIP_ANIMAL_ROUTINE_BODIES_V87[animal.id];
  const home = habitat?.memberLocations[animal.id], bounds = habitat?.enclosureBounds;
  const targets = habitat?.memberRoutineTargets[animal.id];
  return Boolean(home && bounds && targets && body && point
    && ['hubId', 'deckId', 'roomId'].every(key => point[key] === home[key])
    && finite(point.x) && finite(point.y) && point.x >= targets.minX - EPS && point.x <= targets.maxX + EPS
    && point.y <= home.y + EPS && point.y >= home.y - (grounded ? 0 : body.hopHeight) - EPS
    && point.x - body.w / 2 >= bounds.x - EPS && point.x + body.w / 2 <= bounds.x + bounds.w + EPS
    && point.y - body.h >= bounds.y - EPS && point.y <= bounds.y + bounds.h + EPS);
}
function enclosureRouteLocation(route) {
  const progress = Math.min(1, route.elapsed / route.duration);
  const hops = Math.max(1, Math.ceil(Math.abs(route.to.x - route.from.x) / 16));
  const lift = progress <= EPS || progress >= 1 - EPS ? 0
    : route.hopHeight * Math.sin(Math.PI * progress * hops) ** 2;
  return { kind: 'resident', ...place(route.from),
    x: route.from.x + (route.to.x - route.from.x) * progress, y: route.from.y - lift };
}
function validateEnclosureRoutine(animal, routine, clock) {
  const habitat = enclosureFor(animal), body = SHIP_ANIMAL_ROUTINE_BODIES_V87[animal.id];
  if (!habitat || !enclosurePointValid(animal, animal.location, routine.phase !== 'walk')
    || animal.location.kind !== 'resident' || routine.phase === 'pet') return 'unsafe-enclosure-origin';
  if (routine.phase !== 'walk') return routine.route !== null || routine.elapsed > DURATION[routine.phase] + EPS
    ? 'invalid-enclosure-routine' : null;
  const route = routine.route;
  if (!object(route) || route.kind !== 'enclosure-volume' || route.schema !== 87
    || route.habitatId !== habitat.id || route.actorId !== animal.id || route.speed !== body.speed
    || route.body?.w !== body.w || route.body?.h !== body.h || route.hopHeight !== body.hopHeight
    || !enclosurePointValid(animal, route.from, true) || !enclosurePointValid(animal, route.to, true)
    || !finite(route.duration) || route.duration <= 0
    || Math.abs(route.duration - Math.abs(route.to.x - route.from.x) / body.speed) > EPS
    || !finite(route.elapsed) || route.elapsed < 0 || route.elapsed >= route.duration + EPS
    || !finite(route.simulationTime) || route.simulationTime < 0 || route.simulationTime > clock + EPS
    || route.status !== 'moving' || Math.abs(routine.elapsed - route.elapsed) > EPS
    || !samePlace(animal.location, enclosureRouteLocation(route))) return 'invalid-enclosure-route';
  return null;
}
function beginEnclosureWalk(animal, target, afterWalk, time, blockedRoomIds) {
  const habitat = enclosureFor(animal), body = SHIP_ANIMAL_ROUTINE_BODIES_V87[animal.id];
  if (!habitat || !enclosurePointValid(animal, animal.location, true)
    || !enclosurePointValid(animal, target, true)) return { ok: false, reason: 'enclosure-boundary' };
  if (blockedRoomIds.includes(habitat.location.roomId)) return { ok: false, reason: 'enclosure-protected' };
  const duration = Math.abs(target.x - animal.location.x) / body.speed;
  const routine = animal.routineV87;
  routine.phase = duration <= EPS ? afterWalk : 'walk'; routine.elapsed = 0; routine.afterWalk = afterWalk;
  routine.route = duration <= EPS ? null : { schema: 87, kind: 'enclosure-volume', habitatId: habitat.id,
    actorId: animal.id, body: { w: body.w, h: body.h }, speed: body.speed, hopHeight: body.hopHeight,
    from: place(animal.location), to: place(target), duration, elapsed: 0, simulationTime: time, status: 'moving' };
  if (duration > EPS) routine.facing = target.x > animal.location.x ? 1 : -1;
  animal.activity = routine.phase;
  return { ok: true };
}

/** Adapt real hub geometry and the authored two-sided annex door. No auto-opening. */
export function createShipAnimalRoutineGraphV87({
  floor, platforms = [], obstacles = [], doors = [], regions = [], annexDoor = {}
} = {}) {
  const annex = SHIP_ANIMAL_ANNEX_V87;
  return buildShipAnimalNavigationV87({
    deckId: 'habitat', floor, platforms, obstacles, doors, regions,
    annexes: [{
      id: annex.id, kind: annex.navigationKind, deckId: annex.parentDeck,
      parentRoomId: annex.parentRoomId, world: annex.world,
      floor: annex.platforms.find(entry => entry.role === 'floor'),
      platforms: annex.platforms, obstacles: annex.colliders,
      regions: [{ id: 'animal-care:certified-floor', roomId: annex.id,
        bounds: { x: 0, y: 0, w: annex.world.width, h: annex.world.floorY },
        tags: ['certified-pet-room'] }],
      door: { ...annexDoor, id: annex.entrance.id,
        parentBounds: annex.parentDoorBounds,
        annexBounds: { x: annex.entranceLocalX - annex.entrance.w / 2,
          y: annex.entrance.y, w: annex.entrance.w, h: annex.entrance.h },
        progress: finite(annexDoor.progress) ? annexDoor.progress : 0,
        duration: 0.6 }
    }]
  });
}

function load(save, graph) {
  if (!object(save)) return { error: 'invalid-save' };
  const state = migrateShipAnimalStateV87(save.shipAnimalsV1);
  if (state.schema !== 1) return { error: 'unsupported-schema' };
  if (state.quarantined.length) return { error: 'state-needs-review' };
  if (!graph?.valid || graph.schema !== 87 || !Array.isArray(graph.rooms)
    || !Array.isArray(graph.doors)) return { error: 'invalid-graph' };
  return { state };
}

function initialRoutine() {
  return { schema: 87, phase: 'idle', elapsed: 0, facing: 1, route: null,
    afterWalk: 'idle', next: 'food', petCooldownUntil: 0, lastPetEventId: null };
}
function canonicalRouteLocation(route) {
  if (route.location.kind !== 'transit') return { kind: 'resident', ...place(route.location) };
  const segment = route.segments[route.segmentIndex];
  return { kind: 'transit', edgeId: segment.doorId,
    from: place(segment.from), to: place(segment.to), progress: route.location.progress };
}
function sameLocation(left, right) {
  return left?.kind === right?.kind && (left.kind === 'transit'
    ? left.edgeId === right.edgeId && Math.abs(left.progress - right.progress) < EPS
      && samePlace(left.from, right.from) && samePlace(left.to, right.to)
    : samePlace(left, right));
}
function validateRoutine(animal, graph, clock) {
  const routine = animal.routineV87;
  if (routine === undefined) return animal.location.kind === 'resident' ? null : 'not-resident';
  if (!object(routine) || routine.schema !== 87 || !PHASES.includes(routine.phase)
    || !finite(routine.elapsed) || routine.elapsed < 0 || ![1, -1].includes(routine.facing)
    || !['idle', 'eat', 'sleep'].includes(routine.afterWalk)
    || !['food', 'bed', 'stroll'].includes(routine.next)
    || !finite(routine.petCooldownUntil) || routine.petCooldownUntil < 0
    || !(routine.lastPetEventId === null || eventIdValid(routine.lastPetEventId))) return 'invalid-routine';
  if (enclosed(animal)) return validateEnclosureRoutine(animal, routine, clock);
  if (routine.phase !== 'walk') return routine.route !== null || animal.location.kind !== 'resident'
    || routine.elapsed > DURATION[routine.phase] + EPS ? 'invalid-routine' : null;
  const route = routine.route;
  const body = SHIP_ANIMAL_ROUTINE_BODIES_V87[animal.id];
  if (!route || !body || route.actorId !== animal.id || route.speed !== body.speed
    || route.body?.w !== body.w || route.body?.h !== body.h
    || !finite(route.simulationTime) || route.simulationTime > clock + EPS
    || !stepShipAnimalRouteV87(graph, route, 0).ok
    || !sameLocation(animal.location, canonicalRouteLocation(route))) return 'invalid-routine-route';
  return null;
}
function eligible(animal) {
  return animal.location.kind === 'resident'
    || (animal.location.kind === 'transit' && animal.routineV87?.phase === 'walk');
}
function physicalOrigin(animal, graph) {
  if (enclosed(animal)) return animal.location.kind === 'resident'
    && enclosurePointValid(animal, animal.location, animal.routineV87?.phase !== 'walk');
  if (animal.location.kind === 'transit') return true; // Validated itinerary owns this edge.
  const body = SHIP_ANIMAL_ROUTINE_BODIES_V87[animal.id];
  return animal.location.hubId === 'tantalus' && body
    && planShipAnimalRouteV87(graph, { actorId: animal.id, location: animal.location,
      target: animal.location, body, speed: body.speed }).ok;
}
function habitatFor(save, animal) {
  return getShipAnimalHabitatsV87(save).find(entry => entry.id === animal.habitatId && entry.installed);
}
function targetFor(habitat, next, animal) {
  // Paw anchors place each mouth at its separate food dish, never at room centre.
  const home = habitat.memberLocations?.[animal.id] || habitat.location;
  const x = next === 'food' || next === 'stroll' ? targetsFor(habitat, animal)[next] : home.x;
  return { ...home, x };
}
function beginWalk(animal, graph, target, afterWalk, time, blockedRoomIds) {
  if (enclosed(animal)) return beginEnclosureWalk(animal, target, afterWalk, time, blockedRoomIds);
  const body = SHIP_ANIMAL_ROUTINE_BODIES_V87[animal.id];
  const planned = planShipAnimalRouteV87(graph, { actorId: animal.id,
    location: animal.location, target, body, speed: body.speed,
    simulationTime: time, blockedRoomIds });
  if (!planned.ok) return planned;
  animal.routineV87.phase = planned.state.status === 'arrived' ? afterWalk : 'walk';
  animal.routineV87.elapsed = 0;
  animal.routineV87.afterWalk = afterWalk;
  animal.routineV87.route = planned.state.status === 'arrived' ? null : planned.state;
  animal.activity = animal.routineV87.phase;
  return { ok: true };
}
function publish(save, state, events, code) {
  if (!Number.isSafeInteger(state.revision + 1)
    || Object.values(state.animals).some(animal => !Number.isSafeInteger(animal.revision)))
    return fail(save, 'invalid-revision');
  const candidate = clone(save);
  state.revision += 1;
  candidate.shipAnimalsV1 = state;
  return { ok: true, changed: true, code, save: candidate, events };
}

/**
 * Pure, bounded active-play simulation. Absolute time is an idempotency token,
 * never wall-clock catch-up. Caller commits before publishing this candidate.
 */
export function stepShipAnimalRoutinesV87(save, {
  delta = 0, simulationTime = null, graph, doors = null, blockedRoomIds = [], paused = false
} = {}) {
  if (paused) return unchanged(save, 'paused');
  const { state, error } = load(save, graph);
  if (error) return fail(save, error);
  if (!finite(delta) || delta < 0 || delta > 0.25) return fail(save, 'invalid-active-delta');
  if (simulationTime !== null && !finite(simulationTime)) return fail(save, 'invalid-simulation-time');
  const elapsed = simulationTime === null ? delta : simulationTime - state.lastSimulationTime;
  if (!finite(elapsed) || elapsed < -EPS || elapsed > delta + EPS) return fail(save, 'invalid-simulation-time');
  if (elapsed <= EPS) return unchanged(save);
  const animals = Object.values(state.animals).filter(eligible);
  if (!animals.length) return unchanged(save, 'no-residents');
  const habitats = new Map();
  for (const animal of animals) {
    const invalid = validateRoutine(animal, graph, state.lastSimulationTime);
    if (invalid) return fail(save, invalid);
    if (!physicalOrigin(animal, graph)) return fail(save, 'unsafe-origin');
    const habitat = habitatFor(save, animal);
    if (!habitat) return fail(save, 'habitat-unavailable');
    habitats.set(animal.id, habitat);
  }
  const start = state.lastSimulationTime;
  const events = [];
  for (const animal of animals) {
    animal.routineV87 ??= initialRoutine();
    const routine = animal.routineV87;
    let remaining = elapsed;
    for (let guard = 0; remaining > EPS && guard < 8; guard += 1) {
      const time = start + elapsed - remaining;
      if (routine.phase === 'walk') {
        const route = routine.route;
        if (enclosed(animal)) {
          if (blockedRoomIds.includes(animal.location.roomId)) { remaining = 0; break; }
          const dt = Math.min(remaining, Math.max(0, route.duration - route.elapsed));
          route.elapsed += dt; route.simulationTime = time + dt;
          routine.elapsed = route.elapsed;
          animal.location = enclosureRouteLocation(route);
          if (!enclosurePointValid(animal, animal.location)) return fail(save, 'enclosure-boundary');
          remaining -= dt;
          if (route.elapsed + EPS >= route.duration) {
            animal.location = { kind: 'resident', ...place(route.to) };
            routine.phase = routine.afterWalk; routine.route = null; routine.elapsed = 0;
          }
          continue;
        }
        const durationLeft = route.segments.slice(route.segmentIndex)
          .reduce((sum, segment) => sum + segment.duration, 0) - route.segmentElapsed;
        const dt = Math.min(remaining, Math.max(EPS, durationLeft));
        const stepped = stepShipAnimalRouteV87(graph, route, dt, { doors, blockedRoomIds });
        if (!stepped.ok) return fail(save, 'invalid-routine-route');
        const old = sampleShipAnimalRouteV87(route);
        const next = sampleShipAnimalRouteV87(stepped.state);
        if (old?.roomId === next?.roomId && Math.abs(next.x - old.x) > EPS)
          routine.facing = next.x >= old.x ? 1 : -1;
        routine.route = stepped.state;
        animal.location = canonicalRouteLocation(stepped.state);
        routine.elapsed += dt;
        remaining -= dt;
        events.push(...stepped.events);
        if (stepped.state.status === 'arrived') {
          routine.phase = routine.afterWalk; routine.route = null; routine.elapsed = 0;
        } else if (stepped.state.status !== 'moving') {
          // Waiting is visible; no teleport or forcible door-opening on timeout.
          events.push({ type: 'animal-route-wait', animalId: animal.id, reason: stepped.state.reason });
          remaining = 0;
        }
      } else {
        const consumed = Math.min(remaining, Math.max(0, DURATION[routine.phase] - routine.elapsed));
        routine.elapsed += consumed; remaining -= consumed;
        if (routine.phase === 'eat') animal.needs.satiety = Math.min(100, animal.needs.satiety + consumed * 2);
        if (routine.phase === 'sleep') animal.needs.rest = Math.min(100, animal.needs.rest + consumed * 2);
        if (routine.elapsed + EPS < DURATION[routine.phase]) break;
        if (routine.phase === 'pet') {
          routine.phase = 'idle'; routine.elapsed = 0; continue;
        }
        const next = routine.phase === 'eat' ? 'bed' : routine.phase === 'sleep' ? 'stroll' : routine.next;
        const target = targetFor(habitats.get(animal.id), next, animal);
        const afterWalk = next === 'food' ? 'eat' : next === 'bed' ? 'sleep' : 'idle';
        const planned = beginWalk(animal, graph, target, afterWalk,
          time + consumed, blockedRoomIds);
        if (!planned.ok) {
          routine.phase = 'idle'; routine.elapsed = 0;
          events.push({ type: 'animal-route-blocked', animalId: animal.id, reason: planned.reason });
          remaining = 0;
        } else {
          routine.next = next === 'stroll' ? 'food' : next;
        }
      }
    }
    // The mouth faces the actual dish after arrival, independent of approach direction.
    // Walking keeps its movement-facing; this also repairs a saved backward eat pose.
    if (routine.phase === 'eat') routine.facing = targetsFor(habitats.get(animal.id), animal).foodFacing;
    animal.activity = routine.phase;
    animal.lastSimulationTime = start + elapsed;
    animal.revision += 1;
  }
  state.lastSimulationTime = start + elapsed;
  return publish(save, state, events, 'advanced');
}

/** Optional local outing. Target remains a real certified route, never a warp. */
export function requestShipAnimalWalkV87(save, { animalId, target } = {}, {
  graph, blockedRoomIds = []
} = {}) {
  const { state, error } = load(save, graph);
  if (error) return fail(save, error);
  const animal = own(state.animals, animalId) && state.animals[animalId];
  if (!animal || animal.location.kind !== 'resident') return fail(save, 'resident-required');
  if (enclosed(animal)) return fail(save, 'enclosure-supervision-required');
  const invalid = validateRoutine(animal, graph, state.lastSimulationTime);
  if (invalid) return fail(save, invalid);
  if (!habitatFor(save, animal)) return fail(save, 'habitat-unavailable');
  if (!target || !['animal-care', 'crew-quarters'].includes(target.roomId)
    || (target.hubId && target.hubId !== 'tantalus')) return fail(save, 'forbidden-destination');
  animal.routineV87 ??= initialRoutine();
  if (animal.routineV87.phase === 'pet') return fail(save, 'interaction-in-progress');
  const planned = beginWalk(animal, graph, target, 'idle', state.lastSimulationTime, blockedRoomIds);
  if (!planned.ok) return fail(save, planned.reason);
  animal.revision += 1;
  return publish(save, state, [], 'walk-requested');
}

/** A visible resident may be petted nearby. No crew/stat/economy bonuses. */
export function petShipAnimalV87(save, { animalId, eventId } = {}, {
  player, graph, simulationTime = null
} = {}) {
  const { state, error } = load(save, graph);
  if (error) return fail(save, error);
  if (!eventIdValid(eventId)) return fail(save, 'invalid-event-id');
  const animal = own(state.animals, animalId) && state.animals[animalId];
  if (!animal || animal.location.kind !== 'resident') return fail(save, 'resident-required');
  if (enclosed(animal)) return fail(save, 'enclosure-observation-only');
  const invalid = validateRoutine(animal, graph, state.lastSimulationTime);
  if (invalid) return fail(save, invalid);
  if (!habitatFor(save, animal) || !physicalOrigin(animal, graph)) return fail(save, 'unsafe-origin');
  if (simulationTime !== null && (!finite(simulationTime)
    || Math.abs(simulationTime - state.lastSimulationTime) > EPS)) return fail(save, 'invalid-simulation-time');
  animal.routineV87 ??= initialRoutine();
  const routine = animal.routineV87;
  if (routine.lastPetEventId === eventId || animal.eventIds.includes(eventId)) return unchanged(save, 'already-applied');
  if (!player || player.alive !== true || player.deckId !== animal.location.deckId
    || player.roomId !== animal.location.roomId || !finite(player.x) || !finite(player.y)
    || Math.abs(player.x - animal.location.x) > 76 || Math.abs(player.y - animal.location.y) > 12)
    return fail(save, 'physical-proximity-required');
  if (state.lastSimulationTime < routine.petCooldownUntil) return fail(save, 'pet-cooldown');
  if (routine.phase === 'walk' || routine.phase === 'eat') return fail(save, 'animal-busy');
  routine.phase = 'pet'; routine.elapsed = 0; routine.route = null;
  routine.facing = player.x >= animal.location.x ? 1 : -1;
  routine.petCooldownUntil = state.lastSimulationTime + 15;
  routine.lastPetEventId = eventId;
  // No economic effect; social welfare only, with bounded replay history.
  animal.needs.social = Math.min(100, animal.needs.social + 5);
  animal.eventIds = [...animal.eventIds, eventId].slice(-128);
  animal.activity = 'pet'; animal.revision += 1;
  return publish(save, state, [{ type: 'animal-petted', animalId }], 'petted');
}

/** Observe from the human lane. No contact through a closed wall, rewards or time. */
export function observeShipAnimalEnclosureV87(save, { habitatId } = {}, { player, graph } = {}) {
  const { state, error } = load(save, graph);
  if (error) return fail(save, error);
  const habitat = getShipAnimalHabitatsV87(save).find(entry => entry.id === habitatId
    && entry.installed && entry.navigationDomain === 'enclosure-volume');
  if (!habitat) return fail(save, 'habitat-unavailable');
  if (!player || player.alive !== true || player.roomId !== habitat.location.roomId
    || player.deckId !== habitat.location.deckId || !finite(player.x) || !finite(player.y)
    || Math.abs(player.x - habitat.installX) > 52 || Math.abs(player.y - habitat.receivingPoint.y) > 12)
    return fail(save, 'physical-proximity-required');
  const animals = Object.values(state.animals).filter(animal => animal.habitatId === habitat.id && eligible(animal));
  if (animals.some(animal => !enclosed(animal) || !physicalOrigin(animal, graph)
    || validateRoutine(animal, graph, state.lastSimulationTime))) return fail(save, 'unsafe-enclosure-origin');
  return { ...unchanged(save, 'observed'), animals: animals.map(animal => ({ animalId: animal.id,
    name: animal.name, activity: animal.activity, location: clone(animal.location), needs: clone(animal.needs) })) };
}

/** Projection only: no ticking, ownership creation, actor insertion or persistence. */
export function sampleShipAnimalRoutinesV87(save, { roomId, deckId = 'habitat', graph } = {}) {
  const state = migrateShipAnimalStateV87(save?.shipAnimalsV1);
  if (state.schema !== 1 || state.quarantined.length || !graph?.valid) return [];
  return Object.values(state.animals).filter(eligible).flatMap(animal => {
    if (validateRoutine(animal, graph, state.lastSimulationTime)
      || !physicalOrigin(animal, graph) || !habitatFor(save, animal)) return [];
    const routine = animal.routineV87;
    const location = !enclosed(animal) && routine?.phase === 'walk' && routine.route
      ? sampleShipAnimalRouteV87(routine.route) : animal.location;
    if (!location || location.roomId !== roomId || location.deckId !== deckId) return [];
    const moving = routine?.phase === 'walk' && routine.route?.status === 'moving';
    const phase = moving ? 'walk' : routine?.phase === 'walk' ? 'idle' : routine?.phase || 'idle';
    return [{ animalId: animal.id, name: animal.name, x: location.x, y: location.y,
      roomId: location.roomId, deckId: location.deckId, clipId: phase,
      elapsed: routine?.elapsed || 0, facing: routine?.facing || 1,
      enclosed: enclosed(animal), habitatId: animal.habitatId, observationOnly: enclosed(animal),
      transit: location.kind === 'transit', depthProgress: location.depthProgress ?? null }];
  });
}
