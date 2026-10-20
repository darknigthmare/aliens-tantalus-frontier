import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPONS } from '../src/content-core-v50.js';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125, resolvePlayerArmPoseV125 } from '../src/player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126, resolvePlayerModularRigV126, drawPlayerModularRigV126 } from '../src/player-modular-rig-v126.js';
import { normalizePlayerAppearanceV126 } from '../src/player-appearance-v126.js';
import { PLAYER_ACTION_PROP_ASSETS_V127, resolvePlayerActionRigV127 } from '../src/player-action-rig-v127.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128, PLAYER_LEG_PARTS_V128, resolvePlayerTransitRigV128,
  buildPlayerArticulatedLowerLayersV128 } from '../src/player-transit-rig-v128.js';
import { getHeldWeaponPoseV125 } from '../src/held-weapon-renderer-v125.js';
import { resolveHeldWeaponProfileV125 } from '../src/held-weapon-profiles-v125.js';
import { PLAYER_LOCOMOTION_PRESENTATION_V129, advancePlayerLocomotionStateV129,
  resolvePlayerLocomotionRigV129 } from '../src/player-locomotion-rig-v129.js';

const allAssets = [...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126,
  ...PLAYER_ACTION_PROP_ASSETS_V127, ...PLAYER_TRANSIT_RIG_ASSETS_V128];
const images = new Map(allAssets.map(asset => [asset.imageKey,
  { complete: true, naturalWidth: asset.sourceWidth, naturalHeight: asset.sourceHeight }]));
const styles = [normalizePlayerAppearanceV126(), normalizePlayerAppearanceV126({ schema: 126,
  slots: { helmet: 'helmet-patrol-v126', mask: 'mask-rebreather-v126', torso: 'torso-utility-v126',
    arms: 'arms-utility-v126', legs: 'legs-utility-v126', back: 'back-radio-v126' } })];
const actor = patch => ({ x: 100, y: 200, w: 42, h: 92, alive: true, grounded: true,
  facing: 1, vx: 0, vy: 0, costumeId: 'costume-001', ammo: 37, ammoReserve: 60, health: 75,
  armor: 22, shots: 3, ...patch });
const close = (a, b, label = '') => assert.ok(Math.abs(a - b) < 1e-6, `${label}: ${a} != ${b}`);
const samePoint = (a, b, label = '') => { close(a.x, b.x, `${label}.x`); close(a.y, b.y, `${label}.y`); };
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const transform = (m, p) => ({ x: m.a * p.x + m.c * p.y + m.e, y: m.b * p.x + m.d * p.y + m.f });
const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
function rig(subject, options = {}) {
  const bodyRig = options.bodyRig || resolvePlayerBodyRigV125({ actor: subject, images,
    surface: options.surface || 'mission', timeSeconds: options.timeSeconds || 1 });
  return resolvePlayerLocomotionRigV129({ actor: subject, bodyRig, images, appearance: styles[0], ...options });
}
function host() {
  const calls = [], stack = [], ctx = { save() { stack.push(1); }, restore() { assert.ok(stack.pop()); },
    transform(...m) { assert.ok(m.every(Number.isFinite)); }, drawImage(...args) { calls.push(args); },
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() {} };
  return { ctx, calls, stack };
}
function walk({ fps = 60, duration = 1, vx = 200, surface = 'mission', patch = {} } = {}) {
  let subject = actor({ vx, ...patch }), state = advancePlayerLocomotionStateV129(null, subject, 0, { surface });
  for (let n = 1; n <= fps * duration; n++) {
    subject = { ...subject, x: 100 + vx * n / fps };
    state = advancePlayerLocomotionStateV129(state, subject, n / fps, { surface });
  }
  return { subject, state, render: rig(subject, { surface, locomotionState: state }) };
}

