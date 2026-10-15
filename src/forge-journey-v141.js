/** Shared, data-only Forge journey contract. No campaign or browser state. */
import { parseProject, nativeTiles } from './forge-model-v130.js';

const clone = value => structuredClone(value);
const box = value => value && ['x', 'y', 'w', 'h'].every(key => Number.isFinite(value[key])) && value.w > 0 && value.h > 0;
export const forgeBoxesOverlapV141 = (a, b) => a.x < b.x + b.w - .01 && a.x + a.w > b.x + .01
  && a.y < b.y + b.h - .01 && a.y + a.h > b.y + .01;

/** Hand reach never crosses a physical wall or another closed door. The
 * interaction target itself is excluded, including a door's collider copy. */
export function forgeInteractionClearV141({ actor, target, solids = [] } = {}) {
  if (!box(actor) || !box(target)) return false;
  const start = { x: actor.x + actor.w / 2, y: actor.y + actor.h / 2 };
  const end = { x: target.x + target.w / 2, y: target.y + target.h / 2 };
  return !solids.filter(solid => box(solid) && !solid.destroyed && solid !== target
    && !(solid.id && target.id && solid.id === target.id)).some(solid => {
    let enter = 0, leave = 1;
    for (const [axis, size] of [['x', 'w'], ['y', 'h']]) {
      const delta = end[axis] - start[axis], minimum = solid[axis] + .01, maximum = solid[axis] + solid[size] - .01;
      if (Math.abs(delta) < .000001) { if (start[axis] <= minimum || start[axis] >= maximum) return false; }
      else {
        const a = (minimum - start[axis]) / delta, b = (maximum - start[axis]) / delta;
        enter = Math.max(enter, Math.min(a, b)); leave = Math.min(leave, Math.max(a, b));
        if (enter >= leave) return false;
      }
    }
    return leave > .00001 && enter < .99999;
  });
}

export function parseForgeJourneyProjectV141(input, expectedKind = null) {
  const project = parseProject(input);
  if (expectedKind && project.kind !== expectedKind) throw new TypeError(`Projet Forge ${expectedKind} requis.`);
  return project;
}

export function forgeRoomProjectV141(project, roomId = project.activeRoomId) {
  const room = project.rooms.find(entry => entry.id === roomId);
  if (!room) throw new TypeError('Salle Forge introuvable.');
  return { ...clone(project), activeRoomId: roomId, size: [...room.size], tiles: nativeTiles(room) };
}

export function outgoingForgeLinksV141(project, roomId = project.activeRoomId) {
  return project.links.flatMap(link => link.from.roomId === roomId ? [{ ...clone(link), reverse: false }]
    : link.bidirectional && link.to.roomId === roomId ? [{ ...clone(link), from: clone(link.to), to: clone(link.from), reverse: true }] : []);
}

export function reachableForgeRoomsV141(project, start = project.activeRoomId) {
  if (!project.rooms.some(room => room.id === start)) throw new TypeError('Salle Forge de départ introuvable.');
  const result = [start], seen = new Set(result);
  for (let index = 0; index < result.length; index++) for (const link of outgoingForgeLinksV141(project, result[index])) {
    if (!seen.has(link.to.roomId)) { seen.add(link.to.roomId); result.push(link.to.roomId); }
  }
  return result;
}

export function forgeLinkEndpointV141(project, endpoint) {
  const room = project.rooms.find(entry => entry.id === endpoint?.roomId);
  const cell = room?.cells.find(entry => entry.id === endpoint?.cellId && entry.type === 'door'
    && !['background', 'foreground'].includes(entry.layer));
  if (!cell) throw new TypeError('Extrémité physique de liaison Forge introuvable.');
  return { room, cell };
}

export function createForgeSessionV141(input, { kind = null } = {}) {
  const project = parseForgeJourneyProjectV141(input, kind);
  return { schema: 141, kind: project.kind, project, entryRoomId: project.activeRoomId,
    currentRoomId: project.activeRoomId, reachableRoomIds: reachableForgeRoomsV141(project),
    roomStates: {}, completedObjectives: [], transitions: 0, lastTransition: null };
}

