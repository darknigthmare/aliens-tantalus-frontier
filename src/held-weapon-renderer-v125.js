import { resolveHeldWeaponProfileV125 } from './held-weapon-profiles-v125.js';
import { HUMAN_VISUAL_CONTRACT_V133 } from './human-visual-contract-v133.js';
import { getPlayerArmReachV160, nearestReachableWeaponGripV160,
  interpolatePlayerArmTargetV160 } from './player-arm-constraints-v160.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const sign = value => finite(value, 1) < 0 ? -1 : 1;
const point = (x, y) => ({ x, y });
const validPoint = value => value && Number.isFinite(value.x) && Number.isFinite(value.y);
const smooth = t => { const value = clamp(t); return value * value * (3 - 2 * value); };
const transform = (matrix, value) => point(matrix.a * value.x + matrix.c * value.y + matrix.e,
  matrix.b * value.x + matrix.d * value.y + matrix.f);
const sourcePoint = (profile, pivot) => pivot ? point(pivot.x * profile.sourceWidth, pivot.y * profile.sourceHeight) : null;
const atPivot = (profile, matrix, pivot) => pivot ? transform(matrix, sourcePoint(profile, pivot)) : null;

export const HELD_WEAPON_SURFACE_HEIGHTS_V125 = Object.freeze({
  mission: HUMAN_VISUAL_CONTRACT_V133.standingHeight, hub: HUMAN_VISUAL_CONTRACT_V133.standingHeight,
  bioforge: HUMAN_VISUAL_CONTRACT_V133.standingHeight
});
// A source-level presentation choice shared by holding and servicing. Keep
// the support elbow below a horizontal rifle, and never flip that branch at
// a reload phase boundary to conceal a bad service contact.
export const HELD_WEAPON_ARM_BRANCHES_V160 = Object.freeze({ near: 1, far: 1 });

function unitAim(aim, actor) {
  const x = finite(aim?.x), y = finite(aim?.y);
  const maximum = Math.max(Math.abs(x), Math.abs(y));
  const facing = Math.abs(x) > 1e-8 ? sign(x) : sign(aim?.facing ?? actor.facing);
  if (!maximum) return { x: facing, y: 0, facing };
  const length = Math.hypot(x / maximum, y / maximum);
  return { x: x / maximum / length, y: y / maximum / length, facing };
}

function bodyGeometry(actor, rig, surface) {
  const standingHeight = Math.max(1, finite(rig?.standingHeight ?? rig?.bodyHeight,
    HELD_WEAPON_SURFACE_HEIGHTS_V125[surface] || HELD_WEAPON_SURFACE_HEIGHTS_V125.mission));
  const facing = sign(actor.facing);
  const footX = finite(actor.x) + finite(actor.w, 42) / 2;
  const footY = finite(actor.y) + finite(actor.h, 92);
  const peek = actor.coverV124?.peeking ? clamp(finite(actor.coverV124.peekRise), 0, 32) : 0;
  const shoulder = validPoint(rig?.shoulders?.near) ? rig.shoulders.near
    : point(footX - facing * standingHeight * .025, footY - standingHeight * (actor.crouching ? .46 : .66) - peek);
  const farShoulder = validPoint(rig?.shoulders?.far) ? rig.shoulders.far
    : point(shoulder.x - facing * standingHeight * .055, shoulder.y + standingHeight * .01);
  return {
    standingHeight, shoulder, farShoulder,
    // The admitted peek torso already raises its real shoulders. Complete the
    // requested elevation with the hands inside their anatomical reach; do not
    // stretch a body, move its feet or teleport a projectile above its barrel.
    peekLift: validPoint(rig?.shoulders?.near) && actor.coverV124?.peeking
      ? Math.max(0, peek - Math.max(0, finite(rig.shoulderPeekRise))) : 0,
    neutralGrip: validPoint(rig?.neutralGrip) ? rig.neutralGrip
      : point(shoulder.x + facing * standingHeight * .11, shoulder.y + standingHeight * .13),
    pouch: validPoint(rig?.pouch) ? rig.pouch
      : point(farShoulder.x + facing * standingHeight * .02, farShoulder.y + standingHeight * .27),
    nearLengths: rig?.armLengths?.near, farLengths: rig?.armLengths?.far,
    shoulderAxes: rig?.torsoAxisV160 || (rig?.matrix ? {
      forward: point(rig.matrix.a, rig.matrix.b), down: point(rig.matrix.c, rig.matrix.d)
    } : null), facing
  };
}

