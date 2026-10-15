import {
  HUB_ANNEXES_V87, createHubCommercialStateV87, applyHubAnnexStationV87,
  buildHubRuntimeGraphV87, validateHubAnnexGeometryV87
} from './hub-annex-registry-v87.js';
import { HUB_BASE_ROOMS_V71, HUB_COMMERCIAL_SCHEMA_V71, HUB_COMMERCIAL_OPERATION_ID_V71 } from './tantalus-hub-expansion-v71.js';
import {
  HUB_SHIP_SPACES_V137, HUB_SHIP_SPACE_BY_ID_V137, HUB_SHIP_CONNECTIONS_V137,
  getHubShipConnectionsForSpaceV137, getHubShipConnectionV137, getHubShipStationReadoutV137
} from './hub-ship-layout-v137.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const clone = value => structuredClone(value);
const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const list = value => Array.isArray(value) ? value : [];
const finite = value => typeof value === 'number' && Number.isFinite(value);
const bounded = (value, min, max, fallback) => finite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback;
const count = value => bounded(value, 0, 999999, 0);
const timestamp = value => bounded(value, 0, 1000000000, 0);
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const inWorld = (b, world) => record(b) && ['x', 'y', 'w', 'h'].every(key => finite(b[key]))
  && b.x >= 0 && b.y >= 0 && b.w > 0 && b.h > 0 && b.x + b.w <= world.width && b.y + b.h <= world.height;
const future = raw => record(raw) && (Number(raw.schema) > HUB_COMMERCIAL_SCHEMA_V71 || Number(raw.registryVersion) > HUB_ANNEX_REGISTRY_VERSION_V137);

export const HUB_ANNEX_REGISTRY_VERSION_V137 = 137;
export const HUB_ANNEXES_V137 = freeze([...HUB_ANNEXES_V87, ...HUB_SHIP_SPACES_V137]);
export const HUB_ANNEX_BY_ID_V137 = freeze(Object.fromEntries(HUB_ANNEXES_V137.map(annex => [annex.id, annex])));

function spawnFor(space, connection = getHubShipConnectionsForSpaceV137(space.id)[0]) {
  return { x: connection.entranceSide === 'east'
    ? connection.entranceLocalX - space.entrance.w / 2 - 44 - 30
    : connection.entranceLocalX + space.entrance.w / 2 + 30,
  y: space.world.floorY - 92, w: 44, h: 92 };
}

export function validateHubAnnexGeometryV137(annex) {
  if (HUB_ANNEXES_V87.includes(annex)) return validateHubAnnexGeometryV87(annex);
  const errors = [], canonical = HUB_SHIP_SPACE_BY_ID_V137[annex?.id];
  if (!canonical || annex?.kind !== 'physical-annex') return { valid: false, errors: ['unknown-ship-compartment'], annexId: annex?.id || null };
  const world = annex.world;
  if (!world || world.width !== canonical.world.width || world.height !== 720 || world.floorY !== 624) errors.push('invalid-world');
  if (errors.length) return { valid: false, errors, annexId: annex.id };
  const floor = list(annex.platforms).find(surface => surface.role === 'floor');
  if (!floor || floor.x !== 0 || floor.y !== 624 || floor.w !== world.width || floor.h !== 96) errors.push('missing-full-width-floor');
  for (const bucket of ['platforms', 'colliders', 'props', 'ladders']) {
    if (!Array.isArray(annex[bucket]) || !annex[bucket].every(bounds => inWorld(bounds, world))) errors.push(`invalid-${bucket}`);
  }
  if (!inWorld(annex.station?.bounds, world) || annex.station?.persistent !== true || annex.station?.upgradeId !== null) errors.push('invalid-inspection-station');
  const connections = getHubShipConnectionsForSpaceV137(annex.id);
  const primary = connections[0];
  if (annex.parentDeck !== primary.parentDeck || annex.parentRoomId !== primary.parentRoomId
    || ['x', 'y', 'w', 'h'].some(key => annex.parentDoorBounds?.[key] !== primary.parentDoorBounds[key])
    || annex.entranceSide !== primary.entranceSide || annex.entranceLocalX !== primary.entranceLocalX
    || annex.entrance?.bidirectional !== true || annex.entrance?.w !== 118 || annex.entrance?.h !== 192
    || annex.entrance?.y !== 432 || annex.entrance?.x !== primary.entranceLocalX
    || JSON.stringify(annex.connectionIds) !== JSON.stringify(connections.map(connection => connection.id))) errors.push('inconsistent-connection-definition');
  for (const connection of connections) {
    const parent = HUB_BASE_ROOMS_V71.find(room => room.id === connection.parentRoomId && room.deckId === connection.parentDeck);
    const door = connection.parentDoorBounds;
    if (!parent || !inWorld(door, { width: 5120, height: 720 }) || door.x < parent.roomIndex * 1280
      || door.x + door.w > (parent.roomIndex + 1) * 1280 || door.y + door.h !== connection.standingY) errors.push('invalid-parent-connection');
    if (!inWorld(connection.annexDoorBounds, world)) errors.push('invalid-connection-door');
    const spawn = spawnFor(annex, connection);
    if (!inWorld(spawn, world) || list(annex.colliders).some(collider => overlap(spawn, collider))
      || list(annex.platforms).some(surface => surface.role !== 'floor' && overlap(spawn, surface))) errors.push('blocked-connection-spawn');
  }
  const standingLane = { x: 24, y: world.floorY - 92, w: world.width - 48, h: 92 };
  if (list(annex.colliders).some(collider => collider.collisionMode !== 'one-way-top' && overlap(standingLane, collider))) errors.push('blocked-standing-lane');
  if (list(annex.ladders).some(ladder => ladder.y !== ladder.top || ladder.y + ladder.h !== ladder.bottom
    || ladder.bottom !== world.floorY || !list(annex.platforms).some(platform => platform.role !== 'floor'
      && platform.y === ladder.top && ladder.x >= platform.x && ladder.x + ladder.w <= platform.x + platform.w))) errors.push('unsupported-service-ladder');
  return { valid: errors.length === 0, errors, annexId: annex.id };
}

