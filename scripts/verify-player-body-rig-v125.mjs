import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { PLAYER_BODY_RIG_ASSETS_V125, PLAYER_BODY_RIG_FRAMES_V125, PLAYER_ARM_PARTS_V125, PLAYER_SHOULDER_SOCKETS_V125,
  resolvePlayerBodyRigV125, solvePlayerArmIKV125, resolvePlayerArmPoseV125, drawPlayerBodyRigV125 } from '../src/player-body-rig-v125.js';
import { getHeldWeaponPoseV125, translateHeldWeaponPoseV125 } from '../src/held-weapon-renderer-v125.js';
import { constrainPlayerMuzzleV124 } from '../src/player-control-v124.js';
import { WEAPONS } from '../src/content-core-v50.js';

const repository = fileURLToPath(new URL('../', import.meta.url));
const near = (a, b, label = 'coordinate') => assert.ok(Math.abs(a - b) < 1e-7, `${label}: ${a} != ${b}`);
const actor = overrides => ({ x: 160, y: 838, w: 42, h: 92, alive: true, grounded: true,
  facing: 1, vx: 0, vy: 0, costumeId: 'costume-001',
  weaponRigMotionV125: { distance: 0, shotAt: -100, time: 4 }, ...overrides });
const images = new Map(PLAYER_BODY_RIG_ASSETS_V125.map(asset => [asset.imageKey, {
  complete: true, naturalWidth: 1254, naturalHeight: 1254, src: asset.path
}]));
const rig = (subject, options = {}) => resolvePlayerBodyRigV125({ actor: subject, images, timeSeconds: 4, ...options });

// Read the shipped pixels, not a metadata-sized invented image. PNG filtering
// is reversed to inspect true alpha and the actual opaque support of each pose.
function readNativePng(asset) {
  const bytes = readFileSync(resolve(repository, `.${asset.path}`));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
  const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
  assert.equal(width, asset.sourceWidth); assert.equal(height, asset.sourceHeight);
  assert.equal(bytes[24], 8, 'Eight-bit PNG component depth.');
  assert.equal(bytes[25], 6, 'A genuine RGBA PNG is required.');
  assert.equal(bytes[28], 0, 'The reviewed assets are not interlaced.');
  const chunks = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset), type = bytes.subarray(offset + 4, offset + 8).toString();
    if (type === 'IDAT') chunks.push(bytes.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
  }
  const compressed = inflateSync(Buffer.concat(chunks)), stride = width * 4;
  assert.equal(compressed.length, (stride + 1) * height);
  const pixels = Buffer.alloc(stride * height);
  const paeth = (a, b, c) => { const p = a + b - c, da = Math.abs(p - a), db = Math.abs(p - b), dc = Math.abs(p - c);
    return da <= db && da <= dc ? a : db <= dc ? b : c; };
  for (let y = 0; y < height; y++) {
    const row = y * stride, source = y * (stride + 1), filter = compressed[source];
    assert.ok(filter <= 4);
    for (let x = 0; x < stride; x++) {
      const left = x >= 4 ? pixels[row + x - 4] : 0;
      const up = y ? pixels[row + x - stride] : 0;
      const upperLeft = y && x >= 4 ? pixels[row + x - stride - 4] : 0;
      const prediction = filter === 0 ? 0 : filter === 1 ? left : filter === 2 ? up
        : filter === 3 ? Math.floor((left + up) / 2) : paeth(left, up, upperLeft);
      pixels[row + x] = (compressed[source + 1 + x] + prediction) & 255;
    }
  }
  const alpha = (x, y) => pixels[(y * width + x) * 4 + 3];
  let transparent = 0, opaque = 0;
  for (let i = 3; i < pixels.length; i += 4) { if (pixels[i] === 0) transparent++; if (pixels[i] >= 24) opaque++; }
  assert.ok(transparent > width * height * .6, 'No painted backdrop or checkerboard.');
  assert.ok(opaque > 10000, 'The atlas must contain the reviewed component silhouettes.');
  return { width, height, alpha };
}

function actualBounds(image, source) {
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (let y = source.y; y < source.y + source.height; y++) for (let x = source.x; x < source.x + source.width; x++) {
    if (image.alpha(x, y) >= 24) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1); }
  }
  return [left, top, right, bottom];
}

