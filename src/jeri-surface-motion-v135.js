// Original movement adaptation: the selected avatar keeps its native collision
// body. Attachment uses the level's physical geometry, never background art.
export const JERI_SURFACE_SCHEMA_V135 = 135;
const EPS = 0.002;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const validRect = r => r && typeof r.id === 'string' && ['x', 'y', 'w', 'h'].every(k => Number.isFinite(r[k])) && r.w > 0 && r.h > 0;
const intersects = (a, b) => a.x < b.x + b.w - EPS && a.x + a.w > b.x + EPS && a.y < b.y + b.h - EPS && a.y + a.h > b.y + EPS;
export function createJeriSurfaceStateV135() {
  return { schema: 135, mode: 'free', surfaceId: null, face: null, cooldown: 0, distance: 0 };
}
export function buildJeriSurfaceSceneV135(geometry, hiveState, stations = []) {
  const platforms = (geometry?.platforms || []).filter(validRect).map(p => ({ ...p, surfaceKind: 'platform' }));
  const walls = (geometry?.walls || []).filter(validRect).map(p => ({ ...p, surfaceKind: 'wall' }));
  const doors = (geometry?.doors || []).filter(validRect).filter(door => {
    const inspection = stations.find(station => station.gateId === door.id);
    return inspection ? !hiveState?.inspections?.includes(inspection.id) : !door.open;
  }).map(p => ({ ...p, surfaceKind: 'door' }));
  return { solids: [...platforms, ...walls, ...doors], width: geometry?.width || 3880, height: geometry?.height || 850 };
}
function attachedRect(actor, rect, face) {
  if (face === 'left') return { ...actor, x: rect.x - actor.w };
  if (face === 'right') return { ...actor, x: rect.x + rect.w };
  return { ...actor, y: rect.y + rect.h };
}
function supported(actor, rect, face) {
  if (!rect) return false;
  if (face === 'underside') return !rect.floor && rect.surfaceKind === 'platform'
    && Math.abs(actor.y - rect.y - rect.h) <= EPS && actor.x >= rect.x - EPS && actor.x + actor.w <= rect.x + rect.w + EPS;
  return rect.h >= actor.h && actor.y >= rect.y - EPS && actor.y + actor.h <= rect.y + rect.h + EPS
    && Math.abs(face === 'left' ? actor.x + actor.w - rect.x : actor.x - rect.x - rect.w) <= EPS;
}
const clear = (actor, scene) => actor.x >= -EPS && actor.x + actor.w <= scene.width + EPS && actor.y >= -200
  && !scene.solids.some(rect => intersects(actor, rect));
