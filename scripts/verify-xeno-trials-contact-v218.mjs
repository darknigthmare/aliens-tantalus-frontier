import assert from 'node:assert/strict';
import test from 'node:test';
import { setLanguageV185 } from '../src/i18n-v185.js';
import { createXenoTrialsMatchV96, getXenoTrialsSnapshotV96, setXenoTrialsPausedV96, stepXenoTrialsMatchV96,
  XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsGrappleViewV153, XENO_TRIALS_GROUND_RELEASE_V218 as release } from '../src/xeno-trials-grapple-v153.js';
import { XENO_TRIALS_GROUND_BREAK_V213 as counter } from '../src/xeno-trials-grapple-v213.js';
import { beginXenoTrialsV96, checkpointXenoTrialsDuelV197, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';

const receiverId = 'import-game-dd-wy-commando';
const grip = { guard: true, heavy: true };
const guard = { guard: true };
const end = match => match.events.findLast(event => event.type === 'grapple-end-v153');
const step = (match, player = {}, opponent = {}) => stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, player, opponent);

function localHold(side = 0, holderId = 'warrior', command = grip) {
  const match = createXenoTrialsMatchV96({ playerId: side ? receiverId : holderId,
    opponentId: side ? holderId : receiverId, introSeconds: 0 });
  const from = match.fighters[side], to = match.fighters[1 - side];
  const controls = (holder = {}, receiver = {}) => step(match, ...(side ? [receiver, holder] : [holder, receiver]));
  while (getXenoTrialsBodyGapV105(from, to, from.facing) > 5 && match.tick < 450)
    controls(from.facing === 1 ? { right: true } : { left: true });
  controls(command);
  while (!match.grappleV153 && match.tick < 500) controls(command);
  assert.ok(match.grappleV153);
  return { match, from, to, controls };
}

test('only the holder can release a grounded hold with a fresh chord on either side', () => {
  for (const side of [0, 1]) {
    const { match, from, to, controls } = localHold(side);
    const hold = match.grappleV153;
    controls();
    controls(grip); // An early edge cannot be banked until the release window.
    while (match.tick < hold.bornTick + release.minimumHeldTicks) controls(grip);
    assert.equal(match.grappleV153, hold);
    controls({}, grip); // The receiver's heavy chord cannot let the holder go.
    assert.equal(match.grappleV153, hold);
    const before = { fromX: from.x, toX: to.x, hp: to.hp, stamina: from.stamina, meter: from.superMeterV148,
      escapes: to.stats.grappleEscapesV153 };
    controls(grip);
    assert.equal(match.grappleV153, undefined);
    assert.equal(end(match).reason, 'released');
    assert.equal(end(match).heldTicksV218, match.tick - hold.bornTick);
    assert.equal(from.x, before.fromX - hold.facingV212 * release.separation);
    assert.equal(to.x, before.toX);
    assert.deepEqual([from.y, to.y, from.vy, to.vy], [0, 0, 0, 0]);
    assert.equal(from.stun, release.captorRecovery);
    assert.equal(to.stun, release.captiveRecovery);
    assert.equal(to.hp, before.hp);
    assert.equal(from.stamina, before.stamina);
    assert.equal(from.superMeterV148, before.meter);
    assert.equal(to.stats.grappleEscapesV153, before.escapes);
    assert.ok(from.rearmControls.heavy && from.rearmControls.guard);
    const lastEvent = end(match);
    for (let tick = 0; tick < 36; tick++) controls(grip);
    assert.equal(match.events.at(-1), lastEvent);
  }
});

test('a receiver counter takes precedence, and the Prowler special retains its original escape', () => {
  for (const side of [0, 1]) {
    const { match, controls } = localHold(side);
    for (let tick = 0; tick < counter.minHeld; tick++) controls({}, guard);
    controls(grip, { guard: true, light: true });
    assert.equal(getXenoTrialsGrappleViewV153(match).escapeV213.state, 'committed');
    for (let tick = 0; tick < counter.effortTicks; tick++) controls(grip, guard);
    assert.equal(end(match).reason, 'countered');
    assert.equal(end(match).heldTicksV218, undefined);
  }

  const legacy = localHold(0, 'prowler', { special: true });
  const hold = legacy.match.grappleV153;
  for (let tick = 0; tick < 18; tick++) legacy.controls();
  legacy.controls(grip);
  assert.equal(legacy.match.grappleV153, hold);
  while (legacy.match.grappleV153) legacy.controls({}, guard);
  assert.equal(end(legacy.match).reason, 'escaped');
});

test('native CPU duel preserves a pre-release checkpoint and accepts only a coherent release receipt', () => {
  const ticket = beginXenoTrialsV96(createXenoTrialsProgressV96(), { playerId: 'warrior', opponentId: receiverId, difficulty: 'easy' });
  assert.equal(ticket.applied, true);
  const match = createXenoTrialsMatchV96({ ...ticket.config, introSeconds: 0, holdRoundTransition: true });
  const [from, to] = match.fighters;
  while (!match.grappleV153 && match.tick < 1300) {
    const moving = getXenoTrialsBodyGapV105(from, to, from.facing) > 5 && !from.attack;
    step(match, moving ? (to.x > from.x ? { right: true } : { left: true }) : { guard: true, heavy: match.tick % 4 === 0 }, null);
  }
  assert.equal(match.grappleV153?.attacker, 'player');
  const hold = match.grappleV153;
  while (match.tick < hold.bornTick + release.minimumHeldTicks) step(match, grip, null);
  assert.equal(getXenoTrialsGrappleViewV153(match).label, 'RELÂCHER LA PRISE · GARDE + LOURDE');
  setLanguageV185('en', { document: null, persist: false });
  try { assert.equal(getXenoTrialsGrappleViewV153(match).label, 'RELEASE HOLD · GUARD + HEAVY'); }
  finally { setLanguageV185('fr', { document: null, persist: false }); }

  setXenoTrialsPausedV96(match, true);
  const paused = getXenoTrialsSnapshotV96(match);
  step(match, grip, null);
  assert.deepEqual(getXenoTrialsSnapshotV96(match), paused);
  const saved = checkpointXenoTrialsDuelV197(ticket.state, paused);
  assert.equal(saved.applied, true);
  const persisted = normalizeXenoTrialsProgressV96(structuredClone(saved.state));
  const restored = persisted.pending.duelCheckpointV197.snapshot;
  assert.deepEqual(restored.grappleV153, paused.grappleV153);
  for (const duel of [match, restored]) {
    setXenoTrialsPausedV96(duel, false);
    step(duel, grip, null);
    assert.equal(duel.grappleV153.id, hold.id);
    step(duel, {}, null);
    step(duel, grip, null);
  }
  const finished = getXenoTrialsSnapshotV96(restored);
  assert.equal(end(restored).reason, 'released');
  assert.deepEqual(finished, getXenoTrialsSnapshotV96(match));
  assert.equal(checkpointXenoTrialsDuelV197(persisted, finished).applied, true);
  for (const tamper of [event => event.heldTicksV218--, event => delete event.heldTicksV218,
    event => { event.type = 'grapple-start-v153'; }, event => { event.reason = 'escaped'; }]) {
    const forged = structuredClone(finished);
    tamper(end(forged));
    assert.equal(checkpointXenoTrialsDuelV197(persisted, forged).applied, false);
  }
});
