import { PLAYER_VISUAL_CONTRACT_V81 } from './player-visual-contract-v81.js';
import { PLAYER_MODULAR_RIG_ANCHORS_V126, resolvePlayerModularRigV126 } from './player-modular-rig-v126.js';
import { solvePlayerArmIKV125, playerBodyRigImageReadyV125 } from './player-body-rig-v125.js';
import { buildPlayerArticulatedLowerLayersV128 } from './player-transit-rig-v128.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, finite(value, low)));
const point = (x, y) => ({ x, y });
const validPoint = value => Number.isFinite(value?.x) && Number.isFinite(value?.y);
const facingOf = actor => finite(actor?.facing, 1) < 0 ? -1 : 1;
const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
const mix = (a, b, p) => a + (b - a) * p;
const mod = value => (value % 1 + 1) % 1;
const transform = (m, p) => point(m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f);
const imageFrom = (images, key) => images?.get?.(key) || images?.[key] || null;
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};

/** World distance, rather than elapsed render time, controls the gait. Widths
 * and bone lengths are canonical Echo9 pixels and scale with its existing
 * surface contract. No option changes an actor's collision or firing rig. */
export const PLAYER_LOCOMOTION_PRESENTATION_V129 = freeze({
  schema: 129, upperLeg: 44, lowerLeg: 43, settleDuration: .12,
  walk: { stride: 108, duty: .58, lift: 17 },
  run: { stride: 124, duty: .48, lift: 23 },
  crouch: { stride: 40, duty: .68, lift: 7 },
  artStatus: 'independent-pelvis-thigh-shin-boot-parts'
});
const C = PLAYER_LOCOMOTION_PRESENTATION_V129;

function activeGait(actor) {
  if (actor?.crouching) return 'crouch';
  return actor?.movementV124?.gait === 'run' || Math.abs(finite(actor?.vx)) >= 265 ? 'run' : 'walk';
}
function groundMotion(actor) {
  return actor?.alive !== false && !actor?.downed && actor?.grounded === true
    && !actor?.climbing && !actor?.inVehicle && !actor?.ventTransit && !actor?.vehicleAccessPhase
    && Math.abs(finite(actor?.vx)) > (actor?.crouching ? 8 : 12);
}
function validActor(actor) {
  return actor && [actor.x, actor.y, actor.w, actor.h].every(Number.isFinite)
    && actor.w > 0 && actor.h > 0;
}

/** Observe once after real simulation. Repeated observations at the same
 * clock and coordinates are identical. Horizontal platform transport does
 * not produce steps; teleports, scene changes and resume start neutrally.
 * The final lifted foot settles once after stopping, using simulation time.
 * Drawing, snapshotting or a paused frame cannot advance that short settle. */
