import { HUB_NPC_ROSTER } from './hub-v52-runtime.js';
import { HUB_ANNEX_BY_ID_V137 } from './hub-annex-registry-v137.js';
import { getHubShipConnectionsForSpaceV137 } from './hub-ship-layout-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from './hub-annex-runtime-geometry-v139.js';
import { getHubAnnexFixturePlanV138 } from './hub-annex-fixtures-v138.js';
import { getHubRoomLifePlanV136 } from './hub-room-life-v136.js';
import { getHubFurnishingPlacementBoundsV139 } from './hub-furnishing-contact-v139.js';
import { resolveHumanAtlasGeometryV133 } from './human-visual-contract-v133.js';
import { resolveSpriteSheet } from './sprite-animation-runtime.js';
import { getShipPortVisitorFixtureBoundsV142 } from './ship-port-room-v87.js';
import { SHIP_ANIMAL_HABITATS_V87, getShipAnimalFittingPlaqueBoundsV142 } from './ship-animal-habitat-v87.js';
import { SHIP_ANIMAL_ENCLOSURE_PLACEMENTS_V87 } from './ship-animal-enclosure-art-v87.js';
import { SHIP_ANIMAL_TERRARIUM_PLACEMENT_V87 } from './ship-animal-terrarium-art-v87.js';

/** Original duty watches remain the default between scheduled inspection
 * rounds. Every assignment uses a real crew identity and its native dialogue. */
export const HUB_ANNEX_NPC_DUTIES_V141 = Object.freeze([
  { roomId: 'flight-control-cockpit', crewId: 'crew-08-maksim-orlov', targetX: 710, duty: 'flight-watch' },
  { roomId: 'engine-room', crewId: 'crew-03-idris-kwan', targetX: 1500, duty: 'mechanical-inspection' },
  { roomId: 'maintenance-spine', crewId: 'crew-11-jun-park', targetX: 1470, duty: 'service-round' },
  { roomId: 'maintenance-spine', crewId: 'crew-13-pablo-reyes', targetX: 1470, duty: 'isolation-check' },
  { roomId: 'morgue', crewId: 'crew-04-noor-okafor', targetX: 975, duty: 'forensic-care' },
  { roomId: 'morgue', crewId: 'crew-09-inez-harlow', targetX: 1200, duty: 'specimen-identification' }
].map(Object.freeze));

/** Visits replace a person's ordinary watch; they never add a second actor.
 * The two 08:00/16:00 watches retain the reviewed V141 six-person cohort.
 * Existing rest, travel, alerts, medical recovery and missions still take
 * precedence over all annex work. Hours belong to the campaign clock. */
export const HUB_ANNEX_NPC_ROTATIONS_V156 = Object.freeze([
  { roomId: 'logistics', crewId: 'crew-16-cal-mercer', targetX: 1000, duty: 'freight-handling-inspection', fromHour: 9, toHour: 10.5 },
  { roomId: 'synthetic-bay', crewId: 'crew-05-bishop-9', targetX: 960, duty: 'synthetic-diagnostics', fromHour: 9, toHour: 10.5 },
  { roomId: 'cctv', crewId: 'crew-06-rook', targetX: 480, duty: 'camera-watch-review', fromHour: 9, toHour: 10.5 },
  { roomId: 'proving-ground', crewId: 'crew-02-tamsin-velez', targetX: 850, duty: 'range-safety-inspection', fromHour: 9, toHour: 10.5 },
  { roomId: 'escape-pods', crewId: 'crew-14-echo-a', targetX: 1220, duty: 'evacuation-readiness', fromHour: 9, toHour: 10.5 },
  { roomId: 'arrival-airlock', crewId: 'crew-08-maksim-orlov', targetX: 1220, duty: 'arrival-flight-safety', fromHour: 10.5, toHour: 12 },
  { roomId: 'mire-archives', crewId: 'crew-01-mara-vega', targetX: 1360, duty: 'command-record-review', fromHour: 10.5, toHour: 12 },
  { roomId: 'durandal', crewId: 'crew-10-david-8r', targetX: 1020, duty: 'computer-diagnostic-review', fromHour: 10.5, toHour: 12 },
  { roomId: 'bioforge', crewId: 'crew-09-inez-harlow', targetX: 1205, duty: 'isolated-specimen-review', fromHour: 10.5, toHour: 12 },
  { roomId: 'water-recycling', crewId: 'crew-11-jun-park', targetX: 700, duty: 'water-treatment-inspection', fromHour: 10.5, toHour: 12 },
  { roomId: 'galley-service', crewId: 'crew-15-leila-s-rensen', targetX: 420, duty: 'ration-and-galley-review', fromHour: 17, toHour: 19 },
  { roomId: 'sanitary-bay', crewId: 'crew-11-jun-park', targetX: 1014, duty: 'sanitary-water-fixture-inspection', fromHour: 17, toHour: 19 },
  { roomId: 'personal-refuge', crewId: 'crew-12-asha-mbaye', targetX: 960, duty: 'habitat-welfare-visit', fromHour: 17, toHour: 19 },
  { roomId: 'frontier-civil-counter', crewId: 'crew-09-inez-harlow', targetX: 694, duty: 'civil-arrival-biosafety', fromHour: 19, toHour: 21 }
].map(Object.freeze));

