import { normalizePlayerAppearanceV126 } from './player-appearance-v126.js';
import { resolveSpriteDrawableV134 } from './sprite-alpha-policy-v134.js';
import { sampleHumanGaitV133 } from './player-gait-v133.js';
import { PLAYER_HUMAN_PROPORTIONS_V160, PLAYER_MODULAR_SOURCE_ANCHORS_V160, getPlayerTorsoAxisV160 } from './player-human-proportions-v160.js';
import { PLAYER_VISUAL_CONTRACT_V81 } from './player-visual-contract-v81.js';
import { getPlayerCostumeSkinV119 } from './player-costume-skins-v119.js';
import { getPlayerArmReachV160, PLAYER_ARM_FLEXION_LIMITS_V160 } from './player-arm-constraints-v160.js';

/** Separate, reviewed Echo9 art. No full-body image is hidden by a torso mask:
 * these derived PNGs actually have no arms or gun. The native output is 1254
 * square, not the reference's 1024. Every rectangle and attachment is measured
 * in that native image. This is adapted modular art, not a claim of pixel
 * identity with the reference, nor a costume-independent humanoid rig.
 */
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, finite(value, min)));
const point = (x, y) => ({ x, y });
const validPoint = value => Number.isFinite(value?.x) && Number.isFinite(value?.y);
const facingOf = actor => finite(actor?.facing, 1) < 0 ? -1 : 1;
const NATIVE_SIZE = 1254;
const REFERENCE_HEIGHT = 193;

const asset = (kind, imageKey, sha256) => freeze({
  id: `player.echo9-marine.rig-v125.${kind}`, family: 'player', rigType: 'echo9', kind,
  imageKey, path: `/assets/openai/sprites/player/rig-v125/echo9-${kind}-v125.png`,
  width: NATIVE_SIZE, height: NATIVE_SIZE, sourceWidth: NATIVE_SIZE, sourceHeight: NATIVE_SIZE,
  sha256, sourceFacing: 1, exact: false, visualStatus: 'adapted-modular-echo9-art'
});

export const PLAYER_BODY_RIG_ASSETS_V125 = freeze([
  asset('body-locomotion', 'playerBodyLocomotionV125', '782352c57a953f2cfed8b4df790bb1800b8a9c9b7bd206c43915b17c0910cbde'),
  asset('body-combat', 'playerBodyCombatV125', '1bb31c3bce71511efea71ba0e3272d379c039d89b85d916fd1196ad6d2c40b42'),
  asset('arm-parts', 'playerArmPartsV125', '5685c11e883e2265f8de2d07f708640fa16a985914a18aeebd43041c1717e8cc')
]);
const [LOCOMOTION, COMBAT, ARMS] = PLAYER_BODY_RIG_ASSETS_V125;

const locomotionBounds = [
  [81,52,201,304], [394,51,515,304], [707,52,828,304], [1021,51,1141,304],
  [60,371,241,613], [380,371,550,613], [690,371,868,613], [1008,371,1177,613],
  [80,744,197,928], [382,730,515,927], [704,655,820,878], [1022,696,1138,900],
  [78,1060,206,1237], [387,1050,520,1237], [692,986,869,1237], [1014,986,1180,1236]
];
const combatBounds = [
  [81,47,202,295], [391,47,512,295], [705,59,829,295], [1012,65,1145,295],
  [56,382,180,610], [385,373,556,610], [707,384,832,609], [999,385,1126,610],
  [84,690,211,923], [396,694,526,922], [714,691,841,923], [1027,709,1145,923],
  [76,1008,235,1236], [394,1029,528,1236], [643,1094,836,1236], [965,1159,1200,1236]
];

// Near joint is inside the retained shoulder cap; the upper arm is drawn
// behind that cap. Far joint is at the far side of the upper chest. Coordinates
// are absolute source pixels. Locomotion 14/15 contain a ladder and are never
// admitted. Combat 3 is the reviewed stable, flash-free shouldered torso.
const locomotionShoulders = [
  [118,132,157,126], [432,132,471,126], [746,132,785,126], [1060,132,1099,126],
  [143,442,183,435], [456,442,495,435], [770,442,809,435], [1083,442,1122,435],
  [131,816,170,809], [453,805,491,797], [753,726,791,719], [1073,772,1111,765],
  [127,1135,166,1128], [450,1124,489,1116], null, null
];
const combatShoulders = [
  [121,125,160,120], [433,125,472,120], [748,135,786,131], [1065,137,1103,130],
  [100,457,139,450], [420,450,456,443], [752,459,790,452], [1045,461,1083,454],
  [127,768,166,761], [437,771,476,764], [754,768,793,761], [1072,785,1111,778],
  [103,1086,141,1073], [450,1094,488,1100], null, null
];

