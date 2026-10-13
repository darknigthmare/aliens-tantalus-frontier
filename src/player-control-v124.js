import { firstProjectileObstacleV83, sweepProjectileAabbV83 } from './projectile-collision-v83.js';
import { resolveCombatMuzzleV83 } from './combat-aim-v83.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

export const PLAYER_CONTROLS_V124 = Object.freeze({
  player: Object.freeze({ crouch: 'KeyZ', aim: 'ShiftLeft' }),
  coop: Object.freeze({ crouch: 'Comma', aim: 'ShiftRight' })
});

/** Integrate an exponential velocity response, including the distance travelled.
 * This has the same result at 30, 60 and 144 Hz for a constant input. */
export function integratePlayerVelocityV124(velocity, target, response, delta) {
  const seconds = Math.max(0, finite(delta));
  const rate = Math.max(0, finite(response));
  const previous = finite(velocity), desired = finite(target);
  if (!rate) return { velocity: previous, distance: previous * seconds };
  const blend = -Math.expm1(-rate * seconds);
  return { velocity: previous + (desired - previous) * blend,
    distance: desired * seconds + (previous - desired) * blend / rate };
}

/** Read movement independently of aim. A dedicated crouch never climbs a ladder. */
export function readPlayerControlsV124(engine, actor, controls) {
  const keys = engine.keys;
  const held = code => Boolean(code && keys?.has?.(code));
  const bindings = actor.coop ? PLAYER_CONTROLS_V124.coop : PLAYER_CONTROLS_V124.player;
  const aimLocked = held(bindings.aim);
  if (aimLocked && !actor.aimLockedV124) actor.aimLockCrouchV124 = Boolean(actor.crouching);
  if (!aimLocked) actor.aimLockCrouchV124 = false;
  actor.aimLockedV124 = aimLocked;
  const incapacitated = actor.downed || actor.ventTransit || actor.hazardKind === 'electrical' && actor.hazardClock > 0;
  const left = !incapacitated && !aimLocked && (held(controls.left) || !actor.coop && held('ArrowLeft'));
  const right = !incapacitated && !aimLocked && (held(controls.right) || !actor.coop && held('ArrowRight'));
  const up = !incapacitated && !aimLocked && (held(controls.up) || !actor.coop && held('ArrowUp'));
  const down = !incapacitated && !aimLocked && (held(controls.down) || !actor.coop && held('ArrowDown'));
  const crouch = !incapacitated && (held(bindings.crouch) || actor.gamepadCrouchV124 || actor.aimLockCrouchV124 || down);
  const explicitAim = Boolean(actor.pointerAimV83 || actor.gamepadAimV83 || actor.gamepadAimHeldV124 || aimLocked);
  actor.aimingV124 = explicitAim;
  const keyboardMotion = [controls.left, controls.right, !actor.coop && 'ArrowLeft', !actor.coop && 'ArrowRight']
    .some(code => code && [...(engine.heldGameplayKeysV77?.get?.(code) || [])].some(source => !source.startsWith('gamepad-')));
  const analog = actor.gamepadMoveV124;
  const magnitude = analog && !keyboardMotion && (left || right)
    ? clamp(Math.abs(finite(analog.x)), 0.22, 1) : 1;
  return { left, right, up, down, crouch, aimLocked, explicitAim, magnitude, incapacitated,
    direction: Number(right) - Number(left), fire: held(controls.fire) };
}

/** Cover is attached to the actor's current floor and depth, never another storey. */
export function findPlayerCoverV124(actor, covers = []) {
  if (!actor || actor.climbing || actor.inVehicle || actor.ventTransit || actor.grounded === false) return null;
  const footY = finite(actor.y) + finite(actor.h, 92);
  const centerX = finite(actor.x) + finite(actor.w, 42) / 2;
  return covers.filter(cover => {
    if (!cover || cover.destroyed || !(cover.w > 0) || !(cover.h >= 28)) return false;
    if (![cover.x, cover.y, cover.w, cover.h].every(Number.isFinite)) return false;
    if (Math.abs(footY - cover.y - cover.h) > 20) return false;
    if (Number.isFinite(actor.depth) && Number.isFinite(cover.depth) && Math.abs(actor.depth - cover.depth) > 0.2) return false;
    if (actor.roomId && cover.roomId && actor.roomId !== cover.roomId) return false;
    return centerX >= cover.x - actor.w / 2 - 12 && centerX <= cover.x + cover.w + actor.w / 2 + 12;
  }).sort((a, b) => Math.abs(centerX - a.x - a.w / 2) - Math.abs(centerX - b.x - b.w / 2))[0] || null;
}

export function resolvePlayerCoverV124(actor, cover, aim = {}, { fire = false, busy = false } = {}) {
  if (!cover || !actor.crouching || !actor.grounded || actor.climbing || actor.inVehicle || actor.ventTransit || actor.downed) return null;
  const side = actor.x + actor.w / 2 <= cover.x + cover.w / 2 ? -1 : 1;
  const low = cover.h <= actor.h * 0.72;
  const toward = finite(aim.x, actor.facing) * -side > 0.2 || finite(aim.y) < -0.2;
  const peeking = low && toward && !busy && !actor.reloading && (actor.aimingV124 || fire);
  const shoulderY = actor.y + actor.h * 51 / 92;
  return { id: cover.id || null, x: cover.x, y: cover.y, w: cover.w, h: cover.h, side,
    low, peeking, peekRise: peeking ? clamp(shoulderY - (cover.y - 9), 0, 32) : 0 };
}