function roomState(space, raw) {
  const source = record(raw) && (!raw.id || raw.id === space.id) ? raw : {};
  const station = record(source.station) && source.station.id === space.station.id ? source.station : {};
  const activated = station.activated === true, visited = source.visited === true || activated;
  const activatedAt = activated ? timestamp(station.activatedAt) : null;
  return { id: space.id, visited, visitCount: visited ? Math.max(1, count(source.visitCount)) : 0,
    lastVisitedAt: visited ? timestamp(source.lastVisitedAt) : null,
    station: { id: space.station.id, activated, activationCount: activated ? Math.max(1, count(station.activationCount)) : 0,
      activatedAt, lastActivatedAt: activated ? Math.max(activatedAt, timestamp(station.lastActivatedAt)) : null },
    upgrade: { id: null, installed: false, installedAt: null } };
}

function legacyInput(source) {
  if (!source) return null;
  const result = clone(source); result.registryVersion = 87;
  if (HUB_SHIP_SPACE_BY_ID_V137[result.activeAnnexId]) Object.assign(result,
    { activeAnnexId: null, annexPositionX: null, annexPositionY: null, annexClimbing: false, returnContext: null });
  return result;
}

function restoreShipPose(state, source, space) {
  const connections = getHubShipConnectionsForSpaceV137(space.id), raw = record(source.returnContext) ? source.returnContext : {};
  const candidate = getHubShipConnectionV137(raw.endpointId || source.activeConnectionIdV137);
  const connection = candidate?.spaceId === space.id ? candidate : connections.find(entry => entry.parentDeck === raw.deckId && entry.parentRoomId === raw.roomId) || connections[0];
  const spawn = spawnFor(space, connection), pose = {
    x: bounded(source.annexPositionX, 24, space.world.width - 68, Math.round(spawn.x)),
    y: bounded(source.annexPositionY, 0, space.world.floorY - 92, spawn.y), w: 44, h: 92
  };
  const blocked = space.colliders.some(collider => collider.collisionMode !== 'one-way-top' && overlap(pose, collider))
    || space.platforms.some(surface => surface.role !== 'floor' && overlap(pose, surface));
  const safe = blocked ? spawn : pose, door = connection.parentDoorBounds;
  Object.assign(state, { activeAnnexId: space.id, annexPositionX: Math.round(safe.x), annexPositionY: Math.round(safe.y),
    annexClimbing: source.annexClimbing === true && !blocked && space.ladders.some(ladder => pose.x + 22 >= ladder.x - 24
      && pose.x + 22 <= ladder.x + ladder.w + 24 && pose.y + pose.h >= ladder.top && pose.y <= ladder.bottom),
    activeConnectionIdV137: connection.id,
    returnContext: { endpointId: connection.id, deckId: connection.parentDeck, roomId: connection.parentRoomId,
      x: bounded(raw.x, door.x, door.x + door.w - 44, Math.round(door.x + door.w / 2 - 22)),
      facing: raw.facing === -1 ? -1 : 1 } });
}

/** Historical thirteen rooms are normalized by their unchanged registry. New
 * service records are additive; saves from a future registry remain opaque. */
