import { HUMAN_GAIT_PROFILES_V133, humanGaitKindV133, humanGaitProfileV136, humanGaitStrideV133 } from './player-gait-v133.js';
import { PLAYER_VISUAL_CONTRACT_V81 } from './player-visual-contract-v81.js';
import { PLAYER_MODULAR_RIG_ANCHORS_V126, resolvePlayerModularRigV126 } from './player-modular-rig-v126.js';
import { solvePlayerArmIKV125, playerBodyRigImageReadyV125 } from './player-body-rig-v125.js';
import { buildPlayerArticulatedLowerLayersV128 } from './player-transit-rig-v128.js';
import { HUMAN_LEG_DIMENSIONS_V136, HUMAN_PELVIS_HEIGHT_V136, humanFootSwingV136, humanFootTravelV136, humanMotionEnvelopeV136,
  smoothHumanStepV136 } from './human-motion-v136.js';
import { PLAYER_HUMAN_PROPORTIONS_V160, getPlayerTorsoAxisV160 } from './player-human-proportions-v160.js';

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
  schema: 129, ...HUMAN_LEG_DIMENSIONS_V136, settleDuration: .12,
  stopRecoveryDurationV165: .16, stopRecoveryLiftV165: 6,
  walk: { stride: 176, ...HUMAN_GAIT_PROFILES_V133.walk },
  run: { stride: 216, ...HUMAN_GAIT_PROFILES_V133.run },
  crouch: { stride: 80, ...HUMAN_GAIT_PROFILES_V133.crouch },
  artStatus: 'independent-pelvis-thigh-shin-boot-parts'
});
const C = PLAYER_LOCOMOTION_PRESENTATION_V129;

// Integrate only the airborne part of a cycle. A change of stride must never
// move a planted boot; its horizontal correction can disappear on the next
// swing, including when the operator walks backwards or reverses direction.
const swingIntegral = (cycles, duty) => Math.floor(cycles) * (1 - duty)
  + Math.max(0, mod(cycles) - duty);
function advanceGaitTransition(previous, cycles, distance) {
  if (!previous?.gaitTransition) return null;
  const profile = { ...C[previous.gait], duty: previous.duty ?? C[previous.gait].duty }, feet = {};
  for (const side of ['near', 'far']) {
    const entry = previous.gaitTransition.feet[side], phaseOffset = side === 'far' ? .5 : 0;
    const swingTravel = entry.swingTravel + Math.abs(swingIntegral(cycles + phaseOffset, profile.duty)
      - swingIntegral(previous.cycles + phaseOffset, profile.duty)) * previous.stride;
    feet[side] = { ...entry, swingTravel: entry.swingSpan - swingTravel < 1e-6 ? Math.max(entry.swingSpan, swingTravel) : swingTravel, travel: entry.travel + distance };
  }
  return { feet };
}

