/** Player presentation follows simulation observations, never the wall clock.
 * These are reviewed existing poses and small canvas transforms. This module
 * owns no collision, ammunition, damage, equipment or persistent game state.
 */
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, finite(value, min)));
const sign = value => finite(value, 1) < 0 ? -1 : 1;
const playerSheet = id => /^player\.echo9-marine\.(locomotion|combat|melee|interaction|tool-use)$/.test(String(id));
const movementClips = new Set(['walk-run', 'backpedal', 'crouch-move', 'climb']);
const locomotionClips = new Set(['idle', 'walk-run', 'backpedal', 'crouch', 'crouch-move', 'crouch-aim', 'climb', 'takeoff', 'rise', 'apex', 'fall', 'land']);
const actionClocks = Object.freeze({
  'primary-fire': 'v52FireClock', reload: 'reloadClock', hurt: 'v52HurtClock',
  'knife-attack': 'meleeClock', 'rifle-bash': 'meleeClock', 'melee-defense': 'meleeClock',
  'motion-tracker': 'toolUseClock', 'cutting-torch': 'toolUseClock', 'access-tuner': 'toolUseClock', 'maintenance-jack': 'toolUseClock',
  'control-use': 'interactionClock', 'ground-interact': 'interactionClock', 'force-interact': 'interactionClock', 'lift-carry': 'interactionClock'
});

export const PLAYER_PRESENTATION_V124 = Object.freeze({
  schema: 124, maximumGap: .25, stride: 86, crouchStride: 42, climbStride: 44,
  recoilDuration: .16, aimRaiseDuration: .18,
  artStatus: 'existing-atlas-poses-with-simulation-timing'
});

/** Only cells with observed spill fragments need a narrower source window.
 * The original PNG remains unchanged. The airborne/landing support correction
 * uses the actual body bottom, not the detached ladder pixels at the cell edge.
 */
const crop = (x, y, width, height, supportY = 240) => Object.freeze({ x, y, width, height, supportY });
const SAFE_PLAYER_CROPS_V124 = Object.freeze({
  'player.echo9-marine.locomotion': Object.freeze({
    4: crop(16, 40, 224, 204), 5: crop(16, 40, 224, 204),
    6: crop(16, 40, 224, 204), 7: crop(16, 40, 224, 204),
    10: crop(56, 20, 144, 184, 197),
    11: crop(60, 55, 140, 168, 217)
  }),
  'player.echo9-marine.combat': Object.freeze({ 14: crop(8, 116, 196, 128) })
});

export function getPlayerSourceCropV124(sheetId, frame) {
  return SAFE_PLAYER_CROPS_V124[sheetId]?.[frame] || null;
}

// Measured head-to-support heights of each sheet's neutral standing pose.
// Action art is larger inside the same 256px cell; compensate at the foot pivot
// so drawing a tracker cannot make the same marine grow by eighteen pixels.
export const PLAYER_STANDING_HEIGHTS_V124 = Object.freeze({
  'player.echo9-marine.locomotion': 193,
  'player.echo9-marine.combat': 201,
  'player.echo9-marine.melee': 218,
  'player.echo9-marine.interaction': 224,
  'player.echo9-marine.tool-use': 224
});

export function playerAtlasScaleV124(sheetId) {
  const height = PLAYER_STANDING_HEIGHTS_V124[sheetId];
  return height ? 193 / height : 1;
}

export function isPlayerAimingV124(actor = {}) {
  // combatAim.active can also be a movement key: it is not an aim-button edge.
  return actor.aimingV124 === true || actor.aiming === true || actor.coverV124?.peeking === true;
}

export function playerGaitV124(actor = {}) {
  if (actor.climbing) return 'climb';
  if (actor.grounded === false) return 'airborne';
  const speed = Math.abs(finite(actor.vx));
  if (actor.crouching) return speed > 8 ? 'crouch-move' : 'crouch';
  if (speed <= 12) return 'idle';
  if (sign(actor.vx) !== sign(actor.facing)) return 'backpedal';
  return actor.movementV124?.gait === 'run' || speed >= 265 ? 'run' : 'walk';
}

