import { HUB_DECKS, HUB_WORLD } from './hub-game.js';

export const SHIP_ANIMAL_NAV_SCHEMA_V87 = 87;
export const SHIP_ANIMAL_DOOR_OPEN_V87 = 0.82;
const EPS = 0.001;
const forbiddenTags = new Set([
  'exterior-airlock', 'biohazard-quarantine', 'pathogen-lab', 'active-firing-range',
  'active-hangar', 'reactor-core', 'hazardous-machinery', 'ammunition-storage', 'critical-duct'
]);
const list = (value) => Array.isArray(value) ? value : [];
const copy = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const rect = (value) => value && ['x', 'y', 'w', 'h'].every((key) => finite(value[key])) && value.w > 0 && value.h > 0;
const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const taggedUnsafe = (value) => list(value?.tags).some((tag) => forbiddenTags.has(tag));
const locked = (door) => Boolean(door?.locked || door?.levelLocked || door?.permissionDenied || taggedUnsafe(door));
const roomById = (graph, id) => graph.rooms.find((room) => room.id === id);
const failure = (reason, extra = {}) => ({ ok: false, reason, ...extra });

function permittedRegion(region, room, annex = false) {
  if (!rect(region?.bounds) || region.roomId !== room.id || taggedUnsafe(region)) return false;
  const bounds = region.bounds;
  if (bounds.x < room.bounds.x || bounds.x + bounds.w > room.bounds.x + room.bounds.w
    || bounds.y > room.floor.y || bounds.y + bounds.h < room.floor.y) return false;
  if (annex) return list(region.tags).includes('certified-pet-room');
  return room.id === 'crew-quarters'
    ? list(region.tags).some((tag) => ['crew-rest', 'habitat-corridor'].includes(tag))
    : room.id === 'mess' && list(region.tags).includes('mess-rest-area');
}

function normalizeDoor(raw) {
  return {
    id: raw.id, fromRoomId: raw.fromRoomId || raw.from, toRoomId: raw.toRoomId || raw.to,
    bounds: copy(raw.bounds), parentBounds: copy(raw.parentBounds), annexBounds: copy(raw.annexBounds),
    kind: raw.kind || 'door', lift: Boolean(raw.lift), depth: Boolean(raw.depth),
    progress: finite(raw.progress) ? Math.max(0, Math.min(1, raw.progress)) : 0,
    locked: locked(raw), tags: [...list(raw.tags)],
    duration: finite(raw.duration) && raw.duration > 0 ? raw.duration : 0.6
  };
}

/**
 * Geometry comes from the active hub, not an animal-specific copy of its map.
 * floor must be the real global floor (or a registered annex floor).
 * regions certify only walkable rest areas; an entire mess is never implicit.
 * Annex definitions and their two door bounds are authored/injected by the caller.
 */