test('real displacement yields the same gait at 30, 60 and 120 Hz', () => {
  for (const vx of [-300, -200, 200, 300]) for (const surface of ['mission', 'hub', 'bioforge']) {
    const results = [30, 60, 120].map(fps => walk({ fps, vx, surface }));
    for (const other of results.slice(1)) {
      close(other.state.distance, Math.abs(vx)); close(other.state.cycles, results[0].state.cycles);
      for (const side of ['near', 'far']) for (const key of ['hip', 'knee', 'ankle', 'sole']) {
        samePoint(other.render.legs[side][key], results[0].render.legs[side][key]);
      }
    }
  }
});

test('a paused observation is idempotent and stopped boots settle once without walking in place', () => {
  const moving = walk({ duration: .5 });
  const atPause = advancePlayerLocomotionStateV129(moving.state, moving.subject, .5);
  assert.equal(atPause, moving.state);
  assert.deepEqual(rig(moving.subject, { locomotionState: atPause }).legs, moving.render.legs);
  const stopped = { ...moving.subject, vx: 0 };
  const first = advancePlayerLocomotionStateV129(moving.state, stopped, .51);
  assert.equal(first.moving, false); close(first.distance, moving.state.distance);
  assert.equal(advancePlayerLocomotionStateV129(first, stopped, .51), first);
  const settled = advancePlayerLocomotionStateV129(first, stopped, .7);
  const settledRig = rig(stopped, { locomotionState: settled });
  assert.equal(settledRig.mode, 'idle');
  for (const foot of Object.values(settledRig.contacts.feet)) assert.equal(foot.planted, true);
  const after = advancePlayerLocomotionStateV129(settled, stopped, 200);
  assert.equal(after.cycles, settled.cycles); assert.equal(after.distance, settled.distance);
  assert.deepEqual(rig(stopped, { locomotionState: after }).contacts, settledRig.contacts);
  // A nonzero requested speed at a wall still cannot spend distance or run.
  const blocked = advancePlayerLocomotionStateV129(after, { ...stopped, vx: 200 }, 201);
  assert.equal(blocked.moving, false); assert.equal(blocked.cycles, after.cycles);
});

test('physical support carries a stationary operator without generating any stride', () => {
  const original = actor(), start = advancePlayerLocomotionStateV129(null, original, 0);
  const carried = { ...original, x: original.x + 27, y: original.y - 19 };
  const state = advancePlayerLocomotionStateV129(start, carried, .1);
  assert.equal(state.distance, 0); assert.equal(state.moving, false); assert.equal(state.hasWalked, false);
  const before = rig(original, { locomotionState: start }), after = rig(carried, { locomotionState: state });
  for (const side of ['near', 'far']) {
    close(after.legs[side].sole.x - before.legs[side].sole.x, 27);
    close(after.legs[side].sole.y - before.legs[side].sole.y, -19);
    assert.equal(after.contacts.feet[side].planted, true);
  }
});

test('finite collision segments revoke unsupported foot contacts without moving any geometry', () => {
  const subject = actor(), continuous = rig(subject);
  const near = continuous.legs.near.sole, far = continuous.legs.far.sole;
  const narrow = rig(subject, { groundSupport: [{ left: near.x - 1, right: near.x + 1, y: near.y }] });
  assert.equal(narrow.contacts.feet.near.planted, true);
  assert.equal(narrow.contacts.feet.near.supportConfirmed, true);
  assert.equal(narrow.contacts.feet.far.planted, false);
  assert.equal(narrow.contacts.feet.far.supportConfirmed, false);
  assert.deepEqual(narrow.legs, continuous.legs); assert.equal(narrow.phase, continuous.phase);
  const contiguous = rig(subject, { groundSupport: [
    { left: near.x - 1, right: (near.x + far.x) / 2, y: near.y },
    { left: (near.x + far.x) / 2, right: far.x + 1, y: far.y }
  ] });
  for (const contact of Object.values(contiguous.contacts.feet)) assert.equal(contact.planted, true);
  for (const groundSupport of [[], [{ left: near.x - 20, right: far.x + 20, y: near.y + 10 }],
    [{ left: NaN, right: Infinity, y: near.y }], [null]]) {
    const absent = rig(subject, { groundSupport });
    assert.deepEqual(absent.legs, continuous.legs);
    for (const contact of Object.values(absent.contacts.feet)) assert.equal(contact.planted, false);
  }
  assert.deepEqual(rig(subject, { groundSupport: null }).contacts, continuous.contacts);
});