// Register the body on its measured belt, independently of each source cell's
// nominal centre and of its swinging boot pixels. The old nominal centre was
// 16.75 source pixels to the right of the neutral belt: at native game size it
// put the resting thorax ~6.4px beside the solved legs. Aim and accepted-shot
// resolution use this same registration, so the real projectile follows the
// rendered weapon when the whole upper body is recentered.
export const PLAYER_BODY_LATERAL_SUPPORTS_V142 = freeze({
  locomotion:[140,454,768,1082,151,464,778,1091,136,449,753,1075,128,448],
  combat:{3:1076}
});
function measuredFrames(bounds, shoulders, standingHeight, lateralSupports) {
  return bounds.map(([left, top, right, bottom], index) => {
    const guard = 4;
    const x = Math.max(0, left - guard), y = Math.max(0, top - guard);
    const source = { x, y, width: Math.min(NATIVE_SIZE, right + guard) - x,
      height: Math.min(NATIVE_SIZE, bottom + guard) - y };
    const joint = shoulders[index];
    return freeze({ index, alphaBounds: [left, top, right, bottom], source,
      support: { x: finite(lateralSupports?.[index],(index % 4 + .5) * NATIVE_SIZE / 4), y: bottom },
      sourceShoulders: joint ? { near: point(joint[0], joint[1]), far: point(joint[2], joint[3]) } : null,
      standingHeight, eligible: Boolean(joint), supportMethod: Number.isFinite(lateralSupports?.[index])
        ? 'native-bottom-and-measured-belt-axis' : 'native-bottom-and-reference-cell-axis' });
  });
}

export const PLAYER_BODY_RIG_FRAMES_V125 = freeze({
  locomotion: measuredFrames(locomotionBounds, locomotionShoulders, 252,PLAYER_BODY_LATERAL_SUPPORTS_V142.locomotion),
  combat: measuredFrames(combatBounds, combatShoulders, 248,PLAYER_BODY_LATERAL_SUPPORTS_V142.combat)
});

const part = (bounds, proximal, distal) => {
  const [left, top, right, bottom] = bounds;
  return freeze({ source: { x: left - 3, y: top - 3, width: right - left + 6, height: bottom - top + 6 },
    alphaBounds: bounds, proximal: point(...proximal), distal: point(...distal), width: right - left });
};
export const PLAYER_ARM_PARTS_V125 = freeze({
  near: {
    upper: part([104,157,258,528], [180,180], [182,454]),
    fore: part([420,189,568,514], [493,217], [511,473]),
    grip: part([715,284,873,516], [770,312], [796,441]),
    service: part([999,282,1175,538], [1067,311], [1085,435])
  },
  far: {
    upper: part([98,689,269,1057], [194,713], [166,981]),
    fore: part([419,706,567,1031], [492,735], [476,989]),
    grip: part([697,805,856,1035], [798,830], [772,960]),
    service: part([989,797,1166,1062], [1086,826], [1073,949])
  }
});

// Reviewed opaque overlap under combat3's retained near shoulder cap. A small
// scapular depression/protraction can move the hidden humeral joint here while
// the complete body and its collision shape remain unchanged. Other poses are
// deliberately not certified for this adjustment.
export const PLAYER_SHOULDER_SOCKETS_V125 = freeze({
  combat: { 3: { near: { left: 1050, top: 124, right: 1080, bottom: 150 } } }
});

const imageFrom = (images, key) => images?.get?.(key) || images?.[key] || null;
export function playerBodyRigImageReadyV125(image, descriptor) {
  return Boolean(image?.complete
    && Number(image.naturalWidth ?? image.width) === descriptor?.sourceWidth
    && Number(image.naturalHeight ?? image.height) === descriptor?.sourceHeight);
}