export function buildShipAnimalNavigationV87({
  deckId = 'habitat', floor, platforms = [], obstacles = [], doors = [], regions = [], annexes = []
} = {}) {
  const deck = HUB_DECKS.find((entry) => entry.id === deckId);
  const errors = [];
  if (!deck) errors.push('unknown-deck');
  if (!floor || !['x', 'y', 'w'].every((key) => finite(floor[key])) || floor.w <= 0
    || floor.x < 0 || floor.x + floor.w > HUB_WORLD.width || floor.y !== HUB_WORLD.floorY) errors.push('invalid-authoritative-floor');
  if (errors.length) return { schema: SHIP_ANIMAL_NAV_SCHEMA_V87, valid: false, errors, deckId, rooms: [], doors: [] };
  const rooms = deck.rooms.map((source) => {
    const room = {
      id: source.id, deckId, spaceId: 'hub:' + deckId,
      bounds: { x: source.xStart, y: 0, w: source.xEnd - source.xStart, h: floor.y },
      floor: { ...copy(floor), id: floor.id || deckId + ':floor' },
      obstacles: copy(list(obstacles).filter((item) => rect(item) && (!item.roomId || item.roomId === source.id))),
      platforms: copy(list(platforms).filter((item) => rect(item) && (!item.roomId || item.roomId === source.id))),
      regions: []
    };
    const authored = list(regions).filter((region) => region.roomId === room.id);
    const candidates = authored.length ? authored : room.id === 'crew-quarters' ? [{
      id: 'crew-quarters:ground-rest', roomId: room.id, bounds: copy(room.bounds), tags: ['crew-rest']
    }] : [];
    room.regions = copy(candidates.filter((region) => permittedRegion(region, room)));
    return room;
  });
  const knownIds = new Set(rooms.map((room) => room.id));
  const normalizedDoors = list(doors).filter((door) => typeof door?.id === 'string').map(normalizeDoor);
  for (const annex of list(annexes).slice(0, 32)) {
    const parent = rooms.find((room) => room.id === annex.parentRoomId);
    const af = annex.floor;
    if (!parent || annex.kind !== 'animal-care-annex' || typeof annex.id !== 'string' || !annex.id || knownIds.has(annex.id)
      || typeof annex.door?.id !== 'string' || !annex.door.id
      || annex.deckId !== deckId || !annex.world || !finite(annex.world.width) || annex.world.width <= 0
      || !af || !['x', 'y', 'w'].every((key) => finite(af[key])) || af.w <= 0
      || af.x < 0 || af.x + af.w > annex.world.width || af.y <= 0
      || !rect(annex.door?.parentBounds) || !rect(annex.door?.annexBounds)
      || annex.door.parentBounds.x < parent.bounds.x
      || annex.door.parentBounds.x + annex.door.parentBounds.w > parent.bounds.x + parent.bounds.w
      || annex.door.annexBounds.x < 0 || annex.door.annexBounds.x + annex.door.annexBounds.w > annex.world.width
      || Math.abs(annex.door.parentBounds.y + annex.door.parentBounds.h - parent.floor.y) > 2
      || Math.abs(annex.door.annexBounds.y + annex.door.annexBounds.h - af.y) > 2) {
      errors.push('invalid-annex:' + String(annex?.id || 'unknown'));
      continue;
    }
    const room = {
      id: annex.id, deckId, spaceId: 'annex:' + annex.id,
      bounds: { x: 0, y: 0, w: annex.world.width, h: af.y },
      floor: { ...copy(af), id: af.id || annex.id + ':floor' },
      obstacles: copy(list(annex.obstacles).filter(rect)),
      platforms: copy(list(annex.platforms).filter(rect)),
      regions: []
    };
    room.regions = copy(list(annex.regions).filter((region) => permittedRegion(region, room, true)));
    rooms.push(room);
    knownIds.add(room.id);
    normalizedDoors.push(normalizeDoor({
      ...annex.door, fromRoomId: parent.id, toRoomId: room.id, depth: true, kind: 'annex-door'
    }));
  }
  if (new Set(normalizedDoors.map((door) => door.id)).size !== normalizedDoors.length) errors.push('duplicate-door-id');
  return {
    schema: SHIP_ANIMAL_NAV_SCHEMA_V87, valid: errors.length === 0, errors, deckId, rooms,
    doors: normalizedDoors.filter((door) => door.lift
      || (knownIds.has(door.fromRoomId) && knownIds.has(door.toRoomId)))
  };
}

function normalizeBody(body) {
  return body && finite(body.w) && finite(body.h) && body.w > 0 && body.h > 0
    && body.w <= 256 && body.h <= 192 ? { w: body.w, h: body.h } : null;
}

function point(graph, value) {
  const room = roomById(graph, value?.roomId);
  if (!room || !finite(value?.x) || (value.deckId && value.deckId !== room.deckId)
    || (value.spaceId && value.spaceId !== room.spaceId)
    || (value.y != null && (!finite(value.y) || Math.abs(value.y - room.floor.y) > EPS))) return null;
  return {
    kind: 'room', deckId: room.deckId, roomId: room.id, spaceId: room.spaceId,
    supportId: room.floor.id, x: value.x, y: room.floor.y
  };
}

function coveredByRegions(room, startX, endX, body) {
  const left = Math.min(startX, endX) - body.w / 2;
  const right = Math.max(startX, endX) + body.w / 2;
  if (left < room.floor.x || right > room.floor.x + room.floor.w) return false;
  const spans = room.regions.filter((region) => region.bounds.y <= room.floor.y - body.h)
    .map((region) => [region.bounds.x, region.bounds.x + region.bounds.w]).sort((a, b) => a[0] - b[0]);
  let cursor = left;
  for (const [min, max] of spans) {
    if (max < cursor) continue;
    if (min > cursor + EPS) return false;
    cursor = Math.max(cursor, max);
    if (cursor >= right - EPS) return true;
  }
  return false;
}

