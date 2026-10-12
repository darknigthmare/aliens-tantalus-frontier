import { PLAYER_VISUAL_CONTRACT_V81 } from './player-visual-contract-v81.js';
import { getPlayerCostumeSkinV119 } from './player-costume-skins-v119.js';

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

function measuredFrames(bounds, shoulders, standingHeight) {
  return bounds.map(([left, top, right, bottom], index) => {
    const guard = 4;
    const x = Math.max(0, left - guard), y = Math.max(0, top - guard);
    const source = { x, y, width: Math.min(NATIVE_SIZE, right + guard) - x,
      height: Math.min(NATIVE_SIZE, bottom + guard) - y };
    const joint = shoulders[index];
    return freeze({ index, alphaBounds: [left, top, right, bottom], source,
      // Keep the reference cell's lateral support axis. Following the mean
      // pixels of a swinging boot would shift the torso by 20px every stride.
      support: { x: (index % 4 + .5) * NATIVE_SIZE / 4, y: bottom },
      sourceShoulders: joint ? { near: point(joint[0], joint[1]), far: point(joint[2], joint[3]) } : null,
      standingHeight, eligible: Boolean(joint), supportMethod: 'native-bottom-and-reference-cell-axis' });
  });
}

export const PLAYER_BODY_RIG_FRAMES_V125 = freeze({
  locomotion: measuredFrames(locomotionBounds, locomotionShoulders, 252),
  combat: measuredFrames(combatBounds, combatShoulders, 248)
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

function selectPose(actor, timeSeconds, reducedMotion) {
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
    return moving ? { atlas: 'locomotion', frame: 4 + Math.floor(distance / 86 * 4 + 1e-9) % 4,
      gait: 'crouch-move', moving: true, peeking: true }
      : { atlas: 'combat', frame: 3, gait: 'crouch', moving: false, peeking: true };
  }
  if (actor.crouching) return { atlas: 'locomotion',
    frame: moving ? 12 + (Math.floor(distance / 42 * 2 + 1e-9) % 2) : aiming ? 13 : 12,
    gait: moving ? 'crouch-move' : 'crouch', moving };
  if (moving) {
    const backwards = Math.sign(finite(actor.vx)) !== facingOf(actor);
    const phase = Math.floor(distance / 86 * 4 + 1e-9) % 4;
    return { atlas: 'locomotion', frame: 4 + (backwards ? (4 - phase) % 4 : phase),
      gait: backwards ? 'backpedal' : actor.movementV124?.gait === 'run' || speed >= 265 ? 'run' : 'walk', moving: true };
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
  const pose = selectPose(actor, now, reducedMotion);
  const descriptor = pose.atlas === 'combat' ? COMBAT : LOCOMOTION;
  const frame = PLAYER_BODY_RIG_FRAMES_V125[pose.atlas][pose.frame];
  const metrics = PLAYER_VISUAL_CONTRACT_V81.surfaces[surface];
  const standingHeight = metrics.height * REFERENCE_HEIGHT / 256;
  const scale = metrics.height / 256;
  const scaleY = standingHeight / frame.standingHeight;
  const scaleX = scaleY * metrics.width / metrics.height;
  const facing = facingOf(actor);
  const pivot = point(actor.x + actor.w / 2, actor.y + actor.h);
  const breath = !reducedMotion && pose.gait === 'idle' && !actor.reloading ? Math.sin(now * 2.2) * .0025 : 0;
  const peekRise = actor.crouching && actor.coverV124?.peeking ? clamp(actor.coverV124.peekRise, 0, 32) : 0;
  const nativePoseHeight = frame.alphaBounds[3] - frame.alphaBounds[1];
  const vertical = scaleY * (1 + breath);
  const crouchFrame = PLAYER_BODY_RIG_FRAMES_V125.locomotion[pose.moving
    ? 12 + Math.floor(Math.max(0, finite(actor.weaponRigMotionV125?.distance)) / 42 * 2 + 1e-9) % 2 : 13];
  const crouchShoulderHeight = (crouchFrame.support.y - crouchFrame.sourceShoulders.near.y) * standingHeight / crouchFrame.standingHeight;
  const shoulderPeekRise = pose.peeking
    ? (frame.support.y - frame.sourceShoulders.near.y) * vertical - crouchShoulderHeight : 0;
  const matrix = { a: facing * scaleX, b: 0, c: 0, d: vertical,
    e: pivot.x - facing * scaleX * frame.support.x, f: pivot.y - vertical * frame.support.y };
  const world = source => point(matrix.a * source.x + matrix.e, matrix.d * source.y + matrix.f);
  const shoulders = { near: world(frame.sourceShoulders.near), far: world(frame.sourceShoulders.far) };
  const source = frame.source;
  const topLeft = world(point(facing < 0 ? source.x + source.width : source.x, source.y));
  const sprite = { x: topLeft.x, y: topLeft.y, width: source.width * scaleX, height: source.height * vertical };
  const ready = playerBodyRigImageReadyV125(imageFrom(images, descriptor.imageKey), descriptor)
    && playerBodyRigImageReadyV125(imageFrom(images, ARMS.imageKey), ARMS);
  return freeze({ schema: 125, id: descriptor.id, sheetId: descriptor.id, rigType: 'echo9', exact: false,
    eligible: true, ready, reason: ready ? null : 'rig-images-unavailable', surface,
    asset: descriptor, imageKey: descriptor.imageKey, requiredAssets: [descriptor, ARMS],
    armsAsset: ARMS, frame: pose.frame, atlas: pose.atlas, source, sourceFrame: frame,
    sprite, pivot, matrix, facing, flip: facing < 0, shoulders,
    neutralGrip: point(shoulders.near.x + facing * 30 * scale, shoulders.near.y + 11 * scale),
    pouch: point(pivot.x - facing * 12 * scale, pivot.y - standingHeight * (actor.crouching ? .29 : .49)),
    armLengths: { near: { upper: 31 * scale, fore: 33 * scale }, far: { upper: 31 * scale, fore: 33 * scale } },
    scale, sourceScaleX: scaleX, sourceScaleY: vertical,
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
export function solvePlayerArmIKV125(shoulder, target, lengths, bend = 1) {
  if (!validPoint(shoulder) || !validPoint(target)) return null;
  const upper = finite(lengths?.upper), fore = finite(lengths?.fore);
  if (upper <= 0 || fore <= 0) return null;
  const dx = target.x - shoulder.x, dy = target.y - shoulder.y;
  const requestedDistance = Math.hypot(dx, dy);
  const maxDistance = upper + fore - 1e-6;
  const minDistance = Math.abs(upper - fore) + 1e-6;
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
    reachError: Math.abs(requestedDistance - distance) });
}

function handTarget(bodyRig, pose, side) {
  if (side === 'near') return pose.grip;
  if (validPoint(pose.support)) return pose.support;
  const shoulder = bodyRig.shoulders.far;
  const sway = bodyRig.moving ? Math.sin(finite(bodyRig.timeSeconds) * 4) * 2 * bodyRig.scale : 0;
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
  const translated = Math.hypot(finite(weaponPose.translation?.x), finite(weaponPose.translation?.y)) > 1e-7;
  const obstructed = translated || weaponPose.muzzle?.obstructedV124 === true || weaponPose.obstructedV124 === true;
  const socket = PLAYER_SHOULDER_SOCKETS_V125[bodyRig.atlas]?.[bodyRig.frame]?.[side];
  let amount = 0, limit = 0;
  if (missing > 0 && obstructed && socket && distance > 0) {
    // Five world pixels in mission, 3.31 in Bioforge, 4.32 in the hub.
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
    amount = Math.min(limit, missing + .05 * bodyRig.scale);
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
    const ik = solvePlayerArmIKV125(fitting.shoulder, target, bodyRig.armLengths[side], bodyRig.facing);
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
  ctx.drawImage(image, source.x, source.y, source.width, source.height,
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
  ctx.save();
  const { a, b, c, d, e, f } = bodyRig.matrix;
  const source = bodyRig.source;
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(bodyImage, source.x, source.y, source.width, source.height,
    source.x, source.y, source.width, source.height);
  ctx.restore();
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
