import test from 'node:test';
import assert from 'node:assert/strict';
import { HUMAN_GAIT_PROFILES_V133, humanGaitStrideV133 } from '../src/player-gait-v133.js';
import { advancePlayerLocomotionStateV129, resolvePlayerLocomotionRigV129 } from '../src/player-locomotion-rig-v129.js';
import { resolvePlayerBodyRigV125 } from '../src/player-body-rig-v125.js';
import { PLAYER_TRANSIT_PRESENTATION_V128 } from '../src/player-transit-rig-v128.js';
import { PLAYER_LOCOMOTION_PRESENTATION_V129 } from '../src/player-locomotion-rig-v129.js';
import { PLAYER_MODULAR_RIG_PARTS_V126, resolvePlayerModularRigV126 } from '../src/player-modular-rig-v126.js';
import { normalizePlayerAppearanceV126 } from '../src/player-appearance-v126.js';

const actor = patch => ({ x: 100, y: 200, w: 42, h: 92, alive: true, grounded: true,
  facing: 1, vx: 200, vy: 0, ...patch });
const close = (a, b, tolerance = 1e-6) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
function phaseRig(phase, gait, patch = {}) {
  const subject = actor({ vx: gait === 'run' ? 270 : 155, crouching: gait === 'crouch', ...patch });
  const stride = humanGaitStrideV133(subject, gait, .5);
  subject.x += phase * stride;
  const state = { schema: 129, gait, stride, cycles: phase, entrance: stride, hasWalked: true,
    moving: true, settle: 0, settleProgress: 0, source: 'observed-ground-displacement' };
  subject.playerLocomotionStateV129 = state;
  const bodyRig = resolvePlayerBodyRigV125({ actor: subject });
  return { subject, rig: resolvePlayerLocomotionRigV129({ actor: subject, bodyRig, locomotionState: state }), stride };
}

test('the actual rendered boot leaves and meets the deck with zero world velocity and acceleration', () => {
  const delta = 1e-5;
  for (const gait of ['walk', 'run', 'crouch']) for (const facing of [-1, 1])
    for (const side of ['near', 'far']) for (const boundary of [HUMAN_GAIT_PROFILES_V133[gait].duty, 1]) {
      const phase = boundary + (side === 'far' ? .5 : 0), samples = [-2, -1, 0, 1, 2]
        .map(offset => phaseRig(phase + offset * delta, gait, { facing }).rig.legs[side].sole);
      for (const axis of ['x', 'y']) {
        const velocity = (samples[3][axis] - samples[1][axis]) / (2 * delta);
        const acceleration = (samples[3][axis] - 2 * samples[2][axis] + samples[1][axis]) / delta ** 2;
        assert.ok(Math.abs(velocity) < .001, `${gait}/${facing}/${side}/${boundary}: ${axis} contact velocity ${velocity}`);
        assert.ok(Math.abs(acceleration) < 1.1, `${gait}/${facing}/${side}/${boundary}: ${axis} contact acceleration ${acceleration}`);
      }
    }
});

test('a free boot travels monotonically and avoids the full-cycle quintic velocity spike', () => {
  for (const gait of ['walk', 'run', 'crouch']) for (const side of ['near', 'far']) {
    const duty = HUMAN_GAIT_PROFILES_V133[gait].duty, offset = side === 'far' ? .5 : 0;
    let previous = phaseRig(duty + offset, gait), maximum = 0;
    for (let tick = 1; tick <= 400; tick++) {
      const current = phaseRig(duty + offset + tick / 400 * (1 - duty), gait);
      const travel = current.rig.legs[side].sole.x - previous.rig.legs[side].sole.x;
      assert.ok(travel >= -1e-8, `${gait}/${side}: the free boot cannot reverse its world trajectory.`);
      maximum = Math.max(maximum, travel / (current.stride / 400));
      const leg = current.rig.legs[side];
      assert.equal(leg.reachClamped, false); assert.equal(leg.clearanceAdjusted, false);
      assert.ok(leg.heel.y <= 292 + 1e-6 && leg.toe.y <= 292 + 1e-6);
      previous = current;
    }
    assert.ok(maximum > 1 && maximum < 1.17, `${gait}/${side}: peak swing speed ${maximum} times average.`);
  }
});

