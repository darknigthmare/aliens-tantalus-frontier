import { WEAPONS } from './content-core-v50.js';
import { getPlayerCostumeSkinV119 } from './player-costume-skins-v119.js';
import { PLAYER_VISUAL_CONTRACT_V81 } from './player-visual-contract-v81.js';
import { resolvePlayerBodyRigV125, resolvePlayerArmPoseV125 } from './player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ANCHORS_V126, resolvePlayerModularRigV126,
  drawPlayerModularRigV126 } from './player-modular-rig-v126.js';
import { resolveHeldWeaponProfileV125 } from './held-weapon-profiles-v125.js';
import { getHeldWeaponPoseV125 } from './held-weapon-renderer-v125.js';
import { weaponImageReadyV125 } from './weapon-image-cache-v125.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, finite(value, low)));
const point = (x, y) => ({ x, y });
const validPoint = value => Number.isFinite(value?.x) && Number.isFinite(value?.y);
const lerp = (a, b, t) => point(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const imageFrom = (images, key) => images?.get?.(key) || images?.[key] || null;
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze); Object.freeze(value);
  }
  return value;
};
const transform = (m, p) => point(m.a * p.x + m.c * p.y + m.e, m.b * p.x + m.d * p.y + m.f);
const sourcePixel = (asset, pivot) => point(pivot.x * asset.sourceWidth, pivot.y * asset.sourceHeight);

const sheet = (id, name, imageKey, file, sha256) => ({ id, name, imageKey,
  path: `/assets/openai/sprites/tools/${file}`, sourceWidth: 512, sourceHeight: 512,
  sourceFacing: 1, sha256, visualStatus: 'existing-independent-tool-atlas' });
const TRACKER = sheet('tool.motion-tracker', 'M314 Motion Tracker', 'playerActionTrackerV127',
  'm314-motion-tracker-use-sheet.png', '021536b998dbae4c7e6a17e4e65d3ad26b30877fcb59288a9f80d5b2041c623a');
const TUNER = sheet('tool.access-tuner', 'Access Tuner', 'playerActionTunerV127',
  'security-access-tuner-use-sheet.png', '02e03b2a75aff1ee6beb3a366eaf61132e6b42a18243f12bb3c2f4cfe75d2321');
const JACK = sheet('tool.maintenance-jack', 'Maintenance Jack', 'playerActionJackV127',
  'maintenance-jack-use-sheet.png', '2c7581a49622268a0f4ed4a5ec3126b64448cdd19881d5a637091fe7f38a44cf');
const MEDKIT = sheet('tool.medkit', 'Medkit', 'playerActionMedkitV127',
  'medkit-use-sheet.png', '41c2dd4f23eb1a4af16fa96f464501e8329bf15024da691622fc481744bde7e3');
const native = name => resolveHeldWeaponProfileV125(WEAPONS.find(weapon => weapon.name === name));
const TORCH = native('Cutting Torch'), KNIFE = native('Combat Knife');

/** Inspected, already shipped independent tools. No action draws the tool-use
 * full person, no inventory icon is relabelled as another piece of equipment.
 * At most one of these images is needed per active operator action. */
export const PLAYER_ACTION_PROP_ASSETS_V127 = freeze([TRACKER, TUNER, JACK, MEDKIT, TORCH, KNIFE]);

const TOOL_IDS = freeze({
  'motion-tracker': 'motion-tracker', tracker: 'motion-tracker',
  'access-tuner': 'access-tuner', tuner: 'access-tuner',
  'maintenance-jack': 'maintenance-jack', jack: 'maintenance-jack',
  'cutting-torch': 'cutting-torch', cutter: 'cutting-torch'
});
const FIELD_MODES = freeze({
  medical: 'medical', 'access-bypass': 'access-tuner', 'field-repair': 'maintenance-jack',
  'synthetic-repair': 'maintenance-jack', breach: 'cutting-torch',
  'oxygen-reserve': 'self-service', 'protective-layer': 'self-service',
  'power-transfer': 'control-use', 'ammo-resupply': 'ground-interact',
  'incendiary-load': 'self-service', 'live-restraint': 'force-interact',
  'checkpoint-beacon': 'ground-interact', 'motion-pulse': 'motion-tracker',
  'deep-scan': 'motion-tracker', 'drone-recon': 'motion-tracker',
  'signal-jam': 'control-use', 'neuro-stabilize': 'self-service', 'field-support': 'self-service'
});
const GROUND_MODES = new Set(['medical', 'deploy', 'recover', 'ground-interact', 'maintenance-jack']);
const INTERACTIONS = new Set(['ground-interact', 'control-use', 'force-interact']);

