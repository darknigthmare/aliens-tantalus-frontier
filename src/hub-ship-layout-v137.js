import { HUB_PROP_ATLAS_V136, getHubPropAtlasCellV136 } from './hub-prop-atlas-v136.js';
import { HUB_FURNISHING_ATLAS_V137, getHubFurnishingCellV137 } from './hub-furnishing-atlas-v137.js';
import { HUB_MAINTENANCE_EAST_LANDING_V138 } from './hub-maintenance-landing-v138.js';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const clone = value => structuredClone(value);

/** Shared with the authored traversal profile. This is a real standing deck,
 * not an extra entrance drawn across the lower berths or an invented ladder. */
export const HUB_SHIP_PARENT_LANDINGS_V137 = freeze({
  'sanitary-bay': { platformId: 'quarters-high', roomId: 'crew-quarters', centerX: 850, bottom: 376 }
});

const socket = (spaceId, parentDeck, parentRoomId, roomIndex, centerX, bottom = 624, height = 192, entranceSide = 'west', localX = 144, annexStandingY = 624) => ({
  id: `${spaceId}:${entranceSide === 'east' ? 'workshop' : 'primary'}`, spaceId,
  parentDeck, parentRoomId, entranceSide, entranceLocalX: localX,
  parentDoorBounds: { x: roomIndex * 1280 + centerX - 59, y: bottom - height, w: 118, h: height },
  annexDoorBounds: { x: localX - 59, y: annexStandingY - 192, w: 118, h: 192 },
  standingY: bottom
});

export const HUB_SHIP_CONNECTIONS_V137 = freeze([
  socket('flight-control-cockpit', 'command', 'bridge', 0, 700),
  socket('galley-service', 'habitat', 'mess', 1, 230),
  socket('sanitary-bay', 'habitat', 'crew-quarters', 0,
    HUB_SHIP_PARENT_LANDINGS_V137['sanitary-bay'].centerX, HUB_SHIP_PARENT_LANDINGS_V137['sanitary-bay'].bottom, 156),
  socket('engine-room', 'engineering', 'reactor', 1, 420),
  socket('water-recycling', 'engineering', 'life-support', 2, 740),
  socket('maintenance-spine', 'engineering', 'sensor-array', 3, 430),
  socket('maintenance-spine', 'industrial', 'workshop', 2, 1080, 624, 192, 'east',
    HUB_MAINTENANCE_EAST_LANDING_V138.doorCenterX, HUB_MAINTENANCE_EAST_LANDING_V138.top)
]);

export function getHubShipConnectionV137(endpointId) {
  return HUB_SHIP_CONNECTIONS_V137.find(connection => connection.id === endpointId) || null;
}
export function getHubShipConnectionsForRoomV137(roomId, deckId = null) {
  return HUB_SHIP_CONNECTIONS_V137.filter(connection => connection.parentRoomId === roomId
    && (deckId == null || connection.parentDeck === deckId));
}
export function getHubShipConnectionsForSpaceV137(spaceId) {
  return HUB_SHIP_CONNECTIONS_V137.filter(connection => connection.spaceId === spaceId);
}

const definitions = [
  ['flight-control-cockpit', 'Cockpit de conduite', 'COCKPIT DE CONDUITE', 1280, 'command', 'command-bridge', 'records', 900,
    'Contrôler les commandes de conduite', 'Vérification locale des commandes, du siège pilote et des instruments de navigation.', ['conduite', 'navigation', 'veille de vol']],
  ['galley-service', 'Cuisine et préparation', 'CUISINE DE BORD', 1280, 'habitat', 'habitat-mess', 'galley', 900,
    'Contrôler le poste de préparation', 'Vérification locale du plan de préparation, du lavage et du rangement alimentaire.', ['préparation', 'lavage', 'rangement alimentaire']],
  ['sanitary-bay', 'Sanitaires et vestiaires', 'SANITAIRES · VESTIAIRES', 1280, 'habitat', 'habitat-medical', 'sterile', 900,
    'Contrôler les installations sanitaires', 'Vérification locale de l’hygiène, du circuit sanitaire et du rangement du linge.', ['hygiène', 'douches', 'linge de bord']],
  ['engine-room', 'Salle des machines', 'SALLE DES MACHINES', 1920, 'industrial', 'engineering-reactor', 'maintenance', 650,
    'Inspecter le groupe mécanique', 'Vérification locale des pompes, des entraînements et des accès de maintenance.', ['pompes', 'transmission', 'maintenance mécanique']],
  ['water-recycling', 'Traitement et recyclage de l’eau', 'TRAITEMENT DE L’EAU', 1280, 'industrial', 'engineering-life-support', 'maintenance', 900,
    'Inspecter le circuit de filtration', 'Vérification locale du traitement de l’eau, de ses filtres et des vannes de service.', ['filtration', 'recyclage de l’eau', 'vannes de service']],
  ['maintenance-spine', 'Coursive technique traversante', 'COURSIVE DE MAINTENANCE', 2560, 'industrial', 'engineering-sensors', 'records', 1280,
    'Consulter le repérage technique', 'Repérage de la liaison de service entre les capteurs et l’atelier. Les deux portes sont praticables.', ['liaison capteurs–atelier', 'distribution technique', 'accès de service']]
];
const cells = { records: 'data-cabinet', galley: 'galley-rack', sterile: 'sterile-cabinet', maintenance: 'tool-board' };
const heroCells = { 'flight-control-cockpit': 'cockpit-seat', 'galley-service': 'galley-unit',
  'sanitary-bay': 'sanitary-unit', 'engine-room': 'engine-pump', 'water-recycling': 'filtration-skid' };