function reloadState(actor, profile) {
  const state = actor.tacticalReload;
  const sameWeapon = !state?.weaponKey || [profile.weaponId, profile.fallbackFor, profile.name].includes(state.weaponKey);
  const active = actor.reloading === true && state?.phase === 'reloading' && sameWeapon
    && finite(state.completeAt) > 0 && profile.reload.feed !== 'none';
  return { active, progress: active ? clamp(finite(state.elapsed) / state.completeAt) : 0,
    feed: profile.reload.feed, result: active ? state.result || 'normal' : null };
}

/** Preserve one rigid weapon while putting both hands inside their arm reach.
 * Translating a complete image keeps the stock, bore and contact points intact;
 * stretching only a barrel or a wrist would make their apparent contact false. */
function reachableGrip(grip, supportOffset, geometry, reloadOffset = null, obstaclePlanes = []) {
  const bands = [];
  const add = (center, lengths, bend) => {
    const reach = getPlayerArmReachV160(lengths);
    if (!reach) return;
    const margin = Math.min(.001, (reach.max - reach.min) / 4);
    bands.push({ center, min: reach.min + margin,
      max: Math.max(reach.min + margin, Math.min(reach.max - margin, reach.max * .98)),
      lengths, axes: geometry.shoulderAxes, bend });
  };
  add(geometry.shoulder, geometry.nearLengths, HELD_WEAPON_ARM_BRANCHES_V160.near);
  // During a reload both the receiver port and foregrip must remain reachable.
  // Do not put a service port inside the elbow's folded inner reach simply
  // because it fits inside its outer circle. The complete rigid weapon moves
  // to the closest shared admissible region for trigger, foregrip and port.
  for (const offset of [supportOffset, reloadOffset].filter(Boolean))
    add(point(geometry.farShoulder.x - offset.x, geometry.farShoulder.y - offset.y), geometry.farLengths,
      HELD_WEAPON_ARM_BRANCHES_V160.far);
  return nearestReachableWeaponGripV160(grip, bands, geometry.facing, obstaclePlanes);
}

function servicePose(state, home, port, pouch, actor, geometry) {
  const progress = state.progress;
  if (!state.active || !port) return { hand: null, phase: 'idle' };
  const travel = (from, to, amount) => interpolatePlayerArmTargetV160(from, to, amount,
    geometry.farShoulder, geometry.farLengths, geometry.facing, geometry.shoulderAxes, HELD_WEAPON_ARM_BRANCHES_V160.far);
  if (progress < .18) return { hand: travel(home, port, smooth(progress / .18)), phase: 'reach' };
  if (progress < .35) return { hand: port, phase: state.feed === 'cylinder' ? 'open-cylinder'
    : state.feed === 'tube' ? 'open-loading-port' : 'remove' };
  // Tube loading never poses a detachable box. Repeated hand trips are visual
  // phases only; tactical-reload-v77 remains the sole ammunition transaction.
  if (state.feed === 'tube' && progress < .84) {
    const missing = Math.max(1, finite(actor.magazineSize, 1) - finite(actor.ammo));
    const cycles = Math.min(4, Math.ceil(missing));
    const cycle = ((progress - .35) / .49 * cycles) % 1;
    return { hand: cycle < .5 ? travel(port, pouch, smooth(cycle * 2)) : travel(pouch, port, smooth((cycle - .5) * 2)),
      phase: cycle < .5 ? 'fetch-shell' : 'insert-shell' };
  }
  if (progress < .53) return { hand: travel(port, pouch, smooth((progress - .35) / .18)), phase: 'fetch' };
  if (progress < .70) return { hand: travel(pouch, port, smooth((progress - .53) / .17)), phase: 'insert' };
  if (progress < .84) return { hand: port, phase: state.feed === 'cylinder' ? 'close-cylinder' : 'seat' };
  return { hand: travel(port, home, smooth((progress - .84) / .16)), phase: 'settle' };
}