function identityRejection(actor, sample, surface, neuroActive) {
  if (!actor || ![actor.x, actor.y, actor.w, actor.h].every(Number.isFinite) || actor.w <= 0 || actor.h <= 0) return 'invalid-actor';
  if (!PLAYER_VISUAL_CONTRACT_V81.surfaces[surface]) return 'unsupported-surface';
  if (actor.alive === false || actor.downed) return 'incapacitated';
  if (actor.inVehicle || actor.ventTransit || actor.climbing || actor.vehicleAccessPhase) return 'authored-transit';
  if (actor.squadMember || actor.spriteId && !String(actor.spriteId).startsWith('player.echo9-marine.')) return 'other-character-art';
  if (neuroActive || actor.neuroActive || actor.playerClass === 'neuro-xeno' || actor.visualForm === 'xenomorph') return 'neuro-art';
  if (getPlayerCostumeSkinV119(actor.costumeId)) return 'dedicated-costume';
  if (actor.userEquipmentV95?.armorId) return 'custom-armor';
  const sheetId = sample?.sheet?.id || sample?.sheetId;
  if (sample?.skinId || sheetId && !/^player\.echo9-marine\.(locomotion|combat|melee|interaction|tool-use)$/.test(sheetId)) return 'other-pose-art';
  const clipId = sample?.clip?.id || sample?.clipId;
  if (['death', 'downed', 'climb', 'lift-carry'].includes(clipId)) return 'unsupported-authored-action';
  return null;
}

function clockProgress(sample, clip, remaining, duration) {
  const current = sample?.presentationV124;
  const clipId = sample?.clip?.id || sample?.clipId;
  if (clipId === clip && Number.isFinite(current?.progress)) return clamp(current.progress);
  return clamp(1 - Math.max(0, finite(remaining)) / duration);
}

/** Action eligibility and timing depend only on the current simulation
 * observation. Completed/cancelled tasks and unrelated authored bodies opt
 * out before any image requests. This does not relax the firing rig's guards. */
