import { HUB_SHIP_PARENT_LANDINGS_V137 } from './hub-ship-layout-v137.js';

// Fixed service landings leave an adult standing passage beneath every deck.
// These are authored native support heights, shared by render, collision,
// climbing, vent entry/exit and off-screen crew simulation through V51.
export const HUB_SERVICE_STANDARD_V137 = Object.freeze({
  actorHeight: 96.5, standingClearance: 104, floorY: 624, deckThickness: 20
});

export const HUB_SERVICE_SURFACE_HEIGHTS_V137 = Object.freeze({
  'bridge-low': 500, 'bridge-high': 376,
  'briefing-high': 372,
  'cic-high': 370, 'cic-side': 500,
  'cryo-high': 376,
  'quarters-high': HUB_SHIP_PARENT_LANDINGS_V137['sanitary-bay'].bottom,
  'mess-high': 368,
  'medical-low': 500, 'medical-high': 376,
  'lab-high': 374,
  'quarantine-high': 376,
  'armory-high': 366,
  'workshop-high': 376,
  'hangar-observation': 316,
  'reactor-high': 328,
  'life-high': 376,
  'sensor-high': 370
});

/** Preserve the authored horizontal route. A landing's ladders and hatch move
 * with its support, so its picture can never disagree with the live geometry.
 * Caller-owned profile data remains untouched, including historical V60 data. */
export function resolveHubServiceProfileV137(profile) {
  const platforms = profile.platforms.map(surface => ({ ...surface,
    y: HUB_SERVICE_SURFACE_HEIGHTS_V137[surface.id] ?? surface.y
  }));
  const landingFor = (x, y) => profile.platforms.find(surface => Math.abs(surface.y - y) < .001
    && x >= surface.x - 26 && x <= surface.x + surface.w + 26);
  const landingY = (x, y) => {
    const landing = landingFor(x, y);
    return landing ? HUB_SERVICE_SURFACE_HEIGHTS_V137[landing.id] ?? y : y;
  };
  const ladders = profile.ladders.map(ladder => ({ ...ladder,
    top: landingY(ladder.x, ladder.top), bottom: landingY(ladder.x, ladder.bottom)
  }));
  const vents = profile.vents.map(vent => {
    const landing = profile.platforms.find(surface => Math.abs(surface.y - vent.y - vent.h) < .001
      && vent.x < surface.x + surface.w && vent.x + vent.w > surface.x);
    return { ...vent, y: landing ? (HUB_SERVICE_SURFACE_HEIGHTS_V137[landing.id] ?? landing.y) - vent.h : vent.y };
  });
  return { ...profile, platforms, ladders, vents };
}
