import {
  HUB_ANNEXES_V71, HUB_ANNEX_BY_ID_V71, HUB_BASE_ROOMS_V71,
  HUB_COMMERCIAL_SCHEMA_V71, HUB_COMMERCIAL_OPERATION_ID_V71,
  createHubCommercialStateV71, buildHubCommercialGraphV71, validateHubAnnexGeometryV71, applyHubAnnexStationV71
} from './tantalus-hub-expansion-v71.js';
import { SHIP_ANIMAL_ANNEX_V87 } from './ship-animal-habitat-v87.js';
import { SHIP_PORT_ANNEX_V87 } from './ship-port-room-v87.js';
import { SHIP_REFUGE_ANNEX_V87 } from './refuge-room-v87.js';

export const HUB_ANNEX_REGISTRY_VERSION_V87 = 87;
// The historical ten-annex catalogue stays immutable; future extensions are explicit.
export const HUB_ANNEX_EXTENSIONS_V87 = Object.freeze([SHIP_ANIMAL_ANNEX_V87, SHIP_PORT_ANNEX_V87, SHIP_REFUGE_ANNEX_V87]);
export const HUB_ANNEXES_V87 = Object.freeze([...HUB_ANNEXES_V71, ...HUB_ANNEX_EXTENSIONS_V87]);
export const HUB_ANNEX_BY_ID_V87 = Object.freeze(Object.fromEntries(HUB_ANNEXES_V87.map(annex => [annex.id, annex])));

const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const list = value => Array.isArray(value) ? value : [];
const clone = value => structuredClone(value);
const finite = value => typeof value === 'number' && Number.isFinite(value);
const own = (value, key) => Boolean(value && Object.hasOwn(value, key));
const bounded = (value, min, max, fallback) => finite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback;
const counter = value => bounded(value, 0, 999999, 0);
const timestamp = value => bounded(value, 0, 1000000000, 0);
const intersects = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const deepFreeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};

function extensionFor(id) { return HUB_ANNEX_EXTENSIONS_V87.find(annex => annex.id === id); }
function parentFor(annex) { return HUB_BASE_ROOMS_V71.find(room => room.id === annex?.parentRoomId && room.deckId === annex?.parentDeck); }
function spawnFor(annex) {
  return { x: annex.entranceSide === 'east'
    ? annex.entranceLocalX - annex.entrance.w / 2 - 44 - 30
    : annex.entranceLocalX + annex.entrance.w / 2 + 30,
  y: annex.world.floorY - 92, w: 44, h: 92 };
}
function inWorld(bounds, world) {
  return record(bounds) && ['x', 'y', 'w', 'h'].every(key => finite(bounds[key]))
    && bounds.x >= 0 && bounds.y >= 0 && bounds.w > 0 && bounds.h > 0
    && bounds.x + bounds.w <= world.width && bounds.y + bounds.h <= world.height;
}

/** Geometry validation is not an art-production or whole-campaign completion claim. */
export function validateHubAnnexGeometryV87(annex) {
  if (annex && HUB_ANNEX_BY_ID_V71[annex.id] === annex) return validateHubAnnexGeometryV71(annex);
  const errors = [];
  const world = annex?.world;
  if (!extensionFor(annex?.id) || annex?.kind !== 'physical-annex') errors.push('unknown-extension');
  if (!parentFor(annex)) errors.push('invalid-parent-room');
  // Only the authored external counter gains an east shelter wing. Historical
  // annexes and the private REFUGE retain their exact 1920 px save geometry.
  const expectedWidth = annex?.id === SHIP_PORT_ANNEX_V87.id ? 2560 : 1920;
  if (!world || world.width !== expectedWidth || world.height !== 720 || world.floorY !== 624) errors.push('invalid-world');
  if (errors.length) return { valid: false, errors, annexId: annex?.id || null };
  const parentRoom = parentFor(annex);
  const parentDoor = annex.parentDoorBounds;
  if (!inWorld(parentDoor, { width: 5120, height: 720 })
    || parentDoor.x < parentRoom.roomIndex * 1280 || parentDoor.x + parentDoor.w > (parentRoom.roomIndex + 1) * 1280
    || parentDoor.y + parentDoor.h !== 624) errors.push('invalid-parent-door');
  const floor = list(annex.platforms).find(surface => surface.role === 'floor');
  if (!floor || floor.x !== 0 || floor.y !== world.floorY || floor.w !== world.width
    || floor.h !== world.height - world.floorY) errors.push('missing-physical-floor');
  for (const bucket of ['platforms', 'colliders', 'props', 'ladders']) {
    if (!Array.isArray(annex[bucket]) || !annex[bucket].every(bounds => inWorld(bounds, world))) errors.push(`invalid-${bucket}`);
  }
  if (!inWorld(annex.entrance, world) || annex.entrance.bidirectional !== true
    || !finite(annex.entranceLocalX) || annex.entranceLocalX < 112 || annex.entranceLocalX > world.width - 112
    || !['west', 'east'].includes(annex.entranceSide)) errors.push('invalid-entrance');
  if (!inWorld(annex.station?.bounds, world) || annex.station?.persistent !== true
    || typeof annex.station?.id !== 'string') errors.push('invalid-station');
  if (list(annex.props).some(prop => prop.collidable && !list(annex.colliders).some(collider =>
    ['x', 'y', 'w', 'h'].every(key => collider[key] === prop[key])))) errors.push('missing-prop-collider');
  if (!errors.includes('invalid-entrance')) {
    const spawn = spawnFor(annex);
    if (!inWorld(spawn, world) || list(annex.colliders).some(collider => intersects(spawn, collider))
      || list(annex.platforms).some(surface => surface.role !== 'floor' && intersects(spawn, surface))) errors.push('blocked-entrance-spawn');
  }
  return { valid: errors.length === 0, errors, annexId: annex.id };
}

