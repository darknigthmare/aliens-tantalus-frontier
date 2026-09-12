export const BIOFORGE_LEVEL_SCHEMA_V80 = 80;

export const BIOFORGE_VIEWPORT_V80 = Object.freeze({
  width: 1280,
  height: 720
});

export const BIOFORGE_WORLD_V80 = Object.freeze({
  x: 0,
  y: 0,
  width: 2880,
  height: 720,
  ceilingY: 84,
  floorY: 620
});

export const BIOFORGE_ROOM_IDS_V80 = Object.freeze([
  'control-room',
  'airlock-inner',
  'airlock-outer',
  'printer-bay',
  'containment-arena',
  'return-lock'
]);

export const BIOFORGE_DOOR_IDS_V80 = Object.freeze([
  'control-seal',
  'inner-interlock',
  'arena-containment',
  'arena-return',
  'hub-return'
]);

export const BIOFORGE_MAX_SPAWNS_V80 = 12;

const ACTIVE_CONTAINMENT_PHASES = new Set(['sealing', 'printing', 'combat', 'result', 'purging']);

const freezeDeep = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) freezeDeep(child);
  return value;
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, Number(value) || 0));

const ROOMS = freezeDeep([
  { id: 'control-room', label: 'SALLE DE CONTRÔLE', x: 0, y: 84, w: 440, h: 536, kind: 'control' },
  { id: 'airlock-inner', label: 'SAS A', x: 440, y: 84, w: 230, h: 536, kind: 'airlock' },
  { id: 'airlock-outer', label: 'SAS B', x: 670, y: 84, w: 250, h: 536, kind: 'airlock' },
  { id: 'printer-bay', label: 'BAIE D’IMPRESSION', x: 920, y: 84, w: 360, h: 536, kind: 'printer' },
  { id: 'containment-arena', label: 'ARÈNE DE CONFINEMENT', x: 1280, y: 84, w: 1180, h: 536, kind: 'arena' },
  { id: 'return-lock', label: 'SAS RETOUR', x: 2460, y: 84, w: 420, h: 536, kind: 'return' }
]);

const DOORS = freezeDeep([
  { id: 'control-seal', x: 420, y: 84, w: 40, h: 536, between: ['control-room', 'airlock-inner'], safety: 'double-airlock-a' },
  { id: 'inner-interlock', x: 650, y: 84, w: 40, h: 536, between: ['airlock-inner', 'airlock-outer'], safety: 'double-airlock-b' },
  { id: 'arena-containment', x: 1260, y: 84, w: 40, h: 536, between: ['printer-bay', 'containment-arena'], safety: 'containment' },
  { id: 'arena-return', x: 2440, y: 84, w: 40, h: 536, between: ['containment-arena', 'return-lock'], safety: 'combat-exit' },
  { id: 'hub-return', x: 2820, y: 84, w: 40, h: 536, between: ['return-lock', 'hub'], safety: 'level-boundary' }
]);

const PLATFORMS = freezeDeep([
  { id: 'control-floor', x: 0, y: 620, w: 440, h: 100, roomId: 'control-room', floor: true },
  { id: 'airlock-inner-floor', x: 440, y: 620, w: 230, h: 100, roomId: 'airlock-inner', floor: true },
  { id: 'airlock-outer-floor', x: 670, y: 620, w: 250, h: 100, roomId: 'airlock-outer', floor: true },
  { id: 'printer-floor', x: 920, y: 620, w: 360, h: 100, roomId: 'printer-bay', floor: true },
  { id: 'arena-floor', x: 1280, y: 620, w: 1180, h: 100, roomId: 'containment-arena', floor: true },
  { id: 'arena-catwalk-left', x: 1450, y: 470, w: 390, h: 22, roomId: 'containment-arena', oneWay: true },
  { id: 'arena-catwalk-right', x: 1930, y: 470, w: 390, h: 22, roomId: 'containment-arena', oneWay: true },
  { id: 'return-floor', x: 2460, y: 620, w: 420, h: 100, roomId: 'return-lock', floor: true }
]);

const LADDERS = freezeDeep([
  { id: 'arena-ladder-left', x: 1510, top: 470, bottom: 620, w: 52, roomId: 'containment-arena' },
  { id: 'arena-ladder-right', x: 2260, top: 470, bottom: 620, w: 52, roomId: 'containment-arena' }
]);