function rejection(actor, sample, surface, neuroActive) {
  if (!actor || ![actor.x, actor.y, actor.w, actor.h].every(Number.isFinite) || actor.w <= 0 || actor.h <= 0) return 'invalid-actor';
  if (!PLAYER_VISUAL_CONTRACT_V81.surfaces[surface]) return 'unsupported-surface';
  if (actor.alive === false || actor.downed) return 'incapacitated';
  if (actor.inVehicle || actor.ventTransit || actor.climbing || actor.vehicleAccessPhase) return 'authored-transit';
  if (actor.squadMember || actor.spriteId && !String(actor.spriteId).startsWith('player.echo9-marine.')) return 'other-character-art';
  if (neuroActive || actor.neuroActive || actor.playerClass === 'neuro-xeno' || actor.visualForm === 'xenomorph') return 'neuro-art';
  if (getPlayerCostumeSkinV119(actor.costumeId)) return 'dedicated-costume';
  if (actor.userEquipmentV95?.armorId) return 'custom-armor';
  if (finite(actor.meleeClock) > 0 || finite(actor.toolUseClock) > 0 || finite(actor.interactionClock) > 0
    || actor.fieldActionV124?.phase === 'working' || actor.placeableActionV124
    || finite(actor.v52HurtClock) > 0 || finite(actor.shockClock) > 0) return 'authored-action';
  // Optional current samples can identify an explicitly requested native skin
  // or hand-authored action. Geometry never reads a previous draw's record.
  const sheetId = sample?.sheet?.id || sample?.sheetId;
  if (sample?.skinId || sheetId && !/^player\.echo9-marine\.(locomotion|combat)$/.test(sheetId)) return 'other-pose-art';
  const clipId = sample?.clip?.id || sample?.clipId;
  if (['hurt', 'death', 'downed', 'climb', 'knife-attack', 'rifle-bash', 'melee-defense'].includes(clipId)) return 'authored-action';
  return null;
}

function selectPose(actor, timeSeconds, reducedMotion, motion) {
  const speed = Math.abs(finite(actor.vx));
  const distance = Math.max(0, finite(actor.weaponRigMotionV125?.distance));
  const moving = speed > (actor.crouching ? 8 : 12);
  const aiming = actor.aimingV124 === true || actor.aiming === true || actor.coverV124?.peeking === true;
  const shotAt = actor.weaponRigMotionV125?.shotAt;
  // The accepted-shot hook sets shotAt before resolving the projectile origin.
  // V52's cosmetic clock is assigned afterwards; waiting for it would fire the
  // first hip shot from idle and draw it from a different combat shoulder.
  const acceptedShot = Number.isFinite(shotAt) && timeSeconds >= shotAt && timeSeconds - shotAt < .34;
  if (actor.grounded === false) return { atlas: 'locomotion', frame: finite(actor.vy) < -35 ? 9 : 10, gait: 'airborne', moving: true };
  if (actor.crouching && actor.coverV124?.peeking) {
    // The reviewed combat torso has flexed knees. A real pose change preserves
    // the head, chest and legs; scaling a crouch taller visibly stretched them.
    return moving ? { atlas: 'locomotion', frame: 4 + Math.floor(motion.phase * 4 + 1e-9) % 4,
      gait: 'crouch-move', moving: true, peeking: true }
      : { atlas: 'combat', frame: 3, gait: 'crouch', moving: false, peeking: true };
  }
  if (actor.crouching) return { atlas: 'locomotion',
    frame: moving ? 12 + (Math.floor(motion.phase * 2 + 1e-9) % 2) : aiming ? 13 : 12,
    gait: moving ? 'crouch-move' : 'crouch', moving };
  if (moving) {
    const backwards = Math.sign(finite(actor.vx)) !== facingOf(actor);
    const phase = Math.floor(motion.phase * 4 + 1e-9) % 4;
    // The procedural lower body owns the actual stride. Reusing the native
    // running torso and then moving only its head upright put the collar,
    // shoulders and neck on different axes. Use the complete native upright
    // upper pose for travel; arms/weapon still resolve from its real sockets.
    return { atlas: 'locomotion', frame: phase,
      gait: backwards ? 'backpedal' : motion.gait, moving: true };
  }
  if (aiming || actor.reloading || acceptedShot || finite(actor.v52FireClock) > 0) return { atlas: 'combat', frame: 3, gait: 'idle', moving: false };
  return { atlas: 'locomotion', frame: reducedMotion ? 0 : Math.floor(timeSeconds * 2) % 4, gait: 'idle', moving: false };
}

/** Pure world-space geometry for rendering AND combat. scale is world pixels
 * per canonical Echo9 pixel; armLengths are already world pixels. bodyHeight
 * and standingHeight stay constant while crouched so the gun cannot shrink.
 * Image readiness is reported separately and never changes any coordinates.
 */