function stepShape(state, side, scale, crouching, staticAction) {
  const named = C[crouching ? 'crouch' : state.gait];
  const profile = { ...named, duty: state.duty ?? named.duty, lift: state.footLift ?? named.lift };
  const phase = mod(state.cycles + (side === 'far' ? .5 : 0));
  const stride = Number.isFinite(state.stride) && state.stride > 0 ? state.stride : profile.stride * scale, swinging = phase >= profile.duty;
  const swing = swinging ? (phase - profile.duty) / (1 - profile.duty) : 0;
  const hasStride = state.hasWalked && !staticAction;
  const settle = state.moving ? 1 : 1 - smoothHumanStepV136(state.settleProgress);
  const entrance = smoothHumanStepV136(state.entrance / (stride * .25));
  const freeFoot = humanFootSwingV136(swing, profile.duty, stride);
  // World contact phase runs backwards when travelling left. Its asymmetric
  // toe-clearance arc must follow the travelled direction, while horizontal
  // targets retain their exact world-space contact trajectory.
  const recovery = (state.direction ?? state.facing ?? 1) < 0
    ? humanFootSwingV136(1-swing, profile.duty, stride) : freeFoot;
  let lift = hasStride && swinging ? recovery.liftWeight * profile.lift * scale * settle * entrance : 0;
  let offset = !hasStride ? 0 : swinging
    ? freeFoot.offset
    : (profile.duty / 2 - phase) * stride;
  let angle = lift > 0 ? -.15 * recovery.rollWeight * settle * entrance : 0;
  const correction = hasStride && state.gaitTransition?.feet[side];
  if (correction) {
    offset += correction.offset * (1 - smooth(correction.swingTravel / correction.swingSpan));
    const weight = (1 - smooth(correction.travel / (stride * .25))) * settle;
    lift = Math.max(0, lift + correction.lift * weight);
    angle += correction.angle * weight;
  }
  if (hasStride && Number.isFinite(state.stopOffsets?.[side])) offset = state.stopOffsets[side];
  const stopRecovery = hasStride && state.stopRecoveryV165?.side === side ? state.stopRecoveryV165 : null;
  const recoveryProgress = stopRecovery ? clamp((state.time - stopRecovery.startedAt) / C.stopRecoveryDurationV165) : 1;
  const recovering = Boolean(stopRecovery && recoveryProgress < 1);
  if (stopRecovery) {
    // One real stop may finish with a wide free boot frozen behind the body.
    // Release that foot, clear the deck, then place it beneath the operator.
    // The other contact is untouched; this is one simulation-owned adjustment,
    // never render-clock walking, a moving collision box or a sliding shoe.
    const travel = humanFootTravelV136(recoveryProgress);
    // This adjustment has its own short160ms duration. The ordinary gait's
    // early-clearance arc reached the full three world pixels in16ms here,
    // pulling the support-owned pelvis upward by more than one pixel/frame.
    // A single symmetric C2 pulse retains its clearance and duration while
    // leaving zero vertical velocity and acceleration at both contacts.
    const liftPulse = 64 * recoveryProgress ** 3 * (1 - recoveryProgress) ** 3;
    offset = mix(stopRecovery.from.offset, stopRecovery.targetOffset, travel);
    lift = stopRecovery.from.lift * (1 - smoothHumanStepV136(recoveryProgress))
      + C.stopRecoveryLiftV165 * scale * liftPulse;
    angle = stopRecovery.from.angle * (1 - smoothHumanStepV136(recoveryProgress));
  }
  // During a speed blend an inherited clearance and the new free-foot arc
  // overlap. They cannot add two separate knee lifts to the same real boot.
  lift = clamp(lift, 0, C.run.lift * scale);
  // A changing gait can leave a small ankle roll after the free foot has
  // nearly touched down. Bound it by its real clearance so the heel/toe
  // cannot penetrate the deck while the contact point remains truthful.
  const rollLimit = Math.asin(clamp(lift / ((angle < 0 ? 19 : 14) * scale)));
  angle = clamp(angle, -rollLimit, rollLimit);
  return { phase, swing, lift, offset, angle, settle, swinging, hasStride, recovering, recoveryProgress };
}

