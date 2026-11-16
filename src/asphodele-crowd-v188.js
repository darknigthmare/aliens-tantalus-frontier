// V188 — ambient crowds of the Asphodèle station (bible §42.2, column « PNJ »:
// dockers on the quays, Crucible merchants on the ring and at the market,
// technicians on the control deck, the spoke and in the repair hangar).
// They reuse the hub NPC life of `npc-life-v136.js`: `advanceNpcLifeV136` walks
// each one on its rail with the same speeds, yielding, standing gap and turn
// holds as the Tantalus crew, and `moveNpcAgainstGeometryV136` stops them on
// the floor props. Station doorways follow the rule of `clearRoomDoorwayPostV188`
// (an idle post overlapping a door bay, its 12 px standing gap included, moves to
// the nearest free x inside [96, width − 140]); a patrol rail never crosses a door
// bay, a wall post's reach or the UD-4L airlock (the station's « landing »), so
// the marine always finds every doorway free. Runtime only: nothing is saved.
// Counts, roles and rails are [PROPOSÉ] (bible §7.6); silhouettes are Canvas
// placeholders behind the `asph-npc-*` slots, 1.75 m ≈ 89 px.
import { advanceNpcLifeV136 } from './npc-life-v136.js';
import { getAsphodeleRoomV188, ASPHODELE_FLOOR_Y_V188, ASPHODELE_DOOR_V188, ASPHODELE_STATION_REACH_V188 } from './asphodele-hub-v188.js';

export const ASPHODELE_WORKER_SIZE_V188 = Object.freeze({ w: 44, h: 89 });
export const ASPHODELE_CROWD_GAP_V188 = 12; // NPC_STANDING_GAP of npc-life-v136.js
const ROLE_SLOT = Object.freeze({ docker: 'asph-npc-docker', merchant: 'asph-npc-merchant', technician: 'asph-npc-technician' });
export const asphodeleWorkerSlotV188 = role => ROLE_SLOT[role] || ROLE_SLOT.technician;

// home: centre x wanted; z: depth lane (V2 rooms only; −80 = front, 0 = wall rail); mobile: walks its rail.
const npc = (id, role, home, extra = {}) => Object.freeze({ id, role, home, z: 0, mobile: true, ...extra });
export const ASPHODELE_CROWD_ROSTER_V188 = Object.freeze({
  'asph-docks': Object.freeze([
    npc('docker-a', 'docker', 360, { z: -30 }), npc('docker-b', 'docker', 820, { z: -66 }),
    npc('docker-c', 'docker', 1250, { z: -40 }), npc('docker-d', 'docker', 1720, { z: -26, mobile: false })
  ]),
  'asph-ring': Object.freeze([
    npc('merchant-a', 'merchant', 380, { z: -44, crucible: true }), npc('merchant-b', 'merchant', 1240, { z: -30, crucible: true }),
    npc('technician-a', 'technician', 1700, { z: -62 }), npc('technician-b', 'technician', 2200, { z: -36, mobile: false })
  ]),
  'asph-spoke': Object.freeze([npc('technician-c', 'technician', 980, { z: -40 })]),
  'asph-control': Object.freeze([npc('technician-d', 'technician', 600, { mobile: false }), npc('technician-e', 'technician', 1000)]),
  'asph-market': Object.freeze([npc('merchant-c', 'merchant', 460, { mobile: false, crucible: true }), npc('merchant-d', 'merchant', 1000, { crucible: true })]),
  'asph-repair': Object.freeze([npc('technician-f', 'technician', 560, { z: -30 }), npc('technician-g', 'technician', 1060, { z: -24, mobile: false })])
});