export function resolvePlayerBodyRigV125({ actor, sample = null, timeSeconds = 0,
  surface = 'mission', images = null, reducedMotion = false, neuroActive = false } = {}) {
  const reason = rejection(actor, sample, surface, neuroActive);
  if (reason) return freeze({ schema: 125, rigType: 'echo9', surface, eligible: false, ready: false, reason });
  const now = Math.max(0, finite(timeSeconds));
  const metrics = PLAYER_VISUAL_CONTRACT_V81.surfaces[surface];
  const motion = sampleHumanGaitV133(actor, metrics.height / 256);
  const pose = selectPose(actor, now, reducedMotion, motion);
  const descriptor = pose.atlas === 'combat' ? COMBAT : LOCOMOTION;
  const frame = PLAYER_BODY_RIG_FRAMES_V125[pose.atlas][pose.frame];
  const standingHeight = metrics.height * REFERENCE_HEIGHT / 256;
  const scale = metrics.height / 256;
  const scaleY = standingHeight / frame.standingHeight;
  const scaleX = scaleY;
  const facing = facingOf(actor);
  const pivot = point(actor.x + actor.w / 2, actor.y + actor.h);
  const breath = !reducedMotion && pose.gait === 'idle' && !actor.reloading ? Math.sin(now * 2.2) * .0025 : 0;
  const peekRise = actor.crouching && actor.coverV124?.peeking ? clamp(actor.coverV124.peekRise, 0, 32) : 0;
  const nativePoseHeight = frame.alphaBounds[3] - frame.alphaBounds[1];
  const vertical = scaleY * (1 + breath), horizontal = scaleX * (1 + breath);
  const lean = !reducedMotion && motion.moving && !actor.reloading && !actor.aimingV124 ? motion.lean : 0;
  const cosine = Math.cos(lean), sine = Math.sin(lean);
  const crouchFrame = PLAYER_BODY_RIG_FRAMES_V125.locomotion[pose.moving
    ? 12 + Math.floor(motion.phase * 2 + 1e-9) % 2 : 13];
  const crouchShoulderHeight = (crouchFrame.support.y - crouchFrame.sourceShoulders.near.y) * standingHeight / crouchFrame.standingHeight;
  const shoulderPeekRise = pose.peeking
    ? (frame.support.y - frame.sourceShoulders.near.y) * vertical - crouchShoulderHeight : 0;
  const matrix = { a: facing * cosine * horizontal, b: facing * sine * horizontal, c: -sine * vertical, d: cosine * vertical };
  matrix.e = pivot.x - matrix.a * frame.support.x - matrix.c * frame.support.y;
  matrix.f = pivot.y - matrix.b * frame.support.x - matrix.d * frame.support.y;
  const world = source => point(matrix.a * source.x + matrix.c * source.y + matrix.e, matrix.b * source.x + matrix.d * source.y + matrix.f);
  const shoulders = { near: world(frame.sourceShoulders.near), far: world(frame.sourceShoulders.far) };
  const source = frame.source;
  const topLeft = world(point(facing < 0 ? source.x + source.width : source.x, source.y));
  const corners = [point(source.x, source.y), point(source.x + source.width, source.y), point(source.x, source.y + source.height), point(source.x + source.width, source.y + source.height)].map(world);
  const sprite = { x: Math.min(...corners.map(p => p.x)), y: Math.min(...corners.map(p => p.y)), width: Math.max(...corners.map(p => p.x)) - Math.min(...corners.map(p => p.x)), height: Math.max(...corners.map(p => p.y)) - Math.min(...corners.map(p => p.y)) };
  // The upright upper pose must not freeze a complete native-body fallback.
  // Retain a separately registered native lower frame from the same observed
  // travel phase. It has its own sole plane and never tilts the held weapon.
  const fallbackLowerIndex = pose.atlas === 'locomotion' && pose.moving && pose.frame < 4
    ? 4 + pose.frame : pose.frame;
  const fallbackLowerFrame = PLAYER_BODY_RIG_FRAMES_V125[pose.atlas][fallbackLowerIndex];
  const lowerScale = standingHeight / fallbackLowerFrame.standingHeight;
  const lowerMatrix = { a: facing * lowerScale, b: 0, c: 0, d: lowerScale,
    e: pivot.x - facing * lowerScale * fallbackLowerFrame.support.x,
    f: pivot.y - lowerScale * fallbackLowerFrame.support.y };
  const nativeLowerV160 = { asset: descriptor, frame: fallbackLowerIndex, atlas: pose.atlas,
    sourceRect: fallbackLowerFrame.source, sourceFrame: fallbackLowerFrame, matrix: lowerMatrix };
  const ready = playerBodyRigImageReadyV125(imageFrom(images, descriptor.imageKey), descriptor)
    && playerBodyRigImageReadyV125(imageFrom(images, ARMS.imageKey), ARMS);
  return freeze({ schema: 125, id: descriptor.id, sheetId: descriptor.id, rigType: 'echo9', exact: false,
    eligible: true, ready, reason: ready ? null : 'rig-images-unavailable', surface,
    asset: descriptor, imageKey: descriptor.imageKey, requiredAssets: [descriptor, ARMS],
    armsAsset: ARMS, frame: pose.frame, atlas: pose.atlas, source, sourceFrame: frame,
    sprite, pivot, matrix, facing, flip: facing < 0, shoulders, nativeLowerV160,
    torsoAxisV160: getPlayerTorsoAxisV160(matrix, PLAYER_MODULAR_SOURCE_ANCHORS_V160[pose.atlas]?.[pose.frame], facing),
    neutralGrip: point(shoulders.near.x + facing * 30 * scale, shoulders.near.y + 11 * scale),
    // The magazine pouch is on the visible front belt/thigh. The former
    // rearward/high target made a service hand reach behind its shoulder.
    // The lower anatomic point is measured on the actual trouser/thigh art.
    pouch: point(pivot.x + facing * 6 * scale, pivot.y - standingHeight * (actor.crouching ? .29 : .49)
      + PLAYER_HUMAN_PROPORTIONS_V160.servicePouchDrop * scale),
    armLengths: { near: { upper: 31 * scale, fore: 33 * scale }, far: { upper: 31 * scale, fore: 33 * scale } },
    scale, sourceScaleX: horizontal, sourceScaleY: vertical, locomotionMotionV133: { ...motion, lean },
    standingHeight, bodyHeight: standingHeight, poseHeight: nativePoseHeight * vertical,
    gait: pose.gait, moving: pose.moving, crouching: Boolean(actor.crouching), timeSeconds: now, peekRise,
    stance: pose.peeking ? 'cover-peek' : actor.crouching ? 'crouched' : 'standing',
    bodyExtension: 0, shoulderPeekRise,
    layers: ['far-arm', 'near-upper-arm', 'body', 'weapon', 'near-forearm', 'hands'],
    visualStatus: descriptor.visualStatus });
}

