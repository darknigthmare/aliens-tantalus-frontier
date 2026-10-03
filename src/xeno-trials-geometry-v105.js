import { getXenoTrialsFighterV96, getXenoTrialsArtV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsPhysicalScaleV119 } from './xeno-trials-physical-scale-v119.js';

// World bounds are independent of the viewport; the two-target camera fits silhouettes.
export const XENO_TRIALS_ARENA_V105 = Object.freeze({ width: 1000, height: 560, floor: 450, left: -800, right: 1800 });
export const XENO_TRIALS_CONTACT_GAP_V105 = 4;
const cache = new Map();
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/** World-scale native transform. Camera fitting never changes one fighter alone. */
export function getXenoTrialsRenderMetricsV105(id, variant = null) {
  return getXenoTrialsPhysicalScaleV119(id, variant);
}

/** Front-biased gameplay body, aligned to the same pivot/scale as the drawn pose.
 * Existing campaign body widths are scaled into the arena where available.
 * Otherwise the existing arena width is adapted by visible stature. Rear tails,
 * crests and transparent margins never become a whole-silhouette push collider.
 * These are approximate authored hit/push boxes, not pixel-perfect anatomy.
 */
export function getXenoTrialsGeometryV105(id, variant = null) {
  const key = `${id}:${variant || ''}`;
  if (cache.has(key)) return cache.get(key);
  const definition = getXenoTrialsFighterV96(id), art = getXenoTrialsArtV96(id, variant);
  const render = getXenoTrialsRenderMetricsV105(id, variant);
  if (!definition || !art || !render) return null;
  const alpha = render.alphaBounds;
  const left = (alpha[0] / art.sourceWidth - render.pivotX) * render.width;
  const right = (alpha[2] / art.sourceWidth - render.pivotX) * render.width;
  const visibleHeight = (alpha[3] - alpha[1]) / art.sourceHeight * render.height;
  const nativeScale = render.width / art.renderWidth;
  const authoredWidth = Number.isFinite(art.bodyWidth) && art.bodyWidth > 0 && Number.isFinite(nativeScale);
  const bodyWidth = authoredWidth ? art.bodyWidth * nativeScale : definition.width * visibleHeight / definition.height;
  const visibleFront = Math.max(0, render.sourceFacing > 0 ? right : -left);
  const visibleRear = Math.max(0, render.sourceFacing > 0 ? -left : right);
  // The front includes the head/torso rather than centering a generic box at the feet.
  const front = visibleFront;
  const rear = Math.min(visibleRear, Math.max(bodyWidth - front, bodyWidth * .15));
  const height = Math.min(visibleHeight, Number.isFinite(nativeScale) && nativeScale > 0 && Number.isFinite(art.bodyHeight) && art.bodyHeight > 0
    ? art.bodyHeight * nativeScale : visibleHeight * .85);
  const geometry = Object.freeze({ render: Object.freeze(render), front, rear, height,
    // Lower-body push band permits deliberate jump-overs; full height remains hittable.
    pushHeight: height * .6, width: front + rear,
    visibleHeight, visibleWidth: right - left,
    basis: authoredWidth ? 'scaled-authored-body' : 'stature-scaled-arena-body' });
  cache.set(key, geometry); return geometry;
}

/** World coordinates use height above the shared floor, as the fixed-step engine does. */
export function getXenoTrialsBodyBoundsV105(fighter) {
  const body = getXenoTrialsGeometryV105(fighter.id, fighter.variant), facing = fighter.facing < 0 ? -1 : 1;
  const left = fighter.x - (facing > 0 ? body.rear : body.front);
  const right = fighter.x + (facing > 0 ? body.front : body.rear);
  return { left, right, bottom: fighter.y, top: fighter.y + body.height,
    pushTop: fighter.y + body.pushHeight, center: (left + right) / 2, width: body.width, height: body.height };
}

export function getXenoTrialsBodyGapV105(a, b, direction = b.x >= a.x ? 1 : -1) {
  const source = getXenoTrialsBodyBoundsV105(a), target = getXenoTrialsBodyBoundsV105(b);
  return direction > 0 ? target.left - source.right : source.left - target.right;
}

export function xenoTrialsPushLanesOverlapV105(a, b) {
  const aa = getXenoTrialsBodyBoundsV105(a), bb = getXenoTrialsBodyBoundsV105(b);
  return aa.bottom < bb.pushTop && bb.bottom < aa.pushTop;
}

/** Resolve swept ordering, then distribute only the penetration that each wall permits.
 * Call before hits and again after knockback, including a lethal final hit.
 */
export function resolveXenoTrialsBodiesV105(a, b, order = a.x <= b.x ? 1 : -1) {
  const arena = XENO_TRIALS_ARENA_V105;
  a.x = clamp(a.x, arena.left, arena.right); b.x = clamp(b.x, arena.left, arena.right);
  if (!xenoTrialsPushLanesOverlapV105(a, b)) return false;
  const left = order > 0 ? a : b, right = order > 0 ? b : a;
  const penetration = getXenoTrialsBodyBoundsV105(left).right + XENO_TRIALS_CONTACT_GAP_V105
    - getXenoTrialsBodyBoundsV105(right).left;
  if (penetration <= 0) return false;
  const leftRoom = left.x - arena.left, rightRoom = arena.right - right.x;
  let leftShift = Math.min(penetration / 2, leftRoom), rightShift = Math.min(penetration / 2, rightRoom);
  let remaining = penetration - leftShift - rightShift;
  const extraLeft = Math.min(remaining, leftRoom - leftShift); leftShift += extraLeft; remaining -= extraLeft;
  rightShift += Math.min(remaining, rightRoom - rightShift);
  left.x -= leftShift; right.x += rightShift;
  return true;
}