/** Protection requires a known shot travelling through the obstacle. Contact,
 * rear attacks, blast, hazards, peeking and stale cover never gain mitigation. */
export function playerCoverProtectionV124(actor, cover, options = {}) {
  if (!actor?.inCover || !actor.crouching || !cover || options.bypassCover
    || actor.coverV124?.peeking || options.attackKind !== 'projectile') return 0;
  const x = options.sourceX, y = options.sourceY;
  if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
  const center = actor.x + actor.w / 2;
  const side = center <= cover.x + cover.w / 2 ? -1 : 1;
  if ((x - center) * -side <= 0) return 0;
  let displacement = { x: center - x, y: actor.y + actor.h * 0.7 - y };
  const projectile = options.projectileV124;
  if (projectile) {
    // A known projectile must retain its actual flight direction. A ray aimed
    // at the torso would turn an overhead horizontal shot into a covered one.
    if (!Number.isFinite(projectile.vx) || !Number.isFinite(projectile.vy) || projectile.vx === 0) return 0;
    const travel = (center - x) / projectile.vx;
    if (!Number.isFinite(travel) || travel < 0) return 0;
    displacement = { x: center - x, y: projectile.vy * travel };
  }
  const contact = sweepProjectileAabbV83({ x, y, w: 0, h: 0 }, displacement, cover);
  return contact ? 0.65 : 0;
}

export function playerMovementPresentationV124(actor, input = {}) {
  const velocity = finite(actor.vx), speed = Math.abs(velocity);
  const direction = speed > 2 ? Math.sign(velocity) : 0;
  const gait = actor.climbing ? 'climb' : !actor.grounded ? 'airborne' : speed < 3 ? 'idle'
    : actor.crouching ? 'crouch' : direction !== actor.facing && actor.aimingV124 ? 'backpedal'
      : speed < 180 || input.magnitude < 0.75 ? 'walk' : 'run';
  return { gait, direction, speed };
}

/** A long barrel pressed into a thin wall must not spawn its round beyond it. */
export function constrainPlayerMuzzleV124(engine, actor, aim, muzzle) {
  if (actor?.inVehicle || !muzzle || !Number.isFinite(muzzle.pivotX) || !Number.isFinite(muzzle.pivotY)) return muzzle;
  const origin = { x: muzzle.pivotX, y: muzzle.pivotY, w: 2, h: 2 };
  const displacement = { x: muzzle.x - origin.x, y: muzzle.y - origin.y };
  const hit = firstProjectileObstacleV83(origin, displacement, { walls: [...(engine.walls || []), ...(engine.covers || [])],
    doors: engine.closedDoorColliders?.() || engine.doors || [], platforms: engine.platforms || [] });
  if (!hit) return muzzle;
  return { ...muzzle, x: hit.x - aim.x * 2, y: hit.y - aim.y * 2, obstructedV124: true };
}

/** The aiming cue uses the same muzzle and obstacle query as the shot. */
export function getPlayerAimGuideV124(engine, actor) {
  if (!actor?.alive || actor.inVehicle || actor.climbing || actor.ventTransit
    || !actor.aimingV124 || engine.isFieldActionBusyV124?.(actor) || engine.isPlaceableBusyV86?.(actor)) return null;
  const aim = actor.combatAimV83;
  if (!aim) return null;
  const muzzle = engine.resolvePlayerMuzzleV124?.(actor, aim) || resolveCombatMuzzleV83(actor, aim);
  const range = 230;
  const world = { walls: [...(engine.walls || []), ...(engine.covers || [])],
    doors: engine.closedDoorColliders?.() || engine.doors || [], platforms: engine.platforms || [] };
  const contact = firstProjectileObstacleV83({ x: muzzle.x, y: muzzle.y, w: 2, h: 2 }, { x: aim.x * range, y: aim.y * range }, world);
  const travel = muzzle.obstructedV124 ? 0 : contact ? Math.max(0, contact.t * range - 3) : range;
  return { x: muzzle.x, y: muzzle.y, endX: muzzle.x + aim.x * travel, endY: muzzle.y + aim.y * travel,
    blocked: Boolean(contact || muzzle.obstructedV124), peeking: Boolean(actor.coverV124?.peeking) };
}

export function drawPlayerAimGuideV124(engine, ctx, actor) {
  const guide = getPlayerAimGuideV124(engine, actor);
  if (!guide) return;
  ctx.save();
  ctx.strokeStyle = guide.blocked ? '#edb279' : '#8fceaf';
  ctx.lineWidth = 1.3; ctx.globalAlpha = 0.48;
  ctx.setLineDash?.([4, 9]);
  ctx.beginPath(); ctx.moveTo(guide.x, guide.y); ctx.lineTo(guide.endX, guide.endY); ctx.stroke();
  ctx.setLineDash?.([]); ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(guide.endX - 5, guide.endY); ctx.lineTo(guide.endX + 5, guide.endY);
  ctx.moveTo(guide.endX, guide.endY - 5); ctx.lineTo(guide.endX, guide.endY + 5); ctx.stroke();
  ctx.restore();
}
