export const ALIEN_SURVIVAL_SCHEMA_V70 = 70;
export const ALIEN_SURVIVAL_OPERATION_ID_V70 = 'alien-survival-systems';
export const ALIEN_SURVIVAL_CAMPAIGN_ID_V70 = 'special-alien-survival-systems';
export const ALIEN_SURVIVAL_EXTERIOR_ROOM_ID_V70 = 'ship-exterior';

export const ALIEN_SURVIVAL_ROOM_IDS_V70 = Object.freeze([
  'ship-docking',
  'ship-cargo',
  'ship-engineering',
  'ship-habitation',
  'ship-command',
  'ship-extraction'
]);

export const ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70 = Object.freeze([
  'life-support',
  'security',
  'cctv'
]);

export const ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70 = Object.freeze([
  'self-destruct',
  'weldable-doors',
  'room-pressure',
  'power-routing',
  'security-cameras',
  'persistent-acid'
]);

export const ALIEN_SURVIVAL_PHASE_IDS_V70 = Object.freeze([
  'restore-power',
  'security-scan',
  'contain-breach',
  'authorize-destruct',
  'escape',
  'extracted',
  'failed'
]);

export const ALIEN_SURVIVAL_DOOR_DEFINITIONS_V70 = freezeDeep([
  { id: 'dock-bulkhead', fromRoomId: 'ship-docking', toRoomId: 'ship-cargo' },
  { id: 'cargo-bulkhead', fromRoomId: 'ship-cargo', toRoomId: 'ship-engineering' },
  { id: 'aft-bulkhead', fromRoomId: 'ship-command', toRoomId: 'ship-extraction' },
  { id: 'outer-airlock', fromRoomId: 'ship-extraction', toRoomId: ALIEN_SURVIVAL_EXTERIOR_ROOM_ID_V70 }
]);

export const ALIEN_SURVIVAL_CAMPAIGN_V70 = freezeDeep({
  id: ALIEN_SURVIVAL_CAMPAIGN_ID_V70,
  name: 'SYSTÈMES DE SURVIE ALIEN',
  pairId: null,
  mode: 'SURVIVAL',
  worldId: 'world-05-lethe',
  objective: 'escape the quarantine',
  year: 2204,
  canon: 'project-continuity',
  routes: 3,
  templateId: 'ship-interior-vertical',
  source: 'Tantalus Special Operations',
  specialOperationId: ALIEN_SURVIVAL_OPERATION_ID_V70
});

export const ALIEN_SURVIVAL_DIFFICULTY_V70 = freezeDeep({
  story: { selfDestructSeconds: 120 },
  standard: { selfDestructSeconds: 90 },
  nightmare: { selfDestructSeconds: 70 }
});

export const ALIEN_SURVIVAL_PRESSURE_TICK_RATE_V70 = 60;
export const ALIEN_SURVIVAL_SAFE_PRESSURE_V70 = 75;
export const ALIEN_SURVIVAL_SAFE_OXYGEN_V70 = 60;

const MAX_ROOMS = 32;
const MAX_DOORS = 64;
const MAX_ACID_POOLS = 48;
const MAX_SIMULATION_SECONDS = 30;
const PRESSURE_EQUALIZATION_RATE = 0.42;
const EXTERIOR_PRESSURE_EQUALIZATION_RATE = 0.06;
const PRESSURE_EQUALIZATION_THRESHOLD = 3;
const LIFE_SUPPORT_PRESSURE_PER_SECOND = 8;
const LIFE_SUPPORT_OXYGEN_PER_SECOND = 6;
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9:-]{0,95}$/;

