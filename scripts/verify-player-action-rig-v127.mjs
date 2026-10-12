import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { WEAPONS } from '../src/content-core-v50.js';
import { FIELD_ACTIONS_V124 } from '../src/player-field-actions-v124.js';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from '../src/player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, resolvePlayerModularRigV126 } from '../src/player-modular-rig-v126.js';
import { normalizePlayerAppearanceV126 } from '../src/player-appearance-v126.js';
import { getHeldWeaponPoseV125 } from '../src/held-weapon-renderer-v125.js';
import { resolveHeldWeaponProfileV125 } from '../src/held-weapon-profiles-v125.js';
import { PLAYER_ACTION_PROP_ASSETS_V127, resolvePlayerActionStateV127,
  resolvePlayerActionRigV127, drawPlayerActionRigV127 } from '../src/player-action-rig-v127.js';

const repository = resolve(fileURLToPath(new URL('..', import.meta.url)));
const close = (actual, expected, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const deepFreeze = object => { if (object && typeof object === 'object') { Object.values(object).forEach(deepFreeze); Object.freeze(object); } return object; };
const profile = resolveHeldWeaponProfileV125(WEAPONS[0]);
const allAssets = [...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126, ...PLAYER_ACTION_PROP_ASSETS_V127, profile];
const images = new Map(allAssets.map(asset => [asset.imageKey,
  { complete: true, naturalWidth: asset.sourceWidth, naturalHeight: asset.sourceHeight }]));
const standard = normalizePlayerAppearanceV126();
const utility = normalizePlayerAppearanceV126({ schema: 126, slots: { helmet: 'helmet-patrol-v126', mask: 'mask-rebreather-v126',
  torso: 'torso-utility-v126', arms: 'arms-utility-v126', legs: 'legs-utility-v126', back: 'back-radio-v126' } });
const actor = patch => ({ x: 100, y: 200, w: 42, h: 92, alive: true, grounded: true, facing: 1,
  costumeId: 'costume-001', ammo: 37, ammoReserve: 60, health: 55, armor: 25, shots: 7, ...patch });
function actionActor(kind, progress = .55, patch = {}) {
  const result = actor(patch);
  if (['deploy', 'recover'].includes(kind)) result.placeableActionV124 = { kind, duration: 2.5, elapsed: 2.5 * progress, serial: 12 };
  else if (kind === 'hurt') result.v52HurtClock = .45 * (1 - progress);
  else if (['knife-attack', 'rifle-bash', 'melee-defense'].includes(kind)) {
    result.meleeKind = kind; result.meleeClock = (kind === 'rifle-bash' ? .48 : .42) * (1 - progress);
  } else result.fieldActionV124 = { kind, phase: 'working', duration: FIELD_ACTIONS_V124[kind]?.duration || 2,
    elapsed: (FIELD_ACTIONS_V124[kind]?.duration || 2) * progress, serial: 11 };
  return result;
}
const rig = (subject, options = {}) => resolvePlayerActionRigV127({ actor: subject, images,
  appearance: standard, weaponDescriptor: WEAPONS[0], timeSeconds: 4, reducedMotion: true, ...options });
const kinds = ['medical', 'access-bypass', 'field-repair', 'breach', 'deep-scan', 'power-transfer',
  'live-restraint', 'field-support', 'deploy', 'recover', 'hurt', 'knife-attack', 'rifle-bash', 'melee-defense'];
function host() {
  const calls = [], stack = [];
  const ctx = { save() { stack.push(1); }, restore() { assert.ok(stack.pop()); },
    transform(...matrix) { assert.ok(matrix.every(Number.isFinite)); }, drawImage(...args) { calls.push(args); },
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() {} };
  return { ctx, calls, stack };
}

// Read actual shipped RGBA pixels. This validates sampled atlas cells and
// component seams; it never creates or rewrites artwork to satisfy a test.
const pngCache = new Map();
function png(asset) {
  if (pngCache.has(asset.imageKey)) return pngCache.get(asset.imageKey);
  const bytes = readFileSync(resolve(repository, `.${asset.path}`));
  if (asset.sha256) assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.equal(width, asset.sourceWidth); assert.equal(height, asset.sourceHeight);
  assert.equal(bytes[24], 8); assert.equal(bytes[25], 6); assert.equal(bytes[28], 0);
  const chunks = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset);
    if (bytes.subarray(offset + 4, offset + 8).toString() === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(chunks)), stride = width * 4, pixels = Buffer.alloc(stride * height);
  const paeth = (a, b, c) => { const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c); return da <= db && da <= dc ? a : db <= dc ? b : c; };
  for (let y = 0; y < height; y++) {
    const row = y * stride, source = y * (stride + 1), filter = raw[source]; assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? pixels[row + x - 4] : 0, up = y ? pixels[row + x - stride] : 0, ul = y && x >= 4 ? pixels[row + x - stride - 4] : 0;
      pixels[row + x] = (raw[source + 1 + x] + (filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up : filter === 3 ? Math.floor((left + up) / 2) : paeth(left, up, ul))) & 255;
    }
  }
  const result = { width, height, alpha(x, y) { const px = Math.round(x), py = Math.round(y); return px < 0 || px >= width || py < 0 || py >= height ? 0 : pixels[(py * width + px) * 4 + 3]; } };
  pngCache.set(asset.imageKey, result); return result;
}
const transform = (m, p) => ({ x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f });
const inverse = (m, p) => { const det = m.a * m.d - m.b * m.c; return {
  x: (m.d * (p.x - m.e) - m.c * (p.y - m.f)) / det, y: (-m.b * (p.x - m.e) + m.a * (p.y - m.f)) / det }; };