function boundsAt(profile, matrix) {
  const [left, top, right, bottom] = profile.alphaBounds;
  const corners = [point(left, top), point(right, top), point(right, bottom), point(left, bottom)].map(value => transform(matrix, value));
  const x0 = Math.min(...corners.map(value => value.x)), x1 = Math.max(...corners.map(value => value.x));
  const y0 = Math.min(...corners.map(value => value.y)), y1 = Math.max(...corners.map(value => value.y));
  return { left: x0, top: y0, right: x1, bottom: y1, width: x1 - x0, height: y1 - y0, corners };
}

function muzzleWithPorts(muzzle, grip, direction, ejectionPort, reloadPort) {
  return { ...muzzle, pivotX: grip.x, pivotY: grip.y,
    barrelLength: Math.hypot(muzzle.x - grip.x, muzzle.y - grip.y), aimX: direction.x, aimY: direction.y,
    ...(ejectionPort ? { ejectionX: ejectionPort.x, ejectionY: ejectionPort.y } : {}),
    ...(reloadPort ? { reloadX: reloadPort.x, reloadY: reloadPort.y } : {}) };
}

/** Pure source-to-world geometry shared by the renderer, aim guide, accepted
 * shots and their lights/debris. No DOM, image readiness, draw history, random
 * source, real-time clock or actor/inventory mutation participates in a pose.
 * A body rig supplies measured world shoulders and its constant standing height.
 * The source bore axis is distinct from the diagonal hand-to-muzzle segment. */