export function resolvePlayerActionStateV127({ actor, sample = null, surface = 'mission', neuroActive = false } = {}) {
  const reason = identityRejection(actor, sample, surface, neuroActive);
  if (reason) return freeze({ schema: 127, eligible: false, reason });
  let kind, mode, source, duration, elapsed, serial = null;
  if (finite(actor.v52HurtClock) > 0 || finite(actor.shockClock) > 0) {
    kind = mode = 'hurt'; source = 'hurt-clock'; duration = Math.max(.45, finite(actor.shockClock));
    elapsed = duration * clockProgress(sample, 'hurt', Math.max(finite(actor.v52HurtClock), finite(actor.shockClock)), duration);
  } else if (finite(actor.meleeClock) > 0) {
    mode = actor.meleeKind === 'rifle-bash' ? 'rifle-bash' : actor.meleeKind === 'defense'
      || actor.meleeKind === 'melee-defense' ? 'melee-defense' : actor.meleeKind === 'knife-attack' ? 'knife-attack' : null;
    if (!mode) return freeze({ schema: 127, eligible: false, reason: 'unsupported-melee-action' });
    kind = mode; source = 'melee-clock'; duration = mode === 'rifle-bash' ? .48 : .42;
    elapsed = duration * clockProgress(sample, mode, actor.meleeClock, duration);
  } else if (actor.fieldActionV124) {
    const action = actor.fieldActionV124;
    kind = action.kind; mode = FIELD_MODES[kind]; source = 'field-action';
    if (action.phase !== 'working' || !mode || !(finite(action.duration) > 0) || !(finite(action.elapsed) < action.duration)) {
      return freeze({ schema: 127, eligible: false, reason: 'unsupported-field-action' });
    }
    duration = action.duration; elapsed = Math.max(0, finite(action.elapsed)); serial = finite(action.serial);
  } else if (actor.placeableActionV124) {
    const action = actor.placeableActionV124;
    if (!['deploy', 'recover'].includes(action.kind) || action.phase && action.phase !== 'working' || !(finite(action.duration) > 0)
      || !(finite(action.elapsed) < action.duration)) return freeze({ schema: 127, eligible: false, reason: 'unsupported-placeable-action' });
    kind = mode = action.kind; source = 'placeable-action'; duration = action.duration;
    elapsed = Math.max(0, finite(action.elapsed)); serial = finite(action.serial);
  } else if (finite(actor.toolUseClock) > 0) {
    kind = mode = TOOL_IDS[actor.toolId]; source = 'tool-clock'; duration = mode === 'cutting-torch' ? .95 : .7;
    if (!mode) return freeze({ schema: 127, eligible: false, reason: 'unsupported-tool-action' });
    elapsed = duration * clockProgress(sample, mode, actor.toolUseClock, duration);
  } else if (finite(actor.interactionClock) > 0) {
    kind = mode = actor.interactionKind; source = 'interaction-clock'; duration = .65;
    if (!INTERACTIONS.has(mode)) return freeze({ schema: 127, eligible: false, reason: 'unsupported-interaction-action' });
    elapsed = duration * clockProgress(sample, mode, actor.interactionClock, duration);
  } else return freeze({ schema: 127, eligible: false, reason: 'no-active-action' });
  // Airborne hurt/melee preserve their airborne legs. Stable field work must
  // never draw a kneeling operator suspended over a ladder or ledge.
  if (actor.grounded === false && !['hurt', 'knife-attack', 'rifle-bash', 'melee-defense'].includes(mode)) {
    return freeze({ schema: 127, eligible: false, reason: 'unstable-field-action' });
  }
  const progress = clamp(elapsed / duration);
  return freeze({ schema: 127, eligible: true, reason: null, kind, mode, source,
    duration, elapsed, progress, serial, phase: progress < .18 ? 'prepare' : progress < .82 ? 'work' : 'settle',
    groundedPose: GROUND_MODES.has(mode) });
}

function poseActor(actor, action) {
  // Explicit render-only observation. The actual actor (including collision,
  // posture, timers, equipment and ammo) remains untouched. V125 still rejects
  // that actual action in the accepted-shot path.
  return { ...actor, meleeClock: 0, toolUseClock: 0, interactionClock: 0, v52HurtClock: 0,
    shockClock: 0, fieldActionV124: null, placeableActionV124: null, v52FireClock: 0,
    reloading: false, tacticalReload: null, aiming: true, aimingV124: true, coverV124: null,
    crouching: action.groundedPose || Boolean(actor.crouching),
    vx: ['hurt', 'knife-attack', 'rifle-bash', 'melee-defense'].includes(action.mode) ? finite(actor.vx) : 0,
    weaponRigMotionV125: { ...(actor.weaponRigMotionV125 || {}), shotAt: -Infinity } };
}

