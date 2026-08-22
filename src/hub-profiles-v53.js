const ROOM_WIDTH = 1280;
const FLOOR_Y = 624;

const defineRoomProfile = (sceneScale, floorRatio, colliderWidth, colliderHeight) => Object.freeze({
  worldWidth: ROOM_WIDTH,
  sceneScale,
  floorRatio,
  authoredCollision: true,
  propCollider: Object.freeze({ width: colliderWidth, height: colliderHeight })
});

/**
 * Contrat de proportion des seize scènes peintes. Les petits locaux sont
 * rapprochés; les volumes de hangar restent à l’échelle de base. Le ratio de
 * sol aligne la ligne de fuite peinte sur le sol physique du hub.
 */
export const HUB_ROOM_PROFILES = Object.freeze({
  bridge: defineRoomProfile(1.01, 0.820, 184, 76),
  briefing: defineRoomProfile(1.05, 0.815, 176, 48),
  'combat-information': defineRoomProfile(1.03, 0.820, 168, 70),
  'cryo-bay': defineRoomProfile(1.06, 0.825, 188, 54),
  'crew-quarters': defineRoomProfile(1.06, 0.820, 174, 82),
  mess: defineRoomProfile(1.05, 0.815, 174, 44),
  medical: defineRoomProfile(1.04, 0.825, 184, 44),
  'science-lab': defineRoomProfile(1.03, 0.820, 174, 68),
  quarantine: defineRoomProfile(1.02, 0.830, 150, 104),
  armory: defineRoomProfile(1.05, 0.820, 174, 82),
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