/** Refine the existing selector without borrowing enemy or outfit identities.
 * A crouched shot keeps crouched legs. The recoil is still driven by shots,
 * including during an airborne pose; the atlas has no authored 8-way rig.
 */
export function refinePlayerAnimationRequestV124(actor = {}, request) {
  if (!playerSheet(request?.sheetId)) return request;
  if (actor.downed && finite(actor.bleedOut) > 0) return { sheetId: 'player.echo9-marine.combat', clipId: 'downed', frame: 14 };
  if (actor.alive === false || ['hurt', 'death'].includes(request.clipId)) return request;
  const gait = playerGaitV124(actor);
  const bodyAction = ['primary-fire', 'aim-ready'].includes(request.clipId);
  if (actor.grounded === false && (bodyAction || request.clipId === 'crouch')) {
    return { sheetId: 'player.echo9-marine.locomotion', clipId: finite(actor.vy) < 0 ? 'rise' : 'fall' };
  }
  if (actor.crouching && bodyAction) return { sheetId: 'player.echo9-marine.locomotion',
    clipId: Math.abs(finite(actor.vx)) > 8 ? 'crouch-move' : 'crouch-aim' };
  if (bodyAction && Math.abs(finite(actor.vx)) > 12) return { sheetId: 'player.echo9-marine.locomotion',
    clipId: gait === 'backpedal' ? 'backpedal' : 'walk-run' };
  if (request.sheetId === 'player.echo9-marine.locomotion') {
    if (request.clipId === 'walk-run' && gait === 'backpedal') return { ...request, clipId: 'backpedal' };
    if (request.clipId === 'crouch') return { ...request,
      clipId: gait === 'crouch-move' ? 'crouch-move' : isPlayerAimingV124(actor) ? 'crouch-aim' : 'crouch' };
    if (request.clipId === 'idle' && isPlayerAimingV124(actor)) return { sheetId: 'player.echo9-marine.combat', clipId: 'aim-ready' };
  }
  return request;
}

function actionProgress(actor, clipId) {
  const isTool = ['motion-tracker', 'cutting-torch', 'access-tuner', 'maintenance-jack'].includes(clipId);
  const isInteraction = ['ground-interact', 'control-use', 'force-interact', 'lift-carry'].includes(clipId);
  const action = (isTool || isInteraction) && (actor.fieldActionV124 || actor.placeableActionV124);
  if (action && finite(action.duration) > 0) return {
    source: 'field-action', id: `${action.kind || 'work'}:${finite(action.serial)}`,
    elapsed: Math.max(0, finite(action.elapsed)), duration: action.duration,
    progress: clamp(finite(action.elapsed) / action.duration, 0, 1), working: action.phase !== 'complete'
  };
  const reload = actor.tacticalReload;
  if (clipId === 'reload' && reload?.phase === 'reloading' && finite(reload.completeAt) > 0) return {
    source: 'reload', id: reload.weaponKey || actor.weaponMode || 'reload',
    elapsed: Math.max(0, finite(reload.elapsed)), duration: reload.completeAt,
    progress: clamp(finite(reload.elapsed) / reload.completeAt, 0, 1), working: true
  };
  return null;
}

function isDiscontinuous(previous, actor, now, context) {
  if (!previous || context !== previous.context || now < previous.time || now - previous.time > PLAYER_PRESENTATION_V124.maximumGap) return true;
  const dt = now - previous.time;
  const allowance = Math.max(96, dt * (Math.abs(finite(actor.vx)) + Math.abs(finite(actor.vy)) + 1000) * 2);
  return Math.abs(finite(actor.x) - previous.x) > allowance || Math.abs(finite(actor.y) - previous.y) > allowance;
}

