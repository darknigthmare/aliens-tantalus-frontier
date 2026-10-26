import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYER_BODY_RIG_ASSETS_V125, resolvePlayerBodyRigV125 } from '../src/player-body-rig-v125.js';
import { PLAYER_MODULAR_RIG_ASSETS_V126 } from '../src/player-modular-rig-v126.js';
import { PLAYER_TRANSIT_RIG_ASSETS_V128 } from '../src/player-transit-rig-v128.js';
import { PLAYER_COLONIAL_RIG_ASSETS_V129, PLAYER_COLONIAL_LEG_DEFINITIONS_V129 } from '../src/player-colonial-art-v129.js';
import { PLAYER_LOCOMOTION_PRESENTATION_V129, advancePlayerLocomotionStateV129,
  resolvePlayerLocomotionRigV129 } from '../src/player-locomotion-rig-v129.js';
import { advanceHumanPatrolAnimationV133 } from '../src/human-patrol-animation-v133.js';
import { resolveNpcMissionAnimationV55, NPC_MISSION_IDENTITIES_V56 } from '../src/npc-mission-runtime-v55.js';
import { resolveNpcAnimation, resolveSpriteClip, SpriteAnimationController } from '../src/sprite-animation-runtime.js';
import { withV52MissionRuntime, getAnimationEntityKeyV57 } from '../src/game-v52-runtime.js';

const assets = [...PLAYER_BODY_RIG_ASSETS_V125, ...PLAYER_MODULAR_RIG_ASSETS_V126,
  ...PLAYER_TRANSIT_RIG_ASSETS_V128, ...PLAYER_COLONIAL_RIG_ASSETS_V129];
const images = new Map(assets.map(a => [a.imageKey,
  { complete: true, naturalWidth: a.sourceWidth, naturalHeight: a.sourceHeight }]));
const actor = patch => ({ x: 400, y: 532, w: 44, h: 92, alive: true, grounded: true,
  facing: 1, vx: 0, vy: 0, costumeId: 'costume-001', ...patch });
const close = (a, b, why = '') => assert.ok(Math.abs(a - b) < 1e-6, `${why}: ${a} != ${b}`);
const length = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const other = side => side === 'near' ? 'far' : 'near';
function rig(subject, state, surface = 'mission') {
  const body = resolvePlayerBodyRigV125({ actor: subject, images, surface,
    timeSeconds: state.time, reducedMotion: true });
  return resolvePlayerLocomotionRigV129({ actor: subject, bodyRig: body, images,
    locomotionState: state, legDefinitions: PLAYER_COLONIAL_LEG_DEFINITIONS_V129 });
}
function walked(speed, facing, ticks, surface = 'mission') {
  let subject = actor({ vx: speed * facing, facing });
  let state = advancePlayerLocomotionStateV129(null, subject, 0, { surface });
  for (let tick = 1; tick <= ticks; tick++) {
    subject = { ...subject, x: subject.x + subject.vx / 120 };
    state = advancePlayerLocomotionStateV129(state, subject, tick / 120, { surface });
  }
  subject.playerLocomotionStateV129 = state;
  return { subject, state, rig: rig(subject, state, surface) };
}

test('a grounded profile turn exchanges depth legs and retains reached ankles without inventing travel', t => {
  let contacts = 0, maximumPelvisShift = 0;
  for (const surface of ['mission', 'hub', 'bioforge']) for (const facing of [-1, 1])
    for (const speed of [80, 155, 270]) for (const ticks of [31, 47, 63, 87, 113]) {
      const before = walked(speed, facing, ticks, surface);
      const subject = { ...before.subject, facing: -facing };
      const state = advancePlayerLocomotionStateV129(before.state, subject, before.state.time, { surface });
      const after = rig(subject, state, surface);
      close(state.distance, before.state.distance, 'Facing never grants displacement');
      close(state.cycles - before.state.cycles, .5, 'Depth labels exchange half a cycle');
      assert.equal(state.hasWalked, before.state.hasWalked);
      assert.equal(after.headingV165.contact, 'ankle-pivot-not-fixed-toe');
      assert.equal(after.headingV165.soleMidpointFixedDuringPivot, false);
      assert.equal(advancePlayerLocomotionStateV129(state, subject, state.time, { surface }), state);
      const shift = Math.abs(after.alignmentV142.hipAxis.y - before.rig.alignmentV142.hipAxis.y);
      maximumPelvisShift = Math.max(maximumPelvisShift, shift);
      assert.ok(shift < 3, `A turn cannot plunge the pelvis to hold a reflected toe: ${shift}`);
      for (const side of ['near', 'far']) {
        const leg = after.legs[side];
        close(length(leg.hip, leg.knee), 24, 'Femur remains rigid');
        close(length(leg.knee, leg.ankle), 23.5, 'Tibia remains rigid');
        assert.equal(leg.reachClamped, false); assert.equal(leg.clearanceAdjusted, false);
        assert.ok(leg.heel.y <= 624 + 1e-6 && leg.toe.y <= 624 + 1e-6);
        if (before.rig.contacts.feet[other(side)].planted && after.contacts.feet[side].planted) {
          close(leg.ankle.x, before.rig.legs[other(side)].ankle.x, 'Planted ankle x survives the pivot');
          close(leg.ankle.y, before.rig.legs[other(side)].ankle.y, 'Planted ankle y survives the pivot');
          assert.equal(after.contacts.feet[side].pivotingV165, true); contacts++;
        }
      }
    }
  assert.ok(contacts > 50); t.diagnostic(JSON.stringify({ plantedAnklePivots: contacts, maximumPelvisShift }));
});