function inside(polygon, p) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) result = !result;
  }
  return result;
}
function alphaAt(layer, p) {
  if (layer.clipPolygon && !inside(layer.clipPolygon, inverse(layer.clipMatrix, p))) return 0;
  const at = inverse(layer.matrix, p), rect = layer.sourceRect;
  if (at.x < rect.x || at.y < rect.y || at.x >= rect.x + rect.width || at.y >= rect.y + rect.height) return 0;
  return png(layer.asset).alpha(at.x, at.y);
}

test('action eligibility preserves the explicit Echo9 identity and authored transit/death boundaries', () => {
  for (const patch of [{ alive: false }, { downed: true }, { climbing: true }, { ventTransit: {} }, { inVehicle: true },
    { vehicleAccessPhase: 'boarding' }, { squadMember: true }, { spriteId: 'npc.synthetic.idle' }, { neuroActive: true },
    { playerClass: 'neuro-xeno' }, { visualForm: 'xenomorph' }, { costumeId: 'franchise-nostromo-crew' }, { userEquipmentV95: { armorId: 'custom' } }]) {
    const value = rig(actionActor('medical', .5, patch)); assert.equal(value.eligible, false); assert.equal(value.requiredAssets.length, 0);
  }
  for (const sample of [{ skinId: 'other' }, { sheetId: 'player.nostromo.interaction' }, { clipId: 'downed' }, { clipId: 'climb' }, { clipId: 'death' }, { clipId: 'lift-carry' }]) {
    assert.equal(rig(actionActor('medical'), { sample }).eligible, false);
  }
  assert.equal(rig(actionActor('medical'), { surface: 'inventory' }).eligible, false);
  assert.equal(rig(actionActor('medical'), { neuroActive: true }).eligible, false);
  assert.equal(rig(actionActor('medical', .5, { userEquipmentV95: { weaponId: 'custom' } })).eligible, true);
});

test('inactive, completed, unknown and unstable tasks never manufacture an action or substitute a tracker', () => {
  assert.equal(resolvePlayerActionStateV127({ actor: actor() }).reason, 'no-active-action');
  for (const patch of [
    { fieldActionV124: { kind: 'medical', phase: 'cancelled', elapsed: .2, duration: 2 }, interactionClock: .5, interactionKind: 'control-use' },
    { fieldActionV124: { kind: 'medical', phase: 'working', elapsed: 2, duration: 2 } },
    { fieldActionV124: { kind: 'unknown', phase: 'working', elapsed: .2, duration: 2 } },
    { placeableActionV124: { kind: 'deploy', phase: 'complete', elapsed: .2, duration: 2 } },
    { placeableActionV124: { kind: 'explode', elapsed: .2, duration: 2 } },
    { toolId: 'unsupported-device', toolUseClock: .3 }, { interactionKind: 'lift-carry', interactionClock: .3 },
    { meleeKind: 'unknown', meleeClock: .3 }
  ]) assert.equal(rig(actor(patch)).eligible, false);
  assert.equal(rig(actionActor('medical', .5, { grounded: false })).reason, 'unstable-field-action');
  assert.equal(rig(actionActor('hurt', .5, { grounded: false, vy: 200 })).eligible, true);
  assert.equal(rig(actionActor('knife-attack', .5, { grounded: false, vy: -100 })).eligible, true);
});