const DEFAULT_ROOM_CONFIGURATION = Object.freeze({
  'ship-docking': Object.freeze({ pressure: 100, oxygen: 100, breachRate: 0 }),
  'ship-cargo': Object.freeze({ pressure: 88, oxygen: 86, breachRate: 0 }),
  'ship-engineering': Object.freeze({ pressure: 46, oxygen: 44, breachRate: 7.5 }),
  'ship-habitation': Object.freeze({ pressure: 100, oxygen: 100, breachRate: 0 }),
  'ship-command': Object.freeze({ pressure: 96, oxygen: 94, breachRate: 0 }),
  'ship-extraction': Object.freeze({ pressure: 72, oxygen: 68, breachRate: 0 })
});

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freezeDeep(child);
  return value;
}

const isRecord = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const asList = (value) => Array.isArray(value) ? value : [];

const clamp = (value, minimum, maximum, fallback = minimum) => {
  const numeric = Number(value);
  return Math.max(minimum, Math.min(maximum, Number.isFinite(numeric) ? numeric : fallback));
};

const rounded = (value, precision = 6) => {
  const multiplier = 10 ** precision;
  return Math.round((Number(value) + Number.EPSILON) * multiplier) / multiplier;
};

const integer = (value, minimum, maximum, fallback = minimum) => (
  Math.round(clamp(value, minimum, maximum, fallback))
);

const identifier = (value, fallback = '') => {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return IDENTIFIER_PATTERN.test(normalized) ? normalized : fallback;
};

const uniqueIdentifiers = (value, allowed, maximum) => {
  const result = [];
  for (const candidate of asList(value)) {
    const id = identifier(candidate);
    if (!id || (allowed && !allowed.has(id)) || result.includes(id)) continue;
    result.push(id);
    if (result.length >= maximum) break;
  }
  return result;
};

const clone = (value) => JSON.parse(JSON.stringify(value));

function normalizeRoomIds(roomIds) {
  const source = asList(roomIds).length ? roomIds : ALIEN_SURVIVAL_ROOM_IDS_V70;
  const result = uniqueIdentifiers(source, null, MAX_ROOMS);
  return result.length ? result : [...ALIEN_SURVIVAL_ROOM_IDS_V70];
}

function normalizeDoorDefinitions(doorDefinitions, doorIds, roomIds) {
  const allowedRooms = new Set([...roomIds, ALIEN_SURVIVAL_EXTERIOR_ROOM_ID_V70]);
  const requestedIds = asList(doorIds).length ? new Set(uniqueIdentifiers(doorIds, null, MAX_DOORS)) : null;
  const source = asList(doorDefinitions).length ? doorDefinitions : ALIEN_SURVIVAL_DOOR_DEFINITIONS_V70;
  const result = [];
  for (const candidate of source) {
    if (!isRecord(candidate)) continue;
    const id = identifier(candidate.id);
    const fromRoomId = identifier(candidate.fromRoomId || candidate.fromZoneId);
    const toRoomId = identifier(candidate.toRoomId || candidate.toZoneId);
    if (!id || !allowedRooms.has(fromRoomId) || !allowedRooms.has(toRoomId) || fromRoomId === toRoomId) continue;
    if (requestedIds && !requestedIds.has(id)) continue;
    if (result.some((entry) => entry.id === id)) continue;
    result.push({ id, fromRoomId, toRoomId });
    if (result.length >= MAX_DOORS) break;
  }
  return result;
}

function normalizeDifficulty(value, fallback = 'standard') {
  return Object.hasOwn(ALIEN_SURVIVAL_DIFFICULTY_V70, value) ? value : fallback;
}

function defaultRequiredFeedIds(roomIds) {
  const preferred = ['ship-engineering', 'ship-extraction'].filter((id) => roomIds.includes(id));
  if (preferred.length) return preferred;
  if (roomIds.length <= 2) return [...roomIds];
  return [roomIds[Math.floor(roomIds.length / 2)], roomIds.at(-1)];
}

function normalizeRequiredFeedIds(feedIds, roomIds) {
  const allowed = new Set(roomIds);
  const result = uniqueIdentifiers(feedIds, allowed, roomIds.length);
  return result.length ? result : defaultRequiredFeedIds(roomIds);
}