function extensionState(annex, source) {
  const raw = record(source) && (!source.id || source.id === annex.id) ? source : {};
  const station = record(raw.station) && raw.station.id === annex.station.id ? raw.station : {};
  const activated = station.activated === true;
  const visited = raw.visited === true || activated;
  const activatedAt = activated ? timestamp(station.activatedAt) : null;
  const upgradeId = typeof annex.station.upgradeId === 'string' ? annex.station.upgradeId : null;
  const installed = Boolean(upgradeId && raw.upgrade?.id === upgradeId && raw.upgrade.installed === true);
  return {
    id: annex.id, visited, visitCount: visited ? Math.max(1, counter(raw.visitCount)) : 0,
    lastVisitedAt: visited ? timestamp(raw.lastVisitedAt) : null,
    station: { id: annex.station.id, activated, activationCount: activated ? Math.max(1, counter(station.activationCount)) : 0,
      activatedAt, lastActivatedAt: activated ? Math.max(activatedAt, timestamp(station.lastActivatedAt)) : null },
    upgrade: { id: upgradeId, installed, installedAt: installed ? timestamp(raw.upgrade.installedAt) : null }
  };
}

function restoreExtensionPose(state, raw, annex) {
  if (!validateHubAnnexGeometryV87(annex).valid) return;
  const spawn = spawnFor(annex);
  const pose = { x: bounded(raw.annexPositionX, 24, annex.world.width - 44 - 24, Math.round(spawn.x)),
    y: bounded(raw.annexPositionY, 0, annex.world.floorY - 92, spawn.y), w: 44, h: 92 };
  const overlapping = list(annex.colliders).some(collider => intersects(pose, collider))
    || list(annex.platforms).some(surface => surface.role !== 'floor' && intersects(pose, surface));
  const safe = overlapping ? spawn : pose;
  state.activeAnnexId = annex.id;
  state.annexPositionX = Math.round(safe.x);
  state.annexPositionY = Math.round(safe.y);
  state.annexClimbing = raw.annexClimbing === true && !overlapping && list(annex.ladders).some(ladder =>
    pose.x + pose.w / 2 >= ladder.x - 24 && pose.x + pose.w / 2 <= ladder.x + ladder.w + 24
    && pose.y + pose.h >= ladder.y && pose.y <= ladder.y + ladder.h);
  const door = annex.parentDoorBounds;
  const context = record(raw.returnContext) ? raw.returnContext : {};
  state.returnContext = { deckId: annex.parentDeck, roomId: annex.parentRoomId,
    x: bounded(context.x, door.x, door.x + door.w, Math.round(door.x + door.w / 2 - 22)) };
  if (context.facing === -1 || context.facing === 1) state.returnContext.facing = context.facing;
}

