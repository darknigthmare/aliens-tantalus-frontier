import assert from 'node:assert/strict';
import test from 'node:test';
import { XENO_TRIALS_CARGO_OPERATION_V213 as cargo } from '../src/xeno-trials-cargo-interlock-v213.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyBoundsV105 } from '../src/xeno-trials-geometry-v105.js';
import { XENO_TRIALS_TURN_TICKS_V210 } from '../src/xeno-trials-movement-v210.js';
import { createXenoTrialsPracticeV207, getXenoTrialsPracticeConfigV207,
  XENO_TRIALS_PRACTICE_DRILLS_V221, XENO_TRIALS_PRACTICE_DRILLS_V222 } from '../src/xeno-trials-practice-v207.js';
import { completeXenoTrialsPracticeV207, createXenoTrialsProgressV96,
  normalizeXenoTrialsProgressV96 } from '../src/xeno-trials-progress-v96.js';
import { getXenoTrialsStageHazardViewV188 } from '../src/xeno-trials-stage-hazards-v188.js';
import { XENO_TRIALS_SUPER_METER_V148 } from '../src/xeno-trials-supers-v148.js';

function start(id) {
  const match = createXenoTrialsMatchV96({ ...getXenoTrialsPracticeConfigV207(id), introSeconds: 0 });
  const coach = createXenoTrialsPracticeV207(id, match);
  const [player, opponent] = match.fighters;
  function step(input = {}) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, input, coach.opponentInput(input));
    coach.observe(input, true);
  }
  function until(condition, input = {}, limit = 1600) {
    for (let frame = 0; frame < limit && coach.active && !condition(); frame++) step(input);
    assert.ok(condition(), JSON.stringify(coach.view()));
  }
  return { match, coach, player, opponent, step, until };
}

const guard = { guard: true };
const use = { interact: true };
const westCircuit = match => getXenoTrialsStageHazardViewV188(match).cargoInterlockV213.circuits[0];

test('the Runner crosses the real Crusher body, which must complete a native pivot to block from the new side', () => {
  const { match, coach, player, opponent, until } = start('pivot-guard');
  until(() => coach.view().cue === 'RELÂCHEZ GARDE POUR PIVOTER', guard);
  assert.ok(opponent.y > 0 && opponent.x < player.x);
  assert.equal(player.facing, 1);
  assert.equal(player.guard, true);
  until(() => coach.view().cue === 'REPRENEZ GARDE DU NOUVEAU CÔTÉ');
  const pivot = match.events.find(event => event.type === 'turn-v210' && event.side === 'player');
  assert.equal(pivot.direction, -1);
  assert.equal(pivot.tick - pivot.startedTickV210, XENO_TRIALS_TURN_TICKS_V210);
  assert.equal(player.y, 0);
  assert.equal(player.facing, -1);
  until(() => coach.view().state === 'complete', guard);
  const swing = match.events.find(event => event.type === 'attack' && event.kind === 'heavy' && event.side === 'opponent');
  const block = match.events.find(event => event.type === 'block' && event.side === 'player');
  assert.ok(pivot.tick < swing.tick && swing.tick < block.tick);
  assert.equal(opponent.attack.facing, 1);
  assert.equal(player.facing, -1);
});

test('holding the original guard through the crossover really loses to a rear strike', () => {
  const { match, coach, player, until } = start('pivot-guard');
  const hp = player.hp;
  until(() => coach.view().state === 'retry', guard);
  assert.equal(coach.view().index, 1);
  assert.equal(player.facing, 1);
  assert.equal(player.previousInput.guard, true);
  assert.equal(match.events.some(event => event.type === 'turn-v210' && event.side === 'player'), false);
  assert.ok(match.events.some(event => event.type === 'hit' && event.side === 'player' && player.hp < hp));
});

test('the Warden spends a full meter, emits two distinct native volleys and loses both projectiles to held Guard', () => {
  const { match, coach, player, opponent, until } = start('barrage-guard');
  const hp = player.hp;
  assert.equal(opponent.superMeterV148, XENO_TRIALS_SUPER_METER_V148.maximum);
  until(() => coach.view().cue === 'GARDEZ CONTRE LE BARRAGE');
  assert.equal(opponent.superMeterV148, 0);
  const attacks = match.events.filter(event => event.kind === 'super' && event.side === 'opponent');
  assert.equal(attacks.length, 1);
  const shots = id => match.projectiles.find(shot => shot.superIdV148 === attacks[0].superIdV148 && shot.volleyV148 === id);
  until(() => Boolean(shots(0)), guard);
  const first = shots(0);
  until(() => coach.view().cue === 'MAINTENEZ GARDE POUR LA SECONDE SALVE', guard);
  assert.equal(match.projectiles.includes(first), false);
  until(() => Boolean(shots(1)), guard);
  const second = shots(1);
  assert.notEqual(second.id, first.id);
  assert.ok(first.groupIdV147 !== second.groupIdV147);
  until(() => coach.view().state === 'complete', guard);
  assert.equal(match.projectiles.includes(second), false);
  const blocks = match.events.filter(event => event.type === 'block' && event.side === 'player');
  assert.equal(blocks.length, 2);
  assert.equal(player.hp, hp - blocks.reduce((total, event) => total + event.damage, 0));
});