const activeGait = humanGaitKindV133;
function groundMotion(actor) {
  return actor?.alive !== false && !actor?.downed && actor?.grounded === true
    && !actor?.climbing && !actor?.inVehicle && !actor?.ventTransit && !actor?.vehicleAccessPhase
    // Keep observing the last real centimeters of acceleration/deceleration.
    // The upper atlas may stay neutral below its pose threshold, but freezing
    // this contact phase at 12px/s made planted boots slide with the actor.
    && Math.abs(finite(actor?.vx)) > 1e-6;
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
    || previous.surface !== surface || now < previous.time
    || Math.hypot(actor.x - previous.x, actor.y - previous.y) > 160;
  const observed = discontinuity ? null : previous;
  const headingChanged = Boolean(observed && observed.facing !== facing);
  // A profile turn exchanges the two depth-labelled legs. Relabel their
  // phase and any pending contact correction together instead of starting a
  // neutral stride, or pinning the toe of a reflected boot and forcing the
  // pelvis down. The ankles keep their world positions while each boot pivots
  // around its own ankle. This half cycle is a label swap, never travelled
  // distance or an invented footstep.
  const prior = headingChanged ? { ...observed, facing, cycles: observed.cycles + .5,
    phase: mod(observed.cycles + .5),
    stopOffsets: observed.stopOffsets ? { near: observed.stopOffsets.far, far: observed.stopOffsets.near } : null,
    gaitTransition: observed.gaitTransition ? { ...observed.gaitTransition,
      feet: { near: observed.gaitTransition.feet.far, far: observed.gaitTransition.feet.near } } : null,
    stopRecoveryV165: observed.stopRecoveryV165 ? { ...observed.stopRecoveryV165,
      side: observed.stopRecoveryV165.side === 'near' ? 'far' : 'near' } : null } : observed;
  if (prior && now === prior.time && actor.x === prior.x && actor.y === prior.y
    && !headingChanged && Boolean(actor.crouching) === prior.crouching
    && (actor.grounded === true) === prior.grounded) return prior;
  const desiredGait = activeGait(actor);
  // A stopped run keeps its phase and contacts; merely releasing sprint does
  // not swap to another stride before the remaining boot has met the floor.
  const requested = groundMotion(actor);
  const gait = requested || !prior || Boolean(actor.crouching) !== prior.crouching ? desiredGait : prior.gait;
  const profile = !requested && prior && Boolean(actor.crouching) === prior.crouching
    ? { ...C[gait], duty: prior.duty ?? C[gait].duty, lift: prior.footLift ?? C[gait].lift }
    : humanGaitProfileV136(actor, gait);
  const stride = !requested && prior && Boolean(actor.crouching) === prior.crouching
    ? prior.stride : humanGaitStrideV133(actor, gait, scale);
  const dx = prior ? actor.x - prior.x : 0;
  const moved = requested && Math.abs(dx) > 1e-7;
  const relabelSameObservation = headingChanged && now === prior.time && dx === 0
    && actor.y === prior.y && Boolean(actor.crouching) === prior.crouching
    && (actor.grounded === true) === prior.grounded;
  const striding = moved && Math.abs(finite(actor.vx)) > (actor.crouching ? 6 : 8)
    || Boolean(relabelSameObservation && requested && prior.moving);
  const postureChanged = prior && Boolean(actor.crouching) !== prior.crouching;
  // Support occupies [0,duty] in either direction. Keep its centre aligned
  // while acceleration shortens support; otherwise the first left step holds
  // its old boot for an extra half of the removed duty and overextends the
  // other leg. The transition below preserves the existing world contacts.
  const supportShift = prior && striding ? (profile.duty - (prior.duty ?? C[prior.gait].duty)) / 2 : 0;
  const cycles = !prior || postureChanged ? profile.duty / 2
    : prior.cycles + (striding ? dx / stride : 0) + supportShift;
  const distance = (prior?.distance || 0) + (moved ? Math.abs(dx) : 0);
  const elapsed = Math.max(0, now - (prior?.time ?? now));
  const settle = striding ? 0 : Math.min(C.settleDuration, (prior?.settle ?? C.settleDuration) + elapsed);
  const entrance = striding ? (prior?.settle >= C.settleDuration ? 0 : finite(prior?.entrance)) + Math.abs(dx)
    : finite(prior?.entrance);
  const next = { schema: 129, context, surface, time: now, x: actor.x, y: actor.y, facing,
    direction: Math.sign(dx || finite(actor.vx)) || prior?.direction || facing,
    grounded: actor.grounded === true, crouching: Boolean(actor.crouching), gait,
    cycles, phase: mod(cycles), stride, duty: profile.duty, footLift: profile.lift, distance, entrance,
    hasWalked: Boolean(prior?.hasWalked || moved), moving: striding, stopOffsets: null,
    stopRecoveryV165: null,
    settle, settleProgress: clamp(settle / C.settleDuration),
    source: 'observed-ground-displacement',
    headingChangeV165: headingChanged ? { from: observed.facing, to: facing, at: now,
      retainedTravel: prior.distance, retainedGroundHistory: prior.grounded && actor.grounded === true && !postureChanged,
      depthSidesSwapped: true, contact: 'ankle-pivot-not-fixed-toe' }
      : prior?.headingChangeV165 || null,
    gaitTransition: prior && !postureChanged ? advanceGaitTransition(prior, cycles, moved ? Math.abs(dx) : 0) : null };
  if (prior?.hasWalked && !striding && !postureChanged) {
    // The simulation's exponential braking has a long subpixel tail. Lower
    // the free boot promptly, while retaining each reached world contact and
    // still observing that final physical displacement. Platforms with zero
    // self velocity carry the whole contact frame instead of spending steps.
    next.stopOffsets = Object.fromEntries(['near', 'far'].map(side => [side,
      (prior.stopOffsets?.[side] ?? stepShape(prior, side, scale, prior.crouching, false).offset)
        - (moved ? dx : 0)]));
  }
  const continuedRecovery = prior?.stopRecoveryV165 && !postureChanged && next.grounded
    ? { ...prior.stopRecoveryV165,
      from: { ...prior.stopRecoveryV165.from,
        offset: prior.stopRecoveryV165.from.offset - (moved ? dx : 0) },
      targetOffset: prior.stopRecoveryV165.targetOffset - (moved ? dx : 0) } : null;
  if (!striding && next.stopOffsets && continuedRecovery) {
    if (now - continuedRecovery.startedAt >= C.stopRecoveryDurationV165) {
      next.stopOffsets[continuedRecovery.side] = continuedRecovery.targetOffset;
    } else next.stopRecoveryV165 = continuedRecovery;
  }
  if (prior?.moving && elapsed <= .25 && !striding && !postureChanged && !next.crouching && next.grounded && next.stopOffsets
    && actor.alive !== false && !actor.downed && !actor.climbing && !actor.inVehicle
    && !actor.ventTransit && !actor.vehicleAccessPhase) {
    const shapes = Object.fromEntries(['near', 'far'].map(side => [side,
      stepShape({ ...next, stopRecoveryV165: null }, side, scale, next.crouching, false)]));
    const free = ['near', 'far'].filter(side => shapes[side].lift > 1e-5);
    const candidates = free.length ? free : ['near', 'far'];
    const side = candidates.reduce((best, side) => Math.abs(shapes[side].offset)
      > Math.abs(shapes[best].offset) ? side : best, candidates[0]);
    if (Math.abs(shapes[side].offset) > 4 * scale) next.stopRecoveryV165 = {
      side, startedAt: now, from: { offset: shapes[side].offset,
        lift: shapes[side].lift, angle: shapes[side].angle }, targetOffset: 0 };
  }
  if (prior && !postureChanged && (gait !== prior.gait || Math.abs(stride - prior.stride) > 1e-7
    || Math.abs(profile.duty - (prior.duty ?? C[prior.gait].duty)) > 1e-7 || prior.stopOffsets && striding)) {
    const oldCycles = prior.cycles + (moved ? dx / prior.stride : 0);
    const continued = { ...next, gait: prior.gait, stride: prior.stride,
      duty: prior.duty ?? C[prior.gait].duty, footLift: prior.footLift ?? C[prior.gait].lift, cycles: oldCycles,
      stopOffsets: prior.stopOffsets ? Object.fromEntries(Object.entries(prior.stopOffsets).map(([side, offset]) => [side, offset - (moved ? dx : 0)])) : null,
      stopRecoveryV165: continuedRecovery,
      gaitTransition: advanceGaitTransition(prior, oldCycles, moved ? Math.abs(dx) : 0) };
    const feet = {};
    for (const side of ['near', 'far']) {
      const old = stepShape(continued, side, scale, next.crouching, false);
      const current = stepShape({ ...next, gaitTransition: null }, side, scale, next.crouching, false);
      const direction = Math.sign(dx || actor.vx) || 1;
      const remaining = current.swinging
        ? direction > 0 ? 1 - current.phase : current.phase - profile.duty
        : 1 - profile.duty;
      feet[side] = { offset: old.offset - current.offset,
        lift: (old.lift - current.lift) / (current.settle || 1),
        angle: (old.angle - current.angle) / (current.settle || 1),
        travel: 0, swingTravel: 0, swingSpan: Math.max(1e-6, remaining * stride) };
    }
    next.gaitTransition = { feet };
  }
  if (next.gaitTransition && prior && !prior.moving && moved && next.grounded && !postureChanged) {
    // A stopped swing foot can already have settled onto the deck. If the
    // first resumed step crosses its landing phase, keep that reached contact
    // instead of spending the old transition correction under a planted boot.
    for (const side of ['near', 'far']) {
      const old = stepShape(prior, side, scale, next.crouching, false);
      const current = stepShape(next, side, scale, next.crouching, false);
      if (old.lift > 1e-7 || current.lift > 1e-7 || current.swinging) continue;
      const native = stepShape({ ...next, gaitTransition: null }, side, scale, next.crouching, false);
      next.gaitTransition.feet[side] = { ...next.gaitTransition.feet[side],
        offset: old.offset - dx - native.offset, swingTravel: 0,
        swingSpan: (1 - profile.duty) * stride };
    }
  }
  return freeze(next);
}