export function getHeldWeaponPoseV125({ actor, descriptor, aim, bodyRig = null, surface = 'mission',
  timeSeconds = 0, reducedMotion = false, obstaclePlanesV160 = [] } = {}) {
  const profile = resolveHeldWeaponProfileV125(descriptor);
  if (!actor || !profile?.portable || bodyRig?.eligible === false || actor.alive === false || actor.downed
    || actor.inVehicle || actor.ventTransit || actor.climbing || actor.grappling
    || actor.fieldActionV124 || actor.placeableActionV124
    || finite(actor.toolUseClock) > 0 || finite(actor.interactionClock) > 0
    || (finite(actor.meleeClock) > 0 && profile.type !== 'melee')) return null;

  const vector = unitAim(aim || actor.combatAimV83, actor);
  const geometry = bodyGeometry(actor, bodyRig, surface);
  const reload = reloadState(actor, profile);
  const sourceGrip = sourcePoint(profile, profile.gripPivot);
  const [left, top, right, bottom] = profile.alphaBounds;
  const sourceLength = profile.sizeAxis === 'height' ? bottom - top : right - left;
  const scale = geometry.standingHeight * profile.sizeRatio / Math.max(1, sourceLength);
  const mirror = vector.facing !== profile.sourceFacing, reflection = mirror ? -1 : 1;
  const targetAngle = Math.atan2(vector.y, vector.x);
  const nativeBoreAngle = Math.atan2(profile.boreAxis.y, profile.boreAxis.x * reflection);
  const reloadEnvelope = reload.active ? Math.sin(Math.PI * reload.progress) : 0;
  const reloadTilt = -vector.facing * .36 * reloadEnvelope;
  const rotation = targetAngle - nativeBoreAngle + reloadTilt;
  const cos = Math.cos(rotation), sin = Math.sin(rotation);
  const matrix = { a: cos * scale * reflection, b: sin * scale * reflection,
    c: -sin * scale, d: cos * scale, e: 0, f: 0 };

  // Aiming pivots an anatomical neutral hand around the shoulder. The body and
  // weapon each preserve their own aspect ratio instead of rotating a body cell.
  const aimTurn = targetAngle - (sign(actor.facing) < 0 ? Math.PI : 0);
  const handX = geometry.neutralGrip.x - geometry.shoulder.x;
  const handY = geometry.neutralGrip.y - geometry.shoulder.y;
  let grip = point(geometry.shoulder.x + Math.cos(aimTurn) * handX - Math.sin(aimTurn) * handY,
    geometry.shoulder.y + Math.sin(aimTurn) * handX + Math.cos(aimTurn) * handY);
  grip.y -= geometry.peekLift;

  const motion = actor.weaponRigMotionV125;
  const sameShotWeapon = motion && (!motion.weaponId || [profile.weaponId, profile.fallbackFor].includes(motion.weaponId));
  const time = finite(timeSeconds, finite(motion?.time));
  const elapsedSinceShot = time - finite(motion?.shotAt, -Infinity);
  const recoil = !reducedMotion && sameShotWeapon && elapsedSinceShot >= 0
    ? clamp(1 - elapsedSinceShot / .16) : 0;
  // Translation alone preserves the bore direction for a shot that can actually
  // be fired. Reload tilt is visible only while the existing reload blocks fire.
  const recoilDistance = geometry.standingHeight * .019 * recoil;
  grip.x -= vector.x * recoilDistance + vector.facing * geometry.standingHeight * .025 * reloadEnvelope;
  grip.y -= vector.y * recoilDistance - geometry.standingHeight * .018 * reloadEnvelope;

  const supportPixel = sourcePoint(profile, profile.supportPivot);
  const supportOffset = supportPixel ? transform(matrix, point(supportPixel.x - sourceGrip.x, supportPixel.y - sourceGrip.y)) : null;
  const reloadPixel = reload.active ? sourcePoint(profile, profile.reloadPivot) : null;
  const reloadOffset = reloadPixel ? transform(matrix, point(reloadPixel.x - sourceGrip.x, reloadPixel.y - sourceGrip.y)) : null;
  // Downward fire carries its trigger at or below the shoulder. Without this
  // anatomical half-plane a close wall can select the disconnected solution
  // above the head, then teleport the gun back below when that pocket closes.
  const posturePlanes = vector.y > 1e-6 ? [{ normal: { x: 0, y: 1 }, offset: geometry.shoulder.y }] : [];
  const originalReach = reachableGrip(grip, supportOffset, geometry, reloadOffset, posturePlanes);
  const armReach = obstaclePlanesV160.length
    ? reachableGrip(grip, supportOffset, geometry, reloadOffset, [...posturePlanes, ...obstaclePlanesV160]) : originalReach;
  grip = armReach.grip;
  matrix.e = grip.x - matrix.a * sourceGrip.x - matrix.c * sourceGrip.y;
  matrix.f = grip.y - matrix.b * sourceGrip.x - matrix.d * sourceGrip.y;

  const boreX = matrix.a * profile.boreAxis.x + matrix.c * profile.boreAxis.y;
  const boreY = matrix.b * profile.boreAxis.x + matrix.d * profile.boreAxis.y;
  const boreLength = Math.hypot(boreX, boreY);
  const direction = point(boreX / boreLength, boreY / boreLength);
  const foregrip = atPivot(profile, matrix, profile.supportPivot);
  const reloadPort = atPivot(profile, matrix, profile.reloadPivot);
  const ejectionPort = atPivot(profile, matrix, profile.ejectionPivot);
  const restHand = foregrip || point(geometry.farShoulder.x + vector.facing * geometry.standingHeight * .04,
    geometry.farShoulder.y + geometry.standingHeight * .25);
  const service = servicePose(reload, restHand, reloadPort, geometry.pouch, actor, geometry);
  const muzzle = muzzleWithPorts(atPivot(profile, matrix, profile.muzzlePivot), grip, direction, ejectionPort, reloadPort);
  return {
    schema: 125, profile, visible: true, imageKey: profile.imageKey, path: profile.path,
    sourceRect: { x: 0, y: 0, width: profile.sourceWidth, height: profile.sourceHeight },
    matrix, scale, reflection, mirror, rotation, angle: Math.atan2(direction.y, direction.x),
    aimX: direction.x, aimY: direction.y, inputAimX: vector.x, inputAimY: vector.y,
    facing: vector.facing, pivotX: grip.x, pivotY: grip.y, grip,
    support: service.hand || foregrip, foregrip, serviceHand: service.hand,
    muzzle, reloadPort, ejectionPort, handedness: profile.handedness,
    standingHeight: geometry.standingHeight, visibleBounds: boundsAt(profile, matrix),
    recoil, reloadProgress: reload.progress, reloadPhase: service.phase, reloadFeed: reload.feed,
    reloading: reload.active, timeSeconds: time,
    translation: point(grip.x - originalReach.grip.x, grip.y - originalReach.grip.y),
    armReachV160: { feasible: armReach.feasible, error: armReach.error,
      obstacleConstrained: obstaclePlanesV160.length > 0 },
    // One stable branch for each anatomical arm. Changing the far elbow only
    // when reload begins would snap it across the shoulder-to-hand line.
    armBendsV160: { ...HELD_WEAPON_ARM_BRANCHES_V160 }
  };
}

