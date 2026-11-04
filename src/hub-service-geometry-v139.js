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

// Keep the full rear-wall door faces clear of real steel and collision.
// Only the named low landings and their floor ladders move; upper supports,
// tier ladders, vents, door sockets and historical profiles retain their data.
export const HUB_SERVICE_DOOR_BAYS_V182 = Object.freeze([
  Object.freeze({ roomId:'briefing', annexId:'mire-archives', platformId:'briefing-low',
    surface:Object.freeze({x:400,w:360}), ladderId:'briefing-floor', ladderX:625, legacyLadderX:330 }),
  Object.freeze({ roomId:'cryo-bay', annexId:'escape-pods', platformId:'cryo-low',
    surface:Object.freeze({x:460,w:250}), ladderId:'cryo-floor', ladderX:500, legacyLadderX:260 }),
  Object.freeze({ roomId:'medical', annexId:'morgue', platformId:'medical-low',
    surface:Object.freeze({x:440,w:280}), ladderId:'medical-floor', ladderX:480, legacyLadderX:260 }),
  Object.freeze({ roomId:'quarantine', annexId:'bioforge', platformId:'quarantine-low',
    surface:Object.freeze({x:420,w:340}), ladderId:'quarantine-floor', ladderX:670, legacyLadderX:220 })
]);

export function resolveHubServiceProfileV139(profile) {
  const previous = resolveHubServiceProfileV138(profile);
  return { ...previous,
    platforms: previous.platforms.map(surface => {
      const bay = surface.id === HUB_WORKSHOP_DOOR_BAY_V178.platformId ? HUB_WORKSHOP_DOOR_BAY_V178
        : HUB_SERVICE_DOOR_BAYS_V182.find(entry => entry.platformId === surface.id);
      return bay ? { ...surface, ...bay.surface } : surface;
    }),
    ladders: previous.ladders.map(ladder => {
    const approach = HUB_SERVICE_APPROACHES_V139.find(entry => entry.ladderId === ladder.id)
      || HUB_SERVICE_DOOR_BAYS_V182.find(entry => entry.ladderId === ladder.id);
    return approach ? { ...ladder, x: approach.ladderX } : ladder;
  }) };
}