test('a scene change, a teleport, a facing change or a reversed clock starts a neutral observation', () => {
  const { subject, state } = walk();
  for (const [next, now, options] of [[{ ...subject, x: subject.x + 400 }, 2, {}],
    [{ ...subject, facing: -1 }, 2, {}], [subject, 0, {}], [subject, 2, { context: 'another-room' }],
    [subject, 2, { surface: 'hub' }]]) {
    const reset = advancePlayerLocomotionStateV129(state, next, now, options);
    assert.equal(reset.distance, 0); assert.equal(reset.hasWalked, false); assert.equal(reset.moving, false);
  }
  for (const [subject, now, options] of [[actor({ x: NaN }), 0, {}], [actor({ h: 0 }), 0, {}],
    [actor(), NaN, {}], [actor(), -1, {}], [actor(), 0, { surface: 'inventory' }]]) {
    assert.equal(advancePlayerLocomotionStateV129(null, subject, now, options), null);
  }
});

test('every declared stance foot stays at the same world contact while the operator crosses it', () => {
  let plantedPairs = 0;
  for (const surface of ['mission', 'hub', 'bioforge']) for (const facing of [-1, 1])
    for (const crouching of [false, true]) for (const vx of [-200, 200, 300]) {
      let subject = actor({ vx, facing, crouching });
      let state = advancePlayerLocomotionStateV129(null, subject, 0, { surface });
      let previous = rig(subject, { surface, locomotionState: state });
      for (let n = 1; n <= 160; n++) {
        subject = { ...subject, x: 100 + Math.sign(vx) * n * .6,
          weaponRigMotionV125: { distance: n * .6 } };
        state = advancePlayerLocomotionStateV129(state, subject, n / 120, { surface });
        const current = rig(subject, { surface, locomotionState: state });
        for (const side of ['near', 'far']) {
          const contact = current.contacts.feet[side];
          if (contact.planted) close(contact.point.y, subject.y + subject.h);
          if (n > 1 && contact.planted && previous.contacts.feet[side].planted) {
            samePoint(contact.point, previous.contacts.feet[side].point, `${surface}/${facing}/${crouching}/${vx}/${n}/${side}`);
            plantedPairs++;
          }
        }
        previous = current;
      }
    }
  assert.ok(plantedPairs > 3500);
});