function actionBody(actor, action, options) {
  const observed = poseActor(actor, action);
  const base = resolvePlayerBodyRigV125({ ...options, actor: observed, sample: null });
  if (!base.eligible) return { bodyRig: base, observed };
  const anatomical = PLAYER_MODULAR_RIG_ANCHORS_V126[base.atlas]?.[base.frame];
  if (!anatomical) return { bodyRig: { ...base, eligible: false, reason: 'action-body-unavailable' }, observed };
  const p = action.progress, envelope = smooth(p / .18) * smooth((1 - p) / .18);
  const strike = Math.sin(Math.PI * smooth(clamp((p - .12) / .62)));
  const angle = action.mode === 'hurt' ? -.16 * (1 - p)
    : action.mode === 'knife-attack' || action.mode === 'rifle-bash' ? .12 * strike
      : action.mode === 'force-interact' ? .12 * envelope : action.groundedPose ? .07 * envelope : 0;
  const waist = anatomical.waist, cos = Math.cos(angle), sin = Math.sin(angle);
  const rotate = value => point(waist.x + (value.x - waist.x) * cos - (value.y - waist.y) * sin,
    waist.y + (value.x - waist.x) * sin + (value.y - waist.y) * cos);
  const sourceShoulders = Object.fromEntries(Object.entries(base.sourceFrame.sourceShoulders).map(([side, p]) => [side, rotate(p)]));
  const shoulders = Object.fromEntries(Object.entries(sourceShoulders).map(([side, p]) => [side, transform(base.matrix, p)]));
  const bodyRig = { ...base, shoulders, neutralGrip: point(shoulders.near.x + base.facing * 30 * base.scale,
    shoulders.near.y + 11 * base.scale), sourceFrame: { ...base.sourceFrame, sourceShoulders },
    modularAnchorsV127: { ...anatomical, neck: rotate(anatomical.neck), headAngle: angle },
    actionV127: { kind: action.kind, mode: action.mode, progress: p, angle },
    stance: action.groundedPose ? 'working-kneel' : base.stance };
  return { bodyRig, observed };
}

function limitTarget(target, shoulder, lengths, ratio = .98) {
  const radius = (lengths.upper + lengths.fore) * ratio;
  const dx = target.x - shoulder.x, dy = target.y - shoulder.y, d = Math.hypot(dx, dy);
  return d > radius ? point(shoulder.x + dx * radius / d, shoulder.y + dy * radius / d) : target;
}

function propMatrix(source, target, scale, facing, angle = 0) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const a = facing * cos * scale, b = sin * scale, c = -facing * sin * scale, d = cos * scale;
  return { a, b, c, d, e: target.x - a * source.x - c * source.y, f: target.y - b * source.x - d * source.y };
}
const cell = index => ({ x: index % 2 * 256, y: Math.floor(index / 2) * 256, width: 256, height: 256 });

function makeProp(asset, sourceRect, gripPixel, supportPixel, target, size, angle, rig, side = 'near') {
  const scale = size * rig.standingHeight;
  const lengths = rig.armLengths, other = side === 'near' ? 'far' : 'near';
  let grip = limitTarget(target, rig.shoulders[side], lengths[side]);
  // Rigid translation preserves the implement and both measured contacts.
  // Fitting uses the same bounded anatomy as the firearm renderer.
  for (let index = 0; index < 12 && supportPixel; index++) {
    const matrix = propMatrix(gripPixel, grip, scale, rig.facing, angle);
    const offset = transform(matrix, supportPixel), supported = limitTarget(offset, rig.shoulders[other], lengths[other]);
    grip = limitTarget(point(grip.x + supported.x - offset.x, grip.y + supported.y - offset.y), rig.shoulders[side], lengths[side]);
  }
  const matrix = propMatrix(gripPixel, grip, scale, rig.facing, angle);
  return { id: `action-${asset.id}`, slot: 'action-prop', itemId: asset.weaponId || asset.id,
    name: asset.name, asset, imageKey: asset.imageKey, sourceRect, matrix, part: 'independent-action-prop',
    grip, support: supportPixel ? transform(matrix, supportPixel) : null, gripSide: side, firing: false };
}