test('the upper frame predicted before a turn observation matches its following rendered frame', () => {
  for (const facing of [-1, 1]) for (const speed of [80, 155, 270]) {
    const before = walked(speed, facing, 75), subject = { ...before.subject, facing: -facing };
    const pre = resolvePlayerBodyRigV125({ actor: subject, images, timeSeconds: before.state.time });
    subject.playerLocomotionStateV129 = advancePlayerLocomotionStateV129(before.state, subject, before.state.time);
    const post = resolvePlayerBodyRigV125({ actor: subject, images, timeSeconds: before.state.time });
    assert.deepEqual(post.matrix, pre.matrix); assert.deepEqual(post.shoulders, pre.shoulders);
  }
});

test('one observed stop can recover a free boot, preserves the other support and then becomes completely still', t => {
  let recoveries = 0, supportPairs = 0, maximumIdleSpread = 0;
  for (const facing of [-1, 1]) for (const speed of [80, 155, 270]) for (const ticks of [31, 47, 63, 87, 113]) {
    const before = walked(speed, facing, ticks);
    const subject = { ...before.subject, vx: 0 }; const original = JSON.stringify(subject);
    let state = before.state, previous = before.rig, adjusted = null;
    for (let frame = 1; frame <= 40; frame++) {
      state = advancePlayerLocomotionStateV129(state, subject, before.state.time + frame / 120);
      const current = rig(subject, state);
      if (state.stopRecoveryV165) { adjusted = state.stopRecoveryV165.side; recoveries++;
        assert.equal(current.contacts.feet[adjusted].planted, false);
        assert.ok(current.contacts.feet[adjusted].lift >= 0);
      }
      for (const side of ['near', 'far']) {
        const foot = current.contacts.feet[side], leg = current.legs[side];
        close(length(leg.hip, leg.knee), 24); close(length(leg.knee, leg.ankle), 23.5);
        assert.equal(leg.reachClamped, false); assert.equal(leg.clearanceAdjusted, false);
        assert.ok(leg.heel.y <= 624 + 1e-6 && leg.toe.y <= 624 + 1e-6);
        if (foot.planted && previous.contacts.feet[side].planted) {
          close(leg.sole.x, previous.legs[side].sole.x, 'A supported boot never skates');
          close(leg.sole.y, previous.legs[side].sole.y, 'A supported boot never sinks'); supportPairs++;
        }
      }
      close(state.distance, before.state.distance, 'Recovery cannot invent travelled distance');
      assert.equal(advancePlayerLocomotionStateV129(state, subject, state.time), state);
      previous = current;
    }
    assert.equal(state.stopRecoveryV165, null); assert.equal(previous.mode, 'idle');
    assert.ok(Object.values(previous.contacts.feet).every(f => f.planted));
    if (adjusted) assert.ok(Math.abs(state.stopOffsets[adjusted]) < 1e-6, 'The released boot returns beneath the physical body');
    const spread = Math.abs(previous.legs.near.ankle.x - previous.legs.far.ankle.x);
    maximumIdleSpread = Math.max(maximumIdleSpread, spread);
    assert.ok(spread < 30, 'A settled rest cannot retain the old full-stride split');
    const later = advancePlayerLocomotionStateV129(state, subject, state.time + 100);
    assert.deepEqual(rig(subject, later).legs, previous.legs, 'An idle clock cannot repeat the stop adjustment');
    assert.equal(JSON.stringify(subject), original);
  }
  assert.ok(recoveries > 100); assert.ok(supportPairs > 1000);
  t.diagnostic(JSON.stringify({ recoverySamples: recoveries, supportedConsecutivePairs: supportPairs, maximumIdleSpread,
    recoveryDuration: PLAYER_LOCOMOTION_PRESENTATION_V129.stopRecoveryDurationV165 }));
});