function makeSpace([id, name, shortName, width, theme, wall, hero, stationCenter, label, message, systems]) {
  const connection = getHubShipConnectionsForSpaceV137(id)[0];
  const cell = heroCells[id] ? getHubFurnishingCellV137(heroCells[id]) : getHubPropAtlasCellV136(cells[hero]);
  const stationAsset = heroCells[id] ? HUB_FURNISHING_ATLAS_V137.asset : HUB_PROP_ATLAS_V136.asset;
  const stationWidth = cell.width;
  const stationHeight = stationWidth * cell.source.h / cell.source.w;
  const stationBottom = id === 'maintenance-spine' ? 570 : 624;
  const bounds = { x: stationCenter - stationWidth / 2, y: stationBottom - stationHeight, w: stationWidth, h: stationHeight };
  const platforms = [{ id: `${id}-floor`, x: 0, y: 624, w: width, h: 96, role: 'floor' }];
  const ladders = [];
  if (id === 'engine-room' || id === 'maintenance-spine') {
    const landing = HUB_MAINTENANCE_EAST_LANDING_V138;
    const x = id === 'engine-room' ? 960 : landing.x, w = id === 'engine-room' ? 640 : landing.endX - landing.x, y = landing.top;
    platforms.push({ id: `${id}-service-deck`, x, y, w, h: 20, role: 'catwalk' });
    ladders.push({ id: `${id}-service-ladder-west`, x: x + 60, y, w: 44, h: 624 - y, top: y, bottom: 624, role: 'ladder' });
    if (id === 'maintenance-spine') ladders.push({ id: `${id}-service-ladder-east`, x: landing.ladderXs[1], y, w: 44, h: 624 - y, top: y, bottom: 624, role: 'ladder' });
  }
  return {
    id, name, shortName, kind: 'physical-annex', navigationKind: 'ship-service-compartment-v137',
    parentDeck: connection.parentDeck, parentRoomId: connection.parentRoomId,
    parentDoorBounds: clone(connection.parentDoorBounds), entranceSide: connection.entranceSide, entranceLocalX: connection.entranceLocalX,
    entrance: { id: `${id}-annex-door`, x: connection.entranceLocalX, y: 432, w: 118, h: 192, bidirectional: true },
    world: { width, height: 720, floorY: 624, floorHeight: 96, playerClearanceWidth: 112, playerClearanceHeight: 192 },
    station: { id: `${id}-inspection`, label, action: 'service:ship-inspection-v137', description: label,
      persistent: true, singleStation: true, upgradeId: null, capabilities: ['local-service-inspection'],
      support: id === 'maintenance-spine' ? 'rear-wall' : 'floor', bounds },
    action: 'service:ship-inspection-v137', description: message, scope: 'walkable-ship-service-compartment',
    connectionIds: getHubShipConnectionsForSpaceV137(id).map(entry => entry.id), theme,
    ...(id === 'maintenance-spine' ? { layoutVersion: HUB_MAINTENANCE_EAST_LANDING_V138.layoutVersion } : {}),
    implementedFeatures: ['physical-entry-and-return', 'local-inspection-record'], deferredFeatures: [],
    normalHubCreaturesVisible: false, isolatedLevelTarget: null,
    platforms, ladders, colliders: [], props: [{ ...bounds, id: `${id}-inspection-prop`, role: 'inspection', collidable: false, artRole: 'prop' }],
    artRoles: ['far', 'prop', 'door'],
    art: { far: `/assets/openai/hub/layers/${wall}-far.png`, prop: stationAsset,
      door: '/assets/openai/hub/annexes/v71/bioforge/door.webp',
      alphaBounds: { prop: [cell.source.x, cell.source.y, cell.source.x + cell.source.w, cell.source.y + cell.source.h], door: [53, 29, 330, 483] } },
    sourceStatus: 'project-authored-service-layout-and-original-native-modules', systems,
    criteria: { scale: { logicalWidth: width, logicalHeight: 720, floorY: 624, minimumEntranceClearance: 112 },
      density: { maximumColliderCoverageRatio: .32, requiredInteractiveStations: 1 } }
  };
}

export const HUB_SHIP_SPACES_V137 = freeze(definitions.map(makeSpace));
export const HUB_SHIP_SPACE_BY_ID_V137 = freeze(Object.fromEntries(HUB_SHIP_SPACES_V137.map(space => [space.id, space])));

export function getHubShipStationReadoutV137(spaceId) {
  const space = HUB_SHIP_SPACE_BY_ID_V137[spaceId];
  return space ? freeze({ spaceId, title: space.name, inspectionId: space.station.id,
    message: space.description, systems: [...space.systems] }) : null;
}