function clearWalk(graph, from, to, body, blockedRoomIds = []) {
  if (!from || !to || from.roomId !== to.roomId || from.spaceId !== to.spaceId) return false;
  const room = roomById(graph, from.roomId);
  if (!room || list(blockedRoomIds).includes(room.id) || !coveredByRegions(room, from.x, to.x, body)) return false;
  const swept = {
    x: Math.min(from.x, to.x) - body.w / 2, y: room.floor.y - body.h,
    w: Math.abs(to.x - from.x) + body.w, h: body.h
  };
  return ![...room.obstacles, ...room.platforms.filter((platform) => platform.y < room.floor.y)]
    .some((obstacle) => obstacle.collidable !== false && intersects(swept, obstacle));
}

function doorPoints(graph, door, body) {
  const from = roomById(graph, door.fromRoomId);
  const to = roomById(graph, door.toRoomId);
  if (!from || !to || door.lift || taggedUnsafe(door)
    || !['door', 'bulkhead', 'annex-door'].includes(door.kind)) return null;
  if (door.depth) {
    if (!rect(door.parentBounds) || !rect(door.annexBounds)) return null;
    if ([door.parentBounds, door.annexBounds].some((bounds) => bounds.w < body.w || bounds.h < body.h)) return null;
    return [
      point(graph, { roomId: from.id, x: door.parentBounds.x + door.parentBounds.w / 2 }),
      point(graph, { roomId: to.id, x: door.annexBounds.x + door.annexBounds.w / 2 })
    ];
  }
  if (!rect(door.bounds) || from.spaceId !== to.spaceId || Math.abs(from.floor.y - to.floor.y) > EPS) return null;
  if (door.bounds.w < body.w || door.bounds.h < body.h) return null;
  const right = to.bounds.x > from.bounds.x;
  const boundary = right ? from.bounds.x + from.bounds.w : from.bounds.x;
  if (boundary < door.bounds.x || boundary > door.bounds.x + door.bounds.w
    || Math.abs(door.bounds.y + door.bounds.h - from.floor.y) > 2) return null;
  const west = door.bounds.x - body.w / 2 - 2;
  const east = door.bounds.x + door.bounds.w + body.w / 2 + 2;
  return [
    point(graph, { roomId: from.id, x: right ? west : east }),
    point(graph, { roomId: to.id, x: right ? east : west })
  ];
}

function clearDoor(graph, door, body, blockedRoomIds = []) {
  const pair = doorPoints(graph, door, body);
  if (!pair || pair.some((entry) => !clearWalk(graph, entry, entry, body, blockedRoomIds))) return false;
  if (door.depth) return true;
  const rooms = pair.map((entry) => roomById(graph, entry.roomId));
  const corridor = { floor: rooms[0].floor, regions: rooms.flatMap((room) => room.regions) };
  if (!coveredByRegions(corridor, pair[0].x, pair[1].x, body)) return false;
  const swept = { x: Math.min(pair[0].x, pair[1].x) - body.w / 2, y: pair[0].y - body.h,
    w: Math.abs(pair[1].x - pair[0].x) + body.w, h: body.h };
  return !rooms.flatMap((room) => [...room.obstacles, ...room.platforms.filter((platform) => platform.y < room.floor.y)])
    .some((obstacle) => obstacle.collidable !== false && intersects(swept, obstacle));
}

const samePoint = (left, right) => Boolean(left && right && left.kind === right.kind
  && left.deckId === right.deckId && left.roomId === right.roomId && left.spaceId === right.spaceId
  && left.supportId === right.supportId
  && Math.abs(left.x - right.x) <= EPS && Math.abs(left.y - right.y) <= EPS);