const STATIONS = freezeDeep([
  { id: 'bioforge-control', type: 'control', x: 190, y: 520, w: 76, h: 100, roomId: 'control-room', assetSlot: 'control-console' },
  { id: 'bioforge-printer', type: 'printer', x: 1080, y: 392, w: 148, h: 228, roomId: 'printer-bay', assetSlot: 'specimen-printer' },
  { id: 'bioforge-purge', type: 'purge', x: 2535, y: 520, w: 76, h: 100, roomId: 'return-lock', assetSlot: 'purge-console' },
  { id: 'bioforge-return', type: 'return', x: 2740, y: 520, w: 64, h: 100, roomId: 'return-lock', assetSlot: 'return-console' }
]);

const SPAWN_SLOTS = freezeDeep([
  { id: 'spawn-01', x: 1440, groundY: 620 },
  { id: 'spawn-02', x: 1605, groundY: 620 },
  { id: 'spawn-03', x: 1770, groundY: 620 },
  { id: 'spawn-04', x: 1980, groundY: 620 },
  { id: 'spawn-05', x: 2145, groundY: 620 },
  { id: 'spawn-06', x: 2310, groundY: 620 },
  { id: 'spawn-07', x: 1495, groundY: 470 },
  { id: 'spawn-08', x: 1655, groundY: 470 },
  { id: 'spawn-09', x: 1815, groundY: 470 },
  { id: 'spawn-10', x: 1975, groundY: 470 },
  { id: 'spawn-11', x: 2135, groundY: 470 },
  { id: 'spawn-12', x: 2295, groundY: 470 }
]);

const AUTHORED_LEVEL = freezeDeep({
  schema: BIOFORGE_LEVEL_SCHEMA_V80,
  id: 'bioforge-experimental-level-v80',
  viewport: BIOFORGE_VIEWPORT_V80,
  world: BIOFORGE_WORLD_V80,
  rooms: ROOMS,
  doors: DOORS,
  platforms: PLATFORMS,
  ladders: LADDERS,
  stations: STATIONS,
  spawnSlots: SPAWN_SLOTS,
  playerSpawn: { x: 160, y: 528, w: 42, h: 92, facing: 1, roomId: 'control-room' },
  arenaPlayerSpawn: { x: 1350, y: 528, w: 42, h: 92, facing: 1, roomId: 'containment-arena' },
  arenaBounds: { x: 1300, y: 104, w: 1140, h: 516 },
  returnTrigger: { x: 2680, y: 500, w: 132, h: 120, roomId: 'return-lock' },
  assetSlots: [
    'background-far',
    'background-mid',
    'foreground',
    'control-console',
    'specimen-printer',
    'purge-console',
    'return-console',
    'containment-door',
    'airlock-door'
  ]
});

export function createBioforgeLevelV80() {
  return clone(AUTHORED_LEVEL);
}

export function getBioforgeDoorStateV80(doorId, phase = 'sealing') {
  const id = String(doorId || '');
  const active = ACTIVE_CONTAINMENT_PHASES.has(String(phase || ''));
  if (!BIOFORGE_DOOR_IDS_V80.includes(id)) return null;
  if (id === 'arena-return') return { open: phase === 'return', locked: phase !== 'return', reason: phase === 'combat' ? 'combat-active' : phase === 'return' ? null : 'purge-required' };
  if (id === 'hub-return') return { open: phase === 'return', locked: phase !== 'return', reason: phase === 'return' ? null : 'purge-required' };
  return { open: false, locked: active || phase === 'return', reason: active ? 'containment-active' : 'safety-interlock' };
}

export function syncBioforgeDoorsV80(level, phase) {
  const doors = Array.isArray(level?.doors) ? level.doors : [];
  for (const door of doors) Object.assign(door, getBioforgeDoorStateV80(door.id, phase));
  return doors;
}

export function getBioforgeSpawnSlotV80(index, level = AUTHORED_LEVEL) {
  const slot = level?.spawnSlots?.[Number(index)];
  return slot ? { ...slot } : null;
}

export function resolveBioforgeFacingV80(x, targetX) {
  const delta = Number(targetX) - Number(x);
  return delta < 0 ? -1 : 1;
}