/** Return a transient clock for one player. Repeated draw/update samples at the
 * same simulation timestamp are idempotent; moving platforms do not animate
 * grounded feet because a zero locomotion velocity does not accrue gait phase.
 */
export function advancePlayerPresentationV124(previous, actor, request, now, { physicalContext = '', reducedMotion = false } = {}) {
  if (!actor || !playerSheet(request?.sheetId) || !Number.isFinite(now) || now < 0) return null;
  const context = typeof physicalContext === 'string' ? physicalContext : '';
  const reseeded = isDiscontinuous(previous, actor, now, context);
  const prior = reseeded ? null : previous;
  const dt = prior ? now - prior.time : 0;
  const signature = `${request.sheetId}:${request.clipId}`;
  const phase = actionProgress(actor, request.clipId);
  const clockKey = actionClocks[request.clipId];
  const remaining = clockKey ? Math.max(0, finite(actor[clockKey])) : 0;
  const shots = Math.max(0, Math.trunc(finite(actor.shots)));
  const sameClip = prior?.signature === signature;
  const newShot = prior ? shots > prior.shots : false;
  const resumedAction = sameClip && phase && prior.phase && (phase.id !== prior.phase.id || phase.elapsed + 1e-6 < prior.phase.elapsed);
  const renewedClock = sameClip && !phase && remaining > finite(prior?.remaining) + .015 && request.clipId !== 'primary-fire';
  const restart = !sameClip || resumedAction || renewedClock || request.clipId === 'primary-fire' && newShot;
  const startedAt = restart ? now : prior.startedAt;
  const elapsed = now - startedAt;
  const duration = phase?.duration || (restart ? remaining : Math.max(prior.duration, elapsed + remaining));
  // Reload timing can lengthen after a failed tactical attempt. Never rewind a
  // magazine already inserted; hold its current pose until time catches up.
  const progress = phase ? Math.max(!restart ? finite(prior?.progress) : 0, phase.progress)
    : duration > 0 ? clamp(elapsed / duration, 0, 1) : null;
  const moving = movementClips.has(request.clipId);
  const movementAxis = request.clipId === 'climb' ? 'y' : 'x';
  const velocity = request.clipId === 'climb' ? finite(actor.vy) : finite(actor.vx);
  const travelled = prior && moving && Math.abs(velocity) > 1
    ? Math.abs(finite(actor[movementAxis]) - prior[movementAxis]) : 0;
  const distance = (sameClip && !reseeded ? finite(prior?.distance) : 0) + travelled;
  const acceptedShotVisible = remaining > 0 && request.clipId === 'primary-fire';
  const shotAt = newShot ? now : prior?.shotAt ?? (acceptedShotVisible ? now : -100);
  const recoil = actor.alive !== false && !actor.downed
    ? clamp(1 - (now - shotAt) / PLAYER_PRESENTATION_V124.recoilDuration, 0, 1) : 0;
  const gait = playerGaitV124(actor);
  const crouchedPose = ['crouch', 'crouch-move', 'crouch-aim'].includes(request.clipId);
  const peekTarget = crouchedPose && actor.coverV124?.peeking
    ? clamp(finite(actor.coverV124.peekRise, 12), 0, 32) : 0;
  // All motion is anchored at the support point. Enter/leave cover eases over
  // a few simulation ticks; no wall-clock tween may continue while paused.
  const blend = reducedMotion ? 1 : prior ? 1 - Math.exp(-dt * 24) : 1;
  const peekRise = (prior?.peekRise || 0) + (peekTarget - (prior?.peekRise || 0)) * blend;
  const idle = request.clipId === 'idle';
  const breath = !reducedMotion && idle ? Math.sin(now * 2.2) : 0;
  const leanTarget = reducedMotion || !['walk', 'run', 'backpedal'].includes(gait) ? 0
    : sign(actor.vx) * (gait === 'run' ? .023 : gait === 'backpedal' ? .008 : .013);
  const lean = (prior?.lean || 0) + (leanTarget - (prior?.lean || 0)) * blend;
  const transform = Object.freeze({
    shearX: lean + (reducedMotion ? 0 : sign(actor.facing) * recoil * .013),
    scaleY: 1 + breath * .0025, extensionY: crouchedPose ? peekRise : 0,
    offsetX: 0, offsetY: 0
  });
  return Object.freeze({
    schema: 124, time: now, context, signature, x: finite(actor.x), y: finite(actor.y),
    shots, shotAt, recoil, gait, distance, startedAt, elapsed, duration, remaining, progress,
    phase, restart, reseeded, reducedMotion: Boolean(reducedMotion), peekRise, lean, transform,
    observedDeath: request.clipId === 'death' && (prior?.observedDeath || prior && prior.alive !== false),
    alive: actor.alive !== false, artStatus: PLAYER_PRESENTATION_V124.artStatus
  });
}

