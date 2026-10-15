import { HUB_DECKS } from './hub-game.js';
import { HUB_ANNEXES_V137 } from './hub-annex-registry-v137.js';
import { HUB_ANNEX_ENTRANCES_V133 } from './hub-navigation-layout-v133.js';
import { HUB_SHIP_SPACE_BY_ID_V137, HUB_SHIP_CONNECTIONS_V137 } from './hub-ship-layout-v137.js';

const freeze = value => { if (value && typeof value === 'object' && !Object.isFrozen(value)) {
  Object.values(value).forEach(freeze); Object.freeze(value);
} return value; };
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const valid = b => b && ['x', 'y', 'w', 'h'].every(key => Number.isFinite(b[key])) && b.w > 0 && b.h > 0;
const baseRooms = HUB_DECKS.flatMap(deck => deck.rooms.map(room => ({ ...room, deckId: deck.id })));
const roomById = Object.fromEntries(baseRooms.map(room => [room.id, room]));
const annexById = Object.fromEntries(HUB_ANNEXES_V137.map(annex => [annex.id, annex]));
const category = {
  command: ['flight-control-cockpit', 'mire-archives', 'durandal'],
  habitat: ['personal-refuge', 'animal-care', 'galley-service'],
  care: ['morgue', 'synthetic-bay', 'sanitary-bay', 'water-recycling'],
  security: ['cctv', 'bioforge', 'proving-ground', 'escape-pods'],
  industrial: ['arrival-airlock', 'logistics', 'frontier-civil-counter', 'engine-room', 'maintenance-spine']
};
export const HUB_DESTINATION_LABELS_V138 = freeze({
  'arrival-airlock': 'SAS ARRIVÉE', logistics: 'LOGISTIQUE', 'mire-archives': 'ARCHIVES MIRE',
  'synthetic-bay': 'SYNTHÉTIQUES', cctv: 'SURVEILLANCE', 'proving-ground': 'TERRAIN D’ESSAI',
  morgue: 'MORGUE', 'escape-pods': 'CAPSULES', durandal: 'DURANDAL', bioforge: 'BIOFORGE',
  'animal-care': 'SOINS ANIMAUX', 'frontier-civil-counter': 'RELAIS CIVIL', 'personal-refuge': 'REFUGE',
  'flight-control-cockpit': 'COCKPIT', 'galley-service': 'CUISINE', 'sanitary-bay': 'SANITAIRES',
  'engine-room': 'MACHINES', 'water-recycling': 'RECYCLAGE EAU', 'maintenance-spine': 'MAINTENANCE',
  bridge: 'PASSERELLE', briefing: 'BRIEFING', 'combat-information': 'CENTRE TACTIQUE', 'cryo-bay': 'BAIE CRYO',
  'crew-quarters': 'QUARTIERS', mess: 'MESS', medical: 'BLOC MÉDICAL', 'science-lab': 'LABORATOIRE',
  quarantine: 'QUARANTAINE', armory: 'ARMURERIE', workshop: 'ATELIER', 'vehicle-bay': 'VÉHICULES',
  'dropship-hangar': 'HANGAR', reactor: 'RÉACTEUR', 'life-support': 'SUPPORT VIE', 'sensor-array': 'CAPTEURS'
});
export const HUB_DESTINATION_SIGN_COLORS_V138 = freeze({ command: '#9bbfc9', habitat: '#c5b795', care: '#a2c7ba', security: '#c9b17f', industrial: '#acb798' });

/** Twenty actual connections, including the two distinct maintenance ends.
 * Coordinates on each parent are local until the caller supplies its world
 * origin. This catalogue adds no graph, transport, interaction or collision. */
export const HUB_DESTINATION_CONNECTIONS_V138 = freeze([
  ...HUB_ANNEXES_V137.filter(annex => !HUB_SHIP_SPACE_BY_ID_V137[annex.id]).map(annex => {
    const parent = roomById[annex.parentRoomId], socket = HUB_ANNEX_ENTRANCES_V133[annex.id];
    const parentBounds = annex.parentDoorBounds || { x: parent.xStart + socket.centerX - annex.entrance.w / 2,
      y: socket.bottom - annex.entrance.h, w: annex.entrance.w, h: annex.entrance.h };
    return { id: annex.id, endpointId: null, spaceId: annex.id, parentRoomId: parent.id, parentDeck: annex.parentDeck,
      parentSocket: { ...parentBounds, x: parentBounds.x - parent.xStart },
      annexSocket: { ...annex.entrance, x: annex.entranceLocalX - annex.entrance.w / 2 } };
  }),
  ...HUB_SHIP_CONNECTIONS_V137.map(connection => ({ id: connection.id, endpointId: connection.id, spaceId: connection.spaceId,
    parentRoomId: connection.parentRoomId, parentDeck: connection.parentDeck,
    parentSocket: { ...connection.parentDoorBounds, x: connection.parentDoorBounds.x - roomById[connection.parentRoomId].xStart },
    annexSocket: { ...connection.annexDoorBounds } }))
]);

