/** One projection for an entire compartment, including its floor, transverse
 * doors, service decks and furniture. A frontal furniture kit does not qualify
 * a room for oblique architecture. The maintenance spine uses an authored
 * procedural depth kit; the remaining rooms use complete frontal sections.
 * This is an art/layout contract, not movement along a third gameplay axis. */
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

export const HUB_ROOM_PROJECTION_STANDARD_V139 = freeze({
  schema: 139, scope: 'whole-compartment', gameplayPlane: '2d',
  obliqueRoomIds: ['maintenance-spine'],
  mixedProjectionAllowed: false, actorScaleByDepth: false,
  orthographic: { mode: '2d', projection: 'strict-side-elevation', dxPerY: 0,
    floor: 'orthographic-section', transverseDoor: 'edge-on-section', serviceDepth: 0 },
  oblique: { mode: '2.5d', projection: 'parallel-oblique', dxPerY: 19 / 12,
    floor: 'parallel-service-deck', transverseDoor: 'parallel-depth-section', serviceDepth: 24 }
});

const roomContracts = new Map();

export function getHubRoomProjectionV139(room) {
  const id = (typeof room === 'string' ? room : room?.id) || 'unknown';
  if (roomContracts.has(id)) return roomContracts.get(id);
  const standard = HUB_ROOM_PROJECTION_STANDARD_V139;
  const oblique = standard.obliqueRoomIds.includes(id);
  const contract = freeze({ schema: 139, roomId: id, ...standard[oblique ? 'oblique' : 'orthographic'],
    scope: standard.scope, mixedProjectionAllowed: false,
    furnitureKit: oblique ? 'authored-parallel-procedural-and-flush-wall-panels' : 'frontal-furniture-and-side-elevations',
    reason: oblique ? 'The entire maintenance compartment shares one parallel depth vector.'
      : 'The admitted native furniture requires a complete frontal compartment, including architecture and doors.' });
  roomContracts.set(id, contract);
  return contract;
}