test('native PNG alpha, hashes, individual rectangles and boot supports agree with the measured art', () => {
  const native = PLAYER_BODY_RIG_ASSETS_V125.map(readNativePng);
  for (const [index, atlas] of ['locomotion', 'combat'].entries()) {
    for (const frame of PLAYER_BODY_RIG_FRAMES_V125[atlas]) {
      assert.deepEqual(actualBounds(native[index], frame.source), frame.alphaBounds, `${atlas} frame ${frame.index}`);
      assert.equal(frame.support.y, frame.alphaBounds[3], 'Feet use the actual last opaque row.');
      assert.ok(frame.source.x >= 0 && frame.source.y >= 0 && frame.source.x + frame.source.width <= 1254 && frame.source.y + frame.source.height <= 1254);
    }
  }
  for (const side of Object.values(PLAYER_ARM_PARTS_V125)) for (const part of Object.values(side)) {
    assert.deepEqual(actualBounds(native[2], part.source), part.alphaBounds);
  }
  const socket = PLAYER_SHOULDER_SOCKETS_V125.combat[3].near;
  for (let y = socket.top; y <= socket.bottom; y++) for (let x = socket.left; x <= socket.right; x++) {
    assert.ok(native[1].alpha(x, y) >= 240, 'The entire admitted joint range is under retained body/shoulder pixels.');
  }
});

test('body and shoulder geometry is pure, available before images and independent of earlier draws', () => {
  const subject = actor({ aimingV124: true });
  const before = JSON.stringify(subject);
  const ready = rig(subject), unloaded = rig(subject, { images: null });
  assert.equal(ready.ready, true); assert.equal(unloaded.ready, false); assert.equal(unloaded.eligible, true);
  assert.deepEqual(ready.shoulders, unloaded.shoulders); assert.deepEqual(ready.matrix, unloaded.matrix);
  subject.playerVisualV81 = { sheetId: 'old-draw-record', fallback: true };
  subject.playerPresentationV124 = { transform: { scaleY: 8 }, distance: 999 };
  assert.deepEqual(rig(subject).matrix, ready.matrix);
  delete subject.playerVisualV81; delete subject.playerPresentationV124;
  assert.equal(JSON.stringify(subject), before, 'Resolving never changes the actor.');
  images.get(ready.imageKey).naturalWidth = 1024;
  assert.equal(rig(subject).ready, false, 'A nominal old atlas width is not admitted.');
  images.get(ready.imageKey).naturalWidth = 0;
  images.get(ready.imageKey).width = 1254;
  assert.equal(rig(subject).ready, false, 'A sized HTML image with failed intrinsic decoding is not ready.');
  images.get(ready.imageKey).naturalWidth = 1254;
  delete images.get(ready.imageKey).width;
});

test('first accepted hip shot chooses the same torso before and after the outer fire clock', () => {
  const subject = actor({ weaponRigMotionV125: { distance: 0, shotAt: 4, time: 4 }, v52FireClock: 0 });
  const first = rig(subject);
  assert.equal(first.atlas, 'combat'); assert.equal(first.frame, 3);
  const after = rig({ ...subject, v52FireClock: .34 });
  assert.deepEqual(first.shoulders, after.shoulders); assert.deepEqual(first.matrix, after.matrix);
  const oldShot = rig(subject, { timeSeconds: 4.4 });
  assert.equal(oldShot.atlas, 'locomotion');
  assert.equal(rig(subject, { timeSeconds: 3.9 }).atlas, 'locomotion', 'A future shot is not displayed early.');
});

test('reload keeps distance-driven standing or crouched legs and cannot shrink the equipped weapon', () => {
  for (const crouching of [false, true]) {
    const frames = new Set();
    for (const distance of [0, 22, 44, 66]) {
      const subject = actor({ vx: 155, crouching, reloading: true,
        weaponRigMotionV125: { distance, shotAt: -100, time: 4 } });
      const loaded = rig(subject), normal = rig({ ...subject, reloading: false });
      assert.equal(loaded.atlas, 'locomotion'); assert.equal(loaded.frame, normal.frame);
      frames.add(loaded.frame); near(loaded.standingHeight, 148 * 193 / 256);
    }
    assert.ok(frames.size > 1, 'Walking during a reload must visibly advance the legs.');
  }
});