export function advancePlayerLocomotionStateV129(previous, actor, timeSeconds,
  { context = '', surface = 'mission' } = {}) {
  const contract = PLAYER_VISUAL_CONTRACT_V81.surfaces[surface];
  if (!validActor(actor) || !contract || !Number.isFinite(timeSeconds) || timeSeconds < 0) return null;
  const now = timeSeconds, facing = facingOf(actor), scale = contract.height / 256;
  const discontinuity = previous?.schema !== 129 || ![previous?.cycles,previous?.time,previous?.x,previous?.y].every(Number.isFinite)
    || !C[previous?.gait] || previous.context !== context
    || previous.surface !== surface || now < previous.time || previous.facing !== facing
    || Math.hypot(actor.x - previous.x, actor.y - previous.y) > 160;
  const prior = discontinuity ? null : previous;
  if (prior && now === prior.time && actor.x === prior.x && actor.y === prior.y
    && Boolean(actor.crouching) === prior.crouching && (actor.grounded === true) === prior.grounded) return prior;
  const desiredGait = activeGait(actor);
  // A stopped run keeps its phase and contacts; merely releasing sprint does
  // not swap to another stride before the remaining boot has met the floor.
  const requested = groundMotion(actor);
  const gait = requested || !prior || Boolean(actor.crouching) !== prior.crouching ? desiredGait : prior.gait;
  const profile = C[gait], stride = profile.stride * scale;
  const dx = prior ? actor.x - prior.x : 0;
  const moved = requested && Math.abs(dx) > 1e-7;
  const postureChanged = prior && Boolean(actor.crouching) !== prior.crouching;
  const cycles = !prior || postureChanged ? profile.duty / 2
    : prior.cycles + (moved ? dx / stride : 0);
  const distance = (prior?.distance || 0) + (moved ? Math.abs(dx) : 0);
  const elapsed = Math.max(0, now - (prior?.time ?? now));
  const settle = moved ? 0 : Math.min(C.settleDuration, (prior?.settle ?? C.settleDuration) + elapsed);
  const entrance = moved ? (prior?.settle >= C.settleDuration ? 0 : finite(prior?.entrance)) + Math.abs(dx)
    : finite(prior?.entrance);
  return freeze({ schema: 129, context, surface, time: now, x: actor.x, y: actor.y, facing,
    grounded: actor.grounded === true, crouching: Boolean(actor.crouching), gait,
    cycles, phase: mod(cycles), stride, distance, entrance,
    hasWalked: Boolean(prior?.hasWalked || moved), moving: moved,
    settle, settleProgress: clamp(settle / C.settleDuration),
    source: 'observed-ground-displacement' });
}

function fallbackState(actor, bodyRig) {
  const gait = bodyRig.crouching ? 'crouch' : activeGait(actor), profile = C[gait];
  const stride = profile.stride * bodyRig.scale;
  const distance = Math.max(0, finite(actor.weaponRigMotionV125?.distance));
  const moving = groundMotion(actor);
  // Existing V125 distances are also real simulation observations. They make
  // the decorator usable in a one-shot preview without requiring a draw-time
  // clock, a second actor or a new mutable animation object.
  const cycles = profile.duty / 2 + (moving ? distance * Math.sign(actor.vx) / stride : 0);
  return { schema: 129, gait, cycles, phase: mod(cycles), stride, distance,
    entrance: distance, hasWalked: moving && distance > 0, moving,
    settle: moving ? 0 : C.settleDuration, settleProgress: moving ? 0 : 1,
    source: 'recorded-ground-distance' };
}

function footFromSole(sole, scale, facing, angle = 0) {
  const rotate = (x, y) => point(facing * (Math.cos(angle) * x - Math.sin(angle) * y) * scale,
    (Math.sin(angle) * x + Math.cos(angle) * y) * scale);
  const bottom = rotate(9, 11), ankle = point(sole.x - bottom.x, sole.y - bottom.y);
  const fromAnkle = offset => point(ankle.x + offset.x, ankle.y + offset.y);
  return { ankle, sole, heel: fromAnkle(rotate(-10, 11)), toe: fromAnkle(rotate(23, 11)) };
}
function solveLeg(hip, foot, scale, facing) {
  const solved = solvePlayerArmIKV125(hip, foot.ankle,
    { upper: C.upperLeg * scale, fore: C.lowerLeg * scale }, -facing);
  const dx = solved.hand.x - foot.ankle.x, dy = solved.hand.y - foot.ankle.y;
  return { hip, knee: solved.elbow,
    ...Object.fromEntries(['ankle', 'sole', 'heel', 'toe'].map(key => [key,
      point(foot[key].x + dx, foot[key].y + dy)])),
    upper: solved.upper, lower: solved.fore, reachClamped: solved.reachClamped, reachError: solved.reachError };
}