test('the existing field-action registry maps every timed action without changing duration or serial', () => {
  for (const action of Object.values(FIELD_ACTIONS_V124).filter(action => action.duration > 0)) {
    const value = rig(actionActor(action.kind, .37));
    assert.equal(value.eligible, true, action.kind); assert.equal(value.ready, true, action.kind);
    assert.equal(value.kind, action.kind); close(value.duration, action.duration); close(value.progress, .37); assert.equal(value.serial, 11);
  }
  for (const [toolId, expected] of [['cutter', 'cutting-torch'], ['tuner', 'access-tuner'], ['jack', 'maintenance-jack'], ['motion-tracker', 'motion-tracker']]) {
    assert.equal(rig(actor({ toolUseClock: .4, toolId })).mode, expected);
  }
  for (const interactionKind of ['ground-interact', 'control-use', 'force-interact']) {
    assert.equal(rig(actor({ interactionClock: .4, interactionKind })).mode, interactionKind);
  }
});

test('hurt and melee priorities override ongoing task art using actual clocks', () => {
  const subject = actionActor('medical'); subject.meleeClock = .2; subject.meleeKind = 'knife-attack'; subject.v52HurtClock = .3;
  assert.equal(rig(subject).kind, 'hurt'); assert.equal(rig(subject).props.length, 0);
  subject.v52HurtClock = 0; assert.equal(rig(subject).kind, 'knife-attack');
  subject.meleeClock = 0; assert.equal(rig(subject).kind, 'medical');
  const sample = { clipId: 'knife-attack', presentationV124: { progress: .8 } };
  close(rig(actionActor('knife-attack', .2), { sample }).progress, .8);
  close(rig(actionActor('knife-attack', .2), { sample: { ...sample, clipId: 'reload' } }).progress, .2);
});

test('render-only observations are deterministic and leave actor, collision, resources and costume untouched', () => {
  for (const kind of kinds) {
    const subject = deepFreeze(actionActor(kind, .48, { appearanceV126: structuredClone(utility),
      weaponRigMotionV125: { distance: 24, shotAt: 3.99, time: 4 }, tacticalReload: { phase: 'reloading', elapsed: .2, completeAt: 2 } }));
    const before = JSON.stringify(subject), target = deepFreeze({ id: 'target', x: 250, y: 210, w: 24, h: 60 });
    const first = rig(subject, { appearance: utility, actionTarget: target }), second = rig(subject, { appearance: utility, actionTarget: target });
    assert.deepEqual(first, second); assert.equal(JSON.stringify(subject), before); assert.equal(first.firing, false);
    assert.deepEqual(first.bodyRig.pivot, { x: subject.x + subject.w / 2, y: subject.y + subject.h });
    assert.equal(first.target.reachClamped, true);
    const native = resolvePlayerBodyRigV125({ actor: subject, images, timeSeconds: 4 });
    assert.equal(native.eligible, false, 'The actual action remains ineligible in the authoritative firearm path.');
    assert.equal(getHeldWeaponPoseV125({ actor: subject, descriptor: WEAPONS[0], bodyRig: native }), null);
    assert.ok(!Object.hasOwn(first.handPose, 'muzzle')); assert.ok(!Object.hasOwn(first.handPose, 'recoil'));
  }
});