test('the recovered resting belt, shoulders and head keep the same physical support frame in both directions', () => {
  for (const facing of [-1, 1]) for (const speed of [80, 155, 270]) {
    const before = walked(speed, facing, 63), subject = { ...before.subject, vx: 0 };
    let state = advancePlayerLocomotionStateV129(before.state, subject, before.state.time + .01);
    state = advancePlayerLocomotionStateV129(state, subject, state.time + .25);
    const result = rig(subject, state), raw = result.bodyRig.baseBodyRigV160;
    const transfer = result.alignmentV160.weightTransfer;
    close(result.alignmentV142.belt.x, (result.legs.near.hip.x + result.legs.far.hip.x) / 2);
    assert.ok(result.alignmentV142.waistToHip >= 6 - 1e-6);
    close(result.presentationV133.standingHeight, 96.5);
    for (const side of ['near', 'far']) {
      close(result.bodyRig.shoulders[side].x - raw.shoulders[side].x, transfer.x);
      close(result.bodyRig.shoulders[side].y - raw.shoulders[side].y, transfer.y);
    }
    close(result.bodyRig.pivot.x, subject.x + subject.w / 2); close(result.bodyRig.pivot.y, 624);
  }
});

test('resuming travel during the one-foot adjustment retains real support and releases the recovery once', () => {
  let starts = 0, supportPairs = 0;
  for (const facing of [-1, 1]) for (const ticks of [31, 47, 63, 87]) for (const wait of [.04, .09]) {
    const before = walked(155, facing, ticks); let subject = { ...before.subject, vx: 0 };
    let state = advancePlayerLocomotionStateV129(before.state, subject, before.state.time + .01);
    if (!state.stopRecoveryV165) continue;
    state = advancePlayerLocomotionStateV129(state, subject, state.time + wait);
    let previous = rig(subject, state); const start = state.time, distance = state.distance;
    subject = { ...subject, vx: 155 * facing };
    for (let tick = 1; tick <= 60; tick++) {
      subject = { ...subject, x: subject.x + subject.vx / 120 };
      state = advancePlayerLocomotionStateV129(state, subject, start + tick / 120);
      const current = rig(subject, state); assert.equal(state.stopRecoveryV165, null);
      for (const side of ['near', 'far']) {
        const leg = current.legs[side];
        assert.equal(leg.reachClamped, false); assert.equal(leg.clearanceAdjusted, false);
        close(length(leg.hip, leg.knee), 24); close(length(leg.knee, leg.ankle), 23.5);
        if (current.contacts.feet[side].planted && previous.contacts.feet[side].planted) {
          close(leg.sole.x, previous.legs[side].sole.x); close(leg.sole.y, previous.legs[side].sole.y); supportPairs++;
        }
      }
      previous = current;
    }
    close(state.distance, distance + 155 / 2); starts++;
  }
  assert.ok(starts >= 8); assert.ok(supportPairs > 100);
});

test('movement intent without displacement cannot create patrol motion, cadence or markers', () => {
  const clip = resolveSpriteClip('npc.mara-vega.locomotion', 'walk');
  const subject = actor({ vx: 70 }); let state = advanceHumanPatrolAnimationV133(null, subject, clip, 0);
  for (let tick = 1; tick <= 120; tick++) state = advanceHumanPatrolAnimationV133(state, subject, clip, tick / 60);
  assert.equal(state.requestedMovingV165, true); assert.equal(state.moving, false);
  assert.equal(state.distance, 0); assert.equal(state.cycles, 0);
  assert.equal(state.stepsPerSecond, 0); assert.equal(state.suppressEvents, true);
});

test('different admitted walking clip cell counts preserve distance-owned phase and silence their transition sample', () => {
  const walk = { id: 'walk', loop: true, frames: [4, 5, 6, 7] };
  const run = { id: 'run', loop: true, frames: [0, 1, 2, 3, 4, 5, 6, 7] };
  const subject = actor({ vx: 70 }); let state = advanceHumanPatrolAnimationV133(null, subject, walk, 0, { context: 'explicit-test-clip-fixture' });
  for (let tick = 1; tick <= 90; tick++) { subject.x += 70 / 60;
    state = advanceHumanPatrolAnimationV133(state, subject, walk, tick / 60, { context: 'explicit-test-clip-fixture' }); }
  const previous = state; subject.x += 70 / 60;
  state = advanceHumanPatrolAnimationV133(previous, subject, run, 91 / 60, { context: 'explicit-test-clip-fixture' });
  close(state.distance, previous.distance + 70 / 60);
  assert.ok(state.cycles > previous.cycles); assert.equal(state.clipTransitionV165, true);
  assert.equal(state.suppressEvents, true); assert.equal(state.reseeded, false);
});