/** All installation states are reserved. The habitat has no free adult post
 * between its real berths, plaques and pens: leave that level-design issue
 * explicit instead of placing a specialist inside an enclosure. */
export const HUB_ANNEX_NPC_DEFERRED_V156 = Object.freeze([
  Object.freeze({ roomId: 'animal-care', reason: 'no-clear-adult-duty-post',
    requiredWork: 'reserve-a-human-service-post-clear-of-berths-plaques-and-enclosures' })
]);
const profileById = new Map(HUB_NPC_ROSTER.map((profile, sheet) => [profile.crewId, { ...profile, sheet }]));
const overlapY = (a, b) => a.y < b.y + b.h && a.y + a.h > b.y;
const valid = b => b && ['x', 'y', 'w', 'h'].every(key => Number.isFinite(b[key])) && b.w > 0 && b.h > 0;
const cache = new Map();

export function annexNpcDutiesV141(resolutions, { editorPlaytest = false, forgeSessionV141 = null, annexNpcSandboxV141 = false } = {}) {
  if (editorPlaytest || forgeSessionV141 || annexNpcSandboxV141 || !(resolutions instanceof Map)) return [];
  const selected = new Map(HUB_ANNEX_NPC_DUTIES_V141.map(duty => [duty.crewId, duty]));
  for (const duty of HUB_ANNEX_NPC_ROTATIONS_V156) {
    const hour = resolutions.get(duty.crewId)?.hour;
    if (Number.isFinite(hour) && hour >= duty.fromHour && hour < duty.toHour) selected.set(duty.crewId, duty);
  }
  return [...selected.values()].filter(duty => {
    const routine = resolutions.get(duty.crewId);
    return routine?.phase === 'work' && routine.reason === 'daily-schedule'
      && !routine.alert && !routine.missionAssigned && !routine.needsCare;
  });
}

/** Reserve actual rendered equipment, return approaches and complete climbing
 * lanes. The body and every idle/walk/work silhouette must fit the whole rail;
 * props do not become new physics or move to make room for a person. */