function createRoomV70(id) {
  const configuration = DEFAULT_ROOM_CONFIGURATION[id] || { pressure: 100, oxygen: 100, breachRate: 0 };
  return {
    id,
    pressure: configuration.pressure,
    targetPressure: 100,
    oxygen: configuration.oxygen,
    breachRate: configuration.breachRate,
    visited: false
  };
}

function createDoorV70(definition) {
  return {
    ...definition,
    open: false,
    welded: false,
    weldIntegrity: 0,
    weldCompletedAt: null
  };
}

export function createAlienSurvivalStateV70({
  deploymentOperationId = ALIEN_SURVIVAL_OPERATION_ID_V70,
  difficulty = 'standard',
  roomIds,
  zoneIds,
  doorDefinitions,
  doorIds,
  requiredFeedIds
} = {}) {
  const canonicalRoomIds = normalizeRoomIds(roomIds || zoneIds);
  const canonicalDoors = normalizeDoorDefinitions(doorDefinitions, doorIds, canonicalRoomIds);
  const canonicalDifficulty = normalizeDifficulty(difficulty);
  const feeds = normalizeRequiredFeedIds(requiredFeedIds, canonicalRoomIds);
  const state = {
    schema: ALIEN_SURVIVAL_SCHEMA_V70,
    operationId: ALIEN_SURVIVAL_OPERATION_ID_V70,
    campaignId: ALIEN_SURVIVAL_CAMPAIGN_ID_V70,
    deploymentOperationId: identifier(deploymentOperationId, ALIEN_SURVIVAL_OPERATION_ID_V70),
    difficulty: canonicalDifficulty,
    phase: 'restore-power',
    elapsedSeconds: 0,
    extracted: false,
    completedAt: null,
    rooms: canonicalRoomIds.map(createRoomV70),
    doors: canonicalDoors.map(createDoorV70),
    power: {
      capacity: 2,
      routes: Object.fromEntries(ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70.map((id) => [id, false])),
      rerouteCount: 0,
      everRouted: []
    },
    pressure: {
      simulatedTicks: 0,
      tickRemainder: 0,
      equalizedDoorIds: [],
      stabilizedRoomIds: []
    },
    welding: {
      completedDoorIds: []
    },
    cctv: {
      active: false,
      selectedFeedId: feeds[0] || canonicalRoomIds[0] || null,
      requiredFeedIds: feeds,
      visitedFeedIds: [],
      scanComplete: false
    },
    acidPools: [],
    acid: {
      encountered: false,
      maxPersistenceSeconds: 0
    },
    selfDestruct: {
      authorizations: { engineering: false, command: false },
      authorizedAt: { engineering: null, command: null },
      armed: false,
      armedAt: null,
      durationSeconds: ALIEN_SURVIVAL_DIFFICULTY_V70[canonicalDifficulty].selfDestructSeconds,
      remainingSeconds: ALIEN_SURVIVAL_DIFFICULTY_V70[canonicalDifficulty].selfDestructSeconds,
      expired: false
    }
  };
  state.pressure.stabilizedRoomIds = stableRoomIdsV70(state.rooms);
  return state;
}

function sanitizeRoomV70(source, fallback) {
  const record = isRecord(source) ? source : {};
  return {
    ...fallback,
    pressure: rounded(clamp(record.pressure, 0, 100, fallback.pressure)),
    targetPressure: rounded(clamp(record.targetPressure, 0, 100, fallback.targetPressure)),
    oxygen: rounded(clamp(record.oxygen, 0, 100, fallback.oxygen)),
    breachRate: rounded(clamp(record.breachRate, 0, 40, fallback.breachRate)),
    visited: Boolean(record.visited)
  };
}

function sanitizeDoorV70(source, fallback) {
  const record = isRecord(source) ? source : {};
  const integrity = rounded(clamp(record.weldIntegrity, 0, 100, 0));
  const welded = Boolean(record.welded) && integrity > 0;
  return {
    ...fallback,
    open: welded ? false : Boolean(record.open),
    welded,
    weldIntegrity: welded ? integrity : 0,
    weldCompletedAt: welded ? clamp(record.weldCompletedAt, 0, 100000000, 0) : null
  };
}