test('all phases retain exact limb lengths, reachable hands and measured prop contacts in both facings', () => {
  for (const kind of kinds) for (const facing of [-1, 1]) for (const surface of ['mission', 'hub', 'bioforge']) for (const progress of [.02, .2, .4, .58, .78, .96]) {
    const value = rig(actionActor(kind, progress, { facing }), { surface }); assert.equal(value.eligible, true, `${kind}/${progress}`);
    for (const side of ['near', 'far']) {
      const arm = value.arms[side], lengths = value.bodyRig.armLengths[side];
      close(distance(arm.shoulder, arm.elbow), lengths.upper); close(distance(arm.elbow, arm.hand), lengths.fore);
      close(arm.reachError, 0); assert.ok(Number.isFinite(arm.wrist.x) && Number.isFinite(arm.wrist.y));
    }
    for (const prop of value.props) {
      close(distance(prop.grip, value.arms[prop.gripSide].hand), 0);
      if (prop.support) close(distance(prop.support, value.arms[prop.gripSide === 'near' ? 'far' : 'near'].hand), 0);
      assert.ok(Object.values(prop.matrix).every(Number.isFinite)); assert.equal(prop.firing, false);
    }
  }
});

test('each supported action keeps all six selected parts and preserves their mirror geometry', () => {
  for (const kind of kinds) for (const appearance of [standard, utility]) {
    const subject = actionActor(kind), value = rig(subject, { appearance });
    const composition = resolvePlayerModularRigV126({ bodyRig: value.bodyRig, appearance, images });
    assert.deepEqual(composition.effectiveSlots, appearance.slots); assert.equal(composition.ready, true);
    const mirrored = rig(actionActor(kind, .55, { facing: -1 }), { appearance });
    for (const side of ['near', 'far']) {
      close(value.arms[side].hand.y, mirrored.arms[side].hand.y);
      close(value.arms[side].hand.x + mirrored.arms[side].hand.x, 2 * value.bodyRig.pivot.x);
    }
  }
});

test('real medical, tracker, tuner and implement pixels stay under their hand grips', () => {
  for (const asset of PLAYER_ACTION_PROP_ASSETS_V127) png(asset);
  for (const kind of ['medical', 'deep-scan', 'access-bypass', 'field-repair', 'breach', 'knife-attack', 'rifle-bash']) for (const progress of [.04, .19, .5, .86, .97]) {
    const value = rig(actionActor(kind, progress));
    for (const prop of value.props) {
      const rect = prop.sourceRect;
      assert.ok(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= prop.asset.sourceWidth && rect.y + rect.height <= prop.asset.sourceHeight);
      assert.ok(alphaAt(prop, prop.grip) >= 128, `${kind}/${progress} grip must touch the actual implement pixels.`);
      if (prop.support) assert.ok(alphaAt(prop, prop.support) >= 64, `${kind}/${progress} far hand must touch the actual implement.`);
    }
  }
});

test('action torso lean retains real opaque waist overlap and covered shoulder roots', () => {
  for (const kind of kinds) for (const progress of [.05, .55, .94]) for (const torso of ['torso-marine-v126', 'torso-utility-v126']) for (const legs of ['legs-marine-v126', 'legs-utility-v126']) {
    const appearance = normalizePlayerAppearanceV126({ schema: 126, slots: { torso, legs } });
    const value = rig(actionActor(kind, progress), { appearance });
    const composition = resolvePlayerModularRigV126({ bodyRig: value.bodyRig, appearance, images });
    const top = composition.layers.find(layer => layer.id === 'torso'), lower = composition.layers.find(layer => layer.id === 'legs');
    for (const side of ['near', 'far']) assert.ok(alphaAt(top, value.bodyRig.shoulders[side]) >= 240, `${kind}: selected shoulder root must be covered.`);
    const waist = composition.anatomical.waist; let overlap = 0;
    for (let y = Math.floor(waist.y) - 12; y < waist.y + 24; y++) for (let x = Math.floor(waist.x) - 34; x < waist.x + 34; x++) {
      const p = transform(value.bodyRig.matrix, { x, y }); if (alphaAt(top, p) >= 64 && alphaAt(lower, p) >= 64) overlap++;
    }
    assert.ok(overlap >= 5, `${kind}/${progress}/${torso}/${legs} must retain its actual waistband overlap (${overlap}).`);
  }
});