test('cover uses an authored half-raised pose with native proportions and returns to crouch immediately', () => {
  const subject = actor({ crouching: true, aimingV124: true });
  const crouch = rig(subject), peek = rig({ ...subject, coverV124: { peeking: true, peekRise: 26 } });
  assert.equal(peek.atlas, 'combat'); assert.equal(peek.frame, 3); assert.equal(peek.stance, 'cover-peek');
  near(peek.sourceScaleY, peek.standingHeight / peek.sourceFrame.standingHeight, 'No vertical peek deformation');
  near(peek.bodyExtension, 0); assert.ok(peek.shoulderPeekRise > 0);
  assert.deepEqual(rig({ ...subject, coverV124: { peeking: false, peekRise: 26 } }).matrix, crouch.matrix);
  const moving = rig({ ...subject, vx: 120, coverV124: { peeking: true, peekRise: 26 } });
  assert.equal(moving.atlas, 'locomotion'); assert.ok(moving.frame >= 4 && moving.frame <= 7);
});

test('the physical foot support stays fixed in every admitted gait and surface', () => {
  for (const surface of ['mission', 'bioforge', 'hub']) for (const overrides of [
    {}, { aimingV124: true }, { crouching: true }, { crouching: true, coverV124: { peeking: true, peekRise: 32 } },
    { vx: 155, reloading: true }, { grounded: false, vy: -200 }, { grounded: false, vy: 200 }, { facing: -1 }
  ]) {
    const subject = actor(overrides), body = rig(subject, { surface });
    const { a, b, c, d, e, f } = body.matrix, support = body.sourceFrame.support;
    near(a * support.x + c * support.y + e, subject.x + subject.w / 2, 'Foot X');
    near(b * support.x + d * support.y + f, subject.y + subject.h, 'Foot Y');
  }
  const stationary = rig(actor({ aimingV124: true, vx: 12 }));
  const moving = rig(actor({ aimingV124: true, vx: 13 }));
  assert.ok(Math.abs(stationary.shoulders.near.y - moving.shoulders.near.y) < 8, 'No old hitbox-derived 25px shoulder discontinuity.');
});

test('dedicated skins, native NPCs, neuro, custom armor and authored hands retain their own art', () => {
  const exclusions = [{ costumeId: 'franchise-nostromo-crew' }, { squadMember: true }, { spriteId: 'npc.historical' },
    { neuroActive: true }, { visualForm: 'xenomorph' }, { userEquipmentV95: { armorId: 'user-armor' } },
    { climbing: true }, { inVehicle: true }, { ventTransit: {} }, { downed: true }, { alive: false },
    { meleeClock: .2 }, { toolUseClock: .2 }, { interactionClock: .2 }, { v52HurtClock: .2 },
    { fieldActionV124: { phase: 'working' } }, { placeableActionV124: { kind: 'deploy' } }];
  for (const patch of exclusions) assert.equal(rig(actor(patch)).eligible, false, JSON.stringify(patch));
  assert.equal(rig(actor()).eligible, true, 'Default saved costume-001 uses the Echo9 body.');
  assert.equal(rig(actor({ userEquipmentV95: { weaponId: 'item-v95-user-engineer-bone-rifle' } })).eligible, true,
    'A custom gun alone must not preserve the old baked rifle.');
  assert.equal(rig(actor(), { sample: { sheetId: 'native.other-character' } }).eligible, false);
  assert.equal(rig(actor({ fieldActionV124: { phase: 'cancelled' } })).eligible, true);
});

test('two-segment arms preserve lengths, contact and mirrored elbow direction without singularities', () => {
  for (const target of [{ x: 20, y: 6 }, { x: 0, y: -24 }, { x: 25, y: 20 }, { x: -18, y: 9 }, { x: 0, y: 0 }, { x: 100, y: 0 }]) {
    const arm = solvePlayerArmIKV125({ x: 0, y: 0 }, target, { upper: 18, fore: 19 }, target.x < 0 ? -1 : 1);
    near(Math.hypot(arm.elbow.x, arm.elbow.y), 18, 'Upper length');
    near(Math.hypot(arm.hand.x - arm.elbow.x, arm.hand.y - arm.elbow.y), 19, 'Forearm length');
    assert.ok([arm.hand.x, arm.hand.y, arm.elbow.x, arm.elbow.y, arm.reachError].every(Number.isFinite));
    if (!arm.reachClamped) { near(arm.hand.x, target.x); near(arm.hand.y, target.y); }
  }
  const right = solvePlayerArmIKV125({ x: 0, y: 0 }, { x: 20, y: 6 }, { upper: 18, fore: 19 }, 1);
  const left = solvePlayerArmIKV125({ x: 0, y: 0 }, { x: -20, y: 6 }, { upper: 18, fore: 19 }, -1);
  near(right.elbow.x, -left.elbow.x); near(right.elbow.y, left.elbow.y);
  assert.equal(solvePlayerArmIKV125({ x: NaN, y: 0 }, { x: 20, y: 0 }, { upper: 18, fore: 19 }), null);
});