function sanitizePowerV70(source, fallback) {
  const record = isRecord(source) ? source : {};
  const requestedRoutes = isRecord(record.routes) ? record.routes : {};
  let remaining = fallback.capacity;
  const routes = {};
  for (const circuitId of ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70) {
    routes[circuitId] = Boolean(requestedRoutes[circuitId]) && remaining > 0;
    if (routes[circuitId]) remaining -= 1;
  }
  const enabled = ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70.filter((id) => routes[id]);
  const everRouted = uniqueIdentifiers(record.everRouted, new Set(ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70), 3);
  return {
    capacity: fallback.capacity,
    routes,
    rerouteCount: integer(record.rerouteCount, 0, 999999, 0),
    everRouted: [...new Set([...everRouted, ...(record.rerouteCount > 0 ? enabled : [])])]
  };
}

function sanitizeAcidPoolsV70(source, allowedRooms) {
  const pools = [];
  const ids = new Set();
  for (const candidate of asList(source)) {
    if (!isRecord(candidate)) continue;
    const id = identifier(candidate.id);
    const roomId = identifier(candidate.roomId || candidate.zoneId);
    if (!id || ids.has(id) || !allowedRooms.has(roomId)) continue;
    ids.add(id);
    pools.push({
      id,
      roomId,
      sourceEnemyId: identifier(candidate.sourceEnemyId) || null,
      x: rounded(clamp(candidate.x, -100000, 100000, 0)),
      y: rounded(clamp(candidate.y, -100000, 100000, 0)),
      w: rounded(clamp(candidate.w, 4, 1024, 64)),
      h: rounded(clamp(candidate.h, 4, 1024, 20)),
      intensity: rounded(clamp(candidate.intensity, 0, 1, 1)),
      corrosion: rounded(clamp(candidate.corrosion, 0, 100, 0)),
      ageSeconds: rounded(clamp(candidate.ageSeconds, 0, 86400, 0)),
      createdAt: clamp(candidate.createdAt, 0, 100000000, 0),
      active: candidate.active !== false,
      persistent: true
    });
    if (pools.length >= MAX_ACID_POOLS) break;
  }
  return pools;
}

function stableRoomIdsV70(rooms) {
  return asList(rooms)
    .filter((room) => (
      Number(room?.pressure) >= ALIEN_SURVIVAL_SAFE_PRESSURE_V70
      && Number(room?.oxygen) >= ALIEN_SURVIVAL_SAFE_OXYGEN_V70
      && Number(room?.breachRate) <= 0
    ))
    .map((room) => room.id);
}

