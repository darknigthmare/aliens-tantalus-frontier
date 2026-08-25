const SOURCE_SIZE_V58 = Object.freeze({ width: 1774, height: 887 });
const RENDER_BOUNDS_V58 = Object.freeze({ x: 0, y: 0, w: 1280, h: 640 });
const FLOOR_Y_V58 = 624;

const rect = (x, y, w, h) => Object.freeze({ x, y, w, h });

const definitions = Object.freeze([
  Object.freeze(['bridge', 'command-bridge']),
  Object.freeze(['briefing', 'command-briefing']),
  Object.freeze(['combat-information', 'command-cic']),
  Object.freeze(['cryo-bay', 'command-cryo']),
  Object.freeze(['crew-quarters', 'habitat-quarters']),
  Object.freeze(['mess', 'habitat-mess']),
  Object.freeze(['medical', 'habitat-medical']),
  Object.freeze(['science-lab', 'habitat-lab']),
  Object.freeze(['quarantine', 'industrial-quarantine']),
  Object.freeze(['armory', 'industrial-armory']),
  Object.freeze(['workshop', 'industrial-workshop']),
  Object.freeze(['vehicle-bay', 'industrial-vehicle-bay']),
  Object.freeze(['dropship-hangar', 'engineering-hangar']),
  Object.freeze(['reactor', 'engineering-reactor']),
  Object.freeze(['life-support', 'engineering-life-support']),
  Object.freeze(['sensor-array', 'engineering-sensors'])
]);

const midLayer = (roomId, artKey) => Object.freeze({
  id: `${artKey}-mid`,
  roomId,
  artKey,
  kind: 'visual-layer',
  depth: 'mid',
  phase: 'back',
  asset: `/assets/openai/hub/layers/${artKey}-mid.png`,
  sourceSize: SOURCE_SIZE_V58,
  renderBounds: RENDER_BOUNDS_V58,
  collidable: false
});

const farLayer = (roomId, artKey) => Object.freeze({
  id: `${artKey}-far`,
  roomId,
  artKey,
  kind: 'visual-layer',
  depth: 'far',
  phase: 'back',
  asset: `/assets/openai/hub/layers/${artKey}-far.png`,
  sourceSize: SOURCE_SIZE_V58,
  renderBounds: RENDER_BOUNDS_V58,
  collidable: false
});

/**
 * Les couches MID ferment la coque visuelle sans devenir des colliders. La
 * géométrie de jeu, les portes et les conduits restent exclusivement pilotés
 * par le runtime afin qu'aucun détail peint ne promette un passage inexistant.
 */
export const HUB_ROOM_MID_ART_V58 = Object.freeze(Object.fromEntries(
  definitions.map(([roomId, artKey]) => [roomId, midLayer(roomId, artKey)])
));

export const HUB_ROOM_MID_ASSETS_V58 = Object.freeze(
  Object.values(HUB_ROOM_MID_ART_V58).map((entry) => entry.asset)
);

export const HUB_ROOM_FAR_ART_V58 = Object.freeze(Object.fromEntries(
  definitions.map(([roomId, artKey]) => [roomId, farLayer(roomId, artKey)])
));

export const HUB_ROOM_FAR_ASSETS_V58 = Object.freeze(
  Object.values(HUB_ROOM_FAR_ART_V58).map((entry) => entry.asset)
);

/**
 * Acteur physique autonome de la baie véhicules. La plaque M577 est déjà
 * normalisée; seules les bornes opaques de sa première cellule sont rendues.
 * Le lift de maintenance reste un prop séparé et ne porte pas ce contrat.
 */
export const VEHICLE_BAY_ART_V58 = Object.freeze({
  release: 'v58',
  roomId: 'vehicle-bay',
  composition: 'modular-actor',
  allowsMonolith: false,
  allowsFallback: false,
  vehicle: Object.freeze({
    id: 'vehicle-bay-m577-apc',
    kind: 'vehicle-sprite',
    phase: 'actors',
    asset: '/assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png',
    vehicleId: 'vehicle-001-m577-armored-personnel-carrier',
    sheet: Object.freeze({ columns: 4, rows: 4, cellWidth: 256, cellHeight: 256 }),
    sourceCell: Object.freeze({ column: 0, row: 0 }),
    sourceOpaqueBounds: rect(24, 106, 207, 134),
    renderBounds: rect(230, 390, 460, 234),
    collisionBounds: rect(286, 550, 348, 74),
    interactionBounds: rect(198, 486, 524, 138),
    action: 'navigate:vehicles',
    description: 'Inspecter le M577 et ses rôles par siège.'
  })
});

export const HUB_VEHICLE_ART_ASSETS_V58 = Object.freeze([
  VEHICLE_BAY_ART_V58.vehicle.asset
]);

export const HUB_ROOM_LIGHTING_V58 = Object.freeze({
  medical: Object.freeze({ tint: 'rgba(5, 18, 22, .13)', vignette: 'rgba(1, 7, 9, .16)' }),
  'life-support': Object.freeze({ tint: 'rgba(5, 17, 12, .12)', vignette: 'rgba(1, 7, 5, .15)' })
});

export function resolveHubRoomMidArtV58(roomId) {
  return HUB_ROOM_MID_ART_V58[String(roomId || '').trim()] || null;
}

export function requireHubRoomMidArtV58(roomId) {
  const layer = resolveHubRoomMidArtV58(roomId);
  if (!layer) throw new RangeError(`No v58 hub mid-layer contract for room: ${String(roomId)}`);
  return layer;
}

export function resolveHubRoomFarArtV58(roomId) {
  return HUB_ROOM_FAR_ART_V58[String(roomId || '').trim()] || null;
}

export function requireHubRoomFarArtV58(roomId) {
  const layer = resolveHubRoomFarArtV58(roomId);
  if (!layer) throw new RangeError(`No v58 hub far-layer contract for room: ${String(roomId)}`);
  return layer;
}

export function resolveHubVehicleArtV58(roomId) {
  return String(roomId || '').trim() === VEHICLE_BAY_ART_V58.roomId ? VEHICLE_BAY_ART_V58 : null;
}

export function requireHubVehicleArtV58(roomId) {
  const contract = resolveHubVehicleArtV58(roomId);
  if (!contract) throw new RangeError(`No v58 hub vehicle contract for room: ${String(roomId)}`);
  return contract;
}

export function resolveHubRoomLightingV58(roomId) {
  return HUB_ROOM_LIGHTING_V58[String(roomId || '').trim()] || null;
}

export function isInsideHubActorLevelV58(bounds) {
  return Number.isFinite(bounds?.x) && Number.isFinite(bounds?.y)
    && Number.isFinite(bounds?.w) && Number.isFinite(bounds?.h)
    && bounds.w > 0 && bounds.h > 0
    && bounds.x >= 0 && bounds.y >= 0
    && bounds.x + bounds.w <= RENDER_BOUNDS_V58.w
    && bounds.y + bounds.h <= 720
    && bounds.y + bounds.h <= FLOOR_Y_V58;
}