test('a real tangent ceiling preserves heavy-weapon grip contact with a bounded hidden shoulder shift', () => {
  for (const name of ['M56 Smartgun', 'Heavy Pulse Rifle']) for (const facing of [1, -1]) {
    const subject = actor({ x: 100, y: 200, aimingV124: true, facing });
    const body = rig(subject, { timeSeconds: 0 });
    const descriptor = WEAPONS.find(weapon => weapon.name === name);
    const original = getHeldWeaponPoseV125({ actor: subject, descriptor, aim: { x: 0, y: -1 }, bodyRig: body });
    const muzzle = { ...original.muzzle, pivotX: body.shoulders.near.x, pivotY: body.shoulders.near.y };
    const ceiling = { x: 0, y: 169.99, w: 1000, h: 30 };
    const bounded = constrainPlayerMuzzleV124({ walls: [ceiling] }, subject, { x: original.aimX, y: original.aimY }, muzzle);
    assert.equal(bounded.obstructedV124, true);
    near(bounded.y, ceiling.y + ceiling.h + 2, 'Muzzle remains below the real ceiling');
    const retracted = translateHeldWeaponPoseV125(original, bounded.x - muzzle.x, bounded.y - muzzle.y);
    const before = JSON.stringify({ body, retracted });
    const arms = resolvePlayerArmPoseV125(body, retracted);
    assert.ok(arms.near.shoulderShiftDistance > 0 && arms.near.shoulderShiftDistance <= 5);
    assert.equal(arms.near.shiftLimited, false);
    assert.ok(arms.near.reachError < 1e-7 && arms.far.reachError < 1e-7, `${name}, facing ${facing}`);
    near(Math.hypot(arms.near.elbow.x - arms.near.shoulder.x, arms.near.elbow.y - arms.near.shoulder.y), body.armLengths.near.upper);
    near(Math.hypot(arms.near.hand.x - arms.near.elbow.x, arms.near.hand.y - arms.near.elbow.y), body.armLengths.near.fore);
    near(arms.near.hand.x, retracted.grip.x); near(arms.near.hand.y, retracted.grip.y);
    assert.equal(JSON.stringify({ body, retracted }), before, 'Fitting cannot mutate body, gun or projectile geometry.');
    assert.equal(resolvePlayerArmPoseV125(body, original).near.shoulderShiftDistance, 0, 'No protraction without the obstacle.');
    const impossible = translateHeldWeaponPoseV125(retracted, 0, 40);
    const limited = resolvePlayerArmPoseV125(body, impossible).near;
    assert.equal(limited.shiftLimited, true); assert.ok(limited.reachError > 30);
    assert.ok(limited.shoulderShiftDistance <= 5, 'An impossible grip remains visibly reported, never concealed by stretching.');
  }
});

test('body layering submits only modular images, one weapon callback, and the actual two hand endpoints', () => {
  const subject = actor({ aimingV124: true }), body = rig(subject);
  const pose = { visible: true, grip: body.neutralGrip,
    support: { x: body.shoulders.far.x + 20, y: body.shoulders.far.y + 8 } };
  const arms = resolvePlayerArmPoseV125(body, pose);
  assert.equal(arms.near.reachError, 0); assert.equal(arms.far.reachError, 0);
  assert.deepEqual(arms.near.hand, pose.grip); assert.deepEqual(arms.far.hand, pose.support);
  const draws = []; let depth = 0, weaponCount = 0;
  const ctx = { save() { depth++; }, restore() { depth--; assert.ok(depth >= 0); }, transform() {},
    drawImage(image, ...args) { draws.push({ image, args }); } };
  const render = drawPlayerBodyRigV125(ctx, { bodyRig: body, images, weaponPose: pose,
    drawWeapon() { weaponCount++; draws.push({ image: { src: 'selected-native-weapon' } }); } });
  assert.equal(render.drawn, true); assert.equal(weaponCount, 1); assert.equal(depth, 0);
  assert.equal(draws.length, 8); assert.equal(draws.filter(draw => draw.image.src === body.asset.path).length, 1);
  assert.ok(draws.every(draw => draw.image.src.includes('/rig-v125/') || draw.image.src === 'selected-native-weapon'));
  assert.equal(drawPlayerBodyRigV125(ctx, { bodyRig: body, images, weaponPose: pose }).drawn, false);
});