test('walk/run transitions preserve both current trajectories and settle corrections only during actual movement', () => {
  for (const surface of ['mission', 'hub', 'bioforge']) for (const facing of [-1, 1])
    for (const direction of [-1, 1]) for (const [from, to] of [[120, 270], [270, 120]]) {
      let subject = actor({ vx: direction * from, facing });
      let state = advancePlayerLocomotionStateV129(null, subject, 0, { surface });
      for (let tick = 1; tick <= 50; tick++) {
        subject = { ...subject, x: subject.x + direction * .6 };
        state = advancePlayerLocomotionStateV129(state, subject, tick / 120, { surface });
      }
      const continuedActor = { ...subject, x: subject.x + direction * .3 };
      const continued = advancePlayerLocomotionStateV129(state, continuedActor, .43, { surface });
      subject = { ...continuedActor, vx: direction * to };
      const changed = advancePlayerLocomotionStateV129(state, subject, .43, { surface });
      assert.notEqual(changed.gait, continued.gait);
      const expected = rig(subject, { surface, locomotionState: continued });
      let previous = rig(subject, { surface, locomotionState: changed });
      for (const side of ['near', 'far']) samePoint(previous.legs[side].sole, expected.legs[side].sole,
        `${surface}/${facing}/${direction}/${from}/${side}: switching speed cannot remap the current foot`);
      assert.equal(advancePlayerLocomotionStateV129(changed, subject, .43, { surface }), changed);
      assert.deepEqual(rig(subject, { surface, locomotionState: changed }).legs, previous.legs);
      state = changed;
      let planted = 0;
      const cycleTicks = Math.ceil(changed.stride / .6);
      // Observe two cycles with the shorter natural running stance, retaining
      // the same exact-contact sample threshold and the one-cycle deadline.
      for (let tick = 1; tick <= cycleTicks * 2 + 1; tick++) {
        subject = { ...subject, x: subject.x + direction * .6 };
        state = advancePlayerLocomotionStateV129(state, subject, .43 + tick / 120, { surface });
        const current = rig(subject, { surface, locomotionState: state });
        for (const side of ['near', 'far']) if (current.contacts.feet[side].planted && previous.contacts.feet[side].planted) {
          samePoint(current.legs[side].sole, previous.legs[side].sole,
            `${surface}/${facing}/${direction}/${from}/${tick}/${side}: a planted boot cannot slide`);
          planted++;
        }
        if (tick === cycleTicks) for (const entry of Object.values(state.gaitTransition.feet)) {
          assert.ok(entry.swingTravel >= entry.swingSpan, 'The first complete stride absorbs horizontal correction.');
          assert.ok(entry.travel >= state.stride * .25, 'Vertical correction ends within its first short travel window.');
        }
        previous = current;
      }
      assert.ok(planted > 100);
      for (const entry of Object.values(state.gaitTransition.feet)) {
        assert.ok(entry.swingTravel >= entry.swingSpan, 'A complete stride absorbs the horizontal correction.');
        assert.ok(entry.travel >= state.stride * .25, 'The free foot completes its short vertical transition.');
      }
    }
});

test('changing speed at a stopped swing boundary cannot slide the landed boot when movement resumes', () => {
  for (const direction of [-1, 1]) for (const ticks of [18, 19, 78]) {
    let subject = actor({ vx: direction * 300 });
    let state = advancePlayerLocomotionStateV129(null, subject, 0);
    for (let tick = 1; tick <= ticks; tick++) {
      subject = { ...subject, x: subject.x + direction * .6 };
      state = advancePlayerLocomotionStateV129(state, subject, tick / 120);
    }
    const expected = rig(subject, { locomotionState: advancePlayerLocomotionStateV129(state, subject, 2) });
    subject = { ...subject, vx: direction * 200 };
    state = advancePlayerLocomotionStateV129(state, subject, 2);
    const stopped = rig(subject, { locomotionState: state });
    for (const side of ['near', 'far']) samePoint(stopped.legs[side].sole, expected.legs[side].sole);
    subject = { ...subject, x: subject.x + direction * .6 };
    state = advancePlayerLocomotionStateV129(state, subject, 2 + 1 / 120);
    const resumed = rig(subject, { locomotionState: state });
    for (const side of ['near', 'far']) if (stopped.contacts.feet[side].planted && resumed.contacts.feet[side].planted) {
      samePoint(resumed.legs[side].sole, stopped.legs[side].sole);
    }
    const crouching = advancePlayerLocomotionStateV129(state, { ...subject, crouching: true }, 2.02);
    assert.equal(crouching.gaitTransition, null, 'Changing posture discards the unrelated stride transition.');
  }
});

