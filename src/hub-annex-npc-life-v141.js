import { HUB_NPC_ROSTER } from './hub-v52-runtime.js';
import { HUB_ANNEX_BY_ID_V137 } from './hub-annex-registry-v137.js';
import { getHubShipConnectionsForSpaceV137 } from './hub-ship-layout-v137.js';
import { getHubAnnexRuntimeGeometryV139 } from './hub-annex-runtime-geometry-v139.js';
import { getHubAnnexFixturePlanV138 } from './hub-annex-fixtures-v138.js';
import { getHubRoomLifePlanV136 } from './hub-room-life-v136.js';
import { getHubFurnishingPlacementBoundsV139 } from './hub-furnishing-contact-v139.js';
import { resolveHumanAtlasGeometryV133 } from './human-visual-contract-v133.js';
import { resolveSpriteSheet } from './sprite-animation-runtime.js';

/** First reviewed annex duty cohort. These are the actual named crew, with
 * their shipped art and conversations, rather than additional copies. Other
 * annexes deliberately retain their existing population policy. */
export const HUB_ANNEX_NPC_DUTIES_V141 = Object.freeze([
  { roomId: 'flight-control-cockpit', crewId: 'crew-08-maksim-orlov', targetX: 710, duty: 'flight-watch' },
  { roomId: 'engine-room', crewId: 'crew-03-idris-kwan', targetX: 1500, duty: 'mechanical-inspection' },
  { roomId: 'maintenance-spine', crewId: 'crew-11-jun-park', targetX: 1470, duty: 'service-round' },
  { roomId: 'maintenance-spine', crewId: 'crew-13-pablo-reyes', targetX: 1470, duty: 'isolation-check' },
  { roomId: 'morgue', crewId: 'crew-04-noor-okafor', targetX: 975, duty: 'forensic-care' },
  { roomId: 'morgue', crewId: 'crew-09-inez-harlow', targetX: 1200, duty: 'specimen-identification' }
].map(Object.freeze));
const profileById = new Map(HUB_NPC_ROSTER.map((profile, sheet) => [profile.crewId, { ...profile, sheet }]));
const overlapY = (a, b) => a.y < b.y + b.h && a.y + a.h > b.y;
const valid = b => b && ['x', 'y', 'w', 'h'].every(key => Number.isFinite(b[key])) && b.w > 0 && b.h > 0;
const cache = new Map();

export function annexNpcDutiesV141(resolutions, { editorPlaytest = false, forgeSessionV141 = null, annexNpcSandboxV141 = false } = {}) {
  if (editorPlaytest || forgeSessionV141 || annexNpcSandboxV141 || !(resolutions instanceof Map)) return [];
  return HUB_ANNEX_NPC_DUTIES_V141.filter(duty => {
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
  const floorY = annex.world.floorY, actor = { x: 0, y: floorY - 92, w: 44, h: 92 };
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
  for (const b of getHubShipConnectionsForSpaceV137(roomId)) add(b.annexDoorBounds, 'return-approach', 72);
  add({ x: annex.entranceLocalX - annex.entrance.w / 2, y: annex.entrance.y,
    w: annex.entrance.w, h: annex.entrance.h }, 'return-approach', 72);
  for (const b of annex.ladders || []) add({ x: b.x - 28, y: b.top - 92, w: b.w + 56, h: b.bottom - b.top + 92 }, 'ladder-approach', 24);
  for (const b of annex.vents || []) add(b, 'vent-approach', 64);
  let rails = [{ min: 128 - left, max: annex.world.width - 128 - right }];
  for (const b of reservations.filter(b => overlapY(hull, b))) {
    const low = b.x - b.margin - right, high = b.x + b.w + b.margin - left;
    rails = rails.flatMap(rail => high <= rail.min || low >= rail.max ? [rail]
      : [{ min: rail.min, max: Math.min(rail.max, low) }, { min: Math.max(rail.min, high), max: rail.max }].filter(r => r.max >= r.min));
  }
  const result = { schema: 141, roomId, crewId, floorY, hull, reservations, rails };
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
      annexNativeV141: true, annexDutyV141: duty.duty, routinePhaseV62: 'work',
      routineDeterministicKeyV62: resolutions.get(duty.crewId)?.deterministicKey || '',
      x, y: plan.floorY - 92, w: 44, h: 92, min, max, vx: 0, facing: direction,
      patrolSpeed: direction * 27, resumeVx: direction * 27, mobile, alive: true,
      workClock: 0, alertClock: 0, supportClock: 0, alerted: false });
  }
  return cohort;
}