test('all sixteen moving alert allies select their own armed walk and retain real action priorities', () => {
  const identities = Object.values(NPC_MISSION_IDENTITIES_V56); assert.equal(identities.length, 16);
  for (const identity of identities) for (const alert of [{ combatReady: true }, { aiming: true }, { alert: true }, { alerted: true }, { alertClock: .5 }]) {
    const subject = { ...actor({ vx: 70 }), crewId: identity.crewId, ...alert };
    const selected = resolveNpcMissionAnimationV55(subject);
    assert.equal(selected.sheetId, identity.locomotionSheetId); assert.equal(selected.clipId, 'walk');
    const events = [], controller = new SpriteAnimationController({ onEvent: e => events.push(e) });
    controller.sample(identity.crewId, resolveNpcAnimation(subject), 0, { physicalActor: subject });
    const frames = new Set();
    for (let tick = 1; tick <= 120; tick++) { subject.x += 70 / 60;
      const sample = controller.sample(identity.crewId, resolveNpcAnimation(subject), tick / 60, { physicalActor: subject });
      frames.add(sample.frame); assert.ok(sample.humanPatrolV133?.moving); }
    assert.equal(frames.size, 4, identity.crewId + ' must really use all its authored walking cells');
    assert.ok(events.length > 0 && events.length < 12);
    for (const [patch, clip] of [[{ firing: true }, 'fire'], [{ supporting: true }, 'role-support'],
      [{ downed: true }, 'downed'], [{ crouching: true }, 'cover'], [{ grounded: false }, 'traversal'], [{ climbing: true }, 'climb']]) {
      assert.equal(resolveNpcMissionAnimationV55({ ...subject, ...patch }).clipId, clip);
    }
    assert.equal(resolveNpcMissionAnimationV55({ ...subject, vx: 0 }).clipId, 'ready');
  }
});

test('the real squad simulation and draw methods retain one room-owned walking phase', () => {
  const Runtime = withV52MissionRuntime(class {});
  const subject = { ...actor({ vx: 70 }), crewId: 'crew-02-tamsin-velez', combatReady: true,
    health: 100, maxHealth: 100 };
  const controller = new SpriteAnimationController(), frames = new Set(), seenContexts = new Set();
  const host = Object.assign(Object.create(Runtime.prototype), {
    player: actor({ operatorId: 'fixture-primary-player' }),
    coop: actor({ operatorId: 'fixture-secondary-player', coop: true }),
    coopEnabled: false, enemies: [], vehicle: { id: 'fixture-inactive-vehicle', active: false },
    activeSquadActors: () => [subject], animationTime: 0,
    missionLevelRuntime: { currentRoomId: 'explicit-room-test-fixture' },
    spriteAnimation: controller, squadTelemetry: { rendered: 0 },
    animationTelemetry: { samples: 0, activeClips: {}, approximatedEnemyVisuals: new Set(), fallbackFamilies: new Set() },
    drawSpriteSample(_ctx, sample) { frames.add(sample.frame); seenContexts.add(sample.humanPatrolV133?.context); return true; }
  });
  const ctx = { save() {}, restore() {}, fillRect() {} };
  host.updateSpriteAnimationEvents(); host.drawSquadActor(ctx, subject);
  const key = getAnimationEntityKeyV57('npc', subject, 'crew');
  for (let tick = 1; tick <= 120; tick++) {
    host.animationTime = tick / 60; subject.x += subject.vx / 60;
    host.updateSpriteAnimationEvents();
    const observed = controller.humanPatrolStatesV133.get(key);
    assert.ok(observed.moving); assert.ok(observed.distance > 0);
    host.drawSquadActor(ctx, subject);
    const drawn = controller.humanPatrolStatesV133.get(key);
    close(drawn.cycles, observed.cycles, 'A draw cannot reset the simulation-owned gait');
    close(drawn.distance, observed.distance); assert.equal(drawn.reseeded, false);
  }
  assert.equal(frames.size, 4); assert.equal(host.squadTelemetry.rendered, 121);
  assert.deepEqual([...seenContexts], ['explicit-room-test-fixture:npc.tamsin-velez.locomotion']);
});