function actionHands(rig, observed, action, options) {
  const f = rig.facing, s = rig.scale, p = action.progress;
  const envelope = smooth(p / .18) * smooth((1 - p) / .18);
  const cycle = options.reducedMotion ? 0 : Math.sin(action.elapsed * Math.PI * 5);
  const local = (side, x, y) => point(rig.shoulders[side].x + f * x * s, rig.shoulders[side].y + y * s);
  const home = { near: local('near', 8, 53), far: local('far', -8, 53) };
  let near = home.near, far = home.far, nearKind = 'service', farKind = 'service', props = [], reason = null;
  const mode = action.mode;
  if (mode === 'medical') {
    const frame = p < .14 ? 0 : p < .24 ? 1 : p < .84 ? 2 : 3, source = cell(frame);
    // The far hand holds the actual first-aid case; the other reaches its
    // contents, then the chest/forearm. No health is granted by a phase marker.
    const gripPixel = point(source.x + 215, source.y + (frame === 2 ? 132 : 129));
    const prop = makeProp(MEDKIT, source, gripPixel, null, local('far', 12, 45), .25 / 224, 0, rig, 'far');
    props = [prop]; far = prop.grip; farKind = 'grip';
    const contents = transform(prop.matrix, point(source.x + 113, source.y + (frame === 2 ? 127 : 122)));
    const apply = local('near', 21, 23);
    const manipulation = p > .27 && p < .80 ? .5 + .5 * (options.reducedMotion ? 1 : Math.sin((p - .27) / .53 * Math.PI * 4)) : 0;
    near = lerp(contents, apply, smooth(manipulation));
  } else if (mode === 'motion-tracker') {
    const source = cell(3), grip = point(306, 363), support = point(451, 410);
    const prop = makeProp(TRACKER, source, grip, support, local('near', 27, 21 + 10 * (1 - envelope)), .23 / 216, -.12, rig);
    props = [prop]; near = prop.grip; far = prop.support; nearKind = farKind = 'grip';
  } else if (mode === 'access-tuner') {
    // In-progress scan artwork only: the green success cell is reserved for a
    // committed access result owned by gameplay, never predicted visually.
    const frame = p < .2 || p > .88 ? 0 : 1, source = cell(frame);
    const prop = makeProp(TUNER, source, point(source.x + 70, source.y + 194), null,
      local('near', 29, 21 + 12 * (1 - envelope)), .22 / 221, -.12, rig);
    props = [prop]; near = prop.grip; nearKind = 'grip';
    far = transform(prop.matrix, point(source.x + 111, source.y + 109 + cycle * 10));
  } else if (mode === 'maintenance-jack') {
    const source = cell(p < .25 || p > .84 ? 0 : 1);
    const prop = makeProp(JACK, source, point(source.x + 78, source.y + 129), point(source.x + 161, source.y + 130),
      local('near', 18, 37), .34 / 222, .24 + (options.reducedMotion ? 0 : .12 * cycle) * envelope, rig);
    props = [prop]; near = prop.grip; far = prop.support; nearKind = farKind = 'grip';
  } else if (mode === 'cutting-torch') {
    const prop = makeProp(TORCH, { x: 0, y: 0, width: TORCH.sourceWidth, height: TORCH.sourceHeight },
      // The V125 generic support pivot falls in transparent space below this
      // bent nozzle. The active tool hand holds the measured regulator body.
      sourcePixel(TORCH, TORCH.gripPivot), point(635, 456), local('near', 23, 18),
      TORCH.sizeRatio / (TORCH.alphaBounds[2] - TORCH.alphaBounds[0]), -.06 + cycle * .025 * envelope, rig);
    props = [prop]; near = prop.grip; far = prop.support; nearKind = farKind = 'grip';
  } else if (mode === 'knife-attack') {
    const strike = p < .24 ? smooth(p / .24) * -.22 : p < .60 ? smooth((p - .24) / .36) : 1 - smooth((p - .60) / .40);
    const angle = -.90 + 1.05 * Math.max(0, strike);
    const prop = makeProp(KNIFE, { x: 0, y: 0, width: KNIFE.sourceWidth, height: KNIFE.sourceHeight },
      sourcePixel(KNIFE, KNIFE.gripPivot), null, local('near', 20 + 35 * strike, 8 + 2 * strike),
      KNIFE.sizeRatio / (KNIFE.alphaBounds[2] - KNIFE.alphaBounds[0]), angle, rig);
    props = [prop]; near = prop.grip; nearKind = 'grip'; far = local('far', 8, 22);
  } else if (mode === 'rifle-bash') {
    const profile = resolveHeldWeaponProfileV125(options.weaponDescriptor);
    if (!profile?.portable || ['throwable', 'melee', 'tool', 'bow'].includes(profile.type)) reason = 'bash-weapon-unavailable';
    else {
      const thrust = p < .24 ? -.20 * smooth(p / .24) : p < .6 ? smooth((p - .24) / .36) : 1 - smooth((p - .6) / .4);
      const angle = .34 - .38 * thrust;
      const gestureBody = { ...rig, neutralGrip: local('near', 22 + 25 * thrust, 20) };
      const pose = getHeldWeaponPoseV125({ actor: observed, descriptor: options.weaponDescriptor, bodyRig: gestureBody,
        aim: { x: f * Math.cos(angle), y: Math.sin(angle) }, surface: rig.surface,
        timeSeconds: options.timeSeconds, reducedMotion: true });
      if (!pose) reason = 'bash-weapon-unavailable';
      else {
        props = [{ id: `action-${profile.weaponId}`, slot: 'action-prop', itemId: profile.weaponId,
          name: profile.name, asset: profile, imageKey: profile.imageKey, sourceRect: pose.sourceRect,
          matrix: pose.matrix, part: 'equipped-weapon-bash', grip: pose.grip, support: pose.support,
          gripSide: 'near', firing: false }];
        near = pose.grip; far = pose.support || local('far', 6, 19); nearKind = farKind = 'grip';
      }
    }
  } else if (mode === 'hurt') {
    near = local('near', 22, 25); far = local('far', 2, -8 + 18 * p);
  } else if (mode === 'melee-defense') {
    near = local('near', 36, -20); far = local('far', 23, -18);
  } else if (mode === 'self-service') {
    near = lerp(local('near', 7, 46), local('near', 22, 24), envelope);
    far = local('far', 2 + cycle * 2, 28);
  } else if (GROUND_MODES.has(mode)) {
    const turn = mode === 'recover' ? 1 - p : p;
    near = local('near', 28 + 4 * cycle * envelope, 48 - 15 * smooth((turn - .78) / .22));
    far = local('far', 18 - 3 * cycle * envelope, 48);
  } else if (mode === 'force-interact') {
    near = local('near', 38 + 12 * envelope, 8 + 4 * cycle * envelope);
    far = local('far', 30 + 12 * envelope, 8 - 4 * cycle * envelope);
  } else if (mode === 'control-use') {
    near = local('near', 36 + 10 * envelope, 5 + cycle * 3 * envelope);
    far = local('far', 4, 38);
  }
  near = limitTarget(near, rig.shoulders.near, rig.armLengths.near);
  far = limitTarget(far, rig.shoulders.far, rig.armLengths.far);
  for (const prop of props) {
    const gripHand = prop.gripSide === 'far' ? far : near;
    const supportHand = prop.gripSide === 'far' ? near : far;
    if (Math.hypot(prop.grip.x - gripHand.x, prop.grip.y - gripHand.y) > .01
      || prop.support && Math.hypot(prop.support.x - supportHand.x, prop.support.y - supportHand.y) > .01) {
      reason = 'action-prop-contact-unavailable';
    }
  }
  const target = options.actionTarget;
  const targetPoint = validPoint(target) ? point(target.x + finite(target.w) / 2, target.y + finite(target.h) / 2) : null;
  return { reason, props, handPose: { schema: 127, action: mode, grip: near, support: far, serviceHand: far,
    translation: point(0, 0), handKinds: { near: nearKind, far: farKind }, visible: true },
    target: targetPoint ? { id: target.id || null, ...targetPoint,
      reachClamped: Math.hypot(targetPoint.x - rig.shoulders.near.x, targetPoint.y - rig.shoulders.near.y)
        > rig.armLengths.near.upper + rig.armLengths.near.fore } : null };
}