test('all ground phases retain constant anatomical lengths and clear the floor in every surface', () => {
  for (const surface of ['mission', 'hub', 'bioforge']) for (const facing of [-1, 1])
    for (const crouching of [false, true]) for (const vx of [-300, -200, 0, 200, 300]) for (let d = 0; d < 100; d += 3.1) {
      const subject = actor({ facing, crouching, vx, weaponRigMotionV125: { distance: d } });
      const result = rig(subject, { surface }); assert.equal(result.eligible, true);
      const scale = result.bodyRig.scale;
      for (const [side, leg] of Object.entries(result.legs)) {
        close(distance(leg.hip, leg.knee), PLAYER_LOCOMOTION_PRESENTATION_V129.upperLeg * scale);
        close(distance(leg.knee, leg.ankle), PLAYER_LOCOMOTION_PRESENTATION_V129.lowerLeg * scale);
        assert.ok(leg.knee.y <= subject.y + subject.h - 6 * scale + 1e-6);
        assert.ok(leg.sole.y <= subject.y + subject.h + 1e-6);
        assert.equal(leg.reachClamped, false); assert.equal(leg.clearanceAdjusted, false);
        samePoint(result.contacts.feet[side].point, leg.sole);
      }
    }
});

test('airborne legs tuck and extend with physical vertical velocity and never invent support', () => {
  for (const surface of ['mission', 'hub', 'bioforge']) for (const facing of [-1, 1]) {
    const rising = rig(actor({ grounded: false, facing, vy: -220 }), { surface });
    const falling = rig(actor({ grounded: false, facing, vy: 240 }), { surface });
    for (const result of [rising, falling]) {
      assert.equal(result.mode, 'airborne'); assert.equal(result.contacts.floorY, null);
      for (const side of ['near', 'far']) {
        const leg = result.legs[side]; assert.equal(result.contacts.feet[side].planted, false);
        close(distance(leg.hip, leg.knee), leg.upper); close(distance(leg.knee, leg.ankle), leg.lower);
        assert.ok(leg.sole.y < 292); assert.equal(leg.reachClamped, false);
      }
    }
    assert.ok(rising.legs.near.sole.y < falling.legs.near.sole.y);
  }
  assert.equal(rig(actor({ grounded: undefined })).contacts.floorY, null);
});

test('support weight moves the complete accepted weapon and body together without changing collision, lengths or source pixels', () => {
  for (const descriptor of WEAPONS.filter(item => resolveHeldWeaponProfileV125(item)?.portable))
    for (const patch of [{}, { aimingV124: true }, { crouching: true, aimingV124: true },
      { crouching: true, coverV124: { peeking: true, peekRise: 20 } },
      { vx: 200, weaponRigMotionV125: { distance: 25 } }, { grounded: false, vy: -140 },
      { reloading: true, tacticalReload: { phase: 'reloading', elapsed: .5, completeAt: 2 } }]) {
      const subject = freeze(actor(patch)), original = JSON.stringify(subject);
      const base = resolvePlayerBodyRigV125({ actor: subject, images, timeSeconds: 1 });
      const decorated = rig(subject, { bodyRig: base }); assert.equal(decorated.eligible, true);
      for (const key of Object.keys(base).filter(key=>!['matrix','shoulders','sprite','neutralGrip','pouch'].includes(key)))
        assert.equal(decorated.bodyRig[key], base[key], `Original ${key} retained by reference/value.`);
      const transfer=decorated.alignmentV160.weightTransfer;
      for(const side of ['near','far'])samePoint(decorated.bodyRig.shoulders[side],{
        x:base.shoulders[side].x+transfer.x,y:base.shoulders[side].y+transfer.y},'One real shoulder frame');
      const options = { actor: subject, descriptor, aim: { x: 1, y: -.15 }, timeSeconds: 1 };
      const nativePose = getHeldWeaponPoseV125({ ...options, bodyRig: base });
      const segmentedPose = getHeldWeaponPoseV125({ ...options, bodyRig: decorated.bodyRig });
      assert.equal(Boolean(segmentedPose),Boolean(nativePose));
      if(nativePose){
        for(const key of ['a','b','c','d'])close(segmentedPose.matrix[key],nativePose.matrix[key],'Rigid weapon source affine');
        for(const key of ['grip','support','muzzle','reloadPort','ejectionPort'])if(nativePose[key])samePoint(segmentedPose[key],{
          x:nativePose[key].x+transfer.x,y:nativePose[key].y+transfer.y},'Every real weapon port follows the body');
        const beforeArms=resolvePlayerArmPoseV125(base,nativePose),afterArms=resolvePlayerArmPoseV125(decorated.bodyRig,segmentedPose);
        for(const side of ['near','far'])for(const key of ['shoulder','elbow','hand'])samePoint(afterArms[side][key],{
          x:beforeArms[side][key].x+transfer.x,y:beforeArms[side][key].y+transfer.y},'The actual arm follows the same body frame');
      }
      assert.equal(JSON.stringify(subject), original);
    }
});