export function createHubCommercialStateV137(raw = null) {
  if (future(raw)) return clone(raw);
  const accepted = record(raw) && Number(raw.schema) === HUB_COMMERCIAL_SCHEMA_V71 && raw.operationId === HUB_COMMERCIAL_OPERATION_ID_V71;
  const source = accepted ? clone(raw) : null, state = createHubCommercialStateV87(legacyInput(source));
  state.registryVersion = HUB_ANNEX_REGISTRY_VERSION_V137; state.activeConnectionIdV137 = null;
  for (const space of HUB_SHIP_SPACES_V137) {
    const entry = roomState(space, source?.annexes?.[space.id]); state.annexes[space.id] = entry;
    state.stationUses[space.id] = entry.station.activationCount;
    if (entry.visited) state.visitedAnnexIds.push(space.id);
    if (entry.station.activated) state.activatedStationIds.push(space.station.id);
  }
  if (source && HUB_SHIP_SPACE_BY_ID_V137[source.activeAnnexId]) restoreShipPose(state, source, HUB_SHIP_SPACE_BY_ID_V137[source.activeAnnexId]);
  if (source && state.visitedAnnexIds.includes(source.lastAnnexId)) state.lastAnnexId = source.lastAnnexId;
  else if (!state.visitedAnnexIds.includes(state.lastAnnexId)) state.lastAnnexId = state.visitedAnnexIds.at(-1) || null;
  return state;
}
export const sanitizeHubCommercialStateV137 = createHubCommercialStateV137;

export function applyHubAnnexStationV137(raw, annexId) {
  const state = createHubCommercialStateV137(raw), refusal = () => freeze({ state, applied: false, station: null, effect: null });
  if (state.schema !== 71 || state.registryVersion !== HUB_ANNEX_REGISTRY_VERSION_V137) return refusal();
  const space = HUB_SHIP_SPACE_BY_ID_V137[annexId];
  if (space) {
    const next = clone(state), entry = next.annexes[space.id], station = entry.station;
    next.revision = Math.min(999999, count(next.revision) + 1);
    entry.visited = true; entry.visitCount = Math.max(1, entry.visitCount); entry.lastVisitedAt ??= next.revision;
    station.activated = true; station.activationCount = Math.min(999999, station.activationCount + 1);
    station.activatedAt ??= next.revision; station.lastActivatedAt = next.revision;
    next.stationUses[space.id] = station.activationCount;
    if (!next.visitedAnnexIds.includes(space.id)) next.visitedAnnexIds.push(space.id);
    if (!next.activatedStationIds.includes(station.id)) next.activatedStationIds.push(station.id);
    const readout = getHubShipStationReadoutV137(space.id);
    return freeze({ state: createHubCommercialStateV137(next), applied: true, station: clone(space.station),
      effect: { kind: 'ship-inspection', ...readout, rewards: false, resourceDelta: null } });
  }
  const applied = applyHubAnnexStationV87(legacyInput(state), annexId);
  if (!applied.applied) return refusal();
  const next = clone(applied.state); next.registryVersion = HUB_ANNEX_REGISTRY_VERSION_V137;
  for (const room of HUB_SHIP_SPACES_V137) next.annexes[room.id] = clone(state.annexes[room.id]);
  if (HUB_SHIP_SPACE_BY_ID_V137[state.activeAnnexId]) for (const key of ['activeAnnexId', 'annexPositionX', 'annexPositionY', 'annexClimbing', 'returnContext', 'activeConnectionIdV137']) next[key] = clone(state[key]);
  if (HUB_SHIP_SPACE_BY_ID_V137[state.lastAnnexId]) next.lastAnnexId = state.lastAnnexId;
  return freeze({ ...applied, state: createHubCommercialStateV137(next) });
}

export function buildHubRuntimeGraphV137() {
  const graph = clone(buildHubRuntimeGraphV87()); graph.registryVersion = HUB_ANNEX_REGISTRY_VERSION_V137;
  graph.annexRoomCount = HUB_ANNEXES_V137.length;
  for (const space of HUB_SHIP_SPACES_V137) {
    const geometry = validateHubAnnexGeometryV137(space);
    if (!geometry.valid) throw new Error(`Invalid service compartment ${space.id}: ${geometry.errors.join(', ')}`);
    graph.nodes.push({ id: space.id, kind: 'annex', deckId: space.parentDeck, parentRoomId: space.parentRoomId, world: clone(space.world) });
    graph.adjacency[space.id] = [];
  }
  for (const connection of HUB_SHIP_CONNECTIONS_V137) {
    graph.edges.push({ id: connection.id, kind: 'annex-door', from: connection.parentRoomId, to: connection.spaceId,
      bidirectional: true, destinations: { [connection.parentRoomId]: connection.spaceId, [connection.spaceId]: connection.parentRoomId },
      branch: connection.spaceId !== 'maintenance-spine', deckId: connection.parentDeck,
      doorId: `${connection.id}-door`, entranceLocalX: connection.entranceLocalX, endpointId: connection.id });
    graph.adjacency[connection.parentRoomId].push(connection.spaceId); graph.adjacency[connection.spaceId].push(connection.parentRoomId);
  }
  Object.values(graph.adjacency).forEach(neighbors => neighbors.sort());
  return freeze(graph);
}