function fallbackState(actor, bodyRig) {
  const gait = bodyRig.crouching ? 'crouch' : activeGait(actor), profile = humanGaitProfileV136(actor, gait);
  const stride = humanGaitStrideV133(actor, gait, bodyRig.scale);
  const distance = Math.max(0, finite(actor.weaponRigMotionV125?.distance));
  const moving = groundMotion(actor);
  // Existing V125 distances are also real simulation observations. They make
  // the decorator usable in a one-shot preview without requiring a draw-time
  // clock, a second actor or a new mutable animation object.
  const cycles = profile.duty / 2 + (moving ? distance * Math.sign(actor.vx) / stride : 0);
  return { schema: 129, gait, cycles, phase: mod(cycles), stride, duty: profile.duty, footLift: profile.lift, distance,
    direction: Math.sign(finite(actor.vx)) || bodyRig.facing,
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
  const { phase, swing, lift, offset, angle, swinging, hasStride, recovering, recoveryProgress }
    = stepShape(state, side, scale, crouching, staticAction);
  const sole = point(center + facing * (PLAYER_HUMAN_PROPORTIONS_V160.hips[side]
    + PLAYER_HUMAN_PROPORTIONS_V160.soleFromAnkle) * scale + offset, floor - lift);
  return { point: sole, planted: !recovering && lift < 1e-7 && (!state.moving || !swinging || !hasStride),
    phase, swing, lift, recovering, recoveryProgress, support: 'ground', ...footFromSole(sole, scale, facing, angle) };
}

/** Decorate an already selected V125/V127 body. A support-owned rigid weight
 * transfer moves its complete upper body and authoritative weapon together;
 * appearance choices never alter that geometry, bones, feet or collision.
 * Transit V128 keeps its own ladder, casualty and revival contacts. */
export function resolvePlayerLocomotionRigV129({ actor, bodyRig, appearance = actor?.appearanceV126,
  images = null, locomotionState = null, legDefinitions = {}, groundSupport = null } = {}) {
  // Weapon resolution and drawing both call this decorator. Always solve from
  // the same immutable native frame; a second draw cannot apply the weight
  // transfer again or gradually move the thorax away from its own legs.
  bodyRig = bodyRig?.baseBodyRigV160 || bodyRig;
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
  const motionEnvelope = humanMotionEnvelopeV136(state, state.stride);
  const pelvisBob = grounded && !crouching && !staticAction ? .35 * (1 - Math.cos(state.cycles * Math.PI * 4)) * motionEnvelope : 0;
  const hipDrop = (crouching ? 6 : grounded && state.moving ? 6 : 4) + pelvisBob;
  const hipOffset = PLAYER_HUMAN_PROPORTIONS_V160.hips;
  const hips = { near: point(waist.x + f * hipOffset.near * s, waist.y + hipDrop * s),
    far: point(waist.x + f * hipOffset.far * s, waist.y + hipDrop * s) };
  if (grounded && !staticAction) {
    // Keep the articulated skeleton over its physical foot axis; the pelvis
    // panel still connects to the actual authored belt above it. Anatomical
    // support below can lower these hips only as far as real leg reach needs.
    const center = actor.x + actor.w / 2;
    const height = crouching ? HUMAN_PELVIS_HEIGHT_V136.crouching : HUMAN_PELVIS_HEIGHT_V136.standing;
    hips.near = point(center + f * hipOffset.near * s, floor - height * s + pelvisBob * s);
    hips.far = point(center + f * hipOffset.far * s, hips.near.y);
  }
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
    if (!crouching && !staticAction && state.hasWalked) {
      const meanReach = ['near', 'far'].reduce((sum, side) =>
        sum + requestedFeet[side].foot.ankle.x - hips[side].x, 0) / 2;
      const transfer = 6 * s * Math.tanh(meanReach / (6 * s)) * motionEnvelope;
      hips.near.x += transfer; hips.far.x += transfer;
    }
    // Stopping midway through a wide stride retains both actual contacts.
    // Settle the hidden pelvis within the belt instead of pulling either
    // boot off the deck or moving the accepted-shot torso above it.
    const reach = (C.upperLeg + C.lowerLeg) * s - 1e-4;
    const supportY = Math.max(hips.near.y, ...['near', 'far'].map(side => {
      const foot = requestedFeet[side].foot;
      const dx = foot.ankle.x - hips[side].x;
      return foot.ankle.y - Math.sqrt(Math.max(0, reach * reach - dx * dx));
    }));
    const pelvisY = grounded && !staticAction ? supportY : Math.min(waist.y + 28 * s, supportY);
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
      clearanceAdjusted,
      stopRecoveryV165: contact.recovering ? { progress: contact.recoveryProgress } : null,
      pivotingV165: Boolean(planted && state.headingChangeV165 && state.headingChangeV165.at === state.time
        && state.headingChangeV165.retainedGroundHistory) };
  }
  // Keep one body above the solved support. V142 moved only the pelvis under
  // a fixed thorax and hid the mismatch with a jacket clip. The same weight
  // transfer now carries chest, neck, shoulders, arms and weapon together.
  // The original foot pivot, collision and actual leg contacts stay fixed.
  const weightTransfer = grounded && !staticAction ? point(
    (hips.near.x + hips.far.x) / 2 - (actor.x + actor.w / 2),
    hips.near.y - (floor - (crouching ? HUMAN_PELVIS_HEIGHT_V136.crouching : HUMAN_PELVIS_HEIGHT_V136.standing) * s)
  ) : point(0, 0);
  const translated = p => point(p.x + weightTransfer.x, p.y + weightTransfer.y);
  const transfersWeight = Math.abs(weightTransfer.x) + Math.abs(weightTransfer.y) > 1e-9;
  const bodyMatrix = transfersWeight ? { ...bodyRig.matrix, e: bodyRig.matrix.e + weightTransfer.x,
    f: bodyRig.matrix.f + weightTransfer.y } : bodyRig.matrix;
  const bodyShoulders = transfersWeight
    ? Object.fromEntries(Object.entries(bodyRig.shoulders).map(([side, p]) => [side, translated(p)])) : bodyRig.shoulders;
  const registeredWaist = translated(waist);
  const anatomicalBelt = grounded && !staticAction
    ? point(registeredWaist.x, Math.min(registeredWaist.y, hips.near.y - 12 * s)) : waist;
  const lower = buildPlayerArticulatedLowerLayersV128({ waist: anatomicalBelt, hips, legs, scale: s, facing: f,
    legDefinitions, pelvisBelt: grounded && !staticAction,
    projectedHipSpread: PLAYER_HUMAN_PROPORTIONS_V160.sourceHipSpreadRatio });
  const relaxedTravel = grounded && !crouching && bodyRig.moving && bodyRig.atlas === 'locomotion'
    && !bodyRig.actionV127 && !actor.aimingV124 && !actor.aiming && !actor.reloading;
  // A service pocket is sewn to the trouser leg, not to an empty point below
  // the belt. A fixed lowered point left the cloth whenever that thigh swung
  // away during moving reloads. Bind it to the same rigid femur as its pixels.
  const pocketLeg = legs.far, pocketFraction = PLAYER_HUMAN_PROPORTIONS_V160.servicePouchThighFraction;
  const servicePouch = point(pocketLeg.hip.x + (pocketLeg.knee.x - pocketLeg.hip.x) * pocketFraction,
    pocketLeg.hip.y + (pocketLeg.knee.y - pocketLeg.hip.y) * pocketFraction);
  const detail = { schema: 129, mode: !grounded ? 'airborne' : staticAction ? bodyRig.stance
    : state.moving ? crouching ? 'crouch-move' : state.gait : state.settleProgress < 1 || state.stopRecoveryV165 ? 'settling' : 'idle',
    source: state.source, phase: mod(state.cycles), stride: state.stride,
    presentationV133: { schema: 133, cadenceSource: 'supported-stature-and-world-distance',
      stepsPerSecond: state.moving ? 2 * Math.abs(finite(actor.vx)) / state.stride : 0,
      standingHeight: 193 * s, footLiftLimit: (state.gaitTransition ? C.run.lift : state.footLift ?? C[state.gait].lift) * s, pelvisBob: pelvisBob * s },
    presentationV136: { schema: 136, swing: 'world-space-contact-velocity-ramp', lift: 'zero-contact-velocity-and-acceleration',
      pelvis: grounded && !staticAction ? 'continuous-physical-foot-axis' : 'authored-action', motionEnvelope,
      upperPosture: relaxedTravel ? 'upright-travel' : 'authored-action',
      duty: state.duty ?? C[state.gait].duty,
      flight: grounded && !Object.values(contacts.feet).some(foot => foot.planted) },
    alignmentV142: { schema: 142, belt: anatomicalBelt, authoredLowerSeam: registeredWaist,
      hipAxis: point((hips.near.x + hips.far.x) / 2, hips.near.y),
      waistToHip: hips.near.y - anatomicalBelt.y,
      source: grounded && !staticAction ? 'solved-hip-line-with-shared-upper-body' : 'authored-action' },
    alignmentV160: { schema: 160, weightTransfer,
      projectedHipSpan: Math.abs(hips.far.x - hips.near.x),
      upperBodySource: 'complete-native-upper-pose-with-shared-weight-transfer',
      bodyAndWeaponShareShoulders: true,
      pouchAttachment: { part: 'far-thigh', fraction: pocketFraction, point: servicePouch } },
    headingV165: state.headingChangeV165 ? { ...state.headingChangeV165,
      active: state.headingChangeV165.at === state.time,
      soleMidpointFixedDuringPivot: false } : null,
    stopRecoveryV165: state.stopRecoveryV165 ? { ...state.stopRecoveryV165,
      duration: C.stopRecoveryDurationV165, progress: clamp((state.time - state.stopRecoveryV165.startedAt) / C.stopRecoveryDurationV165),
      owner: 'single-observed-simulation-stop', collisionMoved: false } : null, legs, contacts };
  const decorated = { ...bodyRig, baseBodyRigV160: bodyRig, matrix: bodyMatrix,
    torsoAxisV160: bodyRig.torsoAxisV160 || getPlayerTorsoAxisV160(bodyMatrix, anatomical, f),
    shoulders: bodyShoulders, neutralGrip: transfersWeight ? translated(bodyRig.neutralGrip) : bodyRig.neutralGrip,
    pouch: servicePouch,
    sprite: transfersWeight ? { ...bodyRig.sprite, x: bodyRig.sprite.x + weightTransfer.x,
      y: bodyRig.sprite.y + weightTransfer.y } : bodyRig.sprite,
    weightTransferV160: weightTransfer,
    ...(grounded && !staticAction ? { modularBeltV142: anatomicalBelt } : {}),
    modularLowerLayersV128: lower, locomotionV129: detail };
  const modular = resolvePlayerModularRigV126({ bodyRig: decorated, appearance, images });
  const requiredAssets = modular.requiredAssets || [];
  const missingAssets = requiredAssets.filter(asset => !playerBodyRigImageReadyV125(imageFrom(images, asset.imageKey), asset));
  const ready = modular.eligible && modular.ready && !missingAssets.length;
  return freeze({ ...detail, eligible: modular.eligible, ready,
    reason: !modular.eligible ? modular.reason : !ready ? 'locomotion-images-unavailable' : null,
    state, bodyRig: decorated, requiredAssets, missingAssets });
}