export function getAnnexNpcPlacementV141(roomId, crewId) {
  const key = `${roomId}:${crewId}`;
  if (cache.has(key)) return cache.get(key);
  const source = HUB_ANNEX_BY_ID_V137[roomId], member = profileById.get(crewId);
  if (!source || !member) return null;
  const annex = getHubAnnexRuntimeGeometryV139(source), room = { ...annex, xStart: 0, xEnd: annex.world.width };
  // The loadmaster reviews manifests from the actual reachable cargo catwalk.
  // Its support is physical; a decorative table or station is never a floor.
  const support = roomId === 'logistics' && crewId === 'crew-16-cal-mercer'
    ? annex.platforms.find(platform => platform.id === 'logistics-catwalk' && platform.role === 'catwalk')
    : annex.platforms.find(platform => platform.role === 'floor' && platform.y === annex.world.floorY);
  if (!support) return null;
  const floorY = support.y, actor = { x: 0, y: floorY - 92, w: 44, h: 92 };
  const sheet = resolveSpriteSheet(member.spriteId), silhouettes = [];
  for (const facing of [-1, 1]) for (let frame = 0; frame < 12; frame++) {
    const geometry = resolveHumanAtlasGeometryV133({ actor: { ...actor, facing }, sheet,
      column: frame % 4, row: Math.floor(frame / 4), surface: 'hub' });
    if (!geometry) return null;
    silhouettes.push(geometry.visible);
  }
  const left = Math.min(0, ...silhouettes.map(b => b.x)), right = Math.max(44, ...silhouettes.map(b => b.x + b.width));
  const top = Math.min(actor.y, ...silhouettes.map(b => b.y));
  const hull = { x: left, y: top, w: right - left, h: floorY - top };
  const life = getHubRoomLifePlanV136(room), fixture = getHubAnnexFixturePlanV138(room);
  const reservations = [];
  const add = (bounds, role, margin = 12) => { if (valid(bounds)) reservations.push({ ...bounds, role, margin }); };
  for (const b of annex.props || []) add(b, 'prop');
  for (const b of annex.colliders || []) add(b, 'collider');
  add(annex.station?.bounds, 'station', 24);
  for (const b of fixture?.reservations || []) add(b, b.role);
  for (const entry of life?.items || []) add(getHubFurnishingPlacementBoundsV139(entry), 'furnishing');
  for (const entry of life?.workstationDetailsV139?.items || []) add(entry.target, 'workstation-detail');
  for (const bounds of life?.spatial?.reservations || []) {
    if (bounds.role === 'native-deck-console' && bounds.polygon?.length === 3) {
      // The composition rectangle includes air beside the triangular brace.
      // Reserve its two actually painted pieces, including the lower fixing,
      // instead of pretending that the empty lower corner is a solid beam.
      const [[left, top], [right], [, bottom]] = bounds.polygon;
      add({ x: left, y: top, w: right - left, h: bottom - top }, 'native-deck-console-triangle');
      add({ x: left - 3, y: bottom - 14, w: 10, h: 17 }, 'native-deck-console-fastener');
    } else if (bounds.role.startsWith('native-deck-') || bounds.role.startsWith('native-structural-')) add(bounds, bounds.role);
  }
  if (roomId === 'frontier-civil-counter') {
    // These are the exact painted visitor envelopes, without the composition
    // audit's additional 8px padding. Six further pixels on each side leave a
    // safe fixed inspection post beside the existing vendor and terrarium.
    for (const bounds of getShipPortVisitorFixtureBoundsV142()) add(bounds, bounds.role, 6);
  }
  if (roomId === 'animal-care') {
    for (const habitat of SHIP_ANIMAL_HABITATS_V87) add(getShipAnimalFittingPlaqueBoundsV142(habitat), 'habitat-fitting-plaque');
    for (const { bounds } of SHIP_ANIMAL_ENCLOSURE_PLACEMENTS_V87) add(bounds, 'installed-habitat-fixture');
    add(SHIP_ANIMAL_TERRARIUM_PLACEMENT_V87.bounds, 'installed-habitat-fixture');
  }
  for (const b of getHubShipConnectionsForSpaceV137(roomId)) add(b.annexDoorBounds, 'return-approach', 72);
  add({ x: annex.entranceLocalX - annex.entrance.w / 2, y: annex.entrance.y,
    w: annex.entrance.w, h: annex.entrance.h }, 'return-approach', 72);
  for (const b of annex.ladders || []) add({ x: b.x - 28, y: b.top - 92, w: b.w + 56, h: b.bottom - b.top + 92 }, 'ladder-approach', 24);
  for (const b of annex.vents || []) add(b, 'vent-approach', 64);
  let rails = [{ min: Math.max(128, support.x + (support.role === 'floor' ? 0 : 12)) - left,
    max: Math.min(annex.world.width - 128, support.x + support.w - (support.role === 'floor' ? 0 : 12)) - right }];
  for (const b of reservations.filter(b => overlapY(hull, b))) {
    const low = b.x - b.margin - right, high = b.x + b.w + b.margin - left;
    rails = rails.flatMap(rail => high <= rail.min || low >= rail.max ? [rail]
      : [{ min: rail.min, max: Math.min(rail.max, low) }, { min: Math.max(rail.min, high), max: rail.max }].filter(r => r.max >= r.min));
  }
  const result = { schema: 141, roomId, crewId, floorY, support: { ...support }, hull, reservations, rails };
  cache.set(key, result); return result;
}

export function createAnnexNpcsV141(duties, resolutions) {
  const cohort = [];
  for (const duty of duties) {
    const member = profileById.get(duty.crewId), plan = getAnnexNpcPlacementV141(duty.roomId, duty.crewId);
    const rail = plan?.rails.toSorted((a, b) => {
      const score = r => Math.abs((r.min + r.max) / 2 - duty.targetX) - Math.min(240, r.max - r.min) / 2;
      return score(a) - score(b);
    })[0];
    if (!member || !rail) continue;
    const mobile = rail.max - rail.min >= 70;
    const middle = mobile ? Math.max(rail.min + 35, Math.min(rail.max - 35, duty.targetX)) : (rail.min + rail.max) / 2;
    const min = mobile ? Math.max(rail.min, middle - 110) : middle, max = mobile ? Math.min(rail.max, middle + 110) : middle;
    const peers = cohort.filter(n => n.roomId === duty.roomId && Math.abs(n.min - min) < 60);
    const x = peers.length ? max : min, direction = peers.length ? -1 : 1;
    if (cohort.some(n => n.roomId === duty.roomId && Math.abs(n.x - x) < 56)) continue;
    cohort.push({ ...member, id: `hub-npc-${duty.crewId}`, roomId: duty.roomId,
      annexNativeV141: true, annexDutyV141: duty.duty, annexSupportIdV156: plan.support.id, routinePhaseV62: 'work',
      routineDeterministicKeyV62: resolutions.get(duty.crewId)?.deterministicKey || '',
      x, y: plan.floorY - 92, w: 44, h: 92, min, max, vx: 0, facing: direction,
      patrolSpeed: direction * 27, resumeVx: direction * 27, mobile, alive: true,
      workClock: 0, alertClock: 0, supportClock: 0, alerted: false });
  }
  return cohort;
}