/** Coordinates are paw/foot anchors (body centre X, contact Y), never sprite top-left. */
export function planShipAnimalRouteV87(graph, {
  actorId, location, target, body, speed = 60, simulationTime = 0, blockedRoomIds = []
} = {}) {
  if (!graph?.valid || graph.schema !== SHIP_ANIMAL_NAV_SCHEMA_V87) return failure('invalid-graph');
  if (!actorId || typeof actorId !== 'string' || actorId.length > 128) return failure('invalid-actor');
  const shape = normalizeBody(body);
  if (!shape || !finite(speed) || speed <= 0 || speed > 240) return failure('invalid-body-or-speed');
  if ((target?.deckId && target.deckId !== graph.deckId) || target?.kind === 'lift')
    return failure('unsupported-need-escort', { needsEscort: true });
  if (['ladder', 'vent', 'duct'].includes(target?.kind)) return failure('unsupported-traversal');
  const start = point(graph, location);
  const finish = point(graph, target);
  if (!start || !finish) return failure('invalid-location');
  if (!roomById(graph, finish.roomId)?.regions.length) return failure('forbidden-region');
  if (!clearWalk(graph, start, start, shape, blockedRoomIds)) return failure('unsafe-origin');
  if (!clearWalk(graph, finish, finish, shape, blockedRoomIds)) return failure('unsafe-destination');
  const nodes = [start, finish];
  const connections = [];
  let deniedDoor = false;
  for (const door of graph.doors) {
    const pair = doorPoints(graph, door, shape);
    if (!pair || !clearDoor(graph, door, shape, blockedRoomIds)) continue;
    if (locked(door)) { deniedDoor = true; continue; }
    const first = nodes.length;
    nodes.push(...pair);
    const duration = door.depth ? door.duration : Math.abs(pair[1].x - pair[0].x) / speed;
    connections.push({ from: first, to: first + 1, kind: 'door', doorId: door.id, depth: door.depth, duration });
    connections.push({ from: first + 1, to: first, kind: 'door', doorId: door.id, depth: door.depth, duration });
  }
  for (let from = 0; from < nodes.length; from += 1) {
    for (let to = from + 1; to < nodes.length; to += 1) {
      if (!clearWalk(graph, nodes[from], nodes[to], shape, blockedRoomIds)) continue;
      const duration = Math.abs(nodes[from].x - nodes[to].x) / speed;
      connections.push({ from, to, kind: 'walk', duration }, { from: to, to: from, kind: 'walk', duration });
    }
  }
  const costs = nodes.map(() => Infinity);
  const previous = new Map();
  const pending = new Set(nodes.map((_, index) => index));
  costs[0] = 0;
  while (pending.size) {
    const current = [...pending].sort((a, b) => costs[a] - costs[b])[0];
    pending.delete(current);
    if (!finite(costs[current]) || current === 1) break;
    for (const edge of connections.filter((entry) => entry.from === current && pending.has(entry.to))) {
      const next = costs[current] + edge.duration;
      if (next >= costs[edge.to]) continue;
      costs[edge.to] = next;
      previous.set(edge.to, edge);
    }
  }
  if (!finite(costs[1])) return failure(deniedDoor ? 'door-locked' : 'no-authorized-ground-route');
  const segments = [];
  for (let cursor = 1; cursor !== 0;) {
    const edge = previous.get(cursor);
    if (!edge) return failure('invalid-route');
    if (edge.duration > EPS) segments.unshift({
      kind: edge.kind, doorId: edge.doorId || null, depth: Boolean(edge.depth),
      from: copy(nodes[edge.from]), to: copy(nodes[edge.to]), duration: edge.duration
    });
    cursor = edge.from;
  }
  return { ok: true, state: {
    schema: SHIP_ANIMAL_NAV_SCHEMA_V87, actorId, body: shape, speed,
    status: segments.length ? 'moving' : 'arrived', reason: null, location: copy(start),
    target: copy(finish), segments, segmentIndex: 0, segmentElapsed: 0,
    simulationTime: finite(simulationTime) ? Math.max(0, simulationTime) : 0, revision: 0
  } };
}

function liveDoor(graph, id, currentDoors) {
  const source = currentDoors == null ? graph.doors : list(currentDoors);
  const door = source.find((entry) => entry.id === id);
  return door ? normalizeDoor(door) : null;
}

