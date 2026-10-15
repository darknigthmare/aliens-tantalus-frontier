import { resolveHubServiceProfileV138 } from './hub-service-geometry-v138.js';

/** The laboratory and sensor access bays clear their adult workbenches. Only
 * these two retained ladders move; their supports and all other routes keep
 * their native coordinates. Historical profiles remain immutable. */
export const HUB_LAB_SERVICE_APPROACH_V139 = Object.freeze({
  roomId: 'science-lab', ladderId: 'lab-floor', ladderX: 800, legacyLadderX: 850
});
export const HUB_SENSOR_SERVICE_APPROACH_V139 = Object.freeze({
  roomId: 'sensor-array', ladderId: 'sensor-floor', ladderX: 800, legacyLadderX: 850
});
export const HUB_SERVICE_APPROACHES_V139 = Object.freeze([
  HUB_LAB_SERVICE_APPROACH_V139, HUB_SENSOR_SERVICE_APPROACH_V139
]);

export function resolveHubServiceProfileV139(profile) {
  const previous = resolveHubServiceProfileV138(profile);
  return { ...previous, ladders: previous.ladders.map(ladder => {
    const approach = HUB_SERVICE_APPROACHES_V139.find(entry => entry.ladderId === ladder.id);
    return approach ? { ...ladder, x: approach.ladderX } : ladder;
  }) };
}