function stepContact(actor, state, side, scale, facing, crouching, staticAction) {
  const floor = actor.y + actor.h, center = actor.x + actor.w / 2;
  const profile = C[crouching ? 'crouch' : state.gait];
  const phase = mod(state.cycles + (side === 'far' ? .5 : 0));
  const stride = profile.stride * scale, swinging = phase >= profile.duty;
  const swing = swinging ? (phase - profile.duty) / (1 - profile.duty) : 0;
  const hasStride = state.hasWalked && !staticAction;
  const settle = state.moving ? 1 : 1 - smooth(state.settleProgress);
  const entrance = smooth(state.entrance / (stride * .25));
  const lift = hasStride && swinging ? Math.sin(Math.PI * swing) * profile.lift * scale * settle * entrance : 0;
  const offset = !hasStride ? 0 : swinging
    ? mix(-profile.duty / 2 * stride, profile.duty / 2 * stride, smooth(swing))
    : (profile.duty / 2 - phase) * stride;
  const sole = point(center + facing * (side === 'near' ? 0 : 21) * scale + offset, floor - lift);
  const angle = lift > 0 ? -.15 * Math.sin(Math.PI * swing) * settle * entrance : 0;
  return { point: sole, planted: lift < 1e-7 && (!state.moving || !swinging || !hasStride),
    phase, swing, lift, support: 'ground', ...footFromSole(sole, scale, facing, angle) };
}

/** Decorate an already selected V125/V127 body, preserving every original
 * upper-body field by reference. Weapon affine, muzzle, hand targets, torso
 * matrix and hitbox therefore remain byte-for-byte their accepted values.
 * Transit V128 keeps its own ladder, casualty and revival contacts. */