test('working, hurt, tool and melee bodies get the same seven parts without changing their action', () => {
  const patches = [{ fieldActionV124: { kind: 'medical', phase: 'working', duration: 2, elapsed: .8 } },
    { placeableActionV124: { kind: 'deploy', duration: 2.5, elapsed: 1 } },
    { toolUseClock: .4, toolId: 'motion-tracker' }, { interactionClock: .4, interactionKind: 'force-interact' },
    { v52HurtClock: .2 }, { meleeClock: .2, meleeKind: 'knife-attack' },
    { meleeClock: .2, meleeKind: 'rifle-bash', grounded: false, vy: -130 }];
  for (const patch of patches) {
    const subject = freeze(actor(patch)), before = JSON.stringify(subject);
    const action = resolvePlayerActionRigV127({ actor: subject, images, timeSeconds: 1, weaponDescriptor: WEAPONS[0] });
    assert.equal(action.eligible, true);
    const result = rig(subject, { bodyRig: action.bodyRig }); assert.equal(result.ready, true);
    assert.equal(result.bodyRig.actionV127, action.bodyRig.actionV127);
    assert.deepEqual(resolvePlayerArmPoseV125(result.bodyRig, action.handPose), action.arms);
    const draw = host(), rendered = drawPlayerModularRigV126(draw.ctx, { bodyRig: result.bodyRig,
      appearance: styles[0], images, handPose: action.handPose });
    assert.equal(rendered.drawn, true); assert.equal(rendered.layers.filter(layer => layer.slot === 'legs').length, 7);
    assert.equal(JSON.stringify(subject), before); assert.equal(draw.stack.length, 0);
  }
});

test('each selected outfit uses seven actual independent sources with coincident measured joints', () => {
  for (const appearance of styles) for (const facing of [-1, 1]) for (const patch of [{}, { crouching: true },
    { vx: 300, weaponRigMotionV125: { distance: 37 } }, { grounded: false, vy: -150 }]) {
    const result = rig(actor({ facing, ...patch }), { appearance }), itemId = appearance.slots.legs;
    const modular = resolvePlayerModularRigV126({ bodyRig: result.bodyRig, appearance, images });
    const layers = modular.layers.filter(layer => layer.slot === 'legs'); assert.equal(layers.length, 7);
    assert.equal(new Set(layers.map(layer => layer.id)).size, 7);
    for (const side of ['near', 'far']) {
      const leg = result.legs[side], parts = PLAYER_LEG_PARTS_V128[itemId][side];
      for (const [name, partName, from, to] of [['thigh', 'upper', leg.hip, leg.knee],
        ['shin', 'lower', leg.knee, leg.ankle], ['boot', 'boot', leg.ankle, leg.sole]]) {
        const layer = layers.find(entry => entry.id === `${side}-${name}`), part = parts[partName];
        assert.equal(layer.sourceSeparation, 'independent-articulated-leg-part');
        samePoint(transform(layer.matrix, part.proximal), from); samePoint(transform(layer.matrix, part.distal), to);
      }
    }
  }
});