/** Two-link analytic IK. A target outside the anatomical reach is explicitly
 * reported instead of producing NaN or silently lengthening a limb. Returning
 * both target and hand makes the remaining distance observable in QA.
 */
export function solvePlayerArmIKV125(shoulder, target, lengths, bend = 1, jointLimits = null) {
  if (!validPoint(shoulder) || !validPoint(target)) return null;
  const upper = finite(lengths?.upper), fore = finite(lengths?.fore);
  if (upper <= 0 || fore <= 0) return null;
  const dx = target.x - shoulder.x, dy = target.y - shoulder.y;
  const requestedDistance = Math.hypot(dx, dy);
  // Optional elbow limits are explicit. The same analytic solver also serves
  // knees and authored transit, which retain their own contact constraints.
  const reach = jointLimits ? getPlayerArmReachV160(lengths, jointLimits) : null;
  const maxDistance = (reach?.max ?? upper + fore) - 1e-6;
  const minDistance = (reach?.min ?? Math.abs(upper - fore)) + 1e-6;
  const distance = clamp(requestedDistance, minDistance, maxDistance);
  const ux = requestedDistance > 1e-8 ? dx / requestedDistance : 0;
  const uy = requestedDistance > 1e-8 ? dy / requestedDistance : 1;
  const along = (upper * upper - fore * fore + distance * distance) / (2 * distance);
  const height = Math.sqrt(Math.max(0, upper * upper - along * along));
  const side = bend < 0 ? -1 : 1;
  const elbow = point(shoulder.x + ux * along - uy * height * side,
    shoulder.y + uy * along + ux * height * side);
  const hand = point(shoulder.x + ux * distance, shoulder.y + uy * distance);
  return freeze({ shoulder: point(shoulder.x, shoulder.y), elbow, hand,
    target: point(target.x, target.y), requestedDistance, distance, upper, fore,
    reachClamped: Math.abs(requestedDistance - distance) > 1e-5,
    reachError: Math.abs(requestedDistance - distance),
    flexionDegrees: Math.acos(clamp((distance * distance - upper * upper - fore * fore) / (2 * upper * fore), -1, 1)) * 180 / Math.PI,
    jointLimits: reach ? { minFlexionDegrees: reach.minFlexionDegrees, maxFlexionDegrees: reach.maxFlexionDegrees } : null });
}

