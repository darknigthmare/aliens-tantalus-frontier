import { resolveHubServiceProfileV137 } from './hub-service-geometry-v137.js';

// These three small platforms had no hatch, station, doorway or onward link.
// Retire their collision and climbing access together; historical V60 data
// remains available for save compatibility and source provenance.
export const HUB_RETIRED_SERVICE_LANDINGS_V138 = Object.freeze([
  Object.freeze({ roomId: 'briefing', platformId: 'briefing-side', ladderId: 'briefing-side-link' }),
  Object.freeze({ roomId: 'combat-information', platformId: 'cic-side', ladderId: 'cic-side-link' }),
  Object.freeze({ roomId: 'crew-quarters', platformId: 'quarters-side', ladderId: 'quarters-side-link' })
]);

// The former medical transfer had only five pixels of deck beyond either
// ladder arrival. A sprint's normal braking could carry an adult off before
// climbing started. Both landings now provide seventy pixels on that side.
export const HUB_MEDICAL_SERVICE_APPROACH_V138 = Object.freeze({
  surfaces: Object.freeze({
    'medical-low': Object.freeze({ x: 160, w: 560 }),
    'medical-high': Object.freeze({ x: 580, w: 370 })
  }),
  ladderId: 'medical-tier', ladderX: 650, minimumArrivalMargin: 70
});

export function resolveHubServiceProfileV138(profile) {
  const resolved = resolveHubServiceProfileV137(profile);
  return { ...resolved,
    platforms: resolved.platforms.filter(surface => !HUB_RETIRED_SERVICE_LANDINGS_V138.some(entry => entry.platformId === surface.id))
      .map(surface => ({ ...surface, ...HUB_MEDICAL_SERVICE_APPROACH_V138.surfaces[surface.id] })),
    ladders: resolved.ladders.filter(ladder => !HUB_RETIRED_SERVICE_LANDINGS_V138.some(entry => entry.ladderId === ladder.id))
      .map(ladder => ladder.id === HUB_MEDICAL_SERVICE_APPROACH_V138.ladderId ? { ...ladder, x: HUB_MEDICAL_SERVICE_APPROACH_V138.ladderX } : ladder)
  };
}