/** A one-way departure cannot strand an unfinished authored objective. */
export function blockedForgeObjectivesV141(session, destinationRoomId) {
  const reachable = new Set(reachableForgeRoomsV141(session.project, destinationRoomId));
  const completed = new Set(session.completedObjectives);
  return session.project.rooms.filter(room => session.reachableRoomIds.includes(room.id) && !reachable.has(room.id))
    .flatMap(room => room.cells.filter(cell => cell.type === 'objective' && !['background', 'foreground'].includes(cell.layer)
      && !completed.has(cell.id)).map(cell => cell.id));
}

export function captureForgeRoomV141(session, roomId, state) {
  if (!session.project.rooms.some(room => room.id === roomId)) throw new TypeError('Salle Forge inconnue.');
  session.roomStates[roomId] = clone(state);
  return session.roomStates[roomId];
}

export function restoreForgeRoomV141(session, roomId) {
  return Object.hasOwn(session.roomStates, roomId) ? clone(session.roomStates[roomId]) : null;
}

export function commitForgeTransitionV141(session, link) {
  const allowed = outgoingForgeLinksV141(session.project, session.currentRoomId)
    .find(entry => entry.id === link?.id && entry.to.roomId === link?.to?.roomId && entry.from.cellId === link?.from?.cellId);
  if (!allowed) throw new TypeError('Transition Forge non autorisée depuis cette salle.');
  session.currentRoomId = allowed.to.roomId;
  session.transitions++;
  session.lastTransition = { linkId: allowed.id, from: clone(allowed.from), to: clone(allowed.to), sequence: session.transitions };
  return session.lastTransition;
}

/** Resolve a complete supported body beside the real destination door.
 * Every check precedes mutation; moving lifts never count as fixed support.
 * Adjacent spans may jointly support a foot, but gaps and hazards reject it. */
export function findForgeArrivalV141({ door, actor, bounds, surfaces = [], solids = [], hazards = [], occupied = [] } = {}) {
  const w = actor?.w, h = actor?.h;
  if (!box(door) || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0
    || !Number.isFinite(bounds?.width) || !Number.isFinite(bounds?.height)) return { ok: false, reason: 'invalid-arrival-geometry' };
  const fixed = surfaces.filter(surface => box(surface) && !surface.destroyed && surface.kind !== 'lift'
    && !surface.dynamic && !surface.lift && !surface.controlledV130);
  const maxDistance = Math.max(180, door.w + w * 2), bottom = door.y + door.h;
  const near = fixed.filter(surface => Math.abs(surface.y - bottom) <= Math.max(48, door.h * .45)
    && surface.x < door.x + door.w + maxDistance && surface.x + surface.w > door.x - maxDistance);
  const elevations = [...new Set(near.map(surface => surface.y))].sort((a, b) => Math.abs(a - bottom) - Math.abs(b - bottom));
  const sides = actor.facing < 0 ? ['right', 'left'] : ['left', 'right'];
  const blockers = [...solids, ...occupied].filter(value => box(value) && !value.destroyed);
  const dangerous = hazards.filter(value => box(value) && value.active !== false && !value.destroyed);
  for (const y of elevations) for (const side of sides) {
    const preferred = side === 'left' ? door.x - w - 8 : door.x + door.w + 8;
    const positions = Array.from({ length: 4 }, (_, index) => preferred + index * (side === 'left' ? -w - 8 : w + 8));
    for (const x of positions) {
      const body = { x, y: y - h, w, h };
      if (body.x < 0 || body.y < 0 || body.x + w > bounds.width || body.y + h > bounds.height) continue;
      if (blockers.some(value => forgeBoxesOverlapV141(body, value)) || dangerous.some(value => forgeBoxesOverlapV141(body, value))) continue;
      if (!forgeInteractionClearV141({ actor: body, target: door, solids })) continue;
      const spans = fixed.filter(surface => Math.abs(surface.y - y) < .1)
        .map(surface => [surface.x, surface.x + surface.w]).sort((a, b) => a[0] - b[0]);
      let edge = x;
      for (const [left, right] of spans) if (left <= edge + .01 && right > edge) edge = right;
      if (edge < x + w - .01) continue;
      const surface = fixed.find(value => Math.abs(value.y - y) < .1 && value.x <= x && value.x + value.w >= x);
      return { ok: true, x, y: body.y, surfaceId: surface?.id || null, side };
    }
  }
  return { ok: false, reason: 'destination-obstructed-or-unsupported' };
}
