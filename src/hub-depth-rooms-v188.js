// V188 — hybrid 2D / 2.5D rooms (specs/001-salles-hybrides-2d-25d). Pure rules.
//
// A "depth" room adds one coordinate, z, to the actors standing on its floor.
// z = 0 is the existing walk rail along the back wall (doors, ladders, wall
// stations stay there); negative z comes towards the camera, over the floor
// band the hub already draws in perspective below the rail (V116). The rail
// physics (x, y, gravity, platforms, saves of x/y) are unchanged: z is checked
// against floor footprints, filters interactions and moves the drawing down by
// |z| px. Sprites are never scaled (owner decision, 2026-11-13).

export const HUB_FLOOR_Y_V188 = 624;

const footprint = (id, x0, x1, z0, z1) => Object.freeze({ id, x0, x1, z0, z1 });
const prop = (id, kind, x, w, h, z, z0, z1) => Object.freeze({ id, kind, x, w, h, z, footprint: footprint(id, x, x + w, z0, z1) });

export const HUB_DEPTH_ROOMS_V188 = Object.freeze({
  'dropship-hangar': Object.freeze({
    roomId: 'dropship-hangar', deck: 3, x0: 0, x1: 1280,
    zMin: -80, zMax: 0, doorBand: 20, interactBand: 24,
    // Approach from the reactor (x grows to the right): the room is announced before its bulkhead.
    announceFrom: 1280, announceTo: 1480,
    speed: 150,
    // The UD-4L stands 30 px in front of the wall: a narrow lane behind it along the wall, the open floor in front.
    // Its footprint covers the skids and the low hull; tail (x < 300) and nose (x > 780) can be walked under.
    dropship: Object.freeze({ actorId: 'dropship-hangar-ud4l', z: -30, footprint: footprint('dropship-hangar-ud4l', 300, 780, -40, -20), interactZ: -50 }),
    // Sizes at 1 m ≈ 51 px (src/hub-prologue-rooms-v188.js): a cargo crate is at most 1.2 m (61 px),
    // the fuel/ordnance cart 1.5 × 0.8 m. Nothing stands in the rail band (z > −20) nor in front of a door.
    props: Object.freeze([
      prop('crates-west', 'crate', 236, 61, 58, -72, -90, -62), // its footprint reaches past the front edge: no squeezing in front of it
      prop('cart-east', 'cart', 852, 76, 40, -28, -36, -20), // by the UD-4L nose and its fuel line, clear of the arrival airlock
      prop('crates-east', 'crate', 1160, 61, 58, -60, -70, -50) // between the airlock and the bulkhead
    ]),
    // Crew lanes: in front of the UD-4L while beside it, back on the rail elsewhere.
    npcLane: Object.freeze({ x0: 150, x1: 880, z: -52 }),
    npcDepths: Object.freeze({ 'crew-08-maksim-orlov': -48 })
  })
});
export const HUB_DEPTH_ROOM_IDS_V188 = Object.freeze(Object.keys(HUB_DEPTH_ROOMS_V188));

// The quay of Port-Méridien (P-3, its own ground location, not a hub deck): second depth room.
// Posts, consoles, the ladder and the airlock gate stay against the back wall (z = 0).
// The freight crate of the ramp leaves the wall: it can be walked around in front.
export const PORT_DEPTH_ROOM_V188 = Object.freeze({
  roomId: 'port-meridien-quay', deck: null, x0: 0, x1: 2560,
  zMin: -80, zMax: 0, doorBand: 20, interactBand: 24, speed: 150,
  // The ramp's freight crate keeps its rail collider (jumpable) only while the marine is close to the wall.
  railCrate: Object.freeze({ x: 420, w: 100, depth: -34 }),
  dropship: null,
  // Sizes at 1 m ≈ 51 px (coherence pass): a 10 ft ISO container 2.99 × 2.59 m, three 0.9 m drums
  // (0.55 m wide each), one 1.2 m pallet. Every prop leaves a lane of at least 20 depth units
  // (the hangar's own lane width) behind it, along the wall, where the escort walks.
  props: Object.freeze([
    prop('port-rail-crate', 'rail-crate', 420, 100, 50, -2, -34, 1),
    prop('port-containers', 'iso-container', 1010, 153, 132, -62, -90, -46), // reaches past the front edge
    prop('port-drums', 'drum', 1520, 96, 52, -50, -60, -40), // lanes of 20 in front, 40 behind
    prop('port-pallet', 'crate', 2400, 61, 44, -30, -40, -20) // past the report post, off the escort's path
  ]),
  npcLane: Object.freeze({ x0: 0, x1: 0, z: 0 }), npcDepths: Object.freeze({})
});
/** Nearest free depth when an actor driven along x ends up inside a footprint (civilians, crew). */
export function freeDepthV188(room, x, z, halfWidth = 0) {
  for (const entry of depthFootprintsV188(room)) {
    if (!(x + halfWidth > entry.x0 && x - halfWidth < entry.x1 && z > entry.z0 && z < entry.z1)) continue;
    const towardWall = entry.z1 <= room.zMax ? entry.z1 : null, towardCamera = entry.z0 >= room.zMin ? entry.z0 : null;
    if (towardWall === null) return towardCamera ?? z;
    if (towardCamera === null) return towardWall;
    return Math.abs(z - towardWall) <= Math.abs(z - towardCamera) ? towardWall : towardCamera;
  }
  return z;
}
/** Civilians follow the escorting marine in depth, a step behind, each in their own file. */
export function civilianDepthTargetV188(playerZ, index) {
  return Math.max(-80, Math.min(0, (Number(playerZ) || 0) + 6 + index * 5));
}

