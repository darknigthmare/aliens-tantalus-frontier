import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { getXenoTrialsFighterV96 as definition, getXenoTrialsArtV96 as art } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96 as create, getXenoTrialsSnapshotV96 as snapshot, setXenoTrialsPausedV96 as pause,
  stepXenoTrialsMatchV96 as step, XENO_TRIALS_STEP_V96 as dt } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 as body, XENO_TRIALS_ARENA_V105 } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_GROUND_BREAK_V213 as rules, XENO_TRIALS_GROUND_BREAK_START_V213 as START,
  XENO_TRIALS_GROUND_BREAK_FAIL_V213 as FAIL, getXenoTrialsGroundBreakViewV213 as view } from '../src/xeno-trials-grapple-v213.js';
import { getXenoTrialsGroundGripPoseV213 as pose } from '../src/xeno-trials-grapple-art-v213.js';
import { drawXenoTrialsRigV154, getXenoTrialsRigV154, sampleXenoTrialsSequenceAnglesV211 } from '../src/xeno-trials-rig-v154.js';
import { getXenoTrialsDisplayScaleV110 } from '../src/xeno-trials-scale-v110.js';
import { createXenoTrialsDuelCheckpointV197 as checkpoint } from '../src/xeno-trials-duel-checkpoint-v197.js';
import { beginXenoTrialsV96, createXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

const commando = 'import-game-dd-wy-commando';
const grab = { guard: true, heavy: true };
const guard = { guard: true };
const counter = { guard: true, light: true };
const release = match => match.events.findLast(event => event.type === 'grapple-end-v153');

function matchFor(config = {}) {
  const match = create({ playerId: 'warrior', opponentId: commando, introSeconds: 0, holdRoundTransition: true, ...config });
  const [left, right] = match.fighters;
  right.x += body(left).right + 4 - body(right).left;
  return match;
}

function ticks(match, count, player = {}, opponent = {}) {
  for (let i = 0; i < count; i++) step(match, dt, player, opponent);
}

function latch(match, side = 0, command = grab) {
  ticks(match, 1, side ? {} : command, side ? command : {});
  const fighter = match.fighters[side];
  while (fighter.attack && !match.grappleV153) ticks(match, 1);
  assert.ok(match.grappleV153);
}

test('the defender chooses one costly, committed break with a useful grounded recovery on both sides', () => {
  for (const side of [0, 1]) {
    const match = matchFor(side ? { playerId: commando, opponentId: 'warrior' } : {});
    latch(match, side);
    const from = match.fighters[side], to = match.fighters[1 - side], facing = from.facing;
    const hp = to.hp, stamina = to.stamina, fromX = from.x, toX = to.x;
    ticks(match, rules.minHeld, side ? guard : {}, side ? {} : guard);
    assert.deepEqual(view(match), { state: 'ready' });
    ticks(match, 1, side ? counter : {}, side ? {} : counter);
    const witness = match.events.at(-1);
    assert.equal(witness.type, START);
    assert.equal(witness.heldTicksV213, rules.minHeld);
    assert.equal(witness.staminaBeforeV213, stamina);
    assert.equal(to.stamina, stamina - rules.cost);
    assert.deepEqual(view(match), { state: 'committed', remainingTicks: rules.effortTicks });
    ticks(match, rules.effortTicks - 1, side ? guard : {}, side ? {} : guard);
    assert.ok(match.grappleV153);
    ticks(match, 1, side ? guard : {}, side ? {} : guard);
    assert.equal(match.grappleV153, undefined);
    assert.equal(release(match).reason, 'countered');
    assert.equal(release(match).breakStartV213, witness.id);
    assert.equal(to.stats.grappleEscapesV153, 1);
    assert.equal(to.hp, hp);
    assert.equal(to.x, toX);
    assert.equal(from.x, fromX - facing * rules.recoil);
    assert.equal(to.stun, rules.captiveRecovery);
    assert.equal(from.stun, rules.captorRecovery);
    assert.deepEqual(match.fighters.map(actor => actor.y), [0, 0]);
  }
});

test('early or held mashing does not bank an attempt, and failed effort still permits an ordinary escape', () => {
  const match = matchFor();
  latch(match);
  const target = match.fighters[1], stamina = target.stamina;
  ticks(match, rules.minHeld + 1, {}, counter);
  assert.equal(match.grappleV153.breakV213, undefined);
  assert.equal(target.stamina, stamina);
  ticks(match, 1, {}, guard);
  ticks(match, 1, {}, counter);
  assert.ok(match.grappleV153.breakV213);
  ticks(match, 1);
  assert.equal(match.events.at(-1).type, FAIL);
  assert.equal(view(match).state, 'failed');
  assert.equal(match.grappleV153.escapeProgress, 0);
  ticks(match, rules.minHeld, {}, guard);
  ticks(match, 1, {}, counter);
  assert.equal(match.events.filter(event => event.type === START).length, 1);
  assert.equal(target.stamina, stamina - rules.cost);
  ticks(match, 50, {}, guard);
  assert.equal(release(match).reason, 'escaped');
  assert.equal(target.stats.grappleEscapesV153, 1);
});

test('Prowler keeps the native passive escape and late or unaffordable presses cannot spend endurance', () => {
  const legacy = matchFor({ playerId: 'prowler' });
  latch(legacy, 0, { special: true });
  ticks(legacy, rules.minHeld, {}, guard);
  ticks(legacy, 1, {}, counter);
  assert.equal(legacy.grappleV153.breakV213, undefined);
  assert.equal(view(legacy), null);

  const late = matchFor();
  latch(late);
  ticks(late, rules.maxHeld + 1, {}, guard);
  ticks(late, 1, {}, counter);
  assert.equal(late.grappleV153.breakV213, undefined);

  const exhausted = matchFor();
  latch(exhausted);
  exhausted.fighters[1].stamina = rules.cost - 1;
  ticks(exhausted, rules.minHeld, {}, guard);
  ticks(exhausted, 1, {}, counter);
  assert.equal(exhausted.grappleV153.breakV213, undefined);
  assert.equal(exhausted.fighters[1].stamina, rules.cost - 1);
});

test('a legitimate pending effort resumes and refuses a missing witness, rewind or refunded spend', () => {
  const progress = createXenoTrialsProgressV96();
  progress.unlocked.push(commando);
  const ticket = beginXenoTrialsV96(progress, { playerId: commando, opponentId: 'warrior' }).config;
  const match = matchFor(ticket);
  latch(match, 1);
  // A real direct-input launch followed by the existing CPU ownership handoff.
  ticks(match, rules.minHeld, guard, null);
  const untouched = checkpoint(snapshot(match), ticket);
  assert.ok(untouched);
  assert.equal(untouched.snapshot.grappleV153.breakV213, undefined);
  ticks(match, 1, counter, null);
  ticks(match, 3, guard, null);
  const saved = checkpoint(snapshot(match), ticket);
  assert.ok(saved);
  for (const corrupt of [
    raw => { delete raw.grappleV153.breakV213; },
    raw => { raw.grappleV153.breakV213.heldTicks--; },
    raw => { raw.grappleV153.escapeProgress--; },
    raw => { raw.events = raw.events.filter(event => event.type !== START); },
    raw => { raw.fighters[0].stamina += rules.cost; },
  ]) {
    const malformed = structuredClone(saved.snapshot);
    corrupt(malformed);
    assert.equal(checkpoint(malformed, ticket), null);
  }
  const restored = JSON.parse(JSON.stringify(saved.snapshot));
  pause(restored, false);
  ticks(restored, 9, guard, null);
  ticks(match, 9, guard, null);
  assert.equal(release(match).reason, 'countered');
  assert.deepEqual(snapshot(restored), snapshot(match));
  assert.ok(checkpoint(snapshot(match), ticket));
});

test('authored pair contact draws both real plates, keeps both supports fixed and has bounded fallback', () => {
  const pairs = [['synth-sniper', 'synth-sniper'], ['synth-sniper', 'armored-joe'], ['armored-joe', 'synth-sniper'],
    ['armored-joe', 'armored-joe'], ['import-wy-apesuit', 'import-wy-apesuit']];
  const context = new Proxy({}, { get: () => () => {} });
  for (const [from, to] of pairs) {
    const match = matchFor({ playerId: from, opponentId: to });
    latch(match);
    const images = new Map();
    for (const id of [from, to]) {
      const source = art(id), rig = getXenoTrialsRigV154(definition(id), source);
      const bytes = readFileSync(new URL('..' + source.path, import.meta.url));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), rig.sourceSha256);
      images.set(rig.path, { complete: true, naturalWidth: rig.sourceWidth, naturalHeight: rig.sourceHeight });
    }
    const zoom = getXenoTrialsDisplayScaleV110(match.fighters);
    const approach = pose(match, images, zoom, false);
    assert.ok(approach);
    assert.equal(approach.contact, false);
    ticks(match, 12);
    const untouched = snapshot(match);
    const settled = pose(match, images, zoom, false);
    assert.ok(settled?.contact);
    assert.ok(settled.contactGap <= 4);
    for (const actor of settled.actors) {
      const { rig, metrics, fighter } = actor;
      const drawn = drawXenoTrialsRigV154(context, rig, actor.image, actor.pose, metrics,
        fighter.x, XENO_TRIALS_ARENA_V105.floor, fighter.facing);
      assert.equal(drawn.animation, 'measured-paired-grip-v213');
      assert.ok(drawn.contacts[actor.contactKey].every((value, i) => Math.abs(value - actor.contact[i]) < 1e-8));
      const resting = sampleXenoTrialsSequenceAnglesV211(rig, { clip: 'neutral', elapsed: 0, progress: 0 }, {});
      for (const key of ['footNear', 'footFar']) {
        const distance = Math.hypot(...actor.pose.contacts[key].map((value, i) => value - resting.contacts[key][i]));
        assert.ok(distance <= 2);
      }
    }
    assert.deepEqual(snapshot(match), untouched);
    assert.equal(pose(match, images, zoom, true), null);
    assert.equal(pose(match, new Map(), zoom, false), null);
    match.fighters[1].x += 8;
    assert.equal(pose(match, images, zoom, false), null);
  }
});