export function sanitizeAlienSurvivalStateV70(rawState, options = {}) {
  const rawDifficulty = isRecord(rawState) ? normalizeDifficulty(rawState.difficulty) : 'standard';
  const difficulty = normalizeDifficulty(options.difficulty, rawDifficulty);
  const expectedDeploymentId = identifier(
    options.deploymentOperationId,
    ALIEN_SURVIVAL_OPERATION_ID_V70
  );
  const fallback = createAlienSurvivalStateV70({
    ...options,
    difficulty,
    deploymentOperationId: expectedDeploymentId
  });
  if (!isRecord(rawState)
    || Number(rawState.schema) !== ALIEN_SURVIVAL_SCHEMA_V70
    || rawState.operationId !== ALIEN_SURVIVAL_OPERATION_ID_V70
    || rawState.campaignId !== ALIEN_SURVIVAL_CAMPAIGN_ID_V70
    || rawState.deploymentOperationId !== expectedDeploymentId) return fallback;

  const roomById = new Map(asList(rawState.rooms).map((room) => [identifier(room?.id), room]));
  fallback.rooms = fallback.rooms.map((room) => sanitizeRoomV70(roomById.get(room.id), room));

  const doorById = new Map(asList(rawState.doors).map((door) => [identifier(door?.id), door]));
  fallback.doors = fallback.doors.map((door) => sanitizeDoorV70(doorById.get(door.id), door));
  const allowedDoorIds = new Set(fallback.doors.map((door) => door.id));
  fallback.welding.completedDoorIds = uniqueIdentifiers(
    rawState.welding?.completedDoorIds,
    allowedDoorIds,
    fallback.doors.length
  );
  for (const door of fallback.doors) {
    if (door.welded && !fallback.welding.completedDoorIds.includes(door.id)) {
      fallback.welding.completedDoorIds.push(door.id);
    }
  }

  fallback.power = sanitizePowerV70(rawState.power, fallback.power);
  const allowedRooms = new Set(fallback.rooms.map((room) => room.id));
  const requiredFeedIds = normalizeRequiredFeedIds(options.requiredFeedIds, [...allowedRooms]);
  const visitedFeedIds = uniqueIdentifiers(rawState.cctv?.visitedFeedIds, allowedRooms, allowedRooms.size);
  const selectedFeedId = identifier(rawState.cctv?.selectedFeedId);
  fallback.cctv = {
    active: Boolean(rawState.cctv?.active) && fallback.power.routes.cctv,
    selectedFeedId: allowedRooms.has(selectedFeedId) ? selectedFeedId : requiredFeedIds[0] || fallback.rooms[0]?.id || null,
    requiredFeedIds,
    visitedFeedIds,
    scanComplete: requiredFeedIds.length > 0 && requiredFeedIds.every((id) => visitedFeedIds.includes(id))
  };

  fallback.pressure = {
    simulatedTicks: integer(rawState.pressure?.simulatedTicks, 0, 1000000000, 0),
    tickRemainder: rounded(clamp(rawState.pressure?.tickRemainder, 0, 0.999999, 0)),
    equalizedDoorIds: uniqueIdentifiers(rawState.pressure?.equalizedDoorIds, allowedDoorIds, fallback.doors.length),
    stabilizedRoomIds: stableRoomIdsV70(fallback.rooms)
  };

  fallback.acidPools = sanitizeAcidPoolsV70(rawState.acidPools, allowedRooms);
  fallback.acid = {
    encountered: Boolean(rawState.acid?.encountered),
    maxPersistenceSeconds: fallback.acidPools.reduce((maximum, pool) => Math.max(maximum, pool.ageSeconds), 0)
  };

  const durationSeconds = ALIEN_SURVIVAL_DIFFICULTY_V70[difficulty].selfDestructSeconds;
  const engineeringAuthorized = Boolean(rawState.selfDestruct?.authorizations?.engineering);
  const commandAuthorized = Boolean(rawState.selfDestruct?.authorizations?.command);
  const armed = Boolean(rawState.selfDestruct?.armed) && engineeringAuthorized && commandAuthorized;
  const remainingSeconds = rounded(clamp(rawState.selfDestruct?.remainingSeconds, 0, durationSeconds, durationSeconds));
  fallback.selfDestruct = {
    authorizations: { engineering: engineeringAuthorized, command: commandAuthorized },
    authorizedAt: {
      engineering: engineeringAuthorized ? clamp(rawState.selfDestruct?.authorizedAt?.engineering, 0, 100000000, 0) : null,
      command: commandAuthorized ? clamp(rawState.selfDestruct?.authorizedAt?.command, 0, 100000000, 0) : null
    },
    armed,
    armedAt: armed ? clamp(rawState.selfDestruct?.armedAt, 0, 100000000, 0) : null,
    durationSeconds,
    remainingSeconds: armed ? remainingSeconds : durationSeconds,
    expired: armed && (Boolean(rawState.selfDestruct?.expired) || remainingSeconds <= 0)
  };

  fallback.elapsedSeconds = rounded(clamp(rawState.elapsedSeconds, 0, 100000000, 0));
  const provisionalValidation = validateAlienSurvivalCompletionV70(fallback, {
    deploymentOperationId: expectedDeploymentId,
    requireExtraction: false
  });
  fallback.extracted = Boolean(rawState.extracted)
    && provisionalValidation.mechanicsComplete
    && !fallback.selfDestruct.expired;
  fallback.completedAt = fallback.extracted
    ? clamp(rawState.completedAt, 0, 100000000, fallback.elapsedSeconds)
    : null;
  fallback.phase = deriveAlienSurvivalPhaseV70(fallback);
  return fallback;
}