export function getHubDoorDestinationDescriptorsV138(room) {
  if (!room?.id) return [];
  const start = finite(room.xStart), descriptors = [];
  for (const connection of HUB_DESTINATION_CONNECTIONS_V138) {
    const parent = connection.parentRoomId === room.id, returning = connection.spaceId === room.id;
    if (!parent && !returning) continue;
    const destinationId = parent ? connection.spaceId : connection.parentRoomId;
    const socket = parent ? connection.parentSocket : connection.annexSocket;
    const functionClass = Object.keys(category).find(key => category[key].includes(connection.spaceId)) || 'industrial';
    descriptors.push({ id: `${connection.id}:${parent ? 'parent' : 'return'}`, connectionId: connection.id,
      endpointId: connection.endpointId, face: parent ? 'parent' : 'return', roomId: room.id, destinationId,
      label: HUB_DESTINATION_LABELS_V138[destinationId],
      destinationName: annexById[destinationId]?.name || roomById[destinationId]?.name,
      destinationDeckId: connection.parentDeck, functionClass,
      color: HUB_DESTINATION_SIGN_COLORS_V138[functionClass],
      socket: { x: start + socket.x, y: socket.y, w: socket.w, h: socket.h },
      delegatedToV137: returning && room.id === 'maintenance-spine' });
  }
  return descriptors;
}

/** Use the actual portal renderer's target; its generous interaction socket
 * has a different top. The callback avoids a spatial/signage import cycle. */
export function getHubDestinationSignPlansV138(room, { portalTargetForBounds } = {}) {
  if (typeof portalTargetForBounds !== 'function') return [];
  const start = finite(room?.xStart), plans = [];
  for (const descriptor of getHubDoorDestinationDescriptorsV138(room)) {
    if (descriptor.delegatedToV137 || !descriptor.label) continue;
    const target = portalTargetForBounds({ ...descriptor.socket });
    if (!valid(target)) continue;
    let fontSize = 11, height = 20, width = Math.max(72, Math.ceil((descriptor.label.length * 7 + 18) / 8) * 8);
    let x = target.x + target.w / 2 - width / 2, y = target.y - 10 - height;
    let mount = { kind: 'rear-wall-above-portal' };
    if (descriptor.face === 'parent' && descriptor.destinationId === 'sanitary-bay') {
      fontSize = 10; height = 18; width = 96; x = target.x + target.w / 2 - width / 2; y = target.y - 10 - height;
    } else if (descriptor.face === 'parent' && descriptor.destinationId === 'personal-refuge') {
      fontSize = 10; height = 16; width = 72; x = target.x + target.w / 2 - width / 2; y = 502;
      mount = { kind: 'native-landing-fascia', platformId: 'quarters-low', nativeTop: 500, nativeThickness: 20 };
    } else if (descriptor.face === 'parent' && descriptor.destinationId === 'arrival-airlock') {
      fontSize = 10; height = 16; width = 88; x = target.x + target.w - width - 2; y = 442;
      mount = { kind: 'native-landing-fascia', platformId: 'hangar-maintenance-alcove-v133', nativeTop: 440, nativeThickness: 20 };
    } else if (descriptor.face === 'parent' && descriptor.destinationId === 'frontier-civil-counter') {
      fontSize = 10; width = 92; x = descriptor.socket.x;
      mount = { kind: 'rear-wall-above-portal', alignment: 'left-of-adjacent-native-ladder' };
    }
    const bounds = { x, y, w: width, h: height };
    plans.push({ ...descriptor, portalTarget: { ...target }, bounds,
      frame: { x: x - 2, y: y - 2, w: width + 4, h: height + 4 }, mount, fontSize,
      textPadding: 8, textBaseline: height === 16 ? 11 : height === 18 ? 12 : 14,
      roomStart: start, projection: 'orthographic-wall-plaque', plane: 'rear-wall-static',
      cameraFactor: 1, collidable: false, interactive: false, sourceStatus: 'actual-native-door-destination' });
  }
  return plans;
}

export function getHubDestinationSignReservationsV138(room, options = {}) {
  return getHubDestinationSignPlansV138(room, options).map(sign => ({ ...sign.frame,
    role: 'destination-sign', sourceId: sign.id, connectionId: sign.connectionId, destinationId: sign.destinationId }));
}
