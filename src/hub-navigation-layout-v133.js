const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

// Explicit room-local placements share one pedestrian plane. Station props
// belong behind it: their tops can support a landing, their sides cannot
// turn the everyday ship corridor into a compulsory obstacle course.
export const HUB_WALKING_LANE_V133 = freeze({ floorY: 624, actorWidth: 44, actorHeight: 92, leftClearance: 128, rightClearance: 128 });
export const HUB_ROOM_NAVIGATION_V133 = freeze({
  bridge: { propX: 850, zone: 'starboard-command-post', propPlane: 'rear', collisionMode: 'one-way-top' },
  briefing: { propX: 620, zone: 'central-briefing-table', propPlane: 'rear', collisionMode: 'one-way-top' },
  'combat-information': { propX: 780, zone: 'data-spine-workstation', propPlane: 'rear', collisionMode: 'one-way-top' },
  'cryo-bay': { propX: 970, zone: 'starboard-pod-bank', propPlane: 'rear', collisionMode: 'one-way-top' },
  'crew-quarters': { propX: 950, zone: 'berth-bank', propPlane: 'rear', collisionMode: 'one-way-top' },
  mess: { propX: 740, zone: 'central-galley-table', propPlane: 'rear', collisionMode: 'one-way-top' },
  medical: { propX: 820, zone: 'treatment-bay', propPlane: 'rear', collisionMode: 'one-way-top' },
  'science-lab': { propX: 960, zone: 'sealed-laboratory-bench', propPlane: 'rear', collisionMode: 'one-way-top' },
  quarantine: { propX: 860, zone: 'decontamination-station', propPlane: 'rear', collisionMode: 'one-way-top' },
  armory: { propX: 760, zone: 'equipment-counter', propPlane: 'rear', collisionMode: 'one-way-top' },
  workshop: { propX: 900, zone: 'fabrication-bench', propPlane: 'rear', collisionMode: 'one-way-top' },
  'vehicle-bay': { propX: 900, zone: 'maintenance-hoist-before-aft-lift', propPlane: 'rear', collisionMode: 'one-way-top' },
  'dropship-hangar': { propX: 896, propPlane: 'rear', collisionMode: 'one-way-top' },
  reactor: { propX: 820, zone: 'reactor-control-ring', propPlane: 'rear', collisionMode: 'one-way-top' },
  'life-support': { propX: 900, zone: 'filtration-bank', propPlane: 'rear', collisionMode: 'one-way-top' },
  'sensor-array': { propX: 780, zone: 'sensor-control-spine', propPlane: 'rear', collisionMode: 'one-way-top' }
});

// Commercial entrances occupy clear floor-level sockets, away from the
// bulkhead at x0/1280, the room station and either shared lift shaft.
// The three later residential/port annexes retain their authored sockets.
export const HUB_ANNEX_ENTRANCES_V133 = freeze({
  // The landing craft now occupies its measured parking bay x150–870.
  // One shared socket moves the actual door, prompt and return pose together.
  'arrival-airlock': { centerX: 1040, bottom: 624 },
  logistics: { centerX: 360, bottom: 624 },
  'mire-archives': { centerX: 300, bottom: 624 },
  'synthetic-bay': { centerX: 360, bottom: 624 },
  cctv: { centerX: 350, bottom: 624 },
  'proving-ground': { centerX: 340, bottom: 624 },
  morgue: { centerX: 340, bottom: 624 },
  'escape-pods': { centerX: 360, bottom: 624 },
  durandal: { centerX: 360, bottom: 624 },
  bioforge: { centerX: 340, bottom: 624 }
});

export function hubRearPropColliderV133(bounds) {
  return { ...bounds, physicalPlane: 'rear', collisionMode: 'one-way-top' };
}

export function validateHubWalkingLaneV133(geometry = [], { floorY = 624, actorHeight = 92, minimumX = 24, maximumX = 1236 } = {}) {
  const blockers = geometry.filter(collider => collider.collisionMode !== 'one-way-top'
    && collider.x < maximumX && collider.x + collider.w > minimumX
    && collider.y < floorY && collider.y + collider.h > floorY - actorHeight);
  return { valid: blockers.length === 0, blockers: blockers.map(collider => collider.id || collider.role || 'unnamed') };
}