/** This clock drives existing frame IDs. Events remain presentation events;
 * consumers must never award equipment or apply damage from a frame marker.
 */
export function playerAnimationStepV124(state, clip) {
  if (!state || !clip?.frames?.length) return null;
  const count = clip.frames.length;
  const last = count - 1;
  if (clip.id === 'death' && !state.observedDeath) return { step: last, complete: true, suppressEvents: true };
  if (clip.id === 'primary-fire') return { step: Math.min(last, Math.max(0, Math.floor((state.time - state.shotAt) * clip.fps))), complete: state.time - state.shotAt >= count / clip.fps };
  if (clip.id === 'aim-ready') return { step: Math.min(last, Math.floor(state.elapsed / PLAYER_PRESENTATION_V124.aimRaiseDuration * count)), complete: false };
  if (movementClips.has(clip.id)) {
    const stride = clip.id === 'climb' ? PLAYER_PRESENTATION_V124.climbStride
      : clip.id === 'crouch-move' ? PLAYER_PRESENTATION_V124.crouchStride : PLAYER_PRESENTATION_V124.stride;
    return { step: state.reducedMotion ? 0 : Math.floor(state.distance / stride * count + 1e-9), complete: false };
  }
  if (state.phase || state.duration > 0 && actionClocks[clip.id] && !clip.loop && clip.id !== 'primary-fire') {
    const progress = state.progress ?? 0;
    // Do not stand back up while a ground task is still working.
    const step = clip.id === 'ground-interact' && state.phase?.working
      ? Math.min(Math.max(0, last - 1), Math.floor(progress * count))
      : Math.min(last, Math.floor(progress * count));
    if (clip.loop && clip.id === 'cutting-torch') return null;
    return { step, complete: !state.phase?.working && progress >= 1 };
  }
  return null;
}

export function playerPresentationSummaryV124(state, clipId) {
  if (!state) return null;
  return Object.freeze({ schema: 124, time: state.time, gait: state.gait,
    action: state.phase?.id?.split(':')[0] || (locomotionClips.has(clipId) ? null : clipId),
    progress: state.progress, recoil: state.recoil, peekRise: state.peekRise,
    reducedMotion: state.reducedMotion, transform: state.transform,
    shotSerial: state.shots, artStatus: state.artStatus });
}

/** A static optional reference remains a static reference. Only a restrained
 * breathing/recoil response is supported; no synthetic walking joints.
 */
export function getStaticEquipmentPresentationV124(actor = {}, timeSeconds = 0, reducedMotion = false) {
  const idle = actor.alive !== false && !actor.downed && !actor.climbing && actor.grounded !== false && Math.abs(finite(actor.vx)) < 8;
  const breath = !reducedMotion && idle ? Math.sin(finite(timeSeconds) * 2.2) * .0025 : 0;
  const recoil = !reducedMotion && actor.alive !== false ? clamp(finite(actor.v52FireClock) / .34, 0, 1) * .008 : 0;
  return Object.freeze({ scaleY: 1 + breath, shearX: sign(actor.facing) * recoil,
    animationStatus: 'static-reference-with-procedural-response' });
}