function simulationDoorV70(source, canonical) {
  const record = isRecord(source) ? source : {};
  const welded = canonical.welded || Boolean(record.welded);
  return {
    ...canonical,
    open: !welded && Boolean(record.open),
    welded
  };
}

function simulatePressureTickV70(state, simulationDoors) {
  const roomById = new Map(state.rooms.map((room) => [room.id, room]));
  const startingPressure = new Map(state.rooms.map((room) => [room.id, room.pressure]));
  const pressureDelta = new Map(state.rooms.map((room) => [room.id, 0]));
  const seconds = 1 / ALIEN_SURVIVAL_PRESSURE_TICK_RATE_V70;

  for (const door of simulationDoors) {
    if (!door.open || door.welded) continue;
    const fromIsExterior = door.fromRoomId === ALIEN_SURVIVAL_EXTERIOR_ROOM_ID_V70;
    const toIsExterior = door.toRoomId === ALIEN_SURVIVAL_EXTERIOR_ROOM_ID_V70;
    const from = fromIsExterior ? 0 : startingPressure.get(door.fromRoomId);
    const to = toIsExterior ? 0 : startingPressure.get(door.toRoomId);
    if (!Number.isFinite(from) || !Number.isFinite(to)) continue;
    const rate = fromIsExterior || toIsExterior
      ? EXTERIOR_PRESSURE_EQUALIZATION_RATE
      : PRESSURE_EQUALIZATION_RATE;
    const transfer = (from - to) * rate * seconds;
    if (!fromIsExterior) pressureDelta.set(door.fromRoomId, pressureDelta.get(door.fromRoomId) - transfer);
    if (!toIsExterior) pressureDelta.set(door.toRoomId, pressureDelta.get(door.toRoomId) + transfer);
  }

  const lifeSupportPowered = Boolean(state.power.routes['life-support']);
  for (const room of state.rooms) {
    let pressure = startingPressure.get(room.id) + pressureDelta.get(room.id);
    pressure -= room.breachRate * seconds;
    if (lifeSupportPowered && room.breachRate <= 0 && pressure < room.targetPressure) {
      pressure += Math.min(room.targetPressure - pressure, LIFE_SUPPORT_PRESSURE_PER_SECOND * seconds);
    }
    room.pressure = rounded(clamp(pressure, 0, 100, 0));

    let oxygen = room.oxygen;
    if (oxygen > room.pressure) {
      oxygen -= Math.min(oxygen - room.pressure, (2 + (oxygen - room.pressure) * 0.18) * seconds);
    }
    if (lifeSupportPowered && room.breachRate <= 0 && oxygen < room.pressure) {
      oxygen += Math.min(room.pressure - oxygen, LIFE_SUPPORT_OXYGEN_PER_SECOND * seconds);
    }
    room.oxygen = rounded(clamp(oxygen, 0, 100, 0));
  }

  for (const door of simulationDoors) {
    if (!door.open || door.welded || state.pressure.equalizedDoorIds.includes(door.id)) continue;
    const from = roomById.get(door.fromRoomId);
    const to = roomById.get(door.toRoomId);
    if (from && to && Math.abs(from.pressure - to.pressure) <= PRESSURE_EQUALIZATION_THRESHOLD) {
      state.pressure.equalizedDoorIds.push(door.id);
    }
  }
  state.pressure.stabilizedRoomIds = stableRoomIdsV70(state.rooms);
  state.pressure.simulatedTicks += 1;
}