/** Pure wrapper: preserve the V71 evidence contract, then add explicitly versioned runtime rooms. */
export function createHubCommercialStateV87(raw = null) {
  if (record(raw) && ((Number.isFinite(Number(raw.schema)) && Number(raw.schema) > HUB_COMMERCIAL_SCHEMA_V71)
    || (Number.isFinite(Number(raw.registryVersion)) && Number(raw.registryVersion) > HUB_ANNEX_REGISTRY_VERSION_V87))) return clone(raw);
  const accepted = record(raw) && Number(raw.schema) === HUB_COMMERCIAL_SCHEMA_V71
    && raw.operationId === HUB_COMMERCIAL_OPERATION_ID_V71;
  const source = accepted ? clone(raw) : null;
  const baseSource = source && clone(source);
  if (baseSource && extensionFor(baseSource.activeAnnexId)) {
    baseSource.activeAnnexId = null;
    baseSource.annexPositionX = null;
    baseSource.annexPositionY = null;
    baseSource.annexClimbing = false;
    baseSource.returnContext = null;
  }
  const state = createHubCommercialStateV71(baseSource);
  state.registryVersion = HUB_ANNEX_REGISTRY_VERSION_V87;
  for (const annex of HUB_ANNEX_EXTENSIONS_V87) {
    const entry = extensionState(annex, source?.annexes?.[annex.id]);
    state.annexes[annex.id] = entry;
    state.stationUses[annex.id] = entry.station.activationCount;
    if (entry.visited) state.visitedAnnexIds.push(annex.id);
    if (entry.station.activated) state.activatedStationIds.push(annex.station.id);
    if (entry.upgrade.installed) state.physicalUpgradeIds.push(entry.upgrade.id);
    if (entry.upgrade.id && list(source?.physicalUpgradeModuleIds).includes(entry.upgrade.id)) state.physicalUpgradeModuleIds.push(entry.upgrade.id);
  }
  if (source && extensionFor(source.activeAnnexId)) restoreExtensionPose(state, source, extensionFor(source.activeAnnexId));
  if (source && state.visitedAnnexIds.includes(source.lastAnnexId)) state.lastAnnexId = source.lastAnnexId;
  else if (!state.visitedAnnexIds.includes(state.lastAnnexId)) state.lastAnnexId = state.visitedAnnexIds.at(-1) || null;
  return state;
}

export const sanitizeHubCommercialStateV87 = createHubCommercialStateV87;

/** Legacy effects remain legacy; a service call must not erase newer room evidence. */
export function applyHubAnnexStationV87(raw, annexId) {
  const state = createHubCommercialStateV87(raw);
  const refusal = () => Object.freeze({ state, applied: false, station: null, effect: null });
  if (state.schema !== HUB_COMMERCIAL_SCHEMA_V71 || state.registryVersion !== HUB_ANNEX_REGISTRY_VERSION_V87
    || !own(HUB_ANNEX_BY_ID_V71, annexId)) return refusal();
  const applied = applyHubAnnexStationV71(state, annexId);
  if (!applied.applied) return refusal();
  const candidate = clone(applied.state);
  for (const annex of HUB_ANNEX_EXTENSIONS_V87) {
    candidate.annexes[annex.id] = clone(state.annexes[annex.id]);
    const upgradeId = annex.station.upgradeId;
    if (upgradeId && state.physicalUpgradeModuleIds.includes(upgradeId)) candidate.physicalUpgradeModuleIds.push(upgradeId);
  }
  if (extensionFor(state.activeAnnexId)) {
    for (const key of ['activeAnnexId', 'annexPositionX', 'annexPositionY', 'annexClimbing', 'returnContext']) candidate[key] = clone(state[key]);
  }
  return Object.freeze({ ...applied, state: createHubCommercialStateV87(candidate) });
}

export function buildHubRuntimeGraphV87() {
  const graph = clone(buildHubCommercialGraphV71());
  graph.registryVersion = HUB_ANNEX_REGISTRY_VERSION_V87;
  graph.annexRoomCount = HUB_ANNEXES_V87.length;
  for (const annex of HUB_ANNEX_EXTENSIONS_V87) {
    const geometry = validateHubAnnexGeometryV87(annex);
    if (!geometry.valid) throw new Error(`Invalid runtime annex ${annex.id}: ${geometry.errors.join(', ')}`);
    if (own(graph.adjacency, annex.id)) throw new Error(`Duplicate runtime annex ${annex.id}`);
    graph.nodes.push({ id: annex.id, kind: 'annex', deckId: annex.parentDeck, parentRoomId: annex.parentRoomId, world: clone(annex.world) });
    graph.edges.push({ id: `${annex.parentRoomId}:${annex.id}-branch`, kind: 'annex-door', from: annex.parentRoomId, to: annex.id,
      bidirectional: true, destinations: { [annex.parentRoomId]: annex.id, [annex.id]: annex.parentRoomId }, branch: true,
      doorId: annex.entrance.id, deckId: annex.parentDeck, entranceLocalX: annex.entranceLocalX });
    graph.adjacency[annex.id] = [annex.parentRoomId];
    graph.adjacency[annex.parentRoomId].push(annex.id);
    graph.adjacency[annex.parentRoomId].sort();
  }
  return deepFreeze(graph);
}