test('discrete upper-body atlas changes cannot snap either physical hip or change its lateral axis', () => {
  for (const gait of ['walk', 'run', 'crouch']) for (const facing of [-1, 1]) {
    for (const phase of [.25, .5, .75, 1]) {
      const before = phaseRig(phase - 1e-6, gait, { facing });
      const after = phaseRig(phase + 1e-6, gait, { facing });
      for (const side of ['near', 'far']) {
        const a = before.rig.legs[side].hip, b = after.rig.legs[side].hip;
        close(a.x - before.subject.x, b.x - after.subject.x);
        assert.ok(Math.abs(a.y - b.y) < .002, `${gait}/${facing}/${phase}: pelvis discontinuity ${Math.abs(a.y - b.y)}`);
      }
      close(after.rig.presentationV133.standingHeight, 96.5);
      assert.equal(after.rig.presentationV136.pelvis, 'continuous-physical-foot-axis');
    }
  }
});

test('physical acceleration, blocked movement and a stop retain exact contacts without a residual stride', () => {
  for (const facing of [-1, 1]) {
    let subject = actor({ vx: 0, facing }), state = advancePlayerLocomotionStateV129(null, subject, 0);
    let time = 0, traveled = 0, previous = null, contacts = 0;
    for (let frame = 1; frame <= 180; frame++) {
      const speed = frame < 40 ? frame * 5 : frame < 100 ? 200 : Math.max(0, 200 - (frame - 100) * 5);
      const dx = speed / 120 * facing;
      subject = { ...subject, x: subject.x + dx, vx: speed * facing }; time += 1 / 120;
      state = advancePlayerLocomotionStateV129(state, subject, time);
      subject.playerLocomotionStateV129 = state;
      const bodyRig = resolvePlayerBodyRigV125({ actor: subject, timeSeconds: time });
      const current = resolvePlayerLocomotionRigV129({ actor: subject, bodyRig, locomotionState: state });
      if (Math.abs(subject.vx)>1e-6 && Math.abs(dx)>1e-7) traveled += Math.abs(dx);
      for (const side of ['near', 'far']) {
        const contact = current.contacts.feet[side];
        if (contact.planted && previous?.contacts.feet[side].planted) {
          close(contact.point.x, previous.contacts.feet[side].point.x);
          close(contact.point.y, previous.contacts.feet[side].point.y); contacts++;
        }
      }
      previous = current;
    }
    close(state.distance, traveled); assert.ok(contacts > 150);
    const stopped = state, rig = previous;
    state = advancePlayerLocomotionStateV129(state, { ...subject, vx: facing * 200 }, time + .5);
    assert.equal(state.moving, false); close(state.cycles, stopped.cycles); close(state.distance, stopped.distance);
    assert.deepEqual(advancePlayerLocomotionStateV129(state, { ...subject, vx: facing * 200 }, time + .5), state);
    for (const contact of Object.values(rig.contacts.feet)) assert.equal(contact.planted, true);
  }
});

test('lean crosses the sprint threshold continuously and accepted-shot sampling matches the next physical observation', () => {
  for (const facing of [-1, 1]) {
    const angles = [235 - 1e-5, 235 + 1e-5].map(speed => {
      const subject = actor({ facing, vx: speed * facing, weaponRigMotionV125: { distance: 100 } });
      return resolvePlayerBodyRigV125({ actor: subject }).locomotionMotionV133.lean;
    });
    assert.ok(Math.abs(angles[0] - angles[1]) < 1e-8, 'Entering the run atlas cannot snap the shoulder angle.');
    let subject = actor({ facing, vx: 0 }), state = advancePlayerLocomotionStateV129(null, subject, 0), time = 0;
    for (const speed of [15, 45, 110, 170, 234, 236, 255, 270, 180, 70, 13]) {
      time += 1 / 120;
      subject = { ...subject, x: subject.x + speed * facing / 120, vx: speed * facing,
        playerLocomotionStateV129: state };
      const acceptedShotBody = resolvePlayerBodyRigV125({ actor: subject, timeSeconds: time });
      state = advancePlayerLocomotionStateV129(state, subject, time);
      subject.playerLocomotionStateV129 = state;
      const renderedBody = resolvePlayerBodyRigV125({ actor: subject, timeSeconds: time });
      assert.deepEqual(renderedBody.matrix, acceptedShotBody.matrix);
      assert.deepEqual(renderedBody.shoulders, acceptedShotBody.shoulders);
    }
  }
});