export function simulateRoomPressureV70(state, doorsOrDelta = state?.doors, requestedDelta = 0) {
  if (!isRecord(state) || !Array.isArray(state.rooms) || !Array.isArray(state.doors)) return state;
  const externalDoors = Array.isArray(doorsOrDelta) ? doorsOrDelta : state.doors;
  const deltaSeconds = Array.isArray(doorsOrDelta) ? requestedDelta : doorsOrDelta;
  const next = clone(state);
  if (!isRecord(next.pressure)) {
    next.pressure = { simulatedTicks: 0, tickRemainder: 0, equalizedDoorIds: [], stabilizedRoomIds: [] };
  }
  next.pressure.equalizedDoorIds = uniqueIdentifiers(
    next.pressure.equalizedDoorIds,
    new Set(next.doors.map((door) => door.id)),
    next.doors.length
  );
  const externalById = new Map(externalDoors.map((door) => [identifier(door?.id), door]));
  const simulationDoors = next.doors
    .map((door) => simulationDoorV70(externalById.get(door.id), door))
    .sort((left, right) => left.id.localeCompare(right.id));
  const boundedDelta = clamp(deltaSeconds, 0, MAX_SIMULATION_SECONDS, 0);
  const totalTicks = clamp(next.pressure.tickRemainder, 0, 0.999999, 0)
    + boundedDelta * ALIEN_SURVIVAL_PRESSURE_TICK_RATE_V70;
  const wholeTicks = Math.floor(totalTicks + 1e-9);
  next.pressure.tickRemainder = rounded(totalTicks - wholeTicks, 9);
  for (let tick = 0; tick < wholeTicks; tick += 1) simulatePressureTickV70(next, simulationDoors);
  next.phase = deriveAlienSurvivalPhaseV70(next);
  return next;
}

function extractionRoomIsStableV70(state) {
  const preferred = state.rooms?.find((room) => room.id === 'ship-extraction');
  const room = preferred || state.rooms?.at(-1);
  return Boolean(
    room
    && Number(room.pressure) >= ALIEN_SURVIVAL_SAFE_PRESSURE_V70
    && Number(room.oxygen) >= ALIEN_SURVIVAL_SAFE_OXYGEN_V70
    && Number(room.breachRate) <= 0
  );
}

export function getAlienSurvivalMechanicsV70(state) {
  const doors = asList(state?.doors);
  const completedDoorIds = uniqueIdentifiers(
    state?.welding?.completedDoorIds,
    new Set(doors.map((door) => identifier(door?.id)).filter(Boolean)),
    MAX_DOORS
  );
  const equalizedDoorIds = uniqueIdentifiers(
    state?.pressure?.equalizedDoorIds,
    new Set(doors.map((door) => identifier(door?.id)).filter(Boolean)),
    MAX_DOORS
  );
  const requiredFeeds = uniqueIdentifiers(state?.cctv?.requiredFeedIds, null, MAX_ROOMS);
  const visitedFeeds = new Set(uniqueIdentifiers(state?.cctv?.visitedFeedIds, null, MAX_ROOMS));
  const acidPools = asList(state?.acidPools);
  const maxAcidAge = acidPools.reduce((maximum, pool) => Math.max(maximum, clamp(pool?.ageSeconds, 0, 86400, 0)), 0);
  const authorizations = state?.selfDestruct?.authorizations;
  return {
    'self-destruct': Boolean(
      state?.selfDestruct?.armed
      && !state?.selfDestruct?.expired
      && authorizations?.engineering
      && authorizations?.command
    ),
    'weldable-doors': completedDoorIds.length > 0,
    'room-pressure': equalizedDoorIds.length > 0 && extractionRoomIsStableV70(state),
    'power-routing': Number(state?.power?.rerouteCount) > 0
      && uniqueIdentifiers(state?.power?.everRouted, new Set(ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70), 3).length > 0,
    'security-cameras': requiredFeeds.length > 0 && requiredFeeds.every((id) => visitedFeeds.has(id)),
    'persistent-acid': acidPools.some((pool) => pool?.persistent === true && pool?.active !== false)
      && Math.max(maxAcidAge, clamp(state?.acid?.maxPersistenceSeconds, 0, 86400, 0)) >= 1
  };
}