/** Pure body + hands + exact active implement. Cosmetic selection changes
 * only the component images. Action phases never emit bullets, sparks, damage,
 * inventory changes or successful terminal states. */
export function resolvePlayerActionRigV127(options = {}) {
  const { actor, images, appearance = actor?.appearanceV126 } = options;
  const action = resolvePlayerActionStateV127(options);
  if (!action.eligible) return freeze({ ...action, ready: false, bodyRig: null, handPose: null, props: [], requiredAssets: [] });
  const constructed = actionBody(actor, action, options);
  const observed = constructed.observed;
  // A presentation decorator may replace the lower layers, while the action
  // keeps its original shoulders, hand targets and implement contacts.
  const bodyRig = typeof options.decorateBodyRigV129 === 'function' && constructed.bodyRig.eligible
    ? options.decorateBodyRigV129(constructed.bodyRig, { actor: observed, action }) || constructed.bodyRig
    : constructed.bodyRig;
  if (!bodyRig.eligible) return freeze({ ...action, eligible: false, ready: false, reason: bodyRig.reason,
    bodyRig, handPose: null, props: [], requiredAssets: [] });
  const gesture = actionHands(bodyRig, observed, action, options);
  if (gesture.reason) return freeze({ ...action, eligible: false, ready: false, reason: gesture.reason,
    bodyRig, handPose: null, props: [], requiredAssets: [] });
  const modular = resolvePlayerModularRigV126({ bodyRig, images, appearance });
  const requiredAssets = [...new Map([...modular.requiredAssets, ...gesture.props.map(prop => prop.asset)].map(asset => [asset.imageKey, asset])).values()];
  const missingAssets = requiredAssets.filter(asset => !weaponImageReadyV125(imageFrom(images, asset.imageKey), asset));
  const arms = resolvePlayerArmPoseV125(bodyRig, gesture.handPose);
  const valid = arms && ['near', 'far'].every(side => arms[side].reachError <= .01);
  const reason = !modular.eligible ? modular.reason : !valid ? 'action-arm-pose-unavailable'
    : missingAssets.length ? 'action-images-unavailable' : null;
  return freeze({ ...action, eligible: modular.eligible && Boolean(valid), ready: !reason, reason,
    bodyRig, handPose: gesture.handPose, arms, props: gesture.props, target: gesture.target,
    requiredAssets, missingAssets, firing: false, visualStatus: 'modular-action-with-independent-equipment' });
}