test('the calibrated skeleton has a stable pelvis at real walk and ship-run speeds, with a bounded running cadence', () => {
  for (const gait of ['walk', 'run']) {
    const hips = [];
    let flight = 0, clearance = 0;
    for (let tick = 0; tick < 500; tick++) {
      const { rig, subject, stride } = phaseRig(tick / 500, gait);
      hips.push(rig.legs.near.hip.y);
      if (rig.presentationV136.flight) {
        flight++;
        clearance = Math.max(clearance, Math.min(...Object.values(rig.contacts.feet).map(foot => foot.lift)));
      }
      for (const side of ['near', 'far']) {
        assert.equal(rig.legs[side].reachClamped, false);
        assert.equal(rig.legs[side].clearanceAdjusted, false);
      }
      const cadence = 2 * Math.abs(subject.vx) / stride;
      assert.ok(cadence >= 3 && cadence <= 4.3);
    }
    assert.ok(Math.max(...hips) - Math.min(...hips) < 3, `${gait}: hip variation must stay below three world pixels.`);
    if (gait === 'walk') assert.equal(flight, 0);
    else { assert.ok(flight > 100 && flight < 180); assert.ok(clearance > 2 && clearance <= 3); }
  }
  for (const dimension of ['upperLeg', 'lowerLeg']) {
    assert.equal(PLAYER_TRANSIT_PRESENTATION_V128[dimension], PLAYER_LOCOMOTION_PRESENTATION_V129[dimension],
      'Ladders, casualties and ordinary locomotion must use the same anatomical bone lengths.');
  }
});

test('accelerating through the complete walk/run blend cannot slide a foot declared planted', () => {
  for (const facing of [-1, 1]) {
    let subject = actor({ vx: 0, facing }), time = 0;
    let state = advancePlayerLocomotionStateV129(null, subject, time), previous = null, verified = 0;
    for (const target of [270, 155, 270, 0]) for (let frame = 0; frame < 100; frame++) {
      const prior = subject.vx, speed = prior + (target * facing - prior) * (1 - Math.exp(-15 / 120));
      subject = { ...subject, vx: speed, x: subject.x + (prior + speed) / 240 }; time += 1 / 120;
      state = advancePlayerLocomotionStateV129(state, subject, time); subject.playerLocomotionStateV129 = state;
      const bodyRig = resolvePlayerBodyRigV125({ actor: subject, timeSeconds: time });
      const current = resolvePlayerLocomotionRigV129({ actor: subject, bodyRig, locomotionState: state });
      for (const side of ['near', 'far']) {
        const leg = current.legs[side], contact = current.contacts.feet[side];
        assert.equal(leg.reachClamped, false); assert.equal(leg.clearanceAdjusted, false);
        assert.ok(contact.lift<=current.presentationV133.footLiftLimit+1e-6);
        assert.ok(leg.heel.y <= 292 + 1e-6 && leg.toe.y <= 292 + 1e-6);
        if (contact.planted && previous?.contacts.feet[side].planted) {
          close(contact.point.x, previous.contacts.feet[side].point.x); close(contact.point.y, previous.contacts.feet[side].point.y);
          verified++;
        }
      }
      previous = current;
    }
    assert.ok(verified > 150);
  }
});

test('ordinary travel uses a connected upright head and matching torso art while armed aim retains its authored pose', () => {
  const transform = (matrix, point) => ({ x: matrix.a*point.x+matrix.c*point.y+matrix.e,
    y: matrix.b*point.x+matrix.d*point.y+matrix.f });
  for (const gait of ['walk','run']) for (const facing of [-1,1]) for (const phase of [.1,.35,.6,.85]) {
    const {rig} = phaseRig(phase,gait,{facing});
    for (const appearance of [normalizePlayerAppearanceV126(), normalizePlayerAppearanceV126({schema:126,
      slots:{helmet:'helmet-patrol-v126',torso:'torso-utility-v126',arms:'arms-utility-v126',legs:'legs-utility-v126'}})]) {
      const modular = resolvePlayerModularRigV126({bodyRig:rig.bodyRig,appearance});
      const head = modular.layers.find(layer=>layer.id==='bare-head'), torso = modular.layers.find(layer=>layer.id==='torso');
      assert.equal(head.part,'bare-head-upright'); assert.equal(torso.part,'upright');
      const neck = transform(head.matrix,PLAYER_MODULAR_RIG_PARTS_V126.head.upright.neck);
      const target = transform(rig.bodyRig.matrix,rig.bodyRig.modularAnchorsV127.neck);
      close(neck.x,target.x); close(neck.y,target.y);
      const belt=transform(rig.bodyRig.matrix,rig.bodyRig.modularAnchorsV127.waist);
      assert.ok(Math.abs(neck.x-belt.x)<4,'Relaxed travel cannot inherit the twenty-degree combat neck pitch.');
    }
    const aimed=phaseRig(phase,gait,{facing,aimingV124:true}).rig;
    assert.equal(aimed.bodyRig.modularAnchorsV127,undefined);
    assert.equal(aimed.presentationV136.upperPosture,'authored-action');
  }
});