function handTarget(bodyRig, pose, side) {
  if (side === 'near') return pose.grip;
  if (validPoint(pose.support)) return pose.support;
  const shoulder = bodyRig.shoulders.far;
  const sway = bodyRig.locomotionMotionV133?.moving ? Math.sin(bodyRig.locomotionMotionV133.cycles * Math.PI * 2) * .8 * bodyRig.scale : 0;
  return point(shoulder.x - bodyRig.facing * (10 * bodyRig.scale + sway),
    shoulder.y + 56 * bodyRig.scale);
}

/** Obstacle retraction can put a long gun's grip a few pixels below the normal
 * reach, e.g. when its muzzle is stopped by a ceiling. Only a measured, hidden
 * shoulder socket may absorb that small displacement. Bone lengths, body art,
 * weapon affine, muzzle and collision-ray origin are all left untouched.
 */
export function fitPlayerArmShoulderV125(bodyRig, weaponPose, side = 'near') {
  const rest = bodyRig?.shoulders?.[side];
  if (!validPoint(rest) || !['near', 'far'].includes(side) || !validPoint(weaponPose?.grip)) return null;
  const lengths = bodyRig.armLengths?.[side];
  if (!(lengths?.upper > 0) || !(lengths?.fore > 0)) return null;
  const target = handTarget(bodyRig, weaponPose, side);
  const dx = target.x - rest.x, dy = target.y - rest.y, distance = Math.hypot(dx, dy);
  const missing = Math.max(0, distance - lengths.upper - lengths.fore + 1e-6);
  const translationDistance = Math.hypot(finite(weaponPose.translation?.x), finite(weaponPose.translation?.y));
  const translated = translationDistance > 1e-7;
  const obstructed = translated || weaponPose.muzzle?.obstructedV124 === true || weaponPose.obstructedV124 === true;
  const socket = PLAYER_SHOULDER_SOCKETS_V125[bodyRig.atlas]?.[bodyRig.frame]?.[side];
  let amount = 0, limit = 0;
  if (obstructed && socket && distance > 0 && weaponPose.armReachV160?.feasible !== true) {
    // The reviewed reference permits five world pixels at its 148px cell.
    // A smaller shared stature reduces that bound; opaque socket bounds can
    // restrict it further for the actual movement direction.
    limit = 5 * bodyRig.scale / (148 / 256);
    const ux = dx / distance, uy = dy / distance;
    const { a, b, c, d } = bodyRig.matrix;
    const determinant = a * d - b * c;
    const source = bodyRig.sourceFrame.sourceShoulders[side];
    const sourceX = (d * ux - c * uy) / determinant;
    const sourceY = (-b * ux + a * uy) / determinant;
    // Bound the source displacement as well as its world length: never move an
    // attachment beyond the retained opaque shoulder just to hide a bad fit.
    if (sourceX > 0) limit = Math.min(limit, (socket.right - source.x) / sourceX);
    if (sourceX < 0) limit = Math.min(limit, (socket.left - source.x) / sourceX);
    if (sourceY > 0) limit = Math.min(limit, (socket.bottom - source.y) / sourceY);
    if (sourceY < 0) limit = Math.min(limit, (socket.top - source.y) / sourceY);
    limit = Math.max(0, finite(limit));
    // Retraction also changes the arm's posture inside its existing cap,
    // even when the new native-width body still has enough reach. A small
    // fraction of the actual gun displacement recentres that hidden joint;
    // socket alpha bounds and the original bone lengths remain authoritative.
    const posture = Math.min(bodyRig.scale, translationDistance * .06);
    amount = Math.min(limit, missing + Math.max(.05 * bodyRig.scale, posture));
  }
  const shift = amount > 0 ? point(dx / distance * amount, dy / distance * amount) : point(0, 0);
  return freeze({ shoulder: point(rest.x + shift.x, rest.y + shift.y), restShoulder: point(rest.x, rest.y),
    shoulderShift: shift, shoulderShiftDistance: amount, maxShoulderShift: limit,
    shiftLimited: Boolean(obstructed && socket && missing > amount + 1e-7) });
}