export function resolvePlayerLocomotionRigV129({ actor, bodyRig, appearance = actor?.appearanceV126,
  images = null, locomotionState = null, legDefinitions = {}, groundSupport = null } = {}) {
  const anatomical = bodyRig?.modularAnchorsV127
    || PLAYER_MODULAR_RIG_ANCHORS_V126[bodyRig?.atlas]?.[bodyRig?.frame];
  const reason = !validActor(actor) ? 'invalid-actor' : !bodyRig?.eligible ? bodyRig?.reason || 'body-unavailable'
    : bodyRig.rigType !== 'echo9' || !anatomical || !validPoint(anatomical.waist)
      || !(bodyRig.scale > 0) || !bodyRig.matrix ? 'locomotion-body-unavailable'
      : actor.alive === false || actor.downed || actor.climbing || actor.inVehicle || actor.ventTransit
        || actor.vehicleAccessPhase || bodyRig.atlas === 'transit-v128' ? 'dedicated-transit' : null;
  if (reason) return freeze({ schema: 129, eligible: false, ready: false, reason, bodyRig,
    legs: null, contacts: null, requiredAssets: [], missingAssets: [] });
  const s = bodyRig.scale, f = bodyRig.facing, floor = actor.y + actor.h;
  const grounded = actor.grounded === true;
  const waist = transform(bodyRig.matrix, anatomical.waist);
  const crouching = Boolean(bodyRig.crouching || bodyRig.stance === 'working-kneel');
  const staticAction = Boolean(bodyRig.actionV127 && !bodyRig.moving);
  const state = locomotionState?.schema === 129 && Number.isFinite(locomotionState.cycles)
    && C[locomotionState.gait] ? locomotionState : fallbackState(actor, bodyRig);
  const hipDrop = crouching ? 6 : grounded && bodyRig.moving ? 7 : 4;
  const hips = { near: point(waist.x - f * 9 * s, waist.y + hipDrop * s),
    far: point(waist.x + f * 12 * s, waist.y + hipDrop * s) };
  const legs = {}, requestedFeet = {}, contacts = { floorY: grounded ? floor : null, feet: { near: null, far: null } };
  for (const side of ['near', 'far']) {
    let foot, contact;
    if (grounded) {
      contact = stepContact(actor, state, side, s, f, crouching, staticAction);
      foot = contact;
    } else {
      // Actual vertical velocity controls the tuck/extension, including the
      // airborne hurt or melee body. It grants no floor contact in mid-air.
      const extension = smooth((finite(actor.vy) + 80) / 240);
      const clearance = mix(side === 'near' ? 20 : 30, side === 'near' ? 3 : 8, extension);
      const sole = point(hips[side].x + f * (side === 'near' ? 12 : -8) * s, floor - clearance * s);
      foot = footFromSole(sole, s, f, mix(-.12, .04, extension));
      contact = { point: sole, planted: false, phase: null, swing: null,
        lift: clearance * s, support: null, ...foot };
    }
    requestedFeet[side] = { foot, contact };
  }
  if (grounded) {
    // Stopping midway through a wide stride retains both actual contacts.
    // Settle the hidden pelvis within the belt instead of pulling either
    // boot off the deck or moving the accepted-shot torso above it.
    const reach = (C.upperLeg + C.lowerLeg) * s - 1e-4;
    const supportY = Math.max(hips.near.y, ...['near', 'far'].map(side => {
      const foot = requestedFeet[side].foot;
      const dx = foot.ankle.x - hips[side].x;
      return foot.ankle.y - Math.sqrt(Math.max(0, reach * reach - dx * dx));
    }));
    const pelvisY = Math.min(waist.y + 24 * s, supportY);
    hips.near.y = hips.far.y = pelvisY;
  }
  for (const side of ['near', 'far']) {
    let { foot, contact } = requestedFeet[side];
    let leg = solveLeg(hips[side], foot, s, f), clearanceAdjusted = false;
    // The original authored crouch can put a knee close to the deck. Move a
    // too-deep free foot slightly forward, instead of stretching a shin,
    // moving the firing shoulder or claiming an impossible planted contact.
    if (grounded) for (let n = 0; n < 24 && leg.knee.y > floor - 6 * s; n++) {
      const sole = point(foot.sole.x + f * 2 * s, foot.sole.y);
      foot = footFromSole(sole, s, f); leg = solveLeg(hips[side], foot, s, f);
      clearanceAdjusted = true;
    }
    legs[side] = { ...leg, clearanceAdjusted };
    // A finite platform can end beneath a visual boot even while the actor's
    // hitbox is still grounded. Supplied collision segments certify only the
    // contact: they never pull a shoe inward or change phase/weapon geometry.
    // Null means a genuinely continuous floor (or an older caller without
    // segment data); [] explicitly means no support at this floor height.
    const supportConfirmed = !grounded ? false : !Array.isArray(groundSupport) ? null
      : groundSupport.some(segment => [segment?.left, segment?.right, segment?.y].every(Number.isFinite)
        && segment.right > segment.left && Math.abs(segment.y - leg.sole.y) <= .5
        && leg.sole.x >= segment.left - 1e-6 && leg.sole.x <= segment.right + 1e-6);
    const planted = contact.planted && !leg.reachClamped && !clearanceAdjusted && supportConfirmed !== false;
    contacts.feet[side] = { point: leg.sole, planted, phase: contact.phase, swing: contact.swing,
      support: supportConfirmed === false ? null : contact.support, supportConfirmed,
      lift: contact.lift, reachClamped: leg.reachClamped,
      clearanceAdjusted };
  }
  const lower = buildPlayerArticulatedLowerLayersV128({ waist, hips, legs, scale: s, facing: f, legDefinitions });
  const detail = { schema: 129, mode: !grounded ? 'airborne' : staticAction ? bodyRig.stance
    : state.moving ? crouching ? 'crouch-move' : state.gait : state.settleProgress < 1 ? 'settling' : 'idle',
    source: state.source, phase: mod(state.cycles), legs, contacts };
  const decorated = { ...bodyRig, modularLowerLayersV128: lower, locomotionV129: detail };
  const modular = resolvePlayerModularRigV126({ bodyRig: decorated, appearance, images });
  const requiredAssets = modular.requiredAssets || [];
  const missingAssets = requiredAssets.filter(asset => !playerBodyRigImageReadyV125(imageFrom(images, asset.imageKey), asset));
  const ready = modular.eligible && modular.ready && !missingAssets.length;
  return freeze({ ...detail, eligible: modular.eligible, ready,
    reason: !modular.eligible ? modular.reason : !ready ? 'locomotion-images-unavailable' : null,
    state, bodyRig: decorated, requiredAssets, missingAssets });
}