export function placeBioforgeSpecimenV80(specimen, index, level = AUTHORED_LEVEL, target = level?.playerSpawn) {
  const slot = getBioforgeSpawnSlotV80(index, level);
  if (!slot || !specimen) return null;
  const w = clamp(specimen.w || specimen.width || 52, 18, 180);
  const h = clamp(specimen.h || specimen.height || 82, 18, 230);
  const centerTarget = Number(target?.x || 0) + Number(target?.w || 0) / 2;
  return {
    ...specimen,
    x: slot.x - w / 2,
    y: slot.groundY - h,
    groundY: slot.groundY,
    w,
    h,
    facing: resolveBioforgeFacingV80(slot.x, centerTarget),
    bioforgeSpawnSlotIdV80: slot.id,
    bioforgeContainedV80: true
  };
}

export function confineBioforgeSpecimenV80(specimen, level = AUTHORED_LEVEL) {
  if (!specimen) return specimen;
  const bounds = level?.arenaBounds || AUTHORED_LEVEL.arenaBounds;
  const w = Math.max(1, Number(specimen.w) || 1);
  const h = Math.max(1, Number(specimen.h) || 1);
  specimen.x = clamp(specimen.x, bounds.x, bounds.x + bounds.w - w);
  specimen.y = clamp(specimen.y, bounds.y, bounds.y + bounds.h - h);
  if (Number.isFinite(Number(specimen.groundY))) specimen.groundY = clamp(specimen.groundY, bounds.y + h, bounds.y + bounds.h);
  if (specimen.x <= bounds.x || specimen.x >= bounds.x + bounds.w - w) specimen.vx = 0;
  if (specimen.y <= bounds.y || specimen.y >= bounds.y + bounds.h - h) specimen.vy = 0;
  specimen.bioforgeContainedV80 = true;
  return specimen;
}

export function isInsideBioforgeArenaV80(entity, level = AUTHORED_LEVEL) {
  if (!entity) return false;
  const bounds = level?.arenaBounds || AUTHORED_LEVEL.arenaBounds;
  const x = Number(entity.x) || 0;
  const y = Number(entity.y) || 0;
  const w = Math.max(0, Number(entity.w) || 0);
  const h = Math.max(0, Number(entity.h) || 0);
  return x >= bounds.x && y >= bounds.y && x + w <= bounds.x + bounds.w && y + h <= bounds.y + bounds.h;
}

export function validateBioforgeLevelV80(level = AUTHORED_LEVEL) {
  const errors = [];
  if (level?.schema !== BIOFORGE_LEVEL_SCHEMA_V80) errors.push('invalid-schema');
  if (level?.viewport?.width !== 1280 || level?.viewport?.height !== 720) errors.push('invalid-viewport');
  if (Number(level?.world?.width) <= level?.viewport?.width || Number(level?.world?.height) !== 720) errors.push('invalid-world-bounds');
  const roomIds = new Set((level?.rooms || []).map((room) => room.id));
  for (const id of BIOFORGE_ROOM_IDS_V80) if (!roomIds.has(id)) errors.push(`missing-room:${id}`);
  const doorIds = new Set((level?.doors || []).map((door) => door.id));
  for (const id of BIOFORGE_DOOR_IDS_V80) if (!doorIds.has(id)) errors.push(`missing-door:${id}`);
  if ((level?.spawnSlots || []).length !== BIOFORGE_MAX_SPAWNS_V80) errors.push('invalid-spawn-budget');
  const arena = level?.arenaBounds;
  for (const slot of level?.spawnSlots || []) {
    if (!arena || slot.x < arena.x || slot.x > arena.x + arena.w || slot.groundY < arena.y || slot.groundY > arena.y + arena.h) errors.push(`spawn-outside-arena:${slot.id}`);
  }
  const stationTypes = new Set((level?.stations || []).map((station) => station.type));
  for (const type of ['control', 'printer', 'purge', 'return']) if (!stationTypes.has(type)) errors.push(`missing-station:${type}`);
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
    roomCount: level?.rooms?.length || 0,
    doorCount: level?.doors?.length || 0,
    spawnCount: level?.spawnSlots?.length || 0
  });
}

export const BIOFORGE_LEVEL_V80 = AUTHORED_LEVEL;