export function resolvePlayerArmPoseV125(bodyRig, weaponPose) {
  if (!bodyRig?.eligible || !validPoint(weaponPose?.grip)) return null;
  const arms = {};
  for (const side of ['near', 'far']) {
    const target = handTarget(bodyRig, weaponPose, side);
    const fitting = fitPlayerArmShoulderV125(bodyRig, weaponPose, side);
    if (!fitting) return null;
    const elbowSide = weaponPose.armBendsV160?.[side] === -1 ? -1 : 1;
    const ik = solvePlayerArmIKV125(fitting.shoulder, target, bodyRig.armLengths[side], bodyRig.facing * elbowSide,
      weaponPose.armJointLimitsV160 || PLAYER_ARM_FLEXION_LIMITS_V160);
    if (!ik) return null;
    const dx = ik.hand.x - ik.elbow.x, dy = ik.hand.y - ik.elbow.y;
    const length = Math.max(1e-8, Math.hypot(dx, dy));
    const handReach = Math.min(8 * bodyRig.scale, length * .3);
    arms[side] = { ...ik, ...fitting, wrist: point(ik.hand.x - dx / length * handReach, ik.hand.y - dy / length * handReach),
      service: side === 'far' && (validPoint(weaponPose.serviceHand) || !validPoint(weaponPose.support)) };
  }
  return freeze(arms);
}

function drawPart(ctx, image, descriptor, from, to, width, facing) {
  const sx = descriptor.distal.x - descriptor.proximal.x, sy = descriptor.distal.y - descriptor.proximal.y;
  const sourceLength = Math.max(1e-8, Math.hypot(sx, sy));
  const ux = sx / sourceLength, uy = sy / sourceLength;
  const dx = to.x - from.x, dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  if (length < 1e-8) return;
  const wx = dx / length, wy = dy / length;
  const along = length / sourceLength, across = width / descriptor.width * facing;
  const a = wx * along * ux + -wy * across * -uy;
  const b = wy * along * ux + wx * across * -uy;
  const c = wx * along * uy + -wy * across * ux;
  const d = wy * along * uy + wx * across * ux;
  const e = from.x - a * descriptor.proximal.x - c * descriptor.proximal.y;
  const f = from.y - b * descriptor.proximal.x - d * descriptor.proximal.y;
  const source = descriptor.source;
  ctx.save();
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(resolveSpriteDrawableV134(image), source.x, source.y, source.width, source.height,
    source.x, source.y, source.width, source.height);
  ctx.restore();
}

/** A complete fallback keeps the authoritative chest/weapon frame. Loaded
 * articulated trousers can still animate when an unrelated upper PNG fails.
 * If the trousers are unavailable too, actual native walking lower frames
 * animate on their own measured sole plane. Image readiness changes drawing
 * only; the collision, shoulders, weapon and sewn pouch remain identical.
 */
export function resolvePlayerNativeBodyLayersV160(bodyRig, { images = null, appearance = null } = {}) {
  const base = bodyRig?.baseBodyRigV160 || bodyRig;
  const anatomical = bodyRig?.modularAnchorsV127
    || PLAYER_MODULAR_SOURCE_ANCHORS_V160[bodyRig?.atlas]?.[bodyRig?.frame];
  const layer = (id, matrix, extra = {}) => ({ id, asset: bodyRig.asset,
    sourceRect: bodyRig.source, matrix, ...extra });
  const slots = normalizePlayerAppearanceV126(appearance).slots;
  const parts = bodyRig?.modularLowerLayersV128?.[slots.legs];
  const completeLower = Array.isArray(parts) && parts.length === 7
    && new Set(parts.map(part => part.id)).size === 7
    && parts.every(part => part.slot === 'legs' && part.itemId === slots.legs
      && part.sourceRect && Object.values(part.matrix || {}).length === 6
      && Object.values(part.matrix).every(Number.isFinite)
      && playerBodyRigImageReadyV125(imageFrom(images, part.imageKey), part.asset));
  const animatedNative = bodyRig.nativeLowerV160;
  const differentLower = animatedNative && animatedNative.frame !== bodyRig.frame;
  if (!completeLower && !differentLower && !bodyRig.moving && bodyRig.matrix === base.matrix) {
    return [layer('native-body', bodyRig.matrix)];
  }
  if (!anatomical?.waist || !anatomical?.cut) return [layer('native-body', base.matrix)];
  const m = bodyRig.matrix, waist = anatomical.waist;
  const belt = completeLower && bodyRig.modularBeltV142 || point(m.a * waist.x + m.c * waist.y + m.e,
    m.b * waist.x + m.d * waist.y + m.f);
  const upper = layer('native-upper', bodyRig.matrix, {
    clipPolygon: [point(belt.x - 512, belt.y - 512), point(belt.x + 512, belt.y - 512),
      point(belt.x + 512, belt.y + 3 * bodyRig.scale), point(belt.x - 512, belt.y + 3 * bodyRig.scale)],
    clipMatrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
  });
  if (completeLower) return [...parts, upper];
  const lower = animatedNative || { asset: bodyRig.asset, sourceRect: bodyRig.source,
    matrix: base.matrix, atlas: bodyRig.atlas, frame: bodyRig.frame };
  const lowerAnatomy = PLAYER_MODULAR_SOURCE_ANCHORS_V160[lower.atlas]?.[lower.frame] || anatomical;
  const source = lower.sourceRect, left = source.x, right = left + source.width;
  // Include the native waistband overlap, rather than cutting below it at the
  // old full-body thigh seam; otherwise a straight chest could leave a gap
  // above the forward-leaning source trousers on the first moving frame.
  const seamY = lowerAnatomy.waist.y - 8, bottom = source.y + source.height;
  return [{ ...lower, id: 'native-lower',
    clipPolygon: [point(left, seamY), point(right, seamY), point(right, bottom), point(left, bottom)],
    clipMatrix: lower.matrix }, upper];
}

