/** One physical size contract for the ship's existing equipment. The reference
 * is the 96.5px standing human; source images keep one uniform scale. Coordinates
 * returned here are world coordinates. No save data or room catalogue mutates. */
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const bounds = value => value && [value.x,value.y,value.w,value.h].every(Number.isFinite) && value.w > 0 && value.h > 0;

export const HUB_PROP_HEIGHTS_V136 = freeze({
  bridge: 88, briefing: 54, 'combat-information': 88, 'cryo-bay': 82,
  'crew-quarters': 106, mess: 64, medical: 94, 'science-lab': 82,
  quarantine: 106, armory: 100, workshop: 80, 'vehicle-bay': 88,
  'dropship-hangar': 88, reactor: 112, 'life-support': 106, 'sensor-array': 88,
  'arrival-airlock': 108, logistics: 104, 'mire-archives': 96,
  'synthetic-bay': 108, cctv: 106, 'proving-ground': 104, morgue: 88,
  'escape-pods': 108, durandal: 108, bioforge: 108
});

export function getHubPropHeightV136(id, fallback = 96.5) {
  return finite(HUB_PROP_HEIGHTS_V136[id], fallback);
}

export function fitHubPropBoundsV136(source, { height, footY = 624, centerX } = {}) {
  if (!bounds(source)) return null;
  const h = Math.min(source.h, finite(height, source.h)), scale = h / source.h;
  if (!(h > 0) || !Number.isFinite(footY)) return null;
  const w = source.w * scale, center = finite(centerX, source.x + source.w / 2);
  return { x: center - w / 2, y: footY - h, w, h };
}

export function getHubInteractionPropBoundsV136(room) {
  const source = room?.propRenderBounds || room?.station?.bounds;
  if (!bounds(source)) return null;
  // The three V87 authored domestic/civilian rooms already measure their small
  // furniture correctly; their portrait and terminal have separate supports.
  if (!Object.hasOwn(HUB_PROP_HEIGHTS_V136, room.id)) return { ...source };
  return fitHubPropBoundsV136(source, { height: getHubPropHeightV136(room.id),
    footY: finite(room?.world?.floorY, 624) });
}

export function getHubStationInteractionBoundsV136(room) {
  const visible = getHubInteractionPropBoundsV136(room);
  if (!visible) return null;
  return { x: visible.x - 48, y: visible.y - 32, w: visible.w + 96, h: visible.h + 64 };
}

/** Map a physical support together with its visible prop. Collider source
 * proportions survive, including deliberately inset tops/feet. */
export function mapHubPropColliderV136(collider, original, target) {
  if (!bounds(collider) || !bounds(original) || !bounds(target)) return collider && { ...collider };
  const sx = target.w / original.w, sy = target.h / original.h;
  return { ...collider, x: target.x + (collider.x - original.x) * sx,
    y: target.y + (collider.y - original.y) * sy, w: collider.w * sx, h: collider.h * sy };
}

export function getHubVehiclePlacementV136(room, actor) {
  if (!room || !actor || !bounds(actor.renderBounds)) return null;
  const start = finite(room.xStart), original = { ...actor.renderBounds, x: start + actor.renderBounds.x };
  let target;
  if (actor.id === 'vehicle-bay-m577-apc') {
    // The freight door occupies x360. A separate inspection socket between
    // x454 and x814 keeps the vehicle, maintenance lift and door readable.
    const w = 360, h = original.h * w / original.w;
    target = { x: start + 450, y: 624 - h, w, h };
  } else if (actor.id === 'dropship-hangar-ud4l') {
    // The landing craft retains a large parking bay. Its boarding entrance is
    // authored separately outside this hull, rather than shrinking the craft
    // until a door accidentally fits over a wing.
    const w = 720, h = original.h * w / original.w;
    target = { x: start + 150, y: 624 - h, w, h };
  } else return null;
  const convert = value => value && mapHubPropColliderV136({ ...value, x: start + value.x }, original, target);
  const collisionBounds = convert(actor.collisionBounds);
  const collisionSegments = (actor.collisionSegments || []).map(convert);
  // The interaction hugs the actual object, with an accessible approach on
  // both sides. It remains a rear support, never a horizontal roadblock.
  const interactionBounds = { x: target.x - 32, y: Math.max(400,target.y - 24),
    w: target.w + 64, h: 624 - Math.max(400,target.y - 24) };
  return { schema: 136, actorId: actor.id, renderBounds: target, collisionBounds,
    collisionSegments, interactionBounds, sourceRenderBounds: original,
    scaleX: target.w / original.w, scaleY: target.h / original.h,
    physicalPlane: 'rear', collisionMode: 'one-way-top' };
}