export function deriveAlienSurvivalPhaseV70(state) {
  const mechanics = getAlienSurvivalMechanicsV70(state);
  if (state?.selfDestruct?.expired) return 'failed';
  if (state?.extracted && ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70.every((id) => mechanics[id])) return 'extracted';
  if (state?.selfDestruct?.armed) return 'escape';
  if (!mechanics['power-routing']) return 'restore-power';
  if (!mechanics['security-cameras']) return 'security-scan';
  if (!mechanics['weldable-doors'] || !mechanics['room-pressure']) return 'contain-breach';
  return 'authorize-destruct';
}

export function validateAlienSurvivalCompletionV70(state, {
  deploymentOperationId = state?.deploymentOperationId,
  requireExtraction = true
} = {}) {
  const expectedDeploymentId = identifier(deploymentOperationId);
  const identityValid = Boolean(
    isRecord(state)
    && state.schema === ALIEN_SURVIVAL_SCHEMA_V70
    && state.operationId === ALIEN_SURVIVAL_OPERATION_ID_V70
    && state.campaignId === ALIEN_SURVIVAL_CAMPAIGN_ID_V70
    && expectedDeploymentId
    && state.deploymentOperationId === expectedDeploymentId
  );
  const mechanics = getAlienSurvivalMechanicsV70(state);
  const completedMechanicIds = ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70.filter((id) => mechanics[id]);
  const missingMechanicIds = ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70.filter((id) => !mechanics[id]);
  const mechanicsComplete = missingMechanicIds.length === 0;
  const extracted = Boolean(state?.extracted) && !state?.selfDestruct?.expired;
  const complete = identityValid && mechanicsComplete && (!requireExtraction || extracted);
  return {
    valid: complete,
    complete,
    identityValid,
    mechanicsComplete,
    extracted,
    phase: deriveAlienSurvivalPhaseV70(state),
    mechanics,
    completedMechanicIds,
    missingMechanicIds
  };
}

export function buildAlienSurvivalResolutionPayloadV70(state, {
  deploymentOperationId = state?.deploymentOperationId
} = {}) {
  const validation = validateAlienSurvivalCompletionV70(state, { deploymentOperationId });
  const rooms = asList(state?.rooms);
  const acidPools = asList(state?.acidPools);
  return {
    schema: ALIEN_SURVIVAL_SCHEMA_V70,
    operationId: ALIEN_SURVIVAL_OPERATION_ID_V70,
    campaignId: ALIEN_SURVIVAL_CAMPAIGN_ID_V70,
    deploymentOperationId: identifier(deploymentOperationId),
    complete: validation.complete,
    phase: validation.phase,
    mechanics: ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70.map((id) => ({ id, complete: validation.mechanics[id] })),
    countdownRemaining: rounded(clamp(state?.selfDestruct?.remainingSeconds, 0, 120, 0)),
    stableRoomIds: stableRoomIdsV70(rooms),
    weldedDoorIds: uniqueIdentifiers(state?.welding?.completedDoorIds, null, MAX_DOORS),
    cctvFeedIds: uniqueIdentifiers(state?.cctv?.visitedFeedIds, null, MAX_ROOMS),
    acidPools: {
      total: acidPools.length,
      active: acidPools.filter((pool) => pool?.active !== false).length,
      maximumPersistenceSeconds: rounded(acidPools.reduce(
        (maximum, pool) => Math.max(maximum, clamp(pool?.ageSeconds, 0, 86400, 0)),
        0
      ))
    }
  };
}