export function findJeriSurfaceV135(actor, scene, reach = 14) {
  if (!actor || !scene || !['x','y','w','h'].every(k => Number.isFinite(actor[k]))) return null;
  const choices = [];
  for (const rect of scene.solids) for (const face of ['left', 'right', 'underside']) {
    const pose = attachedRect(actor, rect, face), distance = Math.hypot(pose.x - actor.x, pose.y - actor.y);
    if (distance <= reach && supported(pose, rect, face) && clear(pose, scene)) choices.push({ surfaceId: rect.id, face, pose, distance });
  }
  return choices.sort((a,b) => a.distance - b.distance || a.surfaceId.localeCompare(b.surfaceId))[0] || null;
}
export function validateJeriSurfaceStateV135(raw, actor, scene, { terminal = false } = {}) {
  if (raw === undefined || raw === null) return { valid: true, state: createJeriSurfaceStateV135(), migrated: true };
  if (!raw || raw.schema !== 135 || !['free','attached'].includes(raw.mode)
    || !Number.isFinite(raw.cooldown) || raw.cooldown < 0 || raw.cooldown > .4
    || !Number.isFinite(raw.distance) || raw.distance < 0 || raw.distance > 1e7)
    return { valid: false, reason: 'jeri-surface-state-v135' };
  if (raw.mode === 'free') return raw.surfaceId === null && raw.face === null
    ? { valid: true, state: { ...raw } } : { valid: false, reason: 'jeri-surface-free-v135' };
  const surface = scene?.solids.find(rect => rect.id === raw.surfaceId);
  if (terminal || !['left','right','underside'].includes(raw.face) || !actor || !supported(actor, surface, raw.face) || !clear(actor, scene))
    return { valid: false, reason: 'jeri-surface-contact-v135' };
  return { valid: true, state: { ...raw } };
}
export function attachJeriSurfaceV135(actor, state, scene) {
  if (state.mode !== 'free' || state.cooldown > 0) return { changed: false, actor, state };
  const contact = findJeriSurfaceV135(actor, scene);
  if (!contact) return { changed: false, actor, state };
  return { changed: true, actor: { ...actor, x: contact.pose.x, y: contact.pose.y, vx: 0, vy: 0 },
    state: { ...state, mode: 'attached', surfaceId: contact.surfaceId, face: contact.face, cooldown: 0 } };
}
export function releaseJeriSurfaceV135(actor, state, jump = false) {
  const direction = state.face === 'left' ? -1 : state.face === 'right' ? 1 : 0;
  return { actor: { ...actor, vx: direction * (jump ? 225 : 100), vy: direction && jump ? -225 : 100 },
    state: { ...state, mode: 'free', surfaceId: null, face: null, cooldown: .3 }, released: true };
}
function sweep(actor, amount, axis, scene) {
  let distance = amount;
  for (const solid of scene.solids) {
    const across = axis === 'x' ? actor.y < solid.y + solid.h - EPS && actor.y + actor.h > solid.y + EPS
      : actor.x < solid.x + solid.w - EPS && actor.x + actor.w > solid.x + EPS;
    if (!across) continue;
    const start = actor[axis], extent = axis === 'x' ? actor.w : actor.h, edge = solid[axis], size = axis === 'x' ? solid.w : solid.h;
    if (amount > 0 && start + extent <= edge + EPS) distance = Math.min(distance, Math.max(0, edge - start - extent));
    if (amount < 0 && start >= edge + size - EPS) distance = Math.max(distance, Math.min(0, edge + size - start));
  }
  return distance;
}
export function stepJeriSurfaceV135(actor, state, scene, input, delta, mobility = 1) {
  const dt = Number.isFinite(delta) ? clamp(delta, 0, .1) : 0;
  if (dt <= 0) return { actor, state };
  if (state.mode === 'free') return { actor, state: { ...state, cooldown: Math.max(0, state.cooldown - dt) } };
  if (!validateJeriSurfaceStateV135(state, actor, scene).valid || input.jump) return releaseJeriSurfaceV135(actor, state, Boolean(input.jump));
  let pose = { ...actor }, next = { ...state }, remaining = dt;
  while (remaining > 1e-9) {
    const step = Math.min(1/120, remaining); remaining -= step;
    const surface = scene.solids.find(rect => rect.id === next.surfaceId);
    const ceiling = next.face === 'underside', axis = ceiling ? 'x' : 'y';
    const direction = clamp(Number(ceiling ? input.horizontal : input.vertical) || 0, -1, 1);
    const desired = direction * (ceiling ? 190 : 165) * clamp(mobility, 0, 1) * step;
    const allowed = sweep(pose, desired, axis, scene);
    pose[axis] += allowed;
    next.distance += Math.abs(allowed);
    if (!supported(pose, surface, next.face)) return releaseJeriSurfaceV135(pose, next);
    // A wall meets a real underside: transfer at the shared contact, without
    // moving through either solid or snapping to a remote route.
    if (!ceiling && desired < 0 && Math.abs(allowed - desired) > EPS) {
      const contact = scene.solids.find(rect => supported(pose, rect, 'underside') && clear(pose, scene));
      if (contact) { next.surfaceId = contact.id; next.face = 'underside'; }
    }
  }
  return { actor: { ...pose, vx: 0, vy: 0 }, state: next };
}
export function jeriSurfaceContactsV135(actor, state) {
  if (state?.mode !== 'attached') return [];
  if (state.face === 'underside') return [actor.x + actor.w*.25, actor.x + actor.w*.75].map(x => ({ x, y: actor.y }));
  return [actor.y + actor.h*.25, actor.y + actor.h*.75].map(y => ({ x: state.face === 'left' ? actor.x + actor.w : actor.x, y }));
}