// Saved navigation is data, never authority to change the speed, endpoint or room.
// Dynamic locks/obstructions are checked while stepping, not silently repaired here.
function validRouteState(graph, state) {
  if (typeof state.actorId !== 'string' || !state.actorId || state.actorId.length > 128
    || !finite(state.speed) || state.speed <= 0 || state.speed > 240
    || !['moving', 'waiting', 'blocked', 'arrived'].includes(state.status)
    || !samePoint(state.target, point(graph, state.target))) return false;
  let previous = null;
  for (const segment of state.segments) {
    const from = point(graph, segment?.from);
    const to = point(graph, segment?.to);
    if (!samePoint(segment?.from, from) || !samePoint(segment?.to, to)
      || (previous && !samePoint(previous, from)) || !finite(segment.duration) || segment.duration <= 0) return false;
    let duration = Math.abs(to.x - from.x) / state.speed;
    if (segment.kind === 'door') {
      const authored = graph.doors.find((entry) => entry.id === segment.doorId);
      const endpoints = authored && doorPoints(graph, authored, state.body);
      if (!endpoints || Boolean(segment.depth) !== authored.depth
        || !((samePoint(from, endpoints[0]) && samePoint(to, endpoints[1]))
          || (samePoint(from, endpoints[1]) && samePoint(to, endpoints[0])))) return false;
      duration = authored.depth ? authored.duration : duration;
    } else if (segment.kind !== 'walk' || segment.depth || segment.doorId != null
      || from.roomId !== to.roomId || from.spaceId !== to.spaceId) return false;
    if (Math.abs(duration - segment.duration) > EPS) return false;
    previous = to;
  }
  if (previous && !samePoint(previous, state.target)) return false;
  if (state.segmentIndex === state.segments.length) {
    return state.status === 'arrived' && state.segmentElapsed === 0 && samePoint(state.location, state.target);
  }
  if (state.status === 'arrived') return false;
  const segment = state.segments[state.segmentIndex];
  if (state.segmentElapsed > segment.duration + EPS) return false;
  const progress = state.segmentElapsed / segment.duration;
  if (segment.kind === 'door' && progress > 0) return state.location?.kind === 'transit'
    && state.location.deckId === graph.deckId && state.location.roomId === null && state.location.spaceId === null
    && state.location.edgeId === segment.doorId && finite(state.location.progress)
    && Math.abs(state.location.progress - progress) <= EPS;
  return samePoint(state.location, { ...segment.from, x: segment.from.x + (segment.to.x - segment.from.x) * progress });
}

/**
 * One canonical location survives save/reload and offscreen updates.
 * Optional absolute simulationTime prevents duplicate integration on hub reload.
 * Closed ordinary doors wait; locked/dangerous routes stop without opening or teleporting.
 */