function drawNativeBodyLayerV160(ctx, image, layer) {
  ctx.save();
  if (layer.clipPolygon) {
    const m = layer.clipMatrix;
    const polygon = layer.clipPolygon.map(p => point(m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f));
    ctx.beginPath(); ctx.moveTo(polygon[0].x, polygon[0].y);
    for (const p of polygon.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.closePath(); ctx.clip();
  }
  const { a, b, c, d, e, f } = layer.matrix, source = layer.sourceRect;
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(resolveSpriteDrawableV134(image), source.x, source.y, source.width, source.height,
    source.x, source.y, source.width, source.height);
  ctx.restore();
}

/** Draw in world coordinates; the caller already owns camera translation.
 * The callback draws the actual native weapon with its authoritative affine.
 * No ammunition, action timers, actor state or image loading is mutated here.
 */
export function drawPlayerBodyRigV125(ctx, options = {}) {
  const bodyRig = options.bodyRig || resolvePlayerBodyRigV125(options);
  const weaponPose = options.weaponPose;
  if (!ctx?.drawImage || !ctx?.transform || !bodyRig.eligible || !bodyRig.ready
    || !weaponPose || weaponPose.visible === false || typeof options.drawWeapon !== 'function') {
    return { drawn: false, bodyRig, reason: bodyRig.reason || 'weapon-pose-unavailable' };
  }
  const bodyImage = imageFrom(options.images, bodyRig.imageKey);
  const armImage = imageFrom(options.images, ARMS.imageKey);
  if (!playerBodyRigImageReadyV125(bodyImage, bodyRig.asset) || !playerBodyRigImageReadyV125(armImage, ARMS)) {
    return { drawn: false, bodyRig, reason: 'rig-images-unavailable' };
  }
  const arms = resolvePlayerArmPoseV125(bodyRig, weaponPose);
  if (!arms) return { drawn: false, bodyRig, reason: 'arm-pose-invalid' };
  const drawUpper = side => drawPart(ctx, armImage, PLAYER_ARM_PARTS_V125[side].upper,
    arms[side].shoulder, arms[side].elbow, 15 * bodyRig.scale, bodyRig.facing);
  const drawFore = side => drawPart(ctx, armImage, PLAYER_ARM_PARTS_V125[side].fore,
    arms[side].elbow, arms[side].wrist, 11.5 * bodyRig.scale, bodyRig.facing);
  const drawHand = side => drawPart(ctx, armImage, PLAYER_ARM_PARTS_V125[side][arms[side].service ? 'service' : 'grip'],
    arms[side].wrist, arms[side].hand, 10 * bodyRig.scale, bodyRig.facing);
  ctx.save();
  drawUpper('far'); drawFore('far');
  drawUpper('near');
  for (const layer of resolvePlayerNativeBodyLayersV160(bodyRig, {
    images: options.images, appearance: options.appearance || options.actor?.appearanceV126
  })) drawNativeBodyLayerV160(ctx, imageFrom(options.images, layer.asset.imageKey), layer);
  ctx.save();
  options.drawWeapon(ctx, weaponPose);
  ctx.restore();
  drawFore('near');
  drawHand('far'); drawHand('near');
  ctx.restore();
  return { drawn: true, fallback: false, reason: null, schema: 125,
    bodyRig, arms, sheetId: bodyRig.id, frame: bodyRig.frame, facing: bodyRig.facing,
    pivot: bodyRig.pivot, layers: bodyRig.layers, visualStatus: bodyRig.visualStatus };
}