export function hubDepthRoomAtV188(deck, x) {
  for (const room of Object.values(HUB_DEPTH_ROOMS_V188)) if (room.deck === deck && x >= room.x0 && x < room.x1) return room;
  return null;
}

/** Screen offset of an actor's feet: z < 0 comes down towards the camera. */
export const depthToScreenOffsetV188 = z => 0 - (Number(z) || 0);

/** Light falloff: the floor nearest the wall is slightly darker than the front (≤ 0.22). */
export function depthShadeV188(room, z) {
  if (!room) return 0;
  const span = room.zMax - room.zMin, t = span > 0 ? (Math.min(room.zMax, Math.max(room.zMin, z)) - room.zMin) / span : 0;
  return Math.round(t * 0.22 * 1000) / 1000;
}

export function depthFootprintsV188(room) {
  return room ? [room.dropship?.footprint, ...room.props.map(entry => entry.footprint)].filter(Boolean) : [];
}

/** True when an actor centred at x (half width halfWidth) and at depth z overlaps a footprint. */
export function blockedByFootprintV188(room, x, z, halfWidth = 0) {
  return depthFootprintsV188(room).some(entry => x + halfWidth > entry.x0 && x - halfWidth < entry.x1 && z > entry.z0 && z < entry.z1);
}

const clampZ = (room, z) => Math.max(room.zMin, Math.min(room.zMax, z));

/** Depth step, axis by axis: z first, then the horizontal move already made by the rail physics. */
export function stepDepthMoveV188(room, from, to, { dz = 0, dt = 0, halfWidth = 22 } = {}) {
  if (!room) return { x: to.x, z: 0, blocked: false };
  let z = clampZ(room, from.z + dz * room.speed * dt), x = to.x, blocked = false;
  // Swept in depth: a long frame cannot tunnel through a footprint, it stops at its edge.
  for (const entry of depthFootprintsV188(room)) {
    if (!(from.x + halfWidth > entry.x0 && from.x - halfWidth < entry.x1)) continue;
    if (from.z >= entry.z1 && z < entry.z1) { z = entry.z1; blocked = true; }
    else if (from.z <= entry.z0 && z > entry.z0) { z = entry.z0; blocked = true; }
  }
  if (blockedByFootprintV188(room, from.x, z, halfWidth)) { z = from.z; blocked = true; }
  if (blockedByFootprintV188(room, x, z, halfWidth)) { x = from.x; blocked = true; }
  return { x, z, blocked };
}

export const canLeaveDepthRoomV188 = (room, z) => !room || Math.abs(z) <= room.doorBand;
export const depthInteractionAllowedV188 = (room, playerZ, targetZ) => !room || Math.abs(playerZ - targetZ) <= room.interactBand;

/** Where a crew member of the room should stand in depth: moving or at work. */
export function npcDepthTargetV188(room, npc, { moving = false } = {}) {
  if (!room) return 0;
  const inLane = npc.x >= room.npcLane.x0 && npc.x <= room.npcLane.x1;
  if (moving) return inLane ? room.npcLane.z : 0;
  const station = room.npcDepths[npc.crewId];
  return Number.isFinite(station) ? station : inLane ? room.npcLane.z : 0;
}
/** Exponential approach towards the target, never into a footprint. */
export function stepNpcDepthV188(room, npc, target, dt) {
  const current = Number(npc.depthZ) || 0, next = current + (target - current) * (1 - Math.exp(-6 * dt));
  return blockedByFootprintV188(room, npc.x + (npc.w || 44) / 2, next, (npc.w || 44) / 2) ? current : clampZ(room, next);
}

export function normalizeHubDepthV188(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const room = HUB_DEPTH_ROOMS_V188[raw.roomId] || (raw.roomId === PORT_DEPTH_ROOM_V188.roomId ? PORT_DEPTH_ROOM_V188 : null);
  if (!room || !Number.isFinite(Number(raw.z))) return null;
  return { roomId: room.roomId, z: Math.round(clampZ(room, Number(raw.z)) * 10) / 10 };
}

/** Future combat rule (owner decision 3, not wired while depth rooms have no combat):
 * a horizontal shot hits a target inside a nearby depth band; the shooter then
 * settles 30 % of the way towards that band. */
export const DEPTH_SHOT_BAND_V188 = 22;
export const depthShotHitsV188 = (shooterZ, targetZ, band = DEPTH_SHOT_BAND_V188) => Math.abs(shooterZ - targetZ) <= band;
export const depthShotSettleV188 = (shooterZ, targetZ) => shooterZ + (targetZ - shooterZ) * 0.3;

export function depthAnnouncementV188(language = 'fr') {
  return language === 'en' ? 'DEPTH ROOM · W/S: STEP FORWARD / BACK' : 'SALLE EN PROFONDEUR · W/S : AVANCER / RECULER';
}