export function stepShipAnimalRouteV87(graph, source, delta, {
  doors = null, blockedRoomIds = [], simulationTime = null
} = {}) {
  const state = copy(source);
  const events = [];
  if (!graph?.valid || graph.schema !== SHIP_ANIMAL_NAV_SCHEMA_V87 || !Array.isArray(graph.rooms) || !Array.isArray(graph.doors)
    || !state || state.schema !== SHIP_ANIMAL_NAV_SCHEMA_V87 || !normalizeBody(state.body)
    || !Array.isArray(state.segments) || state.segments.length > 128
    || !Number.isInteger(state.segmentIndex) || state.segmentIndex < 0 || state.segmentIndex > state.segments.length
    || !finite(state.segmentElapsed) || state.segmentElapsed < 0 || !finite(state.simulationTime)
    || state.simulationTime < 0 || !validRouteState(graph, state))
    return { state, events, ok: false, reason: 'invalid-state' };
  const requested = simulationTime == null ? Number(delta) : Number(simulationTime) - state.simulationTime;
  const elapsed = finite(requested) ? Math.max(0, Math.min(86400, requested)) : 0;
  if (!elapsed || state.status === 'arrived') return { state, events, ok: true };
  state.simulationTime += elapsed;
  state.revision = (Number(state.revision) || 0) + 1;
  let remaining = elapsed;
  for (let guard = 0; remaining > EPS && state.segmentIndex < state.segments.length && guard < 129; guard += 1) {
    const segment = state.segments[state.segmentIndex];
    const from = point(graph, segment.from);
    const to = point(graph, segment.to);
    if (!from || !to || !finite(segment.duration) || segment.duration <= 0 || state.segmentElapsed > segment.duration + EPS) {
      state.status = 'blocked'; state.reason = 'invalid-route'; break;
    }
    const previousProgress = state.segmentElapsed / segment.duration;
    const expectedLocation = { ...from, x: from.x + (to.x - from.x) * previousProgress };
    const validLocation = segment.kind === 'door' && previousProgress > 0
      ? state.location?.kind === 'transit' && state.location.edgeId === segment.doorId
        && Math.abs(state.location.progress - previousProgress) <= EPS && state.location.roomId === null
      : samePoint(state.location, expectedLocation);
    if (!validLocation) { state.status = 'blocked'; state.reason = 'invalid-location'; break; }
    if (list(blockedRoomIds).includes(from.roomId) || list(blockedRoomIds).includes(to.roomId)) {
      state.status = 'blocked'; state.reason = 'unsafe-region'; break;
    }
    if (segment.kind === 'door') {
      const door = liveDoor(graph, segment.doorId, doors);
      const authored = graph.doors.find((entry) => entry.id === segment.doorId);
      const endpoints = authored && doorPoints(graph, authored, state.body);
      if (!endpoints || !((samePoint(from, endpoints[0]) && samePoint(to, endpoints[1]))
        || (samePoint(from, endpoints[1]) && samePoint(to, endpoints[0])))) {
        state.status = 'blocked'; state.reason = 'invalid-route'; break;
      }
      if (!door || locked(door) || door.lift) {
        state.status = 'blocked'; state.reason = door?.lift ? 'unsupported-need-escort' : door ? 'door-locked' : 'door-missing'; break;
      }
      if (door.progress < SHIP_ANIMAL_DOOR_OPEN_V87) {
        state.status = 'waiting'; state.reason = 'door-closed'; break;
      }
      if (!clearDoor(graph, authored, state.body, blockedRoomIds)) {
        state.status = 'blocked'; state.reason = 'approach-obstructed'; break;
      }
    } else if (segment.kind !== 'walk' || !clearWalk(graph, from, to, state.body, blockedRoomIds)) {
      state.status = 'blocked'; state.reason = 'path-obstructed'; break;
    }
    state.status = 'moving';
    state.reason = null;
    const consumed = Math.min(remaining, segment.duration - state.segmentElapsed);
    state.segmentElapsed += consumed;
    remaining -= consumed;
    const progress = Math.min(1, state.segmentElapsed / segment.duration);
    state.location = segment.kind === 'door'
      ? { kind: 'transit', deckId: from.deckId, roomId: null, spaceId: null, edgeId: segment.doorId, progress }
      : { ...from, x: from.x + (to.x - from.x) * progress };
    if (progress < 1) break;
    state.location = copy(to);
    if (segment.kind === 'door') events.push({ type: 'animal-door-exit', actorId: state.actorId, doorId: segment.doorId, roomId: to.roomId });
    state.segmentIndex += 1;
    state.segmentElapsed = 0;
  }
  if (state.segmentIndex === state.segments.length) {
    state.status = 'arrived'; state.reason = null; state.location = copy(state.target);
    events.push({ type: 'animal-arrived', actorId: state.actorId, roomId: state.location.roomId });
  }
  return { state, events, ok: true };
}

/** Read-only projection. Rendering never advances time, ownership, position or needs. */
export function sampleShipAnimalRouteV87(state) {
  if (state?.location?.kind !== 'transit') return copy(state?.location || null);
  const segment = state.segments?.[state.segmentIndex];
  if (!segment) return null;
  const progress = Math.max(0, Math.min(1, Number(state.location.progress) || 0));
  if (segment.depth) {
    const side = progress < 0.5 ? segment.from : segment.to;
    return { ...copy(side), kind: 'transit', edgeId: segment.doorId, progress, depthProgress: progress };
  }
  return {
    ...copy(progress < 0.5 ? segment.from : segment.to), kind: 'transit', edgeId: segment.doorId, progress,
    x: segment.from.x + (segment.to.x - segment.from.x) * progress
  };
}