test('an unguarded volley lands, and dropping guard after only the first block fails the workshop', () => {
  const unguarded = start('barrage-guard');
  unguarded.until(() => unguarded.coach.view().state === 'retry');
  assert.equal(unguarded.coach.view().index, 1);
  assert.ok(unguarded.match.events.some(event => event.type === 'hit' && event.side === 'player'));

  const released = start('barrage-guard');
  released.until(() => released.coach.view().index === 2, guard);
  released.step();
  assert.equal(released.coach.view().state, 'retry');
  assert.equal(released.match.events.filter(event => event.type === 'block' && event.side === 'player').length, 1);
});

test('pickup arms the native west ramp, and the same crate disarms it only after a safe crossing and delivery', () => {
  const { match, coach, player, until } = start('cargo-interlock');
  assert.equal(westCircuit(match).armed, false);
  until(() => coach.view().index === 1, use);
  assert.equal(match.operationV188.carrying, 0);
  assert.equal(westCircuit(match).armed, true);
  assert.equal(match.events.find(event => event.type === 'operation-objective-v188').objectiveId, cargo.objectives[0].id);
  until(() => coach.view().index === 2);
  const live = getXenoTrialsStageHazardViewV188(match);
  assert.equal(live.phase, 'active');
  assert.equal(live.cargoInterlockV213.armed, 'A');
  assert.ok(getXenoTrialsBodyBoundsV105(player).right < live.zones[0].left);
  until(() => coach.view().cue === 'DÉCHARGE TERMINÉE · TRAVERSEZ');
  assert.equal(getXenoTrialsStageHazardViewV188(match).phase, 'idle');
  until(() => coach.view().index === 3, { right: true });
  assert.ok(getXenoTrialsBodyBoundsV105(player).left >= live.zones[0].right);
  assert.equal(westCircuit(match).armed, true);
  assert.equal(match.operationV188.carrying, 0);
  until(() => getXenoTrialsBodyBoundsV105(player).right > cargo.depot.x - cargo.depot.radius + 20, { right: true });
  until(() => coach.view().state === 'complete', use);
  assert.deepEqual(match.operationV188.delivered, [true, false, false]);
  assert.equal(match.operationV188.carrying, -1);
  assert.equal(getXenoTrialsStageHazardViewV188(match).cargoInterlockV213.armed, null);
  assert.equal(match.events.find(event => event.type === 'operation-delivery-v188').delivered, 1);
  assert.equal(match.stageHazardsV188.playerDamage, 0);
  assert.equal(match.result, null);
});

test('walking into the energized ramp damages the actual carrier and never validates delivery', () => {
  const { match, coach, player, until } = start('cargo-interlock');
  const hp = player.hp;
  until(() => coach.view().index === 1, use);
  until(() => coach.view().index === 2);
  until(() => coach.view().state === 'retry', { right: true });
  const arc = match.events.find(event => event.type === 'stage-hazard-contact-v188' && event.actorId === 'player');
  assert.equal(arc.kind, 'arc');
  assert.equal(match.stageHazardsV188.playerDamage, arc.damage);
  assert.equal(player.hp, hp - arc.damage);
  assert.equal(match.operationV188.carrying, 0);
  assert.equal(westCircuit(match).armed, true);
  assert.deepEqual(match.operationV188.delivered, [false, false, false]);
});

test('47 workshops preserve all 44 historical completions and grant practice marks only', () => {
  assert.equal(XENO_TRIALS_PRACTICE_DRILLS_V222.length, 47);
  assert.deepEqual(XENO_TRIALS_PRACTICE_DRILLS_V222.slice(0, 44), XENO_TRIALS_PRACTICE_DRILLS_V221);
  const historical = XENO_TRIALS_PRACTICE_DRILLS_V221.map(entry => entry.id);
  const additions = ['pivot-guard', 'barrage-guard', 'cargo-interlock'];
  const baseline = normalizeXenoTrialsProgressV96({ ...createXenoTrialsProgressV96(), practiceClearedV207: historical });
  let profile = baseline;
  for (const id of additions) {
    const completion = completeXenoTrialsPracticeV207(profile, id);
    assert.equal(completion.applied, true);
    profile = completion.state;
    assert.equal(completeXenoTrialsPracticeV207(profile, id).applied, false);
  }
  assert.deepEqual(normalizeXenoTrialsProgressV96(profile), { ...baseline, practiceClearedV207: [...historical, ...additions] });
});