test('bash draws the exact equipped firearm, and no missing/incompatible weapon is silently substituted', () => {
  const subject = actionActor('rifle-bash');
  for (const name of ['M4A3 Service Pistol', 'M56 Smartgun', 'M41A Pulse Rifle']) {
    const weapon = WEAPONS.find(item => item.name === name); assert.ok(weapon, name);
    const value = rig(subject, { weaponDescriptor: weapon }); assert.equal(value.eligible, true);
    assert.equal(value.props[0].itemId, weapon.id); assert.equal(value.props[0].imageKey, resolveHeldWeaponProfileV125(weapon).imageKey);
  }
  for (const weaponDescriptor of [null, {}, WEAPONS.find(item => item.name === 'Combat Knife'), WEAPONS.find(item => item.name === 'Cutting Torch')]) {
    const value = rig(subject, { weaponDescriptor }); assert.equal(value.eligible, false); assert.equal(value.props.length, 0);
  }
});

test('medical closure and tuner scanning follow task phase without predicting gameplay success', () => {
  const phases = [.05, .19, .55, .9].map(progress => rig(actionActor('medical', progress)));
  assert.deepEqual(phases.map(value => value.props[0].sourceRect), [
    { x: 0, y: 0, width: 256, height: 256 }, { x: 256, y: 0, width: 256, height: 256 },
    { x: 0, y: 256, width: 256, height: 256 }, { x: 256, y: 256, width: 256, height: 256 }
  ]);
  for (const progress of [.1, .5, .89, .999]) {
    const prop = rig(actionActor('access-bypass', progress)).props[0]; assert.equal(prop.sourceRect.y, 0, 'Green successful tuner cell is never predicted.');
  }
  assert.ok(distance(rig(actionActor('knife-attack', .2)).handPose.grip, rig(actionActor('knife-attack', .58)).handPose.grip) > 10);
  assert.ok(distance(rig(actionActor('rifle-bash', .2)).handPose.grip, rig(actionActor('rifle-bash', .58)).handPose.grip) > 5);
  assert.notEqual(rig(actionActor('hurt', .1)).bodyRig.actionV127.angle, rig(actionActor('hurt', .9)).bodyRig.actionV127.angle);
});

test('every missing or undecoded part or tool falls back before drawing any fraction of an operator', () => {
  for (const kind of ['medical', 'deep-scan', 'access-bypass', 'field-repair', 'breach', 'knife-attack', 'rifle-bash', 'deploy']) {
    const value = rig(actionActor(kind));
    for (const asset of value.requiredAssets) {
      const unavailable = new Map(images); unavailable.delete(asset.imageKey); const h = host();
      const result = drawPlayerActionRigV127(h.ctx, { actionRig: value, appearance: standard, images: unavailable });
      assert.equal(result.drawn, false); assert.equal(result.reason, 'action-images-unavailable'); assert.equal(h.calls.length, 0); assert.equal(h.stack.length, 0);
      assert.equal(rig(actionActor(kind), { images: unavailable }).ready, false);
    }
    const prop = value.props[0]; if (!prop) continue;
    const invalid = new Map(images); invalid.set(prop.imageKey, { complete: true, naturalWidth: 0, naturalHeight: 0, width: prop.asset.sourceWidth, height: prop.asset.sourceHeight });
    assert.equal(rig(actionActor(kind), { images: invalid }).ready, false);
  }
});

test('composition draws each active implement exactly once behind the hands with no weapon callback', () => {
  for (const kind of kinds) {
    const value = rig(actionActor(kind), { appearance: utility }), h = host();
    const result = drawPlayerActionRigV127(h.ctx, { actionRig: value, appearance: utility, images });
    assert.equal(result.drawn, true, kind); assert.equal(result.schema, 126); assert.equal(result.actionV127.firing, false);
    assert.deepEqual(result.effectiveSlots, utility.slots); assert.equal(result.actionV127.kind, kind);
    assert.equal(result.layers.filter(layer => layer.slot === 'action-prop').length, value.props.length);
    assert.equal(result.layers.filter(layer => layer.slot === 'weapon').length, 0);
    assert.equal(h.stack.length, 0);
    for (const prop of value.props) {
      assert.equal(h.calls.filter(args => args[0] === images.get(prop.imageKey)).length, 1);
      const at = result.layers.findIndex(layer => layer.id === prop.id);
      assert.ok(at > result.layers.findIndex(layer => layer.id === 'torso'));
      assert.ok(at < result.layers.findIndex(layer => layer.id === 'near-hand'));
      assert.ok(at < result.layers.findIndex(layer => layer.id === 'far-hand'));
    }
  }
});