/** Obstacle retraction moves every weapon contact and its muzzle together.
 * Body shoulders are deliberately not embedded here: they remain attached to
 * the body, so its arm solver reaches the retracted grip. Input is untouched. */
export function translateHeldWeaponPoseV125(pose, dx = 0, dy = 0) {
  if (!pose) return null;
  const x = finite(dx), y = finite(dy);
  const moved = value => value ? { ...value, x: value.x + x, y: value.y + y } : null;
  const grip = moved(pose.grip), reloadPort = moved(pose.reloadPort), ejectionPort = moved(pose.ejectionPort);
  const bounds = pose.visibleBounds;
  return { ...pose, matrix: { ...pose.matrix, e: pose.matrix.e + x, f: pose.matrix.f + y },
    grip, pivotX: grip.x, pivotY: grip.y,
    support: moved(pose.support), foregrip: moved(pose.foregrip), serviceHand: moved(pose.serviceHand),
    reloadPort, ejectionPort,
    muzzle: muzzleWithPorts(moved(pose.muzzle), grip, point(pose.aimX, pose.aimY), ejectionPort, reloadPort),
    visibleBounds: { ...bounds, left: bounds.left + x, right: bounds.right + x,
      top: bounds.top + y, bottom: bounds.bottom + y, corners: bounds.corners.map(moved) },
    translation: point(finite(pose.translation?.x) + x, finite(pose.translation?.y) + y),
    armReachV160: { feasible: false, error: null, reason: 'translated-without-reach-resolution' } };
}

/** The full native source is drawn once, with the same affine used for hands
 * and bullets. Slow/broken/wrong-sized assets return false without substituting
 * another weapon or sampling an inspection image as a player animation atlas. */
export function drawHeldWeaponV125(ctx, image, pose) {
  if (!pose?.visible || !image?.complete || image.naturalWidth !== pose.profile.sourceWidth
    || image.naturalHeight !== pose.profile.sourceHeight || typeof ctx?.drawImage !== 'function'
    || typeof ctx?.transform !== 'function' || typeof ctx?.save !== 'function' || typeof ctx?.restore !== 'function') return false;
  const { a, b, c, d, e, f } = pose.matrix;
  if (![a, b, c, d, e, f].every(Number.isFinite)) return false;
  ctx.save();
  try {
    ctx.transform(a, b, c, d, e, f);
    const source = pose.sourceRect;
    ctx.drawImage(image, source.x, source.y, source.width, source.height, 0, 0, source.width, source.height);
    return true;
  } catch {
    return false;
  } finally {
    ctx.restore();
  }
}
