const ROOM_WIDTH = 1280;
const FLOOR_Y = 624;

const defineRoomProfile = (sceneScale, floorRatio, colliderWidth, colliderHeight, collisionMode = null) => Object.freeze({
  worldWidth: ROOM_WIDTH,
  sceneScale,
  floorRatio,
  authoredCollision: true,
  propCollider: Object.freeze({ width: colliderWidth, height: colliderHeight, ...(collisionMode ? { collisionMode } : {}) })
});

/**
 * Contrat de proportion des seize scènes peintes. Les petits locaux sont
 * rapprochés; les volumes de hangar restent à l’échelle de base. Le ratio de
 * sol aligne la ligne de fuite peinte sur le sol physique du hub.
 */
export const HUB_ROOM_PROFILES = Object.freeze({
  bridge: defineRoomProfile(1.01, 0.820, 184, 76),
  // The table is behind the walking lane; only its tabletop supports a descending actor.
  briefing: defineRoomProfile(1.05, 0.815, 480, 142, 'one-way-top'),
  // Like the briefing table, the CIC console is painted behind the walking
  // lane. Its keyboard surface supports landing, not a side wall: the service
  // duct above otherwise leaves only 60px for a 92px Marine to jump through.
  'combat-information': defineRoomProfile(1.03, 0.820, 168, 70, 'one-way-top'),
  'cryo-bay': defineRoomProfile(1.06, 0.825, 188, 54),
  'crew-quarters': defineRoomProfile(1.06, 0.820, 174, 82),
  mess: defineRoomProfile(1.05, 0.815, 174, 44),
  medical: defineRoomProfile(1.04, 0.825, 184, 44),
  'science-lab': defineRoomProfile(1.03, 0.820, 174, 68),
  quarantine: defineRoomProfile(1.02, 0.830, 150, 104),
  armory: defineRoomProfile(1.05, 0.820, 340, 80),
  workshop: defineRoomProfile(1.04, 0.820, 184, 64),
  'vehicle-bay': defineRoomProfile(1.00, 0.825, 204, 42),
  'dropship-hangar': defineRoomProfile(1.00, 0.825, 204, 42),
  reactor: defineRoomProfile(1.01, 0.830, 136, 116),
  'life-support': defineRoomProfile(1.03, 0.825, 176, 84),
  'sensor-array': defineRoomProfile(1.03, 0.815, 166, 76)
});

export const HUB_DOOR_PROFILES = Object.freeze({
  bulkhead: Object.freeze({ sourceWidth: 195, sourceHeight: 186, renderHeight: 198 }),
  lift: Object.freeze({ sourceWidth: 187, sourceHeight: 191, renderHeight: 216 })
});

export function getHubDoorBounds(door) {
  const profile = HUB_DOOR_PROFILES[door?.lift ? 'lift' : 'bulkhead'];
  const height = profile.renderHeight;
  const width = profile.sourceWidth * (height / profile.sourceHeight);
  return {
    x: Number(door?.x || 0) - width / 2,
    y: FLOOR_Y - height,
    w: width,
    h: height
  };
}