/** Preflight every component and implement before the first Canvas command.
 * The result remains schema126 for the persistent appearance status contract;
 * the action record is a separate transient V127 observation. */
export function drawPlayerActionRigV127(ctx, { actionRig, appearance, images } = {}) {
  if (!actionRig?.eligible) return { schema: 126, drawn: false, fallback: true,
    reason: actionRig?.reason || 'action-unavailable', effectiveSlots: null, layers: [], actionV127: null };
  const unavailable = actionRig.requiredAssets.some(asset => !weaponImageReadyV125(imageFrom(images, asset.imageKey), asset));
  if (!actionRig.ready || unavailable) return { schema: 126, drawn: false, fallback: true,
    reason: unavailable ? 'action-images-unavailable' : actionRig.reason, effectiveSlots: null, layers: [], actionV127: null };
  const drawProps = ctx => {
    for (const prop of actionRig.props) {
      const { a, b, c, d, e, f } = prop.matrix, rect = prop.sourceRect;
      ctx.save(); ctx.transform(a, b, c, d, e, f);
      ctx.drawImage(imageFrom(images, prop.imageKey), rect.x, rect.y, rect.width, rect.height,
        rect.x, rect.y, rect.width, rect.height); ctx.restore();
    }
  };
  const render = drawPlayerModularRigV126(ctx, { bodyRig: actionRig.bodyRig, handPose: actionRig.handPose,
    appearance, images, drawActionProps: drawProps, actionPropLayers: actionRig.props });
  return { ...render, visualStatus: render.drawn ? actionRig.visualStatus : render.visualStatus,
    actionV127: render.drawn ? { schema: 127, kind: actionRig.kind, mode: actionRig.mode,
      phase: actionRig.phase, progress: actionRig.progress, elapsed: actionRig.elapsed,
      duration: actionRig.duration, serial: actionRig.serial, source: actionRig.source,
      props: actionRig.props.map(prop => ({ itemId: prop.itemId, imageKey: prop.imageKey,
        grip: { ...prop.grip }, support: prop.support ? { ...prop.support } : null, firing: false })),
      target: actionRig.target, firing: false } : null };
}