test('an injected outfit uses its own measured atlas in both ordinary and transit rigs', () => {
  const original = PLAYER_TRANSIT_RIG_ASSETS_V128[0];
  const asset = { ...original, id: 'test-separated-trousers', imageKey: 'measuredOutfit', path: '/test-measured.png' };
  const legDefinitions = { 'legs-marine-v126': { asset, parts: PLAYER_LEG_PARTS_V128['legs-marine-v126'] } };
  const selectedImages = new Map(images); selectedImages.delete(original.imageKey);
  selectedImages.set(asset.imageKey, { complete: true, naturalWidth: asset.sourceWidth, naturalHeight: asset.sourceHeight });
  for (const result of [rig(actor(), { images: selectedImages, legDefinitions }),
    resolvePlayerTransitRigV128({ actor: actor({ alive: false, downed: true, bleedOut: 20 }),
      images: selectedImages, legDefinitions })]) {
    assert.equal(result.ready, true);
    assert.ok(result.requiredAssets.some(entry => entry.imageKey === asset.imageKey));
    assert.ok(!result.requiredAssets.some(entry => entry.imageKey === original.imageKey));
    assert.ok(result.bodyRig.modularLowerLayersV128['legs-marine-v126'].every(entry => entry.imageKey === asset.imageKey));
  }
});

test('missing, wrong-size or incomplete art cannot draw a partial articulated operator', () => {
  for (const missing of [null, { complete: false, naturalWidth: 1254, naturalHeight: 1254 },
    { complete: true, naturalWidth: 1024, naturalHeight: 1024 }]) {
    const unavailable = new Map(images); unavailable.set(PLAYER_TRANSIT_RIG_ASSETS_V128[0].imageKey, missing);
    const result = rig(actor(), { images: unavailable }); assert.equal(result.eligible, true); assert.equal(result.ready, false);
    const draw = host(), rendered = drawPlayerModularRigV126(draw.ctx, { bodyRig: result.bodyRig, images: unavailable });
    assert.equal(rendered.drawn, false); assert.equal(draw.calls.length, 0); assert.equal(draw.stack.length, 0);
  }
  const result = rig(actor(), { legDefinitions: { 'legs-marine-v126': { asset: PLAYER_TRANSIT_RIG_ASSETS_V128[0], parts: {} } } });
  assert.equal(result.eligible, false); assert.equal(result.reason, 'modular-lower-body-unavailable');
  const valid = rig(actor());
  const invalid = buildPlayerArticulatedLowerLayersV128({ waist: { x: 0, y: 0 },
    hips: { near: valid.legs.near.hip, far: valid.legs.far.hip }, legs: valid.legs, scale: 1, facing: 1,
    legDefinitions: { bad: null } });
  assert.equal(invalid.bad, undefined);
});

test('native identities and the existing ladder, casualty and revival rigs retain their boundary', () => {
  for (const patch of [{ alive: false }, { downed: true }, { climbing: true }, { ventTransit: {} },
    { inVehicle: true }, { vehicleAccessPhase: 'boarding' }, { squadMember: true },
    { spriteId: 'npc.synthetic.idle' }, { neuroActive: true }, { costumeId: 'franchise-nostromo-crew' },
    { userEquipmentV95: { armorId: 'custom' } }, { x: NaN }, { w: 0 }]) {
    const result = rig(actor(patch)); assert.equal(result.eligible, false); assert.deepEqual(result.requiredAssets, []);
  }
  const subject = actor({ climbing: true, grounded: false, ladderId: 'test', vy: -100 });
  const transit = resolvePlayerTransitRigV128({ actor: subject, images, ladder: { id: 'test', x: 121, top: 0, bottom: 600, w: 42 } });
  const attempted = rig(subject, { bodyRig: transit.bodyRig }); assert.equal(attempted.eligible, false);
  assert.equal(attempted.bodyRig, transit.bodyRig);
});
