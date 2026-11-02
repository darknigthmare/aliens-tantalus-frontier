import { resolveHubServiceProfileV138 } from './hub-service-geometry-v138.js';

/** Native approach corrections are applied once before both collision and
 * rendering consume the service profile. Historical profiles stay immutable. */
export const HUB_LAB_SERVICE_APPROACH_V139 = Object.freeze({
  roomId: 'science-lab', ladderId: 'lab-floor', ladderX: 800, legacyLadderX: 850
});
export const HUB_SENSOR_SERVICE_APPROACH_V139 = Object.freeze({
  roomId: 'sensor-array', ladderId: 'sensor-floor', ladderX: 800, legacyLadderX: 850
});
// The former low deck crossed DURANDAL's rear-wall door. Move the complete
// physical landing and its floor ladder into the free service bay instead
// of painting a gap over an invisible support. The upper deck, tier ladder,
// hatch, door socket and both paired door faces keep their native geometry.
export const HUB_WORKSHOP_DOOR_BAY_V178 = Object.freeze({
  roomId: 'workshop', platformId: 'workshop-low',
  surface: Object.freeze({ x: 480, w: 280 }),
  ladderId: 'workshop-floor', ladderX: 520, legacyLadderX: 250,
  minimumLandingMargin: 40
});
export const HUB_SERVICE_APPROACHES_V139 = Object.freeze([
  HUB_LAB_SERVICE_APPROACH_V139, HUB_SENSOR_SERVICE_APPROACH_V139, HUB_WORKSHOP_DOOR_BAY_V178
]);

export function resolveHubServiceProfileV139(profile) {
  const previous = resolveHubServiceProfileV138(profile);
  return { ...previous,
    platforms: previous.platforms.map(surface => surface.id === HUB_WORKSHOP_DOOR_BAY_V178.platformId
      ? { ...surface, ...HUB_WORKSHOP_DOOR_BAY_V178.surface } : surface),
    ladders: previous.ladders.map(ladder => {
    const approach = HUB_SERVICE_APPROACHES_V139.find(entry => entry.ladderId === ladder.id);
    return approach ? { ...ladder, x: approach.ladderX } : ladder;
  }) };
}