/** Bays a worker must leave free in a station room: doors (and the airlock), and the reach of every wall post. */
export function asphodeleRoomBaysV188(room) {
  if (!room) return [];
  const half = ASPHODELE_DOOR_V188.w / 2;
  return [...room.doors.map(entry => ({ id: entry.id, kind: entry.shuttle ? 'landing' : 'door', x0: entry.x - half, x1: entry.x + half })),
    ...room.posts.filter(entry => !entry.npc).map(entry => ({ id: entry.id, kind: 'post', x0: entry.x - ASPHODELE_STATION_REACH_V188 + 22, x1: entry.x + ASPHODELE_STATION_REACH_V188 - 22 }))];
}
const blockedBy = (bays, x, width) => bays.some(box => x < box.x1 + ASPHODELE_CROWD_GAP_V188 && x + width > box.x0 - ASPHODELE_CROWD_GAP_V188);
/** Station form of clearRoomDoorwayPostV188: x is the worker's left edge. */
export function clearStationDoorwayPostV188(room, x, width = ASPHODELE_WORKER_SIZE_V188.w) {
  if (!room || !Number.isFinite(x)) return x;
  const bays = asphodeleRoomBaysV188(room), low = 96, high = room.width - 140;
  if (!blockedBy(bays, x, width) && x >= low && x <= high) return x;
  const candidates = [x, ...bays.flatMap(box => [box.x0 - ASPHODELE_CROWD_GAP_V188 - width - 1, box.x1 + ASPHODELE_CROWD_GAP_V188 + 1])]
    .filter(value => value >= low && value <= high && !blockedBy(bays, value, width))
    .sort((a, b) => Math.abs(a - x) - Math.abs(b - x));
  return candidates[0] ?? x;
}
/** Props whose depth footprint covers a worker's lane, as colliders in the format of npc-life-v136. */
function laneColliders(room, z) {
  if (room.kind !== 'depth') return [];
  return room.props.filter(entry => z >= entry.footprint.z0 - 6 && z <= entry.footprint.z1 + 6)
    .map(entry => ({ x: entry.footprint.x0 - 4, y: 0, w: entry.footprint.x1 - entry.footprint.x0 + 8, h: 2000 }));
}
/** The rail [min, max] of a worker: from its cleared post, out to the nearest bay or lane prop, 260 px at most each way. */
function railFor(room, x, width, z) {
  const bays = asphodeleRoomBaysV188(room), props = laneColliders(room, z).map(box => ({ x0: box.x, x1: box.x + box.w }));
  const stops = [...bays, ...props], low = 96, high = room.width - 140;
  let min = x, max = x;
  while (min - 4 >= Math.max(low, x - 260) && !stops.some(box => min - 4 < box.x1 + ASPHODELE_CROWD_GAP_V188 && min - 4 + width > box.x0 - ASPHODELE_CROWD_GAP_V188)) min -= 4;
  while (max + 4 <= Math.min(high, x + 260) && !stops.some(box => max + 4 < box.x1 + ASPHODELE_CROWD_GAP_V188 && max + 4 + width > box.x0 - ASPHODELE_CROWD_GAP_V188)) max += 4;
  return { min, max };
}

/** Runtime crowd of a room for the current save view, or [] (Crucible merchants leave if Grue's crew was expelled). */
export function createAsphodeleCrowdV188(roomId, view = null) {
  const room = getAsphodeleRoomV188(roomId), roster = ASPHODELE_CROWD_ROSTER_V188[roomId];
  if (!room || !roster) return [];
  const expelled = view?.asphodeleHubV188?.grue === 'expel', { w, h } = ASPHODELE_WORKER_SIZE_V188;
  const placed = [];
  for (const entry of roster) {
    if (entry.crucible && expelled) continue;
    const z = room.kind === 'depth' ? entry.z : 0;
    let x = clearStationDoorwayPostV188(room, Math.round(entry.home - w / 2), w);
    // Same-lane peers keep the standing gap from the start (spreadNpcStationSpawnsV136 rule).
    while (placed.some(peer => Math.abs(peer.z - z) < 12 && x < peer.x + w + 14 && x + w + 14 > peer.x)) x = clearStationDoorwayPostV188(room, x + 58, w);
    const rail = entry.mobile ? railFor(room, x, w, z) : { min: x, max: x };
    placed.push({ id: `asph-${entry.id}`, role: entry.role, slot: asphodeleWorkerSlotV188(entry.role), roomId: room.id,
      x, y: ASPHODELE_FLOOR_Y_V188 - h, w, h, z, mobile: entry.mobile && rail.max - rail.min > 8, min: rail.min, max: rail.max,
      routinePhaseV62: entry.mobile ? 'patrol' : 'work', lifeV136: null, alive: true });
  }
  return placed;
}

/** Advances every worker with the hub NPC life (lane peers only, props of the lane as colliders). */
export function stepAsphodeleCrowdV188(crowd, delta, { reducedMotion = false, suspended = false } = {}) {
  if (!Array.isArray(crowd) || !crowd.length) return crowd;
  const room = getAsphodeleRoomV188(crowd[0].roomId);
  for (const actor of crowd) {
    const peers = crowd.filter(peer => peer !== actor && Math.abs(peer.z - actor.z) < 12);
    const state = advanceNpcLifeV136(actor.lifeV136, actor, delta, { colliders: laneColliders(room, actor.z), room: null, peers,
      context: `asphodele:${actor.roomId}`, reducedMotion, suspended });
    if (!state) continue;
    actor.lifeV136 = state; actor.x = state.x; actor.facing = state.facing;
  }
  return crowd;
}

/** True when no worker stands in a door bay or on the airlock (the invariant the tests and QA check). */
export function asphodeleCrowdClearsDoorwaysV188(room, crowd) {
  const bays = asphodeleRoomBaysV188(room).filter(box => box.kind !== 'post');
  return (crowd || []).every(actor => !bays.some(box => actor.x < box.x1 + ASPHODELE_CROWD_GAP_V188 && actor.x + actor.w > box.x0 - ASPHODELE_CROWD_GAP_V188));
}
